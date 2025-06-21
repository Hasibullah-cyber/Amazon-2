import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import TaxInfo from "@/components/tax-info"
import AddToCartButton from "../add-to-cart"
import { Star, StarHalf, ChevronRight } from "lucide-react"

// Enhanced product database with more realistic products
const subcategoryProducts = {
  // Electronics subcategories
  "mobile-phones": {
    name: "Mobile Phones",
    description: "Latest smartphones and mobile devices",
    products: [
      {
        id: 1001,
        name: "iPhone 15 Pro Max",
        description: "Latest Apple smartphone with advanced camera system",
        price: 1299.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.8,
        reviews: 245,
      },
      {
        id: 1002,
        name: "Samsung Galaxy S24 Ultra",
        description: "Premium Android phone with S Pen",
        price: 1199.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 189,
      },
      {
        id: 1003,
        name: "Google Pixel 8 Pro",
        description: "AI-powered photography smartphone",
        price: 899.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 156,
      },
    ],
  },
  headphones: {
    name: "Headphones & Earphones",
    description: "Premium audio headphones for music lovers",
    products: [
      {
        id: 1004,
        name: "Sony WH-1000XM5",
        description: "Industry-leading noise canceling headphones",
        price: 399.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 312,
      },
      {
        id: 1005,
        name: "Bose QuietComfort 45",
        description: "Comfortable noise canceling headphones",
        price: 329.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 278,
      },
    ],
  },
  // Beauty subcategories with specific products
  "face-creams": {
    name: "Face Creams & Moisturizers",
    description: "Skincare essentials for healthy, glowing skin",
    products: [
      {
        id: 4001,
        name: "Fair & Lovely Advanced Multi Vitamin Face Cream",
        description: "Brightening face cream with vitamins for radiant skin",
        price: 12.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.3,
        reviews: 1247,
      },
      {
        id: 4002,
        name: "Pond's Age Miracle Day Cream",
        description: "Anti-aging day cream with retinol-C complex",
        price: 15.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.4,
        reviews: 892,
      },
      {
        id: 4003,
        name: "Olay Regenerist Micro-Sculpting Cream",
        description: "Advanced anti-aging moisturizer",
        price: 24.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 634,
      },
      {
        id: 4004,
        name: "Nivea Soft Light Moisturizing Cream",
        description: "Daily moisturizing cream for all skin types",
        price: 8.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.2,
        reviews: 1156,
      },
    ],
  },
  blush: {
    name: "Blush & Highlighters",
    description: "Natural and vibrant blush colors",
    products: [
      {
        id: 4005,
        name: "Peachy Pink Blush",
        description: "Natural peachy pink blush for everyday wear",
        price: 24.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 167,
      },
      {
        id: 4006,
        name: "Rose Gold Highlighter Blush",
        description: "Shimmery rose gold blush with highlighting effect",
        price: 29.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 203,
      },
    ],
  },
  "eye-makeup": {
    name: "Eye Makeup",
    description: "Eye makeup essentials and accessories",
    products: [
      {
        id: 4007,
        name: "Waterproof Mascara",
        description: "Long-lasting waterproof mascara for dramatic lashes",
        price: 19.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.4,
        reviews: 289,
      },
      {
        id: 4008,
        name: "Eyeshadow Palette",
        description: "12-color eyeshadow palette with matte and shimmer shades",
        price: 34.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        reviews: 345,
      },
    ],
  },
  // Fashion subcategories
  sarees: {
    name: "Sarees",
    description: "Traditional and designer sarees",
    products: [
      {
        id: 2001,
        name: "Silk Banarasi Saree",
        description: "Handwoven silk saree with golden border",
        price: 149.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.4,
        reviews: 156,
      },
      {
        id: 2002,
        name: "Cotton Handloom Saree",
        description: "Comfortable cotton saree for daily wear",
        price: 79.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.2,
        reviews: 98,
      },
    ],
  },
  // Home & Living subcategories
  candles: {
    name: "Candles & Aromatherapy",
    description: "Scented candles and aromatherapy products",
    products: [
      {
        id: 3001,
        name: "Lavender Aromatherapy Candle",
        description: "Relaxing lavender scented candle for stress relief",
        price: 19.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.6,
        reviews: 234,
      },
      {
        id: 3002,
        name: "Vanilla Bean Candle Set",
        description: "Set of 3 vanilla scented candles in glass jars",
        price: 34.99,
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        reviews: 178,
      },
    ],
  },
}

