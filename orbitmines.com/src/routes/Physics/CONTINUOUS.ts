/**
 * THE CONTINUOUS MODEL — the same model, read in the limit, with its constants
 * TAKEN FROM the discrete one rather than written down beside it.
 *
 * WHY THIS EXISTS. The two readings of this book are supposed to be pictures of the
 * same thing, and the way they stop being that is quiet: a closed form is written
 * with 26 in it, the lattice it is a closed form OF is changed to FCC, and nothing
 * complains. Every constant here is therefore a function of the geometry object
 * that DISCRETE.ts already carries — l.DEG, SHEET, CYCLE, SPIN, the second and
 * fourth moments, the light-speed anisotropy, the vacuum's fixed point — so that
 * changing the lattice changes the closed form in the same breath.
 *
 * AND WHAT CANNOT BE DERIVED IS CALIBRATED. Some of what the continuum reading uses
 * is not a counting fact about a neighbour set but a behaviour of the medium — a
 * mean free path, a coherence length, an exponent, a ballistic fraction. Those are
 * MEASURED off a discrete run and reported with the band they were expected in,
 * rather than fitted and then quoted as if they had been derived. `calibrate` is
 * that step, and a law that has not been through it says so.
 *
 * THREE MODES, because "the continuous model" has been three different things:
 *
 *   CLOSED     the analytic reading — a formula evaluated at a field point, with
 *              no lattice and no vacuum. Fast, and blind to anything the medium does.
 *   RETARDED   sums over emitters at the retarded time, with the arrival-rate
 *              factor. This is where radiation and Faraday live, and it is neither
 *              closed-form nor lattice — the arc kept calling it "continuum" and
 *              then being surprised that it had a solver in it.
 *   CALIBRATED a CLOSED or RETARDED law whose free parameters came off a discrete
 *              run, carrying the residual between the two.
 *
 * FILE ORDER
 *   §1  constants, derived from a geometry
 *   §2  the laws, as functions of those constants
 *   §3  the retarded reading
 *   §4  calibration against a discrete run
 *   §5  expectations — how a law stands, not whether it passes
 */

import {
  Geometry, Vec, World, Theory, GRAVITY_MAGNETISM, DEFAULT_GEOMETRY,
  add, sub, scale, dot, norm, unit, cross,
  Finding, Expectation, judge, Report, headerOf, exponent, fill, vacuumFill,
  onShell, stat, l,
} from "./DISCRETE";

// ─── §1  constants, derived ─────────────────────────────────────────────────

/**
 * Everything the closed form needs, and every one of them a consequence of the
 * geometry rather than a number typed in beside it.
 *
 * The article writes these with a bar to mark the discrete form and an `l.` to mark
 * that they are local; here they are the geometry's, which is the same statement
 * for a lattice that has not been folded.
 */
export type Constants = {
  geometry: string;
  /** the dimension, from which everything else in this block follows */
  D: number;
  /** ways out of a point — 3^D − 1 on a cubic lattice, but read off the exits */
  DEG: number;
  /** the sheet pulsed, which is what makes the inverse-square law inverse-square */
  SHEET: number;
  /** the ring turned through, and the angle one step of it is */
  CYCLE: number;
  SPIN: number;
  /** c̄ = one step a tick, by definition; this is how much that varies with direction */
  cAnisotropy: number;
  /**
   * Σ d̂⊗d̂ over UNIT directions = (DEG/D)·I when isotropic, which every candidate
   * geometry satisfies — and is why 1/r² was never in danger on any of them. This
   * is the one the article means when it writes Σd̂⊗d̂ = (DEG/3)·I = 8.667.
   */
  secondMomentUnit: number;
  /**
   * Σ w c⊗c over the RAW exit vectors — the momentum flux, a different tensor
   * whenever the exits have different lengths. On cubic 26 it is 18 against the
   * 8.667 above. Quoting either under the other's name is the mistake `switched`
   * caught in the old code, so both are carried and both are named.
   */
  secondMomentRaw: number;
  secondMomentIsotropic: boolean;
  /** the momentum flux, which no 3D single-speed lattice gets right unweighted */
  fourthMomentAnisotropy: number;
  /** the falloff a sheet spread over a shell gives: 1/R^(D−1) */
  falloff: number;
  /** the unsigned vacuum's fixed point; the polarised one sits below it */
  vacuumFixedPointUnsigned: (p: number) => number;
};

