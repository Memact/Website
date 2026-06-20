# Memact Website

The user-facing home of Memact. It consists of two parts:
1. **Compounding Identity Story**: A scroll-triggered, interactive explanation of how Memact lets things about you accumulate naturally without profile upkeep.
2. **Dashboard**: A simple workspace for managing approved things and suggestions:
   - **Inbox**: Review pending suggestions from apps and friends.
   - **Junk**: Automatic filter for duplicates, spam, and low-information suggestions.
   - **You**: The list of all approved statements and details saved under your personal address.
   - **Privacy**: Control visibility rules (Public, Friends, Only me).
   - **Settings**: Manage your address handle and account credentials.

## Setup & Running
`ash
npm install
npm run dev
`
"@

    "Access\README.md" = @"
# Memact Access

The gateway and permission layer of Memact. It coordinates how external apps suggest updates and query approved statements.

## Core Responsibilities
- **On-the-spot Approvals**: Receives proposed suggestions from external services and forwards them for immediate approval.
- **Suggestion Filtering (Junk System)**: Detects duplicate, near-duplicate (via Jaccard similarity scoring), and low-information suggestions (like "human" or "likes music") to prevent cluttering the user's Inbox.
- **Access Verification**: Validates queries from connected apps and ensures they only read statements that match their requested scope and visibility rules.
