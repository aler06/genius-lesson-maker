import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useTemporaryUser } from '@/hooks/useTemporaryUser';

interface SessionRouteProps {
  children: ReactNode;
}

/**
 * Special route component for session pages that allows both:
 * - Authenticated users (teachers/registered students)
 * - Temporary users (non-registered students)
 */
const SessionRoute = ({ children }: SessionRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { tempUser } = useTemporaryUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if we have session data in location state (from JoinSession navigation)
  const hasSessionData = location.state?.sessionData && location.state?.currentUser;

  // Allow access if:
  // 1. User is authenticated (registered user)
  // 2. Has temporary user AND session data (student joining session)
  // 3. Has session data with current user (direct navigation from JoinSession)
  if (isAuthenticated || (tempUser && hasSessionData) || hasSessionData) {
    return <>{children}</>;
  }

  // If no authentication and no session data, redirect to home
  return <Navigate to="/" replace />;
};

export default SessionRoute;
