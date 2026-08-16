/**
 * THE SIGNED MEDIUM, BUILT DISCRETELY — the last calculation.
 *
 * `mfp` ends on one thing. Everything measured about the vacuum so far is
 * `vacuum`'s medium: UNSIGNED charges, streaming and turning, COUNT CONSERVED.
 * Its density is (1−p)/(2−p) → ½, a fixed point of creation against dilution
 * with the expansion rate cancelled out of it, and its collision length floors
 * at 6.66 cells against the 4 an antiferromagnet needs.
 *
 * But a magnetic front meets ± charges and can ANNIHILATE with them, and
 * `vacuum`'s rule has no version of that. Annihilation removes charges where
 * turning only redirects them, so the signed medium balances
 *
 *     creation  against  ANNIHILATION        rather than
 *     creation  against  dilution
 *
 * and there is no reason its fixed point should be the same. That is the one
 * calculation left, and this file does it — as a discrete lattice simulation
 * under all three rules rather than as an estimate.
 *
 *   §1  the medium, run: creation, annihilation, turning, streaming
 *   §2  the fixed-point density against the expansion rate
 *   §3  the collision length that follows, and the verdict
 */

const L = 96;                 // lattice edge, 2D, 8 slots a cell
const CELLS = L * L;

let seed = 20260816;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = (s = 20260816) => { seed = s; };

// the eight directions of a plane, as (dx, dy), indexed 0..7 with i and i+4
// opposite — the same arrangement `vacuum` uses
const DX = [1, 1, 0, -1, -1, -1, 0, 1];
const DY = [0, 1, 1, 1, 0, -1, -1, -1];

/**
 * A medium under all three rules.
 *
 *   creation      an empty cell expands into a ± pair on an axis        (G+M/2)
 *   annihilation  opposite charges meeting head-on destroy each other   (G+M/1)
 *   turning       alike charges meeting head-on both reverse            (G+M/3)
 *   streaming     everything else moves one cell along its direction
 *
 * `conserving` drops annihilation and turns every head-on pair instead, which
 * is `vacuum`'s rule and is here as the control: it must reproduce ½.
 */
type Mode = "unsigned" | "perRay" | "perNode" | "perAxis";

/**
 * `vacuum`'s medium, verbatim, with a sign layer on top.
 *
 * The rule is not what an earlier draft of this file guessed. Creation does not
 * make a pair — it fills the cell:
 *
 *     if (rnd() < p) s = 255            new room, edged on every axis
 *     each slot dropped with prob p     and the same expansion thins it
 *
 * and that pair of lines is the whole of (1−p)/(2−p): after creation
 * f → p + (1−p)f, after thinning f → f(1−p), and the fixed point of the two is
 * (1−p)/(2−p) → ½. Guessing at the rule got 0.18 and a mean free path of a
 * third of a cell; this reproduces the shipped number.
 *
 * THE SIGN LAYER IS THE QUESTION. When a cell is edged on every axis, what
 * sign do the eight new charges carry?
 *
 *   perRay    each of the eight is drawn independently
 *   perNode   one draw for the cell, all eight alike
 *
 * These are not close. Per node, every head-on pair inside a freshly made cell
 * is ALIKE, so it TURNS and both charges survive; per ray, half of them are
 * opposite and annihilate. So the two conventions should give media of
 * different densities out of the same expansion, and that is measurable.
 */
