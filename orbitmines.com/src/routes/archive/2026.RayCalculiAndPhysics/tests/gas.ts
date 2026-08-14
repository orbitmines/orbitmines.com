/**
 * THE DISCRETE VERSION — integers, no occupancy vector, no weights, no wander.
 *
 * `wave` measured the frontG of a lattice Boltzmann, which carries a real number
 * per direction per cell and relaxes towards an equilibrium with chosen weights.
 * That is the STATISTICS of the thing, not the thing, and it is a fair objection
 * that it is not the model: nobody wants a rule that says "adjust your heading
 * according to a weighted average of your neighbourhood". That would be an
 * absurd rule and it is not what is being proposed.
 *
 * What is being proposed is entirely discrete and has three parts:
 *
 *   STATE       each cell holds, for each of the lattice's directions, whether
 *               there is a charge there heading that way. One bit. No counts, no
 *               reals, no probabilities.
 *
 *   STREAM      every charge moves one cell along its own direction. Nothing
 *               changes heading. A charge alone in empty space goes perfectly
 *               straight for ever, exactly as it does now.
 *
 *   COLLIDE     a charge changes heading ONLY when it lands on the same cell as
 *               another charge, only as a function of what is in that one cell,
 *               and only into an outcome with the SAME NUMBER of charges and the
 *               SAME TOTAL MOMENTUM. Head-on pairs come out sideways. Everything
 *               else is left alone.
 *
 * There is no turn rate, no cone, no distribution to choose and nothing that
 * looks at a neighbourhood. The weights in `wave` are not an input to this —
 * they are what the equilibrium of that collision turns out to be, which is a
 * result and not a rule.
 *
 * This is a lattice gas cellular automaton (Hardy, de Pazzis & Pomeau 1973,
 * J. Math. Phys. 14:1746; Frisch, Hasslacher & Pomeau 1986, PRL 56:1505), runG on
 * both classical lattices — HPP's four directions, which fail at rank 4, and
 * FHP's six, which do not.
 *
 * I expected the frontG to come out square on one and round on the other. IT DOES
 * NOT, and the reason is worth more than the expectation was. The speed of a
 * small disturbance is set by the SECOND moment of the direction set, and rank 2
 * is isotropic on both — on every cubic lattice, as `lattices` found. HPP's
 * famous anisotropy lives in the momentum flux, which is a rank-4 quantity and
 * shows up in FLOWS, not in the frontG of a pulse. So both lattices give a round
 * frontG, and the thing that decides roundness is not which lattice but whether
 * there is a medium at all.
 *
 * The sweep over background density is the part that answers the question. At
 * density zero there are no collisions and the release is a set of beams — one
 * per lattice direction, which is precisely the ray picture and precisely the
 * veins. Turn the density up and the same beams become a circle. ONE charge is a
 * ray and goes straight; MANY charges are a wave and it is round. Nothing in
 * between was tuned.
 *
 * Run: ./runG.sh gas
 */

// ─────────────────────────────────────────────────────────────────────────────
// two spaces

/**
 * FHP: a triangular lattice, six directions, held in axial coordinates (q, r)
 * so the arithmetic stays integer. Euclidean position is x = q + r/2 and
 * y = r·√3/2, under which the six neighbours below sit at 0°, 60°, … 300° and
 * the opposite of direction i is i + 3.
 */
const FHP = {
  name: "FHP, triangular",
  n: 6,
  step: [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]],
  xy: (q: number, r: number): [number, number] => [q + r / 2, r * Math.sqrt(3) / 2],
};

/** HPP: the square lattice, four directions, opposite of i is i + 2 */
const HPP = {
  name: "HPP, square",
  n: 4,
  step: [[1, 0], [0, 1], [-1, 0], [0, -1]],
  xy: (q: number, r: number): [number, number] => [q, r],
};

type SpaceG = typeof FHP;

