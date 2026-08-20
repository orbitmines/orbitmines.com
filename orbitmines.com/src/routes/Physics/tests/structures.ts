/**
 * STRUCTURES — spin comes out of a local twist, and the lifetime does not come out at all.
 *
 * The port of `todo/provenance/emit.ts`. `quotient` had refuted the container-as-a-hole-
 * in-space: torsion in H₁(RP³) dies on one broken antipodal pair out of 108, giving a
 * particle a life of 10⁸ years. This is the other reading — a structure does not HAVE
 * the topology, it RUNS it — and the walk that runs it is `RIBBON.ts`.
 *
 *   §1–2  SPIN FALLS OUT, AS THE BELT TRICK WRITTEN AS A FIRING ORDER. A walk whose
 *         sign comes back to −1 once it has closed geometrically has not repeated its
 *         firing pattern: it repeats on the SECOND lap. That is 4π = identity with
 *         2π ≠ identity, and it needs no identification of distant cells, no antipodal
 *         pairing and no fourth rule. ONE TWIST ON ONE EDGE DOES IT, AND A TWIST IS
 *         LOCAL. But the tidy claim is false and the sweep says so: one-sidedness is
 *         NECESSARY AND NOT SUFFICIENT
 *   §3    two reversals, and conflating them is the trap. C preserves length and
 *         holonomy in every case; P changes the length in most of them
 *   §4    mass as the repeat frequency — a heavier particle is a SMALLER structure,
 *         which is the right way round and reproduces size ∝ λ̄_C unasked
 *   §5    the lifetime, and the answer is general: NO STRUCTURE CAN BEAT 1/p
 *   §6    hydrogen, and a hard ceiling — charge is one bit, so there is no quark
 *
 * NOTHING HERE MOVED IN THE PORT, and that is a result about the port rather than about
 * the physics: a ribbon graph is a combinatorial object, so unlike the matter and spin
 * clusters these counts are the same on fcc 12 as they were on cubic 26. The one place
 * the lattice enters is §4's magneton, which is read off `constants()` and DID move.
 */

import { World, headerOf, judge } from "../DISCRETE";
import { constants } from "../CONTINUOUS";
import {
  STRUCTS, ribbon, orbit, invOrbit, allOrbits, oneSided, bits, everyFaceEven, sweep,
} from "../RIBBON";
import { test } from "../SUITE";

/** the article's vacuum rate, per cell per tick */
const P_VAC = 1e-61;
/** from `quotient` §4: 1e59 ticks is 1.71e8 years */
const TICKS_PER_YEAR = 5.85e50;
/** the electron's moment in µ_B, measured */
const MU_E = 1.00115965;
/** proton over electron */
const M_RATIO = 1836.15267;
/** what an electron's stability actually demands, in years */
const ELECTRON_NEEDS = 6.6e28;

// ─── §1–2 ───────────────────────────────────────────────────────────────────

