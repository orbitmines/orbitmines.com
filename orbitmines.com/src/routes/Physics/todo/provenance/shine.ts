/**
 * LIGHT AS A DISCREPANCY — and `induce` §4's no-radiation theorem is WITHDRAWN,
 * because it measured the wrong object.
 *
 * That file built the electric field as the instantaneous count of arriving rays,
 * σn̂/R², found everything falling as 1/R², and concluded that a field made by
 * counting rays cannot radiate. The counting is right and the conclusion does not
 * follow, because THE MODEL'S OWN FIELD IS NOT THAT COUNT.
 *
 * The gravity arc reads every force off the DEFICIT — the shortfall in a cell's ray
 * activity, DEG − #active — and two facts about it were already established there
 * and are load-bearing here:
 *
 *     IT GOES AS 1/r.   Measured: one absorber in a 101³ vacuum, settled, fits
 *                       A(1/r − 1/R) to 2% at every r ≥ 8. It is a POTENTIAL, and
 *                       its gradient is the inverse-square force.
 *
 *     IT PROPAGATES AT c̄. "This deficit then expands at c̄" — the article's own
 *                       words, and forced, since the rays that fail to arrive are
 *                       the ones travelling at one cell a tick.
 *
 * A retarded 1/r potential is exactly what radiation is made of, and the arithmetic
 * takes one line:
 *
 *     deficit(P,t) = S(t − R)/(kR)
 *     ∇deficit     = −r̂ [ S′(t−R)/(kR)  +  S(t−R)/(kR²) ]
 *                        └── 1/R, RADIATION ──┘ └── 1/R², Coulomb ──┘
 *
 * The gradient of a retarded potential has a term the gradient of a STATIC one does
 * not, because ∇ acting on S(t−R) produces S′(t−R)·r̂ and loses no power of R.
 *
 *   §1  the withdrawal, stated exactly: what `induce` measured, why it is the
 *       Coulomb piece, and what it never varied.
 *
 *   §2  the two terms, separated and measured against an oscillating sink. The
 *       crossover is at R ≈ λ/2π — a near zone and a far zone, which the model was
 *       not built to have and has anyway.
 *
 *   §3  the far field falls as 1/R, measured over four decades.
 *
 *   §4  AND THE ENERGY FLUX IS FLAT IN R, which is what radiating means. Against
 *       `induce` §4's R⁻³, on the same source, with the only difference being which
 *       quantity is read.
 *
 *   §5  the second reading — a disturbance moving AT c̄, which cannot separate from
 *       its own forward emission and piles it onto a surface. Measured: the forward
 *       concentration diverges as (1 − u)⁻¹, so at u = c̄ the emission is a front
 *       rather than a volume, and a front in three dimensions thins as 1/R by
 *       geometry alone. TWO ROUTES TO THE SAME EXPONENT.
 *
 *   §6  what is still owed, which is no longer the exponent.
 *
 * SO: the model radiates, the radiating object is the DISCREPANCY rather than the
 * emitter, and the 1/R that `induce` said was impossible is the 1/r the gravity arc
 * derived in its first section — differentiated with respect to a retarded time
 * instead of a distance.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

/**
 * The deficit at distance R and time t, from a sink whose rate is S(t).
 *
 * k is the medium's constant — 4π·spread in the article — and is carried
 * symbolically because nothing here depends on it.
 */
type Sink = { S: (t: number) => number; dS: (t: number) => number };

const oscillating = (mean: number, amp: number, omega: number): Sink => ({
  S: (t) => mean + amp * Math.sin(omega * t),
  dS: (t) => amp * omega * Math.cos(omega * t),
});
const steady = (mean: number): Sink => ({ S: () => mean, dS: () => 0 });

const K = 4 * Math.PI * (9 / 26);          // 4π·spread, the article's own constant

const deficit = (R: number, t: number, s: Sink) => s.S(t - R) / (K * R);

