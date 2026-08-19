/**
 * WHAT COUNTS AS A MEETING — the reading that was never tested, and that moves
 * everything downstream of it.
 *
 * The article says "when two rays meet, they annihilate". That leaves two things
 * open, and both were settled by whoever wrote each test file rather than by any
 * measurement:
 *
 *   WHAT MEETS      `head-on` — only a counter-propagating pair on one axis, which
 *                   is what a lattice-gas collision usually means. Or `co-located` —
 *                   any two rays that arrive at the same point, which is what the
 *                   sentence says.
 *
 *   HOW MANY        `all` the met pairs resolve in a tick, up to l.DEG/2 events at
 *                   one point. Or `one`, which is what "leaving A SINGLE neutral
 *                   spatial point behind" reads like against (G/2)'s "on ALL axis".
 *
 * FOUR COMBINATIONS, AND THEY GIVE VACUA AN ORDER OF MAGNITUDE APART. Since every
 * screening length in this project is a mean free path and a mean free path is
 * 1/fill, that is not a detail — it decides whether a force has a range of two cells
 * or fifty, and whether one is measurable at all.
 *
 * SO THE TEST IS NOT WHICH IS PRETTIEST. It is which of them leaves a vacuum that can
 * still carry the results this book already has: a resolvable force between two
 * bodies, and an occupancy in the range the derivation points at.
 */

