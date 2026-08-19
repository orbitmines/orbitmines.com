/**
 * WHERE THE POLES COME FROM, ON A SOURCE THE MODEL COULD ACTUALLY PRODUCE.
 *
 * `poles` measured the pole model and got every magnetostatic result out of it
 * — 3cos²θ − 1, 1/R⁴, all five orientations — on a body whose bias was PUT ON
 * IT BY HAND: + at one end, − at the other, because that is what a bar magnet
 * is. `ordering` then asked which arrangement of ordinary emitters produces
 * that, found that none of them do, and closed on a question about where the
 * sign gets resolved. `departure` shows that question has no content.
 *
 * This file asks the question the other way round. Do not ask where the sign
 * is resolved; ask what the PRIMITIVE is. Give each node a polarisation vector
 * p — a thing an ordering can plausibly hold, since it is just "which way this
 * bit of the body is pointed" — and let the emitted sign be
 *
 *     s = −div p
 *
 * which is nought wherever p is uniform and appears only where the body ends.
 * Nobody assigns a pole to a face; the faces are where the divergence is.
 *
 * Two constructions are compared, on the same block, at the same strength:
 *
 *   BY HALF   s = +1 in the upper half, −1 in the lower. Net zero, and the
 *             far field comes out right — this is `poles`' body.
 *   BY −div p  s from the divergence. Net zero identically, by telescoping.
 *
 * They agree on everything a magnet is normally asked for. The test that
 * separates them is the oldest one there is: CUT THE MAGNET IN HALF. A real
 * one gives two magnets. By-half gives two monopoles, because the assignment
 * was to a region of the original body and the halves inherit it. −div p
 * regenerates, because a divergence is a fact about the body that is there.
 */

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);

type Node = { at: V; s: number };

const key = (x: number, y: number, z: number) => `${x},${y},${z}`;

/** a solid block, L×L×H, on lattice sites centred at the origin */
const block = (L: number, H: number): V[] => {
  const out: V[] = [];
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < H; k++)
    out.push([i - (L - 1) / 2, j - (L - 1) / 2, k - (H - 1) / 2]);
  return out;
};

/**
 * s = −div p, by central differences, over the body and the shell around it —
 * a cell one step outside the body still sees p on one side and nothing on the
 * other, which is where half the surface charge lands.
 */
const byDivergence = (cells: V[], axis: V): Node[] => {
  const inBody = new Set(cells.map(c => key(c[0], c[1], c[2])));
  const p = (x: number, y: number, z: number, a: number) =>
    inBody.has(key(x, y, z)) ? axis[a] : 0;

  const wanted = new Set<string>();
  for (const c of cells)
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++)
      wanted.add(key(c[0] + dx, c[1] + dy, c[2] + dz));

  const out: Node[] = [];
  for (const k of wanted) {
    const [x, y, z] = k.split(",").map(Number);
    const div =
      (p(x + 1, y, z, 0) - p(x - 1, y, z, 0)) / 2 +
      (p(x, y + 1, z, 1) - p(x, y - 1, z, 1)) / 2 +
      (p(x, y, z + 1, 2) - p(x, y, z - 1, 2)) / 2;
    if (Math.abs(div) > 1e-12) out.push({ at: [x, y, z], s: -div });
  }
  return out;
};

/** s = +1 on the far side of the body along the axis, −1 on the near side */
const byHalf = (cells: V[], axis: V): Node[] =>
  cells.map(c => {
    const h = c[0] * axis[0] + c[1] * axis[1] + c[2] * axis[2];
    return { at: c, s: Math.abs(h) < 1e-12 ? 0 : h > 0 ? 1 : -1 };
  }).filter(n => n.s !== 0);

/** move and re-orient a body */
const place = (b: Node[], to: V, flip: V | null = null): Node[] =>
  b.map(n => {
    let a: V = [...n.at] as V;
    if (flip) a = [a[0] * flip[0], a[1] * flip[1], a[2] * flip[2]];
    return { at: [a[0] + to[0], a[1] + to[1], a[2] + to[2]] as V, s: n.s };
  });

