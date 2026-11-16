import { useEffect, useState } from 'preact/hooks'

export type MascotMood = 'idle' | 'thinking' | 'listening' | 'correct' | 'incorrect' | 'finished'

interface Props {
  mood?: MascotMood
  size?: 'sm' | 'md' | 'lg'
  lines?: string[]
  className?: string
}

const ART_SIZES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
}

/** A round buddy with pill eyes. One shape, one color, a few things to say. */
export default function Mascot({ mood = 'idle', size = 'sm', lines = [], className = '' }: Props) {
  const linesKey = lines.join('\u0000')
  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    setLineIndex(0)
    if (lines.length < 2) return
    const timer = window.setInterval(() => {
      setLineIndex((current) => (current + 1) % lines.length)
    }, 3200)
    return () => window.clearInterval(timer)
  }, [linesKey])

  const line = lines.length ? lines[lineIndex % lines.length] : undefined

  return (
    <div class={`mascot mascot--${mood} ${className}`}>
      <svg
        class={`mascot__art ${ART_SIZES[size]} shrink-0 overflow-visible`}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <g class="mascot__body">
          <circle cx="24" cy="24" r="17" fill="var(--mascot-color)" />
        </g>
        <g class="mascot__eyes" fill="#ffffff">
          <rect x="16.5" y="19.5" width="5.5" height="10" rx="2.75" />
          <rect x="26" y="19.5" width="5.5" height="10" rx="2.75" />
        </g>
      </svg>

      {line ? (
        <span key={lineIndex} class="mascot__line" aria-live="polite">
          {line}
        </span>
      ) : null}
    </div>
  )
}
