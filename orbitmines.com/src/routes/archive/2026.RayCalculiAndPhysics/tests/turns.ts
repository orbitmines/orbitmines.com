/**
 * WHY A TURN IS EIGHT TICKS, AND WHY THAT NUMBER DOES NOT GROW WITH THE
 * DIMENSION — which was asserted and is now measured.
 *
 * `CYCLE` = 8 sits in `lattice.ts` as the length of `turnRing`, and `turnRing`
 * gets it by walking the circle in eighths — so the eight is written into the
 * loop. The comment there justifies it as "there are eight directions to a
 * plane", which is true in three dimensions and was never checked anywhere
 * else. `DEG` and `SHEET` both GROW with the dimension (3^d − 1 and 3^(d−1) −
 * 1), so a third count that does not grow is exactly the kind of thing this
 * file has been wrong about before — `SHEET` stood in for `DEG` in `BIAS` and
 * understated it by 3.25.
 *
 * THE REDUCTION, which is where the dimension actually leaves. A turn moves
 * ONE vector: the sheet is a hyperplane and a hyperplane is fixed by its
 * normal, so what comes round is the axis n̂ and nothing else. Any further
 * rotation component acts on directions orthogonal to the plane the axis
 * travels in and leaves the sheet exactly where it was, so it is not part of
 * the turn. (This matters from d = 4 up, where a rotation need not be simple.)
 * So the orbit of the axis is a great circle — a 2-PLANE — whatever d is, and
 * the question is:
 *
 *     how many of the lattice's directions lie in a 2-plane?
 *
 * THE ANSWER IS A TWO-DIMENSIONAL QUESTION, and that is the whole reason it
 * does not scale. Write S = {−1,0,1}^d \ {0}, and P a plane. Then
 *
 *     Λ = P ∩ Z^d      is a rank-2 lattice
 *     C = P ∩ [−1,1]^d is a symmetric convex polygon
 *     S ∩ P            = (Λ ∩ C) \ {0}
 *
 * and EVERY NON-ZERO POINT OF Λ ∩ C LIES ON ∂C — because its coordinates are
 * integers in [−1,1], so they are in {−1,0,1}, and being non-zero one of them
 * is ±1, which is the cube's own boundary. So the origin is the only lattice
 * point strictly inside C, and the count is the number of lattice points on
 * the boundary of a centrally symmetric convex lattice polygon with one
 * interior point. There are only three of those up to unimodular equivalence:
 *
 *     the square    conv{±(1,0), ±(0,1), ±(1,1), ±(1,−1)}      8 on the boundary
 *     the hexagon   conv{±(1,0), ±(0,1), ±(1,1)}               6
 *     the diamond   conv{±(1,0), ±(0,1)}                       4
 *
 * — so the count is 8, 6 or 4, and never anything else, IN EVERY DIMENSION.
 * The ambient dimension chooses WHICH of the three plane you are looking at.
 * It cannot make a fourth.
 *
 * The coordinate planes are the square, in every dimension, and the square is
 * the only one of the three whose points are equally spaced — which is what
 * makes `SPIN` = 2π/8 = 45° a constant angle rather than an average of
 * unequal ones.
 *
 * WHAT IS MEASURED HERE. Every 2-plane spanned by a pair of directions, for
 * d = 2 … 6, counted exhaustively. Planes are deduplicated by their Plücker
 * coordinates so each is counted once, and directions are counted as rays so
 * that a direction and its opposite are two.
 *
 * Expected: max 8 at every d, histogram over {4, 6, 8} only, and the maximum
 * attained by the coordinate planes.
 *
 *     npx ts-node --compiler-options '{"module":"commonjs"}' \
 *       src/routes/archive/2026.RayCalculiAndPhysics/tests/turns.ts
 */

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));

/** Every way out of a point in d dimensions: 3^d − 1 of them. */
const directions = (d: number): number[][] => {
  const out: number[][] = [];

  (function build(prefix: number[]) {
    if (prefix.length === d) {
      if (prefix.some(v => v !== 0)) out.push(prefix);
      return;
    }
    for (const v of [-1, 0, 1]) build([...prefix, v]);
  })([]);

  return out;
};

/** The ray a direction names, so that (2,2,0) and (1,1,0) are one thing. */
const ray = (v: number[]): string => {
  const g = v.reduce((a, x) => gcd(a, x), 0) || 1;
  return v.map(x => x / g).join(",");
};

/**
 * The plane a pair spans, named by its Plücker coordinates — normalised by
 * their gcd and by the sign of the first non-zero, so that P and −P are one
 * plane and any two pairs spanning it agree on the name.
 */
const planeOf = (u: number[], v: number[], d: number): string | null => {
  const p: number[] = [];

  for (let i = 0; i < d; i++)
    for (let j = i + 1; j < d; j++) p.push(u[i] * v[j] - u[j] * v[i]);

  const g = p.reduce((a, x) => gcd(a, x), 0);
  if (!g) return null;                                  // parallel: not a plane

  const q = p.map(x => x / g);
  const lead = q.find(x => x !== 0) as number;

  return (lead < 0 ? q.map(x => -x) : q).join(",");
};

for (let d = 2; d <= 6; d++) {
  const S = directions(d);
  const planes = new Map<string, Set<string>>();

  for (let a = 0; a < S.length; a++)
    for (let b = a + 1; b < S.length; b++) {
      const key = planeOf(S[a], S[b], d);
      if (key === null) continue;

      let held = planes.get(key);
      if (!held) planes.set(key, held = new Set());

      held.add(ray(S[a]));
      held.add(ray(S[b]));
    }

  const histogram = new Map<number, number>();
  for (const held of planes.values())
    histogram.set(held.size, (histogram.get(held.size) ?? 0) + 1);

  const sizes = [...histogram.keys()].sort((x, y) => x - y);
  const most = Math.max(...sizes);

  // The plane of the first two axes, which is a coordinate plane at every d.
  const axes = planeOf(
    Array.from({ length: d }, (_, i) => (i === 0 ? 1 : 0)),
    Array.from({ length: d }, (_, i) => (i === 1 ? 1 : 0)),
    d,
  ) as string;

  console.log(
    `d=${d}  |S|=${String(S.length).padStart(3)}  ` +
    `DEG=${3 ** d - 1}  SHEET=${3 ** (d - 1) - 1}  ` +
    `planes=${String(planes.size).padStart(5)}  ` +
    `max=${most}  sizes={${sizes.join(", ")}}  ` +
    `coordinate plane holds ${planes.get(axes)!.size}`,
  );
}
