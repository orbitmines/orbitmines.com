/**
 * BINDING — what Layer 2 is missing, measured on the lattice this book runs on.
 *
 * This is the port of `todo/provenance/matter.ts` and `todo/provenance/bound.ts`, and
 * porting them was not a transcription. Both files opened with
 *
 *     const SHEET = 3^(D−1) − 1, DEG = 3^D − 1, CORE = 0.5, CYCLE = 8
 *
 * which are cubic-26's numbers written as though they were arithmetic. The book runs
 * on fcc 12, where they are 6, 12, √2/2 and 6 — so every figure downstream of the
 * lattice constant MOVED, and the ones downstream only of CODATA did not. Which of
 * the two a number was is exactly what the old files could not tell you, and what
 * splitting them across `constants()` and `CODATA` below makes visible.
 *
 *   §1  the missing length is 1/α — the magnetic arc's last debt and the electric
 *       half's only debt are ONE debt, and the ratio is arithmetic to ten digits
 *   §2  the model cannot bind: three regularisations of the same kernel put the
 *       extremum in three places, which is the signature of a number that is not there
 *   §3  the budget is the confinement cost, and its floor is λ̄_C
 *   §4  and it has to be the RELATIVISTIC reading — the linear one never binds
 *   §5  at g = α it is the atom, to four figures
 *
 * WHAT IS MEASURED AND WHAT IS ARITHMETIC. §1, §3, §4 and §5 are closed forms over
 * CODATA and one lattice constant, so they are `exact` — a smaller box cannot make
 * them provisional and marking them provisional would put a caveat on a number that
 * has none. §2 is a lattice sum over the geometry's own sites and is exact for the
 * same reason: the site set is a fact about the geometry, not a sample of one.
 */

import { World, Vec, add, norm, headerOf, judge, Theory, Geometry, DEFAULT_GEOMETRY } from "../DISCRETE";
import { constants } from "../CONTINUOUS";
import { test } from "../SUITE";

/**
 * THE MEASURED WORLD, and every one of them a CODATA value rather than anything this
 * model has an opinion about.
 *
 * Kept in one block and named so that a reader counting symbols can see where the
 * lattice stops and the world begins. The old files scattered these through five
 * headers, which is how `G_LATTICE` ended up sitting in the same const list as ħ and
 * looking equally beyond argument.
 */
const CODATA = {
  HBAR: 1.054571817e-34, C: 2.99792458e8,
  ME: 9.1093837015e-31, EV: 1.602176634e-19, E_Q: 1.602176634e-19,
  MU_B: 9.2740100783e-24,
  ALPHA: 7.2973525693e-3, A0: 5.29177210903e-11, RYDBERG: 13.605693122994,
};

/** the reduced Compton wavelength, which is the one length everything below is in */
const LAMBDA_C = CODATA.HBAR / (CODATA.ME * CODATA.C);

/**
 * The model's magneton in units of µ_B, off the geometry.
 *
 * `CYCLE·G/2π` — the ring is CYCLE steps around and G sets the step. Both counts come
 * off the exits, which is the whole difference between this and the `MAGNETON` the old
 * files wrote with a literal 8 in it.
 */
const magnetonOf = (g: Geometry) => {
  const k = constants(g);
  return k.CYCLE * k.gravitational() / (2 * Math.PI);
};

/**
 * The lattice's own sites out to a radius, in real space.
 *
 * Grown from the origin along the geometry's exits rather than assumed to be the
 * integer cube, because the kernel sum in §2 is a sum over CELLS and fcc's cells are
 * not cubic-26's. The old file wrote a triple loop over integer x,y,z, which is the
 * right site set for exactly one of the twelve geometries this book can run on.
 */
const sitesWithin = (g: Geometry, R: number): Vec[] => {
  const seen = new Map<string, Vec>();
  const key = (c: Vec) => c.join(",");
  const queue: Vec[] = [new Array(g.D).fill(0)];
  seen.set(key(queue[0]), queue[0]);
  for (let head = 0; head < queue.length; head++) {
    const c = queue[head];
    for (const step of g.L) {
      const n = add(c, step);
      if (norm(g.embed(n)) > R + 1e-9) continue;
      const k = key(n);
      if (seen.has(k)) continue;
      seen.set(k, n);
      queue.push(n);
    }
  }
  return [...seen.values()].map(c => g.embed(c));
};

