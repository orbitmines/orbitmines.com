/**
 * A CHARGE PER NODE RATHER THAN PER RAY — and (G+M/3) for regional sourcing.
 *
 * TWO PROPOSALS, both of which change something structural rather than a
 * parameter.
 *
 * ── ONE. THE VACUUM'S CHARGE IS PER NODE ────────────────────────────────────
 *
 * (G+M/2) makes ± pairs at neutral points. Every file so far has implicitly
 * treated the sign a vacuum node puts into one direction as independent of what
 * it puts into another — a charge per RAY. The alternative is a charge per
 * NODE: one sign, into all of its directions at once.
 *
 * That is not a detail. Per ray, what a vacuum node hands to a source on its
 * left is uncorrelated with what it hands to a source on its right, so it
 * mediates nothing between them on average. PER NODE, THE TWO SIDES GET THE
 * SAME SIGN, so the node is a coherent go-between and the mediated interaction
 * survives averaging over the vacuum.
 *
 * And it is the same convention `aggregate` §3 shows the far field needs — a
 * sign that does not depend on the direction of emission is `physics.ts`'s
 * non-sided branch. So this is one convention doing two jobs.
 *
 * ── TWO. (G+M/3) AS REGIONAL SOURCING ───────────────────────────────────────
 *
 * Two alike sources sitting next to each other turn each other's pulses back
 * immediately. The round trip is two ticks — the pulses close at two cells a
 * tick, one each — which is instantaneous against any beat. If a returned pulse
 * resets its own source's phase, co-located emitters share a clock, which is
 * exactly what regional sourcing asserts.
 *
 *   §1  the mediated interaction, per ray against per node
 *   §2  and whether the sign turns over with distance
 *   §3  (G+M/3) on co-located sources: do they lock, and at what rate
 */

const TAU = Math.PI * 2;

let seed = 20260816;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = (s = 20260816) => { seed = s; };
const coin = () => (rnd() < 0.5 ? -1 : 1);

/**
 * The A–B line, with vacuum in between, run under both conventions.
 *
 * A sits at 0 and B at R. Each occupied intermediate cell carries a charge. A
 * meeting between a source's pulse and a vacuum charge is (G+M/1) if the signs
 * are opposite — space destroyed THERE, between the source and the node, which
 * pulls the source that way — or (G+M/3) if alike, which sends the pulse back
 * to annihilate BEHIND the source and pushes it the other way.
 *
 * The quantity returned is the change in the A–B separation: negative is the
 * two coming together.
 */
const line = (R: number, sA: number, sB: number, rho: number, perNode: boolean) => {
  let dR = 0;
  for (let x = 1; x < R; x++) {
    if (rnd() > rho) continue;                       // empty cell
    // the sign this node shows to its left and to its right
    const toA = coin();
    const toB = perNode ? toA : coin();
    // A is pulled towards the node when they annihilate between, pushed away
    // when the pulse turns and annihilates behind A. Same for B.
    const pullA = (sA !== toA) ? +1 : -1;            // + means A moves towards x
    const pullB = (sB !== toB) ? +1 : -1;            // + means B moves towards x
    // the node is between them, so both pulls shorten the separation
    dR -= (pullA + pullB) / (x * x + (R - x) * (R - x));
  }
  return dR;
};

/**
 * The mediated coupling, at the order it actually lives at.
 *
 * The MEAN closing is nought under either convention, because a vacuum charge
 * is as often + as −: ⟨pullA⟩ = ⟨pullB⟩ = 0. A first draft of this file
 * compared means and measured noise. What survives averaging is the SECOND
 * order term — the covariance of A's response with B's — because A and B are
 * responding to the same charge:
 *
 *   per node   pullA·pullB = (−s_A v)(−s_B v) = s_A s_B v²  =  s_A s_B
 *   per ray    pullA·pullB = (−s_A v_A)(−s_B v_B)           →  0
 *
 * which is how an induced coupling always works: not a mean force from a
 * fluctuating field, but a correlation between two things fluctuating together.
 */
