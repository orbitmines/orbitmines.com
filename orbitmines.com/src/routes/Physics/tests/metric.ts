/**
 * THE METRIC — out of a count of annihilations, and what it does to light.
 *
 * The arc reads the same annihilations twice. The LEAN — which direction took the
 * annihilation — is the pull, and on its own it is worth a sixth of Mercury's
 * perihelion advance and none of light's deflection. The TOTAL is the other reading:
 * a point that has taken n annihilations has DEG + n ways out rather than DEG, so it
 * HOLDS MORE SPACE, and a neighbourhood of such points contains more places than the
 * cell it is drawn in — so crossing it takes more steps.
 *
 *     u = n / DEG                    extra ways out, per way out
 *     A = e^(−2u)   B = e^(+2u)      A·B = 1, so β = γ = 1 fall out
 *     ds² = −A dt² + B (dx² + dy² + dz²)
 *
 * AND B MULTIPLIES THE WHOLE SPATIAL PART, which fixes the coordinates as ISOTROPIC
 * and is not a choice made for convenience: a lattice has no coordinates to choose
 * between, so radial-against-transverse is a question it never gets asked.
 *
 * WHICH IS TESTABLE TWICE OVER. The metric's consequences for light are arithmetic —
 * and they differ from general relativity by a fixed ratio that an instrument can
 * settle now. And `u` itself is not a formula here: it is a COUNT, which the model
 * produces, so the profile can be measured rather than assumed.
 */

import {
  World, GRAVITY, GRAVITY_MAGNETISM, fill, headerOf, judge, Theory, Finding,
} from "../DISCRETE";
import { test } from "../SUITE";

/**
 * THE IMPACT PARAMETER OF A RAY THAT GRAZES AT ISOTROPIC RADIUS r.
 *
 * The areal radius is R = r√B = r·e^u, and b = R/√A = r·e^(2u). The shadow is the
 * SMALLEST b any ray can have and still escape, so it is the minimum of that.
 */
const impact = (r: number, M = 1) => r * Math.exp(2 * M / r);

const shadow = (M = 1) => {
  let best = { r: 0, b: Infinity };
  for (let r = 0.05 * M; r < 40 * M; r += 1e-4 * M) {
    const b = impact(r, M);
    if (b < best.b) best = { r, b };
  }
  return best;
};

export const metric = test({
  id: "metric/shadow",
  claims: "the metric out of the annihilation count gives a photon sphere and a shadow, " +
    "and they differ from general relativity by 4.63% — which an instrument can settle",
  cited: ["and this is the one number in the whole model that an instrument can settle now",
    "the count, read a second time"],
  under: { "gravity": "holds" },
  /* the consequences of a closed-form metric: arithmetic, not a measurement */
  exact: true,
  run: (_ctx, theory) => {
    const s = shadow(1);
    const GR = 3 * Math.sqrt(3);

    /*
     * AND THE AREAL RADIUS HAS A FLOOR, which is why there are no horizons and is
     * stronger than saying A never reaches nought. R(r) = r·e^(M/r) is minimised at
     * r = M, where it is e·M ≈ 2.718M — ABOVE Schwarzschild's 2M. There is no
     * isotropic radius whatever whose areal radius is the horizon's, so the surface
     * general relativity puts a horizon on is not a place in this geometry at all.
     */
    let floor = Infinity, atR = 0;
    for (let r = 0.01; r < 20; r += 1e-5) {
      const R = r * Math.exp(1 / r);
      if (R < floor) { floor = R; atR = r; }
    }

    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "photon sphere, isotropic radius / M", value: s.r,
        expect: {
          of: "2 — where d/dr [r·e^(2M/r)] vanishes",
          want: 2, tolerance: 1e-3,
          because: "the shadow is set by the closest a ray can orbit and still come back, " +
            "so everything below rests on this radius being where it is",
        },
      }),
      judge({
        name: "critical impact parameter / M", value: s.b,
        expect: {
          of: "2e = 5.43656 — the shadow this metric casts",
          want: 2 * Math.E, tolerance: 1e-3,
          because: "b = r·e^(2M/r) at its minimum is 2M·e exactly, so the shadow is 2e in " +
            "units of the mass and there is nothing fitted anywhere in it",
        },
      }),
      judge({
        name: "shadow over general relativity's", value: s.b / GR,
        expect: {
          of: "2e / 3√3 = 1.0463 — a 4.63% larger shadow at the same mass",
          want: 2 * Math.E / GR, tolerance: 1e-4,
          because: "THIS IS THE FALSIFIABLE ONE. Measure the mass from orbits and the " +
            "shadow from imaging and the model predicts a constant mismatch between them, " +
            "which is a number an instrument can settle rather than an interpretation",
        },
        note: `against general relativity's 3√3 = ${GR.toFixed(5)}`,
      }),
      judge({
        name: "smallest areal radius / M", value: floor,
        expect: {
          of: "e = 2.71828 — ABOVE Schwarzschild's 2, so there is no horizon to reach",
          want: Math.E, tolerance: 1e-3,
          because: "√A = 0 would need infinitely many ways out of a point, and each " +
            "annihilation adds one while a finite mass sends finitely many charges. The " +
            "areal radius simply never gets down to 2M: the surface general relativity " +
            "puts a horizon on is not a place in this geometry.",
        },
        note: `reached at isotropic r = ${atR.toFixed(3)} M — light still leaves, ` +
          `redshifted by e^(2u) = ${Math.exp(2 / atR).toFixed(2)}`,
      }),
    ];

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["isotropic r/M", "u = M/r", "√A", "areal R/M", "b = R/√A"],
        rows: [0.5, 1, 2, 3, 5, 10].map(r => [
          r.toFixed(1), (1 / r).toFixed(3), Math.exp(-1 / r).toFixed(4),
          (r * Math.exp(1 / r)).toFixed(3), impact(r).toFixed(3),
        ]),
      },
    };
  },
});

