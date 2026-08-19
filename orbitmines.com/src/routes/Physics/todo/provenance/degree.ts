/**
 * IF THE PARTICLE CHOOSES WHAT IT EMITS — and it buys charge, not spin.
 *
 * `cover` ends by saying the model has exactly one ± quantity and it is spoken
 * for. The obvious next relaxation is to stop deriving the emission from the
 * axis at all: let the particle choose, per direction, WHAT CHARGE it puts
 * there. This file asks what that buys.
 *
 * IT DOES NOT BUY SPIN, AND THE REASON IS ONE LINE. A 2π rotation is the
 * identity on directions, so it is the identity on any FUNCTION of directions —
 * whatever the particle chose. Free choice over a domain the rotation fixes
 * cannot produce something the rotation flips.
 *
 * IT BUYS SOMETHING ELSE, AND IT IS THE THING THE ELECTRIC HALF HAS BEEN STUCK
 * ON SINCE THE BEGINNING. Once what is emitted is a map from directions into an
 * internal space rather than a sign attached to a rate, THE MAP HAS A DEGREE —
 * how many times it wraps the target — and a degree is
 *
 *     an INTEGER                   so charge is quantised, not fitted
 *     independent of the RATE      so it does not scale with mass
 *     conserved under deformation  so it cannot drift
 *
 * which is exactly, precisely, the three things `coulomb` §4 said the model
 * could not have. Its refutation is that emission rate goes as mass, so a
 * proton would carry 1836 times an electron's charge where measurement has them
 * equal to a part in 10²¹. A degree does not care how often the pattern is
 * emitted, so the two come out EXACTLY equal — not to 10⁻²¹, exactly, because
 * integers are exactly equal.
 *
 *   §1  free choice of WHERE, and why it cannot give a spinor
 *   §2  free choice of WHAT, and the degree
 *   §3  which dissolves `coulomb` §4 — charge quantised and mass-independent
 *   §4  and the XOR survives it, as the one-dimensional case of a dot product
 *   §5  but spin still does not come free, and what it would take
 */

const MP_ = 1.67262192369e-27, ME = 9.1093837015e-31;

type V = [number, number, number];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a: V): V => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
const rotZ = (v: V, t: number): V =>
  [Math.cos(t) * v[0] - Math.sin(t) * v[1], Math.sin(t) * v[0] + Math.cos(t) * v[1], v[2]];

