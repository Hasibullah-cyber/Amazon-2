"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/components/cart-provider"
import TaxInfo from "@/components/tax-info"
import { useToast } from "@/hooks/use-toast"
import { Star, StarHalf } from "lucide-react"

export default function ProductsSection() {
  const [products, setProducts] = useState<any[]>([])
  const { addToCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        
        if (response.ok && isMounted) {
          const productsData = await response.json()
          if (Array.isArray(productsData) && productsData.length > 0) {
            setProducts(productsData)
            setError(null)
          } else {
            setProducts(sampleProducts)
            setError(null)
          }
        } else if (isMounted) {
          setProducts(sampleProducts)
          setError(null)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
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

    fetchProducts()
    
    return () => {
      isMounted = false
    }
  }, [])

  // Sample product data (fallback)
  const sampleProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    description: "Immersive sound quality with noise cancellation technology.",
    price: 199.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "electronics",
    rating: 4.5,
    reviews: 128,
  },
  {
    id: 2,
    name: "Designer Sunglasses",
    description: "Protect your eyes with style and elegance.",
    price: 79.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "fashion",
    rating: 4.0,
    reviews: 85,
  },
  {
    id: 3,
    name: "Scented Candle Set",
    description: "Set of 3 premium scented candles for a relaxing atmosphere.",
    price: 34.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "home-living",
    rating: 4.7,
    reviews: 203,
  },
  {
    id: 4,
    name: "Luxury Skincare Set",
    description: "Complete skincare routine with premium ingredients.",
    price: 129.99,
    image: "/placeholder.svg?height=300&width=300",
    category: "beauty",
    rating: 4.2,
    reviews: 156,
  },
]



  const { toast } = useToast()

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    })
  }

  // Function to render star ratings
  const renderRating = (rating: number, product: any) => {
    // Validate and sanitize rating value
    const validRating = typeof rating === 'number' && !isNaN(rating) && rating >= 0 ? rating : 0
    const clampedRating = Math.min(Math.max(validRating, 0), 5) // Clamp between 0 and 5

    const fullStars = Math.floor(clampedRating)
    const hasHalfStar = clampedRating % 1 >= 0.5

    return (
      <div className="flex items-center">
        {fullStars > 0 && [...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-[#FFA41C] text-[#FFA41C]" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-[#FFA41C] text-[#FFA41C]" />}
        <span className="ml-1 text-sm amazon-link">
          {clampedRating.toFixed(1)} ({product.reviews || 0})
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <section id="products" className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="amazon-title text-2xl mb-4">Featured Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="amazon-card animate-pulse">
                <div className="aspect-square bg-gray-200 mb-3"></div>
                <div className="h-4 bg-gray-200 mb-2"></div>
                <div className="h-3 bg-gray-200 mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 mb-2 w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const productsToShow = products.length > 0 ? products : sampleProducts


  return (
    <section id="products" className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="amazon-title text-2xl mb-4">Featured Products</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productsToShow.slice(0, 8).map((product) => {
            if (!product || !product.id) return null
            
            return (
              <div key={product.id} className="amazon-card">
                <Link href={`/product/${product.id}`} className="block">
                  <div className="aspect-square relative mb-3">
                    <Image 
                      src={product.image || "/placeholder.svg"} 
                      alt={product.name || "Product"} 
                      fill 
                      className="object-contain"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  </div>
                  <h3 className="text-base line-clamp-2 mb-1 hover:text-[#C7511F]">
                    {product.name || "Product Name"}
                  </h3>
                </Link>

                {renderRating(product.rating || 0, product)}

                <div className="mt-2">
                  <span className="amazon-price text-lg">
                    ৳{(product.price || 0).toFixed(2)}
                  </span>
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <span>Includes 10% VAT</span>
                    <span className="mx-1">•</span>
                    <TaxInfo />
                  </div>
                </div>

                <div className="mt-3">
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className="amazon-button w-full py-1 text-sm"
                    disabled={!product.name}
                  >
                    Add to Cart
                  </button>
                </div>

                <div className="mt-2 text-xs">
                  <span className="text-[#007600]">In Stock</span>
                  <div className="mt-1">
                    <span>Ships to Bangladesh</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-4 amazon-card p-4">
            <h3 className="amazon-title text-lg mb-3">Explore our full range of products by category</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/category/electronics" className="amazon-button-secondary px-4 py-2 text-sm">
                Electronics
              </Link>
              <Link href="/category/fashion" className="amazon-button-secondary px-4 py-2 text-sm">
                Fashion
              </Link>
              <Link href="/category/home-living" className="amazon-button-secondary px-4 py-2 text-sm">
                Home & Living
              </Link>
              <Link href="/category/beauty" className="amazon-button-secondary px-4 py-2 text-sm">
                Beauty & Personal Care
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}