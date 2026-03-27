import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Spinner from './Spinner';

/**
 * ProtectedRoute wraps any route that requires authentication.
 * Optionally accepts an `allowedRoles` array; if provided, users
 * whose role is not included are redirected to /unauthorized.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-center">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
