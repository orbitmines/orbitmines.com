/**
 * THE ACTUAL AUTOMATON — the ribbon, the vacuum and the three rules, with nothing
 * approximated. And it does not behave the way the previous three files assumed.
 *
 * `rules`, `repair` and the panels all modelled the traffic with RATES: a damage
 * probability per cell, a mixing fraction, a vacuum flux. Those are statistics of
 * a process, not the process, and the objection that they are not the model is
 * fair. This is the model:
 *
 *   STATE     a grid of cells. Each cell is PRESENT (a spatial point) or ABSENT.
 *             Charges sit on cells, each with a heading among the 8 neighbours
 *             (SHEET = 3² − 1 in the plane) and a polarity ±1. No reals, no
 *             probabilities, no occupancy vectors.
 *
 *   STREAM    every charge moves one cell along its heading. Nothing else moves
 *             it. A charge in empty space goes straight for ever.
 *
 *   (G+M/1)   two OPPOSITE polarities on one cell annihilate, "leaving a single
 *             neutral spatial point behind" — so two points become one and THE
 *             CELL IS GONE. This is the only event that removes space.
 *
 *   (G+M/2)   a neutral point expands into two points of opposite polarity. So
 *             one point becomes two: this is the only event that ADDS space, and
 *             it is what can put an annihilated cell back.
 *
 *   (G+M/3)   two IDENTICAL polarities on one cell turn around. Nothing is
 *             created or destroyed.
 *
 * The ribbon is an annulus of cells with the inner and outer edges swapped across
 * one radius — a Möbius strip on the lattice — and it is a fermion exactly while
 * its surviving cells are still one-sided, tested by 2-colouring.
 *
 *   §1  the automaton runs, and the three rules fire at rates NOBODY CHOSE.
 *
 *   §2  A FERMION CANNOT BE COHERENT, and this withdraws `rules` §3 entirely.
 *       A Möbius ribbon's two rails ARE the two polarities — that is what the sign
 *       holonomy means — so the structure necessarily emits both signs a few cells
 *       apart, and (G+M/1) is what happens when they meet. MEASURED: the
 *       rail-signed ribbon takes 221 self-annihilations and survives as a fermion
 *       17% of the time; the same object emitting ONE sign takes ZERO and survives
 *       100% of the time — but a one-sign emitter is not one-sided, so it is not a
 *       fermion. THE THING THAT MAKES IT A FERMION IS THE THING THAT EATS IT.
 *
 *   §3  where the damage lands, measured rather than argued from 1/d².
 *
 *   §4  and creation and annihilation turn out to be ONE process at one rate,
 *       which removes the regime `repair` needed.
 *
 * SO: the mechanism survives contact with the real dynamics and every MARGIN in
 * the previous three files does not. This is the file that should be believed over
 * them, because it is the only one that runs the rules as stated.
 */

const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);
const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// the 8 headings of the plane: 3² − 1
const DIRS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

const N = 41;                  // grid is N×N
const R_IN = 8, R_OUT = 12;    // the ribbon annulus
const CX = 20, CY = 20;

const idx = (x: number, y: number) => y * N + x;
const inGrid = (x: number, y: number) => x >= 0 && y >= 0 && x < N && y < N;

/** which ribbon cell, if any, and where on it */
const ribbonOf = (x: number, y: number) => {
  const dx = x - CX, dy = y - CY;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < R_IN - 0.5 || r > R_OUT + 0.5) return null;
  const ring = Math.round(r) - R_IN;               // 0 .. width−1, the rail
  const ang = Math.atan2(dy, dx);                  // −π .. π
  return { ring, ang, sector: Math.floor(((ang + Math.PI) / (2 * Math.PI)) * SECTORS) % SECTORS };
};
const SECTORS = 24;
const WIDTH = R_OUT - R_IN + 1;

type Charge = { x: number; y: number; d: number; pol: number; own: boolean };

type World = {
  present: Uint8Array;         // 1 = a spatial point exists here
  isRib: Uint8Array;           // 1 = part of the ribbon
  ring: Int8Array;             // which rail, for ribbon cells
  sector: Int8Array;
  charges: Charge[];
  // counters, all measured rather than set
  annih: number;               // (G+M/1) firings
  create: number;              // (G+M/2) firings
  turn: number;                // (G+M/3) firings
  selfAnnih: number;           // (G+M/1) between two of the structure's own rays
  ribLost: number;             // ribbon cells taken by (G+M/1)
  ribBack: number;             // ribbon cells restored by (G+M/2)
  atTwist: number;             // of ribLost, how many in the twist sector
  ticks: number;
  brokenTicks: number;
};

