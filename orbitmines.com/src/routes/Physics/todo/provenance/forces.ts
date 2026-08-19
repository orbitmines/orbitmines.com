/**
 * THE FORCE LAWS, DISCRETELY — two charges and two wires, against separation.
 *
 * `charged` showed a charge polarises the vacuum as 1/r² and `wires` showed
 * parallel currents attract. Both are statements about a FIELD or a single
 * separation. What a force law says is how the effect depends on DISTANCE, and
 * that is measurable here without constructing a field at all — because in this
 * model a force is where space shortens, and (G+M/1) shortening between two things
 * pulls them together while (G+M/3) shortening behind them pushes them apart.
 *
 *   §1  TWO CHARGES. Opposite signs should annihilate between and attract; alike
 *       signs should turn instead and repel. That is the article's own mechanism,
 *       never run on a lattice with polarity — `field` modelled it as two
 *       separations on a line.
 *
 *   §2  and against separation, which is Coulomb's law if it goes as 1/d².
 *
 *   §3  TWO WIRES against separation, which is Ampère's force law if it goes as
 *       1/d — a different exponent from §2, and the two coming out different on
 *       the same measurement is worth more than either alone.
 *
 * EVERY ROW IS DIFFERENCED AGAINST AN INERT PAIR of the same geometry, because two
 * absorbing bodies shadow each other and that has nothing to do with either force.
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

type Kind = "charge" | "wire";
/** src[c] = 0 none, 1 = the left object, 2 = the right; sign[c] its polarity or current */
const build = (kind: Kind, sep: number, qL: number, qR: number) => {
  const src = new Uint8Array(CELLS), sgn = new Int8Array(CELLS);
  const half = sep / 2;
  const put = (x0: number, tag: number, q: number) => {
    if (kind === "charge") {
      for (let x = x0 - 2; x <= x0 + 2; x++) for (let y = C - 2; y <= C + 2; y++)
        for (let z = C - 2; z <= C + 2; z++) {
          if (Math.hypot(x - x0, y - C, z - C) > 2) continue;
          const c = idx(x, y, z); src[c] = tag as any; sgn[c] = q as any;
        }
    } else {
      for (let z = 3; z < N - 3; z++) { const c = idx(x0, C, z); src[c] = tag as any; sgn[c] = q as any; }
    }
  };
  put(C - half, 1, qL); put(C + half, 2, qR);
  return { src, sgn };
};

