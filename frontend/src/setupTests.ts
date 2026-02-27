import { expect as vitestExpect } from 'vitest';

// Ensure a global `expect` exists before importing jest-dom
(globalThis as typeof globalThis & { expect: typeof vitestExpect }).expect =
  vitestExpect;

import '@testing-library/jest-dom';
