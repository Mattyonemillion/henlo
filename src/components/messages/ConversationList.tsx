'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { MessageSquare, User } from 'lucide-react'
import type { Database } from '@/types/database'

type Conversation = Database['public']['Tables']['conversations']['Row']
type Message = Database['public']['Tables']['messages']['Row']

interface ConversationWithDetails extends Conversation {
  lastMessage?: Message
  otherUserName?: string
  listingTitle?: string
  unreadCount?: number
}

export default function ConversationList() {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    setCurrentUserId(user.id)

    // Load conversations where user is buyer or seller
    const { data: conversationsData } = await supabase
      .from('conversations')
      .select('*')
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('updated_at', { ascending: false })

    if (!conversationsData) {
      setLoading(false)
      return
    }

    // Load last message and details for each conversation
    const conversationsWithDetails = await Promise.all(
      conversationsData.map(async (conv) => {
        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('read', false)
          .neq('sender_id', user.id)

        // For now, we'll use placeholder names
        // In a real app, you'd fetch user and listing details
        const otherUserId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id

        return {
          ...conv,
          lastMessage: lastMessage || undefined,
          otherUserName: `Gebruiker ${otherUserId.slice(0, 8)}`,
          listingTitle: `Advertentie ${conv.listing_id.slice(0, 8)}`,
          unreadCount: unreadCount || 0,
        }
      })
    )

    setConversations(conversationsWithDetails)
    setLoading(false)
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Geen berichten</h3>
        <p className="text-gray-600">Je hebt nog geen gesprekken</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/dashboard/berichten/${conversation.id}`}
          className="block hover:bg-gray-50 transition-colors"
        >
          <div className="p-4 flex gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-gray-900 truncate">
                  {conversation.otherUserName}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
                    {formatTime(conversation.lastMessage.created_at)}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mb-1 truncate">
                {conversation.listingTitle}
              </p>

              {conversation.lastMessage && (
                <p className={`text-sm truncate ${
                  conversation.unreadCount && conversation.unreadCount > 0
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-500'
                }`}>
                  {conversation.lastMessage.sender_id === currentUserId ? 'Jij: ' : ''}
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>

            {/* Unread badge */}
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-semibold">
                  {conversation.unreadCount}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
