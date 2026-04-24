# Memact Platform Contract

Version: `0.1.0`

This contract keeps Memact usable beyond the website.
Website, Android, and future APIs should all use the same evidence shapes.

## Flow

```text
Capture -> Inference -> Schema -> Website Client -> Influence / Origin -> Explanation
```

The Website client is only one surface.
Android should become another surface over the same contracts.
An API explanation layer should only format evidence that deterministic engines already found.

## Runtime Context

`memact.runtime_context` describes the client and what it can do.

```json
{
  "contract": "memact.runtime_context",
  "version": "0.1.0",
  "surface": "website",
  "mode": "extension",
  "platform": {
    "mobile": false,
    "extension_capable": true,
    "standalone": false
  },
  "capabilities": {
    "local_capture": true,
    "local_web_memory": false,
    "android_client_ready": true,
    "api_explanation_ready": true,
    "deterministic_evidence_required": true
  }
}
```

Android can use the same shape with:

```json
{
  "surface": "android",
  "mode": "native-capture"
}
```

## Knowledge Envelope

`memact.knowledge_envelope` is the shared local knowledge object.
It keeps raw evidence and derived layers together without hiding what came from where.

```json
{
  "contract": "memact.knowledge_envelope",
  "version": "0.1.0",
  "source": {
    "system": "capture",
    "schema_version": 1
  },
  "snapshot": {},
  "inference": {},
  "schema": {},
  "influence": {},
  "suggestionSeed": [],
  "stats": {
    "eventCount": 0,
    "activityCount": 0,
    "sessionCount": 0,
    "schemaCount": 0,
    "influenceCount": 0
  }
}
```

Rules:

- `snapshot` must come from Capture's public snapshot contract.
- `inference`, `schema`, and `influence` must be deterministic outputs.
- No client should read Capture internals directly.
- No explanation layer should invent sources.

## Thought Explanation

`memact.thought_explanation` is the deterministic answer object for a user thought.

```json
{
  "contract": "memact.thought_explanation",
  "version": "0.1.0",
  "query": "I need to prove myself",
  "deterministic": true,
  "answer": {},
  "origin": {},
  "relevantSchemas": [],
  "relevantInfluence": [],
  "apiExplanationRequest": {}
}
```

The visible product can render `answer`.
An API can consume `apiExplanationRequest` later for better language.

## API Explanation Request

`memact.api_explanation_request` is designed for a future hosted explanation API.

```json
{
  "contract": "memact.api_explanation_request",
  "version": "0.1.0",
  "query": "I need to prove myself",
  "policy": {
    "ai_role": "language_formatting_only",
    "deterministic_reasoning_done": true,
    "must_not_invent_sources": true,
    "must_not_claim_causality": true,
    "must_preserve_uncertainty": true
  },
  "deterministic_answer": {},
  "evidence": {
    "origin_sources": [],
    "schema_signals": [],
    "influence_signals": []
  },
  "stats": {}
}
```

AI can improve wording only after the deterministic evidence exists.
If evidence is weak, the API must say that plainly.

## Android Readiness

Android should not copy Website logic.
It should implement or call these same boundaries:

- Capture-like native source creates the Capture snapshot shape.
- Deterministic engines consume the snapshot.
- Client stores `memact.knowledge_envelope`.
- Search/query returns `memact.thought_explanation`.
- Optional API receives `memact.api_explanation_request`.

This keeps Website, Android, and API output aligned.
