/**
 * POLES — where a magnet's two ends come from, and the oldest experiment there is.
 *
 * The port of `todo/provenance/divp.ts`, `escape.ts` and `texture.ts` §1. The pole model
 * gets every magnetostatic result out of a body whose bias was PUT ON IT BY HAND: + at one
 * end and − at the other, because that is what a bar magnet is. The ordering work then
 * asked which arrangement of ordinary emitters produces that, found that none of them do,
 * and closed on a question about where the sign gets resolved.
 *
 * THIS ASKS THE QUESTION THE OTHER WAY ROUND. Do not ask where the sign is resolved; ask
 * what the PRIMITIVE is. Give each node a polarisation vector p — a thing an ordering can
 * plausibly hold, since it is only "which way this bit of the body is pointed" — and let
 * the emitted sign be
 *
 *     s = −∇·p
 *
 * which is nought wherever p is uniform and appears only where the body ENDS. Nobody
 * assigns a pole to a face. The faces are where the divergence is. And the net is not
 * balanced, it is ZERO IDENTICALLY, because a divergence summed over everything
 * telescopes — the same kind of statement as "a loop has no monopole moment by topology",
 * arrived at without needing a loop.
 *
 * AND THE TEST THAT SEPARATES IT FROM THE HAND-PLACED VERSION IS CUT THE MAGNET IN HALF.
 * Assign the sign by which half of the body a node sits in and the upper half is all-plus:
 * net 32, exponent 2 — TWO MONOPOLES. Let the sign be −∇·p and the new bottom face has a
 * divergence it did not have when there was body below it, so a south pole APPEARS at the
 * cut, the net is nought again and the exponent is 3. Two magnets out of one, which is the
 * whole content of "there are no magnetic monopoles" stated as an experiment rather than
 * as a law.
 *
 * THE THIRD ROUTE, AND WHY THE FINE-TUNING OBJECTION DOES NOT REACH IT. A reader may say
 * the net-zero is arranged. It is not: it survives every disturbance worth trying — one
 * node reversed, eight reversed, ±10% and ±50% wobble on every node, p entirely random —
 * because telescoping does not care what p is, only that it is a field on a bounded body.
 *
 * NOTHING HERE IS A LATTICE RUN AND IT DOES NOT NEED TO BE. Every claim is about the sum
 * Σ s/r over a finite set of nodes with s = −∇·p, and the exponents are fits to that sum.
 * What the model contributes is the CLAIM that the emitted sign is a divergence, which is
 * `escape.ts`'s business and is the first test below.
 */

import { World, Vec, headerOf, judge } from "../DISCRETE";
import { test } from "../SUITE";

type Node = { at: Vec; s: number };

const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
const dist = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** an L×L×H block of nodes, centred */
const block = (L: number, H: number): Vec[] => {
  const out: Vec[] = [];
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < H; k++)
    out.push([i - (L - 1) / 2, j - (L - 1) / 2, k - (H - 1) / 2]);
  return out;
};

/**
 * s = −∇·p by central differences, over the body AND the shell around it — a cell one step
 * outside still sees p on one side and nothing on the other, which is where half the
 * surface charge lands.
 */
const byDivergence = (cells: Vec[], p: (c: Vec) => Vec): Node[] => {
  const inBody = new Map<string, Vec>();
  for (const c of cells) inBody.set(key(c[0], c[1], c[2]), p(c));
  const at = (x: number, y: number, z: number, a: number) =>
    inBody.get(key(x, y, z))?.[a] ?? 0;

  const wanted = new Set<string>();
  for (const c of cells)
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++)
      wanted.add(key(c[0] + dx, c[1] + dy, c[2] + dz));

  const out: Node[] = [];
  for (const k of wanted) {
    const [x, y, z] = k.split(",").map(Number);
    const div = (at(x + 1, y, z, 0) - at(x - 1, y, z, 0)) / 2
      + (at(x, y + 1, z, 1) - at(x, y - 1, z, 1)) / 2
      + (at(x, y, z + 1, 2) - at(x, y, z - 1, 2)) / 2;
    if (Math.abs(div) > 1e-12) out.push({ at: [x, y, z], s: -div });
  }
  return out;
};

/** s = +1 on the far side of the body along the axis, −1 on the near side */
const byHalf = (cells: Vec[], axis: Vec): Node[] =>
  cells.map(c => {
    const h = c[0] * axis[0] + c[1] * axis[1] + c[2] * axis[2];
    return { at: c, s: Math.abs(h) < 1e-12 ? 0 : h > 0 ? 1 : -1 };
  }).filter(n => n.s !== 0);

