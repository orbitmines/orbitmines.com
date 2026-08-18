/**
 * TWO WIRES — the magnetic force itself, without constructing a field, and with
 * BOTH channels rather than one.
 *
 * The first version of this file counted annihilations between the wires against
 * annihilations outside them, and reported parallel currents attracting at a
 * ratio of 1.1146 against an inert control's 1.0112, with antiparallel at 1.0043
 * — an attraction and no repulsion. `push` then found out why every force test in
 * this arc read that way, and the fault is in the measure and not in the model:
 *
 *   AN ANNIHILATION COUNT IS STRUCTURALLY BLIND TO (G+M/3). Annihilation is the
 *   one rule that DESTROYS rays. Whatever turning does to a ray, it does not
 *   destroy it — so a density of annihilations can only ever report a PULL, of
 *   some magnitude, for every configuration it is handed. The repulsion's whole
 *   content is that annihilation DIDN'T happen there, and a count of annihilation
 *   cannot see that.
 *
 * SO MEASURE MOMENTUM TOO. A wire absorbs the rays that arrive at it and is
 * pushed by what they carry. `signlaw` established the pair of channels and this
 * applies them to a current:
 *
 *   PUSH — the net x-momentum the LEFT wire absorbs per tick. The partner is at
 *   +x, so POSITIVE is an attraction and NEGATIVE is a repulsion. A LONE wire is
 *   the zero, and it must read nought by symmetry.
 *
 *   PULL — the annihilation asymmetry on a shell round the left wire, the half
 *   facing the partner minus the half facing away. Positive means space is being
 *   destroyed preferentially between them, which shortens the separation.
 *
 * AND THE MECHANISM SAYS WHAT TO EXPECT, which is the reason to run it. A wire
 * sets its +z exits to +1 and its −z exits to −1. Take the left wire's exit
 * (1,0,−1), which carries −1 and heads toward the partner, and the right wire's
 * (−1,0,+1), which heads back:
 *
 *   PARALLEL     — the right wire is the same sense, so its (−1,0,+1) carries +1.
 *                  Opposite signs, counter-propagating: (G+M/1) ANNIHILATES. The
 *                  gap is thinned, less arrives on the facing side, and the pair
 *                  is pushed together. PARALLEL CURRENTS ATTRACT.
 *
 *   ANTIPARALLEL — the right wire is reversed, so its (−1,0,+1) carries −1. Same
 *                  sign, counter-propagating: (G+M/3) TURNS. Nothing is destroyed,
 *                  the rays survive the crossing and land, and the pair is pushed
 *                  apart. ANTIPARALLEL CURRENTS REPEL.
 *
 * Which is the same XOR as the charges — opposite annihilates and alike does not
 * — arriving at Ampère's force law instead of Coulomb's, off the same two rules
 * and with nothing added.
 *
 *   §1  both channels, against a lone wire, parallel and antiparallel
 *   §2  the two channels against separation, since they need not share a range
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
const ALONG: number[] = [], AGAINST: number[] = [];
for (let d = 0; d < DEG; d++) { if (D[d][2] > 0) ALONG.push(d); if (D[d][2] < 0) AGAINST.push(d); }

const N = 45, C = 22, CELLS = N * N * N;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;
const DIR = new Map<string, number>();
D.forEach((v, i) => DIR.set(v.join(","), i));

/** the article's SPIN — a 45° turn of a direction inside one coordinate plane */
const clamp = (v: number) => v > 0 ? 1 : v < 0 ? -1 : 0;
const spin = (d: number, plane: number) => {
  const [x, y, z] = D[d];
  let w: [number, number, number];
  if (plane === 0) w = [clamp(x - y), clamp(x + y), z];
  else if (plane === 1) w = [x, clamp(y - z), clamp(y + z)];
  else w = [clamp(z - x), y, clamp(z + x)];
  if (!w[0] && !w[1] && !w[2]) return d;
  return DIR.get(w.join(",")) ?? d;
};

type Turn = "noop" | "spin";
type Mode = "lone" | "parallel" | "anti" | "inert";

