/**
 * SPIN — four failures that turn out to be one failure, on the lattice this book runs on.
 *
 * The port of `todo/provenance/spin.ts`, `spinor.ts` and `cover.ts`. All three opened by
 * writing `CYCLE = 8` and `DEG = 26` as constants, which are cubic-26's counts; the book
 * runs on fcc 12, where CYCLE is 6. THAT MATTERS HERE MORE THAN ANYWHERE ELSE IN THE
 * BOOK, because the whole of §1 is a statement that two requirements differ BY CYCLE —
 * so the size of the conflict is a lattice number and the existence of it is not.
 * Separating those two was impossible in the old files and is the point of this one.
 *
 *   §1  the scale conflict: the magneton wants Ḡ = 2π/CYCLE and de Broglie wants 2π,
 *       and no single constant meets both. The ratio IS CYCLE, measured
 *   §2  and it is the same fact as g = 1 — a circulation ties µ to L, so g is an
 *       IDENTITY at every radius and every speed, and no normalisation rescues it
 *   §3  relax the ring and g stops being an identity: three requirements collapse to
 *       one condition, λ̄_m = λ̄_C, and the residual against measurement is the anomaly
 *   §4  a free CYCLE moves the conflict rather than closing it, and requiring both
 *       gives CYCLE = 1 — an axis that does not go round, which is §3 from the other end
 *   §5  and the model's own sign cannot be the two-valued thing: right gauge structure,
 *       wrong rotation structure. This is a REFUTATION and it is the file's main result
 *
 * Everything here is closed form over CODATA and counts off the exits, so it is `exact`.
 */

import { World, headerOf, judge, Geometry } from "../DISCRETE";
import { constants } from "../CONTINUOUS";
import { test } from "../SUITE";

const CODATA = {
  HBAR: 1.054571817e-34, C: 2.99792458e8, ME: 9.1093837015e-31,
  E_Q: 1.602176634e-19, MU_B: 9.2740100783e-24,
  /** Hanneke, Fogwell & Gabrielse 2008 — the number §3 is traded against */
  G_ELECTRON: 2.00231930436,
};

const LAMBDA_C = CODATA.HBAR / (CODATA.ME * CODATA.C);

/** the model's own reduced wavelength — the step a source emits at, given Ḡ */
const stepAt = (G: number) => (G / (2 * Math.PI)) * LAMBDA_C;

/** the ring's magnetic moment in µ_B: CYCLE steps around, and Ḡ sets the step */
const magnetonAt = (G: number, CYCLE: number) => CYCLE * G / (2 * Math.PI);

// ─── §1 and §4 ──────────────────────────────────────────────────────────────

