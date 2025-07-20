import { NextResponse } from "next/server";
import { pool } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await pool.connect();

    // Total products
    const totalProductsRes = await client.query(`SELECT COUNT(*) FROM products`);
    const totalProducts = Number(totalProductsRes.rows[0].count);

    // Total orders
    const totalOrdersRes = await client.query(`SELECT COUNT(*) FROM orders`);
    const totalOrders = Number(totalOrdersRes.rows[0].count);

    // Monthly revenue (sum of order totals excluding cancelled)
    const monthlyRevenueRes = await client.query(`
      SELECT COALESCE(SUM(total), 0) AS monthly_revenue
      FROM orders
      WHERE status != 'cancelled'
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    const monthlyRevenue = Number(monthlyRevenueRes.rows[0].monthly_revenue);

    // Order counts grouped by status
    const orderStatusCountsRes = await client.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    const orderStatusCounts = orderStatusCountsRes.rows.reduce((acc, row) => {
      acc[row.status] = Number(row.count);
      return acc;
    }, {} as Record<string, number>);

    // Top 5 products by total quantity sold
    const topProductsRes = await client.query(`
      SELECT p.id, p.name, SUM(oi.quantity) AS total_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);
    const topProducts = topProductsRes.rows;

    // Dummy conversion rate and customer satisfaction
    const conversionRate = 3.5;
    const customerSatisfaction = 90.0;

    // Average order value
    const avgOrderValue = totalOrders > 0 ? monthlyRevenue / totalOrders : 0;

    client.release();

    return NextResponse.json({
      totalProducts,
      totalOrders,
      monthlyRevenue,
      orderStatusCounts,
      topProducts,
      conversionRate,
      avgOrderValue,
      customerSatisfaction,
      totalRevenue: monthlyRevenue,
    }, { status: 200 });
  } catch (error) {
    console.error("[API][ADMIN][STATS] Error:", error);
    // Return fallback data with status 200 (OK)
    return NextResponse.json(
      {
        totalProducts: 0,
        totalOrders: 0,
        monthlyRevenue: 0,
        orderStatusCounts: {},
        topProducts: [],
        conversionRate: 0,
        avgOrderValue: 0,
        customerSatisfaction: 0,
        totalRevenue: 0,
      },
      { status: 200 }
    );
  }
}
