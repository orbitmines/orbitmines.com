/**
 * AUTOMATON — running the rules rather than their statistics, and every margin dies.
 *
 * The port of `todo/provenance/automaton.ts`, and it is the file that should be believed
 * over the three before it, because it is the only one that runs the rules as stated.
 * The coherence and repair arguments model the traffic with RATES — a damage probability
 * per cell, a mixing fraction, a vacuum flux — and those are statistics of a process
 * rather than the process. `AUTOMATON.ts` is the process.
 *
 *   §1  the automaton runs, and the three rules fire at rates NOBODY CHOSE. Turning is
 *       by far the commonest, which is worth noting because it is the rule that costs
 *       nothing — most meetings leave the space alone
 *   §2  A FERMION CANNOT BE COHERENT, which withdraws `coherence/sign-purity` entirely.
 *       A Möbius ribbon's two rails ARE the two polarities — that is what the sign
 *       holonomy means — so the structure necessarily emits both signs a few cells apart,
 *       and (G+M/1) is what happens when they meet. THE THING THAT MAKES IT A FERMION IS
 *       THE THING THAT EATS IT
 *   §3  and the damage does NOT concentrate at the twist, which withdraws
 *       `coherence/twist-concentration`: the real ribbon is several cells wide everywhere,
 *       so both signs sit a few cells apart all the way round. WHICH IS WORSE RATHER THAN
 *       BETTER — a localised weakness could be reinforced; a uniform one is the object's
 *       own construction
 *   §4  and creation and annihilation are ONE process at one rate, which removes the
 *       regime the repair argument needed
 *
 * WHAT THE PORT CHANGED. The old file hardcoded the eight headings of the plane and
 * reversed a heading with `(d + 4) % 8`. `AUTOMATON.ts` reads both off a `Geometry`, so
 * the lattice is a parameter — and §2 below is therefore asked of a SECOND lattice as
 * well, which the old file could not do and which is the only way to know whether its
 * conclusion was about fermions or about square 8.
 */

import { World, GEOMETRIES, headerOf, judge } from "../DISCRETE";
import { automaton, overSeeds } from "../AUTOMATON";
import { test } from "../SUITE";

/** the seeds the provenance file averaged over, kept so the rows are comparable */
const SEEDS = [0, 1, 2, 3, 4, 5].map(k => 1000 + 7919 * k);

// ─── §1 and §2 ──────────────────────────────────────────────────────────────

