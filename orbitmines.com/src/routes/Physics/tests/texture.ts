/**
 * ORDERING — what the lattice hands the texture arc, and the two places it does not.
 *
 * The port of `todo/provenance/ring.ts`, `holonomy.ts`, `departure.ts` and `response.ts`.
 * The texture arc wants three things from the lattice: a U(1) at every site to turn a
 * north through, a holonomy round a plaquette to be the flux, and a coupling between two
 * emitters that can lock them. It gets the third and not the first two.
 *
 *   RING — CYCLE IS A PROPERTY OF ONE AXIS CLASS, and the arc as first written did not say
 *     so. The CYCLE in `turnRing` is the count of in-plane directions of a PLANE, and a
 *     plane is an equator only when the axis is a face axis. Cut the equator of every north
 *     the lattice has and sort each by angle and there are THREE answers, not one — and one
 *     class is not even uniformly spaced. In a texture whose north turns, nearly half the
 *     sites have no U(1) on them at all.
 *   HOLONOMY — AND THE RING AND THE FLUX CANNOT BOTH BE TRUE. A texture smooth enough to be
 *     a texture advances its north by far less than one ring step per lattice step, so every
 *     step snaps to no move at all and the quantised holonomy is IDENTICALLY zero on every
 *     plaquette. It is not a matter of finding a texture that twists harder: one advancing a
 *     whole ring step per cell turns its north right over in CYCLE cells, which is not a
 *     texture, it is noise.
 *   DEPARTURE — AND "MONOPOLE" WAS TOO KIND. A sided lump's angular profile is sgn(cos θ)/r²
 *     — constant magnitude from the pole to one degree off the equator, a step at 90°, and
 *     its mirror below. That is impossible for any real field: zero enclosed charge forbids
 *     a 1/r² term outright, so the exterior is not source-free and the step at the equator
 *     is a source sheet running to infinity. THE LUMP IS NOT EMITTING A FIELD.
 *   RESPONSE — but the coupling is real and it is ODD, which is the thing an ordering needs.
 *     Two sided emitters, the annihilation count near the first: the COUNT is even and an
 *     even coupling cannot lock anything, having no way to tell ahead from behind. Its FIRST
 *     MOMENT is odd, exactly, with no cosine component and no mean — so the coupling is
 *     DERIVED out of (G+M/1) and the 1/r² the pulses arrive with, rather than assumed.
 *
 * ALL FOUR ARE COUNTS AND SUMS OVER THE EXIT SET, so they move with the geometry and that
 * is the point of re-measuring them: the arc's three ring classes are cubic 26's.
 */

import {
  World, Vec, Geometry, GEOMETRIES, headerOf, judge, dot, cross, unit, norm, sub, scale,
} from "../DISCRETE";
import { test } from "../SUITE";

const TAU = 2 * Math.PI;
const sgn = (x: number) => (x > 1e-12 ? 1 : x < -1e-12 ? -1 : 0);

/** the exits perpendicular to an axis, in circular order, and the angles between them */
const ringAbout = (g: Geometry, axis: Vec) => {
  const a = unit(axis);
  const inPlane = g.U.filter(d => Math.abs(dot(d, a)) < 1e-9);
  if (inPlane.length < 2) return { count: inPlane.length, spacings: [] as number[] };
  /* a basis in the plane, to sort by angle */
  const e1 = unit(sub(inPlane[0], scale(a, dot(inPlane[0], a))));
  const e2 = cross(a, e1);
  const sorted = [...inPlane].sort((p, q) =>
    Math.atan2(dot(p, e2), dot(p, e1)) - Math.atan2(dot(q, e2), dot(q, e1)));
  const spacings: number[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i], q = sorted[(i + 1) % sorted.length];
    spacings.push(Math.acos(Math.max(-1, Math.min(1, dot(unit(p), unit(q))))) * 180 / Math.PI);
  }
  return { count: sorted.length, spacings };
};