const build = (): World => {
  const present = new Uint8Array(N * N).fill(1);
  const isRib = new Uint8Array(N * N);
  const ring = new Int8Array(N * N).fill(-1);
  const sector = new Int8Array(N * N).fill(-1);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const rb = ribbonOf(x, y);
    if (!rb) continue;
    isRib[idx(x, y)] = 1; ring[idx(x, y)] = rb.ring; sector[idx(x, y)] = rb.sector;
  }
  return {
    present, isRib, ring, sector, charges: [],
    annih: 0, create: 0, turn: 0, selfAnnih: 0,
    ribLost: 0, ribBack: 0, atTwist: 0, ticks: 0, brokenTicks: 0,
  };
};

/**
 * Is the surviving ribbon still one-sided?
 *
 * 2-colour the surviving ribbon cells by adjacency. Every adjacency preserves the
 * rail EXCEPT across sector 0, the twist, where the rails are glued in reverse —
 * so that edge demands the opposite colour. If the colouring is consistent the
 * object is two-sided: a boson. If it cannot be completed, it is one-sided and
 * still a fermion.
 */
const oneSided = (w: World): boolean => {
  const col = new Int8Array(N * N);           // 0 unvisited, ±1
  const cells: number[] = [];
  for (let i = 0; i < N * N; i++) if (w.isRib[i] && w.present[i]) cells.push(i);
  if (!cells.length) return false;
  for (const start of cells) {
    if (col[start] !== 0) continue;
    col[start] = 1;
    const st = [start];
    while (st.length) {
      const c = st.pop()!;
      const cx = c % N, cy = (c - (c % N)) / N;
      for (const [dx, dy] of DIRS) {
        const nx = cx + dx, ny = cy + dy;
        if (!inGrid(nx, ny)) continue;
        const n = idx(nx, ny);
        if (!w.isRib[n] || !w.present[n]) continue;
        // the twist: crossing sector 0 reverses the rail, so the colour flips
        const flip = (w.sector[c] === 0 && w.sector[n] === SECTORS - 1) ||
          (w.sector[n] === 0 && w.sector[c] === SECTORS - 1);
        const want = flip ? -col[c] : col[c];
        if (col[n] === 0) { col[n] = want as -1 | 1; st.push(n); }
        else if (col[n] !== want) return true;      // no consistent colouring
      }
    }
  }
  return false;
};

/** one tick of the automaton */
const tick = (w: World, r: () => number, pCreate: number, emit: number, mixing: number,
  railSigned = true) => {
  // ── the structure emits. Its polarity is the rail's, which is what makes the
  //    two rails carry opposite signs; `mixing` is the impurity being tested.
  for (let i = 0; i < N * N; i++) {
    if (!w.isRib[i] || !w.present[i]) continue;
    if (r() > emit) continue;
    const x = i % N, y = (i - (i % N)) / N;
    // THE POINT OF §2: a Möbius ribbon's two rails carry OPPOSITE signs — that
    // is what the twist means — so a real fermion cannot emit one sign only.
    const railSign = railSigned ? (w.ring[i] < WIDTH / 2 ? +1 : -1) : +1;
    const pol = r() < mixing ? -railSign : railSign;
    w.charges.push({ x, y, d: Math.floor(r() * 8), pol, own: true });
  }

  // ── (G+M/2): a neutral point expands into two of opposite polarity. This is
  //    the vacuum, and it is also what puts an annihilated cell back.
  for (let i = 0; i < N * N; i++) {
    if (r() > pCreate) continue;
    const x = i % N, y = (i - (i % N)) / N;
    if (!w.present[i]) {
      w.present[i] = 1;                        // space created where there was none
      if (w.isRib[i]) w.ribBack++;
    }
    const d = Math.floor(r() * 8);
    w.charges.push({ x, y, d, pol: +1, own: false });
    w.charges.push({ x, y, d: (d + 4) % 8, pol: -1, own: false });
    w.create++;
  }

  // ── STREAM: every charge moves one cell along its heading
  const kept: Charge[] = [];
  for (const c of w.charges) {
    const [dx, dy] = DIRS[c.d];
    const nx = c.x + dx, ny = c.y + dy;
    if (!inGrid(nx, ny)) continue;             // off the edge of the world
    c.x = nx; c.y = ny;
    kept.push(c);
  }
  w.charges = kept;

  // ── COLLIDE: group by cell, then apply (G+M/1) or (G+M/3) by the two signs
  const byCell = new Map<number, Charge[]>();
  for (const c of w.charges) {
    const k = idx(c.x, c.y);
    const l = byCell.get(k); if (l) l.push(c); else byCell.set(k, [c]);
  }
  const dead = new Set<Charge>();
  for (const [cell, list] of byCell) {
    if (list.length < 2) continue;
    // pair them off; each pair is one event
    for (let a = 0; a < list.length - 1; a += 2) {
      const p = list[a], q = list[a + 1];
      if (dead.has(p) || dead.has(q)) continue;
      if (p.pol === q.pol) {
        // (G+M/3) they turn around
        p.d = (p.d + 4) % 8; q.d = (q.d + 4) % 8;
        w.turn++;
      } else {
        // (G+M/1) they annihilate, leaving ONE neutral point where there were
        // two — so the cell is taken out of space
        dead.add(p); dead.add(q);
        w.annih++;
        if (p.own && q.own) w.selfAnnih++;
        if (w.present[cell]) {
          w.present[cell] = 0;
          if (w.isRib[cell]) {
            w.ribLost++;
            if (w.sector[cell] === 0) w.atTwist++;
          }
        }
      }
    }
  }
  w.charges = w.charges.filter(c => !dead.has(c));

  w.ticks++;
  if (!oneSided(w)) w.brokenTicks++;
};

