import { useParams } from "react-router-dom";
import ChatLayout from "./ChatLayout";

export default function ChatPage() {
  const { userId } = useParams<{ userId: string }>();

  return <ChatLayout />;
}
