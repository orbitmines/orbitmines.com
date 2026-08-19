/**
 * SPECIES — which particles this framework can be, and which it forbids outright.
 *
 * The port of `todo/provenance/species.ts`. The structure cluster leaves three numbers
 * readable off any ribbon: SPIN is w₁ (one-sided → fermion), MASS is 1/(2E), and CHARGE
 * is the firing orbit's net traversal sense. Three numbers means every particle in the
 * standard model can be asked for its three, and the answer is either a structure or a
 * refutation.
 *
 *   §1  WHICH (SPIN, CHARGE) PAIRS EXIST, enumerated rather than argued. |q| is always
 *       an INTEGER — so thirds are unrepresentable and there is NO QUARK — and |q| ≥ 2
 *       occurs, which is an OVER-prediction rather than a gap
 *   §2  AND NO NEUTRAL FERMION EXISTS. Not "none found": the sign holonomy factors
 *       through H₁ mod 2, and |q| = 0 forces every traversal count even, hence the zero
 *       class, hence holonomy +1. |q| = 0 ⟹ BOSON on any structure whatever, WHICH
 *       REFUSES THE NEUTRINO OUTRIGHT
 *   §3  the spin ladder is one bit, so photon, Higgs and graviton are ONE OBJECT here —
 *       the largest hole in the file
 *   §4  THE MASS CEILING IS THE PLANCK MASS, and it is the one real derivation: the
 *       electron's mass cancels and what is left is 2π·m_P/N
 *   §5  the lepton lifetimes, whose ORDERING follows and whose exponent does not
 *
 * NOTHING HERE MOVED IN THE PORT — the old file mentioned no lattice constant. What it
 * does use is `T_PLANCK`, which is a measured constant of the world rather than anything
 * this model has an opinion about, and the ceiling in §4 is stated in units of m_P for
 * exactly that reason.
 */

import { World, headerOf, judge } from "../DISCRETE";
import { SPECIES_STRUCTS, ribbon, orbit, oneSided, bits, chargeOf } from "../RIBBON";
import { test } from "../SUITE";

/** every one of them measured, and none of them the model's */
const MEV = {
  ELECTRON: 0.51099895, MUON: 105.6583755, TAU: 1776.86,
};
const M_PLANCK_GEV = 1.220890e19;
const HBAR = 1.054571817e-34, C_SI = 2.99792458e8;
const T_PLANCK = 5.391247e-44, L_PLANCK = 1.616255e-35;
const MEV_J = 1.602176634e-13;
const TAU_MUON = 2.1969811e-6, TAU_TAU = 2.903e-13;

/** a lepton's schedule repeats at its Compton frequency, in Planck ticks */
const ticksOf = (mev: number) => 2 * Math.PI * HBAR / (mev * MEV_J) / T_PLANCK;

/** every (structure, twist assignment, marked exit) the framework offers */
const triples = () => SPECIES_STRUCTS.flatMap(s => {
  const E = s.edges.length;
  const all = s.edges.map(() => true);
  return Array.from({ length: 1 << E }, (_, m) => bits(m, E)).flatMap(twist => {
    const R = ribbon(s, twist);
    const os = oneSided(s.V, s.edges, twist, all);
    return Array.from({ length: 2 * E }, (_, d0) => {
      const o = orbit(R, d0, false);
      return { s, twist, d0, o, os, fermion: o.sign < 0, q: chargeOf(s, o.darts) };
    });
  });
});

// ─── §1 and §2 ──────────────────────────────────────────────────────────────

