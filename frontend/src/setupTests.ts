import { expect as vitestExpect } from 'vitest';

// Ensure a global `expect` exists before importing jest-dom
// @ts-ignore
globalThis.expect = vitestExpect;

import '@testing-library/jest-dom';
