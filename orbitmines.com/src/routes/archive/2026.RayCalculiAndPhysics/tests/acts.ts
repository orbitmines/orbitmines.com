/**
 * HOW A FIELD ACTS ON A CHARGE — every way it could, and one of them has no
 * longitudinal force at all, which removes the bound that was strangling the arc.
 *
 * `fork` §7 left the debt in one sentence: the SOURCE is fixed and free of θ, and
 * the RESPONSE is not. A charge feels a field by being turned, a turn is a rotation,
 * a rotation has a symmetric part, the symmetric part is a longitudinal force at
 * tan(θ/2), and a storage ring bounds that at 4·10⁻¹⁴ — so the coupling is short by
 * twenty-one orders and the vacuum density cannot make it up.
 *
 * But `magnetic` §4 only ever assumed the response was a turn because (G+M/3) IS a
 * turn. It never showed a field must act through (G+M/3). So enumerate.
 *
 * A meeting has exactly three things a field could touch:
 *
 *     WHERE IT PUTS THE STRUCTURE   the displacement, ±d̂          → M1, M4
 *     WHETHER IT HAPPENS AT ALL     the rate                       → M2, M3
 *     WHICH OF THE PAIR DIES        the outcome                    → M5
 *
 *   §1  all five, measured for the two things that matter: is the force transverse
 *       (∝ v × W) and is there a longitudinal part. TWO OF THEM WORK.
 *
 *       M2 — GATE THE RATE by the triple product [W, v, d̂], leaving the
 *       displacement alone — gives a pure Lorentz force and nothing along v, at
 *       machine precision, at every velocity tried.
 *
 *       M4 — SHEAR the displacement, d̂ → d̂ + κ(d̂ × W) — does too, and it is the
 *       more important row because it is `magnetic`'s own mechanism with ONE
 *       CONSTRAINT DROPPED. A rotation moves the displacement sideways by sin θ and
 *       SHORTENS it by (1 − cos θ), because rotations preserve length; that
 *       shortening IS the longitudinal force. Nothing in the three rules says a
 *       meeting's displacement must still be exactly one cell after the field has
 *       acted. Drop that and the bound goes with no new machinery at all.
 *
 *   §2  and it is not an accident of one gate function. Sweep them: the gate has to
 *       be ODD in d̂ and carry the charge's sign, and every gate that does gives a
 *       transverse force while every gate that does not gives nothing or gives
 *       drag. The triple product is the only rotational invariant of (W, v, d̂) that
 *       is odd in d̂, so it is forced rather than chosen.
 *
 *   §3  WHAT BOUNDS THE GATE, which is the question that killed the turn. A rate
 *       cannot go negative, so κ|W||v| < 1 — a bound on the PRODUCT and not on the
 *       coupling alone, and one that weakens as the field does. Measured: the force
 *       stays exactly linear up to the saturation point and there is no longitudinal
 *       component anywhere, saturated or not.
 *
 *   §4  and where a gate could come from, which is the honest weak point. A rate
 *       that depends on direction is what a PHASE does — the book's own `opposed(ψ)`
 *       makes a meeting's probability depend on relative phase, and rays from
 *       different directions arrive with different phases. Measured: a per-tick
 *       phase advance accumulates, so a tiny per-meeting effect becomes O(1) over
 *       the emitter's own period, WHICH IS WHY A GATE CAN BE STRONG WHERE A TURN
 *       CANNOT — a displacement is spent each tick, a phase is not.
 *
 *   §5  the discrete dynamics, gate and turn side by side in the real automaton.
 *
 * SO: the response is a gate or a shear, but not a length-preserving rotation. The
 * longitudinal force is gone and the storage-ring bound with it, so κ is a free
 * coupling — α as ever — rather than one pinned at 10⁻²³ by an experiment. Two
 * independent mechanisms give the same law, which is better than one and is also a
 * warning: the arc does not yet have a reason to prefer either.
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
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => { const n = len(a); return n < 1e-14 ? [0, 0, 0] : scale(a, 1 / n); };
const rotate = (v: V3, b: V3, th: number): V3 => {
  const c = Math.cos(th), s = Math.sin(th), k = unit(b);
  return add(add(scale(v, c), scale(cross(k, v), s)), scale(k, dot(k, v) * (1 - c)));
};

/** the 26 exits, normalised — and Σd̂⊗d̂ = (26/3)·I exactly, which every result uses */
const DIRS: V3[] = (() => {
  const o: V3[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) { const n = Math.hypot(x, y, z); o.push([x / n, y / n, z / n]); }
  return o;
})();

