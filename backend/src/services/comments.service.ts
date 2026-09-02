import { db } from '../db'
import { comments, users, projects, stages, modules } from '../db/schema'
import { eq, and, ne } from 'drizzle-orm'
import NotificationsService from './notifications.service'

export interface CreateCommentPayload {
  targetType: 'project' | 'module' | 'stage'
  targetId: number
  projectId: number
  userId: number
  content: string
}

export interface UpdateCommentPayload {
  content: string
}

export class CommentsService {
  /**
   * Helper to get the name of the commented target
   */
  private async getTargetName(targetType: string, targetId: number): Promise<string> {
    if (targetType === 'project') {
      const result = await db
        .select({ name: projects.name })
        .from(projects)
        .where(eq(projects.id, targetId))
        .then(r => r[0])
      return result?.name || 'Unknown project'
    } else if (targetType === 'stage') {
      const result = await db
        .select({ name: stages.name })
        .from(stages)
        .where(eq(stages.id, targetId))
        .then(r => r[0])
      return result?.name || 'Unknown stage'
    } else if (targetType === 'module') {
      const result = await db
        .select({ name: modules.name })
        .from(modules)
        .where(eq(modules.id, targetId))
        .then(r => r[0])
      return result?.name || 'Unknown module'
    }
    return 'Unknown target'
  }

  /**
   * Helper to get project name
   */
  private async getProjectName(projectId: number): Promise<string> {
    const result = await db
      .select({ name: projects.name })
      .from(projects)
      .where(eq(projects.id, projectId))
      .then(r => r[0])
    return result?.name || 'Unknown project'
  }

  async getComments(targetType: string, targetId: number) {
    const result = await db
      .select({
        id: comments.id,
        targetType: comments.targetType,
        targetId: comments.targetId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        userName: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(and(
        eq(comments.targetType, targetType),
        eq(comments.targetId, targetId)
      ))

    return result
  }

  async createComment(payload: CreateCommentPayload) {
    // Get the user who is creating the comment
    const creator = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .then(results => results[0])

    const newComment = await db
      .insert(comments)
      .values({
        targetType: payload.targetType,
        targetId: payload.targetId,
        userId: payload.userId,
        content: payload.content,
      })
      .returning()

    // Create notifications for all other users
    const allUsers = await db.select().from(users)
    const userName = creator?.firstName || creator?.username || 'A user'
    
    // Get target and project names for better message
    const targetName = await this.getTargetName(payload.targetType, payload.targetId)
    const projectName = await this.getProjectName(payload.projectId)
    
    // Build descriptive message
    const message = `${userName} commented on "${targetName}" in "${projectName}"`
    
    for (const user of allUsers) {
      if (user.id !== payload.userId) {
        await NotificationsService.createNotification({
          userId: user.id,
          type: 'comment_added',
          targetType: payload.targetType,
          targetId: payload.targetId,
          projectId: payload.projectId,
          relatedUserId: payload.userId,
          message: message,
        })
      }
    }

    return newComment[0]
  }

  async updateComment(id: number, payload: UpdateCommentPayload) {
    const updated = await db
      .update(comments)
      .set({
        content: payload.content,
        updatedAt: new Date(),
      })
      .where(eq(comments.id, id))
      .returning()

    return updated[0]
  }

  async deleteComment(id: number) {
    await db.delete(comments).where(eq(comments.id, id))
    return { success: true }
  }
}

export const commentsService = new CommentsService()
