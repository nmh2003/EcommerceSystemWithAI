import { Link } from "react-router-dom";

import HeartIcon from "./HeartIcon";

import "./SmallProduct.css";

const SmallProduct = function ({ product }) {

  const { id, name, price, image } = product;

  return (
    <div className="small-product-card">

      <div className="small-product-image-container">

        <Link to={`/product/${id}`}>
          <img src={image} alt={name} className="small-product-image" />
        </Link>

        <HeartIcon product={product} />
      </div>

      <div className="small-product-info">

        <Link to={`/product/${id}`} className="small-product-link">
          <div className="small-product-header">

            <div className="small-product-name">{name}</div>

            <span className="small-product-price">
              {price.toLocaleString("vi-VN")} đ
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SmallProduct;
