# Workspace Analysis: Interface and Fitent Directories

An in-depth read-only exploration of the dropdown components, inputs, local storage layers, and build configurations in both `interface` and `fitent` directories within the `c:\Users\sujay\Downloads\memact_ai` workspace.

---

## 1. Dropdown Components and Custom Selects

### In the `interface` (Yourself Dashboard / Memact Website)
- **Component**: `MemactSelect` is defined in `interface/src/components/WikiPage.jsx` (lines 614–644) and is imported into `Dashboard.jsx`.
- **Implementation**:
  - Implemented using semantic HTML5 `<details>` and `<summary>` tags instead of standard `<select>`.
  - The `<summary>` tag serves as the trigger (`.memact-select-trigger`) containing a text label and a custom `Chevron` SVG.
  - The dropdown menu is a `div` element (`.memact-select-menu`) acting as a `listbox` container populated with option `<button>` elements.
  - State interaction is handled programmatically: selecting an option calls `onChange(nextValue)` and closes the details element by removing its `open` attribute via a React `useRef` reference (`detailsRef.current?.removeAttribute("open")`).
- **Styling**: Defined in `interface/src/styles.css` (lines 2821–2936):
  - **Positioning**: Uses absolute positioning for `.memact-select-menu` relative to the wrapper with `top: calc(100% + 6px)` to overlap other page elements neatly.
  - **Visuals**: Styled with a dark background (`rgba(0, 1, 27, 0.98)`), a subtle border (`var(--border-strong)`), a drop shadow (`box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34)`), and a modern backdrop blur (`backdrop-filter: blur(18px)`).
  - **Chevron Rotation**: Handled purely in CSS:
    ```css
    .memact-select[open] .memact-select-chevron .chevron-icon {
      transform: rotate(180deg);
    }
    ```
  - **States**: Option buttons display `.is-active` backgrounds (`rgba(255, 255, 255, 0.14)`) and hover/focus styling (`rgba(255, 255, 255, 0.08)`).
  - **Compact Modifier**: A modifier class `.memact-select-compact` changes sizing parameters (`min-width: 154px`, trigger height: `44px`, chevron size: `30px`) for inline layouts like visibility cards.

### In `fitent` (Fitness nutrition planner)
- **Component**: Standard HTML `<select>` elements are used (e.g., `#food-category`, `#gender`, `#activity`, `#goal`, `#macroSplit`, `#dietaryPreference`, `#target-goal-type`, `#food-meal-type`).
- **Styling**: Custom styled in `fitent/styles/base.css` (lines 130–162):
  - Shared CSS rules with `input` fields give it a unified look: 100% width, height, border-radius (`12px`), custom border, and padding (`0.78rem 0.86rem`).
  - Focus outlines are customized:
    ```css
    input:focus,
    select:focus {
      outline: 2px solid rgba(56, 242, 166, 0.72);
      outline-offset: 2px;
    }
    ```
  - Theme-aware background variables (`--select-bg`) define select and option option background colors:
    - **Dark Theme**: `#0f172a`
    - **Light Theme**: `#ffffff`

---

## 2. Input and Search Bar Components

### Goal Panel Input (Start with what you are trying to do)
- **File**: `interface/src/components/WikiPage.jsx` (lines 280–344)
- **Auto-focus**: Uses the `autoFocus` prop driven by the state `isFirstTimeUser` (which is `true` if `visibleEntries.length === 0`). A React `useEffect` hook also triggers `.focus()` when first loading the view:
  ```javascript
  useEffect(() => {
    if (isFirstTimeUser && !app?.id) {
      goalInputRef.current?.focus()
    }
  }, [isFirstTimeUser, app?.id])
  ```
- **Pulsing Prompt**: If `isFirstTimeUser` is true, a prompt container is rendered beneath the input (`.wiki-goal-prompt`) containing a `<span className="pulse-dot" />`. It is animated in CSS using:
  ```css
  .pulse-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
    animation: pulse 1.6s infinite;
    flex-shrink: 0;
  }
  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(74, 222, 128, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
  }
  ```