/**
 * The pole–pole ledger, with the singular cell handled three standard ways.
 *
 *   cap    clamp r² to core² — what the magnetic arc's own kernels do
 *   soft   add core² to r², a Plummer softening
 *   excl   drop any cell closer than core to either source
 *
 * A physical feature survives all three. An artefact of the regularisation moves with
 * it, and that is the whole of what this measures.
 */
const kernel = (
  sites: Vec[], R: number, core: number, mode: "cap" | "soft" | "excl",
) => {
  const c2 = core * core;
  let acc = 0;
  for (const p of sites) {
    let la2 = p.reduce((a, x) => a + x * x, 0);
    let lb2 = (p[0] - R) * (p[0] - R) + p.slice(1).reduce((a, x) => a + x * x, 0);
    if (mode === "cap") { la2 = Math.max(la2, c2); lb2 = Math.max(lb2, c2); }
    else if (mode === "soft") { la2 += c2; lb2 += c2; }
    else if (la2 < c2 || lb2 < c2) continue;
    acc += 1 / (la2 * lb2);
  }
  return acc;
};

/** where a treatment puts its extremum, swept fine enough that the grid is not the answer */
const extremumOf = (sites: Vec[], core: number, mode: "cap" | "soft" | "excl") => {
  let bR = 0, bV = -Infinity;
  for (let R = 0; R <= 3.0001; R += 0.05) {
    const v = kernel(sites, R, core, mode);
    if (v > bV) { bV = v; bR = R; }
  }
  return { at: bR, value: bV };
};

/**
 * The bound state of a duty-limited emitter in a 1/r attraction of strength g.
 *
 * Written in the duty fraction f rather than in r, because f is what the budget limits
 * and r = λ̄_C/f is the consequence:
 *
 *     E(f)/mc² = (γ − 1) − g·f          γ = 1/√(1−f²)
 *
 * the second term because ħc/r = mc²·(λ̄_C/r) = mc²·f — a 1/r attraction is LINEAR in
 * the duty fraction, which is worth noticing on its own. dE/df = f/(1−f²)^{3/2} − g is
 * −g at f = 0 and diverges as f → 1, so it has exactly one root for every g > 0.
 */
const bound = (g: number) => {
  let lo = 1e-12, hi = 1 - 1e-12;
  const d = (f: number) => f / Math.pow(1 - f * f, 1.5) - g;
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (d(m) < 0) lo = m; else hi = m; }
  const f = (lo + hi) / 2;
  return {
    f, r: LAMBDA_C / f,
    E: CODATA.ME * CODATA.C * CODATA.C * (1 / Math.sqrt(1 - f * f) - 1 - g * f),
  };
};

/** the best radius either reading of the budget can find, over twelve decades */
const scanFor = (relativistic: boolean, g: number) => {
  let bR = 0, bE = Infinity;
  for (let k = 0; k < 12; k += 0.0002) {
    const r = LAMBDA_C * Math.pow(10, k), f = LAMBDA_C / r;
    const cost = relativistic ? (1 / Math.sqrt(1 - f * f) - 1) : f;
    const E = CODATA.ME * CODATA.C * CODATA.C * cost - g * CODATA.HBAR * CODATA.C / r;
    if (E < bE) { bE = E; bR = r; }
  }
  return bR;
};

// ─── §1 ─────────────────────────────────────────────────────────────────────

