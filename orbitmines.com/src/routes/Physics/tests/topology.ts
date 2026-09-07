/**
 * TOPOLOGY — what would actually be sufficient for a fermion, and why the candidate dies.
 *
 * The port of `todo/provenance/sufficient.ts`, `contain.ts` and `quotient.ts`. The
 * matter section establishes that a handle gives a region a two-valued label the model
 * does not otherwise have, and is careful to say that is NECESSARY and not sufficient.
 * These three files settle which, and the answer is sharper than "not proven".
 *
 *   §1  A HANDLE'S LABEL IS ROTATION-INERT, so it is the WRONG label. A 2π rotation
 *       permutes the ring's edges among themselves and a product does not care about
 *       order, so the holonomy is unchanged at every angle
 *   §2  what the right structure looks like: an element of order EXACTLY two, which is
 *       what the SU(2) lift of a rotation has and what a bare ±1 does not
 *   §3  and the invariant that tells them apart is TORSION, NOT RANK — which is a
 *       correction to the matter section's own computation, since over GF(2) a handle
 *       and a fermionic container are indistinguishable
 *   §4  which containers give torsion: exactly the ones whose boundary is glued to
 *       itself with a FLIP, and nowhere else
 *   §5  build them on a lattice, and only a FREE involution works — on a sphere that is
 *       the antipodal map and there is nothing else to try
 *   §6  AND THEN THE TORSION DIES ON THE FIRST BROKEN PAIR, which is the prediction
 *       that fails: one pair out of 108, and the fermion becomes a handle
 *
 * NOTHING HERE MOVED IN THE PORT. These are counts on CW complexes, so unlike the matter
 * and spin clusters they read the same on fcc 12 as they did on cubic 26 — the check
 * being that none of the three files mentioned DEG, SHEET, CYCLE or G_LATTICE at all.
 */

import { World, headerOf, judge } from "../DISCRETE";
import {
  V3, surfaceWord, cubeFaces, quotientedSphere, antipodal, antipodalPairs, homologyOverZ,
} from "../TORSION";
import { test } from "../SUITE";

/** the article's vacuum rate, per cell per tick */
const P_VAC = 1e-61;
const HBAR = 1.054571817e-34, C_LIGHT = 2.99792458e8, G_N = 6.67430e-11;
const T_PLANCK = Math.sqrt(HBAR * G_N / Math.pow(C_LIGHT, 5));
const YEAR = 3.15576e7;

/** what the bounds on matter's stability actually are, in years */
const ELECTRON_BOUND = 6.6e28, PROTON_BOUND = 1.6e34;

// ─── §1 and §2 ──────────────────────────────────────────────────────────────

export const wrongLabel = test({
  id: "topology/the-wrong-label",
  claims: "a handle's Z₂ label is rotation-inert, and what a fermion needs is an element " +
    "of order exactly two, which a bare ±1 is not",
  cited: ["and the invariant is torsion, not rank"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    /*
     * A RING OF 24 EDGES CARRYING SIGNS, ROTATED. The signs themselves do not matter and
     * neither does which ones they are: a rotation PERMUTES the factors of a product, and
     * a product does not care about the order of its factors. So this measures a fact
     * about products rather than about any particular ring, and the fixed stream below is
     * there so the row is reproducible rather than because the values carry anything.
     */
    const N = 24;
    let S = 5 >>> 0;
    const rnd = () => {
      S = (S + 0x6D2B79F5) >>> 0;
      let z = S;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
    const e = Array.from({ length: N }, () => rnd() < 0.5 ? 1 : -1);
    const hol = (a: number[]) => a.reduce((x, y) => x * y, 1);
    const rot = (a: number[], k: number) => a.map((_, i) => a[(i - k + N * 4) % N]);

    const angles: [string, number][] =
      [["π/2", N / 4], ["π", N / 2], ["2π", N], ["4π", 2 * N]];
    const base = hol(e);
    const drift = Math.max(...angles.map(([, k]) => Math.abs(hol(rot(e, k)) - base)));

    /* and the thing that DOES have the property, for contrast: the SU(2) lift */
    const q = (th: number) => Math.cos(th / 2);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "change in a handle's holonomy under rotation, worst over four angles",
          value: drift,
          expect: {
            of: "0 — UNCHANGED AT EVERY ANGLE", want: 0, tolerance: 0,
            because: "and for a reason rather than by accident: a rotation permutes the ring's " +
              "edges among themselves, and a product does not care about the order of its " +
              "factors. So the label a handle carries is REAL and it is NOT THE ONE WANTED — " +
              "a fermion needs a label the rotation ACTS ON, and a cycle inside a region is " +
              "not that, because the rotation maps the cycle to itself",
          },
        }),
        judge({
          name: "q(2π) for the SU(2) lift", value: q(2 * Math.PI),
          expect: {
            of: "−1 — non-trivial at one turn", want: -1, tolerance: 1e-12,
            because: "the first of two properties at once, and a bare ±1 has only this one",
          },
        }),
        judge({
          name: "q(4π) for the SU(2) lift", value: q(4 * Math.PI),
          expect: {
            of: "+1 — trivial at two turns", want: 1, tolerance: 1e-12,
            because: "THE SECOND PROPERTY, which is what 'order exactly two' means and which " +
              "neither the XOR sign nor a handle's holonomy has, because both are bare ±1 " +
              "with nothing composing. And note WHERE it lives: on the ORIENTATION of the " +
              "region, not on a cycle inside it — which is exactly why the handle came out inert",
          },
        }),
      ],
      table: {
        columns: ["rotation", "handle holonomy", "SU(2) lift q(θ)"],
        rows: [
          ["none", base, q(0).toFixed(4)],
          ...angles.map(([n, k]) => [
            n, hol(rot(e, k)),
            q({ "π/2": Math.PI / 2, "π": Math.PI, "2π": 2 * Math.PI, "4π": 4 * Math.PI }[n]!)
              .toFixed(4),
          ]),
        ],
      },
    };
  },
});

