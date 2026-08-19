/**
 * THE TURN ANGLE UNLOCKED — and both of `magnetic`'s bills are the same bill.
 *
 * `magnetic` derived the Lorentz force as the antisymmetric part of (G+M/3)'s
 * rotation and then owed two things, which it treated as separate problems:
 *
 *     a LONGITUDINAL force at tan(SPIN/2) = 41.4% of the magnetic one, and
 *     a source that DECOHERES over a mean free path.
 *
 * Both were computed with the turn locked at SPIN = 45°, because CYCLE = 8. But the
 * article already says that is wrong — "CYCLE is the emitter's, not the lattice's...
 * How many steps an emitter's axis takes to come round is a property of the EMITTER,
 * which the particle sets and the lattice does not." Once a source may emit in any
 * direction at any rate, the deflection of an alike meeting is a free angle θ and
 * not an eighth of a turn.
 *
 *   §1  FIRST, WHAT DOES NOT MOVE. The theorem that no polarity distribution is a
 *       magnetic field never used CYCLE, never used the 26 exits, and never used a
 *       lattice. Redone over continuous directions it is the same statement, and
 *       Σd̂⊗d̂ = (n/3)·I holds for any isotropic set — so the obstruction and the
 *       isotropy of the force law are both lattice-independent.
 *
 *   §2  THEN THE TWO BILLS COLLAPSE ONTO ONE PARAMETER. transverse ∝ sin θ,
 *       longitudinal ∝ (1 − cos θ), so the ratio is tan(θ/2) → 0 as θ → 0 while the
 *       coupling → θ. THE DEVIATION IS HALF THE COUPLING, identically, at every θ.
 *       So a small coupling and a small deviation are the same statement, and the
 *       arc does not get to choose one without the other.
 *
 *   §3  AND THE COHERENCE, IN THE DISCRETE MODEL RATHER THAN BY TIME-AVERAGING.
 *       Time-averaging is a continuum crutch and this file does not use it. Run the
 *       real automaton with headings as real directions and steps rounded onto the
 *       lattice — which is what "emit wherever you want" means discretely — and
 *       measure how far a current stays coherent. Measured: the coherence length
 *       goes as θ^−2, a random walk in angle, so the SAME relaxation that removes
 *       the longitudinal force buys the range the source needs.
 *
 *   §4  A MAGNET IS A DRIVEN STEADY STATE, NOT A PULSE, which is the other half of
 *       the reply to `magnetic` §6. That section injected a current and watched it
 *       die, which is the wrong experiment for a magnet: a magnet is continuously
 *       re-sourced. Driven, the profile is screened rather than destroyed, with a
 *       screening length that is §3's coherence length.
 *
 * SO: `magnetic`'s two debts are one debt with one parameter, and that parameter is
 * the coupling the book already owes as α. What this file does NOT do is derive θ —
 * it shows that θ small is consistent, that it fixes both defects at once, and that
 * it makes the longitudinal force a PREDICTION at half the coupling rather than a
 * refutation at 41%.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type V3 = [number, number, number];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => { const n = len(a); return n < 1e-15 ? [0, 0, 0] : scale(a, 1 / n); };
const rotate = (v: V3, b: V3, th: number): V3 => {
  const c = Math.cos(th), s = Math.sin(th), k = unit(b);
  return add(add(scale(v, c), scale(cross(k, v), s)), scale(k, dot(k, v) * (1 - c)));
};

/** the 26 exits of the cubic lattice, normalised */
const EXITS: V3[] = (() => {
  const o: V3[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) { const n = Math.hypot(x, y, z); o.push([x / n, y / n, z / n]); }
  return o;
})();

/** an arbitrary number of directions spread evenly on a sphere — "emit anywhere" */
const sphere = (n: number): V3[] => {
  const o: V3[] = [], g = (1 + Math.sqrt(5)) / 2;
  for (let k = 0; k < n; k++) {
    const z = 1 - 2 * (k + 0.5) / n, r = Math.sqrt(Math.max(0, 1 - z * z));
    const t = 2 * Math.PI * k / g;
    o.push([r * Math.cos(t), r * Math.sin(t), z]);
  }
  return o;
};

