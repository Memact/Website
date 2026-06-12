# Memact Agent Boot

Read `.agents/rules/memact-project-context.md` before changing code.

This workspace contains many old and active repos. Do not assume every folder is current.

Current spine:

```txt
Access -> Wiki -> Context -> Memory -> SDK -> Apps
```

Product loop:

```txt
App sends or proposes context
-> Access checks permission
-> Context gives it shape
-> Yourself shows it to the user
-> user accepts, edits, rejects, or deletes
-> Memory stores accepted context
-> SDK lets apps read only allowed context
-> apps personalize better
```

Main user-facing idea:

Users should have one place to see and control what apps know about them.

Do not revive retired repo flows.
Do not bring back Intent as core product.
Do not treat Capture, Inference, Extension, or Playground as current core.
Do not make Memact an AI-wrapper product.