export const constants = (g: Geometry = DEFAULT_GEOMETRY): Constants => {
  const m2 = g.moment(2), m4 = g.moment(4);
  return {
    geometry: g.name,
    D: g.D,
    DEG: g.DEG,
    SHEET: g.SHEET,
    CYCLE: g.CYCLE,
    SPIN: g.SPIN,
    cAnisotropy: g.cAnisotropy,
    /*
     * READ OFF THE EXITS rather than asserted as DEG/D. On cubic 26 it comes to
     * 26/3 = 8.667 and the off-diagonal to 1e−17, which is the article's own
     * result that the twenty-six exits have an isotropic second moment despite
     * being an anisotropic set — but on a weighted or non-cubic geometry the number
     * is different and there is no reason to know it in advance.
     */
    secondMomentUnit: m2.diagUnit,
    secondMomentRaw: m2.diag,
    secondMomentIsotropic: m2.isotropic,
    fourthMomentAnisotropy: m4.anisotropy,
    falloff: g.D - 1,
    vacuumFixedPointUnsigned: (p: number) => (1 - p) / (2 - p),
  };
};

// ─── §2  the laws ───────────────────────────────────────────────────────────

export type Law = {
  name: string;
  /** which constants it consumes, so a change of geometry lists what it moved */
  uses: (keyof Constants)[];
  /** whether it is a counting fact or something the medium has to supply */
  kind: "derived" | "calibrated";
  /**
   * THE STATEMENT, WRITTEN FROM THE CONSTANTS RATHER THAN BESIDE THEM.
   *
   * A law used to carry its form as a string — "|F| ∝ 1/R^(D−1)" — with the exponent
   * typed in. That is the same drift the whole project exists to stop: change the
   * lattice and the constants move while the sentence does not. So a law states
   * itself out of the geometry it is being asked about, and cannot disagree with it.
   */
  form: (k: Constants) => string;
  /** for a calibrated law, what has not been measured yet */
  owes?: string;
};

/**
 * THE LAWS AS THE ARTICLE HAS THEM, each carrying which constants it eats.
 *
 * The point of the `uses` field is the report: change the geometry and this is what
 * says which laws moved, without anybody having to remember that the sheet is in
 * the inverse-square law and the ring is in the phase.
 */
