import { Router, Request, Response } from 'express'
import * as projectsService from '@/services/projects.service'
import { ApiResponse, ApiError, CreateProjectRequest, UpdateProjectRequest } from '@/types'

const router = Router()

/**
 * GET /api/projects
 * Get all projects
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const data = await projectsService.getProjects()
    const response: ApiResponse<any> = {
      data,
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'GET_PROJECTS_FAILED',
      message: error instanceof Error ? error.message : 'Failed to fetch projects',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * GET /api/projects/:id
 * Get project with all stages and points
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id, 10)
    const data = await projectsService.getProjectWithHierarchy(projectId)

    if (!data) {
      const apiError: ApiError = {
        error: 'PROJECT_NOT_FOUND',
        message: 'Project not found',
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
      error: 'GET_PROJECT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to fetch project',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * POST /api/projects
 * Create new project
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const body: CreateProjectRequest = req.body

    if (!body.name) {
      const apiError: ApiError = {
        error: 'VALIDATION_ERROR',
        message: 'Project name is required',
        timestamp: new Date().toISOString(),
      }
      return res.status(400).json(apiError)
    }

    const data = await projectsService.createProject(body, req.body.author || 'api')
    const response: ApiResponse<any> = {
      data,
      message: 'Project created successfully',
      timestamp: new Date().toISOString(),
    }
    res.status(201).json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'CREATE_PROJECT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to create project',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id, 10)
    const body: UpdateProjectRequest = req.body

    const data = await projectsService.updateProject(projectId, body, req.body.author || 'api')

    if (!data) {
      const apiError: ApiError = {
        error: 'PROJECT_NOT_FOUND',
        message: 'Project not found',
        timestamp: new Date().toISOString(),
      }
      return res.status(404).json(apiError)
    }

    const response: ApiResponse<any> = {
      data,
      message: 'Project updated successfully',
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'UPDATE_PROJECT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to update project',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.id, 10)
    const author = req.body.author || 'api'

    const existing = await projectsService.getProjectById(projectId)
    if (!existing) {
      const apiError: ApiError = {
        error: 'PROJECT_NOT_FOUND',
        message: 'Project not found',
        timestamp: new Date().toISOString(),
      }
      return res.status(404).json(apiError)
    }

    await projectsService.deleteProject(projectId, author)

    const response: ApiResponse<any> = {
      data: { id: projectId },
      message: 'Project deleted successfully',
      timestamp: new Date().toISOString(),
    }
    res.json(response)
  } catch (error) {
    const apiError: ApiError = {
      error: 'DELETE_PROJECT_FAILED',
      message: error instanceof Error ? error.message : 'Failed to delete project',
      timestamp: new Date().toISOString(),
    }
    res.status(500).json(apiError)
  }
})

export default router
