import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const OrderList = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {

    if (!user || user.role !== "admin") {
      setError(
        "Không có quyền truy cập. Chỉ admin mới xem được danh sách orders."
      );
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("http://localhost:1337/api/orders", {
          credentials: "include", // Gửi cookie JWT
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          } else if (response.status === 403) {
            throw new Error("Không có quyền truy cập. Chỉ admin mới xem được.");
          } else {
            throw new Error(`Lỗi server: ${response.status}`);
          }
        }

        const data = await response.json();

        console.log("📋 OrderList API response:", data);

        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (data.data && Array.isArray(data.data)) {
          setOrders(data.data);
        } else {
          console.warn("⚠️ API không trả về array orders:", data);
          setOrders([]); // Fallback: set empty array
        }
      } catch (err) {
        console.error("❌ Lỗi khi fetch orders:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="danger">{error}</Message>;
  }

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
          marginTop: "20px",
        }}
      >

        <thead>
          <tr
            style={{
              borderBottom: "2px solid #ddd",
              marginBottom: "3rem",
            }}
          >
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                fontWeight: "bold",
              }}
            >
              ITEMS
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                fontWeight: "bold",
              }}
            >
              ID
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                fontWeight: "bold",
              }}
            >
              USER
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                fontWeight: "bold",
              }}
            >
              DATE
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                fontWeight: "bold",
              }}
            >
              TOTAL
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                fontWeight: "bold",
              }}
            >
              PAID
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                fontWeight: "bold",
              }}
            >
              DELIVERED
            </th>
            <th
              style={{
                textAlign: "left",
                padding: "8px",
                fontWeight: "bold",
              }}
            ></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              style={{
                borderBottom: "1px solid #ddd",
              }}
            >
              <td style={{ padding: "8px" }}>
                {order.orderItems && order.orderItems.length > 0 ? (
                  <img
                    src={
                      order.orderItems[0].image || "/images/SampleProduct.jpeg"
                    }
                    alt={order.id}
                    style={{
                      width: "80px",
                      paddingTop: "16px",
                    }}
                    onError={(e) => {
                      e.target.src = "/images/SampleProduct.jpeg";
                    }}
                  />
                ) : (
                  <span>Không có sản phẩm</span>
                )}
              </td>

              <td style={{ padding: "8px" }}>{order.id}</td>

              <td style={{ padding: "8px" }}>
                {order.user ? order.user.email : "N/A"}
              </td>

              <td style={{ padding: "8px" }}>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                  : "N/A"}
              </td>

              <td style={{ padding: "8px" }}>
                {order.totalPrice
                  ? `${order.totalPrice.toLocaleString("vi-VN")} đ`
                  : "0 đ"}
              </td>

              <td style={{ padding: "8px" }}>
                {order.isPaid ? (
                  <span
                    style={{
                      padding: "4px 8px",
                      textAlign: "center",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      borderRadius: "20px",
                      display: "inline-block",
                      width: "100px",
                    }}
                  >
                    Completed
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "4px 8px",
                      textAlign: "center",
                      backgroundColor: "#f44336",
                      color: "white",
                      borderRadius: "20px",
                      display: "inline-block",
                      width: "100px",
                    }}
                  >
                    Pending
                  </span>
                )}
              </td>

              <td style={{ padding: "8px" }}>
                {order.isDelivered ? (
                  <span
                    style={{
                      padding: "4px 8px",
                      textAlign: "center",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      borderRadius: "20px",
                      display: "inline-block",
                      width: "100px",
                    }}
                  >
                    Completed
                  </span>
                ) : (
                  <span
                    style={{
                      padding: "4px 8px",
                      textAlign: "center",
                      backgroundColor: "#f44336",
                      color: "white",
                      borderRadius: "20px",
                      display: "inline-block",
                      width: "100px",
                    }}
                  >
                    Pending
                  </span>
                )}
              </td>

              <td style={{ padding: "8px" }}>
                <Link to={`/orders/${order.id}`}>
                  <button
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    More
                  </button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <p
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#666",
          }}
        >
          Chưa có đơn hàng nào
        </p>
      )}
    </div>
  );
};

export default OrderList;
