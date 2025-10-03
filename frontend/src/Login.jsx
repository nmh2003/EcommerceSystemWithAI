import React, { useState } from "react";
import Input from "./components/Input"; // Reuse Input component.
import Button from "./components/Button"; // Reuse Button component.
import { useToast } from "./context/ToastContext"; // Import useToast hook for notifications.

function Login({ onLoginSuccess }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // State message feedback.
  const { addToast } = useToast(); // Get addToast from context.

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent reload.
    try {
      const res = await fetch("http://localhost:1337/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        setMessage(`Error: ${res.status} - ${text}`);
        return;
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token); // Lưu token localStorage.
        addToast("Đăng nhập thành công! Token đã được lưu.", "success");

        if (onLoginSuccess) onLoginSuccess();
      } else {
        setMessage(data.error || "Đăng nhập thất bại.");
      }
    } catch (error) {
      setMessage("Lỗi: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit">Đăng nhập</Button>
      </form>

      {message && <div className="error-message">{message}</div>}
    </div>
  );
}

export default Login;