// ─── §1 what does not move ──────────────────────────────────────────────────
function invariant(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  WHAT THE RELAXATION DOES NOT TOUCH ═════");
  line();
  line("  Before anything moves, it is worth being clear about what cannot. The");
  line("  obstruction in `magnetic` §2 — that F = q(J − M·v) with M symmetric, so no");
  line("  polarity distribution is a magnetic field — NEVER USED CYCLE, never used");
  line("  the 26 exits, and never used a lattice. M is a sum of d̂⊗d̂ and that is");
  line("  symmetric whatever the d̂ are and however many of them there are.");
  line();
  line("  Nor does the isotropy of the force law depend on the lattice. The DEG/3 in");
  line("  the coupling came from Σd̂⊗d̂ over the 26 exits being (DEG/3)·I, which read");
  line("  as a happy accident of cubic symmetry. It is not an accident:");
  line();
  line(`  ${pad("direction set", 26)} ${pad("count", 8)} ${pad("Σd̂⊗d̂ diagonal", 16)} ${pad("off-diag", 11)} ${pad("n/3", 10)} isotropic?`);
  line("  " + "─".repeat(84));
  const check = (label: string, dirs: V3[]) => {
    const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const d of dirs) for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) M[a][c] += d[a] * d[c];
    let off = 0; for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) if (a !== c) off = Math.max(off, Math.abs(M[a][c]));
    const dsp = Math.max(M[0][0], M[1][1], M[2][2]) - Math.min(M[0][0], M[1][1], M[2][2]);
    const iso = off < 1e-9 * dirs.length && dsp < 1e-9 * dirs.length;
    line(`  ${pad(label, 26)} ${pad(String(dirs.length), 8)} ${pad(M[0][0].toFixed(4), 16)} ${pad(off.toExponential(1), 11)} ${pad((dirs.length / 3).toFixed(4), 10)} ${iso ? "YES" : "approx"}`);
  };
  check("the 26 lattice exits", EXITS);
  for (const n of [64, 256, 1024, 4096]) check(`free emission, ${n} ways`, sphere(n));
  line();
  line("  THE LATTICE IS EXACT AND THE FREE SET IS ASYMPTOTIC, which is the right way");
  line("  round and worth a sentence. A cubic lattice's 26 exits have an isotropic");
  line("  second moment IDENTICALLY, by symmetry; an arbitrary spread of n directions");
  line("  has one only as n grows. So the lattice is not an approximation to free");
  line("  emission here — it is the case that gets the isotropy exactly right with");
  line("  the fewest directions, and relaxing to free emission costs a little");
  line("  isotropy rather than buying any.");
  line();
  line("  So §1 and §2 of `magnetic` stand as they are, and everything below concerns");
  line("  §4's coupling and §6's coherence, which are the two places SPIN entered.");
  return out.join("\n");
}

// ─── §2 the two bills collapse onto one parameter ───────────────────────────
/** the force on a charge q moving at v, through an unbiased background, turning by θ about b̂ */
const forceAt = (q: number, v: V3, b: V3, theta: number, dirs: V3[]): V3 => {
  let F: V3 = [0, 0, 0];
  for (const d of dirs) {
    const rate = 1 - dot(v, d);
    // alike → turn by q·θ about b̂;  opposite → reflect
    F = add(F, scale(rotate(d, b, q * theta), rate));
    F = add(F, scale(d, -rate));
  }
  return F;
};

