import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export const ProtectedRoute: React.FC<{role?: string, children: React.ReactNode}> = ({role, children}) => {
  const { user, ready } = useAuth();
  if (!ready) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};