/** rotate a body so its z axis becomes x — for the crossed orientation */
const zToX = (b: Node[]): Node[] => b.map(n => ({ at: [n.at[2], n.at[1], n.at[0]] as V, s: n.s }));

const potential = (b: Node[], x: V) => {
  let t = 0;
  for (const n of b) { const r = len(sub(x, n.at)); if (r > 1e-9) t += n.s / r; }
  return t;
};

/** the tally the rest of the arc reads: Σ s/r² */
const tally = (b: Node[], x: V) => {
  let t = 0;
  for (const n of b) { const r = len(sub(x, n.at)); if (r > 1e-9) t += n.s / (r * r); }
  return t;
};

const slope = (f: (r: number) => number, r0: number, r1: number) => {
  const xs: number[] = [], ys: number[] = [];
  for (let r = r0; r <= r1; r *= 1.25) {
    const v = Math.abs(f(r));
    if (v > 1e-300) { xs.push(Math.log(r)); ys.push(Math.log(v)); }
  }
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  return -num / den;
};

/** pole-model interaction energy, and the force along the separation */
const energy = (a: Node[], b: Node[]) => {
  let u = 0;
  for (const p of a) for (const q of b) { const r = len(sub(p.at, q.at)); if (r > 1e-9) u += p.s * q.s / r; }
  return u;
};
const force = (mk: (R: number) => [Node[], Node[]], R: number, h = 0.5) => {
  const [a1, b1] = mk(R + h), [a0, b0] = mk(R - h);
  return -(energy(a1, b1) - energy(a0, b0)) / (2 * h);
};

/** s = −div p for an arbitrary per-node polarisation field */
const byField = (cells: V[], f: (c: V, i: number) => V): Node[] => {
  const at = new Map<string, V>();
  cells.forEach((c, i) => at.set(key(c[0], c[1], c[2]), f(c, i)));
  const p = (x: number, y: number, z: number, a: number) => (at.get(key(x, y, z)) ?? [0, 0, 0])[a];
  const wanted = new Set<string>();
  for (const c of cells)
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++)
      wanted.add(key(c[0] + dx, c[1] + dy, c[2] + dz));
  const out: Node[] = [];
  for (const k of wanted) {
    const [x, y, z] = k.split(",").map(Number);
    const div =
      (p(x + 1, y, z, 0) - p(x - 1, y, z, 0)) / 2 +
      (p(x, y + 1, z, 1) - p(x, y - 1, z, 1)) / 2 +
      (p(x, y, z + 1, 2) - p(x, y, z - 1, 2)) / 2;
    if (Math.abs(div) > 1e-12) out.push({ at: [x, y, z], s: -div });
  }
  return out;
};

let seed = 20260815;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = () => { seed = 20260815; };

const AXIS: V = [0, 0, 1];