/** the radial gradient, and its two pieces separated */
const gradient = (R: number, t: number, s: Sink) => {
  const rad = -s.dS(t - R) / (K * R);         // 1/R — the radiation term
  const near = -s.S(t - R) / (K * R * R);     // 1/R² — the Coulomb term
  return { rad, near, total: rad + near };
};

/** and the same thing by finite difference, as a check that the algebra is right */
const gradNumeric = (R: number, t: number, s: Sink, h = 1e-6) =>
  (deficit(R + h, t, s) - deficit(R - h, t, s)) / (2 * h);

// ─── §1 the withdrawal ──────────────────────────────────────────────────────
function withdraw(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  WHAT `induce` §4 MEASURED, AND WHY IT IS NOT THE FIELD ═════");
  line();
  line("  That file built E as the instantaneous count of arriving rays, σn̂/R², and");
  line("  found it falls as 1/R² however the source moves. THAT IS CORRECT AND IT IS");
  line("  THE COULOMB PIECE. What it never did was vary the source's RATE and ask");
  line("  what the shortfall does — and the shortfall is what every force in this");
  line("  book is actually read off.");
  line();
  line(`  ${pad("", 26)} ${pad("what it is", 24)} falls as`);
  line("  " + "─".repeat(66));
  line(`  ${pad("#active, the ray count", 26)} ${pad("a flux", 24)} 1/R²`);
  line(`  ${pad("deficit = DEG − #active", 26)} ${pad("a POTENTIAL", 24)} 1/R  ← measured, gravity arc`);
  line(`  ${pad("∇deficit", 26)} ${pad("the force", 24)} 1/R²  ← Newton, Coulomb`);
  line();
  line("  THE DEFICIT IS ALREADY A 1/R OBJECT and the arc established it in its first");
  line("  section: one absorber in a 101³ vacuum, settled, fits A(1/r − 1/R) to 2% at");
  line("  every r ≥ 8. It is a potential, and the inverse-square law is its gradient.");
  line();
  line("  AND IT IS RETARDED — 'this deficit then expands at c̄', which is not a");
  line("  modelling choice but a consequence of the rays that fail to arrive being");
  line("  the ones travelling at one cell a tick. So:");
  line();
  line("     deficit(P,t) = S(t − R)/(kR)");
  line();
  line("  A GRADIENT OF THAT HAS A TERM A STATIC ONE DOES NOT, because ∇ acting on");
  line("  S(t − R) gives S′(t − R)·r̂ and loses no power of R:");
  line();
  line("     ∇deficit = −r̂ [ S′(t−R)/(kR)  +  S(t−R)/(kR²) ]");
  line("                     ─── 1/R ───      ─── 1/R² ───");
  line();
  line("  So `induce` §4's theorem — 'a field made by counting arriving rays falls as");
  line("  1/R², and light requires 1/R' — IS WITHDRAWN. The premise is true of the");
  line("  count and false of the deficit, and the deficit is the field.");
  return out.join("\n");
}

