import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../../utils/api";
import { PAGINATION } from "../../utils/constants";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import AdminMenu from "./AdminMenu";
import "./ProductManagement.css";

function ProductManagement() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts({ limit: 1000 }); // Lấy tối đa 1000 sản phẩm cho admin
      setProducts(data.products || data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="error">{error}</Message>;
  }

  return (
    <div style={{ margin: "0 9rem" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "12px" }}>
          <div
            style={{
              marginLeft: "2rem",
              fontSize: "1.25rem",
              fontWeight: "bold",
              height: "3rem",
            }}
          >
            Tất cả sản phẩm ({products.length})
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "1rem",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="admin-product-card"
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  overflow: "hidden",
                  cursor: "pointer",
                  width: "calc(50% - 0.5rem)",
                  minWidth: "400px",
                }}
                onClick={() =>
                  (window.location.href = `/admin/products/update/${product.id}`)
                }
              >
                <div style={{ display: "flex" }}>
                  <img
                    src={product.image || "https://via.placeholder.com/160"}
                    alt={product.name}
                    style={{ width: "10rem", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-around",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <h5
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {product.name}
                      </h5>
                      <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                        {new Date(product.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                    </div>

                    <p
                      style={{
                        color: "#9ca3af",
                        width: "30rem",
                        fontSize: "0.875rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {product.description?.substring(0, 160)}...
                    </p>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Link
                        to={`/admin/products/update/${product.id}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "0.5rem 0.75rem",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          textAlign: "center",
                          color: "white",
                          backgroundColor: "#be185d",
                          borderRadius: "0.5rem",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#9d174d")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "#be185d")
                        }
                      >
                        Cập nhật sản phẩm
                        <svg
                          style={{
                            width: "0.875rem",
                            height: "0.875rem",
                            marginLeft: "0.5rem",
                          }}
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 14 10"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M1 5h12m0 0L9 1m4 4L9 9"
                          />
                        </svg>
                      </Link>
                      <p>{formatPrice(product.price)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: "25%", padding: "12px", marginTop: "0.5rem" }}>
          <AdminMenu />
        </div>
      </div>
    </div>
  );
}

export default ProductManagement;
