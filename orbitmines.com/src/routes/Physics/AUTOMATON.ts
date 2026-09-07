/**
 * THE ACTUAL AUTOMATON — the ribbon, the vacuum and the three rules, with nothing
 * approximated.
 *
 * The coherence and repair arguments model the traffic with RATES: a damage probability
 * per cell, a mixing fraction, a vacuum flux. Those are statistics of a process, not the
 * process, and the objection that they are not the model is fair. This is the model:
 *
 *   STATE     a grid of cells. Each cell is PRESENT (a spatial point) or ABSENT. Charges
 *             sit on cells, each with a heading among the geometry's exits and a polarity
 *             ±1. No reals, no probabilities, no occupancy vectors.
 *   STREAM    every charge moves one cell along its heading. Nothing else moves it, so a
 *             charge in empty space goes straight for ever.
 *   (G+M/1)   two OPPOSITE polarities on one cell annihilate, leaving a single neutral
 *             point behind — two points become one and THE CELL IS GONE. The only event
 *             that removes space.
 *   (G+M/2)   a neutral point expands into two points of opposite polarity. One point
 *             becomes two: the only event that ADDS space, and what can put an
 *             annihilated cell back.
 *   (G+M/3)   two IDENTICAL polarities on one cell turn around. Nothing created or
 *             destroyed.
 *
 * The ribbon is an annulus of cells with the inner and outer edges swapped across one
 * radius — a Möbius strip on the lattice — and it is a fermion exactly while its
 * surviving cells are still one-sided, tested by 2-colouring.
 *
 * WHY THIS IS A MODULE AND WHAT THE PORT CHANGED. The provenance file hardcoded the
 * eight headings of the plane as `3² − 1` and stepped by literal (dx, dy) pairs, which
 * is square 8 written as though it were arithmetic. Here the exits come off a
 * `Geometry` — `g.L` for the whole-cell offsets and `g.OPP` for what reversing a heading
 * means — so THE LATTICE IS A PARAMETER OF THIS AUTOMATON AND NOT A FACT ABOUT IT, and
 * the same construction can be asked of a different one. Which is the point: a
 * conclusion that only holds on square 8 is a conclusion about square 8.
 *
 * A RIBBON IS A PLANAR OBJECT, so the geometries worth running it on are the 2D ones.
 * That is not a limitation smuggled in — an annulus with its edges swapped across one
 * radius is a surface, and embedding it in three dimensions adds a choice of embedding
 * without adding anything to the question being asked.
 */

import { Geometry, GEOMETRIES, Vec } from "./DISCRETE";

export type AutomatonOptions = {
  geometry?: Geometry;
  /** the grid is N across in every dimension */
  N?: number;
  /** the ribbon annulus, in cells from the centre */
  rIn?: number;
  rOut?: number;
  /** how many angular sectors the ribbon is divided into for locating the twist */
  sectors?: number;
  /** (G+M/2)'s chance of firing on a cell each tick */
  pCreate?: number;
  /** the chance a ribbon cell emits each tick */
  emit?: number;
  /** the share of a rail's emission carrying the WRONG sign — the impurity being tested */
  mixing?: number;
  /**
   * Whether the two rails carry opposite signs.
   *
   * TRUE IS THE HONEST CASE and false is the control. A Möbius ribbon's two rails ARE
   * the two polarities — that is what the sign holonomy means — so a real fermion cannot
   * emit one sign only. Running it with `false` measures what a one-sign emitter would
   * cost, and the point of the comparison is that such an object is not one-sided and so
   * is not a fermion at all.
   */
  railSigned?: boolean;
  seed?: number;
  ticks?: number;
};

type Charge = { at: Vec; d: number; pol: number; own: boolean };

export type AutomatonResult = {
  geometry: string;
  ticks: number;
  /** (G+M/1) firings between two of the STRUCTURE's own rays */
  selfAnnihilations: number;
  /** (G+M/1) firings of any kind */
  annihilations: number;
  /** (G+M/2) firings */
  creations: number;
  /** (G+M/3) firings */
  turns: number;
  /** ribbon cells taken by (G+M/1) */
  ribbonLost: number;
  /** ribbon cells put back by (G+M/2) */
  ribbonBack: number;
  /** of the cells lost, how many were in the twist sector */
  atTwist: number;
  /** the fraction of TICKS the surviving ribbon was still one-sided — still a fermion */
  fermionFraction: number;
  /**
   * Whether it was still one-sided AT THE END, which is the quantity the article quotes.
   *
   * NOT THE SAME AS `fermionFraction`, and the difference is worth keeping both for: a
   * ribbon can lose one-sidedness for a while and get it back when (G+M/2) puts the cell
   * in, so "how much of its life was it a fermion" and "was it one at the end" are two
   * different questions. Averaged over seeds this becomes the share of runs that survived.
   */
  endedOneSided: number;
  /** how many sectors there are, so `atTwist` can be read against an even spread */
  sectors: number;
};

