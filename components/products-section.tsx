"use client"
import { useCart } from "@/components/cart-provider"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import TaxInfo from "@/components/tax-info"
import Link from "next/link"
import { Star, StarHalf } from "lucide-react"

// Sample product data
const featuredProducts = [
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

export default function ProductsSection() {
  const { addToCart } = useCart()
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
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-[#FFA41C] text-[#FFA41C]" />
        ))}
        {hasHalfStar && <StarHalf className="h-4 w-4 fill-[#FFA41C] text-[#FFA41C]" />}
        <span className="ml-1 text-sm amazon-link">
          {rating} ({product.reviews})
        </span>
      </div>
    )
  }

  return (
    <section id="products" className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="amazon-title text-2xl mb-4">Featured Products</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <div key={product.id} className="amazon-card">
              <Link href={`/product/${product.id}`} className="block">
                <div className="aspect-square relative mb-3">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
                </div>
                <h3 className="text-base line-clamp-2 mb-1 hover:text-[#C7511F]">{product.name}</h3>
              </Link>

              {renderRating(product.rating, product)}

              <div className="mt-2">
                <span className="amazon-price text-lg">৳{(product.price * 110).toFixed(2)}</span>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <span>Includes 10% VAT</span>
                  <span className="mx-1">•</span>
                  <TaxInfo />
                </div>
              </div>

              <div className="mt-3">
                <button onClick={() => handleAddToCart(product)} className="amazon-button w-full py-1 text-sm">
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
          ))}
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
