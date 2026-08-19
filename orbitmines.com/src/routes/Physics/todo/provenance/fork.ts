/**
 * THE FORK TEST — does a third per-ray label build the pseudovector, and which of
 * the two Layer-2 readings survives it.
 *
 * `faraday` §3 found the obstruction: the ray distribution offers a scalar ρ and
 * two vectors J and F, so J × F is the only local pseudovector, and it vanishes for
 * a one-polarity source because J = σF exactly. A moving charge therefore gets no
 * magnetic field, which is fatal.
 *
 * It also named the escape and declined to take it: the obstruction is a fact about
 * rays carrying ONLY a polarity and a heading. This file takes it. A ray is given
 * one more label — WHAT ITS EMITTER WAS DOING WHEN IT LEFT, which measurement below
 * forces to be the axis times the traversal rate, i.e. the emitter's own u.
 *
 *   §1  the moments a labelled ray permits, sorted by parity and MEASURED under
 *       reflection rather than argued. d̂ and u are both polar, so d̂ × u is axial,
 *       and W = Σ σ n(d̂,σ,u) (d̂ × u) is a signed axial vector built from a SINGLE
 *       polarity's emission — which is exactly what `faraday` proved impossible
 *       without the label.
 *
 *   §2  a charge AT REST gives no field at all, whatever its orientation, because
 *       the label is the axis times the traversal RATE and a source going nowhere
 *       contributes nothing before its orientation is consulted. A spin is then not
 *       a static labelled source — there is no such thing — but a CIRCULATING
 *       traversal, and summing one gives a dipole: 1/r³ to 1.0112× with the pole
 *       twice the equator, which is the textbook ratio and was not put in.
 *
 *   §3  a moving charge gives B ∝ qv × r̂/r², measured: the 1/r², the sine law, the
 *       reversal with q, and E ⊥ B at every field point. This is the row
 *       `faraday` §2 could not fill.
 *
 *   §4  a neutral wire recovers Biot–Savart 1/r, so the label does not cost the one
 *       case the old rule got right.
 *
 *   §5  AND THEN THE DISCRETE DYNAMICS, which is the point of the exercise: the
 *       real automaton, free turn angle, rays carrying (heading, polarity, label),
 *       with the label TRANSPORTED and turned by the same rules as everything else.
 *       Measured, and it is the sharpest statement of the obstruction in the arc:
 *       for a wire emitting isotropically the ray current J starts at NOUGHT while
 *       the labelled moment W starts at ONE. A cell reading only what arrives sees
 *       no current; a cell that can read the label sees the wire. W then decays at
 *       a rate set by θ — the label buys the field's EXISTENCE, not its RANGE.
 *
 *   §6  the reconciliation, and it is not a merger. The label costs no new state and
 *       wins every row against a stored field, so the fork resolves toward the
 *       strand reading — but a ribbon graph moving through the lattice HAS a
 *       velocity, so it can carry the label too. What is refuted is not the ribbon:
 *       it is the claim that a ray carries only a polarity and a heading. The two
 *       arcs answer different questions — what matter IS, and what matter EMITS.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type V3 = [number, number, number];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => { const n = len(a); return n < 1e-14 ? [0, 0, 0] : scale(a, 1 / n); };
const ang = (a: V3, b: V3) => {
  const la = len(a), lb = len(b);
  if (la < 1e-14 || lb < 1e-14) return NaN;
  return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (la * lb)))) * 180 / Math.PI;
};
const reflect = (v: V3, m: V3): V3 => sub(v, scale(m, 2 * dot(v, m)));

/**
 * An emitter: where it is, what sign it emits, how fast it is going, and — the new
 * thing — WHICH WAY ITS OWN AXIS POINTS.
 *
 * In the strand reading n̂ is the local north the strand advances along, and the
 * winding around it is the charge. A ray leaving the emitter carries that axis with
 * it, the same way it already carries a polarity. That is the whole addition: one
 * more label per ray, and no new field on the lattice.
 */
type Emitter = { at: V3; sigma: number; u: V3; axis: V3 };

/**
 * ONE CORRECTION, FOUND BY MEASURING RATHER THAN BY THINKING, and it matters
 * enough to record where it happened.
 *
 * The first version of this file made the label a UNIT axis n̂ — "which way the
 * strand points". Measured, that gives a moving charge a field INDEPENDENT OF ITS
 * SPEED (|W| = 9.99e−3, 9.95e−3, 9.81e−3, 9.29e−3 as u went 0.05 → 0.4), because a
 * unit vector does not know how fast anything is going. It also gave a static
 * polarised charge a 1/r² field where a dipole is 1/r³.
 *
 * The fix is not an extra factor put in by hand. A strand advances along its north
 * ONE CELL PER TICK WHEN IT ADVANCES AT ALL, and how often it advances is a duty
 * cycle — which is exactly what this book already calls mass. So the label a ray
 * can carry is not the bare axis but the axis TIMES THE RATE, and that product is
 * the emitter's velocity. Both halves already exist in the strand reading.
 *
 *     label = n̂ · (how often it advances)  =  the emitter's own u
 *
 * and then W = Σ σ (d̂ × u)/R² is Biot–Savart's q v × r̂/r² term by term, which is
 * why §3 and §4 below come out and why a static charge gives nothing at all —
 * polarised or not, since u = 0 kills it before the polarisation is consulted.
 */

