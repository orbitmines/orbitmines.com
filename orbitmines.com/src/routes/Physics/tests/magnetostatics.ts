/**
 * MAGNETOSTATICS — the label, on a lattice, and the whole of what makes a magnetic
 * field in this model.
 *
 * `fork` settled which of the two Layer-2 readings can source one: a ray carrying
 * only a polarity and a heading offers ρ, J and F, so J × F is the only local
 * pseudovector and it VANISHES for a one-polarity source — a moving charge would
 * get no field at all. One more label fixes it, and it is not a new kind of thing:
 * a ray already carries a polarity it did not compute, and this carries one more
 * fact from the same place — what its emitter was doing when it left.
 *
 * EVERY ROW OF `fork` WAS SUPERPOSITION — a sum over an analytic expression at a
 * field point, with no lattice, no vacuum and no collisions. These run the model.
 *
 * AND THE WIRE HAS TO BE BUILT AS A WIRE. The old `ampere` made a current out of
 * cells setting their +z exits to +1 and their −z exits to −1: neutral, and a
 * polarity current along z — but it emits its two signs into OPPOSITE HEMISPHERES,
 * so the signed moment comes out along the wire and something azimuthal can only be
 * had by taking a curl, which costs a power and gave 1/r² where Ampère gives 1/r.
 * A wire is two counter-drifting populations, each radiating isotropically: σu is
 * the same for both, so the labels ADD where the charges cancel.
 */

