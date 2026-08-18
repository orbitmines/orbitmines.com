/**
 * STRUCTURES ON THE LATTICE — what matter is here, as distinct from what travels.
 *
 * Everything so far has been rays: things that move one exit a tick and meet. A
 * structure is not one of those. It is a REGION — a set of points the lattice holds
 * in a particular shape — and what makes one kind of matter different from another
 * is that shape's topology rather than anything written on it.
 *
 * WHY TOPOLOGY AND NOT A LABEL. The article's argument is short and each link forces
 * the next: a particle needs a two-valued quantity that a 2π rotation flips, the XOR
 * sign is already spoken for by the interaction, so a second one has to come from
 * somewhere the rules do not already use — and a HANDLE supplies exactly one bit.
 * Not a missing cell, which leaves a solid simply connected: a region the lattice
 * goes ROUND rather than through.
 *
 * SO THE INVARIANTS ARE COMPUTED AND NOT DECLARED. b₁ over GF(2) on an honest
 * cubical complex — vertices, edges AND faces of the actual cells, not the graph
 * alone, because a graph's cycle count sees every connection and a handle is about
 * holes. That distinction is the whole measurement: a solid block of any size has
 * b₁ = 0, and density buys nothing.
 *
 * WHAT THIS FILE DOES NOT DECIDE is how a structure persists, moves, or interacts —
 * those are questions about the rules rather than about shape, and they are open.
 * What is here is the geometry a structure has, so that the arcs which depend on it
 * have something to be about.
 */

import { Geometry, Vec, World } from "./DISCRETE";

/** a structure is the set of points the lattice holds in a shape */
export type Structure = {
  name: string;
  /** the points, in lattice coordinates */
  cells: Vec[];
};

const key = (v: number[]) => v.map(x => Math.round(x)).join(",");

/**
 * THE CUBICAL COMPLEX OF A SET OF CELLS.
 *
 * A cell is a unit cube; its faces, edges and vertices are shared with its
 * neighbours. Building all four and counting them is what lets Euler's formula give
 * a topological answer rather than a graph-theoretic one.
 *
 * The distinction matters more than it sounds. Count cycles in the ADJACENCY GRAPH
 * of a solid block and you get an enormous number — every little square of four
 * neighbouring cells is a cycle — and none of them is a hole. Fill in the faces and
 * those cycles are all boundaries of something, so they contribute nothing, and what
 * is left is the holes.
 */
export const complex = (cells: Vec[], D = 3) => {
  const cs = new Set(cells.map(key));
  const V = new Set<string>(), E = new Set<string>(), F = new Set<string>();

  /** every corner of the unit cube at `c`, as offsets in {0,1}^D */
  const corners = (c: Vec) => {
    const out: number[][] = [];
    const walk = (p: number[]) => {
      if (p.length === D) { out.push(c.map((x, i) => x + p[i])); return; }
      for (const b of [0, 1]) walk([...p, b]);
    };
    walk([]);
    return out;
  };

  for (const c of cells) {
    for (const v of corners(c)) V.add(key(v));
    // edges: a corner and the corner one step along an axis, both on this cube
    for (const v of corners(c))
      for (let i = 0; i < D; i++) {
        const w = v.slice(); w[i]++;
        if (corners(c).some(u => key(u) === key(w))) E.add(`${key(v)}|${i}`);
      }
    // faces: a corner and the two axes spanning a square of this cube
    for (const v of corners(c))
      for (let i = 0; i < D; i++) for (let j = i + 1; j < D; j++) {
        const a = v.slice(); a[i]++;
        const b = v.slice(); b[j]++;
        const d = v.slice(); d[i]++; d[j]++;
        const on = corners(c).map(key);
        if ([a, b, d].every(x => on.includes(key(x)))) F.add(`${key(v)}|${i}${j}`);
      }
  }
  return { cells: cs, V, E, F };
};

/**
 * THE BETTI NUMBERS, over GF(2) and by Euler's formula rather than by reduction.
 *
 *   χ = |V| − |E| + |F| − |C|      and      χ = b₀ − b₁ + b₂ − b₃
 *
 * b₀ is the number of connected pieces, which is a flood fill. b₂ counts enclosed
 * voids, which is a flood fill of the complement. b₃ is nought for anything that
 * fits in a box. So b₁ — the handles, the thing the whole argument is about — falls
 * out of the other three and a count of cells, without a boundary matrix anywhere.
 */
