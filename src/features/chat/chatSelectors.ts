import { RootState } from "@/app/store";

export const selectConversations = (state: RootState) =>
  state.chat.conversations;
export const selectCurrentConversationId = (state: RootState) =>
  state.chat.currentConversationId;
export const selectCurrentConversation = (state: RootState) => {
  const conversations = state.chat.conversations;
  const currentId = state.chat.currentConversationId;
  return conversations.find((conv) => conv.id === currentId);
};
export const selectChatStatus = (state: RootState) => state.chat.status;
export const selectChatError = (state: RootState) => state.chat.error;
