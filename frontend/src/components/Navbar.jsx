import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar — role-aware navigation bar.
 * Shows different links based on the user's role.
 */
export default function Navbar() {
  const { user, role, logout } = useAuth();
  const location = useLocation();

  // Helper to check if a link is active
  function isActive(path) {
    return location.pathname.startsWith(path) ? 'active' : '';
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        ⭐ <span>StoreRating</span>
      </div>

      <div className="navbar-links">
        {/* Admin Navigation */}
        {role === 'ADMIN' && (
          <>
            <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>Dashboard</Link>
            <Link to="/admin/users" className={isActive('/admin/users')}>Users</Link>
            <Link to="/admin/stores" className={isActive('/admin/stores')}>Stores</Link>
          </>
        )}

        {/* Normal User Navigation */}
        {role === 'NORMAL_USER' && (
          <Link to="/stores" className={isActive('/stores')}>Stores</Link>
        )}

        {/* Store Owner Navigation */}
        {role === 'STORE_OWNER' && (
          <Link to="/owner/dashboard" className={isActive('/owner')}>Dashboard</Link>
        )}

        {/* Common links for all roles */}
        <Link to="/change-password" className={isActive('/change-password')}>Password</Link>

        <span className="navbar-user">{user?.name}</span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
