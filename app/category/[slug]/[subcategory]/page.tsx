"use client"

export const dynamic = 'force-dynamic'

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Star, StarHalf } from "lucide-react"
import { pool } from "@/lib/database"
import { AddToCartButton } from "@/components/product/add-to-cart-button"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface Product {
  id: number
  name: string
  description: string
  price: number | string
  image: string
  rating?: number
  reviews: number
  stock?: number
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

function StarRating({ rating }: { rating?: number }) {
  if (rating === undefined || rating === null) {
    return <span className="text-gray-400">No rating</span>
  }

  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalf = rating % 1 >= 0.5

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
  }
  
  if (hasHalf) {
    stars.push(<StarHalf key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
  }
  
  const empty = 5 - stars.length
  for (let i = 0; i < empty; i++) {
    stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
  }
  
  return <>{stars}</>
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 animate-pulse">
      <div className="aspect-square p-4 bg-gray-100">
        <div className="w-full h-full bg-gray-200 rounded-lg" />
      </div>
      <div className="p-4 pt-2 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  )
}

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col transform hover:-translate-y-1"
          style={{ animation: `slideUp 0.5s ease-out ${index * 50}ms forwards`, opacity: 0 }}
        >
          <Link href={`/product/${product.id}`} className="flex-grow">
            <div className="aspect-square p-4 bg-white">
              <div className="relative w-full h-full">
                <Image
                  src={product.image || "/placeholder.svg?height=300&width=300"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="object-contain w-full h-full transition-transform duration-500 hover:scale-110"
                />
              </div>
            </div>

            <div className="p-4 pt-2">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-[#C7511F] transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

              <div className="flex items-center space-x-1 mb-2">
                <StarRating rating={product.rating} />
                <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
              </div>

              <p className="text-lg font-bold text-[#C7511F]">
                ৳{Number(product.price).toFixed(2)}
              </p>
            </div>
          </Link>
          
          <div className="p-4 pt-0">
            <AddToCartButton product={{
              id: product.id.toString(),
              name: product.name,
              price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
              image: product.image,
              stock: product.stock
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function SubcategoryPage({ params }: { params: { slug: string; subcategory: string } }) {
  const { slug, subcategory } = params

  const categoryResult = await pool.query<Category>(
    `SELECT id, name, slug FROM categories WHERE slug = $1 LIMIT 1`,
    [slug]
  )

  const category = categoryResult.rows[0]
  if (!category) return notFound()

  const subcatResult = await pool.query<Subcategory>(
    `SELECT id, name, description, slug, category_id FROM subcategories WHERE slug = $1 AND category_id = $2 LIMIT 1`,
    [subcategory, category.id]
  )

  const subcat = subcatResult.rows[0]
  if (!subcat) return notFound()

  const productResult = await pool.query<Product>(
    `SELECT id, name, description, price, image, rating, reviews, stock FROM products WHERE subcategory_id = $1`,
    [subcat.id]
  )
  const products = productResult.rows

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b py-3 shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center text-sm text-gray-600 space-x-1 animate-slide-up">
            <Link href="/" className="hover:text-[#C7511F] transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link 
              href={`/category/${slug}`} 
              className="capitalize hover:text-[#C7511F] transition-colors"
            >
              {category.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{subcat.name}</span>
          </nav>
        </div>
      </div>

      {/* Header Section */}
      <div className="container mx-auto px-4 py-6 animate-slide-up delay-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{subcat.name}</h1>
        <p className="text-gray-600 text-base">{subcat.description}</p>
        <p className="text-sm text-gray-500 mt-1">{products.length} product(s) available</p>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 pb-12">
        {products.length === 0 ? (
          <div className="text-center py-12 text-lg animate-fade-in">
            <div className="mb-6">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              This subcategory doesn't have any products yet
            </p>
            <Button asChild className="transition-transform hover:scale-105">
              <Link href={`/category/${slug}`}>Browse other subcategories</Link>
            </Button>
          </div>
        ) : (
          <Suspense fallback={
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }>
            <ProductGrid products={products} />
          </Suspense>
        )}
      </div>
      
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
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
    </div>
  )
}
