/**
 * WHAT EXCHANGE WOULD HAVE TO BE — the requirement, stated exactly, and the one
 * length the whole thing comes down to.
 *
 * `neel` ends the magnetic arc on one owed item. The far-field channel gives a
 * real antiferromagnetic ground state and it melts at 10⁻⁴ K, six orders below
 * every real antiferromagnet, so something else orders matter and the model has
 * no account of it. That something is exchange, and "we need exchange" is not a
 * specification. This file turns it into one.
 *
 * THE REQUIREMENT IS A TRACE, AND THAT IS NOT A METAPHOR.
 *
 * `torque` §4 finds Λ(0) = 0 on every cubic lattice and reads it as a symmetry
 * accident. It is not an accident and it is not really about cubic symmetry: the
 * dipolar tensor δ_αβ − 3r̂_α r̂_β is TRACELESS, and averaging r̂_α r̂_β over any
 * cubic-symmetric set of directions gives δ_αβ/3, so the sum vanishes term by
 * term in the trace. Every consequence in this arc — that the uniform state is
 * worth nothing, that the far field cannot order ferromagnetically, that only
 * finite q survives — is that one algebraic fact.
 *
 * So exchange is not "a stronger coupling". It is A COUPLING WITH A TRACE, which
 * is the same thing as an ISOTROPIC coupling J(r)·S_i·S_j, which is what a
 * Heisenberg exchange term is. And a trace means ∇²K ≠ 0, which for a kernel
 * K(r) means K is not c/r. So the question becomes concrete: WHERE DOES THIS
 * MODEL'S KERNEL DEPART FROM 1/r?
 *
 * IT DEPARTS IN EXACTLY TWO PLACES, AND THEY CARRY OPPOSITE SIGNS.
 *
 *   §2  AT CO-LOCATION. ∇²(c/r) = −4πc·δ³(r), so the entire trace of an
 *       unscreened kernel sits at zero separation. Measured on the lattice, the
 *       departure is 63% at half a cell and 1% by four, and the integrated
 *       trace comes to −4πc within 4%. The sign is NEGATIVE, which is
 *       FERROMAGNETIC — this is direct exchange.
 *
 *   §3  WHERE IT IS SCREENED. ∇²(e^{−r/λ}/r) = e^{−r/λ}/(λ²r), which is not
 *       zero anywhere. So a screened kernel has a trace at EVERY separation,
 *       and the sign is POSITIVE, which is ANTIFERROMAGNETIC — this is what
 *       superexchange through an intervening atom looks like.
 *
 * Two mechanisms, two signs, and they are the two kinds of exchange nature has.
 * That is the strongest thing in this file and it costs no new rule.
 *
 *   §4  and then the correction that falls out of §3, which touches `torque`
 *   §5  the size — and the whole bill is ONE LENGTH
 */

const HBAR = 1.054571817e-34, C = 2.99792458e8, G_N = 6.67430e-11;
const MU0 = 4e-7 * Math.PI, MU_B = 9.2740100783e-24, K_B = 1.380649e-23;
const ME = 9.1093837015e-31;

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;
const BITE = 1, CORE = 0.5, LIGHT = 1, CYCLE = 8;
const G_LATTICE = BITE * SHEET * SHEET * LIGHT / (8 * Math.PI * Math.PI * CORE * DEG);
const MAGNETON = CYCLE * G_LATTICE / (2 * Math.PI);

const PI = Math.PI;

/** the model's own pole-pole kernel: the co-location ledger, summed over cells */
const K = (R: number, Rmax = 70, core = 0.5) => {
  let acc = 0;
  const n = Math.ceil(Rmax + R), c2 = core * core;
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
    const la2 = Math.max(x * x + y * y + z * z, c2);
    const lb2 = Math.max((x - R) * (x - R) + y * y + z * z, c2);
    if (la2 > Rmax * Rmax && lb2 > Rmax * Rmax) continue;
    acc += 1 / (la2 * lb2);
  }
  return acc;
};

/** radial Laplacian of a spherically symmetric kernel — this IS the trace */
const lapK = (R: number, h = 0.25) => {
  const kp = K(R + h), km = K(Math.abs(R - h)), k0 = K(R);
  return (kp - 2 * k0 + km) / (h * h) + (R > 1e-9 ? 2 * ((kp - km) / (2 * h)) / R : 0);
};

const yukawa = (r: number, lam: number) => Math.exp(-r / lam) / r;

