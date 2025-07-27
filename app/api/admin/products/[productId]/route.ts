import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Validate product data with detailed error messages
function validateProductData(data: any, isUpdate = true) {
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
  
  // Validate sale price
  if (data.sale_price !== undefined && data.sale_price !== null) {
    if (isNaN(data.sale_price)) errors.push('Sale price must be a number')
    else if (data.sale_price < 0) errors.push('Sale price cannot be negative')
    
    // Compare sale price to regular price
    if (data.price !== undefined && data.sale_price >= data.price) {
      errors.push('Sale price must be less than regular price')
    }
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '))
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const client = await pool.connect()
  try {
    const { productId } = params
    const productData = await request.json()
    
    // Validate product ID format
    if (!productId || !productId.startsWith('prod_')) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      )
    }
    
    // Validate input data
    validateProductData(productData)
    
    // Check if product exists
    const checkResult = await client.query(
      'SELECT id, price FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    )
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Additional validation for sale price vs current price
    const currentPrice = checkResult.rows[0].price
    if (productData.sale_price !== undefined && 
        productData.sale_price !== null &&
        (productData.price === undefined || productData.price === null)) {
      if (productData.sale_price >= currentPrice) {
        return NextResponse.json(
          { error: 'Sale price must be less than current price' },
          { status: 400 }
        )
      }
    }
    
    // Build dynamic update query
    const updateFields: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    const fieldMappings: Record<string, string> = {
      name: 'name',
      description: 'description',
      price: 'price',
      sale_price: 'sale_price',
      stock: 'stock',
      sku: 'sku',
      weight: 'weight',
      image: 'image',
      images: 'images',
      rating: 'rating',
      reviews: 'reviews',
      is_active: 'is_active',
      featured: 'featured',
      category_id: 'category_id',
      subcategory_id: 'subcategory_id'
    }
    
    for (const [key, value] of Object.entries(productData)) {
      if (fieldMappings[key]) {
        updateFields.push(`${fieldMappings[key]} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    }
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`)
    
    // Add product ID as last parameter
    values.push(productId)
    
    // Execute update
    const query = `
      UPDATE products
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    const result = await client.query(query, values)
    
    return NextResponse.json(result.rows[0])
  } catch (error: any) {
    console.error('[PRODUCT_UPDATE] Error:', error)
    
    // Handle unique constraint violation
    if (error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Product with this SKU or name already exists' },
        { status: 409 }
      )
    }
    
    // Handle validation errors
    if (error.message.includes(',')) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  const client = await pool.connect()
  try {
    const { productId } = params
    
    // Validate product ID format
    if (!productId || !productId.startsWith('prod_')) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      )
    }
    
    await client.query('BEGIN')
    
    // Check if product exists in any orders
    const orderCheck = await client.query(
      `SELECT COUNT(*) AS order_count FROM order_items WHERE product_id = $1`,
      [productId]
    )
    
    if (parseInt(orderCheck.rows[0].order_count) > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete product with existing orders',
          orderCount: orderCheck.rows[0].order_count
        },
        { status: 400 }
      )
    }
    
    // Check if product exists
    const productCheck = await client.query(
      `SELECT id FROM products WHERE id = $1`,
      [productId]
    )
    
    if (productCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    // Perform deletion
    const result = await client.query(
      `DELETE FROM products WHERE id = $1 RETURNING id, name`,
      [productId]
    )
    
    await client.query('COMMIT')
    
    return NextResponse.json({
      success: true,
      message: `Product "${result.rows[0].name}" deleted successfully`,
      deletedId: result.rows[0].id
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('[PRODUCT_DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
