/**
 * WHAT WOULD ACTUALLY BE SUFFICIENT — and a correction to `handle`.
 *
 * `handle` finds that a hole in the lattice gives a Z₂ label the model does not
 * otherwise have, and is careful to say that this is necessary and not
 * sufficient: having a two-valued label is not the same as that label being the
 * one a 2π rotation flips. This file settles which, and the answer is sharper
 * than "not proven" — IT IS THE WRONG LABEL, and the invariant that separates
 * the right one from the wrong one is not the one `handle` computed.
 *
 *   §1  A HANDLE'S LABEL IS ROTATION-INERT. Measured: a 2π rotation permutes the
 *       edges of the ring among themselves and a product does not care about
 *       order, so the holonomy is unchanged at every angle. b₁ = 1 gives a label
 *       and the rotation never touches it.
 *
 *   §2  WHAT THE RIGHT STRUCTURE LOOKS LIKE: an element of order EXACTLY two,
 *       which is what the SU(2) lift of a rotation has — q(2π) = −1 and
 *       q(4π) = +1 — and which lives on the ORIENTATION of a region rather than
 *       on any cycle inside it.
 *
 *   §3  AND THE INVARIANT THAT TELLS THEM APART IS TORSION, NOT RANK. A handle
 *       gives H₁ = Z, free, with no element of finite order at all. A fermionic
 *       geon gives H₁ = Z/2, pure torsion, whose generator has order exactly
 *       two. AND OVER GF(2) THESE ARE INDISTINGUISHABLE — both have dim H₁ = 1 —
 *       so `handle`'s computation, which is over GF(2), could not have seen the
 *       difference. That is a real limitation of what it measured.
 *
 *   §4  the four conditions, stated so they can be checked one at a time
 *   §5  and the rewrite rule that would produce one, which is a variant of a
 *       rule the model already has — plus the reason it is not enough on its own
 */

/** Smith normal form over Z — the elementary divisors, which carry the torsion */
const smith = (M: number[][]) => {
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
        if (A[r][j] !== 0) { for (let i = 0; i < m; i++) { const t = A[i][c]; A[i][c] = A[i][j]; A[i][j] = t; } done = false; }
      }
    }
    d.push(Math.abs(A[r][c])); r++; c++;
  }
  return d;
};

/** H₁ of a CW complex as free rank plus torsion, from the two boundary maps */
const H1 = (d1: number[][], d2: number[][], nEdges: number) => {
  const r1 = smith(d1).filter(x => x !== 0).length;
  const s2 = smith(d2);
  return { free: (nEdges - r1) - s2.filter(x => x !== 0).length, torsion: s2.filter(x => x > 1) };
};

export function inertReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. A HANDLE'S LABEL IS ROTATION-INERT — SO b₁ = 1 IS THE WRONG LABEL");
  line("=".repeat(78));
  line();
  line("  `handle` §4 shows a hole carries a gauge-invariant ±1. The question it");
  line("  left open is whether a 2π rotation flips it, and the answer is no.");
  line();
  const N = 24;
  let S = 5 >>> 0;
  const rnd = () => {
    S = (S + 0x6D2B79F5) >>> 0;
    let z = S;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
  const e = Array.from({ length: N }, () => rnd() < 0.5 ? 1 : -1);
  const hol = (a: number[]) => a.reduce((x, y) => x * y, 1);
  const rot = (a: number[], k: number) => a.map((_, i) => a[(i - k + N * 4) % N]);
  line("     rotation        holonomy");
  line(`     none            ${hol(e).toFixed(0).padStart(3)}`);
  for (const [n, k] of [["π/2", N / 4], ["π", N / 2], ["2π", N], ["4π", 2 * N]] as [string, number][])
    line(`     ${n.padEnd(16)}${hol(rot(e, k)).toFixed(0).padStart(3)}`);
  line();
  line("  UNCHANGED AT EVERY ANGLE, and for a reason rather than by accident: a");
  line("  rotation permutes the ring's edges among themselves, and a product does");
  line("  not care about the order of its factors.");
  line();
  line("  So the label a handle carries is real and it is not the one wanted. What");
  line("  a fermion needs is a label the ROTATION acts on, and a cycle inside a");
  line("  region is not that — the rotation maps the cycle to itself.");

  return out.join("\n");
}

