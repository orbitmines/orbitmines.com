/**
 * WHAT TO TURN OFF TO GET SOMEBODY ELSE'S THEORY.
 *
 * This file exists because the model kept producing accounts that were RIGHT
 * ABOUT SOMETHING and then superseded, and deleting them lost information. A
 * superseded account is not a wrong one — it is usually the same physics
 * reached along a worse road, and being able to switch it back on is how you
 * tell those apart.
 *
 * So every place the model could have gone another way is a KNOB, each running
 * 0 → 1, each with a theory at either end. Nothing here is a fudge factor:
 * every knob is either fully on or fully off in the model's own setting, and
 * the values between exist so that the crossover can be measured rather than
 * asserted.
 *
 * TWO KNOBS CAN BE ALTERNATIVE ACCOUNTS OF ONE THING rather than independent
 * effects, and `sync` and `turn` are exactly that — two routes to λ = h/p. They
 * must not both be on, or the same physics is counted twice. `check` below
 * refuses that combination rather than letting it pass quietly.
 */

/** A setting of every knob. */
export type Regime = {
  /**
   * WHOSE SIMULTANEITY a body's internal phases are in step with.
   *
   *   0  the global tick — one phase everywhere, no internal gradient, so no
   *      matter wave. Classical.
   *   1  rest-frame simultaneity — the phase gradient IS ω γ β/c, so λ = h/p.
   *
   * This is the SUPERSEDED account of de Broglie (see `relax` in `field.ts`),
   * kept because it is a real result about what a composite carrying internal
   * phases would have to do, and because the dial is the classical limit: being
   * in step with itself in its own frame is free for one emitter and hard for
   * 10⁵⁷. It is off in the model's own setting because `turn` does the job
   * without needing a simultaneity convention at all.
   */
  sync: number;

  /**
   * WHETHER A WORLDLINE MAY REVERSE — the checkerboard.
   *
   *   0  never turns. Every step at c in one direction: lightlike, massless,
   *      no internal clock. This is what light is.
   *   1  turns with amplitude sin(m), once every 1/m ticks, which is `CLOCK`'s
   *      own pulse period. Gives Ω² = k² + m², λ = λ_dB, and time dilation.
   *
   * The model's own setting. Note that `turn` at 0 is not "a classical
   * particle" — it is a PHOTON. There is no way to be slow without turning.
   */
  turn: number;

  /**
   * WHETHER SPACE IS FOLDED — the metric, as against a flat-space force.
   *
   *   0  flat. The pull alone, which is Newton and gives one sixth of the
   *      perihelion advance.
   *   1  `slowing` and `thickness` applied, and `carry` for the geodesic —
   *      six sixths, and the whole of light's deflection.
   *
   * HONESTY: at 1 this is BORROWED, not derived. A and B are general
   * relativity's isotropic functions. See the bottom of `SPREAD` in
   * `gravity.ts` for how far the derivation got and exactly where it stops.
   */
  fold: number;

  /**
   * WHETHER THE AMBIENT FIELD SCREENS — how far gravity reaches.
   *
   *   0  infinite range, which is what Newton and general relativity both say.
   *   1  Yukawa at λ = REACHES·R_horizon = 0.361 R_h — 1.55 Gpc, 9.2% down at
   *      the BAO scale.
   *
   * The model's own setting, and the one thing here that is a prediction in the
   * full sense. Turning it off is how you ask what it costs.
   */
  screen: number;

  /**
   * HOW THE COUNT AT A PLACE COMPOSES — and this one decides whether the metric
   * is derived or borrowed.
   *
   *   0  ADDITIVE. `weight of the way it went = 1 + n`, which is what `BIAS`
   *      says. Gives √A = WAYS/(WAYS+n), hence β = 3/2, hence a perihelion
   *      advance 17% low at every depth. Wrong, and measured to be wrong.
   *   1  MULTIPLICATIVE. Each annihilation multiplies by 1 + 1/WAYS, so
   *      √A = (1+1/WAYS)^−n → exp(−u), and A = e^−2u, B = e^+2u. Gives
   *      β = γ = 1 and general relativity's perihelion advance.
   *
   * At 1 the metric is DERIVED — no A and B taken from outside — at the price
   * of predicting NO HORIZONS, since exp(−2u) never vanishes. See `slowingMul`
   * in `gravity.ts`. The file's panels still run at 0, because every number in
   * them was measured against the borrowed forms.
   */
  compose: number;

  /**
   * WHETHER MATTER IN A FOLDED PLACE CAN EMIT MORE — which decides whether the
   * model has horizons, and so which of its two dark-object stories is true.
   *
   *   0  no. `SHEET` is fixed by the dimension, emission is what it always was,
   *      and `A = e^−2u` never reaches nought. Dark objects are DARK BY
   *      REDSHIFT: collapse past λ_C, the matter self-coheres, the screening cap
   *      lifts, u grows unbounded. No horizon, a surface, no free parameter.
   *
   *   1  yes. A node with WAYS + n edges gives a source there more ways to pulse
   *      into, so `M_eff = M(1 + κu)` and `u = u₀/(1 − κu₀)` DIVERGES at u₀ = 1.
   *      Dark objects are DARK BY HORIZON, the ordinary kind.
   *
   * The model's own setting is 0, and not because route two is wrong — because
   * route two costs a threshold. `β = 1 − κ` and β is measured to 3·10⁻⁴, so a
   * boost linear in u puts the perihelion advance 33% high; it survives only if
   * it begins above u², at a depth nothing has yet fixed. Route one costs
   * nothing and follows from rules already here.
   *
   * BOTH ARE KEPT because they differ observationally: route one leaves a
   * SURFACE (ringdown echoes, no information loss), route two does not. Neither
   * fixes the neutron star. See the foot of `gravity.ts`.
   */
  boost: number;

  /**
   * WHETHER A FOLDED CELL HOLDS MORE MATTER — the density ceiling, tied to the
   * edge count rather than fixed at one emitter a cell.
   *
   *   0  ρ_max = 1. One emitter to a cell, everywhere.
   *   1  ρ_max = 1 + u. A node with WAYS + n edges fits more distinct emitters,
   *      each still the same m ≤ 1 thing.
   *
   * DISTINCT FROM `boost`, and the distinction is the whole point. `boost` makes
   * ONE emitter emit more, which changes what a fixed mass does and so moves β
   * — excluded by seven thousand. This changes only how much mass fits in a
   * place, so a fixed mass emits exactly what it always did and β is untouched.
   *
   * What it buys: `M = (4/3)πR³/(1 − (4/3)πGR²)` diverges at
   * `R_c = √(3π·WAYS)/SHEET = 1.9567 cells`, so every collapsed object is the
   * same size — a hair under two Planck lengths — with u ∝ M. Darkness becomes
   * automatic, needing neither the coherence argument nor a horizon.
   *
   * Not on by default: it rests on "one emitter per edge", which is a reading of
   * what a cell can hold and not something counted yet.
   */
  hold: number;
};

