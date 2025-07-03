'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Package, Clock, Truck, AlertCircle, RefreshCw } from 'lucide-react'

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
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    console.log('OrderConfirmation: Component mounted')
    loadOrderData()
  }, [])

  const loadOrderData = async () => {
    console.log('OrderConfirmation: Loading order data...')
    setLoading(true)
    setError(null)
    
    try {
      const orderIdParam = searchParams.get('orderId')
      const dataParam = searchParams.get('data')
      
      // Debug information
      const debug = {
        orderIdParam,
        dataParam: dataParam ? 'present' : 'missing',
        localStorage: null,
        sessionStorage: null,
        urlLength: window.location.href.length
      }

      console.log('OrderConfirmation: URL params:', { orderIdParam, dataParam: dataParam?.substring(0, 100) })

      // Priority 1: Check localStorage for latest order
      if (typeof window !== 'undefined') {
        try {
          const storedOrder = localStorage.getItem('latest-order')
          debug.localStorage = storedOrder ? 'present' : 'missing'
          
          if (storedOrder) {
            const parsedOrder = JSON.parse(storedOrder)
            console.log('OrderConfirmation: Found order in localStorage:', parsedOrder)
            
            // Validate the stored order
            if (parsedOrder.orderId && parsedOrder.totalAmount) {
              setOrderData(parsedOrder)
              setLoading(false)
              setDebugInfo(debug)
              return
            }
          }

          // Also check sessionStorage
          const sessionOrder = sessionStorage.getItem('latest-order')
          debug.sessionStorage = sessionOrder ? 'present' : 'missing'
          
          if (sessionOrder) {
            const parsedOrder = JSON.parse(sessionOrder)
            console.log('OrderConfirmation: Found order in sessionStorage:', parsedOrder)
            
            if (parsedOrder.orderId && parsedOrder.totalAmount) {
              setOrderData(parsedOrder)
              setLoading(false)
              setDebugInfo(debug)
              return
            }
          }
        } catch (error) {
          console.error('Error reading order from storage:', error)
          debug.localStorage = 'error'
          debug.sessionStorage = 'error'
        }
      }

      // Priority 2: Try URL data parameter
      if (dataParam) {
        try {
          console.log('OrderConfirmation: Attempting to decode URL data...')
          const decoded = JSON.parse(decodeURIComponent(dataParam))
          console.log('OrderConfirmation: Successfully decoded data:', decoded)
          
          if (decoded.orderId && decoded.totalAmount) {
            setOrderData(decoded)
            setLoading(false)
            setDebugInfo(debug)
            return
          }
        } catch (error) {
          console.error('Error parsing order data from URL:', error)
        }
      }

      // Priority 3: Fetch by order ID from API
      if (orderIdParam) {
        console.log('OrderConfirmation: Fetching order by ID:', orderIdParam)
        const fetchResult = await fetchOrderById(orderIdParam)
        if (fetchResult) {
          setDebugInfo(debug)
          return
        }
      }

      // No valid order data found
      console.log('OrderConfirmation: No order data found')
      setError('No order information found')
      setDebugInfo(debug)
      
    } catch (error) {
      console.error('OrderConfirmation: Error in loadOrderData:', error)
      setError(`Failed to load order information: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderById = async (orderId: string): Promise<boolean> => {
    try {
      console.log('OrderConfirmation: Fetching order with ID:', orderId)
      const response = await fetch(`/api/orders/${orderId}`)
      
      if (!response.ok) {
        // Try alternative API endpoint
        const altResponse = await fetch(`/api/track-order?orderId=${orderId}`)
        if (!altResponse.ok) {
          throw new Error(`Failed to fetch order: ${response.status} / ${altResponse.status}`)
        }
        return await processOrderResponse(altResponse)
      }
      
      return await processOrderResponse(response)
    } catch (error) {
      console.error('OrderConfirmation: Error fetching order:', error)
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return false
    }
  }

  const processOrderResponse = async (response: Response): Promise<boolean> => {
    const data = await response.json()
    console.log('OrderConfirmation: API response:', data)
    
    if (data.success && data.order) {
      const order = data.order
      const orderInfo: OrderData = {
        orderId: order.orderId || order.order_id || order.id || 'Unknown',
        trackingNumber: order.trackingNumber || order.tracking_number || `TRK${order.orderId || order.id}`,
        customerName: order.customerName || order.customer_name || 'Customer',
        customerEmail: order.customerEmail || order.customer_email || '',
        totalAmount: parseFloat(order.totalAmount || order.total_amount || order.total || 0),
        paymentMethod: order.paymentMethod || order.payment_method || 'Cash on Delivery',
        estimatedDelivery: order.estimatedDelivery || order.estimated_delivery || '3-5 business days',
        items: order.items || []
      }
      
      console.log('OrderConfirmation: Setting order data:', orderInfo)
      setOrderData(orderInfo)
      return true
    }
    
    setError('Order not found or invalid response format')
    return false
  }

  const handleRetry = () => {
    loadOrderData()
  }

  const handleSendConfirmationEmail = async () => {
    if (!orderData) return
    
    try {
      const response = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: orderData.customerEmail,
          orderDetails: {
            orderId: orderData.orderId,
            customerName: orderData.customerName,
            items: orderData.items,
            subtotal: orderData.totalAmount - 100, // Assuming 100 is shipping
            shipping: 100,
            totalAmount: orderData.totalAmount
          }
        })
      })
      
      if (response.ok) {
        alert('Confirmation email sent successfully!')
      } else {
        alert('Failed to send confirmation email')
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error)
      alert('Error sending confirmation email')
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

  if (error || !orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-orange-600 mb-4">Order Confirmation Issue</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold">Error: {error}</p>
            </div>
          )}
          
          {/* Debug Information */}
          {debugInfo && (
            <details className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
              <summary className="font-semibold cursor-pointer">Debug Information</summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          )}
          
          <p className="text-gray-600 mb-6">
            We're having trouble loading your order confirmation. This might happen if:
          </p>
          <ul className="text-left text-gray-600 mb-6 space-y-2 max-w-md mx-auto">
            <li>• The page was refreshed before data loaded</li>
            <li>• The confirmation link was incomplete</li>
            <li>• There was a temporary network issue</li>
            <li>• The order data wasn't properly saved</li>
          </ul>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-800 font-semibold mb-2">Don't worry!</p>
            <p className="text-blue-700 text-sm">
              Your order may have been successfully placed. Check your email for a confirmation,
              or try tracking your order with the order ID you received.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button onClick={handleRetry} className="amazon-button">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={() => router.push('/track-order')} variant="outline">
              Track Order
            </Button>
            <Button onClick={() => router.push('/order-history')} variant="outline">
              Order History
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
                  <p className="font-mono font-semibold text-lg">{orderData.orderId}</p>
                </div>
                
                {orderData.trackingNumber && (
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-mono font-semibold">{orderData.trackingNumber}</p>
                  </div>
                )}
                
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
                  <p className="font-semibold text-lg text-green-600">৳{orderData.totalAmount.toFixed(2)}</p>
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
                
                {orderData.customerEmail && (
                  <Button 
                    onClick={handleSendConfirmationEmail}
                    variant="outline"
                    className="w-full"
                  >
                    Resend Confirmation Email
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        {orderData.items && orderData.items.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Order Items ({orderData.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
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
        )}

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
