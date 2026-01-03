import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import Message from "../../components/Message";
import "./Shipping.css";

function Shipping() {

  const navigate = useNavigate();

  const { cartItems, getCartItemCount } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    phone: "",
    postalCode: "",
  });

  const [errors, setErrors] = useState({});

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {

    if (cartItems.length === 0) {
      navigate("/cart");
      return;
    }

    const savedShipping = localStorage.getItem("shippingAddress");

    if (savedShipping) {
      try {
        const parsed = JSON.parse(savedShipping);
        setFormData(parsed);
      } catch (err) {
        console.error("Error parsing shipping address:", err);
      }
    }
  }, [cartItems.length, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value, // ES6 computed property name
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Vui lòng nhập địa chỉ";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Địa chỉ phải có ít nhất 5 ký tự";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Vui lòng nhập thành phố";
    } else if (formData.city.trim().length < 2) {
      newErrors.city = "Tên thành phố phải có ít nhất 2 ký tự";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else {

      const phoneDigits = formData.phone.replace(/\s/g, "");
      if (!/^0\d{9,10}$/.test(phoneDigits)) {
        newErrors.phone =
          "Số điện thoại không hợp lệ (phải có 10-11 số, bắt đầu bằng 0)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const shippingData = {
        fullName: formData.fullName.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        postalCode: formData.postalCode.trim(),
      };

      localStorage.setItem("shippingAddress", JSON.stringify(shippingData));

      navigate("/place-order");
    } catch (err) {
      console.error("Error submitting shipping form:", err);
      setErrors({ submit: "Đã xảy ra lỗi, vui lòng thử lại!" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackToCart = () => {
    navigate("/cart");
  };

  return (
    <div className="shipping-container">

      <div className="shipping-header">
        <h1 className="shipping-title">📦 Thông Tin Giao Hàng</h1>
        <p className="shipping-subtitle">
          Vui lòng nhập địa chỉ để chúng tôi giao hàng cho bạn
        </p>
      </div>

      <div className="progress-steps">
        <div className="step completed">
          <span className="step-number">✓</span>
          <span className="step-label">Giỏ Hàng</span>
        </div>
        <div className="step-line"></div>
        <div className="step active">
          <span className="step-number">2</span>
          <span className="step-label">Giao Hàng</span>
        </div>
        <div className="step-line"></div>
        <div className="step">
          <span className="step-number">3</span>
          <span className="step-label">Xác Nhận</span>
        </div>
      </div>

      {errors.submit && (
        <Message
          variant="error"
          onClose={() => setErrors({ ...errors, submit: "" })}
        >
          {errors.submit}
        </Message>
      )}

      <div className="shipping-form-wrapper">
        <form className="shipping-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="fullName" className="form-label required">
              👤 Họ và Tên Người Nhận
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className={`form-input ${errors.fullName ? "error" : ""}`}
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <span className="error-message">{errors.fullName}</span>
            )}
            <span className="input-hint">
              Họ và tên người nhận hàng (ít nhất 2 ký tự)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label required">
              📍 Địa Chỉ Nhà
            </label>
            <input
              type="text"
              id="address"
              name="address"
              className={`form-input ${errors.address ? "error" : ""}`}
              placeholder="123 Đường ABC, Phường XYZ"
              value={formData.address}
              onChange={handleChange}
            />
            {errors.address && (
              <span className="error-message">{errors.address}</span>
            )}
            <span className="input-hint">
              Địa chỉ cụ thể (số nhà, tên đường, phường/xã)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="city" className="form-label required">
              🏙️ Thành Phố / Tỉnh
            </label>
            <input
              type="text"
              id="city"
              name="city"
              className={`form-input ${errors.city ? "error" : ""}`}
              placeholder="Hà Nội"
              value={formData.city}
              onChange={handleChange}
            />
            {errors.city && (
              <span className="error-message">{errors.city}</span>
            )}
            <span className="input-hint">Thành phố hoặc tỉnh của bạn</span>
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label required">
              📞 Số Điện Thoại
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className={`form-input ${errors.phone ? "error" : ""}`}
              placeholder="0912345678"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && (
              <span className="error-message">{errors.phone}</span>
            )}
            <span className="input-hint">
              Số điện thoại để liên hệ (10-11 số)
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="postalCode" className="form-label">
              📮 Mã Bưu Điện
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              className="form-input"
              placeholder="100000 (Không bắt buộc)"
              value={formData.postalCode}
              onChange={handleChange}
            />
            <span className="input-hint">Mã bưu điện (không bắt buộc)</span>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-back"
              onClick={handleBackToCart}
            >
              ← Quay lại giỏ hàng
            </button>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Tiếp tục đặt hàng →"}
            </button>
          </div>
        </form>

        <div className="shipping-info-box">
          <h3 className="info-title">💡 Lưu Ý</h3>
          <ul className="info-list">
            <li>✓ Vui lòng kiểm tra kỹ thông tin trước khi tiếp tục</li>
            <li>✓ Số điện thoại phải chính xác để shipper liên hệ</li>
            <li>✓ Địa chỉ càng chi tiết càng giao hàng nhanh</li>
            <li>✓ Bạn có thể sửa thông tin trước khi xác nhận đơn hàng</li>
          </ul>

          <div className="cart-summary-mini">
            <h4>📋 Giỏ Hàng Của Bạn</h4>
            <p>
              Tổng số sản phẩm: <strong>{getCartItemCount()}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shipping;
