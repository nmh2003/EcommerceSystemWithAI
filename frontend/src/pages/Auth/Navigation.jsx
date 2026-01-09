import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  AiOutlineHome,
  AiOutlineShopping,
  AiOutlineLogin,
  AiOutlineUserAdd,
  AiOutlineShoppingCart,
} from "react-icons/ai";
import { FaHeart } from "react-icons/fa";
import { BsRobot } from "react-icons/bs"; // Icon chatbot từ react-icons/bs
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import "./Navigation.css";

function Navigation() {

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const { getCartItemCount } = useCart();

  const cartCount = getCartItemCount();

  function toggleDropdown() {

    setDropdownOpen(!dropdownOpen);
  }

  function handleLogout() {

    logout();

    setDropdownOpen(false);

    navigate("/login");
  }

  return (
    <div

      style={{ zIndex: 9999 }}

      className="navigation-container"

      id="navigation-container"
    >

      <div className="nav-top-section">

        <Link to="/" className="nav-item">

          <AiOutlineHome className="nav-icon" size={26} />

          <span className="nav-item-name">TRANG CHỦ</span>
        </Link>

        <Link to="/shop" className="nav-item">
          <AiOutlineShopping className="nav-icon" size={26} />
          <span className="nav-item-name">CỬA HÀNG</span>
        </Link>

        <Link to="/cart" className="nav-item nav-cart">

          <div className="nav-item-content">
            <AiOutlineShoppingCart className="nav-icon" size={26} />
            <span className="nav-item-name">GIỎ HÀNG</span>
          </div>

        </Link>

        <Link to="/favorite" className="nav-item">
          <FaHeart className="nav-icon" size={26} />
          <span className="nav-item-name">YÊU THÍCH</span>
        </Link>

        <Link to="/vrm" className="nav-item">
          <BsRobot className="nav-icon" size={26} />
          <span className="nav-item-name">SELLER</span>
        </Link>
      </div>

      <div className="nav-bottom-section">

        {user ? (
          <div className="nav-user-section">

            <button onClick={toggleDropdown} className="nav-user-button">

              <span className="nav-username">
                {user.fullName || user.email}
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`nav-dropdown-arrow ${
                  dropdownOpen ? "nav-dropdown-arrow-open" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                />
              </svg>
            </button>

            {dropdownOpen && user && (
              <ul
                className={`nav-dropdown-menu ${

                  !user.role === "admin"
                    ? "nav-dropdown-small"
                    : "nav-dropdown-large"
                }`}
              >

                {user.role === "admin" && (
                  <>
                    <li key="admin-dashboard">
                      <Link
                        to="/admin/dashboard"
                        className="nav-dropdown-item"
                        onClick={function () {
                          setDropdownOpen(false);
                        }}
                      >
                        Bảng điều khiển
                      </Link>
                    </li>
                    <li key="admin-products">
                      <Link
                        to="/admin/products"
                        className="nav-dropdown-item"
                        onClick={function () {
                          setDropdownOpen(false);
                        }}
                      >
                        Sản phẩm
                      </Link>
                    </li>
                    <li key="admin-categories">
                      <Link
                        to="/admin/categories"
                        className="nav-dropdown-item"
                        onClick={function () {
                          setDropdownOpen(false);
                        }}
                      >
                        Danh mục
                      </Link>
                    </li>
                    <li key="admin-orders">
                      <Link
                        to="/admin/orders"
                        className="nav-dropdown-item"
                        onClick={function () {
                          setDropdownOpen(false);
                        }}
                      >
                        Đơn hàng
                      </Link>
                    </li>
                    <li key="admin-users">
                      <Link
                        to="/admin/users"
                        className="nav-dropdown-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Người dùng
                      </Link>
                    </li>
                  </>
                )}

                <li key="profile">
                  <Link
                    to="/profile"
                    className="nav-dropdown-item"
                    onClick={function () {
                      setDropdownOpen(false);
                    }}
                  >
                    Hồ sơ
                  </Link>
                </li>

                <li key="logout">
                  <button
                    onClick={handleLogout}
                    className="nav-dropdown-item nav-dropdown-logout"
                  >
                    Đăng xuất
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : (

          <ul className="nav-auth-links">

            <li key="login">
              <Link to="/login" className="nav-item">
                <AiOutlineLogin className="nav-icon" size={26} />
                <span className="nav-item-name">ĐĂNG NHẬP</span>
              </Link>
            </li>

            <li key="register">
              <Link to="/register" className="nav-item">
                <AiOutlineUserAdd className="nav-icon" size={26} />
                <span className="nav-item-name">ĐĂNG KÝ</span>
              </Link>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

export default Navigation;
