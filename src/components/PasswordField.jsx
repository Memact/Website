import React, { useState } from "react"

export function PasswordField({
  id,
  label,
  value,
  autoComplete,
  placeholder,
  onChange,
  required = false
}) {
  const [visible, setVisible] = useState(false)
  const inputId = id || `password-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`

  return (
    <label className="password-field">
      {label}
      <span className="password-input-wrap">
        <input
          id={inputId}
          value={value}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  )
}
