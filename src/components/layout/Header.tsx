'use client'

import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { SearchBar } from './SearchBar'
import { Button } from '@/components/ui/button'
import { Menu, X, Plus, MessageSquare, Heart, LayoutDashboard } from 'lucide-react'

function SearchBarFallback() {
  return (
    <div className="flex w-full gap-2">
      <div className="flex-1 h-10 bg-gray-100 rounded-md animate-pulse" />
      <div className="h-10 w-20 bg-gray-100 rounded-md animate-pulse" />
    </div>
  )
}

export function Header() {
  const { user, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <span className="text-xl sm:text-2xl font-bold text-primary-600">Henlo</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 max-w-2xl mx-6 xl:mx-8">
            <Suspense fallback={<SearchBarFallback />}>
              <SearchBar />
            </Suspense>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            {loading ? (
              <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
            ) : user ? (
              <>
                <Link href="/dashboard/advertenties/nieuw" className="hidden lg:block">
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="hidden xl:inline">Plaats advertentie</span>
                    <span className="xl:hidden">Nieuw</span>
                  </Button>
                </Link>
                <Link href="/dashboard/berichten" className="hidden lg:block">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Berichten</span>
                  </Button>
                </Link>
                <Link href="/dashboard/favorieten" className="hidden lg:block">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Heart className="h-4 w-4" />
                    <span>Favorieten</span>
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden lg:inline">Dashboard</span>
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Inloggen
                  </Button>
                </Link>
                <Link href="/registreren">
                  <Button size="sm">
                    Registreren
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 lg:hidden">
          <Suspense fallback={<SearchBarFallback />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-3 space-y-2">
            {loading ? (
              <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            ) : user ? (
              <>
                <Link
                  href="/dashboard/advertenties/nieuw"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button size="sm" className="w-full justify-start gap-2">
                    <Plus className="h-4 w-4" />
                    Plaats advertentie
                  </Button>
                </Link>
                <Link
                  href="/dashboard/berichten"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Berichten
                  </Button>
                </Link>
                <Link
                  href="/dashboard/favorieten"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <Heart className="h-4 w-4" />
                    Favorieten
                  </Button>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button variant="ghost" size="sm" className="w-full">
                    Inloggen
                  </Button>
                </Link>
                <Link
                  href="/registreren"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block"
                >
                  <Button size="sm" className="w-full">
                    Registreren
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
