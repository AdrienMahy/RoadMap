import { Router, Request, Response } from 'express'
import NotificationsService from '@/services/notifications.service'
import authMiddleware from '@/middleware/authMiddleware'

const router = Router()

// Protect all notification routes with auth middleware
router.use(authMiddleware)

/**
 * GET /api/notifications - Get all notifications for current user
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const unreadOnly = req.query.unreadOnly === 'true'
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined

    const userNotifications = await NotificationsService.getNotifications(userId, {
      unreadOnly,
      limit,
    })

    res.json(userNotifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

/**
 * GET /api/notifications/unread-count - Get unread notification count
 */
router.get('/unread-count', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const count = await NotificationsService.getUnreadCount(userId)

    res.json({ unreadCount: count })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({ error: 'Failed to fetch unread count' })
  }
})

/**
 * PUT /api/notifications/:id/read - Mark a notification as read
 */
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id)
    const userId = (req as any).user.id

    // Verify notification belongs to user
    const notifications = await NotificationsService.getNotifications(userId)
    const notification = notifications.find((n) => n.id === notificationId)

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    const updated = await NotificationsService.markAsRead(notificationId)
    res.json(updated)
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
})

/**
 * PUT /api/notifications/mark-all-read - Mark all notifications as read for current user
 */
router.put('/mark-all/read', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    await NotificationsService.markAllAsRead(userId)

    res.json({ success: true })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    res.status(500).json({ error: 'Failed to mark all notifications as read' })
  }
})

/**
 * DELETE /api/notifications/:id - Delete a notification
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id)
    const userId = (req as any).user.id

    // Verify notification belongs to user
    const notifications = await NotificationsService.getNotifications(userId)
    const notification = notifications.find((n) => n.id === notificationId)

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    await NotificationsService.deleteNotification(notificationId)
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ error: 'Failed to delete notification' })
  }
})

export default router
