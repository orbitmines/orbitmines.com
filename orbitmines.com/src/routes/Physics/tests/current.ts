/**
 * CURRENT — what sources the turn axis, and whether the source lasts long enough to
 * be one.
 *
 * The port of `todo/provenance/magnetic.ts` §5–§6, which are the two halves of a single
 * question and were written as though they were two results.
 *
 * §5 CLOSES A HOLE THE ARC OPENED ITSELF. `faraday` §3 finds that the turn axis cannot
 * be a local function of the rays at a cell: the distribution offers ρ, J and F, so
 * J × F is the only pseudovector available and it vanishes for a one-polarity source.
 * §5's answer is not another pseudovector, it is that `turnRing` TAKES A PLANE — one of
 * whose directions is the incoming heading — so what the cell has to supply is a single
 * vector, and it has exactly one: J = Σ σ n(d̂,σ) d̂. Which is the original hypothesis
 * put where it works. A polarity discrepancy that moves is not the magnetic field, it is
 * the CURRENT that sources it, and that is the relation ρ and J have to E and B in
 * Maxwell arrived at from the other end.
 *
 * §6 IS THEN LOAD-BEARING RATHER THAN INCIDENTAL, which is the move worth naming: once J
 * is the source, "does a polarity discrepancy survive the vacuum" stops being a curiosity
 * and becomes whether the model has a magnetic field at all. So run the three rules and
 * watch one.
 *
 * WHAT THIS PORT CHANGED, and both changes are the same change:
 *
 *   THE OLD §5 WROTE THE TWENTY-SIX CUBIC EXITS IN AS ARITHMETIC and reported |J| =
 *     8.6667 for a drift of I = 0.5. That number is 2I·DEG/3 and the DEG/3 is Σd̂⊗d̂ =
 *     (DEG/3)·δ, so it is a statement about a lattice and not about a current. Off the
 *     geometry it is 4 on fcc 12, and it is DECLARED here from the trace identity rather
 *     than recorded.
 *   THE OLD §6 RAN A BESPOKE 2D AUTOMATON — eight headings written as `3² − 1`, an
 *     occupancy set by hand, a vacuum that was a parameter rather than a balance. This
 *     runs `World` under `labelled`, in three dimensions, where the occupancy is what the
 *     expansion rate and annihilation settle on between them and `fill` reports it. The
 *     sweep knob is therefore the vacuum's OWN rate and not a fitted density.
 *
 * THE TAG IS THE LABEL CHANNEL AND THAT IS NOT A TRICK. Without telling the injected
 * charges from the vacuum they were injected into, this measures the vacuum's own
 * fluctuation, which at any interesting occupancy is the larger number. `label` is
 * carried through deflection and initialised to 0 on anything the expansion makes, so
 * "carries a label" is exactly "was put here by hand" — and it is the same channel that
 * makes B, so the tag and the physics are one field.
 */

import {
  World, Vec, Geometry, LABELLED, fieldB, fill, mediumAt, headerOf, judge,
  dot, unit, norm, cross, scale, add, Finding,
} from "../DISCRETE";
import { test } from "../SUITE";

/* ── §5 ─────────────────────────────────────────────────────────────────────── */

/**
 * The first moment of a polarity distribution over the exits — the article's
 * J = Σ σ n(d̂,σ) d̂, with n given as a count per exit per sign.
 */
const momentJ = (g: Geometry, plus: number[], minus: number[]): Vec => {
  const out = new Array(g.D).fill(0);
  for (let d = 0; d < g.DEG; d++)
    for (let i = 0; i < g.D; i++) out[i] += (plus[d] - minus[d]) * g.U[d][i];
  return out;
};

/**
 * A LINE CURRENT SUMMED OVER ITS OWN ELEMENTS, not a formula applied.
 *
 * Each element contributes what `fieldB` reads — d̂ × u, the arriving heading crossed
 * with what the emitter was doing — falling as 1/R² because that is the emission's own
 * fall-off, which the gravity arc derived and this inherits. The 1/r that comes out is
 * therefore a consequence of a result the book already had rather than a new one, and it
 * is said here rather than claimed.
 */