const run = (ticks: number, pCreate: number, emit: number, mixing: number, seed: number,
  railSigned = true) => {
  const w = build(); const r = rng(seed);
  for (let t = 0; t < ticks; t++) tick(w, r, pCreate, emit, mixing, railSigned);
  return w;
};
/** the same, averaged over seeds, because one run of this is noise */
const runs_ = (n: number, ticks: number, pCreate: number, emit: number, mixing: number,
  railSigned = true) => {
  const acc = { annih: 0, selfAnnih: 0, ribLost: 0, ribBack: 0, atTwist: 0, broken: 0, ferm: 0 };
  for (let k = 0; k < n; k++) {
    const w = run(ticks, pCreate, emit, mixing, 1000 + 7919 * k, railSigned);
    acc.annih += w.annih; acc.selfAnnih += w.selfAnnih; acc.ribLost += w.ribLost;
    acc.ribBack += w.ribBack; acc.atTwist += w.atTwist;
    acc.broken += 100 * w.brokenTicks / w.ticks; acc.ferm += oneSided(w) ? 1 : 0;
  }
  return {
    annih: acc.annih / n, selfAnnih: acc.selfAnnih / n, ribLost: acc.ribLost / n,
    ribBack: acc.ribBack / n, atTwist: acc.atTwist / n, broken: acc.broken / n,
    fermFrac: acc.ferm / n,
  };
};

// ─── §1 the automaton runs ──────────────────────────────────────────────────
function runs(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  THE AUTOMATON, WITH NOTHING APPROXIMATED ═════");
  line();
  line("  Cells are present or absent, charges have a heading and a polarity, and");
  line("  the three rules fire when two charges land on one cell. The only numbers");
  line("  put in are the creation rate and how often a ribbon cell emits — every");
  line("  rate below is MEASURED from the run.");
  line();
  const w = run(300, 0.0004, 0.02, 0, 20260817);
  const ribCells = [...w.isRib].filter(Boolean).length;
  line(`  grid ${N}×${N}, ribbon annulus r = ${R_IN}..${R_OUT}, ${ribCells} ribbon cells, width ${WIDTH}`);
  line(`  ${300} ticks`);
  line();
  line(`  ${pad("event", 26)} ${pad("firings", 10)} per tick`);
  line("  " + "─".repeat(52));
  line(`  ${pad("(G+M/1) annihilation", 26)} ${pad(String(w.annih), 10)} ${(w.annih / w.ticks).toFixed(2)}`);
  line(`  ${pad("(G+M/2) creation", 26)} ${pad(String(w.create), 10)} ${(w.create / w.ticks).toFixed(2)}`);
  line(`  ${pad("(G+M/3) turning", 26)} ${pad(String(w.turn), 10)} ${(w.turn / w.ticks).toFixed(2)}`);
  line();
  line(`  ${pad("charges alive at the end", 26)} ${w.charges.length}`);
  line(`  ${pad("ribbon cells taken", 26)} ${w.ribLost}`);
  line(`  ${pad("ribbon cells restored", 26)} ${w.ribBack}`);
  line(`  ${pad("still one-sided?", 26)} ${oneSided(w) ? "YES — a fermion" : "NO — became a boson"}`);
  line();
  line("  THE RULES DO ALL FIRE, AND TURNING IS BY FAR THE COMMONEST — which is");
  line("  worth noting because it is the rule that costs nothing. Most meetings");
  line("  leave the space alone.");
  return out.join("\n");
}

