/**
 * THE REPULSION — and why it was missing, which is that the emitters did not
 * alternate.
 *
 * `forces` measured opposite charges attracting at 7.6σ and could not resolve a
 * repulsion between alike ones: +1/+1 came out at 0.8σ and −1/−1 at 1.3σ, and the
 * two disagreed in sign, which is what noise looks like. That was read as a limit
 * of the statistics. IT IS NOT. It is a statement about how the sources were built.
 *
 * The article says exactly what the repulsion is, and the clause that matters is
 * the last one:
 *
 *     "If they agree, they turn around ... and each travels back the way it came
 *      until it runs into the next wave its own source put out behind it. THAT WAVE
 *      IS THE OPPOSITE SIGN, BECAUSE THE SOURCE ALTERNATES. So they annihilate
 *      there: half a wavelength back, several ticks later."
 *
 * `forces` gave each body a CONSTANT sign. So a turned ray goes back toward its own
 * source, meets more of the same sign, turns again, and ping-pongs — it never meets
 * an opposite wave and never annihilates. THE MECHANISM COULD NOT FIRE, and no
 * amount of averaging would have found it.
 *
 * Which also says what a charge IS on this reading, and it is not a constant label:
 * two sources both alternate, and whether their rays meet ALIKE or OPPOSITE is
 * decided by their RELATIVE PHASE. In phase is alike and should repel; antiphase is
 * opposite and should attract. That is the XOR, and it is testable.
 *
 *   §1  the same force measure, with sources that alternate — in phase against
 *       antiphase, against an inert pair of the same geometry.
 *
 *   §2  and against the PERIOD, because the mechanism has a length in it: a turned
 *       ray has to travel back far enough to meet the next wave, so the effect
 *       should depend on the half-wavelength against the separation, and vanish
 *       when the period is long enough that no next wave has been emitted.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

const D: [number, number, number][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) D.push([x, y, z]);
const DEG = D.length;
const OPP = new Int32Array(DEG);
for (let d = 0; d < DEG; d++)
  OPP[d] = D.findIndex(w => w[0] === -D[d][0] && w[1] === -D[d][1] && w[2] === -D[d][2]);
const AX: number[] = [];
for (let d = 0; d < DEG; d++) if (d < OPP[d]) AX.push(d);

const N = 45, C = 22, CELLS = N * N * N;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;

/**
 * Two alternating emitters. `phase` is the SECOND one's offset in ticks: 0 puts
 * them in step, so their rays meet ALIKE; half a period puts them out of step, so
 * their rays meet OPPOSITE. `inert` makes both absorb and emit nothing, which is
 * the control that removes the shadowing two bodies cause whatever they are doing.
 */