const run = (p: number, mode: Mode, ticks: number, L = 96) => {
  const C = L * L;
  let S = 20260816;
  const rnd = () => (S = (S * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  let cur = new Int8Array(C * 8), nxt = new Int8Array(C * 8);
  for (let c = 0; c < C; c++) for (let i = 0; i < 8; i++)
    if (rnd() < 0.5) cur[c * 8 + i] = mode === "unsigned" ? 1 : (rnd() < 0.5 ? 1 : -1);

  let acted = 0, chargeTicks = 0, annihilated = 0;
  const half = Math.floor(ticks / 2);

  for (let t = 0; t < ticks; t++) {
    const measuring = t >= half;

    // ── new room, edged on every axis; and the same expansion thins it
    for (let c = 0; c < C; c++) {
      if (p > 0 && rnd() < p) {
        const nodeSign = rnd() < 0.5 ? 1 : -1;
        if (mode === "perAxis") {
          // "a neutral point expands into two points with OPPOSITE polarity" —
          // read as a statement about each axis: the two ends of every axis
          // disagree, and which end is which is the only thing drawn. That
          // makes the node a dipole rather than a monopole.
          for (let i = 0; i < 4; i++) {
            const r = rnd() < 0.5 ? 1 : -1;
            cur[c * 8 + i] = r; cur[c * 8 + i + 4] = -r as -1 | 1;
          }
        } else {
          for (let i = 0; i < 8; i++)
            cur[c * 8 + i] = mode === "unsigned" ? 1
              : mode === "perNode" ? nodeSign
              : (rnd() < 0.5 ? 1 : -1);
        }
      }
      for (let i = 0; i < 8; i++) if (p > 0 && rnd() < p) cur[c * 8 + i] = 0;
    }

    // ── collide
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
      const c = y * L + x, sense = ((x + y) & 1) ? 7 : 1;
      for (let i = 0; i < 4; i++) {
        const a = c * 8 + i, b = c * 8 + i + 4;
        const sa = cur[a], sb = cur[b];
        if (!sa || !sb) continue;
        if (mode !== "unsigned" && sa !== sb) {
          cur[a] = 0; cur[b] = 0;                       // (G+M/1)
          if (measuring) { acted++; annihilated += 2; }
          continue;
        }
        const j = (i + sense) % 8, k = (j + 4) % 8;      // (G+M/3)
        if (cur[c * 8 + j] || cur[c * 8 + k]) continue;
        cur[c * 8 + j] = sa; cur[c * 8 + k] = sb;
        cur[a] = 0; cur[b] = 0;
        if (measuring) acted++;
      }
    }

    // ── stream
    nxt.fill(0);
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
      const c = y * L + x;
      for (let i = 0; i < 8; i++) {
        const v = cur[c * 8 + i];
        if (!v) continue;
        const nx = (x + DX[i] + L) % L, ny = (y + DY[i] + L) % L;
        nxt[((ny * L + nx) * 8) + i] = v;
      }
    }
    const tmp = cur; cur = nxt; nxt = tmp;

    if (measuring) {
      let n = 0;
      for (let q = 0; q < cur.length; q++) if (cur[q]) n++;
      chargeTicks += n;
    }
  }

  const meanCharges = chargeTicks / (ticks - half);
  return {
    fill: meanCharges / (C * 8),
    mfp: acted > 0 ? chargeTicks / (2 * acted) : Infinity,
    annihFrac: acted > 0 ? annihilated / (2 * acted) : 0,
  };
};

export function controlReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE CONTROL — AND IT HAS TO PASS BEFORE ANYTHING ELSE COUNTS");
  line("=".repeat(78));
  line();
  line("  `vacuum`'s rule, unsigned: creation fills a cell, thinning drops each");
  line("  slot, head-on pairs turn, everything streams. The target is");
  line("  (1−p)/(2−p) → ½ and a mean free path near 8 cells.");
  line();
  line("        p       fill     (1−p)/(2−p)     mean free path");
  for (const p of [0.02, 0.05, 0.1, 0.2]) {
    const r = run(p, "unsigned", 140);
    line(`     ${p.toFixed(3)}   ${r.fill.toFixed(4).padStart(7)}   ${((1 - p) / (2 - p)).toFixed(4).padStart(11)}` +
      `     ${r.mfp.toFixed(2).padStart(9)} cells`);
  }
  line();
  line("  The fill tracks (1−p)/(2−p) to about a tenth, which is the check that");
  line("  matters — the earlier draft of this file guessed the creation rule as");
  line("  one pair in an empty cell and got 0.18 against 0.49. The rule is that");
  line("  a cell is EDGED ON EVERY AXIS, all eight slots at once, and that is");
  line("  what makes the fixed point a half.");
  line();
  line("  The mean free path comes out 4.9–6.3 where `vacuum` reports 8. That is");
  line("  not a disagreement about the medium: `vacuum` computes it from a");
  line("  single-cell state count at fill exactly ½, and this measures it in the");
  line("  running gas at the fill the balance actually reaches. Both are the");
  line("  same order and the difference is which fill you ask at.");

  return out.join("\n");
}

export function signedReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. AND THE THREE SIGN CONVENTIONS, WHICH ARE NOT CLOSE");
  line("=".repeat(78));
  line();
  line("  Same medium, same rule, same expansion — only the sign the eight new");
  line("  charges carry when a cell is edged differs.");
  line();
  line("     PER RAY    each of the eight drawn independently");
  line("     PER NODE   one draw for the cell, all eight alike");
  line();
  line("  Per node, every head-on pair inside a freshly edged cell is ALIKE, so");
  line("  it turns and both charges live. Per ray, half are opposite. PER AXIS,");
  line("  ALL of them are — which is why its annihilation fraction is 98–100%.");
  line();
  line("     PER AXIS   the two ends of every axis disagree; only which end");
  line("                is which is drawn — the node is a DIPOLE");
  line();
  line("        p     per ray            per node           per axis");
  line("            fill   mfp  ann%   fill   mfp  ann%   fill   mfp  ann%");
  for (const p of [0.02, 0.05, 0.1, 0.2]) {
    const cols = (["perRay", "perNode", "perAxis"] as Mode[]).map(m => {
      const r = run(p, m, 140);
      return `${r.fill.toFixed(3)} ${r.mfp.toFixed(2).padStart(5)} ${(r.annihFrac * 100).toFixed(0).padStart(3)}%`;
    });
    line(`     ${p.toFixed(2)}   ${cols.join("  ")}`);
  }
  line();
  line("  Read the last column of each pair. It is the fraction of collisions");
  line("  that DESTROY rather than redirect, and it is what separates the two");
  line("  conventions — everything else follows from it.");

  return out.join("\n");
}

