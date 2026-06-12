import React from "react"
import { interpolate, useCurrentFrame } from "remotion"

export function FadeSlide({ children, delay = 0, className = "" }) {
  const frame = useCurrentFrame()
  const opacity = interpolate(frame, [delay, delay + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  })
  const translateY = interpolate(frame, [delay, delay + 22], [18, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  })

  return (
    <div className={className} style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  )
}

export function Caption({ children }) {
  return <div className="caption">{children}</div>
}

export function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 96 32" aria-hidden="true">
      <path d="M6 16H82" />
      <path d="M68 4L84 16L68 28" />
    </svg>
  )
}

export function Icon({ name }) {
  const paths = {
    user: <path d="M20 20C24.4 20 28 16.4 28 12S24.4 4 20 4S12 7.6 12 12S15.6 20 20 20ZM7 36C8.6 28.7 13.1 24 20 24S31.4 28.7 33 36" />,
    app: <path d="M9 11C9 8.8 10.8 7 13 7H27C29.2 7 31 8.8 31 11V25C31 27.2 29.2 29 27 29H13C10.8 29 9 27.2 9 25V11ZM15 15H25M15 20H23M15 25H19" />,
    access: <path d="M20 4L32 9V18C32 26.2 27 32.3 20 36C13 32.3 8 26.2 8 18V9L20 4ZM16 20L19 23L25 15" />,
    context: <path d="M8 11H32M8 20H32M8 29H32M14 7V15M24 16V24M18 25V33" />,
    wiki: <path d="M9 8H24C27.9 8 31 11.1 31 15V32H14C10.1 32 7 28.9 7 25V10C7 8.9 7.9 8 9 8ZM13 15H24M13 20H24M13 25H20M25 8V32" />,
    memory: <path d="M20 6C27.2 6 33 8.2 33 11S27.2 16 20 16S7 13.8 7 11S12.8 6 20 6ZM7 11V28C7 30.8 12.8 33 20 33S33 30.8 33 28V11M7 19C7 21.8 12.8 24 20 24S33 21.8 33 19" />,
    sdk: <path d="M15 12L7 20L15 28M25 12L33 20L25 28M23 8L17 32" />,
    edit: <path d="M9 29L8 34L13 33L30 16L26 12L9 29ZM24 10L27 7L33 13L30 16" />,
    delete: <path d="M12 13H28M16 13V10H24V13M15 16V30H25V16M18 19V27M22 19V27" />
  }

  return (
    <span className="icon-dot">
      <svg viewBox="0 0 40 40" aria-hidden="true">{paths[name]}</svg>
    </span>
  )
}