export function orderReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. WHAT THE RIGHT STRUCTURE LOOKS LIKE — ORDER EXACTLY TWO");
  line("=".repeat(78));
  line();
  line("  The thing being looked for is not just two-valued. It has to be an");
  line("  element of order EXACTLY two under composition of rotations: 2π must be");
  line("  non-trivial and 4π must be trivial. That is the belt trick, and the SU(2)");
  line("  lift of a rotation is where it lives:");
  line();
  line("     angle       quaternion (w, x)");
  for (const [n, th] of [["0", 0], ["π", Math.PI], ["2π", 2 * Math.PI], ["3π", 3 * Math.PI], ["4π", 4 * Math.PI]] as [string, number][])
    line(`     ${n.padEnd(11)}(${Math.cos(th / 2).toFixed(4).padStart(7)}, ${Math.sin(th / 2).toFixed(4).padStart(7)})`);
  line();
  line("  q(2π) = −1 and q(4π) = +1. TWO PROPERTIES AT ONCE — non-trivial at a");
  line("  turn, trivial at two — and neither the XOR sign nor a handle's holonomy");
  line("  has the second one, because both are simply ±1 with nothing composing.");
  line();
  line("  And note WHERE it lives: on the ORIENTATION of the region, not on a");
  line("  cycle inside it. That is why §1 came out the way it did.");

  return out.join("\n");
}

export function torsionReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND THE INVARIANT IS TORSION, NOT RANK — WHICH CORRECTS `handle`");
  line("=".repeat(78));
  line();
  line("  An element of order exactly two is, in homology, TORSION: a class that");
  line("  is not zero and whose double is. A free class has no such element —");
  line("  doubling it never returns to nothing. So the two cases are:");
  line();
  line("     space                          H₁ over Z");
  line(`     circle / handle                ${JSON.stringify(H1([[0]], [], 1))}`);
  line(`     projective plane RP²           ${JSON.stringify(H1([[0]], [[2]], 1))}`);
  line(`     disc (2-cell of degree 1)      ${JSON.stringify(H1([[0]], [[1]], 1))}`);
  line();
  line("  A HANDLE GIVES FREE Z, with no element of finite order at all. RP²");
  line("  gives Z/2, pure torsion, whose generator has order exactly two — and it");
  line("  is generated by exactly the degree-2 attachment, a 2-cell glued round");
  line("  the loop TWICE. That two is the same two as q(4π) = +1.");
  line();
  line("  AND HERE IS THE CORRECTION. Over GF(2) both of those have dim H₁ = 1 and");
  line("  are INDISTINGUISHABLE. `handle` computes b₁ over GF(2), so it could not");
  line("  have told a handle from a fermionic geon — every number in it is right");
  line("  and the invariant is too coarse to answer the question it was asked.");
  line("  A handle and the thing wanted look identical to it.");

  return out.join("\n");
}

export function conditionsReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. SO WHAT WOULD BE SUFFICIENT — FOUR CONDITIONS, CHECKABLE SEPARATELY");
  line("=".repeat(78));
  line();
  line("  (1) THE REGION HAS AN ORIENTATION, not merely an axis. Its states must");
  line("      form SO(3) — a frame — because a 2π rotation of an axis alone is");
  line("      the identity and there is nothing for it to act on. `cover` §1");
  line("      already found that the ring is what supplies this and that removing");
  line("      it, which g = 2 wanted, removes the frame with it. THE TWO");
  line("      REQUIREMENTS STILL PULL OPPOSITE WAYS and this is where they meet.");
  line();
  line("  (2) H₁ OF THE REGION HAS Z/2 TORSION, not free rank. §3. This is what");
  line("      `handle` measured the wrong version of, and it is a strictly");
  line("      stronger condition — a handle satisfies b₁ ≥ 1 and fails this.");
  line();
  line("  (3) THE 2π ROTATION GENERATES THAT Z/2. Conditions 1 and 2 can both");
  line("      hold with the rotation acting trivially, which is exactly what §1");
  line("      measured happening. The rotation must BE the non-trivial class, not");
  line("      merely coexist with one.");
  line();
  line("  (4) AND THE MODEL MUST BE QUANTISED ON THE MULTIPLY-CONNECTED SPACE with");
  line("      the non-trivial phase. A Z₂ in the configuration space permits two");
  line("      consistent theories — one where the loop carries +1 and one where it");
  line("      carries −1 — and only the second is a fermion. Nothing in a rewrite");
  line("      rule chooses between them; it is a choice about the state space.");
  line();
  line("  CONDITION 3 IS THE ONE WITH TEETH. It is the whole content of Friedman");
  line("  and Sorkin's result, it does not follow from 1 and 2, and it is what");
  line("  distinguishes the geons that are fermions from the ones that are not.");
  line("  A plain handle satisfies 1 and can be made to satisfy 2 and STILL FAILS");
  line("  3, which is what §1 shows on the simplest case.");

  return out.join("\n");
}

