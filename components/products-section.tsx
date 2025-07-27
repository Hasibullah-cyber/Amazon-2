"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Star, Package, Heart } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "./wishlist-provider"
import { storeManager, type Product } from "@/lib/store"
import Image from "next/image"

// Placeholder image URL
const FALLBACK_IMAGE = "/placeholder.svg?height=300&width=300"

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 199.99,
    stock: 50,
    category: "electronics",
    image: "/headphones.jpg",
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
    image: "/sunglasses.jpg",
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
    image: "/candles.jpg",
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
    image: "/skincare.jpg",
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
    const loadProducts = async () => {
      try {
        setLoading(true)
        const allProducts = await storeManager.getProducts()
        
        if (allProducts && allProducts.length > 0) {
          setProducts(allProducts)
        } else {
          setProducts(sampleProducts)
        }
      } catch (error) {
        console.error('Error loading products:', error)
        setError('Failed to load products. Showing sample products instead.')
        setProducts(sampleProducts)
      } finally {
        setLoading(false)
      }
    }

    const unsubscribe = storeManager.subscribe((state) => {
      if (state.products && state.products.length > 0) {
        setProducts(state.products)
      }
    })

    loadProducts()

    return () => {
      unsubscribe()
    }
  }, [])

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || FALLBACK_IMAGE,
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
        image: product.image || FALLBACK_IMAGE,
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="group hover:shadow-lg transition-shadow duration-300">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-200 animate-pulse" />
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-full"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded mb-3 w-full"></div>
                  </div>
                </Card>
              ))}
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
                <Image
                  src={product.image || FALLBACK_IMAGE}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = FALLBACK_IMAGE;
                  }}
                />
                {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                    Low Stock
                  </div>
                )}
                <button
                  onClick={() => handleWishlistToggle(product)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                  aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart 
                    className={`h-5 w-5 ${isInWishlist(product.id) ? "text-red-500 fill-current" : "text-gray-600"}`} 
                  />
                </button>
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
                    ({product.reviews?.toLocaleString() || 0})
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">
                    ৳{product.price.toFixed(2)}
                  </span>
                  {product.stock !== undefined && (
                    <span className={`text-sm flex items-center ${
                      product.stock === 0 
                        ? "text-red-500" 
                        : product.stock < 10 
                          ? "text-orange-500" 
                          : "text-gray-500"
                    }`}>
                      <Package className="h-4 w-4 mr-1" />
                      {product.stock === 0 ? 'Out of stock' : `${product.stock} left`}
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
