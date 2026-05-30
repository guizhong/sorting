import { describe, expect, it } from 'vitest'
import { compareCards } from './oracle'
import type { DataCard } from './types'

const card = (id: DataCard['id'], value: number): DataCard => ({
  id,
  value,
  faceUp: false,
})

describe('compareCards', () => {
  it('returns the larger and smaller id, regardless of argument order', () => {
    const a = card('A', 872)
    const b = card('B', 341)
    expect(compareCards(a, b)).toEqual({ larger: 'A', smaller: 'B' })
    expect(compareCards(b, a)).toEqual({ larger: 'A', smaller: 'B' })
  })

  it('does not leak the numeric values in its output', () => {
    const result = compareCards(card('A', 999), card('B', 102))
    expect(Object.values(result)).not.toContain(999)
    expect(Object.values(result)).not.toContain(102)
  })
})