/** Every knob on: the model saying everything it has to say. */
export const FULL: Regime = { sync: 0, turn: 1, fold: 1, screen: 1, compose: 1, boost: 0, hold: 0 };

/**
 * The theories this model contains, and what each one is a switching-off of.
 *
 * Read these as claims. "Newton is this model with `fold` and `screen` off" is
 * either true or false and can be checked, and the panels in `models.ts` check
 * two of them by drawing all three laws on one orbit.
 */
export const RECOVERS = {
  /** Dark by redshift, with a size: every collapsed object at R_c = 1.96 cells. */
  'black holes with a surface': { sync: 0, turn: 1, fold: 1, screen: 1, compose: 1, boost: 0, hold: 1 },

  /** Dark by horizon: the emission boost on, so u diverges at u₀ = 1. */
  'black holes with horizons': { sync: 0, turn: 1, fold: 1, screen: 1, compose: 1, boost: 1, hold: 0 },

  /** Flat space, infinite range, no matter wave. One sixth of the advance. */
  'newton': { sync: 0, turn: 0, fold: 0, screen: 0, compose: 0, boost: 0, hold: 0 },

  /** Add the metric. Six sixths, and 4GM/bc² for light. Borrowed, not derived. */
  'general relativity': { sync: 0, turn: 0, fold: 1, screen: 0, compose: 0, boost: 0, hold: 0 },

  /** A photon: never turns, so no clock, so no mass. */
  'light': { sync: 0, turn: 0, fold: 1, screen: 1, compose: 0, boost: 0, hold: 0 },

  /** The zigzag. Ω² = k² + m², λ_dB, time dilation, and a derived modulus. */
  'dirac': { sync: 0, turn: 1, fold: 0, screen: 0, compose: 0, boost: 0, hold: 0 },

  /**
   * The superseded route to the same wavelength — rest-frame simultaneity and
   * ignorance of which side you are on. Kept switchable on purpose: it is the
   * only account here that says anything about what a COMPOSITE has to do, and
   * `turn` says nothing about that.
   */
  'de broglie by simultaneity': { sync: 1, turn: 0, fold: 0, screen: 0, compose: 0, boost: 0, hold: 0 },

  /** What this model says when nothing is switched off. */
  'orbitmines': FULL,
} satisfies Record<string, Regime>;

