import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { getRedirectByRole } from '../utils/getRedirectByRole';

const ROOT_ONLY_REDIRECT = ['/'];

export function RouteGuard() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  // Track which user was redirected — only redirect ONCE per user session.
  // This prevents back-gesture / 2-finger swipe from re-triggering redirect.
  const redirectedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      redirectedForRef.current = null;
      return;
    }

    const currentId = user._id || user.email;

    // Already redirected this user in this session — never redirect again
    if (redirectedForRef.current === currentId) return;

    // Mark as handled immediately to prevent double-fire
    redirectedForRef.current = currentId;

    // Only redirect if currently on root path
    if (ROOT_ONLY_REDIRECT.includes(locationRef.current)) {
      setLocation(getRedirectByRole(user.roleType));
    }

  }, [isLoading, user, setLocation]);

  return null;
}