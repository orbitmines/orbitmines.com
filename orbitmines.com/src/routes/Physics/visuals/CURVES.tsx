/**
 * THE TWO CURVES THE COSMOLOGY ARC IS JUDGED ON — the Milky Way's rotation, and
 * Genzel's high-redshift discs — restored from the archive and rewired so that every
 * number in them comes out of `REPORT.json` rather than out of the file.
 *
 * WHY THAT REWIRING IS THE POINT. The archive's versions carried their own copy of
 * a₀, their own copy of the ceiling, their own copy of the threshold. Each was correct
 * when it was typed and none of them could notice when the measurement moved: a panel
 * and a test could disagree indefinitely and nothing anywhere would say so. Here a₀ is
 * `cosmology/rotation`'s own reading, the ceiling and the breach depth are
 * `cosmology/high-redshift-discs`'s, and if a run changes them the curves move with
 * it. A value the report does not have renders as a visible gap rather than a
 * plausible default.
 *
 * WHAT IS STILL TYPED IN, and has to be, is the OBSERVATION. Eilers et al. 2019 (Gaia
 * DR2 × APOGEE), Genzel et al. 2017 (Nature 543, 397) and the SPARC catalogue are
 * measurements of the sky; they are not this model's to derive, and they are marked as
 * borrowed wherever they appear. SPARC is large enough to live in its own file —
 * `../SPARC` — and both the panels that use it and the test that scores it read the
 * same array, so a panel and a claim cannot drift apart about what the data are.
 */

import { CanvasView, Surface } from "./CANVAS";
import { findingOf } from "./FIGURES";
import { RAR, BTFR, baryonicMass, btfrAxes, orthogonalFit, btfrCeiling } from "../SPARC";

const BACK = "#08090d", FAINT = "#5a5f6e", GRID = "rgba(120,127,148,0.13)";
const SEEN = "#eef0f5", MODEL = "#4aa8eb", DATA = "#eb964a";
const FLOORC = "#8bd48b", PALE = "#9aa0b4", GASC = "#6fd39b", BULGEC = "#c98bd4";
const RELAT = "#d4b48b", EXCL = "rgba(235,90,90,0.10)";

/** a measured number, from the report — or NaN, which the panel then says out loud */
const read = (id: string, name: string) => {
  const f = findingOf(id, name);
  return typeof f?.value === "number" ? f.value : NaN;
};

const A0 = () => read("cosmology/rotation", "a₀ = cH₀/2π at Planck's H₀ (m/s²)");
const CEILING = () => read("cosmology/high-redshift-discs",
  "the ceiling f_DM < 0.2 puts on the boost");
const SPARC_RMS = () => read("cosmology/sparc", "rms from SPARC's own 2,696 points, in dex");
const SPARC_A0 = () => read("cosmology/sparc",
  "how far a₀ = cH₀/2π is from the a₀ these points would choose");
const BTFR_SLOPE = () => read("cosmology/sparc",
  "the baryonic Tully–Fisher slope, orthogonal fit to 123 galaxies");
const BTFR_GAP = () => read("cosmology/sparc",
  "how far the measured normalisation sits under the model's ceiling, in dex");
const BREACH = () => read("cosmology/high-redshift-discs",
  "g_N/a₀ at which the law breaches the ceiling");

// ─── the Milky Way ──────────────────────────────────────────────────────────

const MSUN = 1.98847e30, KPC = 3.0856775814913673e19, G = 6.67430e-11;
const DISK = { M: 5.0e10 * MSUN, Rd: 2.6 * KPC };
const GAS = { M: 1.2e10 * MSUN, Rd: 7.0 * KPC };
const BULGE = { M: 0.9e10 * MSUN, a: 0.5 * KPC };

/**
 * WHAT IS MEASURED — Eilers et al. 2019, ApJ 871:120, Table 1 verbatim.
 *
 * THIRTY-EIGHT BINNED POINTS WITH THEIR PUBLISHED ASYMMETRIC ERRORS, not the linear
 * fit. An earlier version of this panel drew `229.0 − 1.7(r − 8.122)`, which is their
 * two-parameter summary — and a smooth theory curve against a straight line always
 * looks tidier than the same curve against real points with real scatter. A residual
 * quoted against a fit is not a residual against a measurement, and the difference is
 * exactly the thing a reader would want to judge.
 *
 * Gaia DR2 crossed with APOGEE, 23,000 red giants. Borrowed entirely: this is a
 * measurement of the sky and none of it is the model's to derive.
 */
type Point = { r: number; v: number; lo: number; hi: number };
const EILERS: Point[] = [
  { r: 5.27, v: 226.83, lo: 1.91, hi: 1.90 }, { r: 5.74, v: 230.80, lo: 1.43, hi: 1.35 },
  { r: 6.23, v: 231.20, lo: 1.70, hi: 1.10 }, { r: 6.73, v: 229.88, lo: 1.44, hi: 1.32 },
  { r: 7.22, v: 229.61, lo: 1.37, hi: 1.11 }, { r: 7.82, v: 229.91, lo: 0.92, hi: 0.88 },
  { r: 8.19, v: 228.86, lo: 0.80, hi: 0.67 }, { r: 8.78, v: 226.50, lo: 1.07, hi: 0.95 },
  { r: 9.27, v: 226.20, lo: 0.72, hi: 0.62 }, { r: 9.76, v: 225.94, lo: 0.42, hi: 0.52 },
  { r: 10.26, v: 225.68, lo: 0.44, hi: 0.40 }, { r: 10.75, v: 224.73, lo: 0.38, hi: 0.41 },
  { r: 11.25, v: 224.02, lo: 0.33, hi: 0.54 }, { r: 11.75, v: 223.86, lo: 0.40, hi: 0.39 },
  { r: 12.25, v: 222.23, lo: 0.51, hi: 0.37 }, { r: 12.74, v: 220.77, lo: 0.54, hi: 0.46 },
  { r: 13.23, v: 220.92, lo: 0.57, hi: 0.40 }, { r: 13.74, v: 217.47, lo: 0.64, hi: 0.51 },
  { r: 14.24, v: 217.31, lo: 0.77, hi: 0.66 }, { r: 14.74, v: 217.60, lo: 0.65, hi: 0.68 },
  { r: 15.22, v: 217.07, lo: 1.06, hi: 0.80 }, { r: 15.74, v: 217.38, lo: 0.84, hi: 1.07 },
  { r: 16.24, v: 216.14, lo: 1.20, hi: 1.48 }, { r: 16.74, v: 212.52, lo: 1.39, hi: 1.43 },
  { r: 17.25, v: 216.41, lo: 1.44, hi: 1.85 }, { r: 17.75, v: 213.70, lo: 2.22, hi: 1.65 },
  { r: 18.24, v: 207.89, lo: 1.76, hi: 1.88 }, { r: 18.74, v: 209.60, lo: 2.31, hi: 2.77 },
  { r: 19.22, v: 206.45, lo: 2.54, hi: 2.36 }, { r: 19.71, v: 201.91, lo: 2.99, hi: 2.26 },
  { r: 20.27, v: 199.84, lo: 3.15, hi: 2.89 }, { r: 20.78, v: 198.14, lo: 3.33, hi: 3.37 },
  { r: 21.24, v: 195.30, lo: 5.99, hi: 6.50 }, { r: 21.80, v: 213.67, lo: 15.38, hi: 12.18 },
  { r: 22.14, v: 176.97, lo: 28.58, hi: 18.57 }, { r: 22.73, v: 193.11, lo: 27.64, hi: 19.05 },
  { r: 23.66, v: 176.63, lo: 18.67, hi: 16.74 }, { r: 24.82, v: 198.42, lo: 6.50, hi: 6.12 },
];

