/**
 * THE KERNEL UNDER THE FORCE AND THE TORQUE — ported from `torque.ts` §1–§3.
 *
 * WHAT IS OWED IS NOT A MECHANISM. Gravity is not a force in this model: annihilation
 * DESTROYS THE SPACE the two charges were standing on, so when more meetings happen
 * between two bodies than outside them, the space between them is shorter than the
 * space around them and they are closer. Nothing pulls. The ledger of where space was
 * destroyed IS the motion.
 *
 * That ledger has moments, and gravity uses only the zeroth:
 *
 *     ⟨1⟩  about a source     how much space went, total        → it MOVES
 *     ⟨d̂⟩  about a source     which SIDE of it the space went   → it TURNS
 *
 * and the second is not a new rule, it is the same sentence. So the thing to
 * demonstrate is that the two are moments of ONE quantity — because if they are, the
 * feedback costs nothing: the force and the torque are the position-gradient and the
 * axis-gradient of the same scalar, and "follow the gradient" is a restatement of
 * where space went rather than an extra postulate.
 *
 * THE BIAS GOES ON A PLACE AND NOT ON A DIRECTION, which the arc settles and which is
 * worth not re-deciding. One emitter biased + out of its north half and − out of its
 * south FAILS: pole to pole gives exactly nothing by an exact cancellation, and the
 * fall-off is 1/R² where two magnets are 1/R⁴. A magnet is a lump biased + at one end
 * and − at the other, SEPARATED IN SPACE — which is what `escape` derives as −∇·p and
 * what magnetostatics calls the pole model.
 *
 * THIS IS THE PIECE THE ORDERING ARC ACTUALLY RESTS ON, and it survives its own
 * chronology: the arc's later audit finds the 1/R pole kernel, the dipole scalar, the
 * force and the torque all standing, and none of them mentions a ring.
 */

import { World, headerOf, judge, Vec, Finding } from "../DISCRETE";
import { test } from "../SUITE";

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: Vec) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: Vec): Vec => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a: Vec, b: Vec): Vec =>
  [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * WHAT ARRIVES AT A PLACE FROM A MAGNET: two poles, each contributing its sign over
 * the shell it has reached — the 1/r² of a fixed emission spread over a growing
 * surface. The core is capped at a cell because a place closer than a cell is not a
 * place.
 */
const arriving = (x: number, y: number, z: number, c: Vec, p: Vec, d: number) => {
  let a = 0;
  for (const s of [1, -1]) {
    const px = c[0] + s * d / 2 * p[0], py = c[1] + s * d / 2 * p[1], pz = c[2] + s * d / 2 * p[2];
    const r2 = (x - px) ** 2 + (y - py) ** 2 + (z - pz) ** 2;
    a += s / Math.max(r2, 2.25);
  }
  return a;
};

/**
 * THE LEDGER. Opposite signs meeting annihilate and take the space with them, so the
 * excess of annihilation over the unbiased case at a place is −A_a·A_b, and Φ is that
 * summed over the lattice. POSITIVE Φ is more space destroyed, which is the
 * configuration two bodies fall into — so Φ is a shortening and a pair seeks its
 * maximum.
 */
const ledger = (ca: Vec, pa: Vec, cb: Vec, pb: Vec, d: number, Rmax = 26) => {
  let acc = 0;
  const n = Math.ceil(Rmax), mx = Math.round((ca[0] + cb[0]) / 2);
  for (let x = mx - n; x <= mx + n; x++)
    for (let y = -n; y <= n; y++)
      for (let z = -n; z <= n; z++)
        acc += -arriving(x, y, z, ca, pa, d) * arriving(x, y, z, cb, pb, d);
  return acc;
};

/** the single-pole version of the same sum — the kernel everything else is built on */
const kernel = (R: number, Rmax = 60, core = 1.5) => {
  let acc = 0;
  const n = Math.ceil(Rmax + R);
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
    const la = Math.hypot(x, y, z), lb = Math.hypot(x - R, y, z);
    if (la < core || lb < core) continue;
    if (la > Rmax && lb > Rmax) continue;
    acc += 1 / (la * la * lb * lb);
  }
  return acc;
};

/** the dipole scalar the ledger is tested against, up to ONE constant */
const dipoleForm = (R: Vec, pa: Vec, pb: Vec) => {
  const r = len(R), rh = unit(R);
  return (3 * dot(pa, rh) * dot(pb, rh) - dot(pa, pb)) / (r * r * r);
};