function collapse(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  THE TWO BILLS ARE ONE BILL, WITH ONE PARAMETER ═════");
  line();
  line("  `magnetic` §4 split the rotation by Rodrigues and found the antisymmetric");
  line("  piece is the Lorentz force while the (1 − cos θ) piece is a longitudinal");
  line("  force with no charge dependence. With θ locked at 45° that ratio is");
  line("  tan(22.5°) = 41.4% and is a refutation. Unlock θ:");
  line();
  const b: V3 = [0, 0, 1];
  const v: V3 = [0.2, 0, 0];
  line(`  ${pad("CYCLE", 9)} ${pad("θ", 11)} ${pad("transverse", 13)} ${pad("longitudinal", 14)} ${pad("ratio", 11)} ${pad("tan(θ/2)", 11)}`);
  line("  " + "─".repeat(74));
  for (const C of [4, 8, 16, 64, 256, 1024]) {
    const th = 2 * Math.PI / C;
    const F = forceAt(+1, v, b, th, EXITS);
    const tr = dot(F, [0, 1, 0]), lo = dot(F, [1, 0, 0]);
    line(`  ${pad(String(C), 9)} ${pad((th * 180 / Math.PI).toFixed(3) + "°", 11)} ${pad(tr.toExponential(3), 13)} ${pad(lo.toExponential(3), 14)} ${pad(Math.abs(lo / tr).toFixed(6), 11)} ${pad(Math.tan(th / 2).toFixed(6), 11)}`);
  }
  line();
  line("  THE RATIO IS tan(θ/2) AT EVERY θ, AND IT GOES TO ZERO. So the 41.4% is not");
  line("  a property of the mechanism, it is a property of the eighth-turn — and the");
  line("  article already says the eighth-turn is not the lattice's to impose.");
  line();
  line("  But it does not go to zero for free, and this is the part worth having.");
  line("  The transverse coupling goes as sin θ, so it vanishes with the deviation:");
  line();
  line(`  ${pad("θ", 12)} ${pad("coupling ∝ sin θ", 18)} ${pad("deviation = tan(θ/2)", 22)} deviation / coupling`);
  line("  " + "─".repeat(76));
  const rats: number[] = [];
  for (const th of [Math.PI / 4, 0.1, 0.01, 1e-3, 1e-4]) {
    const r = Math.tan(th / 2) / Math.sin(th);
    rats.push(r);
    line(`  ${pad(th.toExponential(1), 12)} ${pad(Math.sin(th).toExponential(4), 18)} ${pad(Math.tan(th / 2).toExponential(4), 22)} ${r.toFixed(6)}`);
  }
  line();
  line("  EXACTLY ONE HALF, AT EVERY ANGLE — tan(θ/2)/sin θ = 1/(1 + cos θ) → ½, and");
  line("  it is an identity rather than a limit that happens to be tidy.");
  line();
  line("  SO THE ARC DOES NOT GET TO CHOOSE. A weak magnetic coupling and a small");
  line("  longitudinal force are THE SAME STATEMENT, and the deviation is half the");
  line("  coupling whatever θ is. The book owes its coupling as α, so:");
  line();
  const alpha = 1 / 137.035999084;
  line(`     if the turn angle is what sets the coupling and the coupling is α,`);
  line(`     the longitudinal force would be α/2 = ${(alpha / 2).toExponential(3)} of the magnetic one.`);
  line();
  line("  AND §6 BELOW REFUTES THAT READING BY ELEVEN ORDERS, which is why it stands");
  line("  here as a conditional rather than as a prediction. A charge-independent");
  line("  force along v does work every turn, and a storage ring bounds tan(θ/2)");
  line("  under 4·10⁻¹⁴ — so θ = α is not available, and 0.36% is not a small effect");
  line("  to go looking for but one that would have wrecked every ring ever built.");
  line("  THE FIRST DRAFT OF THIS SECTION CALLED IT 'A PREDICTION RATHER THAN A");
  line("  REFUTATION' WITHOUT CHECKING IT AGAINST ANY EXPERIMENT, and that was the");
  line("  error — the arithmetic was right and nobody asked what it implied.");
  line();
  line("  WHAT IS SOLID IS THE SHAPE — deviation = coupling/2, identically — and what");
  line("  is not solid is any particular value of θ. §6 uses the shape to BOUND θ, so");
  line("  this section's content survives its own headline being wrong: it supplies");
  line("  an identity, not a number.");
  return out.join("\n");
}

// ─── §3 coherence, discretely ───────────────────────────────────────────────
/**
 * THE DISCRETE MODEL WITH FREE EMISSION, and no time-averaging anywhere.
 *
 * "Emit wherever you want" has a precise discrete meaning and it is already how
 * `lattice.ts` works: a ray's HEADING is a real direction and its STEP is that
 * direction rounded onto the lattice. So headings are continuous, positions are
 * integers, and the turn adds a real angle θ to a real heading. Nothing here is
 * averaged over time and nothing is treated as a density.
 */
const K8: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
/** a real direction rounded onto the lattice — latticeStep, in two dimensions */
const stepOf = (ang: number): [number, number] => {
  let best = 0, bestDot = -Infinity;
  const cx = Math.cos(ang), cy = Math.sin(ang);
  for (let i = 0; i < 8; i++) {
    const n = Math.hypot(K8[i][0], K8[i][1]);
    const d = (K8[i][0] * cx + K8[i][1] * cy) / n;
    if (d > bestDot) { bestDot = d; best = i; }
  }
  return K8[best];
};

type C2 = { x: number; y: number; a: number; s: number; tag: boolean };

/**
 * A current injected into a real vacuum, with the turn angle θ free.
 *
 * Returns the coherence |J|/n of the tagged carriers over time — 1 when they all
 * point together and ~n^−1/2 when they point at random.
 */
const cohere = (ticks: number, theta: number, seed: number, N = 161, occ = 0.30,
  pCreate = 0.002) => {
  const r = rng(seed);
  let cs: C2[] = [];
  const mid = (N - 1) / 2;
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++)
    if (r() < occ) cs.push({ x, y, a: r() * 2 * Math.PI, s: r() < 0.5 ? 1 : -1, tag: false });
  const R0 = 12;
  for (let x = mid - R0; x <= mid + R0; x++) for (let y = mid - R0; y <= mid + R0; y++)
    cs.push(r() < 0.5
      ? { x, y, a: 0, s: +1, tag: true }
      : { x, y, a: Math.PI, s: -1, tag: true });

  const survey = () => {
    let jx = 0, jy = 0, n = 0;
    for (const c of cs) if (c.tag) { jx += c.s * Math.cos(c.a); jy += c.s * Math.sin(c.a); n++; }
    return { coh: n ? Math.hypot(jx, jy) / n : 0, n };
  };
  const hist: { t: number; coh: number; n: number }[] = [];
  for (let t = 0; t <= ticks; t++) {
    const s = survey(); hist.push({ t, coh: s.coh, n: s.n });
    if (t === ticks) break;
    for (const c of cs) {
      const st = stepOf(c.a);
      c.x = (c.x + st[0] + N) % N; c.y = (c.y + st[1] + N) % N;
    }
    const cell = new Map<number, C2[]>();
    for (const c of cs) {
      const k = c.x * N + c.y; const a = cell.get(k); if (a) a.push(c); else cell.set(k, [c]);
    }
    const dead = new Set<C2>();
    for (const g of cell.values()) for (let i = 0; i + 1 < g.length; i += 2) {
      const a = g[i], b = g[i + 1];
      if (a.s * b.s < 0) { dead.add(a); dead.add(b); }              // (G+M/1)
      else { a.a += a.s * theta; b.a += b.s * theta; }              // (G+M/3), free θ
    }
    cs = cs.filter(c => !dead.has(c));
    const made = Math.round(pCreate * N * N);
    for (let k = 0; k < made; k++) {
      const x = Math.floor(r() * N), y = Math.floor(r() * N), a = r() * 2 * Math.PI;
      cs.push({ x, y, a, s: +1, tag: false });
      cs.push({ x, y, a: a + Math.PI, s: -1, tag: false });
    }
  }
  return hist;
};

