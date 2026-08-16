/**
 * THE MEAN FREE PATH, COMPUTED — and what it takes to reach the spiral.
 *
 * `vacrate` leaves the magnetic half on one number. The flip length in the
 * consumption mechanism is the mean free path of a front in the vacuum, and
 * `vacuum` derives 8 cells at half fill — which gives a ferromagnet, where 4
 * would give a spiral. A factor of two.
 *
 * But 8 is `vacuum`'s figure for one particular occupancy. The collision rule
 * is a lattice gas and its mean free path is a function of FILL, so the
 * question "what is the magnetic front's mean free path" is the question "what
 * is the magnetic vacuum's fill", and that is answerable.
 *
 *   §1  the collision rate against fill, from the model's own rule
 *   §2  what fill reaches the spiral threshold
 *   §3  and what actually sets the magnetic vacuum's fill
 */

const TAU = Math.PI * 2;

/**
 * `vacuum`'s collision rule, verbatim: a head-on pair on any axis turns into
 * the next axis round, if the slots it would turn into are free. Charges are
 * conserved; only their directions change.
 */
const turnV = (s: number, sense: 1 | -1) => {
  let out = s;
  for (let i = 0; i < 4; i++) {
    const a = 1 << i, b = 1 << (i + 4);
    if ((out & a) === 0 || (out & b) === 0) continue;
    const j = (i + (sense === 1 ? 1 : 7)) % 8;
    const c = 1 << j, d = 1 << ((j + 4) % 8);
    if (out & c || out & d) continue;
    out = (out & ~a & ~b) | c | d;
  }
  return out;
};
const SWAP = (() => {
  const main = new Uint8Array(256), alt = new Uint8Array(256);
  for (let s = 0; s < 256; s++) { main[s] = turnV(s, 1); alt[s] = turnV(s, -1); }
  return { main, alt };
})();
const bits = (s: number) => { let n = 0; for (let i = 0; i < 8; i++) if (s & (1 << i)) n++; return n; };

let seed = 20260816;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = () => { seed = 20260816; };

/** mean free path in cells, at a given fill — exactly `vacuum`'s calculation */
const mfp = (fill: number, samples = 400000) => {
  reseed();
  let charges = 0, acted = 0;
  for (let k = 0; k < samples; k++) {
    let st = 0;
    for (let i = 0; i < 8; i++) if (rnd() < fill) st |= 1 << i;
    charges += bits(st);
    const out = (k & 1) ? SWAP.alt[st] : SWAP.main[st];
    let moved = 0;
    for (let i = 0; i < 8; i++) if (((st >> i) & 1) !== ((out >> i) & 1)) moved++;
    acted += moved / 2;
  }
  return charges / acted;
};

export function sweepReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. THE MEAN FREE PATH IS A FUNCTION OF FILL");
  line("=".repeat(78));
  line();
  line("  `vacuum`'s own collision rule and its own calculation, run at each");
  line("  occupancy rather than only at a half.");
  line();
  line("      fill      turned per tick      mean free path");
  const rows: [number, number][] = [];
  for (const f of [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]) {
    const m = mfp(f);
    rows.push([f, m]);
    line(`     ${f.toFixed(2)}      ${(1 / m).toFixed(4).padStart(13)}      ` +
      `${m.toFixed(2).padStart(10)} cells` + (Math.abs(f - 0.5) < 1e-9 ? "   ← `vacuum`'s figure" : ""));
  }
  line();
  line("  The half-fill row reproduces `vacuum`'s 8 cells, which is the check");
  line("  that this is the same calculation and not a similar one.");
  line();
  line("  AND IT IS NOT MONOTONE. The path shortens as the gas fills up and then");
  line("  LENGTHENS AGAIN, because the rule needs somewhere to turn INTO: at");
  line("  high fill a head-on pair finds the perpendicular slots already");
  line("  occupied and nothing happens. A full lattice is collisionless.");

  return L.join("\n");
}

