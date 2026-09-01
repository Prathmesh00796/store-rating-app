import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards routes based on authentication and role.
 * 
 * Props:
 *   allowedRoles — array of roles that can access this route (e.g., ['ADMIN'])
 *   children     — the page component to render
 * 
 * Behavior:
 *   - If not authenticated → redirect to /login
 *   - If authenticated but wrong role → redirect to appropriate dashboard
 *   - If authenticated and correct role → render children
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, role, loading } = useAuth();

  // Wait for auth state to load from localStorage
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to their own dashboard
  if (allowedRoles && !allowedRoles.includes(role)) {
    const redirectMap = {
      ADMIN: '/admin/dashboard',
      NORMAL_USER: '/stores',
      STORE_OWNER: '/owner/dashboard',
    };
    return <Navigate to={redirectMap[role] || '/login'} replace />;
  }

  return children;
}
