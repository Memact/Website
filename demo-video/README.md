# Memact Demo Video

Programmatic 16:9 MP4 demo for Memact.

## Install

```powershell
npm install
```

## Preview

```powershell
npm run preview
```

## Render MP4

```powershell
npm run render
```

The MP4 is saved to:

```text
out/memact-demo.mp4
```

## Optional WebM

```powershell
npm run render:webm
```

## Notes

- Built with Remotion.
- Uses existing Memact logo assets from this workspace.
- Flopkart product images are local SVG illustrations generated in this project.
- The background music is imported from `public/bgm.wav`.
- To regenerate that local WAV, run `npm run bgm`.
- No stock footage, paid tools, external visual assets, or generative video APIs.
- Captions are baked into each scene, so the video works without audio.