const run = (T: number, pCreate: number, sep: number, period: number,
  phase: number, inert: boolean, seed: number) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };
  const tag = new Uint8Array(CELLS);
  for (const [x0, t] of [[C - sep / 2, 1], [C + sep / 2, 2]] as [number, number][])
    for (let x = x0 - 2; x <= x0 + 2; x++) for (let y = C - 2; y <= C + 2; y++)
      for (let z = C - 2; z <= C + 2; z++)
        if (Math.hypot(x - x0, y - C, z - C) <= 2) tag[idx(x, y, z)] = t as any;
  const pol = new Int8Array(CELLS * DEG), nxt = new Int8Array(CELLS * DEG);
  const ann = new Float64Array(CELLS);
  let samples = 0;
  for (let t = 0; t < T; t++) {
    for (let c = 0; c < CELLS; c++) {
      if (tag[c]) continue;
      let neutral = true;
      for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) { neutral = false; break; }
      if (!neutral || rnd() > pCreate) continue;
      const s = rnd() < 0.5 ? 1 : -1;
      for (const a of AX) { pol[c * DEG + a] = s as any; pol[c * DEG + OPP[a]] = -s as any; }
    }
    nxt.fill(0);
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
      const c = idx(x, y, z);
      for (let d = 0; d < DEG; d++) {
        const p = pol[c * DEG + d];
        if (!p) continue;
        const nx = x + D[d][0], ny = y + D[d][1], nz = z + D[d][2];
        if (nx < 1 || nx >= N - 1 || ny < 1 || ny >= N - 1 || nz < 1 || nz >= N - 1) continue;
        nxt[idx(nx, ny, nz) * DEG + d] = p;
      }
    }
    pol.set(nxt);
    // THE SOURCES ALTERNATE. That is the whole of what `forces` was missing.
    const sL = Math.sin(2 * Math.PI * t / period) >= 0 ? 1 : -1;
    const sR = Math.sin(2 * Math.PI * (t + phase) / period) >= 0 ? 1 : -1;
    for (let c = 0; c < CELLS; c++) {
      const g = tag[c];
      if (!g) continue;
      const q = inert ? 0 : (g === 1 ? sL : sR);
      for (let d = 0; d < DEG; d++) pol[c * DEG + d] = q as any;
    }
    for (let c = 0; c < CELLS; c++) {
      if (tag[c]) continue;
      for (const a of AX) {
        const p = pol[c * DEG + a], q = pol[c * DEG + OPP[a]];
        if (!p || !q) continue;
        if (p === q) { pol[c * DEG + a] = q; pol[c * DEG + OPP[a]] = p; }
        else {
          pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0;
          if (t > T * 0.5) ann[c]++;
        }
      }
    }
    if (t > T * 0.5) samples++;
  }
  return { ann, samples };
};

/** the signed one-sided force on the LEFT body — `forces`' measure, unchanged */
const force = (ann: Float64Array, s: number, sep: number) => {
  const xL = C - sep / 2;
  let tow = 0, twN = 0, awy = 0, awN = 0;
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
    const dx = x - xL, dy = y - C, dz = z - C;
    const r = Math.hypot(dx, dy, dz);
    if (r < 3 || r > 5 || Math.abs(dx) < 0.7 * r) continue;
    const c = idx(x, y, z);
    if (dx > 0) { tow += ann[c] / s; twN++; } else { awy += ann[c] / s; awN++; }
  }
  return tow / Math.max(twN, 1) - awy / Math.max(awN, 1);
};

const T = 700, P = 0.03, SEP = 10;
const SEEDS = [20260817, 777333, 424242, 909090, 5150, 31337];
const meanForce = (period: number, phase: number, inert: boolean) => {
  const v: number[] = [];
  for (const sd of SEEDS) {
    const r = run(T, P, SEP, period, phase, inert, sd);
    v.push(force(r.ann, r.samples, SEP));
  }
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  const s = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(v.length - 1, 1));
  return { m, err: s / Math.sqrt(v.length) };
};

