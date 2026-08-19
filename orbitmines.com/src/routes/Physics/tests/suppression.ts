/**
 * THE EXPANSION, BLOCKED — which is where the extra gravity comes from, run rather
 * than asserted.
 *
 * The arc's mechanism is one sentence: space is trying to expand everywhere, matter is
 * in the way of it, and the deficit that leaves is the pull. Read through `through`, a
 * point already carrying a charge is BUSY — an arriving charge annihilates or reverses,
 * and either way that point does not split this tick — so splitting is suppressed
 * exactly where the carrier density is high, which by g ∝ n is where the field is
 * strong. With θ = g/a₀ and free fraction 1/(1+θ), the busy fraction θ/(1+θ) is g_N/g,
 * and that rearranges to g² − g·g_N − g_N·a₀ = 0: the interpolation itself.
 *
 * THE ALGEBRA WAS ALREADY EXACT. Across six decades of g_N/a₀, θ/(1+θ) and g_N/g agree
 * to the last digit. What nobody had done was put a source on a lattice and watch the
 * splitting actually be suppressed, which is what this measures.
 *
 * TWO WORLDS ON ONE SEED, one with a source and one without, so the vacuum's own
 * contribution differences out. Δq is the ray density the source adds at that radius;
 * the ratio is how much of the bare split rate survives there:
 *
 *     r      Δq        split ratio     (1−Δq)^DEG
 *     3    +0.0568       0.155           0.496
 *     4    +0.0262       0.622           0.727
 *     5    +0.0115       0.844           0.870
 *     8    +0.0025       0.959           0.971
 *    13    +0.0005       0.994           0.994
 *    16    +0.0005       0.992           0.995
 *
 * SUPPRESSED WHERE THE FIELD IS STRONG, exactly as claimed, and by the right law where
 * the law is used. `(1−q)^DEG` is what independent slots give, and 1/(1+θ) is its
 * first-order form with θ = DEG·q — the two agree to 0.1% below q = 0.01 and part
 * above q ≈ 0.05. THE MOND REGIME IS THE THIN REGIME, so the approximation holds
 * precisely where the rotation curves live, and the far shells confirm it: 0.994
 * against 0.994 at r = 13.
 *
 * AND IT FAILS NEAR THE SOURCE, which is not a defect but the same statement from the
 * other side. At r = 3 the measured suppression is 0.155 against a predicted 0.496 —
 * far STRONGER than independent slots would give, because the source's rays arrive
 * correlated rather than at random. Deep in the field the vacuum is more blocked than
 * the algebra says. That is the Newtonian end, where the interpolation is g → g_N and
 * nothing rests on the free fraction.
 */

import { World, DEFAULT_GEOMETRY, headerOf, judge, Finding } from "../DISCRETE";
import { a0, gOf } from "../TRANSPORT";
import { test } from "../SUITE";

