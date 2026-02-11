function ApprovalPanel({
  approvals,
  activeMembers,
  canApprove,
  canExecute,
  isApproving,
  isExecuting,
  onApprove,
  onExecute
}) {
  const approvalCount = approvals?.count || 0
  const requiredApprovals = approvals?.required || 3
  const approvalList = approvals?.list || []
  const isReady = approvalCount >= requiredApprovals

  return (
    <div className="approval-panel">
      <div className="approval-status">
        <div className={`approval-count ${isReady ? 'ready' : ''}`}>
          {approvalCount} / {requiredApprovals}
        </div>
        <div className="approval-required">
          {isReady ? 'Ready to distribute!' : `${requiredApprovals - approvalCount} more approval${requiredApprovals - approvalCount !== 1 ? 's' : ''} needed`}
        </div>

        {approvalList.length > 0 && (
          <div className="approval-list">
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Approved by:
            </h4>
            {approvalList.map((approval, index) => (
              <div key={index} className="approval-item">
                <div className="approval-check">&#10003;</div>
                <div>
                  <div>{approval.firstname} {approval.lastname}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(approval.approved_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeMembers.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Board members online:
            </h4>
            <div className="active-members">
              {activeMembers.map((member) => (
                <div key={member.id} className="member-badge">
                  <span className="status-dot"></span>
                  {member.firstname} {member.lastname}
                  {member.is_admin && <span className="admin-badge" style={{ marginLeft: '0.25rem' }}>Admin</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="approval-actions">
        {canApprove && (
          <button
            className="btn btn-success"
            onClick={onApprove}
            disabled={isApproving}
          >
            {isApproving ? 'Approving...' : 'Approve Distribution'}
          </button>
        )}

        {approvals?.current_user_approved && !canExecute && (
          <p style={{ color: 'var(--success-color)', fontSize: '0.875rem' }}>
            &#10003; You have approved this distribution
          </p>
        )}

        {canExecute && (
          <button
            className="btn btn-primary"
            onClick={onExecute}
            disabled={isExecuting}
            style={{ background: 'var(--success-color)' }}
          >
            {isExecuting ? 'Executing...' : 'Execute Distribution'}
          </button>
        )}

        {!canExecute && isReady && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Waiting for admin to execute distribution...
          </p>
        )}
      </div>
    </div>
  )
}

export default ApprovalPanel
