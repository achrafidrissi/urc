import { Message } from "@/features/chat/chatSlice";

const API_BASE = "/api";

export interface SendMessageRequest {
  content: string;
  recipientId: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  messageId: string;
}

export interface FetchMessagesResponse {
  success: boolean;
  messages: Message[];
  conversationKey: string;
}

export const sendMessage = async (
  messageData: SendMessageRequest
): Promise<SendMessageResponse> => {
  const token = sessionStorage.getItem("token");

  const response = await fetch(`${API_BASE}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(messageData),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
};

export const fetchMessages = async (
  recipientId: string
): Promise<FetchMessagesResponse> => {
  const token = sessionStorage.getItem("token");

  const response = await fetch(
    `${API_BASE}/messages?recipientId=${recipientId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch messages");
  }

  return response.json();
};

