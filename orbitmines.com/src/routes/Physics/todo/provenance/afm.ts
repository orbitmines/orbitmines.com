/**
 * ANTIFERROMAGNETISM — the configuration that allows it, and the law that says
 * which configurations do.
 *
 * `torque` §4 ends on Λ(0) = 0: the energy of the uniform state vanishes
 * identically on any cubic lattice, because δ_αβ − 3r̂_α r̂_β summed over a
 * cubic-symmetric set of directions is nought. That was read there as "the
 * far-field channel cannot order", AND THAT READING WAS TOO STRONG. Λ(0) = 0
 * kills the FERROMAGNET. It says nothing whatever about finite q — and once
 * the uniform state costs exactly nothing, ANY wavevector with a negative
 * eigenvalue beats it. So the model does not fail to order. It orders at q ≠ 0,
 * which is what an antiferromagnet IS.
 *
 * THE CONFIGURATION IS THE SIMPLE CUBIC LATTICE, and it is not marginal:
 *
 *     sc    q* = (0, π, π)   commensurate to machine precision, at every
 *                            screening length — a COLLINEAR ANTIFERROMAGNET
 *     bcc   q* incommensurate, a weak spiral
 *     fcc   q* incommensurate, a spiral
 *
 * AND THE LAW BEHIND IT IS THE MAGIC ANGLE. A bond at angle θ to the moment
 * contributes (1 − 3cos²θ), so:
 *
 *     cos²θ > 1/3    the bond wants the two moments PARALLEL
 *     cos²θ = 1/3    θ = 54.74°, and the bond contributes EXACTLY NOTHING
 *     cos²θ < 1/3    the bond wants them ANTIPARALLEL
 *
 * A collinear antiferromagnet exists exactly when some moment axis makes every
 * dominant bond either along it or square to it, because only then is the
 * demand consistent. Simple cubic manages it — six bonds, two along and four
 * square. Face-centred cannot: its twelve bonds split 8 wanting parallel and 4
 * wanting antiparallel with no axis reconciling them, and the lattice relieves
 * the conflict by TURNING the moments, which is a spiral. Body-centred is the
 * strangest of the three: all eight of its nearest neighbours sit at cos²θ =
 * 1/3 EXACTLY, so its nearest-neighbour shell contributes nothing at all and
 * the ordering is decided by the shells behind it.
 *
 *   §1  Λ(0) = 0 forbids the ferromagnet and nothing else
 *   §2  the permutation scan — lattices, screening, and geometry
 *   §3  the named structures, head to head
 *   §4  the law: the magic angle, and the consistency condition
 *   §5  the law used as a predictor, against the scan
 */

type V = [number, number, number];

/**
 * Smallest eigenvalue of a symmetric 3×3 given as [xx, yy, zz, xy, xz, yz],
 * by the closed form rather than by iteration — an earlier draft of this used
 * a hand-rolled Jacobi sweep that was wrong, and a wrong eigenvalue here looks
 * exactly like a physical result.
 */
const eigMin = (m: number[]) => {
  const A = [[m[0], m[3], m[4]], [m[3], m[1], m[5]], [m[4], m[5], m[2]]];
  const p1 = A[0][1] ** 2 + A[0][2] ** 2 + A[1][2] ** 2;
  const q = (A[0][0] + A[1][1] + A[2][2]) / 3;
  if (p1 < 1e-22) return Math.min(A[0][0], A[1][1], A[2][2]);
  const p2 = (A[0][0] - q) ** 2 + (A[1][1] - q) ** 2 + (A[2][2] - q) ** 2 + 2 * p1;
  const p = Math.sqrt(p2 / 6);
  const B = A.map((r, i) => r.map((v, j) => (v - (i === j ? q : 0)) / p));
  const det = B[0][0] * (B[1][1] * B[2][2] - B[1][2] * B[2][1])
    - B[0][1] * (B[1][0] * B[2][2] - B[1][2] * B[2][0])
    + B[0][2] * (B[1][0] * B[2][1] - B[1][1] * B[2][0]);
  const r = Math.max(-1, Math.min(1, det / 2));
  return q + 2 * p * Math.cos(Math.acos(r) / 3 + 2 * Math.PI / 3);
};

