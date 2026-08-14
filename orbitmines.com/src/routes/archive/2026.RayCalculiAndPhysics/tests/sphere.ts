/**
 * HOW ROUND IS IT, AND BY HOW MUCH DOES IT WOBBLE?
 *
 * The article says, of the pressure a body exerts, that "there will be constant
 * fluctuations of the shape ... but those fluctuations will approximate a
 * sphere. In fact we can measure the manner in which it will fluctuate." That
 * is two claims and a promise, and none of the three had a number behind it.
 *
 * The rule is `pure.ts` in three dimensions, which is the shortest form of the
 * model that has a force in it at all:
 *
 *     EVERY POINT SENDS ONE CHARGE ALONG EACH OF ITS DEG = 26 EDGES, EVERY
 *     TICK. Every charge is destroyed at the point it lands on, and that
 *     destruction makes the next one — a point that received k sends k back
 *     out. Nothing is created or lost except at a BODY, which takes and sends
 *     nothing. The box rim is held full, which is the rest of space.
 *
 * A point with fewer than 26 to send must skip some edges, and there are two
 * honest ways to choose which: at random, or by letting the skipped edge walk
 * round the point (round-robin, no randomness anywhere). Both are run.
 *
 * WHAT IS BEING MEASURED. The deficit 26 − q is the shortfall a body digs in
 * the vacuum, and it is what every force in the article reads. So:
 *
 *   §1  does the vacuum sit still when nothing is in it
 *   §2  the radial profile, against A(1/r − 1/R) — the 1/r whose gradient is
 *       the inverse square
 *   §3  THE SHAPE: ⟨100⟩, ⟨110⟩, ⟨111⟩ at matched EUCLIDEAN radius, which is
 *       the sphere claim, plus the test that separates a sphere from the cube
 *       the front actually is
 *   §4  THE WOBBLE: the same shells watched tick by tick, so "fluctuates" gets
 *       a number — per cell and per shell, in time and in angle
 *   §5  AND WHAT THAT WOBBLE IS: grain or shape. A single cell holding an
 *       integer cannot carry 1.08 of a charge, so its scatter is arithmetic
 *       before it is anything else. §5 separates the two by asking the same
 *       instant at coarser angular resolution, and against the shot-noise
 *       floor a counting relay is owed.
 *
 * Run: ./run.sh sphere
 */

// —— the lattice ————————————————————————————————————————————————————————————

const DEG = 26;

/** every direction out of a point: 3³ − 1. */
const DIR: [number, number, number][] = (() => {
  const d: [number, number, number][] = [];
  for (let z = -1; z <= 1; z++) for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++)
    if (x || y || z) d.push([x, y, z]);
  return d;
})();

type Mode = "round" | "random";

/**
 * One run. `L` is the box edge (odd), `R` the body radius, `T` the ticks.
 *
 * `watch` is a list of Euclidean radii whose shell mean is recorded EVERY tick
 * of the second half, which is what §4 reads. Everything else is read off the
 * final state.
 */
