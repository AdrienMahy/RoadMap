import { Router, Response } from 'express'
import authMiddleware, { AuthenticatedRequest } from '@/middleware/authMiddleware'
import * as sprintsService from '@/services/sprints.service'

const router = Router()
router.use(authMiddleware)

function isAdmin(req: AuthenticatedRequest) {
  return req.user?.role === 'Administrateur' || req.user?.role === 'Admin'
}

router.get('/', async (_req, res) => {
  try {
    res.json({ data: await sprintsService.getSprints() })
  } catch (error) {
    res.status(500).json({ error: 'GET_SPRINTS_FAILED', message: error instanceof Error ? error.message : 'Failed to fetch sprints' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const sprint = await sprintsService.getSprint(Number(req.params.id))
    if (!sprint) return res.status(404).json({ error: 'SPRINT_NOT_FOUND', message: 'Sprint not found' })
    res.json({ data: sprint })
  } catch (error) {
    res.status(500).json({ error: 'GET_SPRINT_FAILED', message: error instanceof Error ? error.message : 'Failed to fetch sprint' })
  }
})

router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' })
  try {
    const { name, goal, startDate, endDate } = req.body
    if (!name?.trim() || !startDate || !endDate) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'name, startDate and endDate are required' })
    res.status(201).json({ data: await sprintsService.createSprint({ name, goal, startDate, endDate }) })
  } catch (error) {
    res.status(400).json({ error: 'CREATE_SPRINT_FAILED', message: error instanceof Error ? error.message : 'Failed to create sprint' })
  }
})

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' })
  try {
    const sprint = await sprintsService.updateSprint(Number(req.params.id), req.body)
    if (!sprint) return res.status(404).json({ error: 'SPRINT_NOT_FOUND', message: 'Sprint not found' })
    res.json({ data: sprint })
  } catch (error) {
    res.status(400).json({ error: 'UPDATE_SPRINT_FAILED', message: error instanceof Error ? error.message : 'Failed to update sprint' })
  }
})

router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' })
  try {
    const sprint = await sprintsService.getSprint(Number(req.params.id))
    if (!sprint) return res.status(404).json({ error: 'SPRINT_NOT_FOUND', message: 'Sprint not found' })
    await sprintsService.deleteSprint(sprint.id)
    res.json({ data: { id: sprint.id } })
  } catch (error) {
    res.status(500).json({ error: 'DELETE_SPRINT_FAILED', message: error instanceof Error ? error.message : 'Failed to delete sprint' })
  }
})

router.post('/:id/items', async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' })
  try {
    res.status(201).json({ data: await sprintsService.addSprintItem(Number(req.params.id), req.body) })
  } catch (error) {
    res.status(400).json({ error: 'ADD_SPRINT_ITEM_FAILED', message: error instanceof Error ? error.message : 'Failed to add sprint item' })
  }
})

router.delete('/:id/items/:itemId', async (req: AuthenticatedRequest, res: Response) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' })
  try {
    const deleted = await sprintsService.removeSprintItem(Number(req.params.id), Number(req.params.itemId))
    if (!deleted) return res.status(404).json({ error: 'SPRINT_ITEM_NOT_FOUND', message: 'Sprint item not found' })
    res.json({ data: { id: Number(req.params.itemId) } })
  } catch (error) {
    res.status(500).json({ error: 'REMOVE_SPRINT_ITEM_FAILED', message: error instanceof Error ? error.message : 'Failed to remove sprint item' })
  }
})

export default router
