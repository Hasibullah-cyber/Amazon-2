"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Package, Truck, MapPin, Calendar, CreditCard, Mail, MessageSquare } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'
import { notificationService } from "@/lib/notifications"
import { useAuth } from "@/components/auth-provider"

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  const [sendingNotifications, setSendingNotifications] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const processOrder = async () => {
      try {
        const storedOrder = localStorage.getItem("order")
        const storedCart = localStorage.getItem("cart")
        let parsedOrder = null

        if (storedOrder) {
          try {
            parsedOrder = JSON.parse(storedOrder)
          } catch (error) {
            console.error("Failed to parse stored order:", error)
          }
        }

        if (!parsedOrder?.cartItems?.length && storedCart) {
          try {
            const cartItems = JSON.parse(storedCart)
            if (Array.isArray(cartItems) && cartItems.length > 0) {
              const subtotal = cartItems.reduce(
                (total: number, item: any) => total + (item.price || 0) * (item.quantity || 0),
                0
              )
              const vat = Math.round(subtotal * 0.1)
              const shipping = 120
              const totalAmount = subtotal + vat + shipping

              parsedOrder = {
                orderId: `#HS-${Date.now()}`,
                name: "Guest User",
                address: "123 Default Street",
                city: "Dhaka",
                phone: "01700000000",
                paymentMethod: "Cash on Delivery",
                transactionId: null,
                estimatedDelivery: "1-2 business days",
                cartItems,
                subtotal,
                shipping,
                vat,
                totalAmount,
              }
            }
          } catch (error) {
            console.error("Failed to parse stored cart:", error)
          }
        }

        if (parsedOrder && parsedOrder.cartItems) {
          // Add order to admin system via API
          try {
            const orderData = {
              orderId: parsedOrder.orderId || `#HS-${Date.now()}`,
              customerName: parsedOrder.name || "Guest User",
              customerEmail: parsedOrder.email || "guest@example.com",
              customerPhone: parsedOrder.phone || "01700000000",
              address: parsedOrder.address || "123 Default Street",
              city: parsedOrder.city || "Dhaka",
              items: parsedOrder.cartItems?.map((item: any) => ({
                id: item.id?.toString() || Date.now().toString(),
                name: item.name || "Unknown Product",
                price: item.price || 0,
                quantity: item.quantity || 1,
                image: item.image || "/placeholder.svg"
              })) || [],
              subtotal: parsedOrder.subtotal || 0,
              shipping: parsedOrder.shipping || 120,
              vat: parsedOrder.vat || 0,
              totalAmount: parsedOrder.totalAmount || 0,
              status: 'pending',
              paymentMethod: parsedOrder.paymentMethod || "Cash on Delivery",
              estimatedDelivery: parsedOrder.estimatedDelivery || "1-2 business days"
            }

            const response = await fetch('/api/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData),
            })

            if (!response.ok) {
              throw new Error('Failed to save order')
            }

            // Clear cart after successful order
            localStorage.removeItem("cart")

            // Send notifications after order is created
            if (parsedOrder) {
              setSendingNotifications(true)
              sendNotifications(parsedOrder)
            }
          } catch (error) {
            console.error("Failed to add order to store:", error)
          }
        }

        setOrder(parsedOrder)
      } catch (error) {
        console.error("Error processing order:", error)
        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    processOrder()
  }, [])

  const sendNotifications = async (orderData: any) => {
    try {
      // Prepare order data for notifications
      const notificationOrder = {
        orderId: orderData.orderId,
        customerName: orderData.name || "Guest User",
        customerEmail: orderData.email || user?.email || "guest@example.com",
        customerPhone: orderData.phone || "01700000000",
        address: orderData.address || "123 Default Street",
        city: orderData.city || "Dhaka",
        items: orderData.cartItems?.map((item: any) => ({
          id: item.id?.toString() || Date.now().toString(),
          name: item.name || "Unknown Product",
          price: item.price || 0,
          quantity: item.quantity || 1,
          image: item.image || "/placeholder.svg"
        })) || [],
        subtotal: orderData.subtotal || 0,
        shipping: orderData.shipping || 120,
        vat: orderData.vat || 0,
        totalAmount: orderData.totalAmount || 0,
        paymentMethod: orderData.paymentMethod || "Cash on Delivery",
        estimatedDelivery: orderData.estimatedDelivery || "1-2 business days",
        createdAt: new Date().toISOString()
      }

      // Send email notification
      try {
        const response = await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user?.email || order.email || order.customerEmail,
            orderDetails: notificationOrder
          })
        })

        const result = await response.json()
        setEmailSent(result.success)

        if (result.success) {
          console.log('✅ Email sent successfully:', result.message)
        } else {
          console.error('❌ Email sending failed:', result.error)
          // Log more details for debugging
          console.error('Response status:', response.status)
          console.error('Full response:', result)
        }
      } catch (error) {
        console.error("Failed to send email:", error)
        setEmailSent(false)
      }

      // Send SMS notification
      // try {
      //   const smsResult = await notificationService.sendOrderConfirmationSMS(notificationOrder)
      //   setSmsSent(smsResult)
      // } catch (error) {
      //   console.error("Failed to send SMS:", error)
      //   setSmsSent(false)
      // }

    } catch (error) {
      console.error("Error sending notifications:", error)
    } finally {
      setSendingNotifications(false)
    }
  }

  if (loading) return <div className="p-6">Loading your order...</div>

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your order information. This might happen if:
          </p>
          <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
            <li>• The order data was cleared from storage</li>
            <li>• You accessed this page directly without placing an order</li>
            <li>• There was an error processing your order</li>
          </ul>
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
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-black mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your order <span className="font-medium">{order.orderId}</span> has been received.
          </p>

          {/* Notification Status */}
          <div className="mt-6 space-y-3">
            {sendingNotifications && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800">Sending confirmation notifications...</span>
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
                      Email confirmation sent to {user?.email || order.email || "your email"}
                    </div>
                  )}
                  {/*{smsSent && (*/}
                  {/*  <div className="flex items-center text-green-700">*/}
                  {/*    <MessageSquare className="h-4 w-4 mr-2" />*/}
                  {/*    SMS confirmation sent to {order.phone}*/}
                  {/*  </div>*/}
                  {/*)}*/}
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
                    <p className="font-medium">{order.name}</p>
                    <p className="text-sm text-gray-600">{order.address}</p>
                    <p className="text-sm text-gray-600">{order.city}</p>
                    <p className="text-sm text-gray-600">{order.phone}</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Estimated Delivery:</strong> {order.estimatedDelivery || "1-2 business days"}
                  </p>
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
                {order.cartItems && order.cartItems.length > 0 ? (
                  order.cartItems.map((item: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                      <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name || "Unknown Product"}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">৳{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No items found in this order.</p>
                )}
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
                {order.transactionId && (
                  <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-medium">{order.transactionId}</span>
                  </div>
                )}
              </div>
              <div className="mt-6 text-xs text-gray-500">
                <p>You will receive an email confirmation shortly with your order details and tracking information.</p>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-xl font-medium text-black mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({order.cartItems?.length} items):</span>
                  <span>৳{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>৳{order.shipping || 120}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (10%):</span>
                  <span>৳{order.vat}</span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between font-medium text-lg">
                  <span>Total Paid:</span>
                  <span className="amazon-price">৳{order.totalAmount}</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold text-gray-800 mb-2">Customer Information</h3>
                <p>{user?.name || order.name || "Guest User"}</p>
                <p>{user?.email || order.email || "guest@example.com"}</p>
                <p>{order.phone || "01700000000"}</p>
              </div>

              {/* Order Tracking Status */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Order Status</h4>
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Your order is currently: <span className="font-medium">PENDING</span>
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  We'll update you via email and SMS as your order progresses.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="amazon-button w-full" asChild>
                  <Link href="/">Continue Shopping</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/order-history">View All Orders</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}