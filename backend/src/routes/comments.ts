import { Router } from 'express'
import { commentsService } from '../services/comments.service'
import { authService } from '../services/auth.service'

const router = Router()

// Middleware to verify token
const verifyAuth = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const user = await authService.verifyToken(token)
    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// GET /api/comments?targetType=project&targetId=1
router.get('/', async (req, res) => {
  try {
    const { targetType, targetId } = req.query

    if (!targetType || !targetId) {
      return res.status(400).json({ error: 'targetType and targetId are required' })
    }

    const result = await commentsService.getComments(
      targetType as string,
      parseInt(targetId as string)
    )

    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch comments'
    res.status(500).json({ error: message })
  }
})

// POST /api/comments
router.post('/', verifyAuth, async (req: any, res: any) => {
  try {
    const { targetType, targetId, projectId, content } = req.body

    if (!targetType || !targetId || !projectId || !content) {
      return res.status(400).json({ error: 'Missing required fields: targetType, targetId, projectId, content' })
    }

    const result = await commentsService.createComment({
      targetType,
      targetId,
      projectId,
      userId: req.user.id,
      content,
    })

    res.status(201).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create comment'
    res.status(500).json({ error: message })
  }
})

// PUT /api/comments/:id
router.put('/:id', verifyAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    const result = await commentsService.updateComment(parseInt(id), {
      content,
    })

    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update comment'
    res.status(500).json({ error: message })
  }
})

// DELETE /api/comments/:id
router.delete('/:id', verifyAuth, async (req: any, res: any) => {
  try {
    const { id } = req.params

    await commentsService.deleteComment(parseInt(id))

    res.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete comment'
    res.status(500).json({ error: message })
  }
})

export default router
