'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import type { Database } from '@/types/database'

type Message = Database['public']['Tables']['messages']['Row']

export default function ConversationPage({
  params,
}: {
  params: { conversationId: string }
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const loadMessages = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)

      // Load messages
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', params.conversationId)
        .order('created_at', { ascending: true })

      if (data) setMessages(data)
    }

    loadMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel(`conversation:${params.conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${params.conversationId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [params.conversationId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId) return

    const { error } = await supabase.from('messages').insert({
      conversation_id: params.conversationId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    })

    if (!error) {
      setNewMessage('')
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === currentUserId
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString('nl-NL')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type een bericht..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}