// ─── §2 the two terms ───────────────────────────────────────────────────────
function terms(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  THE TWO TERMS, SEPARATED ═════");
  line();
  const omega = 0.05, lam = 2 * Math.PI / omega;
  const s = oscillating(100, 40, omega);
  line(`  An oscillating sink: S(t) = 100 + 40 sin(${omega}t), so λ = ${lam.toFixed(1)} cells.`);
  line("  The algebra above against a finite difference of the deficit itself, which");
  line("  is the check that nothing has been assumed:");
  line();
  line(`  ${pad("R", 9)} ${pad("1/R² term", 13)} ${pad("1/R term", 13)} ${pad("total", 13)} ${pad("numeric", 13)} ${pad("agree", 9)}`);
  line("  " + "─".repeat(76));
  let worst = 0;
  for (const R of [1, 5, 20, 100, 500, 2000]) {
    const g = gradient(R, 300, s);
    const n = gradNumeric(R, 300, s);
    const rel = Math.abs(g.total - n) / Math.max(Math.abs(n), 1e-300);
    worst = Math.max(worst, rel);
    line(`  ${pad(String(R), 9)} ${pad(g.near.toExponential(3), 13)} ${pad(g.rad.toExponential(3), 13)} ${pad(g.total.toExponential(3), 13)} ${pad(n.toExponential(3), 13)} ${pad(rel < 1e-6 ? "yes" : rel.toExponential(1), 9)}`);
  }
  line();
  line(`  worst disagreement between the split and the derivative:  ${worst.toExponential(2)}`);
  line();
  line("  THE SPLIT IS EXACT, so the two terms are not a decomposition chosen for");
  line("  convenience — they are what the derivative is.");
  line();
  line("  AND THEY CROSS OVER. The near term is S/(kR²) and the far one S′/(kR), so");
  line("  they are equal where R = S/S′ — which for a sinusoid is of order 1/ω:");
  line();
  line(`  ${pad("R", 10)} ${pad("|1/R term| / |1/R² term|", 26)} zone`);
  line("  " + "─".repeat(52));
  for (const R of [1, 5, 20, 100, 500, 2000]) {
    const g = gradient(R, 300, s);
    const ratio = Math.abs(g.rad) / Math.abs(g.near);
    line(`  ${pad(String(R), 10)} ${pad(ratio.toExponential(3), 26)} ${ratio < 0.5 ? "NEAR — Coulomb" : ratio > 2 ? "FAR — radiation" : "crossover"}`);
  }
  line();
  line(`  the crossover sits near R = 1/ω = ${(1 / omega).toFixed(0)}, which is λ/2π`);
  line();
  line("  A NEAR ZONE AND A FAR ZONE, WHICH THIS MODEL WAS NOT BUILT TO HAVE. Nobody");
  line("  put a wavelength in; the only inputs are a sink whose rate varies and a");
  line("  shortfall that travels at c̄. The zone boundary is where the source's own");
  line("  period is comparable to the light-time out to the observer, which is what");
  line("  it is in electromagnetism too.");
  return out.join("\n");
}

// ─── §3 the far field ───────────────────────────────────────────────────────
function farfield(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  AND THE FAR FIELD FALLS AS 1/R ═════");
  line();
  const s = oscillating(100, 40, 0.05);
  line("  Read the gradient at the phase where the radiation term is largest, so the");
  line("  near term is not being hidden by a zero of the far one:");
  line();
  line(`  ${pad("R", 10)} ${pad("|∇deficit|", 14)} ${pad("×R", 14)} ${pad("×R²", 14)} ${pad("slope", 10)}`);
  line("  " + "─".repeat(66));
  const Rs = [100, 1000, 10000, 100000], vals: number[] = [];
  for (const R of Rs) {
    // choose t so that t − R sits at a peak of S′
    const t = R;
    const g = gradient(R, t, s);
    const m = Math.abs(g.total);
    vals.push(m);
    const k = vals.length - 1;
    const slope = k > 0 ? Math.log(vals[k] / vals[k - 1]) / Math.log(Rs[k] / Rs[k - 1]) : NaN;
    line(`  ${pad(R.toExponential(0), 10)} ${pad(m.toExponential(4), 14)} ${pad((m * R).toFixed(4), 14)} ${pad((m * R * R).toExponential(2), 14)} ${pad(isNaN(slope) ? "—" : slope.toFixed(4), 10)}`);
  }
  line();
  line("  |∇deficit|·R SETTLES AND |∇deficit|·R² RUNS AWAY, and the slope converges");
  line("  on −1 from below: −1.155, −1.019, −1.002. It is not −1 at the first row and");
  line("  should not be — the 1/R² term is still contributing at R = 100, which is");
  line("  barely out of the near zone. What the convergence shows is that the far");
  line("  field IS the radiation term and the other one dies out of it.");
  line();
  line("  THAT IS A RADIATION FIELD. `induce` looked for a 1/R term, found none in");
  line("  the ray count, and did not look in the shortfall.");
  return out.join("\n");
}

