import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import './Admin.css';

const Admin = () => {
  const { user, logout } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await API.get('/feedback');
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      setUpdatingId(feedbackId);
      await API.put(`/feedback/${feedbackId}/status`, { status: newStatus });
      loadFeedbacks();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId('');
    }
  };

  const stats = useMemo(() => {
    if (!feedbacks.length) {
      return {
        total: 0,
        pending: 0,
        reviewed: 0,
        resolved: 0,
        averageRating: 0,
      };
    }

    const statusCount = feedbacks.reduce(
      (acc, feedback) => {
        acc[feedback.status] = (acc[feedback.status] || 0) + 1;
        return acc;
      },
      { pending: 0, reviewed: 0, resolved: 0 }
    );

    const averageRating =
      feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0) / feedbacks.length;

    return {
      total: feedbacks.length,
      pending: statusCount.pending,
      reviewed: statusCount.reviewed,
      resolved: statusCount.resolved,
      averageRating,
    };
  }, [feedbacks]);

  const statusCounts = useMemo(
    () => ({
      all: stats.total,
      pending: stats.pending,
      reviewed: stats.reviewed,
      resolved: stats.resolved,
    }),
    [stats]
  );

  const filteredFeedbacks =
    filter === 'all'
      ? feedbacks
      : feedbacks.filter((f) => f.status === filter);

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <div className="brand-avatar">CF</div>
            <div>
              <p className="brand-label">Customer Feedback</p>
              <h2>Operations Suite</h2>
            </div>
          </div>
          <div className="nav-right">
            <a href="/" className="btn btn-secondary">
              Back to Home
            </a>
            <span className="user-name">Welcome, {user?.name}</span>
            <button onClick={logout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <section className="admin-hero card">
          <div className="admin-hero-content">
            <span className="hero-badge">Operations view</span>
            <h1>Keep the community glowing.</h1>
            <p>
              Track every piece of feedback as it moves from spark to resolution. Prioritize the
              conversations that need a little extra attention and celebrate the wins with the team.
            </p>
          </div>
          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-label">Total feedback</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg. rating</span>
              <span className="stat-value">
                {stats.total ? stats.averageRating.toFixed(1) : '—'}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Pending</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Resolved</span>
              <span className="stat-value">{stats.resolved}</span>
            </div>
          </div>
        </section>

        <div className="admin-toolbar card">
          <div>
            <h2>Feedback control center</h2>
            <p>Filter by status to focus your workflow.</p>
          </div>
          <div className="chip-group">
            {['all', 'pending', 'reviewed', 'resolved'].map((status) => (
              <button
                key={status}
                className={`chip ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="chip-count">
                  {statusCounts[status]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state admin-loading">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="card">
            <p>No feedbacks found.</p>
          </div>
        ) : (
          <div className="admin-feedback-list">
            {filteredFeedbacks.map((feedback) => {
              const ratingValue = Math.max(0, Math.min(5, Number(feedback.rating) || 0));

              return (
                <article
                  key={feedback._id}
                  className={`card feedback-card status-${feedback.status}`}
                >
                  <header className="feedback-card-header">
                    <div>
                      <p className="feedback-meta-date">
                        {new Date(feedback.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <h3>{feedback.subject}</h3>
                      <p className="feedback-user">
                        {feedback.name} &bull; {feedback.email}
                      </p>
                    </div>
                    <span className={`status-badge status-${feedback.status}`}>
                      {feedback.status}
                    </span>
                  </header>
                  <div className="feedback-rating" aria-label={`Rating ${ratingValue} out of 5`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span key={index} className={index < ratingValue ? 'filled' : ''}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="feedback-message">{feedback.message}</p>
                  <footer className="feedback-footer">
                    <span className="feedback-date">
                      Updated{' '}
                      {new Date(feedback.updatedAt || feedback.createdAt).toLocaleDateString()}
                    </span>
                    <ul className="status-actions" role="group" aria-label="Update feedback status">
                      {['pending', 'reviewed', 'resolved'].map((statusOption) => {
                        const isActive = feedback.status === statusOption;
                        const isLoading = updatingId === feedback._id && !isActive;
                        return (
                          <li key={statusOption}>
                            <button
                              type="button"
                              className={`status-pill ${statusOption} ${isActive ? 'active' : ''}`}
                              aria-pressed={isActive}
                              disabled={isActive || isLoading}
                              onClick={() => handleStatusChange(feedback._id, statusOption)}
                            >
                              {statusOption}
                              {isLoading && <span className="loader-dot" aria-hidden="true" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