const run = (kind: Kind, sep: number, qL: number, qR: number, T: number, pCreate: number, seed: number) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };
  const { src, sgn } = build(kind, sep, qL, qR);
  const pol = new Int8Array(CELLS * DEG), nxt = new Int8Array(CELLS * DEG);
  const ann = new Float64Array(CELLS);
  let samples = 0;
  for (let t = 0; t < T; t++) {
    for (let c = 0; c < CELLS; c++) {
      if (src[c]) continue;
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
    for (let c = 0; c < CELLS; c++) {
      if (!src[c]) continue;
      for (let d = 0; d < DEG; d++) pol[c * DEG + d] = 0;
      const q = sgn[c];
      if (!q) continue;                                  // inert: absorbs, emits nothing
      if (kind === "charge") { for (let d = 0; d < DEG; d++) pol[c * DEG + d] = q as any; }
      else {
        for (const d of ALONG) pol[c * DEG + d] = q as any;
        for (const d of AGAINST) pol[c * DEG + d] = -q as any;
      }
    }
    for (let c = 0; c < CELLS; c++) {
      if (src[c]) continue;
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

/**
 * THE FORCE ON ONE OBJECT, as a signed difference — not a ratio, and not a region
 * defined relative to the pair.
 *
 * An earlier version measured (annihilation between the pair)/(annihilation
 * outside it), and it failed twice over. A RATIO SATURATES: at d = 6 it read 8.48,
 * which is not a small response to a perturbation, so no force law can be read off
 * it. And THE REGION IT AVERAGED OVER CHANGED SHAPE WITH d — the "between" shell
 * was one plane of cells at d = 6 and several at d = 14, so the samples were not
 * comparable across the very variable the law is about.
 *
 * A force is a signed thing about ONE object: whether space is being shortened
 * more on the side facing its partner than on the side facing away. So take a
 * shell around the LEFT object only, at a fixed radius that does not depend on d,
 * and difference the two halves. That is linear in the effect, cannot saturate,
 * and measures the same geometry at every separation.
 *
 *     force = ⟨annihilation on the side facing the partner⟩
 *           − ⟨annihilation on the side facing away⟩
 *
 * positive is a pull toward the partner.
 */
const force = (ann: Float64Array, s: number, kind: Kind, sep: number) => {
  const xL = C - sep / 2;
  let tow = 0, twN = 0, awy = 0, awN = 0;
  for (let x = 3; x < N - 3; x++) for (let y = 3; y < N - 3; y++) for (let z = 3; z < N - 3; z++) {
    const dx = x - xL, dy = y - C, dz = z - C;
    // a fixed shell around the LEFT object, the same at every separation
    const r = kind === "wire" ? Math.hypot(dx, dy) : Math.hypot(dx, dy, dz);
    if (r < 3 || r > 5) continue;
    if (kind === "wire" && (z < 8 || z > N - 8)) continue;
    // and only the cells whose displacement is mostly along the pair's axis, so
    // the two halves are mirror images of each other
    if (Math.abs(dx) < 0.7 * r) continue;
    const c = idx(x, y, z);
    if (dx > 0) { tow += ann[c] / s; twN++; } else { awy += ann[c] / s; awN++; }
  }
  return { f: tow / Math.max(twN, 1) - awy / Math.max(awN, 1), twN, awN };
};

const T = 700, P = 0.03;
/**
 * SEEDS, because one run of this is noise.
 *
 * The inert control alone scatters by about 1e-2 between runs while the signal past
 * d = 10 is 1e-3, so a single run cannot see it — an earlier version reported a
 * NEGATIVE force at large separation, which is a fluctuation and not a push. The
 * scatter falls as one over the root of the number of runs, so the signal is
 * averaged over several and the spread across them is printed beside it, because a
 * mean without a scatter is not a measurement.
 */
const SEEDS = [20260817, 777333, 424242, 909090, 5150, 31337];
const meanForce = (kind: Kind, d: number, qL: number, qR: number) => {
  const v: number[] = [];
  for (const sd of SEEDS) {
    const r = run(kind, d, qL, qR, T, P, sd);
    v.push(force(r.ann, r.samples, kind, d).f);
  }
  const m = v.reduce((a, b) => a + b, 0) / v.length;
  const sd2 = Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(v.length - 1, 1));
  return { m, err: sd2 / Math.sqrt(v.length) };
};

// ─── §1 two charges ─────────────────────────────────────────────────────────
console.log("═════ §1  TWO CHARGES — DO OPPOSITES ATTRACT? ═════");
console.log();
console.log(`  ${N}³, cubic 26, the three rules with polarity. Two emitting balls of radius 2,`);
console.log("  10 cells apart. A force here is where space shortens: (G+M/1) firing BETWEEN");
console.log("  two things pulls them together, (G+M/3) turning instead shortens BEHIND and");
console.log("  pushes them apart. So count where the annihilations land.");
console.log();
console.log("  This is the article's own mechanism and it has never been run on a lattice —");
console.log("  `field` modelled it as two separations on a line.");
console.log();
console.log(`  ${pad("pair", 16)} ${pad("force", 13)} ${pad("err", 11)} ${pad("vs inert", 13)} ${pad("signif", 10)}`);
console.log("  " + "─".repeat(66));
const SEP0 = 10;
const iF = meanForce("charge", SEP0, 0, 0);
const cases: [string, number, number][] = [["inert", 0, 0], ["+ and +", 1, 1], ["+ and −", 1, -1], ["− and −", -1, -1]];
const got: Record<string, number> = {};
for (const [name, a, b] of cases) {
  const F = meanForce("charge", SEP0, a, b);
  got[name] = F.m;
  const sg = name === "inert" ? "" : (Math.abs(F.m - iF.m) / Math.hypot(F.err, iF.err)).toFixed(1) + " sigma";
  console.log(`  ${pad(name, 16)} ${pad(F.m.toExponential(3), 13)} ${pad(F.err.toExponential(2), 11)} ${pad(name === "inert" ? "—" : (F.m - iF.m).toExponential(3), 13)} ${pad(sg, 10)}`);
}
console.log();
console.log("  averaged over " + SEEDS.length + " runs of " + T + " ticks each");
console.log();
const opp = got["+ and −"] - iF.m;
const like = ((got["+ and +"] - iF.m) + (got["− and −"] - iF.m)) / 2;
console.log(`  opposite − inert : ${opp.toExponential(3)}     positive is a PULL`);
console.log(`  alike    − inert : ${like.toExponential(3)}     negative is a PUSH`);
console.log();
if (opp > 0 && like < 0) {
  console.log("  OPPOSITES PULL AND ALIKE PUSH, straddling the inert control — the sign law,");
  console.log("  on a lattice, from the three rules, with nothing added.");
} else if (opp > like) {
  console.log("  OPPOSITES PULL HARDER THAN ALIKE DO, so the sign is doing work, but they do");
  console.log("  not straddle the control and the repulsion is not separately demonstrated.");
} else {
  console.log("  ALIKE PULL HARDER, which is the OPPOSITE of the sign law and is a refutation");
  console.log("  rather than a null result.");
}

// ─── §2 and §3, the distance laws ───────────────────────────────────────────
for (const [kind, title, law] of [
  ["charge", "§2  TWO CHARGES AGAINST SEPARATION — IS IT COULOMB?", "1/d²"],
  ["wire", "§3  TWO WIRES AGAINST SEPARATION — IS IT AMPÈRE?", "1/d"],
] as [Kind, string, string][]) {
  console.log();
  console.log(`═════ ${title} ═════`);
  console.log();
  console.log(`  A force law is a statement about DISTANCE. Coulomb is 1/d² and Ampère's`);
  console.log(`  force between wires is 1/d, so the two should come out DIFFERENT on the`);
  console.log(`  same measurement — which is worth more than either exponent alone.`);
  console.log();
  console.log(`  ${pad("d", 6)} ${pad("signal", 13)} ${pad("err", 11)} ${pad("signal/err", 11)} ${pad("x d", 11)} ${pad("x d2", 11)}`);
  console.log("  " + "-".repeat(70));
  const sig: [number, number, number][] = [];
  for (const d of [8, 10, 12, 14]) {
    const at = kind === "charge" ? meanForce(kind, d, 1, -1) : meanForce(kind, d, 1, 1);
    const iz = meanForce(kind, d, 0, 0);
    const sg = at.m - iz.m, er = Math.hypot(at.err, iz.err);
    sig.push([d, sg, er]);
    console.log(`  ${pad(String(d), 6)} ${pad(sg.toExponential(3), 13)} ${pad(er.toExponential(2), 11)} ${pad((sg / er).toFixed(1), 11)} ${pad((sg * d).toExponential(2), 11)} ${pad((sg * d * d).toExponential(2), 11)}`);
  }
  const use = sig.filter(([, sg, er]) => sg > 2 * er);
  let expo = NaN;
  if (use.length >= 3) {
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const [d, sg] of use) { const X = Math.log(d), Y = Math.log(sg); sx += X; sy += Y; sxx += X * X; sxy += X * Y; }
    const n = use.length;
    expo = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  }
  console.log();
  console.log("  points clearing two sigma: " + use.length + " of " + sig.length);
  console.log("  fitted exponent on those: signal proportional to d^" + (isFinite(expo) ? expo.toFixed(2) : "-"));
  console.log("  " + law + " is what this configuration should give.");
  if (!isFinite(expo)) {
    console.log();
    console.log("  TOO FEW POINTS CLEAR THE NOISE for an exponent to mean anything, so the");
    console.log("  distance law is not established here — a limit of the run rather than a");
    console.log("  statement about the model.");
  }
  console.log();
}
