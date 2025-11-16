'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, Heart, MessageSquare, Eye, Plus } from 'lucide-react'

interface DashboardStats {
  activeListings: number
  totalViews: number
  favorites: number
  messages: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeListings: 0,
    totalViews: 0,
    favorites: 0,
    messages: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get active listings count
      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')

      // Get total views (sum of view_count from all user's listings)
      const { data: listings } = await supabase
        .from('listings')
        .select('view_count')
        .eq('user_id', user.id)

      const totalViews = listings?.reduce((sum, listing) => sum + (listing.view_count || 0), 0) || 0

      // Get favorites count
      const { count: favoritesCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get unread messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false)

      setStats({
        activeListings: listingsCount || 0,
        totalViews,
        favorites: favoritesCount || 0,
        messages: messagesCount || 0,
      })

      setLoading(false)
    }

    loadStats()
  }, [])

  const statCards = [
    {
      name: 'Actieve advertenties',
      value: stats.activeListings,
      icon: Package,
      color: 'bg-blue-500',
      href: '/dashboard/advertenties',
    },
    {
      name: 'Totaal bekeken',
      value: stats.totalViews,
      icon: Eye,
      color: 'bg-green-500',
    },
    {
      name: 'Favorieten',
      value: stats.favorites,
      icon: Heart,
      color: 'bg-red-500',
      href: '/dashboard/favorieten',
    },
    {
      name: 'Ongelezen berichten',
      value: stats.messages,
      icon: MessageSquare,
      color: 'bg-purple-500',
      href: '/dashboard/berichten',
    },
  ]

  const quickLinks = [
    {
      name: 'Nieuwe advertentie plaatsen',
      description: 'Plaats een nieuwe advertentie op de marktplaats',
      href: '/dashboard/advertenties/nieuw',
      icon: Plus,
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      name: 'Mijn advertenties',
      description: 'Bekijk en beheer je advertenties',
      href: '/dashboard/advertenties',
      icon: Package,
      color: 'bg-gray-600 hover:bg-gray-700',
    },
    {
      name: 'Mijn favorieten',
      description: 'Bekijk je opgeslagen advertenties',
      href: '/dashboard/favorieten',
      icon: Heart,
      color: 'bg-red-600 hover:bg-red-700',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welkom terug! Hier is een overzicht van je account.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const content = (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )

          return stat.href ? (
            <Link key={stat.name} href={stat.href}>
              {content}
            </Link>
          ) : (
            <div key={stat.name}>{content}</div>
          )
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle acties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`${link.color} text-white rounded-lg p-6 transition-colors`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-semibold mb-2">{link.name}</h3>
                <p className="text-sm text-white/90">{link.description}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