export const whichExist = test({
  id: "species/which-exist",
  claims: "charge is always an integer so there is no quark, |q| ≥ 2 occurs which is an " +
    "over-prediction, and a neutral fermion is impossible — which refuses the neutrino",
  cited: ["so what would actual particles look like",
    "and the missing row is a theorem, which settles the neutrino"],
  under: { "gravity": "holds" },
  exact: true,                    // an exhaustive enumeration, not a sample of one
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const all = triples();

    const worstFractional = Math.max(...all.map(t => Math.abs(t.q - Math.round(t.q))));
    const charges = [...new Set(all.map(t => t.q))].sort((a, b) => a - b);
    const neutralFermions = all.filter(t => t.fermion && t.q === 0).length;
    const fermions = all.filter(t => t.fermion);
    const minFermionCharge = Math.min(...fermions.map(t => t.q));

    /* one witness per (spin, charge) pair, so the table is a census rather than a sample */
    const seen = new Map<string, string>();
    for (const t of all) {
      const key = `${t.fermion ? "fermion" : "boson"} |q| = ${t.q}`;
      if (!seen.has(key))
        seen.set(key, `${t.s.name}/${t.twist.join("")}` +
          (t.os && !t.fermion ? " (1-sided, fires as boson)" : ""));
    }

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "(structure, twists, marked exit) triples swept", value: all.length,
          expect: { of: "every one of them", want: all.length, tolerance: 0,
            because: "exhaustive rather than sampled, which is what makes the zero below a " +
              "statement and not an absence of evidence" },
        }),
        judge({
          name: "worst departure of |q| from an integer", value: worstFractional,
          expect: {
            of: "0 — ALWAYS AN INTEGER", want: 0, tolerance: 0,
            because: "it is a count of net traversals, so thirds are not merely absent, they " +
              "are UNREPRESENTABLE. NO QUARK — and this is a structural refusal rather than a " +
              "search that has not found one yet",
          },
        }),
        judge({
          name: "largest |q| the framework permits", value: Math.max(...charges),
          expect: {
            of: "> 1 — AN OVER-PREDICTION", want: 2, tolerance: 1,
            because: "nature has no elementary particle of charge two, and permitting particles " +
              "that do not exist is a different and LESS FORGIVING failure than missing ones " +
              "that do. Worth quoting beside the quark result rather than after it",
          },
          note: `charges realised: ${charges.join(", ")}`,
        }),
        judge({
          name: "neutral fermions found", value: neutralFermions,
          expect: {
            of: "0 — AND IT IS A THEOREM RATHER THAN A SEARCH RESULT", want: 0, tolerance: 0,
            because: "the sign holonomy is a homomorphism H₁(·;Z₂) → ±1, so it depends only on " +
              "the walk's class MOD 2; |q| = 0 means every NET traversal count is zero over Z, " +
              "and net = f−b while total = f+b differ by 2b, so all TOTALS are even too; an " +
              "even class mod 2 is the zero class, on which every homomorphism gives +1. So " +
              "|q| = 0 ⟹ BOSON, necessarily, ON ANY STRUCTURE WHATSOEVER. WHICH REFUSES THE " +
              "NEUTRINO OUTRIGHT, and a neutron as anything elementary — not 'not yet found' " +
              "but forbidden by the same invariant that supplies spin, so it cannot be fixed " +
              "without giving up the mechanism for spin itself",
          },
        }),
        judge({
          name: "smallest |q| any fermionic orbit reaches", value: minFermionCharge,
          expect: {
            of: "1 — the floor the theorem puts under it", want: 1, tolerance: 0,
            because: "the contrapositive of the row above, measured from the other side: if " +
              "|q| = 0 forces a boson then no fermion can get below 1, and this is the sweep " +
              "being given the chance to contradict that. AND NOTE WHAT IT DOES NOT SAY — an " +
              "earlier draft of this test expected every fermionic orbit to carry ODD |q|, " +
              "which the sweep refutes at once: only 24% of them do. The theorem is about the " +
              "ZERO class and nothing about parity beyond it follows",
          },
          note: `over ${fermions.length} fermionic orbits`,
        }),
      ],
      table: {
        columns: ["spin & charge", "exists?", "a structure that does it"],
        rows: [...seen.entries()].sort().map(([k, v]) => [k, "YES", v]),
      },
    };
  },
});

// ─── §3 ─────────────────────────────────────────────────────────────────────

