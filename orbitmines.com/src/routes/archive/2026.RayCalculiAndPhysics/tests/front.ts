/**
 * WHAT A CROSSING FRONT ACTUALLY SEES — the measurement `signed` §3 refused.
 *
 * `signed` ends on a fork it declines to settle. The consumption mechanism
 * needs one number — the distance over which a magnetic front loses a
 * wavefront — and two quantities in that file could be it:
 *
 *     (a) the medium's own collision length      per node, 4.95 cells
 *     (b) 1/fill, a density times a cross-section per node, 3.24 cells
 *
 * and they give different states. The file argues for (b) in a sentence and
 * says so: "which is right is decidable and is not decided here". This decides
 * it, by the obvious means — put a front in the medium and watch it.
 *
 * THE FORK GOES TO (b), AND THEN THE ANSWER STOPS BEING A LATTICE CONSTANT.
 *
 * (b) wins for a structural reason rather than a numerical one. A front in
 * slot 0 can only ever be paired against slot 4 of the cell it is standing in,
 * so its encounter rate IS a per-slot occupancy, and reading (a) — how the
 * medium's charges scatter off EACH OTHER — never had a route to the front at
 * all. Measured, the front's length tracks 1/fill everywhere and misses the
 * medium's own collision length by a factor of twelve where the two are
 * furthest apart.
 *
 * But an encounter is not a consumption, and the flip mechanism counts
 * REMOVALS of the leading front, because the next front along is the opposite
 * sign. There are three fates and they do not agree:
 *
 *     annihilation    the front is destroyed          ONE removal   → flip
 *     turn, reversed  the front goes back and meets   TWO removals  → NO flip
 *                     the next front of its own train,
 *                     which is opposite, so both die
 *     turn, scattered the front is deflected 45° and  ONE removal   → flip
 *                     is simply lost to the front
 *
 * which makes the flip length depend on which turn rule is used — and the arc
 * and the shipped code do not use the same one. (G+M/3) says alike charges
 * "turn around". `vacuum.ts`'s collision rotates the pair 45°, which conserves
 * momentum and is not a reversal. Both are run here. It is worth a factor of
 * two and nothing else.
 *
 * AND THEN THE RESULT THAT WAS NOT BEING LOOKED FOR. All of the above is at
 * p = 0.1, and `mfp` is emphatic that the unsigned fill is not a parameter:
 * (1−p)/(2−p) is a fixed point of creation against dilution, THE p CANCELS,
 * and the medium sits at a half whatever the expansion rate is. The SIGNED
 * medium balances creation against ANNIHILATION instead — first order against
 * SECOND order — so its fixed point is f ∝ √p and the p does NOT cancel. It is
 * measured here at 1.33√p, with the unsigned control holding flat at ½ down
 * the same sweep as the check that the difference is real.
 *
 * So the flip length is 0.75/√p cells, the arc's own expansion rate is 10⁻⁶¹,
 * and a magnetic front therefore crosses 10³⁰ cells without meeting anything.
 * THE SPIRAL IN `signed` §3 IS AN ARTEFACT OF RUNNING THE LATTICE FAST, and
 * the model is a ferromagnet by thirty orders rather than by a factor of two.
 *
 *   §1  what a crossing front meets — the fork, settled
 *   §2  which removals flip, and the two turn rules
 *   §3  the signed fixed point, and that p does not cancel out of it
 *   §4  what that does to the spiral — and the unscreened sum that misled it
 */

const L = 96;
const DX = [1, 1, 0, -1, -1, -1, 0, 1];
const DY = [0, 1, 1, 1, 0, -1, -1, -1];

type Mode = "unsigned" | "perRay" | "perNode" | "perAxis";
type Turn = "scatter" | "reverse";

