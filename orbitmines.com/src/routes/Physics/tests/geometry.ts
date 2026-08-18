/**
 * THE GEOMETRY — whether the lattice's grain survives its own vacuum.
 *
 * `geometry`'s table calls the model's cubic 26 veined, with a rank-four anisotropy
 * of 49.7% and light 1.73× faster along a body diagonal — and calls the second a
 * prediction, and a bad one, since a 73% anisotropy in c̄ is refuted by every
 * interferometer ever built. Its three repairs all change the LATTICE.
 *
 * BUT EVERY ONE OF THOSE NUMBERS IS A PROPERTY OF THE NEIGHBOUR SET ALONE. Σ w c⊗c⊗c⊗c
 * is the momentum flux of a gas whose carriers stream FOR EVER, and the √3 is the
 * shape of a ray that has never met anything. In this model a ray does not stream
 * for ever: it meets something every few cells, and a ray that has been turned is on
 * a different exit from the one it left on.
 *
 * SO IT IS A MEASUREMENT, AND IT IS ONLY A MEASUREMENT IF THE VACUUM SCATTERS. An
 * earlier attempt at this ran (G+M/2) as "fire only in a completely neutral cell",
 * which self-limits near a tenth of the derived occupancy — the diagnostic said 0.07
 * deflections per surviving ray, so nothing had scattered and no conclusion followed
 * either way. `scattering` is reported here for exactly that reason.
 */

import {
  World, GEOMETRIES, l, headerOf, judge, stat, norm, sub, dot, exponent, fill,
  scattering, Theory, Finding,
} from "../DISCRETE";
import { test, DEFAULT_SEEDS } from "../SUITE";

/** the three families of direction on a cubic lattice, which is where a vein shows */
const FAMILIES: [string, number[]][] = [
  ["⟨100⟩ axis", [1, 0, 0]], ["⟨110⟩ face", [1, 1, 0]], ["⟨111⟩ body", [1, 1, 1]],
];

