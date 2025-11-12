self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const { title = "New Transaction", body } = data;
  // const title = data.title || "New Transaction";

  const options = {
    body: body,
    icon: "./waaa.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notification", (event) => {
  console.log("[Service Worker] Notification click Received.");
  event.notification.close();

  event.waitUntil(
    clients.openWindow(`http://localhost:3000/transaction-dashboard`)
  );
});
