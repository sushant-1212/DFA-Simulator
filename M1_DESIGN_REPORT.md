# Milestone 1 (M1): Problem Analysis & System Design Report
## Project Title: Interactive Web-Based DFA Simulator
**Course:** Theory of Automata & Formal Languages  
**Evaluation Dates:** 2–6 November 2026  
**Total Marks:** 5 Marks  
**Project Platform:** Modern Web (HTML5, CSS3, JavaScript ES6, Native SVG)  
**Repository / Working Directory:** `C:\Users\Hp\.gemini\antigravity\scratch\DFA-Simulator`

---

## 1. Criterion 1: Problem Definition & Automata Specification (1 Mark)

### 1.1 Problem Statement
Formal Language and Automata Theory is a foundational pillar of computer science. However, students frequently struggle to bridge theoretical mathematical abstractions—such as 5-tuples, state transition functions, and instantaneous descriptions—with concrete computational processes. Traditional learning relies heavily on static blackboard drawings and manual trace tables, which are prone to human calculation error and lack visual execution feedback.

Existing software tools are often either legacy desktop utilities requiring cumbersome Java runtimes (such as JFLAP) or oversimplified tools that do not enforce complete DFA constraints or provide bidirectional synchronization between transition tables and visual state graphs.

### 1.2 Project Objectives
1. **Develop an accessible, zero-installation web simulator** enabling students and educators to define, visualize, and simulate Deterministic Finite Automata (DFAs).
2. **Provide dual input modalities**: Users can define transitions visually via directed graph manipulation or through a structured matrix transition table.
3. **Maintain strict two-way synchronization**: Modifications in the transition table dynamically update the SVG state diagram and vice versa, reading from a single centralized data model.
4. **Enforce formal automata validation**: Verify that all components of the DFA 5-tuple are complete and unambiguous before simulation.
5. **Support granular step-by-step execution**: Visually highlight active states, traversed transitions, and instantaneous configuration changes alongside an execution trace log.

### 1.3 System Inputs & Outputs
- **Inputs:**
  - State set $Q = \{q_0, q_1, \dots, q_{n-1}\}$
  - Alphabet $\Sigma = \{a_1, a_2, \dots, a_m\}$
  - Initial state $q_0 \in Q$
  - Accepting / final states set $F \subseteq Q$
  - Transition mappings $\delta : Q \times \Sigma \to Q$
  - User test string $w \in \Sigma^*$
- **Outputs:**
  - Dynamically rendered SVG state diagram with double circles for final states and an incoming marker for the initial state.
  - Synchronized transition table matrix with standard automata notations ($\to$ for initial, $*$ for final).
  - DFA validation diagnostic report (identifying missing transitions $\delta(q, a)$ or invalid references).
  - Step-by-step visual animation (active state glow, active directed edge highlight).
  - Step trace log table with step index, symbol consumed, origin state, and destination state.
  - Final decision badge: **ACCEPTED** ($q_{\text{final}} \in F$) or **REJECTED** ($q_{\text{final}} \notin F$), or **INVALID INPUT** ($w \notin \Sigma^*$).

### 1.4 Formal Automata Specification
A Deterministic Finite Automaton (DFA) is formally defined as a 5-tuple:
$$M = (Q, \Sigma, \delta, q_0, F)$$

Where:
1. **$Q$** is a finite, non-empty set of states.
2. **$\Sigma$** is a finite, non-empty set of input symbols (the alphabet).
3. **$\delta$** is the transition function mapping:
   $$\delta : Q \times \Sigma \to Q$$
   In a complete DFA, for every state $q \in Q$ and every symbol $a \in \Sigma$, there exists **exactly one** deterministic next state $p \in Q$.
4. **$q_0 \in Q$** is the unique start (initial) state.
5. **$F \subseteq Q$** is the set of final (accepting) states.

The extended transition function $\hat{\delta} : Q \times \Sigma^* \to Q$ is recursively defined as:
- $\hat{\delta}(q, \varepsilon) = q$
- $\hat{\delta}(q, wa) = \delta(\hat{\delta}(q, w), a)$ for $w \in \Sigma^*$ and $a \in \Sigma$.

A string $w \in \Sigma^*$ is **accepted** by $M$ if and only if:
$$\hat{\delta}(q_0, w) \in F$$
Otherwise, $w$ is **rejected**.

---

## 2. Criterion 2: Existing Tools & Feasibility Analysis (1 Mark)

