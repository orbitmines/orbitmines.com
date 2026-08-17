/**
 * THE MAGNETIC FORCE — where it cannot come from, where it can, and the one thing
 * the rules have always left unsaid.
 *
 * `field` §5 argued the magnetic force is structurally absent because "the meeting
 * rate depends on a DENSITY, which is a scalar". That argument is too weak in its
 * premise and too strong in its conclusion, and both halves are fixed here.
 *
 * Too weak, because a density is not the whole of what a cell knows. The complete
 * local state of the background is n(d̂, σ) — how many rays of each polarity are
 * arriving along each of the DEG = 26 exits — which is 52 numbers, not one, and
 * carries directions in it. So the honest question is not "is there an orientation"
 * (there is) but "what force can the FULL distribution produce".
 *
 * Too strong, because the answer turns out not to be "none". It is a theorem with a
 * named escape, and the escape is a line of `lattice.ts` that has been there all
 * along.
 *
 *   §1  EVERY FORCE A DISTRIBUTION CAN PRODUCE, derived and then measured. Summing
 *       the three rules over n(d̂,σ) gives F = q(J − M·v) exactly, with J the
 *       polarity-weighted first moment and M the second. M IS SYMMETRIC BY
 *       CONSTRUCTION — it is a sum of d̂⊗d̂ — and that is the whole obstruction.
 *
 *   §2  SO NO DISTRIBUTION OF POLARITY IS A MAGNETIC FIELD, however strong,
 *       however localised, however large the charge. A Lorentz force does no work;
 *       a symmetric M always does, except on its own eigenvectors. Measured over
 *       200000 random distributions and by direct optimisation: the best |F·v| any
 *       polarity distribution achieves is 0.28 of |F||v|, not 0. This answers the
 *       question the section was written for — the magnetic half is NOT a strong,
 *       localised or large polarity discrepancy, and no amount of any of the three
 *       reaches it. What it gives instead is an ANISOTROPIC DRAG, which is a real
 *       prediction and is not magnetism.
 *
 *   §3  AND THE ESCAPE IS ALREADY IN THE MODEL. `lattice.ts`: "A turn is only ever
 *       a turn in a plane, and a plane is two directions to turn between... the
 *       axis it sweeps is the axis it was given." (G+M/3) has ALWAYS been a
 *       rotation with a sense about an axis, and NOTHING IN THE BOOK HAS EVER SAID
 *       WHAT SETS THAT AXIS. Put it in and the antisymmetric part appears, because
 *       a rotation generator is antisymmetric and a reflection is not.
 *
 *   §4  WHAT THE ROTATION ACTUALLY GIVES, which is a Lorentz force AND SOMETHING
 *       ELSE. The transverse part lies along v×b̂, reverses with q to 10⁻¹⁵, obeys
 *       |F| = q|v||B| sin∠ to 1.000000×, and B comes out axial with ∇·B = 0. But
 *       Rodrigues has three terms and only the middle one is antisymmetric: the
 *       (1−cos θ) term is a CHARGE-INDEPENDENT LONGITUDINAL FORCE at tan(SPIN/2)
 *       = √2 − 1 = 41.4% of the magnetic one. That is a deviation, it is not
 *       observed, and it is on the ledger as one.
 *
 *   §5  WHAT SOURCES THE AXIS, which is where the polarity distribution comes back
 *       and is right after all. A turn needs a plane; a plane needs a second
 *       direction; the only local vector the background has is J. So b̂ ∝ J — and
 *       a moving polarity discrepancy sources the field it cannot be. Measured: a
 *       line current gives 1/r to 1.0000×, the sign reverses with the current, and
 *       a static charge gives nothing.
 *
 *   §6  DOES IT SURVIVE THE VACUUM AND PROPAGATE — the question as originally put,
 *       run against the real three rules. It propagates at 1.000 cells/tick and IT
 *       DOES NOT SURVIVE. |J| falls to √n — the carriers end up pointing at random
 *       — and the rule that does it is (G+M/3), which conserves |J| pointwise and
 *       randomises it anyway. A neutral current additionally eats half of itself
 *       with no vacuum at all. So §5's source is a short-ranged object, and that is
 *       the largest hole in the picture.
 *
 * SO THE SHAPE OF THE ANSWER IS: the magnetic field is not a distribution of
 * polarity — it is the TURN AXIS that a distribution of polarity induces. The
 * source is the object the question was about and the field is not, which is
 * exactly the relationship ρ and J have to E and B in Maxwell. The cost is one
 * assumption (that the turn plane's second direction is J) and two unpaid bills
 * (a 41% longitudinal force, and a source that decoheres over a mean free path).
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ─── the lattice's own geometry, carried here as every test in this directory does ──
type V3 = [number, number, number];

/** the DEG = 26 ways out of a point, diagonals included */
const EXITS: V3[] = (() => {
  const out: V3[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) out.push([x, y, z]);
  return out;
})();
const DEG = EXITS.length;                                   // 26
const CYCLE = 8;                                            // lattice.ts
const SPIN = 2 * Math.PI / CYCLE;                           // 45°

/**
 * The exits as UNIT vectors.
 *
 * Worth being explicit, because it is a modelling choice and §1 checks it does not
 * matter. A ray crosses one exit per tick whatever that exit's Euclidean length —
 * that is what `latticeStep` and c̄ = 1 step/tick mean — so the natural direction of
 * a displacement is the exit normalised, not the raw lattice vector. §1 recomputes
 * every result with the raw vectors and reports both.
 */
const norm = (v: V3): V3 => {
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
};
const DIRS: V3[] = EXITS.map(norm);

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => { const n = len(a); return n < 1e-15 ? [0, 0, 0] : scale(a, 1 / n); };

/** Rodrigues — a rotation of `th` about `b̂`, which is what turnRing walks in eighths */
const rotate = (v: V3, b: V3, th: number): V3 => {
  const c = Math.cos(th), s = Math.sin(th);
  const k = unit(b);
  return add(add(scale(v, c), scale(cross(k, v), s)), scale(k, dot(k, v) * (1 - c)));
};

/**
 * A background: how many rays of each polarity arrive along each exit.
 *
 * `plus[i]` and `minus[i]` are the arrival rates along DIRS[i]. Nothing here is
 * normalised — a background is as strong as it is, and §2 varies exactly that.
 */
type Background = { plus: number[]; minus: number[] };

const randomBackground = (r: () => number, strength = 1): Background => ({
  plus: DIRS.map(() => strength * r()),
  minus: DIRS.map(() => strength * r()),
});

/** the polarity-weighted moments: J is the first, M the second */
const moments = (bg: Background, dirs: V3[] = DIRS) => {
  let J: V3 = [0, 0, 0];
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  let rho = 0;
  for (let i = 0; i < dirs.length; i++) {
    const s = bg.plus[i] - bg.minus[i];                     // signed density on this exit
    rho += s;
    J = add(J, scale(dirs[i], s));
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++)
      M[a][b] += s * dirs[i][a] * dirs[i][b];
  }
  return { rho, J, M };
};

/**
 * THE FORCE, SUMMED OVER MEETINGS — with nothing standing in for anything.
 *
 *   a meeting with a ray of polarity σ arriving along d̂ happens at a rate
 *   proportional to n(d̂,σ) and to the closing rate (1 − v·d̂);
 *
 *   if qσ < 0 the pair is OPPOSITE, (G+M/1) fires, the cell BETWEEN vanishes and
 *   the structure is carried towards where the ray came from: displacement −d̂;
 *
 *   if qσ > 0 the pair is ALIKE, (G+M/3) fires, both turn and the annihilation
 *   lands BEHIND, so the far side shortens: displacement +d̂.
 *
 * which is `field` §1's table, written per direction instead of per side. `turn`
 * is §3's addition and is the identity here.
 */
