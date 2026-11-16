import { render, screen } from '@testing-library/preact'
import { describe, expect, it } from 'vitest'

function Smoke() {
  return <button type="button">Hello RuntimeEnglish</button>
}

describe('ui smoke', () => {
  it('renders a simple component in happy-dom', () => {
    render(<Smoke />)
    expect(screen.getByRole('button', { name: 'Hello RuntimeEnglish' })).toBeTruthy()
  })
})