export const LAWS: Law[] = [
  {
    name: "inverse-square",
    form: k => `|F| ∝ 1/R^${k.falloff} — ${k.SHEET} rays over a shell in ${k.D - 1} dimensions`,
    uses: ["D", "SHEET", "falloff", "secondMomentUnit"],
    kind: "derived",
  },
  {
    name: "deficit potential",
    form: k => `deficit ∝ A(1/r − 1/R_b), a potential whose gradient is the force; ` +
      `l.DEG = ${k.DEG} is what the shortfall is counted against`,
    uses: ["D", "DEG"],
    kind: "calibrated",
    owes: "the amplitude A, which carries a ballistic fraction nothing derives",
  },
  {
    name: "Coulomb",
    form: k => `ρ(r) = Σ σ_d ∝ q/r^${k.falloff} — the net polarity a charge leaves in the ` +
      `vacuum IS the field, read directly rather than differentiated out of a potential`,
    uses: ["D", "falloff"],
    kind: "derived",
  },
  {
    name: "Biot–Savart",
    form: k => `B = Σ σ_d (d̂ × u) ∝ q u × r̂ / r^${k.falloff}`,
    uses: ["D", "falloff", "secondMomentUnit"],
    kind: "derived",
  },
  {
    name: "Ampère",
    form: k => `B ∝ I/r^${Math.max(k.falloff - 1, 1)} for a line current — a line's shell is ` +
      `a cylinder, so it grows one power slower than a point's`,
    uses: ["D", "falloff"],
    kind: "derived",
  },
  {
    name: "screening",
    form: () => "F(d) ∝ e^(−d/λ) with λ the mean free path — a force is second order in " +
      "survival, since it needs rays from BOTH bodies to live long enough to meet",
    uses: ["DEG"],
    kind: "calibrated",
    owes: "λ, which is a property of the vacuum's occupancy and not of the geometry",
  },
  {
    name: "phase quantum",
    form: k => k.CYCLE
      ? `one step of a ring of ${k.CYCLE}: SPIN = ${(180 / Math.PI * k.SPIN).toFixed(1)}°`
      : "NONE — this geometry has no equator, so there is no ring to put a phase on",
    uses: ["CYCLE", "SPIN", "SHEET"],
    kind: "derived",
  },
  {
    name: "light-speed isotropy",
    form: k => k.cAnisotropy > 1.001
      ? `c̄ varies by ${k.cAnisotropy.toFixed(2)}× with direction — one exit a tick, and the ` +
        `exits are not the same length`
      : "c̄ is the same every way — every exit is the same length here",
    uses: ["cAnisotropy"],
    kind: "derived",
  },
  {
    name: "expansion",
    form: k => `space grows where a split's two halves do not annihilate. In a theory with ` +
      `no polarity every pair is neutral and the rate is ZERO; with polarity about half ` +
      `the ${k.DEG} pairs at a point turn instead, and the point they were inserted as survives`,
    uses: ["DEG"],
    kind: "calibrated",
    owes: "the surviving fraction, which depends on how often alike meets alike and so on " +
      "what is in the space — see cosmology/expansion",
  },
];

/** which laws move when the geometry changes, and which constants moved under them */
export const affectedBy = (from: Geometry, to: Geometry) => {
  const a = constants(from), b = constants(to);
  const moved = (Object.keys(a) as (keyof Constants)[])
    .filter(k => typeof a[k] !== "function" && String(a[k]) !== String(b[k]));
  return LAWS
    .map(law => ({ law, via: law.uses.filter(u => moved.includes(u)) }))
    .filter(x => x.via.length)
    .map(x => ({
      law: x.law.name,
      /** the law as each geometry states it — which is the point of the comparison */
      was: x.law.form(a), now: x.law.form(b),
      via: x.via,
      changes: x.via.map(v => ({ constant: v, from: a[v], to: b[v] })),
    }));
};

// ─── §3  the retarded reading ───────────────────────────────────────────────

export type Emitter = {
  at: Vec;
  /** where it is at time t, so that a retarded position means something */
  path?: (t: number) => Vec;
  sigma: number;
  /** the emitter's velocity — the label, and the whole of what makes B */
  u: Vec;
};

/**
 * The retarded time at a field point: the t' at which what arrives now left.
 *
 * BISECTION WITH A BRACKET THAT IS CHECKED. An earlier version of this in the arc
 * had its inequality inverted, walked to its own bracket endpoint, and returned
 * t − 10⁷ for every field point in silence; it was caught only by asking the solver
 * for its own residual, which should be nought and was −7·10⁶. So the residual is
 * returned here and every caller gets it whether it wants it or not.
 */
