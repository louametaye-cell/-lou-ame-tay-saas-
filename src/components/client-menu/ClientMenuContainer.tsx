'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TableStickyHeader } from './TableStickyHeader';
import { CategoryNavbar } from './CategoryNavbar';
import { MenuItemCard } from './MenuItemCard';
import { ItemDetailDrawer } from './ItemDetailDrawer';
import { FloatingCartBar } from './FloatingCartBar';
import { CartCheckoutDrawer } from './CartCheckoutDrawer';
import { OrderSuccessTracker } from './OrderSuccessTracker';
import { ActiveOrderFloatingPill } from './ActiveOrderFloatingPill';
import { DailySpecialsSection } from './DailySpecialsSection';
import { WeeklyMenuCustomerBanner } from './WeeklyMenuCustomerBanner';
import { SplitBillDrawer } from './SplitBillDrawer';
import { UpsellDrawer } from './UpsellDrawer';
import { TableSessionModal } from './TableSessionModal';
import { MobileMoneyCheckout } from './MobileMoneyCheckout';
import { ComboSection } from './ComboSection';
import { CallWaiterModal } from './CallWaiterModal';
import { GoogleReviewBanner } from './GoogleReviewBanner';
import { RestaurantFooterInfo } from './RestaurantFooterInfo';
import { RestaurantClosedView } from '@/components/RestaurantClosedView';
import { TableWelcomeModal } from './TableWelcomeModal';
import { 
  RestaurantType, 
  MenuItemType, 
  CartItemOption, 
  OrderType, 
  Language, 
  CurrencyCode, 
  ExchangeRates 
} from '@/types';
import { DEFAULT_EXCHANGE_RATES, formatFCFA } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { 
  getUIText, 
  translateCategoryName, 
  getSynchronousDishTranslation 
} from '@/lib/translation-engine';
import { useMenuSchedule } from '@/hooks/useMenuSchedule';
import { toast } from 'sonner';
import { Clock, Users } from 'lucide-react';

interface ClientMenuContainerProps {
  initialRestaurant: RestaurantType;
  tableNumber: number;
  isExpress?: boolean;
  orderContext?: {
    waiterId?: string;
    waiterName?: string;
    zoneId?: string;
    locationDetail?: string;
  };
}

