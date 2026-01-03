import { useState } from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import Loader from "../../components/Loader";

import "./ProfileClone.css";

const Profile = function () {

  const { updateUser } = useAuth();

  const [fullName, setFullName] = useState(function () {

    const userString = localStorage.getItem("my-cms-user");
    const initialUserInfo = userString ? JSON.parse(userString) : null;
    return initialUserInfo?.fullName || "";
  });

  const [email, setEmail] = useState(function () {

    const userString = localStorage.getItem("my-cms-user");
    const initialUserInfo = userString ? JSON.parse(userString) : null;
    return initialUserInfo?.email || "";
  });

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(null);

  const submitHandler = async function (e) {

    e.preventDefault();

    setError(null);
    setSuccess(null);

    if (password && password !== confirmPassword) {
      setError("Mật khẩu không khớp");
      return; // Dừng execution
    }

    try {

      setLoading(true);

      const userString = localStorage.getItem("my-cms-user");
      const userInfo = userString ? JSON.parse(userString) : null;

      if (!userInfo) {
        throw new Error("Vui lòng đăng nhập để cập nhật hồ sơ");
      }

      const body = {
        fullName,
      };

      if (password) {
        body.password = password;
      }

      const response = await fetch(`http://localhost:1337/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Gửi cookie JWT tự động
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể cập nhật hồ sơ");
      }

      const updatedUser = await response.json();

      localStorage.setItem("my-cms-user", JSON.stringify(updatedUser));

      updateUser(updatedUser);

      setSuccess("Cập nhật hồ sơ thành công!");

      setPassword("");
      setConfirmPassword("");
    } catch (err) {

      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <div className="profile-form-section">
          <h2 className="profile-title">Cập nhật hồ sơ</h2>

          {error && <div className="error-message">{error}</div>}

          {success && <div className="success-message">{success}</div>}

          <form onSubmit={submitHandler} className="profile-form">

            <div className="form-group">
              <label className="form-label">Tên</label>

              <input
                type="text"
                placeholder="Nhập tên"
                className="form-input"
                value={fullName}
                onChange={function (e) {
                  setFullName(e.target.value);
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ email</label>

              <input
                type="email"
                placeholder="Email không thể thay đổi"
                className="form-input"
                value={email}
                disabled={true}
                style={{
                  backgroundColor: "#f5f5f5",
                  cursor: "not-allowed",
                  opacity: 0.6,
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>

              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="form-input"
                value={password}
                onChange={function (e) {
                  setPassword(e.target.value);
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>

              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="form-input"
                value={confirmPassword}
                onChange={function (e) {
                  setConfirmPassword(e.target.value);
                }}
              />
            </div>

            <div className="form-actions">

              <button type="submit" className="btn-update" disabled={loading}>
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </button>

              <Link to="/orders" className="btn-orders">
                Đơn hàng của tôi
              </Link>
            </div>
          </form>

          {loading && <Loader />}
        </div>
      </div>
    </div>
  );
};

export default Profile;
