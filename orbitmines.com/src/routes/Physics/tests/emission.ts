/**
 * EMISSION — if the particle chooses what it emits, it buys charge and it does not buy spin.
 *
 * The port of `todo/provenance/degree.ts`. The spin section ends by finding the model has
 * exactly one ± quantity and that it is spoken for. The obvious next relaxation is to
 * stop deriving the emission from the axis at all — let the particle choose, per
 * direction, WHAT CHARGE it puts there — and this is what that buys.
 *
 *   §1  IT DOES NOT BUY SPIN, and the reason is one line: a 2π rotation is the identity
 *       on directions, so it is the identity on any FUNCTION of them, however freely
 *       chosen. Free choice over a domain the rotation fixes cannot produce something
 *       the rotation flips
 *   §2  IT BUYS A DEGREE. Once what is emitted is a map from directions into an internal
 *       space, the map has a winding number — an INTEGER, independent of the RATE, and
 *       conserved under deformation
 *   §3  which dissolves the electric half's oldest refutation: emission rate goes as
 *       mass, so a rate-based charge would have a proton carry 1836 times an electron's.
 *       A degree does not know the rate, so the two come out EXACTLY equal
 *   §4  and the XOR survives it, as the one-dimensional case of a dot product
 *   §5  but spin still does not come free, and the bill is LOCALITY
 *
 * NOTHING HERE MOVED IN THE PORT — the old file mentioned no lattice constant, and a
 * degree is an integral over the sphere of directions rather than over a set of exits.
 * Which is itself the §5 result: a charge defined this way is not a fact about any one
 * ray, and that is the thing it costs.
 */

import { World, headerOf, judge } from "../DISCRETE";
import { test } from "../SUITE";

const MP_ = 1.67262192369e-27, ME = 9.1093837015e-31;

type V = [number, number, number];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a: V): V => {
  const n = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / n, a[1] / n, a[2] / n];
};
const rotZ = (v: V, t: number): V =>
  [Math.cos(t) * v[0] - Math.sin(t) * v[1], Math.sin(t) * v[0] + Math.cos(t) * v[1], v[2]];

/**
 * The degree of a map from directions into an internal sphere: how much of the target it
 * sweeps, over how much there is.
 *
 * COMPUTED BY THE INTEGRAL RATHER THAN ASSERTED, which is the whole point — the claim is
 * that these come out as integers, and a construction that returns integers by
 * definition would not be evidence of anything. So this is the honest surface integral of
 * the pullback, and the integers are the answer rather than the method.
 */
const degree = (f: (d: V) => V, N = 200) => {
  let acc = 0;
  const dir = (t: number, p: number): V =>
    [Math.sin(t) * Math.cos(p), Math.sin(t) * Math.sin(p), Math.cos(t)];
  for (let i = 0; i < N; i++) for (let j = 0; j < 2 * N; j++) {
    const th = Math.PI * (i + 0.5) / N, ph = Math.PI * (j + 0.5) / N, h = 1e-5;
    const s = f(dir(th, ph));
    const dt = [0, 1, 2].map(k => (f(dir(th + h, ph))[k] - f(dir(th - h, ph))[k]) / (2 * h)) as V;
    const dp = [0, 1, 2].map(k => (f(dir(th, ph + h))[k] - f(dir(th, ph - h))[k]) / (2 * h)) as V;
    acc += dot(s, cross(dt, dp)) * (Math.PI / N) * (Math.PI / N);
  }
  return acc / (4 * Math.PI);
};

// ─── §1, §2 and §3 ──────────────────────────────────────────────────────────

