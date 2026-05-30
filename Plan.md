# Implementation Plan: Medius

Browser implementation of the Medius median-finding game, per [GDD.md](./GDD.md).

**Stack (GDD §7.0):** Vite + React + TypeScript (strict), CSS Modules, Vitest. Pure game logic in `src/game/`, kept React-free and unit-tested. UI consumes it through a single `useReducer`-based game-state hook.

---

## Guiding Principles

- **Logic/UI separation.** Everything in `src/game/` is pure TypeScript — no React, no DOM. This is the testable core (Oracle, ranking, diagnosis, reducer). The GDD calls this out explicitly (§7.0, §7.2).
- **The Oracle never leaks values.** Card `value`s exist in state but are never rendered while `faceUp === false`. The only value-derived output during play is the binary comparison result. This is the core mechanic (§4.3) and must be enforced at the component boundary.
- **Single source of truth.** All game state flows through one reducer. Components dispatch actions; they never mutate state directly.
- **Ship the MVP first.** Phases V1.1–V2.2 (§7.3) are layered on afterward and are explicitly out of scope for the first milestone.

---

## Phase 0 — Project Scaffold

**Goal:** A running Vite + React + TS dev server with tooling configured.

1. Scaffold: `npm create vite@latest . -- --template react-ts` (into the existing repo root).
2. Configure `tsconfig` for `strict: true`.
3. Add Vitest + `@testing-library/react` + `jsdom`; add `test` script to `package.json`.
4. Add ESLint + Prettier (Vite's react-ts ESLint config is a fine starting point).
5. Strip the Vite demo boilerplate; leave a minimal `App` shell.
6. `.gitignore` for `node_modules`, `dist`.

**Done when:** `npm run dev` serves a blank app, `npm test` runs (zero tests), `npm run build` succeeds.

---

## Phase 1 — Game Logic Core (`src/game/`)

**Goal:** The entire rules engine, fully unit-tested, with no UI. This is the highest-value, highest-certainty work and de-risks everything after it.

### Modules (mirrors GDD §7.2)

| File | Exports | Notes |
| --- | --- | --- |
| `types.ts` | `CardId`, `DataCard`, `Comparison`, `GameState`, `GameAction`, `Phase` | `Phase = "playing" \| "verifying" \| "results"` |
| `deck.ts` | `initialDataCards`, `makeDeck(seed?)` | Seed dataset from §3.2; `makeDeck` for future randomization (V2.0) |
| `oracle.ts` | `compareCards(a, b): Comparison` | Pure; no side effects, no counter |
| `ranking.ts` | `getSortedRanks(cards)`, `checkWin(cards, id)`, `MEDIAN_RANK` | 1-indexed; median = 6 of 11 |
| `chain.ts` | `detectChainContradictions(track, history)` | See "Contradiction detection" below |
| `diagnosis.ts` | `generateDiagnosis(state, chosenId): string` | Rich, runtime-substituted strings per §4.5 — **not** the placeholder one-liners |
| `reducer.ts` | `gameReducer(state, action)`, `initialState` | Increments `comparisonCount`, appends `comparisonHistory` on `COMPARE` (§7.2 note) |

### Reducer actions

- `COMPARE { left: CardId, right: CardId }` → calls `compareCards`, increments count, pushes history, records which pile each lands in.
- `PLACE_IN_PILE { id, pile }` — assign a card to LARGER/SMALLER pile.
- `CHAIN_MOVE { id, slot | null }` — drop a token into a track slot, or remove it (`null`). Free rearrange (§4.4); never validated during play.
- `DECLARE { id }` → transition `playing → verifying`.
- `REVEAL` → flip all cards, compute results, → `results`.
- `RESET` → new round (re-seed/shuffle).

### Contradiction detection (`chain.ts`)

The diagnosis "Chain contradiction" case (§4.5) compares the player's final track ordering against `comparisonHistory`. Approach:

- Build a directed graph from `comparisonHistory` (`smaller → larger`).
- The track gives the player's asserted total order (left = smallest). For every adjacent or known pair, check whether the track's ordering contradicts a path in the comparison graph (e.g., history transitively implies X < Y, but the track places Y left of X).
- Return the first conflicting pair for the diagnosis string.

### Diagnosis logic (`diagnosis.ts`)

Implement the **full** §4.5 cases with real substitution (letters, values, pile counts):
clean win · win-but-expensive (>28 cmp) · off-by-one (rank ±1) · wrong half (with "placed only N of 5 in the SMALLER pile" detail) · chain contradiction · premature declaration (<12 cmp). Order matters — contradiction and premature checks gate the rank-based ones.

**Tests (Vitest):** Oracle direction; rank correctness on the seed set (median = `556`/card E); `checkWin` true only for rank 6; each diagnosis branch with a hand-built `GameState`; contradiction detector on a known-bad track; reducer transitions and counter/history accumulation.

**Done when:** `src/game/` has full branch coverage and zero React imports.

---

## Phase 2 — MVP UI (GDD §7.3 "MVP")

**Goal:** Playable round, end to end: face-down cards → drag-to-compare → piles → Chain Track → declare → reveal → diagnosis.

### State wiring

- `useGame()` hook wraps `useReducer(gameReducer, initialState)`, exposes state + typed action dispatchers.
- `<App>` owns the hook and renders the board; children get state slices + callbacks via props (no prop-drilling pain at this size).

### Components (`src/components/`)

| Component | Responsibility |
| --- | --- |
| `Board` | Layout: piles left/right, cards in center, ComparePad, ChainTrack, controls |
| `Card` | Face-down (letter only) vs face-up (value) via `faceUp` prop + CSS Module. **Never renders `value` when face-down.** Selectable. |
| `ComparePad` | Two drop slots `[L]`/`[R]` + "Compare" button; shows last result ("Left is larger") |
| `Pile` | LARGER / SMALLER container; receives placed cards |
| `ChainTrack` | 11 slots, smallest→largest; accepts dropped `LetterToken`s; free rearrange |
| `LetterToken` | Draggable A–K marker; lives in holding area or a track slot |
| `Controls` | "This is the Median" declare button (enabled once a card is selected) |
| `ResultsModal` | Renders all 7 §4.5 elements after reveal |

### Drag-and-drop

Start with **native HTML5 DnD** for ComparePad and ChainTrack. If reordering-within-track proves fiddly, swap in `@dnd-kit/core` (GDD §7.0 sanctions this) — the reducer API stays unchanged, so it's a localized change.

### ResultsModal contents (§4.5, all required for MVP)

1. Outcome (win/loss) · 2. Declared card's actual rank + smaller/larger counts · 3. True median (letter + value) · 4. Full sorted order row (letters + values) · 5. Comparisons used · 6. Theoretical minimum line (~17 / 26) · 7. Diagnosis line. Plus a "Play again" → `RESET`.

### Card-flip animation

CSS transform (`rotateY`) on reveal; stagger the 11 flips for the "cards flip" beat (§5.1 Verification). Keep it CSS-only.

**Tests:** RTL smoke test of a full happy-path round (select → compare → declare → reveal shows results). Assert face-down cards do **not** expose their value in the DOM.

**Done when:** A player can complete a full round in the browser and see a correct, substituted diagnosis. Meets §8.2 MVP intent.

---

## Phase 3 — Polish & MVP Acceptance

- Onboarding: concise rules panel/overlay (§4.2) so a new player understands within 60s (§8.2).
- Empty/edge states: can't declare before selecting; "Compare" disabled unless two cards are in the pad.
- Visual states for selected card, last-compared pair, pile membership.
- Accessibility: keyboard alternative to drag (select-card-then-slot), ARIA labels, focus management for the modal.
- Responsive layout for the board.

**Done when:** §8.2 targets are plausibly met in informal testing.

---

## Phase 4+ — Roadmap (GDD §7.3, post-MVP, sequenced)

| Phase | Feature | Implementation sketch |
| --- | --- | --- |
| V1.1 | Live comparison counter | Already in state; surface in `Controls`. Trivial. |
| V1.2 | Strategy hint toggle | Static coaching tips ("try building a chain"); toggle in UI. |
| V1.3 | Replay viewer | `comparisonHistory` already recorded; add a stepper UI to walk it post-round. |
| V2.0 | Variable deck sizes (7/11/15) | Generalize `MEDIAN_RANK`, `chainTrack` length, and `makeDeck(n)`; deck-size selector. Touches logic core — re-run unit tests. |
| V2.1 | Timed mode | Add a timer slice + display; optional per round. |
| V2.2 | "Connect to CS" screen | Heuristic over `comparisonHistory` to name the closest algorithm (insertion sort / quickselect). |

---

## Proposed File Tree (post-MVP)

```
src/
  game/            # pure, tested logic — no React
    types.ts
    deck.ts
    oracle.ts
    ranking.ts
    chain.ts
    diagnosis.ts
    reducer.ts
    *.test.ts
  hooks/
    useGame.ts
  components/
    Board.tsx
    Card.tsx
    ComparePad.tsx
    Pile.tsx
    ChainTrack.tsx
    LetterToken.tsx
    Controls.tsx
    ResultsModal.tsx
    *.module.css
  App.tsx
  main.tsx
```

---

## Risks & Open Questions

- **Value leakage.** Easiest bug to introduce, worst to ship — a face-down `Card` must never have its `value` in the DOM/attributes. Add a test that asserts this.
- **Contradiction detection scope.** Full graph-vs-track reconciliation can get involved. MVP can detect direct contradictions (a track ordering that conflicts with any single recorded comparison); transitive-path detection is a fast follow if it proves too coarse.
- **DnD library decision.** Defer until native DnD is tried in Phase 2; only adopt `@dnd-kit` if track rearrangement demands it.
- **Deck source.** MVP uses the fixed §3.2 seed (deterministic, matches GDD examples). Randomized decks land in V2.0 via `makeDeck`.

---

## Suggested Commit Sequence

1. Phase 0 scaffold.
2. `src/game/` modules + tests (per module, logic before UI).
3. `useGame` hook.
4. Components, board-up: `Card` → `ComparePad`/`Pile` → `ChainTrack`/`LetterToken` → `Controls` → `ResultsModal`.
5. Flip animation + polish (Phase 3).
6. Roadmap features as independent increments.
