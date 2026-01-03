import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import Message from "../../components/Message";

import Loader from "../../components/Loader";

import { getUser } from "../../utils/localStorage";

import "./UserOrderClone.css";

const UserOrderClone = function () {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(
    function () {
      const fetchOrders = async function () {
        try {
          setLoading(true);
          setError(null);

          const userInfo = getUser();

          if (!userInfo) {
            throw new Error("Chưa xác thực. Vui lòng đăng nhập.");
          }

          const response = await fetch(
            "http://localhost:1337/api/orders/mine",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Gửi cookie JWT tự động
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "Không thể tải danh sách đơn hàng"
            );
          }

          const data = await response.json();
          setOrders(data.orders); // Extract orders array from { orders: [...], total: N }
        } catch (err) {
          console.error("Error fetching orders:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrders();
    },
    [] // Empty dependencies → Chỉ chạy 1 lần khi mount
  );

  return (
    <div className="user-orders-container">

      <h2 className="page-title">Đơn Hàng Của Tôi</h2>

      {loading && (
        <div className="loading-container">
          <Loader />
        </div>
      )}

      {error && !loading && <Message variant="error">{error}</Message>}

      {!loading && !error && (
        <>
          {orders.length === 0 ? (

            <p className="no-orders">
              Bạn chưa có đơn hàng nào.{" "}
              <Link to="/shop" className="shop-link">
                Bắt đầu mua sắm
              </Link>
            </p>
          ) : (

            <table className="orders-table">

              <thead>
                <tr>
                  <th className="table-header">HÌNH ẢNH</th>
                  <th className="table-header">MÃ ĐƠN HÀNG</th>
                  <th className="table-header">NGÀY ĐẶT</th>
                  <th className="table-header">TỔNG TIỀN</th>
                  <th className="table-header">THANH TOÁN</th>
                  <th className="table-header">GIAO HÀNG</th>
                  <th className="table-header"></th>
                </tr>
              </thead>

              <tbody>
                {orders.map(function (order) {
                  return (
                    <tr key={order.id} className="table-row">

                      <td className="table-cell">
                        <img
                          src={order.orderItems[0].image}
                          alt={order.orderItems[0].name}
                          className="order-image"
                        />
                      </td>

                      <td className="table-cell">
                        {order.id.substring(0, 10)}...
                      </td>

                      <td className="table-cell">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </td>

                      <td className="table-cell">
                        {order.totalPrice.toLocaleString("vi-VN")} VND
                      </td>

                      <td className="table-cell">
                        {order.isPaid ? (
                          <span className="status-badge status-completed">
                            Hoàn thành
                          </span>
                        ) : (
                          <span className="status-badge status-pending">
                            Chờ xử lý
                          </span>
                        )}
                      </td>

                      <td className="table-cell">
                        {order.isDelivered ? (
                          <span className="status-badge status-completed">
                            Hoàn thành
                          </span>
                        ) : (
                          <span className="status-badge status-pending">
                            Chờ xử lý
                          </span>
                        )}
                      </td>

                      <td className="table-cell">
                        <Link to={`/order/${order.id}`}>
                          <button className="view-details-button">
                            Xem chi tiết
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default UserOrderClone;
