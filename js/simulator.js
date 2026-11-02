/**
 * DFA Simulation Engine
 * Executes strings on a DFA step-by-step or in batch, maintaining execution history.
 */
class DFASimulator {
    constructor(dfa) {
        this.dfa = dfa;
        this.inputString = "";
        this.currentIndex = 0;
        this.currentState = null;
        this.history = [];
        this.status = "IDLE"; // IDLE, READY, RUNNING, ACCEPTED, REJECTED, ERROR
        this.lastActiveEdge = null;
    }

    /**
     * Initializes simulation with an input string
     */
    init(inputString) {
        // Validate DFA first
        const validation = DFAValidator.validate(this.dfa);
        if (!validation.isValid) {
            this.status = "ERROR";
            return {
                success: false,
                message: "Cannot simulate: DFA is incomplete or invalid. Please check configuration."
            };
        }

        // Validate characters against alphabet
        const inputCheck = DFAValidator.validateInputString(inputString, this.dfa.alphabet);
        if (!inputCheck.isValid) {
            this.status = "ERROR";
            return {
                success: false,
                message: `Input contains invalid symbol(s): '${inputCheck.invalidChars.join("', '")}'. Alphabet is { ${this.dfa.alphabet.join(", ")} }.`
            };
        }

        this.inputString = inputString;
        this.currentIndex = 0;
        this.currentState = this.dfa.initialState;
        this.lastActiveEdge = null;
        this.history = [{
            step: 0,
            symbol: "—",
            fromState: "—",
            toState: this.currentState,
            isFinal: this.dfa.finalStates.has(this.currentState),
            note: "Start state"
        }];

        // If empty string input
        if (this.inputString.length === 0) {
            const isAccepted = this.dfa.finalStates.has(this.currentState);
            this.status = isAccepted ? "ACCEPTED" : "REJECTED";
            this.history[0].note = `Empty string ε evaluated: ${this.status}`;
            return {
                success: true,
                status: this.status,
                finished: true
            };
        }

        this.status = "READY";
        return {
            success: true,
            status: this.status,
            finished: false
        };
    }

    /**
     * Executes the next transition step
     */
    step() {
        if (this.status === "IDLE" || this.status === "ERROR") {
            return { finished: true, error: "Simulation not initialized or has error." };
        }

        if (this.currentIndex >= this.inputString.length) {
            // Already finished
            return {
                finished: true,
                status: this.status,
                currentState: this.currentState
            };
        }

        const symbol = this.inputString[this.currentIndex];
        const from = this.currentState;
        const next = this.dfa.getTransition(from, symbol);

        if (!next) {
            this.status = "ERROR";
            return {
                finished: true,
                error: `No transition found for δ(${from}, '${symbol}')`
            };
        }

        this.lastActiveEdge = {
            from,
            symbol,
            to: next
        };

        this.currentState = next;
        this.currentIndex++;

        const isFinished = (this.currentIndex >= this.inputString.length);
        let stepNote = `δ(${from}, '${symbol}') → ${next}`;

        if (isFinished) {
            const isAccepted = this.dfa.finalStates.has(this.currentState);
            this.status = isAccepted ? "ACCEPTED" : "REJECTED";
            stepNote += ` (String completed: ${this.status})`;
        } else {
            this.status = "RUNNING";
        }

        this.history.push({
            step: this.currentIndex,
            symbol,
            fromState: from,
            toState: next,
            isFinal: this.dfa.finalStates.has(next),
            note: stepNote
        });

        return {
            finished: isFinished,
            status: this.status,
            currentIndex: this.currentIndex,
            symbol,
            fromState: from,
            toState: next,
            isAccepted: isFinished ? (this.status === "ACCEPTED") : null,
            activeEdge: this.lastActiveEdge
        };
    }

    /**
     * Runs all remaining steps automatically
     */
    runAll() {
        let result = null;
        while (this.currentIndex < this.inputString.length && this.status !== "ERROR") {
            result = this.step();
        }
        return result;
    }

    /**
     * Resets simulation to beginning
     */
    reset() {
        if (this.inputString !== undefined) {
            return this.init(this.inputString);
        }
        this.status = "IDLE";
        this.currentIndex = 0;
        this.currentState = null;
        this.history = [];
        this.lastActiveEdge = null;
    }
}

// Export for browser
window.DFASimulator = DFASimulator;
