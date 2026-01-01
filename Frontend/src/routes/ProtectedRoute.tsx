import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// allowedRoles: An array like ['Admin', 'Farmer']
interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  // 1. Not Logged In? -> Go to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Logged In but Wrong Role? -> Go to Unauthorized page (or Home)
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Allowed? -> Render the page (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;