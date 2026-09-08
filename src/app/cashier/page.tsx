'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Banknote, 
  Smartphone, 
  User, 
  Sparkles, 
  ChefHat, 
  Package, 
  RefreshCw, 
  ArrowLeft, 
  Volume2,
  DollarSign,
  ShoppingBag,
  Store,
  Check,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  Sun,
  Moon,
  LogOut,
  CreditCard,
  Zap,
  X
} from 'lucide-react';
import { OrderType, OrderStatus, CashierType, CashSessionType } from '@/types';
import { formatFCFA, playOrderSound } from '@/lib/utils';
import { EscPosPrinterService } from '@/services/EscPosPrinterService';
import { toast } from 'sonner';

export default function CashierCounterPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPRESS' | 'TABLE' | 'SERVED'>('ALL');
  const [restaurantName, setRestaurantName] = useState<string>('Caisse Restaurant');
  const [restaurantPhone, setRestaurantPhone] = useState<string>('+221 77 458 74 74');
  const [restaurantId, setRestaurantId] = useState<string>('');

  // Cashier & Session States
  const [currentCashier, setCurrentCashier] = useState<CashierType | null>(null);
  const [currentSession, setCurrentSession] = useState<CashSessionType | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isOpenSessionModalOpen, setIsOpenSessionModalOpen] = useState(false);
  const [isCloseSessionModalOpen, setIsCloseSessionModalOpen] = useState(false);
  const [availableCashiers, setAvailableCashiers] = useState<CashierType[]>([]);

  // Auth Inputs
  const [selectedCashierId, setSelectedCashierId] = useState<string>('');
  const [pinInput, setPinInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Open Session Input
  const [openingFloatInput, setOpeningFloatInput] = useState<string>('20000');
  const [isOpeningSession, setIsOpeningSession] = useState(false);

  // Close Session Inputs
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [liveSessionDetails, setLiveSessionDetails] = useState<any>(null);

  const getOrderTotal = (o: any): number => {
    if (o?.total !== undefined && o?.total !== null && !isNaN(Number(o.total))) return Number(o.total);
    if (o?.totalAmount !== undefined && o?.totalAmount !== null && !isNaN(Number(o.totalAmount))) return Number(o.totalAmount);
    if (Array.isArray(o?.items)) {
      return o.items.reduce((s: number, i: any) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    }
    return 0;
  };

  // Initial Load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('restaurantId');
      if (queryId) {
        localStorage.setItem('current_restaurant_id', queryId);
        setRestaurantId(queryId);
      }

      const storedName = localStorage.getItem('current_restaurant_name');
      const storedId = queryId || localStorage.getItem('current_restaurant_id') || '';
      const storedPhone = localStorage.getItem('current_restaurant_phone');

      if (storedName) setRestaurantName(storedName);
      if (storedId) setRestaurantId(storedId);
      if (storedPhone) setRestaurantPhone(storedPhone);

      // Check stored cashier
      const storedCashier = localStorage.getItem('current_cashier');
      if (storedCashier) {
        try {
          const parsed = JSON.parse(storedCashier);
          setCurrentCashier(parsed);
        } catch (e) {}
      }

      if (storedId) {
        fetchRestaurantDetails(storedId);
        fetchCashiersList(storedId);
        fetchActiveSession(storedId);
      }
    }
  }, []);

  const fetchRestaurantDetails = (id: string) => {
    fetch(`/api/super-admin/restaurants/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.restaurant) {
          const rName = d.restaurant.name || d.restaurant.businessName;
          const rPhone = d.restaurant.phone || '+221 77 458 74 74';
          if (rName) {
            setRestaurantName(rName);
            localStorage.setItem('current_restaurant_name', rName);
          }
          if (rPhone) {
            setRestaurantPhone(rPhone);
            localStorage.setItem('current_restaurant_phone', rPhone);
          }
        }
      })
      .catch(() => {});
  };

  const fetchCashiersList = async (id: string) => {
    try {
      const res = await fetch(`/api/tenant/cashiers?restaurantId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success && data.cashiers) {
        setAvailableCashiers(data.cashiers.filter((c: any) => c.isActive));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActiveSession = async (id: string) => {
    try {
      const res = await fetch(`/api/cashier/session?restaurantId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.success && data.session && data.session.status === 'OPEN') {
        setCurrentSession(data.session);
        if (data.session.cashier) {
          setCurrentCashier(data.session.cashier);
          localStorage.setItem('current_cashier', JSON.stringify(data.session.cashier));
        }
      } else {
        setCurrentSession(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch current live orders for active restaurant
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') || restaurantId : restaurantId;
      const url = storedId ? `/api/orders?restaurantId=${encodeURIComponent(storedId)}` : '/api/orders';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        fetchOrders();
        toast.info('🔄 Liste des commandes actualisée (Touche R)');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setActiveFilter((prev) => (prev === 'ALL' ? 'EXPRESS' : prev === 'EXPRESS' ? 'TABLE' : 'ALL'));
        toast.info('🔍 Filtre modifié (Touche F)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Update order status and attach cashier session
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, customPaymentMethod?: string) => {
    try {
      const payload: any = { status };
      if (currentCashier) payload.cashierId = currentCashier.id;
      if (currentSession) payload.cashSessionId = currentSession.id;
      if (customPaymentMethod) payload.paymentMethod = customPaymentMethod;

      const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status, ...(customPaymentMethod ? { paymentMethod: customPaymentMethod } : {}) } : o))
        );
        toast.success(`Commande mise à jour : ${status}`);
        if (restaurantId) fetchActiveSession(restaurantId);
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (e) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handlePrintReceipt = (order: OrderType) => {
    try {
      EscPosPrinterService.printViaWindowFallback(order, restaurantName);
      toast.success(`Impression envoyée pour la commande #${order.id.slice(-4).toUpperCase()}`);
    } catch (e) {
      toast.error("Erreur lors de l'impression");
    }
  };

  const handleCallCustomer = (order: OrderType) => {
    playOrderSound();
    toast.info(`🔔 Appel client Table ${order.tableNumber || 'Comptoir'} !`, {
      description: order.customerName ? `Client : ${order.customerName}` : 'Commande prête à retirer',
    });
  };

  // Cashier PIN Login Handlers
  const handlePinDigit = (digit: string) => {
    if (pinInput.length < 4) {
      setPinInput((prev) => prev + digit);
      setAuthError('');
    }
  };

  const handlePinDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setAuthError('');
  };

  const handlePinSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.length !== 4) {
      setAuthError('Le code PIN doit comporter 4 chiffres');
      return;
    }

    try {
      const res = await fetch('/api/cashier/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurantId || localStorage.getItem('current_restaurant_id'),
          pinCode: pinInput.trim()
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentCashier(data.cashier);
        localStorage.setItem('current_cashier', JSON.stringify(data.cashier));
        setPinInput('');
        setIsPinModalOpen(false);
        setAuthError('');
        toast.success(`Bienvenue, ${data.cashier.name} !`);

        if (data.activeSession) {
          setCurrentSession(data.activeSession);
          toast.info('Session de caisse active rattachée');
        } else {
          setCurrentSession(null);
          // Prompt for opening float
          setIsOpenSessionModalOpen(true);
        }
      } else {
        setAuthError(data.error || 'Code PIN incorrect');
        setPinInput('');
      }
    } catch (err) {
      setAuthError('Erreur de communication');
    }
  };

  // Open Session Handler
  const handleConfirmOpenSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const floatAmount = Number(openingFloatInput);
    if (isNaN(floatAmount) || floatAmount < 0) {
      toast.error('Montant de fond de caisse invalide');
      return;
    }

    try {
      setIsOpeningSession(true);
      const res = await fetch('/api/cashier/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurantId || localStorage.getItem('current_restaurant_id'),
          cashierId: currentCashier?.id,
          openingFloat: floatAmount
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentSession(data.session);
        setIsOpenSessionModalOpen(false);
        toast.success(`Caisse ouverte avec ${formatFCFA(floatAmount)} de fond de démarrage`);
      } else {
        toast.error(data.error || "Erreur lors de l'ouverture de caisse");
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setIsOpeningSession(false);
    }
  };

  // Open Close Session Modal & Fetch live totals
  const handleOpenCloseSessionModal = async () => {
    if (!currentSession) {
      toast.error('Aucune session active à clôturer');
      return;
    }

    try {
      const res = await fetch(`/api/cashier/session?sessionId=${currentSession.id}`);
      const data = await res.json();
      if (data.success && data.session) {
        setLiveSessionDetails(data.session);
        setCountedCashInput('');
        setClosingNotes('');
        setIsCloseSessionModalOpen(true);
      }
    } catch (e) {
      toast.error('Erreur lors du calcul du bilan de session');
    }
  };

  // Submit Session Closure & Print Ticket Z
  const handleConfirmCloseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;

    const counted = Number(countedCashInput);
    if (isNaN(counted) || counted < 0) {
      toast.error("Veuillez saisir le montant réel d'espèces compté dans le tiroir");
      return;
    }

    try {
      setIsClosingSession(true);
      const res = await fetch('/api/cashier/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: currentSession.id,
          countedCash: counted,
          notes: closingNotes.trim() || undefined
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Session de caisse clôturée avec succès !');
        // Print Z Report
        EscPosPrinterService.printZReport(data.session, restaurantName);
        setIsCloseSessionModalOpen(false);
        setCurrentSession(null);
        setCurrentCashier(null);
        localStorage.removeItem('current_cashier');
      } else {
        toast.error(data.error || 'Erreur lors de la clôture de caisse');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setIsClosingSession(false);
    }
  };

  // Logout / Switch Cashier
  const handleLogoutCashier = () => {
    setCurrentCashier(null);
    localStorage.removeItem('current_cashier');
    toast.info('Caissier déconnecté. Veuillez sélectionner le profil pour le prochain shift.');
    setIsPinModalOpen(true);
  };

  // Filter Orders
  const activeOrders = useMemo(() => {
    return orders.filter((order) => {
      const isExpress = order.orderType === 'EXPRESS' || order.tableNumber === 0;
      if (activeFilter === 'ALL') return order.status !== 'SERVED';
      if (activeFilter === 'EXPRESS') return isExpress && order.status !== 'SERVED';
      if (activeFilter === 'TABLE') return !isExpress && order.tableNumber > 0 && order.status !== 'SERVED';
      if (activeFilter === 'SERVED') return order.status === 'SERVED';
      return true;
    });
  }, [orders, activeFilter]);

  const readyOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'READY');
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  }, [orders]);

  const expressRevenue = useMemo(() => {
    return orders
      .filter((o) => o.orderType === 'EXPRESS' || o.tableNumber === 0)
      .reduce((sum, o) => sum + getOrderTotal(o), 0);
  }, [orders]);

  const renderPaymentBadge = (method?: string | null) => {
    switch (method) {
      case 'WAVE':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-cyan-100 text-cyan-950 border border-cyan-300 flex items-center gap-1">
            <span>🌊</span> Wave
          </span>
        );
      case 'ORANGE_MONEY':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-orange-100 text-orange-950 border border-orange-300 flex items-center gap-1">
            <span>🍊</span> Orange Money
          </span>
        );
      case 'YAS_MONEY':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-purple-100 text-purple-950 border border-purple-300 flex items-center gap-1">
            <span>🟣</span> Yas Money
          </span>
        );
      case 'CARD':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-100 text-blue-950 border border-blue-300 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-blue-700" /> Carte / TPE
          </span>
        );
      case 'CASH':
      case 'CASH_TPE':
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
            <span>💵</span> Espèces
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 space-y-6">
      {/* 1. TOP HEADER & CASHIER BAR */}
      <header className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all active:scale-[0.97]"
            title="Retour au Dashboard Gérant"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black shadow-xs">
                <Receipt className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Écran Caisse &amp; Comptoir Express
              </h1>

              {currentSession ? (
                <span className="text-[11px] font-black text-emerald-900 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  Caisse Ouverte
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (currentCashier) setIsOpenSessionModalOpen(true);
                    else setIsPinModalOpen(true);
                  }}
                  className="text-[11px] font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs hover:bg-amber-200 cursor-pointer transition-all"
                >
                  <Unlock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Caisse Fermée • Cliquez pour ouvrir</span>
                </button>
              )}
            </div>

            {/* Sub-header info with Cashier and Contact */}
            <div className="flex items-center gap-2.5 flex-wrap text-xs">
              <span className="text-slate-600 font-bold">{restaurantName}</span>
              <span className="text-slate-300">•</span>
              
              {currentCashier ? (
                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-0.5 rounded-lg text-slate-800 font-bold">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>En poste : <strong>{currentCashier.name}</strong> ({currentCashier.shift})</span>
                  {currentSession && (
                    <span className="text-slate-400 text-[10px]">
                      • Fond : {formatFCFA(Number(currentSession.openingFloat))}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleLogoutCashier}
                    className="ml-1 text-slate-400 hover:text-red-600 font-normal underline"
                    title="Changer de caissier (Relève)"
                  >
                    (Relève)
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>S'identifier avec code PIN</span>
                </button>
              )}

              <span className="text-slate-300">•</span>
              <span className="text-slate-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                📞 Gérance : <a href={`tel:${restaurantPhone}`} className="text-amber-900 hover:underline">{restaurantPhone}</a>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions & KPIs */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Bouton Rouge Clôture de Caisse */}
          {currentSession && (
            <button
              type="button"
              onClick={handleOpenCloseSessionModal}
              className="px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
              title="Clôturer la caisse et imprimer le rapport Z 80mm"
            >
              <Lock className="w-4 h-4" />
              <span>Clôturer la Caisse (Z)</span>
            </button>
          )}

          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shadow-2xs">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-emerald-700 font-bold block uppercase">Caisse du Jour</span>
              <span className="text-sm font-black text-emerald-950 font-mono">{formatFCFA(totalRevenue)}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shadow-2xs">
            <span className="text-base">⚡</span>
            <div>
              <span className="text-[10px] text-amber-700 font-bold block uppercase">Ventes Express</span>
              <span className="text-sm font-black text-amber-950 font-mono">{formatFCFA(expressRevenue)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all border border-slate-200 active:scale-[0.97]"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* 2. FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-[0.97] border ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <span>Toutes les Commandes</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeFilter === 'ALL' ? 'bg-white/20 text-white font-black' : 'bg-slate-100 text-slate-700 font-bold'
          }`}>
            {orders.filter((o) => o.status !== 'SERVED').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('EXPRESS')}
          className={`px-4 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-[0.97] border ${
            activeFilter === 'EXPRESS'
              ? 'bg-amber-400 text-slate-950 border-amber-500/40 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <span>⚡ Comptoir / Express</span>
          <span className="bg-slate-900/10 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-mono">
            {orders.filter((o) => (o.orderType === 'EXPRESS' || o.tableNumber === 0) && o.status !== 'SERVED').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('TABLE')}
          className={`px-4 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-[0.97] border ${
            activeFilter === 'TABLE'
              ? 'bg-amber-400 text-slate-950 border-amber-500/40 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <span>🍽️ Tables (Salle)</span>
          <span className="bg-slate-900/10 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-mono">
            {orders.filter((o) => o.orderType !== 'EXPRESS' && o.tableNumber > 0 && o.status !== 'SERVED').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('SERVED')}
          className={`px-4 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-[0.97] border ${
            activeFilter === 'SERVED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <span>✅ Servies &amp; Encaissées</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeFilter === 'SERVED' ? 'bg-white/20 text-white font-black' : 'bg-emerald-100 text-emerald-800 font-bold'
          }`}>
            {orders.filter((o) => o.status === 'SERVED').length}
          </span>
        </button>
      </div>

      {/* 3. READY TO PICKUP BANNER */}
      {readyOrders.length > 0 && (
        <section className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-amber-950">
                📦 Commandes Prêtes à Retirer ({readyOrders.length})
              </h3>
            </div>
            <span className="text-xs text-amber-900 font-bold">À remettre aux clients</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {readyOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-amber-700 text-xs">
                      #{ord.id.slice(-5).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {ord.orderType === 'EXPRESS' || ord.tableNumber === 0 ? '⚡ Express' : `Table ${ord.tableNumber}`}
                    </span>
                    {renderPaymentBadge(ord.paymentMethod)}
                  </div>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {ord.customerName || `${ord.items.length} articles`} • {formatFCFA(getOrderTotal(ord))}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCallCustomer(ord)}
                    className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition-all active:scale-[0.97]"
                    title="Appeler le client"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(ord.id, 'SERVED')}
                    className="px-3 py-2 min-h-[40px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-[0.97]"
                    title="Marquer comme retirée"
                  >
                    Retiré ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. ORDERS GRID */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {activeOrders.length === 0 ? (
          <div className="col-span-full py-14 text-center text-slate-500 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <span className="text-4xl block">{activeFilter === 'SERVED' ? '✅' : '✨'}</span>
            <h3 className="text-base font-bold text-slate-800">
              {activeFilter === 'SERVED' ? 'Aucune commande servie pour l\'instant' : 'Aucune commande en attente'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {activeFilter === 'SERVED'
                ? 'Les commandes servies et clôturées apparaîtront ici avec possibilité de réimpression.'
                : 'Toutes les commandes en cours ont été préparées, servies ou encaissées.'}
            </p>

            {activeFilter !== 'SERVED' && orders.some((o) => o.status === 'SERVED') && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveFilter('SERVED')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-black shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <span>✅ {orders.filter((o) => o.status === 'SERVED').length} commande(s) servie(s) et clôturée(s) aujourd'hui</span>
                  <span className="underline font-bold">Consulter &amp; Réimprimer Ticket &rarr;</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          activeOrders.map((order) => {
            const isExpress = order.orderType === 'EXPRESS' || order.tableNumber === 0;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border-2 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all ${
                  isExpress ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div
                  className={`p-4 flex items-center justify-between ${
                    isExpress
                      ? 'bg-slate-900 text-amber-400'
                      : order.status === 'PENDING'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-black tracking-tight">
                      {isExpress ? '⚡ COMPTOIR' : `TABLE ${order.tableNumber}`}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      order.status === 'PENDING' && !isExpress ? 'bg-black/10 text-slate-950' : 'bg-white/15 text-white'
                    }`}>
                      #{order.id.slice(-5).toUpperCase()}
                    </span>
                    {renderPaymentBadge(order.paymentMethod)}
                  </div>

                  <span className="text-[11px] font-bold opacity-90">
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'En direct'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1">
                  {order.customerName && (
                    <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Client : <strong>{order.customerName}</strong></span>
                    </div>
                  )}

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-xs flex items-start justify-between gap-2 border-b border-slate-50 pb-1">
                        <div className="min-w-0">
                          <span className="font-black text-slate-900">{item.quantity}x</span>{' '}
                          <span className="font-bold text-slate-800">{item.name}</span>
                          {item.options?.side && (
                            <div className="text-[11px] text-slate-500 pl-4">&gt; {item.options.side}</div>
                          )}
                          {item.options?.spiceLevel && (
                            <div className="text-[11px] text-slate-500 pl-4">&gt; {item.options.spiceLevel}</div>
                          )}
                        </div>
                        <span className="font-mono font-bold text-slate-700 shrink-0">
                          {formatFCFA(Number(item.price) * Number(item.quantity))}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.customerNote && (
                    <div className="text-[11px] italic bg-amber-50/80 border border-amber-200/80 text-amber-900 p-2.5 rounded-xl">
                      <strong>Note client :</strong> {order.customerNote}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-bold uppercase">
                      {order.status === 'SERVED' ? 'Total Encaissé :' : 'Total à Encaisser :'}
                    </span>
                    <span className="text-base font-black text-slate-950 font-mono">{formatFCFA(getOrderTotal(order))}</span>
                  </div>

                  {order.status === 'SERVED' ? (
                    <div className="space-y-2">
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Servie &amp; Clôturée</span>
                        </span>
                        <span className="font-mono text-[11px] text-emerald-700">
                          {order.servedAt ? new Date(order.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Terminée'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(order)}
                        className="w-full min-h-[46px] px-4 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                        title="Réimprimer le ticket de caisse 80mm"
                      >
                        <Printer className="w-4 h-4" />
                        <span>🖨️ Réimprimer Ticket 80mm</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          className={`py-2 px-1.5 min-h-[40px] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-[0.97] border ${
                            order.status === 'PREPARING'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          <ChefHat className="w-3.5 h-3.5" />
                          <span>Préparer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'READY')}
                          className={`py-2 px-1.5 min-h-[40px] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-[0.97] border ${
                            order.status === 'READY'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                              : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Prête</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(order)}
                          className="py-2 px-1.5 min-h-[40px] bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all"
                          title="Imprimer ticket de caisse"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Ticket</span>
                        </button>
                      </div>

                      {/* Bouton Final Encaisser & Clôturer */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 justify-between text-[11px]">
                          <span className="text-slate-500 font-bold">Règlement :</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'SERVED', 'CASH')}
                              className="px-2 py-1 rounded bg-slate-200 hover:bg-emerald-600 hover:text-white font-bold text-[10px]"
                              title="Encaisser en Espèces"
                            >
                              💵 Cash
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'SERVED', 'WAVE')}
                              className="px-2 py-1 rounded bg-slate-200 hover:bg-cyan-600 hover:text-white font-bold text-[10px]"
                              title="Encaisser en Wave"
                            >
                              🌊 Wave
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'SERVED', 'ORANGE_MONEY')}
                              className="px-2 py-1 rounded bg-slate-200 hover:bg-orange-600 hover:text-white font-bold text-[10px]"
                              title="Encaisser en Orange Money"
                            >
                              🍊 OM
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(order.id, 'SERVED', 'YAS_MONEY')}
                              className="px-2 py-1 rounded bg-slate-200 hover:bg-purple-600 hover:text-white font-bold text-[10px]"
                              title="Encaisser en Yas Money"
                            >
                              🟣 Yas
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                          className="w-full min-h-[48px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Encaisser &amp; Clôturer</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* MODAL 1 : IDENTIFICATION CAISSIER PAR CODE PIN */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Identification Caissier</h3>
              <p className="text-xs text-slate-500">Sélectionnez votre profil et saisissez votre code PIN à 4 chiffres.</p>
            </div>

            {/* Cashiers list selection */}
            {availableCashiers.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Caissier(e) en service :</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableCashiers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCashierId(c.id);
                        setPinInput('');
                        setAuthError('');
                      }}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        selectedCashierId === c.id
                          ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-black shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 font-bold hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{c.shift}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PIN Code Dots Display */}
            <div className="bg-slate-100 p-4 rounded-2xl text-center space-y-1">
              <div className="flex items-center justify-center gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all ${
                      pinInput.length > idx ? 'bg-orange-600 scale-110 shadow-xs' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              {authError && <p className="text-xs text-red-600 font-bold pt-1">{authError}</p>}
            </div>

            {/* Tactile Keypad */}
            <div className="grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePinDigit(num)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 font-black text-lg rounded-2xl transition-all shadow-xs"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handlePinDelete}
                className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-2xl transition-all"
              >
                ⌫ Effacer
              </button>
              <button
                type="button"
                onClick={() => handlePinDigit('0')}
                className="py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 font-black text-lg rounded-2xl transition-all shadow-xs"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handlePinSubmit()}
                disabled={pinInput.length !== 4}
                className="py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 text-white font-black text-xs rounded-2xl transition-all shadow-xs"
              >
                Valider ✓
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsPinModalOpen(false)}
              className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Fermer la fenêtre
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2 : OUVERTURE DE CAISSE (FOND DE DÉMARRAGE) */}
      {isOpenSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto">
                <Unlock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Ouverture de Session de Caisse</h3>
              <p className="text-xs text-slate-500">
                Caissier : <strong>{currentCashier?.name}</strong> ({currentCashier?.shift || 'Matin'})
              </p>
            </div>

            <form onSubmit={handleConfirmOpenSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Fond de caisse de démarrage (Espèces dans le tiroir) :
                </label>
                <div className="relative">
                  <Banknote className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={openingFloatInput}
                    onChange={(e) => setOpeningFloatInput(e.target.value)}
                    placeholder="20000"
                    required
                    className="w-full pl-11 pr-16 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black font-mono focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  <span className="absolute right-4 top-4 text-xs font-bold text-slate-500">FCFA</span>
                </div>
              </div>

              {/* Montants rapides pré-définis */}
              <div className="flex items-center gap-2">
                {[10000, 20000, 25000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setOpeningFloatInput(String(amt))}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      openingFloatInput === String(amt)
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-black'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {amt / 1000}k
                  </button>
                ))}
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Ce montant servira de base de calcul pour la monnaie et sera consigné sur le <strong>Rapport Z de clôture</strong> de fin de shift.
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenSessionModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isOpeningSession}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-black text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isOpeningSession ? 'Ouverture...' : 'Valider & Démarrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3 : CLÔTURE COMPTABLE (RAPPORT Z 80MM) */}
      {isCloseSessionModalOpen && liveSessionDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-900 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="text-center space-y-1 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 bg-red-100 text-red-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Clôture Comptable de Caisse</h3>
              <p className="text-xs text-slate-500">
                Caissier : <strong>{currentCashier?.name}</strong> • Ouvert depuis le {new Date(liveSessionDetails.openedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Bilan des Recettes Théoriques */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Ventilation des Recettes :</div>
              
              <div className="flex justify-between">
                <span className="text-slate-600">• Fond de caisse initial :</span>
                <span className="font-mono font-bold text-slate-900">{formatFCFA(Number(liveSessionDetails.openingFloat))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">• Ventes Espèces (Cash) :</span>
                <span className="font-mono font-bold text-slate-900">{formatFCFA(liveSessionDetails.liveTotals?.cash || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">• Ventes Wave :</span>
                <span className="font-mono font-bold text-cyan-800">{formatFCFA(liveSessionDetails.liveTotals?.wave || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">• Ventes Orange Money :</span>
                <span className="font-mono font-bold text-orange-800">{formatFCFA(liveSessionDetails.liveTotals?.orangeMoney || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">• Ventes Yas Money (Free) :</span>
                <span className="font-mono font-bold text-purple-800">{formatFCFA(liveSessionDetails.liveTotals?.yasMoney || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">• Ventes Carte / TPE :</span>
                <span className="font-mono font-bold text-blue-800">{formatFCFA(liveSessionDetails.liveTotals?.card || 0)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-sm">
                <span>TOTAL RECETTES SHIFT :</span>
                <span className="font-mono text-slate-950">{formatFCFA(liveSessionDetails.liveTotals?.totalRevenue || 0)}</span>
              </div>
            </div>

            {/* Comptage Réel & Calcul d'Écart */}
            <form onSubmit={handleConfirmCloseSession} className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-950">Espèces théoriques attendues dans le tiroir :</span>
                  <span className="font-mono font-black text-amber-950">
                    {formatFCFA(Number(liveSessionDetails.openingFloat) + (liveSessionDetails.liveTotals?.cash || 0))}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Montant d'espèces réellement compté dans le tiroir-caisse :
                  </label>
                  <div className="relative">
                    <Banknote className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={countedCashInput}
                      onChange={(e) => setCountedCashInput(e.target.value)}
                      placeholder="Ex: 85000"
                      required
                      className="w-full pl-11 pr-16 py-3 bg-white border border-slate-200 rounded-xl text-base font-mono font-black focus:outline-hidden focus:border-red-500 transition-all"
                    />
                    <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400">FCFA</span>
                  </div>
                </div>

                {/* Live Discrepancy indicator */}
                {countedCashInput && (
                  (() => {
                    const expected = Number(liveSessionDetails.openingFloat) + (liveSessionDetails.liveTotals?.cash || 0);
                    const diff = Number(countedCashInput) - expected;
                    if (diff === 0) {
                      return (
                        <div className="p-2.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-black flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>Caisse parfaitement équilibrée (Écart : 0 FCFA)</span>
                        </div>
                      );
                    } else if (diff > 0) {
                      return (
                        <div className="p-2.5 bg-blue-100 text-blue-900 border border-blue-300 rounded-xl text-xs font-black flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-700" />
                          <span>Excédent de caisse constaté : +{formatFCFA(diff)}</span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-2.5 bg-red-100 text-red-900 border border-red-300 rounded-xl text-xs font-black flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-700" />
                          <span>Déficit / Manquant de caisse constaté : {formatFCFA(diff)}</span>
                        </div>
                      );
                    }
                  })()
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observations / Notes de clôture (facultatif) :
                </label>
                <input
                  type="text"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Ex: Rendu de monnaie validé, rouleau ticket changé..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-slate-400 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseSessionModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isClosingSession || !countedCashInput}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-black text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isClosingSession ? 'Clôture en cours...' : 'Imprimer Ticket Z & Clôturer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}