export const veins = test({
  id: "geometry/veins",
  claims: "the lattice's grain is a collisionless artefact — a field measured through " +
    "the model's own vacuum is rounder than the neighbour set is",
  cited: ["Electromagnetism — and the veins"],
  under: {
    "gravity+magnetism": "holds",
    "gravity": "holds",
  },
  run: (ctx, theory) => {
    const { N, T, seeds } = ctx.budget({ N: 41, T: 120, seeds: 3 });
    const C = (N - 1) / 2, centre = [C, C, C];
    const radii = [6, 10, 14].filter(r => r < C - 2);

    /** the field down a narrow cone about each family, differenced against no body */
    const spread = ctx.once((expansion: number, seed: number) => {
      const mk = (withBody: boolean) => {
        const w = new World({ theory, N, seed, boundary: "absorb", expansion });
        if (withBody) w.add({ at: centre, radius: 2, emits: 1 });
        return w.run(T);
      };
      const b = mk(true), v = mk(false);
      const byFamily = radii.map(r => FAMILIES.map(([, f]) => {
        const u = f.map(x => x / norm(f));
        let s = 0, n = 0;
        b.backend.forEachLocal(k => {
          if (b.isSource(k)) return;
          const d = sub(b.backend.position(k), centre), rr = norm(d);
          if (Math.abs(rr - r) > 0.6 || rr < 1e-9) return;
          const cs = Math.abs((d[0] * u[0] + d[1] * u[1] + d[2] * u[2]) / rr);
          if (cs < 0.955) return;
          // the deficit: how many of a local's rays failed to arrive
          s += (b.DEG - l.rays(b, k).length) - (v.DEG - l.rays(v, k).length); n++;
        });
        return n ? s / n : NaN;
      }));
      return { byFamily, fill: fill(b), scattering: scattering(b) };
    });

    const anisotropyAt = (expansion: number, ri: number) => ctx.over(seeds, s => {
      const v = spread(expansion, s).byFamily[ri];
      if (!v || !v.every(isFinite)) return NaN;
      const mean = v.reduce((a, b2) => a + b2, 0) / v.length;
      return Math.abs(mean) < 1e-9 ? NaN : (Math.max(...v) - Math.min(...v)) / Math.abs(mean);
    });

    // the middle radius that survives the box — a quick run may keep only one
    const ri = Math.min(1, radii.length - 1);
    const bare = anisotropyAt(0, ri);
    const dense = anisotropyAt(0.05, ri);
    const diag = spread(0.05, seeds[0]);

    const w = new World({ theory, N, seed: seeds[0], boundary: "absorb" });
    w.add({ at: centre, radius: 2, emits: 1 });
    w.run(T);

    const findings: Finding[] = [
      judge({
        name: "deflections per surviving ray", value: diag.scattering,
        expect: {
          of: "well above zero, or nothing below means anything",
          want: 1, tolerance: 10,
          because: "if rays are not being turned then the front is the collisionless one " +
            "whatever the density says, and no conclusion about the grain follows either way",
        },
        note: "THE DIAGNOSTIC THAT KEEPS A NULL RESULT FROM BEING VACUOUS. An earlier " +
          "attempt read 0.07 here and its answer was worthless.",
      }),
      judge({
        name: "anisotropy, no vacuum at all", value: bare.mean, err: bare.err,
        note: "the collisionless limit, which is what the geometry table computes",
      }),
      judge({
        name: "anisotropy, the model's own vacuum", value: dense.mean, err: dense.err,
        expect: {
          of: "smaller than the collisionless one — the medium rounds the field",
          want: 0, tolerance: Math.max(Math.abs(bare.mean), 1e-9),
          because: "a ray that has been turned is on a different exit from the one it left on, " +
            "so the direction a disturbance travels is not the direction any ray travels",
        },
      }),
    ];

    return {
      header: headerOf(w, seeds),
      findings,
      table: {
        columns: ["r", ...FAMILIES.map(f => f[0]), "spread"],
        rows: radii.map((r, i) => {
          const v = spread(0.05, seeds[0]).byFamily[i];
          if (!v || !v.every(isFinite)) return [r, "—", "—", "—", "—"];
          const mean = v.reduce((a, b2) => a + b2, 0) / v.length;
          return [r, ...v.map(x => x.toExponential(3)),
            (100 * (Math.max(...v) - Math.min(...v)) / Math.abs(mean || 1)).toFixed(1) + "%"];
        }),
      },
    };
  },
});

/**
 * The constants themselves, derived rather than written down — which is the whole
 * point of the geometry object and is worth asserting, because the article's table
 * was arrived at by hand and any of it could have been wrong.
 */