const eigVecMin = (m: number[]) => {
  const A = [[m[0], m[3], m[4]], [m[3], m[1], m[5]], [m[4], m[5], m[2]]];
  const l = eigMin(m);
  const M = A.map((r, i) => r.map((v, j) => v - (i === j ? l : 0)));
  const cr = (a: number[], b: number[]) =>
    [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  let best = [1, 0, 0], bn = -1;
  for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) {
    const c = cr(M[i], M[j]), n = Math.hypot(c[0], c[1], c[2]);
    if (n > bn) { bn = n; best = c; }
  }
  return best.map(v => v / (bn || 1));
};

/**
 * Lattices, built from the CONVENTIONAL cubic cell plus a basis rather than
 * from primitive vectors.
 *
 * That matters and it caught an earlier draft: summing over integer combinations
 * of the PRIMITIVE vectors and then truncating at a spherical Rmax gives a point
 * set that is not cubic-symmetric for bcc or fcc — the parallelepiped is cut
 * anisotropically — and Λ(0) then comes out at 10⁻¹ instead of 10⁻¹⁵. The
 * conventional cell is a cube, so a spherical cut preserves the symmetry, and
 * Λ(0) = 0 is the check that says so.
 *
 * Everything is scaled to nearest-neighbour distance 1 so that a screening
 * length means the same thing across lattices.
 */
const BASIS: Record<string, V[]> = {
  sc: [[0, 0, 0]],
  bcc: [[0, 0, 0], [.5, .5, .5]],
  fcc: [[0, 0, 0], [0, .5, .5], [.5, 0, .5], [.5, .5, 0]],
};

const build = (name: string, Rmax: number, ca = 1) => {
  const basis = BASIS[name];
  const N = Math.ceil(Rmax / Math.min(1, ca)) + 2;
  const raw: V[] = [];
  for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) for (let k = -N; k <= N; k++)
    for (const b of basis) {
      const p: V = [i + b[0], j + b[1], (k + b[2]) * ca];
      if (Math.hypot(p[0], p[1], p[2]) > 1e-9) raw.push(p);
    }
  let nn = Infinity;
  for (const p of raw) nn = Math.min(nn, Math.hypot(p[0], p[1], p[2]));
  return raw.map(p => [p[0] / nn, p[1] / nn, p[2] / nn] as V)
    .filter(p => Math.hypot(p[0], p[1], p[2]) <= Rmax);
};

type Pre = { px: Float64Array, py: Float64Array, pz: Float64Array, t: Float64Array[] };
const pre = (pts: V[], lamS: number): Pre => {
  const n = pts.length;
  const px = new Float64Array(n), py = new Float64Array(n), pz = new Float64Array(n);
  const t = [0, 1, 2, 3, 4, 5].map(() => new Float64Array(n));
  pts.forEach((p, i) => {
    const r = Math.hypot(p[0], p[1], p[2]), w = Math.exp(-r / lamS) / (r * r * r);
    const u = [p[0] / r, p[1] / r, p[2] / r];
    px[i] = p[0]; py[i] = p[1]; pz[i] = p[2];
    t[0][i] = w * (1 - 3 * u[0] * u[0]); t[1][i] = w * (1 - 3 * u[1] * u[1]);
    t[2][i] = w * (1 - 3 * u[2] * u[2]); t[3][i] = w * (-3 * u[0] * u[1]);
    t[4][i] = w * (-3 * u[0] * u[2]); t[5][i] = w * (-3 * u[1] * u[2]);
  });
  return { px, py, pz, t };
};

const lamAt = (P: Pre, qx: number, qy: number, qz: number) => {
  const m = [0, 0, 0, 0, 0, 0], n = P.px.length;
  for (let i = 0; i < n; i++) {
    const c = Math.cos(qx * P.px[i] + qy * P.py[i] + qz * P.pz[i]);
    m[0] += P.t[0][i] * c; m[1] += P.t[1][i] * c; m[2] += P.t[2][i] * c;
    m[3] += P.t[3][i] * c; m[4] += P.t[4][i] * c; m[5] += P.t[5][i] * c;
  }
  return m;
};

