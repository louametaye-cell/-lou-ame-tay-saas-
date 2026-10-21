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
  Wine
} from 'lucide-react';
import { OrderType, OrderStatus } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { OrderTimerBadge } from './OrderTimerBadge';
import { isDrinkOrBarItem, isKitchenDish } from '@/lib/order-routing';
import { getAssignedServerForTable } from '@/lib/server-shift';
import { EscPosPrinterService } from '@/services/EscPosPrinterService';
import { toast } from 'sonner';

interface OrderTicketCardProps {
  order: OrderType;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<any>;
  restaurantName?: string;
}

// ⚠️ ATTENTION RÈGLE MÉTIER INVIOLABLE (ANTI-RÉGRESSION) :
// ⚠️ ATTENTION : NE JAMAIS LIBÉRER LA TABLE ICI. La libération se fait UNIQUEMENT dans /api/cashier/orders/[id]/pay/route.ts
// Le KDS Cuisine gère uniquement le statut opérationnel de préparation (PREPARING, READY, SERVED).
export const OrderTicketCard: React.FC<OrderTicketCardProps> = ({
  order,
  onUpdateStatus,
  restaurantName = 'Lou Ame Tay ?',
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

  const isExpressOrder = order.orderType === 'EXPRESS' || order.orderType === 'TAKEAWAY' || order.tableNumber === 0;

  // 🚨 RÈGLE TERRAIN SÉNÉGAL (Alerte Visuelle KDS) : si commande > 15 min en cuisine, clignotement rouge vigoureux
  const orderAgeMinutes = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60);
  const isDelayed = order.status !== 'SERVED' && order.status !== 'CANCELLED' && orderAgeMinutes >= 15;

  // Détermination de l'origine exacte (Mission 6 KDS)
  const isRoom = order.orderOrigin === 'ROOM' || order.spaceType === 'ROOM' || (order.locationDetail && order.locationDetail.toLowerCase().includes('chambre'));
  const isCounter = order.orderOrigin === 'COUNTER' || isExpressOrder;

  let displayOrigin = `TABLE ${formattedTable}`;
  if (isRoom) {
    displayOrigin = (order.locationDetail || `CHAMBRE ${formattedTable} — ROOM SERVICE`).toUpperCase();
  } else if (isCounter) {
    displayOrigin = 'À EMPORTER / COMPTOIR';
  }

  return (
    <article
      className={`rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between shadow-md ${
        order.status === 'CANCELLED'
          ? 'border-rose-600 bg-rose-50/30 ring-4 ring-rose-500/30'
          : isDelayed
          ? 'animate-pulse bg-red-100 border-red-500 ring-4 ring-red-500/50 shadow-red-500/20'
          : isRoom
          ? 'bg-white border-purple-500 ring-2 ring-purple-500/20'
          : isCounter
          ? 'bg-white border-amber-400 ring-2 ring-amber-400/20'
          : is100PercentBar
          ? 'bg-white border-blue-300'
          : order.status === 'PENDING'
          ? 'bg-white border-amber-400 shadow-amber-500/10'
          : order.status === 'PREPARING'
          ? 'bg-white border-blue-500 shadow-blue-500/10'
          : order.status === 'READY'
          ? 'bg-white border-purple-500 shadow-purple-500/20'
          : 'bg-white border-slate-200 opacity-85'
      }`}
    >
      {/* ⚠️ Bannière clignotante rouge si commande annulée par le client */}
      {order.status === 'CANCELLED' && (
        <div className="bg-rose-600 text-white px-3 py-2 text-center text-xs font-black uppercase tracking-wider animate-pulse flex items-center justify-center gap-1.5 shadow-inner">
          <span>⚠️</span>
          <span>COMMANDE ANNULÉE PAR LE CLIENT — NE PAS PRÉPARER</span>
        </div>
      )}

      {/* 🚨 Bannière d'alerte visuelle retard cuisine > 15 min (Terrain Sénégal) */}
      {isDelayed && order.status !== 'CANCELLED' && (
        <div className="bg-red-600 text-white px-3 py-2 text-center text-xs font-black uppercase tracking-wider animate-pulse flex items-center justify-center gap-2 shadow-md">
          <span>🚨</span>
          <span>RETARD CUISINE (&gt; 15 MIN) — ACTION URGENTE</span>
          <span>🚨</span>
        </div>
      )}

      {/* 1. Header Box with Origin (Table / Room / Counter), Chrono & Order ID */}
      <div
        className={`p-4 flex items-center justify-between gap-2 ${
          order.status === 'CANCELLED'
            ? 'bg-rose-950 text-white'
            : isDelayed
            ? 'bg-red-600 text-white'
            : isRoom
            ? 'bg-purple-900 text-white'
            : isCounter
            ? 'bg-slate-900 text-amber-400'
            : is100PercentBar
            ? 'bg-blue-600 text-white'
            : order.status === 'PENDING'
            ? 'bg-amber-500 text-slate-950'
            : order.status === 'PREPARING'
            ? 'bg-blue-600 text-white'
            : order.status === 'READY'
            ? 'bg-purple-700 text-white'
            : 'bg-slate-100 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black tracking-tight flex flex-col leading-tight">
            <span className="font-black uppercase tracking-wide flex items-center gap-1.5">
              {isRoom && <span>🛎️</span>}
              {isCounter && <span>🥡</span>}
              {!isRoom && !isCounter && <span>🍽️</span>}
              <span>{displayOrigin}</span>
            </span>
            {isRoom && (
              <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-md mt-1 self-start inline-flex items-center gap-1 shadow-2xs">
                🛎️ Room Service Chambre
              </span>
            )}
            {order.destinationService && !isRoom && (
              <span className="text-[11px] font-black uppercase tracking-wider bg-black/25 text-white px-2 py-0.5 rounded-md mt-1 self-start inline-flex items-center gap-1 shadow-2xs">
                {order.destinationService === 'BAR' && '🍹 Service Bar'}
                {order.destinationService === 'KITCHEN' && '🍳 Cuisine'}
              </span>
            )}
            {order.zoneId && <span className="text-[10px] text-white/80 font-normal mt-0.5">ZONE ID: {order.zoneId}</span>}
          </span>
          <span className="text-xs font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md">
            #{order.id.slice(-5).toUpperCase()}
          </span>
        </div>

        {/* Live Dynamic Chrono Badge */}
        <OrderTimerBadge createdAt={order.createdAt} />
      </div>

      {/* 👤 BADGE REPAS DU PERSONNEL (NP) */}
      {(order.paymentMethod === 'STAFF_MEAL' || (order as any).employeeName) && (
        <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white px-3 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-inner border-y border-purple-400/50">
          <div className="flex items-center gap-2">
            <span className="text-base">👤</span>
            <span>REPAS EMPLOYÉ : {((order as any).employeeName || order.customerName || 'Staff').toUpperCase()}</span>
          </div>
          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
            BON NP
          </span>
        </div>
      )}

      {/* 🥡 BADGE KDS TRÈS VISIBLE : COMMANDE À EMPORTER / COMPTOIR */}
      {(order.orderType === 'TAKEAWAY' || order.orderType === 'EXPRESS' || order.tableNumber === 0) && (
        <div className="bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-inner border-y-2 border-amber-500">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥡</span>
            <span className="font-black text-xs sm:text-sm tracking-tight">À EMPORTER / COMPTOIR</span>
          </div>
          <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-400/40">
            NE PAS SERVIR EN SALLE
          </span>
        </div>
      )}

      {/* ⚠️ AVERTISSEMENTS CROSS-STATION (CUISINE <-> BAR) */}
      {((order as any).hasBarItems || (order as any).crossStationWarning?.includes('boissons')) && (
        <div className="bg-blue-600 text-white px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-xs border-y border-blue-700 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="font-black tracking-wide">Contient des boissons (Voir Bar)</span>
          </div>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            BAR
          </span>
        </div>
      )}

      {((order as any).hasKitchenItems || (order as any).crossStationWarning?.includes('nourriture')) && (
        <div className="bg-amber-600 text-white px-3.5 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-xs border-y border-amber-700 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span className="font-black tracking-wide">Contient de la nourriture (Voir Cuisine)</span>
          </div>
          <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            CUISINE
          </span>
        </div>
      )}

      {/* 2. Customer details & Assigned Waiter & Payment Badge */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs text-slate-600 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {order.customerName ? (
            <span className="text-slate-900 font-extrabold flex items-center gap-1 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
              <User className="w-3.5 h-3.5 text-orange-600" />
              <span>{order.customerName}</span>
            </span>
          ) : (
            <span className="text-slate-500 italic text-[11px]">
              {isExpressOrder ? 'Client Express' : 'Client à table'}
            </span>
          )}

          <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg border ${
            isExpressOrder
              ? 'bg-purple-100 text-purple-900 border-purple-300'
              : 'bg-amber-100/90 text-slate-800 border-amber-300'
          }`}>
            {isExpressOrder ? '⚡ Guichet Caisse' : `👤 ${order.waiter?.name || getAssignedServerForTable(order.tableNumber)}`}
          </span>
        </div>

        {/* 💳 Statut Financier & Paiements Partiels (KDS) */}
        {(() => {
          const totalAmount = Number(order.totalAmount ?? order.total ?? 0);
          const paidAmount = Number(order.paidAmount ?? order.amountReceived ?? (order as any).paid_amount ?? 0);
          const remainingAmount = Math.max(0, totalAmount - paidAmount);
          const isPaid = order.paymentStatus === 'PAID';
          const hasPartialPayment = !isPaid && paidAmount > 0 && remainingAmount > 0;

          if (order.paymentMethod === 'STAFF_MEAL' || order.paymentStatus === 'STAFF_NP') {
            return (
              <span className="bg-purple-100 text-purple-950 border border-purple-400 text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                <span>👤 BON NP</span>
              </span>
            );
          }

          if (isPaid) {
            return (
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                <span>PAYÉ ✅</span>
              </span>
            );
          }

          if (hasPartialPayment) {
            return (
              <span className="bg-yellow-100 text-yellow-950 border border-yellow-400 text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
                <Banknote className="w-3.5 h-3.5 text-yellow-700" />
                <span>PAIEMENT PARTIEL - Reste {formatFCFA(remainingAmount)}</span>
              </span>
            );
          }

          return (
            <span className="bg-orange-100 text-orange-950 border border-orange-300 text-[11px] font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs">
              <Banknote className="w-3.5 h-3.5 text-orange-700" />
              <span>NON PAYÉ</span>
            </span>
          );
        })()}
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
          <span>Contenu de la commande</span>
          <span className="text-xs font-bold text-slate-800">
            {order.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) || 0} plat(s)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Print 80mm ESC/POS Button */}
          <button
            type="button"
            onClick={handlePrintThermal}
            className="min-h-[48px] px-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200 shadow-2xs touch-manipulation"
            title="Imprimer ticket 80mm"
          >
            <Printer className="w-4 h-4 text-orange-600" />
            <span className="hidden sm:inline">80mm</span>
          </button>

          {/* Fallback Impression PDF */}
          <button
            type="button"
            onClick={() => {
              EscPosPrinterService.printAsPdf(order, restaurantName);
              toast.success(`📄 Ticket PDF généré pour la Table ${formattedTable}`);
            }}
            className="min-h-[48px] px-3 bg-white hover:bg-emerald-50 text-emerald-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-emerald-200 shadow-2xs touch-manipulation cursor-pointer"
            title="Imprimer en PDF (Fallback)"
          >
            <span>PDF</span>
          </button>

          {/* Status Progression Button */}
          {order.status === 'CANCELLED' && (
            <div className="flex-1 min-h-[48px] bg-rose-100 border-2 border-rose-400 text-rose-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2">
              <span>🛑 Annulée dans les délais</span>
            </div>
          )}

          {order.status === 'PENDING' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('PREPARING')}
              className="flex-1 min-h-[48px] bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all touch-manipulation"
            >
              <ChefHat className="w-4 h-4" />
              <span>👨‍🍳 {is100PercentBar ? 'Préparer au Bar' : 'Lancer Préparation'}</span>
            </button>
          )}

          {order.status === 'PREPARING' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('READY')}
              className="flex-1 min-h-[48px] bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer touch-manipulation"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>📦 Commande Prête</span>
            </button>
          )}

          {order.status === 'READY' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange('SERVED')}
              className="flex-1 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer touch-manipulation"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              <span>🍽️ {isExpressOrder ? 'Remise au Client' : 'Servie à Table'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};