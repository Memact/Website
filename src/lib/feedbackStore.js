const FEEDBACK_KEY = 'memact.influence-feedback.v1'

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function linkId(link = {}) {
  const from = normalize(link.from || link.from_label || link.from_human_label)
  const to = normalize(link.to || link.to_label || link.to_human_label)
  return normalize(link.id || `${from}->${to}`).toLowerCase()
}

export function loadInfluenceFeedback() {
  if (typeof window === 'undefined') return {}
  try {
    const parsed = JSON.parse(window.localStorage.getItem(FEEDBACK_KEY) || '{}')
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

function saveInfluenceFeedback(feedback) {
  if (typeof window === 'undefined') return feedback
  window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedback || {}))
  return feedback
}

export function upsertInfluenceFeedback(link, patch = {}) {
  const id = linkId(link)
  if (!id) return loadInfluenceFeedback()
  const feedback = loadInfluenceFeedback()
  feedback[id] = {
    ...(feedback[id] || {}),
    id,
    from: normalize(link.from || link.from_label || link.from_human_label),
    to: normalize(link.to || link.to_label || link.to_human_label),
    updated_at: new Date().toISOString(),
    ...patch,
  }
  return saveInfluenceFeedback(feedback)
}

export function removeInfluenceFeedback(link) {
  const id = linkId(link)
  const feedback = loadInfluenceFeedback()
  delete feedback[id]
  return saveInfluenceFeedback(feedback)
}

export function correctionForLink(link, feedback = loadInfluenceFeedback()) {
  return feedback[linkId(link)] || null
}

export function applyFeedbackToAnswerMeta(answerMeta) {
  if (!answerMeta) return answerMeta
  const feedback = loadInfluenceFeedback()
  const influenceSignals = (Array.isArray(answerMeta.influenceSignals) ? answerMeta.influenceSignals : [])
    .map((signal) => {
      const correction = correctionForLink(signal, feedback)
      return {
        ...signal,
        user_feedback: correction?.status || '',
        user_feedback_score:
          correction?.status === 'confirmed' ? 1 :
            correction?.status === 'rejected' || correction?.status === 'removed' ? -1 : 0,
        edited_source: correction?.source || '',
        edited_schema_label: correction?.schema_label || '',
      }
    })
    .filter((signal) => signal.user_feedback !== 'rejected' && signal.user_feedback !== 'removed')
    .sort((left, right) => right.user_feedback_score - left.user_feedback_score || Number(right.confidence || 0) - Number(left.confidence || 0))

  return {
    ...answerMeta,
    influenceSignals,
  }
}
