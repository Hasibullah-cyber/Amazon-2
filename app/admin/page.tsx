"use client"

import Link from "next/link"

export default function AdminHome() {
  // Sample data - replace with real database data later
  const stats = {
    totalOrders: 42,
    newCustomers: 8,
    topProduct: "Wireless Earbuds",
    revenue: "$3,845"
  }

  const recentOrders = [
    { id: "#ORD-1289", customer: "John Doe", amount: "$89.99", status: "Shipped" },
    { id: "#ORD-1288", customer: "Jane Smith", amount: "$124.99", status: "Processing" },
    { id: "#ORD-1287", customer: "Alex Johnson", amount: "$55.00", status: "Delivered" }
  ]

  const popularProducts = [
    { name: "Wireless Earbuds", stock: 42, price: "$59.99" },
    { name: "Smart Watch", stock: 15, price: "$129.99" },
    { name: "Bluetooth Speaker", stock: 28, price: "$79.99" }
  ]

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <p className="text-gray-600 mb-6">Welcome back! Here's your store overview.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-gray-500">New Customers</h3>
          <p className="text-2xl font-bold">{stats.newCustomers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-gray-500">Top Product</h3>
          <p className="text-2xl font-bold">{stats.topProduct}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-gray-500">Revenue</h3>
          <p className="text-2xl font-bold">{stats.revenue}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Link href="/admin/orders">
          <div className="p-4 bg-white rounded-xl shadow hover:bg-gray-50 transition cursor-pointer border">
            <h2 className="text-xl font-semibold">Orders</h2>
            <p className="text-gray-500">Manage customer orders</p>
          </div>
        </Link>
        <Link href="/admin/products">
          <div className="p-4 bg-white rounded-xl shadow hover:bg-gray-50 transition cursor-pointer border">
            <h2 className="text-xl font-semibold">Products</h2>
            <p className="text-gray-500">Add or update products</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Order ID</th>
                <th className="text-left p-2">Customer</th>
                <th className="text-left p-2">Amount</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{order.id}</td>
                  <td className="p-2">{order.customer}</td>
                  <td className="p-2">{order.amount}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === "Delivered" ? "bg-green-100 text-green-800" :
                      order.status === "Shipped" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Inventory */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Product Inventory</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {popularProducts.map((product) => (
            <div key={product.name} className="border p-4 rounded-lg hover:shadow-md transition">
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-gray-600">Price: {product.price}</p>
              <p className={`mt-2 text-sm ${
                product.stock > 20 ? "text-green-600" : "text-red-600"
              }`}>
                {product.stock} in stock
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
