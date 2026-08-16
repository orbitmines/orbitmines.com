/**
 * GRAVITY EATING MAGNETIC FRONTS — the one mechanism that can oscillate.
 *
 * `screen`, `signs`, `vacsign` and `pernode` all go looking for a coupling
 * whose sign depends on distance and all come back with attenuation. The
 * reason is the same every time: whatever they multiply by is bounded in
 * [0, 1], and a positive factor cannot invert anything.
 *
 * THIS ONE IS DIFFERENT, and the difference is that it does not multiply. A
 * source's train ALTERNATES — the arc says so throughout, a source flips and
 * lays down bands of one sign then the other, half a wavelength apart. So the
 * sign present at distance d is
 *
 *     s(d) = s₀ · (−1)^⌊2d/λ⌋
 *
 * and if something REMOVES a front from the train, the next one along takes
 * its place — and the next one is the opposite sign. Consuming n fronts flips
 * the effective sign n times.
 *
 * Gravity is the something. Both streams are pulses on the same lattice, and
 * a gravitational pulse meeting a magnetic one annihilates it like anything
 * else. So the number of fronts eaten between two sources grows with the
 * distance between them, and the sign flips once per front.
 *
 *     J(R) ∝ (−1)^(n(R))       n(R) = fronts eaten over a distance R
 *
 * That is an oscillation and not an attenuation, and it is the first thing in
 * this book with the right shape.
 *
 *   §1  deterministic consumption oscillates; stochastic consumption decays
 *   §2  what it takes to make an antiferromagnet
 *   §3  and whether the model's own numbers supply it
 */

const TAU = Math.PI * 2;

let seed = 20260816;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = (s = 20260816) => { seed = s; };

/**
 * The effective sign of the coupling between two sources a distance R apart,
 * when gravity eats fronts at a rate `rho` per cell.
 *
 * `deterministic` is the aggregate reading — a steady stream of gravitational
 * pulses eats a steady number of magnetic fronts, so n(R) = ⌊ρ·R⌋. `stochastic`
 * draws each consumption independently, which is what a per-event reading gives.
 */
const effSign = (R: number, rho: number, deterministic: boolean) => {
  if (deterministic) return Math.pow(-1, Math.floor(rho * R));
  let n = 0;
  for (let i = 0; i < R; i++) if (rnd() < rho) n++;
  return Math.pow(-1, n);
};

const meanSign = (R: number, rho: number, deterministic: boolean, trials = 4000) => {
  if (deterministic) return effSign(R, rho, true);
  let acc = 0;
  for (let t = 0; t < trials; t++) { reseed(4242 + t * 7919); acc += effSign(R, rho, false); }
  return acc / trials;
};

export function shapeReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. DETERMINISTIC CONSUMPTION OSCILLATES; RANDOM CONSUMPTION DECAYS");
  line("=".repeat(78));
  line();
  line("  ρ = 0.25 fronts eaten per cell, so a flip every four cells.");
  line();
  line("       R      deterministic      stochastic");
  for (const R of [1, 2, 4, 6, 8, 12, 16, 24, 32]) {
    const d = meanSign(R, 0.25, true);
    const st = meanSign(R, 0.25, false);
    line(`     ${String(R).padStart(4)}   ${d.toFixed(4).padStart(13)}   ${st.toFixed(4).padStart(13)}`);
  }
  line();
  line("  THE DETERMINISTIC COLUMN CHANGES SIGN and keeps changing it. The");
  line("  stochastic one decays to nought as (1−2ρ)^R and never goes negative,");
  line("  which is the same failure every earlier attempt hit — averaging a");
  line("  random number of flips is an attenuation.");
  line();
  line("  So the mechanism turns on WHETHER THE CONSUMPTION IS A RATE OR A");
  line("  COIN. In this model it is a rate: mass is pulses per tick, the");
  line("  gravitational stream is steady, and the number of magnetic fronts it");
  line("  eats over a stretch is that rate times the stretch. The randomness is");
  line("  in which front, not in how many.");
  line();
  line("     WHICH IS WHY THIS WORKS WHERE THE OTHERS DID NOT. A shadow, a");
  line("     screening and a vacuum charge are all things that MIGHT stop a");
  line("     pulse. This is something that reliably DOES, and reliability is");
  line("     what turns a decay into an oscillation.");

  return L.join("\n");
}

const RING = 8;
type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const cube = (L: number): V[] => {
  const out: V[] = [];
  const h = (L - 1) / 2;
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < L; k++)
    out.push([i - h, j - h, k - h]);
  return out;
};

const bestOrder = (at: V[], k: number[]) => {
  const QS: [string, V][] = [
    ["ferro", [0, 0, 0]], ["checker", [Math.PI, Math.PI, Math.PI]],
    ["layers", [0, 0, Math.PI]], ["stripe", [Math.PI, 0, 0]],
  ];
  let best = 0, name = "none";
  for (const [nm, q] of QS) {
    let c = 0, s = 0;
    at.forEach((p, i) => {
      const w = Math.cos(q[0] * p[0] + q[1] * p[1] + q[2] * p[2]);
      c += w * Math.cos(TAU * k[i] / RING); s += w * Math.sin(TAU * k[i] / RING);
    });
    const v = Math.hypot(c, s) / at.length;
    if (v > best) { best = v; name = nm; }
  }
  return { best, name };
};