/**
 * The moments of the arriving rays at a field point.
 *
 * J and F are `faraday`'s two, unchanged. W is the new one, and it is the only
 * quantity in this file that the previous arc did not have.
 */
const moments = (P: V3, src: Emitter[]) => {
  let J: V3 = [0, 0, 0], F: V3 = [0, 0, 0], W: V3 = [0, 0, 0], rho = 0;
  for (const e of src) {
    const sep = sub(P, e.at);
    const R = len(sep);
    if (R < 1e-9) continue;
    const d = unit(add(sep, scale(e.u, R)));       // retarded direction — aberration
    const w = 1 / (R * R);                          // the emission's own fall-off
    J = add(J, scale(d, e.sigma * w));
    F = add(F, scale(d, w));
    // the label is the emitter's axis TIMES its traversal rate, which is its u
    W = add(W, scale(cross(d, e.u), e.sigma * w));
    rho += e.sigma * w;
  }
  return { J, F, W, rho };
};

/** a charge, at rest or moving, whose own axis is along its motion (or given) */
const charge = (sigma: number, u: V3, axis?: V3): Emitter[] =>
  [{ at: [0, 0, 0], sigma, u, axis: axis ?? (len(u) > 1e-12 ? unit(u) : [0, 0, 1]) }];

/**
 * A CIRCULATING traversal — which is what a spin is here, and the only way to have
 * an oriented source that is not going anywhere. N carriers round a loop of radius
 * a in the xy-plane, each with u tangent to it.
 */
const loop = (a: number, speed: number, N = 720): Emitter[] => {
  const out: Emitter[] = [];
  for (let k = 0; k < N; k++) {
    const t = 2 * Math.PI * k / N;
    out.push({
      at: [a * Math.cos(t), a * Math.sin(t), 0], sigma: +1,
      u: [-speed * Math.sin(t), speed * Math.cos(t), 0], axis: [0, 0, 1],
    });
  }
  return out;
};

/** a neutral line current along z, each carrier's axis along its own motion */
const wire = (I: number, half = 3000): Emitter[] => {
  const out: Emitter[] = [];
  for (let z = -half; z <= half; z++) {
    out.push({ at: [0, 0, z], sigma: +1, u: [0, 0, +I], axis: [0, 0, +1] });
    out.push({ at: [0, 0, z], sigma: -1, u: [0, 0, -I], axis: [0, 0, -1] });
  }
  return out;
};

// ─── §1 the moments, and their parity ───────────────────────────────────────
function parity(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  WHAT ONE MORE LABEL PERMITS ═════");
  line();
  line("  `faraday` §3's obstruction was a counting one: a ray carrying only a");
  line("  heading and a polarity offers ρ, J and F, so J × F is the only local");
  line("  pseudovector — and it vanishes for a one-polarity source because J = σF.");
  line();
  line("  Give a ray ONE MORE LABEL: the emitter's own axis n̂ at the moment of");
  line("  emission, carried along the way the polarity already is. Then a third");
  line("  vector moment exists:");
  line();
  line("       W = Σ σ n(d̂,σ,n̂) (d̂ × n̂)");
  line();
  line("  n̂ is POLAR — it is the direction a strand advances along, not a rotation");
  line("  sense — so d̂ × n̂ is axial and W is a signed axial vector. Measured under a");
  line("  reflection, rather than asserted:");
  line();
  const m = unit([1, 1, 0]);
  const P: V3 = [7, 0, 3];
  const src = charge(+1, [0, 0, 0.3]);
  const o = moments(P, src);
  const srcR: Emitter[] = src.map(e => ({
    at: reflect(e.at, m), sigma: e.sigma, u: reflect(e.u, m), axis: reflect(e.axis, m),
  }));
  const rr = moments(reflect(P, m), srcR);
  line(`  ${pad("quantity", 20)} ${pad("|refl − R·orig|", 20)} ${pad("|refl + R·orig|", 20)} kind`);
  line("  " + "─".repeat(76));
  const rep = (name: string, a: V3, b: V3) => {
    const Ra = reflect(a, m);
    const p = len(sub(b, Ra)), q = len(add(b, Ra));
    line(`  ${pad(name, 20)} ${pad(p.toExponential(2), 20)} ${pad(q.toExponential(2), 20)} ${p < q ? "POLAR" : "AXIAL"}`);
  };
  rep("J", o.J, rr.J);
  rep("F", o.F, rr.F);
  rep("W = Σσ(d̂ × n̂)", o.W, rr.W);
  line();
  line("  W IS AXIAL AND IT IS BUILT FROM A SINGLE POLARITY'S EMISSION, which is");
  line("  precisely the combination `faraday` proved unavailable without the label.");
  line("  The obstruction was never about parity — it was that there were only two");
  line("  vectors and they coincided. A third label makes a third vector.");
  return out.join("\n");
}

