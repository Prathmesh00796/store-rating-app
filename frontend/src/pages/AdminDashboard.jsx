import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Admin Dashboard — displays total users, stores, and ratings.
 * Values are fetched from the backend (not hardcoded).
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.data);
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

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total Users</h3>
          <div className="card-value">{stats.totalUsers}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Stores</h3>
          <div className="card-value">{stats.totalStores}</div>
        </div>

        <div className="dashboard-card">
          <h3>Total Ratings</h3>
          <div className="card-value">{stats.totalRatings}</div>
        </div>
      </div>
    </div>
  );
}
