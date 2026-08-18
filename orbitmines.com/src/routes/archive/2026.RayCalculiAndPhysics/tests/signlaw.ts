/**
 * THE SIGN LAW AS TWO CHANNELS — the pull and the push measured on the SAME body,
 * against a lone control.
 *
 * `push` §1 found the repulsion that every earlier test missed, and found it by
 * changing the measure rather than the configuration. The force there is the net
 * x-momentum a body ABSORBS, and it read
 *
 *     turn     lone        alike (+,+)   opposite (+,−)
 *     noop     +0.000e+0   −8.680e+0     −2.053e-2
 *     back     +0.000e+0   −8.680e+0     −2.053e-2
 *     spin     +0.000e+0   −7.746e-1     −1.337e-2
 *
 * with negative meaning pushed AWAY. Three things came out of it. A lone body
 * reads EXACTLY nought, which is not luck: its own emission contributes
 * Σ_d D[d]ₓ·|S ∩ (S+D[d])| and the overlap counts for d and −d are equal while
 * D[d]ₓ flips, so the self term cancels identically and only what arrives from
 * outside survives. `noop` and `back` agree to the last digit, which confirms
 * that A HALF-TURN OF TWO ALIKE RAYS IS UNOBSERVABLE — same field, same momentum,
 * so no force can come from it. And the repulsion turns out NOT to need the turn
 * at all:
 *
 *   ALIKE — the partner's rays carry the same sign as this body's own outgoing
 *   rays, so nothing annihilates between them, the partner's rays SURVIVE THE
 *   CROSSING and land, and their momentum pushes the body away.
 *
 *   OPPOSITE — the partner's rays carry the opposite sign, so they annihilate on
 *   the way over and almost nothing arrives. The push is 400× smaller.
 *
 * SO THERE ARE TWO CHANNELS AND THEY ARE DIFFERENT KINDS OF THING. Annihilation
 * between the bodies destroys spatial points, and destroying a point between two
 * bodies SHORTENS THE SEPARATION — a metric effect, the article's own account of
 * the pull, and what `charged`, `forces`, `wires` and `repel` were all counting.
 * Arrivals deliver momentum — a mechanical effect, the push, and one that no
 * annihilation count can see because its whole content is that annihilation did
 * NOT happen. Every force test in the arc measured the first channel only, which
 * is why every configuration ever run reported a pull of some magnitude and why
 * `repel`'s bias sweep found no push at any bias.
 *
 * THE SIGN LAW IS THE COMPETITION BETWEEN THEM, and it is XOR on which rule fires:
 *
 *              annihilation between   arrivals surviving      net
 *   opposite   HIGH  → strong pull    low → weak push         ATTRACT
 *   alike      low   → weak pull      HIGH → strong push      REPEL
 *
 * This file measures both on the same runs, each against a lone body, so the
 * signs are absolute and not a difference between two configurations.
 *
 *   §1  both channels, alike and opposite, against the lone control
 *   §2  against separation
 *
 * THE ONE THING IT CANNOT SETTLE is the relative weight. A destroyed point and an
 * absorbed ray are different quantities, and the net force is (arrivals) + κ·(points
 * destroyed) for some κ the lattice does not hand over. That κ is a coupling
 * constant, and where it sits decides the separation at which the two channels
 * balance. What the lattice DOES fix is that the two channels have opposite signs
 * and opposite orderings in the charge, which is the sign law, for any κ > 0.
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
const DIR = new Map<string, number>();
D.forEach((v, i) => DIR.set(v.join(","), i));

/**
 * A 45° rotation of a lattice direction inside one of the three coordinate
 * planes — the article's SPIN. In the xy-plane (x,y) → (x−y, x+y), which sends
 * (1,0,0) to (1,1,0) and (1,1,0) to (0,1,0) after clamping the doubled component
 * back to a single step; eight of the directions cycle through each other and the
 * axis of rotation is fixed. It is a rotation, so it commutes with negation:
 * a counter-propagating pair stays counter-propagating and the pair's momentum
 * stays nought. MOMENTUM IS CONSERVED BY THE TURN, which `sound` measured
 * exactly and which this must not break.
 */
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

type Turn = "noop" | "spin" | "back";

