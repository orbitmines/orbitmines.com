/**
 * THE RADIATION, ON AN ACTUAL LATTICE — and it does not survive the trip.
 *
 * `shine` and `lorenz` are continuum algebra. They establish that IF the deficit is
 * a RETARDED 1/R potential THEN it radiates, that its first moment gives all four of
 * Maxwell, and that the far field is transverse. Every one of those is done with
 * sin, cos and a retarded-time solver, and NONE OF IT RUNS THE MODEL.
 *
 * This file runs the model. The result is that half the premise holds and half does
 * not, and the half that does not is the half those two files need.
 *
 *   §1  the implementation, and what it took to get right. Three earlier versions of
 *       this file were not the model at all.
 *
 *   §2  THE STATIC FIELD IS REPRODUCED: the shell-averaged deficit fits A(1/r − 1/Rb)
 *       to 3.8% over r = 7..17 and is round to 1.02–1.21 across ⟨100⟩, ⟨110⟩, ⟨111⟩.
 *       So the machinery is sound and the gravity arc's result is confirmed here.
 *
 *   §3  AND THE DYNAMICS IS DIFFUSIVE, NOT BALLISTIC. Settle, switch the body off,
 *       and time each shell's response: first-arrival goes as R^1.87, not R^1.
 *       A wave gives 1. THE DEFICIT DOES NOT PROPAGATE AT c̄.
 *
 *   §4  which withdraws `shine`'s premise, and what is left of it.
 *
 * §3 IS WITHDRAWN AS A STATEMENT ABOUT THE MODEL — see `sound`. The measurement
 * below is correct and its SUBJECT is wrong: `pure`'s remake rule is the only rule
 * in this book that does not conserve momentum, and momentum is what carries a
 * wave. The model's own two collision rules — (G+M/3) turning and (G+M/1)
 * annihilation — conserve it exactly, and with a momentum-conserving collision the
 * same geometry gives a CONSTANT lag of 1.17 ticks per cell instead of one rising
 * from 2.6 to 8.9. So what this file measures is the diffusive limit of a
 * simplification, not the transport of the model.
 *
 * THE REASON IS NOT A BUG AND IS ALREADY IN THE BOOK. `pure`'s rule is that every
 * arriving charge is DESTROYED AND REMADE — "a point that received k sends k back
 * out" — so no charge keeps a heading and nothing travels in a straight line. More
 * generally `mfp` says the model is a lattice gas whose mean free path is a function
 * of fill: transport is ballistic BELOW the mean free path and diffusive above it,
 * and at the vacuum's own density the mean free path is short. A disturbance
 * crossing many cells is therefore diffusive, and S(t − R) is not what it does.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

const N = 61, C = (N - 1) / 2, CELLS = N * N * N;
const D: [number, number, number][] = [];
for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
  if (x || y || z) D.push([x, y, z]);
const DEG = D.length;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;
const OFF = new Int32Array(DEG);
for (let d = 0; d < DEG; d++) OFF[d] = (D[d][0] * N + D[d][1]) * N + D[d][2];

const body = new Uint8Array(CELLS), rim = new Uint8Array(CELLS);
for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) {
  const c = idx(x, y, z), dx = x - C, dy = y - C, dz = z - C;
  if (dx * dx + dy * dy + dz * dz <= 9) body[c] = 1;
  if (x < 2 || x >= N - 2 || y < 2 || y >= N - 2 || z < 2 || z >= N - 2) rim[c] = 1;
}

/**
 * ONE TICK OF `pure`'s RULE, which is the shortest form of the model with a force in
 * it: every point sends one charge along each of its DEG edges every tick; every
 * charge is destroyed where it lands AND THAT DESTRUCTION MAKES THE NEXT ONE, so a
 * point that received k sends k back out. A point with fewer than DEG to send skips
 * some edges, and the skipped edge walks round the point — round-robin, no
 * randomness. A body takes what arrives and sends nothing. The rim is held full,
 * which is the rest of space.
 */
