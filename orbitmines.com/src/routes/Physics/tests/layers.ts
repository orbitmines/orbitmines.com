/**
 * TWO LAYERS, BOTH OF THEM THE SAME AUTOMATON — which is what Layer 2 was supposed to be
 * and what nothing in this repository has ever run.
 *
 * The article builds Layer 2 twice and implements it neither time. `Layer 2: Matter`
 * makes it a ribbon graph, which is a story about graphs rather than about the rules.
 * `Layer 2: Charge, Phase and Matter` makes it a strand winding on the directions Layer 1
 * leaves vacant, and says the thing that matters: NORTH BELONGS TO LAYER 1 AND IS WHAT
 * EMITS; THE AXIS IS WHAT A LAYER-2 STRAND WINDS AROUND. Two structures, one lattice.
 *
 * SO LAYER 2 IS NOT A LABEL, A COUNT, OR A BOOKKEEPING TERM. It is the SAME THREE RULES —
 * (G+M/1) annihilate on opposite, (G+M/2) create in neutral, (G+M/3) turn on alike —
 * running on their own field, with their own charges, on the same cells. Its "charge" is
 * a polarity of ±1 on a ray, exactly as Layer 1's is. A net traversal sense is what you
 * get by summing those, which is a reading of the state and not the state.
 *
 * WHAT IS NOT DECIDED, AND IS THE WHOLE POINT OF THIS FILE, is how they exchange. The
 * model has three rules and nothing else, so a coupling has to be one of them firing
 * across the layers rather than within one. Four candidates, run against each other, with
 * an uncoupled control:
 *
 *   none     two independent copies. The control, and the check that Layer 2 really is
 *            the same automaton — its occupancy has to come out at Layer 1's.
 *   blocks   a cell busy in Layer 1 does not split in Layer 2. This is (G+M/2) suppressed
 *            by density, which is the gravity mechanism read across layers.
 *   feeds    where Layer 1 annihilated, Layer 2 gets the neutral point to create in.
 *            This is `vacuum/annihilation-feeds-expansion`, across layers.
 *   turns    a cell where Layer 1 turned turns Layer 2's rays with it. THE ONE THAT
 *            MATTERS for the strand: it is how a Layer-1 texture would drive a Layer-2
 *            winding, which is what minimal coupling would have to be here.
 */

import {
  World, GRAVITY_MAGNETISM, Theory, fill, scattering, headerOf, judge, Finding,
  expand, streamRule, emitRule, collide, moveRule, DEFLECT,
} from "../DISCRETE";
import { test } from "../SUITE";

export type Coupling = "none" | "blocks" | "feeds" | "turns";

/**
 * The two layers, ticked together, with the exchange applied between them.
 *
 * TWO `World`s RATHER THAN ONE WORLD WITH MORE CHANNELS, and that is the point rather
 * than an implementation convenience: Layer 2 has to be able to run when Layer 1 is
 * switched off, or "separate from the behaviour of Layer 1" is not a claim about
 * anything. The coupling is then a thing that is added, and can be taken away.
 */
export class Layers {
  readonly one: World;
  readonly two: World;
  /** rays Layer 2 lost to the coupling, and points it was handed — the exchange, counted */
  blocked = 0; handed = 0; turned = 0;

  constructor(o: { theory?: Theory; N: number; seed: number; coupling: Coupling }) {
    const theory = o.theory ?? GRAVITY_MAGNETISM;
    this.one = new World({ theory, N: o.N, seed: o.seed, boundary: "wrap" });
    /*
     * A DIFFERENT SEED, because two copies of one automaton on one seed are one automaton
     * written twice — every ray in step, every meeting simultaneous, and any "exchange"
     * measured between them is the seed and not the coupling.
     */
    /*
     * LAYER 2'S OWN THEORY IS LAYER 1'S THEORY, with the split suppressed where the
     * coupling says. Building it out of the same four rules rather than deriving from
     * `theory` is deliberate: it is the check that nothing new has been introduced, since
     * every rule here is the one Layer 1 is already made of.
     */
    const busy = (w: World, k: number) => {
      for (let d = 0; d < this.one.geometry.DEG; d++) if (this.one.backend.active(k, d)) return true;
      return false;
    };
    const twoTheory: Theory = o.coupling !== "blocks" ? theory : {
      ...theory,
      name: `${theory.name} · layer 2`,
      rules: () => [expand({ sign: "perNode", blocks: busy }), streamRule(), emitRule(),
        collide({ opposite: "annihilate", alike: DEFLECT.spin(), neutral: "annihilate" }),
        moveRule()],
    };
    this.two = new World({ theory: twoTheory, N: o.N, seed: o.seed ^ 0x5bf03635, boundary: "wrap" });
    this.coupling = o.coupling;
  }
  readonly coupling: Coupling;

