import webpush from "web-push";

// const vapidKeys = webpush.generateVAPIDKeys();
// console.log(vapidKeys);

export function generateVAPIDKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  console.log("=== VAPID KEYS ===");
  console.log("PUBLIC KEY (add to .env.local as NEXT_PUBLIC_PUSH_PUBLIC_KEY):");
  console.log(vapidKeys.publicKey);
  console.log("\nPRIVATE KEY (add to .env as VAPID_PRIVATE_KEY):");
  console.log(vapidKeys.privateKey);
  console.log("==================");
  return vapidKeys;
}

generateVAPIDKeys(); 