/** the axis classes a lattice has: its own exits, grouped by how many exits they carry */
const axisClasses = (g: Geometry) => {
  const seen = new Map<string, { axis: Vec; count: number; n: number; spacings: number[] }>();
  for (const d of g.U) {
    const r = ringAbout(g, d);
    const spread = r.spacings.length
      ? Math.max(...r.spacings) - Math.min(...r.spacings) : 0;
    const k = `${r.count}/${spread.toFixed(3)}`;
    const e = seen.get(k);
    if (e) e.n++;
    else seen.set(k, { axis: d, count: r.count, n: 1, spacings: r.spacings });
  }
  return [...seen.values()].sort((a, b) => b.n - a.n);
};

export const theRingIsOneAxisClass = test({
  id: "texture/ring-is-one-axis-class",
  claims: "CYCLE is a property of ONE class of axis, not of the lattice — cut the equator " +
    "of every north and there is more than one answer, and not every class is even " +
    "uniformly spaced, so a texture whose north turns has sites with no U(1) on them",
  cited: ["ring.ts"],
  under: { "gravity": "holds" },
  exact: true,                    // a count over a fixed exit set
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const classes = axisClasses(g);

    /*
     * AND THE COMPLAINT HAS TO BE ASKED OF BOTH LATTICES, because it turns out to be a
     * fact about ONE of them. The arc reports three ring classes with one non-uniform, and
     * that is cubic 26's answer; fcc 12's twelve exits are all equivalent and every ring
     * it has is the same size and uniformly spaced. So the objection is real where the arc
     * raises it and does not survive the change of geometry — which does not repair the
     * argument, it relocates it: CYCLE is still not the lattice's to hand over in general,
     * and a book that runs on more than one lattice cannot lean on either answer.
     */
    const cubic = axisClasses(GEOMETRIES["cubic-26"]);
    const cubicCounts = new Set(cubic.map(c => c.count));
    const cubicUneven = cubic.filter(c =>
      c.spacings.length > 1 && Math.max(...c.spacings) - Math.min(...c.spacings) > 1e-6)
      .reduce((a, c) => a + c.n, 0);

    const counts = new Set(classes.map(c => c.count));
    const uneven = classes.filter(c =>
      c.spacings.length > 1 &&
      Math.max(...c.spacings) - Math.min(...c.spacings) > 1e-6);
    const withoutU1 = uneven.reduce((a, c) => a + c.n, 0);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "distinct ring sizes on cubic 26, where the arc raises the objection",
          value: cubicCounts.size,
          expect: {
            of: "more than one — SO CYCLE IS NOT THE LATTICE'S, IT IS AN AXIS CLASS'S",
            want: 0, atLeast: 2,
            because: "the CYCLE in `turnRing` is the count of in-plane directions of a PLANE, " +
              "and a plane is an equator only when the axis is one the lattice has an equator " +
              "about. Cut the equator of every north and sort each by angle and the answers " +
              "differ. EVERY SENTENCE IN THIS ARC WITH CYCLE IN IT IS A SENTENCE ABOUT ONE " +
              "CLASS, and the arc had better say which",
          },
          note: `on cubic 26: ` + cubic.map(c => `${c.n} axes with a ring of ${c.count}`).join(", ") +
            `. AND IT DOES NOT REPRODUCE ON ${g.name.toUpperCase()}, which has ` +
            classes.map(c => `${c.n} axes with a ring of ${c.count}`).join(", ") +
            ` — one class, uniformly spaced. The objection is a fact about cubic 26 rather ` +
            `than about lattices, which relocates it rather than repairing it: a book running ` +
            `on more than one lattice cannot lean on either answer`,
        }),
        judge({
          name: "axes on cubic 26 whose ring is NOT uniformly spaced", value: cubicUneven,
          expect: {
            of: "NOT zero — the sites with no U(1) on them at all", want: 0, atLeast: 1,
            because: "a ring at unequal angles is not a U(1): there is no quantum to turn by, " +
              "and the angles that appear are the lattice's own rather than a fraction of a " +
              "turn. On cubic 26 this is the twelve edge axes, the LARGEST class, carrying " +
              "35.26°/54.74° alternating — so nearly half the sites of a turning texture have " +
              "nothing to turn through. The bound here is trivial because the number is the " +
              "geometry's to report and the arc quotes cubic 26's",
          },
          note: `${cubicUneven} of ${GEOMETRIES["cubic-26"].DEG} on cubic 26 — the LARGEST ` +
            `class, carrying the lattice's own two angles rather than a fraction of a turn, ` +
            `so nearly half the sites of a turning texture have nothing to turn through. ` +
            `On ${g.name} it is ${withoutU1}`,
        }),
      ],
      table: {
        columns: ["axes (cubic 26)", "ring", "spacing"],
        rows: cubic.map(c => [c.n, c.count,
          c.spacings.length === 0 ? "—"
            : Math.max(...c.spacings) - Math.min(...c.spacings) < 1e-6
              ? `uniform ${c.spacings[0].toFixed(2)}°`
              : `NOT uniform — ${[...new Set(c.spacings.map(x => x.toFixed(2)))].join(" / ")}`]),
      },
    };
  },
});

