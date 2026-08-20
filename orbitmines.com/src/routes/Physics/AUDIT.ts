/**
 * THE LEDGER — which test leads to which result, checked rather than believed.
 *
 * The rule is that a number in the prose comes from a run. This is the accounting for
 * that rule, and it answers four questions the article cannot answer about itself:
 *
 *   RESOLVE      every <M of=… is=…>, <Recorded of=…>, <Claim>, <Verdict> and <Ran> in
 *                the article names an entry and a finding in REPORT.json. One that does
 *                not is a citation pointing at nothing — the article renders it as a
 *                visible complaint, and this finds it before a reader does.
 *
 *   BACK         every entry in the report is reached by at least one citation. An
 *                entry nothing cites is a measurement nobody is using, which is not an
 *                error but is worth knowing: either the prose that wanted it was never
 *                written, or it was and now quotes something else.
 *
 *   ORPHAN       entries in the report that NO TEST PRODUCES any more. The runner merges
 *                rather than overwrites, so an entry whose test was renamed, or whose
 *                theory was dropped from `under`, stays in the file for ever — and
 *                because a citation resolves by PREFIX, a stale `id · gravity` shadows
 *                the live `id · gravity+magnetism` and the article silently quotes the
 *                dead one. That has happened; this is the check for it.
 *
 *   CITE         every test's `cited` list names a heading that exists in the article.
 *                `cited` is how a test says what it touches, so a stale entry there is
 *                a test that thinks it is load-bearing and is not.
 *
 *   OWE          numbers not yet measured by a claim in `tests/` — empty since the
 *                provenance folder was retired, and kept to catch a regression
 *                it came from. THIS IS THE DEBT and it is the whole reason the folder
 *                still exists: 165 <Eq note>s once carried a NOT YET RE-MEASURED mark,
 *                and the folder cannot go until the last of them is settled.
 *
 *   RETIRED      the ones that will NOT be re-measured, each with its reason in the note
 *                itself. Not every citation is a debt: some name a DICTIONARY or a pair
 *                of equations with no measurement in them, and some quote a number the
 *                article ITSELF goes on to correct, where re-running it would dignify a
 *                figure the prose has already withdrawn. Retiring one is a judgement and
 *                it is recorded rather than hidden, which is the difference between this
 *                and quietly deleting the marker.
 *
 * And then the older audit it grew out of: figures in the prose that no citation backs,
 * which is the same rule read at the level of a digit rather than a claim.
 *
 * It is not a linter and it does not fail a build. It produces the list, because the
 * list is the honest statement of how far the migration has got.
 *
 *   ts-node --compiler-options '{"module":"commonjs","target":"es2020"}' AUDIT.ts [path]
 */

import { readFileSync, readdirSync } from "fs";
import * as REPORT from "./REPORT.json";
import { Test } from "./SUITE";

const report = REPORT as unknown as {
  entries: {
    id: string;
    header: { N: number; ticks: number; fill: number; seeds: unknown[]; theory: string };
    findings: { name: string; value?: unknown; verdict?: string }[];
    table?: unknown;
  }[];
};

const ARTICLE = process.argv[2] ?? `${__dirname}/../Physics.tsx`;
const src = readFileSync(ARTICLE, "utf8");
const lines = src.split("\n");

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const plural = (n: number, one: string, many = one + "s") => `${n} ${n === 1 ? one : many}`;

/**
 * The entry a citation names, by the same rule `FIGURES.tsx` resolves it with — exact
 * id first, then the first entry whose id STARTS WITH it, which is how the article
 * writes `gravity/inverse-square` and reaches `gravity/inverse-square · gravity`.
 *
 * Kept identical to the article's own lookup on purpose. An audit that resolved
 * citations more generously than the renderer would pass on pages that break.
 */
/** an entry that only records that the claim could not be asked — no measurement in it */
const notApplicableEntry = (e: { findings: { value?: unknown }[] }) =>
  e.findings.length > 0 && e.findings.every(f => f.value === null || f.value === undefined);

const entryOf = (id: string) =>
  report.entries.find(e => e.id === id)
  /* the same ordering `entryOf` uses: a "not applicable" stub must not shadow a live run */
  ?? report.entries.find(e => e.id.startsWith(id) && !notApplicableEntry(e))
  ?? report.entries.find(e => e.id.startsWith(id));

