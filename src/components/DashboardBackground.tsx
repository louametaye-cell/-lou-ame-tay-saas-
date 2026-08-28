import React from 'react';

export function DashboardBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 1. Photo Background */}
      <div 
        className="absolute inset-0 bg-[url('/images/dashboard-bg.jpg')] bg-cover bg-center bg-no-repeat opacity-15"
      />

      {/* 2. Soft Dark Overlay with Blur */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px]" />

      {/* 3. Subtle Geometric Motif inspired by Senegalese Gastronomy & Patterns */}
      <svg
        className="absolute -top-1/4 -right-1/4 w-[120%] h-[120%] opacity-5"
        viewBox="0 0 1000 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="500" cy="500" r="450" fill="#FF6B00" opacity="0.3" />
        <circle cx="500" cy="500" r="300" fill="#00A86B" opacity="0.25" />
        <circle cx="500" cy="500" r="150" fill="#FFFFFF" opacity="0.1" />
        
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * 2 * Math.PI;
          const x = 500 + 350 * Math.cos(angle);
          const y = 500 + 350 * Math.sin(angle);
          return (
            <circle key={i} cx={x} cy={y} r="25" fill="#FF6B00" opacity="0.2" />
          );
        })}
      </svg>
    </div>
  );
}
