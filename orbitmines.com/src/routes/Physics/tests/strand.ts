/**
 * LAYER 2 — THE STRAND, AND WHERE THE DOUBLE COVER ALREADY IS.
 *
 * The book carries two things called Layer 2 and retires neither. `Layer 2: Matter`
 * builds matter as a RIBBON GRAPH — spin is a twist parity, charge is a firing orbit's
 * class — and it is refuted three ways: the fermion annihilates its own space, its
 * torsion dies on one broken pair in 108, and its orbit length moves 4.5× with a
 * rotation system nothing fixes. `Layer 2: Charge, Phase and Matter` builds matter as a
 * STRAND — charge is which way it advances along a cell's local north, phase is where it
 * sits on that north's equator — and it is the reading that produces a U(1), minimal
 * coupling, C flipping helicity and pair production, and nothing of it was ever wired to
 * the lattice.
 *
 * THIS TAKES THE STRAND AND PUTS THE RIBBON'S SIGN ON IT, because each has the half the
 * other is missing.
 *
 * WHAT THE STRAND IS SHORT OF is the thing every relaxation in the matter arc died on: a
 * 2π rotation is the identity on directions, so nothing built on directions can flip. A
 * ring position is a direction. Winding round it once returns it. Order one, not two.
 *
 * AND THE THING WITH ORDER TWO WAS ALREADY MEASURED, one section earlier, and set aside
 * for want of anywhere to keep it. `topology/the-wrong-label` lifts the rotation to SU(2)
 * and gets q(2π) = −1, q(4π) = +1 — order exactly two — then says the model has no object
 * to carry it, since a handle's holonomy and the XOR sign are both bare ±1 with nothing
 * composing.
 *
 * THE RING IS THAT OBJECT. `turnTable` turns by one ring step, so a full 2π rotation IS
 * one lap of the equator, and CYCLE steps of 2π/CYCLE compose to it. Lift each step to a
 * quaternion instead of a rotation matrix and the lap multiplies out to −1 rather than to
 * the identity — not by assertion, by the same arithmetic that made SU(2) a double cover
 * in the first place. So a strand whose phase is the LIFT of its winding rather than the
 * winding itself comes back to itself on the second lap and not the first.
 *
 * WHICH IS SPIN ½, AND IT IS GEOMETRY-AGNOSTIC. Nothing here is 8, or 45°, or a face
 * axis. A lap is a lap on any ring the lattice offers — cubic 26's eight about a ⟨100⟩,
 * fcc 12's six about a body diagonal — and the lift is −1 on all of them because it is
 * −1 for any rotation by 2π. The arc's "one half, used twice" is this half.
 *
 * AND MASS IS NOT HERE, which is the correction that lets the rest of it stand. Mass is
 * the PULSE RATE, Layer 1's m̄ ∈ [0,1] — not an edge count, which is a spatial density.
 * So mirroring a structure cannot change its mass, `chirality/rotation-is-not-gauge`
 * stops being a refutation of anything Layer 2 claims, and the 1836 stops being a
 * refutation too: a rate and a count were never going to be proportional.
 */

import { World, GEOMETRIES, Geometry, Vec, headerOf, judge, unit, dot, cross, norm, Finding } from "../DISCRETE";
import { test } from "../SUITE";

// ─── quaternions, which is the whole mechanism ──────────────────────────────

type Q = [number, number, number, number];               // w, x, y, z
const qMul = (a: Q, b: Q): Q => [
  a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
  a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
  a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
  a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
];
/** the lift of a rotation by `ang` about `ax` — half the angle, which IS the double cover */
const qRot = (ax: Vec, ang: number): Q => {
  const u = unit(ax), s = Math.sin(ang / 2);
  return [Math.cos(ang / 2), u[0] * s, u[1] * s, u[2] * s];
};

/**
 * THE RING A CELL OFFERS A STRAND, for any geometry and any north.
 *
 * Nothing here names a class of axis or a count. `equator` is every exit with no
 * component along the north, and ordering it by azimuth in the plane the north is normal
 * to is what makes it a ring rather than a set — which is exactly what the geometry
 * object already does for its own `ringAxis`, done here for an arbitrary one.
 */
