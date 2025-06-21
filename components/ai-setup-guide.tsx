"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Copy, ExternalLink, CheckCircle, AlertCircle, Sparkles, Bot, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AISetupGuide() {
  const [apiKey, setApiKey] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [setupStep, setSetupStep] = useState(1)
  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
      duration: 2000,
    })
  }

  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      })
      return
    }

    setIsValidating(true)
    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "test connection",
          context: "validation",
        }),
      })

      const data = await response.json()

      if (data.response && !data.response.includes("offline mode")) {
        toast({
          title: "🎉 Success!",
          description: "AI features are now fully enabled!",
          duration: 5000,
        })
        setSetupStep(4)
      } else {
        toast({
          title: "Setup Needed",
          description: "Please add your API key to the .env.local file and restart the server",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to validate API key. Make sure to restart your server after adding the key.",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const testAIFeatures = async () => {
    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "What face creams do you recommend?",
          context: "test",
        }),
      })

      const data = await response.json()

      toast({
        title: "AI Response Preview",
        description: data.response.substring(0, 100) + "...",
        duration: 8000,
      })
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Make sure your API key is properly configured",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 text-center">
          <Bot className="h-8 w-8 mx-auto mb-2 text-blue-500" />
          <h3 className="font-semibold text-black mb-1">AI Chat Assistant</h3>
          <p className="text-sm text-gray-600">Get personalized shopping help and product recommendations</p>
        </Card>
        <Card className="p-4 text-center">
          <Search className="h-8 w-8 mx-auto mb-2 text-green-500" />
          <h3 className="font-semibold text-black mb-1">Smart Search</h3>
          <p className="text-sm text-gray-600">Find products using natural language queries</p>
        </Card>
        <Card className="p-4 text-center">
          <Sparkles className="h-8 w-8 mx-auto mb-2 text-purple-500" />
          <h3 className="font-semibold text-black mb-1">AI Recommendations</h3>
          <p className="text-sm text-gray-600">Get intelligent product suggestions based on your needs</p>
        </Card>
      </div>

      {/* Setup Steps */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-2">🚀 Quick Setup Guide</h2>
            <p className="text-gray-600">Follow these simple steps to enable AI features</p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Get API Key */}
            <div className="flex items-start space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  setupStep >= 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-black mb-2">Get Your Free Gemini API Key</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Visit Google AI Studio to create a free API key. No credit card required!
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      window.open("https://aistudio.google.com/app/apikey", "_blank")
                      setSetupStep(2)
                    }}
                    className="amazon-button"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open AI Studio
                  </Button>
                  <Button
                    onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")}
                    variant="outline"
                    size="sm"
                  >
                    📖 View Tutorial
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 2: Create .env.local file */}
            <div className="flex items-start space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  setupStep >= 2 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-black mb-2">Create Environment File</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Create a <code className="bg-gray-100 px-1 rounded">.env.local</code> file in your project root and
                  add your API key:
                </p>
                <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm relative">
                  <div className="flex items-center justify-between">
                    <span>GEMINI_API_KEY=your_actual_api_key_here</span>
                    <Button
                      onClick={() => copyToClipboard("GEMINI_API_KEY=your_actual_api_key_here")}
                      size="sm"
                      variant="ghost"
                      className="text-green-400 hover:text-green-300"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Replace "your_actual_api_key_here" with the key you got from Google AI Studio
                </p>
              </div>
            </div>

            {/* Step 3: Restart Server */}
            <div className="flex items-start space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  setupStep >= 3 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-black mb-2">Restart Your Development Server</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Stop your server (Ctrl+C) and restart it to load the new environment variable:
                </p>
                <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm">
                  <div>npm run dev</div>
                  <div className="text-gray-500"># or</div>
                  <div>yarn dev</div>
                </div>
                <Button onClick={() => setSetupStep(3)} variant="outline" size="sm" className="mt-2">
                  ✅ I've restarted my server
                </Button>
              </div>
            </div>

            {/* Step 4: Test Setup */}
            <div className="flex items-start space-x-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  setupStep >= 4 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-black mb-2">Test Your Setup</h3>
                <p className="text-sm text-gray-600 mb-3">Verify that AI features are working correctly:</p>
                <div className="flex flex-wrap gap-2">
                  <Input
                    placeholder="Paste your API key to test (optional)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 min-w-[200px]"
                  />
                  <Button onClick={validateApiKey} disabled={isValidating} className="amazon-button">
                    {isValidating ? "Testing..." : "🧪 Test Connection"}
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={testAIFeatures} variant="outline" size="sm">
                    🤖 Test AI Chat
                  </Button>
                  <Button
                    onClick={() => {
                      const chatButton = document
                        .querySelector('[aria-label="Shopping cart"]')
                        ?.parentElement?.nextElementSibling?.querySelector("button")
                      if (chatButton) {
                        ;(chatButton as HTMLElement).click()
                      }
                    }}
                    variant="outline"
                    size="sm"
                  >
                    💬 Open Chat Assistant
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Notice */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800 mb-1">🔒 Security Best Practices:</p>
            <ul className="text-yellow-700 space-y-1">
              <li>• Never commit your .env.local file to version control</li>
              <li>• Keep your API key private and secure</li>
              <li>• The .env.local file is automatically ignored by Git</li>
              <li>• Regenerate your key if you suspect it's been compromised</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Success State */}
      {setupStep >= 4 && (
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-800 mb-2">🎉 AI Features Enabled!</h3>
            <p className="text-green-700 mb-4">Your Hasib Shop now has full AI capabilities. Try these features:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="bg-white p-3 rounded-md border border-green-200">
                <h4 className="font-semibold text-green-800 mb-1">🔍 Smart Search</h4>
                <p className="text-sm text-green-700">Try: "I need a gift for my tech-savvy friend"</p>
              </div>
              <div className="bg-white p-3 rounded-md border border-green-200">
                <h4 className="font-semibold text-green-800 mb-1">💬 AI Chat</h4>
                <p className="text-sm text-green-700">Ask: "What face creams do you recommend?"</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Troubleshooting */}
      <Card className="p-4">
        <h3 className="font-semibold text-black mb-3">🔧 Troubleshooting</h3>
        <div className="space-y-2 text-sm">
          <details className="cursor-pointer">
            <summary className="font-medium text-gray-700 hover:text-black">
              ❓ I'm getting "API key not valid" error
            </summary>
            <div className="mt-2 pl-4 text-gray-600">
              <p>• Make sure you copied the entire API key without extra spaces</p>
              <p>• Verify the key is added to .env.local file correctly</p>
              <p>• Restart your development server after adding the key</p>
              <p>• Check that your Google AI Studio account is active</p>
            </div>
          </details>

          <details className="cursor-pointer">
            <summary className="font-medium text-gray-700 hover:text-black">❓ Chat still shows "offline mode"</summary>
            <div className="mt-2 pl-4 text-gray-600">
              <p>• Ensure .env.local file is in your project root directory</p>
              <p>• Check that the file name is exactly ".env.local" (with the dot)</p>
              <p>• Restart your server completely (stop and start again)</p>
              <p>• Verify no typos in GEMINI_API_KEY variable name</p>
            </div>
          </details>

          <details className="cursor-pointer">
            <summary className="font-medium text-gray-700 hover:text-black">
              ❓ Need help with Google AI Studio?
            </summary>
            <div className="mt-2 pl-4 text-gray-600">
              <p>• Sign in with your Google account</p>
              <p>• Click "Create API Key" button</p>
              <p>• Copy the generated key immediately</p>
              <p>• The service is free with generous usage limits</p>
            </div>
          </details>
        </div>
      </Card>
    </div>
  )
}
