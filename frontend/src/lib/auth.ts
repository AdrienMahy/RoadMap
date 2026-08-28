const API_URL = import.meta.env.VITE_API_URL || '/api'

export interface AuthCredentials {
  username: string
  password: string
  email?: string
}

export interface AuthUser {
  id: number
  username: string
  email?: string
  role: string
}

export interface AuthResponse {
  id: number
  username: string
  email?: string
  role: string
  token: string
  expiresIn: string
}

export class AuthAPI {
  static async register(credentials: AuthCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    return response.json()
  }

  static async login(credentials: Omit<AuthCredentials, 'email'>): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    return response.json()
  }

  static async verify(token: string): Promise<AuthUser> {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      throw new Error('Token verification failed')
    }

    return response.json()
  }

  static getStoredToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  static saveToken(token: string): void {
    localStorage.setItem('auth_token', token)
  }

  static clearToken(): void {
    localStorage.removeItem('auth_token')
  }
}
