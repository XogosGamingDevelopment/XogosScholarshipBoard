import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getHistory, getStoredReport } from '../utils/api'
import { downloadPdf } from '../utils/pdfGenerator'

function HistoryPage({ boardMember, onLogout }) {
  const [batches, setBatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await getHistory(50, 0)
      if (response.success) {
        setBatches(response.batches || [])
        setTotal(response.total || 0)
      }
    } catch (err) {
      console.error('Error fetching history:', err)
    }
    setIsLoading(false)
  }

  const handleDownloadPdf = async (batchId) => {
    // Reports are permanent snapshots frozen at execution — never regenerated from live data.
    setError('')
    try {
      const stored = await getStoredReport(batchId)
      if (stored.success && stored.report_data) {
        downloadPdf(stored.report_data)
      } else {
        setError(`No stored report found for batch #${batchId}.`)
      }
    } catch (err) {
      setError(err.response?.data?.message || `Could not load the report for batch #${batchId}.`)
    }
  }

  const getStatusBadge = (status) => {
    return <span className={`status-badge ${status}`}>{status}</span>
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="header-logo">&#127891;</span>
          <span className="header-title">Xogos Scholarship Board</span>
        </div>
        <div className="header-right">
          <nav className="nav-links">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/history" className="nav-link active">History</Link>
          </nav>
          <div className="user-info">
            <div className="user-avatar">
              {boardMember.img ? (
                <img src={boardMember.img} alt={boardMember.firstname} />
              ) : (
                boardMember.firstname?.charAt(0) || 'B'
              )}
            </div>
            <div>
              <div className="user-name">
                {boardMember.firstname} {boardMember.lastname}
              </div>
              {boardMember.is_admin && <span className="admin-badge">Admin</span>}
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Distribution History</h3>
            <span style={{ color: 'var(--text-secondary)' }}>{total} total batches</span>
          </div>

          {isLoading ? (
            <div className="loading-screen" style={{ padding: '2rem' }}>
              <div className="loading-spinner"></div>
              <p>Loading history...</p>
            </div>
          ) : batches.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Date</th>
                    <th>Fund Amount</th>
                    <th>Coins</th>
                    <th>Students</th>
                    <th>Approvals</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map(batch => (
                    <tr key={batch.batch_id}>
                      <td>#{batch.batch_id}</td>
                      <td>
                        {batch.distributed_at
                          ? new Date(batch.distributed_at).toLocaleDateString()
                          : new Date(batch.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ color: 'var(--success-color)', fontWeight: '600' }}>
                        ${batch.total_fund_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ color: 'var(--primary-color)' }}>
                        {batch.total_coins_converted.toLocaleString()}
                      </td>
                      <td>{batch.student_count}</td>
                      <td>
                        {batch.approval_count} / {batch.required_accepts ?? 3}
                        {batch.decline_count > 0 && (
                          <span style={{ color: 'var(--text-secondary)', marginLeft: '0.4rem' }}>
                            ({batch.decline_count} declined)
                          </span>
                        )}
                      </td>
                      <td>{getStatusBadge(batch.status)}</td>
                      <td>{batch.created_by}</td>
                      <td>
                        {batch.status === 'distributed' && (
                          <button
                            className="btn btn-primary"
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}
                            onClick={() => handleDownloadPdf(batch.batch_id)}
                          >
                            PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">
              <div className="no-data-icon">&#128203;</div>
              <p>No distribution batches yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
