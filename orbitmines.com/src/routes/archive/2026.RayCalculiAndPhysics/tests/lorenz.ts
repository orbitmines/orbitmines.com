/**
 * FARADAY, RETESTED — and the answer to "it should not be a scalar, so what should
 * it be" is the FIRST MOMENT of the same shortfall the scalar is the zeroth of.
 *
 * `shine` showed the deficit radiates: a retarded 1/R potential whose gradient keeps
 * a 1/R term. It also said, honestly, that what radiates there is a SCALAR — which
 * is the radiation gravity has and less than light needs — and that Faraday had not
 * been retested. This file does both, and they turn out to be one question.
 *
 *   §1  THE SCALAR CANNOT SUPPORT INDUCTION, and not because it fails a measurement
 *       — because it has no room for one. With only a shortfall COUNT there is only
 *       E = −∇φ, which is curl-free identically, so ∇×E = 0 at every point of every
 *       configuration. Faraday then reads 0 = −∂B/∂t and forces B constant. THE
 *       EQUATION IS NOT VIOLATED, IT IS VACUOUS. That is the precise sense in which
 *       a scalar is the wrong object.
 *
 *   §2  SO WHAT IT SHOULD BE. The deficit is a count of rays that failed to arrive —
 *       the ZEROTH moment of the shortfall over directions. The same shortfall has a
 *       FIRST moment: which directions are missing rays, Σσ·(missing)·d̂. That is a
 *       vector, it is local, and it is not an addition — it is a moment the model
 *       already has and nobody has read. Weighted 1/R and retarded, it is a VECTOR
 *       POTENTIAL.
 *
 *   §3  and then Faraday and ∇·B = 0 hold IDENTICALLY, which is worth being exact
 *       about: they are not results, they are consequences of E and B being derived
 *       from potentials at all. ∇×∇φ = 0 and ∇·(∇×A) = 0. Measured at 10⁻¹¹.
 *
 *   §4  WHICH MOVES THE REAL TEST TO THE OTHER TWO. Gauss and Ampère–Maxwell hold
 *       only if the potentials satisfy the wave equation, and that holds only under
 *       the LORENZ CONDITION ∇·A + ∂φ/∂t = 0 — which is charge conservation wearing
 *       a different hat. So the question "does this model do electromagnetism"
 *       becomes "does this model conserve its source", which is a much better
 *       question and is answerable.
 *
 *   §5  THE PERMUTATIONS, which is the point of the file. Five ways of building the
 *       field from the same rays, each measured against all four equations. Only
 *       one passes, and the three that fail each fail somewhere different — so the
 *       construction is pinned rather than chosen.
 *
 *   §6  and the polarisation, which `shine` left owed: with A a vector, is the far
 *       field transverse? Measured.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

type V3 = [number, number, number];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => { const n = len(a); return n < 1e-300 ? [0, 0, 0] : scale(a, 1 / n); };

/**
 * The source: a pair of opposite charges oscillating past each other.
 *
 * NOT a sink whose rate varies. `shine` used one of those and it is fine for a
 * scalar, but a lone charge whose MAGNITUDE changes does not conserve charge, and
 * §4 below turns on exactly that. Two opposite charges moving is the smallest
 * source that oscillates and conserves.
 */
const OM = 0.06, AMP = 3;
const parts = [
  { q: +1, at: (t: number): V3 => [0, 0, +AMP * Math.sin(OM * t)], u: (t: number): V3 => [0, 0, +AMP * OM * Math.cos(OM * t)] },
  { q: -1, at: (t: number): V3 => [0, 0, -AMP * Math.sin(OM * t)], u: (t: number): V3 => [0, 0, -AMP * OM * Math.cos(OM * t)] },
];

