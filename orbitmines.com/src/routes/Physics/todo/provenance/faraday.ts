/**
 * WHERE THE TURN AXIS COMES FROM — and `magnetic` §5 is wrong, for a reason that
 * turns out to be the same reason there is no Faraday and no photon.
 *
 * `magnetic` §5 sourced the turn axis locally: "a turn needs a plane; a plane needs
 * a second direction; the only local vector the background has is J. So b̂ ∝ J."
 * It supported that with a table showing a static charge gives no B — and THAT
 * TABLE TESTED THE WRONG CONFIGURATION. It used an isotropic excess of one polarity
 * with no drift, which has J = 0 by construction. That is not a static charge.
 *
 * At a field point near a real static charge the background is rays STREAMING
 * OUTWARD, so d̂ = r̂ and J is radial and large. Two things follow and both are bad:
 *
 *     a static charge SOURCES A MAGNETIC AXIS, which it must not; and
 *     E ∝ J and b̂ ∝ J, so E ∥ B EVERYWHERE, which no field has.
 *
 *   §1  the bug, measured on a properly built background rather than argued.
 *
 *   §2  the repairs, and each one is measured and each one fails. b̂ ∝ d̂ × J is a
 *       pseudovector per ray and SUMS TO ZERO over the rays, because Σ n d̂ × J is
 *       J × J. b̂ ∝ J × F — the signed current crossed with the unsigned flux — is
 *       a genuine local pseudovector and gets the geometry right for a NEUTRAL
 *       current, and then gives NOTHING for a single moving charge, because a
 *       one-polarity source has J = σF exactly and parallel vectors have no cross
 *       product.
 *
 *   §3  AND IT IS NOT BAD LUCK. B is axial. Every vector moment of n(d̂,σ) is polar,
 *       because the distribution is a set of directions with weights and nothing in
 *       it distinguishes a hand. Building an axial vector needs TWO independent
 *       polar vectors, the model has exactly two — J and F — and they are parallel
 *       for any source of one polarity. So THE TURN AXIS IS NOT A LOCAL FUNCTION OF
 *       THE RAY DISTRIBUTION, and `magnetic`'s "one cheap assumption" was not cheap,
 *       it was unavailable.
 *
 *   §4  which is the same hole as Faraday and as the photon, and that is the useful
 *       part. All three need b̂ to be a degree of freedom with its own state rather
 *       than a reading of the rays present at a cell. One addition answers three
 *       questions, and it is a real addition and should be priced as one.
 *
 * NONE OF THIS TOUCHES §1–§4 of `magnetic` or any of `relax`: the theorem that no
 * polarity distribution is a magnetic field, the Lorentz force as the antisymmetric
 * part of the turn, the coupling (DEG/3)·sin θ, and the θ-relaxation never used how
 * b̂ is sourced — only that it exists. What is withdrawn is the claim that the model
 * already contained it.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
type V3 = [number, number, number];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => { const n = len(a); return n < 1e-14 ? [0, 0, 0] : scale(a, 1 / n); };
const ang = (a: V3, b: V3) => {
  const la = len(a), lb = len(b);
  if (la < 1e-14 || lb < 1e-14) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (la * lb)))) * 180 / Math.PI;
};

/**
 * A source element: where it is, what sign it emits, and how fast it is going.
 *
 * The background at a field point is built by SUPERPOSITION over elements, with
 * each element's ray arriving along the direction from its RETARDED position and
 * carrying weight 1/R² — the emission's own fall-off, which the gravity arc derived
 * and this file inherits rather than assumes. The retardation is where a source's
 * motion enters the direction a ray arrives from, and it is the only place it can:
 *
 *     d̂ = unit( (P − s) + u·R )        with c̄ = 1
 *
 * which is aberration, to first order in u.
 */
type Emitter = { at: V3; sigma: number; u: V3 };

/** the two vector moments of the arriving rays: the signed current and the unsigned flux */
const moments = (P: V3, src: Emitter[]) => {
  let J: V3 = [0, 0, 0], F: V3 = [0, 0, 0], rho = 0;
  for (const e of src) {
    const sep: V3 = [P[0] - e.at[0], P[1] - e.at[1], P[2] - e.at[2]];
    const R = len(sep);
    if (R < 1e-9) continue;
    const d = unit(add(sep, scale(e.u, R)));       // retarded direction — aberration
    const w = 1 / (R * R);                          // the emission's own fall-off
    J = add(J, scale(d, e.sigma * w));
    F = add(F, scale(d, w));
    rho += e.sigma * w;
  }
  return { J, F, rho };
};

