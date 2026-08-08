import { LineSide } from "./discrete";
import { opposite, Polarity, randomPolarity } from "./lattice";

/**
 * Charges in a row, enumerated.
 *
 * These are the small universes — two, three, four points — where the whole
 * of what can happen can be listed rather than sampled. There is no closed
 * form of any of them and there is no need for one: the interest is that
 * every arrangement is on the page and none was chosen.
 */

// The four states a point of a line can be in, named against the line rather
// than against a partner.
const STATES: LineSide[] = [
  { polarity: Polarity.Positive, moving: 'right' },
  { polarity: Polarity.Positive, moving: 'left' },
  { polarity: Polarity.Negative, moving: 'right' },
  { polarity: Polarity.Negative, moving: 'left' },
];

// Every arrangement of n charges in a row: each of them either polarity, each
// of them going either way. 4ⁿ of them before the symmetries are taken out.
const linesOf = (n: number): LineSide[][] =>
  n === 0
    ? [[]]
    : linesOf(n - 1).flatMap(rest => STATES.map(side => [side, ...rest]));

// Read back to front with every direction reversed, a line is the same
// experiment watched from the other end.
const mirrored = (line: LineSide[]): LineSide[] =>
  [...line].reverse().map(s => ({
    polarity: s.polarity,
    moving: s.moving === 'left' ? 'right' : 'left',
  }));

// Every polarity flipped, every direction kept: the anti-line.
const antiLine = (line: LineSide[]): LineSide[] =>
  line.map(s => ({ polarity: opposite(s.polarity), moving: s.moving }));

// Identity up to mirroring: whichever way round the line reads first.
const lineKey = (line: LineSide[]): string => {
  const read = (l: LineSide[]) => l.map(s => `${s.polarity}${s.moving}`).join(",");
  const [x, y] = [read(line), read(mirrored(line))];

  return x < y ? x : y;
};

/**
 * The distinct lines among the given ones, each grouped with its anti-line so
 * the two sit one above the other — the same experiment run on matter and on
 * antimatter. A line that is its own anti up to mirroring is a group of one.
 */
const antiGroups = (lines: LineSide[][]): LineSide[][][] => {
  const byKey = new Map<string, LineSide[]>();
  for (const line of lines) {
    const key = lineKey(line);
    if (!byKey.has(key)) byKey.set(key, line);
  }

  const taken = new Set<string>();
  const groups: LineSide[][][] = [];

  for (const [key, line] of byKey) {
    if (taken.has(key)) continue;
    taken.add(key);

    const group = [line];

    const anti = lineKey(antiLine(line));
    if (!taken.has(anti) && byKey.has(anti)) {
      taken.add(anti);
      group.push(byKey.get(anti)!);
    }

    groups.push(group);
  }

  return groups;
};

/**
 * Every arrangement of n charges, grouped with its anti.
 *
 * At two this is the smallest possible universe: two spatial points joined by
 * a mutual boundary pair, and every permutation of (polarity, direction) over
 * the two ends is one isolated experiment in the tick rules — head-on like
 * polarities turn around, head-on opposite polarities annihilate, and
 * anything else moves. At three or four the line has an INSIDE, so what one
 * interaction leaves behind is what the next has to work with.
 */
export const lineGroups = (n: number): LineSide[][][] => antiGroups(linesOf(n));

/**
 * One side of a head-on collision: `size` charges all going the same way,
 * their polarity flipping from one to the next. `inner` is the polarity of
 * the one at the interface, and the block alternates outward from there —
 * so what a block is doing at the meeting point is what names it, and the
 * rest of it follows.
 */
const alternatingBlock = (size: number, inner: Polarity, moving: 'left' | 'right'): LineSide[] => {
  const outward = Array.from({ length: size }, (_, i) => ({
    polarity: i % 2 === 0 ? inner : opposite(inner),
    moving,
  }));

  // Written from the interface outward. A block moving right sits to the left
  // of the interface, so it reads the other way round along the line.
  return moving === 'right' ? outward.reverse() : outward;
};

/**
 * Two alternating blocks run at each other. Once the alternation is fixed the
 * only freedom left is the phase of each block — which polarity it presents
 * at the interface — so these four are all of them:
 *
 *   ..0101 → ← 1010..  the alternation carries straight through the meeting
 *                      point; the line is one alternating line, cut in two and
 *                      told to move at itself.
 *   ..1010 → ← 1010..  both blocks in the same phase; the alternation breaks
 *                      exactly where they meet, and the two innermost charges
 *                      are alike rather than opposite.
 *
 * and the anti of each. Head-on opposites annihilate and head-on likes turn
 * around, so the phase decides whether the interface eats the line or reflects
 * it — and after the first tick the block behind is one step further in, with
 * its own phase to present.
 */
const PHASES: [Polarity, Polarity][] = [
  [Polarity.Positive, Polarity.Negative],
  [Polarity.Negative, Polarity.Positive],
  [Polarity.Positive, Polarity.Positive],
  [Polarity.Negative, Polarity.Negative],
];

// The distinct collisions of two alternating blocks of `size`, grouped with
// their antis. Mirroring identifies the two through-alternating phases, so
// what is left is: alternation-through, and alternation-broken with its anti.
export const collisionGroups = (size: number): LineSide[][][] =>
  antiGroups(PHASES.map(([left, right]) => [
    ...alternatingBlock(size, left, 'right'),
    ...alternatingBlock(size, right, 'left'),
  ]));

/**
 * An alternating block driven into an unstructured one. The left side arrives
 * at the interface with a polarity that was decided the moment the block was
 * written; the right side arrives with one that wasn't decided by anything.
 *
 * So the two phases above stop being two experiments: which of them is
 * happening is redrawn at every step, as whatever the other side happens to
 * have put in front. What is left to watch is whether the alternation
 * survives being met by something that isn't one.
 */
export const alternatingIntoRandom = (size: number, inner: Polarity): LineSide[] => [
  ...alternatingBlock(size, inner, 'right'),
  ...Array.from({ length: size }, () => ({
    polarity: randomPolarity(), moving: 'left' as const,
  })),
];
