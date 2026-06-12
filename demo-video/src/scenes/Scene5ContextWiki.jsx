import React from "react"
import { Caption, FadeSlide } from "./helpers.jsx"

export function Scene5ContextWiki() {
  return (
    <section className="scene scene-grid scene-memory">
      <FadeSlide className="scene-copy">
        <p className="eyebrow">Wiki memory</p>
        <h2 className="headline">The user can change the memory.</h2>
      </FadeSlide>
      <div className="memory-stack">
        {[
          ["Prefers concise summaries", "added by user"],
          ["Likes high-end laptops", "proposed by Flopkart"],
          ["Uses creator tools", "accepted memory"],
          ["Old shopping guess", "deleted by user"]
        ].map(([label, detail], index) => (
          <FadeSlide key={label} delay={index * 12} className="memory-card">
            <MemoryIcon type={index} />
            <div>
              <strong>{label}</strong>
              <small>{detail}</small>
            </div>
          </FadeSlide>
        ))}
        <FadeSlide delay={58} className="feature-card">
          <p className="eyebrow">User controls</p>
          <strong>Create, read, update, delete.</strong>
          <div className="crud-grid">
            <div className="crud-action primary-action"><span>Create</span><strong>Add</strong></div>
            <div className="crud-action"><span>Read</span><strong>Check</strong></div>
            <div className="crud-action"><span>Update</span><strong>Edit</strong></div>
            <div className="crud-action danger-action"><span>Delete</span><strong>Remove</strong></div>
          </div>
        </FadeSlide>
      </div>
      <Caption>Memact Wiki is not a hidden profile. It is memory the user can add to, check, edit, or delete.</Caption>
    </section>
  )
}

function MemoryIcon({ type }) {
  const paths = [
    <path key="summary" d="M12 8H28V32H12V8ZM16 15H24M16 20H24M16 25H21" />,
    <path key="laptop" d="M10 13H30V25H10V13ZM7 29H33M13 29H27" />,
    <path key="tools" d="M14 10L20 16M16 8L22 14M27 9L31 13L19 25L15 21L27 9ZM11 29L15 25" />,
    <path key="trash" d="M12 13H28M16 13V10H24V13M15 16V30H25V16M18 19V27M22 19V27" />
  ]

  return (
    <span className="dot">
      <svg viewBox="0 0 40 40" aria-hidden="true">{paths[type]}</svg>
    </span>
  )
}