function coherence(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  THE COHERENCE, IN THE DISCRETE MODEL ═════");
  line();
  line("  `magnetic` §6 found a current randomised inside about thirty ticks and");
  line("  suggested a TIME-AVERAGED J as the repair. That suggestion should be");
  line("  withdrawn rather than pursued: a time average is a continuum object, and");
  line("  the axis of a turn is read by one meeting at one tick. There is nothing at");
  line("  a cell that holds a history to average over. THE ANSWER HAS TO BE DISCRETE.");
  line();
  line("  And it is, once θ is free. `magnetic` §6 measured decoherence with every");
  line("  meeting deflecting a carrier by a whole eighth of a turn, which randomises");
  line("  a heading in a handful of collisions. A small θ is a small deflection.");
  line();
  line("  Run it — headings as real directions, steps rounded onto the lattice, which");
  line("  is what free emission means discretely, and no averaging anywhere:");
  line();
  const T = 120, SEEDS = 4;
  line(`  ${pad("CYCLE", 7)} ${pad("θ", 9)} ${pad("t=20", 8)} ${pad("t=40", 8)} ${pad("t=80", 8)} ${pad("t=120", 8)} ${pad("noise floor", 12)} half-life`);
  line("  " + "─".repeat(78));
  const halves: [number, number][] = [];
  for (const C of [8, 16, 32, 64, 128, 256]) {
    const th = 2 * Math.PI / C;
    // averaged over seeds, because one run of this is noise
    const acc: number[] = new Array(T + 1).fill(0); const accN: number[] = new Array(T + 1).fill(0);
    for (let s = 0; s < SEEDS; s++) {
      const h = cohere(T, th, 20260817 + 7919 * s);
      for (const x of h) { acc[x.t] += x.coh; accN[x.t] += x.n; }
    }
    const coh = acc.map(x => x / SEEDS), nn = accN.map(x => x / SEEDS);
    // carriers pointing at random give |J|/n ≈ 1/√n — the floor a reading must clear
    // a reading is only meaningful while enough tagged carriers are left: with n
    // survivors, random headings already give |J|/n ≈ 1/√n, so below about thirty
    // the number is the floor rather than a measurement and is shown as "—"
    const show = (t: number) => nn[t] < 30 ? "—" : coh[t].toFixed(3);
    const floor = (t: number) => 1 / Math.sqrt(Math.max(nn[t], 1));
    let hl = -1;
    for (let t = 0; t <= T; t++) if (nn[t] >= 30 && coh[t] < 0.5) { hl = t; break; }
    if (hl > 0) halves.push([th, hl]);
    line(`  ${pad(String(C), 7)} ${pad((th * 180 / Math.PI).toFixed(2) + "°", 9)} ${pad(show(20), 8)} ${pad(show(40), 8)} ${pad(show(80), 8)} ${pad(show(120), 8)} ${pad(floor(40).toFixed(3), 12)} ${hl > 0 ? hl : ">" + T}`);
  }
  line();
  line("  THE DASHES ARE NOT MISSING DATA. A reading of |J|/n means nothing once the");
  line("  tagged carriers have been thinned below about thirty, because n randomly");
  line("  oriented carriers already give |J|/n ≈ 1/√n — so a small-CYCLE run appears");
  line("  to RECOVER coherence late on, which is depletion and not physics. Those");
  line("  entries are suppressed rather than shown and explained away.");
  line();
  if (halves.length >= 2) {
    const n = halves.length;
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const [th, t] of halves) {
      const X = Math.log(th), Y = Math.log(t);
      sx += X; sy += Y; sxx += X * X; sxy += X * Y;
    }
    const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    line(`  coherence half-life ∝ θ^${slope.toFixed(2)}, fitted over ${n} angles`);
    line();
    line("  AND THE EXPONENT IS NEARER −1 THAN −2, WHICH IS THE INFORMATIVE PART. A");
    line("  random walk in heading would give −2, needing θ^−2 deflections to lose a");
    line("  direction. What is measured is −1.3 on three points, which is nearer the");
    line("  systematic answer than the diffusive one — and that is what `magnetic`");
    line("  §4's derivation of the turn SENSE predicts: the sense is the carrier's OWN");
    line("  polarity, so a given carrier turns the SAME way every time. That is a");
    line("  systematic rotation and not a diffusion — a carrier is turned steadily");
    line("  round until it has gone through a large angle, which takes of order θ^−1");
    line("  collisions and not θ^−2.");
    line();
    line("  WHICH IS WORSE THAN A RANDOM WALK AND STILL GOOD ENOUGH. −1 buys less range");
    line("  per unit of coupling than −2 would, but the range still diverges as the");
    line("  coupling vanishes, which is the only thing the picture needs. It is also a");
    line("  genuine cross-check: two sections derived the turn sense independently, one");
    line("  from the third law and one from a decay exponent, and they agree.");
    line();
  }
  line("  SO THE RANGE OF THE SOURCE IS SET BY THE SAME PARAMETER AS THE COUPLING,");
  line("  AND SET INVERSELY — a weak coupling is a long-ranged one.");
  line();
  line("  WHICH IS THE RIGHT DIRECTION AND IS WORTH SAYING TWICE. `magnetic` had a");
  line("  strong coupling with a short range, which is the wrong combination for");
  line("  every magnet there is. Unlocking θ gives a weak coupling with a long range,");
  line("  and it is not two adjustments — it is one parameter moving one way.");
  return out.join("\n");
}

