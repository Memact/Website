import React from "react"
import { Img, staticFile } from "remotion"
import { Caption, FadeSlide } from "./helpers.jsx"

export function Scene1Title() {
  return (
    <section className="scene scene-center">
      <FadeSlide>
        <Img src={staticFile("logo.png")} style={{ width: 330, marginBottom: 86 }} />
      </FadeSlide>
      <FadeSlide delay={16}>
        <h1 className="title">
          Personalization made better
          <span className="with">with Memact</span>
        </h1>
      </FadeSlide>
      <FadeSlide delay={34}>
        <p className="subtext" style={{ marginTop: 34 }}>
          Apps personalize around what users choose.
        </p>
      </FadeSlide>
      <Caption>Memact lets users see what apps remember, change it, and remove access.</Caption>
    </section>
  )
}
