// ==============================================================================
// SERVICE WORKER PWA HORS-LIGNE & BACKGROUND SYNC (LOU AME TAY ?)
// Permet la prise de commande continue même en cas de coupure 4G/3G/WiFi en salle
// ==============================================================================

const CACHE_NAME = 'louametay-offline-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/login',
  '/dashboard',
  '/kitchen',
  '/logo.png',
  '/favicon.ico',
];

// 1. Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW PWA] Mise en cache des assets pour mode hors-ligne...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Stratégie Network-First avec Fallback Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.status === 200) {
          const resClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          return new Response('Mode Hors-Ligne Actif - Lou Ame Tay ?', {
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

// 4. Background Sync pour renvoyer les commandes stockées dans IndexedDB
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-orders') {
    console.log('[SW PWA] 🔄 Background Sync déclenché : Réexpédition des commandes en attente...');
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'TRIGGER_BACKGROUND_SYNC' });
        });
      })
    );
  }
});

// 5. Réception & Affichage des Notifications Push (Cuisine KDS & Gérant)
self.addEventListener('push', (event) => {
  let data = { title: 'Lou Ame Tay ?', body: 'Nouvelle alerte de commande' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/logo.png',
    badge: data.badge || '/favicon.ico',
    tag: data.tag || 'general_notification',
    data: data.data || {},
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 6. Clic sur Notification -> Ouverture de l'écran Cuisine ou Dashboard
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/kitchen';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

