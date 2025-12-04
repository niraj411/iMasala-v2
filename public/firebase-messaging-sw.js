// public/firebase-messaging-sw.js
// This service worker handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyByYH4FwC9R6hQGSuK52s5LaHFIAm2yqWU",
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

  const notificationTitle = payload.notification?.title || 'Tandoori Kitchen';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/logo192.png', // Make sure this exists in public folder
    badge: '/badge72.png', // Optional badge icon
    tag: payload.data?.tag || 'default',
    data: payload.data,
    actions: [
      {
        action: 'open',
        title: 'View Order'
      }
    ],
    // Vibration pattern for mobile
    vibrate: [100, 50, 100],
    // Require interaction (notification won't auto-dismiss)
    requireInteraction: payload.data?.requireInteraction === 'true'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();

  // Get the action and data
  const action = event.action;
  const data = event.notification.data || {};
  
  // Determine where to navigate
  let urlToOpen = '/';
  
  if (data.orderId) {
    urlToOpen = `/order-status/${data.orderId}`;
  } else if (data.url) {
    urlToOpen = data.url;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if app is already open
      for (let client of windowClients) {
        if (client.url.includes('app.tandoorikitchenco.com') && 'focus' in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // If not open, open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});