import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import HistoryPage from './components/HistoryPage'
import { verifyToken } from './utils/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [boardMember, setBoardMember] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('board_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const response = await verifyToken(token)
      if (response.success) {
        setIsAuthenticated(true)
        setBoardMember(response.board_member)
      } else {
        localStorage.removeItem('board_token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('board_token')
    }
    setIsLoading(false)
  }

  const handleLogin = (token, member) => {
    localStorage.setItem('board_token', token)
    setIsAuthenticated(true)
    setBoardMember(member)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('board_token')
    setIsAuthenticated(false)
    setBoardMember(null)
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/callback"
          element={<LoginPage onLogin={handleLogin} isCallback={true} />}
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard boardMember={boardMember} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/history"
          element={
            isAuthenticated ? (
              <HistoryPage boardMember={boardMember} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
