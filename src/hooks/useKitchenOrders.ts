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
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const previousPendingIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);

  // Fetch orders from API
  const fetchOrders = useCallback(async (silent = false) => {
    try {
      const url = restaurantId
        ? `/api/orders?restaurantId=${restaurantId}`
        : '/api/orders';

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: OrderType[] = data.orders || [];

        // Check for new PENDING orders to trigger audio & visual alert
        const currentPending = incomingOrders.filter((o) => o.status === 'PENDING');
        const hasNewOrder = currentPending.some(
          (o) => !previousPendingIds.current.has(o.id)
        );

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
  }, [restaurantId, isAudioEnabled]);

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          throw new Error('Erreur de mise à jour du statut');
        }

        toast.success(
          newStatus === 'PREPARING'
            ? '👨‍🍳 Commande passée en préparation'
            : newStatus === 'SERVED'
            ? '✅ Commande servie et archivée'
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
    [fetchOrders]
  );

  // Supabase Realtime Subscription + Interval Polling Fallback
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
            fetchOrders(true);
          }
        )
        .subscribe((status: string) => {
          setIsConnected(status === 'SUBSCRIBED');
        });
    } catch (e) {
      console.warn('[useKitchenOrders] Supabase Realtime init error:', e);
    }

    // High-performance background polling fallback
    const interval = setInterval(() => {
      fetchOrders(true);
    }, pollIntervalMs);

    return () => {
      clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchOrders, isAudioEnabled, pollIntervalMs]);

  return {
    orders,
    isLoading,
    isConnected,
    lastSyncTime,
    updateOrderStatus,
    refetch: fetchOrders,
  };
}
