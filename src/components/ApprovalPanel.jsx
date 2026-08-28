import { useState } from 'react'

function ApprovalPanel({
  approvals,
  activeMembers,
  canVote,
  canExecute,
  isVoting,
  isExecuting,
  onVote,
  onExecute
}) {
  const [voteComment, setVoteComment] = useState('')
  const [selectedVote, setSelectedVote] = useState(null)

  const acceptCount = approvals?.accept_count || 0
  const declineCount = approvals?.decline_count || 0
  const totalVotes = approvals?.total_votes || 0
  const requiredAccepts = approvals?.required_accepts || 3
  const voteList = approvals?.list || []
  const currentUserVoted = approvals?.current_user_voted || false
  const currentUserVoteType = approvals?.current_user_vote_type || null
  const isReady = acceptCount >= requiredAccepts

  const handleVoteSubmit = (voteType) => {
    setSelectedVote(voteType)
    onVote(voteType, voteComment)
  }

  return (
    <div className="approval-panel">
      <div className="approval-status">
        {/* Vote Tally */}
        <div className="vote-tally">
          <div className={`vote-count accept ${acceptCount >= requiredAccepts ? 'ready' : ''}`}>
            <span className="vote-icon">&#10003;</span>
            <span className="vote-number">{acceptCount}</span>
            <span className="vote-label">Accept</span>
          </div>
          <div className="vote-divider">/</div>
          <div className={`vote-count decline ${declineCount > 0 ? 'has-votes' : ''}`}>
            <span className="vote-icon">&#10007;</span>
            <span className="vote-number">{declineCount}</span>
            <span className="vote-label">Decline</span>
          </div>
        </div>

        <div className="approval-required">
          {isReady ? (
            <span className="ready-text">
              Ready to distribute! Voting stays open &mdash; remaining members can still vote.
            </span>
          ) : (
            `${requiredAccepts - acceptCount} more accept vote${requiredAccepts - acceptCount !== 1 ? 's' : ''} needed`
          )}
        </div>

        {/* Vote List with Comments */}
        {voteList.length > 0 && (
          <div className="vote-list">
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Votes ({totalVotes}):
            </h4>
            {voteList.map((vote, index) => (
              <div key={index} className={`vote-item ${vote.vote_type}`}>
                <div className={`vote-badge ${vote.vote_type}`}>
                  {vote.vote_type === 'accept' ? '&#10003;' : '&#10007;'}
                </div>
                <div className="vote-details">
                  <div className="vote-member">
                    {vote.firstname} {vote.lastname}
                    <span className={`vote-type-label ${vote.vote_type}`}>
                      {vote.vote_type === 'accept' ? 'Accepted' : 'Declined'}
                    </span>
                  </div>
                  {vote.comment && (
                    <div className="vote-comment">
                      "{vote.comment}"
                    </div>
                  )}
                  <div className="vote-time">
                    {new Date(vote.approved_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active Members */}
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
        {/* Show voting form if user hasn't voted yet */}
        {canVote && !currentUserVoted && (
          <div className="voting-form">
            <div className="comment-input">
              <label htmlFor="vote-comment">Add a comment (optional):</label>
              <textarea
                id="vote-comment"
                value={voteComment}
                onChange={(e) => setVoteComment(e.target.value)}
                placeholder="Share your thoughts on this distribution..."
                rows={3}
                disabled={isVoting}
              />
            </div>
            <div className="vote-buttons">
              <button
                className="btn btn-accept"
                onClick={() => handleVoteSubmit('accept')}
                disabled={isVoting}
              >
                {isVoting && selectedVote === 'accept' ? 'Submitting...' : 'Accept'}
              </button>
              <button
                className="btn btn-decline"
                onClick={() => handleVoteSubmit('decline')}
                disabled={isVoting}
              >
                {isVoting && selectedVote === 'decline' ? 'Submitting...' : 'Decline'}
              </button>
            </div>
          </div>
        )}

        {/* Show user's vote status */}
        {currentUserVoted && !canExecute && (
          <div className={`user-vote-status ${currentUserVoteType}`}>
            {currentUserVoteType === 'accept' ? (
              <>
                <span className="vote-icon">&#10003;</span>
                You voted to <strong>accept</strong> this distribution
              </>
            ) : (
              <>
                <span className="vote-icon">&#10007;</span>
                You voted to <strong>decline</strong> this distribution
              </>
            )}
          </div>
        )}

        {/* Execute button for admin when ready */}
        {canExecute && (
          <button
            className="btn btn-execute"
            onClick={onExecute}
            disabled={isExecuting}
          >
            {isExecuting ? 'Executing...' : 'Execute Distribution'}
          </button>
        )}

        {/* Waiting message */}
        {!canExecute && isReady && currentUserVoted && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Waiting for admin to execute distribution...
          </p>
        )}
      </div>
    </div>
  )
}

export default ApprovalPanel