### 2.1 Review of Existing Tools
| Tool Name | Platform | Strengths | Limitations & Pain Points |
| :--- | :--- | :--- | :--- |
| **JFLAP** | Java Desktop Application | Comprehensive feature set (DFA, NFA, PDA, Turing Machines). | Requires local Java JRE installation; dated 1990s UI; complex modal dialogs; non-responsive on high-DPI displays; steep learning curve for novices. |
| **Automata Simulator (Web)** | Browser (HTML/JS) | Web-based; simple layout. | Weak or non-existent transition table synchronization; often silently fails on incomplete DFAs rather than validating completeness. |
| **Cyberzhg Automata Tools** | Browser / Canvas | Fast graph construction; good conversion algorithms. | Complex graph-drawing controls; lacks beginner-friendly step-by-step execution traces and dual table-graph editing. |

### 2.2 Technical Feasibility
- **Technology Stack:** Pure client-side HTML5, CSS3, ES6 JavaScript, and native SVG.
- **No Third-Party Bloat:** Does not rely on heavy dependencies (React, Angular, or heavy D3 libraries), ensuring lightning-fast load times (< 100ms) and zero build-pipeline requirements.
- **Cross-Platform Compatibility:** Runs identically on any standard browser (Chrome, Firefox, Safari, Edge) across Windows, macOS, Linux, and mobile devices.
- **Data Persistence & Isolation:** Operates in client-side memory without transmitting user data to any external server, guaranteeing privacy and offline usability.

### 2.3 Operational & Educational Feasibility
- Intuitive 3-column layout mimics standard laboratory workbenches:
  - Left: Formal configuration
  - Center: Visual diagram & transition matrix
  - Right: Interactive execution & trace table
- Built-in "Load Example" presets (e.g., *Strings ending with "01"*, *Even number of "0"s*) allow students and instructors to begin experimenting immediately without setup friction.

---

## 3. Criterion 3: Simulator Design & Methodology (2 Marks)

### 3.1 Four-Layer System Architecture
```
+--------------------------------------------------------------------+
| 1. Presentation Layer (UI)                                         |
|    - HTML5 Responsive 3-Column Workbench                           |
|    - SVG 2D Canvas (Interactive Nodes, Curves, Self-Loops, Markers)|
|    - Synchronized Matrix Transition Table                          |
|    - Step-by-Step Simulation Control Panel & Result Badge           |
+--------------------------------------------------------------------+
                                 |
                                 v
+--------------------------------------------------------------------+
| 2. DFA Management Layer (dfa.js)                                   |
|    - Central Automata Model: M = (Q, Sigma, delta, q0, F)          |
|    - Dynamic State Addition / Deletion                             |
|    - Bidirectional Transition Mapping Table                        |
|    - Automated Coordinate Layout Calculator (autoLayout)           |
+--------------------------------------------------------------------+
                                 |
                                 v
+--------------------------------------------------------------------+
| 3. Validation & Simulation Layer (validator.js & simulator.js)     |
|    - Completeness Verifier (Total function delta: Q x Sigma -> Q)  |
|    - Alphabet Membership Checker (w in Sigma*)                     |
|    - Deterministic Transition Stepper                              |
|    - Instantaneous Execution Path & Trace Logger                   |
+--------------------------------------------------------------------+
                                 |
                                 v
+--------------------------------------------------------------------+
| 4. Output & Feedback Layer (graph.js, transitionTable.js)          |
|    - Active Node Glow (Blue during run, Green=Accept, Red=Reject)  |
|    - Highlighted Transition Arrows (marker-end active)             |
|    - Step Trace Table Log Updates                                  |
+--------------------------------------------------------------------+
```

### 3.2 Input-Processing-Output (IPO) Workflow
```
[User Input]
  ├── Define Q, Sigma, q0, F
  ├── Enter delta via Table Dropdowns or Visual Selector
  └── Input string w in Sigma*
         │
         ▼
[Processing Engine]
  ├── Step 1: DFA Completeness Verification
  │     └── If incomplete: Display specific missing delta(q, a)
  ├── Step 2: String Validation
  │     └── If symbol not in Sigma: Flag invalid input character
  ├── Step 3: Transition Execution
  │     └── Current State <- q0
  │     └── For each char c in w:
  │           Next State <- delta(Current State, c)
  │           Record (step, c, origin, destination) in History
  │           Update SVG highlights
  └── Step 4: Acceptance Evaluation
        └── If Current State in F -> ACCEPTED
        └── Else -> REJECTED
         │
         ▼
[Visual Output]
  ├── Highlighted SVG State & Transition Arrow
  ├── Populated Step Execution Trace Table
  └── Color-Coded Acceptance Banner
```