export const theHolonomyIsZero = test({
  id: "texture/holonomy-is-zero",
  claims: "a texture smooth enough to be a texture advances its north by far less than one " +
    "ring step per lattice step, so every step snaps to no move and the quantised holonomy " +
    "is identically zero on every plaquette — the ring and the flux cannot both be true",
  cited: ["holonomy.ts"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const step = g.SPIN;                    // the smallest move the ring can make

    /* a smooth texture: the north tilts by a slow linear ramp across the lattice */
    const RAMP = 0.02;                      // radians per cell — a full turn in ~300 cells
    const north = (x: number, y: number): Vec => {
      const th = RAMP * (x + 0.6 * y);
      return [Math.sin(th), 0, Math.cos(th)];
    };
    const angleBetween = (a: Vec, b: Vec) =>
      Math.acos(Math.max(-1, Math.min(1, dot(unit(a), unit(b)))));

    const PLAQUETTES: [string, number, number, number][] = [
      ["(0,0) 1×1", 0, 0, 1], ["(1.5,0.7) 1×1", 1.5, 0.7, 1],
      ["(0,0) 2×2", 0, 0, 2], ["(3,3) 1×1", 3, 3, 1],
    ];
    const rows = PLAQUETTES.map(([name, x0, y0, size]) => {
      const corners: [number, number][] =
        [[x0, y0], [x0 + size, y0], [x0 + size, y0 + size], [x0, y0 + size]];
      let continuous = 0, quantised = 0, worstStep = 0;
      for (let i = 0; i < 4; i++) {
        const [ax, ay] = corners[i], [bx, by] = corners[(i + 1) % 4];
        const adv = angleBetween(north(ax, ay), north(bx, by));
        continuous += adv;
        worstStep = Math.max(worstStep, adv / size);
        /* THE QUANTISED MOVE: the ring can only turn by whole steps, so round */
        quantised += Math.round(adv / step) * step;
      }
      return { name, continuous, quantised, perStep: worstStep, frac: worstStep / step };
    });
    const worstQuantised = Math.max(...rows.map(r => Math.abs(r.quantised)));
    const worstFrac = Math.max(...rows.map(r => r.frac));

    /* and what it would cost to twist hard enough to move the ring at all */
    const cellsToTurnOver = Math.PI / step;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "advance per lattice step, as a fraction of one ring step", value: worstFrac,
          expect: {
            of: "≪ 1 — so every step snaps to no move at all", want: 0, atMost: 0.5,
            because: "a texture is a SLOWLY varying north — that is what makes it a texture " +
              "rather than noise — so its advance across one cell is a small fraction of the " +
              "smallest move the ring can make. The rounding is not an approximation here; it " +
              "is what having a ring MEANS",
          },
        }),
        judge({
          name: "quantised holonomy, worst over four plaquettes", value: worstQuantised,
          expect: {
            of: "0 — IDENTICALLY, on every plaquette", want: 0, tolerance: 1e-12,
            because: "THE RING AND THE FLUX CANNOT BOTH BE TRUE. If the north turns through a " +
              "ring then the holonomy round a plaquette is a sum of whole steps, and every one " +
              "of them is zero — so there is no flux to be the field. AND IT IS NOT A MATTER " +
              `OF FINDING A TEXTURE THAT TWISTS HARDER: one advancing a whole step per cell ` +
              `turns its north right over in ${cellsToTurnOver.toFixed(0)} cells, which is not ` +
              "a texture, it is noise",
          },
          note: `against a continuum holonomy of up to ` +
            `${Math.max(...rows.map(r => Math.abs(r.continuous))).toExponential(3)}`,
        }),
      ],
      table: {
        columns: ["plaquette", "advance/step", "as a fraction of SPIN", "quantised", "continuum"],
        rows: rows.map(r => [r.name, r.perStep.toExponential(3), r.frac.toExponential(2),
          r.quantised.toExponential(3), r.continuous.toExponential(3)]),
      },
    };
  },
});

