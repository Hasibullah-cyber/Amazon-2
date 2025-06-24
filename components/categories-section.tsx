"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function CategoriesSection() {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const categoriesData = await response.json()
          setCategories(categoriesData)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
      }
    }

    fetchCategories()
  }, [])
  return (
    <section id="categories" className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="amazon-title text-2xl mb-4">Shop by Category</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              href={`/category/${category.id}`}
              key={category.id}
              className="amazon-card text-center hover:shadow-md transition-shadow"
            >
              <div className="aspect-square relative mb-3">
                <Image src={category.image || "/placeholder.svg?height=400&width=400"} alt={category.name} fill className="object-contain" />
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