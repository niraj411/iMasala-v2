// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin to generate firebase-messaging-sw.js with env vars
function firebaseServiceWorkerPlugin() {
  return {
    name: 'firebase-sw-plugin',
    buildStart() {
      // Load env vars
      const env = loadEnv('', process.cwd(), 'VITE_')

      const swContent = `// public/firebase-messaging-sw.js
// This service worker handles background push notifications
// Auto-generated at build time - DO NOT EDIT DIRECTLY

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "${env.VITE_FIREBASE_API_KEY}",
  authDomain: "${env.VITE_FIREBASE_AUTH_DOMAIN}",
  projectId: "${env.VITE_FIREBASE_PROJECT_ID}",
  storageBucket: "${env.VITE_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${env.VITE_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${env.VITE_FIREBASE_APP_ID}"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Tandoori Kitchen';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo192.png',
    badge: '/badge72.png',
    tag: payload.data?.tag || 'default',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'View Order'
      }
    ],
    vibrate: [100, 50, 100],
    requireInteraction: payload.data?.requireInteraction === 'true'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  let urlToOpen = '/';

  if (data.orderId) {
    urlToOpen = \`/order-status/\${data.orderId}\`;
  } else if (data.url) {
    urlToOpen = data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes('app.tandoorikitchenco.com') && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
`
      // Write to public folder
      fs.writeFileSync(path.resolve(process.cwd(), 'public/firebase-messaging-sw.js'), swContent)
    }
  }
}

export default defineConfig({
  plugins: [react(), firebaseServiceWorkerPlugin()],
  server: {
    proxy: {
      '/wp-json': {
        target: 'https://tandoorikitchenco.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})