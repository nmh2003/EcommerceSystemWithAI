import React, { useState } from "react";
import Input from "./components/Input"; // Reuse Input component.
import Button from "./components/Button"; // Reuse Button component.

import { registerUser } from "./utils/api";

import { saveUser } from "./utils/localStorage";
import { STORAGE_KEYS } from "./utils/constants";
import { useToast } from "./context/ToastContext";

function Register() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // State message feedback.

  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent reload.
    try {

      const data = await registerUser({ email, password });

      if (data.user) {
        saveUser(data.user);
        addToast("Đăng ký thành công! Chào mừng bạn!", "success");
      } else {
        setMessage(data.error || "Đăng ký thất bại.");
      }
    } catch (error) {
      setMessage("Lỗi: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>Đăng ký</h2>
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

        <Button type="submit">Đăng ký</Button>
      </form>

      {message && <div className="error-message">{message}</div>}
    </div>
  );
}

export default Register;
