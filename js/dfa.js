/**
 * DFA Model - Formal 5-tuple: M = (Q, Sigma, delta, q0, F)
 * Manages the central automata data structure.
 */
class DFA {
    constructor() {
        this.states = [];            // Q: Array of state IDs (e.g., ["q0", "q1", "q2"])
        this.alphabet = [];          // Sigma: Array of input symbols (e.g., ["0", "1"])
        this.initialState = null;    // q0: Start state ID
        this.finalStates = new Set();// F: Set of accepting state IDs
        this.transitions = {};       // delta: { stateId: { symbol: nextStateId } }
        this.positions = {};         // Layout coordinates for SVG graph: { stateId: { x, y } }
    }

    /**
     * Resets to an empty automaton
     */
    clear() {
        this.states = [];
        this.alphabet = [];
        this.initialState = null;
        this.finalStates.clear();
        this.transitions = {};
        this.positions = {};
    }

    /**
     * Add a new state to Q
     */
    addState(name, x = null, y = null) {
        const stateId = name.trim();
        if (!stateId || this.states.includes(stateId)) {
            return false;
        }
        this.states.push(stateId);
        this.transitions[stateId] = {};
        
        // Auto position if not provided
        if (x !== null && y !== null) {
            this.positions[stateId] = { x, y };
        } else {
            this.autoPositionState(stateId);
        }

        // If first state, make it initial by default
        if (this.states.length === 1) {
            this.initialState = stateId;
        }
        return true;
    }

    /**
     * Remove a state from Q and clean up transitions
     */
    removeState(stateId) {
        if (!this.states.includes(stateId)) return false;

        this.states = this.states.filter(s => s !== stateId);
        delete this.transitions[stateId];
        delete this.positions[stateId];
        this.finalStates.delete(stateId);

        if (this.initialState === stateId) {
            this.initialState = this.states.length > 0 ? this.states[0] : null;
        }

        // Remove incoming transitions to this state
        for (const s of this.states) {
            if (this.transitions[s]) {
                for (const sym of this.alphabet) {
                    if (this.transitions[s][sym] === stateId) {
                        delete this.transitions[s][sym];
                    }
                }
            }
        }
        return true;
    }

    /**
     * Set the alphabet Sigma
     */
    setAlphabet(symbolsArray) {
        const cleaned = [...new Set(symbolsArray.map(s => s.trim()).filter(s => s.length > 0))];
        this.alphabet = cleaned;

        // Clean up any transitions using symbols no longer in alphabet
        for (const s of this.states) {
            if (this.transitions[s]) {
                for (const sym of Object.keys(this.transitions[s])) {
                    if (!this.alphabet.includes(sym)) {
                        delete this.transitions[s][sym];
                    }
                }
            }
        }
    }

    /**
     * Set initial state q0
     */
    setInitialState(stateId) {
        if (this.states.includes(stateId)) {
            this.initialState = stateId;
            return true;
        }
        return false;
    }

    /**
     * Toggle or set final state status in F
     */
    toggleFinalState(stateId) {
        if (!this.states.includes(stateId)) return false;
        if (this.finalStates.has(stateId)) {
            this.finalStates.delete(stateId);
        } else {
            this.finalStates.add(stateId);
        }
        return true;
    }

    setFinalState(stateId, isFinal) {
        if (!this.states.includes(stateId)) return;
        if (isFinal) {
            this.finalStates.add(stateId);
        } else {
            this.finalStates.delete(stateId);
        }
    }

    /**
     * Set transition delta(fromState, symbol) = toState
     */
    setTransition(fromState, symbol, toState) {
        if (!this.states.includes(fromState)) return false;
        if (toState && !this.states.includes(toState)) return false;
        if (!this.alphabet.includes(symbol)) return false;

        if (!this.transitions[fromState]) {
            this.transitions[fromState] = {};
        }

        if (toState) {
            this.transitions[fromState][symbol] = toState;
        } else {
            delete this.transitions[fromState][symbol];
        }
        return true;
    }

    /**
     * Get transition delta(state, symbol)
     */
    getTransition(state, symbol) {
        return (this.transitions[state] && this.transitions[state][symbol]) || null;
    }

    /**
     * Auto positions states neatly on the canvas
     */
    autoLayout(width = 540, height = 320) {
        const n = this.states.length;
        if (n === 0) return;

        if (n <= 4) {
            // Horizontal row with padding
            const paddingX = 90;
            const stepX = (width - 2 * paddingX) / Math.max(1, n - 1);
            const centerY = height / 2;
            this.states.forEach((s, idx) => {
                this.positions[s] = {
                    x: paddingX + (n === 1 ? (width - 2 * paddingX) / 2 : idx * stepX),
                    y: centerY
                };
            });
        } else {
            // Circle layout for >= 5 states
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = Math.min(width, height) * 0.35;
            this.states.forEach((s, idx) => {
                const angle = (2 * Math.PI * idx) / n - Math.PI / 2;
                this.positions[s] = {
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            });
        }
    }

    autoPositionState(stateId) {
        const n = this.states.length;
        const width = 540;
        const height = 320;
        const paddingX = 90;
        const stepX = 130;
        this.positions[stateId] = {
            x: Math.min(width - 60, paddingX + (n - 1) * stepX),
            y: height / 2 + ((n % 2 === 0) ? -20 : 20)
        };
    }

    /**
     * Loads the classic standard sample DFA:
     * Accepts binary strings ending with '01' over Sigma = {0, 1}
     */
    loadEndsWith01Example() {
        this.clear();
        this.setAlphabet(["0", "1"]);
        this.addState("q0", 100, 160);
        this.addState("q1", 270, 160);
        this.addState("q2", 440, 160);

        this.setInitialState("q0");
        this.setFinalState("q2", true);

        // delta for ends with '01'
        // q0: '0' -> q1, '1' -> q0
        this.setTransition("q0", "0", "q1");
        this.setTransition("q0", "1", "q0");

        // q1: '0' -> q1, '1' -> q2
        this.setTransition("q1", "0", "q1");
        this.setTransition("q1", "1", "q2");

        // q2: '0' -> q1, '1' -> q0
        this.setTransition("q2", "0", "q1");
        this.setTransition("q2", "1", "q0");
    }

    /**
     * Loads an even-zeros sample DFA:
     * Accepts strings with an even number of '0's over Sigma = {0, 1}
     */
    loadEvenZerosExample() {
        this.clear();
        this.setAlphabet(["0", "1"]);
        this.addState("q_even", 160, 160);
        this.addState("q_odd", 380, 160);

        this.setInitialState("q_even");
        this.setFinalState("q_even", true);

        this.setTransition("q_even", "0", "q_odd");
        this.setTransition("q_even", "1", "q_even");

        this.setTransition("q_odd", "0", "q_even");
        this.setTransition("q_odd", "1", "q_odd");
    }
}

// Export for browser window
window.DFA = DFA;