  tick() {
    const b1 = this.one.backend, b2 = this.two.backend, g = this.one.geometry;
    const before = this.one.destroyed.slice();
    const defl0 = this.one.stats.deflections;

    this.one.tick();

    /* what Layer 1 did this tick, per cell, which is all a local coupling may read */
    const destroyedHere = (k: number) => this.one.destroyed[k] - before[k];

    if (this.coupling !== "none") {
      const n = b2.size();
      for (let k = 0; k < n; k++) {
        if (this.two.isSource(k)) continue;
        if (this.coupling === "blocks") {
          /* done inside Layer 2's own expand rule — see the theory above. Counted here */
          let anyBusy = false;
          for (let d = 0; d < g.DEG; d++) if (b1.active(k, d)) { anyBusy = true; break; }
          if (anyBusy) this.blocked++;
        } else if (this.coupling === "feeds") {
          /* where Layer 1 destroyed space, Layer 2 is handed the neutral point it left */
          if (destroyedHere(k) > 0) {
            let empty = true;
            for (let d = 0; d < g.DEG; d++) if (b2.active(k, d)) { empty = false; break; }
            if (empty) {
              const s = this.two.rng() < 0.5 ? 1 : -1;
              for (const a of g.AXES) { b2.put(k, a, s as any); b2.put(k, g.OPP[a], s as any); }
              this.handed++;
            }
          }
        }
      }
      if (this.coupling === "turns" && this.one.stats.deflections > defl0) {
        /*
         * THE TEXTURE DRIVING THE WINDING. Layer 1 turned somewhere this tick, so Layer 2
         * turns with it — every Layer-2 ray steps one place round the same ring. This is
         * the only one of the four that moves a PHASE rather than a density, and it is
         * what a Layer-1 north that varies in space would have to do to a strand.
         */
        const table = g.turnTable(g.ringAxis);
        const n = b2.size();
        for (let k = 0; k < n; k++) {
          if (this.two.isSource(k)) continue;
          /*
           * CARRYING THE CHANNELS WITH THE RAY, which a first version did not — and the
           * turn count is what `scattering` averages, so relocating rays without it read
           * as the medium having stopped scattering (0.021 against 1.279) when nothing had
           * changed but the bookkeeping.
           */
          const moved: [number, number, number][] = [];
          for (let d = 0; d < g.DEG; d++) if (b2.active(k, d))
            moved.push([table[d], b2.charge(k, d), b2.channelAt("turns", k, d)]);
          if (!moved.length) continue;
          for (let d = 0; d < g.DEG; d++) if (b2.active(k, d)) b2.clear(k, d);
          for (const [to, c, t] of moved) {
            b2.put(k, to, c as any);
            b2.setChannel("turns", k, to, t + 1);
          }
          this.turned += moved.length;
        }
      }
    }

    this.two.tick();
  }

  run(T: number) { for (let t = 0; t < T; t++) this.tick(); return this; }
}