/** a spread of test velocities — one direction is never a test of perpendicularity */
const PROBES: V3[] = (() => {
  const o: V3[] = [], g = (1 + Math.sqrt(5)) / 2;
  for (let k = 0; k < 48; k++) {
    const z = 1 - 2 * (k + 0.5) / 48, r = Math.sqrt(Math.max(0, 1 - z * z));
    const t = 2 * Math.PI * k / g;
    o.push([r * Math.cos(t), r * Math.sin(t), z]);
  }
  return o;
})();

/**
 * THE FORCE, for a given response mechanism.
 *
 * The background is UNBIASED — equal numbers of each polarity on every exit — so
 * there is no electric field and everything that comes out is the field's doing.
 * For a test charge q, a ray of polarity σ is OPPOSITE when qσ < 0 (annihilates,
 * (G+M/1), displacement −d̂) and ALIKE when qσ > 0 (turns, (G+M/3), displacement
 * +d̂). With no field the two sums cancel exactly, which is the check that the
 * background is really neutral.
 */
type Mech = "none" | "M1turn" | "M2gate" | "M3drag" | "M4shear" | "M5select";

const force = (mech: Mech, q: number, v: V3, W: V3, kappa: number, n = 1): V3 => {
  let F: V3 = [0, 0, 0];
  for (const d of DIRS) {
    const closing = 1 - dot(v, d);
    for (const sigma of [+1, -1]) {
      const alike = q * sigma > 0;
      let step: V3 = alike ? d : scale(d, -1);
      let rate = n * closing;
      switch (mech) {
        case "none": break;
        // M1 — `magnetic` §4: an alike meeting ROTATES the displacement about W,
        // by the charge's own sense. A rotation has a symmetric part.
        case "M1turn":
          if (alike) step = rotate(d, W, q * kappa * len(W));
          break;
        // M2 — GATE THE RATE. The meeting is likelier or less likely depending on
        // the triple product [W, v, d̂], and the displacement is untouched. Carries
        // the ray's polarity, because a rate that does not know σ cannot make a
        // force that knows q.
        case "M2gate":
          rate *= 1 + kappa * sigma * dot(W, cross(v, d));
          break;
        // M3 — a gate that is EVEN in d̂ rather than odd, for contrast
        case "M3drag":
          rate *= 1 + kappa * sigma * dot(W, d) * dot(v, d);
          break;
        // M4 — add a perpendicular displacement rather than rotating: a shear
        case "M4shear":
          if (alike) step = add(d, scale(cross(d, W), q * kappa));
          break;
        // M5 — the OUTCOME is biased: which rule fires depends on the field
        case "M5select": {
          const bias = kappa * sigma * dot(W, cross(v, d));
          step = alike ? scale(d, 1 + bias) : scale(d, -(1 - bias));
          break;
        }
      }
      F = add(F, scale(step, rate));
    }
  }
  return F;
};

/** how much of a force lies along v, and how much across it — the whole diagnostic */
const split = (F: V3, v: V3, W: V3) => {
  const vh = unit(v);
  const lon = dot(F, vh);
  const perp = add(F, scale(vh, -lon));
  const want = cross(v, W);
  const align = len(perp) < 1e-14 || len(want) < 1e-14 ? NaN
    : dot(unit(perp), unit(want));
  return { lon, perp: len(perp), align, total: len(F) };
};

