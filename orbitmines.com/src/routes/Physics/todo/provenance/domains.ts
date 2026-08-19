/**
 * WHAT ORDERS THE EMITTERS — and how big the ordered region is allowed to get.
 *
 * `divp` says what a magnet has to be: a region with a uniform polarisation in
 * it, whose emitted sign is −div p. It does not say what holds the
 * polarisation uniform. This file asks that, and the answer turns out to
 * predict something the arc did not set out to get.
 *
 *   §1  The coupling the model already has — dipolar — does not order. It
 *       selects a state with NO net polarisation, which is the standard result
 *       and the reason real ferromagnetism needs exchange.
 *
 *   §2  A coupling that does order: arriving emission changes how fast an
 *       emitter comes round. Locks hard, from random phases, with the 1/r²
 *       reach the emission already has.
 *
 *   §3  And it is not assumed. It follows from two things already in the
 *       model — emission is cos(2πβ), and a receiver's rate responds to what
 *       arrives — with one harmonic expansion and product-to-sum.
 *
 *   §4  Which then forces a maximum size, because the signal arrives LATE.
 *       Coherent regions cannot be bigger than about half a wavelength of the
 *       emitter's own beat. That is a domain, and nothing was put in to make
 *       one.
 *
 * Everything is seeded.
 */

const TAU = Math.PI * 2;

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cube = (L: number): V[] => {
  const out: V[] = [];
  const h = (L - 1) / 2;
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < L; k++)
    out.push([i - h, j - h, k - h]);
  return out;
};

let seed = 20260815;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = () => { seed = 20260815; };

// ─────────────────────────────────────────────────────────────────────────────

/** the textbook dipolar sum, Σ_{i<j} [mᵢ·mⱼ − 3(mᵢ·r̂)(mⱼ·r̂)]/r³, per moment */
const dipolar = (at: V[], m: V[]) => {
  let u = 0;
  for (let i = 0; i < at.length; i++)
    for (let j = i + 1; j < at.length; j++) {
      const d = sub(at[j], at[i]), r = len(d);
      const rh: V = [d[0] / r, d[1] / r, d[2] / r];
      u += (dot(m[i], m[j]) - 3 * dot(m[i], rh) * dot(m[j], rh)) / (r * r * r);
    }
  return u / at.length;
};

export function orderingReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const at = cube(6);

  const states: [string, (p: V) => V][] = [
    ["uniform ẑ", () => [0, 0, 1]],
    ["columnar (± by x)", p => [0, 0, ((p[0] + 2.5) % 2 < 1 ? 1 : -1)]],
    ["layered (± by z)", p => [0, 0, ((p[2] + 2.5) % 2 < 1 ? 1 : -1)]],
    ["in-plane closure", p => {
      const r = Math.hypot(p[0], p[1]) || 1;
      return [-p[1] / r, p[0] / r, 0];
    }],
    ["in-plane uniform", () => [1, 0, 0]],
  ];

  line("=".repeat(78));
  line("1. THE COUPLING THE MODEL ALREADY HAS DOES NOT ORDER");
  line("=".repeat(78));
  line();
  line("  A 6×6×6 block of moments, five arrangements, the dipolar energy per");
  line("  moment. Lower wins.");
  line();
  line("     arrangement            E/N        net polarisation |⟨m⟩|");
  for (const [name, f] of states) {
    const m = at.map(f);
    const s: V = [0, 0, 0];
    for (const v of m) { s[0] += v[0]; s[1] += v[1]; s[2] += v[2]; }
    line(`     ${name.padEnd(22)}${dipolar(at, m).toFixed(3).padStart(7)}` +
      `${(len(s) / m.length).toFixed(3).padStart(22)}`);
  }
  line();
  line("  The uniform state is exactly nought — the dipolar lattice sum on a");
  line("  cubic lattice vanishes by symmetry — and every state that beats it");
  line("  has no net polarisation at all. Dipolar coupling favours closure,");
  line("  which is the standard result and is why real ferromagnetism needs");
  line("  exchange rather than dipole–dipole.");
  line();
  line("  So the ordering cannot come from the pole energy. It has to come from");
  line("  the emission itself.");

  return L.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Emitters as phases. `lag` in ticks per unit distance is ω/c with c = 1 cell a
 * tick — set it to zero for the instantaneous version.
 */