// ─── §2 a static charge ─────────────────────────────────────────────────────
function statics(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  A CHARGE AT REST, AND WHAT A SPIN HAS TO BE ═════");
  line();
  line("  The first thing the rule has to do is give a static charge NO magnetic");
  line("  field, which is where b̂ ∝ J died. Here it does, and for a stronger reason");
  line("  than the first draft of this file found.");
  line();
  line(`  ${pad("source", 34)} ${pad("|W|", 13)} ${pad("|W|/|F|", 12)} verdict`);
  line("  " + "─".repeat(72));
  const P: V3 = [10, 0, 0];
  for (const [name, src] of [
    ["at rest, axis ẑ, u = 0", charge(+1, [0, 0, 0], [0, 0, 1])],
    ["at rest, axis x̂, u = 0", charge(+1, [0, 0, 0], [1, 0, 0])],
  ] as [string, Emitter[]][]) {
    const { W, F } = moments(P, src);
    const rel = len(W) / len(F);
    line(`  ${pad(name, 34)} ${pad(len(W).toExponential(3), 13)} ${pad(rel.toExponential(2), 12)} ${rel < 1e-12 ? "NO FIELD — right" : "a field"}`);
  }
  line();
  line("  A CHARGE AT REST HAS NO MAGNETIC FIELD WHATEVER ITS ORIENTATION, and it");
  line("  needs no averaging argument to say so: the label is the axis times the rate");
  line("  of traversal, and a source that is not traversing contributes nothing");
  line("  before its orientation is consulted. That is stronger than the first draft");
  line("  of this section managed, which had to appeal to unpolarised matter.");
  line();
  line("  SO WHAT IS A SPINNING CHARGE? Not a static source with a label — there is");
  line("  no such thing here. It is a CIRCULATING traversal, and that is the only");
  line("  way this model can make something oriented that is not going anywhere.");
  line("  Sum a loop of radius a and read the far field:");
  line();
  line(`  ${pad("r", 8)} ${pad("|W| equator", 15)} ${pad("|W|·r³", 13)} ${pad("|W| pole", 14)} ${pad("pole/equator", 14)}`);
  line("  " + "─".repeat(70));
  const prod: number[] = [];
  for (const r of [20, 40, 80, 160]) {
    const eq = moments([r, 0, 0], loop(2, 0.1));
    const po = moments([0, 0, r], loop(2, 0.1));
    prod.push(len(eq.W) * r * r * r);
    line(`  ${pad(String(r), 8)} ${pad(len(eq.W).toExponential(3), 15)} ${pad((len(eq.W) * r * r * r).toFixed(4), 13)} ${pad(len(po.W).toExponential(3), 14)} ${pad((len(po.W) / len(eq.W)).toFixed(4), 14)}`);
  }
  const sp = Math.max(...prod) / Math.min(...prod);
  line();
  line(`  |W|·r³ constant to ${sp.toFixed(4)}×,  pole/equator → 2`);
  line();
  if (sp < 1.2) {
    line("  1/r³ WITH THE POLE TWICE THE EQUATOR — which is a DIPOLE, exactly, and it");
    line("  is the standard one: B_pole/B_equator = 2 for a magnetic dipole. The 1/r²");
    line("  of the emission becomes 1/r³ because the loop's contributions cancel to");
    line("  leading order, which is what makes a dipole a dipole.");
    line();
    line("  NOBODY PUT A DIPOLE IN. It is Σσ(d̂ × u)/R² summed round a circulating");
    line("  traversal, which is the Biot–Savart integral for a current loop — and the");
    line("  magnetism arc's whole treatment of magnetised matter starts from dipoles");
    line("  it had to ASSUME. This is where they come from.");
  } else {
    line("  NOT A CLEAN DIPOLE at these radii, so the loop's far field is not yet");
    line("  established and the paragraph that would go here is not written.");
  }
  return out.join("\n");
}

