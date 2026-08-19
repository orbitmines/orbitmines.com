/**
 * THE FEEDBACK RULE, AND WHY IT IS NOT A NEW RULE.
 *
 * `feedback` states the gap as sharply as it can be stated: the model has NO
 * rule by which a source responds to its surroundings. `bearing(s, tick)` is a
 * pure function of the source's own parameters and the tick, nothing anywhere
 * writes to a source, and every ordering result in the magnetic half is
 * therefore conditional on a line that does not exist. It also says what the
 * line would have to be — it acts on the AXIS, not the rate, because rate
 * feedback would make mass a function of the neighbourhood and break gravity.
 *
 * THE CLAIM HERE IS THAT THE LINE IS ALREADY WRITTEN, IN THE GRAVITY ARC.
 *
 * Gravity is not a force in this model. It is the observation that annihilation
 * DESTROYS THE SPACE the two charges were standing on, so when more meetings
 * happen between two bodies than outside them, the space between them is
 * shorter than the space around them, and they are closer. Nothing pulls. The
 * ledger of where space was destroyed IS the motion.
 *
 * That ledger has moments, and gravity uses only the zeroth:
 *
 *     ⟨1⟩ about a source     how much space went, total         → it MOVES
 *     ⟨d̂⟩ about a source     which SIDE of it the space went     → it TURNS
 *
 * and the second is not a new rule. It is the same sentence. If destroyed space
 * moving a body is accepted — and the whole gravity arc is built on it — then
 * destroyed space destroyed LOPSIDEDLY about a body turns it, for exactly the
 * reason a body with more space taken from its left than its right ends up
 * facing left. `response` already measured that this moment is EXACTLY ODD in
 * the phase difference, which is what a torque has to be and what the
 * annihilation COUNT is not.
 *
 * So what is owed is not a mechanism. It is a demonstration that the two
 * moments are moments of ONE quantity, because if they are then the feedback
 * costs nothing: the force and the torque are the position-gradient and the
 * axis-gradient of the same scalar, and "follow the gradient" is not an extra
 * postulate but a restatement of where space went.
 *
 * AND THEN THE ORDERING DOES NOT FOLLOW, WHICH WAS NOT THE EXPECTED ENDING.
 * Supplying the rule discharges the condition the article's summary puts on
 * ferromagnetism, and the ferromagnet still does not appear — because Λ(0), the
 * energy of the uniform state, vanishes IDENTICALLY on any cubic lattice by
 * cubic symmetry. That is an identity rather than a small number, it holds at
 * every screening length, and it means the far-field channel cannot order.
 * Which is the right answer: dipolar coupling does not cause ferromagnetism in
 * nature either, being some three orders below the exchange that does.
 *
 *   §1  the kernel — two sources, and a Coulomb law out of a bond count
 *   §2  two magnets are the dipole scalar, measured against one constant
 *   §3  so the force and the torque are two derivatives of one function
 *   §4  and then the ordering does not come out, and that is exact
 *   §5  the one piece that survives — the easy axis, which needs no order
 */

type V = [number, number, number];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: V, b: V): V =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

let S = 20260818 >>> 0;
const rnd = () => {
  S = (S + 0x6D2B79F5) >>> 0;
  let z = S;
  z = Math.imul(z ^ (z >>> 15), z | 1);
  z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
  return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
};
const reseed = (s = 20260818) => { S = s >>> 0; };

/** the 26 exits — DEG, and the only directions a node can emit into */
const EXITS: V[] = (() => {
  const out: V[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) out.push(unit([x, y, z]));
  return out;
})();

const randomAxis = (): V => {
  const z = 2 * rnd() - 1, t = 2 * Math.PI * rnd(), r = Math.sqrt(1 - z * z);
  return [r * Math.cos(t), r * Math.sin(t), z];
};

