import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStudentDetail } from '../utils/api'

function StudentDetailPage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStudentDetail = async () => {
      try {
        const response = await getStudentDetail(userId)
        if (response.success) {
          setStudent(response)
        } else {
          setError(response.message || 'Failed to load student details')
        }
      } catch (err) {
        console.error('Error fetching student detail:', err)
        setError('Failed to load student details')
      }
      setIsLoading(false)
    }

    fetchStudentDetail()
  }, [userId])

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  if (isLoading) {
    return (
      <div className="student-detail-page">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading student details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-detail-page">
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/students')}>
          Back to Students
        </button>
      </div>
    )
  }

  const { student: studentInfo, scholarship_summary, bank_account, distribution_history, updates } = student

  return (
    <div className="student-detail-page">
      {/* Back Button */}
      <button className="btn btn-back" onClick={() => navigate('/students')}>
        &larr; Back to Students
      </button>

      {/* Student Header */}
      <div className="student-header card">
        <div className="student-avatar">
          {studentInfo.profile_image ? (
            <img src={studentInfo.profile_image} alt={`${studentInfo.firstname}'s avatar`} />
          ) : (
            <div className="avatar-placeholder">
              {studentInfo.firstname?.[0]}{studentInfo.lastname?.[0]}
            </div>
          )}
        </div>
        <div className="student-info">
          <h1 className="student-name">{studentInfo.firstname} {studentInfo.lastname}</h1>
          <div className="student-meta">
            {studentInfo.username && <span className="meta-item">@{studentInfo.username}</span>}
            {studentInfo.student_email && <span className="meta-item">{studentInfo.student_email}</span>}
          </div>
          {studentInfo.parent && studentInfo.parent.email && (
            <div className="parent-info">
              <span className="label">Parent:</span>
              {studentInfo.parent.firstname} {studentInfo.parent.lastname} ({studentInfo.parent.email})
            </div>
          )}
          <div className="account-date">
            Member since {formatDate(studentInfo.account_created)}
          </div>
        </div>
      </div>

      {/* Scholarship Summary */}
      <div className="stats-grid">
        <div className="stat-card highlight">
          <div className="stat-label">Total Scholarship Earned</div>
          <div className="stat-value currency">{formatCurrency(scholarship_summary?.total_usd_earned)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Coins Converted</div>
          <div className="stat-value coins">{(scholarship_summary?.total_coins_converted || 0).toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Distributions Received</div>
          <div className="stat-value">{scholarship_summary?.distribution_count || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last Distribution</div>
          <div className="stat-value small">{formatDate(scholarship_summary?.last_distribution_date)}</div>
        </div>
      </div>

      {/* Current Bank Balance */}
      {bank_account && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Current Bank Status</h3>
          </div>
          <div className="bank-stats">
            <div className="bank-stat">
              <span className="label">Total Coins Earned:</span>
              <span className="value">{(bank_account.coins_earned || 0).toLocaleString()}</span>
            </div>
            <div className="bank-stat">
              <span className="label">Current Balance:</span>
              <span className="value">{(bank_account.coins_balance || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Distribution History */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Distribution History</h3>
        </div>
        {distribution_history && distribution_history.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Batch ID</th>
                <th>Coins Contributed</th>
                <th>USD Awarded</th>
                <th>Batch Total</th>
              </tr>
            </thead>
            <tbody>
              {distribution_history.map((dist) => (
                <tr key={dist.history_id}>
                  <td>{formatDate(dist.awarded_at)}</td>
                  <td>#{dist.batch_id}</td>
                  <td>{dist.coins_contributed.toLocaleString()}</td>
                  <td className="currency">{formatCurrency(dist.usd_awarded)}</td>
                  <td>{formatCurrency(dist.batch_total_usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>No distribution history yet.</p>
          </div>
        )}
      </div>

      {/* Student Updates */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Student Updates</h3>
          <span className="text-muted">College, career, and other updates</span>
        </div>
        {updates && updates.length > 0 ? (
          <div className="updates-list">
            {updates.map((update) => (
              <div key={update.update_id} className={`update-item ${update.update_type}`}>
                <div className="update-header">
                  <span className={`update-type-badge ${update.update_type}`}>
                    {update.update_type.charAt(0).toUpperCase() + update.update_type.slice(1)}
                  </span>
                  <span className="update-date">{formatDate(update.submitted_at)}</span>
                </div>
                {update.institution_name && (
                  <div className="update-institution">{update.institution_name}</div>
                )}
                {update.description && (
                  <div className="update-description">{update.description}</div>
                )}
                {update.approved_at && (
                  <div className="update-approved">Approved on {formatDate(update.approved_at)}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-data">
            <div className="no-data-icon">📚</div>
            <p>No updates from this student yet.</p>
            <p className="text-muted">Updates about college, trade school, or career will appear here.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDetailPage
