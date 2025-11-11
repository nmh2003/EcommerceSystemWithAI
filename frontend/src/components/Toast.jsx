import { useEffect, useState } from "react";
import "./Toast.css";

function Toast({ message, type = "info", onClose }) {

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {

    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);

    setTimeout(onClose, 300);
  };

  const toastClass = `toast toast-${type} ${isVisible ? "toast-visible" : ""}`;

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
      default:
        return "ℹ";
    }
  };

  return (
    <div className={toastClass} role="alert">
      <span className="toast-icon">{getIcon()}</span>
      <div className="toast-content">{message}</div>
      <button className="toast-close" onClick={handleClose} aria-label="Đóng">
        ×
      </button>
    </div>
  );
}

export default Toast;
