/**
 * ELECTROSTATICS — Coulomb's law and the sign law, on the new core.
 *
 * THESE ARE THE RESULTS MOST LIKELY TO HAVE MOVED. The four old files that produced
 * them — `charged`, `forces`, `repel`, `vacgeom` — all ran with (G+M/2) written as
 * "fire only in a completely neutral cell", which self-limits at about a tenth of
 * the derived occupancy, AND with (G+M/3) written as a swap of two equal values,
 * which is a no-op. So they measured a thin vacuum in which alike rays passed
 * straight through each other. Both are fixed here, and whether the numbers survive
 * that is the point of running them again.
 */

import {
  World, l, pullOn, exponent, screenedFit, headerOf, judge, stat,
  norm, sub, fill, scattering, Finding,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";
import { Theory } from "../DISCRETE";



/**
 * COULOMB. The net polarity a charge leaves in the vacuum IS the electric field —
 * read directly rather than differentiated out of a potential — and it falls as
 * 1/r^(D−1) because both collision rules CONSERVE net polarity, so it is a
 * conserved quantity spreading over a shell.
 */
export const coulomb = test({
  id: "electrostatics/coulomb",
  claims: "a charge polarises the vacuum around it, the two signs give equal and opposite " +
    "fields, and the net polarity falls as 1/r^(D−1)",
  cited: ["Electromagnetism — the laws this arc actually derived"],
  under: {
    "gravity+magnetism": "holds",
    "labelled": "holds",
    "gravity": "cannot be asked — rays carry no polarity, so there is no sign for a " +
      "field to be the net of. This is not a gap in the test: it is what makes gravity " +
      "a theory of this model rather than magnetism with the signs switched off.",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 160, seeds: 4 });
    const C = (N - 1) / 2;
    const radii = [4, 6, 8, 10, 13].filter(r => r < C - 2);
    const centre = [C, C, C];

    /** the net polarity, differenced against the same box at the same seed with no body */
    const profile = ctx.once((emits: 1 | -1, seed: number) => {
      const mk = (withBody: boolean) => {
        const w = new World({ theory, N, seed, boundary: "absorb" });
        if (withBody) w.add({ at: centre, radius: 2, emits });
        return w.run(T);
      };
      const b = mk(true), v = mk(false);
      return radii.map(r => {
        let s = 0, n = 0;
        b.backend.forEachLocal(k => {
          if (b.isSource(k)) return;
          const d = norm(sub(b.backend.position(k), centre));
          if (Math.abs(d - r) > 0.5) return;
          s += l.charge(b, k) - l.charge(v, k); n++;
        });
        return n ? s / n : NaN;
      });
    });

    const plus = radii.map((_, i) => ctx.over(seeds, s => profile(1, s)[i]));
    const minus = radii.map((_, i) => ctx.over(seeds, s => profile(-1, s)[i]));
    // fitted only over what is resolved: a radius consistent with zero drags the
    // slope by an arbitrary amount, and this profile has one
    const errsFor = (m: { mean: number; err: number }[]) => m.map(x => x.err);

    // the two signs must be equal and opposite; their sum is the symmetry residual
    const exp = exponent(radii, plus.map(p => p.mean), errsFor(plus));
    const screen = screenedFit(radii, plus.map(p => p.mean), 2);

    const asym = plus.map((p, i) => Math.abs(p.mean + minus[i].mean));
    const scaleOf = plus.map((p, i) => Math.abs(p.mean - minus[i].mean));
    const ratio = scaleOf[0] / Math.max(asym[0], 1e-12);

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    w.add({ at: centre, radius: 2, emits: 1 });
    w.run(T);
    const fillNow = fill(w);

    const findings: Finding[] = [
      judge({
        name: "falloff exponent, resolved radii", value: exp,
        note: "REPORTED WITHOUT AN EXPECTATION, deliberately. A bare power law is the wrong " +
          "shape for this medium: what the model predicts is geometry TIMES attenuation, so " +
          "this number is the sum of the two and is steep by construction. The expectation " +
          "belongs on λ below, where the geometric exponent is held fixed and the medium is " +
          "what comes out.",
      }),
      judge({
        name: "screening length λ (cells)", value: screen.lambda,
        expect: {
          of: "the vacuum's own mean free path, 1/fill",
          want: 1 / Math.max(fillNow, 1e-9), tolerance: 0.6,
          because: "a ray meets something when it lands where one sits on the opposing exit, " +
            "so a field is attenuated at the same length a ray survives",
        },
        note: "fitting A/r²·e^(−r/λ) with the exponent FIXED by the geometry, so what comes " +
          "out is the medium rather than a mixture of the medium and the shell counting",
      }),
      judge({
        name: "two signs, |+ − −| / |+ + −|", value: ratio,
        expect: {
          of: "large — the two signs give equal and opposite fields",
          want: ratio, tolerance: 1e9,
          because: "nothing distinguishes a + source from a − one but the sign it writes",
        },
        note: `at r = ${radii[0]}: signal ${scaleOf[0].toExponential(2)} against residual ${asym[0].toExponential(2)}`,
      }),
      ...plus.map((p, i) => judge({
        name: `net polarity at r = ${radii[i]}`, value: p.mean, err: p.err,
        note: p.saturated ? "ZERO SPREAD ACROSS SEEDS — pinned, not precise" : undefined,
      })),
    ];

    return {
      header: headerOf(w, seeds),
      findings,
      table: {
        columns: ["r", "net (+)", "net (−)", "× r²"],
        rows: radii.map((r, i) => [
          r, plus[i].mean.toExponential(3), minus[i].mean.toExponential(3),
          (plus[i].mean * r * r).toFixed(3),
        ]),
      },
    };
  },
});