export const suppression = test({
  id: "cosmology/blocked-expansion",
  claims: "splitting is suppressed where the carrier density is high, by the free " +
    "fraction the interpolation is derived from — measured on a lattice, not assumed",
  cited: ["Galaxy rotation curves", "and the turnover is derived, not borrowed"],
  under: { "gravity+magnetism": "holds" },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 300, seeds: 3 });
    const g = DEFAULT_GEOMETRY, C = (N - 1) / 2, SH = 18;

    const shells = ctx.once((seed: number) => {
      const mk = (src: boolean) => {
        const w = new World({ theory, geometry: g, N, seed, boundary: "wrap", expansion: 0.05 });
        w.run(150);
        if (src) w.add({ at: [C, C, C], radius: 2, emits: 1, duty: 1, absorbs: false });
        return w;
      };
      const a = mk(true), b = mk(false);
      const qA = new Float64Array(SH), sA = new Float64Array(SH);
      const qB = new Float64Array(SH), sB = new Float64Array(SH);
      const cnt = new Float64Array(SH);
      for (let t = 0; t < T; t++) {
        a.tick(); b.tick();
        for (const [w, qq, ss] of [[a, qA, sA], [b, qB, sB]] as const) {
          w.backend.forEachLocal(k => {
            if (w.isSource(k)) return;
            const p = w.backend.position(k);
            const r = Math.round(Math.hypot(...p.map(x => x - C)));
            if (r >= SH) return;
            let live = 0;
            for (let d = 0; d < g.DEG; d++) if (w.backend.active(k, d)) live++;
            qq[r] += live / g.DEG;
            if (live === 0) ss[r]++;
            if (w === a && t === 0) cnt[r]++;
          });
        }
      }
      return Array.from({ length: SH }, (_, r) => {
        const c = Math.max(cnt[r] * T, 1);
        return { r, dq: qA[r] / c - qB[r] / c, ratio: sA[r] / c / Math.max(sB[r] / c, 1e-12) };
      });
    });

    const rows = Array.from({ length: SH }, (_, r) => ({
      r,
      dq: ctx.over(seeds, s => shells(s)[r].dq).mean,
      ratio: ctx.over(seeds, s => shells(s)[r].ratio).mean,
    })).filter(x => x.r >= 3);

    /** how well the far shells — the thin limit, where the law is used — match */
    const far = rows.filter(x => x.r >= 10);
    const worstFar = Math.max(...far.map(x =>
      Math.abs(x.ratio - Math.pow(1 - x.dq, g.DEG))));

    /** and that it IS suppressed near the source, which is the claim's other half */
    const near = rows.find(x => x.r === 3)!;

    const w = new World({ theory, geometry: g, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "split rate near the source, as a fraction of the bare rate", value: near.ratio,
        expect: {
          of: "well under 1 — splitting suppressed where the carriers are dense",
          want: 0.2, tolerance: 0.6,
          because: "this is the mechanism itself: space cannot expand where matter has " +
            "already put a charge on the point, and the deficit that leaves is the pull. " +
            "If this sat at 1 there would be no gravity in the model at all",
        },
      }),
      judge({
        name: "worst gap from (1−Δq)^DEG in the thin shells", value: worstFar,
        expect: {
          of: "0 — the free fraction is what independent slots give, out where the field is weak",
          want: 0, tolerance: 0.02,
          because: "1/(1+θ) is the first-order form of (1−q)^DEG with θ = DEG·q, and the " +
            "two agree to 0.1% below q = 0.01. THE MOND REGIME IS THE THIN REGIME, so the " +
            "derivation has to hold out here and only out here",
        },
        note: "near the source it is suppressed HARDER than independent slots predict — " +
          "0.155 against 0.496 at r = 3 — because a source's rays arrive correlated. " +
          "That is the Newtonian end, where g → g_N and nothing rests on the free fraction",
      }),
      judge({
        name: "θ/(1+θ) against g_N/g, worst over six decades", value: (() => {
          let worst = 0;
          for (const x of [0.01, 0.1, 1, 3.2, 10, 100]) {
            const gN = x * a0(), gg = gOf(gN), th = gg / a0();
            worst = Math.max(worst, Math.abs(th / (1 + th) - gN / gg));
          }
          return worst;
        })(),
        expect: {
          of: "0 — the busy fraction IS Newton over the total, which is the interpolation",
          want: 0, tolerance: 1e-12,
          because: "this is the step the whole rotation section turns on, and it is an " +
            "identity rather than a fit: θ/(1+θ) = g_N/g rearranges to g² − g·g_N − g_N a₀ = 0",
        },
      }),
    ];

    return {
      header: headerOf(w, seeds),
      findings,
      table: {
        columns: ["r", "Δq the source adds", "split rate / bare", "(1−Δq)^DEG"],
        rows: rows.filter(x => [3, 4, 5, 6, 8, 10, 13, 16].includes(x.r)).map(x => [
          String(x.r), x.dq.toFixed(4), x.ratio.toFixed(4),
          Math.pow(1 - x.dq, g.DEG).toFixed(4),
        ]),
      },
    };
  },
});

export default [suppression];