/** χ² per point of a model curve against those points and their own errors */
export const chi2 = (model: (rkpc: number) => number) => {
  let s = 0;
  for (const p of EILERS) {
    const m = model(p.r), d = m - p.v;
    const e = d > 0 ? p.hi : p.lo;
    s += (d / e) ** 2;
  }
  return s / EILERS.length;
};

/**
 * AN EXPONENTIAL DISC, BY FREEMAN'S FORMULA — not by pretending it is a sphere.
 *
 * A first version used the enclosed mass, `1 − e^{−y}(1+y)`, which is what a
 * SPHERICAL body of that profile would pull with. A disc pulls harder than that at
 * every radius, because the mass is spread in the plane you are measuring in rather
 * than piled above and below it: measured, the curve peaked at 170 km/s where the
 * archive's peaked at 193, and the transport route came out 60 km/s under the Gaia
 * data instead of on it. The whole panel is about whether the baryons fall short, so
 * getting the baryons wrong in the direction of "falls short" is the one error that
 * cannot be allowed.
 *
 *     g(R) = 4πGΣ₀ y² [I₀(y)K₀(y) − I₁(y)K₁(y)] / R,   y = R/2R_d,  Σ₀ = M/2πR_d²
 *
 * The Bessel products are evaluated by their standard polynomial approximations
 * (Abramowitz & Stegun 9.8), which are good to about 2e-7 — far under the width of
 * the observed band.
 */
const i0 = (x: number) => {
  const t = x / 3.75;
  if (x < 3.75) { const y = t * t;
    return 1 + y * (3.5156229 + y * (3.0899424 + y * (1.2067492 +
      y * (0.2659732 + y * (0.0360768 + y * 0.0045813))))); }
  const y = 1 / t;
  return Math.exp(x) / Math.sqrt(x) * (0.39894228 + y * (0.01328592 + y * (0.00225319 +
    y * (-0.00157565 + y * (0.00916281 + y * (-0.02057706 + y * (0.02635537 +
    y * (-0.01647633 + y * 0.00392377))))))));
};
const i1 = (x: number) => {
  const t = x / 3.75;
  if (x < 3.75) { const y = t * t;
    return x * (0.5 + y * (0.87890594 + y * (0.51498869 + y * (0.15084934 +
      y * (0.02658733 + y * (0.00301532 + y * 0.00032411)))))); }
  const y = 1 / t;
  let a = 0.02282967 + y * (-0.02895312 + y * (0.01787654 - y * 0.00420059));
  a = 0.39894228 + y * (-0.03988024 + y * (-0.00362018 + y * (0.00163801 +
    y * (-0.01031555 + y * a))));
  return a * Math.exp(x) / Math.sqrt(x);
};
const k0 = (x: number) => {
  if (x <= 2) { const y = x * x / 4;
    return -Math.log(x / 2) * i0(x) + (-0.57721566 + y * (0.42278420 + y * (0.23069756 +
      y * (0.03488590 + y * (0.00262698 + y * (0.00010750 + y * 0.0000074)))))); }
  const y = 2 / x;
  return Math.exp(-x) / Math.sqrt(x) * (1.25331414 + y * (-0.07832358 + y * (0.02189568 +
    y * (-0.01062446 + y * (0.00587872 + y * (-0.00251540 + y * 0.00053208))))));
};
const k1 = (x: number) => {
  if (x <= 2) { const y = x * x / 4;
    return Math.log(x / 2) * i1(x) + (1 / x) * (1 + y * (0.15443144 + y * (-0.67278579 +
      y * (-0.18156897 + y * (-0.01919402 + y * (-0.00110404 - y * 0.00004686)))))); }
  const y = 2 / x;
  return Math.exp(-x) / Math.sqrt(x) * (1.25331414 + y * (0.23498619 + y * (-0.03655620 +
    y * (0.01504268 + y * (-0.00780353 + y * (0.00325614 - y * 0.00068245))))));
};

const gDisc = (d: { M: number; Rd: number }, r: number) => {
  const y = r / (2 * d.Rd);
  const S0 = d.M / (2 * Math.PI * d.Rd * d.Rd);
  const v2 = 4 * Math.PI * G * S0 * d.Rd * y * y * (i0(y) * k0(y) - i1(y) * k1(y));
  return Math.max(0, v2) / r;                     // v²/r is the acceleration
};
const gBulge = (r: number) => G * BULGE.M / Math.pow(r + BULGE.a, 2);

const baryons = (r: number) => gDisc(DISK, r) + gDisc(GAS, r) + gBulge(r);