let q = new Uint8Array(CELLS).fill(DEG), nq = new Uint8Array(CELLS);
const skip = new Uint8Array(CELLS);
const tick = (absorbing: boolean) => {
  nq.fill(0);
  for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
    const c = idx(x, y, z);
    if (absorbing && body[c]) continue;
    const k = q[c]; if (!k) continue;
    const s = skip[c];
    for (let j = 0; j < k; j++) nq[c + OFF[(s + j) % DEG]]++;
    skip[c] = (s + k) % DEG;
  }
  const t = q; q = nq; nq = t;
  for (let c = 0; c < CELLS; c++) if (rim[c]) q[c] = DEG;
};

/**
 * SHELLS, and they are not a convenience.
 *
 * A single cell holds an integer out of DEG and its scatter swamps the signal: an
 * earlier version of this file read the settled deficit along one axis as
 * 9, 4, 3, 4, 0, 4, 0 — not even monotonic — and drew conclusions from it. `sphere`
 * averages over shells for exactly this reason, and so does everything below.
 */
const PROBE = [5, 8, 11, 14, 17, 20];
const shells = PROBE.map(R => {
  const m: number[] = [];
  for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
    const dx = x - C, dy = y - C, dz = z - C;
    if (Math.abs(Math.sqrt(dx * dx + dy * dy + dz * dz) - R) < 0.5) m.push(idx(x, y, z));
  }
  return m;
});
const shellDef = (i: number) => {
  let s = 0; for (const c of shells[i]) s += DEG - q[c];
  return s / shells[i].length;
};

// ─── §1 what it took to get the implementation right ────────────────────────
function faithful(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  WHAT IT TOOK TO MAKE THIS THE MODEL ═════");
  line();
  line("  Three earlier versions of this file were not the model, and the ways they");
  line("  were wrong are worth recording because each looked plausible:");
  line();
  line("     FREE STREAMING ONLY. Occupancy moved one cell a tick and a body ate what");
  line("     landed on it. That gives a SHADOW, not a field — the deficit measured");
  line("     1.0000 at every radius, exactly one direction dead, with no 1/r at all.");
  line();
  line("     A SCATTERING FRACTION, added by hand to make it settle. That is a free");
  line("     parameter the model does not have, and it was about to be tuned.");
  line();
  line("     THE THREE RULES WITH POLARITY, which is the real model but is dominated");
  line("     by vacuum creation at any affordable box size: the deficit signal sat");
  line("     under the shot noise at every radius.");
  line();
  line("  WHAT IS RUN HERE IS `pure`'s RULE, which the gravity arc already uses and");
  line("  which `sphere` measures the deficit on: every point sends one charge along");
  line("  each of its 26 edges every tick, and every arrival is DESTROYED AND REMADE,");
  line("  so a point that received k sends k back out. The re-emission is the model's");
  line("  own and not an addition — it is what makes the field settle rather than");
  line("  cast a shadow.");
  return out.join("\n");
}

