/**
 * THE RUNNER — every migrated claim, against every theory it can be asked of, into
 * one report the article reads.
 *
 *   ts-node --compiler-options '{"module":"commonjs","target":"es2020"}' RUN.ts [filter…]
 *
 * With no arguments it runs everything and writes REPORT.json beside this file.
 * With arguments it runs the claims whose id contains one of them, which is how a
 * single result gets re-checked without waiting for the suite.
 *
 *   --quick / --normal / --full    how big a run (default: full, which is what a
 *                                  published number has to be measured at)
 *   --jobs N                       how many processes (default: one per core, capped
 *                                  at the number of units there are to run)
 *
 * WHY PROCESSES AND NOT THREADS. Measuring a claim is a tight numeric loop over typed
 * arrays with no I/O in it, so it pins one core and nothing about it yields. Workers
 * would do as well, but every test reaches DISCRETE's module state through ordinary
 * imports and a process gets its own copy of that for free.
 */

import { readFileSync, writeFileSync } from "fs";
import { fork } from "child_process";
import { cpus } from "os";
import { runSuite, matrix, setBudget, currentBudget, Budget, Outcome } from "./SUITE";
import { THEORIES, Report, Entry } from "./DISCRETE";
import electrostatics from "./tests/electrostatics";
import magnetostatics from "./tests/magnetostatics";
import gravity from "./tests/gravity";
import geometry from "./tests/geometry";
import vacuum from "./tests/vacuum";
import meeting from "./tests/meeting";
import layer2 from "./tests/layer2";
import propulsion from "./tests/propulsion";
import magnetism from "./tests/magnetism";
import ordering from "./tests/ordering";
import magneticLaws from "./tests/magnetic-laws";
import kernel from "./tests/kernel";
import metric from "./tests/metric";
import rotation from "./tests/rotation";
import transportPremise from "./tests/transport";
import suppression from "./tests/suppression";
import rar from "./tests/rar";
import sparc from "./tests/sparc";
import eht from "./tests/eht";
import ring from "./tests/ring";
import latticeStep from "./tests/step";
import discs from "./tests/discs";
import moments from "./tests/moments";
import wander from "./tests/wander";
import cosmology from "./tests/cosmology";
import matter from "./tests/matter";
import induction from "./tests/induction";

const ALL = [...geometry, ...layer2, ...meeting, ...vacuum, ...gravity, ...electrostatics, ...magnetostatics, ...induction, ...propulsion, ...magnetism, ...ordering, ...kernel, ...metric, ...rotation, ...transportPremise, ...suppression, ...rar, ...sparc, ...eht, ...ring, ...latticeStep, ...discs, ...moments, ...wander, ...magneticLaws, ...cosmology, ...matter];

/** the theories by the names the tests declare expectations under */
const BY_NAME = Object.fromEntries(Object.values(THEORIES).map(t => [t.name, t]));

