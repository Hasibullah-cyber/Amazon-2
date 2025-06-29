"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Star, Package, Heart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "./wishlist-provider"
import { storeManager, type Product } from "@/lib/store"

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 199.99,
    stock: 50,
    category: "electronics",
    image: "/placeholder.svg?height=300&width=300",
    description: "Immersive sound quality with noise cancellation technology.",
    rating: 4.5,
    reviews: 128
  },
  {
    id: "2",
    name: "Designer Sunglasses",
    price: 79.99,
    stock: 30,
    category: "fashion",
    image: "/placeholder.svg?height=300&width=300",
    description: "Protect your eyes with style and elegance.",
    rating: 4.0,
    reviews: 85
  },
  {
    id: "3",
    name: "Scented Candle Set",
    price: 34.99,
    stock: 100,
    category: "home-living",
    image: "/placeholder.svg?height=300&width=300",
    description: "Set of 3 premium scented candles for a relaxing atmosphere.",
    rating: 4.7,
    reviews: 203
  },
  {
    id: "4",
    name: "Luxury Skincare Set",
    price: 129.99,
    stock: 25,
    category: "beauty",
    image: "/placeholder.svg?height=300&width=300",
    description: "Complete skincare routine with premium ingredients.",
    rating: 4.2,
    reviews: 156
  }
]

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>(sampleProducts)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()

  useEffect(() => {
    let isMounted = true

    const loadProducts = async () => {
      try {
        console.log('ProductsSection: Loading products...')
        setLoading(true)
        const productsData = await storeManager.getProducts()

        if (isMounted) {
          if (productsData && productsData.length > 0) {
            console.log('ProductsSection: Loaded', productsData.length, 'products from store')
            setProducts(productsData)
            setError(null)
          } else {
            console.log('ProductsSection: No products from store, using sample products')
            setProducts(sampleProducts)
            setError(null)
          }
        }
      } catch (error) {
        console.error('ProductsSection: Error loading products:', error)
        if (isMounted) {
          setProducts(sampleProducts)
          setError(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Subscribe to store updates for real-time data
    const unsubscribe = storeManager.subscribe((state) => {
      if (isMounted && state.products.length > 0) {
        console.log('ProductsSection: Store updated with', state.products.length, 'products')
        setProducts(state.products)
        setError(null)
      }
    })

    loadProducts()

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    })
  }

  const handleWishlistToggle = (product: Product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      })
    }
  }

  const productsToShow = products.length > 0 ? products.slice(0, 8) : sampleProducts.slice(0, 8)

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-black mb-4">Featured Products</h2>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover our handpicked selection of premium products that combine quality, style, and value.
          </p>
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {productsToShow.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.stock && product.stock < 10 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Low Stock
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.reviews || 0})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ৳{product.price.toFixed(2)}
                  </span>
                  {product.stock && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <Package className="h-4 w-4 mr-1" />
                      {product.stock} left
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/product/${product.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/category/all">
              View All Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}