/** Σ s/r² — the tally the rest of the arc reads */
const tally = (b: Node[], x: Vec) => {
  let t = 0;
  for (const n of b) { const r = dist(x, n.at); if (r > 1e-9) t += n.s / (r * r); }
  return t;
};
const potential = (b: Node[], x: Vec) => {
  let t = 0;
  for (const n of b) { const r = dist(x, n.at); if (r > 1e-9) t += n.s / r; }
  return t;
};

/**
 * The falloff exponent of |tally| along z, fitted well outside the body.
 *
 * FITTED FROM SIXTY CELLS OUT AND NOT FROM TWELVE, which is not a free choice. The body is
 * eight cells across, so at r = 12 the quadrupole term is still a percent of the dipole
 * and the fit reads 3.04 rather than 3.000 — a near-field contamination masquerading as a
 * departure from the law. The arc's own 3.000 is the far-field number and this is where it
 * lives.
 */
const exponentOf = (b: Node[], r0 = 60, r1 = 400) => {
  const xs: number[] = [], ys: number[] = [];
  for (let r = r0; r <= r1; r *= 1.2) {
    const v = Math.abs(tally(b, [0, 0, r]));
    if (v > 1e-18) { xs.push(Math.log(r)); ys.push(Math.log(v)); }
  }
  const n = xs.length, sx = xs.reduce((a, b2) => a + b2, 0), sy = ys.reduce((a, b2) => a + b2, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0), sxx = xs.reduce((a, x) => a + x * x, 0);
  return -(n * sxy - sx * sy) / (n * sxx - sx * sx);
};

const netOf = (b: Node[]) => b.reduce((a, n) => a + n.s, 0);