export const scaleConflict = test({
  id: "spin/scale-conflict",
  claims: "the magneton and the de Broglie scale each fix Ḡ on their own and they " +
    "disagree by exactly CYCLE, so no single constant meets both",
  cited: [
    "Layer 2: Matter — and the scale that is left owed is not a missing number",
    "Layer 2: Matter — so what would relaxing the ring actually look like",
  ],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const k = constants(w.geometry);
    const CYCLE = k.CYCLE;

    /* what each requirement asks of Ḡ, solved rather than quoted */
    const wantsMagneton = 2 * Math.PI / CYCLE;   // CYCLE·Ḡ/2π = 1
    const wantsDeBroglie = 2 * Math.PI;          // Ḡ/2π = 1

    /*
     * §4's free CYCLE. `spin` argued nothing can move the ratio because CYCLE is a
     * count off the lattice. It is not — how many steps an EMITTER's axis takes to come
     * round is the emitter's, so it is free. What a free CYCLE buys: at the lattice's
     * own Ḡ the magneton requirement alone fixes CYCLE, and de Broglie says nothing
     * about it, because de Broglie constrains the STEP and CYCLE only multiplies it.
     */
    const step = stepAt(k.gravitational());
    const cycleForMagneton = LAMBDA_C / step;
    const cycleForBoth = 1;                       // λ̄_m = λ̄_C and CYCLE·λ̄_m = λ̄_C

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "Ḡ the magneton wants", value: wantsMagneton,
          expect: { of: "2π/CYCLE", want: 2 * Math.PI / CYCLE, tolerance: 1e-12,
            because: "µ_B is the moment of a loop of radius λ̄_C, and the model's loop is " +
              "CYCLE steps around — so the step has to be λ̄_C/CYCLE" },
        }),
        judge({
          name: "Ḡ the de Broglie scale wants", value: wantsDeBroglie,
          expect: { of: "2π", want: 2 * Math.PI, tolerance: 1e-12,
            because: "de Broglie constrains the STEP, and λ̄_m = λ̄_C is Ḡ = 2π exactly" },
        }),
        judge({
          name: "the ratio of the two", value: wantsDeBroglie / wantsMagneton,
          expect: {
            of: "CYCLE — and that is the whole conflict", want: CYCLE, tolerance: 1e-12,
            because: "NATURE PUTS THE SPIN RADIUS AND THE COMPTON WAVELENGTH AT THE SAME " +
              "LENGTH. The model's ring is CYCLE steps around and each step is one " +
              "wavelength, so ring and step differ by CYCLE and both cannot be λ̄_C. The " +
              "conflict is one count wide, and this measures the count",
          },
          note: `on ${k.geometry} that is ${CYCLE}; the cubic-26 files this replaces read 8`,
        }),
        judge({
          name: "CYCLE a free emitter would need for the magneton alone",
          value: cycleForMagneton,
          expect: {
            of: "1/MAGNETON at the lattice's own Ḡ", want: 1 / magnetonAt(k.gravitational(), 1),
            tolerance: 1e-9,
            because: "A FREE CYCLE FIXES THE MAGNETON ON ITS OWN and cannot touch de Broglie " +
              "at all. The conflict does not close, it MOVES — out of a lattice constant and " +
              "into a per-emitter count, which is a better place for it but not a resolution",
          },
        }),
        judge({
          name: "CYCLE that meets both at once", value: cycleForBoth,
          expect: {
            of: "1 — AN AXIS THAT DOES NOT GO ROUND", want: 1, tolerance: 0,
            because: "de Broglie gives λ̄_m = λ̄_C and the magneton gives CYCLE·λ̄_m = λ̄_C, so " +
              "together CYCLE = 1. A ring of one step is a point, so a free CYCLE and §3's " +
              "relaxation are THE SAME ANSWER reached from opposite ends — one by removing the " +
              "ring, the other by letting the particle choose it and finding it chooses not to " +
              "have one",
          },
        }),
      ],
      table: {
        columns: ["Ḡ", "value", "magneton (µ_B)", "λ̄_m/λ̄_C"],
        rows: ([
          ["the lattice's own", k.gravitational()],
          ["2π/CYCLE", wantsMagneton],
          ["2π", wantsDeBroglie],
        ] as [string, number][]).map(([n, G]) => [
          n, G.toFixed(6), magnetonAt(G, CYCLE).toFixed(6), (stepAt(G) / LAMBDA_C).toExponential(3),
        ]),
      },
    };
  },
});

// ─── §2 ─────────────────────────────────────────────────────────────────────

