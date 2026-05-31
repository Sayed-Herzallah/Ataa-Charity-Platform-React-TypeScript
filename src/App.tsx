import React, { useEffect, useState } from 'react';
import { Switch, Route, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PageTransition from './components/ui/PageTransition';
import AppLayout from './components/layout/AppLayout';
import ChatLayout from './components/layout/ChatLayout';
import PageLoader from './components/ui/Pageloader';

import AdminProtectedRoute from './routes/AdminProtectedRoute';

/* ── Pages ─────────────────────────────────────────────────── */
import Home          from './pages/Home';
import Charities     from './pages/Charities';
import CharityDetail from './pages/CharityDetail';
import About         from './pages/About';
import Contact       from './pages/Contact';
import Dashboard     from './pages/Dashboard';
import UserDashboard from './pages/UserDashboard';
import AIChat        from './pages/AIChat';
import Settings      from './pages/Settings';
import Notifications from './pages/Notifications';
import AdminPanel    from './pages/admin/AdminPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms         from './pages/Terms';
import FAQ           from './pages/FAQ';
import AuthPage      from './pages/AuthPage';
import ForgotPasswordPage from './pages/ForgetPasswordPage';
import VerifyEmail   from './pages/Auth/VerifyEmail';

/* ── Utilities ─────────────────────────────────────────────── */
import { RouteGuard }      from './components/RouteGuard';
import { initScrollReveal } from './utils/scrollReveal';
import DashboardLayout from './components/layout/DashboardLayout';
import TopLoadingBar from './components/ui/TopLoadingBar';
import { loadingEvents } from './utils/loadingEvents';

/* ── Route Redirect Helper ── */
function RouteRedirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  return null;
}

/* ── ScrollReveal re-init on route change ──────────────────── */
function ScrollRevealInit() {
  const [location] = useLocation();
  useEffect(() => {
    loadingEvents.start();
    const navTimer = setTimeout(() => {
      loadingEvents.stop();
    }, 240);

    const t = setTimeout(() => initScrollReveal(), 150);
    return () => {
      clearTimeout(t);
      clearTimeout(navTimer);
    };
  }, [location]);
  return null;
}

/* ── 404 ───────────────────────────────────────────────────── */
function NotFound() {
  return (
    <PageTransition>
      <div className="notfound" style={{ paddingTop: 72 }}>
        <h1>404</h1>
        <h2>الصفحة غير موجودة</h2>
        <p>عذرًا، الصفحة التي تبحث عنها غير موجودة</p>
        <a href="/" className="btn-primary" style={{ display: 'inline-flex' }}>العودة للرئيسية</a>
      </div>
    </PageTransition>
  );
}

/* ── 403 ───────────────────────────────────────────────────── */
function Forbidden() {
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleReturnToHome = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await logout();
    } catch (err) {
      console.warn("Logout failed:", err);
    }
    setLocation('/');
  };

  return (
    <PageTransition>
      <div className="notfound" style={{ 
        textAlign: 'center', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#0b0f19', 
        color: '#fff', 
        fontFamily: 'Tajawal, sans-serif',
        padding: '24px',
        boxSizing: 'border-box'
      }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginBottom: 24, margin: '0 auto' }}>
          <i className="ti ti-shield-x" style={{ fontSize: '38px' }} />
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#ef4444', margin: '16px 0 8px 0', lineHeight: 1 }}>403</h1>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: 12, margin: '8px 0' }}>غير مصرح بالدخول</h2>
        <p style={{ color: '#9ca3af', maxWidth: 400, margin: '0 auto 24px auto', fontSize: '14px', lineHeight: 1.6 }}>عذرًا، ليس لديك الصلاحيات الكافية للوصول إلى صفحات الإدارة والمشرفين.</p>
        <a 
          href="/" 
          onClick={handleReturnToHome}
          className="btn-primary" 
          style={{ 
            display: 'inline-flex', 
            padding: '10px 24px', 
            background: '#267880', 
            borderRadius: 8, 
            color: '#fff', 
            textDecoration: 'none', 
            fontWeight: 700, 
            transition: 'all 0.2s', 
            margin: '0 auto',
            cursor: 'pointer'
          }}
        >
          تسجيل الخروج والعودة للرئيسية
        </a>
      </div>
    </PageTransition>
  );
}

