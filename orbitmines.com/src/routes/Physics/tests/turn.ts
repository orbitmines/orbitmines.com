/**
 * TURN — the escape from the obstruction, the Lorentz force it gives, and the bill.
 *
 * The port of `todo/provenance/magnetic.ts` §3–§5. `electrostatics/lorentz-obstruction`
 * leaves the arc stuck on a theorem: M is a sum of d̂⊗d̂ and therefore SYMMETRIC, so the
 * force it gives can never be perpendicular to the velocity. The escape has been in print
 * since the magnetism arc needed a source to come back round.
 *
 *   §3  M IS SYMMETRIC BECAUSE ±d̂ IS d̂ REFLECTED, and a reflection is symmetric. So the
 *       question is whether anything in the model does something to a direction other
 *       than reflect it — and (G+M/3) HAS ALWAYS BEEN A ROTATION. `turnRing` walks one
 *       direction toward another and TAKES THE PLANE AS AN ARGUMENT, so the model has
 *       carried a free axis in its central rule from the beginning. Rodrigues splits it:
 *
 *           R(b̂,θ) = I + sin θ [b̂]× + (1 − cos θ) [b̂]ײ
 *
 *       and the middle term is the one thing a distribution can never supply
 *   §4  SO IT IS A LORENTZ FORCE. The transverse part lies along v×b̂, reverses with the
 *       charge, vanishes when the motion is parallel to the axis, and has magnitude
 *       q|v||B| sin θ with |B| = (DEG/3)·sin SPIN — a lattice count, not a fit
 *   §4  AND THE BILL, WHICH SHOULD NOT BE READ PAST. Rodrigues has three terms and only
 *       the middle one is antisymmetric; the (1 − cos θ) term is symmetric and lies along
 *       v. So the turn gives a Lorentz force PLUS a charge-independent LONGITUDINAL one,
 *       locked to it in a ratio the lattice fixes and nothing can tune: tan(SPIN/2)
 *   §5  and what sources the axis: b̂ ∝ J, because ρ is a scalar with no direction, M is
 *       symmetric and has axes but no SENSE, and the lattice's own directions cannot vary
 *       from place to place. A POLARITY DISCREPANCY IS NOT THE MAGNETIC FIELD — IT IS
 *       WHAT SOURCES IT
 *
 * EVERY NUMBER HERE MOVES WITH THE GEOMETRY, and that is the point of re-measuring it.
 * The old file ran cubic 26, where SPIN is 45° and the bill is √2 − 1 = 41.4%. The book
 * runs fcc 12, where SPIN is 60°.
 *
 * WHERE THE q IN qv×B COMES FROM. An alike meeting is between two charges of the SAME
 * sign, so their polarities cannot distinguish them from each other — both turn the same
 * way about b̂ and the pair's displacements cancel exactly, which is the third law. What
 * the polarity distinguishes is the two CHARGES: a structure of charge q turns by q·SPIN,
 * so reversing the charge reverses the rotation.
 */

import { World, Vec, Geometry, headerOf, judge, dot, cross, unit, norm, scale, add } from "../DISCRETE";
import { test } from "../SUITE";

/** Rodrigues, written out — the three terms are the whole of §3 and §4 */
const rotate = (v: Vec, b: Vec, th: number): Vec => {
  const c = Math.cos(th), s = Math.sin(th);
  const k = cross(b, v), kd = dot(b, v);
  return [0, 1, 2].map(i => v[i] * c + k[i] * s + b[i] * kd * (1 - c));
};

/** a background: n(d̂,σ) for every exit and both signs */
export type Background = { plus: number[]; minus: number[] };

/**
 * The force on a structure of charge q moving at v through a background.
 *
 * Opposite meets annihilate and the displacement is −d̂ — a REFLECTION. Alike meets turn,
 * and with the turn in, the displacement is d̂ ROTATED by q·SPIN about b̂. The rate of each
 * carries the closing factor (1 − v·d̂).
 */
export const force = (
  g: Geometry, q: number, bg: Background, v: Vec, b: Vec | null,
  /* the turn angle, FREE — g.SPIN is what the lattice's ring gives, not what the rule needs */
  theta = g.SPIN,
): Vec => {
  let F: Vec = [0, 0, 0];
  for (let i = 0; i < g.DEG; i++) {
    const d = [0, 1, 2].map(k => g.U[i][k] ?? 0);
    const rate = 1 - dot(v, d);
    for (const sigma of [+1, -1] as const) {
      const n = sigma > 0 ? bg.plus[i] : bg.minus[i];
      if (!n) continue;
      const alike = q * sigma > 0;
      let step: Vec = alike ? d : scale(d, -1);
      if (alike && b) step = rotate(d, b, q * theta);
      F = add(F, scale(step, n * rate));
    }
  }
  return F;
};

