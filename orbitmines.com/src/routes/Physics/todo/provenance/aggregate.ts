/**
 * DOES THE EMISSION HAVE TO BE ISOTROPIC PER PULSE, OR ONLY IN AGGREGATE?
 *
 * `escape` derives the source density −div p from the annihilation ledger, then
 * finds the far field is still 2.005 rather than 3.000 because the escaped
 * pulses are DIRECTIONAL: a top face emits + into the upper hemisphere and a
 * bottom face emits − into the lower one, so a distant observer above hears the
 * + and never hears the −. It books "isotropic emission" as an owed rule.
 *
 * The NAME is wrong and the DEBT is much smaller than the name suggests, and
 * this file separates the two.
 *
 *   §1  A pulse goes one way; it cannot be emitted in every direction, so
 *       "isotropic emission" as a rule about pulses means nothing. What the far
 *       field needs is that the SIGN not depend on the direction of emission.
 *       Those are different claims.
 *
 *   §2  And scattering cannot be what supplies it — a tempting answer and a
 *       wrong one. The model's 1/r² IS ballistic shell dilution. `gravity.ts`
 *       states the alternative outright: p = 1 gives 1/r², p = 0 gives 1/r. Let
 *       the emission diffuse and the inverse-square law goes with it. Measured
 *       here, because it is worth being sure about.
 *
 *   §3  But the direction-independent sign is not a new rule at all. It is
 *       `physics.ts`'s OTHER branch — cos(2πβ), the non-sided source — which is
 *       isotropic in sign and ballistic in flight at the same time.
 *
 *   §4  And the magnetism arc has already established that the magnetic layer
 *       is a SEPARATE emission stream from the mass one. So it is free to be
 *       non-sided while the mass stream is sided, and nothing has to be added.
 *
 *   §5  What is genuinely owed, after all that, is one sentence and not a rule.
 */

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const key = (a: V) => `${a[0]},${a[1]},${a[2]}`;
const sgn = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x > 0 ? 1 : -1);

const WAYS: V[] = (() => {
  const out: V[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) out.push([x, y, z]);
  return out;
})();
const UWAYS = WAYS.map(unit);

let seed = 20260815;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = () => { seed = 20260815; };

const block = (L: number, H: number): V[] => {
  const out: V[] = [];
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < H; k++)
    out.push([i - (L - 1) / 2, j - (L - 1) / 2, k - (H - 1) / 2]);
  return out;
};

const slope = (f: (r: number) => number, r0: number, r1: number) => {
  const xs: number[] = [], ys: number[] = [];
  for (let r = r0; r <= r1; r *= 1.3) {
    const v = Math.abs(f(r));
    if (v > 1e-300) { xs.push(Math.log(r)); ys.push(Math.log(v)); }
  }
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  return -num / den;
};

