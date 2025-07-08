import { NextResponse } from 'next/server'
import { pool } from '@/lib/database'

interface AnalyticsData {
  totalProducts: number
  totalOrders: number
  monthlyRevenue: number
  topProducts: { product_name: string, order_count: number }[]
  conversionRate: number
  avgOrderValue: number
  customerSatisfaction: number
}

export async function GET() {
  try {
    const client = await pool.connect()
    try {
      // PostgreSQL-compatible queries
      const [productsResult, ordersResult, revenueResult, topProductsResult] = await Promise.all([
        client.query('SELECT COUNT(*) as total FROM products'),
        client.query('SELECT COUNT(*) as total FROM orders'),
        client.query('SELECT SUM(total_amount) as total FROM orders WHERE created_at >= NOW() - INTERVAL \'30 days\''),
        client.query(`
          SELECT 
            product_name,
            COUNT(*) as order_count
          FROM (
            SELECT jsonb_array_elements(items) ->> 'name' AS product_name
            FROM orders
            WHERE created_at >= NOW() - INTERVAL '30 days'
          ) sub
          GROUP BY product_name
          ORDER BY order_count DESC
          LIMIT 5
        `)
      ])

      const analytics: AnalyticsData = {
        totalProducts: parseInt(productsResult.rows[0]?.total ?? '0', 10),
        totalOrders: parseInt(ordersResult.rows[0]?.total ?? '0', 10),
        monthlyRevenue: parseFloat(revenueResult.rows[0]?.total ?? '0'),
        topProducts: (topProductsResult.rows || []).map((row: any) => ({
          product_name: row.product_name,
          order_count: Number(row.order_count)
        })),
        conversionRate: 3.2, // Mock data
        avgOrderValue: 145.50, // Mock data
        customerSatisfaction: 4.6 // Mock data
      }

      return NextResponse.json(analytics)
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    // Return mock data if database is not available
    return NextResponse.json({
      totalProducts: 25,
      totalOrders: 150,
      monthlyRevenue: 15750.00,
      topProducts: [
        { product_name: "Wireless Headphones", order_count: 12 },
        { product_name: "Designer Sunglasses", order_count: 8 },
        { product_name: "Skincare Set", order_count: 6 }
      ],
      conversionRate: 3.2,
      avgOrderValue: 145.50,
      customerSatisfaction: 4.6
    })
  }
}

export async function POST(request: Request) {
  try {
    const event = await request.json()
    // Log analytics event (view, click, purchase, etc.)
    console.log('Analytics event:', event)
    // In a real app, you'd save this to a database
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging analytics event:', error)
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}
