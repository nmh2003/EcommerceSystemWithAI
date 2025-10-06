import React from "react";
import "./Input.css";

function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  ...rest
}) {
  return (
    <div className={`input-wrapper ${className}`}>

      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required-mark"> *</span>}
        </label>
      )}

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="input-field"
        {...rest}
      />
    </div>
  );
}

export default Input;
