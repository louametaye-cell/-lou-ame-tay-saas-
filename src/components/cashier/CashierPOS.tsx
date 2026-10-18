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
  Phone,
  UtensilsCrossed,
  X,
  MessageCircle,
  Loader2,
  Wifi,
  WifiOff,
  Bluetooth,
  UserCheck,
  DoorOpen,
  Sparkles,
  MapPin,
  Layers,
  LayoutGrid,
  List
} from 'lucide-react';
import { OrderType, OrderStatus, CashierType, CashSessionType } from '@/types';
import { formatFCFA, playOrderSound } from '@/lib/utils';
import { TactileGrid } from './TactileGrid';
import { CashierCart, CashierCartItem } from './CashierCart';
import { CashClosureModal } from './CashClosureModal';
import { OrdersDataTable } from './OrdersDataTable';
import { OrderDetailModal } from './OrderDetailModal';
import { CashierDailyRevenueCard } from './CashierDailyRevenueCard';
import { EscPosPrinterService } from '@/services/EscPosPrinterService';
import { 
  resilientFetch, 
  enqueueOfflineAction, 
  flushOfflineQueue, 
  getOfflineQueue, 
  isNetworkOnline, 
  setSimulatedNetworkOutage 
} from '@/lib/terrain-resilience';
import { toast } from 'sonner';

interface CashierPOSProps {
  initialRestaurantId?: string;
}

