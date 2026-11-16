import type { UiStage } from '../../../lib/i18n'
import { tAction } from '../../../lib/i18n'
import type { Exercise } from '../../../lib/types'

export type RunnerStatus = 'idle' | 'correct' | 'incorrect'

export interface NextSession {
  slug: string
  title: string
  step: string
}

export function exerciseTypeLabel(exercise: Exercise, stage: UiStage): string {
  if (exercise.type === 'choice') return tAction(stage, 'chooseOption')
  if (exercise.type === 'builder') return tAction(stage, 'orderWords')
  if (exercise.type === 'write') return tAction(stage, 'writeAnswer')
  if (exercise.type === 'listen') return 'Escucha y escribe'
  if (exercise.type === 'speak') return 'Pronuncia en voz alta'
  if (exercise.type === 'fill-blank') return 'Completa los espacios'
  if (exercise.type === 'dialogue-order') return 'Ordena el diálogo'
  if (exercise.type === 'fix-error') return 'Corrige el error'
  if (exercise.type === 'roleplay') return 'Role-play'
  return tAction(stage, 'writeAnswer')
}

export function burstConfetti(): void {
  if (typeof document === 'undefined') return
  const root = document.createElement('div')
  root.setAttribute('aria-hidden', 'true')
  Object.assign(root.style, {
    position: 'fixed',
    inset: '0',
    pointerEvents: 'none',
    overflow: 'hidden',
    zIndex: '9999',
  } as CSSStyleDeclaration)

  const colors = ['#0b8f6d', '#58d6ad', '#f3c969', '#2563eb', '#f08a8a', '#ffffff']
  const count = 28

  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement('span')
    const size = 6 + Math.random() * 6
    const left = 30 + Math.random() * 40
    const dx = (Math.random() - 0.5) * 220
    const dy = 220 + Math.random() * 260
    const rot = (Math.random() - 0.5) * 720
    const dur = 900 + Math.random() * 700

    Object.assign(piece.style, {
      position: 'absolute',
      left: `${left}%`,
      top: '30%',
      width: `${size}px`,
      height: `${size * (0.6 + Math.random() * 0.8)}px`,
      background: colors[i % colors.length],
      borderRadius: `${Math.random() > 0.5 ? 2 : 999}px`,
      opacity: '0.95',
      transform: 'translate(-50%, -50%)',
    } as CSSStyleDeclaration)

    root.appendChild(piece)
    piece.animate(
      [
        { transform: 'translate(-50%, -50%) translate(0px, 0px) rotate(0deg)', opacity: 1 },
        {
          transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      { duration: dur, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' },
    )
  }

  document.body.appendChild(root)
  window.setTimeout(() => root.remove(), 1800)
}