export const layerTwoIsTheSameAutomaton = test({
  id: "layer2/is-the-same-automaton",
  claims: "Layer 2 is the three rules again on their own field, so uncoupled it settles at " +
    "exactly Layer 1's occupancy — and of three candidate exchanges two are real and " +
    "different in kind: one moves the density, one moves the phase, and one does nothing",
  cited: ["Layer 2: Charge, Phase and Matter", "Layer 2: Matter"],
  under: { "gravity+magnetism": "holds" },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 21, T: 160, seeds: 3 });

    const at = ctx.once((coupling: Coupling, seed: number) => {
      const L = new Layers({ theory, N, seed, coupling }).run(T);
      return {
        f1: fill(L.one), f2: fill(L.two),
        s1: scattering(L.one), s2: scattering(L.two),
        blocked: L.blocked, handed: L.handed, turned: L.turned,
      };
    });

    const COUPLINGS: Coupling[] = ["none", "blocks", "feeds", "turns"];
    const got = COUPLINGS.map(c => ({
      c,
      f1: ctx.over(seeds, s => at(c, s).f1),
      f2: ctx.over(seeds, s => at(c, s).f2),
      s2: ctx.over(seeds, s => at(c, s).s2),
      exch: ctx.over(seeds, s => { const r = at(c, s); return r.blocked + r.handed + r.turned; }),
    }));
    const by = (c: Coupling) => got.find(x => x.c === c)!;
    const free = by("none");

    /* a single layer, run alone, so "the same automaton" is against something */
    const alone = ctx.over(seeds, s => {
      const w = new World({ theory, N, seed: s, boundary: "wrap" });
      w.run(T); return fill(w);
    });

    const findings: Finding[] = [
      judge({
        name: "uncoupled Layer 2's occupancy against a lattice run on its own",
        value: Math.abs(free.f2.mean - alone.mean) / alone.mean,
        expect: {
          of: "0 — because it IS the same automaton, not a model of one",
          want: 0, tolerance: 0.05,
          because: "the three rules on their own field have to settle where the three rules " +
            "settle. If this missed, Layer 2 would be a different theory wearing the name — " +
            "and the whole point of the second layer is that it is not a new mechanism",
        },
      }),
      judge({
        name: "the two layers' occupancies, uncoupled, over their mean",
        value: Math.abs(free.f1.mean - free.f2.mean) / ((free.f1.mean + free.f2.mean) / 2),
        expect: {
          of: "0 — same rules, same lattice, different seeds",
          want: 0, tolerance: 0.05,
          because: "SEPARATE BEHAVIOUR IS THE CLAIM AND SAMENESS OF LAW IS THE CHECK. Two " +
            "copies on different seeds must agree on what the law settles at while agreeing " +
            "on nothing else, which is what makes them two and not one written twice",
        },
      }),
      judge({
        name: "candidates that move something measurable in Layer 2", value:
          COUPLINGS.filter(c => c !== "none" && (
            Math.abs(by(c).f2.mean - free.f2.mean) / free.f2.mean >= 0.02 ||
            Math.abs(by(c).s2.mean - free.s2.mean) / free.s2.mean >= 0.5)).length,
        expect: {
          of: "2 of the 3 — `blocks` and `turns`, and `feeds` is a null",
          want: 2, tolerance: 0,
          because: "AND IT HAS TO BE ASKED OF DENSITY AND PHASE BOTH, which a first version " +
            "did not. Read against occupancy alone `turns` looks inert at +1.1%, and it is " +
            "moving the turn count from 1.28 to 72.5, which is the whole of what it is for. " +
            "`feeds` moves neither: handing Layer 2 the neutral points Layer 1 destroyed is " +
            "handing it something it already had, since (G/2) fires on every empty point " +
            "anyway and Layer 1's annihilations are not where Layer 2 happens to be short of " +
            "them. A coupling has to give a layer something it could not get alone",
        },
      }),
      { name: "how far `blocks` thins Layer 2", value: (by("blocks").f2.mean - free.f2.mean) / free.f2.mean,
        note: "suppressing the split where Layer 1 is busy is `cosmology/blocked-expansion` " +
          "across layers, and it thins the blocked layer by a third while RAISING its turn " +
          "count, because what survives is older and has met more" },
      { name: "how far `turns` moves Layer 2's turn count", value: by("turns").s2.mean / free.s2.mean,
        note: "A PHASE COUPLING AND NOT A DENSITY ONE, which is what minimal coupling would " +
          "have to be here: a Layer-1 texture turning a Layer-2 strand without adding or " +
          "removing anything. This is the candidate the strand construction needs" },
      { name: "Layer 2 occupancy, uncoupled", value: free.f2.mean, err: free.f2.err,
        note: "the number a single lattice settles at, reached by a second field that shares " +
          "nothing with the first but its rules" },
    ];

    return {
      header: headerOf(new World({ theory, N, seed: seeds[0], boundary: "wrap" }), seeds),
      findings,
      table: {
        columns: ["coupling", "L1 fill", "L2 fill", "L2 scattering", "L2 vs uncoupled", "exchanges"],
        rows: got.map(x => [x.c, x.f1.mean.toFixed(4), x.f2.mean.toFixed(4),
          x.s2.mean.toFixed(3),
          ((x.f2.mean - free.f2.mean) / free.f2.mean * 100).toFixed(1) + "%",
          x.exch.mean.toExponential(2)]),
      },
    };
  },
});

export default [layerTwoIsTheSameAutomaton];
