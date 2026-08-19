/**
 * IS A PULSE'S SIGN FIXED WHEN IT LEAVES, OR WHEN IT ARRIVES?
 *
 * That is the question `ordering` closes on, and it is called the cheapest open
 * question in the arc: the arrival reading gives a monopole, so the departure
 * reading is where the pole model is supposed to be rescued.
 *
 * It is not a question. For a straight ray the direction a pulse was emitted
 * INTO is the direction of the observer, so `sgn(n·d̂)` computed at the source
 * and computed at the destination are the same number — not nearly the same,
 * the same, because it is the same d̂ read twice. Measured below over random
 * observers the difference is exactly zero.
 *
 * The two can only come apart where the ray bends, or where the local north
 * varies along the path. Neither happens in the far field of a uniformly
 * ordered lump, which is where the 1/r² was measured.
 *
 * What DOES separate is a third convention the arc already has and did not put
 * here: a sign fixed per EMITTER, the same into every direction, set by where
 * the emitter is in its own cycle. That is `physics.ts`'s non-sided branch —
 * `cos(2πβ)` — and it is the one that gives 1/r³.
 *
 * §3 then asks what the sided tally actually is, since calling it a monopole
 * was too kind: it is not a field at all.
 */

const DIMS = 3;
const DEG = Math.pow(3, DIMS) - 1;

type V = [number, number, number];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** the 26 ways out of a cell */
const WAYS: V[] = (() => {
  const out: V[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) out.push([x, y, z]);
  return out;
})();

/** which of the 26 a continuous direction is nearest to */
const nearestWay = (d: V): V => {
  let best = WAYS[0], bestDot = -2;
  for (const w of WAYS) { const c = dot(unit(w), d); if (c > bestDot) { bestDot = c; best = w; } }
  return best;
};

const sgn = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x > 0 ? 1 : -1);

/** a solid cube of emitters, every one pointed the same way */
const cube = (L: number): V[] => {
  const out: V[] = [];
  const h = (L - 1) / 2;
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < L; k++)
    out.push([i - h, j - h, k - h]);
  return out;
};

const NORTH: V = [0, 0, 1];

/**
 * The three conventions. Each returns the sign one emitter contributes to one
 * observer; the field is the 1/r² sum of them, which is how every other file
 * here reads a far field.
 */
const conventions = {
  /** sign resolved against the axis AT THE DESTINATION — `along()` in physics.ts */
  arrival: (p: V, x: V, s: number) => sgn(dot(NORTH, unit(sub(x, p)))),
  /** sign resolved at the SOURCE, from the direction the pulse was let go into */
  departure: (p: V, x: V, s: number) => sgn(dot(NORTH, unit(sub(x, p)))),
  /** the same, but the emission direction quantised to one of the 26 first */
  quantised: (p: V, x: V, s: number) => sgn(dot(NORTH, nearestWay(unit(sub(x, p))))),
  /** sign fixed per emitter by its own phase, the same into every direction */
  phase: (p: V, x: V, s: number) => s,
};
type Conv = keyof typeof conventions;

/** Σ sign / r² over the body */
const field = (body: V[], signs: number[], x: V, c: Conv) => {
  const f = conventions[c];
  let total = 0;
  for (let i = 0; i < body.length; i++) {
    const r = len(sub(x, body[i]));
    if (r < 1e-9) continue;
    total += f(body[i], x, signs[i]) / (r * r);
  }
  return total;
};

/** slope of log|F| against log r, on the axis */
const exponent = (body: V[], signs: number[], c: Conv, r0 = 200, r1 = 3200) => {
  const xs: number[] = [], ys: number[] = [];
  for (let r = r0; r <= r1; r *= 1.3) {
    const v = Math.abs(field(body, signs, [0, 0, r], c));
    if (v > 0) { xs.push(Math.log(r)); ys.push(Math.log(v)); }
  }
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  return -num / den;
};

// seeded, so the numbers come back the same
let seed = 20260815;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

