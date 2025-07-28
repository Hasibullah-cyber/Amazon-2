// app/api/admin/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Helper to generate unique product IDs
function generateProductId() {
  return 'prod_' + Math.random().toString(36).substring(2, 15)
}

// Validate product data with detailed error messages
function validateProduct(data: any, isUpdate = false) {
  const errors: string[] = []
  
  if (!isUpdate || data.name !== undefined) {
    if (!data.name) errors.push('Product name is required')
    else if (data.name.length < 2) errors.push('Name must be at least 2 characters')
  }
  
  if (!isUpdate || data.description !== undefined) {
    if (!data.description) errors.push('Description is required')
    else if (data.description.length < 10) errors.push('Description must be at least 10 characters')
  }
  
  if (!isUpdate || data.price !== undefined) {
    if (data.price === undefined || data.price === null) errors.push('Price is required')
    else if (isNaN(data.price)) errors.push('Price must be a number')
    else if (data.price <= 0) errors.push('Price must be greater than 0')
  }
  
  if (!isUpdate || data.stock !== undefined) {
    if (data.stock === undefined || data.stock === null) errors.push('Stock is required')
    else if (isNaN(data.stock)) errors.push('Stock must be a number')
    else if (data.stock < 0) errors.push('Stock cannot be negative')
  }
  
  if (!isUpdate || data.category_id !== undefined) {
    if (!data.category_id) errors.push('Category is required')
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '))
  }
}

// GET — Fetch products with pagination, filtering, and sorting
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit
    
    const categoryId = searchParams.get('category_id')
    const subcategoryId = searchParams.get('subcategory_id')
    const searchTerm = searchParams.get('search')
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'DESC'
    const activeOnly = searchParams.get('active_only') === 'true'
    const lowStockOnly = searchParams.get('low_stock') === 'true'

    // Validate sorting parameters
    const validSortColumns = ['name', 'price', 'stock', 'created_at', 'updated_at', 'rating']
    if (!validSortColumns.includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid sort column' },
        { status: 400 }
      )
    }

    // Build WHERE conditions
    const conditions: string[] = []
    const params: any[] = []
    let paramIndex = 1

    if (categoryId) {
      conditions.push(`p.category_id = $${paramIndex++}`)
      params.push(categoryId)
    }

    if (subcategoryId) {
      conditions.push(`p.subcategory_id = $${paramIndex++}`)
      params.push(subcategoryId)
    }

    if (searchTerm) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`)
      params.push(`%${searchTerm}%`)
      paramIndex++
    }

    if (activeOnly) {
      conditions.push(`p.is_active = true`)
    }

    if (lowStockOnly) {
      conditions.push(`p.stock < 10 AND p.stock > 0`)
    }

    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : ''

    // Get total count
    const countQuery = `
      SELECT COUNT(*) AS total_count
      FROM products p
      ${whereClause}
    `
    const countResult = await pool.query(countQuery, params)
    const totalCount = countResult.rows[0]?.total_count || 0

    // Add pagination parameters
    params.push(limit, offset)

    // Get paginated results
    const dataQuery = `
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.sale_price AS "salePrice",
    p.stock,
    p.sku,
    p.weight,
    p.image,
    p.images,
    p.rating,
    p.reviews,
    p.is_active AS "isActive",
    p.featured,
    p.created_at AS "createdAt",
    p.updated_at AS "updatedAt",
    p.category_id AS "categoryId",
    c.name AS "categoryName",
    p.subcategory_id AS "subcategoryId",
    s.name AS "subcategoryName"
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN subcategories s ON p.subcategory_id = s.id
  ${whereClause}
  ORDER BY p.${sortBy} ${sortOrder}
  LIMIT $${paramIndex++}
  OFFSET $${paramIndex}