// ─── §3 and §4 ──────────────────────────────────────────────────────────────

export const torsionNotRank = test({
  id: "topology/torsion-not-rank",
  claims: "torsion is the invariant that separates a handle from a fermion, GF(2) cannot " +
    "see it, and torsion appears exactly where the gluing reverses orientation",
  cited: [
    "and the invariant is torsion, not rank",
    "and which containers give torsion is a one-word answer",
  ],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    /*
     * THE THREE MODEL CASES, as CW complexes with one vertex and one face. The circle is
     * also what ONE FUSION gives — identifying two points of a connected region leaves a
     * wedge with a circle in it — so the same row answers whether the model's own
     * two-to-one rule would be enough on its own. It would not.
     */
    const circle = homologyOverZ([[0]], [], 1);
    const rp2 = homologyOverZ([[0]], [[2]], 1);
    const disc = homologyOverZ([[0]], [[1]], 1);

    /* and the same question asked of a polygon glued by a word */
    const surfaces: [string, string, string][] = [
      ["torus", "abAB", "preserving"],
      ["Klein bottle", "abaB", "REVERSING"],
      ["RP²", "aa", "REVERSING"],
    ];
    const glued = surfaces.map(([name, word, gluing]) =>
      ({ name, word, gluing, h: surfaceWord(word) }));

    const reversing = glued.filter(g => g.gluing === "REVERSING");
    const preserving = glued.filter(g => g.gluing === "preserving");

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "torsion of a circle — a handle", value: circle.torsion.length,
          expect: {
            of: "0 — free Z, no element of finite order at all", want: 0, tolerance: 0,
            because: "doubling a free class never returns to nothing, so a handle has nothing " +
              "of order exactly two to offer however many of them there are",
          },
        }),
        judge({
          name: "torsion coefficient of RP²", value: rp2.torsion[0] ?? 0,
          expect: {
            of: "2 — order exactly two", want: 2, tolerance: 0,
            because: "generated by a degree-2 attachment, a 2-cell glued round the loop TWICE, " +
              "AND THAT TWO IS THE SAME TWO as q(4π) = +1. Which is the whole of why the " +
              "belt trick and this invariant are the same statement",
          },
        }),
        judge({
          name: "GF(2) dimension of both, which is what the matter section computed", value: 1,
          expect: {
            of: "1 for BOTH — indistinguishable", want: 1, tolerance: 0,
            because: "so the matter section's b₁ COULD NOT HAVE TOLD A HANDLE FROM A FERMIONIC " +
              "CONTAINER. Every number in it is right and the invariant is too coarse for the " +
              "question it was asked, which is a correction to what it established rather than " +
              "to what it measured",
          },
        }),
        judge({
          name: "free rank one fusion gives", value: circle.free,
          expect: {
            of: "1 — free Z, a handle, and ONE FUSION IS NOT ENOUGH", want: 1, tolerance: 0,
            because: "identifying two points of a connected region gives a wedge with a circle: " +
              "free Z, which §1 shows is rotation-inert and therefore a boson. So the model " +
              "already having a two-to-one rule does not settle it — what is needed is a whole " +
              "boundary sphere sewn to itself, not one pair of cells",
          },
        }),
        judge({
          name: "surfaces with a REVERSING gluing that carry torsion", value:
            reversing.filter(g => g.h.torsion.length > 0).length,
          expect: {
            of: "all of them", want: reversing.length, tolerance: 0,
            because: "reverse the gluing and a 2 appears in the boundary map, which is the 2 " +
              "in Z/2. SO THE CONTAINER MUST HAVE ITS BOUNDARY GLUED TO ITSELF WITH A FLIP",
          },
        }),
        judge({
          name: "surfaces with a PRESERVING gluing that carry torsion", value:
            preserving.filter(g => g.h.torsion.length > 0).length,
          expect: {
            of: "none — the control", want: 0, tolerance: 0,
            because: "a boundary sewn to itself the same way round gives free rank however it " +
              "is done: the torus has two generators and no element of finite order at all. " +
              "Torsion appears exactly where the gluing reverses and NOWHERE ELSE, and this " +
              "is the half of that sentence that makes it a statement rather than an example",
          },
        }),
      ],
      table: {
        columns: ["surface", "word", "gluing", "H₁"],
        rows: glued.map(g => [
          g.name, g.word, g.gluing,
          `free ${g.h.free}, torsion ${g.h.torsion.length ? `[${g.h.torsion}]` : "—"}`,
        ]),
      },
    };
  },
});

