import "./Message.css";

function Message({ variant = "info", children, onClose }) {

  const messageClass = `message message-${variant}`;

  return (
    <div className={messageClass} role="alert">

      <span className="message-icon">
        {variant === "success" && "✓"}
        {variant === "error" && "✕"}
        {variant === "info" && "ℹ"}
        {variant === "warning" && "⚠"}
      </span>

      <div className="message-content">{children}</div>

      {onClose && (
        <button
          className="message-close"
          onClick={onClose}
          aria-label="Đóng thông báo"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Message;