/**
 * The collision tableG, built rather than written out: for every possible cell
 * contents, the outcome. A pair head-on is the only case either lattice acts
 * on, plus FHP's three-body symmetric case, and both outcomes are picked to
 * have the same count and the same total momentum as the input — which is
 * checked below rather than trusted.
 *
 * `alt` is the second outcome for FHP's head-on case, which has two equally
 * good answers (rotate left or rotate right). Choosing one of them always would
 * put a handedness into the space, so the automaton alternates by cell parity —
 * a deterministic choice, not a random one, and no distribution is involved.
 */
const tableG = (S: SpaceG) => {
  const N = 1 << S.n;
  const main = new Uint8Array(N), alt = new Uint8Array(N);
  for (let s = 0; s < N; s++) { main[s] = s; alt[s] = s; }

  const half = S.n / 2;
  for (let i = 0; i < half; i++) {
    const headOn = (1 << i) | (1 << (i + half));
    if (S.n === 4) {
      main[headOn] = (1 << ((i + 1) % 4)) | (1 << ((i + 3) % 4));
      alt[headOn] = main[headOn];
    } else {
      main[headOn] = (1 << ((i + 1) % 6)) | (1 << ((i + 4) % 6));
      alt[headOn] = (1 << ((i + 5) % 6)) | (1 << ((i + 2) % 6));
    }
  }
  if (S.n === 6) {                                   // the three-body symmetric case
    main[0b010101] = 0b101010; alt[0b010101] = 0b101010;
    main[0b101010] = 0b010101; alt[0b101010] = 0b010101;
  }
  return { main, alt };
};

/** count and momentum of a cell state, for auditing the tableG */
const auditG = (S: SpaceG, t: ReturnType<typeof tableG>) => {
  const bad: string[] = [];
  for (let s = 0; s < (1 << S.n); s++) {
    for (const out of [t.main[s], t.alt[s]]) {
      let c0 = 0, c1 = 0, px = 0, py = 0, qx = 0, qy = 0;
      for (let i = 0; i < S.n; i++) {
        const [ex, ey] = S.xy(S.step[i][0], S.step[i][1]);
        if (s & (1 << i)) { c0++; px += ex; py += ey; }
        if (out & (1 << i)) { c1++; qx += ex; qy += ey; }
      }
      if (c0 !== c1 || Math.abs(px - qx) > 1e-9 || Math.abs(py - qy) > 1e-9)
        bad.push(s.toString(2).padStart(S.n, "0") + " → " + out.toString(2).padStart(S.n, "0"));
    }
  }
  return bad;
};

// ─────────────────────────────────────────────────────────────────────────────
// the automaton