export const theTurnIsALorentzForce = test({
  id: "electrostatics/turn-as-lorentz",
  claims: "(G+M/3) is a rotation rather than a reflection, which gives a Lorentz force — " +
    "and a longitudinal one locked to it at tan(SPIN/2), which is not observed",
  cited: [
    "the escape is a line of lattice.ts, and it has always been blank",
    "and then it is a Lorentz force, with a bill attached",
    "and now the bill, which should not be read past",
    "what sources the axis — where the polarity discrepancy comes back and is right",
  ],
  under: { "gravity+magnetism": "holds" },
  exact: true,                    // algebra over the exits: no box, no ticks, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const SPIN = g.SPIN;
    const b = unit([0, 0, 1]);

    /* no net polarity anywhere, so J = 0 and everything below is the turn's doing */
    const flat: Background = { plus: g.U.map(() => 1), minus: g.U.map(() => 1) };
    const J = g.U.reduce((a, u, i) =>
      add(a, scale([0, 1, 2].map(k => u[k] ?? 0), flat.plus[i] - flat.minus[i])), [0, 0, 0]);

    const speed = 0.2;
    const headings: Vec[] = [[1, 0, 0], [0, 1, 0], [0.6, 0.8, 0], [0.5, 0.3, 0.81], [0, 0, 1]];

    const rows: (string | number)[][] = [];
    let worstFlip = 0, worstAlongB = 0, worstRatio = 0, worstLaw = 0, worstWork = 0;
    let parallelCase = 0, perpRatio = 0;

    /** the article's own prediction for the field's size, off the exits */
    const Bpred = (g.DEG / 3) * Math.sin(SPIN);

    for (const h of headings) {
      const v = scale(unit(h), speed);
      const tHat = cross(unit(v), b);
      const parallel = norm(tHat) < 1e-12;
      const Fp = force(g, +1, flat, v, b), Fm = force(g, -1, flat, v, b);

      const trans = parallel ? NaN : dot(Fp, unit(tHat));
      const transM = parallel ? NaN : dot(Fm, unit(tHat));
      const longi = dot(Fp, unit(v));
      const longiM = dot(Fm, unit(v));

      if (parallel) {
        /* v ∥ b̂: there is no transverse direction, and the Lorentz part must vanish */
        parallelCase = norm([Fp[0] - dot(Fp, b) * b[0], Fp[1] - dot(Fp, b) * b[1],
          Fp[2] - dot(Fp, b) * b[2]]) / Math.max(norm(Fp), 1e-12);
      } else {
        /* it reverses with the charge; the longitudinal part does NOT */
        worstFlip = Math.max(worstFlip, Math.abs(trans + transM) / Math.abs(trans));
        /*
         * THE RATIO CARRIES A sin θ, WHICH THE ARTICLE'S FIGURE DOES NOT SHOW because it
         * quotes the perpendicular case. Measured: the transverse part goes as sin θ and
         * the longitudinal as sin²θ, so their ratio is tan(SPIN/2)·sin θ and equals the
         * quoted bill only at v ⊥ b̂. Taking a worst case over headings compares two
         * different things; this compares the ratio against its own θ-dependence, which
         * is the statement that actually holds everywhere.
         */
        const sinT = norm(cross(unit(v), b));
        worstRatio = Math.max(worstRatio,
          Math.abs(Math.abs(longi / trans) - Math.tan(SPIN / 2) * sinT));
        /* |F⊥| = q|v||B| sin θ, with θ the angle between v and b̂ */
        worstLaw = Math.max(worstLaw,
          Math.abs(Math.abs(trans) / (speed * Bpred * sinT) - 1));
        /* the work fraction likewise, quoted by the arc at v ⊥ b̂ */
        if (Math.abs(sinT - 1) < 1e-9) {
          const workFrac = Math.abs(dot(Fp, v)) / (norm(Fp) * norm(v));
          worstWork = Math.max(worstWork, Math.abs(workFrac - Math.sin(SPIN / 2)));
          perpRatio = Math.abs(longi / trans);
        }
        /* and the longitudinal part is charge-INDEPENDENT, which is the bill's sting */
        worstAlongB = Math.max(worstAlongB, Math.abs(longi - longiM) / Math.abs(longi));
      }
      rows.push([
        `[${h.map(x => x.toFixed(2)).join(",")}]`,
        parallel ? "— v ∥ b̂" : trans.toExponential(3),
        longi.toExponential(3),
        parallel ? "—" : Math.abs(longi / trans).toFixed(6),
      ]);
    }

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "net polarity of the background", value: norm(J),
          expect: {
            of: "0 — so there is no electric field and it is all the turn's doing",
            want: 0, tolerance: 1e-12,
            because: "J is the electric part and it is present at v = 0, so a background with " +
              "any of it would confuse the two. This is the control that makes everything below " +
              "attributable to (G+M/3)",
          },
        }),
        judge({
          name: "does the transverse part reverse with the charge", value: worstFlip,
          expect: {
            of: "0 — IT IS A LORENTZ FORCE", want: 0, tolerance: 1e-12,
            because: "a structure of charge q turns by q·SPIN, so reversing the charge reverses " +
              "the rotation — WHICH IS WHERE THE q IN qv×B COMES FROM. It is not put in: it " +
              "follows from the polarity distinguishing the two charges while leaving an alike " +
              "pair unable to distinguish itself",
          },
        }),
        judge({
          name: "does the force vanish transverse to b̂ when v ∥ b̂", value: parallelCase,
          expect: {
            of: "0 — nothing to turn about", want: 0, tolerance: 1e-3,
            because: "the third property of a Lorentz force, and the one a longitudinal force " +
              "could not fake. The band is a thousandth rather than machine zero because the " +
              "residual is the LATTICE'S own anisotropy — a finite set of exits does not " +
              "resolve a rotation axis perfectly — and not a transverse force: it is four " +
              "orders below the transverse part at any other heading",
          },
        }),
        judge({
          name: "|F⊥| against q|v||B| sin θ, worst heading", value: worstLaw,
          expect: {
            of: `0 — with |B| = (DEG/3)·sin SPIN = ${Bpred.toFixed(6)}, a lattice count`,
            want: 0, tolerance: 1e-9,
            because: "the magnitude obeys the law to every digit measured, and the coefficient " +
              "is not free: it is a count of exits times the sine of the turn. On cubic 26 that " +
              "is 6.128259; this geometry gives its own",
          },
        }),
        judge({
          name: "longitudinal over transverse, at v ⊥ b̂", value: perpRatio,
          expect: {
            of: "tan(SPIN/2) — THE BILL, and nothing can tune it",
            want: Math.tan(SPIN / 2), tolerance: 1e-9,
            because: "Rodrigues has three terms and only the middle is antisymmetric. The " +
              "(1 − cos θ) term is SYMMETRIC and lies along v, so the turn gives a Lorentz " +
              "force PLUS a charge-independent longitudinal one, locked together in a ratio the " +
              "lattice fixes. A charge moving through a magnetised vacuum is predicted to feel " +
              "this much longitudinal force independent of its sign. THAT IS NOT OBSERVED and " +
              "would be conspicuous if it were — it goes on the ledger as a deviation, not a " +
              "rounding error",
          },
          note: `${(100 * Math.tan(SPIN / 2)).toFixed(1)}% on ${g.name}, where SPIN is ` +
            `${(180 * SPIN / Math.PI).toFixed(0)}°; the cubic-26 file this replaces read ` +
            `41.4%, which is √2 − 1 at SPIN = 45°`,
        }),
        judge({
          name: "the ratio against tan(SPIN/2)·sin θ, worst heading", value: worstRatio,
          expect: {
            of: "0 — THE BILL CARRIES A sin θ THE ARC'S FIGURE DOES NOT SHOW",
            want: 0, tolerance: 1e-9,
            because: "measured across headings, the transverse part goes as sin θ and the " +
              "longitudinal as sin²θ, so their ratio is tan(SPIN/2)·sin θ and reaches the quoted " +
              "bill only at v ⊥ b̂. The arc states the perpendicular case, which is the WORST " +
              "case — so the deviation is smaller for a charge moving obliquely and the ledger " +
              "entry is an upper bound rather than a flat prediction. Not a correction to the " +
              "arc so much as the general law its figure is one point of",
          },
        }),
        judge({
          name: "work fraction |F·v|/|F||v|, at v ⊥ b̂", value: Math.sin(SPIN / 2) - worstWork,
          expect: {
            of: "sin(SPIN/2) — the same bill read as an angle", want: Math.sin(SPIN / 2),
            tolerance: 1e-9,
            because: "the two are the same statement: longi/trans = tan(SPIN/2) gives a work " +
              "fraction of sin(SPIN/2) by construction. Carried because the arc quotes both, " +
              "and because this is the number `electrostatics/lorentz-obstruction` could not " +
              "get below one — the turn is what buys it",
          },
        }),
        judge({
          name: "is the longitudinal part charge-independent", value: worstAlongB,
          expect: {
            of: "0 — it does NOT reverse, which is what makes it a deviation",
            want: 0, tolerance: 1e-12,
            because: "a force that reversed with the charge would merely be a second magnetic " +
              "term. One that does not is a longitudinal force on every charge alike, and " +
              "nothing observed does that",
          },
        }),
        /*
         * §5, REPORTED WITHOUT A BAND. What sources b̂ is an argument by elimination rather
         * than a measurement — ρ is a scalar with no direction, M is symmetric and has axes
         * but no SENSE, and the lattice's own directions cannot vary from place to place.
         * There is no number here to hold to a band; what the run can say is that the
         * candidate exists and is the one quantity left.
         */
        {
          name: "vectors a cell has available to source the axis", value: 1,
          note: "b̂ ∝ J = Σ σ n(d̂,σ) d̂. ρ is a scalar and has no direction; M is symmetric " +
            "and has axes but no sense; the lattice's own directions are fixed and cannot vary " +
            "from place to place. So the second direction of the turn plane is the POLARITY " +
            "CURRENT — and that is the original idea put where it works: a discrepancy in the " +
            "distribution of polarity is not the magnetic field, it is what SOURCES it",
        },
      ],
      table: {
        columns: ["v", "F·(v̂×b̂) transverse", "F·v̂ longitudinal", "ratio"],
        rows,
      },
    };
  },
});

export default [theTurnIsALorentzForce];
