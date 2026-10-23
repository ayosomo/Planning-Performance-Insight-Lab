import {it} from 'vitest';

// Temporary branch-protection probe. Removed after GitHub rejects the merge.
it('intentionally fails to verify the required CI merge gate', () => {
  throw new Error('Intentional main-protection verification failure.');
});