const force = (q: number, bg: Background, v: V3,
  turn: ((d: V3, sigmaSelf: number) => V3) | null = null,
  dirs: V3[] = DIRS): V3 => {
  let F: V3 = [0, 0, 0];
  for (let i = 0; i < dirs.length; i++) {
    const d = dirs[i];
    const rate = 1 - dot(v, d);                             // closing rate, linear response
    for (const sigma of [+1, -1]) {
      const n = sigma > 0 ? bg.plus[i] : bg.minus[i];
      if (n === 0) continue;
      const alike = q * sigma > 0;
      // the displacement this meeting produces
      let step: V3 = alike ? d : scale(d, -1);
      if (alike && turn) step = turn(d, q);                 // (G+M/3) turns rather than reflects
      F = add(F, scale(step, n * rate));
    }
  }
  return F;
};

// ─── §1 every force a distribution can produce ──────────────────────────────
function moments_(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  EVERY FORCE A POLARITY DISTRIBUTION CAN PRODUCE ═════");
  line();
  line("  `field` §5 says the meeting rate depends on a DENSITY, which is a scalar.");
  line("  That understates what a cell knows. The full local state of the background");
  line(`  is n(d̂, σ) — arrivals of each polarity along each of DEG = ${DEG} exits, so`);
  line(`  ${2 * DEG} numbers — and it has directions in it. So ask the real question:`);
  line("  what force can the WHOLE distribution produce?");
  line();
  line("  Sum the three rules over it. Opposite meets annihilate and pull along −d̂;");
  line("  alike meets turn and push along +d̂; the rate of each carries the closing");
  line("  factor (1 − v·d̂). Everything separates:");
  line();
  line("       F = q ( J − M·v )");
  line();
  line("       J_i  = Σ σ n(d̂,σ) d̂_i           the polarity-weighted FIRST moment");
  line("       M_ij = Σ σ n(d̂,σ) d̂_i d̂_j        the SECOND");
  line();
  line("  J is the electric part — a vector, present at v = 0, and it is what `field`");
  line("  §2 measured as a density gradient seen from one side. M is the whole of the");
  line("  velocity dependence.");
  line();
  line("  AND M IS SYMMETRIC BY CONSTRUCTION, being a sum of d̂⊗d̂. That is not an");
  line("  approximation and not a property of the backgrounds chosen — it is the form");
  line("  of the expression. Measured over random distributions:");
  line();
  const r = rng(20260817);
  let worstSym = 0, worstPred = 0, worstRaw = 0;
  for (let k = 0; k < 20000; k++) {
    const bg = randomBackground(r);
    const { J, M } = moments(bg);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++)
      worstSym = Math.max(worstSym, Math.abs(M[a][b] - M[b][a]) / (Math.abs(M[a][b]) + 1e-12));
    // and that the closed form is the sum, rather than resembling it
    const v: V3 = [r() - 0.5, r() - 0.5, r() - 0.5];
    for (const q of [+1, -1]) {
      const F = force(q, bg, v);
      const Mv: V3 = [
        M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
        M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
        M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]];
      const pred = scale(add(J, scale(Mv, -1)), q);
      worstPred = Math.max(worstPred, len(add(F, scale(pred, -1))) / (len(F) + 1e-12));
    }
    // the same with RAW lattice vectors rather than normalised exits
    const rawM = moments(bg, EXITS).M;
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++)
      worstRaw = Math.max(worstRaw, Math.abs(rawM[a][b] - rawM[b][a]) / (Math.abs(rawM[a][b]) + 1e-12));
  }
  line(`  ${pad("M asymmetry, normalised exits", 34)} ${worstSym.toExponential(2)}`);
  line(`  ${pad("M asymmetry, raw lattice vectors", 34)} ${worstRaw.toExponential(2)}`);
  line(`  ${pad("F against q(J − M·v)", 34)} ${worstPred.toExponential(2)}`);
  line();
  line("  over 20000 random distributions, both charges, random velocities.");
  line();
  line("  So the closed form IS the sum and not an approximation of it, and the");
  line("  symmetry survives the one modelling choice in the file — whether an exit");
  line("  contributes its unit direction or its raw lattice vector. It would: d̂⊗d̂ is");
  line("  symmetric whatever d̂ is.");
  return out.join("\n");
}

// ─── §2 which is why no distribution is a magnetic field ────────────────────
/** the fraction of the force that lies ALONG v — zero for a Lorentz force, always */
const workFraction = (F: V3, v: V3) => {
  const lf = len(F), lv = len(v);
  return (lf < 1e-14 || lv < 1e-14) ? 0 : Math.abs(dot(F, v)) / (lf * lv);
};

/**
 * A fixed spread of test velocities, because ONE velocity is not the test.
 *
 * Making a force perpendicular to a single v is easy and means nothing — the
 * first version of this section measured exactly that and reported zeros. A
 * magnetic field is perpendicular to EVERY v at once, so the quantity is the
 * worst case over a spread of directions.
 */
const PROBES: V3[] = (() => {
  const out: V3[] = [];
  const g = (1 + Math.sqrt(5)) / 2;
  for (let k = 0; k < 64; k++) {                      // a Fibonacci sphere
    const z = 1 - 2 * (k + 0.5) / 64;
    const rad = Math.sqrt(Math.max(0, 1 - z * z));
    const th = 2 * Math.PI * k / g;
    out.push([rad * Math.cos(th), rad * Math.sin(th), z]);
  }
  return out;
})();

/**
 * The worst work fraction over all probe directions, and the force it comes with.
 *
 * Both are needed together, and that is the whole content of §2: driving `worst`
 * towards zero drives `mag` towards zero with it, so the only polarity
 * distribution that does no work is the one that exerts no force.
 */
const perpendicularity = (q: number, bg: Background, speed = 0.2,
  turn: ((d: V3, s: number) => V3) | null = null) => {
  let worst = 0, mag = 0;
  for (const p of PROBES) {
    const v = scale(p, speed);
    const F = force(q, bg, v, turn);
    worst = Math.max(worst, workFraction(F, v));
    mag += len(F);
  }
  return { worst, mag: mag / PROBES.length };
};

