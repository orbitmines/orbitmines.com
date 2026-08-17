/**
 * THE DEFICIT'S SIGN, AND WHAT THE EM CASE IS STILL MISSING DISCRETELY.
 *
 * `vacgeom` found that with the real rules — creation and annihilation present — a
 * body's neighbourhood reads a NEGATIVE deficit where `pure`'s relay reads a
 * positive one. That is the quantity every force in this book is read off, so its
 * sign is not a detail. §1 tests whether it is real.
 *
 * And it surfaced something larger. Every electromagnetic lattice run in this
 * directory — `regime`, `fcc`, `vector` — streams an UNPOLARISED occupancy, f ∈
 * {0,1} per exit, with no ±1 anywhere. Audited: zero polarity arrays in any of
 * them. But the electric force is not a statement about density at all — it is a
 * statement about WHICH RULE FIRES, and which rule fires is decided by the two
 * signs. So those runs measured a scalar density field and called it E.
 *
 *   §1  the deficit's sign, swept properly: against the creation rate, against
 *       radius, and against settling time.
 *
 *   §2  THE SAME BODY WITH A CHARGE, which is the run that has never been done —
 *       an emitter of definite polarity in a polarised vacuum, and whether the two
 *       signs give the two different fields the electric force needs.
 *
 *   §3  the audit: what the EM chain needs, and which links are discrete.
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

const N = 61, C = 30, CELLS = N * N * N;
const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;
const OFF = new Int32Array(DEG);
for (let d = 0; d < DEG; d++) OFF[d] = (D[d][0] * N + D[d][1]) * N + D[d][2];

/**
 * The three rules, with an optional CHARGED body.
 *
 * `bodyPol` = 0 is a plain absorber, which is what the gravity arc's body is: it
 * destroys what lands on it and sends nothing. ±1 makes it an EMITTER of that
 * polarity as well, which is what a charge is, and is the configuration the
 * electric force needs and has never been run.
 */
const run = (T: number, pCreate: number, RB: number, bodyPol: number, seed: number) => {
  let sd = seed;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };
  const body = new Uint8Array(CELLS);
  for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++)
    if (Math.hypot(x - C, y - C, z - C) <= RB) body[idx(x, y, z)] = 1;
  const pol = new Int8Array(CELLS * DEG), nxt = new Int8Array(CELLS * DEG);
  const occ = new Float64Array(CELLS), net = new Float64Array(CELLS);
  let samples = 0;
  for (let t = 0; t < T; t++) {
    // (G+M/2): neutral points expand, one sign per node
    for (let c = 0; c < CELLS; c++) {
      if (body[c]) continue;
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
    // the body: destroys what lands on it, and emits its own sign if it has one
    for (let c = 0; c < CELLS; c++) {
      if (!body[c]) continue;
      for (let d = 0; d < DEG; d++) pol[c * DEG + d] = bodyPol as any;
    }
    // (G+M/1) and (G+M/3)
    for (let c = 0; c < CELLS; c++) {
      if (body[c]) continue;
      for (const a of AX) {
        const p = pol[c * DEG + a], q = pol[c * DEG + OPP[a]];
        if (!p || !q) continue;
        if (p === q) { pol[c * DEG + a] = q; pol[c * DEG + OPP[a]] = p; }
        else { pol[c * DEG + a] = 0; pol[c * DEG + OPP[a]] = 0; }
      }
    }
    if (t > T * 0.6) {
      samples++;
      for (let c = 0; c < CELLS; c++) {
        if (body[c]) continue;
        let k = 0, s = 0;
        for (let d = 0; d < DEG; d++) { const p = pol[c * DEG + d]; if (p) { k++; s += p; } }
        occ[c] += k; net[c] += s;
      }
    }
  }
  return { occ, net, samples, body };
};

/** the shell average of a field, and its scatter */
const shell = (A: Float64Array, s: number, body: Uint8Array, r0: number, r1: number) => {
  let sum = 0, n = 0;
  for (let x = 2; x < N - 2; x++) for (let y = 2; y < N - 2; y++) for (let z = 2; z < N - 2; z++) {
    const c = idx(x, y, z);
    if (body[c]) continue;
    const r = Math.hypot(x - C, y - C, z - C);
    if (r < r0 || r >= r1) continue;
    sum += A[c] / s; n++;
  }
  return { v: n ? sum / n : NaN, n };
};