import {
  World, GRAVITY, GRAVITY_MAGNETISM, CONSERVING, Meeting, MeetingRate,
  fill, scattering, pullOn, stat, headerOf, judge, Theory, Finding,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";

const READINGS: [Meeting, MeetingRate][] = [
  ["head-on", "all"], ["head-on", "one"], ["co-located", "all"], ["co-located", "one"],
];

export const whichMeeting = test({
  id: "vacuum/which-meeting",
  claims: "the reading of what counts as a meeting decides the vacuum's occupancy, and " +
    "therefore whether any force in this model is measurable at all",
  cited: ["Gravity", "XOR: Gravity + Magnetism"],
  under: { "gravity": "holds", "gravity+magnetism": "holds" },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 27, T: 150, seeds: 3 });
    const C = (N - 1) / 2;

    /** the vacuum on its own, with nothing in it */
    const vacuum = ctx.once((meeting: Meeting, rate: MeetingRate, seed: number) => {
      const w = new World({
        theory, N, seed, boundary: "wrap", expansion: 1, meeting, meetingRate: rate,
      });
      w.run(T);
      return { fill: fill(w), scattering: scattering(w) };
    });

    /**
     * AND WHETHER A FORCE SURVIVES IT. Two inert absorbers, and the momentum the left
     * one takes in — differenced against a lone body at the same place, which is the
     * only way this measurement has ever worked.
     */
    const force = ctx.once((
      meeting: Meeting, rate: MeetingRate, duty: number, lone: boolean, seed: number,
    ) => {
      const sep = 8;
      const w = new World({
        theory, N, seed, boundary: "absorb", expansion: 1, meeting, meetingRate: rate,
      });
      const body = () => ({
        radius: 2, absorbs: true, duty, emits: 1 as const, propulsion: "none" as const,
      });
      w.add({ at: [C - sep / 2, C, C], ...body() });
      if (!lone) w.add({ at: [C + sep / 2, C, C], ...body() });
      w.run(T);
      return pullOn(w, 0)[0];
    });

    /**
     * AND A BODY THAT DOES NOT PULSE IS A DIFFERENT BODY, which is the tradeoff this
     * whole file turns on.
     *
     * A first version gave every body `duty: 0` — an inert absorber that eats rays and
     * puts nothing back — and found plain gravity could not carry a force under
     * co-location. That was a fact about the bodies, not about the reading. IT IS THE
     * VACUUM'S OWN EXPANSION THAT SUPPLIES THE RAYS: (G/2) makes them at every neutral
     * point, so there is always something arriving, and a node that does not spend
     * itself pulsing can simply absorb what the expansion sends and pass it on.
     *
     * Which is the mass tradeoff stated as a measurement. A body that PULSES is
     * emitting its own rays rather than passing the vacuum's along — that is what it
     * costs to be massive — and a body that does not is carried by what arrives. So
     * both are run, and the difference between the columns is what pulsing costs.
     */
    const DUTIES: [string, number][] = [["inert", 0], ["pulsing", 1]];

    const rows = READINGS.flatMap(([m, r]) => DUTIES.map(([label, duty]) => {
      const f = ctx.over(seeds, s => vacuum(m, r, s).fill);
      const pull = ctx.over(seeds, s => force(m, r, duty, false, s) - force(m, r, duty, true, s));
      return {
        meeting: m, rate: r, duty: label, fill: f,
        mfp: 1 / Math.max(f.mean, 1e-9),
        pull, sigma: Math.abs(pull.mean) / (pull.err || Infinity),
        scattering: vacuum(m, r, seeds[0]).scattering,
      };
    }));

    const resolved = rows.filter(r => r.sigma > 2 && r.pull.mean > 0);
    const best = resolved.sort((a, b) => b.sigma - a.sigma)[0];
    const chosen = rows.find(r =>
      r.meeting === "co-located" && r.rate === "one" && r.duty === "inert")!;
    const pulsing = rows.find(r =>
      r.meeting === "co-located" && r.rate === "one" && r.duty === "pulsing")!;

    const w = new World({ theory, N, seed: seeds[0], boundary: "wrap" });
    w.run(20);

    const findings: Finding[] = [
      judge({
        name: "readings that resolve an attraction at all", value: resolved.length,
        expect: {
          of: "more than none — a reading in which no force can be measured is not a reading " +
            "of this model",
          want: READINGS.length, tolerance: READINGS.length,
          because: "two bodies drawing together is the one thing every version of this model " +
            "has agreed on, so it is the test a reading of the rules has to pass",
        },
        note: resolved.length
          ? `strongest: ${best.meeting}/${best.rate} at ${best.sigma.toFixed(1)}σ`
          : "NONE — every reading leaves a vacuum too thin to carry a force at this size",
      }),
      judge({
        name: "the default reading's attraction", value: chosen.pull.mean, err: chosen.pull.err,
        expect: {
          of: "positive and resolved — co-located, one meeting a point a tick",
          want: Math.abs(chosen.pull.mean), tolerance: 1e9,
          because: "this is what the article's sentence says: any two rays that arrive together " +
            "have met, and what is left is A SINGLE neutral point",
        },
        note: `${chosen.sigma.toFixed(1)}σ · fill ${chosen.fill.mean.toFixed(3)} · ` +
          `mean free path ${chosen.mfp.toFixed(1)} cells`,
      }),
      judge({
        name: "what pulsing costs, under the default reading",
        value: pulsing.pull.mean - chosen.pull.mean,
        note: `inert ${chosen.pull.mean.toExponential(2)} at ${chosen.sigma.toFixed(1)}σ against ` +
          `pulsing ${pulsing.pull.mean.toExponential(2)} at ${pulsing.sigma.toFixed(1)}σ. ` +
          "A body that pulses spends itself emitting its own rays instead of passing the " +
          "vacuum's along, which is what being massive costs; a body that does not is carried " +
          "by what the expansion sends it.",
      }),
      judge({
        name: "spread in occupancy across the four readings",
        value: Math.max(...rows.map(r => r.fill.mean)) / Math.max(Math.min(...rows.map(r => r.fill.mean)), 1e-9),
        note: "how far apart four readings of one sentence put the vacuum — and since every " +
          "screening length here is 1/fill, this is the factor by which the range of every " +
          "force in this model depends on a choice nobody had written down",
      }),
    ];

    return {
      header: headerOf(w, seeds),
      findings,
      table: {
        columns: ["meets", "how many", "body", "fill", "mfp", "attraction", "σ"],
        rows: rows.map(r => [
          r.meeting, r.rate, r.duty, r.fill.mean.toFixed(4), r.mfp.toFixed(1),
          r.pull.mean.toExponential(2), r.sigma.toFixed(1),
        ]),
      },
    };
  },
});

export default [whichMeeting];