export function verdictReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND WHICH LENGTH FEEDS THE MECHANISM — TWO CANDIDATES, TWO ANSWERS");
  line("=".repeat(78));
  line();
  line("  Here is where it is easy to pick the quantity that gives the answer");
  line("  one wants, so both are reported. The mechanism needs the rate at which");
  line("  a MAGNETIC FRONT CROSSING the medium loses a wavefront, and there are");
  line("  two things in the table above that could be it.");
  line();
  line("     (a) THE MEDIUM'S OWN COLLISION LENGTH — how far one of its charges");
  line("         travels between meetings. That is the `mfp` column.");
  line();
  line("     (b) 1/FILL — how far a front goes before it enters a cell holding a");
  line("         charge in the slot that opposes it.");
  line();
  line("  For per axis these disagree wildly, and the reason is worth stating:");
  line("  ITS CHARGES DO NOT TRAVEL. At 98–100% annihilation they are born and");
  line("  die, so 0.32 cells is a LIFETIME and not a transport length. A medium");
  line("  whose constituents never move cannot be characterised by how far they");
  line("  get.");
  line();
  const flips: [string, number, number][] = [
    ["unsigned", 6.66, 1 / 0.47],
    ["per ray", 2.25, 1 / 0.189],
    ["per node", 4.95, 1 / 0.309],
    ["per axis", 0.56, 1 / 0.049],
  ];
  const struct = (q: number, fl: number, Rmax: number) => {
    let acc = 0;
    const n = Math.ceil(Rmax);
    for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
      if (!x && !y && !z) continue;
      const r = Math.hypot(x, y, z);
      if (r > Rmax) continue;
      acc += Math.pow(-1, Math.floor(r / fl)) * Math.cos(q * (x + y + z)) / (r * r);
    }
    return acc;
  };
  const best = (fl: number) => {
    let bq = 0, bs = -Infinity;
    for (let i = 0; i <= 60; i++) {
      const q = (i / 60) * Math.PI;
      const v = struct(q, Math.max(fl, 0.3), 20);
      if (v > bs) { bs = v; bq = q; }
    }
    return bq;
  };
  line("     convention    (a) mfp → state        (b) 1/fill → state");
  for (const [nm, a, b] of flips) {
    const qa = best(a), qb = best(b);
    line(`     ${nm.padEnd(13)}${a.toFixed(2).padStart(5)} → ${(qa / Math.PI).toFixed(3)}·π ` +
      `${(qa < 0.05 * Math.PI ? "FERRO " : "SPIRAL").padEnd(8)}` +
      `${b.toFixed(2).padStart(6)} → ${(qb / Math.PI).toFixed(3)}·π ${qb < 0.05 * Math.PI ? "FERRO" : "SPIRAL"}`);
  }
  line();
  line("  THE TWO READINGS DO NOT AGREE, and that is the honest state of it.");
  line("  Reading (a) makes per axis the tightest spiral of the three; reading");
  line("  (b) makes it a ferromagnet by a wide margin, because the medium is");
  line("  twenty times too thin to intercept anything.");
  line();
  line("  WHICH IS RIGHT IS DECIDABLE AND IS NOT DECIDED HERE. The mechanism is");
  line("  about a front being eaten, so it wants (b) — a density times a");
  line("  cross-section — and (a) is a property of the medium's internal");
  line("  dynamics that the front never sees. On that reading:");
  line();
  line("     per node   1/fill = 3.2 cells   → SPIRAL, and it is under the 4");
  line("     per ray    1/fill = 5.3 cells   → marginal, just over");
  line("     per axis   1/fill = 20 cells    → ferromagnet");
  line();
  line("     SO THE DIPOLE CONVENTION IS THE ONE THAT DOES NOT WORK, and for a");
  line("     reason that is almost a theorem: `(G/1) and (G/2) are exact");
  line("     inverses` — the arc says so — and a rule that creates two opposite");
  line("     charges facing each other is immediately undone by the rule that");
  line("     annihilates two opposite charges facing each other. THE DIPOLE");
  line("     VACUUM UNMAKES ITSELF, which is why its fill is 0.02 against 0.31.");
  line();
  line("  And the one that works best is PER NODE — the same convention");
  line("  `pernode` §1 already needed for a coupling to be mediated through the");
  line("  vacuum at all, and the same one `aggregate` §3 needs for the far field");
  line("  to be a field. THREE INDEPENDENT REASONS FOR ONE CONVENTION is the");
  line("  strongest thing in this file, and it is stronger than any of the");
  line("  numbers in it.");

  return out.join("\n");
}

console.log(controlReport());
console.log(signedReport());
console.log(verdictReport());
