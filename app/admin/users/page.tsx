"use client"

import { useEffect, useState, useCallback } from "react"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { AdminLoginModal } from "@/components/admin-login-modal"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Users, Eye, Mail, Calendar, UserCheck, AlertCircle, 
  Search, Loader2, ArrowDownUp, Trash2 
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"

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
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { isAdminAuthenticated } = useAdminAuth()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`)
      }
      
      const fetchedUsers = await response.json()
      setUsers(fetchedUsers)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchUsers()
    }
  }, [isAdminAuthenticated, fetchUsers])

  const handleDelete = async () => {
    if (!deletingId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${deletingId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete user')
      }
      
      setUsers(users.filter(user => user.id !== deletingId))
      setShowDeleteDialog(false)
      setDeletingId(null)
    } catch (err) {
      console.error('Error deleting user:', err)
      setError(err instanceof Error ? err.message : 'Delete operation failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  // Filter and sort users
  const filteredUsers = users
    .filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
    })

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <Button onClick={() => setShowAdminLogin(true)}>
            Admin Login
          </Button>
          <AdminLoginModal 
            isOpen={showAdminLogin} 
            onClose={() => setShowAdminLogin(false)} 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-600">{error}</span>
          <button 
            className="ml-auto text-red-600 hover:text-red-800"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Users Management</h1>
            <p className="text-gray-600">Manage user accounts and view registrations</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={() => {
              setLoading(true)
              fetchUsers()
            }}
            variant="outline"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Refresh
          </Button>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-xl font-semibold">All Users</h2>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              Showing: {filteredUsers.length} of {users.length}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleSortOrder}
            >
              <ArrowDownUp className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500 mb-4" />
            <p>Loading user data...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No matching users' : 'No Users Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'When users sign up, they will appear here.'}
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm max-w-[120px] truncate">
                      {user.id}
                    </td>
                    <td className="p-3 font-medium">{user.name}</td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate max-w-[200px]">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            setDeletingId(user.id)
                            setShowDeleteDialog(true)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
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

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold">User Details</h3>
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-mono text-sm break-all">{selectedUser.id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Registration Date</p>
                  <p>
                    {new Date(selectedUser.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold">Delete User</h3>
                  <p className="mt-2 text-gray-600">
                    Are you sure you want to delete this user? This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
                  }