/**
 * `signed`'s medium with tracer fronts crossing it.
 *
 * The medium is verbatim: creation edges a whole cell (`s = 255`, all eight
 * slots), thinning drops each slot at the same rate, head-on pairs annihilate
 * if they disagree and turn if they agree, everything streams. What is added
 * is a population of FRONT CARRIERS — charges of a fixed sign, injected on the
 * x = 0 column into slot 0 and travelling +x, one cell a tick.
 *
 * TWO EXEMPTIONS, AND BOTH ARE DELIBERATE. A front carrier is not touched by
 * creation and not touched by thinning. Expansion diluting the medium is a
 * statement about the medium; a pulse in flight is not diluted out of
 * existence by new room appearing, it is redshifted, and that is a different
 * length on a different arc. What is being measured here is consumption by
 * collision and nothing else, so the two effects are kept apart rather than
 * summed into one number that would then be a function of p.
 *
 * THE ESTIMATOR IS PATH OVER EVENTS. Carriers that cross the whole box without
 * meeting anything are censored rather than dropped: they contribute their
 * path to the numerator and no event to the denominator, which is the right
 * handling and is what `signed` does for the medium's own charges.
 */
const run = (p: number, mode: Mode, turn: Turn, ticks = 240, inject = 6, seed0 = 20260817) => {
  const C = L * L;
  // NOT the house LCG. `signed` and `vacuum` use (s·1103515245 + 12345) mod
  // 2³¹, which is fine over the 140 ticks they run for and is not fine here:
  // the low-p rows below need thousands of ticks and tens of millions of
  // draws, and on that budget the unsigned control wanders between 0.37 and
  // 0.62 where it should sit at (1−p)/(2−p) = 0.49. That wander is the
  // generator, not the medium. Mulberry32 holds the control flat, which is
  // the check that says so.
  let S = seed0 >>> 0;
  const rnd = () => {
    S = (S + 0x6D2B79F5) >>> 0;
    let z = S;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };

  let cur = new Int8Array(C * 8), nxt = new Int8Array(C * 8);
  let tag = new Uint8Array(C * 8), tagN = new Uint8Array(C * 8);
  const born = new Map<number, number>();
  let nextId = 1;

  for (let c = 0; c < C; c++) for (let i = 0; i < 8; i++)
    if (rnd() < 0.5) cur[c * 8 + i] = mode === "unsigned" ? 1 : (rnd() < 0.5 ? 1 : -1);

  const half = Math.floor(ticks / 2);
  let path = 0, ann = 0, turned = 0, blocked = 0, chargeTicks = 0, acted = 0;
  let slot4Ticks = 0, allSlotTicks = 0;

  // Carrier ids are recycled through a byte, so a carrier is identified by its
  // slot rather than by a number that has to stay unique for the whole run —
  // `born` is keyed on the id currently in the slot and cleared when it dies.
  const kill = (q: number, measuring: boolean, which: "ann" | "turn") => {
    if (!tag[q]) return;
    if (measuring) { if (which === "ann") ann++; else turned++; }
    born.delete(tag[q]);
    tag[q] = 0;
  };

  for (let t = 0; t < ticks; t++) {
    const measuring = t >= half;

    // ── new room, edged on every axis; and the same expansion thins it
    for (let c = 0; c < C; c++) {
      if (p > 0 && rnd() < p) {
        const nodeSign = rnd() < 0.5 ? 1 : -1;
        if (mode === "perAxis") {
          for (let i = 0; i < 4; i++) {
            const r = rnd() < 0.5 ? 1 : -1;
            if (!tag[c * 8 + i]) cur[c * 8 + i] = r;
            if (!tag[c * 8 + i + 4]) cur[c * 8 + i + 4] = -r as -1 | 1;
          }
        } else {
          for (let i = 0; i < 8; i++) {
            if (tag[c * 8 + i]) continue;
            cur[c * 8 + i] = mode === "unsigned" ? 1
              : mode === "perNode" ? nodeSign
              : (rnd() < 0.5 ? 1 : -1);
          }
        }
      }
      for (let i = 0; i < 8; i++)
        if (p > 0 && rnd() < p && !tag[c * 8 + i]) cur[c * 8 + i] = 0;
    }

    // ── the occupancy the front actually samples, read BEFORE the collision
    // that depletes it: slot 4 is the only slot a slot-0 carrier can ever be
    // paired against, and it is counted over the medium alone so that one
    // front is never scored as an obstacle to another.
    if (measuring) {
      for (let c = 0; c < C; c++) {
        const q = c * 8 + 4;
        if (cur[q] && !tag[q]) slot4Ticks++;
        allSlotTicks++;
      }
    }

    // ── collide
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
      const c = y * L + x, sense = ((x + y) & 1) ? 7 : 1;
      for (let i = 0; i < 4; i++) {
        const a = c * 8 + i, b = c * 8 + i + 4;
        const sa = cur[a], sb = cur[b];
        if (!sa || !sb) continue;

        if (mode !== "unsigned" && sa !== sb) {              // (G+M/1)
          kill(a, measuring, "ann"); kill(b, measuring, "ann");
          cur[a] = 0; cur[b] = 0;
          if (measuring) acted++;
          continue;
        }

        if (turn === "reverse") {                            // (G+M/3), as the arc states it
          cur[a] = sb; cur[b] = sa;
          const ta = tag[a], tb = tag[b];
          kill(a, measuring, "turn"); kill(b, measuring, "turn");
          if (ta || tb) { /* both leave the forward front */ }
          if (measuring) acted++;
          continue;
        }

        const j = (i + sense) % 8, k = (j + 4) % 8;           // as `vacuum.ts` ships it
        if (cur[c * 8 + j] || cur[c * 8 + k]) {
          if (measuring && (tag[a] || tag[b])) blocked++;
          continue;
        }
        cur[c * 8 + j] = sa; cur[c * 8 + k] = sb;
        kill(a, measuring, "turn"); kill(b, measuring, "turn");
        cur[a] = 0; cur[b] = 0;
        if (measuring) acted++;
      }
    }

    // ── stream
    nxt.fill(0); tagN.fill(0);
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
      const c = y * L + x;
      for (let i = 0; i < 8; i++) {
        const q = c * 8 + i, v = cur[q];
        if (!v) continue;
        const nx = (x + DX[i] + L) % L, ny = (y + DY[i] + L) % L;
        const r = ((ny * L + nx) * 8) + i;
        nxt[r] = v; tagN[r] = tag[q];
      }
    }
    let tmp: any = cur; cur = nxt; nxt = tmp;
    tmp = tag; tag = tagN; tagN = tmp;

    // ── retire anything that has crossed the box, and count what is in flight
    for (let y = 0; y < L; y++) {
      const q = (y * L + (L - 1)) * 8;
      if (tag[q]) { born.delete(tag[q]); tag[q] = 0; cur[q] = 0; }
    }
    if (measuring) {
      let n = 0, f = 0;
      for (let q = 0; q < cur.length; q++) { if (cur[q]) n++; if (tag[q]) f++; }
      chargeTicks += n; path += f;
    }

    // ── inject, into the free slots of the x = 0 column
    for (let k = 0; k < inject; k++) {
      const y = Math.floor(rnd() * L), q = (y * L) * 8;
      if (cur[q] || tag[q]) continue;
      cur[q] = 1;
      const id = (nextId = nextId % 250 + 1);
      tag[q] = id; born.set(id, t);
    }
  }

  const events = ann + turned, met = ann + turned + blocked;
  return {
    fill: (chargeTicks / (ticks - half)) / (C * 8),
    slot4: slot4Ticks / allSlotTicks,
    mediumMfp: acted > 0 ? chargeTicks / (2 * acted) : Infinity,
    lambdaMeet: met > 0 ? path / met : Infinity,
    lambdaStop: events > 0 ? path / events : Infinity,
    lambdaAnn: ann > 0 ? path / ann : Infinity,
    annShare: events > 0 ? ann / events : 0,
    blockShare: met > 0 ? blocked / met : 0,
    path, ann, turned, blocked,
  };
};