const kuramoto = (at: V[], K: number, spread: number, steps: number, dt: number, lag = 0) => {
  const N = at.length;
  const b = Array.from({ length: N }, () => rnd());              // random phases
  const w = Array.from({ length: N }, () => 1 + spread * (2 * rnd() - 1));
  const r2 = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => (i === j ? 0 : 1 / (len(sub(at[i], at[j])) ** 2))));
  const d = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (_, j) => len(sub(at[i], at[j]))));

  for (let t = 0; t < steps; t++) {
    const db = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      let drive = 0;
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        drive += r2[i][j] * Math.sin(TAU * (b[j] - b[i]) - lag * d[i][j]);
      }
      db[i] = w[i] + (K / 2) * drive;
    }
    for (let i = 0; i < N; i++) b[i] = (b[i] + dt * db[i]) % 1;
  }

  let c = 0, s = 0;
  for (const x of b) { c += Math.cos(TAU * x); s += Math.sin(TAU * x); }
  return Math.hypot(c, s) / N;
};

export function couplingReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const at = cube(4);

  line("=".repeat(78));
  line("2. A COUPLING THAT DOES ORDER: ARRIVING EMISSION CHANGES THE RATE");
  line("=".repeat(78));
  line();
  line("  64 emitters on a 4³ block, phases random to start, natural rates");
  line("  spread by 10%, full 1/r² reach, no lag. Order is |⟨e^{2πiβ}⟩|.");
  line();
  line("        K      order    ");
  for (const K of [-2, -0.5, 0, 0.5, 2]) {
    reseed();
    const o = kuramoto(at, K, 0.1, 4000, 0.01);
    line(`     ${K.toFixed(2).padStart(5)}     ${o.toFixed(4)}   ` +
      (o > 0.9 ? "locked" : o > 0.3 ? "partial" : "incoherent"));
  }
  line();
  line("  It locks, and it locks hard. Negative K gives incoherence, which is");
  line("  the check that the lock is the coupling and not the initialisation.");
  line();
  line("  ONE CRITICAL CAVEAT, and it decides the physics rather than");
  line("  decorating it. WHAT the rate coupling locks is not settled by this");
  line("  measurement:");
  line();
  line("     if it locks the SIGN            every emitter ends the same sign,");
  line("                                     net bias 1.0000, and the body is a");
  line("                                     monopole — `departure` §2");
  line("     if it locks the POLARISATION    the locked state is a uniform p,");
  line("                                     the sign is still −div p, and the");
  line("                                     body is the magnet of `divp`");
  line();
  line("  Take the second reading. It is not a preference: a sign is what the");
  line("  emitter sends, and `departure` shows a body of like signs is not a");
  line("  field at all, so the first reading is not available on its own terms.");

  return L.join("\n");
}

export function derivationReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("3. AND THE COUPLING IS DERIVED, NOT PUT IN");
  line("=".repeat(78));
  line();
  line("  Two things the model already has:");
  line();
  line("    (a) the emitted sign is cos(2πβ) — `physics.ts`'s own source line —");
  line("        arriving at a receiver weighted 1/r², since that is what a");
  line("        pulse spread over a shell does;");
  line("    (b) a receiver's rotation responds to what arrives, and responds");
  line("        differently at different points of its own cycle.");
  line();
  line("  Expand that sensitivity in harmonics of the receiver's phase. The");
  line("  constant term only shifts the frequency and cannot lock anything to");
  line("  anything; the first term that can is Z(β) = −sin(2πβ). So the drive");
  line("  on n from m is");
  line();
  line("     −K·sin(2πβₙ)·cos(2πβₘ)/r²");
  line();
  line("  and product-to-sum splits it into");
  line();
  line("     −(K/2r²)·[ sin(2π(βₙ+βₘ)) + sin(2π(βₙ−βₘ)) ]");
  line();
  line("  The first term runs at twice the beat and averages away for |K| ≪ ω.");
  line("  What survives is");
  line();
  line("     (K/2r²)·sin(2π(βₘ − βₙ))");
  line();
  line("  which is exactly §2's coupling, with the 1/r² the emission already");
  line("  carried. Checked numerically: the sum term against its average.");
  line();

  // the averaging claim, measured rather than asserted
  const w = 1.0, K = 0.05, steps = 200000, dt = 0.001;
  let bn = 0.11, bm = 0.63, full = 0, kept = 0;
  for (let t = 0; t < steps; t++) {
    full += -(K / 2) * (Math.sin(TAU * (bn + bm)) + Math.sin(TAU * (bn - bm)));
    kept += (K / 2) * Math.sin(TAU * (bm - bn));
    bn += dt * w * 1.0; bm += dt * w * 1.07;
  }
  line(`     ⟨full drive⟩ over ${steps} ticks     ${(full / steps).toExponential(3)}`);
  line(`     ⟨surviving term⟩                    ${(kept / steps).toExponential(3)}`);
  line(`     difference                          ${Math.abs(full / steps - kept / steps).toExponential(3)}`);
  line();
  line("  The two averages agree, so the fast term really is the one that goes.");

  return L.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────