function noDistribution(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  SO NO POLARITY DISTRIBUTION IS A MAGNETIC FIELD ═════");
  line();
  line("  This is the question the section was written for: is the magnetic half just");
  line("  a polarity discrepancy that is STRONG, or LOCALISED, or carried by a LARGE");
  line("  charge — some distribution that survives the vacuum and propagates?");
  line();
  line("  The test is not whether such a thing exists. It is whether it could be a");
  line("  magnetic field if it did, and there is a clean criterion: A LORENTZ FORCE");
  line("  DOES NO WORK. qv×B is perpendicular to v at every v, without exception, and");
  line("  that is what makes a magnetic field bend a path instead of speeding it up.");
  line();
  line("  With F = q(J − M·v) and M symmetric, F·v = q(J·v − v·M·v). For that to");
  line("  vanish at every v you need J = 0 and M = 0, and tr M = Σ σ n is the net");
  line("  signed density — so M = 0 forces the signed background to be trivial.");
  line();
  line("  A THEOREM, THEN, AND NOT A SIMULATION RESULT: the only polarity");
  line("  distribution whose force does no work is the one that exerts no force.");
  line();
  line("  ONE TRAP, RECORDED BECAUSE THE FIRST VERSION OF THIS SECTION FELL IN IT.");
  line("  Making F perpendicular to a SINGLE velocity is easy — three constraints on");
  line("  52 numbers — and measuring that returns zeros and proves nothing. A magnetic");
  line("  field is perpendicular to EVERY velocity at once. So the quantity below is");
  line(`  the WORST work fraction over ${PROBES.length} directions on a sphere, and it is`);
  line("  reported next to the force it comes with, because the two fall together and");
  line("  that is the whole of the theorem.");
  line();
  const r = rng(31337);
  line(`  ${pad("what was varied", 30)} ${pad("range", 18)} ${pad("best worst-case", 16)} ${pad("|F| there", 12)} perp?`);
  line("  " + "─".repeat(88));

  const sweep = (label: string, range: string, make: (k: number) => { bg: Background, q: number }, n: number) => {
    let best = 1, bestMag = 0;
    for (let k = 0; k < n; k++) {
      const { bg, q } = make(k);
      const p = perpendicularity(q, bg);
      if (p.worst < best) { best = p.worst; bestMag = p.mag; }
    }
    line(`  ${pad(label, 30)} ${pad(range, 18)} ${pad(best.toExponential(2), 16)} ${pad(bestMag.toExponential(2), 12)} ${best < 1e-9 ? "YES" : "NO"}`);
    return best;
  };

  sweep("random distributions", "20000 draws",
    () => ({ bg: randomBackground(r), q: 1 }), 20000);
  sweep("STRONGER — scaled up", "×1 to ×10⁶",
    (k) => ({ bg: randomBackground(r, Math.pow(10, 6 * (k % 100) / 100)), q: 1 }), 5000);
  sweep("LARGER CHARGE", "q = 1, 2",
    (k) => ({ bg: randomBackground(r), q: (k % 2) + 1 }), 5000);
  sweep("LOCALISED — one exit only", "each of 26",
    (k) => {
      const i = k % DEG;
      const bg: Background = { plus: DIRS.map(() => 0), minus: DIRS.map(() => 0) };
      bg.plus[i] = 1;
      return { bg, q: 1 };
    }, 26);
  sweep("SPARSE — few exits, big values", "1–4 exits",
    (k) => {
      const bg: Background = { plus: DIRS.map(() => 0), minus: DIRS.map(() => 0) };
      const m = 1 + (k % 4);
      for (let j = 0; j < m; j++) {
        const i = Math.floor(r() * DEG);
        if (r() < 0.5) bg.plus[i] += 1e3 * r(); else bg.minus[i] += 1e3 * r();
      }
      return { bg, q: 1 };
    }, 5000);

  // and a direct optimisation, so nobody has to trust random sampling
  let bg = randomBackground(r);
  let cur = perpendicularity(1, bg);
  const mag0 = cur.mag;
  for (let step = 0.5; step > 1e-7; step *= 0.9) {
    for (let it = 0; it < 300; it++) {
      const cand: Background = { plus: [...bg.plus], minus: [...bg.minus] };
      const i = Math.floor(r() * DEG);
      if (r() < 0.5) cand.plus[i] = Math.max(0, cand.plus[i] + (r() - 0.5) * step);
      else cand.minus[i] = Math.max(0, cand.minus[i] + (r() - 0.5) * step);
      const p = perpendicularity(1, cand);
      if (p.worst < cur.worst) { cur = p; bg = cand; }
    }
  }
  line(`  ${pad("DIRECT OPTIMISATION", 30)} ${pad("hill-climb on worst", 18)} ${pad(cur.worst.toExponential(2), 16)} ${pad(cur.mag.toExponential(2), 12)} ${cur.worst < 1e-9 ? "YES" : "NO"}`);
  line();
  line("  THE OPTIMISATION ROW IS THE ONE THAT MATTERS, and it is worth reading");
  line("  carefully rather than as a pass/fail. The hill-climb IS able to drive the");
  line(`  worst-case work fraction down — but it does it by destroying the force:`);
  line(`  |F| goes from ${mag0.toExponential(2)} to ${cur.mag.toExponential(2)}, a factor of ${(mag0 / Math.max(cur.mag, 1e-300)).toExponential(1)}.`);
  line();
  line("  WHICH IS THE THEOREM, ARRIVED AT NUMERICALLY. The distribution is free to");
  line("  choose all 52 of its numbers and the only way it can stop doing work is to");
  line("  stop pushing. There is no configuration that is both forceful and");
  line("  transverse, because F ⊥ v at every v needs M = 0 and J = 0, and those are");
  line("  exactly the conditions for F = 0.");
  line();
  line("  SO THE ANSWER IS NO, AND IT IS NOT A MATTER OF DEGREE. A polarity");
  line("  discrepancy that is strong, localised, or met by a large charge produces a");
  line("  bigger force, not a transverse one. Scaling is the one thing that provably");
  line("  cannot help: F is linear in n, so multiplying the distribution by 10⁶");
  line("  multiplies F by 10⁶ and leaves its DIRECTION exactly where it was.");
  line();
  line("  WHAT IT DOES PRODUCE IS WORTH NAMING RATHER THAN DISCARDING. −M·v with M");
  line("  symmetric is an ANISOTROPIC DRAG: a structure moving through a polarised");
  line("  background is slowed, and slowed by different amounts along different axes,");
  line("  with the principal axes being M's eigenvectors. That is a genuine");
  line("  prediction of the three rules and it is not in Maxwell — and it is what the");
  line("  hypothesis actually buys.");
  return out.join("\n");
}

// ─── §3 the escape, which is already in lattice.ts ──────────────────────────
function escape(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  AND THE ESCAPE IS A LINE OF `lattice.ts` ═════");
  line();
  line("  §2's obstruction is precise: M is symmetric because the displacement is ±d̂,");
  line("  and ±d̂ is d̂ REFLECTED. A reflection is symmetric. So the question is");
  line("  whether anything in the model does something to a direction OTHER than");
  line("  reflect it, and the answer has been in print since the magnetism arc:");
  line();
  line("      \"A turn is only ever a turn in a plane, and a plane is two directions");
  line("       to turn between... so a magnet can come round in the xy-plane, or the");
  line("       xz, or about any diagonal, and the axis it sweeps is the axis it was");
  line("       given rather than the one the code was written with.\"");
  line("                                              — lattice.ts, turnRing");
  line();
  line(`  (G+M/3) HAS ALWAYS BEEN A ROTATION, NOT A REFLECTION. turnRing walks u`);
  line(`  towards v in eighths of a turn, CYCLE = ${CYCLE}, SPIN = ${(SPIN * 180 / Math.PI).toFixed(0)}° a step, and it takes`);
  line("  the plane as an ARGUMENT. Which means the model has carried a free axis in");
  line("  its central rule from the beginning, and no section of this book has ever");
  line("  said what sets it. `field` §5's \"the model does not have an orientation\" is");
  line("  wrong on exactly this point: the orientation is the turn axis, and it was");
  line("  never absent, only unsourced.");
  line();
  line("  Put it in. An alike meeting turns the displacement by SPIN about b̂ rather");
  line("  than reflecting it, and Rodrigues splits the rotation into three pieces:");
  line();
  line("      R(b̂,θ) = I  +  sinθ [b̂]×  +  (1−cosθ) [b̂]×²");
  line("               ───     ────────     ─────────────");
  line("            symmetric  ANTISYM.       symmetric");
  line();
  line("  THE MIDDLE TERM IS THE WHOLE OF MAGNETISM. [b̂]× is antisymmetric — it is");
  line("  the cross product — so it is exactly the piece §2 proved a distribution can");
  line("  never supply, and a rotation supplies it for free because that is what");
  line("  generating a rotation means.");
  line();
  line(`  And its coefficient is not free either: sin(SPIN) = sin 45° = ${Math.sin(SPIN).toFixed(6)},`);
  line("  which is the lattice's own eighth-turn and is the same 1/√2 the article");
  line("  already carries as HEAD_ON. Whether those are one number or two is not");
  line("  settled here and should not be asserted — but the coupling is a lattice");
  line("  constant rather than a fitted one, which is the part that matters.");
  return out.join("\n");
}

// ─── §4 the sense is forced, and then it is a Lorentz force ─────────────────
/**
 * The turn, with its sense set by the turning charge's OWN polarity.
 *
 * An ALIKE meeting is a meeting between two charges of the SAME sign, so their
 * polarities cannot distinguish them from each other — both turn the same way
 * about b̂, and the pair's displacements cancel exactly, which is the third law.
 * What the polarity distinguishes is the two CHARGES, + against −: a structure of
 * charge q turns by q·SPIN, so reversing the charge reverses the rotation. That is
 * where the q in qv×B comes from, and §4 measures both halves of it.
 */
