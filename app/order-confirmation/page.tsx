'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Package, Truck, MapPin, Calendar, CreditCard, Mail, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface OrderData {
  orderId: string
  trackingNumber?: string
  customerName: string
  customerEmail: string
  totalAmount: number
  paymentMethod: string
  estimatedDelivery: string
  items: OrderItem[]
  address?: string
  city?: string
  phone?: string
  subtotal?: number
  shipping?: number
  vat?: number
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [sendingNotifications, setSendingNotifications] = useState(false)

  useEffect(() => {
    const loadOrderData = async () => {
      const orderId = searchParams.get('orderId')
      
      try {
        if (typeof window !== 'undefined') {
          const savedOrder = localStorage.getItem('latest-order')
          if (savedOrder) {
            const parsed = JSON.parse(savedOrder)
            if (!orderId || parsed.orderId === orderId) {
              setOrderData(parsed)
              setLoading(false)
              sendNotifications(parsed)
              return
            }
          }
        }

        if (orderId) {
          const response = await fetch(`/api/orders/${orderId}`)
          
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.order) {
              const orderInfo: OrderData = {
                orderId: data.order.orderId || orderId,
                trackingNumber: data.order.trackingNumber || '',
                customerName: data.order.customerName || 'Customer',
                customerEmail: data.order.customerEmail || '',
                totalAmount: data.order.totalAmount || 0,
                paymentMethod: data.order.paymentMethod || 'Unknown',
                estimatedDelivery: data.order.estimatedDelivery || '3-5 business days',
                items: data.order.items || [],
                address: data.order.address,
                city: data.order.city,
                phone: data.order.phone,
                subtotal: data.order.subtotal,
                shipping: data.order.shipping,
                vat: data.order.vat
              }
              
              setOrderData(orderInfo)
              if (typeof window !== 'undefined') {
                localStorage.setItem('latest-order', JSON.stringify(orderInfo))
              }
              sendNotifications(orderInfo)
            } else {
              setError('Invalid order data received from server')
            }
          } else {
            setError(`Server returned ${response.status} error`)
          }
        } else {
          setError('No order ID provided in URL')
        }
      } catch (error) {
        console.error("Order loading error:", error)
        setError('Failed to load order details. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadOrderData()
  }, [searchParams])

  const sendNotifications = async (orderData: OrderData) => {
    if (!orderData?.customerEmail) {
      console.warn('No email available to send confirmation')
      return
    }

    setSendingNotifications(true)
    
    try {
      const emailData = {
        email: orderData.customerEmail,
        orderDetails: {
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          items: orderData.items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          subtotal: orderData.subtotal || orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          shipping: orderData.shipping || 120,
          vat: orderData.vat || 0,
          totalAmount: orderData.totalAmount,
          address: orderData.address,
          city: orderData.city,
          phone: orderData.phone,
          paymentMethod: orderData.paymentMethod,
          estimatedDelivery: orderData.estimatedDelivery
        }
      }

      const emailResponse = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })
      
      const emailResult = await emailResponse.json()
      setEmailSent(emailResult.success)

    } catch (error) {
      console.error('Notification error:', error)
    } finally {
      setSendingNotifications(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading your order...</p>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error}
            {searchParams.get('orderId') && (
              <span className="block mt-2">Order ID: {searchParams.get('orderId')}</span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">Return to Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-black mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order <span className="font-medium">{orderData.orderId}</span> has been received.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-medium text-black mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Delivery Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">{orderData.customerName}</p>
                    {orderData.address && <p className="text-sm text-gray-600">{orderData.address}</p>}
                    {orderData.city && <p className="text-sm text-gray-600">{orderData.city}</p>}
                    {orderData.phone && <p className="text-sm text-gray-600">{orderData.phone}</p>}
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-sm text-gray-600">{orderData.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-medium text-black mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items
              </h2>
              <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <Package className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-medium text-black mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">{orderData.paymentMethod}</span>
                </div>
                {orderData.trackingNumber && (
                  <div className="flex justify-between">
                    <span>Tracking Number:</span>
                    <span className="font-medium">{orderData.trackingNumber}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-medium text-black mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({orderData.items.length} items):</span>
                  <span>৳{orderData.subtotal?.toFixed(2) || orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>৳{orderData.shipping?.toFixed(2) || '120.00'}</span>
                </div>
                {orderData.vat && (
                  <div className="flex justify-between">
                    <span>VAT:</span>
                    <span>৳{orderData.vat.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Paid:</span>
                  <span>৳{orderData.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button asChild className="w-full amazon-button">
                  <Link href="/">Continue Shopping</Link>
                </Button>
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link href={`/track-order?trackingNumber=${orderData.trackingNumber}`}>Track Order</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  )
}
