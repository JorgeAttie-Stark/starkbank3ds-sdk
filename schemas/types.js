import { isSupportedCurrency } from '../providers/braspag/currency.js';

function getBpmpiFields(object, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], object);
}

const digitsOnly = (value) => typeof value === 'string' && /^\d+$/.test(value.replace(/\s/g, ''));

const validators = {
  requiredText: (value) => typeof value === 'string' && value.trim().length > 0,
  positiveAmount: (value) => typeof value === 'number' && Number.isFinite(value) && value > 0,
  isoCurrencyCode: (value) => isSupportedCurrency(value),
  creditOrDebit: (value) => value === 'credit' || value === 'debit',
  expirationMonthBetween1And12: (value) => typeof value === 'string' && /^\d{1,2}$/.test(value) && Number(value) >= 1 && Number(value) <= 12,
  expirationYearTwoOrFourDigits: (value) => typeof value === 'string' && /^\d{2}(\d{2})?$/.test(value.trim()),
}

const schema = [
  { path: 'accessToken', passes: validators.requiredText, errorMessage: 'accessToken é obrigatório' },
  { path: 'order.number', passes: validators.requiredText, errorMessage: 'order.number é obrigatório' },
  { path: 'order.amount', passes: validators.positiveAmount, errorMessage: 'amount deve ser positivo' },
  { path: 'order.currency', passes: validators.isoCurrencyCode, errorMessage: 'currency deve ser um código ISO 4217 suportado (ex: BRL, USD, EUR)' },
  { path: 'order.paymentMethod', passes: validators.creditOrDebit, errorMessage: 'paymentMethod deve ser credit ou debit' },
  { path: 'card.number', passes: validators.requiredText, errorMessage: 'card.number é obrigatório' },
  { path: 'card.number', passes: digitsOnly, errorMessage: 'card.number deve conter apenas dígitos', onlyIf: validators.requiredText },
  { path: 'card.expirationMonth', passes: validators.requiredText, errorMessage: 'card.expirationMonth é obrigatório' },
  { path: 'card.expirationMonth', passes: validators.expirationMonthBetween1And12, errorMessage: 'card.expirationMonth deve ser entre 01 e 12', onlyIf: validators.requiredText },
  { path: 'card.expirationYear', passes: validators.requiredText, errorMessage: 'card.expirationYear é obrigatório' },
  { path: 'card.expirationYear', passes: validators.expirationYearTwoOrFourDigits, errorMessage: 'card.expirationYear deve ter 2 ou 4 dígitos', onlyIf: validators.requiredText },
];

export function validate(data) {
  const errors = [];
  for (const { path, passes, onlyIf, errorMessage } of schema) {
    const value = getBpmpiFields(data, path); 
    if (onlyIf && !onlyIf(value)) continue;
    if (!passes(value)) errors.push(errorMessage);
  }
  return { valid: errors.length === 0, errors };
}