const lineCurrent = (rPerp: number, u: Vec, half = 20000): Vec => {
  let B: Vec = [0, 0, 0];
  for (let z = -half; z <= half; z++) {
    const sep: Vec = [rPerp, 0, -z];
    const R = norm(sep);
    if (R < 1e-9) continue;
    B = add(B, scale(cross(unit(sep), u), 1 / (R * R)));
  }
  return B;
};

const angle = (a: Vec, b: Vec) =>
  Math.acos(Math.min(1, Math.abs(dot(unit(a), unit(b))))) * 180 / Math.PI;

export const sourcesTheAxis = test({
  id: "magnetism/current-as-source",
  claims: "J is the one vector a cell has to hand `turnRing` a plane with — so a static " +
    "charge gets no axis, a drifting one gets an axis that reverses with the drift, and a " +
    "line of them gives B ∝ 1/r at right angles to both",
  cited: ["Electromagnetism — and it is structural, which is the useful part"],
  under: { "labelled": "holds" },
  exact: true,                    // moments over a fixed exit set and one lattice sum
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 5 });
    const g = w.geometry;
    const I = 0.5;

    /* a net polarity with NO drift: more + than − in every direction alike */
    const flatPlus = g.U.map(() => 1.5), flatMinus = g.U.map(() => 1);
    const jStatic = momentJ(g, flatPlus, flatMinus);

    /* and a drift along +z: the + population leans one way and the − population the other */
    const drift = (s: number) => ({
      plus: g.U.map(d => 1 + s * I * (d[2] ?? 0)),
      minus: g.U.map(d => 1 - s * I * (d[2] ?? 0)),
    });
    const fwd = drift(+1), rev = drift(-1);
    const jCur = momentJ(g, fwd.plus, fwd.minus);
    const jRev = momentJ(g, rev.plus, rev.minus);

    /*
     * WHAT |J| HAS TO BE, and it is not a measurement of this construction but of the
     * exit set. J = Σ_d 2 I d_z d̂ = 2I (Σ d̂⊗d̂) ẑ, and Σ d̂⊗d̂ = (DEG/3)·δ on any
     * lattice whose exits have cubic symmetry — which is the identity `relax` §1 and
     * `geometry/derived-constants` both rest on.
     */
    const predicted = 2 * I * g.DEG / 3;

    /* the line current, with a unit drift so what is read is the geometry factor alone */
    const zhat: Vec = [0, 0, 1];
    const rows = [5, 10, 20, 40, 80].map(r => {
      const B = lineCurrent(r, zhat);
      return { r, mag: norm(B), prod: norm(B) * r, toZ: angle(B, zhat), toR: angle(B, [1, 0, 0]) };
    });
    const spread = Math.max(...rows.map(x => x.prod)) / Math.min(...rows.map(x => x.prod));
    const worstAngle = Math.max(...rows.flatMap(x => [Math.abs(x.toZ - 90), Math.abs(x.toR - 90)]));

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "|J| of a net polarity with no drift", value: norm(jStatic),
          expect: {
            of: "0 — A STATIC CHARGE MAKES NO MAGNETIC FIELD", want: 0, tolerance: 1e-12,
            because: "J is a FIRST moment and a polarity excess spread evenly over the exits has " +
              "none: the lattice's exits come in ± pairs, so an isotropic excess cancels term by " +
              "term. This is the whole qualitative content of Ampère's law and it costs nothing — " +
              "and it is the row that has to hold exactly rather than nearly, since a charge at " +
              "rest with a small field would be a different theory",
          },
        }),
        judge({
          name: "|J| of the same charges set drifting", value: norm(jCur),
          expect: {
            of: `2·I·DEG/3 = ${predicted.toFixed(4)} — the trace identity, not a fit`,
            want: predicted, tolerance: 1e-12,
            because: "Σ_d d_z d̂ is the ẑ column of Σ d̂⊗d̂, which is (DEG/3)·δ for a cubic exit " +
              "set. So the old file's 8.6667 was 2·0.5·26/3 and a fact about cubic 26 rather than " +
              "about currents; on this geometry the same construction gives a different number " +
              "and the identity is what is checked",
          },
          note: `along [${unit(jCur).map(x => x.toFixed(2)).join(",")}]`,
        }),
        judge({
          name: "Ĵ · Ĵ with the drift reversed", value: dot(unit(jCur), unit(jRev)),
          expect: {
            of: "−1 — the axis reverses with the current", want: -1, tolerance: 1e-12,
            because: "b̂ ∝ J, so reversing the current reverses the plane `turnRing` is handed " +
              "and therefore the sense of the turn. Which is the sign structure a magnetic field " +
              "has, obtained without anything being put in by hand",
          },
        }),
        judge({
          name: "|B|·r over r = 5 … 80, worst ratio", value: spread,
          expect: {
            of: "1 — B ∝ 1/r for a line current", want: 1, tolerance: 1e-4,
            because: "summed over the current's own elements rather than by applying Ampère's " +
              "law. THE 1/R² INSIDE THE SUM IS INHERITED and not established here — it is the " +
              "emission's own fall-off from the gravity arc — so the 1/r is a consequence of a " +
              "result the book already had. What is new is only that summing it gives the right " +
              "power and not that the power exists",
          },
          note: `|B|·r ≈ ${rows[0].prod.toFixed(6)}, which is the 2 of an infinite line`,
        }),
        judge({
          name: "worst departure from 90° to both ẑ and r̂", value: worstAngle, units: "°",
          expect: {
            of: "0 — Ampère's law with the right geometry", want: 0, tolerance: 1e-3,
            because: "d̂ × u is perpendicular to both by construction, so this row is not a " +
              "discovery about the sum; it is the check that the sum was taken about the axis it " +
              "was meant to be and that the far elements have not tilted it",
          },
        }),
      ],
      table: {
        columns: ["r (cells)", "|B|", "|B|·r", "∠(B,ẑ)", "∠(B,r̂)"],
        rows: rows.map(x => [
          x.r, x.mag.toExponential(4), x.prod.toFixed(6),
          x.toZ.toFixed(2) + "°", x.toR.toFixed(2) + "°",
        ]),
      },
    };
  },
});