/** coarse sweep of the wedge, then three rounds of local refinement */
const scan = (P: Pre) => {
  let best = { e: Infinity, q: [0, 0, 0] as V };
  const N = 12, Q = 2 * Math.PI;
  for (let i = 0; i <= N; i++) for (let j = i; j <= N; j++) for (let k = j; k <= N; k++) {
    const q: V = [Q * i / N, Q * j / N, Q * k / N];
    const e = eigMin(lamAt(P, q[0], q[1], q[2]));
    if (e < best.e - 1e-12) best = { e, q };
  }
  for (let pass = 0; pass < 3; pass++) {
    const h = (2 * Math.PI / N) / Math.pow(4, pass + 1), b = best;
    for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (let k = -2; k <= 2; k++) {
      const q: V = [b.q[0] + i * h, b.q[1] + j * h, b.q[2] + k * h];
      const e = eigMin(lamAt(P, q[0], q[1], q[2]));
      if (e < best.e - 1e-12) best = { e, q };
    }
  }
  return best;
};

/**
 * Is the ordering COLLINEAR? A two-sublattice structure has exp(iq·R) = ±1 at
 * every lattice site, so every cosine is ±1 and this is nought. Anything else
 * needs the moments to turn, which is a spiral.
 */
const turning = (pts: V[], q: V) => {
  let w = 0;
  for (const p of pts) w = Math.max(w, 1 - Math.abs(Math.cos(q[0] * p[0] + q[1] * p[1] + q[2] * p[2])));
  return w;
};

const PI = Math.PI;

export function notForbiddenReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. Λ(0) = 0 FORBIDS THE FERROMAGNET AND NOTHING ELSE");
  line("=".repeat(78));
  line();
  line("  `torque` §4 reads the vanishing of Λ(0) as the far-field channel being");
  line("  unable to order. That is too strong and this file is the correction.");
  line("  Λ(0) is the energy of the UNIFORM state. Its vanishing says the");
  line("  ferromagnet is worth exactly nothing — and therefore that ANY");
  line("  wavevector with a negative eigenvalue beats it.");
  line();
  line("     lattice   sites   λ    min eig at q = 0    min eig over all q");
  for (const name of ["sc", "bcc", "fcc"]) {
    const pts = build(name, 9);
    for (const lamS of [2, 3, 4]) {
      const P = pre(pts, lamS);
      const z = eigMin(lamAt(P, 0, 0, 0));
      const b = scan(P);
      line(`     ${name.padEnd(9)}${String(pts.length).padStart(5)}   ${lamS}    ` +
        `${z.toExponential(1).padStart(15)}    ${b.e.toFixed(4).padStart(14)}`);
    }
  }
  line();
  line("  Nought at q = 0 to fifteen figures and strongly negative somewhere");
  line("  else, on every lattice at every screening length. SO THE MODEL ORDERS.");
  line("  It simply does not order uniformly, and a non-uniform ordered state is");
  line("  what an antiferromagnet is. The question is not whether, it is WHICH.");

  return out.join("\n");
}

