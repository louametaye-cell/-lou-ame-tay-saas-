import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { OrderType, OrderStatus } from '@/types';
import { playKitchenOrderAlert, playKitchenServedAlert } from '@/components/kitchen/KitchenSoundAlert';
import { toast } from 'sonner';

interface UseKitchenOrdersOptions {
  restaurantId?: string;
  isAudioEnabled?: boolean;
  pollIntervalMs?: number;
}

export function useKitchenOrders(options: UseKitchenOrdersOptions = {}) {
  const {
    restaurantId,
    isAudioEnabled = true,
    pollIntervalMs = 4000,
  } = options;

  const [orders, setOrders] = useState<OrderType[]>([]);
  const [recentlyCancelledOrders, setRecentlyCancelledOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isWsUnstable, setIsWsUnstable] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const previousPendingIds = useRef<Set<string>>(new Set());
  const knownActiveOrderIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const missedWsOrdersCount = useRef<number>(0);
  const isWsTriggeredFetch = useRef<boolean>(false);

  // Intervalle de polling dynamique : 2500ms si connexion instable ou >=3 commandes WS manquées, sinon pollIntervalMs (4000ms par défaut)
  const effectivePollInterval = (!isConnected || isWsUnstable || missedWsOrdersCount.current >= 3) ? 2500 : pollIntervalMs;

  // Fetch orders from API
  const fetchOrders = useCallback(async (silent = false) => {
    try {
      const url = restaurantId
        ? `/api/orders?restaurantId=${restaurantId}`
        : '/api/orders';

      const headers: Record<string, string> = {};
      if (restaurantId) headers['x-kds-token'] = `kds_session_${restaurantId}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: OrderType[] = data.orders || [];

        // Check for new PENDING orders to trigger audio & visual alert
        const currentPending = incomingOrders.filter((o) => o.status === 'PENDING');
        const newOrders = currentPending.filter(
          (o) => !previousPendingIds.current.has(o.id)
        );
        const hasNewOrder = newOrders.length > 0;

        // Détection de commandes WebSocket manquées :
        // Si de nouvelles commandes apparaissent via le polling régulier sans déclencheur WebSocket direct
        if (hasNewOrder && !isInitialLoad.current && !isWsTriggeredFetch.current) {
          missedWsOrdersCount.current += newOrders.length;
          if (missedWsOrdersCount.current >= 3 && !isWsUnstable) {
            console.warn(`[KDS] ${missedWsOrdersCount.current} commandes WebSocket manquées. Basculement automatique en mode polling accéléré (2,5s).`);
            setIsWsUnstable(true);
          }
        }
        // Réinitialiser le drapeau de fetch déclenché par WS
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

        // 🛑 Détecter si une commande qui était affichée vient d'être annulée par le client
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

            // Retrait automatique après 4.5s
            setTimeout(() => {
              setRecentlyCancelledOrders((prev) => prev.filter((p) => p.id !== c.id));
              knownActiveOrderIds.current.delete(c.id);
            }, 4500);
          });
        }

        // Mettre à jour les commandes actives connues affichées
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
      if (!silent) {
        console.error('[useKitchenOrders] Fetch failed:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, isAudioEnabled, isWsUnstable]);

  // Update order status API call
  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: OrderStatus): Promise<boolean> => {
      try {
        // Optimistic UI update
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );

        if (newStatus === 'SERVED') {
          playKitchenServedAlert();
        }

        const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(restaurantId ? { 'x-kds-token': `kds_session_${restaurantId}` } : {})
          },
          body: JSON.stringify({ status: newStatus, restaurantId }),
        });

        if (!res.ok) {
          throw new Error('Erreur de mise à jour du statut');
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
      } catch (err) {
        console.error('[useKitchenOrders] Update status failed:', err);
        toast.error('Échec de mise à jour. Veuillez réessayer.');
        fetchOrders(true);
        return false;
      }
    },
    [fetchOrders, restaurantId]
  );

  // Supabase Realtime Subscription + Interval Polling Fallback (2,5s si instable, 4s sinon)
  useEffect(() => {
    fetchOrders();

    let channel: any = null;
    try {
      channel = supabase
        .channel('kitchen-realtime-orders')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'Order' },
          (payload: any) => {
            // Signal WebSocket reçu avec succès : réinitialiser le compteur de manqués
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
            // WebSocket rétabli : repasser en mode WebSocket stable
            missedWsOrdersCount.current = 0;
            setIsWsUnstable(false);
          } else {
            // Déconnexion ou dégradation : basculer en polling 2,5s
            setIsWsUnstable(true);
          }
        });
    } catch (e) {
      console.warn('[useKitchenOrders] Supabase Realtime init error:', e);
      setIsWsUnstable(true);
    }

    // High-performance background polling fallback (2500ms si connexion instable ou >=3 manquants)
    const interval = setInterval(() => {
      fetchOrders(true);
    }, effectivePollInterval);

    return () => {
      clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchOrders, isAudioEnabled, effectivePollInterval]);


  return {
    orders,
    recentlyCancelledOrders,
    isLoading,
    isConnected,
    lastSyncTime,
    updateOrderStatus,
    refetch: fetchOrders,
  };
}
