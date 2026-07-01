import { describe, expect, it } from 'vitest';
import { buildBpmpiFields, normalizeCardYear } from '../../../providers/braspag/buildBpmpiFields.js';

function baseInput(overrides = {}) {
  return {
    accessToken: 'tok-123',
    order: { number: 'order-1', amount: 1000, currency: 'BRL', paymentMethod: 'credit' },
    card: { number: '4111111111111111', expirationMonth: '01', expirationYear: '2025' },
    ...overrides,
  };
}

describe('buildBpmpiFields', () => {
  it('maps a clean input to canonical bpmpi_* fields', () => {
    const fields = buildBpmpiFields(baseInput());

    expect(fields).toEqual({
      bpmpi_auth: 'true',
      bpmpi_auth_notifyonly: 'false',
      bpmpi_accesstoken: 'tok-123',
      bpmpi_ordernumber: 'order-1',
      bpmpi_totalamount: '1000',
      bpmpi_currency: '986',
      bpmpi_paymentmethod: 'credit',
      bpmpi_cardnumber: '4111111111111111',
      bpmpi_cardexpirationmonth: '01',
      bpmpi_cardexpirationyear: '2025',
    });
  });

  // #4 — currency: alfabético (tolerante a caixa/espaço) → ISO 4217 numérico
  it('converts currency to ISO 4217 numeric, tolerating case and spaces', () => {
    expect(buildBpmpiFields(baseInput({ order: { number: 'o', amount: 1, currency: 'brl', paymentMethod: 'credit' } })).bpmpi_currency).toBe('986');
    expect(buildBpmpiFields(baseInput({ order: { number: 'o', amount: 1, currency: ' EUR ', paymentMethod: 'credit' } })).bpmpi_currency).toBe('978');
  });

  // #5 — cartão: remove espaços
  it('strips whitespace from the card number', () => {
    const fields = buildBpmpiFields(baseInput({ card: { number: '4111 1111 1111 1111', expirationMonth: '01', expirationYear: '2025' } }));
    expect(fields.bpmpi_cardnumber).toBe('4111111111111111');
  });

  // #3 — mês: padStart MM
  it('pads single-digit expiration month to MM', () => {
    const fields = buildBpmpiFields(baseInput({ card: { number: '4111111111111111', expirationMonth: '1', expirationYear: '2025' } }));
    expect(fields.bpmpi_cardexpirationmonth).toBe('01');
  });

  it('normalizes 2-digit year to 4 digits and leaves 4-digit year untouched', () => {
    expect(normalizeCardYear('25')).toBe('2025');
    expect(normalizeCardYear('2025')).toBe('2025');
  });

  it('throws on unsupported currency (defensive — mapper runs after validate)', () => {
    expect(() => buildBpmpiFields(baseInput({ order: { number: 'o', amount: 1, currency: 'XYZ', paymentMethod: 'credit' } }))).toThrow(/Unsupported currency/);
  });
});
