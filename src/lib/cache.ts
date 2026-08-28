import { redis } from './redis';

export const CACHE_TTL = {
  MENU: 300,        // 5 minutes (Menus & Plats)
  STATS: 60,        // 1 minute (Dashboard KPIs & Tendances)
  LIVE_ORDERS: 10,  // 10 secondes (KDS Cuisine & Caisse)
  EXCHANGE_RATES: 3600, // 1 heure (Taux de conversion FCFA/EUR/USD)
};

// ---------------- MENU CACHING ---------------- //
export async function getCachedMenu<T = any>(restaurantId: string, lang = 'FR'): Promise<T | null> {
  const cacheKey = `menu:${restaurantId.toLowerCase()}:${lang.toUpperCase()}`;
  try {
    const cached = await redis.get(cacheKey);
    return cached as T;
  } catch {
    return null;
  }
}

export async function setCachedMenu(restaurantId: string, lang = 'FR', menuData: any): Promise<void> {
  const cacheKey = `menu:${restaurantId.toLowerCase()}:${lang.toUpperCase()}`;
  try {
    await redis.set(cacheKey, menuData, { ex: CACHE_TTL.MENU });
  } catch (e) {
    // Fail gracefully
  }
}

export async function invalidateMenuCache(restaurantId: string): Promise<void> {
  const cleanId = restaurantId.toLowerCase();
  try {
    // Delete all language variations for this restaurant
    const languages = ['FR', 'EN', 'ES', 'IT', 'WO'];
    const keysToDelete = languages.map((l) => `menu:${cleanId}:${l}`);
    await redis.del(...keysToDelete);
    // Also delete display cache
    await redis.del(`display:${cleanId}`);
  } catch (e) {}
}

// ---------------- DASHBOARD STATS CACHING ---------------- //
export async function getCachedDashboardStats<T = any>(restaurantId: string): Promise<T | null> {
  const cacheKey = `stats:${restaurantId.toLowerCase()}`;
  try {
    const cached = await redis.get(cacheKey);
    return cached as T;
  } catch {
    return null;
  }
}

export async function setCachedDashboardStats(restaurantId: string, statsData: any): Promise<void> {
  const cacheKey = `stats:${restaurantId.toLowerCase()}`;
  try {
    await redis.set(cacheKey, statsData, { ex: CACHE_TTL.STATS });
  } catch (e) {}
}

export async function invalidateDashboardStatsCache(restaurantId: string): Promise<void> {
  try {
    await redis.del(`stats:${restaurantId.toLowerCase()}`);
  } catch (e) {}
}

// ---------------- LIVE ORDERS CACHING ---------------- //
export async function getCachedLiveOrders<T = any>(restaurantId: string): Promise<T | null> {
  const cacheKey = `orders:live:${restaurantId.toLowerCase()}`;
  try {
    const cached = await redis.get(cacheKey);
    return cached as T;
  } catch {
    return null;
  }
}

export async function setCachedLiveOrders(restaurantId: string, ordersData: any): Promise<void> {
  const cacheKey = `orders:live:${restaurantId.toLowerCase()}`;
  try {
    await redis.set(cacheKey, ordersData, { ex: CACHE_TTL.LIVE_ORDERS });
  } catch (e) {}
}

export async function invalidateLiveOrdersCache(restaurantId: string): Promise<void> {
  try {
    await redis.del(`orders:live:${restaurantId.toLowerCase()}`);
  } catch (e) {}
}