import { describe, expect, it } from 'vitest'
import { certificateQrSvg } from './certificateQr'

describe('certificateQrSvg', () => {
  it('builds a self-contained, scalable SVG with a white quiet zone', () => {
    const svg = certificateQrSvg('https://runtimeenglish.dev/verify?id=ABC123')
    expect(svg).toContain('<svg')
    expect(svg).toContain('viewBox=')
    expect(svg).toContain('fill="white"')
    expect(svg).toContain('<path')
  })

  it('encodes the exact verification link', () => {
    const first = certificateQrSvg('https://runtimeenglish.dev/verify?id=ABC123')
    const second = certificateQrSvg('https://runtimeenglish.dev/verify?id=ZZZ999')
    expect(first).not.toBe(second)
    expect(certificateQrSvg('https://runtimeenglish.dev/verify?id=ABC123')).toBe(first)
  })
})