export const retarded = (P: Vec, t: number, e: Emitter, c = 1) => {
  const at = (tp: number) => e.path ? e.path(tp) : e.at;
  const f = (tp: number) => (t - tp) * c - norm(sub(P, at(tp)));
  let lo = t - 4 * (norm(sub(P, at(t))) + 1) / c - 1, hi = t;
  let flo = f(lo), fhi = f(hi);
  if (flo * fhi > 0) return { t: NaN, residual: NaN, bracketed: false };
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2, fm = f(mid);
    if (flo * fm <= 0) { hi = mid; fhi = fm; } else { lo = mid; flo = fm; }
  }
  const tp = (lo + hi) / 2;
  return { t: tp, residual: f(tp), bracketed: true };
};

/**
 * The fields of a set of emitters at a field point, read at the retarded time.
 *
 * THE ARRIVAL-RATE FACTOR IS NOT A RELATIVISTIC CORRECTION BOLTED ON. A source
 * emitting at a fixed rate in its own time has its rays ARRIVE at a different rate,
 * because it moves between emissions — 1/(1 − n̂·u) — and that is simply what
 * counting arrivals means when the emitter is moving. `lorenz` found Ampère fails
 * without it.
 */
export const fieldsAt = (P: Vec, t: number, ems: Emitter[], k = constants()) => {
  const E: Vec = [0, 0, 0], B: Vec = [0, 0, 0];
  let worstResidual = 0, unbracketed = 0;
  for (const e of ems) {
    const r = retarded(P, t, e);
    if (!r.bracketed) { unbracketed++; continue; }
    worstResidual = Math.max(worstResidual, Math.abs(r.residual));
    const src = e.path ? e.path(r.t) : e.at;
    const d = sub(P, src), R = norm(d);
    if (R < 1e-9) continue;
    const n = scale(d, 1 / R);
    const rate = 1 / Math.max(1e-6, 1 - dot(n, e.u));
    const w = e.sigma * rate / Math.pow(R, k.falloff);
    for (let i = 0; i < 3; i++) E[i] += w * n[i];
    const b = cross(n, e.u);
    for (let i = 0; i < 3; i++) B[i] += w * b[i];
  }
  return { E, B, worstResidual, unbracketed };
};

// ─── §4  calibration ────────────────────────────────────────────────────────

export type Calibration = {
  name: string;
  /** what came off the discrete run */
  measured: number;
  /** what the closed form says, when it says anything */
  predicted?: number;
  finding: Finding;
  /** the run it came from, so it can be reproduced */
  header: ReturnType<typeof headerOf>;
};

/**
 * MEASURE A LAW'S FREE PARAMETER OFF A DISCRETE RUN rather than fitting it and
 * quoting it as derived.
 *
 * The pattern is the same every time: build a world, sweep a radius, read a signed
 * profile, fit an exponent, and report it against what the geometry says it should
 * be — with the band, and with which way it missed if it missed.
 */
export const calibrateFalloff = (o: {
  theory?: Theory; geometry?: Geometry; N?: number; T?: number; seeds?: number[];
  radii?: number[];
} = {}): Calibration => {
  const geometry = o.geometry ?? DEFAULT_GEOMETRY;
  const k = constants(geometry);
  const N = o.N ?? 41, T = o.T ?? 90;
  const seeds = o.seeds ?? [20260817, 777333, 424242];
  const radii = o.radii ?? [5, 8, 11, 14];
  const centre = new Array(geometry.D).fill((N - 1) / 2);

  const per: number[] = [];
  let last: World | undefined;
  for (const seed of seeds) {
    const w = new World({ theory: o.theory ?? GRAVITY_MAGNETISM, geometry, N, seed, boundary: "absorb" });
    w.add({ at: centre, radius: 2, emits: 1 });
    w.run(T);
    // the same box, same seed, no source — so the difference IS the source
    const v = new World({ theory: o.theory ?? GRAVITY_MAGNETISM, geometry, N, seed, boundary: "absorb" });
    v.run(T);
    const prof = radii.map(r => {
      let s = 0, n = 0;
      w.backend.forEachLocal(loc => {
        const d = norm(sub(w.backend.position(loc), centre));
        if (Math.abs(d - r) > 0.5) return;
        s += l.charge(w, loc) - l.charge(v, loc); n++;
      });
      return n ? s / n : NaN;
    });
    per.push(exponent(radii, prof));
    last = w;
  }
  const st = stat(per);
  const expect: Expectation = {
    of: "1/R^(D−1), a fixed emission spread over a shell",
    want: -k.falloff,
    tolerance: 0.15,
    because: `a sheet of ${k.SHEET} rays over a shell of ${k.D - 1} dimensions thins as 1/R^${k.falloff}`,
  };
  return {
    name: "falloff exponent",
    measured: st.mean,
    predicted: -k.falloff,
    finding: judge({ name: "falloff exponent", value: st.mean, err: st.err, expect,
      note: st.saturated ? "ZERO SPREAD ACROSS SEEDS — this channel is pinned, not precise." : undefined }),
    header: headerOf(last!, seeds),
  };
};

