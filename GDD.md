# Game Design Document: Medius

### *A Cognitive Training Exercise in Relative Sorting*

**Version:** 2.0 (Revised — 11-card deck, Chain Track, Loss Diagnosis)
**Designer:** TODO
**Date:** TODO
**Status:** Paper Prototype Validated (v1.0) — Pending re-test of v2.0 additions

---

## 1. Design Overview

### 1.1 Core Concept

**Medius** is a single-player, tabletop cognitive exercise where the player must identify the **median card** from a set of 11 hidden numbers using only binary comparison operations. The player never sees the raw numeric values during the sorting phase. They must construct a mental model of the set's relative order through systematic questioning, externalized on a visible Chain Track.

### 1.2 Design Pillars

- **Cognitive Transparency:** The game does not teach "sorting" through tutorial text. The mechanic *is* the sorting. Mastery of the mechanic produces an intuitive understanding of comparison-based algorithms.
- **Productive Struggle:** The face-down constraint creates a desirable difficulty. The player cannot offload memory to the visual field — only to a structured Chain Track that forces commitment to a relative ordering.
- **Metric-Driven Mastery:** The player's score is the number of comparisons used. This creates a natural incentive to optimize strategy without a leaderboard or reward system.
- **Diagnostic Failure:** Every loss is itemized into a specific cause. The player leaves each round with a concrete lesson, not a generic "try again."

### 1.3 Target Audience

- **Primary:** Students developing algorithmic thinking (ages 14+).
- **Secondary:** Adults seeking cognitive training for working memory and logical deduction.
- **Tertiary:** Anyone. The rules require no math background, only the concepts "larger" and "smaller."

---

## 2. Core Game Loop

### 2.1 The Loop Diagram

```
[Observe] → [Select Two Cards] → [Query Oracle] → [Place in Piles]
    → [Update Chain Track] → [Repeat] → [Declare Median] → [Verify & Diagnose]
```

### 2.2 Player Verbs

| Verb        | Input                                                  | Output                                                |
| ----------- | ------------------------------------------------------ | ----------------------------------------------------- |
| **Select**  | Player picks two face-down Data Cards (by visible letter ID) | Two cards handed to Oracle                       |
| **Query**   | Player asks "Which is larger?"                         | Oracle responds "Left is larger" or "Right is larger" |
| **Place**   | Player assigns each card to LARGER pile or SMALLER pile | Piles grow                                           |
| **Chain**   | Player drags a Letter Token into the Chain Track in its established relative position | Player's mental model is externalized    |
| **Declare** | Player points to one face-down card                    | Game enters verification phase                        |
| **Verify**  | All cards revealed; ranks counted; diagnosis generated | Win/Lose + Comparison Count + Diagnosis line displayed |

### 2.3 Termination Condition

The game ends when the player declares a card as the median. The card is flipped. The other 10 are flipped. If exactly **5 cards are strictly larger and 5 are strictly smaller** than the declared card, the player wins.

---

## 3. Game Components

### 3.1 Physical Components (Paper Prototype)

| Component       | Specification                                                                                  | Quantity |
| --------------- | ---------------------------------------------------------------------------------------------- | -------- |
| **Data Cards**  | 3×5 index cards. Unique 3-digit number on one side. **Letter ID (A–K) clearly written on reverse.** | 11   |
| **Target Card** | 3×5 index card. Reads "FIND THE MEDIAN" on one side.                                          | 1        |
| **Compare Pad** | 3×5 index card (distinct color). Two slots labeled [L] and [R].                                | 1        |
| **Chain Track** | Strip of paper or card with 11 numbered slots (1 = smallest, 11 = largest). Letter tokens are dragged into slots and freely re-ordered. | 1 |
| **Letter Tokens** | Small markers (paper squares, poker chips, etc.) labeled A–K, used to populate the Chain Track without picking up the Data Cards themselves. | 11 |
| **Rules Sheet** | 1-page printed/handwritten player-facing instructions.                                         | 1        |

### 3.2 Sample Data Set (Seed: Prototype v2)

`872`, `341`, `999`, `102`, `556`, `204`, `781`, `433`, `609`, `118`, `695`

- **Sorted Order:** `102`, `118`, `204`, `341`, `433`, `556`, `609`, `695`, `781`, `872`, `999`
- **Median Card (6th of 11):** `556` (5 cards larger, 5 cards smaller)

### 3.3 Roles

- **Player:** The learner. Makes all decisions.
- **Oracle:** The system (designer in prototype; JavaScript function in browser). Responds only to comparison queries. Does not reveal raw values.