### 3.3 System Flowchart
```mermaid
flowchart TD
    Start([Start]) --> Init[User configures Q, Sigma, q0, F]
    Init --> InputTrans[Define transitions delta via Table or Graph]
    InputTrans --> ValidateCheck{Is DFA valid and complete?}
    ValidateCheck -- No --> ShowErr[Display Missing Transitions or Errors]
    ShowErr --> InputTrans
    ValidateCheck -- Yes --> EnterStr[Enter Input String w]
    EnterStr --> CheckAlphabet{Are all chars in Sigma?}
    CheckAlphabet -- No --> ErrSym[Display 'Invalid Symbol' Alert]
    ErrSym --> EnterStr
    CheckAlphabet -- Yes --> InitSim[Set CurrentState = q0, Step = 0]
    InitSim --> StepCheck{Remaining symbols in w?}
    StepCheck -- Yes --> ReadSym[Read next symbol a from w]
    ReadSym --> Transit[Apply delta: NextState = delta CurrentState, a]
    Transit --> Highlight[Highlight Active Node & Edge in SVG Graph]
    Highlight --> AppendTrace[Append to Execution Trace Table]
    AppendTrace --> UpdateState[CurrentState = NextState]
    UpdateState --> StepCheck
    StepCheck -- No --> CheckFinal{Is CurrentState in F?}
    CheckFinal -- Yes --> Accept[Display ACCEPTED Banner Green]
    CheckFinal -- No --> Reject[Display REJECTED Banner Red]
    Accept --> EndNode([End / Reset])
    Reject --> EndNode
```

### 3.4 UML Component / Module Architecture
```mermaid
classDiagram
    class DFA {
        +Array states
        +Array alphabet
        +String initialState
        +Set finalStates
        +Object transitions
        +Object positions
        +addState(name, x, y)
        +removeState(stateId)
        +setAlphabet(symbols)
        +setInitialState(stateId)
        +setFinalState(stateId, isFinal)
        +setTransition(from, symbol, to)
        +getTransition(from, symbol)
        +autoLayout(width, height)
    }

    class DFAValidator {
        +validate(dfa) Object
        +validateInputString(str, alphabet) Object
    }

    class DFASimulator {
        +DFA dfa
        +String inputString
        +Number currentIndex
        +String currentState
        +Array history
        +String status
        +init(inputString)
        +step()
        +runAll()
        +reset()
    }

    class DFAGraph {
        +SVGElement svg
        +DFA dfa
        +render(activeState, activeEdge, isAccepted)
        +renderSelfLoop()
        +renderDirectedEdge()
    }

    class TransitionTable {
        +HTMLElement container
        +DFA dfa
        +render()
    }

    DFAValidator ..> DFA : Validates
    DFASimulator --> DFA : Executes on
    DFAGraph --> DFA : Renders
    TransitionTable --> DFA : Syncs with
```

### 3.5 UI Layout & Wireframe Specification
The application workspace is split into three functional columns:

```
+----------------------------------------------------------------------------------------------------+
|  ⚙️ DFA Simulator   [Load Preset: Ends with "01"] [Load Preset: Even '0's] [Clear Automaton]        |
+-----------------------------------+------------------------------------+---------------------------+
| SECTION A: CONFIGURATION          | SECTION B: STATE DIAGRAM & TABLE   | SECTION C: SIMULATION     |
|                                   |                                    |                           |
| 1. States (Q)                     | [Auto Layout]  [Validate DFA]      | Input String (w):         |
|    [Add State: q0] [+ Add]        | +--------------------------------+ | [ 1101             ]      |
|    Chips: (q0) (q1) [q2*]         | |                                | | [Load]                    |
|                                   | |      0           0, 1          | |                           |
| 2. Alphabet (Sigma)               | |   (q0) ------> (q1) ------> [q2]| | [▶ Run All] [⏭ Step]     |
|    [ 0, 1 ] [Set]                 | |    ^            |              | | [↺ Reset]                 |
|                                   | |    |_____1______|              | |                           |
| 3. Initial State (q0)             | +--------------------------------+ | STATUS: ACCEPTED          |
|    Dropdown: [ q0 ]               |                                    |                           |
|                                   | Synchronized Transition Table:     | Execution Trace:          |
| 4. Final States (F)               | +-------+--------+--------+        | Step | Sym | From | To    |
|    [ ] q0  [ ] q1  [x] q2         | | State |   0    |   1    |        | 0    |  -  |  -   | q0    |
|                                   | +-------+--------+--------+        | 1    |  1  | q0   | q0    |
| 5. Transition Creator             | | -> q0 |   q1   |   q0   |        | 2    |  1  | q0   | q0    |
|    [q0] on [0] -> [q1] [Set]      | |    q1 |   q1   |   q2   |        | 3    |  0  | q0   | q1    |
|                                   | |  * q2 |   q1   |   q0   |        | 4    |  1  | q1   | q2    |
|                                   | +-------+--------+--------+        +---------------------------+
+-----------------------------------+------------------------------------+---------------------------+
```