let SEED_G = 20260814;
const rndG = () => (SEED_G = (SEED_G * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

/**
 * A box of cells, filled at background density `d` (each direction of each cell
 * independently occupied or not — which is the equilibrium of this collision at
 * zero mean velocity), a solid blob dropped in the middle, and T ticks of
 * stream-then-collide. Returns the density above background, averaged over
 * `runs` independent fillings so the ring is visible over the shot noise.
 */
const runG = (S: SpaceG, L: number, T: number, d: number, runs: number, blob = true) => {
  const t = tableG(S), o = (L - 1) / 2, C = L * L;
  const acc = new Float64Array(C);

  for (let k = 0; k < runs; k++) {
    let cur = new Uint8Array(C), nxt = new Uint8Array(C);
    for (let c = 0; c < C; c++) {
      let s = 0;
      for (let i = 0; i < S.n; i++) if (rndG() < d) s |= 1 << i;
      cur[c] = s;
    }
    if (blob) for (let r = -3; r <= 3; r++) for (let q = -3; q <= 3; q++)
      if (q * q + r * r + q * r <= 9) cur[(r + o) * L + (q + o)] = (1 << S.n) - 1;

    for (let step = 0; step < T; step++) {
      nxt.fill(0);
      for (let r = 0; r < L; r++) for (let q = 0; q < L; q++) {
        const s = cur[r * L + q];
        if (!s) continue;
        const out = ((q + r) & 1) ? t.alt[s] : t.main[s];
        for (let i = 0; i < S.n; i++) {
          if (!(out & (1 << i))) continue;
          const nq = (q + S.step[i][0] + L) % L, nr = (r + S.step[i][1] + L) % L;
          nxt[nr * L + nq] |= 1 << i;
        }
      }
      const tmp = cur; cur = nxt; nxt = tmp;
    }

    for (let c = 0; c < C; c++) {
      let n = 0;
      for (let i = 0; i < S.n; i++) if (cur[c] & (1 << i)) n++;
      acc[c] += n;
    }
  }

  const mean = d * S.n;
  for (let c = 0; c < C; c++) acc[c] = acc[c] / runs - mean;
  return { S, L, o, T, rho: acc };
};

// ─────────────────────────────────────────────────────────────────────────────

const NB_G = 72;                                       // 5° bins — the gas is noisy
const angBinG = (x: number, y: number) =>
  Math.min(NB_G - 1, Math.floor(((Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * NB_G));

/**
 * THE FRONT, read in a window rather than over the whole disk. The first version
 * of this took the centre of mass of everything positive out to r = 62 and could
 * not tell six beams from a circle — at d = 0 it reported a swing of 0.0025 for
 * a picture that is literally six spikes and nothing in between, because the
 * empty bins have no weight to have a radius with.
 *
 * Two things fix it. The window [0.40 T, 1.05 T] keeps the outgoing frontG and
 * drops both the churn left at the origin and everything past the ballistic
 * limit, where nothing can be and any signal is the noise floor of the average.
 * And the isotropy is read off the AMPLITUDE per direction, not the radius:
 * beams are bins with everything next to bins with nothing, which is a statement
 * about how much, not about how far.
 */
const frontG = (F: ReturnType<typeof runG>) => {
  const lo = 0.40 * F.T, hi = 1.05 * F.T;
  const A = new Float64Array(NB_G), WR = new Float64Array(NB_G);
  const H = (F.L - 1) / 2;
  for (let r = -H; r <= H; r++) for (let q = -H; q <= H; q++) {
    const [x, y] = F.S.xy(q, r);
    const d = Math.hypot(x, y);
    if (d < lo || d > hi) continue;
    const v = Math.max(0, F.rho[(r + F.o) * F.L + (q + F.o)]);
    const b = angBinG(x, y);
    A[b] += v; WR[b] += v * d;
  }
  return {
    amp: Array.from(A),
    R: Array.from(A, (a, b) => a > 0 ? WR[b] / a : NaN),
  };
};

/**
 * `rms` over ALL bins including the empty ones — an empty bin is the whole
 * point when the question is whether the frontG has holes in it. max/min is not
 * used: on a gas of this size it is a reading of the noisiest single bin.
 */
const spreadG = (a: number[]) => {
  const f = a.map(v => isFinite(v) ? v : 0);
  const m = f.reduce((x, y) => x + y, 0) / f.length;
  if (!(m > 0)) return { mean: NaN, rms: NaN, holes: NaN };
  return {
    mean: m,
    rms: Math.sqrt(f.reduce((s, v) => s + (v / m - 1) ** 2, 0) / f.length),
    holes: f.filter(v => v < 0.05 * m).length / f.length,
  };
};

// ─────────────────────────────────────────────────────────────────────────────

console.log("THE DISCRETE VERSION — bits, streaming, and collisions\n");

console.log("─".repeat(80));
console.log("1. THE COLLISION TABLE, AUDITED\n");
for (const S of [HPP, FHP]) {
  const t = tableG(S);
  const bad = auditG(S, t);
  const acts = [...Array(1 << S.n).keys()].filter(s => t.main[s] !== s || t.alt[s] !== s);
  console.log("  " + S.name.padEnd(20) + String(1 << S.n).padStart(4) + " possible cell states, "
    + String(acts.length).padStart(2) + " of them collide");
  console.log("    conservation of count and momentum: "
    + (bad.length ? "VIOLATED in " + bad.length + " cases" : "holds in every case"));
  console.log("    the states that act: " + acts.map(s => s.toString(2).padStart(S.n, "0")).join(" "));
}
console.log("\n  that is the entire rule. Every other cell state is left exactly as it is,");
console.log("  and a cell with one charge in it is always left exactly as it is — which");
console.log("  is what `a lone charge goes straight for ever` means.\n");

console.log("─".repeat(80));
console.log("2. ONE CHARGE IS A RAY, MANY ARE A WAVE\n");
console.log("   the same automaton at different background densities. At d = 0 there is");
console.log("   nothing to collide with and the release is beams; the frontG swing is how");
console.log("   much the ring's radius varies with direction, so small is round.\n");

console.log("   space                  d    frontG r    ring rms   amplitude rms   empty");
for (const S of [FHP, HPP]) {
  for (const d of [0, 0.02, 0.08, 0.20, 0.35]) {
    const F = runG(S, 141, 40, d, d === 0 ? 4 : 32);
    const f = frontG(F);
    const sa = spreadG(f.amp);
    const rr = f.R.filter(v => isFinite(v));
    const mr = rr.reduce((a, b) => a + b, 0) / rr.length;
    const rms = Math.sqrt(rr.reduce((a, v) => a + (v / mr - 1) ** 2, 0) / rr.length);
    console.log("  " + S.name.padEnd(20) + d.toFixed(2).padStart(6)
      + mr.toFixed(1).padStart(10) + rms.toFixed(4).padStart(11)
      + sa.rms.toFixed(4).padStart(15) + (100 * sa.holes).toFixed(0).padStart(7) + "%");
  }
  const F0 = runG(S, 141, 40, 0.20, 32, false);        // the same runG with NO pulse:
  const s0 = spreadG(frontG(F0).amp);                   // whatever this reads is noise
  console.log("  " + (S.name + ", no pulse").padEnd(20) + "  0.20"
    + "         —          —" + s0.rms.toFixed(4).padStart(15) + "      —");
  console.log();
}
console.log("  `empty` is the share of the 72 directions with essentially nothing in");
console.log("  them. At d = 0 it is the gaps between the beams and it is most of the");
console.log("  circle; the frontG only closes when there is something to collide with.\n");

console.log("  FHP and HPP runG the SAME rule — stream, then swap head-on pairs sideways —");
console.log("  and differ only in how many directions the space has. FOUR IS ENOUGH, and");
console.log("  that was not what I expected: HPP fails the rank-4 condition and FHP");
console.log("  passes it, yet at every density above 0.08 both sit at the noise floor of");
console.log("  this measurement. The reason is that the speed of a small disturbance is a");
console.log("  RANK 2 quantity, and rank 2 is isotropic on both — on every cubic lattice.");
console.log("  HPP's anisotropy is in the momentum flux and shows up in flows, not in the");
console.log("  frontG of a pulse. So the lattice was never what decided this. What decided");
console.log("  it is the column above: 83% of the sky empty at d = 0, 0% at d = 0.08.\n");

console.log("─".repeat(80));
console.log("3. WHICH REGIME THIS IS IN — and what it therefore does not show\n");
console.log("   A collision table this thin leaves most charges alone most of the time.");
console.log("   The mean free path below is 1 / (fraction of charges in a colliding cell");
console.log("   state at equilibrium), which for FHP-I is small because only 5 of the 64");
console.log("   states act at all.\n");
{
  const bits = (s: number, n: number) => {
    let c = 0;
    for (let i = 0; i < n; i++) if (s & (1 << i)) c++;
    return c;
  };
  console.log("    space                  d    collides/tick   mean free path   Kn at r = 33");
  for (const S of [FHP, HPP]) {
    const t = tableG(S);
    for (const d of [0.08, 0.20, 0.35, 0.50]) {
      let coll = 0, tot = 0;
      for (let st = 0; st < (1 << S.n); st++) {
        let p = 1;
        for (let i = 0; i < S.n; i++) p *= (st & (1 << i)) ? d : (1 - d);
        const n = bits(st, S.n);
        tot += p * n;
        if (t.main[st] !== st || t.alt[st] !== st) coll += p * n;
      }
      const mfp = tot / coll;
      console.log("    " + S.name.padEnd(20) + d.toFixed(2).padStart(6)
        + (coll / tot).toFixed(4).padStart(15) + mfp.toFixed(1).padStart(16)
        + (mfp / 33).toFixed(2).padStart(15));
    }
  }
}
console.log("\n   A Knudsen number of 0.3 is not a fluid. So THE FRONT MEASURED ABOVE IS");
console.log("   NOT A SOUND WAVE — the angle-averaged profile is one broad bump at");
console.log("   0.83 c, not a ring at FHP's sound speed of 1/√2 = 0.707 with a ballistic");
console.log("   precursor at 1.0 behind it. What fills the empty directions here is");
console.log("   plain SCATTERING: a charge knocked off its heading two or three times");
console.log("   ends up displaced along a SUM of different lattice vectors, and sums of");
console.log("   lattice vectors point anywhere. Six directions become a continuum.");
console.log();
console.log("   That is a real mechanism and it is enough for the angular gaps, but on");
console.log("   its own it is the CARRIED-HEADING case from `veins`, which goes");
console.log("   diffusive: scattering buys the angles and loses the light cone. The cone");
console.log("   comes back only in the hydrodynamic limit, where the collective mode is");
console.log("   sound and travels ballistically however much the carriers scatter — and");
console.log("   that limit is what `wave` measures, at a collision rate high enough to");
console.log("   reach it (front → 1/√3, swing → 1e-2). The two files are the same system");
console.log("   at two collision rates, and only the second one is in the regime that");
console.log("   the argument actually needs.\n");

console.log("─".repeat(80));
console.log("WHAT THIS ANSWERS\n");
console.log("  · the rule is discrete all the way down. One bit per direction per cell,");
console.log("    streaming that never touches a heading, and a lookup table on one");
console.log("    cell's own contents. There is no weight anywhere in it — nothing is");
console.log("    weighted, nothing is averaged, nothing consults a neighbourhood. The");
console.log("    4/9, 1/9, 1/36 in `wave` is a DESCRIPTION of where this ends up, the");
console.log("    way a temperature describes a gas. It is not a rule and nobody sets it.");
console.log("  · a heading changes only in a collision, and only for the reason the model");
console.log("    already has one: two charges met head-on. That case is already singled");
console.log("    out in `discrete.ts`. What is missing there is only that the outcome be");
console.log("    forced to keep the total momentum, which head-on annihilation does not.");
console.log("  · the ray picture is not wrong — it is the d → 0 column. At zero density");
console.log("    the front is beams and 83% of the directions have nothing in them at");
console.log("    all, which is the veins in their purest form. The model has been");
console.log("    computing the collisionless limit, where every charge keeps the heading");
console.log("    it left with and the lattice's few directions are all there is.");
console.log("  · and the fix is not a better lattice or a better distribution. It is a");
console.log("    medium. But the medium has to be thick enough to be one: at the");
console.log("    collision rate here the gaps fill and the cone does not survive, and");
console.log("    both are needed. What creates the circle is not any charge going round");
console.log("    it — no charge crosses more than a few cells before being turned. It is");
console.log("    that momentum cannot be destroyed, so an excess of it at a cell has to");
console.log("    be handed to the next one, and the hand-off travels at a speed set by");
console.log("    Σ c⊗c over the directions, which is ∝ δ on any cubic lattice. The front");
console.log("    is a relay, not a journey, and it is round because the pressure is.");
