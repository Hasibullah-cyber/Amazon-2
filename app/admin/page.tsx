"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { AdminLoginModal } from "@/components/admin-login-modal"
import {
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Eye,
  Edit,
  LayoutGrid
} from "lucide-react"
import { debugFetch } from "@/lib/debug-fetch"

export const dynamic = "force-dynamic"

export default function AdminHome() {
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdminAuthenticated, adminSignOut } = useAdminAuth()

  // Setup debug console
  useEffect(() => {
    const debugBox = document.createElement("div")
    debugBox.style.position = "fixed"
    debugBox.style.bottom = "0"
    debugBox.style.left = "0"
    debugBox.style.maxHeight = "40vh"
    debugBox.style.overflowY = "auto"
    debugBox.style.zIndex = "9999"
    debugBox.style.background = "#000"
    debugBox.style.color = "#0f0"
    debugBox.style.fontSize = "12px"
    debugBox.style.padding = "4px"
    debugBox.style.borderTopRightRadius = "6px"
    debugBox.style.width = "100%"
    document.body.appendChild(debugBox)

    const originalLog = console.log
    const originalError = console.error
    const originalWindowError = window.onerror

    console.log = function (...args) {
      originalLog.apply(console, args)
      const msg = document.createElement("div")
      msg.textContent = "[LOG] " + args.join(" ")
      debugBox.appendChild(msg)
    }

    console.error = function (...args) {
      originalError.apply(console, args)
      const msg = document.createElement("div")
      msg.style.color = "#f55"
      msg.textContent = "[ERROR] " + args.join(" ")
      debugBox.appendChild(msg)
    }

    window.onerror = function (message, source, lineno, colno, err) {
      const msg = document.createElement("div")
      msg.style.color = "#f55"
      msg.textContent = `[ERROR] ${message} at ${source}:${lineno}:${colno}`
      debugBox.appendChild(msg)
      if (originalWindowError) return originalWindowError(message, source, lineno, colno, err)
    }

    return () => {
      document.body.removeChild(debugBox)
      console.log = originalLog
      console.error = originalError
      window.onerror = originalWindowError
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const [
          statsResponse, 
          ordersResponse, 
          productsResponse,
          categoriesResponse
        ] = await Promise.all([
          debugFetch("/api/admin/stats"),
          debugFetch("/api/admin/orders"),
          debugFetch("/api/admin/products"),
          debugFetch("/api/admin/categories")
        ])

        const statsData = statsResponse.ok ? await statsResponse.json() : null
        const ordersData = ordersResponse.ok ? await ordersResponse.json() : []
        const productsData = productsResponse.ok ? await productsResponse.json() : []
        const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : []

        // Handle different API response structures
        setStats(statsData)
        setOrders(Array.isArray(ordersData) ? ordersData : ordersData.orders || [])
        setProducts(Array.isArray(productsData) ? productsData : productsData.products || [])
        setCategories(Array.isArray(categoriesData) ? categoriesData : categoriesData.categories || [])
        
      } catch (error) {
        console.error("Error fetching admin data:", error)
        setError("Failed to load data. Check console for details.")
      } finally {
        setLoading(false)
      }
    }

    if (isAdminAuthenticated) {
      fetchData()
    }
  }, [isAdminAuthenticated])

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`)
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in as an admin to access this page.
          </p>
          <button
            onClick={() => setShowAdminLogin(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Admin Login
          </button>
          <AdminLoginModal isOpen={showAdminLogin} onClose={() => setShowAdminLogin(false)} />
        </div>
      </div>
    )
  }

  if (loading) return <div className="p-6">Loading admin dashboard...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>

  const {
    totalOrders = 0,
    totalRevenue = 0,
    pendingOrders = 0,
    lowStockProducts = 0,
    recentOrders = [],
  } = stats || {}

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
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">৳{Number(totalRevenue ?? 0).toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold">{pendingOrders}</p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold">{lowStockProducts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
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
        <Button asChild variant="outline" className="h-12">
          <Link href="/admin/categories">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Manage Categories
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
              {orders.length > 0 ? (
                orders.slice(0, 10).map((order: any) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-sm">{order.orderId || order.id}</td>
                    <td className="p-2">{order.customerName || order.user?.name || "Unknown"}</td>
                    <td className="p-2">{order.items?.length || 0} items</td>
                    <td className="p-2">৳{order.totalAmount?.toFixed(2) || "0.00"}</td>
                    <td className="p-2">
                      <select
                        value={order.status || "pending"}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs border ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : order.status === "processing"
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
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
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2 text-center" colSpan={6}>
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Product Inventory */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Product Inventory</h2>
          <Link href="/admin/products" className="text-blue-600 hover:underline">
            Manage All
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.length > 0 ? (
            products.slice(0, 6).map((product: any) => (
              <div key={product.id} className="border p-4 rounded-lg hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <span className="text-sm font-bold">৳{product.price}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">ID: {product.id}</p>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-sm ${
                      product.stock > 20
                        ? "text-green-600"
                        : product.stock > 10
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {product.stock} in stock
                  </span>
                  <div className="flex gap-1">
                    <Link href={`/admin/products/${product.id}`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No products found.</p>
          )}
        </div>
      </Card>

      {/* Categories Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Product Categories</h2>
          <Link href="/admin/categories" className="text-blue-600 hover:underline">
            Manage All
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Slug</th>
                <th className="text-left p-2">Subcategories</th>
                <th className="text-left p-2">Products</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length > 0 ? (
                categories.slice(0, 5).map((category: any) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{category.id}</td>
                    <td className="p-2 font-medium">{category.name}</td>
                    <td className="p-2 text-gray-600">{category.slug}</td>
                    <td className="p-2">{category.subcategories?.length || 0}</td>
                    <td className="p-2">{category.productCount || category.products?.length || 0}</td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        <Link href={`/admin/categories/${category.id}`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-2 text-center" colSpan={6}>
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
                    }
