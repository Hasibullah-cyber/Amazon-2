import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { kv } from '@/lib/kv' // Assuming you have a KV client setup

export const dynamic = 'force-dynamic'

// Cache key for categories
const CATEGORIES_CACHE_KEY = 'all_categories'

// GET: Return all categories with subcategories and product count
export async function GET() {
  try {
    // Try to get cached data
    let cachedData: any = null;
    try {
      cachedData = await kv.get(CATEGORIES_CACHE_KEY);
    } catch (cacheErr) {
      console.warn("[KV] Failed to get cached categories:", cacheErr);
    }

    if (cachedData) {
      console.log("[KV] Returning cached categories");
      return NextResponse.json(cachedData);
    }
const { rows } = await pool.query<{
  id: number;
  name: string;
  slug: string;
  description: string | null;
  subcategories: Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    productCount: number;
  }>;
}>(`
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
          'productCount', COALESCE(pc.count, 0)
        )
      ) FILTER (WHERE s.id IS NOT NULL),
      '[]'::json
    ) AS subcategories
  FROM categories c
  LEFT JOIN subcategories s ON s.category_id = c.id
  LEFT JOIN (
    SELECT subcategory_id, COUNT(*) AS count
    FROM products
    WHERE is_active = true
    GROUP BY subcategory_id
  ) pc ON pc.subcategory_id = s.id
  GROUP BY c.id
  ORDER BY c.name;
`);

    try {
      await kv.set(CATEGORIES_CACHE_KEY, rows);
      console.log("[KV] Cached categories to store");
    } catch (cacheErr) {
      console.warn("[KV] Failed to cache categories:", cacheErr);
    }

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching categories from DB:", error);

    // Fallback to cache if DB query fails
    try {
      const fallbackCache = await kv.get(CATEGORIES_CACHE_KEY);
      if (fallbackCache) {
        console.warn("[Fallback] Returning stale cached categories");
        return NextResponse.json(fallbackCache);
      }
    } catch (fallbackError) {
      console.error("Error accessing fallback cache:", fallbackError);
    }

    return NextResponse.json(
      {
        error: "Failed to fetch categories",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  try {
    const { name, description } = await request.json()

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required and cannot be empty' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    const { rows } = await pool.query<{
      id: number
      name: string
      slug: string
      description: string | null
    }>(
      `INSERT INTO categories (name, slug, description) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, slug, description`,
      [name.trim(), slug, description?.trim() || null]
    )

    // Invalidate cache
    await kv.del(CATEGORIES_CACHE_KEY)

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('Error adding category:', error)
    
    // Handle duplicate slug error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'A category with similar name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to add category',
        details: error instanceof Error ? error.message : 'Database error'
      },
      { status: 500 }
    )
  }
}

// PATCH: Update multiple categories
export async function PATCH(request: Request) {
  try {
    const updates = await request.json()
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected array of category updates' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      const updatedCategories = []
      
      for (const update of updates) {
        const { id, name, description } = update
        
        if (!id) {
          await client.query('ROLLBACK')
          return NextResponse.json(
            { error: 'Missing category ID in update' },
            { status: 400 }
          )
        }
        
        // Generate new slug if name changes
        let slug
        if (name) {
          slug = name
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
        }
        
        const query = `
          UPDATE categories 
          SET 
            name = COALESCE($1, name),
            slug = COALESCE($2, slug),
            description = COALESCE($3, description)
          WHERE id = $4
          RETURNING id, name, slug, description
        `
        
        const result = await client.query(query, [
          name || null,
          slug || null,
          description || null,
          id
        ])
        
        if (result.rowCount === 0) {
          await client.query('ROLLBACK')
          return NextResponse.json(
            { error: `Category with ID ${id} not found` },
            { status: 404 }
          )
        }
        
        updatedCategories.push(result.rows[0])
      }
      
      await client.query('COMMIT')
      
      // Invalidate cache
      await kv.del(CATEGORIES_CACHE_KEY)
      
      return NextResponse.json(updatedCategories)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating categories:', error)
    
    // Handle duplicate slug error
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Category with similar name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update categories',
        details: error instanceof Error ? error.message : 'Database error'
      },
      { status: 500 }
    )
  }
}

// DELETE: Delete multiple categories
export async function DELETE(request: Request) {
  try {
    const { ids } = await request.json()
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected array of category IDs' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      
      // Check if any category has subcategories
      const subcategoryCheck = await client.query(
        `SELECT c.id, COUNT(s.id) as subcategory_count
         FROM categories c
         LEFT JOIN subcategories s ON s.category_id = c.id
         WHERE c.id = ANY($1)
         GROUP BY c.id
         HAVING COUNT(s.id) > 0`,
        [ids]
      )
      
      if (subcategoryCheck.rows.length > 0) {
        await client.query('ROLLBACK')
        const problematic = subcategoryCheck.rows.map(r => r.id)
        return NextResponse.json(
          { 
            error: 'Cannot delete categories with subcategories',
            categories: problematic
          },
          { status: 400 }
        )
      }
      
      // Delete categories
      const deleteResult = await client.query(
        `DELETE FROM categories WHERE id = ANY($1) RETURNING id`,
        [ids]
      )
      
      if (deleteResult.rowCount !== ids.length) {
        await client.query('ROLLBACK')
        const deletedIds = deleteResult.rows.map(r => r.id)
        const missing = ids.filter(id => !deletedIds.includes(id))
        return NextResponse.json(
          { 
            error: 'Some categories not found',
            missing
          },
          { status: 404 }
        )
      }
      
      await client.query('COMMIT')
      
      // Invalidate cache
      await kv.del(CATEGORIES_CACHE_KEY)
      
      return NextResponse.json(
        { message: `${deleteResult.rowCount} categories deleted successfully` },
        { status: 200 }
      )
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error deleting categories:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete categories',
        details: error instanceof Error ? error.message : 'Database error'
      },
      { status: 500 }
    )
  }
}
