import { useMemo } from 'react'
import katex from 'katex'
import 'katex/contrib/mhchem/mhchem.js'

const MATH_TOKEN_PATTERN =
  /(\\begin\{([a-zA-Z*]+)\}[\s\S]*?\\end\{\2\}|\\(?:ce|pu)\{[^{}]+\}|\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|(?<!\\)\$[^$\n]+?(?<!\\)\$)/g

function parseSegments(text) {
  const value = String(text || '')
  const segments = []
  let lastIndex = 0

  value.replace(MATH_TOKEN_PATTERN, (match, _full, _env, offset) => {
    if (offset > lastIndex) {
      segments.push({
        type: 'text',
        value: value.slice(lastIndex, offset),
      })
    }

    let math = match
    let displayMode = false

    if (match.startsWith('$$') && match.endsWith('$$')) {
      math = match.slice(2, -2)
      displayMode = true
    } else if (match.startsWith('\\[') && match.endsWith('\\]')) {
      math = match.slice(2, -2)
      displayMode = true
    } else if (match.startsWith('\\(') && match.endsWith('\\)')) {
      math = match.slice(2, -2)
    } else if (match.startsWith('$') && match.endsWith('$')) {
      math = match.slice(1, -1)
    } else if (match.startsWith('\\begin{')) {
      displayMode = true
    } else if (match.startsWith('\\ce{') || match.startsWith('\\pu{')) {
      displayMode = false
    }

    segments.push({
      type: 'math',
      value: math.trim(),
      displayMode,
      raw: match,
    })

    lastIndex = offset + match.length
    return match
  })

  if (lastIndex < value.length) {
    segments.push({
      type: 'text',
      value: value.slice(lastIndex),
    })
  }

  return segments.length
    ? segments
    : [
        {
          type: 'text',
          value,
        },
      ]
}

function renderMathSegment(value, displayMode) {
  try {
    return katex.renderToString(value, {
      displayMode,
      throwOnError: false,
      strict: 'ignore',
      output: 'html',
      trust: false,
    })
  } catch {
    return ''
  }
}

export default function MathRichText({ text, className = '', inline = false }) {
  const value = String(text || '')
  const segments = useMemo(() => parseSegments(value), [value])
  const Tag = inline ? 'span' : 'div'
  const classes = [
    'math-rich-text',
    inline ? 'math-rich-text--inline' : 'math-rich-text--block',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <Tag className={classes}>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return (
            <span key={`text-${index}`} className="math-rich-text__text">
              {segment.value}
            </span>
          )
        }

        const rendered = renderMathSegment(segment.value, segment.displayMode)
        if (!rendered) {
          return (
            <span key={`raw-${index}`} className="math-rich-text__text">
              {segment.raw}
            </span>
          )
        }

        return (
          <span
            key={`math-${index}`}
            className={`math-rich-text__math ${
              segment.displayMode ? 'math-rich-text__math--block' : 'math-rich-text__math--inline'
            }`}
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        )
      })}
    </Tag>
  )
}
