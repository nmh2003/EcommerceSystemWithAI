import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Footer.css";

function Footer() {

  const [lastVisit, setLastVisit] = useState(null);

  useEffect(() => {

    const savedLastVisit = localStorage.getItem("my-cms-last-visit");

    if (savedLastVisit) {
      setLastVisit(new Date(savedLastVisit));
    }

    localStorage.setItem("my-cms-last-visit", new Date().toISOString());
  }, []);

  const formatDate = (date) => {
    if (!date) return "";

    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-top">

          <div className="footer-column">
            <h3 className="footer-title">Về chúng tôi</h3>
            <p className="footer-text">
              My CMS là hệ thống quản lý nội dung đơn giản, dễ sử dụng. Được xây
              dựng bằng React + Sails.js.
            </p>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Liên kết</h3>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/shop" className="footer-link">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/cart" className="footer-link">
                  Giỏ hàng
                </Link>
              </li>
              <li>
                <Link to="/favorite" className="footer-link">
                  Yêu thích
                </Link>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3 className="footer-title">Liên hệ</h3>
            <ul className="footer-contacts">
              <li className="footer-contact">
                <span className="contact-icon">📧</span>
                <span>contact@mycms.com</span>
              </li>
              <li className="footer-contact">
                <span className="contact-icon">📞</span>
                <span>(+84) 123 456 789</span>
              </li>
              <li className="footer-contact">
                <span className="contact-icon">📍</span>
                <span>Hà Nội, Việt Nam</span>
              </li>
            </ul>
          </div>
        </div>

        {lastVisit && (
          <div className="footer-middle">
            <p className="footer-last-visit">
              🕒 Lần truy cập trước: {formatDate(lastVisit)}
            </p>
          </div>
        )}

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {currentYear} My CMS. All rights reserved.
          </p>
          <div className="footer-social">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Facebook"
            >
              📘
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Twitter"
            >
              🐦
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Instagram"
            >
              📷
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