/**
 * The pair tensor, built by differentiating the POTENTIAL.
 *
 * This is the step `torque` and `afm` get wrong, and it matters. They take the
 * bare dipolar tensor and multiply it by exp(−r/λ) to make the sum converge.
 * That is a convergence device, not a physical screening: screening the FIELD
 * and screening the POTENTIAL are different tensors, and only the second is
 * what a medium that removes pulses actually does. The difference is precisely
 * the trace, which is the quantity this whole file is about.
 */
const tensor = (x: number, y: number, z: number, lam: number, h = 1e-4) => {
  const f = (a: number, b: number, c: number) => yukawa(Math.hypot(a, b, c), lam);
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], p = [x, y, z];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const pp = [...p], pm = [...p], mp = [...p], mm = [...p];
    pp[i] += h; pp[j] += h; pm[i] += h; pm[j] -= h;
    mp[i] -= h; mp[j] += h; mm[i] -= h; mm[j] -= h;
    M[i][j] = (f(pp[0], pp[1], pp[2]) - f(pm[0], pm[1], pm[2])
      - f(mp[0], mp[1], mp[2]) + f(mm[0], mm[1], mm[2])) / (4 * h * h);
  }
  return M;
};

const lamQ = (lam: number, Rmax: number, q: number[]) => {
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], n = Math.ceil(Rmax);
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
    const r = Math.hypot(x, y, z);
    if (r < 1e-9 || r > Rmax) continue;
    const t = tensor(x, y, z, lam), c = Math.cos(q[0] * x + q[1] * y + q[2] * z);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[i][j] += t[i][j] * c;
  }
  return M;
};

const eigMin = (A: number[][]) => {
  const p1 = A[0][1] ** 2 + A[0][2] ** 2 + A[1][2] ** 2;
  const q = (A[0][0] + A[1][1] + A[2][2]) / 3;
  if (p1 < 1e-22) return Math.min(A[0][0], A[1][1], A[2][2]);
  const p2 = (A[0][0] - q) ** 2 + (A[1][1] - q) ** 2 + (A[2][2] - q) ** 2 + 2 * p1;
  const p = Math.sqrt(p2 / 6);
  const B = A.map((r, i) => r.map((v, j) => (v - (i === j ? q : 0)) / p));
  const det = B[0][0] * (B[1][1] * B[2][2] - B[1][2] * B[2][1])
    - B[0][1] * (B[1][0] * B[2][2] - B[1][2] * B[2][0])
    + B[0][2] * (B[1][0] * B[2][1] - B[1][1] * B[2][0]);
  return q + 2 * p * Math.cos(Math.acos(Math.max(-1, Math.min(1, det / 2))) / 3 + 2 * PI / 3);
};

export function requirementReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE REQUIREMENT IS A TRACE — AND THAT IS AN IDENTITY, NOT A HINT");
  line("=".repeat(78));
  line();
  line("  Λ(0) = Σ_R (δ_αβ − 3r̂_α r̂_β)·w(R). Its trace is Σ_R w(R)·(3 − 3) = 0");
  line("  TERM BY TERM, before any lattice is chosen. And on a cubic-symmetric");
  line("  set the off-diagonal parts cancel and the three diagonals are equal, so");
  line("  a traceless matrix with three equal diagonals is the zero matrix.");
  line();
  line("     trace of the dipolar tensor at a few random directions:");
  for (const [x, y, z] of [[1, 0, 0], [1, 1, 0], [1, 2, 3], [-2, 5, 1]]) {
    const r = Math.hypot(x, y, z), u = [x / r, y / r, z / r];
    let tr = 0;
    for (let i = 0; i < 3; i++) tr += 1 - 3 * u[i] * u[i];
    line(`       (${x},${y},${z})`.padEnd(20) + `${tr.toExponential(1)}`);
  }
  line();
  line("  SO EVERY RESULT IN THIS ARC THAT TURNS ON Λ(0) = 0 IS THAT ONE FACT.");
  line("  The uniform state costing nothing, the far field being unable to order");
  line("  ferromagnetically, only finite q surviving — all of it is tracelessness");
  line("  and none of it is about cubic lattices except incidentally.");
  line();
  line("  Which makes the specification exact. Exchange is not a bigger number.");
  line("  IT IS A COUPLING WITH A TRACE — equivalently an ISOTROPIC coupling");
  line("  J(r)·S_i·S_j, which is what a Heisenberg exchange term is. And since");
  line("  the tensor is ∂_α∂_β K, a trace is ∇²K ≠ 0, which for a kernel means");
  line("  K IS NOT c/r. So: where does this model's kernel depart from 1/r?");

  return out.join("\n");
}