export function ruleReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. AND THE REWRITE RULE — A VARIANT OF ONE THE MODEL ALREADY HAS");
  line("=".repeat(78));
  line();
  line("  Torsion comes from a cell attached by a map of DEGREE TWO — something");
  line("  glued round twice. On a lattice the elementary version of that is an");
  line("  antipodal identification: a boundary sphere sewn to itself so that each");
  line("  point meets the one opposite. That is what makes RP³ out of a ball, and");
  line("  it is where the Z/2 comes from.");
  line();
  line("  AND THE MODEL ALREADY HAS A TWO-TO-ONE RULE. (G/1) takes two charges");
  line("  meeting in a cell and leaves ONE point behind. What it does with the");
  line("  space is destroy it. The variant needed is one word different:");
  line();
  line("     (G/1)   two opposite charges meet   →  one point, space DESTROYED");
  line("     (G/1′)  two opposite charges meet   →  one point, the two cells");
  line("                                            IDENTIFIED — both");
  line("                                            neighbourhoods kept");
  line();
  line("  Destroying is a quotient that throws the neighbourhoods away; fusing is");
  line("  a quotient that keeps them, and keeping them is what leaves topology");
  line("  behind. It is a smaller change than it sounds, and it does not touch");
  line("  the charge bookkeeping at all — the same two charges are consumed.");
  line();
  line("  BUT ONE FUSION IS NOT ENOUGH, AND THIS IS THE REAL PROBLEM. Identifying");
  line("  two points of a connected region gives a wedge with a circle — free Z,");
  line("  a handle, and §1 says a handle is rotation-inert:");
  line();
  line(`     one fusion       H₁ = ${JSON.stringify(H1([[0]], [], 1))}   a handle, condition 3 FAILS`);
  line(`     degree-2 gluing  H₁ = ${JSON.stringify(H1([[0]], [[2]], 1))}   torsion, condition 3 possible`);
  line();
  line("  The difference is not how MANY fusions but whether they are COHERENT. A");
  line("  degree-two attachment is an identification carried out consistently");
  line("  across a whole closed surface, every point with its antipode, all at");
  line("  once. Independent fusions at unrelated places give independent handles");
  line("  and free rank; only a correlated sheet of them gives torsion.");
  line();
  line("  WHICH IS EXACTLY WHAT A LOCAL REWRITE RULE CANNOT DO. Every rule in this");
  line("  model fires on what is in one cell, and the whole of the book's method");
  line("  is that nothing coordinates anything at a distance. A fusion rule fired");
  line("  independently wherever two charges meet produces handles — bosons — and");
  line("  the fermionic case needs the firings to agree with each other over a");
  line("  surface.");
  line();
  line("  SO THE HONEST ANSWER TO 'WHAT RULES WOULD DO IT':");
  line();
  line("     THE 2→1 RULE IS ALREADY THERE and needs one word changed, from");
  line("     destroy to identify. That part is cheap.");
  line();
  line("     WHAT IS NOT CHEAP is the coherence. Torsion is a statement about a");
  line("     whole closed surface at once, and a local rule has no way to know");
  line("     it is part of one. THAT is the thing to solve, and it is a different");
  line("     problem from any this book has had — every previous gap was a missing");
  line("     quantity, and this is a missing CORRELATION.");
  line();
  line("  And it has a shape worth noticing: the model already has one mechanism");
  line("  that makes distant things agree without coordinating them — (G+M/3) and");
  line("  regional sourcing, where co-located sources lock to one train in two");
  line("  ticks. Whether that can lock a surface rather than a region is the");
  line("  question this ends on, and it is well posed.");

  return out.join("\n");
}

console.log(inertReport());
console.log(orderReport());
console.log(torsionReport());
console.log(conditionsReport());
console.log(ruleReport());
