import assert from "node:assert/strict"
import test from "node:test"
import { isProtectedPage, normalizePortalPath, pageFromLocation, routeForPage } from "../portal-routes.js"

test("portal routes map clean URL pages", () => {
  assert.equal(pageFromLocation({ pathname: "/" }), "home")
  assert.equal(pageFromLocation({ pathname: "/Dashboard" }), "access")
  assert.equal(pageFromLocation({ pathname: "/Stats" }), "access")
  assert.equal(pageFromLocation({ pathname: "/Access" }), "access")
  assert.equal(pageFromLocation({ pathname: "/access" }), "access")
  assert.equal(pageFromLocation({ pathname: "/Account" }), "account")
  assert.equal(pageFromLocation({ pathname: "/Settings" }), "account")
  assert.equal(pageFromLocation({ pathname: "/Wiki" }), "wiki")
  assert.equal(pageFromLocation({ pathname: "/Yourself" }), "wiki")
  assert.equal(pageFromLocation({ pathname: "/Ourselves" }), "wiki")
  assert.equal(pageFromLocation({ pathname: "/DataTransparency" }), "wiki")
  assert.equal(pageFromLocation({ pathname: "/Help" }), "help")
  assert.equal(pageFromLocation({ pathname: "/Learn" }), "learn")
  assert.equal(pageFromLocation({ pathname: "/learn/" }), "learn")
  assert.equal(pageFromLocation({ pathname: "/u/keepsloading" }), "publicWiki")
  assert.equal(pageFromLocation({ pathname: "/connect" }), "connect")
})

test("legacy dashboard and login paths normalize to current routes", () => {
  assert.equal(normalizePortalPath("/dashboard"), "/Dashboard")
  assert.equal(normalizePortalPath("/stats"), "/Dashboard")
  assert.equal(normalizePortalPath("/Access"), "/Dashboard")
  assert.equal(normalizePortalPath("/login"), "/#sign-in")
  assert.equal(normalizePortalPath("/access"), "/Dashboard")
  assert.equal(normalizePortalPath("/account"), "/Settings")
  assert.equal(normalizePortalPath("/data-transparency"), "/Yourself")
  assert.equal(normalizePortalPath("/ourselves"), "/Yourself")
  assert.equal(normalizePortalPath("/learn"), "/Learn")
  assert.equal(normalizePortalPath("/playground"), "/playground")
})

test("route metadata keeps help public and account/wiki protected", () => {
  assert.equal(isProtectedPage("help"), false)
  assert.equal(isProtectedPage("learn"), false)
  assert.equal(isProtectedPage("publicWiki"), false)
  assert.equal(isProtectedPage("account"), true)
  assert.equal(isProtectedPage("wiki"), true)
  assert.equal(isProtectedPage("stats"), false)
  assert.equal(routeForPage("access"), "/Dashboard")
  assert.equal(routeForPage("wiki"), "/Yourself")
  assert.equal(routeForPage("account"), "/Settings")
  assert.equal(routeForPage("help"), "/Help")
  assert.equal(routeForPage("learn"), "/Learn")
})
