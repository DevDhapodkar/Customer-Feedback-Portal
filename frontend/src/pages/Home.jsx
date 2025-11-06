import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    rating: 0,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadFeedbacks();
    }
  }, [user]);

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await API.get('/feedback/my-feedback');
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error loading feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRatingClick = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.rating) {
      setError('Please select a rating');
      return;
    }

    try {
      await API.post('/feedback', formData);
      setSuccess('Feedback submitted successfully!');
      setFormData({ subject: '', message: '', rating: 0 });
      setShowForm(false);
      loadFeedbacks();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit feedback');
    }
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-content">
          <h2>Customer Feedback Portal</h2>
          <div className="nav-right">
            <span className="user-name">Welcome, {user?.name}</span>
            {user?.role === 'admin' && (
              <a href="/admin" className="btn btn-secondary" style={{ marginRight: '10px' }}>
                Admin Panel
              </a>
            )}
            <button onClick={logout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="home-header">
          <h1>Submit Your Feedback</h1>
          <p>We value your opinion. Help us improve by sharing your feedback.</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancel' : 'Submit Feedback'}
          </button>
        </div>

        {showForm && (
          <div className="card">
            <h2>New Feedback</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief subject of your feedback"
                />
              </div>

              <div className="form-group">
                <label>Rating</label>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={formData.rating >= star ? 'active' : ''}
                      onClick={() => handleRatingClick(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Describe your feedback in detail..."
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Submit Feedback
              </button>
            </form>
          </div>
        )}

        <div className="feedbacks-section">
          <h2>My Feedbacks</h2>
          {loading ? (
            <p>Loading...</p>
          ) : feedbacks.length === 0 ? (
            <div className="card">
              <p>No feedbacks submitted yet.</p>
            </div>
          ) : (
            feedbacks.map((feedback) => (
              <div key={feedback._id} className="card feedback-card">
                <div className="feedback-header">
                  <h3>{feedback.subject}</h3>
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
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