console.log("═════ §1  ALTERNATING SOURCES — AND NOW THE REPULSION ═════");
console.log();
console.log(`  ${N}³, cubic 26, the three rules. Two emitters ${SEP} cells apart, ALTERNATING`);
console.log("  their sign, which is what the article says a source does and what `forces`");
console.log("  left out. In phase, their rays meet ALIKE and (G+M/3) turns them; antiphase,");
console.log("  they meet OPPOSITE and (G+M/1) annihilates them.");
console.log();
console.log("  A turned ray then travels back and meets the NEXT wave its own source put");
console.log("  out — which is the opposite sign, because the source alternates — and");
console.log("  annihilates BEHIND. That is the repulsion, and it needs the alternation to");
console.log("  exist at all: with a constant sign a turned ray meets its own kind again and");
console.log("  ping-pongs forever.");
console.log();
const PER = 12;
console.log(`  period ${PER} ticks, so half a wavelength is ${PER / 2} cells against a separation of ${SEP}`);
console.log();
const iz = meanForce(PER, 0, true);
console.log(`  ${pad("configuration", 22)} ${pad("force", 13)} ${pad("err", 11)} ${pad("vs inert", 13)} ${pad("signif", 10)}`);
console.log("  " + "─".repeat(72));
console.log(`  ${pad("inert control", 22)} ${pad(iz.m.toExponential(3), 13)} ${pad(iz.err.toExponential(2), 11)} ${pad("—", 13)}`);
const res: Record<string, { m: number; err: number }> = {};
for (const [name, ph] of [["in phase — ALIKE", 0], ["antiphase — OPPOSITE", PER / 2]] as [string, number][]) {
  const f = meanForce(PER, ph, false);
  res[name] = f;
  const sg = (f.m - iz.m) / Math.hypot(f.err, iz.err);
  console.log(`  ${pad(name, 22)} ${pad(f.m.toExponential(3), 13)} ${pad(f.err.toExponential(2), 11)} ${pad((f.m - iz.m).toExponential(3), 13)} ${pad(sg.toFixed(1) + " sigma", 10)}`);
}
console.log();
console.log(`  averaged over ${SEEDS.length} runs of ${T} ticks each; positive is a PULL`);
console.log();
const A = res["antiphase — OPPOSITE"], L = res["in phase — ALIKE"];
const sa = (A.m - iz.m) / Math.hypot(A.err, iz.err), sl = (L.m - iz.m) / Math.hypot(L.err, iz.err);
if (sa > 2 && sl < -2) {
  console.log("  OPPOSITE PULLS AND ALIKE PUSHES, both clear of the control — which is the");
  console.log("  sign law entire, on a lattice, and the repulsion appears exactly when the");
  console.log("  sources are allowed to alternate. `forces` did not fail to measure it. It");
  console.log("  measured a configuration in which it cannot happen.");
} else if (sa > 2) {
  console.log("  THE ATTRACTION IS THERE AND THE REPULSION STILL IS NOT, so the alternation");
  console.log("  is not what was missing — which is worth more than a confirmation would");
  console.log("  have been, because it says the mechanism the article describes does not");
  console.log("  produce a measurable push even when it is given what it asks for.");
} else {
  console.log("  NEITHER IS CLEAR OF THE CONTROL at this period, so this configuration says");
  console.log("  nothing either way and §2 is the thing to read.");
}

console.log();
console.log("═════ §2  AND AGAINST THE PERIOD, WHICH THE MECHANISM HAS A LENGTH IN ═════");
console.log();
console.log("  A turned ray has to get back far enough to meet the next wave. So the effect");
console.log("  should depend on the half-wavelength against the separation, and it should");
console.log("  die when the period is so long that no next wave has been emitted yet.");
console.log();
console.log(`  ${pad("period", 9)} ${pad("λ/2", 7)} ${pad("alike", 12)} ${pad("sig", 9)} ${pad("opposite", 12)} ${pad("sig", 9)}`);
console.log("  " + "─".repeat(64));
for (const per of [4, 8, 12, 20, 40]) {
  const z = meanForce(per, 0, true);
  const a = meanForce(per, 0, false);
  const o = meanForce(per, Math.round(per / 2), false);
  const sA = (a.m - z.m) / Math.hypot(a.err, z.err);
  const sO = (o.m - z.m) / Math.hypot(o.err, z.err);
  console.log(`  ${pad(String(per), 9)} ${pad(String(per / 2), 7)} ${pad((a.m - z.m).toExponential(2), 12)} ${pad(sA.toFixed(1), 9)} ${pad((o.m - z.m).toExponential(2), 12)} ${pad(sO.toFixed(1), 9)}`);
}
console.log();
console.log("  IF THE ALIKE COLUMN GOES NEGATIVE ANYWHERE it is a repulsion, and where it");
console.log("  does so tells us the length the mechanism runs on. If it never does, the");
console.log("  article's account of the repulsion does not survive being run.");