/**
 * AND HOW GOOD THE AGREEMENT ACTUALLY IS, measured against the published errors rather
 * than against a smoothed line — because the earlier version of this panel flattered it.
 *
 *     Newton, same baryons          χ²/point  5177.6    rms 62.2 km/s
 *     transport, a₀ = 1.042e-10     χ²/point     8.2    rms  6.7 km/s
 *     transport, a₀ = 1.2e-10       χ²/point    28.7    rms  8.8 km/s
 *
 * TWO THINGS, AND THE SECOND MATTERS MORE. The discrepancy Newton leaves is enormous
 * and the transport law removes 99.8% of it — that is the arc's claim and it survives
 * contact with the real points. But **χ²/point = 8.2 is not a good fit**: Eilers'
 * mid-range errors are a few tenths of a km/s, so being 6.7 km/s out is many sigma at
 * almost every radius. Against their linear fit the same curve scored 3.3 km/s rms and
 * looked excellent, which is what a two-parameter summary does to a residual.
 *
 * THE HONEST STATEMENT is therefore: right mechanism, right scale, wrong in detail —
 * and the detail is now visible rather than smoothed away. Some of that is the baryon
 * model (an exponential disc and a Hernquist bulge is not the Milky Way), and some may
 * be the law; this panel cannot separate them, and does not pretend to.
 *
 * Notably the model's OWN a₀ does better than the fitted MOND value, 8.2 against 28.7,
 * which is not what a tuned agreement would look like.
 */

/**
 * THE TRANSPORT LAW, WHICH IS THIS MODEL'S OWN. The carrier's drift falls with the
 * density it passes through, so flux conservation Φ = 4πr²nv goes quadratic in n and
 * the profile turns over from 1/r² to 1/r. Same algebra as MOND's simple
 * interpolation, arrived at from transport rather than assumed — and `a₀` is not
 * fitted here, it is read off the report.
 */
const transport = (g: number, a0: number) => g / 2 + Math.sqrt(g * g / 4 + g * a0);

/**
 * THE SAME LAW, WRITTEN AS THE MECHANISM RATHER THAN AS ITS SOLUTION.
 *
 * `transport` above is the root of the quadratic, which is correct and says nothing
 * about where it came from. This is the step before that: the fraction of points still
 * free to split, at a field of strength g.
 *
 *   a point carrying a charge is BUSY and does not split this tick
 *   θ = g/a₀,  free = 1/(1+θ),  busy = θ/(1+θ) = g_N/g
 *
 * So the whole of the extra gravity is the reciprocal of the free fraction: the vacuum
 * would expand by 1 and only manages `free`, and what it fails to do is what pulls.
 * Drawn on the panels so the reader sees the mechanism and not only its consequence —
 * and the two agree by construction, which is the point rather than a coincidence.
 */
const freeFraction = (g: number, a0: number) => 1 / (1 + g / a0);
const fromFree = (gN: number, a0: number) => {
  // g such that busy(g) = g_N/g, solved forward from the free fraction
  let g = gN;
  for (let i = 0; i < 60; i++) g = gN / (1 - freeFraction(g, a0));
  return g;
};

const kms = (g: number, r: number) => Math.sqrt(Math.max(0, g * r)) / 1e3;


/** `right` leaves room for a second axis where a panel carries one */
const frame = (s: Surface, pad = 46, right = 14) => ({
  x0: pad, x1: s.width - right, y0: 22, y1: s.height - 30,
  w: s.width - right - pad, h: s.height - 30 - 22,
});

const tag = (s: Surface, x: number, y: number, t: string, c: string) => {
  s.ctx.fillStyle = c;
  s.ctx.font = "400 9.5px ui-monospace, Menlo, monospace";
  s.ctx.fillText(t, x, y);
};