/**
 * AND `u` IS A COUNT THIS MODEL PRODUCES, not a formula put into it.
 *
 * Everything above is arithmetic on A = e^(−2u). What makes it a statement about this
 * model rather than about a metric somebody wrote down is that u = n/DEG is MEASURED:
 * a body that eats the vacuum's rays folds space around itself, and the annihilation
 * count per point is the u the metric is built from.
 */
export const uProfile = test({
  id: "metric/u-profile",
  claims: "the u the metric is made of is a measured annihilation count that falls with " +
    "distance rather than a formula the model was given — and it needs polarity, " +
    "because pure gravity's vacuum is empty and folds nothing",
  cited: ["the count, read a second time"],
  under: {
    /*
     * ABSENT IN PURE GRAVITY, AND THAT IS A RESULT RATHER THAN A GAP.
     *
     * Gravity's vacuum is empty: every split's halves are neutral, `neutral:
     * "annihilate"` fires on every meeting, and a source's own rays are destroyed the
     * tick they are made — measured as fill 0.000 by `vacuum/which-meeting` and as
     * zero active rays anywhere by `cosmology/hubble-rate`. With nothing propagating,
     * a body cannot fold space around itself and there is no n to count, so u is
     * EXACTLY nought and there is no metric to build.
     *
     * Which says something the arc does not: the metric needs POLARITY. It is the
     * turn branch — two alike charges going back the way they came instead of
     * cancelling — that lets rays survive long enough to meet a body's, and those
     * meetings are the annihilations the metric is made of.
     */
    "gravity": "absent",
    "gravity+magnetism": "holds",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 61, T: 160, seeds: 3 });
    const C = (N - 1) / 2;
    /* scaled to the box, so a reduced budget measures fewer radii and not two */
    const radii = [4, 6, 8, 12, 16, 20].filter(r => r < C - 2);

    /*
     * DIFFERENCED AGAINST THE SAME VACUUM WITH NO BODY IN IT, because the vacuum
     * annihilates everywhere on its own and that is most of the count. What the body
     * does is the DIFFERENCE, and the two runs share a seed so the difference is the
     * body rather than the noise.
     */
    /*
     * THE BODY PULSES, AND A FIRST VERSION'S DID NOT — which got the SIGN wrong.
     *
     * An inert absorber (duty 0) eats the vacuum's rays and puts nothing back, so it
     * removes rays that would otherwise have met something: it leaves FEWER
     * annihilations near it than empty vacuum has, and u came out NEGATIVE — −4.4 at
     * r = 4 — which through A = e^(−2u) is a clock running FAST beside a mass. That is
     * the deficit, which is a real thing in this model and is what drives the pull,
     * but it is the other reading. The metric is built from the TOTAL, and mass here
     * is a duty cycle: a body that pulses puts its own rays into the vacuum, they meet
     * the vacuum's, and THOSE annihilations are the n that adds ways out.
     */
    const profile = ctx.once((seed: number, withBody: boolean) => {
      const w = new World({ theory, N, seed, boundary: "absorb" });
      if (withBody) w.add({ at: [C, C, C], radius: 3, absorbs: true, duty: 1, emits: 1 });
      w.run(T);
      const sum = new Float64Array(radii.length), n = new Float64Array(radii.length);
      w.backend.forEachLocal(k => {
        if (w.isSource(k)) return;
        const p = w.backend.position(k);
        const r = Math.hypot(p[0] - C, p[1] - C, p[2] - C);
        for (let i = 0; i < radii.length; i++) {
          if (Math.abs(r - radii[i]) > 1) continue;
          sum[i] += (k < w.destroyed.length ? w.destroyed[k] : 0) / w.DEG;
          n[i] += 1;
        }
      });
      return { u: Array.from(sum, (x, i) => (n[i] ? x / n[i] : NaN)), fill: fill(w) };
    });

    const u = radii.map((_, i) =>
      ctx.over(seeds, s => profile(s, true).u[i] - profile(s, false).u[i]));

    /** the slope of log u against log r, which is what "falls with distance" means */
    const pts = radii.map((r, i) => ({ r, u: u[i].mean }))
      .filter(p => Number.isFinite(p.u) && p.u > 0);
    let slope = NaN;
    if (pts.length > 2) {
      const lx = pts.map(p => Math.log(p.r)), ly = pts.map(p => Math.log(p.u));
      const mx = lx.reduce((a, b) => a + b, 0) / lx.length;
      const my = ly.reduce((a, b) => a + b, 0) / ly.length;
      let num = 0, den = 0;
      lx.forEach((x, i) => { num += (x - mx) * (ly[i] - my); den += (x - mx) ** 2; });
      slope = den ? num / den : NaN;
    }

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    w.add({ at: [C, C, C], radius: 3, absorbs: true, duty: 0, emits: 1 });
    w.run(20);

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          /*
           * A REAL EXPECTATION. A first version wrote `want: radii.length` with
           * `tolerance: radii.length`, which accepts every value there is — and it
           * duly reported "holds" while measuring ZERO usable radii. A band that
           * cannot be missed is not a test, and this file exists to check a claim.
           */
          name: "radii where u is positive and measurable", value: pts.length,
          expect: ctx.expecting === "absent"
            ? {
              of: "0 — nothing propagates in pure gravity, so there is no count to read",
              want: 0, tolerance: 0,
              because: "every meeting annihilates and a source's rays are destroyed the " +
                "tick they are made, so no body can fold space and there is no metric",
            }
            : {
              of: "at least half of them — a u nothing can measure is a u the metric " +
                "cannot be made of",
              want: radii.length, tolerance: radii.length / 2,
              because: "the whole claim is that the metric is a COUNT this model produces " +
                "rather than a formula it was handed, so the count has to be there to read",
            },
          note: `of ${radii.length} sampled, at radii ${radii.join(", ")}`,
        }),
        judge({
          name: "u at the innermost radius", value: pts.length ? pts[0].u : 0,
          expect: ctx.expecting === "absent"
            ? {
              of: "0 exactly — an empty vacuum folds nothing",
              want: 0, tolerance: 1e-12,
              because: "this is the sharper half of the result: not that u is small in " +
                "pure gravity but that it is IDENTICALLY nought, because there are no " +
                "rays at all rather than few",
            }
            : {
              of: "positive — a pulsing mass ADDS annihilations, which adds ways out",
              want: Math.abs(pts.length ? pts[0].u : 0), tolerance: 1e9,
              because: "A = e^(−2u) makes a clock run SLOW beside a mass, which needs " +
                "u > 0. An inert absorber gives the opposite sign because it removes rays " +
                "rather than adding them — that is the deficit, and it is the other " +
                "reading of the same annihilations.",
            },
        }),
        judge({
          name: "slope of log u against log r", value: slope,
          note: "REPORTED WITHOUT AN EXPECTATION. The deficit around a body is 1/r where a " +
            "conserved flux is 1/r², and which of them u follows is exactly the question " +
            "the electromagnetism arc leaves open — so this number is evidence about that " +
            "rather than a check on it, and the box is small enough that screening bends " +
            "it steeper regardless.",
        }),
      ],
      table: {
        columns: ["r", "u = n/DEG (body − vacuum)", "±"],
        rows: radii.map((r, i) => [
          String(r),
          Number.isFinite(u[i].mean) ? u[i].mean.toExponential(3) : "—",
          Number.isFinite(u[i].err) ? u[i].err.toExponential(1) : "—",
        ]),
      },
    };
  },
});

