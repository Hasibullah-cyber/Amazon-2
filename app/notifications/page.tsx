
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Package, Truck, CheckCircle, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: number
  title: string
  message: string
  time: string
  date: string
  type: 'order' | 'delivery' | 'general'
  read: boolean
  orderId?: string
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Order Confirmed",
      message: "Your order has been confirmed and is being processed",
      time: "2 minutes ago",
      date: "Today",
      type: "order",
      read: false,
      orderId: "ORD-12345"
    },
    {
      id: 2,
      title: "Order Shipped",
      message: "Your order is on its way! Track your package using the tracking number",
      time: "1 hour ago",
      date: "Today",
      type: "delivery",
      read: false,
      orderId: "ORD-12344"
    },
    {
      id: 3,
      title: "Order Delivered",
      message: "Your order has been successfully delivered",
      time: "2 hours ago",
      date: "Today",
      type: "delivery",
      read: true,
      orderId: "ORD-12343"
    },
    {
      id: 4,
      title: "Welcome to Hasib Shop!",
      message: "Thank you for joining us. Enjoy 10% off your first order with code WELCOME10",
      time: "1 day ago",
      date: "Yesterday",
      type: "general",
      read: true
    },
    {
      id: 5,
      title: "Payment Successful",
      message: "Your payment has been processed successfully",
      time: "2 days ago",
      date: "Dec 27",
      type: "order",
      read: true,
      orderId: "ORD-12342"
    }
  ])

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read)

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="h-5 w-5 text-blue-500" />
      case 'delivery': return <Truck className="h-5 w-5 text-green-500" />
      default: return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
              <p className="text-gray-600">
                {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            onClick={() => setFilter('all')}
            className="flex items-center gap-2"
          >
            All Notifications
            <Badge variant="secondary">{notifications.length}</Badge>
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            onClick={() => setFilter('unread')}
            className="flex items-center gap-2"
          >
            Unread
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-600">
                {filter === 'unread' 
                  ? 'All your notifications have been read!' 
                  : 'When you have notifications, they will appear here.'
                }
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`text-sm font-medium ${
                        !notification.read ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{notification.date}</span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </span>
                      
                      {notification.orderId && (
                        <Link
                          href={`/track-order?id=${notification.orderId}`}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Track Order →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
