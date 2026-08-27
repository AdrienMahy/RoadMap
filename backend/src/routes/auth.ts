import { Router } from 'express'
import { authService } from '../services/auth.service'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const result = await authService.register({
      username,
      password,
      email,
    })

    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    res.status(400).json({ error: message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const result = await authService.login({
      username,
      password,
    })

    res.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed'
    res.status(401).json({ error: message })
  }
})

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    const decoded = await authService.verifyToken(token)
    const user = await authService.getUser(decoded.id)

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed'
    res.status(401).json({ error: message })
  }
})

export default router
