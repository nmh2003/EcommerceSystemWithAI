import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Product from "../components/Product";
import Loader from "../components/Loader";
import Message from "../components/Message";

import Header from "../components/Header";

import "./Home.css";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:1337/api/products?limit=1000"
        );

        if (!response.ok) {
          throw new Error("Không thể tải danh sách sản phẩm");
        }

        const data = await response.json();

        setProducts(data.products || data);
      } catch (err) {
        console.error("Fetch products error:", err);
        setError(err.message || "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="home-loading">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <Message variant="error">{error}</Message>
      </div>
    );
  }

  return (
    <div className="home-page">
      <Header />
      <div className="home-header">
        <h1 className="home-title">Sản phẩm nổi bật</h1>
        <Link to="/shop" className="shop-button">
          Cửa hàng
        </Link>
      </div>

      <div className="products-container">
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="product-item">
                <Product product={product} />
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h2>Không tìm thấy sản phẩm nào</h2>
              <p>Hãy quay lại sau để xem sản phẩm mới!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
