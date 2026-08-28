// ==============================================================================
// GESTIONNAIRE HORS-LIGNE ROBUSTE VIA INDEXEDDB (LOU AME TAY ?)
// Permet la prise de commande continue même sans réseau WiFi / 4G en salle
// ==============================================================================

const DB_NAME = 'LouAmeTayOfflineDB';
const DB_VERSION = 1;
const STORE_ORDERS = 'offline_orders';

export interface PersistentOfflineOrder {
  id: string;
  tableNumber: number;
  items: any[];
  total: number;
  customerNote?: string;
  createdAt: string;
  synced: boolean;
}

/**
 * Initialise ou ouvre la base de données locale IndexedDB.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject('IndexedDB non supporté');
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_ORDERS)) {
        db.createObjectStore(STORE_ORDERS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Enregistre une commande de manière persistante dans IndexedDB.
 */
export async function saveOrderToIndexedDB(order: Omit<PersistentOfflineOrder, 'id' | 'createdAt' | 'synced'>): Promise<PersistentOfflineOrder> {
  const db = await openDB();
  const newOrder: PersistentOfflineOrder = {
    ...order,
    id: `idb_ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, 'readwrite');
    const store = tx.objectStore(STORE_ORDERS);
    const req = store.add(newOrder);

    req.onsuccess = () => {
      // Déclencher Background Sync si supporté par le Service Worker
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((reg: any) => {
          reg.sync.register('sync-offline-orders');
        }).catch(() => {});
      }
      resolve(newOrder);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Récupère toutes les commandes en attente dans IndexedDB.
 */
export async function getPendingOrdersFromIndexedDB(): Promise<PersistentOfflineOrder[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ORDERS, 'readonly');
    const store = tx.objectStore(STORE_ORDERS);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Synchronise les commandes en attente dès que la connexion revient.
 */
export async function syncIndexedDBOrders(): Promise<{ syncedCount: number; errorsCount: number }> {
  try {
    const orders = await getPendingOrdersFromIndexedDB();
    if (orders.length === 0) return { syncedCount: 0, errorsCount: 0 };

    let syncedCount = 0;
    let errorsCount = 0;
    const db = await openDB();

    for (const order of orders) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tableNumber: order.tableNumber,
            items: order.items,
            note: order.customerNote ? `[PWA Hors-Ligne] ${order.customerNote}` : '[PWA Hors-Ligne]',
          }),
        });

        if (res.ok) {
          // Supprimer de IndexedDB après synchronisation confirmée
          const tx = db.transaction(STORE_ORDERS, 'readwrite');
          tx.objectStore(STORE_ORDERS).delete(order.id);
          syncedCount++;
        } else {
          errorsCount++;
        }
      } catch (e) {
        errorsCount++;
      }
    }

    return { syncedCount, errorsCount };
  } catch (e) {
    return { syncedCount: 0, errorsCount: 0 };
  }
}
