import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ChatWidget.module.scss";
import { sendChatMessage } from "../../services/chatService";
import { getMenuItemById } from "../../services/menuService";
import { formatCurrency } from "../../utils/formatCurrency";

const initialAssistantMessage = {
  role: "assistant",
  content:
    "Em là trợ lý của quán, em có thể hỗ trợ anh/chị chọn món, gợi ý combo phù hợp hoặc tư vấn đặt bàn ạ. Anh/chị cứ thoải mái hỏi em nha. 💛",
};

const ChatWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialAssistantMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assistantName, setAssistantName] = useState("");
  const messagesEndRef = useRef(null);

  const initials = useMemo(() => {
    if (!assistantName) return "AI";
    return assistantName[0]?.toUpperCase() || "A";
  }, [assistantName]);

  useEffect(() => {
    if (!isOpen) return;
    if (!messagesEndRef.current) return;
    messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const newUserMessage = { role: "user", content: trimmed };
    const history = [...messages, newUserMessage];

    setMessages(history);
    setInput("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: trimmed,
        history,
      });

      const replyText =
        response?.reply ||
        "Em đang gặp chút trục trặc nhỏ, anh/chị cho em xin phép trả lời lại sau ít phút nhé.";

      if (response?.assistantName) {
        setAssistantName(response.assistantName);
      }

      // Lưu productIds nếu có để hiển thị link
      const productIds = response?.productIds || null;

      let products = null;
      if (Array.isArray(productIds) && productIds.length > 0) {
        try {
          const results = await Promise.all(
            productIds.map((id) => getMenuItemById(id).catch(() => null))
          );
          products = results.filter(Boolean);
        } catch (err) {
          console.error("[ChatWidget] Lỗi lấy chi tiết món:", err);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: replyText,
          productIds,
          products,
        },
      ]);
    } catch (error) {
      console.error("[ChatWidget] error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Xin lỗi anh/chị, hiện tại em đang gặp chút sự cố kết nối nên chưa trả lời được. Anh/chị thử lại giúp em sau ít phút nhé.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Nút mở chat */}
      <button
        type="button"
        className={styles.chatButton}
        onClick={handleToggle}>
        <span className={styles.chatButtonIcon}>{initials}</span>
        <span>{isOpen ? "Ẩn trợ lý của quán" : "Hỏi trợ lý quán ăn"}</span>
      </button>

      {/* Khung chat */}
      {isOpen && (
        <section
          className={styles.chatPanel}
          aria-label="Trò chuyện với trợ lý quán">
          <header className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.agentAvatar}>{initials}</div>
              <div className={styles.agentMeta}>
                <span className={styles.agentName}>
                  {assistantName ? `Em ${assistantName}` : "Trợ lý nhà hàng"}
                </span>
                <span className={styles.agentRole}>
                  Hỗ trợ gọi món & đặt bàn
                </span>
              </div>
            </div>
            <div className={styles.statusDot} aria-hidden="true" />
            <button
              type="button"
              className={styles.closeButton}
              onClick={handleToggle}
              aria-label="Đóng cửa sổ chat">
              ✕
            </button>
          </header>

          <div className={styles.messages}>
            {messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const productIds = msg.productIds || null;
              const products = msg.products || null;
              return (
                <div
                  key={index}
                  className={`${styles.messageRow} ${
                    isUser ? styles.messageRowUser : ""
                  }`}>
                  <div
                    className={`${styles.messageBubble} ${
                      isUser ? styles.messageUser : styles.messageAssistant
                    }`}>
                    <p>{msg.content}</p>

                    {/* Card món ăn nếu có products */}
                    {!isUser && products && products.length > 0 && (
                      <div className={styles.productLinks}>
                        {products.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            className={styles.productLink}
                            onClick={() => {
                              // Đường dẫn chi tiết món ăn trong router là /menu/:productId
                              navigate(`/menu/${product.id}`);
                              setIsOpen(false); // Đóng chat khi navigate
                            }}>
                            <div>
                              <strong>{product.name}</strong>
                            </div>
                            <div>{formatCurrency(product.price)}</div>
                            {product.description && (
                              <div>{product.description}</div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Fallback: nếu chỉ có ID mà chưa lấy được chi tiết */}
                    {!isUser &&
                      (!products || products.length === 0) &&
                      productIds &&
                      productIds.length > 0 && (
                        <div className={styles.productLinks}>
                          {productIds.map((productId) => (
                            <button
                              key={productId}
                              type="button"
                              className={styles.productLink}
                              onClick={() => {
                                // Đường dẫn chi tiết món ăn trong router là /menu/:productId
                                navigate(`/menu/${productId}`);
                                setIsOpen(false);
                              }}>
                              👉 Xem chi tiết món này
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className={styles.typing}>
                Em đang gõ câu trả lời cho anh/chị…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.inputBar} onSubmit={handleSubmit}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Anh/chị muốn chọn món hay đặt bàn ạ?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || !input.trim()}>
              <span>Gửi</span>
            </button>
          </form>
        </section>
      )}
    </>
  );
};

export default ChatWidget;