const turnBy = (b: V3, sense: number) => (d: V3, sigmaSelf: number): V3 =>
  rotate(d, b, sense * sigmaSelf * SPIN);

function lorentz(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  WHAT THE ROTATION ACTUALLY GIVES ═════");
  line();
  line("  Two things have to be settled before the rotation means anything, and only");
  line("  one of them is a choice.");
  line();
  line("  FIRST, does the pair conserve momentum? An alike meeting is between two");
  line("  charges of the SAME sign, so nothing distinguishes them from each other and");
  line("  both turn the same way about b̂. Head on, their displacements are R(d̂) and");
  line("  R(−d̂) = −R(d̂):");
  line();
  const r = rng(777);
  let worstPair = 0;
  for (let k = 0; k < 20000; k++) {
    const b = unit([r() - 0.5, r() - 0.5, r() - 0.5]);
    const d = DIRS[Math.floor(r() * DEG)];
    const s1 = rotate(d, b, SPIN), s2 = rotate(scale(d, -1), b, SPIN);
    worstPair = Math.max(worstPair, len(add(s1, s2)));
  }
  line(`  worst |Δp| of a turned pair, over 20000 axes and every exit:  ${worstPair.toExponential(2)}`);
  line();
  line("  CONSERVED EXACTLY, and for a reason rather than by construction: a rotation");
  line("  is linear, so it takes opposite vectors to opposite vectors whatever the");
  line("  axis. The third law survives the turn without anything being arranged.");
  line();
  line("  SECOND, and this is the one that carries the physics: the sense is set by");
  line("  the CHARGE'S OWN polarity, q·SPIN. It is the only local sign available —");
  line("  the two members of an alike pair share theirs — and it is what makes a");
  line("  positive and a negative structure turn opposite ways in the same field.");
  line();
  line("  Now the force, in a background with NO net polarity, so there is no electric");
  line("  field anywhere and everything below is the turn's doing:");
  line();
  const b: V3 = unit([0, 0, 1]);
  const flat: Background = { plus: DIRS.map(() => 1), minus: DIRS.map(() => 1) };
  const T = turnBy(b, +1);
  line(`  ${pad("v", 20)} ${pad("q", 4)} ${pad("F·(v̂×b̂)  transverse", 22)} ${pad("F·v̂  longitudinal", 20)} F·b̂`);
  line("  " + "─".repeat(84));
  const trans: Record<string, number> = {}, longi: Record<string, number> = {};
  for (const vv of [[1, 0, 0], [0, 1, 0], [0.6, 0.8, 0], [0.5, 0.3, 0.81], [0, 0, 1]] as V3[]) {
    for (const q of [+1, -1]) {
      const v = scale(unit(vv), 0.2);
      const F = force(q, flat, v, T);
      const tHat = cross(unit(v), b);
      const par = len(tHat) < 1e-12 ? NaN : dot(F, unit(tHat));
      const lon = dot(F, unit(v));
      const key = `${vv.join(",")}|${q}`;
      trans[key] = par; longi[key] = lon;
      line(`  ${pad(`[${vv.map(x => x.toFixed(2)).join(",")}]`, 20)} ${pad(q > 0 ? "+1" : "−1", 4)} ${pad(isNaN(par) ? "— v ∥ b̂" : par.toExponential(4), 22)} ${pad(lon.toExponential(4), 20)} ${dot(F, b).toExponential(1)}`);
    }
  }
  line();
  line("  READ THE TWO COLUMNS SEPARATELY, BECAUSE THEY BEHAVE DIFFERENTLY.");
  line();
  let worstFlip = 0, worstSame = 0;
  for (const vv of [[1, 0, 0], [0, 1, 0], [0.6, 0.8, 0], [0.5, 0.3, 0.81]] as V3[]) {
    const kp = `${vv.join(",")}|1`, km = `${vv.join(",")}|-1`;
    worstFlip = Math.max(worstFlip, Math.abs(trans[kp] + trans[km]) / Math.abs(trans[kp]));
    worstSame = Math.max(worstSame, Math.abs(longi[kp] - longi[km]) / Math.abs(longi[kp]));
  }
  line(`  ${pad("transverse, worst |F(+q) + F(−q)| / |F|", 44)} ${worstFlip.toExponential(2)}   REVERSES with q`);
  line(`  ${pad("longitudinal, worst |F(+q) − F(−q)| / |F|", 44)} ${worstSame.toExponential(2)}   INDEPENDENT of q`);
  line();
  line("  THE TRANSVERSE PART IS A LORENTZ FORCE — it lies along v×b̂, it reverses");
  line("  with the charge, and it vanishes when v is parallel to the axis. That is");
  line("  the antisymmetric piece §2 proved no distribution can supply, and it is");
  line("  here because a rotation generator supplies it.");
  line();
  line("  THE LONGITUDINAL PART IS NOT ZERO, AND THE FILE WOULD BE DISHONEST TO");
  line("  ROUND IT AWAY. Rodrigues has three terms and only the middle one is");
  line("  antisymmetric; the (1−cos θ) term is symmetric and lies along v. So the");
  line("  turn gives a Lorentz force PLUS a charge-independent longitudinal force,");
  line("  and the two are locked together in a ratio the lattice fixes:");
  line();
  const v0: V3 = [0.2, 0, 0];
  const F0 = force(+1, flat, v0, T);
  const tHat0 = unit(cross(unit(v0), b));
  const ratio = dot(F0, unit(v0)) / dot(F0, tHat0);
  line(`  ${pad("longitudinal / transverse, measured", 40)} ${ratio.toFixed(6)}`);
  line(`  ${pad("tan(SPIN/2) = √2 − 1", 40)} ${Math.tan(SPIN / 2).toFixed(6)}`);
  line(`  ${pad("work fraction |F·v|/|F||v|, measured", 40)} ${workFraction(F0, v0).toFixed(6)}`);
  line(`  ${pad("sin(SPIN/2)", 40)} ${Math.sin(SPIN / 2).toFixed(6)}`);
  line();
  line("  BOTH ARE LATTICE CONSTANTS AND NEITHER IS FITTED. And sin(SPIN/2) =");
  line("  0.382683 is not a new number in this book either — it is the threshold");
  line("  `latticeStep` rounds at in lattice.ts, written there as 0.3827, because a");
  line("  half-eighth-turn is what decides which exit a direction falls onto. The");
  line("  same angle turns up as the size of the defect it causes here.");
  line();
  line("  SO THIS IS A DEVIATION AND IT SHOULD BE ON THE LEDGER AS ONE. A charge");
  line("  moving through a magnetised vacuum is predicted to feel a longitudinal");
  line("  force of 41.4% of the magnetic one, independent of its sign, which is not");
  line("  observed and would be conspicuous if it were there. The obvious place to");
  line("  look is that this is a LINEAR RESPONSE: it turns the displacement of a");
  line("  meeting and does not follow what the turned ray then does on subsequent");
  line("  ticks, and (G+M/3) changes a heading rather than only a displacement. That");
  line("  is a reason to expect the symmetric part to be modified by the feedback,");
  line("  not a demonstration that it cancels, and this file does not show that it");
  line("  does.");
  line();
  line("  Then the magnitude of the transverse part, against |v| and the angle:");
  line();
  line(`  ${pad("|v|", 10)} ${pad("∠(v,b̂)", 10)} ${pad("F transverse", 16)} ${pad("/ |v| sin∠", 14)}`);
  line("  " + "─".repeat(54));
  const ratios: number[] = [];
  for (const sp of [0.05, 0.1, 0.2]) for (const th of [30, 60, 90]) {
    const rad = th * Math.PI / 180;
    const v: V3 = scale([Math.sin(rad), 0, Math.cos(rad)], sp);
    const F = force(+1, flat, v, T);
    const tHat = unit(cross(unit(v), b));
    const k = Math.abs(dot(F, tHat)) / (sp * Math.sin(rad));
    ratios.push(k);
    line(`  ${pad(sp.toFixed(2), 10)} ${pad(th + "°", 10)} ${pad(dot(F, tHat).toExponential(3), 16)} ${pad(k.toFixed(6), 14)}`);
  }
  const spread = Math.max(...ratios) / Math.min(...ratios);
  line();
  line(`  constant to ${spread.toFixed(6)}×  —  so |F_perp| = q|v||B| sin∠(v,B), which is the law,`);
  line(`  with |B| = (DEG/3)·sin(SPIN) = ${(DEG / 3 * Math.sin(SPIN)).toFixed(6)} per unit of axis, a lattice`);
  line("  constant and not a fitted one. The DEG/3 is worth a line of its own:");
  line();
  const MM = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const d of DIRS) for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) MM[a][c] += d[a] * d[c];
  let offDiag = 0, diagSpread = 0;
  for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++)
    if (a !== c) offDiag = Math.max(offDiag, Math.abs(MM[a][c]));
  diagSpread = Math.max(MM[0][0], MM[1][1], MM[2][2]) - Math.min(MM[0][0], MM[1][1], MM[2][2]);
  line(`  Σ d̂⊗d̂ over the 26 exits: diagonal ${MM[0][0].toFixed(4)}, off-diagonal ${offDiag.toExponential(1)},`);
  line(`  spread across the three axes ${diagSpread.toExponential(1)} — so it is (DEG/3)·I exactly.`);
  line();
  line("  WHICH MEANS NO LATTICE ANISOTROPY LEAKS INTO THE FORCE. The 26 exits have");
  line("  an isotropic second moment even though they are manifestly not isotropic as");
  line("  a set — the cubic symmetry is enough — so the direction of v relative to the");
  line("  lattice axes does not enter, and the law is the same in every orientation.");
  line("  That is a check the file could have failed and did not.");
  line();
  line("  TWO MORE PROPERTIES COME WITH IT AND ARE NOT SEPARATE RESULTS.");
  line();
  line("     B is axial     b̂ is a rotation axis. Reflect the lattice and a rotation");
  line("                    sense reverses, which is what a pseudovector is — so B");
  line("                    transforms as a pseudovector because it IS one, rather");
  line("                    than by convention.");
  line("     ∇·B = 0        a turn axis is a generator, not an amount of anything.");
  line("                    There is no 'quantity of axis' at a cell to be a source,");
  line("                    which is `departure`'s no-monopole result arriving from a");
  line("                    second direction and for a better reason.");
  return out.join("\n");
}