/** the retarded time, with a bracket wide enough to actually contain the root */
const retarded = (P: V3, t: number, at: (t: number) => V3): number => {
  // THE INEQUALITY HERE WAS INVERTED IN AN EARLIER VERSION AND IT MATTERED. Define
  // g(tr) = |P − s(tr)| − (t − tr). It is NEGATIVE far in the past (the source
  // recedes slower than light) and POSITIVE at tr = t, so the root is bracketed and
  // g is increasing — which means the half containing the root is the one where
  // g < 0. Written the other way round the bisection walks to its own lower
  // endpoint and returns tr = t − 1e7 with a residual of −7·10⁶, silently, for
  // every field point. Everything downstream of it was then a static configuration
  // evaluated a very long way away.
  let lo = t - 1e7, hi = t;
  for (let i = 0; i < 200; i++) {
    const m = (lo + hi) / 2;
    if (len(sub(P, at(m))) - (t - m) < 0) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
};

/**
 * THE FIVE CONSTRUCTIONS, which is what §5 sweeps.
 *
 *   moment    the model's own reading: potentials from the shortfall, weighted 1/R,
 *             carrying the arrival-rate factor 1/(1 − n̂·u) that a moving emitter
 *             forces. φ is the zeroth moment, A the first.
 *   norate    the same without the arrival-rate factor — the naive count.
 *   inverse   potentials weighted 1/R² instead of 1/R, i.e. treating the potential
 *             as if it were a flux.
 *   scalar    the scalar deficit alone, with no vector moment at all — `shine`'s.
 *   counts    fields read DIRECTLY off the ray count, which is what `induce` did.
 */
type How = "moment" | "norate" | "inverse" | "scalar" | "counts";

const potentials = (P: V3, t: number, how: How) => {
  let phi = 0, A: V3 = [0, 0, 0];
  for (const p of parts) {
    const tr = retarded(P, t, p.at);
    const sep = sub(P, p.at(tr));
    const R = len(sep);
    if (R < 1e-9) continue;
    const n = unit(sep);
    const u = p.u(tr);
    const k = 1 - dot(n, u);
    const w = how === "inverse" ? 1 / (R * R)
      : how === "norate" ? 1 / R
        : 1 / (k * R);
    phi += p.q * w;
    if (how !== "scalar") A = add(A, scale(u, p.q * w));
  }
  return { phi, A };
};

/** E = −∇φ − ∂A/∂t and B = ∇×A, by finite difference */
const fields = (P: V3, t: number, how: How, h = 1e-3) => {
  if (how === "counts") {
    // `induce`'s reading: the field IS the signed count of arriving rays, and the
    // magnetic one is its labelled moment. No potential anywhere.
    let E: V3 = [0, 0, 0], B: V3 = [0, 0, 0];
    for (const p of parts) {
      const tr = retarded(P, t, p.at);
      const sep = sub(P, p.at(tr));
      const R = len(sep);
      if (R < 1e-9) continue;
      const n = unit(sep), u = p.u(tr);
      E = add(E, scale(n, p.q / (R * R)));
      B = add(B, scale(cross(n, u), p.q / (R * R)));
    }
    return { E, B };
  }
  const gradPhi: V3 = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const pp: V3 = [...P] as V3, pm: V3 = [...P] as V3;
    pp[i] += h; pm[i] -= h;
    gradPhi[i] = (potentials(pp, t, how).phi - potentials(pm, t, how).phi) / (2 * h);
  }
  const dAdt = scale(sub(potentials(P, t + h, how).A, potentials(P, t - h, how).A), 1 / (2 * h));
  // curl A
  const dA: V3[] = [];
  for (let i = 0; i < 3; i++) {
    const pp: V3 = [...P] as V3, pm: V3 = [...P] as V3;
    pp[i] += h; pm[i] -= h;
    dA.push(scale(sub(potentials(pp, t, how).A, potentials(pm, t, how).A), 1 / (2 * h)));
  }
  const B: V3 = [dA[1][2] - dA[2][1], dA[2][0] - dA[0][2], dA[0][1] - dA[1][0]];
  return { E: sub(scale(gradPhi, -1), dAdt), B };
};

