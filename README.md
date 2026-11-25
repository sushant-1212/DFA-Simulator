# ⚙️ DFA Simulator (Milestone-II)

**Group ID:** [TO BE FILLED]  |  **Course:** CSET302 – Automata Theory and Computability, Bennett University  
**Live demo:** https://dfa-simulator.onrender.com/

A clean, zero-dependency educational web application for designing, visualizing, and simulating complete Deterministic Finite Automata (DFA) based on formal automata theory.

---

## Overview

The **DFA Simulator** bridges theoretical automata concepts with concrete computational visualization. Built around the mathematical 5-tuple $M = (Q, \Sigma, \delta, q_0, F)$, it provides an interactive environment where students and instructors can build automata through forms and an editable transition table, view them as a state diagram, and inspect deterministic string processing step-by-step.

---

## Supported Features

- **Central Formal Model:** Strict adherence to the standard 5-tuple definition $M = (Q, \Sigma, \delta, q_0, F)$.
- **Form and table editing:** define $\delta$ through the 'Add / Edit Transition' form or the drop-down cells of the transition table. The diagram, the table and the validation banner are all rendered from one DFA model, so they never disagree.
- **Formal DFA Completeness Validation:** Enforces the total function property $\delta : Q \times \Sigma \to Q$. Clearly lists any missing transitions before simulation.
- **Granular Step-by-Step Simulation:** Step forward one symbol at a time or run the full string automatically, highlighting active nodes, traversed edges, and recording each step in an execution trace table.
- **Interactive SVG diagram:** circular nodes, double circles for accepting states, a start arrow, self-loops, curved edges for opposite-direction pairs, draggable nodes and an Auto Layout button. Clicking a node pre-selects it as the source state in the transition form.
- **Pre-configured Presets:** One-click loading of classic automata examples (e.g., binary strings ending in "01", strings with an even number of '0's).

---

## Technology Stack and Dependencies

- **HTML5:** Semantic document structure and 3-column workbench interface.
- **CSS3:** Responsive layout, clean typography, and color-coded node states.
- **JavaScript (ES6+):** Pure client-side automata data structures, validation rules, simulation stepper, and event wiring.
- **Native SVG:** Scalable vector graphics for rendering states, directed edges, arrowhead markers, and dynamic drag interactions.
- **Dependencies:** None (zero external libraries, no frameworks, no build tools).

### Requirements
- **Browser:** Any modern browser (screenshots taken in Google Chrome).
- **Node.js:** Only for running tests (tested with Node.js v20.18.0).
- No npm packages, no build step.

---

## Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/sushant-1212/DFA-Simulator.git
cd DFA-Simulator
```

No package installations (`npm install`), compilers, or bundlers are required.

---

## How to Run

Hosted copy: https://dfa-simulator.onrender.com/

You can run the application directly in any modern web browser:

### Option 1: Open directly in your browser
Simply open `index.html` in your preferred web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari, Brave):
```bash
# On macOS
open index.html

# On Linux
xdg-open index.html
```

### Option 2: Serve using any static HTTP server
If you prefer running a local HTTP server with Python:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` (or the port indicated by your server) in your browser.

---

## Example

### Automaton: Binary strings ending with "01"
Accepts all strings over $\Sigma = \{0, 1\}$ that have "01" as a suffix.

- **States ($Q$):** $\{q_0, q_1, q_2\}$
- **Alphabet ($\Sigma$):** $\{0, 1\}$
- **Start State ($q_0$):** $q_0$
- **Accepting States ($F$):** $\{q_2\}$
- **Transition Table ($\delta$):**

| State ($Q$) | Input '0' | Input '1' | Role / Meaning |
| :---: | :---: | :---: | :--- |
| $\to q_0$ | $q_1$ | $q_0$ | Start state; reset when trailing symbol is '1' |
| $q_1$ | $q_1$ | $q_2$ | Trailing '0' detected; candidate for "01" |
| $* q_2$ | $q_1$ | $q_0$ | Substring "01" matched at current suffix (Accepting) |

### Sample Execution Traces

- **Input:** `1101`
  - $q_0 \xrightarrow{1} q_0 \xrightarrow{1} q_0 \xrightarrow{0} q_1 \xrightarrow{1} q_2$
  - Terminal state: $q_2 \in F$
  - **Verdict:** `ACCEPTED` ✅

- **Input:** `1010`
  - $q_0 \xrightarrow{1} q_0 \xrightarrow{0} q_1 \xrightarrow{1} q_2 \xrightarrow{0} q_1$
  - Terminal state: $q_1 \notin F$
  - **Verdict:** `REJECTED` ❌

---

## Project Structure

