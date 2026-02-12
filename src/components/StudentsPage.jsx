import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

function StudentsPage() {
  const [recipients, setRecipients] = useState([]);
  const [totalDistributed, setTotalDistributed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.getScholarshipRecipients();
      setRecipients(response.recipients || []);
      setTotalDistributed(response.total_distributed_usd || 0);
    } catch (err) {
      setError('Failed to load student data');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRecipients = recipients.filter(r =>
    `${r.firstname} ${r.lastname} ${r.username}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUpdateTypeLabel = (type) => {
    const labels = {
      college: '🎓 College',
      trade_school: '🔧 Trade School',
      career: '💼 Career',
      other: '📝 Other'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="students-page">
        <h1>Scholarship Recipients</h1>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="students-page">
      <h1>Scholarship Recipients</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Summary Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{recipients.length}</div>
          <div className="stat-label">Total Recipients</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(totalDistributed)}</div>
          <div className="stat-label">Total Distributed</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Recipients List */}
      <div className="card">
        <h2>Students ({filteredRecipients.length})</h2>

        {filteredRecipients.length === 0 ? (
          <p className="text-muted">
            {searchTerm ? 'No students match your search.' : 'No scholarship recipients yet.'}
          </p>
        ) : (
          <div className="recipients-list">
            {filteredRecipients.map(student => (
              <div key={student.user_id} className="recipient-item">
                <div
                  className="recipient-header"
                  onClick={() => setExpandedStudent(
                    expandedStudent === student.user_id ? null : student.user_id
                  )}
                >
                  <div className="recipient-info">
                    <h3 className="recipient-name">
                      {student.firstname} {student.lastname}
                    </h3>
                    <span className="recipient-username">@{student.username}</span>
                  </div>
                  <div className="recipient-stats">
                    <span className="recipient-amount">{formatCurrency(student.total_usd_earned)}</span>
                    <span className="recipient-distributions">
                      {student.distribution_count} distribution{student.distribution_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="expand-icon">
                    {expandedStudent === student.user_id ? '▼' : '▶'}
                  </span>
                </div>

                {expandedStudent === student.user_id && (
                  <div className="recipient-details">
                    <div className="detail-row">
                      <span className="detail-label">Parent Email:</span>
                      <span className="detail-value">{student.parent_email || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Last Distribution:</span>
                      <span className="detail-value">{formatDate(student.last_distribution_date)}</span>
                    </div>

                    {/* Student Updates */}
                    <div className="student-updates">
                      <h4>Updates</h4>
                      {student.updates && student.updates.length > 0 ? (
                        <div className="updates-list">
                          {student.updates.map(update => (
                            <div key={update.update_id} className="update-item">
                              <span className="update-type">{getUpdateTypeLabel(update.update_type)}</span>
                              {update.institution_name && (
                                <span className="update-institution">{update.institution_name}</span>
                              )}
                              {update.description && (
                                <p className="update-description">{update.description}</p>
                              )}
                              <span className="update-date">{formatDate(update.submitted_at)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">No updates submitted yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsPage;