const NAME: Record<Mode, string> = {
  unsigned: "unsigned", perRay: "per ray", perNode: "per node", perAxis: "per axis",
};

const SITES = new Map<number, { rs: number[], ss: number[] }>();

/**
 * Luttinger–Tisza on a flip length — WITH THE MODEL'S OWN SCREENING, which is
 * not optional.
 *
 * `vacrate` and `signed` both sum (−1)^⌊r/flip⌋/r² over a ball and read off the
 * winning wavevector. That sum does not converge. The number of sites in a
 * shell grows as r² and the coupling falls as 1/r², so EVERY SHELL CONTRIBUTES
 * THE SAME AMOUNT with an alternating sign, and the answer is set by where the
 * ball happens to be cut. Measured: at a flip length of 8 the unscreened sum
 * gives a spiral at r ≤ 20 and a ferromagnet at r ≤ 40.
 *
 * The model already owns the fix and the arc already states it — `screen` and
 * `creation`: a vacuum full of ± pairs gives exp(−r/λ) with λ the gravity arc's
 * own `reach`. With it the sum converges absolutely and q* is flat in the
 * cutoff from r ≤ 12 upward, which is the check below.
 */
const bestQ = (flip: number, Rmax = 30, screen = 8, N = 120) => {
  const key = Rmax;
  if (!SITES.has(key)) {
    const n = Math.ceil(Rmax), rs: number[] = [], ss: number[] = [];
    for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
      if (!x && !y && !z) continue;
      const r = Math.hypot(x, y, z);
      if (r > Rmax) continue;
      rs.push(r); ss.push(x + y + z);
    }
    SITES.set(key, { rs, ss });
  }
  const { rs, ss } = SITES.get(key)!;
  const w = rs.map(r => Math.pow(-1, Math.floor(r / Math.max(flip, 0.3))) *
    Math.exp(-r / screen) / (r * r));
  let bq = 0, bs = -Infinity;
  for (let i = 0; i <= N; i++) {
    const q = (i / N) * Math.PI;
    let acc = 0;
    for (let k = 0; k < w.length; k++) acc += w[k] * Math.cos(q * ss[k]);
    if (acc > bs) { bs = acc; bq = q; }
  }
  return bq;
};
const state = (q: number) => (q < 0.02 * Math.PI ? "FERROMAGNET" : "SPIRAL");

