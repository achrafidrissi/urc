import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function getConnecterUser(request) {
  let token = new Headers(request.headers).get("Authorization");
  if (token === undefined || token === null || token === "") {
    return null;
  } else {
    token = token.replace("Bearer ", "");
  }
  console.log("checking " + token);
  const user = await redis.get(token);
  console.log("Got user : " + user.id);
  return user;
}

export function triggerNotConnected(res) {
  res.status(401).json('{code: "UNAUTHORIZED", message: "Session expired"}');
}
export default async (request, response) => {
  try {
    const headers = new Headers(request.headers);
    const user = await getConnecterUser(request);
    if (user === undefined || user === null) {
      console.log("Not connected");
      triggerNotConnected(response);
      return;
    }

    const messageData = await request.body;
    console.log("All messagee", messageData);

    const { content, recipientId } = messageData;

    if (!content || !recipientId) {
      response
        .status(400)
        .json({ error: "Content and recipientId are required" });
      return;
    }

    // Créer un ID de conversation qui fonctionne dans les deux sens
    console.log("Sender ID:", user.id);
    console.log("Recipient ID:", recipientId);
    const conversationKey = [user.id, recipientId].sort().join("_");
    
    // Préparer le message à stocker
    const message = {
      id: Date.now().toString(),
      content,
      sender: user.username,
      senderId: user.id,
      recipientId,
      timestamp: new Date().toISOString(),
      conversationKey,
    };

    // Stocker le message dans Redis avec une expiration de 24h
    await redis.lpush(`messages:${conversationKey}`, JSON.stringify(message));
    await redis.expire(`messages:${conversationKey}`, 86400); // 24h en secondes

    response.json({
      success: true,
      message: "Message sent successfully",
      messageId: message.id,
    });
  } catch (error) {
    console.log("Error in message API:", error);
    response.status(500).json({ error: "Internal server error" });
  }
};
