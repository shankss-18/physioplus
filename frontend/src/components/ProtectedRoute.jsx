import { Navigate } from 'react-router-dom';

/**
 * Wraps any admin route — redirects to /admin/login if no token in localStorage.
 */
export function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
