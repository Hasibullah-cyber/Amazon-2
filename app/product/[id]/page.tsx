"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Star, Package, Truck, Shield, ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { useToast } from "@/hooks/use-toast"
import { storeManager, type Product } from "@/lib/store"

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 199.99,
    stock: 50,
    category: "electronics",
    image: "/placeholder.svg?height=300&width=300",
    description: "Immersive sound quality with noise cancellation technology. Experience premium audio with these wireless headphones featuring active noise cancellation, 30-hour battery life, and crystal-clear sound quality.",
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
    description: "Protect your eyes with style and elegance. These designer sunglasses feature UV protection, durable frames, and a timeless design that complements any outfit.",
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
    description: "Set of 3 premium scented candles for a relaxing atmosphere. Made with natural soy wax and essential oils, these candles provide 40+ hours of burn time each.",
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
    description: "Complete skincare routine with premium ingredients. This set includes cleanser, toner, serum, and moisturizer, all formulated with organic ingredients for healthy, glowing skin.",
    rating: 4.2,
    reviews: 156
  }
]

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [productId, setProductId] = useState<string>("")
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const resolvedParams = await params
        setProductId(resolvedParams.id)
        const products = await storeManager.getProducts()
        const foundProduct = products.find(p => p.id === resolvedParams.id)

        if (foundProduct) {
          setProduct(foundProduct)
        } else {
          // Fallback to sample products
          const sampleProduct = sampleProducts.find(p => p.id === resolvedParams.id)
          setProduct(sampleProduct || null)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        const resolvedParams = await params
        const sampleProduct = sampleProducts.find(p => p.id === resolvedParams.id)
        setProduct(sampleProduct || null)
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [params])

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: quantity
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleWishlistToggle = () => {
    if (!product) return

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category
      })
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading product...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden rounded-lg bg-white">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.stock && product.stock < 10 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm">
                Only {product.stock} left!
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {product.rating} ({product.reviews || 0} reviews)
                </span>
              </div>
            </div>

            <div className="text-3xl font-bold text-blue-600">
              ৳{product.price.toFixed(2)}
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock Info */}
            {product.stock && (
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-2" />
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="flex space-x-4">
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 amazon-button"
                  disabled={!product.stock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleWishlistToggle}
                  className={`px-4 ${isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}`}
                >
                  <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  disabled={!product.stock}
                >
                  Buy Now
                </Button>
              </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <div className="font-medium">Free Shipping</div>
                  <div>On orders over ৳5,000</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <div className="font-medium">Warranty</div>
                  <div>1 year guarantee</div>
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                <div>
                  <div className="font-medium">Easy Returns</div>
                  <div>30-day return policy</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {sampleProducts
              .filter(p => p.id !== product.id && p.category === product.category)
              .slice(0, 4)
              .map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/product/${relatedProduct.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <div className="p-3">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">
                        {relatedProduct.name}
                      </h3>
                      <div className="text-blue-600 font-bold">
                        ৳{relatedProduct.price.toFixed(2)}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
          </div>
        </Card>
      </div>
    </div>
  )
}