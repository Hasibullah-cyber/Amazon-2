"use client"

import Link from 'next/link'
import { ChevronRight, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Subcategory {
  id: number
  name: string
  slug: string
  description: string | null
  productcount: number
}

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  subcategories: Subcategory[]
}

function SubcategoryCard({ category, sub }: { category: Category; sub: Subcategory }) {
  return (
    <Link
      href={`/category/${category.slug}/${sub.slug}`}
      className="block p-6 border border-gray-200 rounded-lg hover:shadow-xl transition-all duration-300 group bg-white hover:-translate-y-1"
    >
      <div className="flex items-center">
        <div className="mr-4 p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
          <Folder className="h-8 w-8 transition-transform group-hover:scale-110" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-lg text-black group-hover:text-[#C7511F] mb-1 transition-colors">
            {sub.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {sub.description || 'Browse products in this category'}
          </p>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full transition-colors group-hover:bg-orange-100 group-hover:text-orange-600">
            {sub.productcount} {sub.productcount === 1 ? 'product' : 'products'}
          </span>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ff9900] transition-colors group-hover:translate-x-1" />
      </div>
    </Link>
  )
}

export function CategorySkeleton() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-4">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center mb-6">
          <Skeleton className="h-4 w-16 animate-pulse" />
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Skeleton className="h-4 w-32 animate-pulse" />
        </div>

        {/* Category Info Skeleton */}
        <div className="bg-white p-6 mb-6 rounded-lg shadow-sm">
          <Skeleton className="h-8 w-3/4 mb-4 animate-pulse" />
          <Skeleton className="h-6 w-full animate-pulse" />
        </div>

        {/* Subcategories Skeleton */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Skeleton className="h-8 w-1/2 mb-6 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div 
                key={i} 
                className="p-6 border border-gray-200 rounded-lg transition-all hover:shadow-md"
              >
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-lg mr-4 animate-pulse" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2 animate-pulse" />
                    <Skeleton className="h-4 w-full mb-3 animate-pulse" />
                    <Skeleton className="h-4 w-16 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CategoryPage({ category }: { category: Category }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-6 animate-slide-up">
          <Link 
            href="/" 
            className="text-[#565959] hover:text-[#C7511F] hover:underline transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="font-medium text-black">{category.name}</span>
        </div>

        {/* Category Info */}
        <div className="bg-white p-6 mb-8 rounded-lg shadow-sm transition-all hover:shadow-md animate-slide-up delay-100">
          <h1 className="text-3xl font-bold text-black mb-3">{category.name}</h1>
          <p className="text-gray-600 text-lg mb-4">
            {category.description || `Explore our collection of ${category.name}`}
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <Folder className="h-4 w-4 mr-1" />
            {category.subcategories.length} subcategories
          </div>
        </div>

        {/* Subcategories */}
        <div className="bg-white p-6 rounded-lg shadow-sm transition-all hover:shadow-md animate-slide-up delay-200">
          <h2 className="text-2xl font-semibold text-black mb-6 pb-2 border-b">
            Browse {category.name} Categories
          </h2>

          {category.subcategories.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="mx-auto mb-4">
                <Folder className="h-16 w-16 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No subcategories found
              </h3>
              <p className="text-gray-600 mb-6">
                This category doesn't have any subcategories yet
              </p>
              <Button asChild className="transition-transform hover:scale-105">
                <Link href="/">Browse All Categories</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.subcategories.map((sub, index) => (
                <div 
                  key={sub.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SubcategoryCard category={category} sub={sub} />
                </div>
              ))}
            </div>
          )}
        </div>
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
        
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  )
}
