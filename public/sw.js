// Feedy Service Worker for Background Push Notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Feedy Alert! 🐾";
    const options = {
      body: data.body || "Someone fed your pet!",
      icon: data.icon || "/icon.png",
      badge: "/icon.png",
      vibrate: [200, 100, 200],
      tag: data.tag || "feedy-feed",
      data: {
        url: data.url || "/",
      },
      renotify: true,
      requireInteraction: false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error showing push notification:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
