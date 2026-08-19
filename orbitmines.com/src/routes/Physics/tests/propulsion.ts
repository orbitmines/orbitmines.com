/**
 * CAN A THING MOVE ITSELF? — and if so, by which of the ways this model allows.
 *
 * Nothing in the three rules moves a structure. A ray moves; a structure is a region,
 * and a region has no heading. So if matter goes anywhere it is because of what it
 * does to the vacuum around it, and the model offers more than one way to try:
 *
 *   `none`      emits every way at once — the control, which MUST NOT MOVE, and
 *               which is what makes any other row mean something.
 *
 *   `forward`   emits more the way it wants to go, and TWO EFFECTS OPPOSE. The rays
 *               leaving carry momentum, so it should recoil BACKWARD like a rocket.
 *               But those same rays annihilate against the vacuum ahead and thin it,
 *               so fewer vacuum rays arrive from that side and the ambient pressure
 *               behind pushes it FORWARD. Which is larger is not something the rules
 *               say, so it is a measurement.
 *
 *   `backward`  THE VACUUM AS PROPELLANT. Absorb what arrives from every side —
 *               isotropic, so no net momentum — and send it all out behind. Nothing
 *               is created: the rays are the vacuum's own, redirected, and the recoil
 *               is forward. This is the reading in which a thing moves by rearranging
 *               the space it is already in.
 *
 *   `transmit`  pass what arrives straight on, out the far side, same heading.
 *               Absorbed and emitted momentum then point the same way and should
 *               CANCEL EXACTLY — the control that says this measurement can tell a
 *               redirection from a pass-through.
 *
 * AND THE FORCE HAS TWO TERMS. A body that only absorbs has one, and that is what
 * every force measurement in this project has used. An emitter also throws momentum
 * away, and reporting the absorbed half alone is how a rocket comes out looking as
 * though its own exhaust were pushing it forwards.
 */