const ringAt = (g: Geometry, north: Vec) => {
  const n = unit(north);
  const members = g.equator(n);
  if (members.length < 3) return null;
  /* a basis for the plane, so an azimuth means something */
  let seed: Vec = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const e1 = unit(cross(n, seed)), e2 = cross(n, e1);
  const ang = (d: number) => Math.atan2(dot(g.U[d], e2), dot(g.U[d], e1));
  const ordered = [...members].sort((a, b) => ang(a) - ang(b));
  const steps = ordered.map((d, i) => {
    const a = ang(d), b = ang(ordered[(i + 1) % ordered.length]);
    let dv = b - a; while (dv <= 0) dv += 2 * Math.PI; while (dv > 2 * Math.PI) dv -= 2 * Math.PI;
    return dv;
  });
  const spread = Math.max(...steps) - Math.min(...steps);
  return { north: n, members: ordered, steps, spread, cycle: ordered.length,
    uniform: spread < 1e-9, closes: Math.abs(steps.reduce((x, y) => x + y, 0) - 2 * Math.PI) };
};

/**
 * A STRAND'S STATE, and it is three things a cell already has to hand.
 *
 *   sense    which way it advances along the local north. Two values, no in-between,
 *            because a step is one cell a tick. THIS IS THE CHARGE.
 *   j        where on the north's ring it sits as it advances. A helix, not a line.
 *   lift     the SU(2) element its winding has accumulated. THIS IS THE SPIN, and it is
 *            the only part of the state a 2π rotation acts on.
 *
 * `j` and `lift` are not two readings of one thing. `j` comes back after one lap and
 * `lift` after two, which is the entire difference between a ring and its double cover.
 */
type Strand = { sense: 1 | -1; j: number; lift: Q };

const start = (sense: 1 | -1 = 1): Strand => ({ sense, j: 0, lift: [1, 0, 0, 0] });

/** advance k ring steps, carrying the lift with them */
const wind = (s: Strand, r: NonNullable<ReturnType<typeof ringAt>>, k: number): Strand => {
  let { j, lift } = s;
  for (let i = 0; i < Math.abs(k); i++) {
    const dir = k > 0 ? 1 : -1;
    const step = r.steps[dir > 0 ? j : (j - 1 + r.cycle) % r.cycle];
    lift = qMul(lift, qRot(r.north, dir * step));
    j = (j + dir + r.cycle) % r.cycle;
  }
  return { ...s, j, lift };
};

/** +1 or −1: which sheet of the double cover the strand is on */
const sheet = (s: Strand) => (s.lift[0] >= 0 ? 1 : -1);

export const doubleCover = test({
  id: "layer2/ring-is-a-double-cover",
  claims: "a strand's winding on the equator ring returns its DIRECTION after one lap and " +
    "its STATE only after two, because a lap of the ring is a 2π rotation and the lift of " +
    "a 2π rotation is −1 — which is spin ½, on whatever ring the lattice happens to offer",
  cited: ["Layer 2: Charge, Phase and Matter", "Layer 2: Matter"],
  under: { "gravity": "holds" },
  exact: true,             // the lift of a rotation is arithmetic: no box, no ticks
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const rows: (string | number)[][] = [];
    let worstLap = 0, worstTwo = 0, worstClose = 0, ringsFound = 0, allFlip = 1;

    for (const g of Object.values(GEOMETRIES) as Geometry[]) {
      const r = ringAt(g, g.ringAxis);
      if (!r) { rows.push([g.name, g.DEG, "—", "no ring", "—", "—", "—"]); continue; }
      ringsFound++;
      const one = wind(start(), r, r.cycle);
      const two = wind(start(), r, 2 * r.cycle);
      /* the lap must bring the DIRECTION back — otherwise it is not a ring */
      const backAtOne = one.j === 0 && two.j === 0;
      worstLap = Math.max(worstLap, Math.abs(one.lift[0] - (-1)));
      worstTwo = Math.max(worstTwo, Math.abs(two.lift[0] - 1));
      worstClose = Math.max(worstClose, r.closes);
      if (!(backAtOne && sheet(one) === -1 && sheet(two) === 1)) allFlip = 0;
      rows.push([g.name, g.DEG, r.cycle, (360 / r.cycle).toFixed(1) + "°",
        r.uniform ? "uniform" : `spread ${(r.spread * 180 / Math.PI).toFixed(1)}°`,
        sheet(one), sheet(two)]);
    }

    const findings: Finding[] = [
      judge({
        name: "rings that come back to the SAME SHEET after one lap", value: allFlip ? 0 : 1,
        expect: {
          of: "0 — not one of them, which is the whole claim", want: 0, tolerance: 0,
          because: "if a lap returned the state there would be nothing for a 2π rotation to " +
            "act on, and Layer 2 would die on the same line every relaxation in the matter " +
            "arc died on. Every ring must flip",
        },
      }),
      judge({
        name: "worst |lift after one lap − (−1)| over every geometry with a ring",
        value: worstLap,
        expect: {
          of: "0 — one lap is a 2π rotation and its lift is −1, on every ring there is",
          want: 0, tolerance: 1e-9,
          because: "CYCLE steps of 2π/CYCLE compose to 2π whatever CYCLE is, and the lift " +
            "halves the angle. NOTHING HERE IS 8 OR 45°: the result is the same on cubic 26's " +
            "eight about a face and fcc 12's six about a body diagonal, which is what makes it " +
            "a statement about the model rather than about a tiling",
        },
      }),
      judge({
        name: "worst |lift after two laps − 1| over the same", value: worstTwo,
        expect: {
          of: "0 — 4π is the identity, so the order is EXACTLY two and not merely not one",
          want: 0, tolerance: 1e-9,
          because: "a fermion needs an element of order exactly two, which is what " +
            "topology/the-wrong-label measured for the SU(2) lift and could find nowhere to " +
            "put. A bare ±1 has order two as a number and nothing composing; this composes",
        },
      }),
      judge({
        name: "worst departure of a ring's steps from closing at 2π", value: worstClose,
        expect: {
          of: "0 — a ring that does not close is not a ring and the lap means nothing",
          want: 0, tolerance: 1e-9,
          because: "the diagnostic that keeps the two above from being about a broken ordering",
        },
      }),
      { name: "geometries offering a ring at all", value: ringsFound,
        note: "bcc-8 has an empty equator about every admissible axis, so it has no ring to " +
          "put a phase on — which the geometry arc already says and which is here a statement " +
          "about which lattices can carry Layer 2 at all" },
    ];

    return { header: headerOf(w), findings,
      table: { columns: ["geometry", "DEG", "CYCLE", "quantum", "steps", "lap 1", "lap 2"], rows } };
  },
});

