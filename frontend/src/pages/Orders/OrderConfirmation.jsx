import { useState, useEffect } from "react";

import { useParams, useNavigate, Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import Loader from "../../components/Loader";

import Message from "../../components/Message";

import "./OrderConfirmation.css";

const OrderConfirmation = () => {

  const { id: orderId } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {

    if (!orderId || !user || !user.token) {

      setError("Vui lòng đăng nhập để xem đơn hàng!");
      navigate("/login");
      return; // Dừng execution
    }

    const fetchOrderDetails = async () => {
      try {

        setLoading(true);
        setError(null); // Clear error cũ

        const response = await fetch(
          `http://localhost:1337/api/orders/${orderId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`, // JWT token
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Không thể lấy thông tin đơn hàng!"
          );
        }

        const data = await response.json();

        setOrder(data);
      } catch (err) {

        console.error("Error fetching order:", err);
        setError(err.message);
      } finally {

        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, user, navigate]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="order-confirmation-container">
        <Message variant="error">{error}</Message>
        <div className="error-actions">
          <Link to="/shop" className="btn-back-shop">
            ← Quay Lại Trang Chủ
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-confirmation-container">
        <Message variant="warning">Không tìm thấy đơn hàng!</Message>
      </div>
    );
  }

  return (
    <div className="order-confirmation-container">

      <div className="confirmation-header">

        <div className="success-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h1 className="confirmation-title">🎉 Đặt Hàng Thành Công!</h1>

        <p className="confirmation-subtitle">
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay lập
          tức.
        </p>

        <div className="order-id-display">
          <span className="order-id-label">Mã đơn hàng:</span>
          <span className="order-id-value">#{order.id}</span>
        </div>
      </div>

      <div className="order-summary-section">
        <h2 className="section-title">📦 Chi Tiết Đơn Hàng</h2>

        <div className="items-section">
          <h3 className="subsection-title">Sản phẩm đã đặt:</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>SL</th>
                <th>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item, index) => (
                <tr key={index}>
                  <td>
                    <img
                      src={item.image || "/placeholder.png"}
                      alt={item.name}
                      className="item-image"
                    />
                  </td>
                  <td>

                    <Link
                      to={`/products/${item.product}`}
                      className="item-name-link"
                    >
                      {item.name}
                    </Link>
                  </td>
                  <td>{item.price.toLocaleString()} VND</td>
                  <td className="text-center">{item.qty}</td>
                  <td className="item-total">
                    {(item.price * item.qty).toLocaleString()} VND
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="shipping-section">
          <h3 className="subsection-title">🚚 Địa chỉ giao hàng:</h3>
          <div className="shipping-info">
            <div className="info-row">
              <span className="info-label">Họ tên:</span>
              <span className="info-value">
                {order.shippingAddress.fullName}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Địa chỉ:</span>
              <span className="info-value">
                {order.shippingAddress.address}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Thành phố:</span>
              <span className="info-value">{order.shippingAddress.city}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Số điện thoại:</span>
              <span className="info-value">{order.shippingAddress.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mã bưu điện:</span>
              <span className="info-value">
                {order.shippingAddress.postalCode}
              </span>
            </div>
          </div>
        </div>

        <div className="payment-delivery-section">
          <div className="payment-info">
            <h3 className="subsection-title">💳 Thanh toán:</h3>
            <p className="payment-method">{order.paymentMethod}</p>
            <div className="payment-status">
              {order.isPaid ? (
                <span className="status-badge status-paid">
                  ✓ Đã thanh toán
                </span>
              ) : (
                <span className="status-badge status-unpaid">
                  ⏳ Chưa thanh toán
                </span>
              )}
            </div>
          </div>

          <div className="delivery-info">
            <h3 className="subsection-title">📦 Giao hàng:</h3>
            <div className="delivery-status">
              {order.isDelivered ? (
                <span className="status-badge status-delivered">
                  ✓ Đã giao hàng
                </span>
              ) : (
                <span className="status-badge status-pending">
                  ⏳ Đang xử lý
                </span>
              )}
            </div>
            <p className="delivery-note">
              Dự kiến giao hàng trong 3-5 ngày làm việc
            </p>
          </div>
        </div>

        <div className="totals-section">
          <div className="totals-box">
            <div className="total-row">
              <span>Tạm tính:</span>
              <span>{order.subtotal.toLocaleString()} VND</span>
            </div>
            <div className="total-row">
              <span>Phí vận chuyển:</span>
              <span>
                {order.shippingFee === 0 ? (
                  <span className="free-shipping">MIỄN PHÍ</span>
                ) : (
                  `${order.shippingFee.toLocaleString()} VND`
                )}
              </span>
            </div>
            <div className="total-row">
              <span>Thuế (VAT 10%):</span>
              <span>{order.tax.toLocaleString()} VND</span>
            </div>
            <div className="total-divider"></div>
            <div className="total-row total-final">
              <span>Tổng cộng:</span>
              <span className="total-price">
                {order.totalPrice.toLocaleString()} VND
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button
          onClick={() => navigate(`/orders/${order.id}`)}
          className="btn-view-detail"
        >
          📋 Xem Chi Tiết Đơn Hàng
        </button>
        <Link to="/shop" className="btn-continue-shopping">
          🛍️ Tiếp Tục Mua Sắm
        </Link>
      </div>

      <div className="thank-you-note">
        <p>💝 Cảm ơn bạn đã tin tưởng và mua sắm tại cửa hàng của chúng tôi!</p>
        <p>📧 Thông tin chi tiết đơn hàng đã được gửi đến email của bạn.</p>
      </div>
    </div>
  );
};

export default OrderConfirmation;
