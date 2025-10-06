import React from "react";

function Button({ children, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        ...style,
      }}
    >
      {children}

    </button>
  );
}

export default Button;
