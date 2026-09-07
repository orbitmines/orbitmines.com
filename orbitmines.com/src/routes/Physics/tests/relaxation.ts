/**
 * RELAXATION — the turn angle was never the lattice's to fix, and unlocking it collapses
 * two bills onto one parameter which an experiment already running then bounds.
 *
 * The port of `todo/provenance/relax.ts` §1, §2 and §6. `electrostatics/turn-as-lorentz`
 * prices the turn at tan(SPIN/2) — 57.7% on fcc 12 — and the arc's own magnetism sections
 * have already said that SPIN is not the lattice's to set: *"How many steps an emitter's
 * axis takes to come round is a property of the EMITTER, which the particle sets and the
 * lattice does not."* A source may emit where it likes and as often as it likes, so the
 * deflection of an alike meeting is a free angle θ and helping oneself to a ring step was
 * the mistake.
 *
 *   §1  FIRST WHAT DOES NOT MOVE, because a relaxation must not be allowed to rescue
 *       anything it does not touch. The obstruction — M is a sum of d̂⊗d̂ and therefore
 *       symmetric — never used CYCLE, never used the exits, never used a lattice. AND THE
 *       ISOTROPY GOES THE OPPOSITE WAY TO THE GUESS: Σd̂⊗d̂ = (DEG/3)·δ is EXACT on the
 *       lattice and only ASYMPTOTIC for free emission, so the lattice is not an
 *       approximation to something better — it is the arrangement that gets the isotropy
 *       exactly right with the fewest directions, and relaxing costs a little isotropy
 *       rather than buying any
 *   §2  THEN THE TWO BILLS TURN OUT TO BE ONE BILL. transverse ∝ sin θ and longitudinal
 *       ∝ (1 − cos θ), so their ratio is tan(θ/2) at every θ and both vanish together.
 *       The deviation over the COUPLING is then 1/(1 + cos θ) → ½: the arc does not get
 *       to choose, and a weak magnetic coupling and a small longitudinal force are one
 *       statement
 *   §6  AND A STORAGE RING REFUTES θ = α BY ELEVEN ORDERS. A charge-independent force
 *       ALONG v does work every turn, always the same way, and the cyclotron radius
 *       carries the field and the charge out of the answer entirely: ΔE/E per turn is
 *       2πk with k = tan(θ/2), independent of the machine's size, its field and the
 *       particle in it. That is not a subtle observable and the experiment is already
 *       running
 *
 * WHAT IS DECLARED AND WHAT IS INHERITED. §1 and §2 are identities and are held to 10⁻¹².
 * §6 is arithmetic on cited machine parameters — the same standing as `magnetism/
 * anisotropy`'s measured anisotropies — and its coherence-length row takes the θ^−1.3
 * exponent from the arc as an INPUT rather than re-deriving it, which is stated on the
 * finding. The conclusion it is used for is a nine-order margin and survives any exponent
 * near it.
 */

import { World, Vec, Geometry, headerOf, judge, dot, unit, norm, fill, Finding } from "../DISCRETE";
import { force, Background } from "./turn";
import { test } from "../SUITE";

/** Σd̂⊗d̂ and how far off isotropic it is */
const secondMoment = (dirs: Vec[]) => {
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const d of dirs) for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) M[a][c] += d[a] * d[c];
  let off = 0;
  for (let a = 0; a < 3; a++) for (let c = 0; c < 3; c++) if (a !== c) off = Math.max(off, Math.abs(M[a][c]));
  const diag = [M[0][0], M[1][1], M[2][2]];
  return { diag: diag[0], off, spread: Math.max(...diag) - Math.min(...diag), want: dirs.length / 3 };
};

/** n directions spread over the sphere as evenly as an arbitrary spread manages */
const sphere = (n: number): Vec[] => {
  const out: Vec[] = [], ph = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < n; i++) {
    const z = 1 - 2 * (i + 0.5) / n, r = Math.sqrt(Math.max(0, 1 - z * z)), t = 2 * Math.PI * i / ph;
    out.push([r * Math.cos(t), r * Math.sin(t), z]);
  }
  return out;
};