export const ClientMenuContainer: React.FC<ClientMenuContainerProps> = ({
  initialRestaurant,
  tableNumber,
  isExpress = false,
  orderContext,
}) => {
  const [restaurant, setRestaurant] = useState<RestaurantType>(initialRestaurant);
  const [currentLang, setCurrentLang] = useState<Language>('FR');
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('FCFA');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    initialRestaurant.categories[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Schedule Hook
  const schedule = useMenuSchedule();

  // Fetch live daily exchange rates
  useEffect(() => {
    fetch('/api/exchange-rates')
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch(() => {
        // Fallback to default rates
      });
  }, []);

  // Sync with Cart Store
  const {
    items,
    addItem,
    removeItem,
    deleteItem,
    clearCart,
    getTotalCount,
    getTotalPrice,
    getItemQuantity,
    customerNote,
    setCustomerNote,
    customerName,
    setCustomerName,
    paymentMethod,
    setPaymentMethod,
    setTableNumber,
    setRestaurantId,
  } = useCartStore();

  useEffect(() => {
    const currentStoreRestoId = useCartStore.getState().restaurantId;
    if (restaurant?.id && currentStoreRestoId && currentStoreRestoId !== restaurant.id) {
      clearCart();
    }
    if (tableNumber !== undefined) {
      setTableNumber(tableNumber);
    }
    if (restaurant?.id) {
      setRestaurantId(restaurant.id);
    }
  }, [tableNumber, restaurant?.id, setTableNumber, setRestaurantId, clearCart]);

  // UI state for drawers/modals
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItemType | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isMobileMoneyOpen, setIsMobileMoneyOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderType | null>(null);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState(false);

  // 🔒 Smart Contextual Release States (Cas 2 : Table mal libérée & scans simultanés)
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [welcomeModalData, setWelcomeModalData] = useState<{
    elapsedMinutes?: number;
    lastOrderTotal?: number;
    sessionId?: string;
  } | null>(null);
  const [joinedSessionBanner, setJoinedSessionBanner] = useState<{
    isJoined: boolean;
    count: number;
    total: number;
  } | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  // Table session accumulated orders with 2-Hour TTL Auto-Reset (chargé côté client pour éliminer toute erreur d'hydratation SSR)
  const [sessionOrders, setSessionOrders] = useState<OrderType[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      // 🔒 NETTOYAGE D'INTÉGRITÉ MULTI-TENANT PROACTIF & DÉFINITIF :
      // Éradiquer immédiatement toute ancienne clé globale non cloisonnée (^louametay_session_orders_\d+$)
      // pour garantir qu'aucune commande résiduelle d'un autre restaurant ne puisse contaminer un smartphone.
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (/^louametay_session_orders_\d+$/.test(k) || /^louametay_meal_timestamp_\d+$/.test(k))) {
            localStorage.removeItem(k);
          }
        }
        localStorage.removeItem(`louametay_session_orders_${tableNumber}`);
        localStorage.removeItem(`louametay_meal_timestamp_${tableNumber}`);
      } catch (e) {}

      if (!restaurant?.id) return;

      const scopedOrdersKey = `louametay_session_orders_${restaurant.id}_table_${tableNumber}`;
      const scopedTimeKey = `louametay_meal_timestamp_${restaurant.id}_table_${tableNumber}`;

      const savedTime = localStorage.getItem(scopedTimeKey);
      if (savedTime) {
        const elapsed = Date.now() - parseInt(savedTime, 10);
        // Si la session date de plus de 2 heures, réinitialisation automatique pour le nouveau repas
        if (elapsed > 2 * 60 * 60 * 1000) {
          localStorage.removeItem(scopedOrdersKey);
          localStorage.removeItem(scopedTimeKey);
          setSessionOrders([]);
          return;
        }
      }

      const saved = localStorage.getItem(scopedOrdersKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessionOrders(parsed);
            const latest = parsed[parsed.length - 1];
            setActiveOrder(latest);

            // 🔒 REPRISE DE SESSION & VISIBILITÉ TICKET IMMÉDIATE :
            // Si le client a une commande en cours de traitement ou d'encaissement,
            // et qu'il n'a pas explicitement réduit le ticket lors de cette consultation,
            // afficher immédiatement le ticket numérique pour lui donner un retour instantané sans stress !
            const hasOngoingOrder = parsed.some(
              (o: any) => ['PENDING', 'PREPARING', 'READY'].includes(o.status) || o.paymentStatus !== 'PAID'
            );
            const userClosedKey = `louametay_tracker_closed_${restaurant.id}_table_${tableNumber}`;
            let wasExplicitlyClosed = false;
            try {
              wasExplicitlyClosed = sessionStorage.getItem(userClosedKey) === 'true';
            } catch (e) {}

            if (hasOngoingOrder && !wasExplicitlyClosed) {
              setIsOrderSuccessOpen(true);
            }
          }
        } catch (e) {}
      } else {
        // 🔒 SMART CONTEXTUAL RELEASE (Nouveau smartphone sans historique local sur cette table)
        fetch(`/api/orders/table/${tableNumber}/status?restaurantId=${restaurant.id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((statusData) => {
            if (!statusData || !statusData.success) return;

            if (statusData.status === 'ACTIVE' && statusData.orders && statusData.orders.length > 0) {
              // CAS 2 : Commande active en cours -> Rejoindre automatiquement la session existante
              const mapped: OrderType[] = statusData.orders.map((ord: any) => ({
                ...ord,
                total: Number(ord.total ?? ord.totalAmount ?? 0),
                totalAmount: Number(ord.totalAmount ?? ord.total ?? 0),
              }));
              setSessionOrders(mapped);
              setActiveOrder(mapped[mapped.length - 1]);
              try {
                localStorage.setItem(scopedOrdersKey, JSON.stringify(mapped));
                localStorage.setItem(scopedTimeKey, Date.now().toString());
              } catch (e) {}
              setJoinedSessionBanner({
                isJoined: true,
                count: statusData.totalItems || mapped.length,
                total: statusData.totalAmount || 0,
              });
            } else if (statusData.status === 'PAID_RECENT') {
              // CAS 3 : Zone Jaune (repas soldé entre 15 et 45 min) -> Afficher la modale de bienvenue et de choix
              setWelcomeModalData({
                elapsedMinutes: statusData.elapsedMinutes,
                lastOrderTotal: statusData.lastOrderTotal,
                sessionId: statusData.sessionId,
              });
              setIsWelcomeModalOpen(true);
            }
          })
          .catch(() => {});
      }
    }
  }, [tableNumber, restaurant?.id]);

  const handleJoinExistingMeal = async () => {
    try {
      const res = await fetch(`/api/orders/table/${tableNumber}?restaurantId=${restaurant.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          const mapped: OrderType[] = data.orders.map((ord: any) => ({
            ...ord,
            total: Number(ord.total ?? ord.totalAmount ?? 0),
            totalAmount: Number(ord.totalAmount ?? ord.total ?? 0),
          }));
          setSessionOrders(mapped);
          setActiveOrder(mapped[mapped.length - 1]);
          const scopedOrdersKey = `louametay_session_orders_${restaurant.id}_table_${tableNumber}`;
          const scopedTimeKey = `louametay_meal_timestamp_${restaurant.id}_table_${tableNumber}`;
          try {
            localStorage.setItem(scopedOrdersKey, JSON.stringify(mapped));
            localStorage.setItem(scopedTimeKey, Date.now().toString());
          } catch (e) {}
          const total = mapped.reduce((s, o) => s + (o.totalAmount || o.total || 0), 0);
          const count = mapped.reduce((s, o) => s + (o.items?.length || 1), 0);
          setJoinedSessionBanner({ isJoined: true, count, total });
          toast.success(`👥 Vous avez rejoint la Table ${tableNumber < 10 ? '0' + tableNumber : tableNumber} !`);
        }
      }
    } catch (e) {}
    setIsWelcomeModalOpen(false);
  };

  const isReleasingTableRef = useRef<boolean>(false);

  const handleStartFreshMeal = async () => {
    try {
      isReleasingTableRef.current = true;
      await fetch('/api/tenant/tables/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          tableNumber,
        }),
      });
      const scopedOrdersKey = `louametay_session_orders_${restaurant.id}_table_${tableNumber}`;
      const scopedTimeKey = `louametay_meal_timestamp_${restaurant.id}_table_${tableNumber}`;
      try {
        localStorage.removeItem(scopedOrdersKey);
        localStorage.removeItem(scopedTimeKey);
      } catch (e) {}
      setSessionOrders([]);
      setActiveOrder(null);
      setJoinedSessionBanner(null);
      setIsOrderSuccessOpen(false);
      toast.success(`✨ Bienvenue ! Table ${tableNumber < 10 ? '0' + tableNumber : tableNumber} prête pour votre nouveau repas.`);
    } catch (e) {
      toast.error('Erreur lors de la préparation de la table');
    } finally {
      setIsWelcomeModalOpen(false);
      setTimeout(() => {
        isReleasingTableRef.current = false;
      }, 2500);
    }
  };

  // 🔒 Déterminer si la prise de commande numérique est activée (TÀMBALI = vitrine pure, sans commande numérique)
  const isOrderingEnabled = restaurant.isOrderingEnabled ?? (!restaurant.isTambali && restaurant.planSlug !== 'tambali');

  // Real-time polling to sync order status (PENDING -> PREPARING -> READY -> SERVED -> PAID)
  useEffect(() => {
    if (!isOrderingEnabled) return;

    const pollLiveOrders = async () => {
      try {
        if (!restaurant?.id || isReleasingTableRef.current) return;
        const scopedOrdersKey = `louametay_session_orders_${restaurant.id}_table_${tableNumber}`;
        const scopedTimeKey = `louametay_meal_timestamp_${restaurant.id}_table_${tableNumber}`;

        const res = await fetch(`/api/orders/table/${tableNumber}?restaurantId=${restaurant.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
            const mappedOrders: OrderType[] = data.orders.map((ord: any) => ({
              ...ord,
              total: Number(ord.total ?? ord.totalAmount ?? 0),
              totalAmount: Number(ord.totalAmount ?? ord.total ?? 0),
            }));

            setSessionOrders((prev) => {
              // Check if any order transitioned to SERVED
              mappedOrders.forEach((updatedOrd: OrderType) => {
                const prevOrd = prev.find((p) => p.id === updatedOrd.id);
                if (prevOrd && prevOrd.status !== 'SERVED' && updatedOrd.status === 'SERVED') {
                  const tableDisplay = isExpress ? 'Comptoir' : `Table ${tableNumber < 10 ? '0' + tableNumber : tableNumber}`;
                  toast.success(`🎉 Votre commande ${tableDisplay} a été servie ! Bon appétit ! 😋`);
                  // 🔒 Verrouillage automatique sur l'écran "Bon Appétit !"
                  setIsOrderSuccessOpen(true);
                }
                // 🔒 Confirmation en direct du règlement en caisse (Règle 10.4 & 10.8)
                if (prevOrd && prevOrd.paymentStatus !== 'PAID' && updatedOrd.paymentStatus === 'PAID') {
                  toast.success(`💳 Votre règlement a été validé en caisse ! Reçu officiel disponible. Merci ! 😊`);
                  setIsOrderSuccessOpen(true);
                }
              });

              if (typeof window !== 'undefined') {
                localStorage.setItem(scopedOrdersKey, JSON.stringify(mappedOrders));
              }
              return mappedOrders;
            });

            // 🔒 MISE À JOUR DE LA COMMANDE ACTIVE
            if (activeOrder) {
              const matched = mappedOrders.find((o: OrderType) => o.id === activeOrder.id);
              if (matched) {
                if (matched.status !== activeOrder.status || matched.paymentStatus !== activeOrder.paymentStatus) {
                  setActiveOrder(matched);
                }
              } else if (mappedOrders.length > 0) {
                setActiveOrder(mappedOrders[mappedOrders.length - 1]);
              }
            } else if (mappedOrders.length > 0) {
              setActiveOrder(mappedOrders[mappedOrders.length - 1]);
            }

            // 🔒 RÉOUVERTURE DU TICKET EN DIRECT (TANT QUE LA COMMANDE EST EN COURS) :
            // Si une commande est en attente, en préparation ou prête (ou impayée),
            // et que le client n'a pas délibérément cliqué sur "Fermer" pendant cette visite,
            // ouvrir automatiquement le ticket officiel pour qu'il soit immédiatement sous ses yeux !
            const hasOngoing = mappedOrders.some(
              (o: any) => ['PENDING', 'PREPARING', 'READY'].includes(o.status) || o.paymentStatus !== 'PAID'
            );
            const userClosedKey = `louametay_tracker_closed_${restaurant.id}_table_${tableNumber}`;
            let wasExplicitlyClosed = false;
            try {
              wasExplicitlyClosed = sessionStorage.getItem(userClosedKey) === 'true';
            } catch (e) {}

            if (hasOngoing && !wasExplicitlyClosed) {
              setIsOrderSuccessOpen(true);
            }
          } else if (data.orders && Array.isArray(data.orders) && data.orders.length === 0) {
            // 🔒 RÉCONCILIATION CLOUD SÉCURISÉE AVEC FENÊTRE DE GRÂCE :
            // Si une commande a été soumise récemment (moins de 2 minutes), ne jamais purger sur un retour vide transitoire !
            const now = Date.now();
            const isRecentSubmission = (now - lastSubmitRef.current) < 120000;
            if (isRecentSubmission) {
              return;
            }

            setSessionOrders((prev) => {
              // Si prev contient des commandes encore en cours (PENDING/PREPARING/READY), ne pas purger prématurément
              const hasActiveCooking = prev.some((o: any) => ['PENDING', 'PREPARING', 'READY'].includes(o.status));
              if (hasActiveCooking) {
                return prev;
              }

              if (prev.length > 0) {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem(scopedOrdersKey);
                  localStorage.removeItem(scopedTimeKey);
                  try {
                    localStorage.removeItem(`louametay_session_orders_${tableNumber}`);
                    localStorage.removeItem(`louametay_meal_timestamp_${tableNumber}`);
                  } catch (e) {}
                }
                return [];
              }
              return prev;
            });
            // 🔒 RÈGLE D'OR : Le polling ne force JAMAIS la fermeture brutale du ticket à l'écran du client !
            // Seule une action explicite de l'utilisateur ferme la modale.
          }
        }
      } catch (err) {}
    };

    pollLiveOrders();
    const interval = setInterval(pollLiveOrders, 3500);
    return () => clearInterval(interval);
  }, [tableNumber, restaurant?.id, activeOrder, isOrderingEnabled, isExpress]);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const lastSubmitRef = useRef<number>(0);

  // Flattened menu items for search and specials
  const allMenuItems = useMemo(() => {
    const dishes: MenuItemType[] = [];
    restaurant.categories.forEach((cat) => {
      cat.items?.forEach((dish) => dishes.push(dish));
    });
    return dishes;
  }, [restaurant]);

  // Categories filtered by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return restaurant.categories;

    const query = searchQuery.toLowerCase();
    return restaurant.categories
      .map((cat) => ({
        ...cat,
        items: (cat.items || []).filter((item) => {
          const nameFr = item.name.toLowerCase();
          const nameWo = (item.nameWolof || item.wolofName || '').toLowerCase();
          const desc = item.description.toLowerCase();
          return nameFr.includes(query) || nameWo.includes(query) || desc.includes(query);
        }),
      }))
      .filter((cat) => (cat.items || []).length > 0);
  }, [restaurant.categories, searchQuery]);

  // Enregistrer le scan QR du menu dès le chargement du menu client
  useEffect(() => {
    if (restaurant?.id) {
      fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          subdomain: (restaurant as any).subdomain,
          tableNumber: isExpress ? 0 : tableNumber,
        }),
      }).catch(() => {});
    }
  }, [restaurant?.id, isExpress, tableNumber]);

  // Handlers
  const handleOpenDetails = (item: MenuItemType) => {
    setSelectedItemForDetail(item);
    if (item.id) {
      fetch(`/api/restaurant/menu-items/${item.id}/view`, { method: 'POST' }).catch(() => {});
    }
  };

  const handleCloseDetails = () => {
    setSelectedItemForDetail(null);
  };

  const handleQuickAdd = (item: MenuItemType) => {
    if (!item.isAvailable) {
      toast.error('Ce plat est actuellement épuisé.');
      return;
    }

    if (item.id) {
      fetch(`/api/restaurant/menu-items/${item.id}/view`, { method: 'POST' }).catch(() => {});
    }

    addItem(item);
    toast.success(`Ajouté au panier !`, {
      description: `${item.name} a été ajouté avec succès.`,
      duration: 2000,
    });
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    const langNames: Record<Language, string> = {
      FR: 'Français 🇫🇷',
      WO: 'Wolof 🇸🇳',
      EN: 'English 🇬🇧',
      ES: 'Español 🇪🇸',
      IT: 'Italiano 🇮🇹',
    };
    toast.info(`Langue : ${langNames[lang]}`);
  };

  // Upsell check before validating order
  const handleOpenCartOrUpsell = () => {
    if (!isOrderingEnabled) {
      setIsCartOpen(true);
      return;
    }

    const hasDrinkOrDessert = items.some(
      (i) =>
        i.menuItem.categoryId?.toLowerCase().includes('boisson') ||
        i.menuItem.categoryId?.toLowerCase().includes('dessert') ||
        i.menuItem.name.toLowerCase().includes('bissap') ||
        i.menuItem.name.toLowerCase().includes('bouye')
    );

    if (!hasDrinkOrDessert && items.length > 0) {
      setIsUpsellOpen(true);
    } else {
      setIsCartOpen(true);
    }
  };

  // Submit order action avec verrouillage anti-double clic
  const handleSubmitOrder = async () => {
    if (!isOrderingEnabled) {
      toast.info('Présentez votre sélection au serveur ou à la caisse pour commander.');
      return;
    }
    const now = Date.now();
    if (isSubmittingOrder || now - lastSubmitRef.current < 4000) {
      return;
    }
    lastSubmitRef.current = now;

    if (items.length === 0) {
      toast.error('Votre panier est vide.');
      return;
    }

    // If Wave or OM selected, offer direct checkout flow
    if (paymentMethod === 'WAVE' || paymentMethod === 'ORANGE_MONEY') {
      setIsCartOpen(false);
      setIsMobileMoneyOpen(true);
      return;
    }

    await executeOrderPlacement();
  };

  const executeOrderPlacement = async (transactionRef?: string) => {
    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        restaurantId: restaurant.id,
        tableNumber: isExpress ? 0 : tableNumber,
        orderType: isExpress ? 'EXPRESS' : 'TABLE',
        customerName: customerName.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
        paymentMethod,
        transactionRef,
        total: getTotalPrice(),
        waiterId: orderContext?.waiterId,
        zoneId: orderContext?.zoneId,
        locationDetail: orderContext?.locationDetail,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          name: i.menuItem.name,
          quantity: i.quantity,
          price: i.menuItem.price,
          options: i.options,
          notes: i.customNotes,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la commande.');
      }

      const rawOrder = data.order;
      const orderTotal = Number(rawOrder?.total ?? rawOrder?.totalAmount ?? getTotalPrice());
      const placedOrder: OrderType = rawOrder
        ? {
            ...rawOrder,
            total: orderTotal,
            totalAmount: orderTotal,
          }
        : {
            id: `ord_${Date.now()}`,
            restaurantId: restaurant.id,
            tableNumber: isExpress ? 0 : tableNumber,
            orderType: isExpress ? 'EXPRESS' : 'TABLE',
            customerName: customerName.trim() || null,
            customerNote: customerNote.trim() || null,
            paymentMethod,
            status: 'PENDING',
            total: getTotalPrice(),
            totalAmount: getTotalPrice(),
            createdAt: new Date().toISOString(),
            items: items.map((i) => ({
              id: `item_${Math.random()}`,
              menuItemId: i.menuItem.id,
              name: i.menuItem.name,
              price: i.menuItem.price,
              quantity: i.quantity,
              options: i.options,
              notes: i.customNotes,
            })),
          };

      lastSubmitRef.current = Date.now();
      if (typeof window !== 'undefined' && restaurant.id) {
        try {
          const userClosedKey = `louametay_tracker_closed_${restaurant.id}_table_${tableNumber}`;
          sessionStorage.setItem(userClosedKey, 'false');
        } catch (e) {}
      }

      setActiveOrder(placedOrder);
      setSessionOrders((prev) => {
        const updated = [...prev, placedOrder];
        if (typeof window !== 'undefined' && restaurant.id) {
          const scopedOrdersKey = `louametay_session_orders_${restaurant.id}_table_${tableNumber}`;
          const scopedTimeKey = `louametay_meal_timestamp_${restaurant.id}_table_${tableNumber}`;
          localStorage.setItem(scopedOrdersKey, JSON.stringify(updated));
          localStorage.setItem(scopedTimeKey, Date.now().toString());
        }
        return updated;
      });

      setIsCartOpen(false);
      setIsMobileMoneyOpen(false);
      clearCart();
      setIsOrderSuccessOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Impossible de transmettre la commande.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Start fresh meal session (resets table orders & storage for next customer/meal)
  const handleStartNewMeal = () => {
    if (typeof window !== 'undefined') {
      if (restaurant.id) {
        const scopedOrdersKey = `louametay_session_orders_${restaurant.id}_table_${tableNumber}`;
        const scopedTimeKey = `louametay_meal_timestamp_${restaurant.id}_table_${tableNumber}`;
        localStorage.removeItem(scopedOrdersKey);
        localStorage.removeItem(scopedTimeKey);
        try {
          const userClosedKey = `louametay_tracker_closed_${restaurant.id}_table_${tableNumber}`;
          sessionStorage.removeItem(userClosedKey);
        } catch (e) {}
      }
      try {
        localStorage.removeItem(`louametay_session_orders_${tableNumber}`);
        localStorage.removeItem(`louametay_meal_timestamp_${tableNumber}`);
      } catch (e) {}
    }
    clearCart();
    setActiveOrder(null);
    setSessionOrders([]);
    setIsOrderSuccessOpen(false);
    toast.success('Nouvelle session de table démarrée ! Votre panier est vierge.');
  };

  // If Restaurant is closed or suspended
  if (restaurant.status === 'SUSPENDED' || restaurant.isOnline === false) {
    return (
      <RestaurantClosedView
        restaurant={restaurant}
        tableNumber={tableNumber}
      />
    );
  }

  const branding = restaurant.branding;
  const fontTitle = branding?.fontTitle || 'Playfair Display';
  const fontBody = branding?.fontBody || 'Plus Jakarta Sans';
  const primaryColor = branding?.primaryColor || '#FF6B00';
  const secondaryColor = branding?.secondaryColor || '#00A86B';
  const bgColor = branding?.backgroundColor || '#FFFDF9';
  const textColor = branding?.textColor || '#0F172A';
  const bannerUrl = branding?.bannerUrl || restaurant.bannerUrl;
  const logoUrl = branding?.logoUrl || restaurant.logoUrl;

  return (
    <div 
      className="min-h-screen pb-36 font-sans antialiased selection:bg-orange-500 selection:text-white transition-colors"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: fontBody,
        ['--primary-color' as any]: primaryColor,
        ['--secondary-color' as any]: secondaryColor,
      }}
    >
      {/* 0. Dynamic Google Fonts Loading */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href={`https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontTitle)}:wght@400;600;700;800;900&family=${encodeURIComponent(fontBody)}:wght@400;500;600;700&display=swap`} 
        rel="stylesheet" 
      />

      {/* 1. Fixed Header with Table Badge, Waiter Bell, 5-Flag Language Switcher & Search */}
      <TableStickyHeader
        restaurantName={restaurant.name}
        restaurantId={restaurant.id}
        logoUrl={logoUrl}
        tableNumber={tableNumber}
        isExpress={isExpress}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lang={currentLang}
        onLanguageChange={handleLanguageChange}
        primaryColor={primaryColor}
      />

      {/* 1.4. Smart Contextual Release — Bandeau Informatif Session Rejointe */}
      {joinedSessionBanner?.isJoined && !isExpress && (
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pt-3">
          <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-3.5 sm:p-4 rounded-3xl shadow-lg border-2 border-emerald-500/40 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-2xl shrink-0 border border-emerald-400/30">
                <Users className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span>👥</span>
                  <span>Vous avez rejoint la Table {tableNumber < 10 ? '0' + tableNumber : tableNumber}</span>
                </div>
                <div className="text-xs text-slate-200 mt-0.5">
                  <strong className="text-white font-bold">{joinedSessionBanner.count} article(s)</strong> déjà commandé(s) • Solde en cours : <strong className="text-emerald-300 font-bold">{formatFCFA(joinedSessionBanner.total)}</strong>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOrderSuccessOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all shrink-0 ml-auto cursor-pointer"
            >
              Voir la note ^
            </button>
          </div>
        </div>
      )}

      {/* 1.5. Brand Banner Header (Si configurée) */}
      {bannerUrl && !searchQuery && (
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pt-3">
          <div className="relative w-full h-36 sm:h-48 rounded-3xl overflow-hidden shadow-md border border-orange-200/60 group">
            <img
              src={bannerUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4 sm:p-6">
              <div className="text-white">
                <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-amber-300 bg-black/40 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                  {branding?.tagline || 'Menu Digital Officiel'}
                </span>
                <h2 className="text-xl sm:text-3xl font-black mt-1.5" style={{ fontFamily: fontTitle }}>
                  {restaurant.name}
                </h2>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Banner & Currency Selector Bar */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {schedule.periodLabel && (
            <div className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-950 text-xs px-3 py-1.5 rounded-full font-bold border border-amber-200 shadow-2xs">
              <span className="text-sm">{schedule.periodIcon}</span>
              <span>{schedule.periodLabel}</span>
            </div>
          )}

          {/* Quick Currency Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl text-xs font-bold shadow-2xs ml-auto">
            {(
              [
                { code: 'FCFA', symbol: 'FCFA', label: 'CFA' },
                { code: 'EUR', symbol: '€', label: 'EUR' },
                { code: 'USD', symbol: '$', label: 'USD' },
              ] as const
            ).map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrentCurrency(c.code)}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                  currentCurrency === c.code
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
                    : 'bg-transparent text-slate-700 hover:bg-emerald-50'
                }`}
              >
                <span>{c.symbol}</span>
                <span className="text-[11px] font-extrabold">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Daily Specials Carousel Section « Lou Ame Tay ? » & Weekly Multi-Dish Schedule */}
      {!searchQuery && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 space-y-4">
          {/* Emploi du Temps Hebdomadaire Multi-Plats (Lundi au Dimanche - Midi & Soir) */}
          <WeeklyMenuCustomerBanner
            onQuickAdd={handleQuickAdd}
            onOpenDetails={handleOpenDetails}
            lang={currentLang}
            currency={currentCurrency}
            exchangeRates={exchangeRates}
            isOrderingEnabled={isOrderingEnabled}
          />

          <DailySpecialsSection
            items={allMenuItems}
            onQuickAdd={handleQuickAdd}
            onOpenDetails={handleOpenDetails}
            lang={currentLang}
            currency={currentCurrency}
            exchangeRates={exchangeRates}
            primaryColor={primaryColor}
          />

          {/* Formule Midi / Soir Combinée */}
          <ComboSection
            onAddComboToCart={(comboDish) => {
              addItem(comboDish);
            }}
            lang={currentLang}
            primaryColor={primaryColor}
          />
        </div>
      )}

      {/* 3. Scrollable Category Pills */}
      {filteredCategories.length > 0 && (
        <CategoryNavbar
          categories={filteredCategories}
          activeCategoryId={activeCategoryId}
          lang={currentLang}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onSelectCategory={(id) => {
            setActiveCategoryId(id);
            const el = document.getElementById(id);
            if (el) {
              const yOffset = -170;
              const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* 4. Main Dishes Grid by Category */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-6 space-y-10">
        {filteredCategories.length === 0 ? (
          searchQuery.trim() ? (
            <div className="bg-white rounded-3xl p-8 text-center shadow-xs border border-orange-100 mt-6 space-y-3">
              <div className="text-4xl mb-1">🔍</div>
              <h3 className="text-base font-bold text-slate-900">
                Aucun plat ne correspond à votre recherche « {searchQuery} »
              </h3>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-2xl transition-all shadow-xs"
              >
                Afficher tout le menu
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center shadow-xs border border-amber-200/80 mt-6 space-y-3">
              <div className="text-4xl mb-1">👨‍🍳</div>
              <h3 className="text-lg font-black text-slate-950">
                La carte de {restaurant.name} est en cours de préparation !
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Notre équipe cuisine finalise actuellement les plats et spécialités du jour. Revenez dans quelques instants ou faites signe au serveur de salle.
              </p>
              {restaurant.phone && (
                <div className="pt-2">
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold shadow-2xs hover:bg-emerald-100 transition-all"
                  >
                    <span>📞 {restaurant.phone}</span>
                  </a>
                </div>
              )}
            </div>
          )
        ) : (
          filteredCategories.map((category, idx) => {
            const icon = category.icon || '🍽️';
            const translatedCat = translateCategoryName(category.name, currentLang);
            const isSpecialCategory =
              idx === 0 ||
              category.name.toLowerCase().includes('lou ame tay') ||
              category.name.toLowerCase().includes('jour');

            return (
              <section key={category.id} id={category.id} className="scroll-mt-48 space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 px-1">
                  <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span>{translatedCat}</span>
                  </h2>
                  <div
                    className={`flex-1 h-[2px] ${
                      isSpecialCategory
                        ? 'bg-gradient-to-r from-amber-400 via-orange-300 to-transparent'
                        : 'bg-gradient-to-r from-emerald-300/80 via-slate-200 to-transparent'
                    } ml-2`}
                  />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {category.items?.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      quantity={getItemQuantity(item.id)}
                      onQuickAdd={handleQuickAdd}
                      onQuickRemove={removeItem}
                      onClickDetails={handleOpenDetails}
                      lang={currentLang}
                      currency={currentCurrency}
                      exchangeRates={exchangeRates}
                      primaryColor={primaryColor}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}

        {/* 4.5. Google Review Call to Action Banner ⭐ */}
        <GoogleReviewBanner
          googleReviewUrl={branding?.googleReviewUrl}
          restaurantName={restaurant.name}
        />

        {/* 4.6. Coordonnées & Réseaux Sociaux Footer */}
        <RestaurantFooterInfo
          restaurantName={restaurant.name}
          branding={branding}
          phone={restaurant.phone}
          address={restaurant.address}
        />
      </main>

      {/* 5. Sticky Bottom Cart Bar */}
      <FloatingCartBar
        totalCount={getTotalCount()}
        totalPrice={getTotalPrice()}
        tableNumber={tableNumber}
        onOpenCart={handleOpenCartOrUpsell}
        onOpenSplitBill={isOrderingEnabled ? () => setIsSplitBillOpen(true) : undefined}
        isOrderingEnabled={isOrderingEnabled}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
        primaryColor={primaryColor}
      />

      {/* 5.5. Persistent Floating Pill for Active Table Orders (désactivé sur pack TÀMBALI) */}
      {isOrderingEnabled && isMounted && sessionOrders.length > 0 && !isOrderSuccessOpen && (
        <ActiveOrderFloatingPill
          orders={sessionOrders}
          tableNumber={tableNumber}
          onOpenTracker={() => {
            try {
              const userClosedKey = `louametay_tracker_closed_${restaurant.id}_table_${tableNumber}`;
              sessionStorage.setItem(userClosedKey, 'false');
            } catch (e) {}
            setIsOrderSuccessOpen(true);
          }}
        />
      )}

      {/* 6. Item Detail Drawer */}
      <ItemDetailDrawer
        item={selectedItemForDetail}
        isOpen={Boolean(selectedItemForDetail)}
        onClose={handleCloseDetails}
        onAddToCart={(item, qty, options, notes) => {
          addItem(item, qty, options, notes);
          handleCloseDetails();
          toast.success(`Ajouté au panier !`, {
            description: `${qty}x ${item.name}`,
          });
        }}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 7. Upsell Drawer (Bissap, Bouye, Pastels - uniquement si commande active) */}
      {isOrderingEnabled && (
        <UpsellDrawer
          isOpen={isUpsellOpen}
          onClose={() => {
            setIsUpsellOpen(false);
            setIsCartOpen(true);
          }}
          onAddUpsellItem={(item) => {
            addItem(item);
          }}
          onContinueToCheckout={() => {
            setIsUpsellOpen(false);
            setIsCartOpen(true);
          }}
        />
      )}

      {/* 8. Cart & Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        tableNumber={tableNumber}
        isExpress={isExpress}
        customerNote={customerNote}
        customerName={customerName}
        paymentMethod={paymentMethod}
        onCustomerNoteChange={setCustomerNote}
        onCustomerNameChange={setCustomerName}
        onPaymentMethodChange={setPaymentMethod}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onDeleteItem={deleteItem}
        onClearCart={clearCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
        isOrderingEnabled={isOrderingEnabled}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 9. Mobile Money Direct Checkout (uniquement si commande active) */}
      {isOrderingEnabled && (
        <MobileMoneyCheckout
          isOpen={isMobileMoneyOpen}
          onClose={() => setIsMobileMoneyOpen(false)}
          method={paymentMethod === 'ORANGE_MONEY' ? 'ORANGE_MONEY' : 'WAVE'}
          totalAmount={getTotalPrice()}
          tableNumber={tableNumber}
          restaurantName={restaurant.name}
          onPaymentCompleted={(txRef) => {
            executeOrderPlacement(txRef);
          }}
          lang={currentLang}
        />
      )}

      {/* 10. Split Bill Drawer with WhatsApp Share (uniquement si commande active) */}
      {isOrderingEnabled && (
        <SplitBillDrawer
          isOpen={isSplitBillOpen}
          onClose={() => setIsSplitBillOpen(false)}
          totalAmount={getTotalPrice()}
          tableNumber={tableNumber}
          restaurantName={restaurant.name}
          lang={currentLang}
        />
      )}

      {/* 11. Live Order Status & Digital Receipt Tracker (Strictement désactivé sur formule vitrine TÀMBALI) */}
      {isOrderingEnabled && (
        <OrderSuccessTracker
          order={activeOrder || (sessionOrders.length > 0 ? sessionOrders[sessionOrders.length - 1] : null)}
          sessionOrders={sessionOrders}
          isOpen={isOrderSuccessOpen}
          onClose={() => {
            setIsOrderSuccessOpen(false);
            try {
              const userClosedKey = `louametay_tracker_closed_${restaurant.id}_table_${tableNumber}`;
              sessionStorage.setItem(userClosedKey, 'true');
            } catch (e) {}
          }}
          onOrderMore={() => {
            setIsOrderSuccessOpen(false);
            try {
              const userClosedKey = `louametay_tracker_closed_${restaurant.id}_table_${tableNumber}`;
              sessionStorage.setItem(userClosedKey, 'true');
            } catch (e) {}
          }}
          onStartNewMeal={handleStartNewMeal}
          onCallWaiter={() => setIsCallWaiterOpen(true)}
          onPayOnline={(amount) => {
            setIsOrderSuccessOpen(false);
            setIsMobileMoneyOpen(true);
          }}
          onOrderCancelled={(orderId) => {
            setActiveOrder((prev) => (prev?.id === orderId ? { ...prev, status: 'CANCELLED' } : prev));
            setSessionOrders((prev) =>
              prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o))
            );
            try {
              if (restaurant.id) {
                const scopedOrdersKey = `louametay_session_orders_${restaurant.id}_table_${tableNumber}`;
                const saved = localStorage.getItem(scopedOrdersKey);
                if (saved) {
                  const parsed = JSON.parse(saved);
                  const updated = parsed.map((o: any) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
                  localStorage.setItem(scopedOrdersKey, JSON.stringify(updated));
                }
              }
            } catch (e) {}
          }}
          lang={currentLang}
          currency={currentCurrency}
          exchangeRates={exchangeRates}
          restaurantName={restaurant.name}
          restaurantSlug={restaurant.subdomain}
          googleReviewUrl={(restaurant as any).branding?.googleReviewUrl || (restaurant as any).googleReviewUrl}
        />
      )}

      {/* 12. Call Waiter / Server Dedicated Modal (Reste actif pour appeler le serveur physiquement) */}
      <CallWaiterModal
        isOpen={isCallWaiterOpen}
        onClose={() => setIsCallWaiterOpen(false)}
        tableNumber={tableNumber}
        restaurantId={restaurant.id}
        customerName={customerName}
        isExpress={isExpress}
      />

      {/* 13. Smart Contextual Release — Modale de Bienvenue & Choix Zone Jaune (Table mal libérée) */}
      <TableWelcomeModal
        isOpen={isWelcomeModalOpen}
        tableNumber={tableNumber}
        restaurantName={restaurant.name}
        elapsedMinutes={welcomeModalData?.elapsedMinutes || 20}
        lastOrderTotal={welcomeModalData?.lastOrderTotal}
        onJoinMeal={handleJoinExistingMeal}
        onStartNewMeal={handleStartFreshMeal}
      />
    </div>
  );
};