// import React, { useEffect, useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { useLocation } from 'wouter';
// import { usersApi } from '../services';

// interface AdminProtectedRouteProps {
//   children: React.ReactNode;
// }

// export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
//   const { user, isLoading, logout } = useAuth();
//   const [, setLocation] = useLocation();
//   const [isValidating, setIsValidating] = useState(true);
//   const [isAuthorized, setIsAuthorized] = useState(false);

//   useEffect(() => {
//     if (isLoading) return;

//     const checkAdminAuth = async () => {
//       const adminEmail = import.meta.env.ADMIN_EMAIL?.trim().toLowerCase();
      
//       // 1. Check if user is logged in
//       if (!user) {
//         setLocation('/authModals');
//         setIsValidating(false);
//         return;
//       }

//       // 2. Check if email matches ADMIN_EMAIL
//       const userEmail = (user.email || '').trim().toLowerCase();
//       if (!adminEmail || userEmail !== adminEmail) {
//         // Not matching ADMIN_EMAIL -> Redirect to 403 immediately
//         setLocation('/403');
//         setIsValidating(false);
//         return;
//       }

//       // Email matches! Authorize immediately to eliminate any loading page/lag!
//       setIsAuthorized(true);
//       setIsValidating(false);

//       // 3. Make extra verification from the backend silently in the background
//       try {
//         const response = await usersApi.getProfile();
//         // Backend returns user details
//         const fetchedUser = response?.user || response?.finder || response?.account || response?.data || response?.result;
        
//         if (!fetchedUser || fetchedUser.email?.trim().toLowerCase() !== adminEmail) {
//           // User profile mismatch or doesn't exist in DB
//           console.warn('⚠️ AdminProtectedRoute: User mismatch or doesn\'t exist in DB, logging out');
//           logout();
//           setLocation('/authModals');
//         }
//       } catch (error) {
//         console.error('❌ AdminProtectedRoute: Backend verification failed:', error);
//         logout();
//         setLocation('/authModals');
//       }
//     };

//     checkAdminAuth();
//   }, [user, isLoading, setLocation, logout]);

//   // Prevent flash of admin content: render minimal loader ONLY when core auth state is loading
//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[100vh] bg-[#0b0f19] text-white" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0b0f19', color: '#fff', fontFamily: 'Tajawal, sans-serif' }}>
//         <i className="ti ti-loader-2 ti-spin text-4xl text-[#0ec97f] mb-4" style={{ fontSize: '42px', color: '#0ec97f', marginBottom: '16px', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
//         <p className="font-semibold text-sm text-gray-400" style={{ fontWeight: 600, fontSize: '14px', color: '#9ca3af', margin: 0 }}>جاري التحميل...</p>
//         <style>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (!isAuthorized) {
//     return null;
//   }

//   return <>{children}</>;
// }

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { usersApi } from '../services';
import PageLoader from '../components/ui/Pageloader';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    const checkAdminAuth = async () => {
      const adminEmail = import.meta.env.ADMIN_EMAIL?.trim().toLowerCase();
      
      // 1. Check if user is logged in
      if (!user) {
        setLocation('/authModals');
        setIsValidating(false);
        return;
      }

      // 2. Check if email matches ADMIN_EMAIL
      const userEmail = (user.email || '').trim().toLowerCase();
      if (!adminEmail || userEmail !== adminEmail) {
        // Not matching ADMIN_EMAIL -> Redirect to 403 immediately
        setLocation('/403');
        setIsValidating(false);
        return;
      }

      // Email matches! Authorize immediately to eliminate any loading page/lag!
      setIsAuthorized(true);
      setIsValidating(false);

      // 3. Make extra verification from the backend silently in the background
      try {
        const response = await usersApi.getProfile();
        // Backend returns user details
        const fetchedUser = response?.user || response?.finder || response?.account || response?.data || response?.result;
        
        if (!fetchedUser || fetchedUser.email?.trim().toLowerCase() !== adminEmail) {
          // User profile mismatch or doesn't exist in DB
          console.warn('⚠️ AdminProtectedRoute: User mismatch or doesn\'t exist in DB, logging out');
          logout();
          setLocation('/authModals');
        }
      } catch (error) {
        console.error('❌ AdminProtectedRoute: Backend verification failed:', error);
        logout();
        setLocation('/authModals');
      }
    };

    checkAdminAuth();
  }, [user, isLoading, setLocation, logout]);

  // Replace blank null screen with null during validation to let the global page loader handle rendering
  if (isLoading || isValidating) {
    return null;
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}