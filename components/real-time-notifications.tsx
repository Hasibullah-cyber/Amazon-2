
"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  timestamp: number
}

export default function RealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const handleStoreNotification = (event: CustomEvent) => {
      const { message, type, timestamp } = event.detail
      
      const notification: Notification = {
        id: `${timestamp}-${Math.random()}`,
        message,
        type,
        timestamp
      }

      setNotifications(prev => [...prev, notification])

      // Also dispatch to navbar notifications
      window.dispatchEvent(new CustomEvent('navbar-notification', {
        detail: {
          id: Date.now(),
          title: type === 'success' ? 'Order Update' : type === 'error' ? 'Alert' : 'Notification',
          message,
          time: 'Just now',
          read: false,
          type: 'general'
        }
      }))

      // Auto remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      }, 5000)
    }

    // Listen for store notifications
    window.addEventListener('store-notification', handleStoreNotification as EventListener)

    return () => {
      window.removeEventListener('store-notification', handleStoreNotification as EventListener)
    }
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5" />
      case 'error': return <AlertCircle className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  const getColorClasses = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800'
      case 'error': return 'bg-red-50 border-red-200 text-red-800'
      default: return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`border rounded-lg p-4 shadow-lg transition-all duration-300 ${getColorClasses(notification.type)}`}
        >
          <div className="flex items-start space-x-3">
            {getIcon(notification.type)}
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