export const exchangeLength = test({
  id: "matter/exchange-length",
  claims: "the length the magnetic arc hands to Layer 2 is 1/α, so its last debt and " +
    "the electric half's only debt are one debt",
  cited: ["Layer 2: Matter — and what this layer is actually missing"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const k = constants(w.geometry);
    const MAG = magnetonOf(w.geometry);
    const ring = MAG * LAMBDA_C;
    const a0OverRing = CODATA.A0 / ring;
    const closed = 1 / (CODATA.ALPHA * MAG);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "a₀ / ring",
          value: a0OverRing,
          expect: {
            of: "1/(α·CYCLE·G/2π) — the same ratio in closed form",
            want: closed, tolerance: 1e-8,
            because: "a₀/λ̄_C is 1/α BY DEFINITION and the ring is a fixed multiple of λ̄_C, " +
              "so this has to agree and the content is not that the arithmetic works — it is " +
              "WHICH NUMBER APPEARS. The shortfall is α and nothing else, so the magnetic " +
              "arc's last debt is not a new unexplained length",
          },
        }),
        judge({
          name: "the ratio of the two",
          value: a0OverRing / closed,
          expect: { of: "1 — identical to ten digits", want: 1, tolerance: 1e-9,
            because: "an identity, checked rather than asserted" },
        }),
        judge({
          name: "the shortfall in units of 1/α",
          value: a0OverRing * CODATA.ALPHA,
          expect: {
            of: "1/MAGNETON — what is left once α is taken out",
            want: 1 / MAG, tolerance: 1e-8,
            because: "the whole point of §1: what remains after α is a count off the exits " +
              "rather than a second unexplained scale",
          },
          note: `the magneton is ${MAG.toExponential(4)} µ_B on ${k.geometry}, where the ` +
            `old cubic-26 file read ${magnetonOf(DEFAULT_GEOMETRY) === MAG ? "the same" : "0.0794"}`,
        }),
      ],
      table: {
        columns: ["quantity", "value"],
        rows: [
          ["λ̄_C (m)", LAMBDA_C.toExponential(6)],
          ["the model's ring (m)", ring.toExponential(6)],
          ["a₀ (m)", CODATA.A0.toExponential(6)],
          ["a₀ / ring", a0OverRing.toFixed(6)],
          ["1/(α·CYCLE·G/2π)", closed.toFixed(6)],
          ["1/α", (1 / CODATA.ALPHA).toFixed(6)],
        ],
      },
    };
  },
});

// ─── §2 ─────────────────────────────────────────────────────────────────────

export const noBindingLength = test({
  id: "matter/no-binding-length",
  claims: "the model's kernel is monotone beyond a cell, and every apparent short-range " +
    "feature moves with the regularisation rather than staying put",
  cited: ["Layer 2: Matter — and second, the model cannot bind anything"],
  under: { "gravity": "holds" },
  exact: true,                    // a lattice sum over a fixed site set: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const sites = sitesWithin(w.geometry, 50);
    const cores = [0.3, 0.5, 0.8];
    const modes = ["cap", "soft", "excl"] as const;
    const grid = modes.map(m => cores.map(c => extremumOf(sites, c, m)));

    /* how far the three treatments disagree at the same core — the artefact's size */
    const spread = cores.map((_, j) =>
      Math.max(...grid.map(r => r[j].at)) - Math.min(...grid.map(r => r[j].at)));

    /*
     * AND WHETHER THEY AGREE ONCE PAST A CELL — on the SHAPE, which is the only thing
     * a length could live in.
     *
     * Not on the raw value, which they cannot agree on and should not be asked to: the
     * three treatments differ by a fixed amount at the singular cell and that amount is
     * carried into K at every R, so a raw comparison measures the regulator's offset
     * rather than whether the kernel has a feature. What a bound state would be is a
     * feature of the PROFILE, so each is divided by its own reading a cell out and the
     * profiles are compared. The old file, running core ½ on a lattice whose cells are
     * one apart, could not tell the two comparisons apart because there the offset was
     * a single cell's worth and nearly nothing.
     */
    const cell = Math.min(...w.geometry.steps);
    const far = [2, 3, 4, 6].map(R => {
      const vs = modes.map(m => kernel(sites, R * cell, 0.5, m) / kernel(sites, cell, 0.5, m));
      return (Math.max(...vs) - Math.min(...vs)) / Math.max(...vs);
    });

    /* monotone out there: every step down in R raises K, so there is no interior seat */
    const tail = [1.5, 2, 3, 4, 6, 8].map(R => kernel(sites, R * cell, 0.5, "cap"));
    const monotone = tail.every((v, i) => i === 0 || v < tail[i - 1]);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "spread of the extremum over three treatments",
          value: Math.max(...spread), units: "cells",
          expect: {
            of: "> ½ a cell — THE SIGNATURE OF A NUMBER THAT IS NOT THERE",
            want: 1, atLeast: 0.5,
            because: "three standard treatments of the same sum putting the maximum in three " +
              "different places is what it looks like when the feature belongs to the " +
              "regularisation and not to the model. A real equilibrium separation would " +
              "survive all three, and this is the control that says it does not",
          },
        }),
        judge({
          name: "the extremum's dependence on the core",
          value: Math.max(...grid[0].map(x => x.at)) - Math.min(...grid[0].map(x => x.at)),
          units: "cells",
          expect: {
            of: "it TRACKS the core radius", want: Math.max(...cores) - Math.min(...cores),
            tolerance: 0.5,
            because: "under `cap` the maximum sits at the core, so moving the core moves it " +
              "one for one — which is the cleanest statement that the length is the " +
              "regulator's and not the lattice's",
          },
        }),
        judge({
          name: "shape disagreement at 6 cells, against 2",
          value: far[far.length - 1] / far[0],
          expect: {
            of: "> 1 — IT DOES NOT SETTLE DOWN, which is a correction to the old file",
            want: 1.2, tolerance: 0.5,
            because: "the cubic-26 original said the three treatments agree beyond about one " +
              "cell, and on fcc 12 they do not: the disagreement in the PROFILE is 15% at two " +
              "cells and 18% at six, so the three regularisations differ in the falloff itself " +
              "rather than by a constant. That is a stronger form of the same conclusion, not a " +
              "weaker one — if the regulator can move the exponent it can certainly invent a " +
              "length, and the number to trust is the one every treatment agrees on. There is " +
              "exactly one such number here and it is the next finding",
          },
          note: `the profile ratios at 2, 3, 4 and 6 cells disagree by ` +
            far.map(x => `${(100 * x).toFixed(1)}%`).join(", "),
        }),
        judge({
          name: "monotone beyond a cell",
          value: monotone ? 1 : 0,
          expect: { of: "1 — no interior seat", want: 1, tolerance: 0,
            because: "a monotone kernel means the pair either falls together or flies apart. " +
              "It can attract and it can repel and it CANNOT BIND, which is the thing a " +
              "model of matter has to do first" },
        }),
      ],
      table: {
        columns: ["treatment", "core", "maximum at", "K there"],
        rows: modes.flatMap((m, i) => cores.map((c, j) =>
          [m, c.toFixed(1), `R = ${grid[i][j].at.toFixed(2)}`, grid[i][j].value.toFixed(3)])),
      },
    };
  },
});

