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
  
  // Use camelCase: categoryId instead of category_id
  if (!isUpdate || data.categoryId !== undefined) {
    if (!data.categoryId) errors.push('Category is required')
  }
  
  if (errors.length > 0) {
    throw new Error(errors.join(', '))
  }
}

// Enhanced error response with debugging information
function debugResponse(
  error: any, 
  message: string, 
  status: number, 
  debugInfo: Record<string, any> = {}
) {
  const response: Record<string, any> = {
    error: message,
    timestamp: new Date().toISOString(),
    path: '/api/admin/products',
    status
  }

  // Add debug details in development
  if (process.env.NODE_ENV === 'development') {
    response.debug = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...debugInfo
    }
  }

  return NextResponse.json(response, { status })
}

// GET — Fetch all products with filtering and sorting
export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const debugInfo: Record<string, any> = {
    queryParams: Object.fromEntries(req.nextUrl.searchParams),
    steps: [],
    environment: {
      node_env: process.env.NODE_ENV,
      db_host: process.env.DB_HOST 
          ? process.env.DB_HOST.slice(0, 8) + '*****'
          : 'undefined',
      db_port: process.env.DB_PORT,
      db_user: process.env.DB_USER,
      db_name: process.env.DB_NAME,
      app_version: process.env.npm_package_version
    }
  };

  try {
    debugInfo.steps.push({
      step: 'init',
      message: 'Starting products fetch',
      timestamp: Date.now() - startTime
    });

    const { searchParams } = new URL(req.url);
    
    const categoryId = searchParams.get('category_id');
    const subcategoryId = searchParams.get('subcategory_id');
    const searchTerm = searchParams.get('search');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'DESC';
    const activeOnly = searchParams.get('active_only') === 'true';
    const lowStockOnly = searchParams.get('low_stock') === 'true';
    const debugMode = searchParams.get('debug') === 'true';

    // Validate sorting parameters
    const validSortColumns = ['name', 'price', 'stock', 'created_at', 'updated_at', 'rating'];
    debugInfo.sortValidation = {
      validColumn: validSortColumns.includes(sortBy),
      validOrder: sortOrder === 'ASC' || sortOrder === 'DESC'
    };
    
    if (!debugInfo.sortValidation.validColumn) {
      return debugResponse(
        null,
        'Invalid sort column',
        400,
        { 
          validSortColumns, 
          provided: sortBy,
          ...debugInfo
        }
      );
    }

    if (!debugInfo.sortValidation.validOrder) {
      return debugResponse(
        null,
        'Invalid sort order',
        400,
        { 
          validOrders: ['ASC', 'DESC'], 
          provided: sortOrder,
          ...debugInfo
        }
      );
    }

    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (categoryId) {
      conditions.push("p.category_id = $" + (params.length + 1));
      params.push(categoryId);
      debugInfo.steps.push("Added category filter: " + categoryId);
    }

    if (subcategoryId) {
      conditions.push("p.subcategory_id = $" + (params.length + 1));
      params.push(subcategoryId);
      debugInfo.steps.push("Added subcategory filter: " + subcategoryId);
    }

    if (searchTerm) {
      const paramIndex = params.length + 1;
      conditions.push("(p.name ILIKE $" + paramIndex + " OR p.description ILIKE $" + paramIndex + ")");
      params.push("%" + searchTerm + "%");
      debugInfo.steps.push("Added search term: " + searchTerm);
    }

    if (activeOnly) {
      conditions.push("p.is_active = true");
      debugInfo.steps.push("Added active only filter");
    }

    if (lowStockOnly) {
      conditions.push("p.stock < 10 AND p.stock > 0");
      debugInfo.steps.push("Added low stock filter");
    }

    const whereClause = conditions.length > 0 
      ? "WHERE " + conditions.join(" AND ") 
      : "";
    
    debugInfo.whereClause = {
      raw: whereClause,
      conditions: conditions,
      params: [...params]
    };

    // Get all results
    const dataQuery = 
      "SELECT " +
      "p.id, " +
      "p.name, " +
      "p.description, " +
      "p.price, " +
      "p.sale_price AS \"salePrice\", " +
      "p.stock, " +
      "p.sku, " +
      "p.weight, " +
      "p.image, " +
      "p.images, " +
      "p.rating, " +
      "p.reviews, " +
      "p.is_active AS \"isActive\", " +
      "p.featured, " +
      "p.created_at AS \"createdAt\", " +
      "p.updated_at AS \"updatedAt\", " +
      "p.category_id AS \"categoryId\", " +
      "c.name AS \"categoryName\", " +
      "p.subcategory_id AS \"subcategoryId\", " +
      "s.name AS \"subcategoryName\" " +
      "FROM products p " +
      "LEFT JOIN categories c ON p.category_id = c.id " +
      "LEFT JOIN subcategories s ON p.subcategory_id = s.id " +
      (whereClause ? whereClause + " " : "") +
      "ORDER BY p." + sortBy + " " + sortOrder;
    
    debugInfo.dataQuery = {
      sql: dataQuery,
      params: [...params]
    };
    
    debugInfo.steps.push("Executing data query");
    const dataStart = Date.now();
    let result;
    
    try {
      result = await pool.query(dataQuery, params);
      debugInfo.steps.push({
        step: 'data_query',
        status: 'success',
        time: Date.now() - dataStart,
        rowCount: result.rowCount
      });
    } catch (dataError: any) {
      debugInfo.steps.push({
        step: 'data_query',
        status: 'failed',
        time: Date.now() - dataStart,
        error: dataError.message,
        code: dataError.code,
        query: dataQuery,
        params: params
      });
      throw dataError;
    }

    const response = {
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
      totalItems: result.rowCount
    };

    if (debugMode) {
      debugInfo.executionTime = Date.now() - startTime;
      return NextResponse.json({
        ...response,
        _debug: debugInfo
      });
    }
    
    return NextResponse.json(response);
  } catch (error: any) {
    debugInfo.executionTime = Date.now() - startTime;
    debugInfo.error = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: error.code,
      timestamp: new Date().toISOString()
    };

    // Handle specific database errors
    const dbErrorMap: Record<string, any> = {
      '22P02': { status: 400, message: 'Invalid ID format in request' },
      '23503': { status: 400, message: 'Invalid category reference' },
      '42601': { status: 500, message: 'SQL syntax error' },
      'ECONNREFUSED': { status: 503, message: 'Database connection refused' },
      'ETIMEDOUT': { status: 504, message: 'Database connection timeout' }
    };

    // Detect connection errors from message
    if (error.message.includes('connect ECONNREFUSED')) {
      error.code = 'ECONNREFUSED';
    } else if (error.message.includes('timeout')) {
      error.code = 'ETIMEDOUT';
    }

    const errorConfig = dbErrorMap[error.code] || { 
      status: 500, 
      message: 'Failed to fetch products' 
    };

    return debugResponse(
      error,
      errorConfig.message,
      errorConfig.status,
      debugInfo
    );
  }
}