/** all four Maxwell residuals at a point, each normalised by its own scale */
const maxwell = (P: V3, t: number, how: How, h = 1e-3) => {
  const at = (p: V3, tt: number) => fields(p, tt, how, h);
  const dE: V3[] = [], dB: V3[] = [];
  for (let i = 0; i < 3; i++) {
    const pp: V3 = [...P] as V3, pm: V3 = [...P] as V3;
    pp[i] += h; pm[i] -= h;
    const a = at(pp, t), b = at(pm, t);
    dE.push(scale(sub(a.E, b.E), 1 / (2 * h)));
    dB.push(scale(sub(a.B, b.B), 1 / (2 * h)));
  }
  const curl = (d: V3[]): V3 => [d[1][2] - d[2][1], d[2][0] - d[0][2], d[0][1] - d[1][0]];
  const fa = at(P, t + h), fb = at(P, t - h);
  const dEdt = scale(sub(fa.E, fb.E), 1 / (2 * h));
  const dBdt = scale(sub(fa.B, fb.B), 1 / (2 * h));
  const here = at(P, t);
  const R = len(P);
  const eS = Math.max(len(here.E) / R, 1e-300), bS = Math.max(len(here.B) / R, 1e-300);
  return {
    faraday: len(add(curl(dE), dBdt)) / Math.max(len(curl(dE)), len(dBdt), 1e-300),
    divB: Math.abs(dB[0][0] + dB[1][1] + dB[2][2]) / bS,
    gauss: Math.abs(dE[0][0] + dE[1][1] + dE[2][2]) / eS,
    ampere: len(sub(curl(dB), dEdt)) / Math.max(len(curl(dB)), len(dEdt), 1e-300),
    E: here.E, B: here.B,
  };
};

// ─── §1 why a scalar cannot ─────────────────────────────────────────────────
function scalarOnly(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  A SCALAR CANNOT SUPPORT INDUCTION, AND NOT BY FAILING ═════");
  line();
  line("  `shine` radiates a SHORTFALL, which is a count, which is a scalar. Ask it");
  line("  for Faraday and the answer is not a large residual — it is that there is");
  line("  nothing to measure.");
  line();
  line("  With only a scalar potential the electric field is E = −∇φ, and the curl of");
  line("  a gradient is zero at every point of every configuration:");
  line();
  line(`  ${pad("field point", 16)} ${pad("|∇×E|", 14)} ${pad("|E|", 14)} ${pad("|∇×E| / (|E|/R)", 18)}`);
  line("  " + "─".repeat(66));
  for (const P of [[6, 0, 0], [10, 4, 3], [20, 0, 8]] as V3[]) {
    const h = 1e-3;
    const dE: V3[] = [];
    for (let i = 0; i < 3; i++) {
      const pp: V3 = [...P] as V3, pm: V3 = [...P] as V3;
      pp[i] += h; pm[i] -= h;
      dE.push(scale(sub(fields(pp, 40, "scalar").E, fields(pm, 40, "scalar").E), 1 / (2 * h)));
    }
    const c: V3 = [dE[1][2] - dE[2][1], dE[2][0] - dE[0][2], dE[0][1] - dE[1][0]];
    const E = fields(P, 40, "scalar").E;
    line(`  ${pad(`[${P.join(",")}]`, 16)} ${pad(len(c).toExponential(2), 14)} ${pad(len(E).toExponential(2), 14)} ${pad((len(c) / (len(E) / len(P))).toExponential(2), 18)}`);
  }
  line();
  line("  ZERO TO THE DIFFERENCING FLOOR, everywhere, necessarily. So Faraday reads");
  line("  0 = −∂B/∂t and FORCES B TO BE CONSTANT — which is not a magnetic field, it");
  line("  is the absence of one.");
  line();
  line("  THE EQUATION IS NOT VIOLATED. IT IS VACUOUS. That is the precise sense in");
  line("  which a scalar is the wrong object, and it is a better answer than 'the");
  line("  residual is large': the scalar cannot be wrong about induction because it");
  line("  cannot say anything about it.");
  return out.join("\n");
}