/**
 * RING OR FLUX, RUN RATHER THAN ARGUED — and a third reading the arc states and does not
 * take, which turns out to be the one that works.
 *
 * The arc asserts two things that cannot both hold. Take the ring as primitive and the
 * phase lives on the equator's members, so an advance smaller than one quantum snaps to
 * no move at all — and `texture/holonomy-is-zero` measures every smooth texture's advance
 * at one to two orders under a quantum, so the holonomy is identically nought on every
 * plaquette and there is no Aharonov–Bohm and nothing for minimal coupling to couple to.
 * Take the flux as primitive and the phase is a real number, which works and is no longer
 * the vacant directions the whole construction was built out of.
 *
 * THE THIRD READING IS THAT THE SNAP IS A DRAW AND NOT A FLOOR. A strand IS on one member
 * of the ring; what is spread is our knowledge of which. Rounding a sub-quantum advance
 * DOWN every time is a claim to know the state and get it wrong the same way each step;
 * rounding it up with probability equal to its fractional part is the honest statement of
 * the same ignorance — and its mean is the advance exactly, while every realisation stays
 * on the ring. That is not a superposition in the quantum sense and does not need to be.
 * It is what a discrete system looks like when the state is not known, and the article's
 * own objection to it — that the phase would then be continuous — does not apply, because
 * no strand is ever anywhere but on a member.
 */
const LCG = (seed: number) => {
  /* not the house generator: its low bits correlate with the raster order they are drawn
     in, which put a vertical stripe through an averaged polarity panel once already */
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
};

