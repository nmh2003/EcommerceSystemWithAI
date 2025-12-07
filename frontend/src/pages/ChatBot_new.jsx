import React, { useState, useRef } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import { useAuth } from "../context/AuthContext";

function ChatBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      message:
        "Xin chào! 👋 Tôi là trợ lý ảo của cửa hàng ecommerce. Tôi có thể giúp bạn:\n\n🛍️ Tìm kiếm và gợi ý sản phẩm\n📂 Xem danh mục sản phẩm\n� Thêm sản phẩm vào giỏ hàng\n💰 Đặt hàng trực tiếp\n📋 Tra cứu lịch sử đơn hàng\n\nBạn cần tôi hỗ trợ gì hôm nay?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const getJWTToken = () => {
    return localStorage.getItem("my-cms-user-token");
  };

  const sendMessageToAPI = async (userMessage) => {
    try {
      const jwtToken = getJWTToken();
      const requestBody = {
        user_input: userMessage,
      };

      if (user && jwtToken) {
        requestBody.jwt_token = jwtToken;
      }

      const response = await fetch("http://localhost:1337/api/chatbot/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Để gửi cookies
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error calling API:", error);
      throw error;
    }
  };

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      message: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {

      const response = await sendMessageToAPI(messageText);

      setTimeout(() => {
        setIsTyping(false);

        const botMessage = {
          id: Date.now() + 1,
          message:
            response.response || "Xin lỗi, tôi không thể xử lý yêu cầu này.",
          isUser: false,
          timestamp: new Date(),
          intent: response.intent,
          confidence: response.confidence,
          product_info: response.product_info,
          cart_info: response.cart_info,
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
    } catch {
      setIsTyping(false);
      setIsLoading(false);

      const errorMessage = {
        id: Date.now() + 1,
        message:
          "❌ Xin lỗi, đã có lỗi xảy ra khi kết nối với server. Vui lòng thử lại sau.\n\n💡 Lưu ý: Đảm bảo API server đang chạy tại http://localhost:1337",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        message:
          "Xin chào! 👋 Tôi là trợ lý ảo của cửa hàng ecommerce. Tôi có thể giúp bạn:\n\n🛍️ Tìm kiếm và gợi ý sản phẩm\n� Xem danh mục sản phẩm\n� Thêm sản phẩm vào giỏ hàng\n💰 Đặt hàng trực tiếp\n📋 Tra cứu lịch sử đơn hàng\n\nBạn cần tôi hỗ trợ gì hôm nay?",
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex flex-col">
        <div className="container mx-auto px-4 py-6 flex-grow flex flex-col max-w-6xl">

          <div className="bg-white rounded-t-2xl border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Trợ lý Ecommerce AI
                </h1>
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Đang trực tuyến
                  {user && (
                    <span className="ml-2 text-blue-600 text-xs">
                      • Đã đăng nhập
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearChat}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Xóa hội thoại
              </button>
            </div>
          </div>

          <div
            ref={chatContainerRef}
            className="flex-grow bg-white px-6 py-6 overflow-y-auto"
            style={{
              minHeight: "400px",
              maxHeight: "calc(100vh - 300px)",
            }}
          >
            <div className="space-y-1">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg.message}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                />
              ))}

              {isTyping && (
                <MessageBubble message="" isUser={false} isTyping={true} />
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="bg-white rounded-b-2xl">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="container mx-auto px-4 pb-6 max-w-6xl">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-blue-500 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Hướng dẫn sử dụng:</p>
                <ul className="space-y-1 text-blue-700">
                  <li>
                    • <strong>Tìm sản phẩm:</strong> "Tìm sản phẩm điện thoại"
                    hoặc "Sản phẩm giá rẻ"
                  </li>
                  <li>
                    • <strong>Xem danh mục:</strong> "Xem danh mục sản phẩm"
                    hoặc "Các loại sản phẩm"
                  </li>
                  <li>
                    • <strong>Xem sản phẩm trong danh mục:</strong> "Xem sản
                    phẩm trong danh mục điện thoại"
                  </li>
                  <li>
                    • <strong>Thêm vào giỏ hàng:</strong> "Thêm iPhone vào giỏ
                    hàng" (cần đăng nhập)
                  </li>
                  <li>
                    • <strong>Đặt hàng:</strong> "Đặt hàng sản phẩm XYZ" hoặc
                    "Thanh toán" (cần đăng nhập)
                  </li>
                  <li>
                    • <strong>Ví dụ:</strong> "Xem sản phẩm nổi bật trong danh
                    mục laptop"
                  </li>
                </ul>
                {!user && (
                  <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800 text-xs">
                    💡 <strong>Lưu ý:</strong> Đăng nhập để sử dụng các tính
                    năng thêm vào giỏ hàng và đặt hàng.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ChatBot;
