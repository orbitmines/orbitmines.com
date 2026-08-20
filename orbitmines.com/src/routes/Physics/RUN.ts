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
import binding from "./tests/binding";
import spin from "./tests/spin";
import structures from "./tests/structures";
import topology from "./tests/topology";
import emission from "./tests/emission";
import species from "./tests/species";
import chirality from "./tests/chirality";
import coherence from "./tests/coherence";
import dilation from "./tests/dilation";
import automatonTests from "./tests/automaton";
import medium from "./tests/medium";
import ceiling from "./tests/ceiling";
import neel from "./tests/neel";
import benchmark from "./tests/benchmark";
import anisotropy from "./tests/anisotropy";
import exchange from "./tests/exchange";
import lorentz from "./tests/lorentz";
import turn from "./tests/turn";
import current from "./tests/current";
import relaxation from "./tests/relaxation";
import driftTests from "./tests/drift";
import harmonyTests from "./tests/harmony";
import sourcing from "./tests/sourcing";
import strand from "./tests/strand";
import layerPair from "./tests/layers";
import acting from "./tests/acting";
import radiation from "./tests/radiation";
import potentials from "./tests/potentials";
import poles from "./tests/poles";
import textureTests from "./tests/texture";
import blochTests from "./tests/bloch";
import continuity from "./tests/continuity";
import rangeTests from "./tests/range";
import ampereForce from "./tests/ampere";
import conserving from "./tests/conserving";

const ALL = [...geometry, ...layer2, ...meeting, ...vacuum, ...gravity, ...electrostatics, ...magnetostatics, ...induction, ...propulsion, ...magnetism, ...ordering, ...kernel, ...metric, ...rotation, ...transportPremise, ...suppression, ...rar, ...sparc, ...eht, ...ring, ...latticeStep, ...discs, ...moments, ...wander, ...magneticLaws, ...cosmology, ...matter, ...binding, ...spin, ...structures, ...topology, ...emission, ...species, ...chirality, ...coherence, ...dilation, ...automatonTests, ...medium, ...ceiling, ...neel, ...benchmark, ...anisotropy, ...exchange, ...lorentz, ...turn, ...current, ...relaxation, ...driftTests, ...harmonyTests, ...strand, ...layerPair, ...sourcing, ...acting, ...radiation, ...potentials, ...poles, ...textureTests, ...blochTests, ...continuity, ...rangeTests, ...ampereForce, ...conserving];

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
  args: string[], only: string[], shard?: { index: number; total: number },
) => {
  /*
   * ASKING FOR WORK RATHER THAN BEING GIVEN A SLICE.
   *
   * With a fixed slice the wall clock is decided by whichever worker happened to draw
   * the two longest units — measured on this suite: eleven processes idle while two
   * ground through the last quarter of it. A worker that asks for the next unit when
   * it is free cannot straggle for that reason, and no cost model has to be kept up
   * to date. `--shard` is still honoured so a single process can be pointed at a
   * slice by hand.
   */
  let waiting: ((i: number | null) => void) | undefined;
  if (!shard) process.on("message", (m: any) => {
    if (m?.kind === "unit") { const f = waiting; waiting = undefined; f?.(m.index ?? null); }
  });
  const take = () => new Promise<number | null>(res => {
    waiting = res;
    process.send?.({ kind: "take" });
  });

  const { report, outcomes } = await runSuite(ALL, BY_NAME, {
    title: "@orbitmines/physics", only, quiet: true, shard,
    take: shard ? undefined : take,
    onUnit: u => process.send?.({ kind: "unit", ...u }),
  });
  /*
   * HAND IT BACK AND LET GO OF THE CHANNEL. A worker listening for its next unit has
   * an open IPC channel keeping its event loop alive, so without the disconnect it
   * sits there having finished — and the parent waits for an exit that never comes.
   * The callback fires once the results have actually gone out.
   */
  process.send?.({ kind: "done", entries: report.entries, outcomes } satisfies
    { kind: string } & Partial, undefined, undefined, () => process.disconnect?.());
};

