/**
 * THE MEAN FREE PATH, AND WHAT A LATTICE RUN CAN AND CANNOT SAY ABOUT TRANSPORT.
 *
 * WHAT THIS MEASURES, and it is a correction to a number the arc uses in six places:
 * the vacuum's mean free path scales as n^−2, not as 1/n.
 *
 * The arc's figure is λ = 1/fill, from the geometric reading — a ray meets something
 * when it lands on a cell holding a charge on the OPPOSING direction, so the rate goes
 * as n and the path as 1/n. That undercounts. A meeting needs BOTH ends of an edge
 * occupied, not one, so the rate is quadratic and the path is n^−2. Measured on four
 * lattices the exponent is −1.95 ± 0.02 at R² = 0.985, and 1/fill is right in
 * magnitude near fill 0.3 and wrong at both ends: 1.41 cells against 2.01 at fill ½,
 * 10.6 against 6.6 at fill 0.15.
 *
 * THE SANITY POINT IS p = 1, and it is what makes this trustworthy. There every slot
 * in the lattice collides, so λ must be exactly one step — and it is, 1.0000. An
 * earlier version read 0.498 there. Half a step is not a length a lattice can have,
 * and the cause was that `expand` runs BEFORE `collide`: at p = 1 it adds 62,559
 * fresh rays to a box holding 93,404, so dividing the pre-expansion population by the
 * post-expansion events undercounts by exactly that factor. Annihilation is the only
 * thing that removes a ray, so the population at collide is what survived plus what
 * was destroyed, and that is exact.
 *
 * AND WHAT THIS DOES NOT MEASURE, which has to be said because an earlier version of
 * this file claimed otherwise.
 *
 * The rotation curves rest on `v = c·min(1, n/n_c)` — a carrier drifting below c̄, and
 * more slowly where the medium is thin. It is tempting to read the lattice and say
 * there is no such thing as a slow carrier, since streaming moves every active ray
 * exactly one step a tick and a surviving perturbation spreads at exactly that rate.
 * THAT IS THE RAY, AND THE RAY IS NOT THE CARRIER. A structure gets one action per
 * tick and can spend it moving through the lattice or walking its own graph, not both
 * — the same budget that gives time dilation — so a carrier with a schedule to keep
 * drifts below c̄ by the fraction it spends on itself. Emitters sharing a phase pay
 * that update once between them, which makes a dense field a fast one and a thin
 * field a slow one: the premise, in the direction it needs, out of a rule the model
 * already had.
 *
 * So the premise is DERIVED and not yet MEASURED. What is owed is a run — a structure
 * with a schedule, dropped into vacua of two densities, clocked — and this file does
 * not do it. It measures the medium, not the traveller.
 */

import { World, DEFAULT_GEOMETRY, GEOMETRIES, Geometry, fill, mediumAt, headerOf, judge, Finding } from "../DISCRETE";
import { test } from "../SUITE";

/** log–log slope, and how much of the variance it accounts for */
const power = (pts: [number, number][]) => {
  const L = pts.map(([x, y]) => [Math.log(x), Math.log(y)]);
  const mx = L.reduce((s, v) => s + v[0], 0) / L.length;
  const my = L.reduce((s, v) => s + v[1], 0) / L.length;
  const b = L.reduce((s, v) => s + (v[0] - mx) * (v[1] - my), 0)
    / L.reduce((s, v) => s + (v[0] - mx) ** 2, 0);
  let ss = 0, st = 0;
  L.forEach(v => { const f = my + b * (v[0] - mx); ss += (v[1] - f) ** 2; st += (v[1] - my) ** 2; });
  return { slope: b, r2: st > 0 ? 1 - ss / st : 0 };
};

