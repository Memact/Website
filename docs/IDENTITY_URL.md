# Identity URL Architecture (`IDENTITY_URL.md`)

The user's identity URL (`username.memact.me`) is the gateway to their portable context graph. It acts as a routing discovery document, a browser-readable portfolio page, and a secure client endpoint.

---

## 1. Multi-Purpose Protocol Resolution

When a client queries the Identity URL, the gateway resolves the request depending on HTTP headers:

```txt
HTTP Request -> username.memact.me
                 │
                 ├─ [Accept: text/html] ───────────> Public Portfolio (Wiki Portal)
                 ├─ [Accept: application/json] ────> DID Discovery Document
                 └─ [Accept: application/mcp+json] ─> Model Context Protocol Gateway
```

---

## 2. Browser View: Public Portfolio

If accessed by a standard web browser, the URL resolves to a static, minimal, and premium portfolio:
* **Base Theme:** Dark theme (`#00011B`, rounded cards, clean SVG icons, no decorative AI emojis).
* **Content:** Displays only **public-approved claims** (e.g. verified certifications, open-source accomplishments, and public bio fields).
* **Privacy:** All private/vault/agents-only context claims are excluded from the HTML build.

---

## 3. Discovery Document: JSON Metadata

If queried by an application or SDK client via `GET` with `Accept: application/json`, it returns the discovery profile:

```json
{
  "@context": "https://w3id.org/did/v1",
  "id": "did:memact:username",
  "verificationMethod": [
    {
      "id": "did:memact:username#key-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:memact:username",
      "publicKeyMultibase": "z6MkmL..."
    }
  ],
  "service": [
    {
      "id": "did:memact:username#cap-gateway",
      "type": "ContextAccessProtocolService",
      "serviceEndpoint": "https://api.memact.me/v1/cap/query"
    },
    {
      "id": "did:memact:username#mcp-server",
      "type": "ModelContextProtocolService",
      "serviceEndpoint": "https://api.memact.me/v1/mcp/username"
    }
  ],
  "public_context_categories": ["coding.skills", "education.certifications"]
}
```

---

## 4. Model Context Protocol (MCP) Integration

To allow AI systems (like Claude Desktop, Cursor, or Gemini) to dynamically load the user's coding/development preferences:
* The URL points to the user's local or hosted **MCP Server endpoint**.
* Authorized agents query the MCP endpoint to fetch context files (e.g., `.cursorrules`, coding constraints) dynamically.
* The MCP server automatically returns only the subset of claims configured as `Agents-Only` or `Public` for the category `coding.*`.
