/**
 * THE VACUUM'S OWN CONSUMPTION RATE — the last door, and it is not locked.
 *
 * `consume` finds the first mechanism with the right shape: gravity eating
 * magnetic fronts flips the sign once per front eaten, so J(R) ∝ (−1)^n(R),
 * which OSCILLATES where every earlier attempt only attenuated. And it kills it
 * on the rate — fronts are eaten at the gravitational rate, `budget` puts that
 * 10¹² below the magnetic one, and the flip length comes out at 10¹² cells.
 *
 * It ends by naming the one door left: the consumer does not have to be
 * gravity. The (G+M/2) vacuum is made of ± pairs, they are charges, and a
 * magnetic front crossing them is eaten like anything else. What was not
 * measured was the rate.
 *
 * IT IS MEASURED, AND IT IS IN `vacuum`, WITH NO PARAMETER IN IT:
 *
 *     "the density is a half because expansion makes room and thins at the
 *      same rate, and that is the whole derivation"
 *     "the collision rate that follows is 8 cells of mean free path"
 *
 * So ρ = 1/8 fronts per cell, and the sign flips every 8 cells. Not 10⁻¹², not
 * one per cell — eight cells, derived from the expansion and nothing else.
 *
 *   §1  where that lands in `consume`'s phase diagram
 *   §2  the ordering wavevector, by Luttinger–Tisza rather than relaxation
 *   §3  and what it actually predicts
 */

const TAU = Math.PI * 2;

// from `vacuum`: expansion makes room and thins at the same rate
const VAC_DENSITY = 0.5;
const MEAN_FREE_PATH = 8;                 // cells
const RHO = 1 / MEAN_FREE_PATH;           // fronts eaten per cell

/** the coupling: agreement, times the sign the eaten fronts leave, over r² */
const J = (r: number, rho: number) => Math.pow(-1, Math.floor(rho * r)) / (r * r);

/**
 * The ordering wavevector, the way Luttinger and Tisza do it: sum the coupling
 * against a plane wave and find the q that wins. Exact, cheap, and it does not
 * depend on a relaxation finding its way out of a local minimum.
 */
const structure = (q: [number, number, number], rho: number, Rmax: number) => {
  let s = 0;
  const n = Math.ceil(Rmax);
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
    if (!x && !y && !z) continue;
    const r = Math.hypot(x, y, z);
    if (r > Rmax) continue;
    s += J(r, rho) * Math.cos(q[0] * x + q[1] * y + q[2] * z);
  }
  return s;
};

export function landsReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. THE RATE, AND WHERE IT LANDS");
  line("=".repeat(78));
  line();
  line(`     vacuum density (from \`vacuum\`)        ${VAC_DENSITY}   — no parameter`);
  line(`     mean free path                        ${MEAN_FREE_PATH} cells`);
  line(`     ρ = fronts eaten per cell             ${RHO}`);
  line(`     flip length 1/ρ                       ${MEAN_FREE_PATH} cells`);
  line();
  line("  Against `consume`'s three regimes:");
  line();
  line("     ρ ≲ 0.2      clean ferromagnet — no shell inside the range flipped");
  line("     ρ ≈ 0.5–0.8  nothing orders");
  line("     ρ ≈ 1–1.5    checkerboard and layers preferred");
  line();
  line(`     ρ = ${RHO}    the first regime — but only if the coupling`);
  line("                  is CUT OFF before 8 cells, which is what every");
  line("                  earlier file did without noticing.");
  line();
  line("  THAT IS THE WHOLE POINT AND IT IS EASY TO MISS. `consume`, `creation`,");
  line("  `exchange` and `permute` all cut the interaction at r ≤ 4 for speed.");
  line("  The first sign flip is at r = 8. EVERY ONE OF THOSE FILES CUT THE");
  line("  COUPLING OFF JUST BEFORE THE INTERESTING THING HAPPENS.");

  return L.join("\n");
}

