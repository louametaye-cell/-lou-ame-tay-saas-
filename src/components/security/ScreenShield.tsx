'use client';

import React from 'react';
import { useScreenshotShield } from '@/hooks/use-screenshot-shield';

interface Props {
  children: React.ReactNode;
  userRole?: 'SUPER_ADMIN' | 'RESTAURANT_ADMIN' | 'KITCHEN_STAFF' | 'CASHIER' | 'CUSTOMER';
  isQrZone?: boolean;
  className?: string;
}

export function ScreenShield({
  children,
  userRole = 'CUSTOMER',
  isQrZone = false,
  className = '',
}: Props) {
  const isLocked =
    userRole === 'SUPER_ADMIN'
      ? false
      : userRole === 'RESTAURANT_ADMIN'
      ? isQrZone
      : true;

  const { blurred } = useScreenshotShield(isLocked);

  return (
    <div
      className={`relative w-full h-full select-none ${
        isLocked ? 'print:hidden' : ''
      } ${className}`}
    >
      {blurred && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-3xl text-white p-4 animate-in fade-in duration-200">
          <p className="text-lg font-semibold text-center border border-red-500 bg-red-950/60 p-6 rounded-xl shadow-2xl">
            Merci de respecter le secret d&apos;entreprise lou ame tay
          </p>
        </div>
      )}
      <div className={blurred ? 'blur-2xl opacity-0 pointer-events-none' : ''}>
        {children}
      </div>
    </div>
  );
}

export default ScreenShield;
