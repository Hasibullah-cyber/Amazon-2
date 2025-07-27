// app/api/admin/categories/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// ✅ GET — Fetch categories with subcategories
export async function GET() {
  try {
    const { rows } = await pool.query(`
      WITH category_counts AS (
        SELECT category_id, COUNT(*)::int AS product_count
        FROM products
        WHERE is_active = true
        GROUP BY category_id
      ),
      subcategory_counts AS (
        SELECT subcategory_id, COUNT(*)::int AS product_count
        FROM products
        WHERE is_active = true
        GROUP BY subcategory_id
      )
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image,
        c.is_active,
        COALESCE(cc.product_count, 0) AS product_count,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug,
              'description', s.description,
              'category_id', s.category_id,
              'is_active', s.is_active,
              'product_count', COALESCE(sc.product_count, 0)
            ) ORDER BY s.name
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS subcategories
      FROM categories c
      LEFT JOIN subcategories s ON s.category_id = c.id
      LEFT JOIN category_counts cc ON cc.category_id = c.id
      LEFT JOIN subcategory_counts sc ON sc.subcategory_id = s.id
      GROUP BY c.id, cc.product_count
      ORDER BY c.name
    `)

    return NextResponse.json(rows)
  } catch (error) {
    console.error('[CATEGORIES_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' }, 
      { status: 500 }
    )
  }
}

// ✅ POST — Create category or subcategory
export async function POST(request: NextRequest) {
  try {
    const { type, ...data } = await request.json()
    const isSubcategory = type === 'subcategory'
    
    // Validate input
    if (!data.name || !data.description) {
      return NextResponse.json(
        { error: 'Name and description are required' }, 
        { status: 400 }
      )
    }

    if (isSubcategory && !data.category_id) {
      return NextResponse.json(
        { error: 'Category ID is required for subcategories' }, 
        { status: 400 }
      )
    }

    const slug = slugify(data.name)
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      if (isSubcategory) {
        // Create subcategory
        const result = await client.query(
          `INSERT INTO subcategories (
            name, slug, description, category_id
          ) VALUES ($1, $2, $3, $4)
          RETURNING *`,
          [data.name, slug, data.description, data.category_id]
        )
        await client.query('COMMIT')
        return NextResponse.json(result.rows[0], { status: 201 })
      } else {
        // Create category
        const result = await client.query(
          `INSERT INTO categories (
            name, slug, description, image
          ) VALUES ($1, $2, $3, $4)
          RETURNING *`,
          [data.name, slug, data.description, data.image || null]
        )
        await client.query('COMMIT')
        return NextResponse.json(result.rows[0], { status: 201 })
      }
    } catch (error) {
      await client.query('ROLLBACK')
      
      // Handle unique constraint violation
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: `${isSubcategory ? 'Subcategory' : 'Category'} with this name already exists` },
          { status: 409 }
        )
      }
      
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('[CATEGORIES_POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' }, 
      { status: 500 }
    )
  }
}