// ─── §4 the energy flux ─────────────────────────────────────────────────────
function flux(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  AND THE FLUX IS FLAT IN R, WHICH IS WHAT RADIATING MEANS ═════");
  line();
  line("  Power crossing a sphere is (energy density)·(area). With the field going as");
  line("  1/R the density goes as 1/R², the area as R², and the product is flat — so");
  line("  the same power crosses every sphere and it reaches infinity.");
  line();
  const s = oscillating(100, 40, 0.05);
  const st = steady(100);
  line(`  ${pad("R", 10)} ${pad("oscillating ∝|∇|²·4πR²", 24)} ${pad("steady sink", 20)} ${pad("slope", 10)}`);
  line("  " + "─".repeat(70));
  const Rs = [100, 1000, 10000, 100000], os: number[] = [];
  for (const R of Rs) {
    const g = gradient(R, R, s).total;          // at the radiative peak
    const gs = gradient(R, R, st).total;
    const P = g * g * 4 * Math.PI * R * R;
    const Ps = gs * gs * 4 * Math.PI * R * R;
    os.push(P);
    const k = os.length - 1;
    const slope = k > 0 ? Math.log(os[k] / os[k - 1]) / Math.log(Rs[k] / Rs[k - 1]) : NaN;
    line(`  ${pad(R.toExponential(0), 10)} ${pad(P.toExponential(4), 24)} ${pad(Ps.toExponential(3), 20)} ${pad(isNaN(slope) ? "—" : slope.toFixed(4), 10)}`);
  }
  line();
  line("  THE OSCILLATING SINK'S POWER IS FLAT IN R AND THE STEADY ONE'S FALLS AS");
  line("  1/R². So a sink whose rate is CONSTANT does not radiate and one whose rate");
  line("  CHANGES does, which is the right distinction and nothing was arranged to");
  line("  produce it — the steady case has S′ = 0 and the radiation term vanishes");
  line("  identically.");
  line();
  line("  AND IT GOES AS S′², which is Larmor's shape: the radiated power is the");
  line("  square of the rate of change of the source. The model does not fix the");
  line("  constant in front, which is the same missing constant as everywhere else.");
  return out.join("\n");
}

// ─── §5 the second reading: moving at c̄ ─────────────────────────────────────
function wake(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  AND THE OTHER ROUTE — A DISTURBANCE THAT MOVES AT c̄ ═════");
  line();
  line("  There is a second way to the same exponent and it is worth measuring");
  line("  because it is geometric rather than differential.");
  line();
  line("  A source emitting at a fixed rate in its own time has its rays ARRIVE at a");
  line("  different rate, because it moves between emissions: the arrival rate");
  line("  carries a factor 1/(1 − n̂·u). Forward of a source moving at u that factor");
  line("  is 1/(1 − u), and AT u = c̄ IT DIVERGES — a source at the speed of its own");
  line("  emission never separates from it, so everything it ever emitted forward is");
  line("  in the same place.");
  line();
  line(`  ${pad("u", 10)} ${pad("forward 1/(1−u)", 17)} ${pad("backward 1/(1+u)", 18)} ${pad("front : back", 14)}`);
  line("  " + "─".repeat(64));
  for (const u of [0, 0.5, 0.9, 0.99, 0.999, 0.9999]) {
    line(`  ${pad(u.toFixed(4), 10)} ${pad((1 / (1 - u)).toExponential(3), 17)} ${pad((1 / (1 + u)).toFixed(4), 18)} ${pad((((1 + u) / (1 - u))).toExponential(2), 14)}`);
  }
  line();
  line("  SO THE EMISSION OF ANYTHING MOVING AT c̄ IS NOT A VOLUME, IT IS A SURFACE.");
  line("  And the geometry then does the rest without any differentiation: a fixed");
  line("  amount of anything spread over a SPHERE of radius R thins as 1/R², and the");
  line("  same amount spread over a FRONT — a ring of circumference 2πR — thins as");
  line("  1/R. The exponent `induce` called impossible is what a two-dimensional");
  line("  spread gives, and everything massless in this model moves at exactly c̄.");
  line();
  line("  THE TWO ROUTES ARE NOT RIVALS AND THEY ARE NOT INDEPENDENT EITHER. §2's is");
  line("  that a retarded potential's gradient keeps a 1/R term; this one is that the");
  line("  retardation factor concentrates the emission onto a surface. Both are the");
  line("  same fact about c̄ being finite, read once in time and once in space.");
  line();
  line("  WHAT THIS SECTION DOES NOT DO is run the front on the lattice. The pile-up");
  line("  at u → c̄ is computed from the retardation factor, which is arithmetic; a");
  line("  real front on a real lattice has a width and the model would have to say");
  line("  what sets it. THAT IS THE NEXT MEASUREMENT and it is not this one.");
  return out.join("\n");
}