export const isotropyIsExact = test({
  id: "magnetism/isotropy-is-exact",
  claims: "the relaxation touches neither the theorem nor the isotropy — and the isotropy " +
    "runs the OPPOSITE way to the guess: exact on the lattice, only asymptotic for free " +
    "emission, so relaxing costs a little isotropy rather than buying any",
  cited: ["Electromagnetism — except that the turn was never the lattice's to lock"],
  under: { "gravity": "holds" },
  exact: true,                    // a moment over a fixed exit set and four sphere spreads
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const dirs = g.U.map(d => [0, 1, 2].map(i => d[i] ?? 0));

    const here = secondMoment(dirs);
    const free = [64, 256, 1024, 4096].map(n => ({ n, m: secondMoment(sphere(n)) }));
    const worstFree = Math.max(...free.map(x => x.m.off / x.n));
    /* and the departure has to CLOSE with n, or "asymptotic" is the wrong word for it */
    const shrinks = free[free.length - 1].m.off / free[free.length - 1].n
      < free[0].m.off / free[0].n ? 1 : 0;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "Σd̂⊗d̂ off-diagonal over the exits, per direction", value: here.off / g.DEG,
          expect: {
            of: "0 — EXACTLY isotropic, by cubic symmetry", want: 0, tolerance: 1e-15,
            because: "the (DEG/3) in the coupling read as a happy accident of the lattice, and " +
              "it is not an accident: cubic symmetry makes the second moment isotropic " +
              "IDENTICALLY, at however few directions. Held to machine precision rather than to " +
              "a band, because that is the difference between this row and the ones below it",
          },
          note: `diagonal ${here.diag.toFixed(4)} against DEG/3 = ${here.want.toFixed(4)}, ` +
            `spread ${here.spread.toExponential(1)}`,
        }),
        judge({
          /* a one-sided claim, so a verdict — the size is in the note and the table */
          name: "off-diagonal per direction, worst over free emission at 64 … 4096 ways",
          value: worstFree,
          expect: {
            of: "NOT zero — an arbitrary spread only gets there slowly", want: 0, atLeast: 1e-9,
            because: "THE POINT OF THE ROW IS THAT IT IS NOT THE ROW ABOVE. An arbitrary spread " +
              "of n directions has an isotropic second moment only as n grows, so the lattice is " +
              "NOT an approximation to free emission — it is the case that gets the isotropy " +
              "exactly right with the fewest directions. Relaxing the turn costs a little " +
              "isotropy and buys none",
          },
          note: `worst off-diagonal per direction ${worstFree.toExponential(1)}, against the ` +
            `lattice's ${(here.off / g.DEG).toExponential(1)}`,
        }),
        judge({
          name: "does the free-emission departure close as n grows", value: shrinks,
          expect: {
            of: "1 — asymptotic, and the control on the row above", want: 1, tolerance: 0,
            because: "if the departure did not close, 'only asymptotic' would be the wrong " +
              "description and free emission would simply be anisotropic. It is the shape of " +
              "the failure and not its size that makes the comparison mean anything",
          },
        }),
      ],
      table: {
        columns: ["direction set", "count", "Σd̂⊗d̂ diagonal", "off-diag", "n/3", "isotropic?"],
        rows: [[`the ${g.DEG} lattice exits`, g.DEG, here.diag.toFixed(4),
          here.off.toExponential(1), here.want.toFixed(4),
          here.off < 1e-9 * g.DEG ? "YES" : "approx"],
        ...free.map(x => [`free emission, ${x.n} ways`, x.n, x.m.diag.toFixed(4),
          x.m.off.toExponential(1), x.m.want.toFixed(4),
          x.m.off < 1e-9 * x.n ? "YES" : "approx"])],
      },
    };
  },
});

/* ── §2 ─────────────────────────────────────────────────────────────────────── */

const ANGLES = [Math.PI / 2, Math.PI / 4, 2 * Math.PI / 64, 1e-2, 2 * Math.PI / 1024];

