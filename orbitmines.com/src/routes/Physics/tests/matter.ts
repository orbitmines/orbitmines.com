/**
 * MATTER — what a structure is, and what the model says a particle needs.
 *
 * The article's argument is short and each link forces the next. A particle needs a
 * two-valued quantity that a 2π rotation flips. The XOR sign is already spoken for by
 * the interaction, so a SECOND one has to come from somewhere the rules do not
 * already use — and a HANDLE supplies exactly one bit. Not a missing cell, which
 * leaves a solid simply connected: a region the lattice goes ROUND rather than
 * through.
 *
 * SO THE INVARIANTS ARE COMPUTED AND NOT DECLARED. b₁ over GF(2) on an honest
 * cubical complex — vertices, edges AND faces of the actual cells, not the adjacency
 * graph, because a graph's cycle count sees every little square of four neighbouring
 * cells and none of those is a hole. That distinction IS the measurement: fill in the
 * faces and those cycles are all boundaries of something, so what is left is the
 * holes and nothing else.
 */

import { World, GRAVITY, headerOf, judge, Theory } from "../DISCRETE";
import { betti, block, ring, twoRings, shell, place } from "../STRUCTURE";
import { test } from "../SUITE";

export const handles = test({
  id: "matter/handles",
  claims: "a handle is the one two-valued thing a region can carry, density buys nothing, " +
    "and a cavity is not a handle",
  cited: ["Layer 2: Matter", "Matter — and a handle carries exactly the thing that was missing"],
  under: { "gravity": "holds" },
  exact: true,                    // topology of a fixed shape: no box, no ticks, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const cases: [string, ReturnType<typeof block>, number][] = [
      ["solid block 2³", block(2), 0],
      ["solid block 4³", block(4), 0],
      ["solid block 6³", block(6), 0],
      ["one handle — a ring", ring(4), 1],
      ["two handles", twoRings(3), 2],
      ["hollow shell", shell(3), 0],
    ];
    const got = cases.map(([name, s, want]) => ({ name, want, b: betti(s) }));
    const blocks = got.filter(x => x.name.startsWith("solid"));
    const hollow = got.find(x => x.name === "hollow shell")!;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "b₁ of a solid block, at every size",
          value: Math.max(...blocks.map(x => x.b.b1)),
          expect: {
            of: "0 — DENSITY BUYS NOTHING", want: 0, tolerance: 0,
            because: "a solid block is contractible however large, so piling up cells cannot " +
              "produce the bit a particle needs — which is why the argument had to go to " +
              "topology rather than to size",
          },
        }),
        judge({
          name: "b₁ of a ring", value: got[3].b.b1,
          expect: { of: "1 — one handle, one bit", want: 1, tolerance: 0,
            because: "a region the lattice goes ROUND rather than through, and one bit each " +
              "is all homology has to offer" },
        }),
        judge({
          name: "b₁ of two rings", value: got[4].b.b1,
          expect: { of: "2 — handles add", want: 2, tolerance: 0,
            because: "which is what makes the count an invariant rather than a yes or no" },
        }),
        judge({
          name: "b₁ of a hollow shell", value: hollow.b.b1,
          expect: {
            of: "0 — A CAVITY IS NOT A HANDLE", want: 0, tolerance: 0,
            because: "removing a ball from a solid leaves it simply connected: the void is b₂ " +
              "and shows up there instead. This is the control that says the two are being " +
              "told apart rather than a hole of any kind being counted.",
          },
          note: `its b₂ is ${hollow.b.b2}, which is where a sealed void belongs`,
        }),
      ],
      table: {
        columns: ["configuration", "cells", "b₀", "b₁", "b₂", "χ"],
        rows: got.map(x => [x.name, x.b.cells, x.b.b0, x.b.b1, x.b.b2, x.b.chi]),
      },
    };
  },
});

export default [handles];
