import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Input from "./Input";
import Button from "./Button";

function ResetPassword() {

  const [password, setPassword] = useState(""); // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState(""); // Xác nhận mật khẩu
  const [message, setMessage] = useState(""); // Thông báo feedback
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [token, setToken] = useState(""); // Token từ URL

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");

    if (!tokenFromUrl) {
      setMessage("Liên kết không hợp lệ hoặc đã hết hạn");
      return;
    }

    setToken(tokenFromUrl);

  }, [searchParams]);

  const validatePassword = () => {
    if (!password.trim()) {
      setMessage("Vui lòng nhập mật khẩu mới");
      return false;
    }

    if (password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setIsLoading(true);
    setMessage("");

    try {

      const response = await fetch(
        "http://localhost:1337/api/auth/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            newPassword: password.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage(
          "✅ Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập lại."
        );
      } else {
        setMessage(
          data.error || data.message || "Có lỗi xảy ra. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi reset password:", error);
      setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Đặt lại mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Mật khẩu mới"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          label="Xác nhận mật khẩu"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
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

export default ResetPassword;