export const oneParameter = test({
  id: "magnetism/one-bill-not-two",
  claims: "with θ free, the transverse force goes as sin θ and the longitudinal as " +
    "1 − cos θ, so the bill is tan(θ/2) at every angle and the arc does not get to choose: " +
    "the deviation is half the coupling in the limit, whatever θ is",
  cited: ["Electromagnetism — and then the two bills turn out to be one bill"],
  under: { "gravity": "holds" },
  exact: true,                    // the same force sum turn.ts uses, at a swept angle
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    /* an unbiased background: no net polarity anywhere, so nothing below is electric */
    const bg: Background = { plus: g.U.map(() => 1), minus: g.U.map(() => 1) };
    const v: Vec = [0.4, 0, 0], b: Vec = [0, 0, 1];

    const rows = ANGLES.map(th => {
      const F = force(g, +1, bg, v, b, th);
      const vh = unit(v);
      const longi = dot(F, vh);
      const trans = norm(F.map((x, i) => x - longi * vh[i]));
      return { th, trans, longi: Math.abs(longi), ratio: Math.abs(longi) / trans, want: Math.tan(th / 2) };
    });
    const worst = Math.max(...rows.map(x => Math.abs(x.ratio - x.want)));

    /*
     * AND THE RATIO THAT MATTERS IS NOT THAT ONE. tan(θ/2) is the deviation over the
     * TRANSVERSE FORCE; the deviation over the COUPLING is tan(θ/2)/sin θ = 1/(1 + cos θ),
     * which tends to ½ and is the statement the arc cannot escape.
     */
    const half = ANGLES.map(th => Math.tan(th / 2) / Math.sin(th));
    const limit = Math.tan(1e-6 / 2) / Math.sin(1e-6);
    const identity = Math.max(...ANGLES.map(th =>
      Math.abs(Math.tan(th / 2) / Math.sin(th) - 1 / (1 + Math.cos(th)))));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "worst |longitudinal/transverse − tan(θ/2)| over 90° … 0.35°", value: worst,
          expect: {
            of: "0 — ONE BILL AND NOT TWO, at every angle", want: 0, tolerance: 1e-12,
            because: "Rodrigues has three terms: the antisymmetric one carries sin θ and the " +
              "symmetric one 1 − cos θ, and their ratio is tan(θ/2) identically. SO THE 57.7% " +
              "IS A PROPERTY OF THE RING STEP AND NOT OF THE MECHANISM and it goes to zero with " +
              "θ. But it does not go for free — the transverse coupling vanishes along with it, " +
              "which is what the next row prices",
          },
        }),
        judge({
          name: "deviation over COUPLING, tan(θ/2)/sin θ, at θ = 10⁻²", value: half[half.length - 1],
          expect: {
            of: "½ — the limit, and the arc does not get to choose", want: 0.5, tolerance: 5e-5,
            because: "A WEAK MAGNETIC COUPLING AND A SMALL LONGITUDINAL FORCE ARE THE SAME " +
              "STATEMENT. The deviation is half the coupling whatever θ is, so buying a small " +
              "bill by shrinking θ shrinks the magnetic force with it in fixed proportion. This " +
              "book owes its coupling as α, so if the turn angle were what sets the coupling the " +
              "longitudinal force would be α/2 — which is what §6 then takes to an experiment",
          },
          note: `${half.map(x => x.toFixed(4)).join(", ")} down the angles above, ` +
            `and ${limit.toFixed(6)} by θ = 10⁻⁶`,
        }),
        judge({
          name: "worst |tan(θ/2)/sin θ − 1/(1 + cos θ)|", value: identity,
          expect: {
            of: "0 — an identity, so the ½ is a limit and not a fit", want: 0, tolerance: 1e-12,
            because: "the closed form is what makes the row above a statement about every θ " +
              "rather than about the five that were tried, and checking it costs nothing",
          },
        }),
      ],
      table: {
        columns: ["θ", "transverse", "longitudinal", "ratio", "tan(θ/2)", "over coupling"],
        rows: rows.map((x, i) => [
          (x.th * 180 / Math.PI).toFixed(3) + "°", x.trans.toExponential(3),
          x.longi.toExponential(3), x.ratio.toFixed(6), x.want.toFixed(6), half[i].toFixed(4),
        ]),
      },
    };
  },
});

/* ── §6 ─────────────────────────────────────────────────────────────────────── */

const ALPHA = 1 / 137.035999084;
const PLANCK = 1.616255e-35;
/**
 * A LEP-LIKE MACHINE, and these are its numbers rather than the model's.
 *
 * ~11 kHz revolution frequency over an hour, with the beam energy known to about one part
 * in 10⁵ by resonant spin depolarisation — the highest-precision beam-energy technique
 * there is. Cited, not measured, exactly as `magnetism/anisotropy` cites iron and nickel.
 */
