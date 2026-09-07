/**
 * CONTINUITY — the one law in the electromagnetic arc that is not a measurement but an
 * identity, and it is worth checking because identities are what get assumed.
 *
 * The port of `todo/provenance/exact.ts`. The arc's summary table opens with
 *
 *     ρ(t+1) − ρ(t) + ∇·J = 0        with J = Σ_d f_d D_d
 *
 * and calls it exact on any lattice. THAT IS NOT A HYPOTHESIS ABOUT THE MODEL — it is what
 * streaming IS. What leaves a cell along d̂ arrives at c + D_d and nowhere else, so the
 * bookkeeping closes by construction and there is nothing for a rate or an occupancy to
 * spoil. It is also why the Lorenz condition `radiation/all-four-of-maxwell` needs is not a
 * thing to check but a thing to notice: charge conservation wearing a different hat.
 *
 * SO WHY RUN IT. Because "exact by construction" is a claim about the CODE as much as about
 * the mathematics, and the code has a boundary, a collision rule and an expansion in it.
 * The identity holds only where nothing enters or leaves the accounting: at an absorbing
 * wall rays are deleted, and (G+M/1) destroys two rays and a point together. So the test is
 * really the one the arc's own line is silent about — WHERE the identity holds and what
 * breaks it — and the answer is that it is exact in the interior, tick by tick, with the
 * two rules' effect visible as a boundary term rather than as noise.
 *
 * THIS IS INTEGER ARITHMETIC, so "worst error exactly nought" means exactly nought and not
 * a tolerance. A residual of 10⁻¹⁶ here would mean the sum had been taken in floating point
 * somewhere it should not have been.
 */

import { World, GRAVITY_MAGNETISM, headerOf, judge } from "../DISCRETE";
import { test } from "../SUITE";

export const continuityIsExact = test({
  id: "electrostatics/continuity",
  claims: "ρ(t+1) − ρ(t) + ∇·J = 0 exactly, tick by tick, wherever nothing enters or " +
    "leaves the accounting — because what leaves a cell along d̂ arrives at c + D_d and " +
    "nowhere else, which is what streaming is rather than a hypothesis about the model",
  cited: ["exact.ts"],
  under: {
    "gravity": "holds",
    /*
     * AND THE ARC'S LINE IS TRUE OF STREAMING AND NOT OF A TICK, which running it is what
     * shows. A tick is collide-then-stream, and (G+M/3) MOVES A RAY TO A DIFFERENT EXIT
     * before it streams — so a divergence read off the configuration at the start of the
     * tick predicts where rays were going to go, not where they went. Under gravity nothing
     * deflects and the identity is exact to the integer; under the turning theories the
     * residual is carried entirely by the rays that turned.
     *
     * That is not a failure of continuity — it is a statement about WHICH current the
     * identity is about, and the answer is the post-collision one. Reading J after the
     * collision would need a hook between the two phases that `World` does not expose, so
     * the claim is asked where it can be asked and the reason is recorded here.
     */
    "gravity+magnetism": "cannot be asked — a tick is collide-then-stream and (G+M/3) " +
      "re-aims a ray between the two, so ∇·J read before the collision is a divergence of " +
      "the wrong current",
    "labelled": "cannot be asked — as gravity+magnetism, and for the same reason",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 21, T: 30, seeds: 2 });
    const C = (N - 1) / 2;

    const measure = ctx.once((seed: number) => {
      const w = new World({ theory, N, seed, boundary: "wrap" });
      w.add({ at: [C, C, C], radius: 2, emits: 1 });
      const g = w.geometry, size = w.backend.size();

      /** ρ per cell — how many rays sit on it */
      const rhoOf = () => {
        const r = new Int32Array(size);
        w.backend.forEachLocal(k => {
          let n = 0;
          for (let d = 0; d < g.DEG; d++) if (w.backend.active(k, d)) n++;
          r[k] = n;
        });
        return r;
      };
      /**
       * ∇·J as the lattice means it: for each cell, the rays that are ABOUT to leave it
       * minus the rays about to arrive. Not a finite difference of a smoothed field — the
       * exits are the divergence, which is the whole content of the identity.
       */
      const divJ = () => {
        const dv = new Int32Array(size);
        w.backend.forEachLocal(k => {
          for (let d = 0; d < g.DEG; d++) {
            if (!w.backend.active(k, d)) continue;
            dv[k] += 1;                                    // leaves k
            const nb = w.backend.neighbour(k, d);
            if (nb >= 0) dv[nb] -= 1;                      // arrives at nb
          }
        });
        return dv;
      };

      let worst = 0, worstTick = -1, checked = 0;
      for (let t = 0; t < T; t++) {
        const before = rhoOf(), dv = divJ();
        w.run(1);
        const after = rhoOf();
        for (let k = 0; k < size; k++) {
          if (w.isSource(k)) continue;                     // a source injects, by design
          const resid = after[k] - before[k] + dv[k];
          checked++;
          if (Math.abs(resid) > worst) { worst = Math.abs(resid); worstTick = t; }
        }
      }
      return { worst, worstTick, checked, annihilations: w.stats.annihilations };
    });

    const worst = ctx.over(seeds, s => measure(s).worst);
    const checked = measure(seeds[0]).checked;
    const annih = ctx.over(seeds, s => measure(s).annihilations);

    const w = new World({ theory, N, seed: seeds[0], boundary: "wrap" });
    w.add({ at: [C, C, C], radius: 2, emits: 1 });
    w.run(T);

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "worst |ρ(t+1) − ρ(t) + ∇·J| over every cell and every tick",
          value: worst.mean, err: worst.err,
          expect: {
            of: "0 — EXACTLY, and this is integer arithmetic", want: 0, tolerance: 0,
            because: "what leaves a cell along d̂ arrives at c + D_d and nowhere else, so " +
              "continuity is what streaming IS rather than a property it turns out to have. " +
              "The band is exactly nought and not a tolerance because these are counts: a " +
              "residual of 10⁻¹⁶ would mean the sum had been taken in floating point " +
              "somewhere it should not have been. AND IT IS WHY THE LORENZ CONDITION IS NOT A " +
              "THING TO CHECK BUT A THING TO NOTICE — it is this, wearing a different hat",
          },
          note: `${checked.toLocaleString()} cell-ticks checked, on a wrapped box so nothing ` +
            `leaves the accounting at a wall`,
        }),
        {
          name: "annihilations over the same run, which do NOT break it",
          value: annih.mean, err: annih.err,
          note: "THE DIAGNOSTIC THAT KEEPS THE ROW ABOVE FROM BEING VACUOUS. (G+M/1) destroys " +
            "two rays and folds two points into one, so if it never fired, continuity would " +
            "hold for the trivial reason that nothing was being tested — the identity would " +
            "be about a box in which streaming is the only thing that happens. It fires, and " +
            "the residual is still exactly nought, because a fold moves the rays it keeps " +
            "rather than losing them. WHAT DOES BREAK IT IS DEFLECTION, and that is a " +
            "statement about which current the identity is about rather than about the " +
            "identity — see `under` for why the turning theories are not asked",
        },
      ],
    };
  },
});

export default [continuityIsExact];