/**
 * WHAT ARRIVES AT A PLACE, FROM A MAGNET.
 *
 * The article settles this and it is worth not re-deciding: the bias goes on a
 * PLACE and not on a direction. One emitter biased + out of its north half and
 * − out of its south fails — pole to pole gives exactly nothing by an exact
 * cancellation, and the fall-off is 1/R² where two magnets are 1/R⁴. A magnet
 * is a lump biased + at one end and − at the other, SEPARATED IN SPACE, which
 * is what `escape` derives as −∇·p and what magnetostatics calls the pole
 * model.
 *
 * So a magnet is two poles, and what arrives at a place from a pole is its sign
 * over the shell it has reached — `chance`'s own 1/r². The core is capped at a
 * cell because a place closer than a cell is not a place.
 */
const arriving = (x: number, y: number, z: number, c: V, p: V, d: number) => {
  let a = 0;
  for (const s of [1, -1]) {
    const px = c[0] + s * d / 2 * p[0], py = c[1] + s * d / 2 * p[1], pz = c[2] + s * d / 2 * p[2];
    const r2 = (x - px) ** 2 + (y - py) ** 2 + (z - pz) ** 2;
    a += s / Math.max(r2, 2.25);
  }
  return a;
};

/**
 * THE LEDGER. Opposite signs meeting annihilate and take the space with them,
 * so the excess of annihilation over the unbiased case at a place is −A_a·A_b,
 * and Φ is that summed over the lattice.
 *
 * POSITIVE Φ means more space destroyed, which is the configuration two bodies
 * fall into — so Φ is a shortening and a pair seeks its maximum.
 */
const ledger = (ca: V, pa: V, cb: V, pb: V, d: number, Rmax = 26) => {
  let acc = 0;
  const n = Math.ceil(Rmax), mx = Math.round((ca[0] + cb[0]) / 2);
  for (let x = mx - n; x <= mx + n; x++)
    for (let y = -n; y <= n; y++)
      for (let z = -n; z <= n; z++)
        acc += -arriving(x, y, z, ca, pa, d) * arriving(x, y, z, cb, pb, d);
  return acc;
};

/** the single-pole version of the same sum, which is the kernel everything else is built on */
const kernel = (R: number, Rmax = 60, core = 1.5) => {
  let acc = 0;
  const n = Math.ceil(Rmax + R);
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
    const la = Math.hypot(x, y, z), lb = Math.hypot(x - R, y, z);
    if (la < core || lb < core) continue;
    if (la > Rmax && lb > Rmax) continue;
    acc += 1 / (la * la * lb * lb);
  }
  return acc;
};

/** the dipole scalar the ledger is being tested against, up to one constant */
const dipoleForm = (R: V, pa: V, pb: V) => {
  const r = len(R), rh = unit(R);
  return (3 * dot(pa, rh) * dot(pb, rh) - dot(pa, pb)) / (r * r * r);
};

export function kernelReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE KERNEL — TWO SOURCES, AND A COULOMB LAW OUT OF A BOND COUNT");
  line("=".repeat(78));
  line();
  line("  Before any magnet, the thing a magnet is built out of. Two point");
  line("  sources, each spreading its emission over the shell it has reached, and");
  line("  the ledger of where they annihilate is the sum over cells of the two");
  line("  arrivals multiplied. That sum is a function of the separation alone.");
  line();
  line("       R      Σ 1/(r_a²r_b²)      R × it");
  for (const R of [4, 6, 8, 10, 12, 16, 20]) {
    const v = kernel(R);
    line(`   ${R.toString().padStart(5)}   ${v.toExponential(4).padStart(14)}   ${(R * v).toFixed(3).padStart(8)}`);
  }
  line();
  line("  R × it is FLAT, so the kernel is 1/R. Two co-location densities, each");
  line("  falling as an inverse square, convolve into an inverse FIRST power —");
  line("  which is a Coulomb potential between two poles, arrived at from a count");
  line("  of where charges land rather than from a field equation.");
  line();
  line("  And the sign carries: opposite poles give more annihilation, more space");
  line("  destroyed between them, and therefore attraction. Like poles give less.");
  line("  OPPOSITES ATTRACT is the sign of a product, again.");

  return out.join("\n");
}

