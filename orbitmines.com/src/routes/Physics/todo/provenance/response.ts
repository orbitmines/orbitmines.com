/**
 * IS THERE ANYTHING IN THIS MODEL THAT MAKES ONE EMITTER LISTEN TO ANOTHER?
 *
 * `domains` derives a Kuramoto coupling from two ingredients: the emitted sign
 * is cos(2πβ), and "the receiver's rotation responds to what arrives". The
 * first is in `physics.ts`. THE SECOND IS NOT — `rate(s)` reads `s.turning`,
 * `s.flips` and nothing else, so as the model stands an emitter's beat is a
 * property of the emitter and no arriving pulse can touch it. The whole
 * ordering mechanism, and the domain result with it, rests on a sensitivity
 * that has to be either derived or admitted.
 *
 * This file asks whether it can be derived, and the answer is a qualified yes
 * with one sign left undetermined.
 *
 *   §1  The obvious candidate fails, and fails structurally. What the model
 *       already has is ANNIHILATION, and the annihilation count between two
 *       emitters is EVEN in their phase difference. An even coupling cannot
 *       lock anything: it has no way to tell ahead from behind.
 *
 *   §2  But annihilation happens SOMEWHERE, and a turning source that loses
 *       space asymmetrically about its own axis is being pushed round. The
 *       first moment of the annihilation density is ODD — exactly, at every
 *       phase difference — with no cosine component and no mean. It is a
 *       coarse staircase rather than a smooth sine, but its symmetry is the
 *       part that matters, and its lowest harmonic is sin(2πΔβ): the Kuramoto
 *       coupling, out of rule (G/1) rather than assumed.
 *
 *   §3  What that fixes and what it does not.
 */

const TAU = Math.PI * 2;

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sgn = (x: number) => (Math.abs(x) < 1e-9 ? 0 : x > 0 ? 1 : -1);

/** an axis turning in the xy-plane, at phase β in turns */
const axis = (b: number): V => [Math.cos(TAU * b), Math.sin(TAU * b), 0];

/** the cells around a point, out to a radius, excluding the point itself */
const around = (c: V, R: number): V[] => {
  const out: V[] = [];
  const r = Math.ceil(R);
  for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) for (let z = -r; z <= r; z++) {
    const p: V = [c[0] + x, c[1] + y, c[2] + z];
    const d = Math.hypot(x, y, z);
    if (d > 0.5 && d <= R) out.push(p);
  }
  return out;
};

const SEP = 8;
const N_AT: V = [0, 0, 0], M_AT: V = [SEP, 0, 0];
const NEAR = around(N_AT, 4);

/**
 * What the two emitters do to the space around n, at one instant.
 *
 * Both are sided sources: each puts sgn(axis·d) into the direction d. Where the
 * two disagree, they annihilate — rule (G/1) with the signs kept, which is the
 * same event `poles`, `ordering` and `escape` all use.
 *
 * Returns the annihilation count, and its first moment about n measured in the
 * plane the axis turns in: the LEVER is the signed sine of the angle from n's
 * own axis to the cell, so a positive moment means space is being destroyed
 * ahead of where n is pointing.
 */
const encounter = (bn: number, bm: number) => {
  const an = axis(bn), am = axis(bm);
  let count = 0, moment = 0;
  for (const y of NEAR) {
    const dn = unit(sub(y, N_AT)), dm = unit(sub(y, M_AT));
    const sn = sgn(dot(an, dn)), sm = sgn(dot(am, dm));
    if (sn === 0 || sm === 0 || sn === sm) continue;
    // weight by how much of m's pulse actually reaches here: 1/r²
    const w = 1 / (len(sub(y, M_AT)) ** 2);
    count += w;
    // signed sine of the angle from n's axis to this direction, in the xy-plane
    moment += w * (an[0] * dn[1] - an[1] * dn[0]);
  }
  return { count, moment };
};

