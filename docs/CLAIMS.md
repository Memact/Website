# Claims System Architecture (`CLAIMS.md`)

This document defines the lifecycle, status models, confidence evaluation, and conflict resolution mechanisms for context graph claims.

---

## 1. Claim Status Model & Transitions

Claims transition through a state machine driven by fresh evidence, user action, and temporal decay:

```txt
  [Proposed] ────────────(User Approves / Auto-Rule)───────────> [Active]
      │                                                             │
      │                                                             ▼
      ├──────(User Rejects)──> [Archived] <──(Declining Evidence)── [Stale]
      │
      └──────(Merge Conflict)──> [Superseded]
```

* **Proposed:** Asserted by an app or agent. Visible only to the user in Yourself suggestions.
* **Active:** Approved. Served to connected apps under authorized categories.
* **Stale:** Claim has had no fresh evidence backing it and is past the decay threshold.
* **Archived:** Deleted, revoked, or rejected. Ignored in all query scopes.
* **Superseded:** Replaced by a more recent, high-confidence conflicting claim.

---

## 2. Confidence Evaluation & Temporal Decay

A claim's confidence score $C(c)$ is a function of the quality of its supporting evidence and the time elapsed since the last evidence was registered:

$$C(c) = W_{ev}(c) \times e^{-\lambda t}$$

Where:
* **$W_{ev}(c)$ (Evidence Quality Weight):** The sum of the trust values of all active supporting evidence nodes (capped at `1.0`).
* **$\lambda$ (Decay Rate):** The coefficient of decay, defining how fast the claim goes stale. Different categories use different half-lives:
  - **Hard Constraints** (e.g. `identity.preferred_name`, `learning.stable_preferences`): $\lambda \approx 0$ (essentially infinite half-life; never decays unless explicitly changed).
  - **Dynamic Preferences** (e.g. `shopping.laptop.budget`): $\lambda$ corresponding to a 3-month half-life.
  - **Temporary Curiosity** (e.g. `shopping.disliked_categories`): $\lambda$ corresponding to a 14-day half-life.
* **$t$:** The time elapsed since the most recent evidence node was linked.

---

## 3. Conflict Resolution

When multiple contributors assert conflicting values for the same `ContextNode` (e.g., Cursor asserts `TypeScript` as favorite, and another agent asserts `Rust`):

1. **Calculate Confidence Weights:** Compute the confidence score $C(c)$ for both conflicting claims.
2. **Auto-Transition (Threshold Gated):**
   - If one claim has a significantly higher confidence ($C(c_1) - C(c_2) \ge 0.35$), the higher-confidence claim becomes **Active** and the lower-confidence claim becomes **Superseded**.
3. **Equilibrium Hold:**
   - If the difference is below the threshold, both claims remain active under different perspectives (e.g., `Cursor View: TypeScript` and `Rust View: Rust`).
   - When queried, the gateway returns a list of values ordered by confidence or asks the Yourself portal to prompt the user to resolve the tie.

### Example: Evolving Preferences
* **Initial State:** User likes crypto. 10 evidence logs from 2024. Confidence $C(c) = 0.95$.
* **Evolution:** User changes topic, starts researching system design in 2026. Evidence nodes for system design start accumulating.
* **Resolution:** Because of temporal decay, the 2024 crypto evidence weight decays ($e^{-\lambda t} \to 0$), while the fresh 2026 system design evidence is at peak strength. The graph automatically shifts the active preference pointer.
