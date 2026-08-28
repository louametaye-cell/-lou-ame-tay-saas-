'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Flame } from 'lucide-react';

interface OrderTimerBadgeProps {
  createdAt: string;
}

export const OrderTimerBadge: React.FC<OrderTimerBadgeProps> = ({ createdAt }) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      const createdTime = new Date(createdAt).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - createdTime);
      const totalSec = Math.floor(diffMs / 1000);
      setElapsedMinutes(Math.floor(totalSec / 60));
      setElapsedSeconds(totalSec % 60);
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const formattedTime = `${elapsedMinutes < 10 ? '0' + elapsedMinutes : elapsedMinutes}:${
    elapsedSeconds < 10 ? '0' + elapsedSeconds : elapsedSeconds
  }`;

  // State 1: < 10 min -> Green pastel (On time)
  if (elapsedMinutes < 10) {
    return (
      <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs font-mono">
        <Clock className="w-3.5 h-3.5" />
        <span>⏱️ {formattedTime}</span>
        <span className="text-[10px] uppercase tracking-wider font-sans ml-1 text-emerald-300 hidden sm:inline">
          Dans les temps
        </span>
      </div>
    );
  }

  // State 2: 10 to 20 min -> Yellow Alert
  if (elapsedMinutes < 20) {
    return (
      <div className="bg-amber-950/90 border-2 border-amber-500 text-amber-300 px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/10 font-mono animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        <span>⏱️ {formattedTime}</span>
        <span className="text-[10px] uppercase tracking-wider font-sans ml-1 text-amber-200 hidden sm:inline">
          En préparation
        </span>
      </div>
    );
  }

  // State 3: > 20 min -> Red Blinking (Urgent Delay)
  return (
    <div className="bg-rose-950 border-2 border-rose-500 text-white px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-rose-600/30 font-mono animate-bounce">
      <Flame className="w-4 h-4 text-rose-400 animate-spin" />
      <span className="text-rose-200">⏱️ {formattedTime}</span>
      <span className="text-[10px] uppercase tracking-wider font-sans font-black bg-rose-600 px-1.5 py-0.5 rounded text-white ml-1">
        RETARD PRIORITAIRE
      </span>
    </div>
  );
};