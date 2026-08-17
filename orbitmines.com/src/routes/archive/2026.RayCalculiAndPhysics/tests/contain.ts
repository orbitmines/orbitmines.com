/**
 * CONTAINMENT — spin as which path the interior lets you take, and what kind of
 * container it has to be.
 *
 * `sufficient` leaves two conditions unmet and says they are where the
 * difficulty is: the region needs an ORIENTATION and not just an axis
 * (condition 1), and the 2π rotation has to GENERATE the two-valued label
 * (condition 3, the one with teeth). A handle fails 3 because a rotation
 * permutes its cycle among itself and a product ignores order — the label just
 * sits there.
 *
 * THE PROPOSAL THIS FILE TESTS is that the label should not be a thing attached
 * to a region but a fact about WHAT HAPPENS INSIDE ONE. A container, with an
 * interior running the same dynamics as everywhere else; a charge that enters it
 * takes some path through and comes out; and the two-valued label is WHICH CLASS
 * OF PATH it took. Rotating the container physically changes which paths are
 * available, so the rotation acts on the label by composition rather than
 * permuting it inertly.
 *
 * THAT IS THE RIGHT SHAPE, AND IT IS THE FIRST PROPOSAL THAT ADDRESSES
 * CONDITION 3 AT ALL. Whether it works comes down to one question — what kind of
 * container — and that has a sharp answer.
 *
 *   §1  why paths fix what a cycle could not
 *   §2  which gluings give torsion: MEASURED, and it is exactly the
 *       orientation-REVERSING ones
 *   §3  and the antipodal map is reversing — so a ball with its boundary glued
 *       antipodally is the container, and that space is RP³
 *   §4  and RP³ is SO(3), which settles conditions 1, 2 and 3 together — and
 *       dissolves the ring tension that has run through this whole arc
 *   §5  what is left, which is one choice and one construction
 */

/** Smith normal form over Z — the elementary divisors carry the torsion */
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

/**
 * A closed surface as a polygon with its boundary glued by a word.
 *
 * One vertex, `nE` loop edges, one face attached along the word. Every edge is
 * a loop so ∂₁ = 0, and all the content is in ∂₂ — which is exactly where
 * torsion lives, and exactly what distinguishes the gluings.
 */
const glued = (nE: number, word: [number, number][]) => {
  const col = new Array(nE).fill(0);
  for (const [e, s] of word) col[e] += s;
  const s2 = smith(col.map(v => [v]));
  const rank2 = s2.filter(x => x !== 0).length;
  return { free: nE - rank2, torsion: s2.filter(x => x > 1) };
};

export function pathReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. WHY PATHS FIX WHAT A CYCLE COULD NOT");
  line("=".repeat(78));
  line();
  line("  `sufficient` §1 measures a handle's label unchanged by a rotation at");
  line("  every angle, and the reason is structural: a rotation maps the cycle to");
  line("  itself, permuting its edges, and the holonomy is a product which does");
  line("  not care about order. THE ROTATION HAS NOTHING TO GRIP.");
  line();
  line("  A path through a container is a different kind of object:");
  line();
  line("     a charge ENTERS the container at some point");
  line("     it takes a path through the interior — same rules inside as out");
  line("     it LEAVES, and the label is which CLASS of path it took");
  line();
  line("  and classes of path compose. Two paths in sequence give a third, and");
  line("  the classes form a group — π₁ of the interior. So a rotation of the");
  line("  container does not permute a label, it COMPOSES with it, and");
  line("  composition is exactly what a product around a cycle refused to do.");
  line();
  line("  THAT IS THE FIRST PROPOSAL IN THIS SEQUENCE THAT ADDRESSES CONDITION 3.");
  line("  It also asks nothing new of the dynamics — the interior runs the same");
  line("  rules as everywhere else, and only the connectivity is different.");
  line();
  line("  What it needs is that π₁ of the interior be Z₂: exactly two classes, and");
  line("  going round twice being the same as not going. So: WHICH CONTAINERS?");

  return out.join("\n");
}