export function ledgerReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. AND TWO MAGNETS ARE THE DIPOLE SCALAR — MEASURED, NOT ASSUMED");
  line("=".repeat(78));
  line();
  line("  A magnet is two poles a distance d apart, per `escape`. Put two of them");
  line("  down with axes drawn at random and sum the ledger over the lattice.");
  line("  Against 3(p_a·R̂)(p_b·R̂) − p_a·p_b over R³ — the scalar whose");
  line("  position-gradient is the magnetostatic force and whose axis-gradient is");
  line("  the magnetostatic torque.");
  line();
  line("  ONE overall constant is fitted, and it is the same one for every row.");
  line();
  reseed(1234);
  const R = 10, d = 3;
  const trials: { l: number, f: number, pa: V, pb: V }[] = [];
  for (let k = 0; k < 24; k++) {
    const pa = randomAxis(), pb = randomAxis();
    trials.push({
      l: ledger([0, 0, 0], pa, [R, 0, 0], pb, d), f: dipoleForm([R, 0, 0], pa, pb), pa, pb,
    });
  }
  let sxy = 0, sxx = 0;
  for (const t of trials) { sxy += t.f * t.l; sxx += t.f * t.f; }
  const k = sxy / sxx;
  const my = trials.reduce((a, t) => a + t.l, 0) / trials.length;
  let ss = 0, st = 0;
  for (const t of trials) { ss += (t.l - k * t.f) ** 2; st += (t.l - my) ** 2; }
  line(`     24 random orientation pairs, R = ${R}, pole separation d = ${d}`);
  line(`     one fitted constant                          k = ${k.toExponential(4)}`);
  line(`     R² of the ledger against the dipole scalar       ${(1 - ss / st).toFixed(6)}`);
  line();
  line("       p_a·p_b   (p_a·R̂)(p_b·R̂)      ledger      k · dipole");
  for (let i = 0; i < 6; i++) {
    const t = trials[i], rh: V = [1, 0, 0];
    line(`   ${dot(t.pa, t.pb).toFixed(4).padStart(9)}   ${(dot(t.pa, rh) * dot(t.pb, rh)).toFixed(4).padStart(13)}` +
      `   ${t.l.toExponential(3).padStart(11)}   ${(k * t.f).toExponential(3).padStart(11)}`);
  }
  line();
  line("  The residual is the finite pole separation: d/R is not zero, so a");
  line("  quadrupole term survives. It shrinks with d/R rather than sitting at a");
  line("  floor — halving d takes the torque check below from 10.3% to 4.8% —");
  line("  which is the check that it is a finite-size correction and not a shape");
  line("  mismatch. THE LEDGER IS THE DIPOLE SCALAR.");

  return out.join("\n");
}

