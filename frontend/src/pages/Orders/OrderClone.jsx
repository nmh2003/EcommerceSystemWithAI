import { useState, useEffect, useMemo } from "react";
import { useToast } from "../../context/ToastContext";

import { Link, useParams } from "react-router-dom";

import Message from "../../components/Message";

import Loader from "../../components/Loader";

import { getUser } from "../../utils/localStorage";

import { vndToUsd } from "../../utils/currency";

import "./OrderClone.css";

const Order = function () {
  const { id: orderId } = useParams();

  const userInfo = useMemo(() => getUser(), []);

  function formatPriceVN(price) {
    if (typeof price !== "number") {
      return "0 đ";
    }
    return price.toLocaleString("vi-VN") + " đ";
  }

  const [order, setOrder] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);

  const [deliverLoading, setDeliverLoading] = useState(false);

  const [paymentModal, setPaymentModal] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");

  const [paymentLoading, setPaymentLoading] = useState(false);

  const [paypalClientId, setPaypalClientId] = useState(null);
  const [paypalLoading, setPaypalLoading] = useState(false);

  const { addToast } = useToast();

  useEffect(
    function () {
      console.log("🚀 OrderClone component mounted with orderId:", orderId);

      if (!userInfo) {
        setError("Vui lòng đăng nhập để xem chi tiết đơn hàng");
        setIsLoading(false);
        return; // Dừng execution
      }

      const fetchOrder = async function () {
        try {
          setIsLoading(true);
          setError(null);

          const response = await fetch(
            `http://localhost:1337/api/orders/${orderId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Gửi cookie JWT thay vì Authorization header
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch order");
          }

          const data = await response.json();

          setOrder(data);
        } catch (err) {
          console.error("Error fetching order:", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrder();
    },
    [orderId, userInfo]
  );

  useEffect(() => {
    const loadPayPal = async () => {
      try {
        console.log("🔄 Fetching PayPal client ID...");

        const response = await fetch(
          "http://localhost:1337/api/config/paypal",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        console.log("📡 PayPal API response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(
            "✅ PayPal client ID received:",
            data.clientId ? "YES" : "NO"
          );
          setPaypalClientId(data.clientId);
        } else {
          console.error(
            "❌ PayPal API error:",
            response.status,
            response.statusText
          );
        }
      } catch (err) {
        console.error("❌ Error loading PayPal:", err);
      }
    };

    loadPayPal();
  }, []);

  useEffect(() => {
    console.log("🔍 PayPal setup check:", {
      paypalClientId: paypalClientId ? "SET" : "NOT SET",
      order: order ? "EXISTS" : "NOT EXISTS",
      isPaid: order ? order.isPaid : "N/A",
    });

    if (!paypalClientId || !order || order.isPaid) {
      console.log("⏳ Waiting for PayPal setup conditions...");
      return;
    }

    console.log(
      "🚀 Setting up PayPal button with client ID:",
      paypalClientId.substring(0, 10) + "..."
    );

    if (!window.paypal) {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
      script.async = true;
      script.onload = () => {
        console.log("📦 PayPal script loaded successfully");
        renderPayPalButton();
      };

      document.head.appendChild(script);

      return () => {
        const existingScript = document.querySelector(
          `script[src*="${paypalClientId}"]`
        );
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
      };
    } else {
      renderPayPalButton();
    }

    function renderPayPalButton() {
      const container = document.getElementById("paypal-button-container");
      if (!container) {
        console.error("❌ PayPal container element not found");
        return;
      }

      container.innerHTML = "";

      console.log("🎯 PayPal SDK available, rendering button...");

      window.paypal
        .Buttons({
          createOrder: (data, actions) => {
            const usdAmount = vndToUsd(order.totalPrice);

            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: usdAmount.toFixed(2),
                    currency_code: "USD",
                  },
                  description: `Order ${order.id || order._id}`,
                },
              ],
            });
          },
          onApprove: async (data, actions) => {
            try {
              setPaypalLoading(true);

              const details = await actions.order.capture();

              const response = await fetch(
                `http://localhost:1337/api/orders/${orderId}/pay`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                  body: JSON.stringify({
                    details: details, // Send full PayPal details
                  }),
                }
              );

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "PayPal payment failed");
              }

              const orderResponse = await fetch(
                `http://localhost:1337/api/orders/${orderId}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }
              );

              if (orderResponse.ok) {
                const updatedOrder = await orderResponse.json();
                setOrder(updatedOrder);
              }

              addToast("Thanh toán PayPal thành công!", "success");
            } catch (err) {
              console.error("PayPal payment error:", err);
              addToast("Thanh toán PayPal thất bại: " + err.message, "error");
            } finally {
              setPaypalLoading(false);
            }
          },
          onError: (err) => {
            console.error("PayPal error:", err);
            addToast("Có lỗi xảy ra với PayPal. Vui lòng thử lại.", "error");
          },
        })
        .render("#paypal-button-container");
    }
  }, [paypalClientId, order, orderId, addToast]); // Include order and orderId in dependencies

  const deliverHandler = async function () {
    try {
      setDeliverLoading(true);

      const response = await fetch(
        `http://localhost:1337/api/orders/${orderId}/deliver`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Gửi cookie JWT
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to mark as delivered");
      }

      const orderResponse = await fetch(
        `http://localhost:1337/api/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Gửi cookie JWT
        }
      );

      if (orderResponse.ok) {
        const updatedOrder = await orderResponse.json();
        setOrder(updatedOrder);
      }
    } catch (err) {
      console.error("Error marking as delivered:", err);
      setError(err.message);
    } finally {
      setDeliverLoading(false);
    }
  };

  const paymentHandler = async function () {
    try {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Vui lòng nhập số tiền hợp lệ");
      }

      if (amount < order.totalPrice) {
        throw new Error(
          `Số tiền phải ít nhất ${formatPriceVN(order.totalPrice)}`
        );
      }

      setPaymentLoading(true);

      const response = await fetch(
        `http://localhost:1337/api/orders/${orderId}/pay`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ amount: amount }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Thanh toán thất bại");
      }

      const orderResponse = await fetch(
        `http://localhost:1337/api/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (orderResponse.ok) {
        const updatedOrder = await orderResponse.json();
        setOrder(updatedOrder);
      }

      setPaymentModal(false);
      setPaymentAmount("");
    } catch (err) {
      console.error("Error processing payment:", err);
      setError(err.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="danger">{error}</Message>;
  }

  if (!order) {
    return <Message variant="warning">Không tìm thấy đơn hàng</Message>;
  }

  return (
    <div className="order-container">
      {console.log(
        "🎨 OrderClone rendering with order:",
        order ? "EXISTS" : "NULL"
      )}

      <div className="order-main">
        <div className="order-items-section">
          {order.orderItems.length === 0 ? (
            <Message>Đơn hàng trống</Message>
          ) : (
            <div className="table-wrapper">
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Hình ảnh</th>
                    <th>Sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Đơn giá</th>
                    <th>Tổng</th>
                  </tr>
                </thead>

                <tbody>
                  {order.orderItems.map(function (item, index) {
                    return (
                      <tr key={index}>
                        <td>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="item-image"
                          />
                        </td>

                        <td>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </td>

                        <td className="text-center">{item.qty}</td>

                        <td className="text-center">
                          {formatPriceVN(item.price)}
                        </td>

                        <td className="text-center">
                          {formatPriceVN(item.qty * item.price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="order-sidebar">
        <div className="order-shipping">
          <h2 className="section-title">Giao hàng</h2>

          <p className="info-row">
            <strong className="info-label">Đơn hàng:</strong>{" "}
            {order.id || order._id}
          </p>

          <p className="info-row">
            <strong className="info-label">Email:</strong> {order.user.email}
          </p>

          <p className="info-row">
            <strong className="info-label">Địa chỉ:</strong>{" "}
            {order.shippingAddress.address}, {order.shippingAddress.city}{" "}
            {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </p>

          <p className="info-row">
            <strong className="info-label">Phương thức:</strong>{" "}
            {order.paymentMethod}
          </p>

          {order.isPaid ? (
            <Message variant="success">
              Đã thanh toán vào {order.paidAt}
            </Message>
          ) : (
            <div>
              <Message variant="danger">Chưa thanh toán</Message>

              <button
                type="button"
                className="btn-payment"
                onClick={() => setPaymentModal(true)}
              >
                Thanh toán
              </button>

              <div id="paypal-button-container" style={{ marginTop: "10px" }}>
                {paypalLoading && <Loader />}
              </div>
            </div>
          )}
        </div>

        <div className="order-summary">
          <h2 className="section-title">Tóm tắt đơn hàng</h2>

          <div className="summary-row">
            <span>Vận chuyển</span>
            <span>{formatPriceVN(order.shippingPrice)}</span>
          </div>

          <div className="summary-row">
            <span>Thuế</span>
            <span>{formatPriceVN(order.taxPrice)}</span>
          </div>

          <div className="summary-row summary-total">
            <span>Tổng</span>
            <span>{formatPriceVN(order.totalPrice)}</span>
          </div>
        </div>

        {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
          <div className="order-actions">
            {deliverLoading && <Loader />}

            <button
              type="button"
              className="btn-deliver"
              onClick={deliverHandler}
              disabled={deliverLoading}
            >
              {deliverLoading ? "Đang đánh dấu..." : "Đánh dấu đã giao"}
            </button>
          </div>
        )}
      </div>

      {paymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal">
            <div className="payment-modal-header">
              <h2>Thanh toán đơn hàng</h2>
              <button
                className="payment-modal-close"
                onClick={() => setPaymentModal(false)}
              >
                ×
              </button>
            </div>
            <div className="payment-modal-body">
              <div className="payment-info">
                <p>
                  <strong>Mã đơn hàng:</strong> {order.id || order._id}
                </p>
                <p>
                  <strong>Tổng tiền:</strong> {formatPriceVN(order.totalPrice)}
                </p>
              </div>
              <div className="payment-form">
                <label htmlFor="payment-amount">Số tiền thanh toán:</label>
                <input
                  id="payment-amount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder={`Tối thiểu ${formatPriceVN(order.totalPrice)}`}
                  min={order.totalPrice}
                  step="0.01"
                />
              </div>
            </div>
            <div className="payment-modal-footer">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setPaymentModal(false)}
                disabled={paymentLoading}
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn-confirm"
                onClick={paymentHandler}
                disabled={paymentLoading}
              >
                {paymentLoading ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
