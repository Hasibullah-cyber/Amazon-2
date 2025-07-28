"use client"

import { useEffect, useState, useCallback, Component, ErrorInfo, ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign, 
  RefreshCw,
  TrendingUp,
  Smile,
  Star,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Stats {
  monthlyRevenue: number
  totalOrders: number
  totalUsers: number
  avgOrderValue: number
  conversionRate: number
  customerSatisfaction: number
  topProducts: { product_name: string; order_count: number }[]
}

// Define ErrorBoundary component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p className="font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Dashboard Error
            </p>
            <p className="my-2">
              {this.state.error?.message || 'Something went wrong.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true)
      setError(null)
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

      const res = await fetch(`${baseUrl}/api/admin/stats`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })

      if (!res.ok) throw new Error(`Failed to fetch stats: ${res.status}`)

      const data = await res.json()
      setStats(data)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      console.error('[DASHBOARD_FETCH_ERROR]', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon,
    prefix = '',
    suffix = '',
    color = 'text-blue-600'
  }: {
    title: string
    value: string | number
    icon: React.ElementType
    prefix?: string
    suffix?: string
    color?: string
  }) => (
    <Card className="p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg')} bg-opacity-20`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </Card>
  )

  const renderContent = () => {
    if (loading && !stats) {
      return (
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      )
    }

    if (error || !stats) {
      return (
        <div className="p-6">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <p className="font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Error
            </p>
            <p className="my-2">{error || 'Failed to load stats'}</p>
            <Button
              onClick={fetchData}
              className="mt-2 bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      )
    }

    return (
      <>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold">Admin Analytics Dashboard</h1>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated}
              </p>
            )}
            <Button 
              onClick={fetchData} 
              size="sm"
              disabled={refreshing}
              variant="outline"
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Monthly Revenue" 
            value={stats.monthlyRevenue} 
            prefix="৳" 
            icon={DollarSign} 
            color="text-green-600"
          />
          
          <StatCard 
            title="Total Orders" 
            value={stats.totalOrders} 
            icon={ShoppingCart} 
            color="text-blue-600"
          />
          
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={Users} 
            color="text-orange-600"
          />
          
          <StatCard 
            title="Avg Order Value" 
            value={stats.avgOrderValue} 
            prefix="৳" 
            icon={Package} 
            color="text-purple-600"
          />
          
          <div className="col-span-1 md:col-span-2">
            <StatCard 
              title="Conversion Rate" 
              value={stats.conversionRate} 
              suffix="%" 
              icon={TrendingUp} 
              color="text-teal-600"
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <StatCard 
              title="Customer Satisfaction" 
              value={stats.customerSatisfaction} 
              suffix="%" 
              icon={Smile} 
              color="text-yellow-600"
            />
          </div>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Top 5 Best-Selling Products</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              Most popular items
            </div>
          </div>
          
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div 
                key={product.product_name} 
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div className="font-medium">{product.product_name}</div>
                </div>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                  {product.order_count} orders
                </div>
              </div>
            ))}
          </div>
        </Card>
      </>
    )
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        {renderContent()}
      </div>
    </ErrorBoundary>
  )
              }