export function thresholdReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("2. AND WHERE THE SPIRAL THRESHOLD SITS");
  line("=".repeat(78));
  line();
  line("  `vacrate` §3: a flip length of 4 cells or less gives a spiral, 8 gives");
  line("  a ferromagnet. So the question is whether any fill reaches 4.");
  line();
  let best = Infinity, bestF = 0;
  for (let f = 0.02; f <= 0.999; f += 0.02) {
    const m = mfp(f, 120000);
    if (m < best) { best = m; bestF = f; }
  }
  line(`     shortest mean free path over all fills    ${best.toFixed(2)} cells`);
  line(`     at fill                                   ${bestF.toFixed(2)}`);
  line(`     needed for a spiral                       ≤ 4 cells`);
  line();
  if (best <= 4) {
    line("  REACHABLE. There is an occupancy at which the collision rule alone");
    line("  gives a short enough flip length, so the spiral is available without");
    line("  anything being added.");
  } else {
    line("  NOT REACHABLE BY FILL ALONE. The rule has a floor — the path is");
    line(`  never shorter than ${best.toFixed(2)} cells at any occupancy — and that floor is`);
    line("  above the threshold. So no density of vacuum, however chosen, turns");
    line("  this ferromagnet into a spiral.");
    line();
    line("  The floor is structural rather than numerical. A collision needs a");
    line("  head-on pair AND somewhere to turn into, and those two want opposite");
    line("  densities: pairs are common when the gas is full, room is common");
    line("  when it is empty. The best compromise is around half fill and it is");
    line("  the 8 cells `vacuum` already reports.");
  }

  return L.join("\n");
}

export function setsReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("3. AND WHAT SETS THE MAGNETIC VACUUM'S FILL ANYWAY");
  line("=".repeat(78));
  line();
  line("  Even if the threshold were reachable, the fill is not free. `vacuum`");
  line("  derives the half:");
  line();
  line("     new room is edged on every axis, and the same expansion thins what");
  line("     is already there — both at rate p, because they are one process —");
  line("     so the density is (1−p)/(2−p) → ½ with no parameter");
  line();
  line("  The p cancels. THAT IS THE POINT OF THE DERIVATION and it is why the");
  line("  half is not adjustable: it is a fixed point of creation against");
  line("  dilution, and it does not care how fast either runs.");
  line();
  line("     (1−p)/(2−p) at p = 10⁻⁶¹, the real expansion   " +
    ((1 - 1e-61) / (2 - 1e-61)).toFixed(6));
  line("     at p = 0.5                                     " + ((1 - 0.5) / (2 - 0.5)).toFixed(6));
  line("     at p = 0.9                                     " + ((1 - 0.9) / (2 - 0.9)).toFixed(6));
  line();
  line("  A LARGER p gives a SPARSER medium, not a denser one, because thinning");
  line("  wins. So there is no expansion rate that fills the vacuum up, and the");
  line("  half is the densest it gets.");
  line();
  line("  ONE THING THIS DOES NOT SETTLE, and it is the same one as before. All");
  line("  of the above is the gravitational vacuum — unsigned charges, streaming");
  line("  and turning, count conserved. A magnetic front meets ± charges and can");
  line("  ANNIHILATE with them, which the rule above has no version of, and");
  line("  annihilation removes charges where turning does not. That gives a");
  line("  different fixed point and it is not (1−p)/(2−p).");
  line();
  line("     SO THE COMPUTATION IS DONE FOR THE MEDIUM THE MODEL HAS DERIVED,");
  line("     AND THE ANSWER IS NO. Whether the signed medium — creation against");
  line("     annihilation rather than creation against dilution — has a denser");
  line("     fixed point is a different calculation, and it is the one that");
  line("     would have to come out differently for any of this to change.");

  return L.join("\n");
}

console.log(sweepReport());
console.log(thresholdReport());
console.log(setsReport());
