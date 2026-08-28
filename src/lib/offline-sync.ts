// ==============================================================================
// GESTIONNAIRE DE FILE D'ATTENTE HORS-LIGNE (OFFLINE QUEUE & AUTO-SYNC)
// Lou Ame Tay ? - Sécurisation des commandes en salle lors des coupures réseau
// ==============================================================================

const STORAGE_KEY = 'lou_ame_tay_offline_orders_queue';

export interface OfflineOrder {
  id: string;
  tableNumber: number;
  items: any[];
  total: number;
  customerNote?: string;
  timestamp: string;
}

/**
 * Enregistre une commande localement dans la file d'attente hors-ligne.
 */
export function queueOfflineOrder(order: Omit<OfflineOrder, 'id' | 'timestamp'>): OfflineOrder {
  if (typeof window === 'undefined') return order as any;

  const queue: OfflineOrder[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const newOrder: OfflineOrder = {
    ...order,
    id: `offline_ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };

  queue.push(newOrder);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

  // Demander un Background Sync au Service Worker si supporté
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((reg: any) => {
      return reg.sync.register('sync-offline-orders');
    }).catch(() => {});
  }

  return newOrder;
}

/**
 * Récupère toutes les commandes en attente de synchronisation.
 */
export function getPendingOfflineOrders(): OfflineOrder[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

/**
 * Envoie automatiquement toutes les commandes en file d'attente vers l'API /api/orders dès retour du réseau.
 */
export async function syncPendingOrders(): Promise<{ syncedCount: number; errorsCount: number }> {
  if (typeof window === 'undefined') return { syncedCount: 0, errorsCount: 0 };

  const queue = getPendingOfflineOrders();
  if (queue.length === 0) return { syncedCount: 0, errorsCount: 0 };

  let syncedCount = 0;
  let errorsCount = 0;
  const remainingQueue: OfflineOrder[] = [];

  for (const order of queue) {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: order.tableNumber,
          items: order.items,
          note: order.customerNote ? `[Sync Hors-Ligne] ${order.customerNote}` : '[Sync Hors-Ligne]',
        }),
      });

      if (res.ok) {
        syncedCount++;
      } else {
        remainingQueue.push(order);
        errorsCount++;
      }
    } catch (e) {
      remainingQueue.push(order);
      errorsCount++;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingQueue));
  return { syncedCount, errorsCount };
}

/**
 * Initialise les écouteurs de statut réseau et synchronisation automatique.
 */
export function initOfflineSyncListeners(onSyncSuccess?: (count: number) => void) {
  if (typeof window === 'undefined') return;

  // 1. Enregistrement du Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[PWA] Service Worker registration failed', err);
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'TRIGGER_BACKGROUND_SYNC') {
        syncPendingOrders().then(({ syncedCount }) => {
          if (syncedCount > 0 && onSyncSuccess) onSyncSuccess(syncedCount);
        });
      }
    });
  }

  // 2. Événement retour en ligne du navigateur
  window.addEventListener('online', () => {
    syncPendingOrders().then(({ syncedCount }) => {
      if (syncedCount > 0 && onSyncSuccess) onSyncSuccess(syncedCount);
    });
  });
}
