import assert from "node:assert/strict"
import test from "node:test"
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SCOPES,
  defaultCategoriesForPolicy,
  defaultScopesForPolicy,
  normalizeSelectedCategories,
  normalizeSelectedScopes
} from "../access-policy.js"

test("defaultScopesForPolicy keeps existing defaults when policy is unavailable", () => {
  assert.deepEqual(defaultScopesForPolicy(null), DEFAULT_SCOPES)
})

test("defaultScopesForPolicy filters defaults to scopes published by Access", () => {
  const policy = {
    scopes: {
      "context:write": {},
      "memory:read_summary": {},
      "experimental:only": {}
    }
  }

  assert.deepEqual(defaultScopesForPolicy(policy), ["context:write", "memory:read_summary"])
})

test("defaultScopesForPolicy falls back to Access scopes when no default is available", () => {
  const policy = {
    scopes: {
      "custom:read": {},
      "custom:write": {}
    }
  }

  assert.deepEqual(defaultScopesForPolicy(policy), ["custom:read", "custom:write"])
})

test("normalizeSelectedScopes removes duplicates and unknown policy scopes", () => {
  const policy = {
    scopes: {
      "context:write": {},
      "memory:write": {}
    }
  }

  assert.deepEqual(
    normalizeSelectedScopes(["context:write", "unknown:scope", "memory:write", "context:write"], policy),
    ["context:write", "memory:write"]
  )
})

test("defaultCategoriesForPolicy keeps category defaults when policy is unavailable", () => {
  assert.deepEqual(defaultCategoriesForPolicy(null), DEFAULT_CATEGORIES)
})

test("defaultCategoriesForPolicy respects Access category defaults", () => {
  const policy = {
    activity_categories: {
      "fitness": {},
      "preferences": {},
      "dietary_preferences": {}
    },
    default_app_categories: ["preferences", "dietary_preferences"]
  }

  assert.deepEqual(defaultCategoriesForPolicy(policy), ["preferences", "dietary_preferences"])
})

test("normalizeSelectedCategories removes duplicates and unknown categories", () => {
  const policy = {
    activity_categories: {
      "fitness": {},
      "preferences": {}
    }
  }

  assert.deepEqual(
    normalizeSelectedCategories(["fitness", "unknown", "preferences", "fitness"], policy),
    ["fitness", "preferences"]
  )
})

