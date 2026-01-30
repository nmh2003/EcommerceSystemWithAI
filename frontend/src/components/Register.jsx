import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import OTPVerification from "./OTPVerification";

function Register({ onSwitchToLogin }) {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState(""); // Thông báo feedback
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [showOTP, setShowOTP] = useState(false); // Hiển thị OTP verification
  const [userEmail, setUserEmail] = useState(""); // Email để verify OTP

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name.trim()) {
      setMessage("Vui lòng nhập họ tên");
      return false;
    }

    if (!email.trim()) {
      setMessage("Vui lòng nhập email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Email không hợp lệ");
      return false;
    }

    if (!password.trim()) {
      setMessage("Vui lòng nhập mật khẩu");
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

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage("");

    try {

      const response = await fetch("http://localhost:1337/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {

        setUserEmail(formData.email.trim());
        setShowOTP(true);
        setMessage("");
      } else {
        setMessage(
          data.error || data.message || "Có lỗi xảy ra. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      setMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerified = () => {

    setMessage("✅ Tài khoản đã được tạo thành công! Vui lòng đăng nhập.");
    setTimeout(() => {
      onSwitchToLogin();
    }, 2000);
  };

  const handleBackToRegister = () => {
    setShowOTP(false);
    setUserEmail("");
    setMessage("");
  };

  if (showOTP) {
    return (
      <OTPVerification
        email={userEmail}
        onVerified={handleOTPVerified}
        onBack={handleBackToRegister}
        purpose="register"
      />
    );
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <h2 style={{ margin: "0 0 10px 0", color: "#333" }}>
          Đăng ký tài khoản
        </h2>
        <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
          Tạo tài khoản mới để sử dụng hệ thống
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        <Input
          label="Họ tên"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Nhập họ tên đầy đủ"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Nhập địa chỉ email"
          required
        />

        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
          required
        />

        <Input
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Nhập lại mật khẩu"
          required
        />

        <Button
          type="submit"
          disabled={isLoading}
          style={{ width: "100%", marginTop: "20px" }}
        >
          {isLoading ? "Đang xử lý..." : "Đăng ký"}
        </Button>
      </form>

      {message && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "4px",
            textAlign: "center",
            fontSize: "14px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            border: "1px solid #f5c6cb",
          }}
        >
          {message}
        </div>
      )}

      {message && message.includes("✅") && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "4px",
            textAlign: "center",
            fontSize: "14px",
            backgroundColor: "#d4edda",
            color: "#155724",
            border: "1px solid #c3e6cb",
          }}
        >
          {message}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <span style={{ color: "#666", fontSize: "14px" }}>
          Đã có tài khoản?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px",
            }}
          >
            Đăng nhập
          </button>
        </span>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <p style={{ margin: "0 0 5px 0" }}>
          <strong>Điều khoản:</strong>
        </p>
        <ul style={{ margin: "0", paddingLeft: "20px" }}>
          <li>Email sẽ được sử dụng để xác thực tài khoản</li>
          <li>Mật khẩu sẽ được mã hóa an toàn</li>
          <li>Thông tin cá nhân được bảo mật</li>
        </ul>
      </div>
    </div>
  );
}

export default Register;