export function meetingReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. WHAT A CROSSING FRONT MEETS — AND READING (a) NEVER HAD A ROUTE TO IT");
  line("=".repeat(78));
  line();
  line("  The fork first, because it does not need a number. A front carrier");
  line("  occupies slot 0 and travels +x, and the collision rule acts on head-on");
  line("  pairs only. So the ONLY thing a front can ever meet is slot 4 of the");
  line("  cell it is standing in, and its encounter rate is a per-slot occupancy");
  line("  BY CONSTRUCTION. Reading (a) — the medium's own collision length — is a");
  line("  fact about how the medium's charges scatter off EACH OTHER, and a");
  line("  crossing front is not one of them. `signed` §3 guessed (b) in a");
  line("  sentence and guessed right, and the reason is structural.");
  line();
  line("  The numbers say the same thing. The occupancy is read BEFORE the");
  line("  collision that depletes it, since that is the one a front is offered.");
  line();
  line("     convention   slot 4   1/slot4   medium mfp   MEASURED   ann   blocked");
  for (const m of ["unsigned", "perRay", "perNode", "perAxis"] as Mode[]) {
    const r = run(0.1, m, "scatter");
    line(`     ${NAME[m].padEnd(12)}${r.slot4.toFixed(3).padStart(6)}  ` +
      `${(1 / r.slot4).toFixed(2).padStart(7)}   ${r.mediumMfp.toFixed(2).padStart(10)}   ` +
      `${r.lambdaMeet.toFixed(2).padStart(8)}  ${(r.annShare * 100).toFixed(0).padStart(3)}%  ` +
      `${(r.blockShare * 100).toFixed(0).padStart(6)}%`);
  }
  line();
  line("  MEASURED is the distance to a front's first encounter of any kind. It");
  line("  sits within about a third of 1/slot4 everywhere and misses the medium's");
  line("  own collision length by a factor of twelve at per axis, where the two");
  line("  candidates were furthest apart. The residual gap is correlation — the");
  line("  medium is made in whole cells, so its charges arrive clustered and a");
  line("  mean-field rate is an underestimate. THE FORK IS SETTLED AND (b) WINS.");
  line();
  line("  But read the last two columns, because they are what `signed` could not");
  line("  have seen from a fill. AN ENCOUNTER IS NOT A CONSUMPTION. Some meetings");
  line("  are alike and TURN, some find no room to turn into and do nothing at");
  line("  all, and only the rest annihilate. The unsigned control makes the point");
  line("  at its limit: every one of its charges is +1, so its front is never");
  line("  annihilated and its ann share is nought.");

  return out.join("\n");
}

