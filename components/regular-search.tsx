
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

  const applyFilters = () => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filters.category || product.category === filters.category
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice
      
      return matchesSearch && matchesCategory && matchesPrice
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 amazon-input"
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