export default function CashierPOS({ initialRestaurantId }: CashierPOSProps = {}) {
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

  // Payment Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [orderToPay, setOrderToPay] = useState<OrderType | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'WAVE' | 'ORANGE_MONEY' | 'YAS_MONEY' | 'CARD' | 'STAFF_MEAL'>('CASH');
  const [staffEmployeeName, setStaffEmployeeName] = useState<string>('');
  const [amountReceivedInput, setAmountReceivedInput] = useState<string>('');
  const [transactionRefInput, setTransactionRefInput] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  // 🖨️ États Gestion Imprimante (Bluetooth & Système / PDF)
  const [isPrinterModalOpen, setIsPrinterModalOpen] = useState(false);
  const [printerType, setPrinterType] = useState<'native' | 'bluetooth'>('native');
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [bluetoothDeviceName, setBluetoothDeviceName] = useState<string>('');
  const [isConnectingBt, setIsConnectingBt] = useState(false);

  const [activeMode, setActiveMode] = useState<'QR_ORDERS' | 'TABLE_PLAN' | 'NEW_ORDER' | 'TAKEAWAY_ORDERS'>('QR_ORDERS');
  // Mode d'affichage des commandes du jour : 'TABLE' (Data Table - par défaut) ou 'CARDS' (Grille)
  const [ordersViewMode, setOrdersViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<OrderType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [dbTables, setDbTables] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('ALL');
  const [tableStatusFilter, setTableStatusFilter] = useState<'ALL' | 'FREE' | 'OCCUPIED' | 'BILL_REQUESTED'>('ALL');
  const [releasingTableNum, setReleasingTableNum] = useState<number | null>(null);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<CashierCartItem[]>([]);
  const [isSubmittingNewOrder, setIsSubmittingNewOrder] = useState(false);

  // 📡 États de Résilience Réseau & Hors-Ligne (Terrain Sénégal)
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateNetStatus = () => {
      const offline = !isNetworkOnline();
      setIsOffline(offline);
      const queue = getOfflineQueue('CASHIER');
      setPendingSyncCount(queue.length);
    };

    updateNetStatus();

    const handleOnline = async () => {
      updateNetStatus();
      toast.success('🌐 Connexion rétablie ! Synchronisation des commandes en cours...');
      setIsSyncing(true);
      await flushOfflineQueue('CASHIER');
      setIsSyncing(false);
      updateNetStatus();
      fetchOrders();
      const currentResto = restaurantId || localStorage.getItem('current_restaurant_id');
      if (currentResto) fetchActiveSession(currentResto);
    };

    const handleOffline = () => {
      updateNetStatus();
      toast.warning('📡 Réseau indisponible. Bascule automatique en Mode Hors-Ligne Caisse.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Sync périodique toutes les 15s si des actions sont en attente et que le réseau est disponible
    const syncInterval = setInterval(() => {
      updateNetStatus();
      if (isNetworkOnline()) {
        const queue = getOfflineQueue('CASHIER');
        if (queue.length > 0) {
          flushOfflineQueue('CASHIER').then(() => {
            updateNetStatus();
            fetchOrders();
          });
        }
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, [restaurantId]);

  const handleManualSync = async () => {
    if (!isNetworkOnline()) {
      toast.error('Impossible de synchroniser : appareil hors ligne.');
      return;
    }
    setIsSyncing(true);
    toast.info('Synchronisation de la file d\'attente caisse...');
    const success = await flushOfflineQueue('CASHIER');
    setIsSyncing(false);
    const queue = getOfflineQueue('CASHIER');
    setPendingSyncCount(queue.length);
    if (success) {
      toast.success('File d\'attente caisse synchronisée avec succès !');
      fetchOrders();
      const currentResto = restaurantId || localStorage.getItem('current_restaurant_id');
      if (currentResto) fetchActiveSession(currentResto);
    } else {
      toast.warning('Certaines actions n\'ont pas pu être synchronisées.');
    }
  };

  const handleToggleNetworkOutage = () => {
    const willBeOffline = isNetworkOnline();
    setSimulatedNetworkOutage(willBeOffline);
    setIsOffline(willBeOffline);
    if (willBeOffline) {
      toast.error('Simulation : Coupure réseau activée (Mode Sénégal Hors-Ligne)');
    } else {
      toast.success('Simulation : Connexion réseau rétablie !');
    }
  };

  // 🖨️ Synchronisation configuration Imprimante & Web Bluetooth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedType = localStorage.getItem('louametay_printer_type') as 'native' | 'bluetooth' | null;
      if (savedType) setPrinterType(savedType);
    }
  }, []);

  const handleConnectBluetooth = async () => {
    setIsConnectingBt(true);
    try {
      const res = await EscPosPrinterService.connectBluetooth();
      if (res.success) {
        setIsBluetoothConnected(true);
        setBluetoothDeviceName(res.deviceName || 'Imprimante BT 80mm');
        setPrinterType('bluetooth');
        if (typeof window !== 'undefined') {
          localStorage.setItem('louametay_printer_type', 'bluetooth');
        }
        toast.success(`Imprimante connectée : ${res.deviceName || 'Bluetooth 80mm'}`);
      } else {
        toast.error(res.error || 'Échec d\'appairage Bluetooth');
      }
    } catch (e: any) {
      toast.error(e.message || 'Erreur Bluetooth');
    } finally {
      setIsConnectingBt(false);
    }
  };

  const printOrderReceipt = async (orderData: any) => {
    try {
      if (printerType === 'bluetooth') {
        const success = await EscPosPrinterService.printViaBluetooth(orderData, restaurantName);
        if (success) {
          toast.success('Ticket imprimé via Bluetooth ESC/POS 80mm');
          return;
        }
        toast.warning('Bluetooth non accessible. Bascule sur l\'impression PDF/Système...');
      }
      EscPosPrinterService.printViaNative(orderData, restaurantName);
    } catch (err) {
      console.error("Erreur d'impression ticket:", err);
      EscPosPrinterService.printViaNative(orderData, restaurantName);
    }
  };

  useEffect(() => {
    if (activeMode === 'NEW_ORDER' && menuCategories.length === 0) {
      const targetResto = currentCashier?.tenantId || restaurantId || (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : '') || '';
      const headers: Record<string, string> = {};
      if (targetResto) headers['x-cashier-token'] = `cashier_session_${targetResto}`;
      fetch('/api/cashier/menu?tenantId=' + encodeURIComponent(targetResto), { headers })
        .then(res => res.json())
        .then(data => {
          if (data.categories) setMenuCategories(data.categories);
        })
        .catch(() => {});
    }
  }, [activeMode, restaurantId, currentCashier]);

  const handleAddToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(i => i.menuItemId === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const handleSubmitNewOrder = async (
    method: string, 
    customerName: string, 
    isPaidLater: boolean = false, 
    tableNumber: number = 0,
    employeeNameParam?: string
  ) => {
    setIsSubmittingNewOrder(true);
    const effectiveRestoId = currentCashier?.tenantId || restaurantId || (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : '') || '';
    const totalOrderAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderPayload = {
      tenantId: effectiveRestoId,
      items: cartItems,
      paymentMethod: method,
      cashierId: currentCashier?.id,
      cashSessionId: currentSession?.id,
      customerName,
      isPaidLater,
      tableNumber,
      employeeName: employeeNameParam
    };

    // 📡 RÉALITÉ DU TERRAIN SÉNÉGAL : Si coupure réseau, ne jamais bloquer la caisse
    if (!isNetworkOnline()) {
      const offlineId = 'offline_' + Date.now();
      const offlineOrder: OrderType = {
        id: offlineId,
        restaurantId: effectiveRestoId,
        orderType: tableNumber === 0 ? 'TAKEAWAY' : 'TABLE',
        tableNumber: tableNumber,
        customerName: customerName || (tableNumber === 0 ? 'Comptoir Express' : `Table ${tableNumber}`),
        status: isPaidLater ? 'PENDING' : 'SERVED',
        paymentStatus: isPaidLater ? 'PENDING' : (method === 'STAFF_MEAL' ? 'STAFF_NP' : 'PAID') as any,
        paymentMethod: method as any,
        employeeName: employeeNameParam,
        items: cartItems.map((item, idx) => ({
          id: `item_${idx}_${Date.now()}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: totalOrderAmount,
        createdAt: new Date().toISOString()
      };

      enqueueOfflineAction({
        scope: 'CASHIER',
        url: '/api/cashier/orders',
        method: 'POST',
        body: {
          ...orderPayload,
          offlineClientId: offlineId
        },
        label: `Commande caisse ${customerName || 'Comptoir'}`
      });
      setPendingSyncCount(getOfflineQueue('CASHIER').length);
      setOrders(prev => [offlineOrder, ...prev]);

      // Impression immédiate du ticket thermique avec fallback automatique PDF
      printOrderReceipt(offlineOrder);

      toast.warning(`📡 Mode Hors-Ligne : Commande enregistrée localement (${formatFCFA(totalOrderAmount)}). Ticket imprimé ! En attente de synchro.`);
      setCartItems([]);
      setActiveMode('QR_ORDERS');
      setIsSubmittingNewOrder(false);
      return;
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (effectiveRestoId) {
        headers['x-cashier-token'] = `cashier_session_${effectiveRestoId}`;
        headers['x-tenant-token'] = effectiveRestoId;
      }
      if (currentCashier?.tenantId) {
        headers['x-cashier-token'] = `cashier_session_${currentCashier.tenantId}`;
      }

      const res = await fetch('/api/cashier/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        toast.success(method === 'STAFF_MEAL' ? 'Bon repas personnel (NP) consigné !' : 'Commande enregistrée et encaissée !');
        if (data.order) {
          printOrderReceipt(data.order);
        }
        setCartItems([]);
        setActiveMode(tableNumber === 0 ? 'TAKEAWAY_ORDERS' : 'QR_ORDERS');
        fetchActiveSession(effectiveRestoId);
        fetchOrders();
      } else {
        toast.error(data.error || 'Erreur lors de la commande');
      }
    } catch (e) {
      // Si la connexion se coupe subitement pendant la requête : bascule hors-ligne fluide
      const offlineId = 'offline_' + Date.now();
      const offlineOrder: OrderType = {
        id: offlineId,
        restaurantId: effectiveRestoId,
        orderType: tableNumber === 0 ? 'TAKEAWAY' : 'TABLE',
        tableNumber: tableNumber,
        customerName: customerName || (tableNumber === 0 ? 'Comptoir Express' : `Table ${tableNumber}`),
        status: isPaidLater ? 'PENDING' : 'SERVED',
        paymentStatus: isPaidLater ? 'PENDING' : 'PAID',
        paymentMethod: method as any,
        items: cartItems.map((item, idx) => ({
          id: `item_${idx}_${Date.now()}`,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: totalOrderAmount,
        createdAt: new Date().toISOString()
      };

      enqueueOfflineAction({
        scope: 'CASHIER',
        url: '/api/cashier/orders',
        method: 'POST',
        body: {
          ...orderPayload,
          offlineClientId: offlineId
        },
        label: `Commande caisse ${customerName || 'Comptoir'}`
      });
      setPendingSyncCount(getOfflineQueue('CASHIER').length);
      setOrders(prev => [offlineOrder, ...prev]);

      try {
        EscPosPrinterService.printViaWindowFallback(offlineOrder, restaurantName);
      } catch (printErr) {}

      toast.warning(`📡 Coupure réseau détectée : Commande enregistrée localement. Ticket imprimé ! En attente de synchro.`);
      setCartItems([]);
      setActiveMode('QR_ORDERS');
    } finally {
      setIsSubmittingNewOrder(false);
    }
  };


  // Waiter Calls / Bill Requests State
  const [waiterCalls, setWaiterCalls] = useState<any[]>([]);
  const [isTambaliPlan, setIsTambaliPlan] = useState<boolean>(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(true);

  const getOrderTotal = (o: any): number => {
    if (o?.total !== undefined && o?.total !== null && !isNaN(Number(o.total))) return Number(o.total);
    if (o?.totalAmount !== undefined && o?.totalAmount !== null && !isNaN(Number(o.totalAmount))) return Number(o.totalAmount);
    if (Array.isArray(o?.items)) {
      return o.items.reduce((s: number, i: any) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
    }
    return 0;
  };

  const [availableRestaurants, setAvailableRestaurants] = useState<any[]>([]);

  // Initial Load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = initialRestaurantId || params.get('restaurantId') || '';
      
      let effectiveId = queryId;
      if (queryId) {
        localStorage.setItem('current_restaurant_id', queryId);
        setRestaurantId(queryId);
      } else {
        effectiveId = localStorage.getItem('current_restaurant_id') || '';
        if (effectiveId) setRestaurantId(effectiveId);
      }

      const storedName = localStorage.getItem('current_restaurant_name');
      const storedPhone = localStorage.getItem('current_restaurant_phone');

      if (storedName) setRestaurantName(storedName);
      if (storedPhone) setRestaurantPhone(storedPhone);

      // 🔒 Pour la sécurité du terminal caisse, chaque ouverture de page requiert la saisie du code PIN
      setCurrentCashier(null);

      // Charger la liste des établissements pour permettre la sélection sur /cashier
      fetch('/api/cashier/auth')
        .then((r) => r.json())
        .then((d) => {
          if (d.restaurants && Array.isArray(d.restaurants)) {
            setAvailableRestaurants(d.restaurants);
            if (!effectiveId && d.restaurants.length > 0) {
              const sams = d.restaurants.find((r: any) => r.subdomain === 'sams-prestige') || d.restaurants[0];
              setRestaurantId(sams.subdomain);
              setRestaurantName(sams.businessName);
              localStorage.setItem('current_restaurant_id', sams.subdomain);
              localStorage.setItem('current_restaurant_name', sams.businessName);
              fetchRestaurantDetails(sams.subdomain);
              fetchActiveSession(sams.subdomain);
            }
          }
        })
        .catch(() => {});

      if (effectiveId) {
        fetchRestaurantDetails(effectiveId);
        fetchCashiersList(effectiveId);
        fetchActiveSession(effectiveId);
      }
    }
  }, [initialRestaurantId]);

  const fetchRestaurantDetails = (id: string) => {
    setIsTambaliPlan(false);
    fetch(`/api/tenant/branding?restaurantId=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.isTambali || d.plan?.slug?.toLowerCase() === 'tambali') {
          setIsTambaliPlan(true);
        }
        if (d.success || d.name || d.branding) {
          const rName = d.name || d.restaurant?.name || d.businessName;
          const rPhone = d.phone || d.branding?.phone || d.restaurant?.phone || '+221 77 458 74 74';
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
      .catch(() => {})
      .finally(() => setIsLoadingDetails(false));
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

  const fetchActiveSession = async (id: string, targetCashierId?: string) => {
    try {
      const cId = targetCashierId || currentCashier?.id;
      const url = `/api/cashier/session?restaurantId=${encodeURIComponent(id)}${cId ? `&cashierId=${encodeURIComponent(cId)}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.session && data.session.status === 'OPEN') {
        setCurrentSession(data.session);
      } else {
        setCurrentSession(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch current live orders for active restaurant (avec cache résilient hors-ligne)
  const fetchOrders = async () => {
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') || restaurantId : restaurantId;
    const cacheKey = `lou_ame_tay_cached_cashier_orders_${storedId || 'default'}`;

    // Si nous sommes hors-ligne, servir immédiatement le cache local
    if (!isNetworkOnline()) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setOrders(JSON.parse(cached));
        }
      } catch (e) {}
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const url = storedId ? `/api/orders?restaurantId=${encodeURIComponent(storedId)}` : '/api/orders';
      const headers: Record<string, string> = {};
      if (storedId) headers['x-cashier-token'] = `cashier_session_${storedId}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const freshOrders = data.orders || [];
        setOrders(freshOrders);
        setLastRefreshed(new Date());
        try {
          localStorage.setItem(cacheKey, JSON.stringify(freshOrders));
        } catch (e) {}
      } else {
        const cached = localStorage.getItem(cacheKey);
        if (cached) setOrders(JSON.parse(cached));
      }
    } catch (e) {
      console.error('Erreur fetchOrders (bascule cache local):', e);
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) setOrders(JSON.parse(cached));
      } catch (cacheErr) {}
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWaiterCalls = async () => {
    try {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') || restaurantId : restaurantId;
      if (!storedId) return;
      const res = await fetch(`/api/dashboard/waiter-calls?restaurantId=${encodeURIComponent(storedId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.calls)) {
          setWaiterCalls((prev) => {
            if (data.calls.length > prev.length) {
              playOrderSound();
            }
            return data.calls;
          });
        }
      }
    } catch (e) {}
  };

  const handleResolveWaiterCall = async (callId: string) => {
    try {
      await fetch('/api/dashboard/waiter-calls', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId }),
      });
      setWaiterCalls((prev) => prev.filter((c) => c.id !== callId));
      toast.success("Demande d'addition acquittée avec succès");
    } catch (e) {
      toast.error("Erreur lors de l'acquittement");
    }
  };

  const fetchDbTables = async () => {
    try {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') || restaurantId : restaurantId;
      if (!storedId) return;
      const res = await fetch(`/api/cashier/tables?restaurantId=${encodeURIComponent(storedId)}&cashierId=${encodeURIComponent(currentCashier?.id || '')}`, {
        headers: {
          'x-cashier-token': currentCashier ? `${currentCashier.id}:${storedId}` : '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.tables)) {
          setDbTables(data.tables);
          if (Array.isArray(data.zones)) {
            setZones(data.zones);
          }
        }
      }
    } catch (e) {
      console.error('Erreur fetchDbTables caisse:', e);
    }
  };

  const handleReleaseTable = async (tableNum: number, tableId?: string) => {
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') || restaurantId : restaurantId;
    if (!storedId) return;

    try {
      setReleasingTableNum(tableNum);
      const res = await fetch('/api/cashier/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cashier-token': currentCashier ? `${currentCashier.id}:${storedId}` : '',
        },
        body: JSON.stringify({
          restaurantId: storedId,
          tenantId: storedId,
          tableNumber: tableNum,
          tableId: tableId,
          cashierId: currentCashier?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Table ${tableNum < 10 ? '0' + tableNum : tableNum} libérée avec succès !`, {
          description: 'La table est propre et prête pour accueillir les prochains clients.',
        });
        await Promise.all([fetchDbTables(), fetchOrders(), fetchWaiterCalls()]);
      } else {
        toast.error(data.error || 'Impossible de libérer la table.', {
          description: data.unpaidOrdersCount
            ? `${data.unpaidOrdersCount} commande(s) non encaissée(s) restante(s).`
            : undefined,
        });
      }
    } catch (err) {
      toast.error('Erreur réseau lors de la libération de la table');
    } finally {
      setReleasingTableNum(null);
    }
  };

  useEffect(() => {
    if (!currentCashier) {
      // Saisie directe du PIN au clavier sur la page de connexion
      const handleLockscreenKey = (e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
          e.preventDefault();
          handlePinDigit(e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          handlePinDelete();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handlePinSubmit();
        }
      };
      window.addEventListener('keydown', handleLockscreenKey);
      return () => window.removeEventListener('keydown', handleLockscreenKey);
    }

    fetchOrders();
    fetchWaiterCalls();
    fetchDbTables();
    const interval = setInterval(() => {
      fetchOrders();
      fetchWaiterCalls();
      fetchDbTables();
    }, 6000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        fetchOrders();
        fetchWaiterCalls();
        fetchDbTables();
        toast.info('🔄 Liste des commandes, tables et appels actualisée (Touche R)');
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
  }, [currentCashier, restaurantId, pinInput]);

  // Visualiser le détail complet d'une commande
  const handleViewOrder = (order: OrderType) => {
    setSelectedOrderForDetail(order);
    setIsDetailModalOpen(true);
  };

  // Open the Mandatory Payment Modal
  const handleOpenPaymentModal = (order: OrderType, defaultMethod: string = 'CASH') => {
    if (!currentSession) {
      toast.error('Veuillez d\'abord ouvrir votre session de caisse avec votre code PIN');
      if (!currentCashier) setIsPinModalOpen(true);
      else setIsOpenSessionModalOpen(true);
      return;
    }

    const total = getOrderTotal(order);
    setOrderToPay(order);
    setPaymentMethod((defaultMethod as any) || 'CASH');
    setStaffEmployeeName(order.employeeName || '');
    setAmountReceivedInput(String(total));
    setTransactionRefInput('');
    setIsPaymentModalOpen(true);
  };

  // Submit Payment to API /api/cashier/orders/[id]/pay (Mode Résilient Sénégal)
  const handleConfirmPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderToPay) return;

    if (paymentMethod === 'STAFF_MEAL' && !staffEmployeeName.trim()) {
      toast.error('Veuillez obligatoirement renseigner le nom de l\'employé pour ce bon repas NP.');
      return;
    }

    const total = getOrderTotal(orderToPay);
    const amountReceived = paymentMethod === 'CASH' ? Number(amountReceivedInput) : total;

    if (paymentMethod === 'CASH' && (isNaN(amountReceived) || amountReceived < total)) {
      toast.error(`Montant reçu insuffisant. Le total dû est de ${formatFCFA(total)}`);
      return;
    }

    const changeGiven = paymentMethod === 'CASH' ? Math.max(0, amountReceived - total) : 0;
    const effectiveRestoId = restaurantId || (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : '') || '';
    const paymentPayload = {
      restaurantId: effectiveRestoId,
      paymentMethod,
      cashierId: currentCashier?.id,
      cashSessionId: currentSession?.id,
      amountReceived: paymentMethod === 'STAFF_MEAL' ? total : amountReceived,
      changeGiven,
      transactionRef: transactionRefInput.trim() || undefined,
      employeeName: paymentMethod === 'STAFF_MEAL' ? staffEmployeeName.trim() : undefined,
    };

    // 📡 RÉALITÉ DU TERRAIN SÉNÉGAL : Si la connexion est coupée, encaissement local immédiat + impression ticket
    if (!isNetworkOnline()) {
      enqueueOfflineAction({
        scope: 'CASHIER',
        url: `/api/cashier/orders/${orderToPay.id}/pay`,
        method: 'POST',
        body: paymentPayload,
        label: `Encaissement #${orderToPay.id.slice(-5)}`
      });
      setPendingSyncCount(getOfflineQueue('CASHIER').length);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToPay.id
            ? {
                ...o,
                status: 'SERVED',
                paymentStatus: (paymentMethod === 'STAFF_MEAL' ? 'STAFF_NP' : 'PAID') as any,
                paymentMethod: paymentMethod as any,
                employeeName: paymentMethod === 'STAFF_MEAL' ? staffEmployeeName.trim() : undefined,
                servedAt: new Date().toISOString(),
              }
            : o
        )
      );

      printOrderReceipt({
        ...orderToPay,
        status: 'SERVED',
        paymentStatus: paymentMethod === 'STAFF_MEAL' ? 'STAFF_NP' : 'PAID',
        paymentMethod: paymentMethod as any,
        employeeName: paymentMethod === 'STAFF_MEAL' ? staffEmployeeName.trim() : undefined,
      });

      setIsPaymentSuccess(true);
      toast.warning(`📡 Mode Hors-Ligne : Encaissement enregistré (${formatFCFA(total)} - ${paymentMethod}). Ticket imprimé ! En attente de synchro.`);

      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setOrderToPay(null);
        setIsPaymentSuccess(false);
      }, 1200);
      return;
    }

    try {
      setIsProcessingPayment(true);
      const res = await fetch(`/api/cashier/orders/${orderToPay.id}/pay`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-cashier-token': currentCashier ? `${currentCashier.id}:${effectiveRestoId}` : '',
          'x-tenant-token': effectiveRestoId,
        },
        body: JSON.stringify(paymentPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderToPay.id
              ? {
                  ...o,
                  status: 'SERVED',
                  paymentStatus: (paymentMethod === 'STAFF_MEAL' ? 'STAFF_NP' : 'PAID') as any,
                  paymentMethod: paymentMethod as any,
                  employeeName: paymentMethod === 'STAFF_MEAL' ? staffEmployeeName.trim() : undefined,
                  servedAt: new Date().toISOString(),
                }
              : o
          )
        );

        printOrderReceipt({
          ...orderToPay,
          status: 'SERVED',
          paymentStatus: paymentMethod === 'STAFF_MEAL' ? 'STAFF_NP' : 'PAID',
          paymentMethod: paymentMethod as any,
          employeeName: paymentMethod === 'STAFF_MEAL' ? staffEmployeeName.trim() : undefined,
        });

        setIsPaymentSuccess(true);

        if (paymentMethod === 'STAFF_MEAL') {
          toast.success(`Bon repas NP enregistré : ${formatFCFA(total)} (Employé : ${staffEmployeeName.trim()})`, {
            description: 'Montant imputé sur salaire, exclu de la caisse espèces.',
          });
        } else {
          toast.success(`Encaissement validé : ${formatFCFA(total)} (${paymentMethod})`, {
            description: changeGiven > 0 ? `Monnaie rendue au client : ${formatFCFA(changeGiven)}` : 'Règlement exact perçu',
          });
        }

        if (effectiveRestoId) {
          fetchActiveSession(effectiveRestoId);
          fetchWaiterCalls();
          fetchOrders();
        }

        // Maintenir l'état vert éclatant de succès 1.2s pour confirmation visuelle instantanée
        setTimeout(() => {
          setIsPaymentModalOpen(false);
          setOrderToPay(null);
          setIsPaymentSuccess(false);
        }, 1200);
      } else {
        toast.error(data.error || "Erreur lors de l'encaissement de la commande");
      }
    } catch (err) {
      // Coupure réseau subite pendant l'encaissement : bascule hors-ligne fluide
      enqueueOfflineAction({
        scope: 'CASHIER',
        url: `/api/cashier/orders/${orderToPay.id}/pay`,
        method: 'POST',
        body: paymentPayload,
        label: `Encaissement #${orderToPay.id.slice(-5)}`
      });
      setPendingSyncCount(getOfflineQueue('CASHIER').length);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderToPay.id
            ? {
                ...o,
                status: 'SERVED',
                paymentStatus: 'PAID',
                paymentMethod: paymentMethod as any,
                servedAt: new Date().toISOString(),
              }
            : o
        )
      );

      try {
        EscPosPrinterService.printViaWindowFallback(
          { ...orderToPay, status: 'SERVED', paymentStatus: 'PAID', paymentMethod: paymentMethod as any },
          restaurantName
        );
      } catch (printErr) {}

      setIsPaymentSuccess(true);
      toast.warning(`📡 Coupure réseau détectée : Encaissement sauvegardé en local (${formatFCFA(total)}). Ticket imprimé ! En attente de synchro.`);

      setTimeout(() => {
        setIsPaymentModalOpen(false);
        setOrderToPay(null);
        setIsPaymentSuccess(false);
      }, 1200);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Update order status and attach cashier session (sans jamais modifier le statut de paiement)
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, customPaymentMethod?: string) => {
    const payload: any = { status };
    if (currentCashier) payload.cashierId = currentCashier.id;
    if (currentSession) payload.cashSessionId = currentSession.id;
    if (customPaymentMethod) payload.paymentMethod = customPaymentMethod;

    // Mise à jour optimiste immédiate dans l'UI
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status, ...(customPaymentMethod ? { paymentMethod: customPaymentMethod } : {}) } : o))
    );

    try {
      const res = await resilientFetch(
        `/api/kitchen/orders/${orderId}/status`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        'CASHIER',
        `Mise à jour statut #${orderId.slice(-5)} vers ${status}`
      );

      if (res.ok) {
        toast.success(`Commande mise à jour : ${status}`);
        if (restaurantId) fetchActiveSession(restaurantId);
      } else {
        toast.error('Erreur lors de la mise à jour du statut en base');
      }
    } catch (e) {
      setPendingSyncCount(getOfflineQueue('CASHIER').length);
      toast.warning(`📡 Mode Hors-Ligne : Statut "${status}" enregistré en local. Synchronisation automatique au retour réseau.`);
    }
  };

  const handlePrintReceipt = (order: OrderType) => {
    try {
      EscPosPrinterService.printViaWindowFallback(order, restaurantName);
      toast.success(`Impression envoyée pour la commande #${order.id.slice(-4).toUpperCase()}`);
    } catch (e) {
      // Fallback PDF direct
      try {
        EscPosPrinterService.printAsPdf(order, restaurantName);
        toast.info("Impression lancée via le mode PDF de secours.");
      } catch (pdfErr) {
        toast.error("Erreur lors de l'impression");
      }
    }
  };

  const handleCallCustomer = (order: OrderType) => {
    playOrderSound();
    toast.info(`🔔 Appel client Table ${order.tableNumber || 'Comptoir'} !`, {
      description: order.customerName ? `Client : ${order.customerName}` : 'Commande prête à retirer',
    });
  };

  const handleSendWhatsAppReceipt = (order: OrderType) => {
    const itemsList = order.items
      .map((item) => `• ${item.quantity}x ${item.name} (${formatFCFA((item.price || 0) * (item.quantity || 1))})`)
      .join('\n');

    const tableLabel = order.tableNumber && order.tableNumber > 0 ? `Table ${order.tableNumber}` : 'Comptoir';
    const effectiveTotal = (order as any).totalAmount ?? order.total ?? 0;
    const receiptUrl = typeof window !== 'undefined' ? `${window.location.origin}/receipt/${order.id}` : '';

    const message =
      `🧾 *REÇU NUMÉRIQUE OFFICIEL - ${restaurantName.toUpperCase()}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 Commande N° : *#${order.id.slice(-4).toUpperCase()}*\n` +
      `📍 Service : ${tableLabel}\n` +
      `${order.customerName ? `👤 Client : ${order.customerName}\n` : ''}` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*DÉTAILS DES CONSOMMATIONS :*\n${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *TOTAL RÉGLÉ : ${formatFCFA(effectiveTotal)}*\n` +
      `✅ Statut : Encaissé (${order.paymentMethod || 'Espèces'})\n\n` +
      `🌿 *Merci de préserver nos arbres — Ticket 100% numérique 🌱*\n` +
      `🔗 Consulter mon reçu certifié : ${receiptUrl}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
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

    const activeResto = restaurantId || localStorage.getItem('current_restaurant_id');
    if (!activeResto) {
      setAuthError('Veuillez sélectionner votre établissement ci-dessus');
      return;
    }

    try {
      const res = await fetch('/api/cashier/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: activeResto,
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

  // Open Close Session Modal (Clôture à l'aveugle multi-devises)
  const handleOpenCloseSessionModal = () => {
    if (!currentSession) {
      toast.error('Aucune session active à clôturer');
      return;
    }
    setLiveSessionDetails(currentSession);
    setIsCloseSessionModalOpen(true);
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
    if (currentSession) {
      const confirmLogout = window.confirm(
        `Une session de caisse est actuellement ouverte pour ${currentCashier?.name || 'le caissier'}.\n\n` +
        `• Cliquez sur OK pour vous déconnecter (relève d'équipe, la caisse reste ouverte pour le prochain caissier).\n` +
        `• Pour fermer définitivement la caisse et imprimer le rapport, utilisez plutôt le bouton rouge "Clôturer la Caisse (Z)".`
      );
      if (!confirmLogout) return;
    }

    setCurrentCashier(null);
    localStorage.removeItem('current_cashier');
    document.cookie = 'cashier_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    toast.success('Caissier déconnecté avec succès. Saisissez votre code PIN pour reprendre la caisse.');
    setIsPinModalOpen(true);
  };

  // 🪑 VUE STRICTE DES VENTES SUR TABLE : Seules les commandes sur table en salle (orderType === 'TABLE' ou tableNumber > 0)
  // Les commandes au comptoir (TAKEAWAY) sont strictement exclues de cette vue opérationnelle
  const activeOrders = useMemo(() => {
    return orders.filter((order) => {
      // 🔒 SÉCURITÉ FINANCIÈRE : Les commandes annulées ne figurent jamais dans la file d'encaissement
      if (order.status === 'CANCELLED') return false;

      // 🚫 EXCLUSION COMPTOIR : Les ventes directes au comptoir ne doivent JAMAIS apparaître ici
      const isTakeaway = order.orderType === 'TAKEAWAY' || order.orderType === 'EXPRESS' || Number(order.tableNumber) === 0;
      if (isTakeaway) return false;

      const isPaidAndClosed = order.status === 'SERVED' && order.paymentStatus === 'PAID';

      if (activeFilter === 'ALL') return !isPaidAndClosed;
      if (activeFilter === 'TABLE') return !isPaidAndClosed;
      if (activeFilter === 'SERVED') return isPaidAndClosed;
      return true;
    });
  }, [orders, activeFilter]);

  // 🧾 VENTES COMPTOIR DU JOUR : Liste dédiée des ventes directes / takeaway encaissées
  const takeawayOrders = useMemo(() => {
    return orders.filter((order) => {
      if (order.status === 'CANCELLED') return false;
      const isTakeaway = order.orderType === 'TAKEAWAY' || order.orderType === 'EXPRESS' || Number(order.tableNumber) === 0;
      return isTakeaway;
    });
  }, [orders]);

  const readyOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'READY');
  }, [orders]);

  // Caisse du Jour & Ventes Express : UNIQUEMENT les commandes effectivement ENCAISSÉES (PAID) et NON annulées
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => (o.paymentStatus === 'PAID' || o.paymentStatus === 'STAFF_NP') && o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + getOrderTotal(o), 0);
  }, [orders]);

  const expressRevenue = useMemo(() => {
    return orders
      .filter((o) => (o.orderType === 'TAKEAWAY' || o.orderType === 'EXPRESS' || o.tableNumber === 0) && (o.paymentStatus === 'PAID' || o.paymentStatus === 'STAFF_NP') && o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + getOrderTotal(o), 0);
  }, [orders]);

  // 🗺️ Calcul dynamique du statut de chaque table pour le Plan de Salle Caisse
  const tableCardsData = useMemo(() => {
    const baseTables = dbTables.length > 0 
      ? dbTables 
      : Array.from({ length: 12 }, (_, i) => ({
          id: `virtual-table-${i + 1}`,
          tableNumber: i + 1,
          identifier: `${i + 1}`,
          status: 'FREE',
          clearedAt: null,
          zone: null,
        }));

    return baseTables.map((t: any) => {
      const tableNum = Number(t.tableNumber);
      const clearedAtTime = t.clearedAt ? new Date(t.clearedAt).getTime() : null;

      // Commandes pour cette table (exclut TAKEAWAY et annulées, et antérieures à clearedAt)
      const tableOrders = orders.filter((o) => {
        if (o.orderType === 'TAKEAWAY' || o.orderType === 'EXPRESS' || Number(o.tableNumber) !== tableNum || o.status === 'CANCELLED') return false;
        if (!clearedAtTime) return true;
        return new Date(o.createdAt).getTime() > clearedAtTime;
      });

      // Appel serveur / Demande d'addition
      const hasBillCall = waiterCalls.some((c) => Number(c.tableNumber) === tableNum);

      // Commandes non payées
      const unpaidOrders = tableOrders.filter((o) => o.paymentStatus !== 'PAID' && o.paymentStatus !== 'STAFF_NP');
      const latestUnpaidOrder = unpaidOrders.length > 0 ? unpaidOrders[unpaidOrders.length - 1] : undefined;

      // Commandes payées
      const paidOrders = tableOrders.filter((o) => o.paymentStatus === 'PAID' || o.paymentStatus === 'STAFF_NP');
      const latestPaidOrder = paidOrders.length > 0 ? paidOrders[paidOrders.length - 1] : undefined;

      // Détermination du code couleur strict :
      // 🟢 FREE : Table libre (aucune commande active)
      // 🔴 OCCUPIED : Table occupée (commandes en cours non payées)
      // 🟡 BILL_REQUESTED : Table en attente d'addition ou déjà encaissée en attente de libération
      let visualStatus: 'FREE' | 'OCCUPIED' | 'BILL_REQUESTED' = 'FREE';
      let activeOrder: OrderType | undefined = undefined;

      if (hasBillCall) {
        visualStatus = 'BILL_REQUESTED';
        activeOrder = latestUnpaidOrder || latestPaidOrder;
      } else if (unpaidOrders.length > 0) {
        visualStatus = 'OCCUPIED';
        activeOrder = latestUnpaidOrder;
      } else if (tableOrders.length > 0 && paidOrders.length === tableOrders.length) {
        visualStatus = 'BILL_REQUESTED'; // Encaissée, attente départ / libération
        activeOrder = latestPaidOrder;
      }

      const totalTableAmount = tableOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
      const unpaidAmount = unpaidOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);

      return {
        table: t,
        tableNum,
        identifier: t.identifier || String(tableNum),
        zoneName: t.zone?.name || 'Salle Principale',
        visualStatus,
        tableOrders,
        unpaidOrders,
        paidOrders,
        activeOrder,
        totalTableAmount,
        unpaidAmount,
        hasBillCall,
      };
    });
  }, [dbTables, orders, waiterCalls]);

  const filteredTableCards = useMemo(() => {
    return tableCardsData.filter((card) => {
      if (selectedZoneFilter !== 'ALL' && card.zoneName !== selectedZoneFilter) {
        return false;
      }
      if (tableStatusFilter === 'FREE' && card.visualStatus !== 'FREE') return false;
      if (tableStatusFilter === 'OCCUPIED' && card.visualStatus !== 'OCCUPIED') return false;
      if (tableStatusFilter === 'BILL_REQUESTED' && card.visualStatus !== 'BILL_REQUESTED') return false;
      return true;
    });
  }, [tableCardsData, selectedZoneFilter, tableStatusFilter]);

  const freeTablesCount = useMemo(() => tableCardsData.filter((c) => c.visualStatus === 'FREE').length, [tableCardsData]);
  const occupiedTablesCount = useMemo(() => tableCardsData.filter((c) => c.visualStatus === 'OCCUPIED').length, [tableCardsData]);
  const billRequestedTablesCount = useMemo(() => tableCardsData.filter((c) => c.visualStatus === 'BILL_REQUESTED').length, [tableCardsData]);

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

  // 🔒 VUE 0 : ÉTABLISSEMENT SOUS FORMULE VITRINE TÀMBALI (SANS CAISSE NUMÉRIQUE)
  if (isTambaliPlan && !isLoadingDetails) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900/90 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-lg">
            <Store className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Formule TÀMBALI (Menu Vitrine)</span>
            </div>
            <h1 className="text-xl font-black text-white">Poste Caisse</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Le Poste Caisse n'est pas inclus dans la formule <strong className="text-amber-300">TÀMBALI</strong>.
              Ce pack est dédié à un menu digital vitrine sans prise de commande numérique (l'établissement opérant avec sa propre caisse physique ou prise de commande orale directe).
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={restaurantId ? `/r/${restaurantId}` : '/login'}
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md"
            >
              Voir le Menu Digital
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 🔒 VUE 1 : PAGE DE CONNEXION CAISSIER PLEIN ÉCRAN (SI AUCUN CAISSIER N'EST IDENTIFIÉ)
  if (!currentCashier) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col justify-between font-sans selection:bg-orange-500 selection:text-white p-4 sm:p-8">
        {/* En-tête supérieur */}
        <header className="max-w-md mx-auto w-full flex items-center justify-between py-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Lou Ame Tay ?" className="w-9 h-9 rounded-2xl object-cover border border-amber-500/40" />
            <div>
              <span className="text-base font-black text-white block leading-tight">Lou Ame Tay ?</span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Poste Caisse</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Poste Verrouillé</span>
          </div>
        </header>

        {currentSession && (
          <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveMode('QR_ORDERS')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all ${
                activeMode === 'QR_ORDERS'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              Commandes (QR / Table)
            </button>
            <button
              onClick={() => setActiveMode('NEW_ORDER')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                activeMode === 'NEW_ORDER'
                  ? 'bg-amber-400 text-slate-900 shadow-md'
                  : 'bg-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              Nouveau Ticket (Comptoir / Sur Place)
            </button>
          </div>
        )}


        {/* Carte Centrale de Connexion & Pavé PIN */}
        <main className="max-w-md mx-auto w-full my-auto py-6">
          <div className="bg-slate-950/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            
            {/* Établissement actif - Verrouillé hermétiquement ou sélecteur /cashier */}
            {restaurantId ? (
              <div className="flex flex-col gap-2 bg-white/5 border border-emerald-500/20 p-3 rounded-2xl text-left">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-400/30">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Établissement Dédié</span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                          <Lock className="w-2.5 h-2.5" /> Sécurisé
                        </span>
                      </div>
                      <span className="font-black text-sm text-amber-200 truncate block">{restaurantName || restaurantId}</span>
                    </div>
                  </div>
                </div>
                {!initialRestaurantId && availableRestaurants.length > 1 && (
                  <select
                    value={restaurantId}
                    onChange={(e) => {
                      const val = e.target.value;
                      const found = availableRestaurants.find((r: any) => r.subdomain === val || r.id === val);
                      setRestaurantId(val);
                      localStorage.setItem('current_restaurant_id', val);
                      if (found?.businessName) {
                        setRestaurantName(found.businessName);
                        localStorage.setItem('current_restaurant_name', found.businessName);
                      }
                      setAuthError('');
                      setPinInput('');
                      fetchRestaurantDetails(val);
                      fetchActiveSession(val);
                    }}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs font-bold text-white focus:border-amber-400 outline-none cursor-pointer"
                  >
                    {availableRestaurants.map((r: any) => (
                      <option key={r.id} value={r.subdomain}>
                        🏪 {r.businessName} ({r.subdomain})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              /* Aucun établissement spécifié dans l'URL */
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-left space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Établissement Non Spécifié</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Chaque établissement dispose de son propre terminal caisse dédié et hermétique. Veuillez utiliser le lien fourni par la direction de votre établissement (ex: <code className="text-amber-300 font-mono text-[11px]">/r/votre-restaurant/cashier</code>) ou vous connecter depuis le portail de gestion.
                </p>
                <div className="pt-1">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                  >
                    🔐 Se connecter au Portail Gérant
                  </Link>
                </div>
              </div>
            )}

            {restaurantId ? (
              <>
                {/* Titre & Explication */}
                <div className="space-y-1">
                  <div className="w-14 h-14 bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-2 border border-amber-500/30 shadow-lg shadow-amber-500/10">
                    <KeyRound className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Connexion Caisse</h2>
                  <p className="text-xs text-slate-400">
                    Saisissez votre code PIN caissier à 4 chiffres pour déverrouiller
                  </p>
                </div>

                {/* PIN Code Dots Display */}
                <div className="bg-slate-900 border border-white/10 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-center gap-4">
                    {[0, 1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className={`w-4 h-4 rounded-full transition-all duration-200 ${
                          pinInput.length > idx 
                            ? 'bg-amber-400 scale-125 shadow-lg shadow-amber-400/50' 
                            : 'bg-slate-700 border border-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  {authError && (
                    <p className="text-xs text-rose-400 font-bold pt-1">
                      ⚠️ {authError}
                    </p>
                  )}
                </div>

                {/* Pavé Tactile XXL 3x4 */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 select-none">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handlePinDigit(num)}
                      className="py-3.5 bg-white/5 hover:bg-white/10 active:bg-amber-500 active:text-slate-950 active:scale-95 text-white font-black text-xl rounded-2xl transition-all border border-white/10 shadow-xs cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handlePinDelete}
                    className="py-3.5 bg-white/5 hover:bg-rose-500/20 active:scale-95 text-rose-400 font-bold text-xs rounded-2xl transition-all border border-white/10 cursor-pointer flex items-center justify-center"
                    title="Effacer le dernier chiffre"
                  >
                    ⌫ Effacer
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePinDigit('0')}
                    className="py-3.5 bg-white/5 hover:bg-white/10 active:bg-amber-500 active:text-slate-950 active:scale-95 text-white font-black text-xl rounded-2xl transition-all border border-white/10 shadow-xs cursor-pointer"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePinSubmit()}
                    disabled={pinInput.length !== 4}
                    className="py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-40 text-slate-950 font-black text-xs rounded-2xl transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-1"
                  >
                    <span>Valider ✓</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-md mx-auto w-full text-center text-xs text-slate-500 py-2 border-t border-white/10 flex items-center justify-between">
          <Link href="/login" className="text-slate-400 hover:text-amber-400 transition-colors">
            ← Portail Gérant / Dashboard
          </Link>
          <span>Assistance : {restaurantPhone}</span>
        </footer>
      </div>
    );
  }

  // 🏪 VUE 2 : ESPACE CAISSE OPÉRATIONNEL (CAISSIER AUTHENTIFIÉ SOUS CODE PIN)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 space-y-6">
      {/* 1. TOP HEADER & CASHIER BAR */}
      <header className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black shadow-xs">
                <Receipt className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Poste Caisse — Lou Ame Tay?
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
              <span className="text-slate-800 font-black flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl">
                <Store className="w-3.5 h-3.5 text-amber-600" />
                {restaurantName}
              </span>
              <span className="text-slate-300">•</span>
              
              {currentCashier ? (
                <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-slate-800 font-bold">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <span>En poste : <strong>{currentCashier.name}</strong> ({currentCashier.shift})</span>
                  {currentSession && (
                    <span className="text-slate-500 text-[11px] font-mono">
                      • Fond : {formatFCFA(Number(currentSession.openingFloat))}
                    </span>
                  )}
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

        {/* Quick Actions, Network Status & KPIs */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Badge État Réseau Sénégal */}
          {isOffline ? (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 border border-rose-300 text-rose-800 rounded-2xl text-xs font-black animate-pulse shadow-2xs">
              <WifiOff className="w-4 h-4 text-rose-600" />
              <span>Mode Hors-Ligne</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-black shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Réseau En Ligne</span>
            </div>
          )}

          {/* Bouton de Synchronisation de la File d'Attente Locale */}
          {pendingSyncCount > 0 && (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing || isOffline}
              className="px-3.5 py-2 min-h-[44px] bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs rounded-2xl shadow-xs flex items-center gap-2 transition-all cursor-pointer touch-manipulation border border-amber-500/30"
              title="Synchroniser les commandes enregistrées hors-ligne"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>En attente de synchro ({pendingSyncCount})</span>
            </button>
          )}

          {/* Bouton Simulation Coupure Réseau (QA Terrain Sénégal) */}
          <button
            type="button"
            onClick={handleToggleNetworkOutage}
            className={`px-3 py-2 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border active:scale-95 cursor-pointer touch-manipulation ${
              isOffline
                ? 'bg-rose-600 text-white border-rose-700 shadow-md animate-pulse'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Simuler une coupure réseau Orange/Free"
          >
            {isOffline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 text-slate-500" />}
            <span>{isOffline ? 'Rétablir Réseau' : '🧪 Tester Coupure Réseau'}</span>
          </button>

          {/* 🖨️ Bouton Paramètres Imprimante Thermique */}
          <button
            type="button"
            onClick={() => setIsPrinterModalOpen(true)}
            className="px-3.5 py-2 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl border border-slate-300 transition-all flex items-center gap-2 active:scale-95 cursor-pointer touch-manipulation shadow-2xs"
            title="Configurer l'imprimante thermique (Bluetooth / Système)"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span className="hidden sm:inline">Imprimante :</span>
            <span className={printerType === 'bluetooth' ? 'text-indigo-600 font-black' : 'text-slate-600 font-bold'}>
              {printerType === 'bluetooth' ? 'BT 80mm' : 'Système/PDF'}
            </span>
          </button>

          {/* Bouton Rouge Clôture de Caisse */}
          {currentSession && (
            <button
              type="button"
              onClick={handleOpenCloseSessionModal}
              className="px-4 py-2.5 min-h-[44px] bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-xs flex items-center gap-2 transition-all cursor-pointer touch-manipulation"
              title="Clôturer la caisse et imprimer le rapport Z 80mm"
            >
              <Lock className="w-4 h-4" />
              <span>Clôturer la Caisse (Z)</span>
            </button>
          )}

          {/* Bouton Déconnexion Caissier UNIQUE & ALIGNÉ À DROITE */}
          <button
            type="button"
            onClick={handleLogoutCashier}
            className="px-4 py-2.5 min-h-[48px] bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-sm hover:shadow-md flex items-center gap-2 transition-all cursor-pointer touch-manipulation"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Déconnexion</span>
          </button>

          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all border border-slate-200 active:scale-[0.97] touch-manipulation"
            title="Actualiser les données caisse"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-600' : ''}`} />
          </button>
        </div>
      </header>

        {/* 💳 NOUVELLE CARTE UNIQUE ET ÉPURÉE DU CHIFFRE D'AFFAIRES DU JOUR */}
        <CashierDailyRevenueCard orders={orders} className="shrink-0" />

        {/* Navigation Principale Caisse v2.3 : Ventes sur Table vs Plan de Salle vs Vente Directe vs Ventes Comptoir */}
        <div className="grid grid-cols-2 lg:grid-cols-4 bg-white rounded-3xl shadow-sm border border-slate-200 p-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveMode('QR_ORDERS')}
            className={`py-3.5 px-3 min-h-[50px] rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation border ${
              activeMode === 'QR_ORDERS'
                ? 'bg-slate-900 text-white border-slate-950 shadow-md ring-2 ring-slate-900/10'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xl">🪑</span>
            <span>Ventes sur Table</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeMode === 'QR_ORDERS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {orders.filter((o) => (o.orderType === 'TABLE' || (!o.orderType && Number(o.tableNumber) > 0)) && !(o.status === 'SERVED' && o.paymentStatus === 'PAID') && o.status !== 'CANCELLED').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('TABLE_PLAN');
              fetchDbTables();
            }}
            className={`py-3.5 px-3 min-h-[50px] rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation border ${
              activeMode === 'TABLE_PLAN'
                ? 'bg-indigo-900 text-white border-indigo-950 shadow-md ring-2 ring-indigo-900/10'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xl">🗺️</span>
            <span>Plan de Salle</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeMode === 'TABLE_PLAN'
                ? 'bg-white/20 text-white'
                : occupiedTablesCount > 0
                ? 'bg-rose-100 text-rose-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {occupiedTablesCount > 0 ? `${occupiedTablesCount} occupée(s)` : 'Libres'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!currentSession) {
                toast.error("Veuillez d'abord ouvrir une session de caisse pour saisir une vente directe.");
                setIsOpenSessionModalOpen(true);
                return;
              }
              setActiveMode('NEW_ORDER');
            }}
            className={`py-3.5 px-3 min-h-[50px] rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation border ${
              activeMode === 'NEW_ORDER'
                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400/30'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xl">🛍️</span>
            <span>+ Vente Directe</span>
            {cartItems.length > 0 && (
              <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full text-xs font-mono font-black">
                {cartItems.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('TAKEAWAY_ORDERS')}
            className={`py-3.5 px-3 min-h-[50px] rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation border ${
              activeMode === 'TAKEAWAY_ORDERS'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-700/20'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xl">🧾</span>
            <span>Ventes Comptoir</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeMode === 'TAKEAWAY_ORDERS' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {takeawayOrders.length}
            </span>
          </button>
        </div>

      {activeMode === 'NEW_ORDER' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Grille Tactile des Produits (7/12 colonnes) */}
          <div className="lg:col-span-7 xl:col-span-8 h-[calc(100vh-270px)] min-h-[560px]">
            <TactileGrid
              categories={menuCategories}
              onAddItem={handleAddToCart}
            />
          </div>

          {/* Ticket de Caisse & Encaissement Direct (5/12 colonnes) */}
          <div className="lg:col-span-5 xl:col-span-4 h-[calc(100vh-270px)] min-h-[560px]">
            <CashierCart
              items={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onClear={() => setCartItems([])}
              onSubmit={handleSubmitNewOrder}
              isSubmitting={isSubmittingNewOrder}
            />
          </div>
        </div>
      ) : activeMode === 'TAKEAWAY_ORDERS' ? (
        /* VUE 3 : HISTORIQUE DES VENTES COMPTOIR DU JOUR */
        <section className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-xs">
                🧾
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-emerald-950">Ventes Directes &amp; Comptoir (Takeaway)</h2>
                <p className="text-xs text-emerald-700">
                  Historique certifié des ventes directes déjà encaissées. Les tickets sont réglés et justifiés dans votre rapport Z.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-900 bg-white border border-emerald-300 px-4 py-2 rounded-2xl shadow-xs">
                Total Ventes Comptoir : <strong className="font-mono text-emerald-950 text-sm sm:text-base font-black">{formatFCFA(expressRevenue)}</strong>
              </span>
            </div>
          </div>

          {takeawayOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-3xl">
                🛍️
              </div>
              <h3 className="text-base font-bold text-slate-800">Aucune vente comptoir pour le moment</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Les commandes enregistrées en mode "Vente Directe / Comptoir" apparaîtront automatiquement ici dès leur encaissement.
              </p>
              <button
                type="button"
                onClick={() => setActiveMode('NEW_ORDER')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-2xl text-xs font-black shadow-xs transition-all cursor-pointer"
              >
                <span>+ Nouvelle Vente Directe</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {takeawayOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border-2 border-emerald-300 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all"
                >
                  {/* Card Header */}
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base sm:text-lg font-black tracking-tight text-amber-400">
                        ⚡ COMPTOIR
                      </span>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/15 text-white">
                        #{order.id.slice(-5).toUpperCase()}
                      </span>
                      {renderPaymentBadge(order.paymentMethod)}
                    </div>
                    <span className="text-[11px] font-bold opacity-90 font-mono">
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
                          </div>
                          <span className="font-mono font-bold text-slate-700 shrink-0">
                            {formatFCFA(Number(item.price) * Number(item.quantity))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-bold uppercase">Total Encaissé :</span>
                      <span className="text-lg font-black text-emerald-950 font-mono">{formatFCFA(getOrderTotal(order))}</span>
                    </div>

                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Encaissée &amp; Validée</span>
                      </span>
                      <span className="font-mono text-[11px] text-emerald-700">
                        {order.servedAt ? new Date(order.servedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Payé'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => printOrderReceipt(order)}
                      className="w-full py-2.5 px-3 min-h-[44px] bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98 touch-manipulation"
                    >
                      <Printer className="w-4 h-4 text-amber-400" />
                      <span>Réimprimer le Ticket</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : activeMode === 'TABLE_PLAN' ? (
        /* VUE 4 : PLAN DE SALLE & GESTION DES TABLES */
        <section className="space-y-5 animate-in fade-in">
          {/* Header & Statistiques Visuelles Plan de Salle */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-amber-400 flex items-center justify-center text-2xl shadow-xs">
                🗺️
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>Plan de Salle &amp; Statut des Tables</span>
                  <span className="text-xs font-mono font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full">
                    {tableCardsData.length} tables
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Code couleur temps réel : 🟢 Libre • 🔴 Occupée • 🟡 Addition demandée / À libérer
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fetchDbTables()}
                className="px-3.5 py-2.5 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black rounded-2xl flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs touch-manipulation"
                title="Actualiser le plan de salle"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualiser les tables</span>
              </button>
            </div>
          </div>

          {/* Filtres d'état et de zone */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filtres par état (Vert, Rouge, Jaune) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setTableStatusFilter('ALL')}
                className={`px-3.5 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer touch-manipulation ${
                  tableStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-950 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>Toutes</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20">
                  {tableCardsData.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTableStatusFilter('FREE')}
                className={`px-3.5 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer touch-manipulation ${
                  tableStatusFilter === 'FREE'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-emerald-800 hover:bg-emerald-50 border-emerald-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>🟢 Libres</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-100 text-emerald-900 font-black">
                  {freeTablesCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTableStatusFilter('OCCUPIED')}
                className={`px-3.5 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer touch-manipulation ${
                  tableStatusFilter === 'OCCUPIED'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                    : 'bg-white text-rose-800 hover:bg-rose-50 border-rose-200'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span>🔴 Occupées</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-100 text-rose-900 font-black">
                  {occupiedTablesCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTableStatusFilter('BILL_REQUESTED')}
                className={`px-3.5 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 border cursor-pointer touch-manipulation ${
                  tableStatusFilter === 'BILL_REQUESTED'
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                    : 'bg-white text-amber-900 hover:bg-amber-50 border-amber-300'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>🟡 Addition / À Libérer</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-100 text-amber-950 font-black">
                  {billRequestedTablesCount}
                </span>
              </button>
            </div>

            {/* Sélecteur de zone (si zones multiples) */}
            {zones.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Zone :</span>
                <select
                  value={selectedZoneFilter}
                  onChange={(e) => setSelectedZoneFilter(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Toutes les zones ({zones.length})</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.name}>{z.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Grille Tactile des Tables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTableCards.map((card) => {
              const isFree = card.visualStatus === 'FREE';
              const isOccupied = card.visualStatus === 'OCCUPIED';
              const isBill = card.visualStatus === 'BILL_REQUESTED';

              return (
                <div
                  key={card.table.id || card.tableNum}
                  className={`rounded-3xl border-2 p-4 flex flex-col justify-between transition-all shadow-xs hover:shadow-md ${
                    isFree
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : isOccupied
                      ? 'bg-rose-50/80 border-rose-400 text-rose-950'
                      : 'bg-amber-50 border-amber-400 text-amber-950 ring-2 ring-amber-400/30'
                  }`}
                >
                  {/* Top Bar : Numéro & Zone */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                            Table {card.identifier}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-600 block">
                          📍 {card.zoneName}
                        </span>
                      </div>

                      {/* Statut Badge */}
                      <div>
                        {isFree ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>LIBRE</span>
                          </span>
                        ) : isOccupied ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-600 text-white shadow-xs animate-pulse">
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                            <span>OCCUPÉE</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-400 text-slate-950 shadow-xs animate-bounce">
                            <Receipt className="w-3.5 h-3.5" />
                            <span>{card.hasBillCall ? 'ADDITION !' : 'À LIBÉRER'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenu Carte */}
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 space-y-2">
                      {isFree ? (
                        <div className="py-4 text-center space-y-1">
                          <span className="text-3xl block">🍽️</span>
                          <p className="text-xs font-bold text-emerald-800">
                            Table propre et disponible
                          </p>
                          <p className="text-[11px] text-emerald-700/80">
                            Prête pour de nouveaux clients
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Client Info */}
                          {card.activeOrder?.customerName && (
                            <div className="text-xs font-bold bg-white/80 px-2.5 py-1.5 rounded-xl text-slate-800 flex items-center gap-1.5 shadow-2xs">
                              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="truncate">Client : <strong>{card.activeOrder.customerName}</strong></span>
                            </div>
                          )}

                          {/* Montant & Plats */}
                          <div className="bg-white/90 p-2.5 rounded-2xl border border-slate-200/80 space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 font-bold">
                                {card.unpaidOrders.length > 0 ? 'À régler :' : 'Total réglé :'}
                              </span>
                              <span className="font-mono font-black text-base sm:text-lg text-slate-950">
                                {formatFCFA(card.unpaidOrders.length > 0 ? card.unpaidAmount : card.totalTableAmount)}
                              </span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-500 flex items-center justify-between">
                              <span>{card.tableOrders.length} commande(s)</span>
                              <span>
                                {card.unpaidOrders.length === 0 ? '✅ Tout payé' : `⚠️ ${card.unpaidOrders.length} impayée(s)`}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Rapides Carte Table */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                    {/* Si la table est occupée avec commande non encaissée : Bouton Encaisser */}
                    {isOccupied && card.activeOrder && (
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentModal(card.activeOrder!)}
                        className="w-full min-h-[46px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Encaisser {formatFCFA(card.unpaidAmount)}</span>
                      </button>
                    )}

                    {/* Si addition demandée et commande non encore encaissée */}
                    {isBill && card.unpaidOrders.length > 0 && card.activeOrder && (
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentModal(card.activeOrder!)}
                        className="w-full min-h-[46px] px-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>Encaisser l&apos;Addition</span>
                      </button>
                    )}

                    {/* Bouton ACTION MAÎTRESSE : Libérer la table */}
                    {!isFree && (
                      <button
                        type="button"
                        onClick={() => handleReleaseTable(card.tableNum, card.table.id)}
                        disabled={releasingTableNum === card.tableNum}
                        className={`w-full min-h-[48px] px-3 font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
                          card.unpaidOrders.length === 0
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            : 'bg-white hover:bg-rose-100 text-rose-800 border-2 border-rose-300'
                        }`}
                        title={
                          card.unpaidOrders.length === 0
                            ? 'Libérer la table (Remettre en service)'
                            : 'Impossible de libérer : commandes non encaissées'
                        }
                      >
                        <DoorOpen className="w-4 h-4 shrink-0" />
                        <span>
                          {releasingTableNum === card.tableNum
                            ? 'Libération en cours...'
                            : card.unpaidOrders.length === 0
                            ? '🧹 Libérer la Table (Remettre Libre)'
                            : '🧹 Libérer la Table'}
                        </span>
                      </button>
                    )}

                    {/* Pour les tables libres : indicateur visuel passif */}
                    {isFree && (
                      <div className="w-full py-2.5 text-center text-[11px] font-bold text-emerald-700 bg-emerald-100/60 rounded-xl">
                        ✓ Prête pour service
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <>
      {/* 1.5. BANDEAU DES DEMANDES D'ADDITION ET APPELS DE SALLE */}
      {waiterCalls.length > 0 && (
        <section className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-3xl p-4 sm:p-5 shadow-lg border-2 border-purple-400/80 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded-2xl animate-bounce">
                <Receipt className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>Demande d&apos;addition en salle</span>
                  <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full">
                    {waiterCalls.length} en attente
                  </span>
                </h3>
                <p className="text-xs text-purple-200">
                  Des clients demandent leur note à table. Préparez le ticket et procédez au règlement ci-dessous.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {waiterCalls.map((call) => (
                <div
                  key={call.id}
                  className="bg-white/10 hover:bg-white/20 border border-purple-300/40 px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs font-black transition-all"
                >
                  <span className="text-amber-300">Table {call.tableNumber}</span>
                  <button
                    type="button"
                    onClick={() => handleResolveWaiterCall(call.id)}
                    className="ml-1 px-2 py-0.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer"
                    title="Acquitter l'appel"
                  >
                    Acquitter ✓
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. FILTER TABS & VIEW TOGGLE (DATA TABLE vs CARDS) */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
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
            <span>Toutes les Tables Ouvertes</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeFilter === 'ALL' ? 'bg-white/20 text-white font-black' : 'bg-slate-100 text-slate-700 font-bold'
            }`}>
              {orders.filter((o) => (o.orderType === 'TABLE' || (!o.orderType && Number(o.tableNumber) > 0)) && !(o.status === 'SERVED' && o.paymentStatus === 'PAID') && o.status !== 'CANCELLED').length}
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
            <UtensilsCrossed className="w-4 h-4 text-slate-950 shrink-0" />
            <span>Tables à Encaisser</span>
            <span className="bg-slate-900/10 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-mono font-black">
              {orders.filter((o) => (o.orderType === 'TABLE' || (!o.orderType && Number(o.tableNumber) > 0)) && o.paymentStatus !== 'PAID' && o.status !== 'CANCELLED').length}
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
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>Tables Clôturées du Jour</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeFilter === 'SERVED' ? 'bg-white/20 text-white font-black' : 'bg-emerald-100 text-emerald-800 font-bold'
            }`}>
              {orders.filter((o) => (o.orderType === 'TABLE' || (!o.orderType && Number(o.tableNumber) > 0)) && o.status === 'SERVED' && o.paymentStatus === 'PAID').length}
            </span>
          </button>
        </div>

        {/* Sélecteur de mode d'affichage : Tableau de Données (Par défaut) vs Cartes */}
        <div className="flex items-center bg-white p-1 border border-slate-200 rounded-2xl shadow-2xs">
          <button
            type="button"
            onClick={() => setOrdersViewMode('TABLE')}
            className={`px-3.5 py-1.5 min-h-[40px] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              ordersViewMode === 'TABLE'
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vue Tableau de Données (Recherche instantanée & Pagination)"
          >
            <List className="w-4 h-4" />
            <span>Tableau (Data Table)</span>
          </button>
          <button
            type="button"
            onClick={() => setOrdersViewMode('CARDS')}
            className={`px-3.5 py-1.5 min-h-[40px] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              ordersViewMode === 'CARDS'
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vue Cartes Visuelles"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Cartes</span>
          </button>
        </div>
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

      {/* 4. ORDERS VIEW : DATA TABLE PAR DÉFAUT OU GRILLE DE CARTES */}
      {ordersViewMode === 'TABLE' ? (
        <OrdersDataTable
          orders={orders}
          onViewOrder={handleViewOrder}
          onPayOrder={(ord) => handleOpenPaymentModal(ord)}
          onPrintReceipt={(ord) => printOrderReceipt(ord)}
          isLoading={isLoading}
        />
      ) : (
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {activeOrders.length === 0 ? (
          <div className="col-span-full py-14 text-center text-slate-500 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              {activeFilter === 'SERVED' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <Receipt className="w-8 h-8 text-slate-400" />
              )}
            </div>
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
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{orders.filter((o) => o.status === 'SERVED').length} commande(s) servie(s) et clôturée(s) aujourd&apos;hui</span>
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
                      {isExpress ? '⚡ COMPTOIR' : (order.locationDetail || `TABLE ${order.tableNumber}`)}
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

                  {order.status === 'SERVED' && order.paymentStatus === 'PAID' ? (
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

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(order)}
                          className="min-h-[46px] px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
                          title="Réimprimer le ticket de caisse 80mm"
                        >
                          <Printer className="w-4 h-4 shrink-0" />
                          <span>Ticket 80mm</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendWhatsAppReceipt(order)}
                          className="min-h-[46px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.97]"
                          title="Envoyer le reçu numérique par WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                          <span>Reçu WhatsApp</span>
                        </button>
                      </div>

                      {order.tableNumber > 0 && (
                        <button
                          type="button"
                          onClick={() => handleReleaseTable(order.tableNumber)}
                          disabled={releasingTableNum === order.tableNumber}
                          className="w-full min-h-[46px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer touch-manipulation"
                          title="Libérer la table et la remettre en service"
                        >
                          <DoorOpen className="w-4 h-4 shrink-0" />
                          <span>{releasingTableNum === order.tableNumber ? 'Libération...' : '🧹 Libérer la Table (Remettre Libre)'}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {order.status === 'SERVED' ? (
                        <div className="p-2.5 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-center justify-between text-xs text-amber-950 font-black shadow-xs">
                          <span className="flex items-center gap-1.5">
                            <span className="text-base">🍽️</span>
                            <span>Servie — En attente de paiement</span>
                          </span>
                          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
                            Non Encaissée
                          </span>
                        </div>
                      ) : (
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
                      )}

                      {/* Bouton Final Encaisser & Clôturer */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1 justify-between text-[11px]">
                          <span className="text-slate-500 font-bold">Règlement :</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(order, 'CASH')}
                              className="px-2 py-1 rounded bg-slate-200 hover:bg-emerald-600 hover:text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Encaisser en Espèces"
                            >
                              <Banknote className="w-3 h-3" />
                              <span>Cash</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(order, 'WAVE')}
                              className="px-2 py-1 rounded bg-slate-200 hover:bg-cyan-600 hover:text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Encaisser en Wave"
                            >
                              <Smartphone className="w-3 h-3" />
                              <span>Wave</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(order, 'ORANGE_MONEY')}
                              className="px-2 py-1 rounded bg-slate-200 hover:bg-orange-600 hover:text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Encaisser en Orange Money"
                            >
                              <Phone className="w-3 h-3" />
                              <span>OM</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenPaymentModal(order, 'YAS_MONEY')}
                              className="px-2 py-1 rounded bg-slate-200 hover:bg-purple-600 hover:text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Encaisser en Yas Money"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Yas</span>
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenPaymentModal(order, 'CASH')}
                          className="w-full min-h-[48px] px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer touch-manipulation"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Encaisser &amp; Clôturer</span>
                        </button>

                        {order.tableNumber > 0 && (
                          <button
                            type="button"
                            onClick={() => handleReleaseTable(order.tableNumber)}
                            disabled={releasingTableNum === order.tableNumber}
                            className="w-full min-h-[38px] px-3 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 hover:border-rose-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer touch-manipulation"
                            title="Tenter de libérer la table"
                          >
                            <DoorOpen className="w-3.5 h-3.5" />
                            <span>Libérer la Table {order.tableNumber}</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>
      )}
      </>
      )}

      {/* MODAL 1 : IDENTIFICATION CAISSIER PAR CODE PIN */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-5">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Identification Caissier</h3>
              <p className="text-xs text-slate-500">
                {restaurantId ? `Établissement : ${restaurantName}` : 'Sélectionnez votre établissement et saisissez votre code PIN'}
              </p>
            </div>

            {/* Sélecteur d'établissement si non configuré */}
            {!restaurantId && (
              <div className="space-y-1.5 p-3 bg-orange-50 border border-orange-200 rounded-2xl text-left">
                <label className="block text-[11px] font-bold text-orange-950 uppercase">Établissement :</label>
                <select
                  value={restaurantId}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id) {
                      setRestaurantId(id);
                      localStorage.setItem('current_restaurant_id', id);
                      fetchRestaurantDetails(id);
                      fetchCashiersList(id);
                      fetchActiveSession(id);
                      setAuthError('');
                    }
                  }}
                  className="w-full p-2 bg-white border border-orange-300 rounded-xl text-xs font-bold text-slate-800"
                >
                  <option value="">-- Choisir votre établissement --</option>
                  <option value="anima-pizzeria">🍕 Anima Pizzeria</option>
                  <option value="madiba-restaurant">☕ MADIBA RESTAURANT</option>
                  <option value="sams-prestige">🍽️ Sam's Prestige Restaurant</option>
                  <option value="hotel-lat-dior">🏨 Hôtel Résidence Lat-Dior</option>
                </select>
              </div>
            )}

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

      {/* MODAL 3 : CLÔTURE COMPTABLE INTELLIGENTE MULTI-CANAUX (RAPPORT Z 80MM) */}
      <CashClosureModal
        isOpen={isCloseSessionModalOpen}
        onClose={() => setIsCloseSessionModalOpen(false)}
        onSessionClosed={(closedSession) => {
          setIsCloseSessionModalOpen(false);
          setCurrentSession(null);
          setCurrentCashier(null);
          localStorage.removeItem('current_cashier');
          toast.info('Session de caisse clôturée avec succès. Vous pouvez démarrer un nouveau shift.');
        }}
        session={liveSessionDetails || currentSession}
        cashierName={currentCashier?.name}
        restaurantName={restaurantName}
      />

      {/* MODAL 4 : ENCAISSEMENT OBLIGATOIRE DE COMMANDE AVEC CALCUL MONNAIE */}
      {isPaymentModalOpen && orderToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-5">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <Banknote className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Encaissement Commande #{orderToPay.id.slice(-5).toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">
                    {orderToPay.orderType === 'EXPRESS' || orderToPay.tableNumber === 0
                      ? '⚡ Comptoir Express'
                      : `🍽️ Table ${orderToPay.tableNumber}`}
                    {orderToPay.customerName && ` • Client : ${orderToPay.customerName}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPaymentModalOpen(false);
                  setOrderToPay(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              {/* Total Dû */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block">
                    Total Net à Encaisser
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                    {formatFCFA(getOrderTotal(orderToPay))}
                  </span>
                </div>
                <div className="text-right text-xs text-slate-300 font-bold">
                  <div>{orderToPay.items?.length || 0} article(s)</div>
                  <div className="text-[10px] text-slate-400 font-normal">TVA incluse</div>
                </div>
              </div>

              {/* Choix du moyen de paiement */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Moyen de paiement :
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('CASH');
                      setAmountReceivedInput(String(getOrderTotal(orderToPay)));
                    }}
                    className={`p-2 min-h-[48px] rounded-xl text-center text-xs font-bold border transition-all cursor-pointer touch-manipulation flex flex-col items-center justify-center ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-black shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-base">💵</div>
                    <div className="text-[10px]">Espèces</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WAVE')}
                    className={`p-2 min-h-[48px] rounded-xl text-center text-xs font-bold border transition-all cursor-pointer touch-manipulation flex flex-col items-center justify-center ${
                      paymentMethod === 'WAVE'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-950 font-black shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-base">🌊</div>
                    <div className="text-[10px]">Wave</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ORANGE_MONEY')}
                    className={`p-2 min-h-[48px] rounded-xl text-center text-xs font-bold border transition-all cursor-pointer touch-manipulation flex flex-col items-center justify-center ${
                      paymentMethod === 'ORANGE_MONEY'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-black shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-base">🍊</div>
                    <div className="text-[10px]">Orange M.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('YAS_MONEY')}
                    className={`p-2 min-h-[48px] rounded-xl text-center text-xs font-bold border transition-all cursor-pointer touch-manipulation flex flex-col items-center justify-center ${
                      paymentMethod === 'YAS_MONEY'
                        ? 'border-purple-500 bg-purple-50 text-purple-950 font-black shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-base">🟣</div>
                    <div className="text-[10px]">Yas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-2 min-h-[48px] rounded-xl text-center text-xs font-bold border transition-all cursor-pointer touch-manipulation flex flex-col items-center justify-center ${
                      paymentMethod === 'CARD'
                        ? 'border-blue-500 bg-blue-50 text-blue-950 font-black shadow-2xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-base">💳</div>
                    <div className="text-[10px]">Carte/TPE</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('STAFF_MEAL');
                      setAmountReceivedInput('0');
                    }}
                    className={`p-2 min-h-[48px] rounded-xl text-center text-xs font-bold border transition-all cursor-pointer touch-manipulation flex flex-col items-center justify-center ${
                      paymentMethod === 'STAFF_MEAL'
                        ? 'border-purple-600 bg-purple-100 text-purple-950 font-black shadow-2xs ring-2 ring-purple-400'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-base">👤</div>
                    <div className="text-[10px]">Repas NP</div>
                  </button>
                </div>
              </div>

              {/* Section Spécifique selon le mode de règlement */}
              {paymentMethod === 'CASH' ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Montant reçu du client (FCFA) :
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={amountReceivedInput}
                      onChange={(e) => setAmountReceivedInput(e.target.value)}
                      className="w-full text-xl font-mono font-black p-3 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                      placeholder="0"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Boutons Coupures Rapides */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setAmountReceivedInput(String(getOrderTotal(orderToPay)))}
                      className="px-3 py-2 min-h-[44px] bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors touch-manipulation"
                    >
                      Montant exact ({formatFCFA(getOrderTotal(orderToPay))})
                    </button>
                    {[5000, 10000, 20000].map((bill) => {
                      if (bill < getOrderTotal(orderToPay) && bill !== 5000) return null;
                      return (
                        <button
                          key={bill}
                          type="button"
                          onClick={() => setAmountReceivedInput(String(bill))}
                          className="px-3 py-2 min-h-[44px] bg-white hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-300 transition-colors touch-manipulation"
                        >
                          {formatFCFA(bill)}
                        </button>
                      );
                    })}
                  </div>

                  {/* Résultat Calcul Monnaie Rendue */}
                  {(() => {
                    const total = getOrderTotal(orderToPay);
                    const received = Number(amountReceivedInput) || 0;
                    const change = received - total;

                    if (received === 0) return null;

                    if (change >= 0) {
                      return (
                        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-950 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Monnaie à rendre :
                          </span>
                          <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800">
                            {formatFCFA(change)}
                          </span>
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-3 bg-rose-50 border-2 border-rose-500 rounded-2xl text-rose-950 flex items-center justify-between shadow-xs animate-in shake">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-rose-600 text-white rounded-xl">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-wider text-rose-800">
                              Montant insuffisant (Manque) :
                            </span>
                          </div>
                          <span className="text-lg sm:text-xl font-black font-mono text-rose-700">
                            - {formatFCFA(Math.abs(change))}
                          </span>
                        </div>
                      );
                    }
                  })()}
                </div>
              ) : paymentMethod === 'STAFF_MEAL' ? (
                <div className="space-y-3 bg-purple-50 p-4 rounded-2xl border-2 border-purple-300 text-purple-950">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-600 text-white rounded-xl">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-wide">Repas Personnel (Bon NP)</h4>
                      <p className="text-[11px] text-purple-800">
                        Ce montant ({formatFCFA(getOrderTotal(orderToPay))}) sera consigné pour déduction sur salaire et exclu de la caisse espèces.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-purple-950 mb-1">
                      Nom complet de l'employé bénéficiaire * :
                    </label>
                    <input
                      type="text"
                      required
                      value={staffEmployeeName}
                      onChange={(e) => setStaffEmployeeName(e.target.value)}
                      placeholder="Ex: Babacar Ndiaye (Cuisinier), Awa (Serveuse)..."
                      className="w-full text-sm font-bold p-3 rounded-xl border border-purple-300 bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-200 outline-none text-slate-900"
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                /* Section Mobile Money & Carte */
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800">
                      Règlement numérique : {paymentMethod}
                    </div>
                    <p>
                      Vérifiez la réception du virement de{' '}
                      <strong>{formatFCFA(getOrderTotal(orderToPay))}</strong> sur votre compte marchand (
                      {restaurantPhone}).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Référence / ID de transaction (facultatif) :
                    </label>
                    <input
                      type="text"
                      value={transactionRefInput}
                      onChange={(e) => setTransactionRefInput(e.target.value)}
                      placeholder="Ex: WAV-123456 ou ID SMS..."
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setOrderToPay(null);
                  }}
                  className="flex-1 py-3 min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all cursor-pointer touch-manipulation"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={
                    isProcessingPayment ||
                    isPaymentSuccess ||
                    (paymentMethod === 'CASH' &&
                      Number(amountReceivedInput) < getOrderTotal(orderToPay)) ||
                    (paymentMethod === 'STAFF_MEAL' && !staffEmployeeName.trim())
                  }
                  className={`flex-1 py-3 min-h-[48px] ${
                    isPaymentSuccess
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-300 shadow-lg scale-[1.02]'
                      : isProcessingPayment
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } disabled:bg-slate-300 disabled:cursor-not-allowed font-black text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 touch-manipulation`}
                >
                  {isPaymentSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                      <span className="text-sm font-black tracking-wide uppercase">
                        ✓ ENCAISSEMENT RÉUSSI !
                      </span>
                    </>
                  ) : isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Encaissement en cours...</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-4 h-4" />
                      <span>Valider & Imprimer Ticket 80mm</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🖨️ Modale Paramètres Imprimante Thermique */}
      {isPrinterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Header Modale */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-400/30">
                  <Printer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide">Paramètres Imprimante 80mm</h3>
                  <p className="text-xs text-slate-400">Tickets de caisse & Reçus clients</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPrinterModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase text-slate-700 tracking-wider">
                  Mode d'impression par défaut :
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPrinterType('native');
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('louametay_printer_type', 'native');
                      }
                      toast.info('Mode d\'impression configuré sur : Système / PDF');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      printerType === 'native'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xl mb-1">🖨️</div>
                    <div className="text-sm font-black">Système / PDF</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Impression universelle via la boîte de dialogue système / PDF.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPrinterType('bluetooth');
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('louametay_printer_type', 'bluetooth');
                      }
                      toast.info('Mode d\'impression configuré sur : Bluetooth ESC/POS');
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      printerType === 'bluetooth'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xl mb-1">📶</div>
                    <div className="text-sm font-black">Bluetooth ESC/POS</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Envoi direct sans popup vers l'imprimante thermique portable 80mm.
                    </div>
                  </button>
                </div>
              </div>

              {/* Section Appairage Bluetooth si mode BT sélectionné */}
              {printerType === 'bluetooth' && (
                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bluetooth className={`w-5 h-5 ${isBluetoothConnected ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="text-xs font-black text-indigo-950">Statut Bluetooth</div>
                        <div className="text-[11px] text-indigo-800">
                          {isBluetoothConnected
                            ? `Connecté à : ${bluetoothDeviceName || 'Imprimante ESC/POS'}`
                            : 'Aucune imprimante connectée pour le moment'}
                        </div>
                      </div>
                    </div>
                    {isBluetoothConnected ? (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-lg">
                        Actif
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg">
                        Non appairé
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isConnectingBt}
                    onClick={handleConnectBluetooth}
                    className="w-full py-3 min-h-[44px] bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-400 touch-manipulation"
                  >
                    {isConnectingBt ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Recherche de l'imprimante...</span>
                      </>
                    ) : (
                      <>
                        <Bluetooth className="w-4 h-4" />
                        <span>
                          {isBluetoothConnected ? 'Reconnecter une autre imprimante' : 'Appairer l\'imprimante Bluetooth'}
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-indigo-700">
                    💡 Allumez votre imprimante Bluetooth 80mm et activez le Bluetooth de votre appareil.
                  </p>
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const sampleOrder: any = {
                      id: 'TEST-' + Math.floor(1000 + Math.random() * 9000),
                      tableNumber: 0,
                      isTakeaway: true,
                      paymentMethod: 'CASH',
                      paymentStatus: 'PAID',
                      createdAt: new Date().toISOString(),
                      items: [
                        { name: 'Thieboudienne Penda Mbaye (Test)', quantity: 1, unitPrice: 2500, totalPrice: 2500 },
                        { name: 'Jus de Bissap Maison (Test)', quantity: 1, unitPrice: 1000, totalPrice: 1000 },
                      ],
                    };
                    printOrderReceipt(sampleOrder);
                    toast.success('Ticket test envoyé à l\'imprimante !');
                  }}
                  className="flex-1 py-3 min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4 h-4 text-slate-600" />
                  <span>Ticket Test</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrinterModalOpen(false)}
                  className="flex-1 py-3 min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl transition-all cursor-pointer touch-manipulation"
                >
                  Terminer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5 : DÉTAIL COMPLET DE COMMANDE */}
      <OrderDetailModal
        order={selectedOrderForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedOrderForDetail(null);
        }}
        onPayOrder={(ord) => handleOpenPaymentModal(ord)}
        onPrintReceipt={(ord) => printOrderReceipt(ord)}
        onSendWhatsApp={(ord) => handleSendWhatsAppReceipt(ord)}
      />
    </div>
  );
}