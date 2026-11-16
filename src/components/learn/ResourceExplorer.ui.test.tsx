import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it } from 'vitest'
import type { LearningResource } from '../../data/learningResources'
import ResourceExplorer from './ResourceExplorer'

const resources: LearningResource[] = [
  {
    id: 'yt',
    name: 'BBC YouTube',
    url: 'https://youtube.com',
    kind: 'youtube',
    level: 'A1-A2',
    focus: ['Listening'],
    description: 'Canal con subtítulos.',
    tip: 'Escucha dos veces.',
  },
  {
    id: 'web',
    name: 'YouGlish',
    url: 'https://youglish.com',
    kind: 'web',
    level: 'Todos',
    focus: ['Pronunciación'],
    description: 'Ejemplos reales.',
    tip: 'Busca phrasal verbs.',
  },
]

afterEach(() => cleanup())

describe('ResourceExplorer', () => {
  it('filters by kind and searches by name', () => {
    render(<ResourceExplorer resources={resources} />)
    expect(screen.getByText('2 recursos')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'YouTube' }))
    expect(screen.getByText('1 recurso')).toBeTruthy()
    expect(screen.queryByText('YouGlish')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    fireEvent.input(screen.getByRole('searchbox'), { target: { value: 'youglish' } })
    expect(screen.getByText('1 recurso')).toBeTruthy()
    expect(screen.getByText('YouGlish')).toBeTruthy()
  })
})
