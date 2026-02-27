import { expect as vitestExpect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// expose Vitest's expect globally before jest-dom runs
(globalThis as typeof globalThis & { expect: typeof vitestExpect }).expect =
  vitestExpect;

// Tell React 19 that the environment supports act()
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

// import jest-dom after global expect is set
await import('@testing-library/jest-dom');

afterEach(() => {
  cleanup();
});
