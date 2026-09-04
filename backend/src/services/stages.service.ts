import { db } from '@/db'
import { stages, points, updateHistory, users, projects, modules } from '@/db/schema'
import { eq } from 'drizzle-orm'
import NotificationsService from './notifications.service'

/**
 * Stages Service
 */

// Get all stages for a module
export async function getStagesByModule(moduleId: number) {
  return await db
    .select()
    .from(stages)
    .where(eq(stages.moduleId, moduleId))
    .orderBy(stages.orderIndex)
}

// Get single stage
export async function getStage(id: number) {
  const [stage] = await db
    .select()
    .from(stages)
    .where(eq(stages.id, id))
  return stage
}

// Get stage with points
export async function getStageWithPoints(id: number) {
  const stage = await getStage(id)
  if (!stage) return null

  const pointList = await db
    .select()
    .from(points)
    .where(eq(points.stageId, id))
    .orderBy(points.orderIndex)

  const completedPoints = pointList.filter((p) => p.completed).length
  const progress =
    pointList.length > 0
      ? Math.round((completedPoints / pointList.length) * 100)
      : 0

  return {
    ...stage,
    points: pointList,
    progress,
  }
}

// Create stage
export async function createStage(
  moduleId: number,
  data: {
    name: string
    description?: string
    deliveryDate?: string
    status?: string
    icon?: string
    priority?: string
  }
) {
  const [newStage] = await db
    .insert(stages)
    .values({
      moduleId,
      name: data.name,
      description: data.description || '',
      deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
      status: data.status || 'pending',
      icon: data.icon || null,
      priority: data.priority || 'medium',
    })
    .returning()

  // Log creation
  await db.insert(updateHistory).values({
    targetType: 'stage',
    targetId: newStage.id,
    action: 'created',
    newValue: JSON.stringify(newStage),
    changedBy: 'system',
  })

  return newStage
}

// Update stage
export async function updateStage(
  id: number,
  data: {
    name?: string
    description?: string
    deliveryDate?: string
    status?: string
    orderIndex?: number
    icon?: string
    priority?: string
    moduleId?: number
  }
) {
  const existing = await getStage(id)
  if (!existing) return null

  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.deliveryDate !== undefined)
    updateData.deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null
  if (data.status !== undefined) updateData.status = data.status
  if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.priority !== undefined) updateData.priority = data.priority
  if (data.moduleId !== undefined) updateData.moduleId = data.moduleId

  const [updated] = await db
    .update(stages)
    .set(updateData)
    .where(eq(stages.id, id))
    .returning()

  // Log status change if applicable
  if (data.status && existing.status !== data.status) {
    await db.insert(updateHistory).values({
      targetType: 'stage',
      targetId: id,
      action: 'status_changed',
      oldValue: existing.status,
      newValue: data.status,
      changedBy: 'system',
    })

    // Create notification if stage is marked as stopped
    if (data.status === 'stopped') {
      try {
        const module = await db.select().from(modules).where(eq(modules.id, updated.moduleId)).then(r => r[0])
        const project = await db.select().from(projects).where(eq(projects.id, module.projectId)).then(r => r[0])
        const allUsers = await db.select().from(users)

        for (const user of allUsers) {
          await NotificationsService.createNotification({
            userId: user.id,
            type: 'stage_stopped',
            targetType: 'stage',
            targetId: id,
            projectId: module.projectId,
            relatedUserId: undefined,
            message: `Stage "${updated.name}" stopped in "${project.name}"`,
          })
        }
      } catch (error) {
        console.error('Error creating stage stopped notification:', error)
      }
    }
  }

  return updated
}

// Delete stage (cascade deletes points)
export async function deleteStage(id: number) {
  // Delete all points in this stage
  await db.delete(points).where(eq(points.stageId, id))

  // Log deletion
  await db.insert(updateHistory).values({
    targetType: 'stage',
    targetId: id,
    action: 'deleted',
    changedBy: 'system',
  })

  // Delete the stage
  return await db.delete(stages).where(eq(stages.id, id))
}

// Calculate stage progress
export async function getStageProgress(stageId: number) {
  const stagePoints = await db
    .select()
    .from(points)
    .where(eq(points.stageId, stageId))
  if (stagePoints.length === 0) return 0
  const completedCount = stagePoints.filter((p) => p.completed).length
  return Math.round((completedCount / stagePoints.length) * 100)
}