/** a static point charge at the origin */
const staticCharge = (): Emitter[] => [{ at: [0, 0, 0], sigma: +1, u: [0, 0, 0] }];

/** the same charge, moving */
const movingCharge = (u: number): Emitter[] => [{ at: [0, 0, 0], sigma: +1, u: [0, 0, u] }];

/** a neutral line current along z: + drifting one way, − the other, same places */
const lineCurrent = (I: number, half = 4000): Emitter[] => {
  const out: Emitter[] = [];
  for (let z = -half; z <= half; z++) {
    out.push({ at: [0, 0, z], sigma: +1, u: [0, 0, +I] });
    out.push({ at: [0, 0, z], sigma: -1, u: [0, 0, -I] });
  }
  return out;
};

// ─── §1 the bug ─────────────────────────────────────────────────────────────
function bug(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  `magnetic` §5 TESTED THE WRONG CONFIGURATION ═════");
  line();
  line("  That section concluded a static charge sources no magnetic axis, on the");
  line("  strength of a background with an isotropic excess of one polarity and NO");
  line("  DRIFT — which has J = 0 because J is a first moment. That is not a static");
  line("  charge. It is a charge density with no field.");
  line();
  line("  Build the real thing: rays streaming outward from a point, arriving along");
  line("  d̂ = r̂ with weight 1/R². Then J is radial and large.");
  line();
  line(`  ${pad("field point", 16)} ${pad("|J| (= E)", 12)} ${pad("∠(J, r̂)", 10)} ${pad("b̂ ∝ J", 14)} ${pad("∠(E, B)", 10)}`);
  line("  " + "─".repeat(68));
  for (const r of [5, 10, 20]) {
    const P: V3 = [r, 0, 0];
    const { J } = moments(P, staticCharge());
    line(`  ${pad(`[${r},0,0]`, 16)} ${pad(len(J).toExponential(3), 12)} ${pad(ang(J, [1, 0, 0]).toFixed(2) + "°", 10)} ${pad(len(J) > 1e-12 ? "NON-ZERO" : "zero", 14)} ${pad(ang(J, J).toFixed(2) + "°", 10)}`);
  }
  line();
  line("  SO A STATIC CHARGE SOURCES A MAGNETIC AXIS UNDER THAT RULE, and it points");
  line("  radially, which would be a monopole field — the very thing `magnetic` §4");
  line("  congratulates itself on forbidding.");
  line();
  line("  AND THE SECOND CONSEQUENCE IS WORSE BECAUSE IT IS GENERAL. The electric");
  line("  force is qJ and the axis is b̂ ∝ J, so E and B are the SAME VECTOR up to a");
  line("  constant — parallel everywhere, in every configuration, necessarily. No");
  line("  field in nature is like that: a static charge has E and no B, a wave has");
  line("  them perpendicular. The angle above is 0.00° by construction and that is");
  line("  the refutation, not a measurement that happened to come out badly.");
  return out.join("\n");
}