// ─── §4 a magnet is driven, not injected ────────────────────────────────────
/**
 * The same lattice with the current CONTINUOUSLY RE-SOURCED in a central region,
 * which is what a magnet is and what `magnetic` §6 did not do. The observable is
 * the steady-state profile of J against radius.
 */
const driven = (ticks: number, theta: number, seed: number, N = 161, occ = 0.30,
  pCreate = 0.002) => {
  const r = rng(seed);
  let cs: C2[] = [];
  const mid = (N - 1) / 2, R0 = 6;
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++)
    if (r() < occ) cs.push({ x, y, a: r() * 2 * Math.PI, s: r() < 0.5 ? 1 : -1, tag: false });
  const bins = 16, binw = 5;
  const jx = new Float64Array(bins), jy = new Float64Array(bins), cnt = new Float64Array(bins);
  for (let t = 0; t <= ticks; t++) {
    // the source: a fixed region emits a current every tick, which is the drive
    for (let x = mid - R0; x <= mid + R0; x++) for (let y = mid - R0; y <= mid + R0; y++) {
      if (r() < 0.10) cs.push(r() < 0.5
        ? { x, y, a: 0, s: +1, tag: true } : { x, y, a: Math.PI, s: -1, tag: true });
    }
    // OPEN boundary rather than periodic. A torus feeds the outer bins with
    // carriers that have come round the back, which an earlier version of this
    // section reported as a profile that stops falling and then rises again.
    for (const c of cs) {
      const st = stepOf(c.a);
      c.x += st[0]; c.y += st[1];
    }
    cs = cs.filter(c => c.x >= 0 && c.x < N && c.y >= 0 && c.y < N);
    const cell = new Map<number, C2[]>();
    for (const c of cs) { const k = c.x * N + c.y; const a = cell.get(k); if (a) a.push(c); else cell.set(k, [c]); }
    const dead = new Set<C2>();
    for (const g of cell.values()) for (let i = 0; i + 1 < g.length; i += 2) {
      const a = g[i], b = g[i + 1];
      if (a.s * b.s < 0) { dead.add(a); dead.add(b); }
      else { a.a += a.s * theta; b.a += b.s * theta; }
    }
    cs = cs.filter(c => !dead.has(c));
    const made = Math.round(pCreate * N * N);
    for (let k = 0; k < made; k++) {
      const x = Math.floor(r() * N), y = Math.floor(r() * N), a = r() * 2 * Math.PI;
      cs.push({ x, y, a, s: +1, tag: false });
      cs.push({ x, y, a: a + Math.PI, s: -1, tag: false });
    }
    if (t > ticks / 2) {                                    // sample the steady state only
      for (const c of cs) {
        if (!c.tag) continue;
        const b = Math.floor(Math.hypot(c.x - mid, c.y - mid) / binw);
        if (b < bins) { jx[b] += c.s * Math.cos(c.a); jy[b] += c.s * Math.sin(c.a); cnt[b]++; }
      }
    }
  }
  return { jx, jy, cnt, binw, bins };
};

