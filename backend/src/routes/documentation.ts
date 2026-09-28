import { Router, Response } from 'express'
import { asc, eq, isNull } from 'drizzle-orm'
import { db } from '@/db'
import { documentationDocuments, projects } from '@/db/schema'
import authMiddleware, { AuthenticatedRequest } from '@/middleware/authMiddleware'

const router = Router()

router.use(authMiddleware)

function isAdmin(req: AuthenticatedRequest) {
  return req.user?.role === 'Administrateur' || req.user?.role === 'Admin'
}

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.query.projectId ? Number(req.query.projectId) : undefined
    const documents = await db
      .select()
      .from(documentationDocuments)
      .where(projectId ? eq(documentationDocuments.projectId, projectId) : isNull(documentationDocuments.projectId))
      .orderBy(asc(documentationDocuments.orderIndex), asc(documentationDocuments.title))

    res.json({ data: documents })
  } catch (error) {
    res.status(500).json({ error: 'GET_DOCUMENTATION_FAILED', message: error instanceof Error ? error.message : 'Failed to fetch documentation' })
  }
})

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' })

  try {
    const { projectId, title, fileName, contentMarkdown, orderIndex = 0 } = req.body
    if (!title?.trim() || !fileName?.toLowerCase().endsWith('.md') || typeof contentMarkdown !== 'string') {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'A title, Markdown file name and content are required' })
    }

    if (projectId !== null && projectId !== undefined) {
      const project = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, Number(projectId))).limit(1)
      if (project.length === 0) return res.status(404).json({ error: 'PROJECT_NOT_FOUND', message: 'Project not found' })
    }

    const [document] = await db.insert(documentationDocuments).values({
      projectId: projectId === null || projectId === undefined ? null : Number(projectId),
      title: title.trim(),
      fileName,
      contentMarkdown,
      orderIndex: Number(orderIndex) || 0,
    }).returning()

    res.status(201).json({ data: document })
  } catch (error) {
    res.status(500).json({ error: 'CREATE_DOCUMENTATION_FAILED', message: error instanceof Error ? error.message : 'Failed to create documentation' })
  }
})

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' })

  try {
    const id = Number(req.params.id)
    const { title, fileName, contentMarkdown, orderIndex } = req.body
    const [document] = await db.update(documentationDocuments).set({
      ...(title !== undefined ? { title: String(title).trim() } : {}),
      ...(fileName !== undefined ? { fileName } : {}),
      ...(contentMarkdown !== undefined ? { contentMarkdown } : {}),
      ...(orderIndex !== undefined ? { orderIndex: Number(orderIndex) || 0 } : {}),
      updatedAt: new Date(),
    }).where(eq(documentationDocuments.id, id)).returning()

    if (!document) return res.status(404).json({ error: 'DOCUMENTATION_NOT_FOUND', message: 'Documentation not found' })
    res.json({ data: document })
  } catch (error) {
    res.status(500).json({ error: 'UPDATE_DOCUMENTATION_FAILED', message: error instanceof Error ? error.message : 'Failed to update documentation' })
  }
})

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' })

  try {
    const id = Number(req.params.id)
    const [document] = await db.delete(documentationDocuments).where(eq(documentationDocuments.id, id)).returning({ id: documentationDocuments.id })
    if (!document) return res.status(404).json({ error: 'DOCUMENTATION_NOT_FOUND', message: 'Documentation not found' })
    res.json({ data: document })
  } catch (error) {
    res.status(500).json({ error: 'DELETE_DOCUMENTATION_FAILED', message: error instanceof Error ? error.message : 'Failed to delete documentation' })
  }
})

export default router