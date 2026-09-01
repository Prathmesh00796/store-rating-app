import { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import RatingInput from '../components/RatingInput';

/**
 * Store Owner Dashboard — shows average rating and users who rated their store.
 * Data is scoped to the owner's store via JWT authentication.
 */
export default function OwnerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [dashRes, ratingsRes] = await Promise.all([
        api.get('/owner/dashboard'),
        api.get('/owner/ratings'),
      ]);
      setDashboard(dashRes.data.data);
      setRatings(ratingsRes.data.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  const avgRating = dashboard?.averageRating || 0;

  const columns = [
    { key: 'userName', label: 'User Name', sortable: false },
    { key: 'userEmail', label: 'Email', sortable: false },
    { key: 'rating', label: 'Rating', sortable: false },
  ];

  function renderCell(row, col) {
    if (col.key === 'rating') {
      return <RatingInput value={row.rating} readOnly />;
    }
    return row[col.key];
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Store Owner Dashboard</h1>
      </div>

      {/* Store Info & Average Rating */}
      {dashboard?.store ? (
        <>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <h3>Your Store</h3>
              <div className="card-value" style={{ fontSize: '1.25rem' }}>{dashboard.store.name}</div>
            </div>

            <div className="dashboard-card">
              <h3>Average Rating</h3>
              <div className="card-value">
                {avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : 'No ratings'}
              </div>
            </div>

            <div className="dashboard-card">
              <h3>Total Ratings</h3>
              <div className="card-value">{dashboard.totalRatings}</div>
            </div>
          </div>

          {/* Users who rated */}
          <h2 style={{ marginBottom: '1rem' }}>Users Who Rated Your Store</h2>
          {ratings.length > 0 ? (
            <DataTable
              columns={columns}
              data={ratings}
              renderCell={renderCell}
            />
          ) : (
            <div className="empty-state">
              <p>No ratings yet.</p>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <p>No store assigned to your account.</p>
        </div>
      )}
    </div>
  );
}
