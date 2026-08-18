/**
 * THE SUITE — how a physics claim gets tested, and how its numbers reach the article.
 *
 * TWO RULES THIS EXISTS TO ENFORCE.
 *
 * FIRST: NOTHING IS TYPED INTO THE ARTICLE BY HAND. A test records what it measured
 * into a Report, the runner writes that report to a path the article reads, and a
 * figure with no entry behind it is a figure with no evidence behind it. Before
 * this, a number in the prose and the code that produced it could drift apart
 * silently — and did, for four files at once.
 *
 * SECOND, AND THE REASON THIS FILE LOOKS THE WAY IT DOES: A CLAIM IS ALWAYS A CLAIM
 * ABOUT A THEORY. "Coulomb's law holds" is not a statement about the model, it is a
 * statement about gravity+magnetism — and under plain gravity it cannot even be
 * asked, because rays carry no polarity for a sign law to be about. So a test does
 * not hardcode a theory. It declares what it expects of each:
 *
 *   holds       the claim should come out, and its findings should land in their bands
 *   absent      the claim should measurably NOT come out. This is a RESULT, not a
 *               skip — "a magnetic field is absent without the label" is the whole
 *               of what `fork` established, and it is worth failing if B shows up.
 *   <a reason>  the claim cannot be phrased in this theory at all, and the reason is
 *               recorded in the report rather than the test being quietly missing.
 *
 * A test that holds where it should be absent is as much a failure as one that
 * fails where it should hold, and the report says which happened.
 */

import { World, Report, Entry, Finding, Header, Theory, headerOf, judge, stat, Stat } from "./DISCRETE";

/** what a claim should do under one theory */
export type Under = "holds" | "absent" | (string & {});

export type TestContext = {
  /** run something for each seed and get its statistics, refusing single runs */
  over<T extends number>(seeds: number[], f: (seed: number) => T): Stat;
  /**
   * Memoise a simulation on its arguments.
   *
   * The natural way to write these tests re-runs the whole world once per radius:
   *
   *     radii.map((_, i) => ctx.over(seeds, s => profile(s)[i]))
   *
   * — which is five radii × four seeds × two worlds × a hundred and sixty ticks, for
   * a measurement that needed eight runs. Wrapping the simulation in `once` makes
   * the same expression cost what it looks like it costs.
   */
  once<A extends unknown[], R>(f: (...a: A) => R): (...a: A) => R;
  /** what this theory is supposed to do with this claim, so expectations can follow it */
  expecting: "holds" | "absent";
  /** the run size this suite is affording, already scaled */
  budget: typeof budget;
  note(s: string): void;
};

export type Test = {
  id: string;
  claims: string;
  /** which article sections quote this, so a change here says what it touches */
  cited?: string[];
  /** theory name → what this claim should do under it */
  under: Record<string, Under>;
  /**
   * Whether the answer is arithmetic rather than a measurement.
   *
   * A counting fact about a neighbour set does not depend on how big a box is or how
   * long it ran, so a reduced budget cannot make it provisional — and marking it so
   * puts a caveat on a number that has none, which is its own kind of dishonesty.
   */
  exact?: boolean;
  run: (ctx: TestContext, theory: Theory) => {
    header: Header;
    findings: Finding[];
    table?: Entry["table"];
  };
};

export const test = (t: Test): Test => t;

export const DEFAULT_SEEDS = [20260817, 777333, 424242, 909090, 5150, 31337];

/**
 * HOW BIG A RUN IS ALLOWED TO BE, because a suite nobody can afford to run is a
 * suite nobody runs. `full` is what a published number should be measured at;
 * `quick` is for checking that a change did not break anything, and its results are
 * marked so they cannot be quoted by accident.
 *
 * A test asks for what it wants and gets what the budget allows:
 *
 *     const { N, T, seeds } = budget({ N: 41, T: 240, seeds: 5 });
 */
export type Budget = "quick" | "normal" | "full";
let CURRENT: Budget = "full";
export const setBudget = (b: Budget) => { CURRENT = b; };
export const currentBudget = () => CURRENT;