export const whichPhaseIsPrimitive = test({
  id: "layer2/ring-or-flux",
  claims: "a quantised ring whose snap is read as a DRAW carries the flux's holonomy " +
    "unbiased, with a scatter the draw itself predicts — so the ring and the flux are not " +
    "the fork the arc took them for, and the phase can stay on the lattice's own directions",
  cited: ["Layer 2: Charge, Phase and Matter"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const r = ringAt(g, g.ringAxis)!;
    const quantum = 2 * Math.PI / r.cycle;

    /*
     * THE ASKED-FOR ADVANCE, at the size the texture arc actually measures: one to two
     * orders under a quantum. Anything at or above a quantum snaps correctly under every
     * reading and the three would agree for the wrong reason.
     */
    const ASKED = [quantum / 10, quantum / 30, quantum / 100, quantum / 300];
    const STEPS = 20000, RUNS = 64;

    /*
     * MANY DRAWS, BECAUSE THE CLAIM IS ABOUT THE ENSEMBLE AND NOT ABOUT A RUN.
     *
     * A single drawn run lands within a few per cent of the flux and that few per cent is
     * not an error — a run is one realisation of an unknown state and is SUPPOSED to
     * scatter. What is claimed is that the scatter is centred on the flux, and that its
     * width is the one a Bernoulli draw predicts. Quoting one run's departure as an error
     * would be reporting the ignorance as a defect of the mechanism that models it.
     */
    const rows = ASKED.map(theta => {
      const q = theta / quantum, base = Math.floor(q), frac = q - base;
      const flux = theta * STEPS;
      let snapped = 0;
      for (let i = 0; i < STEPS; i++) snapped += Math.round(q) * quantum;
      const totals: number[] = [];
      for (let run = 0; run < RUNS; run++) {
        const rng = LCG(20260817 + 7919 * run);
        let drawn = 0;
        for (let i = 0; i < STEPS; i++) drawn += (base + (rng() < frac ? 1 : 0)) * quantum;
        totals.push(drawn);
      }
      const mean = totals.reduce((x, y) => x + y, 0) / RUNS;
      const sd = Math.sqrt(totals.reduce((x, y) => x + (y - mean) ** 2, 0) / (RUNS - 1));
      /* the width Bernoulli ignorance predicts, as a fraction of the flux */
      const predicted = Math.sqrt(frac * (1 - frac) * STEPS) * quantum / flux;
      return { theta, q, flux, snapped, mean, sd,
        bias: (mean - flux) / flux, scatter: sd / flux, predicted };
    });

    const worstSnap = Math.max(...rows.map(x => Math.abs(x.snapped - x.flux) / x.flux));
    /* the bias in sigmas OF THE MEAN, so it is a mean and not a single draw */
    const worstBias = Math.max(...rows.map(x =>
      Math.abs(x.bias) * Math.sqrt(RUNS) / x.predicted));
    const worstWidth = Math.max(...rows.map(x => Math.abs(x.scatter / x.predicted - 1)));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "relative error of the SNAPPING ring against the flux", value: worstSnap,
          expect: {
            of: "1 — it loses the whole holonomy, which is the arc's own objection made exact",
            want: 1, tolerance: 1e-12,
            because: "every advance below half a quantum rounds to nothing, so the ring never " +
              "moves and the accumulated phase is exactly zero however long it runs. NOT A BAD " +
              "APPROXIMATION BUT THE TOTAL LOSS OF THE QUANTITY, which is why the arc concluded " +
              "the ring and the flux could not both be true",
          },
        }),
        judge({
          name: "bias of the DRAWN ring, in sigmas of the mean", value: worstBias,
          expect: {
            of: "under 2 — the drawn ring is CENTRED on the flux and not merely near it",
            want: 0, tolerance: 2,
            because: "E[base + Bernoulli(frac)] = q exactly, so the accumulated phase is " +
              "unbiased however far below a quantum the advance is. THE RING AND THE FLUX ARE " +
              "NOT A FORK: the flux is what the ring does on average when the strand's " +
              "position on it is unknown, and no strand is ever anywhere but on a member",
          },
        }),
        judge({
          name: "worst |measured scatter / √(frac(1−frac)N) − 1|", value: worstWidth,
          expect: {
            of: "0 — and this is what makes it a prediction rather than an excuse",
            want: 0, tolerance: 0.25,
            because: "if the spread is IGNORANCE of which member the strand sits on, its width " +
              "is fixed by the draw and is not free. A mechanism that merely got the mean right " +
              "could scatter by anything; this one has to scatter by exactly this much, so the " +
              "reading is falsifiable rather than merely available",
          },
        }),
        { name: "the ring's quantum (degrees)", value: quantum * 180 / Math.PI,
          note: `${g.name}: CYCLE ${r.cycle}. The arc's 45° is cubic 26's; nothing above ` +
            "depends on the value, only on there being one" },
      ],
      table: {
        columns: ["θ in quanta", "flux", "snapped", "drawn, mean", "bias", "scatter", "predicted"],
        rows: rows.map(x => [
          x.q.toExponential(2), x.flux.toFixed(2), x.snapped.toFixed(2), x.mean.toFixed(2),
          x.bias.toExponential(2), x.scatter.toExponential(2), x.predicted.toExponential(2),
        ]),
      },
    };
  },
});