/* ── §6 ─────────────────────────────────────────────────────────────────────── */

type Survey = { j: number; n: number; front: number; turns: number };

/**
 * Inject a current with no net charge, and TAG IT.
 *
 * ONE CHARGE PER CELL, WHICH IS NOT A DETAIL. A first version put + on every up-exit of
 * every cell in the ball and − on every down-exit, which is neutral and carries J — and
 * annihilates almost entirely on the first tick, because a cell's up-ray and its
 * neighbour's down-ray meet head on by construction. It reported a carrier count of
 * exactly nought and a current that had not so much failed to survive as failed to
 * exist. Exact zeros across a sweep mean an empty box.
 *
 * So each cell carries ONE charge: + heading up the axis or − heading down it, drawn at
 * random. ρ = 0 in expectation and J = Σ σ d̂ points along the axis, and the two
 * populations meet at the rate the rules give rather than at the rate the layout forced.
 *
 * Each ray carries the label its emitter would have given it — u = I ẑ for the +
 * population and −I ẑ for the −, so σu is the SAME for both and the labels ADD where
 * the charges cancel, which is what makes a neutral wire magnetic and is how
 * `magnetostatics` builds one.
 */
const inject = (w: World, radius: number, I: number, seed: number) => {
  const g = w.geometry, C = (w.opts.N - 1) / 2;
  const up: number[] = [], down: number[] = [];
  for (let d = 0; d < g.DEG; d++) {
    const z = g.U[d][2] ?? 0;
    if (z > 1e-9) up.push(d); else if (z < -1e-9) down.push(d);
  }
  /* mulberry32 — a decent small generator, and not the LCG whose low bits pair up */
  let a = (seed * 0x9e3779b9) >>> 0;
  const rnd = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  let placed = 0;
  w.backend.forEachLocal(local => {
    const p = w.backend.position(local);
    if (norm(p.map((x, i) => x - C)) > radius) return;
    const q: -1 | 1 = rnd() < 0.5 ? 1 : -1;
    const exits = q > 0 ? up : down;
    const d = exits[Math.floor(rnd() * exits.length)];
    if (w.backend.active(local, d)) return;
    w.backend.put(local, d, q);
    for (let i = 0; i < 3; i++)
      w.backend.setChannel("label", local, d, i === 2 ? q * I : 0, i);
    placed++;
  });
  return placed;
};

