import { useState, useEffect } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./Register.css";

const ForgotPassword = () => {

  const [email, setEmail] = useState("");

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const { user, loading: authLoading } = useAuth();

  const navigate = useNavigate();

  const { search } = useLocation();

  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {

    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const submitHandler = async (e) => {

    e.preventDefault();

    if (!email || !email.includes("@")) {
      setError("Vui lòng nhập email hợp lệ");
      return;
    }

    try {

      setError("");
      setSuccess("");

      const response = await fetch(
        "http://localhost:1337/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Có lỗi xảy ra");
      }

      setSuccess(
        "Email reset mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn."
      );
    } catch (err) {

      console.error("Forgot password error:", err);
      setError(err.message || "Có lỗi xảy ra khi gửi email reset");
    }
  };

  return (

    <section className="register-container">

      <div className="register-form-wrapper">

        <h1 className="register-title">Quên mật khẩu</h1>

        {success && <div className="success-message">{success}</div>}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={submitHandler} className="register-form">

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Địa chỉ email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Nhập email đã đăng ký"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            disabled={authLoading}
            type="submit"
            className="submit-button"
          >
            {authLoading ? "Đang gửi..." : "Gửi email reset"}
          </button>
        </form>

        <div className="register-footer">
          <p className="footer-text">
            Quay lại{" "}
            <Link
              to={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="footer-link"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>

      <img
        src="https://afremov.com/media/catalog/product/COLORFUL-NIGHT.jpg"
        alt="Forgot password decoration"
        className="register-image"
      />
    </section>
  );
};

export default ForgotPassword;