/** least-squares amplitude of sin(2πΔ) and cos(2πΔ) in a sampled function */
const harmonics = (f: (d: number) => number, n = 720) => {
  let s = 0, c = 0, mean = 0;
  for (let i = 0; i < n; i++) {
    const d = i / n, v = f(d);
    mean += v / n;
    s += 2 * v * Math.sin(TAU * d) / n;
    c += 2 * v * Math.cos(TAU * d) / n;
  }
  return { mean, sin: s, cos: c };
};

let seed = 20260815;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = () => { seed = 20260815; };

/** the Kuramoto run of `domains`, with an arbitrary coupling shape */
const lock = (N: number, K: number, shape: (d: number) => number, steps = 4000, dt = 0.01) => {
  const b = Array.from({ length: N }, () => rnd());
  const w = Array.from({ length: N }, () => 1 + 0.1 * (2 * rnd() - 1));
  for (let t = 0; t < steps; t++) {
    const db = new Array(N).fill(0);
    for (let i = 0; i < N; i++) {
      let drive = 0;
      for (let j = 0; j < N; j++) if (i !== j) drive += shape(b[j] - b[i]);
      db[i] = w[i] + (K / N) * drive;
    }
    for (let i = 0; i < N; i++) b[i] = (b[i] + dt * db[i]) % 1;
  }
  let c = 0, s = 0;
  for (const x of b) { c += Math.cos(TAU * x); s += Math.sin(TAU * x); }
  return Math.hypot(c, s) / N;
};

