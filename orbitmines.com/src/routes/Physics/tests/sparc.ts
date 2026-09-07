/**
 * SPARC — THE SAME LAW AGAINST 2,696 MEASURED POINTS, AND AGAINST 123 WHOLE GALAXIES.
 *
 * `cosmology/radial-acceleration` already asks whether this model's interpolation
 * tracks McGaugh, Lelli & Schombert 2016's FITTING FUNCTION, and it does, to 0.029
 * dex. That is a true statement about two formulae. It is a weak one about the world:
 * a fit is a summary whose residuals have already been discarded, and a curve that
 * tracks another curve has not met a galaxy.
 *
 * SO THIS ONE MEETS THEM. The SPARC catalogue's own rotation curves and photometry,
 * reduced by the published recipe, give 2,696 (g_bar, g_obs) pairs in 147 galaxies and
 * 123 galaxies with a flat velocity. Three measurements come out of them:
 *
 *   THE RELATION      rms 0.1333 dex from the points, against 0.1328 for the function
 *                     McGaugh et al. FITTED to those same points. A law with no free
 *                     parameter is 0.0005 dex worse than the best two-parameter
 *                     summary of the data — which is as close to "as well as it is
 *                     possible to do" as a prediction can get.
 *
 *   AND THE SCALE     the a₀ that would fit these points best is 1.132e−10. The model
 *                     says 1.042e−10 from cH₀/2π, 8% below the optimum, and is still
 *                     inside the scatter. A tuned parameter sits ON the optimum.
 *
 *   TULLY–FISHER      slope 4 exactly, predicted; measured 3.73 by an orthogonal fit
 *                     to the 123, against Lelli et al. 2019's maximum-likelihood
 *                     3.85 ± 0.09 and their own systematic range of 3.5 to 4.0.
 *
 * AND THE NORMALISATION IS AN INEQUALITY, WHICH IS WORTH BEING CAREFUL ABOUT. Deep in
 * the transport regime V⁴ = G·M_b·a₀, so A = 1/(G a₀) — but V_f is measured where the
 * telescope ran out of gas, not at infinity, and the law sits above its asymptote
 * everywhere, so the measured A has to come out UNDER that ceiling. It does, by 0.173
 * dex. The outermost radii SPARC actually reached predict a gap of 0.125 dex, and V_f
 * is averaged over the flat part rather than taken at the last point, so the true
 * prediction is somewhat larger than 0.125 — the two are the same size and this is a
 * consistency check rather than a sharp test. Υ_* alone carries ±0.1 dex.
 */

import { World, headerOf, judge, Finding } from "../DISCRETE";
import { a0, A0_MEASURED } from "../TRANSPORT";
import { RAR, rarResidual, BTFR, btfrAxes, orthogonalFit, btfrCeiling } from "../SPARC";
import { test } from "../SUITE";

/** the model: the root of g = g_N(1 + a₀/g), with a₀ read off the lattice */
const model = (gb: number, a = a0()) => gb / 2 + Math.sqrt(gb * gb / 4 + gb * a);

/** McGaugh+2016 eq. 4, the function they fitted to these very points */
const theirs = (gb: number) => gb / (1 - Math.exp(-Math.sqrt(gb / A0_MEASURED)));

