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
  Bluetooth,
  Wine,
  Sparkles
} from 'lucide-react';
import { OrderType, OrderStatus } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { OrderTimerBadge } from './OrderTimerBadge';
import { isDrinkOrBarItem, isKitchenDish } from '@/lib/order-routing';
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

  const kitchenItems = order.items.filter(isKitchenDish);
  const barItems = order.items.filter(isDrinkOrBarItem);
  const is100PercentBar = kitchenItems.length === 0;

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
      className={`bg-white rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between shadow-md ${
        is100PercentBar
          ? 'border-blue-300 bg-blue-50/20'
          : order.status === 'PENDING'
          ? 'border-amber-400 shadow-amber-500/10'
          : order.status === 'PREPARING'
          ? 'border-blue-500 shadow-blue-500/10'
          : 'border-slate-200 opacity-85'
      }`}
    >
      {/* 1. Header Box with Table Number, Chrono & Payment */}
      <div
        className={`p-4 flex items-center justify-between gap-2 ${
          is100PercentBar
            ? 'bg-blue-600 text-white'
            : order.status === 'PENDING'
            ? 'bg-amber-500 text-slate-950'
            : order.status === 'PREPARING'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black tracking-tight">
            TABLE {formattedTable}
          </span>
          <span className="text-xs font-mono font-bold bg-black/15 px-2 py-0.5 rounded-md">
            #{order.id.slice(-5).toUpperCase()}
          </span>
        </div>

        {/* Live Dynamic Chrono Badge */}
        <OrderTimerBadge createdAt={order.createdAt} />
      </div>

      {/* 2. Customer details & Payment Badge */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-1.5 truncate">
          {order.customerName ? (
            <span className="text-slate-900 font-bold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-orange-600" />
              <span>{order.customerName}</span>
            </span>
          ) : (
            <span className="text-slate-500 italic">Client à table</span>
          )}
        </div>

        <div className="flex items-center gap-1 font-bold">
          {order.paymentMethod === 'WAVE' ? (
            <span className="text-[#1DA1F2] flex items-center gap-1 font-black">
              <span>🔵</span> <span>Wave</span>
            </span>
          ) : order.paymentMethod === 'ORANGE_MONEY' ? (
            <span className="text-[#FF6B00] flex items-center gap-1 font-black">
              <span>🟠</span> <span>OM</span>
            </span>
          ) : (
            <span className="text-emerald-700 flex items-center gap-1 font-black">
              <Banknote className="w-3.5 h-3.5" />
              <span>Espèces</span>
            </span>
          )}
        </div>
      </div>

      {/* 3. Items List with Quantities in Big Bold (KITCHEN DISHES ONLY) */}
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[320px] bg-white">
        {/* If 100% bar order */}
        {is100PercentBar ? (
          <div className="p-4 bg-blue-50/80 border-2 border-blue-200 rounded-2xl text-center space-y-2">
            <span className="text-3xl block">🥤</span>
            <h4 className="text-sm font-black text-blue-950">Commande 100% Bar / Boissons</h4>
            <p className="text-xs text-blue-800 font-medium">
              Aucun plat à cuire. Transmis directement au comptoir bar & caisse.
            </p>
            <div className="text-xs font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-blue-200 space-y-1 text-left">
              {barItems.map((b, bIdx) => (
                <div key={bIdx} className="flex justify-between">
                  <span className="text-blue-900 font-bold">{b.quantity}x {b.name}</span>
                  <span className="font-mono text-slate-500">{formatFCFA(b.price * b.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Kitchen Dishes List */
          kitchenItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="pb-2.5 border-b border-slate-100 last:border-0 last:pb-0 space-y-1"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className="text-lg sm:text-xl font-black text-amber-600 font-mono shrink-0">
                    {item.quantity}x
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight block truncate">
                      {item.name || item.menuItem?.name || 'Plat commandé'}
                    </span>

                    {/* Options badges */}
                    {item.options && (
                      <div className="flex flex-wrap gap-1 mt-1 text-xs">
                        {item.options.side && (
                          <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200">
                            🍛 {item.options.side}
                          </span>
                        )}
                        {item.options.spiceLevel && (
                          <span className="bg-rose-50 text-rose-800 font-bold px-2 py-0.5 rounded-md border border-rose-200">
                            🌶️ {item.options.spiceLevel}
                          </span>
                        )}
                        {item.options.extras?.map((ex, eIdx) => (
                          <span
                            key={ex.id || eIdx}
                            className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200"
                          >
                            +{ex.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Item Specific Notes */}
                    {item.notes && (
                      <div className="mt-1 bg-amber-50 border border-amber-300 p-1.5 rounded-lg text-xs text-amber-900 font-bold">
                        ⚠️ Note: « {item.notes} »
                      </div>
                    )}
                  </div>
                </div>

                <span className="text-xs text-slate-600 font-mono font-bold shrink-0">
                  {formatFCFA(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Informative Drinks Notice for Mixed Orders */}
        {!is100PercentBar && barItems.length > 0 && (
          <div className="p-2.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-950 min-w-0">
              <span className="text-base shrink-0">🥤</span>
              <span className="truncate">
                {barItems.reduce((s, b) => s + b.quantity, 0)} boisson(s) transmise(s) au bar/caisse :
              </span>
            </div>
            <span className="text-[11px] font-bold text-blue-800 truncate max-w-[150px] shrink-0">
              {barItems.map((b) => `${b.quantity}x ${b.name}`).join(', ')}
            </span>
          </div>
        )}

        {/* Global Kitchen Notes */}
        {(order.customerNote || order.note) && (
          <div className="bg-rose-50 border border-rose-300 p-2.5 rounded-2xl space-y-1">
            <span className="text-[11px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1">
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>Remarque Cuisine :</span>
            </span>
            <p className="text-xs text-rose-950 font-bold leading-relaxed">
              « {order.customerNote || order.note} »
            </p>
          </div>
        )}
      </div>

      {/* 4. Action Buttons Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-medium">
          <span>Total Commande</span>
          <span className="text-sm font-black text-slate-900 font-mono">
            {formatFCFA(order.total)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Print 80mm ESC/POS Button */}
          <button
            type="button"
            onClick={handlePrintThermal}
            className="min-h-[46px] px-3.5 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200 shadow-2xs"
            title="Imprimer ticket 80mm"
          >
            <Printer className="w-4 h-4 text-orange-600" />
            <span className="hidden sm:inline">Ticket 80mm</span>
          </button>

          {/* Status Progression Button */}
          {order.status === 'PENDING' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('PREPARING')}
              className="flex-1 min-h-[46px] bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all"
            >
              <ChefHat className="w-4 h-4" />
              <span>👨‍🍳 {is100PercentBar ? 'Préparer au Bar' : 'Lancer Préparation'}</span>
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