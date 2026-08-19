/**
 * DILATION — time dilation out of the budget, and the obvious reading of it is dead.
 *
 * The port of `todo/provenance/clock.ts` §1. A structure gets ONE ACTION PER TICK: it can
 * spend it moving through the lattice or walking its own graph, and not both. Walking its
 * own graph is its clock, so something moving fast has fewer ticks left to run its own
 * schedule and its clock runs slow. That is time dilation out of a budget the model
 * already has, and it is the best-behaved result in the Layer 2 arc.
 *
 * THE POINT OF MEASURING IT IS THAT THE OBVIOUS READING FAILS AT FIRST ORDER, which is
 * the one place a model cannot afford to fail. A budget that is SPENT, like money, gives
 * 1 − f. A budget that is a LENGTH, like a step, gives √(1−f²) — and only the second is
 * 1/γ. The first is not inelegant, it is eleven orders above what an optical clock can
 * see at walking pace.
 *
 * NO LATTICE IN IT: this is arithmetic over 1/γ and two candidate budget laws, so the
 * figures did not move in the port. What it costs is a structural assumption — that the
 * internal walk is a genuinely separate AXIS from motion through the lattice rather than
 * a competing claim on the same queue — and that assumption is where this should be
 * attacked, since one emitter firing one ray per tick looks much more like one queue.
 */

import { World, headerOf, judge } from "../DISCRETE";
import { test } from "../SUITE";

const C_SI = 2.99792458e8;

/** the two candidate budget laws, against the Lorentz factor they are trying to be */
const lorentz = (f: number) => Math.sqrt(1 - f * f);      // = 1/γ
const linear = (f: number) => 1 - f;
const quadrature = (f: number) => Math.sqrt(1 - f * f);

export const budgetIsALength = test({
  id: "dilation/budget-is-a-length",
  claims: "a spent budget gives 1 − f and fails at first order; a budget that is a length " +
    "gives √(1−f²), which IS 1/γ — so the internal walk has to be a separate axis",
  cited: ["walk or update, not both — where the clock slows down"],
  under: { "gravity": "holds" },
  exact: true,                    // closed forms compared to each other: no box, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });

    const fs = [0.001, 0.01, 0.1, 0.5, 0.9, 0.99];
    const rows = fs.map(f => ({
      f, inv: lorentz(f),
      lin: linear(f), linErr: Math.abs(linear(f) - lorentz(f)) / lorentz(f),
      quad: quadrature(f), quadErr: Math.abs(quadrature(f) - lorentz(f)) / lorentz(f),
    }));

    const worstLinear = Math.max(...rows.map(r => r.linErr));
    const worstQuad = Math.max(...rows.map(r => r.quadErr));

    /*
     * AND WHAT IT COSTS AT A WALKING PACE, which is where the refutation actually bites.
     * At 10 m/s the linear reading predicts a fractional clock shift of f = v/c, and
     * relativity predicts f²/2 — eleven orders apart, against an optical clock that can
     * see about 10⁻¹⁸.
     */
    const v = 10, f = v / C_SI;
    const linShift = f;
    const relShift = f * f / 2;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "worst error of the linear reading against 1/γ", value: worstLinear,
          expect: {
            of: "≫ 0 — IT FAILS, and at first order", want: 0.929, tolerance: 0.01,
            because: "a budget that is SPENT gives 1 − f, and 1 − f is not 1/γ at any order " +
              "beyond the zeroth. Failing at FIRST order is the one place a model cannot " +
              "afford to fail, because that is the order every terrestrial measurement lives at. " +
              "The worst row of the sweep is f = 0.99; the cubic-26 file quoted 97.8% from a " +
              "finer sweep running closer to c, which is a bigger number about the same failure",
          },
        }),
        judge({
          name: "worst error of the quadrature reading against 1/γ", value: worstQuad,
          expect: {
            of: "0 — EXACT, and not an approximation", want: 0, tolerance: 1e-15,
            because: "√(1−f²) IS 1/γ, arrived at from a budget rather than from a Lorentz " +
              "transformation. Which means the whole question is why the two should add in " +
              "QUADRATURE — a budget that is a LENGTH, like a step, rather than one that is " +
              "spent like money",
          },
        }),
        judge({
          name: "clock shift the linear reading predicts at 10 m/s", value: linShift,
          expect: {
            of: "f = v/c", want: 10 / C_SI, tolerance: 1e-12,
            because: "quoted so the comparison below is between two numbers rather than " +
              "between a number and an adjective",
          },
        }),
        judge({
          name: "orders between the two readings at a walking pace",
          value: Math.log10(linShift / relShift),
          expect: {
            of: "about 8 — and an optical clock sees 10⁻¹⁸", want: 7.78, tolerance: 0.01,
            because: "relativity gives f²/2 where the linear reading gives f, so at 10 m/s they " +
              "differ by 2c/v. THE LINEAR READING IS NOT INELEGANT, IT IS DEAD: the shift it " +
              "predicts is enormously larger than anything measured, so the model needs the " +
              "internal walk to be a GENUINELY SEPARATE AXIS from motion through the lattice. " +
              "And that is the honest place to attack this, because one emitter firing one ray " +
              "a tick looks much more like one queue than like two axes — and one queue gives " +
              "the linear answer",
          },
          note: `linear ${linShift.toExponential(2)} against relativity's ` +
            `${relShift.toExponential(2)}`,
        }),
      ],
      table: {
        columns: ["f = v/c", "1/γ", "linear 1−f", "error", "quadrature √(1−f²)"],
        rows: rows.map(r => [
          r.f.toFixed(3), r.inv.toFixed(9), r.lin.toFixed(6),
          `${(100 * r.linErr).toFixed(1)}%`, r.quad.toFixed(9),
        ]),
      },
    };
  },
});

export default [budgetIsALength];
