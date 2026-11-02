const fs = require("fs");

global.window = {};
eval(fs.readFileSync("C:/Users/Hp/.gemini/antigravity/scratch/DFA-Simulator/js/dfa.js", "utf8"));
eval(fs.readFileSync("C:/Users/Hp/.gemini/antigravity/scratch/DFA-Simulator/js/validator.js", "utf8"));
eval(fs.readFileSync("C:/Users/Hp/.gemini/antigravity/scratch/DFA-Simulator/js/simulator.js", "utf8"));

const DFA = window.DFA;
const DFAValidator = window.DFAValidator;
const DFASimulator = window.DFASimulator;

const dfa = new DFA();
dfa.loadEndsWith01Example();

console.log("Validating ends-with-01 DFA:", DFAValidator.validate(dfa).isValid ? "VALID" : "INVALID");

const tests = [
  { input: "1101", expected: "ACCEPTED" },
  { input: "1010", expected: "REJECTED" },
  { input: "01", expected: "ACCEPTED" },
  { input: "1111", expected: "REJECTED" },
  { input: "0001", expected: "ACCEPTED" },
  { input: "", expected: "REJECTED" },
  { input: "1021", expected: "ERROR" },
  { input: "101", expected: "ACCEPTED" }
];

tests.forEach((t, i) => {
  const sim = new DFASimulator(dfa);
  const initRes = sim.init(t.input);
  let status = sim.status;
  if (initRes.success && !initRes.finished) {
    sim.runAll();
    status = sim.status;
  }
  const pass = (status === t.expected);
  console.log(`Test ${i + 1}: w="${t.input}" -> Status: ${status} | Expected: ${t.expected} -> ${pass ? "PASS ✅" : "FAIL ❌"}`);
});