`
    const result = await pool.query(dataQuery, params)

    return NextResponse.json({
      products: result.rows.map(row => ({
        ...row,
        price: Number(row.price),
        salePrice: row.salePrice ? Number(row.salePrice) : null,
        stock: Number(row.stock),
        rating: Number(row.rating),
        reviews: Number(row.reviews),
        weight: row.weight ? Number(row.weight) : null,
        images: row.images || [],
      })),
      pagination: {
        totalItems: parseInt(totalCount),
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    })
  } catch (error) {
    console.error('[PRODUCTS_GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST — Create new product with comprehensive validation
export async function POST(req: NextRequest) {
  const client = await pool.connect()
  
  try {
    const data = await req.json()
    validateProduct(data)
    
    const {
      name,
      description,
      price,
      stock = 0,
      salePrice = null,
      sku = null,
      weight = null,
      image = '/placeholder.svg',
      images = [],
      category_id,
      subcategory_id = null,
      rating = 4.0,
      reviews = 0,
      isActive = true,
      featured = false
    } = data

    // Additional validation
    if (salePrice !== null && salePrice >= price) {
      return NextResponse.json(
        { error: 'Sale price must be less than regular price' },
        { status: 400 }
      )
    }

    await client.query('BEGIN')
    
    const productId = generateProductId()
    const result = await client.query(
      `
      INSERT INTO products (
        id, name, description, price, sale_price, stock, sku, weight,
        image, images, category_id, subcategory_id, rating, reviews,
        is_active, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
      `,
      [
        productId,
        name,
        description,
        price,
        salePrice,
        stock,
        sku,
        weight,
        image,
        images,
        category_id,
        subcategory_id,
        rating,
        reviews,
        isActive,
        featured
      ]
    )

    await client.query('COMMIT')
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error: any) {
    await client.query('ROLLBACK')
    
    console.error('[PRODUCTS_POST] Error:', error)
    
    if (error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Product with this SKU or name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Invalid product data',
        details: error.message
      },
      { status: 400 }
    )
  } finally {
    client.release()
  }
}

// PATCH — Update existing product with partial updates
export async function PATCH(req: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { id, ...updates } = await req.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields provided for update' },
        { status: 400 }
      )
    }

    // Validate the updates
    validateProduct(updates, true)

    // Additional validation for sale price
    if ('salePrice' in updates && updates.salePrice !== null) {
      // We need to get current price if salePrice is being updated without price
      if (!('price' in updates)) {
        const current = await client.query(
          'SELECT price FROM products WHERE id = $1',
          [id]
        )
        
        if (current.rows.length === 0) {
          return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
          )
        }
        
        const currentPrice = current.rows[0].price
        if (updates.salePrice >= currentPrice) {
          return NextResponse.json(
            { error: 'Sale price must be less than regular price' },
            { status: 400 }
          )
        }
      } else {
        if (updates.salePrice >= updates.price) {
          return NextResponse.json(
            { error: 'Sale price must be less than regular price' },
            { status: 400 }
          )
        }
      }
    }

    // Prevent negative stock
    if ('stock' in updates && updates.stock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    // Build dynamic update query
    const updateFields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    const fieldMappings: Record<string, string> = {
      name: 'name',
      description: 'description',
      price: 'price',
      salePrice: 'sale_price',
      stock: 'stock',
      sku: 'sku',
      weight: 'weight',
      image: 'image',
      images: 'images',
      rating: 'rating',
      reviews: 'reviews',
      isActive: 'is_active',
      featured: 'featured',
      category_id: 'category_id',
      subcategory_id: 'subcategory_id'
    }

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMappings[key]) {
        updateFields.push(`${fieldMappings[key]} = $${paramIndex++}`)
        values.push(value)
      }
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`)
    values.push(id)

    const query = `
      UPDATE products
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await client.query(query, values)
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    await client.query('COMMIT')
    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    await client.query('ROLLBACK')
    
    console.error('[PRODUCTS_PATCH] Error:', error)
    
    if (error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Product with this SKU or name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      {
        error: 'Failed to update product',
        details: error.message
      },
      { status: 400 }
    )
  } finally {
    client.release()
  }
}

// DELETE — Remove a product
export async function DELETE(req: NextRequest) {
  const client = await pool.connect()
  
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    await client.query('BEGIN')

    // Check if product exists in any orders
    const orderCheck = await client.query(
      `SELECT COUNT(*) FROM order_items WHERE product_id = $1`,
      [id]
    )
    
    if (parseInt(orderCheck.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders' },
        { status: 400 }
      )
    }

    const result = await client.query(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [id]
    )
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    await client.query('COMMIT')
    return NextResponse.json(
      { success: true, message: 'Product deleted successfully' }
    )
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[PRODUCTS_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
