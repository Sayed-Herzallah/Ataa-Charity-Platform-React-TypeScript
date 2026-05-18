import React from 'react';
import Footer from './Footer';

// Simple layout for dashboard pages without the global Navbar.
// Can be extended with dashboard‑specific UI elements if needed.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Dashboard pages may have their own header or sidebar – add here if required */}
      <main className="main-content">{children}</main>
      {/* Footer is kept if desired; remove if dashboard should be full‑screen */}
      {/* Footer omitted on dashboard pages */}
    </>
  );
}
