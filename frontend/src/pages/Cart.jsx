import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { FaTrash } from "react-icons/fa";
import "./Cart.css";

import { useCart } from "../context/CartContext";

function Cart() {

  const { cartItems, updateCartItemQty, removeFromCart } = useCart();

  const navigate = useNavigate(); // ============================================================

  function addToCartHandler(product, qty) {

    updateCartItemQty(product.id, qty);
  }

  function removeFromCartHandler(id) {

    removeFromCart(id);
  }

  function checkoutHandler() {

    const storedUser = localStorage.getItem("my-cms-user");

    if (storedUser) {

      navigate("/shipping");
    } else {

      navigate("/login?redirect=/shipping");
    }
  }

  function calculateTotalItems() {
    return cartItems.reduce(function (total, item) {
      return total + (item.qty || 0);
    }, 0);
  }

  function calculateTotalPrice() {
    const total = cartItems.reduce(function (sum, item) {
      return sum + (item.qty || 0) * (item.product?.price || 0);
    }, 0);

    return total;
  }

  return (

    <div className="cart-container">

      {cartItems.length === 0 ? (

        <div className="cart-empty">
          Giỏ hàng của bạn trống{" "}
          <Link to="/shop" className="cart-empty-link">
            Đến cửa hàng
          </Link>
        </div>
      ) : (

        <>

          <div className="cart-items-section">

            <h1 className="cart-heading">Giỏ hàng</h1>

            {cartItems.map(function (item) {
              return (
                <div key={item.product.id} className="cart-item">

                  <div className="cart-item-image-wrapper">
                    <img
                      src={item.product?.image || "/placeholder-product.png"}
                      alt={item.product?.name}
                      className="cart-item-image"
                      onError={function (e) {
                        e.target.src = "/placeholder-product.png";
                      }}
                    />
                  </div>

                  <div className="cart-item-info">

                    <Link
                      to={`/product/${item.product?.id}`}
                      className="cart-item-name"
                    >
                      {item.product?.name}
                    </Link>

                    {item.product?.brand && (
                      <div className="cart-item-brand">
                        {item.product.brand}
                      </div>
                    )}

                    <div className="cart-item-price">
                      {item.product?.price.toLocaleString("vi-VN")} đ
                    </div>
                  </div>

                  <div className="cart-item-quantity">
                    <select
                      className="cart-item-quantity-select"
                      value={item.qty}
                      onChange={function (e) {

                        addToCartHandler(item.product, Number(e.target.value));
                      }}
                    >

                      {[...Array(10).keys()].map(function (x) {
                        return (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="cart-item-remove">
                    <button
                      className="cart-item-remove-btn"
                      onClick={function () {
                        removeFromCartHandler(item.product.id);
                      }}
                      aria-label="Remove item"
                    >

                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="cart-summary">
              <div className="cart-summary-content">

                <h2 className="cart-summary-items">
                  Sản phẩm ({calculateTotalItems()})
                </h2>

                <div className="cart-summary-total">
                  {calculateTotalPrice().toLocaleString("vi-VN")} đ
                </div>

                <button
                  className="cart-checkout-btn"
                  disabled={cartItems.length === 0}
                  onClick={checkoutHandler}
                >
                  Tiến hành thanh toán
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
