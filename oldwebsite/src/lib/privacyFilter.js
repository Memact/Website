const SENSITIVE_RULES = [
  {
    zone: 'banking',
    patterns: ['bank', 'upi', 'netbanking', 'credit card', 'debit card', 'paypal', 'stripe', 'razorpay'],
  },
  {
    zone: 'medical',
    patterns: ['medical', 'hospital', 'clinic', 'patient', 'health', 'therapy', 'doctor', 'prescription', 'mychart'],
  },
  {
    zone: 'credentials',
    patterns: ['password', 'login', 'signin', 'sign in', 'auth', 'otp', '2fa', 'account recovery'],
  },
  {
    zone: 'private_form',
    patterns: ['checkout', 'billing', 'address form', 'private form', 'application form', 'payment'],
  },
  {
    zone: 'school_admin',
    patterns: ['student portal', 'college portal', 'university portal', 'exam result', 'admissions portal', 'school admin'],
  },
  {
    zone: 'explicit_private',
    patterns: ['nsfw', 'adult', 'porn', 'private message', 'personal mail', 'inbox'],
  },
]

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

function sourceText(item = {}) {
  return normalize([
    item.url,
    item.source_url,
    item.domain,
    item.title,
    item.label,
    item.summary,
    item.snippet,
    item.source_type,
    item.type,
  ].filter(Boolean).join(' '))
}

export function classifyPrivacyZone(item = {}) {
  const text = sourceText(item)
  const matched = SENSITIVE_RULES.find((rule) => rule.patterns.some((pattern) => text.includes(pattern)))
  return matched?.zone || 'allowed'
}

export function isSensitiveActivity(item = {}) {
  return classifyPrivacyZone(item) !== 'allowed'
}

function filterArray(values = []) {
  return (Array.isArray(values) ? values : []).filter((item) => !isSensitiveActivity(item))
}

function filterMemorySignals(values = []) {
  return (Array.isArray(values) ? values : [])
    .map((signal) => ({
      ...signal,
      sources: filterArray(signal.sources),
    }))
    .filter((signal) => !isSensitiveActivity(signal) && (signal.sources?.length || signal.label || signal.summary))
}

function filterRagContext(ragContext = null) {
  if (!ragContext) return null
  return {
    ...ragContext,
    sources: filterArray(ragContext.sources),
    context_items: filterArray(ragContext.context_items),
  }
}

export function filterCloudPayloadForPrivacy(payload = {}) {
  const request = payload.request || {}
  const evidence = request.evidence || {}
  const sources = filterArray(payload.sources)
  return {
    ...payload,
    sources,
    privacy: {
      pre_ai_filter_applied: true,
      removed_source_count: Math.max(0, (payload.sources || []).length - sources.length),
    },
    request: {
      ...request,
      evidence: {
        ...evidence,
        origin_sources: filterArray(evidence.origin_sources),
        memory_signals: filterMemorySignals(evidence.memory_signals),
        cognitive_schema_memories: filterArray(evidence.cognitive_schema_memories),
        rag_context: filterRagContext(evidence.rag_context),
      },
    },
  }
}

export function describePrivacyFiltering(items = []) {
  const counts = new Map()
  ;(Array.isArray(items) ? items : []).forEach((item) => {
    const zone = classifyPrivacyZone(item)
    if (zone !== 'allowed') counts.set(zone, (counts.get(zone) || 0) + 1)
  })
  return [...counts.entries()].map(([zone, count]) => ({ zone, count }))
}