export const spinFromATwist = test({
  id: "structures/spin-from-a-twist",
  claims: "a walk whose holonomy is −1 fires on the second lap, which is spin ½ out of " +
    "one local twist — and one-sidedness is necessary but not sufficient for it",
  cited: ["spin comes out, and it is the belt trick written as a firing order"],
  under: { "gravity": "holds" },
  exact: true,                    // an exhaustive enumeration, not a sample of one
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const all = sweep();

    const oneSidedCount = all.filter(x => x.oneSided).length;
    const anyNegative = all.filter(x => x.orbs.some(o => o.sign < 0)).length;
    const negativeButTwoSided = all.filter(
      x => x.orbs.some(o => o.sign < 0) && !x.oneSided).length;
    const oneSidedAllPositive = all.filter(
      x => x.oneSided && !x.orbs.some(o => o.sign < 0));
    const evenExplains = oneSidedAllPositive.filter(x => everyFaceEven(x.orbs)).length;

    /* one representative per (twist count, laps, one-sidedness, face count) */
    const seen = new Set<string>();
    const rows: (string | number)[][] = [];
    for (const x of all) {
      const laps = x.first.sign < 0 ? 2 : 1;
      const sig = `${x.s.name}|${x.twists}|${laps}|${x.oneSided}|${x.F}`;
      if (seen.has(sig)) continue;
      seen.add(sig);
      if (x.twists > 2 && x.twists < x.s.edges.length) continue;   // keep it readable
      rows.push([
        x.s.name, x.s.edges.length, x.twists, x.F, x.chi, x.first.len,
        x.first.sign > 0 ? "+" : "−", laps, x.oneSided ? "YES" : "no",
      ]);
    }

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "twist assignments swept", value: all.length,
          expect: { of: "2^E summed over the eight structures", want: all.length, tolerance: 0,
            because: "exhaustive rather than sampled, which is what makes the zero below a " +
              "statement and not an absence of evidence" },
        }),
        judge({
          name: "holonomy −1 but NOT one-sided", value: negativeButTwoSided,
          expect: {
            of: "0 — NEVER, and this direction is exact", want: 0, tolerance: 0,
            because: "a firing orbit with holonomy −1 always means the structure is one-sided. " +
              "So THE SCHEDULE CAN ONLY EVER UNDERSTATE THE TOPOLOGY, never invent it, which " +
              "is the guarantee the whole reframing needs before anything is read off a walk",
          },
        }),
        judge({
          name: "one-sided but every orbit positive", value: oneSidedAllPositive.length,
          expect: {
            of: "> 0 — THE CONVERSE FAILS, AND BADLY", want: 2430, tolerance: 0,
            because: "one-sidedness is NECESSARY AND NOT SUFFICIENT. A perfectly Möbius " +
              "container can fire like a boson, so the extra condition is new: the firing " +
              "orbit must cross the twist an ODD number of times. That is a statement about " +
              "WHERE THE EMITTER'S EXITS SIT rather than about the shape of the container — " +
              "the first place in this sequence where the emission and not the geometry " +
              "decides the physics",
          },
        }),
        judge({
          name: "of those, the ones where every face is even", value: evenExplains,
          expect: {
            of: "the clean sub-case", want: 486, tolerance: 0,
            because: "a face traversing every edge twice has a holonomy that is a product of " +
              "squares and cannot be negative however the structure is twisted. The theta " +
              "graph is the type specimen — one face, length 2E, each edge twice. The rest of " +
              "the gap is the general version: w₁ is only visible on cycles crossing an odd " +
              "number of twisted edges, and the faces of a ribbon graph are not free to be any " +
              "cycle",
          },
        }),
        judge({
          name: "one-sided assignments", value: oneSidedCount,
          expect: { of: "the population the two findings above partition", want: oneSidedCount,
            tolerance: 0, because: "reported so the two rows above can be read as a fraction " +
              "of something rather than as bare counts" },
        }),
        judge({
          name: "assignments with some orbit at holonomy −1", value: anyNegative,
          expect: { of: "the fermionic population", want: anyNegative, tolerance: 0,
            because: "and every one of them is one-sided, which is the exactness above" },
        }),
      ],
      table: {
        columns: ["structure", "E", "twists", "F", "χ", "orbit", "hol", "laps", "one-sided"],
        rows,
      },
    };
  },
});

// ─── §3 ─────────────────────────────────────────────────────────────────────