/** relax with J(R) = (−1)^⌊ρR⌋ / R² */
const settle = (at: V[], rho: number, steps = 150) => {
  const k = at.map(() => Math.floor(rnd() * RING));
  const nb = at.map((p, i) => at.map((q, j) => ({ j, r: len(sub(p, q)) }))
    .filter(x => x.j !== i && x.r <= 4));
  for (let t = 0; t < steps; t++) {
    let moved = 0;
    for (let i = 0; i < at.length; i++) {
      let best = k[i], bd = -Infinity;
      for (let c = 0; c < RING; c++) {
        let acc = 0;
        for (const { j, r } of nb[i]) {
          const agree = Math.cos(TAU * (c - k[j]) / RING);
          acc += agree * Math.pow(-1, Math.floor(rho * r)) / (r * r);
        }
        if (acc > bd) { bd = acc; best = c; }
      }
      if (best !== k[i]) { k[i] = best; moved++; }
    }
    if (!moved) break;
  }
  return k;
};

export function orderReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("2. AND WHAT IT TAKES TO MAKE AN ANTIFERROMAGNET");
  line("=".repeat(78));
  line();
  line("  J(R) = (−1)^⌊ρR⌋/R², relaxed on blocks. ρ is fronts eaten per cell,");
  line("  so 1/ρ is how far a pulse goes before the sign has flipped once.");
  line();
  line("        ρ       flip every      L = 5            L = 7            L = 9");
  for (const rho of [0, 0.2, 0.5, 0.8, 1.0, 1.5, 2.0]) {
    const cells: string[] = [];
    for (const Lb of [5, 7, 9]) {
      const at = cube(Lb);
      reseed();
      const o = bestOrder(at, settle(at, rho));
      cells.push(`${o.best.toFixed(3)} ${o.name.padEnd(8)}`);
    }
    line(`     ${rho.toFixed(1).padStart(5)}   ${(rho ? (1 / rho).toFixed(1) + " cells" : "never").padStart(12)}` +
      `    ${cells.join(" ")}`);
  }
  line();
  line("  Read it honestly. The ferromagnet at ρ ≤ 0.2 is clean (1.000) and the");
  line("  one at ρ = 2.0 is clean again — every shell flips twice there, so the");
  line("  sign is back where it started. Between them the state STOPS BEING");
  line("  FERRO: at ρ = 0.5–0.8 nothing orders at all, and at ρ = 1.0–1.5 the");
  line("  best wavevector is a checkerboard or layers rather than uniform,");
  line("  at 0.38 to 0.78 — a preference for antiparallel that does not");
  line("  reach an ordered state at these sizes.");
  line();
  line("  So the mechanism DOES what none of the others did: it makes the near");
  line("  shells prefer misalignment. Whether that becomes a clean");
  line("  antiferromagnet wants the same finite-size scaling `confirm` ran, and");
  line("  it is not done here. What is settled is the shape, and the shape is");
  line("  the thing that was missing.");

  return L.join("\n");
}

export function numbersReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("3. AND WHETHER THE MODEL'S OWN NUMBERS SUPPLY IT");
  line("=".repeat(78));
  line();
  line("  ρ ≥ 1 means the gravitational stream eats at least one magnetic front");
  line("  per cell crossed. That is a ratio between the two streams' densities,");
  line("  and `budget` has measured it — from the other side, and badly for");
  line("  this proposal.");
  line();
  line("     a 1 cm N52 cube must emit MAGNETICALLY as if it weighed 4.5 tonnes");
  line("     against its actual 7.5 g, and two touching cubes pull 2.2·10¹²");
  line("     times their own gravity");
  line();
  line("  So the magnetic stream outnumbers the gravitational one by of order");
  line("  10¹². A gravitational pulse eats a magnetic front when it meets one,");
  line("  so fronts are eaten at the GRAVITATIONAL rate, and that is 10⁻¹² per");
  line("  magnetic front rather than one per cell.");
  line();
  line("     ρ needed for an antiferromagnet      ≳ 1 per cell");
  line("     ρ the two budgets allow              ~ 10⁻¹²");
  line("     flip length that gives              ~ 10¹² cells = 1.6·10⁻²³ m");
  line();
  line("  TWELVE ORDERS SHORT, and the flip length is still 10¹³ times smaller");
  line("  than an atom. So the mechanism is right and the rate is not: gravity");
  line("  is far too weak a consumer of magnetic fronts to flip anything on any");
  line("  scale that matters.");
  line();
  line("     WHICH IS THE SAME WALL, IN A NEW PLACE. `budget`'s whole point is");
  line("     that magnetism cannot be a subset of the mass stream because it is");
  line("     10¹² times too strong. That ratio bought magnetism its own layer,");
  line("     and it is the same ratio that stops the mass layer from being able");
  line("     to reach back and modulate it.");
  line();
  line("  ONE THING IT DOES NOT RULE OUT, and it is worth writing down because");
  line("  it is the only door left. The consumer does not have to be gravity.");
  line("  Anything with a steady density that eats magnetic fronts at ~1 per");
  line("  cell would do it, and the vacuum's own ± pairs from (G+M/2) are");
  line("  present at whatever density the expansion sets. `pernode` shows those");
  line("  pairs mediate coherently; what is not measured anywhere is the rate at");
  line("  which they CONSUME. If that rate is order one per cell, this");
  line("  mechanism runs on the vacuum instead of on gravity and the numbers");
  line("  above do not apply.");

  return L.join("\n");
}

console.log(shapeReport());
console.log(orderReport());
console.log(numbersReport());