/** a deterministic spread of orientations, so the fit is not a fit to one lucky pair */
const axisAt = (i: number, n: number): Vec => {
  const z = 2 * ((i + 0.5) / n) - 1, t = Math.PI * (1 + Math.sqrt(5)) * i;
  const r = Math.sqrt(Math.max(0, 1 - z * z));
  return [r * Math.cos(t), r * Math.sin(t), z];
};

export const kernelTest = test({
  id: "magnetism/kernel",
  claims: "two co-location densities convolve into a 1/R potential, two magnets are the " +
    "dipole scalar, and the force and the torque are two derivatives of that one function",
  cited: ["Magnetism", "the interaction — force, torque, and the kernel under them",
    "and the feedback rule, which turns out to be already written"],
  under: { "gravity": "holds" },
  /* a lattice sum over a fixed construction: no world runs, nothing stochastic */
  exact: true,
  run: (_ctx, theory) => {
    /*
     * §1  THE KERNEL. Two densities each falling as an inverse square convolve into an
     * inverse FIRST power — a Coulomb potential between poles, out of a bond count and
     * not put in. So R × K(R) is the thing that should be flat.
     */
    const Rs = [4, 6, 8, 10, 12, 16, 20];
    const K = Rs.map(R => ({ R, k: kernel(R) }));
    const RK = K.map(x => x.R * x.k);
    /*
     * JUDGED WHERE THE CLAIM IS TRUE, AND THE ARTICLE'S NOTE IS NOT.
     *
     * `torque.ts §1` is cited in the article as "R × K flat to three figures from
     * R = 4 to 20". It is not, and this port reproduces the original's own numbers to
     * every digit to establish that the disagreement is with the ARTICLE and not with
     * the port: 19.524, 22.749, 24.130, 24.797, 25.115, 25.237, 25.029.
     *
     * Those APPROACH a constant near 25.1 from below; they are not flat across that
     * range and not flat to three figures anywhere in it. The shortfall is at SMALL R,
     * which is where a core cutoff of 1.5 cells and a finite outer radius bite hardest
     * — R = 4 puts the two cores four cells apart with the cutoff a third of that.
     *
     * So the kernel is 1/R ASYMPTOTICALLY, which is all the pole picture needs, and
     * the honest thing is to judge the asymptote and show the approach rather than
     * quote a flatness that was never in the output.
     */
    const ASYMPTOTIC = 8;
    const tail = K.filter(x => x.R >= ASYMPTOTIC).map(x => x.R * x.k);
    const flat = (Math.max(...tail) - Math.min(...tail)) /
      (tail.reduce((a, b) => a + b, 0) / tail.length);

    /*
     * §2  TWO MAGNETS ARE THE DIPOLE SCALAR. Not a rearrangement — the ledger is a
     * lattice sum over annihilation and the dipole form is a closed expression, and
     * they are compared across many orientation pairs with ONE fitted constant.
     */
    const d = 2, R0 = 12;
    const pairs = Array.from({ length: 24 }, (_, i) => {
      const pa = axisAt(i, 24), pb = axisAt(i + 7, 24);
      const Rv: Vec = [R0, 0, 0];
      return { pa, pb, phi: ledger([0, 0, 0], pa, [R0, 0, 0], pb, d, 40), form: dipoleForm(Rv, pa, pb) };
    });
    const sxy = pairs.reduce((a, p) => a + p.phi * p.form, 0);
    const sxx = pairs.reduce((a, p) => a + p.form * p.form, 0);
    const c = sxy / sxx;                       // the one constant
    const mean = pairs.reduce((a, p) => a + p.phi, 0) / pairs.length;
    const ssRes = pairs.reduce((a, p) => a + (p.phi - c * p.form) ** 2, 0);
    const ssTot = pairs.reduce((a, p) => a + (p.phi - mean) ** 2, 0);
    const r2 = 1 - ssRes / ssTot;

    /*
     * §3  AND THEN THE FORCE IS ITS GRADIENT. Differentiating the SAME Φ in position
     * gives an exponent climbing towards −4 — the dipole–dipole force — and the gap
     * from −4 is the finite pole separation, not the box: it climbs as d/R shrinks.
     */
    const BOX = 48, pz: Vec = [0, 0, 1];
    const force = (R: number) => {
      const h = 0.5;
      return -(ledger([0, 0, 0], pz, [R + h, 0, 0], pz, d, BOX) -
        ledger([0, 0, 0], pz, [R - h, 0, 0], pz, d, BOX)) / (2 * h);
    };
    const FR = [8, 10, 12, 14, 16].map(R => ({ R, f: force(R) }));
    const exps = FR.slice(1).map((x, i) =>
      Math.log(Math.abs(x.f / FR[i].f)) / Math.log(x.R / FR[i].R));
    const lastExp = exps[exps.length - 1];

    /*
     * AND THE TORQUE IS THE OTHER GRADIENT, measured against τ = p × B with B the
     * other source's dipole field — a DIFFERENT formula, not a rearrangement of the
     * one above, which is the whole point of the demonstration.
     */
    const Rt = 12, rh: Vec = [1, 0, 0];
    const torqueRatio = (() => {
      const ang = 0.35;
      const pa: Vec = [Math.sin(ang), 0, Math.cos(ang)];
      const h = 0.02;
      const rot = (t: number): Vec => [Math.sin(ang + t), 0, Math.cos(ang + t)];
      const dPhi = -(ledger([0, 0, 0], rot(h), [Rt, 0, 0], pz, d, BOX) -
        ledger([0, 0, 0], rot(-h), [Rt, 0, 0], pz, d, BOX)) / (2 * h);
      // B from the other dipole at this separation, then τ = p × B about ŷ
      const B: Vec = [
        (3 * dot(pz, rh) * rh[0] - pz[0]) / Rt ** 3,
        (3 * dot(pz, rh) * rh[1] - pz[1]) / Rt ** 3,
        (3 * dot(pz, rh) * rh[2] - pz[2]) / Rt ** 3,
      ];
      const tau = cross(pa, B);
      return { dPhi, tau: tau[1], ratio: dPhi / (tau[1] || NaN) };
    })();

    const w = new World({ theory, N: 5 });

    const findings: Finding[] = [
      judge({
        name: `spread in R × K(R), R ≥ ${ASYMPTOTIC}`, value: flat,
        expect: {
          of: "0 — flat once the core cutoff stops mattering, which is a 1/R kernel",
          want: 0, tolerance: 0.05,
          because: "two co-location densities each falling as an inverse square convolve " +
            "into an inverse FIRST power. A Coulomb potential between poles, out of a " +
            "bond count rather than assumed — and it is what every later result is built on",
        },
        note: `R × K runs ${K.map((x, i) => `${x.R}: ${RK[i].toFixed(3)}`).join(", ")} — ` +
          "APPROACHING a constant from below rather than flat across the whole range. " +
          "The article cites this as \"flat to three figures from R = 4 to 20\", which " +
          "the original's own output does not show and this port reproduces digit for " +
          "digit; the shortfall is the 1.5-cell core at small separations. THE ARTICLE'S " +
          "NOTE NEEDS CORRECTING, not the kernel.",
      }),
      judge({
        name: "R² of the ledger against the dipole scalar", value: r2,
        expect: {
          of: "1 — [3(pa·R̂)(pb·R̂) − pa·pb]/R³, with ONE fitted constant",
          want: 1, tolerance: 0.02,
          because: "the ledger is a lattice sum over annihilation and the dipole form is " +
            "a closed expression: agreeing across 24 orientation pairs on one constant " +
            "is what makes them the same function rather than two curves through a point",
        },
        note: `24 orientation pairs, constant ${c.toExponential(3)}`,
      }),
      judge({
        name: "force exponent at the widest separation", value: lastExp,
        expect: {
          of: "−4 — the dipole–dipole force, as a DERIVATIVE of Φ rather than measured",
          /* relative: 0.125 of 4 is the ±0.5 in the exponent this actually means */
          want: -4, tolerance: 0.125,
          because: "this is the force recovered as the position-gradient of the same " +
            "scalar the torque comes out of, which is the whole demonstration",
        },
        note: `exponents ${exps.map(e => e.toFixed(2)).join(" → ")} — it climbs towards −4 ` +
          "as d/R shrinks, so the gap is the finite pole separation and not the box",
      }),
      judge({
        name: "−∂Φ/∂axis over (p × B)_y", value: torqueRatio.ratio,
        note: "the torque as the AXIS-gradient of the same Φ, against τ = p × B — a " +
          "different formula rather than a rearrangement. What matters is that the ratio " +
          "is a CONSTANT of the same sign, since Φ carries the one overall constant the " +
          "fit above measures; it is reported without an expectation because that " +
          "constant is not fixed independently here.",
      }),
    ];

    return {
      header: headerOf(w),
      findings,
      table: {
        columns: ["R", "K(R)", "R × K(R)", "Φ(R)", "−dΦ/dR", "exponent"],
        rows: K.map((x, i) => {
          const fr = FR.find(f => f.R === x.R);
          const ei = FR.findIndex(f => f.R === x.R);
          return [
            String(x.R), x.k.toExponential(3), RK[i].toFixed(4),
            fr ? ledger([0, 0, 0], pz, [x.R, 0, 0], pz, d, BOX).toExponential(2) : "—",
            fr ? fr.f.toExponential(2) : "—",
            ei > 0 ? exps[ei - 1].toFixed(2) : "—",
          ];
        }),
      },
    };
  },
});