// ─── the citations the article makes ────────────────────────────────────────

type Citation = { line: number; kind: string; of: string; is?: string };

const citations: Citation[] = [];
lines.forEach((raw, i) => {
  for (const m of raw.matchAll(/<(M|Recorded|Claim|Verdict|Ran)\b([^>]*)>/g)) {
    const of = m[2].match(/\bof="([^"]*)"/)?.[1];
    const is = m[2].match(/\bis="([^"]*)"/)?.[1];
    if (of) citations.push({ line: i + 1, kind: m[1], of, is });
  }
});

const unresolved = citations.filter(c => {
  const e = entryOf(c.of);
  if (!e) return true;
  if (c.kind === "M" || c.kind === "Verdict") return !e.findings.some(f => f.name === c.is);
  if (c.kind === "Recorded") return !e.table;
  return false;
});

const reached = new Set(citations.map(c => entryOf(c.of)?.id).filter(Boolean) as string[]);
const unreached = report.entries.map(e => e.id).filter(id => !reached.has(id));

// ─── what the tests say they are cited by ───────────────────────────────────

/**
 * Loaded by requiring every module under `tests/`, because `cited` is a field on the
 * test object and there is no way to read it that does not run the file. They are pure
 * declarations at module scope — the measurement happens inside `run` — so this costs
 * nothing beyond the imports.
 */
const tests: Test[] = readdirSync(`${__dirname}/tests`)
  .filter(f => f.endsWith(".ts"))
  .flatMap(f => {
    const m = require(`./tests/${f.replace(/\.ts$/, "")}`);
    return (m.default ?? []) as Test[];
  });

/**
 * Every anchor in the article a test can say it is quoted by — the section heads, the
 * sub-heads, and the `note` on an <Eq>, since a note is what a displayed line is called
 * and several tests were written naming one.
 */
const anchors = new Set<string>();
for (const raw of lines) {
  for (const m of raw.matchAll(/<Section head="([^"]+)"|<Head>([^<]+)<\/Head>|note="([^"]+)"/g))
    anchors.add((m[1] ?? m[2] ?? m[3]).trim());
}

/**
 * A `cited` entry names an anchor, sometimes qualified by its section as
 * `Section — heading`.
 *
 * THE WHOLE STRING IS TRIED FIRST, and that is not a nicety: several of this article's
 * own headings contain an em dash, so splitting on one before looking reported four
 * live headings as stale — the audit inventing debt rather than finding it.
 */
const findsAnchor = (cited: string) =>
  anchors.has(cited.trim()) ||
  cited.split(" — ").map(s => s.trim()).some(p => anchors.has(p));

/**
 * The ids the suite can actually produce — `id · theory` for every theory a test declares,
 * INCLUDING the ones it declares unaskable, because the suite writes a "not applicable"
 * stub for each of those and those stubs are not orphans.
 *
 * A first version of this filtered `under` down to the askable theories, which flagged
 * every legitimate stub as stale. The shadowing problem that motivated it is real but it
 * is not here: a citation resolves by PREFIX, so a bare `of="…"` could land on a stub and
 * lose the live run beneath it. That is fixed where it belongs, in `entryOf` — which now
 * orders the stubs last — and the check below is what catches a stub that has outlived
 * the declaration that produced it.
 */
const producible = new Set(tests.flatMap(t =>
  Object.keys(t.under).map(theory => `${t.id} · ${theory}`)));
const orphans = report.entries.map(e => e.id).filter(id => !producible.has(id));

const staleCitations = tests.flatMap(t =>
  (t.cited ?? []).filter(c => !findsAnchor(c)).map(c => ({ id: t.id, cited: c })));
const uncited = tests.filter(t => !t.cited?.length);

// ─── what is still owed to the retired provenance folder ────────────────────

type Debt = { line: number; file: string; note: string; why?: string };

/**
 * The two marks, and the difference between them is a judgement rather than a stage.
 *
 *   NOT YET RE-MEASURED   owed. A number the article quotes from a cubic-26 run.
 *   NOT RE-MEASURED —     retired, with the reason following the dash. Something that
 *                         will not be ported because porting it would not be useful.
 *
 * OWE IS NOW EMPTY AND `todo/provenance/` IS DELETED, which is what it was counting down
 * to. The check stays for two reasons: it is what would catch a marker reintroduced by a
 * later edit, and RETIRED is not a countdown — it is a standing list of the judgement calls
 * this article rests on, each with the reason at the line that carries it.
 */
