import * as PusherPushNotifications from "@pusher/push-notifications-web";

export async function initPushNotifications(token: string, externalId: string) {
  console.log("🟦 initPushNotifications() called", { token, externalId });

  if (!("Notification" in window)) {
    console.warn("Notifications not supported in this browser.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn("Notification permission not granted");
    return;
  }

  try {
    const beamsClient = new PusherPushNotifications.Client({
      instanceId: import.meta.env.VITE_PUSHER_INSTANCE_ID!,
    });
    console.log("✅ Created Beams client");

    const beamsTokenProvider = new PusherPushNotifications.TokenProvider({
  url: `/api/beams`, // ✅ ne mets PAS de ? ici !
  headers: {
    Authorization: `Bearer ${token}`,
    "X-User-Id": externalId, // on peut passer l’ID via un header si besoin
  },
});


    console.log("🔗 Starting Beams client...");
    await beamsClient.start();

    await beamsClient.addDeviceInterest("global");
    console.log("📡 Device subscribed to global interest");

    await beamsClient.setUserId(externalId, beamsTokenProvider);
    const deviceId = await beamsClient.getDeviceId();

    console.log("✅ Push device registered:", deviceId);
  } catch (error) {
    console.error("❌ Error initializing push notifications:", error);
  }
}
