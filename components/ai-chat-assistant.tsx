"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot, User, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your shopping assistant for Hasib Shop. I can help you find products, answer questions about shipping, returns, and more. What can I help you with today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage("")
    setIsLoading(true)
    setHasError(false)

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentMessage,
          context: "shopping_assistant",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm sorry, I couldn't process your request right now.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      setHasError(true)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I'm having trouble connecting right now, but I can still help! 🛍️

**For your question about "${currentMessage}":**

🔍 **Quick Product Guide:**
• **Electronics**: Headphones (৳22,000), Smartwatch (৳16,500), Camera (৳33,000)
• **Fashion**: Sunglasses (৳8,800), Wallet (৳5,500), Watch (৳17,600)
• **Home & Living**: Candle Set (৳3,850), Bed Sheets (৳9,900), Wall Clock (৳5,500)
• **Beauty**: Skincare Set (৳14,300), Hair Dryer (৳9,900), Makeup Brushes (৳5,500)

💳 **Payment:** bKash, Nagad, Rocket, Cards, COD
🚚 **Delivery:** 1-2 days in Dhaka, 2-4 days nationwide
💰 **Free shipping** on orders over ৳5,000

Try browsing our categories or ask me anything else! 😊`,
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Connection Issue",
        description: "I'm still here to help! Try asking about our products or policies.",
        duration: 4000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const retryConnection = () => {
    setHasError(false)
    toast({
      title: "Retrying...",
      description: "Attempting to reconnect to AI services",
      duration: 2000,
    })
  }

  return (
    <>
      {/* Chat toggle button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full amazon-button shadow-lg hover:shadow-xl transition-shadow relative"
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {/* Status indicator */}
          <div
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
              hasError ? "bg-yellow-500" : "bg-green-500"
            }`}
          >
            {hasError ? <AlertCircle className="h-2 w-2 text-white" /> : <Bot className="h-2 w-2 text-white" />}
          </div>
        </Button>
      </div>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-40 flex flex-col">
          {/* Header */}
          <div className="bg-[#232f3e] text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                <h3 className="font-medium">Shopping Assistant</h3>
              </div>
              {hasError && (
                <Button
                  onClick={retryConnection}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:text-gray-300 text-xs"
                >
                  Retry
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-300 mt-1">
              {hasError ? "Offline mode - still helpful!" : "Always here to help!"}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser ? "bg-[#232f3e] text-white" : "bg-gray-100 text-gray-800 border border-gray-200"
                  }`}
                >
                  <div className="flex items-start">
                    {!message.isUser && <Bot className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />}
                    <div className="text-sm whitespace-pre-line">{message.text}</div>
                    {message.isUser && <User className="h-4 w-4 ml-2 mt-0.5 flex-shrink-0" />}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 border border-gray-200 p-3 rounded-lg">
                  <div className="flex items-center">
                    <Bot className="h-4 w-4 mr-2" />
                    <div className="text-sm">Thinking...</div>
                    <div className="ml-2 flex space-x-1">
                      <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"></div>
                      <div
                        className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-gray-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about products, shipping, returns..."
                disabled={isLoading}
                className="flex-1 text-black placeholder:text-gray-500"
              />
              <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {hasError && (
              <p className="text-xs text-yellow-600 mt-1">⚠️ Limited connectivity - basic help still available</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
