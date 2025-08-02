import { NextResponse, NextRequest } from 'next/server'
import { pool } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Validate product data with detailed error messages
function validateProductData(data: any, isUpdate = true) {
  const errors: string[] = []
  
  // Use camelCase field names (matches frontend)
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
  
  // Use camelCase: categoryId instead of category_id
  if (!isUpdate || data.categoryId !== undefined) {
    if (!data.categoryId) errors.push('Category is required')
  }
  
  // Validate sale price (camelCase: salePrice)
  if (data.salePrice !== undefined && data.salePrice !== null) {
    if (isNaN(data.salePrice)) errors.push('Sale price must be a number')
    else if (data.salePrice < 0) errors.push('Sale price cannot be negative')
    
    // Compare sale price to regular price
    if (data.price !== undefined && data.salePrice >= data.price) {
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
    if (productData.salePrice !== undefined && 
        productData.salePrice !== null &&
        (productData.price === undefined || productData.price === null)) {
      if (productData.salePrice >= currentPrice) {
        return NextResponse.json(
          { error: 'Sale price must be less than current price' },
          { status: 400 }
        )
      }
    }
    
    // Build dynamic update query with camelCase to snake_case mapping
    const updateFields: string[] = []
    const values: any[] = []
    let paramIndex = 1
    
    const fieldMappings: Record<string, string> = {
      name: 'name',
      description: 'description',
      price: 'price',
      salePrice: 'sale_price',  // Map camelCase to snake_case
      stock: 'stock',
      sku: 'sku',
      weight: 'weight',
      image: 'image',
      images: 'images',
      rating: 'rating',
      reviews: 'reviews',
      isActive: 'is_active',
      featured: 'featured',
      categoryId: 'category_id', // Map camelCase to snake_case
      subcategoryId: 'subcategory_id' // Map camelCase to snake_case
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
    
    // Execute update with proper field aliases
    const query = `
      UPDATE products
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        name,
        description,
        price,
        sale_price AS "salePrice",
        stock,
        sku,
        weight,
        image,
        images,
        rating,
        reviews,
        is_active AS "isActive",
        featured,
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        category_id AS "categoryId",
        subcategory_id AS "subcategoryId"
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

export async function PATCH(req: NextRequest, { params }: { params: { productId: string } }) {
  const client = await pool.connect()
  const startTime = Date.now();
  const debugInfo: Record<string, any> = {
    steps: []
  };
  
  try {
    const { productId } = params
    const updates = await req.json()
    debugInfo.updates = updates;

    if (!productId) {
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

    debugInfo.steps.push('Validating update data');
    validateProductData(updates, true)

    // Additional validation for sale price
    if ('salePrice' in updates && updates.salePrice !== null) {
      // We need to get current price if salePrice is being updated without price
      if (!('price' in updates)) {
        debugInfo.steps.push('Fetching current price for validation');
        const current = await client.query(
          'SELECT price FROM products WHERE id = $1',
          [productId]
        )
        
        if (current.rows.length === 0) {
          return NextResponse.json(
            { error: 'Product not found' },
            { status: 404 }
          );
        }
        
        const currentPrice = current.rows[0].price
        if (updates.salePrice >= currentPrice) {
          return NextResponse.json(
            { error: 'Sale price must be less than regular price' },
            { status: 400 }
          );
        }
      } else {
        if (updates.salePrice >= updates.price) {
          return NextResponse.json(
            { error: 'Sale price must be less than regular price' },
            { status: 400 }
          );
        }
      }
    }

    // Prevent negative stock
    if ('stock' in updates && updates.stock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      );
    }

    debugInfo.steps.push('Starting database transaction');
    await client.query('BEGIN')

    // Build dynamic update query with camelCase to snake_case mapping
    const updateFields: string[] = []
    const values: any[] = []
    
    const fieldMappings: Record<string, string> = {
      name: 'name',
      description: 'description',
      price: 'price',
      salePrice: 'sale_price',  // Map camelCase to snake_case
      stock: 'stock',
      sku: 'sku',
      weight: 'weight',
      image: 'image',
      images: 'images',
      rating: 'rating',
      reviews: 'reviews',
      isActive: 'is_active',
      featured: 'featured',
      categoryId: 'category_id', // Map camelCase to snake_case
      subcategoryId: 'subcategory_id' // Map camelCase to snake_case
    }

    for (const [key, value] of Object.entries(updates)) {
      if (fieldMappings[key]) {
        updateFields.push(`${fieldMappings[key]} = $${values.length + 1}`)
        values.push(value)
      }
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`)
    values.push(productId)

    const query = `
      UPDATE products
      SET ${updateFields.join(', ')}
      WHERE id = $${values.length}
      RETURNING 
        id,
        name,
        description,
        price,
        sale_price AS "salePrice",
        stock,
        sku,
        weight,
        image,
        images,
        rating,
        reviews,
        is_active AS "isActive",
        featured,
        created_at AS "createdAt",
        updated_at AS "updatedAt",
        category_id AS "categoryId",
        subcategory_id AS "subcategoryId"
    `
    
    debugInfo.query = {
      sql: query,
      params: values
    };

    debugInfo.steps.push('Executing update query');
    const result = await client.query(query, values)
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    await client.query('COMMIT')
    debugInfo.steps.push('Transaction committed');
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK')
    debugInfo.steps.push('Transaction rolled back');
    
    if (error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'Product with this SKU or name already exists' },
        { status: 409 }
      );
    }
    
    // Handle specific database errors
    if (error.code === '22P02') {
      return NextResponse.json(
        { error: 'Invalid UUID format for category' },
        { status: 400 }
      )
    }
    
    if (error.code === '23503') {
      return NextResponse.json(
        { error: 'Invalid category reference' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 400 }
    );
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
