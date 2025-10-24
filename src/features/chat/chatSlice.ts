import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { sendMessageThunk, fetchMessagesThunk } from "./chatThunks";

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  conversationId: string;
}

export interface Conversation {
  id: string;
  userId: string;
  username: string;
  messages: Message[];
  lastMessage?: Message;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
  status: "idle",
};

// Add this selector to your chatSlice.ts

export const selectCurrentConversation = (state: { chat: ChatState }) => {
  const currentConversationId = state.chat.currentConversationId;
  return state.chat.conversations.find(
    (conversation) => conversation.id === currentConversationId
  );
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentConversation(state, action: PayloadAction<string>) {
      state.currentConversationId = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      const message = action.payload;
      const conversationId = message.conversationId;

      const conversation = state.conversations.find(
        (conv) => conv.id === conversationId
      );

      if (conversation) {
        conversation.messages.push(message);
        conversation.lastMessage = message;
      } else {
        // Create a new conversation if it doesn't exist
        const newConversation: Conversation = {
          id: conversationId,
          userId: conversationId.split("_")[1], // Format: user_123
          username: message.sender,
          messages: [message],
          lastMessage: message,
        };
        state.conversations.push(newConversation);
      }
    },
    loadMessages(
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>
    ) {
      const { conversationId, messages } = action.payload;
      const conversation = state.conversations.find(
        (conv) => conv.id === conversationId
      );

      if (conversation) {
        conversation.messages = messages;
        conversation.lastMessage = messages[messages.length - 1];
      } else {
        // Create conversation if it doesn't exist
        const newConversation: Conversation = {
          id: conversationId,
          userId: conversationId.split("_")[1],
          username: messages[0]?.sender || "Unknown",
          messages: messages,
          lastMessage: messages[messages.length - 1],
        };
        state.conversations.push(newConversation);
      }
    },
    chatLoading(state) {
      state.status = "loading";
    },
    chatSuccess(state) {
      state.status = "succeeded";
    },
    chatFailure(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessageThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const message = action.payload;
        const conversationId = message.conversationId;

        const conversation = state.conversations.find(
          (conv) => conv.id === conversationId
        );

        if (conversation) {
          conversation.messages.push(message);
          conversation.lastMessage = message;
        } else {
          const newConversation: Conversation = {
            id: conversationId,
            userId: conversationId.split("_")[1],
            username: message.sender,
            messages: [message],
            lastMessage: message,
          };
          state.conversations.push(newConversation);
        }
      })
      .addCase(sendMessageThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchMessagesThunk.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        const { conversationId, messages } = action.payload;

        const conversation = state.conversations.find(
          (conv) => conv.id === conversationId
        );

        if (conversation) {
          conversation.messages = messages;
          conversation.lastMessage = messages[messages.length - 1];
        } else {
          const newConversation: Conversation = {
            id: conversationId,
            userId: conversationId.split("_")[1],
            username: messages[0]?.sender || "Unknown",
            messages: messages,
            lastMessage: messages[messages.length - 1],
          };
          state.conversations.push(newConversation);
        }
      })
      .addCase(fetchMessagesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentConversation,
  addMessage,
  loadMessages,
  chatLoading,
  chatSuccess,
  chatFailure,
} = chatSlice.actions;

// Sélecteurs utiles pour le statut et les erreurs
export const selectChatStatus = (state: { chat: ChatState }) => state.chat.status;

export const selectChatError = (state: { chat: ChatState }) => state.chat.error;


export default chatSlice.reducer;
