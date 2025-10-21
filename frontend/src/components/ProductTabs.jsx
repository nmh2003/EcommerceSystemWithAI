import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

import Ratings from "./Ratings";

import SmallProduct from "./SmallProduct";

import Loader from "./Loader";

import Message from "./Message";

import "./ProductTabs.css";

const ProductTabs = function ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
}) {

  const [activeTab, setActiveTab] = useState(1);

  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  useEffect(
    function () {
      const fetchRelatedProducts = async function () {
        try {
          setLoading(true);
          setError(null);

          const response = await fetch(
            "http://localhost:1337/api/products/top"
          );

          if (!response.ok) {
            throw new Error("Failed to fetch related products");
          }

          const data = await response.json();
          setRelatedProducts(data);
        } catch (err) {
          console.error("Error fetching related products:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchRelatedProducts();
    },
    [] // Empty dependencies → Chỉ chạy 1 lần khi mount
  );

  const handleTabClick = function (tabNumber) {
    setActiveTab(tabNumber);
  };

  return (
    <div className="product-tabs-container">

      <section className="tabs-navigation">

        <div
          className={`tab-button ${activeTab === 1 ? "active" : ""}`}
          onClick={function () {
            handleTabClick(1);
          }}
        >
          Write Your Review
        </div>

        <div
          className={`tab-button ${activeTab === 2 ? "active" : ""}`}
          onClick={function () {
            handleTabClick(2);
          }}
        >
          All Reviews
        </div>

        <div
          className={`tab-button ${activeTab === 3 ? "active" : ""}`}
          onClick={function () {
            handleTabClick(3);
          }}
        >
          Related Products
        </div>
      </section>

      {activeTab === 1 && (
        <section className="tab-content">
          <div className="review-form-container">
            {userInfo ? (

              <form onSubmit={submitHandler} className="review-form">

                <div className="form-group">
                  <label htmlFor="rating" className="form-label">
                    Rating
                  </label>

                  <select
                    id="rating"
                    required
                    value={rating}
                    onChange={function (e) {
                      setRating(e.target.value);
                    }}
                    className="form-select"
                  >
                    <option value="">Chọn</option>
                    <option value="1">Kém</option>
                    <option value="2">Trung bình</option>
                    <option value="3">Tốt</option>
                    <option value="4">Xuất sắc</option>
                    <option value="5">Hoàn hảo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="comment" className="form-label">
                    Comment
                  </label>

                  <textarea
                    id="comment"
                    rows="3"
                    required
                    value={comment}
                    onChange={function (e) {
                      setComment(e.target.value);
                    }}
                    className="form-textarea"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loadingProductReview}
                  className="submit-button"
                >
                  {loadingProductReview ? "Submitting..." : "Submit"}
                </button>
              </form>
            ) : (

              <p className="login-prompt">
                Please <Link to="/login">sign in</Link> to write a review
              </p>
            )}
          </div>
        </section>
      )}

      {activeTab === 2 && (
        <section className="tab-content">

          {product.reviews.length === 0 && (
            <p className="no-reviews">No Reviews</p>
          )}

          <div className="reviews-list">
            {product.reviews.map(function (review) {
              return (
                <div key={review.id} className="review-card">

                  <div className="review-header">
                    <strong className="review-author">{review.name}</strong>
                    <p className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="review-comment">{review.comment}</p>

                  <Ratings value={review.rating} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === 3 && (
        <section className="tab-content">

          {loading && (
            <div className="related-products-loading">
              <Loader />
            </div>
          )}

          {error && !loading && <Message variant="error">{error}</Message>}

          {!loading && !error && (
            <div className="related-products-grid">
              {relatedProducts.length === 0 ? (
                <p className="no-products">No related products found</p>
              ) : (
                relatedProducts.map(function (product) {
                  return (
                    <div key={product.id}>
                      <SmallProduct product={product} />
                    </div>
                  );
                })
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default ProductTabs;
