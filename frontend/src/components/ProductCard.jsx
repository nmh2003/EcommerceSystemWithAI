import { Link, useNavigate } from "react-router-dom";

import { AiOutlineShoppingCart } from "react-icons/ai";
import "./ProductCard.css";

import HeartIcon from "./HeartIcon";

import { useCart } from "../context/CartContext";

function ProductCard({ p }) {

  const navigate = useNavigate();

  const { addToCart } = useCart();

  if (!p) {
    return null;
  }

  const { id, name, price, image, brand, description } = p;

  function addToCartHandler(product, qty = 1) {

    addToCart(product, qty);

    navigate("/cart");

  }

  function formatPriceVN(price) {
    if (typeof price !== "number") {
      return "0 đ";
    }
    return price.toLocaleString("vi-VN") + " đ";
  }

  return (

    <div className="product-card-advanced">

      <section className="product-card-image-section">

        <Link to={`/product/${id}`}>

          {brand && <span className="product-brand-badge">{brand}</span>}

          <img
            className="product-card-image"
            src={image || "/placeholder-product.png"}
            alt={name}

            onError={function (e) {
              e.target.src = "/placeholder-product.png";
            }}
          />
        </Link>

        <HeartIcon product={p} />
      </section>

      <div className="product-card-content">

        <div className="product-card-header">

          <h5 className="product-card-name">{name}</h5>

          <p className="product-card-price">{formatPriceVN(price)}</p>
        </div>

        <p className="product-card-description">
          {description
            ? description.substring(0, 60) + " ..."
            : "No description"}
        </p>

        <section className="product-card-actions">

          <Link to={`/product/${id}`} className="product-card-btn-read-more">
            Xem thêm

            <svg
              className="product-card-arrow-icon"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </Link>

          <button
            className="product-card-btn-cart"
            onClick={function () {

              addToCartHandler(p, 1);
            }}

            aria-label="Add to cart"
          >

            <AiOutlineShoppingCart size={25} />
          </button>
        </section>
      </div>
    </div>
  );
}

export default ProductCard;
