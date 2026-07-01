import { describe, expect, it } from 'vitest';
import { renderHiddenFields } from '../../../providers/braspag/renderHiddenFields.js';

function createContainer() {
  return document.createElement('div');
}

function getInput(container, className) {
  return container.querySelector(`.${className}`);
}

describe('renderHiddenFields', () => {
  it('creates hidden input for each present field', () => {
    const container = createContainer();

    renderHiddenFields(container, {
      bpmpi_cardnumber: '4111111111111111',
      bpmpi_totalamount: '1000',
    });

    const card = getInput(container, 'bpmpi_cardnumber');
    expect(card?.type).toBe('hidden');
    expect(card?.className).toBe('bpmpi_cardnumber');
    expect(card?.value).toBe('4111111111111111');

    const amount = getInput(container, 'bpmpi_totalamount');
    expect(amount?.value).toBe('1000');
  });

  it('skips absent fields', () => {
    const container = createContainer();

    renderHiddenFields(container, {
      bpmpi_cardnumber: '4111111111111111',
      bpmpi_currency: undefined,
      bpmpi_ordernumber: null,
    });

    expect(container.querySelectorAll('input')).toHaveLength(1);
    expect(getInput(container, 'bpmpi_currency')).toBeNull();
    expect(getInput(container, 'bpmpi_ordernumber')).toBeNull();
  });

  it('replaces inputs on second call', () => {
    const container = createContainer();

    renderHiddenFields(container, { bpmpi_ordernumber: '1' });
    renderHiddenFields(container, { bpmpi_ordernumber: '2' });

    expect(container.querySelectorAll('input')).toHaveLength(1);
    expect(getInput(container, 'bpmpi_ordernumber')?.value).toBe('2');
  });

  it('renders bpmpi_auth with the given value (renderer does not decide auth mode)', () => {
    const container = createContainer();

    renderHiddenFields(container, { bpmpi_auth: 'false' });

    expect(getInput(container, 'bpmpi_auth')?.value).toBe('false');
  });

  it('clears the container without throwing when data is null or undefined', () => {
    const container = createContainer();
    renderHiddenFields(container, { bpmpi_ordernumber: '1' });

    expect(() => renderHiddenFields(container, undefined)).not.toThrow();
    expect(container.querySelectorAll('input')).toHaveLength(0);

    renderHiddenFields(container, { bpmpi_ordernumber: '1' });
    expect(() => renderHiddenFields(container, null)).not.toThrow();
    expect(container.querySelectorAll('input')).toHaveLength(0);
  });
});