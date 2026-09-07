/**
 * SOURCING — what can hand the turn a plane, and the proof that nothing local can.
 *
 * The port of `todo/provenance/faraday.ts` §1–§3. `magnetism/current-as-source` closes the
 * arc's hole by reading the second direction of the turn plane off J, the polarity current:
 * ρ is a scalar with no direction, M is symmetric and has axes but no SENSE, and the
 * lattice's own directions cannot vary from place to place, so J is the only candidate a
 * cell has. THAT ANSWER IS WRONG, and this measures how — which is worth more than the
 * answer would have been, because the way it fails turns three separate open questions
 * into one.
 *
 *   §1  IT TESTED THE WRONG CONFIGURATION. `current-as-source`'s "static charge" is an
 *       isotropic excess of one polarity with NO DRIFT, which has J = 0 because J is a
 *       first moment — a charge DENSITY with no field rather than a charge. Build the real
 *       thing and at a field point near a static charge the rays are STREAMING OUTWARD, so
 *       d̂ = r̂ and J is radial and large. A static charge then sources an axis, radially,
 *       WHICH IS A MONOPOLE — the very thing the arc congratulated itself on forbidding.
 *       And the general consequence is worse: the electric force is qJ and the axis is
 *       b̂ ∝ J, so E AND B ARE THE SAME VECTOR up to a constant, parallel everywhere.
 *       No field is like that: a static charge has E and no B, a wave has them at 90°
 *   §2  AND THE REPAIRS ARE MEASURABLE, SO THEY WERE MEASURED. b̂ ∝ d̂ × J fails on
 *       SUMMATION — the force sums the turn over all arriving rays and the axis enters
 *       linearly, so what acts is Σ n (d̂ × J) = F × J, which for a one-polarity source is
 *       J × J. The better repair b̂ ∝ J × F gives a wire exactly Biot–Savart's geometry
 *       and gives a MOVING CHARGE NOTHING, because a single charge emits one polarity, so
 *       J = σF exactly and parallel vectors have no cross product
 *   §3  AND IT IS STRUCTURAL RATHER THAN BAD LUCK. Under reflection every vector moment of
 *       n(d̂,σ) is POLAR and J × F is AXIAL, so the model CAN build a pseudovector locally
 *       and parity is not the trouble. The trouble is that there are only two such vectors
 *       and they COINCIDE wherever the arriving rays carry one sign
 *
 * WHY SUPERPOSITION IS THE RIGHT INSTRUMENT HERE, given that the arc criticises it
 * elsewhere. `magnetostatics` complains that `fork`'s rows were sums over an analytic
 * expression at a field point, with no lattice, no vacuum and no collisions — and it is
 * right, for a row claiming a field HAS a certain size. These rows claim the opposite: that
 * a quantity is identically zero, for an algebraic reason that no amount of lattice can
 * repair. J = σF for a one-polarity source is true before any box is built, and a
 * refutation by algebra does not acquire content from being run on a grid.
 *
 * AND NOTHING HERE MOVES WITH THE GEOMETRY, for the same reason: there are no exits in it.
 * The arriving direction is the RETARDED one, d̂ = unit((P − s) + u·R), which is aberration
 * to first order in u and is where a source's motion enters the direction a ray comes from.
 */

import { World, Vec, headerOf, judge, dot, cross, add, scale, unit, norm } from "../DISCRETE";
import { test } from "../SUITE";

/** a source element: where it is, what sign it emits, and how fast it is going */
type Emitter = { at: Vec; sigma: number; u: Vec };

const angle = (a: Vec, b: Vec) => {
  const na = norm(a), nb = norm(b);
  if (na < 1e-14 || nb < 1e-14) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (na * nb)))) * 180 / Math.PI;
};

/**
 * The two vector moments of the arriving rays: the SIGNED current and the UNSIGNED flux.
 *
 * Each element's ray arrives along the direction from its RETARDED position and carries
 * weight 1/R² — the emission's own fall-off, which the gravity arc derived and this
 * inherits rather than assumes.
 */
