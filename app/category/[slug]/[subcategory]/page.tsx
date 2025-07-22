export const dynamic = 'force-dynamic'

// Show console logs & errors on screen (for debugging on phone)
if (typeof window !== "undefined") {
  const debugBox = document.createElement("div")
  debugBox.style.position = "fixed"
  debugBox.style.bottom = "0"
  debugBox.style.left = "0"
  debugBox.style.maxHeight = "40vh"
  debugBox.style.overflowY = "auto"
  debugBox.style.zIndex = "9999"
  debugBox.style.background = "#000"
  debugBox.style.color = "#0f0"
  debugBox.style.fontSize = "12px"
  debugBox.style.padding = "4px"
  debugBox.style.borderTopRightRadius = "6px"
  debugBox.style.width = "100%"
  document.body.appendChild(debugBox)

  const log = console.log
  const error = console.error

  console.log = function (...args) {
    log.apply(console, args)
    const msg = document.createElement("div")
    msg.textContent = "[LOG] " + args.join(" ")
    debugBox.appendChild(msg)
  }

  console.error = function (...args) {
    error.apply(console, args)
    const msg = document.createElement("div")
    msg.style.color = "#f55"
    msg.textContent = "[ERROR] " + args.join(" ")
    debugBox.appendChild(msg)
  }

  window.onerror = function (message, source, lineno, colno, err) {
    const msg = document.createElement("div")
    msg.style.color = "#f55"
    msg.textContent = `[ERROR] ${message} at ${source}:${lineno}:${colno}`
    debugBox.appendChild(msg)
  }
}

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Star, StarHalf } from "lucide-react"
import { pool } from "@/lib/database"

interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  rating?: number
  reviews: number
}

interface Subcategory {
  id: number
  name: string
  description: string
  slug: string
  category_id: number
}

interface Category {
  id: number
  name: string
  slug: string
}

// ⭐ Render stars for ratings
const renderStars = (rating: number) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
  }
  if (hasHalfStar) {
    stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
  }
  const emptyStars = 5 - stars.length
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
  }
  return stars
}

// 🚨 Safe wrapper to handle internal errors and logging
async function safeQuery<T>(query: string, params: any[]): Promise<T[]> {
  try {
    const result = await pool.query(query, params)
    return result.rows
  } catch (error) {
    console.error("❌ SQL Error:", error)
    throw error
  }
}

interface Props {
  params: {
    slug: string
    subcategory: string
  }
}

export default async function SubcategoryPage({ params }: Props) {
  try {
    const { slug, subcategory } = params
    console.log("📦 Params:", { slug, subcategory })

    const categoryRows = await safeQuery<Category>(
      'SELECT id, name, slug FROM categories WHERE slug = $1',
      [slug]
    )
    const category = categoryRows[0]
    if (!category) {
      console.warn("⚠️ Category not found:", slug)
      return notFound()
    }

    const subcatRows = await safeQuery<Subcategory>(
      'SELECT id, name, description, slug, category_id FROM subcategories WHERE slug = $1',
      [subcategory]
    )
    const subcat = subcatRows[0]
    if (!subcat || subcat.category_id !== category.id) {
      console.warn("⚠️ Subcategory not found or does not belong to category:", subcategory)
      return notFound()
    }

    const products = await safeQuery<Product>(
      'SELECT id, name, description, price, image, rating, reviews FROM products WHERE subcategory_id = $1',
      [subcat.id]
    )

    console.log(`✅ Loaded ${products.length} products for ${subcat.name}`)

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link href={`/category/${slug}`} className="hover:text-blue-600 capitalize">{category.name}</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">{subcat.name}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{subcat.name}</h1>
            <p className="text-gray-600 text-lg">{subcat.description}</p>
            <p className="text-sm text-gray-500 mt-2">{products.length} product(s) available</p>
          </div>

          {products.length === 0 ? (
            <div className="text-center text-gray-500">No products found in this subcategory.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <Link href={`/product/${product.id}`}>
                    <div className="aspect-square p-4">
                      <Image
                        src={product.image || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-full object-contain hover:scale-105 transition-transform"
                      />
                    </div>
                  </Link>
                  <div className="p-4 pt-0">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center space-x-1 mb-2">
                      {product.rating ? renderStars(product.rating) : <span className="text-gray-400">No rating</span>}
                      <span className="text-xs text-gray-500 ml-2">({product.reviews})</span>
                    </div>
                    <p className="text-lg font-semibold text-[#C7511F]">৳{product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("❌ Page crashed:", error)
    throw error
  }
      }