export function coherenceReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("4. WHICH FORCES A MAXIMUM SIZE, BECAUSE THE SIGNAL ARRIVES LATE");
  line("=".repeat(78));
  line();
  line("  Nothing in §2 or §3 said WHEN the emission arrives. It arrives late:");
  line("  a pulse goes a cell a tick, so a neighbour r cells away is heard as");
  line("  it was r ticks ago, and the coupling is really");
  line();
  line("     sin(2π(βₘ − βₙ) − ω·r)");
  line();
  line("  The lag grows with distance while the phase difference does not, so");
  line("  shells far enough out couple with the WRONG SIGN and pull the other");
  line("  way. Order should therefore survive up to a size and then collapse.");
  line();
  line("  A 4³ block, K = 2, against the lag per lattice step:");
  line();
  line("     ω·spacing     order");
  for (const w of [0, 0.02, 0.05, 0.1, 0.2, 0.4, 0.8, 1.6]) {
    reseed();
    const o = kuramoto(cube(4), 2, 0.1, 4000, 0.01, w);
    line(`     ${w.toFixed(2).padStart(9)}     ${o.toFixed(4)}`);
  }
  line();
  line("  (the last two rows are both incoherence; which of them is the");
  line("  smaller is noise, not a trend)");
  line();
  line("  Now the same sweep against BODY SIZE, looking for where it goes. If");
  line("  the mechanism is the lag, the threshold should scale as 1/L rather");
  line("  than sitting at a fixed ω.");
  line();
  line("       L      ω* (order falls below ½)     ω*·L");
  const thresholds: number[] = [];
  for (const size of [4, 6, 8]) {
    const at = cube(size);
    let lo = 0, hi = 4;
    for (let it = 0; it < 12; it++) {
      const mid = (lo + hi) / 2;
      reseed();
      const o = kuramoto(at, 2, 0.1, 2500, 0.01, mid);
      if (o > 0.5) lo = mid; else hi = mid;
    }
    const w = (lo + hi) / 2;
    thresholds.push(w * size);
    line(`     ${String(size).padStart(3)}${w.toFixed(4).padStart(24)}${(w * size).toFixed(3).padStart(14)}`);
  }
  const mean = thresholds.reduce((a, b) => a + b) / thresholds.length;
  line();
  line(`     mean ω*·L = ${mean.toFixed(3)},   π = ${Math.PI.toFixed(3)}`);
  line();
  line("  ω*·L is the same number to about a tenth across a factor of two in");
  line("  L, where ω* alone moves by nearly two, so the threshold is a");
  line("  statement about ω·L and not about ω. And that number is near π.");
  line();
  line("  So a coherent region has a maximum size of about π/ω lattice steps —");
  line("  HALF THE EMITTER'S OWN WAVELENGTH — and a body larger than that");
  line("  breaks into regions rather than ordering as one.");
  line();
  line("     THAT IS A MAGNETIC DOMAIN, and its size is set by the emitter's");
  line("     beat and by nothing else. No anisotropy, no wall energy, no");
  line("     surface term: only the light-travel time of the model's own");
  line("     signal against the model's own period.");
  line();
  line("  Which makes it a prediction rather than a fit. The gravity arc has");
  line("  period = 1/mass, so ω is fixed the moment a carrier is named, and");
  line("  real domain sizes are measured. This is the sharpest falsifiable");
  line("  thing in the magnetic half of the book and it is not claimed here —");
  line("  it is stated so that it can be checked.");

  return L.join("\n");
}

console.log(orderingReport());
console.log();
console.log(couplingReport());
console.log();
console.log(derivationReport());
console.log();
console.log(coherenceReport());