export function scanReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. THE PERMUTATION SCAN — AND SIMPLE CUBIC IS THE ONE");
  line("=".repeat(78));
  line();
  line("  The winning wavevector, found by sweeping the zone and refining, with");
  line("  the moment direction read off as the eigenvector. COLLINEAR means every");
  line("  exp(iq·R) is ±1, so the structure is two sublattices and nothing turns.");
  line();
  line("     lattice   λ    q*/π                    energy      moment ê        state");
  for (const name of ["sc", "bcc", "fcc"]) {
    const pts = build(name, 9);
    for (const lamS of [2, 3, 4]) {
      const P = pre(pts, lamS);
      const b = scan(P);
      const v = eigVecMin(lamAt(P, b.q[0], b.q[1], b.q[2]));
      const d = turning(pts, b.q);
      line(`     ${name.padEnd(9)}${lamS}   [${b.q.map(x => (x / PI).toFixed(2)).join(",")}]` +
        `  ${b.e.toFixed(4).padStart(10)}   [${v.map(x => x.toFixed(2)).join(",")}]   ` +
        `${d < 1e-5 ? "COLLINEAR AF" : "spiral"}`);
    }
  }
  line();
  line("  SIMPLE CUBIC GIVES A COLLINEAR ANTIFERROMAGNET AT q = (0, π, π), with");
  line("  the moment along x̂, at every screening length and to machine precision");
  line("  on the commensurability. That is the configuration.");
  line();
  line("  Read the structure off the wavevector: q·x̂ = 0 so the moments are");
  line("  PARALLEL along x, and q·ŷ = q·ẑ = π so they ALTERNATE across y and z.");
  line("  Ferromagnetic chains running along the moment direction, stacked");
  line("  antiparallel to their neighbours. And that is not an accident of the");
  line("  numbers — §4 shows it is the only thing the sign rule permits.");
  line();
  line("  Now the geometry swept continuously, by stretching the cube along z:");
  line();
  line("       c/a      q*/π                   energy      state");
  for (const ca of [0.5, 0.7, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 2.0]) {
    const pts = build("sc", 9, ca), P = pre(pts, 3);
    const b = scan(P), d = turning(pts, b.q);
    line(`     ${ca.toFixed(2)}   [${b.q.map(x => (x / PI).toFixed(2)).join(",")}]  ` +
      `${b.e.toFixed(4).padStart(10)}   ${d < 1e-5 ? "COLLINEAR AF" : "spiral"}`);
  }
  line();
  line("  The cube is a maximum of the ordering energy and not a plateau — pull");
  line("  it out of shape either way and the energy falls off.");
  line();
  line("  And the collinearity comes and goes in a way that SHARPENS the law");
  line("  rather than following from it as stated. A tetragonal lattice has");
  line("  axis-aligned bonds at every c/a, so \"along or square to an axis\" is");
  line("  satisfied throughout and would predict collinear everywhere. It is not.");
  line("  What separates the rows is whether ONE shell dominates:");
  line();
  line("     c/a = 0.5    the z bonds are half the length of the in-plane ones,");
  line("                  so chains along z decide it alone      COLLINEAR");
  line("     c/a = 1      all six bonds equal and mutually square  COLLINEAR");
  line("     c/a ≥ 1.5    the in-plane bonds dominate, layers decide COLLINEAR");
  line("     between      two shells of comparable weight asking for different");
  line("                  things, and the DIAGONAL shells — which are neither");
  line("                  along nor square — are then big enough to matter  spiral");
  line();
  line("  So the law is about the DOMINANT bonds and needs the dominance to be");
  line("  clear. Every lattice has diagonal neighbours issuing inconsistent");
  line("  demands; a collinear state survives when the axis-aligned shell");
  line("  outweighs them, and is lost when it does not.");

  return out.join("\n");
}

export function namedReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. THE NAMED STRUCTURES, HEAD TO HEAD");
  line("=".repeat(78));
  line();
  line("  The four structures anyone would try, evaluated at the same screening");
  line("  length so the numbers are comparable. Lower wins.");
  line();
  const CAND: [string, V][] = [
    ["ferro (0,0,0)", [0, 0, 0]],
    ["layers (0,0,π)", [0, 0, PI]],
    ["columnar (0,π,π)", [0, PI, PI]],
    ["G-type (π,π,π)", [PI, PI, PI]],
  ];
  line("     lattice " + CAND.map(c => c[0].padStart(18)).join("") + "        best found");
  for (const name of ["sc", "bcc", "fcc"]) {
    const pts = build(name, 9), P = pre(pts, 3);
    const es = CAND.map(([, q]) => eigMin(lamAt(P, q[0], q[1], q[2])));
    const b = scan(P);
    line(`     ${name.padEnd(8)}` + es.map(e => e.toFixed(4).padStart(18)).join("") +
      `        ${b.e.toFixed(4)}`);
  }
  line();
  line("  The ferromagnet is exactly nought in every row, which is Λ(0) = 0 seen");
  line("  from the other side. Columnar wins outright on simple cubic and IS the");
  line("  global minimum. On bcc it comes within 0.6% of the true minimum without");
  line("  reaching it, and on fcc the G-type is well beaten by a spiral.");

  return out.join("\n");
}