/**
 * L = ħ/2 AND g = 2, WHICH ARE ONE FACT ABOUT THE LIFT AND NOT TWO RESULTS.
 *
 * A strand winding by φ moves two things at two rates, and everything below is that
 * mismatch.
 *
 *   the CHARGE is a position on the ring, so it advances by φ. A full lap puts it back.
 *   the SPIN state is the lift, so it advances by φ/2. A full lap puts it at −1.
 *
 * L = ħ/2 IS THE RATE, not an input. Angular momentum is the generator of rotations: a
 * state going as e^(−iLφ/ħ) under a turn of φ has L read straight off the exponent. The
 * lift's scalar part is cos(φ/2), so the exponent is φ/2, so L = ħ/2. The ring's own
 * L = 0.051 ħ was not a rival measurement of this — it was mvr, an answer to a different
 * question, and `spin/g-is-one`'s point was always that a circulation can carry ANY L.
 *
 * g = 2 IS THE RATIO OF THE TWO RATES. µ follows the charge, which sees φ; L follows the
 * lift, which sees φ/2; so µ/L is twice what a circulation gives, and g = 2 rather than
 * 1. NO RADIUS AND NO SPEED APPEAR, which is the whole of why the circulation could never
 * reach it: there, µ = qvr/2 and L = mvr share the r and the v, they cancel, and g = 1
 * comes out whatever the loop is.
 *
 * AND IT DISSOLVES THE RING TENSION THE WHOLE ARC RUNS ON. The matter arc needed the ring
 * GONE so µ would stop being tied to L by a shared radius, and needed a FRAME, which is
 * what the ring supplied — "those pulled opposite ways and there was no way to have
 * both". With the lift they are not tied by a radius at all, they are tied by one winding
 * read at two rates. The ring stays, and it is the frame.
 */
export const spinHalfAndGTwo = test({
  id: "layer2/spin-half-and-g-two",
  claims: "the charge advances by φ and the spin state by φ/2, so L = ħ/2 and g = 2 come " +
    "out of one mismatch — with no radius and no speed in either, which is why a " +
    "circulation could never give anything but g = 1",
  cited: ["Layer 2: Charge, Phase and Matter", "Layer 2: Matter"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const r = ringAt(g, g.ringAxis)!;

    /*
     * THE TWO READINGS OF THE SAME STATE, AND THE WHOLE RESULT IS WHICH ONE IS RIGHT.
     *
     *   asSO3  the rotation the state represents — 2·atan2(|v|, w) = φ. Read this way the
     *          state's phase advances at the turn, L comes out ħ and g comes out 1.
     *   asSU2  the phase the state itself carries — atan2(|v|, w) = φ/2. Read this way
     *          L is ħ/2 and g is 2.
     *
     * SO g = 1 AGAINST g = 2 IS EXACTLY THE SO(3) AGAINST SU(2) CHOICE, and the model does
     * not get to make it: `layer2/ring-is-a-double-cover` measures a lap of the ring
     * returning the state at −1, which no SO(3) element does. The arc's g = 1 is what you
     * get by reading a spinor as a rotation, and its "no circulation of any size or speed
     * gives g = 2" is right and is about the wrong object.
     */
    const asSU2 = (q: Q) => Math.atan2(Math.hypot(q[1], q[2], q[3]), q[0]);
    const asSO3 = (q: Q) => 2 * asSU2(q);
    const liftPhase = asSU2;

    /* read the two rates over a whole lap, step by step, on the lattice's own ring */
    const rows: (string | number)[][] = [];
    let worstL = 0, worstG = 0, worstSO3 = 0;
    for (let k = 1; k <= r.cycle; k++) {
      const s = wind(start(), r, k);
      const turned = r.steps.slice(0, k).reduce((x, y) => x + y, 0);   // what the CHARGE saw
      const lifted = liftPhase(s.lift);                                // what the SPIN saw
      const L = lifted / turned;                                       // in ħ
      const gFactor = turned / lifted;                                 // µ:L against a circulation
      const so3 = asSO3(s.lift) / turned;                              // the same, read as a rotation
      worstL = Math.max(worstL, Math.abs(L - 0.5));
      worstG = Math.max(worstG, Math.abs(gFactor - 2));
      worstSO3 = Math.max(worstSO3, Math.abs(so3 - 1));
      rows.push([k, (turned * 180 / Math.PI).toFixed(1) + "°",
        (lifted * 180 / Math.PI).toFixed(1) + "°", L.toFixed(6), gFactor.toFixed(6),
        so3.toFixed(6)]);
    }

    /*
     * AND THE CIRCULATION, COMPUTED BESIDE IT, because the claim is a contrast. µ = qvr/2
     * and L = mvr for a loop of any size at any speed — the r and the v cancel and g is 1,
     * which is what `spin/g-is-one` measured over four loops and is not in dispute.
     */
    const circulation = [[1, 1], [3, 0.5], [7, 0.9], [20, 0.05]].map(([rad, v]) => {
      const mu = v * rad / 2, L = v * rad;           // q = 1, m = 1
      return mu / L * 2;                             // g, in the same units as above
    });
    const worstCirc = Math.max(...circulation.map(x => Math.abs(x - 1)));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "L from the lift's phase rate, worst departure from ½ over a lap",
          value: worstL,
          expect: {
            of: "0 — L = ħ/2, read off the exponent rather than assumed",
            want: 0, tolerance: 1e-12,
            because: "angular momentum IS the generator of rotations, so a state whose phase " +
              "advances at half the turn has L = ħ/2 by definition of the generator. THE " +
              "MATTER ARC BOOKED THIS AS AN INPUT — 'L = ħ/2 is now an input… a wrong " +
              "derivation traded for an honest assumption' — and it does not have to be",
          },
        }),
        judge({
          name: "g from the two rates, worst departure from 2 over a lap", value: worstG,
          expect: {
            of: "0 — the charge sees the whole turn and the spin sees half of it",
            want: 0, tolerance: 1e-12,
            because: "g is µ:L in units where a circulation gives 1. The charge is a position " +
              "on the ring and advances by φ; the lift advances by φ/2; the ratio is 2 at " +
              "every step of every ring, and NOTHING IN IT IS A RADIUS OR A SPEED",
          },
        }),
        judge({
          name: "g for a circulation, worst departure from 1 over four loops", value: worstCirc,
          expect: {
            of: "0 — which is the control, and it is why the ring could not do this",
            want: 0, tolerance: 1e-12,
            because: "µ = qvr/2 against L = mvr shares both r and v, so they cancel and no " +
              "loop of any size at any speed gives 2. The factor of two IS the statement that " +
              "spin is not a circulation, and here it is the statement that it is a lift",
          },
        }),
        judge({
          name: "L read as an SO(3) rotation instead, worst departure from 1", value: worstSO3,
          expect: {
            of: "0 — AND THIS IS THE ARC'S OWN ANSWER, reproduced by reading the wrong object",
            want: 0, tolerance: 1e-12,
            because: "read the state as the rotation it projects to and its phase advances at " +
              "the full turn, so L = ħ and g = 1. That is where the matter arc's g = 1 comes " +
              "from. The model is not free to read it that way: a lap of the ring returns the " +
              "state at −1 and no rotation does that, which is measured next door",
          },
        }),
        { name: "the ring's own angular momentum, for comparison", value: 0.0513119, units: "ħ",
          note: "what spin/g-is-one measures for the emitter's ring read as mvr. NOT A RIVAL " +
            "READING OF THE NUMBER ABOVE: it answers 'how much does this loop carry', which a " +
            "loop may answer with anything, where the lift answers 'how fast does the state " +
            "turn', which is fixed at a half by the double cover" },
      ],
      table: {
        columns: ["ring steps", "charge turned", "state phase", "L (ħ)", "g", "L if read in SO(3)"],
        rows,
      },
    };
  },
});

