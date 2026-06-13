# Evidence System Design (`EVIDENCE.md`)

Evidence is a first-class object in Memact. This architecture guarantees that every assertion in the context graph can explain **why** it exists, who contributed it, and what telemetry supports it, without leaking private raw logs.

---

## 1. Evidence Node Schema

Every evidence record is represented as an immutable object linked to a claim:

```json
{
  "evidence_id": "ev_4f923b7e",
  "evidence_type": "telemetry_aggregate",
  "contributor_id": "app_cursor_1",
  "trust_value": 0.85,
  "occurred_at": "2026-06-13T16:00:00Z",
  "assertion_summary": "User edited 35 TypeScript (.ts) files and executed npm run build 5 times across 3 days.",
  "integrity_hash": "sha256-a1b2c3d4e5f6..."
}
```

* **`evidence_type`:**
  - `telemetry_aggregate`: Summarized app actions (e.g. editor files, browsing activity).
  - `onboarding_input`: Direct forms filled by the user.
  - `peer_assertion`: A claim suggested by a connected organization or friend.
* **`trust_value`:** A baseline weight representing the reliability of the source (e.g., direct user input = 1.0, background observation = 0.5).
* **`assertion_summary`:** A human-readable text string that explains the telemetry.
* **`integrity_hash`:** A hash generated from the raw event logs, allowing the origin app to verify that this evidence has not been tampered with.

---

## 2. Privacy Guardrails

To prevent the user's personal context vault from bloating or leaking raw private conversations:

1. **No Raw Log Storage:** Memact does not store chat transcripts, document texts, or raw source code files.
2. **Aggregated Summarization:** Originating agents/apps must summarize behavior *before* sending the proposal.
   - *Forbidden:* `"Evidence: User typed: 'I want to build a React website using TypeScript because Javascript is bad.'"`
   - *Allowed:* `"Evidence: User queried TypeScript/React configuration in 3 consecutive chats."`
3. **Data Quarantine:** If an app sends evidence containing raw secrets, credentials, or sensitive strings, the Access gateway rejects the proposal.

---

## 3. Explainable Context (The "Why" Engine)

Memact must be able to explain to the user and authorized agents exactly why it holds a claim. 

When Yourself renders a claim, or an app queries the context router, they can request the `explain` payload:

```json
{
  "claim_path": "learning.stable_preferences.preferred_format",
  "value": "interactive_exercises",
  "confidence": 0.92,
  "explanation": {
    "summary": "Memact believes your preferred format is interactive exercises.",
    "sources": [
      {
        "source": "Yourself Portal Onboarding",
        "type": "onboarding_input",
        "description": "You explicitly selected 'interactive exercises' on 2026-05-10."
      },
      {
        "source": "Duolingo App Integration",
        "type": "telemetry_aggregate",
        "description": "Completed 12 interactive practice tasks over the last 7 days."
      }
    ]
  }
}
```
If an endpoint cannot output this explanation, the claim's trust model is incomplete.
