"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth-provider"
import {
  Package, Truck, CheckCircle, X,
  Search, Calendar, RefreshCw, ShoppingBag
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export const dynamic = 'force-dynamic'

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
}

const pulse = {
  pulse: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchOrders = useCallback(async () => {
    if (!user?.email) {
      setLoading(false)
      setOrders([])
      setFilteredOrders([])
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/user-orders?email=${encodeURIComponent(user.email)}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  useEffect(() => {
    let filtered = [...orders]

    if (searchTerm) {
      filtered = filtered.filter(order => {
        const idMatch = (order.orderId || "").toLowerCase().includes(searchTerm.toLowerCase());
        const itemMatch = (order.items || []).some((item: any) => 
          (item.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
        return idMatch || itemMatch;
      });
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(order => order.status === filterStatus)
    }

    filtered.sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    )

    setFilteredOrders(filtered)
  }, [orders, searchTerm, filterStatus])

  const cancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      })

      const result = await res.json()
      if (!res.ok) {
        console.error("Cancel error:", result.error)
        alert(result.error || "Failed to cancel order")
        return
      }

      alert("Order cancelled successfully.")
      fetchOrders()
    } catch (err) {
      console.error("Network error while cancelling order:", err)
      alert("Network error. Please try again.")
    }
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
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-lg max-w-md w-full text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ShoppingBag className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Order History
          </h1>
          <p className="text-gray-600 mb-6">Please sign in to view your order history.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8"
      initial="hidden"
      animate="show"
      variants={fadeIn}
    >
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="flex items-center justify-between mb-8"
          variants={item}
        >
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Your Orders
            </h1>
            <p className="text-gray-600">Track your orders and view purchase history</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={fetchOrders} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex flex-col md:flex-row gap-4 mb-6"
          variants={item}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by order ID or product name"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl shadow-sm"
            />
          </div>
          <motion.select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded-xl px-3 py-2 bg-white shadow-sm"
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </motion.select>
        </motion.div>

        {loading ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-16"
            variants={pulse}
            animate="pulse"
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            <span className="mt-4 text-lg text-gray-600">Loading your orders...</span>
          </motion.div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
          >
            <Card className="p-8 text-center rounded-2xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
              <p className="text-gray-600 mb-6">
                {orders.length === 0
                  ? "You haven't placed any orders yet."
                  : "No orders match your search criteria."}
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild className="px-8 py-4 rounded-xl">
                  <Link href="/">Start Shopping</Link>
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence>
              {filteredOrders.map(order => (
                <motion.div
                  key={order.id}
                  variants={item}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-6 rounded-2xl overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                    {/* Glowing status indicator */}
                    <div className={`absolute top-0 left-0 w-1 h-full ${order.status === 'delivered' ? 'bg-green-500' : 
                      order.status === 'shipped' ? 'bg-blue-500' : 
                      order.status === 'processing' ? 'bg-yellow-500' : 
                      order.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                    
                    <div className="flex items-start justify-between mb-4 pl-3">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{order.orderId || "N/A"}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Ordered on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(order.status)} rounded-full px-3 py-1 shadow-sm`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status || "unknown"}</span>
                        </Badge>
                        <p className="text-lg font-bold mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                          ৳{Number(order.totalAmount || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <div className="grid gap-4">
                        {(order.items || []).map((item: any, index: number) => (
                          <motion.div 
                            key={index} 
                            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shadow-inner">
                              <Package className="h-8 w-8 text-gray-500" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name || "Unnamed product"}</h4>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity || 0}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                ৳{item.price && item.quantity ? (item.price * item.quantity).toFixed(2) : "0.00"}
                              </p>
                              <p className="text-sm text-gray-600">
                                ৳{item.price ? item.price.toFixed(2) : "0.00"} each
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">Delivery to:</p>
                        <p>{order.address || "N/A"}, {order.city || "N/A"}</p>
                        <p className="mt-1 font-medium">Expected:</p>
                        <p>{order.estimatedDelivery || "N/A"}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button asChild variant="outline" size="sm" className="rounded-xl">
                            <Link href={`/track-order?id=${order.orderId}`}>Track Order</Link>
                          </Button>
                        </motion.div>
                        {order.status === 'delivered' && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="sm" className="rounded-xl">Buy Again</Button>
                          </motion.div>
                        )}
                        {["pending", "processing"].includes(order.status) && (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => cancelOrder(order.orderId)}
                              className="rounded-xl"
                            >
                              Cancel Order
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
