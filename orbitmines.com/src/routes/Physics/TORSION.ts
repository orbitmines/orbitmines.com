/**
 * INTEGER HOMOLOGY — the invariant that tells a handle from a fermion, which GF(2) cannot.
 *
 * `STRUCTURE.ts` computes b₁ over GF(2), and every number it reports is right. It is
 * also too coarse for the question Layer 2 asks of it: a handle gives H₁ = Z, free, with
 * no element of finite order at all, and a fermionic container gives H₁ = Z/2, pure
 * torsion, whose generator has order EXACTLY two. Over GF(2) both have dim H₁ = 1 and
 * are indistinguishable — so the matter section's own computation could not have told
 * them apart, and that is a limitation of what it measured rather than a mistake in it.
 *
 * What separates them is TORSION, and torsion needs the integers. So this carries Smith
 * normal form and the two complexes the argument runs on:
 *
 *   `surfaceWord`   a polygon with its boundary glued by a word — the torus, the Klein
 *                   bottle, RP². The one-line answer to which containers give torsion.
 *   `quotientedSphere`  a cubical sphere quotiented by an involution, which is the same
 *                   question asked of something the lattice could actually build.
 *
 * NOTHING HERE TOUCHES THE LATTICE either, in the sense the migration means: these are
 * counts on a CW complex, so they read the same on fcc 12 as on cubic 26. What the
 * lattice supplies is only the fact that a container is made of cells at all, which is
 * why `quotientedSphere` is cubical rather than a triangulation off a shelf.
 */

export type V3 = [number, number, number];

/**
 * Smith normal form over Z — the elementary divisors, which are what carry the torsion.
 *
 * Reduces by repeatedly clearing the row and column of the smallest non-zero entry,
 * swapping it back in whenever a division leaves a remainder. That is the textbook
 * algorithm and it terminates because the pivot's absolute value strictly falls every
 * time it fails to divide cleanly.
 */
export const smith = (M: number[][]): number[] => {
  const A = M.map(r => r.slice());
  const m = A.length, n = m ? A[0].length : 0;
  const d: number[] = [];
  let r = 0, c = 0;
  while (r < m && c < n) {
    let pi = -1, pj = -1, best = Infinity;
    for (let i = r; i < m; i++) for (let j = c; j < n; j++)
      if (A[i][j] !== 0 && Math.abs(A[i][j]) < best) { best = Math.abs(A[i][j]); pi = i; pj = j; }
    if (pi < 0) break;
    [A[r], A[pi]] = [A[pi], A[r]];
    for (let i = 0; i < m; i++) { const t = A[i][c]; A[i][c] = A[i][pj]; A[i][pj] = t; }
    let done = false;
    while (!done) {
      done = true;
      for (let i = r + 1; i < m; i++) if (A[i][c] !== 0) {
        const q = Math.round(A[i][c] / A[r][c]);
        for (let j = c; j < n; j++) A[i][j] -= q * A[r][j];
        if (A[i][c] !== 0) { [A[r], A[i]] = [A[i], A[r]]; done = false; }
      }
      for (let j = c + 1; j < n; j++) if (A[r][j] !== 0) {
        const q = Math.round(A[r][j] / A[r][c]);
        for (let i = r; i < m; i++) A[i][j] -= q * A[i][c];
        if (A[r][j] !== 0) {
          for (let i = 0; i < m; i++) { const t = A[i][c]; A[i][c] = A[i][j]; A[i][j] = t; }
          done = false;
        }
      }
    }
    d.push(Math.abs(A[r][c]));
    r++; c++;
  }
  return d;
};

export type Homology = { free: number; torsion: number[] };

/**
 * H₁ as a free rank plus a list of torsion coefficients, from the two boundary maps.
 *
 * `d1` is one row per edge giving its endpoints with signs; `d2` is one row per face
 * giving the edges of its boundary with signs. Both are given as ROWS here and read as
 * columns by `smith`, which does not care which way round they come as long as the rank
 * is what is wanted.
 */
export const homologyOverZ = (
  d1: number[][], d2: number[][], nEdges: number,
): Homology => {
  const r1 = smith(d1).filter(x => x !== 0).length;
  const s2 = smith(d2);
  return {
    free: (nEdges - r1) - s2.filter(x => x !== 0).length,
    torsion: s2.filter(x => x > 1),
  };
};

/**
 * A closed surface as a polygon with its boundary glued by a word.
 *
 * `a b a⁻¹ b⁻¹` is the torus, `a b a b⁻¹` the Klein bottle, `a a` the projective plane.
 * All the vertices are identified to one, so the complex is one vertex, one edge per
 * distinct letter, and one face whose boundary is the word — which makes d₂ a single
 * row counting each letter with its sign, and the whole answer visible in that row.
 *
 * A LETTER APPEARING TWICE WITH THE SAME SIGN IS WHAT PUTS A 2 IN THE MATRIX, and that
 * two is the two in Z/2. Which is why torsion appears exactly where the gluing reverses
 * orientation and nowhere else.
 */
