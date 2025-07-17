import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
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
    avgOrderValue: 145.5,
    customerSatisfaction: 4.6
  })
}
