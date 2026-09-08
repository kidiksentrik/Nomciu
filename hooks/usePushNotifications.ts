"use client";

import { useState, useEffect, useCallback } from "react";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const DEVICE_ID_KEY = "nomciu_push_device_id";

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "dev-id";
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = "device_" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function usePushNotifications(householdId: string | null, feederName: string) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Check browser support and current subscription status on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
    setIsSupported(supported);

    if (!supported) return;

    setPermission(Notification.permission);

    // Register service worker if supported
    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(Boolean(sub));

        // If already subscribed and feederName/householdId is set, ensure it's up to date in Firestore
        if (sub && householdId && isFirebaseConfigured && db) {
          const deviceId = getOrCreateDeviceId();
          const subJSON = sub.toJSON();
          if (subJSON.keys) {
            await setDoc(
              doc(db, "households", householdId, "subscriptions", deviceId),
              {
                endpoint: sub.endpoint,
                keys: subJSON.keys,
                feederName: feederName || "Roommate",
                updatedAt: Date.now(),
              },
              { merge: true }
            );
          }
        }
      })
      .catch((err) => {
        console.warn("ServiceWorker registration failed:", err);
      });
  }, [householdId, feederName]);

  // Subscribe user to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      alert("Push notifications are not supported on this browser.");
      return false;
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      console.warn("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set.");
      return false;
    }

    setIsSubscribing(true);

    try {
      // 1. Request permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        setIsSubscribing(false);
        return false;
      }

      // 2. Register / ready service worker
      const registration = await navigator.serviceWorker.ready;

      // 3. Subscribe to PushManager
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // 4. Save subscription to Firestore under household
      if (householdId && isFirebaseConfigured && db) {
        const deviceId = getOrCreateDeviceId();
        const subJSON = subscription.toJSON();
        if (subJSON.keys) {
          await setDoc(
            doc(db, "households", householdId, "subscriptions", deviceId),
            {
              endpoint: subscription.endpoint,
              keys: subJSON.keys,
              feederName: feederName || "Roommate",
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        }
      }

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Failed to subscribe to push notifications:", err);
      return false;
    } finally {
      setIsSubscribing(false);
    }
  }, [isSupported, householdId, feederName]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      if (householdId && isFirebaseConfigured && db) {
        const deviceId = getOrCreateDeviceId();
        await deleteDoc(doc(db, "households", householdId, "subscriptions", deviceId));
      }

      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error("Failed to unsubscribe:", err);
      return false;
    }
  }, [householdId]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isSubscribing,
    subscribe,
    unsubscribe,
  };
}
