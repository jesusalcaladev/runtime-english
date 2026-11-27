import { cleanup, fireEvent, render, screen } from '@testing-library/preact'
import { afterEach, describe, expect, it } from 'vitest'
import SearchView from './SearchView'

interface TestItem {
  kind: 'session' | 'vocab' | 'phrase' | 'slang' | 'exercise'
  title: string
  body: string
  href: string
  meta: string
}

const items: TestItem[] = [
  {
    kind: 'session',
    title: 'Code reviews',
    body: 'Educación en equipo',
    href: '/session/reviews.html',
    meta: 'M3 · 2 · B1-B2',
  },
  {
    kind: 'vocab',
    title: 'deploy',
    body: 'Code review en producción',
    href: '/session/reviews.html',
    meta: 'Vocabulario',
  },
  {
    kind: 'slang',
    title: 'rizz',
    body: 'Code de carisma',
    href: '/slang.html',
    meta: 'Slang · social',
  },
]

afterEach(() => cleanup())

function type(query: string) {
  fireEvent.input(screen.getByRole('searchbox', { name: 'Buscar en RuntimeEnglish' }), {
    target: { value: query },
  })
}

describe('SearchView', () => {
  it('asks for a query before showing results', () => {
    render(<SearchView items={items} />)
    expect(screen.getByText('Empieza a escribir para ver resultados.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: /^Todas/ })).toBeNull()
  })

  it('searches across kinds and reports the result count politely', () => {
    render(<SearchView items={items} />)
    type('code')

    expect(screen.getByText('3 resultados')).toBeTruthy()
    expect(screen.getByText('Code reviews')).toBeTruthy()
    expect(screen.getByText('deploy')).toBeTruthy()
    expect(screen.getByText('rizz')).toBeTruthy()
    const status = screen.getByRole('status', { name: 'Número de resultados' })
    expect(status.getAttribute('aria-live')).toBe('polite')
  })

  it('ignores accents and letter case', () => {
    render(<SearchView items={items} />)
    type('EDUCACION')

    expect(screen.getByText('Code reviews')).toBeTruthy()
    expect(screen.queryByText('deploy')).toBeNull()
  })

  it('filters results by kind and exposes the state with aria-pressed', () => {
    render(<SearchView items={items} />)
    type('code')

    const slangChip = screen.getByRole('button', { name: /^Slang/ })
    expect(slangChip.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(slangChip)

    expect(screen.getByRole('button', { name: /^Slang/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('1 resultado')).toBeTruthy()
    expect(screen.getByText('rizz')).toBeTruthy()
    expect(screen.queryByText('deploy')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /^Todas/ }))
    expect(screen.getByText('3 resultados')).toBeTruthy()
  })

  it('clears the query with the clear button and with Escape', () => {
    render(<SearchView items={items} />)
    const input = screen.getByRole('searchbox', {
      name: 'Buscar en RuntimeEnglish',
    }) as HTMLInputElement

    type('code')
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
    expect(input.value).toBe('')
    expect(screen.getByText('Empieza a escribir para ver resultados.')).toBeTruthy()

    type('deploy')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('')
  })

  it('focuses search when "/" is pressed outside an input', () => {
    render(<SearchView items={items} />)
    const input = screen.getByRole('searchbox', {
      name: 'Buscar en RuntimeEnglish',
    }) as HTMLInputElement

    fireEvent.keyDown(document, { key: '/' })
    expect(document.activeElement).toBe(input)
  })

  it('shows a helpful empty state when a filter hides everything', () => {
    render(<SearchView items={items} />)
    type('deploy')

    fireEvent.click(screen.getByRole('button', { name: /^Slang/ }))
    expect(screen.getByText(/Sin resultados para "deploy"/)).toBeTruthy()
    expect(screen.getByText(/quitar el filtro de categoría/)).toBeTruthy()
  })
})
