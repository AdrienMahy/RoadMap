import React, { createContext, useContext, useState, useEffect } from 'react'
import { AuthAPI, AuthUser, AuthCredentials } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (credentials: AuthCredentials) => Promise<void>
  logout: () => void
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = AuthAPI.getStoredToken()
      if (token) {
        try {
          const userData = await AuthAPI.verify(token)
          setUser(userData)
        } catch (error) {
          // Token invalid, clear it
          AuthAPI.clearToken()
          setUser(null)
        }
      }
      setIsLoading(false)
    }

    verifyToken()
  }, [])

  const login = async (username: string, password: string) => {
    const response = await AuthAPI.login({ username, password })
    AuthAPI.saveToken(response.token)
    setUser({
      id: response.id,
      username: response.username,
      email: response.email,
    })
  }

  const register = async (credentials: AuthCredentials) => {
    const response = await AuthAPI.register(credentials)
    AuthAPI.saveToken(response.token)
    setUser({
      id: response.id,
      username: response.username,
      email: response.email,
    })
  }

  const logout = () => {
    AuthAPI.clearToken()
    setUser(null)
  }

  const getToken = () => AuthAPI.getStoredToken()

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
