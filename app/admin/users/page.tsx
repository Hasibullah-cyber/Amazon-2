
"use client"

import { useEffect, useState } from "react"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { AdminLoginModal } from "@/components/admin-login-modal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Eye, Mail, Calendar, UserCheck, AlertCircle } from "lucide-react"

export const dynamic = 'force-dynamic'

interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const { isAdminAuthenticated } = useAdminAuth()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...')
        const response = await fetch('/api/users')
        if (response.ok) {
          const fetchedUsers = await response.json()
          console.log('Fetched users:', fetchedUsers)
          setUsers(fetchedUsers)
        } else {
          console.error('Failed to fetch users:', response.status)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAdminAuthenticated) {
      fetchUsers()
    }
  }, [isAdminAuthenticated])

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
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Users Management</h1>
        </div>
        <p className="text-gray-600">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Users Management</h1>
            <p className="text-gray-600">Manage user accounts and view registrations</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Total Users: {users.length}
          </div>
        </div>
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Week</p>
              <p className="text-2xl font-bold">
                {users.filter(user => {
                  const userDate = new Date(user.createdAt)
                  const weekAgo = new Date()
                  weekAgo.setDate(weekAgo.getDate() - 7)
                  return userDate > weekAgo
                }).length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Users</h2>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Refresh
          </Button>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
            <p className="text-gray-600 mb-4">
              No users have registered yet. When users sign up, they will appear here.
            </p>
            <p className="text-sm text-gray-500">
              Make sure users are registering through the sign-up form on your website.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">User ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Registration Date</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{user.id}</td>
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-3">
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
        )}
      </Card>
    </div>
  )
}