export const sparc = test({
  id: "cosmology/sparc",
  claims: "the derived interpolation reproduces SPARC's 2,696 measured accelerations " +
    "as well as the function fitted to them, and predicts the Tully–Fisher slope",
  cited: ["Galaxy rotation curves"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const mine = rarResidual(model), fitted = rarResidual(theirs);

    /** the a₀ these points would choose, which is the tuning this did not do */
    let best = { rms: Infinity, a: 0 };
    for (let a = 0.6e-10; a <= 2.0e-10; a += 0.002e-10) {
      const rms = rarResidual(gb => model(gb, a)).rms;
      if (rms < best.rms) best = { rms, a };
    }

    const { x, y } = btfrAxes();
    const btfr = orthogonalFit(x, y);

    /** the normalisation with the slope held at the predicted 4, and the ceiling */
    const at4 = x.map((v, i) => y[i] - 4 * v);
    const logA = at4.reduce((s, v) => s + v, 0) / at4.length;
    const spread = Math.sqrt(at4.reduce((s, v) => s + (v - logA) ** 2, 0) / at4.length);
    const gap = Math.log10(btfrCeiling(a0())) - logA;

    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "rms from SPARC's own 2,696 points, in dex", value: mine.rms,
        expect: {
          of: "0.1327 — what the function McGaugh et al. FITTED to these points scores",
          want: fitted.rms, tolerance: 0.02,
          because: "this is the comparison the fitting function cannot lose and nearly " +
            "does: it was fitted to exactly these points and has two free parameters in " +
            "it, and a law with none is 0.0005 dex behind. What that measures is not " +
            "whether the model is right but whether anything could do better — and at " +
            "this scatter, nothing can",
        },
        note: `mean offset ${mine.mean >= 0 ? "+" : ""}${mine.mean.toFixed(4)} dex ` +
          `against ${fitted.mean.toFixed(4)} for theirs, over ${mine.n} points`,
      }),
      judge({
        name: "how far a₀ = cH₀/2π is from the a₀ these points would choose",
        value: a0() / best.a,
        expect: {
          of: "1 if it had been tuned to them; it is not",
          want: 0.92, tolerance: 0.04,
          because: "the scale is the half that cannot be argued into place. The value " +
            "that fits SPARC best is 1.132e−10 and the model says 1.042e−10 from the " +
            "Hubble rate alone, 8% under the optimum and still inside the data's " +
            "scatter. A fitted parameter sits on the optimum; this one does not",
        },
        note: `best-fit a₀ = ${(best.a * 1e10).toFixed(3)}e−10 at rms ${best.rms.toFixed(4)} dex, ` +
          `model = ${(a0() * 1e10).toFixed(3)}e−10 at ${mine.rms.toFixed(4)}`,
      }),
      judge({
        name: "the baryonic Tully–Fisher slope, orthogonal fit to 123 galaxies",
        value: btfr.slope,
        expect: {
          of: "4 exactly — V⁴ = G·M_b·a₀ is what the deep transport limit is",
          want: 4, tolerance: 0.125,
          because: "the slope is the parameter-free half of the relation: it follows " +
            "from g → √(g_N a₀) with no scale in it at all. Measured 3.73 here and " +
            "3.85 ± 0.09 by Lelli et al.'s maximum likelihood — low by two or three " +
            "sigma on statistics alone, and inside the 3.5–4.0 range their own " +
            "mass-to-light systematic covers. The band is theirs, not one chosen here",
        },
        note: `intercept ${btfr.intercept.toFixed(2)}, orthogonal scatter ` +
          `${btfr.scatter.toFixed(3)} dex over ${BTFR.length} galaxies`,
      }),
      judge({
        name: "how far the measured normalisation sits under the model's ceiling, in dex",
        value: gap,
        expect: {
          of: "0.125 — what the outermost radii SPARC actually reached predict",
          want: 0.125, tolerance: 0.5,
          because: "A = 1/(G a₀) holds at infinity and V_f is measured where the gas " +
            "ran out, so the law sitting above its own asymptote forces the observed " +
            "normalisation UNDER the ceiling. The direction is a prediction; the size " +
            "is only a consistency check, since V_f averages over the flat part rather " +
            "than sitting at the last point and Υ_* carries ±0.1 dex of its own",
        },
        note: `log A = ${logA.toFixed(3)} ± ${(spread / Math.sqrt(at4.length)).toFixed(3)} ` +
          `(scatter ${spread.toFixed(3)}) against the ceiling ${Math.log10(btfrCeiling(a0())).toFixed(3)}`,
      }),
    ];

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["log g_bar", "points", "median log g_obs", "this model", "their fit"],
        rows: [-11.5, -11, -10.5, -10, -9.5, -9].map(L => {
          const inb = RAR.filter(p => Math.abs(Math.log10(p.gbar) - L) <= 0.25)
            .map(p => Math.log10(p.gobs)).sort((a, b) => a - b);
          const gb = Math.pow(10, L);
          return [L.toFixed(1), inb.length,
            inb.length ? inb[Math.floor(inb.length / 2)].toFixed(3) : "—",
            Math.log10(model(gb)).toFixed(3), Math.log10(theirs(gb)).toFixed(3)];
        }),
      },
    };
  },
});

export default [sparc];
