/**
 * IS THE EQUATOR A RING — and for which norths?
 *
 * The Layer-2 arc is built on one geometric claim: sort the DEG = 26 ways out
 * of a cell by which side of a local north they fall on, and the ones left
 * over — the equator — "close into a single ring at forty-five degrees a
 * step, which is CYCLE = 8 and SPIN = 2π/CYCLE".
 *
 * That is the whole foundation. The charge is the sign along the axis, the
 * phase is the position around the ring, and the phase is a genuine U(1) only
 * if the ring is uniform. `lattice.ts` does have a CYCLE = 8, but it is
 * `turnRing`'s — eight in-plane directions of a PLANE — and a plane is not an
 * equator. They coincide for one class of axis and the arc does not say which.
 *
 * So: take every north the lattice has, cut the equator, sort it by angle, and
 * look at the spacing. And then ask the same question of every dimension,
 * since a ring with nothing on it is a phase with nowhere to live.
 */

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1, DEG = Math.pow(3, DIMS) - 1;

type V = number[];
const dot = (a: V, b: V) => a.reduce((s, x, i) => s + x * (b[i] || 0), 0);
const norm = (a: V) => Math.hypot(...a);
const unit = (a: V): V => { const l = norm(a) || 1; return a.map(x => x / l); };
const cross = (a: V, b: V): V =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** every way out of a point in d dimensions: 3^d − 1 offsets in {−1,0,1} */
const directions = (d: number): V[] => {
  const out: V[] = [];
  (function build(p: V) {
    if (p.length === d) { if (p.some(v => v !== 0)) out.push(p); return; }
    for (const v of [-1, 0, 1]) build([...p, v]);
  })([]);
  return out;
};

const WAYS = directions(3);

/**
 * The equator of an axis: the directions with no component along it. "No
 * component" is exact here — a lattice direction either has a zero dot with
 * the axis or it does not, and nothing is near the line.
 */
const equator = (axis: V) => WAYS.filter(w => Math.abs(dot(unit(w), unit(axis))) < 1e-12);

/** the equator sorted by azimuth, and the gaps between consecutive members */
const ring = (axis: V) => {
  const n = unit(axis);
  // any two directions spanning the plane, to measure azimuth against
  const seed = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const e1 = unit(cross(n, seed)), e2 = cross(n, e1);
  const members = equator(axis).map(w => {
    const u = unit(w);
    return { w, u, a: Math.atan2(dot(u, e2), dot(u, e1)) };
  }).sort((p, q) => p.a - q.a);
  const gaps: number[] = [];
  for (let i = 0; i < members.length; i++) {
    const j = (i + 1) % members.length;
    let g = members[j].a - members[i].a;
    if (g <= 0) g += 2 * Math.PI;
    gaps.push(g * 180 / Math.PI);
  }
  return { members, gaps };
};

const CLASS = (v: V) => {
  const n = v.filter(x => x !== 0).length;
  return n === 1 ? "face" : n === 2 ? "edge" : "corner";
};

