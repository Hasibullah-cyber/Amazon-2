'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Truck, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  name: string
  price: number
  quantity: number
  image?: string
}

interface OrderData {
  orderId: string
  trackingNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  paymentMethod: string
  estimatedDelivery: string
  status: string
  items: OrderItem[]
  address?: string
  city?: string
  phone?: string
  subtotal?: number
  shipping?: number
  vat?: number
  createdAt?: string
  updatedAt?: string
}

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trackOrder = async () => {
      const trackingNumber = searchParams.get('trackingNumber')

      if (!trackingNumber) {
        setError('No tracking number provided')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`/api/orders/track?trackingNumber=${encodeURIComponent(trackingNumber)}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch order details')
        }

        const data = await response.json()
        
        if (!data.success || !data.order) {
          throw new Error('Invalid order data received from server')
        }

        setOrder(data.order)
        setError(null)
      } catch (err: any) {
        console.error('Tracking error:', err)
        setError(err.message || 'Failed to track order. Please try again.')
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    // Add slight delay to allow animations to render
    const timer = setTimeout(trackOrder, 100)
    return () => clearTimeout(timer)
  }, [searchParams])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-semibold">Tracking Your Order</h2>
        <p className="text-gray-500 mt-2">Please wait while we retrieve your order details</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12">
        <div className="max-w-md w-full p-6 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Tracking Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Tracking</h1>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4">
            <p className="text-gray-600">
              Tracking Number: <span className="font-mono font-semibold bg-gray-100 px-2 py-1 rounded">{order.trackingNumber}</span>
            </p>
            <p className="text-gray-600">
              Status: <span className="capitalize font-medium text-blue-600">{order.status}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="h-5 w-5 text-blue-500" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Delivery Status</h3>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      {order.status === 'shipped' && (
                        <span className="text-sm text-gray-500">In transit</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Estimated Delivery</h3>
                    <p className="text-gray-600">{order.estimatedDelivery || 'Not specified'}</p>
                  </div>

                  {order.address && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Shipping Address</h3>
                      <div className="text-gray-600 space-y-1">
                        <p>{order.customerName}</p>
                        <p>{order.address}</p>
                        {order.city && <p>{order.city}</p>}
                        {order.phone && <p>Phone: {order.phone}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-blue-500" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start py-4 first:pt-0 last:pb-0">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <Package className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      <div className="ml-4 flex-1">
                        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>

                      <div className="ml-4">
                        <p className="text-base font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500 mt-1">
                            ${item.price.toFixed(2)} each
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({order.items.length} items)</span>
                    <span className="font-medium">${order.subtotal?.toFixed(2) || '0.00'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${order.shipping?.toFixed(2) || '0.00'}</span>
                  </div>

                  {order.vat && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax (VAT)</span>
                      <span className="font-medium">${order.vat.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4 mt-2 flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 rounded-lg shadow-sm">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg">Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                    <p className="mt-1 text-sm text-gray-900 capitalize">
                      {order.paymentMethod.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(order.createdAt || '').toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {order.paymentMethod.toLowerCase().includes('card') && (
                    <div className="pt-2">
                      <p className="text-xs text-gray-500">
                        Your payment has been processed. A receipt was sent to {order.customerEmail}.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">Continue Shopping</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/contact">Need Help?</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  )
      }
