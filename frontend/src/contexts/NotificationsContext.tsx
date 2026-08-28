import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Notification, NotificationsAPI } from '@/lib/notifications'
import { useAuth } from './AuthContext'

interface NotificationsContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: number) => Promise<void>
  addNotification: (notification: Notification) => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const refreshNotifications = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const [notificationList, countData] = await Promise.all([
        NotificationsAPI.getNotifications({ limit: 50 }),
        NotificationsAPI.getUnreadCount(),
      ])

      setNotifications(notificationList)
      setUnreadCount(countData.unreadCount)
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  const markAsRead = useCallback(
    async (notificationId: number) => {
      try {
        await NotificationsAPI.markAsRead(notificationId)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },
    []
  )

  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationsAPI.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }, [])

  const deleteNotification = useCallback(
    async (notificationId: number) => {
      try {
        await NotificationsAPI.deleteNotification(notificationId)
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
        const wasUnread = notifications.find((n) => n.id === notificationId)?.read === false
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    },
    [notifications]
  )

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev])
    if (!notification.read) {
      setUnreadCount((prev) => prev + 1)
    }
  }, [])

  // Initial load and polling
  useEffect(() => {
    if (!user) return

    // Initial load
    refreshNotifications()

    // Poll every 30 seconds for new notifications
    const interval = setInterval(() => {
      refreshNotifications()
    }, 30000)

    return () => clearInterval(interval)
  }, [user, refreshNotifications])

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationsContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within NotificationsProvider')
  }
  return context
}
