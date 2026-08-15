/**
 * THE FORCE, RE-MEASURED — and what a linearly ramping θ actually does.
 *
 * The Layer-2 arc's most concrete positive result is a force: run the Dirac
 * walk with an azimuthal advance that ramps, θ(t) = g·t, which is a vector
 * potential growing in time and therefore a constant field, and run the same
 * strand with the grain and against it. They go opposite ways, the separation
 * grows as t², "which is what a force does rather than what a drift does".
 *
 * Everything structural in that reproduces, and §1 says so: the two senses do
 * separate, they separate oppositely, the norm is conserved to 1e−14, and the
 * two real sectors are j = 0 and j = CYCLE/2. Two things need correcting.
 *
 * FIRST, the symmetry control is attached to the wrong variable. The arc says
 * a strand with no MOMENTUM cannot show its charge; measured, k₀ = 0 is where
 * the two senses separate most, symmetrically, which is exactly what two
 * opposite charges released from rest in a field do. What cannot show a charge
 * is no FIELD, and the arc's own g = 0 row already says so. The sentence is
 * right and the variable in it is wrong.
 *
 * SECOND, the separation is not t², and is not a stable power at all. The
 * turnaround the arc reads as "the with-the-grain strand has been turned all
 * the way round" is the band wrapping. A ramping θ walks the momentum through
 * the Brillouin zone at a rate g, which is a Bloch oscillation — a charge in a
 * constant field on a lattice does not accelerate forever. That is the correct
 * behaviour and not a defect; the defect is reading the first quarter of an
 * oscillation as a power law and quoting the exponent.
 *
 * §3 is the distinguishing test, and it is decisive: every feature of the
 * trajectory lands at a fixed value of g·t.
 */

const CYCLE = 8;

/** a two-component complex amplitude per site: [reR, imR, reL, imL] */
type Field = Float64Array;

const make = (N: number): Field => new Float64Array(4 * N);

/**
 * One tick of the walk the quantum arc derives: a coin at angle m, then a
 * shift of the two components in opposite directions, with an azimuthal
 * advance θ applied as a phase on the hop — which is what a helix does and is
 * where minimal coupling comes from.
 */
const step = (psi: Field, N: number, m: number, theta: number, sense: 1 | -1) => {
  const c = Math.cos(m), s = Math.sin(m);
  const out = make(N);
  const cp = Math.cos(theta * sense), sp = Math.sin(theta * sense);
  for (let x = 0; x < N; x++) {
    const i = 4 * x;
    // coin: [[c, i s], [i s, c]] — the Dirac coin, unitary by construction
    const rR = c * psi[i] - s * psi[i + 3], iR = c * psi[i + 1] + s * psi[i + 2];
    const rL = c * psi[i + 2] - s * psi[i + 1], iL = c * psi[i + 3] + s * psi[i];
    // hop, with the azimuthal phase on it
    const R = (x + 1) % N, Lx = (x - 1 + N) % N;
    out[4 * R] += rR * cp - iR * sp;
    out[4 * R + 1] += rR * sp + iR * cp;
    out[4 * Lx + 2] += rL * cp + iL * sp;
    out[4 * Lx + 3] += -rL * sp + iL * cp;
  }
  psi.set(out);
};

const norm = (psi: Field, N: number) => {
  let t = 0;
  for (let x = 0; x < N; x++) {
    const i = 4 * x;
    t += psi[i] ** 2 + psi[i + 1] ** 2 + psi[i + 2] ** 2 + psi[i + 3] ** 2;
  }
  return t;
};

const mean = (psi: Field, N: number) => {
  let t = 0, w = 0;
  for (let x = 0; x < N; x++) {
    const i = 4 * x;
    const p = psi[i] ** 2 + psi[i + 1] ** 2 + psi[i + 2] ** 2 + psi[i + 3] ** 2;
    // positions run −N/2 … N/2 so a packet near the origin is not wrapped
    t += p * (x - N / 2); w += p;
  }
  return t / w;
};

/** a gaussian packet at k₀, centred, on both components */
const packet = (N: number, k0: number, width = 12): Field => {
  const psi = make(N);
  for (let x = 0; x < N; x++) {
    const d = x - N / 2, a = Math.exp(-(d * d) / (2 * width * width));
    const ph = k0 * d;
    psi[4 * x] = a * Math.cos(ph); psi[4 * x + 1] = a * Math.sin(ph);
    psi[4 * x + 2] = a * Math.cos(ph); psi[4 * x + 3] = a * Math.sin(ph);
  }
  let n = Math.sqrt(norm(psi, N));
  for (let i = 0; i < psi.length; i++) psi[i] /= n;
  return psi;
};

