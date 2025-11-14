"use client";
import { useCallback } from "react";

function urlBase64ToUintArray(base64String: string) {
  const padding = "=".repeat(4 - ((base64String.length % 4) % 4));

  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
const usePushNotifications = () => {
  const registerPushNotifications = useCallback(async (): Promise<void> => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notification is not supporeted in this browser");
      return;
    }

    // register the service worker
    const registeration = await navigator.serviceWorker.register("push-sw.js");
    console.log("Service worker registered", registeration);

    // request user permission
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("Notifcation permission denied");
    }

    console.log("Push public key", process.env.NEXT_PUBLIC_PUSH_PUBLIC_KEY);

    // sub to push notification
    const applicationServerKey = urlBase64ToUintArray(
      process.env.NEXT_PUBLIC_PUSH_PUBLIC_KEY!
    );

    const subscription = await registeration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log("Push Notification sub", subscription);

    const response = await fetch("/api/send_transaction_notification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription),
    });

    if (!response.ok) {
      console.error("Failed to save subscription to server");
    } else {
      console.log("Sub save to server successfully");
    }
  }, []);

  const sendNotification = useCallback(
    async (title: string, body: string): Promise<void> => {
      const response = await fetch("/api/send_transaction_notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body }),
      });

      if (!response.ok) {
        console.error("Failed to send notification");
      } else {
        console.log("Notification sent!");
      }
    },
    []
  );

  return {
    registerPushNotifications,
    sendNotification,
  };
};

export default usePushNotifications;
