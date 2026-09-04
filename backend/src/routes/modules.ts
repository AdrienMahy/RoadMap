import { Router } from 'express'
import * as modulesService from '../services/modules.service'

const router = Router()

// GET /api/modules/project/:projectId - Get all modules for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId)
    const modules = await modulesService.getModulesByProject(projectId)

    res.json({
      success: true,
      data: modules,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// GET /api/modules/:id - Get single module with hierarchy
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const module = await modulesService.getModuleWithHierarchy(id)

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
      })
    }

    res.json({
      success: true,
      data: module,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// POST /api/modules - Create module
router.post('/', async (req, res) => {
  try {
    const { projectId, name, description, status } = req.body

    if (!projectId || !name) {
      return res.status(400).json({
        success: false,
        error: 'projectId and name are required',
      })
    }

    const module = await modulesService.createModule(projectId, {
      name,
      description,
      status,
    })

    res.status(201).json({
      success: true,
      data: module,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// PUT /api/modules/:id - Update module
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const { name, description, status, orderIndex, icon, priority, projectId } = req.body

    const module = await modulesService.updateModule(id, {
      name,
      description,
      status,
      orderIndex,
      icon,
      priority,
      projectId,
    })

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
      })
    }

    res.json({
      success: true,
      data: module,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

// DELETE /api/modules/:id - Delete module
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const module = await modulesService.getModule(id)
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
      })
    }

    await modulesService.deleteModule(id)

    res.json({
      success: true,
      message: 'Module deleted successfully',
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router