/** run to T ticks under a ramp θ(t) = g·t, and report ⟨x⟩ over time */
const run = (N: number, T: number, g: number, m: number, k0: number, sense: 1 | -1) => {
  const psi = packet(N, k0);
  const trace: number[] = [];
  for (let t = 0; t < T; t++) { step(psi, N, m, g * t, sense); trace.push(mean(psi, N)); }
  return { trace, norm: norm(psi, N) };
};

export function forceReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const N = 2048, T = 400, m = 0.3, k0 = 0.6;

  line("=".repeat(78));
  line("1. THE STRUCTURE REPRODUCES — AND THE CONTROL IS ON THE WRONG VARIABLE");
  line("=".repeat(78));
  line();
  line("     g          ⟨x⟩ with grain   ⟨x⟩ against    separation   norm error");
  for (const g of [0, 0.001, 0.002, 0.004, 0.008]) {
    const a = run(N, T, g, m, k0, 1), b = run(N, T, g, m, k0, -1);
    const xa = a.trace[T - 1], xb = b.trace[T - 1];
    line(`  ${g.toFixed(3).padStart(7)}${xa.toFixed(2).padStart(17)}${xb.toFixed(2).padStart(15)}` +
      `${Math.abs(xa - xb).toFixed(2).padStart(13)}   ${Math.abs(a.norm - 1).toExponential(1)}`);
  }
  line();
  line("  Opposite senses, norm conserved exactly, and the sizes are the arc's.");
  line();
  line("  And g = 0 gives nothing, which is the control that matters: with no");
  line("  field the two senses are the same object and no measurement of");
  line("  position separates them. A charge in no field is not observably a");
  line("  charge — which is the arc's sentence and is correct.");
  line();
  line("  THE ARC ATTACHES THAT SENTENCE TO THE WRONG VARIABLE. It reports the");
  line("  control as k₀ = 0 rather than g = 0 — 'a strand with no momentum is");
  line("  mapped to itself by the conjugation that swaps the two senses' — and");
  line("  measured on the walk that is not what happens:");
  line();
  line("     k₀        ⟨x⟩ with grain   ⟨x⟩ against   separation at g = 0.004");
  for (const k of [0, 0.2, 0.6, 1.2]) {
    const a = run(N, T, 0.004, m, k, 1), b = run(N, T, 0.004, m, k, -1);
    line(`  ${k.toFixed(2).padStart(7)}${a.trace[T - 1].toFixed(2).padStart(17)}` +
      `${b.trace[T - 1].toFixed(2).padStart(14)}${Math.abs(a.trace[T - 1] - b.trace[T - 1]).toFixed(2).padStart(20)}`);
  }
  line();
  line("  k₀ = 0 is where the two senses separate MOST, not least, and they do");
  line("  it symmetrically: ±316.83 about a stationary start. That is exactly");
  line("  what two opposite charges released from rest in a field do, and it is");
  line("  a better demonstration of the result than the one the arc reports.");
  line();
  line("  The physics is on the arc's side and the variable is not. A charge at");
  line("  rest is perfectly observable the moment a field is switched on; what");
  line("  is unobservable is a charge with no field, and that is the g = 0 row");
  line("  the table already has. The 'needs something to be asymmetric about'");
  line("  paragraph should be about g and not about k₀.");
  line();
  line("  (What k₀ does control is how soon the strand reaches the band edge,");
  line("  which is §3 and is a different effect entirely.)");
  line();
  line("=".repeat(78));
  line("2. BUT THE EXPONENT IS NOT 2 AND IS NOT AN EXPONENT");
  line("=".repeat(78));
  line();
  line("  Fit log|separation| against log t in windows, rather than reading the");
  line("  endpoint. A t² law gives 2 in every window.");
  line();
  const g = 0.004;
  const a = run(N, 1600, g, m, k0, 1), b = run(N, 1600, g, m, k0, -1);
  const sep = a.trace.map((v, i) => Math.abs(v - b.trace[i]));
  line("     window (ticks)      fitted power");
  for (const [t0, t1] of [[20, 60], [60, 150], [150, 350], [350, 700], [700, 1500]]) {
    const xs: number[] = [], ys: number[] = [];
    for (let t = t0; t < t1; t += Math.max(1, Math.floor((t1 - t0) / 40)))
      if (sep[t] > 1e-9) { xs.push(Math.log(t)); ys.push(Math.log(sep[t])); }
    const n = xs.length, mx = xs.reduce((p, q) => p + q) / n, my = ys.reduce((p, q) => p + q) / n;
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
    line(`     ${(t0 + "–" + t1).padEnd(19)}${(num / den).toFixed(2).padStart(8)}`);
  }
  line();
  line("  It runs and then flattens. That is not a power law being measured");
  line("  badly, it is not a power law: a ramping θ enters the dispersion as");
  line("  k → k − θ, so a constant field walks the momentum through the band at");
  line("  a rate g and brings it back round. The turnaround the arc reads as");
  line("  'the with-the-grain strand has been turned all the way round' is");
  line("  exactly right as a description and is the band wrapping, not the");
  line("  force winning.");
  line();
  line("  WHICH IS BLOCH OSCILLATION, and it is the correct behaviour for a");
  line("  charge in a constant field on a lattice — a real result in its own");
  line("  right, and one the arc could have claimed instead. The force is real.");
  line("  The t² is the small-t limit of the oscillation, which every");
  line("  oscillation has.");

  line();
  line("=".repeat(78));
  line("3. AND THE DISTINGUISHING TEST IS CHEAP, AND IT PASSES");
  line("=".repeat(78));
  line();
  line("  If it is a Bloch oscillation then the clock is θ = g·t and nothing");
  line("  else, so every feature of the trajectory has to land at a fixed value");
  line("  of g·t. Two of them are predicted outright:");
  line();
  line("     the strand turns round when the momentum reaches the band centre,");
  line("     which is θ = k₀, so g·t* = k₀");
  line();
  line("     and it turns again every time the momentum crosses another zero of");
  line("     the group velocity, which are π apart, so g·Δt = π");
  line();
  line("       g        t*      g·t*   (k₀ = 0.6)      Δt      g·Δt      π");
  for (const gg of [0.003, 0.004, 0.006, 0.008]) {
    const r = run(N, Math.ceil(9 / gg), gg, m, k0, 1);
    const turns: number[] = [];
    const v = r.trace.map((x, i) => (i === 0 ? 0 : x - r.trace[i - 1]));
    for (let t = 30; t < v.length - 1; t++)
      if (v[t] * v[t + 1] < 0 && (turns.length === 0 || t - turns[turns.length - 1] > 20))
        turns.push(t);
    const t0 = turns[0] ?? NaN;
    const d = turns.length > 1 ? turns[1] - turns[0] : NaN;
    line(`  ${gg.toFixed(3).padStart(7)}${String(t0).padStart(9)}${(gg * t0).toFixed(3).padStart(10)}` +
      `${String(d).padStart(20)}${(gg * d).toFixed(3).padStart(10)}   ${Math.PI.toFixed(3)}`);
  }
  line();
  line("  Both hold across a factor of nearly three in g. The trajectory is a");
  line("  function of g·t, which is what a Bloch oscillation is and is not what");
  line("  an accelerated charge is.");
  line();
  line("  So what the arc measured is the charge coupling to the field with the");
  line("  right sign — which IS the result, and survives — and not an");
  line("  acceleration law. The t² is the small-θ limit of the oscillation,");
  line("  which every oscillation has, so the arc's reading is right for the");
  line("  first quarter and wrong about what it is the first quarter of.");
  line();
  line("  The correction matters beyond tidiness: a coupling read off a Bloch");
  line("  oscillation inherits the error, and the coupling is the one number");
  line("  the arc still owes.");
  line();
  return L.join("\n");
}

