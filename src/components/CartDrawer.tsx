'use client';

import React from 'react';
import { X, Plus, Minus, Trash2, Send, ShoppingBag } from 'lucide-react';
import { CartItem } from '@/types';
import { formatFCFA } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  tableNumber: number;
  customerNote: string;
  onCustomerNoteChange: (note: string) => void;
  onAddItem: (item: CartItem['menuItem']) => void;
  onRemoveItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  tableNumber,
  customerNote,
  onCustomerNoteChange,
  onAddItem,
  onRemoveItem,
  onDeleteItem,
  onClearCart,
  onSubmitOrder,
}) => {
  if (!isOpen) return null;

  const totalPrice = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] max-h-[92vh] flex flex-col justify-between shadow-2xl border-t-4 border-green-600 animate-in slide-in-from-bottom duration-300">
        {/* Pull Bar / Drag Handle for Mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-green-50 text-green-700 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-950">
                Votre Commande
              </h2>
              <span className="text-sm font-extrabold text-green-700">
                🎯 Table {tableNumber < 10 ? `0${tableNumber}` : tableNumber} • {totalCount} article{totalCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[48px] min-w-[48px] p-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Fermer le panier"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <span className="text-5xl block">🛒</span>
              <p className="text-base font-bold text-gray-800">
                Votre panier est encore vide
              </p>
              <p className="text-sm text-gray-500">
                Ajoutez de délicieux plats pour débuter votre commande.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#FFFDFB] p-4 rounded-2xl border border-orange-100 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-black text-gray-950 truncate">
                        {item.menuItem.name}
                      </h4>
                      <span className="text-sm font-extrabold text-green-700 block mt-0.5">
                        {formatFCFA(item.menuItem.price * item.quantity)}
                      </span>
                      {item.customNotes && (
                        <p className="text-xs text-gray-500 italic mt-1 bg-amber-50 p-1.5 rounded-lg">
                          « {item.customNotes} »
                        </p>
                      )}
                    </div>

                    {/* Stepper with 48px buttons */}
                    <div className="flex items-center bg-gray-100 rounded-2xl p-1 gap-1">
                      <button
                        onClick={() => onRemoveItem(item.menuItem.id)}
                        className="min-h-[44px] min-w-[44px] bg-white text-gray-800 rounded-xl flex items-center justify-center font-bold text-lg active:scale-95 transition-transform shadow-sm"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-4 h-4 stroke-[3]" />
                      </button>

                      <span className="font-black text-base text-gray-900 px-2 min-w-[24px] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => onAddItem(item.menuItem)}
                        className="min-h-[44px] min-w-[44px] bg-green-600 text-white rounded-xl flex items-center justify-center font-bold text-lg active:scale-95 transition-transform shadow-sm"
                        aria-label="Ajouter"
                      >
                        <Plus className="w-4 h-4 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Note Input (Font size 16px to prevent iOS auto-zoom) */}
              <div className="pt-2">
                <label className="text-sm font-black text-gray-900 block mb-1.5">
                  Une remarque pour le chef ? (Optionnel)
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => onCustomerNoteChange(e.target.value)}
                  placeholder="Ex: Piment bien fort, servi sans couverts..."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-green-600 rounded-2xl p-3.5 text-base text-gray-900 outline-none shadow-inner transition-all"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer with BIG GREEN BUTTON (56px) */}
        {items.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-base font-bold text-gray-600">Total à régler</span>
              <span className="text-2xl font-black text-gray-950 tracking-tight">
                {formatFCFA(totalPrice)}
              </span>
            </div>

            {/* The Big 56px Green Button */}
            <button
              onClick={onSubmitOrder}
              className="w-full min-h-[56px] bg-green-600 hover:bg-green-700 text-white text-lg font-black rounded-2xl shadow-xl shadow-green-600/30 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Send className="w-5 h-5 stroke-[2.5]" />
              <span>Transmettre ma commande 🚀</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
