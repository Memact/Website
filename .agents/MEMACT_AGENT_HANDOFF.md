# Memact agent handoff prompt

Use this when starting a new agent that does not already know Memact.

```txt
You are working across the Memact workspace.

Before changing code, read:

- .agents/AGENTS.md
- .agents/rules/memact-project-context.md

Then inspect the specific repo you will modify. Do not skip discovery, but do not rediscover retired architecture as if it is current.

Current Memact direction:

Memact helps users see and control what apps know about them.

Public framing:

Your Identity.
Your Choice.

See what apps know about you and control it.

Current spine:

Access -> Wiki -> Context -> Memory -> SDK -> Apps

Product loop:

App sends or proposes context.
Access checks permission.
Context gives it a readable shape.
Yourself shows it to the user.
The user accepts, edits, rejects, or deletes.
Memory stores accepted context.
SDK lets apps read only allowed context.
Apps personalize better.

Do not revive:

- Intent as core product
- Capture as core product
- Inference as core product
- Extension as required
- Playground as feature-runtime architecture
- Data Transparency as main product surface

Use Context, not Schema, for new naming. If old code still needs schema compatibility, keep compatibility carefully.

User-facing copy must be simple:

- Apps ask first.
- You choose what an app can know.
- You can edit or delete what apps know.
- Apps only get what you allow.
- Connect Memact.
- Revoke anytime.

Avoid:

- AI-powered
- infrastructure
- middleware
- context substrate
- semantic layer
- intent prediction
- permissioned infrastructure
- unlock / empower / seamless / next-generation
- vague signals without saying what they are

UI rule:

Every element must feel Memact-native:

- dark #00011B base
- rounded cards/buttons
- quiet borders
- no random white selected states
- no native dropdown/date UI that looks foreign
- consistent headers/subheaders
- minimal content
- no info-panel soup

Yourself is the user-facing place for what apps know about the user.
Settings contains apps, privacy, sharing, account, and portal switching.

Blank-slate problem:

Do not make users manually build a profile from zero.
Let users type a goal like "I am looking for a laptop".
Memact should find relevant groups/fields, show what is saved, ask only missing details, and save user-approved answers.

CAP:

CAP is internal: Context Access Protocol.
Apps ask for small approved context packets.
Never return full profiles, raw capture events, unrelated categories, or unapproved memory.

Fitent:

Fitent is the current demo/customer app.
It should work by adding server env vars:

MEMACT_BASE_URL
MEMACT_API_KEY
MEMACT_APP_ID
MEMACT_SESSION_SECRET
MEMACT_TIMEOUT_MS

API key stays server-side only.
Fitent should use Connect Memact, retrieve approved fitness/diet context, ask missing onboarding fields, and propose new fields back to Memact.

Always run checks/builds for modified repos.
Do not touch archived repos unless explicitly asked.
Do not use destructive git commands.

```