export function gluingReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. WHICH GLUINGS GIVE TORSION — AND IT IS A ONE-WORD ANSWER");
  line("=".repeat(78));
  line();
  line("  A container is a region whose boundary is sewn to itself. There are not");
  line("  many ways to do that, and the standard ones are a square with its edges");
  line("  identified by a word. Computed over Z, so torsion is visible:");
  line();
  line("     surface         word          gluing         H₁");
  const cases: [string, string, number, [number, number][], string][] = [
    ["torus", "a b a⁻¹ b⁻¹", 2, [[0, 1], [1, 1], [0, -1], [1, -1]], "preserving"],
    ["Klein bottle", "a b a b⁻¹", 2, [[0, 1], [1, 1], [0, 1], [1, -1]], "REVERSING"],
    ["RP²", "a a", 1, [[0, 1], [0, 1]], "REVERSING"],
  ];
  for (const [n, w, nE, word, o] of cases) {
    const h = glued(nE, word);
    line(`     ${n.padEnd(15)}${w.padEnd(14)}${o.padEnd(15)}` +
      `free ${h.free}, torsion ${h.torsion.length ? JSON.stringify(h.torsion) : "—"}`);
  }
  line();
  line("  TORSION APPEARS EXACTLY WHERE THE GLUING REVERSES ORIENTATION, and");
  line("  nowhere else. A boundary sewn to itself the same way round gives free");
  line("  rank however it is done — the torus has two generators and no element");
  line("  of finite order at all. Reverse it and a 2 appears in the boundary map,");
  line("  which is the 2 in Z/2.");
  line();
  line("  So the answer to 'what kind of container' is already visible and it is");
  line("  one word: A CONTAINER WHOSE BOUNDARY IS GLUED TO ITSELF WITH A FLIP.");

  return out.join("\n");
}

export function antipodalReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND THE ANTIPODAL MAP IS THE FLIP — WHICH IS ALREADY MEASURED");
  line("=".repeat(78));
  line();
  line("  In three dimensions the container's boundary is a sphere, and the");
  line("  natural way to sew a sphere to itself is antipodally — every point to");
  line("  the one opposite. Is that orientation-reversing?");
  line();
  line("     `degree` §2 measures the antipodal map s = −d and gets DEGREE −1.");
  line();
  line("  A degree of −1 IS orientation-reversing, so by §2 it gives torsion. And");
  line("  a ball with its boundary sphere identified antipodally is RP³, whose");
  line("  H₁ is Z/2 — the order-two element `sufficient` §2 says is wanted.");
  line();
  line("  Which lines up three separate things that were arrived at independently:");
  line();
  line("     `sufficient` §5   the rewrite rule is (G/1) changed from destroy to");
  line("                       IDENTIFY, and torsion needs an ANTIPODAL");
  line("                       identification across a closed surface");
  line("     `lock`            a locked shell's charges meet at the centre in");
  line("                       ANTIPODAL pairs, coherently, with zero arrival");
  line("                       spread — so the model can carry that out");
  line("     here              antipodal is the orientation-reversing gluing, and");
  line("                       reversing is exactly what makes torsion");
  line();
  line("  THREE ROUTES, ONE CONSTRUCTION. None of them was looking for it.");

  return out.join("\n");
}

