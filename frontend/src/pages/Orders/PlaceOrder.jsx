import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import "./PlaceOrder.css";

function PlaceOrder() {

  const { user } = useAuth();

  const { cartItems, clearCart } = useCart();

  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(null);

  const [paymentMethod] = useState("COD");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const [orderTotals, setOrderTotals] = useState({
    subtotal: 0,
    shippingFee: 0,
    tax: 0,
    total: 0,
  });

  useEffect(() => {

    const validCartItems = cartItems.filter((item) => item.product);
    if (cartItems.length === 0 || validCartItems.length === 0) {
      console.log(
        "⚠️ Cart is empty or has no valid items, redirecting to /cart"
      );
      navigate("/cart");
      return;
    }

    const savedShipping = localStorage.getItem("shippingAddress");
    if (!savedShipping) {
      console.log("⚠️ No shipping address, redirecting to /shipping");
      navigate("/shipping");
      return;
    }

    try {
      const parsedShipping = JSON.parse(savedShipping);
      setShippingAddress(parsedShipping);
      console.log("✅ Loaded shipping address:", parsedShipping);
    } catch (err) {
      console.error("❌ Error parsing shipping address:", err);
      navigate("/shipping");
    }
  }, [cartItems, navigate]);

  useEffect(() => {
    if (cartItems.length > 0) {
      console.log("🛒 Cart items in PlaceOrder:", cartItems);

      const validCartItems = cartItems.filter((item) => item.product);
      const subtotal = validCartItems.reduce((acc, item) => {
        return acc + (item.product?.price || 0) * item.qty;
      }, 0); // Initial value = 0

      const shippingFee = subtotal >= 500000 ? 0 : 30000;

      const tax = subtotal * 0.1;

      const total = subtotal + shippingFee + tax;

      setOrderTotals({
        subtotal,
        shippingFee,
        tax,
        total,
      });

      console.log("💰 Order Totals Calculated:", {
        subtotal: subtotal.toLocaleString("vi-VN") + " VND",
        shippingFee: shippingFee.toLocaleString("vi-VN") + " VND",
        tax: tax.toLocaleString("vi-VN") + " VND",
        total: total.toLocaleString("vi-VN") + " VND",
      });
    }
  }, [cartItems]);

  const handlePlaceOrder = async () => {

    if (!shippingAddress) {
      setError("Vui lòng nhập thông tin giao hàng!");
      navigate("/shipping");
      return;
    }

    try {

      setLoading(true);
      setError(null);

      console.log("📦 Creating order...");

      const orderData = {

        orderItems: cartItems
          .filter((item) => item.product) // Only include valid items
          .map((item) => ({
            product: item.product?.id || "", // Product ID (reference to Product model)
            name: item.product?.name || "", // Product name (snapshot)
            price: item.product?.price || 0, // Product price (snapshot)
            qty: item.qty, // Quantity ordered (backend expects 'qty')
            image: item.product?.image || "/images/SampleProduct.jpeg", // Product image URL (snapshot)
          })),

        shippingAddress: shippingAddress,

        paymentMethod: paymentMethod, // "COD" default

        subtotal: orderTotals.subtotal,
        shippingFee: orderTotals.shippingFee,
        tax: orderTotals.tax,
        totalPrice: orderTotals.total,
      };

      console.log("📤 Sending order data:", orderData);

      const response = await fetch("http://localhost:1337/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`, // JWT token
        },
        body: JSON.stringify(orderData),
      });

      console.log("📥 Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Đặt hàng thất bại! Vui lòng thử lại."
        );
      }

      const newOrder = await response.json();
      console.log("✅ Order created successfully:", newOrder);

      clearCart();
      console.log("🗑️ Cart cleared");

      localStorage.removeItem("shippingAddress");
      localStorage.removeItem("cartItems");
      console.log("🗑️ localStorage cleared");

      navigate(`/order/${newOrder.id}`);
    } catch (err) {

      console.error("❌ Error creating order:", err);
      setError(err.message || "Đặt hàng thất bại! Vui lòng thử lại.");
    } finally {

      setLoading(false);
    }
  };

  const handleBackToShipping = () => {
    navigate("/shipping");
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  if (!shippingAddress) {
    return (
      <div className="place-order-loading">
        <Loader size="large" message="Đang tải thông tin..." />
      </div>
    );
  }

  const validCartItems = cartItems.filter((item) => item.product);
  if (validCartItems.length === 0) {
    console.warn("⚠️ No valid cart items found, redirecting to cart");
    navigate("/cart");
    return null;
  }

  return (
    <div className="place-order-container">

      <div className="place-order-header">
        <h1 className="place-order-title">📋 Xác Nhận Đơn Hàng</h1>
        <p className="place-order-subtitle">
          Vui lòng kiểm tra kỹ thông tin trước khi đặt hàng
        </p>
      </div>

      <div className="progress-steps">
        <div className="step completed">
          <div className="step-number">✓</div>
          <div className="step-label">Giỏ Hàng</div>
        </div>
        <div className="step-line"></div>
        <div className="step completed">
          <div className="step-number">✓</div>
          <div className="step-label">Giao Hàng</div>
        </div>
        <div className="step-line"></div>
        <div className="step active">
          <div className="step-number">3</div>
          <div className="step-label">Xác Nhận</div>
        </div>
      </div>

      {error && (
        <Message variant="error" onClose={() => setError(null)}>
          {error}
        </Message>
      )}

      <div className="place-order-content">

        <div className="order-details">

          <div className="order-section">
            <h2 className="section-title">
              🛒 Sản Phẩm (
              {cartItems
                .filter((item) => item.product)
                .reduce((total, item) => total + item.qty, 0)}{" "}
              món)
            </h2>

            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Hình Ảnh</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Đơn Giá</th>
                    <th>Số Lượng</th>
                    <th>Thành Tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems
                    .filter((item) => item.product) // Only show items with valid product data
                    .map((item) => (
                      <tr key={item.product.id}>

                        <td>
                          <img
                            src={
                              item.product?.image ||
                              "/images/SampleProduct.jpeg"
                            }
                            alt={item.product?.name || "Product"}
                            className="item-image"
                            onError={(e) => {
                              e.target.src = "/images/SampleProduct.jpeg";
                            }}
                          />
                        </td>

                        <td>
                          <Link
                            to={`/product/${item.product?.id || ""}`}
                            className="item-name-link"
                          >
                            {item.product?.name || "Unknown Product"}
                          </Link>
                        </td>

                        <td className="item-price">
                          {(item.product?.price || 0).toLocaleString("vi-VN")} đ
                        </td>

                        <td className="item-quantity">x {item.qty}</td>

                        <td className="item-total">
                          {(
                            (item.product?.price || 0) * item.qty
                          ).toLocaleString("vi-VN")}{" "}
                          đ
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleBackToCart}
              className="edit-link"
            >
              ✏️ Sửa giỏ hàng
            </button>
          </div>

          <div className="order-section">
            <h2 className="section-title">📍 Thông Tin Giao Hàng</h2>

            <div className="shipping-info">
              <div className="info-row">
                <span className="info-label">Họ và Tên:</span>
                <span className="info-value">{shippingAddress.fullName}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Địa Chỉ:</span>
                <span className="info-value">{shippingAddress.address}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Thành Phố:</span>
                <span className="info-value">{shippingAddress.city}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Số Điện Thoại:</span>
                <span className="info-value">{shippingAddress.phone}</span>
              </div>
              {shippingAddress.postalCode && (
                <div className="info-row">
                  <span className="info-label">Mã Bưu Điện:</span>
                  <span className="info-value">
                    {shippingAddress.postalCode}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleBackToShipping}
              className="edit-link"
            >
              ✏️ Sửa địa chỉ giao hàng
            </button>
          </div>

          <div className="order-section">
            <h2 className="section-title">💳 Phương Thức Thanh Toán</h2>

            <div className="payment-info">
              <div className="payment-method">
                <span className="payment-icon">💵</span>
                <div className="payment-details">
                  <p className="payment-name">{paymentMethod}</p>
                  <p className="payment-desc">Thanh toán khi nhận hàng</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-summary">
          <div className="summary-box">
            <h2 className="summary-title">💰 Tóm Tắt Đơn Hàng</h2>

            <div className="summary-content">

              <div className="summary-row">
                <span className="summary-label">Tạm tính:</span>
                <span className="summary-value">
                  {orderTotals.subtotal.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Phí vận chuyển:</span>
                <span className="summary-value">
                  {orderTotals.shippingFee === 0 ? (
                    <span className="free-shipping">FREE SHIP 🎉</span>
                  ) : (
                    `${orderTotals.shippingFee.toLocaleString("vi-VN")} đ`
                  )}
                </span>
              </div>

              {orderTotals.subtotal < 500000 && (
                <div className="free-ship-note">
                  💡 Mua thêm{" "}
                  {(500000 - orderTotals.subtotal).toLocaleString("vi-VN")} đ để
                  được FREE SHIP!
                </div>
              )}

              <div className="summary-row">
                <span className="summary-label">Thuế VAT (10%):</span>
                <span className="summary-value">
                  {orderTotals.tax.toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value total-price">
                  {orderTotals.total.toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-place-order"
            >
              {loading ? (
                <span>Đang đặt hàng ...</span>
              ) : (
                <span>🚀 Đặt Hàng</span>
              )}
            </button>

            <div className="order-notes">
              <p>📌 Lưu ý:</p>
              <ul>
                <li>Kiểm tra kỹ thông tin trước khi đặt hàng</li>
                <li>Đơn hàng không thể hủy sau khi đặt</li>
                <li>Thời gian giao hàng: 3-5 ngày</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaceOrder;