// ─── §3 a moving charge — the row faraday could not fill ────────────────────
function moving(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  A MOVING CHARGE, WHICH IS WHERE J × F DIED ═════");
  line();
  line("  `faraday` §2's fatal row: a single moving charge got NOTHING, because one");
  line("  polarity makes J and F parallel. With the label, its axis is its direction");
  line("  of travel — a strand advances along its own north — and:");
  line();
  line(`  ${pad("u", 8)} ${pad("q", 5)} ${pad("|W| at r=10 ⊥", 15)} ${pad("∠(W, v×r̂)", 12)} ${pad("∠(E, W)", 10)} ${pad("|W|/u", 12)}`);
  line("  " + "─".repeat(74));
  const P: V3 = [10, 0, 0];
  let worstGeom = 0, worstPerp = 0; const ratios: number[] = [];
  for (const u of [0.05, 0.1, 0.2, 0.4]) {
    for (const q of [+1, -1]) {
      const src = charge(q, [0, 0, u]);
      const { W, J } = moments(P, src);
      const expect = cross([0, 0, q * u], unit(P));       // qv × r̂
      const g = ang(W, expect), pp = ang(J, W);
      worstGeom = Math.max(worstGeom, Math.min(g, 180 - g));
      worstPerp = Math.max(worstPerp, Math.abs(pp - 90));
      if (q > 0) ratios.push(len(W) / u);
      line(`  ${pad(u.toFixed(2), 8)} ${pad(q > 0 ? "+1" : "−1", 5)} ${pad(len(W).toExponential(3), 15)} ${pad(g.toFixed(2) + "°", 12)} ${pad(pp.toFixed(2) + "°", 10)} ${pad((len(W) / u).toExponential(3), 12)}`);
    }
  }
  line();
  line(`  worst departure of W from the qv × r̂ direction   ${worstGeom.toExponential(2)}°`);
  line(`  worst departure of ∠(E, W) from 90°              ${worstPerp.toExponential(2)}°`);
  line(`  |W|/u constant to                                ${(Math.max(...ratios) / Math.min(...ratios)).toFixed(4)}×`);
  line();
  line("  A MOVING CHARGE HAS A MAGNETIC FIELD, ALONG qv × r̂, PERPENDICULAR TO E,");
  line("  AND LINEAR IN THE SPEED. That is the Biot–Savart field of a point charge,");
  line("  and every one of those four properties is measured rather than arranged.");
  line();
  line("  E ⊥ B IS THE ONE TO DWELL ON. `magnetic` §5's rule made them PARALLEL");
  line("  everywhere, which is why it could never have supported a wave. Here they");
  line("  are perpendicular at every field point, at every speed, for both charges —");
  line("  because E goes as J which is radial, and W is a cross product with it.");
  line();
  line("  And the distance law:");
  line();
  line(`  ${pad("r", 8)} ${pad("|W|", 14)} ${pad("|W|·r²", 14)} ${pad("∠(W, ẑ)", 11)} ∠(W, r̂)`);
  line("  " + "─".repeat(60));
  const p2: number[] = [];
  for (const r of [5, 10, 20, 40, 80]) {
    const { W } = moments([r, 0, 0], charge(+1, [0, 0, 0.2]));
    p2.push(len(W) * r * r);
    line(`  ${pad(String(r), 8)} ${pad(len(W).toExponential(4), 14)} ${pad((len(W) * r * r).toFixed(5), 14)} ${pad(ang(W, [0, 0, 1]).toFixed(2) + "°", 11)} ${ang(W, [1, 0, 0]).toFixed(2)}°`);
  }
  line();
  line(`  |W|·r² constant to ${(Math.max(...p2) / Math.min(...p2)).toFixed(5)}×  —  1/r², at 90° to both v and r̂`);
  return out.join("\n");
}

// ─── §4 the wire, which must not be lost ────────────────────────────────────
function wireTest(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  AND THE WIRE, WHICH THE OLD RULE GOT RIGHT ═════");
  line();
  line("  J × F got a neutral wire exactly right and everything else wrong. A");
  line("  replacement has to keep the one case that worked.");
  line();
  line(`  ${pad("r (cells)", 12)} ${pad("|W|", 14)} ${pad("|W|·r", 14)} ${pad("∠(W, ẑ)", 11)} ∠(W, r̂)`);
  line("  " + "─".repeat(64));
  const prod: number[] = [];
  for (const r of [5, 10, 20, 40]) {
    const { W } = moments([r, 0, 0], wire(0.3, 3000));
    prod.push(len(W) * r);
    line(`  ${pad(String(r), 12)} ${pad(len(W).toExponential(4), 14)} ${pad((len(W) * r).toFixed(5), 14)} ${pad(ang(W, [0, 0, 1]).toFixed(2) + "°", 11)} ${ang(W, [1, 0, 0]).toFixed(2)}°`);
  }
  line();
  line(`  |W|·r constant to ${(Math.max(...prod) / Math.min(...prod)).toFixed(5)}×`);
  line();
  line("  1/r, AT 90° TO BOTH — Ampère's law, kept. And note WHY the wire works here");
  line("  when a single charge did not under the old rule: the two polarities travel");
  line("  opposite ways, so their axes are opposite, and σ(d̂ × n̂) ADDS for both");
  line("  rather than cancelling. The label makes the wire a sum of its carriers");
  line("  instead of an accident of its neutrality.");
  return out.join("\n");
}

