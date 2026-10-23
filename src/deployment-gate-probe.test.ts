import {it} from 'vitest';

// Temporary deployment-gate probe. Removed immediately after failure is verified.
it('intentionally blocks this deployment to protect the current production site', () => {
  throw new Error('Intentional deployment-gate verification failure; do not publish this commit.');
});
