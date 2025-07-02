
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Package, Clock, Truck } from 'lucide-react'

interface OrderData {
  orderId: string
  trackingNumber: string
  customerName: string
  customerEmail: string
  totalAmount: number
  paymentMethod: string
  estimatedDelivery: string
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
    image?: string
  }>
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const dataParam = searchParams.get('data')
    const orderIdParam = searchParams.get('orderId')

    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam))
        setOrderData(decoded)
        setLoading(false)
      } catch (error) {
        console.error('Error parsing order data:', error)
        setLoading(false)
      }
    } else if (orderIdParam) {
      // Fetch order by ID if only orderId is provided
      fetchOrderById(orderIdParam)
    } else {
      setLoading(false)
    }
  }, [searchParams])

  const fetchOrderById = async (orderId: string) => {
    try {
      const response = await fetch(`/api/track-order?orderId=${orderId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.order) {
          setOrderData({
            orderId: data.order.orderId,
            trackingNumber: data.order.trackingNumber,
            customerName: data.order.customerName,
            customerEmail: data.order.customerEmail,
            totalAmount: data.order.totalAmount,
            paymentMethod: data.order.paymentMethod,
            estimatedDelivery: data.order.estimatedDelivery,
            items: data.order.items
          })
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order confirmation...</p>
        </div>
      </div>
    )
  }

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your order confirmation. This might happen if:
          </p>
          <ul className="text-left text-gray-600 mb-6 space-y-2">
            <li>• The order was not successfully placed</li>
            <li>• The confirmation link is invalid</li>
            <li>• There was a technical issue</li>
          </ul>
          <div className="space-y-4">
            <Button onClick={() => router.push('/track-order')} className="amazon-button">
              Track Your Order
            </Button>
            <Button onClick={() => router.push('/')} variant="outline">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600">Thank you for your order. We'll send you updates via email.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono font-semibold">{orderData.orderId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Tracking Number</p>
                  <p className="font-mono font-semibold">{orderData.trackingNumber}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{orderData.customerName}</p>
                  <p className="text-sm text-gray-600">{orderData.customerEmail}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold">{orderData.paymentMethod}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg">৳{orderData.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-semibold">Estimated Delivery</p>
                    <p className="text-gray-600">{orderData.estimatedDelivery}</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">What's Next?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• You'll receive an email confirmation shortly</li>
                    <li>• We'll notify you when your order is shipped</li>
                    <li>• Track your order anytime with the tracking number</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Package className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.name}</h4>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-sm text-gray-600">৳{item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button 
            onClick={() => router.push(`/track-order?orderId=${orderData.orderId}`)}
            className="amazon-button"
          >
            Track This Order
          </Button>
          <Button 
            onClick={() => router.push('/')}
            variant="outline"
          >
            Continue Shopping
          </Button>
          <Button 
            onClick={() => router.push('/order-history')}
            variant="outline"
          >
            View All Orders
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order confirmation...</p>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
