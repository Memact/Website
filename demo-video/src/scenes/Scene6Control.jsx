import React from "react"
import { Arrow, Caption, FadeSlide } from "./helpers.jsx"

export function Scene6Control() {
  return (
    <section className="scene">
      <div className="split">
        <FadeSlide className="phone-card result-panel">
          <div className="result-heading">
            <p className="eyebrow">App result</p>
            <strong>The app gets allowed memory.</strong>
          </div>
          <div className="recommendations">
            <div className="rec-row"><span>Preferred budget</span><b>Allowed</b></div>
            <div className="rec-row"><span>Favorite brands</span><b>Allowed</b></div>
            <div className="rec-row"><span>Private Wiki entries</span><b>No</b></div>
          </div>
        </FadeSlide>
        <FadeSlide delay={10} className="two-way-bridge">
          <div>
            App adds memory
            <Arrow />
          </div>
          <div className="bridge-return">
            Allowed memory returns
            <Arrow />
          </div>
        </FadeSlide>
        <FadeSlide delay={18} className="transparency-card result-panel">
          <div className="result-heading">
            <p className="eyebrow">Memact Wiki</p>
            <strong>The user still controls access.</strong>
          </div>
          <div className="transparency-list">
            <div><span>Connected apps</span><b>Flopkart</b></div>
            <div><span>Allowed memory</span><b>shopping</b></div>
            <div><span>Can write</span><b>after review</b></div>
            <div><span>Access</span><b>active</b></div>
          </div>
          <div className="remove-button">Remove access</div>
        </FadeSlide>
      </div>
      <Caption>Communication goes both ways: apps can add useful memory, and apps can read back only the memory the user allowed.</Caption>
    </section>
  )
}