const moments = (P: Vec, src: Emitter[]) => {
  let J: Vec = [0, 0, 0], F: Vec = [0, 0, 0], rho = 0;
  for (const e of src) {
    const sep = [P[0] - e.at[0], P[1] - e.at[1], P[2] - e.at[2]];
    const R = norm(sep);
    if (R < 1e-9) continue;
    const d = unit(add(sep, scale(e.u, R)));       // retarded direction — aberration
    const w = 1 / (R * R);
    J = add(J, scale(d, e.sigma * w));
    F = add(F, scale(d, w));
    rho += e.sigma * w;
  }
  return { J, F, rho };
};

const staticCharge = (): Emitter[] => [{ at: [0, 0, 0], sigma: +1, u: [0, 0, 0] }];
const movingCharge = (u: number): Emitter[] => [{ at: [0, 0, 0], sigma: +1, u: [0, 0, u] }];

/** a neutral line current along z: + drifting one way, − the other, in the same places */
const lineCurrent = (I: number, half = 4000): Emitter[] => {
  const out: Emitter[] = [];
  for (let z = -half; z <= half; z++) {
    out.push({ at: [0, 0, z], sigma: +1, u: [0, 0, +I] });
    out.push({ at: [0, 0, z], sigma: -1, u: [0, 0, -I] });
  }
  return out;
};

/**
 * THE THIRD MOMENT, once a ray carries one more label: WHAT ITS EMITTER WAS DOING WHEN IT
 * LEFT. A ray already carries a polarity it did not compute; this carries one more fact
 * from the same place, and then an axial vector exists where J and F are polar.
 *
 *     W = Σ σ n(d̂,σ,u) (d̂ × u)          polar × polar = axial
 *
 * AND THE FIRST ATTEMPT AT IT WAS WRONG, which is where the physics is. Making the label a
 * bare unit axis — "which way the strand points" — gives a moving charge a field
 * INDEPENDENT OF ITS SPEED, because a unit vector does not know how fast anything is going.
 * The fix is not a factor put in by hand: a strand advances one cell per tick when it
 * advances at all, and how often it advances is a duty cycle, which is what this book
 * already calls mass. So the label is the axis TIMES THE RATE — which is the emitter's
 * velocity, and both halves were already in the strand reading.
 */
const labelMoment = (P: Vec, src: Emitter[]) => {
  let W: Vec = [0, 0, 0];
  for (const e of src) {
    const sep = [P[0] - e.at[0], P[1] - e.at[1], P[2] - e.at[2]];
    const R = norm(sep);
    if (R < 1e-9) continue;
    const d = unit(add(sep, scale(e.u, R)));
    W = add(W, scale(cross(d, e.u), e.sigma / (R * R)));
  }
  return W;
};

/** reflect a vector in the plane whose normal is m */
const reflect = (v: Vec, m: Vec): Vec => add(v, scale(m, -2 * dot(v, m)));

