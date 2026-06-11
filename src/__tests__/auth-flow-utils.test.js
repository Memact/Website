import assert from "node:assert/strict"
import test from "node:test"
import {
  detectAuthFlowFromUrl,
  getAuthEmailTypeFromUrl,
  getAuthTokenHashFromUrl,
  getAuthCodeFromUrl,
  shouldCheckSessionOnLoad
} from "../auth-flow-utils.js"

test("detectAuthFlowFromUrl correctly parses flow types", () => {
  // Invite flow
  assert.equal(detectAuthFlowFromUrl({ pathname: "/auth/confirm", search: "?type=invite", hash: "" }), "invite")
  assert.equal(detectAuthFlowFromUrl({ pathname: "/", search: "", hash: "#type=invite" }), "invite")

  // Recovery flow
  assert.equal(detectAuthFlowFromUrl({ pathname: "/auth/confirm", search: "?type=recovery", hash: "" }), "recovery")
  assert.equal(detectAuthFlowFromUrl({ pathname: "/", search: "", hash: "#type=recovery" }), "recovery")

  // Magic link / email flow (default login flow)
  assert.equal(detectAuthFlowFromUrl({ pathname: "/auth/confirm", search: "?type=magiclink", hash: "" }), "default")
  assert.equal(detectAuthFlowFromUrl({ pathname: "/auth/confirm", search: "?type=email", hash: "" }), "default")

  // Signup flow
  assert.equal(detectAuthFlowFromUrl({ pathname: "/auth/confirm", search: "?type=signup", hash: "" }), "verified")
  assert.equal(detectAuthFlowFromUrl({ pathname: "/", search: "?type=signup", hash: "" }), "verified")

  // Stripped Supabase URL pathname
  assert.equal(detectAuthFlowFromUrl({ pathname: "/auth/confirm", search: "", hash: "" }), "default")
})

test("getAuthEmailTypeFromUrl extracts allowed email flow types", () => {
  assert.equal(getAuthEmailTypeFromUrl({ search: "?type=recovery", hash: "" }), "recovery")
  assert.equal(getAuthEmailTypeFromUrl({ search: "?type=magiclink", hash: "" }), "magiclink")
  assert.equal(getAuthEmailTypeFromUrl({ search: "?type=email", hash: "" }), "email")
  assert.equal(getAuthEmailTypeFromUrl({ search: "", hash: "#type=invite" }), "invite")
  // Default fallback
  assert.equal(getAuthEmailTypeFromUrl({ search: "", hash: "" }), "signup")
  assert.equal(getAuthEmailTypeFromUrl({ search: "?type=invalid_type", hash: "" }), "signup")
})

test("getAuthTokenHashFromUrl extracts token hash", () => {
  assert.equal(getAuthTokenHashFromUrl({ search: "?token_hash=abc", hash: "" }), "abc")
  assert.equal(getAuthTokenHashFromUrl({ search: "", hash: "#token_hash=xyz" }), "xyz")
  assert.equal(getAuthTokenHashFromUrl({ search: "", hash: "" }), "")
})

test("getAuthCodeFromUrl extracts auth code", () => {
  assert.equal(getAuthCodeFromUrl({ search: "?code=123", hash: "" }), "123")
  assert.equal(getAuthCodeFromUrl({ search: "", hash: "" }), "")
})

test("shouldCheckSessionOnLoad verifies loading conditions", () => {
  // Protected pages
  assert.equal(shouldCheckSessionOnLoad({ pathname: "/Settings", search: "", hash: "" }), true)
  assert.equal(shouldCheckSessionOnLoad({ pathname: "/Dashboard", search: "", hash: "" }), true)

  // Auth confirm path
  assert.equal(shouldCheckSessionOnLoad({ pathname: "/auth/confirm", search: "", hash: "" }), true)

  // Auth payloads
  assert.equal(shouldCheckSessionOnLoad({ pathname: "/", search: "?code=xyz", hash: "" }), true)
  assert.equal(shouldCheckSessionOnLoad({ pathname: "/", search: "?token_hash=abc", hash: "" }), true)
  assert.equal(shouldCheckSessionOnLoad({ pathname: "/", search: "?type=recovery", hash: "" }), true)

  // Default non-auth/non-protected
  assert.equal(shouldCheckSessionOnLoad({ pathname: "/Help", search: "", hash: "" }), false)
})