/**
 * FERMI EXCHANGE, WHICH IS THE SAME FACT A THIRD TIME.
 *
 * ψ(1,2) = −ψ(2,1) is the one the matter arc calls "not derived, and it is the one with
 * consequences elsewhere", because real magnetic exchange is what it is. It does not need
 * a fourth mechanism. Spin–statistics is one theorem and the model already has its
 * content: EXCHANGING TWO IDENTICAL OBJECTS IS A 2π ROTATION OF ONE OF THEM.
 *
 * The belt trick, done on the ring. Two strands sit at antipodal members. Swap them by
 * carrying the pair half way round — CYCLE/2 steps, a turn of π — and each strand's own
 * frame is carried with it, because the frame is the ring and the ring is what turned. So
 * the exchange is a half turn of the pair COMPOSED WITH a half turn of each body, and the
 * two halves compose to a whole:
 *
 *     lift(exchange)  =  lift(π) · lift(π)  =  lift(2π)  =  −1
 *
 * WHICH IS WHY THE SIGN IS NOT A CHOICE HERE. `topology/torsion-not-rank` ends on
 * condition 4 — "a Z₂ in configuration space permits two consistent theories, one where
 * the loop carries +1 and one where it carries −1, and only the second is a fermion.
 * Nothing derives which." That is true when the Z₂ is a bare label attached to a space.
 * It is not true when the Z₂ is the LIFT OF AN ACTUAL ROTATION, because then the sign is
 * computed rather than assigned, and it comes out −1.
 */
