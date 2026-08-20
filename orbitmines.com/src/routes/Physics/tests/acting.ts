/**
 * ACTING — every way a field could act on a meeting, enumerated; and two of them give a
 * Lorentz force with no bill at all.
 *
 * The port of `todo/provenance/acts.ts` §1–§2. This is the section the whole magnetic arc
 * has been owed. `magnetism/no-free-angle` closes the last escape from the turn's
 * longitudinal force — the angle is not free, so the bound falls on SPIN, which the lattice
 * fixes — and the arc's remaining reply is that THE TURN WAS NEVER SHOWN TO BE THE
 * RESPONSE. It was assumed because (G+M/3) is a turn. So enumerate.
 *
 * A meeting has exactly three things a field could touch, and that is the whole space:
 *
 *     WHERE IT PUTS THE STRUCTURE   the displacement, ±d̂          → M1 turn, M4 shear
 *     WHETHER IT HAPPENS AT ALL     the rate                       → M2 gate, M3 drag
 *     WHICH OF THE PAIR DIES        the outcome                    → M5 select
 *
 * and every section before this one tried only the first. Measured in an unbiased
 * background so there is no electric force, worst case over forty-eight velocity
 * directions, TWO OF THEM WORK — which was not expected:
 *
 *   M2 THE GATE does not move the structure anywhere new. The displacement is still ±d̂ and
 *     all the field does is make some directions likelier. It cannot have a symmetric part
 *     because it never touches the step.
 *   M4 THE SHEAR is this arc's own mechanism WITH ONE ASSUMPTION REMOVED, and the
 *     assumption was never justified. A rotation moves the displacement sideways by sin θ
 *     AND shortens it along its old direction by (1 − cos θ), because a rotation preserves
 *     length — and THAT SHORTENING IS THE LONGITUDINAL FORCE. Deflect sideways without
 *     insisting the step stay one cell long and there is no (1 − cos θ) term to carry a
 *     drag. So the arc's entire longitudinal problem came from NORMALISING.
 *
 * AND THE GATE'S FORM IS FORCED RATHER THAN CHOSEN, which §2 is for. A mechanism that only
 * worked for one hand-picked function would be no mechanism, so every scalar that can be
 * built from W, v and d̂ is swept. A gate must be ODD in d̂ or the ±d̂ pairs cancel it; it
 * must contain W or it is not magnetic; it must contain v or the force cannot know the
 * motion. [W, v, d̂] is the lowest-order scalar meeting all three and up to a constant it is
 * the only one.
 *
 * THE FORCE SUM IS THE SAME ONE `electrostatics/turn-as-lorentz` USES, deliberately: an
 * opposite meeting annihilates and displaces by −d̂, an alike one turns and displaces by
 * +d̂, each at the closing rate (1 − v·d̂). With no field the two cancel exactly, which is
 * the control that says the background is really neutral.
 */

import {
  World, Vec, Geometry, headerOf, judge, dot, cross, add, scale, unit, norm,
} from "../DISCRETE";
import { test } from "../SUITE";

type Mech = "none" | "M1turn" | "M2gate" | "M3drag" | "M4shear" | "M5select";

const rotate = (v: Vec, b: Vec, th: number): Vec => {
  const bh = unit(b), c = Math.cos(th), s = Math.sin(th);
  const k = cross(bh, v), kd = dot(bh, v);
  return [0, 1, 2].map(i => v[i] * c + k[i] * s + bh[i] * kd * (1 - c));
};

/** the gates §2 sweeps — every scalar that can be built from W, v and d̂ */
const GATES: [string, string, (W: Vec, v: Vec, d: Vec) => number][] = [
  ["[W, v, d̂]", "odd in d̂, odd in v", (W, v, d) => dot(W, cross(v, d))],
  ["(W·d̂)", "odd in d̂, no v", (W, _v, d) => dot(W, d)],
  ["(v·d̂)", "odd in d̂, no W", (_W, v, d) => dot(v, d)],
  ["(W·d̂)(v·d̂)", "EVEN in d̂", (W, v, d) => dot(W, d) * dot(v, d)],
  ["(W·v)", "no d̂ at all", (W, v) => dot(W, v)],
];

