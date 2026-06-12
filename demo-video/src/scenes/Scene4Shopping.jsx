import React from "react"
import { Arrow, Caption, FadeSlide } from "./helpers.jsx"

export function Scene4Shopping() {
  return (
    <section className="scene scene-grid">
      <FadeSlide className="scene-copy">
        <p className="eyebrow">Example</p>
        <h2 className="headline">A shopping app asks first.</h2>
        <p className="subtext">It can share what the user did, and Memact turns that into readable memory.</p>
        <div className="flow-line" style={{ justifyContent: "flex-start", marginTop: 16 }}>
          User shops <Arrow /> Memact writes Wiki memory
        </div>
      </FadeSlide>
      <FadeSlide delay={14} className="flopkart">
        <div className="flopkart-header">
          <span>Flopkart</span>
          <span className="plain-pill">shopping app</span>
        </div>
        <div className="permission-list">
          <div><strong>What happened</strong><small>compared laptops, revisited brands</small></div>
          <div><strong>What Memact writes</strong><small>likes high-end laptops</small></div>
          <div><strong>What app gets back</strong><small>only allowed shopping memory</small></div>
        </div>
        <div className="consent-actions">
          <span className="allow-button">Allow</span>
          <span className="deny-button">Deny</span>
        </div>
      </FadeSlide>
      <Caption>Flopkart can share shopping activity after permission. Memact turns it into readable Wiki memory the user can accept, edit, or remove.</Caption>
    </section>
  )
}
