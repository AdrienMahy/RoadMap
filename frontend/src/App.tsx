import React, { useState } from 'react'
import { Lock, LogOut } from 'lucide-react'
import { Button } from './components/Button'
import { Input } from './components/Input'
import { NotificationBell } from './components/NotificationBell'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import BoardPage from './pages/BoardPage'
import DevPage from './pages/DevPage'
import AuthPage from './pages/AuthPage'

function AppContent() {
  const { user, logout, isAdmin } = useAuth()
  const [isDev, setIsDev] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')

  const handleAccessDev = (code: string) => {
    // Only allow dev access if user is admin
    if (!isAdmin) {
      setError('Vous n\'avez pas les permissions pour accéder au panneau admin')
      return
    }

    const devCode = import.meta.env.VITE_DEV_ACCESS_CODE || 'roadmap2026'
    if (code === devCode) {
      setIsDev(true)
      setError('')
      setAccessCode('')
    } else {
      setError('Invalid access code')
    }
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />
  }

  // Dev mode
  if (isDev) {
    return (
      <>
        <header className="border-b border-dark-800 sticky top-0 z-40 bg-dark-950/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Roadmap Admin</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-dark-400">Logged in as {user.firstName || user.username}</span>
              <NotificationBell />
              <Button variant="secondary" size="sm" onClick={() => setIsDev(false)}>
                Back to Board
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-12">
          <DevPage />
        </main>
      </>
    )
  }

  // Admin access prompt
  if (accessCode === '' && !isDev) {
    return (
      <>
        <header className="border-b border-dark-800 sticky top-0 z-40 bg-dark-950/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 flex-shrink-0"
                style={{ aspectRatio: '624/1056' }}
              />
              <h1 className="text-2xl font-bold">Data & IT Roadmap</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-dark-400">Hello, {user.firstName || user.username}</span>
              <NotificationBell />
              {isAdmin && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDev(true)}
                  className="flex items-center gap-2"
                >
                  <Lock size={16} />
                  Admin
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-12">
          <BoardPage />
        </main>
      </>
    )
  }

  // Admin access form
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="bg-dark-900 border border-dark-700 rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Admin Access</h2>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Access code"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAccessDev(accessCode)
            }}
          />
          <Button onClick={() => handleAccessDev(accessCode)} className="w-full">
            Authenticate
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <Button
          variant="ghost"
          className="w-full mt-4"
          onClick={() => {
            setAccessCode('')
            setError('')
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <AppContent />
      </NotificationsProvider>
    </AuthProvider>
  )
}
