import { db } from '@/db'
import { points, updateHistory, stages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { Point } from '@/types'

/**
 * Points Routes
 */

export async function getPointsByStage(stageId: number): Promise<Point[]> {
  const result = await db.select().from(points).where(eq(points.stageId, stageId))
  return result
}

export async function getPointById(id: number): Promise<Point | null> {
  const result = await db.select().from(points).where(eq(points.id, id)).limit(1)
  return result.length > 0 ? result[0] : null
}

export async function createPoint(
  stageId: number,
  data: { name: string; description?: string },
  author: string = 'system'
): Promise<Point> {
  const [created] = await db
    .insert(points)
    .values({
      stageId,
      name: data.name,
      description: data.description,
      completed: false,
      orderIndex: 0,
    })
    .returning()

  // Log to update history
  await db.insert(updateHistory).values({
    targetType: 'point',
    targetId: created.id,
    action: 'created',
    newValue: JSON.stringify(created),
    changedBy: author,
  })

  return created
}

export async function updatePoint(
  id: number,
  data: Partial<Point>,
  author: string = 'system'
): Promise<Point | null> {
  const existing = await getPointById(id)
  if (!existing) return null

  // Only update allowed fields
  const updateData: any = {
    updatedAt: new Date(),
  }
  
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.completed !== undefined) {
    updateData.completed = data.completed
    // Set or clear completedAt based on completion status
    updateData.completedAt = data.completed ? new Date() : null
  }
  if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex
  if (data.priority !== undefined) updateData.priority = data.priority

  const [updated] = await db
    .update(points)
    .set(updateData)
    .where(eq(points.id, id))
    .returning()

  // Log completion change
  if (data.completed !== undefined && existing.completed !== data.completed) {
    await db.insert(updateHistory).values({
      targetType: 'point',
      targetId: id,
      action: 'status_changed',
      oldValue: existing.completed ? 'completed' : 'pending',
      newValue: data.completed ? 'completed' : 'pending',
      changedBy: author,
    })

    // Check if all points in the stage are completed
    const stagePoints = await getPointsByStage(existing.stageId)
    const allCompleted = stagePoints.every(p => p.id === id ? data.completed : p.completed)
    
    if (allCompleted) {
      // All points completed - set stage validated date
      await db
        .update(stages)
        .set({ validatedAt: new Date() })
        .where(eq(stages.id, existing.stageId))
    } else if (data.completed === false) {
      // A point was uncompleted - clear stage validated date
      await db
        .update(stages)
        .set({ validatedAt: null })
        .where(eq(stages.id, existing.stageId))
    }
  }

  return updated
}

export async function deletePoint(id: number, author: string = 'system'): Promise<void> {
  await db.insert(updateHistory).values({
    targetType: 'point',
    targetId: id,
    action: 'deleted',
    changedBy: author,
  })

  await db.delete(points).where(eq(points.id, id))
}
