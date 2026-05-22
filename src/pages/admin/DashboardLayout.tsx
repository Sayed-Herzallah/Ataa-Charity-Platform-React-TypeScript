import React from 'react';

// Dashboard layout — no Navbar, no global padding-top
// Admin panel has its own full-screen layout
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {children}
    </div>
  );
}