export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { pool } from '@/lib/database'

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

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  try {
    const result = await pool.query(
      `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug,
              'description', s.description,
              'productcount', COALESCE(pc.count, 0)
            )
            ORDER BY s.name
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS subcategories
      FROM categories c
      LEFT JOIN subcategories s ON s.category_id = c.id
      LEFT JOIN (
        SELECT subcategory_id, COUNT(*) AS count
        FROM products
        WHERE is_active = true
        GROUP BY subcategory_id
      ) pc ON pc.subcategory_id = s.id
      WHERE LOWER(c.slug) = LOWER($1)
      GROUP BY c.id
      `,
      [slug.trim()]
    )

    if (result.rows.length === 0) return notFound()

    const category: Category = {
      ...result.rows[0],
      subcategories: result.rows[0].subcategories // Already parsed JSON array
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
            <span className="font-medium">{category.name}</span>
          </div>

          {/* Category Info */}
          <div className="bg-white p-6 mb-6 rounded-sm">
            <h1 className="text-3xl font-bold text-black mb-2">{category.name}</h1>
            <p className="text-gray-600 text-lg">{category.description}</p>
          </div>

          {/* Subcategories */}
          <div className="bg-white p-6 rounded-sm">
            <h2 className="text-2xl font-medium text-black mb-6">
              Browse {category.name} Categories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${category.slug}/${sub.slug}`}
                  className="block p-4 border border-gray-200 rounded-sm hover:shadow-md hover:border-[#ff9900] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-black group-hover:text-[#C7511F] mb-1">
                        {sub.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {sub.description}
                      </p>
                      <span className="text-xs text-gray-500">
                        {sub.productcount} items
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ff9900]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading category:', error)
    return notFound()
  }
}
