"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { storeManager } from "@/lib/store"
import { TrendingUp, TrendingDown, ShoppingCart, Package, Users, DollarSign } from "lucide-react"

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])

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

  if (!stats) return <div className="p-6">Loading analytics...</div>

  const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  const avgOrderValue = orders.length > 0 ? stats.totalRevenue / orders.length : 0
  const topProducts = products
    .sort((a, b) => (b.price * b.stock) - (a.price * a.stock))
    .slice(0, 5)

  const recentActivity = orders
    .slice(0, 10)
    .map(order => ({
      type: 'order',
      message: `New order ${order.orderId} from ${order.customerName}`,
      amount: order.totalAmount,
      time: order.createdAt
    }))

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">৳{stats.totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% from last month</span>
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
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+5% from last month</span>
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
          <div className="mt-2 flex items-center text-sm">
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600">-3% from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Products</p>
              <p className="text-2xl font-bold">{products.filter(p => p.stock > 0).length}</p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+2 new products</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Status Distribution</h2>
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

        {/* Top Products by Value */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Top Products by Inventory Value</h2>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-medium text-sm">{product.name}</div>
                    <div className="text-xs text-gray-500">Stock: {product.stock}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">৳{(product.price * product.stock).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">@৳{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">{activity.message}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">৳{activity.amount.toFixed(2)}</div>
                <div className="text-xs text-gray-500">
                  {new Date(activity.time).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}