'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Flame, 
  Check, 
  Play, 
  Printer, 
  AlertTriangle, 
  Banknote, 
  MessageSquare, 
  CheckCircle2, 
  User, 
  Sparkles 
} from 'lucide-react';
import { OrderType, OrderStatus } from '@/types';
import { formatFCFA } from '@/lib/utils';

interface OrderTicketCardProps {
  order: OrderType;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  restaurantName?: string;
}

export const OrderTicketCard: React.FC<OrderTicketCardProps> = ({
  order,
  onUpdateStatus,
  restaurantName = 'Chez Fatou & Frères',
}) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Compute live elapsed timer
  useEffect(() => {
    const updateTimer = () => {
      const created = new Date(order.createdAt).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - created);
      const totalSec = Math.floor(diffMs / 1000);
      setElapsedMinutes(Math.floor(totalSec / 60));
      setElapsedSeconds(totalSec % 60);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const formattedMinutes = String(elapsedMinutes).padStart(2, '0');
  const formattedSeconds = String(elapsedSeconds).padStart(2, '0');

  // Urgency thresholds
  const isUrgent = elapsedMinutes >= 15 && elapsedMinutes < 25;
  const isCritical = elapsedMinutes >= 25;

  const formattedTable =
    order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber;

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setIsUpdating(true);
    await onUpdateStatus(order.id, newStatus);
    setIsUpdating(false);
  };

  // Thermal 80mm ESC/POS Print
  const handlePrintThermal = () => {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) return;

    const itemsHtml = order.items
      .map(
        (i) => `
        <div style="margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px dashed #ccc;">
          <div style="font-weight: 900; font-size: 16px;">${i.quantity}x ${i.menuItem.name}</div>
          ${i.notes ? `<div style="font-size: 13px; font-weight: bold; color: #d00;">⚠️ NOTE: ${i.notes}</div>` : ''}
          <div style="font-size: 12px; color: #555; text-align: right;">${i.price * i.quantity} FCFA</div>
        </div>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket Cuisine - Table ${formattedTable}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Courier New', monospace;
              width: 76mm;
              margin: 0 auto;
              padding: 10px 4px;
              color: #000;
              font-size: 14px;
              line-height: 1.3;
            }
            .center { text-align: center; }
            .bold { font-weight: 900; }
            .divider { border-top: 2px dashed #000; margin: 8px 0; }
            .header-box { border: 2px solid #000; padding: 6px; text-align: center; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 18px;">LOU AME TAY ?</div>
          <div class="center" style="font-size: 12px;">${restaurantName}</div>
          <div class="divider"></div>

          <div class="header-box">
            <div style="font-size: 24px; font-weight: 900;">TABLE ${formattedTable}</div>
            <div style="font-size: 12px;">CMD #${order.id.slice(-6).toUpperCase()}</div>
          </div>

          <div style="font-size: 11px;">
            <div>DATE : ${new Date(order.createdAt).toLocaleDateString('fr-FR')} ${new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            ${order.customerName ? `<div>CLIENT : ${order.customerName}</div>` : ''}
            <div>PAIEMENT : ${order.paymentMethod || 'Espèces / TPE'}</div>
          </div>

          <div class="divider"></div>
          <div class="bold" style="font-size: 13px; margin-bottom: 4px;">COMMANDE CUISINE :</div>
          ${itemsHtml}

          ${
            order.customerNote
              ? `
            <div class="divider"></div>
            <div style="background: #eee; padding: 4px; font-weight: bold; font-size: 12px;">
              REMARQUE : ${order.customerNote}
            </div>
          `
              : ''
          }

          <div class="divider"></div>
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900;">
            <span>TOTAL :</span>
            <span>${order.total} FCFA</span>
          </div>
          <div class="divider"></div>
          <div class="center" style="font-size: 11px; margin-top: 10px;">
            - Fin de ticket -
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Status Styling for Card Border & Header
  const statusBorderClass =
    order.status === 'PENDING'
      ? isCritical
        ? 'border-rose-500 ring-4 ring-rose-500/40 shadow-rose-500/20'
        : isUrgent
        ? 'border-amber-400 ring-2 ring-amber-400/40'
        : 'border-amber-400/80 shadow-amber-500/10'
      : order.status === 'PREPARING'
      ? 'border-blue-500 ring-2 ring-blue-500/30'
      : 'border-slate-700 opacity-75';

  return (
    <article
      className={`bg-slate-900 rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between shadow-xl ${statusBorderClass}`}
    >
      {/* 1. Header Box with Table Number, Chrono & Payment */}
      <div
        className={`p-4 flex items-center justify-between gap-2 ${
          order.status === 'PENDING'
            ? isCritical
              ? 'bg-rose-900/90 text-white animate-pulse'
              : isUrgent
              ? 'bg-amber-600 text-slate-950'
              : 'bg-amber-500 text-slate-950'
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
        <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-black bg-black/30 px-2.5 py-1 rounded-xl">
          {isCritical ? (
            <Flame className="w-4 h-4 text-white animate-bounce" />
          ) : (
            <Clock className="w-4 h-4" />
          )}
          <span>{formattedMinutes}:{formattedSeconds}</span>
        </div>
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

        <div className="flex items-center gap-1 font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
          <Banknote className="w-3 h-3 text-emerald-400" />
          <span>{order.paymentMethod || 'Espèces / TPE'}</span>
        </div>
      </div>

      {/* 3. Ordered Dishes List */}
      <div className="p-4 flex-1 space-y-3">
        {order.items.map((item, idx) => {
          return (
            <div
              key={idx}
              className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-black text-amber-400 shrink-0">
                    {item.quantity}x
                  </span>
                  <span className="text-sm sm:text-base font-black text-white leading-snug">
                    {item.menuItem.name}
                  </span>
                </div>
              </div>

              {/* Special options (Sides, spice, etc.) */}
              {item.notes && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-2 rounded-xl text-xs font-bold text-amber-300 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item.notes}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Global Kitchen Note */}
        {order.customerNote && (
          <div className="bg-rose-950/40 border border-rose-800/80 p-3 rounded-2xl text-xs font-bold text-rose-200 space-y-0.5">
            <span className="text-[10px] text-rose-400 uppercase tracking-wider block font-black">
              ⚠️ Consigne Générale Cuisine :
            </span>
            <p className="italic text-rose-100">« {order.customerNote} »</p>
          </div>
        )}
      </div>

      {/* 4. Total Amount & Touch Action Buttons (min 52px) */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Montant Total :</span>
          <span className="text-base font-black text-white font-mono">
            {formatFCFA(order.total)}
          </span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2">
          {order.status === 'PENDING' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('PREPARING')}
              className="flex-1 min-h-[52px] bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Lancer Préparation</span>
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('SERVED')}
              className="flex-1 min-h-[52px] bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Prête / Servie</span>
            </button>
          )}

          {order.status === 'SERVED' && (
            <div className="flex-1 min-h-[48px] bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Commande Servie</span>
            </div>
          )}

          {/* 80mm ESC/POS Thermal Print Button */}
          <button
            type="button"
            onClick={handlePrintThermal}
            className="min-h-[52px] min-w-[52px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-2xl flex items-center justify-center transition-all border border-slate-700 shadow-xs"
            title="Imprimer Ticket 80mm"
            aria-label="Imprimer Ticket"
          >
            <Printer className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  );
};