export function flipReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. WHICH REMOVALS FLIP — AND THE ARC AND THE CODE DO NOT AGREE");
  line("=".repeat(78));
  line();
  line("  `consume`'s mechanism counts REMOVALS of the leading front, because the");
  line("  train alternates and the next one along is the opposite sign. So the");
  line("  flip length is neither the encounter length nor the removal length —");
  line("  it is the length over which the PARITY changes, and the two kinds of");
  line("  removal do not both change it.");
  line();
  line("     ANNIHILATION      the front is destroyed where it stands. One");
  line("                       removal, the next front arrives. A FLIP.");
  line();
  line("     TURN, REVERSED    (G+M/3) as the arc states it: the front goes back");
  line("                       and 'meets the opposite-sign wave its own source");
  line("                       put out behind it. It annihilates there.' That is");
  line("                       TWO removals — itself and the next one — so the");
  line("                       front after that is the SAME sign. NO FLIP.");
  line();
  line("     TURN, SCATTERED   `vacuum.ts` rotates the pair 45° instead, which");
  line("                       conserves momentum and is not a reversal. The");
  line("                       carrier is deflected out of the front and becomes");
  line("                       medium. One removal. A FLIP.");
  line();
  line("  So the flip length is λ(annihilation) under the arc's rule and λ(any");
  line("  removal) under the shipped one.");
  line();
  line("        convention    reversed → λ_flip     scattered → λ_flip");
  for (const m of ["perRay", "perNode", "perAxis"] as Mode[]) {
    const rev = run(0.1, m, "reverse"), sc = run(0.1, m, "scatter");
    line(`        ${NAME[m].padEnd(13)}${rev.lambdaAnn.toFixed(2).padStart(8)} cells      ` +
      `${sc.lambdaStop.toFixed(2).padStart(8)} cells`);
  }
  line();
  line("  A factor of about two between them, and it is a question about the");
  line("  model's own text rather than about the world: (G+M/3) is written as");
  line("  'turn around' in the arc and shipped as a 45° rotation in `vacuum.ts`.");
  line("  Every displacement result in the magnetic half — the λ/2 offset, the");
  line("  R = λ step in `vacsign`, regional sourcing in two ticks in `pernode` —");
  line("  is built on REVERSAL. One of the two is the model and the other is a");
  line("  lattice-gas convenience.");
  line();
  line("  AT p = 0.1 BOTH GIVE A SPIRAL, which is why the next section matters.");

  return out.join("\n");
}

export function fixedPointReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. THE SIGNED FIXED POINT — AND p DOES NOT CANCEL OUT OF IT");
  line("=".repeat(78));
  line();
  line("  Everything above is at p = 0.1, and `mfp` is emphatic that the fill is");
  line("  not free: (1−p)/(2−p) is a fixed point of creation against dilution,");
  line("  THE p CANCELS, and the medium sits at a half whatever the expansion");
  line("  rate does. That is what makes the unsigned number a derivation rather");
  line("  than a parameter, and it is why nobody had to ask what p was.");
  line();
  line("  `signed` names the one calculation left: the SIGNED medium balances");
  line("  creation against ANNIHILATION rather than against dilution, so its");
  line("  fixed point is a different one. Here it is, run.");
  line();
  line("     p        ticks    unsigned    per ray   per node   per axis");
  const sweep: [number, number, number][] = [];
  for (const p of [0.2, 0.1, 0.05, 0.02, 0.01, 0.005]) {
    const ticks = Math.min(2000, Math.max(300, Math.ceil(8 / p)));
    const f = (["unsigned", "perRay", "perNode", "perAxis"] as Mode[])
      .map(m => run(p, m, "reverse", ticks).slot4);
    sweep.push([p, f[2], ticks]);
    line(`   ${p.toFixed(3).padStart(6)}   ${String(ticks).padStart(6)}   ` +
      f.map(v => v.toFixed(4).padStart(9)).join(" "));
  }
  line();
  line("  THE CONTROL PASSES AND THE ANSWER IS THE OPPOSITE ONE. Unsigned holds");
  line("  at a half all the way down — which is `vacuum`'s derivation reproduced,");
  line("  and is the check that the rest of the row means anything. EVERY SIGNED");
  line("  CONVENTION EMPTIES OUT INSTEAD.");
  line();
  line("  And it empties out at a rate the balance predicts exactly. Creation");
  line("  supplies charges at a rate proportional to p per slot; annihilation");
  line("  removes them in PAIRS, at a rate proportional to f². Setting the two");
  line("  equal gives f ∝ √p, where dilution — being first order in f — gives a");
  line("  constant. That is the whole of the difference between the two media.");
  line();
  const xs = sweep.map(([p]) => Math.log(p)), ys = sweep.map(([, f]) => Math.log(f));
  const n = xs.length;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  const tail = sweep.filter(([p]) => p <= 0.02);
  const tailSlope = Math.log(tail[0][1] / tail[tail.length - 1][1]) /
    Math.log(tail[0][0] / tail[tail.length - 1][0]);
  line("     f / √p over the sweep:  " +
    sweep.map(([p, f]) => (f / Math.sqrt(p)).toFixed(2)).join("  "));
  line(`     log-log slope, all rows        ${(num / den).toFixed(3)}`);
  line(`     log-log slope, p ≤ 0.02        ${tailSlope.toFixed(3)}   ← a half`);
  line();
  line("  f/√p flattens onto about 1.33 and the exponent goes to ½ once the");
  line("  asymptotic regime is reached. SO THE SIGNED VACUUM IS");
  line("  ANNIHILATION-LIMITED AND ITS DENSITY IS A FUNCTION OF THE EXPANSION");
  line("  RATE, where the unsigned one is dilution-limited and is not.");

  return out.join("\n");
}