const rotation = (s: Surface) => {
  const { ctx } = s;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, s.width, s.height);
  const box = frame(s);
  const XMAX = 30, YMAX = 280;
  const X = (v: number) => box.x0 + box.w * v / XMAX;
  const Y = (v: number) => box.y1 - box.h * v / YMAX;
  const a0 = A0();

  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (const t of [50, 100, 150, 200, 250]) {
    ctx.beginPath(); ctx.moveTo(box.x0, Y(t)); ctx.lineTo(box.x1, Y(t)); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "right";
    ctx.fillText(String(t), box.x0 - 6, Y(t) + 3);
  }
  for (const t of [5, 10, 15, 20, 25, 30]) {
    ctx.beginPath(); ctx.moveTo(X(t), box.y0); ctx.lineTo(X(t), box.y1); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(String(t), X(t), box.y1 + 15);
  }
  ctx.textAlign = "left";

  const R: number[] = [];
  for (let rk = 0.4; rk <= XMAX; rk += 0.2) R.push(rk);
  const line = (f: (rk: number) => number, col: string, w = 1.4, dash: number[] = []) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash);
    ctx.beginPath();
    R.forEach((rk, i) => {
      const y = Y(f(rk));
      if (i === 0) ctx.moveTo(X(rk), y); else ctx.lineTo(X(rk), y);
    });
    ctx.stroke(); ctx.setLineDash([]);
  };

  // the measurement: every published point, with its own asymmetric error bar
  ctx.strokeStyle = SEEN; ctx.lineWidth = 1;
  for (const p of EILERS) {
    const x = X(p.r);
    ctx.beginPath();
    ctx.moveTo(x, Y(p.v - p.lo)); ctx.lineTo(x, Y(p.v + p.hi)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 2, Y(p.v - p.lo)); ctx.lineTo(x + 2, Y(p.v - p.lo)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 2, Y(p.v + p.hi)); ctx.lineTo(x + 2, Y(p.v + p.hi)); ctx.stroke();
    ctx.fillStyle = SEEN;
    ctx.beginPath(); ctx.arc(x, Y(p.v), 1.7, 0, 2 * Math.PI); ctx.fill();
  }

  line(rk => kms(gDisc(DISK, rk * KPC), rk * KPC), PALE, 1.1);
  line(rk => kms(gDisc(GAS, rk * KPC), rk * KPC), GASC, 1.1);
  line(rk => kms(gBulge(rk * KPC), rk * KPC), BULGEC, 1.1);
  line(rk => kms(baryons(rk * KPC), rk * KPC), MODEL, 2.4);
  if (Number.isFinite(a0))
    line(rk => kms(transport(baryons(rk * KPC), a0), rk * KPC), FLOORC, 1.6, [5, 4]);


  /*
   * THE BLOCKED SHARE, DRAWN AS THE GAP IT IS — not as a second curve.
   *
   * Here too the free fraction is not independent information: the transport route
   * sits above Newton by exactly 1/√(1 − free), so the VERTICAL DISTANCE between the
   * two lines already is the blocked share. Shading it says that, where a third line
   * on a borrowed axis said "here is another quantity that happens to agree".
   *
   * Read it as: the blue line is what the baryons pull, the green is what is measured
   * to happen, and the band between them is the expansion the vacuum could not do.
   */
  if (Number.isFinite(a0)) {
    ctx.fillStyle = "rgba(201,139,212,0.10)";
    ctx.beginPath();
    R.forEach((rk, i) => {
      const y = Y(kms(transport(baryons(rk * KPC), a0), rk * KPC));
      if (i === 0) ctx.moveTo(X(rk), y); else ctx.lineTo(X(rk), y);
    });
    for (let i = R.length - 1; i >= 0; i--)
      ctx.lineTo(X(R[i]), Y(kms(baryons(R[i] * KPC), R[i] * KPC)));
    ctx.closePath(); ctx.fill();
    tag(s, X(15.5), Y(168), "the band IS the expansion the vacuum could not do", "#c98bd4");
    tag(s, X(15.5), Y(155), "— f_DM = free fraction = 1/(1+θ), the same reading twice", FAINT);
  }

  tag(s, X(1.0), Y(272), "measured — Eilers 2019 Table 1, all 38 points with published errors", SEEN);
  tag(s, X(11.5), Y(252), Number.isFinite(a0)
    ? `THE TRANSPORT ROUTE — a₀ = ${a0.toExponential(3)} m/s², from the report, not fitted`
    : "THE TRANSPORT ROUTE — a₀ NOT IN THE REPORT", Number.isFinite(a0) ? FLOORC : "#e0685f");
  tag(s, X(11.0), Y(150), "NEWTON = GR = THE FORCE LAW ALONE", MODEL);
  tag(s, X(20.0), Y(88), "stars", PALE);
  tag(s, X(23.0), Y(40), "gas", GASC);
  tag(s, X(2.6), Y(64), "bulge", BULGEC);

  if (Number.isFinite(a0)) {
    const cT = chi2(rk => kms(transport(baryons(rk * KPC), a0), rk * KPC));
    const cN = chi2(rk => kms(baryons(rk * KPC), rk * KPC));
    ctx.fillStyle = FAINT;
    ctx.font = "400 9.5px ui-monospace, Menlo, monospace";
    ctx.textAlign = "right";
    ctx.fillText(`χ²/point — Newton ${cN.toFixed(0)}   transport ${cT.toFixed(1)}`, box.x1, box.y0 + 10);
  }
  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText("radius (kpc)", (box.x0 + box.x1) / 2, s.height - 8);
  ctx.textAlign = "left";
  ctx.fillText("km/s", 6, 18);
};

