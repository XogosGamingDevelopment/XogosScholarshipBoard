import { useState, useEffect, useCallback } from 'react'
import StudentTable from './StudentTable'
import ApprovalPanel from './ApprovalPanel'
import DistributionModal from './DistributionModal'
import {
  getPendingStudents,
  getCurrentBatch,
  createBatch,
  approveBatch,
  executeDistribution,
  pollForUpdates,
  getPdfData,
  getAllMembers
} from '../utils/api'
import { downloadPdf } from '../utils/pdfGenerator'

function Dashboard({ boardMember }) {
  const [students, setStudents] = useState([])
  const [totalCoins, setTotalCoins] = useState(0)
  const [currentBatch, setCurrentBatch] = useState(null)
  const [approvals, setApprovals] = useState([])
  const [activeMembers, setActiveMembers] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [lastDistributionDate, setLastDistributionDate] = useState(null)
  const [currentDate, setCurrentDate] = useState(null)
  const [fundAmount, setFundAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [lastHash, setLastHash] = useState('')

  const fetchData = useCallback(async () => {
    try {
      // Fetch all board members
      const membersResponse = await getAllMembers()
      if (membersResponse.success) {
        setAllMembers(membersResponse.members || [])
      }

      // Check for existing batch first
      const batchResponse = await getCurrentBatch()

      // Store period dates
      setLastDistributionDate(batchResponse.last_distribution_date)
      setCurrentDate(batchResponse.current_date)

      if (batchResponse.success && batchResponse.batch) {
        setCurrentBatch(batchResponse)
        setApprovals(batchResponse.approvals)
        setActiveMembers(batchResponse.active_members || [])

        // Use allocations from batch
        if (batchResponse.allocations) {
          const formattedStudents = batchResponse.allocations.map(alloc => ({
            user_id: alloc.user_id,
            firstname: alloc.firstname,
            lastname: alloc.lastname,
            parent_email: alloc.parent_email,
            pending_scholarship: alloc.coins_converted,
            percentage: alloc.percentage,
            usd_amount: alloc.usd_amount
          }))
          setStudents(formattedStudents)
          setTotalCoins(batchResponse.batch.total_coins_converted)
        }
      } else {
        // No active batch, get pending students
        setCurrentBatch(null)
        const studentsResponse = await getPendingStudents()
        if (studentsResponse.success) {
          setStudents(studentsResponse.students || [])
          setTotalCoins(studentsResponse.total_coins_converted || 0)
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load data. Please refresh.')
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Real-time polling when there's an active batch
  useEffect(() => {
    if (!currentBatch || currentBatch.batch.status === 'distributed') return

    let isActive = true
    const poll = async () => {
      try {
        const response = await pollForUpdates(currentBatch.batch.batch_id, lastHash)
        if (!isActive) return

        if (response.success && response.updated) {
          setLastHash(response.state_hash)
          setApprovals({
            ...approvals,
            count: response.batch.approval_count,
            can_execute: response.batch.can_execute,
            list: response.approvals,
            current_user_approved: response.current_user_approved
          })
          setActiveMembers(response.active_members || [])

          // Check if batch was distributed
          if (response.batch.status === 'distributed') {
            setSuccessMessage('Distribution completed successfully!')
            fetchData()
            return
          }
        }

        if (isActive) {
          setTimeout(poll, 100)
        }
      } catch (err) {
        console.error('Polling error:', err)
        if (isActive) {
          setTimeout(poll, 5000)
        }
      }
    }

    poll()
    return () => { isActive = false }
  }, [currentBatch?.batch?.batch_id, lastHash])

  const handleCreateBatch = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) {
      setError('Please enter a valid fund amount')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const response = await createBatch(parseFloat(fundAmount), notes)
      if (response.success) {
        setSuccessMessage('Distribution batch created successfully!')
        setFundAmount('')
        setNotes('')
        fetchData()
      } else {
        setError(response.message || 'Failed to create batch')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch')
    }
    setIsCreating(false)
  }

  const handleApprove = async () => {
    setIsApproving(true)
    setError('')

    try {
      const response = await approveBatch(currentBatch.batch.batch_id)
      if (response.success) {
        setSuccessMessage('Your approval has been recorded!')
        fetchData()
      } else {
        setError(response.message || 'Failed to approve')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve')
    }
    setIsApproving(false)
  }

  const handleExecute = async () => {
    setShowConfirmModal(false)
    setIsExecuting(true)
    setError('')

    try {
      const response = await executeDistribution(currentBatch.batch.batch_id)
      if (response.success) {
        setSuccessMessage(`Distribution completed! ${response.students_processed} students received a total of $${response.total_usd_distributed.toFixed(2)}`)
        fetchData()
      } else {
        setError(response.message || 'Failed to execute distribution')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to execute distribution')
    }
    setIsExecuting(false)
  }

  const handleDownloadPdf = async () => {
    try {
      const response = await getPdfData(currentBatch.batch.batch_id)
      if (response.success) {
        downloadPdf(response.report_data)
      }
    } catch (err) {
      setError('Failed to generate PDF')
    }
  }

  const calculateAllocations = () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0 || totalCoins === 0) {
      return students
    }

    const fund = parseFloat(fundAmount)
    return students.map(student => ({
      ...student,
      usd_amount: (student.pending_scholarship / totalCoins) * fund
    }))
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Check if a member is online
  const isMemberOnline = (memberId) => {
    return activeMembers.some(m => m.id === memberId)
  }

  // Check if a member has approved
  const hasMemberApproved = (memberId) => {
    return approvals?.list?.some(a => a.board_member_id === memberId)
  }

  if (isLoading) {
    return (
      <div className="dashboard-content">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const displayStudents = currentBatch ? students : calculateAllocations()
  const hasBatch = !!currentBatch
  const batchStatus = currentBatch?.batch?.status
  const canApprove = hasBatch && batchStatus === 'pending' && !approvals?.current_user_approved
  const canExecute = hasBatch && approvals?.can_execute && boardMember.is_admin

  return (
    <div className="dashboard-page">
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {/* Period Info Card */}
      <div className="card period-card">
        <div className="stat-label">Distribution Period</div>
        <div className="period-dates">
          <div className="period-date">
            <div className="date-label">Last Distribution</div>
            <div className="date-value">{formatDate(lastDistributionDate) || 'First Distribution'}</div>
          </div>
          <span className="period-arrow">→</span>
          <div className="period-date">
            <div className="date-label">Today</div>
            <div className="date-value">{formatDate(currentDate)}</div>
          </div>
        </div>
      </div>

      {/* Board Members Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Board Members</h3>
          <span className="text-muted">
            {allMembers.filter(m => isMemberOnline(m.id)).length} online
          </span>
        </div>
        <div className="members-grid">
          {allMembers.map(member => (
            <div
              key={member.id}
              className={`member-card ${isMemberOnline(member.id) ? 'online' : ''} ${hasMemberApproved(member.id) ? 'approved' : ''}`}
            >
              <span className={`member-status ${isMemberOnline(member.id) ? 'online' : ''}`}></span>
              <span className="member-name">{member.firstname}</span>
              {hasMemberApproved(member.id) && <span className="member-approved">✓</span>}
            </div>
          ))}
        </div>
        {hasBatch && batchStatus === 'pending' && (
          <div className="confirmation-question">
            <p>Do you confirm these findings and do you agree to distribute these funds?</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Students Ready</div>
          <div className="stat-value">{students.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Coins Converted</div>
          <div className="stat-value coins">{totalCoins.toLocaleString()}</div>
        </div>
        {hasBatch && (
          <>
            <div className="stat-card">
              <div className="stat-label">Scholarship Fund</div>
              <div className="stat-value currency">
                ${currentBatch.batch.total_fund_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Batch Status</div>
              <div className="stat-value" style={{ textTransform: 'capitalize' }}>
                {batchStatus}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fund Input (only for admin when no batch) */}
      {boardMember.is_admin && !hasBatch && students.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Create Distribution Batch</h3>
          </div>
          <div className="fund-input-section">
            <div className="input-group">
              <label>Total Scholarship Fund (USD)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount (e.g., 5000)"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g., Q1 2026 Distribution"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleCreateBatch}
              disabled={isCreating || !fundAmount}
            >
              {isCreating ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Student Allocations</h3>
          {hasBatch && batchStatus === 'distributed' && (
            <button className="btn btn-primary" onClick={handleDownloadPdf}>
              Download PDF Report
            </button>
          )}
        </div>
        {students.length > 0 ? (
          <StudentTable
            students={displayStudents}
            showUsd={hasBatch || (fundAmount && parseFloat(fundAmount) > 0)}
            showParentEmail={boardMember.is_admin}
          />
        ) : (
          <div className="no-data">
            <div className="no-data-icon">📚</div>
            <p>No students have converted coins for scholarship yet.</p>
          </div>
        )}
      </div>

      {/* Approval Panel (when batch exists) */}
      {hasBatch && batchStatus !== 'distributed' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Approval Status</h3>
          </div>
          <ApprovalPanel
            approvals={approvals}
            activeMembers={activeMembers}
            canApprove={canApprove}
            canExecute={canExecute}
            isApproving={isApproving}
            isExecuting={isExecuting}
            onApprove={handleApprove}
            onExecute={() => setShowConfirmModal(true)}
          />
        </div>
      )}

      {/* Completed Distribution */}
      {hasBatch && batchStatus === 'distributed' && (
        <div className="card" style={{ background: 'rgba(34, 197, 94, 0.1)', borderColor: 'var(--success-color)' }}>
          <h3 style={{ color: 'var(--success-color)', marginBottom: '0.5rem' }}>
            Distribution Completed
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            This batch was distributed on {new Date(currentBatch.batch.distributed_at).toLocaleString()}
          </p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setCurrentBatch(null)
              fetchData()
            }}
          >
            Start New Distribution
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <DistributionModal
          batch={currentBatch.batch}
          studentCount={students.length}
          onConfirm={handleExecute}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  )
}

export default Dashboard
