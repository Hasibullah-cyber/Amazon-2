"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Package, Users, DollarSign } from "lucide-react"
import { getBaseUrl } from "@/lib/getBaseUrl"
import { ErrorBoundary } from "react-error-boundary"

interface Stats {
  totalRevenue?: number
  [key: string]: any
}

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface Order {
  id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  [key: string]: any
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="p-6">
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
        <p className="font-bold">Dashboard Error</p>
        <pre className="text-sm whitespace-pre-wrap">{error.message}</pre>
        <button
          onClick={resetErrorBoundary}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const baseUrl = getBaseUrl()
      if (!baseUrl) throw new Error("Base URL not configured")

      const endpoints = [
        `${baseUrl}/api/admin/stats`,
        `${baseUrl}/api/admin/orders`,
        `${baseUrl}/api/admin/products`
      ]

      const responses = await Promise.all(endpoints.map(url => 
        fetch(url).then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return res.json()
        })
      ))

      // Validate and normalize responses
      const [statsData, ordersData, productsData] = responses
      
      if (!statsData) throw new Error("No stats data received")
      if (!ordersData) throw new Error("No orders data received")
      if (!productsData) throw new Error("No products data received")

      setStats(statsData)
      setOrders(Array.isArray(ordersData) ? ordersData : ordersData.orders || [])
      setProducts(Array.isArray(productsData) ? productsData : productsData.products || [])
      
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Safe calculations
  const totalInventoryValue = products.reduce((sum, p) => sum + (Number(p.price) * Number(p.stock || 0)), 0)
  const avgOrderValue = orders.length > 0 ? (Number(stats?.totalRevenue || 0) / orders.length : 0
  const topProducts = [...products]
    .sort((a, b) => (Number(b.price) * Number(b.stock)) - (Number(a.price) * Number(a.stock)))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        setError(null)
        fetchData()
      }}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

        {/* Dashboard content remains the same */}
        {/* ... */}
      </div>
    </ErrorBoundary>
  )
}
