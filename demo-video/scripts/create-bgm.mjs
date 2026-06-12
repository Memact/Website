import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const out = join(root, "public", "bgm.wav")
const sampleRate = 48000
const seconds = 75
const channels = 2
const totalSamples = sampleRate * seconds

const chordProgression = [
  [130.81, 196.0, 261.63],
  [146.83, 220.0, 293.66],
  [164.81, 246.94, 329.63],
  [123.47, 185.0, 246.94]
]

function envelope(t) {
  const attack = Math.min(1, t / 4)
  const release = Math.min(1, (seconds - t) / 5)
  return Math.max(0, Math.min(attack, release))
}

function softSine(freq, t, phase = 0) {
  return Math.sin(2 * Math.PI * freq * t + phase)
}

function sampleAt(i) {
  const t = i / sampleRate
  const bar = Math.floor(t / 6) % chordProgression.length
  const chord = chordProgression[bar]
  const env = envelope(t)

  let pad = 0
  for (let n = 0; n < chord.length; n += 1) {
    pad += softSine(chord[n], t, n * 0.37) * 0.11
    pad += softSine(chord[n] * 2.005, t, n * 0.23) * 0.035
  }

  const pulseStep = Math.floor(t * 2) % 8
  const pulseFreq = chord[pulseStep % chord.length] * 2
  const pulseEnv = Math.pow(1 - ((t * 2) % 1), 2.8)
  const pulse = softSine(pulseFreq, t) * pulseEnv * 0.045

  const air = softSine(880, t, 0.5) * 0.008 + softSine(1320, t, 1.8) * 0.005
  return (pad + pulse + air) * env
}

function writeString(buffer, offset, value) {
  buffer.write(value, offset, value.length, "ascii")
}

mkdirSync(dirname(out), { recursive: true })

const dataBytes = totalSamples * channels * 2
const buffer = Buffer.alloc(44 + dataBytes)
writeString(buffer, 0, "RIFF")
buffer.writeUInt32LE(36 + dataBytes, 4)
writeString(buffer, 8, "WAVE")
writeString(buffer, 12, "fmt ")
buffer.writeUInt32LE(16, 16)
buffer.writeUInt16LE(1, 20)
buffer.writeUInt16LE(channels, 22)
buffer.writeUInt32LE(sampleRate, 24)
buffer.writeUInt32LE(sampleRate * channels * 2, 28)
buffer.writeUInt16LE(channels * 2, 32)
buffer.writeUInt16LE(16, 34)
writeString(buffer, 36, "data")
buffer.writeUInt32LE(dataBytes, 40)

let offset = 44
for (let i = 0; i < totalSamples; i += 1) {
  const t = i / sampleRate
  const pan = Math.sin(t * 0.19) * 0.18
  const s = Math.max(-0.95, Math.min(0.95, sampleAt(i)))
  const left = s * (0.82 - pan)
  const right = s * (0.82 + pan)
  buffer.writeInt16LE(Math.round(left * 32767), offset)
  buffer.writeInt16LE(Math.round(right * 32767), offset + 2)
  offset += 4
}

writeFileSync(out, buffer)
console.log(`Wrote ${out}`)