/**
 * THREE TIERS, BECAUSE THERE ARE THREE DIFFERENT QUESTIONS.
 *
 *   quick    did this change break anything? Minutes. A third the width and half
 *            the ticks, which is an eightfold saving on the box alone. Cannot
 *            refute anything and is marked so it cannot be quoted.
 *   normal   is the effect there at all, and roughly how big? The tier to iterate
 *            a measurement at — big enough that a profile has radii to fit and a
 *            separation sweep spans its flip length, small enough to rerun often.
 *   full     what a published number is measured at. Nothing is scaled.
 *
 * A test asks for what it wants and gets what the tier allows. Cost goes as N³·T·seeds,
 * so `normal` at 0.7 in the box and 0.75 in the ticks and seeds is about a fifth of
 * `full` — and `quick` about a fiftieth.
 *
 * N IS KEPT ODD at every tier so that a centre exists and a body is not straddling
 * two cells.
 */
const odd = (x: number, floor: number) => Math.max(floor, 2 * Math.round((x - 1) / 2) + 1);

export const budget = (want: { N: number; T: number; seeds: number }) => {
  if (CURRENT === "full")
    return {
      N: want.N, T: want.T, seeds: DEFAULT_SEEDS.slice(0, want.seeds),
      quick: false, tier: "full" as Budget,
    };
  if (CURRENT === "normal")
    return {
      N: odd(0.7 * want.N, 21),
      T: Math.max(60, Math.round(0.75 * want.T)),
      seeds: DEFAULT_SEEDS.slice(0, Math.max(3, Math.ceil(0.75 * want.seeds))),
      quick: false, tier: "normal" as Budget,
    };
  return {
    N: odd(want.N / 3, 21),
    T: Math.max(40, Math.round(want.T / 2)),
    seeds: DEFAULT_SEEDS.slice(0, Math.max(2, Math.ceil(want.seeds / 2))),
    quick: true, tier: "quick" as Budget,
  };
};

export type Outcome = {
  id: string;
  theory: string;
  declared: Under;
  /** whether the findings with expectations all landed inside their bands */
  held: boolean;
  /** declared "holds" and did, or declared "absent" and was */
  asDeclared: boolean;
  /** missed its expectation, but at a budget too small to mean anything */
  provisional?: boolean;
  outside: Finding[];
};

