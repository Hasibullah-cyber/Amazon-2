
import Link from "next/link"
import Image from "next/image"

// Define the categories
const categories = [
  {
    id: "electronics",
    name: "Electronics",
    description: "Cutting-edge gadgets and devices",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "fashion",
    name: "Fashion",
    description: "Stylish apparel and accessories",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "home-living",
    name: "Home & Living",
    description: "Beautiful furnishings and decor",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "beauty",
    name: "Beauty & Personal Care",
    description: "Premium self-care products",
    image: "/placeholder.svg?height=400&width=400",
  },
]

export default function CategoriesSection() {
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
                <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-contain" />
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
