'use client'

import ConversationList from '@/components/messages/ConversationList'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Berichten</h1>
        </div>
        <p className="text-gray-600">Bekijk en beheer je gesprekken</p>
      </div>

      <ConversationList />
    </div>
  )
}