- **Placeholder Styles**: Styled inside `interface/src/styles.css` using:
  ```css
  .wiki-goal-form input::placeholder {
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    color: var(--muted);
    opacity: 0.72;
  }
  ```
- **Submissions**: The input is wrapped in a `<form onSubmit={findGoalContext}>`. It intercepts keydown events to submit on the Enter key:
  ```javascript
  const handleGoalKeyDown = (event) => {
    if (event.key === "Enter") {
      findGoalContext(event)
    }
  }
  ```
- **SVG Enter Icon**: A submit button containing a carriage-return symbol SVG (`.enter-icon`) is absolutely positioned inside the input wrapper. It only renders when `goalText.trim().length > 0` is true, providing immediate visual feedback that the query can be run.

### "Find something" Search Bar
- **File**: `interface/src/components/WikiPage.jsx` (lines 450–472)
- **Auto-focus**: Does not auto-focus.
- **Pulsing Prompt**: No pulsing prompt associated.
- **Placeholder Styles**: Styled similarly to the goal input:
  ```css
  .wiki-search-field input::placeholder {
    font-family: inherit;
    font-size: 16px;
    font-weight: 500;
    color: var(--muted);
    opacity: 0.72;
  }
  ```
- **Submissions**: There is no keydown handler or submit listener. Filtering is purely reactive; `onChange` updates `wikiSearch`, which filters memory entries instantly in the UI:
  ```javascript
  const filteredEntries = filterWikiEntries(visibleEntries, wikiSearch)
  ```
- **SVG Enter Icon**: Similar to the goal input, an enter icon SVG appears on the right side if the input length is > 0. When visible, it applies dynamic right padding (`paddingRight: "46px"`) to the input to prevent text from overlapping the SVG icon:
  ```jsx
  style={wikiSearch.trim().length > 0 ? { paddingRight: "46px" } : {}}
  ```
  The carriage return enter icon here is nested in a passive indicator span `.enter-action-indicator` with `aria-hidden="true"`.

### Fitent Food Search Bar
- **File**: `fitent/pages/dashboard.html` / `fitent/index.html` (lines 761–766)
- **Implementation**: A standard HTML `<input id="food-search" type="search">` wrapper.
- **Behavior**: Tracked in `fitent/scripts/tracker.js` (lines 430–432). Adds an event listener for `input` which invokes `App.refresh()`. The query is captured via `getSearchQuery()` and filters the timeline list reactively.

---

## 3. Local Storage and State Management / Persistence Layer

### In the `interface`
- **React State / Hook Manager**: `interface/src/hooks/useDashboardState.js` handles synchronizing the dashboard view data (`user`, `apps`, `apiKeys`, `consents`, `featureConnections`, `status`, `error`) using `useReducer`.
- **LocalStorage State Synchronization**: Inside `WikiPage.jsx`, three distinct arrays are persisted locally:
  - `manualEntries` (key: `"memact_manual_entries"`)
  - `acceptedProposals` (key: `"memact_accepted_proposals"`)
  - `rejectedProposals` (key: `"memact_rejected_proposals"`)
  - Each list initializes by reading from `localStorage` inside useState, and synchronizes back on changes via `useEffect` blocks:
    ```javascript
    useEffect(() => {
      try {
        localStorage.setItem("memact_manual_entries", JSON.stringify(manualEntries))
      } catch (e) {
        console.error("Failed to save manual entries", e)
      }
    }, [manualEntries])
    ```
- **Database Client**: `supabase-access-client.js` and fallback utilities (`supabase-access-fallbacks.js`) read and write dashboard settings (like developer applications, API keys, and app consents) to Supabase tables.
- **Authentication Method State**: Preserves the last auth method type in `localStorage` under `LAST_AUTH_METHOD_KEY` (`"memact_last_auth_method"`).