/** a deterministic stream, so a run is reproducible from its seed alone */
const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const automaton = (o: AutomatonOptions = {}): AutomatonResult => {
  const g = o.geometry ?? GEOMETRIES["square-8"];
  if (g.D !== 2)
    throw new Error(`the ribbon is a planar object and ${g.name} is ${g.D}-dimensional`);
  if (g.unrunnable)
    throw new Error(`${g.name} cannot be a world: ${g.unrunnable}`);

  const N = o.N ?? 41;
  const rIn = o.rIn ?? 8, rOut = o.rOut ?? 12;
  const SECTORS = o.sectors ?? 24;
  const pCreate = o.pCreate ?? 4e-4;
  const emit = o.emit ?? 0.02;
  const mixing = o.mixing ?? 0;
  const railSigned = o.railSigned ?? true;
  const TICKS = o.ticks ?? 300;
  const r = rng(o.seed ?? 20260817);

  const C = (N - 1) / 2;
  const WIDTH = rOut - rIn + 1;
  const idx = (x: number, y: number) => y * N + x;
  const inGrid = (x: number, y: number) => x >= 0 && y >= 0 && x < N && y < N;

  /** which ribbon cell, if any, and where on it */
  const ribbonOf = (x: number, y: number) => {
    const dx = x - C, dy = y - C;
    const rad = Math.sqrt(dx * dx + dy * dy);
    if (rad < rIn - 0.5 || rad > rOut + 0.5) return null;
    const ang = Math.atan2(dy, dx);
    return {
      ring: Math.round(rad) - rIn,                       // 0 .. width−1, the rail
      sector: Math.floor(((ang + Math.PI) / (2 * Math.PI)) * SECTORS) % SECTORS,
    };
  };

  const present = new Uint8Array(N * N).fill(1);
  const isRib = new Uint8Array(N * N);
  const ring = new Int8Array(N * N).fill(-1);
  const sector = new Int8Array(N * N).fill(-1);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const rb = ribbonOf(x, y);
    if (!rb) continue;
    isRib[idx(x, y)] = 1;
    ring[idx(x, y)] = rb.ring;
    sector[idx(x, y)] = rb.sector;
  }

  /*
   * THE EXITS, OFF THE GEOMETRY. `g.L` is the whole-cell index offset per exit, which is
   * what a backend steps by, and `g.OPP` is which exit is the reverse of which — so
   * "turn around" in (G+M/3) is a lookup rather than the `(d + 4) % 8` the old file wrote,
   * which is only right for a lattice whose exits happen to be listed in antipodal order.
   */
  const STEP = g.L;
  const DEG = g.DEG;

  /**
   * Is the surviving ribbon still one-sided?
   *
   * 2-colour the surviving ribbon cells by adjacency. Every adjacency preserves the rail
   * EXCEPT across sector 0, the twist, where the rails are glued in reverse — so that
   * edge demands the opposite colour. If the colouring completes, the object is
   * two-sided: a boson. If it cannot, it is one-sided and still a fermion.
   */
  const stillOneSided = () => {
    const col = new Int8Array(N * N);
    const cells: number[] = [];
    for (let i = 0; i < N * N; i++) if (isRib[i] && present[i]) cells.push(i);
    if (!cells.length) return false;
    for (const start of cells) {
      if (col[start] !== 0) continue;
      col[start] = 1;
      const st = [start];
      while (st.length) {
        const c = st.pop()!;
        const cx = c % N, cy = (c - (c % N)) / N;
        for (const step of STEP) {
          const nx = cx + step[0], ny = cy + step[1];
          if (!inGrid(nx, ny)) continue;
          const n = idx(nx, ny);
          if (!isRib[n] || !present[n]) continue;
          const flip = (sector[c] === 0 && sector[n] === SECTORS - 1) ||
            (sector[n] === 0 && sector[c] === SECTORS - 1);
          const want = (flip ? -col[c] : col[c]) as -1 | 1;
          if (col[n] === 0) { col[n] = want; st.push(n); }
          else if (col[n] !== want) return true;         // no consistent colouring
        }
      }
    }
    return false;
  };

  let charges: Charge[] = [];
  let annihilations = 0, creations = 0, turns = 0, selfAnnihilations = 0;
  let ribbonLost = 0, ribbonBack = 0, atTwist = 0, fermionTicks = 0;

  for (let t = 0; t < TICKS; t++) {
    /* ── the structure emits, and its polarity is the rail's */
    for (let i = 0; i < N * N; i++) {
      if (!isRib[i] || !present[i]) continue;
      if (r() > emit) continue;
      const x = i % N, y = (i - (i % N)) / N;
      const railSign = railSigned ? (ring[i] < WIDTH / 2 ? +1 : -1) : +1;
      const pol = r() < mixing ? -railSign : railSign;
      charges.push({ at: [x, y], d: Math.floor(r() * DEG), pol, own: true });
    }

    /* ── (G+M/2): a neutral point expands into two of opposite polarity */
    for (let i = 0; i < N * N; i++) {
      if (r() > pCreate) continue;
      const x = i % N, y = (i - (i % N)) / N;
      if (!present[i]) {
        present[i] = 1;                                  // space where there was none
        if (isRib[i]) ribbonBack++;
      }
      const d = Math.floor(r() * DEG);
      charges.push({ at: [x, y], d, pol: +1, own: false });
      charges.push({ at: [x, y], d: g.OPP[d], pol: -1, own: false });
      creations++;
    }

    /* ── STREAM: every charge moves one cell along its heading */
    const kept: Charge[] = [];
    for (const c of charges) {
      const nx = c.at[0] + STEP[c.d][0], ny = c.at[1] + STEP[c.d][1];
      if (!inGrid(nx, ny)) continue;                     // off the edge of the world
      c.at = [nx, ny];
      kept.push(c);
    }
    charges = kept;

    /* ── COLLIDE: group by cell, then apply (G+M/1) or (G+M/3) by the two signs */
    const byCell = new Map<number, Charge[]>();
    for (const c of charges) {
      const k = idx(c.at[0], c.at[1]);
      const l = byCell.get(k);
      if (l) l.push(c); else byCell.set(k, [c]);
    }
    const dead = new Set<Charge>();
    for (const [cell, list] of byCell) {
      if (list.length < 2) continue;
      for (let a = 0; a < list.length - 1; a += 2) {
        const p = list[a], q = list[a + 1];
        if (dead.has(p) || dead.has(q)) continue;
        if (p.pol === q.pol) {
          p.d = g.OPP[p.d]; q.d = g.OPP[q.d];            // (G+M/3): they turn around
          turns++;
        } else {
          dead.add(p); dead.add(q);                      // (G+M/1): they annihilate
          annihilations++;
          if (p.own && q.own) selfAnnihilations++;
          if (present[cell]) {
            present[cell] = 0;
            if (isRib[cell]) {
              ribbonLost++;
              if (sector[cell] === 0) atTwist++;
            }
          }
        }
      }
    }
    charges = charges.filter(c => !dead.has(c));

    if (stillOneSided()) fermionTicks++;
  }

  return {
    geometry: g.name, ticks: TICKS,
    selfAnnihilations, annihilations, creations, turns,
    ribbonLost, ribbonBack, atTwist,
    fermionFraction: fermionTicks / TICKS,
    endedOneSided: stillOneSided() ? 1 : 0,
    sectors: SECTORS,
  };
};

/** the mean of a field over several seeds, which is the only way any of this is quotable */
export const overSeeds = (
  seeds: number[], o: Omit<AutomatonOptions, "seed">,
): AutomatonResult & { seeds: number } => {
  const runs = seeds.map(seed => automaton({ ...o, seed }));
  const mean = (f: (x: AutomatonResult) => number) =>
    runs.reduce((a, x) => a + f(x), 0) / runs.length;
  return {
    geometry: runs[0].geometry, ticks: runs[0].ticks, sectors: runs[0].sectors,
    selfAnnihilations: mean(x => x.selfAnnihilations),
    annihilations: mean(x => x.annihilations),
    creations: mean(x => x.creations),
    turns: mean(x => x.turns),
    ribbonLost: mean(x => x.ribbonLost),
    ribbonBack: mean(x => x.ribbonBack),
    atTwist: mean(x => x.atTwist),
    fermionFraction: mean(x => x.fermionFraction),
    endedOneSided: mean(x => x.endedOneSided),
    seeds: seeds.length,
  };
};
