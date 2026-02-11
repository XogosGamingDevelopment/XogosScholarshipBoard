function DistributionModal({ batch, studentCount, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Confirm Distribution</h2>
        <p>
          You are about to distribute <strong>${batch.total_fund_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> in scholarship funds to <strong>{studentCount}</strong> students.
        </p>

        <div style={{
          background: 'var(--secondary-color)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Fund:</span>
            <span style={{ float: 'right', fontWeight: '600', color: 'var(--success-color)' }}>
              ${batch.total_fund_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Total Coins:</span>
            <span style={{ float: 'right', fontWeight: '600', color: 'var(--primary-color)' }}>
              {batch.total_coins_converted.toLocaleString()}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Students:</span>
            <span style={{ float: 'right', fontWeight: '600' }}>{studentCount}</span>
          </div>
        </div>

        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid var(--warning-color)',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--warning-color)'
        }}>
          <strong>Warning:</strong> This action cannot be undone. All pending scholarship coins will be converted to USD and added to student accounts.
        </div>

        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-success" onClick={onConfirm}>
            Confirm Distribution
          </button>
        </div>
      </div>
    </div>
  )
}

export default DistributionModal
