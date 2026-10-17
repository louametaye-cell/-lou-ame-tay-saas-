// ==============================================================================
// GESTIONNAIRE DE RÉSILIENCE RÉSEAU SÉNÉGAL (OFFLINE-FIRST & FIFO SYNC)
// Lou Ame Tay ? - Protection contre les coupures Wi-Fi/Fibre Orange/Free
// Conforme au référentiel TERRAIN_SENEGAL.md : ZÉRO PERTE DE DONNÉES
// ==============================================================================

export type OfflineScope = 'CASHIER' | 'KITCHEN';

export interface QueuedNetworkAction {
  id: string;
  scope: OfflineScope;
  url: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body: any;
  createdAt: number;
  retryCount: number;
  label: string;
}

const CASHIER_QUEUE_KEY = 'lou_ame_tay_offline_cashier_queue';
const KITCHEN_QUEUE_KEY = 'lou_ame_tay_offline_kitchen_queue';
const KITCHEN_CACHE_KEY = 'lou_ame_tay_kds_orders_cache';
const SIMULATED_OFFLINE_KEY = 'lou_ame_tay_simulate_offline';

/**
 * Vérifie si le client est actuellement en ligne (en tenant compte de la simulation manuelle).
 */
export function isNetworkOnline(): boolean {
  if (typeof window === 'undefined') return true;
  if (sessionStorage.getItem(SIMULATED_OFFLINE_KEY) === 'true') {
    return false;
  }
  return navigator.onLine;
}

/**
 * Active ou désactive la simulation de coupure réseau pour les tests QA.
 */
export function setSimulatedNetworkOutage(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  if (enabled) {
    sessionStorage.setItem(SIMULATED_OFFLINE_KEY, 'true');
    window.dispatchEvent(new Event('offline'));
  } else {
    sessionStorage.removeItem(SIMULATED_OFFLINE_KEY);
    window.dispatchEvent(new Event('online'));
  }
}

/**
 * Récupère la file d'attente d'un scope donné.
 */
export function getOfflineQueue(scope: OfflineScope): QueuedNetworkAction[] {
  if (typeof window === 'undefined') return [];
  const key = scope === 'CASHIER' ? CASHIER_QUEUE_KEY : KITCHEN_QUEUE_KEY;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Sauvegarde la file d'attente pour un scope donné.
 */
function saveOfflineQueue(scope: OfflineScope, queue: QueuedNetworkAction[]): void {
  if (typeof window === 'undefined') return;
  const key = scope === 'CASHIER' ? CASHIER_QUEUE_KEY : KITCHEN_QUEUE_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('louametay:queue_changed', { detail: { scope, count: queue.length } }));
  } catch (err) {
    console.error('[Resilience] Erreur écriture localStorage:', err);
  }
}

/**
 * Ajoute une action dans la file d'attente locale (FIFO).
 */
export function enqueueOfflineAction(action: Omit<QueuedNetworkAction, 'id' | 'createdAt' | 'retryCount'>): QueuedNetworkAction {
  const item: QueuedNetworkAction = {
    ...action,
    id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
    retryCount: 0,
  };

  const queue = getOfflineQueue(action.scope);
  queue.push(item);
  saveOfflineQueue(action.scope, queue);
  return item;
}

/**
 * Intercepteur réseau résilient pour KDS et Caisse.
 * Tente la requête en direct. En cas d'échec réseau, empile l'action et renvoie un fallback offline.
 */
export async function resilientFetch(
  url: string,
  options: RequestInit,
  scope: OfflineScope,
  actionLabel: string
): Promise<{ ok: boolean; status: number; data?: any; isOfflineQueued?: boolean }> {
  // Si le réseau est coupé ou simulé coupé : stocker immédiatement
  if (!isNetworkOnline()) {
    enqueueOfflineAction({
      scope,
      url,
      method: (options.method as any) || 'POST',
      headers: (options.headers as any) || {},
      body: options.body ? JSON.parse(String(options.body)) : null,
      label: actionLabel,
    });
    return {
      ok: true,
      status: 202,
      isOfflineQueued: true,
      data: { success: true, offline: true, message: 'Action enregistrée hors-ligne' },
    };
  }

  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      // Si erreur serveur 5xx ou timeout, sauvegarder dans la file pour ne rien perdre
      if (res.status >= 500) {
        enqueueOfflineAction({
          scope,
          url,
          method: (options.method as any) || 'POST',
          headers: (options.headers as any) || {},
          body: options.body ? JSON.parse(String(options.body)) : null,
          label: actionLabel,
        });
        return {
          ok: true,
          status: 202,
          isOfflineQueued: true,
          data: { success: true, offline: true, message: 'Serveur indisponible, sauvegardé en file d’attente' },
        };
      }
      const errData = await res.json().catch(() => ({}));
      return { ok: false, status: res.status, data: errData };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, status: res.status, data };
  } catch (err) {
    // Échec réseau pur (Coupure fibre, DNS, timeout client)
    console.warn(`[Resilience] Échec réseau sur ${url}. Mise en file hors-ligne.`);
    enqueueOfflineAction({
      scope,
      url,
      method: (options.method as any) || 'POST',
      headers: (options.headers as any) || {},
      body: options.body ? JSON.parse(String(options.body)) : null,
      label: actionLabel,
    });
    return {
      ok: true,
      status: 202,
      isOfflineQueued: true,
      data: { success: true, offline: true, message: 'Connexion coupée, action enregistrée localement' },
    };
  }
}

/**
 * Traite la file d'attente hors-ligne dans l'ordre chronologique strict (FIFO).
 */
export async function flushOfflineQueue(
  scope: OfflineScope,
  onProgress?: (synced: number, total: number) => void
): Promise<{ synced: number; failed: number }> {
  if (!isNetworkOnline()) {
    return { synced: 0, failed: 0 };
  }

  const queue = getOfflineQueue(scope);
  if (queue.length === 0) {
    return { synced: 0, failed: 0 };
  }

  let synced = 0;
  let failed = 0;
  const remaining: QueuedNetworkAction[] = [];

  for (let i = 0; i < queue.length; i++) {
    const action = queue[i];
    try {
      const res = await fetch(action.url, {
        method: action.method,
        headers: {
          'Content-Type': 'application/json',
          ...(action.headers || {}),
        },
        body: action.body ? JSON.stringify(action.body) : undefined,
      });

      if (res.ok) {
        synced++;
        if (onProgress) onProgress(synced, queue.length);
      } else {
        // En cas d'erreur métier 4xx (sauf conflit ou session fermée), on garde jusqu'à 3 retries
        action.retryCount = (action.retryCount || 0) + 1;
        if (action.retryCount < 5) {
          remaining.push(action);
        }
        failed++;
      }
    } catch {
      // Coupure toujours présente : on conserve la commande et on arrête la boucle
      action.retryCount = (action.retryCount || 0) + 1;
      remaining.push(action);
      for (let j = i + 1; j < queue.length; j++) {
        remaining.push(queue[j]);
      }
      break;
    }
  }

  saveOfflineQueue(scope, remaining);
  return { synced, failed };
}

/**
 * Met en cache les commandes du KDS dans localStorage pour parer aux coupures totales.
 */
export function cacheKitchenOrders(orders: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KITCHEN_CACHE_KEY, JSON.stringify(orders));
  } catch {}
}

/**
 * Récupère le cache local KDS si le réseau est indisponible.
 */
export function getCachedKitchenOrders(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KITCHEN_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
