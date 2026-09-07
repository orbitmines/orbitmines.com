/**
 * THE VACUUM — the one number in this book nobody chose, and the scale that comes
 * with it.
 *
 * (G+M/2) splits every neutral point every tick — unconditionally, with no rate in
 * it — and puts the two halves of the inserted point on the two ends of one shared
 * edge, facing each other. What survives that meeting IS the occupancy:
 *
 *     conserving          both halves kept                    → 1
 *     gravity             both neutral, both annihilate       → 0
 *     gravity+magnetism   alike half turns, opposite half goes → ½
 *
 * Nothing was fitted to get that and nothing can be turned to move it. The
 * (1−p)/(2−p) → ½ this file used to test against is the p → 0 limit of a rate the
 * rule does not have, and it agreed with the right answer for the wrong reason.
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
  claims: "the vacuum settles at a definite occupancy with no rate in it and no dependence " +
    "on the box — 1 where nothing is destroyed and 0 under pure gravity, both from the rule; " +
    "and under gravity+magnetism a number the LATTICE fixes rather than the rules",
  cited: ["Gravity — movement", "Electromagnetism — and the veins"],
  under: {
    /*
     * ALL THREE HOLD, AND WHAT THEY HOLD IS WEAKER THAN THE ½ THIS FILE USED TO ASSERT.
     *
     * The old version swept an expansion rate `p` against (1−p)/(2−p), with the two real
     * theories declared `absent` because they annihilate and the derivation has no sink in
     * it. All of that is gone. (G/2) does not fire at a rate, and it does not fire
     * everywhere either — it fires on a NEUTRAL POINT, one with nothing on it. So creation
     * is proportional to how much of the box is empty, and the balance is struck against
     * destruction wherever (1−f)^DEG puts it.
     *
     * TWO OF THE THREE ARE STILL THE RULE'S. Conserving destroys nothing, so every point
     * that fills stays full and the box saturates at 1. Pure gravity annihilates both
     * halves of everything it makes, so it holds exactly 0 and HAS NO VACUUM AT ALL.
     * Neither of those turns on how often a point is empty, so neither turns on the tiling.
     *
     * THE THIRD IS THE LATTICE'S, and that is the correction. A polarised vacuum keeps the
     * alike half of its meetings, so it holds something — but how much is 0.2553 on fcc-12,
     * 0.1780 on cubic-26, 0.3209 on cubic-6, steady in the box to a part in five hundred
     * and different on every tiling. The half was never the rules'. What survives is that
     * the number does not move with the box, which is what makes it a constant at all.
     */
    "conserving": "holds",
    "gravity": "holds",
    "gravity+magnetism": "holds",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 25, T: 200, seeds: 3 });

    /*
     * THE SWEEP IS OVER THE BOX, NOT OVER A RATE. There is no rate left to vary, and
     * the claim that took its place is the stronger one anyway: the occupancy is a
     * property of the RULE, so it must not move when the box or the run length does.
     */
    const boxes: [number, number][] = [
      [Math.max(9, Math.round(N * 0.4)) | 1, Math.round(T / 4)],
      [Math.max(11, Math.round(N * 0.7)) | 1, Math.round(T / 2)],
      [N, T],
      [N, 2 * T],
    ];

    const settled = ctx.once((n: number, t: number, seed: number) => {
      const w = new World({ theory, N: n, seed, boundary: "wrap" });
      w.run(t);
      return { fill: fill(w), scattering: scattering(w) };
    });

    const measured = boxes.map(([n, t]) => ctx.over(seeds, s => settled(n, t, s).fill));
    const predicted = theory.vacuum;
    const at = measured[measured.length - 1].mean;

    /*
     * A SPREAD ABOUT A ZERO IS AN ABSOLUTE SPREAD. Dividing by the mean is how the old
     * version read, and under gravity the mean is nought — which turns "it does not
     * move" into a division by zero and then into a fake failure. The occupancies here
     * all live in [0, 1], so the range is already on the right scale.
     */
    const spread = Math.max(...measured.map(m => m.mean)) - Math.min(...measured.map(m => m.mean));

    const w = new World({ theory, N, seed: seeds[0], boundary: "wrap" });
    w.run(T);

    const empty = predicted === 0;
    return {
      header: headerOf(w, seeds),
      findings: [
        /*
         * JUDGED ONLY WHERE THE RULE FIXES IT — see `Theory.vacuum`. Conserving destroys
         * nothing so it fills; gravity destroys everything it makes so it holds nothing;
         * neither of those depends on how often a point happens to be empty. A polarised
         * vacuum does, through (1−f)^DEG, so its density is the lattice's and asserting a
         * number for it here would be asserting the tiling.
         */
        predicted === null
          ? {
            name: "occupancy", value: at, err: measured[measured.length - 1].err,
            note: "SET BY THE LATTICE AND NOT BY THE RULES, which is the correction this " +
              "claim carries. (G/2) fires on an EMPTY point, so creation goes as (1−f)^DEG " +
              "and the balance lands where the tiling puts it: 0.2553 on fcc-12, 0.1780 on " +
              "cubic-26, 0.3209 on cubic-6. The ½ this book quoted as the one number nobody " +
              "chose came out of reading (G/2) as a rule that fires everywhere.",
          }
          : judge({
            name: "occupancy", value: at,
            expect: {
              of: `${predicted} — what this theory is left holding once every empty point ` +
                `has split and the halves have met on their shared edges`,
              want: predicted, tolerance: 0.05,
              because: "a medium that destroys nothing fills and stays full; pure gravity " +
                "annihilates both halves of everything it makes and holds nothing. Neither " +
                "turns on how often a point is empty, so neither turns on the lattice",
            },
          }),
        judge({
          name: "how far it moves over a 3× box and a 8× run", value: spread,
          expect: {
            of: "nought — a density that is a property of the rules and the tiling cannot " +
              "also be a property of the box it is run in",
            want: 0, tolerance: 0.03,
            because: "THIS IS THE CLAIM THAT SURVIVES, and it is the one that was worth " +
              "having. The occupancy is not universal — it moves with the lattice — but it " +
              "does not move with the box or the run length, which is what makes it a " +
              "constant of the model rather than an artefact of a measurement",
          },
        }),
        judge({
          name: "mean free path (cells)", value: empty ? NaN : 1 / Math.max(at, 1e-9),
          note: empty
            ? "THERE IS NO PATH, because there is nothing to meet. Pure gravity annihilates " +
              "every point it makes, so a screening length is not small here — it does not " +
              "exist, and every result in this book that needs a medium needs the polarity."
            : "1/fill — a ray meets something when it lands where one sits on the opposing " +
              "exit. EVERY screening length in this book is this number, so it is reported " +
              "here rather than re-derived wherever it is needed.",
        }),
      ],
      table: {
        columns: ["N", "ticks", "measured", "±", "the rule says", "mfp", "scattering"],
        rows: boxes.map(([n, t], i) => [
          n, t, measured[i].mean.toFixed(4), measured[i].err.toFixed(4),
          predicted === null ? "the lattice's" : predicted.toFixed(4),
          measured[i].mean > 0 ? (1 / measured[i].mean).toFixed(2) : "—",
          settled(n, t, seeds[0]).scattering.toFixed(3),
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
        bound: { radius, metric: "box" },
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
      bound: { radius, metric: "box" },
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
            want: 1, atLeast: 1,
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
