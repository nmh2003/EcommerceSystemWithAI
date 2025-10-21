import { useState, useEffect } from "react";

import { useParams, useNavigate, Link } from "react-router-dom";

import "./ProductDetails.css";

import { useCart } from "../context/CartContext";

function ProductDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {

    async function fetchProduct() {
      try {

        setLoading(true);

        const response = await fetch(
          `http://localhost:1337/api/products/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();

        setProduct(data);

        setLoading(false);
      } catch (err) {

        console.error("Error fetching product:", err);
        setError(err.message || "Đã xảy ra lỗi!");
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]); // Dependency: [id] = chạy lại khi id thay đổi

  function handleQuantityChange(event) {

    const value = event.target.value;

    setQuantity(parseInt(value, 10));
  }

  function handleAddToCart() {

    addToCart(product, quantity);

    navigate("/cart");
  }

  function generateQuantityOptions(maxStock) {

    return [...Array(maxStock).keys()].map((x) => x + 1);
  }

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-error">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Ối! Có lỗi xảy ra</h2>
        <p className="error-message">{error}</p>
        <Link to="/" className="error-back">
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-error">
        <div className="error-icon">📦</div>
        <h2 className="error-title">Không tìm thấy sản phẩm</h2>
        <p className="error-message">Sản phẩm bạn tìm kiếm không tồn tại.</p>
        <Link to="/" className="error-back">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="product-details-page">

      <div className="go-back-container">
        <Link to="/" className="go-back-link">
          ← Quay lại
        </Link>
      </div>

      <div className="product-details-container">

        <div className="product-details-layout">

          <div className="product-image-section">

            <img
              src={product.image || "https://via.placeholder.com/500"}
              alt={product.name}
              className="product-image-large"
            />
          </div>

          <div className="product-info-section">

            <h1 className="product-name">{product.name}</h1>

            <p className="product-price">
              {product.price
                ? product.price.toLocaleString("vi-VN") + " đ"
                : "0 đ"}
            </p>

            <p className="product-description">
              {product.description || "No description available."}
            </p>

            <div className="product-details-grid">

              <div className="detail-item">
                <span className="detail-label">🏪 Thương hiệu:</span>
                <span className="detail-value">{product.brand || "N/A"}</span>
              </div>

              <div className="detail-item">
                <span className="detail-label">📂 Danh mục:</span>
                <span className="detail-value">
                  {product.category?.name || "N/A"}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">📦 Tồn kho:</span>
                <span className="detail-value">
                  {product.countInStock || 0}
                </span>
              </div>

            </div>

            <div className="cart-actions">

              {product.countInStock > 0 ? (
                <div className="quantity-selector">
                  <label htmlFor="quantity" className="quantity-label">
                    Số lượng:
                  </label>
                  <select
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="quantity-select"
                  >

                    {generateQuantityOptions(product.countInStock).map(
                      (num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      )
                    )}
                  </select>
                </div>
              ) : (

                <p className="out-of-stock">Hết hàng</p>
              )}

              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
              >
                {product.countInStock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