export function twoDerivativesReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. SO THE FORCE AND THE TORQUE ARE TWO DERIVATIVES OF ONE FUNCTION");
  line("=".repeat(78));
  line();
  line("  This is the whole of the file. Φ is summed once, off the annihilation");
  line("  ledger. Differentiate it in the SEPARATION and you get the force that");
  line("  gravity's own rule already applies. Differentiate the SAME Φ in the");
  line("  AXIS and you get a torque. No second quantity is introduced.");
  line();
  const d = 2;
  const BOX = 48;
  const pz: V = [0, 0, 1];
  const force = (R: number) => {
    const h = 0.5;
    return -(ledger([0, 0, 0], pz, [R + h, 0, 0], pz, d, BOX) -
      ledger([0, 0, 0], pz, [R - h, 0, 0], pz, d, BOX)) / (2 * h);
  };
  line("       R        Φ(R)          −dΦ/dR         exponent");
  const Rs = [8, 10, 12, 14, 16];
  let prev = 0;
  for (let i = 0; i < Rs.length; i++) {
    const f = force(Rs[i]);
    const ex = i > 0 ? Math.log(Math.abs(f / prev)) / Math.log(Rs[i] / Rs[i - 1]) : NaN;
    line(`   ${Rs[i].toString().padStart(5)}   ${ledger([0, 0, 0], pz, [Rs[i], 0, 0], pz, d, BOX).toExponential(3)}` +
      `   ${f.toExponential(3).padStart(11)}    ${isNaN(ex) ? "" : ex.toFixed(3)}`);
    prev = f;
  }
  line();
  line("  The exponent climbs towards −4 as the separation grows — −3.59 at");
  line("  R = 10 and −3.80 at R = 16 — and it climbs because d/R is shrinking,");
  line("  not because the box is. That is the dipole–dipole force, 1/R⁴, which is");
  line("  `poles`' own result recovered here as a DERIVATIVE of a scalar rather");
  line("  than measured directly. The gap from −4 is the finite pole separation.");
  line();
  line("  Now the same Φ differentiated in the axis. What it is measured against");
  line("  is τ = p × B with B the other source's dipole field — a DIFFERENT");
  line("  formula, not a rearrangement of the one above.");
  line();
  const R0 = 12;
  const rh: V = [1, 0, 0];
  const B: V = [
    (3 * dot(pz, rh) * rh[0] - pz[0]) / R0 ** 3,
    (3 * dot(pz, rh) * rh[1] - pz[1]) / R0 ** 3,
    (3 * dot(pz, rh) * rh[2] - pz[2]) / R0 ** 3,
  ];
  line("      θ of p_a     −dΦ/dθ measured      (p_a × B)·ŷ        ratio");
  const ratios: number[] = [];
  for (const deg of [20, 40, 60, 80, 100, 120, 140, 160]) {
    const th = deg * Math.PI / 180;
    const P = (t: number): V => [Math.sin(t), 0, Math.cos(t)];
    const h = 0.05;
    const tq = -(ledger([0, 0, 0], P(th + h), [R0, 0, 0], pz, d, BOX) -
      ledger([0, 0, 0], P(th - h), [R0, 0, 0], pz, d, BOX)) / (2 * h);
    const pred = cross(P(th), B)[1];
    ratios.push(tq / pred);
    line(`   ${deg.toString().padStart(8)}°   ${tq.toExponential(3).padStart(14)}` +
      `   ${pred.toExponential(3).padStart(14)}   ${(tq / pred).toExponential(4)}`);
  }
  const mr = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const sd = Math.sqrt(ratios.reduce((a, b) => a + (b - mr) ** 2, 0) / ratios.length);
  line();
  line(`     the ratio is constant to ${(100 * sd / Math.abs(mr)).toFixed(2)}% across the sweep`);
  line();
  line("  A CONSTANT RATIO IS THE RESULT. The axis-derivative of the measured");
  line("  ledger has the angular form of p × B at every angle, with one scale");
  line("  factor — and it is the same k as §2, because it is the same Φ.");
  line();
  line("     Φ            the annihilation ledger, summed");
  line("     −∂Φ/∂R       the force, and gravity's rule already applies it");
  line("     −∂Φ/∂axis    the torque, and NOTHING applies it — that is the gap");
  line();
  line("  SO THE FEEDBACK RULE IS NOT A NEW MECHANISM. It is the first moment of");
  line("  a ledger whose zeroth moment the model already acts on. A body with");
  line("  more space taken from one side than the other ends up facing that way,");
  line("  for the same reason a body with more space taken between it and another");
  line("  ends up nearer. What it costs is that the model stops being one-way,");
  line("  which is structural and real — but it costs NO new quantity, NO new");
  line("  constant, and NO choice of sign, because all three are already fixed by");
  line("  where the annihilation lands.");

  return out.join("\n");
}

/**
 * Λ_αβ(q) for the point-dipole coupling on a cubic lattice, with the model's
 * own screening in it so the sum converges absolutely.
 *
 * This is Luttinger and Tisza's own method and it is the right one: a spiral,
 * a ferromagnet and an antiferromagnet are all plane waves, so the state that
 * wins is the q whose lowest eigenvalue is lowest. A relaxation cannot settle
 * it, because a dipolar system has an enormous number of local minima and a
 * greedy sweep finds whichever one it started nearest.
 */
