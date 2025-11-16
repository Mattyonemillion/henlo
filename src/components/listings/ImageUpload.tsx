'use client'

import { useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onImagesChange: (files: File[]) => void
  maxImages?: number
  maxSizeMB?: number
  existingImages?: string[]
}

export default function ImageUpload({
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 5,
  existingImages = [],
}: ImageUploadProps) {
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>(existingImages)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Alleen afbeeldingen zijn toegestaan')
      return false
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      setError(`Afbeelding is te groot. Maximaal ${maxSizeMB}MB`)
      return false
    }

    return true
  }

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return

      setError('')
      const newFiles: File[] = []
      const newPreviews: string[] = []

      // Check if adding these files would exceed max images
      if (images.length + files.length > maxImages) {
        setError(`Maximaal ${maxImages} afbeeldingen toegestaan`)
        return
      }

      Array.from(files).forEach((file) => {
        if (validateFile(file)) {
          newFiles.push(file)
          // Create preview URL
          const reader = new FileReader()
          reader.onloadend = () => {
            newPreviews.push(reader.result as string)
            if (newPreviews.length === files.length) {
              setPreviews((prev) => [...prev, ...newPreviews])
            }
          }
          reader.readAsDataURL(file)
        }
      })

      if (newFiles.length > 0) {
        const updatedImages = [...images, ...newFiles]
        setImages(updatedImages)
        onImagesChange(updatedImages)
      }
    },
    [images, maxImages, maxSizeMB, onImagesChange]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setImages(newImages)
    setPreviews(newPreviews)
    onImagesChange(newImages)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="flex flex-col items-center space-y-2">
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Sleep afbeeldingen hierheen of klik om te uploaden
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maximaal {maxImages} afbeeldingen, {maxSizeMB}MB per afbeelding
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group"
            >
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                  Hoofdfoto
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Text */}
      {previews.length > 0 && (
        <p className="text-xs text-gray-500">
          {previews.length} van {maxImages} afbeeldingen geselecteerd. De eerste
          afbeelding wordt gebruikt als hoofdfoto.
        </p>
      )}
    </div>
  )
}