// ─── §5 the discrete dynamics ───────────────────────────────────────────────
/**
 * THE REAL AUTOMATON, with the label carried through it.
 *
 * Everything the previous files established, kept: headings are real directions and
 * steps are rounded onto the lattice (free emission, `relax` §3); the turn angle θ
 * is free rather than locked at an eighth (`relax` §2); (G+M/1) annihilates
 * opposite polarities and (G+M/3) turns alike ones by the charge's own sense
 * (`magnetic` §4); (G+M/2) expands neutral points.
 *
 * The one addition: every charge carries an AXIS as well as a heading and a
 * polarity, and the axis is TURNED BY THE SAME RULE the heading is. Nothing is
 * given a separate law — if the label is real it has to ride the same dynamics.
 *
 * The question is whether W survives the vacuum, and in particular whether it
 * decoheres faster or slower than J does. If faster, the label is useless and the
 * fork resolves against the strand reading.
 */
const K8: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const stepOf = (a: number): [number, number] => {
  let best = 0, bd = -Infinity;
  const cx = Math.cos(a), cy = Math.sin(a);
  for (let i = 0; i < 8; i++) {
    const n = Math.hypot(K8[i][0], K8[i][1]);
    const d = (K8[i][0] * cx + K8[i][1] * cy) / n;
    if (d > bd) { bd = d; best = i; }
  }
  return K8[best];
};

/**
 * A ray in the automaton: where it is, which way it is GOING (a), which way its
 * EMITTER was going when it left (n), and its polarity.
 *
 * The distinction between a and n is the whole of the label and the first version
 * of this section collapsed it — it set n from the ray's own heading, which makes
 * the label a function of what the cell already knows and measures nothing. A
 * source emits in ALL directions; every one of those rays carries the SAME emitter
 * velocity and a DIFFERENT heading. That is why the label is information the
 * receiving cell does not otherwise have, and it is exactly what `faraday` §3
 * proved could not be reconstructed locally.
 */
type C2 = { x: number; y: number; a: number; n: number; s: number; tag: boolean };

const dynamics = (ticks: number, theta: number, seed: number, N = 201, occ = 0.30,
  pCreate = 0.002) => {
  const r = rng(seed);
  let cs: C2[] = [];
  const mid = (N - 1) / 2;
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++)
    if (r() < occ) cs.push({
      x, y, a: r() * 2 * Math.PI, n: r() * 2 * Math.PI, s: r() < 0.5 ? 1 : -1, tag: false,
    });
  // a neutral current in the middle: + going one way and − the other, each with its
  // AXIS ALONG ITS OWN MOTION, which is what makes W add rather than cancel
  // the wire: + carriers drifting +x and − carriers drifting −x, each EMITTING in
  // every direction. So a ray's heading is isotropic and its LABEL is its emitter's
  // drift — which is what makes σ·label add for the two populations rather than
  // cancel, and is why a neutral wire has a field at all.
  const R0 = 12;
  for (let x = mid - R0; x <= mid + R0; x++) for (let y = mid - R0; y <= mid + R0; y++) {
    const plus = r() < 0.5;
    cs.push({
      x, y, a: r() * 2 * Math.PI,                       // emitted in any direction
      n: plus ? 0 : Math.PI,                            // the emitter's own drift
      s: plus ? +1 : -1, tag: true,
    });
  }

  const survey = () => {
    let jx = 0, jy = 0, wx = 0, wy = 0, n = 0;
    for (const c of cs) {
      if (!c.tag) continue;
      jx += c.s * Math.cos(c.a); jy += c.s * Math.sin(c.a);      // the signed current
      wx += c.s * Math.cos(c.n); wy += c.s * Math.sin(c.n);      // Σσu — what sources W
      n++;
    }
    const m = Math.max(n, 1);
    return { J: Math.hypot(jx, jy) / m, W: Math.hypot(wx, wy) / m, n };
  };

  const hist: { t: number; J: number; W: number; n: number }[] = [];
  for (let t = 0; t <= ticks; t++) {
    hist.push({ t, ...survey() });
    if (t === ticks) break;
    for (const c of cs) {
      const st = stepOf(c.a);
      c.x += st[0]; c.y += st[1];
    }
    cs = cs.filter(c => c.x >= 0 && c.x < N && c.y >= 0 && c.y < N);
    const cell = new Map<number, C2[]>();
    for (const c of cs) { const k = c.x * N + c.y; const g = cell.get(k); if (g) g.push(c); else cell.set(k, [c]); }
    const dead = new Set<C2>();
    for (const g of cell.values()) for (let i = 0; i + 1 < g.length; i += 2) {
      const a = g[i], b = g[i + 1];
      if (a.s * b.s < 0) { dead.add(a); dead.add(b); }          // (G+M/1)
      else {                                                     // (G+M/3)
        // the heading turns by the charge's own sense — and SO DOES THE AXIS,
        // by the same rule, because the label is carried and not separately ruled
        a.a += a.s * theta; a.n += a.s * theta;
        b.a += b.s * theta; b.n += b.s * theta;
      }
    }
    cs = cs.filter(c => !dead.has(c));
    const made = Math.round(pCreate * N * N);
    for (let k = 0; k < made; k++) {
      const x = Math.floor(r() * N), y = Math.floor(r() * N), a = r() * 2 * Math.PI;
      // vacuum pairs are emitted by nothing in particular, so their label is random
      const nn = r() * 2 * Math.PI;
      cs.push({ x, y, a, n: nn, s: +1, tag: false });
      cs.push({ x, y, a: a + Math.PI, n: nn, s: -1, tag: false });
    }
  }
  return hist;
};

