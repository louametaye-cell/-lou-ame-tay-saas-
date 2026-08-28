'use client';

import React, { useState } from 'react';
import { 
  Printer, 
  ChefHat, 
  CheckCircle2, 
  User, 
  Banknote, 
  CreditCard, 
  Smartphone, 
  MessageSquareQuote, 
  Bluetooth 
} from 'lucide-react';
import { OrderType, OrderStatus } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { OrderTimerBadge } from './OrderTimerBadge';
import { EscPosPrinterService } from '@/services/EscPosPrinterService';
import { toast } from 'sonner';

interface OrderTicketCardProps {
  order: OrderType;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<any>;
  restaurantName?: string;
}

export const OrderTicketCard: React.FC<OrderTicketCardProps> = ({
  order,
  onUpdateStatus,
  restaurantName = 'Chez Fatou & Frères',
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBluetoothPrinting, setIsBluetoothPrinting] = useState(false);

  const formattedTable =
    order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    await onUpdateStatus(order.id, newStatus);
    setIsUpdating(false);
  };

  const handlePrintThermal = () => {
    EscPosPrinterService.printViaWindowFallback(order, restaurantName);
    toast.success(`🖨️ Ticket Table ${formattedTable} imprimé !`);
  };

  const handlePrintBluetooth = async () => {
    setIsBluetoothPrinting(true);
    const success = await EscPosPrinterService.printViaBluetooth(order, restaurantName);
    setIsBluetoothPrinting(false);
    if (success) {
      toast.success('🖨️ Impression Bluetooth ESC/POS réussie !');
    }
  };

  return (
    <article
      className={`bg-slate-900 rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between shadow-xl ${
        order.status === 'PENDING'
          ? 'border-amber-400 shadow-amber-500/10'
          : order.status === 'PREPARING'
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : 'border-slate-700 opacity-75'
      }`}
    >
      {/* 1. Header Box with Table Number, Chrono & Payment */}
      <div
        className={`p-4 flex items-center justify-between gap-2 ${
          order.status === 'PENDING'
            ? 'bg-amber-500 text-slate-950'
            : order.status === 'PREPARING'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black tracking-tight">
            TABLE {formattedTable}
          </span>
          <span className="text-xs font-mono font-bold bg-black/25 px-2 py-0.5 rounded-md">
            #{order.id.slice(-5).toUpperCase()}
          </span>
        </div>

        {/* Live Dynamic Chrono Badge */}
        <OrderTimerBadge createdAt={order.createdAt} />
      </div>

      {/* 2. Customer details & Payment Badge */}
      <div className="px-4 py-2 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate">
          {order.customerName ? (
            <span className="text-slate-200 font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-orange-400" />
              <span>{order.customerName}</span>
            </span>
          ) : (
            <span className="text-slate-500 italic">Client à table</span>
          )}
        </div>

        <div className="flex items-center gap-1 font-bold text-slate-300">
          {order.paymentMethod === 'WAVE' ? (
            <span className="text-[#1DA1F2] flex items-center gap-1 font-black">
              <span>🔵</span> <span>Wave</span>
            </span>
          ) : order.paymentMethod === 'ORANGE_MONEY' ? (
            <span className="text-[#FF6B00] flex items-center gap-1 font-black">
              <span>🟠</span> <span>OM</span>
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5" />
              <span>Espèces</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Items List with Quantities in Big Bold */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[300px]">
        {order.items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="pb-2.5 border-b border-slate-800/80 last:border-0 last:pb-0 space-y-1"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <span className="text-lg sm:text-xl font-black text-amber-400 font-mono shrink-0">
                  {item.quantity}x
                </span>
                <div className="min-w-0 flex-1">
                  <span className="text-sm sm:text-base font-extrabold text-white leading-tight block truncate">
                    {item.name || item.menuItem?.name || 'Plat commandé'}
                  </span>

                  {/* Options badges */}
                  {item.options && (
                    <div className="flex flex-wrap gap-1 mt-1 text-xs">
                      {item.options.side && (
                        <span className="bg-slate-800 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-slate-700">
                          🍛 {item.options.side}
                        </span>
                      )}
                      {item.options.spiceLevel && (
                        <span className="bg-rose-950/80 text-rose-300 font-bold px-2 py-0.5 rounded-md border border-rose-800/80">
                          🌶️ {item.options.spiceLevel}
                        </span>
                      )}
                      {item.options.extras?.map((ex, eIdx) => (
                        <span
                          key={ex.id || eIdx}
                          className="bg-emerald-950/80 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-800/80"
                        >
                          +{ex.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Item Specific Notes */}
                  {item.notes && (
                    <div className="mt-1 bg-amber-950/40 border border-amber-500/30 p-1.5 rounded-lg text-xs text-amber-300 font-bold">
                      ⚠️ Note: « {item.notes} »
                    </div>
                  )}
                </div>
              </div>

              <span className="text-xs text-slate-400 font-mono font-bold shrink-0">
                {formatFCFA(item.price * item.quantity)}
              </span>
            </div>
          </div>
        ))}

        {/* Global Kitchen Notes */}
        {(order.customerNote || order.note) && (
          <div className="bg-rose-950/40 border border-rose-500/40 p-2.5 rounded-2xl space-y-1">
            <span className="text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Remarque Cuisine :</span>
            </span>
            <p className="text-xs text-rose-200 font-bold leading-relaxed">
              « {order.customerNote || order.note} »
            </p>
          </div>
        )}
      </div>

      {/* 4. Action Buttons Footer */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Total Commande</span>
          <span className="text-sm font-black text-white font-mono">
            {formatFCFA(order.total)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Print 80mm ESC/POS Button */}
          <button
            type="button"
            onClick={handlePrintThermal}
            className="min-h-[46px] px-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700"
            title="Imprimer ticket 80mm"
          >
            <Printer className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Ticket 80mm</span>
          </button>

          {/* Status Progression Button */}
          {order.status === 'PENDING' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('PREPARING')}
              className="flex-1 min-h-[46px] bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all"
            >
              <ChefHat className="w-4 h-4" />
              <span>👨‍🍳 Lancer Préparation</span>
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('SERVED')}
              className="flex-1 min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>✅ Prête / Servie</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};