export const theCouplingIsOdd = test({
  id: "texture/the-coupling-is-odd",
  claims: "two sided emitters give an annihilation COUNT that is even — which cannot lock " +
    "anything — and a first MOMENT that is odd exactly, with no cosine and no mean, so the " +
    "coupling an ordering needs is derived out of (G+M/1) rather than assumed",
  cited: ["response.ts"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const SEP = 8;
    const N_AT: Vec = [0, 0, 0], M_AT: Vec = [SEP, 0, 0];

    /* the cells near the first emitter, where its space is being destroyed */
    const near: Vec[] = [];
    for (let x = -4; x <= 4; x++) for (let y = -4; y <= 4; y++) for (let z = -4; z <= 4; z++)
      if (Math.hypot(x, y, z) <= 4 && (x || y || z)) near.push([x, y, z]);

    /* a sided source at phase β: its axis has turned β of a full turn */
    const axisAt = (b: number): Vec => [Math.cos(TAU * b), Math.sin(TAU * b), 0];

    /**
     * What the two do to the space around n at one instant. Each puts sgn(axis·d̂) into the
     * direction d̂; where they disagree they annihilate, which is (G+M/1) with the signs
     * kept. The LEVER is the signed sine of the angle from n's own axis, so a positive
     * moment means space is destroyed AHEAD of where n is pointing.
     */
    const encounter = (bn: number, bm: number) => {
      const an = axisAt(bn), am = axisAt(bm);
      let count = 0, moment = 0;
      for (const y of near) {
        const dn = unit(y), dm = unit(sub(y, M_AT));
        const sn = sgn(dot(an, dn)), sm = sgn(dot(am, dm));
        if (sn === 0 || sm === 0 || sn === sm) continue;
        const wgt = 1 / (norm(sub(y, M_AT)) ** 2);   // what reaches here, 1/r²
        count += wgt;
        moment += wgt * (an[0] * dn[1] - an[1] * dn[0]);
      }
      return { count, moment };
    };

    /** least-squares amplitude of sin and cos in a sampled function of Δβ */
    const harmonics = (f: (d: number) => number, n = 360) => {
      let s = 0, c = 0, mean = 0;
      for (let i = 0; i < n; i++) {
        const d = i / n, v = f(d);
        mean += v / n; s += 2 * v * Math.sin(TAU * d) / n; c += 2 * v * Math.cos(TAU * d) / n;
      }
      return { mean, sin: s, cos: c };
    };

    const countAt = (d: number) => encounter(0, d).count;
    const momentAt = (d: number) => encounter(0, d).moment;

    const cH = harmonics(countAt), mH = harmonics(momentAt);
    const DS = [0.05, 0.125, 0.188, 0.25, 0.313, 0.375];
    const evenness = Math.max(...DS.map(d =>
      Math.abs(countAt(d) - countAt(-d)) / Math.max(Math.abs(countAt(d)), 1e-30)));
    /* SCALED BY THE LARGEST MOMENT, not by each point's own: near a staircase tread the
       moment passes through nought, and dividing a rounding error by it reports a relative
       failure where there is no signal to be relatively anything of. */
    const peak = Math.max(...DS.map(d => Math.abs(momentAt(d))), 1e-30);
    const oddness = Math.max(...DS.map(d => Math.abs(momentAt(d) + momentAt(-d)))) / peak;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "worst |count(+Δβ) − count(−Δβ)| over the count itself", value: evenness,
          expect: {
            of: "0 — THE COUNT IS EVEN, and an even coupling cannot lock",
            want: 0, tolerance: 1e-9,
            because: "identical at +Δβ and −Δβ to every digit. An even coupling HAS NO WAY TO " +
              "TELL AHEAD FROM BEHIND, so it cannot pull a laggard forward and a leader back, " +
              "and a population under it drifts rather than locking. Which is why the count is " +
              "the wrong thing to read and the moment is the right one",
          },
          note: `sine component of the count ${cH.sin.toExponential(1)} against a cosine of ` +
            `${cH.cos.toExponential(3)}`,
        }),
        judge({
          name: "worst |moment(+Δβ) + moment(−Δβ)| over the moment", value: oddness,
          expect: {
            of: "0 — ODD, exactly, at every phase difference", want: 0, tolerance: 1e-9,
            because: "the first moment about n's axis reverses with the sign of the phase " +
              "difference, which is what a locking coupling has to do. SO THE COUPLING IS " +
              "DERIVED rather than assumed — out of (G+M/1) and the 1/r² the pulses arrive " +
              "with. No harmonic expansion and no product-to-sum are needed: the lattice hands " +
              "over the odd first harmonic directly, BECAUSE ANNIHILATION HAS A PLACE AND AN " +
              "AXIS HAS A SIDE",
          },
        }),
        judge({
          name: "cosine component of the moment", value: Math.abs(mH.cos),
          expect: {
            of: "0 — no even part, so the lowest harmonic is sin(2πΔβ)", want: 0, tolerance: 1e-9,
            because: "the control on the row above: an odd function sampled coarsely could " +
              "still carry an even component if the staircase were lopsided. IT IS A COARSE " +
              "STAIRCASE rather than a smooth sine — the signs are sgn(axis·d̂) over the exits, " +
              "so it only moves when the axis crosses onto a new set of them — but the SYMMETRY " +
              "is the part that matters and it is clean",
          },
          note: `mean ${mH.mean.toExponential(1)}, sin ${mH.sin.toExponential(3)}`,
        }),
      ],
      table: {
        columns: ["Δβ", "count", "moment", "at −Δβ"],
        rows: DS.map(d => [d.toFixed(3), countAt(d).toExponential(3),
          momentAt(d).toExponential(3), momentAt(-d).toExponential(3)]),
      },
    };
  },
});