const sim = (L: number, T: number, R: number, mode: Mode, watch: number[] = []) => {
  const o = (L - 1) / 2, C = L * L * L;
  const at = (x: number, y: number, z: number) => ((z + o) * L + (y + o)) * L + (x + o);

  let q = new Uint8Array(C).fill(DEG);
  let nq = new Uint8Array(C);
  const phase = new Uint8Array(C), body = new Uint8Array(C);

  // neighbour offsets in the flat array, so the inner loop is one add
  const OFF = DIR.map(([x, y, z]) => (z * L + y) * L + x);

  // R < 0 is the empty box, which is how §1 asks what the vacuum does alone
  for (let z = -R; z <= R; z++) for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++)
    if (x * x + y * y + z * z <= R * R) body[at(x, y, z)] = 1;

  /** the two outermost layers are the rest of space: always full, never drained */
  const rim = (x: number, y: number, z: number) =>
    Math.abs(x) >= o - 1 || Math.abs(y) >= o - 1 || Math.abs(z) >= o - 1;

  // which cells belong to which watched shell, resolved once
  const shells = watch.map(r => {
    const cells: number[] = [];
    for (let z = -o; z <= o; z++) for (let y = -o; y <= o; y++) for (let x = -o; x <= o; x++) {
      const d = Math.sqrt(x * x + y * y + z * z);
      if (d >= r - 0.5 && d <= r + 0.5) cells.push(at(x, y, z));
    }
    return cells;
  });
  const trace: number[][] = watch.map((): number[] => []);

  /** one cell per watched shell, on ⟨100⟩, followed on its own */
  const probe = watch.map(r => at(Math.round(r), 0, 0));
  const ptrace: number[][] = watch.map((): number[] => []);

  let churn = 0, cn = 0, acn = 0;
  const pick = new Int32Array(DEG);

  /**
   * The time average of the deficit, over the second half of the run.
   *
   * This is the field the article's laws read, and reading it is not the same
   * as reading the last tick: a cell holds an INTEGER count, and at r = 20 the
   * deficit is about one charge, so a single tick is a one-bit sample of a
   * quantity that is 4% of a charge. §4 measures that noise; everything before
   * §4 has to average it away or it measures nothing else.
   */
  const acc = new Float64Array(C);

  for (let t = 1; t <= T; t++) {
    nq.fill(0);
    for (let z = -o; z <= o; z++) for (let y = -o; y <= o; y++) for (let x = -o; x <= o; x++) {
      const c = at(x, y, z);
      if (body[c]) continue;
      const k = rim(x, y, z) ? DEG : q[c];
      if (!k) continue;
      if (mode === "round") {
        const p = phase[c];
        for (let j = 0; j < k; j++) nq[c + OFF[(p + j) % DEG]]++;
        phase[c] = (p + k) % DEG;              // the skipped edge walks round
      } else {
        for (let i = 0; i < DEG; i++) pick[i] = i;
        for (let j = DEG - 1; j > 0; j--) {
          const r = (Math.random() * (j + 1)) | 0;
          const tv = pick[j]; pick[j] = pick[r]; pick[r] = tv;
        }
        for (let j = 0; j < k; j++) nq[c + OFF[pick[j]]]++;
      }
    }
    const tt = q; q = nq; nq = tt;

    if (t > T / 2) {
      for (let c = 0; c < C; c++) acc[c] += DEG - q[c];
      acn++;
      shells.forEach((cells, i) => {
        let s = 0;
        for (const c of cells) s += DEG - q[c];
        trace[i].push(s / cells.length);
        ptrace[i].push(DEG - q[probe[i]]);
      });
      // the vacuum away from the body and away from the rim, sampled coarsely
      for (let z = -o + 6; z <= o - 6; z += 7) for (let y = -o + 6; y <= o - 6; y += 7)
        for (let x = -o + 6; x <= o - 6; x += 7) {
          if (R >= 0 && Math.sqrt(x * x + y * y + z * z) < o * 0.6) continue;
          churn += Math.abs(q[at(x, y, z)] - DEG); cn++;
        }
    }
  }

  for (let c = 0; c < C; c++) acc[c] /= acn;
  return { q, acc, o, L, at, body, OFF, rim, churn: churn / cn, trace, ptrace, ticks: acn };
};

// —— reading it ——————————————————————————————————————————————————————————————

/**
 * Every cell of the Euclidean shell of radius r, half a cell either side, as
 * [time-averaged deficit, cos of the angle to the nearest axis of each family].
 *
 * Everything in §2 and §3 is a weighted average over this one list.
 */
const ring = (s: ReturnType<typeof sim>, r: number) => {
  const { acc, o, at } = s;
  const out: { v: number, cos: [number, number, number] }[] = [];
  for (let z = -o; z <= o; z++) for (let y = -o; y <= o; y++) for (let x = -o; x <= o; x++) {
    const d = Math.sqrt(x * x + y * y + z * z);
    if (d < r - 0.5 || d > r + 0.5) continue;
    const a = [Math.abs(x), Math.abs(y), Math.abs(z)].sort((p, m) => m - p);
    out.push({
      v: acc[at(x, y, z)],
      cos: [
        a[0] / d,                                   // to ⟨100⟩
        (a[0] + a[1]) / (Math.SQRT2 * d),           // to ⟨110⟩
        (a[0] + a[1] + a[2]) / (Math.sqrt(3) * d),  // to ⟨111⟩
      ],
    });
  }
  return out;
};

const shell = (s: ReturnType<typeof sim>, r: number) => mean(ring(s, r).map(c => c.v));