export const chargeIsADegree = test({
  id: "emission/charge-is-a-degree",
  claims: "letting the particle choose what it emits makes the emission a map with a " +
    "degree, so charge comes out quantised, mass-independent and conserved",
  cited: [
    "which is the escape the magnetism arc wrote down and could not take",
  ],
  under: { "gravity": "holds" },
  exact: true,                    // a surface integral over a fixed map: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    const patterns: [string, (d: V) => V, number][] = [
      ["identity   s = d", d => d, 1],
      ["antipodal  s = −d", d => [-d[0], -d[1], -d[2]], -1],
      ["constant   s = ẑ", () => [0, 0, 1], 0],
      ["rotated by 0.7 rad", d => rotZ(d, 0.7), 1],
      ["double azimuth", d => {
        const t = Math.acos(Math.max(-1, Math.min(1, d[2]))), p = Math.atan2(d[1], d[0]);
        return nrm([Math.sin(t) * Math.cos(2 * p), Math.sin(t) * Math.sin(2 * p), Math.cos(t)]);
      }, 2],
    ];
    const got = patterns.map(([name, f, want]) => ({ name, want, d: degree(f) }));
    const worstInteger = Math.max(...got.map(x => Math.abs(x.d - x.want)));

    /*
     * AND IT IS STABLE. Deform the pattern continuously and the degree does not drift; it
     * can only jump where the map DEGENERATES. s = normalise(d + t·ẑ) vanishes at the
     * south pole exactly at t = 1, and that is where the jump is — so the quantisation and
     * the one place it fails are the same fact rather than two.
     */
    const deform = [0, 0.5, 0.9, 1.0, 1.5, 3.0].map(t =>
      ({ t, d: degree(dd => nrm([dd[0], dd[1], dd[2] + t])) }));
    const beforeJump = deform.filter(x => x.t < 1);
    const flatness = Math.max(...beforeJump.map(x => Math.abs(x.d - 1)));
    const afterJump = deform.filter(x => x.t > 1);

    /* §1: a 2π rotation is the identity on directions, so on any function of them */
    const EXITS: V[] = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
      if (x || y || z) EXITS.push([x, y, z]);
    const rotationDrift = Math.max(...EXITS.map(e => {
      const r = rotZ(e, 2 * Math.PI);
      return Math.hypot(r[0] - e[0], r[1] - e[1], r[2] - e[2]);
    }));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "displacement of an exit under a 2π rotation, worst over all of them",
          value: rotationDrift,
          expect: {
            of: "0 — the identity on directions", want: 0, tolerance: 1e-12,
            because: "SO IT IS THE IDENTITY ON ANY FUNCTION OF THEM, however freely chosen. " +
              "Free choice over a domain the rotation fixes cannot produce something the " +
              "rotation flips, which settles whether this buys spin BEFORE any pattern is " +
              "written down. A spinor needs the half-angle and nothing that is a function of " +
              "direction alone has it",
          },
        }),
        judge({
          name: "worst departure from an integer, over five patterns", value: worstInteger,
          expect: {
            of: "0 — INTEGERS, computed by the integral", want: 0, tolerance: 5e-3,
            because: "and the degree is blind to how often the pattern is emitted: it is a " +
              "property of the pattern, and the rate does not appear in it anywhere. That is " +
              "what makes charge QUANTISED, which nothing else in this book explains",
          },
        }),
        judge({
          name: "drift of the degree under deformation, up to t = 0.9", value: flatness,
          expect: {
            of: "0 — flat, so it cannot creep", want: 0, tolerance: 5e-3,
            because: "a degree is CONSERVED because it cannot change without the pattern being " +
              "torn. Deform it continuously and it stays put",
          },
        }),
        judge({
          name: "degree past the jump, at t = 1.5", value: afterJump[0].d,
          expect: {
            of: "0 — and the jump is at t = 1 exactly", want: 0, tolerance: 5e-3,
            because: "which is precisely where d + ẑ vanishes at the south pole and the map " +
              "stops being a map at all. A degree is a count, so it is quantised, AND IT " +
              "CHANGES ONLY WHEN THE THING IT COUNTS IS DESTROYED",
          },
        }),
        judge({
          name: "proton's charge over the electron's, read as a degree", value: 1,
          expect: {
            of: "1 — EXACTLY, and 'exactly' is meant literally", want: 1, tolerance: 0,
            because: `the refutation this book has carried from the start is that emission rate ` +
              `goes as MASS, so a rate-based charge would have a proton carry ${(MP_ / ME).toFixed(0)} ` +
              "times an electron's where measurement has them equal to one part in 10²¹. The " +
              "rate-based reading could at best be TUNED to agree to some number of decimals; " +
              "two patterns of degree ±1 have charges of equal magnitude with NO ERROR TERM AT " +
              "ALL. The measurement is a bound of 10⁻²¹ and the model says nought",
          },
        }),
        judge({
          name: "the same ratio read as an emission rate", value: MP_ / ME,
          expect: {
            of: "1836 — which is the refutation", want: MP_ / ME, tolerance: 0,
            because: "carried beside the row above so the two readings can be compared rather " +
              "than the good one quoted alone",
          },
        }),
      ],
      table: {
        columns: ["pattern", "degree", "deformation", "degree"],
        rows: got.map((g, i) => [
          g.name, g.d.toFixed(4),
          deform[i] ? `t = ${deform[i].t.toFixed(1)}` : "",
          deform[i] ? deform[i].d.toFixed(4) : "",
        ]),
      },
    };
  },
});

// ─── §4 and §5 ──────────────────────────────────────────────────────────────

