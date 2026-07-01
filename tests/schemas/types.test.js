import { describe, expect, it } from 'vitest';
import { validate } from '../../schemas/types.js';

function validInput(overrides = {}) {
  return {
    accessToken: 'tok-123',
    order: { number: 'order-1', amount: 1000, currency: 'BRL', paymentMethod: 'credit' },
    card: { number: '4111111111111111', expirationMonth: '01', expirationYear: '2025' },
    ...overrides,
  };
}

// helper: input válido com um campo aninhado sobrescrito sem reescrever o objeto todo
function withOrder(over) { return validInput({ order: { ...validInput().order, ...over } }); }
function withCard(over) { return validInput({ card: { ...validInput().card, ...over } }); }

describe('validate', () => {
  // Critério: dados corretos → { valid: true, errors: [] }
  it('returns valid with no errors for correct data', () => {
    expect(validate(validInput())).toEqual({ valid: true, errors: [] });
  });

  // Critério: tolerância de normalização (validação aceita, mapper canoniza)
  it('accepts lowercase/padded currency, spaced card and single-digit month', () => {
    expect(validate(withOrder({ currency: ' brl ' })).valid).toBe(true);
    expect(validate(withCard({ number: '4111 1111 1111 1111' })).valid).toBe(true);
    expect(validate(withCard({ expirationMonth: '1' })).valid).toBe(true);
  });

  // Critério: cada campo inválido → mensagem descritiva em PT
  describe('rejects invalid fields with a descriptive PT message', () => {
    const cases = [
      ['accessToken ausente', validInput({ accessToken: '' }), 'accessToken é obrigatório'],
      ['amount negativo', withOrder({ amount: -1 }), 'amount deve ser positivo'],
      ['amount zero', withOrder({ amount: 0 }), 'amount deve ser positivo'],
      ['currency não suportada', withOrder({ currency: 'XYZ' }), 'currency deve ser um código ISO 4217 suportado (ex: BRL, USD, EUR)'],
      ['paymentMethod inválido', withOrder({ paymentMethod: 'pix' }), 'paymentMethod deve ser credit ou debit'],
      ['card.number com letras', withCard({ number: '4111abcd' }), 'card.number deve conter apenas dígitos'],
      ['month 13', withCard({ expirationMonth: '13' }), 'card.expirationMonth deve ser entre 01 e 12'],
      ['month 012 (3 dígitos)', withCard({ expirationMonth: '012' }), 'card.expirationMonth deve ser entre 01 e 12'],
      ['year com 3 dígitos', withCard({ expirationYear: '202' }), 'card.expirationYear deve ter 2 ou 4 dígitos'],
    ];

    it.each(cases)('%s', (_label, input, expectedMessage) => {
      const result = validate(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expectedMessage);
    });
  });

  // Critério: múltiplos erros de uma vez
  it('returns multiple errors at once', () => {
    const result = validate({
      accessToken: '',
      order: { number: '', amount: -5, currency: 'XYZ', paymentMethod: 'pix' },
      card: { number: '4111abcd', expirationMonth: '13', expirationYear: '202' },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(3);
  });

  // Robustez: input vazio/ausente não deve lançar (apenas reportar inválido)
  it('does not throw on empty, null or undefined input', () => {
    expect(() => validate({})).not.toThrow();
    expect(() => validate(null)).not.toThrow();
    expect(() => validate(undefined)).not.toThrow();
    expect(validate({}).valid).toBe(false);
  });

  // Fora de escopo: JWT e billing não são validados aqui
  it('does not validate JWT contents nor billing address (out of scope)', () => {
    // accessToken é só "texto não vazio" — não decodifica/valida o JWT
    expect(validate(validInput({ accessToken: 'not-a-real-jwt' })).valid).toBe(true);
    // billing address ausente não gera erro
    expect(validate(validInput()).valid).toBe(true);
  });
});
