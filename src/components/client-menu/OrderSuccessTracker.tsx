'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ChefHat, 
  Utensils, 
  ArrowRight, 
  X, 
  Receipt, 
  Clock, 
  Bell, 
  CreditCard, 
  Plus, 
  MapPin,
  Zap,
  Banknote,
  Smartphone,
  Check,
  Leaf,
  MessageCircle,
  Download,
  Star,
  XCircle,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { OrderType, Language, CurrencyCode, ExchangeRates } from '@/types';
import { formatFCFA, formatConvertedPrice, playOrderSound } from '@/lib/utils';
import { getUIText } from '@/lib/translation-engine';
import { getAssignedServerForTable } from '@/lib/server-shift';
import { toast } from 'sonner';

interface OrderSuccessTrackerProps {
  order: OrderType | null;
  sessionOrders?: OrderType[];
  isOpen: boolean;
  onClose: () => void;
  onOrderMore: () => void;
  onPayOnline?: (totalAmount: number) => void;
  onCallWaiter?: () => void;
  onStartNewMeal?: () => void;
  onOrderCancelled?: (orderId: string) => void;
  lang?: Language;
  currency?: CurrencyCode;
  exchangeRates?: ExchangeRates;
  restaurantName?: string;
  restaurantSlug?: string;
  googleReviewUrl?: string;
}