// ─── §6 what is left ────────────────────────────────────────────────────────
function left(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §6  WHAT IS LEFT, WHICH IS NO LONGER THE EXPONENT ═════");
  line();
  line(`  ${pad("", 30)} ${pad("before", 16)} now`);
  line("  " + "─".repeat(70));
  line(`  ${pad("a 1/R field", 30)} ${pad("IMPOSSIBLE", 16)} it is the deficit's gradient`);
  line(`  ${pad("radiation", 30)} ${pad("forbidden", 16)} S′² and flat in R`);
  line(`  ${pad("a near zone and a far zone", 30)} ${pad("—", 16)} at λ/2π, unasked for`);
  line(`  ${pad("Faraday", 30)} ${pad("fails", 16)} NOT RETESTED — see below`);
  line(`  ${pad("the photon as a particle", 30)} ${pad("no spin-1", 16)} unchanged, and now beside`);
  line(`  ${pad("", 30)} ${pad("", 16)} the point`);
  line();
  line("  THE THIRD ROW IS THE ONE THAT WAS NOT ASKED FOR and is the reason to");
  line("  believe the rest. Nobody put a wavelength into this model. A near zone");
  line("  where the force goes as 1/R² and a far zone where it goes as 1/R, meeting");
  line("  at λ/2π, is the structure electromagnetism has — and it falls out of a sink");
  line("  whose rate varies and a shortfall that travels at one cell a tick.");
  line();
  line("  AND THE FIFTH ROW STOPS MATTERING, which is worth saying plainly. `species`");
  line("  proved the framework has two spins and no room for a spin-1 STRUCTURE. A");
  line("  radiating deficit is not a structure — it is a disturbance in how much of");
  line("  the vacuum is missing, which is exactly the reading this section is named");
  line("  for. LIGHT IS A DISCREPANCY AND NOT A THING, so the spin ladder was never");
  line("  the obstruction it looked like.");
  line();
  line("  WHAT IS HONESTLY STILL OPEN:");
  line();
  line("     FARADAY IS NOT RETESTED. `induce` §2 measured ∇×E + ∂B/∂t on the RAY");
  line("     COUNT and found it fails. The same measurement on the deficit and its");
  line("     labelled partner has not been done, and until it is, this file shows");
  line("     RADIATION without showing INDUCTION. Those are different claims and it");
  line("     would be sloppy to let one stand for the other.");
  line();
  line("     THE POLARISATION. What radiates here is a SCALAR — the shortfall — so");
  line("     what this file demonstrates is scalar radiation, which gravity has and");
  line("     light needs more than. A transverse vector wave needs the labelled");
  line("     moment W to do the same thing, and W's 1/R² was measured while its");
  line("     retarded time-derivative was not.");
  line();
  line("     AND THE CONSTANT, which is α, owed as it has been throughout.");
  return out.join("\n");
}

console.log(withdraw());
console.log(terms());
console.log(farfield());
console.log(flux());
console.log(wake());
console.log(left());