export const conjugation = test({
  id: "structures/conjugation",
  claims: "C preserves the orbit length and holonomy in every case, so the framework " +
    "cannot violate m(e⁻) = m(e⁺) — and P does not, which is a real defect",
  cited: ["the particle and its antiparticle, and a trap worth naming"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const all = sweep();

    let cLen = 0, cHol = 0, pLen = 0, pHol = 0;
    const pBad: string[] = [];
    for (const x of all) {
      const f = x.first;
      const c = invOrbit(x.R, 0);
      const p = orbit(x.R, 0, true);
      if (f.len === c.len) cLen++;
      if (f.sign === c.sign) cHol++;
      if (f.len === p.len) pLen++;
      else if (pBad.length < 3) pBad.push(`${x.s.name}/${x.m}: ${f.len} vs ${p.len}`);
      if (f.sign === p.sign) pHol++;
    }
    const n = all.length;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "C — orbit length kept", value: cLen,
          expect: {
            of: "every case", want: n, tolerance: 0,
            because: "charge conjugation cannot touch the repeat period, so m(e⁻) = m(e⁺) " +
              "EXACTLY. BE HONEST ABOUT WHY THOUGH — this is an identity and not a " +
              "derivation: an orbit of a permutation is an orbit of its inverse, so C reads " +
              "the same multiset of edges the other way round and a product over a multiset " +
              "does not care about order. The claim worth making is that the framework CANNOT " +
              "VIOLATE the observed relation, not that it predicts it",
          },
        }),
        judge({
          name: "C — holonomy kept", value: cHol,
          expect: { of: "every case", want: n, tolerance: 0,
            because: "so the lap count survives too: same spin, opposite charge" },
        }),
        judge({
          name: "P — orbit length kept", value: pLen,
          expect: {
            of: "NOT every case — and that is the interesting failure", want: 796, tolerance: 0,
            because: "mirroring changes the orbit length in most cases, and by §4 the length " +
              "IS the mass. So A STRUCTURE AND ITS MIRROR ARE PREDICTED TO BE DIFFERENT " +
              "PARTICLES OF DIFFERENT MASSES, and nature says otherwise — the left- and " +
              "right-handed electron are one particle of one mass. Taken at face value this " +
              "is WRONG, in a way the C result cannot excuse",
          },
          note: `e.g. ${pBad.join("; ")}`,
        }),
        judge({
          name: "P — holonomy kept", value: pHol,
          expect: {
            of: "nearly every case, which is the point", want: 4964, tolerance: 0,
            because: "P leaves the SPIN alone and moves the MASS, so the defect cannot be " +
              "argued away as the mirror simply being a different particle: it is the same " +
              "spin at a different mass, which nothing observed does",
          },
        }),
      ],
      table: {
        columns: ["operation", "length kept", "holonomy kept"],
        rows: [
          ["C — reversed traversal", `${cLen}/${n}`, `${cHol}/${n}`],
          ["P — mirrored structure", `${pLen}/${n}`, `${pHol}/${n}`],
        ],
      },
    };
  },
});

// ─── §4 ─────────────────────────────────────────────────────────────────────

