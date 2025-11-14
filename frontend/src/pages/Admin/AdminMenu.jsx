import { useState } from "react";
import { NavLink } from "react-router-dom";

const AdminMenu = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>

      <button
        style={{
          position: "fixed",
          top: isMenuOpen ? "8px" : "20px",
          right: isMenuOpen ? "8px" : "28px",
          backgroundColor: "#151515",
          padding: "8px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          zIndex: 1000,
        }}
        onClick={toggleMenu}
      >
        {isMenuOpen ? (

          <span style={{ color: "white", fontSize: "16px" }}>×</span>
        ) : (

          <div>
            <div
              style={{
                width: "24px",
                height: "2px",
                backgroundColor: "gray",
                margin: "3px 0",
              }}
            ></div>
            <div
              style={{
                width: "24px",
                height: "2px",
                backgroundColor: "gray",
                margin: "3px 0",
              }}
            ></div>
            <div
              style={{
                width: "24px",
                height: "2px",
                backgroundColor: "gray",
                margin: "3px 0",
              }}
            ></div>
          </div>
        )}
      </button>

      {isMenuOpen && (
        <section
          style={{
            position: "fixed",
            right: "28px",
            top: "20px",
            backgroundColor: "#151515",
            padding: "16px",
            borderRadius: "6px",
            zIndex: 999,
            minWidth: "200px",
          }}
        >
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            <li style={{ marginBottom: "20px" }}>
              <NavLink
                to="/admin/dashboard"
                style={({ isActive }) => ({
                  display: "block",
                  padding: "8px 12px",
                  color: isActive ? "greenyellow" : "white",
                  textDecoration: "none",
                  borderRadius: "3px",
                  transition: "background-color 0.2s",
                })}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#2E2D2D";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Bảng điều khiển quản trị
              </NavLink>
            </li>
            <li style={{ marginBottom: "20px" }}>
              <NavLink
                to="/admin/categories"
                style={({ isActive }) => ({
                  display: "block",
                  padding: "8px 12px",
                  color: isActive ? "greenyellow" : "white",
                  textDecoration: "none",
                  borderRadius: "3px",
                  transition: "background-color 0.2s",
                })}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#2E2D2D";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Tạo danh mục
              </NavLink>
            </li>
            <li style={{ marginBottom: "20px" }}>
              <NavLink
                to="/admin/products/create"
                style={({ isActive }) => ({
                  display: "block",
                  padding: "8px 12px",
                  color: isActive ? "greenyellow" : "white",
                  textDecoration: "none",
                  borderRadius: "3px",
                  transition: "background-color 0.2s",
                })}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#2E2D2D";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Tạo sản phẩm
              </NavLink>
            </li>
            <li style={{ marginBottom: "20px" }}>
              <NavLink
                to="/admin/products"
                style={({ isActive }) => ({
                  display: "block",
                  padding: "8px 12px",
                  color: isActive ? "greenyellow" : "white",
                  textDecoration: "none",
                  borderRadius: "3px",
                  transition: "background-color 0.2s",
                })}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#2E2D2D";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Tất cả sản phẩm
              </NavLink>
            </li>
            <li style={{ marginBottom: "20px" }}>
              <NavLink
                to="/admin/users"
                style={({ isActive }) => ({
                  display: "block",
                  padding: "8px 12px",
                  color: isActive ? "greenyellow" : "white",
                  textDecoration: "none",
                  borderRadius: "3px",
                  transition: "background-color 0.2s",
                })}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#2E2D2D";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Quản lý người dùng
              </NavLink>
            </li>
            <li style={{ marginBottom: "20px" }}>
              <NavLink
                to="/admin/orders"
                style={({ isActive }) => ({
                  display: "block",
                  padding: "8px 12px",
                  color: isActive ? "greenyellow" : "white",
                  textDecoration: "none",
                  borderRadius: "3px",
                  transition: "background-color 0.2s",
                })}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#2E2D2D";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "transparent";
                }}
              >
                Quản lý đơn hàng
              </NavLink>
            </li>
          </ul>
        </section>
      )}
    </>
  );
};

export default AdminMenu;