// ─── §1 the five mechanisms ─────────────────────────────────────────────────
function mechanisms(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  EVERY WAY A FIELD COULD ACT ON A MEETING ═════");
  line();
  line("  A meeting has three things a field could touch: WHERE it puts the");
  line("  structure, WHETHER it happens, and WHICH of the pair dies. That is the");
  line("  whole space, and `magnetic` §4 only tried the first.");
  line();
  line("  Unbiased background, so no electric field; the field W along ẑ; and the");
  line("  worst case over 48 velocity directions, because perpendicularity at one");
  line("  velocity means nothing.");
  line();
  const W: V3 = [0, 0, 1], kappa = 0.05;
  line(`  ${pad("mechanism", 12)} ${pad("what it changes", 22)} ${pad("|F⊥|", 11)} ${pad("worst |F·v̂|", 13)} ${pad("∥ v×W?", 9)} verdict`);
  line("  " + "─".repeat(84));
  const rows: [Mech, string][] = [
    ["none", "nothing (control)"], ["M1turn", "rotates the step"],
    ["M2gate", "gates the rate"], ["M3drag", "gates, even in d̂"],
    ["M4shear", "shears the step"], ["M5select", "biases the outcome"],
  ];
  for (const [m, what] of rows) {
    let worstLon = 0, perp = 0, worstAlign = 1;
    for (const p of PROBES) {
      const v = scale(p, 0.2);
      const s = split(force(m, +1, v, W, kappa), v, W);
      worstLon = Math.max(worstLon, Math.abs(s.lon));
      perp = Math.max(perp, s.perp);
      if (!isNaN(s.align)) worstAlign = Math.min(worstAlign, Math.abs(s.align));
    }
    const isL = perp > 1e-12 && worstAlign > 0.999999;
    line(`  ${pad(m, 12)} ${pad(what, 22)} ${pad(perp.toExponential(2), 11)} ${pad(worstLon.toExponential(2), 13)} ${pad(isL ? "YES" : perp > 1e-12 ? "no" : "—", 9)} ${perp < 1e-12 ? "no force" : worstLon < 1e-12 && isL ? "PURE LORENTZ" : isL ? "Lorentz + drag" : "wrong direction"}`);
  }
  line();
  line("  TWO OF THEM WORK, NOT ONE, AND THAT WAS NOT EXPECTED. M2 and M4 both give a");
  line("  pure Lorentz force with NO longitudinal component at all — not a small one,");
  line("  none, at machine precision, at every velocity direction tried.");
  line();
  line("  M2, THE GATE, works because it does not move the structure anywhere new. The");
  line("  displacement is still ±d̂ and all the field does is make some directions");
  line("  likelier. The force is Σ n(d̂)·κσ[W,v,d̂]·d̂, the triple product is ODD in d̂,");
  line("  the sum runs over ±d̂ pairs, so what survives is Σd̂⊗d̂ contracted with W × v");
  line("  — which is (DEG/3)(W × v) and is perpendicular to v BY CONSTRUCTION.");
  line();
  line("  M4, THE SHEAR, IS THE MORE INTERESTING ROW, because it is `magnetic`'s own");
  line("  mechanism with ONE CONSTRAINT DROPPED. A rotation moves the displacement");
  line("  sideways by sin θ AND shortens it along its old direction by (1 − cos θ),");
  line("  because a rotation preserves length. THE SHORTENING IS THE LONGITUDINAL");
  line("  FORCE. Deflect the displacement sideways WITHOUT insisting it stay one cell");
  line("  long — d̂ → d̂ + κ(d̂ × W) — and the longitudinal term is simply absent.");
  line();
  line("  ITS SECOND-ORDER LENGTHENING DOES NOT REVIVE IT EITHER, which is worth");
  line("  checking rather than assuming: |d̂ + κ(d̂ × W)|² = 1 + κ²|d̂ × W|², and that");
  line("  correction is EVEN in d̂ while the displacement is odd, so it cancels over");
  line("  the ±d̂ pairs. Measured at 4·10⁻¹⁶, which is the cancellation and not a");
  line("  small residue.");
  line();
  line("  SO THE ARC'S WHOLE LONGITUDINAL PROBLEM CAME FROM NORMALISING. `magnetic`");
  line("  §4 wrote the turn as a rotation because turnRing rotates, and a rotation is");
  line("  length-preserving; nothing in the three rules says a meeting's displacement");
  line("  must be exactly one cell after the field has acted on it. Drop that and the");
  line("  bound goes, with no new machinery at all.");
  return out.join("\n");
}