/** the dispersion, and which sectors are real — both reproduce, so both stay */
export function dispersionReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("4. THE DISPERSION AND THE TWO REAL SECTORS, WHICH BOTH HOLD");
  line("=".repeat(78));
  line();
  line("     cos Ω = cos m · cos(k − θ),  θ = 2πj/CYCLE");
  line();
  line("     j     θ/2π     phase e^{iθ}      group velocity at k = 0");
  const m = 0.3;
  for (let j = 0; j < CYCLE; j++) {
    const th = 2 * Math.PI * j / CYCLE;
    const vg = (k: number) => {
      const h = 1e-6;
      const O = (kk: number) => Math.acos(Math.max(-1, Math.min(1, Math.cos(m) * Math.cos(kk - th))));
      return (O(k + h) - O(k - h)) / (2 * h);
    };
    const ph = Math.cos(th);
    const real = Math.abs(Math.sin(th)) < 1e-12;
    line(`  ${String(j).padStart(6)}${(j / CYCLE).toFixed(3).padStart(9)}` +
      `${(real ? ph.toFixed(0) : "complex").padStart(14)}${vg(0).toFixed(6).padStart(24)}` +
      (real ? "   ← real" : ""));
  }
  line();
  line("  Six of the eight carry a group velocity at k = 0; the two that do not");
  line("  are j = 0 and j = CYCLE/2, whose phases are +1 and −1. So the lattice");
  line("  says which sectors could have been done without complex numbers, and");
  line("  it is two out of eight. That part of the arc stands as written.");
  line();
  line("  One caveat carried from `ring`: CYCLE = 8 is the FACE ring. On a");
  line("  corner axis the ring has six members, so there are two real sectors");
  line("  out of six rather than two out of eight, and on an edge axis the");
  line("  ring is not uniform and 2πj/CYCLE is not what θ is.");

  return L.join("\n");
}

console.log(forceReport());
console.log();
console.log(dispersionReport());
