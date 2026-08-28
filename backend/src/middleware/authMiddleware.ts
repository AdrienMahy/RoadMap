import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number
    username: string
    role: string
  }
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7)
    const secret = process.env.JWT_SECRET || 'roadmap-secret-key-2026'
    const decoded = jwt.verify(token, secret) as any

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export default authMiddleware