```
DFA-Simulator/
│
├── index.html              # Main application workbench (Milestone-II)
├── css/
│   └── style.css           # Interface styling, node glow states, responsive layout
├── js/
│   ├── dfa.js              # Central 5-tuple DFA data model and layout logic
│   ├── validator.js        # Automata completeness and input string validator
│   ├── simulator.js        # Deterministic simulation engine and trace logger
│   ├── graph.js            # Interactive SVG state diagram and visual renderer
│   ├── transitionTable.js  # Editable transition matrix (drop-downs write back to the model)
│   └── main.js             # Application controller and UI event listeners
├── TestCases/
│   ├── exhaustive_check.js # compares both presets with reference predicates on all 8,191 binary strings of length 0–12
│   └── test_suite.js       # Comprehensive automated test suite
├── test_dfa.js             # Root test runner using dynamic path resolution
├── render.yaml             # Render static site deployment configuration
└── README.md               # Project documentation and guide
```

---

## Testing

The project includes an automated test runner covering preset simulations, edge cases, error diagnostics, and validator integrity. Run all commands from the repository root.

Run the test suite with Node.js:

```bash
node test_dfa.js
```
*(or `node TestCases/test_suite.js`)*

### Expected Output

```
=================================================================================
                       DFA SIMULATOR AUTOMATED TEST SUITE                       
=================================================================================

--- Category 1: Preset 'ends-with-01' Simulation Tests ---
[Test 01] DFA: ends-with-01     | Input: "1101"     | Expected: ACCEPTED     | Actual: ACCEPTED     | PASS ✅
[Test 02] DFA: ends-with-01     | Input: "1010"     | Expected: REJECTED     | Actual: REJECTED     | PASS ✅
[Test 03] DFA: ends-with-01     | Input: "01"       | Expected: ACCEPTED     | Actual: ACCEPTED     | PASS ✅
[Test 04] DFA: ends-with-01     | Input: "1111"     | Expected: REJECTED     | Actual: REJECTED     | PASS ✅
[Test 05] DFA: ends-with-01     | Input: "0001"     | Expected: ACCEPTED     | Actual: ACCEPTED     | PASS ✅
[Test 06] DFA: ends-with-01     | Input: ""         | Expected: REJECTED     | Actual: REJECTED     | PASS ✅
[Test 07] DFA: ends-with-01     | Input: "1021"     | Expected: ERROR        | Actual: ERROR        | PASS ✅
[Test 08] DFA: ends-with-01     | Input: "101"      | Expected: ACCEPTED     | Actual: ACCEPTED     | PASS ✅
[Test 09] DFA: ends-with-01     | Input: "100"      | Expected: REJECTED     | Actual: REJECTED     | PASS ✅ (Ends in '00', not '01')

--- Category 2: Preset 'even-zeros' Simulation Tests ---
[Test 10] DFA: even-zeros       | Input: ""         | Expected: ACCEPTED     | Actual: ACCEPTED     | PASS ✅ (0 zeros (even))
[Test 11] DFA: even-zeros       | Input: "0"        | Expected: REJECTED     | Actual: REJECTED     | PASS ✅ (1 zero (odd))
[Test 12] DFA: even-zeros       | Input: "00"       | Expected: ACCEPTED     | Actual: ACCEPTED     | PASS ✅ (2 zeros (even))
[Test 13] DFA: even-zeros       | Input: "1010"     | Expected: ACCEPTED     | Actual: ACCEPTED     | PASS ✅ (2 zeros (even))
[Test 14] DFA: even-zeros       | Input: "100"      | Expected: ACCEPTED     | Actual: ACCEPTED     | PASS ✅ (2 zeros (even count))
[Test 15] DFA: even-zeros       | Input: "10"       | Expected: REJECTED     | Actual: REJECTED     | PASS ✅ (1 zero (odd count))

--- Category 3: Invalid Symbol Error Message Tests ---
[Test 16] DFA: ends-with-01     | Input: "1021"     | Expected: ERROR ('2')  | Actual: ERROR (lists symbol) | PASS ✅ (Input contains invalid symbol(s): '2'. Alphabet is { 0, 1 }.)
[Test 17] DFA: ends-with-01     | Input: "a"        | Expected: ERROR ('a')  | Actual: ERROR (lists symbol) | PASS ✅ (Input contains invalid symbol(s): 'a'. Alphabet is { 0, 1 }.)

--- Category 4: Missing Transition Integrity Tests ---
[Test 18] DFA: incomplete-dfa   | Input: "N/A"      | Expected: isValid=false | Actual: isValid=false | PASS ✅ (DFAValidator flags missing transition)
[Test 19] DFA: incomplete-dfa   | Input: "01"       | Expected: success=false | Actual: success=false | PASS ✅ (Simulator rejects incomplete DFA)

--- Category 5: Structural DFA Validation Error Tests ---
[Test 20] DFA: no-initial-state | Input: "N/A"      | Expected: Error: q0    | Actual: Error: q0    | PASS ✅ (Initial state missing error)
[Test 21] DFA: empty-alphabet   | Input: "N/A"      | Expected: Error: Sigma | Actual: Error: Sigma | PASS ✅ (Alphabet empty error)
[Test 22] DFA: empty-states     | Input: "N/A"      | Expected: Error: Q     | Actual: Error: Q     | PASS ✅ (States set empty error)

--- Category 6: No Final States Warning & Rejection Tests ---
[Test 23] DFA: no-final-states  | Input: "N/A"      | Expected: Warning: F   | Actual: Warning: F   | PASS ✅ (DFAValidator issues final state warning)
[Test 24] DFA: no-final-states  | Input: "multiple" | Expected: REJECTED     | Actual: REJECTED     | PASS ✅ (All inputs rejected when F is empty)

--- Category 7: Single-State DFA & Long String (1000 chars) Tests ---
[Test 25] DFA: single-state     | Input: "N/A"      | Expected: isValid=true | Actual: isValid=true | PASS ✅ (Single-state complete DFA is valid)
[Test 26] DFA: single-state     | Input: "1000 chars" | Expected: ACCEPTED     | Actual: ACCEPTED     | PASS ✅ (Processed 1000 steps cleanly)

--- Category 8: Stale State Clearing on Failed init() Tests ---
[Test 27] DFA: ends-with-01     | Input: "1021 after ok" | Expected: empty & null | Actual: empty & null | PASS ✅ (History empty and currentState null on invalid symbol)
[Test 28] DFA: incomplete-dfa   | Input: "01 after ok" | Expected: empty & null | Actual: empty & null | PASS ✅ (History empty and currentState null on incomplete DFA)

=================================================================================
TOTAL TESTS: 28 | PASSED: 28 | FAILED: 0
=================================================================================

✅ ALL AUTOMATED TESTS PASSED SUCCESSFULLY!
```