// ─── §2 is the gate function forced ─────────────────────────────────────────
function gates(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  AND THE GATE FUNCTION IS FORCED, NOT CHOSEN ═════");
  line();
  line("  M2 used g = [W, v, d̂]. A mechanism that only works for one hand-picked");
  line("  function is not a mechanism, so sweep every scalar that can be built from");
  line("  W, v and d̂ at lowest order and see which give a Lorentz force.");
  line();
  const W: V3 = [0, 0, 1], kappa = 0.05;
  const gs: [string, (v: V3, d: V3) => number, string][] = [
    ["[W, v, d̂]", (v, d) => dot(W, cross(v, d)), "odd in d̂, odd in v"],
    ["(W·d̂)", (_v, d) => dot(W, d), "odd in d̂, no v"],
    ["(v·d̂)", (v, d) => dot(v, d), "odd in d̂, no W"],
    ["(W·d̂)(v·d̂)", (v, d) => dot(W, d) * dot(v, d), "EVEN in d̂"],
    ["(W·v)", (v, _d) => dot(W, v), "no d̂ at all"],
    ["(W·v)(anything)", (v, d) => dot(W, v) * dot(v, d), "odd in d̂, wrong W"],
  ];
  line(`  ${pad("gate g(d̂)", 18)} ${pad("symmetry", 20)} ${pad("|F⊥|", 11)} ${pad("worst |F·v̂|", 13)} ∥ v×W?`);
  line("  " + "─".repeat(78));
  for (const [name, g, sym] of gs) {
    let worstLon = 0, perp = 0, worstAlign = 1;
    for (const p of PROBES) {
      const v = scale(p, 0.2);
      let F: V3 = [0, 0, 0];
      for (const d of DIRS) for (const sigma of [+1, -1]) {
        const alike = sigma > 0;
        const step: V3 = alike ? d : scale(d, -1);
        F = add(F, scale(step, (1 - dot(v, d)) * (1 + kappa * sigma * g(v, d))));
      }
      const s = split(F, v, W);
      worstLon = Math.max(worstLon, Math.abs(s.lon));
      perp = Math.max(perp, s.perp);
      if (!isNaN(s.align)) worstAlign = Math.min(worstAlign, Math.abs(s.align));
    }
    const isL = perp > 1e-12 && worstAlign > 0.999999;
    line(`  ${pad(name, 18)} ${pad(sym, 20)} ${pad(perp.toExponential(2), 11)} ${pad(worstLon.toExponential(2), 13)} ${isL ? "YES" : perp > 1e-12 ? "no" : "—"}`);
  }
  line();
  line("  ONLY THE TRIPLE PRODUCT WORKS, and the sweep says why. A gate must be ODD");
  line("  in d̂ or the ±d̂ pairs cancel it; it must contain W or it is not a magnetic");
  line("  effect; it must contain v or the force cannot know the motion. The lowest-");
  line("  order scalar meeting all three is [W, v, d̂], and up to a constant it is the");
  line("  ONLY one — every other row either gives nothing or gives a force pointing");
  line("  somewhere a magnetic force does not point.");
  line();
  line("  SO THE MECHANISM IS NOT A FREE CHOICE dressed up as a discovery. Given that");
  line("  a field acts by gating rather than by displacing, the gate is determined and");
  line("  the Lorentz force follows.");
  return out.join("\n");
}

// ─── §3 what bounds it ──────────────────────────────────────────────────────
function bound(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  WHAT BOUNDS A GATE, WHICH IS THE QUESTION THAT KILLED THE TURN ═════");
  line();
  line("  The turn was bounded because it dragged a longitudinal force along with it.");
  line("  A gate has none, so what stops κ being anything at all?");
  line();
  line("  ONE THING, AND IT IS A DIFFERENT KIND OF BOUND: a rate cannot go negative.");
  line("  The gate is 1 + κσ[W,v,d̂], the triple product is at most |W||v|, so the");
  line("  mechanism saturates at κ|W||v| = 1. That is a bound on the PRODUCT of the");
  line("  coupling and the field and the speed — not on the coupling alone, and it");
  line("  RELAXES as the field weakens.");
  line();
  const W: V3 = [0, 0, 1];
  const v: V3 = [0.2, 0, 0];
  line(`  ${pad("κ|W||v|", 12)} ${pad("|F⊥|", 13)} ${pad("|F⊥|/κ", 13)} ${pad("|F·v̂|", 13)} linear?`);
  line("  " + "─".repeat(64));
  const base: number[] = [];
  for (const kv of [1e-6, 1e-3, 0.01, 0.1, 0.9, 1.5, 4.0]) {
    const kappa = kv / (len(W) * len(v));
    // clamp negatives the way a real rate would, so saturation is visible
    let F: V3 = [0, 0, 0];
    for (const d of DIRS) for (const sigma of [+1, -1]) {
      const alike = sigma > 0;
      const step: V3 = alike ? d : scale(d, -1);
      const g = 1 + kappa * sigma * dot(W, cross(v, d));
      F = add(F, scale(step, (1 - dot(v, d)) * Math.max(0, g)));
    }
    const s = split(F, v, W);
    base.push(s.perp / kappa);
    line(`  ${pad(kv.toExponential(0), 12)} ${pad(s.perp.toExponential(3), 13)} ${pad((s.perp / kappa).toFixed(6), 13)} ${pad(Math.abs(s.lon).toExponential(2), 13)} ${Math.abs(s.perp / kappa / base[0] - 1) < 1e-6 ? "YES" : "saturating"}`);
  }
  line();
  line("  EXACTLY LINEAR BELOW κ|W||v| = 1 AND SATURATING ABOVE IT, with NO");
  line("  longitudinal force anywhere on either side of the knee. So the gate is not");
  line("  hiding the bound somewhere else — the only thing that goes wrong at strong");
  line("  coupling is that the force stops growing, which is a saturation and not a");
  line("  drag.");
  line();
  line("  AND THE SATURATION IS A PREDICTION RATHER THAN A DEFECT. It says a magnetic");
  line("  field cannot bend a charge faster than one meeting per meeting — which is");
  line("  the lattice's version of a Larmor radius that cannot go below a cell, and it");
  line("  is the same kind of statement as `bound`'s r ≥ λ̄_C. It bites only where");
  line("  κ|W||v| approaches one, which is a field strength no experiment reaches if κ");
  line("  is of order α.");
  return out.join("\n");
}

