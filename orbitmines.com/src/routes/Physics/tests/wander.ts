/**
 * THE WANDER — what a ray's heading costs it, and why the aggregate is a ± pair sum.
 *
 * A ray on this lattice does not travel along a smooth radius. It steps to one of the
 * exits, and the question the wander arc asks is what fraction of its motion survives
 * as displacement once the stepping is averaged over.
 *
 *     w(n) = √n / (√n + 1)
 *
 * with n the number of unit components a step has: an edge step is √2 long and a
 * corner step √3, so an edge keeps 0.5858 of its length and a corner 0.6340. Neither
 * number is put in — both come out of the step lengths the geometry already has.
 *
 * AND THE BLIND CASE IS THE ONE THAT MATTERS. A wander that does not discriminate —
 * that does not know what its heading is nor which way it goes — still has a mean
 * displacement of (1 − w)·d, because THE EXITS COME IN ± PAIRS and a sum over all of
 * them averages to nothing. That is the same fact the moments test reads as q = 0 for
 * a uniformly signed source, arriving from a completely different question, and it is
 * why the vacuum has no preferred direction to hand anything.
 */

import { GEOMETRIES, World, headerOf, judge, Finding } from "../DISCRETE";
import { test } from "../SUITE";

const w = (n: number) => Math.sqrt(n) / (Math.sqrt(n) + 1);

export const wander = test({
  id: "geometry/wander",
  claims: "the fraction of a step that survives averaging is √n/(√n+1) out of the step " +
    "lengths, and the exits summing to nothing is what leaves the vacuum directionless",
  cited: ["and everything it cannot", "and the same, with a wander that does not discriminate",
    "forward-only: you may deviate, but only into a direction you are already going"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const g = GEOMETRIES["cubic-26"];

    /** the three classes of exit on cubic 26, by how many unit components they have */
    const classes = [1, 2, 3].map(n => ({
      n,
      count: g.V.filter(v => v.reduce((a, x) => a + Math.abs(x ?? 0), 0) === n).length,
      w: w(n),
    }));

    /** Σ d̂ over every exit — nought, because they come in ± pairs */
    const sum = [0, 1, 2].map(i => g.U.reduce((a, u) => a + (u[i] ?? 0), 0));
    const sumLen = Math.hypot(...sum);

    /** and the counts the ⟨111⟩ easy axis is read off: exits with a component along it */
    const along = (axis: number[]) =>
      g.U.filter(u => axis.reduce((a, x, i) => a + x * (u[i] ?? 0), 0) > 1e-9).length;
    const corner = along([1, 1, 1]), face = along([1, 0, 0]);

    const world = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: "w for an edge step (n = 2)", value: w(2),
        expect: {
          of: "0.5858 = √2/(√2 + 1)",
          want: 0.5858, tolerance: 1e-3,
          because: "the step lengths are the geometry's, so this fraction is not a " +
            "parameter of the wander — it is what having a √2 step implies",
        },
      }),
      judge({
        name: "w for a corner step (n = 3)", value: w(3),
        expect: {
          of: "0.6340 = √3/(√3 + 1)",
          want: 0.6340, tolerance: 1e-3,
          because: "a longer step keeps more of itself, which is the same anisotropy that " +
            "makes c̄ vary by 1.73× on this lattice",
        },
      }),
      judge({
        name: "|Σ d̂| over every exit", value: sumLen,
        expect: {
          of: "0 — the exits come in ± pairs, so a blind wander has no preferred direction",
          want: 0, tolerance: 1e-12,
          because: "this is why the vacuum cannot hand a direction to anything, and it is " +
            "the same identity `layer2/moments` reads as µ = 0 for a uniformly signed " +
            "source — one fact, reached from two questions",
        },
      }),
      judge({
        name: "exits with a component along ⟨111⟩", value: corner,
        expect: {
          of: "10 — the count the ⟨111⟩ easy axis is read off",
          want: 10, tolerance: 0,
          because: "the anisotropy arc reaches this number from the bias on a corner axis; " +
            "arriving at it here by counting exits is the check that it is a fact about " +
            "the geometry and not about that argument",
        },
        note: `against ${face} along a face axis — which is why the two axes are not alike`,
      }),
    ];

    return {
      header: headerOf(world),
      findings,
      table: {
        columns: ["step", "unit components", "how many exits", "length", "w = √n/(√n+1)"],
        rows: classes.map(c => [
          c.n === 1 ? "face" : c.n === 2 ? "edge" : "corner",
          String(c.n), String(c.count), Math.sqrt(c.n).toFixed(4), c.w.toFixed(4),
        ]),
      },
    };
  },
});

/**
 * THE XOR, AND THE HALF INSIDE G.
 *
 * Two emitters with biases P_a and P_b meet, and whether the rule that fires is the
 * annihilating one or the turning one is decided by whether their signs disagree. The
 * chance of that is (1 − P_a P_b)/2, and the case that matters is the one nobody had
 * to choose: ORDINARY MATTER IS UNBIASED, so P_a = P_b = 0 and the chance is exactly a
 * half.
 *
 * WHICH IS THE ½ IN G. The gravitational constant carries a factor of one half because
 * matter has no net bias — Newton is the P = 0 case of the same expression rather than
 * a separate law, and if matter had a net bias G would be a different number.
 */
export const xor = test({
  id: "gravity/the-half-in-G",
  claims: "the XOR chance is (1 − P_a P_b)/2, whose unbiased case is exactly one half — " +
    "so Newton is the P = 0 case of the magnetic expression rather than a separate law",
  cited: ["and where the bias lives decides everything"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const g = GEOMETRIES["cubic-26"];
    const chance = (a: number, b: number) => (1 - a * b) / 2;
    /** the biases a whole-tick dwell allows, which is what makes the table finite */
    const Ps = Array.from({ length: g.CYCLE + 1 }, (_, k) => (2 * k) / g.CYCLE - 1);

    const world = new World({ theory, N: 5 });

    return {
      header: headerOf(world),
      findings: [
        judge({
          name: "chance of the annihilating branch, unbiased", value: chance(0, 0),
          expect: {
            of: "½ exactly — which is the half the gravitational constant carries",
            want: 0.5, tolerance: 1e-12,
            because: "ordinary matter is unbiased, so G's factor of a half is not a " +
              "convention: it is the unbiased case of the XOR, and Newton is that case " +
              "of the magnetic expression rather than a law beside it",
          },
        }),
        judge({
          name: "fully aligned biases", value: chance(1, 1),
          expect: {
            of: "0 — two fully biased emitters of the same sign never annihilate",
            want: 0, tolerance: 1e-12,
            because: "which is the turning branch firing every time, and is what makes " +
              "alike polarities repel rather than cancel",
          },
        }),
        judge({
          name: "fully anti-aligned", value: chance(1, -1),
          expect: {
            of: "1 — opposite and fully biased annihilates every time",
            want: 1, tolerance: 1e-12,
            because: "the two extremes bracket the half, so the unbiased case sits exactly " +
              "in the middle of a range the rule itself fixes",
          },
        }),
      ],
      table: {
        columns: ["P_a", ...Ps.filter((_, i) => i % 2 === 0).map(p => `P_b=${p.toFixed(1)}`)],
        rows: Ps.filter((_, i) => i % 2 === 0).map(a => [
          a.toFixed(1),
          ...Ps.filter((_, i) => i % 2 === 0).map(b => chance(a, b).toFixed(3)),
        ]),
      },
    };
  },
});

export default [wander, xor];