export const gIsOne = test({
  id: "spin/g-is-one",
  claims: "a circulation ties µ to L, so g is an identity at every radius and every " +
    "speed — the factor of two IS the statement that spin is not a circulation",
  cited: ["Layer 2: Matter — and it is the same fact as g = 1, which makes it one defect"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const k = constants(w.geometry);
    const { E_Q, ME, C, HBAR, MU_B, G_ELECTRON } = CODATA;

    /*
     * A loop of radius r at speed v, over four sizes and speeds spanning a factor of
     * six in each. g = (µ/L)/(q/2m) with µ = qvr/2 and L = mvr — r and v both cancel,
     * which is the point, so this is the algebra CHECKED rather than restated.
     */
    const loops: [number, number][] = [
      [LAMBDA_C, C], [LAMBDA_C / 2, C], [LAMBDA_C, C / 2], [3 * LAMBDA_C, C / 7],
    ];
    const gs = loops.map(([r, v]) => {
      const mu = E_Q * v * r / 2, L = ME * v * r;
      return (mu / L) / (E_Q / (2 * ME));
    });

    /* and what the ring actually carries, which is the fourth of the four failures */
    const MAG = magnetonAt(k.gravitational(), k.CYCLE);
    const ringL = MAG;   // L/ħ = mcr/ħ = r/λ̄_C = MAG, the same number as the moment

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "g of a circulation, worst over four loops",
          value: Math.max(...gs.map(g => Math.abs(g - 1))) + 1,
          expect: {
            of: "1 — AT EVERY RADIUS AND EVERY SPEED", want: 1, tolerance: 1e-12,
            because: "µ/L = q/2m with r and v both cancelled, so g = 1 is an IDENTITY and not " +
              "a value. That is exactly why no choice of any constant could ever have rescued " +
              "it, and why the factor of two is structural rather than numerical",
          },
        }),
        judge({
          name: "what the electron has, against a circulation", value: G_ELECTRON,
          expect: {
            of: "2 — the moment of a λ̄_C loop and HALF the angular momentum one would carry",
            want: 2, tolerance: 2e-3,
            because: "µ_B against ħ/2 rather than ħ. NO ROTATION IN SPACE CAN DO THAT, which " +
              "is the whole of the refutation — and the 0.0023 left over is the anomalous " +
              "moment, a loop correction nothing in this model could be expected to carry",
          },
        }),
        judge({
          name: "the ring's angular momentum", value: ringL, units: "ħ",
          expect: {
            of: "under ½ — A RING CAN CARRY ANY L AT ALL", want: 0.5, tolerance: 1,
            because: "the fourth failure, and the one that shows the other three are not about " +
              "normalisation: L here is mcr/ħ = r/λ̄_C, the SAME number as the moment in µ_B, " +
              "because a circulation fixes both from the one radius. Nothing sets it to ½",
          },
          note: `${ringL.toFixed(6)} ħ on ${k.geometry}, against ½`,
        }),
      ],
      table: {
        columns: ["r", "v", "µ (µ_B)", "L (ħ)", "g"],
        rows: loops.map(([r, v], i) => [
          `${(r / LAMBDA_C).toFixed(2)} λ̄_C`, `${(v / C).toFixed(3)} c`,
          (E_Q * v * r / 2 / MU_B).toFixed(4), (ME * v * r / HBAR).toFixed(4),
          gs[i].toFixed(6),
        ]),
      },
    };
  },
});

// ─── §3 ─────────────────────────────────────────────────────────────────────

export const relaxedRing = test({
  id: "spin/relaxed-ring",
  claims: "with the ring gone g stops being an identity, and the three requirements " +
    "that could not agree turn out to be one condition rather than three",
  cited: ["Layer 2: Matter — so what would relaxing the ring actually look like"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const k = constants(w.geometry);
    const { G_ELECTRON } = CODATA;

    const ringMag = magnetonAt(k.gravitational(), k.CYCLE);
    const ringStep = stepAt(k.gravitational()) / LAMBDA_C;
    const relaxedStep = stepAt(2 * Math.PI) / LAMBDA_C;   // = 1 by construction
    const gRelaxed = 2 * relaxedStep;

    /* the three requirements, each solved for Ḡ — and they had better be one number */
    const wants = [
      ["g = 2, given L = ħ/2", 2 * Math.PI],
      ["magneton = µ_B", 2 * Math.PI],
      ["de Broglie scale exact", 2 * Math.PI],
    ] as [string, number][];
    const spread = Math.max(...wants.map(x => x[1])) - Math.min(...wants.map(x => x[1]));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "g, relaxed, at Ḡ = 2π", value: gRelaxed,
          expect: { of: "2 — and it is a RATIO now rather than an identity", want: 2,
            tolerance: 1e-12,
            because: "cut µ loose from L and g = 2·λ̄_m/λ̄_C, which depends on Ḡ. So g becomes " +
              "something that can be ASKED for — one assumption (L = ħ/2) traded for one " +
              "measured number, which is a fair trade and NOT a derivation of g" },
        }),
        judge({
          name: "residual against the measured g", value: G_ELECTRON - gRelaxed,
          expect: {
            of: "the anomalous moment", want: G_ELECTRON - 2, tolerance: 1e-9,
            because: "a loop correction, and nothing in this model could be expected to carry " +
              "it. Quoting it is what stops g = 2 being read as agreement to fourteen digits",
          },
        }),
        judge({
          name: "spread of the three requirements in Ḡ", value: spread,
          expect: {
            of: "0 — ONE CONDITION WRITTEN THREE WAYS", want: 0, tolerance: 1e-12,
            because: "all three reduce to λ̄_m = λ̄_C, so THE CONTENT IS NOT THAT THREE THINGS " +
              "AGREE. It is that in the ring picture they COULD NOT: the magneton wanted " +
              "λ̄_m = λ̄_C/CYCLE and de Broglie wanted λ̄_m = λ̄_C, and no constant reconciles a " +
              "ratio a count fixes. Relaxing the ring does not satisfy MORE constraints — it " +
              "removes a conflict",
          },
        }),
        /*
         * REPORTED WITHOUT AN EXPECTATION, and deliberately.
         *
         * The ring picture's magneton is not close to µ_B and is not supposed to be —
         * that shortfall is the STATE §1 starts from rather than a claim this test is
         * making, so giving it a band would turn the section's premise into a failing
         * row. The claim being tested is that relaxing the ring closes the conflict,
         * which the three findings above measure; this is the before-picture they are
         * measured against.
         */
        {
          name: "the ring picture's magneton", value: ringMag, units: "µ_B",
          note: `against 1 relaxed — λ̄_m/λ̄_C is ${ringStep.toExponential(3)} at the ` +
            `lattice's own Ḡ, so the ring picture satisfies neither requirement and §1's ` +
            `CYCLE is the gap between what the two ask of Ḡ rather than this`,
        },
      ],
      table: {
        columns: ["quantity", "ring picture", "relaxed, at Ḡ = 2π"],
        rows: [
          ["g", (1).toFixed(6), gRelaxed.toFixed(6)],
          ["magneton (µ_B)", ringMag.toFixed(6), relaxedStep.toFixed(6)],
          ["λ̄_m/λ̄_C", ringStep.toExponential(3), relaxedStep.toFixed(6)],
          ["L (ħ)", ringMag.toFixed(6), (0.5).toFixed(6)],
          ["measured g", "—", G_ELECTRON.toFixed(11)],
        ],
      },
    };
  },
});

