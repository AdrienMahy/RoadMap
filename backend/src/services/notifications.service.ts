import { db } from '@/db'
import { notifications } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export interface CreateNotificationInput {
  userId: number
  type: string
  targetType?: string
  targetId?: number
  projectId: number
  relatedUserId?: number
  message: string
}

export interface NotificationResponse {
  id: number
  userId: number
  type: string
  targetType?: string
  targetId?: number
  projectId: number
  relatedUserId?: number
  message: string
  read: boolean
  createdAt: Date
}

class NotificationsService {
  /**
   * Create a new notification
   */
  async createNotification(input: CreateNotificationInput): Promise<NotificationResponse> {
    const result = await db
      .insert(notifications)
      .values({
        userId: input.userId,
        type: input.type,
        targetType: input.targetType,
        targetId: input.targetId,
        projectId: input.projectId,
        relatedUserId: input.relatedUserId,
        message: input.message,
      })
      .returning()

    return result[0] as NotificationResponse
  }

  /**
   * Get all notifications for a user with optional filtering
   */
  async getNotifications(
    userId: number,
    options?: { unreadOnly?: boolean; limit?: number }
  ): Promise<NotificationResponse[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))

    if (options?.unreadOnly) {
      query = query.where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const result = await query

    return result as NotificationResponse[]
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    const result = await db
      .select()
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))

    return result.length
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: number): Promise<NotificationResponse> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId))
      .returning()

    return result[0] as NotificationResponse
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, notificationId))
  }

  /**
   * Delete all notifications for a user (optional)
   */
  async deleteAllNotifications(userId: number): Promise<void> {
    await db.delete(notifications).where(eq(notifications.userId, userId))
  }
}

export default new NotificationsService()
