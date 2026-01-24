import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

export default RequireAdmin;
