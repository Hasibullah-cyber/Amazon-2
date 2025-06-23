
'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

const AIChatAssistant = dynamic(
  () => import('./ai-chat-assistant'),
  {
    ssr: false,
    loading: () => null
  }
)

export default function AIChatWrapper() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <>
      {/* Chat Toggle Button */}
      {!isChatOpen && (
        <Button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-[#232f3e] hover:bg-[#1a252f] text-white shadow-lg"
          size="sm"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Assistant */}
      <AIChatAssistant
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </>
  )
}
