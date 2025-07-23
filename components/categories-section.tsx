"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image?: string | null
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Failed to fetch categories')

        const data = await response.json()
        if (isMounted) {
          setCategories(data)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        if (isMounted) {
          setError(true)
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

  if (error || !categories || categories.length === 0) {
    return (
      <section id="categories" className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="amazon-title text-2xl mb-4">Shop by Category</h2>
          <p className="text-gray-600">No categories found.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="categories" className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="amazon-title text-2xl mb-4">Shop by Category</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              href={`/category/${category.slug}`}
              key={category.id}
              className="amazon-card text-center hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative mb-3">
                <Image
                  src={category.image || "/placeholder.svg?height=400&width=400"}
                  alt={category.name}
                  fill
                  className="object-contain"
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