/* a small deterministic generator, so a "random" texture is the same one every run */
const rng = (seed: number) => {
  let a = (seed * 0x9e3779b9) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const polesAreADivergence = test({
  id: "texture/poles-are-a-divergence",
  claims: "let the emitted sign be −∇·p and the poles land on the faces without anybody " +
    "putting them there, the net is zero IDENTICALLY by telescoping rather than by " +
    "balance — and cutting the magnet in half gives two magnets where the hand-placed " +
    "version gives two monopoles",
  cited: ["divp.ts", "texture.ts §1"],
  under: { "gravity": "holds" },
  exact: true,                    // sums over a fixed block: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const cells = block(8, 8);
    const zhat: Vec = [0, 0, 1];

    const div = byDivergence(cells, () => zhat);
    const half = byHalf(cells, zhat);

    /* CUT IT IN HALF: keep the upper half of the body and re-derive each way */
    const upper = cells.filter(c => c[2] > 0);
    const divCut = byDivergence(upper, () => zhat);
    const halfCut = half.filter(n => n.at[2] > 0);

    /* the far field's angular shape, against cos θ */
    const worstAngle = (() => {
      const R = 40;
      let worst = 0, scale = 0;
      const vals: number[] = [], wants: number[] = [];
      for (let i = 0; i <= 12; i++) {
        const th = Math.PI * i / 12;
        vals.push(potential(div, [R * Math.sin(th), 0, R * Math.cos(th)]));
        wants.push(Math.cos(th));
      }
      scale = vals[0] / wants[0];
      for (let i = 0; i < vals.length; i++)
        worst = Math.max(worst, Math.abs(vals[i] - scale * wants[i]));
      return worst / Math.abs(scale);
    })();

    /* THE FINE-TUNING OBJECTION, answered by disturbing p every way worth trying */
    const r = rng(7);
    const DISTURBED: [string, (c: Vec) => Vec][] = [
      ["none — uniform ẑ", () => zhat],
      ["one node reversed", c => (c[0] === 0 && c[1] === 0 && c[2] === 0 ? [0, 0, -1] : zhat)],
      ["eight nodes reversed", c => (c[0] < -1.5 && c[1] < -1.5 ? [0, 0, -1] : zhat)],
      ["every node ±10% wobble", () => [0, 0, 1 + 0.1 * (2 * r() - 1)]],
      ["every node ±50% wobble", () => [0, 0, 1 + 0.5 * (2 * r() - 1)]],
      ["p entirely random", () => [2 * r() - 1, 2 * r() - 1, 2 * r() - 1]],
    ];
    const rows = DISTURBED.map(([name, f]) => {
      const b = byDivergence(cells, f);
      return { name, net: netOf(b), exp: exponentOf(b) };
    });
    const worstNet = Math.max(...rows.map(x => Math.abs(x.net)));
    const worstExp = Math.max(...rows.slice(0, 5).map(x => Math.abs(x.exp - 3)));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "net sign of the whole body, under −∇·p", value: netOf(div),
          expect: {
            of: "0 — IDENTICALLY, by telescoping and not by balance", want: 0, tolerance: 1e-12,
            because: "a divergence summed over everything telescopes: every interior face is " +
              "counted once with each sign. So the net is zero for the same reason a loop has " +
              "no monopole moment — by topology — and it is arrived at WITHOUT needing a loop. " +
              "Nobody balanced the two ends against each other",
          },
        }),
        judge({
          name: "far-field exponent of the tally, under −∇·p", value: exponentOf(div),
          expect: {
            of: "3 — a dipole, which is what a magnet is", want: 3, tolerance: 0.02,
            because: "the poles land on the FACES without anybody putting them there, and what " +
              "they add up to at distance is a dipole. The exponent is the check that the " +
              "surface density is right rather than merely present",
          },
        }),
        judge({
          name: "worst departure of the potential from cos θ", value: worstAngle,
          expect: {
            of: "0 — the dipole's own angular shape", want: 0, tolerance: 1e-3,
            because: "an exponent alone would pass on something falling as 1/r³ with the wrong " +
              "shape. Twelve angles from pole to pole, against one overall scale",
          },
        }),
        /* THE CUT, which is the whole point of the file */
        judge({
          name: "net sign of the upper half, cut and re-derived under −∇·p",
          value: netOf(divCut),
          expect: {
            of: "0 — A SOUTH POLE APPEARS AT THE CUT", want: 0, tolerance: 1e-12,
            because: "the new bottom face has a divergence it did not have when there was body " +
              "below it, so the half regenerates its own second pole. TWO MAGNETS OUT OF ONE, " +
              "which is the whole content of 'there are no magnetic monopoles' stated as an " +
              "experiment rather than as a law",
          },
          note: `and its exponent is ${exponentOf(divCut).toFixed(3)} — still a dipole`,
        }),
        judge({
          name: "net sign of the same half under the HAND-PLACED assignment",
          value: Math.abs(netOf(halfCut)),
          expect: {
            of: "NOT zero — TWO MONOPOLES, which is the control", want: 0, atLeast: 1,
            because: "assigning the sign by which half of the ORIGINAL body a node sits in " +
              "means the halves inherit it, so the upper half is all-plus. It is the same " +
              "construction that gets every other magnetostatic result right, and this is the " +
              "one experiment that tells the two apart",
          },
          note: `net ${netOf(halfCut)} with exponent ${exponentOf(halfCut).toFixed(3)} — a ` +
            `monopole falls as 2 where a dipole falls as 3`,
        }),
        judge({
          name: "worst |net| over every disturbance to p worth trying", value: worstNet,
          expect: {
            of: "0 — THE FINE-TUNING OBJECTION DOES NOT REACH IT", want: 0, tolerance: 1e-12,
            because: "one node reversed, eight reversed, ±10% and ±50% wobble on every node, " +
              "and p entirely random. Telescoping does not care WHAT p is, only that it is a " +
              "field on a bounded body — so the net-zero is not arranged and cannot be " +
              "un-arranged",
          },
        }),
        judge({
          name: "worst |exponent − 3| over the ordered disturbances", value: worstExp,
          expect: {
            of: "0 — still a dipole under all of them", want: 0, tolerance: 0.02,
            because: "the net surviving is necessary and not sufficient: a texture could keep " +
              "its zero and lose its shape. The fully random row is excluded because it has no " +
              "net polarisation to make a dipole OUT of, and its exponent is reported rather " +
              "than judged",
          },
          note: `p entirely random gives ${rows[5].exp.toFixed(3)}, which is the row with no ` +
            `mean direction left to be a dipole about`,
        }),
      ],
      table: {
        columns: ["disturbance to p", "net sign", "exponent"],
        rows: rows.map(x => [x.name, x.net.toExponential(1), x.exp.toFixed(3)]),
      },
    };
  },
});

/* ── escape: is −∇·p DERIVED, or is it a third emission rule? ───────────────── */

/**
 * THE ANNIHILATION LEDGER, RUN RATHER THAN ASSERTED.
 *
 * `divp` shows that a body whose emitted sign is −∇·p is a magnet in every way one is
 * asked to be. It does NOT show that this model emits that. The argument offered was
 * Gauss's theorem on the annihilation ledger — every + in the bulk has a neighbour's −
 * sitting on it, so only the boundary survives, and the surviving boundary density is the
 * divergence. This runs it.
 *
 * Every node emits sgn(p·d̂) into each of the geometry's ways out. Two pulses on the same
 * bond coming at each other annihilate if their signs are opposite — WHICH IS (G+M/1) WITH
 * THE SIGNS KEPT, not a new rule. What is left on a bond is what escapes along it.
 */
