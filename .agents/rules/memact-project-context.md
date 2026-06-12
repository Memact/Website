# Memact project context

## Start here

Memact is not an AI-wrapper startup.
Memact is not an intent-prediction product.
Memact is not a browser extension product.

Memact helps users see and control what apps know about them.

Current public framing:

```txt
Your Identity.
Your Choice.

See what apps know about you and control it.
```

Older tagline `Personalization made better with Memact` is obsolete.

Product feeling:

```txt
Memact is a playground where apps personalize around what users choose.
```

Use this carefully. It is product feeling, not a repo named Playground.

## Current repo spine

```txt
Access -> Wiki -> Context -> Memory -> SDK -> Apps
```

Actual product loop:

```txt
App sends or proposes context.
Access checks permission.
Context gives the context a readable shape.
Yourself shows it to the user.
The user accepts, edits, rejects, or deletes.
Memory stores accepted context.
SDK lets apps read only allowed context.
Apps personalize better.
```

## Active repos

- `interface`: Website. Public site, auth, developer portal, user portal, consent, Yourself, Settings, Help.
- `Access`: API gateway and permission layer. Apps, API keys, consent, CAP, context proposals, credits, verification.
- `schema`: Current Context repo. Open-source context category layer. Formerly Schema. Defines categories, groups, matching helpers, and context shaping.
- `memory`: Stores accepted memory and retrieval-ready context. Should not expose raw full profiles by default.
- `contracts`: Shared object shapes and validators.
- `sdk`: Server-side SDK apps use to request access, propose context, read allowed context, and call CAP.
- `wiki`: Domain model for user-controlled memory governance.
- `fitent`: Demo/customer app showing Memact integration for fitness onboarding.
- `.github`: Org profile and GitHub-facing docs.

## Retired or non-core repos

- `capture`: retired, not current core.
- `inference`: retired, not current core.
- `Extension`: archived/retired, not required.
- `playground`: retired as feature-runtime repo.
- `intent`: archived. Do not revive Intent as a core layer.
- `LandingPage`, `Influence`, `Origin`: archived.
- `AutoMod`: separate community/server ops bot. Do not touch unless explicitly asked.

## Naming rules

- Use `Context`, not `Schema`, in new user/dev copy.
- If old code still says schema for compatibility, do not blindly break imports.
- Mention `formerly Schema` in contributor docs if needed.
- Do not use `Playground features` as current architecture.
- Do not use `Data Transparency` as a product surface name. The user surface is `Yourself`.
- `Yourself` means what apps know about the user.
- `Settings` contains apps, privacy, sharing, account, and developer/user switching.

## User-facing language

Use:

- Apps ask first.
- You choose what an app can know.
- You can edit or delete what apps know.
- Apps only get what you allow.
- Connect Memact.
- Revoke anytime.
- What apps know about you.

Avoid:

- infrastructure
- middleware
- context substrate
- semantic layer
- AI-powered
- next-generation
- unlock
- empower
- seamless
- contextual intelligence
- intent prediction
- permissioned infrastructure
- schema packets in beginner/user pages
- vague words like `signals` unless immediately explained as app-proposed context or activity evidence

## Product doctrine

Apps already build memory about users.
Today that memory is usually hidden, app-specific, hard to fix, and repeated in every app.

Memact should make this memory:

- visible
- editable
- portable
- permissioned
- revocable
- useful for apps

Important line:

```txt
Activity is not identity.
```

Apps may propose context from behavior, but users decide what becomes accepted memory.

## Yourself UX rules

Yourself is user-facing. It must not look like a developer console.

The page should help with the blank-slate problem:

- User says what they are trying to do.
- Example: `I am looking for a laptop`.
- Memact finds relevant groups and fields.
- Memact shows what is already saved.
- Memact asks only for missing details.
- User saves or rejects those details.

Context should be grouped and subgrouped.

Examples:

- Shopping
- Shopping / Laptop needs
- Shopping / Budget
- Fitness / Diet
- Fitness / Goals
- Learning / Study style
- Identity / Usernames
- Identity / Languages

Avoid flat piles of entries.
Avoid panel-name soup.
Use clear headers and subheaders.
Keep copy minimal.

## Memact-native UI rules

Before adding any element, ask:

```txt
Is this Memact-native?
```

Memact-native means:

- dark base `#00011B`
- rounded cards and buttons
- quiet borders
- no random white selected states
- no browser-native dropdown/date UI if it looks foreign
- consistent header size and spacing across tabs
- consistent subheader size and spacing across tabs
- mobile buttons fill panel width
- desktop destructive buttons do not become giant bars
- no decorative info panels unless they help the user act

Do not add random panels that only explain obvious things.
Do not add filler descriptions under every card.

## Account split

Developer accounts:

- Dashboard
- Settings
- Help

Developer area is for app registration, API keys, setup, consent/app access, and integration.

User accounts:

- Yourself
- Settings
- Help

User area is for seeing what apps know, adding context, approving/rejecting suggestions, connected apps, revoke controls, account settings.

Existing accounts without explicit `account_type` default to developer.

Users and developers can switch account type safely. Switching should not delete existing data.

## CAP

CAP means Context Access Protocol.
It is internal/backend language, not user-facing branding.

CAP lets an app ask:

```txt
What approved context can this user share for this task?
```

CAP must never return full user profiles.
CAP packets should be small, task-specific, and permissioned.

Forbidden by default:

- full profile dumps
- raw capture events
- unapproved memory
- unrelated categories
- sensitive fields unless explicitly allowed

## Fitent integration

Fitent is the current demo/customer app.

Fitent should:

- use server-side Memact API key only
- start with `Connect Memact`
- request approved fitness/diet context through CAP when possible
- fall back gracefully if CAP is unavailable
- fill known onboarding fields
- ask only missing onboarding fields
- propose newly saved fitness details back to Memact
- keep working if user denies Memact consent

Required server env:

```txt
MEMACT_BASE_URL
MEMACT_API_KEY
MEMACT_APP_ID
MEMACT_SESSION_SECRET
MEMACT_TIMEOUT_MS
```

Never expose `MEMACT_API_KEY` in browser code.

## AI rules

Memact may use AI later, but:

- Do not build a chatbot.
- Do not make Memact an AI wrapper.
- Do not call paid/cloud AI APIs unless explicitly requested.
- Do not send full user profiles to any model.
- Memact AI should be memory-blind by default.
- Future workers should receive only tiny approved task context packets.
- Prefer deterministic logic or local matching first.

## Git and safety

Do not touch archived repos unless explicitly asked.
Do not revert user changes without permission.
Do not use destructive git commands.
Keep one clean commit per repo when possible.
Run checks/builds for modified repos.

For Memact workspace work, if validation passes and pushing is safe, push after committing.
