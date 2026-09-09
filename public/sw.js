// Feedy Service Worker for Background Push Notifications
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

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
        householdId: data.householdId,
        mealType: data.mealType,
        fedBy: data.fedBy,
        time: data.time,
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
  const notifData = event.notification.data || {};
  const urlToOpen = notifData.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // 1. If an active client window is already open in background, notify it and focus
      for (const client of clientList) {
        if (client.url.includes(self.location.origin)) {
          client.postMessage({
            type: "NOTIFICATION_CLICKED",
            payload: notifData,
          });
          if ("focus" in client) {
            return client.focus();
          }
        }
      }
      // 2. If no window was open, launch a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
