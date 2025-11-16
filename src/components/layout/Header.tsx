'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { SearchBar } from './SearchBar'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">Henlo</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden flex-1 max-w-2xl mx-8 md:block">
            <SearchBar />
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {loading ? (
              <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
            ) : user ? (
              <>
                <Link href="/listings/new">
                  <Button size="sm">Plaats advertentie</Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="sm">Berichten</Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="ghost" size="sm">Favorieten</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Inloggen</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Registreren</Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <SearchBar />
        </div>
      </div>
    </header>
  )
}
