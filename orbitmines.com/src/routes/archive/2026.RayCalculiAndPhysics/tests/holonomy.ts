/**
 * THE PHASE AROUND A LOOP — and whether a QUANTISED ring can have one.
 *
 * The Layer-2 arc's central positive result is that the complex structure is
 * forced by closed loops: carry a strand around a plaquette in a texture whose
 * north turns, and the azimuthal advances do not cancel. What is left is the
 * solid angle the axis swept, it is gauge-invariant under any site-by-site
 * redefinition of where azimuth zero sits, and that is Aharonov–Bohm as a
 * lattice-counting fact.
 *
 * The continuum half of that is true and §1 reproduces it. §2 is the check the
 * arc did not run, and it is the one that matters, because the SAME arc says
 * the phase lives on an eight-member ring with a quantum of 45°:
 *
 *     a smooth texture advances the azimuth by ~1e−2 radians per step
 *     the ring's smallest move is 45° = 7.85e−1 radians
 *
 * If the phase is genuinely ON the ring, every step rounds to no move at all
 * and the holonomy is identically zero on every loop. The quantised ring and
 * the continuous solid-angle flux cannot both be true, and the arc asserts
 * both — the ring in its opening section and the flux four sections later.
 *
 * §3 is the third option, which does not appear in the arc and is the only one
 * that keeps both: let the strand be a superposition over ring members, so the
 * advance is an expectation rather than a snap.
 */

const CYCLE = 8;
const SPIN = 2 * Math.PI / CYCLE;

