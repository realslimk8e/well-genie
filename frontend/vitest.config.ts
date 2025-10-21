/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
    css: false, // ignore Tailwind/DaisyUI during tests
  },
})
