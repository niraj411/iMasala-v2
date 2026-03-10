// public/firebase-messaging-sw.js
// This service worker handles background push notifications
// Auto-generated at build time from vite.config.js

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDwmhgXnerxhptPWz5iz-PBbR5ZwtzahTU",
  authDomain: "imasala-37b4d.firebaseapp.com",
  projectId: "imasala-37b4d",
  storageBucket: "imasala-37b4d.firebasestorage.app",
  messagingSenderId: "483793848610",
  appId: "1:483793848610:web:c0560b717161fc644c3d7b"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const data = payload.data || {};
  const customerName = data.customerName || data.customer_name || '';
  const orderTotal = data.orderTotal || data.order_total || '';
  const orderId = data.orderId || data.order_id || '';
  const orderStatus = data.orderStatus || data.status || '';

  // Build rich notification with customer name and order total
  let notificationTitle = payload.notification?.title || 'Tandoori Kitchen';
  let notificationBody = payload.notification?.body || 'You have a new notification';

  if (customerName && orderTotal) {
    notificationTitle = 'New Order from ' + customerName;
    notificationBody = '$' + orderTotal + (orderId ? ' — Order #' + orderId : '');
  } else if (customerName && orderStatus) {
    notificationTitle = 'Order Update — ' + customerName;
    notificationBody = 'Status: ' + orderStatus + (orderId ? ' (Order #' + orderId + ')' : '');
  } else if (customerName) {
    notificationTitle = 'Order from ' + customerName;
    if (orderId) notificationBody = 'Order #' + orderId;
  }

  const notificationOptions = {
    body: notificationBody,
    icon: '/logo192.png',
    badge: '/badge72.png',
    tag: data.tag || (orderId ? 'order_' + orderId : 'default'),
    data: data,
    actions: [
      {
        action: 'open',
        title: 'View Order'
      }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction === 'true' || !!orderId
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);

  event.notification.close();

  const data = event.notification.data || {};
  const orderId = data.orderId || data.order_id || '';

  let urlToOpen = '/';

  if (data.url) {
    urlToOpen = data.url;
  } else if (orderId && data.isAdmin === 'true') {
    urlToOpen = '/admin?order=' + orderId;
  } else if (orderId) {
    urlToOpen = '/order/' + orderId;
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
