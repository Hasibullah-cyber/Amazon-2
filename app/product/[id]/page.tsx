"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from "lucide-react"
import { useCart } from "@/components/cart-provider"
import { useWishlist } from "@/components/wishlist-provider"
import { useToast } from "@/hooks/use-toast"
import { storeManager } from "@/lib/store"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
  rating: number
  reviews: number
  stock: number
}

export default function ProductPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const { addToWishlist } = useWishlist()
  const { toast } = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProduct()
    loadRelatedProducts()
  }, [params.id])

  const loadProduct = async () => {
    try {
      const productData = await storeManager.getProduct(params.id as string)
      if (productData) {
        setProduct(productData as Product)
      }
    } catch (error) {
      console.error('Error loading product:', error)
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
      const allProducts = await storeManager.getProducts()
      const related = allProducts
        .filter(p => p.id !== params.id && p.category === product?.category)
        .slice(0, 4)
      setRelatedProducts(related as Product[])
    } catch (error) {
      console.error('Error loading related products:', error)
    }
  }

  const handleAddToCart = () => {
    if (!product) return

    addToCart({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    })

    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleAddToWishlist = () => {
    if (!product) return

    addToWishlist({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      image: product.image
    })

    toast({
      title: "Added to Wishlist",
      description: `${product.name} has been added to your wishlist.`,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 aspect-square rounded-lg"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded"></div>
              <div className="bg-gray-200 h-6 rounded w-1/3"></div>
              <div className="bg-gray-200 h-4 rounded"></div>
              <div className="bg-gray-200 h-20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600">The product you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div className="aspect-square relative bg-gray-50 rounded-lg overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-8"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2 capitalize">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <div className="text-3xl font-bold text-orange-600 mb-4">
              ৳{product.price.toLocaleString()}
            </div>

            <p className="text-gray-700 mb-6">
              {product.description}
            </p>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  In Stock ({product.stock} available)
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-3 py-2 hover:bg-gray-50"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-[#febd69] hover:bg-[#f3a847] text-black"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>

              <Button
                variant="outline"
                onClick={handleAddToWishlist}
                className="px-3"
              >
                <Heart className="w-4 h-4" />
              </Button>

              <Button variant="outline" className="px-3">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4" />
                Free Delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4" />
                1 Year Warranty
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4" />
                Easy Returns
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Card key={relatedProduct.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="aspect-square relative mb-3">
                  <Image
                    src={relatedProduct.image || "/placeholder.svg"}
                    alt={relatedProduct.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-medium text-sm mb-2 line-clamp-2">
                  {relatedProduct.name}
                </h3>
                <p className="text-orange-600 font-semibold">
                  ৳{relatedProduct.price.toLocaleString()}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => window.location.href = `/product/${relatedProduct.id}`}
                >
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}