'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  MessageSquare,
  Heart,
  User,
  Settings
} from 'lucide-react'

// Note: Metadata cannot be exported from client components
// This layout is client-side only for navigation

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Advertenties', href: '/dashboard/advertenties', icon: Package },
  { name: 'Berichten', href: '/dashboard/berichten', icon: MessageSquare },
  { name: 'Favorieten', href: '/dashboard/favorieten', icon: Heart },
  { name: 'Profiel', href: '/dashboard/profiel', icon: User },
  { name: 'Instellingen', href: '/dashboard/instellingen', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary-600">Dashboard</h2>
          </div>
          <nav className="px-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
