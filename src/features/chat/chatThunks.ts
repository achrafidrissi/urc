import { createAsyncThunk } from "@reduxjs/toolkit";
import { sendMessage, fetchMessages, SendMessageRequest } from "./chatApi";
import { Message } from "./chatSlice";
import { appendMessage, finalizeMessage } from "./chatSlice";

export const sendMessageThunk = createAsyncThunk(
  "chat/sendMessage",
  async (messageData: SendMessageRequest, { dispatch, rejectWithValue }) => {
    try {
      const meName = sessionStorage.getItem("username") || "Moi";
      const meId = String(sessionStorage.getItem("user_id") || "");
      const convId = [meId, String(messageData.recipientId)].sort().join("_");
      console.log("🧠 My user_id:", meId, "recipient:", messageData.recipientId);


      // 1) message temporaire : AFFICHAGE IMMÉDIAT
      const tempId = `temp-${Date.now()}`;
      const optimistic: Message = {
        id: tempId,
        content: messageData.content,
        sender: meName,
        timestamp: new Date().toISOString(),
        isOwn: true,
        conversationId: convId,
      };
      dispatch(appendMessage(optimistic));

      // 2) appel API
      const res = await sendMessage(messageData); // { messageId }
      const realId = String(res.messageId || Date.now());

      // 3) finaliser l’id
      const finalMessage: Message = {
        id: realId,
        content: messageData.content,
        sender: meName,
        timestamp: new Date().toISOString(),
        isOwn: true,
        conversationId: convId,
      };

      // remplacer l’optimistic par le message final
      dispatch(finalizeMessage({ conversationId: convId, tempId, realId }));

      console.log("✅ SEND THUNK CALLED with:", messageData);
console.log("🧩 Temporary ID:", tempId);
console.log("📨 Response from API:", res);
console.log("🎯 Final message object:", finalMessage);
      // 👉 on retourne le message complet pour le chatSlice
      return finalMessage;

    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchMessagesThunk = createAsyncThunk(
  "chat/fetchMessages",
  async (recipientId: string, { rejectWithValue }) => {
    try {
      const res = await fetchMessages(recipientId); // { messages, conversationKey }
      const meName = sessionStorage.getItem("username") || "";

      const parsed = (res.messages || []).map((m: any) => ({
        id: String(m.id),
        content: m.content,
        sender: m.sender,
        timestamp: m.timestamp,
        isOwn: m.sender === meName,
        conversationId: res.conversationKey,
      })).sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ) as Message[];

      return { conversationId: res.conversationKey, messages: parsed };
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);
