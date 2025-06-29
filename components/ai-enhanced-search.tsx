
"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Sparkles, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"

interface SearchResult {
  id: string
  name: string
  price: number
  image: string
  category: string
}

interface AISearchResponse {
  suggestion: string
  products?: SearchResult[]
}

export default function AIEnhancedSearch() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiSuggestion, setAiSuggestion] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setIsOpen(true)

    try {
      // AI-powered search
      const aiResponse = await fetch("/api/ai-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const aiData: AISearchResponse = await aiResponse.json()
      setAiSuggestion(aiData.suggestion || "")

      // Regular product search
      const productsResponse = await fetch("/api/products")
      const products: SearchResult[] = await productsResponse.json()

      // Filter products based on query
      const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) // Limit to 5 results

      setResults(filteredProducts)

    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to search products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults([])
    setAiSuggestion("")
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-2xl" ref={searchRef}>
      <div className="flex w-full">
        <select className="bg-gray-100 border border-gray-300 text-black px-2 py-2 rounded-l-md text-sm focus:outline-none">
          <option>All</option>
          <option>Electronics</option>
          <option>Fashion</option>
          <option>Home</option>
          <option>Beauty</option>
        </select>
        
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search with AI assistance..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => query && setIsOpen(true)}
            className="rounded-none border-l-0 border-r-0 text-black focus:outline-none pr-8"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          onClick={handleSearch}
          disabled={isLoading}
          className="rounded-l-none bg-[#febd69] hover:bg-[#f3a847] text-black border border-[#febd69]"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* AI-powered search results dropdown */}
      {isOpen && (query || results.length > 0 || aiSuggestion) && (
        <Card className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg border z-50 max-h-96 overflow-y-auto">
          {aiSuggestion && (
            <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-start space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">AI Suggestion</p>
                  <p className="text-sm text-gray-700">{aiSuggestion}</p>
                </div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="p-2">
              <p className="text-sm font-medium text-gray-700 px-2 py-1">Products</p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                >
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">৳{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {query && !isLoading && results.length === 0 && !aiSuggestion && (
            <div className="p-4 text-center text-gray-500">
              <p>No products found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or browse categories</p>
            </div>
          )}
        </Card>
      )}

      {/* AI indicator */}
      <div className="absolute -bottom-5 left-0 text-xs text-gray-500 flex items-center">
        <Sparkles className="h-3 w-3 mr-1" />
        AI-enhanced search
      </div>
    </div>
  )
}
