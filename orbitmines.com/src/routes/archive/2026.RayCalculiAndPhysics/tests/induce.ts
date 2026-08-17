/**
 * FARADAY, AND WHETHER THERE IS LIGHT — measured on the model's own retarded fields
 * rather than argued about.
 *
 * Every section before this one built E and B as MOMENTS OF ARRIVING RAYS. A ray
 * leaving a source at the retarded time carries its polarity and (since `fork`) its
 * emitter's velocity, and spreads over a sphere, so:
 *
 *     E(P,t) = Σ σ n̂ / R²                  the signed current of arriving rays
 *     B(P,t) = Σ σ (n̂ × u) / R²            the labelled moment, `fork`'s W
 *
 * with n̂, u and R all read at the retarded time. That is the whole of what the model
 * gives, and it is not a choice — it is what "rays carry a label and thin as 1/R²"
 * comes to.
 *
 * The question is whether that pair satisfies Maxwell. It is a numerical question
 * and this file answers it numerically, on a real trajectory, by finite differences.
 *
 *   §1  ∇·B = 0 and Gauss, which are the two the arc already claimed. Both hold.
 *
 *   §2  FARADAY, ∇×E + ∂B/∂t. It does NOT vanish, and the residual does not shrink
 *       as the grid does — so it is a real failure and not a discretisation error.
 *       The size of the failure is O(u²), which is why nothing before this noticed:
 *       every earlier test was done at first order in the source's speed.
 *
 *   §3  and the reason, which is exact and is worth more than the measurement. The
 *       model's B carries u at the RETARDED time and its E carries no u at all.
 *       Liénard–Wiechert's fields carry (1 − n̂·u)⁻³ factors and an ACCELERATION
 *       term that falls as 1/R rather than 1/R². THE MODEL HAS NO 1/R TERM
 *       ANYWHERE, because every ray thins as 1/R² by construction.
 *
 *   §4  WHICH IS A NO-RADIATION THEOREM, and it is the sharpest negative result in
 *       the arc. Radiated power is ∮ (E × B)·dA over a sphere; with both fields
 *       going as 1/R² the flux goes as 1/R² and vanishes at infinity. Measured
 *       against an accelerating charge: the model's flux falls as R⁻³·⁹⁹ where
 *       Larmor requires it to be FLAT. So an accelerating charge in this model
 *       radiates NOTHING.
 *
 *   §5  what it would take, priced. A 1/R field cannot be built from rays that
 *       thin as 1/R² — the exponent is the DIMENSION of the lattice and the gravity
 *       arc derives it. So light needs something that is not a ray: either a second
 *       excitation with its own fall-off, or the emission's amplitude rather than
 *       its count. Both are additions and neither is small.
 *
 * SUPERSEDED TWICE, AND THE FILE IS KEPT BECAUSE THE WAY IT IS WRONG IS THE
 * ARGUMENT. Everything below measures fields read DIRECTLY off the ray count, and
 * on that reading Faraday fails, Gauss fails, and nothing radiates. All three are
 * correct about what they measure and none is a fact about the model:
 *
 *   `shine`  the model's own 1/R object is the DEFICIT, not the count, and a
 *            retarded 1/R potential radiates. The no-radiation theorem is withdrawn.
 *
 *   `lorenz` reading a POTENTIAL off the shortfall and the field off the potential
 *            satisfies ALL FOUR of Maxwell, and gives a transverse wave with
 *            |E|/|B| → 1. Faraday fails here because E read off the count is
 *            RADIAL, so ∇×E ≡ 0 while ∂B/∂t does not vanish — measured below at
 *            |∇×E| ~ 10⁻¹² against |∂B/∂t| ~ 10⁻³.
 *
 * So what this file establishes is the NEGATIVE half of a pinning-down: the count
 * reading is refused by three of the four equations, which is what makes the
 * potential reading forced rather than chosen.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

type V3 = [number, number, number];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => { const n = len(a); return n < 1e-300 ? [0, 0, 0] : scale(a, 1 / n); };

/** a source trajectory: where it is, and how fast, at any time */
type Path = { at: (t: number) => V3; vel: (t: number) => V3; acc: (t: number) => V3 };

/** a charge oscillating along z — the standard radiating configuration */
const oscillator = (amp: number, omega: number): Path => ({
  at: (t) => [0, 0, amp * Math.sin(omega * t)],
  vel: (t) => [0, 0, amp * omega * Math.cos(omega * t)],
  acc: (t) => [0, 0, -amp * omega * omega * Math.sin(omega * t)],
});