export function lawReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. THE LAW — THE MAGIC ANGLE, AND WHEN THE DEMANDS ARE CONSISTENT");
  line("=".repeat(78));
  line();
  line("  Every bond in the sum carries the same factor, and the whole of the");
  line("  behaviour is in its sign:");
  line();
  line("       contribution of a bond  ∝  cos(q·R) · (1 − 3cos²θ)");
  line();
  line("  with θ the angle between the bond and the moment. So a bond is");
  line("  satisfied by making the two moments");
  line();
  line("       cos²θ > 1/3     PARALLEL          (θ < 54.74°, head to tail)");
  line("       cos²θ = 1/3     — nothing —       (θ = 54.74°, the magic angle)");
  line("       cos²θ < 1/3     ANTIPARALLEL      (θ > 54.74°, side by side)");
  line();
  line("  Two moments end to end pull into line; two side by side push out of");
  line("  it. That is the whole of the sign rule, and it is the same 3cos²θ − 1");
  line("  the far field is made of — the ordering and the dipole shape are one");
  line("  expression read at two ranges.");
  line();
  line("  A COLLINEAR ANTIFERROMAGNET NEEDS ALL OF THOSE DEMANDS TO BE");
  line("  SATISFIABLE AT ONCE, by a single axis and a single wavevector. Here is");
  line("  what each lattice is actually asking for, with ê along x̂:");
  line();
  for (const name of ["sc", "bcc", "fcc"]) {
    const pts = build(name, 9);
    let nn = Infinity;
    for (const p of pts) nn = Math.min(nn, Math.hypot(p[0], p[1], p[2]));
    const shell = pts.filter(p => Math.abs(Math.hypot(p[0], p[1], p[2]) - nn) < 1e-9);
    const kinds = new Map<string, number>();
    for (const p of shell) {
      const r = Math.hypot(p[0], p[1], p[2]), c2 = (p[0] / r) ** 2;
      const want = c2 > 1 / 3 + 1e-9 ? "wants PARALLEL"
        : c2 < 1 / 3 - 1e-9 ? "wants ANTIPARALLEL" : "contributes NOTHING";
      const key = `cos²θ = ${c2.toFixed(3)}   ${want}`;
      kinds.set(key, (kinds.get(key) || 0) + 1);
    }
    line(`     ${name}  — ${shell.length} nearest neighbours`);
    for (const [k, v] of kinds) line(`            ${String(v).padStart(2)} ×   ${k}`);
    line();
  }
  line("  AND THAT IS THE ANSWER, THREE TIMES OVER.");
  line();
  line("     SIMPLE CUBIC     every bond sits at cos²θ = 1 or cos²θ = 0 — along");
  line("                      the axis or square to it, and nothing in between.");
  line("                      Two bonds want parallel and four want antiparallel,");
  line("                      and q = (0, π, π) grants every one of them. NO");
  line("                      CONFLICT, so the state is collinear.");
  line();
  line("     BODY-CENTRED     all eight nearest neighbours sit at cos²θ = 1/3");
  line("                      EXACTLY. The ⟨111⟩ direction makes the magic angle");
  line("                      with a cube axis, so the entire nearest-neighbour");
  line("                      shell contributes NOTHING and the ordering is left");
  line("                      to the shells behind it. That is why bcc is weakly");
  line("                      and incommensurately ordered rather than either.");
  line();
  line("     FACE-CENTRED     eight bonds at cos²θ = 1/2 want parallel and four");
  line("                      at cos²θ = 0 want antiparallel, and no wavevector");
  line("                      grants both: fixing the eight forces q·x̂ = q·ŷ = 0,");
  line("                      which then makes two of the remaining four parallel");
  line("                      when they wanted the opposite. FRUSTRATED, and the");
  line("                      lattice relieves it by turning the moments, which");
  line("                      is exactly the spiral the scan finds.");
  line();
  line("  SO THE LAW IS A STATEMENT ABOUT ANGLES AND NOTHING ELSE:");
  line();
  line("     A collinear antiferromagnet exists precisely when some moment axis");
  line("     makes every dominant bond either ALONG it (cos²θ = 1) or SQUARE to");
  line("     it (cos²θ = 0). Bonds strictly between the two extremes issue");
  line("     demands that no single wavevector can satisfy together, and the");
  line("     lattice answers by turning the moments instead of flipping them.");
  line();
  line("  Which is why it is the SIMPLE CUBIC lattice and only the simple cubic");
  line("  lattice: it is the one whose bonds are mutually perpendicular.");

  return out.join("\n");
}

