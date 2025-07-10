'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
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

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [sendingNotifications, setSendingNotifications] = useState(false)

  useEffect(() => {
    const processOrder = async () => {
      try {
        const orderId = searchParams.get('orderId')
        const storedOrder = localStorage.getItem('latest-order')
        let parsedOrder: OrderData | null = null

        // 1. Try to load from localStorage first
        if (storedOrder) {
          try {
            parsedOrder = JSON.parse(storedOrder)
            if (!orderId || parsedOrder.orderId === orderId) {
              setOrder(parsedOrder)
              setLoading(false)
              sendNotifications(parsedOrder)
              return
            }
          } catch (e) {
            console.error("Failed to parse stored order:", e)
          }
        }

        // 2. If orderId exists, fetch from API
        if (orderId) {
          const response = await fetch(`/api/orders/${orderId}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.order) {
              const orderInfo: OrderData = {
                orderId: data.order.orderId || orderId,
                trackingNumber: data.order.trackingNumber,
                customerName: data.order.customerName,
                customerEmail: data.order.customerEmail,
                totalAmount: data.order.totalAmount,
                paymentMethod: data.order.paymentMethod,
                estimatedDelivery: data.order.estimatedDelivery || '1-2 business days',
                items: data.order.items,
                address: data.order.address,
                city: data.order.city,
                phone: data.order.phone,
                subtotal: data.order.subtotal,
                shipping: data.order.shipping,
                vat: data.order.vat
              }
              setOrder(orderInfo)
              localStorage.setItem('latest-order', JSON.stringify(orderInfo))
              sendNotifications(orderInfo)
            } else {
              setError('Invalid order data received')
            }
          } else {
            setError('Order not found')
          }
        } else {
          setError('No order ID provided')
        }
      } catch (error) {
        setError('Failed to load order details')
      } finally {
        setLoading(false)
      }
    }

    processOrder()
  }, [searchParams])

  const sendNotifications = async (orderData: OrderData) => {
    if (!orderData?.customerEmail) return
    
    setSendingNotifications(true)
    
    try {
      // Prepare email data
      const emailData = {
        email: orderData.customerEmail,
        orderDetails: {
          orderId: orderData.orderId,
          customerName: orderData.customerName,
          items: orderData.items,
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

      // Send email
      const emailResponse = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })
      const emailResult = await emailResponse.json()
      setEmailSent(emailResult.success)

      // Uncomment if you have SMS functionality
      // const smsResult = await notificationService.sendOrderConfirmationSMS(orderData)
      // setSmsSent(smsResult)
    } catch (error) {
      console.error("Notification error:", error)
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "We couldn't find your order information."}
          </p>
          <Button asChild>
            <Link href="/">Return to Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-black mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order <span className="font-medium">{order.orderId}</span> has been received.
          </p>

          {/* Notification Status */}
          <div className="mt-6 space-y-3 max-w-md mx-auto">
            {sendingNotifications && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800">Sending confirmation...</span>
                </div>
              </div>
            )}

            {!sendingNotifications && (emailSent || smsSent) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">Confirmation Sent!</h3>
                <div className="space-y-1 text-sm">
                  {emailSent && (
                    <div className="flex items-center text-green-700">
                      <Mail className="h-4 w-4 mr-2" />
                      Email sent to {order.customerEmail}
                    </div>
                  )}
                  {smsSent && (
                    <div className="flex items-center text-green-700">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      SMS sent to {order.phone}
                    </div>
                  )}
                </div>
              </div>
            )}

            {!sendingNotifications && !emailSent && !smsSent && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center text-yellow-800">
                  <div className="text-sm">
                    Order confirmed, but notifications could not be sent. Please save this page for your records.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
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
                    <p className="font-medium">{order.customerName}</p>
                    {order.address && <p className="text-sm text-gray-600">{order.address}</p>}
                    {order.city && <p className="text-sm text-gray-600">{order.city}</p>}
                    {order.phone && <p className="text-sm text-gray-600">{order.phone}</p>}
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium">Estimated Delivery</p>
                    <p className="text-sm text-gray-600">{order.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Order Items */}
            <Card className="p-6">
              <h2 className="text-xl font-medium text-black mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
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

            {/* Payment Information */}
            <Card className="p-6">
              <h2 className="text-xl font-medium text-black mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Details
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                {order.trackingNumber && (
                  <div className="flex justify-between">
                    <span>Tracking Number:</span>
                    <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-medium text-black mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({order.items.length} items):</span>
                  <span>৳{order.subtotal?.toFixed(2) || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>৳{order.shipping?.toFixed(2) || '120.00'}</span>
                </div>
                {order.vat && (
                  <div className="flex justify-between">
                    <span>VAT:</span>
                    <span>৳{order.vat.toFixed(2)}</span>
                  </div>
                )}
                <hr className="my-3" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Paid:</span>
                  <span>৳{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button asChild className="w-full amazon-button">
                  <Link href="/">Continue Shopping</Link>
                </Button>
                <Button variant="outline" className="w-full mt-3" asChild>
                  <Link href={`/track-order?orderId=${order.orderId}`}>Track Order</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
