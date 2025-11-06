import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import './Admin.css';

const Admin = () => {
  const { user, logout } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

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
      await API.put(`/feedback/${feedbackId}/status`, { status: newStatus });
      loadFeedbacks();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredFeedbacks =
    filter === 'all'
      ? feedbacks
      : feedbacks.filter((f) => f.status === filter);

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <h2>Customer Feedback Portal - Admin</h2>
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
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage all customer feedbacks</p>
        </div>

        <div className="filter-section">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({feedbacks.length})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({feedbacks.filter((f) => f.status === 'pending').length})
          </button>
          <button
            className={`filter-btn ${filter === 'reviewed' ? 'active' : ''}`}
            onClick={() => setFilter('reviewed')}
          >
            Reviewed ({feedbacks.filter((f) => f.status === 'reviewed').length})
          </button>
          <button
            className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved ({feedbacks.filter((f) => f.status === 'resolved').length})
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'white', textAlign: 'center' }}>Loading...</p>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="card">
            <p>No feedbacks found.</p>
          </div>
        ) : (
          filteredFeedbacks.map((feedback) => (
            <div key={feedback._id} className="card feedback-card">
              <div className="feedback-header">
                <div>
                  <h3>{feedback.subject}</h3>
                  <p className="feedback-user">
                    From: {feedback.name} ({feedback.email})
                  </p>
                </div>
                <span className={`status-badge status-${feedback.status}`}>
                  {feedback.status}
                </span>
              </div>
              <div className="feedback-rating">
                {'★'.repeat(feedback.rating)}
                {'☆'.repeat(5 - feedback.rating)}
              </div>
              <p className="feedback-message">{feedback.message}</p>
              <div className="feedback-footer">
                <span className="feedback-date">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
                <div className="status-actions">
                  <select
                    value={feedback.status}
                    onChange={(e) =>
                      handleStatusChange(feedback._id, e.target.value)
                    }
                    className="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Admin;

