import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/user/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/user/dashboard" />;
  }

  return children;
};

export default PrivateRoute;