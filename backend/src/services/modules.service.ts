import { db } from '../db/index'
import { modules, stages, points, users, projects } from '../db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import NotificationsService from './notifications.service'

// Get all modules for a project
export async function getModulesByProject(projectId: number) {
  return await db
    .select()
    .from(modules)
    .where(eq(modules.projectId, projectId))
    .orderBy(modules.orderIndex)
}

// Get single module
export async function getModule(id: number) {
  const [module] = await db
    .select()
    .from(modules)
    .where(eq(modules.id, id))
  return module
}

// Get module with full hierarchy (stages + points)
export async function getModuleWithHierarchy(moduleId: number) {
  const module = await getModule(moduleId)
  if (!module) return null

  const stageList = await db
    .select()
    .from(stages)
    .where(eq(stages.moduleId, moduleId))
    .orderBy(stages.orderIndex)

  const stagesWithPoints = await Promise.all(
    stageList.map(async (stage) => {
      const pointList = await db
        .select()
        .from(points)
        .where(eq(points.stageId, stage.id))
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
    })
  )

  // Calculate module progress from stages
  const allPoints = stagesWithPoints.flatMap((s) => s.points)
  const completedAllPoints = allPoints.filter((p) => p.completed).length
  const moduleProgress =
    allPoints.length > 0
      ? Math.round((completedAllPoints / allPoints.length) * 100)
      : 0

  return {
    ...module,
    stages: stagesWithPoints,
    progress: moduleProgress,
  }
}

// Create module
export async function createModule(
  projectId: number,
  data: { name: string; description?: string; status?: string; icon?: string; priority?: string }
) {
  const [newModule] = await db
    .insert(modules)
    .values({
      projectId,
      name: data.name,
      description: data.description || '',
      status: data.status || 'planned',
      icon: data.icon || null,
      priority: data.priority || 'medium',
    })
    .returning()

  return newModule
}

// Update module
export async function updateModule(
  id: number,
  data: {
    name?: string
    description?: string
    status?: string
    orderIndex?: number
    icon?: string
    priority?: string
  }
) {
  const updateData: any = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.status !== undefined) updateData.status = data.status
  if (data.orderIndex !== undefined) updateData.orderIndex = data.orderIndex
  if (data.icon !== undefined) updateData.icon = data.icon
  if (data.priority !== undefined) updateData.priority = data.priority

  const [updated] = await db
    .update(modules)
    .set(updateData)
    .where(eq(modules.id, id))
    .returning()

  return updated
}

// Delete module (cascade deletes stages and points)
export async function deleteModule(id: number) {
  // Get all stages for this module
  const stageList = await db
    .select()
    .from(stages)
    .where(eq(stages.moduleId, id))

  // Delete all points for these stages
  for (const stage of stageList) {
    await db.delete(points).where(eq(points.stageId, stage.id))
  }

  // Delete all stages
  await db.delete(stages).where(eq(stages.moduleId, id))

  // Delete module
  return await db.delete(modules).where(eq(modules.id, id))
}

/**
 * Check if all stages in a module are validated and create notification if so
 */
export async function checkAndNotifyModuleValidation(moduleId: number) {
  try {
    const stageList = await db
      .select()
      .from(stages)
      .where(eq(stages.moduleId, moduleId))

    // Check if all stages have validatedAt set
    const allValidated = stageList.length > 0 && stageList.every(s => s.validatedAt !== null)

    if (allValidated) {
      const module = await getModule(moduleId)
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, module.projectId))
        .then(r => r[0])

      const allUsers = await db.select().from(users)

      for (const user of allUsers) {
        await NotificationsService.createNotification({
          userId: user.id,
          type: 'module_validated',
          targetType: 'module',
          targetId: moduleId,
          projectId: module.projectId,
          relatedUserId: undefined,
          message: `Module \"${module.name}\" fully validated in \"${project.name}\"`,
        })
      }
    }
  } catch (error) {
    console.error('Error checking module validation:', error)
  }
}