// ─── §4 where a gate comes from ─────────────────────────────────────────────
function whence(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  WHERE A GATE COULD COME FROM, AND WHY IT CAN BE STRONG ═════");
  line();
  line("  This is the honest weak point of the file. §§1–3 show that IF a field acts");
  line("  by gating then the Lorentz force follows with no longitudinal part and no");
  line("  bound worth worrying about. They do not show that the rules gate.");
  line();
  line("  BUT THE BOOK ALREADY HAS A RATE THAT DEPENDS ON SOMETHING OTHER THAN");
  line("  DENSITY, and it did not have to be invented here. The quantum arc's");
  line("  `opposed(ψ)` makes a meeting's probability depend on the RELATIVE PHASE of");
  line("  the two emissions — that is what interference is in this model, and it is");
  line("  (G/1) verbatim. A phase is exactly a thing that makes some meetings happen");
  line("  and others not, without moving anything anywhere.");
  line();
  line("  And rays arriving from different directions arrive with different phases,");
  line("  because they left at different times. So a direction-dependent gate is what");
  line("  a phase ALREADY IS. The question is only whether the field shifts it.");
  line();
  line("  WHICH IS WHERE THE DIFFERENCE IN KIND LIVES, and it is the reason a gate can");
  line("  be strong where a turn cannot:");
  line();
  line("     A DISPLACEMENT IS SPENT EACH TICK. A turn of θ moves a structure by θ");
  line("     and then the tick is over; to move it by 1 you need θ ~ 1, and θ is");
  line("     bounded at 10⁻²³.");
  line();
  line("     A PHASE IS NOT SPENT. A shift of ε per tick is 2π after 2π/ε ticks. The");
  line("     effect is O(1) however small ε is, given enough ticks.");
  line();
  line("  Measured, because it is the whole argument:");
  line();
  line(`  ${pad("per-tick shift ε", 18)} ${pad("ticks to reach π", 18)} ${pad("as a fraction of", 20)} O(1)?`);
  line("  " + "─".repeat(70));
  const period = 1.49e21;                                  // electron beat, from domainsize
  for (const eps of [1e-3, 1e-10, 1e-20, 1e-23]) {
    const t = Math.PI / eps;
    line(`  ${pad(eps.toExponential(0), 18)} ${pad(t.toExponential(2), 18)} ${pad((t / period).toExponential(2) + " of a beat", 20)} ${t < period ? "YES" : "no"}`);
  }
  line();
  line("  AN ELECTRON'S OWN BEAT IS 1.5·10²¹ TICKS, so a per-tick phase shift of");
  line("  10⁻²⁰ turns the phase half way round inside a fifth of one beat, while");
  line("  10⁻²³ needs about two hundred beats — so even the storage-ring bound's own");
  line("  value is not hopeless on a phase, where on a displacement it is nothing at");
  line("  all. THE POINT IS THE SCALING AND NOT THE PARTICULAR NUMBER: a phase");
  line("  integrates and a displacement does not.");
  line();
  line("  SO THE ANSWER TO 'WHY IS THE COUPLING NOT 10⁻²³' IS THAT THE FIELD ACTS ON");
  line("  A CLOCK RATHER THAN ON A POSITION, and clocks integrate. That is also the");
  line("  cleanest reading of what a magnetic field DOES to matter in the book's own");
  line("  terms: it is a precession, which is what `moment` and `torque` were looking");
  line("  for and could not find a mechanism for.");
  line();
  line("  WHAT IS NOT DONE: showing that W shifts the phase by κ[W,v,d̂] rather than");
  line("  by something else, from the three rules. That is one calculation and it is");
  line("  the next one, and until it is done §§1–3 are a conditional.");
  return out.join("\n");
}

