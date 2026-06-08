import React, { useEffect, useRef, useState } from "react"
import { Chevron } from "./Chevron.jsx"
import { findContextValue, suggestContextGoal } from "../context-goals.js"

const WIKI_CATEGORIES = [
  "Reading",
  "Shopping",
  "Learning",
  "Work",
  "Collaboration",
  "Dietary restrictions",
  "Creator profile",
  "Project notes",
  "Personal preferences",
  "Settings",
  "AI memory",
  "Permissions",
  "Reputation",
  "Workflow habits",
  "Accessibility needs",
  "Personalization history",
  "Other"
]

const VISIBILITY_OPTIONS = [
  { value: "private", label: "Private" },
  { value: "shareable", label: "Shareable" }
]

export function WikiPage({
  app,
  categories,
  scopes,
  requestedCategories = [],
  requestedScopes = [],
  transparency,
  onUpdateSelection,
  onBackToConsent,
  onManageConsent
}) {
  const appName = app?.name || "this app"
  const faviconUrl = getFaviconUrl(app?.developer_url)
  const optionRef = useStableRequestedOptions(app?.id, requestedScopes, requestedCategories)
  const dataUses = normalizeDisclosureList(transparency?.data_uses || transparency?.dataUses)
  const capturedData = normalizeDisclosureList(transparency?.captured_data || transparency?.capturedData || transparency?.data_collected)
  const createdMemory = normalizeDisclosureList(transparency?.created_context || transparency?.intent_context || transparency?.intentContext || transparency?.graph_packets || transparency?.graphPackets || transparency?.memory_packets)
  const allowedFeatures = normalizeDisclosureList(transparency?.features || transparency?.allowed_features || transparency?.allowedFeatures)
  const proposedEntries = normalizeWikiEntries(transparency?.wiki_entries || transparency?.proposed_entries || transparency?.proposedEntries, appName)
  const retention = transparency?.retention || transparency?.retention_policy || "The app has not provided a specific retention statement yet."
  const revocation = transparency?.revocation || transparency?.revocation_policy || "After consent is revoked, new Memact access should stop. Previously copied data must follow the app's own deletion policy."
  const safeRequestedScopes = Array.isArray(requestedScopes) ? requestedScopes : []
  const safeRequestedCategories = Array.isArray(requestedCategories) ? requestedCategories : []
  const scopeOptions = optionRef.current.scopes
  const categoryOptions = optionRef.current.categories
  const hasEnoughSelection = safeRequestedScopes.length > 0 && safeRequestedCategories.length > 0
  const [manualEntries, setManualEntries] = useState(() => {
    try {
      const saved = localStorage.getItem("memact_manual_entries")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [draft, setDraft] = useState(defaultDraft())
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [acceptedProposals, setAcceptedProposals] = useState(() => {
    try {
      const saved = localStorage.getItem("memact_accepted_proposals")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [rejectedProposals, setRejectedProposals] = useState(() => {
    try {
      const saved = localStorage.getItem("memact_rejected_proposals")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("memact_manual_entries", JSON.stringify(manualEntries))
    } catch (e) {
      console.error("Failed to save manual entries", e)
    }
  }, [manualEntries])

  useEffect(() => {
    try {
      localStorage.setItem("memact_accepted_proposals", JSON.stringify(acceptedProposals))
    } catch (e) {
      console.error("Failed to save accepted proposals", e)
    }
  }, [acceptedProposals])

  useEffect(() => {
    try {
      localStorage.setItem("memact_rejected_proposals", JSON.stringify(rejectedProposals))
    } catch (e) {
      console.error("Failed to save rejected proposals", e)
    }
  }, [rejectedProposals])
  const [wikiSearch, setWikiSearch] = useState("")
  const [goalText, setGoalText] = useState("")
  const [activeGoal, setActiveGoal] = useState(null)
  const [goalAnswers, setGoalAnswers] = useState({})
  const addMemoryRef = useRef(null)
  const goalRef = useRef(null)

  useEffect(() => {
    if (!showAddMemory) return
    window.requestAnimationFrame(() => {
      addMemoryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }, [showAddMemory])

  const openAddMemory = () => {
    if (showAddMemory) {
      addMemoryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setShowAddMemory(true)
  }
  const toggleScope = (scope) => {
    const nextScopes = safeRequestedScopes.includes(scope)
      ? safeRequestedScopes.filter((item) => item !== scope)
      : [...safeRequestedScopes, scope]
    onUpdateSelection?.({ scopes: nextScopes, categories: safeRequestedCategories })
  }
  const toggleCategory = (category) => {
    const nextCategories = safeRequestedCategories.includes(category)
      ? safeRequestedCategories.filter((item) => item !== category)
      : [...safeRequestedCategories, category]
    onUpdateSelection?.({ scopes: safeRequestedScopes, categories: nextCategories })
  }
  const submitManualEntry = (event) => {
    event.preventDefault()
    const entry = {
      id: `local-${Date.now()}`,
      title: draft.title.trim(),
      category: draft.category,
      group: draft.category,
      subgroup: "General",
      field_path: `manual.${slugFieldPath(draft.category)}.${slugFieldPath(draft.title)}`,
      value: draft.value.trim(),
      visibility: draft.visibility,
      expires_at: draft.expires_at,
      source_note: draft.source_note.trim(),
      source_type: "user",
      source_label: "Added by you",
      source_detail: "Source: User-added",
      status: "accepted",
      user_verified: true,
      confidence: "User verified",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      competing_interpretations: [],
      contradictions: []
    }
    if (!entry.title || !entry.value) return
    setManualEntries((current) => [entry, ...current])
    setDraft(defaultDraft())
    setShowAddMemory(false)
  }
  const updateDraft = (key, value) => setDraft((current) => ({ ...current, [key]: value }))
  const changeEntryVisibility = (id, visibility) => {
    setManualEntries((current) => current.map((entry) => entry.id === id ? { ...entry, visibility } : entry))
  }
  const deleteEntry = (id) => {
    setManualEntries((current) => current.filter((entry) => entry.id !== id))
  }
  const acceptProposal = (entry) => {
    setAcceptedProposals((current) => [{ ...entry, status: "accepted", user_verified: true, accepted_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...current])
    setRejectedProposals((current) => current.filter((id) => id !== entry.id))
  }
  const rejectProposal = (id) => {
    setRejectedProposals((current) => Array.from(new Set([...current, id])))
    setAcceptedProposals((current) => current.filter((entry) => entry.id !== id))
  }
  const visibleProposals = proposedEntries.filter((entry) => !rejectedProposals.includes(entry.id) && !acceptedProposals.some((item) => item.id === entry.id))
  const visibleEntries = [...manualEntries, ...acceptedProposals]
  const filteredEntries = filterWikiEntries(visibleEntries, wikiSearch)
  const groupedEntries = groupEntriesByContext(filteredEntries)
  const hasShareableEntries = visibleEntries.some((entry) => entry.visibility === "shareable")
  const goalTemplate = activeGoal ? suggestContextGoal(activeGoal) : null
  const goalFields = goalTemplate?.fields || []
  const missingGoalFields = goalFields.filter((field) => !findContextValue(visibleEntries, field.field_path))

  const goalInputRef = useRef(null)
  const isFirstTimeUser = visibleEntries.length === 0

  useEffect(() => {
    if (isFirstTimeUser && !app?.id) {
      goalInputRef.current?.focus()
    }
  }, [isFirstTimeUser, app?.id])

  const handleGoalKeyDown = (event) => {
    if (event.key === "Enter") {
      findGoalContext(event)
    }
  }

  const findGoalContext = (event) => {
    event.preventDefault()
    const nextGoal = goalText.trim()
    if (!nextGoal) return
    setActiveGoal(nextGoal)
    window.requestAnimationFrame(() => {
      goalRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    })
  }

  const saveGoalAnswers = () => {
    if (!goalTemplate) return
    const createdAt = new Date().toISOString()
    const entries = goalFields
      .map((field) => {
        const answer = String(goalAnswers[field.field_path] || "").trim()
        if (!answer || findContextValue(visibleEntries, field.field_path)) return null
        return {
          id: `goal-${field.field_path}-${Date.now()}`,
          title: field.label,
          category: goalTemplate.group,
          group: goalTemplate.group,
          subgroup: field.subgroup || "General",
          field_path: field.field_path,
          value: { [field.field_path]: answer, note: answer },
          visibility: "private",
          source_type: "user",
          source_label: "Added by you",
          source_detail: `Source: ${activeGoal}`,
          status: "accepted",
          user_verified: true,
          confidence: "User verified",
          created_at: createdAt,
          updated_at: createdAt,
          competing_interpretations: [],
          contradictions: []
        }
      })
      .filter(Boolean)
    if (!entries.length) return
    setManualEntries((current) => [...entries, ...current])
    setGoalAnswers({})
  }

  return (
    <section className="panel wiki-page wiki-shell-panel">
      <div className="wiki-hero-panel">
        <div>
          <h2>{app?.id ? `${appName}'s access to Yourself` : "What apps know about you"}</h2>
        </div>
        <div className="wiki-hero-actions">
          <button type="button" className="button wiki-add-button" onClick={openAddMemory}>
            Add about me
          </button>
        </div>
      </div>

      {app?.id ? (
        <div className="app-identity connect-identity wiki-app-panel">
          <span className="app-avatar" aria-hidden="true">
            {faviconUrl ? <img src={faviconUrl} alt="" onError={(event) => { event.currentTarget.hidden = true }} /> : <span>{appInitial(appName)}</span>}
            {faviconUrl ? <span>{appInitial(appName)}</span> : null}
          </span>
          <div>
            <strong>{appName}</strong>
            {app?.developer_url ? (
              <a className="muted" href={app.developer_url} target="_blank" rel="noreferrer">{app.developer_url}</a>
            ) : <span className="muted">Developer URL not provided.</span>}
          </div>
        </div>
      ) : null}

      {!app?.id ? (
        <section className="wiki-goal-panel" ref={goalRef}>
          <form className="wiki-goal-form" onSubmit={findGoalContext}>
            <div>
              <h3>Start with what you are trying to do</h3>
              <p className="muted">Memact will find the useful details and ask only what is missing</p>
            </div>
            <div className="wiki-goal-field-wrapper">
              <input
                ref={goalInputRef}
                autoFocus={isFirstTimeUser}
                value={goalText}
                placeholder="Example: I am looking for a laptop"
                onChange={(event) => setGoalText(event.target.value)}
                onKeyDown={handleGoalKeyDown}
              />
              {goalText.trim().length > 0 ? (
                <button type="submit" className="enter-action-button" aria-label="Find details">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="enter-icon">
                    <path d="M9 10l-5 5 5 5" />
                    <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                  </svg>
                </button>
              ) : null}
            </div>
            {isFirstTimeUser ? (
              <div className="wiki-goal-prompt">
                <span className="pulse-dot" />
                <span>Start here: Type a goal above to initialize your memory entries.</span>
              </div>
            ) : null}
          </form>
          {goalTemplate ? (
            <div className="wiki-goal-result">
              <div className="wiki-section-head">
                <div>
                  <h3>{goalTemplate.label}</h3>
                  <p className="muted">{goalTemplate.intro}</p>
                </div>
                <span className="wiki-count-badge" aria-label={`${missingGoalFields.length} missing details`}>{missingGoalFields.length}</span>
              </div>
              <div className="wiki-goal-field-grid">
                {goalFields.map((field) => {
                  const savedValue = findContextValue(visibleEntries, field.field_path)
                  return (
                    <label className={savedValue ? "wiki-goal-field is-saved" : "wiki-goal-field"} key={field.field_path}>
                      <span>{field.label}</span>
                      <small>{field.subgroup}</small>
                      {savedValue ? (
                        <strong>{savedValue}</strong>
                      ) : (
                        <input
                          value={goalAnswers[field.field_path] || ""}
                          placeholder={field.placeholder}
                          onChange={(event) => setGoalAnswers((current) => ({ ...current, [field.field_path]: event.target.value }))}
                        />
                      )}
                    </label>
                  )
                })}
              </div>
              {missingGoalFields.length ? <button type="button" onClick={saveGoalAnswers}>Save missing details</button> : <p className="notice notice-success">You already saved the details Memact found for this goal</p>}
            </div>
          ) : null}
        </section>
      ) : null}

      {showAddMemory ? (
        <form className="wiki-add-form" ref={addMemoryRef} onSubmit={submitManualEntry}>
          <div>
            <h3>Add something apps should know</h3>
          </div>
          <div className="wiki-form-grid">
            <label>
              Title
              <input value={draft.title} placeholder="I prefer concise summaries" onChange={(event) => updateDraft("title", event.target.value)} required />
            </label>
            <div className="wiki-field">
              <span>Category</span>
              <MemactSelect
                label="Category"
                value={draft.category}
                options={WIKI_CATEGORIES.map((category) => ({ value: category, label: category }))}
                onChange={(value) => updateDraft("category", value)}
              />
            </div>
            <label className="wiki-form-wide">
              Value / note
              <textarea value={draft.value} placeholder="Write what apps should remember." onChange={(event) => updateDraft("value", event.target.value)} required />
            </label>
            <div className="wiki-field">
              <span>Visibility</span>
              <MemactSelect
                label="Visibility"
                value={draft.visibility}
                options={VISIBILITY_OPTIONS}
                onChange={(value) => updateDraft("visibility", value)}
              />
            </div>
            <div className="wiki-field">
              <span>Optional expiry date</span>
              <MemactDatePicker value={draft.expires_at} onChange={(value) => updateDraft("expires_at", value)} />
            </div>
            <label className="wiki-form-wide">
              Optional source note
              <input value={draft.source_note} placeholder="Why are you adding this?" onChange={(event) => updateDraft("source_note", event.target.value)} />
            </label>
          </div>
          <div className="connect-actions">
            <button type="button" className="ghost" onClick={() => setShowAddMemory(false)}>Cancel</button>
            <button type="submit">Save about me</button>
          </div>
        </form>
      ) : null}

      {app?.id ? (
        <section className="transparency-controls-panel wiki-controls-panel">
          <div className="transparency-control-head">
            <div>
              <h3>Choose what this app can use</h3>
            </div>
            <div className="transparency-summary" aria-label="Yourself selection summary">
              <span><strong>{safeRequestedScopes.length}</strong> Actions</span>
              <span><strong>{safeRequestedCategories.length}</strong> Activity types</span>
            </div>
          </div>
          {!hasEnoughSelection ? (
            <p className="notice" role="status">Select at least one action and one activity type before returning to consent.</p>
          ) : null}
          <div className="transparency-choice-grid">
            <div className="transparency-choice-group">
              <p className="app-list-label">Allowed actions</p>
              <div className="transparency-control-list">
                {scopeOptions.map((scope) => (
                  <label className="transparency-control" key={scope}>
                    <input type="checkbox" checked={safeRequestedScopes.includes(scope)} onChange={() => toggleScope(scope)} />
                    <span>
                      <strong>{scopes?.[scope]?.label || scope}</strong>
                      <small>{scopes?.[scope]?.description || scope}</small>
                    </span>
                  </label>
                ))}
                {!scopeOptions.length ? <p className="muted">No actions were attached to this access request.</p> : null}
              </div>
            </div>
            <div className="transparency-choice-group">
              <p className="app-list-label">Allowed activity</p>
              <div className="transparency-control-list">
                {categoryOptions.map((category) => (
                  <label className="transparency-control" key={category}>
                    <input type="checkbox" checked={safeRequestedCategories.includes(category)} onChange={() => toggleCategory(category)} />
                    <span>
                      <strong>{categories?.[category]?.label || category}</strong>
                      <small>{categories?.[category]?.description || category}</small>
                    </span>
                  </label>
                ))}
                {!categoryOptions.length ? <p className="muted">No activity types were attached to this access request.</p> : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="wiki-entry-panel wiki-main-panel">
        <div className="wiki-section-head">
          <div>
            <h3>Things saved about you</h3>
          </div>
          <span className="wiki-count-badge" aria-label={`${visibleEntries.length} saved things`}>{visibleEntries.length}</span>
        </div>
        <label className="wiki-search">
          Find something
          <span className="wiki-search-field">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M10.5 17a6.5 6.5 0 1 1 0-13a6.5 6.5 0 0 1 0 13Zm5-1.5 4 4" />
            </svg>
            <input
              value={wikiSearch}
              type="text"
              placeholder="Search name, food, study, project..."
              onChange={(event) => setWikiSearch(event.target.value)}
              style={wikiSearch.trim().length > 0 ? { paddingRight: "46px" } : {}}
            />
            {wikiSearch.trim().length > 0 ? (
              <span className="enter-action-indicator" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="enter-icon">
                  <path d="M9 10l-5 5 5 5" />
                  <path d="M20 4v7a4 4 0 0 1-4 4H4" />
                </svg>
              </span>
            ) : null}
          </span>
        </label>
        <div className="wiki-index">
          {groupedEntries.map((group) => (
            <section className="wiki-category-section" key={group.group}>
              <div className="wiki-category-head">
                <h4>{group.group}</h4>
                <span className="wiki-count-badge wiki-count-badge-small" aria-label={`${group.entries.length} things in ${group.group}`}>{group.entries.length}</span>
              </div>
              {group.subgroups.map((subgroup) => (
                <div className="wiki-subgroup" key={`${group.group}-${subgroup.name}`}>
                  <h5>{subgroup.name}</h5>
                  <div className="wiki-entry-list">
                    {subgroup.entries.map((entry) => (
                      <WikiEntryCard
                        key={entry.id}
                        entry={entry}
                        onDelete={() => deleteEntry(entry.id)}
                        onVisibility={(visibility) => changeEntryVisibility(entry.id, visibility)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ))}
          {!visibleEntries.length ? (
            <div className="wiki-empty-state">
              <h4>Nothing is saved yet</h4>
              <p className="muted">Add one thing apps should remember, like your preferred name, food restriction, study goal, project note, or shopping preference.</p>
              <button type="button" className="ghost" onClick={openAddMemory}>Add something about me</button>
            </div>
          ) : null}
          {visibleEntries.length > 0 && !filteredEntries.length ? <p className="muted">Nothing saved matches that search.</p> : null}
        </div>
      </section>

      <section className="wiki-overview-grid" aria-label="Yourself overview">
        <div className="wiki-overview-card">
          <span>Saved</span>
          <strong>{visibleEntries.length}</strong>
          <small>things you added or approved</small>
        </div>
        <div className="wiki-overview-card">
          <span>Review</span>
          <strong>{visibleProposals.length}</strong>
          <small>app suggestions waiting</small>
        </div>
        <div className="wiki-overview-card">
          <span>Sharing</span>
          <strong>Private</strong>
          <small>only shared when you choose</small>
        </div>
      </section>



      {visibleProposals.length ? (
        <section className="wiki-entry-panel wiki-main-panel">
          <div className="wiki-section-head">
            <div>
              <h3>Apps want to add these</h3>
            </div>
            <span className="wiki-count-badge" aria-label={`${visibleProposals.length} app suggestions`}>{visibleProposals.length}</span>
          </div>
          <div className="wiki-entry-list">
            {visibleProposals.map((entry) => (
              <WikiProposalCard
                key={entry.id}
                entry={entry}
                onAccept={() => acceptProposal(entry)}
                onReject={() => rejectProposal(entry.id)}
                onEdit={() => acceptProposal({ ...entry, source_label: "Edited and accepted by you" })}
              />
            ))}
          </div>
        </section>
      ) : null}

      {app?.id ? (
        <div className="transparency-grid">
          <WikiDisclosure title="Details this app can send" items={capturedData} empty="This app has not listed exact fields yet." />
          <WikiDisclosure title="Memory Memact may save" items={createdMemory} empty="Memact may create useful memory from what you allow." />
          <WikiDisclosure title="Why it wants access" items={dataUses} empty={app?.description || "This app has not provided a plain-language reason yet."} />
          <WikiDisclosure title="Memory this app may use" items={allowedFeatures} empty="No allowed memory list was provided." />
          <section className="permission-list transparency-card">
            <h3>How long access lasts</h3>
            <p className="muted">{retention}</p>
          </section>
          <section className="permission-list transparency-card">
            <h3>Stop future access</h3>
            <p className="muted">{revocation} Removing app access stops future Memact access for this app.</p>
          </section>
        </div>
      ) : null}

      {app?.id ? <div className="connect-actions">
        {app?.id ? <button type="button" onClick={onBackToConsent}>Back to consent</button> : null}
        <button type="button" className="ghost" onClick={onManageConsent}>Open Settings</button>
      </div> : null}

      {hasShareableEntries ? <section className="wiki-share-card">
        <h3>Private unless you create a share link</h3>
      </section> : null}
    </section>
  )
}

function WikiEntryCard({ entry, onDelete, onVisibility }) {
  return (
    <article className={`wiki-entry-card wiki-entry-${entry.source_type}`}>
      <div className="wiki-entry-main">
        <div>
          <p className="eyebrow">{entry.category}</p>
          <h4>{entry.title}</h4>
          <p className="muted">{typeof entry.value === "string" ? entry.value : entry.value?.note || JSON.stringify(entry.value)}</p>
        </div>
        <MemactSelect
          label={`Change visibility for ${entry.title}`}
          value={entry.visibility}
          options={VISIBILITY_OPTIONS}
          onChange={onVisibility}
          compact
        />
      </div>
      <div className="wiki-entry-meta">
        <span>{entry.source_label}</span>
        <span>{entry.source_detail}</span>
        {entry.source_app_name ? <span>App: {entry.source_app_name}</span> : null}
        <span>{entry.source_type === "user" ? "Added" : "Proposed"} {formatWikiTimestamp(entry.proposed_at || entry.created_at)}</span>
        {entry.updated_at && entry.updated_at !== entry.created_at ? <span>Updated {formatWikiTimestamp(entry.updated_at)}</span> : null}
        <span>User verified: {entry.user_verified ? "true" : "false"}</span>
        <span>Confidence: {entry.confidence}</span>
      </div>
      <WikiSignals entry={entry} />
      <div className="wiki-entry-actions">
        <button type="button" className="ghost">Edit</button>
        <button type="button" className="ghost danger" onClick={onDelete}>Delete</button>
      </div>
    </article>
  )
}

export function MemactSelect({ label, value, options, onChange, compact = false }) {
  const detailsRef = useRef(null)
  const selected = options.find((option) => option.value === value) || options[0]
  const chooseOption = (nextValue) => {
    onChange(nextValue)
    detailsRef.current?.removeAttribute("open")
  }

  return (
    <details className={`memact-select${compact ? " memact-select-compact" : ""}`} ref={detailsRef}>
      <summary className="memact-select-trigger" aria-label={label}>
        <span>{selected?.label || value}</span>
        <Chevron className="memact-select-chevron" />
      </summary>
      <div className="memact-select-menu" role="listbox" aria-label={label}>
        {options.map((option) => (
          <button
            type="button"
            role="option"
            aria-selected={option.value === value}
            className={option.value === value ? "is-active" : ""}
            key={option.value}
            onClick={() => chooseOption(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </details>
  )
}

function MemactDatePicker({ value, onChange }) {
  const detailsRef = useRef(null)
  const [typedValue, setTypedValue] = useState(formatDateLabel(value))
  const selectedDate = parseIsoDate(value)
  const initialMonth = selectedDate || new Date()
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth())
  const days = buildCalendarDays(viewYear, viewMonth)
  const monthLabel = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(viewYear, viewMonth, 1))

  useEffect(() => {
    setTypedValue(formatDateLabel(value))
    const nextDate = parseIsoDate(value)
    if (!nextDate) return
    setViewYear(nextDate.getFullYear())
    setViewMonth(nextDate.getMonth())
  }, [value])

  const moveMonth = (amount) => {
    const next = new Date(viewYear, viewMonth + amount, 1)
    setViewYear(next.getFullYear())
    setViewMonth(next.getMonth())
  }
  const chooseDate = (day) => {
    const isoDate = toIsoDate(new Date(viewYear, viewMonth, day))
    onChange(isoDate)
    setTypedValue(formatDateLabel(isoDate))
    detailsRef.current?.removeAttribute("open")
  }
  const clearDate = () => {
    onChange("")
    setTypedValue("")
    detailsRef.current?.removeAttribute("open")
  }
  const commitTypedDate = () => {
    const trimmed = typedValue.trim()
    if (!trimmed) {
      onChange("")
      return
    }
    const parsed = parseTypedDate(trimmed)
    if (!parsed) {
      setTypedValue(formatDateLabel(value))
      return
    }
    onChange(toIsoDate(parsed))
  }
  const handleTypedDate = (event) => {
    const nextValue = event.target.value
    setTypedValue(nextValue)
    const parsed = parseTypedDate(nextValue)
    if (parsed) onChange(toIsoDate(parsed))
  }

  return (
    <div className="memact-date-picker">
      <input
        value={typedValue}
        inputMode="numeric"
        placeholder="dd-mm-yyyy"
        aria-label="Optional expiry date"
        onBlur={commitTypedDate}
        onChange={handleTypedDate}
      />
      <details className="memact-date-popover" ref={detailsRef}>
        <summary className="memact-date-toggle" aria-label="Open calendar">
          <span className="memact-calendar-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M7 3.75v3M17 3.75v3M4.75 9.25h14.5M6.25 5.75h11.5c.83 0 1.5.67 1.5 1.5v10.5c0 .83-.67 1.5-1.5 1.5H6.25c-.83 0-1.5-.67-1.5-1.5V7.25c0-.83.67-1.5 1.5-1.5Z" />
            </svg>
          </span>
        </summary>
        <div className="memact-date-menu">
          <div className="memact-date-head">
            <button type="button" className="ghost" onClick={() => moveMonth(-1)} aria-label="Previous month">&lt;</button>
            <strong>{monthLabel}</strong>
            <button type="button" className="ghost" onClick={() => moveMonth(1)} aria-label="Next month">&gt;</button>
          </div>
          <div className="memact-date-weekdays" aria-hidden="true">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="memact-date-grid">
            {days.map((day, index) => day ? (
              <button
                type="button"
                className={isSameIsoDate(value, viewYear, viewMonth, day) ? "is-active" : ""}
                key={`${day}-${index}`}
                onClick={() => chooseDate(day)}
              >
                {day}
              </button>
            ) : <span key={`empty-${index}`} aria-hidden="true" />)}
          </div>
          <button type="button" className="ghost memact-date-clear" onClick={clearDate}>Clear date</button>
        </div>
      </details>
    </div>
  )
}

function buildCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const leadingEmptyDays = (firstDay + 6) % 7
  const totalDays = new Date(year, month + 1, 0).getDate()
  const days = [
    ...Array.from({ length: leadingEmptyDays }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1)
  ]
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null
  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

function parseTypedDate(value) {
  const raw = String(value || "").trim()
  if (!raw) return null
  const isoDate = parseIsoDate(raw)
  if (isoDate) return isoDate
  const match = raw.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (!match) return null
  const [, dayText, monthText, yearText] = match
  const day = Number(dayText)
  const month = Number(monthText)
  const year = Number(yearText)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

function toIsoDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function formatDateLabel(value) {
  const date = parseIsoDate(value)
  if (!date) return "dd-mm-yyyy"
  return `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`
}

function isSameIsoDate(value, year, month, day) {
  return value === toIsoDate(new Date(year, month, day))
}

function pad2(value) {
  return String(value).padStart(2, "0")
}

function WikiProposalCard({ entry, onAccept, onEdit, onReject }) {
  return (
    <article className={`wiki-entry-card wiki-proposal-card wiki-entry-${entry.source_type}`}>
      <div className="wiki-entry-main">
        <div>
          <p className="eyebrow">{entry.source_label}</p>
          <h4>This app wants to remember: {entry.title}</h4>
          <p className="muted">{typeof entry.value === "string" ? entry.value : entry.value?.note || entry.reason || "Review before this becomes accepted memory."}</p>
        </div>
        <span className="badge">{entry.status}</span>
      </div>
      <WikiSignals entry={entry} />
      <div className="wiki-entry-actions">
        <button type="button" onClick={onAccept}>Accept</button>
        <button type="button" className="ghost" onClick={onEdit}>Edit</button>
        <button type="button" className="ghost danger" onClick={onReject}>Reject</button>
      </div>
    </article>
  )
}

function WikiSignals({ entry }) {
  return (
    <div className="wiki-signal-grid">
      <section>
        <strong>This may also mean...</strong>
        {entry.competing_interpretations?.length ? (
          entry.competing_interpretations.map((item) => <p className="muted" key={item.title}>{item.title}</p>)
        ) : <p className="muted">No competing interpretations yet.</p>}
      </section>
      <section>
        <strong>Another source disagrees.</strong>
        {entry.contradictions?.length ? (
          entry.contradictions.map((item) => <p className="muted" key={item.title}>{item.title}</p>)
        ) : <p className="muted">No contradictions yet.</p>}
      </section>
      <section className="wiki-form-wide">
        <strong>You can keep, edit, or reject this memory.</strong>
        <p className="muted">Use the controls above when a memory needs correction.</p>
      </section>
    </div>
  )
}

function WikiDisclosure({ title, items, empty }) {
  return (
    <section className="permission-list transparency-card">
      <h3>{title}</h3>
      <DisclosureList items={items} empty={empty} />
    </section>
  )
}

function defaultDraft() {
  return {
    title: "",
    category: "Reading",
    value: "",
    visibility: "private",
    expires_at: "",
    source_note: ""
  }
}

function useStableRequestedOptions(appId, requestedScopes, requestedCategories) {
  const safeScopes = Array.isArray(requestedScopes) ? requestedScopes : []
  const safeCategories = Array.isArray(requestedCategories) ? requestedCategories : []
  const ref = useRef({ appId, scopes: safeScopes, categories: safeCategories })
  if (ref.current.appId !== appId) {
    ref.current = { appId, scopes: safeScopes, categories: safeCategories }
  } else {
    ref.current = {
      appId,
      scopes: mergeUnique(ref.current.scopes, safeScopes),
      categories: mergeUnique(ref.current.categories, safeCategories)
    }
  }
  return ref
}

function mergeUnique(first = [], second = []) {
  return Array.from(new Set([...first, ...second].filter(Boolean)))
}

function DisclosureList({ items, empty }) {
  if (!items.length) return <p className="muted">{empty}</p>
  return (
    <div className="stack">
      {items.map((item) => (
        <div className="mini-row" key={item.title}>
          <strong>{item.title}</strong>
          {item.description ? <small>{item.description}</small> : null}
        </div>
      ))}
    </div>
  )
}

function normalizeDisclosureList(value) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (typeof item === "string") return { title: item.trim(), description: "" }
      return {
        title: String(item?.title || item?.name || item?.type || "").trim(),
        description: String(item?.description || item?.details || item?.purpose || "").trim()
      }
    })
    .filter((item) => item.title)
}

function normalizeWikiEntries(value, appName) {
  if (!Array.isArray(value)) return []
  return value.map((entry, index) => ({
    id: String(entry.entry_id || entry.id || `proposal-${index}`),
    title: String(entry.title || "New memory").trim(),
    category: String(entry.category || "Memory").trim(),
    value: entry.value || { note: String(entry.note || entry.description || "").trim() },
    reason: String(entry.reason || "").trim(),
    source_type: normalizeSourceType(entry.source_type),
    source_label: sourceLabel(entry.source_type, appName),
    source_detail: sourceDetail(entry.source_type),
    status: String(entry.status || "pending"),
    visibility: String(entry.visibility || "private"),
    user_verified: Boolean(entry.user_verified),
    confidence: entry.confidence ?? "Needs review",
    source_app_id: entry.source_app_id || entry.app_id || "",
    source_app_name: entry.source_app_name || entry.app_name || appName,
    proposed_at: entry.proposed_at || entry.created_at || new Date().toISOString(),
    created_at: entry.created_at || entry.proposed_at || new Date().toISOString(),
    updated_at: entry.updated_at || entry.created_at || entry.proposed_at || "",
    competing_interpretations: Array.isArray(entry.competing_interpretations) ? entry.competing_interpretations : [],
    contradictions: Array.isArray(entry.contradictions) ? entry.contradictions : []
  }))
}

function filterWikiEntries(entries, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return entries
  return entries.filter((entry) => {
    const valueText = typeof entry.value === "string" ? entry.value : JSON.stringify(entry.value || {})
    return [
      entry.title,
      entry.category,
      valueText,
      entry.source_label,
      entry.source_detail,
      entry.visibility
    ].some((item) => String(item || "").toLowerCase().includes(needle))
  })
}

function groupEntriesByContext(entries) {
  const groups = new Map()
  for (const entry of entries) {
    const group = entry.group || entry.category || "Other"
    const subgroup = entry.subgroup || "General"
    if (!groups.has(group)) groups.set(group, new Map())
    const subgroups = groups.get(group)
    if (!subgroups.has(subgroup)) subgroups.set(subgroup, [])
    subgroups.get(subgroup).push(entry)
  }
  return Array.from(groups.entries()).map(([group, subgroups]) => ({
    group,
    subgroups: Array.from(subgroups.entries()).map(([name, subgroupEntries]) => ({
      name,
      entries: subgroupEntries
    })),
    entries: Array.from(subgroups.values()).flat()
  }))
}

function normalizeSourceType(value) {
  return ["user", "app", "memact", "memact_feature"].includes(value) ? value : "app"
}

function sourceLabel(sourceType, appName) {
  if (sourceType === "user") return "Added by you"
  if (sourceType === "memact") return "Created by Memact"
  if (sourceType === "memact_feature") return "Proposed by Memact feature"
  return `Proposed by ${appName}`
}

function sourceDetail(sourceType) {
  if (sourceType === "user") return "Source: User-added"
  if (sourceType === "memact") return "Source: Memact-created"
  if (sourceType === "memact_feature") return "Source: Memact feature"
  return "Source: App-proposed"
}

function formatWikiTimestamp(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "time unavailable"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  })
}

function getFaviconUrl(value) {
  try {
    const url = new URL(value)
    return `${url.origin}/favicon.ico`
  } catch {
    return ""
  }
}

function appInitial(name) {
  return String(name || "A").trim().charAt(0).toUpperCase() || "A"
}

function slugFieldPath(value) {
  return String(value || "field").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field"
}
