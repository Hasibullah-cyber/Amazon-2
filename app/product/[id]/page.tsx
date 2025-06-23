import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Star, StarHalf, ChevronRight } from "lucide-react"
import TaxInfo from "@/components/tax-info"
import AddToCartButton from "./add-to-cart"

// Sample product database
const products = {
  // Electronics
  "101": {
    id: 101,
    name: "Premium Wireless Headphones",
    description: "Immersive sound quality with noise cancellation technology.",
    price: 199.99,
    image: "/placeholder.svg?height=600&width=600",
    category: "electronics",
    rating: 4.5,
    reviews: 128,
    features: [
      "Active Noise Cancellation",
      "40-hour battery life",
      "Bluetooth 5.0 connectivity",
      "Built-in microphone for calls",
      "Comfortable over-ear design",
      "Foldable design for easy storage",
    ],
    specifications: {
      Brand: "Hasib Audio",
      Model: "HA-500",
      Color: "Matte Black",
      Connectivity: "Bluetooth 5.0, 3.5mm audio jack",
      "Battery Life": "Up to 40 hours",
      "Charging Time": "2 hours",
      Weight: "250g",
      Warranty: "1 year manufacturer warranty",
    },
    stock: 15,
    relatedProducts: [102, 105, 106],
  },
  "102": {
    id: 102,
    name: "Smart Fitness Watch",
    description: "Track your health metrics and stay connected on the go.",
    price: 149.99,
    image: "/placeholder.svg?height=600&width=600",
    category: "electronics",
    rating: 4.2,
    reviews: 95,
    features: [
      "Heart rate monitoring",
      "Sleep tracking",
      "Water resistant (50m)",
      "GPS tracking",
      "7-day battery life",
      "Smartphone notifications",
    ],
    specifications: {
      Brand: "Hasib Tech",
      Model: "HT-100",
      Display: '1.4" AMOLED',
      Battery: "300mAh",
      "Water Resistance": "5 ATM",
      Sensors: "Heart rate, Accelerometer, Gyroscope",
      Compatibility: "iOS 12+, Android 8.0+",
      Warranty: "1 year manufacturer warranty",
    },
    stock: 22,
    relatedProducts: [101, 104, 105],
  },
  // Fashion
  "201": {
    id: 201,
    name: "Designer Sunglasses",
    description: "Protect your eyes with style and elegance.",
    price: 79.99,
    image: "/placeholder.svg?height=600&width=600",
    category: "fashion",
    rating: 4.0,
    reviews: 85,
    features: [
      "100% UV protection",
      "Polarized lenses",
      "Lightweight frame",
      "Scratch-resistant coating",
      "Includes protective case",
      "Adjustable nose pads",
    ],
    specifications: {
      Brand: "Hasib Fashion",
      Model: "HF-200",
      "Frame Material": "Acetate",
      "Lens Material": "Polycarbonate",
      "UV Protection": "100%",
      "Frame Width": "140mm",
      Weight: "28g",
      Warranty: "6 months manufacturer warranty",
    },
    stock: 23,
    relatedProducts: [202, 203, 204],
  },
  // Home & Living
  "301": {
    id: 301,
    name: "Scented Candle Set",
    description: "Set of 3 premium scented candles for a relaxing atmosphere.",
    price: 34.99,
    image: "/placeholder.svg?height=600&width=600",
    category: "home-living",
    rating: 4.7,
    reviews: 203,
    features: [
      "Set of 3 different scents",
      "100% soy wax",
      "Cotton wicks for clean burning",
      "30-hour burn time per candle",
      "Reusable glass containers",
      "Handcrafted in small batches",
    ],
    specifications: {
      Brand: "Hasib Home",
      Scents: "Lavender, Vanilla, Sandalwood",
      Material: "100% Soy Wax",
      "Burn Time": "30 hours per candle",
      Container: "Frosted glass",
      Dimensions: '3" x 3" x 3.5" each',
      Weight: "8oz each",
      "Made in": "Bangladesh",
    },
    stock: 42,
    relatedProducts: [302, 305, 306],
  },
  // Beauty
  "401": {
    id: 401,
    name: "Luxury Skincare Set",
    description: "Complete skincare routine with premium ingredients.",
    price: 129.99,
    image: "/placeholder.svg?height=600&width=600",
    category: "beauty",
    rating: 4.6,
    reviews: 178,
    features: [
      "5-piece skincare set",
      "Natural and organic ingredients",
      "Suitable for all skin types",
      "Cruelty-free and vegan",
      "Free from parabens and sulfates",
      "Dermatologically tested",
    ],
    specifications: {
      Brand: "Hasib Beauty",
      Contents: "Cleanser, Toner, Serum, Moisturizer, Eye Cream",
      "Skin Type": "All skin types",
      Volume: "Varies by product",
      Ingredients: "Natural and organic",
      "Shelf Life": "12 months after opening",
      Storage: "Store in a cool, dry place",
      "Made in": "Bangladesh",
    },
    stock: 18,
    relatedProducts: [402, 404, 405],
  },
}

