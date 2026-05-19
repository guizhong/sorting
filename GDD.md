# Game Design Document: Medius

### *A Cognitive Training Exercise in Relative Sorting*

**Version:** 1.0 (Post-Paper Prototype)  
**Designer:** [Your Name]  
**Date:** [Today's Date]  
**Status:** Paper Prototype Validated

---

## 1. Design Overview

### 1.1 Core Concept

**Medius** is a single-player, tabletop cognitive exercise where the player must identify the **median card** from a set of 10 hidden numbers using only binary comparison operations. The player never sees the raw numeric values during the sorting phase. They must construct a mental model of the set's relative order through systematic questioning.

### 1.2 Design Pillars

- **Cognitive Transparency:** The game does not teach "sorting" through tutorial text. The mechanic *is* the sorting. Mastery of the mechanic produces an intuitive understanding of comparison-based algorithms.
- **Productive Struggle:** The face-down constraint creates a desirable difficulty. The player cannot offload memory to the visual field. They must build internal structure.
- **Metric-Driven Mastery:** The player's score is the number of comparisons used. This creates a natural incentive to optimize strategy without a leaderboard or reward system.

### 1.3 Target Audience

- **Primary:** Students developing algorithmic thinking (ages 14+).
- **Secondary:** Adults seeking cognitive training for working memory and logical deduction.
- **Tertiary:** Anyone. The rules require no math background, only the concepts "larger" and "smaller."

---

## 2. Core Game Loop

### 2.1 The Loop Diagram
[Observe] → [Select Two Cards] → [Query Oracle] → [Place in Piles] → [Repeat] → [Declare Median] → [Verify]


### 2.2 Player Verbs

| Verb       | Input                                              | Output                                                |
| ---------- | -------------------------------------------------- | ----------------------------------------------------- |
| **Select** | Player picks two face-down Data Cards              | Two cards handed to Oracle                            |
| **Query**  | Player asks "Which is larger?"                     | Oracle responds "Left" or "Right"                     |
| **Place**  | Player assigns each card to LARGER pile or SMALLER pile | Piles grow; player maintains internal structure   |
| **Organize** | Player may re-sort within piles (optional, emergent) | Player builds a mental tournament bracket           |
| **Declare** | Player points to one face-down card               | Game enters verification phase                        |
| **Verify** | All cards revealed; ranks counted                  | Win/Lose + Comparison Count displayed                 |

### 2.3 Termination Condition

The game ends when the player declares a card as the median. The card is flipped. The other 9 are flipped. If exactly 4 cards are strictly larger and 5 are strictly smaller (or 5/4), the player wins.

---

## 3. Game Components

### 3.1 Physical Components (Paper Prototype)

| Component      | Specification                                                       | Quantity |
| -------------- | ------------------------------------------------------------------- | -------- |
| **Data Cards** | 3×5 index cards. 3-digit unique number on one side. Blank reverse.  | 10       |
| **Target Card** | 3×5 index card. Reads "FIND THE MEDIAN" on one side.               | 1        |
| **Compare Pad** | 3×5 index card (distinct color). Two slots labeled [L] and [R].    | 1        |
| **Rules Sheet** | 1-page printed/handwritten player-facing instructions.             | 1        |

### 3.2 Sample Data Set (Seed: Prototype v1)

`872`, `341`, `999`, `102`, `556`, `204`, `781`, `433`, `609`, `118`

- **Sorted Order:** `102`, `118`, `204`, `341`, `433`, `556`, `609`, `781`, `872`, `999`
- **Median Card:** `433` (or `556` depending on convention; define one as target for verification)

### 3.3 Roles

- **Player:** The learner. Makes all decisions.
- **Oracle:** The system (designer in prototype; JavaScript function in browser). Responds only to comparison queries. Does not reveal raw values.

---

## 4. Rules & Systems

### 4.1 Setup Sequence

1. Oracle shuffles the 10 Data Cards face-down.
2. Oracle places the Median Target Card face-down in view.
3. Oracle places the Compare Pad within reach.
4. Player reads the Rules Sheet (or receives silent demonstration).

### 4.2 Gameplay Rules (As Delivered to Player)

1. You may select any two face-down Data Cards.
2. Give them to the Oracle. The Oracle will say "Left is larger" or "Right is larger."
3. Place the larger card in the LARGER pile. Place the smaller in the SMALLER pile.
4. You may arrange cards within piles however you wish.
5. You may not look at the front of any Data Card until the end.
6. When you are confident, point to the card you believe is the **Median**.
7. Reveal all cards. If your card has exactly 4 cards larger and 5 smaller, you win.

### 4.3 Constraint Logic (Hidden from Player, Visible to Designer)

- All 10 values are unique. (Eliminates equality edge case.)
- The median is defined as the 5th card in a 10-card 1-indexed sorted list (4 larger, 5 smaller).
- Oracle function: `compare(a, b) → a > b ? "Left" : "Right"`
- Oracle never reveals numeric values. This is the **core mechanic**.

---

## 5. Player Experience Goals

### 5.1 The Cognitive Arc

| Phase                   | Player State                                                        | Design Intent                              |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| **Confusion**           | "I don't know any numbers. How can I find the middle?"              | Induce productive struggle.                |
| **Brute Force**         | Random comparisons. Results feel disconnected.                      | Player feels the cost of unstructured search. |
| **Emergent Strategy**   | "If I compare A to B, and B to C, I know A > C without comparing them." | Player discovers transitivity.             |
| **Systematic Sorting**  | Player builds a mental bracket or inserts cards into a growing chain. | Player internalizes Tournament Sort / Insertion Sort. |
| **Confidence**          | "I know exactly which card is the median."                          | Player has built a complete relative model. |
| **Verification**        | Cards flip. Player sees they were correct.                          | Validation. The cognitive model was accurate. |

### 5.2 Intended Emotional Beats

- **Anxiety** at the initial information vacuum.
- **Curiosity** as the first comparisons create tiny islands of knowledge.
- **Satisfaction** when two islands merge ("Ah, Card A is larger than both Card B and Card C!").
- **Triumph** at the reveal.

---

## 6. Playtest Results (Paper Prototype Iteration 1)

### 6.1 Test Configuration

- **Date:** [Date of test]
- **Tester:** [Relationship, e.g., "Partner" or "Coworker"]
- **Designer as Oracle:** Yes
- **Data Set:** Standard Seed v1

### 6.2 Key Observations

| Observation                                                                   | Category     | Severity |
| ----------------------------------------------------------------------------- | ------------ | -------- |
| Player verbally articulated "This is about sorting" without prompting         | **Success**  | —        |
| [Insert your surprise observation here]                                        | —            | —        |
| [Insert any confusion or hesitation points]                                    | —            | —        |

### 6.3 Design Iterations (If Any)

[If you changed a rule mid-test, document it here. If not, state "No rules were changed during the playtest."]

---

## 7. Technical Translation: Paper → Browser

### 7.1 Mapping Physical Components to Code

| Physical Component   | Browser Equivalent                                                |
| -------------------- | ----------------------------------------------------------------- |
| Data Cards           | Array of 10 objects: `{id: int, value: int, position: string}`  |
| Face-Down State      | CSS class `.card-face-down` (background color, no text)           |
| Compare Pad          | Two drop zones + "Compare" button                                 |
| Oracle               | JavaScript function `compareCards(cardA, cardB)`                  |
| LARGER/SMALLER Piles | Two flexbox containers (left/right side of screen)                |
| Median Declaration   | Click-to-select card + "This is the Median" button                |
| Verification         | Flip all cards animation + win/loss modal                         |

### 7.2 Core Logic (Pseudocode)

```javascript
const dataCards = [
  { id: 1, value: 872, faceUp: false },
  { id: 2, value: 341, faceUp: false },
  // ... remaining 8
];

function compareCards(cardA, cardB) {
  // Oracle function. Player never sees the values.
  if (cardA.value > cardB.value) {
    return { larger: cardA.id, smaller: cardB.id };
  } else {
    return { larger: cardB.id, smaller: cardA.id };
  }
}

function checkWin(chosenCard) {
  const sorted = [...dataCards].sort((a, b) => a.value - b.value);
  const medianIndex = 4; // 5th card in 0-indexed 10-card array
  return chosenCard.id === sorted[medianIndex].id;
}


### 7.3 Browser Feature Roadmap
Phase	Feature	Paper Equivalent
MVP	Face-down cards, drag-to-compare, Oracle output, two piles, win check	Full paper prototype
V1.1	Comparison counter (score display)	Manual counting in paper
V1.2	Strategy hint toggle ("Try building a chain")	Designer as coach
V2.0	Variable deck sizes (8, 12, 20 cards)	New paper decks
V2.1	Timed mode (cognitive load testing)	Kitchen timer
## 8. Success Metrics
### 8.1 Paper Prototype Validation
Player completes the core loop without verbal instruction.

Player articulates the underlying principle ("sorting") unprompted.

Player achieves a correct median in under 20 comparisons. (Track this in next playtest.)

### 8.2 Browser MVP Targets
New player understands the rules within 60 seconds of landing on the page.

Player correctly identifies the median on first attempt.

Player returns for a second round with a different seed.
