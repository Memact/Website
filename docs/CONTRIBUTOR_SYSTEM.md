# Contributor & Reputation System (`CONTRIBUTOR_SYSTEM.md`)

This document defines the roles, domains of authority, trust scores, and reputation-tracking mechanisms for graph contributors.

---

## 1. Contributor Roles & Trust Scores

Not all contributors are equal. Trust scores determine the starting weight $W_{ev}$ of the evidence they supply:

| Role Type | Description | Default Trust | Domain Boundary |
| :--- | :--- | :--- | :--- |
| **User** | The identity owner. Direct input in Yourself. | `1.0` (Absolute) | Universal |
| **First-Party Agent** | System-configured local agents (e.g. Yourself router). | `0.9` | Universal |
| **Domain-Specific Agent** | External specialized agents (e.g. Cursor). | `0.8` | Domain-Locked |
| **General Application** | Third-party integrations (e.g. Fitent, Netflix). | `0.5` | Category-Locked |
| **Peer Identity** | Friends, coworkers, or organizations. | `0.4` | Relationship-Locked |

---

## 2. Domain-Locked Authority (Boundaries)

To prevent a general application or specialized tool from writing over unrelated user preferences:

* **Cursor** is locked to `coding.*`, `development.*`, and `education.learning_goals` (restricted). If Cursor attempts to write a claim to `diet.nutrition`, the Access gateway rejects the proposal.
* **Fitent** is locked to `fitness.*` and `diet.preference`.
* **User** has override authority across all domains and can manually move any claim between statuses.

---

## 3. Reputation & Spam Protection

To prevent malicious or low-quality apps from spamming proposals:

1. **Proposal Rate-Limiting:** Apps are restricted to a maximum of 3 context proposals per user per 24-hour window.
2. **Rejection Scoring:** Every time a user rejects an app's proposal in the Yourself portal, the app's **reputation multiplier** for that user decreases:
   
   $$\text{Reputation} = \max\left(0.1, 1.0 - 0.15 \times R_{\text{rejected}}\right)$$

   Where $R_{\text{rejected}}$ is the count of consecutive user rejections.
3. **Automatic Quarantine:** If an app's reputation score drops below `0.4`, all subsequent proposals are automatically blocked from entering the Yourself portal review queue.
4. **Restoring Reputation:** Reputation slowly restores (+0.05 per week) if the app submits no rejected proposals.
