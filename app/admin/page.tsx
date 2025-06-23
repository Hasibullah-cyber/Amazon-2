"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { storeManager } from "@/lib/store"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { AdminLoginModal } from "@/components/admin-login-modal"
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, Eye, Edit, Trash2, FolderOpen } from "lucide-react"

export default function AdminHome() {
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const { isAdminAuthenticated, adminSignOut } = useAdminAuth()

  useEffect(() => {
    const updateData = () => {
      setStats(storeManager.getStats())
      setOrders(storeManager.getOrders())
      setProducts(storeManager.getProducts())
    }

    updateData()
    const unsubscribe = storeManager.subscribe(updateData)

    return unsubscribe
  }, [])

  const handleUpdateOrderStatus = (orderId: string, newStatus: string) => {
    storeManager.updateOrderStatus(orderId, newStatus as any)
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">You need to be logged in as an admin to access this page.</p>
          <button
            onClick={() => setShowAdminLogin(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Admin Login
          </button>
          <AdminLoginModal 
            isOpen={showAdminLogin} 
            onClose={() => setShowAdminLogin(false)} 
          />
        </div>
      </div>
    )
  }

  if (!stats) return <div className="p-6">Loading admin dashboard...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your store overview.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          <button
            onClick={adminSignOut}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
          >
            Admin Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">৳{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold">{stats.lowStockProducts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Button asChild className="h-12">
          <Link href="/admin/orders">
            <ShoppingCart className="h-4 w-4 mr-2" />
            Manage Orders
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/admin/products">
            <Package className="h-4 w-4 mr-2" />
            Manage Products
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/admin/users">
            <Users className="h-4 w-4 mr-2" />
            Manage Users
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12">
          <Link href="/admin/dashboard">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </Link>
        </Button>
      </div>

      {/* Recent Orders */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <Link href="/admin/orders" className="text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Order ID</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Items</th>
                <th className="text-left p-2">Total</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-sm">{order.orderId}</td>
                  <td className="p-2">{order.customerName}</td>
                  <td className="p-2">{order.items.length} items</td>
                  <td className="p-2">৳{order.totalAmount.toFixed(2)}</td>
                  <td className="p-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      className={`px-2 py-1 rounded-full text-xs border ${
                        order.status === "delivered" ? "bg-green-100 text-green-800 border-green-200" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-800 border-blue-200" :
                        order.status === "processing" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                        "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product Inventory */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Product Inventory</h2>
          <Link href="/admin/products" className="text-blue-600 hover:underline">
            Manage All
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 6).map((product) => (
            <div key={product.id} className="border p-4 rounded-lg hover:shadow-md transition">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium truncate">{product.name}</h3>
                <span className="text-sm font-bold">৳{product.price}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">ID: {product.id}</p>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${
                  product.stock > 20 ? "text-green-600" : 
                  product.stock > 10 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {product.stock} in stock
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}