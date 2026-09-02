import { db } from '../db'
import { projects, modules, stages, points, updateHistory, comments } from '../db/schema'
import { eq, and, count } from 'drizzle-orm'

export async function getProjects() {
  const allProjects = await db.select().from(projects).orderBy(projects.orderIndex)
  
  // Calculate progress for each project
  const projectsWithProgress = await Promise.all(
    allProjects.map(async (project) => {
      try {
        const projectModules = await db
          .select()
          .from(modules)
          .where(eq(modules.projectId, project.id))
        
        if (projectModules.length === 0) {
          return { ...project, progress: 0 }
        }
        
        // Get all stages for all modules of this project
        let allProjectStages: any[] = []
        for (const mod of projectModules) {
          const stageList = await db.select().from(stages).where(eq(stages.moduleId, mod.id))
          allProjectStages.push(...stageList)
        }
        
        if (allProjectStages.length === 0) {
          return { ...project, progress: 0 }
        }
        
        // Get all points for all stages
        let allProjectPoints: any[] = []
        for (const stage of allProjectStages) {
          const pointList = await db.select().from(points).where(eq(points.stageId, stage.id))
          allProjectPoints.push(...pointList)
        }
        
        const completedPoints = allProjectPoints.filter(p => p.completed).length
        const projectProgress = allProjectPoints.length > 0 
          ? Math.round((completedPoints / allProjectPoints.length) * 100)
          : 0
        
        return { ...project, progress: projectProgress }
      } catch (error) {
        console.error(`Error calculating progress for project ${project.id}:`, error)
        return { ...project, progress: 0 }
      }
    })
  )
  
  return projectsWithProgress
}

export async function getProject(id: number) {
  const result = await db.select().from(projects).where(eq(projects.id, id))
  if (!result.length) return null
  return result[0]
}

export async function getProjectWithHierarchy(projectId: number) {
  const project = await getProject(projectId)
  if (!project) return null

  const projectModules = await db
    .select()
    .from(modules)
    .where(eq(modules.projectId, projectId))
    .orderBy(modules.orderIndex)

  const modulesWithHierarchy = await Promise.all(
    projectModules.map(async (module) => {
      const moduleStages = await db
        .select()
        .from(stages)
        .where(eq(stages.moduleId, module.id))
        .orderBy(stages.orderIndex)

      const stagesWithPoints = await Promise.all(
        moduleStages.map(async (stage) => {
          const stagePoints = await db
            .select()
            .from(points)
            .where(eq(points.stageId, stage.id))
            .orderBy(points.orderIndex)

          const completedStagePoints = stagePoints.filter(
            (p) => p.completed
          ).length
          const stageProgress =
            stagePoints.length > 0
              ? Math.round(
                  (completedStagePoints / stagePoints.length) * 100
                )
              : 0

          // Count comments for this stage
          const commentCount = await db
            .select({ count: count() })
            .from(comments)
            .where(and(
              eq(comments.targetType, 'stage'),
              eq(comments.targetId, stage.id)
            ))
            .then(result => result[0]?.count || 0)

          return { ...stage, points: stagePoints, progress: stageProgress, commentCount }
        })
      )

      const moduleProgress =
        stagesWithPoints.length > 0
          ? stagesWithPoints.reduce((sum, s) => sum + (s.progress || 0), 0) /
            stagesWithPoints.length
          : 0

      return { ...module, stages: stagesWithPoints, progress: moduleProgress }
    })
  )

  const allProjectPoints = modulesWithHierarchy
    .flatMap((m) => m.stages)
    .flatMap((s) => s.points)
  const completedProjectPoints = allProjectPoints.filter(
    (p) => p.completed
  ).length
  const projectProgress =
    allProjectPoints.length > 0
      ? Math.round(
          (completedProjectPoints / allProjectPoints.length) * 100
        )
      : 0

  return { ...project, modules: modulesWithHierarchy, progress: projectProgress }
}

export async function createProject(data: any) {
  const result = await db
    .insert(projects)
    .values({
      name: data.name,
      description: data.description || '',
      status: data.status || 'planned',
      progress: 0,
      orderIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning()

  return result[0]
}

export async function updateProject(id: number, data: any) {
  const existing = await getProject(id)
  if (!existing) throw new Error('Project not found')

  const updated = { ...existing, ...data, updatedAt: new Date() }
  await db.update(projects).set(updated).where(eq(projects.id, id))

  if (data.status && data.status !== existing.status) {
    await db.insert(updateHistory).values({
      targetType: 'project',
      targetId: id,
      action: 'status_changed',
      oldValue: existing.status,
      newValue: data.status,
      createdAt: new Date(),
    })
  }

  return updated
}

export async function deleteProject(id: number) {
  const projectModules = await db
    .select()
    .from(modules)
    .where(eq(modules.projectId, id))

  for (const module of projectModules) {
    const moduleStages = await db
      .select()
      .from(stages)
      .where(eq(stages.moduleId, module.id))

    for (const stage of moduleStages) {
      await db.delete(points).where(eq(points.stageId, stage.id))
    }

    await db.delete(stages).where(eq(stages.moduleId, module.id))
  }

  await db.delete(modules).where(eq(modules.projectId, id))
  await db.delete(projects).where(eq(projects.id, id))
}