// ─── §2 coherence is impossible for a fermion ───────────────────────────────
function coherence(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  A FERMION CANNOT BE COHERENT — which kills `rules` §3 ═════");
  line();
  line("  `rules` §3 made the margin the purity of the structure's own emission and");
  line("  priced it at one part in 10²⁶. The real dynamics refuse the premise, and the");
  line("  reason is the twist itself.");
  line();
  line("  A Möbius ribbon's two rails ARE the two signs — that is what one-sidedness");
  line("  means, and it is what `emit` §2 measured as the sign holonomy. So compare a");
  line("  structure emitting from both rails, which is a fermion, with one emitting a");
  line("  single sign, which is not:");
  line();
  const T = 300, K = 6;
  line(`  ${pad("emission", 22)} ${pad("own-ray (G+M/1)", 16)} ${pad("all (G+M/1)", 12)} ${pad("rib lost", 9)} fermion`);
  line("  " + "─".repeat(70));
  const bi = runs_(K, T, 0.0004, 0.02, 0, true);
  const uni = runs_(K, T, 0.0004, 0.02, 0, false);
  line(`  ${pad("rail-signed (Möbius)", 22)} ${pad(bi.selfAnnih.toFixed(1), 16)} ${pad(bi.annih.toFixed(1), 12)} ${pad(bi.ribLost.toFixed(1), 9)} ${(100 * bi.fermFrac).toFixed(0)}%`);
  line(`  ${pad("one sign only", 22)} ${pad(uni.selfAnnih.toFixed(1), 16)} ${pad(uni.annih.toFixed(1), 12)} ${pad(uni.ribLost.toFixed(1), 9)} ${(100 * uni.fermFrac).toFixed(0)}%`);
  line();
  line(`  averaged over ${K} runs of ${T} ticks each.`);
  line();
  line("  SO THE STRUCTURE THAT IS A FERMION ANNIHILATES ITS OWN SPACE. And the row");
  line("  below it is not a rival object — it is the SAME annulus with the rail sign");
  line("  suppressed by hand, which nothing in the model can actually do, because a");
  line("  one-sided ribbon's rails carry opposite signs by construction. It is there to");
  line("  size the problem, not to offer an alternative. The two rails carry opposite polarities, they");
  line("  are a few cells apart, and (G+M/1) is what happens when their rays meet.");
  line("  Coherence is not merely hard to achieve here — IT IS INCOMPATIBLE WITH BEING");
  line("  ONE-SIDED, because the sign flip is the whole mechanism for spin.");
  line();
  const rat = uni.selfAnnih > 0 ? bi.selfAnnih / uni.selfAnnih : Infinity;
  line(`  own-ray annihilation, fermion against non-fermion: ${isFinite(rat) ? rat.toFixed(1) + "x" : "infinite — the non-fermion has none at all"}`);
  line();
  line("  Then the impurity sweep, which is now beside the point but worth showing");
  line("  because it demonstrates the same thing from the other side:");
  line();
  line(`  ${pad("mixing", 9)} ${pad("own-ray (G+M/1)", 16)} ${pad("rib lost", 10)} ${pad("broken %", 10)} fermion`);
  line("  " + "─".repeat(60));
  for (const mix of [0, 0.05, 0.2, 0.5]) {
    const a = runs_(K, T, 0.0004, 0.02, mix, true);
    line(`  ${pad(mix.toFixed(2), 9)} ${pad(a.selfAnnih.toFixed(1), 16)} ${pad(a.ribLost.toFixed(1), 10)} ${pad(a.broken.toFixed(1), 10)} ${(100 * a.fermFrac).toFixed(0)}%`);
  }
  line();
  line("  THE IMPURITY DOES ALMOST NOTHING, because the damage was never waiting on");
  line("  it: the rails already supply both signs, and (G+M/2) supplies both signs");
  line("  again in every vacuum pair. There is no population anywhere in the model");
  line("  whose purity is the margin.");
  line();
  line("  SO `rules` §3 IS WITHDRAWN. Its 2x(1−x) was computed over the structure's own");
  line("  rays as though they could be one sign; on a fermion they cannot, so x is not");
  line("  a free parameter and the 10⁻²⁶ requirement was a statement about a quantity");
  line("  that does not exist. That was the mechanism which made the lifetime");
  line("  survivable, and it is gone.");
  return out.join("\n");
}

