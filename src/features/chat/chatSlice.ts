// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { fetchMessagesThunk, sendMessageThunk } from "./chatThunks";
// import { createSelector } from "@reduxjs/toolkit";

// export interface Message {
//   id: string;
//   content: string;
//   sender: string;
//   timestamp: string;
//   isOwn: boolean;
//   conversationId: string;
// }

// interface Conversation {
//   messages: Message[];
// }

// interface ChatState {
//   conversations: Record<string, Conversation>;
//   currentConversationId: string | null;
//   status: "idle" | "loading" | "succeeded" | "failed";
//   error: string | null;
// }

// const initialState: ChatState = {
//   conversations: {},
//   currentConversationId: null,
//   status: "idle",
//   error: null,
// };

// const chatSlice = createSlice({
//   name: "chat",
//   initialState,
//   reducers: {
//     setCurrentConversation(state, action: PayloadAction<string>) {
//       state.currentConversationId = action.payload;
//     },
//     clearChatError(state) {
//       state.error = null;
//     },
//     appendMessage(state, action) {
//       const msg = action.payload;
//       const convId = msg.conversationId;

//       if (!state.conversations[convId]) {
//         state.conversations[convId] = { messages: [] };
//       }

//       state.conversations[convId].messages.push(msg);
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // 🟢 Récupération des messages depuis Redis
//       .addCase(fetchMessagesThunk.pending, (state) => {
//         state.status = "loading";
//         state.error = null;
//       })
//       .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
//         const { conversationId, messages } = action.payload;
//         state.status = "succeeded";
//         state.conversations[conversationId] = { messages };
//         state.currentConversationId = conversationId; // ✅ cohérence
//       })
//       .addCase(fetchMessagesThunk.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.payload as string;
//       })

//       // 🟣 Envoi d’un message
//       .addCase(sendMessageThunk.fulfilled, (state, action) => {
//         const msg = action.payload;
//         const convId = msg.conversationId;

//         const conv = state.conversations[convId];
//         if (!conv) return;

//         const index = conv.messages.findIndex((m) => m.id.startsWith("temp-"));
//         if (index !== -1) {
//           conv.messages[index] = msg;
//         } else {
//           conv.messages.push(msg);
//         }
//       });
//   },
// });

// export const { setCurrentConversation, clearChatError, appendMessage } =
//   chatSlice.actions;

// // 🔍 Sélecteurs
// export const selectChatStatus = (state: any) => state.chat.status;
// export const selectChatError = (state: any) => state.chat.error;

// export const selectChat = (state: any) => state.chat;

// export const selectCurrentConversation = createSelector(
//   [selectChat],
//   (chat) => {
//     const id = chat.currentConversationId;
//     return id ? chat.conversations[id] || null : null;
//   }
// );

// export default chatSlice.reducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchMessagesThunk, sendMessageThunk } from "./chatThunks";

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isOwn: boolean;
  conversationId: string;
}

interface Conversation {
  messages: Message[];
}

interface ChatState {
  conversations: Record<string, Conversation>;
  currentConversationId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ChatState = {
  conversations: {},
  currentConversationId: null,
  status: "idle",
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentConversation(state, action: PayloadAction<string>) {
      state.currentConversationId = action.payload;
    },
    clearChatError(state) {
      state.error = null;
    },

    // 🟢 affichage immédiat
    appendMessage(state, action: PayloadAction<Message>) {
      const m = action.payload;
      if (!state.conversations[m.conversationId]) {
        state.conversations[m.conversationId] = { messages: [] };
      }
      state.conversations[m.conversationId].messages.push(m);
    },

    // 🟣 remplacer l’id temporaire par l’id serveur
    finalizeMessage(
      state,
      action: PayloadAction<{
        conversationId: string;
        tempId: string;
        realId: string;
      }>
    ) {
      const { conversationId, tempId, realId } = action.payload;
      const list = state.conversations[conversationId]?.messages;
      if (!list) return;
      const i = list.findIndex((x) => x.id === tempId);
      if (i !== -1) list[i].id = realId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        const { conversationId, messages } = action.payload;
        state.status = "succeeded";
        state.conversations[conversationId] = { messages };
        state.currentConversationId = conversationId;
      })
      .addCase(fetchMessagesThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        console.log("📥 SEND MESSAGE FULFILLED payload:", action.payload);
        const msg = action.payload;
        if (!msg || !msg.conversationId) {
          console.warn("⚠️ Message invalid, nothing added.");
          return;
        }

        const convId = msg.conversationId;
        if (!state.conversations[convId]) {
          state.conversations[convId] = { messages: [] };
        }
        if (!state.conversations[convId]) {
          state.conversations[convId] = { messages: [] };
        }

        // éviter doublon si le message optimiste existe déjà
        const exists = state.conversations[convId].messages.some(
          (m) => m.id === msg.id
        );
        if (!exists) {
          state.conversations[convId].messages.push(msg);
        }
      });
  },
});

export const {
  setCurrentConversation,
  clearChatError,
  appendMessage,
  finalizeMessage,
} = chatSlice.actions;

// Sélecteurs
export const selectChatStatus = (state: any) => state.chat.status;
export const selectChatError = (state: any) => state.chat.error;
export const selectCurrentConversation = (state: any) => {
  const id = state.chat.currentConversationId;
  if (!id) return null;
  return state.chat.conversations[id] || { messages: [] };
};

export default chatSlice.reducer;
