"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Truck, CreditCard, Phone, Mail, MapPin, Lock } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider"
import { AuthModal } from "@/components/auth-modal"

export const dynamic = 'force-dynamic'

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }

    const storedOrder = localStorage.getItem("order")
    if (storedOrder) {
      const parsedOrder = JSON.parse(storedOrder)

      // Validate order has required fields and user authentication
      if (parsedOrder && parsedOrder.cartItems && parsedOrder.userId === user?.id) {
        setOrder(parsedOrder)

        // Submit order to backend if not already submitted
        if (!orderSubmitted) {
          submitOrderToBackend(parsedOrder)
        }
      } else {
        // Redirect to home if invalid order or user mismatch
        window.location.href = "/"
      }
    } else {
      // Redirect to home if no order found
      window.location.href = "/"
    }
  }, [isAuthenticated, user, orderSubmitted])

  const submitOrderToBackend = async (orderData: any) => {
    if (isSubmitting || orderSubmitted) return

    setIsSubmitting(true)

    try {
      // Validate payment for online orders
      if (orderData.paymentMethod === "Online Payment" && !orderData.paymentVerified) {
        throw new Error("Payment not verified")
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderData.orderId,
          customerName: orderData.name,
          customerEmail: orderData.email,
          customerPhone: orderData.phone,
          address: orderData.address,
          city: orderData.city,
          items: orderData.cartItems?.map((item: any) => ({
            id: item.id?.toString(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image || "/placeholder.svg"
          })),
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          vat: orderData.vat,
          totalAmount: orderData.totalAmount,
          status: 'pending',
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentMethod === "Online Payment" ? "paid" : "pending",
          transactionId: orderData.transactionId,
          estimatedDelivery: orderData.estimatedDelivery,
          userId: user?.id
        }),
      })

      const result = await response.json()
      console.log('Order API response:', result)

      if (response.ok && result.success) {
        setOrderSubmitted(true)
        console.log('Order submitted successfully')
      } else {
        console.error('Order submission failed:', result.error)
        throw new Error(result.error || 'Failed to submit order')
      }
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('There was an error processing your order. Please contact support.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your order confirmation</p>
          <Button onClick={() => setShowAuthModal(true)} className="w-full">
            Sign In
          </Button>
        </Card>
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">No Order Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your order details.</p>
          <Link href="/">
            <Button className="w-full">Return to Shop</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <Card className="p-8 mb-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We've received your order and will process it soon.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg inline-block">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono text-lg font-bold">{order.orderId}</p>
          </div>
          {isSubmitting && (
            <p className="text-blue-600 mt-4">Processing your order...</p>
          )}
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2" /> Order Details
            </h2>

            <div className="space-y-4">
              {order.cartItems?.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 border-b pb-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ৳{item.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">৳{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}

              <div className="space-y-2 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{order.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>৳{order.shipping?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span>৳{order.vat?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>৳{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping & Payment Info */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" /> Shipping Information
              </h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {order.name}</p>
                <p><strong>Email:</strong> {order.email}</p>
                <p><strong>Phone:</strong> {order.phone}</p>
                <p><strong>Address:</strong> {order.address}</p>
                <p><strong>City:</strong> {order.city}</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" /> Payment Information
              </h2>
              <div className="space-y-2">
                <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                {order.transactionId && (
                  <p><strong>Transaction ID:</strong> {order.transactionId}</p>
                )}
                <p><strong>Payment Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    order.paymentMethod === "Online Payment" ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentMethod === "Online Payment" ? "Paid" : "Pending"}
                  </span>
                </p>
                <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery}</p>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-gray-600">We've sent you an email confirmation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-0.5"></div>
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-gray-600">We'll prepare your order for shipping</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full mt-0.5"></div>
                  <div>
                    <p className="font-medium">Shipped</p>
                    <p className="text-gray-600">You'll receive tracking information</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Link href="/track-order">
            <Button variant="outline" className="w-full sm:w-auto">
              <Truck className="w-4 h-4 mr-2" />
              Track Order
            </Button>
          </Link>
          <Link href="/order-history">
            <Button variant="outline" className="w-full sm:w-auto">
              View Order History
            </Button>
          </Link>
          <Link href="/">
            <Button className="w-full sm:w-auto">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}