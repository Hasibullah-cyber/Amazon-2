"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Package, Truck, CheckCircle, MapPin } from "lucide-react"

export const dynamic = 'force-dynamic'

import { storeManager } from "@/lib/store"
import { Phone, Mail, X, Clock } from "lucide-react"

export default function TrackOrderPage() {
  const [trackingId, setTrackingId] = useState("")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTrackOrder = () => {
    if (!trackingId.trim()) {
      setError("Please enter an order ID")
      return
    }

    setLoading(true)
    setError("")

    // Search for order by ID
    const orders = storeManager.getOrders()
    const foundOrder = orders.find(order => 
      order.orderId.toLowerCase() === trackingId.toLowerCase() ||
      order.id === trackingId
    )

    setTimeout(() => {
      if (foundOrder) {
        setOrder(foundOrder)
        setError("")
      } else {
        setOrder(null)
        setError("Order not found. Please check your order ID and try again.")
      }
      setLoading(false)
    }, 1000) // Simulate API delay
  }

  const getStatusProgress = (status: string) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered']
    return statuses.indexOf(status) + 1
  }

  const getStatusIcon = (status: string, isActive: boolean) => {
    const iconClass = `h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`

    switch (status) {
      case 'pending': return <Clock className={iconClass} />
      case 'processing': return <Package className={iconClass} />
      case 'shipped': return <Truck className={iconClass} />
      case 'delivered': return <CheckCircle className={iconClass} />
      default: return <Clock className={iconClass} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-gray-600'
      case 'processing': return 'text-yellow-600'
      case 'shipped': return 'text-blue-600'
      case 'delivered': return 'text-green-600'
      case 'cancelled': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order ID to get real-time updates on your delivery</p>
        </div>

        {/* Search Section */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Enter your order ID (e.g., #HS-1234567890)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="pl-10 text-lg py-3"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                />
              </div>
            </div>
            <Button 
              onClick={handleTrackOrder} 
              disabled={loading}
              className="px-8 py-3 text-lg"
            >
              {loading ? "Searching..." : "Track Order"}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}
        </Card>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Status Header */}
            <Card className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-black mb-2">Order {order.orderId}</h2>
                  <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Estimated delivery: {order.estimatedDelivery}
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="relative">
                <div className="flex justify-between items-center">
                  {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                    const isActive = getStatusProgress(order.status) > index
                    const isCurrent = order.status === status

                    return (
                      <div key={status} className="flex flex-col items-center relative">
                        <div className={`rounded-full p-3 ${
                          isActive || isCurrent 
                            ? 'bg-blue-100 border-2 border-blue-600' 
                            : 'bg-gray-100 border-2 border-gray-300'
                        }`}>
                          {getStatusIcon(status, isActive || isCurrent)}
                        </div>
                        <div className={`mt-2 text-xs font-medium text-center ${
                          isActive || isCurrent ? 'text-blue-600' : 'text-gray-400'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>

                        {/* Connecting Line */}
                        {index < 3 && (
                          <div className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 ${
                            getStatusProgress(order.status) > index + 1 
                              ? 'bg-blue-600' 
                              : 'bg-gray-300'
                          }`} style={{ transform: 'translateX(50%)', width: '100px' }} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Items */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Items ({order.items.length})
                  </h3>
                  <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-b-0">
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-gray-600">৳{item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Delivery Info & Order Summary */}
              <div className="space-y-6">
                {/* Delivery Information */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Delivery Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-gray-600">{order.address}</p>
                        <p className="text-gray-600">{order.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{order.customerEmail}</span>
                    </div>
                  </div>
                </Card>

                {/* Order Summary */}
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>৳{order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>৳{order.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT:</span>
                      <span>৳{order.vat.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>৳{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Payment Method</p>
                      <p className="font-medium">{order.paymentMethod}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Help Section */}
            <Card className="p-6 bg-blue-50">
              <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order or need assistance, please contact our customer support team.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Demo Section */}
        {!order && !error && (
          <Card className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold mb-3">Demo Order IDs</h3>
            <p className="text-sm text-gray-600 mb-4">
              Try tracking with these sample order IDs to see the system in action:
            </p>
            <div className="flex flex-wrap gap-2">
              {storeManager.getOrders().slice(0, 3).map((order) => (
                <Button
                  key={order.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTrackingId(order.orderId)
                    handleTrackOrder()
                  }}
                >
                  {order.orderId}
                </Button>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}