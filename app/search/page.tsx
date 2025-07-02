'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, X, SlidersHorizontal, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'
import Link from 'next/link'
import { storeManager } from "@/lib/store"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
  reviews: number
  stock: number
}

function SearchResults() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [searchTerm, setSearchTerm] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    sortBy: "relevance"
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

      const uniqueCategories = [...new Set(fetchedProducts.map(p => p.category))]
      setCategories(uniqueCategories)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()

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
      const scoredProducts = products.map(product => {
        const nameScore = calculateSimilarity(product.name, searchTerm)
        const descScore = calculateSimilarity(product.description, searchTerm) * 0.7
        const categoryScore = calculateSimilarity(product.category, searchTerm) * 0.5

        const searchWords = searchTerm.toLowerCase().split(/\s+/)
        let partialScore = 0

        for (const word of searchWords) {
          if (word.length >= 2) {
            if (product.name.toLowerCase().includes(word)) partialScore += 0.3
            if (product.description.toLowerCase().includes(word)) partialScore += 0.2
            if (product.category.toLowerCase().includes(word)) partialScore += 0.1
          }
        }

        const totalScore = Math.max(nameScore, descScore, categoryScore) + partialScore

        return {
          ...product,
          similarity: totalScore
        }
      }).filter(product => {
        const matchesCategory = !filters.category || product.category === filters.category
        const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice
        const hasRelevance = product.similarity > 0.1

        return matchesCategory && matchesPrice && hasRelevance
      })

      scoredProducts.sort((a, b) => {
        if (filters.sortBy === 'relevance') {
          return b.similarity - a.similarity
        }
        switch (filters.sortBy) {
          case 'price-low': return a.price - b.price
          case 'price-high': return b.price - a.price
          case 'name': return a.name.localeCompare(b.name)
          default: return b.similarity - a.similarity
        }
      })

      filtered = scoredProducts
    } else {
      filtered = products.filter(product => {
        const matchesCategory = !filters.category || product.category === filters.category
        const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice
        return matchesCategory && matchesPrice
      })

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
      sortBy: "relevance"
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Search Header */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
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
                  <option value="relevance">Relevance</option>
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

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
            </h1>
            <span className="text-gray-600">
              {filteredProducts.length} products found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse bg-gray-200 h-48 mb-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 mb-2 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-20 rounded"></div>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <Link key={product.id} href={`/product/${product.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow p-4">
                    <div className="aspect-square relative mb-3">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-orange-600 font-bold text-lg mb-2">৳{product.price}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                      <span className="text-xs text-gray-500">{product.reviews} reviews</span>
                    </div>
                    {product.stock > 0 ? (
                      <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2 text-red-600 border-red-600">
                        Out of Stock
                      </Badge>
                    )}
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
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto p-4">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  )
}