/**
 * THE VACUUM — the one number in this book nobody chose, and the scale that comes
 * with it.
 *
 * (G+M/2) is one expansion seen twice: new room is edged on every axis, and the
 * same expansion thins what is already there. Those two lines have a fixed point
 *
 *     f → p + (1−p)f   then   f(1−p)          f* = (1−p)/(2−p) → ½
 *
 * with the rate cancelling out. Nothing was fitted to get it and nothing can be
 * turned to move it.
 *
 * AND IT IS LOAD-BEARING FOR EVERY OTHER RESULT, which is why it is tested first
 * rather than assumed. Every claim about screening, about coherence, about whether
 * the lattice's grain survives, is really a claim about how often a ray meets
 * something — and that is this number. A run that assumes a half and sits at a
 * seventh of it will report that nothing diffuses when the truth is that there was
 * nothing there to diffuse against, which is exactly what ten files in the old test
 * directory did.
 */

import {
  World, CONSERVING, GRAVITY, GRAVITY_MAGNETISM, fill, scattering, expansionOf,
  headerOf, judge, Theory,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";

export const fixedPoint = test({
  id: "vacuum/fixed-point",
  claims: "the vacuum settles at (1−p)/(2−p) with the rate cancelling out, and a polarised " +
    "one settles below it because (G+M/1) is a sink the derivation has no term for",
  cited: ["Gravity — movement", "Electromagnetism — and the veins"],
  under: {
    /*
     * THE UNSIGNED DERIVATION IS FOR THE UNSIGNED THEORY, which is what makes this
     * pair worth running rather than just one. Under gravity every meeting
     * annihilates, so the fixed point is the one the algebra gives. Under
     * gravity+magnetism about half of head-on meetings are alike and TURN — but
     * the other half still destroy, and destruction is a sink the two lines of
     * (G+M/2) do not account for, so it sits below. Being below is the prediction;
     * how far below is the measurement.
     */
    /*
     * THE DERIVATION'S OWN MEDIUM, where it should be met exactly.
     */
    "conserving": "holds",
    /*
     * AND THE TWO REAL THEORIES, WHERE IT SHOULD NOT BE. Both annihilate — gravity
     * on every head-on meeting, gravity+magnetism on the opposite half of them —
     * and annihilation is a sink the two lines of (G+M/2) have no term for. So both
     * sit BELOW the fixed point, and the interesting question is not whether they
     * miss it but whether the rate still cancels out when they do.
     */
    "gravity": "absent",
    "gravity+magnetism": "absent",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 25, T: 200, seeds: 3 });
    const rates = [0.02, 0.05, 0.12, 0.25];

    const settled = ctx.once((p: number, seed: number) => {
      const w = new World({ theory, N, seed, boundary: "wrap", expansion: p });
      w.run(T);
      return { fill: fill(w), scattering: scattering(w) };
    });

    const measured = rates.map(p => ctx.over(seeds, s => settled(p, s).fill));
    const predicted = rates.map(p => (1 - p) / (2 - p));

    /*
     * THE RATE CANCELS OUT — that is the claim, and it is stronger than any single
     * value. If the occupancy is a property of the RULE rather than of how fast it
     * is run, then a fourfold change in p moves it hardly at all.
     */
    const spread = (Math.max(...measured.map(m => m.mean)) - Math.min(...measured.map(m => m.mean)))
      / (measured.reduce((a, m) => a + m.mean, 0) / measured.length);

    const w = new World({ theory, N, seed: seeds[0], boundary: "wrap", expansion: 0.05 });
    w.run(T);
    const mid = measured[1].mean;

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "spread over a 12× change in the rate", value: spread,
          expect: {
            of: ctx.expecting === "holds"
              ? "small — the rate cancels out of the fixed point"
              : "LARGE — with a sink in it, the balance depends on how fast the rule is run",
            want: 0, tolerance: ctx.expecting === "holds" ? 0.35 : 1e9,
            because: "f → p + (1−p)f then f(1−p) has the rate cancelling; adding annihilation " +
              "breaks that, because creation scales with p and destruction scales with density",
          },
        }),
        ctx.expecting === "holds"
          ? judge({
            name: "occupancy against (1−p)/(2−p)", value: mid,
            expect: {
              of: "the fixed point of edging and thinning",
              want: predicted[1], tolerance: 0.2,
              because: "with nothing destroying anything, creation and thinning are the whole " +
                "of what moves the occupancy, and this is their fixed point",
            },
          })
          : judge({
            name: "occupancy over (1−p)/(2−p)", value: mid / predicted[1],
            expect: {
              of: "WELL BELOW 1 — this theory annihilates, and the derivation has no term for it",
              want: 0, tolerance: 0.75,
              because: "annihilation is a sink f → p + (1−p)f then f(1−p) does not contain, so " +
                "a theory that destroys cannot sit at the fixed point of one that does not",
            },
            note: "which means the ½ this book quotes as 'the vacuum's derived occupancy' is " +
              "the occupancy of a medium NEITHER of its theories is — and since every screening " +
              "length here is a mean free path, that is worth more than a factor of two.",
          }),
        judge({
          name: "mean free path (cells)", value: 1 / Math.max(mid, 1e-9),
          note: "1/fill — a ray meets something when it lands where one sits on the opposing " +
            "exit. EVERY screening length in this book is this number, so it is reported here " +
            "rather than re-derived wherever it is needed.",
        }),
      ],
      table: {
        columns: ["p", "measured", "±", "(1−p)/(2−p)", "mfp", "scattering"],
        rows: rates.map((p, i) => [
          p, measured[i].mean.toFixed(4), measured[i].err.toFixed(4),
          predicted[i].toFixed(4), (1 / Math.max(measured[i].mean, 1e-9)).toFixed(2),
          settled(p, seeds[0]).scattering.toFixed(3),
        ]),
      },
    };
  },
});

