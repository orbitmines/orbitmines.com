/**
 * THE PUSH — the force as MOMENTUM rather than as annihilation, and (G+M/3) as a
 * real deflection rather than a no-op.
 *
 * `repel` swept the bias from a constant source to a neutral oscillator and found
 * an attraction at every point of it: alike 2.979e−3 .. 9.656e−3 against opposite
 * at 2.911e−2 .. 2.546e−2, opposite over alike at 7.7–9.0σ throughout. The sign
 * law held as a DIFFERENCE and there was no push anywhere. That was read as the
 * article's account of a repulsion failing. IT IS THE MEASURE THAT FAILS, and for
 * two reasons that compound.
 *
 * FIRST, THE MEASURE ONLY SEES ONE RULE. The force in `repel`, `forces`, `wires`
 * and `charged` is a density of ANNIHILATIONS, and annihilation is the rule that
 * DESTROYS rays. Whatever (G+M/3) does to a ray it does not destroy it, so a
 * count of annihilations is structurally blind to turning. Every configuration
 * that measure can be given reports a pull of some magnitude, because the only
 * thing it can count is the rule that shortens space. Sweeping the bias harder
 * was never going to help.
 *
 * SECOND, AND WORSE, THE TURN AS CODED IS A NO-OP:
 *
 *     if (p === q) { pol[c * DEG + a] = q; pol[c * DEG + OPP[a]] = p; }
 *
 * The turn is a swap of the counter-propagating pair on an axis, and the branch
 * is taken exactly when the two are EQUAL — so it assigns each of them its own
 * value back. The array is unchanged and the two rays stream onward next tick as
 * if nothing had happened. THEY PASS STRAIGHT THROUGH EACH OTHER.
 *
 * And that is not a coding slip that a better swap would fix. Two identical rays
 * counter-propagating on one axis carry momentum D[a] + D[OPP[a]] = 0, and after
 * a 180° turn they carry 0 again, on a field configuration that is point for
 * point the one they started in. A HALF-TURN OF ALIKE RAYS IS UNOBSERVABLE — no
 * state changes, no momentum moves, and no bookkeeping laid over the top of it
 * (tagging rays with which source emitted them, say) can produce a force the
 * field itself does not have. If the turn is to do anything, IT MUST LEAVE THE
 * AXIS. The article's own constant says it does: SPIN = 45°.
 *
 * WHICH MAKES THE FORCE A PRESSURE, and gives both signs from one mechanism.
 * A body absorbs the rays that arrive at it and is pushed by their momentum. On
 * its own the arrivals are isotropic and the net is nought. Put a partner beside
 * it and the region between them stops being ambient:
 *
 *   OPPOSITE — rays meet and ANNIHILATE there. The region is thinned, fewer rays
 *   arrive on the facing side, the ambient pressure on the far side wins, and the
 *   bodies are pushed TOGETHER. That is the attraction, and it is the same
 *   shortening of space the old measure was counting, seen from the other side.
 *
 *   ALIKE — rays meet and TURN. Nothing is destroyed, so the region is thickened
 *   relative to ambient, more arrives on the facing side, and the bodies are
 *   pushed APART. That is the repulsion, and no annihilation count could ever
 *   have seen it, because its whole content is that annihilation DIDN'T happen.
 *
 * So the sign law is XOR on one rule each, and the measure has to be momentum.
 *
 *   §1  the three turn implementations, to show the no-op is the blocker
 *   §2  the force against separation, alike and opposite, against an ISOLATED
 *       control — which is the right zero, since an inert or alike partner is
 *       itself one of the things being measured
 *
 * THE CONTROL MATTERS. `repel` compared alike against opposite, which gives a
 * difference and cannot give a sign. A lone emitting body must read 0 by
 * symmetry, and that is the zero both configurations are measured against.
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

  let annTot = 0;
  for (let c = 0; c < CELLS; c++) annTot += ann[c];
  return { px: px / Math.max(samples, 1), ann: annTot / Math.max(samples, 1) };
};

const T = 700, PCR = 0.03, PER = 12, UP = 10;   // dwell 10/12, so P = 2/3 exactly
const SEEDS = [20260817, 777333, 424242, 909090, 5150, 31337];

const mean = (f: (sd: number) => number) => {
  const v = SEEDS.map(f);
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  const s = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(v.length - 1, 1));
  return { m, err: s / Math.sqrt(v.length) };
};

const force = (turn: Turn, sep: number, upR: number, lone = false) =>
  mean(sd => run(T, PCR, sep, PER, UP, upR, turn, lone, sd).px);

console.log("═════ §1  THE TURN HAS TO LEAVE THE AXIS ═════");
console.log();
console.log("  45³, cubic 26, the three rules, dwell 10/12 so P = 2/3 exactly. The force is");
console.log("  the NET x-MOMENTUM ABSORBED by the left body per tick. The partner is at +x,");
console.log("  so POSITIVE IS AN ATTRACTION and NEGATIVE IS A REPULSION. `lone` is a single");
console.log("  body with no partner, which must read 0 by symmetry and is the zero.");
console.log();
console.log(`  ${pad("turn", 8)} ${pad("lone", 22)} ${pad("alike (+,+)", 22)} ${pad("opposite (+,−)", 22)}`);
console.log("  " + "─".repeat(78));
for (const turn of ["noop", "back", "spin"] as Turn[]) {
  const l = force(turn, 10, UP, true);
  const a = force(turn, 10, UP);
  const o = force(turn, 10, -UP);
  const fm = (r: { m: number, err: number }) => pad(`${r.m >= 0 ? "+" : ""}${r.m.toExponential(3)} ± ${r.err.toExponential(1)}`, 22);
  console.log(`  ${pad(turn, 8)} ${fm(l)} ${fm(a)} ${fm(o)}`);
}
console.log();
console.log("  `noop` and `back` MUST agree to the last digit — a half-turn of two identical");
console.log("  rays returns the array it was given, so the two are the same simulation. If");
console.log("  they differ, something else is wrong. `spin` is the only one that moves any");
console.log("  ray anywhere, so it is the only one that can carry a sign law.");

console.log();
console.log("═════ §2  AGAINST SEPARATION ═════");
console.log();
console.log("  If the pressure reading is right, both signs should weaken with distance as");
console.log("  the region between the bodies stops being a small fraction of the sky each");
console.log("  one sees.");
console.log();
console.log(`  ${pad("sep", 6)} ${pad("alike", 22)} ${pad("opposite", 22)} ${pad("alike − lone", 14)} ${pad("signif", 10)}`);
console.log("  " + "─".repeat(78));
for (const sep of [6, 10, 14, 18]) {
  const l = force("spin", sep, UP, true);
  const a = force("spin", sep, UP);
  const o = force("spin", sep, -UP);
  const d = a.m - l.m, e = Math.hypot(a.err, l.err);
  const fm = (r: { m: number, err: number }) => pad(`${r.m >= 0 ? "+" : ""}${r.m.toExponential(3)} ± ${r.err.toExponential(1)}`, 22);
  console.log(`  ${pad(String(sep), 6)} ${fm(a)} ${fm(o)} ${pad((d >= 0 ? "+" : "") + d.toExponential(3), 14)} ${pad((Math.abs(d) / e).toFixed(1) + " sigma", 10)}`);
}
console.log();
console.log("  THE CLAIM UNDER TEST is that `alike − lone` is NEGATIVE — a lone body feels");
console.log("  nothing, and giving it a partner of its own kind pushes it away. That is the");
console.log("  half of the sign law the article has never shown, and an annihilation count");
console.log("  could not have shown it, because its content is that annihilation did not");
console.log("  happen.");
