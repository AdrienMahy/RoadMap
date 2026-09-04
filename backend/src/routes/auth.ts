import { Router } from 'express'
import { authService } from '../services/auth.service'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, firstName, lastName, role } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const result = await authService.register({
      username,
      password,
      email,
      firstName,
      lastName,
      role,
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
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token verification failed'
    res.status(401).json({ error: message })
  }
})

// GET /api/auth/users - List all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const allUsers = await authService.getAllUsers()
    res.json(allUsers)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users'
    res.status(500).json({ error: message })
  }
})

// PUT /api/auth/users/:id/role - Update user role (admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const { role } = req.body

    if (!role) {
      return res.status(400).json({ error: 'Role is required' })
    }

    const updatedUser = await authService.updateUserRole(userId, role)
    res.json(updatedUser)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user role'
    res.status(400).json({ error: message })
  }
})

// PUT /api/auth/users/:id - Update user profile (admin only)
router.put('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const { firstName, lastName, email, password, role } = req.body

    const updatedUser = await authService.updateUserProfile(userId, {
      firstName,
      lastName,
      email,
      password,
      role,
    })
    res.json(updatedUser)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user profile'
    res.status(400).json({ error: message })
  }
})

// DELETE /api/auth/users/:id - Delete user (admin only)
router.delete('/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const deletedUser = await authService.deleteUser(userId)
    res.json({ message: `User ${deletedUser.username} deleted successfully`, user: deletedUser })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete user'
    res.status(400).json({ error: message })
  }
})

export default router
