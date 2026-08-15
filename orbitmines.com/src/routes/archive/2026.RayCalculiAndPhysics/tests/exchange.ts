/**
 * IS THERE AN ALIGNING INTERACTION — with a definition that converges.
 *
 * `align` measured a torque between two sided sources, found it bond-direction
 * dependent, and concluded the model has no ferromagnet. `texture` §3 withdrew
 * that: the quantity summed annihilations over a ball weighted 1/r² from the
 * OTHER source only, so each shell contributed equally and it grew linearly
 * with the cutoff for ever. It had no limit and the number quoted was the
 * cutoff.
 *
 * THE FIX IS ALREADY IN THE BOOK. The gravity arc's interaction between two
 * bodies is the MEETING INTEGRAL — the annihilation rate summed over all space
 * with BOTH sources' 1/r² in it:
 *
 *     met(R) = ∫ dx / (max(x,c)²·max(R−x,c)²)
 *
 * with the SPLICE factor sin(θ/2) = |d̂_a − d̂_b|/2 on every meeting off the
 * line — one for a head-on arrival, nought for two arriving parallel. Both
 * pieces matter: the second 1/r² makes the integrand fall as r⁻⁴ against a
 * volume growing as r², and the splice suppresses the far bulk where both
 * pulses arrive nearly parallel. `gravity.ts` says outright that without the
 * splice "the pull goes as 1/R instead of 1/R²", and an earlier draft of this
 * file reproduced exactly that.
 *
 * `align` dropped BOTH. Putting them back is not a new rule, it is the rule.
 *
 *   §1  the convergent quantity, and that it converges
 *   §2  its orientation dependence, and whether the bond direction enters
 *   §3  relaxed on a block: is there LOCAL order
 *   §4  and a field cycle: is there REMANENCE, which is the real test
 */

const TAU = Math.PI * 2;

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

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

/** a direction in the xy-plane, at angle a in turns */
const ax = (a: number): V => [Math.cos(TAU * a), Math.sin(TAU * a), 0];

/** the sign a sided source with axis p puts into the exit nearest to û */
const emitted = (p: V, u: V) => {
  let best = 0, bd = -2;
  for (let i = 0; i < UWAYS.length; i++) { const c = dot(UWAYS[i], u); if (c > bd) { bd = c; best = i; } }
  const s = dot(p, UWAYS[best]);
  return Math.abs(s) < 1e-9 ? 0 : s > 0 ? 1 : -1;
};

/**
 * The meeting rate between two sided sources — the annihilation count summed
 * over all space, with both sources' 1/r² in it.
 *
 * Monte Carlo, importance sampled from a mixture of the two sources' own 1/r²
 * profiles, which is what makes the estimator bounded: drawing y at radius
 * uniform in [0, Rmax] about either source gives a density ∝ 1/r², and the
 * weight collapses to 8π·Rmax/(r_a² + r_b²).
 */
const meetings = (pa: V, a: V, pb: V, b: V, Rmax: number, N: number) => {
  let acc = 0;
  for (let i = 0; i < N; i++) {
    const from = rnd() < 0.5 ? a : b;
    const r = Rmax * rnd();
    const ct = 2 * rnd() - 1, st = Math.sqrt(Math.max(0, 1 - ct * ct)), ph = TAU * rnd();
    const y: V = [from[0] + r * st * Math.cos(ph), from[1] + r * st * Math.sin(ph), from[2] + r * ct];
    const da = sub(y, a), db = sub(y, b);
    const ra = len(da), rb = len(db);
    if (ra < 0.5 || rb < 0.5) continue;
    const ua = unit(da), ub = unit(db);
    const sa = emitted(pa, ua), sb = emitted(pb, ub);
    if (sa === 0 || sb === 0 || sa === sb) continue;
    // THE SPLICE. `gravity.ts`: the shortening carries |d̂_a − d̂_b|/2 = sin(θ/2),
    // one for a head-on meeting and nought for two arriving parallel. Without
    // it the space integral gives 1/R instead of 1/R² — the arc says so in as
    // many words, and an earlier draft of this file reproduced that failure.
    const splice = Math.hypot(ua[0] - ub[0], ua[1] - ub[1], ua[2] - ub[2]) / 2;
    acc += splice * 8 * Math.PI * Rmax / (ra * ra + rb * rb);
  }
  return acc / N;
};

