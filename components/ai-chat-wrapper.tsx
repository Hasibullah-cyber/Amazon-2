'use client'

import dynamic from 'next/dynamic'

const AIChatAssistant = dynamic(
  () => import('./ai-chat-assistant'),
  {
    ssr: false,
    loading: () => null
  }
)

export default function AIChatWrapper() {
  return <AIChatAssistant />
}