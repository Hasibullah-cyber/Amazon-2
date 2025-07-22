// Force dynamic for server-side fetch
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { pool } from '@/lib/database'

// 🧪 Debug logs visible in browser console (for phone debugging)
if (typeof window !== 'undefined') {
  const box = document.createElement('div')
  box.style.position = 'fixed'
  box.style.bottom = '0'
  box.style.left = '0'
  box.style.zIndex = '9999'
  box.style.maxHeight = '35vh'
  box.style.overflowY = 'auto'
  box.style.background = 'black'
  box.style.color = 'lime'
  box.style.fontSize = '12px'
  box.style.padding = '4px'
  box.style.width = '100%'
  box.style.borderTopRightRadius = '6px'
  document.body.appendChild(box)

  const log = console.log
  console.log = (...args) => {
    log(...args)
    const line = document.createElement('div')
    line.textContent = '[LOG] ' + args.join(' ')
    box.appendChild(line)
  }

  const error = console.error
  console.error = (...args) => {
    error(...args)
    const line = document.createElement('div')
    line.style.color = 'red'
    line.textContent = '[ERROR] ' + args.join(' ')
    box.appendChild(line)
  }

  window.onerror = function (message, source, lineno, colno) {
    const line = document.createElement('div')
    line.style.color = 'red'
    line.textContent = `[ERROR] ${message} at ${source}:${lineno}:${colno}`
    box.appendChild(line)
  }
}

interface Subcategory {
  id: number
  name: string
  slug: string
  description: string | null
  productcount: number
}

interface Category {
  category_id: number
  category_name: string
  category_slug: string
  category_description: string | null
  subcategories: Subcategory[]
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug

  let category: Category | null = null

  try {
    const result = await pool.query<Category[]>(
      `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        c.description AS category_description,
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
        GROUP BY subcategory_id
      ) pc ON pc.subcategory_id = s.id
      WHERE c.slug = $1
      GROUP BY c.id
      `,
      [slug]
    )

    if (result.rows.length === 0) {
      console.error('Category not found for slug:', slug)
      return notFound()
    }

    category = result.rows[0]
    console.log('Fetched category:', category)
  } catch (err) {
    console.error('Database error fetching category page:', err)
    return notFound()
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
          <span className="font-medium">{category.category_name}</span>
        </div>

        {/* Category Info */}
        <div className="bg-white p-6 mb-6 rounded-sm">
          <h1 className="text-3xl font-bold text-black mb-2">{category.category_name}</h1>
          <p className="text-gray-600 text-lg">{category.category_description}</p>
        </div>

        {/* Subcategories */}
        <div className="bg-white p-6 rounded-sm">
          <h2 className="text-2xl font-medium text-black mb-6">
            Browse {category.category_name} Categories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/category/${category.category_slug}/${subcategory.slug}`}
                className="block p-4 border border-gray-200 rounded-sm hover:shadow-md hover:border-[#ff9900] transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-black group-hover:text-[#C7511F] mb-1">
                      {subcategory.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {subcategory.description}
                    </p>
                    <span className="text-xs text-gray-500">
                      {subcategory.productcount} items
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
}
