import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';

/**
 * DashboardLayout — يحمي صفحات الداشبورد من السوايب للخلف.
 * لو المستخدم رجع بأصبعين أو زر الرجوع وكان داخل dashboard,
 * يتم تسجيل الخروج ومسح التوكن بدل ما يشوف صفحات غير مصرح بها.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // نضيف state للـ history عشان نكتشف الرجوع
    window.history.pushState({ dashboard: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      // لو رجع ومفيش state يعني خرج من الداشبورد
      if (!e.state?.dashboard) {
        logout();
        setLocation('/');
      } else {
        // أعد push حتى الـ back button يشتغل صح
        window.history.pushState({ dashboard: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [logout, setLocation]);

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}