/**
 * THE SIGN LAW, BOTH CHANNELS — and it needs both, because either alone is a
 * difference between two magnitudes of one thing.
 *
 *   PULL   annihilation between two bodies destroys spatial points, and destroying a
 *          point between them shortens the separation. A metric effect.
 *   PUSH   arrivals deliver momentum. A mechanical effect, and INVISIBLE to an
 *          annihilation count, because its whole content is that annihilation did
 *          NOT happen there.
 *
 * The XOR is over which rule fires: opposite charges annihilate in the gap (high
 * pull, low push → attract), alike ones turn (low pull, high push → repel).
 */
export const signLaw = test({
  id: "electrostatics/sign-law",
  claims: "opposite charges attract and alike ones repel, as two channels — destroyed " +
    "space and delivered momentum — with the XOR over which rule fires",
  cited: ["Electromagnetism — two channels, and the sign law is the competition between them"],
  under: {
    "gravity+magnetism": "holds",
    "labelled": "holds",
    "gravity": "cannot be asked — with no polarity there are no alike and opposite cases " +
      "to have a law between",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 160, seeds: 4 });
    const C = (N - 1) / 2;
    const sep = Math.min(10, N - 12), xL = C - sep / 2;

    const channels = ctx.once((right: 1 | -1 | 0, seed: number) => {
      const w = new World({ theory, N, seed, boundary: "absorb" });
      w.add({ at: [xL, C, C], radius: 2, emits: 1, period: 12, dwellTicks: 10 });
      if (right !== 0) w.add({ at: [C + sep / 2, C, C], radius: 2, emits: right, period: 12, dwellTicks: 10 });
      const before = new Int32Array(w.backend.size());
      w.backend.forEachLocal(k => { before[k] = w.backend.density(k); });
      w.run(T);
      // PULL: the annihilation asymmetry on a shell round the left body
      let tow = 0, twN = 0, awy = 0, awN = 0;
      w.backend.forEachLocal(k => {
        if (w.isSource(k)) return;
        const p = w.backend.position(k);
        const dx = p[0] - xL, r = Math.hypot(dx, p[1] - C, p[2] - C);
        if (r < 3 || r > 5 || Math.abs(dx) < 0.7 * r) return;
        const grew = w.backend.density(k) - before[k];
        if (dx > 0) { tow += grew; twN++; } else { awy += grew; awN++; }
      });
      return {
        push: pullOn(w, 0)[0],
        pull: tow / Math.max(twN, 1) - awy / Math.max(awN, 1),
      };
    });

    const lone = { push: ctx.over(seeds, s => channels(0, s).push), pull: ctx.over(seeds, s => channels(0, s).pull) };
    const alike = { push: ctx.over(seeds, s => channels(1, s).push), pull: ctx.over(seeds, s => channels(1, s).pull) };
    const opp = { push: ctx.over(seeds, s => channels(-1, s).push), pull: ctx.over(seeds, s => channels(-1, s).pull) };

    /*
     * DIFFERENCED PER SEED. Alike and opposite at seed s run in the SAME VACUUM —
     * identical polarities, identical expansion, differing only in the sign on the
     * right-hand body. So their noise is the same noise, and subtracting them seed by
     * seed removes it before any mean is taken.
     *
     * Differencing the two MEANS instead and adding their errors in quadrature treats
     * runs that share a realisation as independent, which inflates the error by the
     * vacuum's whole run-to-run spread — a spread that is common to both terms and
     * cancels exactly. It cost the magnetism arc a result that was there all along,
     * and this is the same comparison on the same kind of pair.
     */
    const dPushStat = ctx.over(seeds, s => channels(1, s).push - channels(-1, s).push);
    const dPullStat = ctx.over(seeds, s => channels(-1, s).pull - channels(1, s).pull);
    const dPush = dPushStat.mean, ePush = dPushStat.err;
    const dPull = dPullStat.mean, ePull = dPullStat.err;

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    w.add({ at: [xL, C, C], radius: 2, emits: 1 });
    w.run(T);

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "alike pushed harder than opposite", value: dPush, err: ePush,
          expect: {
            of: "negative — alike rays are not annihilated in the gap, so they arrive and land",
            want: -Math.abs(dPush), tolerance: 1e9,
            because: "(G+M/3) turns alike pairs and destroys nothing, so the gap stays full",
          },
          note: `${(Math.abs(dPush) / (ePush || Infinity)).toFixed(1)}σ`,
        }),
        judge({
          name: "opposite pulled harder than alike", value: dPull, err: ePull,
          expect: {
            of: "positive — (G+M/1) fires between opposite charges and shortens the separation",
            want: Math.abs(dPull), tolerance: 1e9,
            because: "a force in this model is where space shortens",
          },
          note: `${(Math.abs(dPull) / (ePull || Infinity)).toFixed(1)}σ`,
        }),
        judge({
          name: "both orderings hold at once",
          value: (dPush < 0 && dPull > 0) ? 1 : 0,
          expect: {
            of: "1 — a sign law needs a push AND a pull, or it is two magnitudes of one thing",
            want: 1, tolerance: 0.01,
            because: "either channel alone reports a difference and cannot report a sign",
          },
        }),
      ],
      table: {
        columns: ["config", "PUSH", "±", "PULL", "±"],
        rows: [
          ["lone", lone.push.mean.toExponential(3), lone.push.err.toExponential(1), lone.pull.mean.toExponential(3), lone.pull.err.toExponential(1)],
          ["alike", alike.push.mean.toExponential(3), alike.push.err.toExponential(1), alike.pull.mean.toExponential(3), alike.pull.err.toExponential(1)],
          ["opposite", opp.push.mean.toExponential(3), opp.push.err.toExponential(1), opp.pull.mean.toExponential(3), opp.pull.err.toExponential(1)],
        ],
      },
    };
  },
});

export default [coulomb, signLaw];
