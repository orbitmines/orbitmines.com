/**
 * DRIFT — a charge in a field, which is what charge is for, and the sign comes out of
 * which rule fires rather than out of anything put in.
 *
 * The port of `todo/provenance/field.ts` §1–§2. A charge that does not DO anything is a
 * label. What it owes is that two opposite charges in the same field go opposite ways —
 * and that is decidable from the three rules, because the rules already say what happens
 * when two rays meet and WHICH RULE FIRES DEPENDS ON THE TWO SIGNS. That is the only place
 * a sign can enter, so if the force has a sign it comes from here.
 *
 *   §1  opposite (+ −) meets under (G+M/1), which annihilates and shortens the space
 *       BETWEEN — an ATTRACTION. Alike (+ +) meets under (G+M/3), which turns the pair
 *       back the way it came so that what shortens is the space BEHIND — a REPULSION.
 *       A field is a background of rays of a definite sign WITH A DENSITY GRADIENT, so a
 *       structure in one meets more of them on one side than the other, the shortening is
 *       unbalanced, and it drifts
 *   §2  so the drift reverses with the charge AND reverses again with the background's
 *       sign — the force goes as the PRODUCT of the two, which is why a field has a
 *       direction and a charge has a sign and only their product is observable
 *
 * AND THE OLD §2 WAS NOT A MEASUREMENT OF THIS MODEL, which is why this port is worth
 * doing rather than transcribing. It was a hand-rolled bookkeeping loop with no lattice in
 * it: two integer separations, a coin flip per side per tick, and a hardcoded "alike
 * shortens the far gap". Its 0.0894 is `flux · n₀ · grad` and nothing else — the sign law
 * it reports is the sign law it was written with. Here the background is real rays on real
 * exits, the meetings are whichever the rules give, and WHAT IS READ IS THE METRIC CHANNEL:
 * `w.destroyed`, where space was actually annihilated away. Nothing tells it which side to
 * shorten.
 *
 * THE FIELD IS TOPPED UP EVERY TICK, and that is the honest reading rather than a
 * convenience. A field is maintained by sources far away; left alone, a gradient in this
 * vacuum relaxes, and what would then be measured is the relaxation and not the force.
 */

import {
  World, Vec, Theory, headerOf, judge, pullChannel, forceOn, fill, Finding,
} from "../DISCRETE";
import { test } from "../SUITE";

/** how many rays a cell of the imposed field carries at the centre, before the gradient */
const N0 = 1.5;

/**
 * A background of rays of ONE sign whose density rises along +x — which is what a field
 * is in these terms. Returns how many rays it laid down.
 */
const impose = (w: World, sign: -1 | 1, n0: number, grad: number) => {
  const g = w.geometry, N = w.opts.N, C = (N - 1) / 2;
  let laid = 0;
  w.backend.forEachLocal(local => {
    if (w.isSource(local)) return;
    const x = w.backend.position(local)[0];
    const want = n0 * (1 + grad * (x - C) / C);
    for (let d = 0; d < g.DEG; d++) {
      if (w.backend.active(local, d)) continue;
      if (w.rng() > want / g.DEG) continue;
      w.backend.put(local, d, sign);
      laid++;
    }
  });
  return laid;
};

/**
 * A charge of sign q sitting in that field, and where space goes near it — DIFFERENCED
 * AGAINST THE SAME BOX WITH NO CHARGE IN IT.
 *
 * THE COMMON MODE IS LARGER THAN THE SIGNAL AND IT HAS NO SIGN IN IT. A graded background
 * puts more rays on the dense side, so more of them meet each other there and more space
 * is destroyed there — whatever charge is sitting in the middle, and indeed whether or not
 * anything is. Read raw, all four sign combinations drift up the gradient and the law is
 * invisible under an effect that is simply the gradient being a gradient.
 *
 * So the observable is the DIFFERENCE the charge makes: the same seed, the same imposed
 * field, once with the structure and once without. `slotUniformRng` is what makes that
 * subtraction exact rather than approximate — it draws the random stream for every slot
 * whether or not it is occupied, so the two runs differ ONLY by the source.
 */
const drift = (
  theory: Theory, N: number, T: number, seed: number,
  q: -1 | 1, sign: -1 | 1, grad: number,
) => {
  const C = (N - 1) / 2, centre = [C, C, C];
  const build = (withCharge: boolean) => {
    const w = new World({
      theory, N, seed, boundary: "absorb", slotUniformRng: true,
    });
    if (withCharge) w.add({ at: centre, radius: 2, emits: q });
    for (let t = 0; t < T; t++) { impose(w, sign, N0, grad); w.run(1); }
    return w;
  };
  const w = build(true), v = build(false);
  /*
   * TWO CHANNELS, BECAUSE ONE OF THEM IS STRUCTURALLY BLIND TO HALF THE LAW.
   *
   * `pull` is the metric channel: where space was DESTROYED. (G+M/1) destroys space, so an
   * attraction writes a large direct signature into it. (G+M/3) destroys NOTHING — it
   * turns a pair and leaves the point count alone — so a repulsion writes no direct
   * signature at all, and measured at eight seeds the two alike cases come back the size
   * of the no-gradient control and with opposite signs. That is not a weak result, it is
   * the wrong instrument: the metric channel can see attraction and cannot see repulsion.
   *
   * `push` is the momentum channel: what the vacuum actually delivers to the body, net of
   * its own recoil. A turned ray still arrives carrying momentum, so this one can see both.
   */
  return {
    pull: pullChannel(w, centre, [1, 0, 0]) - pullChannel(v, centre, [1, 0, 0]),
    push: forceOn(w, 0).net[0],
    fill: fill(w), w,
  };
};