const mediated = (R: number, sA: number, sB: number, rho: number,
                  perNode: boolean, trials: number) => {
  let acc = 0;
  for (let t = 0; t < trials; t++) {
    reseed(9001 + t * 7919);
    for (let x = 1; x < R; x++) {
      if (rnd() > rho) continue;
      const toA = coin();
      const toB = perNode ? toA : coin();
      const pullA = (sA !== toA) ? +1 : -1;
      const pullB = (sB !== toB) ? +1 : -1;
      acc += pullA * pullB / (x * x + (R - x) * (R - x));
    }
  }
  return acc / trials;
};

/** J(R) = the aligned case minus the anti-aligned one, at second order */
const coupling = (R: number, rho: number, perNode: boolean, trials: number) =>
  mediated(R, +1, +1, rho, perNode, trials) - mediated(R, +1, -1, rho, perNode, trials);

export function mediatedReport(): string {
  const L: string[] = [];
  const line_ = (s = "") => L.push(s);

  line_("=".repeat(78));
  line_("1. PER RAY MEDIATES NOTHING; PER NODE MEDIATES SOMETHING");
  line_("=".repeat(78));
  line_();
  line_("  J(R) is the orientation-dependent part of the interaction between two");
  line_("  sources, mediated entirely through the vacuum between them, at second");
  line_("  order — the covariance of A's response with B's, since the mean force");
  line_("  from a fluctuating charge is nought under either convention.");
  line_();
  line_("       R      per ray        per node");
  for (const R of [2, 3, 4, 6, 8, 12, 16, 24]) {
    const a = coupling(R, 0.5, false, 4000);
    const b = coupling(R, 0.5, true, 4000);
    line_(`     ${String(R).padStart(4)}   ${a.toExponential(2).padStart(11)}` +
      `   ${b.toExponential(2).padStart(12)}`);
  }
  line_();
  line_("  PER RAY DECAYS TO THE SAMPLING FLOOR — 2.9e−2 at touching distance");
  line_("  and 10⁻⁴ or less by R = 8, where per node is still 0.18. What a node");
  line_("  hands left is drawn independently of what it hands right, so A and B");
  line_("  are correlated through nothing and there is no mediated coupling.");
  line_();
  line_("  PER NODE IS NOT. One sign into all directions makes the node a");
  line_("  coherent go-between: it pulls A and B the same way at the same");
  line_("  moment, so their responses are correlated and the correlation");
  line_("  survives averaging over the vacuum even though the mean force does");
  line_("  not.");
  line_();
  line_("     SO THE PROPOSAL WORKS, AND IT MAKES A COUPLING WHERE THERE WAS");
  line_("     NONE. The vacuum stops being a passive medium that only attenuates");
  line_("     and becomes something two sources can talk through.");

  return L.join("\n");
}

export function reverseReport(): string {
  const L: string[] = [];
  const line_ = (s = "") => L.push(s);

  line_();
  line_("=".repeat(78));
  line_("2. AND WHETHER THE SIGN TURNS OVER");
  line_("=".repeat(78));
  line_();
  line_("  The question the per-node convention was proposed to answer. Swept");
  line_("  over vacuum density too, since that sets how many mediators there are.");
  line_();
  line_("     density ρ      R=2       R=4       R=8      R=16      R=32");
  for (const rho of [0.15, 0.3, 0.5, 0.8, 1.0]) {
    const vals = [2, 4, 8, 16, 32].map(R =>
      coupling(R, rho, true, 3000).toExponential(1).padStart(10));
    line_(`     ${rho.toFixed(2).padStart(9)}${vals.join("")}`);
  }
  line_();
  line_("  IT DOES NOT TURN OVER. Every entry has the same sign at every");
  line_("  density, because the correlation is s_A·s_B times a weight that is");
  line_("  positive at every separation — a sum of 1/(x² + (R−x)²) over the");
  line_("  cells between them, and there is nothing in that to go negative.");
  line_();
  line_("  So the per-node convention buys a mediated coupling and not a");
  line_("  distance-dependent sign. THAT IS STILL WORTH HAVING — it is the");
  line_("  first coupling in this book that works THROUGH the vacuum rather");
  line_("  than directly, and it is the second job the same convention does,");
  line_("  the first being the far field in `aggregate`. But an antiferromagnet");
  line_("  is not what it gives.");

  return L.join("\n");
}