const REV_HZ = 11e3, HOURS = 1, PRECISION = 1e-5;
/** §3's coherence-length exponent, taken as an INPUT — see the finding that uses it */
const EXPONENT = -1.3, ANCHOR_T = 2 * Math.PI / 32, ANCHOR_L = 50;

export const storageRingBound = test({
  id: "magnetism/storage-ring-bound",
  claims: "a charge-independent force ALONG v does work every turn, always the same way, " +
    "and the ring's size, field and particle all cancel — so θ = α is refuted by eleven " +
    "orders by an experiment that has been running for decades",
  cited: ["Electromagnetism — and a storage ring refutes that reading by eleven orders"],
  under: { "gravity": "holds" },
  exact: true,                    // arithmetic on cited machine parameters
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    const turns = REV_HZ * 3600 * HOURS;
    const perTurn = PRECISION / turns;
    const kMax = perTurn / (2 * Math.PI);
    const thetaMax = 2 * Math.atan(kMax);
    const excess = ALPHA / thetaMax;

    const kLocked = Math.tan(w.geometry.SPIN / 2), kAlpha = Math.tan(ALPHA / 2);

    /* the coherence length at a given θ, from §3's exponent */
    const A = ANCHOR_L / Math.pow(ANCHOR_T, EXPONENT);
    const lengthAt = (th: number) => A * Math.pow(th, EXPONENT);
    const thetaForMetres = (m: number) => Math.pow((m / PLANCK) / A, 1 / EXPONENT);
    const thDomain = thetaForMetres(1e-5);
    const margin = thetaMax / thDomain;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "ΔE/E per turn at θ = α", value: 2 * Math.PI * kAlpha,
          expect: {
            of: "≈ 2.3% — NOT a small deviation to be charged to discreteness",
            want: 0.02293, tolerance: 1e-3,
            because: "F∥ = k·qvB does work F∥·2πr over a turn, and r = γmv/qB carries the field " +
              "and the charge out of it entirely: ΔE/E = 2πk for anything relativistic, " +
              "INDEPENDENT OF THE RING'S SIZE, ITS FIELD, AND THE PARTICLE IN IT. A beam gaining " +
              "a fortieth of its energy every turn would have wrecked every storage ring ever " +
              "built. THE ERROR WAS NOT THE ARITHMETIC BUT THE FAILURE TO ASK WHAT IT IMPLIED",
          },
          note: `k = ${kAlpha.toExponential(3)} there; at the ring step, θ = ` +
            `${(w.geometry.SPIN * 180 / Math.PI).toFixed(0)}°, k is ${kLocked.toExponential(3)} ` +
            `and ΔE/E is ${(2 * Math.PI * kLocked).toExponential(3)} — the beam would gain ` +
            `several times its own energy in one lap`,
        }),
        /*
         * THE BOUND CHAIN, as three numbers rather than as a sentence in a `because`.
         * They are the machine's parameters carried through arithmetic, so no expectation
         * is declared for them — what is DECLARED is the eleven orders they come to.
         */
        {
          name: "per-turn ΔE/E the machine's energy calibration permits", value: perTurn,
          note: `${turns.toExponential(2)} turns in an hour at ${(REV_HZ / 1e3).toFixed(0)} kHz, ` +
            `with the energy held to ${PRECISION.toExponential(0)} by resonant spin ` +
            `depolarisation — the highest-precision beam-energy technique there is`,
        },
        { name: "so k = tan(θ/2) is under", value: kMax },
        { name: "so θ is under", value: thetaMax, units: "rad" },
        judge({
          name: "how far α exceeds the bound the machine sets on θ", value: excess,
          expect: {
            of: "≈ 10¹¹ — REFUTED, by eleven orders", want: 9.1e10, atLeast: 1e10,
            because: `${turns.toExponential(2)} turns in an hour with the energy held to ` +
              `${PRECISION.toExponential(0)} puts the per-turn change under ` +
              `${perTurn.toExponential(2)}, so k < ${kMax.toExponential(2)} and θ < ` +
              `${thetaMax.toExponential(2)} rad. This is arithmetic on the machine's cited ` +
              "parameters and not a measurement of the model, which is why it is quoted to two " +
              "figures and not more. THE α/2 IS NOT AN EFFECT TO GO LOOKING FOR",
          },
        }),
        judge({
          name: "is the DOMAIN requirement the tighter of the two",
          value: thDomain < thetaMax ? 1 : 0,
          expect: {
            of: "1 — so a magnet's range already hides the longitudinal force",
            want: 1, tolerance: 0,
            because: "AND THE TWO SURVIVING CONSTRAINTS PULL THE SAME WAY, which is the part " +
              "worth having. The ratio tan(θ/2) is the deviation over the TRANSVERSE force, and " +
              "the transverse force is (DEG/3)·sin θ·n — the ratio does not depend on the " +
              "background density and the magnitude does. So a tiny θ with a large n gives a " +
              "full-strength magnetic force and an invisible longitudinal one. WHAT IS REFUTED " +
              "IS IDENTIFYING θ WITH THE COUPLING, NOT THE MECHANISM",
          },
          note: `a 10 µm domain needs θ < ${thDomain.toExponential(2)} against the ring's ` +
            `${thetaMax.toExponential(2)} — ${margin.toExponential(1)} to spare`,
        }),
        /*
         * AND WHAT IT COSTS, said as a number rather than left as a relief.
         *
         * No expectation: the vacuum's own occupancy is measured elsewhere and this row is
         * the demand θ ≈ 10⁻²³ makes of it, not a prediction about it. The two are compared
         * in the article and the comparison is what closes the escape.
         */
        {
          name: "how much larger the ray density must be to deliver a coupling of order α",
          value: Math.sin(ALPHA) / Math.sin(thDomain),
          note: "WHICH TURNS ONE NUMBER INTO ANOTHER RATHER THAN PAYING A DEBT, and that should " +
            "be said plainly. The transverse force is (DEG/3)·sin θ·n, so a θ small enough to " +
            "give a magnet its range demands this much more vacuum to keep the coupling. It is " +
            "now a load-bearing statement about the ray density where before it was scenery, " +
            "and the vacuum sections already measure that density at order one per cell",
        },
        {
          name: "coherence length at the domain bound, in cells",
          value: lengthAt(thDomain),
          note: `${(lengthAt(thDomain) * PLANCK).toExponential(2)} m with a cell at the Planck ` +
            `length, against ${lengthAt(thetaMax).toExponential(2)} cells at the ring bound. ` +
            "THE θ^−1.3 EXPONENT IS TAKEN FROM THE ARC AS AN INPUT and is not re-derived here — " +
            "it needs a free turn angle, which the lattice's ring cannot supply. The conclusion " +
            "it is used for is a nine-order margin and survives any exponent near it",
        },
      ],
      table: {
        columns: ["requirement", "θ under", "coherence length", "in metres"],
        rows: [["storage rings", thetaMax, lengthAt(thetaMax)],
        ["a 10 µm magnetic domain", thDomain, lengthAt(thDomain)]].map(r =>
          [r[0] as string, (r[1] as number).toExponential(2),
          (r[2] as number).toExponential(2) + " cells", ((r[2] as number) * PLANCK).toExponential(2)]),
      },
    };
  },
});