// Function to render star ratings
const renderRating = (rating: number) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-[#FFA41C] text-[#FFA41C]" />
      ))}
      {hasHalfStar && <StarHalf className="h-4 w-4 fill-[#FFA41C] text-[#FFA41C]" />}
    </div>
  )
}

export default async function SubcategoryPage({ params }: { params: { slug: string; subcategory: string } }) {
  const { slug, subcategory } = await params
  const subcategoryData = subcategoryProducts[subcategory as keyof typeof subcategoryProducts]

  if (!subcategoryData) {
    notFound()
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-4">
          <Link href="/" className="text-[#565959] hover:text-[#C7511F] hover:underline">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <Link href={`/category/${slug}`} className="text-[#565959] hover:text-[#C7511F] hover:underline">
            {slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " ")}
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <span className="font-medium">{subcategoryData.name}</span>
        </div>

        {/* Category Header */}
        <div className="bg-white p-4 mb-4">
          <h1 className="text-2xl font-medium text-black mb-2">{subcategoryData.name}</h1>
          <p className="text-sm text-gray-700">{subcategoryData.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filters sidebar */}
          <div className="hidden md:block">
            <div className="bg-white p-4 mb-4">
              <h2 className="text-lg font-medium text-black mb-3">Department</h2>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/category/electronics" className="amazon-link">
                    Electronics
                  </Link>
                </li>
                <li>
                  <Link href="/category/fashion" className="amazon-link">
                    Fashion
                  </Link>
                </li>
                <li>
                  <Link href="/category/home-living" className="amazon-link">
                    Home & Living
                  </Link>
                </li>
                <li>
                  <Link href="/category/beauty" className="amazon-link">
                    Beauty & Personal Care
                  </Link>
                </li>
              </ul>
            </div>

            <div className="bg-white p-4">
              <h2 className="text-lg font-medium text-black mb-3">Price Range</h2>
              <ul className="space-y-2 text-sm">
                <li className="amazon-link cursor-pointer">Under ৳500</li>
                <li className="amazon-link cursor-pointer">৳500 - ৳1,000</li>
                <li className="amazon-link cursor-pointer">৳1,000 - ৳5,000</li>
                <li className="amazon-link cursor-pointer">Over ৳5,000</li>
              </ul>
            </div>
          </div>

          {/* Products grid */}
          <div className="md:col-span-3">
            <div className="bg-white p-4 mb-4 flex justify-between items-center">
              <span className="text-sm">
                {subcategoryData.products.length} results for{" "}
                <span className="font-medium">{subcategoryData.name}</span>
              </span>
              <select className="text-sm border border-gray-300 rounded-md p-1">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Customer Reviews</option>
                <option>Newest Arrivals</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcategoryData.products.map((product) => (
                <div key={product.id} className="bg-white p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="aspect-square relative mb-3">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <h3 className="text-base line-clamp-2 mb-1 hover:text-[#C7511F]">{product.name}</h3>
                  </Link>

                  <div className="flex items-center mb-2">
                    {renderRating(product.rating)}
                    <span className="ml-1 text-sm amazon-link">({product.reviews})</span>
                  </div>

                  <div className="mt-2">
                    <span className="amazon-price text-lg">৳{(product.price * 110).toFixed(2)}</span>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <span>Includes 10% VAT</span>
                      <span className="mx-1">•</span>
                      <TaxInfo />
                    </div>
                  </div>

                  <div className="mt-3">
                    <AddToCartButton product={product} />
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
          </div>
        </div>
      </div>
    </div>
  )
}