export const surfaceWord = (word: string): Homology & { letters: string[] } => {
  /* "abAB" — an upper-case letter is that letter inverted */
  const letters = [...new Set([...word].map(ch => ch.toLowerCase()))].sort();
  const row = letters.map(l =>
    [...word].reduce((a, ch) =>
      a + (ch === l ? 1 : ch === l.toUpperCase() ? -1 : 0), 0));
  /* every vertex identified to one, so every edge is a loop and d₁ is zero */
  const d1 = letters.map(() => [0]);
  return { ...homologyOverZ(d1, [row], letters.length), letters };
};

/** the surface of a cube of cells, as 6·(2n)² outward-oriented quadrilateral faces */
export const cubeFaces = (n: number): V3[][] => {
  const F: V3[][] = [];
  for (let a = 0; a < 3; a++) for (const s of [1, -1]) {
    const o = [(a + 1) % 3, (a + 2) % 3];
    for (let u = -n; u < n; u++) for (let v = -n; v < n; v++) {
      const c = (du: number, dv: number): V3 => {
        const p: V3 = [0, 0, 0];
        p[a] = s * n; p[o[0]] = u + du; p[o[1]] = v + dv;
        return p;
      };
      F.push(s > 0 ? [c(0, 0), c(1, 0), c(1, 1), c(0, 1)]
        : [c(0, 0), c(0, 1), c(1, 1), c(1, 0)]);
    }
  }
  return F;
};

export const antipodal = (v: V3): V3 => [-v[0], -v[1], -v[2]];
export const centreOf = (f: V3[]): V3 =>
  [0, 1, 2].map(k => f.reduce((a, v) => a + v[k], 0) / f.length) as V3;

/**
 * A cubical sphere quotiented by an involution, and its integer H₁.
 *
 * JUSTIFIED BY VAN KAMPEN: filling the sphere in with a ball adds no 1-cycles and kills
 * none, since the ball is simply connected — so the quotient of the BOUNDARY gives the
 * H₁ of the solid container, which is the object Layer 2 is actually asking about.
 *
 * Faces are deduplicated by a canonical key over the CYCLIC sequence of vertex classes,
 * least over the four rotations and both directions. Sorting the vertex set is not
 * enough: after an antipodal quotient every face uses all four classes, so a set-based
 * key identifies faces that are not the same face.
 */
export const quotientedSphere = (faces: V3[][], phi: (v: V3) => V3) => {
  const key = (v: V3) => v.join(",");
  const vid = new Map<string, number>();
  const vlist: string[] = [];
  /* the class of v is its ORBIT {v, phi(v)}, keyed by the smaller representative */
  const V = (v: V3) => {
    const a = key(v), b = key(phi(v));
    const k = a < b ? a : b;
    if (!vid.has(k)) { vid.set(k, vlist.length); vlist.push(k); }
    return vid.get(k)!;
  };
  const eid = new Map<string, number>();
  const elist: [number, number][] = [];
  const E = (a: number, b: number): [number, number] => {
    if (a === b) return [-1, 0];
    const k = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (!eid.has(k)) { eid.set(k, elist.length); elist.push([Math.min(a, b), Math.max(a, b)]); }
    return [eid.get(k)!, a < b ? 1 : -1];
  };

  const faceCols: number[][] = [];
  const seenF = new Set<string>();
  const cyc = (a: number[]) => {
    let best = "";
    for (const arr of [a, [...a].reverse()])
      for (let r = 0; r < arr.length; r++) {
        const s = arr.slice(r).concat(arr.slice(0, r)).join("-");
        if (best === "" || s < best) best = s;
      }
    return best;
  };
  for (const f of faces) {
    const vs = f.map(V);
    const fk = cyc(vs);
    if (seenF.has(fk)) continue;
    seenF.add(fk);
    const parts: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      const [id, sg] = E(vs[i], vs[(i + 1) % 4]);
      if (id >= 0) parts.push([id, sg]);
    }
    faceCols.push(parts.reduce((acc, [id, sg]) => {
      acc[id] = (acc[id] || 0) + sg;
      return acc;
    }, [] as number[]));
  }

  const nV = vlist.length, nE = elist.length, nF = faceCols.length;
  const d1 = elist.map(([a, b]) => {
    const col = new Array(nV).fill(0);
    col[a] -= 1; col[b] += 1;
    return col;
  });
  const d2 = faceCols.map(c => {
    const col = new Array(nE).fill(0);
    for (let i = 0; i < c.length; i++) if (c[i]) col[i] = c[i];
    return col;
  });
  return { nV, nE, nF, chi: nV - nE + nF, ...homologyOverZ(d1, d2, nE) };
};

/** the antipodal pairs of a face set, which is what a churn has to remove whole */
export const antipodalPairs = (faces: V3[][]): [number, number][] => {
  const ck = (c: V3) => c.map(v => v.toFixed(3)).join(",");
  const byC = new Map(faces.map((f, i) => [ck(centreOf(f)), i]));
  const pairs: [number, number][] = [];
  const used = new Set<number>();
  faces.forEach((f, i) => {
    if (used.has(i)) return;
    const j = byC.get(ck(centreOf(f).map(v => -v) as V3));
    if (j !== undefined && j !== i) { pairs.push([i, j]); used.add(i); used.add(j); }
  });
  return pairs;
};