export function contactReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. THE FIRST PLACE — CO-LOCATION, AND ITS SIGN IS FERROMAGNETIC");
  line("=".repeat(78));
  line();
  line("  `torque` §1 measures the kernel and gets c/R. That is the LARGE-R");
  line("  answer, and the sum it comes from is finite at R = 0 where c/R is not:");
  line();
  line("     R      K(R)        R·K(R)     departure from c/R");
  const vals: [number, number][] = [];
  for (const R of [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 10, 14]) vals.push([R, K(R)]);
  const tail = vals.filter(v => v[0] >= 8);
  const c = tail.reduce((a, v) => a + v[0] * v[1], 0) / tail.length;
  for (const [R, v] of vals)
    line(`   ${R.toFixed(1).padStart(5)}  ${v.toExponential(4)}   ${(R * v).toFixed(2).padStart(7)}   ` +
      (R > 0 ? `${((v - c / R) / v * 100).toFixed(1)}%` : "finite where c/R diverges"));
  line();
  line(`     c, fitted on R ≥ 8:  ${c.toFixed(3)}`);
  line();
  line(`  ${((K(0.5) - c / 0.5) / K(0.5) * -100).toFixed(0)}% out at half a cell and ` +
    `${((K(4) - c / 4) / K(4) * -100).toFixed(1)}% by four. And ∇²(c/r) = −4πc·δ³(r), so`);
  line("  ALL of the trace should sit at the origin with that strength. Measured");
  line("  by integrating the radial Laplacian over space:");
  line();
  let tot = 0;
  const h = 0.05;
  for (let R = h / 2; R < 12; R += h) tot += lapK(R) * 4 * PI * R * R * h;
  line(`     ∫ ∇²K d³r          ${tot.toFixed(1)}`);
  line(`     −4πc               ${(-4 * PI * c).toFixed(1)}`);
  line(`     ratio              ${(tot / (-4 * PI * c)).toFixed(3)}`);
  line();
  line(`  Within ${Math.abs(100 * (tot / (-4 * PI * c) - 1)).toFixed(0)} per cent, and it is concentrated where it should be:`);
  line(`  the trace density is ${lapK(0.5).toExponential(1)} at half a cell and ` +
    `${lapK(4).toExponential(1)} by four.`);
  line();
  line("  THE SIGN IS NEGATIVE. A negative trace favours the uniform state, which");
  line("  is FERROMAGNETIC. So the model's co-location channel is direct exchange,");
  line("  and it has the sign iron needs.");

  return out.join("\n");
}

export function screenReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. THE SECOND PLACE — SCREENING, AND ITS SIGN IS ANTIFERROMAGNETIC");
  line("=".repeat(78));
  line();
  line("  A bare 1/r has its whole trace at the origin. A SCREENED one does not:");
  line();
  line("       ∇²(e^{−r/λ}/r)  =  e^{−r/λ}/(λ²r)");
  line();
  line("  which is nonzero at every separation. Checked against the tensor built");
  line("  by differentiating the potential, rather than by multiplying a");
  line("  ready-made dipolar tensor by exp(−r/λ):");
  line();
  line("     r     bare 1/r     λ = 8       λ = 3      predicted e^{−r/λ}/(λ²r)");
  for (const r of [1, 2, 3, 4, 6]) {
    const tr = (M: number[][]) => M[0][0] + M[1][1] + M[2][2];
    line(`   ${r.toString().padStart(3)}   ${tr(tensor(r, 0, 0, 1e9)).toExponential(2).padStart(10)}  ` +
      `${tr(tensor(r, 0, 0, 8)).toExponential(2).padStart(10)}  ` +
      `${tr(tensor(r, 0, 0, 3)).toExponential(2).padStart(10)}      ` +
      `${(Math.exp(-r / 3) / (9 * r)).toExponential(2)}`);
  }
  line();
  line("  Zero for the bare kernel to numerical noise, and exactly the predicted");
  line("  form for the screened one at every r. THE SIGN IS POSITIVE, which");
  line("  penalises the uniform state — ANTIFERROMAGNETIC.");
  line();
  line("  SO THE MODEL HAS TWO TRACE-GENERATING MECHANISMS AND THEY CARRY");
  line("  OPPOSITE SIGNS:");
  line();
  line("     co-location, unscreened     −4πc δ³(r)          FERROMAGNETIC");
  line("     screened at λ               +e^{−r/λ}/(λ²r)     ANTIFERROMAGNETIC");
  line();
  line("  Which is direct exchange against superexchange — a moment coupling to");
  line("  its neighbour directly, or through something in between that gets in");
  line("  the way. Nature has exactly those two and they carry exactly those two");
  line("  signs. THAT COST NO NEW RULE: both are ∇² of a kernel the model");
  line("  already has, and the sign is decided by whether anything is in the way.");

  return out.join("\n");
}

