import { pool } from '@/lib/database'
import { notFound } from 'next/navigation'
import { CategoryPage } from './CategoryClient'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  subcategories: Subcategory[]
}

interface Subcategory {
  id: number
  name: string
  slug: string
  description: string | null
  productcount: number
}

export default async function ServerCategoryPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
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
      subcategories: result.rows[0].subcategories
    }

    return <CategoryPage category={category} />
  } catch (error) {
    console.error('Error loading category:', error)
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="mx-auto mb-6 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Category</h1>
            <p className="text-gray-600 mb-6">
              We encountered an error while loading this category. Please try again later.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/" className="px-4 py-2 bg-[#C7511F] text-white rounded-md hover:bg-[#A83C0F] transition-colors">Go to Homepage</a>
              <a href="/category/all" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Browse All Categories</a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
