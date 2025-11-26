import React, { useState, useEffect } from "react";
import Input from "./Input";
import Button from "./Button";
import { useAuth } from "../context/AuthContext";
import { useSearchParams } from "react-router-dom";

function OTPVerification({ onVerificationSuccess }) {

  const [otp, setOtp] = useState(""); // Mã OTP nhập vào
  const [message, setMessage] = useState(""); // Thông báo feedback
  const [isLoading, setIsLoading] = useState(false); // Trạng thái loading
  const [isResending, setIsResending] = useState(false); // Trạng thái resend loading
  const [countdown, setCountdown] = useState(0); // Countdown cho resend (giây)

  const { verifyOTP, sendOTP } = useAuth();

  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!email) {
    return (
      <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
        <h2>Lỗi</h2>
        <p>Email không hợp lệ. Vui lòng thử đăng ký lại.</p>
      </div>
    );
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return; // Prevent resend if countdown active

    setIsResending(true);
    setMessage("");

    try {
      console.log("🔄 Resending OTP to:", email);

      const response = await sendOTP(email);

      if (response.success) {
        setMessage("✅ Mã OTP mới đã được gửi đến email của bạn!");
        setCountdown(60); // Start 60 second countdown
        setOtp(""); // Clear current OTP input
      } else {
        setMessage(response.message || "Không thể gửi lại mã OTP");
      }
    } catch (error) {
      console.error("Lỗi gửi lại OTP:", error);
      setMessage(error.message || "Có lỗi xảy ra khi gửi lại OTP");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      setMessage("Vui lòng nhập mã OTP");
      return;
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setMessage("Mã OTP phải là 6 chữ số");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {

      console.log("🔍 Debug OTP Request:", { email, otp });

      const response = await verifyOTP(email, otp);

      console.log("🔍 Debug OTP Response:", response);

      if (response.success) {
        setMessage("✅ Xác thực thành công! Vui lòng đăng nhập.");

        setTimeout(() => {
          onVerificationSuccess && onVerificationSuccess();
        }, 2000);
      } else {
        setMessage(response.message || "Mã OTP không đúng hoặc đã hết hạn");
      }
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);
      setMessage(error.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Nhập mã OTP</h2>
      <form onSubmit={handleVerifyOTP}>
        <Input
          label="Mã OTP"
          type="text"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setOtp(value);
          }}
          placeholder="Nhập 6 chữ số"
          required
        />
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <Button type="submit" disabled={isLoading || otp.length !== 6}>
            {isLoading ? "Đang xác thực..." : "Xác thực"}
          </Button>
          <Button
            type="button"
            onClick={handleResendOTP}
            disabled={isResending || countdown > 0}
            style={{
              backgroundColor: countdown > 0 ? "#ccc" : "#f0f0f0",
              color: countdown > 0 ? "#666" : "#333",
              border: "1px solid #ddd",
            }}
          >
            {isResending
              ? "Đang gửi..."
              : countdown > 0
              ? `Gửi lại (${countdown}s)`
              : "Gửi lại OTP"}
          </Button>
        </div>
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

export default OTPVerification;
