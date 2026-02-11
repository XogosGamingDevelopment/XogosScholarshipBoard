import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://api.myxogos.com/api/board'

// Create axios instance with auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem('board_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Auth APIs
export const getGoogleAuthUrl = async () => {
  const response = await axios.get(`${API_URL}/auth/google_login.php`)
  return response.data
}

export const handleGoogleCallback = async (code, redirectUri) => {
  const response = await axios.post(`${API_URL}/auth/google_callback.php`, {
    code,
    redirect_uri: redirectUri
  })
  return response.data
}

export const verifyToken = async (token) => {
  const response = await axios.get(`${API_URL}/auth/verify.php`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return response.data
}

// Scholarship APIs
export const getPendingStudents = async () => {
  const response = await axios.get(`${API_URL}/scholarship/get_pending_students.php`, {
    headers: getAuthHeaders()
  })
  return response.data
}

export const getCurrentBatch = async (batchId = null) => {
  const url = batchId
    ? `${API_URL}/scholarship/get_batch.php?batch_id=${batchId}`
    : `${API_URL}/scholarship/get_batch.php`
  const response = await axios.get(url, {
    headers: getAuthHeaders()
  })
  return response.data
}

export const createBatch = async (totalFundUsd, notes = '') => {
  const response = await axios.post(
    `${API_URL}/scholarship/create_batch.php`,
    { total_fund_usd: totalFundUsd, notes },
    { headers: getAuthHeaders() }
  )
  return response.data
}

export const approveBatch = async (batchId) => {
  const response = await axios.post(
    `${API_URL}/scholarship/approve_batch.php`,
    { batch_id: batchId },
    { headers: getAuthHeaders() }
  )
  return response.data
}

export const executeDistribution = async (batchId) => {
  const response = await axios.post(
    `${API_URL}/scholarship/execute_distribution.php`,
    { batch_id: batchId },
    { headers: getAuthHeaders() }
  )
  return response.data
}

export const getHistory = async (limit = 20, offset = 0) => {
  const response = await axios.get(
    `${API_URL}/scholarship/get_history.php?limit=${limit}&offset=${offset}`,
    { headers: getAuthHeaders() }
  )
  return response.data
}

export const getPdfData = async (batchId) => {
  const response = await axios.get(
    `${API_URL}/scholarship/generate_pdf.php?batch_id=${batchId}`,
    { headers: getAuthHeaders() }
  )
  return response.data
}

// Realtime polling
export const pollForUpdates = async (batchId, lastHash = '', timeout = 30) => {
  const response = await axios.get(
    `${API_URL}/realtime/poll.php?batch_id=${batchId}&last_hash=${lastHash}&timeout=${timeout}`,
    {
      headers: getAuthHeaders(),
      timeout: (timeout + 5) * 1000 // Add 5 seconds buffer
    }
  )
  return response.data
}