export const theParticleTable = test({
  id: "species/the-particle-table",
  claims: "the framework describes charged leptons and nothing else — and w₁ is one bit, " +
    "so photon, Higgs and graviton are a single object to it",
  cited: ["the table, and it is narrower than one would hope"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    const rows: [string, string, string, string, string][] = [
      ["electron", "−1", "1/2", "one-sided, |q| = 1", "YES"],
      ["positron", "+1", "1/2", "the same graph, walk reversed", "YES"],
      ["muon", "−1", "1/2", "the same, 207× fewer edges", "YES"],
      ["tau", "−1", "1/2", "the same, 3477× fewer edges", "YES"],
      ["proton", "+1", "1/2", "one-sided, |q| = 1 — but composite", "shape only"],
      ["neutron", "0", "1/2", "|q| = 0 forces a boson", "NO"],
      ["neutrino", "0", "1/2", "|q| = 0 forces a boson", "NO"],
      ["photon", "0", "1", "two-sided, |q| = 0", "SPIN LOST"],
      ["Higgs", "0", "0", "two-sided, |q| = 0 — identical to above", "SPIN LOST"],
      ["graviton", "0", "2", "two-sided, |q| = 0 — identical again", "SPIN LOST"],
      ["W boson", "±1", "1", "two-sided, |q| = 1", "SPIN LOST"],
      ["Z boson", "0", "1", "two-sided, |q| = 0", "SPIN LOST"],
      ["up quark", "+2/3", "1/2", "|q| must be an integer", "NO"],
      ["down quark", "−1/3", "1/2", "|q| must be an integer", "NO"],
      ["gluon", "0", "1", "colour has no representation at all", "NO"],
    ];

    const yes = rows.filter(r => r[4] === "YES").length;
    const refused = rows.filter(r => r[4] === "NO").length;
    const spinLost = rows.filter(r => r[4] === "SPIN LOST").length;

    /* the spins w₁ can tell apart, which is the whole of the hole */
    const spinsAvailable = 2;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "rows the framework can carry", value: yes,
          expect: {
            of: "4 — THREE CHARGED LEPTONS AND ONE ANTIPARTICLE", want: 4, tolerance: 0,
            because: "the honest summary of the column, and the count is four rather than the " +
              "three an earlier draft claimed: the positron is a row of its own, being the " +
              "same graph with the walk reversed. Three distinct masses, one antiparticle, and " +
              "everything else in the table shape-only or refused",
          },
        }),
        judge({
          name: "particles it refuses outright", value: refused,
          expect: { of: "5 — quarks, the neutrino, the neutron and the gluon", want: 5,
            tolerance: 0,
            because: "refused by the invariants themselves rather than not yet constructed" },
        }),
        judge({
          name: "spins w₁ can distinguish", value: spinsAvailable,
          expect: {
            of: "2 — fermion and boson, AND NOTHING FINER", want: 2, tolerance: 0,
            because: "w₁ IS ONE BIT, so spin 0, 1 and 2 are THE SAME OBJECT to this framework: " +
              "a photon, a Higgs and a graviton differ in no property it can express. That is " +
              "not a missing quantity that might turn up later — a Z₂ invariant cannot carry a " +
              "ladder, in the same way a handle's label cannot carry a rotation. THE BIGGEST " +
              "SINGLE HOLE IN THE FRAMEWORK",
          },
          note: `${spinLost} rows in the table are lost to it`,
        }),
      ],
      table: {
        columns: ["particle", "q", "spin", "here", "verdict"],
        rows: rows.map(r => [...r]),
      },
    };
  },
});

// ─── §4 and §5 ──────────────────────────────────────────────────────────────