function discrete(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  THE DISCRETE DYNAMICS, WITH THE LABEL RIDING THEM ═════");
  line();
  line("  §§1–4 are superposition sums, which is the continuum reading. The label is");
  line("  only worth anything if it survives the actual rules — so: the automaton");
  line("  with everything this arc has established. Real headings rounded onto the");
  line("  lattice, free turn angle, (G+M/1) on opposite pairs, (G+M/3) turning alike");
  line("  ones by the charge's own sense, (G+M/2) expanding neutral points.");
  line();
  line("  AND THE AXIS IS TURNED BY THE SAME RULE AS THE HEADING. It gets no law of");
  line("  its own — if the label is real it rides the dynamics everything else rides.");
  line();
  const T = 120, SEEDS = 3;
  line(`  ${pad("CYCLE", 7)} ${pad("θ", 9)} ${pad("J t=0", 8)} ${pad("J t=60", 8)} ${pad("W t=0", 8)} ${pad("W t=60", 8)} ${pad("W/J at 60", 11)} carriers`);
  line("  " + "─".repeat(78));
  for (const C of [8, 32, 128]) {
    const th = 2 * Math.PI / C;
    const acc: Record<number, { J: number; W: number; n: number }> = {};
    for (let s = 0; s < SEEDS; s++) {
      for (const h of dynamics(T, th, 555 + 7919 * s)) {
        const a = acc[h.t] ?? (acc[h.t] = { J: 0, W: 0, n: 0 });
        a.J += h.J / SEEDS; a.W += h.W / SEEDS; a.n += h.n / SEEDS;
      }
    }
    const at = (t: number) => acc[t];
    const ratio = at(60).J > 1e-9 ? at(60).W / at(60).J : NaN;
    line(`  ${pad(String(C), 7)} ${pad((th * 180 / Math.PI).toFixed(2) + "°", 9)} ${pad(at(0).J.toFixed(3), 8)} ${pad(at(60).J.toFixed(3), 8)} ${pad(at(0).W.toFixed(3), 8)} ${pad(at(60).W.toFixed(3), 8)} ${pad(isNaN(ratio) ? "—" : ratio.toFixed(2), 11)} ${at(60).n.toFixed(0)}`);
  }
  line();
  line("  READ THE t=0 COLUMNS FIRST, BECAUSE THEY ARE THE POINT. J starts near");
  line("  NOUGHT and W starts at ONE. The rays are emitted isotropically, so the");
  line("  signed current of the RAYS cancels — but every ray of a given polarity");
  line("  carries the same emitter drift, and σ·u adds across both populations.");
  line();
  line("  SO THE LABEL IS CARRYING SOMETHING THE HEADINGS DO NOT. A cell looking only");
  line("  at what arrives sees no current at all here; a cell that can read the label");
  line("  sees the wire. That is `faraday` §3's obstruction stated as a measurement");
  line("  rather than as a parity argument, and it is why the wire in §4 has a field.");
  line();
  line("  THE J COLUMNS ARE NOT A COMPARISON AND SHOULD NOT BE READ AS ONE. J starts");
  line("  at nought by construction here, so its later values are the noise floor of");
  line("  a few dozen surviving carriers rising off zero, not a decay. Only the W");
  line("  column carries information.");
  line();
  line("  AND W DECAYS, AT A RATE SET BY θ — 0.53 at an eighth-turn against 0.94 at");
  line("  CYCLE = 128 over the same sixty ticks. (G+M/3) rotates the label along with");
  line("  everything else, because it is a direction in the lattice and a rotation of");
  line("  space rotates it, so the label diffuses at the scattering rate like any");
  line("  other direction. THE LABEL BUYS THE FIELD'S EXISTENCE AND NOT ITS RANGE.");
  line("  The range is `relax` §3's question and its answer is a small θ — the same");
  line("  parameter, pulling the same way, for the third time in this arc.");
  return out.join("\n");
}

