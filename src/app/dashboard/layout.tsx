import React from 'react';
import { DashboardBackground } from '@/components/DashboardBackground';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Background Soft Overlay & Pattern */}
      <DashboardBackground />
      
      {/* Main Content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
}