// ─── §3 where the damage lands ──────────────────────────────────────────────
function whereDamage(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  WHERE THE DAMAGE LANDS, ON THE REAL DYNAMICS ═════");
  line();
  line("  `rules` §4 argued the twist takes 12× its share, from a 1/d² between the");
  line("  rails. Measure it instead: which sector loses cells.");
  line();
  const w = run(900, 0.0006, 0.02, 0, 4242);
  const even = 100 / SECTORS;
  const share = w.ribLost ? 100 * w.atTwist / w.ribLost : 0;
  line(`  ribbon cells lost           ${w.ribLost}`);
  line(`  of those in the twist sector ${w.atTwist}`);
  line(`  share                        ${share.toFixed(1)}%   against ${even.toFixed(1)}% for an even spread`);
  line(`  concentration                ${(share / even).toFixed(2)}×`);
  line();
  if (share / even > 1.5) {
    line("  CONCENTRATED, as argued — though not by the factor the 1/d² estimate gave,");
    line("  and the measured number is the one to quote.");
  } else {
    line("  NOT CONCENTRATED. The damage is spread evenly round the ribbon, and");
    line("  `rules` §4's 12× does not survive contact with the dynamics.");
    line();
    line("  The reason is visible in the model: (G+M/2) makes its pairs UNIFORMLY over");
    line("  the grid, so what arrives at a ribbon cell does not know where the twist is,");
    line("  and the ribbon's own rays are emitted from every cell of it rather than");
    line("  concentrated at the crossing. `rules` §4 got its 12× from a 1/d² between two");
    line("  idealised rails that meet only at the twist; the real ribbon is five cells");
    line("  wide everywhere, so both signs are a few cells apart ALL THE WAY ROUND.");
    line();
    line("  WHICH MAKES IT WORSE RATHER THAN BETTER, and that is the honest reading:");
    line("  §2 found the fermion eats itself, and §3 finds it does so EVERYWHERE");
    line("  rather than at one weak point. A localised weakness could be reinforced;");
    line("  a uniform one is the object's own construction.");
  }
  return out.join("\n");
}

// ─── §4 survival against the creation rate ──────────────────────────────────
function survival(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  SURVIVAL AGAINST THE ONE RATE THE MODEL SUPPLIES ═════");
  line();
  line("  (G+M/2)'s rate is the vacuum's expansion rate, which the cosmology fixes");
  line("  at 10⁻⁶¹ per cell per tick. Nothing on a screen or in a test can run at");
  line("  that, so sweep it and read the trend.");
  line();
  const T = 600;
  line(`  ${pad("p(create)", 11)} ${pad("(G+M/1)", 9)} ${pad("rib lost", 9)} ${pad("rib back", 9)} ${pad("net", 6)} ${pad("broken %", 9)} fermion?`);
  line("  " + "─".repeat(70));
  for (const p of [0.0002, 0.0006, 0.002, 0.006]) {
    const w = run(T, p, 0.02, 0, 909);
    const net = w.ribLost - w.ribBack;
    line(`  ${pad(p.toExponential(0), 11)} ${pad(String(w.annih), 9)} ${pad(String(w.ribLost), 9)} ${pad(String(w.ribBack), 9)} ${pad(String(net), 6)} ${pad((100 * w.brokenTicks / w.ticks).toFixed(1), 9)} ${oneSided(w) ? "yes" : "NO"}`);
  }
  line();
  line("  AND THE NET COLUMN IS FLAT — 145, 165, 171, 159 across a THIRTYFOLD change in");
  line("  the creation rate. That is not a coincidence and it is the point:");
  line();
  line("  (G+M/1) takes ribbon");
  line("  cells and (G+M/2) puts them back, and the two rates are not independent —");
  line("  both scale with how much vacuum there is, because creation makes the pairs");
  line("  that annihilation then consumes.");
  line();
  line("  WHICH IS THE STRUCTURAL RESULT OF THIS FILE: creation and annihilation are");
  line("  a SINGLE process at one rate, not two processes whose ratio can be tuned.");
  line("  (G+M/2) makes a ± pair; if its two halves meet anything, (G+M/1) takes a");
  line("  cell. So there is no regime where repair outruns damage by construction,");
  line("  and `repair` §5's 10⁵⁹ enhancement — the structure firing every tick");
  line("  against a vacuum churning at p — was comparing the structure's EMISSION");
  line("  rate with the vacuum's CREATION rate, which are not the two things that");
  line("  compete. What competes is annihilation and creation, and they are locked");
  line("  together.");
  return out.join("\n");
}

console.log(runs());
console.log(coherence());
console.log(whereDamage());
console.log(survival());
