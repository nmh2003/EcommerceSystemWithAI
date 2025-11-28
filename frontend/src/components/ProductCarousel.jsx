import { useState, useEffect } from "react";

import Message from "./Message";

import { Link } from "react-router-dom";
import Loader from "./Loader";

import "./ProductCarousel.css";

const ProductCarousel = function () {

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(
    function () {

      const fetchTopProducts = async function () {
        try {
          setLoading(true);
          setError(null);

          const response = await fetch(
            "http://localhost:1337/api/products/top"
          );

          if (!response.ok) {
            throw new Error("Failed to fetch top products");
          }

          const data = await response.json();
          setProducts(data);
        } catch (err) {
          console.error("Error fetching top products:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchTopProducts();
    },
    [] // Empty dependencies: chạy 1 lần khi mount
  );

  useEffect(
    function () {

      if (products.length === 0) return;

      const intervalId = setInterval(function () {

        setCurrentSlide(function (prevSlide) {
          return prevSlide === products.length - 1 ? 0 : prevSlide + 1;
        });
      }, 3000); // 3 giây

      return function () {
        clearInterval(intervalId);
      };
    },
    [currentSlide, products.length]

  );

  const goToPrevSlide = function () {
    setCurrentSlide(function (prevSlide) {
      return prevSlide === 0 ? products.length - 1 : prevSlide - 1;
    });
  };

  const goToNextSlide = function () {
    setCurrentSlide(function (prevSlide) {
      return prevSlide === products.length - 1 ? 0 : prevSlide + 1;
    });
  };

  const goToSlide = function (index) {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="carousel-container">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="carousel-container">
        <Message variant="error">{error}</Message>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Không hiển thị gì
  }

  return (
    <div className="carousel-container">

      <div className="carousel-wrapper">

        <div
          className="carousel-slides"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >

          {products.map(function (product) {
            return (
              <div key={product.id} className="carousel-slide">

                <Link to={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="carousel-image"
                  />
                </Link>

                <div className="carousel-details">
                  <Link to={`/product/${product.id}`}>

                    <div className="carousel-info-left">
                      <h2 className="carousel-product-name">{product.name}</h2>
                      <p className="carousel-product-price">
                        {" "}
                        {product.price.toLocaleString("vi-VN")} đ
                      </p>
                      <p className="carousel-product-description">
                        {product.description
                          ? product.description.substring(0, 170) + "..."
                          : "No description available"}
                      </p>
                    </div>
                  </Link>

                  <div className="carousel-info-right">
                    <div className="carousel-meta-item">
                      <span className="carousel-meta-icon">🏪</span>
                      <span className="carousel-meta-text">
                        Thương hiệu: {product.brand || "N/A"}
                      </span>
                    </div>

                    <div className="carousel-meta-item">
                      <span className="carousel-meta-icon">📦</span>
                      <span className="carousel-meta-text">
                        Tồn kho: {product.countInStock || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="carousel-arrow carousel-arrow-prev"
          onClick={goToPrevSlide}
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          className="carousel-arrow carousel-arrow-next"
          onClick={goToNextSlide}
          aria-label="Next slide"
        >
          ›
        </button>
      </div>

      <div className="carousel-dots">
        {products.map(function (_, index) {
          return (
            <button
              key={index}
              className={`carousel-dot ${
                index === currentSlide ? "active" : ""
              }`}
              onClick={function () {
                goToSlide(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ProductCarousel;
