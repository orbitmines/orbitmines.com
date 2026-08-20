/**
 * AMPÈRE — parallel currents attract and antiparallel ones repel, and it is the SAME XOR
 * as the charges arriving at a different law.
 *
 * The port of `todo/provenance/wires.ts`. What magnetism is, operationally, is that
 * parallel currents attract and antiparallel ones repel. And in this model a force is not a
 * vector added to anything — it is where space shortens, because (G+M/1) takes two spatial
 * points and leaves one. So put two wires side by side and read both channels.
 *
 * THE MECHANISM SAYS IN ADVANCE WHAT EACH CHANNEL SHOULD SHOW, which is what makes this a
 * prediction rather than a measurement looking for a story. A wire's exit carries a sign
 * and heads toward its partner; the partner's opposite exit heads back:
 *
 *   PARALLEL      the two are OPPOSITE where they meet — (G+M/1) fires, the gap is thinned,
 *                 and the rays are destroyed rather than landing. So the PULL channel sees
 *                 it and the PUSH channel does not.
 *   ANTIPARALLEL  the two are ALIKE — (G+M/3) turns them, NOTHING IS DESTROYED, and the
 *                 rays survive the crossing and land. So the PUSH channel sees it and the
 *                 PULL channel barely does.
 *
 * WHICH IS WHY AN ANNIHILATION COUNT ALONE GOT IT WRONG. The arc's first pass counted
 * annihilations between two currents and found parallel ones shortening the space between
 * them while antiparallel ones did nothing — an attraction, and no repulsion. That is
 * exactly what an annihilation count MUST report, for the reason `texture/poles-are-a-
 * divergence` and `electrostatics/charge-in-a-field` both run into: IT CAN ONLY SEE THE
 * RULE THAT DESTROYS. The second sign was there all along and the measure could not see it.
 *
 * AND THE CONTROL IS A LONE WIRE, not an inert pair and not the other configuration. Two
 * absorbing lines shorten the space between them by shadowing each other, which has nothing
 * to do with magnetism — so the question is never whether a ratio exceeds one, but whether
 * the two current configurations differ from each other. They differ in nothing but the
 * direction of a current carrying no net charge, so whatever separates them is magnetic.
 */

import { World, headerOf, judge, pullOn, fill } from "../DISCRETE";
import { test } from "../SUITE";

