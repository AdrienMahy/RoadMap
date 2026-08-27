import { Router, Request, Response } from 'express'
import * as pointsService from '@/services/points.service'
import { ApiResponse, ApiError } from '@/types'

const router = Router()

/**
 * GET /api/points/:stageId
 * Get all points for a stage
 */
router.get('/stage/:stageId', async (req: Request, res: Response) => {
  try {
    const stageId = parseInt(req.params.stageId, 10)
    const data = await pointsService.getPointsByStage(stageId)

    const response: ApiResponse<any> = {
      data,
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'GET_POINTS_FAILED',
      message: error instanceof Error ? error.message : 'Failed to fetch points',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * GET /api/points/:id
 * Get single point
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const pointId = parseInt(req.params.id, 10)
    const data = await pointsService.getPointById(pointId)

    if (!data) {
      const apiError: ApiError = {
        error: 'POINT_NOT_FOUND',
        message: 'Point not found',
        timestamp: new Date().toISOString(),
      }
      return res.status(404).json(apiError)
    }

    const response: ApiResponse<any> = {
      data,
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'GET_POINT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to fetch point',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * POST /api/points
 * Create new point
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { stageId, name, description } = req.body

    if (!stageId || !name) {
      const apiError: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'stageId and name are required',
        timestamp: new Date().toISOString(),
      }
      return res.status(400).json(apiError)
    }

    const data = await pointsService.createPoint(stageId, { name, description }, req.body.author || 'api')
    const response: ApiResponse<any> = {
      data,
      message: 'Point created successfully',
      timestamp: new Date().toISOString(),
    }
    res.status(201).json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'CREATE_POINT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to create point',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * PUT /api/points/:id
 * Update point (toggle completion)
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const pointId = parseInt(req.params.id, 10)
    const body = req.body

    const data = await pointsService.updatePoint(pointId, body, req.body.author || 'api')

    if (!data) {
      const apiError: ApiError = {
        error: 'POINT_NOT_FOUND',
        message: 'Point not found',
        timestamp: new Date().toISOString(),
      }
      return res.status(404).json(apiError)
    }

    const response: ApiResponse<any> = {
      data,
      message: 'Point updated successfully',
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'UPDATE_POINT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to update point',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * DELETE /api/points/:id
 * Delete point
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const pointId = parseInt(req.params.id, 10)
    const author = req.body.author || 'api'

    const existing = await pointsService.getPointById(pointId)
    if (!existing) {
      const apiError: ApiError = {
        error: 'POINT_NOT_FOUND',
        message: 'Point not found',
        timestamp: new Date().toISOString(),
      }
      return res.status(404).json(apiError)
    }

    await pointsService.deletePoint(pointId, author)

    const response: ApiResponse<any> = {
      data: { id: pointId },
      message: 'Point deleted successfully',
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'DELETE_POINT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to delete point',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

export default router