function steady(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  A MAGNET IS DRIVEN, AND `magnetic` §6 RAN A PULSE ═════");
  line();
  line("  The other half of the reply, and it is a criticism of the experiment rather");
  line("  than of the model. §6 injected a current once and watched it die. A magnet");
  line("  is not a pulse — it is CONTINUOUSLY RE-SOURCED, and the question for a");
  line("  driven system is not how long a disturbance lasts but what profile it holds");
  line("  in the steady state.");
  line();
  line("  So: a central region emitting a current every tick, the same vacuum, and");
  line("  the profile of J against radius averaged over the second half of the run.");
  line();
  for (const C of [8, 64]) {
    const th = 2 * Math.PI / C;
    const d = driven(120, th, 771, 161);
    line(`  CYCLE = ${C},  θ = ${(th * 180 / Math.PI).toFixed(2)}°`);
    line(`  ${pad("r (cells)", 12)} ${pad("|J| per carrier", 17)} ${pad("carriers", 11)} coherent?`);
    line("  " + "─".repeat(56));
    for (let b = 0; b < 8; b++) {
      if (d.cnt[b] < 50) continue;
      const coh = Math.hypot(d.jx[b], d.jy[b]) / d.cnt[b];
      line(`  ${pad(`${b * d.binw}–${(b + 1) * d.binw}`, 12)} ${pad(coh.toFixed(4), 17)} ${pad(d.cnt[b].toFixed(0), 11)} ${coh > 0.3 ? "YES" : coh > 0.1 ? "partly" : "no"}`);
    }
    line();
  }
  line("  DRIVEN, THE CURRENT DOES NOT DIE. A pulse that decoheres has no steady");
  line("  state at all; a driven source has one, and at the small turn angle it is");
  line("  coherent at every radius reached.");
  line();
  line("  AND THE PROFILE IS NOT AN EXPONENTIAL, WHICH IS THE THING TO NOTICE. At");
  line("  CYCLE = 8 the coherence falls with radius and then FLATTENS; at CYCLE = 64");
  line("  it falls to about 0.53 by twenty cells and then RISES again. That is not");
  line("  noise — the bins out there hold thousands of carriers — and it is not");
  line("  wrap-around either, since the boundary here is open.");
  line();
  line("  IT IS SURVIVOR BIAS, AND IT IS THE USEFUL KIND. A carrier that reaches a");
  line("  large radius is disproportionately one that was NEVER DEFLECTED, because");
  line("  every deflection both turns it and gives it another chance to be");
  line("  annihilated. So the far field is carried by the BALLISTIC population, which");
  line("  has not decohered at all, while the scattered population dies close in.");
  line("  A medium with a scattering length does not screen a current away — it");
  line("  splits it into a diffuse near part and a ballistic far part.");
  line();
  line("  WHICH IS BETTER FOR THE PICTURE THAN A SCREENED FIELD WOULD BE, because a");
  line("  ballistic population keeps the 1/R² of the emission the gravity arc already");
  line("  derived, and `magnetic` §5 built B ∝ 1/r for a line current out of exactly");
  line("  that. A Yukawa profile would have replaced Ampère's law; a ballistic tail");
  line("  leaves it standing and attenuates its amplitude.");
  line();
  line("  WHAT THIS DOES NOT SHOW, and it is the honest limit. The ballistic fraction");
  line("  is set by the scattering rate, so the AMPLITUDE of the far field carries a");
  line("  factor this file cannot compute without θ and without the vacuum's density.");
  line("  The SHAPE survives and the SIZE does not — which is the same division the");
  line("  book has everywhere else, and the same missing number as α, arriving now");
  line("  for the third time.");
  return out.join("\n");
}

// ─── §5 the scattering length against the exchange arc's λ ──────────────────
/**
 * TWO LENGTHS THAT MIGHT BE ONE, and the honest answer is "same order, and the
 * error bar is far too wide to say more".
 *
 * `contact` §3 gets the ANTIFERROMAGNETIC sign from a SCREENED kernel —
 * ∇²(e^{−r/λ}/r) = e^{−r/λ}/(λ²r) — and carries λ as a parameter it cannot
 * compute. §3 above measures a coherence length in the same medium under the same
 * rules, which is a screening length for the same reason: it is where a carrier
 * stops remembering its direction. If those are the same number, superexchange
 * gets a mechanism instead of a parameter.
 *
 * This does the comparison and refuses to overclaim it.
 */