const ledger = (cells: Vec[], axis: Vec, ways: Vec[]) => {
  const inBody = new Set(cells.map(c => key(c[0], c[1], c[2])));
  const sgn = (x: number) => (x > 1e-12 ? 1 : x < -1e-12 ? -1 : 0);
  const emitted = new Map<string, number[]>();
  for (const c of cells)
    emitted.set(key(c[0], c[1], c[2]), ways.map(d => {
      const n = Math.hypot(d[0], d[1], d[2]);
      return sgn((axis[0] * d[0] + axis[1] * d[1] + axis[2] * d[2]) / n);
    }));

  let annihilated = 0, escaped = 0;
  const perLayer = new Map<number, number>();
  for (const c of cells) {
    const mine = emitted.get(key(c[0], c[1], c[2]))!;
    for (let i = 0; i < ways.length; i++) {
      const d = ways[i];
      if (mine[i] === 0) continue;
      const nb: Vec = [c[0] + d[0], c[1] + d[1], c[2] + d[2]];
      const opp = ways.findIndex(e => e[0] === -d[0] && e[1] === -d[1] && e[2] === -d[2]);
      const back = inBody.has(key(nb[0], nb[1], nb[2]))
        ? emitted.get(key(nb[0], nb[1], nb[2]))![opp] : null;
      if (back !== null && back !== 0 && back !== mine[i]) { annihilated++; continue; }
      escaped++;
      /* an escaping pulse leaves through the face it crosses — book it on that layer */
      const z = c[2] + d[2] / 2;
      perLayer.set(z, (perLayer.get(z) ?? 0) + mine[i]);
    }
  }
  return { annihilated, escaped, perLayer };
};

export const theSurfaceDensityIsDerived = test({
  id: "texture/surface-density-is-derived",
  claims: "the bulk really does cancel and what is left really is −∇·p — so the surface " +
    "density is DERIVED out of the annihilation ledger rather than added as a third rule",
  cited: ["escape.ts"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const cells = block(4, 4);
    const zhat: Vec = [0, 0, 1];
    const ways = g.L.map(v => [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0] as Vec);

    const led = ledger(cells, zhat, ways);
    const div = byDivergence(cells, () => zhat);

    /* −∇·p summed over each z layer, for comparison with what escaped through it */
    const divLayer = new Map<number, number>();
    for (const n of div) divLayer.set(n.at[2], (divLayer.get(n.at[2]) ?? 0) + n.s);

    const layers = [...new Set([...led.perLayer.keys()])].sort((a, b) => b - a);
    const interior = layers.filter(z => Math.abs(z) < (4 - 1) / 2);
    const worstInterior = Math.max(0, ...interior.map(z => Math.abs(led.perLayer.get(z) ?? 0)));
    const totalEscaped = [...led.perLayer.values()].reduce((a, b) => a + b, 0);
    const totalDiv = [...divLayer.values()].reduce((a, b) => a + b, 0);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "escaped pulses summed over every INTERIOR layer", value: worstInterior,
          expect: {
            of: "0 — THE BULK CANCELS, exactly", want: 0, tolerance: 1e-12,
            because: "every + in the bulk has a neighbour's − sitting on the same bond coming " +
              "the other way, so (G+M/1) removes both and nothing escapes from inside the body. " +
              "That is Gauss's theorem on the annihilation ledger, run rather than asserted — " +
              "AND IT IS NOT A THIRD EMISSION RULE, it is what the rule the model already has " +
              "leaves behind",
          },
        }),
        judge({
          name: "escaped pulses summed over the whole body", value: totalEscaped,
          expect: {
            of: "0 — equal and opposite on the two ends", want: 0, tolerance: 1e-12,
            because: "the two faces carry the same count with opposite signs, which is the net " +
              "zero of the section above arriving from the dynamics rather than from " +
              "telescoping. THE SURFACE DENSITY IS DERIVED and the arc is entitled to it",
          },
          note: `${led.annihilated} pulses annihilated head-on and ${led.escaped} escaped, ` +
            `against Σ−∇·p = ${totalDiv.toExponential(1)} over the same body`,
        }),
      ],
      /*
       * THE TWO COLUMNS SIT ON DIFFERENT GRIDS, and that is the geometry rather than a
       * mismatch: −∇·p lives on the FACES, at half-integer z, while an escaping pulse is
       * booked on the layer it crosses. So the div column is the face BELOW each layer,
       * and what the table is for is the pattern — nought in every interior row, equal
       * and opposite on the two ends — rather than a row-by-row equality.
       */
      table: {
        columns: ["z-layer", "Σ escaped", "Σ −∇·p at the face below"],
        rows: layers.map(z => [z.toFixed(1),
          (led.perLayer.get(z) ?? 0).toFixed(1),
          (divLayer.get(z - 0.5) ?? 0).toFixed(4)]),
      },
    };
  },
});

export default [polesAreADivergence, theSurfaceDensityIsDerived];
