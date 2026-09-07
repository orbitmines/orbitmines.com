/**
 * INDUCTION — and the theorem that says why it is not there.
 *
 * THE ARC KEPT MEASURING THIS AND KEPT BEING SURPRISED, so the structure of the
 * answer is worth stating before the numbers.
 *
 * Faraday and ∇·B = 0 are not physical claims about a field read off rays. They are
 * IDENTITIES that hold if and only if the fields come from potentials — ∇×∇φ ≡ 0 and
 * ∇·(∇×A) ≡ 0. Read a field DIRECTLY off what arrives at a cell and nothing forces
 * either, and `lorenz` tabulated exactly that: of five readings of the same rays,
 * the one built from a retarded 1/R potential with the arrival-rate factor passed all
 * four of Maxwell, and the one read off ray counts failed Faraday at 1.0.
 *
 * AND THE LATTICE CANNOT SUPPLY THE POTENTIAL. `potential`'s theorem: both collision
 * rules CONSERVE net polarity, so a signed quantity cannot relax — it can only
 * stream, and a conserved thing streaming over a shell is field-like by
 * construction. The unsigned occupancy does relax, which is why the deficit settles
 * into a discrete Laplace solution and is potential-like — but it is unsigned, and
 * measured around a wire its first moment comes out RADIAL, so its curl is nought.
 * There is no signed potential on this lattice.
 *
 * SO THIS FILE ASKS TWO THINGS RATHER THAN ONE:
 *
 *   1  does Faraday hold on the lattice — measured in INTEGRAL form, where the
 *      average comes before the derivative, because a ±1-cell central difference of
 *      an array built from twenty-six bits a cell is mostly the difference of noise
 *   2  does the lattice's field agree with the RETARDED POTENTIAL reading of the
 *      same source — which is the decidable question underneath, and the one that
 *      says whether the potential formulation describes this model or merely
 *      accompanies it
 */

import {
  World, LABELLED, fieldE, fieldB, onShell, basisAt, headerOf, judge, stat,
  norm, sub, add, scale, dot, cross, unit, Theory, Finding, Vec,
} from "../DISCRETE";
import { fieldsAt, Emitter, constants } from "../CONTINUOUS";
import { test, DEFAULT_SEEDS } from "../SUITE";

const PERIOD = 12;
const OM = 2 * Math.PI / PERIOD;

/**
 * A charge whose POSITION oscillates, with both fields locked in at its own
 * frequency. The lock-in is what makes a field out of twenty-six bits a cell: the
 * vacuum is uncorrelated with the source and averages away, so no differencing
 * against a control is needed or used.
 */
const lockIn = (theory: Theory, N: number, T: number, seed: number, amp = 3) => {
  const C = (N - 1) / 2, centre = [C, C, C], WARM = Math.floor(T / 3);
  const w = new World({ theory, N, seed, boundary: "absorb" });
  const src = w.add({ at: centre, radius: 2, emits: 1 });
  const n = w.backend.size();
  const Ec = [0, 1, 2].map(() => new Float64Array(n));
  const Es = [0, 1, 2].map(() => new Float64Array(n));
  const Bc = [0, 1, 2].map(() => new Float64Array(n));
  const Bs = [0, 1, 2].map(() => new Float64Array(n));
  let samples = 0;

  for (let t = 0; t < T; t++) {
    // move the charge, and label its rays with the velocity that motion gives it
    const z = C + amp * Math.sin(OM * t);
    const uz = amp * OM * Math.cos(OM * t);
    src.u = [0, 0, uz];
    w.tick();
    if (t < WARM) continue;
    samples++;
    const co = Math.cos(OM * t), si = Math.sin(OM * t);
    w.backend.forEachLocal(k => {
      if (w.isSource(k)) return;
      const E = fieldE(w, k), B = fieldB(w, k);
      for (let i = 0; i < 3; i++) {
        Ec[i][k] += (E[i] ?? 0) * co; Es[i][k] += (E[i] ?? 0) * si;
        Bc[i][k] += (B[i] ?? 0) * co; Bs[i][k] += (B[i] ?? 0) * si;
      }
    });
  }
  const s = Math.max(samples, 1);
  for (const arr of [Ec, Es, Bc, Bs]) for (const a of arr) for (let i = 0; i < a.length; i++) a[i] *= 2 / s;
  return { w, Ec, Es, Bc, Bs };
};