export const noLocalAxis = test({
  id: "magnetism/sourcing-obstruction",
  claims: "b̂ ∝ J makes a static charge a MONOPOLE and puts E parallel to B everywhere; " +
    "the repair b̂ ∝ J × F gives a wire Biot–Savart and gives a moving charge nothing — and " +
    "that is structural, because J × F is the only local pseudovector and J and F coincide " +
    "wherever the arriving rays carry one sign",
  cited: ["faraday.ts §1", "faraday.ts §2", "faraday.ts §3"],
  under: { "gravity": "holds" },
  exact: true,                    // superposition and parity algebra: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    /* §1: the static charge, built as one actually is */
    const RADII = [5, 10, 20];
    const stat = RADII.map(r => {
      const P: Vec = [r, 0, 0];
      const m = moments(P, staticCharge());
      return {
        r, J: m.J, F: m.F, mag: norm(m.J), toR: angle(m.J, [1, 0, 0]),
        /* E is qJ and the axis is b̂ ∝ J, so this is the angle between E and B */
        eb: angle(m.J, m.J),
      };
    });
    const worstInvSquare = Math.max(...stat.map(s => Math.abs(s.mag * s.r * s.r - 1)));
    const axisNonZero = stat.every(s => s.mag > 1e-12) ? 1 : 0;
    const worstRadial = Math.max(...stat.map(s => s.toR));

    /* §2: the two repairs */
    const CASES: [string, Emitter[]][] = [
      ["static charge", staticCharge()],
      ["moving charge, u = 0.3", movingCharge(0.3)],
      ["moving charge, u = 0.9", movingCharge(0.9)],
      /* the arc's own wire: I = 0.3, summed two thousand elements each way */
      ["neutral line current", lineCurrent(0.3, 2000)],
    ];
    const P: Vec = [10, 0, 0];
    const rows = CASES.map(([name, src]) => {
      const { J, F } = moments(P, src);
      const b = cross(J, F);
      return {
        name, J, F, b, jf: angle(J, F), mag: norm(b),
        toZ: angle(b, [0, 0, 1]), toR: angle(b, [1, 0, 0]),
        /* the FIRST repair, summed as the force actually sums it: Σ n (d̂ × J) = F × J */
        firstRepair: norm(cross(F, J)),
      };
    });
    const charges = rows.slice(0, 3), wire = rows[3];
    const worstChargeAxis = Math.max(...charges.map(r => r.mag));
    const worstFirstRepair = Math.max(...charges.map(r => r.firstRepair));

    /* §3: how the moments transform under a reflection */
    const mirror = unit([1, 1, 0.3]);
    const src = lineCurrent(0.3, 400);
    const here = moments(P, src);
    const flipped = moments(reflect(P, mirror),
      src.map(e => ({ at: reflect(e.at, mirror), sigma: e.sigma, u: reflect(e.u, mirror) })));
    /* POLAR means the moment reflects with the configuration; AXIAL means it reflects and flips */
    const polarErr = (a: Vec, b: Vec) => norm(add(b, scale(reflect(a, mirror), -1))) / Math.max(norm(a), 1e-30);
    const axialErr = (a: Vec, b: Vec) => norm(add(b, reflect(a, mirror))) / Math.max(norm(a), 1e-30);
    const jPolar = polarErr(here.J, flipped.J);
    const fPolar = polarErr(here.F, flipped.F);
    const bAxial = axialErr(cross(here.J, here.F), cross(flipped.J, flipped.F));

    /*
     * AND THE SAME QUESTION OF THE LABELLED MOMENT, which is what the arc resolves onto.
     * W has to be axial for the same reason B is, and — the row that matters — it must be
     * NON-ZERO FOR A SINGLE POLARITY'S EMISSION, which is exactly where J × F dies.
     */
    const wHere = labelMoment(P, src), wFlip = labelMoment(reflect(P, mirror),
      src.map(e => ({ at: reflect(e.at, mirror), sigma: e.sigma, u: reflect(e.u, mirror) })));
    const wAxial = axialErr(wHere, wFlip);
    const wMoving = labelMoment([10, 0, 0], movingCharge(0.3));
    const wStatic = labelMoment([10, 0, 0], staticCharge());
    /* and LINEAR IN THE SPEED, which is what makes the label a velocity and not an axis */
    const flatness = (us: number[]) => {
      const per = us.map(u => norm(labelMoment([10, 0, 0], movingCharge(u))) / u);
      return Math.max(...per) / Math.min(...per);
    };
    const speedFlat = flatness([0.02, 0.05, 0.1]);
    const speedFlatFast = flatness([0.1, 0.2, 0.3, 0.5]);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "worst |J|·r² − 1 for a properly built static charge", value: worstInvSquare,
          expect: {
            of: "0 — J is radial and LARGE, not zero", want: 0, tolerance: 1e-9,
            because: "the configuration the arc actually tested was an isotropic excess of one " +
              "polarity with NO DRIFT, which has J = 0 because J is a first moment — a charge " +
              "DENSITY with no field rather than a charge. At a field point near a real static " +
              "charge the rays are STREAMING OUTWARD, so d̂ = r̂ and J is the emission's own " +
              "1/r² . This row is what makes the two below fatal rather than hypothetical",
          },
          note: `${stat.map(s => `${s.mag.toExponential(3)} at r = ${s.r}`).join(", ")}, ` +
            `radial to ${worstRadial.toExponential(1)}°`,
        }),
        /* the three field points themselves, so the article can quote them live */
        ...stat.map(x => ({
          name: `|J| at r = ${x.r}, which is also |E|`, value: x.mag,
          note: `at ${x.toR.toFixed(2)}° to r̂ — and NOT quantised onto an exit, because this ` +
            `is superposition over emitters rather than a lattice sum, which is the whole ` +
            `reason a refutation is allowed to be computed this way`,
        })),
        judge({
          name: "does a STATIC charge source a turn axis under b̂ ∝ J", value: axisNonZero,
          expect: {
            of: "1 — WHICH IS A MONOPOLE", want: 1, tolerance: 0,
            because: "and the arc forbids monopoles two headings earlier, on the ground that a " +
              "turn axis is a generator and not an amount of anything. Here b̂ points radially " +
              "away from a point source at every field point, which is precisely the " +
              "configuration ∇·B = 0 rules out. A PASSING VERDICT ON THIS ROW IS A REFUTATION " +
              "of the rule it tests, which is why it is stated as a question rather than a want",
          },
        }),
        judge({
          name: "∠(E, B) under b̂ ∝ J", value: stat[0].eb, units: "°",
          expect: {
            of: "0 — E AND B ARE THE SAME VECTOR up to a constant", want: 0, tolerance: 1e-9,
            because: "the general consequence, and it is worse than the monopole because it does " +
              "not depend on the source. The electric force is qJ and the axis is b̂ ∝ J, so the " +
              "two are parallel EVERYWHERE, necessarily. No field is like that — a static charge " +
              "has E and no B, a wave has them perpendicular. THE ZERO IS BY CONSTRUCTION, which " +
              "makes this a refutation rather than a measurement that came out badly",
          },
        }),
        judge({
          name: "the FIRST repair b̂ ∝ d̂ × J, summed over arriving rays", value: worstFirstRepair,
          expect: {
            of: "0 — it fails on SUMMATION", want: 0, tolerance: 1e-12,
            because: "the plane spanned by the incoming heading and J is degenerate exactly when " +
              "they are parallel, which is the static case — so taking b̂ ∝ d̂ × J per ray looks " +
              "like the fix. But the force sums the turn over ALL arriving rays and the axis " +
              "enters linearly, so what acts is Σ n (d̂ × J) = F × J, which for a one-polarity " +
              "source is J × J. The repair is undone by the same sum that makes a force",
          },
        }),
        judge({
          name: "the SECOND repair b̂ ∝ J × F, worst over the three single charges",
          value: worstChargeAxis,
          expect: {
            of: "0 — A MOVING CHARGE GETS NO MAGNETIC FIELD AT ALL", want: 0, tolerance: 1e-12,
            because: "a single charge emits ONE polarity, so every arriving ray carries the same " +
              "sign, J = σF exactly, and parallel vectors have no cross product. THAT IS NOT A " +
              "SMALL DEVIATION TO BE CHARGED TO DISCRETENESS: a moving charge's magnetic field " +
              "is the most elementary magnetic fact there is, and it is what a wire's field is " +
              "MADE OF — so a rule giving a wire a field while giving each of its carriers none " +
              "is not a rule, it is an accident of the wire being neutral",
          },
        }),
        judge({
          name: "∠(J, F) for the neutral wire, where the repair does work", value: wire.jf,
          units: "°",
          expect: {
            of: "90 — and READ THIS ROW FIRST, because it works", want: 90, tolerance: 1e-6,
            because: "b̂ comes out at 90° to the current and 90° to the displacement, which is " +
              "Biot–Savart's geometry, and perpendicular to J and so to E. FOR A WIRE THIS IS " +
              "RIGHT — which is exactly what makes the charge rows fatal instead of merely " +
              "disappointing: the rule is not too weak everywhere, it is correct on the one " +
              "source whose neutrality lets J and F come apart",
          },
          note: `|J×F| = ${wire.mag.toExponential(2)}, at ${wire.toZ.toFixed(2)}° to ẑ and ` +
            `${wire.toR.toFixed(2)}° to r̂`,
        }),
        judge({
          name: "worst departure from POLAR for J and F under reflection",
          value: Math.max(jPolar, fPolar),
          expect: {
            of: "0 — every vector moment of n(d̂,σ) is polar", want: 0, tolerance: 1e-12,
            because: "half of the structural argument, and the half that clears the model of the " +
              "obvious charge. B is AXIAL — a rotation axis, and reflecting space reverses a " +
              "rotation sense. If every locally available vector were polar there would be " +
              "nothing to build one from and parity alone would settle it",
          },
        }),
        judge({
          name: "departure from AXIAL for J × F under the same reflection", value: bAxial,
          expect: {
            of: "0 — so the model CAN build a pseudovector locally", want: 0, tolerance: 1e-12,
            because: "which is why parity is NOT the trouble, and saying so is what makes the " +
              "obstruction sharp instead of vague. THE TROUBLE IS THAT THERE ARE ONLY TWO SUCH " +
              "VECTORS AND THEY COINCIDE: the distribution offers a scalar ρ, two vectors J and " +
              "F, and symmetric tensors above them — so J × F is the only pseudovector there " +
              "is, and J and F differ ONLY where the arriving rays carry more than one sign. " +
              "Emission from a single charge is one sign by construction, so THE ONLY LOCAL " +
              "PSEUDOVECTOR THE MODEL HAS VANISHES FOR EXACTLY THE SOURCES THAT MOST OBVIOUSLY " +
              "HAVE MAGNETIC FIELDS",
          },
        }),
        judge({
          name: "departure from AXIAL for the labelled moment W", value: wAxial,
          expect: {
            of: "0 — polar × polar = axial, measured and not argued", want: 0, tolerance: 1e-12,
            because: "W = Σ σ n(d̂,σ,u)(d̂ × u) is a cross product of two polar things, so it " +
              "transforms the way a magnetic field has to. This is the row that says the label " +
              "buys a legitimate B and not merely a convenient one",
          },
        }),
        judge({
          name: "is |W| non-zero for a MOVING charge, where J × F is nought",
          value: norm(wMoving) > 1e-9 && norm(wStatic) < 1e-12 ? 1 : 0,
          expect: {
            of: "1 — THE LABEL WINS EXACTLY WHERE THE MOMENTS LOSE", want: 1, tolerance: 0,
            because: "THE WHOLE POINT OF THE FORK. J × F dies for a one-polarity source because " +
              "J = σF; W does not, because it is built from a THIRD fact about each ray rather " +
              "than from a second moment of the same two. A single charge emits one sign, and " +
              "one sign is enough once the ray remembers what its emitter was doing. A VERDICT " +
              "AND NOT A SIZE: how big it is on a lattice is magnetostatics/moving-charge's, " +
              "and the claim here is the qualitative one that decides the fork",
          },
          note: `|W| = ${norm(wMoving).toExponential(3)} at u = 0.3 and r = 10, ` +
            `against ${norm(wStatic).toExponential(1)} for the same charge AT REST — ` +
            `exactly nought, because a source that is not traversing contributes nothing ` +
            `before its orientation is consulted, which is stronger than needing matter to be ` +
            `unpolarised`,
        }),
        judge({
          name: "|W|/u over speeds 0.02 … 0.1, worst ratio", value: speedFlat,
          expect: {
            of: "1 — LINEAR IN THE SPEED, which is what makes the label a velocity",
            want: 1, tolerance: 0.03,
            because: "THE CORRECTION THAT IS WHERE THE PHYSICS IS. Making the label a bare unit " +
              "axis — which way the strand points — gives a moving charge a field INDEPENDENT " +
              "OF ITS SPEED, because a unit vector does not know how fast anything is going. " +
              "The fix is not a factor put in by hand: a strand advances one cell per tick when " +
              "it advances at all, and how often it advances is a duty cycle, which is what " +
              "this book already calls mass. So the label is the axis times the RATE — the " +
              "emitter's velocity — and both halves were already in the strand reading",
          },
          note: `and ${speedFlatFast.toFixed(4)} over 0.1 … 0.5, so the departure GROWS with ` +
            `speed — it is the aberration in the arrival direction, which is first order in u ` +
            `and therefore second order in the product, and not a failure of the linearity`,
        }),
      ],
      table: {
        columns: ["source", "∠(J,F)", "|J×F|", "∠(b̂,ẑ)", "∠(b̂,r̂)", "verdict"],
        rows: rows.map(r => [
          r.name, r.jf.toFixed(4) + "°", r.mag.toExponential(2),
          isFinite(r.toZ) ? r.toZ.toFixed(2) + "°" : "—",
          isFinite(r.toR) ? r.toR.toFixed(2) + "°" : "—",
          r.mag > 1e-12 ? "a field" : "NOTHING",
        ]),
      },
    };
  },
});

export default [noLocalAxis];
