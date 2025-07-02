
"use client"

import { useState, useEffect } from "react"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"
import { storeManager } from "@/lib/store"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
}

interface Filters {
  category: string
  minPrice: number
  maxPrice: number
  sortBy: string
}

export default function RegularSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    sortBy: "name"
  })
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, products, filters])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const fetchedProducts = await storeManager.getProducts()
      setProducts(fetchedProducts)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced search mappings for better product discovery
  const searchMappings = {
    // Beauty/Skincare brands and terms - Enhanced for Fair and Lovely
    'fair': ['beauty', 'skincare', 'cosmetics', 'fairness', 'whitening'],
    'lovely': ['beauty', 'skincare', 'cosmetics', 'fairness'],
    'fairandlovely': ['beauty', 'skincare', 'fairness'],
    'fair and lovely': ['beauty', 'skincare', 'fairness'],
    'fairness': ['beauty', 'skincare'],
    'whitening': ['beauty', 'skincare'],
    'brightening': ['beauty', 'skincare'],
    'glow': ['beauty', 'skincare'],
    'ponds': ['beauty', 'skincare'],
    'loreal': ['beauty', 'cosmetics'],
    'nivea': ['beauty', 'skincare'],
    'olay': ['beauty', 'skincare'],
    'garnier': ['beauty', 'skincare'],
    'cream': ['beauty', 'skincare'],
    'moisturizer': ['beauty', 'skincare'],
    'serum': ['beauty', 'skincare'],
    'foundation': ['beauty', 'cosmetics'],
    'lipstick': ['beauty', 'cosmetics'],
    
    // Electronics brands and terms
    'samsung': ['electronics'],
    'apple': ['electronics'],
    'iphone': ['electronics'],
    'android': ['electronics'],
    'headphone': ['electronics'],
    'earphone': ['electronics'],
    'speaker': ['electronics'],
    'phone': ['electronics'],
    'mobile': ['electronics'],
    'laptop': ['electronics'],
    'computer': ['electronics'],
    
    // Fashion terms
    'nike': ['fashion'],
    'adidas': ['fashion'],
    'shirt': ['fashion'],
    'dress': ['fashion'],
    'shoes': ['fashion'],
    'bag': ['fashion'],
    'watch': ['fashion'],
    'sunglasses': ['fashion']
  }

  // Helper function for enhanced similarity calculation
  const calculateSimilarity = (str1: string, str2: string, searchTerm: string): number => {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()
    const search = searchTerm.toLowerCase()
    
    // Check search mappings first with enhanced Fair detection
    for (const [key, categories] of Object.entries(searchMappings)) {
      if (search.includes(key) || key.includes(search)) {
        if (categories.some(cat => s1.includes(cat) || s2.includes(cat))) {
          return 0.9 // High relevance for mapped terms
        }
      }
    }
    
    // Special handling for "fair" searches to prioritize Fair and Lovely products
    if (search.includes('fair')) {
      if (s1.includes('fair') || s2.includes('fair')) {
        return 0.95 // Very high relevance for Fair brand products
      }
      if (s1.includes('beauty') || s2.includes('beauty')) {
        return 0.85 // High relevance for beauty products when searching "fair"
      }
    }
    
    if (s1 === s2) return 1.0
    if (s1.includes(s2) || s2.includes(s1)) return 0.8
    
    const words1 = s1.split(/\s+/)
    const words2 = s2.split(/\s+/)
    
    let wordMatches = 0
    for (const word1 of words1) {
      for (const word2 of words2) {
        if (word1.includes(word2) || word2.includes(word1)) {
          wordMatches++
          break
        }
      }
    }
    
    if (wordMatches > 0) {
      return 0.6 + (wordMatches / Math.max(words1.length, words2.length)) * 0.2
    }
    
    // Character-level similarity for typos
    const maxLen = Math.max(s1.length, s2.length)
    if (maxLen === 0) return 1.0
    
    let commonChars = 0
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
      if (s1[i] === s2[i]) commonChars++
    }
    
    const similarity = commonChars / maxLen
    return similarity > 0.3 ? similarity : 0
  }

  const applyFilters = () => {
    let filtered: any[] = []
    
    if (searchTerm.trim()) {
      // Use intelligent search when there's a search term
      const scoredProducts = products.map(product => {
        const nameScore = calculateSimilarity(product.name, searchTerm, searchTerm)
        const descScore = calculateSimilarity(product.description, searchTerm, searchTerm) * 0.7
        const categoryScore = calculateSimilarity(product.category, searchTerm, searchTerm) * 0.8
        
        // Enhanced mapping-based scoring
        let mappingScore = 0
        const search = searchTerm.toLowerCase()
        for (const [key, categories] of Object.entries(searchMappings)) {
          if (search.includes(key) || key.includes(search)) {
            if (categories.includes(product.category.toLowerCase())) {
              mappingScore = 0.95 // Very high relevance for category matches
            }
            if (product.name.toLowerCase().includes(key)) {
              mappingScore = Math.max(mappingScore, 0.9)
            }
          }
        }
        
        // Check for partial word matches
        const searchWords = searchTerm.toLowerCase().split(/\s+/)
        let partialScore = 0
        
        for (const word of searchWords) {
          if (word.length >= 2) {
            if (product.name.toLowerCase().includes(word)) partialScore += 0.3
            if (product.description.toLowerCase().includes(word)) partialScore += 0.2
            if (product.category.toLowerCase().includes(word)) partialScore += 0.4
          }
        }
        
        const totalScore = Math.max(nameScore, descScore, categoryScore, mappingScore) + partialScore
        
        return {
          ...product,
          similarity: totalScore
        }
      }).filter(product => {
        const matchesCategory = !filters.category || product.category === filters.category
        const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice
        const hasRelevance = product.similarity > 0.05 // Lower threshold for better discovery
        
        return matchesCategory && matchesPrice && hasRelevance
      })
      
      // Sort by similarity first, then by selected sort option
      scoredProducts.sort((a, b) => {
        // First sort by similarity
        if (b.similarity !== a.similarity) {
          return b.similarity - a.similarity
        }
        
        // Then by selected sort option
        switch (filters.sortBy) {
          case 'price-low': return a.price - b.price
          case 'price-high': return b.price - a.price
          case 'name': return a.name.localeCompare(b.name)
          default: return 0
        }
      })
      
      filtered = scoredProducts
    } else {
      // No search term, use regular filtering
      filtered = products.filter(product => {
        const matchesCategory = !filters.category || product.category === filters.category
        const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice
        return matchesCategory && matchesPrice
      })
      
      // Apply sorting
      switch (filters.sortBy) {
        case 'price-low':
          filtered.sort((a, b) => a.price - b.price)
          break
        case 'price-high':
          filtered.sort((a, b) => b.price - a.price)
          break
        case 'name':
          filtered.sort((a, b) => a.name.localeCompare(b.name))
          break
      }
    }

    setFilteredProducts(filtered)
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 10000,
      sortBy: "name"
    })
    setSearchTerm("")
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <div className="relative flex items-center bg-white rounded-md shadow-sm border border-gray-300 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
              <Input
                type="text"
                placeholder="Search for products, brands, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 pl-11 pr-12 h-12 text-base border-0 rounded-l-md focus:ring-0 focus:outline-none bg-transparent"
              />
              <Button
                size="sm"
                onClick={() => applyFilters()}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-md border-0"
              >
                Search
              </Button>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-12 px-4 border border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-colors rounded-md"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>
        
        {/* Search suggestions */}
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Try searching:</span>
          {['fair cream', 'headphones', 'samsung', 'beauty products', 'fashion'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setSearchTerm(suggestion)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Min Price</label>
              <Input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Max Price</label>
              <Input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Active Filters */}
      {(searchTerm || filters.category || filters.minPrice > 0 || filters.maxPrice < 10000) && (
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium">Active filters:</span>
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchTerm}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchTerm("")} />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {filters.category}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(prev => ({ ...prev, category: "" }))} />
              </Badge>
            )}
            {filters.minPrice > 0 && (
              <Badge variant="secondary">
                Min: ৳{filters.minPrice}
              </Badge>
            )}
            {filters.maxPrice < 10000 && (
              <Badge variant="secondary">
                Max: ৳{filters.maxPrice}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
          </h2>
          <span className="text-gray-600">
            {filteredProducts.length} products found
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="animate-shimmer h-48 mb-4 rounded"></div>
                <div className="animate-shimmer h-4 mb-2 rounded"></div>
                <div className="animate-shimmer h-4 w-20 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="amazon-card h-full hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative mb-3">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="amazon-title text-sm mb-2 line-clamp-2">{product.name}</h3>
                  <p className="amazon-price text-lg">৳{product.price}</p>
                  <Badge variant="secondary" className="mt-2">
                    {product.category}
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search terms or filters.
            </p>
            <Button onClick={clearFilters}>Clear all filters</Button>
          </Card>
        )}
      </div>
    </div>
  )
}