Exhaustive cross-check:

```bash
node TestCases/exhaustive_check.js
```

Expected output:

```
ends-with-01: 8191 strings (|w| <= 12), mismatches = 0
even-zeros: 8191 strings (|w| <= 12), mismatches = 0
RESULT: all verdicts agree with the reference predicates
```

---

## Known Limitations

1. **Incomplete DFA is rejected (No automatic trap state):** In formal automata theory, a DFA transition function must be total ($\delta : Q \times \Sigma \to Q$). If any state lacks a transition for an alphabet symbol, the simulator alerts the user with an explicit completeness error. It does not silently create an implicit dead/trap state.
2. **$\varepsilon$ (epsilon) input:** The empty string ($\varepsilon$) is represented by passing an empty input `""`. It is evaluated immediately against the start state $q_0$ without traversing transitions.
3. **Single-character symbols only:** Input string validation operates on a per-character basis. All alphabet symbols must be individual characters (e.g., `0`, `1` or `a`, `b`). Entering symbols longer than 1 character is rejected.
4. **Whitespace is trimmed:** Leading, trailing, and comma-delimited whitespace is automatically trimmed from state identifiers and alphabet inputs.
5. **Press Load after changing the input string:** Run All / Next Step / Reset may reuse the previously loaded string.
6. **Validator warnings (e.g. empty $F$, so every string is rejected) are computed but not displayed in the interface.**
7. **No save / load / export:** reloading the page restores the default preset.
8. **DFA only:** no NFA, $\varepsilon$-NFA, minimization, equivalence checking or conversions; no batch testing of many strings.
9. **Single-character check for alphabet symbols is applied in the interface layer, not in `DFA.setAlphabet`.**
10. **State names are inserted with innerHTML without escaping.**
11. **Some interface behaviours (dragging, Auto Layout, narrow screens, Firefox/Edge) have not yet been verified by manual tests.**
12. **Whitespace trimming of the input string (leading/trailing blanks) is implemented but not yet covered by a manual interface test.**

---

## Troubleshooting

- **Blank page or buttons do nothing:** Open the browser console; open `index.html` from the repo root so all six scripts in `js/` load.
- **"Incomplete DFA" banner:** Fill every $\delta(q, a)$ in the transition table; the banner lists each missing pair.
- **Old verdict still shown:** Press Load after changing the input string.
- **`node: command not found`:** Install Node.js (needed only for tests).
- **Tests fail with a path error:** Run commands from the repository root.

---

## Team Contributions

| Member (ID) | Main Responsibilities |
| :--- | :--- |
| **Sushant Feria** (S24CSEU2389) | Project lead. Overall design and the automata logic (DFA model, validator, simulator); integration of the interface; automated tests; deployment on Render; preparation of the Milestone-II report and this README. |
| **Bharat Madan** (S24CSEU2405) | Full-stack and code side: interface components and controller wiring (page structure, diagram and transition-table views, event handling); code review and fixes. |
| **Abhay Modanwal** (S24CSEU2399) | Supporting work: interface testing and screenshots, example automata and test strings, review of documentation. |

---

## Acknowledgements

Faculty: Chanchal Maurya. Hosting: Render (static site). Tests: Node.js. No external JavaScript or CSS libraries are used; system fonts only.
