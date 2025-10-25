// import { Redis } from "@upstash/redis";

// const redis = Redis.fromEnv();

// export async function getConnecterUser(request) {
//     let token = new Headers(request.headers).get('Authorization');
//     if (token === undefined || token === null || token === "") {
//         return null;
//     } else {
//         token = token.replace("Bearer ", "");
//     }
//     console.log("checking " + token);
//     const user = await redis.get(token);
//     console.log("Got user : " + user.username);
//     return user;
// }

// export function triggerNotConnected(res) {
//     res.status(401).json("{code: \"UNAUTHORIZED\", message: \"Session expired\"}");
// }

// export default async (request, response) => {
//   try {
//     const user = await getConnecterUser(request);
//     if (user === undefined || user === null) {
//       console.log("Not connected");
//       triggerNotConnected(response);
//       return;
//     }

//     const { recipientId } = request.query;

//     if (!recipientId) {
//       response.status(400).json({ error: "recipientId is required" });
//       return;
//     }

//     // Créer la même clé de conversation que pour l'envoi
//     const conversationKey = [user.user_id, recipientId].sort().join("_");

//     // Récupérer les messages depuis Redis
//     const messages = await redis.lrange(`messages:${conversationKey}`, 0, -1);

//     // Parser les messages JSON et les transformer pour l'affichage
//     const parsedMessages = messages.map((msgStr) => {
//   let msg;
//   try {
//     msg = typeof msgStr === "string" ? JSON.parse(msgStr) : msgStr;
//   } catch (err) {
//     console.error("❌ Failed to parse message:", msgStr, err);
//     msg = msgStr; // fallback
//   }

//   return {
//     id: msg.id,
//     content: msg.content,
//     sender: msg.sender,
//     timestamp: msg.timestamp,
//     isOwn: msg.senderId === user.user_id,
//     conversationId: `user_${recipientId}`,
//   };
// });

//     // Trier par timestamp (les plus anciens en premier)
//     parsedMessages.sort(
//       (a, b) =>
//         new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
//     );

//     response.json({
//       success: true,
//       messages: parsedMessages,
//       conversationKey,
//     });
//   } catch (error) {
//     console.log("Error in fetch messages API:", error);
//     response.status(500).json({ error: "Internal server error" });
//   }
// };


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

    const { recipientId } = request.query;
    if (!recipientId)
      return response.status(400).json({ error: "recipientId required" });

    const conversationKey = [String(user.id), String(recipientId)]
      .sort()
      .join("_");
    const redisKey = `messages:${conversationKey}`;

    console.log("Fetching conversation:", conversationKey);

    const rawMessages = await redis.lrange(redisKey, 0, -1);

    // 🧹 Corrige les messages non JSON
    const parsedMessages = rawMessages
      .map((m) => {
        try {
          return typeof m === "string" ? JSON.parse(m) : m;
        } catch {
          console.warn("⚠️ Skipped invalid message:", m);
          return null;
        }
      })
      .filter(Boolean);

    return response.json({
      success: true,
      messages: parsedMessages,
      conversationKey,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    response.status(500).json({ error: "Internal server error" });
  }
}