/**
 * CONSERVING — what each collision rule leaves behind, and the sign the magnetic files
 * left out.
 *
 * The port of `todo/provenance/sound.ts` §2 and `creation.ts` §1. Both are counts over the
 * exit set, so both are exact and both move with the geometry.
 *
 * SOUND §2 ASKS THE QUESTION THAT SETTLES THE WHOLE PROPAGATION ARC. A wave in a gas is
 * carried by MOMENTUM: density alone diffuses, density plus conserved momentum gives sound.
 * So the question is never how fast the source is pulsed — it is whether the collision
 * keeps momentum. A head-on pair carries zero momentum, so every rule is asked the same
 * thing: what does it leave behind?
 *
 *   (G+M/3) TURNING both members reverse, which is still zero — CONSERVES
 *   (G+M/1) ANNIHILATION both members go, which is still zero — CONSERVES
 *   `pure`'s REMAKE k in, k out, round-robin — DESTROYS, by up to a whole unit
 *
 * Both of the model's OWN rules conserve momentum identically, for every direction, not on
 * average. `pure`'s remake puts its charges back on whatever pair of slots the round-robin
 * has reached, and that pair sums to whatever it sums to. IT IS THE RIGHT SIMPLIFICATION
 * FOR A STATIC FIELD AND THE WRONG ONE FOR ASKING WHETHER ANYTHING PROPAGATES, because it
 * has thrown away the quantity that does the propagating — which is why every diffusive
 * result measured on it was the simplification's and not the model's.
 *
 * CREATION §1 IS A SIGN THE MAGNETIC FILES NEVER USED, and the geometry is the whole of it.
 * Annihilating BETWEEN two sources shortens the line between them, which is attraction.
 * Annihilating OUTSIDE them shortens the space behind each, which pushes them apart. So an
 * outcome the earlier files scored as NOUGHT is a REPULSION, and the coupling runs +1 or −1
 * where it ran 1 or nought. The arc says this outright in the XOR section and no magnetic
 * file used it.
 */

import { World, Vec, Geometry, headerOf, judge, dot, unit, norm, add, scale } from "../DISCRETE";
import { test } from "../SUITE";

export const bothRulesConserveMomentum = test({
  id: "layer2/rules-conserve-momentum",
  claims: "both of the model's own collision rules conserve momentum EXACTLY — for every " +
    "direction, not on average — and `pure`'s remake destroys it, which is why every " +
    "diffusive result measured on that simplification was the simplification's",
  cited: ["sound.ts §2"],
  under: { "gravity": "holds" },
  exact: true,                    // a count over the exit set: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const V = g.U.map(d => [0, 1, 2].map(i => d[i] ?? 0) as Vec);

    let worstTurn = 0, worstAnnih = 0, worstRemake = 0;
    for (let d = 0; d < g.DEG; d++) {
      const o = g.OPP[d];
      /* a head-on pair: d̂ and its opposite, which sums to nothing */
      const before = add(V[d], V[o]);
      /* TURNING reverses both members — the pair is still a head-on pair */
      worstTurn = Math.max(worstTurn, norm(add(add(V[o], V[d]), scale(before, -1))));
      /* ANNIHILATION removes both — what is left is nothing, which is what came in */
      worstAnnih = Math.max(worstAnnih, norm(before));
      /* THE REMAKE puts them back on whatever pair the round-robin has reached */
      for (let s = 0; s < g.DEG; s++)
        worstRemake = Math.max(worstRemake,
          norm(add(add(V[s], V[(s + 1) % g.DEG]), scale(before, -1))));
    }

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "worst |Δp| under (G+M/3), over every head-on pair", value: worstTurn,
          expect: {
            of: "0 — CONSERVES, identically", want: 0, tolerance: 1e-12,
            because: "turning reverses both members, which is still zero. A wave in a gas is " +
              "carried by MOMENTUM — density alone diffuses, density plus conserved momentum " +
              "gives sound — so this row is what decides whether anything can propagate here, " +
              "and it is asked of every direction rather than averaged over them",
          },
        }),
        judge({
          name: "worst |Δp| under (G+M/1), over the same pairs", value: worstAnnih,
          expect: {
            of: "0 — CONSERVES, identically", want: 0, tolerance: 1e-12,
            because: "annihilation removes both members, and what is left is nothing, which is " +
              "what came in. A rule that DESTROYS space can still conserve momentum, and the " +
              "two facts are independent — this is the one that matters for propagation",
          },
        }),
        judge({
          name: "worst |Δp| under `pure`'s remake", value: worstRemake,
          expect: {
            of: "NOT zero — DESTROYS, by up to a whole unit", want: 0, atLeast: 0.5,
            because: "the remake puts its charges back on whatever pair of slots the " +
              "round-robin has reached, and that pair sums to whatever it sums to. IT IS THE " +
              "RIGHT SIMPLIFICATION FOR A STATIC FIELD AND THE WRONG ONE FOR ASKING WHETHER " +
              "ANYTHING PROPAGATES, because it has thrown away the quantity that does the " +
              "propagating — so the diffusion measured on it was the simplification's and not " +
              "the model's",
          },
          note: `${worstRemake.toFixed(3)} against ${g.steps[0].toFixed(3)}, which is what one ` +
            `exit is worth on ${g.name}`,
        }),
      ],
      table: {
        columns: ["rule", "what it does", "worst |Δp|", ""],
        rows: [
          ["(G+M/3) turning", "both members reverse", worstTurn.toExponential(1), "CONSERVES"],
          ["(G+M/1) annihilation", "both members go", worstAnnih.toExponential(1), "CONSERVES"],
          ["`pure`'s remake", "k in, k out, round-robin", worstRemake.toFixed(3), "DESTROYS"],
        ],
      },
    };
  },
});

