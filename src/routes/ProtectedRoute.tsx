import React from 'react';
import { RouteProps } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { isRoleAllowed } from '../utils/getRedirectByRole';
import { useLocation } from 'wouter';
import PageLoader from '../components/ui/Pageloader';

interface ProtectedRouteProps extends RouteProps {
  allowedRoles?: Array<'user' | 'charity' | 'admin'>;
  children: React.ReactNode;
}

export default function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    setLocation('/');
    return null;
  }

  // If role restrictions apply and user doesn't qualify, redirect to their own dashboard
  if (allowedRoles && !isRoleAllowed(user.roleType, allowedRoles)) {
    switch (user.roleType) {
      case 'admin':
        setLocation('/admin');
        break;
      case 'charity':
        setLocation('/dashboard');
        break;
      case 'user':
      case 'donor':
      default:
        setLocation('/user-dashboard');
    }
    return null;
  }

  return <>{children}</>;
}