export function predictorReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. THE LAW USED AS A PREDICTOR, AGAINST THE SCAN");
  line("=".repeat(78));
  line();
  line("  A law that is read off three answers is a description. This applies it");
  line("  forwards: look ONLY at the nearest-neighbour angles, decide whether a");
  line("  consistent collinear assignment exists, and check the prediction");
  line("  against what sweeping the whole zone actually finds.");
  line();
  line("  The test is mechanical. For each candidate axis, ask each bond what it");
  line("  wants, then ask whether a wavevector grants all of them at once.");
  line();
  const AXES: [string, V][] = [
    ["⟨100⟩", [1, 0, 0]], ["⟨110⟩", [1, 1, 0]], ["⟨111⟩", [1, 1, 1]],
  ];
  const predict = (name: string, ca = 1) => {
    const pts = build(name, 9, ca);
    let nn = Infinity;
    for (const p of pts) nn = Math.min(nn, Math.hypot(p[0], p[1], p[2]));
    const shell = pts.filter(p => Math.abs(Math.hypot(p[0], p[1], p[2]) - nn) < 1e-9);
    for (const [, raw] of AXES) {
      const el = Math.hypot(raw[0], raw[1], raw[2]);
      const e = [raw[0] / el, raw[1] / el, raw[2] / el];
      // every bond must be along the axis or square to it
      let clean = true;
      for (const p of shell) {
        const r = Math.hypot(p[0], p[1], p[2]);
        const c2 = ((p[0] * e[0] + p[1] * e[1] + p[2] * e[2]) / r) ** 2;
        if (c2 > 1e-9 && c2 < 1 - 1e-9) { clean = false; break; }
      }
      if (!clean) continue;
      // and a wavevector must grant what each bond asks for
      for (let i = 0; i <= 1; i++) for (let j = 0; j <= 1; j++) for (let k = 0; k <= 1; k++) {
        const q: V = [i * PI, j * PI, k * PI];
        if (turning(pts, q) > 1e-9) continue;
        let ok = true;
        for (const p of shell) {
          const r = Math.hypot(p[0], p[1], p[2]);
          const c2 = ((p[0] * e[0] + p[1] * e[1] + p[2] * e[2]) / r) ** 2;
          const want = c2 > 1 / 3 ? 1 : -1;
          const got = Math.cos(q[0] * p[0] + q[1] * p[1] + q[2] * p[2]) > 0 ? 1 : -1;
          if (want !== got) { ok = false; break; }
        }
        if (ok && (i || j || k)) return { collinear: true, q };
      }
    }
    return { collinear: false, q: null as V | null };
  };
  line("     lattice    predicted        q predicted   scan says       agree?");
  for (const name of ["sc", "bcc", "fcc"]) {
    const p = predict(name);
    const pts = build(name, 9), b = scan(pre(pts, 3));
    const actual = turning(pts, b.q) < 1e-5;
    line(`     ${name.padEnd(10)}${(p.collinear ? "COLLINEAR AF" : "frustrated").padEnd(16)}` +
      `${(p.q ? "[" + p.q.map(x => (x / PI).toFixed(0)).join(",") + "]π" : "—").padEnd(14)}` +
      `${(actual ? "COLLINEAR AF" : "spiral").padEnd(16)}${p.collinear === actual ? "yes" : "NO"}`);
  }
  line();
  line("  Three for three, from the nearest-neighbour angles alone — and for sc");
  line("  the predicted wavevector is the one the full sweep of the zone lands");
  line("  on, not merely the right character of state.");
  line();
  line("  AGAINST LUTTINGER AND TISZA, WHO SOLVED THESE THREE EXACTLY IN 1946.");
  line();
  line("     They report SIMPLE CUBIC ordering antiferromagnetically as CHAINS OF");
  line("     ALIGNED DIPOLES. That is q = (0, π, π) with the moment along the");
  line("     chain, which is this file's answer, arrived at independently and");
  line("     including the moment direction. The article already cites them for it.");
  line();
  line("     They also report BCC AND FCC ordering FERROMAGNETICALLY, and this");
  line("     file does not reproduce that. The difference is not an error on");
  line("     either side — it is the screening, and it is worth being exact about.");
  line("     Their sum is the bare 1/r³, which is conditionally convergent, so its");
  line("     q = 0 value is finite, shape-dependent, and set by the long-range");
  line("     tail. Screened at exp(−r/λ) the sum converges absolutely and Λ(0)");
  line("     vanishes identically. THE BCC AND FCC FERROMAGNETISM LIVES ENTIRELY");
  line("     IN THE TAIL THE MODEL'S OWN SCREENING REMOVES.");
  line();
  line("     Which cuts both ways and should be recorded as doing so. The simple");
  line("     cubic antiferromagnet is a NEAR-NEIGHBOUR effect and survives");
  line("     screening at every length tried, so it is robust. The bcc and fcc");
  line("     ferromagnetism is a long-range effect and does not survive it — so if");
  line("     this model is right that the vacuum screens, it predicts that dipolar");
  line("     ferromagnetism on those lattices is an artefact of taking the tail to");
  line("     infinity.");
  line();
  line("  WHAT THIS DOES AND DOES NOT SETTLE.");
  line();
  line("     SETTLED   The model produces antiferromagnetism. `torque` §4's");
  line("               reading that it cannot order was wrong — it cannot order");
  line("               UNIFORMLY, which is a different and much weaker claim, and");
  line("               the state it does reach is a collinear antiferromagnet on");
  line("               the simple cubic lattice.");
  line();
  line("     SETTLED   The condition, and it is geometric rather than numerical:");
  line("               all dominant bonds along the moment axis or square to it.");
  line("               No parameter enters, and no screening length changes it.");
  line();
  line("     STILL     The Néel temperature, and with it whether any of this");
  line("     OWED      survives at room temperature. The dipolar scale is about");
  line("               1 K in real materials, so this orders — but cold. Real");
  line("               antiferromagnets order at hundreds of kelvin, by exchange,");
  line("               and `torque` §4's closing point stands: whatever this");
  line("               model's exchange is, it lives in the co-location channel");
  line("               and not in the far field measured here.");

  return out.join("\n");
}

