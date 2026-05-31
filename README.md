# Medius

A single-player cognitive exercise: find the **median** of 11 hidden numbers
using only "which is larger?" comparisons. Compare cards, sort them into piles
and onto the Chain Track, then declare the middle one.

See [`GDD.md`](./GDD.md) for the full game design and [`Plan.md`](./Plan.md)
for the implementation plan.

Built with Vite + React + TypeScript.

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- Install dependencies once:

```bash
npm install
```

## Run the dev server

```bash
npm run dev
```

Vite prints a local URL (default <http://localhost:5173>). Open it in a browser;
the page hot-reloads as you edit.

## Run the tests

```bash
npm test          # run the Vitest suite once
npm run test:watch # re-run on file changes
```

Tests use Vitest + Testing Library (jsdom).

## Other scripts

```bash
npm run build    # type-check (tsc -b) and build for production into dist/
npm run preview  # serve the production build locally
npm run lint     # run ESLint
```