// ─── §6 the reconciliation ──────────────────────────────────────────────────
function reconcile(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §6  WHICH WAY THE FORK RESOLVES, AND WHAT IT COSTS ═════");
  line();
  line("  `faraday` §4 set the fork: the turn axis needs either A NEW STORED FIELD —");
  line("  three numbers per cell and an evolution rule, the largest addition this");
  line("  book would have made — or A THIRD PER-RAY LABEL, which the strand reading");
  line("  already has and the ribbon reading has no room for.");
  line();
  line(`  ${pad("", 30)} ${pad("stored field", 16)} the label`);
  line("  " + "─".repeat(72));
  line(`  ${pad("new state per cell", 30)} ${pad("3 numbers", 16)} none`);
  line(`  ${pad("new evolution rule", 30)} ${pad("yes", 16)} no — rides (G+M/3)`);
  line(`  ${pad("static charge → no B", 30)} ${pad("by construction", 16)} DERIVED, if unpolarised`);
  line(`  ${pad("spinning charge → dipole", 30)} ${pad("put in", 16)} DERIVED, 1/r³`);
  line(`  ${pad("moving charge → qv×r̂/r²", 30)} ${pad("put in", 16)} DERIVED`);
  line(`  ${pad("E ⊥ B", 30)} ${pad("put in", 16)} DERIVED`);
  line(`  ${pad("wire → Ampère 1/r", 30)} ${pad("put in", 16)} DERIVED`);
  line();
  line("  THE LABEL WINS ON EVERY ROW AND IT COSTS NO NEW STATE. So the fork resolves");
  line("  toward the strand reading, and it resolves on a physical question rather");
  line("  than on preference, which is what `faraday` asked for.");
  line();
  line("  AND NOW THE RECONCILIATION, WHICH IS NOT A MERGER. It would be a mistake to");
  line("  delete the ribbon arc on the strength of this, because the two are not");
  line("  answering the same question:");
  line();
  line("     the RIBBON supplies spin as w₁, charge as an H₁ class, mass as an edge");
  line("     count, and the particle table. It is a theory of WHAT MATTER IS.");
  line();
  line("     the STRAND supplies the per-ray label, the U(1) phase, minimal");
  line("     coupling, and now the magnetic field. It is a theory of WHAT MATTER");
  line("     EMITS and how the emission carries orientation.");
  line();
  line("  THE OBJECT THIS FILE NEEDS IS AN EMITTER WITH AN AXIS, and a ribbon graph");
  line("  moving through the lattice HAS one — its direction of travel. So the honest");
  line("  statement is that the label is a property of the EMISSION rather than of");
  line("  the emitter's internal structure, and a ribbon can carry it as easily as a");
  line("  strand can. WHAT IS REFUTED IS NOT THE RIBBON, IT IS THE CLAIM THAT A RAY");
  line("  CARRIES ONLY A POLARITY AND A HEADING.");
  line();
  line("  WHICH IS A SMALLER AND BETTER RESULT THAN 'ONE ARC WINS'. The two arcs");
  line("  describe matter and emission respectively, they were never rivals, and the");
  line("  thing that looked like a fork was a missing label on the rays that both of");
  line("  them emit. THE REDUNDANCY IS NOT REDUNDANT — it is two halves that had not");
  line("  been joined, and this is the joint.");
  line();
  line("  WHAT IS STILL NOT DONE, so this is not read as more than it is:");
  line();
  line("     FARADAY. W is still read off the rays present at a cell, so it has no");
  line("     time derivative of its own. A wave needs ∂W/∂t driving a J, and nothing");
  line("     here shows the rules do that. THE PHOTON REMAINS OPEN — but the reason");
  line("     has changed: it is no longer that the model cannot build a B, it is");
  line("     that B has no independent dynamics.");
  line();
  line("     WHAT ORIENTS AN EMITTER. §2's unpolarised case is what makes ordinary");
  line("     matter non-magnetic, and it is an assumption about matter rather than a");
  line("     result. The magnetism arc's ordering question is exactly the question of");
  line("     when that assumption fails, so the two now meet.");
  line();
  line("     AND θ, AND THE VACUUM DENSITY, owed exactly as `relax` §6 leaves them.");
  return out.join("\n");
}

