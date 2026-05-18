import React from "react"

export function Chevron({ className = "" }) {
  const classes = ["faq-chevron", className].filter(Boolean).join(" ")
  return (
    <span className={classes} aria-hidden="true">
      <svg className="chevron-icon" viewBox="0 0 24 24" focusable="false">
        <path d="M6.5 9.25L12 14.75L17.5 9.25" />
      </svg>
    </span>
  )
}
