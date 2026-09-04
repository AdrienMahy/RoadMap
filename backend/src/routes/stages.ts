import { Router } from 'express'
import * as stagesService from '../services/stages.service'

const router = Router()

/**
 * GET /api/stages/module/:moduleId
 * Get all stages for a module
 */
router.get('/module/:moduleId', async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId)
    const data = await stagesService.getStagesByModule(moduleId)

    const response: ApiResponse<any> = {
      data,
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'GET_STAGES_FAILED',
      message: error instanceof Error ? error.message : 'Failed to fetch stages',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * GET /api/stages/:id
 * Get single stage with progress
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const stageId = parseInt(req.params.id, 10)
    const stage = await stagesService.getStageWithPoints(stageId)

    if (!stage) {
      const apiError: ApiError = {
        error: 'STAGE_NOT_FOUND',
        message: 'Stage not found',
        timestamp: new Date().toISOString(),
      }
      return res.status(404).json(apiError)
    }

    const response: ApiResponse<any> = {
      data: stage,
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'GET_STAGE_FAILED',
      message: error instanceof Error ? error.message : 'Failed to fetch stage',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * POST /api/stages
 * Create new stage
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { moduleId, name, description, deliveryDate, status, icon, priority } = req.body

    if (!moduleId || !name) {
      const apiError: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'moduleId and name are required',
        timestamp: new Date().toISOString(),
      }
      return res.status(400).json(apiError)
    }

    const data = await stagesService.createStage(moduleId, {
      name,
      description,
      deliveryDate,
      status,
      icon,
      priority,
    })
    const response: ApiResponse<any> = {
      data,
      message: 'Stage created successfully',
      timestamp: new Date().toISOString(),
    }
    res.status(201).json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'CREATE_STAGE_FAILED',
      message: error instanceof Error ? error.message : 'Failed to create stage',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * PUT /api/stages/:id
 * Update stage
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const stageId = parseInt(req.params.id, 10)
    const body = req.body

    const data = await stagesService.updateStage(stageId, body, req.body.author || 'api')

    if (!data) {
      const apiError: ApiError = {
        error: 'STAGE_NOT_FOUND',
        message: 'Stage not found',
        timestamp: new Date().toISOString(),
      }
      return res.status(404).json(apiError)
    }

    const response: ApiResponse<any> = {
      data,
      message: 'Stage updated successfully',
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'UPDATE_STAGE_FAILED',
      message: error instanceof Error ? error.message : 'Failed to update stage',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * DELETE /api/stages/:id
 * Delete stage (cascades points)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const stageId = parseInt(req.params.id, 10)
    const author = req.body.author || 'api'

    const existing = await stagesService.getStage(stageId)
    if (!existing) {
      const apiError: ApiError = {
        error: 'STAGE_NOT_FOUND',
        message: 'Stage not found',
        timestamp: new Date().toISOString(),
      }
      return res.status(404).json(apiError)
    }

    await stagesService.deleteStage(stageId, author)

    const response: ApiResponse<any> = {
      data: { id: stageId },
      message: 'Stage deleted successfully',
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'DELETE_STAGE_FAILED',
      message: error instanceof Error ? error.message : 'Failed to delete stage',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

export default router