import {
  World, GRAVITY, GRAVITY_MAGNETISM, forceOn, expansionOf, headerOf, judge, Theory,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";

type How = "none" | "forward" | "backward" | "transmit";

export const selfPropulsion = test({
  id: "structure/self-propulsion",
  claims: "a body that redirects the vacuum's own rays moves, and one that emits evenly " +
    "does not — with the absorbed and emitted momentum both counted",
  cited: ["Layer 2: Matter"],
  under: {
    /*
     * GRAVITY FIRST, because there the rays are neutral and every meeting annihilates,
     * so nothing about the result can be a story about polarity. If a thing can move
     * itself at all, it can do it here.
     */
    "gravity": "holds",
    "gravity+magnetism": "holds",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 31, T: 200, seeds: 4 });
    const C = (N - 1) / 2;
    const toward = [1, 0, 0];

    /**
     * THE FORCE IS A DIFFERENCE, and it has to be.
     *
     * A first version read the net force off one run and called it propulsion. But an
     * isotropic emitter — which must feel nothing — came out at −88 against a signal
     * of 183, so most of what was being reported was whatever a source of that shape
     * in a box of that size feels anyway. Every other force in this project is
     * measured the same way for the same reason: TWO RUNS AT THE SAME SEED, alike in
     * everything but the mechanism, and the difference is what the mechanism did.
     *
     * The body is also HELD STILL while its force is measured. A body that moves
     * plows into fresh vacuum ahead and leaves a depleted wake behind, which is a
     * real force and not this one — so motion is checked separately, once there is a
     * force worth believing in.
     */
    const force = ctx.once((how: How, conserve: boolean, moves: boolean, seed: number) => {
      const w = new World({ theory, N, seed, boundary: "wrap", expansion: 1 });
      const s = w.add({
        at: [C, C, C], radius: 2, emits: 1,
        propulsion: how, toward, bias: 1, conserve, absorbs: true, moves,
      });
      w.run(T);
      const f = forceOn(w, 0);
      let ahead = 0, an = 0, behind = 0, bn = 0;
      w.backend.forEachLocal(k => {
        if (w.isSource(k)) return;
        const p = w.backend.position(k);
        const dx = p[0] - C, r = Math.hypot(dx, p[1] - C, p[2] - C);
        if (r < 4 || r > 9 || Math.abs(dx) < 0.7 * r) return;
        let on = 0;
        for (let d = 0; d < w.DEG; d++) if (w.backend.active(k, d)) on++;
        if (dx > 0) { ahead += on; an++; } else { behind += on; bn++; }
      });
      return {
        net: f.net[0], moved: s.moved,
        ahead: ahead / Math.max(an, 1), behind: behind / Math.max(bn, 1),
      };
    });

    /** the mechanism's own doing: itself, less an isotropic emitter of the same shape */
    const over = (how: How, conserve: boolean) =>
      ctx.over(seeds, s => force(how, conserve, false, s).net - force("none", false, false, s).net);

    const ways: [string, How, boolean][] = [
      ["none (control)", "none", false],
      ["forward", "forward", false],
      ["backward", "backward", false],
      ["backward, conserving", "backward", true],
      ["transmit", "transmit", true],
    ];
    const got = ways.map(([, how, cons]) => over(how, cons));
    const raw = ways.map(([, how, cons]) => ctx.over(seeds, s => force(how, cons, false, s).net));
    const [, forward, , conserving, transmit] = got;

    // and whether a force that size actually carries the thing anywhere
    const travelled = ctx.over(seeds, s => force("backward", true, true, s).moved);
    const drift = ctx.over(seeds, s => force("none", false, true, s).moved);

    const w = new World({ theory, N, seed: seeds[0], boundary: "wrap" });
    w.add({ at: [C, C, C], radius: 2, emits: 1 });
    w.run(20);

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "control against itself", value: got[0].mean, err: got[0].err,
          expect: {
            of: "exactly nought — it is the same run twice",
            want: 0, tolerance: 1e-9,
            because: "if this is not zero the differencing is broken and nothing below means " +
              "anything",
          },
        }),
        judge({
          name: "backward, conserving — the vacuum as propellant",
          value: conserving.mean, err: conserving.err,
          expect: {
            of: "POSITIVE — rays caught and sent out behind, so the recoil is forward",
            want: Math.abs(conserving.mean), tolerance: 1e9,
            because: "this row CREATES NOTHING: it emits only as many rays as it caught, so " +
              "whatever pushes it is the vacuum's own momentum, redirected",
          },
          note: `${(Math.abs(conserving.mean) / (conserving.err || Infinity)).toFixed(1)}σ`,
        }),
        judge({
          name: "transmit — passing a ray on costs nothing",
          value: transmit.mean, err: transmit.err,
          expect: {
            of: "nought — the same momentum out as in, so no acceleration",
            want: 0, tolerance: 0.5,
            because: "which is what MOVING is here: a thing that transmits perfectly is not " +
              "being pushed, it is already going — and how often a thing EMITS instead is what " +
              "it costs not to be doing that, which is its mass",
          },
        }),
        judge({
          name: "forward — rocket or shadow?", value: forward.mean, err: forward.err,
          note: "NEGATIVE means the recoil wins and it behaves like a rocket. POSITIVE means " +
            "the shadow wins: its own emission thins the vacuum ahead and the pressure behind " +
            "pushes it INTO the direction it emits — the gravity mechanism turned around.",
        }),
        judge({
          name: "cells travelled, conserving redirection", value: travelled.mean, err: travelled.err,
          note: `against ${drift.mean.toFixed(1)} for an isotropic emitter of the same shape, ` +
            "which is the drift a body of this size has anyway",
        }),
      ],
      table: {
        columns: ["how", "net (raw)", "less control", "±", "ahead", "behind"],
        rows: ways.map(([name], i) => [
          name, raw[i].mean.toExponential(2),
          got[i].mean.toExponential(3), got[i].err.toExponential(1),
          force(ways[i][1], ways[i][2], false, seeds[0]).ahead.toFixed(3),
          force(ways[i][1], ways[i][2], false, seeds[0]).behind.toFixed(3),
        ]),
      },
    };
  },
});

export default [selfPropulsion];