/**
 * The radial profile of the time-averaged field, at 1/5-cell resolution, so a
 * cell can be compared against what its OWN distance says rather than against
 * its shell's mean.
 *
 * This matters more than it sounds. A shell one cell thick spans a real change
 * in the field — at r = 6 the profile falls by about two charges per cell, so
 * cells at the inner and outer faces of one shell differ by 20% for a reason
 * that has nothing to do with shape. Measuring anisotropy as the spread around
 * a shell mean charges that gradient to the lattice. Dividing it out first is
 * the difference between measuring a sphere and measuring a derivative.
 */
const profile = (s: ReturnType<typeof sim>) => {
  const { acc, o, at } = s, STEP = 0.2;
  const sum: number[] = [], n: number[] = [];
  for (let z = -o; z <= o; z++) for (let y = -o; y <= o; y++) for (let x = -o; x <= o; x++) {
    const i = Math.round(Math.sqrt(x * x + y * y + z * z) / STEP);
    sum[i] = (sum[i] || 0) + acc[at(x, y, z)]; n[i] = (n[i] || 0) + 1;
  }
  // a bin with too few cells in it is its own noise, so widen until it is not
  return (d: number) => {
    let i = Math.round(d / STEP), s = 0, c = 0;
    for (let w = 0; c < 60 && w < 40; w++) {
      s = 0; c = 0;
      for (let j = Math.max(0, i - w); j <= i + w; j++) { s += sum[j] || 0; c += n[j] || 0; }
    }
    return s / c;
  };
};

/**
 * The deficit in a cone about one direction family, at matched EUCLIDEAN
 * radius.
 *
 * A cone rather than the single cell that sits exactly on the axis: at r = 20
 * that cell's own time average still carries several percent of noise, and six
 * of them cannot tell a 2% shape from a 5% wobble. `HALF_ANGLE` of 20° puts a
 * few hundred cells in each family and leaves the three cones disjoint — ⟨100⟩
 * and ⟨111⟩ are 54.7° apart, ⟨100⟩ and ⟨110⟩ 45°.
 *
 * Matching EUCLIDEAN radius is the whole point: a ⟨111⟩ cell at Euclidean r
 * sits at Chebyshev r/√3, so a field that was secretly a function of Chebyshev
 * distance would read the r/√3 shell's value here, which §3 checks outright.
 */
const HALF_ANGLE = Math.cos(20 * Math.PI / 180);

const cone = (s: ReturnType<typeof sim>, r: number, fam: 0 | 1 | 2) => {
  const v = ring(s, r).filter(c => c.cos[fam] >= HALF_ANGLE).map(c => c.v);
  return v.length ? mean(v) : NaN;
};

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
const sd = (a: number[]) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length);
};

// ─────────────────────────────────────────────────────────────────────────────

const L = 81, T = 600, R = 3;
const WATCH = [6, 10, 14, 20];

console.log("HOW ROUND IS THE PRESSURE, AND BY HOW MUCH DOES IT WOBBLE\n");
console.log(`   ${L}³ box, body of radius ${R}, ${T} ticks, deficit = ${DEG} − q\n`);

const runs: Record<Mode, ReturnType<typeof sim>> = {} as any;
for (const mode of ["round", "random"] as Mode[]) runs[mode] = sim(L, T, R, mode, WATCH);

console.log("─".repeat(76));
console.log("1. THE FREE VACUUM IS STATIC — EXACTLY, AND FOR A DULL REASON\n");
console.log("   Every point full sends 26 and receives 26, for ever. In a box with");
console.log("   NO body in it there is never a shortfall, so no edge is ever skipped");
console.log("   and the choice between the two rules is never made. Both read zero,");
console.log("   which is worth stating because of what it implies: EVERY fluctuation");
console.log("   below belongs to the body's well, and none of it to the vacuum.\n");
console.log("   which edge is skipped     mean |q − 26|   as a fraction");
for (const mode of ["round", "random"] as Mode[]) {
  const c = sim(41, 200, -1, mode).churn;
  console.log("   " + (mode === "round" ? "walks round the point" : "picked at random    ")
    + c.toFixed(4).padStart(14) + (c / DEG).toFixed(5).padStart(16));
}
console.log();

