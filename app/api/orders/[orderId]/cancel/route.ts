import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log("👤 [POST] Cancel order requested:", orderId)

  if (!orderId) {
    console.error("❌ [POST] Missing orderId in params")
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    console.log("🔗 [POST] Database client connected")

    try {
      // Fetch the order to confirm it exists
      const orderResult = await client.query(
        `SELECT * FROM orders WHERE order_id = $1`,
        [orderId]
      )
      console.log(`📊 [POST] Query order returned rows: ${orderResult.rowCount}`)

      if (orderResult.rowCount === 0) {
        console.warn(`⚠️ [POST] Order not found: ${orderId}`)
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }

      const order = orderResult.rows[0]

      if (order.status === "cancelled") {
        console.info(`ℹ️ [POST] Order already cancelled: ${orderId}`)
        return NextResponse.json({ message: "Order already cancelled" })
      }

      // TODO: OPTIONAL: Check if the logged-in user owns this order

      await client.query("BEGIN")
      console.log("🔄 [POST] Transaction started")

      // Update order status to cancelled
      const updateResult = await client.query(
        `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE order_id = $1 RETURNING *`,
        [orderId]
      )
      console.log(`📊 [POST] Order update affected rows: ${updateResult.rowCount}`)

      // Insert cancellation record into status history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [orderId, "cancelled", "Cancelled by user", "user"]
      )
      console.log("✅ [POST] Inserted cancellation status history record")

      await client.query("COMMIT")
      console.log("✅ [POST] Transaction committed")

      return NextResponse.json({ success: true, message: "Order cancelled successfully" })
    } catch (dbError) {
      await client.query("ROLLBACK")
      console.error("🔥 [POST] DB transaction error, rolled back:", dbError)
      return NextResponse.json({ error: "Failed to cancel order", details: dbError.message }, { status: 500 })
    } finally {
      client.release()
      console.log("🔗 [POST] Database client released")
    }
  } catch (connError) {
    console.error("❌ [POST] DB connection error:", connError)
    return NextResponse.json({ error: "Internal server error", details: connError.message }, { status: 500 })
  }
}