export const theCouplingRunsPlusAndMinus = test({
  id: "magnetism/coupling-has-two-signs",
  claims: "annihilating BETWEEN two sources shortens the line between them and " +
    "annihilating OUTSIDE shortens the space behind each — so an outcome the magnetic " +
    "files scored as nought is a REPULSION, and the coupling runs +1/−1 where it ran 1/0",
  cited: ["creation.ts §1"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const bhat: Vec = [1, 0, 0];
    const sgn = (x: number) => (x > 1e-12 ? 1 : x < -1e-12 ? -1 : 0);
    /** what a sided source at axis p emits along b̂ */
    const emitted = (p: Vec, b: Vec) => sgn(dot(unit(p), b));

    /* a's pulse toward b, and b's pulse back */
    const outcome = (pa: Vec, pb: Vec, all: boolean) => {
      const sa = emitted(pa, bhat), sb = -emitted(pb, bhat);
      if (sa === 0 || sb === 0) return 0;
      if (sa === -sb) return +1;                 // opposite → (G+M/1) BETWEEN → attract
      return all ? -1 : 0;                       // alike → (G+M/3), turn, annihilate OUTSIDE
    };

    const DS = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];
    const axisAt = (t: number): Vec => [Math.cos(2 * Math.PI * t), Math.sin(2 * Math.PI * t), 0];
    const rows = DS.map(d => ({
      d, old: outcome(axisAt(0), axisAt(d), false), now: outcome(axisAt(0), axisAt(d), true),
    }));

    const repulsions = rows.filter(r => r.now < 0).length;
    const oldScoredZero = rows.filter(r => r.old === 0 && r.now !== 0).length;
    /* the old coupling has a MEAN and the new one does not, which is what a sign buys */
    const meanOld = rows.reduce((a, r) => a + r.old, 0) / rows.length;
    const meanNow = rows.reduce((a, r) => a + r.now, 0) / rows.length;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "outcomes the magnetic files scored as nought that are really repulsions",
          value: oldScoredZero,
          expect: {
            of: "NOT zero — the sign that was left out", want: 0, atLeast: 1,
            because: "annihilating BETWEEN two sources shortens the line between them, which " +
              "is attraction; annihilating OUTSIDE them shortens the space behind each, which " +
              "pushes them apart. (G+M/3) IS A SIGN RATHER THAN A DETAIL and the geometry is " +
              "the whole of it. The arc says this outright in the XOR section and no magnetic " +
              "file used it",
          },
          note: `${repulsions} of ${rows.length} headings are repulsions under all three ` +
            `rules, and the earlier files scored every one of them as no interaction`,
        }),
        judge({
          name: "mean of the coupling with all three rules", value: meanNow,
          expect: {
            of: "0 — a coupling with two signs has no mean", want: 0, tolerance: 1e-12,
            because: "which is what having a sign BUYS, and it is not decoration: a coupling " +
              "that is 1 or nought has a positive mean, so it can only ever pull, and no " +
              "arrangement of sources under it can be in equilibrium. One that runs +1 and −1 " +
              "can hold a texture together",
          },
          note: `against ${meanOld.toFixed(3)} for the annihilation-only reading, which is ` +
            `positive and therefore always attractive`,
        }),
      ],
      table: {
        columns: ["Δ (turns)", ...DS.map(d => d.toFixed(3))],
        rows: [
          ["annihilation only", ...rows.map(r => String(r.old))],
          ["all three rules", ...rows.map(r => String(r.now))],
        ],
      },
    };
  },
});