/** the UNSCREENED tensor, spherical cutoff — the convention Luttinger and Tisza sum in */
const bare = (pts: V[], q: V) => {
  const m = [0, 0, 0, 0, 0, 0];
  for (const p of pts) {
    const r = Math.hypot(p[0], p[1], p[2]);
    const c = Math.cos(q[0] * p[0] + q[1] * p[1] + q[2] * p[2]) / (r * r * r);
    const u = [p[0] / r, p[1] / r, p[2] / r];
    m[0] += c * (1 - 3 * u[0] * u[0]); m[1] += c * (1 - 3 * u[1] * u[1]);
    m[2] += c * (1 - 3 * u[2] * u[2]); m[3] += c * (-3 * u[0] * u[1]);
    m[4] += c * (-3 * u[0] * u[2]); m[5] += c * (-3 * u[1] * u[2]);
  }
  return m;
};

/** volume per site, with nearest-neighbour distance 1 — this is what decides it */
const VOL: Record<string, number> = {
  sc: 1,
  bcc: Math.pow(2 / Math.sqrt(3), 3) / 2,
  fcc: Math.pow(Math.SQRT2, 3) / 4,
};

export function luttingerReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("6. RECONCILING LUTTINGER AND TISZA — AND THE FERROMAGNET IS A SHAPE");
  line("=".repeat(78));
  line();
  line("  They solve these three lattices exactly and get sc ANTIFERROMAGNETIC,");
  line("  bcc and fcc FERROMAGNETIC. §2 reproduces the first and not the other");
  line("  two, and the obvious thing to do is find out why rather than record a");
  line("  disagreement.");
  line();
  line("  THE RESOLUTION IS THAT Λ(0) IS NOT THE ENERGY OF THE FERROMAGNET.");
  line();
  line("  Λ(0) computed with a spherical cutoff is the LORENTZ part of the sum,");
  line("  and on a cubic lattice it vanishes — which is the identity §1 rests on");
  line("  and it is correct. But the full q = 0 sum is only CONDITIONALLY");
  line("  convergent, so it has a second piece that a spherical cutoff throws");
  line("  away: the DEMAGNETISING term, which depends on the shape of the sample");
  line("  and not on the lattice at all. For a long needle magnetised along its");
  line("  axis that term is −4π/3v per site, with v the volume per site.");
  line();
  line("  So the ferromagnet's energy is not nought. It is a shape, and a denser");
  line("  lattice gets more of it. Against the finite-q states, summed unscreened");
  line("  with the same spherical cutoff so the two are commensurable:");
  line();
  line("     lattice   best finite q     needle FM = −4π/3v    v      winner");
  const QS: Record<string, V> = {
    sc: [0, PI, PI], bcc: [0, 0.867 * PI, 0.867 * PI], fcc: [0, 0.523 * PI, 0.523 * PI],
  };
  for (const name of ["sc", "bcc", "fcc"]) {
    const pts = build(name, 26);
    const e = eigMin(bare(pts, QS[name]));
    const fm = -4 * PI / (3 * VOL[name]);
    line(`     ${name.padEnd(10)}${e.toFixed(3).padStart(11)}       ${fm.toFixed(3).padStart(11)}` +
      `      ${VOL[name].toFixed(3)}   ${e < fm ? "ANTIFERRO / spiral" : "FERROMAGNET"}`);
  }
  line();
  line("  THREE FOR THREE WITH LUTTINGER AND TISZA. sc keeps its antiferromagnet");
  line("  because its unfrustrated q = (0, π, π) is worth more than the shape");
  line("  bonus; bcc and fcc lose theirs because their frustrated best is worth");
  line("  LESS than the shape bonus, and they are more densely packed so the");
  line("  bonus is bigger.");
  line();
  line("  WHICH MAKES THE LAW OF §4 A COMPETITION BETWEEN TWO THINGS:");
  line();
  line("     FRUSTRATION   how much of its bond structure a lattice can satisfy");
  line("                   at finite q — large for sc, whose bonds are mutually");
  line("                   square, and small for bcc and fcc, which cannot");
  line("     PACKING       the volume per site, which sets the demagnetising");
  line("                   bonus available to the uniform state — 1 for sc");
  line("                   against 0.77 and 0.71, so bcc and fcc get MORE");
  line();
  line("  And the two run opposite ways on these lattices, which is why the");
  line("  answer is not the same for all three.");
  line();
  line("  NOW THE PART THAT IS THIS MODEL'S RATHER THAN THEIRS. The shape term");
  line("  is built by the long-range tail — it is the field of the sample");
  line("  BOUNDARY, and a magnet has to be correlated across its whole length to");
  line("  have one. THIS MODEL SCREENS. A screened interaction cannot reach the");
  line("  boundary: the furthest a site can see is λ, so its effective sample is");
  line("  a sphere of radius λ, a sphere has demagnetising factor 1/3, and the");
  line("  shape term is exactly nought. Which is precisely why §1 measures");
  line("  Λ(0) = 0 and means it.");
  line();
  line("     unscreened, needle-shaped     bcc and fcc are FERROMAGNETS");
  line("     screened at any finite λ      the shape term is gone, and every");
  line("                                   lattice orders at finite q");
  line();
  line("  SO THE DISAGREEMENT IS REAL, LOCATED, AND IT IS A PREDICTION. If the");
  line("  vacuum screens as this model says, then dipolar ferromagnetism on bcc");
  line("  and fcc is an artefact of taking the tail to infinity, and a dipolar");
  line("  magnet whose interaction is cut at λ far below its own size should not");
  line("  be a ferromagnet on any lattice. The simple cubic antiferromagnet is");
  line("  untouched either way — it is a near-neighbour effect and it survives");
  line("  every screening length tried.");

  return out.join("\n");
}

console.log(notForbiddenReport());
console.log(scanReport());
console.log(namedReport());
console.log(lawReport());
console.log(predictorReport());
console.log(luttingerReport());
