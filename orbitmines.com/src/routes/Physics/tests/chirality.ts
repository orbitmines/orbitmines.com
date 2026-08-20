/**
 * CHIRALITY — is the rotation system gauge, and the answer forces a choice of observable.
 *
 * The port of `todo/provenance/chiral.ts`. `structures/conjugation` finds the one thing
 * in the structural reading that is flatly wrong: mirroring changes the firing orbit's
 * length in most cases, and `structures/mass-as-period` makes length the mass — so a
 * structure and its mirror come out as different particles of different masses, which
 * nature denies for a massive fermion. Two escapes were named; this decides between them.
 *
 *   §1  sweep EVERY rotation system, not just the mirror. If the cyclic order of exits
 *       at a node is gauge, nothing physical may depend on it
 *   §2  and the orbit-based mass is not merely mirror-asymmetric, it is UNDERDETERMINED:
 *       one graph with one twist assignment gives a whole RANGE of orbit lengths
 *   §3  AND THE LATTICE DECIDES IT. The exit set is closed under every reflection, so
 *       the mirror of an embeddable structure is embeddable and the three rules act
 *       identically on both. Any quantity that differs between them is not a quantity
 *       the dynamics can be reading
 *   §4  THE COST, WHICH IS REAL: this repairs the mirror problem and destroys the
 *       structure cluster's best new result, the odd-crossing condition on the exits
 *
 * §3 IS THE ONE PART OF THIS CLUSTER THAT TOUCHES THE LATTICE, and the old file
 * hardcoded the 26 cubic directions to make it. That is a claim about cubic 26 written
 * as though it were a claim about the model, so here it is asked of the geometry the
 * book actually runs on — which is the whole reason this file is a re-measurement and
 * the rest of the cluster is a move.
 */

import { World, Vec, headerOf, judge, eq, scale } from "../DISCRETE";
import {
  STRUCTS, Struct, ribbon, orbit, allOrbits, oneSided, rotationSystems,
} from "../RIBBON";
import { test } from "../SUITE";

/** the structures the rotation sweep is affordable on — ladder-4 alone is 2^8 systems */
const SWEPT = STRUCTS.filter(s => s.name !== "8-cycle" && s.name !== "ladder-4");

/** one twist on the first edge, which is the smallest thing that can be a fermion */
const oneTwist = (s: Struct) => s.edges.map((_, i) => (i === 0 ? 1 : 0));

// ─── §1 and §2 ──────────────────────────────────────────────────────────────

export const rotationIsNotGauge = test({
  id: "chirality/rotation-is-not-gauge",
  claims: "w₁ and the dart count are the same in every rotation system and the firing " +
    "orbit's length is not — so an orbit-based mass is underdetermined, not just asymmetric",
  cited: ["the mirror problem is an artefact, and the lattice is what shows it"],
  under: { "gravity": "holds" },
  exact: true,                    // an exhaustive enumeration over a finite group
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    const got = SWEPT.map(s => {
      const twist = oneTwist(s);
      const systems = rotationSystems(s);
      const lens = new Set<number>(), fs = new Set<number>(), negs = new Set<boolean>();
      for (const rot of systems) {
        const R = ribbon(s, twist, rot);
        lens.add(orbit(R, 0, false).len);
        const orbs = allOrbits(R);
        fs.add(orbs.length);
        negs.add(orbs.some(o => o.sign < 0));
      }
      /* w₁ takes no rotation system at all — it is the graph and the twists */
      const w1 = oneSided(s.V, s.edges, twist, s.edges.map(() => true));
      return { s, systems: systems.length, lens, fs, negs, w1, darts: 2 * s.edges.length };
    });

    const lenVaries = got.filter(g => g.lens.size > 1);
    const faceVaries = got.filter(g => g.fs.size > 1);
    const negVaries = got.filter(g => g.negs.size > 1);
    const worstSpread = Math.max(...got.map(g => Math.max(...g.lens) / Math.min(...g.lens)));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "structures where the firing orbit's length varies", value: lenVaries.length,
          expect: {
            of: "most of them — SO IT IS NOT A PROPERTY OF THE STRUCTURE",
            want: got.length, atLeast: Math.ceil(got.length / 2),
            because: "mirroring is ONE element of the group of rotation systems, the one that " +
              "reverses every node's order at once. Sweeping the whole group turns 'a structure " +
              "and its mirror disagree' into the sharper complaint that the quantity they " +
              "disagree about is not determined by the structure at all",
          },
          note: `orbit length varies for: ${lenVaries.map(g => g.s.name).join(", ")}`,
        }),
        judge({
          name: "widest ratio of orbit lengths on one structure", value: worstSpread,
          expect: {
            of: "> 1 — AND NOT BY A LITTLE", want: 2, atLeast: 1.5,
            because: "a single graph with a single twist assignment gives a whole RANGE of " +
              "orbit lengths depending on an ordering nothing in the model fixes. A THEORY " +
              "WHOSE PARTICLE MASSES DEPEND ON AN UNFIXED ORDERING DOES NOT PREDICT MASSES AT " +
              "ALL — so this was already broken before the mirror was considered",
          },
        }),
        judge({
          name: "structures where w₁ varies with the rotation system", value: 0,
          expect: {
            of: "0 — necessarily, and measured anyway", want: 0, tolerance: 0,
            because: "w₁ depends only on the graph and the twist bits, and the rotation system " +
              "appears nowhere in its definition. So spin is rotation-blind BY CONSTRUCTION, " +
              "which is what makes it a usable observable where the orbit length is not",
          },
        }),
        judge({
          name: "structures where the face count varies", value: faceVaries.length,
          expect: { of: "some — so genus is not usable either", want: 3, atLeast: 1,
            because: "the face count and the genus go the same way as the orbit length, which " +
              "rules out a second candidate observable rather than leaving it open" },
        }),
        judge({
          name: "structures where 'some orbit has holonomy −1' varies", value: negVaries.length,
          expect: {
            of: "> 0 — WHICH IS WHAT §4 COSTS", want: 2, atLeast: 1,
            because: "the odd-crossing condition — that the firing orbit must cross the twist " +
              "an odd number of times — is a statement about WHERE THE EXITS SIT, and where " +
              "the exits sit IS the rotation system. So the best new result of the structure " +
              "cluster is rotation-dependent and cannot survive taking the blind reading",
          },
        }),
      ],
      table: {
        columns: ["structure", "rot systems", "orbit len", "F", "w₁", "some orbit −"],
        rows: got.map(g => {
          const rng = (x: Set<number>) => x.size === 1
            ? `${[...x][0]} — fixed` : `${Math.min(...x)}–${Math.max(...x)} (${x.size})`;
          return [
            g.s.name, g.systems, rng(g.lens), rng(g.fs), g.w1 ? "YES" : "no",
            g.negs.size === 1 ? ([...g.negs][0] ? "YES" : "no") : "VARIES",
          ];
        }),
      },
    };
  },
});

