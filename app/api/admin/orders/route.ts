
import { NextResponse } from 'next/server'
import { storeManager } from '@/lib/store'

export async function GET() {
  try {
    // First try to get orders from store manager
    const orders = await storeManager.getOrders()
    console.log('Fetched orders from store manager:', orders.length)
    
    if (orders.length > 0) {
      return NextResponse.json(orders)
    }
  } catch (error) {
    console.error('Error fetching orders from store manager:', error)

    // Enhanced fallback data as backup
  const fallbackOrders = [
      {
        id: "1",
        orderId: "HS-1234567890",
        userId: "user_1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "01700000000",
        address: "123 Main St",
        city: "Dhaka",
        items: [
          {
            id: "1",
            name: "Premium Wireless Headphones",
            price: 199.99,
            quantity: 1,
            image: "/placeholder.svg"
          }
        ],
        subtotal: 199.99,
        shipping: 120,
        vat: 31.99,
        totalAmount: 351.98,
        status: "shipped",
        paymentMethod: "Cash on Delivery",
        paymentStatus: "pending",
        estimatedDelivery: "2-3 business days",
        trackingNumber: "TRK-123456789",
        notes: null,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      },
      {
        id: "2", 
        orderId: "HS-0987654321",
        userId: "user_2",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        customerPhone: "01800000000",
        address: "456 Oak Ave",
        city: "Chittagong",
        items: [
          {
            id: "2",
            name: "Smart Watch Pro",
            price: 299.99,
            quantity: 1,
            image: "/placeholder.svg"
          }
        ],
        subtotal: 299.99,
        shipping: 120,
        vat: 41.99,
        totalAmount: 461.98,
        status: "processing",
        paymentMethod: "Cash on Delivery",
        paymentStatus: "pending",
        estimatedDelivery: "3-4 business days",
        trackingNumber: "TRK-987654321",
        notes: null,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "3",
        orderId: "HS-1122334455",
        userId: "user_1",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "01700000000",
        address: "123 Main St",
        city: "Dhaka",
        items: [
          {
            id: "3",
            name: "Casual T-Shirt",
            price: 29.99,
            quantity: 2,
            image: "/placeholder.svg"
          }
        ],
        subtotal: 59.98,
        shipping: 120,
        vat: 9.60,
        totalAmount: 189.58,
        status: "delivered",
        paymentMethod: "Cash on Delivery",
        paymentStatus: "completed",
        estimatedDelivery: "1-2 business days",
        trackingNumber: "TRK-112233445",
        notes: null,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]

    console.log('Using fallback orders:', fallbackOrders.length)
  return NextResponse.json(fallbackOrders)
}
