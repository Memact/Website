import React from "react"
import { Composition } from "remotion"
import { registerRoot } from "remotion"
import { MemactDemo } from "./MemactDemo.jsx"
import "./styles.css"

export const RemotionRoot = () => {
  return (
    <Composition
      id="MemactDemo"
      component={MemactDemo}
      durationInFrames={2490}
      fps={30}
      width={1920}
      height={1080}
    />
  )
}

registerRoot(RemotionRoot)
