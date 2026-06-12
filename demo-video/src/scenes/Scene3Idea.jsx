import React from "react"
import { Arrow, Caption, FadeSlide, Icon } from "./helpers.jsx"

export function Scene3Idea() {
  return (
    <section className="scene scene-center scene-idea">
      <FadeSlide>
        <p className="eyebrow">Memact Wiki</p>
        <h2 className="headline idea-headline">One place to see what apps know.</h2>
      </FadeSlide>
      <div className="actor-row idea-actors">
        <FadeSlide delay={18} className="actor"><Icon name="wiki" /><strong>Wiki</strong><small>a readable memory page</small></FadeSlide>
        <FadeSlide delay={30} className="actor"><Icon name="edit" /><strong>Edit</strong><small>fix anything wrong</small></FadeSlide>
        <FadeSlide delay={42} className="actor"><Icon name="memory" /><strong>Delete</strong><small>remove what should not stay</small></FadeSlide>
      </div>
      <FadeSlide delay={62} className="flow-line idea-flow">
        User <Arrow /> Wiki <Arrow /> Apps
      </FadeSlide>
      <Caption>The user has a Wiki. It shows what apps remember, and the user can change it.</Caption>
    </section>
  )
}
