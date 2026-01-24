import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDateBR, formatNumber, formatChannelName } from './format'

// Helper para normalizar espaços (Intl.NumberFormat usa non-breaking space)
const normalizeSpaces = (str: string) => str.replace(/\s/g, ' ')

describe('formatCurrency', () => {
  it('should format positive numbers as BRL currency', () => {
    expect(normalizeSpaces(formatCurrency(1234.56))).toBe('R$ 1.234,56')
    expect(normalizeSpaces(formatCurrency(0))).toBe('R$ 0,00')
    expect(normalizeSpaces(formatCurrency(99.9))).toBe('R$ 99,90')
  })

  it('should format negative numbers', () => {
    expect(normalizeSpaces(formatCurrency(-100))).toBe('-R$ 100,00')
  })

  it('should handle large numbers', () => {
    expect(normalizeSpaces(formatCurrency(1000000))).toBe('R$ 1.000.000,00')
  })
})

describe('formatDateBR', () => {
  it('should format date string to Brazilian format', () => {
    expect(formatDateBR('2024-01-15')).toBe('15/01/2024')
    expect(formatDateBR('2024-12-31')).toBe('31/12/2024')
  })

  it('should handle ISO date strings', () => {
    expect(formatDateBR('2024-06-20T10:30:00Z')).toBe('20/06/2024')
  })
})

describe('formatNumber', () => {
  it('should format numbers with Brazilian locale', () => {
    expect(formatNumber(1234.56)).toBe('1.234,56')
    expect(formatNumber(0.5)).toBe('0,50')
  })
})

describe('formatChannelName', () => {
  it('should return correct channel names', () => {
    expect(formatChannelName('DIRECT')).toBe('Direto')
    expect(formatChannelName('IFOOD')).toBe('iFood')
  })
})
