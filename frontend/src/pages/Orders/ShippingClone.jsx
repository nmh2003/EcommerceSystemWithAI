import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressSteps from "../../components/ProgressSteps";
import "./ShippingClone.css";

function Shipping() {

  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("PayPal");

  useEffect(
    function () {

      const savedShipping = localStorage.getItem("shippingAddress");

      if (savedShipping) {
        try {
          const shippingData = JSON.parse(savedShipping);

          if (shippingData.address) setAddress(shippingData.address);
          if (shippingData.city) setCity(shippingData.city);
          if (shippingData.postalCode) setPostalCode(shippingData.postalCode);
          if (shippingData.country) setCountry(shippingData.country);
        } catch (err) {
          console.error("Error parsing shipping address:", err);
        }
      }
    },
    [] // Dependencies rỗng → chỉ chạy 1 lần khi mount
  );

  const submitHandler = function (e) {

    e.preventDefault();

    const shippingData = {
      address: address,
      city: city,
      postalCode: postalCode,
      country: country,
    };

    localStorage.setItem("shippingAddress", JSON.stringify(shippingData));

    localStorage.setItem("paymentMethod", paymentMethod);

    navigate("/place-order");
  };

  return (
    <div className="shipping-container">

      <ProgressSteps step1 step2 />

      <div className="shipping-form-wrapper">

        <form onSubmit={submitHandler} className="shipping-form">

          <h1 className="form-heading">Shipping</h1>

          <div className="form-group">

            <label className="form-label">Địa chỉ</label>

            <input
              type="text"
              className="form-input"
              placeholder="Nhập địa chỉ"
              value={address}
              required
              onChange={function (e) {
                setAddress(e.target.value);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thành phố</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập thành phố"
              value={city}
              required
              onChange={function (e) {
                setCity(e.target.value);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mã bưu điện</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập mã bưu điện"
              value={postalCode}
              required
              onChange={function (e) {
                setPostalCode(e.target.value);
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quốc gia</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập quốc gia"
              value={country}
              required
              onChange={function (e) {
                setCountry(e.target.value);
              }}
            />
          </div>

          <div className="form-group">

            <label className="form-label-secondary">Chọn phương thức</label>

            <div className="radio-wrapper">

              <label className="radio-label">

                <input
                  type="radio"
                  className="radio-input"
                  name="paymentMethod"
                  value="PayPal"
                  checked={paymentMethod === "PayPal"}
                  onChange={function (e) {
                    setPaymentMethod(e.target.value);
                  }}
                />

                <span className="radio-text">PayPal hoặc thẻ tín dụng</span>
              </label>
            </div>
          </div>

          <button className="btn-continue" type="submit">
            Tiếp tục
          </button>
        </form>
      </div>
    </div>
  );
}

export default Shipping;
