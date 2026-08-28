import { api } from '@/lib/api'

export interface Notification {
  id: number
  userId: number
  type: string
  targetType?: string
  targetId?: number
  projectId: number
  relatedUserId?: number
  message: string
  read: boolean
  createdAt: string
}

export const NotificationsAPI = {
  /**
   * Get all notifications for current user
   */
  async getNotifications(options?: { unreadOnly?: boolean; limit?: number }): Promise<Notification[]> {
    const params = new URLSearchParams()
    if (options?.unreadOnly) params.append('unreadOnly', 'true')
    if (options?.limit) params.append('limit', options.limit.toString())

    const query = params.toString() ? `?${params.toString()}` : ''
    const { data } = await api.get(`/notifications${query}`)
    return data
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const { data } = await api.get('/notifications/unread-count')
    return data
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    const { data } = await api.put(`/notifications/${notificationId}/read`, {})
    return data
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ success: boolean }> {
    const { data } = await api.put('/notifications/mark-all/read', {})
    return data
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<{ success: boolean }> {
    const { data } = await api.delete(`/notifications/${notificationId}`)
    return data
  },
}
