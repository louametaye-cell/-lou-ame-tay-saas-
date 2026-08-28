import React from 'react';

export function DashboardBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 1. Photo Background */}
      <div 
        className="absolute inset-0 bg-[url('/images/dashboard-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-5"
      />

      {/* 2. Soft Light Overlay with Blur */}
      <div className="absolute inset-0 bg-[#F8FAFC]/95 backdrop-blur-[1px]" />

      {/* 3. Subtle Geometric Motif */}
      <svg
        className="absolute -top-1/4 -right-1/4 w-[120%] h-[120%] opacity-10"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="500" cy="500" r="450" fill="#F59E0B" opacity="0.15" />
        <circle cx="500" cy="500" r="300" fill="#10B981" opacity="0.1" />
        <circle cx="500" cy="500" r="150" fill="#F59E0B" opacity="0.05" />
        
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 2 * Math.PI;
          const x = 500 + 350 * Math.cos(angle);
          const y = 500 + 350 * Math.sin(angle);
          return (
            <circle key={i} cx={x} cy={y} r="25" fill="#F59E0B" opacity="0.1" />
          );
        })}
      </svg>
    </div>
  );
}