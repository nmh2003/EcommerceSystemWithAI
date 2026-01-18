import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import "./UserList.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState(""); // "" = tất cả, "user", "admin"

  const [editableUserId, setEditableUserId] = useState(null);
  const [editableUserName, setEditableUserName] = useState("");
  const [editableUserEmail, setEditableUserEmail] = useState("");
  const [editableUserRole, setEditableUserRole] = useState("user");

  const navigate = useNavigate();

  const fetchUsers = async (page = 1, role = "") => {
    try {
      setLoading(true);
      setError(null);

      let url = `http://localhost:1337/api/users?page=${page}&limit=10`;
      if (role) {
        url += `&role=${role}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Quan trọng: gửi cookie
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("my-cms-user");
          navigate("/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setUsers(data.users || []);
      setPagination(data.pagination || {});
      setCurrentPage(page);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError("Không thể tải danh sách users. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId, userName) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa user "${userName}"?\n\nHành động này không thể hoàn tác!`
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://localhost:1337/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { message } = await response.json();
      alert(message || "Xóa user thành công!");

      fetchUsers(currentPage, roleFilter);
    } catch (err) {
      console.error("Delete user error:", err);
      alert("Không thể xóa user. Vui lòng thử lại.");
    }
  };

  const updateUser = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:1337/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fullName: editableUserName.trim(),
            email: editableUserEmail.trim(),
            role: editableUserRole,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      alert("Cập nhật user thành công!");

      setEditableUserId(null);
      setEditableUserName("");
      setEditableUserEmail("");
      fetchUsers(currentPage, roleFilter);
    } catch (err) {
      console.error("Update user error:", err);
      alert("Không thể cập nhật user. Vui lòng thử lại.");
    }
  };

  const startEdit = (user) => {
    setEditableUserId(user.id);
    setEditableUserName(user.fullName || "");
    setEditableUserEmail(user.email || "");
    setEditableUserRole(user.role || "user");
  };

  const cancelEdit = () => {
    setEditableUserId(null);
    setEditableUserName("");
    setEditableUserEmail("");
    setEditableUserRole("user");
  };

  const handleInputChange = (field, value) => {
    if (field === "fullName") {
      setEditableUserName(value);
    } else if (field === "email") {
      setEditableUserEmail(value);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, roleFilter);
    }
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setCurrentPage(1); // Reset về trang 1
    fetchUsers(1, role);
  };

  useEffect(() => {
    fetchUsers(currentPage, roleFilter);
  }, []); // Empty dependency array = chỉ chạy 1 lần khi mount

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <div>Đang tải danh sách users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "50px",
          color: "red",
          border: "1px solid red",
          borderRadius: "5px",
          margin: "20px",
          backgroundColor: "#ffe6e6",
        }}
      >
        <div>Lỗi: {error}</div>
        <button
          onClick={() => fetchUsers(currentPage, roleFilter)}
          style={{
            marginTop: "10px",
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="user-list-container" style={{ padding: "16px" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <div>Đang tải danh sách users...</div>
        </div>
      ) : error ? (
        <div
          style={{
            textAlign: "center",
            padding: "50px",
            color: "red",
            border: "1px solid red",
            borderRadius: "5px",
            margin: "20px",
            backgroundColor: "#ffe6e6",
          }}
        >
          <div>Lỗi: {error}</div>
          <button
            onClick={() => fetchUsers(currentPage, roleFilter)}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <AdminMenu />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px", textAlign: "left" }}>ID</th>
                <th style={{ padding: "8px", textAlign: "left" }}>NAME</th>
                <th style={{ padding: "8px", textAlign: "left" }}>EMAIL</th>
                <th style={{ padding: "8px", textAlign: "left" }}>ROLE</th>
                <th style={{ padding: "8px" }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ padding: "8px" }}>{user.id}</td>
                  <td style={{ padding: "8px" }}>
                    {editableUserId === user.id ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="text"
                          value={editableUserName}
                          onChange={(e) => setEditableUserName(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "2px 4px",
                            border: "1px solid #ccc",
                            borderRadius: "3px",
                            backgroundColor: "black",
                            color: "white",
                          }}
                        />
                        <button
                          onClick={() => updateUser(user.id)}
                          style={{
                            marginLeft: "2px",
                            backgroundColor: "blue",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            padding: "2px 4px",
                            cursor: "pointer",
                          }}
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {user.fullName || "Chưa cập nhật"}{" "}
                        <button
                          onClick={() => startEdit(user)}
                          style={{
                            marginLeft: "1rem",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {editableUserId === user.id ? (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <input
                          type="text"
                          value={editableUserEmail}
                          onChange={(e) => setEditableUserEmail(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "2px 4px",
                            border: "1px solid #ccc",
                            borderRadius: "3px",
                            backgroundColor: "black",
                            color: "white",
                          }}
                        />
                        <button
                          onClick={() => updateUser(user.id)}
                          style={{
                            marginLeft: "2px",
                            backgroundColor: "blue",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            padding: "2px 4px",
                            cursor: "pointer",
                          }}
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <a href={`mailto:${user.email}`}>{user.email}</a>{" "}
                        <button
                          onClick={() => startEdit(user)}
                          style={{
                            marginLeft: "1rem",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {editableUserId === user.id ? (
                      <select
                        value={editableUserRole}
                        onChange={(e) => setEditableUserRole(e.target.value)}
                        style={{
                          padding: "2px 4px",
                          border: "1px solid #ccc",
                          borderRadius: "3px",
                          backgroundColor: "black",
                          color: "white",
                        }}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {user.role === "admin" ? (
                          <span style={{ color: "green" }}>✓ Admin</span>
                        ) : (
                          <span style={{ color: "red" }}>✗ User</span>
                        )}
                        <button
                          onClick={() => startEdit(user)}
                          style={{
                            marginLeft: "1rem",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {user.role !== "admin" && (
                      <div style={{ display: "flex" }}>
                        <button
                          onClick={() => deleteUser(user.id, user.fullName)}
                          style={{
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            padding: "2px 4px",
                            cursor: "pointer",
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserList;
