'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireAuth = true,
  fallback,
}: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)

      if (requireAuth && !user) {
        // Store the current path to redirect back after login
        const currentPath = window.location.pathname
        const redirectPath = currentPath !== '/'
          ? `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
          : redirectTo
        router.push(redirectPath)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session?.user)

        if (requireAuth && !session?.user) {
          router.push(redirectTo)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [requireAuth, redirectTo, router, supabase])

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Authenticatie controleren...</p>
          </div>
        </div>
      )
    )
  }

  // If authentication is required and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // Render children if authenticated or if authentication is not required
  return <>{children}</>
}