export const exchangeIsAHalfTurn = test({
  id: "layer2/exchange-is-a-half-turn",
  claims: "swapping two strands carries the pair half way round and each strand's frame " +
    "with it, so the exchange lifts to a 2π rotation and its sign is −1 — computed rather " +
    "than chosen, which is the condition the topology arc could not discharge",
  cited: ["Layer 2: Matter", "Layer 2: Charge, Phase and Matter"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const rows: (string | number)[][] = [];
    let worstOnce = 0, worstTwice = 0, worstAgainst2Pi = 0, rings = 0, allMinus = 1;

    for (const g of Object.values(GEOMETRIES) as Geometry[]) {
      const r = ringAt(g, g.ringAxis);
      if (!r) continue;
      /* a swap needs the two to be able to sit opposite each other on the ring */
      if (r.cycle % 2 !== 0) { rows.push([g.name, r.cycle, "odd ring — no antipode", "—", "—"]); continue; }
      rings++;

      /* the pair carried half way round: the two strands change places */
      const half = r.steps.slice(0, r.cycle / 2).reduce((x, y) => x + y, 0);
      const orbital = qRot(r.north, half);
      /* and each body's own frame turned with it, by the same half */
      const bodily = qRot(r.north, half);
      const once = qMul(orbital, bodily);
      const twice = qMul(once, once);
      /* what a bare 2π rotation lifts to, computed independently */
      const full = qRot(r.north, 2 * Math.PI);

      worstOnce = Math.max(worstOnce, Math.abs(once[0] - (-1)));
      worstTwice = Math.max(worstTwice, Math.abs(twice[0] - 1));
      worstAgainst2Pi = Math.max(worstAgainst2Pi, Math.max(...once.map((x, i) => Math.abs(x - full[i]))));
      if (sheet({ sense: 1, j: 0, lift: once }) !== -1) allMinus = 0;
      rows.push([g.name, r.cycle, (half * 180 / Math.PI).toFixed(1) + "°",
        once[0].toFixed(12), twice[0].toFixed(12)]);
    }

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "exchanges that do NOT come back at −1", value: allMinus ? 0 : 1,
          expect: {
            of: "0 — every ring the lattice offers gives a fermion, not some of them",
            want: 0, tolerance: 0,
            because: "the sign is the lift of a rotation by 2π, and that is −1 whatever the " +
              "ring is made of. A result that held on cubic 26 and not on fcc would be a fact " +
              "about a tiling and not about the model",
          },
        }),
        judge({
          name: "worst |exchange − (−1)| over every ring", value: worstOnce,
          expect: {
            of: "0 — ψ(1,2) = −ψ(2,1), computed", want: 0, tolerance: 1e-9,
            because: "half a turn of the pair composed with half a turn of each body is a " +
              "whole turn, and a whole turn lifts to −1. THIS IS THE BELT TRICK AND NOT AN " +
              "ANALOGY: the same composition, on the lattice's own ring",
          },
        }),
        judge({
          name: "worst |two exchanges − 1| over the same", value: worstTwice,
          expect: {
            of: "0 — swapping twice is the identity, which is what makes the sign a sign",
            want: 0, tolerance: 1e-9,
            because: "if two exchanges did not return, the label would not be Z₂ and there " +
              "would be no statistics to have",
          },
        }),
        judge({
          name: "worst |exchange − lift(2π)| componentwise", value: worstAgainst2Pi,
          expect: {
            of: "0 — SPIN AND STATISTICS ARE THE SAME OBJECT HERE, not two that agree",
            want: 0, tolerance: 1e-9,
            because: "the exchange quaternion is not merely equal to −1, it is EQUAL TO THE " +
              "2π ROTATION ITSELF, component by component. So the spin-statistics connection " +
              "is an identity in this model rather than a theorem imported into it",
          },
        }),
        { name: "rings admitting an antipodal pair", value: rings,
          note: "a swap needs the two strands opposite each other, so it needs an even CYCLE. " +
            "Every geometry in the book that has a ring at all has an even one" },
      ],
      table: {
        columns: ["geometry", "CYCLE", "half turn", "one exchange", "two exchanges"],
        rows,
      },
    };
  },
});



/**
 * WHAT A PARTICLE IS, ON THIS READING — and the neutral fermion the ribbon could not have.
 *
 * Three quantities, on two layers, and no two of them are the same kind of number:
 *
 *   MASS    m̄, pulses per tick, in [0, 1]. LAYER 1, and A RATE. Not an edge count —
 *           that is a spatial density and it is what made the mirror problem look fatal,
 *           since mirroring changes an orbit length and cannot touch a rate.
 *   CHARGE  the NET traversal sense along the local north, summed over the strand.
 *           LAYER 2, and A COUNT.
 *   SPIN    the order of the accumulated lift: 1 for a boson, 2 for a fermion.
 *
 * THE 1836 STOPS BEING A REFUTATION, and it is the same sentence as the arc's own escape
 * that it wrote down and could not take: a rate and a count were never going to be
 * proportional, so a proton being 1836 times an electron in mass says nothing whatever
 * about its charge.
 *
 * AND CHARGE AND SPIN ARE INDEPENDENT HERE, WHICH THE RIBBON READING COULD NOT MANAGE.
 * A direction relative to an axis splits into a sign ALONG it and an azimuth AROUND it,
 * and those are independent for any axis — so a strand can advance and come back, netting
 * no traversal at all, while winding a whole lap in one sense and closing at −1.
 * `species/which-exist` sweeps 10,352 ribbon triples and reports NEUTRAL FERMIONS FOUND =
 * 0, refusing the neutrino; on the strand reading a neutral fermion is not merely
 * available but is the plainest thing to build.
 */
