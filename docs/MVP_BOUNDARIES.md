# MVP Boundaries & Evolution Roadmap (`MVP_BOUNDARIES.md`)

This roadmap defines the phases of the Memact product roll-out, enforcing strict scope boundaries for each release to ensure a fast path to product-market fit (PMF).

---

## 1. Phase 0: MVP – Developer Profiles (Focus: PMF for Dev Tools)

* **Goal:** Solve the context fragmentation issue specifically for software developers working across multiple AI agents (Cursor, VS Code, shell clients, chat UIs).
* **In Scope:**
  - Standardized JSON developer profile containing language, formatting, naming, and comment rules.
  - Adjacency file linkage (`file:../schema`) for local developer directories.
  - A basic local matching engine (`LocalContextMatcher`) to resolve spelling mistakes.
  - `/v1/context/query` endpoint.
* **Out of Scope:** Multi-perspective graph databases, organization credentials, reputation engines, or decentralized ID protocols.
* **Why it matters:** Developers are early adopters of AI tools and immediately feel the pain of copy-pasting `.cursorrules` or instructions between Cursor, ChatGPT, and Claude.

---

## 2. Phase 1: V1 – Portable Context Network (Focus: App Onboarding)

* **Goal:** Enable third-party application integration and standard context onboarding prefill.
* **In Scope:**
  - Multi-app API key registry and connection consent controls inside Yourself.
  - App-specific CAP queries.
  - Direct context proposal suggestions (proposed by apps, reviewable in Yourself).
  - Integration with the Fitent fitness demo app.
* **Out of Scope:** Time-decayed confidence scoring, peer-to-peer sharing, or public URLs.

---

## 3. Phase 2: V2 – Multi-Perspective Identity Graph (Focus: Dynamic Context)

* **Goal:** Deploy the full graph data model with contributors, claims, and time-decayed evidence.
* **In Scope:**
  - Claims status database schema (`proposed`, `active`, `stale`, `archived`).
  - Time-decayed confidence calculations.
  - Trust coefficients for contributors.
  - An audit trail explaining **why** a claim is believed.
* **Out of Scope:** Zero-knowledge verification and peer-to-peer decentralized networks.

---

## 4. Phase 3: Long-Term – Decentralized Identity Web

* **Goal:** Make context completely user-owned and secure.
* **In Scope:**
  - Decentralized Identifiers (DIDs) and Verifiable Credentials.
  - Zero-Knowledge proofs for attributes (verifying preferences/skills without leaking logs).
  - End-to-end encrypted personal cloud storage vaults.