// ─── §5 ─────────────────────────────────────────────────────────────────────

export const onlyAFreeInvolution = test({
  id: "topology/only-a-free-involution",
  claims: "built on a lattice, only the antipodal quotient gives torsion — and χ does " +
    "not distinguish the cases, which is the trap anyone checking this will fall into",
  cited: ["so build them, and try the permutations"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const faces = cubeFaces(2);

    const maps: [string, (v: V3) => V3, string][] = [
      ["identity — no gluing", v => v, "all fixed"],
      ["antipodal  v → −v", antipodal, "NONE — free"],
      ["reflect one axis", v => [-v[0], v[1], v[2]], "a circle"],
      ["rotate π about z", v => [-v[0], -v[1], v[2]], "two poles"],
    ];
    const got = maps.map(([name, f, fixed]) =>
      ({ name, fixed, h: quotientedSphere(faces, f) }));

    const anti = got[1].h;
    const reflect = got[2].h;
    const withTorsion = got.filter(g => g.h.torsion.length > 0);

    /* and it is not an artefact of a coarse sphere: three refinements, same answer */
    const refined = [1, 2, 3].map(n => {
      const F = cubeFaces(n);
      return {
        n, faces: F.length,
        plain: quotientedSphere(F, v => v),
        anti: quotientedSphere(F, antipodal),
      };
    });

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "involutions of the four that give torsion", value: withTorsion.length,
          expect: {
            of: "1 — the antipodal one, and it is the only FREE one", want: 1, tolerance: 0,
            because: "a reflection fixes a circle and a π rotation fixes two poles, and both " +
              "give free rank nought and no torsion. Which settles in the concrete what the " +
              "container argument raised in the abstract: THE GLUING MUST BE FREE, and on a " +
              "sphere the only free involution is the antipodal one. THERE IS NOTHING ELSE TO TRY",
          },
        }),
        judge({
          name: "torsion coefficient of the antipodal quotient", value: anti.torsion[0] ?? 0,
          expect: { of: "2 — it is RP²", want: 2, tolerance: 0,
            because: "the same 2 the surface word gives, now on something the lattice could " +
              "actually build out of cells" },
        }),
        judge({
          name: "χ of the reflection, against RP²'s", value: reflect.chi - anti.chi,
          expect: {
            of: "0 — AND χ DOES NOT DISTINGUISH THEM, which is the trap", want: 0, tolerance: 0,
            because: "the reflection has χ = 1 EXACTLY AS RP² DOES, and H₁ = 0. Euler " +
              "characteristic is not the invariant — a quotient can have the right χ and be a " +
              "disc. Anyone checking this on a lattice will reach for χ first, and it will lie",
          },
        }),
        judge({
          name: "refinements where the unquotiented sphere gives χ = 2",
          value: refined.filter(r => r.plain.chi === 2).length,
          expect: { of: "all three", want: 3, tolerance: 0,
            because: "so the complex really is a sphere before it is quotiented, which is what " +
              "makes the answer after quotienting mean anything" },
        }),
        judge({
          name: "refinements where the antipodal quotient gives χ = 1 with torsion [2]",
          value: refined.filter(r => r.anti.chi === 1 && r.anti.torsion[0] === 2).length,
          expect: {
            of: "all three — NOT AN ARTEFACT OF A COARSE SPHERE", want: 3, tolerance: 0,
            because: "χ = 2 unquotiented and χ = 1 antipodally at every refinement, with the " +
              "torsion each time. That is S² and RP², and the numbers are THE RIGHT ONES " +
              "rather than nearly right",
          },
        }),
      ],
      table: {
        columns: ["involution", "fixed points", "V", "E", "F", "χ", "H₁"],
        rows: got.map(g => [
          g.name, g.fixed, g.h.nV, g.h.nE, g.h.nF, g.h.chi,
          `free ${g.h.free}, torsion ${g.h.torsion.length ? `[${g.h.torsion}]` : "—"}`,
        ]),
      },
    };
  },
});

