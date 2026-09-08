import { useState, useEffect } from 'react'
import { AlertCircle, Check, Loader } from 'lucide-react'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { api, getActivationInfo } from '../lib/api'

export default function ActivationPage() {
  // Get token from URL query string
  const urlParams = new URLSearchParams(window.location.search)
  const token = urlParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loadingUserInfo, setLoadingUserInfo] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('Invalid activation link - no token provided')
      setLoadingUserInfo(false)
      return
    }

    // Fetch user info from token
    async function fetchUserInfo() {
      try {
        const result = await getActivationInfo(token)
        setUserInfo(result.user)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load user info'
        setError(message)
      } finally {
        setLoadingUserInfo(false)
      }
    }

    fetchUserInfo()
  }, [token])

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Validation
    if (!password) {
      setError('Password is required')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await api.post('/auth/activate', {
        token,
        password,
      })

      console.log('Activation response:', response.data)
      setSuccess(true)

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to activate account'
      console.error('Activation error:', err)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-dark-900 border border-dark-700 rounded-lg p-8 space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-16 flex-shrink-0"
              style={{ aspectRatio: '624/1056' }}
            />
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Data & IT Roadmap</h1>
            {loadingUserInfo ? (
              <p className="text-dark-400">Loading...</p>
            ) : userInfo ? (
              <p className="text-dark-300">
                Welcome, <span className="font-semibold text-white">{userInfo.username}</span>!
              </p>
            ) : (
              <p className="text-dark-400">Complete your account setup</p>
            )}
            <p className="text-dark-400 text-sm mt-2">Set your password to activate your account</p>
          </div>
          {/* Success State */}
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Check size={48} className="text-green-500" />
              </div>
              <p className="text-lg font-semibold text-green-400">
                Account Activated Successfully!
              </p>
              <p className="text-dark-400">
                Redirecting to login page...
              </p>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {error && (
                <div className="flex gap-3 p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-400">Error</p>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Activation Form */}
              {!token ? (
                <div className="text-center text-dark-400">
                  <p>Invalid activation link. Please contact your administrator.</p>
                </div>
              ) : loadingUserInfo ? (
                <div className="text-center flex items-center justify-center gap-2 py-4">
                  <Loader size={20} className="animate-spin text-dark-400" />
                  <p className="text-dark-400">Loading...</p>
                </div>
              ) : (
                <form onSubmit={handleActivate} className="space-y-4">
                  <Input
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter a strong password (min. 8 characters)"
                    disabled={loading}
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    disabled={loading}
                  />

                  <Button
                    type="submit"
                    disabled={loading || !password || !confirmPassword}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader size={16} className="mr-2 animate-spin" />
                        Activating...
                      </>
                    ) : (
                      'Activate Account'
                    )}
                  </Button>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-sm mt-6">
          Having trouble? Contact your administrator
        </p>
      </div>
    </div>
  )
}