export const constants = test({
  id: "geometry/derived-constants",
  claims: "DEG, SHEET, CYCLE, SPIN and the moments come out of the exits rather than " +
    "being written down, and reproduce the article's table",
  cited: ["Gravity — movement", "Electromagnetism — the model is not one geometry"],
  under: { "gravity": "holds" },
  exact: true,                    // a counting fact: no box, no ticks, no seeds
  run: (_ctx, theory) => {
    const rows = Object.values(GEOMETRIES).map(g => [
      g.name, g.DEG, g.SHEET, g.CYCLE,
      g.CYCLE ? (360 / g.CYCLE).toFixed(0) + "°" : "—",
      (100 * g.moment(4).anisotropy).toFixed(1) + "%",
      g.cAnisotropy.toFixed(2) + "×",
      g.veined ? "veined" : "round",
    ]);
    const cubic = GEOMETRIES["cubic-26"], fcc = GEOMETRIES["fcc-12"], bcc = GEOMETRIES["bcc-8"];
    const w = new World({ theory, N: 7 });
    return {
      header: headerOf(w),
      findings: [
        judge({ name: "cubic-26 DEG", value: cubic.DEG,
          expect: { of: "3^D − 1", want: 26, tolerance: 0, because: "every non-zero offset in {−1,0,1}^D" } }),
        judge({ name: "cubic-26 SHEET", value: cubic.SHEET,
          expect: { of: "DEG(D−1) = 3^(D−1) − 1", want: 8, tolerance: 0,
            because: "the exits perpendicular to a face axis — one dimension fewer" } }),
        judge({ name: "cubic-26 Σd̂⊗d̂", value: cubic.moment(2).diagUnit,
          expect: { of: "DEG/D exactly", want: 26 / 3, tolerance: 1e-9,
            because: "cubic symmetry makes the second moment isotropic identically, which is " +
              "why the inverse-square law was never in danger on any candidate geometry" } }),
        judge({ name: "FCC CYCLE", value: fcc.CYCLE,
          expect: { of: "6 — a hexagonal ring about a body diagonal", want: 6, tolerance: 0,
            because: "FCC's exit axes have two and its cube axes four, but its body diagonals six" } }),
        judge({ name: "BCC equator", value: bcc.SHEET,
          expect: { of: "0 — no ring to put a phase on", want: 0, tolerance: 0,
            because: "gravity would work on BCC and charge as this book writes it could not exist" },
          note: `admitting face-diagonal axes would give it ${bcc.alternatives.withFaceDiagonals}, ` +
            "which is a reading the article does not take and this records rather than hides" }),
      ],
      table: {
        columns: ["geometry", "DEG", "SHEET", "CYCLE", "SPIN", "rank 4", "c aniso", "field"],
        rows,
      },
    };
  },
});

/**
 * THE EXITS SORTED BY A NORTH — which is the counting the Layer-2 arc reads its ring
 * off, and it is a DIFFERENT ring for each class of axis.
 *
 * The article quotes the face-axis reading — nine, eight, nine — and takes the eight
 * as "the equator". But a cubic lattice has three classes of axis and they sort
 * their exits differently, so which ring a phase lives on depends on which axis the
 * source is oriented along. That is a fact about the lattice rather than about the
 * model, and it is computed here rather than restated.
 */
export const exits = test({
  id: "geometry/exits-by-axis",
  claims: "the exits of a lattice sort into a +, an equator and a − about any axis, and the " +
    "equator is a different size for each class of axis",
  cited: ["Layer 2: Matter", "Gravity — the two counts it is read against"],
  under: { "gravity": "holds" },
  exact: true,                    // a counting fact: no box, no ticks, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 7 });
    const g = w.geometry;

    /** the three classes of axis on a cubic lattice, by how many components they use */
    const AXES: [string, number[]][] = [
      ["⟨100⟩ face", [1, 0, 0]],
      ["⟨110⟩ edge", [1, 1, 0]],
      ["⟨111⟩ corner", [1, 1, 1]],
    ];
    const sorted = AXES.map(([name, a]) => {
      const u = a.map(x => x / Math.hypot(...a));
      let plus = 0, minus = 0;
      const eq = g.equator(u).length;
      for (let d = 0; d < g.DEG; d++) {
        const c = dot(g.U[d], u);
        if (c > 1e-9) plus++; else if (c < -1e-9) minus++;
      }
      return { name, plus, eq, minus, total: plus + eq + minus };
    });

    const face = sorted[0];
    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "every exit is accounted for, every axis",
          value: sorted.every(x => x.total === g.DEG) ? 1 : 0,
          expect: { of: "1 — a north sorts the exits into exactly three groups", want: 1, tolerance: 0,
            because: "an exit is above the plane, in it, or below it, and there is no fourth case" },
        }),
        judge({
          name: "the two hemispheres are equal, every axis",
          value: sorted.every(x => x.plus === x.minus) ? 1 : 0,
          expect: { of: "1 — every exit has its opposite", want: 1, tolerance: 0,
            because: "which is the one thing the three rules demand of a geometry, since a " +
              "head-on pair has to exist for them to act on" },
        }),
        judge({
          name: "face-axis equator", value: face.eq,
          expect: { of: "SHEET — the ring the Layer-2 arc is built on", want: g.SHEET, tolerance: 0,
            because: "the equator of a face axis is every way out with no component along it, " +
              "which is every way out of a point in one dimension fewer" },
        }),
        judge({
          name: "distinct equator sizes over the axis classes",
          value: new Set(sorted.map(x => x.eq)).size,
          expect: {
            of: "2 — a face axis and an edge axis agree, a body diagonal does not",
            want: 2, tolerance: 0,
            because: "the arc quotes the face-axis reading and calls it THE equator, which is " +
              "the one two of the three classes agree on; a source along a body diagonal has a " +
              "SMALLER ring to put a phase on, so the quantum it carries is not the arc's 45°",
          },
          note: "measured rather than assumed — the first version of this expected three " +
            "distinct rings, which the lattice does not have",
        }),
      ],
      table: {
        columns: ["axis", "+ side", "equator", "− side", "total"],
        rows: sorted.map(x => [x.name, x.plus, x.eq, x.minus, x.total]),
      },
    };
  },
});

