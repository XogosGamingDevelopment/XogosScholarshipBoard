import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App'
import ErrorBoundary from './ErrorBoundary'
import { ThemeProvider } from './contexts/ThemeContext'
import './App.css'

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim()

// Debug: Log client ID status (masked for security)
console.log('Google Client ID configured:', googleClientId ? `${googleClientId.substring(0, 10)}...` : 'MISSING')
console.log('API URL:', import.meta.env.VITE_API_URL || 'MISSING')

// Show error if Google Client ID is missing
if (!googleClientId) {
  document.getElementById('root').innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%); color: white; font-family: system-ui, sans-serif; text-align: center; padding: 20px;">
      <h1 style="margin-bottom: 20px;">Configuration Error</h1>
      <p style="margin-bottom: 10px;">Google OAuth Client ID is not configured.</p>
      <p style="font-size: 14px; opacity: 0.8;">Please set the GOOGLE_CLIENT_ID environment variable in AWS Amplify.</p>
    </div>
  `
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <GoogleOAuthProvider clientId={googleClientId}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </GoogleOAuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
}