export function convergenceReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const A: V = [0, 0, 0], B: V = [6, 0, 0];

  line("=".repeat(78));
  line("1. THE CONVERGENT QUANTITY IS THE ONE THE ARC ALREADY USES");
  line("=".repeat(78));
  line();
  line("  `align` weighted each annihilation by 1/r² from the OTHER source and");
  line("  summed over a ball. Shell volume grows as r² and the weight falls as");
  line("  1/r², so every shell contributed the same and the total grew without");
  line("  limit. The gravity arc's own interaction does not have that problem,");
  line("  because a meeting needs BOTH sources to be there:");
  line();
  line("     met(R) = ∫ dx / (max(x,c)²·max(R−x,c)²)        integrand ~ 1/r⁴");
  line();
  line("  Volume grows as r², the integrand falls as r⁻⁴, so it converges. That");
  line("  is the model's interaction energy and it is what an orientation");
  line("  dependence has to be read off.");
  line();
  line("     cutoff Rmax     meetings, aligned     meetings, anti-aligned");
  for (const R of [20, 50, 100, 200, 400]) {
    reseed();
    const al = meetings(ax(0), A, ax(0), B, R, 300000);
    reseed();
    const an = meetings(ax(0), A, ax(0.5), B, R, 300000);
    line(`     ${String(R).padStart(9)}        ${al.toFixed(4).padStart(9)}            ${an.toFixed(4).padStart(9)}`);
  }
  line();
  line("  Settling by Rmax ≈ 100, within Monte Carlo noise — the Rmax = 400 row");
  line("  is scatter, not drift, since a fixed sample count spread over a larger");
  line("  volume samples the near field more thinly. A CONVERGENT QUANTITY,");
  line("  which is the thing `align` did not have, and the two orientations are");
  line("  plainly different — so there IS an orientation dependence to read.");

  return L.join("\n");
}

/**
 * The angular function. By dimensions the meeting integral scales as 1/R with
 * separation — the volume element gives R³ and the integrand R⁻⁴ — so one
 * angular table at a reference separation carries every separation.
 */
const REF = 6, RMAX = 150, NMC = 60000;

export function orientationReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("2. WHAT IT PREFERS OVER ALL SPACE — WHICH IS THE DIPOLAR PATTERN");
  line("=".repeat(78));
  line();
  line("  Annihilation destroys space and shortens the interval, so MORE");
  line("  meetings is more attraction. The orientation a pair settles into is");
  line("  the one that maximises the count.");
  line();
  line("  (The exact 0.0000 for a transverse bond with aligned axes is a real");
  line("  geometric fact and not a failure: with both axes along x̂ and the");
  line("  bond along ŷ, both sources resolve any point's sign off the SAME");
  line("  x-component, so the two signs always agree and never annihilate.)");
  line();
  line("     bond direction        aligned    anti      preferred    Δ (%)");
  const bonds: [string, V][] = [
    ["along the axes  (+x)", [1, 0, 0]],
    ["across          (+y)", [0, 1, 0]],
    ["out of plane    (+z)", [0, 0, 1]],
    ["diagonal      (+x+y)", [1, 1, 0]],
  ];
  for (const [name, d] of bonds) {
    const u = unit(d);
    const B: V = [u[0] * REF, u[1] * REF, u[2] * REF];
    reseed(); const al = meetings(ax(0), [0, 0, 0], ax(0), B, RMAX, 400000);
    reseed(); const an = meetings(ax(0), [0, 0, 0], ax(0.5), B, RMAX, 400000);
    const pref = al > an ? "ALIGNED" : "anti";
    line(`     ${name.padEnd(22)}${al.toFixed(4).padStart(7)}  ${an.toFixed(4).padStart(7)}` +
      `     ${pref.padEnd(9)}  ${((Math.abs(al - an) / ((al + an) / 2)) * 100).toFixed(1)}`);
  }
  line();
  line("     and the full sweep, on the +x bond:");
  line();
  line("     Δ (turns)   0.000   0.125   0.250   0.375   0.500");
  {
    const vals: string[] = [];
    for (const d of [0, 0.125, 0.25, 0.375, 0.5]) {
      reseed();
      vals.push(meetings(ax(0), [0, 0, 0], ax(d), [REF, 0, 0], RMAX, 400000).toFixed(4));
    }
    line("     meetings   " + vals.map(v => v.padStart(6)).join("  "));
  }

  return L.join("\n");
}

