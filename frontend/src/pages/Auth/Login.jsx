import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import "./Login.css"; // CSS thuần, KHÔNG dùng Tailwind
import "../../components/Message.css"; // Import CSS cho error/success messages

const Login = () => {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const { search } = useLocation();
  const sp = new URLSearchParams(search); // Parse query string
  const redirect = sp.get("redirect") || "/"; // Lấy redirect param hoặc default '/'

  const { user, loading, login } = useAuth();

  const { addToast } = useToast();

  useEffect(() => {

    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const submitHandler = async (e) => {

    e.preventDefault();

    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập Email");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập Mật khẩu");
      return;
    }

    try {

      await login({ email, password });

      addToast("Đăng nhập thành công!", "success");

      navigate(redirect);
    } catch (err) {

      setErrorMessage(err.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div>

      <section className="login-container">

        <div className="login-form-wrapper">

          <h1 className="login-title">Đăng nhập</h1>

          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <form onSubmit={submitHandler} className="login-form">

            <div className="form-group">

              <label htmlFor="email" className="form-label">
                Địa chỉ email
              </label>

              <input
                type="email"
                id="email"
                className="form-input"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>

              <input
                type="password"
                id="password"
                className="form-input"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button disabled={loading} type="submit" className="submit-button">
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="login-footer">
            <p className="footer-text">
              Khách hàng mới?{" "}
              <Link
                to={redirect ? `/register?redirect=${redirect}` : "/register"}
                className="footer-link"
              >
                Đăng ký
              </Link>
            </p>
            <p className="footer-text">
              <Link to="/forgot-password" className="footer-link">
                Quên mật khẩu?
              </Link>
            </p>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1678931548103-1e3944b899e3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2728"
          alt=""
          className="login-image"
        />
      </section>
    </div>
  );
};

export default Login;