/**
 * `noop`  — what `repel` ran: the swap, which for alike rays changes nothing.
 * `spin`  — the article's 45°: the pair rotates out of the axis, together, so it
 *           stays a counter-propagating pair and carries no net momentum.
 * `back`  — an explicit 180°, written out to show it makes no difference to the
 *           field at all, which is the point about half-turns being unobservable.
 */
const run = (T: number, pCreate: number, sep: number, period: number,
  upL: number, upR: number, turn: Turn, lone: boolean, seed: number) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };

  const tag = new Uint8Array(CELLS);
  const bodies: [number, number][] = lone ? [[C - sep / 2, 1]] : [[C - sep / 2, 1], [C + sep / 2, 2]];
  for (const [x0, t] of bodies)
    for (let x = x0 - 2; x <= x0 + 2; x++) for (let y = C - 2; y <= C + 2; y++)
      for (let z = C - 2; z <= C + 2; z++)
        if (Math.hypot(x - x0, y - C, z - C) <= 2) tag[idx(x, y, z)] = t as any;

  const pol = new Int8Array(CELLS * DEG), nxt = new Int8Array(CELLS * DEG);
  const ann = new Float64Array(CELLS);
  let px = 0, samples = 0;

  const signAt = (t: number, offset: number, up: number) => {
    const ph = (((t + offset) % period) + period) % period;
    return ph < Math.abs(up) ? Math.sign(up) : -Math.sign(up);
  };

  for (let t = 0; t < T; t++) {
    // (G+M/2) creation — a neutral point expands into an opposite pair
    for (let c = 0; c < CELLS; c++) {
      if (tag[c]) continue;
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
     * THE MEASURE. Body 1 absorbs whatever arrived at it this tick, and a ray
     * travelling in direction d delivers momentum D[d]. Sum the x-component over
     * the body's cells: POSITIVE is a push toward +x, which is where the partner
     * is, so positive is an ATTRACTION and negative is a REPULSION.
     *
     * The body then re-emits the same sign in all 26 directions, and the 26
     * directions sum to nought, so emission contributes no recoil and needs no
     * correction. Only the arrivals carry a net.
     */
    if (t > T * 0.5) {
      for (let c = 0; c < CELLS; c++) {
        if (tag[c] !== 1) continue;
        for (let d = 0; d < DEG; d++) if (pol[c * DEG + d]) px += D[d][0];
      }
      samples++;
    }

    // the bodies overwrite their own cells: absorbed, then emitted
    const sL = signAt(t, 0, upL), sR = signAt(t, 0, upR);
    for (let c = 0; c < CELLS; c++) {
      const g = tag[c];
      if (!g) continue;
      const q = g === 1 ? sL : sR;
      for (let d = 0; d < DEG; d++) pol[c * DEG + d] = q as any;
    }

    // (G+M/1) annihilation and (G+M/3) turning
    for (let c = 0; c < CELLS; c++) {
      if (tag[c]) continue;
      for (const a of AX) {
        const p = pol[c * DEG + a], q = pol[c * DEG + OPP[a]];
        if (!p || !q) continue;
        if (p === q) {
          if (turn === "spin") {
            const pl = (rnd() * 3) | 0;                 // an unbiased plane, so the
            const a2 = spin(a, pl), b2 = spin(OPP[a], pl); // deflection is isotropic
            if (a2 !== a && !pol[c * DEG + a2] && !pol[c * DEG + b2]) {
              pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0;
              pol[c * DEG + a2] = p; pol[c * DEG + b2] = q;
            }
          } else if (turn === "back") {
            pol[c * DEG + a] = q; pol[c * DEG + OPP[a]] = p;
          }
          // "noop": leave them, which is what the swap amounts to
        } else {
          pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0;
          if (t > T * 0.5) ann[c]++;
        }
      }
    }
  }

  return { px: px / Math.max(samples, 1), ann, samples };
};

const T = 700, PCR = 0.03, PER = 12, UP = 10;   // dwell 10/12, so P = 2/3 exactly
const SEEDS = [20260817, 777333, 424242, 909090, 5150, 31337];