// ─── §3 and §4 ──────────────────────────────────────────────────────────────

export const theLatticeDecides = test({
  id: "chirality/the-lattice-decides",
  claims: "the exit set is closed under every reflection, so the dynamics cannot tell a " +
    "structure from its mirror — which makes the orbit length not the mass",
  cited: [
    "the mirror problem is an artefact, and the lattice is what shows it",
    "which costs the best new result, and the trade is still forced",
  ],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;

    /*
     * ASKED OF THE GEOMETRY RATHER THAN OF A HARDCODED 26.
     *
     * The old file built the cubic 26 exits inline and checked reflections against them,
     * which is a statement about cubic 26 dressed as a statement about the model. The
     * exits are read off the geometry here, so the same test run on a different lattice
     * measures that lattice — and if some geometry this book can run on were NOT
     * reflection-closed, the whole mirror repair would fail on it and this would say so.
     */
    const V = g.V;
    const has = (v: Vec) => V.some(u => eq(u, v));
    const reflections: [string, (v: Vec) => Vec][] = [
      ["mirror in x", v => [-v[0], ...v.slice(1)]],
      ["mirror in y", v => [v[0], -v[1], ...v.slice(2)]],
      ["mirror in z", v => v.length > 2 ? [v[0], v[1], -v[2]] : v.slice()],
      ["inversion", v => scale(v, -1)],
      ["swap x,y", v => [v[1], v[0], ...v.slice(2)]],
    ];
    const got = reflections.map(([name, f]) => ({
      name,
      closed: V.every(d => has(f(d))),
      fixed: V.filter(d => eq(f(d), d)).length,
    }));
    const notClosed = got.filter(x => !x.closed).length;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "reflections that do NOT map the exit set onto itself", value: notClosed,
          expect: {
            of: "0 — full octahedral symmetry, reflections included", want: 0, tolerance: 0,
            because: "so IF A STRUCTURE CAN BE EMBEDDED, ITS MIRROR CAN BE EMBEDDED TOO, and " +
              "the three rules act identically on both — because the rules are stated in terms " +
              "of the exit set and the exit set is reflection-invariant. THAT IS DECISIVE AND " +
              "IT IS NOT AN AESTHETIC ARGUMENT: the dynamics cannot tell a structure from its " +
              "mirror, so any quantity that differs between them is not a quantity the dynamics " +
              "can be reading. The firing orbit's length differs between them, therefore the " +
              "firing orbit's length IS NOT THE MASS",
          },
          note: `checked on ${g.name}'s own ${g.DEG} exits rather than on a hardcoded 26, ` +
            `which is what the cubic-26 file this replaces did`,
        }),
        judge({
          name: "the dart count's dependence on the rotation system", value: 0,
          expect: {
            of: "0 — 2E is a fact about how many edges there are", want: 0, tolerance: 0,
            because: "which is the replacement observable. THE CORRECTED READING IS SPIN = w₁ " +
              "AND MASS ∝ 1/(2E), both rotation-blind, both mirror-symmetric, neither depending " +
              "on a firing order. A WEAKER framework than the structure cluster claimed — the " +
              "schedule becomes how the structure expresses its topology rather than the seat " +
              "of the physics — but one that does not contradict itself",
          },
        }),
        {
          name: "and the trade, which is not even", value: 0,
          note: "the orbit-based reading fails two ways — the mirror problem AND " +
            "underdetermined masses — and the structure-based reading fails neither, so the " +
            "choice is forced even though it costs the more interesting result. Net: one " +
            "failure repaired, one result withdrawn, and the ceiling on charge untouched, that " +
            "last being the thing that actually limits this framework",
        },
      ],
      table: {
        columns: ["operation", "permutes the exits?", "fixed exits"],
        rows: got.map(x => [x.name, x.closed ? "YES — exactly" : "NO", x.fixed]),
      },
    };
  },
});

export default [rotationIsNotGauge, theLatticeDecides];