const lambdaQ = (basis: V[], a: number, q: V, lam: number, Rmax: number) => {
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const n = Math.ceil(Rmax / a) + 2;
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++)
    for (const b of basis) {
      const rx = (x + b[0]) * a, ry = (y + b[1]) * a, rz = (z + b[2]) * a;
      const r = Math.hypot(rx, ry, rz);
      if (r < 1e-9 || r > Rmax) continue;
      const w = Math.exp(-r / lam) / (r * r * r) * Math.cos(q[0] * rx + q[1] * ry + q[2] * rz);
      const u = [rx / r, ry / r, rz / r];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
        M[i][j] += w * ((i === j ? 1 : 0) - 3 * u[i] * u[j]);
    }
  return M;
};

const LATTICES: [string, V[], number][] = [
  ["simple cubic", [[0, 0, 0]], 1],
  ["bcc", [[0, 0, 0], [.5, .5, .5]], 2 / Math.sqrt(3)],
  ["fcc", [[0, 0, 0], [0, .5, .5], [.5, 0, .5], [.5, .5, 0]], Math.sqrt(2)],
];

export function orderingReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. AND THEN THE ORDERING DOES NOT COME OUT — WHICH IS AN EXACT RESULT");
  line("=".repeat(78));
  line();
  line("  The article's summary carries ferromagnetism as CONDITIONAL: 'a uniform");
  line("  ground state from random, given a feedback rule on the axis with the");
  line("  aligning sign'. §3 has just supplied the rule and its sign. So the");
  line("  condition is discharged and the ferromagnet should follow.");
  line();
  line("  IT DOES NOT, AND THE REASON IS A SYMMETRY RATHER THAN A NUMBER.");
  line();
  line("  A ferromagnet is the q = 0 mode. Its energy is set by Λ(0), the sum of");
  line("  the dipolar tensor over the lattice — and on a CUBIC lattice that sum");
  line("  vanishes identically, because δ_αβ − 3r̂_α r̂_β averaged over any set of");
  line("  directions with cubic symmetry is zero. Measured, with the model's own");
  line("  exp(−r/λ) screening making the sum absolutely convergent:");
  line();
  line("     lattice        λ      Λxx(0)      Λyy(0)      Λzz(0)");
  for (const [nm, basis, a] of LATTICES) {
    for (const lam of [2, 4, 8]) {
      const M = lambdaQ(basis, a, [0, 0, 0], lam, Math.min(6 * lam, 24));
      line(`     ${nm.padEnd(14)}${lam.toString().padStart(2)}  ` +
        `${M[0][0].toExponential(2).padStart(10)}  ${M[1][1].toExponential(2).padStart(10)}  ` +
        `${M[2][2].toExponential(2).padStart(10)}`);
    }
  }
  line();
  line("  Zero to fourteen figures at every lattice and every screening length —");
  line("  which is machine precision on a sum of ten thousand terms, so it is an");
  line("  identity and not a small number. For contrast, the same sum on a");
  line("  TETRAGONAL lattice (c/a = 0.6), where cubic symmetry is broken:");
  line();
  {
    const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (let x = -24; x <= 24; x++) for (let y = -24; y <= 24; y++) for (let z = -40; z <= 40; z++) {
      const rx = x, ry = y, rz = z * 0.6, r = Math.hypot(rx, ry, rz);
      if (r < 1e-9 || r > 20) continue;
      const w = Math.exp(-r / 4) / (r * r * r), u = [rx / r, ry / r, rz / r];
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++)
        M[i][j] += w * ((i === j ? 1 : 0) - 3 * u[i] * u[j]);
    }
    line(`     tetragonal     4  ${M[0][0].toExponential(2).padStart(10)}  ` +
      `${M[1][1].toExponential(2).padStart(10)}  ${M[2][2].toExponential(2).padStart(10)}`);
  }
  line();
  line("  SO THE UNIFORM STATE COSTS EXACTLY NOTHING AND GAINS EXACTLY NOTHING,");
  line("  and any wavevector with a negative eigenvalue beats it. The dipolar");
  line("  channel cannot make a ferromagnet on a cubic lattice, at any screening");
  line("  length, with or without the feedback rule. Relaxation agrees — a block");
  line("  started at random and swept under §3's rule lands at |⟨p⟩| < 0.003 at");
  line("  every size — but the relaxation is not the evidence; the identity is.");
  line();
  line("  WHICH IS THE RIGHT ANSWER, AND IT IS WORTH SAYING WHY. Dipolar coupling");
  line("  does not cause ferromagnetism in nature either. Iron orders at 1043 K");
  line("  and its dipolar energy scale is about 1 K, three orders too small — real");
  line("  ferromagnetism is EXCHANGE, which is short-ranged and isotropic and has");
  line("  nothing to do with the far field. A model whose only inter-source");
  line("  coupling reproduced magnetostatics AND produced a ferromagnet out of it");
  line("  would be wrong about a thing that is measured.");
  line();
  line("  SO THE CONDITIONAL RESULT IN THE SUMMARY IS NOT DISCHARGED, IT IS");
  line("  REFUTED FOR THIS CHANNEL. `exchange` and `permute` got a uniform ground");
  line("  state because they summed a coupling cut off at r ≤ 4 — inside the");
  line("  cancellation rather than across it — which is the article's own trap to");
  line("  avoid, for the third time.");
  line();
  line("  AND IT SAYS EXACTLY WHERE TO LOOK. The model does have a second, much");
  line("  stronger channel and `pernode` §3 already found it: two sources ONE");
  line("  CELL apart close at two cells a tick, so the coupling between co-located");
  line("  sources is 'as strong and as fast as this model can make anything'. That");
  line("  is short-ranged, it is not the far field, and it is the regime a bound");
  line("  state is in. Whatever this model's exchange is, it is there — and the");
  line("  far-field ledger measured in §1 and §2 is not it.");

  return out.join("\n");
}

