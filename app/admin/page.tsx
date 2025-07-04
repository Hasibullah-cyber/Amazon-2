"use client"

import { useEffect, useState } from "react"
export const dynamic = 'force-dynamic'
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { AdminLoginModal } from "@/components/admin-login-modal"
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, Eye, Edit } from "lucide-react"

export default function AdminHome() {
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdminAuthenticated, adminSignOut } = useAdminAuth()

  useEffect(() => {
    console.log("Authentication status:", isAdminAuthenticated)
    
    if (!isAdminAuthenticated) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log("Starting data fetch...")
        const startTime = Date.now()

        const [statsResponse, ordersResponse, productsResponse] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/orders'),
          fetch('/api/admin/products')
        ])

        console.log("API responses received in", Date.now() - startTime + "ms")

        if (!statsResponse.ok) throw new Error(`Stats API failed: ${statsResponse.status}`)
        if (!ordersResponse.ok) throw new Error(`Orders API failed: ${ordersResponse.status}`)
        if (!productsResponse.ok) throw new Error(`Products API failed: ${productsResponse.status}`)

        const [statsData, ordersData, productsData] = await Promise.all([
          statsResponse.json(),
          ordersResponse.json(),
          productsResponse.json()
        ])

        console.log("Fetched data:", {
          stats: statsData,
          orders: ordersData,
          products: productsData
        })

        setStats(statsData)
        setOrders(ordersData)
        setProducts(productsData)

      } catch (err) {
        console.error("Fetch error:", err)
        setError(err instanceof Error ? err.message : "Failed to load admin data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Add cleanup if needed
    return () => {
      // Cancel any ongoing requests if component unmounts
    }
  }, [isAdminAuthenticated])

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update order: ${response.status}`)
      }

      // Refresh orders after update
      const updatedOrders = await fetch('/api/admin/orders')
      if (updatedOrders.ok) {
        setOrders(await updatedOrders.json())
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      setError(error instanceof Error ? error.message : "Failed to update order")
    }
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

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading admin dashboard...</p>
        <p className="text-sm text-gray-500 mt-2">Fetching data from server...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading dashboard: {error}
              </p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!stats || !orders || !products) {
    return (
      <div className="p-6">
        <p className="text-red-500">No data available</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="mt-4"
        >
          Refresh Data
        </Button>
      </div>
    )
  }

  const subtotal = stats.totalRevenue || 0
  const pendingOrders = stats.pendingOrders || 0
  const lowStockProducts = stats.lowStockProducts || 0
  const totalOrders = stats.totalOrders || 0

  return (
    <div className="p-6">
      {/* Header and other components remain the same as your original */}
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
        {/* Cards remain the same but with null checks */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        {/* Other cards... */}
      </div>

      {/* Rest of your original JSX */}
    </div>
  )
        }
