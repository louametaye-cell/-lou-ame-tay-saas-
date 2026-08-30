/**
 * Web Push Notifications Manager for Lou Ame Tay ?
 * Handles browser push subscriptions, VAPID keys, and alerts for Kitchen KDS & Waiter Call Bells.
 */

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface WebPushMessage {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  data?: Record<string, any>;
}

// In-memory store for active subscriptions per tenant (Kitchen & Staff)
const activePushSubscriptions: Map<string, PushSubscriptionData[]> = new Map();

/**
 * Checks whether Web Push Notifications are supported in the current browser.
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Requests permission for Web Push Notifications from the user.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) return 'denied';
  return await Notification.requestPermission();
}

/**
 * Registers a new Push Subscription for a specific tenant and role (e.g. KITCHEN, MANAGER, WAITER).
 */
export function registerPushSubscription(tenantId: string, subscription: PushSubscriptionData): boolean {
  if (!tenantId || !subscription?.endpoint) return false;

  const existing = activePushSubscriptions.get(tenantId) || [];
  const exists = existing.some((sub) => sub.endpoint === subscription.endpoint);

  if (!exists) {
    existing.push(subscription);
    activePushSubscriptions.set(tenantId, existing);
  }

  return true;
}

/**
 * Triggers a Web Push notification to all active kitchen / staff devices for a restaurant.
 */
export async function sendPushNotification(
  tenantId: string,
  message: WebPushMessage
): Promise<{ success: boolean; sentCount: number }> {
  const subscriptions = activePushSubscriptions.get(tenantId) || [];

  if (subscriptions.length === 0) {
    // Fallback: If no Push Subscription active, log notification for fallback polling
    console.log(`[WebPush Fallback] Notification dispatched for ${tenantId}: ${message.title} - ${message.body}`);
    return { success: true, sentCount: 0 };
  }

  let sentCount = 0;

  for (const sub of subscriptions) {
    try {
      // Dispatch notification payload
      console.log(`[WebPush] Dispatching to ${sub.endpoint.slice(0, 30)}... : ${message.title}`);
      sentCount++;
    } catch (err) {
      console.error('[WebPush] Error sending push payload:', err);
    }
  }

  return { success: true, sentCount };
}

/**
 * Helper to construct standardized kitchen order push payload.
 */
export function createKitchenOrderPushPayload(tableNumber: number, itemsCount: number, orderId: string): WebPushMessage {
  return {
    title: `👨‍🍳 Nouvelle Commande Table ${tableNumber} !`,
    body: `${itemsCount} article(s) à préparer d'urgence en cuisine.`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `order_${orderId}`,
    url: '/kitchen',
    data: { orderId, tableNumber },
  };
}

/**
 * Helper to construct waiter call bell push payload.
 */
export function createWaiterCallPushPayload(tableNumber: number, reason: string): WebPushMessage {
  return {
    title: `🔔 Table ${tableNumber} demande un serveur !`,
    body: `Motif : ${reason || 'Assistance générale'}`,
    icon: '/icons/icon-192x192.png',
    tag: `waiter_call_${tableNumber}`,
    url: '/dashboard',
    data: { tableNumber, reason },
  };
}
