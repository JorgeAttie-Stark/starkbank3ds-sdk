import { toIso4217Numeric } from './currency.js';

export function normalizeCardYear(year) {
  return year.length === 2 ? `20${year}` : year;
}

export function buildBpmpiFields(input) {
  const { accessToken, order, card } = input;
  return {
    bpmpi_auth: 'true',
    bpmpi_auth_notifyonly: 'false',
    bpmpi_accesstoken: accessToken,
    bpmpi_ordernumber: order.number,
    bpmpi_totalamount: String(order.amount),
    bpmpi_currency: toIso4217Numeric(order.currency),
    bpmpi_paymentmethod: order.paymentMethod,
    bpmpi_cardnumber: card.number.replace(/\s/g, ''),
    bpmpi_cardexpirationmonth: card.expirationMonth.padStart(2, '0'),
    bpmpi_cardexpirationyear: normalizeCardYear(card.expirationYear),
  };
}