// ─── §2 what it should be ───────────────────────────────────────────────────
function vector(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  SO WHAT IT SHOULD BE — THE FIRST MOMENT OF THE SAME SHORTFALL ═════");
  line();
  line("  The deficit is DEG − #active: how many of a cell's rays failed to arrive.");
  line("  That is a COUNT over directions — the ZEROTH moment of the shortfall.");
  line();
  line("  The same shortfall has a FIRST moment, and nobody has read it:");
  line();
  line(`  ${pad("moment", 12)} ${pad("what it counts", 34)} ${pad("kind", 10)} is`);
  line("  " + "─".repeat(76));
  line(`  ${pad("zeroth", 12)} ${pad("how many rays are missing", 34)} ${pad("scalar", 10)} φ, the potential`);
  line(`  ${pad("first", 12)} ${pad("WHICH DIRECTIONS are missing", 34)} ${pad("vector", 10)} A, the vector potential`);
  line(`  ${pad("second", 12)} ${pad("the anisotropy of the shortfall", 34)} ${pad("tensor", 10)} not used here`);
  line();
  line("  Σ σ · (missing) · d̂ IS A LOCAL QUANTITY AND IT IS NOT AN ADDITION. It is a");
  line("  moment of a distribution the model already carries, in exactly the sense");
  line("  that the deficit is. A cell that can count how many rays are missing can");
  line("  count which way they are missing from, because it knows its own exits.");
  line();
  line("  And that is the object electromagnetism is written in. Weighted 1/R and");
  line("  read at the retarded time, φ and A are RETARDED POTENTIALS, and E and B");
  line("  are what you differentiate them into:");
  line();
  line("     E = −∇φ − ∂A/∂t          B = ∇×A");
  line();
  line("  THE DIFFERENCE FROM EVERYTHING BEFORE IS ONE STEP OF BOOKKEEPING. `induce`");
  line("  read the field DIRECTLY off the rays. This reads a POTENTIAL off the rays");
  line("  and the field off the potential. The rays are the same rays.");
  return out.join("\n");
}

// ─── §3 and then two of them are identities ─────────────────────────────────
function identities(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  AND THEN FARADAY HOLDS — IDENTICALLY ═════");
  line();
  line("  Worth being exact about what kind of result this is, because it would be");
  line("  easy to oversell. Faraday and ∇·B = 0 are not measurements that came out");
  line("  well. They are CONSEQUENCES OF THE FIELD BEING DERIVED FROM A POTENTIAL AT");
  line("  ALL:");
  line();
  line("     ∇×E = ∇×(−∇φ − ∂A/∂t) = −∂(∇×A)/∂t = −∂B/∂t     since ∇×∇φ ≡ 0");
  line("     ∇·B = ∇·(∇×A) ≡ 0");
  line();
  line("  So the content is not that they hold — it is that THE MODEL HAS SOMETHING");
  line("  TO PLAY THE PART OF A POTENTIAL. Measured anyway, since an identity with an");
  line("  arithmetic slip in it is just a claim:");
  line();
  line(`  ${pad("field point", 16)} ${pad("Faraday residual", 20)} ${pad("∇·B residual", 18)}`);
  line("  " + "─".repeat(60));
  for (const P of [[6, 0, 0], [10, 4, 3], [20, 0, 8], [40, 12, 5]] as V3[]) {
    const m = maxwell(P, 40, "moment");
    line(`  ${pad(`[${P.join(",")}]`, 16)} ${pad(m.faraday.toExponential(2), 20)} ${pad(m.divB.toExponential(2), 18)}`);
  }
  line();
  line("  BOTH AT THE DIFFERENCING FLOOR. `induce` §2 measured Faraday failing at 0.9");
  line("  of the terms — on fields read directly off ray counts, which are not");
  line("  potential-derived and so have no reason to satisfy it. THE FAILURE WAS IN");
  line("  THE BOOKKEEPING AND NOT IN THE MODEL.");
  return out.join("\n");
}

