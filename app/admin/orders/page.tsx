
"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storeManager, type Order } from "@/lib/store"
import { Search, Eye, Package, Truck, CheckCircle, X, Filter, RefreshCw } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const allOrders = await storeManager.getOrders()
        setOrders(allOrders)
        filterOrders(allOrders, searchTerm, statusFilter)
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        setLoading(false)
      }
    }

    // Subscribe to real-time updates
    const unsubscribe = storeManager.subscribe((state) => {
      setOrders(state.orders)
      filterOrders(state.orders, searchTerm, statusFilter)
    })

    loadOrders()

    return unsubscribe
  }, [searchTerm, statusFilter])

  const filterOrders = (ordersList: Order[], search: string, status: string) => {
    let filtered = ordersList

    if (search) {
      filtered = filtered.filter(order => 
        order.orderId.toLowerCase().includes(search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(search.toLowerCase()) ||
        order.customerPhone.includes(search)
      )
    }

    if (status !== "all") {
      filtered = filtered.filter(order => order.status === status)
    }

    setFilteredOrders(filtered)
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId)
      
      // Update via API
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the orders to show updated status
        await storeManager.refresh()
        console.log('Order status updated successfully')
      } else {
        throw new Error('Failed to update order status')
      }
    } catch (error) {
      console.error('Failed to update order status:', error)
      alert('Failed to update order status. Please try again.')
    } finally {
      setUpdating(null)
    }
  }

  const handleRefresh = async () => {
    await storeManager.refresh()
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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
          <p className="text-2xl font-bold">{orders.length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Processing</h3>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'processing').length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-600">Delivered</h3>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by order ID, customer name, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading orders...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold">{order.orderId}</h3>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">৳{order.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={updating === order.id}
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this order?')) {
                        try {
                          const response = await fetch(`/api/admin/orders/${order.id}`, {
                            method: 'DELETE'
                          })
                          if (response.ok) {
                            await storeManager.refresh()
                          }
                        } catch (error) {
                          console.error('Error deleting order:', error)
                        }
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No orders found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Order Details</h2>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Customer Information</h3>
                    <div className="text-sm space-y-1">
                      <div>Name: {selectedOrder.customerName}</div>
                      <div>Email: {selectedOrder.customerEmail}</div>
                      <div>Phone: {selectedOrder.customerPhone}</div>
                      <div>Address: {selectedOrder.address}</div>
                      <div>City: {selectedOrder.city}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Order Information</h3>
                    <div className="text-sm space-y-1">
                      <div>Order ID: {selectedOrder.orderId}</div>
                      <div>Status: {selectedOrder.status}</div>
                      <div>Payment: {selectedOrder.paymentMethod}</div>
                      <div>Date: {new Date(selectedOrder.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div>৳{(item.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-gray-600">৳{item.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>৳{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>৳{selectedOrder.shipping.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>VAT:</span>
                      <span>৳{selectedOrder.vat.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>৳{selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