export function departureReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  const body = cube(4);
  // alternating phases, so `phase` has both signs in it and is not trivially net
  const signs = body.map((_, i) => (i % 2 ? 1 : -1));
  const balanced = signs.reduce((a, b) => a + b, 0);

  line("=".repeat(78));
  line("1. DEPARTURE AND ARRIVAL ARE THE SAME FUNCTION");
  line("=".repeat(78));
  line();
  line("  200 observers at random directions and random distances, both");
  line("  conventions evaluated on the same body.");
  line();

  let worst = 0, worstQ = 0;
  for (let t = 0; t < 200; t++) {
    const th = Math.acos(2 * rnd() - 1), ph = 2 * Math.PI * rnd();
    const r = 50 + 3000 * rnd();
    const x: V = [r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th)];
    const a = field(body, signs, x, "arrival");
    const d = field(body, signs, x, "departure");
    const q = field(body, signs, x, "quantised");
    worst = Math.max(worst, Math.abs(a - d));
    worstQ = Math.max(worstQ, Math.abs(a - q) / (Math.abs(a) || 1));
  }

  line(`     max |arrival − departure|                       ${worst.toExponential(3)}`);
  line(`     max |arrival − quantised| / |arrival|           ${worstQ.toExponential(3)}`);
  line();
  line("  The first is zero and cannot be anything else. A pulse that reaches");
  line("  the observer was emitted into the direction of the observer, so the");
  line("  d̂ the source resolves its sign against IS the d̂ the destination");
  line("  resolves it against. One number, computed in two places.");
  line();
  line("  The second is the only real content in the distinction: rounding the");
  line("  emission direction onto one of the 26 first. That changes the sign");
  line("  only for observers within half a lattice angle of the equator, and");
  line("  it does not move the exponent.");
  line();
  line("     convention                     exponent");
  for (const c of ["arrival", "departure", "quantised", "phase"] as Conv[])
    line(`     ${c.padEnd(28)} ${exponent(body, signs, c).toFixed(3)}`);
  line();
  line(`  (the phase body has net sign ${balanced}, so its 1/r³ is not a`);
  line("  cancellation of a net — there is no net to cancel)");
  line();
  line("  So the arc's cheapest open question is not open and is not a");
  line("  question. Both branches give the same 2.000 because they are one");
  line("  branch, and the quantised reading gives it too. What");
  line("  gives 3.000 is the arc's SECOND emitter, not its fourth: a sign the");
  line("  emitter fixes for itself before it knows who is listening.");
  line();
  line("  The distinction the arc wanted does exist, but not here. Departure");
  line("  and arrival come apart exactly where the ray bends, or where north");
  line("  turns along the path — a magnetic texture, which is what the Layer-2");
  line("  arc's holonomy is about. In the far field of a uniformly ordered");
  line("  lump there is neither.");

  line();
  line("=".repeat(78));
  line("2. AND 'MONOPOLE' WAS TOO KIND — IT IS NOT A FIELD AT ALL");
  line("=".repeat(78));
  line();
  line("  Read the sided tally as a vector field, B = Σ sgn(n·r̂)·r̂/r², and");
  line("  take its flux through spheres. If it were a monopole the flux would");
  line("  be the enclosed charge, the same at every radius.");
  line();
  line("     radius        flux");

  const flux = (R: number) => {
    // Lebedev is overkill; a product grid converges fine for a smooth-in-φ field
    let total = 0;
    const NT = 400, NP = 200;
    for (let i = 0; i < NT; i++) {
      const th = Math.PI * (i + 0.5) / NT, w = Math.sin(th) * (Math.PI / NT) * (2 * Math.PI / NP);
      for (let j = 0; j < NP; j++) {
        const ph = 2 * Math.PI * (j + 0.5) / NP;
        const rhat: V = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
        const x: V = [R * rhat[0], R * rhat[1], R * rhat[2]];
        let br = 0;
        for (const p of body) {
          const d = sub(x, p), r = len(d);
          br += sgn(dot(NORTH, unit(d))) * dot(unit(d), rhat) / (r * r);
        }
        total += br * R * R * w;
      }
    }
    return total;
  };

  for (const R of [200, 400, 800, 1600])
    line(`     ${String(R).padStart(6)}   ${flux(R).toExponential(3)}`);

  line();
  line("  Nought at every radius. There is no monopole; ∇·B = 0 holds");
  line("  observationally. So what is the 1/r²?");
  line();
  line("     θ        r²·F(r=1000)");
  for (const deg of [0, 30, 60, 89, 90, 91, 120, 180]) {
    const th = deg * Math.PI / 180, R = 1000;
    const x: V = [R * Math.sin(th), 0, R * Math.cos(th)];
    line(`     ${String(deg).padStart(3)}°    ${(field(body, signs, x, "arrival") * R * R).toExponential(3)}`);
  }
  line();
  line("  Constant magnitude, flat from the pole to one degree off the equator,");
  line("  a step discontinuity at 90°, and the mirror of itself below. That is");
  line("  sgn(cos θ)/r², and it is impossible for a real field: zero enclosed");
  line("  charge forbids a 1/r² term in any multipole expansion, so the");
  line("  exterior is not source-free. The step at the equator is a source");
  line("  sheet running to infinity.");
  line();
  line("  Σ sgn(n·d̂)/r² IS NOT A FIELD, IT IS A TALLY OF RECEIVED PULSES.");
  line("  Σ s_e/r², with the sign fixed per emitter, IS a field — and that is");
  line("  the real reason the phase route works, rather than anything about");
  line("  where the arithmetic happens to be done.");

  return L.join("\n");
}

console.log(departureReport());
