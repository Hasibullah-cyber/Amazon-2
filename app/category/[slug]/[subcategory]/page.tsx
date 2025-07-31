import { pool } from '@/lib/database'
import { notFound } from 'next/navigation'
import { SubcategoryPage } from './SubcategoryClient'

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

export default async function ServerSubcategoryPage({ 
  params 
}: { 
  params: { slug: string; subcategory: string } 
}) {
  const { slug, subcategory } = params

  try {
    const categoryResult = await pool.query<Category>(
      `SELECT id, name, slug FROM categories WHERE slug = $1 LIMIT 1`,
      [slug]
    )

    const category = categoryResult.rows[0]
    if (!category) return notFound()

    const subcatResult = await pool.query<Subcategory>(
      `SELECT id, name, description, slug, category_id 
       FROM subcategories 
       WHERE slug = $1 AND category_id = $2 LIMIT 1`,
      [subcategory, category.id]
    )

    const subcat = subcatResult.rows[0]
    if (!subcat) return notFound()

    const productResult = await pool.query<Product>(
      `SELECT id, name, description, price, image, rating, reviews, stock 
       FROM products 
       WHERE subcategory_id = $1 AND is_active = true`,
      [subcat.id]
    )
    const products = productResult.rows

    return <SubcategoryPage 
      category={category} 
      subcategory={subcat} 
      products={products} 
    />
  } catch (error) {
    console.error('Error loading subcategory:', error)
    return (
      <div className="min-h-screen bg-[#f6f6f6]">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12 text-lg">
            <div className="mb-6 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Products</h1>
            <p className="text-gray-600 mb-6">
              We encountered an error while loading the products. Please try again later.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/" className="px-4 py-2 bg-[#C7511F] text-white rounded-md hover:bg-[#A83C0F] transition-colors">Go to Homepage</a>
              <a href={`/category/${slug}`} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">Back to Category</a>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
