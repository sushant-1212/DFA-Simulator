/**
 * Main Application Controller
 * Wires together the UI, DFA model, SVG graph, Transition Table, and Simulator.
 */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Core instances
    const dfa = new DFA();
    const svgElem = document.getElementById("dfa-svg");
    const tableContainer = document.getElementById("transition-table-container");

    let graph = null;
    let transitionTable = null;
    let simulator = new DFASimulator(dfa);

    // 2. DOM Elements Cache
    const elInputNewState = document.getElementById("input-new-state");
    const btnAddState = document.getElementById("btn-add-state");
    const elStatesChipsList = document.getElementById("states-chips-list");
    const elStateCountBadge = document.getElementById("state-count-badge");

    const elInputAlphabet = document.getElementById("input-alphabet");
    const btnUpdateAlphabet = document.getElementById("btn-update-alphabet");
    const elInputAlphabetHint = document.getElementById("input-alphabet-hint");

    const elSelectInitialState = document.getElementById("select-initial-state");
    const elFinalStatesCheckboxes = document.getElementById("final-states-checkboxes");

    const elTransFrom = document.getElementById("trans-from");
    const elTransSymbol = document.getElementById("trans-symbol");
    const elTransTo = document.getElementById("trans-to");
    const btnSaveTransition = document.getElementById("btn-save-transition");

    const btnAutoLayout = document.getElementById("btn-auto-layout");
    const btnValidateDFA = document.getElementById("btn-validate-dfa");
    const elValidationAlert = document.getElementById("validation-alert");
    const elValidationMessage = document.getElementById("validation-message");

    const elInputString = document.getElementById("input-string");
    const btnInitSim = document.getElementById("btn-init-sim");
    const btnRunAll = document.getElementById("btn-run-all");
    const btnStep = document.getElementById("btn-step");
    const btnResetSim = document.getElementById("btn-reset-sim");
    const elSimStatusPill = document.getElementById("sim-status-pill");
    const elResultBanner = document.getElementById("result-banner");
    const elTraceTableBody = document.getElementById("trace-table-body");

    const btnPreset01 = document.getElementById("btn-load-preset-01");
    const btnPresetEven = document.getElementById("btn-load-preset-even");
    const btnClearDFA = document.getElementById("btn-clear-dfa");

    // 3. Initialize Graph & Table Components
    graph = new DFAGraph(svgElem, dfa, (clickedState) => {
        // State clicked in graph: populate transition form source
        elTransFrom.value = clickedState;
    });

    transitionTable = new TransitionTable(tableContainer, dfa, () => {
        // Callback when transition table dropdown changes: update graph and dropdowns
        graph.render();
        updateTransitionFormDropdowns();
        validateDFA(false); // Quiet validation check
    });

    // 4. UI Refresh Functions
    function refreshAllUI(recomputeLayout = false) {
        if (recomputeLayout) {
            dfa.autoLayout(svgElem.clientWidth || 540, svgElem.clientHeight || 320);
        }

        renderStatesList();
        renderAlphabetUI();
        renderInitialStateSelect();
        renderFinalStatesList();
        updateTransitionFormDropdowns();

        transitionTable.render();
        graph.render();

        validateDFA(false);
    }

    function renderStatesList() {
        elStatesChipsList.innerHTML = "";
        elStateCountBadge.textContent = `${dfa.states.length} state${dfa.states.length === 1 ? '' : 's'}`;

        dfa.states.forEach(s => {
            const isInit = (dfa.initialState === s);
            const isFin = dfa.finalStates.has(s);

            const chip = document.createElement("div");
            chip.className = `state-chip ${isInit ? 'is-initial' : ''} ${isFin ? 'is-final' : ''}`;
            chip.innerHTML = `
                <span>${s}${isFin ? ' *' : ''}${isInit ? ' (start)' : ''}</span>
                <span class="chip-remove" title="Delete state">&times;</span>
            `;

            chip.querySelector(".chip-remove").addEventListener("click", (e) => {
                e.stopPropagation();
                dfa.removeState(s);
                refreshAllUI(true);
            });

            elStatesChipsList.appendChild(chip);
        });
    }

    function renderAlphabetUI() {
        elInputAlphabet.value = dfa.alphabet.join(", ");
        elInputAlphabetHint.textContent = `Alphabet: { ${dfa.alphabet.join(", ")} }`;
    }

    function renderInitialStateSelect() {
        elSelectInitialState.innerHTML = `<option value="">— select start state —</option>`;
        dfa.states.forEach(s => {
            const opt = document.createElement("option");
            opt.value = s;
            opt.textContent = s;
            if (dfa.initialState === s) opt.selected = true;
            elSelectInitialState.appendChild(opt);
        });
    }

    function renderFinalStatesList() {
        elFinalStatesCheckboxes.innerHTML = "";
        if (dfa.states.length === 0) {
            elFinalStatesCheckboxes.innerHTML = `<span style="font-size:0.75rem; color:var(--text-muted);">No states added yet.</span>`;
            return;
        }

        dfa.states.forEach(s => {
            const isFinal = dfa.finalStates.has(s);
            const label = document.createElement("label");
            label.style.display = "flex";
            label.style.alignItems = "center";
            label.style.gap = "0.4rem";
            label.style.fontSize = "0.825rem";
            label.style.cursor = "pointer";

            label.innerHTML = `
                <input type="checkbox" value="${s}" ${isFinal ? 'checked' : ''}>
                <span>${s}</span>
            `;

            label.querySelector("input").addEventListener("change", (e) => {
                dfa.setFinalState(s, e.target.checked);
                refreshAllUI(false);
            });

            elFinalStatesCheckboxes.appendChild(label);
        });
    }

    function updateTransitionFormDropdowns() {
        // Populate From
        elTransFrom.innerHTML = dfa.states.map(s => `<option value="${s}">${s}</option>`).join("");
        // Populate To
        elTransTo.innerHTML = dfa.states.map(s => `<option value="${s}">${s}</option>`).join("");
        // Populate Symbol
        elTransSymbol.innerHTML = dfa.alphabet.map(a => `<option value="${a}">${a}</option>`).join("");
    }

    // 5. Validation Logic
    function validateDFA(showAlert = true) {
        const result = DFAValidator.validate(dfa);
        if (result.isValid) {
            elValidationAlert.className = "validation-box is-valid";
            elValidationMessage.innerHTML = "✅ Valid Complete DFA: All states have complete transitions for every alphabet symbol.";
        } else {
            elValidationAlert.className = "validation-box is-invalid";
            let html = `<strong>⚠️ Incomplete DFA:</strong><ul>`;
            result.errors.forEach(err => {
                html += `<li>${err}</li>`;
            });
            html += `</ul>`;
            elValidationMessage.innerHTML = html;
        }

        if (showAlert) {
            elValidationAlert.style.display = "block";
            elValidationAlert.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            elValidationAlert.style.display = result.isValid ? "none" : "block";
        }
        return result.isValid;
    }

    // 6. Simulation Logic
    function initSimulation() {
        const inputVal = elInputString.value.trim();
        const initRes = simulator.init(inputVal);

        resetTraceTable();
        updateSimulationUI();

        if (!initRes.success) {
            elResultBanner.className = "status-banner status-rejected";
            elResultBanner.textContent = initRes.message;
            elResultBanner.style.display = "block";
            return false;
        }

        if (initRes.finished) {
            handleSimulationFinished();
        }

        return true;
    }

    function stepSimulation() {
        if (simulator.status === "IDLE" || simulator.status === "ERROR") {
            const ok = initSimulation();
            if (!ok) return;
        }

        const stepRes = simulator.step();
        updateSimulationUI();

        if (stepRes.finished) {
            handleSimulationFinished();
        }
    }

    function runAllSimulation() {
        if (simulator.status === "IDLE" || simulator.status === "ERROR") {
            const ok = initSimulation();
            if (!ok) return;
        }

        simulator.runAll();
        updateSimulationUI();
        handleSimulationFinished();
    }

    function resetSimulation() {
        simulator.reset();
        resetTraceTable();
        elResultBanner.style.display = "none";
        elSimStatusPill.textContent = "Idle";
        graph.render();
    }

    function updateSimulationUI() {
        elSimStatusPill.textContent = simulator.status;

        // Render Trace Table rows
        elTraceTableBody.innerHTML = "";
        simulator.history.forEach((h, idx) => {
            const isLast = (idx === simulator.history.length - 1);
            const tr = document.createElement("tr");
            if (isLast) tr.className = "active-step";

            tr.innerHTML = `
                <td>${h.step}</td>
                <td><strong>${h.symbol}</strong></td>
                <td>${h.fromState}</td>
                <td><span style="font-weight:600;">${h.toState}</span></td>
            `;
            elTraceTableBody.appendChild(tr);
        });

        // Scroll trace table to bottom
        const container = document.getElementById("trace-container");
        container.scrollTop = container.scrollHeight;

        // Render Graph with active node and transition highlights
        let isAccepted = null;
        if (simulator.status === "ACCEPTED") isAccepted = true;
        if (simulator.status === "REJECTED") isAccepted = false;

        graph.render(simulator.currentState, simulator.lastActiveEdge, isAccepted);
    }

    function handleSimulationFinished() {
        if (simulator.status === "ACCEPTED") {
            elResultBanner.className = "status-banner status-accepted";
            elResultBanner.innerHTML = `🎉 STRING ACCEPTED<br><span style="font-size:0.8rem; font-weight:normal;">State "${simulator.currentState}" belongs to final states F</span>`;
        } else if (simulator.status === "REJECTED") {
            elResultBanner.className = "status-banner status-rejected";
            elResultBanner.innerHTML = `❌ STRING REJECTED<br><span style="font-size:0.8rem; font-weight:normal;">State "${simulator.currentState}" does not belong to final states F</span>`;
        }
        elResultBanner.style.display = "block";
    }

    function resetTraceTable() {
        elTraceTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-trace-msg">Click "Next Step" or "Run All" to simulate string execution.</td>
            </tr>
        `;
    }

    // 7. Event Listeners
    btnAddState.addEventListener("click", () => {
        const val = elInputNewState.value.trim();
        if (val) {
            const added = dfa.addState(val);
            if (added) {
                elInputNewState.value = "";
                refreshAllUI(true);
            } else {
                alert(`State "${val}" already exists or is invalid.`);
            }
        }
    });

    elInputNewState.addEventListener("keypress", (e) => {
        if (e.key === "Enter") btnAddState.click();
    });

    btnUpdateAlphabet.addEventListener("click", () => {
        const symbols = elInputAlphabet.value.split(",").map(s => s.trim()).filter(Boolean);
        if (symbols.length === 0) {
            alert("Alphabet must contain at least one symbol.");
            return;
        }
        dfa.setAlphabet(symbols);
        refreshAllUI(false);
    });

    elSelectInitialState.addEventListener("change", (e) => {
        dfa.setInitialState(e.target.value);
        refreshAllUI(false);
    });

    btnSaveTransition.addEventListener("click", () => {
        const from = elTransFrom.value;
        const sym = elTransSymbol.value;
        const to = elTransTo.value;

        if (from && sym && to) {
            dfa.setTransition(from, sym, to);
            refreshAllUI(false);
        }
    });

    btnAutoLayout.addEventListener("click", () => {
        dfa.autoLayout(svgElem.clientWidth || 540, svgElem.clientHeight || 320);
        graph.render();
    });

    btnValidateDFA.addEventListener("click", () => {
        validateDFA(true);
    });

    // Simulation controls
    btnInitSim.addEventListener("click", () => {
        initSimulation();
    });

    btnStep.addEventListener("click", () => {
        stepSimulation();
    });

    btnRunAll.addEventListener("click", () => {
        runAllSimulation();
    });

    btnResetSim.addEventListener("click", () => {
        resetSimulation();
    });

    // Presets
    btnPreset01.addEventListener("click", () => {
        dfa.loadEndsWith01Example();
        elInputString.value = "1101";
        resetSimulation();
        refreshAllUI(true);
    });

    btnPresetEven.addEventListener("click", () => {
        dfa.loadEvenZerosExample();
        elInputString.value = "10101";
        resetSimulation();
        refreshAllUI(true);
    });

    btnClearDFA.addEventListener("click", () => {
        if (confirm("Clear all states and transitions?")) {
            dfa.clear();
            dfa.setAlphabet(["0", "1"]);
            resetSimulation();
            refreshAllUI(false);
        }
    });

    // 8. Initial Load: Load "Ends with 01" by default for immediate preview!
    dfa.loadEndsWith01Example();
    refreshAllUI(true);
});
