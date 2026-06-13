# Context Router & CAP API (`CONTEXT_ROUTER.md`)

This document defines the stateful context query routing, relevance evaluation, and audit procedures inside the Access gateway.

---

## 1. Route: `POST /v1/context/query`

An external agent or application calls this endpoint to retrieve relevant, consented user context for a task.

### Request Body
```json
{
  "requested_context": [
    {
      "description": "Preferred coding programming language",
      "field_hint": "coding.languages.preferred",
      "required": true
    }
  ],
  "activity_categories": ["coding"],
  "connection_id": "conn_f9a83b",
  "purpose": "Personalize autocomplete suggestions inside code editor",
  "threshold": 0.12
}
```

---

## 2. Stateful Evaluation Flow

Upon receiving a request, the Access gateway processes it statefully:

```txt
POST Request ────────> [Verify API Key & Scope: memory:read_summary]
                             │
                             ▼
                       [Load Consent Policy for connection_id]
                             │
                             ▼
                       [Fetch data.memory_records from Memory Store]
                             │
                             ▼
                       [Filter records using filterCapMemory()]
                             │
                             ▼
                       [Execute LocalContextMatcher]
                             │
                             ▼
                       [Return allowed_context packet]
```

1. **Gatekeeping Scopes:** Verify that the API key holds the `memory:read_summary` scope.
2. **Consent Policy:** Check if the user has granted consent to the app for the specified `activity_categories` (`coding`).
3. **Internal Retrieval:** Query `data.memory_records` from the user's encrypted Memory Store.
4. **Category & Connection Filtering:** Run the `filterCapMemory` helper to:
   - Exclude sensitive fields (unless explicitly allowed).
   - Exclude records that are not in the approved categories.
   - Filter out revoked, stale, or archived claims.
5. **Relevance Matching:** Call `LocalContextMatcher` to match the `requested_context` against the filtered memory records.
6. **Return Packet:** Return the matched fields.

---

## 3. Auditing & Purpose Verification

* **Audit Logging:** Every call to `POST /v1/context/query` registers an entry in the user's `memact_audit_log` including the `purpose` string.
* **Malicious Behavior Flagging:** If an app repeatedly requests fields that do not align with its registered categories or queries different categories using the same `purpose`, the Yourself engine flags the connection for review, prompting the user to confirm or revoke the app's consent.
