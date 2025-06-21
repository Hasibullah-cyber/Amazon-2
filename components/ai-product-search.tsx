"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function AIProductSearch() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleAISearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (data.suggestion) {
        toast({
          title: "AI Search Results",
          description: data.suggestion,
          duration: 8000,
        })
      } else {
        toast({
          title: "Search Results",
          description: "Try browsing our categories for the best products!",
          duration: 5000,
        })
      }

      // Clear the search input
      setQuery("")
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search",
        description: "Please try browsing our product categories instead.",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <div className="flex">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: 'I need a gift for my tech-savvy friend' or 'Best headphones under ৳5000'"
          className="flex-1 rounded-r-none text-black placeholder:text-gray-500"
          onKeyPress={(e) => e.key === "Enter" && handleAISearch()}
        />
        <Button
          onClick={handleAISearch}
          disabled={isLoading}
          className="rounded-l-none bg-[#febd69] hover:bg-[#f3a847] text-black border-l-0"
        >
          {isLoading ? (
            <div className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="absolute -bottom-6 left-0 text-xs text-gray-500 flex items-center">
        <Sparkles className="h-3 w-3 mr-1" />
        AI-powered search
      </div>
    </div>
  )
}
