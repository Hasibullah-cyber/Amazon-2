
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Star } from "lucide-react"
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
  rating?: number
  reviews?: number
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [compareProducts, setCompareProducts] = useState<Product[]>([])
  const [showAddProduct, setShowAddProduct] = useState(false)

  useEffect(() => {
    loadProducts()
    // Load from localStorage
    const saved = localStorage.getItem('compareProducts')
    if (saved) {
      setCompareProducts(JSON.parse(saved))
    }
  }, [])

  const loadProducts = async () => {
    try {
      const fetchedProducts = await storeManager.getProducts()
      setProducts(fetchedProducts)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const addToCompare = (product: Product) => {
    if (compareProducts.length >= 4) {
      alert('You can compare up to 4 products')
      return
    }
    
    if (compareProducts.find(p => p.id === product.id)) {
      alert('Product already in comparison')
      return
    }

    const newCompare = [...compareProducts, product]
    setCompareProducts(newCompare)
    localStorage.setItem('compareProducts', JSON.stringify(newCompare))
    setShowAddProduct(false)
  }

  const removeFromCompare = (productId: string) => {
    const newCompare = compareProducts.filter(p => p.id !== productId)
    setCompareProducts(newCompare)
    localStorage.setItem('compareProducts', JSON.stringify(newCompare))
  }

  const clearAll = () => {
    setCompareProducts([])
    localStorage.removeItem('compareProducts')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Product Comparison</h1>
          <div className="flex space-x-3">
            <Button 
              onClick={() => setShowAddProduct(true)}
              disabled={compareProducts.length >= 4}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            {compareProducts.length > 0 && (
              <Button variant="outline" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Select Product to Compare</h2>
                  <Button variant="ghost" onClick={() => setShowAddProduct(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter(p => !compareProducts.find(cp => cp.id === p.id))
                    .map(product => (
                    <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="aspect-square relative mb-3">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3 className="font-semibold mb-2">{product.name}</h3>
                      <p className="text-lg font-bold text-blue-600 mb-3">৳{product.price}</p>
                      <Button 
                        onClick={() => addToCompare(product)}
                        className="w-full"
                        size="sm"
                      >
                        Add to Compare
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Comparison Table */}
        {compareProducts.length > 0 ? (
          <Card className="overflow-x-auto">
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {compareProducts.map(product => (
                  <div key={product.id} className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-0 right-0 z-10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    
                    <div className="text-center">
                      <div className="aspect-square relative mb-4 mx-auto w-48">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      
                      <h3 className="font-bold mb-2">{product.name}</h3>
                      <p className="text-2xl font-bold text-blue-600 mb-3">৳{product.price}</p>
                      
                      <div className="space-y-3 text-left">
                        <div>
                          <span className="font-medium">Category:</span>
                          <Badge variant="secondary" className="ml-2">
                            {product.category}
                          </Badge>
                        </div>
                        
                        <div>
                          <span className="font-medium">Description:</span>
                          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        </div>
                        
                        {product.rating && (
                          <div>
                            <span className="font-medium">Rating:</span>
                            <div className="flex items-center mt-1">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= product.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-gray-600">
                                ({product.reviews || 0} reviews)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 space-y-2">
                        <Link href={`/product/${product.id}`}>
                          <Button className="w-full">View Details</Button>
                        </Link>
                        <Button variant="outline" className="w-full">
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-4">No products to compare</h2>
            <p className="text-gray-600 mb-6">
              Add products to start comparing their features and prices.
            </p>
            <Button onClick={() => setShowAddProduct(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