/**
 * WHERE THE BIAS LIVES — and only one of the two places is a magnet.
 *
 * There are two things "a biased emitter" could mean, and the arc records getting it
 * wrong for a long time:
 *
 *   ON A DIRECTION   one point, putting + out of its north half and − out of its
 *                    south. The sign is a function of which way you look at it.
 *   ON A PLACE       a lump biased + at one END and − at the other, the two SEPARATED
 *                    IN SPACE. That is what `escape` derives as −∇·p and what
 *                    magnetostatics calls the pole model.
 *
 * MEASURED, THE FIRST HAS NO RANGE. The ledger between two direction-biased emitters
 * pole to pole comes out flat in the separation — 1.9e-1, 2.0e-1, 2.1e-1, 2.0e-1 at
 * R = 8, 10, 12, 16 — where the place-biased pair falls by a factor of seven over the
 * same range. A coupling that does not depend on how far apart the two bodies are is
 * not a force, and no amount of it adds up to magnetostatics.
 *
 * THE ARC STATES THIS AS AN EXACT CANCELLATION — "pole to pole gives exactly nothing"
 * — and that is NOT what this construction gives; it gives something that does not
 * decay. The conclusion is the same and the reason is not, so it is recorded as
 * measured rather than as quoted, and the discrepancy is left visible rather than
 * tidied into agreement.
 */