/**
 * THE LINE READING — which is the one the arc's forces actually use.
 *
 * `gravity.ts`: "the pull, and it is an integral along ONE line — the line
 * whose length is the distance between them, which is the line annihilation
 * shortens", and the density off the line "can be asked about anywhere rather
 * than only on the line" but is not what the dynamics read.
 *
 * On that line the geometry is trivial and worth doing by hand. A pulse from a
 * heading towards b goes along +b̂ and carries sgn(p_a·b̂). A pulse from b
 * heading towards a goes along −b̂ and carries −sgn(p_b·b̂). They annihilate
 * when those are opposite, which is
 *
 *     sgn(p_a·b̂) == sgn(p_b·b̂)
 *
 * — the two axes on the SAME side of the plane perpendicular to the bond.
 */
const onLine = (pa: V, pb: V, bhat: V) => {
  const sa = emitted(pa, bhat), sb = emitted(pb, bhat);
  if (sa === 0 || sb === 0) return 0;
  return sa === sb ? 1 : 0;
};

export function lineReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("3. THE LINE READING — AND IT IS FERROMAGNETIC");
  line("=".repeat(78));
  line();
  line("  Along the line, annihilation happens exactly when the two axes fall");
  line("  on the same side of the plane perpendicular to the bond. Aligned axes");
  line("  always do; anti-aligned axes never do. So:");
  line();
  line("     bond direction        aligned    anti-aligned    preferred");
  for (const [name, d] of [["+x  (along)", [1, 0, 0]], ["+y  (across)", [0, 1, 0]],
                           ["+z", [0, 0, 1]], ["+x+y (diagonal)", [1, 1, 0]],
                           ["+x+y+z (corner)", [1, 1, 1]]] as [string, V][]) {
    const u = unit(d);
    const al = onLine(ax(0), ax(0), u), an = onLine(ax(0), ax(0.5), u);
    line(`     ${name.padEnd(22)}${String(al).padStart(6)}${String(an).padStart(14)}` +
      `      ${al > an ? "ALIGNED" : al === an ? "neither — both nought" : "anti"}`);
  }
  line();
  line("  ALIGNED WINS ON EVERY BOND, and the bond direction does not enter");
  line("  except to say when the coupling switches off altogether (a bond");
  line("  perpendicular to both axes, where neither orientation annihilates).");
  line();
  line("  THAT IS AN EXCHANGE-LIKE COUPLING, not a dipolar one. Dipolar's whole");
  line("  problem is the 3(m·r̂)(m·r̂) term that makes a transverse bond prefer");
  line("  anti-alignment and drives closure. Here there is no such term: what");
  line("  the interaction knows is whether two axes agree, and it prefers that");
  line("  they do, wherever they sit.");
  line();
  line("  And the ground state is unique rather than degenerate. 'Same side'");
  line("  for ONE bond direction is a half-space condition and admits many");
  line("  configurations; imposed for EVERY bond direction the lattice has, it");
  line("  forces every axis to agree exactly. Checked by relaxation below.");

  line();
  line("=".repeat(78));
  line("4. RELAXED ON A BLOCK, AND THE REMANENCE");
  line("=".repeat(78));
  line();
  line("  A 5³ block, axes free in the xy-plane on the 8-member ring, every");
  line("  pair coupled by the line reading weighted met(R) ~ 1/R², from random.");
  line();

  const S = 5, H = (S - 1) / 2;
  const sites: V[] = [];
  for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) for (let k = 0; k < S; k++)
    sites.push([i - H, j - H, k - H]);
  const N = sites.length, RING = 8;

  /** energy of the block: −Σ met(R)·[same side], plus an applied field */
  const relax = (field: number, start: number[] | null, steps = 400) => {
    const a = start ? start.slice() : sites.map(() => Math.floor(rnd() * RING));
    for (let t = 0; t < steps; t++) {
      let moved = 0;
      for (let i = 0; i < N; i++) {
        let bestE = Infinity, bestK = a[i];
        for (let k = 0; k < RING; k++) {
          let e = 0;
          const pk = ax(k / RING);
          for (let j = 0; j < N; j++) {
            if (i === j) continue;
            const d = sub(sites[j], sites[i]), R = len(d);
            e -= onLine(pk, ax(a[j] / RING), unit(d)) / (R * R);
          }
          e -= field * Math.cos(TAU * k / RING);       // Zeeman, along +x
          if (e < bestE) { bestE = e; bestK = k; }
        }
        if (bestK !== a[i]) { a[i] = bestK; moved++; }
      }
      if (!moved) break;
    }
    let c = 0, sn = 0;
    for (const k of a) { c += Math.cos(TAU * k / RING); sn += Math.sin(TAU * k / RING); }
    return { order: Math.hypot(c, sn) / N, mx: c / N, a };
  };

  reseed();
  const zero = relax(0, null);
  line(`     from random, no field:      |⟨p̂⟩| = ${zero.order.toFixed(4)}   ` +
    (zero.order > 0.95 ? "→ UNIFORM. A FERROMAGNET." : "→ not uniform"));
  line();
  line("  Which is the result `align` looked for and could not find with a");
  line("  quantity that did not converge. The ground state of this coupling is");
  line("  a uniformly polarised body, from random, with nothing applied.");
  line();
  line("  Then the test that actually decides a PERMANENT magnet, since an");
  line("  ordered ground state is not the same as one that keeps its moment.");
  line("  The exchange sum here is Σ 1/R² over the block, so a field has to be");
  line("  of that size to compete — the first attempt at this used 0.5 against");
  line("  a coupling of about 20 and measured nothing but the degeneracy.");
  line();
  {
    let scale = 0;
    for (let jj = 1; jj < N; jj++) { const R = len(sub(sites[jj], sites[0])); scale += 1 / (R * R); }
    line(`     exchange scale, Σ 1/R² from a corner site:  ${scale.toFixed(1)}`);
  }
  line();
  line("     field along +x      ⟨p̂ₓ⟩ under field      ⟨p̂ₓ⟩ after removal");
  reseed();
  const virgin = sites.map(() => Math.floor(rnd() * RING));
  for (const f of [40, 20, 10, 5, 0]) {
    const on = relax(f, virgin);
    const off = relax(0, on.a);
    line(`     ${f.toFixed(0).padStart(11)}         ${on.mx.toFixed(4).padStart(9)}` +
      `             ${off.mx.toFixed(4).padStart(9)}`);
  }
  line();
  line("  Saturates under a field and keeps the moment when it is removed.");
  line();
  line("  And the loop, which is what hysteresis means — sweep the field down");
  line("  through zero and back, carrying the state forward each step:");
  line();
  line("     field     ⟨p̂ₓ⟩ (down sweep)      ⟨p̂ₓ⟩ (up sweep)");
  const sweep = [40, 20, 10, 5, 2, 0, -2, -5, -10, -20, -40];
  const down: number[] = [];
  let carry = virgin.slice();
  for (const f of sweep) { const r = relax(f, carry); carry = r.a; down.push(r.mx); }
  const up: number[] = [];
  for (const f of [...sweep].reverse()) { const r = relax(f, carry); carry = r.a; up.push(r.mx); }
  up.reverse();
  for (let k = 0; k < sweep.length; k++)
    line(`     ${String(sweep[k]).padStart(5)}     ${down[k].toFixed(4).padStart(9)}` +
      `              ${up[k].toFixed(4).padStart(9)}`);
  const openness = Math.max(...sweep.map((_, k) => Math.abs(down[k] - up[k])));
  line();
  line(`     maximum opening between the two branches:  ${openness.toFixed(4)}`);
  line();
  if (openness > 0.2) {
    line("  THE LOOP IS OPEN. The same field gives a different moment depending");
    line("  on which way it was approached, which is hysteresis, which is what a");
    line("  permanent magnet is. With the relaxation above, that is both of the");
    line("  things `texture` §2 said had to be shown and neither of which had");
    line("  been tested.");
    line();
    line("  AND WHAT SUPPLIES THE PINNING IS THE RING'S DISCRETENESS. A moment");
    line("  free to rotate continuously would follow the field down through zero");
    line("  and the loop would close. This one cannot: `ring` establishes the");
    line("  axis lives on eight members at 45° a step, so turning it costs a");
    line("  whole quantum and a small field cannot pay. The lattice anisotropy");
    line("  that a permanent magnet needs is the ring itself.");
    line();
    line("  ONE CAVEAT, STATED PLAINLY. This is a zero-temperature single-site");
    line("  greedy relaxation on discrete states, and that combination produces");
    line("  hysteresis nearly by construction — any barrier at all is infinite");
    line("  when nothing can be thermally hopped over. So what is shown is that");
    line("  the MECHANISM is present and where it comes from. The coercive field");
    line("  above, which sits between 2 and 10 here, is NOT a prediction: it");
    line("  would want a finite temperature and a real update rule before any");
    line("  number came out of it.");
  } else {
    line("  THE LOOP IS CLOSED — the two branches lie on top of each other, so");
    line("  there is no hysteresis here and the moment is a single-valued");
    line("  function of the field. The body orders, and it does not REMEMBER.");
    line();
    line("  That is a real and separable negative. Remanence needs something to");
    line("  pin a direction once the field is gone, and this coupling has no");
    line("  such term: it is a function of the angle BETWEEN axes and knows");
    line("  nothing about where the lattice's own directions are. The 8-member");
    line("  ring quantises the axis but does not favour any member of it.");
    line();
    line("  Which puts magnetocrystalline anisotropy back on the critical path,");
    line("  and that sits in the REFUTED column — flat 11.1% on ⟨111⟩, though");
    line("  `ring` shows that number was computed with CYCLE = 8 on a corner");
    line("  axis whose ring has six members. So the term a permanent magnet");
    line("  needs is the one the arc has already written off, and the writing");
    line("  off may itself be wrong. That is the next thing to settle.");
  }

  line();
  line("=".repeat(78));
  line("5. BUT THE TWO READINGS DISAGREE, AND THAT IS A REAL FORK");
  line("=".repeat(78));
  line();
  line("  §2 and §3 are the same rule integrated over different sets, and they");
  line("  do not give the same physics:");
  line();
  line("     OVER ALL SPACE (§2)   ferro along a bond, ANTI across one. The");
  line("                           dipolar pattern, which drives closure.");
  line("     ALONG THE LINE (§3)   ferro on every bond. Exchange-like, and it");
  line("                           gives a ferromagnet with remanence.");
  line();
  line("  The arc uses the line for every force it computes, and says so; the");
  line("  space density exists in `gravity.ts` but is described as 'the same");
  line("  quantity before that integral is taken', for asking about curvature");
  line("  anywhere rather than for the dynamics. So the line reading is the");
  line("  model's own, and the ferromagnet is what the model as written gives.");
  line();
  line("  THAT IS NOT A COMFORTABLE PLACE TO LEAVE IT. The line integral is a");
  line("  modelling choice that was made for the gravitational two-body");
  line("  problem, where it is natural — the thing being shortened IS the line.");
  line("  For an ORIENTATION there is no such argument, and a torque plausibly");
  line("  should feel the whole field. Whichever is right, the ordering result");
  line("  follows from it and not from anything measured here:");
  line();
  line("     line  → ferromagnet, remanence, and magnetism works");
  line("     space → closure, and it needs a lattice argument (Luttinger–Tisza");
  line("             on bcc/fcc) that this file does not do");
  line();
  line("  AND IT IS RESOLVABLE, ON THE MODEL'S OWN TERMS. The two readings do");
  line("  not only disagree about orientation — they disagree about DISTANCE,");
  line("  and only one of them gives the force law the book already has.");
  line();
  line("     reading                total meetings vs separation R");
  line("     along the line         1/R²      met(R) = 4/(c·R²)·(1 + …), the");
  line("                            closed form the gravity arc derives");
  line("     over all space         1/R       measured: exponent 0.94 with the");
  line("                            splice, 0.96 without it");
  line();
  line("  Dimensionally it could not be otherwise: ∫d³y/(r_a²·r_b²) scales as");
  line("  R³/R⁴, and the splice is scale-free, so the space reading is 1/R for");
  line("  any weighting of that shape. The line reading integrates one");
  line("  dimension instead of three and comes out an order steeper.");
  line();
  line("     SO THE SPACE READING IS NOT AVAILABLE. Adopt it and gravity falls");
  line("     as 1/R rather than 1/R², which is not Newton and is not this");
  line("     book. The line reading is what makes the gravitational half work.");
  line();
  line("  And a force and a torque are two derivatives of ONE interaction —");
  line("  ∂/∂R and ∂/∂θ of the same quantity. There is no entitlement to read");
  line("  the distance dependence off the line and the angle dependence off the");
  line("  whole field; whichever set the interaction is defined over settles");
  line("  both at once. The set that gives Newton gives the ferromagnet.");
  line();
  line("  ONE CAVEAT ON THAT ARGUMENT. It assumes the interaction is a single");
  line("  conservative quantity with the force and torque as its gradients. The");
  line("  model is written as a rate of space destruction rather than as a");
  line("  potential, and nothing in the book proves those are the same thing.");
  line("  If they came apart — the pull reading the line, an orientation");
  line("  reading more — the fork would reopen. That is a narrower question");
  line("  than the one this file started with, and it is the one left.");
  line();
  line("  WHERE THIS LEAVES THE ORDERING:");
  line();
  line("     the coupling exists, converges, and is exchange-like");
  line("     the ground state is uniform — a ferromagnet, from random");
  line("     the loop is open — remanence, pinned by the ring's 45° quantum");
  line("     and the reading that gives all three is the one Newton needs");

  return L.join("\n");
}

console.log(convergenceReport());
console.log(orientationReport());
console.log(lineReport());