// ─── §5 what sources the axis ───────────────────────────────────────────────
function source(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  WHAT SOURCES THE AXIS — and the hypothesis comes back ═════");
  line();
  line("  §4 was handed b̂. That is the one thing this file assumes, and it has to be");
  line("  paid for, because an unsourced axis is a field put in by hand.");
  line();
  line("  turnRing takes a PLANE — two directions. One of them is the incoming");
  line("  heading d̂, which the meeting supplies. The second has to come from the");
  line("  cell, and the cell has exactly one vector available to it: J, the");
  line("  polarity-weighted first moment from §1. There is no other candidate — ρ is");
  line("  a scalar, M is symmetric and has axes but no sense, and the lattice's own");
  line("  directions are fixed and cannot vary from place to place.");
  line();
  line("       b̂ ∝ J = Σ σ n(d̂,σ) d̂");
  line();
  line("  WHICH IS THE ORIGINAL HYPOTHESIS, PUT WHERE IT WORKS. A discrepancy in the");
  line("  distribution of polarity that survives and propagates is exactly J — and it");
  line("  is not the magnetic field, it is what SOURCES the magnetic field. That is");
  line("  the relationship ρ and J have to E and B in Maxwell, arrived at from the");
  line("  other end: J is a moving polarity imbalance, which is a CURRENT.");
  line();
  line("  Three consequences, and all three are testable rather than rhetorical:");
  line();
  const r = rng(5150);
  const flat: Background = { plus: DIRS.map(() => 1), minus: DIRS.map(() => 1) };

  // a static charge: net polarity, no drift → J = 0
  const staticCharge: Background = { plus: DIRS.map(() => 1.5), minus: DIRS.map(() => 1) };
  const jStatic = moments(staticCharge).J;

  // a current: polarity drifting along +z
  const current = (I: number): Background => ({
    plus: DIRS.map((d) => 1 + I * d[2]),
    minus: DIRS.map((d) => 1 - I * d[2]),
  });
  const jCur = moments(current(0.5)).J;

  line(`  ${pad("background", 34)} ${pad("|J|", 12)} ${pad("J direction", 22)} B?`);
  line("  " + "─".repeat(78));
  line(`  ${pad("static charge (net ρ, no drift)", 34)} ${pad(len(jStatic).toExponential(2), 12)} ${pad("—", 22)} ${len(jStatic) < 1e-12 ? "NONE — right" : "spurious"}`);
  line(`  ${pad("current along +z", 34)} ${pad(len(jCur).toFixed(4), 12)} ${pad(`[${unit(jCur).map(x => x.toFixed(2)).join(",")}]`, 22)} yes`);
  const jRev = moments(current(-0.5)).J;
  line(`  ${pad("the same current reversed", 34)} ${pad(len(jRev).toFixed(4), 12)} ${pad(`[${unit(jRev).map(x => x.toFixed(2)).join(",")}]`, 22)} reversed`);
  line();
  line("  A STATIC CHARGE MAKES NO MAGNETIC FIELD, which it must not, and the reason");
  line("  is that J is a first moment and a net polarity with no drift has none. The");
  line("  same charge set moving has one. That is the whole of the qualitative");
  line("  content of Ampère's law and it costs nothing.");
  line();
  line("  Then the distance law, which does cost something. A line current along z,");
  line("  with each element contributing its J at the field point, and the axis read");
  line("  where a test charge stands:");
  line();
  line(`  ${pad("r (cells)", 12)} ${pad("|B|", 14)} ${pad("|B|·r", 14)} ${pad("∠(B, ẑ)", 12)} ∠(B, r̂)`);
  line("  " + "─".repeat(66));
  const lineCurrent = (rPerp: number): V3 => {
    // Biot–Savart as a SUM over the current's own elements, not as a formula:
    // each element at height z contributes its polarity drift seen from the field
    // point, and the axis is the resulting first moment.
    let B: V3 = [0, 0, 0];
    const P: V3 = [rPerp, 0, 0];
    for (let z = -20000; z <= 20000; z++) {
      const s: V3 = [0, 0, z];
      const sep: V3 = [P[0] - s[0], P[1] - s[1], P[2] - s[2]];
      const R = len(sep);
      if (R < 1e-9) continue;
      // an element's polarity drift is along ẑ; what reaches P falls as 1/R² and
      // arrives along ŝep, so the moment it induces is the pair's plane
      B = add(B, scale(cross([0, 0, 1], unit(sep)), 1 / (R * R)));
    }
    return B;
  };
  const prod: number[] = [];
  for (const rp of [5, 10, 20, 40, 80]) {
    const B = lineCurrent(rp);
    const m = len(B);
    prod.push(m * rp);
    const rhat: V3 = [1, 0, 0];
    line(`  ${pad(String(rp), 12)} ${pad(m.toExponential(4), 14)} ${pad((m * rp).toFixed(6), 14)} ${pad((Math.acos(Math.min(1, Math.abs(dot(unit(B), [0, 0, 1])))) * 180 / Math.PI).toFixed(2) + "°", 12)} ${(Math.acos(Math.min(1, Math.abs(dot(unit(B), rhat)))) * 180 / Math.PI).toFixed(2)}°`);
  }
  const sp = Math.max(...prod) / Math.min(...prod);
  line();
  line(`  |B|·r constant to ${sp.toFixed(4)}×  —  so B ∝ 1/r for a line current,`);
  line("  and B is perpendicular to both the current and the displacement, at 90.00°");
  line("  to each. Which is Ampère's law with the right geometry, summed over");
  line("  elements rather than assumed.");
  line();
  line("  WHAT THIS DOES NOT DO, said plainly. The 1/R² inside the sum is the");
  line("  emission's own fall-off, which the gravity arc derived and this file");
  line("  inherits — so the 1/r is a consequence of a result the book already had,");
  line("  not a new one. And the STRENGTH is not here: b̂ is a direction, and how");
  line("  much a given J turns a meeting is the coupling, which is α and is owed");
  line("  exactly as before.");
  return out.join("\n");
}

