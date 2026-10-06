import '@testing-library/jest-dom/vitest'

// jsdom has no layout, so it lacks the observer that popovers rely on.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