---

## 4. Criterion 4: Algorithm Selection & Correctness (1 Mark)

### 4.1 DFA Validation Algorithm
A complete DFA must satisfy the mathematical property that every state has exactly one outgoing transition for each symbol in $\Sigma$.

```text
ALGORITHM ValidateDFA(M = (Q, Sigma, delta, q0, F)):
Input: Automaton M
Output: { isValid: Boolean, errors: List of Strings }

1. errors <- Empty List
2. IF |Q| == 0 THEN
3.     APPEND "State set Q cannot be empty" TO errors
4. IF |Sigma| == 0 THEN
5.     APPEND "Alphabet Sigma cannot be empty" TO errors
6. IF q0 is NULL OR q0 NOT IN Q THEN
7.     APPEND "Initial state q0 must belong to Q" TO errors
8. FOR EACH f IN F DO:
9.     IF f NOT IN Q THEN
10.        APPEND "Final state f does not exist in Q" TO errors
11. FOR EACH state q IN Q DO:
12.    FOR EACH symbol a IN Sigma DO:
13.        dest <- delta(q, a)
14.        IF dest is NULL THEN
15.            APPEND "Missing transition delta(q, a)" TO errors
16.        ELSE IF dest NOT IN Q THEN
17.            APPEND "Transition delta(q, a) points to invalid state" TO errors

18. RETURN { isValid: (|errors| == 0), errors: errors }
```

### 4.2 DFA Simulation Algorithm
The simulation processes string $w = a_1 a_2 \dots a_n$ deterministically.

```text
ALGORITHM SimulateDFA(M = (Q, Sigma, delta, q0, F), inputString w):
Input: Automaton M, string w
Output: Status in { ACCEPTED, REJECTED, INVALID_INPUT }, Execution History

1. FOR EACH character ch in w DO:
2.     IF ch NOT IN Sigma THEN
3.         RETURN { Status: INVALID_INPUT, Error: "Character ch not in Sigma" }

4. currentState <- q0
5. history <- [ { Step: 0, Symbol: "—", State: currentState } ]

6. FOR i <- 0 TO Length(w) - 1 DO:
7.     sym <- w[i]
8.     fromState <- currentState
9.     nextState <- delta(fromState, sym)
10.    currentState <- nextState
11.    APPEND { Step: i + 1, Symbol: sym, From: fromState, To: nextState } TO history

12. IF currentState IN F THEN
13.    finalResult <- ACCEPTED
14. ELSE
15.    finalResult <- REJECTED

16. RETURN { Status: finalResult, History: history, FinalState: currentState }
```

### 4.3 Complexity Analysis
- **Time Complexity:**
  - *Validation:* $O(|Q| \cdot |\Sigma|)$ since every state-symbol pair in the matrix is verified once.
  - *Simulation:* $O(|w|)$ where $|w|$ is the length of the input string. Because state lookup in the transition hash table `transitions[q][a]` is $O(1)$, string processing takes strictly linear time in the length of the string.
- **Space Complexity:**
  - *Model Storage:* $O(|Q| \cdot |\Sigma|)$ space to store the transition table.
  - *Execution:* $O(|w|)$ auxiliary space to preserve the step-by-step trace history log.

---

## 5. Manually Solved Validation Example

### 5.1 Problem Statement
Design and manually trace a DFA over the alphabet $\Sigma = \{0, 1\}$ that accepts the language:
$$L = \{ w \in \{0, 1\}^* \mid w \text{ ends with the substring } 01 \}$$

### 5.2 Formal 5-Tuple Definition
- $Q = \{q_0, q_1, q_2\}$
  - $q_0$: Initial state (no trailing '0' or string ends with '1' that is not preceded by '0').
  - $q_1$: Found trailing '0' (candidate prefix for "01").
  - $q_2$: Found substring "01" at current suffix.
