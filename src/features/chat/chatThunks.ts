import { createAsyncThunk } from "@reduxjs/toolkit";
import { sendMessage, fetchMessages, SendMessageRequest } from "./chatApi";
import { Message } from "./chatSlice";

export const sendMessageThunk = createAsyncThunk(
  "chat/sendMessage",
  async (messageData: SendMessageRequest, { rejectWithValue }) => {
    try {
      const response = await sendMessage(messageData);

      // Créer un objet Message pour le store
      const message: Message = {
        id: response.messageId,
        content: messageData.content,
        sender: sessionStorage.getItem("username") || "Vous",
        timestamp: new Date().toISOString(),
        isOwn: true,
        conversationId: `user_${messageData.recipientId}`,
      };

      return message;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessagesThunk = createAsyncThunk(
  "chat/fetchMessages",
  async (recipientId: string, { rejectWithValue }) => {
    try {
      const response = await fetchMessages(recipientId);
      return {
        conversationId: `user_${recipientId}`,
        messages: response.messages,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
