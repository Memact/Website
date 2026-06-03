export const ACCOUNT_TYPES = Object.freeze({
  developer: "developer",
  user: "user"
})

export const ACCOUNT_STATES = Object.freeze({
  active: "active",
  consentShell: "consent_shell"
})

export function getAccountType(accessUser, authUser) {
  const shellState = getAccountState(accessUser, authUser) === ACCOUNT_STATES.consentShell
  const explicitType = normalizeAccountType(
    accessUser?.account_type ||
    authUser?.user_metadata?.account_type ||
    authUser?.user_metadata?.memact_account_type
  )
  return explicitType || (shellState ? ACCOUNT_TYPES.user : ACCOUNT_TYPES.developer)
}

export function getAccountState(accessUser, authUser) {
  const state = String(
    accessUser?.account_state ||
    authUser?.user_metadata?.account_state ||
    authUser?.user_metadata?.memact_account_state ||
    ""
  ).trim().toLowerCase()
  return state === ACCOUNT_STATES.consentShell ? ACCOUNT_STATES.consentShell : ACCOUNT_STATES.active
}

export function isConsentShellAccount(accessUser, authUser) {
  return getAccountState(accessUser, authUser) === ACCOUNT_STATES.consentShell
}

export function normalizeAccountType(value) {
  const type = String(value || "").trim().toLowerCase()
  if (type === ACCOUNT_TYPES.user) return ACCOUNT_TYPES.user
  if (type === ACCOUNT_TYPES.developer) return ACCOUNT_TYPES.developer
  return ""
}

export function isUserAccount(accessUser, authUser) {
  return getAccountType(accessUser, authUser) === ACCOUNT_TYPES.user
}

export function isDeveloperAccount(accessUser, authUser) {
  return getAccountType(accessUser, authUser) === ACCOUNT_TYPES.developer
}

export function tabsForAccountType(accountType) {
  return accountType === ACCOUNT_TYPES.user
    ? ["wiki", "ourselves", "account", "help"]
    : ["access", "stats", "account", "help"]
}

export function defaultPageForAccountType(accountType = ACCOUNT_TYPES.developer) {
  return accountType === ACCOUNT_TYPES.user ? "wiki" : "access"
}