### 3.4 Card Identity

Each Data Card has two faces:

- **Front (hidden during play):** The numeric value (e.g., `433`).
- **Back (visible at all times):** A unique letter ID from **A through K**.

The letter ID is the player's only handle on the card during play. All comparisons, pile placements, and Chain Track entries reference the letter, not the number. Letters were chosen over digits to avoid confusion with hidden numeric values and to make verbal play-by-play readable ("I compared C to G, then G to A").

---

## 4. Rules & Systems

### 4.1 Setup Sequence

1. Oracle shuffles the 11 Data Cards face-down, ensuring letter IDs A–K are visible on the backs.
2. Oracle places the Median Target Card face-down in view.
3. Oracle places the Compare Pad and the empty Chain Track within reach.
4. Oracle places the 11 Letter Tokens (A–K) beside the Chain Track.
5. Player reads the Rules Sheet (or receives silent demonstration).

### 4.2 Gameplay Rules (As Delivered to Player)

1. Each card has a letter (A–K) on its back. The number is hidden.
2. You may select any two face-down Data Cards.
3. Place them on the Compare Pad in the [L] and [R] slots and hand the pad to the Oracle. The Oracle will say "Left is larger" or "Right is larger."
4. Place the larger card in the LARGER pile. Place the smaller in the SMALLER pile.
5. You may move Letter Tokens onto the Chain Track at any time. The Chain Track runs from smallest (left) to largest (right). You may insert, remove, or rearrange tokens freely. Use it to record what you've learned about the cards' relative order.
6. You may not look at the front of any Data Card until the end.
7. When you are confident, point to the card you believe is the **Median**.
8. Reveal all cards. If your card has exactly 5 cards larger and 5 smaller, you win. The screen will also tell you why you won or lost.

### 4.3 Constraint Logic (Hidden from Player, Visible to Designer)

- All 11 values are unique. (Eliminates equality edge case.)
- The median is defined as the **6th card in an 11-card 1-indexed sorted list** (5 larger, 5 smaller).
- Oracle function: `compare(a, b) → a.value > b.value ? "Left" : "Right"`
- Oracle never reveals numeric values. This is the **core mechanic**.
- **Information-theoretic notes for the designer:**
  - Full sort lower bound: ⌈log₂(11!)⌉ = 26 comparisons.
  - Median-only lower bound (Blum-Floyd-Pratt-Rivest-Tarjan): approximately 1.5n ≈ 17 comparisons for n=11.
  - The gap between these two numbers is itself an educational outcome — players who pursue mastery discover that finding the median is genuinely cheaper than fully sorting.

### 4.4 The Chain Track

The Chain Track is the player's externalized mental model.

- The track is an 11-slot horizontal strip, slot 1 (left) representing smallest, slot 11 (right) representing largest.
- After any comparison, the player **may** (but is not required to) drag the involved Letter Tokens into the track. A token may be placed in any unoccupied slot consistent with the player's current knowledge.
- The player may rearrange tokens at any time. Tokens may be removed from the track and placed back in the holding area.
- The track is **never validated** by the Oracle during play. The player may place tokens inconsistently with prior comparisons; this is not blocked, but will surface in the loss diagnosis if the declaration is wrong.

**Pedagogical purpose:** the track makes transitivity visible. If the player has placed A < C from one comparison and C < G from another, then dropping G to the right of C automatically positions G to the right of A — a fact the player did not need to ask the Oracle for. The "aha" moment of transitivity is intended to emerge from this spatial relationship, not from text instruction.

### 4.5 Verification & Loss Feedback

When the player declares a card as median, all 11 Data Cards flip to reveal their numeric values. The verification screen displays:

