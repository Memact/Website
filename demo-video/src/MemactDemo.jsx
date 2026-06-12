import React from "react"
import { AbsoluteFill, Audio, Img, Sequence, staticFile } from "remotion"
import { Scene1Title } from "./scenes/Scene1Title.jsx"
import { Scene2Problem } from "./scenes/Scene2Problem.jsx"
import { Scene3Idea } from "./scenes/Scene3Idea.jsx"
import { Scene4Shopping } from "./scenes/Scene4Shopping.jsx"
import { Scene5ContextWiki } from "./scenes/Scene5ContextWiki.jsx"
import { Scene6Control } from "./scenes/Scene6Control.jsx"
import { Scene7Closing } from "./scenes/Scene7Closing.jsx"

const scenes = [
  { start: 0, duration: 210, Component: Scene1Title },
  { start: 210, duration: 330, Component: Scene2Problem },
  { start: 540, duration: 330, Component: Scene3Idea },
  { start: 870, duration: 480, Component: Scene4Shopping },
  { start: 1350, duration: 480, Component: Scene5ContextWiki },
  { start: 1830, duration: 360, Component: Scene6Control },
  { start: 2190, duration: 300, Component: Scene7Closing }
]

const bgm = staticFile("bgm.wav")
const wordmark = staticFile("logo.png")

export function MemactDemo() {
  return (
    <AbsoluteFill className="video-root">
      <div className="quiet-grid" />
      <Audio src={bgm} volume={0.18} />
      <Img className="corner-wordmark" src={wordmark} />
      {scenes.map(({ start, duration, Component }) => (
        <Sequence key={start} from={start} durationInFrames={duration}>
          <Component duration={duration} />
        </Sequence>
      ))}
    </AbsoluteFill>
  )
}
