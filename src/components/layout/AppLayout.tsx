import React from 'react';
import { useLocation } from 'wouter';
import Navbar from './Navbar';

// Paths where Navbar should be hidden (dashboard related pages)
const NO_NAVBAR_PATHS: string[] = [
  '/dashboard',
  '/user-dashboard',
  '/admin',
];
import Footer from './Footer';

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

  // Show Navbar on non-dashboard routes
  const shouldShowNavbar = !NO_NAVBAR_PATHS.some(p => location === p || location.startsWith(p + '/'));
  const shouldShowFooter =
    showFooter !== undefined
      ? showFooter
      : !NO_FOOTER_PATHS.some(p => location === p || location.startsWith(p + '/'));

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <main className="main-content">
        {children}
      </main>
      {shouldShowFooter && <Footer />}
    </>
  );
}