/**
 * The mean free path, measured — which is what every screening length in the book
 * is, and which the geometry cannot supply because it is a property of how full the
 * vacuum is rather than of how many ways out a point has.
 */
export const calibrateMeanFreePath = (o: { p?: number; N?: number; T?: number } = {}): Calibration => {
  const v = vacuumFill({ p: o.p ?? 0.05, N: o.N ?? 21, T: o.T ?? 120 });
  const measured = 1 / Math.max(v.measured, 1e-9);
  return {
    name: "mean free path",
    measured,
    finding: judge({
      name: "mean free path (cells)", value: measured,
      expect: {
        of: "1/fill at the vacuum's own occupancy",
        want: 1 / Math.max(v.predicted, 1e-9),
        tolerance: 0.5,
        because: "a ray meets something when it lands where one sits on the opposing exit",
      },
      note: "A POLARISED vacuum sits below the unsigned fixed point, so its mean free path sits " +
        "ABOVE the unsigned prediction. That is expected; the size of it is the measurement.",
    }),
    header: headerOf(v.world),
  };
};

// ─── §5  how a law stands ───────────────────────────────────────────────────

/**
 * A calibration run, written up. Not a pass or a fail: what was measured, what the
 * geometry said, whether it landed in the band, and which way and how far if not.
 */
export const calibrate = (o: { geometry?: Geometry; report?: Report } = {}) => {
  const g = o.geometry ?? DEFAULT_GEOMETRY;
  const k = constants(g);
  const R = o.report ?? new Report(`CONTINUOUS.ts calibration — ${g.name}`);
  const cs: Calibration[] = [calibrateFalloff({ geometry: g }), calibrateMeanFreePath()];
  R.record({
    id: `calibrate/${g.name}`,
    what: "the continuum's constants against the discrete model that is supposed to have them",
    header: cs[0].header,
    findings: cs.map(c => c.finding),
    table: {
      columns: ["constant", "value", "from"],
      rows: [
        ["DEG", k.DEG, "the exits"],
        ["SHEET", k.SHEET, "largest equator"],
        ["CYCLE", k.CYCLE, "the ring"],
        ["SPIN", (180 / Math.PI * k.SPIN).toFixed(1) + "°", "2π/CYCLE"],
        ["Σd̂⊗d̂ (unit)", k.secondMomentUnit.toFixed(4), `DEG/D = ${(k.DEG / k.D).toFixed(4)}`],
        ["Σc⊗c (raw)", k.secondMomentRaw.toFixed(4), k.secondMomentIsotropic ? "isotropic" : "ANISOTROPIC"],
        ["rank-4", (100 * k.fourthMomentAnisotropy).toFixed(1) + "%", "momentum flux"],
        ["falloff", `1/R^${k.falloff}`, "a shell in D−1"],
        ["laws stated", String(LAWS.length), "each written from these constants"],
        ["c anisotropy", k.cAnisotropy.toFixed(3) + "×", "step lengths"],
      ],
    },
  });
  return { constants: k, calibrations: cs, report: R };
};