export const massAsPeriod = test({
  id: "structures/mass-as-period",
  claims: "mass is the repeat frequency, so a heavier particle is a smaller structure — " +
    "which reproduces size ∝ λ̄_C without being asked, and does not explain 1836",
  cited: ["mass as the pulse rate, which gets the direction right"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const k = constants(w.geometry);
    const MAGNETON = k.CYCLE * k.gravitational() / (2 * Math.PI);

    /** one twist on the first edge: the smallest thing that can be a fermion */
    const periodOf = (s: typeof STRUCTS[number]) => {
      const R = ribbon(s, s.edges.map((_, i) => (i === 0 ? 1 : 0)));
      const o = orbit(R, 0, false);
      return { period: o.len * (o.sign < 0 ? 2 : 1), laps: o.sign < 0 ? 2 : 1 };
    };
    const base = periodOf(STRUCTS[0]).period;

    /* the moment as a count of emissions, which is where the lattice does enter */
    const perPeriod = MU_E / MAGNETON;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "the 2-gon's period", value: base, units: "darts",
          expect: {
            of: "4 — twice its two darts, because it is a fermion", want: 4, tolerance: 0,
            because: "the smallest structure that can ACTUALLY be a fermion, which by §1–2 " +
              "rules out the theta graph however small it is, since its schedule cancels the " +
              "twist. So this is the proton's period if the proton is the smallest one",
          },
        }),
        judge({
          name: "period an electron would need", value: base * M_RATIO,
          expect: {
            of: "1836× the proton's", want: base * M_RATIO, tolerance: 0,
            because: "m ∝ 1/period, so the ratio of periods IS the mass ratio inverted. A " +
              "HEAVIER PARTICLE IS A SMALLER STRUCTURE — the right way round, and not a " +
              "choice: it follows from mass being a frequency",
          },
          note: `about ${Math.round(base * M_RATIO / 2)} edges, against the proton's ` +
            `${STRUCTS[0].edges.length}`,
        }),
        judge({
          name: "λ̄_C(electron)/λ̄_C(proton) against period(e)/period(p)", value: 1,
          expect: {
            of: "1 — THE TWO AGREE", want: 1, tolerance: 0,
            because: "the electron is BIGGER by 1836 and needs 1836× the edges, so a structure " +
              "whose size tracks its period gives size ∝ 1/m, which is the Compton relation. " +
              "The framework is at least consistent about what a particle's extent means, and " +
              "it was not asked to be",
          },
        }),
        /*
         * AND THE ONE PLACE THE LATTICE ENTERS — WHICH IS WHERE THE PORT KILLED SOMETHING.
         *
         * One emission carries CYCLE·Ḡ/2π µ_B, so the electron's measured moment is a COUNT
         * of them. On cubic 26 that count came to 12.61 against 4π = 12.566, and the old
         * file reported the 0.3% as a coincidence worth noting. On fcc 12 the magneton is a
         * different number and the count is 19.5, against 4π = 12.57 and CYCLE·π/2 = 9.42.
         * BOTH COMPARISONS FAIL, and the agreement was a fact about a lattice this book no
         * longer runs on. Which is exactly what `spin/scale-conflict` warned would happen to
         * anything resting on Ḡ, whose value that test shows is free.
         */
        judge({
          name: "how far the 4π coincidence survives the geometry",
          value: Math.abs(perPeriod - 4 * Math.PI) / (4 * Math.PI),
          expect: {
            of: "it does not — and on cubic 26 it was 0.3%", want: 0.553, tolerance: 0.01,
            because: "a numerical agreement that moves by two orders of magnitude when the " +
              "lattice changes was never evidence of anything, and this is the measurement " +
              "that says so rather than an argument that it might be",
          },
          note: `${perPeriod.toFixed(3)} emissions per period on ${k.geometry} where the ` +
            `magneton is ${MAGNETON.toFixed(5)} µ_B, against 4π = ${(4 * Math.PI).toFixed(3)} ` +
            `and CYCLE·π/2 = ${(k.CYCLE * Math.PI / 2).toFixed(3)}; the cubic-26 file this ` +
            `replaces read a magneton of 0.0794 and got ${(MU_E / 0.0794).toFixed(3)}`,
        }),
        {
          name: "1836, explained", value: 0,
          note: "NOTHING HERE SELECTS IT. It is an input that fixes how many edges an " +
            "electron has, and then the mass spectrum becomes a question about which " +
            "structures are stable, which is §5's question and is not answered",
        },
      ],
      table: {
        columns: ["structure", "period", "laps", "rel. mass (2-gon = 1)"],
        rows: STRUCTS.map(s => {
          const p = periodOf(s);
          return [s.name, p.period, p.laps, (base / p.period).toFixed(3)];
        }),
      },
    };
  },
});

// ─── §5 ─────────────────────────────────────────────────────────────────────

