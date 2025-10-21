import { expect as vitestExpect } from 'vitest'

// expose Vitest's expect globally before jest-dom runs
// @ts-ignore
globalThis.expect = vitestExpect

// import jest-dom after global expect is set
// @ts-ignore
await import('@testing-library/jest-dom')