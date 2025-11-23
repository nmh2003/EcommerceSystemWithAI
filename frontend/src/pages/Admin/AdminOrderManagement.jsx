import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import "./AdminOrderManagement.css";
import { useToast } from "../../context/ToastContext"; // Import useToast hook for notifications.
import AdminMenu from "./AdminMenu";

function AdminOrderManagement() {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const ordersPerPage = 10;

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const { user } = useAuth();

  const navigate = useNavigate();
  const { addToast } = useToast(); // Get addToast from context.

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchAllOrders = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://localhost:1337/api/orders", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Bạn không có quyền xem trang này");
          }
          throw new Error("Lỗi khi tải danh sách đơn hàng");
        }

        const data = await response.json();

        setOrders(data.orders || data || []);
      } catch (err) {
        console.error("Lỗi fetch orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllOrders();
  }, [user, navigate]);

  const filteredAndSearchedOrders = useMemo(() => {
    let result = orders;

    switch (filterStatus) {
      case "paid":
        result = result.filter((order) => order.isPaid === true);
        break;
      case "unpaid":
        result = result.filter((order) => order.isPaid === false);
        break;
      case "delivered":
        result = result.filter((order) => order.isDelivered === true);
        break;
      case "pending":
        result = result.filter((order) => order.isDelivered === false);
        break;
      case "all":
      default:
        break;
    }

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim();

      result = result.filter((order) => {
        const orderId = order.id.toLowerCase();
        const matchId = orderId.includes(query);

        const customerEmail = order.user?.email?.toLowerCase() || "";
        const matchEmail = customerEmail.includes(query);

        return matchId || matchEmail;
      });
    }

    return result;
  }, [orders, filterStatus, searchQuery]);

  const totalOrders = filteredAndSearchedOrders.length;

  const totalPages = Math.ceil(totalOrders / ordersPerPage);

  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;

  const currentOrders = filteredAndSearchedOrders.slice(startIndex, endIndex);

  const handleUpdateStatus = async (orderId, statusType, statusValue) => {
    const confirmMessage =
      statusType === "isPaid"
        ? "Đánh dấu đơn hàng này đã thanh toán?"
        : "Đánh dấu đơn hàng này đã giao hàng?";

    if (!window.confirm(confirmMessage)) {
      return; // User click Cancel
    }

    setUpdatingOrderId(orderId);

    try {
      const response = await fetch(
        `http://localhost:1337/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            [statusType]: statusValue,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi cập nhật trạng thái đơn hàng");
      }

      const updatedOrder = await response.json();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder.order } : order
        )
      );

      addToast("Cập nhật trạng thái thành công!", "success");
    } catch (err) {
      console.error("Lỗi update status:", err);
      addToast(err.message || "Lỗi khi cập nhật trạng thái", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const truncateOrderId = (orderId) => {
    if (orderId.length <= 10) return orderId;
    return orderId.substring(0, 10) + "...";
  };

  const truncateEmail = (email) => {
    if (!email) return "N/A";
    if (email.length <= 20) return email;
    return email.substring(0, 20) + "...";
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="admin-orders-container">
        <Message variant="error">{error}</Message>
        <div className="error-actions">
          <Link to="/" className="btn-back-home">
            Về Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders-container">
      <AdminMenu />

      <div className="admin-orders-header">
        <h1 className="admin-orders-title">📦 Quản Lý Đơn Hàng</h1>
        <p className="admin-orders-subtitle">
          Xem và quản lý tất cả đơn hàng trong hệ thống
        </p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Tìm theo Mã Đơn Hàng hoặc Email Khách Hàng..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="btn-clear-search"
          >
            ✖ Xóa
          </button>
        )}
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => {
            setFilterStatus("all");
            setCurrentPage(1); // Reset về trang 1
          }}
        >
          Tất Cả ({orders.length})
        </button>
        <button
          className={`filter-tab ${filterStatus === "paid" ? "active" : ""}`}
          onClick={() => {
            setFilterStatus("paid");
            setCurrentPage(1);
          }}
        >
          Đã Thanh Toán ({orders.filter((o) => o.isPaid).length})
        </button>
        <button
          className={`filter-tab ${filterStatus === "unpaid" ? "active" : ""}`}
          onClick={() => {
            setFilterStatus("unpaid");
            setCurrentPage(1);
          }}
        >
          Chưa Thanh Toán ({orders.filter((o) => !o.isPaid).length})
        </button>
        <button
          className={`filter-tab ${
            filterStatus === "delivered" ? "active" : ""
          }`}
          onClick={() => {
            setFilterStatus("delivered");
            setCurrentPage(1);
          }}
        >
          Đã Giao ({orders.filter((o) => o.isDelivered).length})
        </button>
        <button
          className={`filter-tab ${filterStatus === "pending" ? "active" : ""}`}
          onClick={() => {
            setFilterStatus("pending");
            setCurrentPage(1);
          }}
        >
          Đang Giao ({orders.filter((o) => !o.isDelivered).length})
        </button>
      </div>

      {currentOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h2 className="empty-title">Không Tìm Thấy Đơn Hàng Nào</h2>
          <p className="empty-message">
            {searchQuery
              ? `Không tìm thấy đơn hàng với từ khóa "${searchQuery}"`
              : "Chưa có đơn hàng nào trong hệ thống"}
          </p>
        </div>
      ) : (
        <>
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Mã Đơn</th>
                  <th>Khách Hàng</th>
                  <th>Ngày Đặt</th>
                  <th>Tổng Tiền</th>
                  <th>Thanh Toán</th>
                  <th>Giao Hàng</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      {order.orderItems && order.orderItems.length > 0 ? (
                        <img
                          src={`http://localhost:1337${order.orderItems[0].image}`}
                          alt={order.orderItems[0].name}
                          className="order-image"
                        />
                      ) : (
                        <div className="no-image">Không có ảnh</div>
                      )}
                    </td>

                    <td className="order-id">#{truncateOrderId(order.id)}</td>

                    <td>{truncateEmail(order.user?.email)}</td>

                    <td>{formatDate(order.createdAt)}</td>

                    <td className="order-total">
                      {order.totalPrice.toLocaleString()} đ
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          order.isPaid ? "status-paid" : "status-unpaid"
                        }`}
                      >
                        {order.isPaid
                          ? "✓ Đã Thanh Toán"
                          : "⏳ Chưa Thanh Toán"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          order.isDelivered
                            ? "status-delivered"
                            : "status-pending"
                        }`}
                      >
                        {order.isDelivered ? "✓ Đã Giao" : "📦 Đang Giao"}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <Link
                          to={`/orders/${order.id}`}
                          className="btn-view-detail"
                        >
                          👁 Xem
                        </Link>

                        {!order.isPaid && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, "isPaid", true)
                            }
                            disabled={updatingOrderId === order.id}
                            className="btn-mark-paid"
                          >
                            {updatingOrderId === order.id
                              ? "⏳ Đang cập nhật..."
                              : "💰 Đã TT"}
                          </button>
                        )}

                        {!order.isDelivered && order.isPaid && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, "isDelivered", true)
                            }
                            disabled={updatingOrderId === order.id}
                            className="btn-mark-delivered"
                          >
                            {updatingOrderId === order.id
                              ? "⏳ Đang cập nhật..."
                              : "🚚 Đã Giao"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="btn-page"
              >
                ← Trước
              </button>

              <span className="page-info">
                Trang {currentPage} / {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="btn-page"
              >
                Sau →
              </button>
            </div>
          )}

          <div className="orders-footer">
            <p className="orders-count">
              Hiển thị {startIndex + 1} - {Math.min(endIndex, totalOrders)}{" "}
              trong tổng số {totalOrders} đơn hàng
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminOrderManagement;
