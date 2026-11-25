/**
 * Exhaustive cross-check of the simulator against independent reference predicates.
 * Run from the repository root:  node TestCases/exhaustive_check.js
 * For every binary string w with 0 <= |w| <= MAXLEN it compares DFASimulator's verdict
 * with (a) /01$/ for the "ends with 01" preset and (b) (#zeros mod 2 == 0) for the "even zeros" preset.
 */
const fs = require("fs");
const path = require("path");
global.window = {};
eval(fs.readFileSync(path.join(__dirname, "..", "js", "dfa.js"), "utf8"));
eval(fs.readFileSync(path.join(__dirname, "..", "js", "validator.js"), "utf8"));
eval(fs.readFileSync(path.join(__dirname, "..", "js", "simulator.js"), "utf8"));
// Module-level bindings so the eval'd classes can resolve each other (same technique as test_suite.js)
const DFAValidator = window.DFAValidator;
const MAXLEN = 12;
const cases = [
    { name: "ends-with-01", load: "loadEndsWith01Example", ref: w => /01$/.test(w) },
    { name: "even-zeros",   load: "loadEvenZerosExample",   ref: w => (w.split("0").length - 1) % 2 === 0 }
];
let allOk = true;
for (const c of cases) {
    const dfa = new window.DFA();
    dfa[c.load]();
    let total = 0, mismatches = 0;
    for (let len = 0; len <= MAXLEN; len++) {
        for (let n = 0; n < (1 << len); n++) {
            const w = len === 0 ? "" : n.toString(2).padStart(len, "0");
            const sim = new window.DFASimulator(dfa);
            sim.init(w);
            sim.runAll();
            const got = sim.status === "ACCEPTED";
            total++;
            if (got !== c.ref(w)) { mismatches++; if (mismatches <= 5) console.log("MISMATCH", c.name, JSON.stringify(w)); }
        }
    }
    console.log(`${c.name}: ${total} strings (|w| <= ${MAXLEN}), mismatches = ${mismatches}`);
    if (mismatches) allOk = false;
}
console.log(allOk ? "RESULT: all verdicts agree with the reference predicates" : "RESULT: MISMATCHES FOUND");
process.exit(allOk ? 0 : 1);
