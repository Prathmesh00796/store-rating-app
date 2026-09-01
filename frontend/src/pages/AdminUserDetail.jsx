import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * Admin User Detail Page — view user info.
 * For Store Owners, also displays their store's average rating.
 */
export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data.data);
      } catch (err) {
        setError('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error || 'User not found.'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>← Back</button>
      </div>
    );
  }

  const roleLabels = {
    ADMIN: 'Admin',
    NORMAL_USER: 'Normal User',
    STORE_OWNER: 'Store Owner',
  };

  const badgeClass = {
    ADMIN: 'badge-admin',
    NORMAL_USER: 'badge-normal',
    STORE_OWNER: 'badge-owner',
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Details</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/admin/users')}>← Back</button>
      </div>

      <div className="form-container">
        <div className="card">
          <div className="detail-item">
            <div className="detail-label">Name</div>
            <div className="detail-value">{user.name}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Email</div>
            <div className="detail-value">{user.email}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Address</div>
            <div className="detail-value">{user.address || '—'}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Role</div>
            <div className="detail-value">
              <span className={`badge ${badgeClass[user.role]}`}>{roleLabels[user.role]}</span>
            </div>
          </div>

          {/* Show store rating for Store Owners */}
          {user.role === 'STORE_OWNER' && user.stores && user.stores.length > 0 && (
            <div className="detail-item">
              <div className="detail-label">Store Rating</div>
              {user.stores.map((store) => (
                <div key={store.id} className="detail-value">
                  {store.name}: {parseFloat(store.averageRating) > 0
                    ? `${parseFloat(store.averageRating).toFixed(1)} / 5`
                    : 'No ratings'}
                </div>
              ))}
            </div>
          )}

          {user.role === 'STORE_OWNER' && (!user.stores || user.stores.length === 0) && (
            <div className="detail-item">
              <div className="detail-label">Store</div>
              <div className="detail-value" style={{ color: '#64748b' }}>No store assigned</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
