# Project: Memact UI Audit and Vercel/Render Deployment Readiness

## Architecture
- `interface`: Main frontend dashboard using React, custom `<details>`/`<summary>` dropdowns, and `localStorage` for manual entries, accepted, and rejected proposals.
- `fitent`: Onboarding and dashboard fitness tracking client using HTML/JS, styled select inputs, and local IndexedDB layer with background sync.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Explore & Plan | Explore codebase, review styles, storage, and build configurations | None | DONE |
| 2 | Fitent Dropdown Styles | Apply custom Memact-native dark style, custom SVG chevron, and hover/active states to Fitent select dropdowns | M1 | DONE |
| 3 | Input & Search Interaction | Add Alt+Enter support, remove text button, ensure correct SVG icons and key handlers in `interface` goal/search inputs | M1 | DONE |
| 4 | Persistence & Sync | Validate and verify localStorage / IndexedDB data persistence, ensure stable save-load state | M1 | DONE |
| 5 | Build & Deployment | Run production build commands, verify vite/vercel configs, and validate Vercel/Render compatibility | M2, M3, M4 | DONE |
| 6 | E2E Testing & Audit | Run all verification tests and security/integrity audit | M5 | DONE |

## Interface Contracts
### Fitent ↔ Memact Interface
- OAuth flow uses sessionStorage bridge keys (`fitent_memact_pending_state`, `fitent_memact_active_state`).
- Backend synchronization uses standard JSON payloads via ApiService.

## Code Layout
- `interface/src/components/WikiPage.jsx` — Core goal/search/select component
- `interface/src/styles.css` — Global styling for interface components
- `fitent/styles/base.css` — Styling rules for Fitent select inputs
- `fitent/scripts/storage.js` — Offline-first IndexedDB persistence logic
- `fitent/scripts/db.js` — IndexedDB wrapper implementation
