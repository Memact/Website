import React from "react"

export function DeveloperStatsPanel({
  apps = [],
  apiKeys = [],
  consents = [],
  featureConnections = []
}) {
  const activeApps = apps.filter((app) => !app.revoked_at)
  const activeKeys = apiKeys.filter((key) => !key.revoked_at)
  const activeConsents = consents.filter((consent) => !consent.revoked_at)
  const revokedConsents = consents.filter((consent) => consent.revoked_at)
  const connectedFeatures = featureConnections.filter((connection) => !connection.disconnected_at)
  const lastKeyUse = apiKeys
    .map((key) => key.last_used_at)
    .filter(Boolean)
    .sort()
    .at(-1)

  const cards = [
    { label: "Apps", value: activeApps.length, note: "Created by this developer account." },
    { label: "Active API keys", value: activeKeys.length, note: "Keys that have not been revoked." },
    { label: "Consented users", value: activeConsents.length, note: "Connections that are still active." },
    { label: "Revoked consent", value: revokedConsents.length, note: "Connections users or apps stopped." },
    { label: "Allowed memory reads", value: connectedFeatures.length, note: "Feature-style connections tied to app keys." },
    { label: "Last key use", value: lastKeyUse ? formatDate(lastKeyUse) : "No use yet", note: "Most recent API key usage signal." }
  ]

  return (
    <section className="dashboard stats-page">
      <section className="panel">
        <p className="eyebrow">Stats</p>
        <h2>App-level activity.</h2>
        <p className="muted">Only stats for your own apps appear here. Memact does not show a user's full Yourself page to developers.</p>

        <div className="stats-card-grid">
          {cards.map((card) => (
            <article className="mini-row stats-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Memory proposals</p>
        <h2>Memory writes stay user-controlled.</h2>
        <div className="stats-card-grid">
          <article className="mini-row stats-card">
            <span>Proposed</span>
            <strong>0</strong>
            <small>Entries your apps asked users to remember.</small>
          </article>
          <article className="mini-row stats-card">
            <span>Accepted</span>
            <strong>0</strong>
            <small>Entries users accepted without edits.</small>
          </article>
          <article className="mini-row stats-card">
            <span>Edited</span>
            <strong>0</strong>
            <small>Entries users changed before accepting.</small>
          </article>
          <article className="mini-row stats-card">
            <span>Rejected</span>
            <strong>0</strong>
            <small>Entries users rejected or deleted.</small>
          </article>
        </div>
        <p className="muted stats-note">Detailed proposal telemetry needs the memory event stream. This panel is app-scoped and intentionally does not expose private entries.</p>
      </section>
    </section>
  )
}

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value))
  } catch {
    return "Used before"
  }
}
