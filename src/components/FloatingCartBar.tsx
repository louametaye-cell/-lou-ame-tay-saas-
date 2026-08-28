'use client';

import React from 'react';
import { formatFCFA } from '@/lib/utils';

interface FloatingCartBarProps {
  totalCount: number;
  totalPrice: number;
  tableNumber: number;
  onOpenCart: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  totalCount,
  totalPrice,
  onOpenCart,
}) => {
  if (totalCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-4 border-green-600 shadow-2xl z-40 animate-in slide-in-from-bottom duration-300">
      <button
        onClick={onOpenCart}
        className="w-full min-h-[56px] bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg"
      >
        <span>🛒 Voir mon panier ({totalCount}) - {formatFCFA(totalPrice)}</span>
      </button>
    </div>
  );
};