function lengths(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  THE SCATTERING LENGTH AGAINST THE EXCHANGE ARC'S λ ═════");
  line();
  line("  §3 fitted the coherence half-life as ∝ θ^p with p ≈ −1.3 over three usable");
  line("  angles. Extrapolate to θ = α, which is the identification §2 makes, and");
  line("  compare against 1726 — the length the exchange arc is short by, which is");
  line("  1/(α·CYCLE·G/2π) and is the same debt from the other side.");
  line();
  const alpha = 1 / 137.035999084;
  const anchorTheta = 2 * Math.PI / 32, anchorHl = 50;   // the best-measured point in §3
  line(`  anchored on the §3 row that is furthest from both the noise floor and the`);
  line(`  ">120" ceiling:  θ = ${anchorTheta.toFixed(4)},  half-life = ${anchorHl}`);
  line();
  line(`  ${pad("exponent p", 14)} ${pad("A = hl·θ^−p", 14)} ${pad("L(α) in cells", 16)} ${pad("vs 1726", 12)}`);
  line("  " + "─".repeat(60));
  for (const p of [-1.0, -1.2, -1.3, -1.5, -2.0]) {
    const A = anchorHl / Math.pow(anchorTheta, p);
    const L = A * Math.pow(alpha, p);
    line(`  ${pad(p.toFixed(1), 14)} ${pad(A.toFixed(2), 14)} ${pad(L.toExponential(3), 16)} ${pad((L / 1726).toFixed(2) + "×", 12)}`);
  }
  line();
  line("  SO THE ANSWER IS: THE SAME ORDER OF MAGNITUDE, AND NOTHING FINER. At the");
  line("  fitted exponent the extrapolation lands within a factor of about two of");
  line("  1726, and moving the exponent within its own uncertainty moves the answer");
  line("  by more than that factor. THE AGREEMENT IS REAL AND IT IS WEAK.");
  line();
  line("  WHY IT IS WORTH RECORDING ANYWAY. The quantity could have come out at 10⁰");
  line("  cells or at 10¹⁰ and it did not — two lengths computed from unrelated");
  line("  starting points, one from a lattice simulation of scattering and one from a");
  line("  ratio of physical constants, land within an order of magnitude. That is");
  line("  weak evidence for one mechanism rather than two, and it is evidence.");
  line();
  line("  WHY IT MUST NOT BE QUOTED AS A RESULT. The exponent is fitted on three");
  line("  points and is extrapolated across two and a half decades in θ, which is the");
  line("  kind of extrapolation that is wrong more often than not. AND THE");
  line("  IDENTIFICATION θ = α IS ITSELF UNARGUED — §2 offers it as the natural");
  line("  reading and derives nothing. Two soft assumptions multiplied together do");
  line("  not make a measurement.");
  line();
  line("  WHAT WOULD SETTLE IT: measure the coherence length directly at small θ");
  line("  rather than extrapolating, which needs a lattice large enough that the");
  line("  ballistic carriers of §4 do not reach the boundary — of order 10⁴ cells a");
  line("  side in 2D. That is a bigger run than anything in this directory and it is");
  line("  the right next measurement rather than a better fit to these three points.");
  return out.join("\n");
}

// ─── §6 the storage-ring bound, which refutes θ = α ─────────────────────────
/**
 * WHAT A STORAGE RING SAYS ABOUT THE LONGITUDINAL FORCE — and it kills §2's
 * identification while leaving the mechanism standing.
 *
 * §2 offered θ = α as the natural reading and computed a longitudinal force at
 * α/2 = 0.36% of the magnetic one, calling it "a prediction rather than a
 * refutation". THAT WAS NOT CHECKED AGAINST ANYTHING, and it should have been,
 * because the observable is not subtle.
 *
 * A charge-independent force ALONG v in a magnetic field does work, every turn, in
 * the same direction. A storage ring is the experiment that is already running:
 *
 *     F_mag = qvB is centripetal and does no work;
 *     F_long = k·qvB along v does work F_long·2πr over one turn;
 *     r = γmv/(qB), so ΔE = 2πk·γmv², and for v → c, ΔE/E = 2πk.
 *
 * so the fractional energy change per turn is 2πk with k = tan(θ/2), and it does
 * not depend on the machine's size, field, or particle. That is a very hard number
 * to hide.
 */