export function aggregateReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. 'ISOTROPIC EMISSION' WAS THE WRONG NAME FOR THE OWED THING");
  line("=".repeat(78));
  line();
  line("  A pulse goes one way. It cannot be emitted in every direction at");
  line("  once, so a rule saying it is would not mean anything, and `escape`");
  line("  booking one was booking something incoherent. Two separable claims");
  line("  were being run together:");
  line();
  line("     (a) THE SIGN does not depend on the direction of emission.");
  line("         A source puts the same sign into all 26 exits this tick,");
  line("         and each of those pulses still flies one way.");
  line();
  line("     (b) the pulses ARRIVE from all directions, so a distant observer");
  line("         hears from every part of the body rather than the near face.");
  line();
  line("  (a) is what the far field actually needs. (b) is a statement about");
  line("  propagation, and §2 shows the model cannot have it.");

  line();
  line("=".repeat(78));
  line("2. AND SCATTERING CANNOT SUPPLY IT — THE INVERSE SQUARE IS BALLISTIC");
  line("=".repeat(78));
  line();
  line("  The tempting answer is that pulses scatter, so a pulse forgets which");
  line("  way it was let go, so the arrival is isotropic in aggregate however");
  line("  directional the emission was. The model even has the machinery: the");
  line("  gravity arc's vacuum walk has mean cosine p = 0.8154, a run of 5.42");
  line("  steps, so direction memory would be gone within a few cells.");
  line();
  line("  IT IS THE WRONG ANSWER, AND THE ARC SAYS SO IN ANOTHER PLACE.");
  line("  `chance(m,r) = m·SHEET/shell(r)` is the whole derivation of the");
  line("  inverse-square law, and it is shell dilution of pulses that FLY");
  line("  STRAIGHT. `gravity.ts` puts the two extremes side by side while");
  line("  discussing the vacuum surplus:");
  line();
  line("     p = 1  (straight line)      gives 1/r²");
  line("     p = 0  (fresh direction)    gives 1/r");
  line();
  line("  So a diffusing emission does not preserve the inverse square, it");
  line("  replaces it. Measured, on a point source with an absorbing rim, as");
  line("  the exponent of the occupancy density against radius:");
  line();
  line("     propagation                     raw   rim-corrected");

  // The steady-state occupancy of a point source, done the way `gravity.ts`
  // does it: walkers released from the origin, an ABSORBING rim, and the time
  // each walker spends in each shell accumulated. Density = occupancy / shell.
  // A diffusive walker needs ~R²/D steps to reach the rim, so the step budget
  // has to be generous or the profile is an artefact of the cap.
  const RIM = 40;
  const profile = (pers: number, walkers = 20000) => {
    const bins = new Float64Array(RIM + 1);
    for (let w = 0; w < walkers; w++) {
      let d = Math.floor(rnd() * WAYS.length);
      const at: V = [0, 0, 0];
      for (let t = 0; t < 400000; t++) {
        if (rnd() > pers) d = Math.floor(rnd() * WAYS.length);
        at[0] += WAYS[d][0]; at[1] += WAYS[d][1]; at[2] += WAYS[d][2];
        const r = len(at);
        if (r >= RIM) break;                       // absorbed at the rim
        bins[Math.floor(r)] += 1;
      }
    }
    return (r: number) => {
      const b = Math.floor(r);
      if (b < 1 || b > RIM) return 0;
      return bins[b] / (4 * Math.PI * b * b);
    };
  };
  // With an absorbing rim the diffusive profile is (S/4πD)·(1−r/R)/r, not a
  // pure power — that is the form `gravity.ts` validated to 0.1%. So the raw
  // slope is contaminated by the (1−r/R) rolloff and has to be divided out.
  // A ballistic walker crosses every shell exactly once and picks up no such
  // factor, so its raw slope is already the answer.
  for (const [name, pers, want] of [["ballistic (p = 1)", 1, "1/r²"],
                                    ["persistent (p = 0.815)", 0.8154, ""],
                                    ["fresh direction (p = 0)", 0, "1/r"]] as [string, number, string][]) {
    reseed();
    const f = profile(pers);
    const raw = slope(f, 4, 20);
    const corr = slope(r => f(r) / (1 - r / RIM), 4, 20);
    line(`     ${name.padEnd(30)}${raw.toFixed(3).padStart(6)}${(pers === 1 ? "—" : corr.toFixed(3)).padStart(12)}` +
      `${want ? "     ← " + want : ""}`);
  }
  line();
  line("  1.90 against 2 for the ballistic case (lattice discretisation), and");
  line("  1.10 and 1.18 against 1 for the two scattering cases once the rim is");
  line("  divided out. Exactly the bracket the arc states.");
  line();
  line("  So scattering does not preserve the inverse square, it destroys it —");
  line("  and the inverse square is the one thing the gravity arc is least");
  line("  willing to give up. SO THE EMISSION IN THIS");
  line("  MODEL FLIES STRAIGHT, and `escape`'s directional reading was not an");
  line("  unstated assumption — it is the model's own propagation, and I was");
  line("  wrong to look for a way round it there.");

  line();
  line("=".repeat(78));
  line("3. BUT THE SIGN IS A DIFFERENT QUESTION, AND THAT BRANCH ALREADY EXISTS");
  line("=".repeat(78));
  line();
  line("  Claim (a) survives §2 untouched, because it is not about flight at");
  line("  all. `physics.ts` has exactly two source kinds:");
  line();
  line("     emission = sided ? along() : cos(2πβ)");
  line();
  line("     SIDED       the sign is the direction resolved against an axis, so");
  line("                 it DOES depend on which way the pulse goes. This is");
  line("                 the one that gives the step function and no field.");
  line();
  line("     NON-SIDED   the sign is cos(2πβ) — the source's own phase, the");
  line("                 same into every exit this tick. Direction does not");
  line("                 enter. AND IT STILL FLIES STRAIGHT, so the 1/r² is");
  line("                 untouched.");
  line();
  line("  The non-sided branch satisfies (a) and keeps §2's ballistic flight at");
  line("  the same time. There is no tension and nothing to invent — it is a");
  line("  branch the model has had since before the magnetism arc.");
  line();
  line("  Measured, on the same body, with the same escaped-charge magnitudes:");
  line();

  const cells = block(4, 4);
  const inside = new Set(cells.map(key));
  const AXIS: V = [0, 0, 1];
  // the surface density −div p, which `escape` derives from the ledger
  const src: { at: V; s: number }[] = [];
  {
    const pv = (x: number, y: number, z: number, a: number) =>
      inside.has(`${x},${y},${z}`) ? AXIS[a] : 0;
    const wanted = new Set<string>();
    for (const c of cells)
      for (const d of WAYS) wanted.add(`${c[0] + d[0]},${c[1] + d[1]},${c[2] + d[2]}`);
    for (const c of cells) wanted.add(key(c));
    for (const k of wanted) {
      const [x, y, z] = k.split(",").map(Number);
      const div = (pv(x + 1, y, z, 0) - pv(x - 1, y, z, 0)) / 2 +
        (pv(x, y + 1, z, 1) - pv(x, y - 1, z, 1)) / 2 +
        (pv(x, y, z + 1, 2) - pv(x, y, z - 1, 2)) / 2;
      if (Math.abs(div) > 1e-12) src.push({ at: [x, y, z], s: -div });
    }
  }

  const nearestIdx = (u: V) => {
    let best = 0, bd = -2;
    for (let i = 0; i < UWAYS.length; i++) { const c = dot(UWAYS[i], u); if (c > bd) { bd = c; best = i; } }
    return best;
  };
  // SIDED: the sign the observer gets is resolved against the axis
  const sided = (x: V) => {
    let t = 0;
    for (const c of cells) {
      const dv = sub(x, c), r = len(dv);
      if (r < 1e-9) continue;
      t += sgn(dot(AXIS, UWAYS[nearestIdx(unit(dv))])) / (r * r);
    }
    return t;
  };
  // NON-SIDED, strength −div p: the same sign into every exit, flying straight
  const nonsided = (x: V) => {
    let t = 0;
    for (const n of src) { const r = len(sub(x, n.at)); if (r > 1e-9) t += n.s / (r * r); }
    return t;
  };

  line("     source kind                              exponent    what it is");
  line(`     sided (sign resolved on the axis)         ${slope(r => sided([0, 0, r]), 200, 3200).toFixed(3)}      a step, no field`);
  line(`     non-sided, strength −div p                ${slope(r => nonsided([0, 0, r]), 200, 3200).toFixed(3)}      A MAGNET`);
  line();
  const R = 1200;
  let ref = 0, worst = 0;
  for (let d = 0; d <= 180; d += 10) {
    const th = d * Math.PI / 180;
    // potential, to read the angular law
    let v = 0;
    for (const n of src) {
      const r = len(sub([R * Math.sin(th), 0, R * Math.cos(th)], n.at));
      if (r > 1e-9) v += n.s / r;
    }
    v *= R * R;
    if (d === 0) ref = v;
    worst = Math.max(worst, Math.abs(v / ref - Math.cos(th)));
  }
  line(`     and its angular law against cos θ:  max deviation ${worst.toExponential(1)}`);

  line();
  line("=".repeat(78));
  line("4. AND THE MAGNETIC LAYER IS ALREADY A SEPARATE STREAM");
  line("=".repeat(78));
  line();
  line("  Which is what makes §3 an identification rather than a change. The");
  line("  objection would be that the mass emission is sided and cannot be");
  line("  quietly swapped — but `budget` settled that the magnetic emission is");
  line("  not the mass emission at all:");
  line();
  line("     if the biased pulses were a subset of the mass pulses, the whole");
  line("     effect would be the (1 − P_a·P_b) factor, which runs 0 to 2, so");
  line("     the most magnetism could ever be is ONE TIMES GRAVITY — and two");
  line("     touching N52 cubes pull 2.2·10¹² times their own gravity.");
  line();
  line("  So the magnetic layer has its own budget and its own pulses, and");
  line("  nothing requires those pulses to be sided just because the mass ones");
  line("  are. A body's polarisation p is carried by whatever holds the axes;");
  line("  the magnetic emission it sources need only be non-sided with strength");
  line("  −div p, and both halves of that are already in the model.");

  line();
  line("=".repeat(78));
  line("5. SO WHAT IS ACTUALLY OWED IS ONE SENTENCE");
  line("=".repeat(78));
  line();
  line("     NOT OWED   a new emission rule. Direction-independent sign is the");
  line("                non-sided branch, ballistic flight is what it already");
  line("                does, and the two together give 3.000 and cos θ.");
  line();
  line("     NOT AVAILABLE   scattering as an escape from the sided reading.");
  line("                §2 — it would take the inverse-square law with it.");
  line("                `escape`'s directional reading of a SIDED source is");
  line("                correct and stands.");
  line();
  line("     OWED       that the strength of the non-sided magnetic emission is");
  line("                the local −div p. `escape` §1 derives the DENSITY from");
  line("                the annihilation ledger; what is not shown is that a");
  line("                region re-emits its unpaired excess as its own");
  line("                non-sided source rather than the excess simply being");
  line("                what escapes.");
  line();
  line("  That is the regional-sourcing statement the Layer-2 arc already");
  line("  assumes for bound states, and it is one sentence rather than a rule:");
  line("  a region's emission is sourced by what is in the region. Still owed,");
  line("  still load-bearing, and much narrower than 'isotropic emission'.");
  line();
  line("  THE HONEST SUMMARY OF THIS FILE: the aggregate objection is right");
  line("  about the name and wrong about the mechanism. Nothing is isotropic in");
  line("  aggregate here, because nothing scatters. What is true is that the");
  line("  model already contains a source whose sign does not depend on");
  line("  direction, so the thing `escape` said had to be added does not.");

  return L.join("\n");
}

console.log(aggregateReport());