// ─── §2 the repairs, each measured, each failing ────────────────────────────
function repairs(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  TWO REPAIRS, AND NEITHER SURVIVES ═════");
  line();
  line("  CANDIDATE A: b̂ ∝ d̂ × J, per ray. A turn needs a PLANE, and the plane");
  line("  spanned by the incoming heading and J is degenerate exactly when they are");
  line("  parallel — which is the static-charge case. That is the right instinct.");
  line();
  line("  It fails on summation. The force sums the turn over all arriving rays, and");
  line("  the axis enters linearly, so what acts is Σ n(d̂) (d̂ × J) = (Σ n d̂) × J:");
  line();
  const P: V3 = [10, 0, 0];
  for (const [name, src] of [
    ["static charge", staticCharge()], ["moving charge, u = 0.3", movingCharge(0.3)],
    ["neutral line current", lineCurrent(0.3, 2000)],
  ] as [string, Emitter[]][]) {
    const { J, F } = moments(P, src);
    const summed = cross(F, J);                    // Σ n d̂ × J  =  F × J
    line(`  ${pad(name, 26)} |Σ n d̂ × J| = ${summed.map(x => x.toExponential(2)).join(", ")}`);
  }
  line();
  line("  For a ONE-POLARITY source that is J × J and vanishes identically, since");
  line("  every ray carries the same sign so F and J are the same vector. So");
  line("  candidate A gives no magnetic force for a single charge however it moves.");
  line();
  line("  CANDIDATE B: b̂ ∝ J × F, the signed current crossed with the unsigned flux.");
  line("  This is a genuine local pseudovector — two independent polar vectors, one");
  line("  counting rays with their sign and one counting them without — and it gets");
  line("  the geometry of a wire exactly right:");
  line();
  line(`  ${pad("source", 26)} ${pad("∠(J,F)", 9)} ${pad("|J×F|", 12)} ${pad("∠(b̂, ẑ)", 10)} ${pad("∠(b̂, r̂)", 10)} verdict`);
  line("  " + "─".repeat(80));
  for (const [name, src] of [
    ["static charge", staticCharge()],
    ["moving charge, u = 0.3", movingCharge(0.3)],
    ["moving charge, u = 0.9", movingCharge(0.9)],
    ["neutral line current", lineCurrent(0.3, 2000)],
  ] as [string, Emitter[]][]) {
    const { J, F } = moments(P, src);
    const b = cross(J, F);
    const ok = len(b) > 1e-14;
    line(`  ${pad(name, 26)} ${pad(ang(J, F).toFixed(4) + "°", 9)} ${pad(len(b).toExponential(2), 12)} ${pad(ok ? ang(b, [0, 0, 1]).toFixed(2) + "°" : "—", 10)} ${pad(ok ? ang(b, [1, 0, 0]).toFixed(2) + "°" : "—", 10)} ${ok ? "a field" : "NOTHING"}`);
  }
  line();
  line("  READ THE LINE CURRENT ROW FIRST, BECAUSE IT WORKS. b̂ comes out at 90° to");
  line("  the current and 90° to the displacement, which is Biot–Savart's geometry,");
  line("  and it is perpendicular to J and so to E. For a wire, candidate B is right.");
  line();
  line("  AND THEN THE MOVING CHARGE ROWS KILL IT. A single charge emits ONE polarity,");
  line("  so every arriving ray carries the same sign and J = σF EXACTLY — the angle");
  line("  between them is zero at every speed, and parallel vectors have no cross");
  line("  product. So candidate B gives a moving charge NO MAGNETIC FIELD AT ALL.");
  line();
  line("  That is not a small deviation to be attributed to discreteness. A moving");
  line("  charge's magnetic field is the most elementary magnetic fact there is, it");
  line("  is what a wire's field is MADE of, and a rule that gives a wire a field");
  line("  while giving each of its carriers none is not a rule, it is an accident of");
  line("  the wire being neutral.");
  return out.join("\n");
}

// ─── §3 and it is structural ────────────────────────────────────────────────
/** reflect through the plane with unit normal m̂ — an improper transformation */
const reflect = (v: V3, m: V3): V3 => add(v, scale(m, -2 * dot(v, m)));