/** `--flag value`, for the ones that take one */
const valueOf = (args: string[], flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

type Partial = { entries: Entry[]; outcomes: Outcome[] };

/**
 * ONE WORKER'S SHARE. It runs quietly and hands back what it measured — progress goes
 * over IPC as each unit lands rather than to stdout, because a dozen processes each
 * writing a half-line and then finishing it later interleaves into nonsense.
 */
const runShard = async (
  args: string[], only: string[], shard: { index: number; total: number },
) => {
  const { report, outcomes } = await runSuite(ALL, BY_NAME, {
    title: "@orbitmines/physics", only, quiet: true, shard,
    onUnit: u => process.send?.({ kind: "unit", ...u }),
  });
  process.send?.({ kind: "done", entries: report.entries, outcomes } satisfies
    { kind: string } & Partial);
};

(async () => {
  const args = process.argv.slice(2);
  const tier: Budget = args.includes("--quick") ? "quick"
    : args.includes("--normal") ? "normal" : "full";
  setBudget(tier);
  const only = args.filter(a => !a.startsWith("--") && !/^\d+$/.test(a) &&
    args[args.indexOf(a) - 1] !== "--jobs" && args[args.indexOf(a) - 1] !== "--shard");

  /* a worker: measure this slice and hand it back, printing nothing */
  const shardArg = valueOf(args, "--shard");
  if (shardArg) {
    const [index, total] = shardArg.split("/").map(Number);
    await runShard(args, only, { index, total });
    return;
  }

  const units = ALL.filter(t => !only.length || only.some(k => t.id.includes(k)))
    .reduce((n, t) => n + Object.keys(t.under).length, 0);
  const jobs = Math.max(1, Math.min(
    Number(valueOf(args, "--jobs") ?? cpus().length), units));

  console.log(`\n═════ ${only.length ? `running ${only.join(", ")}` : "running everything"}` +
    ` · ${currentBudget()} · ${units} unit${units === 1 ? "" : "s"}` +
    `${jobs > 1 ? ` across ${jobs} processes` : ""} ═════\n`);

  /*
   * FORKED, AND THE RESULTS PUT BACK IN A FIXED ORDER.
   *
   * Workers finish in whatever order their slices happen to take, so the entries and
   * outcomes come back shuffled. The report is sorted by id before anything reads it
   * — otherwise the same suite run twice produces two different REPORT.json files and
   * every diff is noise.
   */
  const collected: Partial = { entries: [], outcomes: [] };
  if (jobs > 1) {
    let done = 0;
    await Promise.all(Array.from({ length: jobs }, (_, i) => new Promise<void>((res, rej) => {
      const child = fork(__filename, [...args, "--shard", `${i}/${jobs}`], {
        execArgv: ["-r", "ts-node/register"],
        env: {
          ...process.env,
          TS_NODE_COMPILER_OPTIONS: JSON.stringify({ module: "commonjs", target: "es2020" }),
        },
        stdio: ["ignore", "inherit", "inherit", "ipc"],
      });
      child.on("message", (m: any) => {
        if (m.kind === "unit")
          console.log(`  [${++done}/${units}] ${m.id} · ${m.theory} … ` +
            `${m.seconds.toFixed(1)}s  ${m.status}`);
        else if (m.kind === "done") {
          collected.entries.push(...m.entries);
          collected.outcomes.push(...m.outcomes);
        }
      });
      child.on("error", rej);
      child.on("exit", c => c === 0 ? res() : rej(new Error(`worker ${i} exited ${c}`)));
    })));
  } else {
    const r = await runSuite(ALL, BY_NAME, { title: "@orbitmines/physics", only });
    collected.entries.push(...r.report.entries);
    collected.outcomes.push(...r.outcomes);
  }

  const report = new Report("@orbitmines/physics");
  report.entries = collected.entries.sort((a, b) => a.id.localeCompare(b.id));
  const outcomes = collected.outcomes.sort((a, b) =>
    a.id.localeCompare(b.id) || a.theory.localeCompare(b.theory));

  await report.write(json => {
    /*
     * MERGE, DO NOT OVERWRITE.
     *
     * Running a filter — `RUN.ts coulomb` to re-check one claim — used to write a
     * report containing only that claim, and every other figure in the article
     * turned into NOT IN THE REPORT until the whole suite was run again. A filtered
     * re-check is the normal way to work, so it has to leave everything it did not
     * re-run alone: entries are keyed by id, and only the ones just measured are
     * replaced.
     */
      const path = `${__dirname}/REPORT.json`;
      const fresh = JSON.parse(json) as { entries: { id: string }[] };
      let merged = fresh;
      try {
        const prior = JSON.parse(readFileSync(path, "utf8")) as typeof fresh;
        const ids = new Set(fresh.entries.map(e => e.id));
        merged = {
          ...fresh,
          entries: [...prior.entries.filter(e => !ids.has(e.id)), ...fresh.entries]
            .sort((a, b) => a.id.localeCompare(b.id)),
        };
      } catch { /* no prior report, or it is unreadable: this run is the report */ }
      writeFileSync(path, JSON.stringify(merged, null, 2));
      const kept = merged.entries.length - fresh.entries.length;
      if (kept > 0) console.log(`\n  ${fresh.entries.length} entries written, ${kept} kept from earlier runs`);
  });
  report.print();

  const m = matrix(outcomes);
  console.log(`\n═════ what holds where ═════\n`);
  const w = Math.max(...m.rows.map(r => String(r[0]).length)) + 2;
  console.log("  " + "".padEnd(w) + m.columns.slice(1).map(c => c.padEnd(20)).join(""));
  for (const r of m.rows)
    console.log("  " + String(r[0]).padEnd(w) + r.slice(1).map(c => String(c).padEnd(20)).join(""));

  const wrong = outcomes.filter(o => !o.asDeclared);
  const soft = outcomes.filter(o => o.provisional);
  console.log(`\n═════ ${wrong.length} claim${wrong.length === 1 ? "" : "s"} did not do what was declared ═════`);
  for (const o of wrong) {
    console.log(`  ${o.id} · ${o.theory}: declared "${o.declared}"`);
    for (const f of o.outside)
      console.log(`      ${f.name}: ` +
        `${Number.isFinite(f.value) ? f.value.toExponential(3) : "—"} ` +
        `${f.verdict} by ${(100 * (f.by ?? 0)).toFixed(1)}%`);
  }
  if (soft.length) {
    console.log(`\n  and ${soft.length} unresolved at this budget — re-run without --quick before` +
      ` reading anything into them:`);
    for (const o of soft)
      console.log(`      ${o.id} · ${o.theory}: ${o.outside.map(f => f.name).join(", ")}`);
  }
  console.log(`\nwritten to REPORT.json\n`);
})();