const force = (
  g: Geometry, mech: Mech, q: number, v: Vec, W: Vec, kappa: number,
  gate: (W: Vec, v: Vec, d: Vec) => number = GATES[0][2],
): Vec => {
  let F: Vec = [0, 0, 0];
  for (let i = 0; i < g.DEG; i++) {
    const d = [0, 1, 2].map(k => g.U[i][k] ?? 0);
    const closing = 1 - dot(v, d);
    for (const sigma of [+1, -1] as const) {
      const alike = q * sigma > 0;
      let step: Vec = alike ? d : scale(d, -1);
      let rate = closing;
      switch (mech) {
        case "none": break;
        /* M1 — the arc's own: an alike meeting ROTATES the step, by the charge's own
           sense. A rotation has a symmetric part, and that part is the bill. */
        case "M1turn": if (alike) step = rotate(d, W, q * kappa * norm(W)); break;
        /* M2 — GATE THE RATE, leaving the displacement untouched. It carries the ray's
           POLARITY, because a rate that does not know σ cannot make a force that knows q. */
        case "M2gate": rate *= 1 + kappa * sigma * gate(W, v, d); break;
        /* M3 — a gate that is EVEN in d̂ rather than odd, kept for contrast */
        case "M3drag": rate *= 1 + kappa * sigma * dot(W, d) * dot(v, d); break;
        /* M4 — SHEAR: add a perpendicular displacement rather than rotating */
        case "M4shear": if (alike) step = add(d, scale(cross(d, W), q * kappa)); break;
        /* M5 — the OUTCOME is biased: which rule fires depends on the field */
        case "M5select": {
          const bias = kappa * sigma * dot(W, cross(v, d));
          step = alike ? scale(d, 1 + bias) : scale(d, -(1 - bias));
          break;
        }
      }
      F = add(F, scale(step, rate));
    }
  }
  return F;
};

/** how much of a force lies along v and how much across it — the whole diagnostic */
const split = (F: Vec, v: Vec, W: Vec) => {
  const vh = unit(v);
  const lon = dot(F, vh);
  const perp = add(F, scale(vh, -lon));
  const want = cross(v, W);
  /*
   * ALIGNMENT UP TO SIGN, and the modulus is not laziness. Which way round v×W the force
   * points is set by the charge and by the sign of κ, neither of which this table fixes —
   * what it is asking is whether the force lies along that AXIS at all, as against being
   * perpendicular to v in some other plane, which is not a Lorentz force.
   */
  const align = norm(perp) < 1e-14 || norm(want) < 1e-14
    ? NaN
    : Math.abs(dot(unit(perp), unit(want)));
  return { lon: Math.abs(lon), perp: norm(perp), align };
};

/** forty-eight velocity directions, so no row is a statement about one heading */
const PROBES: Vec[] = (() => {
  const out: Vec[] = [], ph = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < 48; i++) {
    const z = 1 - 2 * (i + 0.5) / 48, r = Math.sqrt(Math.max(0, 1 - z * z));
    const t = 2 * Math.PI * i / ph;
    out.push([r * Math.cos(t), r * Math.sin(t), z]);
  }
  return out;
})();

const KAPPA = 0.3, SPEED = 0.3;

