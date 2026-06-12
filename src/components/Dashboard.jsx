import React, { useState } from "react"
import { CategoryGrid } from "./CategoryGrid.jsx"
import { Chevron } from "./Chevron.jsx"
import { HelpPanel } from "./HelpPanel.jsx"
import { PasswordField } from "./PasswordField.jsx"
import { getAvatarUrl, getInitials, getUserEmail, getUserProvider } from "../user-display.js"
import { MemactSelect } from "./WikiPage.jsx"

export function Dashboard({
  activeTab,
  accountType = "developer",
  isConsentShell = false,
  user,
  authUser,
  apps,
  apiKeys,
  consents,
  policy,
  scopes,
  categories,
  selectedAppId,
  selectedScopes,
  newAppName,
  newAppDescription,
  newAppDeveloperUrl,
  newAppRedirectUrl,
  selectedCategories,
  oneTimeKey,
  oneTimeKeyScopes,
  oneTimeKeyCategories,
  apiTestResult,
  showAppForm,
  setSelectedAppId,
  setSelectedScopes,
  setNewAppName,
  setNewAppDescription,
  setNewAppDeveloperUrl,
  setNewAppRedirectUrl,
  setSelectedCategories,
  setShowAppForm,
  onCreateApp,
  onUpdateApp,
  onDeleteApp,
  onGrantConsent,
  onCreateKey,
  onRevokeKey,
  onCopyKey,
  onTestKey,
  onRevokeConsent,
  onSignOut,
  authLoading,
  needsPasswordSetup,
  setupPassword,
  setupPasswordConfirm,
  passwordState,
  passwordSuccess,
  setSetupPassword,
  setSetupPasswordConfirm,
  onSetPassword,
  newEmailAddress,
  setNewEmailAddress,
  emailChangeSuccess,
  authFlow,
  onChangeEmail,
  displayName,
  displayNameDraft,
  setDisplayNameDraft,
  displayNameSuccess,
  onUpdateDisplayName,
  accountTypeSuccess,
  onSwitchAccountType,
  deleteAccountSuccess,
  onRequestAccountDeletion,
  inviteEmail,
  setInviteEmail,
  inviteSuccess,
  onInviteUser
}) {
  const hasApps = apps.length > 0
  const [isEditingApp, setIsEditingApp] = useState(false)
  const isCreatingApp = (showAppForm || !hasApps) && !isEditingApp
  const selectedApp = hasApps ? apps.find((app) => app.id === selectedAppId) : null
  const selectedKeys = apiKeys.filter((key) => key.app_id === selectedAppId)
  const activeKeys = selectedKeys.filter((key) => !key.revoked_at)
  const revokedKeys = selectedKeys.filter((key) => key.revoked_at)
  const usageStats = getUsageStats(selectedApp, selectedKeys, apps)
  const selectedConsent = consents.find((consent) => consent.app_id === selectedAppId && !consent.revoked_at)
  const scopesChanged = selectedConsent ? !sameValues(selectedScopes, selectedConsent.scopes) : true
  const categoriesChanged = selectedConsent ? !sameValues(selectedCategories, selectedConsent.categories || []) : true
  const consentChanged = scopesChanged || categoriesChanged
  const canCreateKey = Boolean(selectedAppId && selectedConsent && !consentChanged && selectedScopes.length && selectedCategories.length)
  const permissionsHint = !selectedAppId
    ? "Create app first."
    : selectedConsent
      ? consentChanged
        ? "Save permissions first."
        : ""
      : "Save permissions first."
  const createKeyHint = !selectedAppId
    ? "Create app first."
    : !selectedConsent
      ? "Save permissions first."
      : consentChanged
        ? "Save permissions first."
        : ""
  const appHeading = isCreatingApp
    ? hasApps ? "Create a new app" : "Start by naming your app and choosing what it can ask for"
    : isEditingApp && selectedApp
    ? `Edit settings for ${selectedApp.name}`
    : selectedApp?.name || "Select an app"

  const filteredCategories = Object.fromEntries(
    Object.entries(categories || {}).filter(([key]) => !key.includes(":"))
  )
  const filteredScopes = Object.fromEntries(
    Object.entries(scopes || {}).filter(([key]) => {
      return !key.startsWith("capture:") &&
             !key.startsWith("feature:") &&
             !key.startsWith("platform:") &&
             !key.startsWith("schema:") &&
             !key.startsWith("graph:")
    })
  )

  const provider = getUserProvider(user, authUser)
  const isUserAccount = accountType === "user"
  const avatar = getAvatarUrl(user, authUser)
  const displayEmail = getUserEmail(user, authUser)
  const initials = getInitials(displayName, displayEmail)
  const [accountEditor, setAccountEditor] = useState(authFlow === "recovery" || needsPasswordSetup ? "password" : "")
  const [editAppName, setEditAppName] = useState("")
  const [editAppDescription, setEditAppDescription] = useState("")
  const [editAppDeveloperUrl, setEditAppDeveloperUrl] = useState("")
  const [editAppRedirectUrl, setEditAppRedirectUrl] = useState("")
  const startEditingApp = () => {
    if (!selectedApp) return
    setEditAppName(selectedApp.name || "")
    setEditAppDescription(selectedApp.description || "")
    setEditAppDeveloperUrl(selectedApp.developer_url || "")
    setEditAppRedirectUrl(selectedApp.redirect_urls?.[0] || "")
    setIsEditingApp(true)
  }

  const showDisplayNameEditor = accountEditor === "display-name"
  const showPasswordEditor = accountEditor === "password"
  const showEmailEditor = accountEditor === "email"
  const showInviteEditor = accountEditor === "invite"
  const hasDisplayName = Boolean(displayNameDraft.trim())
  const displayNameAction = hasDisplayName ? "Change name" : "Set display name"
  const changeOptions = [
    { id: "display-name", label: displayNameAction },
    provider === "email" ? { id: "email", label: "Change email" } : null,
    { id: "password", label: needsPasswordSetup ? "Set password" : "Change password" },
    isUserAccount ? null : { id: "invite", label: "Invite user" }
  ].filter(Boolean)
  const activeChangeLabel = changeOptions.find((option) => option.id === accountEditor)?.label || "Choose a setting"

  const chooseAccountEditor = (editor) => {
    setAccountEditor(accountEditor === editor ? "" : editor)
  }

  return (
    <section className="dashboard">
      {activeTab === "help" ? (
        <HelpPanel />
      ) : activeTab === "account" ? (
        <section className="panel account-panel">
          <div className="account-panel-head">
            <div>
              <h2>Your Memact settings</h2>
            </div>
          </div>
          {isConsentShell ? (
            <p className="notice" role="status">We found approved app access for this email. Set a password to open your Memact account.</p>
          ) : null}
          <div className="identity-card">
            {avatar ? <img src={avatar} alt="" /> : <span aria-hidden="true">{initials}</span>}
            <div>
              <h2>{displayName}</h2>
              <p className="identity-meta">
                {displayEmail ? <span>{displayEmail}</span> : null}
              </p>
            </div>
          </div>
          <section className="password-panel account-editor-panel account-action-panel">
            <div>
              <h2>Sign out</h2>
            </div>
            <button type="button" className="ghost subtle-danger sign-out-button" onClick={onSignOut}>Sign out</button>
          </section>
          <section className="password-panel account-editor-panel account-type-panel">
            <div>
              <h2>Choose how you use Memact</h2>
            </div>
            {accountTypeSuccess ? <p className="notice notice-success" role="status">{accountTypeSuccess}</p> : null}
            <div className="account-type-switcher" role="group" aria-label="Account type">
              <button
                type="button"
                className={isUserAccount ? "account-type-card is-active" : "account-type-card"}
                disabled={authLoading === "account-type"}
                onClick={() => onSwitchAccountType?.("user")}
              >
                <span className="account-type-card-marker" aria-hidden="true" />
                <span className="account-type-card-copy">
                  <strong>User</strong>
                  <span>Manage what apps know about you.</span>
                </span>
              </button>
              <button
                type="button"
                className={!isUserAccount ? "account-type-card is-active" : "account-type-card"}
                disabled={authLoading === "account-type"}
                onClick={() => onSwitchAccountType?.("developer")}
              >
                <span className="account-type-card-marker" aria-hidden="true" />
                <span className="account-type-card-copy">
                  <strong>Developer</strong>
                  <span>Build apps with Memact.</span>
                </span>
              </button>
            </div>
          </section>
          {isUserAccount ? (
            <UserSettingsSections apps={apps} consents={consents} onRevokeConsent={onRevokeConsent} />
          ) : null}
          <div className="wiki-field settings-select-container">
            <span>Settings</span>
            <MemactSelect
              label="Choose a setting"
              value={accountEditor}
              options={[
                { value: "", label: "Choose a setting" },
                ...changeOptions.map((option) => ({ value: option.id, label: option.label }))
              ]}
              onChange={setAccountEditor}
            />
          </div>
          {showDisplayNameEditor ? (
            <section className="password-panel account-editor-panel display-name-panel">
              <div>
                <h2>{hasDisplayName ? "Change your name" : "Set your display name"}</h2>
              </div>
              {displayNameSuccess ? <p className="notice notice-success" role="status">{displayNameSuccess}</p> : null}
              <form className="form compact-form" onSubmit={onUpdateDisplayName}>
                <label>
                  Display name
                  <input
                    value={displayNameDraft}
                    type="text"
                    autoComplete="name"
                    placeholder="Example: Sujay"
                    maxLength={80}
                    onChange={(event) => setDisplayNameDraft(event.target.value)}
                    required
                  />
                </label>
                <button type="submit" disabled={authLoading === "display-name"}>
                  {authLoading === "display-name" ? "Saving name..." : "Save name"}
                </button>
              </form>
            </section>
          ) : null}
          {displayEmail && showPasswordEditor ? (
            <section className="password-panel account-editor-panel">
              <div>
                <h2>{authFlow === "recovery" ? "Reset your password" : needsPasswordSetup ? "Set a password" : "Update your password"}</h2>
                <p className="muted">
                  {authFlow === "recovery"
                    ? "Your recovery link worked. Choose a new password to finish getting back into Memact."
                    : needsPasswordSetup
                    ? "You are signed in through the email link. Set a strong password now so the next login is faster."
                    : "Keep a strong password on this account so you can sign in without requesting a new link."}
                </p>
              </div>
              {passwordSuccess ? <p className="notice notice-success" role="status">{passwordSuccess}</p> : null}
              <form className="form" onSubmit={onSetPassword}>
                <PasswordField
                  label="New password"
                  value={setupPassword}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  onChange={(event) => setSetupPassword(event.target.value)}
                  required
                />
                <PasswordField
                  label="Confirm password"
                  value={setupPasswordConfirm}
                  autoComplete="new-password"
                  placeholder="Repeat the password"
                  onChange={(event) => setSetupPasswordConfirm(event.target.value)}
                  required
                />
                <div className="password-strength" data-strength={passwordState.level}>
                  <div className="password-strength-bar">
                    <span style={{ width: `${passwordState.percent}%` }} />
                  </div>
                  <strong>{passwordState.label}</strong>
                </div>
                <ul className="password-rules" aria-label="Password requirements">
                  {passwordState.checks.map((check) => (
                    <li key={check.label} className={check.ok ? "is-passed" : ""}>{check.label}</li>
                  ))}
                </ul>
                <button type="submit" disabled={!passwordState.canSubmit || authLoading === "set-password"}>
                  {authLoading === "set-password" ? "Saving password..." : authFlow === "recovery" ? "Reset password" : needsPasswordSetup ? "Save password" : "Update password"}
                </button>
              </form>
            </section>
          ) : null}
          {provider === "email" && showEmailEditor ? (
            <section className="password-panel account-editor-panel email-panel">
              <div>
                <h2>Change your email</h2>
              </div>
              {emailChangeSuccess ? <p className="notice notice-success" role="status">{emailChangeSuccess}</p> : null}
              <form className="form compact-form" onSubmit={onChangeEmail}>
                <label>
                  New email address
                  <input
                    value={newEmailAddress}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="Enter the new email address"
                    onChange={(event) => setNewEmailAddress(event.target.value)}
                    required
                  />
                </label>
                <button type="submit" disabled={authLoading === "change-email"}>
                  {authLoading === "change-email" ? "Sending confirmation..." : "Change email"}
                </button>
              </form>
            </section>
          ) : null}
          {showInviteEditor ? (
            <section className="password-panel account-editor-panel invite-panel">
              <div>
                <h2>Invite someone to Memact</h2>
              </div>
              {inviteSuccess ? <p className="notice notice-success" role="status">{inviteSuccess}</p> : null}
              <form className="form compact-form" onSubmit={onInviteUser}>
                <label>
                  Email address
                  <input
                    value={inviteEmail}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="person@example.com"
                    onChange={(event) => setInviteEmail(event.target.value)}
                    required
                  />
                </label>
                <button type="submit" disabled={authLoading === "invite-user"}>
                  {authLoading === "invite-user" ? "Sending invite..." : "Send invite"}
                </button>
              </form>
            </section>
          ) : null}
          <section className="password-panel account-editor-panel danger-zone-panel">
            <div>
              <h2>Delete your Memact account</h2>
            </div>
            {deleteAccountSuccess ? <p className="notice notice-success" role="status">{deleteAccountSuccess}</p> : null}
            <button
              type="button"
              className="ghost danger"
              disabled={authLoading === "delete-account"}
              onClick={onRequestAccountDeletion}
            >
              {authLoading === "delete-account" ? "Requesting deletion..." : "Delete account"}
            </button>
          </section>
        </section>
      ) : (
        <section className="panel dashboard-overview dashboard-shell-panel">
          <div className="dashboard-shell-head">
            <div>
              <h2>{hasApps ? "Build with Memact" : "Create your first app"}</h2>
            </div>
          </div>
          <section id="app-panel" className="panel app-workspace">
            <div className="section-head">
              <div className="section-copy">
                <p className="eyebrow">{hasApps ? "Start by selecting or creating an app" : "Start by creating an app"}</p>
                <h2>{appHeading}</h2>
              </div>
              {hasApps ? (
                <div className="actions section-actions" aria-label="App actions">
                  <button type="button" className="new-app-button" aria-label={(isCreatingApp || isEditingApp) ? "Cancel app operation" : "Create app"} onClick={() => {
                    if (isCreatingApp || isEditingApp) {
                      setShowAppForm(false);
                      setIsEditingApp(false);
                    } else {
                      setShowAppForm(true);
                    }
                  }}>
                    {(isCreatingApp || isEditingApp) ? "Cancel" : "New app"}
                  </button>
                  {!isCreatingApp && !isEditingApp && selectedApp ? (
                    <>
                      <button type="button" className="edit-app-button" onClick={startEditingApp}>Edit settings</button>
                      <button type="button" className="ghost danger app-delete-button" onClick={onDeleteApp}>Delete app</button>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            {isCreatingApp ? (
              <form className="form app-create-form" onSubmit={onCreateApp}>
                <label>
                  App name
                  <input value={newAppName} placeholder="Example: Reading assistant" onChange={(event) => setNewAppName(event.target.value)} required />
                </label>
                <label>
                  Developer website
                  <input value={newAppDeveloperUrl} type="url" placeholder="Optional: https://example.com" onChange={(event) => setNewAppDeveloperUrl(event.target.value)} />
                </label>
                <label>
                  Connect redirect URL
                  <input value={newAppRedirectUrl} type="url" placeholder="Optional: where users return after connecting" onChange={(event) => setNewAppRedirectUrl(event.target.value)} />
                </label>
                <label>
                  Purpose
                  <textarea value={newAppDescription} placeholder="Optional: What will this app use Memact for?" onChange={(event) => setNewAppDescription(event.target.value)} />
                </label>
                <button type="submit">Create app</button>
              </form>
            ) : null}

            {isEditingApp && selectedApp ? (
              <form className="form app-create-form" onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await onUpdateApp(selectedApp.id, {
                    name: editAppName,
                    description: editAppDescription,
                    developer_url: editAppDeveloperUrl,
                    redirect_url: editAppRedirectUrl
                  });
                  setIsEditingApp(false);
                } catch (err) {
                  // Handled by main.jsx error display
                }
              }}>
                <label>
                  App name
                  <input value={editAppName} placeholder="Example: Reading assistant" onChange={(event) => setEditAppName(event.target.value)} required />
                </label>
                <label>
                  Developer website
                  <input value={editAppDeveloperUrl} type="url" placeholder="Optional: https://example.com" onChange={(event) => setEditAppDeveloperUrl(event.target.value)} />
                </label>
                <label>
                  Connect redirect URL
                  <input value={editAppRedirectUrl} type="url" placeholder="Optional: where users return after connecting" onChange={(event) => setEditAppRedirectUrl(event.target.value)} />
                </label>
                <label>
                  Purpose
                  <textarea value={editAppDescription} placeholder="Optional: What will this app use Memact for?" onChange={(event) => setEditAppDescription(event.target.value)} />
                </label>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button type="submit">Save settings</button>
                  <button type="button" className="ghost" onClick={() => setIsEditingApp(false)}>Cancel</button>
                </div>
              </form>
            ) : null}

            {hasApps ? (
              <div className="registered-apps">
                <p className="app-list-label">Registered apps</p>
                <div className="app-switcher" aria-label="Select app">
                  {apps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      className={`app-chip ${selectedAppId === app.id ? "is-active" : ""}`}
                      onClick={() => { setSelectedAppId(app.id); setIsEditingApp(false); }}
                    >
                      {app.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <div className="access-layout">
            <section id="permissions-panel" className="panel">
              <div className="section-head">
                <div className="section-copy">
                  <p className="eyebrow">Next, choose what this app can request</p>
                  <h2>Choose what this app can request</h2>
                </div>
                <div className="actions section-actions">
                  <span className="tooltip-wrap" title={permissionsHint || undefined}>
                    <button type="button" className="ghost" disabled={!selectedAppId || !selectedScopes.length || !selectedCategories.length} onClick={onGrantConsent}>Save permissions</button>
                  </span>
                  <span className="tooltip-wrap" title={createKeyHint || undefined}>
                    <button type="button" disabled={!canCreateKey} onClick={onCreateKey}>Create API key</button>
                  </span>
                </div>
              </div>
              <div className="stack">
                <section className="usage-overview" aria-label="Capabilities">
                  <div className="usage-overview-head">
                    <h3>Capabilities</h3>
                  </div>
                  <div className="scope-grid">
                    {Object.entries(filteredScopes).map(([scope, definition]) => {
                      const inputId = `scope-${scope.replace(/[^a-z0-9_-]/gi, "-")}`
                      return (
                        <label key={scope} className="scope-card" htmlFor={inputId}>
                          <input
                            id={inputId}
                            type="checkbox"
                            checked={selectedScopes.includes(scope)}
                            onChange={() => {
                              setSelectedScopes((current) => current.includes(scope)
                                ? current.filter((item) => item !== scope)
                                : [...current, scope])
                            }}
                          />
                          <span>
                            <strong>{scope}</strong>
                            <small>{definition.description}</small>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </section>

                <section className="usage-overview" aria-label="Activity categories">
                  <div className="usage-overview-head">
                    <h3>Activity categories</h3>
                  </div>
                  <CategoryGrid
                    categories={filteredCategories}
                    selected={selectedCategories}
                    onToggle={(category) => toggleValue(setSelectedCategories, category)}
                  />
                </section>
              </div>
            </section>

            {selectedKeys.length > 0 && (
              <section id="api-keys-panel" className="panel api-keys-panel">
                <div className="section-head">
                  <div className="section-copy">
                    <p className="eyebrow">Now, API keys</p>
                    <h2>API keys</h2>
                  </div>
                </div>
                <div className="stack">
                  <section className="usage-overview" aria-label="Usage statistics">
                    <div className="usage-overview-head">
                      <h3>Key binding and exposure checks</h3>
                    </div>
                    <div className="usage-kpis">
                      <div className="usage-kpi">
                        <p>Apps using this key</p>
                        <strong>{usageStats.appsUsingSameKey}</strong>
                      </div>
                      <div className="usage-kpi">
                        <p>Public exposure</p>
                        <strong>{usageStats.exposureLabel}</strong>
                      </div>
                      <div className="usage-kpi">
                        <p>Last key use</p>
                        <strong>{usageStats.lastUsedLabel}</strong>
                      </div>
                    </div>
                  </section>

                  {activeKeys.length ? activeKeys.map((key) => (
                    <div className="list-card api-key-row" key={key.id}>
                      <span>
                        <strong>{key.name}</strong>
                        <small>{key.key_prefix}...</small>
                      </span>
                      <span className="badge badge-success">active</span>
                      <button type="button" className="ghost danger" onClick={() => onRevokeKey(key.id)}>Revoke</button>
                    </div>
                  )) : null}

                  {revokedKeys.length ? (
                    <details className="revoked-history">
                      <summary>
                        <span>Revoked history ({revokedKeys.length})</span>
                        <Chevron className="revoked-chevron" />
                      </summary>
                      <div className="revoked-history-list">
                        {revokedKeys.map((key) => (
                          <div className="list-card api-key-row revoked-key-row" key={key.id}>
                            <span>
                              <strong>{key.name}</strong>
                              <small>{key.key_prefix}...</small>
                            </span>
                            <span className="badge badge-danger">revoked</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  ) : null}
                </div>
              </section>
            )}
          </div>

          {oneTimeKey ? (
            <section id="one-time-key-panel" className="panel key-panel">
              <div className="key-panel-head">
                <h2>One-time API key</h2>
                <p className="muted key-warning">Memact stores only a hash. This raw key cannot be shown again.</p>
              </div>
              <div className="key-box">
                <code>{oneTimeKey}</code>
                <div className="key-actions">
                  <button type="button" className="button" onClick={onCopyKey}>Copy key</button>
                  <button type="button" className="ghost" onClick={onTestKey}>Test key</button>
                </div>
              </div>
              {apiTestResult ? <p className="notice notice-success" role="status">{apiTestResult}</p> : null}
              <details className="embed-code">
                <summary>Embed code</summary>
                <pre><code>{buildEmbedCode(oneTimeKey, oneTimeKeyScopes, oneTimeKeyCategories, selectedApp)}</code></pre>
              </details>
            </section>
          ) : null}
        </section>
      )}
    </section>
  )
}

function sameValues(first = [], second = []) {
  const firstList = [...first].sort()
  const secondList = [...second].sort()
  return firstList.length === secondList.length && firstList.every((value, index) => value === secondList[index])
}

function toggleValue(setter, value) {
  setter((current) => current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value])
}

function getUsageStats(selectedApp, selectedKeys = [], apps = []) {
  const activeKeys = selectedKeys.filter((key) => !key.revoked_at)
  const keyAppIds = new Set(activeKeys.map((key) => key.app_id).filter(Boolean))
  const reportedAppCounts = activeKeys
    .map((key) => Number(key.app_count || key.client_count || key.using_apps_count || key.application_count))
    .filter((count) => Number.isFinite(count) && count > 0)
  const appsUsingSameKey = reportedAppCounts.length
    ? Math.max(...reportedAppCounts)
    : Math.max(keyAppIds.size || (activeKeys.length ? 1 : 0), 0)
  const exposedKey = activeKeys.find((key) => key.public_exposure_detected || key.exposure_status === "exposed")
  const unknownExposure = activeKeys.length && !activeKeys.some((key) => key.exposure_status || key.public_exposure_detected === false)
  const lastUsedAt = activeKeys
    .map((key) => {
      const lastUsed = String(key.last_used_at || "")
      const created = String(key.created_at || "")
      return lastUsed && lastUsed !== created ? lastUsed : ""
    })
    .filter(Boolean)
    .sort()
    .at(-1)
  return {
    appsUsingSameKey,
    exposureLabel: exposedKey ? "Review now" : unknownExposure ? "No signal yet" : "Clear",
    lastUsedLabel: lastUsedAt ? formatDate(lastUsedAt) : "No use yet"
  }
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Unknown"
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
}

function buildEmbedCode(apiKey, scopes = [], categories = [], app = null) {
  const appId = app?.id || "app_id_from_memact_portal"
  const redirectUrl = app?.redirect_urls?.[0] || app?.developer_url || "https://your-app.example.com/memact/callback"
  const connectUrl = buildPortalConnectUrl(appId, scopes, categories, redirectUrl)
  return `import { createMemactClient } from "@memact/sdk";

// 1. Add the Connect Memact button.
const memactConnectUrl = "${connectUrl}";

// 2. After approval, store the returned connection id on your server.
const connectionId = "connection_id_from_connect_redirect";

// 3. Keep the raw key in server env only.
// Server env:
// MEMACT_BASE_URL=https://api.memact.com
// MEMACT_API_KEY=${apiKey || "mka_key_shown_once"}
// MEMACT_APP_ID=${appId}
// MEMACT_CONNECTION_ID=connection_id_from_connect_redirect
const memact = createMemactClient({
  baseUrl: process.env.MEMACT_BASE_URL || "https://api.memact.com",
  apiKey: process.env.MEMACT_API_KEY || "${apiKey || "mka_key_shown_once"}",
  appId: process.env.MEMACT_APP_ID || "${appId}",
  connectionId: process.env.MEMACT_CONNECTION_ID || connectionId
});

await memact.verifyAccess({
  required_scopes: ${JSON.stringify(scopes, null, 2)},
  activity_categories: ${JSON.stringify(categories, null, 2)}
});

await memact.suggestMemory({
  category: "reading",
  title: "Prefers short article summaries",
  context: {
    preferred_summary_style: "short"
  },
  evidence: {
    reason: "The user chose short summaries in this app."
  }
});

const memory = await memact.getMemory({
  connection_id: connectionId,
  activity_categories: ["reading"]
});

console.log(memory);`
}

function getDeveloperVerifyUrl() {
  const configured = import.meta.env?.VITE_MEMACT_DEVELOPER_API_URL || ""
  return configured.replace(/\/+$/, "") || "https://api.memact.com/v1/access/verify"
}

function buildPortalConnectUrl(appId, scopes = [], categories = [], redirectUrl = "") {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://memact.com"
  const url = new URL("/connect", origin)
  url.searchParams.set("app_id", appId)
  if (scopes.length) url.searchParams.set("scopes", scopes.join(","))
  if (categories.length) url.searchParams.set("categories", categories.join(","))
  if (redirectUrl) url.searchParams.set("redirect_uri", redirectUrl)
  return url.toString()
}

function UserSettingsSections({ apps = [], consents = [], onRevokeConsent }) {
  const activeConsents = consents.filter((consent) => !consent.revoked_at)
  const revokedConsents = consents.filter((consent) => consent.revoked_at)

  return (
    <div className="user-settings-stack">
      <section className="user-settings-card">
        <div className="wiki-section-head">
          <div>
            <h3>Connected apps</h3>
          </div>
          <span className="badge">{activeConsents.length}</span>
        </div>
        <div className="user-settings-list">
          {activeConsents.map((consent) => {
            const app = apps.find((item) => item.id === consent.app_id)
            const appName = app?.name || consent.app_id || "Connected app"
            return (
              <div className="mini-row user-settings-app" key={consent.id || consent.app_id}>
                <div>
                  <strong>{appName}</strong>
                  <small>{summarizeUserConsent(consent)}</small>
                </div>
                <button type="button" className="ghost danger" onClick={() => onRevokeConsent?.(consent.id)}>Revoke</button>
              </div>
            )
          })}
          {!activeConsents.length ? <p className="muted">No connected apps yet.</p> : null}
        </div>
      </section>

    </div>
  )
}

function summarizeUserConsent(consent) {
  const categoryCount = Array.isArray(consent.categories) ? consent.categories.length : 0
  const scopeCount = Array.isArray(consent.scopes) ? consent.scopes.length : 0
  const parts = []
  if (categoryCount) parts.push(`${categoryCount} ${categoryCount === 1 ? "category" : "categories"}`)
  if (scopeCount) parts.push(`${scopeCount} ${scopeCount === 1 ? "permission" : "permissions"}`)
  return parts.length ? parts.join(" / ") : "Access approved"
}
