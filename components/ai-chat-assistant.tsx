
"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, Send, X, Bot, User, Minimize2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  content: string
  isUser: boolean
  timestamp: Date
}

export default function AIChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Handle mounting for hydration
  useEffect(() => {
    setMounted(true)
    
    // Initialize with welcome message only after mounting
    setMessages([
      {
        content: `👋 Hi! I'm your shopping assistant for Hasib Shop!

I can help you with:
🔍 **Product recommendations** - "What face creams do you recommend?"
📱 **Category browsing** - "Show me electronics"
💰 **Price inquiries** - "What's your budget range?"
📦 **Order support** - "How does shipping work?"
🛒 **Shopping guidance** - "Help me find a gift"

What can I help you find today? 😊`,
        isUser: false,
        timestamp: new Date(),
      },
    ])
  }, [])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)
    setHasError(false)

    // Add user message
    const newUserMessage: Message = {
      content: userMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newUserMessage])

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          context: "Hasib Shop customer service",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const aiMessage: Message = {
        content: data.response || "I apologize, but I'm having trouble processing your request right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat error:", error)
      setHasError(true)

      const errorMessage: Message = {
        content: `I'm having a connection issue, but I can still help! 🛍️

**Quick answers:**
🚚 **Shipping:** 1-2 days in Dhaka, 2-4 days nationwide
💳 **Payment:** bKash, Nagad, Rocket, Cards, COD  
🎯 **Free shipping** on orders over ৳5,000
📱 **Categories:** Electronics, Fashion, Home & Living, Beauty

**Popular products:**
• Wireless Headphones (৳22,000), Smart Watch (৳16,500)
• Designer Sunglasses (৳8,800), Leather Wallet (৳5,500)  
• Scented Candles (৳2,200), Ceramic Vase (৳6,600)
• Hair Dryer (৳9,900), Makeup Brushes (৳5,500)

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
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg z-40 transition-all duration-200 hover:scale-105"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-80 h-96 bg-white border shadow-xl z-40 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center">
              <Bot className="h-5 w-5 mr-2" />
              <span className="font-medium">Shopping Assistant</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0 text-white hover:bg-blue-700"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-blue-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-2 ${
                        message.isUser
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="flex items-start">
                        {!message.isUser && (
                          <Bot className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5 text-blue-600" />
                        )}
                        {message.isUser && (
                          <User className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-2 max-w-[85%]">
                      <div className="flex items-center">
                        <Bot className="h-4 w-4 mr-1 text-blue-600" />
                        <div className="text-sm text-gray-600">Typing...</div>
                        <div className="flex ml-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse ml-1" style={{ animationDelay: "0.2s" }}></div>
                          <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse ml-1" style={{ animationDelay: "0.4s" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Error Banner */}
              {hasError && (
                <div className="px-3 py-2 bg-yellow-50 border-t border-yellow-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-yellow-800">Connection issue detected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={retryConnection}
                      className="h-6 text-xs text-yellow-800 hover:bg-yellow-100"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1 text-sm"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  )
}
