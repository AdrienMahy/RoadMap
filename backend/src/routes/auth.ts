import { Router } from 'express'
import { authService } from '../services/auth.service'

const router = Router()

// POST /api/auth/register - Direct registration (backwards compatibility)
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

// POST /api/auth/create-user - Create user with activation link (admin only)
router.post('/create-user', async (req, res) => {
  try {
    const { username, email, firstName, lastName, role } = req.body

    if (!username) {
      return res.status(400).json({ error: 'Username is required' })
    }

    console.log('[POST /api/auth/create-user] Creating user with activation:', {
      username,
      email,
      firstName,
      lastName,
      role,
    })

    const result = await authService.createUserWithActivation({
      username,
      email,
      firstName,
      lastName,
      role,
    })

    console.log('[POST /api/auth/create-user] User created successfully')
    console.log('[POST /api/auth/create-user] Activation link:', result.activationLink)

    res.status(201).json({
      success: true,
      user: result.user,
      activationToken: result.activationToken,
      activationLink: result.activationLink,
      message: `User created successfully. Send activation link to ${result.user.email}`,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'User creation failed'
    console.error('[POST /api/auth/create-user] Error:', error)
    res.status(400).json({ error: message })
  }
})

// POST /api/auth/activate - Activate account with password
router.post('/activate', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' })
    }

    console.log('[POST /api/auth/activate] Activating account')

    const result = await authService.activateAccount({
      token,
      password,
    })

    console.log('[POST /api/auth/activate] Account activated successfully')

    res.json({
      success: true,
      ...result,
      message: 'Account activated successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Activation failed'
    console.error('[POST /api/auth/activate] Error:', error)
    res.status(400).json({ error: message })
  }
})

// GET /api/auth/activation-info - Get user info from activation token
router.get('/activation-info', async (req, res) => {
  try {
    const { token } = req.query

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' })
    }

    console.log('[GET /api/auth/activation-info] Getting user info from activation token')

    const userInfo = await authService.getUserFromActivationToken(token)

    console.log('[GET /api/auth/activation-info] User info retrieved successfully')

    res.json({
      success: true,
      user: userInfo,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get user info'
    console.error('[GET /api/auth/activation-info] Error:', error)
    res.status(400).json({ error: message })
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

// POST /api/auth/users/:id/regenerate-activation - Regenerate activation token
router.post('/users/:id/regenerate-activation', async (req, res) => {
  try {
    const userId = parseInt(req.params.id)

    console.log('[POST /api/auth/users/:id/regenerate-activation] Regenerating activation token for user:', userId)

    const result = await authService.regenerateActivationToken(userId)

    console.log('[POST /api/auth/users/:id/regenerate-activation] Token regenerated successfully')
    console.log('[POST /api/auth/users/:id/regenerate-activation] Activation link:', result.activationLink)

    res.json({
      success: true,
      activationToken: result.activationToken,
      activationLink: result.activationLink,
      message: 'Activation token regenerated successfully',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to regenerate activation token'
    console.error('[POST /api/auth/users/:id/regenerate-activation] Error:', error)
    res.status(400).json({ error: message })
  }
})

export default router
