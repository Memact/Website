import { pageFromLocation, isProtectedPage } from "./portal-routes.js"

export function detectAuthFlowFromUrl(locationLike = globalThis.window?.location) {
  if (!locationLike) return "default"
  const path = (locationLike.pathname || "").toLowerCase()
  const query = `${locationLike.search || ""}${locationLike.hash || ""}`.toLowerCase()

  if (query.includes("type=invite")) return "invite"
  if (query.includes("type=recovery")) return "recovery"
  if (query.includes("type=email") || query.includes("type=magiclink")) return "default"
  if (query.includes("type=signup")) return "verified"
  if (path === "/auth/confirm" && query.includes("type=signup")) return "verified"

  return "default"
}

export function getAuthEmailTypeFromUrl(locationLike = globalThis.window?.location) {
  if (!locationLike) return "signup"
  const searchParams = new URLSearchParams(locationLike.search || "")
  const hashParams = new URLSearchParams(String(locationLike.hash || "").replace(/^#/, ""))
  const requestedType = String(searchParams.get("type") || hashParams.get("type") || "signup").toLowerCase()
  const allowedTypes = new Set(["signup", "magiclink", "recovery", "invite", "email_change", "email"])
  return allowedTypes.has(requestedType) ? requestedType : "signup"
}

export function getAuthTokenHashFromUrl(locationLike = globalThis.window?.location) {
  if (!locationLike) return ""
  const hashParams = new URLSearchParams(String(locationLike.hash || "").replace(/^#/, ""))
  return new URLSearchParams(locationLike.search || "").get("token_hash") || hashParams.get("token_hash") || ""
}

export function getAuthCodeFromUrl(locationLike = globalThis.window?.location) {
  if (!locationLike) return ""
  return new URLSearchParams(locationLike.search || "").get("code") || ""
}

export function shouldCheckSessionOnLoad(locationLike = globalThis.window?.location) {
  if (!locationLike) return false
  const page = pageFromLocation(locationLike)
  const path = (locationLike.pathname || "").toLowerCase()
  const authPayload = `${locationLike.search || ""}${locationLike.hash || ""}`.toLowerCase()
  return page === "home" ||
    isProtectedPage(page) ||
    path === "/auth/confirm" ||
    authPayload.includes("code=") ||
    authPayload.includes("token_hash=") ||
    authPayload.includes("access_token=") ||
    authPayload.includes("type=signup") ||
    authPayload.includes("type=invite") ||
    authPayload.includes("type=recovery") ||
    authPayload.includes("type=magiclink")
}