/**
 * A FIXED COUNT OF CHARGES OVER A SHELL THAT GROWS — which is the whole of the
 * inverse-square law, and is arithmetic rather than a simulation.
 *
 * The article derives 1/R^(D−1) by spreading SHEET rays over a shell. How much shell
 * there is at radius R is a property of the geometry, and so is how much of it one
 * ray covers; the law is the ratio. Computing it here means the exponent quoted in
 * the prose and the exponent the geometry actually has cannot drift apart.
 */
export const shells = test({
  id: "geometry/shells",
  claims: "a fixed emission over a shell that grows as R^(D−1) gives the inverse-square law, " +
    "and the exponent is the geometry's rather than a constant",
  cited: ["Gravity — movement", "Gravity — the two counts it is read against"],
  under: { "gravity": "holds" },
  exact: true,                    // a counting fact: no box, no ticks, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 7 });
    const g = w.geometry;
    const radii = [2, 4, 8, 16, 32];

    /** how many locals sit at radius R — the shell, counted rather than assumed */
    const shellAt = (R: number) => {
      let n = 0;
      const lim = Math.ceil(R) + 2;
      for (let x = -lim; x <= lim; x++) for (let y = -lim; y <= lim; y++)
        for (let z = -lim; z <= lim; z++) {
          const r = Math.hypot(x, y, z);
          if (Math.abs(r - R) <= 0.5) n++;
        }
      return n;
    };
    const counts = radii.map(shellAt);
    const exp = exponent(radii, counts);

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "shell exponent", value: exp,
          expect: {
            of: "D−1 — the surface of a ball in D dimensions", want: g.D - 1, tolerance: 0.1,
            because: "a shell is a surface, and a surface in D dimensions grows as R^(D−1)",
          },
        }),
        judge({
          name: "the intensity exponent that follows", value: -exp,
          expect: {
            of: "−(D−1) — a fixed emission divided by a growing shell",
            want: -(g.D - 1), tolerance: 0.1,
            because: "SHEET rays are sent out however far they go, so what arrives per local " +
              "is that count over the shell — which IS the inverse-square law in D = 3",
          },
        }),
      ],
      table: {
        columns: ["R", "locals on the shell", "per ray", "× R^(D−1)"],
        rows: radii.map((R, i) => [
          R, counts[i], (g.SHEET / counts[i]).toExponential(3),
          ((g.SHEET / counts[i]) * Math.pow(R, g.D - 1)).toFixed(3),
        ]),
      },
    };
  },
});

