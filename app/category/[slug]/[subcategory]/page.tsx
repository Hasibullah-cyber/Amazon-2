export const dynamic = 'force-dynamic'

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

// Helper to render stars based on rating
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

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await pool.query('SELECT id, name, slug FROM categories WHERE slug = $1', [slug])
  return result.rows[0] || null
}

async function getSubcategoryBySlug(slug: string): Promise<Subcategory | null> {
  const result = await pool.query('SELECT id, name, description, slug, category_id FROM subcategories WHERE slug = $1', [slug])
  return result.rows[0] || null
}

async function getProductsBySubcategoryId(subcategoryId: number): Promise<Product[]> {
  const result = await pool.query(
    'SELECT id, name, description, price, image, rating, reviews FROM products WHERE subcategory_id = $1',
    [subcategoryId]
  )
  return result.rows
}

interface Props {
  params: {
    slug: string
    subcategory: string
  }
}

export default async function SubcategoryPage({ params }: Props) {
  const { slug, subcategory } = params

  const category = await getCategoryBySlug(slug)
  if (!category) {
    notFound()
  }

  const subcat = await getSubcategoryBySlug(subcategory)
  if (!subcat || subcat.category_id !== category.id) {
    notFound()
  }

  const products = await getProductsBySubcategoryId(subcat.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{subcat.name}</h1>
          <p className="text-gray-600 text-lg">{subcat.description}</p>
          <p className="text-sm text-gray-500 mt-2">{products.length} products available</p>
        </div>

        {/* Products Grid */}
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

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  {product.rating ? renderStars(product.rating) : <span className="text-gray-400">No rating</span>}
                  <span className="text-xs text-gray-500 ml-2">({product.reviews})</span>
                </div>

                <p className="text-lg font-semibold text-[#C7511F]">৳{product.price.toFixed(2)}</p>

                {/* AddToCartButton component, import and use if available */}
                {/* <AddToCartButton productId={product.id} /> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