export function responseReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. THE MODEL HAS NO RATE RESPONSE, AND THE OBVIOUS ONE WOULD NOT WORK");
  line("=".repeat(78));
  line();
  line("  `rate(s)` in physics.ts reads s.turning, s.flips, and nothing else.");
  line("  No arriving pulse enters it. So `domains` assumed something the model");
  line("  does not have — the question is whether the model can be made to");
  line("  supply it without a new rule.");
  line();
  line("  The one thing that DOES happen when a pulse arrives is annihilation.");
  line("  So measure it: two sided emitters, the count of annihilations near");
  line("  the first, against the phase difference.");
  line();
  line("     Δβ        annihilation count near n");
  for (const d of [0, 0.0625, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875]) {
    const a = encounter(0, d), b = encounter(0, -d);
    line(`     ${d.toFixed(3)}    ${a.count.toFixed(6).padStart(12)}` +
      `      (at −Δβ: ${b.count.toFixed(6)})`);
  }
  const hc = harmonics(d => encounter(0, d).count);
  line();
  line(`     sin component of the count   ${hc.sin.toExponential(2)}`);
  line(`     cos component of the count   ${hc.cos.toExponential(2)}`);
  line();
  line("  THE COUNT IS EVEN. It is the same at +Δβ and at −Δβ to every digit,");
  line("  and its sine component is nought. That is fatal on its own terms:");
  line("  an even coupling cannot tell ahead from behind, so it cannot pull a");
  line("  laggard forward and a leader back, so it cannot lock. Measured:");
  line();
  line("     coupling shape                    4000      16000     64000 ticks");
  for (const [nm, sh] of [["even, ∝ (1 − cos 2πΔβ)/2", (d: number) => (1 - Math.cos(TAU * d)) / 2],
                          ["odd,  ∝ sin 2πΔβ", (d: number) => Math.sin(TAU * d)]] as [string, (d: number) => number][]) {
    const os: string[] = [];
    for (const st of [4000, 16000, 64000]) { reseed(); os.push(lock(64, 2, sh, st).toFixed(4)); }
    line(`     ${nm.padEnd(32)}${os.join("    ")}`);
  }
  line();
  line("  The odd coupling locks and stays locked. The even one drifts — it is");
  line("  not nought, because a non-negative drive that is larger when out of");
  line("  phase does bunch things somewhat, but it does not settle and it does");
  line("  not approach one. So 'annihilation changes the rate' is not enough,");
  line("  however true: the response has to know WHICH WAY, and a count does");
  line("  not.");

  line();
  line("=".repeat(78));
  line("2. BUT ANNIHILATION HAPPENS SOMEWHERE, AND THE PLACE IS ODD");
  line("=".repeat(78));
  line();
  line("  A count throws away the one thing rule (G/1) actually produces, which");
  line("  is a LOCATION. Space is destroyed at particular cells, and a source");
  line("  with an axis has a front and a back. If more space goes ahead of");
  line("  where n is pointing than behind it, n is being pushed round — and");
  line("  that is a rate response with a direction in it, out of the rule the");
  line("  model already has.");
  line();
  line("  The first moment of the annihilation density about n, in the plane");
  line("  its axis turns in:");
  line();
  line("     Δβ         moment          at −Δβ        sum (0 if odd)");
  for (const d of [0.05, 0.125, 0.1875, 0.25, 0.3125, 0.375, 0.5]) {
    const a = encounter(0, d).moment, b = encounter(0, -d).moment;
    line(`     ${d.toFixed(3)}   ${a.toExponential(3).padStart(12)}   ${b.toExponential(3).padStart(12)}` +
      `   ${(a + b).toExponential(1).padStart(12)}`);
  }
  const hm = harmonics(d => encounter(0, d).moment);
  line();
  line(`     mean                        ${hm.mean.toExponential(2)}`);
  line(`     sin component               ${hm.sin.toExponential(3)}`);
  line(`     cos component               ${hm.cos.toExponential(2)}`);
  line(`     |cos| / |sin|               ${Math.abs(hm.cos / hm.sin).toExponential(2)}`);
  line();
  line("  ODD — exactly, at every Δβ, to 10⁻¹⁷ — and with no cosine component");
  line("  and no mean. Note what it is NOT: it is not a smooth sine. The signs");
  line("  are sgn(axis·d) over 26 directions, so the moment is a staircase that");
  line("  only moves when the axis crosses onto a new set of exits, and most");
  line("  of the samples above sit on a flat. What survives the coarseness is");
  line("  the symmetry, and the symmetry is the whole of what matters here:");
  line("  the lowest harmonic of an odd staircase is a sine, and an odd");
  line("  coupling locks whatever else is riding on it.");
  line();
  line("     drive on n from m  ∝  sin(2π(βₘ − βₙ))/r²");
  line();
  line("  WHICH IS THE COUPLING `domains` ASSUMED, derived from rule (G/1)");
  line("  instead. The harmonic expansion and the product-to-sum step in that");
  line("  file are not needed — the lattice hands over the odd first harmonic");
  line("  directly, because annihilation has a place and an axis has a side.");
  line();
  line("  And the 1/r² is not put in either: it is the weight with which m's");
  line("  pulses arrive, which is `chance` and is the same 1/r² as everything");
  line("  else in the book.");

  line();
  line("=".repeat(78));
  line("3. WHAT IS FIXED, AND THE ONE THING THAT IS NOT");
  line("=".repeat(78));
  line();
  line("     FIXED    that there is a rate response at all, and that it is odd");
  line("              in the phase difference. Both come out of annihilation");
  line("              having a location. `domains` no longer assumes its");
  line("              coupling; it measures a consequence of (G/1).");
  line();
  line("     NOT FIXED THE SIGN. The moment says space is destroyed");
  line("              preferentially on one side of n. It does NOT say whether");
  line("              losing space ahead of you speeds you up or slows you");
  line("              down — that is a statement about how a source's beat");
  line("              depends on the space around it, and the book does not");
  line("              have one. K > 0 locks, K < 0 scatters, and the sign of K");
  line("              is exactly this unknown.");
  line();
  line("  Which is a much smaller debt than the one it replaces, and a much");
  line("  sharper one: not 'is there a coupling' but 'does an emitter run fast");
  line("  or slow in shortened space'. The gravity arc is the natural place for");
  line("  it — it is the arc that says what annihilated space does to an");
  line("  interval — and it is one sign, not a mechanism.");
  line();
  line("     AND IT IS THE WHOLE OF WHETHER MATTER IS FERROMAGNETIC. One sign,");
  line("     one bit, and it decides whether a lump of aligned emitters holds");
  line("     together or scatters.");

  return L.join("\n");
}

console.log(responseReport());