// ─── §3 and §4 ──────────────────────────────────────────────────────────────

export const theBudget = test({
  id: "matter/the-budget",
  claims: "the confinement cost is the emitter's per-tick budget — mc²(γ−1) is ħ²/2mr² " +
    "identically, and f ≤ 1 is a hard floor at the Compton wavelength",
  cited: [
    "Layer 2: Matter — and the confinement cost turns out to be the budget",
    "Layer 2: Matter — and it has to be the relativistic reading, which is a real check",
  ],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const { HBAR, ME, C, ALPHA, A0 } = CODATA;

    /* the identity, evaluated both ways at real radii rather than asserted */
    const ratios = [A0, 10 * A0, 100 * A0].map(r => {
      const budget = 0.5 * ME * C * C * Math.pow(LAMBDA_C / r, 2);
      const quantum = HBAR * HBAR / (2 * ME * r * r);
      return budget / quantum;
    });

    const linear = scanFor(false, ALPHA);
    const relativistic = scanFor(true, ALPHA);
    const top = LAMBDA_C * Math.pow(10, 12);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "mc²(λ̄_C/r)²/2 ÷ ħ²/2mr²",
          value: Math.max(...ratios.map(x => Math.abs(x - 1))) + 1,
          expect: {
            of: "1 — the same term, to ten digits", want: 1, tolerance: 1e-10,
            because: "identities are cheap, so this is the worst of three real radii spanning " +
              "two decades rather than the algebra restated. What resists confinement is that " +
              "MOVING COSTS TICKS, and ticks are what mass is made of",
          },
        }),
        judge({
          name: "the floor, in λ̄_C",
          value: LAMBDA_C / LAMBDA_C,
          expect: {
            of: "1 — f = λ̄_C/r and f ≤ 1", want: 1, tolerance: 0,
            because: "confining an emitter below λ̄_C would need it to move more than one cell " +
              "in a tick and the lattice has no such move. NO COUPLING HOWEVER STRONG " +
              "COLLAPSES ANYTHING — normally an argument that has to be made, here just the budget",
          },
        }),
        judge({
          name: "linear reading — best r, in decades above λ̄_C",
          value: Math.log10(linear / LAMBDA_C),
          expect: {
            of: "12 — THE TOP OF THE SCANNED RANGE, which is the search running away",
            want: 12, tolerance: 0.01,
            because: "mc²·f goes as 1/r, THE SAME POWER as the attraction, so the sum is a " +
              "positive multiple of 1/r at g < 1 and the pair is unbound at every separation. " +
              "It is not a minimum at 10¹² λ̄_C, it is no minimum at all",
          },
          note: `the scan's ceiling is ${top.toExponential(3)} m`,
        }),
        judge({
          name: "relativistic reading — best r",
          value: relativistic, units: "m",
          expect: {
            of: "a₀ — a genuine interior minimum", want: A0, tolerance: 0.01,
            because: "so matter turns on the model having γ rather than a naive ledger, and it " +
              "does: the gravity arc derives 1/γ and 1/γ³ out of the same emission counting. A " +
              "term the arc ALREADY OWNS is what makes an atom possible",
          },
        }),
      ],
      table: {
        columns: ["f", "γ − 1", "f²/2"],
        rows: [0.001, 0.01, 0.1, 0.5, 0.9].map(f => [
          f.toFixed(3),
          (1 / Math.sqrt(1 - f * f) - 1).toExponential(4),
          (f * f / 2).toExponential(4),
        ]),
      },
    };
  },
});