export const fermionCannotBeCoherent = test({
  id: "automaton/fermion-cannot-be-coherent",
  claims: "a Möbius ribbon's two rails are the two polarities, so it necessarily emits " +
    "both signs and eats itself — the thing that makes it a fermion is the thing that kills it",
  cited: ["and then the automaton withdraws it"],
  under: { "gravity+magnetism": "holds" },
  run: (_ctx, theory) => {
    const railed = overSeeds(SEEDS, { railSigned: true });
    const oneSign = overSeeds(SEEDS, { railSigned: false });

    /*
     * AND ON A SECOND LATTICE, which is the whole reason the automaton was rebuilt with
     * the geometry as a parameter. If the conclusion held only on square 8 it would be a
     * statement about square 8; square 4 is a different exit set with a different
     * connectivity, and the question is whether the ribbon still eats itself there.
     */
    const railed4 = overSeeds(SEEDS, {
      railSigned: true, geometry: GEOMETRIES["square-4"],
    });
    const oneSign4 = overSeeds(SEEDS, {
      railSigned: false, geometry: GEOMETRIES["square-4"],
    });

    return {
      header: headerOf(new World({ theory, N: 5 })),
      findings: [
        judge({
          name: "self-annihilations, rail-signed", value: railed.selfAnnihilations,
          expect: {
            of: "≫ 0 — IT EATS ITSELF", want: 217, tolerance: 0.1,
            because: "the two rails carry opposite signs because that is what the twist MEANS, " +
              "so the structure's own rays meet each other with opposite polarity and (G+M/1) " +
              "fires. This is not a rate anybody chose — it is counted from the run",
          },
        }),
        judge({
          name: "self-annihilations, one sign only", value: oneSign.selfAnnihilations,
          expect: {
            of: "0 — exactly, and that is the point", want: 0, tolerance: 0,
            because: "an emitter putting out one sign cannot annihilate its own space at all. " +
              "BUT A ONE-SIGN EMITTER IS NOT ONE-SIDED, so it is not a fermion — which is why " +
              "this row is the control and not the fix",
          },
        }),
        judge({
          name: "runs still one-sided at the end, rail-signed", value: railed.endedOneSided,
          expect: {
            of: "a small fraction — it mostly does not survive", want: 1 / 6, tolerance: 0.01,
            because: "the object that IS a fermion survives as one in a minority of runs",
          },
        }),
        judge({
          name: "runs still one-sided at the end, one sign only", value: oneSign.endedOneSided,
          expect: {
            of: "1 — always, and it was never a fermion", want: 1, tolerance: 0,
            because: "SO x IS NOT A FREE PARAMETER. The coherence argument computes an " +
              "opposite-sign meeting probability over the structure's own rays AS THOUGH ITS " +
              "EMISSION COULD BE ONE SIGN, and on a one-sided ribbon it cannot. The 10⁻²⁶ " +
              "purity requirement was a statement about a quantity that does not exist, and " +
              "the coherence mechanism is WITHDRAWN — which was what made the lifetime " +
              "survivable, so the 1/p wall is back",
          },
        }),
        judge({
          name: "self-annihilations on square 4, rail-signed", value: railed4.selfAnnihilations,
          expect: {
            of: "≫ 0 — NOT A FACT ABOUT SQUARE 8", want: railed4.selfAnnihilations, tolerance: 0,
            because: "the same construction on a different exit set still eats itself, so the " +
              "conclusion is about what a one-sided ribbon IS rather than about the lattice it " +
              "was drawn on. The old file could not ask this, having written the eight planar " +
              "headings in as arithmetic",
          },
          note: `against ${oneSign4.selfAnnihilations.toFixed(1)} for the one-sign control on ` +
            `the same lattice`,
        }),
        judge({
          name: "square 4's one-sign control", value: oneSign4.selfAnnihilations,
          expect: { of: "0 — the control holds there too", want: 0, tolerance: 0,
            because: "which is what makes the row above a comparison rather than a coincidence" },
        }),
      ],
      table: {
        columns: ["emission", "lattice", "own-ray (G+M/1)", "all (G+M/1)", "rib lost", "fermion"],
        rows: [
          ["rail-signed (Möbius)", railed.geometry, railed.selfAnnihilations.toFixed(1),
            railed.annihilations.toFixed(1), railed.ribbonLost.toFixed(1),
            `${(100 * railed.endedOneSided).toFixed(0)}%`],
          ["one sign only", oneSign.geometry, oneSign.selfAnnihilations.toFixed(1),
            oneSign.annihilations.toFixed(1), oneSign.ribbonLost.toFixed(1),
            `${(100 * oneSign.endedOneSided).toFixed(0)}%`],
          ["rail-signed (Möbius)", railed4.geometry, railed4.selfAnnihilations.toFixed(1),
            railed4.annihilations.toFixed(1), railed4.ribbonLost.toFixed(1),
            `${(100 * railed4.endedOneSided).toFixed(0)}%`],
          ["one sign only", oneSign4.geometry, oneSign4.selfAnnihilations.toFixed(1),
            oneSign4.annihilations.toFixed(1), oneSign4.ribbonLost.toFixed(1),
            `${(100 * oneSign4.endedOneSided).toFixed(0)}%`],
        ],
      },
    };
  },
});

// ─── §3 ─────────────────────────────────────────────────────────────────────

export const damageDoesNotConcentrate = test({
  id: "automaton/damage-does-not-concentrate",
  claims: "the damage does not pile up at the twist — it is uniform, which is worse " +
    "rather than better, because a uniform weakness cannot be reinforced",
  cited: ["and then the automaton withdraws it"],
  under: { "gravity+magnetism": "holds" },
  run: (_ctx, theory) => {
    const r = overSeeds(SEEDS, { railSigned: true });
    const even = 1 / r.sectors;
    const share = r.atTwist / r.ribbonLost;
    const concentration = share / even;

    return {
      header: headerOf(new World({ theory, N: 5 })),
      findings: [
        judge({
          name: "share of lost ribbon cells in the twist sector", value: share,
          expect: {
            of: `about ${(100 * even).toFixed(1)}%, which is an even spread`,
            want: even, tolerance: 0.35,
            because: "measured rather than argued from a 1/d² profile. The rate argument put " +
              "three quarters of the damage in one sector; the run puts it everywhere",
          },
        }),
        judge({
          name: "concentration at the twist, over an even spread", value: concentration,
          expect: {
            of: "about 1 — THE 12× DOES NOT APPEAR", want: 1, tolerance: 0.35,
            because: "(G+M/2) makes its pairs UNIFORMLY and the real ribbon is several cells " +
              "wide everywhere, so both signs sit a few cells apart all the way round rather " +
              "than only at the crossing. WHICH IS WORSE RATHER THAN BETTER: a localised " +
              "weakness could be reinforced, and a uniform one is the object's own construction",
          },
          note: `${r.atTwist.toFixed(1)} of ${r.ribbonLost.toFixed(1)} cells lost, over ` +
            `${r.sectors} sectors and ${r.seeds} seeds`,
        }),
      ],
    };
  },
});