const run = (T: number, pCreate: number, mode: Mode, sep: number, turn: Turn, seed: number) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };

  // wire[c]: 1 = left wire (the one measured), 2 = right wire, 0 = vacuum
  // sense[c]: +1 current along +z, −1 along −z, 0 inert
  const wire = new Uint8Array(CELLS), sense = new Int8Array(CELLS);
  const xL = C - sep / 2, xR = C + sep / 2;
  for (let z = 3; z < N - 3; z++) {
    const l = idx(xL, C, z);
    wire[l] = 1; sense[l] = (mode === "inert" ? 0 : 1) as any;
    if (mode !== "lone") {
      const r = idx(xR, C, z);
      wire[r] = 2; sense[r] = (mode === "inert" ? 0 : mode === "parallel" ? 1 : -1) as any;
    }
  }

  const pol = new Int8Array(CELLS * DEG), nxt = new Int8Array(CELLS * DEG);
  const ann = new Float64Array(CELLS);
  let px = 0, samples = 0;

  for (let t = 0; t < T; t++) {
    // (G+M/2) — a neutral point expands into an opposite pair
    for (let c = 0; c < CELLS; c++) {
      if (wire[c]) continue;
      let neutral = true;
      for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) { neutral = false; break; }
      if (!neutral || rnd() > pCreate) continue;
      const s = rnd() < 0.5 ? 1 : -1;
      for (const a of AX) { pol[c * DEG + a] = s as any; pol[c * DEG + OPP[a]] = -s as any; }
    }

    // stream
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

    /*
     * THE PUSH CHANNEL, read on the LEFT wire before it overwrites its own cells.
     * A ray arriving along d delivers momentum D[d]; sum the x-component.
     *
     * The wire's own emission carries no net x-momentum and so needs no
     * correction: it emits on every exit with z > 0 and every exit with z < 0,
     * and both of those sets are symmetric under x → −x, so Σ D[d]ₓ over what it
     * emits is identically nought. A LONE wire must therefore read zero, and that
     * is what makes the other rows absolute rather than relative.
     */
    if (t > T * 0.5) {
      for (let c = 0; c < CELLS; c++) {
        if (wire[c] !== 1) continue;
        for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) px += D[d][0];
      }
      samples++;
    }

    // the wires overwrite their own cells: absorbed, then the current injected
    for (let c = 0; c < CELLS; c++) {
      if (!wire[c]) continue;
      for (let d = 0; d < DEG; d++) pol[c * DEG + d] = 0;
      const w = sense[c];
      if (!w) continue;                                   // inert: absorbs, emits nothing
      for (const d of ALONG) pol[c * DEG + d] = w as any;
      for (const d of AGAINST) pol[c * DEG + d] = -w as any;
    }

    // (G+M/1) annihilation and (G+M/3) turning
    for (let c = 0; c < CELLS; c++) {
      if (wire[c]) continue;
      for (const a of AX) {
        const p = pol[c * DEG + a], q = pol[c * DEG + OPP[a]];
        if (!p || !q) continue;
        if (p === q) {
          if (turn === "spin") {
            const pl = (rnd() * 3) | 0;
            const a2 = spin(a, pl), b2 = spin(OPP[a], pl);
            if (a2 !== a && !pol[c * DEG + a2] && !pol[c * DEG + b2]) {
              pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0;
              pol[c * DEG + a2] = p; pol[c * DEG + b2] = q;
            }
          }
          // "noop": alike rays pass straight through, which is what the swap did
        } else {
          pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0;
          if (t > T * 0.5) ann[c]++;
        }
      }
    }
  }
  return { px: px / Math.max(samples, 1), ann, samples };
};

/**
 * THE PULL CHANNEL. Annihilations on a cylindrical shell round the LEFT wire,
 * the half facing the partner minus the half facing away. Positive means space is
 * destroyed preferentially between the two, which shortens the separation.
 */
const pull = (ann: Float64Array, s: number, sep: number) => {
  const xL = C - sep / 2;
  let tow = 0, twN = 0, awy = 0, awN = 0;
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 8; z < N - 8; z++) {
    const dx = x - xL, dy = y - C;
    const r = Math.hypot(dx, dy);
    if (r < 2 || r > 4 || Math.abs(dx) < 0.7 * r) continue;
    const c = idx(x, y, z);
    if (dx > 0) { tow += ann[c] / s; twN++; } else { awy += ann[c] / s; awN++; }
  }
  return tow / Math.max(twN, 1) - awy / Math.max(awN, 1);
};

const T = 500, PCR = 0.03;
const SEEDS = [20260817, 777333, 424242, 909090, 5150, 31337];

const stat = (v: number[]) => {
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  const s = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(v.length - 1, 1));
  return { m, err: s / Math.sqrt(v.length) };
};
const both = (turn: Turn, mode: Mode, sep: number) => {
  const p: number[] = [], q: number[] = [];
  for (const sd of SEEDS) {
    const r = run(T, PCR, mode, sep, turn, sd);
    p.push(r.px); q.push(pull(r.ann, r.samples, sep));
  }
  return { push: stat(p), pull: stat(q) };
};
const fm = (r: { m: number, err: number }) =>
  pad(`${r.m >= 0 ? "+" : ""}${r.m.toExponential(3)} ± ${r.err.toExponential(1)}`, 21);

