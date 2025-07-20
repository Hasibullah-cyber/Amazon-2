"use client"

import { useEffect, useState, Component } from "react"
import { Card } from "@/components/ui/card"
import { ShoppingCart, Package, Users, DollarSign } from "lucide-react"
import { getBaseUrl } from "@/lib/getBaseUrl"

interface Stats {
  totalRevenue?: number
  [key: string]: any
}

interface Product {
  id: string
  name: string
  price: number | string
  stock: number | string
}

interface Order {
  id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  [key: string]: any
}

class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            <p className="font-bold">Dashboard Error</p>
            <pre className="text-sm whitespace-pre-wrap">{this.state.error?.message}</pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
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

      const statsResponse = await fetch(`${baseUrl}/api/admin/stats`)
      const ordersResponse = await fetch(`${baseUrl}/api/admin/orders`)
      const productsResponse = await fetch(`${baseUrl}/api/admin/products`)

      if (!statsResponse.ok) throw new Error(`Stats failed: ${statsResponse.status}`)
      if (!ordersResponse.ok) throw new Error(`Orders failed: ${ordersResponse.status}`)
      if (!productsResponse.ok) throw new Error(`Products failed: ${productsResponse.status}`)

      const statsData = await statsResponse.json()
      const ordersData = await ordersResponse.json()
      const productsData = await productsResponse.json()

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

  // ✅ Safe cast
  const toNum = (val: number | string | null | undefined) =>
    typeof val === 'number' ? val : parseFloat(val || '0')

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + toNum(p.price) * toNum(p.stock),
    0
  )
  const avgOrderValue = orders.length > 0
    ? Number(stats?.totalRevenue || 0) / orders.length
    : 0

  const topProducts = [...products]
    .sort((a, b) => (toNum(b.price) * toNum(b.stock)) - (toNum(a.price) * toNum(a.stock)))
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
    <ErrorBoundary>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">৳{Number(stats?.totalRevenue ?? 0).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold">৳{avgOrderValue.toFixed(2)}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold">৳{totalInventoryValue.toFixed(2)}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Products</p>
                <p className="text-2xl font-bold">{products.filter(p => toNum(p.stock) > 0).length}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>
          <div className="space-y-3">
            {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => {
              const count = orders.filter(o => o.status === status).length
              const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize text-sm font-medium">{status}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'delivered' ? 'bg-green-500' :
                          status === 'shipped' ? 'bg-blue-500' :
                          status === 'processing' ? 'bg-yellow-500' :
                          status === 'cancelled' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm w-12 text-right">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">Stock: {toNum(product.stock)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">৳{(toNum(product.price) * toNum(product.stock)).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">@৳{toNum(product.price).toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </ErrorBoundary>
  )
}