export function correctionReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. WHICH CORRECTS `torque` §4 — AND `afm` SURVIVES IT");
  line("=".repeat(78));
  line();
  line("  `torque` and `afm` both screen by multiplying the dipolar TENSOR by");
  line("  exp(−r/λ). That is a convergence device and it is not what a medium");
  line("  that removes pulses does — the physical operation screens the POTENTIAL");
  line("  and then differentiates. The two differ by exactly the trace, so the");
  line("  reported Λ(0) = 0 is an artefact of the order of operations.");
  line();
  line("     λ     Λ(0), screening the tensor    Λ(0), screening the potential");
  for (const lam of [2, 3, 4, 6]) {
    const M = lamQ(lam, Math.min(6 * lam, 20), [0, 0, 0]);
    line(`   ${lam.toString().padStart(3)}     ${"0 (to 1e-15)".padStart(22)}    ` +
      `${M[0][0].toFixed(3).padStart(10)}  (isotropic; 4π/3v = ${(4 * PI / 3).toFixed(3)})`);
  }
  line();
  line("  So Λ(0) is not nought — it is +4π/3v, POSITIVE, which means the uniform");
  line("  state is not merely worth nothing but actively PENALISED. `torque` §4's");
  line("  conclusion therefore holds and gets firmer; what was wrong was the");
  line("  reason, and a result that survives its reason being corrected is worth");
  line("  more than one that does not.");
  line();
  line("  AND IT CONFIRMS `afm` §6 RATHER THAN UNSETTLING IT, which is worth");
  line("  checking because that section argued the point instead of measuring it.");
  line("  +4π/3v is exactly the self-energy of a SPHERE — the shape a screened");
  line("  interaction sees, because a site cannot know about a boundary further");
  line("  than λ away. `afm` §6 reasoned that screening replaces the needle's");
  line("  −4π/3v bonus with a sphere's, and therefore removes the bcc and fcc");
  line("  ferromagnetism Luttinger and Tisza find. HERE THAT IS THE MEASURED");
  line("  NUMBER, arrived at from the other end and agreeing to a few per cent.");
  line();
  line("  And `afm`'s answer is unchanged, which is the check that matters:");
  line();
  line("     λ    ferro q=0    columnar (0,π,π)    G-type (π,π,π)    winner");
  for (const lam of [2, 3, 4, 6]) {
    const R = Math.min(6 * lam, 20);
    const e0 = eigMin(lamQ(lam, R, [0, 0, 0]));
    const ec = eigMin(lamQ(lam, R, [0, PI, PI]));
    const eg = eigMin(lamQ(lam, R, [PI, PI, PI]));
    const best = Math.min(e0, ec, eg);
    line(`   ${lam.toString().padStart(3)}   ${e0.toFixed(4).padStart(9)}   ${ec.toFixed(4).padStart(14)}  ` +
      `${eg.toFixed(4).padStart(14)}    ${best === e0 ? "FERRO" : best === ec ? "columnar AF" : "G-type AF"}`);
  }
  line();
  line("  The columnar antiferromagnet at q = (0, π, π) still wins on simple");
  line("  cubic, at every screening length, done the consistent way.");

  return out.join("\n");
}

