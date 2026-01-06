import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import "./Cart.css";

function Cart() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    cartItems,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
  } = useCart();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    productId: null,
    productName: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  const subtotal = getCartTotal();

  const shipping = subtotal >= 500000 ? 0 : 30000;

  const tax = Math.round(subtotal * 0.1);

  const total = subtotal + shipping + tax;

  const itemCount = getCartItemCount();

  const handleIncreaseQty = (productId, currentQty, stock) => {
    try {

      if (currentQty + 1 > stock) {
        setError(`Chỉ còn ${stock} sản phẩm trong kho!`);

        setTimeout(() => setError(null), 3000);
        return;
      }

      updateCartItemQty(productId, currentQty + 1);

      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecreaseQty = (productId, currentQty) => {
    try {

      if (currentQty <= 1) {
        return; // Phải dùng nút xóa
      }

      updateCartItemQty(productId, currentQty - 1);

      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveClick = (item) => {
    setDeleteModal({
      isOpen: true,
      productId: item.product.id,
      productName: item.product.name,
    });
  };

  const handleRemoveConfirm = async () => {
    try {
      setLoading(true);

      removeFromCart(deleteModal.productId);

      setDeleteModal({
        isOpen: false,
        productId: null,
        productName: "",
      });

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCancel = () => {
    setDeleteModal({
      isOpen: false,
      productId: null,
      productName: "",
    });
  };

  const handleClearCart = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    if (!user) {

      navigate("/login?redirect=/shipping");
    } else {

      navigate("/shipping");
    }
  };

  const handleContinueShopping = () => {
    navigate("/shop");
  };

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  if (loading && cartItems.length === 0) {
    return <Loader />;
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
          <button
            className="btn-continue-shopping"
            onClick={handleContinueShopping}
          >
            🛍️ Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">

      <div className="cart-header">
        <h1 className="cart-title">🛒 Giỏ Hàng Của Bạn</h1>
        <p className="cart-subtitle">
          Bạn đang có <strong>{itemCount}</strong> sản phẩm trong giỏ hàng
        </p>
      </div>

      {error && (
        <Message variant="error" onClose={() => setError(null)}>
          {error}
        </Message>
      )}

      <div className="cart-content">

        <div className="cart-items-section">

          <div className="cart-items-header">
            <h2>Danh Sách Sản Phẩm</h2>
            <button className="btn-clear-all" onClick={handleClearCart}>
              🗑️ Xóa tất cả
            </button>
          </div>

          <div className="cart-table-container">
            <table className="cart-table">
              <thead>
                <tr>
                  <th className="col-product">Sản Phẩm</th>
                  <th className="col-price">Đơn Giá</th>
                  <th className="col-quantity">Số Lượng</th>
                  <th className="col-subtotal">Tạm Tính</th>
                  <th className="col-actions">Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.product.id} className="cart-item-row">

                    <td className="cart-item-product">
                      <div className="product-info">

                        <div className="product-image-wrapper">
                          {item.product.image ? (
                            <img
                              src={`http://localhost:1337${item.product.image}`}
                              alt={item.product.name}
                              className="product-image"
                            />
                          ) : (
                            <div className="product-image-placeholder">📦</div>
                          )}
                        </div>

                        <div className="product-details">
                          <Link
                            to={`/shop/${item.product.id}`}
                            className="product-name"
                          >
                            {item.product.name}
                          </Link>
                          {item.product.brand && (
                            <div className="product-brand">
                              {item.product.brand}
                            </div>
                          )}
                          <div className="product-stock">
                            {item.product.countInStock > 0 ? (
                              <span className="stock-available">
                                ✓ Còn {item.product.countInStock} sản phẩm
                              </span>
                            ) : (
                              <span className="stock-out">Hết hàng</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="cart-item-price">
                      {formatPrice(item.product.price)}
                    </td>

                    <td className="cart-item-quantity">
                      <div className="quantity-controls">

                        <button
                          className="btn-qty btn-decrease"
                          onClick={() =>
                            handleDecreaseQty(item.product.id, item.qty)
                          }
                          disabled={item.qty <= 1}
                          title={
                            item.qty <= 1
                              ? "Số lượng tối thiểu là 1"
                              : "Giảm số lượng"
                          }
                        >
                          −
                        </button>

                        <span className="qty-display">{item.qty}</span>

                        <button
                          className="btn-qty btn-increase"
                          onClick={() =>
                            handleIncreaseQty(
                              item.product.id,
                              item.qty,
                              item.product.countInStock
                            )
                          }
                          disabled={item.qty >= item.product.countInStock}
                          title={
                            item.qty >= item.product.countInStock
                              ? "Không đủ hàng trong kho"
                              : "Tăng số lượng"
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td className="cart-item-subtotal">
                      <strong>
                        {formatPrice(item.product.price * item.qty)}
                      </strong>
                    </td>

                    <td className="cart-item-actions">
                      <button
                        className="btn-remove"
                        onClick={() => handleRemoveClick(item)}
                        title="Xóa sản phẩm"
                      >
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-continue">
            <button className="btn-continue" onClick={handleContinueShopping}>
              ← Tiếp tục mua sắm
            </button>
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="cart-summary">
            <h2 className="summary-title">📋 Thông Tin Đơn Hàng</h2>

            <div className="summary-items">

              <div className="summary-item">
                <span className="summary-label">Tạm tính:</span>
                <span className="summary-value">{formatPrice(subtotal)}</span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Phí vận chuyển:</span>
                <span className="summary-value">
                  {shipping === 0 ? (
                    <span className="free-shipping">Miễn phí ✓</span>
                  ) : (
                    formatPrice(shipping)
                  )}
                </span>
              </div>

              <div className="summary-item">
                <span className="summary-label">Thuế VAT (10%):</span>
                <span className="summary-value">{formatPrice(tax)}</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-item summary-total">
                <span className="summary-label">Tổng cộng:</span>
                <span className="summary-value total-value">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {subtotal < 500000 && (
              <div className="shipping-note">
                💡 Mua thêm {formatPrice(500000 - subtotal)} để được{" "}
                <strong>miễn phí vận chuyển</strong>!
              </div>
            )}

            <button className="btn-checkout" onClick={handleCheckout}>
              🚀 Tiến Hành Thanh Toán
            </button>

            <div className="checkout-info">
              <p>✓ Thanh toán an toàn</p>
              <p>✓ Miễn phí đổi trả trong 7 ngày</p>
              <p>✓ Hỗ trợ 24/7</p>
            </div>
          </div>
        </div>
      </div>

      {deleteModal.isOpen && (
        <div className="modal-overlay" onClick={handleRemoveCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <div className="modal-header">
              <h3>⚠️ Xác Nhận Xóa Sản Phẩm</h3>
              <button className="modal-close" onClick={handleRemoveCancel}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p>
                Bạn có chắc chắn muốn xóa sản phẩm{" "}
                <strong>"{deleteModal.productName}"</strong> khỏi giỏ hàng?
              </p>
              <p className="warning-text">Hành động này không thể hoàn tác!</p>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={handleRemoveCancel}>
                Hủy
              </button>
              <button className="btn-delete" onClick={handleRemoveConfirm}>
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