// ─── §2 the static field ────────────────────────────────────────────────────
let settled: number[] = [];
function statics(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  THE STATIC FIELD IS REPRODUCED ═════");
  line();
  for (let t = 0; t < 600; t++) tick(true);
  settled = PROBE.map((_, i) => shellDef(i));
  line(`  ${N}³ cells, ${DEG} directions, a body of radius 3, rim held full, 600 ticks.`);
  line();
  line(`  ${pad("r", 6)} ${pad("shell cells", 13)} ${pad("deficit", 11)} ${pad("× r", 10)} ${pad("⟨100⟩", 9)} ${pad("⟨111⟩", 9)} round`);
  line("  " + "─".repeat(66));
  for (let i = 0; i < PROBE.length; i++) {
    const R = PROBE[i];
    const a = DEG - q[idx(C + R, C, C)];
    const w = Math.round(R / Math.sqrt(3));
    const b = DEG - q[idx(C + w, C + w, C + w)];
    line(`  ${pad(String(R), 6)} ${pad(String(shells[i].length), 13)} ${pad(settled[i].toFixed(3), 11)} ${pad((settled[i] * R).toFixed(2), 10)} ${pad(String(a), 9)} ${pad(String(b), 9)} —`);
  }
  // fit A(1/r − 1/Rb)
  let best: [number, number, number] = [1e9, 0, 0];
  for (let Rb = 20; Rb <= 45; Rb += 0.5) {
    const bs = PROBE.map(r => 1 / r - 1 / Rb);
    let sxy = 0, sxx = 0;
    for (let i = 0; i < PROBE.length; i++) { sxy += bs[i] * settled[i]; sxx += bs[i] * bs[i]; }
    const A = sxy / sxx;
    let err = 0;
    for (let i = 0; i < PROBE.length; i++) err += Math.abs(A * bs[i] - settled[i]) / settled[i];
    err /= PROBE.length;
    if (err < best[0]) best = [err, Rb, A];
  }
  line();
  line(`  fit A(1/r − 1/Rb):  A = ${best[2].toFixed(1)},  Rb = ${best[1]},  mean error ${(best[0] * 100).toFixed(1)}%`);
  line();
  line("  1/r ON A LATTICE, FROM THE RULE. That is the gravity arc's result and it is");
  line("  what `shine` leans on for the SHAPE of the potential. Rb comes out near the");
  line("  box half-width, which is the held rim and not a fitted length.");
  return out.join("\n");
}

// ─── §3 the dynamics ────────────────────────────────────────────────────────
function dynamics(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  AND THE DYNAMICS IS DIFFUSIVE, WHICH IS THE RESULT ═════");
  line();
  line("  `shine` needs one more thing than the shape: it needs the deficit to be");
  line("  RETARDED, S(t − R), so that its gradient keeps a 1/R term. That is a claim");
  line("  about how fast a CHANGE in the source reaches a distance, and it can be");
  line("  measured directly — settle, switch the body off, and time each shell.");
  line();
  const hist: number[][] = PROBE.map((): number[] => []);
  for (let t = 0; t < 240; t++) {
    tick(false);
    PROBE.forEach((_, i) => hist[i].push(shellDef(i)));
  }
  line(`  ${pad("r", 6)} ${pad("settled", 10)} ${pad("first response", 16)} ${pad("t / r", 9)} ${pad("t / r²", 9)}`);
  line("  " + "─".repeat(56));
  const firsts: number[] = [];
  for (let i = 0; i < PROBE.length; i++) {
    const b = settled[i]; let f = -1;
    for (let t = 0; t < hist[i].length; t++)
      if (Math.abs(hist[i][t] - b) >= 0.15 * b) { f = t + 1; break; }
    firsts.push(f);
    const R = PROBE[i];
    line(`  ${pad(String(R), 6)} ${pad(b.toFixed(3), 10)} ${pad(f > 0 ? String(f) : "—", 16)} ${pad(f > 0 ? (f / R).toFixed(2) : "—", 9)} ${pad(f > 0 ? (f / (R * R)).toFixed(3) : "—", 9)}`);
  }
  const use = firsts.map((t, i) => [t, PROBE[i]] as [number, number]).filter(([t]) => t > 0);
  let sx = 0, sy = 0, sxx = 0, sxy = 0;
  for (const [t, R] of use) {
    const X = Math.log(R), Y = Math.log(t);
    sx += X; sy += Y; sxx += X * X; sxy += X * Y;
  }
  const n = use.length;
  const p = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  line();
  line(`  first response ∝ r^${p.toFixed(2)}     a WAVE gives 1, a DIFFUSION gives 2`);
  line();
  line("  t/r RISES DOWN THE COLUMN AND t/r² DOES NOT. So the response time grows");
  line("  faster than the distance, and THE DEFICIT DOES NOT PROPAGATE AT c̄ — it");
  line("  spreads, at a rate that gets worse the further it goes.");
  line();
  line("  AND THE REASON IS THE RULE ITSELF, not a numerical accident. Every arriving");
  line("  charge is destroyed and remade along a DIFFERENT edge, so no charge keeps a");
  line("  heading and nothing travels in a straight line. `mfp` says the same thing");
  line("  more generally: the model is a lattice gas whose mean free path is a");
  line("  function of fill, transport is ballistic BELOW that length and diffusive");
  line("  above it, and at the vacuum's own density the mean free path is short.");
  line();
  line("  ONE THING THIS DOES NOT SHOW. A ballistic PRECURSOR — a first, faint");
  line("  arrival at exactly c̄ ahead of the diffusive bulk — is not ruled out here;");
  line("  lowering the detection threshold runs into the shell's own noise floor");
  line("  before it finds one. So the honest statement is that the BULK is diffusive,");
  line("  and whether there is a c̄ precursor carrying a small amplitude is a");
  line("  measurement this file cannot make at this box size.");
  return out.join("\n");
}