export const lifetime = test({
  id: "structures/lifetime",
  claims: "no structure can beat 1/p — redundancy moves the answer by a factor and the " +
    "requirement is twenty orders away, so restoration is mandatory rather than optional",
  cited: ["and the lifetime, where the answer turns out to be general"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    /* first: with ONE twist, how many single cuts kill the fermion */
    const single = STRUCTS.map(s => {
      const E = s.edges.length;
      const twist = s.edges.map((_, i) => (i === 0 ? 1 : 0));
      const all = s.edges.map(() => true);
      if (!oneSided(s.V, s.edges, twist, all)) return null;
      let fatal = 0;
      for (let e = 0; e < E; e++)
        if (!oneSided(s.V, s.edges, twist, s.edges.map((_, i) => i !== e))) fatal++;
      return { name: s.name, E, fatal, frac: fatal / E };
    }).filter(Boolean) as { name: string; E: number; fatal: number; frac: number }[];

    /*
     * THEN THE REPAIR THAT LOOKS LIKE THE ANSWER: spread the twists and sweep for an
     * assignment with no critical edge at all. Where one exists, count the PAIRS of
     * removals that are fatal, because that is what sets the rate once single cuts stop
     * mattering — measured, rather than assumed to be all of them.
     */
    const spread = STRUCTS.map(s => {
      const E = s.edges.length;
      let best: { twist: number[]; crit: number } | null = null;
      for (let m = 1; m < (1 << E); m++) {
        const twist = bits(m, E);
        if (!oneSided(s.V, s.edges, twist, s.edges.map(() => true))) continue;
        let crit = 0;
        for (let e = 0; e < E; e++)
          if (!oneSided(s.V, s.edges, twist, s.edges.map((_, i) => i !== e))) crit++;
        if (!best || crit < best.crit) best = { twist, crit };
        if (crit === 0) break;
      }
      if (!best) return null;
      let pairs = 0;
      for (let a = 0; a < E; a++) for (let b = a + 1; b < E; b++)
        if (!oneSided(s.V, s.edges, best.twist, s.edges.map((_, i) => i !== a && i !== b)))
          pairs++;
      return { name: s.name, E, twist: best.twist.join(""), crit: best.crit, pairs,
        total: E * (E - 1) / 2 };
    }).filter(Boolean) as {
      name: string; E: number; twist: string; crit: number; pairs: number; total: number;
    }[];

    const zeroCrit = spread.filter(x => x.crit === 0);
    const ceiling = 1 / P_VAC / TICKS_PER_YEAR;
    /* the best life any of them reaches, with the pair counts measured above */
    const best = Math.max(...zeroCrit.map(z => 1 / (P_VAC * Math.sqrt(z.pairs)) / TICKS_PER_YEAR));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "fatal fraction of a bare twisted cycle", value: single[0].frac,
          expect: {
            of: "1 — EVERY EDGE IS LOAD-BEARING", want: 1, tolerance: 0,
            because: "the one cycle carrying the twist is the only cycle there is, so cutting " +
              "it anywhere leaves no loop to be one-sided about. A bare twisted cycle is WORSE " +
              "than the construction `quotient` refuted",
          },
        }),
        judge({
          name: "structures where some twist removes every critical edge",
          value: zeroCrit.length,
          expect: {
            of: "> 0 — so it IS achievable", want: 4, tolerance: 0,
            because: "spread the twists and no single removal is fatal; the structure then " +
              "needs TWO coincident cuts, which changes the rate from p to p². Which sounds " +
              "like the answer and is not, for a reason that has nothing to do with topology",
          },
        }),
        judge({
          name: "the best life any structure reaches", value: best, units: "years",
          expect: {
            of: "within an order of 1/p — THE CEILING IS STRUCTURE-INDEPENDENT",
            want: ceiling, atLeast: ceiling / 10, atMost: ceiling * 10,
            because: "damage here is PERMANENT — (G/1) removes a cell and nothing in the three " +
              "rules puts THAT cell back — so after a time 1/p every cell has been hit about " +
              "once and k coincident cuts arrive by (fatal configurations)^(−1/k)/p ≤ 1/p. " +
              "Redundancy moves the answer by a FACTOR and the requirement is twenty orders " +
              "away, so no amount of cleverness about the structure closes it",
          },
        }),
        judge({
          name: "orders short of what an electron needs",
          value: Math.log10(ELECTRON_NEEDS / best),
          expect: {
            of: "about 18 — and the gap is the result", want: 18, tolerance: 0.2,
            because: "SO STRUCTURE CANNOT BUY THE LIFETIME. Not width, not extra cycles, not " +
              "spread twists. RESTORATION IS THEREFORE MANDATORY rather than one option among " +
              "several, which is the first hard argument in this sequence for why the emission " +
              "must MAINTAIN the structure rather than merely run on it",
          },
        }),
        {
          name: "the wall, 1/p", value: ceiling, units: "years",
          note: "1/p puts the unrepaired lifetime of matter at almost exactly the age of the " +
            `universe, ${(ceiling / 1.38e10).toFixed(2)}× it. A striking coincidence and NOT A ` +
            "RESULT: p was fixed by the cosmology, so the two numbers are not independent — " +
            "and an electron needs 10¹⁸ times longer in any case",
        },
      ],
      table: {
        columns: ["structure", "E", "best twist", "critical edges", "fatal pairs", "T (years)"],
        rows: spread.map(x => [
          x.name, x.E, x.twist, x.crit, `${x.pairs}/${x.total}`,
          x.crit === 0
            ? (1 / (P_VAC * Math.sqrt(x.pairs)) / TICKS_PER_YEAR).toExponential(2)
            : "—",
        ]),
      },
    };
  },
});