export const parallelCurrentsAttract = test({
  id: "magnetostatics/ampere-force",
  claims: "reversing a wire's current changes ONLY the label, and no rule reads the " +
    "label — so the two configurations are bit-identical and there is no Ampère force " +
    "here at all. The label buys the FIELD and not the FORCE",
  cited: ["wires.ts", "wires.ts §1"],
  under: {
    "gravity+magnetism": "holds",
    "labelled": "holds",
    "gravity": "cannot be asked — a current needs a polarity to be a current of",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 140, seeds: 4 });
    const C = (N - 1) / 2, SEP = 10;
    const xL = C - SEP / 2, xR = C + SEP / 2;

    /**
     * A wire: carriers drifting along ±z, in ± pairs so it carries no NET CHARGE and a
     * polarity current. Built in pairs so the neutrality is structural rather than
     * statistical — the same construction `magnetostatics/neutral-wire` uses.
     */
    const wire = (w: World, x: number, dir: 1 | -1) => {
      for (let z = 4; z + 1 < N - 4; z += 2) {
        w.add({ at: [x, C, z], radius: 0.9, emits: 1, u: [0, 0, dir * 0.5] });
        w.add({ at: [x, C, z + 1], radius: 0.9, emits: -1, u: [0, 0, -dir * 0.5] });
      }
    };

    const at = ctx.once((key: string) => {
      const [right, seed] = key.split("/").map(Number);
      const w = new World({ theory, N, seed, boundary: "absorb", slotUniformRng: true });
      wire(w, xL, 1);
      if (right !== 0) wire(w, xR, right as 1 | -1);
      const before = new Int32Array(w.backend.size());
      w.backend.forEachLocal(k => { before[k] = w.backend.density(k); });
      w.run(T);
      /* PULL: where space was destroyed, facing the partner against facing away */
      let tow = 0, twN = 0, awy = 0, awN = 0;
      w.backend.forEachLocal(k => {
        if (w.isSource(k)) return;
        const p = w.backend.position(k);
        const dx = p[0] - xL, r = Math.abs(dx);
        if (r < 2 || r > 4 || Math.abs(p[1] - C) > 3) return;
        const grew = w.backend.density(k) - before[k];
        if (dx > 0) { tow += grew; twN++; } else { awy += grew; awN++; }
      });
      /* PUSH: the net x-momentum the LEFT wire's own sources take in, per tick */
      let push = 0, n = 0;
      for (let i = 0; i < w.sources.length; i++) {
        /* a Source records the locals it occupies, not a centre — read the x off one */
        const loc = w.sources[i].locals[0];
        if (loc === undefined) continue;
        if (Math.abs(w.backend.position(loc)[0] - xL) > 0.5) continue;
        push += pullOn(w, i)[0]; n++;
      }
      return {
        push: push / Math.max(n, 1),
        pull: tow / Math.max(twN, 1) - awy / Math.max(awN, 1),
        fill: fill(w),
      };
    });

    /*
     * DIFFERENCED AGAINST A LONE WIRE AT THE SAME SEED. The lone wire carries the box's own
     * asymmetry — it sits off-centre and emits into two hemispheres — and that baseline is
     * shared by both configurations and cancels between them.
     */
    const sig = (right: number, ch: "push" | "pull") =>
      ctx.over(seeds, s => at(`${right}/${s}`)[ch] - at(`0/${s}`)[ch]);
    /* and the comparison that carries the result is the two against EACH OTHER */
    const dPush = ctx.over(seeds, s => at(`-1/${s}`).push - at(`1/${s}`).push);
    const dPull = ctx.over(seeds, s => at(`1/${s}`).pull - at(`-1/${s}`).pull);

    const par = { push: sig(1, "push"), pull: sig(1, "pull") };
    const anti = { push: sig(-1, "push"), pull: sig(-1, "pull") };
    const lone = { push: ctx.over(seeds, s => at(`0/${s}`).push), pull: ctx.over(seeds, s => at(`0/${s}`).pull) };

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    wire(w, xL, 1); w.run(T);

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "difference in PUSH between parallel and antiparallel",
          value: Math.abs(dPush.mean), err: dPush.err,
          expect: {
            of: "0 — EXACTLY, because the two runs are the same run", want: 0, tolerance: 1e-12,
            because: "a wire is built by giving its carriers a drift u, which sets the LABEL " +
              "the rays carry. Reversing the current reverses u and therefore the label — and " +
              "NOTHING IN THE THREE RULES READS THE LABEL. `onDeflect: carry` says so in as " +
              "many words: it is carried through a deflection, not consulted by one. So the " +
              "two configurations stream, annihilate and turn identically, bit for bit",
          },
        }),
        judge({
          name: "difference in PULL between parallel and antiparallel",
          value: Math.abs(dPull.mean), err: dPull.err,
          expect: {
            of: "0 — EXACTLY, for the same reason", want: 0, tolerance: 1e-12,
            because: "the annihilation ledger is a function of which signs meet where, and the " +
              "signs are `emits`, not `u`. Both channels are blind to the current's direction " +
              "because the DYNAMICS are",
          },
        }),
        judge({
          name: "is there an Ampère force here at all",
          value: (Math.abs(dPush.mean) > 1e-12 || Math.abs(dPull.mean) > 1e-12) ? 1 : 0,
          expect: {
            of: "0 — THE LABEL BUYS THE FIELD AND NOT THE FORCE", want: 0, tolerance: 0,
            because: "which is a sharper statement of the arc's own obstruction than the arc " +
              "makes. `magnetostatics/neutral-wire` shows the label gives a wire a real 1/r " +
              "azimuthal B — that is a FIELD, read off the cells by `fieldB`. But a force in " +
              "this model is where space shortens or what momentum lands, and both are decided " +
              "by the collision rules, WHICH NEVER LOOK AT THE LABEL. So the model has " +
              "Ampère's LAW and not Ampère's FORCE, and the arc's account of two wires — its " +
              "facing exits carrying opposite signs when parallel — describes the OLD wire " +
              "construction that `magnetostatics` withdrew, where a cell put +1 on its up " +
              "exits and −1 on its down ones. That wire emits its two signs into opposite " +
              "hemispheres, which is what made its far field come out a power too steep",
          },
          note: `parallel and antiparallel agree to ${Math.abs(dPush.mean).toExponential(1)} ` +
            `in push and ${Math.abs(dPull.mean).toExponential(1)} in pull — not nearly, exactly`,
        }),
      ],
      table: {
        columns: ["configuration", "PUSH (momentum)", "±", "PULL (annihilation)", "±"],
        rows: [
          ["lone", lone.push.mean.toExponential(3), lone.push.err.toExponential(1),
            lone.pull.mean.toExponential(3), lone.pull.err.toExponential(1)],
          ["parallel", par.push.mean.toExponential(3), par.push.err.toExponential(1),
            par.pull.mean.toExponential(3), par.pull.err.toExponential(1)],
          ["antiparallel", anti.push.mean.toExponential(3), anti.push.err.toExponential(1),
            anti.pull.mean.toExponential(3), anti.pull.err.toExponential(1)],
        ],
      },
    };
  },
});

export default [parallelCurrentsAttract];
