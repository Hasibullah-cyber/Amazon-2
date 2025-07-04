'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2, Truck, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OrderConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderId = searchParams.get('orderId')
        if (!orderId) throw new Error('Missing order ID')

        // Try API first
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) throw new Error('Order not found')

        const data = await response.json()
        if (!data.success) throw new Error(data.error || 'Invalid order data')

        setOrder(data.order)
        
        // Fallback: Save to localStorage
        localStorage.setItem(`order-${orderId}`, JSON.stringify(data.order))

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [searchParams])

  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
        <p className="mt-4">Loading your order...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold mt-4">Order Not Found</h1>
        <p className="mt-2 text-gray-600">{error}</p>
        <Button 
          onClick={() => router.push('/orders')}
          className="mt-6"
        >
          View Order History
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-3xl font-bold mt-4">Order Confirmed!</h1>
        <p className="text-lg text-gray-600 mt-2">
          Thank you for your purchase, {order.customer_name}!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Order ID:</span> {order.order_id}</p>
            <p><span className="font-medium">Date:</span> {new Date(order.created_at).toLocaleDateString()}</p>
            <p><span className="font-medium">Total:</span> ${order.total_amount.toFixed(2)}</p>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Delivery Information</h2>
          <div className="flex items-start gap-3">
            <Truck className="text-blue-500 mt-1" />
            <div>
              <p className="font-medium">Tracking Number:</p>
              <p>{order.tracking_number}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 mt-4">
            <Clock className="text-blue-500 mt-1" />
            <div>
              <p className="font-medium">Estimated Delivery:</p>
              <p>{order.estimated_delivery || '3-5 business days'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => router.push('/')}>
          Continue Shopping
        </Button>
        <Button 
          variant="outline" 
          onClick={() => router.push(`/track-order?orderId=${order.order_id}`)}
        >
          Track Order
        </Button>
      </div>
    </div>
  )
}