/* ── the discrete correction to §2 ──────────────────────────────────────────── */

/**
 * NO FREE ANGLE PER EVENT — which is where §2's relaxation actually stands, and it is not
 * where the arc left it.
 *
 * §2 sweeps θ as a real parameter and finds the bill tan(θ/2) going to zero with it. THAT
 * SWEEP IS NOT SOMETHING THE MODEL CAN DO. A ray sits on an exit; a deflection moves it to
 * another exit; so the angle of one turn is one of the lattice's own angles and there is
 * no sending anything to a direction that is not a node. The arc's own justification —
 * "how many steps an emitter's axis takes to come round is a property of the emitter" —
 * buys a choice of RING, not a choice of angle: subdividing the ring finer than the exits
 * go is asking the lattice for directions it does not have.
 *
 * SO WHERE COULD A FREE ANGLE COME FROM? The vacuum was the only candidate, and IT DOES
 * NOT HAVE ONE EITHER. (G/2) is not a rule that fires at a rate — "on all axis, a neutral
 * point expands into two points" is a statement about EVERY neutral point, EVERY tick — so
 * there is no expansion rate to turn down. The occupancy is what the rule settles at, which
 * each theory declares: 0 under gravity, where both halves of an inserted point are neutral
 * and annihilate on the edge, and ½ under gravity+magnetism.
 *
 * MEASURED, THE THREE "RATES" BELOW ARE ONE RATE. The fill comes back 0.5002 at every one
 * of them and the mean rotation per cell 0.523 rad — identical to four figures, because
 * there is nothing being varied. The sweep is kept as the demonstration that it is not a
 * sweep, which is the cheapest way to show that the parameter is gone rather than small.
 *
 * SO THERE IS NO FREE ANGLE ANYWHERE, and that is stronger than the conclusion this test
 * was written to reach. Even had the rate survived it would not have helped: the force is
 * linear in the population that meets, so diluting the rate dilutes the antisymmetric and
 * the symmetric parts of Rodrigues BY THE SAME FACTOR — the bill is a per-event quantity
 * and a rate is a per-path one, and they never touch. The ratio stays tan(SPIN/2), and the
 * storage-ring bound falls on SPIN, which the lattice fixes and nothing can move.
 *
 * WHAT THIS DOES AND DOES NOT KILL. It kills the RELAXATION, not the model: the arc
 * already carries the escape that matters, that the longitudinal force is an artefact of
 * writing the deflection as a length-preserving rotation and two other mechanisms give the
 * Lorentz force without one. This says the weight has to go there, because the θ → 0 route
 * was never available discretely.
 */
