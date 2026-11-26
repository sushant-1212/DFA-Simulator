const http = require("http");
const fs = require("fs");
const path = require("path");

// Load simple KEY=VALUE entries without requiring a dependency.
const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
    fs.readFileSync(envFile, "utf8").split(/\r?\n/).forEach(line => {
        const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
        if (match && !match[1].startsWith("#") && process.env[match[1]] === undefined) {
            process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
        }
    });
}

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MODEL = "llama-3.3-70b-versatile";

const promptFor = command => `Convert this natural-language request into a complete deterministic finite automaton.
Return ONLY valid JSON, with exactly this shape:
{"states":["q0"],"alphabet":["0","1"],"initialState":"q0","finalStates":[],"transitions":{"q0":{"0":"q0","1":"q0"}}}
Every state must have a destination for every alphabet symbol. Alphabet symbols must be single characters. Use concise state names.
Request: ${command}`;

function sendJson(res, status, body) {
    res.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
    res.end(JSON.stringify(body));
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => {
            data += chunk;
            if (data.length > 10000) reject(new Error("Request too large."));
        });
        req.on("end", () => resolve(data));
        req.on("error", reject);
    });
}

async function generateDfa(req, res) {
    if (!process.env.GROQ_API_KEY) return sendJson(res, 500, { error: "GROQ_API_KEY is not configured in .env." });
    let input;
    try { input = JSON.parse(await readBody(req)); } catch { return sendJson(res, 400, { error: "Invalid JSON request." }); }
    if (typeof input.command !== "string" || !input.command.trim()) return sendJson(res, 400, { error: "A DFA command is required." });

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: "user", content: promptFor(input.command.trim()) }],
                response_format: { type: "json_object" },
                temperature: 0.1
            })
        });
        const payload = await response.json();
        if (!response.ok) return sendJson(res, response.status, { error: payload.error?.message || "Groq request failed." });
        const text = payload.choices?.[0]?.message?.content || "";
        sendJson(res, 200, { text });
    } catch (error) {
        sendJson(res, 502, { error: `Groq connection failed: ${error.message}` });
    }
}

function serveFile(req, res) {
    const requested = decodeURIComponent(req.url.split("?")[0]);
    const relative = requested === "/" ? "index.html" : requested.replace(/^\//, "");
    const file = path.resolve(ROOT, relative);
    if (!file.startsWith(ROOT + path.sep)) return sendJson(res, 403, { error: "Forbidden." });
    fs.readFile(file, (error, data) => {
        if (error) return sendJson(res, 404, { error: "Not found." });
        const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
        res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
        res.end(data);
    });
}

http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/api/generate-dfa") return generateDfa(req, res);
    if (req.method === "GET") return serveFile(req, res);
    sendJson(res, 405, { error: "Method not allowed." });
}).listen(PORT, () => console.log(`DFA Simulator running at http://localhost:${PORT}`));