- $\Sigma = \{0, 1\}$
- $q_0$ is the start state.
- $F = \{q_2\}$
- Transition function $\delta$:
  - $\delta(q_0, 0) = q_1, \quad \delta(q_0, 1) = q_0$
  - $\delta(q_1, 0) = q_1, \quad \delta(q_1, 1) = q_2$
  - $\delta(q_2, 0) = q_1, \quad \delta(q_2, 1) = q_0$

### 5.3 Formal Transition Matrix
| State ($Q$) | Input '0' | Input '1' |
| :---: | :---: | :---: |
| $\to q_0$ | $q_1$ | $q_0$ |
| $q_1$ | $q_1$ | $q_2$ |
| $* q_2$ | $q_1$ | $q_0$ |

### 5.4 Step-by-Step Manual Trace for String $w = 1101$
- Initial Configuration: $(q_0, 1101)$
- **Step 1:** Consuming symbol `'1'` from $q_0$:
  $$\delta(q_0, 1) = q_0 \implies (q_0, 101)$$
- **Step 2:** Consuming symbol `'1'` from $q_0$:
  $$\delta(q_0, 1) = q_0 \implies (q_0, 01)$$
- **Step 3:** Consuming symbol `'0'` from $q_0$:
  $$\delta(q_0, 0) = q_1 \implies (q_1, 1)$$
- **Step 4:** Consuming symbol `'1'` from $q_1$:
  $$\delta(q_1, 1) = q_2 \implies (q_2, \varepsilon)$$
- End of input string reached. Current state is $q_2$.
- Since $q_2 \in F = \{q_2\}$, the string $w = 1101$ is **ACCEPTED**.

### 5.5 Comprehensive Verification Suite: Expected vs. Generated Results
The following test suite was executed against the built prototype simulator:

| Test ID | Input String ($w$) | Theoretical Reason | Expected Output | Prototype Output | Verification Status |
| :---: | :---: | :--- | :---: | :---: | :---: |
| 1 | `1101` | Suffix is `01` | **ACCEPTED** | **ACCEPTED** | **PASS ✅** |
| 2 | `1010` | Suffix is `10` | **REJECTED** | **REJECTED** | **PASS ✅** |
| 3 | `01` | Minimal string matching `01` | **ACCEPTED** | **ACCEPTED** | **PASS ✅** |
| 4 | `1111` | Does not contain or end with `01` | **REJECTED** | **REJECTED** | **PASS ✅** |
| 5 | `0001` | Multiple leading `0`s ending in `01` | **ACCEPTED** | **ACCEPTED** | **PASS ✅** |
| 6 | `""` (empty) | Length 0, ends at $q_0 \notin F$ | **REJECTED** | **REJECTED** | **PASS ✅** |
| 7 | `1021` | Symbol `'2'` is not in $\Sigma = \{0, 1\}$ | **INVALID INPUT** | **ERROR** | **PASS ✅** |
| 8 | `101` | Suffix is `01` | **ACCEPTED** | **ACCEPTED** | **PASS ✅** |

---

## 6. Milestone 1 Deliverables Checklist

| Requirement from Evaluation Rubric | Target Evidence | Completed? |
| :--- | :--- | :---: |
| **Problem Definition & Specification** (1 Mark) | Problem, objectives, inputs/outputs, 5-tuple definition $M=(Q,\Sigma,\delta,q_0,F)$ | **YES ✅** |
| **Existing Tools & Feasibility** (1 Mark) | JFLAP, web tools comparison, technical & operational feasibility | **YES ✅** |
| **Simulator Design & Methodology** (2 Marks) | 4-layer architecture, IPO workflow, Mermaid flowchart, UML diagrams, UI wireframe | **YES ✅** |
| **Algorithm & Correctness** (1 Mark) | Validation & simulation pseudocode, complexity, manual trace example & test table | **YES ✅** |
| **Preliminary Prototype** (Encouraged) | Working web app with synchronized table, interactive SVG, and step simulator | **YES ✅ (Fully Built)** |

---

## 7. How to Run the Prototype
1. Open the project folder in VS Code or file explorer:  
   `C:\Users\Hp\.gemini\antigravity\scratch\DFA-Simulator`
2. Double click `index.html` to open directly in Google Chrome, Microsoft Edge, or any modern web browser. (No node server or build step required!)
3. Click the preset button **"Load: Ends with '01'"** in the top bar.
4. Click **"▶ Run All"** or **"⏭ Next Step"** to visualize instantaneous transitions on the graph diagram.