/**
 * DOES ONE ROTATION OF THE SHEET REACH EVERYWHERE?
 *
 * The article's derivation of the inverse-square law rests on a fixed count of rays
 * spread over a shell, and the reason that count is SHEET rather than l.DEG is that
 * the sheet TURNS: "in order to cover our whole space, we'll be rotating this sheet
 * in one more dimension than it's defined". A sheet that reached only part of the
 * space would be emitting into a cone, and the law it gives would be about that cone
 * rather than about a sphere.
 *
 * SO IT IS A CLAIM AND IT CAN BE COUNTED. Turn the sheet about an axis lying in it —
 * which is what tilts the plane rather than mapping it onto itself — and see how many
 * of the lattice's exits are visited over a full cycle. Every admissible axis is
 * tried and the best is reported, since a geometry should not be failed for a badly
 * chosen one.
 */
export const sheetCoverage = test({
  id: "geometry/sheet-coverage",
  claims: "one rotation of the sheet reaches every exit, which is what fixes the emission " +
    "at SHEET rays rather than at l.DEG",
  cited: ["Gravity — movement"],
  under: { "gravity": "holds" },
  exact: true,                    // a counting fact: no box, no ticks, no seeds
  run: (_ctx, theory) => {
    const w = new World({ theory, N: 7 });

    const coverage = (g: typeof w.geometry) => {
      const base = g.equator(g.sheetAxis);
      if (!base.length) return { best: 0, axis: "—", sizes: [] as number[] };
      let best = 0, axis = "—", sizes: number[] = [];
      // every direction in the sheet is a candidate axis to tilt it about
      for (const a of base) {
        const about = g.U[a];
        const seen = new Set<number>(), each: number[] = [];
        for (let k = 0; k < Math.max(g.CYCLE, 1); k++) {
          const lit = new Set<number>();
          for (const d of base) {
            let e = d;
            for (let i = 0; i < k; i++) e = g.turn(e, about);
            lit.add(e);
          }
          each.push(lit.size);
          for (const e of lit) seen.add(e);
        }
        if (seen.size > best) { best = seen.size; axis = `[${g.V[a]}]`; sizes = each; }
      }
      return { best, axis, sizes };
    };

    const rows = Object.values(GEOMETRIES).map(g => {
      const c = coverage(g);
      return {
        g, ...c,
        /** whether the count stays SHEET all the way round, which it must */
        steady: c.sizes.length ? c.sizes.every(x => x === g.SHEET) : true,
      };
    });
    const cubic = rows.find(r => r.g.name === "cubic-26")!;

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "the sheet keeps its count while turning, every geometry",
          value: rows.every(r => r.steady) ? 1 : 0,
          expect: { of: "1 — a source emits SHEET rays and turning moves them", want: 1, tolerance: 0,
            because: "the count is a property of the source, so it cannot change as it comes round" },
        }),
        judge({
          name: "cubic-26 exits reached in one rotation", value: cubic.best,
          expect: {
            of: "l.DEG — one rotation covers the whole space",
            want: cubic.g.DEG, tolerance: 0,
            because: "the derivation fixes the emission at SHEET rather than l.DEG precisely " +
              "BECAUSE one rotation is said to reach everywhere; a sheet that does not is " +
              "emitting into a cone, and the law it gives is about that cone",
          },
          note: `best over every axis lying in the sheet; the best was ${cubic.axis}`,
        }),
        judge({
          name: "geometries where one rotation covers everything",
          value: rows.filter(r => r.g.SHEET > 0 && r.best === r.g.DEG).length,
          expect: {
            of: "all of them that have a sheet at all",
            want: rows.filter(r => r.g.SHEET > 0).length, tolerance: 0,
            because: "the derivation is stated for the model rather than for one lattice",
          },
        }),
      ],
      table: {
        columns: ["geometry", "SHEET", "CYCLE", "reached", "of l.DEG", "covers?"],
        rows: rows.map(r => [
          r.g.name, r.g.SHEET, r.g.CYCLE, r.best, r.g.DEG,
          r.g.SHEET === 0 ? "no sheet" : r.best === r.g.DEG ? "yes" : `NO — ${r.g.DEG - r.best} missed`,
        ]),
      },
    };
  },
});

export default [constants, exits, shells, sheetCoverage, veins];