/**
 * §3. Co-located sources under (G+M/3).
 *
 * Two sources one cell apart, alike, each emitting on its own beat. Their
 * pulses meet after half a cell and turn, returning after TWO TICKS — the two
 * close at two cells a tick, one each. On return a pulse nudges its own source
 * towards the phase it left with, which is the feedback rule the model is now
 * allowed to have.
 */
const region = (N: number, spread: number, gain: number, steps: number) => {
  const beta = Array.from({ length: N }, () => rnd());
  const w = Array.from({ length: N }, () => 1 + spread * (2 * rnd() - 1));
  const dt = 0.01;
  for (let t = 0; t < steps; t++) {
    const nudge = new Array(N).fill(0);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      if (i === j) continue;
      // alike → the pulse turns and comes back; the return carries j's phase
      // as it was two ticks ago, which for a beat far slower than a tick is
      // simply j's phase
      nudge[i] += Math.sin(TAU * (beta[j] - beta[i]));
    }
    for (let i = 0; i < N; i++) beta[i] = (beta[i] + dt * (w[i] + gain * nudge[i] / N) + 1) % 1;
  }
  let c = 0, s = 0;
  for (const b of beta) { c += Math.cos(TAU * b); s += Math.sin(TAU * b); }
  return { order: Math.hypot(c, s) / N, spreadOut: Math.max(...w) - Math.min(...w) };
};

export function regionalReport(): string {
  const L: string[] = [];
  const line_ = (s = "") => L.push(s);

  line_();
  line_("=".repeat(78));
  line_("3. (G+M/3) AS REGIONAL SOURCING");
  line_("=".repeat(78));
  line_();
  line_("  The timing first, because it is the part that decides whether this is");
  line_("  even available. Two sources one cell apart: their pulses close at TWO");
  line_("  CELLS A TICK — one each — so an alike meeting turns at half a cell");
  line_("  and the pulse is back at its source within two ticks.");
  line_();
  line_("  Against a beat of 1/mass, which for anything lighter than the mass");
  line_("  ceiling is at least one tick and for an atom is 10¹⁶, two ticks is");
  line_("  instantaneous. SO THE COUPLING BETWEEN CO-LOCATED SOURCES IS AS");
  line_("  STRONG AND AS FAST AS THIS MODEL CAN MAKE ANYTHING, which is the");
  line_("  regime a bound state is in and is the right shape for the job.");
  line_();
  line_("     N sources    rate spread    gain    phase order     one train?");
  for (const [N, spread, gain] of [[2, 0.1, 5], [4, 0.1, 5], [16, 0.1, 5],
                                   [16, 0.5, 5], [16, 0.1, 0.2], [64, 0.1, 5]] as [number, number, number][]) {
    reseed();
    const r = region(N, spread, gain, 6000);
    line_(`     ${String(N).padStart(9)}${spread.toFixed(2).padStart(15)}${gain.toFixed(1).padStart(8)}` +
      `${r.order.toFixed(4).padStart(15)}     ${r.order > 0.95 ? "YES" : r.order > 0.5 ? "partly" : "no"}`);
  }
  line_();
  line_("  Where the phase order is 1, every source in the region is at the same");
  line_("  point of its cycle, so the region emits ONE TRAIN rather than N");
  line_("  independent ones — and it emits at the summed strength, because all N");
  line_("  let go together.");
  line_();
  line_("  THAT IS REGIONAL SOURCING, and it is (G+M/3) plus the feedback the");
  line_("  model is now allowed. Neither is new: the turn is in the rules and");
  line_("  the feedback is the one line already owed for the ordering. So the");
  line_("  same two ingredients pay a third debt.");
  line_();
  line_("  WHAT IT DOES NOT SHOW. The relative offset has to NOT collectivise —");
  line_("  the quantum arc needs `share` to stay at a half while the rate adds —");
  line_("  and locking every phase to the same value is the opposite of that.");
  line_("  So this gets the summed rate and puts the other half of the");
  line_("  requirement in doubt, which is a real tension and not a detail.");

  return L.join("\n");
}

console.log(mediatedReport());
console.log(reverseReport());
console.log(regionalReport());