function structural(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  AND IT IS STRUCTURAL, NOT BAD LUCK ═════");
  line();
  line("  Both candidates failed in the same place, so the question is whether ANY");
  line("  local rule can work. It cannot, and the argument is about parity.");
  line();
  line("  A magnetic field is AXIAL — `magnetic` §4 derived that rather than assuming");
  line("  it, because b̂ is a rotation axis and reflecting space reverses a rotation");
  line("  sense. The local state n(d̂,σ) is a set of directions with weights, and");
  line("  under a reflection R every one of its moments transforms as a POLAR tensor,");
  line("  because the directions simply map to their reflections. Measured:");
  line();
  const m = unit([1, 1, 0]);
  const P: V3 = [10, 0, 3];
  const src = lineCurrent(0.3, 2000);
  const { J, F } = moments(P, src);
  // the same physical configuration, reflected
  const srcR: Emitter[] = src.map(e => ({ at: reflect(e.at, m), sigma: e.sigma, u: reflect(e.u, m) }));
  const mR = moments(reflect(P, m), srcR);
  line(`  ${pad("quantity", 22)} ${pad("|reflected − R·original|", 26)} ${pad("|reflected + R·original|", 26)} kind`);
  line("  " + "─".repeat(88));
  const report = (name: string, orig: V3, refl: V3) => {
    const Ro = reflect(orig, m);
    const polar = len(add(refl, scale(Ro, -1))), axial = len(add(refl, Ro));
    line(`  ${pad(name, 22)} ${pad(polar.toExponential(2), 26)} ${pad(axial.toExponential(2), 26)} ${polar < axial ? "POLAR" : "axial"}`);
  };
  report("J, signed current", J, mR.J);
  report("F, unsigned flux", F, mR.F);
  report("J × F", cross(J, F), cross(mR.J, mR.F));
  line();
  line("  J AND F ARE POLAR AND THEIR CROSS PRODUCT IS AXIAL, which is the ordinary");
  line("  arithmetic of vectors and is why candidate B was worth trying. The model");
  line("  therefore CAN build a pseudovector locally — the trouble is not parity by");
  line("  itself.");
  line();
  line("  THE TROUBLE IS THAT THERE ARE ONLY TWO SUCH VECTORS AND THEY COINCIDE. The");
  line("  ray distribution offers a scalar ρ, two vectors J and F, and symmetric");
  line("  tensors above them. A pseudovector needs two INDEPENDENT vectors, so J × F");
  line("  is the only candidate there is — and J and F differ only where the arriving");
  line("  rays carry MORE THAN ONE SIGN. Emission from a single charge is one sign by");
  line("  construction. So:");
  line();
  line("     the ONLY local pseudovector the model has vanishes for exactly the");
  line("     sources that most obviously have magnetic fields.");
  line();
  line("  SO THE TURN AXIS IS NOT A LOCAL FUNCTION OF THE RAYS PRESENT AT A CELL, and");
  line("  `magnetic` §5's assumption is withdrawn. It was presented there as cheap —");
  line("  \"an argument the rules have always required and have never filled in\" — and");
  line("  it is not cheap, because the argument cannot be filled in from what a cell");
  line("  holds. THAT IS A PRICE RISE AND IT SHOULD BE RECORDED AS ONE.");
  return out.join("\n");
}

// ─── §4 which is the same hole three times ──────────────────────────────────
function hole(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  AND IT IS THE SAME HOLE AS FARADAY, AND AS THE PHOTON ═════");
  line();
  line("  Three things were open and they are now one thing.");
  line();
  line(`  ${pad("what was owed", 26)} what it needs`);
  line("  " + "─".repeat(74));
  line(`  ${pad("the turn axis, sourced", 26)} b̂ from something other than the local rays`);
  line(`  ${pad("Faraday, ∇×E = −∂B/∂t", 26)} b̂ with a TIME DERIVATIVE of its own`);
  line(`  ${pad("the photon", 26)} b̂ with independent degrees of freedom to wave`);
  line();
  line("  ALL THREE ARE THE SAME REQUEST: that b̂ be state the lattice CARRIES rather");
  line("  than a number a cell COMPUTES. `magnetic` §5 tried to have it for free by");
  line("  reading it off the rays, and §3 above shows that cannot be done. Given it");
  line("  as state, all three follow at once — a stored axis can be sourced by a");
  line("  curl rather than pointwise, can have a time derivative, and can carry the");
  line("  two transverse components a wave needs.");
  line();
  line("  WHAT THAT COSTS, PRICED HONESTLY. It is a new field on the lattice: three");
  line("  numbers per cell that are not moments of n(d̂,σ), plus a rule saying how");
  line("  they evolve. That is a bigger addition than anything else in this book —");
  line("  the gravity arc added no state at all, and Layer 2 added a structure rather");
  line("  than a field. It should not be smuggled in as an argument to turnRing.");
  line();
  line("  AND THERE IS A CHEAPER ALTERNATIVE THAT IS NOT RULED OUT, worth naming so");
  line("  the choice is visible. §3's obstruction is that J and F coincide for a");
  line("  one-sign source. That is a fact about rays carrying ONLY a polarity and a");
  line("  heading. IF A RAY CARRIED ONE MORE LABEL — the Layer-2 strand arc's");
  line("  azimuth on the equatorial ring is exactly such a label, and is already");
  line("  proposed in this book for other reasons — then a third vector moment");
  line("  exists, and a pseudovector can be built from a single charge's emission.");
  line();
  line("  WHICH IS WHY THE TWO LAYER-2 READINGS SHOULD NOT BE MERGED YET. The ribbon");
  line("  reading has no room for such a label; the strand reading is made of one.");
  line("  The question of what sources the turn axis is the FIRST TEST that");
  line("  distinguishes them on a physical question rather than on taste, and it is");
  line("  not answered here.");
  return out.join("\n");
}

console.log(bug());
console.log(repairs());
console.log(structural());
console.log(hole());
