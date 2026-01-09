import { useState, useEffect } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import "./Register.css";

const Register = () => {

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const { register, user, loading: authLoading } = useAuth();

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

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return; // Dừng lại, không gọi API
    }

    try {

      setError("");

      const response = await register({
        fullName, // Gửi fullName
        email,
        password,
      });

      if (response.requiresVerification) {

        navigate(`/otp?email=${encodeURIComponent(email)}`);
        return; // Dừng lại, không redirect về home
      }

    } catch (err) {

      console.error("Register error:", err);
      setError(err.message || "Đã xảy ra lỗi");
    }
  };

  return (

    <section className="register-container">

      <div className="register-form-wrapper">

        <h1 className="register-title">Đăng ký</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={submitHandler} className="register-form">

          <div className="form-group">

            <label htmlFor="name" className="form-label">
              Tên
            </label>

            <input
              type="text" // Input type text
              id="name" // ID để kết nối với label
              className="form-input" // CSS class
              placeholder="Nhập tên" // Placeholder text

              value={fullName}

              onChange={(e) => setFullName(e.target.value)}
              required // HTML5 validation - bắt buộc nhập
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Địa chỉ email
            </label>
            <input
              type="email" // Input type email (HTML5 validation)

              id="email"
              className="form-input"
              placeholder="Nhập email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <input
              type="password" // Input type password (ẩn text)

              id="password"
              className="form-input"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            disabled={authLoading}
            type="submit" // type="submit" → trigger onSubmit
            className="submit-button"
          >

            {authLoading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <div className="register-footer">
          <p className="footer-text">
            Đã có tài khoản?

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
        alt="Register decoration"
        className="register-image"
      />
    </section>
  );
};

export default Register;
