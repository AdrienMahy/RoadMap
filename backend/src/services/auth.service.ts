import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { createHash, randomBytes, pbkdf2Sync } from 'crypto'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'roadmap-secret-key-2026'
const JWT_EXPIRATION = '7d' // 7 days

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

    // Hash password
    const hashedPassword = hashPassword(payload.password)

    const role = payload.username === 'admin'
      ? 'Administrateur'
      : payload.role === 'Administrateur'
        ? 'Administrateur'
        : 'Board'

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        username: payload.username,
        password: hashedPassword,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role,
      })
      .returning({ id: users.id, username: users.username, email: users.email, firstName: users.firstName, lastName: users.lastName, role: users.role })

    const user = newUser[0]

    // Generate JWT with role
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

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

  async login(payload: LoginPayload): Promise<AuthResponse> {
    // Find user
    const userList = await db
      .select()
      .from(users)
      .where(eq(users.username, payload.username))
      .limit(1)

    if (userList.length === 0) {
      throw new Error('Invalid credentials')
    }

    const user = userList[0]

    let currentRole = user.role
    if (user.username === 'admin' && user.role !== 'Administrateur') {
      const [updatedUser] = await db
        .update(users)
        .set({ role: 'Administrateur' })
        .where(eq(users.id, user.id))
        .returning({ id: users.id, username: users.username, email: users.email, firstName: users.firstName, lastName: users.lastName, role: users.role })

      if (updatedUser) {
        currentRole = updatedUser.role
      }
    }

    // Check password
    const isPasswordValid = verifyPassword(payload.password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Generate JWT with role
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: currentRole,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

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
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users)
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
    if (data.password !== undefined) updateData.passwordHash = hashPassword(data.password)
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
        role: users.role 
      })

    if (updated.length === 0) {
      throw new Error('User not found')
    }

    return updated[0]
  }

  async deleteUser(userId: number) {
    const result = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning({ id: users.id, username: users.username })

    if (result.length === 0) {
      throw new Error('User not found')
    }

    return result[0]
  }
}

export const authService = new AuthService()