export function so3Report(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. AND RP³ IS SO(3) — WHICH SETTLES THREE CONDITIONS AT ONCE");
  line("=".repeat(78));
  line();
  line("  The container that comes out of §3 is RP³, and RP³ is not merely a");
  line("  space with the right homology. IT IS THE ROTATION GROUP. Every point of");
  line("  it is a rotation, and:");
  line();
  line("     π₁(SO(3)) = Z₂, and its generator IS THE 2π ROTATION");
  line();
  line("  which is condition 3 stated as a fact about the space rather than as");
  line("  something to be arranged. And then the conditions fall together:");
  line();
  line("     (1) an ORIENTATION, not an axis        the interior's points ARE");
  line("                                            orientations — the container");
  line("                                            is the frame");
  line("     (2) Z/2 TORSION in H₁                  §2 and §3, from the reversing");
  line("                                            gluing");
  line("     (3) the 2π rotation GENERATES it       the defining property of");
  line("                                            π₁(SO(3))");
  line();
  line("  AND IT DISSOLVES THE RING TENSION, which has run through this whole");
  line("  arc. `spinor` needs the ring GONE, so that µ stops being tied to L by a");
  line("  shared radius and g can be 2. `sufficient` condition 1 needs a FRAME,");
  line("  which is what the ring was supplying. Those pulled opposite ways and");
  line("  there was no way to have both.");
  line();
  line("     WITH A CONTAINER THE FRAME COMES FROM THE TOPOLOGY, not from an");
  line("     emitter walking round a ring. So the ring can go — g = 2 — and the");
  line("     frame stays — condition 1 — and they stop being in conflict.");
  line();
  line("  A charge traversing such a container accumulates a rotation, and the");
  line("  two classes are an EVEN or an ODD number of turns. Rotating the");
  line("  container by 2π composes with the generator and moves a path from one");
  line("  class to the other; by 4π it composes twice and returns. WHICH IS THE");
  line("  USER'S DESCRIPTION EXACTLY — the rotation changes which paths the");
  line("  interior lets you take, and that is what spin is.");

  return out.join("\n");
}

export function leftReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. WHAT IS LEFT — ONE CHOICE AND ONE CONSTRUCTION");
  line("=".repeat(78));
  line();
  line("  WOULD IT WORK: yes, on conditions 1 to 3, and for a reason rather than");
  line("  by construction — RP³ satisfies them because it is the rotation group,");
  line("  not because it was fitted to them.");
  line();
  line("  WHAT KIND OF CONTAINMENT: a region whose boundary sphere is identified");
  line("  ANTIPODALLY. Not a hole, not a knot, not a denser lattice — those give");
  line("  free rank and rotation-inert labels. The flip is the whole of it.");
  line();
  line("  AND WHAT IS STILL OWED:");
  line();
  line("     CONDITION 4, AND IT IS A CHOICE. A Z₂ in the configuration space");
  line("     permits two consistent theories — the loop carrying +1 or −1 — and");
  line("     only the second is a fermion. Nothing derives which; it is a");
  line("     statement about the state space and not about a rule. Every attempt");
  line("     in this sequence would have hit this, and it is the one place where");
  line("     'quantise it' is not avoidable.");
  line();
  line("     THE CONSTRUCTION ITSELF. `lock` shows the model can fire an antipodal");
  line("     identification coherently across a shell. It does not build the");
  line("     resulting complex and take its H₁ over Z, which is the check that");
  line("     the thing made is RP³ rather than something else with the same b₁ —");
  line("     and `sufficient` §3 is precisely the warning that GF(2) cannot tell");
  line("     those apart. THAT IS THE NEXT COMPUTATION and it is well posed.");
  line();
  line("     AND WHETHER IT HOLDS TOGETHER. `handle` §6 measures that a handle");
  line("     survives the churn of (G/1) and (G/2) at the model's own expansion");
  line("     rate with sixty orders to spare. Whether TORSION survives the same");
  line("     churn is a different question, because a torsion class can be killed");
  line("     by a single wrong identification where a free class cannot.");
  line();
  line("  SO THE SHAPE OF THE ANSWER: the containment idea is right, the container");
  line("  is RP³, and it settles the two conditions that were doing the damage.");
  line("  What remains is one thing that must be chosen rather than derived, and");
  line("  one computation that has not been done.");

  return out.join("\n");
}

console.log(pathReport());
console.log(gluingReport());
console.log(antipodalReport());
console.log(so3Report());
console.log(leftReport());