1. **Outcome.** Win or Loss, stated plainly.
2. **Your declared card's actual rank.** Example: *"You chose card X (value YYY), which was rank 4 of 11 — 3 cards smaller, 7 larger."* Shown always, win or lose.
3. **The true median.** Letter and value, e.g. *"The median was card M (value MMM)."*
4. **Full sorted order.** Eleven cards displayed in a row, smallest to largest, with letters and values visible.
5. **Comparisons used.** Total count.
6. **Theoretical minimum.** *"The median is solvable in as few as ~17 comparisons. A full sort requires at least 26."* Frames the player's count without shaming.
7. **Diagnosis line.** One sentence generated from the player's final Chain Track state and declaration. The examples below are illustrative templates — the rules engine should substitute the round's actual letters, values, and counts at runtime, not the placeholder tokens shown here. Diagnostic cases to handle:

   - **Clean win:** *"You correctly placed 5 cards on each side of your declared median in 19 comparisons."*
   - **Win but expensive:** *"Correct, but you used 31 comparisons — close to a full sort. The median can be isolated without fully ordering both halves."*
   - **Off-by-one miss:** *"You separated the upper and lower halves correctly, but didn't distinguish between rank 5 and rank 6. One more comparison between the two boundary candidates would have resolved it."*
   - **Wrong half:** *"You declared from the lower half. Of the 5 cards smaller than the true median, you placed only 3 in the SMALLER pile — your comparisons didn't reach the boundary."*
   - **Chain contradiction:** *"Your Chain Track contained a contradiction at the moment of declaration: along one path of comparisons card X ended up to the right of card Y, and along another path Y ended up to the right of X. The Oracle never lied; your track did."*
   - **Premature declaration:** *"You declared with only 8 comparisons. The median cannot be determined from this little information — at minimum 12 carefully chosen comparisons are needed to rule out enough candidates (the optimal algorithm uses ~17; see §4.3)."*

The diagnosis line is the most pedagogically valuable element of the game. It turns each round into a targeted lesson rather than an unattributed loss.

---

## 5. Player Experience Goals

### 5.1 The Cognitive Arc

| Phase                  | Player State                                                          | Design Intent                              |
| ---------------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| **Confusion**          | "I don't know any numbers. How can I find the middle?"                | Induce productive struggle.                |
| **Brute Force**        | Random comparisons. Results feel disconnected. Chain Track is empty or chaotic. | Player feels the cost of unstructured search. |
| **Externalization**    | Player starts populating the Chain Track. Comparisons begin to feel cumulative. | The track relieves working-memory load and rewards structure. |
| **Emergent Strategy**  | "If A is left of C, and C is left of G, then A must be left of G — I don't need to ask." | Player discovers transitivity *spatially*. |
| **Systematic Sorting** | Player builds a chain by insertion, or sorts in halves around a pivot. | Player internalizes Insertion Sort / Quickselect intuition. |
| **Confidence**         | "I know exactly which card is the median."                            | Player has built a complete relative model — or knows which final comparison they still need. |
| **Verification**       | Cards flip. Diagnosis appears.                                        | Validation or targeted lesson. The cognitive model was accurate, or its specific flaw is named. |

### 5.2 Intended Emotional Beats

- **Anxiety** at the initial information vacuum.
- **Curiosity** as the first comparisons create tiny islands of knowledge.
- **Relief** when the Chain Track turns scattered facts into a visible structure.
- **Satisfaction** when two islands merge ("Ah, card A is larger than both B and C!").
- **Triumph** at a clean reveal — or **clarity** at a diagnosed loss.

---

## 6. Playtest Results (Paper Prototype Iteration 1)

### 6.1 Test Configuration

- **Date:** TODO
- **Tester:** TODO
- **Designer as Oracle:** Yes
- **Data Set:** Seed v1 (10 cards — v2.0 test pending)

### 6.2 Key Observations

| Observation                                                                  | Category    | Severity |
| ---------------------------------------------------------------------------- | ----------- | -------- |
| Player verbally articulated "This is about sorting" without prompting        | **Success** | —        |
| TODO                                                                          | TODO        | TODO     |
| TODO                                                                          | TODO        | TODO     |

### 6.3 Design Iterations (If Any)

TODO — if rules were changed mid-test, document here; otherwise state "No rules were changed during the playtest."

### 6.4 Required Re-Test for v2.0

Before browser development begins, the four v2.0 additions must be paper-tested:

- 11-card deck (does the extra card meaningfully change play, or feel padded?)
- Letter IDs on card backs (do players naturally refer to cards by letter, or do they get confused?)
- Chain Track (do players use it? Does it accelerate the transitivity insight, or distract?)
- Diagnosis line (manually written post-game by the designer-as-oracle; does it feel illuminating or preachy?)

A 30-minute re-test with a fresh tester is sufficient before committing to code.

---

## 7. Technical Translation: Paper → Browser

### 7.1 Mapping Physical Components to Code

| Physical Component   | Browser Equivalent                                                |
| -------------------- | ----------------------------------------------------------------- |
| Data Cards           | Array of 11 objects: `{id: "A", value: int, faceUp: bool}`        |
| Letter ID on back    | Text label rendered on `.card-face-down` element                  |
| Face-Down State      | CSS class `.card-face-down` (background color, letter visible, value hidden) |
| Compare Pad          | Two drop zones + "Compare" button                                 |
| Oracle               | JavaScript function `compareCards(cardA, cardB)`                  |
| LARGER/SMALLER Piles | Two flexbox containers (left/right side of screen)                |
| Chain Track          | 11-slot horizontal drag-and-drop container; draggable letter tokens |
| Median Declaration   | Click-to-select card + "This is the Median" button                |
| Verification         | Flip all cards animation + results modal with diagnosis           |