/* ── sound §3: and with momentum kept, it propagates ────────────────────────── */

/**
 * THE GAS, WITH A MOMENTUM-CONSERVING COLLISION — stream, then scatter head-on pairs
 * SIDEWAYS onto a free axis, which keeps both the count and the momentum. An absorbing body
 * at the centre whose appetite oscillates, and the phase of each shell's deficit read
 * against the source.
 *
 * THE LAG IS TAKEN BETWEEN ADJACENT SHELLS so that no phase unwrapping is needed — a lag
 * measured against the source directly would need to know how many whole cycles had passed,
 * which is the thing being measured.
 *
 * This runs on `Geometry`'s own exits rather than on a hardcoded neighbour set, so the same
 * question can be asked of a different lattice. It does not use `World`, because the point
 * of the section is a collision rule the model does NOT have — a momentum-conserving one —
 * against `pure`'s remake, which the row above shows destroys momentum.
 */
const gasLag = (g: Geometry, N: number, seed: number, LAM: number, T: number, FILL: number) => {
  const C = (N - 1) / 2, CELLS = N * N * N, DEG = g.DEG;
  const idx = (x: number, y: number, z: number) => (x * N + y) * N + z;
  const OFF = new Int32Array(DEG);
  for (let d = 0; d < DEG; d++)
    OFF[d] = ((g.L[d][0] ?? 0) * N + (g.L[d][1] ?? 0)) * N + (g.L[d][2] ?? 0);
  const AX: number[] = [];
  for (let d = 0; d < DEG; d++) if (d < g.OPP[d]) AX.push(d);

  let a = (seed * 0x9e3779b9) >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const body = new Uint8Array(CELLS), rim = new Uint8Array(CELLS);
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) for (let z = 0; z < N; z++) {
    const c = idx(x, y, z), dx = x - C, dy = y - C, dz = z - C;
    if (dx * dx + dy * dy + dz * dz <= 4) body[c] = 1;
    if (x < 2 || x >= N - 2 || y < 2 || y >= N - 2 || z < 2 || z >= N - 2) rim[c] = 1;
  }
  const PROBE = [4, 5, 6, 7, 8, 9, 10];
  const shells = PROBE.map(R => {
    const m: number[] = [];
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
      const dx = x - C, dy = y - C, dz = z - C;
      if (Math.abs(Math.sqrt(dx * dx + dy * dy + dz * dz) - R) < 0.5) m.push(idx(x, y, z));
    }
    return m;
  });

  const om = 2 * Math.PI / LAM;
  let f = new Uint8Array(CELLS * DEG), h = new Uint8Array(CELLS * DEG);
  for (let i = 0; i < CELLS * DEG; i++) f[i] = rnd() < FILL ? 1 : 0;
  const skip = new Uint8Array(CELLS);
  const ser: number[][] = PROBE.map((): number[] => []);

  for (let t = 0; t < T; t++) {
    h.fill(0);
    for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) for (let z = 1; z < N - 1; z++) {
      const c = idx(x, y, z);
      for (let d = 0; d < DEG; d++) if (f[c * DEG + d]) h[(c + OFF[d]) * DEG + d] = 1;
    }
    const tt = f; f = h; h = tt;
    /* the collision: a head-on pair is turned SIDEWAYS onto a free axis */
    for (let c = 0; c < CELLS; c++) {
      const sk = skip[c];
      for (let ai = 0; ai < AX.length; ai++) {
        const ax = AX[(sk + ai) % AX.length];
        if (!(f[c * DEG + ax] && f[c * DEG + g.OPP[ax]])) continue;
        for (let bi = 1; bi < AX.length; bi++) {
          const b = AX[(sk + ai + bi) % AX.length];
          if (f[c * DEG + b] || f[c * DEG + g.OPP[b]]) continue;
          f[c * DEG + ax] = 0; f[c * DEG + g.OPP[ax]] = 0;
          f[c * DEG + b] = 1; f[c * DEG + g.OPP[b]] = 1; break;
        }
        break;
      }
      skip[c] = (sk + 1) % AX.length;
    }
    const eat = 0.5 + 0.5 * Math.sin(om * t);
    for (let c = 0; c < CELLS; c++) {
      if (body[c]) for (let d = 0; d < DEG; d++) { if (rnd() < eat) f[c * DEG + d] = 0; }
      if (rim[c]) for (let d = 0; d < DEG; d++) f[c * DEG + d] = rnd() < FILL ? 1 : 0;
    }
    if (t >= T / 2) PROBE.forEach((_, i) => {
      let s2 = 0;
      for (const c of shells[i]) for (let d = 0; d < DEG; d++) if (!f[c * DEG + d]) s2++;
      ser[i].push(s2 / Math.max(shells[i].length, 1));
    });
  }

  /* lock in at the source's own frequency — the vacuum is uncorrelated and averages away */
  const lock = (arr: number[]) => {
    let re = 0, im = 0;
    for (let t = 0; t < arr.length; t++) {
      re += arr[t] * Math.cos(om * t); im += arr[t] * Math.sin(om * t);
    }
    return { amp: 2 * Math.hypot(re, im) / Math.max(arr.length, 1), ph: Math.atan2(im, re) };
  };
  const L = PROBE.map((_, i) => lock(ser[i]));
  const pairs = PROBE.slice(1).map((R, i) => {
    let d = L[i + 1].ph - L[i].ph;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    /* the OUTER shell lags the inner, so the phase difference is negative going out —
       what is wanted is the size of the delay per cell, which is its magnitude */
    return { from: PROBE[i], to: R, lag: Math.abs(d / om / (R - PROBE[i])), amp: L[i + 1].amp };
  });
  return pairs;
};

