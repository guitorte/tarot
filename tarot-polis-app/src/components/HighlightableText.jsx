import { useMemo } from 'react'
import { highlightStyle } from '../data/highlightColors.js'
import { toSegments } from '../lib/ranges.js'

/**
 * Renders one interpretation, cut into runs so highlights can be painted
 * without touching the source text.
 *
 * Every run carries its own start offset, which is how a browser selection is
 * mapped back onto the source string (see useTextSelection).
 */
export default function HighlightableText({
  text,
  ranges,
  card,
  author,
  onPickHighlight,
}) {
  const segments = useMemo(() => toSegments(text, ranges), [text, ranges])

  return (
    <p
      className="text-sm leading-relaxed"
      style={{ color: 'rgba(250, 250, 250, 0.9)' }}
      data-passage=""
      data-card={card}
      data-author={author}
    >
      {segments.map((segment) =>
        segment.highlight ? (
          <mark
            key={segment.start}
            data-offset={segment.start}
            style={highlightStyle(segment.highlight.color)}
            onClick={(event) => {
              event.stopPropagation()
              onPickHighlight({
                card,
                author,
                start: segment.highlight.start,
                end: segment.highlight.end,
                rect: event.currentTarget.getBoundingClientRect(),
                existing: true,
              })
            }}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={segment.start} data-offset={segment.start}>
            {segment.text}
          </span>
        ),
      )}
    </p>
  )
}
