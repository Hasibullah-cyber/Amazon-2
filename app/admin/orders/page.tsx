"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storeManager } from "@/lib/store"
import { Search, Eye, Package, Truck, CheckCircle, X, Filter } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  useEffect(() => {
    const updateOrders = async () => {
      try {
        const allOrders = await storeManager.getOrders()
        setOrders(allOrders)
        filterOrders(allOrders, searchTerm, statusFilter)
      } catch (error) {
        console.error('Error fetching orders:', error)
      }
    }

    updateOrders()
    const unsubscribe = storeManager.subscribe(() => {
      updateOrders()
    })

    return unsubscribe
  }, [searchTerm, statusFilter])

  const filterOrders = (ordersList: any[], search: string, status: string) => {
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

  const handleStatusChange = (orderId: string, newStatus: string) => {
    storeManager.updateOrderStatus(orderId, newStatus as any)
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
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

      {/* Filters and Search */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by Order ID, Customer Name, or Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
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
      </Card>

      {/* Orders Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{orders.length}</div>
          <div className="text-sm text-gray-600">Total Orders</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'processing').length}
          </div>
          <div className="text-sm text-gray-600">Processing</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'shipped').length}
          </div>
          <div className="text-sm text-gray-600">Shipped</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'delivered').length}
          </div>
          <div className="text-sm text-gray-600">Delivered</div>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Order ID</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Contact</th>
                <th className="text-left p-3">Items</th>
                <th className="text-left p-3">Total</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-mono text-sm font-medium">{order.orderId}</div>
                  </td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-sm text-gray-500">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{order.customerPhone}</div>
                    <div className="text-xs text-gray-500">{order.city}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{order.items.length} items</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">৳{order.totalAmount.toFixed(2)}</div>
                  </td>
                  <td className="p-3">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs border flex items-center gap-1 ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No orders found matching your criteria
            </div>
          )}
        </div>
      </Card>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Order Details</h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedOrder(null)}
                >
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
                  <h3 className="font-medium mb-2">Order Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-medium">৳{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
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