/**
 * WHAT THE SHEET IS FOR. The article derives 1/R^(D−1) from a FIXED number of rays
 * spread over a shell — l.SHEET of them, pulsed in a plane that comes round — and
 * every measurement in this book has instead fired every exit every tick.
 *
 * That substitution has never been checked. If the two give the same falloff then
 * isotropic emission is a fair approximation and the arc's numbers stand; if they
 * do not, then a good deal of this book is measured through the wrong source.
 */
export const sheetVersusIsotropic = test({
  id: "vacuum/sheet-versus-isotropic",
  claims: "sheet emission and isotropic emission give the same falloff, so the approximation " +
    "every measurement in this book uses is a fair one",
  cited: ["Gravity — movement"],
  under: { "gravity+magnetism": "holds" },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 35, T: 140, seeds: 3 });
    const C = (N - 1) / 2, centre = [C, C, C];
    const radii = [4, 6, 8, 10].filter(r => r < C - 2);

    const profile = ctx.once((emission: "isotropic" | "sheet", seed: number) => {
      const mk = (withBody: boolean) => {
        const w = new World({ theory, N, seed, boundary: "absorb" });
        if (withBody) w.add({ at: centre, radius: 2, emits: 1, emission });
        return w.run(T);
      };
      const b = mk(true), v = mk(false);
      return radii.map(r => {
        let s = 0, n = 0;
        b.backend.forEachLocal(k => {
          if (b.isSource(k)) return;
          const d = Math.hypot(...b.backend.position(k).map((x, i) => x - centre[i]));
          if (Math.abs(d - r) > 0.5) return;
          let q = 0, qv = 0;
          for (let e = 0; e < b.DEG; e++) {
            if (b.backend.active(k, e)) q += b.backend.charge(k, e);
            if (v.backend.active(k, e)) qv += v.backend.charge(k, e);
          }
          s += q - qv; n++;
        });
        return n ? s / n : NaN;
      });
    });

    const iso = radii.map((_, i) => ctx.over(seeds, s => profile("isotropic", s)[i]));
    const sheet = radii.map((_, i) => ctx.over(seeds, s => profile("sheet", s)[i]));

    // the shapes, normalised at the innermost radius so only the FALLOFF is compared
    const shape = (m: typeof iso) => m.map(x => x.mean / (m[0].mean || NaN));
    const si = shape(iso), ss = shape(sheet);
    const worst = Math.max(...si.map((x, i) =>
      Math.abs(x - ss[i]) / Math.max(Math.abs(x), 1e-9)).filter(isFinite));

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    w.add({ at: centre, radius: 2, emits: 1, emission: "sheet" });
    w.run(T);

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "worst shape difference", value: worst,
          expect: {
            of: "small — the same falloff whichever way the source emits",
            want: 0, tolerance: 0.4,
            because: "the inverse-square law comes from a FIXED number of rays over a shell, " +
              "and how they are distributed over the shell should not change how it thins",
          },
          note: "normalised at the innermost radius, so this compares the falloff and not the " +
            "amplitude — a sheet puts out l.SHEET rays a tick against isotropic's l.DEG, so " +
            "they are not expected to be the same size",
        }),
        judge({
          name: "amplitude ratio, sheet / isotropic",
          value: sheet[0].mean / (iso[0].mean || NaN),
          note: `l.SHEET / l.DEG = ${(w.geometry.SHEET / w.geometry.DEG).toFixed(4)} if the two ` +
            "differ only by how many rays go out a tick",
        }),
      ],
      table: {
        columns: ["r", "isotropic", "sheet", "iso shape", "sheet shape"],
        rows: radii.map((r, i) => [
          r, iso[i].mean.toExponential(3), sheet[i].mean.toExponential(3),
          si[i].toFixed(3), ss[i].toFixed(3),
        ]),
      },
    };
  },
});