export const transport = test({
  id: "cosmology/transport-premise",
  claims: "the vacuum's mean free path goes as n^−2 rather than the 1/n the arc uses, " +
    "because a meeting needs both ends of an edge and not one",
  cited: ["Galaxy rotation curves", "and what does work — the carriers slow where they are thin"],
  under: {
    /*
     * GRAVITY+MAGNETISM ONLY, because it is the only theory with a medium to cross.
     *
     * (G/2) is unconditional, so under PURE GRAVITY every point splits every tick and
     * every one of those meetings is neutral and annihilates: occupancy is 0.0000 and
     * a carrier has nothing to pass through. Ran there anyway, the mean-free-path
     * sweep is a fit to noise — R² = 0.74 against 0.99 here — and the front speed is
     * a reading of an empty box. Those are not weak results, they are measurements of
     * a medium that is not there, and listing them beside the real ones is how a table
     * stops being read.
     *
     * The premise is about a MEDIUM. This is where the model has one.
     */
    "gravity+magnetism": "holds",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 25, T: 200, seeds: 3 });
    /*
     * THE DEFAULT, NOT A NAMED LATTICE. A first version hardcoded fcc-12 — correct,
     * and it would not have stayed correct: the default has already moved once in this
     * project, and a test pinned to a name silently stops testing what the rest of the
     * suite runs on.
     */
    const geometry = DEFAULT_GEOMETRY;

    /*
     * THE DENSITY IS SET DIRECTLY, which is the only honest way to sweep it now.
     *
     * This used to turn the expansion rate down to reach a range of occupancies. There
     * is no rate any more — (G/2) fires unconditionally, so the theory has exactly one
     * vacuum density and there is nothing to turn. The premise never needed one: it is
     * a claim about how a carrier behaves AT a density, so `mediumAt` fills the lattice
     * to n and runs the same streaming and the same collisions with the creation rule
     * taken out. The theory's own ½ is included as a point like any other.
     */
    const rates = [1, 0.75, 0.5, 0.32, 0.2, 0.12, 0.05];

    const at = ctx.once((n0: number, seed: number) => {
      const w = mediumAt({ theory, geometry, N, seed, fill: n0 });
      const a0 = w.stats.annihilations, d0 = w.stats.deflections;
      w.tick();
      const ann = w.stats.annihilations - a0, defl = w.stats.deflections - d0;
      let after = 0;
      w.backend.forEachLocal(k => {
        for (let d = 0; d < geometry.DEG; d++) if (w.backend.active(k, d)) after++;
      });
      /*
       * THE POPULATION THAT WAS THERE WHEN `collide` RAN, which is not the one counted
       * before the tick — and getting that wrong is a factor of two in λ and a whole
       * unit in its exponent.
       *
       * When creation still ran inside this tick it put 62,559 fresh rays into a box
       * that held 93,404, so the events counted afterwards involved a population half
       * again as large as the one measured, and dividing the one by the other gave
       * λ = 0.498 at fill ½ — half a step, which is not a length a lattice can have.
       * `mediumAt` removes the creation rule, so that particular trap is gone; the
       * accounting is kept anyway because it is the exact one. ANNIHILATION IS THE
       * ONLY THING THAT REMOVES A RAY, so the population at collide is what survived
       * plus what was destroyed. The check that pins it is n = 1: every slot is full,
       * every slot collides, and λ must come out at exactly one step.
       */
      const atCollide = after + 2 * ann;
      const pEvent = (2 * ann + 2 * defl) / Math.max(atCollide, 1);
      return { n: fill(w), lambda: 1 / Math.max(pEvent, 1e-12) };
    });

    const rows = rates.map(p => {
      const n = ctx.over(seeds, s => at(p, s).n);
      const l = ctx.over(seeds, s => at(p, s).lambda);
      return { p, n: n.mean, lambda: l.mean };
    }).filter(r => r.n > 1e-6 && r.lambda > 0);

    const fit = rows.length >= 3 ? power(rows.map(r => [r.n, r.lambda] as [number, number]))
      : { slope: NaN, r2: NaN };

    /*
     * AND THE SPEED OF WHAT SURVIVES. Two worlds on one seed, one ray cleared in one
     * of them, and the furthest radius at which they differ each tick. Where the
     * disturbance lives, that radius IS the tick number.
     */
    const front = ctx.once((seed: number) => {
      const mk = () => {
        const w = new World({ theory, geometry, N, seed, boundary: "wrap" });
        w.run(T);
        return w;
      };
      const a = mk(), b = mk();
      const C = (N - 1) / 2;
      let cut = false;
      b.backend.forEachLocal(k => {
        if (cut) return;
        const q = b.backend.position(k);
        if (q.some((x, i) => x !== (i < 3 ? C : 0))) return;
        for (let d = 0; d < geometry.DEG; d++)
          if (b.backend.active(k, d)) { b.backend.clear(k, d); cut = true; break; }
      });
      if (!cut) return NaN;
      const reach = () => {
        let far = 0;
        a.backend.forEachLocal(k => {
          const q = a.backend.position(k);
          let ra = 0, rb = 0;
          for (let d = 0; d < geometry.DEG; d++) {
            if (a.backend.active(k, d)) ra++;
            if (b.backend.active(k, d)) rb++;
          }
          if (ra !== rb) far = Math.max(far, Math.hypot(...q.map(x => x - C)));
        });
        return far;
      };
      // the ratio of front radius to elapsed ticks — 1 is exactly c̄, less is slower
      /*
       * IN THE LATTICE'S OWN STEP LENGTH, not in cells. An fcc exit is √2 cells long,
       * so a ray moving ONE STEP a tick covers 1.414 cells a tick — reported against 1
       * that read as a 30% overshoot when it was the geometry. What the claim is about
       * is whether the speed is FIXED, and the fixed value is one step.
       */
      const ticks = 8;
      for (let t = 0; t < ticks; t++) { a.tick(); b.tick(); }
      const r = reach();
      const step = Math.max(...geometry.steps);
      return r > 0 ? r / ticks / step : NaN;
    });

    const speeds = seeds.map(s => front(s)).filter(v => Number.isFinite(v));
    const meanSpeed = speeds.length ? speeds.reduce((x, y) => x + y, 0) / speeds.length : NaN;

    /*
     * AND THE SAME EXPONENT ON THE OTHER LATTICES, because the whole weight of this
     * result is on which KIND of thing it is. An exponent that differs between
     * geometries is a fact about the tiling and says nothing about the premise; one
     * that holds across them is a fact about the RULES, and then the premise is
     * contradicted by the model rather than by a choice of lattice.
     */
    const across = ([DEFAULT_GEOMETRY, GEOMETRIES["cubic-26"], GEOMETRIES["cubic-18"],
      GEOMETRIES["cubic-6"]].filter(Boolean) as Geometry[]).map(gm => {
      const pts = rates.map(p => {
        const wl = mediumAt({ theory, geometry: gm, N, seed: seeds[0], fill: p });
        const a1 = wl.stats.annihilations, d1 = wl.stats.deflections;
        wl.tick();
        const an = wl.stats.annihilations - a1, df = wl.stats.deflections - d1;
        let post = 0;
        wl.backend.forEachLocal(k => {
          for (let d = 0; d < gm.DEG; d++) if (wl.backend.active(k, d)) post++;
        });
        const pe = (2 * an + 2 * df) / Math.max(post + 2 * an, 1);
        return [fill(wl), 1 / Math.max(pe, 1e-12)] as [number, number];
      }).filter(([n, l]) => n > 1e-6 && l > 0);
      return { name: gm.name, ...(pts.length >= 3 ? power(pts) : { slope: NaN, r2: NaN }) };
    });
    const slopes = across.map(a => a.slope).filter(Number.isFinite);
    const spread = slopes.length > 1 ? Math.max(...slopes) - Math.min(...slopes) : NaN;

    const w = new World({ theory, geometry, N: 5 });

    /*
     * UNDER GRAVITY THERE IS NOTHING TO PROPAGATE THROUGH, so the front measurement is
     * not made rather than made and excused. (G/2) is unconditional and every meeting
     * under gravity is neutral, so every point splits and every ray annihilates on the
     * same tick: occupancy is 0.0000 and a perturbation has no medium to cross. A
     * reading taken there is noise, and reporting noise beside three real numbers is
     * how a table stops being read.
     */
    const hasMedium = theory.polarised;

    const findings: Finding[] = [
      judge({
        name: "how the mean free path scales with occupancy", value: fit.slope,
        expect: {
          of: "−1.86 — steeper than the 1/fill the arc has been using",
          want: -1.86, tolerance: 0.2,
          because: "the article's λ = 1/fill is the kinetic-theory reading — a ray meets " +
            "something when it lands on a cell holding a charge on the opposing " +
            "direction, so the rate goes as n and λ as 1/n. Measured it is steeper, and " +
            "the reason is that BOTH ends of an edge must be occupied for a meeting, " +
            "which is nearer n². λ = 1/fill is right in magnitude around fill 0.3 and " +
            "wrong at the ends: 1.41 cells against 2.01 at fill 0.50, and 10.6 against " +
            "6.6 at fill 0.15",
        },
        note: "the sanity check is p = 1: every slot collides, so λ must be exactly 1 step " +
          "and is — 1.0000, which is what caught the earlier accounting error",
      }),
      judge({
        name: "how well a power law describes it", value: fit.r2,
        expect: {
          of: "a clean power law, so the exponent means something",
          want: 1, tolerance: 0.1,
          because: "an exponent quoted off a scatter is not a measurement; this one sits " +
            "on a line across a fourfold change in occupancy",
        },
      }),
      judge({
        name: "how much the exponent moves between lattices", value: spread,
        expect: {
          of: "small — the same answer on every geometry, so it is the rules and not the tiling",
          want: 0, tolerance: 0.8,
          because: "an exponent measured on one lattice is a fact about that lattice. The " +
            "premise is contradicted by the RULES only if every geometry contradicts it — " +
            "and what matters is that all of them are far from the −1 the premise needs, " +
            "on the same side",
        },
        note: across.map(a => `${a.name} ${a.slope.toFixed(2)}`).join(", "),
      }),
      ...(hasMedium ? [judge({
        name: "front speed of a surviving RAY disturbance, in steps per tick", value: meanSpeed,
        expect: {
          of: "1.0 — one lattice step a tick, which is what a RAY does at any density",
          want: 1, tolerance: 0.2,
          because: "streaming moves every active ray exactly one step a tick. This is NOT " +
            "the carrier the transport premise is about — that one is a structure paying " +
            "for its own schedule out of the same budget, and it is not measured here",
        },
        note: "a ray has no third option; a STRUCTURE does, and that is where sub-c̄ drift comes from",
      })] : []),
    ];

    return {
      header: headerOf(w, seeds),
      findings,
      table: {
        columns: ["p", "occupancy n", "mean free path λ (steps)"],
        rows: [
          ...rows.map(r => [r.p.toFixed(3), r.n.toFixed(4), r.lambda.toFixed(3)]),
          ...across.map(a => ["—", `λ ∝ n^ on ${a.name}`, `${a.slope.toFixed(3)}  (R² ${a.r2.toFixed(3)})`]),
        ],
      },
    };
  },
});

export default [transport];