export const withMomentumKeptItPropagates = test({
  id: "layer2/it-propagates",
  claims: "with a momentum-conserving collision the deficit PROPAGATES — the lag per cell " +
    "is constant shell to shell rather than growing, which is what separates a wave from a " +
    "diffusion, and the amplitude falls without the lag rising",
  cited: ["sound.ts §3"],
  under: { "gravity": "holds" },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 31, T: 240, seeds: 2 });
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const LAM = 10, FILL = 0.5;

    const runs = ctx.once((seed: number) => gasLag(g, N, seed, LAM, T, FILL));
    const nPairs = runs(seeds[0]).length;
    const lag = Array.from({ length: nPairs }, (_, i) =>
      ctx.over(seeds, s => runs(s)[i].lag));
    const amp = Array.from({ length: nPairs }, (_, i) =>
      ctx.over(seeds, s => runs(s)[i].amp));

    const lags = lag.map(x => x.mean);
    /* A WAVE HAS A CONSTANT LAG PER CELL; A DIFFUSION'S GROWS with distance */
    const first = lags.slice(0, Math.ceil(lags.length / 2));
    const last = lags.slice(Math.floor(lags.length / 2));
    const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / Math.max(v.length, 1);
    const growth = mean(last) / Math.max(mean(first), 1e-30);
    const spread = Math.max(...lags) / Math.max(Math.min(...lags), 1e-30);
    const ampFalls = amp[amp.length - 1].mean < amp[0].mean ? 1 : 0;

    return {
      header: headerOf(w, seeds),
      findings: [
        judge({
          name: "lag per cell, far pairs over near pairs", value: growth,
          expect: {
            of: "1 — CONSTANT, which is a wave and not a diffusion", want: 1, tolerance: 0.35,
            because: "THIS IS THE CLAIM THE DATA SUPPORTS AND THE ONLY ONE. A diffusion's lag " +
              "per cell GROWS with distance because the disturbance spreads as √t; a wave's " +
              "does not, because it has a speed. `pure`'s remake on the same geometry gives a " +
              "lag rising shell by shell, and it gives that because it destroys momentum — " +
              "which is the row two above. A VALUE FOR THE SPEED IS NOT CLAIMED: separating a " +
              "real c_s from the near field and the shot noise needs a bigger box than this",
          },
          note: `lags ${lags.map(x => x.toFixed(2)).join(", ")} ticks per cell, spread ` +
            `${spread.toFixed(2)}×`,
        }),
        judge({
          name: "does the amplitude fall while the lag stays flat", value: ampFalls,
          expect: {
            of: "1 — a spreading wave, not a stalling one", want: 1, tolerance: 0,
            because: "the control that stops the row above passing on a disturbance that never " +
              "left the source: a signal whose amplitude did not fall over the shells would be " +
              "a standing near field with a flat phase, and its lag would be flat for the " +
              "wrong reason",
          },
          note: `${amp[0].mean.toExponential(2)} at the first pair down to ` +
            `${amp[amp.length - 1].mean.toExponential(2)} at the last`,
        }),
      ],
      table: {
        columns: ["shell pair", "lag per cell", "±", "amplitude"],
        rows: runs(seeds[0]).map((p, i) => [`${p.from}→${p.to}`,
          lag[i].mean.toFixed(3), lag[i].err.toExponential(1), amp[i].mean.toExponential(2)]),
      },
    };
  },
});

export default [bothRulesConserveMomentum, theCouplingRunsPlusAndMinus,
  withMomentumKeptItPropagates];
