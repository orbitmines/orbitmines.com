/**
 * MAGNETISM — the ordering arc, measured on the model rather than assumed from it.
 *
 * That arc is the longest in the book and it rests on things it takes as given: that
 * two emitters couple as DIPOLES, that the coupling is dipolar in form, that its sign
 * flips with geometry so that a lattice orders antiferromagnetically. All of it is
 * continuum machinery — a Luttinger–Tisza minimisation over a Brillouin zone — laid
 * over a model that has never been asked whether it produces the coupling in the
 * first place.
 *
 * SO ASK IT. Two bodies with an ORIENTATION, on the lattice, running the three rules:
 * does the force between them depend on their relative alignment, and does it depend
 * the way a dipole would? That is the whole of what the ordering arc needs from the
 * model, and everything it derives afterwards is arithmetic on top.
 */

import {
  World, GRAVITY_MAGNETISM, LABELLED, fieldB, forceOn, pullOn, pullChannel, fill,
  headerOf, judge, dot, unit, norm, sub, Vec, Theory, Finding,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";

/**
 * AN ORIENTED EMITTER — the smallest thing in this model that has a direction of its
 * own rather than merely a position.
 *
 * It puts its sign out of one half and the opposite out of the other, which is what
 * `axis` on a source does. That is a dipole in the only sense this lattice has one:
 * nothing is assumed about its field, and whether it behaves like a dipole is the
 * measurement rather than the setup.
 */
const oriented = (w: World, at: Vec, axis: Vec, emits: 1 | -1 = 1) =>
  w.add({
    at, radius: 1, emits, axis, absorbs: true, propulsion: "none",
    /*
     * IT PULSES AND IT COLLIDES, and neither is decoration. A body exempt from the
     * collision rule refills all l.DEG of its exits every tick and SATURATES: the
     * momentum it absorbs is then Σ V over every exit, which is exactly nought
     * because they come in ± pairs, so it reads no force in any direction whatever is
     * going on around it. Measured, that is precisely what happened — 26.0 of 26
     * exits occupied and a force of 0.000e+0 in all four arrangements. Letting it
     * meet the vacuum's rays drops it to 13.6 and the force becomes measurable.
     */
    duty: 1, collides: true,
  });

export const dipoleCoupling = test({
  id: "magnetism/dipole-coupling",
  claims: "two oriented emitters feel a force that depends on their relative alignment — " +
    "which is what the ordering arc assumes and had never measured",
  cited: ["Magnetism", "Layer 2: Matter"],
  under: {
    "gravity+magnetism": "holds",
    "labelled": "holds",
    "gravity": "cannot be asked — an orientation is a statement about which sign goes " +
      "which way, and gravity's rays carry no sign",
  },
  run: (ctx, theory) => {
    /*
     * BIG ENOUGH TO CROSS THE FLIP LENGTH, which is the whole point of the budget.
     *
     * `vacuum` derives the medium with no parameter in it: density ½, mean free path
     * 8 cells, FLIP LENGTH 8 CELLS. So the first sign flip in the coupling is at
     * r = 8, and a measurement that stops before it sees the first lobe only.
     *
     * A first version of this test measured at a SINGLE separation of 6 and reported
     * the polarity dependence as flat. That is the arc's own trap, which it names:
     * `consume`, `creation`, `exchange` and `permute` all cut the interaction at
     * r <= 4 for speed, and every one of them cut it off just before the interesting
     * thing happens. Six is inside the first lobe. There was nothing there to find.
     */
    const { N, T, seeds } = ctx.budget({ N: 41, T: 200, seeds: 4 });
    const C = (N - 1) / 2;

    /*
     * SEPARATIONS SPANNING THE FLIP, not one point. The article's Luttinger-Tisza sum
     * runs to r <= 24 so that three flips are inside the range; that is a lattice sum
     * over every displacement and is not what one pair of bodies can measure. What a
     * pair CAN give is J(r) along an axis, which is the input that sum is built from.
     */
    const SEPS = [4, 6, 8, 10, 12].filter(r => r <= N - 2 * 7);

    /*
     * BODY A IS PINNED AND ONLY B MOVES, which is what makes this affordable.
     *
     * With A at the centre of the measurement, the LONE run — A by itself — is the
     * same world for every separation and every arrangement, so it is measured once
     * per seed instead of once per row. That turns 2 x 4 x |SEPS| runs into
     * 1 + 4 x |SEPS|, and the lone subtraction stays exact because it is literally
     * the same run.
     */
    const ax = C - 5;

    const ARRANGEMENTS: [string, Vec, Vec][] = [
      ["parallel, side by side", [0, 0, 1], [0, 0, 1]],
      ["antiparallel, side by side", [0, 0, 1], [0, 0, -1]],
      ["parallel, end to end", [1, 0, 0], [1, 0, 0]],
      ["antiparallel, end to end", [1, 0, 0], [-1, 0, 0]],
    ];

    /**
     * THE ANNIHILATION CHANNEL, BECAUSE MOMENTUM IS SIGN-BLIND.
     *
     * A first version measured the momentum a body absorbs, and parallel came out
     * bit-identical to antiparallel — necessarily, since that reading is sum V over the
     * occupied exits and V does not know what sign is on the ray. Flipping a dipole
     * end for end cannot change it.
     *
     * The electromagnetism arc already had this: there are TWO channels, and only one
     * of them can carry a sign law. Annihilation is the sign-sensitive one, because
     * opposite polarities annihilate where alike ones turn — so what a relative
     * orientation changes is WHERE SPACE IS DESTROYED, which is also what a force is
     * in this model.
     */
    const lone = ctx.once((seed: number, axis0: number) => {
      const w = new World({ theory, N, seed, boundary: "absorb" });
      oriented(w, [ax, C, C], ARRANGEMENTS[axis0][1]);
      w.run(T);
      return pullChannel(w, [ax, C, C], [1, 0, 0]);
    });

    const paired = ctx.once((i: number, sep: number, seed: number) => {
      const [, a, b2] = ARRANGEMENTS[i];
      const w = new World({ theory, N, seed, boundary: "absorb" });
      oriented(w, [ax, C, C], a);
      oriented(w, [ax + sep, C, C], b2);
      w.run(T);
      return pullChannel(w, [ax, C, C], [1, 0, 0]);
    });

    /** J(r) for one arrangement: the pair against the same body alone, per seed */
    const J = (i: number, sep: number) =>
      ctx.over(seeds, s => paired(i, sep, s) - lone(s, i));

    /**
     * DIFFERENCED PER SEED, WHICH IS THE OTHER HALF OF THE MEASUREMENT.
     *
     * Parallel and antiparallel at seed s run in the SAME VACUUM — same polarities,
     * same expansion, same everything but the orientation of one body. So the noise
     * in the two is the same noise, and differencing them seed by seed cancels it.
     *
     * A first version differenced the two MEANS and added their errors in quadrature,
     * which treats runs that share a realisation as independent. That reported +-1.8
     * on a quantity whose real spread is the run-to-run variation in the ORIENTATION
     * EFFECT and not in the vacuum, and buried a difference fifty times smaller than
     * an error bar that was mostly an artefact of the arithmetic. Pairing dropped the
     * error thirtyfold at a SMALLER budget. No number of extra seeds does that: the
     * common term does not average away, it has to be subtracted before the mean.
     */
    const polarityAt = (sep: number, i: number, j: number) => ctx.over(seeds, s =>
      (paired(i, sep, s) - lone(s, i)) - (paired(j, sep, s) - lone(s, j)));

    const side = SEPS.map(r => ({ r, d: polarityAt(r, 0, 1) }));
    const endto = SEPS.map(r => ({ r, d: polarityAt(r, 2, 3) }));
    const sig = (x: { mean: number; err: number }) =>
      Math.abs(x.mean) / (x.err || Infinity);

    /*
     * DOES IT FLIP? An interaction that keeps one sign at every separation cannot
     * order at q != 0 however the lattice sum is taken, and the antiferromagnet needs
     * q = (0, pi, pi). A sign change somewhere inside the range is the minimum the
     * ordering arc needs the model to supply, and the arc puts it at r = 8.
     */
    const resolvedSide = side.filter(x => sig(x.d) > 2);
    const flipsAt = (xs: typeof side) => {
      const r = xs.filter(x => sig(x.d) > 2);
      for (let i = 1; i < r.length; i++)
        if (r[i].d.mean * r[i - 1].d.mean < 0) return r[i].r;
      return 0;
    };
    const flipSide = flipsAt(side), flipEnd = flipsAt(endto);

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    oriented(w, [C, C, C], [0, 0, 1]);
    w.run(20);

    const findings: Finding[] = [
      judge({
        name: "separations resolved above 2 sigma", value: resolvedSide.length,
        expect: {
          of: "most of them — a coupling nothing can resolve is not a coupling",
          want: SEPS.length, tolerance: SEPS.length,
          because: "J(r) is the input the ordering arc's Luttinger-Tisza sum is built " +
            "from, so it has to be measurable separation by separation before that " +
            "sum means anything",
        },
        note: `separations ${SEPS.join(", ")} cells, spanning the flip length of 8`,
      }),
      judge({
        name: "polarity dependence flips sign at r (cells)", value: flipSide,
        expect: {
          of: "8 — vacuum's flip length, with no parameter in it",
          want: 8, tolerance: 4,
          because: "the antiferromagnet is q = (0, pi, pi), and a coupling of one fixed " +
            "sign at every separation orders ferromagnetically or not at all. THIS is " +
            "the measurement the single-separation version could not make.",
        },
        note: flipSide
          ? `side by side changes sign between ${SEPS[SEPS.indexOf(flipSide) - 1]} and ` +
            `${flipSide} cells`
          : "NO FLIP RESOLVED in this range — either the coupling holds one sign, or " +
            "the box is too small to carry the separations where it turns over",
      }),
      judge({
        name: "end to end flips at r (cells)", value: flipEnd,
        note: "a dipolar coupling flips in BOTH geometries and out of phase with itself; " +
          "one that flips in neither is not dipolar, and one that flips in only one is " +
          "anisotropic in a way the arc's kernel does not describe",
      }),
      judge({
        name: "is the coupling DIPOLAR in form?",
        /*
         * BOTH TERMS HAVE TO BE RESOLVED, or this scores a coin landing the right way
         * up. A first version asked only whether two differences had opposite signs,
         * and called the coupling dipolar off +0.03 and -0.08 against errors of 1.8
         * and 2.2 — a fiftieth of the noise, in the right direction by luck.
         */
        value: (flipSide && flipEnd && flipSide !== flipEnd) ? 1 : 0,
        expect: {
          of: "1 — both geometries turn over, at different separations",
          want: 1, tolerance: 0,
          because: "an antiferromagnet on a cubic lattice comes out of that anisotropy " +
            "and not out of a sign at one separation; without it the arc's q* = " +
            "(0, pi, pi) is a result about a kernel this model does not have",
        },
      }),
    ];

    return {
      header: headerOf(w, seeds),
      findings,
      table: {
        columns: ["r", "par-anti, side by side", "sigma", "par-anti, end to end", "sigma"],
        rows: SEPS.map((r, i) => [
          String(r),
          side[i].d.mean.toExponential(2), sig(side[i].d).toFixed(1),
          endto[i].d.mean.toExponential(2), sig(endto[i].d).toFixed(1),
        ]),
      },
    };
  },
});

export default [dipoleCoupling];