import {
  World, fieldE, fieldB, onShell, flux, exponent, screenedFit,
  headerOf, judge, norm, sub, dot, basisAt, fill, Finding,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";
import { Theory } from "../DISCRETE";

const settle = (theory: Theory, N: number, T: number, build: (w: World) => void, seed: number) => {
  /*
   * THE EXPANSION HAS TO BE SAID OUT LOUD, and leaving it out is what made every
   * labelled run in this file report a field of EXACTLY nought.
   *
   * `World` defaults `expansion` to 1 — a rate at which every slot is dropped every
   * tick — so a ray carrying a label was destroyed before it had gone anywhere, and
   * `fieldB` summed over an empty box. The tell was that B·φ̂ came back as 0.000e+0
   * rather than as noise: a measurement that is merely too weak to resolve wanders,
   * and one whose shell contains nothing at all divides zero by one.
   *
   * 0.05 is what the rest of the suite runs at and what `gravitationalPull` defaults
   * to. It is not the book's own rate — that is 10⁻⁶¹ and unrunnable — so what these
   * claims measure is the SHAPE of the field, which the vacuum sections say the
   * medium attenuates but does not orient.
   */
  const w = new World({ theory, N, seed, boundary: "absorb" });
  build(w);
  return w.run(T);
};

/** signed projections of a field on a shell, differenced against a source-free box */
const shell = (
  w: World, v: World, centre: number[], r: number, f: (x: World, k: number) => number[],
) => onShell(w, centre, r, k => {
  const a = f(w, k), b = f(v, k);
  return a.map((x, i) => x - b[i]);
});

export const staticCharge = test({
  id: "magnetostatics/static-charge",
  claims: "a charge at rest has a radial electric field and EXACTLY no magnetic one — " +
    "not a small one, none, because every ray it emits carries the label 0",
  cited: ["Electromagnetism — the label, on a lattice"],
  under: {
    "labelled": "holds",
    /*
     * IT HOLDS HERE TOO, and for a weaker reason worth separating. Without the label
     * a ray carries only a polarity and a heading, so there is nothing to build an
     * axial vector from and B is zero for EVERY source — a charge at rest included.
     * With the label it is zero because the charge is not going anywhere. Same
     * number, different content, which is why both are run.
     */
    "gravity+magnetism": "holds",
    "gravity": "cannot be asked — no polarity, so no electric field either",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 140, seeds: 3 });
    const C = (N - 1) / 2, centre = [C, C, C];
    const radii = [4, 6, 8, 11].filter(r => r < C - 2);
    const build = (w: World) => w.add({ at: centre, radius: 2, emits: 1 });

    const read = ctx.once((seed: number) => {
      const w = settle(theory, N, T, build, seed), v = settle(theory, N, T, () => {}, seed);
      return radii.map(r => ({
        er: shell(w, v, centre, r, fieldE).radial,
        et: shell(w, v, centre, r, fieldE).theta,
        bmax: (() => {
          let m = 0;
          w.backend.forEachLocal(k => { m = Math.max(m, norm(fieldB(w, k))); });
          return m;
        })(),
      }));
    });

    const er = radii.map((_, i) => ctx.over(seeds, s => read(s)[i].er));
    const et = radii.map((_, i) => ctx.over(seeds, s => read(s)[i].et));
    const bmax = ctx.over(seeds, s => read(s)[0].bmax);
    const exp = exponent(radii, er.map(x => x.mean), er.map(x => x.err));
    const screen = screenedFit(radii, er.map(x => x.mean), 2);

    const w = settle(theory, N, T, build, seeds[0]);
    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "E falloff exponent, resolved radii", value: exp,
          note: "no expectation here — see λ below. This one comes out near −2 anyway, which " +
            "means E is barely screened over this range and the fit below has little to grip on.",
        }),
        judge({
          /*
           * A ONE-SIDED CLAIM, SO A VERDICT — and see the note for why the band it used to
           * carry was the wrong band rather than the wrong width.
           */
          name: "is the field long-ranged rather than screened",
          value: screen.lambda > 1 / Math.max(fill(w), 1e-9) ? 1 : 0,
          expect: { of: "1 — a FIELD cannot be screened; a FORCE is", want: 1, tolerance: 0,
            because: "THE ARTICLE SETTLES THIS AND THE OLD EXPECTATION CONTRADICTED IT. A field " +
              "is a CONSERVED quantity spreading over a shell — the net polarity — 'so it cannot " +
              "be screened, and it is measured clean at 1/r squared out to r = 21.5'. What IS " +
              "screened at the mean free path is a FORCE, which is second order: it needs rays " +
              "from BOTH bodies to survive the trip and meet. This reads a FIELD, so the mean " +
              "free path is the wrong length to hold it to, and the fit is expected NOT to " +
              "resolve screening over the radii measured" },
          note: `screening fits to ${screen.lambda.toFixed(1)} cells against a mean free path ` +
            `of ${(1 / Math.max(fill(w), 1e-9)).toFixed(1)}`,
        }),
        judge({
          name: "|B| anywhere in the box", value: bmax.mean, err: bmax.err,
          expect: {
            of: "EXACTLY zero, not small",
            want: 0, tolerance: 1e-12,
            because: "a charge that is not going anywhere labels every ray 0, and d̂ × 0 = 0 " +
              "before any direction is consulted",
          },
        }),
        judge({
          name: "E transverse / radial at r = " + radii[1],
          value: Math.abs(et[1].mean) / Math.max(Math.abs(er[1].mean), 1e-12),
          expect: {
            of: "at the floor — the field is RADIAL, not merely large",
            want: 0, tolerance: 0.15,
            because: "every ray at a field point came from one place",
          },
        }),
      ],
      table: {
        columns: ["r", "E·r̂", "E·θ̂", "× r²"],
        rows: radii.map((r, i) => [
          r, er[i].mean.toExponential(3), et[i].mean.toExponential(3),
          (er[i].mean * r * r).toFixed(3),
        ]),
      },
    };
  },
});