/**
 * THE PULL CHANNEL. Annihilations on a shell around the LEFT body, split into the
 * hemisphere facing the partner and the one facing away. Positive means space is
 * being destroyed preferentially BETWEEN the two bodies, which shortens the
 * separation — `repel`'s measure, kept exactly as it was so the two arcs compare.
 */
const pull = (ann: Float64Array, s: number, sep: number) => {
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

const stat = (v: number[]) => {
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  const s = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(v.length - 1, 1));
  return { m, err: s / Math.sqrt(v.length) };
};

const both = (turn: Turn, sep: number, upR: number, lone = false) => {
  const P: number[] = [], A: number[] = [];
  for (const sd of SEEDS) {
    const r = run(T, PCR, sep, PER, UP, upR, turn, lone, sd);
    P.push(r.px);
    A.push(pull(r.ann, r.samples, sep));
  }
  return { push: stat(P), pull: stat(A) };
};

const fm = (r: { m: number, err: number }, w = 21) =>
  pad(`${r.m >= 0 ? "+" : ""}${r.m.toExponential(3)} ± ${r.err.toExponential(1)}`, w);

console.log("═════ §1  BOTH CHANNELS, AGAINST A LONE BODY ═════");
console.log();
console.log("  45³, cubic 26, the three rules, dwell 10/12 so P = 2/3 exactly, separation 10.");
console.log();
console.log("  PUSH is the net x-momentum the left body absorbs per tick. The partner sits at");
console.log("  +x, so NEGATIVE IS A REPULSION.");
console.log("  PULL is the annihilation asymmetry on a shell round the left body, facing minus");
console.log("  away. POSITIVE MEANS SPACE IS DESTROYED BETWEEN THE TWO, which draws them in.");
console.log("  A lone body is the zero for both.");
console.log();
for (const turn of ["noop", "spin"] as Turn[]) {
  console.log(`  ── (G+M/3) as \`${turn}\` ──`);
  console.log(`  ${pad("config", 10)} ${pad("PUSH  (momentum)", 21)} ${pad("PULL  (annihilation)", 21)}`);
  const l = both(turn, 10, UP, true);
  const a = both(turn, 10, UP);
  const o = both(turn, 10, -UP);
  console.log(`  ${pad("lone", 10)} ${fm(l.push)} ${fm(l.pull)}`);
  console.log(`  ${pad("alike", 10)} ${fm(a.push)} ${fm(a.pull)}`);
  console.log(`  ${pad("opposite", 10)} ${fm(o.push)} ${fm(o.pull)}`);
  const dp = o.pull.m - a.pull.m, ep = Math.hypot(o.pull.err, a.pull.err);
  const ds = a.push.m - o.push.m, es = Math.hypot(a.push.err, o.push.err);
  console.log(`  ${pad("", 10)} alike pushed harder by ${Math.abs(ds).toExponential(3)} (${(Math.abs(ds) / es).toFixed(1)}σ),` +
    ` opposite pulled harder by ${dp.toExponential(3)} (${(Math.abs(dp) / ep).toFixed(1)}σ)`);
  console.log();
}
console.log("  BOTH ORDERINGS MUST HOLD AT ONCE for the sign law to be real: alike takes the");
console.log("  larger share of the momentum and opposite takes the larger share of the");
console.log("  destroyed space. Either one alone is only a difference in a magnitude.");

console.log();
console.log("═════ §2  AGAINST SEPARATION ═════");
console.log();
console.log(`  ${pad("sep", 5)} ${pad("alike PUSH", 21)} ${pad("opp PUSH", 21)} ${pad("alike PULL", 21)} ${pad("opp PULL", 21)}`);
console.log("  " + "─".repeat(92));
for (const sep of [6, 10, 14, 18]) {
  const a = both("noop", sep, UP);
  const o = both("noop", sep, -UP);
  console.log(`  ${pad(String(sep), 5)} ${fm(a.push)} ${fm(o.push)} ${fm(a.pull)} ${fm(o.pull)}`);
}
console.log();
console.log("  The push should fall off as the partner takes up less of the sky. The pull is");
console.log("  the channel `forces` found a CLIFF in at d ≈ 11, which it read as a screening");
console.log("  length — and if the push has a different range from the pull, THE SIGN OF THE");
console.log("  NET FORCE CHANGES WITH DISTANCE, which is a prediction and not a fitted term.");
