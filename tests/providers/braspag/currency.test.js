import { describe, expect, it } from 'vitest';
import {
  normalizeCurrencyCode,
  isSupportedCurrency,
  toIso4217Numeric,
} from '../../../providers/braspag/currency.js';

describe('normalizeCurrencyCode', () => {
  it('returns the canonical uppercase code for a supported currency', () => {
    expect(normalizeCurrencyCode('BRL')).toBe('BRL');
  });

  it('tolerates lowercase and surrounding whitespace', () => {
    expect(normalizeCurrencyCode('brl')).toBe('BRL');
    expect(normalizeCurrencyCode(' eur ')).toBe('EUR');
    expect(normalizeCurrencyCode('Usd')).toBe('USD');
  });

  it('returns null for a well-formed but unsupported code', () => {
    expect(normalizeCurrencyCode('XYZ')).toBeNull();
  });

  it('returns null for wrong shape (not 3 letters)', () => {
    expect(normalizeCurrencyCode('BR')).toBeNull();
    expect(normalizeCurrencyCode('BRLL')).toBeNull();
    expect(normalizeCurrencyCode('12')).toBeNull();
    expect(normalizeCurrencyCode('')).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(normalizeCurrencyCode(null)).toBeNull();
    expect(normalizeCurrencyCode(undefined)).toBeNull();
    expect(normalizeCurrencyCode(986)).toBeNull();
    expect(normalizeCurrencyCode({})).toBeNull();
  });
});

describe('isSupportedCurrency', () => {
  it('is true for supported currencies (tolerant to case/space)', () => {
    expect(isSupportedCurrency('BRL')).toBe(true);
    expect(isSupportedCurrency(' brl ')).toBe(true);
  });

  it('is false for unsupported, malformed or non-string input', () => {
    expect(isSupportedCurrency('XYZ')).toBe(false);
    expect(isSupportedCurrency('BR')).toBe(false);
    expect(isSupportedCurrency(null)).toBe(false);
    expect(isSupportedCurrency(986)).toBe(false);
  });
});

describe('toIso4217Numeric', () => {
  it('converts a supported code to its ISO 4217 numeric', () => {
    expect(toIso4217Numeric('BRL')).toBe('986');
    expect(toIso4217Numeric('EUR')).toBe('978');
    expect(toIso4217Numeric('USD')).toBe('840');
  });

  it('normalizes case and whitespace before converting', () => {
    expect(toIso4217Numeric(' brl ')).toBe('986');
  });

  it('preserves leading-zero numeric codes as strings', () => {
    // ALL → '008' (não pode virar 8)
    expect(toIso4217Numeric('ALL')).toBe('008');
  });

  it('throws on an unsupported or malformed currency', () => {
    expect(() => toIso4217Numeric('XYZ')).toThrow(/Unsupported currency/);
    expect(() => toIso4217Numeric('BR')).toThrow(/Unsupported currency/);
    expect(() => toIso4217Numeric(null)).toThrow(/Unsupported currency/);
  });
});