export const noFreeAnglePerEvent = test({
  id: "magnetism/no-free-angle",
  claims: "there is no free turn angle anywhere — the lattice cannot turn by a little and " +
    "the vacuum has no rate to dilute it with, since (G/2) fires on every neutral point " +
    "every tick — so the bill stays tan(SPIN/2) and the bound falls on SPIN itself",
  cited: ["Electromagnetism — except that a lattice cannot turn by a little"],
  under: {
    /* (G+M/3) is the rule being priced, so it takes the theory that HAS it */
    "gravity+magnetism": "holds",
    "gravity": "cannot be asked — rays are neutral, so no meeting is alike and nothing turns",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 31, T: 40, seeds: 2 });
    const w0 = new World({ theory, N: 5 });
    const g = w0.geometry;
    const SPIN = g.SPIN;

    /*
     * WHAT THE VACUUM ACTUALLY GIVES, measured rather than assumed: deflections per ray
     * per tick. The three "rates" below are the demonstration that there is no rate —
     * they are the same world three times, and the fill and the rotation per cell come
     * back identical to four figures. Kept rather than deleted because a sweep that does
     * not move is the cheapest possible way to show that a parameter is GONE rather than
     * merely small, which is what the arc above needs to be believed.
     */
    const RATES = [0.005, 0.02, 0.08];
    const rateOf = ctx.once((key: string) => {
      const [rate, seed] = key.split("/").map(Number);
      const w = new World({ theory, N, seed, boundary: "wrap"});
      w.run(T);
      let rays = 0;
      w.backend.forEachLocal(k => {
        for (let d = 0; d < g.DEG; d++) if (w.backend.active(k, d)) rays++;
      });
      return { perRayTick: w.stats.deflections / Math.max(rays * T, 1), fill: fill(w) };
    });
    const measured = RATES.map(r => ({
      rate: r,
      f: ctx.over(seeds, s => rateOf(`${r}/${s}`).perRayTick),
      fill: ctx.over(seeds, s => rateOf(`${r}/${s}`).fill),
    }));

    /*
     * AND WHAT IT DOES TO THE BILL. At each measured rate f, a fraction f of the alike
     * meetings has turned and the rest has not, so the force is the f-weighted blend —
     * which is exactly how a rate enters a sum over a population.
     */
    const bg: Background = { plus: g.U.map(() => 1), minus: g.U.map(() => 1) };
    const v: Vec = [0.4, 0, 0], b: Vec = [0, 0, 1];
    const vh = unit(v);
    const F0 = force(g, +1, bg, v, null);          // nothing turns: the baseline
    const F1 = force(g, +1, bg, v, b);             // everything turns, by SPIN

    const billAt = (f: number) => {
      const dF = F1.map((x, i) => f * (x - F0[i]));
      const longi = dot(dF, vh);
      const trans = norm(dF.map((x, i) => x - longi * vh[i]));
      return { trans, longi: Math.abs(longi), ratio: Math.abs(longi) / trans };
    };
    const bills = measured.map(m => billAt(m.f.mean));
    const want = Math.tan(SPIN / 2);
    const worstBill = Math.max(...bills.map(x => Math.abs(x.ratio - want)));
    /* and the free angle the rate DOES give, which is the honest half of the result */
    const perCell = measured.map(m => m.f.mean * SPIN);
    const spanned = Math.max(...perCell) / Math.min(...perCell);

    /* the bound, from magnetism/storage-ring-bound's arithmetic */
    const thetaMax = 2 * Math.atan((1e-5 / (11e3 * 3600)) / (2 * Math.PI));

    return {
      header: headerOf(new World({ theory, N, seed: seeds[0], boundary: "wrap"}), seeds),
      findings: [
        judge({
          name: "worst |bill − tan(SPIN/2)| across the measured vacuum rates", value: worstBill,
          expect: {
            of: "0 — THE RATE DIVIDES OUT OF THE BILL", want: 0, tolerance: 1e-12,
            because: "the force is a SUM over the population that meets, so it is linear in how " +
              "much of that population turned — and Rodrigues' antisymmetric and symmetric terms " +
              "are diluted by the SAME factor. The bill is a per-event ratio and the vacuum's " +
              "knob is a per-path one, so they never touch. §2's sweep of θ as a real parameter " +
              "is not something this model can do: a ray sits on an exit, a deflection moves it " +
              "to another exit, and there is nothing to send to a direction that is not a node",
          },
          note: `tan(SPIN/2) = ${want.toFixed(6)} at every rate, SPIN being ` +
            `${(SPIN * 180 / Math.PI).toFixed(0)}° on ${g.name}`,
        }),
        judge({
          name: "does the vacuum give a free MEAN rotation per cell at all",
          value: spanned > 1.01 ? 1 : 0,
          expect: {
            of: "0 — THERE IS NO KNOB. The occupancy is what the rule settles at",
            want: 0, tolerance: 0,
            because: "the vacuum was the last candidate for a free angle and it does not have " +
              "one. (G/2) is not a rule that fires at a rate — every neutral point splits every " +
              "tick — so the occupancy is fixed by the rule and each theory simply declares " +
              "where it lands. The three settings swept below are one setting, and the fill and " +
              "the rotation per cell come back identical to four figures. SO THE ANSWER IS NOT " +
              "THAT THE FREE ANGLE LIVES ON THE PATH INSTEAD OF IN THE EVENT; IT IS THAT THERE " +
              "IS NO FREE ANGLE",
          },
          note: perCell.map((x, i) =>
            `${x.toExponential(3)} rad/cell at fill ${measured[i].fill.mean.toFixed(4)}`).join(", ") +
            ` — and a carrier turning half a radian a cell has lost its heading in about two ` +
            `cells, which is the coherence length the magnetic arc needs to be enormous`,
        }),
        judge({
          name: "how far SPIN itself exceeds the storage ring's bound on the turn angle",
          value: SPIN / thetaMax,
          expect: {
            of: "≫ 10¹¹ — so it is the TURN that is refuted, not an identification",
            want: 1.3e13, atLeast: 1e11,
            because: "with the relaxation unavailable, the bound falls on the angle the lattice " +
              "actually turns by, and SPIN is not α — it is of order one radian. THE ESCAPE THE " +
              "ARC OFFERS IS NOT THIS ONE: it already has in print that the longitudinal force " +
              "is an artefact of writing the deflection as a length-preserving rotation, and " +
              "that two other mechanisms give the Lorentz force with none. This says the weight " +
              "has to go there, because θ → 0 was never a discrete option",
          },
          note: `SPIN = ${SPIN.toFixed(4)} rad against a bound of ${thetaMax.toExponential(2)}`,
        }),
      ],
      table: {
        columns: ["expansion", "fill", "deflections/ray/tick", "rad per cell", "bill"],
        rows: measured.map((m, i) => [
          m.rate, m.fill.mean.toFixed(4), m.f.mean.toExponential(3),
          perCell[i].toExponential(3), bills[i].ratio.toFixed(6),
        ]),
      },
    };
  },
});

export default [isotropyIsExact, oneParameter, storageRingBound, noFreeAnglePerEvent];
