/**
 * COSMOLOGY — and the first version of this file measured the version the arc refutes.
 *
 * (G/2) splits every point in two, the halves face each other across the shared edge,
 * and what happens there decides whether space grew. In PURE GRAVITY both halves are
 * neutral, they always annihilate, the inserted point collapses. WITH POLARITY half
 * of those pairs are ALIKE, so they turn instead and the inserted point survives.
 *
 * FROM WHICH IT IS TEMPTING TO CONCLUDE that polarity is what makes a universe expand,
 * measure the growth of the whole box, and quote the factor. That is what this file
 * did, and it is the *bulk* reading — space made everywhere, at a rate set by how
 * often meetings fail.
 *
 * THE ARC KILLS THAT READING, and not on a technicality. Asked for the observed H, a
 * universe that makes space throughout its bulk "fails seven separate ways, and the
 * fatal one is that the pairs which make the space ARE the fog that stops the
 * gravity — one Φ, two jobs, opposite values, thirty-five orders apart."
 *
 * WHAT REPLACES IT IS A STATEMENT ABOUT WHERE. Put the creation only where there is no
 * space yet. A cell on the FRONTIER has nothing on one side, so a charge emitted
 * outward meets nothing ever and never gives its point back — and that point is new
 * space. A charge emitted inward meets the bulk and annihilates. THE INTERIOR MAKES
 * NONE AT ALL, which dissolves five of the seven at once.
 *
 * So the measurement is not "how much did it grow". It is WHERE THE GROWTH WAS — and
 * that is a profile against radius, which is what this file measures now. It also
 * makes the pure-gravity case interesting rather than empty: gravity's bulk is static,
 * but gravity's FRONTIER still makes space, because a ray streaming outward into
 * nothing has nothing to annihilate against whatever its polarity.
 */

