import { afterEach, describe, expect, it } from 'vitest';
import { clearScriptLoadState, loadScript } from '../../../providers/braspag/scriptLoader.js';

const URL_SANDBOX = 'https://mpisandbox.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js';
const URL_PROD = 'https://mpi.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js';
const MPI_SCRIPT_ELEMENT_ID = 'stark-3ds-mpi-script';

function getScript() {
  return document.getElementById(MPI_SCRIPT_ELEMENT_ID);
}

afterEach(() => {
  clearScriptLoadState();
});

describe('loadScript', () => {
  it('resolve when onload is called', async () => {
    const promise = loadScript(URL_SANDBOX);
    getScript().onload(new Event('load'));
    await expect(promise).resolves.toBe(getScript());
  });

  it('reject when onerror is called', async () => {
    const promise = loadScript(URL_SANDBOX);
    getScript().onerror(new Event('error'));
    await expect(promise).rejects.toThrow('Failed to load MPI script');
  });

  it('returns cached promise when called with same url', () => {
    const promise = loadScript(URL_SANDBOX);
    const promise2 = loadScript(URL_SANDBOX);
    expect(promise).toBe(promise2);
  });

  it('returns new promise when called with different url', () => {
    const promise = loadScript(URL_SANDBOX);
    const promise2 = loadScript(URL_PROD);
    expect(promise).not.toBe(promise2);
  });

  it('clears script load state when called', async () => {
    const promise = loadScript(URL_SANDBOX);
    getScript().onload(new Event('load'));
    await promise;

    clearScriptLoadState();
    expect(getScript()).toBeNull();

    const promise2 = loadScript(URL_SANDBOX);
    expect(promise).not.toBe(promise2);
  });
});
