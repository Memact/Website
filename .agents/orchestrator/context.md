# Task Context

## Codebase Repos/Paths
- **Memact Interface**: `c:\Users\sujay\Downloads\memact_ai\interface`
  - Vite/React application.
  - Dropdown component: `MemactSelect` in `interface/src/components/WikiPage.jsx`.
  - Styling: `interface/src/styles.css`.
  - Storage: localStorage for manual entries, accepted/rejected proposals.
- **Fitent Application**: `c:\Users\sujay\Downloads\memact_ai\fitent`
  - Static HTML + JS frontend, Node/Express backend.
  - Dropdowns: Standard HTML `<select>` elements in `fitent/pages/dashboard.html` / `index.html`.
  - Styling: `fitent/styles/base.css`.
  - Storage: local-first IndexedDB wrapper (`Fitent_idb`, store `state`) with fallback storage migration.

## Targets for Modifications
1. **Fitent Dropdown Styles**: `fitent/styles/base.css` to add custom dark dropdown styling matching the main Memact design.
2. **Interface Inputs**: `interface/src/components/WikiPage.jsx` to refine the goal and search input behaviors.
3. **Build and Deployment Check**: `interface/vite.config.js`, `fitent/vite.config.js`, `fitent/vercel.json`, and deployment configs.
