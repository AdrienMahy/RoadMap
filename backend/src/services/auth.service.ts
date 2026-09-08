import { db } from '../db'
import { users, activationTokens } from '../db/schema'
import { eq } from 'drizzle-orm'
import { randomBytes, pbkdf2Sync } from 'crypto'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'roadmap-secret-key-2026'
const JWT_EXPIRATION = '7d' // 7 days
const ACTIVATION_TOKEN_EXPIRY_HOURS = 48 // Token valid for 48 hours

export interface RegisterPayload {
  username: string
  password: string
  email?: string
  firstName?: string
  lastName?: string
  role?: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface AuthResponse {
  id: number
  username: string
  email?: string
  firstName?: string
  lastName?: string
  role: string
  token: string
  expiresIn: string
}

export interface CreateUserPayload {
  username: string
  email?: string
  firstName?: string
  lastName?: string
  role?: string
}

export interface ActivateAccountPayload {
  token: string
  password: string
}

// Simple password hashing with PBKDF2
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password: string, hashed: string): boolean {
  const [salt, hash] = hashed.split(':')
  const computedHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
  return computedHash === hash
}

// Generate random activation token
function generateActivationToken(): string {
  return randomBytes(32).toString('hex')
}

export class AuthService {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, payload.username))
      .limit(1)

    if (existingUser.length > 0) {
      throw new Error('Username already exists')
    }

    const role =
      payload.username === 'admin'
        ? 'Administrateur'
        : payload.role === 'Administrateur'
          ? 'Administrateur'
          : 'Board'

    // Create user (activated by default for backwards compatibility)
    const newUser = await db
      .insert(users)
      .values({
        username: payload.username,
        password: hashPassword(payload.password),
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role,
        isActivated: true, // Directly activated for backwards compatibility
      })
      .returning({ id: users.id, username: users.username, email: users.email, firstName: users.firstName, lastName: users.lastName, role: users.role })

    if (newUser.length === 0) {
      throw new Error('Failed to create user')
    }

    const user = newUser[0]
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    })

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      token,
      expiresIn: JWT_EXPIRATION,
    }
  }

  // Create user with activation link (admin creates user)
  async createUserWithActivation(payload: CreateUserPayload): Promise<{ user: any; activationToken: string; activationLink: string }> {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, payload.username))
      .limit(1)

    if (existingUser.length > 0) {
      throw new Error('Username already exists')
    }

    const role =
      payload.username === 'admin'
        ? 'Administrateur'
        : payload.role === 'Administrateur'
          ? 'Administrateur'
          : 'Board'

    // Create user with temporary placeholder password (will be set during activation)
    const tempPassword = hashPassword(randomBytes(16).toString('hex'))

    const newUser = await db
      .insert(users)
      .values({
        username: payload.username,
        password: tempPassword,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role,
        isActivated: false, // Not activated yet
      })
      .returning({ id: users.id, username: users.username, email: users.email, firstName: users.firstName, lastName: users.lastName, role: users.role })

    if (newUser.length === 0) {
      throw new Error('Failed to create user')
    }

    const user = newUser[0]

    // Generate activation token
    const token = generateActivationToken()
    const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await db
      .insert(activationTokens)
      .values({
        userId: user.id,
        token,
        expiresAt,
      })

    // Generate activation link (frontend URL)
    const activationLink = `http://localhost:3100/activate?token=${token}`

    return {
      user,
      activationToken: token,
      activationLink,
    }
  }

  // Activate account with password
  async activateAccount(payload: ActivateAccountPayload): Promise<AuthResponse> {
    // Find activation token
    const tokenRecord = await db
      .select()
      .from(activationTokens)
      .where(eq(activationTokens.token, payload.token))
      .limit(1)

    if (tokenRecord.length === 0) {
      throw new Error('Invalid activation token')
    }

    const record = tokenRecord[0]

    // Check if token is expired
    if (new Date() > record.expiresAt) {
      throw new Error('Activation token has expired')
    }

    // Get user
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, record.userId))
      .limit(1)

    if (userData.length === 0) {
      throw new Error('User not found')
    }

    const user = userData[0]

    // Update user: set password and mark as activated
    const updatedUser = await db
      .update(users)
      .set({
        password: hashPassword(payload.password),
        isActivated: true,
      })
      .where(eq(users.id, user.id))
      .returning({ id: users.id, username: users.username, email: users.email, firstName: users.firstName, lastName: users.lastName, role: users.role })

    // Delete activation token
    await db
      .delete(activationTokens)
      .where(eq(activationTokens.token, payload.token))

    if (updatedUser.length === 0) {
      throw new Error('Failed to activate account')
    }

    const activatedUser = updatedUser[0]
    const token = jwt.sign({ id: activatedUser.id, username: activatedUser.username, role: activatedUser.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    })

    return {
      id: activatedUser.id,
      username: activatedUser.username,
      email: activatedUser.email,
      firstName: activatedUser.firstName,
      lastName: activatedUser.lastName,
      role: activatedUser.role,
      token,
      expiresIn: JWT_EXPIRATION,
    }
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    // Check if user exists
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.username, payload.username))
      .limit(1)

    if (userData.length === 0) {
      throw new Error('Invalid username or password')
    }

    const user = userData[0]

    // Check if user is activated
    if (!user.isActivated) {
      throw new Error('Account not activated. Please complete the activation process.')
    }

    // Verify password
    if (!verifyPassword(payload.password, user.password)) {
      throw new Error('Invalid username or password')
    }

    // Determine correct role
    let currentRole = user.role
    if (user.username === 'admin' && user.role !== 'Administrateur') {
      currentRole = 'Administrateur'
      await db.update(users).set({ role: 'Administrateur' }).where(eq(users.id, user.id))
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: currentRole }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    })

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: currentRole,
      token,
      expiresIn: JWT_EXPIRATION,
    }
  }

  async verifyToken(token: string): Promise<{ id: number; username: string; role: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string; role: string }
      return decoded
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }

  async getUser(id: number) {
    const userList = await db.select().from(users).where(eq(users.id, id)).limit(1)
    if (userList.length === 0) {
      throw new Error('User not found')
    }

    const user = userList[0]

    if (user.username === 'admin' && user.role !== 'Administrateur') {
      const [updatedUser] = await db
        .update(users)
        .set({ role: 'Administrateur' })
        .where(eq(users.id, user.id))
        .returning({ id: users.id, username: users.username, email: users.email, firstName: users.firstName, lastName: users.lastName, role: users.role })

      if (updatedUser) {
        return updatedUser
      }
    }

    return user
  }

  // User management methods
  async getAllUsers() {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isActivated: users.isActivated,
        createdAt: users.createdAt,
      })
      .from(users)
    return allUsers
  }

  async updateUserRole(userId: number, newRole: string) {
    if (!['Administrateur', 'Board'].includes(newRole)) {
      throw new Error('Invalid role. Must be either "Administrateur" or "Board"')
    }

    const updated = await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, userId))
      .returning({ id: users.id, username: users.username, email: users.email, role: users.role })

    if (updated.length === 0) {
      throw new Error('User not found')
    }

    return updated[0]
  }

  async updateUserProfile(userId: number, data: { firstName?: string; lastName?: string; email?: string; password?: string; role?: string }) {
    const updateData: any = {}

    if (data.firstName !== undefined) updateData.firstName = data.firstName
    if (data.lastName !== undefined) updateData.lastName = data.lastName
    if (data.email !== undefined) updateData.email = data.email
    if (data.password !== undefined) updateData.password = hashPassword(data.password)
    if (data.role !== undefined) {
      if (!['Administrateur', 'Board'].includes(data.role)) {
        throw new Error('Invalid role. Must be either "Administrateur" or "Board"')
      }
      updateData.role = data.role
    }

    const updated = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
      })

    if (updated.length === 0) {
      throw new Error('User not found')
    }

    return updated[0]
  }

  async deleteUser(userId: number) {
    // Also delete any pending activation tokens
    await db.delete(activationTokens).where(eq(activationTokens.userId, userId))

    const result = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id, username: users.username })

    if (result.length === 0) {
      throw new Error('User not found')
    }

    return result[0]
  }

  // Get user from activation token
  async getUserFromActivationToken(token: string): Promise<{ id: number; username: string; email?: string; firstName?: string; lastName?: string }> {
    // Find activation token
    const tokenRecord = await db
      .select()
      .from(activationTokens)
      .where(eq(activationTokens.token, token))
      .limit(1)

    if (tokenRecord.length === 0) {
      throw new Error('Invalid activation token')
    }

    const record = tokenRecord[0]

    // Check if token is expired
    if (new Date() > record.expiresAt) {
      throw new Error('Activation token has expired')
    }

    // Get user
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, record.userId))
      .limit(1)

    if (userData.length === 0) {
      throw new Error('User not found')
    }

    const user = userData[0]

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  // Regenerate activation token for a user
  async regenerateActivationToken(userId: number): Promise<{ activationToken: string; activationLink: string }> {
    // Get user
    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (userData.length === 0) {
      throw new Error('User not found')
    }

    const user = userData[0]

    // Delete old activation tokens
    await db
      .delete(activationTokens)
      .where(eq(activationTokens.userId, userId))

    // Generate new activation token
    const token = generateActivationToken()
    const expiresAt = new Date(Date.now() + ACTIVATION_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await db
      .insert(activationTokens)
      .values({
        userId: user.id,
        token,
        expiresAt,
      })

    // Generate activation link (frontend URL)
    const activationLink = `http://localhost:3100/activate?token=${token}`

    return {
      activationToken: token,
      activationLink,
    }
  }
}

export const authService = new AuthService()