### 7.2 Core Logic (Pseudocode)

```javascript
const dataCards = [
  { id: "A", value: 872, faceUp: false },
  { id: "B", value: 341, faceUp: false },
  { id: "C", value: 999, faceUp: false },
  { id: "D", value: 102, faceUp: false },
  { id: "E", value: 556, faceUp: false },
  { id: "F", value: 204, faceUp: false },
  { id: "G", value: 781, faceUp: false },
  { id: "H", value: 433, faceUp: false },
  { id: "I", value: 609, faceUp: false },
  { id: "J", value: 118, faceUp: false },
  { id: "K", value: 695, faceUp: false },
];

let comparisonCount = 0;
const comparisonHistory = []; // [{larger: "A", smaller: "B"}, ...]
let chainTrack = new Array(11).fill(null); // slots 0..10; null = empty
let declaredCardId = null;

function compareCards(cardA, cardB) {
  comparisonCount++;
  const result = cardA.value > cardB.value
    ? { larger: cardA.id, smaller: cardB.id }
    : { larger: cardB.id, smaller: cardA.id };
  comparisonHistory.push(result);
  return result;
}

function getSortedRanks() {
  const sorted = [...dataCards].sort((a, b) => a.value - b.value);
  const ranks = {};
  sorted.forEach((card, idx) => { ranks[card.id] = idx + 1; }); // 1-indexed rank
  return { sorted, ranks };
}

function checkWin(chosenCardId) {
  const { ranks } = getSortedRanks();
  const medianRank = 6; // 6th of 11
  return ranks[chosenCardId] === medianRank;
}

// Illustrative only: the production diagnosis should produce the richer,
// context-specific strings enumerated in §4.5 (named letters, pile counts, etc.).
function generateDiagnosis(chosenCardId) {
  const { sorted, ranks } = getSortedRanks();
  const chosenRank = ranks[chosenCardId];
  const won = chosenRank === 6;

  // Detect Chain Track contradictions against comparisonHistory.
  const contradictions = detectChainContradictions(chainTrack, comparisonHistory);

  if (won && comparisonCount <= 20) return "Clean win.";
  if (won && comparisonCount > 28)  return "Correct, but expensive — close to a full sort.";
  if (won) return `Correct in ${comparisonCount} comparisons.`;

  if (contradictions.length > 0) return formatContradiction(contradictions[0]);
  if (Math.abs(chosenRank - 6) === 1) return "Off by one — one more comparison would have done it.";
  if (chosenRank < 6) return "You declared from the lower half.";
  if (chosenRank > 6) return "You declared from the upper half.";
  if (comparisonCount < 12) return "Premature declaration — not enough information was gathered.";
  return "Incorrect.";
}
```

### 7.3 Browser Feature Roadmap

| Phase | Feature                                                                                | Paper Equivalent              |
| ----- | -------------------------------------------------------------------------------------- | ----------------------------- |
| MVP   | Face-down cards with letter IDs, drag-to-compare, Oracle output, two piles, Chain Track, win check, diagnosis line | Full paper prototype v2.0     |
| V1.1  | Comparison counter (live display)                                                      | Manual counting in paper      |
| V1.2  | Strategy hint toggle ("Try building a chain")                                          | Designer as coach             |
| V1.3  | Replay viewer — step through your own comparison history after the round               | (Not in paper)                |
| V2.0  | Variable deck sizes (7, 11, 15 cards)                                                  | New paper decks               |
| V2.1  | Timed mode (cognitive load testing)                                                    | Kitchen timer                 |
| V2.2  | "Connect to CS" screen — name the algorithm the player's behavior most resembled       | (Not in paper)                |

---

## 8. Success Metrics

### 8.1 Paper Prototype Validation (v2.0)

- Player completes the core loop without verbal instruction.
- Player articulates the underlying principle ("sorting") unprompted.
- Player uses the Chain Track without being told to.
- Player achieves a correct median in **under 25 comparisons** on first attempt; **under 18** after 3+ rounds.

### 8.2 Browser MVP Targets

- New player understands the rules within 60 seconds of landing on the page.
- Player correctly identifies the median on first attempt at least 50% of the time.
- Players who lose return for a second round within the same session.
- At least one player, on their own, articulates that finding the median is cheaper than fully sorting — without being told.