/* ── departure: "monopole" was too kind ────────────────────────────────────── */

export const notEvenAMonopole = test({
  id: "texture/not-even-a-field",
  claims: "take the sided tally seriously as a vector field and its flux through spheres " +
    "is nothing at every radius — so there is no monopole and ∇·B = 0 holds. What the 1/r² " +
    "is instead is sgn(cos θ)/r², which is impossible for any real field",
  cited: ["departure.ts"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    /* the sided tally as a field: B = Σ sgn(n̂·r̂) r̂/r², from a lump of nodes */
    const nodes: Vec[] = [];
    for (let x = -1.5; x <= 1.5; x++) for (let y = -1.5; y <= 1.5; y++)
      for (let z = -1.5; z <= 1.5; z++) nodes.push([x, y, z]);
    const nhat: Vec = [0, 0, 1];
    const Bat = (P: Vec): Vec => {
      const out: Vec = [0, 0, 0];
      for (const c of nodes) {
        const d = sub(P, c), r = norm(d);
        if (r < 1e-9) continue;
        const s = sgn(dot(nhat, unit(d)));
        for (let i = 0; i < 3; i++) out[i] += s * d[i] / (r * r * r);
      }
      return out;
    };

    /* the flux through a sphere: a monopole would give the enclosed charge at every radius */
    const flux = (R: number) => {
      let acc = 0; const K = 4000, ph = (1 + Math.sqrt(5)) / 2;
      for (let i = 0; i < K; i++) {
        const z = 1 - 2 * (i + 0.5) / K, rr = Math.sqrt(Math.max(0, 1 - z * z));
        const t = TAU * i / ph;
        const n: Vec = [rr * Math.cos(t), rr * Math.sin(t), z];
        acc += dot(Bat(scale(n, R)), n);
      }
      return Math.abs(acc / K * 2 * TAU * R * R);
    };
    const fluxes = [200, 800, 1600].map(flux);

    /* the angular profile at fixed radius, times r² */
    const R = 400;
    const ANGLES = [0, 30, 60, 89, 90, 91, 120, 180];
    const profile = ANGLES.map(deg => {
      const th = deg * Math.PI / 180;
      const P: Vec = [R * Math.sin(th), 0, R * Math.cos(th)];
      return { deg, v: dot(Bat(P), unit(P)) * R * R };
    });
    const upper = profile.filter(p => p.deg < 90).map(p => p.v);
    const lower = profile.filter(p => p.deg > 90).map(p => p.v);
    const flatUpper = Math.max(...upper) / Math.min(...upper);
    /* the two hemispheres compared as sets — the sampled angles are not symmetric pairs */
    const meanU = upper.reduce((a, b) => a + b, 0) / upper.length;
    const meanL = lower.reduce((a, b) => a + b, 0) / lower.length;
    const mirror = Math.abs(meanU + meanL) / Math.abs(meanU);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "flux through spheres, worst over r = 200 … 1600", value: Math.max(...fluxes),
          expect: {
            of: "0 — THERE IS NO MONOPOLE, and ∇·B = 0 holds observationally",
            want: 0, tolerance: 1e-6,
            because: "a monopole would give the enclosed charge, the SAME at every radius. It " +
              "gives nothing at every radius, which is the quadrature error and not a number. " +
              "So the diagnosis the arc was written on — that a sided lump is a monopole — is " +
              "not quite right, IN A DIRECTION THAT MAKES THE CASE STRONGER",
          },
          note: fluxes.map((f, i) => `${f.toExponential(0)} at r = ${[200, 800, 1600][i]}`).join(", "),
        }),
        judge({
          name: "r²·F from the pole to one degree off the equator, worst ratio", value: flatUpper,
          expect: {
            of: "1 — CONSTANT magnitude, which no real field is", want: 1, tolerance: 1e-3,
            because: "that is sgn(cos θ)/r², and it is impossible for any real field: zero " +
              "enclosed charge FORBIDS a 1/r² term in a multipole expansion outright, so the " +
              "exterior is not source-free. THE LUMP IS NOT EMITTING A NET CHARGE. IT IS NOT " +
              "EMITTING A FIELD",
          },
        }),
        judge({
          name: "how well the lower hemisphere mirrors the upper", value: mirror,
          expect: {
            of: "0 — its own mirror below, with a step at the equator", want: 0, tolerance: 1e-3,
            because: "the step discontinuity at 90° is a SOURCE SHEET RUNNING TO INFINITY, " +
              "which is what a field with a constant 1/r² magnitude and a sign flip has to " +
              "have. The mirror symmetry is what says the step is the whole of the structure",
          },
        }),
      ],
      table: {
        columns: ["θ", ...ANGLES.map(String)],
        rows: [["r²·F", ...profile.map(p => p.v.toFixed(1))]],
      },
    };
  },
});

export default [theRingIsOneAxisClass, theHolonomyIsZero, theCouplingIsOdd, notEvenAMonopole];