### In `fitent`
- **IndexedDB Layer**: Implements an asynchronous client-side store `window.IDB` in `fitent/scripts/db.js` using raw IndexedDB APIs (Database: `"Fitent_idb"`, Store: `"state"`).
- **Migration & Cache Logic**: `fitent/scripts/storage.js` coordinates memory access:
  - An in-memory cache `dbCache` is used for synchronous profile, setting, and log reads.
  - `initDB()` checks IndexedDB. If empty, it attempts to load legacy local data from `localStorage.getItem("Fitent_v2")`.
  - If legacy data is found, it copies it to IndexedDB and calls `localStorage.removeItem("Fitent_v2")` to clean up the legacy storage.
- **Mutation Synchronization (Offline-first / Sync Queue)**:
  - All mutating actions (e.g., adding meals, tracking water, changing profile details) update the cached `dbCache` immediately and trigger an asynchronous, non-blocking call to IndexedDB (`window.IDB.put('db', dbCache)`).
  - Simultaneously, if the user is online, the change is pushed to the Express backend (`ApiService`).
  - If offline, mutations are queued in the `dbCache.sync_queue` and the app displays the "Demo Mode Active" banner. Once online, `syncLocalToCloud()` synchronizes the offline queue.
- **Memact Integration & Bridge State**:
  - `sessionStorage` manages temporary integration variables:
    - `"fitent_memact_pending_state"`: Stores the state parameters used to prevent CSRF attacks when redirecting for OAuth authorization.
    - `"fitent_memact_active_state"`: Stores the confirmed connection state parameters once successfully authorized.
  - Connection identifier (`memactConnectionId`), context sync updates, and state markers are written back to the profile record inside `dbCache.profile`.

---

## 4. Build Configurations

### In the `interface` Directory

#### `package.json`
- **Name**: `memact-website`
- **Vite version**: `^8.0.11`
- **React plugin version**: `^6.0.1` (React v19 configuration)
- **Node/NPM Engines**: Requires `node >=24` and `npm >=11`.
- **Scripts**:
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `test`: `node --test` (uses native Node test runner)
- **Dependencies**: `@supabase/supabase-js: ^2.105.4`, `react: ^19.2.6`, `react-dom: ^19.2.6`.

#### `vite.config.js`
- **Plugins**: Uses `@vitejs/plugin-react`.
- **Environment Prefixes**: Configured to parse both `VITE_` and `NEXT_PUBLIC_` prefixed environment variables.
- **Server**: Sets host to `"127.0.0.1"` and port to `3000`.

---

### In the `fitent` Directory

#### `package.json`
- **Name**: `fitent` (version `0.1.0`)
- **Vite version**: `^8.0.14`
- **Node Engines**: Requires `node >=24`.
- **Scripts**:
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `check`: `node scripts/check.mjs` (code quality audit script)
  - `start`: `npx serve .` (serves the static folder)

#### `vite.config.js`
- **Root**: `./`
- **Server Port**: `3000` (with `open: true` to auto-launch the browser).
- **Build parameters**:
  - `outDir`: `"dist"`
  - `emptyOutDir`: `true`
  - `cssCodeSplit`: `false` (forces Vite to bundle all 12+ separate CSS stylesheets into a single CSS build artifact).
  - `sourcemap`: `true`

#### `vercel.json`
- **Build config**: Build command is `npm run build`, output directory is `dist`.
- **Rewrites**:
  - API routes starting with `/api/` are forwarded directly: `/api/(.*)` -> `/api/$1`.
  - All other routes redirect to `/index.html` to support client-side routing.

#### `backend/package.json` (Server-side Build Details)
- **Name**: `Fitent-backend`
- **Dependencies**: Runs a standard Express server with database libraries (`express: ^4.19.2`, `pg: ^8.11.5`), logging/security modules (`winston`, `morgan`, `helmet`, `cors`), and validation/auth systems (`jsonwebtoken`, `bcryptjs`, `express-rate-limit`).
- **Scripts**: `start: node server.js`, `dev: nodemon server.js`.