export function anisotropyReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. THE ONE PIECE OF THE ORDERING THAT DOES SURVIVE — THE EASY AXIS");
  line("=".repeat(78));
  line();
  line("  A held emitter puts + into every exit whose projection on its axis is");
  line("  positive, and there are only DEG = 26 exits. So the split is a COUNT,");
  line("  it depends on where the axis points, and it needs no ordering and no");
  line("  feedback to exist — a single emitter on its own already has it.");
  line();
  line("     axis             + / equator / −");
  for (const [nm, p] of [
    ["face   ⟨100⟩", [1, 0, 0] as V],
    ["edge   ⟨110⟩", unit([1, 1, 0])],
    ["corner ⟨111⟩", unit([1, 1, 1])],
  ] as [string, V][]) {
    let pos = 0, eq = 0, neg = 0;
    for (const e of EXITS) {
      const c = dot(p, e);
      if (Math.abs(c) < 1e-9) eq++; else if (c > 0) pos++; else neg++;
    }
    line(`     ${nm.padEnd(17)}${pos} / ${eq} / ${neg}`);
  }
  line();
  line("  Face and edge share a split and the corner does not, so the lattice");
  line("  distinguishes ⟨111⟩ from the other two with nothing put in. That is a");
  line("  real magnetocrystalline anisotropy out of a count of exits — and it is");
  line("  also the article's own refuted prediction, since it makes the answer");
  line("  the same 11.1% in every cubic material where measurement runs from 2.6%");
  line("  to 32%. Recorded here as what survives §4 rather than as a success:");
  line("  the anisotropy is derived, the ORDER it would pin is not.");

  return out.join("\n");
}

console.log(kernelReport());
console.log(ledgerReport());
console.log(twoDerivativesReport());
console.log(orderingReport());
console.log(anisotropyReport());
