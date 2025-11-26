import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";

function ForgotPassword({ onBackToLogin }) {

  const [email, setEmail] = useState(""); // Email nhập vào
  const [message, setMessage] = useState(""); // Thông báo feedback
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Vui lòng nhập email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Email không hợp lệ");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {

      const response = await fetch(
        "http://localhost:1337/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(
          "✅ Liên kết đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư."
        );
      } else {
        setMessage(
          data.error || data.message || "Có lỗi xảy ra. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi gửi yêu cầu reset password:", error);
      setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Quên mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang gửi..." : "Gửi liên kết reset"}
        </Button>
      </form>
      {message && (
        <div
          className={
            message.includes("✅") ? "success-message" : "error-message"
          }
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