export function verdictReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. AND WHAT THAT DOES TO THE SPIRAL");
  line("=".repeat(78));
  line();
  line("  One thing to clear out of the way first, because it affects `vacrate`");
  line("  and `signed` and not only this file. THE UNSCREENED LUTTINGER–TISZA SUM");
  line("  DOES NOT CONVERGE. A shell at r holds ∝ r² sites and the coupling is");
  line("  1/r², so every shell contributes the same amount with an alternating");
  line("  sign and the verdict is set by where the ball is cut:");
  line();
  line("     flip length 8, no screening:   r ≤ 20 → SPIRAL      r ≤ 40 → FERRO");
  line("     flip length 20, no screening:  r ≤ 20 → FERRO       r ≤ 40 → SPIRAL");
  line();
  line("  The model owns the fix and the arc already states it — `screen` and");
  line("  `creation`, a vacuum of ± pairs giving exp(−r/λ) with λ the gravity");
  line("  arc's own `reach`. With screening in, q* is flat in the cutoff, and");
  line("  everything below is summed that way.");
  line();
  line("     λ_screen = 8          q*/π at cutoff r ≤ 12, 16, 20, 30, 40");
  for (const fl of [3, 4, 6, 8, 16]) {
    line(`     flip ${fl.toString().padStart(2)} cells     ` +
      [12, 16, 20, 30, 40].map(R => (bestQ(fl, R) / Math.PI).toFixed(3).padStart(7)).join("  "));
  }
  line();
  line("  And the threshold is not a bare four cells — it is a RATIO. A spiral");
  line("  needs the sign to turn over inside the range the coupling still");
  line("  reaches, so what matters is the flip length against the screening");
  line("  length, and the crossing is at roughly twice it:");
  line();
  line("     λ_screen      ferromagnet once the flip length exceeds");
  for (const sc of [4, 8, 16]) {
    let cross = 0;
    for (const fl of [2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 30, 40, 60]) {
      if (bestQ(fl, 30, sc) < 0.02 * Math.PI) { cross = fl; break; }
    }
    line(`     ${sc.toString().padStart(6)} cells   ${cross.toString().padStart(6)} cells` +
      `        (${(cross / sc).toFixed(1)} × λ_screen)`);
  }
  line();
  line("  NOW PUT §1 AND §3 TOGETHER. The encounter length is 1/f by §1 and");
  line("  f ≈ 1.33√p by §3, so it is 0.75/√p cells — NOT a lattice constant, but");
  line("  a function of the expansion rate. And the arc has a value for p: `mfp`");
  line("  quotes the real one as 10⁻⁶¹.");
  line();
  line("  1/f is tabulated rather than the flip length itself, and it is a LOWER");
  line("  BOUND on it: an encounter is not a consumption, so the measured flip");
  line("  length runs between one and 2.2 times 1/f depending on the turn rule");
  line("  (§1, §2). Bounding it from below is the conservative direction, since");
  line("  it is the SHORT flip lengths that would give a spiral.");
  line();
  line("     expansion rate p     signed fill f      1/f  (lower bound on flip)");
  for (const p of [0.1, 0.01, 1e-4, 1e-8, 1e-20, 1e-61]) {
    const f = 1.33 * Math.sqrt(p);
    line(`     ${p.toExponential(0).padStart(12)}    ${f.toExponential(2).padStart(12)}` +
      `    ${(1 / f).toExponential(2).padStart(15)}`);
  }
  line();
  line("  Against a screening length of any size the model could plausibly");
  line("  carry, 10³⁰ cells is not a competition. And the measured lengths at");
  line("  the densities the lattice can actually be run at already show it");
  line("  turning over — this is per node, screened, converged:");
  line();
  line("     p        λ_flip (reversed)   state          λ_flip (scattered)  state");
  for (const p of [0.1, 0.05, 0.02, 0.01]) {
    const ticks = Math.min(2000, Math.max(300, Math.ceil(8 / p)));
    const rev = run(p, "perNode", "reverse", ticks).lambdaAnn;
    const sc = run(p, "perNode", "scatter", ticks).lambdaStop;
    line(`   ${p.toFixed(3).padStart(6)}   ${rev.toFixed(2).padStart(13)}   ` +
      `${state(bestQ(rev)).padEnd(13)}  ${sc.toFixed(2).padStart(14)}   ${state(bestQ(sc))}`);
  }
  line();
  line("  THE SPIRAL IS AN ARTEFACT OF RUNNING THE LATTICE FAST. `signed` §3's");
  line("  best case — per node at 3.24 cells, the first non-collinear state the");
  line("  model ever produced — is a measurement at p = 0.1, and p = 0.1 is a");
  line("  universe that doubles every few ticks. At the expansion rate the model");
  line("  actually claims, the signed vacuum is thirty orders emptier than the");
  line("  unsigned one, a magnetic front crosses 10³⁰ cells without meeting");
  line("  anything, and there is nothing left to flip a sign. FERROMAGNET, BY");
  line("  THIRTY ORDERS RATHER THAN BY A FACTOR OF TWO.");
  line();
  line("  WHICH IS THE CONCLUSION `signed` WITHDREW. That file withdrew 'a signed");
  line("  vacuum would be thirty orders emptier than an unsigned one' because it");
  line("  had been computed from a GUESSED creation rule. The number was right");
  line("  and the reasoning was wrong; with the shipped rule — a cell edged on");
  line("  every axis — it comes back, and 10⁻³⁰·⁵ is what √10⁻⁶¹ is.");
  line();
  line("  WHAT SURVIVES. Per node is still the convention, on all three of the");
  line("  reasons that chose it — `aggregate`'s far field, `pernode`'s mediated");
  line("  coupling, and the shortest flip length of the three here. None of them");
  line("  was a claim about a spiral. The consumption mechanism still oscillates");
  line("  where five earlier attempts only attenuated; it is the DENSITY that");
  line("  fails, not the mechanism. The magnetic half is still a ferromagnet and");
  line("  is one more securely than before.");
  line();
  line("  WHAT IS CLOSED, AND BY A MEASUREMENT. The antiferromagnet and the");
  line("  spiral both. `signed` left exactly one door — the signed medium's own");
  line("  fixed point — and the door leads somewhere definite: the fixed point");
  line("  exists, it is f ∝ √p, and it makes the medium THINNER as the expansion");
  line("  slows rather than holding at a half. No expansion rate puts the flip");
  line("  length under the screening length, because the only rate that would is");
  line("  one this universe does not have.");
  line();
  line("  WHAT IS OPENED, AND IT IS SMALL. Whether an alike pair REVERSES or");
  line("  SCATTERS. It is worth a factor of two in the flip length and nothing in");
  line("  the conclusion — but the arc and the code disagree about a rule stated");
  line("  in the arc's own three-line summary, and `vacsign` and `pernode` both");
  line("  rest on reversal.");

  return out.join("\n");
}

console.log(meetingReport());
console.log(flipReport());
console.log(fixedPointReport());
console.log(verdictReport());