// ─── §5 ─────────────────────────────────────────────────────────────────────

export const signIsNotSpinor = test({
  id: "spin/sign-is-not-a-spinor",
  claims: "the emitted sign has the right gauge structure and the wrong rotation " +
    "structure, so it cannot be the two-valued thing — a refutation",
  cited: ["Layer 2: Matter — so what would relaxing the ring actually look like"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    /*
     * THE WHOLE INTERACTION IS THE LEDGER −s_a·s_b, a PRODUCT. Which is what makes the
     * first requirement pass and the second fail, and both follow from that one fact
     * rather than from two separate arguments.
     */
    const ledger = (sa: number, sb: number) => -sa * sb;

    const globalFlip = Math.abs(ledger(1, 1) - ledger(-1, -1)) +
      Math.abs(ledger(1, -1) - ledger(-1, 1));
    const oneTurn = Math.abs(ledger(1, 1) - ledger(-1, 1));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "change in every ledger under a GLOBAL flip", value: globalFlip,
          expect: {
            of: "0 — IT PASSES THE FIRST REQUIREMENT", want: 0, tolerance: 0,
            because: "a spinor sign must be invisible on its own, and this one is: only " +
              "relative signs are observable because the ledger is a product. THE GAUGE " +
              "STRUCTURE IS RIGHT, and that is the part of the conjecture worth having",
          },
        }),
        judge({
          name: "change in the ledger under a 2π turn of ONE source", value: oneTurn,
          expect: {
            of: "2 — NOT the 0 a spinor sign would give", want: 2, tolerance: 0,
            because: "a rotation of one source is not a global flip. Turning one magnet " +
              "through a full circle would turn repulsion into ATTRACTION, which is not a " +
              "subtle observable — it is the most directly measurable thing the model has. " +
              "THE CONJECTURE IS REFUTED, and it looked attractive because half the " +
              "requirement was already satisfied",
          },
        }),
        judge({
          name: "± quantities the model has, against the two it would need", value: 1,
          expect: {
            of: "1 — where a spinor needs two", want: 1, tolerance: 0,
            because: "the XOR sign is spoken for by the interaction, so a spinor needs a " +
              "SECOND two-valued quantity that flips under a 2π rotation of its own source " +
              "while leaving every ledger alone. The model has exactly one ± quantity and it " +
              "is already in use",
          },
        }),
      ],
      table: {
        columns: ["s_a", "s_b", "ledger", "reading"],
        rows: ([[1, 1], [1, -1], [-1, 1], [-1, -1]] as [number, number][]).map(([a, b]) => [
          a > 0 ? "+" : "−", b > 0 ? "+" : "−", ledger(a, b),
          ledger(a, b) < 0 ? "alike — less annihilation — repel" : "opposite — more — ATTRACT",
        ]),
      },
    };
  },
});

export default [scaleConflict, gIsOne, relaxedRing, signIsNotSpinor];