export const OrderSuccessTracker: React.FC<OrderSuccessTrackerProps> = ({
  order,
  sessionOrders = [],
  isOpen,
  onClose,
  onOrderMore,
  onPayOnline,
  onCallWaiter,
  onStartNewMeal,
  onOrderCancelled,
  lang = 'FR',
  currency = 'FCFA',
  exchangeRates,
  restaurantName = 'Lou Ame Tay ?',
  restaurantSlug,
  googleReviewUrl,
}) => {
  const currentOrder = order || (sessionOrders && sessionOrders.length > 0 ? sessionOrders[sessionOrders.length - 1] : null);

  // 🔒 Cancellation States (100% Inline — Zéro popup, Zéro modal)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState(false);
  const [isCancelledLocally, setIsCancelledLocally] = useState<boolean>(() => currentOrder?.status === 'CANCELLED');

  useEffect(() => {
    if (currentOrder?.status === 'CANCELLED') {
      setIsCancelledLocally(true);
    }
  }, [currentOrder?.status]);

  const isOrderCancelled = isCancelledLocally || currentOrder?.status === 'CANCELLED';

  // ⏱️ Chrono d'annulation : 120s strictes basées sur createdAt en base de données
  const calculateCancelSeconds = () => {
    if (!currentOrder?.createdAt || currentOrder.status !== 'PENDING' || isOrderCancelled) return 0;
    const createdTime = new Date(currentOrder.createdAt).getTime();
    if (isNaN(createdTime)) return 0;
    const elapsed = Math.floor((Date.now() - createdTime) / 1000);
    return Math.max(0, 120 - elapsed);
  };

  const [cancelSecondsRemaining, setCancelSecondsRemaining] = useState<number>(calculateCancelSeconds);

  useEffect(() => {
    setCancelSecondsRemaining(calculateCancelSeconds());
  }, [currentOrder?.createdAt, currentOrder?.status, isOrderCancelled]);

  useEffect(() => {
    if (!isOpen || currentOrder?.status !== 'PENDING' || isOrderCancelled) {
      setCancelSecondsRemaining(0);
      return;
    }
    const interval = setInterval(() => {
      const remaining = calculateCancelSeconds();
      setCancelSecondsRemaining(remaining);
      if (remaining <= 0) {
        setIsConfirmingCancel(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, currentOrder?.createdAt, currentOrder?.status, isOrderCancelled]);

  // Le bouton disparaît immédiatement si la cuisine passe à 'PREPARING' (status !== 'PENDING')
  // ou si les 120 secondes sont écoulées
  const canCancel =
    Boolean(currentOrder) &&
    currentOrder?.status === 'PENDING' &&
    !isOrderCancelled &&
    cancelSecondsRemaining > 0;

  const cancelMinutes = Math.floor(cancelSecondsRemaining / 60);
  const cancelSecs = cancelSecondsRemaining % 60;
  const formattedCancelTime = `${cancelMinutes}:${cancelSecs < 10 ? '0' + cancelSecs : cancelSecs} restantes`;

  const handleConfirmCancel = async () => {
    if (!currentOrder?.id) return;
    try {
      setIsCancellingOrder(true);
      const res = await fetch(`/api/orders/${currentOrder.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsCancelledLocally(true);
        setIsConfirmingCancel(false);
        toast.success('Commande annulée ✓', {
          description: 'Votre commande a été retirée et aucun montant n\'est dû.',
        });
        onOrderCancelled?.(currentOrder.id);
      } else {
        toast.error(data.error || "Impossible d'annuler la commande");
        setIsConfirmingCancel(false);
      }
    } catch (err) {
      toast.error('Erreur de communication lors de l\'annulation');
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const getOrderTotal = (o: any): number => {
    if (!o) return 0;
    if (o.total !== undefined && o.total !== null && !isNaN(Number(o.total)) && Number(o.total) > 0) {
      return Number(o.total);
    }
    if (o.totalAmount !== undefined && o.totalAmount !== null && !isNaN(Number(o.totalAmount)) && Number(o.totalAmount) > 0) {
      return Number(o.totalAmount);
    }
    if (Array.isArray(o.items) && o.items.length > 0) {
      return o.items.reduce((s: number, i: any) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    }
    return 0;
  };

  // Accumulated orders for this table session
  const allOrders = sessionOrders.length > 0 ? sessionOrders : order ? [order] : [];

  // 🔒 EXCLUSION STRICTE DES COMMANDES ANNULÉES DES TOTAUX FINANCIERS (Règle 10.4)
  const nonCancelledOrders = allOrders.filter(
    (o) => o.status !== 'CANCELLED' && (!isCancelledLocally || o.id !== currentOrder?.id)
  );
  const totalBalance = nonCancelledOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);

  // Décomposition financière réelle de la table
  const paidOrders = nonCancelledOrders.filter((o: any) => o.paymentStatus === 'PAID');
  const unpaidOrders = nonCancelledOrders.filter((o: any) => o.paymentStatus !== 'PAID');
  const totalPaid = paidOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const remainingBalance = Math.max(0, totalBalance - totalPaid);
  const isEntirelyPaid = nonCancelledOrders.length > 0 && unpaidOrders.length === 0 && totalPaid > 0;
  const isPartiallyPaid = totalPaid > 0 && remainingBalance > 0;

  // Derive latest live status from backend
  const activeStatus = order?.status || (sessionOrders.length > 0 ? sessionOrders[sessionOrders.length - 1].status : 'PENDING');
  
  // Current Step: 1 = PENDING, 2 = PREPARING, 3 = READY, 4 = SERVED
  const currentStep: 1 | 2 | 3 | 4 = 
    activeStatus === 'SERVED' 
      ? 4 
      : activeStatus === 'READY' 
      ? 3 
      : activeStatus === 'PREPARING' 
      ? 2 
      : 1;

  // Live Countdown state (12 min = 720 sec)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(720);
  const [billRequested, setBillRequested] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playOrderSound();
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#059669', '#ea580c', '#f59e0b', '#2563eb'],
        });
      } catch (err) {}
    }
  }, [isOpen]);

  // Trigger confetti when order transitions to SERVED
  useEffect(() => {
    if (currentStep === 4 && isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
        });
      } catch (err) {}
    }
  }, [currentStep, isOpen]);

  // Countdown timer effect (only active when not yet ready or served)
  useEffect(() => {
    if (!isOpen || currentStep >= 3) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, currentStep]);

  if (!isOpen || !currentOrder) return null;

  const t = getUIText(lang);
  const isExpress = currentOrder.orderType === 'EXPRESS' || currentOrder.tableNumber === 0;
  const formattedTable = isExpress ? 'Comptoir' : currentOrder.tableNumber < 10 ? `0${currentOrder.tableNumber}` : currentOrder.tableNumber;
  const serverName = isExpress ? 'Guichet Caisse' : getAssignedServerForTable(currentOrder.tableNumber);
  
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTimeRemaining = `${minutes} min ${seconds < 10 ? '0' + seconds : seconds} s`;

  const handleRequestBill = async () => {
    setBillRequested(true);
    toast.success(`🧾 Addition de la Table ${formattedTable} demandée ! Votre serveur et la caisse préparent votre note.`);
    try {
      await fetch('/api/table/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: currentOrder.tableNumber,
          restaurantId: currentOrder.restaurantId,
          customerName: currentOrder.customerName,
          reason: 'BILL',
        }),
      });
    } catch (e) {
      // Ignorer si offline
    }
  };

  const handleShareWhatsAppReceipt = () => {
    const itemsList = allOrders
      .flatMap((o) => o.items)
      .map(
        (item) =>
          `• ${item.quantity}x ${item.name || (item as any).menuItem?.name || 'Article'} (${formatFCFA((item.price || 0) * (item.quantity || 1))})`
      )
      .join('\n');

    const tableLabel = isExpress ? 'Retrait comptoir' : `Table ${formattedTable}`;
    const orderRef = order?.id ? `#${order.id.slice(-4).toUpperCase()}` : 'Note de table';

    const message =
      `🧾 *REÇU NUMÉRIQUE OFFICIEL - ${restaurantName.toUpperCase()}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 Commande : *${orderRef}*\n` +
      `📍 Emplacement : ${tableLabel}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*DÉTAILS DES CONSOMMATIONS :*\n${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *TOTAL : ${formatFCFA(totalBalance)}*\n\n` +
      `🌿 *Merci de préserver nos arbres — Ticket 100% numérique 🌱*\n` +
      `🇸🇳 Propulsé par Lou Ame Tay ?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh] border border-slate-200">
        
        {/* TOP RECEIPT HEADER */}
        <div className={`p-5 text-white relative overflow-hidden shrink-0 transition-colors ${
          currentStep === 4 
            ? 'bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900' 
            : 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            title="Fermer le ticket"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl shadow-md shrink-0 ${
              currentStep === 4 ? 'bg-emerald-400 text-slate-950' : 'bg-amber-500 text-slate-950'
            }`}>
              <Receipt className="w-6 h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                Ticket Numérique Officiel
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                {restaurantName}
              </h2>
              <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-300 flex-wrap">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  {isExpress ? (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span>Comptoir Express</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Table {formattedTable}</span>
                    </>
                  )}
                </span>
                {currentOrder.customerName && (
                  <span className="bg-orange-500/20 text-orange-200 border border-orange-400/30 px-2 py-0.5 rounded-md font-bold">
                    🏷️ {currentOrder.customerName}
                  </span>
                )}
                <span className="bg-white/10 text-slate-200 border border-white/20 px-2 py-0.5 rounded-md font-bold">
                  👤 Serveur : {serverName}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300 font-bold">
                  #{currentOrder.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* PROGRESS COUNTDOWN / LIVE STATUS BAR */}
          <div className={`mt-4 p-3 rounded-2xl border backdrop-blur-xs flex items-center justify-between gap-3 ${
            isOrderCancelled
              ? 'bg-rose-950/70 border-rose-500/60'
              : isEntirelyPaid 
              ? 'bg-emerald-950/40 border-emerald-400/50' 
              : 'bg-white/10 border-white/15'
          }`}>
            <div className="flex items-center gap-2">
              {isOrderCancelled ? (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : isEntirelyPaid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Clock className={`w-4 h-4 ${currentStep === 4 ? 'text-emerald-300' : 'text-amber-400 animate-spin'}`} style={{ animationDuration: '6s' }} />
              )}
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  {isOrderCancelled ? 'État de la Commande' : isEntirelyPaid ? 'État du Règlement' : currentStep === 4 ? 'État du Service' : "Temps d'attente estimé"}
                </span>
                <span className={`text-xs sm:text-sm font-black font-mono ${
                  isOrderCancelled
                    ? 'text-rose-300'
                    : isEntirelyPaid
                    ? 'text-emerald-300'
                    : currentStep === 4
                    ? 'text-emerald-300'
                    : 'text-amber-300'
                }`}>
                  {isOrderCancelled
                    ? '🔴 Commande Annulée (Aucun débit)'
                    : isEntirelyPaid
                    ? '🟢 Note Entièrement Soldée en Caisse !'
                    : currentStep === 4
                    ? '🎉 Commande Servie à Table !'
                    : currentStep === 3
                    ? '🍽️ Prête & en cours de service !'
                    : `⏳ ~ ${formattedTimeRemaining}`}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Statut Live</span>
              <span className={`text-xs font-black flex items-center gap-1 justify-end ${isOrderCancelled ? 'text-rose-400' : 'text-emerald-400'}`}>
                <span className={`w-2 h-2 rounded-full ${isOrderCancelled ? 'bg-rose-400' : isEntirelyPaid || currentStep === 4 ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'}`} />
                <span>
                  {isOrderCancelled
                    ? 'Annulée ✓'
                    : isEntirelyPaid
                    ? 'Soldée ✓'
                    : currentStep === 4
                    ? 'Servie ✓'
                    : currentStep === 3
                    ? 'Prête'
                    : currentStep === 2
                    ? 'En Cuisson'
                    : 'Reçue'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* BANNIÈRE COMMANDE ANNULÉE */}
          {isOrderCancelled ? (
            <div className="p-4 bg-gradient-to-r from-rose-50 to-rose-100/80 border-2 border-rose-500 rounded-2xl flex items-start gap-3.5 shadow-sm animate-in zoom-in-95">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shrink-0 shadow-2xs">
                <XCircle className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-950 px-2.5 py-0.5 rounded-full border border-rose-300">
                    Statut Officiel
                  </span>
                  <span className="text-xs font-bold text-rose-800 font-mono">#{currentOrder.id.slice(-6).toUpperCase()}</span>
                </div>
                <h4 className="text-base font-black text-rose-950">
                  Commande annulée ✓
                </h4>
                <p className="text-xs text-rose-900 font-medium leading-relaxed">
                  Votre commande a bien été annulée dans les délais impartis. La brigade en cuisine a été notifiée, et aucun débit n&apos;est exigible.
                </p>
              </div>
            </div>
          ) : currentStep === 4 ? (
            <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-2xl flex items-start gap-3.5 shadow-lg animate-in zoom-in-95">
              <div className="p-2.5 bg-white text-emerald-700 rounded-2xl shrink-0 shadow-sm">
                <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/40 text-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300/30">
                    Plats Servis à Table
                  </span>
                  <span className="text-xs font-bold text-emerald-200">Table {formattedTable}</span>
                </div>
                <h4 className="text-base font-black tracking-tight">
                  🎉 Bon Appétit {currentOrder.customerName ? `à vous ${currentOrder.customerName}` : ''} !
                </h4>
                <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                  Vos plats ont été servis par <strong>{serverName}</strong>. Régalez-vous en toute sérénité !
                </p>
              </div>
            </div>
          ) : currentStep === 3 ? (
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl flex items-start gap-3 shadow-xs animate-in slide-in-from-top-2">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs shrink-0 animate-bounce">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-black text-emerald-950">
                  🔔 Commande Prête &amp; Attribuée pour être servie !
                </h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  Votre serveur dédié <strong>{serverName}</strong> apporte vos plats et boissons à votre table. Merci pour votre patience !
                </p>
              </div>
            </div>
          ) : null}

          {/* 2. LIVE STEPS TIMELINE (4 COULEURS OFFICIELLES) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
            {/* Step 1: 🟡 Transmise */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-2xs font-black text-[11px]">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block leading-tight">1. Transmise en Cuisine &amp; Bar</span>
                <span className="text-[10px] text-slate-500">Commande réceptionnée et confirmée</span>
              </div>
            </div>

            {/* Step 2: 🔵 En préparation */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                currentStep >= 2 ? 'bg-blue-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep >= 2 ? '✓' : <ChefHat className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block leading-tight">2. En Préparation &amp; Cuisson</span>
                <span className="text-[10px] text-slate-500">Les chefs préparent vos plats à la minute</span>
              </div>
            </div>

            {/* Step 3: 🟣 Prête */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                currentStep >= 3 ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep >= 3 ? '✓' : <Utensils className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block leading-tight">3. Prête &amp; Attribuée au Serveur</span>
                <span className="text-[10px] text-slate-500">{serverName} prend en charge le plateau</span>
              </div>
            </div>

            {/* Step 4: 🟢 Servie */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                currentStep === 4 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
              }`}>
                {currentStep === 4 ? '🎉' : '4'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block leading-tight">4. Servie à Table ({formattedTable})</span>
                <span className="text-[10px] text-slate-500">
                  {currentStep === 4 ? 'Plats servis • Bon appétit !' : 'Service en cours'}
                </span>
              </div>
            </div>

            {/* Step 5: 💳 Note Soldée en Caisse (Séparation stricte règle 10.4) */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                isEntirelyPaid ? 'bg-emerald-600 text-white shadow-xs font-black' : 'bg-slate-200 text-slate-500'
              }`}>
                {isEntirelyPaid ? '✓' : <Banknote className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block leading-tight">
                  {isEntirelyPaid ? '5. Note Soldée en Caisse' : '5. Règlement de l\'Addition'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {isEntirelyPaid 
                    ? `Encaissement validé (${paidOrders[0]?.paymentMethod ? String(paidOrders[0]?.paymentMethod).replace('_', ' ') : 'Espèces'}) • Merci !` 
                    : 'À régler au serveur ou au comptoir caisse'}
                </span>
              </div>
            </div>
          </div>

          {/* 🛑 BOUTON D'ANNULATION INLINE (ZÉRO POPUP, ZÉRO NAVIGATION, CHRONO DYNAMIQUE) */}
          {canCancel && !isOrderCancelled && (
            <div className="p-3 sm:p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl transition-all shadow-2xs">
              {!isConfirmingCancel ? (
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 animate-spin text-amber-900" style={{ animationDuration: '8s' }} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-black text-amber-950 block truncate">
                        Changement d&apos;avis ?
                      </span>
                      <span className="text-[11px] font-semibold text-amber-900">
                        Chrono : <strong className="font-mono font-black text-amber-950 bg-amber-200/90 px-1.5 py-0.5 rounded-md text-xs">{formattedCancelTime}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsConfirmingCancel(true)}
                    className="min-h-[42px] px-3.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border-2 border-rose-300 hover:border-rose-400 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-2xs transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                    <span>Annuler la commande</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Confirmer l&apos;annulation de votre commande ?</span>
                    </span>
                    <span className="text-[10px] font-mono font-black text-amber-950 bg-amber-200 px-2 py-0.5 rounded-full">
                      {formattedCancelTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleConfirmCancel}
                      disabled={isCancellingOrder}
                      className="min-h-[44px] px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:bg-slate-300 cursor-pointer"
                    >
                      {isCancellingOrder ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Annulation...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>✓ Confirmer l&apos;annulation</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsConfirmingCancel(false)}
                      disabled={isCancellingOrder}
                      className="min-h-[44px] px-3 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>✗ Garder ma commande</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🌿 1. BADGE ÉCO-RESPONSABLE */}
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-2xs">
            <Leaf className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold leading-tight">
              Merci de préserver nos arbres — Ticket 100% numérique 🌱
            </span>
          </div>

          {/* 3. ORDERED ITEMS ACCUMULATED RECEIPT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>📋 Détail de l'Addition</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {allOrders.length} tour{allOrders.length > 1 ? 's' : ''}
                </span>
              </h4>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
              {allOrders.map((ord, ordIdx) => (
                <div key={ord.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-100 pb-1">
                    <span>Tour N°{ordIdx + 1} ({ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'En cours'})</span>
                    <span className="font-mono text-slate-700">{formatFCFA(getOrderTotal(ord))}</span>
                  </div>

                  <div className="space-y-1.5">
                    {ord.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between items-start text-xs">
                        <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-800 font-black font-mono">{item.quantity}x</span>
                            <span className="font-bold text-slate-900 truncate">
                              {item.name || item.menuItem?.name || 'Plat traditionnel'}
                            </span>
                          </div>
                          {item.notes && (
                            <span className="block text-[10px] text-slate-500 italic pl-4">
                              Note : {item.notes}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-slate-800 shrink-0">
                          {formatFCFA(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* TOTAL BALANCE BLOCK */}
              <div className={`p-3.5 flex items-center justify-between text-slate-950 font-black border-t-2 ${
                isEntirelyPaid 
                  ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border-emerald-400' 
                  : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
              }`}>
                <div>
                  <span className="text-xs uppercase tracking-wider block text-slate-700">
                    {isEntirelyPaid ? 'Note Soldée & Encaissée' : 'Solde Total Cumulé'} ({isExpress ? 'Comptoir' : `Table ${formattedTable}`})
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {isEntirelyPaid ? 'Paiement certifié en caisse • Reçu scellé' : 'Toutes consommations de la session incluses'}
                  </span>
                </div>
                <div className="text-right">
                  {isEntirelyPaid ? (
                    <div>
                      <span className="text-base sm:text-lg font-mono text-emerald-900 font-black block">
                        {formatFCFA(totalPaid)}
                      </span>
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full inline-block mt-0.5">
                        RESTE DÛ : 0 FCFA (SOLDÉ ✓)
                      </span>
                    </div>
                  ) : isPartiallyPaid ? (
                    <div>
                      <span className="text-xs line-through text-slate-400 font-mono block">
                        Total : {formatFCFA(totalBalance)}
                      </span>
                      <span className="text-base sm:text-lg font-mono text-amber-950 font-black block">
                        Reste : {formatFCFA(remainingBalance)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 block">
                        Déjà réglé : {formatFCFA(totalPaid)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-base sm:text-lg font-mono text-amber-950 font-black block">
                        {formatFCFA(totalBalance)}
                      </span>
                      {currency !== 'FCFA' && exchangeRates && (
                        <span className="text-[11px] font-bold text-slate-600 block font-mono">
                          ≈ {formatConvertedPrice(totalBalance, currency, exchangeRates)}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 💬 PARTAGE WHATSAPP EN 1 CLIC & 📥 TÉLÉCHARGER PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 print:hidden">
              <button
                type="button"
                onClick={handleShareWhatsAppReceipt}
                className="min-h-[44px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.97]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Partager sur WhatsApp (Reçu)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="min-h-[44px] px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.97]"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger Reçu (PDF)</span>
              </button>
            </div>

            {/* ⭐ 4. APPEL À L'ACTION INTERACTIF (AVIS SERVICE) */}
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between gap-2 print:hidden">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-black text-amber-950 block">Votre expérience compte ⭐</span>
                <span className="text-[11px] text-amber-800/80 block">Donnez votre avis sur le service et les plats</span>
              </div>
              <a
                href={googleReviewUrl || '#'}
                target={googleReviewUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!googleReviewUrl) {
                    e.preventDefault();
                    toast.success('Merci pour votre note 5 étoiles ! ⭐⭐⭐⭐⭐');
                  }
                }}
                className="min-h-[38px] px-3 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-2xs active:scale-[0.97] transition-all shrink-0"
              >
                <Star className="w-3.5 h-3.5 fill-amber-950 text-amber-950" />
                <span>Donner mon avis</span>
              </a>
            </div>
          </div>

          {/* 4. PAYMENT & BILL OPTIONS */}
          <div className="space-y-3 pt-1">
            {isOrderCancelled ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1.5">
                <span className="text-xs font-black text-slate-800 block">
                  🟢 Aucun règlement restant dû
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Cette commande ayant été annulée, votre addition est à 0 FCFA. Vous pouvez commander à nouveau à tout moment.
                </p>
              </div>
            ) : isEntirelyPaid ? (
              /* NOTE ENTIÈREMENT SOLDÉE EN CAISSE */
              <div className="p-4 bg-emerald-50 border-2 border-emerald-500/80 rounded-2xl space-y-3 shadow-xs animate-in zoom-in-95">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
                    <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                        CERTIFIÉ ENCAISSÉ
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-800">
                        {paidOrders[0]?.paymentMethod ? String(paidOrders[0]?.paymentMethod).replace('_', ' ') : 'Espèces'}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-emerald-950">
                      Votre addition a été entièrement réglée en caisse !
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                      Montant total de {formatFCFA(totalPaid)} soldé. Aucun paiement restant n&apos;est dû.
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span>Solde restant à régler à table :</span>
                  <span className="text-sm font-black font-mono text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg">
                    0 FCFA (SOLDÉ ✓)
                  </span>
                </div>
              </div>
            ) : (
              /* PAIEMENT ENCORE DÛ */
              <>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Règlement &amp; Services :
                  </h4>
                  <span className="text-sm font-black text-emerald-700 font-mono">
                    Total {isPartiallyPaid ? 'restant' : ''} : {formatFCFA(remainingBalance || totalBalance)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleRequestBill}
                    disabled={billRequested}
                    className={`min-h-[48px] px-4 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                      billRequested
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400 shadow-xs'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md active:scale-[0.97]'
                    }`}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{billRequested ? '✅ Addition Demandée (Serveur prévenu)' : '🧾 Demander l\'Addition'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPayOnline?.(remainingBalance || totalBalance)}
                    className="min-h-[48px] px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border border-amber-500/30 shadow-xs transition-all active:scale-[0.97]"
                  >
                    <Smartphone className="w-4 h-4 text-slate-950" />
                    <span>Payer par Wave / OM</span>
                  </button>
                </div>
              </>
            )}

            {/* 5. NOUVELLE COMMANDE OU NOUVEAU REPAS */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-amber-200/80 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  <span>
                    {isEntirelyPaid 
                      ? 'Souhaitez-vous un dessert, un café ou réinitialiser la table ?'
                      : 'Souhaitez-vous effectuer une nouvelle commande à cette table ?'}
                  </span>
                </h5>
              </div>
              <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
                {isEntirelyPaid
                  ? 'Votre précédente addition est soldée. Vous pouvez commander des desserts/boissons supplémentaires ou libérer la table.'
                  : 'Vous pouvez ajouter des desserts et boissons sur votre note actuelle, ou réinitialiser la table si un nouveau client s\'installe.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onOrderMore}
                  className="min-h-[48px] px-3 bg-white hover:bg-amber-50 text-amber-950 border border-amber-300 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-2xs active:scale-[0.97] transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />
                  <span>🍰 + Desserts &amp; Cafés</span>
                </button>

                {onStartNewMeal && (
                  <button
                    type="button"
                    onClick={onStartNewMeal}
                    className={`min-h-[48px] px-3 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-2xs active:scale-[0.97] transition-all ${
                      isEntirelyPaid
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{isEntirelyPaid ? '🔄 Libérer Table / Nouveau Repas' : '🔄 Nouveau Repas Vierge'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 py-2.5 px-3 rounded-xl transition-colors active:scale-[0.97]"
            >
              Fermer
            </button>

            {onCallWaiter && (
              <button
                type="button"
                onClick={onCallWaiter}
                className="min-h-[44px] px-3.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs rounded-xl border border-amber-300 flex items-center gap-1.5 transition-all active:scale-[0.97]"
              >
                <Bell className="w-3.5 h-3.5 text-amber-700" />
                <span>Appeler Serveur</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onStartNewMeal && currentStep === 4 && (
              <button
                type="button"
                onClick={onStartNewMeal}
                className="min-h-[44px] px-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all active:scale-[0.97]"
              >
                Nouveau Repas
              </button>
            )}

            <button
              type="button"
              onClick={onOrderMore}
              className="min-h-[48px] px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xs flex items-center gap-1.5 border border-amber-500/30 transition-all active:scale-[0.97]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Ajouter d&apos;autres Plats</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};