export type Recovered = keyof typeof RECOVERS;

/** The setting that recovers a named theory. */
export const setting = (of: Recovered): Regime => ({ ...RECOVERS[of] });

/**
 * Whether a regime is coherent — which is not the same as being in range.
 *
 * Returns the reasons it is not, empty if it is. The only rule so far is the
 * one above: `sync` and `turn` are two accounts of one phenomenon, so having
 * both would put λ = h/p in twice. More will land here as more knobs do.
 */
export const check = (r: Regime): string[] => {
  const wrong: string[] = [];

  for (const [k, v] of Object.entries(r))
    if (!(v >= 0 && v <= 1)) wrong.push(`${k} = ${v} is outside 0…1`);

  if (r.boost > 0 && r.hold > 0)
    wrong.push('boost and hold are two readings of "a folded cell has more '
      + 'capacity" — one per emitter, one per cell. Having both counts the '
      + 'extra edges twice');

  if (r.boost > 0 && r.compose === 0)
    wrong.push('boost without compose is a source feedback on top of a metric '
      + 'that has no transport feedback — the two were derived together, and '
      + 'having one without the other is not a position anything argues for');

  if (r.sync > 0 && r.turn > 0)
    wrong.push('sync and turn are two accounts of λ = h/p, not two effects — '
      + 'having both counts the same physics twice');

  return wrong;
};

/**
 * What a regime is still borrowing rather than counting — which is a different
 * question from whether it is coherent, and the one that is easy to lose track
 * of. `check` says whether a setting makes sense; this says what it costs.
 */
export const borrows = (r: Regime): string[] => {
  const owed: string[] = [];

  if (r.fold > 0 && r.compose === 0) owed.push(
    '`slowing` and `thickness` are general relativity\'s isotropic functions, '
    + 'and `carry` is its geodesic equation. The pull is derived; the metric '
    + 'that turns one sixth of the perihelion advance into six is not. '
    + 'compose = 1 pays this off, at the price of having no horizons.');

  return owed;
};

/**
 * What a regime has DERIVED BUT NOT MEASURED — which is a third question again.
 *
 * `check` asks whether a setting is coherent, `borrows` what it takes from
 * somebody else, and this asks what it has argued for without running. A chain
 * that closes analytically is not the same as one that has been watched to
 * close, and the file's whole habit is to keep those apart.
 */
export const untested = (r: Regime): string[] => {
  const owed: string[] = [];

  if (r.fold > 0 && r.compose > 0) owed.push(
    '`carry` is the stationary-phase limit of the path sum — shown to match to '
    + '1e-7 — but the checkerboard behind it was measured in FLAT space. A '
    + 'position-dependent reversal amplitude has not been run.');

  if (r.hold > 0) owed.push(
    '`hold` rests on one emitter per edge, which is a reading of what a cell '
    + 'can contain rather than something counted.');

  if (r.boost > 0) owed.push(
    '`boost` needs a threshold above u² that nothing has fixed; linear in u it '
    + 'puts the perihelion advance 33% high.');

  return owed;
};

/**
 * The checkerboard's dispersion at a given regime — `cos Ω = cos(turn·m)·cos k`.
 *
 * At `turn` = 1 this is the full zigzag and Ω² → k² + m². At `turn` = 0 it is
 * Ω = k, a massless thing moving at c. In between the mass is `turn·m`, which
 * is what a partially-reversing worldline weighs.
 */
