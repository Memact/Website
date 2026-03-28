const SMOLLM_MODEL_ID = 'HuggingFaceTB/SmolLM2-135M-Instruct'
const SUMMARY_CACHE = new Map()
const MAX_CACHE_ENTRIES = 24

let generatorPromise = null
let generatorFailed = false

function normalize(value, maxLength = 0) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim()

  if (!text) {
    return ''
  }

  if (maxLength && text.length > maxLength) {
    return `${text.slice(0, maxLength - 3).trim()}...`
  }

  return text
}

function trimCache() {
  while (SUMMARY_CACHE.size > MAX_CACHE_ENTRIES) {
    const firstKey = SUMMARY_CACHE.keys().next().value
    SUMMARY_CACHE.delete(firstKey)
  }
}

function buildCacheKey({ query, summary, result }) {
  return JSON.stringify([
    normalize(query, 180),
    normalize(summary, 320),
    normalize(result?.title, 180),
    normalize(result?.domain, 120),
    normalize(result?.application, 80),
    normalize(result?.pageTypeLabel || result?.pageType, 80),
  ])
}

function extractAssistantText(output) {
  if (!output) {
    return ''
  }

  const first = Array.isArray(output) ? output[0] : output
  const generated = first?.generated_text

  if (Array.isArray(generated)) {
    const lastMessage = [...generated].reverse().find((entry) => entry?.role === 'assistant')
    return normalize(lastMessage?.content, 320)
  }

  return normalize(generated, 320)
}

function cleanGeneratedSummary(value) {
  return normalize(
    String(value || '')
      .replace(/^summary\s*:\s*/i, '')
      .replace(/^rewritten summary\s*:\s*/i, '')
      .split(/\n+/)[0]
      .replace(/^["'`]+|["'`]+$/g, '')
      .trim(),
    320
  )
}

function quotedValues(text) {
  return Array.from(String(text || '').matchAll(/"([^"]+)"/g), (match) => normalize(match[1]))
}

function numericValues(text) {
  return Array.from(String(text || '').matchAll(/\b\d+\b/g), (match) => match[0])
}

function includesAllTokens(candidate, tokens) {
  const lowered = candidate.toLowerCase()
  return tokens.every((token) => lowered.includes(String(token).toLowerCase()))
}

function validateCandidate(candidate, fallback, result) {
  const normalizedCandidate = cleanGeneratedSummary(candidate)
  if (!normalizedCandidate) {
    return ''
  }

  if (
    /^(here('| i)?s|i rewrote|rewritten summary|note:|explanation:|cannot|sorry)/i.test(
      normalizedCandidate
    )
  ) {
    return ''
  }

  const importantQuotedValues = [
    ...quotedValues(fallback),
    ...quotedValues(result?.title),
  ].filter(Boolean)
  if (importantQuotedValues.length && !includesAllTokens(normalizedCandidate, importantQuotedValues)) {
    return ''
  }

  const importantNumbers = [...numericValues(fallback), ...numericValues(result?.structuredSummary)].filter(Boolean)
  if (importantNumbers.length && !includesAllTokens(normalizedCandidate, importantNumbers)) {
    return ''
  }

  if (normalizedCandidate.length < 18) {
    return ''
  }

  return /[.!?]$/.test(normalizedCandidate) ? normalizedCandidate : `${normalizedCandidate}.`
}

function buildMessages({ query, summary, result }) {
  return [
    {
      role: 'system',
      content:
        'You rewrite UI copy for a local memory search app. Keep every fact unchanged. Do not add new facts. Keep names, counts, dates, apps, sites, and quoted queries unchanged. Return exactly one sentence.',
    },
    {
      role: 'user',
      content: [
        'Rewrite this summary for grammar and clarity.',
        `Query: ${normalize(query, 160) || 'Local search'}`,
        `Current summary: ${normalize(summary, 320)}`,
        `Top result title: ${normalize(result?.title, 180) || 'Local memory'}`,
        `Top result site: ${normalize(result?.domain, 120) || 'Unknown site'}`,
        `Top result app: ${normalize(result?.application, 80) || 'Browser'}`,
        `Top result type: ${normalize(result?.pageTypeLabel || result?.pageType, 80) || 'Web page'}`,
        'Return only the rewritten sentence.',
      ].join('\n'),
    },
  ]
}

async function getGenerator() {
  if (generatorFailed) {
    return null
  }

  if (!generatorPromise) {
    generatorPromise = (async () => {
      const { pipeline, env } = await import('@xenova/transformers')
      env.allowRemoteModels = true
      env.useBrowserCache = true

      return pipeline('text-generation', SMOLLM_MODEL_ID, {
        device: 'webgpu',
        dtype: 'q4',
      })
    })().catch((error) => {
      generatorFailed = true
      generatorPromise = null
      console.warn('Memact local language model is unavailable.', error)
      return null
    })
  }

  return generatorPromise
}

export function supportsLocalLanguageModel(environment) {
  return Boolean(environment?.localLanguageModelSupported)
}

export async function polishAnswerSummary({ query, answerMeta, results, environment }) {
  if (!supportsLocalLanguageModel(environment)) {
    return null
  }

  const summary = normalize(answerMeta?.summary, 320)
  const primaryResult = results?.[0]

  if (!summary || !primaryResult) {
    return null
  }

  const cacheKey = buildCacheKey({ query, summary, result: primaryResult })
  if (SUMMARY_CACHE.has(cacheKey)) {
    return SUMMARY_CACHE.get(cacheKey)
  }

  const generator = await getGenerator()
  if (!generator) {
    return null
  }

  try {
    const output = await generator(buildMessages({ query, summary, result: primaryResult }), {
      max_new_tokens: 72,
      do_sample: false,
      repetition_penalty: 1.05,
    })
    const candidate = extractAssistantText(output)
    const polishedSummary = validateCandidate(candidate, summary, primaryResult)
    const response = polishedSummary && polishedSummary !== summary
      ? {
          summary: polishedSummary,
          model: SMOLLM_MODEL_ID,
          applied: true,
        }
      : {
          summary,
          model: SMOLLM_MODEL_ID,
          applied: false,
        }

    SUMMARY_CACHE.set(cacheKey, response)
    trimCache()
    return response
  } catch (error) {
    console.warn('Memact local language polish failed.', error)
    return null
  }
}
