/**
 * Gửi tin nhắn tới ChatBot (API Gateway /chat)
 * history: [{ role: 'user' | 'assistant', content: string }]
 *
 * Lưu ý: ChatBot dùng URL riêng (VITE_CHAT_GATEWAY_URL) để không ảnh hưởng đến
 * các API order/menu/cart vẫn dùng VITE_ORDER_SERVICE_URL (cổng 3001)
 */
const CHAT_GATEWAY_URL =
  import.meta.env.VITE_CHAT_GATEWAY_URL || "http://localhost:5055";

export const sendChatMessage = async ({
  message,
  history = [],
  scope = null,
}) => {
  if (!message || typeof message !== "string") {
    throw new Error("Nội dung tin nhắn không hợp lệ");
  }

  const url = `${CHAT_GATEWAY_URL}/chat`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      history,
      scope,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage =
      errorData.message ||
      errorData.error ||
      `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }

  return response.json();
};
