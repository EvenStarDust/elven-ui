---
'@evenstardust/elven-ui': patch
---

The build is now tree-shakable: importing one component or icon no longer pulls in the whole library (a single icon went from 30.7 kB to 0.6 kB, minified and brotlied). Only interactive components are marked `'use client'`, so icons can be used in React Server Components.