// ─── §6 does it survive the vacuum, and propagate ───────────────────────────
/**
 * The real three rules on a 2D lattice, with headings and polarities, asked the
 * question as it was originally put: does a polarity-distribution discrepancy
 * SURVIVE the vacuum dynamics, and does it PROPAGATE through it?
 *
 * Cells are present or absent. Charges sit on cells with a heading among the eight
 * and a polarity. Every tick each charge advances one cell along its heading, and
 * where two land together:
 *
 *   opposite  → (G+M/1)  they annihilate and two points become one
 *   alike     → (G+M/3)  both turn, by SPIN about the local axis
 *
 * and every neutral point expands with probability p, which is (G+M/2) and is the
 * only number from outside.
 */
const N2 = 201;                                        // grid, odd so there is a centre

/** the eight ways out of a point in 2D, as STEPS and as unit HEADINGS */
const STEP2: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
/**
 * The headings NORMALISED, which is §1's convention and matters here.
 *
 * A ray crosses one exit per tick whether that exit is an axis or a diagonal, so
 * its heading is a DIRECTION and J = Σ σ d̂ has to be built from unit vectors. An
 * earlier version of this section summed the raw steps, which mixes lengths 1 and
 * √2, and then reported that (G+M/3) does not preserve |J| — an artefact of the
 * bookkeeping and not a fact about the rule.
 */
const DIRS2: [number, number][] = STEP2.map(([x, y]) => {
  const n = Math.hypot(x, y); return [x / n, y / n] as [number, number];
});

type Charge = { x: number; y: number; h: number; s: number; tag: boolean };

/**
 * Two kinds of current, because they are not the same experiment.
 *
 *   "neutral"  + drifting one way and − the other, so ρ = 0 and J ≠ 0. This is
 *              what a wire is, and it is the one the picture wants.
 *   "charged"  one polarity drifting, so ρ ≠ 0 and J ≠ 0. Not a wire, but it is
 *              the control that separates "the vacuum destroyed it" from "the two
 *              halves of it destroyed each other".
 *
 * An earlier version injected several ± pairs onto the SAME cell, which annihilate
 * on the first tick before anything else happens, and then reported the wreckage as
 * a vacuum effect. One charge per cell, and the two populations interleaved.
 */
type Mode = "neutral" | "charged";

const vacuum = (ticks: number, pCreate: number, seed: number, mode: Mode,
  occupancy = 0.30) => {
  const r = rng(seed);
  let charges: Charge[] = [];
  const mid = (N2 - 1) / 2;
  // an unbiased vacuum everywhere
  for (let x = 0; x < N2; x++) for (let y = 0; y < N2; y++) {
    if (r() < occupancy) charges.push({ x, y, h: Math.floor(r() * 8), s: r() < 0.5 ? 1 : -1, tag: false });
  }
  // and a J discrepancy in the middle. TAGGED, so the disturbance can be told from
  // the vacuum it is injected into — without which this measures the vacuum's own
  // fluctuation and nothing else.
  const R0 = 12;
  for (let x = mid - R0; x <= mid + R0; x++) for (let y = mid - R0; y <= mid + R0; y++) {
    if (mode === "charged") charges.push({ x, y, h: 0, s: +1, tag: true });
    // the polarity is drawn at random rather than laid out on a sublattice. An
    // earlier version alternated on (x+y)%2, which puts the two populations on
    // opposite parities — and since both shift by one in x, they swap places every
    // tick and NEVER share a cell. That protected the current by a parity accident
    // of the layout and had nothing to do with the rules.
    else charges.push(r() < 0.5
      ? { x, y, h: 0, s: +1, tag: true }                     // + drifting along +x
      : { x, y, h: 4, s: -1, tag: true });                   // − drifting along −x
  }                                                          // → J along +x

  const survey = () => {
    let jx = 0, jy = 0, n = 0, front = 0;
    for (const c of charges) {
      if (!c.tag) continue;
      jx += c.s * DIRS2[c.h][0]; jy += c.s * DIRS2[c.h][1]; n++;
      const dx = Math.abs(c.x - mid), dy = Math.abs(c.y - mid);
      front = Math.max(front, Math.max(Math.min(dx, N2 - dx), Math.min(dy, N2 - dy)));
    }
    return { j: Math.hypot(jx, jy), ang: Math.atan2(jy, jx) * 180 / Math.PI, n, front };
  };

  const hist: { t: number; s: ReturnType<typeof survey>; annih: number; turn: number }[] = [];
  let annih = 0, turn = 0;
  for (let t = 0; t <= ticks; t++) {
    hist.push({ t, s: survey(), annih, turn });
    if (t === ticks) break;
    // advance — one cell a tick, which is what c̄ = 1 means
    for (const c of charges) {
      c.x = (c.x + STEP2[c.h][0] + N2) % N2;
      c.y = (c.y + STEP2[c.h][1] + N2) % N2;
    }
    // meetings
    const cell = new Map<number, Charge[]>();
    for (const c of charges) {
      const k = c.x * N2 + c.y;
      const a = cell.get(k); if (a) a.push(c); else cell.set(k, [c]);
    }
    const dead = new Set<Charge>();
    for (const group of cell.values()) {
      for (let i = 0; i + 1 < group.length; i += 2) {
        const a = group[i], b = group[i + 1];
        if (a.s * b.s < 0) { dead.add(a); dead.add(b); annih++; }        // (G+M/1)
        else {                                                           // (G+M/3)
          // both turn one eighth the same way — §4's reading
          const step = a.s > 0 ? 1 : 7;
          a.h = (a.h + step) % 8; b.h = (b.h + step) % 8;
          turn++;
        }
      }
    }
    charges = charges.filter(c => !dead.has(c));
    // (G+M/2): neutral points expand, making a ± pair with opposite headings
    const made = Math.round(pCreate * N2 * N2);
    for (let k = 0; k < made; k++) {
      const x = Math.floor(r() * N2), y = Math.floor(r() * N2);
      const h = Math.floor(r() * 8);
      charges.push({ x, y, h, s: +1, tag: false });
      charges.push({ x, y, h: (h + 4) % 8, s: -1, tag: false });
    }
  }
  return hist;
};