const OWED = "NOT YET RE-MEASURED on DISCRETE.ts";
const RETIRED = /NOT RE-MEASURED — ([^"·]+)/;

const debts: Debt[] = [];
const retired: Debt[] = [];
lines.forEach((raw, i) => {
  const note = raw.match(/note="([^"]*)"/)?.[1];
  if (!note) return;                       // the header comment, which describes the mark
  const file = note.match(/^([a-z0-9_]+\.ts)/)?.[1] ?? "(unnamed)";
  if (note.includes(OWED)) debts.push({ line: i + 1, file, note });
  else {
    const m = note.match(RETIRED);
    if (m) retired.push({ line: i + 1, file, note, why: m[1].trim() });
  }
});

const byFile = new Map<string, Debt[]>();
for (const d of debts) (byFile.get(d.file) ?? byFile.set(d.file, []).get(d.file)!).push(d);

const retiredBy = new Map<string, Debt[]>();
for (const d of retired)
  (retiredBy.get(d.why!) ?? retiredBy.set(d.why!, []).get(d.why!)!).push(d);

// ─── figures in the prose that nothing backs ────────────────────────────────

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
lines.forEach((raw, i) => {
  if (STRUCTURAL.some(re => re.test(raw))) return;
  const figures = [...raw.matchAll(FIGURE)].map(m => m[0]);
  if (!figures.length) return;
  if (/<M\b|<Recorded\b|<Claim\b|<Verdict\b|<Ran\b/.test(raw)) return;
  hits.push({ line: i + 1, text: raw.trim().slice(0, 110), figures });
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

// ─── the report ─────────────────────────────────────────────────────────────

console.log(`\n═════ ${ARTICLE.split("/").pop()} ═════\n`);
console.log(`  the report holds ${report.entries.length} entries and ` +
  `${report.entries.reduce((a, e) => a + e.findings.length, 0)} findings, ` +
  `measured by ${tests.length} tests\n`);

console.log("═════ RESOLVE — citations against the report ═════\n");
console.log(`  ${plural(citations.length, "citation")} in the article, ` +
  `${unresolved.length} of which resolve to nothing.`);
for (const c of unresolved)
  console.log(`    ${ARTICLE.split("/").pop()}:${c.line}  <${c.kind} of="${c.of}"` +
    `${c.is ? ` is="${c.is}"` : ""}>`);

console.log("\n═════ BACK — entries nothing cites ═════\n");
console.log(`  ${reached.size} of ${report.entries.length} entries are reached by a citation.`);
for (const id of unreached) console.log(`    ${id}`);

console.log("\n═════ ORPHAN — entries no test produces any more ═════\n");
if (!orphans.length) console.log("  none: every entry has a test behind it.");
else {
  console.log(`  ${plural(orphans.length, "entry", "entries")} left over from a renamed test ` +
    `or a dropped theory.\n  A citation resolves by PREFIX, so these can shadow a live ` +
    `entry — delete them from REPORT.json:`);
  for (const id of orphans) console.log(`    ${id}`);
}

/*
 * MISSING — the reverse of ORPHAN, and it had no check at all.
 *
 * ORPHAN catches an entry with no test behind it. Nothing caught a TEST WITH NO ENTRY,
 * which is what a filtered run leaves when a `--jobs` worker dies or a declaration is
 * added and not re-run — and the article does not complain about it, because a citation
 * that resolves by prefix quietly lands on some other theory's entry instead.
 */
const missing = [...producible].filter(id => !report.entries.some(e => e.id === id));

/*
 * PROVENANCE — a header that is not the box the numbers came from.
 *
 * `<Ran>` prints the header as the label a result owes: geometry, theory, occupancy, box,
 * ticks, seeds. Fifty-three tests build a SECOND world purely to have something to hand
 * `headerOf`, and where that world is never ticked the label reads "N 5 · 0 ticks · fill
 * 0.000" under a number measured at N = 41 over 240 ticks. For an `exact` test there is no
 * box and the stub is honest. For anything else it is a false label, and it is how
 * `gravity/inverse-square` came to report an empty vacuum for a run that had one.
 */
const exactness = new Map(tests.map(t => [t.id, !!t.exact]));
const measured = (e: { findings: { value?: unknown }[] }) =>
  e.findings.some(f => typeof f.value === "number" && isFinite(f.value as number));
const falseHeaders = report.entries.filter(e => {
  const t = e.id.split(" \u00b7 ")[0];
  return !exactness.get(t) && e.header && e.header.ticks === 0 && measured(e);
});

console.log("\n═════ MISSING — declarations with no entry in the report ═════\n");
if (!missing.length) console.log("  none: every (claim \u00d7 theory) the tests declare is in the report.");
else {
  console.log(`  ${plural(missing.length, "unit")} the suite would produce and the report does ` +
    `not hold.\n  A citation resolves by PREFIX, so a missing entry does not complain — it ` +
    `lands on a\n  neighbouring theory instead. Re-run without a filter:`);
  for (const id of missing) console.log(`    ${id}`);
}

console.log("\n═════ PROVENANCE — headers that are not the run ═════\n");
if (!falseHeaders.length) console.log("  none: every measured entry carries the box it was measured in.");
else {
  console.log(`  ${plural(falseHeaders.length, "entry", "entries")} carry measurements under a ` +
    `header of 0 ticks, which cannot be\n  where the measurement happened. The test is not ` +
    "`exact`, so there WAS a box; the\n  header is a second world built to have something to " +
    "label with:");
  for (const e of falseHeaders)
    console.log(`    ${pad(e.id, 52)} N ${e.header.N}, ${e.header.seeds?.length ?? 0} seeds`);
}

console.log("\n═════ CITE — what the tests say they are quoted by ═════\n");
if (staleCitations.length) {
  console.log(`  ${plural(staleCitations.length, "stale `cited` entry")} — no such heading:`);
  for (const s of staleCitations) console.log(`    ${pad(s.id, 34)} ${s.cited}`);
} else console.log("  every `cited` entry names a heading that exists.");
if (uncited.length) {
  console.log(`\n  and ${plural(uncited.length, "test")} declare no \`cited\` at all:`);
  for (const t of uncited) console.log(`    ${t.id}`);
}

console.log("\n═════ OWE — numbers not yet measured by a claim in tests/ ═════\n");
if (!debts.length) {
  console.log("  NOTHING. Every <Eq note> points at a claim in `tests/`;\n" +
    "  `todo/provenance/` has been deleted.");
} else {
  console.log(`  ${pad("file", 18)} markers   article lines`);
  console.log("  " + "─".repeat(64));
  for (const [file, ds] of [...byFile.entries()].sort((a, b) => b[1].length - a[1].length))
    console.log(`  ${pad(file, 18)} ${pad(String(ds.length), 9)} ` +
      ds.map(d => d.line).join(", ").slice(0, 60));
  console.log(`\n  ${plural(debts.length, "marker")} across ${plural(byFile.size, "file")}. ` +
    `Each is a number the article quotes\n  from a run that was made on cubic 26 against a ` +
    `different reading of the rules.`);
}

console.log("\n═════ RETIRED — what will NOT be re-measured, and why ═════\n");
if (!retired.length) console.log("  nothing retired.");
else {
  for (const [why, ds] of [...retiredBy.entries()].sort((a, b) => b[1].length - a[1].length))
    console.log(`  ${pad(String(ds.length), 5)} ${why}\n        ` +
      ds.map(d => `${d.file}:${d.line}`).join(", "));
  console.log(`\n  ${plural(retired.length, "citation")} settled by judgement rather than ` +
    `by measurement.`);
}

console.log("\n═════ VISUALS ═════\n");
const stale = visuals.filter(v => fromOld.has(v));
for (const v of stale) console.log(`  ${pad(v, 26)} archive — still on an older model`);
console.log(`  ${visuals.length - stale.length} of ${visuals.length} on the new core.`);

console.log("\n═════ FIGURES NOT SOURCED FROM A RUN ═════\n");
const byBlock = new Map<string, Hit[]>();
for (const h of hits) {
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
console.log(`\n  ${hits.length} lines carry a figure no citation backs, ` +
  `across ${byBlock.size} sections.`);