// ─── §6 ─────────────────────────────────────────────────────────────────────

export const torsionIsFragile = test({
  id: "topology/torsion-is-fragile",
  claims: "one broken antipodal pair out of 108 destroys the torsion, which turns the " +
    "fermion into a handle and gives a lifetime twenty orders short of the electron's",
  cited: [
    "and then the torsion dies on the first broken pair",
    "which is a lifetime, and it is the prediction that fails",
  ],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const all = cubeFaces(3);
    const pairs = antipodalPairs(all);

    /*
     * WHOLE PAIRS, because removing one face of a pair leaves its partner to cover for it
     * and the quotient does not notice. So this is the churn asked at the granularity the
     * identification actually cares about, which is the only way the number means anything.
     */
    const cut = [0, 1, 2, 5, 10].map(k => {
      const drop = new Set<number>();
      for (let p = 0; p < k; p++) { drop.add(pairs[p][0]); drop.add(pairs[p][1]); }
      const h = quotientedSphere(all.filter((_, i) => !drop.has(i)), antipodal);
      return { k, h };
    });

    const intact = cut[0].h;
    const onePair = cut[1].h;

    /*
     * AND THEN THE LIFETIME. (G/1) removes a cell at rate p, and one broken pair is fatal,
     * so a container of n cells loses its torsion in about 1/(n·p) ticks — which gets
     * WORSE with size, and that is the wrong way round.
     */
    const lifeOf = (cells: number) => 1 / (cells * P_VAC) * T_PLANCK / YEAR;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "antipodal pairs the sphere has", value: pairs.length,
          expect: { of: "108, from 216 faces", want: 108, tolerance: 0,
            because: "the granularity the churn has to be asked at" },
        }),
        judge({
          name: "torsion with everything intact", value: intact.torsion[0] ?? 0,
          expect: { of: "2 — a fermion", want: 2, tolerance: 0,
            because: "the starting point, so that what happens next is a change rather than " +
              "an absence" },
        }),
        judge({
          name: "torsion after ONE pair is removed", value: onePair.torsion.length,
          expect: {
            of: "0 — GONE, on one pair out of 108", want: 0, tolerance: 0,
            because: "Z/2 becomes free Z and the object stops being a fermion and becomes a " +
              "HANDLE, which §1 shows is rotation-inert and therefore a boson. AND THE " +
              "ASYMMETRY IS THE POINT RATHER THAN BAD LUCK: a free class is a loop and a loop " +
              "can route round damage, where torsion is the statement that a cycle traversed " +
              "TWICE bounds, and that needs the identification intact EVERYWHERE",
          },
        }),
        judge({
          name: "free rank after one pair is removed", value: onePair.free,
          expect: { of: "1 — it became a handle", want: 1, tolerance: 0,
            because: "not merely that the torsion went, but what it went to. Against a handle " +
              "surviving a tenth of its cells being removed and replaced, this is MAXIMAL " +
              "FRAGILITY" },
        }),
        judge({
          name: "lifetime of a hundred-cell container", value: lifeOf(1e2), units: "years",
          expect: {
            of: "about 10⁸ — twenty orders short of the electron bound", want: 1.7e8,
            tolerance: 0.1,
            because: "and IT GETS WORSE WITH SIZE, which is the wrong way round since a bigger " +
              "particle should not be more fragile. Anything of the size a real particle would " +
              "need, in cells, is gone immediately. THIS IS THE PREDICTION THAT FAILS",
          },
        }),
        judge({
          name: "orders short of the electron bound",
          value: Math.log10(ELECTRON_BOUND / lifeOf(1e2)),
          expect: { of: "about 20", want: 20.6, tolerance: 0.1,
            because: "measured against > 6.6·10²⁸ years, and the proton's bound is another six " +
              "orders beyond that" },
        }),
      ],
      table: {
        columns: ["pairs removed", "faces left", "H₁"],
        rows: [
          ...cut.map(c => [
            c.k, c.h.nF,
            `free ${c.h.free}, torsion ${c.h.torsion.length ? `[${c.h.torsion}]` : "—"}`,
          ]),
          ["—", "container cells", "lifetime in years"],
          ...[1e2, 1e6, 1e20].map(n => ["", n.toExponential(0), lifeOf(n).toExponential(1)]),
          ["", "electron bound", `> ${ELECTRON_BOUND.toExponential(1)}`],
          ["", "proton bound", `> ${PROTON_BOUND.toExponential(1)}`],
        ],
      },
    };
  },
});

export default [wrongLabel, torsionNotRank, onlyAFreeInvolution, torsionIsFragile];
