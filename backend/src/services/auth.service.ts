import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { createHash, randomBytes, pbkdf2Sync } from 'crypto'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'roadmap-secret-key-2026'
const JWT_EXPIRATION = '30m' // 30 minutes

export interface RegisterPayload {
  username: string
  password: string
  email?: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface AuthResponse {
  id: number
  username: string
  email?: string
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

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        username: payload.username,
        password: hashedPassword,
        email: payload.email,
      })
      .returning({ id: users.id, username: users.username, email: users.email })

    const user = newUser[0]

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

    return {
      id: user.id,
      username: user.username,
      email: user.email,
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

    // Check password
    const isPasswordValid = verifyPassword(payload.password, user.password)
    if (!isPasswordValid) {
      throw new Error('Invalid credentials')
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    )

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      token,
      expiresIn: JWT_EXPIRATION,
    }
  }

  async verifyToken(token: string): Promise<{ id: number; username: string }> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; username: string }
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
    return userList[0]
  }
}

export const authService = new AuthService()