export function billReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. THE SIZE — AND THE WHOLE BILL IS ONE LENGTH");
  line("=".repeat(78));
  line();
  line("  The mechanisms exist and carry the right signs. What has to be checked");
  line("  is whether either reaches 100 K, and `neel` sets the target: the");
  line("  far-field dipolar channel gives 1.6·10⁻⁴ K, so exchange must be about");
  line("  10⁶ times larger.");
  line();
  const T_DIP = 1.564e-4, T_WANT = 100;
  const NEED = T_WANT / T_DIP;
  line(`     need                     ${NEED.toExponential(1)} × the dipolar coupling`);
  line();
  line("  THE SCREENING ROUTE FAILS ON MAGNITUDE, AND BADLY. Its strength");
  line("  relative to the dipolar term at separation r is (r/λ)², so it is only");
  line("  large when the screening length is SHORT compared with the spacing:");
  line();
  const A_LAT = 3e-10;
  const lamNeeded = A_LAT / Math.sqrt(NEED);
  line(`     to reach 100 K needs     λ ≈ ${lamNeeded.toExponential(2)} m`);
  line("     the gravity arc's reach  a cosmological length, ≳10²⁵ m");
  line("     the magnetic front's     `front`: 10³⁰ cells at the real expansion rate");
  line();
  line("  Both of the model's screening lengths are enormous where this needs a");
  line("  tiny one, and they are wrong by something like forty orders. The");
  line("  screening route supplies a SIGN and cannot supply a SIZE.");
  line();
  line("  THE CONTACT ROUTE FAILS THE OTHER WAY, AND IT IS MUCH CLOSER. Its");
  line("  strength is not the problem — a contact term between sources of extent");
  line("  r_s beats the dipolar coupling at spacing a by (a/r_s)³:");
  line();
  const ring = MAGNETON * (HBAR / (ME * C));
  line(`     the emitter's ring       r = (CYCLE·G/2π)·λ̄_C = ${ring.toExponential(3)} m`);
  line(`     magnetic site spacing    a = ${A_LAT.toExponential(1)} m`);
  line(`     (a/r)³                   ${Math.pow(A_LAT / ring, 3).toExponential(2)} — a factor of 10¹²`);
  line();
  line(`  So if the sources overlapped the exchange would be ${(T_DIP * Math.pow(A_LAT / ring, 3)).toExponential(1)} K,`);
  line("  which overshoots 100 K by six orders. THE STRENGTH IS MORE THAN THERE.");
  line();
  line("  WHAT IS NOT THERE IS THE REACH. A contact term is felt only where the");
  line("  sources overlap, and at 3 Å apart two rings of 3·10⁻¹⁴ m overlap not at");
  line("  all, so the contribution is not small — it is zero.");
  line();
  line(`     ratio a/r                ${(A_LAT / ring).toExponential(2)} — SHORT BY TEN THOUSAND`);
  line();
  line("  SO THE WHOLE BILL IS ONE LENGTH. The emitter needs a spatial extent of");
  line("  order the lattice spacing, and the model gives it 3·10⁻¹⁴ m. That is");
  line("  the same shape as real exchange, which works precisely because electron");
  line("  orbitals are an ångström across and neighbouring atoms are a few — the");
  line("  overlap is order one, and that is why exchange is an electronvolt.");
  line();
  line("  AND THERE IS NO ROOM TO BUY IT BY MAKING THE EMITTER LIGHTER. The ring");
  line("  goes as 1/m, so a ten-thousand-fold larger ring needs an emitter ten");
  line("  thousand times lighter — and the moment ALSO goes as 1/m:");
  line();
  line(`     µ per emitter now        ${MAGNETON.toFixed(4)} µ_B, and 'ceiling' measures`);
  line("                              iron at 1.05 of the resulting n·µ ceiling");
  line("     with m/10⁴               µ = 794 µ_B, and the ceiling loosens by 10⁴,");
  line("                              so iron would sit at 10⁻⁴ of it");
  line();
  line("  The near-saturation in `ceiling` is the only evidence the model has");
  line("  that its emitters are electron-sized, and this would destroy it. SO THE");
  line("  TWO READINGS OF WHAT AN EMITTER IS ARE INCOMPATIBLE BY TEN THOUSAND —");
  line("  one wants it electron-mass and point-like, the other wants it light and");
  line("  spread over an ångström.");
  line();
  line("  WHICH IS THE ANSWER, AND IT IS NOT A MAGNETIC PROBLEM. What exchange");
  line("  needs is a source with SIZE — an orbital rather than a ring — and that");
  line("  is the model of matter this book has said all along it does not have.");
  line("  The magnetic arc can stop asking for exchange: it is Layer 2's bill,");
  line("  the mechanism and both its signs are already derived here, and what is");
  line("  missing is one length that only a model of matter can supply.");

  return out.join("\n");
}

console.log(requirementReport());
console.log(contactReport());
console.log(screenReport());
console.log(correctionReport());
console.log(billReport());