export const faraday = test({
  id: "induction/faraday",
  claims: "∮E·dl = −d/dt ∬B·dA on the lattice, in integral form",
  cited: ["Electromagnetism — and then Faraday, which is measured now and is not there"],
  under: {
    /*
     * ABSENT, AND DECLARED SO IN ADVANCE. This is not a test that happens to fail:
     * it is a prediction of `potential`'s theorem, which says the lattice has no
     * signed potential, and Faraday is an identity that needs one. Declaring it
     * `absent` means the suite flags it if induction ever DOES appear — which would
     * mean the theorem is wrong and is worth as much as any positive result.
     */
    "labelled": "absent",
    "gravity+magnetism": "cannot be asked — with no label there is no magnetic field for " +
      "a changing flux to be the flux of",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 35, T: 180, seeds: 2 });
    const C = (N - 1) / 2;

    /**
     * The loop integral, on a rectangle in the ρ–z plane — the shape a z-dipole's
     * azimuthal B threads. Every quantity is an azimuthal mean, and nothing is
     * differenced cell by cell.
     */
    const residual = ctx.once((seed: number) => {
      const { w, Ec, Es, Bc, Bs } = lockIn(theory, N, T, seed);
      const RMAX = Math.min(12, C - 3), ZH = Math.min(8, C - 3);
      const grid = () => Array.from({ length: RMAX + 1 }, () => new Float64Array(2 * ZH + 1));
      const erc = grid(), ers = grid(), ezc = grid(), ezs = grid();
      const bfc = grid(), bfs = grid(), cnt = grid();
      w.backend.forEachLocal(k => {
        if (w.isSource(k)) return;
        const p = w.backend.position(k);
        const dx = p[0] - C, dy = p[1] - C, rho = Math.hypot(dx, dy);
        const ri = Math.round(rho), zi = p[2] - C + ZH;
        if (ri < 1 || ri > RMAX || zi < 0 || zi > 2 * ZH || rho < 1e-9) return;
        const rx = dx / rho, ry = dy / rho, fx = -ry, fy = rx;
        erc[ri][zi] += Ec[0][k] * rx + Ec[1][k] * ry;
        ers[ri][zi] += Es[0][k] * rx + Es[1][k] * ry;
        ezc[ri][zi] += Ec[2][k]; ezs[ri][zi] += Es[2][k];
        bfc[ri][zi] += Bc[0][k] * fx + Bc[1][k] * fy;
        bfs[ri][zi] += Bs[0][k] * fx + Bs[1][k] * fy;
        cnt[ri][zi] += 1;
      });
      for (let r = 0; r <= RMAX; r++) for (let z = 0; z <= 2 * ZH; z++) {
        const c = Math.max(cnt[r][z], 1);
        erc[r][z] /= c; ers[r][z] /= c; ezc[r][z] /= c; ezs[r][z] /= c;
        bfc[r][z] /= c; bfs[r][z] /= c;
      }
      const loop = (Er: Float64Array[], Ez: Float64Array[], r1: number, r2: number, z1: number, z2: number) => {
        let s = 0;
        for (let r = r1; r < r2; r++) s += Er[r][z1];
        for (let z = z1; z < z2; z++) s += Ez[r2][z];
        for (let r = r2; r > r1; r--) s -= Er[r][z2];
        for (let z = z2; z > z1; z--) s -= Ez[r1][z];
        return s;
      };
      const flux = (B: Float64Array[], r1: number, r2: number, z1: number, z2: number) => {
        let s = 0;
        for (let r = r1; r < r2; r++) for (let z = z1; z < z2; z++) s += B[r][z];
        return s;
      };
      const loops: [number, number, number][] = ([[2, 6, 4], [3, 9, 6], [4, 11, 6]] as [number,number,number][])
        .filter(([, r2, zh]) => r2 <= RMAX && zh <= ZH);
      return loops.map(([r1, r2, zh]) => {
        const z1 = ZH - zh, z2 = ZH + zh;
        const a1 = loop(erc, ezc, r1, r2, z1, z2), b1 = -OM * flux(bfs, r1, r2, z1, z2);
        const a2 = loop(ers, ezs, r1, r2, z1, z2), b2 = OM * flux(bfc, r1, r2, z1, z2);
        const num = Math.hypot(a1 - b1, a2 - b2);
        const den = Math.max(Math.hypot(a1, a2), Math.hypot(b1, b2), 1e-18);
        return { r1, r2, zh, emf: Math.hypot(a1, a2), dflux: Math.hypot(b1, b2), rel: num / den };
      });
    });

    /*
     * WHICH LOOPS SURVIVED THE BOX. A smaller run drops the outer rectangles, so the
     * indices have to come from what was actually measured rather than being assumed
     * — and assuming them is how this threw `undefined` at a reduced budget.
     */
    const loops = residual(seeds[0]).map((_, i) => i);
    if (!loops.length) throw new Error(
      "no loop fits inside this box: the Faraday reading needs a rectangle in the ρ–z " +
      "plane, so this claim cannot be measured at this size");
    const rel = loops.map(i => ctx.over(seeds, s => residual(s)[i].rel));
    const emf = loops.map(i => ctx.over(seeds, s => residual(s)[i].emf));
    const dfl = loops.map(i => ctx.over(seeds, s => residual(s)[i].dflux));
    const worst = Math.max(...rel.map(r => r.mean));

    const { w } = lockIn(theory, N, T, seeds[0]);
    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "worst relative residual over the loops", value: worst,
          expect: {
            of: "near 1 — the equation is not there",
            want: 1, tolerance: 0.5,
            because: "Faraday is an identity that holds iff the fields come from potentials, " +
              "and `potential`'s theorem says this lattice has no signed potential: both rules " +
              "conserve polarity, so a signed quantity is field-like and cannot relax",
          },
          note: "DECLARED ABSENT IN ADVANCE. A residual near nought here would mean the " +
            "theorem is wrong, which is worth as much as it holding.",
        }),
        judge({
          name: "∮E·dl over −d/dt∬B·dA, closest loop",
          value: emf[0].mean / Math.max(dfl[0].mean, 1e-18),
          note: "the SHAPE of the failure: one side missing rather than the two disagreeing. " +
            "A ratio well under one is the 1/R term a retarded potential's gradient keeps and " +
            "a count of arriving rays never has.",
        }),
      ],
      table: {
        columns: ["loop ρ", "half-z", "∮E·dl", "−d/dt∬B·dA", "residual"],
        rows: loops.map(i => {
          const l = residual(seeds[0])[i];
          return [`${l.r1}…${l.r2}`, `±${l.zh}`, emf[i].mean.toExponential(3),
            dfl[i].mean.toExponential(3), rel[i].mean.toFixed(3)];
        }),
      },
    };
  },
});