export function ringReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("THE EQUATOR IS A UNIFORM RING FOR 14 OF THE 26 NORTHS, AND CARRIES");
  line("TWO DIFFERENT QUANTA WHEN IT IS");
  line("=".repeat(78));
  line();
  line("  Every north the lattice has, its equator, and the spacing round it.");
  line();
  line("     axis            class    |equator|   spacing");

  const byClass = new Map<string, { count: number; size: number; spacing: string }>();
  for (const axis of WAYS) {
    const { members, gaps } = ring(axis);
    const uniq = [...new Set(gaps.map(g => g.toFixed(2)))].sort();
    const spacing = uniq.length === 1
      ? `uniform ${uniq[0]}°`
      : `NOT uniform — ${uniq.map(u => u + "°").join(" / ")}`;
    const c = CLASS(axis);
    const key = `${c}|${members.length}|${spacing}`;
    const seen = byClass.get(key);
    if (seen) seen.count++;
    else byClass.set(key, { count: 1, size: members.length, spacing });
  }

  // one representative of each axis class, printed in full
  for (const rep of [[0, 0, 1], [1, 1, 0], [1, 1, 1]]) {
    const { members, gaps } = ring(rep);
    const uniq = [...new Set(gaps.map(g => g.toFixed(2)))];
    line(`  (${rep.join(",")})`.padEnd(20) + CLASS(rep).padEnd(9) +
      String(members.length).padStart(6) + "      " +
      (uniq.length === 1 ? `uniform ${uniq[0]}°`
        : `alternating ${[...new Set(gaps.map(g => g.toFixed(2)))].join("° / ")}°`));
    line("      round it:  " + members.map(m => `(${m.w.join(",")})`).join(" → ") + " → back");
    line("      gaps:      " + gaps.map(g => g.toFixed(2) + "°").join("  "));
    line();
  }

  line("  and by class, over all 26:");
  line();
  line("     class     count    CYCLE    spacing");
  for (const [key, v] of byClass)
    line("  " + key.split("|")[0].padEnd(10) + String(v.count).padStart(5) +
      String(v.size).padStart(9) + "    " + v.spacing);
  line();
  line("  So the arc's ring is the FACE ring. Six norths out of twenty-six");
  line("  carry it. Eight more carry a uniform ring of a DIFFERENT size, and");
  line("  the remaining twelve — the edge axes, which are the most numerous");
  line("  class — carry eight directions that do not sit at equal angles at");
  line("  all: 54.74° and 35.26° alternating, which are the lattice's own two");
  line("  angles and not an eighth of anything.");
  line();
  line(`  14 of 26 = ${(14 / 26 * 100).toFixed(1)}% of norths carry a uniform ring.`);
  line(`  12 of 26 = ${(12 / 26 * 100).toFixed(1)}% do not.`);
  line();

  line("=".repeat(78));
  line("WHICH REACHES THE MAGNETISM ARC TOO, WHERE IT IS NOT MENTIONED");
  line("=".repeat(78));
  line();
  line("  That arc quantises magnetisation as P = 2·dwell − 1 with dwell = k/CYCLE,");
  line("  and reports it 'quantised in quarters'. Quarters is 2/CYCLE, so:");
  line();
  line("     axis class   CYCLE   P takes the values                 step");
  for (const [rep, c] of [[[0, 0, 1], "face"], [[1, 1, 1], "corner"]] as [V, string][]) {
    const n = ring(rep).members.length;
    const vals = Array.from({ length: n + 1 }, (_, k) => (2 * k / n - 1));
    line("  " + c.padEnd(13) + String(n).padStart(5) + "   " +
      vals.map(v => v.toFixed(3)).join(" ").padEnd(36) + (2 / n).toFixed(4));
  }
  line("  edge              8   no uniform dwell to count with       —");
  line();
  line("  The anisotropy result is stated for ⟨111⟩, which is a CORNER axis and");
  line("  is quantised in thirds rather than quarters. Worth recomputing before");
  line("  the number is left standing.");

  return L.join("\n");
}

export function ringSizeByDimension(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("AND MAGNETISM NEEDS THREE DIMENSIONS, DERIVABLY");
  line("=".repeat(78));
  line();
  line("  The equator of a face axis is every direction with a zero component");
  line("  along it, which is every way out of a point in one dimension fewer:");
  line("  3^(D−1) − 1, which is SHEET. So the ring size IS the sheet size, and");
  line("  the two constants the model already had are one constant.");
  line();
  line("     D    DEG = 3^D−1    SHEET = 3^(D−1)−1    ring    room for a phase?");
  for (let d = 1; d <= 5; d++) {
    const deg = Math.pow(3, d) - 1, sheet = Math.pow(3, d - 1) - 1;
    line(`  ${String(d).padStart(4)}${String(deg).padStart(14)}${String(sheet).padStart(21)}` +
      `${String(sheet).padStart(8)}    ${sheet >= 3 ? "yes" : sheet === 2 ? "no — two points, a sign, not a ring" : "no — nothing there"}`);
  }
  line();
  line("  D = 1 gives nothing at all and D = 2 gives two. Two directions are a");
  line("  sign and not a circle: there is nothing to wind around and no U(1) to");
  line("  be had. The first dimension with a ring in it is the third.");
  line();
  line("  So the 1D walk finding — that the i is a change of basis and the");
  line("  phase is removable — was not a near miss. There is no phase in one");
  line("  dimension to remove, for the same counting reason there are no");
  line("  plaquettes. TWO independent arguments, one lattice count.");
  line();
  line(`  Checked against the shipped constants: SHEET = ${SHEET}, DEG = ${DEG},`);
  line(`  |equator of a face axis| = ${equator([0, 0, 1]).length}. ` +
    (SHEET === equator([0, 0, 1]).length ? "They agree." : "THEY DISAGREE."));

  return L.join("\n");
}

console.log(ringReport());
console.log();
console.log(ringSizeByDimension());
