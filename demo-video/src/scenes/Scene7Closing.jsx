import React from "react"
import { Arrow, Caption, FadeSlide, Icon } from "./helpers.jsx"

export function Scene7Closing() {
  return (
    <section className="scene scene-center">
      <FadeSlide>
        <div className="loop">
          <div className="loop-card"><Icon name="app" /><strong>App asks</strong></div>
          <Arrow />
          <div className="loop-card"><Icon name="access" /><strong>Memact checks</strong></div>
          <Arrow />
          <div className="loop-card"><Icon name="wiki" /><strong>User edits Wiki</strong></div>
          <Arrow />
          <div className="loop-card"><Icon name="memory" /><strong>Memory stays</strong></div>
          <Arrow />
          <div className="loop-card"><Icon name="sdk" /><strong>App improves</strong></div>
        </div>
        <div className="control-note">Apps adapt to people. People do not rebuild themselves in every app.</div>
      </FadeSlide>
      <FadeSlide delay={20}>
        <h2 className="headline" style={{ marginTop: 56 }}>
          Users see it. Users change it. Apps use only what is allowed.
        </h2>
      </FadeSlide>
      <FadeSlide delay={38}>
        <h1 className="title" style={{ fontSize: 68, marginTop: 44 }}>
          Personalization made better
          <span className="with">with Memact</span>
        </h1>
      </FadeSlide>
      <Caption>Memact is where users control what apps know, and apps personalize around what users choose.</Caption>
    </section>
  )
}