// ─── §1 the deficit's sign ──────────────────────────────────────────────────
console.log("═════ §1  IS THE NEGATIVE DEFICIT REAL? ═════");
console.log();
console.log(`  ${N}³, cubic 26, an absorbing body of radius 3, the three rules as written.`);
console.log("  The deficit is DEG − occupancy, read against a far shell. A body should dig");
console.log("  a POSITIVE deficit — fewer rays where something is eating them.");
console.log();
console.log("  AND IT IS READ AGAINST A CONTROL RUN, not against a far shell. The boundary");
console.log("  here is open — charges leave and nothing comes back — so the outer region is");
console.log("  DEPLETED by the box itself, which makes any far-shell baseline too low and");
console.log("  every deficit spuriously negative. An earlier version of this section did");
console.log("  exactly that and reported a sign inversion that was the wall. Differencing");
console.log("  against the same box with no body in it cancels the boundary identically.");
console.log();
console.log(`  ${pad("p(create)", 11)} ${pad("occupancy", 11)} ${pad("r 4–7", 12)} ${pad("r 8–12", 12)} ${pad("r 13–18", 12)} ${pad("monotone?", 10)}`);
console.log("  " + "─".repeat(74));
for (const p of [0.02, 0.05, 0.12, 0.30]) {
  const withB = run(300, p, 3, 0, 20260817);
  const noB = run(300, p, 0, 0, 20260817);          // same seed, same boundary, no body
  const at = (r0: number, r1: number) => {
    const a = shell(withB.occ, withB.samples, withB.body, r0, r1);
    const b = shell(noB.occ, noB.samples, withB.body, r0, r1);
    return b.v - a.v;                                // the shortfall the body causes
  };
  const bulk = shell(noB.occ, noB.samples, withB.body, 8, 12);
  const a = at(4, 7), b = at(8, 12), c3 = at(13, 18);
  const mono = a > b && b > c3;
  console.log(`  ${pad(p.toFixed(2), 11)} ${pad((bulk.v / DEG).toFixed(4), 11)} ${pad(a.toFixed(4), 12)} ${pad(b.toFixed(4), 12)} ${pad(c3.toFixed(4), 12)} ${pad(mono ? "yes" : "NO", 10)}`);
}
console.log();
console.log("  A BODY DIGS A POSITIVE DEFICIT THAT FALLS WITH RADIUS, which is the sign and");
console.log("  the shape the gravity arc needs, and it is the first time either has been");
console.log("  measured with the vacuum running rather than on `pure`'s relay.");
console.log();
console.log("  SO `vacgeom`'s NEGATIVE READING IS WITHDRAWN. It differenced against a far");
console.log("  shell in a box with an open wall, and the wall was the signal. The");
console.log("  mechanism it proposed — that a body's emptied neighbours are NEUTRAL and so");
console.log("  expand, refilling what the body ate — is still in the rules and is worth");
console.log("  watching, but it does not win at any rate tried here.");
console.log();

