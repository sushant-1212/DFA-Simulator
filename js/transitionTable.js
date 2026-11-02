/**
 * Synchronized Transition Table Component
 * Generates interactive table matrix and keeps in sync with the central DFA model.
 */
class TransitionTable {
    constructor(containerElement, dfa, onTransitionChange) {
        this.container = containerElement;
        this.dfa = dfa;
        this.onTransitionChange = onTransitionChange;
    }

    render() {
        if (!this.dfa.states.length || !this.dfa.alphabet.length) {
            this.container.innerHTML = `
                <div class="empty-table-placeholder">
                    <p>Add states and alphabet symbols to generate the transition table.</p>
                </div>
            `;
            return;
        }

        let html = `
            <table class="dfa-table">
                <thead>
                    <tr>
                        <th class="state-col-header">State (Q)</th>
        `;

        // Column headers for each symbol in Sigma
        for (const sym of this.dfa.alphabet) {
            html += `<th>Input '<strong>${sym}</strong>'</th>`;
        }

        html += `
                    </tr>
                </thead>
                <tbody>
        `;

        // Rows for each state in Q
        for (const state of this.dfa.states) {
            const isInitial = (this.dfa.initialState === state);
            const isFinal = this.dfa.finalStates.has(state);

            // Automata notation prefix: '->' for initial, '*' for final
            let prefix = "";
            if (isInitial && isFinal) {
                prefix = "→ * ";
            } else if (isInitial) {
                prefix = "→ ";
            } else if (isFinal) {
                prefix = "* ";
            }

            html += `
                <tr>
                    <td class="state-cell">
                        <span class="state-prefix">${prefix}</span>
                        <span class="state-tag ${isFinal ? 'tag-final' : ''} ${isInitial ? 'tag-initial' : ''}">${state}</span>
                    </td>
            `;

            for (const sym of this.dfa.alphabet) {
                const currentDest = this.dfa.getTransition(state, sym) || "";

                html += `
                    <td>
                        <select class="table-select" data-from="${state}" data-symbol="${sym}">
                            <option value="" ${currentDest === "" ? "selected" : ""}>— select —</option>
                `;

                for (const destState of this.dfa.states) {
                    const isSelected = (destState === currentDest);
                    html += `<option value="${destState}" ${isSelected ? "selected" : ""}>${destState}</option>`;
                }

                html += `
                        </select>
                    </td>
                `;
            }

            html += `</tr>`;
        }

        html += `
                </tbody>
            </table>
        `;

        this.container.innerHTML = html;

        // Attach change listeners to select elements
        const selects = this.container.querySelectorAll(".table-select");
        selects.forEach(select => {
            select.addEventListener("change", (e) => {
                const from = e.target.getAttribute("data-from");
                const sym = e.target.getAttribute("data-symbol");
                const to = e.target.value || null;

                this.dfa.setTransition(from, sym, to);

                if (this.onTransitionChange) {
                    this.onTransitionChange();
                }
            });
        });
    }
}

// Export for browser
window.TransitionTable = TransitionTable;
