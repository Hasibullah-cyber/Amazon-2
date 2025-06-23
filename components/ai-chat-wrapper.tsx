
'use client'

import dynamic from 'next/dynamic'

const AIChatAssistant = dynamic(
  () => import('./ai-chat-assistant').then(mod => ({ default: mod.AIChatAssistant })),
  {
    ssr: false,
    loading: () => null
  }
)

export default AIChatAssistant
