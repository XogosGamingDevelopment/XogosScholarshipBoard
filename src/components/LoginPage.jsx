import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { handleGoogleCallback } from '../utils/api'

function LoginPage({ onLogin, isCallback = false }) {
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Handle OAuth callback
    if (isCallback) {
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Google authentication was cancelled or failed.')
        return
      }

      if (code) {
        handleCallback(code)
      }
    }
  }, [isCallback, searchParams])

  const handleCallback = async (code) => {
    setIsLoading(true)
    setError('')

    try {
      const redirectUri = `${window.location.origin}/callback`
      const response = await handleGoogleCallback(code, redirectUri)

      if (response.success) {
        onLogin(response.token, response.board_member)
      } else {
        setError(response.message || 'Authentication failed')
      }
    } catch (err) {
      console.error('Callback error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Authentication failed. Please try again.')
      }
    }
    setIsLoading(false)
  }

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    ux_mode: 'redirect',
    redirect_uri: `${window.location.origin}/callback`,
    onError: (error) => {
      console.error('Google login error:', error)
      setError('Google authentication failed. Please try again.')
    }
  })

  const handleGoogleClick = () => {
    setError('')
    setIsLoading(true)
    googleLogin()
  }

  if (isCallback && isLoading) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="loading-spinner"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">&#127891;</div>
        <h1>Xogos Scholarship Board</h1>
        <p>Board Member Portal for Scholarship Distribution</p>

        <button
          className="google-btn"
          onClick={handleGoogleClick}
          disabled={isLoading}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Only authorized board members can access this portal.
          <br />
          Contact the administrator if you need access.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
