import React from "react"

export function PublicWikiPage({ username }) {
  return (
    <section className="dashboard public-wiki-page">
      <section className="panel help-panel">
        <div>
          <p className="eyebrow">Public memory</p>
          <h2>{username ? `${username}'s shared page` : "Shared page"}</h2>
          <p className="muted">Only entries a user explicitly made shareable or public should appear here.</p>
        </div>
        <div className="permission-list wiki-entry-panel">
          <p className="eyebrow">Shared entries</p>
          <p className="muted">No public entries are available from this local page yet.</p>
        </div>
        <p className="muted public-wiki-footer">Powered by Memact.</p>
      </section>
    </section>
  )
}
