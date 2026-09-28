import React, { useState, useEffect } from 'react'
import { Lock, LogOut } from 'lucide-react'
import { Button } from './components/Button'
import { Input } from './components/Input'
import { NotificationBell } from './components/NotificationBell'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { NotificationsProvider } from './contexts/NotificationsContext'
import BoardPage from './pages/BoardPage'
import DevPage from './pages/DevPage'
import AuthPage from './pages/AuthPage'
import ActivationPage from './pages/ActivationPage'
import DocumentationPage from './pages/DocumentationPage'
import SprintPage from './pages/SprintPage'

function AppContent() {
  const { user, logout, isAdmin } = useAuth()
  const [isDev, setIsDev] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [isActivationPage, setIsActivationPage] = useState(false)
  const [activePage, setActivePage] = useState<'roadmap' | 'sprint' | 'documentation'>('roadmap')

  // Check if this is the activation page
  useEffect(() => {
    const path = window.location.pathname
    const search = window.location.search
    setIsActivationPage(path === '/activate' || path.includes('activate'))
  }, [])

  // Show activation page if accessing /activate route
  if (isActivationPage) {
    return <ActivationPage />
  }

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
      setError('Code d’accès invalide')
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
        <header className="sticky top-0 z-40 border-b border-dark-700/70 bg-dark-950/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Administration Roadmap</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-dark-400">Connecté en tant que {user.firstName || user.username}</span>
              <NotificationBell />
              <Button variant="secondary" size="sm" onClick={() => setIsDev(false)}>
                Retour au Board
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
        <header className="sticky top-0 z-40 border-b border-dark-700/70 bg-dark-950/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-12 flex-shrink-0"
                style={{ aspectRatio: '624/1056' }}
              />
              <h1 className="text-2xl font-bold">Data & IT</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-dark-400">Bonjour, {user.firstName || user.username}</span>
              <NotificationBell />
              {isAdmin && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDev(true)}
                  className="flex items-center gap-2"
                >
                  <Lock size={16} />
                  Administration
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1280px] px-4 pb-8 pt-8 sm:px-6">
          <section className="relative overflow-hidden rounded-md border border-dark-700/80 bg-dark-900/70 pt-12 shadow-2xl shadow-black/30">
            <nav className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-px overflow-hidden rounded-xl border border-dark-600 bg-dark-800 shadow-lg" aria-label="Board sections">
              <Button
                variant={activePage === 'roadmap' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActivePage('roadmap')}
                className="rounded-none border-r border-dark-600 px-5 py-2.5 text-xs uppercase tracking-wide sm:px-7"
              >
                Roadmap
              </Button>
              <Button
                variant={activePage === 'sprint' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActivePage('sprint')}
                className="rounded-none border-r border-dark-600 px-5 py-2.5 text-xs uppercase tracking-wide sm:px-7"
              >
                Sprint
              </Button>
              <Button
                variant={activePage === 'documentation' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActivePage('documentation')}
                className="rounded-none px-5 py-2.5 text-xs uppercase tracking-wide sm:px-7"
              >
                Docu
              </Button>
            </nav>
            <div className="min-h-[calc(100vh-180px)]">
              {activePage === 'roadmap' ? <BoardPage /> : activePage === 'sprint' ? <SprintPage /> : <DocumentationPage />}
            </div>
          </section>
        </main>
      </>
    )
  }

  // Admin access form
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950">
      <div className="bg-dark-900 border border-dark-700 rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Accès administration</h2>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Code d’accès"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAccessDev(accessCode)
            }}
          />
          <Button onClick={() => handleAccessDev(accessCode)} className="w-full">
            S’authentifier
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
          Annuler
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