console.log("─".repeat(76));
console.log("2. THE PROFILE IS 1/r\n");
console.log("   Against A(1/r − 1/R) fitted on r ≥ 8 — the potential whose gradient");
console.log("   is the inverse square, with nobody writing either down.\n");
{
  const s = runs.round;
  const rs = [4, 6, 8, 10, 13, 16, 20, 24, 28];
  const d = rs.map(r => shell(s, r));
  // two-parameter least squares on A(1/r) + B, with R = −A/B
  const fit = rs.map((r, i) => [1 / r, d[i]] as const).filter((_, i) => rs[i] >= 8);
  const n = fit.length;
  const sx = fit.reduce((t, [x]) => t + x, 0), sy = fit.reduce((t, [, y]) => t + y, 0);
  const sxx = fit.reduce((t, [x]) => t + x * x, 0), sxy = fit.reduce((t, [x, y]) => t + x * y, 0);
  const A = (n * sxy - sx * sy) / (n * sxx - sx * sx), B = (sy - A * sx) / n;
  console.log(`   A = ${A.toFixed(3)}   R = ${(-A / B).toFixed(1)} cells (the box is ${L})\n`);
  console.log("        r     deficit    A(1/r−1/R)     ratio");
  rs.forEach((r, i) => {
    const p = A / r + B;
    console.log("      " + String(r).padStart(3) + d[i].toFixed(4).padStart(12)
      + p.toFixed(4).padStart(14) + (d[i] / p).toFixed(3).padStart(10));
  });
}
console.log();

console.log("─".repeat(76));
console.log("3. AND THE SHAPE IS A SPHERE, NOT THE CUBE THE FRONT IS\n");
console.log("   Each direction family, in a 20° cone at matched EUCLIDEAN radius,");
console.log("   over the shell mean there. 1.000 is round; the spread is the shape.");
console.log("   Read off the TIME-AVERAGED field, which is what §4 says it has to be.\n");
{
  const s = runs.round;
  console.log("        r    shell     ⟨100⟩    ⟨110⟩    ⟨111⟩     spread");
  for (const r of [6, 8, 10, 14, 20, 26]) {
    const sh = shell(s, r);
    const f = ([0, 1, 2] as const).map(v => cone(s, r, v) / sh);
    console.log("      " + String(r).padStart(3) + sh.toFixed(4).padStart(9)
      + f.map(v => v.toFixed(3).padStart(9)).join("")
      + ((Math.max(...f) - Math.min(...f)) * 100).toFixed(1).padStart(10) + "%");
  }
  console.log();
  console.log("   The test that separates a sphere from a cube: a field that were");
  console.log("   really a function of CHEBYSHEV distance would put a ⟨111⟩ cell at");
  console.log("   Euclidean r at the r/√3 value, because that is its Chebyshev");
  console.log("   distance. So compare, at each r:\n");
  console.log("        r    ⟨111⟩ at r    shell at r/√3    shell at r");
  for (const r of [10, 14, 20, 26]) {
    console.log("      " + String(r).padStart(3)
      + cone(s, r, 2).toFixed(4).padStart(13)
      + shell(s, r / Math.sqrt(3)).toFixed(4).padStart(17)
      + shell(s, r).toFixed(4).padStart(14));
  }
}
console.log();

console.log("─".repeat(76));
console.log("4. AND HERE IS THE WOBBLE\n");
console.log("   The same shells watched every tick of the second half. `shell` is");
console.log("   the mean over the whole shell, `cell` one ⟨100⟩ cell on it, and the");
console.log("   spread is over the last half of the run.\n");
for (const mode of ["round", "random"] as Mode[]) {
  const s = runs[mode];
  console.log(`   ${mode === "round" ? "skipped edge walks round the point" : "skipped edge picked at random"}\n`);
  console.log("        r   shell mean   shell sd    shell %    cell sd    cell %");
  WATCH.forEach((r, i) => {
    const tr = s.trace[i], pt = s.ptrace[i];
    const m = mean(tr);
    console.log("      " + String(r).padStart(3) + m.toFixed(4).padStart(13)
      + sd(tr).toFixed(4).padStart(11) + (100 * sd(tr) / m).toFixed(2).padStart(10) + "%"
      + sd(pt).toFixed(4).padStart(11) + (100 * sd(pt) / Math.abs(mean(pt))).toFixed(1).padStart(9) + "%");
  });
  console.log();
}

