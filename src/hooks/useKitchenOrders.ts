import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { OrderType, OrderStatus } from '@/types';
import { playKitchenOrderAlert, playKitchenServedAlert } from '@/components/kitchen/KitchenSoundAlert';
import { 
  resilientFetch, 
  flushOfflineQueue, 
  cacheKitchenOrders, 
  getCachedKitchenOrders, 
  getOfflineQueue, 
  isNetworkOnline 
} from '@/lib/terrain-resilience';
import { toast } from 'sonner';

interface UseKitchenOrdersOptions {
  restaurantId?: string;
  isAudioEnabled?: boolean;
  pollIntervalMs?: number;
  service?: string;
}

export function useKitchenOrders(options: UseKitchenOrdersOptions = {}) {
  const {
    restaurantId,
    isAudioEnabled = true,
    pollIntervalMs = 4000,
    service,
  } = options;

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [recentlyCancelledOrders, setRecentlyCancelledOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isWsUnstable, setIsWsUnstable] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const previousPendingIds = useRef<Set<string>>(new Set());
  const knownActiveOrderIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const missedWsOrdersCount = useRef<number>(0);
  const isWsTriggeredFetch = useRef<boolean>(false);

  // Intervalle de polling dynamique : 2500ms si connexion instable ou >=3 commandes WS manquées, sinon pollIntervalMs (4000ms par défaut)
  const effectivePollInterval = (!isConnected || isWsUnstable || missedWsOrdersCount.current >= 3) ? 2500 : pollIntervalMs;

  // Rafraîchir le compteur de la file d'attente
  const refreshQueueCount = useCallback(() => {
    setPendingSyncCount(getOfflineQueue('KITCHEN').length);
  }, []);

  // Déclencher manuellement ou automatiquement la synchronisation de la file
  const triggerManualSync = useCallback(async () => {
    if (!isNetworkOnline()) {
      toast.error('Réseau toujours indisponible. Synchronisation impossible pour le moment.');
      return;
    }
    const { synced, failed } = await flushOfflineQueue('KITCHEN');
    refreshQueueCount();
    if (synced > 0) {
      toast.success(`⚡ Synchronisation réussie : ${synced} action(s) cuisine envoyée(s) au serveur !`);
      fetchOrders(true);
    } else if (failed > 0) {
      toast.error(`Échec partiel de synchronisation : ${failed} action(s) conservée(s) en file.`);
    }
  }, [refreshQueueCount]);

  // Fetch orders from API avec fallback sur cache local
  const fetchOrders = useCallback(async (silent = false) => {
    // Si coupure réseau détectée ou simulée
    if (!isNetworkOnline()) {
      const cached = getCachedKitchenOrders();
      if (cached.length > 0) {
        setOrders(cached);
      }
      setIsOffline(true);
      refreshQueueCount();
      setIsLoading(false);
      return;
    }

    try {
      let url = restaurantId
        ? `/api/orders?restaurantId=${restaurantId}`
        : '/api/orders';

      if (service && service !== 'ALL') {
        url += `${url.includes('?') ? '&' : '?'}service=${encodeURIComponent(service)}`;
      }

      const headers: Record<string, string> = {};
      if (restaurantId) headers['x-kds-token'] = `kds_session_${restaurantId}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: OrderType[] = data.orders || [];

        // Mise en cache locale systématique pour le mode hors-ligne
        cacheKitchenOrders(incomingOrders);
        setIsOffline(false);

        // Si des actions étaient en file et que le réseau est revenu, synchroniser
        const queueCount = getOfflineQueue('KITCHEN').length;
        setPendingSyncCount(queueCount);
        if (queueCount > 0) {
          flushOfflineQueue('KITCHEN').then(({ synced }) => {
            if (synced > 0) {
              refreshQueueCount();
              toast.success(`⚡ Réseau rétabli : ${synced} action(s) cuisine synchronisée(s) !`);
            }
          });
        }

        // Check for new PENDING orders to trigger audio & visual alert
        const currentPending = incomingOrders.filter((o) => o.status === 'PENDING');
        const newOrders = currentPending.filter(
          (o) => !previousPendingIds.current.has(o.id)
        );
        const hasNewOrder = newOrders.length > 0;

        if (hasNewOrder && !isInitialLoad.current && !isWsTriggeredFetch.current) {
          missedWsOrdersCount.current += newOrders.length;
          if (missedWsOrdersCount.current >= 3 && !isWsUnstable) {
            console.warn(`[KDS] ${missedWsOrdersCount.current} commandes WebSocket manquées. Basculement polling (2,5s).`);
            setIsWsUnstable(true);
          }
        }
        isWsTriggeredFetch.current = false;

        if (hasNewOrder && !isInitialLoad.current && isAudioEnabled) {
          playKitchenOrderAlert();
          const newest = currentPending.find((o) => !previousPendingIds.current.has(o.id));
          toast.success(
            `🔔 NOUVELLE COMMANDE REÇUE (Table ${newest?.tableNumber || '?'}) !`,
            {
              description: `Commande #${newest?.id.slice(-6).toUpperCase()} • ${newest?.items.length || 0} plats`,
              duration: 5000,
            }
          );
        }

        // Détection d'annulations client
        const newlyCancelled = incomingOrders.filter(
          (o) => o.status === 'CANCELLED' && knownActiveOrderIds.current.has(o.id)
        );

        if (newlyCancelled.length > 0) {
          setRecentlyCancelledOrders((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const fresh = newlyCancelled.filter((n) => !existingIds.has(n.id));
            return [...prev, ...fresh];
          });

          newlyCancelled.forEach((c) => {
            const tableStr = c.tableNumber && c.tableNumber > 0 ? `Table ${c.tableNumber}` : 'Comptoir';
            toast.error(`⚠️ COMMANDE ANNULÉE PAR LE CLIENT (${tableStr}) !`, {
              description: `Commande #${c.id.slice(-6).toUpperCase()} • Ne pas préparer les plats`,
              duration: 5000,
            });

            setTimeout(() => {
              setRecentlyCancelledOrders((prev) => prev.filter((p) => p.id !== c.id));
              knownActiveOrderIds.current.delete(c.id);
            }, 4500);
          });
        }

        incomingOrders.forEach((o) => {
          if (o.status === 'PENDING' || o.status === 'PREPARING' || o.status === 'READY') {
            knownActiveOrderIds.current.add(o.id);
          } else if (o.status === 'SERVED') {
            knownActiveOrderIds.current.delete(o.id);
          }
        });

        previousPendingIds.current = new Set(currentPending.map((o) => o.id));
        isInitialLoad.current = false;
        setOrders(incomingOrders);
        setLastSyncTime(new Date());
      }
    } catch (err) {
      // Coupure réseau : fallback sur le cache KDS
      setIsOffline(true);
      const cached = getCachedKitchenOrders();
      if (cached.length > 0) {
        setOrders(cached);
      }
      refreshQueueCount();
      if (!silent) {
        console.warn('[useKitchenOrders] Coupure réseau détectée, affichage du cache local:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, service, isAudioEnabled, isWsUnstable, refreshQueueCount]);

  // Update order status API call avec interceptor résilient
  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
      // Mise à jour optimiste immédiate dans l'UI
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        )
      );

      if (newStatus === 'SERVED') {
        playKitchenServedAlert();
      }

      const result = await resilientFetch(
        `/api/kitchen/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(restaurantId ? { 'x-kds-token': `kds_session_${restaurantId}` } : {})
          },
          body: JSON.stringify({ status: newStatus, restaurantId }),
        },
        'KITCHEN',
        `Mise à jour #${orderId.slice(-5)} -> ${newStatus}`
      );

      if (result.isOfflineQueued) {
        refreshQueueCount();
        setIsOffline(true);
        toast.warning('⚡ Réseau indisponible : action enregistrée en file d’attente (sera synchronisée au retour du réseau).');
        return true;
      }

      if (!result.ok) {
        toast.error('Erreur lors de la mise à jour du statut.');
        fetchOrders(true);
        return false;
      }

      toast.success(
        newStatus === 'PREPARING'
          ? '👨‍🍳 Commande passée en préparation'
          : newStatus === 'READY'
          ? '📦 Commande prête au guichet'
          : newStatus === 'SERVED'
          ? '✅ Commande servie'
          : 'Statut mis à jour'
      );

      fetchOrders(true);
      return true;
    },
    [fetchOrders, restaurantId, refreshQueueCount]
  );

  // Supabase Realtime Subscription + Polling Fallback + Écouteurs de connectivité
  useEffect(() => {
    fetchOrders();

    const handleOnline = () => {
      setIsOffline(false);
      triggerManualSync();
    };

    const handleOffline = () => {
      setIsOffline(true);
      refreshQueueCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let channel: any = null;
    try {
      channel = supabase
        .channel('kitchen-realtime-orders')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'Order' },
          (payload: any) => {
            missedWsOrdersCount.current = 0;
            setIsWsUnstable(false);
            isWsTriggeredFetch.current = true;

            if (isAudioEnabled) {
              playKitchenOrderAlert();
            }
            toast.success(
              `🔔 NOUVELLE COMMANDE TABLE ${payload.new?.tableNumber || '?'} !`,
              { duration: 5000 }
            );
            fetchOrders(true);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'Order' },
          () => {
            missedWsOrdersCount.current = 0;
            setIsWsUnstable(false);
            isWsTriggeredFetch.current = true;
            fetchOrders(true);
          }
        )
        .subscribe((status: string) => {
          const isOk = status === 'SUBSCRIBED';
          setIsConnected(isOk);
          if (isOk) {
            missedWsOrdersCount.current = 0;
            setIsWsUnstable(false);
          } else {
            setIsWsUnstable(true);
          }
        });
    } catch (e) {
      setIsWsUnstable(true);
    }

    const interval = setInterval(() => {
      fetchOrders(true);
    }, effectivePollInterval);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchOrders, isAudioEnabled, effectivePollInterval, triggerManualSync, refreshQueueCount]);

  return {
    orders,
    recentlyCancelledOrders,
    isLoading,
    isConnected,
    isOffline,
    pendingSyncCount,
    lastSyncTime,
    updateOrderStatus,
    triggerManualSync,
    refetch: fetchOrders,
  };
}
