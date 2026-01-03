import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProgressSteps from "../../components/ProgressSteps";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import "./PlaceOrderClone.css";

import { useCart } from "../../context/CartContext";

function PlaceOrder() {
  const navigate = useNavigate();

  const { cartItems, clearCart } = useCart();

  const [cart, setCart] = useState({
    cartItems: [],
    shippingAddress: {},
    paymentMethod: "PayPal",
    itemsPrice: 0,
    shippingPrice: 0,
    taxPrice: 0,
    totalPrice: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(
    function () {
      const currentCartItems = cartItems;

      if (currentCartItems.length === 0) {
        navigate("/cart");
        return;
      }

      const savedShipping = localStorage.getItem("shippingAddress");
      let shippingAddress = {};

      if (savedShipping) {
        try {
          shippingAddress = JSON.parse(savedShipping);
        } catch (err) {
          console.error("Error parsing shipping:", err);
        }
      }

      if (!shippingAddress.address) {
        navigate("/shipping");
        return;
      }

      const savedPayment = localStorage.getItem("paymentMethod") || "PayPal";

      console.log("=== DEBUG CART ITEMS ===");
      console.log("Raw cartItems:", currentCartItems);

      const itemsPrice = Number(
        currentCartItems
          .reduce(function (acc, item) {
            const price = Number(item.product?.price || item.price) || 0;
            const qty = Number(item.qty) || 1; // Default qty = 1 nếu undefined
            console.log(
              `Item: ${
                item.product?.name || item.name
              }, price: ${price}, qty: ${qty}, total: ${price * qty}`
            );
            return acc + price * qty;
          }, 0)
          .toFixed(2)
      );

      console.log("Calculated itemsPrice:", itemsPrice);

      const shippingPrice = Number((itemsPrice > 100 ? 0 : 10).toFixed(2));

      const taxPrice = 0;

      const totalPrice = Number(
        (itemsPrice + shippingPrice + taxPrice).toFixed(2)
      );

      setCart({
        cartItems: currentCartItems,
        shippingAddress: shippingAddress,
        paymentMethod: savedPayment,
        itemsPrice: itemsPrice,
        shippingPrice: shippingPrice,
        taxPrice: taxPrice,
        totalPrice: totalPrice,
      });
    },
    [navigate, cartItems] // Dependencies: navigate, cartItems
  );

  const placeOrderHandler = async function () {
    try {
      setIsLoading(true);
      setError(null);

      const normalizedItems = (cart.cartItems || [])
        .map(function (item) {
          return {
            product: item.product?.id || item.id || null,
            name: item.product?.name || item.name || "",
            qty: Number(item.qty) || 1, // Default qty = 1 nếu undefined
            price: Number(item.product?.price || item.price) || 0,
            image: item.product?.image || item.image || item.img || "",
          };
        })
        .filter(function (it) {
          return it.product && it.qty > 0;
        });

      if (!normalizedItems || normalizedItems.length === 0) {
        setError("Đơn hàng phải có ít nhất 1 sản phẩm với số lượng > 0");
        setIsLoading(false);
        return;
      }

      const savedUserStr =
        localStorage.getItem("my-cms-user") || localStorage.getItem("user");
      const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

      const shipping = cart.shippingAddress || {};
      const shippingFullName =
        shipping.fullName ||
        shipping.name ||
        savedUser?.fullName ||
        savedUser?.name ||
        "";

      if (!shippingFullName || !shipping.address) {
        setError(
          "Thiếu thông tin địa chỉ giao hàng (fullName hoặc address). Vui lòng kiểm tra trang Shipping."
        );
        setIsLoading(false);
        return;
      }

      const orderData = {
        orderItems: normalizedItems,
        shippingAddress: {
          fullName: shippingFullName,
          address: shipping.address,
          city: shipping.city || "",
          postalCode: shipping.postalCode || shipping.postal_code || "",
          phone: shipping.phone || "",
        },
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      };

      console.log(
        "Placing order with payload:",
        JSON.stringify(orderData, null, 2)
      );

      const response = await fetch("http://localhost:1337/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Gửi cookie JWT
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
        } else {
          const errorText = await response.text();
          errorData = { message: errorText || "Unknown error" };
        }

        if (response.status === 401) {
          console.error("❌ 401 Unauthorized: Token expired or invalid");
          setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

          localStorage.removeItem("user");
          setTimeout(() => {
            navigate("/login");
          }, 2000); // Delay 2 seconds to show error message
          return;
        }

        throw new Error(errorData.message || "Failed to create order");
      }

      const newOrder = await response.json();

      clearCart();
      localStorage.removeItem("shippingAddress");
      localStorage.removeItem("paymentMethod");

      console.log("=== ORDER CREATION RESPONSE ===");
      console.log("Full response:", JSON.stringify(newOrder, null, 2));
      console.log("Order object:", newOrder.order);
      console.log("Order ID:", newOrder.order?.id);
      console.log("Order _id:", newOrder.order?._id);

      const orderId = newOrder.order?.id || newOrder.order?._id;
      console.log("Using order ID for navigation:", orderId);

      if (!orderId) {
        console.error("❌ ORDER ID IS UNDEFINED!");
        setError(
          "Order created but unable to get order ID. Please check the order list."
        );
        return;
      }

      navigate(`/order/${orderId}`);
    } catch (err) {
      console.error("Error creating order:", err);
      setError(err.message || "Không thể tạo đơn hàng");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className="placeorder-container">
        {cart.cartItems.length === 0 ? (
          <Message>Giỏ hàng của bạn trống</Message>
        ) : (
          <>
            <div className="items-table-wrapper">
              <table className="items-table">
                <thead>
                  <tr>
                    <td className="table-header">Hình ảnh</td>
                    <td className="table-header">Sản phẩm</td>
                    <td className="table-header">Số lượng</td>
                    <td className="table-header">Giá</td>
                    <td className="table-header">Tổng</td>
                  </tr>
                </thead>

                <tbody>
                  {cart.cartItems.map(function (item, index) {
                    return (
                      <tr key={index}>
                        <td className="table-cell">
                          <img
                            src={`http://localhost:1337${
                              item.product?.image || item.image
                            }`}
                            alt={item.name}
                            className="item-image"
                          />
                        </td>

                        <td className="table-cell">
                          <Link
                            to={`/product/${item.product?.id || item.id}`}
                            className="product-link"
                          >
                            {item.product?.name || item.name}
                          </Link>
                        </td>

                        <td className="table-cell">{Number(item.qty) || 1}</td>

                        <td className="table-cell">
                          {(
                            Number(item.product?.price || item.price) || 0
                          ).toLocaleString("vi-VN")}{" "}
                          đ
                        </td>

                        <td className="table-cell">
                          {(
                            (Number(item.qty) || 1) *
                            (Number(item.product?.price || item.price) || 0)
                          ).toLocaleString("vi-VN")}{" "}
                          đ
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="order-summary-section">
              <h2 className="summary-heading">Tóm tắt đơn hàng</h2>

              <div className="summary-wrapper">
                <ul className="summary-list">
                  <li className="summary-item">
                    <span className="summary-label">Vận chuyển:</span>{" "}
                    {cart.shippingPrice.toLocaleString("vi-VN")} đ
                  </li>

                  <li className="summary-item">
                    <span className="summary-label">Tổng:</span>{" "}
                    {cart.totalPrice.toLocaleString("vi-VN")} đ
                  </li>
                </ul>

                {error && <Message variant="danger">{error}</Message>}

                <div className="shipping-section">
                  <h2 className="section-heading">Giao hàng</h2>
                  <p className="section-text">
                    <strong>Địa chỉ:</strong> {cart.shippingAddress.address},{" "}
                    {cart.shippingAddress.city}{" "}
                    {cart.shippingAddress.postalCode},{" "}
                    {cart.shippingAddress.country}
                  </p>
                </div>

                <div className="payment-section">
                  <h2 className="section-heading">Phương thức thanh toán</h2>
                  <p className="section-text">
                    <strong>Phương thức:</strong> {cart.paymentMethod}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn-place-order"
                disabled={cart.cartItems.length === 0}
                onClick={placeOrderHandler}
              >
                {isLoading ? "Đang đặt hàng" : "Đặt hàng"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default PlaceOrder;