console.log("   and the same wobble read in ANGLE rather than in time — how much the");
console.log("   cells AROUND one shell differ from each other, which is the SHAPE");
console.log("   fluctuating rather than the size. Two readings of it: one instant,");
console.log("   and the average of all " + runs.round.ticks + " ticks. If the shape were really");
console.log("   ragged the second would be as big as the first; if the raggedness is");
console.log("   noise it falls as 1/√n, and the last column is what it would be if");
console.log("   it were pure noise. Every cell is divided by the radial profile at");
console.log("   its own distance first, so the shell's own gradient is not counted.\n");
{
  const s = runs.round, { q, o, at } = s, p = profile(s);
  console.log("        r   shell mean    one tick   averaged    if noise");
  for (const r of WATCH) {
    const now: number[] = [], av: number[] = [];
    for (let z = -o; z <= o; z++) for (let y = -o; y <= o; y++) for (let x = -o; x <= o; x++) {
      const d = Math.sqrt(x * x + y * y + z * z);
      if (d < r - 0.5 || d > r + 0.5) continue;
      // each cell against the profile at its OWN distance, so the shell's own
      // radial gradient is not counted as a departure from roundness
      const e = p(d);
      now.push((DEG - q[at(x, y, z)]) / e); av.push(s.acc[at(x, y, z)] / e);
    }
    console.log("      " + String(r).padStart(3) + shell(s, r).toFixed(4).padStart(13)
      + (100 * sd(now)).toFixed(1).padStart(11) + "%"
      + (100 * sd(av)).toFixed(1).padStart(10) + "%"
      + (100 * sd(now) / Math.sqrt(s.ticks)).toFixed(1).padStart(11) + "%");
  }
}
console.log();

console.log("─".repeat(76));
console.log("5. AND THAT RAGGEDNESS IS GRAIN, NOT SHAPE\n");
console.log("   §4's angular column is a per-CELL number, and a cell is the worst");
console.log("   instrument in the box: it holds an integer, and at r = 20 it is being");
console.log("   asked to carry 1.084 of a charge. Two readings decide whether the");
console.log("   raggedness is a fluctuating SHAPE or the arithmetic of counting.\n");
console.log("   FIRST — against the floor. A cell's neighbour holding k sends one charge");
console.log("   down each of k edges out of 26, so the count arriving is a sum of 26");
console.log("   draws with p = k/26, and even a perfectly round field must scatter by");
console.log("   √Σp(1−p). That floor is not fitted: it is read off the neighbours'");
console.log("   own occupancies in the final state. In charges, not percent:\n");
{
  console.log("        r    shell mean   scatter/cell   shot-noise floor   measured/floor");
  for (const mode of ["round", "random"] as Mode[]) {
    const s = runs[mode], { q, o, at, body, OFF } = s, p = profile(s);
    console.log(`     ${mode === "round" ? "walks round the point" : "picked at random"}`);
    for (const r of WATCH) {
      const dev: number[] = [], floor: number[] = [];
      for (let z = -o; z <= o; z++) for (let y = -o; y <= o; y++) for (let x = -o; x <= o; x++) {
        const d = Math.sqrt(x * x + y * y + z * z);
        if (d < r - 0.5 || d > r + 0.5) continue;
        const c = at(x, y, z);
        dev.push((DEG - q[c]) - p(d));           // departure from the round field
        let v = 0;                               // and what counting alone owes it
        for (let i = 0; i < DEG; i++) {
          const n = c + OFF[i];
          const k = body[n] ? 0 : s.rim(x + DIR[i][0], y + DIR[i][1], z + DIR[i][2]) ? DEG : q[n];
          v += (k / DEG) * (1 - k / DEG);
        }
        floor.push(Math.sqrt(v));
      }
      const m = Math.sqrt(mean(floor.map(v => v * v))), got = sd(dev);
      console.log("      " + String(r).padStart(3) + shell(s, r).toFixed(4).padStart(13)
        + got.toFixed(3).padStart(15) + m.toFixed(3).padStart(19)
        + (got / m).toFixed(2).padStart(17));
    }
  }
}
console.log();
console.log("   SECOND — the same instant, asked at an angular resolution a cell cannot");
console.log("   give. Each shell is cut into 26 patches (nearest lattice direction) and");
console.log("   the patch is averaged before the spread is taken. Grain falls as 1/√m");
console.log("   with the patch size m; a shape does not fall at all. The averaged");
console.log("   column is the SAME patches over all " + runs.round.ticks + " ticks — the residual shape.\n");
{
  const s = runs.round, { q, acc, o, at } = s, p = profile(s);
  const HAT = DIR.map(([x, y, z]) => { const n = Math.hypot(x, y, z); return [x / n, y / n, z / n]; });
  console.log("        r    m    per cell    per patch    if grain    averaged");
  for (const r of WATCH) {
    const now = DIR.map((): number[] => []), av = DIR.map((): number[] => []);
    const cell: number[] = [];
    for (let z = -o; z <= o; z++) for (let y = -o; y <= o; y++) for (let x = -o; x <= o; x++) {
      const d = Math.sqrt(x * x + y * y + z * z);
      if (d < r - 0.5 || d > r + 0.5) continue;
      let best = 0, bd = -2;
      for (let i = 0; i < DEG; i++) {
        const t = (x * HAT[i][0] + y * HAT[i][1] + z * HAT[i][2]) / d;
        if (t > bd) { bd = t; best = i; }
      }
      const e = p(d), c = at(x, y, z);
      now[best].push((DEG - q[c]) / e); av[best].push(acc[c] / e);
      cell.push((DEG - q[c]) / e);
    }
    const m = cell.length / DEG;
    const pn = now.filter(v => v.length).map(mean), pa = av.filter(v => v.length).map(mean);
    console.log("      " + String(r).padStart(3) + Math.round(m).toString().padStart(5)
      + (100 * sd(cell)).toFixed(1).padStart(11) + "%"
      + (100 * sd(pn)).toFixed(1).padStart(12) + "%"
      + (100 * sd(cell) / Math.sqrt(m)).toFixed(1).padStart(11) + "%"
      + (100 * sd(pa)).toFixed(1).padStart(11) + "%");
  }
}
console.log();