export const everyWayAFieldCouldAct = test({
  id: "magnetism/how-a-field-acts",
  claims: "a meeting offers exactly three things a field could touch, and enumerating them " +
    "gives TWO mechanisms with a pure Lorentz force and no longitudinal component — the " +
    "gate, which never touches the step, and the shear, which is the turn without the " +
    "normalisation that was never justified",
  cited: ["acts.ts §1", "acts.ts §2"],
  under: { "gravity": "holds" },
  exact: true,                    // a sum over the exit set at forty-eight headings
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const W: Vec = [0, 0, 1];

    const over = (mech: Mech, gate?: (W: Vec, v: Vec, d: Vec) => number) => {
      let perp = 0, lon = 0, align = 1;
      for (const p of PROBES) {
        const v = scale(unit(p), SPEED);
        const s = split(force(g, mech, +1, v, W, KAPPA, gate), v, W);
        perp = Math.max(perp, s.perp);
        lon = Math.max(lon, s.lon);
        if (!isNaN(s.align)) align = Math.min(align, s.align);
      }
      return { perp, lon, align };
    };

    const MECHS: [Mech, string][] = [
      ["none", "nothing (control)"], ["M1turn", "rotates the step"],
      ["M2gate", "gates the rate"], ["M3drag", "gates, even in d̂"],
      ["M4shear", "shears the step"], ["M5select", "biases the outcome"],
    ];
    const rows = MECHS.map(([m, what]) => ({ m, what, ...over(m) }));
    const by = (m: Mech) => rows.find(r => r.m === m)!;
    const control = by("none"), turn = by("M1turn"), gate = by("M2gate"), shear = by("M4shear");

    /*
     * AND THE SECOND-ORDER LENGTHENING DOES NOT REVIVE THE DRAG, which had to be checked
     * rather than assumed. |d̂ + κ(d̂ × W)|² = 1 + κ²|d̂ × W|², and that correction is EVEN
     * in d̂ while the displacement is odd — so it cancels over the ±d̂ pairs rather than
     * leaving a residue.
     */
    let evenPart: Vec = [0, 0, 0];
    for (let i = 0; i < g.DEG; i++) {
      const d = [0, 1, 2].map(k => g.U[i][k] ?? 0);
      const grow = KAPPA * KAPPA * dot(cross(d, W), cross(d, W));
      evenPart = add(evenPart, scale(d, grow));
    }

    /* §2: the gate sweep */
    const gates = GATES.map(([name, symmetry, fn]) => ({ name, symmetry, ...over("M2gate", fn) }));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "|F| with no mechanism at all", value: control.perp + control.lon,
          expect: {
            of: "0 — the background really is neutral", want: 0, tolerance: 1e-12,
            because: "with no field the alike and opposite sums cancel exactly, so anything the " +
              "rows below report is the mechanism's and not the background's. THE CONTROL THAT " +
              "MAKES THE TABLE READABLE: an electric force here would masquerade as a magnetic " +
              "one at every heading",
          },
        }),
        judge({
          name: "does the TURN have a longitudinal component at all",
          value: turn.lon > 1e-9 ? 1 : 0,
          expect: {
            of: "1 — the bill, arriving from the enumeration", want: 1, tolerance: 0,
            because: "M1 is the arc's own mechanism and the row that carries the storage ring's " +
              "bound. Stated as a verdict because its SIZE is `electrostatics/turn-as-lorentz`'s " +
              "business and not this table's, and because the size MOVES with the geometry — " +
              "the arc quotes 2.17e−3 from cubic 26. What this table settles is which " +
              "mechanisms have a longitudinal component AT ALL, which is a yes-or-no",
          },
          note: `${turn.lon.toExponential(2)} against a transverse ${turn.perp.toExponential(2)}, ` +
            `whose worst alignment with v×W is ${turn.align.toFixed(4)} — SO THE TURN'S ` +
            `TRANSVERSE PART IS NOT PURELY v×W EITHER, by about a percent here, where the gate ` +
            `and the shear are both 1.0000. The same symmetric term that makes the drag also ` +
            `tilts what is left of the Lorentz force out of its plane`,
        }),
        judge({
          name: "worst longitudinal force from the GATE, over 48 headings", value: gate.lon,
          expect: {
            of: "0 — PURE LORENTZ, at machine precision", want: 0, tolerance: 1e-12,
            because: "M2 does not move the structure anywhere new — the displacement is still " +
              "±d̂ and all the field does is make some directions likelier — SO IT CANNOT HAVE " +
              "A SYMMETRIC PART, because it never touches the step. Not a small longitudinal " +
              "force: none, at every velocity direction tried",
          },
          note: `with a transverse ${gate.perp.toExponential(2)}, aligned with v×W to ` +
            `${gate.align.toFixed(12)}`,
        }),
        judge({
          name: "worst longitudinal force from the SHEAR, over 48 headings", value: shear.lon,
          expect: {
            of: "0 — PURE LORENTZ, and this is the row that matters", want: 0, tolerance: 1e-12,
            because: "M4 IS THIS ARC'S OWN MECHANISM WITH ONE ASSUMPTION REMOVED, AND THE " +
              "ASSUMPTION WAS NEVER JUSTIFIED. A rotation moves the displacement sideways by " +
              "sin θ and shortens it along its old direction by (1 − cos θ), because a rotation " +
              "preserves length — and that shortening IS the longitudinal force. Nothing in the " +
              "three rules says a meeting's displacement must still be exactly one cell after " +
              "the field has acted on it. SO THE ARC'S ENTIRE LONGITUDINAL PROBLEM CAME FROM " +
              "NORMALISING, and dropping it costs no new machinery, no new state and no new label",
          },
          note: `with a transverse ${shear.perp.toExponential(2)}`,
        }),
        judge({
          name: "the second-order lengthening summed over the ±d̂ pairs", value: norm(evenPart),
          expect: {
            of: "0 — a cancellation and not a residue", want: 0, tolerance: 1e-12,
            because: "|d̂ + κ(d̂ × W)|² = 1 + κ²|d̂ × W|², so the shear does lengthen the step at " +
              "second order and that could have revived the drag. It does not: the correction " +
              "is EVEN in d̂ while the displacement is ODD, so it cancels over the ±d̂ pairs. " +
              "Checked rather than assumed, because a mechanism rescued by an unexamined " +
              "second order would not be rescued at all",
          },
        }),
        judge({
          name: "alignment of the gate's transverse force with v×W", value: gate.align,
          expect: {
            of: "1 — it is a Lorentz force and not merely a transverse one",
            want: 1, tolerance: 1e-9,
            because: "perpendicular to v is necessary and nowhere near sufficient: a force at " +
              "right angles to the motion in the WRONG plane is not qv×B. This is the row that " +
              "makes 'pure Lorentz' mean the thing it says",
          },
        }),
        judge({
          name: "gates that give a magnetic force, out of the five swept",
          value: gates.filter(x => x.lon < 1e-12 && x.perp > 1e-9 && x.align > 1 - 1e-9).length,
          expect: {
            of: "1 — ONLY THE TRIPLE PRODUCT SURVIVES", want: 1, tolerance: 0,
            because: "and the sweep says why. A gate must be ODD in d̂ or the ±d̂ pairs cancel " +
              "it; it must contain W or it is not magnetic; it must contain v or the force " +
              "cannot know the motion. [W, v, d̂] is the lowest-order scalar meeting all three " +
              "and up to a constant it is the only one — SO GIVEN THAT A FIELD GATES, THE GATE " +
              "IS DETERMINED and the Lorentz force follows rather than being arranged",
          },
        }),
      ],
      table: {
        columns: ["mechanism", "what it changes", "|F⊥|", "worst |F·v̂|", "∥ v×W", "verdict"],
        rows: rows.map(r => [
          r.m === "none" ? "none" : r.m.replace(/^M(\d)/, "M$1 "), r.what,
          r.perp.toExponential(2), r.lon.toExponential(2),
          isNaN(r.align) ? "—" : r.align.toFixed(4),
          r.perp < 1e-12 ? "no force"
            : r.lon < 1e-12 ? "PURE LORENTZ"
              : r.align > 0.9 ? "Lorentz + drag" : "not along v×W",
        ]),
      },
    };
  },
});

export default [everyWayAFieldCouldAct];