// ─── §1 ─────────────────────────────────────────────────────────────────────
console.log("═════ §1  AMPÈRE'S FORCE LAW, BOTH CHANNELS ═════");
console.log();
console.log(`  ${N}³, cubic 26, the three rules, ${SEEDS.length} seeds of ${T} ticks, separation 10.`);
console.log("  Each wire sets its +z exits to +1 and its −z exits to −1 every tick: as many");
console.log("  + as −, so NO NET CHARGE, and a polarity current along z.");
console.log();
console.log("  PUSH is the net x-momentum the LEFT wire absorbs per tick. The partner sits");
console.log("  at +x, so NEGATIVE IS A REPULSION. PULL is the annihilation asymmetry on a");
console.log("  shell round the left wire, facing minus away — POSITIVE DRAWS THEM IN.");
console.log("  A LONE wire is the zero for both and must read nought on the push.");
console.log();

const R: Record<string, Record<string, ReturnType<typeof both>>> = {};
for (const turn of ["noop", "spin"] as Turn[]) {
  console.log(`  ── (G+M/3) as \`${turn}\` ──`);
  console.log();
  console.log(`  ${pad("configuration", 14)} ${pad("PUSH  (momentum)", 21)} ${pad("PULL  (annihilation)", 21)}`);
  console.log("  " + "─".repeat(60));
  R[turn] = {};
  for (const mode of ["lone", "inert", "parallel", "anti"] as Mode[]) {
    const b = both(turn, mode, 10);
    R[turn][mode] = b;
    console.log(`  ${pad(mode, 14)} ${fm(b.push)} ${fm(b.pull)}`);
  }
  const par = R[turn]["parallel"], ant = R[turn]["anti"], lon = R[turn]["lone"];
  const dPush = ant.push.m - par.push.m, ePush = Math.hypot(ant.push.err, par.push.err);
  const dPull = par.pull.m - ant.pull.m, ePull = Math.hypot(par.pull.err, ant.pull.err);
  console.log();
  console.log(`    antiparallel pushed harder by ${Math.abs(dPush).toExponential(3)}  (${(Math.abs(dPush) / ePush).toFixed(1)}σ)`);
  console.log(`    parallel     pulled harder by ${dPull.toExponential(3)}  (${(Math.abs(dPull) / ePull).toFixed(1)}σ)`);
  console.log(`    lone push (must be ~0): ${lon.push.m.toExponential(3)}`);
  console.log();
}

console.log("  BOTH ORDERINGS MUST HOLD AT ONCE for Ampère's force law to be real, exactly");
console.log("  as for the charges: PARALLEL takes the larger share of the destroyed space");
console.log("  and ANTIPARALLEL takes the larger share of the momentum. Either alone is a");
console.log("  difference between two magnitudes of one thing.");
console.log();
{
  const par = R["noop"]["parallel"], ant = R["noop"]["anti"];
  const ok = ant.push.m < par.push.m && par.pull.m > ant.pull.m;
  console.log(ok
    ? "  THEY DO. Antiparallel currents are pushed apart harder and parallel ones have\n  more space destroyed between them — which is Ampère's force law, from a pair of\n  currents that carry no net charge at all, on a lattice, from the three rules."
    : "  THEY DO NOT BOTH HOLD at this box size, so the force law is not established\n  here and the rows above are what there is.");
}

// ─── §2 ─────────────────────────────────────────────────────────────────────
console.log();
console.log("═════ §2  THE TWO CHANNELS AGAINST SEPARATION ═════");
console.log();
console.log("  Nothing says the two channels share a range. If they do not, THE SIGN OF THE");
console.log("  NET FORCE BETWEEN TWO WIRES CHANGES WITH DISTANCE — which is a prediction of");
console.log("  the discrete model and not a term fitted to rescue it.");
console.log();
console.log(`  ${pad("sep", 5)} ${pad("par PUSH", 21)} ${pad("anti PUSH", 21)} ${pad("par PULL", 21)} ${pad("anti PULL", 21)}`);
console.log("  " + "─".repeat(92));
for (const sep of [6, 10, 14]) {
  const p = both("noop", "parallel", sep), a = both("noop", "anti", sep);
  console.log(`  ${pad(String(sep), 5)} ${fm(p.push)} ${fm(a.push)} ${fm(p.pull)} ${fm(a.pull)}`);
}
console.log();
console.log("  κ is the same coupling `signlaw` measured — a destroyed spatial point against");
console.log("  an absorbed ray — and it is not fixed by the lattice. What the rows above give");
console.log("  is the window in which Ampère's two signs both come out right.");
