import { Link } from "react-router-dom";

import "./Product.css";

import HeartIcon from "./HeartIcon";

const Product = ({ product }) => {

  if (!product) {
    return null; // Không render gì nếu không có product
  }

  const { id, name, price, image } = product;

  function formatPriceVN(price) {
    if (typeof price !== "number") {
      return "0 đ";
    }
    return price.toLocaleString("vi-VN") + " đ";
  }

  return (

    <div className="product-main-container">

      <div className="product-relative-container">

        <Link to={`/product/${id}`}>
          <img

            src={image || "/placeholder-product.png"}

            alt={name}

            className="product-image"

            onError={(e) => {
              e.target.src = "/placeholder-product.png";
            }}
          />
        </Link>

        <HeartIcon product={product} />
      </div>

      <div className="product-p4-container">

        <Link to={`/product/${id}`}>

          <h2 className="product-h2-flex">

            <div className="product-name-text">{name}</div>

            <span className="product-price-badge">

              {formatPriceVN(price)}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default Product;