// ─── §5 the discrete dynamics ───────────────────────────────────────────────
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
 * A test structure moving through a real vacuum with a field out of the plane,
 * under the gate and under the turn, measured the only way a vanishing lattice
 * permits: as the displacement of the structure's own position over many ticks.
 *
 * The structure is a marked cell that meets background charges; a meeting either
 * fires (G+M/1) and pulls it one cell toward where the ray came from, or fires
 * (G+M/3) and pushes it one cell away. The gate modulates WHETHER, the turn
 * modulates WHERE.
 */
const walk = (mech: "gate" | "turn", ticks: number, kappa: number, vx: number,
  seed: number) => {
  const r = rng(seed);
  let x = 0, y = 0;                                        // the structure's position
  const Wz = 1;                                            // field out of the plane
  let travelled = 0;
  for (let t = 0; t < ticks; t++) {
    // one arriving ray per tick, isotropic, either polarity
    const a = r() * 2 * Math.PI;
    const d: [number, number] = [Math.cos(a), Math.sin(a)];
    const sigma = r() < 0.5 ? 1 : -1;
    const closing = 1 - (vx * d[0]);
    // [W, v, d̂] with W out of plane and v along x is Wz·(vx·d_y - 0) → Wz·vx·d[1]
    const triple = Wz * (vx * d[1]);
    const gate = mech === "gate" ? 1 + kappa * sigma * triple : 1;
    if (r() > Math.max(0, closing * gate) / 2) continue;
    // q = +1 throughout, so a ray of polarity σ is ALIKE when σ > 0
    const alike = sigma > 0;
    let step: [number, number] = alike ? d : [-d[0], -d[1]];
    // (G+M/3) is the TURN rule and fires on ALIKE pairs only — opposite pairs
    // annihilate under (G+M/1) and are not turned. An earlier version of this
    // walk rotated both, which restores a ± symmetry the rules do not have and
    // makes the turn's longitudinal force cancel; that cancellation was an
    // artefact of the test and not a property of the mechanism.
    if (mech === "turn" && alike) {
      const th = kappa * Wz;
      const c = Math.cos(th), sn = Math.sin(th);
      step = [step[0] * c - step[1] * sn, step[0] * sn + step[1] * c];
    }
    x += step[0]; y += step[1];
    travelled += 1;
  }
  return { x, y, travelled };
};

function discrete(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  THE TWO MECHANISMS IN THE REAL AUTOMATON ═════");
  line();
  line("  §§1–3 are sums over a distribution, which is the continuum reading. Run the");
  line("  structure instead: a marked cell in a vacuum, meeting one ray a tick, with");
  line("  the field out of the plane and the motion along x. A Lorentz force should");
  line("  push it along y and NOT along x.");
  line();
  const T = 4_000_000, K = 0.3, VX = 0.4;
  line(`  ${pad("mechanism", 11)} ${pad("Δy (transverse)", 17)} ${pad("Δx (longitudinal)", 19)} ${pad("|Δx|/|Δy|", 11)}`);
  line("  " + "─".repeat(64));
  for (const m of ["gate", "turn"] as const) {
    let sy = 0, sx = 0;
    for (let s = 0; s < 4; s++) {
      const w = walk(m, T, K, VX, 9001 + 7919 * s);
      sy += w.y / 4; sx += w.x / 4;
    }
    line(`  ${pad(m, 11)} ${pad(sy.toFixed(1), 17)} ${pad(sx.toFixed(1), 19)} ${pad(Math.abs(sx / sy).toFixed(4), 11)}`);
  }
  line();
  line("  THE GATE PUSHES IT SIDEWAYS AND NOT FORWARD; THE TURN DOES BOTH. Which is");
  line("  §1's table arriving from the dynamics rather than from a sum, and it is the");
  line("  same distinction: a gate changes which meetings happen and a turn changes");
  line("  what a meeting does.");
  line();
  line("  Note the longitudinal column is not exactly zero for the gate — it is a");
  line("  random walk with a finite number of steps, so it wanders. What matters is");
  line("  that it does not GROW with the field the way the turn's does.");
  return out.join("\n");
}

console.log(mechanisms());
console.log(gates());
console.log(bound());
console.log(whence());
console.log(discrete());
