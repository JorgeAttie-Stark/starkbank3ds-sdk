import { describe, it, expect } from 'vitest';
import { getConfig } from '../../../providers/braspag/config.js';

describe('getConfig', () => {
  it('returns sandbox config', () => {
    expect(getConfig('sandbox')).toEqual({
      code: 'SDB',
      scriptUrl: 'https://mpisandbox.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js'
    });
  })
  it('returns production config', () => {
    expect(getConfig('production')).toEqual({
      code: 'PRD',
      scriptUrl: 'https://mpi.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js'
    });
  })
  it('throws error if environment is not found', () => {
    expect(() => getConfig('invalid')).toThrow('Environment invalid not found');
  });
});