export const runSuite = async (
  tests: Test[],
  theories: Record<string, Theory>,
  o: {
    title?: string; only?: string[]; quiet?: boolean;
    /** where the report goes; the runner supplies this, not the model */
    write?: (json: string) => void | Promise<void>;
    /**
     * WHICH SLICE OF THE WORK THIS PROCESS OWNS.
     *
     * A claim is measured by running worlds, which is CPU-bound and single-threaded,
     * so the only way the suite gets faster is more processes. The unit of work is
     * one (claim × theory) pair — never smaller, because a test's `ctx.once` cache is
     * what stops it running the same world twice and that cache lives in the process.
     */
    shard?: { index: number; total: number };
    /** called as each unit finishes, so a parent can report progress as it streams */
    onUnit?: (u: { id: string; theory: string; seconds: number; status: string }) => void;
  } = {},
) => {
  const R = new Report(o.title ?? "physics");
  const outcomes: Outcome[] = [];
  const chosen = o.only?.length ? tests.filter(t => o.only!.some(k => t.id.includes(k))) : tests;

  /*
   * THE WORK, FLATTENED, so it can be dealt out. Round-robin rather than in blocks:
   * the units differ enormously in cost — a counting fact about a neighbour set
   * against a separation sweep in a 41³ box — and contiguous blocks would put all
   * the expensive ones on one worker.
   */
  const units = chosen.flatMap(t =>
    Object.entries(t.under).map(([name, declared]) => ({ t, name, declared })));
  const mine = o.shard
    ? units.filter((_, i) => i % o.shard!.total === o.shard!.index)
    : units;

  {
    for (const { t, name, declared } of mine) {
      const theory = theories[name];
      if (!theory) throw new Error(
        `${t.id} declares an expectation under "${name}", which is not a theory this suite knows. ` +
        `Known: ${Object.keys(theories).join(", ")}`);

      // a claim that cannot be phrased in this theory: recorded, with the reason
      if (declared !== "holds" && declared !== "absent") {
        R.record({
          id: `${t.id} · ${name}`, what: t.claims,
          header: { ...headerOf(new World({ theory, N: 5 })), theory: name },
          findings: [{ name: "not applicable", value: NaN, note: declared }],
        });
        outcomes.push({ id: t.id, theory: name, declared, held: false, asDeclared: true, outside: [] });
        continue;
      }

      const notes: string[] = [];
      const ctx: TestContext = {
        once: <A extends unknown[], Rt>(f: (...a: A) => Rt) => {
          const cache = new Map<string, Rt>();
          return (...a: A): Rt => {
            const k = JSON.stringify(a);
            if (!cache.has(k)) cache.set(k, f(...a));
            return cache.get(k)!;
          };
        },
        over: (seeds, f) => {
          if (seeds.length < 2) throw new Error(
            `${t.id}: a single seed is not a measurement. Every number in this book that turned ` +
            `out to be noise looked like this one does.`);
          return stat(seeds.map(f));
        },
        expecting: declared as "holds" | "absent",
        budget,
        note: s => notes.push(s),
      };

      const t0 = Date.now();
      if (!o.quiet) process.stdout.write(`  ${t.id} · ${name} … `);
      const got = t.run(ctx, theory);
      const entry = R.record({
        id: `${t.id} · ${name}`, what: t.claims, header: got.header,
        findings: got.findings, table: got.table,
      });
      if (CURRENT !== "full" && !t.exact) entry.findings.unshift({
        name: CURRENT === "quick" ? "QUICK RUN" : "NORMAL RUN", value: NaN,
        note: CURRENT === "quick"
          ? "measured at a reduced box and tick count. Good enough to say whether something " +
            "broke; NOT good enough to quote — a published number is a `full` run."
          : "measured at the iteration tier: big enough to size an effect and to carry a " +
            "profile or a sweep, but NOT what a published number is quoted from. A figure " +
            "the article cites is a `full` run.",
      });
      for (const n of notes) entry.findings.push({ name: "note", value: NaN, note: n });

      const outside = entry.findings.filter(f => f.verdict && f.verdict !== "within");
      const held = outside.length === 0;
      /*
       * A QUICK RUN CANNOT REFUTE ANYTHING. Its box is a third the width and its
       * ticks half, so a profile has two radii where it needs five and a screened
       * fit has nothing to grip on. Reporting those as "did not do what was
       * declared" is how a budget artefact becomes a physics claim — so at this
       * budget a miss is `provisional` and says which it was.
       */
      const provisional = CURRENT !== "full" && !held && !t.exact;
      /*
       * `held` is judged against the expectations the TEST wrote, which it wrote
       * knowing what it was expecting — so a test told "absent" writes expectations
       * asserting absence, and holding them means the thing was correctly absent.
       */
      outcomes.push({
        id: t.id, theory: name, declared, held,
        asDeclared: held || provisional, provisional, outside,
      });
      const status = held ? `${declared} ✓`
        : provisional ? `${outside.length} outside — provisional, ${CURRENT} budget`
          : `${outside.length} outside expectation`;
      const seconds = (Date.now() - t0) / 1000;
      if (!o.quiet) console.log(`${seconds.toFixed(1)}s  ${status}`);
      o.onUnit?.({ id: t.id, theory: name, seconds, status });
    }
  }

  if (o.write) await R.write(o.write);
  return { report: R, outcomes };
};

/** the one-line summary: which claims hold under which theories */
export const matrix = (outcomes: Outcome[]) => {
  const ids = [...new Set(outcomes.map(o => o.id))];
  const theories = [...new Set(outcomes.map(o => o.theory))];
  const rows = ids.map(id => {
    const cells = theories.map(th => {
      const o = outcomes.find(x => x.id === id && x.theory === th);
      if (!o) return "—";
      if (o.declared !== "holds" && o.declared !== "absent") return "n/a";
      if (o.held) return o.declared;
      return o.provisional ? "unresolved" : `NOT ${o.declared}`;
    });
    return [id, ...cells];
  });
  return { columns: ["claim", ...theories], rows };
};