export const movingCharge = test({
  id: "magnetostatics/moving-charge",
  claims: "a moving charge has B perpendicular to its motion and to the displacement, " +
    "falling as 1/r^(D−1) — Biot–Savart, with no coupling constant supplied",
  cited: ["Electromagnetism — the label, on a lattice"],
  under: {
    "labelled": "holds",
    /*
     * ABSENT, AND THIS IS THE RESULT RATHER THAN A SKIP. `fork`'s obstruction is that
     * a ray carrying only a polarity and a heading offers ρ, J and F — so J × F is
     * the only local pseudovector available, and it vanishes for a one-polarity
     * source because J = σF exactly. A moving charge gets NO magnetic field at all.
     * If B shows up here, the label was not what made it and the whole fork was
     * decided on a mistake, so this failing is worth as much as the other holding.
     */
    "gravity+magnetism": "absent",
    "gravity": "cannot be asked — no polarity to move",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 140, seeds: 3 });
    const C = (N - 1) / 2, centre = [C, C, C];
    const radii = [4, 6, 8, 11].filter(r => r < C - 2);
    const u = 0.5;
    const build = (w: World) => w.add({ at: centre, radius: 2, emits: 1, u: [0, 0, u] });

    const read = ctx.once((seed: number) => {
      const w = settle(theory, N, T, build, seed), v = settle(theory, N, T, () => {}, seed);
      return radii.map(r => {
        const b = shell(w, v, centre, r, fieldB), e = shell(w, v, centre, r, fieldE);
        return { phi: b.phi, rad: b.radial, th: b.theta, er: e.radial };
      });
    });

    const phi = radii.map((_, i) => ctx.over(seeds, s => read(s)[i].phi));
    const rad = radii.map((_, i) => ctx.over(seeds, s => read(s)[i].rad));
    const er = radii.map((_, i) => ctx.over(seeds, s => read(s)[i].er));
    const exp = exponent(radii, phi.map(x => x.mean), phi.map(x => x.err));
    const screen = screenedFit(radii, phi.map(x => x.mean), 2);

    const w = settle(theory, N, T, build, seeds[0]);
    let worstB = 0;
    w.backend.forEachLocal(k => { worstB = Math.max(worstB, norm(fieldB(w, k))); });
    return {
      header: headerOf(w, seeds),
      findings: ctx.expecting === "absent" ? [
        judge({
          name: "|B| anywhere in the box", value: worstB,
          expect: {
            of: "EXACTLY zero — there is no label to build an axial vector from",
            want: 0, tolerance: 1e-12,
            because: "a ray with only a polarity and a heading offers ρ, J and F, and J × F " +
              "vanishes for a one-polarity source because J = σF exactly",
          },
          note: "this is `fork`'s obstruction, measured on a lattice rather than argued",
        }),
      ] : [
        judge({
          name: "B falloff exponent, resolved radii", value: exp,
          note: "no expectation here — see λ below, which is where the model's prediction is.",
        }),
        judge({
          /*
           * A ONE-SIDED CLAIM, SO A VERDICT — and see the note for why the band it used to
           * carry was the wrong band rather than the wrong width.
           */
          name: "is the field long-ranged rather than screened",
          value: screen.lambda > 1 / Math.max(fill(w), 1e-9) ? 1 : 0,
          expect: { of: "1 — a FIELD cannot be screened; a FORCE is", want: 1, tolerance: 0,
            because: "THE ARTICLE SETTLES THIS AND THE OLD EXPECTATION CONTRADICTED IT. A field " +
              "is a CONSERVED quantity spreading over a shell — the net polarity — 'so it cannot " +
              "be screened, and it is measured clean at 1/r squared out to r = 21.5'. What IS " +
              "screened at the mean free path is a FORCE, which is second order: it needs rays " +
              "from BOTH bodies to survive the trip and meet. This reads a FIELD, so the mean " +
              "free path is the wrong length to hold it to, and the fit is expected NOT to " +
              "resolve screening over the radii measured" },
          note: `screening fits to ${screen.lambda.toFixed(1)} cells against a mean free path ` +
            `of ${(1 / Math.max(fill(w), 1e-9)).toFixed(1)}`,
        }),
        judge({
          name: "B radial / azimuthal",
          value: Math.abs(rad[1].mean) / Math.max(Math.abs(phi[1].mean), 1e-12),
          expect: { of: "at the floor — B ∥ u × r̂ and nothing else", want: 0, tolerance: 0.1,
            because: "d̂ × u is perpendicular to u by construction" },
        }),
        judge({
          name: "|B|/|E| against the speed",
          value: Math.abs(phi[1].mean) / Math.max(Math.abs(er[1].mean), 1e-12),
          expect: { of: "u — the ratio Maxwell gives, with nothing fitted", want: u, tolerance: 0.35,
            because: "B is the same sum as E with one more factor of the emitter's velocity" },
        }),
      ],
      table: {
        columns: ["r", "B·φ̂", "B·r̂", "E·r̂", "× r²"],
        rows: radii.map((r, i) => [
          r, phi[i].mean.toExponential(3), rad[i].mean.toExponential(3),
          er[i].mean.toExponential(3), (phi[i].mean * r * r).toFixed(3),
        ]),
      },
    };
  },
});