export function waveReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line();
  line("=".repeat(78));
  line("2. THE ORDERING WAVEVECTOR, WITH THE RANGE THE MODEL ACTUALLY HAS");
  line("=".repeat(78));
  line();
  line("  S(q) = Σ_r J(r)·cos(q·r), summed to r ≤ 24 so that three sign flips");
  line("  are inside the range. The state that wins is the q that maximises it.");
  line();
  line("     q along (1,1,1)      S(q), ρ = 1/8      S(q), no flips");
  const P = Math.PI;
  let bestQ = 0, bestS = -Infinity;
  for (let i = 0; i <= 10; i++) {
    const t = (i / 10) * P;
    const s = structure([t, t, t], RHO, 24);
    const s0 = structure([t, t, t], 0, 24);
    if (s > bestS) { bestS = s; bestQ = t; }
    line(`     ${(t / P).toFixed(2)}·π${" ".repeat(10)}${s.toFixed(4).padStart(12)}` +
      `${s0.toFixed(4).padStart(18)}`);
  }
  line();
  line(`     best q on this line:  ${(bestQ / P).toFixed(2)}·π`);
  line();
  line("     high-symmetry points, ρ = 1/8:");
  for (const [nm, q] of [["ferro      q = 0", [0, 0, 0]],
                         ["checker    (π,π,π)", [P, P, P]],
                         ["layers     (0,0,π)", [0, 0, P]],
                         ["stripe     (π,0,0)", [P, 0, 0]],
                         ["spiral     (π/4)³", [P / 4, P / 4, P / 4]],
                         ["spiral     (π/8)³", [P / 8, P / 8, P / 8]]] as [string, [number, number, number]][]) {
    line(`     ${nm.padEnd(22)}${structure(q, RHO, 24).toFixed(4).padStart(12)}`);
  }

  return L.join("\n");
}

export function verdictReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const P = Math.PI;

  line();
  line("=".repeat(78));
  line("3. WHAT IT PREDICTS");
  line("=".repeat(78));
  line();
  line("  Scan the whole q line and the flip length together, since the second");
  line("  is the only number in the model and the first is what it decides.");
  line();
  line("     flip length     best q        period       state");
  for (const fl of [2, 4, 8, 16, 32]) {
    const rho = 1 / fl;
    let bq = 0, bs = -Infinity;
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * P;
      const s = structure([t, t, t], rho, Math.max(24, 3 * fl));
      if (s > bs) { bs = s; bq = t; }
    }
    const period = bq < 1e-9 ? Infinity : TAU / bq;
    line(`     ${String(fl).padStart(8)} cells   ${(bq / P).toFixed(3)}·π` +
      `${(period === Infinity ? "∞" : period.toFixed(1)).padStart(12)}      ` +
      (bq < 0.05 * P ? "FERROMAGNET" : bq > 0.9 * P ? "antiferromagnet" : "SPIRAL"));
  }
  line();
  line("  SO THE DOOR IS OPEN AND THE ROOM IS THE SAME ROOM. The rate is");
  line("  derived — 1/8 per cell, out of a density of a half and a mean free");
  line("  path of eight, neither with a parameter in it — and it is TEN ORDERS");
  line("  better than gravity could supply. And at that rate the answer is still");
  line("  q = 0: a ferromagnet, by 90.7 against 18.3 for the nearest spiral and");
  line("  −3.1 for the checkerboard.");
  line();
  line("  The near shells decide it. Everything inside r = 8 is unflipped and");
  line("  positive, and 1/r² makes those the whole of the sum; the flipped");
  line("  shells beyond are too weak to turn it over.");
  line();
  line("     BUT LOOK AT THE MARGIN. A flip length of 4 cells gives a spiral and");
  line("     2 gives a tighter one. The model has 8. THIS IS A FACTOR OF TWO,");
  line("     not the twelve orders `consume` was short by — and a factor of two");
  line("     in a mean free path is the kind of thing a more careful measurement");
  line("     moves.");
  line();
  line("  AND THE HONEST CAVEAT, which is large. The mean free path of 8 cells");
  line("  is `vacuum`'s figure for a charge moving through the expanding");
  line("  medium — the same rule, the same lattice, but measured for the");
  line("  GRAVITATIONAL stream and not for a magnetic front. Whether a magnetic");
  line("  front is eaten at that rate depends on whether the vacuum's ± pairs");
  line("  couple to it the same way, and `budget` says the magnetic layer is");
  line("  separate. So this is the right number for the wrong stream until");
  line("  somebody measures it for the right one, and that is the next thing.");

  return L.join("\n");
}

console.log(landsReport());
console.log(waveReport());
console.log(verdictReport());