/**
 * The degree of a map from directions into an internal sphere: how much of the
 * target it sweeps, over how much there is. An integer for any non-singular map,
 * and this computes it by the integral rather than asserting it.
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

export function whereReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. FREE CHOICE OF WHERE — AND IT CANNOT GIVE A SPINOR");
  line("=".repeat(78));
  line();
  line("  Let the particle put whatever it likes into whatever exit it likes. The");
  line("  emission is then an arbitrary function of DIRECTION, and a 2π rotation");
  line("  is the identity on directions:");
  line();
  const EXITS: V[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) EXITS.push([x, y, z]);
  let worst = 0;
  for (const e of EXITS) {
    const r = rotZ(e, 2 * Math.PI);
    worst = Math.max(worst, Math.hypot(r[0] - e[0], r[1] - e[1], r[2] - e[2]));
  }
  line(`     all ${EXITS.length} exits, rotated by 2π: largest displacement ${worst.toExponential(1)}`);
  line();
  line("  SO IT IS THE IDENTITY ON ANY FUNCTION OF THEM, however freely chosen.");
  line("  Free choice over a domain the rotation fixes cannot produce something");
  line("  the rotation flips — which settles the question before any pattern is");
  line("  written down. A spinor needs the half-angle:");
  line();
  line("     χ(θ) = [cos(θ/2), sin(θ/2)]        θ = 0    [ 1.0000, 0.0000]");
  line("                                        θ = 2π   [−1.0000, 0.0000]");
  line("                                        θ = 4π   [ 1.0000, 0.0000]");
  line();
  line("  and nothing that is a function of direction alone has it.");

  return out.join("\n");
}

export function degreeReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. FREE CHOICE OF WHAT CHARGE — AND THE MAP HAS A DEGREE");
  line("=".repeat(78));
  line();
  line("  The second half of the relaxation is the interesting one. If the charge");
  line("  a particle puts into a direction is its own to choose, then what it");
  line("  emits is a MAP from directions into whatever the charge lives in — and");
  line("  a map between spheres has a degree, which is how many times it wraps.");
  line();
  line("     pattern                              degree");
  const tests: [string, (d: V) => V][] = [
    ["identity   s = d", d => d],
    ["antipodal  s = −d", d => [-d[0], -d[1], -d[2]]],
    ["constant   s = ẑ", _ => [0, 0, 1]],
    ["rotated by 0.7 rad", d => rotZ(d, 0.7)],
    ["rotated by 2π", d => rotZ(d, 2 * Math.PI)],
    ["double azimuth", d => {
      const t = Math.acos(Math.max(-1, Math.min(1, d[2]))), p = Math.atan2(d[1], d[0]);
      return nrm([Math.sin(t) * Math.cos(2 * p), Math.sin(t) * Math.sin(2 * p), Math.cos(t)]);
    }],
  ];
  for (const [n, f] of tests) line(`     ${n.padEnd(36)}${degree(f).toFixed(4).padStart(8)}`);
  line();
  line("  INTEGERS, computed by the integral rather than asserted. And the degree");
  line("  is blind to how often the pattern is emitted — it is a property of the");
  line("  pattern and the rate does not appear in it anywhere.");
  line();
  line("  It is also STABLE. Deform the pattern continuously and it does not");
  line("  drift; it can only jump where the map degenerates:");
  line();
  line("     deformation  s = normalise(d + t·ẑ)      degree");
  for (const t of [0, 0.5, 0.9, 1.0, 1.5, 3.0])
    line(`     t = ${t.toFixed(1)}                                 ${degree(d => nrm([d[0], d[1], d[2] + t])).toFixed(4).padStart(8)}`);
  line();
  line("  Flat at 1 up to t = 0.9, then jumps. AND THE JUMP IS AT t = 1, which is");
  line("  exactly where d + ẑ vanishes at the south pole and the map stops being a");
  line("  map at all. A degree is a count, so it is quantised, and it changes only");
  line("  when the thing it counts is destroyed.");

  return out.join("\n");
}

export function coulombReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. WHICH DISSOLVES `coulomb` §4 — THE ELECTRIC HALF'S OLDEST REFUTATION");
  line("=".repeat(78));
  line();
  line("  The refutation, which the book has carried since the beginning:");
  line();
  line("     emission rate goes as MASS, so if charge were the signed emission");
  line(`     rate a proton would carry ${(MP_ / ME).toFixed(0)} times an electron's — where`);
  line("     measurement has them equal to one part in 10²¹.");
  line();
  line("     reading            electron        proton          ratio");
  line(`     rate-based         rate 1          rate ${(MP_ / ME).toFixed(0)}       ${(MP_ / ME).toFixed(0)}  ✗`);
  line("     degree-based       degree −1       degree +1       1  EXACTLY");
  line();
  line("  AND 'EXACTLY' IS MEANT LITERALLY. The rate-based reading could at best");
  line("  be tuned to agree to some number of decimals; a degree is an integer, so");
  line("  two particles with degrees ±1 have charges of equal magnitude with no");
  line("  error term at all. The measurement is a bound of 10⁻²¹ and the model");
  line("  would say zero.");
  line();
  line("  THREE THINGS COME OUT OF ONE CHANGE:");
  line();
  line("     charge is QUANTISED           because a degree is an integer, and");
  line("                                   nothing else in this book explains why");
  line("                                   charge comes in units");
  line("     charge is MASS-INDEPENDENT    because a degree does not know the rate");
  line("     charge is CONSERVED           because a degree cannot change without");
  line("                                   the pattern being torn");
  line();
  line("  None of those was reachable while the emission was derived from a rate.");
  line();
  line("  AND THIS IS NOT THE ONLY ROUTE TO IT, which is the more interesting");
  line("  fact. The article's later Layer-2 arc reaches the same place by a");
  line("  different structure — charge as a NET TRAVERSAL SENSE around the ring,");
  line("  also an integer, also blind to the rate. Both are WINDING NUMBERS, one");
  line("  of a strand around a ring and one of an emission map over directions.");
  line("  Two independent constructions landing on the same kind of object is");
  line("  worth more than either of them alone.");
  line();
  line("  AND THE TRAVERSAL READING IS THE BETTER ONE, on locality: a strand's");
  line("  traversal sense is something one strand does in one place, where a");
  line("  degree is an integral over all directions. See §5. What this file adds");
  line("  is not a better charge — it is the two negative results.");

  return out.join("\n");
}

export function xorReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. AND THE XOR SURVIVES IT — AS THE ONE-DIMENSIONAL CASE");
  line("=".repeat(78));
  line();
  line("  Worth checking, because the XOR is what everything else in the book is");
  line("  built on and a richer charge could easily break it. It does not.");
  line();
  line("  The rule is: opposite charges annihilate, alike ones turn. With charges");
  line("  as internal directions that reads 'antipodal annihilates, parallel");
  line("  turns' — which is the sign of a DOT PRODUCT, and the ±1 case is the");
  line("  dot product in one dimension:");
  line();
  line("     u_a        u_b        u_a·u_b     outcome");
  const cases: [string, V, string, V][] = [
    ["+ẑ", [0, 0, 1], "+ẑ", [0, 0, 1]],
    ["+ẑ", [0, 0, 1], "−ẑ", [0, 0, -1]],
    ["+ẑ", [0, 0, 1], "+x̂", [1, 0, 0]],
    ["+ẑ", [0, 0, 1], "60°", [0, Math.sin(Math.PI / 3), Math.cos(Math.PI / 3)]],
  ];
  for (const [na, a, nb, b] of cases) {
    const d = dot(a, b);
    line(`     ${na.padEnd(10)}${nb.padEnd(10)}${d.toFixed(4).padStart(8)}     ` +
      (d > 0.99 ? "alike — turns" : d < -0.99 ? "opposite — ANNIHILATES" : "partial"));
  }
  line();
  line("  The two ends reproduce the XOR exactly and the middle is new — a partial");
  line("  annihilation, which is what the continuous model already needed and");
  line("  which the article already describes: 'a polarity is a field value");
  line("  rounded off to its sign'. So the generalisation was half-written.");
  line();
  line("  AND THE LEDGER IS UNCHANGED IN FORM. −s_a·s_b becomes −u_a·u_b, still");
  line("  bilinear, still a product, so every result built on it — the 1/R kernel,");
  line("  the dipole scalar, the force and the torque, magnetostatics entire —");
  line("  goes through with a dot product where a sign used to be.");

  return out.join("\n");
}

export function stillReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. AND SPIN STILL DOES NOT COME FREE");
  line("=".repeat(78));
  line();
  line("  The tempting next step is that a topological charge might carry a");
  line("  topological spin with it — which is a real mechanism in physics, and it");
  line("  is not available here for a reason worth measuring rather than asserting.");
  line();
  line("  Rotate a WHOLE configuration by t: s_t(d) = R_t·s(R_t⁻¹d). That traces a");
  line("  loop in the space of patterns as t runs 0 → 2π. If the loop can be");
  line("  shrunk to a point the object is a boson; a fermion needs it not to be.");
  line();
  line("  How far each pattern moves along that loop:");
  const sample: V[] = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 24; j++) {
    const th = Math.PI * (i + 0.5) / 12, ph = 2 * Math.PI * (j + 0.5) / 24;
    sample.push([Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]);
  }
  line();
  line("     pattern              t = π/2    t = π     t = 2π");
  for (const [n, s] of [
    ["hedgehog s = d", (d: V) => d],
    ["constant s = ẑ", (_: V) => [0, 0, 1] as V],
    ["tilted   s = n(d+ẑ)", (d: V) => nrm([d[0], d[1], d[2] + 1])],
  ] as [string, (d: V) => V][]) {
    const dev = (t: number) => Math.max(...sample.map(d => {
      const a = s(d), b = rotZ(s(rotZ(d, -t)), t);
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    }));
    line(`     ${n.padEnd(21)}${dev(Math.PI / 2).toExponential(1).padStart(8)}` +
      `${dev(Math.PI).toExponential(1).padStart(10)}${dev(2 * Math.PI).toExponential(1).padStart(10)}`);
  }
  line();
  line("  ALL OF THEM ARE ROTATION-INVARIANT, so the loop is the CONSTANT loop —");
  line("  contractible without argument, hence a boson. The degree gives charge");
  line("  and gives nothing at all about statistics.");
  line();
  line("  WHY, IN ONE SENTENCE: the configuration space of maps into a sphere does");
  line("  not have the fundamental group a fermion needs. The known way to get one");
  line("  is to make the target bigger — maps into SU(2) rather than into a");
  line("  direction, which is the Skyrme construction, and there the 2π loop is");
  line("  famously not contractible. That is a much larger relaxation than letting");
  line("  a particle choose a charge, and this file does not take it.");
  line();
  line("  AND THE COST OF WHAT IT DOES TAKE, which should be booked. A degree is");
  line("  an INTEGRAL OVER ALL DIRECTIONS, so charge stops being carried by any");
  line("  individual ray and becomes a property of the whole emission pattern.");
  line("  Everything else in this book is local — a force is a fact about where");
  line("  two charges met — and a charge that only exists when you look at every");
  line("  direction at once is a different kind of object. THE ELECTRIC HALF WOULD");
  line("  GAIN QUANTISATION AND LOSE LOCALITY, and whether that trade is payable");
  line("  is exactly the question this opens.");
  line();
  line("  SO THE STATE OF IT:");
  line();
  line("     BUYS       charge quantised, mass-independent and conserved — the");
  line("                three things `coulomb` §4 said were unreachable.");
  line("     KEEPS      the XOR, as the one-dimensional case of a dot product,");
  line("                and everything built on it.");
  line("     DOES NOT   give spin. A 2π rotation is the identity on directions,");
  line("     BUY        so no choice of what to emit into them can flip anything.");
  line("     COSTS      locality of charge, which is not a small thing to owe.");

  return out.join("\n");
}

console.log(whereReport());
console.log(degreeReport());
console.log(coulombReport());
console.log(xorReport());
console.log(stillReport());
