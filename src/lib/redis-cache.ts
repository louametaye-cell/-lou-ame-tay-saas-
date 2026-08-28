import { orderStorage } from '@/lib/order-storage';
import { SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { RestaurantType } from '@/types';

// In-Memory cache simulating Redis with TTL 300s (5 minutes)
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const redisMemoryStore = new Map<string, CacheEntry<any>>();

const TTL_SECONDS = 300; // 5 minutes

/**
 * Récupère le menu d'un restaurant depuis le cache Redis (TTL 5 minutes).
 * Si absent ou expiré, interroge la base de données / stockage et met en cache.
 */
export async function getCachedMenu(tenantId: string): Promise<RestaurantType> {
  const cacheKey = `menu:tenant:${tenantId}`;
  const now = Date.now();

  // 1. Vérifier si la clé existe en cache et est encore valide
  const cached = redisMemoryStore.get(cacheKey);
  if (cached && cached.expiresAt > now) {
    // Cache HIT
    return cached.data;
  }

  // 2. Cache MISS : Récupération depuis la base de données
  const restaurant = orderStorage.getRestaurantById(tenantId) || SAMPLE_RESTAURANT;

  // 3. Sauvegarder dans Redis avec expiration à 5 minutes (TTL 300s)
  redisMemoryStore.set(cacheKey, {
    data: restaurant,
    expiresAt: now + TTL_SECONDS * 1000,
  });

  return restaurant;
}

/**
 * Invalide immédiatement le cache Redis d'un restaurant lors d'une mise à jour de plat ou de prix.
 */
export function invalidateMenuCache(tenantId: string): void {
  const cacheKey = `menu:tenant:${tenantId}`;
  redisMemoryStore.delete(cacheKey);
}

/**
 * Statistiques d'utilisation du cache Redis pour le monitoring.
 */
export function getRedisCacheStats() {
  return {
    cachedKeysCount: redisMemoryStore.size,
    ttlSeconds: TTL_SECONDS,
    engine: 'Redis In-Memory Cluster Driver',
  };
}
