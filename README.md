# ⚙️ Interactive DFA Simulator (Automata Theory)

A clean, web-based Deterministic Finite Automata (DFA) simulator designed for educational visualization and formal language analysis.

Built with **HTML5, CSS3, ES6 JavaScript, and Native SVG** (Zero external dependencies).

---

## 🌟 Key Features
- **Central Formal Model:** Built strictly around the mathematical 5-tuple: $M = (Q, \Sigma, \delta, q_0, F)$.
- **Bidirectional Synchronization:** Edit transitions visually or edit the matrix table directly; both synchronize in real-time with zero discrepancy.
- **Interactive SVG Graph:** Draggable states, directed arrow markers, double circles for final states, and start arrow indicators.
- **Strict Completeness Validation:** Checks that every state has an outgoing transition for every symbol in the alphabet $\Sigma$, reporting exact missing transitions if invalid.
- **Step-by-Step Execution:** Highlight current states, dynamic transition paths, and inspect the real-time execution trace table.
- **Ready-to-Demo Presets:** Instant one-click loading of standard automata examples (e.g. *Binary strings ending with "01"*).

---

## 📁 Project Structure
```
DFA-Simulator/
│
├── index.html              # Main single-page workbench layout
├── css/
│   └── style.css           # Clean styling, responsive grid, visual states
├── js/
│   ├── dfa.js              # Central 5-tuple DFA data model & layout
│   ├── validator.js        # Formal completeness & input validator
│   ├── simulator.js        # Step-by-step & batch execution engine
│   ├── graph.js            # Interactive SVG renderer with drag & highlights
│   ├── transitionTable.js  # 2-way synchronized matrix table component
│   └── main.js             # UI wiring & event controller
│
├── M1_DESIGN_REPORT.md     # Official Milestone 1 Submission Report (5 Marks)
├── test_dfa.js             # Automated test suite (8 test cases verified)
└── README.md               # Documentation & quick start guide
```

---

## 🚀 How to Run the Simulator
1. Navigate to the project folder:
   ```
   C:\Users\Hp\.gemini\antigravity\scratch\DFA-Simulator
   ```
2. Simply double-click **`index.html`** to launch it in any modern web browser (Google Chrome, Edge, Firefox, Brave, Safari).
   - Alternatively, open the folder in VS Code and use the **Live Server** extension.
3. No Node.js server, Python backend, or npm dependencies are required.

---

## 🧪 Automated Testing
To run the terminal test suite:
```bash
node test_dfa.js
```
Expected output:
```
Validating ends-with-01 DFA: VALID
Test 1: w="1101" -> Status: ACCEPTED | Expected: ACCEPTED -> PASS ✅
Test 2: w="1010" -> Status: REJECTED | Expected: REJECTED -> PASS ✅
Test 3: w="01" -> Status: ACCEPTED | Expected: ACCEPTED -> PASS ✅
Test 4: w="1111" -> Status: REJECTED | Expected: REJECTED -> PASS ✅
Test 5: w="0001" -> Status: ACCEPTED | Expected: ACCEPTED -> PASS ✅
Test 6: w="" -> Status: REJECTED | Expected: REJECTED -> PASS ✅
Test 7: w="1021" -> Status: ERROR | Expected: ERROR -> PASS ✅
Test 8: w="101" -> Status: ACCEPTED | Expected: ACCEPTED -> PASS ✅
```