/** what the TAGGED population is doing — everything else in the box is vacuum */
const survey = (w: World): Survey => {
  const g = w.geometry, N = w.opts.N, C = (N - 1) / 2;
  /* the box WRAPS, so a carrier one cell past the far wall is one cell away and not N−1 */
  const away = (p: Vec) => norm(p.map((x, i) => {
    const d = Math.abs(x - C); return Math.min(d, N - d);
  }));
  const J = [0, 0, 0];
  let n = 0, front = 0, turns = 0;
  w.backend.forEachLocal(local => {
    for (let d = 0; d < g.DEG; d++) {
      if (!w.backend.active(local, d)) continue;
      let tagged = false;
      for (let i = 0; i < 3 && !tagged; i++) tagged = w.backend.channelAt("label", local, d, i) !== 0;
      if (!tagged) continue;
      const q = w.backend.charge(local, d);
      for (let i = 0; i < 3; i++) J[i] += q * (g.U[d][i] ?? 0);
      n++;
      turns += w.backend.channelAt("turns", local, d);
      front = Math.max(front, away(w.backend.position(local)));
    }
  });
  return { j: norm(J), n, front, turns };
};

export const survivesTheVacuum = test({
  id: "magnetism/current-in-vacuum",
  claims: "the current propagates at c̄ and it does not survive — what is left is not a " +
    "weakened current but noise with the same carrier count, and the rule that randomises " +
    "it is the one that CANNOT destroy it",
  cited: ["Electromagnetism — and then the vacuum does not let it live, which is the largest hole"],
  under: { "labelled": "holds" },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 61, T: 60, seeds: 3 });
    const C = (N - 1) / 2, R0 = 6, I = 0.5;

    /*
     * TWO CONFIGURATIONS, NOT A SWEEP — because there is no longer anything to sweep.
     *
     * This used to turn (G+M/2)'s rate down to three values and read the occupancy off
     * each. (G/2) fires unconditionally, so the theory has ONE vacuum density and the
     * three rows were the same run three times. What the test actually needs is the pair
     * it always needed: the current in the model's own vacuum, and the current in nothing
     * at all — the control, which is now a world with the creation rule taken out rather
     * than one with its rate set to zero.
     */
    const run = ctx.once((key: string) => {
      const [medium, seed] = key.split("/");
      const w = medium === "true"
        ? new World({ theory, N, seed: Number(seed), boundary: "wrap" })
        : mediumAt({ theory, N, seed: Number(seed), fill: 0, boundary: "wrap" });
      const placed = inject(w, R0, I, Number(seed));
      const first = survey(w);
      const hist: { t: number; s: Survey }[] = [{ t: 0, s: first }];
      for (let t = 1; t <= T; t++) { w.run(1); hist.push({ t, s: survey(w) }); }
      const last = hist[hist.length - 1].s;
      /* the front over the FIRST third, before attrition turns a speed into a survival rate */
      const early = hist[Math.floor(T / 3)];
      return {
        placed, fill: fill(w), j0: first.j, n0: first.n,
        j: last.j, n: last.n, front: last.front,
        speed: (early.s.front - first.front) / early.t / w.geometry.steps[0],
        turnsPerCarrier: last.n ? last.turns / last.n : 0,
        deflections: w.stats.deflections, annihilations: w.stats.annihilations,
      };
    });

    const at = (medium: boolean) => ({
      speed: ctx.over(seeds, s => run(`${medium}/${s}`).speed),
      ratio: ctx.over(seeds, s => run(`${medium}/${s}`).j / Math.sqrt(Math.max(run(`${medium}/${s}`).n, 1))),
      kept: ctx.over(seeds, s => run(`${medium}/${s}`).j / Math.max(run(`${medium}/${s}`).j0, 1e-12)),
      carriers: ctx.over(seeds, s => run(`${medium}/${s}`).n / Math.max(run(`${medium}/${s}`).n0, 1)),
      turns: ctx.over(seeds, s => run(`${medium}/${s}`).turnsPerCarrier),
      deflected: ctx.over(seeds, s => run(`${medium}/${s}`).deflections / Math.max(run(`${medium}/${s}`).placed, 1)),
      fill: ctx.over(seeds, s => run(`${medium}/${s}`).fill),
    });
    /*
     * TWO CONSERVATION FACTS FIRST, AND THEY PULL OPPOSITE WAYS. Both are identities on
     * the exit set rather than statistics of the run, so they cost nothing — and they are
     * what make the sweep below a mechanism instead of a decay curve.
     *
     * AND THE FIRST ONE IS NARROWER THAN THE ARC STATES, which this port found. The old
     * file ran a 2D lattice with eight exits, ALL of which lie in the one plane there is,
     * so "(G+M/3) preserves |J| pointwise" was measured where it could not fail. In three
     * dimensions a turn has a plane and the exits outside it are not rotated by it —
     * `turnTable` snaps them to the nearest exit, which is not injective, and |J| moves.
     * So the conservation law is real and it is A LAW ABOUT THE RING.
     */
    const g0 = new World({ theory, N: 5 }).geometry;
    const table = g0.turnTable(g0.ringAxis);
    const onRing = new Set(g0.RING);
    let worstOn = 0, worstOff = 0, worstRot = 0;
    for (let a = 0; a < g0.DEG; a++) for (let b = 0; b < g0.DEG; b++) {
      const A = table[a], B = table[b];
      if (A < 0 || B < 0) continue;
      /* ALIKE, so both terms of J = Σ σ d̂ carry the same σ and it factors out */
      const before = add(g0.U[a], g0.U[b]), after = add(g0.U[A], g0.U[B]);
      const d = Math.abs(norm(after) - norm(before));
      if (onRing.has(a) && onRing.has(b)) {
        worstOn = Math.max(worstOn, d);
        worstRot = Math.max(worstRot, norm(after.map((x, i) => x - before[i])));
      } else worstOff = Math.max(worstOff, d);
    }
    /* how many exits the turn COLLAPSES rather than rotates — the reason |J| moves off it */
    const image = new Set<number>();
    let collapsed = 0;
    for (let d = 0; d < g0.DEG; d++) {
      if (table[d] < 0) continue;
      if (image.has(table[d])) collapsed++; else image.add(table[d]);
    }

    /* and a head-on pair, whose two contributions ADD rather than cancel */
    let worstAnnih = 0;
    for (let d = 0; d < g0.DEG; d++) {
      const o = g0.OPP[d];
      /* σd̂ and (−σ)(−d̂): the polarity flips and so does the heading, so they agree */
      worstAnnih = Math.max(worstAnnih, norm(g0.U[d].map((x, i) => x - g0.U[o][i])));
    }

    const empty = at(false), thick = at(true);
    const w = new World({ theory, N, seed: seeds[0], boundary: "wrap"});

    const findings: Finding[] = [
      judge({
        name: "(G+M/3): worst change in |J|, both headings in the plane of the turn",
        value: worstOn,
        expect: {
          of: "0 — TURNING CANNOT CREATE OR DESTROY A CURRENT, ONLY TURN IT",
          want: 0, tolerance: 1e-12,
          because: "the conservation law the picture needs, and it holds as an IDENTITY rather " +
            "than on average. Both members of an alike pair step the same way along the same " +
            "ring, so J = Σ σ d̂ is carried by a rotation — and the ring is CLOSED under that " +
            "step, which is why snapping to the nearest exit costs nothing here. Which is " +
            "precisely what §4 says a magnetic field does to a moving charge",
        },
        note: `and it does move J: worst |ΔJ| = ${worstRot.toFixed(3)}, so this is a rotation ` +
          `and not a no-op`,
      }),
      judge({
        name: "(G+M/3): worst change in |J| with a heading OUTSIDE that plane",
        value: worstOff,
        expect: {
          of: "NOT zero — the law is a law about the ring", want: 1, tolerance: 0.5,
          because: "THE ARC STATES THIS CONSERVATION FLATLY AND IT IS NARROWER THAN THAT. It " +
            `was measured on a 2D lattice whose eight exits ALL lie in the one plane there is, ` +
            `where it could not fail. Here ${collapsed} of ${g0.DEG} exits are not rotated by ` +
            "the turn but SNAPPED to the nearest one, two of them onto one, and a map that is " +
            "not injective is not a rotation. So the identity above is exact and it is about " +
            "the exits in the plane; the rest of them lose current to the rule that was " +
            "supposed to be unable to take any",
        },
      }),
      judge({
        name: "(G+M/1): |J| destroyed per head-on annihilation", value: worstAnnih,
        expect: {
          of: "2 — the two contributions ADD, they do not cancel", want: 2, tolerance: 1e-12,
          because: "AND THIS IS NOT A HEAD-ON PAIR'S J BEING ZERO, which is the reading worth " +
            "killing. Two opposite charges closing head on carry σd̂ and (−σ)(−d̂), which are " +
            "the SAME vector — so annihilating them removes two units of J rather than nothing. " +
            "J is therefore not conserved by the rules as a whole: it decays wherever " +
            "annihilation happens, which is the ordinary statement that a current in a resistive " +
            "medium dies, and the sweep below is what that decay looks like",
        },
      }),
      judge({
        name: "front speed over the first third, in a vacuum of nothing",
        value: empty.speed.mean, err: empty.speed.err, units: "exits/tick",
        expect: {
          of: "1 — c̄, one exit a tick, and it is not a discovery", want: 1, tolerance: 0.2,
          because: "a charge advances one cell a tick BY DEFINITION, so this row cannot come out " +
            "otherwise unless the disturbance was eaten before it got anywhere. It is here " +
            "because it COULD have come out otherwise, and the rows below are only worth reading " +
            "if it did not. Taken over the first third: later the outermost carriers are the ones " +
            "most likely to have been annihilated, so the measured front becomes a survival " +
            "statistic rather than a speed. IN EXITS AND NOT IN CELLS: fcc 12's steps are √2 " +
            "cells long, so a speed quoted in cells would be a fact about the lattice constant. " +
            "It is a lower bound either way — the front is a max over headings and a ray leaving " +
            "obliquely covers less ground radially than one leaving straight out",
        },
      }),
      judge({
        name: "|J|/√n with no vacuum at all",
        value: empty.ratio.mean, err: empty.ratio.err,
        expect: {
          of: "≫ 1 — COHERENT, which is the control", want: 0, atLeast: 3,
          because: "|J|/√n IS THE QUANTITY TO READ AND THE RAW FRACTION IS NOT. Carriers pointing " +
            "at RANDOM give |J| ≈ √n, so the ratio is about 1 for noise and climbs towards √n as " +
            "they line up — it separates attrition from randomisation, which |J|/|J₀| cannot. " +
            "With nothing to meet, the current still loses carriers to its own two halves closing " +
            "head on, and this row says what is left is still a current",
        },
        note: `|J|/√n = ${empty.ratio.mean.toFixed(1)} at fill ${empty.fill.mean.toFixed(4)}`,
      }),
      judge({
        name: "is what is left in a real vacuum NOISE",
        value: thick.ratio.mean < 3 ? 1 : 0,
        expect: {
          of: "1 — |J|/√n falls to order 1, which is carriers pointing at random",
          want: 1, tolerance: 0,
          because: "THE CURRENT DOES NOT SURVIVE, and this is the row that says so. Stated as a " +
            "ONE-SIDED AND SO A BOUND RATHER THAN A BAND: the arc's number is 0.8 to 1.7 " +
            "against a coherent 17 to 25, and any of those is 'noise', so a band wide enough " +
            "to span them would also admit a current that had held together",
        },
        note: `${thick.ratio.mean.toFixed(2)} at fill ${thick.fill.mean.toFixed(4)}, against ` +
          `${empty.ratio.mean.toFixed(1)} with no vacuum — and at fill ` +
          `${thick.fill.mean.toFixed(4)} there is nothing left to take a ratio of`,
      }),
      judge({
        name: "does |J| fall FASTER than the carrier count",
        value: thick.kept.mean < thick.carriers.mean ? 1 : 0,
        expect: {
          of: "1 — so this is not simply attrition", want: 1, tolerance: 0,
          because: "if the vacuum merely ATE carriers, the survivors would still be lined up and " +
            "|J| would track the count. It falls further, so the survivors are pointing at " +
            "random — which is the difference between a weakened current and no current, and it " +
            "is the whole negative result",
        },
        note: `|J| kept ${(100 * thick.kept.mean).toFixed(1)}%, carriers kept ` +
          `${(100 * thick.carriers.mean).toFixed(1)}%`,
      }),
      /*
       * AND WHICH RULE DID IT, reported rather than predicted.
       *
       * The arc names (G+M/3) and not (G+M/1) as the mechanism, which is the part worth
       * naming: turning CONSERVES |J| pointwise — a rotation cannot change the length of
       * a sum of vectors it rotates together — but it conserves it by rotating each pair
       * through SPIN, and a carrier that has turned an unrelated number of times is
       * uncorrelated with one that has not. THE RULE THAT CANNOT DESTROY A CURRENT IS
       * WHAT RANDOMISES IT. No expectation is declared: the arc gives no figure for how
       * many turns a carrier takes, and inventing one to pass would be fitting.
       */
      {
        name: "(G+M/3) firings per charge injected, at fill " + thick.fill.mean.toFixed(3),
        value: thick.deflected.mean, err: thick.deflected.err,
        note: `${thick.deflected.mean.toFixed(2)} against ${empty.deflected.mean.toFixed(2)} with ` +
          `no vacuum. THE DIAGNOSTIC THAT SAYS WHETHER THE NULL RESULT IS A RESULT: if the ` +
          `vacuum never turned anything, "the survivors are pointing at random" would be a ` +
          `statement about annihilation and not about turning. No expectation is declared — the ` +
          `arc names the mechanism and gives no figure for how often it fires, and inventing ` +
          `one to pass would be fitting`,
      },
    ];

    return {
      header: headerOf(w, seeds),
      findings,
      table: {
        columns: ["vacuum", "fill", "|J|/|J₀|", "carriers", "|J|/√n", "turns/injected"],
        rows: [["none at all", empty.fill, empty.kept, empty.carriers, empty.ratio, empty.deflected],
        ["the model's own", thick.fill, thick.kept, thick.carriers, thick.ratio, thick.deflected],
        ].map(r => [r[0] as string,
        (r[1] as any).mean.toFixed(4), (r[2] as any).mean.toFixed(3),
        (r[3] as any).mean.toFixed(3), (r[4] as any).mean.toFixed(2), (r[5] as any).mean.toFixed(2)]),
      },
    };
  },
});

export default [sourcesTheAxis, survivesTheVacuum];