export const stepping = (m: number, k: number, r: Regime = FULL) => {
  const a = Math.cos(r.turn * m);
  const omega = Math.acos(Math.max(-1, Math.min(1, a * Math.cos(k))));

  return { omega, mass: r.turn * m, reverses: Math.tan(r.turn * m) };
};

/**
 * AND THE SAME THING IN 3+1, which was the part nobody has a tidy version of.
 *
 * In 1+1 a worldline has two headings and reversing between them is the whole
 * of mass. In three dimensions "reverse" is not one thing, and the construction
 * that works keeps every step at c and lets an INTERNAL STATE choose the
 * heading — which is a spinor, and the algebra decides how big it has to be:
 *
 *     U(k) = [cos m − i sin m · β] · Π_j [cos k_j − i sin k_j · α_j]
 *
 * with α_j² = β² = 1 so every factor is a rotation, and Ω read off the trace.
 * For small k and m, U ≈ 1 − i(Σ k_j α_j + m β) — the Dirac Hamiltonian.
 *
 * IT REDUCES CORRECTLY. At d = 1 it gives `cos Ω = cos m · cos k` to 0.0e+0,
 * which is the 1+1 checkerboard exactly. And in 3+1:
 *
 *     m        |k|       Ω²           |k|²+m²      ratio      Im tr
 *     0.0200   0.0200    7.99929e−4   8.00000e−4   0.999911   0.0e+0
 *     0.0100   0.0080    1.63997e−4   1.64000e−4   0.999984   0.0e+0
 *     0.0040   0.0080    7.99992e−5   8.00000e−5   0.999990   0.0e+0
 *
 * — relativistic, with the trace real to machine precision, which is the check
 * that the spectrum really is the doubly-degenerate ±Ω it was assumed to be.
 *
 * IT IS ANISOTROPIC AT FINITE k, and that is the honest cost. The α_j do not
 * commute, so the order the axes are stepped in survives into the answer:
 *
 *     |k|      Ω on axis     Ω on diagonal   ratio
 *     0.05     0.07069594    0.07069103      0.999931
 *     0.20     0.20607419    0.20564238      0.997905
 *     0.50     0.50228287    0.49529126      0.986080
 *     1.00     1.00080224    0.94275679      0.942001
 *
 * Growing as k² and vanishing in the continuum — which is the lattice spacing
 * showing through, and is the SAME anisotropy `FLOOR` in `field.ts` already
 * flags as open (Chebyshev counting against Euclidean distance), arriving here
 * from a completely different direction. Two independent routes to one defect
 * is worth more than either.
 *
 * AND FRACTIONAL DIMENSIONS DO NOT WORK HERE, which is worth knowing before
 * building on them. `SHEET` and `WAYS` are `3^(d−1) − 1` and `3^d − 1` and are
 * perfectly happy off the integers — d = 2.5 gives 4.196 and 14.588, and every
 * counting argument in `gravity.ts` would still run. But a Clifford algebra has
 * no fractional representation: you cannot have 2.83 anticommuting matrices.
 * The smallest spinor is 2^⌊(d+1)/2⌋ — four components at d = 3, and that is
 * not a choice.
 *
 *     THE COUNTS INTERPOLATE AND THE SPINOR DOES NOT.
 *
 * So a fractional-dimension version of this model would have a gravity and no
 * fermions. Which is a fork rather than a detail:
 *
 *   — if the spinor is fundamental, d is an integer and that settles it
 *   — if the counts are fundamental, d may be fractional and the spinor has to
 *     EMERGE, making "four components at d = 3" a thing to be derived
 *
 * Nothing here decides it, and recording that it is a decision is the point.
 *
 * ONE THING FRACTIONAL d DOES SETTLE, though, and it settles it negatively:
 * `WAYS/SHEET` is bounded BELOW by 3 at every d — 5.73 at 1.5, 4.00 at 2, 3.25
 * at 3, tending to 3 from above — and closing `SPREAD` needs it to be 3/π =
 * 0.955. So no dimension rescues that factor of 3.4034, fractional or not. It
 * was already known that no integer d does; this closes the continuous case too.
 */