/**
 * THE DECIDABLE QUESTION UNDERNEATH. If the lattice's own field agrees with what a
 * retarded 1/R potential predicts for the same source, then the potential
 * formulation DESCRIBES this model and Faraday's absence is a statement about how
 * the field is being READ rather than about the model. If it does not agree, the
 * lattice deviates from electromagnetism and that is a different and larger claim.
 */
export const againstRetarded = test({
  id: "induction/lattice-against-retarded",
  claims: "the field the lattice produces agrees in direction with the retarded-potential " +
    "reading of the same source",
  cited: ["Electromagnetism — the label, on a lattice"],
  under: { "labelled": "holds" },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 35, T: 140, seeds: 2 });
    const C = (N - 1) / 2, centre = [C, C, C];
    const u: Vec = [0, 0, 0.5];
    const k = constants();

    /*
     * E HAS TO BE DIFFERENCED AGAINST A SOURCE-FREE BOX AND B DOES NOT, and the
     * asymmetry is a real property of the model rather than an inconsistency.
     *
     * B = Σσ(d̂ × u) needs the LABEL, and the vacuum's own rays carry none — a pair
     * made by (G+M/2) has no emitter to have been doing anything — so every ray
     * contributing to B came from the source. B IS SELF-DIFFERENCING.
     *
     * E = Σσ d̂ has no such filter: the vacuum is half charges and they swamp the
     * source's contribution at one local. Measured without the control, E came out
     * at 84.85° to the retarded reading — which is not a disagreement about the
     * field, it is the angle of noise.
     */
    const compare = ctx.once((seed: number) => {
      const mk = (withSource: boolean) => {
        const x = new World({ theory, N, seed, boundary: "absorb" });
        if (withSource) x.add({ at: centre, radius: 2, emits: 1, u });
        return x.run(T);
      };
      const w = mk(true), vac = mk(false);
      const ems: Emitter[] = [{ at: centre, sigma: 1, u }];
      /*
       * ON A SHELL, NOT AT A POINT — and E needed it where B did not.
       *
       * A local holds twenty-six bits. Reading E there and differencing it against
       * another world's twenty-six bits is a difference of two noisy numbers, and
       * measured that way the angle to the retarded reading came out at 62–85°,
       * which is the angle of noise rather than a disagreement about a field.
       * A signed projection onto each cell's own basis, averaged over a shell,
       * cancels the vacuum because it is unbiased in that basis.
       *
       * B needs none of this: the vacuum's rays carry no label, so every ray
       * contributing to B came from the source and B is SELF-DIFFERENCING. That
       * asymmetry is a property of the model, and it is why B reads 0.0° at a
       * single local while E cannot be read there at all.
       */
      const ang = (a: Vec, b: Vec) => {
        const n = norm(a) * norm(b);
        return n < 1e-12 ? NaN : Math.acos(Math.max(-1, Math.min(1, dot(a, b) / n))) * 180 / Math.PI;
      };
      return [4, 6, 8].filter(r => r < C - 3).map(r => {
        const El = onShell(w, centre, r, kk =>
          fieldE(w, kk).map((x, i) => x - fieldE(vac, kk)[i]));
        const Bl = onShell(w, centre, r, kk => fieldB(w, kk));
        // the retarded reading on the same shell, in the same basis
        let rr = 0, pp = 0, n = 0;
        w.backend.forEachLocal(kk => {
          const d = sub(w.backend.position(kk), centre);
          if (Math.abs(norm(d) - r) > 0.5 || norm(d) < 1e-9) return;
          const b = basisAt(d);
          const f = fieldsAt(w.backend.position(kk), 0, ems, k);
          rr += dot(f.E, b.r); pp += dot(f.B, b.phi); n++;
        });
        n = Math.max(n, 1);
        return {
          angB: ang([Bl.phi, 0, 0], [pp / n, 0, 0]),
          angE: ang([El.radial, 0, 0], [rr / n, 0, 0]),
        };
      });
    });

    const idx = compare(seeds[0]).map((_, i) => i);
    const angB = idx.map(i => ctx.over(seeds, s => compare(s)[i].angB));
    const angE = idx.map(i => ctx.over(seeds, s => compare(s)[i].angE));
    const worstB = Math.max(...angB.filter(a => isFinite(a.mean)).map(a => a.mean));
    const worstE = Math.max(...angE.filter(a => isFinite(a.mean)).map(a => a.mean));

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    w.add({ at: centre, radius: 2, emits: 1, u });
    w.run(40);
    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "worst ∠(B lattice, B retarded)", value: worstB, units: "degrees",
          expect: {
            of: "small — the same field, read two ways",
            want: 0, tolerance: 45,
            because: "both are Σσ(d̂ × u) over the same emission; one counts rays that arrived, " +
              "the other sums what was sent",
          },
        }),
        judge({
          name: "worst ∠(E lattice, E retarded)", value: worstE, units: "degrees",
          expect: { of: "small", want: 0, tolerance: 45,
            because: "both are the net polarity of the same emission" },
          note: "differenced against a source-free box at the same seed. B needs no such " +
            "control because the vacuum's rays carry no label, so B is self-differencing — " +
            "which is a property of the model and not of the test.",
        }),
      ],
      table: {
        columns: ["probe", "∠B", "±", "∠E", "±"],
        rows: idx.map(i => [i, angB[i].mean.toFixed(1), angB[i].err.toFixed(1),
          angE[i].mean.toFixed(1), angE[i].err.toFixed(1)]),
      },
    };
  },
});

export default [faraday, againstRetarded];