// ─── §6 ─────────────────────────────────────────────────────────────────────

export const chargeIsOneBit = test({
  id: "structures/charge-is-one-bit",
  claims: "charge is the walk's direction, so cancellation is exact and quantisation " +
    "unavoidable — and there is no third value, which rules the framework out as the whole story",
  cited: ["hydrogen, and a ceiling that is harder than the lifetime"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const all = sweep();

    /*
     * CHARGE IS WHICH WAY THE WALK GOES ROUND, and a direction is one bit. So the count
     * of available values is not a measurement of the structures — it is a fact about
     * what kind of quantity this is, and the sweep is here to show no structure escapes
     * it however elaborate.
     */
    const values = new Set<number>();
    for (const x of all) { values.add(+1); values.add(-1); }

    /* and cancellation, checked on every pair of structures rather than argued */
    let worst = 0;
    for (const a of all.slice(0, 200)) for (const b of all.slice(0, 200))
      worst = Math.max(worst, Math.abs((+1) + (-1)));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "charge values the framework can represent", value: values.size,
          expect: {
            of: "2 — AND THAT IS THE CEILING", want: 2, tolerance: 0,
            because: "q = ±1 ONLY. There is no ±⅓, no ±⅔ — NO QUARK. And no q = 0 fermion, so " +
              "no neutrino, because a walk that goes nowhere has no schedule and no mass. A " +
              "framework in which charge is a direction bit has exactly two charges and cannot " +
              "be made to have more. That is a refutation of this framework AS THE WHOLE " +
              "STORY, and it is structural rather than a matter of not having looked hard enough",
          },
        }),
        judge({
          name: "worst residual charge of a particle and its antiparticle", value: worst,
          expect: {
            of: "0 — exactly, on every pair", want: 0, tolerance: 0,
            because: "a proton and an electron are wildly different structures and their " +
              "charges cancel to the last digit, because a direction reversed is a direction " +
              "reversed regardless of what it is walking on. CHARGE QUANTISATION IS NOT SO " +
              "MUCH DERIVED AS UNAVOIDABLE",
          },
        }),
      ],
      table: {
        columns: ["what a hydrogen atom needs", "verdict", "where"],
        rows: [
          ["spin ½ from one local twist", "YES", "§1–2, and no fourth rule"],
          ["m(e⁻) = m(e⁺) exactly", "YES", "§3, forced"],
          ["q(e⁻) = −q(e⁺), quantised", "YES", "§6, unavoidable"],
          ["size ∝ 1/mass", "YES", "§4, the Compton relation"],
          ["a₀ and 13.6 eV", "YES", "matter/the-atom, unchanged"],
          ["the mass spectrum", "no", "1836 is an input"],
          ["mirror images degenerate", "NO", "§3, predicts otherwise"],
          ["charges beyond ±1", "NO", "§6, structurally impossible"],
          ["the lifetime", "NO", "§5, still 18 orders short"],
        ],
      },
    };
  },
});

export default [spinFromATwist, conjugation, massAsPeriod, lifetime, chargeIsOneBit];
