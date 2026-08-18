/**
 * LAYER 2 — the ring, and what a geometry has to have for a charge to exist on it.
 *
 * The whole of the Layer-2 arc rests on one counting fact: a face axis of the cubic
 * lattice has an EQUATOR OF EIGHT, and that equator is the ring a phase lives on,
 * the U(1) the charge is a winding of, and the 45° quantum. The article states it as
 * SHEET = 3^(D−1) − 1 and reads the consequences off it.
 *
 * WHICH MAKES IT A PROPERTY OF THE GEOMETRY RATHER THAN OF THE MODEL, and that is
 * worth testing rather than assuming, because the geometry is a parameter. Change
 * the lattice and the ring changes size — or vanishes entirely, which is a stronger
 * statement than any the arc makes about what a charge is: on BCC gravity would work
 * and charge as this book writes it could not exist.
 */

import { World, GEOMETRIES, headerOf, judge, dot } from "../DISCRETE";
import { test } from "../SUITE";

export const ring = test({
  id: "layer2/ring",
  claims: "the equator of an axis is the ring a phase lives on, its size is SHEET, and both " +
    "come out of the geometry rather than being written down",
  cited: ["Layer 2: Matter", "Electromagnetism — and what changing the lattice would cost"],
  under: { "gravity": "holds" },
  exact: true,                    // a counting fact about the exits, not a measurement
  run: (_ctx, theory) => {
    const g = GEOMETRIES["cubic-26"], fcc = GEOMETRIES["fcc-12"], bcc = GEOMETRIES["bcc-8"];
    const w = new World({ theory, N: 7 });

    /*
     * THE RING HAS TO BE A CIRCLE AND NOT A SET, or a phase cannot advance along it.
     * Walking it one step at a time must visit every member exactly once and come
     * back round, and each step must be the same angle — which is what makes SPIN a
     * quantum rather than an average.
     */
    const steps = g.RING.map((d, i) => {
      const nxt = g.RING[(i + 1) % g.RING.length];
      return Math.acos(Math.max(-1, Math.min(1, dot(g.U[d], g.U[nxt])))) * 180 / Math.PI;
    });
    const spread = (Math.max(...steps) - Math.min(...steps)) / (360 / g.CYCLE);
    let d0 = g.RING[0];
    for (let i = 0; i < g.CYCLE; i++) d0 = g.turn(d0, g.ringAxis);
    const closes = d0 === g.RING[0];
    const distinct = new Set(g.RING).size === g.RING.length;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "ring size", value: g.RING.length,
          expect: {
            of: "SHEET — the ring and the sheet are one constant", want: g.SHEET, tolerance: 0,
            because: "the equator of an axis IS the set of exits perpendicular to it, so a " +
              "sheet pulsed perpendicular to an axis and a ring turned about it are one set",
          },
        }),
        judge({
          name: "ring visits every member once", value: distinct ? 1 : 0,
          expect: { of: "1 — a circle, not a set", want: 1, tolerance: 0,
            because: "a phase advances one step at a time and must come back where it began" },
        }),
        judge({
          name: "ring closes after CYCLE turns", value: closes ? 1 : 0,
          expect: { of: "1 — CYCLE steps is the identity", want: 1, tolerance: 0,
            because: "that is what makes CYCLE the ticks a source takes to come round" },
        }),
        judge({
          name: "step-angle spread over SPIN", value: spread,
          expect: { of: "small — every step of the ring is the same angle", want: 0, tolerance: 0.6,
            because: "SPIN = 2π/CYCLE is a QUANTUM, which needs the steps to be equal" },
          note: "a lattice ring is not a perfect circle — the exits it is made of have different " +
            "lengths — so this is how far from equal the steps are, in units of the quantum",
        }),
        judge({
          name: "BCC ring size", value: bcc.SHEET,
          expect: {
            of: "0 — the one geometry a charge could not exist on", want: 0, tolerance: 0,
            because: "BCC's exits are the eight corners and no axis has any of them " +
              "perpendicular to it, so there is no ring to put a phase on. Gravity would work " +
              "on BCC; charge as this book writes it could not.",
          },
        }),
        judge({
          name: "FCC ring size", value: fcc.CYCLE,
          expect: {
            of: "6 — a hexagonal ring about a body diagonal, with a 60° quantum",
            want: 6, tolerance: 0,
            because: "FCC's exit axes have an equator of two and its cube axes four, but its " +
              "body diagonals six — so the ring does not die on FCC, it changes size, and " +
              "every constant built on CYCLE = 8 moves with it",
          },
        }),
      ],
      table: {
        columns: ["geometry", "SHEET", "CYCLE", "SPIN", "charge possible?"],
        rows: Object.values(GEOMETRIES).map(x => [
          x.name, x.SHEET, x.CYCLE,
          x.CYCLE ? (360 / x.CYCLE).toFixed(0) + "°" : "—",
          x.SHEET >= 3 ? "yes" : "NO — no ring",
        ]),
      },
    };
  },
});

export default [ring];