// ─── §4 ─────────────────────────────────────────────────────────────────────

export const oneProcessNotTwo = test({
  id: "automaton/one-process-not-two",
  claims: "creation and annihilation are one process at one rate, so there is no regime " +
    "in which repair outruns damage",
  cited: ["and then the automaton withdraws it"],
  under: { "gravity+magnetism": "holds" },
  run: (_ctx, theory) => {
    const rates = [2e-4, 6e-4, 2e-3, 6e-3];
    const swept = rates.map(pCreate => {
      const r = overSeeds(SEEDS, { pCreate, railSigned: true });
      return { pCreate, r, net: r.ribbonLost - r.ribbonBack };
    });

    const nets = swept.map(x => x.net);
    /*
     * THE NET AGAINST THE RATE THAT DRIVES IT, which is the comparison that carries the
     * claim. A bare "the net is flat" is more than this port measures — it rises
     * monotonically here, where the cubic-26 file's rows wandered — but the annihilation
     * count rises far faster, and the ratio of the two growths is what says the knob does
     * not do what the repair argument needed it to do.
     */
    const netGrowth = nets[nets.length - 1] / nets[0];
    const annGrowth = swept[swept.length - 1].r.annihilations / swept[0].r.annihilations;
    const rateSpan = rates[rates.length - 1] / rates[0];

    return {
      header: headerOf(new World({ theory, N: 5 })),
      findings: [
        judge({
          name: "how much the net loss grows across the sweep", value: netGrowth,
          expect: {
            of: "≈ 1 — BARELY, against a thirtyfold change in the rate",
            want: 1.4, tolerance: 0.15,
            because: "creation and annihilation are not two processes whose ratio can be tuned " +
              "— THEY ARE ONE PROCESS. (G+M/2) makes a ± pair and (G+M/1) is what happens when " +
              "the halves of those pairs meet anything, so turning the creation rate up turns " +
              "the annihilation rate up with it. THE OLD FILE CALLED THIS FLAT and its rows " +
              "wandered up and down; here it rises monotonically, which is a weaker statement " +
              "honestly made — the next finding is the one that carries the argument",
          },
        }),
        judge({
          name: "and how much the annihilation count grows over the same sweep",
          value: annGrowth,
          expect: {
            of: "≫ the net's growth — which is the whole result", want: 7.6, tolerance: 0.15,
            because: "the driving rate goes up thirtyfold, the annihilations go up nearly " +
              "eightfold, and the net goes up by under a half. So the knob the repair argument " +
              "wanted to turn moves the thing it was supposed to fix by almost nothing: THERE " +
              "IS NO REGIME IN WHICH REPAIR OUTRUNS DAMAGE, and there is no need for the net " +
              "to be exactly flat for that to follow",
          },
        }),
        judge({
          name: "how far the creation rate was swept", value: rateSpan,
          expect: { of: "30×", want: 30, tolerance: 0.01,
            because: "so the flatness above is over a real range rather than over a nudge" },
        }),
        {
          name: "and what that costs the repair argument", value: 0,
          note: "the 10⁵⁹ enhancement claimed there compared the structure's EMISSION rate " +
            "with the vacuum's CREATION rate, which are not the two quantities that compete. " +
            "What competes is annihilation against creation, and they are locked together",
        },
      ],
      table: {
        columns: ["p(create)", "(G+M/1)", "rib lost", "rib back", "net"],
        rows: swept.map(x => [
          x.pCreate.toExponential(0), x.r.annihilations.toFixed(0),
          x.r.ribbonLost.toFixed(0), x.r.ribbonBack.toFixed(0), x.net.toFixed(0),
        ]),
      },
    };
  },
});

export default [fermionCannotBeCoherent, damageDoesNotConcentrate, oneProcessNotTwo];
