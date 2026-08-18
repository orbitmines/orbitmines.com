/**
 * WHAT THE ARTICLE STILL ASSERTS ON ITS OWN AUTHORITY.
 *
 * The rule is that a number in the prose comes from a run. This finds where that is
 * not yet true — hardcoded figures, tables typed in from a terminal, and panels
 * still driven by an implementation other than DISCRETE.ts.
 *
 * It is not a linter and it does not fail a build. It produces the list, because the
 * list is the honest statement of how far the migration has got: a book that quotes
 * two hundred numbers and sources forty of them should say forty rather than imply
 * two hundred.
 *
 *   ts-node --compiler-options '{"module":"commonjs","target":"es2020"}' AUDIT.ts [path]
 */

import { readFileSync } from "fs";
import * as REPORT from "./REPORT.json";

const report = REPORT as unknown as { entries: { id: string; findings: { name: string }[] }[] };

const ARTICLE = process.argv[2] ?? `${__dirname}/../Physics.tsx`;
const src = readFileSync(ARTICLE, "utf8");
const lines = src.split("\n");

/** a figure: something that looks like a measured quantity rather than a constant */
const FIGURE = /(?<![\w.])[-−]?\d+\.\d+(?:[eE][-−+]?\d+)?(?![\w])|(?<![\w.])\d+(?:\.\d+)?[eE][-−+]?\d+/g;

/** numbers that are not measurements: dimensions, counts, CSS, years, rule names */
const STRUCTURAL = [
  /style=/, /padding|margin|fontSize|width|height|opacity|lineHeight|letterSpacing/,
  /^\s*(import|export)\b/, /#[0-9a-fA-F]{3,8}/, /\bG\+M\/[123]\b/, /\bG\/[12]′?\b/,
  /aspect=|index=|height=|\bkey=/,
];

type Hit = { line: number; text: string; figures: string[] };

const hits: Hit[] = [];
let inCode = false;
lines.forEach((raw, i) => {
  const t = raw.trim();
  if (STRUCTURAL.some(re => re.test(raw))) return;
  const figures = [...raw.matchAll(FIGURE)].map(m => m[0]);
  if (!figures.length) return;
  // a figure inside a <Recorded>/<M> reference is sourced by construction
  if (/<M\b|<Recorded\b|<Claim\b|<Verdict\b|<Ran\b/.test(raw)) return;
  hits.push({ line: i + 1, text: t.slice(0, 110), figures });
});

// ── which panels the article uses, and whether they are on the new core
const imports = [...src.matchAll(/import\s+\{([^}]+)\}\s+from\s+"([^"]+)"/g)]
  .map(m => ({ names: m[1].split(",").map(s => s.trim()), from: m[2] }));
const components = [...src.matchAll(/<([A-Z][A-Za-z0-9]*)\s*\/?>/g)].map(m => m[1]);
const used = [...new Set(components)];
const fromNewCore = new Set(
  imports.filter(i => i.from.includes("./Physics/")).flatMap(i => i.names));
const fromOld = new Set(
  imports.filter(i => i.from.includes("archive/")).flatMap(i => i.names));
const visuals = used.filter(c => fromNewCore.has(c) || fromOld.has(c));

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

console.log(`\n═════ ${ARTICLE.split("/").pop()} ═════\n`);
console.log(`  the report holds ${report.entries.length} entries and ` +
  `${report.entries.reduce((a, e) => a + e.findings.length, 0)} findings\n`);

console.log("═════ VISUALS ═════\n");
console.log(`  ${pad("component", 26)} source`);
console.log("  " + "─".repeat(60));
for (const v of visuals)
  console.log(`  ${pad(v, 26)} ${fromNewCore.has(v) ? "DISCRETE.ts ✓" : "archive — still on an older model"}`);
const stale = visuals.filter(v => fromOld.has(v));
console.log(`\n  ${visuals.length - stale.length} of ${visuals.length} on the new core.`);

console.log("\n═════ FIGURES NOT SOURCED FROM A RUN ═════\n");
const byBlock = new Map<string, Hit[]>();
for (const h of hits) {
  // group by the nearest <Section head="…"> or <Head> above
  let head = "(top)";
  for (let j = h.line - 1; j >= 0; j--) {
    const m = lines[j].match(/<Section head="([^"]+)"|<Head>([^<]+)<\/Head>/);
    if (m) { head = (m[1] ?? m[2]).trim(); break; }
  }
  (byBlock.get(head) ?? byBlock.set(head, []).get(head)!).push(h);
}
const blocks = [...byBlock.entries()].sort((a, b) => b[1].length - a[1].length);
for (const [head, hs] of blocks.slice(0, 20))
  console.log(`  ${pad(String(hs.length), 5)} ${head}`);
console.log(`\n  ${hits.length} lines carry a figure the report does not back, ` +
  `across ${byBlock.size} sections.`);
console.log(`  ${report.entries.length} claims are sourced; every other number in the prose is ` +
  `still\n  asserted on the article's own authority, and that is what this list is.`);