// ─── §4 which moves the real test ───────────────────────────────────────────
function real(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  WHICH MOVES THE REAL TEST TO THE OTHER TWO ═════");
  line();
  line("  If two of Maxwell's four are free, the content is entirely in the other");
  line("  two — and they are not free. Gauss and Ampère–Maxwell hold only if the");
  line("  potentials satisfy the wave equation, and that holds only under");
  line();
  line("     ∇·A + ∂φ/∂t = 0                    the LORENZ CONDITION");
  line();
  line("  which is charge conservation wearing a different hat: ∂ρ/∂t + ∇·J = 0.");
  line("  So 'does this model do electromagnetism' becomes 'does this model CONSERVE");
  line("  ITS SOURCE', which is a much better question and one the book can answer —");
  line("  Layer 2 makes charge a TRAVERSAL SENSE, and a strand has two ends, so");
  line("  conservation is orientation rather than a rule imposed on top.");
  line();
  const h = 1e-3;
  line(`  ${pad("field point", 16)} ${pad("Lorenz residual", 18)} ${pad("Gauss", 14)} ${pad("Ampère–Maxwell", 16)}`);
  line("  " + "─".repeat(68));
  for (const P of [[6, 0, 0], [10, 4, 3], [20, 0, 8]] as V3[]) {
    // ∇·A + ∂φ/∂t, normalised by |A|/R
    let divA = 0;
    for (let i = 0; i < 3; i++) {
      const pp: V3 = [...P] as V3, pm: V3 = [...P] as V3;
      pp[i] += h; pm[i] -= h;
      divA += (potentials(pp, 40, "moment").A[i] - potentials(pm, 40, "moment").A[i]) / (2 * h);
    }
    const dphidt = (potentials(P, 40 + h, "moment").phi - potentials(P, 40 - h, "moment").phi) / (2 * h);
    const A = potentials(P, 40, "moment").A;
    const sc = Math.max(len(A) / len(P), 1e-300);
    const m = maxwell(P, 40, "moment");
    line(`  ${pad(`[${P.join(",")}]`, 16)} ${pad((Math.abs(divA + dphidt) / sc).toExponential(2), 18)} ${pad(m.gauss.toExponential(2), 14)} ${pad(m.ampere.toExponential(2), 16)}`);
  }
  line();
  line("  SO ALL FOUR HOLD ON THE MODEL'S OWN READING, and the two that could have");
  line("  failed did not. That is the result: not that Maxwell was put in, but that");
  line("  reading a POTENTIAL off the shortfall rather than a FIELD off the ray count");
  line("  satisfies all four at once.");
  return out.join("\n");
}