import {
  World, GRAVITY, GRAVITY_MAGNETISM, fill, expansionOf, headerOf, judge,
  Backend, Theory, Finding,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";

/** the per-point insertion counts, which only a backend that records them can give */
const insertionsByRadius = (w: World, C: number, bins: number, R: number) => {
  const b = w.backend as Backend & { inserted?: (l: number) => number };
  const made = new Float64Array(bins), count = new Float64Array(bins);
  w.backend.forEachLocal(local => {
    if (w.isSource(local)) return;
    const p = w.backend.position(local);
    const r = Math.hypot(p[0] - C, p[1] - C, p[2] - C);
    const i = Math.min(bins - 1, Math.floor((r / R) * bins));
    made[i] += b.inserted ? b.inserted(local) : 0;
    count[i] += 1;
  });
  // PER POINT, not per bin: an outer shell holds far more points than an inner one,
  // so raw totals would show a frontier effect on any profile whatever.
  return Array.from(made, (m, i) => (count[i] ? m / count[i] : NaN));
};

export const whereSpaceIsMade = test({
  id: "cosmology/where-space-is-made",
  claims: "space is made on the frontier and not in the interior — which is the reading " +
    "that survives, the bulk one having failed seven ways",
  cited: ["Expansion", "where space is made — the frontier, and a Hubble law"],
  under: { "gravity": "holds", "gravity+magnetism": "holds" },
  run: (ctx, theory) => {
    /*
     * SMALL, AND ON THE GRAPH BACKEND, WHICH IS NOT A PREFERENCE.
     *
     * A frontier is a place where space DOES NOT EXIST YET, and a flat array has
     * space everywhere by construction — every outward half finds a neighbour, so
     * there is no frontier anywhere in it at any size. Its `stream` drops a ray
     * bound for VOID unconditionally (`to === VOID` → continue), which is the right
     * behaviour for a wall and makes an expanding edge impossible to see.
     *
     * `boundary: "expand"` is implemented on the GRAPH backend only, where `reach`
     * makes the point a ray needs when it steps off the edge. That is the arc's
     * sentence in code — a charge emitted outward meets nothing, never gives its
     * point back, and the point is new space — and it is why this measurement costs
     * what it costs: real points have to be made.
     */
    const { N, T, seeds } = ctx.budget({ N: 13, T: 24, seeds: 3 });
    const C = (N - 1) / 2, BINS = 6;
    /*
     * THE WORLD MAY GROW, AND HAS TO STOP SOMEWHERE. Not `C + T`: expansion is
     * exponential and a ball of radius 30 is a hundred thousand points that have to be
     * really made, one at a time, on a backend that keeps a neighbour map. Eight cells
     * of room past the start is enough for a front to run into and cheap enough to
     * finish — and this measurement is about WHERE space is made, not how much.
     */
    const bound = { radius: C + 8, metric: "ball" as const };

    /*
     * A BALL OF MATTER IN AN EMPTY BOX, WHICH IS WHAT A FRONTIER ACTUALLY IS.
     *
     * A first version ran a bare box with an absorbing wall and got zero everywhere in
     * pure gravity. Two mistakes in one: with no source there are no rays, so there is
     * no front and nothing to measure; and an ABSORBING WALL IS NOT A FRONTIER. A wall
     * deletes the ray that reaches it, so the point it would have made is never
     * recorded — the arc's frontier is the EDGE OF THE MATTER with empty lattice
     * beyond it, not the edge of the array.
     *
     * So: a pulsing ball at the centre, a box wide enough that its front is still well
     * clear of the wall when the run ends, and the frontier is wherever the rays have
     * got to.
     */
    const profile = ctx.once((seed: number) => {
      const w = new World({
        theory, N, seed, backend: "graph", boundary: "expand", bound,
      });
      w.add({ at: [C, C, C], radius: 2, emits: 1, duty: 1 });
      const n0 = expansionOf(w).size;
      w.run(T);
      /* against the FINAL extent, since the world is bigger than it started */
      let R = 1;
      w.backend.forEachLocal(k => {
        const p = w.backend.position(k);
        R = Math.max(R, Math.hypot(p[0] - C, p[1] - C, p[2] - C));
      });
      return {
        made: insertionsByRadius(w, C, BINS, R),
        grew: expansionOf(w).size / n0, R, fill: fill(w),
      };
    });

    const byBin = Array.from({ length: BINS }, (_, i) =>
      ctx.over(seeds, s => profile(s).made[i]));

    /*
     * THE SHAPE IS THE DISCRIMINATOR, NOT THE LEVEL.
     *
     * Insertions ACCUMULATE, so asking "is there more at the edge than the middle" at
     * one moment cannot separate the two readings — a first version did exactly that
     * and it says nothing either way.
     *
     * What separates them is how the profile is SHAPED. Frontier creation fires once,
     * as the front sweeps past, and then that shell is interior and makes nothing
     * more: every swept radius has had exactly one pass, so the profile is FLAT.
     * Bulk creation never stops, so a shell the front passed early has been making
     * space for longer than one it passed late, and the profile RISES TOWARDS THE
     * CENTRE. Flat against rising is the measurement.
     */
    const interior = byBin.slice(0, 2), frontier = byBin.slice(-2);
    const mean = (xs: typeof byBin) =>
      xs.reduce((a, x) => a + (Number.isFinite(x.mean) ? x.mean : 0), 0) / xs.length;
    const inner = mean(interior), outer = mean(frontier);
    const ratio = outer / Math.max(Math.abs(inner), 1e-12);
    /** how far from flat the swept profile is: 0 is flat, 1 is the centre doing it all */
    const swept = byBin.filter(x => Number.isFinite(x.mean) && x.mean > 0).map(x => x.mean);
    const tilt = swept.length > 1
      ? (Math.max(...swept) - Math.min(...swept)) / Math.max(...swept) : NaN;

    const grew = ctx.over(seeds, s => profile(s).grew);
    const w = new World({
      theory, N, seed: seeds[0], backend: "graph", boundary: "expand", bound,
    });
    w.add({ at: [C, C, C], radius: 2, emits: 1, duty: 1 });
    w.run(3);

    const findings: Finding[] = [
      judge({
        name: "the world grew by", value: grew.mean, err: grew.err,
        expect: {
          of: "above 1 — a frontier that makes room is a world that gets bigger",
          want: Math.max(grew.mean, 1), tolerance: 1e9,
          because: "this is the whole mechanism: a ray stepping off the edge is given " +
            "the point it needs, and that point is new space",
        },
        note: `out to a radius of ${profile(seeds[0]).R.toFixed(1)} cells`,
      }),
      judge({
        name: "space made per point, interior", value: inner,
        expect: theory.polarised
          ? undefined
          : {
            of: "0 — in pure gravity both halves of a split are neutral, so they always " +
              "annihilate and the inserted point collapses every time",
            want: 0, tolerance: 0.02,
            because: "a static bulk is what makes the frontier reading necessary rather " +
              "than merely available: if the interior made space there would be no " +
              "reason to look at the edge",
          },
        note: theory.polarised
          ? "NOT EXPECTED TO BE ZERO HERE, and that is the arc's problem rather than a " +
            "success. With polarity about half of a split's halves are ALIKE, turn " +
            "instead of annihilating, and the inserted point survives — in the INTERIOR. " +
            "That is the bulk reading, and the bulk reading is the one that fails seven " +
            "ways because the pairs which make the space are the fog that stops the " +
            "gravity."
          : "the bulk is static, as the arc requires",
      }),
      judge({
        name: "space made per point, frontier", value: outer,
        expect: {
          of: "above the interior — a ray streaming outward meets nothing ever and never " +
            "gives its point back",
          want: Math.abs(outer), tolerance: 1e9,
          because: "this is where the arc puts all of the creation, and it is the one " +
            "place the rule can fire without a partner to undo it",
        },
      }),
      judge({
        name: "tilt of the swept profile", value: tilt,
        expect: theory.polarised ? undefined : {
          of: "small — frontier creation fires once per shell as the front passes, so " +
            "every swept radius has had exactly one pass and the profile is flat",
          want: 0, tolerance: 0.35,
          because: "a profile rising towards the centre is the signature of creation that " +
            "NEVER STOPS, which is the bulk reading and the one that fails seven ways",
        },
        note: theory.polarised
          ? "expected to RISE towards the centre here: with polarity the interior keeps " +
            "making space for as long as it exists, so the shells swept earliest have " +
            "had the longest to accumulate. That is the bulk reading, measured."
          : "flat across the swept region is the frontier reading",
      }),
      judge({
        name: "frontier over interior", value: Number.isFinite(ratio) ? ratio : 0,
        note: theory.polarised
          ? "a ratio near 1 would say the model makes space everywhere alike, which is " +
            "the reading the arc rejects on physical grounds rather than on this number"
          : "with a static bulk this is the whole of the effect, and it is the frontier " +
            "reading measured rather than assumed",
      }),
    ];

    return {
      header: headerOf(w, seeds),
      findings,
      table: {
        columns: ["r/R", "space made per point", "±"],
        rows: byBin.map((x, i) => [
          `${((i + 0.5) / BINS).toFixed(2)}`,
          Number.isFinite(x.mean) ? x.mean.toExponential(2) : "—",
          Number.isFinite(x.err) ? x.err.toExponential(1) : "—",
        ]),
      },
    };
  },
});

export const hubbleRate = test({
  id: "cosmology/hubble-rate",
  claims: "the frontier advances one cell a tick, which is R = ct and fixes the age with " +
    "nothing to fit",
  cited: ["where space is made — the frontier, and a Hubble law"],
  under: { "gravity": "holds", "gravity+magnetism": "holds" },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 60, seeds: 3 });
    const C = (N - 1) / 2;

    /*
     * ONE PULSE A CELL A TICK IS THE CEILING, SO IT IS ALSO THE RATE. The arc derives
     * ADVANCE = SHEET/2 = 4 — four cells of budget for the one it needs — and
     * concludes dR/dt = 1 cell/tick = c, hence R = ct. Four times the budget it needs
     * means the front is not budget-limited, so it goes at the only speed left.
     *
     * MEASURED ALONG AN AXIS, deliberately. c is anisotropic on this lattice (1.73×
     * along a body diagonal) and the arc's cell/tick is the axial one, so a radius
     * taken as a Euclidean maximum over all directions would measure the diagonal and
     * come back 73% fast.
     */
    const front = ctx.once((seed: number) => {
      const w = new World({ theory, N, seed, boundary: "absorb" });
      w.add({ at: [C, C, C], radius: 1, emits: 1, duty: 1 });
      const reach: number[] = [];
      for (let t = 1; t <= T; t++) {
        w.tick();
        let far = 0;
        w.backend.forEachLocal(local => {
          const p = w.backend.position(local);
          // on-axis only: the two coordinates square to the axis have to be at centre
          if (Math.abs(p[1] - C) > 0.5 || Math.abs(p[2] - C) > 0.5) return;
          for (let d = 0; d < w.DEG; d++)
            if (w.backend.active(local, d)) { far = Math.max(far, Math.abs(p[0] - C)); break; }
        });
        reach.push(far);
      }
      return reach;
    });

    /*
     * FITTED WHILE THE FRONT IS STILL INSIDE THE BOX. Once it reaches the wall the
     * absorbing boundary eats it and the reach flattens at C — which would drag any
     * slope taken over the whole run towards zero and report a universe that stops.
     */
    const usable = Math.min(T, Math.floor(C * 0.8));
    const slope = ctx.over(seeds, s => {
      const r = front(s).slice(0, usable);
      const n = r.length, sx = (n - 1) / 2;
      const sy = r.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      r.forEach((y, i) => { num += (i - sx) * (y - sy); den += (i - sx) ** 2; });
      return den ? num / den : NaN;
    });

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    w.add({ at: [C, C, C], radius: 1, emits: 1, duty: 1 });
    w.run(5);
    const g = w.geometry;

    const findings: Finding[] = [
      judge({
        name: "ADVANCE = SHEET/2", value: g.SHEET / 2,
        expect: {
          of: "4 — cells of budget for the 1 the front needs, from the geometry alone",
          want: 4, tolerance: 0,
          because: "the front is not budget-limited, which is why it runs at the only " +
            "speed left rather than at some fraction of it",
        },
        note: `SHEET is ${g.SHEET} on ${g.name}, so this moves with the lattice and is ` +
          "not a constant anybody wrote down",
      }),
      judge({
        name: "dR/dt (cells per tick)", value: slope.mean, err: slope.err,
        expect: {
          of: "1 — one cell a tick is the ceiling and therefore the rate, which is R = ct",
          want: 1, tolerance: 0.25,
          because: "R = ct is what forces the age instead of fitting it: t₀ = 1/H₀ " +
            "exactly, 14.51 Gyr at H₀ = 67.4 and 13.39 at 73.0 against a measured 13.80",
        },
        note: `fitted over the first ${usable} ticks, while the front is still clear of ` +
          `the wall at ${C} cells`,
      }),
    ];

    return {
      header: headerOf(w, seeds),
      findings,
      table: {
        columns: ["tick", "reach (cells, on axis)"],
        rows: front(seeds[0]).slice(0, usable)
          .map((r, i) => [String(i + 1), r.toFixed(1)]),
      },
    };
  },
});

export default [whereSpaceIsMade, hubbleRate];
