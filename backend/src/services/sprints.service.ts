import { and, asc, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { modules, projects, sprintItems, sprints, stages } from '@/db/schema'
import { getModuleWithHierarchy } from './modules.service'
import { getStageWithPoints } from './stages.service'

export type SprintItemTarget = { moduleId?: number; stageId?: number }

async function getSprintItems(sprintId: number) {
  const items = await db
    .select()
    .from(sprintItems)
    .where(eq(sprintItems.sprintId, sprintId))
    .orderBy(asc(sprintItems.orderIndex), asc(sprintItems.id))

  return Promise.all(items.map(async (item) => {
    if (item.moduleId) {
      const module = await getModuleWithHierarchy(item.moduleId)
      const project = module
        ? await db.select({ id: projects.id, name: projects.name }).from(projects).where(eq(projects.id, module.projectId)).then((rows) => rows[0])
        : null
      return { ...item, type: 'module' as const, project, module, stage: null, progress: module?.progress || 0 }
    }

    if (item.stageId) {
      const stage = await getStageWithPoints(item.stageId)
      const module = stage ? await getModuleWithHierarchy(stage.moduleId) : null
      const project = stage
        ? await db.select({ id: projects.id, name: projects.name }).from(projects).where(eq(projects.id, stage.projectId)).then((rows) => rows[0])
        : null
      return { ...item, type: 'stage' as const, project, module, stage, progress: stage?.progress || 0 }
    }

    return { ...item, type: 'unknown' as const, project: null, module: null, stage: null, progress: 0 }
  }))
}

export async function getSprints() {
  const sprintList = await db.select().from(sprints).orderBy(asc(sprints.startDate), asc(sprints.id))
  return Promise.all(sprintList.map(async (sprint) => {
    const items = await getSprintItems(sprint.id)
    return withProgress(sprint, items)
  }))
}

export async function getSprint(id: number) {
  const result = await db.select().from(sprints).where(eq(sprints.id, id))
  if (!result[0]) return null
  const items = await getSprintItems(id)
  return withProgress(result[0], items)
}

function withProgress(sprint: typeof sprints.$inferSelect, items: Awaited<ReturnType<typeof getSprintItems>>) {
  const progress = items.length > 0
    ? Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length)
    : 0
  const status = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'planned'
  return { ...sprint, status, progress, items }
}

export async function createSprint(data: { name: string; goal?: string; startDate: string; endDate: string }) {
  if (new Date(data.endDate) < new Date(data.startDate)) throw new Error('The end date must be after the start date')
  const [sprint] = await db.insert(sprints).values({
    name: data.name.trim(),
    goal: data.goal?.trim() || null,
    startDate: data.startDate,
    endDate: data.endDate,
  }).returning()
  return getSprint(sprint.id)
}

export async function updateSprint(id: number, data: Partial<{ name: string; goal: string; startDate: string; endDate: string }>) {
  const existing = await db.select().from(sprints).where(eq(sprints.id, id)).then((rows) => rows[0])
  if (!existing) return null
  const startDate = data.startDate || existing.startDate
  const endDate = data.endDate || existing.endDate
  if (new Date(endDate) < new Date(startDate)) throw new Error('The end date must be after the start date')

  await db.update(sprints).set({
    ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    ...(data.goal !== undefined ? { goal: data.goal.trim() || null } : {}),
    ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
    ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
    updatedAt: new Date(),
  }).where(eq(sprints.id, id))
  return getSprint(id)
}

export async function deleteSprint(id: number) {
  await db.delete(sprints).where(eq(sprints.id, id))
}

export async function addSprintItem(sprintId: number, target: SprintItemTarget) {
  return db.transaction(async (transaction) => {
    const sprint = await transaction.select({ id: sprints.id }).from(sprints).where(eq(sprints.id, sprintId)).then((rows) => rows[0])
    if (!sprint) throw new Error('Sprint not found')
    if ((target.moduleId ? 1 : 0) + (target.stageId ? 1 : 0) !== 1) throw new Error('Exactly one moduleId or stageId is required')

    const current = await transaction.select().from(sprintItems).where(eq(sprintItems.sprintId, sprintId))

    if (target.moduleId) {
      const module = await transaction.select({ id: modules.id }).from(modules).where(eq(modules.id, target.moduleId)).then((rows) => rows[0])
      if (!module) throw new Error('Module not found')

      const moduleStages = await transaction.select({ id: stages.id }).from(stages).where(eq(stages.moduleId, target.moduleId))
      const [item] = await transaction.insert(sprintItems).values({
        sprintId,
        moduleId: target.moduleId,
        stageId: null,
        orderIndex: current.length,
      }).onConflictDoNothing().returning()

      if (moduleStages.length > 0) {
        await transaction.insert(sprintItems).values(moduleStages.map((stage, index) => ({
          sprintId,
          moduleId: null,
          stageId: stage.id,
          orderIndex: current.length + index + 1,
        }))).onConflictDoNothing()
      }

      return item || transaction.select().from(sprintItems).where(and(
        eq(sprintItems.sprintId, sprintId),
        eq(sprintItems.moduleId, target.moduleId),
      )).then((rows) => rows[0])
    }

    const stage = await transaction.select({ id: stages.id }).from(stages).where(eq(stages.id, target.stageId!)).then((rows) => rows[0])
    if (!stage) throw new Error('Stage not found')
    const [item] = await transaction.insert(sprintItems).values({
      sprintId,
      moduleId: null,
      stageId: target.stageId,
      orderIndex: current.length,
    }).onConflictDoNothing().returning()
    return item || transaction.select().from(sprintItems).where(and(
      eq(sprintItems.sprintId, sprintId),
      eq(sprintItems.stageId, target.stageId),
    )).then((rows) => rows[0])
  })
}

export async function removeSprintItem(sprintId: number, itemId: number) {
  return db.transaction(async (transaction) => {
    const item = await transaction.select().from(sprintItems).where(and(
      eq(sprintItems.id, itemId),
      eq(sprintItems.sprintId, sprintId),
    )).then((rows) => rows[0])
    if (!item) return false

    await transaction.delete(sprintItems).where(eq(sprintItems.id, itemId))
    if (item.moduleId) {
      const moduleStages = await transaction.select({ id: stages.id }).from(stages).where(eq(stages.moduleId, item.moduleId))
      if (moduleStages.length > 0) {
        await transaction.delete(sprintItems).where(and(
          eq(sprintItems.sprintId, sprintId),
          inArray(sprintItems.stageId, moduleStages.map((stage) => stage.id)),
        ))
      }
    }
    return true
  })
}
