/// <reference types="vitest/config" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import pkg from './package.json' with { type: 'json' }

// Dependencies stay imports in the output (so consumers dedupe them) rather than being bundled.
const dependencies = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})]
const external = (id: string) => dependencies.some((name) => id === name || id.startsWith(`${name}/`))

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
      exclude: ['**/*.stories.tsx', '**/*.test.ts', '**/*.test.tsx', 'src/test'],
    }),
  ],
  css: {
    modules: {
      generateScopedName: 'elven-[local]-[hash:base64:5]',
    },
  },
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
      cssFileName: 'elven-ui',
    },
    rollupOptions: {
      external,
      output: {
        // Bundling drops per-file directives, so mark the whole entry as client code
        // for React Server Components (e.g. the Next.js App Router).
        banner: "'use client';",
      },
    },
    sourcemap: true,
  },
  test: {
    globals: true,
    passWithNoTests: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