/* ── Main App ──────────────────────────────────────────────── */
function AppContent() {
  const { isLoading } = useAuth();
  const [showGlobalLoader, setShowGlobalLoader] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setShowGlobalLoader(false);
      }, 500); // 500ms fade-out transition duration
      return () => clearTimeout(timer);
    } else {
      setShowGlobalLoader(true);
      setIsFadingOut(false);
    }
  }, [isLoading]);

  return (
    <>
      {showGlobalLoader && (
        <PageLoader 
          fullscreen 
          className={isFadingOut ? 'pl-fade-out' : ''} 
        />
      )}
      <TopLoadingBar />
      <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
        <RouteGuard />
        <ScrollRevealInit />

        <Switch>

          {/* ══ AI Chat — Full Screen, no Navbar/Footer ══ */}
          <Route path="/ai-chat">
            <ProtectedRoute>
              <ChatLayout>
                <AIChat />
              </ChatLayout>
            </ProtectedRoute>
          </Route>

          {/* ══ Dashboard pages — No Navbar/Footer ══ */}
          <Route path="/user-dashboard">
            <ProtectedRoute allowedRoles={['user']}>
              <DashboardLayout>
                <UserDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute allowedRoles={['charity']}>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          <Route path="/admin">
            <AdminProtectedRoute>
              <DashboardLayout>
                <AdminPanel />
              </DashboardLayout>
            </AdminProtectedRoute>
          </Route>
          <Route path="/dashboard/admin">
            <AdminProtectedRoute>
              <DashboardLayout>
                <AdminPanel />
              </DashboardLayout>
            </AdminProtectedRoute>
          </Route>
          <Route path="/403">
            <Forbidden />
          </Route>


          {/* ══ All other pages — with Navbar + Footer ══ */}
          <Route>
            <AppLayout>
              <Switch>
                <Route path="/">
                  <PageTransition><Home /></PageTransition>
                </Route>
                <Route path="/charities">
                  <PageTransition><Charities /></PageTransition>
                </Route>
                <Route path="/charities/:id">
                  <PageTransition><CharityDetail /></PageTransition>
                </Route>
                <Route path="/about">
                  <PageTransition><About /></PageTransition>
                </Route>
                <Route path="/contact">
                  <PageTransition><Contact /></PageTransition>
                </Route>
                <Route path="/privacy">
                  <PageTransition><PrivacyPolicy /></PageTransition>
                </Route>
                <Route path="/terms">
                  <PageTransition><Terms /></PageTransition>
                </Route>
                <Route path="/faq">
                  <PageTransition><FAQ /></PageTransition>
                </Route>
                <Route path="/authModals">
                  <PageTransition><AuthPage /></PageTransition>
                </Route>
                <Route path="/forgot-password">
                  <PageTransition><ForgotPasswordPage /></PageTransition>
                </Route>

                {/* ✅ صفحة تفعيل الإيميل */}
                <Route path="/verify-email">
                  <PageTransition><VerifyEmail /></PageTransition>
                </Route>

                {/* Protected routes */}
                <Route path="/settings">
                  <ProtectedRoute>
                    <PageTransition><Settings /></PageTransition>
                  </ProtectedRoute>
                </Route>
                <Route path="/notifications">
                  <ProtectedRoute>
                    <PageTransition><Notifications /></PageTransition>
                  </ProtectedRoute>
                </Route>

                {/* توجيه ذكي فوري لصفحة إضافة التبرع بداخل لوحة التحكم الفاخرة للاحتفاظ بالتخطيط والـ Sidebar */}
                <Route path="/donate">
                  <ProtectedRoute allowedRoles={['user']}>
                    <RouteRedirect to="/user-dashboard?action=donate" />
                  </ProtectedRoute>
                </Route>

                <Route component={NotFound} />
              </Switch>
            </AppLayout>
          </Route>

        </Switch>
      </WouterRouter>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;