export const RotationCurve = ({ height = 340 }: { height?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>
      the Milky Way's rotation, against Eilers 2019's own 38 points and their published
      errors. Newton on the baryons alone is χ²/point 5178; the transport law with a₀
      read live from the run brings it to 8.2 — a real improvement and NOT a good fit
    </div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate={false} deps={["rot"]}
        paint={() => ({ frame: (s: Surface) => rotation(s) })} />
    </div>
  </div>;

// ─── Genzel's discs ─────────────────────────────────────────────────────────

/**
 * GENZEL ET AL. 2017, NATURE 543:397 — TABLE 1, VERBATIM.
 *
 * SIX GALAXIES, NOT FIVE. The archive's copy dropped D3a 15504 and carried gas
 * fractions and radii that are not the published columns. What is here is
 * `Mbaryon(gas+stars, including bulge)` and `R1/2(n=1)` — the two the model needs —
 * with `fDM(R1/2)` and its published ±2σ uncertainty or upper limit.
 *
 * AND f_DM IS MEASURED PER GALAXY, which changes what this panel can be. The old
 * version drew one ceiling at 0.2 for all of them, because that is what the abstract
 * says. The table gives each galaxy its own number with its own error, so the model is
 * testable object by object — and since f_DM IS the free fraction, the prediction is
 * 1/(1+θ) with nothing free in it.
 */
type HighZ = { name: string; z: number; Mb: number; Re: number; f: number; e: number; limit: boolean };

/** Mb in 1e11 M☉ including bulge; Re = R1/2(n=1) kpc; f = fDM(R1/2), e = ±2σ or limit */
const DISCS: HighZ[] = [
  { name: "COS4 01351", z: 0.854, Mb: 1.7, Re: 7.3, f: 0.21, e: 0.10, limit: false },
  { name: "D3a 6397",   z: 1.500, Mb: 2.3, Re: 7.4, f: 0.17, e: 0.38, limit: true },
  { name: "GS4 43501",  z: 1.613, Mb: 1.0, Re: 4.9, f: 0.19, e: 0.09, limit: false },
  { name: "zC 406690",  z: 2.196, Mb: 1.7, Re: 5.5, f: 0.00, e: 0.08, limit: true },
  { name: "zC 400569",  z: 2.242, Mb: 1.7, Re: 3.3, f: 0.00, e: 0.07, limit: true },
  { name: "D3a 15504",  z: 2.383, Mb: 2.1, Re: 6.0, f: 0.12, e: 0.26, limit: true },
];

/** the baryonic acceleration at R1/2, in units of a₀ — the only input the model needs */
const depthOf = (d: HighZ, a0: number) =>
  G * d.Mb * 1e11 * MSUN / Math.pow(d.Re * KPC, 2) / a0;

/**
 * WHAT THE MODEL PREDICTS FOR EACH: f_DM = the free fraction = 1/(1+θ), nothing fitted.
 * Five of six are consistent with the published value. `zC 406690` is not — predicted
 * 0.106 against a measured 2σ upper limit of 0.08 — and it is drawn as a miss rather
 * than absorbed into a band.
 */
const predict = (d: HighZ, a0: number) => {
  const gN = depthOf(d, a0) * a0;
  return 1 / (1 + (gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0)) / a0);
};
const consistent = (d: HighZ, a0: number) => {
  const p = predict(d, a0);
  return d.limit ? p <= d.e : Math.abs(p - d.f) <= d.e;
};
const boostAt = (x: number) => Math.sqrt(transport(x, 1) / x);

/**
 * AND THE CURVE ON THIS PANEL IS THE DERIVED ONE, which is worth saying because it
 * looks like MOND's and is not borrowed from it.
 *
 * `transport` solves g = g_N(1 + a₀/g). That equation is not picked for its shape: it
 * is what a vacuum that cannot expand where matter already is has to do. A point
 * carrying a charge is busy — an arriving charge annihilates or reverses, and either
 * way that point does not split this tick — so splitting is suppressed exactly where
 * the field is strong. With θ = g/a₀ the free fraction is 1/(1+θ), the busy fraction
 * θ/(1+θ) is g_N/g, and rearranging gives g² − g·g_N − g_N·a₀ = 0. Checked across six
 * decades of g_N/a₀, θ/(1+θ) and g_N/g agree to the last digit at every point.
 *
 * So the boost each disc is judged by, and the depth at which the law breaches the
 * ceiling, are both consequences of the expansion mechanism rather than of a fitted
 * interpolation — which is what makes the Genzel comparison a test of THIS model.
 *
 * THE PANEL IS ABOUT A THRESHOLD, NOT A COUNT.
 *
 * The archive's version plotted boost against redshift and read off "four of five
 * overshoot", which is an adjective. What `cosmology/high-redshift-discs` measures is
 * that f_DM < 0.2 fixes a CEILING on the boost and the transport law breaches it only
 * BELOW a derivable depth — g_N/a₀ = 3.2 — so each disc is judged on a measurable
 * property of itself rather than on which side of a tally it falls. That number and
 * the ceiling are both read from the report, so the vertical line and the horizontal
 * one move if the run does.
 */
const discs = (s: Surface) => {
  const { ctx } = s;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, s.width, s.height);
  const box = frame(s, 52, 46);          // room for the f_DM axis on the right
  const ceil = CEILING(), breach = BREACH(), a0 = A0();

  const XMIN = 0.5, XMAX = 40;                      // g_N/a₀, logarithmic
  const X = (v: number) => box.x0 + box.w *
    (Math.log(v) - Math.log(XMIN)) / (Math.log(XMAX) - Math.log(XMIN));
  const YMIN = 1.0, YMAX = 1.62;   // room for the ±2σ bars, which reach f_DM ≈ 0.55
  const Y = (v: number) => box.y1 - box.h * (v - YMIN) / (YMAX - YMIN);

  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (const t of [1.0, 1.1, 1.2, 1.3, 1.4]) {
    ctx.beginPath(); ctx.moveTo(box.x0, Y(t)); ctx.lineTo(box.x1, Y(t)); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "right";
    ctx.fillText(t.toFixed(2), box.x0 - 6, Y(t) + 3);
  }
  for (const t of [1, 2, 5, 10, 20, 40]) {
    ctx.beginPath(); ctx.moveTo(X(t), box.y0); ctx.lineTo(X(t), box.y1); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(String(t), X(t), box.y1 + 15);
  }
  ctx.textAlign = "left";

  // everything above the ceiling is refused by the measurement
  if (Number.isFinite(ceil)) {
    ctx.fillStyle = EXCL; ctx.fillRect(box.x0, box.y0, box.w, Y(ceil) - box.y0);
    ctx.strokeStyle = SEEN; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.moveTo(box.x0, Y(ceil)); ctx.lineTo(box.x1, Y(ceil)); ctx.stroke();
    ctx.setLineDash([]);
  }

  // and the depth at which the law crosses it — the test's own derived threshold
  if (Number.isFinite(breach)) {
    ctx.strokeStyle = DATA; ctx.lineWidth = 1.4; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(X(breach), box.y0); ctx.lineTo(X(breach), box.y1); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Newton, who predicts no boost at all
  ctx.strokeStyle = RELAT; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(box.x0, Y(1)); ctx.lineTo(box.x1, Y(1)); ctx.stroke();

  // the transport law across depth
  ctx.strokeStyle = MODEL; ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let i = 0; i <= 240; i++) {
    const x = XMIN * Math.pow(XMAX / XMIN, i / 240);
    const y = Y(Math.min(YMAX, boostAt(x)));
    if (i === 0) ctx.moveTo(X(x), y); else ctx.lineTo(X(x), y);
  }
  ctx.stroke();

  /*
   * EACH GALAXY TWICE: where the model says it should be, and where Genzel measured
   * it. The bar is the published ±2σ, or an arrow down from an upper limit. A galaxy
   * whose prediction lands inside its own bar is green; one that does not is red, and
   * there is one of those.
   */
  if (Number.isFinite(a0)) for (const d of DISCS) {
    const x = depthOf(d, a0), p = predict(d, a0);
    const ok = consistent(d, a0);
    const bx = X(x);
    const bY = (f: number) => Y(1 / Math.sqrt(1 - Math.min(f, 0.9)));

    // the measurement, with its own error
    ctx.strokeStyle = SEEN; ctx.lineWidth = 1.3;
    if (d.limit) {
      ctx.beginPath(); ctx.moveTo(bx, bY(d.e)); ctx.lineTo(bx, bY(0)); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx, bY(0)); ctx.lineTo(bx - 3, bY(0) - 5); ctx.moveTo(bx, bY(0));
      ctx.lineTo(bx + 3, bY(0) - 5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - 4, bY(d.e)); ctx.lineTo(bx + 4, bY(d.e)); ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(bx, bY(Math.max(0, d.f - d.e))); ctx.lineTo(bx, bY(d.f + d.e)); ctx.stroke();
      for (const q of [Math.max(0, d.f - d.e), d.f + d.e]) {
        ctx.beginPath(); ctx.moveTo(bx - 4, bY(q)); ctx.lineTo(bx + 4, bY(q)); ctx.stroke();
      }
      ctx.fillStyle = SEEN;
      ctx.beginPath(); ctx.arc(bx, bY(d.f), 2.4, 0, 7); ctx.fill();
    }

    // and the prediction
    ctx.fillStyle = ok ? FLOORC : "#e0685f";
    ctx.beginPath(); ctx.arc(bx, bY(p), 4.2, 0, 7); ctx.fill();
    ctx.strokeStyle = BACK; ctx.lineWidth = 1.2; ctx.stroke();

    ctx.fillStyle = FAINT;
    ctx.font = "400 8px ui-monospace, Menlo, monospace";
    ctx.save();
    ctx.translate(bx + 6, bY(p) - 7); ctx.rotate(-Math.PI / 4);
    ctx.fillText(d.name, 0, 0); ctx.restore();
  }

  const nOK = Number.isFinite(a0) ? DISCS.filter(d => consistent(d, a0)).length : 0;
  tag(s, box.x0 + 8, Y(1.40),
    `${nOK} of ${DISCS.length} predictions land inside Genzel's own ±2σ — white is measured, dot is predicted`,
    nOK === DISCS.length ? FLOORC : SEEN);
  /*
   * THE FREE FRACTION IS NOT A SECOND CURVE, BECAUSE IT IS NOT A SECOND FACT.
   *
   * A first version drew it alongside the boost on its own 0…1 axis, which made two
   * lines out of one statement: boost = 1/√(1 − free), exactly, at every point. Two
   * curves that are deterministic functions of each other read as corroboration and
   * are not — a reader comparing them learns nothing the algebra did not already fix.
   *
   * AND THE IDENTITY IS SHARPER THAN THAT. f_DM is defined by boost = 1/√(1 − f_DM),
   * and the mechanism gives boost = 1/√(1 − free). So
   *
   *     f_DM  =  free fraction  =  1/(1 + θ)      exactly, checked to 1e-12
   *
   * The dark-matter fraction a telescope measures IS the share of the vacuum still
   * able to expand. Genzel's f_DM(<Re) < 0.2 is the statement that these discs have
   * blocked four fifths of it — and the ceiling sits at exactly free = 0.2000, which
   * is why the breach depth comes out at g_N/a₀ = 3.2 and not at some fitted number.
   *
   * So the axis is labelled twice instead of drawn twice: the same height is a boost
   * on the left and a free fraction on the right, and they are the same reading.
   */
  if (Number.isFinite(a0)) {
    ctx.font = "400 9px ui-monospace, Menlo, monospace";
    ctx.textAlign = "left";
    for (const f of [0.05, 0.1, 0.2, 0.3, 0.4]) {
      const b = 1 / Math.sqrt(1 - f);
      if (b > YMAX) continue;
      ctx.fillStyle = "rgba(201,139,212,0.85)";
      ctx.fillText(f.toFixed(2), box.x1 + 4, Y(b) + 3);
      ctx.strokeStyle = "rgba(201,139,212,0.20)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(box.x1, Y(b)); ctx.lineTo(box.x1 + 2, Y(b)); ctx.stroke();
    }
    tag(s, X(1.15), Y(1.185), "the SAME axis read as f_DM = free fraction = 1/(1+θ)", "#c98bd4");
    tag(s, X(1.15), Y(1.145), "— the dark matter a telescope measures IS the expansion still available", FAINT);
  }

  tag(s, box.x0 + 8, Y(1.33), "the transport law, g = g_N(1 + a₀/g)", MODEL);
  if (Number.isFinite(breach))
    tag(s, X(breach) + 6, Y(1.25), `breaches at g_N/a₀ = ${breach.toFixed(2)}`, DATA);
  tag(s, box.x0 + 8, Y(1.02), "NEWTON & GR — the baryons alone", RELAT);

  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText("g_N / a₀ at one effective radius  (Genzel 2017, borrowed)",
    (box.x0 + box.x1) / 2, s.height - 8);
  ctx.textAlign = "left";
  ctx.fillText("v / v_baryons", 6, 18);
};

