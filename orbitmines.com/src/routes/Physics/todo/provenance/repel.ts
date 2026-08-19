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
 * AND A SOURCE THAT SIMPLY ALTERNATES IS NOT A CHARGE. Half a period of + and half
 * of − leaves nothing behind: its net emission is zero, so no aggregate charge
 * survives the vacuum and there is nothing for a sign law to be about. A first
 * version of this file tested exactly that and found both configurations attracting,
 * which is not a refutation of anything — it is two neutral oscillators.
 *
 * What a charge is, on the article's own reading, is a LOPSIDED default rather than
 * a stopped one: the magnetism arc writes it as P = 2·dwell − 1, a bias in how long
 * a source spends on each sign. P = 1 is a source that never alternates, which is
 * `forces`' constant body and has no repulsion mechanism because a turned ray never
 * meets an opposite wave. P = 0 is the neutral oscillator above, which has the
 * mechanism and no charge. IN BETWEEN IT HAS BOTH, and that is where a sign law
 * can live.
 *
 *   §1  the force against the BIAS, from a constant source through to a neutral
 *       one, with alike and opposite compared directly — both emit the same, and
 *       differ only in the sign of one, so no external control is needed.
 *
 *   §2  and against the period at the bias that works, because the mechanism has a
 *       length in it: a turned ray has to travel back far enough to meet the next
 *       wave.
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
/**
 * A source's sign at tick t: it spends a fraction (1+bias)/2 of each period on +1
 * and the rest on −1, so its NET emission per period is `bias`. That is the
 * article's P = 2·dwell − 1, and it is what makes an aggregate charge survive the
 * vacuum while still letting the source come round.
 */
/*
 * THE DWELL IS A WHOLE NUMBER OF TICKS, so the bias a run actually carries is
 * k/period and never the real number that was asked for. Comparing a fraction
 * against a phase rounds it SILENTLY, and the rounding is worst exactly where
 * this test wants to look: at period 4 a bias of 0.6 wants a threshold of 0.8,
 * every one of the four available phases is below it, and the source never
 * alternates at all — that run IS the constant-sign run wearing a different
 * label. So the tick count is the parameter and the bias is REPORTED from it,
 * P = 2k/period − 1. `up` is signed: its magnitude is the number of ticks on
 * the majority sign and its sign says which polarity that is.
 */
const signAt = (t: number, period: number, offset: number, up: number) => {
  const ph = (((t + offset) % period) + period) % period;
  return ph < Math.abs(up) ? Math.sign(up) : -Math.sign(up);
};
const biasOf = (up: number, period: number) => 2 * Math.abs(up) / period - 1;

const run = (T: number, pCreate: number, sep: number, period: number,
  biasL: number, biasR: number /* signed tick counts */, offset: number, inert: boolean, seed: number) => {
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
    // both sources alternate AND carry a net bias, so a charge survives the average
    const sL = signAt(t, period, 0, biasL);
    const sR = signAt(t, period, offset, biasR);
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
const meanForce = (period: number, bL: number, bR: number, offset: number, inert = false) => {
  const v: number[] = [];
  for (const sd of SEEDS) {
    const r = run(T, P, SEP, period, bL, bR, offset, inert, sd);
    v.push(force(r.ann, r.samples, SEP));
  }
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  const s = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(v.length - 1, 1));
  return { m, err: s / Math.sqrt(v.length) };
};

console.log("═════ §1  THE FORCE AGAINST THE BIAS — A CHARGE THAT ALSO COMES ROUND ═════");
console.log();
console.log(`  ${N}³, cubic 26, the three rules. Two sources ${SEP} cells apart, each spending a`);
console.log("  fraction (1+P)/2 of its period on +1 and the rest on −1, so its NET emission");
console.log("  per period is P — the article's own P = 2·dwell − 1.");
console.log();
console.log("  P = 1 is a source that never alternates: `forces`' constant body, which HAS a");
console.log("  charge and no repulsion mechanism, because a turned ray meets its own kind");
console.log("  again and ping-pongs. P = 0 is a neutral oscillator: it HAS the mechanism and");
console.log("  no charge, so there is nothing for a sign law to be about. In between it has");
console.log("  both.");
console.log();
console.log("  Alike and opposite are compared DIRECTLY. Both emit the same amount and differ");
console.log("  only in the sign of one source, so no external control is needed — and an");
console.log("  inert pair would be the wrong one anyway, since it emits nothing at all.");
console.log();
const PER = 12;   // 12 ticks admits dwells of 12/12 .. 8/12, i.e. P = 1 .. 1/3 exactly
console.log(`  period ${PER} ticks; positive is a PULL, negative a PUSH`);
console.log();
console.log(`  ${pad("bias P", 9)} ${pad("dwell", 7)} ${pad("alike (+,+)", 13)} ${pad("opposite (+,−)", 15)} ${pad("opp − alike", 13)} ${pad("signif", 10)}`);
console.log("  " + "─".repeat(74));
for (const up of [12, 11, 10, 9, 8]) {
  const a = meanForce(PER, up, up, 0);
  const o = meanForce(PER, up, -up, 0);
  const d = o.m - a.m, e = Math.hypot(a.err, o.err);
  console.log(`  ${pad(biasOf(up, PER).toFixed(3), 9)} ${pad(`${up}/${PER}`, 7)} ${pad(a.m.toExponential(3), 13)} ${pad(o.m.toExponential(3), 15)} ${pad(d.toExponential(3), 13)} ${pad((d / e).toFixed(1) + " sigma", 10)}`);
}
console.log();
console.log("  THE LAST COLUMN IS THE SIGN LAW. Positive means opposite charges are pulled");
console.log("  together more than alike ones are, which is what the model claims. Whether");
console.log("  the ALIKE column ever goes negative is the separate and harder question of");
console.log("  whether there is a genuine push rather than a weaker pull.");

console.log();
console.log("═════ §2  AND AGAINST THE PERIOD ═════");
console.log();
console.log("  A turned ray has to get back far enough to meet the next wave its own source");
console.log("  put out, so the effect should depend on the half-wavelength against the");
console.log("  separation. The DWELL IS HELD EXACTLY at 5 ticks in 6 — P = 2/3 at every");
console.log("  period — so this varies the period ALONE. Asking for a fixed real-valued");
console.log("  bias instead would have slid the effective bias from 1.000 to 0.600 as the");
console.log("  period grew, and manufactured a period effect out of the rounding.");
console.log();
console.log(`  ${pad("period", 9)} ${pad("λ/2", 7)} ${pad("alike", 13)} ${pad("opposite", 13)} ${pad("opp − alike", 13)} ${pad("signif", 10)}`);
console.log("  " + "─".repeat(70));
for (const per of [6, 12, 18, 24, 36]) {
  const up = per * 5 / 6;   // dwell held EXACTLY at 5/6, so P = 2/3 at every period
  const a = meanForce(per, up, up, 0);
  const o = meanForce(per, up, -up, 0);
  const d = o.m - a.m, e = Math.hypot(a.err, o.err);
  console.log(`  ${pad(String(per), 9)} ${pad(String(per / 2), 7)} ${pad(a.m.toExponential(3), 13)} ${pad(o.m.toExponential(3), 13)} ${pad(d.toExponential(3), 13)} ${pad((d / e).toFixed(1) + " sigma", 10)}`);
}
console.log();
console.log("  IF THE DIFFERENCE SURVIVES AT EVERY PERIOD it is the charge doing the work");
console.log("  and not the alternation. If it grows as the period shortens, the returning");
console.log("  wave is doing it, which is the article's own mechanism and would be the first");
console.log("  time it has been seen.");
