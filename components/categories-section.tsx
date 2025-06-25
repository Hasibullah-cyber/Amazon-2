"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

const sampleCategories = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Latest gadgets and tech",
    image: "/placeholder.svg?height=400&width=400"
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Trendy clothing and accessories",
    image: "/placeholder.svg?height=400&width=400"
  },
  {
    id: "home-living",
    name: "Home & Living",
    description: "Comfort and style for your home",
    image: "/placeholder.svg?height=400&width=400"
  },
  {
    id: "beauty",
    name: "Beauty",
    description: "Premium skincare and cosmetics",
    image: "/placeholder.svg?height=400&width=400"
  }
]

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok && isMounted) {
          const categoriesData = await response.json()
          if (Array.isArray(categoriesData) && categoriesData.length > 0) {
            setCategories(categoriesData)
          } else {
            setCategories(sampleCategories)
          }
        } else if (isMounted) {
          console.warn('Categories API failed, using sample data')
          setCategories(sampleCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        if (isMounted) {
          setCategories(sampleCategories)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchCategories()

    return () => {
      isMounted = false
    }
  }, [])
  if (loading) {
    return (
      <section id="categories" className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="amazon-title text-2xl mb-4">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="amazon-card animate-pulse">
                <div className="aspect-square bg-gray-200 mb-3"></div>
                <div className="h-4 bg-gray-200 mb-2"></div>
                <div className="h-3 bg-gray-200 mb-2 w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const categoriesToShow = categories.length > 0 ? categories : sampleCategories

  return (
    <section id="categories" className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="amazon-title text-2xl mb-4">Shop by Category</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoriesToShow.map((category) => (
            <Link
              href={`/category/${category.id}`}
              key={category.id}
              className="amazon-card text-center hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative mb-3">
                <Image 
                  src={category.image || "/placeholder.svg?height=400&width=400"} 
                  alt={category.name} 
                  fill 
                  className="object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                  }}
                />
              </div>
              <h3 className="amazon-title text-lg">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              <span className="amazon-link text-sm">Browse categories</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}