import { NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/database"

export const dynamic = "force-dynamic"

// Safely parse JSON
async function parseJsonBody(req: NextRequest) {
  try {
    return await req.json()
  } catch (error) {
    return null
  }
}

// GET — Fetch a single order
export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  console.log("🔍 [GET] Fetch order by ID:", orderId)

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()

    const result = await client.query(
      `SELECT * FROM orders WHERE order_id = $1`,
      [orderId]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order: result.rows[0] })
  } catch (error) {
    console.error("🔥 [GET] DB error:", error)
    return NextResponse.json({ error: "Failed to fetch order", details: error.message }, { status: 500 })
  } finally {
    client?.release()
  }
}

// PATCH — Update order status and add to status history
export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params
  const body = await parseJsonBody(req)

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { status, notes } = body
  if (!status) {
    return NextResponse.json({ error: "Missing 'status'" }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()
    const existing = await client.query(`SELECT * FROM orders WHERE order_id = $1`, [orderId])
    if (existing.rowCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const oldStatus = existing.rows[0].status

    await client.query("BEGIN")

    const updated = await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *`,
      [status, orderId]
    )

    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes, created_by, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [orderId, status, notes || `Status changed from ${oldStatus} to ${status}`, "admin"]
    )

    await client.query("COMMIT")

    return NextResponse.json({ success: true, order: updated.rows[0] })
  } catch (error) {
    await client?.query("ROLLBACK")
    console.error("🔥 [PATCH] Update failed:", error)
    return NextResponse.json({ error: "Failed to update order", details: error.message }, { status: 500 })
  } finally {
    client?.release()
  }
}

// DELETE — Delete order and related status history
export async function DELETE(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { orderId } = params

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
  }

  let client
  try {
    client = await pool.connect()

    const orderCheck = await client.query(
      `SELECT * FROM orders WHERE order_id = $1`,
      [orderId]
    )

    if (orderCheck.rowCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    await client.query("BEGIN")

    await client.query(
      `DELETE FROM order_status_history WHERE order_id = $1`,
      [orderId]
    )

    const deleted = await client.query(
      `DELETE FROM orders WHERE order_id = $1`,
      [orderId]
    )

    await client.query("COMMIT")

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
      deletedRows: deleted.rowCount,
    })
  } catch (error) {
    await client?.query("ROLLBACK")
    console.error("🔥 [DELETE] Failed to delete order:", error)
    return NextResponse.json({ error: "Failed to delete order", details: error.message }, { status: 500 })
  } finally {
    client?.release()
  }
        }
