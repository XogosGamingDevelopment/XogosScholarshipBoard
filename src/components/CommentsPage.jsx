import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

function CommentsPage({ boardMember }) {
  const [comments, setComments] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [myComment, setMyComment] = useState('');
  const [includeInPdf, setIncludeInPdf] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get current batch info
      const batchResponse = await api.getCurrentBatch();

      if (batchResponse.has_pending_batch === false) {
        setCurrentBatch(null);
        setComments([]);
        setIsLoading(false);
        return;
      }

      setCurrentBatch(batchResponse.batch);

      // Get comments for this batch
      const commentsResponse = await api.getComments(batchResponse.batch.batch_id);
      setComments(commentsResponse.comments || []);

      // Set current user's comment if exists
      if (commentsResponse.current_user_comment) {
        setMyComment(commentsResponse.current_user_comment.comment);
        setIncludeInPdf(commentsResponse.current_user_comment.include_in_pdf);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveComment = async () => {
    if (!currentBatch || !myComment.trim()) return;

    try {
      setIsSaving(true);
      setError('');

      await api.saveComment(currentBatch.batch_id, myComment, includeInPdf);

      setSuccessMessage('Comment saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Refresh comments
      const commentsResponse = await api.getComments(currentBatch.batch_id);
      setComments(commentsResponse.comments || []);
    } catch (err) {
      setError('Failed to save comment');
      console.error('Error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="comments-page">
        <h1>Board Comments</h1>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!currentBatch) {
    return (
      <div className="comments-page">
        <h1>Board Comments</h1>
        <div className="empty-state">
          <p>No active distribution batch.</p>
          <p className="text-muted">Comments can be added when a distribution is in progress.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-page">
      <h1>Board Comments</h1>
      <p className="page-subtitle">
        Share your thoughts during the distribution for Batch #{currentBatch.batch_id}
      </p>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {/* My Comment Section */}
      <div className="card comment-form-card">
        <h2>Your Comment</h2>
        <textarea
          value={myComment}
          onChange={(e) => setMyComment(e.target.value)}
          placeholder="Share your hopes, dreams, or thoughts on how to make this better..."
          rows={5}
          className="comment-textarea"
        />
        <div className="comment-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={includeInPdf}
              onChange={(e) => setIncludeInPdf(e.target.checked)}
            />
            Include my comment in the official PDF printout
          </label>
          <button
            className="btn btn-primary"
            onClick={handleSaveComment}
            disabled={isSaving || !myComment.trim()}
          >
            {isSaving ? 'Saving...' : 'Save Comment'}
          </button>
        </div>
      </div>

      {/* Other Board Members' Comments */}
      <div className="card">
        <h2>Board Member Comments ({comments.length})</h2>
        {comments.length === 0 ? (
          <p className="text-muted">No comments yet for this batch.</p>
        ) : (
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.comment_id} className="comment-item">
                <div className="comment-header">
                  {comment.member.img && (
                    <img
                      src={comment.member.img}
                      alt={comment.member.firstname}
                      className="comment-avatar"
                    />
                  )}
                  <div className="comment-meta">
                    <span className="comment-author">
                      {comment.member.firstname} {comment.member.lastname}
                      {comment.member.is_admin && <span className="admin-badge">Admin</span>}
                    </span>
                    <span className="comment-date">
                      {new Date(comment.created_at).toLocaleString()}
                    </span>
                  </div>
                  {comment.include_in_pdf && (
                    <span className="pdf-badge" title="Included in PDF">📄</span>
                  )}
                </div>
                <p className="comment-text">{comment.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentsPage;
