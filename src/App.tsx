// import React, { useEffect } from 'react';
// import { Switch, Route, Router as WouterRouter, useLocation } from 'wouter';
// import { AuthProvider } from './contexts/AuthContext';
// import ProtectedRoute from './routes/ProtectedRoute';
// import PageTransition from './components/ui/PageTransition';
// import AppLayout from './components/layout/AppLayout';
// import ChatLayout from './components/layout/ChatLayout';

// /* ── Pages ─────────────────────────────────────────────────── */
// import Home          from './pages/Home';
// import Charities     from './pages/Charities';
// import CharityDetail from './pages/CharityDetail';
// import About         from './pages/About';
// import Contact       from './pages/Contact';
// import Dashboard     from './pages/Dashboard';
// import UserDashboard from './pages/UserDashboard';
// import AIChat        from './pages/AIChat';
// import Settings      from './pages/Settings';
// import Notifications from './pages/Notifications';
// import AdminPanel    from './pages/admin/AdminPanel';
// import PrivacyPolicy from './pages/PrivacyPolicy';
// import Terms         from './pages/Terms';
// import FAQ           from './pages/FAQ';
// import AuthPage      from './pages/AuthPage';
// import ForgotPasswordPage from './pages/ForgetPasswordPage';
// import { DonationPage }   from './components/shared/DonationModal';

// /* ── Utilities ─────────────────────────────────────────────── */
// import { RouteGuard }      from './components/RouteGuard';
// import { initScrollReveal } from './utils/scrollReveal';

// /* ── ScrollReveal re-init on route change ──────────────────── */
// function ScrollRevealInit() {
//   const [location] = useLocation();
//   useEffect(() => {
//     const t = setTimeout(() => initScrollReveal(), 150);
//     return () => clearTimeout(t);
//   }, [location]);
//   return null;
// }

// /* ── 404 ───────────────────────────────────────────────────── */
// function NotFound() {
//   return (
//     <PageTransition>
//       <div className="notfound" style={{ paddingTop: 72 }}>
//         <h1>404</h1>
//         <h2>الصفحة غير موجودة</h2>
//         <p>عذرًا، الصفحة التي تبحث عنها غير موجودة</p>
//         <a href="/" className="btn-primary" style={{ display: 'inline-flex' }}>العودة للرئيسية</a>
//       </div>
//     </PageTransition>
//   );
// }

// /* ── Main App ──────────────────────────────────────────────── */
// function App() {
//   return (
//     <AuthProvider>
//       <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
//         <RouteGuard />
//         <ScrollRevealInit />

//         <Switch>

//           {/* ══ AI Chat — Full Screen, no Navbar/Footer ══ */}
//           <Route path="/ai-chat">
//             <ProtectedRoute>
//               <ChatLayout>
//                 <AIChat />
//               </ChatLayout>
//             </ProtectedRoute>
//           </Route>

//           {/* ══ All other pages — with Navbar + Footer ══ */}
//           <Route>
//             <AppLayout>
//               <Switch>
//                 <Route path="/">
//                   <PageTransition><Home /></PageTransition>
//                 </Route>
//                 <Route path="/charities">
//                   <PageTransition><Charities /></PageTransition>
//                 </Route>
//                 <Route path="/charities/:id">
//                   <PageTransition><CharityDetail /></PageTransition>
//                 </Route>
//                 <Route path="/about">
//                   <PageTransition><About /></PageTransition>
//                 </Route>
//                 <Route path="/contact">
//                   <PageTransition><Contact /></PageTransition>
//                 </Route>
//                 <Route path="/privacy">
//                   <PageTransition><PrivacyPolicy /></PageTransition>
//                 </Route>
//                 <Route path="/terms">
//                   <PageTransition><Terms /></PageTransition>
//                 </Route>
//                 <Route path="/faq">
//                   <PageTransition><FAQ /></PageTransition>
//                 </Route>
//                 <Route path="/authModals">
//                   <PageTransition><AuthPage /></PageTransition>
//                 </Route>
//                 <Route path="/forgot-password">
//                   <PageTransition><ForgotPasswordPage /></PageTransition>
//                 </Route>

//                 {/* Protected routes */}
//                 <Route path="/settings">
//                   <ProtectedRoute>
//                     <PageTransition><Settings /></PageTransition>
//                   </ProtectedRoute>
//                 </Route>
//                 <Route path="/notifications">
//                   <ProtectedRoute>
//                     <PageTransition><Notifications /></PageTransition>
//                   </ProtectedRoute>
//                 </Route>
//                 <Route path="/donate">
//                   <ProtectedRoute allowedRoles={['user']}>
//                     <PageTransition><DonationPage /></PageTransition>
//                   </ProtectedRoute>
//                 </Route>
//                 <Route path="/user-dashboard">
//                   <ProtectedRoute allowedRoles={['user']}>
//                     <PageTransition><UserDashboard /></PageTransition>
//                   </ProtectedRoute>
//                 </Route>
//                 <Route path="/dashboard">
//                   <ProtectedRoute allowedRoles={['charity']}>
//                     <PageTransition><Dashboard /></PageTransition>
//                   </ProtectedRoute>
//                 </Route>
//                 <Route path="/admin">
//                   <ProtectedRoute allowedRoles={['admin']}>
//                     <PageTransition><AdminPanel /></PageTransition>
//                   </ProtectedRoute>
//                 </Route>

//                 <Route component={NotFound} />
//               </Switch>
//             </AppLayout>
//           </Route>

//         </Switch>
//       </WouterRouter>
//     </AuthProvider>
//   );
// }

// export default App;

import React, { useEffect } from 'react';
import { Switch, Route, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PageTransition from './components/ui/PageTransition';
import AppLayout from './components/layout/AppLayout';
import ChatLayout from './components/layout/ChatLayout';
// DashboardLayout import removed as per requirements

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
import { DonationPage }   from './components/shared/DonationModal';

/* ── Utilities ─────────────────────────────────────────────── */
import { RouteGuard }      from './components/RouteGuard';
import { initScrollReveal } from './utils/scrollReveal';
import DashboardLayout from './components/layout/DashboardLayout';

/* ── ScrollReveal re-init on route change ──────────────────── */
function ScrollRevealInit() {
  const [location] = useLocation();
  useEffect(() => {
    const t = setTimeout(() => initScrollReveal(), 150);
    return () => clearTimeout(t);
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

/* ── Main App ──────────────────────────────────────────────── */
function App() {
  return (
    <AuthProvider>
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
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout>
                <AdminPanel />
              </DashboardLayout>
            </ProtectedRoute>
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
                <Route path="/donate">
                  <ProtectedRoute allowedRoles={['user']}>
                    <PageTransition><DonationPage /></PageTransition>
                  </ProtectedRoute>
                </Route>

                <Route component={NotFound} />
              </Switch>
            </AppLayout>
          </Route>

        </Switch>
      </WouterRouter>
    </AuthProvider>
  );
}

export default App;