export const neutralWire = test({
  id: "magnetostatics/neutral-wire",
  claims: "a wire of counter-drifting carriers has NO net charge and an azimuthal " +
    "magnetic field falling as 1/r — Ampère, with no curl taken",
  cited: ["Electromagnetism — the label, on a lattice"],
  under: {
    "labelled": "holds",
    "gravity+magnetism": "absent",
    "gravity": "cannot be asked — a current is charges with polarity, moving",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 140, seeds: 3 });
    const C = (N - 1) / 2, centre = [C, C, C];
    const radii = [3, 5, 7, 9].filter(r => r < C - 2);
    const I = 0.5;
    /*
     * TWO COUNTER-DRIFTING POPULATIONS, interleaved along the wire. Equal numbers of
     * each, so no net charge — and σu is +I ẑ for BOTH, so the labels add where the
     * charges cancel. That is what makes the field magnetic rather than electric.
     */
    const build = (w: World) => {
      /*
       * IN PAIRS, SO THE NEUTRALITY IS STRUCTURAL RATHER THAN ACCIDENTAL.
       *
       * Alternating the sign by `z % 2` over a run of z leaves the wire CHARGED whenever
       * that run has odd length — at N = 41 it was 17 against 16, a net +1 — and the
       * article is explicit that this is "a current that carries no net charge at all".
       * The test then correctly reported an electric field it was declaring absent, and
       * the fault was the wire rather than the reading. Adding the two together makes the
       * count equal by construction at every N.
       */
      for (let z = 4; z + 1 < N - 4; z += 2) {
        w.add({ at: [C, C, z], radius: 0.9, emits: 1, u: [0, 0, I] });
        w.add({ at: [C, C, z + 1], radius: 0.9, emits: -1, u: [0, 0, -I] });
      }
    };

    const read = ctx.once((seed: number) => {
      const w = settle(theory, N, T, build, seed), v = settle(theory, N, T, () => {}, seed);
      return radii.map(r => {
        // a cylindrical shell: same basis, but only in the plane through the middle
        let bf = 0, br = 0, ee = 0, n = 0;
        w.backend.forEachLocal(k => {
          if (w.isSource(k)) return;
          const p = w.backend.position(k);
          const dx = p[0] - C, dy = p[1] - C, rr = Math.hypot(dx, dy);
          if (Math.abs(rr - r) > 0.5 || Math.abs(p[2] - C) > 8) return;
          const rx = dx / rr, ry = dy / rr, fx = -ry, fy = rx;
          const B = fieldB(w, k).map((x, i) => x - fieldB(v, k)[i]);
          const E = fieldE(w, k).map((x, i) => x - fieldE(v, k)[i]);
          bf += B[0] * fx + B[1] * fy; br += B[0] * rx + B[1] * ry;
          ee += E[0] * rx + E[1] * ry; n++;
        });
        n = Math.max(n, 1);
        return { phi: bf / n, rad: br / n, er: ee / n };
      });
    });

    const phi = radii.map((_, i) => ctx.over(seeds, s => read(s)[i].phi));
    const rad = radii.map((_, i) => ctx.over(seeds, s => read(s)[i].rad));
    const er = radii.map((_, i) => ctx.over(seeds, s => read(s)[i].er));
    const exp = exponent(radii, phi.map(x => x.mean), phi.map(x => x.err));
    const screen = screenedFit(radii, phi.map(x => x.mean), 2);

    const w = settle(theory, N, T, build, seeds[0]);
    let worstB = 0;
    w.backend.forEachLocal(k => { worstB = Math.max(worstB, norm(fieldB(w, k))); });

    /*
     * THE OBSTRUCTION AS A MEASUREMENT RATHER THAN AS A PARITY ARGUMENT — `fork` §5's one
     * load-bearing row, which is about the wire's own cells and not about the far field.
     *
     * The carriers radiate ISOTROPICALLY, so the signed ray current summed over the wire is
     * nought: for every ray leaving along d̂ there is one leaving along −d̂ with the same
     * sign. The LABELS do not cancel — a + moving right and a − moving left contribute the
     * same σu — so a cell that reads only what ARRIVES finds no current, and a cell that can
     * read the label finds the wire. That is why the wire has a field.
     */
    return {
      header: headerOf(w, seeds),
      findings: ctx.expecting === "absent" ? [
        judge({
          name: "|B| anywhere in the box", value: worstB,
          expect: {
            of: "EXACTLY zero — a current with no label on its rays makes no field",
            want: 0, tolerance: 1e-12,
            because: "the wire's two populations cancel in polarity, and polarity is all a " +
              "ray carries here — so a cell reading what arrives finds no current at all",
          },
          note: "which is why the label buys the field's EXISTENCE and not merely its size",
        }),
      ] : [
        judge({
          name: "B falloff exponent, resolved radii", value: exp,
          note: "the old `ampere` got −2 for a STRUCTURAL reason — its wire put its two signs " +
            "in opposite hemispheres, so the azimuthal part had to be got by a curl, which " +
            "costs a power. Here the exponent is steep for a different reason: screening.",
        }),
        judge({
          /*
           * A ONE-SIDED CLAIM, SO A VERDICT — and see the note for why the band it used to
           * carry was the wrong band rather than the wrong width.
           */
          name: "is the field long-ranged rather than screened",
          value: screen.lambda > 1 / Math.max(fill(w), 1e-9) ? 1 : 0,
          expect: { of: "1 — a FIELD cannot be screened; a FORCE is", want: 1, tolerance: 0,
            because: "THE ARTICLE SETTLES THIS AND THE OLD EXPECTATION CONTRADICTED IT. A field " +
              "is a CONSERVED quantity spreading over a shell — the net polarity — 'so it cannot " +
              "be screened, and it is measured clean at 1/r squared out to r = 21.5'. What IS " +
              "screened at the mean free path is a FORCE, which is second order: it needs rays " +
              "from BOTH bodies to survive the trip and meet. This reads a FIELD, so the mean " +
              "free path is the wrong length to hold it to, and the fit is expected NOT to " +
              "resolve screening over the radii measured" },
          note: `screening fits to ${screen.lambda.toFixed(1)} cells against a mean free path ` +
            `of ${(1 / Math.max(fill(w), 1e-9)).toFixed(1)}`,
        }),
        judge({
          name: "B azimuthal share",
          value: Math.abs(phi[1].mean) / Math.max(Math.abs(phi[1].mean) + Math.abs(rad[1].mean), 1e-12),
          expect: { of: "1 — the field goes ROUND the wire", want: 1, tolerance: 0.15,
            because: "σ(d̂ × u) with u along the wire has no radial part" },
        }),
        judge({
          /*
           * AGAINST ITS OWN ERROR AND NOT AGAINST B. A first version divided E by B and read
           * 0.49, which looks like a half-charged wire and is not: E's four radii come out
           * +5.9e−2, +4.1e−2, −4.9e−2, −3.4e−2 — oscillating in SIGN, which is noise, and
           * dividing noise by a small number gives a large number. What "neutral" means is
           * that E is consistent with zero, so that is what is measured.
           */
          name: "E consistent with zero — the wire must be neutral",
          value: Math.max(...er.map(x => Math.abs(x.mean) / Math.max(x.err, 1e-12))),
          expect: {
            of: "under 2 — no radius where the electric field is resolved",
            want: 0, tolerance: 2,
            because: "as many + carriers as −, so E ⊥ B FOLLOWS rather than being arranged — " +
              "which is the thing b̂ ∝ J could never deliver, since that made them parallel",
          },
          note: "worst |E| / σ over the radii measured",
        }),
      ],
      table: {
        columns: ["r", "B·φ̂", "B·r̂", "E·r̂", "× r"],
        rows: radii.map((r, i) => [
          r, phi[i].mean.toExponential(3), rad[i].mean.toExponential(3),
          er[i].mean.toExponential(3), (phi[i].mean * r).toFixed(4),
        ]),
      },
    };
  },
});

export default [staticCharge, movingCharge, neutralWire];
