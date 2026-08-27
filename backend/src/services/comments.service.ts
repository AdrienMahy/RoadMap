import { db } from '../db'
import { comments } from '../db/schema'
import { eq, and } from 'drizzle-orm'

export interface CreateCommentPayload {
  targetType: 'project' | 'module' | 'stage'
  targetId: number
  userId: number
  content: string
}

export interface UpdateCommentPayload {
  content: string
}

export class CommentsService {
  async getComments(targetType: string, targetId: number) {
    const result = await db
      .select()
      .from(comments)
      .where(and(
        eq(comments.targetType, targetType),
        eq(comments.targetId, targetId)
      ))

    return result
  }

  async createComment(payload: CreateCommentPayload) {
    const newComment = await db
      .insert(comments)
      .values({
        targetType: payload.targetType,
        targetId: payload.targetId,
        userId: payload.userId,
        content: payload.content,
      })
      .returning()

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
