"use client"

import Link from "next/link"

export default function AdminHome() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <p className="text-gray-600 mb-6">Welcome, Admin! Choose a section to manage:</p>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/dashboard">
          <div className="p-4 bg-white rounded-xl shadow hover:bg-gray-50 transition cursor-pointer border">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <p className="text-gray-500">Overview & quick stats</p>
          </div>
        </Link>

        <Link href="/admin/orders">
          <div className="p-4 bg-white rounded-xl shadow hover:bg-gray-50 transition cursor-pointer border">
            <h2 className="text-xl font-semibold">Orders</h2>
            <p className="text-gray-500">Manage customer orders</p>
          </div>
        </Link>

        <Link href="/admin/products">
          <div className="p-4 bg-white rounded-xl shadow hover:bg-gray-50 transition cursor-pointer border">
            <h2 className="text-xl font-semibold">Products</h2>
            <p className="text-gray-500">Add or update your products</p>
          </div>
        </Link>

        <Link href="/admin/users">
          <div className="p-4 bg-white rounded-xl shadow hover:bg-gray-50 transition cursor-pointer border">
            <h2 className="text-xl font-semibold">Users</h2>
            <p className="text-gray-500">View and manage users</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