export function divpReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  const cells = block(4, 4);
  const bodies: [string, Node[]][] = [
    ["by half", byHalf(cells, AXIS)],
    ["−div p", byDivergence(cells, AXIS)],
  ];

  line("=".repeat(78));
  line("1. BOTH CONSTRUCTIONS ARE MAGNETS IN THE FAR FIELD");
  line("=".repeat(78));
  line();
  line("     construction   nodes    net sign    Σs/r² exp   |Φ(θ)/Φ(0) − cosθ| max");
  for (const [name, b] of bodies) {
    const net = b.reduce((t, n) => t + n.s, 0);
    const e = slope(r => tally(b, [0, 0, r]), 200, 3200);
    // the potential of a dipole is ∝ cos θ / r²; check the angle at fixed r
    const R = 800;
    let ref = 0, worst = 0;
    for (let d = 0; d <= 180; d += 5) {
      const th = d * Math.PI / 180;
      const v = potential(b, [R * Math.sin(th), 0, R * Math.cos(th)]) * R * R;
      if (d === 0) ref = v;
      worst = Math.max(worst, Math.abs(v / ref - Math.cos(th)));
    }
    line(`     ${name.padEnd(14)}${String(b.length).padStart(5)}${net.toFixed(6).padStart(12)}` +
      `${e.toFixed(3).padStart(12)}   ${worst.toExponential(1)}`);
  }
  line();
  line("  Both net to nothing, both fall as 1/r³, both are cos θ to four or");
  line("  five figures at every angle. On the far field there is nothing to");
  line("  choose between them.");

  line();
  line("=".repeat(78));
  line("2. AND BOTH GIVE ALL FIVE ORIENTATIONS AND 1/R⁴");
  line("=".repeat(78));
  line();
  line("     construction   N–S facing    N–N facing    side ∥      side anti    crossed");
  for (const [name, b] of bodies) {
    const R = 40;
    const ns = force(r => [b, place(b, [0, 0, r])], R);
    const nn = force(r => [b, place(b, [0, 0, r], [1, 1, -1])], R);
    const sp = force(r => [b, place(b, [r, 0, 0])], R);
    const sa = force(r => [b, place(b, [r, 0, 0], [1, 1, -1])], R);
    const cr = force(r => [b, place(zToX(b), [0, 0, r])], R);
    line(`     ${name.padEnd(14)}${ns.toExponential(3).padStart(12)}${nn.toExponential(3).padStart(14)}` +
      `${sp.toExponential(2).padStart(12)}${sa.toExponential(2).padStart(13)}${cr.toExponential(1).padStart(12)}`);
  }
  line();
  line("     construction   force exponent (N–S)   (N–N)");
  for (const [name, b] of bodies) {
    const e1 = slope(R => force(r => [b, place(b, [0, 0, r])], R), 40, 200);
    const e2 = slope(R => force(r => [b, place(b, [0, 0, r], [1, 1, -1])], R), 40, 200);
    line(`     ${name.padEnd(14)}${e1.toFixed(3).padStart(18)}${e2.toFixed(3).padStart(11)}`);
  }
  line();
  line("  Negative is attraction. N–S pulls, N–N pushes, side by side aligned");
  line("  pushes and anti-aligned pulls, one across the other is nought to");
  line("  machine precision, and the force between two of them is 1/R⁴ — which");
  line("  is magnetostatics, twice over.");

  line();
  line("=".repeat(78));
  line("3. THE TEST THAT SEPARATES THEM: CUT IT IN HALF");
  line("=".repeat(78));
  line();
  line("  Take the upper half of the block and ask what it is. By-half keeps");
  line("  the signs it was given; −div p is recomputed on the half that now");
  line("  exists, which is what a divergence does when a body changes shape.");
  line();
  const upper = cells.filter(c => c[2] > 0);
  const cut: [string, Node[]][] = [
    ["by half", byHalf(cells, AXIS).filter(n => n.at[2] > 0)],
    ["−div p", byDivergence(upper, AXIS)],
  ];
  line("     construction   net sign    exponent    what it is");
  for (const [name, b] of cut) {
    const net = b.reduce((t, n) => t + n.s, 0);
    const e = slope(r => tally(b, [0, 0, r]), 200, 3200);
    line(`     ${name.padEnd(14)}${net.toFixed(4).padStart(10)}${e.toFixed(3).padStart(12)}    ` +
      (Math.abs(net) < 1e-9 ? "a magnet" : "A MONOPOLE"));
  }
  line();
  line("  By-half fails outright. Every node in the upper half was assigned +,");
  line("  so the half is a lump of one sign with a 1/r² tally and a net of 32");
  line("  — the thing the whole arc has been trying not to produce.");
  line();
  line("  −div p regenerates. The new bottom face has a divergence it did not");
  line("  have when there was more body below it, so a south pole appears where");
  line("  the cut was, the net is nought again, and the exponent is 3. Two");
  line("  magnets out of one, which is the entire content of 'there are no");
  line("  magnetic monopoles' stated as an experiment.");

  line();
  line("=".repeat(78));
  line("4. AND THE ARC'S FINE-TUNING OBJECTION DOES NOT REACH IT");
  line("=".repeat(78));
  line();
  line("  The Layer-2 arc rules the ± charge route out as fine-tuned — one");
  line("  emitter in 784 flipped drags the exponent to 2.79, and a real magnet");
  line("  is 10²³ atoms with thermal disorder in it, so the imbalance goes as");
  line("  √N and the dipole is never visible. It then takes closed loops");
  line("  instead, on the grounds that a loop has no monopole moment by");
  line("  topology rather than by cancellation.");
  line();
  line("  That objection is correct against ASSIGNED charges and does not");
  line("  reach a divergence, because you cannot flip a charge — there are no");
  line("  charges to flip. You can only disturb p, and Σ(−div p) telescopes to");
  line("  nought for ANY p whatever, which is topology too.");
  line();
  line("     disturbance to p                    net sign     exponent");
  const shown: [string, (c: V, i: number) => V][] = [
    ["none — uniform ẑ", () => [0, 0, 1]],
    ["one node reversed", (c, i) => (i === 7 ? [0, 0, -1] : [0, 0, 1])],
    ["eight nodes reversed", (c, i) => (i % 8 === 0 ? [0, 0, -1] : [0, 0, 1])],
    ["every node ±10% wobble", () => [0.1 * (2 * rnd() - 1), 0.1 * (2 * rnd() - 1), 1]],
    ["every node ±50% wobble", () => [0.5 * (2 * rnd() - 1), 0.5 * (2 * rnd() - 1), 1]],
    ["p entirely random", () => {
      const v: V = [2 * rnd() - 1, 2 * rnd() - 1, 2 * rnd() - 1];
      const l = len(v) || 1; return [v[0] / l, v[1] / l, v[2] / l];
    }],
  ];
  for (const [name, f] of shown) {
    reseed();
    const b = byField(cells, f);
    const net = b.reduce((t, n) => t + n.s, 0);
    const e = slope(r => tally(b, [0, 0, r]), 200, 3200);
    line(`     ${name.padEnd(32)}${net.toExponential(1).padStart(11)}${e.toFixed(3).padStart(13)}`);
  }
  line();
  line("  The net is nought to machine precision in every row including the");
  line("  fully random one, where there is no magnet left at all — the exponent");
  line("  wanders because the remaining moment is small and noisy, not because");
  line("  a monopole has appeared. Nothing here is held in place and nothing");
  line("  needs to be.");
  line();
  line("  Which does not refute the loop route; the two agree outside the body");
  line("  and experiment separates them inside, where it picks the current");
  line("  loop. What it refutes is the ARGUMENT — the fine-tuning objection");
  line("  was aimed at assigned charges and a divergence is not one.");

  line();
  line("=".repeat(78));
  line("5. WHICH RECONCILES WITH WHAT THE ARC ALREADY MEASURED");
  line("=".repeat(78));
  line();
  line("  `ordering` §1 reports the signed emission as 'nought in the middle of");
  line("  a cylinder and largest at its ends' and reads it as encouragement.");
  line();
  line("     THAT IS −div p. It was the right quantity already.");
  line();
  line("  What went wrong afterwards is one line and not a mechanism: the sign");
  line("  was then resolved against the axis AT THE DESTINATION, which throws");
  line("  the polarisation away and replaces it with sgn(n·d̂) — and `departure`");
  line("  shows that is not a field at all. The arc had the quantity, and");
  line("  destroyed it in the step that turned it into a sign.");
  line();
  line("  So the primitive is the polarisation and the sign is its divergence.");
  line("  Nothing is assigned to a face, nothing is held in place, and the");
  line("  faces are poles because that is where p stops.");
  line();
  line("  One caveat kept honest: the energy used here is the pole model's");
  line("  Σ s_a s_b / r, not the annihilation excess `poles` measures. The two");
  line("  are not numerically comparable — the excess is even in z where a");
  line("  signed field sum is odd — so the orientations and exponents transfer");
  line("  and the absolute sizes do not.");

  return L.join("\n");
}

console.log(divpReport());