export const betti = (s: Structure, D = 3) => {
  const { cells, V, E, F } = complex(s.cells, D);

  /** connected pieces of a set of cells, by face adjacency */
  const pieces = (set: Set<string>) => {
    const seen = new Set<string>();
    let n = 0;
    for (const start of set) {
      if (seen.has(start)) continue;
      n++;
      const stack = [start];
      seen.add(start);
      while (stack.length) {
        const at = stack.pop()!.split(",").map(Number);
        for (let i = 0; i < D; i++) for (const d of [-1, 1]) {
          const q = at.slice(); q[i] += d;
          const k = key(q);
          if (set.has(k) && !seen.has(k)) { seen.add(k); stack.push(k); }
        }
      }
    }
    return n;
  };

  const b0 = pieces(cells);

  /*
   * b₂ — enclosed voids — as the pieces of the COMPLEMENT that do not touch the
   * outside. A box one cell bigger all round is filled from a corner; whatever the
   * fill does not reach and is not the structure itself is sealed in.
   */
  const pts = s.cells.map(c => c.map(Math.round));
  const lo = Array.from({ length: D }, (_, i) => Math.min(...pts.map(p => p[i])) - 1);
  const hi = Array.from({ length: D }, (_, i) => Math.max(...pts.map(p => p[i])) + 1);
  const inBox = (p: number[]) => p.every((x, i) => x >= lo[i] && x <= hi[i]);
  const outside = new Set<string>();
  const stack = [lo.slice()];
  outside.add(key(lo));
  while (stack.length) {
    const at = stack.pop()!;
    for (let i = 0; i < D; i++) for (const d of [-1, 1]) {
      const q = at.slice(); q[i] += d;
      const k = key(q);
      if (!inBox(q) || cells.has(k) || outside.has(k)) continue;
      outside.add(k); stack.push(q);
    }
  }
  const empty = new Set<string>();
  const walkBox = (p: number[]) => {
    if (p.length === D) {
      const k = key(p);
      if (!cells.has(k) && !outside.has(k)) empty.add(k);
      return;
    }
    for (let x = lo[p.length]; x <= hi[p.length]; x++) walkBox([...p, x]);
  };
  walkBox([]);
  const b2 = pieces(empty);

  const chi = V.size - E.size + F.size - cells.size;
  const b1 = b0 - chi + b2;                 // b₃ = 0 for anything that fits in a box
  return { b0, b1, b2, chi, V: V.size, E: E.size, F: F.size, cells: cells.size };
};

// ─── the shapes the argument is about ───────────────────────────────────────

/** a solid block — contractible however large, which is the control */
export const block = (n: number, D = 3): Structure => {
  const cells: Vec[] = [];
  const walk = (p: number[]) => {
    if (p.length === D) { cells.push(p.slice()); return; }
    for (let i = 0; i < n; i++) walk([...p, i]);
  };
  walk([]);
  return { name: `solid block ${n}^${D}`, cells };
};

/**
 * A RING: a region the lattice goes round rather than through. One handle, and
 * therefore one bit — which is the whole of what homology has to offer.
 */
export const ring = (R: number, thick = 1): Structure => {
  const cells: Vec[] = [];
  const lim = R + thick + 1;
  for (let x = -lim; x <= lim; x++) for (let y = -lim; y <= lim; y++)
    for (let z = -thick; z <= thick; z++) {
      const r = Math.hypot(x, y);
      if (Math.abs(r - R) <= thick) cells.push([x, y, z]);
    }
  return { name: `ring R=${R}`, cells };
};

/** two rings side by side: two handles, so two bits */
export const twoRings = (R: number, thick = 1): Structure => {
  const a = ring(R, thick), b = ring(R, thick);
  const gap = 2 * (R + thick) + 3;
  return {
    name: `two rings R=${R}`,
    cells: [...a.cells, ...b.cells.map(c => [c[0] + gap, c[1], c[2]])],
  };
};

/**
 * A HOLLOW SHELL: a sealed void, which is b₂ rather than b₁ — and is the control
 * that says the two are being told apart. Removing a ball from a solid leaves it
 * simply connected, so a cavity is not a handle and must not count as one.
 */
export const shell = (R: number): Structure => {
  const cells: Vec[] = [];
  for (let x = -R - 1; x <= R + 1; x++) for (let y = -R - 1; y <= R + 1; y++)
    for (let z = -R - 1; z <= R + 1; z++) {
      const r = Math.hypot(x, y, z);
      if (r <= R + 1 && r >= R - 0.5) cells.push([x, y, z]);
    }
  return { name: `hollow shell R=${R}`, cells };
};

/**
 * WHERE A STRUCTURE SITS ON A WORLD — the join between a shape and the dynamics.
 *
 * A structure is a region; a world is points with rays on them. This marks the
 * region's points as belonging to it, so that a rule can ask whether a local is part
 * of a structure without the core needing to know what a structure is for.
 */
export const place = (w: World, s: Structure, at: Vec = []) => {
  const D = w.geometry.D;
  const centre = at.length ? at : new Array(D).fill((w.opts.N - 1) / 2);
  const marked = new Set<number>();
  const want = new Set(s.cells.map(c => key(c.map((x, i) => x + (centre[i] ?? 0)))));
  w.backend.forEachLocal(k => {
    if (want.has(key(w.backend.position(k)))) marked.add(k);
  });
  return marked;
};