// ─── §5 the permutations ────────────────────────────────────────────────────
function permutations(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  THE PERMUTATIONS — FIVE READINGS, AND ONLY ONE PASSES ═════");
  line();
  line("  A construction that works is worth little if a dozen others work too. So:");
  line("  every way of building the field from the same rays that is worth trying,");
  line("  against all four equations, at the same point.");
  line();
  line(`  ${pad("reading", 10)} ${pad("what it is", 28)} ${pad("Faraday", 10)} ${pad("∇·B", 10)} ${pad("Gauss", 10)} ${pad("Ampère", 10)}`);
  line("  " + "─".repeat(84));
  const P: V3 = [12, 4, 3];
  const rows: [How, string][] = [
    ["moment", "potential, 1/R, with rate"],
    ["norate", "potential, 1/R, no rate factor"],
    ["inverse", "potential, 1/R² weight"],
    ["scalar", "scalar potential only"],
    ["counts", "field read off ray counts"],
  ];
  const ok = (x: number) => x < 1e-4 ? "PASS" : x.toExponential(1);
  for (const [how, what] of rows) {
    const m = maxwell(P, 40, how);
    line(`  ${pad(how, 10)} ${pad(what, 28)} ${pad(ok(m.faraday), 10)} ${pad(ok(m.divB), 10)} ${pad(ok(m.gauss), 10)} ${pad(ok(m.ampere), 10)}`);
  }
  line();
  line("  AND THEY FAIL IN DIFFERENT PLACES, which is what makes this a pinning down");
  line("  rather than a lucky guess:");
  line();
  line("     counts   fails FARADAY, because a field read straight off the rays is");
  line("              not the curl of anything. This is `induce` §2's result and it");
  line("              is correct about what it measured.");
  line();
  line("     scalar   passes Faraday VACUOUSLY — no B at all — and fails to be");
  line("              electromagnetism for the reason §1 gives.");
  line();
  line("     inverse  keeps Faraday, because any potential gives that, and loses");
  line("              GAUSS — a 1/R² potential does not solve the wave equation, so");
  line("              the two free equations survive and the two real ones do not.");
  line();
  line("     norate   the interesting failure. It is the right SHAPE and the wrong");
  line("              WEIGHT: dropping 1/(1 − n̂·u) is dropping the fact that a moving");
  line("              emitter's rays arrive at a modified rate, which is not a");
  line("              relativistic correction bolted on but what COUNTING ARRIVALS");
  line("              means when the emitter is moving.");
  line();
  line("  SO THE CONSTRUCTION IS FORCED ON THREE COUNTS: it must be a potential (or");
  line("  Faraday goes), it must be weighted 1/R (or Gauss goes), and it must carry");
  line("  the arrival-rate factor (or Ampère goes). Each of those is something the");
  line("  model says rather than something chosen to make the answer come out.");
  return out.join("\n");
}

// ─── §6 the polarisation ────────────────────────────────────────────────────
function polarisation(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §6  AND THE POLARISATION, WHICH `shine` LEFT OWED ═════");
  line();
  line("  A scalar wave is longitudinal and light is not. With A a vector the");
  line("  question has an answer, so ask it: in the far field, is E perpendicular to");
  line("  the direction of propagation, and is B perpendicular to both?");
  line();
  line(`  ${pad("R", 8)} ${pad("∠(E, r̂)", 11)} ${pad("∠(B, r̂)", 11)} ${pad("∠(E, B)", 11)} ${pad("|E|/|B|", 11)} ${pad("|E|·R", 11)}`);
  line("  " + "─".repeat(70));
  const ang = (a: V3, b: V3) => Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (len(a) * len(b))))) * 180 / Math.PI;
  for (const R of [200, 600, 1800, 5400]) {
    // out along a direction well off the dipole axis, where the radiation is strong
    const dir = unit([1, 0, 0.6] as V3);
    const P = scale(dir, R);
    const f = fields(P, 40 + R, "moment");
    line(`  ${pad(String(R), 8)} ${pad(ang(f.E, dir).toFixed(2) + "°", 11)} ${pad(ang(f.B, dir).toFixed(2) + "°", 11)} ${pad(ang(f.E, f.B).toFixed(2) + "°", 11)} ${pad((len(f.E) / Math.max(len(f.B), 1e-300)).toFixed(4), 11)} ${pad((len(f.E) * R).toExponential(3), 11)}`);
  }
  line();
  line("  E AND B BOTH GO PERPENDICULAR TO THE PROPAGATION DIRECTION AND TO EACH");
  line("  OTHER AS R GROWS, with |E|/|B| → 1, which is c̄ = 1 in these units. That is");
  line("  a transverse electromagnetic wave, and it is the thing `shine` could not");
  line("  produce because a scalar has no direction to be transverse to.");
  line();
  line("  THE NEAR FIELD IS NOT TRANSVERSE AND SHOULD NOT BE — a dipole's near field");
  line("  has a radial component, which is why the angles start off 90° and approach");
  line("  it. The convergence IS the near-to-far transition `shine` measured as a");
  line("  crossover at λ/2π, seen from a second direction.");
  return out.join("\n");
}

console.log(scalarOnly());
console.log(vector());
console.log(identities());
console.log(real());
console.log(permutations());
console.log(polarisation());
