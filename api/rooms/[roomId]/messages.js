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

export default async function handler(request, response) {
  try {
    const user = await getConnecterUser(request);
    if (!user) return triggerNotConnected(response);

    const { roomId } = request.query;

    if (!roomId) {
      return response.status(400).json({
        error: "roomId est requis",
      });
    }

    if (request.method === "GET") {
      // 📋 Récupérer tous les messages du salon
      const redisKey = `rooms:${roomId}:messages`;
      console.log("Fetching room messages for:", roomId);

      const rawMessages = await redis.lrange(redisKey, 0, -1);

      // Parser les messages JSON
      const parsedMessages = rawMessages
        .map((msgStr) => {
          try {
            return typeof msgStr === "string" ? JSON.parse(msgStr) : msgStr;
          } catch {
            console.warn("⚠️ Skipped invalid message:", msgStr);
            return null;
          }
        })
        .filter(Boolean);

      // Trier les messages par timestamp croissant (les plus anciens en premier)
      parsedMessages.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      return response.json({
        success: true,
        messages: parsedMessages,
        roomId,
      });
    }

    if (request.method === "POST") {
      // 💬 Ajouter un message dans le salon
      const { content } = request.body;

      if (!content || !content.trim()) {
        return response.status(400).json({
          error: "Le contenu du message est requis",
        });
      }

      // Créer le message
      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sender: user.username,
        senderId: user.id,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        roomId: roomId,
      };

      // Sauvegarder le message dans Redis
      const redisKey = `rooms:${roomId}:messages`;
      await redis.lpush(redisKey, JSON.stringify(message));

      console.log("Message saved to room:", roomId, message.id);

      return response.json({
        success: true,
        message,
      });
    }

    // Méthode non supportée
    response.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Error in room messages API:", err);
    response.status(500).json({ error: "Internal server error" });
  }
}