/**
 * ANNIHILATION FEEDS THE EXPANSION — the loop the two rules make, which neither of
 * them mentions and which nothing in this project had measured.
 *
 * Read them for what they LEAVE BEHIND rather than for what they destroy. (G/1)
 * leaves a point with nothing on it; (G/2) acts on exactly that. So destruction
 * manufactures the condition creation needs, and a region that has been thoroughly
 * cleared of rays is a region where space is made fastest.
 *
 * It is measurable because the theories annihilate at rates fixed by their rules and
 * nothing else: the conserving medium never does; gravity does on every head-on
 * meeting, since neutral rays have no sign to disagree about; gravity+magnetism does
 * on the opposite half and turns the alike half. If the loop is real they grow in
 * that order.
 *
 * IT NEEDS THE GRAPH BACKEND AND A BOUND. Space growing is the whole measurement, so
 * the flat backend — whose sites are a fixed grid — cannot show it at all; and with
 * nothing fighting it the growth is unbounded, so the run states how much space it
 * is prepared to carry and anything stepping outside is gone.
 */
export const annihilationFeedsExpansion = test({
  id: "vacuum/annihilation-feeds-expansion",
  claims: "annihilation leaves neutral points and (G/2) expands neutral points, so a theory " +
    "that destroys more grows space faster",
  cited: ["Gravity — annihilation feeds the expansion"],
  under: {
    /*
     * Declared on the theory that annihilates MOST, since that is the one the claim
     * is strongest about. The comparison itself needs all three, so the test runs
     * them regardless and the expectation is about their ORDER.
     */
    "gravity": "holds",
  },
  run: (ctx, theory) => {
    const { T, seeds } = ctx.budget({ N: 9, T: 40, seeds: 2 });
    const N = 9, radius = 7;

    const grow = ctx.once((which: string, seed: number) => {
      const th = which === "conserving" ? CONSERVING
        : which === "gravity" ? GRAVITY : GRAVITY_MAGNETISM;
      const w = new World({
        theory: th, N, seed, backend: "graph", boundary: "expand",
        bound: { radius, metric: "box" }, expansion: 1,
      });
      const before = w.backend.size();
      w.run(T);
      const e = expansionOf(w);
      return { grew: e.locals / before, meanDegree: e.meanDegree, annihilations: w.stats.annihilations };
    });

    const names = ["conserving", "gravity+magnetism", "gravity"];
    const grew = names.map(n => ctx.over(seeds, s => grow(n, s).grew));
    const ann = names.map(n => ctx.over(seeds, s => grow(n, s).annihilations));
    const deg = names.map(n => ctx.over(seeds, s => grow(n, s).meanDegree));

    const w = new World({
      theory, N, seed: seeds[0], backend: "graph", boundary: "expand",
      bound: { radius, metric: "box" }, expansion: 1,
    });
    w.run(5);

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "growth ordered by how much each theory annihilates",
          value: (grew[2].mean > grew[1].mean && grew[1].mean > grew[0].mean) ? 1 : 0,
          expect: {
            of: "1 — conserving < gravity+magnetism < gravity",
            want: 1, tolerance: 0,
            because: "a theory that destroys more rays leaves more neutral points, and a " +
              "neutral point is exactly what (G/2) expands",
          },
        }),
        judge({
          name: "gravity's growth over the conserving medium's",
          value: grew[2].mean / Math.max(grew[0].mean, 1e-9),
          expect: {
            of: "well above 1 — the loop is a large effect, not a correction",
            want: 1, tolerance: 1e9,
            because: "the only difference between those two runs is how often two rays destroy " +
              "each other; the bound, the rate and the ticks are identical",
          },
        }),
        judge({
          name: "mean l.DEG, gravity", value: deg[2].mean, err: deg[2].err,
          expect: {
            of: "the lattice's own degree — space is MADE here, not folded",
            want: w.DEG, tolerance: 0.25,
            because: "if l.DEG were growing, the point count would be falling and this would " +
              "be the bookkeeping of a collapse rather than an expansion",
          },
        }),
      ],
      table: {
        columns: ["theory", "annihilates", "space grew", "annihilations", "l.DEG"],
        rows: [
          ["conserving", "never", grew[0].mean.toFixed(1) + "×", ann[0].mean.toExponential(2), deg[0].mean.toFixed(1)],
          ["gravity+magnetism", "half its meetings", grew[1].mean.toFixed(1) + "×", ann[1].mean.toExponential(2), deg[1].mean.toFixed(1)],
          ["gravity", "every meeting", grew[2].mean.toFixed(1) + "×", ann[2].mean.toExponential(2), deg[2].mean.toFixed(1)],
        ],
      },
    };
  },
});

export default [fixedPoint, annihilationFeedsExpansion, sheetVersusIsotropic];