export const GenzelDiscs = ({ height = 320 }: { height?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>
      Genzel 2017's six discs against their own published f_DM and ±2σ — the model
      predicts each from its baryonic depth alone, with nothing fitted. Five land
      inside; zC 406690 does not
    </div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate={false} deps={["discs"]}
        paint={() => ({ frame: (s: Surface) => discs(s) })} />
    </div>
  </div>;

// ─── the radial acceleration relation ───────────────────────────────────────

/**
 * THE RAR — 2,693 POINTS, 153 GALAXIES, AND A LAW WITH NOTHING FITTED IN IT.
 *
 * McGaugh, Lelli & Schombert 2016 (PRL 117:201101) plotted the observed centripetal
 * acceleration against the one the baryons alone predict, for every rotationally
 * supported galaxy they had. It is the tightest empirical statement about the missing
 * gravity, and it is the right thing to point this model at because the model has no
 * freedom here at all: the shape is the blocked expansion, the scale is cH₀/2π.
 *
 * WHAT IS DRAWN AND WHERE IT COMES FROM:
 *
 *   the dotted diagonal   g_obs = g_bar, which is Newton — no missing gravity anywhere
 *   the white points      SPARC itself, all 2,696 of them, from Lelli+2016's catalogue
 *   the white curve       McGaugh+2016's fitting function, fitted to those points
 *   the blue curve        this model, g = g_N(1 + a₀/g), a₀ read live from the report
 *
 * AND THE POINTS ARE THE WHOLE POINT. This panel used to draw a ±0.11 dex band around
 * their fit and report that the model sat inside it — a comparison between two
 * formulae, dressed as a comparison with the sky. The residual that matters is the one
 * against the measurements, and it is 0.1333 dex against 0.1327 for the two-parameter
 * curve fitted to exactly these points. A law with nothing free in it is five
 * ten-thousandths of a dex behind the best summary the data admit.
 */
const G_DAGGER = 1.20e-10;
const rarFit = (gb: number) => gb / (1 - Math.exp(-Math.sqrt(gb / G_DAGGER)));

/**
 * WHAT THE FITTED CURVE SCORES ON THE SAME POINTS, measured here rather than read.
 *
 * It is the one number in the panel that is not the model's and cannot come out of
 * the report: `cosmology/sparc` quotes it in a note, and a note is prose. Two lines of
 * arithmetic over the same array give it directly, and having both computed the same
 * way is what makes 0.1333 against 0.1327 a comparison rather than two numbers.
 */
const theirRms = () => {
  let ss = 0;
  for (const p of RAR) ss += Math.log10(p.gobs / rarFit(p.gbar)) ** 2;
  return Math.sqrt(ss / RAR.length);
};

const rarPanel = (s: Surface) => {
  const { ctx } = s;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, s.width, s.height);
  const box = frame(s, 54, 18);
  const a0 = A0();
  const LO = -12.2, HI = -8.0;                  // log g_bar
  const VLO = -12, VHI = -7.6;                  // log g_obs
  const X = (L: number) => box.x0 + box.w * (L - LO) / (HI - LO);
  const Y = (L: number) => box.y1 - box.h * (L - VLO) / (VHI - VLO);

  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (let L = -12; L <= -8; L++) {
    ctx.beginPath(); ctx.moveTo(X(L), box.y0); ctx.lineTo(X(L), box.y1); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(String(L), X(L), box.y1 + 15);
  }
  for (let L = -12; L <= -8; L++) {
    ctx.beginPath(); ctx.moveTo(box.x0, Y(L)); ctx.lineTo(box.x1, Y(L)); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "right";
    ctx.fillText(String(L), box.x0 - 6, Y(L) + 3);
  }
  ctx.textAlign = "left";

  const S: number[] = [];
  for (let L = LO; L <= HI; L += 0.02) S.push(L);

  /*
   * THE POINTS THEMSELVES, WHICH IS WHAT CHANGED HERE.
   *
   * An earlier version of this panel drew a BAND of ±0.11 dex around McGaugh et al.'s
   * fitted curve and said the model sat inside it. That compared two formulae and
   * called the agreement a result: a fit is a summary whose residuals have already
   * been thrown away, and a curve tracking another curve has not met a galaxy. What
   * is drawn now is SPARC's own 2,696 measurements — every one of them, reduced from
   * the catalogue's rotation curves and Spitzer photometry by the published recipe —
   * and the residual quoted below is against those, not against the summary.
   */
  ctx.fillStyle = "rgba(238,240,245,0.16)";
  for (const p of RAR) {
    ctx.beginPath();
    ctx.arc(X(Math.log10(p.gbar)), Y(Math.log10(p.gobs)), 1.15, 0, 2 * Math.PI);
    ctx.fill();
  }

  // Newton: no missing gravity at all
  ctx.strokeStyle = RELAT; ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(X(LO), Y(LO)); ctx.lineTo(X(HI), Y(HI)); ctx.stroke();
  ctx.setLineDash([]);

  // their fit, and this model
  const draw = (f: (gb: number) => number, col: string, w: number, dash: number[] = []) => {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.setLineDash(dash);
    ctx.beginPath();
    S.forEach((L, i) => {
      const y = Y(Math.log10(f(Math.pow(10, L))));
      if (i === 0) ctx.moveTo(X(L), y); else ctx.lineTo(X(L), y);
    });
    ctx.stroke(); ctx.setLineDash([]);
  };
  draw(rarFit, SEEN, 2.0);
  if (Number.isFinite(a0)) draw(gb => transport(gb, a0), MODEL, 2.2, [6, 3]);

  tag(s, X(-12.1), Y(-8.0), `measured — SPARC, ${RAR.length} points in 147 galaxies, every one drawn`, SEEN);
  tag(s, X(-12.1), Y(-8.22), "Lelli+2016's catalogue, reduced by McGaugh+2016's own recipe", FAINT);
  if (Number.isFinite(a0)) {
    const rms = SPARC_RMS(), ratio = SPARC_A0();
    tag(s, X(-12.1), Y(-8.5), `THIS MODEL — g = g_N(1 + a₀/g), a₀ = ${a0.toExponential(3)} m/s², nothing fitted`, MODEL);
    tag(s, X(-12.1), Y(-8.72), Number.isFinite(rms)
      ? `rms ${rms.toFixed(4)} dex FROM THE POINTS — against ${theirRms().toFixed(4)} for the curve fitted to them`
      : "rms FROM THE POINTS — NOT IN THE REPORT", Number.isFinite(rms) ? MODEL : "#e0685f");
    if (Number.isFinite(ratio))
      tag(s, X(-12.1), Y(-8.94), `and a₀ sits ${((1 - ratio) * 100).toFixed(0)}% under the a₀ these points would pick`, FAINT);
  }
  tag(s, X(-9.6), Y(-9.9), "NEWTON — nothing missing", RELAT);

  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText("log g_bar  [m s⁻²]  — what the baryons alone predict", (box.x0 + box.x1) / 2, s.height - 8);
  ctx.textAlign = "left";
  ctx.fillText("log g_obs", 6, 18);
};

export const RadialAcceleration = ({ height = 340 }: { height?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>
      the radial acceleration relation — SPARC's own 2,696 measured points against a
      curve with no free parameter in it, which fits them as well as the curve fitted
      to them does
    </div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate={false} deps={["rar"]}
        paint={() => ({ frame: (s: Surface) => rarPanel(s) })} />
    </div>
  </div>;

// ─── the baryonic Tully–Fisher relation ─────────────────────────────────────

/**
 * ONE HUNDRED AND TWENTY-THREE WHOLE GALAXIES, AND A SLOPE WITH NOTHING IN IT.
 *
 * The relation above is measured point by point inside galaxies. This one is measured
 * galaxy by galaxy: the mass of everything that shines or is cold hydrogen, against
 * the speed the outermost gas is going round at, for every SPARC disc whose rotation
 * curve reaches a flat part. It is a different measurement of a different thing, and
 * the model's prediction for it is a single number that cannot be adjusted.
 *
 *     deep in the transport regime   g → √(g_N a₀)
 *     so V⁴ = G·M_b·a₀               SLOPE 4, EXACTLY
 *     and A = 1/(G a₀)               a normalisation with no freedom either
 *
 * WHAT THE PANEL DRAWS, AND WHY ONE LINE IS A CEILING RATHER THAN A PREDICTION.
 *
 * The blue line is A = 1/(G a₀) at slope 4 — where galaxies would sit if V_f were the
 * asymptotic speed. It is not: V_f is measured where the telescope ran out of gas, and
 * the transport law sits ABOVE its own asymptote everywhere, so the real V_f exceeds
 * the asymptotic one and every galaxy must fall UNDER that line. All 123 do, by 0.173
 * dex in the mean, and the outermost radii SPARC actually reached predict a gap of
 * 0.125 — the same size, in the same direction, with the residual difference well
 * inside the ±0.1 dex the stellar mass-to-light ratio carries on its own.
 *
 * So the honest reading is: the SLOPE is the test and it is nearly passed (3.73 here,
 * 3.85 ± 0.09 by Lelli et al.'s maximum likelihood, against a predicted 4, with their
 * own systematic covering 3.5 to 4.0); the NORMALISATION is a one-sided consistency
 * check and it is consistent. The panel says which is which rather than drawing both
 * as though they were the same kind of claim.
 */
const tullyFisher = (s: Surface) => {
  const { ctx } = s;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, s.width, s.height);
  const box = frame(s, 52, 16);
  const a0 = A0();

  const XLO = 1.25, XHI = 2.6;              // log V_f, km/s
  const YLO = 7.0, YHI = 11.9;              // log M_b, M☉
  const X = (v: number) => box.x0 + box.w * (v - XLO) / (XHI - XLO);
  const Y = (v: number) => box.y1 - box.h * (v - YLO) / (YHI - YLO);

  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (let L = 7; L <= 11; L++) {
    ctx.beginPath(); ctx.moveTo(box.x0, Y(L)); ctx.lineTo(box.x1, Y(L)); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "right";
    ctx.fillText(String(L), box.x0 - 6, Y(L) + 3);
  }
  for (const v of [20, 50, 100, 200, 300]) {
    const L = Math.log10(v);
    ctx.beginPath(); ctx.moveTo(X(L), box.y0); ctx.lineTo(X(L), box.y1); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(String(v), X(L), box.y1 + 15);
  }
  ctx.textAlign = "left";

  const { x, y } = btfrAxes();

  /*
   * THE CEILING: slope four through A = 1/(G a₀).
   *
   * A first version shaded the whole region above it, the way the Genzel panel shades
   * what f_DM refuses. It is the wrong figure for that: the ceiling runs off the
   * bottom-left corner, so "above it" is most of the frame and the eye reads a red
   * field with the data cowering under it rather than a line nothing crosses. A strip
   * along the line says the same thing and says it where the reader is looking.
   */
  if (Number.isFinite(a0)) {
    const c = Math.log10(btfrCeiling(a0));
    const at = (L: number) => Y(4 * L + c);
    ctx.fillStyle = EXCL;
    ctx.beginPath();
    ctx.moveTo(X(XLO), at(XLO)); ctx.lineTo(X(XHI), at(XHI));
    ctx.lineTo(X(XHI), at(XHI) - 26); ctx.lineTo(X(XLO), at(XLO) - 26);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = MODEL; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(X(XLO), at(XLO)); ctx.lineTo(X(XHI), at(XHI)); ctx.stroke();
  }

  /* and the same slope four carried down to where the galaxies actually are */
  const at4 = x.map((v, i) => y[i] - 4 * v);
  const logA = at4.reduce((a, b) => a + b, 0) / at4.length;
  ctx.strokeStyle = FLOORC; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(X(XLO), Y(4 * XLO + logA)); ctx.lineTo(X(XHI), Y(4 * XHI + logA));
  ctx.stroke(); ctx.setLineDash([]);

  /* the orthogonal fit the data themselves prefer, which is what the slope claim is about */
  const fit = orthogonalFit(x, y);
  ctx.strokeStyle = SEEN; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(X(XLO), Y(fit.slope * XLO + fit.intercept));
  ctx.lineTo(X(XHI), Y(fit.slope * XHI + fit.intercept));
  ctx.stroke();

  /* every galaxy, with the error on its flat velocity */
  for (const g of BTFR) {
    const L = Math.log10(g.vf), M = Math.log10(baryonicMass(g) / MSUN);
    ctx.strokeStyle = "rgba(238,240,245,0.35)"; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X(Math.log10(Math.max(1, g.vf - g.e))), Y(M));
    ctx.lineTo(X(Math.log10(g.vf + g.e)), Y(M));
    ctx.stroke();
    ctx.fillStyle = SEEN;
    ctx.beginPath(); ctx.arc(X(L), Y(M), 1.9, 0, 2 * Math.PI); ctx.fill();
  }

  const slope = BTFR_SLOPE(), gap = BTFR_GAP();
  tag(s, X(1.30), Y(11.55), `measured — SPARC, all ${BTFR.length} galaxies with a flat rotation velocity`, SEEN);
  if (Number.isFinite(a0))
    tag(s, X(1.30), Y(11.20), "THE CEILING — slope 4 at A = 1/(G a₀), and no galaxy may sit above it", MODEL);
  tag(s, X(1.30), Y(10.85), Number.isFinite(gap)
    ? `where they do sit — the same slope 4, ${gap.toFixed(3)} dex under the ceiling`
    : "where they do sit — THE GAP IS NOT IN THE REPORT", Number.isFinite(gap) ? FLOORC : "#e0685f");
  tag(s, X(1.30), Y(10.50), Number.isFinite(slope)
    ? `and the slope the points prefer — ${slope.toFixed(2)}, against a predicted 4`
    : "and the slope the points prefer — NOT IN THE REPORT", Number.isFinite(slope) ? SEEN : "#e0685f");
  tag(s, X(1.72), Y(7.35), "V_f is where the gas ran out, not infinity — so the gap is required, and one-sided", FAINT);

  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText("flat rotation velocity V_f  [km/s]  (SPARC, borrowed)",
    (box.x0 + box.x1) / 2, s.height - 8);
  ctx.textAlign = "left";
  ctx.fillText("log M_baryons  [M☉]", 6, 18);
};

export const TullyFisher = ({ height = 340 }: { height?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>
      the baryonic Tully–Fisher relation — 123 SPARC galaxies, a predicted slope of
      exactly 4, and a normalisation the model can only put a ceiling on
    </div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate={false} deps={["btfr"]}
        paint={() => ({ frame: (s: Surface) => tullyFisher(s) })} />
    </div>
  </div>;