// POST — Create new product with comprehensive validation
export async function POST(req: NextRequest) {
  const client = await pool.connect()
  const startTime = Date.now();
  const debugInfo: Record<string, any> = {
    steps: []
  };
  
  try {
    debugInfo.steps.push('Parsing request body');
    const data = await req.json()
    debugInfo.steps.push('Validating product data');
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
      // Use camelCase: categoryId
      categoryId,
      subcategoryId = null,
      rating = 4.0,
      reviews = 0,
      isActive = true,
      featured = false
    } = data

    // Additional validation
    if (salePrice !== null && salePrice >= price) {
      return debugResponse(
        null,
        'Sale price must be less than regular price',
        400,
        { salePrice, price }
      )
    }

    debugInfo.steps.push('Starting database transaction');
    await client.query('BEGIN')
    
    const productId = generateProductId()
    const query = `
      INSERT INTO products (
        id, name, description, price, sale_price, stock, sku, weight,
        image, images, category_id, subcategory_id, rating, reviews,
        is_active, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
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
    
    const queryParams = [
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
      categoryId,  // Use camelCase value
      subcategoryId,
      rating,
      reviews,
      isActive,
      featured
    ];
    
    debugInfo.query = {
      sql: query,
      params: queryParams
    };
    
    debugInfo.steps.push('Executing insert query');
    const result = await client.query(query, queryParams)

    await client.query('COMMIT')
    debugInfo.steps.push('Transaction committed');
    
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    await client.query('ROLLBACK')
    debugInfo.steps.push('Transaction rolled back');
    
    if (error.message.includes('unique constraint')) {
      return debugResponse(
        error,
        'Product with this SKU or name already exists',
        409,
        debugInfo
      );
    }
    
    // Handle specific database errors
    if (error.code === '22P02') {
      return debugResponse(
        error,
        'Invalid UUID format for category',
        400,
        debugInfo
      )
    }
    
    if (error.code === '23503') {
      return debugResponse(
        error,
        'Invalid category reference',
        400,
        debugInfo
      )
    }
    
    return debugResponse(
      error,
      'Invalid product data',
      400,
      debugInfo
    );
  } finally {
    client.release()
  }
}

// PATCH — Update existing product with partial updates
export async function PATCH(req: NextRequest) {
  const client = await pool.connect()
  const startTime = Date.now();
  const debugInfo: Record<string, any> = {
    steps: []
  };
  
  try {
    debugInfo.steps.push('Parsing request body');
    const { id, ...updates } = await req.json()
    debugInfo.updates = updates;

    if (!id) {
      return debugResponse(
        null,
        'Product ID is required',
        400,
        debugInfo
      );
    }

    // Validate at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return debugResponse(
        null,
        'No fields provided for update',
        400,
        debugInfo
      );
    }

    debugInfo.steps.push('Validating update data');
    validateProduct(updates, true)

    // Additional validation for sale price
    if ('salePrice' in updates && updates.salePrice !== null) {
      // We need to get current price if salePrice is being updated without price
      if (!('price' in updates)) {
        debugInfo.steps.push('Fetching current price for validation');
        const current = await client.query(
          'SELECT price FROM products WHERE id = $1',
          [id]
        )
        
        if (current.rows.length === 0) {
          return debugResponse(
            null,
            'Product not found',
            404,
            debugInfo
          );
        }
        
        const currentPrice = current.rows[0].price
        if (updates.salePrice >= currentPrice) {
          return debugResponse(
            null,
            'Sale price must be less than regular price',
            400,
            {
              currentPrice,
              salePrice: updates.salePrice,
              ...debugInfo
            }
          );
        }
      } else {
        if (updates.salePrice >= updates.price) {
          return debugResponse(
            null,
            'Sale price must be less than regular price',
            400,
            {
              price: updates.price,
              salePrice: updates.salePrice,
              ...debugInfo
            }
          );
        }
      }
    }

    // Prevent negative stock
    if ('stock' in updates && updates.stock < 0) {
      return debugResponse(
        null,
        'Stock cannot be negative',
        400,
        debugInfo
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
    values.push(id)

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
      return debugResponse(
        null,
        'Product not found',
        404,
        debugInfo
      );
    }

    await client.query('COMMIT')
    debugInfo.steps.push('Transaction committed');
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK')
    debugInfo.steps.push('Transaction rolled back');
    
    if (error.message.includes('unique constraint')) {
      return debugResponse(
        error,
        'Product with this SKU or name already exists',
        409,
        debugInfo
      );
    }
    
    // Handle specific database errors
    if (error.code === '22P02') {
      return debugResponse(
        error,
        'Invalid UUID format for category',
        400,
        debugInfo
      )
    }
    
    if (error.code === '23503') {
      return debugResponse(
        error,
        'Invalid category reference',
        400,
        debugInfo
      )
    }
    
    return debugResponse(
      error,
      'Failed to update product',
      400,
      debugInfo
    );
  } finally {
    client.release()
  }
}

// DELETE — Remove a product
export async function DELETE(req: NextRequest) {
  const client = await pool.connect()
  const startTime = Date.now();
  const debugInfo: Record<string, any> = {
    steps: []
  };
  
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    debugInfo.productId = id;
    
    if (!id) {
      return debugResponse(
        null,
        'Product ID is required',
        400,
        debugInfo
      );
    }

    debugInfo.steps.push('Starting database transaction');
    await client.query('BEGIN')

    // Check if product exists in any orders
    const orderCheckQuery = `SELECT COUNT(*) FROM order_items WHERE product_id = $1`;
    debugInfo.orderCheckQuery = {
      sql: orderCheckQuery,
      params: [id]
    };
    
    debugInfo.steps.push('Checking for existing orders');
    const orderCheck = await client.query(orderCheckQuery, [id])
    
    if (parseInt(orderCheck.rows[0].count) > 0) {
      return debugResponse(
        null,
        'Cannot delete product with existing orders',
        400,
        {
          orderCount: orderCheck.rows[0].count,
          ...debugInfo
        }
      );
    }

    const deleteQuery = `DELETE FROM products WHERE id = $1 RETURNING *`;
    debugInfo.deleteQuery = {
      sql: deleteQuery,
      params: [id]
    };
    
    debugInfo.steps.push('Executing delete query');
    const result = await client.query(deleteQuery, [id])
    
    if (result.rowCount === 0) {
      return debugResponse(
        null,
        'Product not found',
        404,
        debugInfo
      );
    }

    await client.query('COMMIT')
    debugInfo.steps.push('Transaction committed');
    return NextResponse.json(
      { success: true, message: 'Product deleted successfully' }
    );
  } catch (error: any) {
    await client.query('ROLLBACK')
    debugInfo.steps.push('Transaction rolled back');
    
  // Handle specific database errors
    if (error.code === '22P02') {
      return debugResponse(
        error,
        'Invalid UUID format for category',
        400,
        debugInfo
      )
    }
    
    if (error.code === '23503') {
      return debugResponse(
        error,
        'Invalid category reference',
        400,
        debugInfo
      )
    }
    
    return debugResponse(
      error,
      'Invalid product data',
      400,
      debugInfo
    );
  } finally {
    client.release()
  }
}

// PATCH — Update existing product with partial updates
export async function PATCH(req: NextRequest) {
  const client = await pool.connect()
  const startTime = Date.now();
  const debugInfo: Record<string, any> = {
    steps: []
  };
  
  try {
    debugInfo.steps.push('Parsing request body');
    const { id, ...updates } = await req.json()
    debugInfo.updates = updates;

    if (!id) {
      return debugResponse(
        null,
        'Product ID is required',
        400,
        debugInfo
      );
    }
    // Validate at least one field is being updated
    if (Object.keys(updates).length === 0) {
      return debugResponse(
        null,
        'No fields provided for update',
        400,
        debugInfo
      );
    }

    debugInfo.steps.push('Validating update data');
    validateProduct(updates, true)

    // Additional validation for sale price
    if ('salePrice' in updates && updates.salePrice !== null) {
      // We need to get current price if salePrice is being updated without price
      if (!('price' in updates)) {
        debugInfo.steps.push('Fetching current price for validation');
        const current = await client.query(
          'SELECT price FROM products WHERE id = $1',
          [id]
        )
        
        if (current.rows.length === 0) {
          return debugResponse(
            null,
            'Product not found',
            404,
            debugInfo
          );
        }
        
        const currentPrice = current.rows[0].price
        if (updates.salePrice >= currentPrice) {
          return debugResponse(
            null,
            'Sale price must be less than regular price',
            400,
            {
              currentPrice,
              salePrice: updates.salePrice,
              ...debugInfo
            }
          );
        }
      } else {
        if (updates.salePrice >= updates.price) {
          return debugResponse(
            null,
            'Sale price must be less than regular price',
            400,
            {
              price: updates.price,
              salePrice: updates.salePrice,
              ...debugInfo
            }
          );
        }
      }
    }
        // Prevent negative stock
    if ('stock' in updates && updates.stock < 0) {
      return debugResponse(
        null,
        'Stock cannot be negative',
        400,
        debugInfo
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
    values.push(id)

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
      return debugResponse(
        null,
        'Product not found',
        404,
        debugInfo
      );
    }

    await client.query('COMMIT')
    debugInfo.steps.push('Transaction committed');
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    await client.query('ROLLBACK')
    debugInfo.steps.push('Transaction rolled back');
    
    if (error.message.includes('unique constraint')) {
      return debugResponse(
        error,
        'Product with this SKU or name already exists',
        409,
        debugInfo
      );
    }
    // Handle specific database errors
    if (error.code === '22P02') {
      return debugResponse(
        error,
        'Invalid UUID format for category',
        400,
        debugInfo
      )
    }
    
    if (error.code === '23503') {
      return debugResponse(
        error,
        'Invalid category reference',
        400,
        debugInfo
      )
    }
    
    return debugResponse(
      error,
      'Failed to update product',
      400,
      debugInfo
    );
  } finally {
    client.release()
  }
}

// DELETE — Remove a product
export async function DELETE(req: NextRequest) {
  const client = await pool.connect()
  const startTime = Date.now();
  const debugInfo: Record<string, any> = {
    steps: []
  };
  
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    debugInfo.productId = id;
    
    if (!id) {
      return debugResponse(
        null,
        'Product ID is required',
        400,
        debugInfo
      );
    }

    debugInfo.steps.push('Starting database transaction');
    await client.query('BEGIN')
    // Check if product exists in any orders
    const orderCheckQuery = `SELECT COUNT(*) FROM order_items WHERE product_id = $1`;
    debugInfo.orderCheckQuery = {
      sql: orderCheckQuery,
      params: [id]
    };
    
    debugInfo.steps.push('Checking for existing orders');
    const orderCheck = await client.query(orderCheckQuery, [id])
    
    if (parseInt(orderCheck.rows[0].count) > 0) {
      return debugResponse(
        null,
        'Cannot delete product with existing orders',
        400,
        {
          orderCount: orderCheck.rows[0].count,
          ...debugInfo
        }
      );
    }

    const deleteQuery = `DELETE FROM products WHERE id = $1 RETURNING *`;
    debugInfo.deleteQuery = {
      sql: deleteQuery,
      params: [id]
    };
    
    debugInfo.steps.push('Executing delete query');
    const result = await client.query(deleteQuery, [id])
    
    if (result.rowCount === 0) {
      return debugResponse(
        null,
        'Product not found',
        404,
        debugInfo
      );
    }

    await client.query('COMMIT')
    debugInfo.steps.push('Transaction committed');
    return NextResponse.json(
      { success: true, message: 'Product deleted successfully' }
    );
  } catch (error: any) {
    await client.query('ROLLBACK')
    debugInfo.steps.push('Transaction rolled back');
    
    // Handle specific database errors
    if (error.code === '22P02') {
      return debugResponse(
        error,
        'Invalid UUID format for product ID',
        400,
        debugInfo
      )
    }
    
    return debugResponse(
      error,
      'Failed to delete product',
      500,
      debugInfo
    );
  } finally {
    client.release()
  }
}
