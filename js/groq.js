/** Groq-powered natural-language DFA generation. */
class GroqDFA {
    static async generate(command) {
        const response = await fetch("/api/generate-dfa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command })
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Backend request failed.");
        const definition = JSON.parse(payload.text || "{}");
        GroqDFA.validate(definition);
        return definition;
    }

    static validate(dfa) {
        if (!Array.isArray(dfa.states) || !dfa.states.length || !Array.isArray(dfa.alphabet) || !dfa.alphabet.length ||
            typeof dfa.initialState !== "string" || !Array.isArray(dfa.finalStates) || !dfa.transitions ||
            !dfa.states.includes(dfa.initialState)) throw new Error("Groq returned an incomplete DFA definition.");
        if (dfa.alphabet.some(symbol => typeof symbol !== "string" || [...symbol].length !== 1)) {
            throw new Error("Groq returned an alphabet containing multi-character symbols.");
        }
        for (const state of dfa.states) {
            if (!dfa.transitions[state]) throw new Error(`Missing transitions for ${state}.`);
            for (const symbol of dfa.alphabet) {
                if (!dfa.states.includes(dfa.transitions[state][symbol])) {
                    throw new Error(`Invalid transition from ${state} on ${symbol}.`);
                }
            }
        }
    }
}
window.GroqDFA = GroqDFA;
