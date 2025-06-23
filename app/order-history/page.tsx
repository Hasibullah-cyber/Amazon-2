
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { storeManager } from "@/lib/store"
import { useAuth } from "@/components/auth-provider"
import { Package, Truck, CheckCircle, X, RotateCcw, Star, Search, Calendar } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [returnReason, setReturnReason] = useState("")
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const { user } = useAuth()

  useEffect(() => {
    const updateOrders = () => {
      const allOrders = storeManager.getOrders()
      // Filter orders for current user
      const userOrders = user ? 
        allOrders.filter(order => 
          order.customerEmail === user.email || 
          order.customerName === user.name
        ) : 
        allOrders.filter(order => {
          // For guest users, try to match with stored order data
          const storedOrder = localStorage.getItem("order")
          if (storedOrder) {
            try {
              const parsed = JSON.parse(storedOrder)
              return order.orderId === parsed.orderId
            } catch {
              return false
            }
          }
          return false
        })
      
      setOrders(userOrders)
      filterOrders(userOrders, searchTerm, filterStatus)
    }

    updateOrders()
    const unsubscribe = storeManager.subscribe(updateOrders)
    return unsubscribe
  }, [user, searchTerm, filterStatus])

  const filterOrders = (ordersList: any[], search: string, status: string) => {
    let filtered = ordersList

    if (search) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some((item: any) => 
          item.name.toLowerCase().includes(search.toLowerCase())
        )
      )
    }

    if (status !== "all") {
      filtered = filtered.filter(order => order.status === status)
    }

    setFilteredOrders(filtered)
  }

  const getStatusIcon = (status: string) => {
    const iconClass = "h-4 w-4"
    switch (status) {
      case 'pending': return <Package className={iconClass} />
      case 'processing': return <Package className={iconClass} />
      case 'shipped': return <Truck className={iconClass} />
      case 'delivered': return <CheckCircle className={iconClass} />
      case 'cancelled': return <X className={iconClass} />
      case 'returned': return <RotateCcw className={iconClass} />
      default: return <Package className={iconClass} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'returned': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleReturnRequest = (order: any) => {
    setSelectedOrder(order)
    setShowReturnModal(true)
  }

  const handleRateOrder = (order: any) => {
    setSelectedOrder(order)
    setShowRatingModal(true)
  }

  const submitReturn = () => {
    if (selectedOrder && returnReason.trim()) {
      // Update order status to returned
      storeManager.updateOrderStatus(selectedOrder.id, 'returned')
      
      // Store return request (in a real app, this would go to a returns system)
      const returnRequest = {
        orderId: selectedOrder.orderId,
        reason: returnReason,
        requestDate: new Date().toISOString(),
        customerName: selectedOrder.customerName
      }
      
      // Store in localStorage for demo purposes
      const existingReturns = JSON.parse(localStorage.getItem("returns") || "[]")
      existingReturns.push(returnRequest)
      localStorage.setItem("returns", JSON.stringify(existingReturns))
      
      setShowReturnModal(false)
      setReturnReason("")
      setSelectedOrder(null)
    }
  }

  const submitRating = () => {
    if (selectedOrder && rating > 0) {
      // Store rating and review (in a real app, this would update the product reviews)
      const ratingData = {
        orderId: selectedOrder.orderId,
        rating,
        review,
        reviewDate: new Date().toISOString(),
        customerName: selectedOrder.customerName
      }
      
      // Store in localStorage for demo purposes
      const existingRatings = JSON.parse(localStorage.getItem("ratings") || "[]")
      existingRatings.push(ratingData)
      localStorage.setItem("ratings", JSON.stringify(existingRatings))
      
      setShowRatingModal(false)
      setRating(0)
      setReview("")
      setSelectedOrder(null)
    }
  }

  const canReturn = (order: any) => {
    const deliveryDate = new Date(order.createdAt)
    const currentDate = new Date()
    const daysDiff = Math.floor((currentDate.getTime() - deliveryDate.getTime()) / (1000 * 3600 * 24))
    return order.status === 'delivered' && daysDiff <= 14
  }

  const canRate = (order: any) => {
    return order.status === 'delivered'
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your order history.</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Your Orders</h1>
          <p className="text-gray-600">Track your orders, request returns, and rate your purchases</p>
        </div>

        {/* Search and Filter */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by Order ID or Product Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-4">
              {orders.length === 0 
                ? "You haven't placed any orders yet."
                : "No orders match your search criteria."
              }
            </p>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/">Start Shopping</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-black mb-1">Order {order.orderId}</h3>
                    <p className="text-sm text-gray-600">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 lg:mt-0">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status.toUpperCase()}</span>
                    </Badge>
                    <span className="text-lg font-medium">৳{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t pt-4 mb-4">
                  <div className="grid gap-3">
                    {order.items.slice(0, 3).map((item: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600">Qty: {item.quantity} × ৳{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-600">+{order.items.length - 3} more items</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/track-order?id=${order.orderId}`}>Track Order</Link>
                  </Button>
                  
                  {canReturn(order) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReturnRequest(order)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Return Items
                    </Button>
                  )}
                  
                  {canRate(order) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleRateOrder(order)}
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Rate Order
                    </Button>
                  )}

                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Return Modal */}
        {showReturnModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Request Return</h3>
              <p className="text-sm text-gray-600 mb-4">
                Order: {selectedOrder?.orderId}
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Reason for Return</label>
                <Textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please describe why you want to return this order..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={submitReturn}
                  disabled={!returnReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Submit Return Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReturnModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium mb-4">Rate Your Order</h3>
              <p className="text-sm text-gray-600 mb-4">
                Order: {selectedOrder?.orderId}
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Review (Optional)</label>
                <Textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience with this order..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={submitRating}
                  disabled={rating === 0}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Submit Rating
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRatingModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
