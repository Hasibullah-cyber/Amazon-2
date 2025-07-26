import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/database"

export const dynamic = "force-dynamic"

// Helper to parse JSON safely
async function parseJsonBody(req: NextRequest) {
  try {
    return await req.json()
  } catch (error) {
    return null
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log("🔍 [GET] Admin fetch order:", orderId)

  if (!orderId) {
    console.error("❌ [GET] Missing orderId in params")
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    console.log("✅ [GET] DB client connected")

    const result = await client.query(`SELECT * FROM orders WHERE order_id = $1`, [orderId])
    console.log("📦 [GET] Query result rowCount:", result.rowCount)

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order: result.rows[0] })
  } catch (error) {
    console.error("🔥 [GET] DB error:", error)
    return NextResponse.json({ error: "Failed to fetch order", details: error.message }, { status: 500 })
  } finally {
    client?.release()
    console.log("🔓 [GET] DB client released")
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log("✏️ [PATCH] Admin update order:", orderId)

  if (!orderId) {
    console.error("❌ [PATCH] Missing orderId in params")
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  const data = await parseJsonBody(req)
  if (!data) {
    console.error("❌ [PATCH] Invalid JSON body")
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // Example: only allow updating status for now
  const { status, notes } = data
  if (!status) {
    console.error("❌ [PATCH] Missing 'status' field in body")
    return NextResponse.json({ error: "Missing 'status' field" }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    console.log("✅ [PATCH] DB client connected")

    // Fetch order to check existence
    const orderRes = await client.query(`SELECT * FROM orders WHERE order_id = $1`, [orderId])
    if (orderRes.rowCount === 0) {
      console.warn(`⚠️ [PATCH] Order not found: ${orderId}`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
    const oldStatus = orderRes.rows[0].status

    await client.query("BEGIN")
    console.log("🔄 [PATCH] Transaction started")

    // Update order status and updated_at timestamp
    const updateRes = await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *`,
      [status, orderId]
    )
    console.log(`📊 [PATCH] Order update affected rows: ${updateRes.rowCount}`)

    // Insert into order_status_history
    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [orderId, status, notes || `Status changed from ${oldStatus} to ${status}`, "admin"]
    )
    console.log("✅ [PATCH] Inserted status history record")

    await client.query("COMMIT")
    console.log("✅ [PATCH] Transaction committed")

    return NextResponse.json({ success: true, order: updateRes.rows[0] })
  } catch (error) {
    await client?.query("ROLLBACK")
    console.error("🔥 [PATCH] DB transaction error, rolled back:", error)
    return NextResponse.json({ error: "Failed to update order", details: error.message }, { status: 500 })
  } finally {
    client?.release()
    console.log("🔓 [PATCH] DB client released")
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log("🗑️ [DELETE] Admin delete order:", orderId)

  if (!orderId) {
    console.error("❌ [DELETE] Missing orderId in params")
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    console.log("✅ [DELETE] DB client connected")

    // Check if order exists
    const orderRes = await client.query(`SELECT * FROM orders WHERE order_id = $1`, [orderId])
    if (orderRes.rowCount === 0) {
      console.warn(`⚠️ [DELETE] Order not found: ${orderId}`)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    await client.query("BEGIN")
    console.log("🔄 [DELETE] Transaction started")

    // Delete related order_status_history records first (if FK constraints require)
    await client.query(`DELETE FROM order_status_history WHERE order_id = $1`, [orderId])
    console.log("🗑️ [DELETE] Deleted order status history records")

    // Delete the order
    const deleteRes = await client.query(`DELETE FROM orders WHERE order_id = $1`, [orderId])
    console.log(`🗑️ [DELETE] Deleted order rows count: ${deleteRes.rowCount}`)

    await client.query("COMMIT")
    console.log("✅ [DELETE] Transaction committed")

    return NextResponse.json({ success: true, message: "Order deleted successfully" })
  } catch (error) {
    await client?.query("ROLLBACK")
    console.error("🔥 [DELETE] DB transaction error, rolled back:", error)
    return NextResponse.json({ error: "Failed to delete order", details: error.message }, { status: 500 })
  } finally {
    client?.release()
    console.log("🔓 [DELETE] DB client released")
  }
}
