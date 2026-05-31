// import React from 'react';
// import { useLocation } from 'wouter';
// import Navbar from './Navbar';
// import Footer from './Footer';
// import ScrollToTop from '../shared/ScrollToTop';

// // Paths where Navbar should be hidden (dashboard related pages)
// const NO_NAVBAR_PATHS: string[] = [
//   '/dashboard',
//   '/user-dashboard',
//   '/admin',
// ];

// interface AppLayoutProps {
//   children: React.ReactNode;
//   showFooter?: boolean;
// }

// const NO_FOOTER_PATHS: string[] = [
//   '/settings',
//   '/notifications',
// ];

// export default function AppLayout({ children, showFooter }: AppLayoutProps) {
//   const [location] = useLocation();

//   // Show Navbar on non-dashboard routes
//   const shouldShowNavbar = !NO_NAVBAR_PATHS.some(p => location === p || location.startsWith(p + '/'));
//   const shouldShowFooter =
//     showFooter !== undefined
//       ? showFooter
//       : !NO_FOOTER_PATHS.some(p => location === p || location.startsWith(p + '/'));

//   return (
//     <>
//       {shouldShowNavbar && <Navbar />}
//       <main className="main-content">
//         {children}
//       </main>
//       {shouldShowFooter && <Footer />}
//       <ScrollToTop />
//     </>
//   );
// }
import React from 'react';
import { useLocation } from 'wouter';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '../shared/ScrollToTop';

// Paths where Navbar should be hidden (dashboard related pages)
const NO_NAVBAR_PATHS: string[] = [
  '/dashboard',
  '/user-dashboard',
  '/admin',
];

interface AppLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

const NO_FOOTER_PATHS: string[] = [
  '/settings',
  '/notifications',
];

export default function AppLayout({ children, showFooter }: AppLayoutProps) {
  const [location] = useLocation();
  const [hidingLayout, setHidingLayout] = React.useState(false);

  React.useEffect(() => {
    const checkClass = () => {
      setHidingLayout(document.body.classList.contains('lp-hiding-layout'));
    };
    checkClass();
    const observer = new MutationObserver(checkClass);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Show Navbar on non-dashboard routes
  const shouldShowNavbar = !NO_NAVBAR_PATHS.some(p => location === p || location.startsWith(p + '/'));
  const shouldShowFooter =
    showFooter !== undefined
      ? showFooter
      : !NO_FOOTER_PATHS.some(p => location === p || location.startsWith(p + '/'));

  const showNav = shouldShowNavbar && !hidingLayout;
  const showFoot = shouldShowFooter && !hidingLayout;

  return (
    <>
      {showNav && <Navbar />}
      <main className="main-content">
        {children}
      </main>
      {showFoot && <Footer />}
      <ScrollToTop />
    </>
  );
}