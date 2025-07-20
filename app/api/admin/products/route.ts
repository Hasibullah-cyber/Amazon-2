// ✅ GET all products with pagination
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const offset = (page - 1) * limit

  try {
    const result = await pool.query(
      `
      SELECT 
        p.*, 
        c.name AS category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id::TEXT = c.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    )

    const products = result.rows.map((row) => ({
      ...row,
      price: Number(row.price ?? 0),
      stock: Number(row.stock ?? 0),
      category: {
        id: row.category?.id || row.category_id || 'uncategorized',
        name: row.category?.name || row.category_name || 'Uncategorized',
      },
    }))

    return NextResponse.json({ products, page, limit })
  } catch (error) {
    console.error('Database error fetching products:', error)

    const fallbackProducts = [
      {
        id: '1',
        name: 'Sample Product',
        description: 'This is a sample product',
        price: 99.99,
        stock: 50,
        category: { id: 'sample', name: 'electronics' },
        image: '/placeholder.svg',
        rating: 4.5,
        reviews: 123,
        created_at: new Date().toISOString(),
      },
    ]

    return NextResponse.json({ products: fallbackProducts, page: 1, limit: 1 })
  }
}