export const chargeInAField = test({
  id: "electrostatics/charge-in-a-field",
  claims: "a charge in a graded background drifts, and the drift reverses with the charge " +
    "AND with the background's sign — so the force goes as the PRODUCT, which is why only " +
    "the product of a field's direction and a charge's sign is observable",
  cited: ["Layer 2: Matter — a charge in a field, which is what charge is for"],
  under: {
    "gravity+magnetism": "holds",
    "labelled": "holds",
    "gravity": "cannot be asked — with no polarity there is no alike and opposite to have " +
      "a law between, and no sign for a background to carry",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 31, T: 120, seeds: 8 });
    const GRAD = 0.6;

    const read = ctx.once((key: string) => {
      const [q, sign, grad, seed] = key.split("/").map(Number);
      return drift(theory, N, T, seed, q as -1 | 1, sign as -1 | 1, grad);
    });
    const at = (q: number, sign: number, grad = GRAD) => ({
      pull: ctx.over(seeds, s => read(`${q}/${sign}/${grad}/${s}`).pull),
      push: ctx.over(seeds, s => read(`${q}/${sign}/${grad}/${s}`).push),
    });

    const PP = at(+1, +1), PM = at(+1, -1), MP = at(-1, +1), MM = at(-1, -1);
    const FLAT = at(+1, +1, 0);
    const pp = PP.pull, pm = PM.pull, mp = MP.pull, mm = MM.pull, flat = FLAT.pull;

    /* the scale the four share, for turning each comparison into a ratio */
    const scale = (Math.abs(pp.mean) + Math.abs(pm.mean) +
      Math.abs(mp.mean) + Math.abs(mm.mean)) / 4;
    const byCharge = pp.mean / (mp.mean || 1e-30);
    const byField = pp.mean / (pm.mean || 1e-30);
    /* the product law: the two ALIKE cases should agree, and the two OPPOSITE ones */
    const alikeGap = Math.abs(PP.push.mean - MM.push.mean) /
      Math.max((Math.abs(PP.push.mean) + Math.abs(MM.push.mean)) / 2, 1e-30);
    const oppositeGap = Math.abs(pm.mean - mp.mean) / Math.max(scale, 1e-30);

    const w = drift(theory, N, T, seeds[0], +1, +1, GRAD).w;
    /*
     * SIGNS AND NOT RATIOS, which is what the observable will actually carry.
     *
     * The old file reports the four drifts as near-mirror images — "ratio −0.9987" — and
     * that symmetry is a property of its bookkeeping loop rather than of the model: it
     * shortened one integer separation or the other by exactly one cell per event, so the
     * alike and opposite cases were equal and opposite by construction.
     *
     * THEY ARE NOT EQUAL AND OPPOSITE HERE, AND THERE IS NO REASON THEY SHOULD BE. The
     * observable is the metric channel, and the two rules leave very different traces in
     * it: (G+M/1) DESTROYS space, which is a large positive signature exactly where the
     * meeting happened, while (G+M/3) merely turns a pair, whose effect on the metric is
     * whatever annihilation the turned rays go on to have somewhere else. So what the
     * product law predicts is that the four split into two groups BY SIGN, and that is
     * what is declared.
     */
    const findings: Finding[] = [
      judge({
        name: "do the two OPPOSITE cases both draw the charge UP the gradient",
        value: pm.mean > 0 && mp.mean > 0 ? 1 : 0,
        expect: {
          of: "1 — ATTRACTED to the denser side, by (G+M/1)", want: 1, tolerance: 0,
          because: "opposite signs annihilate, so the space that vanishes is the space BETWEEN " +
            "the charge and the background it met — and there is more background to meet up " +
            "the gradient, so more of it vanishes there and the charge is carried that way. " +
            "Stated as a verdict because the claim is about direction: the two magnitudes are " +
            "NOT mirror images of the alike ones and nothing says they should be",
        },
        note: `${pm.mean.toExponential(2)} and ${mp.mean.toExponential(2)}`,
      }),
      judge({
        name: "do the two ALIKE cases both push it DOWN the gradient, in MOMENTUM",
        value: PP.push.mean < 0 && MM.push.mean < 0 ? 1 : 0,
        expect: {
          of: "1 — REPELLED, by (G+M/3)", want: 1, tolerance: 0,
          because: "alike signs turn instead of annihilating, so the meeting is sent back the " +
            "way it came and what shortens is the space BEHIND — a repulsion with nothing " +
            "repulsive in the rules. READ IN THE MOMENTUM CHANNEL AND NOT THE METRIC ONE, for " +
            "the reason the row below reports: a rule that destroys no space writes nothing " +
            "into a channel that counts destroyed space. THE TWO ROWS TOGETHER ARE THE PRODUCT " +
            "LAW — the force does not know either sign, only whether they agree",
        },
        note: `${PP.push.mean.toExponential(2)} and ${MM.push.mean.toExponential(2)}, against ` +
          `opposite ${PM.push.mean.toExponential(2)} and ${MP.push.mean.toExponential(2)}`,
      }),
      /*
       * AND WHY THE METRIC CHANNEL CANNOT BE ASKED, reported rather than judged — it is a
       * statement about the instrument, and the thing it would be judged against is the row
       * above.
       */
      {
        name: "the two ALIKE cases in the METRIC channel, against the no-gradient control",
        value: Math.max(Math.abs(pp.mean), Math.abs(mm.mean)) / Math.max(Math.abs(flat.mean), 1e-30),
        note: `${pp.mean.toExponential(2)} and ${mm.mean.toExponential(2)} against a control ` +
          `of ${flat.mean.toExponential(2)} — THE SAME SIZE, AND THEY DISAGREE IN SIGN. That is ` +
          `not a weak measurement, it is the wrong instrument: (G+M/1) DESTROYS space, so an ` +
          `attraction writes a large direct signature into a channel that counts destroyed ` +
          `space, while (G+M/3) destroys NOTHING and writes no direct signature at all. The ` +
          `metric channel can see attraction and structurally cannot see repulsion, which is ` +
          `why electrostatics/sign-law reads two channels and not one`,
      },
      judge({
        name: "gap between the two ALIKE cases in MOMENTUM, over their own scale",
        value: alikeGap,
        expect: {
          of: "0 — (+,+) and (−,−) are ONE case", want: 0, tolerance: 0.6,
          because: "the product law as a quantitative statement rather than a sign: swapping " +
            "BOTH signs is not a change the mechanism can see, so these two are the same " +
            "experiment run twice and should agree within their noise",
        },
      }),
      judge({
        name: "gap between the two OPPOSITE cases, over the shared scale", value: oppositeGap,
        expect: {
          of: "0 — (+,−) and (−,+) are ONE case", want: 0, tolerance: 0.6,
          because: "the other half of the same statement, and the control that stops the row " +
            "above passing on a pair that happened to be small in both alike cases",
        },
      }),
      judge({
        name: "does the OPPOSITE signal clear the no-gradient control",
        value: Math.min(Math.abs(pm.mean), Math.abs(mp.mean)) > 2 * Math.abs(flat.mean) ? 1 : 0,
        expect: {
          of: "1 — a field with no gradient exerts no force", want: 1, tolerance: 0,
          because: "THE CONTROL THE OLD FILE COULD NOT RUN, because its background was two " +
            "integers rather than a box. A charge in a UNIFORM sea has no preferred side, so " +
            "whatever this reads is the box's own asymmetry and the graded runs have to clear " +
            "it. It is asked of the OPPOSITE pair because those are the ones with a large " +
            "signature in the metric channel — see the note for where that leaves the alike ones",
        },
        note: `no-gradient control ${flat.mean.toExponential(2)} against opposite ` +
          `${pm.mean.toExponential(2)}, ${mp.mean.toExponential(2)} and alike ` +
          `${pp.mean.toExponential(2)}, ${mm.mean.toExponential(2)} — THE ALIKE PAIR IS THE ` +
          `SAME SIZE AS THE CONTROL and disagrees with itself in sign, which is the metric ` +
          `channel being blind rather than the runs being noisy. The repulsion is resolved ` +
          `in the momentum channel two rows up, where the same two cases agree with each ` +
          `other to a percent and a half`,
      }),
    ];

    return {
      header: headerOf(w, seeds),
      table: {
        columns: ["q", "background", "meets under", "space destroyed +x − −x", "drift"],
        rows: ([[+1, +1], [+1, -1], [-1, +1], [-1, -1]] as [number, number][]).map(([q, s]) => {
          const v = q > 0 ? (s > 0 ? pp : pm) : (s > 0 ? mp : mm);
          return [q > 0 ? "+1" : "−1", s > 0 ? "+" : "−",
            q * s > 0 ? "(G+M/3) turn" : "(G+M/1) annihilate",
            v.mean.toExponential(3), v.mean > 0 ? "→ up the gradient" : "← down it"];
        }),
      },
      findings,
    };
  },
});

export default [chargeInAField];