(async () => {
  const args = process.argv.slice(2);
  const tier: Budget = args.includes("--quick") ? "quick"
    : args.includes("--normal") ? "normal" : "full";
  setBudget(tier);
  const only = args.filter(a => !a.startsWith("--") && !/^\d+$/.test(a) &&
    args[args.indexOf(a) - 1] !== "--jobs" && args[args.indexOf(a) - 1] !== "--shard");

  /* a worker: measure what it is handed and hand it back, printing nothing */
  const shardArg = valueOf(args, "--shard");
  if (shardArg) {
    const [index, total] = shardArg.split("/").map(Number);
    await runShard(args, only, { index, total });
    return;
  }
  if (args.includes("--worker")) { await runShard(args, only); return; }

  /*
   * THE WORK, IN THE ORDER THE SUITE WILL FLATTEN IT. The queue hands out indices
   * into this list, so it has to be built the same way `runSuite` builds it.
   */
  const chosen = ALL.filter(t => !only.length || only.some(k => t.id.includes(k)));
  const unitsList = chosen.flatMap(t => Object.keys(t.under).map(name => `${t.id} · ${name}`));
  const units = unitsList.length;
  const jobs = Math.max(1, Math.min(
    Number(valueOf(args, "--jobs") ?? cpus().length), units));

  /*
   * LONGEST FIRST, FROM WHAT THE LAST RUN COST.
   *
   * A queue only straggles on its tail: the run cannot end before the unit that
   * started last has finished, so the way to keep that tail short is to start the
   * long ones first. The costs are wildly skewed here — a handful of units are most
   * of the CPU — and they are also stable between runs, so the previous run's
   * seconds are a good enough estimate. TIMINGS.json is a cache and nothing reads it
   * but this: a missing or stale entry costs a slightly longer tail, never a wrong
   * number.
   */
  const timingsPath = `${__dirname}/TIMINGS.json`;
  let timings: Record<string, number> = {};
  try { timings = JSON.parse(readFileSync(timingsPath, "utf8")); } catch { /* first run */ }
  /*
   * A COST FROM ANOTHER TIER IS STILL AN ORDER. The tiers scale the same box and the
   * same tick count, so what is expensive at `quick` is expensive at `full` — and
   * the first full run after a change would otherwise have no ordering at all and
   * straggle on whatever it happened to start last. An unmeasured unit sorts first,
   * since a unit nothing knows the cost of is the one it is least safe to leave for
   * the end.
   */
  const TIERS: Budget[] = ["full", "normal", "quick"];
  const cost = (u: string) => {
    for (const t of TIERS) {
      const v = timings[`${t} · ${u}`];
      if (v !== undefined) return v;
    }
    return Infinity;
  };
  const queue = unitsList.map((_, i) => i).sort((a, b) => cost(unitsList[b]) - cost(unitsList[a]));

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
  const measured: Record<string, number> = {};
  if (jobs > 1) {
    let done = 0;
    await Promise.all(Array.from({ length: jobs }, (_, i) => new Promise<void>((res, rej) => {
      const child = fork(__filename, [...args, "--worker"], {
        execArgv: ["-r", "ts-node/register"],
        env: {
          ...process.env,
          /*
           * `moduleResolution` comes from the app's tsconfig, which is set for a
           * bundler; transpiling a file on its own rejects that combination, and the
           * suite only ever imports its neighbours by relative path.
           */
          TS_NODE_COMPILER_OPTIONS: JSON.stringify({
            module: "commonjs", target: "es2020", moduleResolution: "node",
          }),
          /*
           * The parent has already type-checked everything a worker imports, because
           * it imports it too. Doing it again in each of a dozen workers is a quarter
           * of a minute of every core doing the same work as the one beside it.
           */
          TS_NODE_TRANSPILE_ONLY: "true",
        },
        stdio: ["ignore", "inherit", "inherit", "ipc"],
      });
      child.on("message", (m: any) => {
        if (m.kind === "take") child.send({ kind: "unit", index: queue.shift() ?? null });
        else if (m.kind === "unit") {
          measured[`${tier} · ${m.id} · ${m.theory}`] = m.seconds;
          console.log(`  [${++done}/${units}] ${m.id} · ${m.theory} … ` +
            `${m.seconds.toFixed(1)}s  ${m.status}`);
        }
        else if (m.kind === "done") {
          collected.entries.push(...m.entries);
          collected.outcomes.push(...m.outcomes);
        }
      });
      child.on("error", rej);
      child.on("exit", c => c === 0 ? res() : rej(new Error(`worker ${i} exited ${c}`)));
    })));
    try {
      writeFileSync(timingsPath, JSON.stringify({ ...timings, ...measured }, null, 2));
    } catch { /* a cache that cannot be written is a slower next run, nothing more */ }
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
      let prior: typeof fresh | undefined;
      try {
        prior = JSON.parse(readFileSync(path, "utf8")) as typeof fresh;
        const ids = new Set(fresh.entries.map(e => e.id));
        merged = {
          ...fresh,
          entries: [...prior.entries.filter(e => !ids.has(e.id)), ...fresh.entries]
            .sort((a, b) => a.id.localeCompare(b.id)),
        };
      } catch (err) {
        /*
         * LOUDLY, NOT QUIETLY. This used to swallow whatever it caught, so a report that
         * failed to read for ANY reason silently became a report containing only this
         * run — and since the article reads REPORT.json directly, the first symptom was
         * a page full of NOT IN THE REPORT rather than an error anybody saw. A missing
         * file on the first ever run is the one legitimate case and it says so; anything
         * else is a fault and gets named.
         */
        const missing = (err as NodeJS.ErrnoException)?.code === "ENOENT";
        console.log(missing
          ? "\n  no prior REPORT.json — this run is the whole report"
          : `\n  !! COULD NOT READ THE PRIOR REPORT — ${err}\n` +
            "     Everything not re-run in this invocation is about to be dropped.");
      }

      /*
       * AND REFUSE TO SHRINK IT. A merge cannot legitimately lose an entry: ids are
       * keyed, and the only thing that changes is which of them were just re-measured.
       * So a smaller output than the input means the merge did not happen, and writing
       * it would destroy measurements that can only be recovered by re-running the whole
       * suite. Better to leave the file alone and say why.
       */
      if (prior && merged.entries.length < prior.entries.length) {
        console.log(`\n  !! REFUSING TO WRITE: the merge came to ${merged.entries.length} ` +
          `entries where the file already holds ${prior.entries.length}.\n` +
          "     REPORT.json is unchanged. Re-run without a filter, or with every id you " +
          "meant to re-measure\n     in a single invocation.");
        return;
      }

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
        /* "unresolved by 0.0%" reads as a near miss; it is not a miss at all */
        (f.verdict === "unresolved" ? "DID NOT RESOLVE"
          : `${f.verdict} by ${(100 * (f.by ?? 0)).toFixed(1)}%`));
  }
  if (soft.length) {
    console.log(`\n  and ${soft.length} unresolved at this budget — re-run without --quick before` +
      ` reading anything into them:`);
    for (const o of soft)
      console.log(`      ${o.id} · ${o.theory}: ${o.outside.map(f => f.name).join(", ")}`);
  }
  console.log(`\nwritten to REPORT.json\n`);
})();
