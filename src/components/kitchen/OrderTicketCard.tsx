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
  RotateCcw
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

  const [isReleasingTable, setIsReleasingTable] = useState(false);

  const handleReleaseTable = async () => {
    if (!order.tableNumber) return;
    const confirmRelease = window.confirm(
      `Confirmer la libération de la Table ${formattedTable} ?\nLa table sera marquée comme Libre pour accueillir de nouveaux clients.`
    );
    if (!confirmRelease) return;

    try {
      setIsReleasingTable(true);
      const res = await fetch('/api/tenant/tables/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: (order as any).tenantId || (order as any).restaurantId,
          tableNumber: order.tableNumber,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`🧹 Table ${formattedTable} libérée avec succès (remise en service) !`);
      } else {
        toast.error(data.error || 'Erreur lors de la libération de la table');
      }
    } catch (err) {
      toast.error('Erreur réseau lors de la libération de la table');
    } finally {
      setIsReleasingTable(false);
    }
  };

  const isExpressOrder = order.orderType === 'EXPRESS' || order.tableNumber === 0;

  return (
    <article
      className={`bg-white rounded-3xl overflow-hidden border-2 transition-all flex flex-col justify-between shadow-md ${
        order.status === 'CANCELLED'
          ? 'border-rose-600 bg-rose-50/30 ring-4 ring-rose-500/30'
          : isExpressOrder
          ? 'border-purple-400 bg-purple-50/10'
          : is100PercentBar
          ? 'border-blue-300 bg-blue-50/20'
          : order.status === 'PENDING'
          ? 'border-amber-400 shadow-amber-500/10'
          : order.status === 'PREPARING'
          ? 'border-blue-500 shadow-blue-500/10'
          : order.status === 'READY'
          ? 'border-purple-500 shadow-purple-500/20'
          : 'border-slate-200 opacity-85'
      }`}
    >
      {/* ⚠️ Bannière clignotante rouge si commande annulée par le client */}
      {order.status === 'CANCELLED' && (
        <div className="bg-rose-600 text-white px-3 py-2 text-center text-xs font-black uppercase tracking-wider animate-pulse flex items-center justify-center gap-1.5 shadow-inner">
          <span>⚠️</span>
          <span>COMMANDE ANNULÉE PAR LE CLIENT — NE PAS PRÉPARER</span>
        </div>
      )}

      {/* 1. Header Box with Table Number, Chrono & Payment */}
      <div
        className={`p-4 flex items-center justify-between gap-2 ${
          order.status === 'CANCELLED'
            ? 'bg-rose-950 text-white'
            : isExpressOrder
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
            <span>{isExpressOrder ? '⚡ EXPRESS' : (order.locationDetail ? order.locationDetail : `TABLE ${formattedTable}`)}</span>
            {order.zoneId && <span className="text-[10px] text-white/80 font-normal mt-0.5">ZONE ID: {order.zoneId}</span>}
          </span>
          <span className="text-xs font-mono font-bold bg-black/15 px-2 py-0.5 rounded-md">
            #{order.id.slice(-5).toUpperCase()}
          </span>
        </div>

        {/* Live Dynamic Chrono Badge */}
        <OrderTimerBadge createdAt={order.createdAt} />
      </div>

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

          {/* Quick Release Table Action for Tables */}
          {!isExpressOrder && order.tableNumber > 0 && (
            <button
              type="button"
              onClick={handleReleaseTable}
              disabled={isReleasingTable}
              className="min-h-[46px] px-3 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 text-slate-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-200 shadow-2xs cursor-pointer"
              title={`Libérer la Table ${formattedTable} (remise en service immédiate)`}
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Libérer Table</span>
            </button>
          )}

          {/* Status Progression Button */}
          {order.status === 'CANCELLED' && (
            <div className="flex-1 min-h-[46px] bg-rose-100 border-2 border-rose-400 text-rose-950 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2">
              <span>🛑 Annulée dans les délais</span>
            </div>
          )}

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
              onClick={() => handleStatusChange('READY')}
              className="flex-1 min-h-[46px] bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
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
              className="flex-1 min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
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