console.log("─".repeat(76));
console.log("WHAT THIS SETTLES");
console.log("  · the sentence is right, and the first half of it is a statement about");
console.log("    the INSTRUMENT rather than about the shape. Cells on one shell differ");
console.log("    from each other at one tick by 28% at r = 6 and 106% at r = 20, with");
console.log("    the radial gradient already divided out — but a cell holds an INTEGER,");
console.log("    and at r = 20 it is being asked to carry 1.084 of a charge.");
console.log("  · that scatter is the counting floor and not a shape. In charges it is");
console.log("    2.62, 2.14, 1.63, 1.15 at r = 6, 10, 14, 20, against a shot-noise floor");
console.log("    √Σp(1−p) — what a PERFECTLY round field would still scatter by — of");
console.log("    2.41, 1.94, 1.56, 1.11. Measured over floor: 1.03–1.11, on both rules.");
console.log("    The 28% and the 106% are one charge of grain divided by a deficit");
console.log("    falling as 1/r, which is why the RELATIVE wobble goes as r and passes");
console.log("    100% where the deficit drops below one whole charge.");
console.log("  · and asked at an angular resolution a cell can actually give — 26");
console.log("    patches of m = 17…194 cells — a SINGLE TICK is already round to");
console.log("    10–15%. The raggedness is grain; the shape under it never leaves.");
console.log("  · what is spherical is the AVERAGE, and it is spherical to well under a");
console.log("    percent: over 300 ticks the angular scatter falls to 0.8–1.3% per cell");
console.log("    and 0.1–0.5% per patch, at or under the 1/√n a pure noise would give");
console.log("    — it averages away slightly FASTER than independent noise would, the");
console.log("    relay being conserving rather than free. A shape would not average");
console.log("    away at all; this does.");
console.log("  · the shape is round to about 1% by r = 10 and the lattice survives only");
console.log("    near in: the ⟨100⟩/⟨110⟩/⟨111⟩ spread is 3.7% at r = 6 and 5.4% at");
console.log("    r = 8, under 1.3% at every radius beyond. A near-field term, not a");
console.log("    shape — which is exactly what FLOOR is for.");
console.log("  · and it is a sphere rather than the cube the FRONT is: a field that");
console.log("    were a function of Chebyshev distance would read 3.63 at ⟨111⟩,");
console.log("    r = 20, being the r/√3 shell. Measured, 1.088, against a shell mean");
console.log("    of 1.084. The front is a cube; the field is round.");
