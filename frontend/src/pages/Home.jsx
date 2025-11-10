import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import API from '../services/api.js';
import './Home.css';

const Home = () => {
  const { user, logout } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
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

  const stats = useMemo(() => {
    if (!feedbacks.length) {
      return {
        total: 0,
        averageRating: 0,
        pending: 0,
        reviewed: 0,
        resolved: 0,
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
      feedbacks.reduce((sum, feedback) => sum + (feedback.rating || 0), 0) /
      feedbacks.length;

    return {
      total: feedbacks.length,
      averageRating,
      pending: statusCount.pending,
      reviewed: statusCount.reviewed,
      resolved: statusCount.resolved,
    };
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    if (activeFilter === 'all') return feedbacks;
    return feedbacks.filter((feedback) => feedback.status === activeFilter);
  }, [feedbacks, activeFilter]);

  const statusCounts = useMemo(
    () => ({
      all: stats.total,
      pending: stats.pending,
      reviewed: stats.reviewed,
      resolved: stats.resolved,
    }),
    [stats]
  );

  const vibeMessage = useMemo(() => {
    if (!stats.total) return 'Let’s collect your first spark of insight!';
    if (stats.averageRating >= 4.5) return 'Vibes are glowing ✨';
    if (stats.averageRating >= 3.5) return 'Things are feeling good 😊';
    if (stats.averageRating >= 2.5) return 'Let’s brighten the experience 🌤️';
    return 'Time to turn things around 💪';
  }, [stats]);

  const averageRatingDisplay = stats.total ? stats.averageRating.toFixed(1) : '—';

  return (
    <div className="home-container">
      <div className="ambient-blobs" aria-hidden="true">
        <span className="blob blob-one" />
        <span className="blob blob-two" />
        <span className="blob blob-three" />
      </div>

      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <div className="brand-avatar">CF</div>
            <div>
              <p className="brand-label">Customer Feedback</p>
              <h2>Feedback-me.com</h2>
            </div>
          </div>
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
        <section className="home-hero card">
          <div className="hero-content">
            <span className="hero-badge">Hey {user?.name?.split(' ')[0] || 'there'} 👋</span>
            <h1>Share the sparks, flag the bumps, keep the journey glowing.</h1>
            <p>
              Your voice shapes every next move. Drop a quick note when something delights you or
              when a moment needs a little extra shine—we’re listening.
            </p>
            <div className="hero-actions">
              <button
                onClick={() => setShowForm((prev) => !prev)}
                className="btn btn-primary hero-action"
              >
                {showForm ? 'Close feedback form' : 'Share fresh feedback'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  const anchor = document.getElementById('feedbacks-anchor');
                  if (anchor) {
                    anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                Browse my story
              </button>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-label">Total entries</span>
              <span className="stat-value">{stats.total}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Average rating</span>
              <span className="stat-value">{averageRatingDisplay}</span>
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

          <div className="hero-vibe">
            <div className="vibe-icon" aria-hidden="true">
              💛
            </div>
            <div>
              <p className="vibe-message">{vibeMessage}</p>
              <p className="vibe-subtext">
                Tap in any time you feel a spark—your insight keeps the experience curated just for
                you.
              </p>
            </div>
          </div>
        </section>

        {showForm && (
          <div className="card feedback-form">
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

        <section className="feedbacks-section" id="feedbacks-anchor">
          <div className="feedbacks-header">
            <div>
              <h2>Feedback timeline</h2>
              <p>Catch the pulse of every moment you’ve shared so far.</p>
            </div>
            <div className="feedback-filters">
              {['all', 'pending', 'reviewed', 'resolved'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  className={`chip ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="chip-count">
                    {statusCounts[filter]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="card empty-state">
              <h3>No feedback in this view (yet!)</h3>
              <p>
                Switch filters above or drop a note using the button up top to start building your
                story.
              </p>
            </div>
          ) : (
            <div className="feedback-grid">
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
                </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;

