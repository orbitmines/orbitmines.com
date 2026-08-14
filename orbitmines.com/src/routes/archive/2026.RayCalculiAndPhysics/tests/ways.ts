/**
 * WHAT THE SHIPPED WANDER ACTUALLY DOES — against what `wander.tsx` says it does.
 *
 * `wander.tsx` computes the front speed of each direction class from
 *
 *     face    1
 *     edge    √2 (1 − w/3)
 *     corner  √3 (1 − w/2)
 *
 * and everything downstream of it — the claim that w = 3(1 − 1/√2) = 0.8787
 * puts the front exactly on a circle, `k` = 1, and therefore that `Ḡ` and every
 * published number survive the move from an assumed sphere to a derived one —
 * rests on those three lines. They are a MODEL of the wander, not a reading of
 * it, and they were never checked against the rule in `discrete.ts`.
 *
 * The rule there (`discrete.ts` ~1366) builds the alternatives like this, for a
 * heading `head`, one entry per axis:
 *
 *     head[axis] ≠ 0   push head[axis] on its own          — taken apart
 *     head[axis] = 0   push head with ±1 on that axis      — sideways added
 *
 * with `waysW[0] = head`, and then
 *
 *     with probability w, choose uniformly from waysW[1…]
 *     otherwise carry straight on
 *
 * so the alternatives are waysW[1…] and the count of them depends on how many
 * axes the heading has. That is the whole of it and it is exactly reproducible,
 * which is what this file does: build `waysW` the same way, take the mean step,
 * and compare.
 *
 * Run: ./run.sh waysW
 */

// ─────────────────────────────────────────────────────────────────────────────
// the rule, transcribed

/** every lattice direction in d dimensions: 3^d − 1 of them */
const stepsW = (d: number): number[][] => {
  let out: number[][] = [[]];
  for (let i = 0; i < d; i++) out = out.flatMap(p => [-1, 0, 1].map(v => [...p, v]));
  return out.filter(p => p.some(v => v !== 0));
};

/** `waysW` exactly as `discrete.ts` builds it — waysW[0] is the heading itself */
const waysW = (head: number[]): number[][] => {
  const out: number[][] = [head];
  for (let axis = 0; axis < head.length; axis++) {
    if (head[axis]) {
      const one = new Array(head.length).fill(0);
      one[axis] = head[axis];
      out.push(one);
    } else {
      for (const side of [1, -1]) {
        const off = head.slice();
        off[axis] = side;
        out.push(off);
      }
    }
  }
  return out;
};

/** ⟨step⟩ under the shipped rule: (1−w) straight on, w uniform over waysW[1…] */
const meanStepW = (head: number[], w: number) => {
  const alt = waysW(head).slice(1);
  const m = head.map((v, i) => (1 - w) * v + (alt.length
    ? (w / alt.length) * alt.reduce((a, c) => a + c[i], 0) : w * v));
  return m;
};

const normW = (v: number[]) => Math.hypot(...v);
const rankW = (h: number[]) => h.filter(v => v !== 0).length;   // 1 face, 2 edge, 3 corner

/** what `wander.tsx` asserts instead */
const FSPEED = (w: number, r: number) =>
  r === 1 ? 1 : r === 2 ? Math.SQRT2 * (1 - w / 3) : Math.sqrt(3) * (1 - w / 2);

const padW = (x: number, n = 4, wdt = 10) =>
  (isFinite(x) ? x.toFixed(n) : "—").padStart(wdt);

// ─────────────────────────────────────────────────────────────────────────────

console.log("WAYS — the shipped wander against the one the article models\n");

// ── 1. the alternatives ──────────────────────────────────────────────────────

console.log("─".repeat(76));
console.log("1. WHAT THE ALTERNATIVES ARE, by rankW of the heading\n");
for (const d of [2, 3]) {
  console.log("  d = " + d + ":");
  const seen = new Set<number>();
  for (const h of stepsW(d)) {
    const r = rankW(h);
    if (seen.has(r)) continue;
    seen.add(r);
    console.log("    rankW " + r + "  head " + JSON.stringify(h)
      + "   alternatives (" + (waysW(h).length - 1) + "): "
      + waysW(h).slice(1).map(v => JSON.stringify(v)).join(" "));
  }
  console.log();
}
console.log("  the heading REAPPEARS among the alternatives for a rankW-1 heading —");
console.log("  taking (1,0,0) apart on its one non-zero axis gives (1,0,0) back — and");
console.log("  does not for any other rankW. That asymmetry is the whole story below.\n");

// ── 2. the speeds ────────────────────────────────────────────────────────────

console.log("─".repeat(76));
console.log("2. FRONT SPEED PER CLASS: shipped rule against wander.tsx\n");

for (const d of [2, 3]) {
  console.log("  d = " + d + ":");
  console.log("     w    " + [1, 2, 3].filter(r => r <= d).flatMap(r =>
    [("rankW" + r + " ship").padStart(11), ("rankW" + r + " art").padStart(11)]).join(""));
  for (const w of [0, 0.3, 0.5858, 0.8787, 1]) {
    const cells: string[] = [];
    for (let r = 1; r <= d; r++) {
      const h = stepsW(d).find(s => rankW(s) === r) as number[];
      cells.push(padW(normW(meanStepW(h, w)), 4, 11), padW(FSPEED(w, r), 4, 11));
    }
    console.log("  " + w.toFixed(4).padStart(6) + cells.join(""));
  }
  console.log();
}