// ✅ PUT — Update category or subcategory
export async function PUT(request: NextRequest) {
  try {
    const { type, id, ...data } = await request.json()
    const isSubcategory = type === 'subcategory'
    
    // Validate input
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' }, 
        { status: 400 }
      )
    }

    if (!data.name && !data.description && !data.image && !data.is_active) {
      return NextResponse.json(
        { error: 'No valid fields to update' }, 
        { status: 400 }
      )
    }

    const client = await pool.connect()
    const slug = data.name ? slugify(data.name) : undefined

    try {
      await client.query('BEGIN')

      if (isSubcategory) {
        // Update subcategory
        const queryParts = []
        const queryParams: any[] = [id]
        let paramCount = 2

        if (data.name) {
          queryParts.push(`name = $${paramCount}`)
          queryParams.push(data.name)
          paramCount++
        }

        if (slug) {
          queryParts.push(`slug = $${paramCount}`)
          queryParams.push(slug)
          paramCount++
        }

        if (data.description) {
          queryParts.push(`description = $${paramCount}`)
          queryParams.push(data.description)
          paramCount++
        }

        if (typeof data.is_active === 'boolean') {
          queryParts.push(`is_active = $${paramCount}`)
          queryParams.push(data.is_active)
          paramCount++
        }

        if (data.category_id) {
          queryParts.push(`category_id = $${paramCount}`)
          queryParams.push(data.category_id)
          paramCount++
        }

        const result = await client.query(
          `UPDATE subcategories 
          SET ${queryParts.join(', ')}
          WHERE id = $1
          RETURNING *`,
          queryParams
        )

        if (result.rowCount === 0) {
          return NextResponse.json(
            { error: 'Subcategory not found' }, 
            { status: 404 }
          )
        }

        await client.query('COMMIT')
        return NextResponse.json(result.rows[0])
      } else {
        // Update category
        const queryParts = []
        const queryParams: any[] = [id]
        let paramCount = 2

        if (data.name) {
          queryParts.push(`name = $${paramCount}`)
          queryParams.push(data.name)
          paramCount++
        }

        if (slug) {
          queryParts.push(`slug = $${paramCount}`)
          queryParams.push(slug)
          paramCount++
        }

        if (data.description) {
          queryParts.push(`description = $${paramCount}`)
          queryParams.push(data.description)
          paramCount++
        }

        if (data.image) {
          queryParts.push(`image = $${paramCount}`)
          queryParams.push(data.image)
          paramCount++
        }

        if (typeof data.is_active === 'boolean') {
          queryParts.push(`is_active = $${paramCount}`)
          queryParams.push(data.is_active)
          paramCount++
        }

        const result = await client.query(
          `UPDATE categories 
          SET ${queryParts.join(', ')}
          WHERE id = $1
          RETURNING *`,
          queryParams
        )

        if (result.rowCount === 0) {
          return NextResponse.json(
            { error: 'Category not found' }, 
            { status: 404 }
          )
        }

        await client.query('COMMIT')
        return NextResponse.json(result.rows[0])
      }
    } catch (error) {
      await client.query('ROLLBACK')
      
      // Handle unique constraint violation
      if (error instanceof Error && error.message.includes('unique constraint')) {
        return NextResponse.json(
          { error: `${isSubcategory ? 'Subcategory' : 'Category'} with this name already exists` },
          { status: 409 }
        )
      }
      
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('[CATEGORIES_PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' }, 
      { status: 500 }
    )
  }
}

// ✅ DELETE — Delete category or subcategory
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')
    const isSubcategory = type === 'subcategory'
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' }, 
        { status: 400 }
      )
    }

    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      if (isSubcategory) {
        // Check if subcategory has products
        const productCheck = await client.query(
          `SELECT COUNT(*) FROM products WHERE subcategory_id = $1`,
          [id]
        )
        
        if (parseInt(productCheck.rows[0].count) > 0) {
          return NextResponse.json(
            { error: 'Cannot delete subcategory with associated products' }, 
            { status: 400 }
          )
        }

        // Delete subcategory
        const result = await client.query(
          `DELETE FROM subcategories WHERE id = $1 RETURNING *`,
          [id]
        )

        if (result.rowCount === 0) {
          return NextResponse.json(
            { error: 'Subcategory not found' }, 
            { status: 404 }
          )
        }

        await client.query('COMMIT')
        return NextResponse.json(
          { message: 'Subcategory deleted successfully' }
        )
      } else {
        // Check if category has subcategories
        const subcategoryCheck = await client.query(
          `SELECT COUNT(*) FROM subcategories WHERE category_id = $1`,
          [id]
        )
        
        if (parseInt(subcategoryCheck.rows[0].count) > 0) {
          return NextResponse.json(
            { error: 'Cannot delete category with subcategories' }, 
            { status: 400 }
          )
        }

        // Check if category has products
        const productCheck = await client.query(
          `SELECT COUNT(*) FROM products WHERE category_id = $1`,
          [id]
        )
        
        if (parseInt(productCheck.rows[0].count) > 0) {
          return NextResponse.json(
            { error: 'Cannot delete category with associated products' }, 
            { status: 400 }
          )
        }

        // Delete category
        const result = await client.query(
          `DELETE FROM categories WHERE id = $1 RETURNING *`,
          [id]
        )

        if (result.rowCount === 0) {
          return NextResponse.json(
            { error: 'Category not found' }, 
            { status: 404 }
          )
        }

        await client.query('COMMIT')
        return NextResponse.json(
          { message: 'Category deleted successfully' }
        )
      }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('[CATEGORIES_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' }, 
      { status: 500 }
    )
  }
}
