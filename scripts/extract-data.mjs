// One-off extractor: pulls FD_SKUS and FD_ASSORTMENT array literals out of the
// legacy HTML and writes them as ES module data files. Run with `node`.
import fs from "node:fs";
import path from "node:path";

const SRC = "Old File/fd-assortment-v4-2.html";
const html = fs.readFileSync(SRC, "utf8");

function extractArray(varName) {
  const marker = `var ${varName}=[`;
  const start = html.indexOf(marker);
  if (start === -1) throw new Error(`${varName} not found`);
  const arrStart = start + marker.length - 1; // position of '['
  // Walk forward to the matching closing bracket, respecting strings.
  let depth = 0;
  let inStr = false;
  let strCh = "";
  let i = arrStart;
  for (; i < html.length; i++) {
    const ch = html[i];
    if (inStr) {
      if (ch === "\\") { i++; continue; }
      if (ch === strCh) inStr = false;
      continue;
    }
    if (ch === '"' || ch === "'") { inStr = true; strCh = ch; continue; }
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  const literal = html.slice(arrStart, i);
  return JSON.parse(literal); // arrays use valid JSON
}

const skus = extractArray("FD_SKUS");
const assortment = extractArray("FD_ASSORTMENT");

const outDir = "src/data";
fs.mkdirSync(outDir, { recursive: true });

const header = (name, desc) =>
  `/*\n * ${name} — ${desc}\n * Ported verbatim from the legacy fd-assortment-v4-2.html seed data.\n */\n`;

fs.writeFileSync(
  path.join(outDir, "skus.js"),
  header("FD_SKUS", `Product catalogue attributes (${skus.length} SKUs).`) +
    `export const FD_SKUS = ${JSON.stringify(skus, null, 2)};\n`
);

fs.writeFileSync(
  path.join(outDir, "assortment.js"),
  header("FD_ASSORTMENT", `Per-store assortment + R13 performance records (${assortment.length} rows).`) +
    `export const FD_ASSORTMENT = ${JSON.stringify(assortment, null, 2)};\n`
);

console.log(`FD_SKUS: ${skus.length} rows`);
console.log(`FD_ASSORTMENT: ${assortment.length} rows`);
