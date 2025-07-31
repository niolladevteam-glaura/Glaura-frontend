self.addEventListener('push', function (event) {
  const data = event.data.json();

  console.log('Push event received:', data);

  // Only show notifications that come from the backend
  if (data.source !== "niolla-backend") return; // Ignore others

  const options = {
    body: data.body || 'You have a new notification!',
    icon: data.icon || '/icon.png',
    badge: data.badge || '/badge.png',
    data: {
      url: data.url || '/',
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

