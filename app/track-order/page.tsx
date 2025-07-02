"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, AlertCircle } from "lucide-react"

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("")
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTrackOrder = async () => {
    if (!orderId.trim()) {
      setError("Please enter an order ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/track-order?orderId=${encodeURIComponent(orderId.trim())}`)

      const data = await response.json()

      if (response.ok && data.order) {
        setOrderData(data.order)
      } else {
        setError(data.error || "Order not found")
        setOrderData(null)
      }
    } catch (error) {
      setError("Failed to track order. Please try again.")
      setOrderData(null)
    } finally {
      setLoading(false)
    }
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package, description: 'Your order has been received' },
    { key: 'processing', label: 'Processing', icon: Clock, description: 'We are preparing your order' },
    { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way' },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5" />
      case 'processing': return <Package className="w-5 h-5" />
      case 'shipped': return <Truck className="w-5 h-5" />
      case 'delivered': return <CheckCircle className="w-5 h-5" />
      case 'cancelled': return <AlertCircle className="w-5 h-5" />
      default: return <Clock className="w-5 h-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Confirmed', description: 'Your order has been received and confirmed' },
    { key: 'processing', label: 'Processing', description: 'Your order is being prepared for shipment' },
    { key: 'shipped', label: 'Shipped', description: 'Your order is on its way to you' },
    { key: 'delivered', label: 'Delivered', description: 'Your order has been delivered successfully' }
  ]

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const currentIndex = statusSteps.findIndex(step => step.key === currentStatus)
    const stepIndex = statusSteps.findIndex(step => step.key === stepKey)

    if (currentStatus === 'cancelled') {
      return stepIndex === 0 ? 'completed' : 'inactive'
    }

    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Track Your Order</h1>

          {/* Search Form */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  placeholder="Enter your order ID (e.g., ORD-123456789)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTrackOrder} 
                  disabled={loading}
                  className="amazon-button"
                >
                  {loading ? 'Tracking...' : 'Track Order'}
                </Button>
              </div>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Details */}
          {orderData && (
            <div className="space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold">Order {orderData.orderId}</h2>
                      <p className="text-gray-600">Placed on {new Date(orderData.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge className={`${orderData.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      orderData.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      orderData.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'}`}>
                      {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-2">Delivery Address</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {orderData.address}, {orderData.city}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {orderData.customerPhone}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {orderData.customerEmail}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Order Summary</h3>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>৳{orderData.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>৳{orderData.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>৳{orderData.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Steps */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Order Progress</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statusSteps.map((step, index) => {
                      const status = getStepStatus(step.key, orderData.status)
                      const StepIcon = step.icon
                      
                      return (
                        <div key={step.key} className="flex items-center gap-4">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            status === 'completed' ? 'bg-green-500 text-white' :
                            status === 'current' ? 'bg-blue-500 text-white' :
                            'bg-gray-200 text-gray-400'
                          }`}>
                            <StepIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${
                              status === 'completed' ? 'text-green-700' :
                              status === 'current' ? 'text-blue-700' :
                              'text-gray-400'
                            }`}>
                              {step.label}
                            </div>
                            <div className="text-sm text-gray-600">{step.description}</div>
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div className={`w-px h-8 ml-4 ${
                              status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Items in this Order</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

          <Card className="p-6 mb-8 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Enter Order ID (e.g., HS-1234567890)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                className="flex-1"
              />
              <Button 
                onClick={handleTrackOrder}
                disabled={loading}
                className="bg-[#febd69] hover:bg-[#f3a847] text-black min-w-32"
              >
                {loading ? "Tracking..." : "Track Order"}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </div>
            )}
          </Card>

          {orderData && (
            <div className="space-y-6">
              {/* Order Header */}
              <Card className="p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">Order #{orderData.order_id}</h2>
                    <p className="text-gray-600">Placed on {new Date(orderData.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <Badge className={`${getStatusColor(orderData.status)} px-4 py-2 border`}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(orderData.status)}
                      <span className="font-medium">
                        {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                      </span>
                    </div>
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Delivery Address</h3>
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 mt-0.5 text-gray-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{orderData.customer_name}</p>
                        <p className="text-gray-600">{orderData.address}</p>
                        <p className="text-gray-600">{orderData.city}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 text-gray-900">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{orderData.customer_phone}</span>
                      </div>
                      <div className="flex items-center gap-3 p-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{orderData.customer_email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {orderData.tracking_number && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      📦 Tracking Number: <span className="font-mono">{orderData.tracking_number}</span>
                    </p>
                  </div>
                )}
              </Card>

              {/* Order Status Timeline */}
              <Card className="p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-6">Order Progress</h3>
                <div className="space-y-6">
                  {statusSteps.map((step, index) => {
                    const stepStatus = getStepStatus(step.key, orderData.status)

                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                            stepStatus === 'completed' 
                              ? 'bg-green-600 border-green-600 text-white' 
                              : stepStatus === 'current'
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-300 text-gray-400'
                          }`}>
                            {stepStatus === 'completed' ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              getStatusIcon(step.key)
                            )}
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div className={`w-0.5 h-8 mt-2 ${
                              stepStatus === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <h4 className={`font-semibold ${
                            stepStatus === 'current' ? 'text-blue-600' : 
                            stepStatus === 'completed' ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          {stepStatus === 'current' && (
                            <p className="text-sm text-blue-600 mt-1 font-medium">Current Status</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Order Items */}
              <Card className="p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-6">Order Items</h3>
                <div className="space-y-4">
                  {orderData.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 border-b pb-4 last:border-b-0">
                      <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                        <p className="text-gray-600 text-sm">Unit Price: ৳{item.price}</p>
                      </div>
                      <p className="font-semibold text-lg">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-6 mt-6">
                  <div className="space-y-2 max-w-sm ml-auto">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>৳{orderData.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping:</span>
                      <span>৳{orderData.shipping}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>VAT:</span>
                      <span>৳{orderData.vat}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-xl border-t pt-2">
                      <span>Total:</span>
                      <span>৳{orderData.total_amount}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Estimated Delivery */}
              {orderData.estimated_delivery && orderData.status !== 'delivered' && (
                <Card className="p-6 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">📅 Estimated Delivery</h3>
                  <p className="text-gray-700 text-lg">{orderData.estimated_delivery}</p>
                  {orderData.status === 'shipped' && (
                    <p className="text-sm text-gray-600 mt-2">
                      Your package is on its way! You'll receive a notification once it's delivered.
                    </p>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Help Section */}
          <Card className="p-6 shadow-sm mt-8">
            <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2">Having trouble tracking your order?</p>
                <p className="text-gray-600">Contact our customer support for assistance.</p>
              </div>
              <div>
                <p className="font-medium mb-2">Customer Support</p>
                <p className="text-gray-600">Email: support@hridoystore.com</p>
                <p className="text-gray-600">Phone: +880 1700-000000</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}