type V = [number, number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/**
 * A Layer-1 texture: a north that turns as you move. The amplitude is what
 * makes it a texture rather than a uniform field; nothing here depends on the
 * particular one beyond its being smooth.
 */
const TWIST = 0.35;
const north = (x: number, y: number): V =>
  unit([TWIST * Math.sin(0.5 * x), TWIST * Math.sin(0.5 * y), 1]);

/** the minimal rotation taking a to b, applied to v — parallel transport */
const transport = (a: V, b: V, v: V): V => {
  const axis = cross(a, b), s = len(axis);
  if (s < 1e-14) return v;
  const k = mul(axis, 1 / s), c = dot(a, b), th = Math.atan2(s, c);
  // Rodrigues
  return add(add(mul(v, Math.cos(th)), mul(cross(k, v), Math.sin(th))),
    mul(k, dot(k, v) * (1 - Math.cos(th))));
};

/** the signed angle a frame picks up going round a closed list of norths */
const holonomy = (loop: V[]) => {
  const n0 = loop[0];
  const seed: V = Math.abs(n0[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const v0 = unit(cross(n0, seed));
  let v = v0, n = n0;
  for (let i = 1; i <= loop.length; i++) {
    const m = loop[i % loop.length];
    v = transport(n, m, v);
    n = m;
  }
  return Math.atan2(dot(cross(v0, v), n0), dot(v0, v));
};

/** solid angle of the spherical polygon the loop traces, by fan triangulation */
const solidAngle = (loop: V[]) => {
  let total = 0;
  for (let i = 1; i + 1 < loop.length; i++) {
    const a = loop[0], b = loop[i], c = loop[i + 1];
    const num = Math.abs(dot(a, cross(b, c)));
    const den = 1 + dot(a, b) + dot(b, c) + dot(c, a);
    let e = 2 * Math.atan2(num, den);
    if (dot(a, cross(b, c)) < 0) e = -e;
    total += e;
  }
  return total;
};

/** the corners of an n×n plaquette at (x,y), in order */
const plaquette = (x: number, y: number, n: number): V[] => {
  const pts: V[] = [];
  for (let i = 0; i < n; i++) pts.push(north(x + i, y));
  for (let i = 0; i < n; i++) pts.push(north(x + n, y + i));
  for (let i = 0; i < n; i++) pts.push(north(x + n - i, y + n));
  for (let i = 0; i < n; i++) pts.push(north(x, y + n - i));
  return pts;
};

let seed = 20260815;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

export function holonomyReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. THE CONTINUUM HALF IS RIGHT: THE HOLONOMY IS THE SWEPT SOLID ANGLE");
  line("=".repeat(78));
  line();
  line("     plaquette          transported     solid angle     difference");
  const loops: [string, V[]][] = [
    ["(0,0) 1×1", plaquette(0, 0, 1)],
    ["(1.5,0.7) 1×1", plaquette(1.5, 0.7, 1)],
    ["(0,0) 2×2", plaquette(0, 0, 2)],
    ["(3,3) 1×1", plaquette(3, 3, 1)],
  ];
  for (const [name, lp] of loops) {
    const h = holonomy(lp), s = solidAngle(lp);
    line(`     ${name.padEnd(18)}${h.toExponential(3).padStart(12)}` +
      `${s.toExponential(3).padStart(16)}${Math.abs(Math.abs(h) - Math.abs(s)).toExponential(1).padStart(15)}`);
  }
  line();
  line("  Parallel transport of a frame vector round the loop picks up the");
  line("  solid angle the north swept, which is the arc's claim and is a");
  line("  textbook fact about a sphere. Nothing on the lattice is needed for");
  line("  it — only that the axis turns.");
  line();
  line("  Note it gives Ω and not Ω/2. See §4.");
  line();
  line("  And it is gauge-invariant. Redefine where azimuth zero sits at every");
  line("  site independently, by a random amount, and the loop is untouched:");
  line();

  // A gauge here is a choice of where azimuth zero sits at each site. Build
  // the holonomy the way a lattice gauge theory does — sum the link advances,
  // each measured between the two sites' OWN reference directions — and do it
  // under random per-site choices. The φ(x) enter every link twice with
  // opposite signs, so a closed loop cannot see them; an open path can.
  const gaugedLoop = (lp: V[], phi: number[]) => {
    const frame = (n: V, p: number): V => {
      const s: V = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const e1 = unit(cross(n, s)), e2 = cross(n, e1);
      return unit(add(mul(e1, Math.cos(p)), mul(e2, Math.sin(p))));
    };
    let total = 0;
    for (let i = 0; i < lp.length; i++) {
      const a = lp[i], b = lp[(i + 1) % lp.length];
      const va = transport(a, b, frame(a, phi[i]));
      const vb = frame(b, phi[(i + 1) % lp.length]);
      total += Math.atan2(dot(cross(va, vb), b), dot(va, vb));
    }
    // each link is measured mod a turn, so the loop is too — wrap into (−π, π]
    const wrapped = total - 2 * Math.PI * Math.round(total / (2 * Math.PI));
    return wrapped;
  };

  let worst = 0, openSpread = 0;
  for (const [, lp] of loops) {
    const base = gaugedLoop(lp, new Array(lp.length).fill(0));
    const opens: number[] = [];
    for (let t = 0; t < 50; t++) {
      const phi = lp.map(() => 2 * Math.PI * rnd());
      worst = Math.max(worst, Math.abs(gaugedLoop(lp, phi) - base));
      // the same sum along an OPEN path, which is the control: it must move
      const a = lp[0], b = lp[1];
      const fa = (() => { const s: V = Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
        const e1 = unit(cross(a, s)), e2 = cross(a, e1);
        return unit(add(mul(e1, Math.cos(phi[0])), mul(e2, Math.sin(phi[0])))); })();
      const fb = (() => { const s: V = Math.abs(b[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
        const e1 = unit(cross(b, s)), e2 = cross(b, e1);
        return unit(add(mul(e1, Math.cos(phi[1])), mul(e2, Math.sin(phi[1])))); })();
      const va = transport(a, b, fa);
      opens.push(Math.atan2(dot(cross(va, fb), b), dot(va, fb)));
    }
    openSpread = Math.max(openSpread, Math.max(...opens) - Math.min(...opens));
  }
  line(`     closed loop, 200 random site gauges: max deviation  ${worst.toExponential(1)}`);
  line(`     one open link, the control:          spread         ${openSpread.toFixed(3)} rad`);
  line();
  line("  The loop does not move — up to whole turns, which is all a phase is");
  line("  ever defined to — and a single link moves by the whole circle. That");
  line("  is the distinction being claimed, measured rather than asserted.");
  line();
  line("  Which is the whole of why a phase around a loop is observable and a");
  line("  phase at a point is not: the equator has no marked point on it, and");
  line("  gauge invariance is that absence.");

  line();
  line("=".repeat(78));
  line("2. AND A QUANTISED RING MAKES ALL OF IT IDENTICALLY ZERO");
  line("=".repeat(78));
  line();
  line("  The arc's ring has CYCLE = 8 members, so the smallest move the phase");
  line(`  can make is SPIN = ${SPIN.toFixed(4)} rad = 45°. What does a smooth`);
  line("  texture actually ask of it per step?");
  line();
  line("     plaquette          advance per step (rad)     as a fraction of SPIN");
  for (const [name, lp] of loops) {
    let biggest = 0;
    for (let i = 0; i < lp.length; i++) {
      const a = lp[i], b = lp[(i + 1) % lp.length];
      const seedv: V = Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const v0 = unit(cross(a, seedv));
      const v1 = transport(a, b, v0);
      const s2: V = Math.abs(b[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const ref = unit(cross(b, s2));
      biggest = Math.max(biggest,
        Math.abs(Math.atan2(dot(cross(v1, ref), b), dot(v1, ref))));
    }
    line(`     ${name.padEnd(18)}${biggest.toExponential(3).padStart(18)}` +
      `${(biggest / SPIN).toExponential(2).padStart(24)}`);
  }
  line();
  line("  One to two orders of magnitude under one quantum. So if the phase");
  line("  is ON the ring — an integer index k, moving by whole steps — every");
  line("  advance rounds to nothing:");
  line();
  line("     plaquette          quantised holonomy    continuum holonomy");
  for (const [name, lp] of loops) {
    // the honest quantised transport: accumulate the index, snapping each step
    let k = 0, resid = 0;
    for (let i = 0; i < lp.length; i++) {
      const a = lp[i], b = lp[(i + 1) % lp.length];
      const seedv: V = Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const v0 = unit(cross(a, seedv));
      const v1 = transport(a, b, v0);
      const s2: V = Math.abs(b[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
      const ref = unit(cross(b, s2));
      const adv = Math.atan2(dot(cross(v1, ref), b), dot(v1, ref));
      const steps = Math.round(adv / SPIN);
      k += steps; resid += adv - steps * SPIN;
    }
    line(`     ${name.padEnd(18)}${(k * SPIN).toExponential(3).padStart(16)}` +
      `${holonomy(lp).toExponential(3).padStart(22)}`);
  }
  line();
  line("  Identically zero on every loop tested, and it is not a matter of");
  line("  finding a texture that twists harder: a texture that advanced a whole");
  line("  45° per lattice step would turn the north right over in eight cells,");
  line("  which is not a texture, it is noise.");
  line();
  line("     SO THE ARC ASSERTS TWO THINGS THAT CANNOT BOTH HOLD.");
  line();
  line("     the ring       phase ∈ {0..7}, quantum 45°, a discrete U(1)");
  line("     the flux       holonomy = swept solid angle, continuous, ~1e−2 rad");
  line();
  line("  Take the ring and there is no Aharonov–Bohm, no flux from any smooth");
  line("  texture, and nothing for minimal coupling to couple to. Take the flux");
  line("  and the phase is continuous, which is fine — but then it is not the");
  line("  eight vacant directions, and the whole 'the lattice left exactly the");
  line("  right amount of room for it' argument goes with it, because eight");
  line("  directions is not a continuum.");

  line();
  line("=".repeat(78));
  line("3. THE THIRD OPTION, WHICH THE ARC DOES NOT CONSIDER");
  line("=".repeat(78));
  line();
  line("  Keep the ring and let the strand be a SUPERPOSITION over its members");
  line("  rather than sitting on one. Then the advance is an expectation and");
  line("  need not be a whole step: a distribution over the eight, rotated by");
  line("  a small angle, is a nearby distribution over the eight.");
  line();
  line("     advance asked    ⟨k⟩ before    ⟨k⟩ after    realised advance");
  for (const adv of [1e-4, 1e-2, 0.1, SPIN]) {
    // a von-Mises-ish distribution on the ring, rotated
    const w = (mu: number) => {
      const p = Array.from({ length: CYCLE }, (_, k) => Math.exp(2 * Math.cos(k * SPIN - mu)));
      const z = p.reduce((a, b) => a + b);
      return p.map(v => v / z);
    };
    const ang = (p: number[]) => {
      let c = 0, s = 0;
      p.forEach((v, k) => { c += v * Math.cos(k * SPIN); s += v * Math.sin(k * SPIN); });
      return Math.atan2(s, c);
    };
    const before = ang(w(0)), after = ang(w(adv));
    line(`     ${adv.toExponential(1).padStart(12)}${before.toExponential(2).padStart(14)}` +
      `${after.toExponential(2).padStart(13)}${(after - before).toExponential(3).padStart(20)}`);
  }
  line();
  line("  The realised advance tracks the asked-for one down to 1e−4, so a");
  line("  superposition on the eight-member ring carries a continuous phase");
  line("  while the ring stays discrete. That is the ordinary relationship");
  line("  between a finite basis and a continuous parameter, and it is what the");
  line("  arc needs if it wants to keep both halves of what it has claimed.");
  line();
  line("  It is not free either: it makes the phase an amplitude over the eight");
  line("  rather than a position among them, which is a bigger object than the");
  line("  'one of eight vacant directions' the arc costed. Whether Layer 1 has");
  line("  room for THAT is a different count and is not done here.");

  line();
  line("=".repeat(78));
  line("4. AND Ω/2 AND g = 2 ARE ONE ASSUMPTION USED TWICE");
  line("=".repeat(78));
  line();
  line("  §1 measures Ω. The arc's own table reports Φ = Ω/2 and calls the half");
  line("  a flux normalisation; four sections later the same half reappears as");
  line("  g = 2, presented as a consequence of the lattice's double cover — a");
  line("  directed north returning after 8 steps where an undirected axis");
  line("  returns after 4.");
  line();
  line("     THE HALF IS THE DOUBLE COVER. Writing Ω/2 in the flux table");
  line("     already inserts the thing that g = 2 is then derived from.");
  line();
  line("  That is not a refutation of either. It is a statement that the book");
  line("  is entitled to exactly one of them as an assumption and must get the");
  line("  other as a result, and at the moment it takes both as given. Pick");
  line("  which one is primitive.");

  return L.join("\n");
}

console.log(holonomyReport());