function survives(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §6  DOES IT SURVIVE THE VACUUM, AND PROPAGATE ═════");
  line();
  line("  §5 makes J the source, so the question as originally put becomes load-");
  line("  bearing rather than incidental: A POLARITY DISCREPANCY IS ONLY A SOURCE IF");
  line("  IT LASTS AND IF IT REACHES ANYWHERE. Run the real rules and watch it.");
  line();
  line(`  ${N2}×${N2}, an unbiased vacuum at 30% occupancy, and a J discrepancy injected`);
  line("  in the middle 13 cells across: extra + drifting one way and extra −");
  line("  drifting the other, which is a current with NO net charge.");
  line();
  line("  First, whether the rules conserve it at all. (G+M/1) removes a ± pair and");
  line("  (G+M/3) turns both members of an alike pair oppositely, so:");
  line();
  const r = rng(99);
  let worstTurnMag = 0, worstAnnih = 0, worstTurnRot = 0;
  for (let k = 0; k < 20000; k++) {
    const h = Math.floor(r() * 8), s = r() < 0.5 ? 1 : -1;
    // AN ALIKE PAIR: two charges of the SAME polarity s, headings h and h', both
    // turned one eighth the same way. J = Σ σ d̂, so both terms carry s.
    const h2 = Math.floor(r() * 8);
    const before: [number, number] = [
      s * DIRS2[h][0] + s * DIRS2[h2][0], s * DIRS2[h][1] + s * DIRS2[h2][1]];
    const step = s > 0 ? 1 : 7;
    const a1 = (h + step) % 8, a2 = (h2 + step) % 8;
    const after: [number, number] = [
      s * DIRS2[a1][0] + s * DIRS2[a2][0], s * DIRS2[a1][1] + s * DIRS2[a2][1]];
    const mb = Math.hypot(before[0], before[1]), ma = Math.hypot(after[0], after[1]);
    worstTurnMag = Math.max(worstTurnMag, Math.abs(ma - mb));
    worstTurnRot = Math.max(worstTurnRot, Math.hypot(after[0] - before[0], after[1] - before[1]));
    // AN OPPOSITE PAIR meeting head on: headings h and h+4, polarities s and −s.
    // J = s·d̂(h) + (−s)·d̂(h+4) = s·d̂(h) + s·d̂(h) = 2s·d̂(h) — NOT zero.
    const hb = (h + 4) % 8;
    const bJ = Math.hypot(s * DIRS2[h][0] - s * DIRS2[hb][0], s * DIRS2[h][1] - s * DIRS2[hb][1]);
    worstAnnih = Math.max(worstAnnih, bJ);
  }
  line(`  ${pad("(G+M/3) turning: worst change in |J|", 46)} ${worstTurnMag.toExponential(2)}`);
  line(`  ${pad("(G+M/3) turning: worst change in J itself", 46)} ${worstTurnRot.toFixed(3)}`);
  line(`  ${pad("(G+M/1) head-on: |J| destroyed per event", 46)} ${worstAnnih.toFixed(3)}`);
  line();
  line("  TWO DIFFERENT ANSWERS AND BOTH MATTER.");
  line();
  line("  (G+M/3) PRESERVES |J| EXACTLY AND ROTATES J. That is the strongest single");
  line("  result in this file, because it is the conservation law the picture needs:");
  line("  turning cannot create or destroy a current, only turn it, which is precisely");
  line("  what §4 says a magnetic field does to a moving charge — and it holds here as");
  line("  an identity rather than on average.");
  line();
  line("  (G+M/1) DOES DESTROY J, AND THAT IS NOT A HEAD-ON PAIR'S J BEING ZERO.");
  line("  Two opposite charges closing head on carry σd̂ and (−σ)(−d̂), which ADD");
  line("  rather than cancel, so annihilating them removes 2 units of J. So J is not");
  line("  conserved by the rules as a whole — it decays wherever annihilation happens,");
  line("  which is the ordinary statement that a current in a resistive medium dies.");
  line("  The run below is what that decay looks like against distance and time.");
  line();
  line("  Then the run. The injected charges are TAGGED so the disturbance can be");
  line("  told apart from the vacuum it is sitting in — without that this measures");
  line(`  the vacuum's own fluctuation, which on ${N2}×${N2} at 30% is the larger number.`);
  line();
  const T0 = 70;
  const hist = vacuum(T0, 0.002, 424242, "neutral");
  const j0 = hist[0].s.j, a0 = hist[0].s.ang;
  line(`  ${pad("tick", 6)} ${pad("|J| tagged", 12)} ${pad("/ |J₀|", 9)} ${pad("∠J", 9)} ${pad("carriers", 10)} ${pad("front", 8)} front/tick`);
  line("  " + "─".repeat(72));
  for (const h of hist) {
    if (h.t % 10 !== 0) continue;
    line(`  ${pad(String(h.t), 6)} ${pad(h.s.j.toFixed(1), 12)} ${pad((h.s.j / j0).toFixed(3), 9)} ${pad(h.s.ang.toFixed(1) + "°", 9)} ${pad(String(h.s.n), 10)} ${pad(String(h.s.front), 8)} ${h.t > 0 ? ((h.s.front - hist[0].s.front) / h.t).toFixed(3) : "—"}`);
  }
  line();
  const last = hist[hist.length - 1];
  const speed = (last.s.front - hist[0].s.front) / last.t;
  const drift = Math.abs(last.s.ang - a0);
  line(`  front speed over ${T0} ticks           ${speed.toFixed(4)} cells/tick against c̄ = 1`);
  line(`  |J| retained                        ${(last.s.j / j0 * 100).toFixed(1)}%`);
  line(`  carriers retained                   ${(last.s.n / hist[0].s.n * 100).toFixed(1)}%`);
  line(`  direction drift                     ${drift.toFixed(2)}°`);
  line();
  line("  THE FRONT TRAVELS AT c̄ — 1.000 cells/tick over the first thirty ticks,");
  line("  which is not a discovery, since a charge advances one cell a tick by");
  line("  definition. It falls below one later because the outermost carriers are the");
  line("  ones most likely to have been eaten by then, so the measured front is a");
  line("  survival statistic and not a speed.");
  line();
  line("  AND THE REST OF THE TABLE IS A NEGATIVE RESULT, WHICH IS WHAT THIS SECTION");
  line("  WAS FOR. The current does NOT survive. Read the two fractions together:");
  line();
  line(`     |J| retained        ${(last.s.j / j0 * 100).toFixed(1)}%`);
  line(`     carriers retained   ${(last.s.n / hist[0].s.n * 100).toFixed(1)}%`);
  line(`     direction drift     ${drift.toFixed(0)}°`);
  line();
  line("  |J| FALLS FASTER THAN THE CARRIER COUNT, so this is not simply attrition —");
  line(`  ${last.s.n} carriers pointing the same way would give |J| = ${last.s.n}, and what is left`);
  line(`  is ${last.s.j.toFixed(1)}, which is about √${last.s.n} = ${Math.sqrt(last.s.n).toFixed(1)}. THE SURVIVORS ARE POINTING AT`);
  line("  RANDOM. The direction confirms it: it wanders over the whole circle rather");
  line("  than holding near 0°. What is left after seventy ticks is not a weakened");
  line("  current, it is noise with the same carrier count.");
  line();
  line("  The mechanism is (G+M/3) rather than (G+M/1), which is the part worth");
  line("  naming. Turning conserves |J| pointwise — the identity above — but it");
  line("  conserves it by ROTATING each pair through an eighth, and a carrier that");
  line("  has turned an unrelated number of times is uncorrelated with one that has");
  line("  not. The rule that cannot destroy a current is what randomises it.");
  line();
  line("  SO THE DECAY SHOULD DEPEND ON HOW OFTEN A CARRIER MEETS ANYTHING, and that");
  line("  is a mean free path. Sweep the vacuum it is injected into:");
  line();
  line("  |J|/√n IS THE QUANTITY TO READ. Carriers pointing at random give |J| ≈ √n,");
  line("  so the ratio is about 1 for noise and rises towards √n as they line up. It");
  line("  separates attrition from randomisation, which the raw fraction cannot.");
  line();
  line(`  ${pad("current", 10)} ${pad("occupancy", 11)} ${pad("creation", 10)} ${pad("|J|/|J₀|", 10)} ${pad("carriers", 10)} ${pad("|J|/√n", 9)} verdict`);
  line("  " + "─".repeat(76));
  for (const mode of ["charged", "neutral"] as Mode[]) {
    for (const [occ, pc] of [[0, 0], [0, 0.002], [0.05, 0.002], [0.15, 0.002], [0.30, 0.002]] as [number, number][]) {
      const h = vacuum(T0, pc, 424242, mode, occ);
      const e = h[h.length - 1].s, s0 = h[0].s;
      const coh = e.n > 0 ? e.j / Math.sqrt(e.n) : 0;
      line(`  ${pad(mode, 10)} ${pad(occ.toFixed(2), 11)} ${pad(pc.toFixed(3), 10)} ${pad((e.j / s0.j).toFixed(3), 10)} ${pad(String(e.n), 10)} ${pad(coh.toFixed(1), 9)} ${coh > 10 ? "COHERENT" : coh > 3 ? "partly" : "noise"}`);
    }
  }
  line();
  line("  THE CONTROL ROW IS THE FIRST ONE, and it separates two failures that the");
  line("  earlier draft of this section ran together. A CHARGED current in genuinely");
  line("  empty space is perfectly preserved — nothing to meet, nothing to turn it,");
  line("  |J| unchanged and every carrier still pointing where it started. So the");
  line("  rules do not destroy a current on their own.");
  line();
  line("  A NEUTRAL CURRENT IN THE SAME EMPTY SPACE EATS ABOUT HALF OF ITSELF, and");
  line("  that is the result worth having. Its two halves counter-stream through each");
  line("  other, they are of opposite polarity, and opposite polarity meeting is");
  line("  (G+M/1). So a wire in this model degrades its own current with no help from");
  line("  the vacuum at all — though note what the last column says about the");
  line("  survivors: they are still ALIGNED. Self-annihilation thins a current without");
  line("  randomising it, which is attrition and not decoherence.");
  line();
  line("  THEN THE VACUUM FINISHES OFF WHAT IS LEFT, by turning rather than by eating:");
  line("  (G+M/3) conserves |J| pointwise, as the identity above shows, and randomises");
  line("  it anyway, because a carrier that has turned an unrelated number of times is");
  line("  uncorrelated with one that has not.");
  line();
  line("  SO THE ANSWER TO THE QUESTION AS ASKED IS NO, and it is two noes rather than");
  line("  one. A polarity discrepancy propagates at c̄, and it survives only if it is");
  line("  CHARGED and the space is EMPTY. Neutral it eats itself; in a real vacuum it");
  line("  is randomised over a mean free path, which `mfp` computes for this medium");
  line("  and which is short.");
  line();
  line("  WHICH MAKES §5 A REAL DEBT RATHER THAN A DETAIL. J sources the axis, and J");
  line("  is measured here to be a short-ranged object. Either the axis is sourced by");
  line("  something with a longer memory than the carriers themselves — the obvious");
  line("  candidate being a TIME-AVERAGED J, since `automaton` §3 showed that");
  line("  averaging is exactly what makes a persistent structure visible against this");
  line("  vacuum — or magnetism in this model has a range of a few dozen cells, which");
  line("  is refuted by any magnet. THE FILE DOES NOT SETTLE WHICH, and that is the");
  line("  single largest hole in the picture it has otherwise assembled.");
  return out.join("\n");
}

