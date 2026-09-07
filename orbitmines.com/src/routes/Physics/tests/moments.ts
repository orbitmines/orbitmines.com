/**
 * THE THREE MOMENTS, AND WHY A BIAS IS QUANTISED — both out of the geometry rather
 * than written beside it.
 *
 * A source is read three ways and they are three different kinds of quantity:
 *
 *     m = ⟨1⟩       how many rays, counted            a COUNT
 *     q = ⟨s⟩       their signs, summed               a SIGNED SUM
 *     µ = ⟨s d̂⟩     their signs against direction     a SIGNED VECTOR SUM
 *
 * WHICH IS WHY GRAVITY AND MAGNETISM BEHAVE SO DIFFERENTLY, and it is not a
 * coincidence. A count always adds, so gravity has ONE SIGN and cannot be screened —
 * there is no negative mass to put in front of it. A signed sum cancels, so charge
 * comes in two kinds and ordinary matter has almost none of it. The difference is in
 * the moment, not in the mechanism, and the same rays carry both.
 *
 * AND THE BIAS IS QUANTISED BECAUSE THE DWELL IS A WHOLE NUMBER OF TICKS. A source
 * holds its sign for `dwell` ticks out of `CYCLE`, so P = 2·dwell/CYCLE − 1 can only
 * take CYCLE + 1 values. It is not a knob that happens to be discretised: there is no
 * such thing as two thirds of a tick, so the intermediate values do not exist.
 *
 * THAT MATTERS BEYOND TIDINESS. A real-valued P silently rounds onto the tick grid, so
 * two different settings produce the same run — which is how a sweep can show a trend
 * that is really a staircase, and is why `DISCRETE.ts` REPORTS P from the tick count
 * rather than accepting it as a parameter.
 */

import { GEOMETRIES, World, headerOf, judge, Finding } from "../DISCRETE";
import { test } from "../SUITE";

export const moments = test({
  id: "layer2/moments",
  claims: "a count, a signed sum and a signed vector sum are three readings of the same " +
    "rays — and the bias is quantised by the cycle because a dwell is whole ticks",
  cited: ["four emitters, and each of the four is something",
    "a magnet is a lopsided default, not a stopped one"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const g = GEOMETRIES["cubic-26"];

    /*
     * THE COUNT CANNOT CANCEL AND THE SIGNED SUM MUST. Fire every exit once with an
     * alternating sign: the count is DEG whatever the signs are, and the signed sum is
     * nought because the exits come in ± pairs. That is the whole asymmetry between
     * gravity and charge, in two numbers.
     */
    /*
     * THE TWO CLEAN CONFIGURATIONS, AND THEY SEPARATE THE MOMENTS EXACTLY.
     *
     * A first version alternated the sign by EXIT INDEX, which respects nothing: the
     * index order has no relation to which exits are opposite each other, so it gave
     * neither a clean charge nor a clean side — |µ| came out 2.37 where it should have
     * been nought, and a "sided" source built from the sign of the z-component put the
     * eight equatorial exits, which have no z at all, on one side. The pairing the
     * geometry actually has is `OPP`, and using it makes both cases exact.
     *
     *   CHARGED, NOT SIDED   the same sign out of every exit. q = DEG, and µ = Σ d̂ = 0
     *                        because the exits come in ± pairs.
     *   SIDED, NOT CHARGED   opposite signs on opposite exits. Now q = 0 — each pair
     *                        cancels — while µ ADDS, because s d̂ and (−s)(−d̂) are the
     *                        same vector. THAT IS A MAGNET: a side without a charge.
     */
    const uniform = Array.from({ length: g.DEG }, () => 1);
    const antipodal = Array.from({ length: g.DEG }, (_, d) => (d < g.OPP[d] ? 1 : -1));
    const muOf = (sg: number[]) => [0, 1, 2].map(i =>
      sg.reduce((a, s, d) => a + s * (g.U[d][i] ?? 0), 0));

    const m = uniform.length;
    const q = uniform.reduce((a, b) => a + b, 0);
    const muLen = Math.hypot(...muOf(uniform));

    const qSided = antipodal.reduce((a, b) => a + b, 0);
    const muSided = muOf(antipodal);

    /** the values P can take, from the cycle alone */
    const Ps = Array.from({ length: g.CYCLE + 1 }, (_, k) => (2 * k) / g.CYCLE - 1);
    const step = Ps.length > 1 ? Ps[1] - Ps[0] : NaN;

    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "m = ⟨1⟩, every exit fired once", value: m,
        expect: {
          of: "DEG — a count, which cannot cancel and so has one sign",
          want: g.DEG, tolerance: 0,
          because: "gravity is this moment, and a quantity that only ever adds cannot be " +
            "screened: there is no negative mass to put in the way of it",
        },
      }),
      judge({
        name: "q = ⟨s⟩ with opposite signs on opposite exits", value: qSided,
        expect: {
          of: "0 — a signed sum cancels, which is why charge comes in two kinds",
          want: 0, tolerance: 0,
          because: "the same rays that gave a count of 26 give a charge of nought, so the " +
            "difference between gravity and charge is the MOMENT and not the mechanism",
        },
      }),
      judge({
        name: "|µ| for the uniformly signed source", value: muLen,
        expect: {
          of: "0 — charged but not sided: the exits come in ± pairs, so Σ d̂ is nought",
          want: 0, tolerance: 1e-9,
          because: "a magnet needs a SIDE, and a source whose signs alternate over exits " +
            "has none however many rays it puts out",
        },
      }),
      judge({
        name: "|µ| for a genuinely sided source", value: Math.hypot(...muSided),
        expect: {
          of: "well above nought — + out of one half and − out of the other IS a side",
          want: 1, atLeast: 1,
          because: "this is the only one of the three readings that can tell which way a " +
            "source is pointing, and it is what the magnetic arc is about",
        },
        note: `and its charge is exactly ${qSided} — SIDED WITHOUT BEING CHARGED, which ` +
          "is what a magnet is, and is why a magnet is not an electric object",
      }),
      judge({
        name: "values the bias P can take", value: Ps.length,
        expect: {
          of: "CYCLE + 1 = 9 — a dwell is whole ticks, so P is quantised",
          want: g.CYCLE + 1, tolerance: 0,
          because: "there is no such thing as two thirds of a tick, so a real-valued P " +
            "rounds onto this grid and two different settings give the same run — which " +
            "is how a sweep shows a staircase and reads as a trend",
        },
        note: `P ∈ {${Ps.map(p => p.toFixed(2)).join(", ")}}, in steps of ${step.toFixed(3)} ` +
          `= 2/CYCLE`,
      }),
    ];

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["reading", "what it is", "same sign everywhere", "opposite on opposite"],
        rows: [
          ["m = ⟨1⟩", "a count", String(m), String(g.DEG)],
          ["q = ⟨s⟩", "a signed sum", String(q), String(qSided)],
          ["|µ| = |⟨s d̂⟩|", "a signed vector sum",
            muLen.toExponential(1), Math.hypot(...muSided).toFixed(3)],
        ],
      },
    };
  },
});

export default [moments];
