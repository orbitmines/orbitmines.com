/**
 * THE HIGH-REDSHIFT DISCS — the sharpest test the rotation-curve arc faces, and the
 * one it nearly failed.
 *
 * Genzel and co. measure massive discs at z = 0.85–2.24 with DECLINING outer curves
 * and a dark-matter fraction inside one effective radius of f_DM < 0.2. A declining
 * curve is what Newton gives and what a boosted law does not, so this is where the
 * model is most exposed.
 *
 * THE BAND, WHICH IS THE HONEST FRAME. f_DM < 0.2 is an UPPER LIMIT, not a
 * measurement, so what it fixes is a band rather than a number. Writing v_obs² =
 * v_bar²/(1 − f_DM), the boost v_obs/v_bar is 1/√(1 − f_DM): Newton sits at the bottom
 * of that band by construction, at f_DM = 0, and any boosted law sits somewhere above.
 * WHICH THEORY IS CLOSER DEPENDS ON WHERE IN THE BAND THE TRUTH IS, and saying "four of
 * five overshoot" is an adjective rather than a measurement.
 *
 * AND THE ARC RECORDS GETTING THIS WRONG, twice, which is why it is worth checking
 * rather than quoting. A first reading made a₀ a clock reading, c/2πt, three times
 * larger at z = 2 — a dated prediction MOND cannot make, and one these discs refuse.
 * a₀ is a function of the field at the point, so it is LOCAL and does not move with
 * redshift; that removes the refutation and does not make the discs agree. A second
 * pass took g_N = GM/R_e² — a point mass, where these are DISCS, which at one effective
 * radius enclose about half their mass. The shortcut was generous in exactly the
 * direction that made the model pass.
 */

import { World, headerOf, judge, Finding } from "../DISCRETE";
import { a0, gOf } from "../TRANSPORT";
import { test } from "../SUITE";

/** what a dark-matter fraction inside R_e implies for the boost over the baryons */
const boostOf = (fDM: number) => 1 / Math.sqrt(1 - fDM);

/** and what boost the transport law gives at a given depth into the regime */
const boostAt = (gNoverA0: number) => Math.sqrt(gOf(gNoverA0, 1) / gNoverA0);

export const discs = test({
  id: "cosmology/high-redshift-discs",
  claims: "f_DM < 0.2 fixes a BAND rather than a number, Newton sits at its floor by " +
    "construction, and the transport law is refused only below a derivable depth",
  cited: ["the sharpest test, and it nearly failed",
    "and whether any of that is dark matter"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const CEIL = boostOf(0.2);

    /*
     * THE DEPTH AT WHICH THE LAW BREACHES THE CEILING, solved rather than scanned:
     * boost = √(g/g_N) = 1.118 needs g/g_N = 1.25, and g/g_N = ½ + √(¼ + a₀/g_N), so
     * a₀/g_N = 0.3125 and g_N = 3.2 a₀. A disc whose baryons give MORE acceleration
     * than that at R_e is consistent with the limit; one below it is not.
     */
    const want = CEIL * CEIL;                       // g/g_N at the ceiling
    const threshold = 1 / ((want - 0.5) ** 2 - 0.25);

    /** Newton's error against the truth, at each place the truth could be in the band */
    const rows = [0, 0.05, 0.1, 0.15, 0.2].map(f => {
      const truth = boostOf(f);
      return { f, truth, newton: (1 - truth) / truth };
    });

    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "the ceiling f_DM < 0.2 puts on the boost", value: CEIL,
        expect: {
          of: "1.1180 = 1/√(1 − 0.2)",
          want: 1 / Math.sqrt(0.8), tolerance: 1e-9,
          because: "the whole comparison is against this number, and it is a definition " +
            "rather than a measurement — so getting it exactly right is the cheapest " +
            "thing in the section and the one everything else is quoted against",
        },
      }),
      judge({
        name: "Newton's error at f_DM = 0.10", value: rows[2].newton,
        expect: {
          of: "−5.1% — Newton is at the band's floor, so he is wrong by the band",
          want: Math.sqrt(0.9) - 1, tolerance: 1e-6,
          because: "Newton predicts no boost at all, so his error IS the dark-matter " +
            "fraction expressed as a velocity — which is the sense in which he sits at " +
            "the bottom of the band by construction rather than by fitting well",
        },
      }),
      judge({
        name: "Newton's error at f_DM = 0.20", value: rows[4].newton,
        expect: {
          of: "−10.6% — at the top of the band Newton is as wrong as the model is at the bottom",
          want: Math.sqrt(0.8) - 1, tolerance: 1e-6,
          because: "which is the point: an upper limit cannot single out a winner, and " +
            "the arc's own 'four of five overshoot' is an adjective",
        },
      }),
      judge({
        name: "g_N/a₀ at which the law breaches the ceiling", value: threshold,
        expect: {
          of: "3.2 — above this depth the transport law is consistent with f_DM < 0.2",
          want: 3.2, tolerance: 0.02,
          because: "this turns 'four of five overshoot' into a statement about a MEASURABLE " +
            "property of each disc — its baryonic acceleration at one effective radius — " +
            "rather than about a count of galaxies, and it is falsifiable per object",
        },
        note: "a disc whose baryons give more than 3.2 a₀ at R_e is allowed; one below it " +
          "is refused, whatever its redshift — a₀ is local, so nothing here moves with z",
      }),
    ];

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["f_DM", "boost the truth would need", "Newton's error", "g_N/a₀ giving it"],
        rows: rows.map(r => {
          const gg = r.truth * r.truth;
          const need = gg > 1 ? 1 / ((gg - 0.5) ** 2 - 0.25) : Infinity;
          return [
            r.f.toFixed(2), r.truth.toFixed(4),
            `${(100 * r.newton).toFixed(1)}%`,
            Number.isFinite(need) ? need.toFixed(2) : "—",
          ];
        }),
      },
    };
  },
});

export default [discs];
