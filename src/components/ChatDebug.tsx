// Composant de debug pour vérifier les données Redux
import { useAppSelector } from "@/app/hooks";
import {
  selectCurrentConversation,
  selectChatStatus,
  selectChatError,
} from "@/features/chat/chatSlice";

export default function ChatDebug() {
  const currentConversation = useAppSelector(selectCurrentConversation);
  const chatStatus = useAppSelector(selectChatStatus);
  const chatError = useAppSelector(selectChatError);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Debug Chat</h3>
      <div>Status: {chatStatus}</div>
      <div>Error: {chatError || "None"}</div>
      <div>Conversation ID: {currentConversation?.id || "None"}</div>
      <div>Messages count: {currentConversation?.messages?.length || 0}</div>
      {currentConversation?.messages && (
        <div className="mt-2">
          <div>
            Last message:{" "}
            {currentConversation.messages[
              currentConversation.messages.length - 1
            ]?.content || "None"}
          </div>
        </div>
      )}
    </div>
  );
}
