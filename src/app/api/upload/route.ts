import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Image Upload API Route
 *
 * Handles image uploads for listing photos. This endpoint validates file type
 * and size, then uploads to Supabase Storage and returns the public URL.
 *
 * Validation Rules:
 * - File types: JPEG, PNG, WebP only
 * - Maximum file size: 5MB
 * - User must be authenticated
 *
 * File Naming Convention:
 * - Files are organized by user ID: {userId}/{timestamp}-{random}.{ext}
 * - This prevents filename collisions and allows easy cleanup per user
 *
 * Storage:
 * - Files are stored in the 'listings' bucket in Supabase Storage
 * - Bucket is publicly readable but requires authentication to upload
 * - Uploaded files are served via Supabase CDN
 *
 * @param request - FormData containing the file to upload
 * @returns JSON with url (public URL) and path (storage path) or error
 */
export async function POST(request: NextRequest) {
  // Create authenticated Supabase client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Require authentication to prevent anonymous uploads
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Extract file from multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type - only allow common image formats
    // This prevents users from uploading executables or other malicious files
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      )
    }

    // Validate file size to prevent storage abuse and slow uploads
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename to prevent collisions
    // Format: {userId}/{timestamp}-{randomString}.{extension}
    // This allows easy querying and cleanup of user files
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Convert File object to Buffer for Supabase upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage 'listings' bucket
    // upsert: false prevents accidental overwrites
    const { data, error } = await supabase.storage
      .from('listings')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false, // Don't overwrite existing files
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Generate public URL for the uploaded file
    // This URL can be stored in the database and used to display the image
    const { data: { publicUrl } } = supabase.storage
      .from('listings')
      .getPublicUrl(data.path)

    // Return both the public URL and storage path
    // url: For displaying the image
    // path: For deleting the file later if needed
    return NextResponse.json({
      url: publicUrl,
      path: data.path,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
