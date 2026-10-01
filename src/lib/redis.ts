import { Redis } from '@upstash/redis';

// In-Memory Fallback Cache when Upstash keys are not present in .env
class MemoryRedisFallback {
  private store: Map<string, { value: any; expiresAt?: number }> = new Map();

  async get<T = any>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    try {
      return typeof entry.value === 'string' ? JSON.parse(entry.value) : entry.value;
    } catch {
      return entry.value as T;
    }
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<'OK'> {
    const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
    this.store.set(key, { value: stringified, expiresAt });
    return 'OK';
  }

  async setex(key: string, seconds: number, value: any): Promise<'OK'> {
    return this.set(key, value, { ex: seconds });
  }

  async del(...keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const k of keys) {
      if (this.store.delete(k)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  async keys(pattern: string): Promise<string[]> {
    const allKeys = Array.from(this.store.keys());
    if (pattern === '*' || !pattern) return allKeys;
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return allKeys.filter((k) => regex.test(k));
  }
}

const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Export singleton Redis instance (Live Upstash in Prod, Memory Fallback otherwise)
export const redis: Redis | any = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : new MemoryRedisFallback();

export const isRedisRemote = isUpstashConfigured;

// ---------------- GESTION CIBLÉE DU CACHE PAR CATÉGORIE ---------------- //
export const MENU_CACHE_TTL = 300; // 5 minutes

export function getCategoryCacheKey(tenantId: string, categoryId: string): string {
  return `menu:${tenantId.toLowerCase().trim()}:cat:${categoryId}`;
}

export function getAllMenuCacheKey(tenantId: string): string {
  return `menu:${tenantId.toLowerCase().trim()}:all`;
}

/**
 * Récupère le cache spécifique à une catégorie d'un établissement
 */
export async function getCachedCategoryMenu<T = any>(
  tenantId: string,
  categoryId: string
): Promise<T | null> {
  if (!tenantId || !categoryId) return null;
  const key = getCategoryCacheKey(tenantId, categoryId);
  try {
    const cached = await redis.get(key);
    return cached as T;
  } catch (err) {
    return null;
  }
}

/**
 * Enregistre le cache d'une catégorie donnée avec TTL 300s
 */
export async function setCachedCategoryMenu(
  tenantId: string,
  categoryId: string,
  data: any,
  ttlSeconds = MENU_CACHE_TTL
): Promise<void> {
  if (!tenantId || !categoryId) return;
  const key = getCategoryCacheKey(tenantId, categoryId);
  try {
    await redis.set(key, data, { ex: ttlSeconds });
  } catch (err) {
    // Fail silently in case of temporary Redis disconnection
  }
}

/**
 * Invalide UNIQUEMENT la catégorie ciblée lors de la modification d'un plat.
 * Cela évite d'invalider tout le menu des gros établissements.
 */
export async function invalidateCategoryMenuCache(
  tenantId: string,
  categoryId: string
): Promise<void> {
  if (!tenantId || !categoryId) return;
  const key = getCategoryCacheKey(tenantId, categoryId);
  try {
    await redis.del(key);
  } catch (err) {
    console.error(`[Redis] Erreur invalidation catégorie ${key}:`, err);
  }
}

/**
 * Invalide tout le menu (fallback lors de changement structurel global de carte)
 */
export async function invalidateTenantMenuCache(tenantId: string): Promise<void> {
  if (!tenantId) return;
  const cleanId = tenantId.toLowerCase().trim();
  const allKey = getAllMenuCacheKey(cleanId);
  try {
    // Supprimer le cache global
    await redis.del(allKey);
    // Si méthode keys disponible, purger les catégories de ce tenant
    if (typeof redis.keys === 'function') {
      const catKeys = await redis.keys(`menu:${cleanId}:cat:*`);
      if (catKeys && catKeys.length > 0) {
        await redis.del(...catKeys);
      }
    }
  } catch (err) {
    console.error(`[Redis] Erreur invalidation globale menu ${cleanId}:`, err);
  }
}