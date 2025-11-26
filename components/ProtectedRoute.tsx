import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const user = StorageService.getCurrentUser();
  const location = useLocation();

  if (!user) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have permission
    if (user.role === Role.ADMIN) {
        return <Navigate to="/admin" replace />;
    } else {
        return <Navigate to="/" replace />; // Or a specific "Unauthorized" page
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;