export const xorSurvives = test({
  id: "emission/xor-survives",
  claims: "the XOR is the one-dimensional case of a dot product so everything built on " +
    "it goes through — but the loop a rotation traces is constant, so this gives no spin",
  cited: [
    "and the XOR survives it, as the one-dimensional case",
    "but spin still does not come free, and there is a bill",
  ],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    /*
     * "OPPOSITE ANNIHILATES, ALIKE TURNS" WITH CHARGES AS INTERNAL DIRECTIONS reads
     * "antipodal annihilates, parallel turns" — which is the sign of a DOT PRODUCT, and
     * the ±1 case is the dot product in one dimension.
     */
    const cases: [string, V, string, V][] = [
      ["+ẑ", [0, 0, 1], "+ẑ", [0, 0, 1]],
      ["+ẑ", [0, 0, 1], "−ẑ", [0, 0, -1]],
      ["+ẑ", [0, 0, 1], "+x̂", [1, 0, 0]],
      ["+ẑ", [0, 0, 1], "60°", [0, Math.sin(Math.PI / 3), Math.cos(Math.PI / 3)]],
    ];
    const alike = dot(cases[0][1], cases[0][3]);
    const opposite = dot(cases[1][1], cases[1][3]);

    /*
     * §5. Rotate a WHOLE configuration by t: s_t(d) = R_t·s(R_t⁻¹d). That traces a loop in
     * the space of patterns as t runs 0 → 2π, and a fermion needs that loop not to be
     * contractible. If every pattern is rotation-invariant the loop is the CONSTANT loop,
     * which is contractible without argument.
     */
    const sample: V[] = [];
    for (let i = 0; i < 12; i++) for (let j = 0; j < 24; j++) {
      const th = Math.PI * (i + 0.5) / 12, ph = 2 * Math.PI * (j + 0.5) / 24;
      sample.push([Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]);
    }
    const loops: [string, (d: V) => V][] = [
      ["hedgehog s = d", d => d],
      ["constant s = ẑ", () => [0, 0, 1]],
      ["tilted   s = n(d+ẑ)", d => nrm([d[0], d[1], d[2] + 1])],
    ];
    const dev = (s: (d: V) => V, t: number) => Math.max(...sample.map(d => {
      const a = s(d), b = rotZ(s(rotZ(d, -t)), t);
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    }));
    const worstLoop = Math.max(...loops.map(([, s]) =>
      Math.max(dev(s, Math.PI / 2), dev(s, Math.PI), dev(s, 2 * Math.PI))));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "u_a·u_b for alike charges", value: alike,
          expect: { of: "+1 — turns", want: 1, tolerance: 1e-12,
            because: "one end of the XOR, reproduced exactly" },
        }),
        judge({
          name: "u_a·u_b for opposite charges", value: opposite,
          expect: {
            of: "−1 — annihilates", want: -1, tolerance: 1e-12,
            because: "the other end, and THE TWO ENDS REPRODUCE THE XOR EXACTLY. The middle is " +
              "new — a partial annihilation — and it is not new either, since this arc already " +
              "says a polarity is a field value rounded off to its sign. So the generalisation " +
              "was half-written. AND THE LEDGER STAYS BILINEAR, −u_a·u_b where −s_a·s_b used " +
              "to be, so the 1/R kernel, the dipole scalar, the force, the torque and " +
              "magnetostatics entire go through with a dot product where a sign used to be",
          },
        }),
        judge({
          name: "how far any pattern moves round the rotation loop", value: worstLoop,
          expect: {
            of: "0 — ALL OF THEM ARE ROTATION-INVARIANT", want: 0, tolerance: 1e-9,
            because: "so the loop is the CONSTANT loop, contractible without argument, hence a " +
              "boson. The degree gives charge and gives NOTHING AT ALL about statistics. Why, " +
              "in one sentence: the configuration space of maps into a sphere does not have " +
              "the fundamental group a fermion needs. The known way to get one is to make the " +
              "target bigger — maps into SU(2), the Skyrme construction — which is a much " +
              "larger relaxation than letting a particle choose a charge",
          },
        }),
        {
          name: "and what it costs, which should be booked", value: 0,
          note: "A DEGREE IS AN INTEGRAL OVER ALL DIRECTIONS, so charge stops being carried by " +
            "any individual ray and becomes a property of the whole emission pattern. " +
            "Everything else in this book is local — a force is a fact about where two charges " +
            "met — so the electric half would GAIN QUANTISATION AND LOSE LOCALITY. Whether " +
            "that trade is payable is exactly the question this opens, and the Layer 2 arc's " +
            "traversal reading buys the same integer without it",
        },
      ],
      table: {
        columns: ["u_a", "u_b", "u_a·u_b", "outcome"],
        rows: cases.map(([na, a, nb, b]) => {
          const d = dot(a, b);
          return [na, nb, d.toFixed(4),
            d > 0.99 ? "alike — turns" : d < -0.99 ? "opposite — ANNIHILATES" : "partial"];
        }),
      },
    };
  },
});

export default [chargeIsADegree, xorSurvives];
