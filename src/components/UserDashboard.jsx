import React from "react"

export function UserDashboard({ consents = [], apps = [], onRevokeConsent, isConsentShell = false }) {
  const activeConsents = consents.filter((consent) => !consent.revoked_at)
  const revokedConsents = consents.filter((consent) => consent.revoked_at)

  return (
    <section className="dashboard user-dashboard">
      <section className="panel">
        <h2>Your connected apps</h2>
        {isConsentShell ? (
          <p className="notice" role="status">This is a lightweight consent account. Finish account setup later to manage Yourself and settings.</p>
        ) : null}

        <div className="user-consent-list">
          {activeConsents.map((consent) => {
            const app = apps.find((item) => item.id === consent.app_id)
            return (
              <article className="permission-list user-consent-card" key={consent.id}>
                <div>
                  <h3>{app?.name || "Connected app"}</h3>
                  {app?.description ? <p className="muted">{app.description}</p> : null}
                </div>
                <div className="consent-chip-row">
                  {(consent.scopes || []).slice(0, 4).map((scope) => <span className="badge" key={scope}>{scope}</span>)}
                  {(consent.categories || []).slice(0, 4).map((category) => <span className="badge" key={category}>{category}</span>)}
                </div>
                <div className="connect-actions">
                  <button type="button" className="ghost subtle-danger" onClick={() => onRevokeConsent?.(consent.id)}>Remove access</button>
                </div>
              </article>
            )
          })}
          {!activeConsents.length ? (
            <section className="permission-list">
              <h3>No connected apps yet</h3>
              <p className="muted">Open Connect Memact from an app to approve or deny access.</p>
            </section>
          ) : null}
        </div>
      {revokedConsents.length ? (
        <section className="user-dashboard-subsection">
          <h2>Removed app access</h2>
          <div className="user-consent-list">
            {revokedConsents.map((consent) => (
              <article className="permission-list user-consent-card" key={consent.id}>
                <strong>{apps.find((item) => item.id === consent.app_id)?.name || "App"}</strong>
                <p className="muted">Access removed {formatDate(consent.revoked_at)}.</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      </section>
    </section>
  )
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "recently"
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}
