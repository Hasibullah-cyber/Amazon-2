
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useAdminAuth } from "@/components/admin-auth-provider"
import { X, Eye, EyeOff, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { adminSignIn } = useAdminAuth()
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await adminSignIn(formData.username, formData.password)
      if (result.success) {
        onClose()
        router.push('/admin')
      } else {
        setError(result.error || 'Failed to sign in as admin')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center justify-center mb-6">
          <Shield className="h-8 w-8 text-blue-600 mr-2" />
          <h2 className="text-2xl font-bold">Admin Login</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Admin Username</label>
            <Input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="Enter admin username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Admin Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Enter admin password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In as Admin'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Admin access only. Unauthorized access is prohibited.</p>
        </div>
      </Card>
    </div>
  )
}