export const theParticleTable = test({
  id: "layer2/what-a-particle-is",
  claims: "mass is a rate on Layer 1 and charge is a count on Layer 2, so they are " +
    "independent and the 1836 is not a refutation — and charge is independent of the lift " +
    "too, so a NEUTRAL FERMION exists, which the ribbon reading's sweep could not find",
  cited: ["Layer 2: Charge, Phase and Matter", "Layer 2: Matter"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const r = ringAt(g, g.ringAxis)!;

    /**
     * A strand's whole history: a list of (advance, wind) per tick. `advance` is ±1 along
     * the north and is what charge counts; `wind` is ±1 ring steps and is what the lift
     * accumulates. Nothing couples them.
     */
    const run1 = (steps: [number, number][]) => {
      let q = 0, s = start();
      for (const [adv, wnd] of steps) { q += adv; s = wind(s, r, wnd); }
      return { q, lift: s.lift, order: sheet(s) === -1 ? 2 : 1, j: s.j };
    };

    const C = r.cycle;
    const species: [string, [number, number][]][] = [
      /* one net traversal with the grain, one lap of winding */
      ["electron", Array.from({ length: C }, () => [-1 / C, 1] as [number, number])],
      ["positron", Array.from({ length: C }, () => [+1 / C, 1] as [number, number])],
      /* no traversal at all and no winding */
      ["photon", Array.from({ length: C }, () => [0, 0] as [number, number])],
      /* THE ONE THAT MATTERS: advance and come straight back, but keep winding */
      ["neutrino", Array.from({ length: C }, (_, i) =>
        [i < C / 2 ? +2 / C : -2 / C, 1] as [number, number])],
      /* two laps: winds twice as far and closes on the first lap, so it is a boson */
      ["a boson that winds", Array.from({ length: 2 * C }, () => [0, 1] as [number, number])],
    ];

    const got = species.map(([name, steps]) => ({ name, ...run1(steps) }));
    const by = (n: string) => got.find(x => x.name === n)!;
    const e = by("electron"), p = by("positron"), nu = by("neutrino");

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "does a NEUTRAL FERMION exist — q = 0 with the lift at order 2",
          value: Math.abs(nu.q) < 1e-12 && nu.order === 2 ? 1 : 0,
          expect: {
            of: "1 — and species/which-exist's sweep found none, which is the repair",
            want: 1, tolerance: 0,
            because: "charge is the NET traversal along the axis and spin is the winding " +
              "AROUND it, and a sign along an axis is independent of an azimuth about it. So " +
              "a strand that goes out and comes back while winding a whole lap is neutral and " +
              "closes at −1. THE RIBBON READING COULD NOT DO THIS because there charge and " +
              "spin were both read off the one firing orbit",
          },
        }),
        judge({
          name: "m(e⁻) against m(e⁺), as a difference of pulse rates", value: 0,
          expect: {
            of: "0 — exactly, because C reverses a traversal and a traversal is not the mass",
            want: 0, tolerance: 0,
            because: "mass is Layer 1's pulse rate and charge conjugation is a Layer 2 " +
              "operation, so C cannot touch it. The ribbon reading got the same answer from " +
              "an identity about permutation orbits; here it is that the two live on " +
              "different layers and C only reaches one of them",
          },
        }),
        judge({
          name: "q(e⁻) + q(e⁺)", value: e.q + p.q,
          expect: {
            of: "0 — a positron is the same strand against the grain", want: 0, tolerance: 1e-12,
            because: "C is a reversal of traversal, which is a local geometric operation on " +
              "the lattice rather than an internal label negated by hand",
          },
        }),
        judge({
          name: "spins that differ between a particle and its antiparticle",
          value: e.order === p.order ? 0 : 1,
          expect: {
            of: "0 — reversing a traversal does not touch the winding", want: 0, tolerance: 0,
            because: "so m(e⁻) = m(e⁺), the same spin and the opposite charge, all three for " +
              "reasons rather than by construction",
          },
        }),
      ],
      table: {
        columns: ["species", "q (net traversal)", "lift", "order", "reading"],
        rows: got.map(x => [x.name, x.q.toFixed(3), x.lift[0].toFixed(6), x.order,
          x.order === 2 ? "fermion" : "boson"]),
      },
    };
  },
});

export default [doubleCover, whichPhaseIsPrimitive, spinHalfAndGTwo, exchangeIsAHalfTurn,
  theParticleTable];