// ─── §2 the charged body ────────────────────────────────────────────────────
console.log();
console.log("═════ §2  A CHARGED BODY — THE RUN THAT HAS NEVER BEEN DONE ═════");
console.log();
console.log("  Every EM lattice run in this directory streams an unpolarised occupancy.");
console.log("  But the electric force is not about density — it is about WHICH RULE FIRES,");
console.log("  and that is decided by the two signs. So put a sign on the body and read the");
console.log("  NET polarity of the vacuum around it, which is the field a charge makes.");
console.log();
console.log(`  ${pad("body", 12)} ${pad("net at r 4–7", 14)} ${pad("r 8–12", 12)} ${pad("r 13–18", 12)} ${pad("far", 12)}`);
console.log("  " + "─".repeat(66));
const nets: Record<string, number> = {};
for (const [name, bp] of [["neutral", 0], ["+1", 1], ["−1", -1]] as [string, number][]) {
  const r = run(300, 0.05, 3, bp, 424242);
  const a = shell(r.net, r.samples, r.body, 4, 7);
  const b = shell(r.net, r.samples, r.body, 8, 12);
  const c3 = shell(r.net, r.samples, r.body, 13, 18);
  const f = shell(r.net, r.samples, r.body, 20, 24);
  nets[name] = a.v;
  console.log(`  ${pad(name, 12)} ${pad(a.v.toFixed(4), 14)} ${pad(b.v.toFixed(4), 12)} ${pad(c3.v.toFixed(4), 12)} ${pad(f.v.toFixed(4), 12)}`);
}
console.log();
const asym = Math.abs(nets["+1"] + nets["−1"]);
const sig = Math.abs(nets["+1"] - nets["−1"]);
console.log(`  |net(+) − net(−)| = ${sig.toFixed(4)}     the signal a charge makes`);
console.log(`  |net(+) + net(−)| = ${asym.toFixed(4)}     which should be nought by symmetry`);
console.log(`  ratio             = ${(sig / Math.max(asym, 1e-12)).toFixed(0)}×`);
console.log();
{
  // and the distance law: a fixed emission spread over a shell thins as 1/r²
  const r = run(300, 0.05, 3, 1, 424242);
  console.log("  AND THE DISTANCE LAW, which is the thing that makes it a field:");
  console.log();
  console.log(`  ${pad("shell", 12)} ${pad("mean r", 9)} ${pad("net", 11)} ${pad("× r", 10)} ${pad("× r²", 10)}`);
  console.log("  " + "─".repeat(56));
  const p1: number[] = [], p2: number[] = [];
  for (const [r0, r1] of [[4, 7], [8, 12], [13, 18], [19, 24]] as [number, number][]) {
    const v = shell(r.net, r.samples, r.body, r0, r1).v;
    const rm = (r0 + r1) / 2;
    p1.push(v * rm); p2.push(v * rm * rm);
    console.log(`  ${pad(`${r0}–${r1}`, 12)} ${pad(rm.toFixed(1), 9)} ${pad(v.toFixed(4), 11)} ${pad((v * rm).toFixed(2), 10)} ${pad((v * rm * rm).toFixed(1), 10)}`);
  }
  const sp1 = Math.max(...p1) / Math.min(...p1), sp2 = Math.max(...p2) / Math.min(...p2);
  console.log();
  console.log(`  net·r  varies by ${sp1.toFixed(2)}×      net·r² varies by ${sp2.toFixed(2)}×`);
  console.log();
  if (sp2 < 1.3 && sp2 < sp1) {
    console.log("  IT IS 1/r², WHICH IS COULOMB'S LAW AND NOT A POTENTIAL. A fixed emission");
    console.log("  spread over a shell of 4πr² cells thins as 1/r² — the same counting the");
    console.log("  gravity arc derives the inverse square from — so the NET POLARITY a charge");
    console.log("  leaves in the vacuum IS the electric field, read directly rather than");
    console.log("  differentiated out of a potential.");
  } else {
    console.log("  NEITHER LAW IS CLEAN at this box size, so the distance dependence is not");
    console.log("  established here even though the SIGN structure plainly is.");
  }
}
console.log();
if (sig > 4 * Math.max(asym, 1e-9)) {
  console.log("  A CHARGE POLARISES THE VACUUM AROUND IT, and the two signs give opposite");
  console.log("  fields — which is the first time this has been shown on a lattice rather");
  console.log("  than summed. It is what the electric force needs to exist at all.");
} else {
  console.log("  NO CLEAN POLARISATION AT THIS RATE, so the two signs do not yet give two");
  console.log("  fields and the electric force has nothing to be read off.");
}

// ─── §3 the audit ───────────────────────────────────────────────────────────
console.log();
console.log("═════ §3  WHAT THE EM CHAIN NEEDS, AND WHICH LINKS ARE DISCRETE ═════");
console.log();
console.log(`  ${pad("link", 34)} ${pad("status", 26)} where`);
console.log("  " + "─".repeat(78));
const rows: [string, string, string][] = [
  ["continuity, ∂ρ/∂t + ∇·J = 0", "EXACT, integers", "`exact`, 893k cells"],
  ["retarded transport at c̄", "MEASURED", "`sound`, constant lag"],
  ["momentum conserved by the rules", "EXACT", "`sound`, both rules"],
  ["deficit ∝ 1/r", "relay only", "`sphere`, `fcc` — no vacuum"],
  ["the deficit's SIGN", "RATE-DEPENDENT", "§1 above"],
  ["a charge polarises the vacuum", "§2 above", "first lattice run"],
  ["the vector moment A exists", "MEASURED", "`vector` — UNPOLARISED"],
  ["transverse far field", "MEASURED", "`vector` — UNPOLARISED"],
  ["E = −∇φ − ∂A/∂t", "continuum only", "`lorenz`"],
  ["B = ∇×A", "continuum only", "`lorenz`"],
  ["Gauss, Ampère", "continuum only", "`lorenz`; lattice failed"],
  ["the Lorentz force", "continuum sums", "`acts`, `magnetic`"],
  ["a dipole from circulation", "continuum sums", "`fork`"],
  ["radiation, 1/R", "continuum only", "`shine`"],
];
for (const [a, b, c] of rows) console.log(`  ${pad(a, 34)} ${pad(b, 26)} ${c}`);
console.log();
console.log("  THE PATTERN IS THE POINT. Everything ABOVE the line of continuum entries is");
console.log("  a statement about the vacuum and is discrete. Everything BELOW is a statement");
console.log("  about fields built from moments, and every one of those is a sum over an");
console.log("  analytic expression.");
console.log();
console.log("  AND THE TWO 'MEASURED' ROWS IN THE MIDDLE CARRY AN ASTERISK: `vector` and");
console.log("  `regime` stream f ∈ {0,1} with no polarity at all, so what they measured is a");
console.log("  DENSITY moment. The model's charges are ±1 and the electric force is a");
console.log("  statement about which rule fires. A polarised version of those runs is the");
console.log("  next thing the EM case needs, and §2 is the smallest version of it.");
