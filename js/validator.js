/**
 * DFA Validator
 * Checks whether the automaton adheres to the mathematical definition of a complete DFA.
 */
class DFAValidator {
    /**
     * Validates the provided DFA instance.
     * @param {DFA} dfa
     * @returns {{ isValid: boolean, errors: string[], warnings: string[] }}
     */
    static validate(dfa) {
        const errors = [];
        const warnings = [];

        // 1. Check Q (States)
        if (!dfa.states || dfa.states.length === 0) {
            errors.push("State set Q cannot be empty. Add at least one state.");
        }

        // 2. Check Sigma (Alphabet)
        if (!dfa.alphabet || dfa.alphabet.length === 0) {
            errors.push("Alphabet Σ cannot be empty. Define at least one input symbol.");
        }

        // 3. Check q0 (Initial State)
        if (!dfa.initialState) {
            errors.push("Initial state q₀ is not defined. Select a start state.");
        } else if (!dfa.states.includes(dfa.initialState)) {
            errors.push(`Initial state "${dfa.initialState}" does not exist in state set Q.`);
        }

        // 4. Check F (Final States)
        for (const f of dfa.finalStates) {
            if (!dfa.states.includes(f)) {
                errors.push(`Final state "${f}" does not exist in state set Q.`);
            }
        }
        if (dfa.finalStates.size === 0) {
            warnings.push("No accepting (final) states are configured. Every string will be rejected.");
        }

        // 5. Check Completeness of Transition Function delta: Q x Sigma -> Q
        if (dfa.states && dfa.alphabet) {
            for (const state of dfa.states) {
                for (const symbol of dfa.alphabet) {
                    const dest = dfa.getTransition(state, symbol);
                    if (!dest) {
                        errors.push(`Missing transition: δ(${state}, '${symbol}') is not defined.`);
                    } else if (!dfa.states.includes(dest)) {
                        errors.push(`Invalid transition: δ(${state}, '${symbol}') points to nonexistent state "${dest}".`);
                    }
                }
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    /**
     * Validates if a user input string contains only symbols in the alphabet.
     * @param {string} inputString
     * @param {string[]} alphabet
     * @returns {{ isValid: boolean, invalidChars: string[] }}
     */
    static validateInputString(inputString, alphabet) {
        const invalidChars = [];
        for (const ch of inputString) {
            if (!alphabet.includes(ch) && !invalidChars.includes(ch)) {
                invalidChars.push(ch);
            }
        }
        return {
            isValid: invalidChars.length === 0,
            invalidChars
        };
    }
}

// Export for browser
window.DFAValidator = DFAValidator;
