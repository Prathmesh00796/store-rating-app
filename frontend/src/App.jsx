import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminAddUser from './pages/AdminAddUser';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminStores from './pages/AdminStores';
import AdminAddStore from './pages/AdminAddStore';
import UserStores from './pages/UserStores';
import OwnerDashboard from './pages/OwnerDashboard';
import ChangePassword from './pages/ChangePassword';

/**
 * AppLayout — wraps protected pages with the Navbar.
 * Public pages (Login, Register) do NOT have the Navbar.
 */
function AppLayout({ children }) {
  return (
    <div className="app-container">
      <Navbar />
      {children}
    </div>
  );
}

/**
 * HomeRedirect — redirects authenticated users to their role's page.
 * Unauthenticated users go to login.
 */
function HomeRedirect() {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const redirectMap = {
    ADMIN: '/admin/dashboard',
    NORMAL_USER: '/stores',
    STORE_OWNER: '/owner/dashboard',
  };

  return <Navigate to={redirectMap[role] || '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes — no Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Home — redirect based on role */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminDashboard /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminUsers /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users/add" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminAddUser /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminUserDetail /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/stores" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminStores /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/stores/add" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AppLayout><AdminAddStore /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Normal User Routes */}
          <Route path="/stores" element={
            <ProtectedRoute allowedRoles={['NORMAL_USER']}>
              <AppLayout><UserStores /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Store Owner Routes */}
          <Route path="/owner/dashboard" element={
            <ProtectedRoute allowedRoles={['STORE_OWNER']}>
              <AppLayout><OwnerDashboard /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Shared Routes — any authenticated user */}
          <Route path="/change-password" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'NORMAL_USER', 'STORE_OWNER']}>
              <AppLayout><ChangePassword /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Catch-all — redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