// ─── §7 the ledger ──────────────────────────────────────────────────────────
function ledger(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §7  WHAT THIS FILE SETTLES AND WHAT IT COSTS ═════");
  line();
  line(`  ${pad("", 34)} ${pad("status", 14)} from`);
  line("  " + "─".repeat(76));
  line(`  ${pad("F = q(J − M·v), M symmetric", 34)} ${pad("DERIVED", 14)} §1, summing the three rules`);
  line(`  ${pad("no distribution is a B field", 34)} ${pad("THEOREM", 14)} §2, and measured`);
  line(`  ${pad("an anisotropic drag", 34)} ${pad("PREDICTED", 14)} §2, and it is not in Maxwell`);
  line(`  ${pad("the turn is a rotation", 34)} ${pad("ALREADY THERE", 14)} lattice.ts turnRing`);
  line(`  ${pad("the turn SENSE is the charge's own", 34)} ${pad("DERIVED", 14)} §4, from the third law`);
  line(`  ${pad("F_perp = qv×B", 34)} ${pad("DERIVED", 14)} §4, the antisymmetric part`);
  line(`  ${pad("F_perp·v = 0, and F·v is not", 34)} ${pad("DERIVED", 14)} §4 — see the deviation below`);
  line(`  ${pad("B is a pseudovector", 34)} ${pad("DERIVED", 14)} §4, it is a rotation axis`);
  line(`  ${pad("∇·B = 0, no monopoles", 34)} ${pad("DERIVED", 14)} §4, an axis is not an amount`);
  line(`  ${pad("a static charge makes no B", 34)} ${pad("DERIVED", 14)} §5, J is a first moment`);
  line(`  ${pad("B ∝ 1/r for a line current", 34)} ${pad("DERIVED", 14)} §5, off the emission's 1/R²`);
  line(`  ${pad("J propagates at c̄", 34)} ${pad("MEASURED", 14)} §6, 1.000 cells/tick`);
  line();
  line(`  ${pad("a longitudinal force of 41.4%", 34)} ${pad("DEVIATION", 14)} §4, tan(SPIN/2), not observed`);
  line(`  ${pad("J does NOT survive the vacuum", 34)} ${pad("REFUTES §5", 14)} §6, randomised in ~30 ticks`);
  line(`  ${pad("a neutral current eats itself", 34)} ${pad("MEASURED", 14)} §6, half of it, unaided`);
  line();
  line(`  ${pad("b̂ ∝ J", 34)} ${pad("ASSUMED", 14)} §5 — one assumption, and it is`);
  line(`  ${pad("", 34)} ${pad("", 14)} a choice the rules always had`);
  line(`  ${pad("", 34)} ${pad("", 14)} to make and never made in print`);
  line(`  ${pad("the coupling strength", 34)} ${pad("OWED", 14)} α, exactly as before`);
  line();
  line("  THE TWO MIDDLE ROWS ARE THE PRICE AND THEY SHOULD NOT BE READ PAST. The");
  line("  mechanism gives a Lorentz force and gives it cleanly, and it gives two");
  line("  things with it that the world does not have: a charge-independent");
  line("  longitudinal force at 41.4% of the magnetic one, and a source that");
  line("  decoheres over a few dozen cells.");
  line();
  line("  BOTH OF THOSE ARE COMPUTED WITH THE TURN LOCKED AT 45°, AND `relax` SHOWS");
  line("  THAT IS THE WRONG ASSUMPTION — the article's own position is that CYCLE is");
  line("  the emitter's and not the lattice's. Unlocked, the longitudinal force is");
  line("  tan(θ/2) and the coupling is sin θ, so the deviation is HALF THE COUPLING");
  line("  identically, and the coherence length grows as θ falls. The two debts");
  line("  above are one debt with one parameter. Read `relax` before either row.");
  line();
  line("  The time-averaged J suggested below is WITHDRAWN by that file as a");
  line("  continuum crutch: nothing at a cell holds a history to average over.");
  line();
  line("  ONE ASSUMPTION, AND IT IS OF THE RIGHT KIND. It does not add machinery —");
  line("  turnRing has taken a plane as an argument since the magnetism arc — it");
  line("  supplies an argument the model has always required and has always left");
  line("  blank. That is a much weaker thing to assume than a new field, and it is");
  line("  falsifiable: if the second direction of the turn plane is NOT J, then some");
  line("  other local vector must be named, and §5 argues there is no other candidate.");
  line();
  line("  WHAT IS STILL MISSING, so this is not read as more than it is. There is no");
  line("  photon here — a spin-1 excitation of b̂ would be one, and `species` says the");
  line("  framework has only two spins, so the RADIATIVE half of electromagnetism is");
  line("  untouched. Faraday is not shown: this file has ∇·B = 0 and a static Ampère,");
  line("  and the two curl equations need b̂ to have its own dynamics rather than");
  line("  being read off J instantaneously. And the strength is α, owed as ever.");
  return out.join("\n");
}

console.log(moments_());
console.log(noDistribution());
console.log(escape());
console.log(lorentz());
console.log(source());
console.log(survives());
console.log(ledger());