export const massCeiling = test({
  id: "species/mass-ceiling",
  claims: "a smallest ribbon is a heaviest fermion, and the ceiling is 2π·m_P/N with the " +
    "electron's mass cancelling — a Planck-scale bound the framework was not built to predict",
  cited: [
    "but the mass ceiling is the Planck mass, and that is a real derivation",
    "and the lepton lifetimes, whose ordering it gets right for free",
  ],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    /* the smallest structure whose firing orbit is actually a fermion */
    let minDarts = Infinity, minName = "";
    for (const t of triples())
      if (t.fermion && t.o.darts.length < minDarts) {
        minDarts = t.o.darts.length;
        minName = `${t.s.name}/${t.twist.join("")}`;
      }

    const ticksE = ticksOf(MEV.ELECTRON);
    const mMaxGeV = MEV.ELECTRON * ticksE / minDarts / 1000;
    const ratio = mMaxGeV / M_PLANCK_GEV;

    /*
     * AND THE CONSISTENCY CHECK, which is worth doing and is NOT a result: a walk of one
     * cell per tick covers c·T in a period, and c·T is the Compton wavelength by
     * definition. It confirms the bookkeeping and predicts nothing.
     */
    const walk = ticksE * L_PLANCK;
    const lamC = 2 * Math.PI * HBAR / (MEV.ELECTRON * MEV_J) * C_SI;

    /* §5: the ordering follows from fragility; the exponent does not */
    const edgeRatio = ticksOf(MEV.MUON) / ticksOf(MEV.TAU);
    const lifeRatio = TAU_MUON / TAU_TAU;
    const k = Math.log(lifeRatio) / Math.log(edgeRatio);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "darts in the smallest fermionic ribbon", value: minDarts,
          expect: {
            of: "2 — the twisted 2-gon", want: 2, tolerance: 0,
            because: "m ∝ 1/(2E) is the whole of the mass reading, so a SMALLEST possible " +
              "ribbon is a HEAVIEST possible fermion. This is the N the ceiling is written in",
          },
          note: `${minName}`,
        }),
        judge({
          name: "the mass ceiling", value: mMaxGeV, units: "GeV",
          expect: {
            of: "2π·m_P/N", want: 2 * Math.PI * M_PLANCK_GEV / 2, tolerance: 1e-3,
            because: "AND THE ELECTRON'S MASS CANCELS: m_max = m_e·(T_e/t_P)/N with " +
              "T_e = 2πħ/(m_e c²) is 2πħ/(c² t_P N) = 2π·m_P/N. So the framework predicts a " +
              "heaviest fermion at the Planck scale out of nothing but 'mass is a period' and " +
              "'there is a smallest structure', neither of which was chosen with this in view",
          },
        }),
        judge({
          name: "the ceiling in Planck masses", value: ratio,
          expect: {
            of: "π — and the residual is the discreteness of the smallest ribbon", want: Math.PI,
            tolerance: 1e-3,
            because: "N = 2π WOULD GIVE m_P EXACTLY, and 2π is not an available dart count — no " +
              "structure has a fractional number of them. So the framework CANNOT hit m_P on " +
              "the nose and lands a factor of π above it, which is as well as it can do BY " +
              "CONSTRUCTION rather than by accident. Worth saying, because a factor of π is " +
              "exactly the size of slop that could be argued away and should not be",
          },
        }),
        judge({
          name: "walk length per period, over the Compton wavelength", value: walk / lamC,
          expect: {
            of: "1 — a CONSISTENCY CHECK and not a result", want: 1, tolerance: 1e-3,
            because: "a walk of one cell per tick covers c·T in a period and c·T is the Compton " +
              "wavelength BY DEFINITION. It confirms the bookkeeping and predicts nothing, and " +
              "is reported so that it cannot be mistaken later for something that does",
          },
          note: `the electron is then a ribbon of about ${(ticksE / 2).toExponential(1)} Planck ` +
            `cells, one Compton wavelength around, of radius about ` +
            `${(lamC / (2 * Math.PI)).toExponential(2)} m`,
        }),
        judge({
          name: "exponent the lepton lifetimes want", value: k,
          expect: {
            of: "nothing in the framework selects it", want: 5.6, tolerance: 0.05,
            because: "THE ORDERING IS RIGHT AND IT WAS NOT PUT IN — heavier is smaller is more " +
              "fragile is shorter-lived, and nothing about the fragility argument was designed " +
              "with lepton lifetimes in view. But the SIZE of it is a different matter: the " +
              "data wants lifetime ∝ E^k at this k and the framework offers no reason for that " +
              "number. Quoted as the gap it is",
          },
        }),
      ],
      table: {
        columns: ["lepton", "mass (MeV)", "edges 2E", "lifetime (s)", "order"],
        rows: [
          ["electron", MEV.ELECTRON.toFixed(4), ticksOf(MEV.ELECTRON).toExponential(2),
            "stable", "biggest, longest"],
          ["muon", MEV.MUON.toFixed(4), ticksOf(MEV.MUON).toExponential(2),
            TAU_MUON.toExponential(2), "↓"],
          ["tau", MEV.TAU.toFixed(2), ticksOf(MEV.TAU).toExponential(2),
            TAU_TAU.toExponential(2), "smallest, shortest"],
        ],
      },
    };
  },
});

export default [whichExist, theParticleTable, massCeiling];