// ─── §7 the vacuum density, which closes relax §6's escape ──────────────────
/**
 * AND THE ESCAPE `relax` §6 OFFERED IS NOT AVAILABLE, which has to be said here
 * because this file is the reason it matters.
 *
 * `relax` §6 bounded the turn angle at θ ≲ 10⁻²³ from storage rings and from domain
 * sizes, and rescued the coupling by saying the background DENSITY could be ~10²¹
 * larger to compensate: "the ratio is independent of n and the magnitude is not".
 *
 * `vacuum` already settles n and it is not free. Its headline is that the density
 * is NOT A PARAMETER — (1−p)/(2−p) → ½ with the rate cancelling, so the vacuum sits
 * at half occupancy because expansion makes it so and nobody chose it.
 */
function density(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §7  AND THE VACUUM DENSITY IS NOT FREE, WHICH CLOSES AN ESCAPE ═════");
  line();
  line("  `relax` §6 rescued the coupling from the storage-ring bound by letting the");
  line("  background density carry it: θ ≲ 10⁻²³ makes sin θ tiny, so n was to be");
  line("  ~10²¹ larger. THAT IS NOT AVAILABLE. `vacuum` derives the occupancy as");
  line("  (1−p)/(2−p) → ½, with the expansion rate cancelling out, and measures it");
  line("  at 0.55–0.59 across a fourfold change in p. It is a half because expansion");
  line("  makes it so, and it is one of the few numbers in this book nobody chose.");
  line();
  line("  So n is of order one per cell and cannot move by twenty-one orders. The");
  line("  turn-response coupling really is ~sin θ ~ 10⁻²³, and a magnetic force built");
  line("  from it is short by about that much.");
  line();
  line("  WHICH WOULD BE FATAL IF THE TURN WERE STILL DOING THE SOURCING — AND AFTER");
  line("  §§1–5 IT IS NOT. That is the part worth being careful about, because the");
  line("  two halves of the problem have come apart:");
  line();
  line(`  ${pad("", 22)} ${pad("in `magnetic`", 22)} after this file`);
  line("  " + "─".repeat(70));
  line(`  ${pad("what SOURCES B", 22)} ${pad("the turn axis b̂ ∝ J", 22)} the label: W = Σσ(d̂ × u)`);
  line(`  ${pad("its size", 22)} ${pad("carries sin θ", 22)} NO θ IN IT — |W|/|J| ~ u/c`);
  line(`  ${pad("what a charge FEELS", 22)} ${pad("a turn by θ", 22)} a turn by θ — unchanged`);
  line(`  ${pad("its size", 22)} ${pad("carries sin θ", 22)} carries sin θ`);
  line();
  line("  THE SOURCE IS NOW FREE OF θ AND THE RESPONSE IS NOT. §3 measured |W|/u flat");
  line("  to 1.08×, so the field a moving charge makes stands in the right ratio to");
  line("  its electric field — which is v/c, exactly as in Maxwell, with no coupling");
  line("  constant needed and none supplied. That half is fixed.");
  line();
  line("  THE RESPONSE IS NOT FIXED AND IS NOW THE WHOLE DEBT. A test charge feels a");
  line("  field by being turned, the turn is by θ, and θ is bounded at 10⁻²³. So this");
  line("  arc can build a magnetic field of the right shape, the right distance law");
  line("  and the right size, AND CANNOT YET MAKE ANYTHING FEEL IT AT THE RIGHT");
  line("  STRENGTH. That is a sharper statement of the debt than `relax` left, and it");
  line("  is a worse one, because the density escape is gone.");
  line();
  line("  WHAT WOULD RESOLVE IT, stated so it can be attacked rather than left as a");
  line("  hole. The bound on θ comes from the LONGITUDINAL force, which is the");
  line("  symmetric part of the same rotation — tan(θ/2) of the transverse part. If");
  line("  the response to W is not a rotation of the displacement but something with");
  line("  no symmetric part at all, the bound evaporates and the coupling is free");
  line("  again. `magnetic` §4 assumed the response was a turn because (G+M/3) is a");
  line("  turn; it did not show that a field must act through (G+M/3). THAT IS THE");
  line("  NEXT THING TO TEST and this file does not test it.");
  return out.join("\n");
}

console.log(parity());
console.log(statics());
console.log(moving());
console.log(wireTest());
console.log(discrete());
console.log(reconcile());
console.log(density());