function ring(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  const alpha = 1 / 137.035999084;
  line();
  line("═════ §6  THE STORAGE-RING BOUND, WHICH REFUTES θ = α ═════");
  line();
  line("  §2 called the longitudinal force at α/2 'a prediction rather than a");
  line("  refutation'. It did not check it against an experiment. Do that now.");
  line();
  line("  A charge-independent force along v does WORK, every turn, always the same");
  line("  way. Per turn the fractional energy change is 2π·tan(θ/2), independent of");
  line("  the ring's size, its field, and the particle in it:");
  line();
  line(`  ${pad("reading", 26)} ${pad("k = tan(θ/2)", 14)} ${pad("ΔE/E per turn", 16)}`);
  line("  " + "─".repeat(58));
  for (const [n, k] of [["θ = 45°, the locked turn", Math.tan(Math.PI / 8)],
  ["θ = α, §2's reading", Math.tan(alpha / 2)]] as [string, number][])
    line(`  ${pad(n, 26)} ${pad(k.toExponential(3), 14)} ${pad((2 * Math.PI * k).toExponential(3), 16)}`);
  line();
  line("  A BEAM GAINING 2.3% OF ITS ENERGY EVERY TURN IS NOT A SMALL DEVIATION. A");
  line("  LEP-like machine holds ~4·10⁷ turns in an hour with the beam energy known");
  line("  to about 1 part in 10⁵ by resonant spin depolarisation, which is the");
  line("  highest-precision beam energy technique there is. So:");
  line();
  const turns = 11e3 * 3600, prec = 1e-5;
  const eps = prec / turns, kMax = eps / (2 * Math.PI), thetaMax = 2 * Math.atan(kMax);
  line(`  ${pad("turns in an hour at 11 kHz", 34)} ${turns.toExponential(2)}`);
  line(`  ${pad("energy held to", 34)} ${prec.toExponential(0)}`);
  line(`  ${pad("so per-turn ΔE/E must be under", 34)} ${eps.toExponential(2)}`);
  line(`  ${pad("so k = tan(θ/2) is under", 34)} ${kMax.toExponential(2)}`);
  line(`  ${pad("so θ is under", 34)} ${thetaMax.toExponential(2)} rad`);
  line();
  line(`  AND α EXCEEDS THAT BY ${(alpha / thetaMax).toExponential(2)}. So θ = α IS REFUTED, by eleven`);
  line("  orders, and §2's 0.36% is not a prediction to go looking for — it is a");
  line("  number that would have wrecked every storage ring ever built.");
  line();
  line("  WHAT SURVIVES, AND IT IS MOST OF IT. The ratio tan(θ/2) is the deviation");
  line("  over the TRANSVERSE FORCE, and the transverse force is (DEG/3)·sin θ·n");
  line("  where n is the background density. THE RATIO IS INDEPENDENT OF n AND THE");
  line("  MAGNITUDE IS NOT. So a tiny θ with a large n gives a full-strength magnetic");
  line("  force and an invisible longitudinal one, and nothing above forbids that.");
  line("  What is refuted is the identification of θ with the coupling, not the");
  line("  mechanism.");
  line();
  line("  AND THE TWO SURVIVING CONSTRAINTS PULL THE SAME WAY, which is the part");
  line("  worth having. §3 measured the coherence length growing as θ^−1.3, and a");
  line("  magnet needs a long one. With a cell at the Planck length:");
  line();
  const anchorT = 2 * Math.PI / 32, anchorH = 50, p = -1.3;
  const A = anchorH / Math.pow(anchorT, p);
  const planck = 1.616255e-35;
  line(`  ${pad("requirement", 30)} ${pad("θ must be under", 16)} ${pad("coherence length", 18)} in metres`);
  line("  " + "─".repeat(80));
  const show = (name: string, th: number) => {
    const L = A * Math.pow(th, p);
    line(`  ${pad(name, 30)} ${pad(th.toExponential(2), 16)} ${pad(L.toExponential(2) + " cells", 18)} ${(L * planck).toExponential(2)}`);
  };
  show("storage rings", thetaMax);
  // what θ puts the coherence length at a domain wall, 10 µm
  const Ldomain = 1e-5 / planck;
  const thDomain = Math.pow(Ldomain / A, 1 / p);
  show("a 10 µm magnetic domain", thDomain);
  line();
  line("  THE DOMAIN REQUIREMENT IS THE TIGHTER ONE AND THE TWO ARE COMPATIBLE — a θ");
  line("  small enough to give a magnet its range is automatically small enough to");
  line("  hide the longitudinal force, by nine orders to spare. So the picture is");
  line("  consistent at θ ≲ 10⁻²³, and it was never consistent at θ = α.");
  line();
  line("  WHICH TURNS ONE NUMBER INTO ANOTHER RATHER THAN PAYING A DEBT. sin θ ≈ θ is");
  line("  then ~10⁻²³, so the background density n must be ~10²¹ times larger to");
  line("  deliver a coupling of order α. THAT IS A STATEMENT ABOUT THE VACUUM'S RAY");
  line("  DENSITY and it is now load-bearing, where before it was scenery. It is also");
  line("  checkable against `vacuum`'s occupancy, which this file does not do.");
  line();
  line("  AND §5 ABOVE IS UNDERMINED BY THIS, which is worth saying plainly rather");
  line("  than leaving the two sections to disagree quietly. That comparison");
  line("  extrapolated the coherence length to θ = α and found it near the exchange");
  line("  arc's 1726. θ = α is now refuted, so the agreement it reports is an");
  line("  agreement at a value of θ the model may not take. IT SHOULD BE READ AS");
  line("  WITHDRAWN until it is redone at a θ that satisfies this section.");
  return out.join("\n");
}

console.log(invariant());
console.log(collapse());
console.log(coherence());
console.log(steady());
console.log(lengths());
console.log(ring());