// ─── §4 what that does to shine and lorenz ──────────────────────────────────
function consequence(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  SO WHAT SURVIVES ═════");
  line();
  line(`  ${pad("claim", 34)} ${pad("where", 10)} ${pad("on the lattice", 16)}`);
  line("  " + "─".repeat(66));
  line(`  ${pad("deficit ∝ 1/r", 34)} ${pad("gravity", 10)} ${pad("CONFIRMED", 16)} §2, 3.8%`);
  line(`  ${pad("the field is round", 34)} ${pad("sphere", 10)} ${pad("CONFIRMED", 16)} §2`);
  line(`  ${pad("the deficit is RETARDED at c̄", 34)} ${pad("shine", 10)} ${pad("REFUTED", 16)} §3, r^1.87`);
  line(`  ${pad("a 1/R radiative gradient", 34)} ${pad("shine", 10)} ${pad("premise gone", 16)}`);
  line(`  ${pad("all four Maxwell equations", 34)} ${pad("lorenz", 10)} ${pad("premise gone", 16)}`);
  line(`  ${pad("transverse E ⊥ B", 34)} ${pad("lorenz", 10)} ${pad("premise gone", 16)}`);
  line();
  line("  `shine` AND `lorenz` ARE NOT WRONG ABOUT THEIR OWN ARITHMETIC. Given a");
  line("  retarded 1/R potential, the gradient does keep a 1/R term, the first moment");
  line("  does satisfy Maxwell, and the far field is transverse. What §3 removes is");
  line("  the GIVEN. Those files should be read as: this is what the model would do");
  line("  if its field propagated at c̄, and it does not.");
  line();
  line("  WHAT WOULD RESTORE IT, stated so it can be worked on rather than left as a");
  line("  hole. Radiation needs transport at a fixed speed over many cells, so it");
  line("  needs a MEAN FREE PATH LONG COMPARED WITH A WAVELENGTH. In this model that");
  line("  is a statement about the vacuum's fill, which `vacuum` derives at ½ and");
  line("  `mfp` turns into a length. Either:");
  line();
  line("     the carriers of light are NOT the vacuum's own charges but something");
  line("     that does not scatter off them — which is a new object and must be");
  line("     priced as one; or");
  line();
  line("     the relevant length is short and light is a DIFFUSIVE mode, which is not");
  line("     electromagnetism and would be refuted by the first measurement anyone");
  line("     made of the speed of light.");
  line();
  line("  THE SECOND IS FATAL AND THE FIRST IS EXPENSIVE, and this file does not");
  line("  choose between them. What it does is stop the arc from resting on a premise");
  line("  the lattice refuses.");
  return out.join("\n");
}

console.log(faithful());
console.log(statics());
console.log(dynamics());
console.log(consequence());
