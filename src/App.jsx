import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import HistoryPage from './components/HistoryPage'
import StudentsPage from './components/StudentsPage'
import CommentsPage from './components/CommentsPage'
import SettingsPage from './components/SettingsPage'
import Layout from './components/Layout'
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

  // Protected route wrapper with Layout
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />
    }
    return (
      <Layout boardMember={boardMember} onLogout={handleLogout}>
        {children}
      </Layout>
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
            <ProtectedRoute>
              <Dashboard boardMember={boardMember} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage boardMember={boardMember} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/students"
          element={
            <ProtectedRoute>
              <StudentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comments"
          element={
            <ProtectedRoute>
              <CommentsPage boardMember={boardMember} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