// ── 3. can the front be a circle / sphere ────────────────────────────────────

console.log("─".repeat(76));
console.log("3. IS THERE A w THAT ROUNDS THE FRONT?");
console.log("   every class has to travel at the same speed, so the question is");
console.log("   whether max/min over the classes can be brought to 1.\n");

for (const d of [2, 3]) {
  const hs = Array.from({ length: d }, (_, i) =>
    stepsW(d).find(s => rankW(s) === i + 1) as number[]);
  console.log("  d = " + d + ":");
  console.log("     w    " + hs.map((_, i) => ("rankW" + (i + 1)).padStart(10)).join("")
    + "    max/min");
  let bestW = NaN, bestR = Infinity;
  for (let i = 0; i <= 1000; i++) {
    const w = i / 1000;
    const vs = hs.map(h => normW(meanStepW(h, w)));
    const ratio = Math.max(...vs) / Math.min(...vs);
    if (ratio < bestR) { bestR = ratio; bestW = w; }
  }
  for (const w of [0, 0.5, bestW, 1]) {
    const vs = hs.map(h => normW(meanStepW(h, w)));
    console.log("  " + w.toFixed(4).padStart(6) + vs.map(v => padW(v, 4, 10)).join("")
      + padW(Math.max(...vs) / Math.min(...vs), 4, 11)
      + (w === bestW ? "   ← best" : ""));
  }
  console.log("    best max/min over w ∈ [0,1]:  " + bestR.toFixed(6)
    + "  at w = " + bestW.toFixed(3));
  console.log();
}

// ── 4. the two-dimensional sheet, which is what the article's k uses ─────────

console.log("─".repeat(76));
console.log("4. THE EMISSION SHEET, which is where the article's k comes from");
console.log("   The sheet is a coordinate plane, so in 3D it holds rankW-1 and rankW-2");
console.log("   headings only — no corners. The article's k = 1 is the claim that");
console.log("   those two travel at the same speed at w = 0.8787.\n");

{
  const f = [1, 0, 0], e = [1, 1, 0];
  console.log("     w      face      edge   edge/face      art edge/face");
  for (const w of [0, 0.3, 0.5858, 0.8787, 1]) {
    const vf = normW(meanStepW(f, w)), ve = normW(meanStepW(e, w));
    console.log("  " + w.toFixed(4).padStart(6) + padW(vf, 4, 10) + padW(ve, 4, 10)
      + padW(ve / vf, 4, 12) + padW(FSPEED(w, 2) / FSPEED(w, 1), 4, 18));
  }
  // solve both
  const solve = (f2: (w: number) => number) => {
    let lo = 0, hi = 4;
    if (f2(lo) * f2(hi) > 0) return NaN;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (f2(lo) * f2(m) <= 0) hi = m; else lo = m; }
    return (lo + hi) / 2;
  };
  const wShip = solve(w => normW(meanStepW(e, w)) / normW(meanStepW(f, w)) - 1);
  const wArt = solve(w => FSPEED(w, 2) / FSPEED(w, 1) - 1);
  console.log("\n    w that equalises them, shipped rule : " + wShip.toFixed(6)
    + (wShip > 1 ? "   ← OUTSIDE [0,1]" : ""));
  console.log("    w that equalises them, wander.tsx   : " + wArt.toFixed(6)
    + "   = 3(1 − 1/√2)");
  console.log("    closed forms: shipped √2(1 − w/4) = 1 → w = 4(1 − 1/√2) = "
    + (4 * (1 - Math.SQRT1_2)).toFixed(6));
  console.log("                  article √2(1 − w/3) = 1 → w = 3(1 − 1/√2) = "
    + (3 * (1 - Math.SQRT1_2)).toFixed(6));
  console.log("\n    and the best the shipped rule can do inside [0,1] is at w = 1:");
  console.log("      edge/face = √2 · 3/4 = " + (Math.SQRT2 * 0.75).toFixed(6)
    + "   — a " + ((Math.SQRT2 * 0.75 - 1) * 100).toFixed(2) + "% front anisotropy");
}

// ── 5. where the difference comes from ───────────────────────────────────────

console.log("\n" + "─".repeat(76));
console.log("5. WHERE THE DIFFERENCE COMES FROM\n");
console.log("  For a rankW-2 heading (1,1,0) in three dimensions the shipped rule");
console.log("  offers FOUR alternatives — (1,0,0) (0,1,0) (1,1,1) (1,1,−1) — and the");
console.log("  heading itself is NOT among them, so");
console.log("      ⟨step⟩ = (1−w)(1,1,0) + (w/4)(3,3,0) = (1 − w/4)(1,1,0)");
console.log("  whereas `wander.tsx` models a three-member cone that DOES include the");
console.log("  heading — {(1,1), (1,0), (0,1)} — giving");
console.log("      ⟨step⟩ = (1−w)(1,1) + (w/3)(2,2) = (1 − w/3)(1,1)");
console.log("  A quarter where the shipped rule has a quarter of four alternatives,");
console.log("  a third where the article has a third of three. That is the whole gap,");
console.log("  and it moves the rounding w from 0.8787 to 1.1716, which does not exist.");