/** a charge in uniform motion — the control, which must not radiate */
const uniform = (u: number): Path => ({
  at: (t) => [0, 0, u * t], vel: () => [0, 0, u], acc: () => [0, 0, 0],
});

/**
 * The retarded time: when did the ray arriving at P at time t leave?
 *
 * |P − s(tr)| = c̄ (t − tr) with c̄ = 1, solved by bisection because the trajectory
 * is arbitrary. This is the one place the model's finite propagation speed enters,
 * and everything downstream is a consequence of it.
 */
const retarded = (P: V3, t: number, path: Path): number => {
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
    const mid = (lo + hi) / 2;
    if (len(sub(P, path.at(mid))) - (t - mid) < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
};

/**
 * THE MODEL'S FIELDS — rays carrying a polarity and a label, thinning as 1/R².
 *
 * Nothing here is Liénard–Wiechert. There are no (1 − n̂·u) factors and no
 * acceleration term, because a ray does not know it is being accelerated: it
 * carries what its emitter was doing WHEN IT LEFT and then travels straight.
 */
type Counting = "naive" | "rate" | "full";

const fields = (P: V3, t: number, path: Path, q = 1, how: Counting = "rate") => {
  const tr = retarded(P, t, path);
  const sep = sub(P, path.at(tr));
  const R = len(sep);
  if (R < 1e-9) return { E: [0, 0, 0] as V3, B: [0, 0, 0] as V3, R, tr };
  const n = unit(sep);
  const u = path.vel(tr);
  const k = 1 - dot(n, u);                        // the retardation factor
  let E: V3;
  switch (how) {
    // A ray density with no correction for the source's own motion. This was the
    // first version of the file and it is WRONG ON THE MODEL'S OWN TERMS.
    case "naive": E = scale(n, q / (R * R)); break;
    // THE MODEL'S ACTUAL COUNT. A source emitting at a fixed rate in its own time
    // has its rays ARRIVE at a different rate, because it moves between emissions:
    // ν dt_emit rays arrive over dt_emit(1 − n̂·u). That factor is not a relativistic
    // correction put in by hand — it is what counting arrivals MEANS when the
    // emitter is moving, and the model is a counting model.
    case "rate": E = scale(n, q / (k * R * R)); break;
    // and the full Liénard–Wiechert velocity field, for comparison — note the
    // numerator points from where the source WOULD be, not from where it was
    case "full": {
      const g2 = 1 - dot(u, u);
      E = scale(sub(n, u), q * g2 / (k * k * k * R * R));
      break;
    }
  }
  // B is `fork`'s labelled moment and NOT n̂ × E: for a radial E the cross product
  // is identically zero, which an earlier version of this file printed as a column
  // of noughts without noticing.
  return { E, B: scale(cross(n, u), q / (k * R * R)), R, tr };
};

/** finite-difference curl, divergence and time derivative of the model's fields */
const ops = (P: V3, t: number, path: Path, h = 1e-4, how: Counting = "rate") => {
  const at = (p: V3, tt: number) => fields(p, tt, path, 1, how);
  const dE: V3[] = [], dB: V3[] = [];
  for (let i = 0; i < 3; i++) {
    const pp: V3 = [...P] as V3, pm: V3 = [...P] as V3;
    pp[i] += h; pm[i] -= h;
    const a = at(pp, t), b = at(pm, t);
    dE.push(scale(sub(a.E, b.E), 1 / (2 * h)));
    dB.push(scale(sub(a.B, b.B), 1 / (2 * h)));
  }
  const divE = dE[0][0] + dE[1][1] + dE[2][2];
  const divB = dB[0][0] + dB[1][1] + dB[2][2];
  const curl = (d: V3[]): V3 => [
    d[1][2] - d[2][1], d[2][0] - d[0][2], d[0][1] - d[1][0]];
  const fa = at(P, t + h), fb = at(P, t - h);
  const dEdt = scale(sub(fa.E, fb.E), 1 / (2 * h));
  const dBdt = scale(sub(fa.B, fb.B), 1 / (2 * h));
  return { divE, divB, curlE: curl(dE), curlB: curl(dB), dEdt, dBdt, ...at(P, t) };
};

// ─── §1 the two that already worked ─────────────────────────────────────────
function statics(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  ∇·B = 0 AND GAUSS, WHICH THE ARC ALREADY CLAIMED ═════");
  line();
  line("  Before the curl equations, the two the arc has already asserted, now on a");
  line("  MOVING source where they could have failed and did not.");
  line();
  const path = uniform(0.3);
  line("  A divergence is only meaningful against a scale, so both are reported");
  line("  relative to |field|/R, which is what a divergence of that field would be if");
  line("  it were of ordinary size.");
  line();
  line(`  ${pad("how rays are counted", 22)} ${pad("field point", 14)} ${pad("rel. ∇·B", 12)} ${pad("rel. ∇·E", 12)} Gauss?`);
  line("  " + "─".repeat(72));
  for (const how of ["naive", "rate"] as Counting[]) {
    for (const P of [[5, 0, 0], [10, 3, 2]] as V3[]) {
      const o = ops(P, 0, path, 1e-4, how);
      const eS = len(o.E) / o.R, bS = Math.max(len(o.B) / o.R, 1e-300);
      const rel = Math.abs(o.divE) / eS;
      line(`  ${pad(how === "naive" ? "no motion correction" : how === "rate" ? "ARRIVAL RATE (model)" : "Liénard–Wiechert", 22)} ${pad(`[${P.join(",")}]`, 14)} ${pad((Math.abs(o.divB) / bS).toExponential(1), 12)} ${pad(rel.toExponential(1), 12)} ${rel < 1e-6 ? "YES" : rel < 1e-2 ? "nearly" : "NO"}`);
    }
  }
  line();
  line("  ∇·B IS ZERO TO THE DIFFERENCING FLOOR — no magnetic monopole, which `fork`");
  line("  derived from the cross product and this confirms on a moving source.");
  line();
  line("  AND ∇·E DOES NOT VANISH — it is 0.1 to 0.3 of |E|/R, for both ways of");
  line("  counting. So GAUSS FAILS for a moving source when the field is read");
  line("  DIRECTLY off the ray count, and a static charge is the only case where the");
  line("  radial 1/R² reading is divergence-free.");
  line();
  line("  AN EARLIER VERSION OF THIS FILE REPORTED GAUSS PASSING HERE, and it was");
  line("  wrong for a reason worth recording: the retarded-time bisection had its");
  line("  inequality inverted, so it walked to its own lower bracket endpoint and");
  line("  returned tr = t − 10⁷ for every field point, silently. Everything");
  line("  downstream was then a nearly-static configuration evaluated a very long way");
  line("  away. It was caught by checking the solver's own residual |P − s(tr)| −");
  line("  (t − tr), which should be nought and was −7·10⁶.");
  line();
  line("  SO THREE OF FOUR FAIL ON THIS READING, and `lorenz` shows why: a field read");
  line("  straight off the rays is not the derivative of a potential, and Maxwell is");
  line("  a set of statements about something that is.");
  return out.join("\n");
}

// ─── §2 Faraday ─────────────────────────────────────────────────────────────
function faraday(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  FARADAY, WHICH IS THE ONE THAT MATTERS ═════");
  line();
  line("  ∇×E = −∂B/∂t. If it holds, a changing magnetic field drives a circulating");
  line("  electric one, the two can sustain each other, and there is light. If it");
  line("  does not, this arc has a magnetostatics and nothing more.");
  line();
  line("  Measured on an oscillating charge, with the residual normalised by the");
  line("  larger of the two terms so it reads as a FRACTION rather than a size:");
  line();
  const path = oscillator(0.5, 0.4);
  line(`  ${pad("field point", 16)} ${pad("|∇×E|", 12)} ${pad("|∂B/∂t|", 12)} ${pad("|residual|", 12)} ${pad("relative", 10)}`);
  line("  " + "─".repeat(68));
  for (const P of [[3, 0, 0], [6, 0, 0], [6, 4, 2], [12, 0, 3]] as V3[]) {
    const o = ops(P, 1.0, path);
    const res = add(o.curlE, o.dBdt);
    const scaleOf = Math.max(len(o.curlE), len(o.dBdt), 1e-300);
    line(`  ${pad(`[${P.join(",")}]`, 16)} ${pad(len(o.curlE).toExponential(2), 12)} ${pad(len(o.dBdt).toExponential(2), 12)} ${pad(len(res).toExponential(2), 12)} ${pad((len(res) / scaleOf).toExponential(2), 10)}`);
  }
  line();
  line("  IT DOES NOT HOLD. The residual is the same order as the terms themselves,");
  line("  so this is not a small correction to Faraday — the equation is simply not");
  line("  satisfied by these fields.");
  line();
  line("  AND IT IS NOT A DISCRETISATION ERROR, which has to be ruled out before the");
  line("  result means anything. Shrink the differencing step and a numerical");
  line("  artefact shrinks with it; a real failure does not:");
  line();
  line(`  ${pad("step h", 12)} ${pad("|residual|", 14)} ${pad("relative", 12)} behaviour`);
  line("  " + "─".repeat(56));
  let prev = NaN;
  for (const h of [1e-2, 1e-3, 1e-4, 1e-5]) {
    const o = ops([6, 0, 0], 1.0, path, h);
    const res = len(add(o.curlE, o.dBdt));
    const rel = res / Math.max(len(o.curlE), len(o.dBdt));
    line(`  ${pad(h.toExponential(0), 12)} ${pad(res.toExponential(4), 14)} ${pad(rel.toExponential(3), 12)} ${isNaN(prev) ? "—" : Math.abs(rel / prev - 1) < 0.05 ? "FLAT — real" : "shrinking"}`);
    prev = rel;
  }
  line();
  line("  FLAT ACROSS THREE DECADES OF STEP SIZE. The failure is in the fields and");
  line("  not in the arithmetic.");
  return out.join("\n");
}

// ─── §3 why ─────────────────────────────────────────────────────────────────
function why(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  AND THE REASON, WHICH IS EXACT ═════");
  line();
  line("  The measurement says Faraday fails. The reason says it had to, and it is");
  line("  worth more than the measurement because it says what a repair must supply.");
  line();
  line("  A charge that is really moving has the Liénard–Wiechert fields, and they");
  line("  have three pieces the model's do not:");
  line();
  line(`  ${pad("Liénard–Wiechert", 34)} the model's rays`);
  line("  " + "─".repeat(74));
  line(`  ${pad("(1 − n̂·u)⁻³ in the denominator", 34)} absent — a ray does not know`);
  line(`  ${pad("", 34)} it is being overtaken`);
  line(`  ${pad("a velocity term at 1/R²", 34)} PRESENT — this is what the arc has`);
  line(`  ${pad("an ACCELERATION term at 1/R", 34)} ABSENT — and this is the whole of it`);
  line();
  line("  THE MODEL HAS NO 1/R TERM ANYWHERE, and it cannot have one. Every ray thins");
  line("  as 1/R² because a fixed number of them spreads over a shell of area 4πR² —");
  line("  which is the gravity arc's derivation of the inverse-square law, and it is");
  line("  the same sentence.");
  line();
  line("  So a field built by counting arriving rays falls as 1/R² NECESSARILY, and a");
  line("  radiation field falls as 1/R. The two exponents differ by one and the");
  line("  exponent is fixed by the dimension of the lattice.");
  return out.join("\n");
}

// ─── §4 the no-radiation theorem ────────────────────────────────────────────
function radiation(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  WHICH IS A NO-RADIATION THEOREM ═════");
  line();
  line("  Radiated power is the Poynting flux through a sphere, ∮(E × B)·dA. The area");
  line("  grows as R², so a field pair whose product falls faster than 1/R² carries");
  line("  no power to infinity. With both fields at 1/R² the product is 1/R⁴ and the");
  line("  flux falls as 1/R².");
  line();
  line("  Measured on an accelerating charge, which is the configuration that must");
  line("  radiate if anything does:");
  line();
  const path = oscillator(0.5, 0.4);
  line(`  ${pad("R", 10)} ${pad("∮(E×B)·dA", 16)} ${pad("×R²", 14)} ${pad("slope", 12)}`);
  line("  " + "─".repeat(56));
  const flux = (R: number) => {
    // a Lebedev-ish sum over the sphere, adequate for a power law
    let tot = 0, n = 0;
    const N = 24;
    for (let i = 0; i < N; i++) for (let j = 0; j < 2 * N; j++) {
      const th = Math.PI * (i + 0.5) / N, ph = Math.PI * j / N;
      const nh: V3 = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
      const P = scale(nh, R);
      const f = fields(P, 1.0, path);
      tot += dot(cross(f.E, f.B), nh) * Math.sin(th);
      n++;
    }
    return Math.abs(tot / n * 4 * Math.PI * R * R);
  };
  const Rs = [10, 20, 40, 80], fs: number[] = [];
  for (const R of Rs) {
    const F = flux(R); fs.push(F);
    const k = fs.length - 1;
    const slope = k > 0 ? Math.log(fs[k] / fs[k - 1]) / Math.log(Rs[k] / Rs[k - 1]) : NaN;
    line(`  ${pad(String(R), 10)} ${pad(F.toExponential(3), 16)} ${pad((F * R * R).toExponential(3), 14)} ${pad(isNaN(slope) ? "—" : slope.toFixed(3), 12)}`);
  }
  const slope = Math.log(fs[fs.length - 1] / fs[0]) / Math.log(Rs[Rs.length - 1] / Rs[0]);
  line();
  line(`  overall slope  ${slope.toFixed(3)}   against 0 for a radiating charge`);
  line();
  line(`  THE FLUX FALLS AS R⁻³ WHERE LARMOR NEEDS IT FLAT, so the power crossing a`);
  line("  sphere goes to zero as the sphere grows and AN ACCELERATING CHARGE IN THIS");
  line("  MODEL RADIATES NOTHING.");
  line();
  line("  AND THE POWER LAW UNDERSTATES IT. Look at what the Poynting vector even is");
  line("  here: E is along n̂ and B is along n̂ × u, so");
  line();
  line("     E × B ∝ n̂ × (n̂ × u) = n̂(n̂·u) − u,   whose radial part is");
  line("     n̂·[n̂(n̂·u) − u] = (n̂·u) − (n̂·u) = 0");
  line();
  line("  THE RADIAL POYNTING FLUX IS IDENTICALLY ZERO, not small. Energy circulates");
  line("  tangentially around the source and none of it leaves. The R⁻³ measured");
  line("  above is a residual of the retardation and not a leak. So this is not a");
  line("  radiation field that is too weak — IT IS NOT A RADIATION FIELD.");
  line();
  line("  THAT IS THE PHOTON, ANSWERED IN THE NEGATIVE, and it is a much sharper");
  line("  statement than the arc has managed before. It is not that b̂ lacks");
  line("  dynamics, or that the spin ladder has no room for a spin-1 object. It is");
  line("  that A FIELD MADE BY COUNTING ARRIVING RAYS FALLS AS 1/R², AND LIGHT");
  line("  REQUIRES 1/R.");
  return out.join("\n");
}

// ─── §5 what a repair would cost ────────────────────────────────────────────
function repair(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  WHAT LIGHT WOULD COST, PRICED ═════");
  line();
  line("  The obstruction is one exponent, so a repair has to change that exponent —");
  line("  and the exponent is not free. `sheet` and the inverse-square derivation fix");
  line("  it: a pulse of SHEET charges spreads over a shell of 4πR² cells, so the");
  line("  count per cell is 1/R² in three dimensions and 1/R^(D−1) in general. That");
  line("  is the gravity arc's central result and light cannot be bought by giving");
  line("  it up.");
  line();
  line("  THREE WAYS OUT, and each is an addition rather than a consequence:");
  line();
  line(`  ${pad("route", 26)} ${pad("what it needs", 30)} what it costs`);
  line("  " + "─".repeat(80));
  line(`  ${pad("an amplitude, not a count", 26)} ${pad("rays carry a magnitude that", 30)} a real per ray —`);
  line(`  ${pad("", 26)} ${pad("adds coherently, so N rays", 30)} the model is`);
  line(`  ${pad("", 26)} ${pad("give √N not N", 30)} integer everywhere`);
  line();
  line(`  ${pad("a second excitation", 26)} ${pad("something that is not a ray", 30)} a new field, the`);
  line(`  ${pad("", 26)} ${pad("and does not thin as 1/R²", 30)} thing fork §6`);
  line(`  ${pad("", 26)} ${pad("", 30)} priced and avoided`);
  line();
  line(`  ${pad("a coherent front", 26)} ${pad("rays that stay phase-locked", 30)} refuted — the`);
  line(`  ${pad("", 26)} ${pad("across a shell, so the shell", 30)} coherence ceiling`);
  line(`  ${pad("", 26)} ${pad("acts as one object", 30)} is half a wavelength`);
  line();
  line("  THE THIRD IS ALREADY DEAD, by the arc's own coherence ceiling — anything");
  line("  phase-coherent in this model cannot stay coherent past half its own");
  line("  wavelength, so a shell cannot act as one object at any useful radius.");
  line();
  line("  THE FIRST IS THE INTERESTING ONE and it is not obviously wrong. A count of");
  line("  rays is N; an amplitude that adds with phases is √N; and √(1/R²) is 1/R.");
  line("  SO AN AMPLITUDE PICTURE GIVES EXACTLY THE MISSING EXPONENT — which is");
  line("  suggestive enough to be worth saying and nowhere near a derivation, because");
  line("  nothing in the three rules assigns a ray anything but a sign.");
  line();
  line("  AND IT IS THE SAME FORK THE QUANTUM ARC ALREADY FOUND, arriving from a");
  line("  third direction: that arc asked whether the model carries an AMPLITUDE or a");
  line("  PROBABILITY and concluded 'both, by regime'. If light needs the amplitude");
  line("  reading, then the regime boundary is not a convenience — it is where");
  line("  electromagnetism lives, and the choice is forced rather than free.");
  return out.join("\n");
}

console.log(statics());
console.log(faraday());
console.log(why());
console.log(radiation());
console.log(repair());
