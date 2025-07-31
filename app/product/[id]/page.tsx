"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { useToast } from "@/hooks/use-toast"
import { storeManager } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string | { id: number; name: string }
  description: string
  rating?: number
  reviews: number
  stock: number
}

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist, toggleWishlistItem } = useWishlist()
  const { toast } = useToast()
  const imageRef = useRef<HTMLDivElement>(null)

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    if (!params.id) return
    
    // Load product from localStorage if available
    const cachedProduct = localStorage.getItem(`product-${params.id}`)
    if (cachedProduct) {
      setProduct(JSON.parse(cachedProduct))
    }
    
    loadProduct()
  }, [params.id])

  useEffect(() => {
    if (product) {
      // Save product to localStorage for better refresh experience
      localStorage.setItem(`product-${product.id}`, JSON.stringify(product))
      loadRelatedProducts()
    }
  }, [product])

  const loadProduct = async () => {
    try {
      setLoading(true)
      const productData = await storeManager.getProduct(String(params.id))
      if (productData) {
        setProduct(productData as Product)
      } else {
        toast({
          title: "Product Not Found",
          description: "The product you're looking for doesn't exist.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedProducts = async () => {
    try {
      if (!product) return
      
      const allProducts = await storeManager.getProducts()

      const currentCategoryName = 
        typeof product.category === "string" ? product.category : product.category?.name

      if (!currentCategoryName) return

      let related = allProducts.filter(
        p => p.id !== product.id &&
          (typeof p.category === "string" 
            ? p.category === currentCategoryName 
            : p.category?.name === currentCategoryName)
      )

      // Fill with popular products if not enough in same category
      if (related.length < 4) {
        const others = allProducts
          .filter(p => p.id !== product.id)
          .sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        related = [...related, ...others].slice(0, 4)
      } else {
        related = related.slice(0, 4)
      }

      setRelatedProducts(related)
    } catch (error) {
      console.error("Error loading related products:", error)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity,
    })

    toast({
      title: "Added to Cart",
      description: `${quantity} × ${product.name} has been added to your cart.`,
    })
    
    // Animation for cart button
    const cartBtn = document.getElementById("add-to-cart-btn")
    if (cartBtn) {
      cartBtn.classList.add("animate-pulse")
      setTimeout(() => cartBtn.classList.remove("animate-pulse"), 500)
    }
  }

  const handleWishlistToggle = () => {
    if (!product) return

    toggleWishlistItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: typeof product.category === "string" 
        ? product.category 
        : product.category?.name || "Uncategorized"
    })

    const isInWishlistNow = isInWishlist(product.id)
    toast({
      title: isInWishlistNow ? "Added to Wishlist" : "Removed from Wishlist",
      description: `${product.name} has been ${isInWishlistNow ? "added to" : "removed from"} your wishlist.`,
    })
    
    // Animation for wishlist button
    const wishBtn = document.getElementById("wishlist-btn")
    if (wishBtn) {
      wishBtn.classList.add("animate-ping")
      setTimeout(() => wishBtn.classList.remove("animate-ping"), 500)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Skeleton with animation */}
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
          </div>
          
          {/* Details Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-24 mb-2 animate-pulse" />
            <Skeleton className="h-10 w-3/4 mb-4 animate-pulse" />
            <Skeleton className="h-6 w-1/3 mb-4 animate-pulse" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full animate-pulse" />
              <Skeleton className="h-4 w-4/5 animate-pulse" />
              <Skeleton className="h-4 w-3/4 animate-pulse" />
            </div>
            <Skeleton className="h-6 w-24 mb-6 animate-pulse" />
            
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-10 w-32 animate-pulse" />
              <Skeleton className="h-10 flex-1 animate-pulse" />
              <Skeleton className="h-10 w-10 animate-pulse" />
              <Skeleton className="h-10 w-10 animate-pulse" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 animate-pulse" />
                  <Skeleton className="h-4 w-20 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
        <Button 
          onClick={() => router.push("/")}
          className="transform transition-transform hover:scale-105"
        >
          Continue Shopping
        </Button>
      </div>
    )
  }

  const categoryName = typeof product.category === "string" 
    ? product.category 
    : product.category?.name || "Uncategorized"

  const FALLBACK_IMAGE = "/placeholder.svg"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image with animations */}
        <div 
          ref={imageRef}
          className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300"
        >
          <Image
            src={imageError ? FALLBACK_IMAGE : product.image || FALLBACK_IMAGE}
            alt={product.name}
            fill
            className={`object-contain p-8 transition-all duration-500 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onError={() => setImageError(true)}
            onLoadingComplete={() => {
              setImageLoaded(true)
              if (imageRef.current) {
                imageRef.current.classList.add("animate-pop-in")
                setTimeout(() => imageRef.current?.classList.remove("animate-pop-in"), 500)
              }
            }}
          />
          
          {/* Loading overlay */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
              <div className="bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer w-full h-full" />
            </div>
          )}
        </div>

        {/* Product Details with animations */}
        <div 
          className="space-y-6 transition-all duration-700 delay-150"
          style={{
            opacity: imageLoaded ? 1 : 0,
            transform: imageLoaded ? "translateY(0)" : "translateY(20px)"
          }}
        >
          <div>
            <Badge 
              variant="secondary" 
              className="mb-2 capitalize animate-bounce-in"
            >
              {categoryName}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {/* Rating with shimmer animation */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 transition-all duration-300 delay-${i * 100} ${
                      i < Math.floor(product.rating || 0)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.reviews.toLocaleString()} reviews
              </span>
            </div>

            <div className="text-3xl font-bold text-orange-600 mb-4 animate-pulse-once">
              ৳{product.price.toLocaleString()}
            </div>

            <p className="text-gray-700 mb-6 animate-fade-in">{product.description}</p>

            {/* Stock Status */}
            <div className="mb-6 animate-slide-up">
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {product.stock < 10 
                    ? `Low Stock (${product.stock} available)` 
                    : `In Stock (${product.stock} available)`}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-md shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 transition-all active:scale-95"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 transition-all active:scale-95"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <Button
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>

              <Button 
                id="wishlist-btn"
                variant="outline" 
                onClick={handleWishlistToggle}
                className="px-3 shadow-md hover:shadow-lg transition-all"
                aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart 
                  className={`w-5 h-5 transition-all ${
                    isInWishlist(product.id) 
                      ? "text-red-500 fill-current animate-heart-beat" 
                      : "text-gray-600"
                  }`} 
                />
              </Button>

              <Button 
                variant="outline" 
                className="px-3 shadow-md hover:shadow-lg transition-all"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up delay-300">
              <div className="flex items-center gap-2 text-sm text-gray-600 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                <Truck className="w-5 h-5 text-blue-500" />
                Free Delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                <Shield className="w-5 h-5 text-green-500" />
                1 Year Warranty
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                <RotateCcw className="w-5 h-5 text-purple-500" />
                30-Day Returns
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      {relatedProducts.length > 0 && (
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold mb-6">
            {relatedProducts.some(p => {
              const pCat = typeof p.category === "string" ? p.category : p.category?.name
              return pCat === categoryName
            })
              ? "More in " + categoryName
              : "You might also like"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => {
              const relatedCategory =
                typeof relatedProduct.category === "string"
                  ? relatedProduct.category
                  : relatedProduct.category?.name

              return (
                <Card
                  key={relatedProduct.id}
                  className="p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-gray-50">
                    <Image
                      src={relatedProduct.image || FALLBACK_IMAGE}
                      alt={relatedProduct.name}
                      fill
                      className="object-contain p-4 transition-all duration-500 hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = FALLBACK_IMAGE;
                      }}
                    />
                  </div>
                  <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-orange-600 transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-orange-600 font-semibold mb-2">
                    ৳{relatedProduct.price.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="text-xs">
                      {relatedCategory || "Uncategorized"}
                    </Badge>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-500 ml-1">
                        {relatedProduct.rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </div>
                  <Link href={`/product/${relatedProduct.id}`} className="block">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full transition-all hover:bg-orange-50 hover:border-orange-300"
                    >
                      View Details
                    </Button>
                  </Link>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes popIn {
          0% { transform: scale(0.95); opacity: 0; }
          70% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes pulseOnce {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        @keyframes heartBeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.2); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes bounceIn {
          0% { transform: translateY(-10px); opacity: 0; }
          60% { transform: translateY(5px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-pop-in {
          animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
          background: linear-gradient(to right, #f0f0f0 8%, #e0e0e0 18%, #f0f0f0 33%);
          background-size: 1000px 100%;
        }
        
        .animate-pulse-once {
          animation: pulseOnce 1s ease-in-out;
        }
        
        .animate-heart-beat {
          animation: heartBeat 0.5s ease-in-out;
        }
        
        .animate-bounce-in {
          animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .delay-150 {
          animation-delay: 150ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  )
}