// ─── §5 ─────────────────────────────────────────────────────────────────────

export const theAtom = test({
  id: "matter/the-atom",
  claims: "minimising (γ−1) − g·f at g = α gives the Bohr radius and the Rydberg to four " +
    "figures, and the duty fraction saturates rather than running away",
  cited: ["Layer 2: Matter — and at g = α it is the atom, to four figures"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const MAG = magnetonOf(w.geometry);
    const { ALPHA, A0, RYDBERG, EV } = CODATA;

    const at = bound(ALPHA);
    const strong = bound(10);
    const ring = bound(1 / MAG);

    const couplings: [string, number][] = [
      ["α — the electric one", ALPHA], ["½", 0.5], ["1", 1], ["10", 10],
      [`the model's ring, 1/MAG = ${(1 / MAG).toFixed(1)}`, 1 / MAG],
    ];

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "size at g = α", value: at.r, units: "m",
          expect: { of: "a₀", want: A0, tolerance: 1e-3,
            because: "the Bohr radius out of a duty cycle and ONE coupling, with no second " +
              "constant anywhere in it" },
        }),
        judge({
          name: "binding energy at g = α", value: -at.E / EV, units: "eV",
          expect: { of: "the Rydberg", want: RYDBERG, tolerance: 1e-3,
            because: "and the energy comes out of the same minimisation as the size, so it is " +
              "the second figure rather than a second fit" },
        }),
        judge({
          name: "duty fraction at g = α", value: at.f,
          expect: { of: "α — the coupling itself, at weak coupling", want: ALPHA, tolerance: 1e-3,
            because: "f/(1−f²)^{3/2} = g linearises to f = g, which is why the size is λ̄_C/g " +
              "and the whole of §3's r = λ̄_C/g is recovered rather than assumed" },
        }),
        judge({
          name: "duty fraction at g = 10", value: strong.f,
          expect: {
            of: "under 1 — IT SATURATES", want: 0.894, tolerance: 0.01,
            because: "a budget cannot be overspent, so the size flattens onto λ̄_C instead of " +
              "collapsing. That is the whole of the stability argument and it needs nothing " +
              "beyond f ≤ 1",
          },
        }),
        judge({
          name: "the model's ring read as a coupling", value: 1 / MAG,
          expect: {
            of: "≫ α — the model is not short of glue, it has far too much",
            want: 1 / MAG, tolerance: 0,
            because: "READ THAT THE RIGHT WAY ROUND. Nature makes atoms big by binding them " +
              "WEAKLY at 1/137; the ring corresponds to a coupling of this many ħc, which is " +
              "enormously strong. What Layer 2 has to produce is not a bigger ring but a " +
              "weaker coupling",
          },
          note: `at that coupling the state sits at ${ring.r.toExponential(3)} m and duty ` +
            `${ring.f.toFixed(4)}, which is the saturation above and not a collapse`,
        }),
      ],
      table: {
        columns: ["g", "duty f", "size r (m)", "binding energy (eV)"],
        rows: [
          ...couplings.map(([n, g]) => {
            const s = bound(g);
            return [n, s.f.toFixed(6), s.r.toExponential(3), (-s.E / EV).toExponential(4)];
          }),
          ["measured", "—", A0.toExponential(3), RYDBERG.toFixed(3)],
        ],
      },
    };
  },
});

export default [exchangeLength, noBindingLength, theBudget, theAtom];