export const whereTheBiasLives = test({
  id: "magnetism/where-the-bias-lives",
  claims: "a bias on a DIRECTION gives a coupling with no range, and only a bias on a " +
    "PLACE — two poles separated in space — falls off like a force",
  cited: ["and where the bias lives decides everything"],
  under: { "gravity": "holds" },
  exact: true,
  run: (_ctx, theory) => {
    const ax: Vec = [1, 0, 0], d = 2;

    /** one point whose sign depends on which side of it you are standing */
    const onDirection = (x: number, y: number, z: number, c: Vec, p: Vec) => {
      const dx = x - c[0], dy = y - c[1], dz = z - c[2];
      const r2 = Math.max(dx * dx + dy * dy + dz * dz, 2.25);
      return (dot([dx, dy, dz], p) >= 0 ? 1 : -1) / r2;
    };

    const sum = (
      f: (x: number, y: number, z: number) => number,
      g2: (x: number, y: number, z: number) => number, mx: number, n: number,
    ) => {
      let acc = 0;
      for (let x = mx - n; x <= mx + n; x++)
        for (let y = -n; y <= n; y++)
          for (let z = -n; z <= n; z++) acc += -f(x, y, z) * g2(x, y, z);
      return acc;
    };

    const Rs = [8, 10, 12, 16];
    const rows = Rs.map(R => ({
      R,
      place: sum((x, y, z) => arriving(x, y, z, [0, 0, 0], ax, d),
        (x, y, z) => arriving(x, y, z, [R, 0, 0], ax, d), Math.round(R / 2), 40),
      dir: sum((x, y, z) => onDirection(x, y, z, [0, 0, 0], ax),
        (x, y, z) => onDirection(x, y, z, [R, 0, 0], ax), Math.round(R / 2), 40),
    }));

    const spread = (xs: number[]) =>
      (Math.max(...xs) - Math.min(...xs)) / Math.max(...xs.map(Math.abs));
    const placeSpread = spread(rows.map(r => r.place));
    const dirSpread = spread(rows.map(r => r.dir));

    const w = new World({ theory, N: 5 });

    return {
      header: headerOf(w),
      findings: [
        judge({
          name: "how much the PLACE ledger changes over R = 8…16", value: placeSpread,
          expect: {
            of: "large — a force has a range, so it has to change with the separation",
            want: 1, atLeast: 0.1,
            because: "this is the construction magnetostatics is built on, and the whole " +
              "of its content is that it falls off",
          },
        }),
        judge({
          name: "how much the DIRECTION ledger changes over the same range", value: dirSpread,
          expect: {
            of: "≈ 0 — flat, which is a coupling with NO RANGE and therefore not a force",
            want: 0, tolerance: 0.12,
            because: "a bias that lives on a direction gives the same answer however far " +
              "apart the two bodies are, so no arrangement of such emitters can produce " +
              "an inverse-power law — which is why the bias has to live on a place",
          },
        }),
      ],
      table: {
        columns: ["R", "bias on a place", "bias on a direction"],
        rows: rows.map(r => [String(r.R), r.place.toExponential(3), r.dir.toExponential(3)]),
      },
    };
  },
});

export default [kernelTest, whereTheBiasLives];
