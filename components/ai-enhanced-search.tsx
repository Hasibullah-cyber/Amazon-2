
"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Sparkles, X, Loader2, Mic, MicOff } from "lucide-react"
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
  const [isListening, setIsListening] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const searchRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  const categories = ["All", "Electronics", "Fashion", "Home", "Beauty"]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setQuery(transcript)
        setIsListening(false)
        // Auto-search after voice input
        setTimeout(() => handleSearch(transcript), 100)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        toast({
          title: "Voice Recognition Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        })
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Search Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setIsOpen(true)

    try {
      // Focus on product search first
      const productsResponse = await fetch("/api/products")
      const allProducts = await productsResponse.json()
      
      // Convert products to search result format and enhance filtering
      const products: SearchResult[] = allProducts.map((p: any) => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category
      }))

      // Enhanced filtering with fuzzy matching
      const filteredProducts = products.filter(product => {
        const searchTerm = searchQuery.toLowerCase()
        const productMatch = product.name.toLowerCase().includes(searchTerm) ||
                           product.category.toLowerCase().includes(searchTerm) ||
                           product.name.toLowerCase().includes(searchTerm.replace(/s$/, '')) // Handle plurals
        
        const categoryMatch = selectedCategory === "All" || 
                             product.category.toLowerCase().includes(selectedCategory.toLowerCase())
        
        return productMatch && categoryMatch
      }).slice(0, 8) // Show more results

      setResults(filteredProducts)
      setAiSuggestion("") // Don't show AI suggestions

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

  // Smart auto-complete suggestions
  const getAutocompleteSuggestions = () => {
    if (!query || query.length < 2) return []
    
    const suggestions = [
      "smartphone", "laptop", "headphones", "watch", "camera",
      "dress", "shirt", "shoes", "bag", "jacket",
      "sofa", "table", "lamp", "pillow", "curtain",
      "lipstick", "cream", "perfume", "shampoo", "makeup"
    ]
    
    return suggestions
      .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3)
  }

  const autocompleteSuggestions = getAutocompleteSuggestions()

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="flex w-full bg-white rounded-md overflow-hidden shadow-sm">
        {/* Compact Category Selector */}
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-50 border-r border-gray-200 text-gray-700 px-2 py-2 text-xs focus:outline-none focus:bg-gray-100 min-w-0 w-16 sm:w-20"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => query && setIsOpen(true)}
            className="rounded-none border-0 text-gray-900 focus:outline-none focus:ring-0 pr-16 text-sm"
          />
          
          {/* Voice and Clear buttons */}
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="h-3 w-3" />
              </button>
            )}
            
            <button
              onClick={handleVoiceSearch}
              className={`p-1 rounded transition-colors ${
                isListening 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title="Voice Search"
            >
              {isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={() => handleSearch()}
          disabled={isLoading}
          className="rounded-none bg-[#febd69] hover:bg-[#f3a847] text-black border-0 px-3 sm:px-4"
          size="sm"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Voice indicator */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-red-50 border border-red-200 rounded-md p-2 z-50">
          <div className="flex items-center justify-center text-red-600 text-sm">
            <div className="animate-pulse mr-2">🎤</div>
            Listening... Speak now
          </div>
        </div>
      )}

      {/* AI-powered search results dropdown */}
      {isOpen && !isListening && (query || results.length > 0 || aiSuggestion) && (
        <Card className="absolute top-full left-0 right-0 mt-1 bg-white shadow-xl border z-50 max-h-96 overflow-y-auto">
          {/* Auto-complete suggestions */}
          {autocompleteSuggestions.length > 0 && !aiSuggestion && !results.length && (
            <div className="p-3 border-b">
              <p className="text-xs font-medium text-gray-500 mb-2">Suggestions</p>
              <div className="flex flex-wrap gap-1">
                {autocompleteSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(suggestion)
                      handleSearch(suggestion)
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          

          {/* Products */}
          {results.length > 0 && (
            <div className="p-2">
              <p className="text-xs font-medium text-gray-700 px-2 py-1">Products ({results.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded text-sm border-b border-gray-100"
                  >
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {product.name}
                      </p>
                      <p className="text-sm text-orange-600 font-semibold">৳{product.price}</p>
                      <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query && !isLoading && results.length === 0 && autocompleteSuggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No products found for "{query}"</p>
              <p className="text-xs mt-1">Try different keywords or browse categories</p>
            </div>
          )}
        </Card>
      )}

      
    </div>
  )
}
