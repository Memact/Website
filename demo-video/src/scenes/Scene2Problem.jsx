import React from "react"
import { Caption, FadeSlide } from "./helpers.jsx"

export function Scene2Problem() {
  return (
    <section className="scene scene-grid">
      <FadeSlide className="scene-copy">
        <p className="eyebrow">Problem</p>
        <h2 className="headline">Apps guess quietly.</h2>
        <p className="subtext">They learn from clicks, forms, and little profiles. Users usually cannot see the list.</p>
      </FadeSlide>
      <div className="scene-copy problem-visual">
        <div className="card-row problem-cards">
          <FadeSlide delay={10} className="card">Clicks<small>page taps</small></FadeSlide>
          <FadeSlide delay={22} className="card">Forms<small>things you type</small></FadeSlide>
          <FadeSlide delay={34} className="card">Profiles<small>hidden guesses</small></FadeSlide>
        </div>
        <FadeSlide delay={54} className="card question-card">
          What do they know?
          <small>Usually hard to check.</small>
        </FadeSlide>
      </div>
      <Caption>Without Memact, every app can build its own little picture of the user, and the user may never see it.</Caption>
    </section>
  )
}
