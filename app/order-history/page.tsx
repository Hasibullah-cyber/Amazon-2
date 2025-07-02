"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import { storeManager, type Order } from "@/lib/store"
import { Package, Truck, CheckCircle, X, Search, Calendar, RefreshCw } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchOrders = async () => {
    if (!user?.email) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/user-orders?email=${encodeURIComponent(user.email)}`)
      const userOrders = await response.json()
      setOrders(userOrders)
      filterOrdersFunc(userOrders, searchTerm, filterStatus)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.email) {
      // Subscribe to real-time updates
      const unsubscribe = storeManager.subscribe((state) => {
        const userOrders = state.orders.filter(order => order.customerEmail === user.email)
        setOrders(userOrders)
        filterOrdersFunc(userOrders, searchTerm, filterStatus)
      })

      fetchOrders()

      return unsubscribe
    }
  }, [user, searchTerm, filterStatus])

  const filterOrdersFunc = (ordersList: Order[], search: string, status: string) => {
    let filtered = ordersList

    if (search) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(search.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(search.toLowerCase()))
      )
    }

    if (status !== "all") {
      filtered = filtered.filter(order => order.status === status)
    }

    // Sort by creation date, newest first
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredOrders(filtered)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package className="h-4 w-4" />
      case 'processing': return <Package className="h-4 w-4" />
      case 'shipped': return <Truck className="h-4 w-4" />
      case 'delivered': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <X className="h-4 w-4" />
      default: return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'shipped': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Order History</h1>
          <p className="text-gray-600 mb-6">Please sign in to view your order history.</p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">Your Orders</h1>
            <p className="text-gray-600">Track your orders and view purchase history</p>
          </div>
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by order ID or product name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border rounded-md px-3 py-2 bg-white"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading your orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-4">
              {orders.length === 0 
                ? "You haven't placed any orders yet." 
                : "No orders match your search criteria."
              }
            </p>
            <Button asChild>
              <Link href="/">Start Shopping</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{order.orderId}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Ordered on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </Badge>
                    <p className="text-lg font-bold mt-1">৳{order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid gap-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
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
                </div>

                <div className="border-t pt-4 mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>Delivery to: {order.address}, {order.city}</p>
                    <p>Expected: {order.estimatedDelivery}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/track-order?id=${order.orderId}`}>
                        Track Order
                      </Link>
                    </Button>
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        Buy Again
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}