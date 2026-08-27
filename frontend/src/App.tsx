import React, { useState } from 'react'
import { Lock } from 'lucide-react'
import { Button } from './components/Button'
import { Input } from './components/Input'
import BoardPage from './pages/BoardPage'
import DevPage from './pages/DevPage'

export default function App() {
  const [isDev, setIsDev] = useState(false)
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')

  const handleAccessDev = (code: string) => {
    const devCode = import.meta.env.VITE_DEV_ACCESS_CODE || 'roadmap2026'
    if (code === devCode) {
      setIsDev(true)
      setError('')
      setAccessCode('')
    } else {
      setError('Invalid access code')
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50">
      {!isDev ? (
        <>
          <header className="border-b border-dark-800 sticky top-0 z-40 bg-dark-950/95 backdrop-blur">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="h-12 flex-shrink-0" style={{ aspectRatio: '624/1056' }} />
                <h1 className="text-2xl font-bold">Data & IT Roadmap</h1>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDev(true)}
                className="flex items-center gap-2"
              >
                <Lock size={16} />
                Admin
              </Button>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-6 py-12">
            <BoardPage />
          </main>
        </>
      ) : !accessCode || error ? (
        <div className="min-h-screen flex items-center justify-center">
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
                setIsDev(false)
                setAccessCode('')
                setError('')
              }}
            >
              Back to Board
            </Button>
          </div>
        </div>
      ) : (
        <>
          <header className="border-b border-dark-800 sticky top-0 z-40 bg-dark-950/95 backdrop-blur">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">Roadmap Admin</h1>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDev(false)}
              >
                Back to Board
              </Button>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-6 py-12">
            <DevPage />
          </main>
        </>
      )}
    </div>
  )
}