// Function to render star ratings
const renderRating = (rating: number) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-[#FFA41C] text-[#FFA41C]" />
      ))}
      {hasHalfStar && <StarHalf className="h-5 w-5 fill-[#FFA41C] text-[#FFA41C]" />}
    </div>
  )
}

// Function to get related products
const getRelatedProducts = (relatedIds: number[]) => {
  return relatedIds.map((id) => products[String(id) as keyof typeof products]).filter(Boolean)
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products[id as keyof typeof products]

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product.relatedProducts || [])

  return (
    <div className="bg-gray-100 min-h-screen py-4">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-4">
          <Link href="/" className="text-[#565959] hover:text-[#C7511F] hover:underline">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <Link href={`/category/${product.category}`} className="text-[#565959] hover:text-[#C7511F] hover:underline">
            {product.category.charAt(0).toUpperCase() + product.category.slice(1).replace("-", " ")}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <span className="text-[#565959] truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Product details */}
        <div className="bg-white p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product image */}
            <div className="md:col-span-1">
              <div className="sticky top-20">
                <div className="aspect-square relative mb-4 border border-gray-200">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
                </div>
              </div>
            </div>

            {/* Product info */}
            <div className="md:col-span-2">
              <h1 className="text-xl md:text-2xl font-medium text-black mb-1">{product.name}</h1>

              <div className="flex items-center mb-2">
                {renderRating(product.rating)}
                <span className="ml-2 text-sm amazon-link">{product.reviews} ratings</span>
              </div>

              <div className="border-b border-gray-200 pb-4 mb-4">
                <div className="text-2xl amazon-price">৳{product.price.toFixed(2)}</div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <span>Includes 10% VAT</span>
                  <span className="mx-1">•</span>
                  <TaxInfo />
                </div>
              </div>

              {/* Product description */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-black mb-2">About this item</h2>
                <p className="text-gray-700 mb-4">{product.description}</p>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>

              {/* Stock status */}
              <div className="mb-6">
                <span className="text-[#007600] font-medium">
                  {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
                </span>
              </div>

              {/* Add to cart */}
              <div className="mb-6">
                <AddToCartButton product={product} />
              </div>

              {/* Delivery info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm">
                  <p className="mb-1">
                    <span className="font-medium">Ships to:</span> Bangladesh
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Delivery:</span> 2-4 business days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product specifications */}
        <div className="bg-white p-4 mb-4">
          <h2 className="text-xl font-medium text-black mb-4">Product Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(product.specifications).map(([key, value]) => (
              <div key={key} className="flex border-b border-gray-100 pb-2">
                <span className="font-medium w-1/3">{key}:</span>
                <span className="text-gray-700 w-2/3">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer reviews */}
        <div className="bg-white p-4 mb-4">
          <h2 className="text-xl font-medium text-black mb-4">Customer Reviews</h2>
          <div className="flex items-center mb-4">
            <div className="flex items-center">{renderRating(product.rating)}</div>
            <span className="ml-2 text-lg font-medium">{product.rating} out of 5</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{product.reviews} global ratings</p>

          {/* Sample reviews */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center mb-2">
                {renderRating(5)}
                <span className="ml-2 font-medium">Great product!</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Reviewed in Bangladesh on June 1, 2025</p>
              <p className="text-gray-700">
                This product exceeded my expectations. The quality is excellent and it works perfectly. Highly
                recommended!
              </p>
            </div>
            <div className="border-b border-gray-200 pb-4">
              <div className="flex items-center mb-2">
                {renderRating(4)}
                <span className="ml-2 font-medium">Good value for money</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Reviewed in Bangladesh on May 15, 2025</p>
              <p className="text-gray-700">
                I'm happy with my purchase. The product is well-made and performs as advertised. The only reason I'm not
                giving 5 stars is because the delivery took longer than expected.
              </p>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white p-4">
            <h2 className="text-xl font-medium text-black mb-4">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <Link href={`/product/${relatedProduct.id}`} key={relatedProduct.id} className="block">
                  <div className="border border-gray-200 p-3 hover:shadow-md transition-shadow">
                    <div className="aspect-square relative mb-2">
                      <Image
                        src={relatedProduct.image || "/placeholder.svg"}
                        alt={relatedProduct.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-sm line-clamp-2 hover:text-[#C7511F]">{relatedProduct.name}</h3>
                    <div className="flex items-center mt-1">
                      {renderRating(relatedProduct.rating)}
                      <span className="ml-1 text-xs text-gray-500">({relatedProduct.reviews})</span>
                    </div>
                    <div className="mt-1 amazon-price">৳{(relatedProduct.price * 110).toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
      }