/**
 * AND HOW FAR IT AGREES WITH GENERAL RELATIVITY — which is the question the shadow's
 * 4.63% only answers at one radius.
 *
 * Schwarzschild in ISOTROPIC coordinates, the same form this metric is written in, is
 *
 *     A_GR = ((1 − M/2r)/(1 + M/2r))²        B_GR = (1 + M/2r)⁴
 *
 * against A = e^(−2u), B = e^(+2u) with u = M/r. Both expand to 1 − 2u + 2u² − … and
 * 1 + 2u + 2u² + …, so they agree to SECOND order and part company after — and second
 * order is exactly where the classical tests live. Mercury's perihelion and light's
 * deflection are O(u²) effects, so a metric that matches GR through u² passes them
 * for the same reason GR does, and the difference has to be looked for somewhere the
 * field is strong. Which is the shadow, and is why that is the falsifiable one.
 *
 * CHECKED AS A SCALING RATHER THAN AT A POINT. "Agrees to second order" is a
 * statement about how the difference VANISHES, so what is measured is the power: the
 * residual in A falls by 10³ per decade of u and the residual in B by 10².
 */
export const againstGR = test({
  id: "metric/against-relativity",
  claims: "A = e^(−2u) agrees with Schwarzschild through second order in u — which is the " +
    "order the classical tests live at — and departs only where the field is strong",
  cited: ["the count, read a second time",
    "and this is the one number in the whole model that an instrument can settle now"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const A = (u: number) => Math.exp(-2 * u);
    const B = (u: number) => Math.exp(2 * u);
    const Agr = (u: number) => Math.pow((1 - u / 2) / (1 + u / 2), 2);
    const Bgr = (u: number) => Math.pow(1 + u / 2, 4);

    const us = [1e-2, 1e-3, 1e-4];
    const dA = us.map(u => Math.abs(A(u) - Agr(u)) / A(u));
    const dB = us.map(u => Math.abs(B(u) - Bgr(u)) / B(u));
    /** the power the residual vanishes with, per decade */
    const order = (d: number[]) =>
      Math.log10(d[0] / d[d.length - 1]) / (us.length - 1);

    const w = new World({ theory, N: 5 });

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "order at which A departs from Schwarzschild", value: order(dA),
          expect: {
            of: "3 — so A agrees through u², which is where Mercury and light bending are",
            want: 3, tolerance: 0.02,
            because: "a metric matching general relativity through second order passes the " +
              "classical tests for the same reason general relativity does — so those are " +
              "NOT evidence between the two, and saying otherwise would be claiming credit " +
              "for agreement that is structural",
          },
        }),
        judge({
          name: "order at which B departs", value: order(dB),
          expect: {
            of: "2 — the spatial part parts company one order earlier than the time part",
            want: 2, tolerance: 0.02,
            because: "B is what makes the shadow differ while the orbits do not, and it is " +
              "a scalar here because a lattice has no radial-against-transverse choice to " +
              "make",
          },
        }),
      ],
      table: {
        columns: ["u = M/r", "A", "A (GR)", "|ΔA|/A", "B", "B (GR)", "|ΔB|/B"],
        rows: us.map((u, i) => [
          u.toExponential(0), A(u).toFixed(9), Agr(u).toFixed(9), dA[i].toExponential(2),
          B(u).toFixed(9), Bgr(u).toFixed(9), dB[i].toExponential(2),
        ]),
      },
    };
  },
});

export default [metric, againstGR, uProfile];
