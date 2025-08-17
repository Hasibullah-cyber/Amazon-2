'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Filter, X, SlidersHorizontal, Star, ChevronDown, ChevronUp } from "lucide-react"
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
  rating: number
  brand: string
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
    minRating: 0,
    inStock: false,
    sortBy: "relevance",
    brand: ""
  })
  const [categories, setCategories] = useState<string[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedDescriptionId, setExpandedDescriptionId] = useState<string | null>(null)

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
      
      const uniqueBrands = [...new Set(fetchedProducts.map(p => p.brand))]
      setBrands(uniqueBrands)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced search mappings for better product discovery
  const searchMappings = {
    // Beauty/Skincare brands and terms
    'fair': ['beauty', 'skincare', 'cosmetics'],
    'lovely': ['beauty', 'skincare', 'cosmetics'],
    'fairandlovely': ['beauty', 'skincare'],
    'fair and lovely': ['beauty', 'skincare'],
    'ponds': ['beauty', 'skincare'],
    'loreal': ['beauty', 'cosmetics'],
    'nivea': ['beauty', 'skincare'],
    'olay': ['beauty', 'skincare'],
    'garnier': ['beauty', 'skincare'],
    'cream': ['beauty', 'skincare'],
    'moisturizer': ['beauty', 'skincare'],
    
    // Electronics brands and terms
    'samsung': ['electronics'],
    'apple': ['electronics'],
    'iphone': ['electronics'],
    'headphone': ['electronics'],
    'phone': ['electronics'],
    'mobile': ['electronics'],
    
    // Fashion terms
    'nike': ['fashion'],
    'adidas': ['fashion'],
    'shirt': ['fashion'],
    'shoes': ['fashion']
  }

  const calculateSimilarity = (str1: string, str2: string, searchTerm: string): number => {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()
    const search = searchTerm.toLowerCase()
    
    // Check search mappings first
    for (const [key, categories] of Object.entries(searchMappings)) {
      if (search.includes(key) || key.includes(search)) {
        if (categories.some(cat => s1.includes(cat) || s2.includes(cat))) {
          return 0.9 // High relevance for mapped terms
        }
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

    const maxLen = Math.max(s1.length, s2.length)
    if (maxLen === 0) return 1.0

    let commonChars = 0
    for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
      if (s1[i] === s2[i]) commonChars++
    }

    const similarity = commonChars / maxLen
    return similarity > 0.3 ? similarity : 0
  }

  const applyFilters = useCallback(() => {
    let filtered: any[] = []

    if (searchTerm.trim()) {
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
        const matchesRating = product.rating >= filters.minRating
        const matchesStock = !filters.inStock || product.stock > 0
        const matchesBrand = !filters.brand || product.brand === filters.brand
        const hasRelevance = product.similarity > 0.05

        return matchesCategory && matchesPrice && matchesRating && matchesStock && matchesBrand && hasRelevance
      })

      scoredProducts.sort((a, b) => {
        if (filters.sortBy === 'relevance') {
          return b.similarity - a.similarity
        }
        switch (filters.sortBy) {
          case 'price-low': return a.price - b.price
          case 'price-high': return b.price - a.price
          case 'name': return a.name.localeCompare(b.name)
          case 'rating': return b.rating - a.rating
          default: return b.similarity - a.similarity
        }
      })

      filtered = scoredProducts
    } else {
      filtered = products.filter(product => {
        const matchesCategory = !filters.category || product.category === filters.category
        const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice
        const matchesRating = product.rating >= filters.minRating
        const matchesStock = !filters.inStock || product.stock > 0
        const matchesBrand = !filters.brand || product.brand === filters.brand
        return matchesCategory && matchesPrice && matchesRating && matchesStock && matchesBrand
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
        case 'rating':
          filtered.sort((a, b) => b.rating - a.rating)
          break
      }
    }

    setFilteredProducts(filtered)
  }, [searchTerm, products, filters])

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 10000,
      minRating: 0,
      inStock: false,
      sortBy: "relevance",
      brand: ""
    })
  }

  const toggleDescription = (id: string) => {
    setExpandedDescriptionId(expandedDescriptionId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { max-height: 0; opacity: 0; padding: 0; }
          to { max-height: 500px; opacity: 1; padding: 1.5rem; }
        }
        @keyframes slideUp {
          from { max-height: 500px; opacity: 1; padding: 1.5rem; }
          to { max-height: 0; opacity: 0; padding: 0; }
        }
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
          overflow: hidden;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .product-card {
          transition: all 0.3s ease;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        .product-card:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        .description-container {
          transition: max-height 0.3s ease;
          overflow: hidden;
        }
        .description-expanded {
          max-height: 500px;
        }
        .description-collapsed {
          max-height: 3.6rem;
        }
        .rating-stars {
          display: inline-flex;
        }
        .rating-stars .star {
          transition: transform 0.3s ease, color 0.3s ease;
        }
        .rating-stars .star:hover {
          transform: scale(1.3);
        }
        .search-header {
          transition: all 0.3s ease;
          background: linear-gradient(to right, #fff, #f9fafb);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }
        .search-header:hover {
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .no-results-card {
          background: linear-gradient(135deg, #fff, #f8f9fa);
          transition: all 0.5s ease;
        }
        .no-results-card:hover {
          transform: scale(1.02);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="search-header p-6 rounded-2xl mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="relative flex items-center bg-white rounded-xl shadow-sm border border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all duration-300">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 pl-12 pr-14 h-14 text-lg border-0 rounded-xl focus:ring-0 focus:outline-none bg-transparent"
                />
                <Button
                  size="lg"
                  onClick={() => applyFilters()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-11 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl border-0 shadow-md transition-all duration-300 hover:shadow-lg"
                >
                  Search
                </Button>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 h-14 px-5 border rounded-xl transition-all duration-300 ${
                showFilters 
                  ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-inner' 
                  : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5 transition-transform duration-300" />
              <span className="font-medium">Filters</span>
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="p-6 mb-6 rounded-2xl shadow-lg animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border rounded-xl px-4 py-2.5 bg-white shadow-sm transition-all duration-300 hover:shadow-md focus:border-orange-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Price Range</label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                    min="0"
                    placeholder="Min"
                    className="border rounded-xl px-4 py-2.5 shadow-sm transition-all duration-300 hover:shadow-md focus:border-orange-500"
                  />
                  <Input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                    min="0"
                    placeholder="Max"
                    className="border rounded-xl px-4 py-2.5 shadow-sm transition-all duration-300 hover:shadow-md focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRating: Number(e.target.value) }))}
                  className="w-full border rounded-xl px-4 py-2.5 bg-white shadow-sm transition-all duration-300 hover:shadow-md focus:border-orange-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4 Stars & Above</option>
                  <option value={3}>3 Stars & Above</option>
                  <option value={2}>2 Stars & Above</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full border rounded-xl px-4 py-2.5 bg-white shadow-sm transition-all duration-300 hover:shadow-md focus:border-orange-500"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                  className="h-5 w-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                />
                <label htmlFor="inStock" className="ml-2 text-gray-700">
                  In Stock Only
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full border rounded-xl px-4 py-2.5 bg-white shadow-sm transition-all duration-300 hover:shadow-md focus:border-orange-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-xl border border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
              >
                Clear Filters
              </Button>
              <Button 
                onClick={() => setShowFilters(false)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md transition-all duration-300 hover:shadow-lg"
              >
                Apply Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Results */}
        <div className="bg-white rounded-2xl shadow-sm p-6 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
              <span className="text-lg font-normal text-gray-600 ml-3">
                {filteredProducts.length} products found
              </span>
            </h1>
            
            {filteredProducts.length > 0 && (
              <div className="flex items-center">
                <span className="text-gray-600 mr-3">Sort:</span>
                <select
                  value={filters.sortBy}
                  
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="border rounded-xl px-4 py-2 bg-white shadow-sm transition-all duration-300 hover:shadow-md focus:border-orange-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-low">Price (Low to High)</option>
                  <option value="price-high">Price (High to Low)</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="p-5 rounded-2xl animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="animate-pulse bg-gray-200 h-48 mb-4 rounded-xl"></div>
                  <div className="animate-pulse bg-gray-200 h-5 mb-3 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-24 mb-3 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="product-card bg-white rounded-2xl overflow-hidden shadow-md animate-fade-in" 
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link href={`/product/${product.id}`}>
                    <div className="relative h-56 group">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge 
                          variant="secondary" 
                          className="bg-white text-orange-600 border border-orange-200 shadow-sm"
                        >
                          {product.brand}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-bold text-gray-800 mb-2 hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xl font-bold text
                      (2)}</p>
                      <div className="flex items-center">
                        <div className="rating-stars flex mr-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`star w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">({product.reviews})</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3">
                      <Badge 
                        variant="secondary" 
                        className="text-xs bg-gray-100 text-gray-700"
                      >
                        {product.category}
                      </Badge>
                      {product.stock > 0 ? (
                        <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    
                    <div 
                      className={`description-container ${expandedDescriptionId === product.id ? 'description-expanded' : 'description-collapsed'}`}
                    >
                      <p className="text-sm text-gray-600">
                        {product.description}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => toggleDescription(product.id)}
                      className="text-xs text-orange-500 mt-1 flex items-center"
                    >
                      {expandedDescriptionId === product.id ? (
                        <>
                          Show less <ChevronUp className="ml-1 w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Read more <ChevronDown className="ml-1 w-4 h-4" />
                        </>
                      )}
                    </button>
                  <Button 
                      className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow transition-all duration-300 hover:shadow-md"
                      disabled={product.stock === 0}
                    >
                      {product.stock > 0 ? 'Add to Cart' : 'Notify Me'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="no-results-card p-12 text-center rounded-2xl shadow-lg animate-fade-in">
              <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Search className="w-12 h-12 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No products found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We couldn't find any products matching your search. Try adjusting your search terms or filters.
              </p>
              <div className="flex justify-center gap-3">
                <Button 
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md transition-all duration-300 hover:shadow-lg"
                >
                  Clear all filters
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowFilters(true)}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300"
                >
                  Show Filters
                </Button>
              </div>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto p-4">
          <div className="h-12 bg-gray-200 rounded-xl w-3/4 mb-8 animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="rounded-2xl animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-2xl"></div>
                <CardContent className="p-5">
                  <div className="h-5 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
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
