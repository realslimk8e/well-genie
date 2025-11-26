import { expect as vitestExpect } from 'vitest';

// expose Vitest's expect globally before jest-dom runs
// @ts-ignore
globalThis.expect = vitestExpect;

// Tell React 19 that the environment supports act()
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
// @ts-ignore
(global as any).IS_REACT_ACT_ENVIRONMENT = true;

// import jest-dom after global expect is set
// @ts-ignore
await import('@testing-library/jest-dom');
