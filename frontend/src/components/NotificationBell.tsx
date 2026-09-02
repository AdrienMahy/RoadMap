import React, { useState, useRef, useEffect } from 'react'
import { Bell, X, Eye, CheckCheck, MessageCircle, CheckCircle, BadgeCheck, AlertCircle } from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationsContext'
import { Notification } from '@/lib/notifications'

function getNotificationIcon(type: string) {
  switch (type) {
    case 'comment_added':
      return { icon: MessageCircle, color: 'text-blue-400', bgColor: 'bg-blue-500/10' }
    case 'stage_validated':
      return { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10' }
    case 'module_validated':
      return { icon: BadgeCheck, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' }
    case 'stage_stopped':
      return { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/10' }
    default:
      return { icon: Bell, color: 'text-dark-400', bgColor: 'bg-dark-500/10' }
  }
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  const handleViewNotification = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation()
    console.log('🔔 Clicked eye icon for notification:', notification)
    
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    const viewData = {
      targetType: notification.targetType,
      targetId: notification.targetId,
      projectId: notification.projectId,
      notificationId: notification.id,
    }
    
    console.log('📤 Dispatching viewNotification event:', viewData)
    
    // Emit custom event for BoardPage to listen
    window.dispatchEvent(
      new CustomEvent('viewNotification', { detail: viewData })
    )
    
    // Close dropdown
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-dark-300 hover:text-red-400 transition rounded-lg hover:bg-dark-700"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-dark-800 border border-red-900/30 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-950/40 to-dark-900 p-4 border-b border-red-900/20 flex justify-between items-center rounded-t-lg">
            <h3 className="font-semibold text-dark-100">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs px-2 py-1 bg-red-600/30 text-red-300 hover:bg-red-600/50 transition rounded"
                  title="Mark all as read"
                >
                  <CheckCheck size={14} />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-dark-400 hover:text-dark-200 transition"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.filter(n => !n.read).length === 0 ? (
              <div className="p-6 text-center text-dark-400">
                <p>No new notifications</p>
              </div>
            ) : (
              notifications
                .filter(n => !n.read)
                .map((notification) => {
                  const { icon: IconComponent, color, bgColor } = getNotificationIcon(notification.type)
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-3 border-b border-red-900/10 cursor-pointer transition ${bgColor} hover:opacity-80`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className={`flex-shrink-0 p-1.5 rounded ${bgColor}`}>
                          <IconComponent size={16} className={color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-dark-100 font-medium">{notification.message}</p>
                          <p className="text-xs text-dark-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleViewNotification(e, notification)}
                          className="text-dark-400 hover:text-red-400 transition flex-shrink-0"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })
            )}
          </div>

          {/* Footer */}
          {notifications.filter(n => !n.read).length > 0 && (
            <div className="p-2 border-t border-red-900/20 bg-dark-900 rounded-b-lg text-xs text-dark-400 text-center">
              Showing {notifications.filter(n => !n.read).length} unread notifications
            </div>
          )}
        </div>
      )}
    </div>
  )
}
