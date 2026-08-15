/**
 * A GALAXY, RUN THROUGH THE MODEL'S OWN FORCE LAW — and drawn, because the
 * shape of the disagreement is the whole point and a table hides it.
 *
 * NO SHELL THEOREM IS ASSUMED ANYWHERE HERE. The radial pull at each radius is
 * summed directly over the entire mass distribution, ring by ring and angle by
 * angle, so the question "does the mass outside cancel, and with what sign" is
 * answered by the sum rather than by a theorem that only holds for spheres.
 *
 * WHAT THE MODEL PREDICTS FOR A GALAXY, and why it is just Newton on the
 * baryons — every other term it owns is checked and negligible:
 *
 *     the pull    GRAVITY·m_a·m_b/R²      G_LATTICE·l_P³/(MU·t_P²) = G exactly
 *     `reach`     Yukawa, λ = 1.55 Gpc    −1.9·10⁻¹⁰ on the pull at 30 kpc
 *     `carry`     1 + 2v²/c²              +2.4·10⁻⁷ at 30 kpc
 *     `shows`     self-screening          nothing; a galaxy is transparent
 *
 * (`reach` is worth being exact about, because the potential and the force do
 * not fall off together. e^{−x}/R is 1.9·10⁻⁵ down at 30 kpc, but the FORCE it
 * differentiates to is e^{−x}(1+x)/R², whose deficit is x²/2 — five orders
 * smaller again. It is the force a galaxy turns on, so it is the force quoted.)
 *
 * AND SO THE THREE ANSWERS, which is the whole panel:
 *
 *     r (kpc)    Newton    GR        this model   measured   missing
 *     5          192.4     +4.1e−7   +8.2e−7      234.3      +48%
 *     8          185.7     +3.8e−7   +7.7e−7      229.2      +52%
 *     20         128.0     +1.8e−7   +3.7e−7      208.8      +166%
 *     30         103.7     +1.2e−7   +2.4e−7      191.8      +242%
 *
 * (km/s; GR and the model as FRACTIONS of Newton's pull, since neither is
 * distinguishable from it at this width — the last column is the fractional
 * shortfall in the pull, which is the square of the shortfall in the speed.)
 *
 * The three theories agree to a part in a million. The data is out by a factor
 * of three. Whatever is wrong here, it is not something a 10⁻⁶ correction was
 * ever going to reach — and this model has no dial that is bigger.
 *
 * AND THE ANSWER TO "DOES THE OUTSIDE CANCEL". It does not, and it is worth
 * being exact about the sign because the intuition runs the other way:
 *
 *     r (kpc)   from inside r   from outside r   net        outside/inside
 *     2         6.171e−10       −1.643e−10       4.528e−10  −26.6%
 *     8         1.701e−10       −3.041e−11       1.397e−10  −17.9%
 *     20        2.863e−11       −2.066e−12       2.656e−11   −7.2%
 *     30        1.208e−11       −4.537e−13       1.163e−11   −3.8%
 *
 * (m/s², positive INWARD). For a SPHERE an exterior shell contributes exactly
 * nothing. A disc is not a sphere, so its exterior does act — and it pulls
 * OUTWARD, because the near arc of an exterior ring is closer than the far arc
 * and wins the inverse square. It does not cancel, and what it does is the
 * OPPOSITE of helping: it takes 27% off at 2 kpc and 4% off at 30.
 *
 * So the missing gravity cannot come from the outside failing to cancel. The
 * outside is already counted, already fails to cancel, and already subtracts.
 */

import { CanvasView, Surface } from "./canvas";

const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19;
const C = 2.99792458e8;
const A0 = 1.2e-10;                                     // the MOND scale, for reference
const GPC = 3.0857e25, LAM = 1.55 * GPC;                // `reach`, in metres

/** the Milky Way's baryons, as measured rather than as fitted */
const DISK = { M: 5.0e10 * MSUN, Rd: 2.6 * KPC, h: 0.30 * KPC };
const GAS = { M: 1.2e10 * MSUN, Rd: 7.0 * KPC, h: 0.15 * KPC };
const BULGE = { M: 0.9e10 * MSUN, a: 0.5 * KPC };

type Disc = typeof DISK;

const sigma = (d: Disc, R: number) => d.M / (2 * Math.PI * d.Rd * d.Rd) * Math.exp(-R / d.Rd);

/**
 * Worked out the first time it is asked for, and never if it is not.
 *
 * Every curve on this page is a ring sum over a whole galaxy, and a ring sum is
 * the one thing here expensive enough that WHEN it happens is visible: done at
 * import, it is time the page spends before it has drawn anything at all, for
 * panels that are thousands of pixels below the fold and may never be looked
 * at. Done at the first frame of the panel that wants it, it is time spent by a
 * canvas that is already on screen — and `CanvasView` only starts a canvas that
 * is on screen, so the reader pays for the pictures they actually reach.
 *
 * The value is the same value either way. Only the moment moves.
 */
const lazily = <T,>(make: () => T): (() => T) => {
  let made: T, ready = false;

  return () => {
    if (!ready) { made = make(); ready = true; }
    return made;
  };
};

/**
 * The cosine and sine of the ring angles, at one resolution.
 *
 * `2π(j+½)/NP` does not depend on the ring, on the radius being asked about, or
 * on which disc it is — it is the same NP angles every time — and yet it sat in
 * the innermost loop of four different sums, which between them go round some
 * fifty million times. So they are worked out once per NP and read after that.
 *
 * The numbers are the identical doubles the loop used to compute, so nothing
 * downstream shifts by a bit.
 */
const RINGS = new Map<number, { cos: Float64Array, sin: Float64Array }>();

const ringAngles = (NP: number) => {
  let made = RINGS.get(NP);
  if (made) return made;

  const cos = new Float64Array(NP), sin = new Float64Array(NP);
  for (let j = 0; j < NP; j++) {
    const p = 2 * Math.PI * (j + 0.5) / NP;
    cos[j] = Math.cos(p);
    sin[j] = Math.sin(p);
  }

  RINGS.set(NP, made = { cos, sin });
  return made;
};

/**
 * `s²` raised to the power an inverse-`d^p` force wants, which is the whole of
 * why these sums used to cost seconds.
 *
 * `Math.pow` with a fractional exponent is a general-purpose thing — a log, a
 * multiply and an exp — and at 1½ it is thirty times the cost of the square
 * root it actually is. `x^1.5` is `x·√x` and `x^1` is `x`, and both of those
 * are single instructions. Every call site here asks for one of the two.
 *
 * BIT-IDENTICAL, not merely close: √ is correctly rounded and so is the
 * multiply, and on the values these sums use the answer agrees with `Math.pow`
 * to the last bit — checked against the quoted curves before it was changed.
 * The general case is left as it was, for an exponent nothing asks for yet.
 */
const raised = (s2: number, e: number) =>
  e === 1.5 ? s2 * Math.sqrt(s2) : e === 1 ? s2 : Math.pow(s2, e);

/**
 * The radial pull at r in the plane from one exponential disc, summed over the
 * disc — kept split into the part inside r and the part outside it, since that
 * split is the thing being asked about. Positive is inward.
 */
const discPull = (d: Disc, r: number, NR = 420, NP = 480) => {
  const RMAX = 12 * d.Rd;
  const { cos, sin } = ringAngles(NP);
  const hh = d.h * d.h;
  let inside = 0, outside = 0;
  for (let i = 0; i < NR; i++) {
    const R = RMAX * (i + 0.5) / NR, dR = RMAX / NR;
    const s = sigma(d, R) * R * dR;
    let acc = 0;
    for (let j = 0; j < NP; j++) {
      const dx = R * cos[j] - r, dy = R * sin[j];
      const s2 = dx * dx + dy * dy + hh;
      acc += dx / raised(s2, 1.5);
    }
    const bit = -G * s * acc * (2 * Math.PI / NP);
    if (R < r) inside += bit; else outside += bit;
  }
  return { inside, outside };
};

/** the bulge is spherical, so here the shell theorem really does hold */
const bulgePull = (r: number) =>
  G * BULGE.M * (r * r) / Math.pow(r + BULGE.a, 2) / (r * r);

/**
 * WHAT IS MEASURED. Eilers et al. 2019 — Gaia DR2 crossed with APOGEE, 23,000
 * red giants, the Milky Way's circular speed from 5 to 25 kpc. It is a
 * DECLINING curve, not a flat one: 229.0 km/s at the Sun's 8.122 kpc, falling
 * at 1.7 km/s per kpc. Written as their fit rather than as invented points,
 * because that is what it is, and the fit is the published result.
 */
const MEASURED = (rkpc: number) => 229.0 - 1.7 * (rkpc - 8.122);
const MEASURED_FROM = 5, MEASURED_TO = 25;              // where they looked

/**
 * THE TRANSPORT ROUTE, WHICH IS THIS MODEL'S OWN — and the reason the constant
 * below is `A0_MODEL` rather than the measured `A0`.
 *
 * The carrier's drift falls with the density it is passing through, so flux
 * conservation `Φ = 4πr²·n·v` goes QUADRATIC in n and the profile turns over
 * from 1/r² to 1/r. Same algebra as MOND's simple interpolation, arrived at
 * from transport rather than assumed — see `caught` and the dark-matter section
 * in `gravity.ts`.
 *
 * The crossover is where the galaxy's own field falls to the scale the
 * EXPANSION already sets. The frontier cosmology forces `H₀ = 1/t₀` exactly, so
 *
 *     a₀ = c·H₀/2π = 1.096e−10 m/s²      against a measured 1.200e−10
 *
 * — 9% out, and NOTHING IN IT IS FITTED. That is the value drawn.
 */
const A0_MODEL = C * (70.9e3 / 3.0856775814913673e22) / (2 * Math.PI);
const mond = (g: number) => g / 2 + Math.sqrt(g * g / 4 + g * A0_MODEL);

export type Point = {
  r: number;          // metres
  disc: number; gas: number; bulge: number;
  inside: number; outside: number; total: number;

  /** fractional excesses over Newton's pull — all three of them tiny */
  gr: number;         // general relativity, the 1PN term: order v²/c²
  carry: number;      // this model's `carry`: 2v²/c²
  reach: number;      // this model's `reach`: negative, a Yukawa on the force
};

/** everything, at one radius */
export const pullAt = (r: number): Point => {
  const a = discPull(DISK, r), b = discPull(GAS, r), c = bulgePull(r);
  const total = a.inside + a.outside + b.inside + b.outside + c;

  // v²/c² at this radius, which is the size of every relativistic term here.
  // GR's coefficient is O(1) and depends on which speed you say you measured —
  // the coordinate one, the locally measured one, the one a Doppler shift
  // reports. The SIZE is the content; the coefficient is a rounding error on
  // a discrepancy of 242%, so it is written as 1 and said out loud.
  const vv = total * r / (C * C);
  const x = r / LAM;

  return {
    r,
    disc: a.inside + a.outside, gas: b.inside + b.outside, bulge: c,
    inside: a.inside + b.inside + c,
    outside: a.outside + b.outside,
    total,
    gr: vv,
    carry: 2 * vv,
    reach: Math.exp(-x) * (1 + x) - 1,
  };
};

const kms = (g: number, r: number) => Math.sqrt(Math.max(0, g * r)) / 1e3;

/** computed once, on the first panel that asks, and shared by all of them */
const CURVE = lazily((): Point[] => {
  const out: Point[] = [];
  for (let i = 1; i <= 60; i++) out.push(pullAt(i * 0.5 * KPC));
  return out;
});

// ---------------------------------------------------------------------------
// AND THE CAUGHT-PAIR LAW, which is the same sum with the force falling as 1/d.
//
// See `caught` in `gravity.ts`. A vacuum pair with one charge taken by each
// body links them at a rate going as ∫d³P/(r_A²r_B²) = π³/R, so the force is
// 1/R where Newton's is 1/R². The whole content here is what that does to a
// DISC, which is not something the point-mass argument settles.

/** the same ring sum, with the force falling as 1/d^p instead of 1/d² */
const discPullP = (d: Disc, r: number, p: number, NR = 420, NP = 480) => {
  const RMAX = 12 * d.Rd;
  const { cos, sin } = ringAngles(NP);
  const hh = d.h * d.h, e = (p + 1) / 2;
  let acc = 0;
  for (let i = 0; i < NR; i++) {
    const R = RMAX * (i + 0.5) / NR, dR = RMAX / NR;
    const s = sigma(d, R) * R * dR;
    let a = 0;
    for (let j = 0; j < NP; j++) {
      const dx = R * cos[j] - r, dy = R * sin[j];
      const d2 = dx * dx + dy * dy + hh;
      a += dx / raised(d2, e);                        // the unit vector, times 1/d^p
    }
    acc += -s * a * (2 * Math.PI / NP);
  }
  return acc;
};

/**
 * The caught-pair pull, in arbitrary units — there is one free coupling κ and
 * it is fixed below by matching the measured speed at the Sun. That is the
 * "one overall scale" the prose admits to, and it is the only thing fitted.
 *
 * IT ADDS TO NEWTON RATHER THAN REPLACING IT, which is what the mechanism
 * actually says: the direct meeting of A's charges with B's is still there and
 * still 1/R², and the vacuum-mediated term is a second channel on top. Written
 * as a replacement it fails in the inner galaxy for the obvious reason — 1/R is
 * too weak where Newton needs to be strong — and no interpolation function is
 * needed once it is written as the sum it is.
 *
 * The bulge is taken as its enclosed mass over r rather than summed: with a
 * 1/d force there is no shell theorem, but the bulge is compact and nearly
 * spherical and it is inside 2 kpc, where nothing being argued about happens.
 */
const caughtRaw = (r: number) =>
  discPullP(DISK, r, 1) + discPullP(GAS, r, 1) +
  BULGE.M * r / Math.pow(r + BULGE.a, 2);

/**
 * Newton plus the caught pair, with κ fitted at the Sun and nowhere else.
 * Against the Gaia curve it runs 0.981, 1.000, 0.996, 0.985, 0.964, 0.955,
 * 0.959, 0.974 at 6, 8, 10, 12, 16, 20, 25, 30 kpc — inside 4.5% across the
 * whole range the data covers, on one constant. Below 5 kpc it falls away, and
 * below 5 kpc there is no data either: the fit is not defined there.
 *
 * NOT DRAWN ON ANY PANEL YET — no `path` asks for it, so being `lazily` is the
 * difference between a second of work at import for a curve nobody sees and no
 * work at all. It is kept because the number above is a result and the code is
 * how it was got; put it on a panel and it costs what it costs, once.
 */
const CAUGHT = lazily((): { r: number; v: number }[] => {
  const R0 = 8.122 * KPC, at0 = pullAt(R0);
  const kappa =
    (Math.pow(MEASURED(8.122) * 1e3, 2) - at0.total * R0) / (caughtRaw(R0) * R0);

  return CURVE().map(p => ({
    r: p.r,
    v: Math.sqrt(Math.max(0, (p.total + kappa * caughtRaw(p.r)) * p.r)),
  }));
});

// ---------------------------------------------------------------------------

const INK = "#c8cbd4", FAINT = "#5a5f6e", GRID = "rgba(255,255,255,0.055)";
const MODEL = "#4aa8eb", DATA = "#eb964a", FLOOR = "#8bd48b";
const PALE = "#6f7ba8", GASC = "#59806a", BULGEC = "#8a6f8f";
const RELAT = "#9aa0b4";                                // grey, kept for `split`

// WHAT IS MEASURED IS WHITE, EVERYWHERE. It is the one line on any of these
// panels that is not a theory, so it gets the one colour that is not a choice —
// and general relativity takes the orange it used to have. The measured curve
// is then drawn UNDER both theories in the disc panel, in the same white, so
// each is read against the same thing rather than against the panel beside it.
const SEEN = "#eef0f5", GHOST = "rgba(238,240,245,0.40)";

const frame = (s: Surface, pad = 46) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#08090d";
  ctx.fillRect(0, 0, width, height);
  return {
    // The bottom pad carries two lines — the tick labels and the axis caption
    // — so it is deep enough for both. It was not, and they sat on top of one
    // another, which is the sort of thing only looking at it tells you.
    x0: pad, x1: width - 14, y0: 12, y1: height - 36,
    w: width - 14 - pad, h: height - 48,
  };
};

const axes = (
  s: Surface, box: ReturnType<typeof frame>,
  xmax: number, ymin: number, ymax: number,
  xticks: number[], yticks: number[], yfmt: (v: number) => string,
) => {
  const { ctx } = s;
  const X = (r: number) => box.x0 + box.w * r / xmax;
  const Y = (v: number) => box.y1 - box.h * (v - ymin) / (ymax - ymin);

  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (const t of yticks) {
    ctx.beginPath(); ctx.moveTo(box.x0, Y(t)); ctx.lineTo(box.x1, Y(t)); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "right";
    ctx.fillText(yfmt(t), box.x0 - 6, Y(t) + 3);
  }
  for (const t of xticks) {
    ctx.beginPath(); ctx.moveTo(X(t), box.y0); ctx.lineTo(X(t), box.y1); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(String(t), X(t), box.y1 + 15);
  }
  ctx.textAlign = "left";
  return { X, Y };
};

const path = (
  s: Surface, pts: Point[], X: (r: number) => number, Y: (v: number) => number,
  of: (p: Point) => number, css: string, wide = 1.6, dash: number[] = [],
) => {
  const { ctx } = s;
  ctx.strokeStyle = css; ctx.lineWidth = wide; ctx.setLineDash(dash);
  ctx.beginPath();
  pts.forEach((p, i) => {
    const x = X(p.r / KPC), y = Y(of(p));
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
  ctx.setLineDash([]);
};

const tag = (s: Surface, x: number, y: number, text: string, css: string) => {
  const { ctx } = s;
  ctx.fillStyle = css;
  ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(text, x, y);
};

/** the x-axis caption, kept off the ticks it used to sit on top of */
const under = (s: Surface, box: ReturnType<typeof frame>, text: string) => {
  s.ctx.fillStyle = FAINT;
  s.ctx.font = "400 10px ui-monospace, Menlo, monospace";
  s.ctx.textAlign = "center";
  s.ctx.fillText(text, (box.x0 + box.x1) / 2, s.height - 5);
  s.ctx.textAlign = "left";
};

/**
 * THE ROTATION CURVE, with all three answers on it: what Newton says, what GR
 * says, what this model says, and what Gaia measured. The first three are one
 * line, because they agree to a part in a million — which is the panel's
 * point, and why the next one exists to show that they really do differ.
 */
const curve = (s: Surface) => {
  const box = frame(s);
  const XMAX = 30, YMAX = 280;                          // headroom for the unit
  const { X, Y } = axes(s, box, XMAX, 0, YMAX,
    [5, 10, 15, 20, 25, 30], [50, 100, 150, 200, 250], v => String(v));

  // what was measured, over the radii it was measured at — and dotted where it
  // is being read outside them, since that is extrapolation and not data
  const inside = CURVE().filter(p => p.r / KPC >= MEASURED_FROM && p.r / KPC <= MEASURED_TO);
  s.ctx.fillStyle = "rgba(238,240,245,0.09)";
  s.ctx.beginPath();
  inside.forEach((p, i) => {
    const v = MEASURED(p.r / KPC);
    const x = X(p.r / KPC);
    if (i === 0) s.ctx.moveTo(x, Y(v * 1.025)); else s.ctx.lineTo(x, Y(v * 1.025));
  });
  for (let i = inside.length - 1; i >= 0; i--) {
    const p = inside[i];
    s.ctx.lineTo(X(p.r / KPC), Y(MEASURED(p.r / KPC) * 0.975));
  }
  s.ctx.closePath(); s.ctx.fill();

  path(s, CURVE().filter(p => p.r / KPC <= MEASURED_FROM), X, Y,
    p => MEASURED(p.r / KPC), SEEN, 1.4, [3, 3]);
  path(s, CURVE().filter(p => p.r / KPC >= MEASURED_TO), X, Y,
    p => MEASURED(p.r / KPC), SEEN, 1.4, [3, 3]);
  path(s, inside, X, Y, p => MEASURED(p.r / KPC), SEEN, 2.2);

  path(s, CURVE(), X, Y, p => kms(mond(p.total), p.r), FLOOR, 1.3, [5, 4]);

  path(s, CURVE(), X, Y, p => kms(p.disc, p.r), PALE, 1.1);
  path(s, CURVE(), X, Y, p => kms(p.gas, p.r), GASC, 1.1);
  path(s, CURVE(), X, Y, p => kms(p.bulge, p.r), BULGEC, 1.1);
  path(s, CURVE(), X, Y, p => kms(p.total, p.r), MODEL, 2.4);

  // Placed against the computed values, so nothing sits on a line it does not
  // belong to. Newton peaks 192.8 at 5.5 and is 103.7 at 30; MOND peaks 231.6
  // at 7.6 and is 200.9 at 30; measured runs 239 at 1 kpc to 191.8 at 30;
  // stars peak 172.5 at 6, gas 53.1 at 15, bulge 111 at 2.
  tag(s, X(1.2), Y(272), "measured — Gaia DR2 × APOGEE", SEEN);
  tag(s, X(13.6), Y(252), "THE TRANSPORT ROUTE — a₀ = cH₀/2π, computed not fitted", FLOOR);
  tag(s, X(11.0), Y(178), "NEWTON = GR = THE FORCE LAW ALONE", MODEL);
  tag(s, X(21.6), Y(97), "stars", PALE);
  tag(s, X(24.6), Y(38), "gas", GASC);
  tag(s, X(3.3), Y(70), "bulge", BULGEC);

  under(s, box, "radius (kpc)");
  s.ctx.fillStyle = FAINT;
  s.ctx.font = "400 10px ui-monospace, Menlo, monospace";
  s.ctx.fillText("km/s", 6, 20);
};

/**
 * AND HOW FAR APART THE THREE OF THEM REALLY ARE — on a log axis, because a
 * linear one cannot show a difference of ten orders and a difference of a
 * factor of three on the same picture.
 *
 * Everything is a fraction of Newton's pull. The top line is what is missing.
 * The two in the middle are everything general relativity adds to Newton and
 * everything this model adds to Newton, and they are the same size because
 * this model has β = γ = 1 and reproduces the same 1PN term. The bottom line
 * is `reach`, which is the only genuinely NEW thing in this model's force law
 * — and it is thirteen orders below the problem.
 */
const apart = (s: Surface) => {
  const box = frame(s, 54);
  const XMAX = 30, LO = -13, HI = 1;                      // decades
  const { ctx } = s;

  const X = (r: number) => box.x0 + box.w * r / XMAX;
  const Y = (v: number) =>
    box.y1 - box.h * (Math.log10(Math.max(Math.abs(v), 1e-30)) - LO) / (HI - LO);

  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (let d = LO; d <= HI; d += 2) {
    const y = Y(Math.pow(10, d));
    ctx.beginPath(); ctx.moveTo(box.x0, y); ctx.lineTo(box.x1, y); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "right";
    ctx.fillText(d === 0 ? "1" : `1e${d}`, box.x0 - 6, y + 3);
  }
  for (const t of [5, 10, 15, 20, 25, 30]) {
    ctx.beginPath(); ctx.moveTo(X(t), box.y0); ctx.lineTo(X(t), box.y1); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(String(t), X(t), box.y1 + 15);
  }
  ctx.textAlign = "left";

  path(s, CURVE(), X, Y, p => Math.pow(MEASURED(p.r / KPC) * 1e3, 2) / (p.total * p.r) - 1,
    SEEN, 2.4);
  path(s, CURVE(), X, Y, p => p.gr, DATA, 2.2);
  path(s, CURVE(), X, Y, p => p.carry, MODEL, 2.2, [5, 3]);
  path(s, CURVE(), X, Y, p => p.reach, MODEL, 1.4, [2, 3]);

  // observed runs 0.48…2.42, GR 4.1e−7 down to 1.2e−7, `carry` twice that,
  // `reach` 5e−12 at 5 kpc to 1.9e−10 at 30 — so these do not collide
  tag(s, X(11), Y(6.0), "WHAT IS MISSING", SEEN);
  tag(s, X(1.2), Y(4.0e-6), "this model, `carry` — 2v²/c²", MODEL);
  tag(s, X(14.6), Y(2.2e-8), "general relativity beyond Newton — order v²/c²", DATA);
  tag(s, X(12.4), Y(4.0e-12), "this model, `reach` — and it SUBTRACTS", MODEL);

  under(s, box, "radius (kpc)");
};

/**
 * AND THE SPLIT, which is the thing actually being asked. Inward from the mass
 * inside the orbit, outward from the mass beyond it, and the net.
 */
const split = (s: Surface) => {
  const box = frame(s);
  const XMAX = 30;
  const top = 2.6, bot = -0.35;                          // fractions of `inside`
  const { X, Y } = axes(s, box, XMAX, bot, top,
    [5, 10, 15, 20, 25, 30], [2.5, 2, 1.5, 1, 0.5, 0],
    v => v === 0 ? "0" : v.toFixed(1));

  s.ctx.strokeStyle = "rgba(255,255,255,0.22)"; s.ctx.lineWidth = 1;
  s.ctx.beginPath(); s.ctx.moveTo(box.x0, Y(0)); s.ctx.lineTo(box.x1, Y(0)); s.ctx.stroke();

  // what the measurement needs, on the same scale — the pull Gaia's curve
  // implies, as a fraction of what the mass inside the orbit supplies
  path(s, CURVE(), X, Y,
    p => Math.pow(MEASURED(p.r / KPC) * 1e3, 2) / (p.r * p.inside), SEEN, 2.2);
  path(s, CURVE(), X, Y,
    p => mond(p.total) / p.inside, MODEL, 2.2);

  path(s, CURVE(), X, Y, p => 1, PALE, 1.6, [4, 3]);
  path(s, CURVE(), X, Y, p => p.outside / p.inside, DATA, 2.2);
  path(s, CURVE(), X, Y, p => p.total / p.inside, RELAT, 1.8, [5, 3]);

  tag(s, X(1.2), Y(2.42), "what is measured", SEEN);
  tag(s, X(1.2), Y(2.20), "this model", MODEL);
  tag(s, X(16.4), Y(1.09), "pull from inside r  (set to 1)", PALE);
  tag(s, X(13.4), Y(0.72), "NEWTON & GR, net", RELAT);
  tag(s, X(11.5), Y(-0.21), "pull from OUTSIDE r — outward, so it subtracts", DATA);

  under(s, box, "radius (kpc)");
};

// ---------------------------------------------------------------------------
// THE DISC, TURNING — three of them, side by side, under three different laws.
//
// A rotation curve is a graph and a graph hides what it means. What a rotation
// curve IS, is how fast the thing actually goes round, and the difference
// between these three theories is a difference you can watch: a spoke of stars
// laid down along one radius shears into a spiral at a rate set entirely by
// dΩ/dr, and the three laws shear it differently within one turn of the Sun.
//
// THIS IS KINEMATIC AND SAYS SO. Every star is put on the circular orbit its
// law gives at its radius and moved at that speed. It is not an N-body run and
// nothing here is self-consistent: no spiral structure forms, nothing responds
// to anything. The speeds are real — summed from the same baryons by the same
// code as the panels above — and the winding is what those speeds imply.

const GYR = 3.1557e16;

/** v at any radius, interpolated from a table computed on the half-kpc grid */
const speeder = (table: { r: number; v: number }[]) => (r: number) => {
  const x = r / (0.5 * KPC) - 1;
  if (x <= 0) return table[0].v * (r / table[0].r);       // solid body inside
  const i = Math.min(table.length - 2, Math.floor(x));
  const f = x - i;
  return table[i].v * (1 - f) + table[i + 1].v * f;
};

const LAWS = lazily(() => [
  {
    name: "NEWTON & GR",
    under: "the baryons alone — the two agree to a part in 10⁶",
    css: DATA,
    v: speeder(CURVE().map(p => ({ r: p.r, v: kms(p.total, p.r) * 1e3 }))),
  },
  {
    name: "MEASURED",
    under: "Gaia DR2 × APOGEE",
    css: SEEN,
    v: speeder(CURVE().map(p => ({ r: p.r, v: MEASURED(p.r / KPC) * 1e3 }))),
  },
  {
    name: "THIS MODEL",
    under: "the transport route — a₀ = cH₀/2π, computed",
    css: MODEL,
    v: speeder(CURVE().map(p => ({ r: p.r, v: Math.sqrt(mond(p.total) * p.r) }))),
  },
]);

const R_VIEW = 15 * KPC;                                  // as far as the data goes

/**
 * The background disc — sampled from the real surface density, so it is
 * centrally concentrated the way a galaxy is. It carries no information; it is
 * there so that the thing being sheared looks like a galaxy.
 */
const STARS = (() => {
  const out: { r: number; th: number }[] = [];
  let seed = 20260812;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

  const invert = (Rd: number) => {                        // M(<x) = 1 − e^{−x}(1+x)
    const u = rnd(); let lo = 0, hi = 14;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      if (1 - Math.exp(-m) * (1 + m) < u) lo = m; else hi = m;
    }
    return (lo + hi) / 2 * Rd;
  };

  for (let i = 0; i < 2600; i++) {
    const r = invert(rnd() < 0.19 ? GAS.Rd : DISK.Rd);
    if (r > R_VIEW) continue;
    out.push({ r, th: rnd() * 2 * Math.PI });
  }
  for (let i = 0; i < 300; i++)
    out.push({ r: BULGE.a * Math.sqrt(rnd()) * 2.0, th: rnd() * 2 * Math.PI });

  return out;
})();

/**
 * And the tracers, which carry all of it. Four spokes, EVENLY SPACED IN RADIUS
 * rather than drawn from the density — because the question is what happens
 * between 2 and 15 kpc, and a mass-weighted sample puts almost nothing there.
 * Each spoke starts as a straight radial line and is sheared by dΩ/dr alone.
 */
const TRACERS = (() => {
  const out: { r: number; th: number }[] = [];
  for (let s = 0; s < 4; s++)
    for (let i = 0; i <= 28; i++)
      out.push({ r: (5 + (10 * i) / 28) * KPC, th: s * Math.PI / 2 });
  return out;
})();

const discs = (() => {
  let t = 0;                                              // seconds, simulated

  return (s: Surface, dt: number) => {
    const { ctx, width, height } = s;

    t += dt * 0.12 * GYR;
    if (t > 0.5 * GYR) t = 0;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#08090d";
    ctx.fillRect(0, 0, width, height);

    const gap = 10, w = (width - gap * 2) / 3;
    const top = 32, side = Math.min(w, height - top - 22);

    LAWS().forEach((law, n) => {
      const x0 = n * (w + gap);
      const cx = x0 + w / 2, cy = top + side / 2;
      const k = side * 0.48 / R_VIEW;

      ctx.fillStyle = law.css;
      ctx.font = "600 10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(law.name, x0 + 2, 12);
      ctx.fillStyle = FAINT;
      ctx.font = "400 9.5px ui-monospace, Menlo, monospace";
      ctx.fillText(law.under, x0 + 2, 24);

      // the Sun's orbit, so all three carry one shared ruler
      ctx.strokeStyle = "rgba(255,255,255,0.11)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 8.122 * KPC * k, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = "rgba(190,195,208,0.20)";
      for (const st of STARS) {
        const th = st.th + law.v(st.r) / st.r * t;
        ctx.fillRect(cx + Math.cos(th) * st.r * k - 0.7,
          cy + Math.sin(th) * st.r * k - 0.7, 1.4, 1.4);
      }

      // The spokes, drawn as curves so the winding reads as a shape — and in
      // EVERY panel the measured spoke is drawn underneath as a ghost, because
      // three pictures side by side cannot be compared and two curves in one
      // picture can. Where the bright curve leaves the ghost is the error.
      const spokes = (of: (r: number) => number, css: string, wide: number,
        dash: number[]) => {
        ctx.strokeStyle = css; ctx.lineWidth = wide; ctx.setLineDash(dash);
        for (let s = 0; s < 4; s++) {
          ctx.beginPath();
          for (let i = 0; i <= 28; i++) {
            const tr = TRACERS[s * 29 + i];
            const th = tr.th + of(tr.r) / tr.r * t;
            const x = cx + Math.cos(th) * tr.r * k, y = cy + Math.sin(th) * tr.r * k;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.setLineDash([]);
      };

      if (n !== 1) spokes(LAWS()[1].v, GHOST, 1.3, [3, 3]);
      spokes(law.v, law.css, 1.7, []);

      ctx.fillStyle = law.css;
      for (const tr of TRACERS) {
        const th = tr.th + law.v(tr.r) / tr.r * t;
        ctx.fillRect(cx + Math.cos(th) * tr.r * k - 1.1,
          cy + Math.sin(th) * tr.r * k - 1.1, 2.2, 2.2);
      }
    });

    ctx.fillStyle = FAINT;
    ctx.font = "400 10px ui-monospace, Menlo, monospace";
    ctx.fillText(`${(t / GYR).toFixed(2)} Gyr — the Sun goes round once in 0.22`,
      2, height - 6);
    ctx.textAlign = "right";
    ctx.fillText("kinematic: each star on the circular orbit its own law gives, 5–15 kpc",
      width - 2, height - 6);
    ctx.textAlign = "left";
  };
})();

const Panel = (
  { paint, height, note }: { paint: (s: Surface) => void; height: number; note: string },
) => <div style={{ marginBottom: "1.1rem" }}>
  <div style={{
    fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
    color: FAINT, marginBottom: 6,
  }}>{note}</div>
  <div style={{ height, background: "#08090d" }}>
    <CanvasView animate={false} deps={[note]}
      paint={() => ({ frame: (s: Surface) => paint(s) })} />
  </div>
</div>;

/** the curve the model predicts, against the one that is measured */
export const Rotation = ({ height = 340 }: { height?: number }) =>
  <Panel paint={curve} height={height}
    note="the Milky Way, summed directly over its baryons — no shell theorem" />;

/** the same three, turning — because a curve hides what the curve means */
export const Discs = ({ height = 300 }: { height?: number }) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>four spokes of stars, sheared by three laws — Newton &amp; GR, what is measured, and this model</div>
    <div style={{ height, background: "#08090d" }}>
      <CanvasView deps={["discs"]} paint={() => ({ frame: discs })} />
    </div>
  </div>;

/** and the three theories against each other, where they can be told apart */
export const Apart = ({ height = 300 }: { height?: number }) =>
  <Panel paint={apart} height={height}
    note="everything Newton, GR and this model add, as a fraction of Newton's pull" />;

/** and where the pull comes from, inside the orbit and beyond it */
export const Split = ({ height = 260 }: { height?: number }) =>
  <Panel paint={split} height={height}
    note="does the mass outside cancel? — as a fraction of the pull from inside" />;

// ---------------------------------------------------------------------------
// THE HIGH-REDSHIFT DISCS, WHICH ARE WHERE THE MODEL'S OWN PREDICTION DIES.
//
// `a₀ = c/(2πt)` makes the acceleration scale a clock reading, so at z ≈ 2 it
// is three times today's and MORE of a galaxy should be boosted. Genzel et al.
// (2017) measure six massive discs at z = 0.85–2.24 and find the opposite:
// declining outer curves, baryon-dominated, f_DM(<Re) under 0.2.
//
// Drawn because a table of five numbers hides which way the disagreement runs,
// and because this is the prediction that distinguishes the model from the
// phenomenology it otherwise reproduces.

type HighZ = { name: string; z: number; logMs: number; fgas: number; Re: number };

/** Genzel et al. 2017, Nature 543, 397 — Table 1, approximately */
const DISCS: HighZ[] = [
  { name: "COS4_01351", z: 0.854, logMs: 11.07, fgas: 0.35, Re: 8.2 },
  { name: "D3a_6397", z: 1.500, logMs: 11.07, fgas: 0.45, Re: 7.4 },
  { name: "GS4_43501", z: 1.613, logMs: 10.71, fgas: 0.50, Re: 4.9 },
  { name: "zC_406690", z: 2.196, logMs: 10.62, fgas: 0.55, Re: 5.5 },
  { name: "zC_400569", z: 2.242, logMs: 11.07, fgas: 0.45, Re: 3.3 },
];

const H0_SI = 70.9e3 / 3.0856775814913673e22;
const A0_FIXED = C * H0_SI / (2 * Math.PI);
const a0At = (z: number) => A0_FIXED * (1 + z);        // coasting: 1+z = t₀/t

/** the boost over the purely baryonic speed, inside one effective radius */
const boostAt = (d: HighZ, a0: number, F = 1) => {
  const M = Math.pow(10, d.logMs) * MSUN / (1 - d.fgas);
  const gN = F * G * M / Math.pow(d.Re * KPC, 2);
  return Math.sqrt((gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0)) / gN);
};

/** what Genzel's f_DM < 0.2 allows, as a boost factor */
const ALLOWED = 1.12;

/**
 * AND WHAT THE SAME DISCS LOOK LIKE IF THE FIELD IS VEINED.
 *
 * `chance` divides by 4πr², a shell average, and every dot above is read off
 * that. `tests/veins.ts` measured what that average is an average OVER — ridges
 * along the lattice headings, wedges between them, and for a POINT source a
 * peak over mean of 4.3 with the fifth percentile at zero. The shell average
 * survives exactly (⟨F⟩ = 1 by construction), so the radial law and every
 * number on this plot are untouched; what is new is that the answer depends on
 * WHICH WAY you are looking, with the pattern fixed to the lattice.
 *
 * These discs are the most forgiving case there is. A ridge points along the
 * lattice rather than away from the source, so ridges from different parts of a
 * body are parallel and stack — but a body of radius Rs seen from r does smooth
 * anything finer than Rs/r, and the baryons of these galaxies sit inside about
 * one effective radius, so Rs/r ≈ 1 and almost all of the structure is gone.
 *
 * From `tests/veined.ts`, at Rs/r = 1: p95 = 1.0321, p05 = 0.9660. Those are the
 * numbers below, and they are quantiles rather than extremes so the bar is what
 * ninety per cent of directions fall inside.
 */
const F_RIDGE = 1.0321, F_WEDGE = 0.9660;

const highz = (s: Surface) => {
  const box = frame(s, 58);
  const { ctx } = s;
  const X = (z: number) => box.x0 + box.w * (z - 0.6) / 1.9;
  const Y = (b: number) => box.y1 - box.h * (b - 1.0) / 0.62;

  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (const t of [1.0, 1.1, 1.2, 1.3, 1.4, 1.5]) {
    ctx.beginPath(); ctx.moveTo(box.x0, Y(t)); ctx.lineTo(box.x1, Y(t)); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "right";
    ctx.fillText(t.toFixed(2), box.x0 - 6, Y(t) + 3);
  }
  for (const t of [1.0, 1.5, 2.0, 2.5]) {
    ctx.beginPath(); ctx.moveTo(X(t), box.y0); ctx.lineTo(X(t), box.y1); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(t.toFixed(1), X(t), box.y1 + 15);
  }
  ctx.textAlign = "left";

  // NEWTON & GR sit at exactly 1 — the baryons and nothing else
  ctx.strokeStyle = RELAT; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(box.x0, Y(1.0)); ctx.lineTo(box.x1, Y(1.0)); ctx.stroke();

  // what the measurement allows — everything above this line is excluded
  ctx.fillStyle = "rgba(235,90,90,0.10)";
  ctx.fillRect(box.x0, box.y0, box.w, Y(ALLOWED) - box.y0);
  ctx.strokeStyle = SEEN; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(box.x0, Y(ALLOWED)); ctx.lineTo(box.x1, Y(ALLOWED)); ctx.stroke();
  ctx.setLineDash([]);

  // and the five galaxies, under each reading
  for (const d of DISCS) {
    const bf = boostAt(d, A0_FIXED), bm = boostAt(d, a0At(d.z));
    ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(d.z), Y(bf)); ctx.lineTo(X(d.z), Y(bm)); ctx.stroke();

    // the veined reading: the same disc seen along a ridge and down a wedge.
    // Drawn as a capped bar offset a little to the right so it does not sit
    // under the model dot — the point of it is the WIDTH, and a marker hidden
    // behind another marker has no width to read.
    const hi = boostAt(d, a0At(d.z), F_RIDGE), lo = boostAt(d, a0At(d.z), F_WEDGE);
    const vx = X(d.z) + 7;
    ctx.strokeStyle = FLOOR; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(vx, Y(hi)); ctx.lineTo(vx, Y(lo)); ctx.stroke();
    for (const b of [hi, lo]) {
      ctx.beginPath(); ctx.moveTo(vx - 3, Y(b)); ctx.lineTo(vx + 3, Y(b)); ctx.stroke();
    }
    ctx.fillStyle = FLOOR;
    ctx.beginPath(); ctx.arc(vx, Y(hi), 2.2, 0, 2 * Math.PI); ctx.fill();
    ctx.beginPath(); ctx.arc(vx, Y(lo), 2.2, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = DATA;
    ctx.beginPath(); ctx.arc(X(d.z), Y(bf), 3.1, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = MODEL;
    ctx.beginPath(); ctx.arc(X(d.z), Y(bm), 3.6, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = FAINT;
    ctx.font = "400 8.5px ui-monospace, Menlo, monospace";
    ctx.save();
    ctx.translate(X(d.z) + 6, Y(bm) - 6); ctx.rotate(-Math.PI / 4);
    ctx.fillText(d.name, 0, 0);
    ctx.restore();
  }

  tag(s, X(0.66), Y(1.44), "EXCLUDED — Genzel measures f_DM(<Re) < 0.2, i.e. under 1.12", SEEN);
  tag(s, X(0.66), Y(1.325), "a₀ = cH₀/2π·(1+z) — THIS MODEL", MODEL);
  tag(s, X(0.66), Y(1.265), "a₀ fixed — ordinary MOND", DATA);
  tag(s, X(0.66), Y(1.205), "veined field — ridge to wedge, 90% of directions", FLOOR);
  tag(s, X(0.66), Y(1.028), "NEWTON & GR — the baryons alone", RELAT);

  under(s, box, "redshift");
  ctx.fillStyle = FAINT;
  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.fillText("v / v_baryons, inside one effective radius", 6, 20);
};

/** the prediction that dates the model, against the measurement that refuses it */
export const HighRedshift = ({ height = 320 }: { height?: number }) =>
  <Panel paint={highz} height={height}
    note="six massive discs at z ≈ 1–2 — where a₀ ∝ 1/t is refused, veined or not" />;

// ---------------------------------------------------------------------------
// AND THE SAME PICTURE AT z ≈ 2, WHICH IS WHERE THE READINGS COME APART.
//
// A disc like Genzel's GS4_43501 — 1.0e11 M☉ of baryons inside 4.9 kpc, so a
// compact, dense, fast thing — sheared under the three readings of a₀. What is
// measured there is a DECLINING curve, nearly baryonic; `a₀ ∝ 1/t` predicts a
// visibly flatter one; the mean-spacing reading puts a₀ back where it is today
// and lands on the measurement.

const HZ_M = 1.0e11 * MSUN, HZ_RD = 4.9 * KPC / 1.68;   // Re → exponential Rd
const HZ_Z = 1.613;

/** the same ring sum, for a single exponential disc of the high-z kind */
const hzNewton = (r: number, NRr = 300, NP = 300) => {
  const RMAX = 12 * HZ_RD, h = HZ_RD / 8;
  const { cos, sin } = ringAngles(NP);
  const hh = h * h;
  let acc = 0;
  for (let i = 0; i < NRr; i++) {
    const R = RMAX * (i + 0.5) / NRr, dRr = RMAX / NRr;
    const s = HZ_M / (2 * Math.PI * HZ_RD * HZ_RD) * Math.exp(-R / HZ_RD) * R * dRr;
    let a = 0;
    for (let j = 0; j < NP; j++) {
      const dx = R * cos[j] - r, dy = R * sin[j];
      a += dx / raised(dx * dx + dy * dy + hh, 1.5);
    }
    acc += -G * s * a * (2 * Math.PI / NP);
  }
  return acc;
};

const HZ_VIEW = 16 * KPC;

const HZ_LAWS = lazily(() => {
  const grid: { r: number; gN: number }[] = [];
  for (let i = 1; i <= 40; i++) {
    const r = i * 0.5 * KPC;
    grid.push({ r, gN: hzNewton(r) });
  }
  const speeder = (a0: number) => {
    const tab = grid.map(p => ({
      r: p.r,
      v: Math.sqrt(Math.max(0, (p.gN / 2 + Math.sqrt(p.gN * p.gN / 4 + p.gN * a0)) * p.r)),
    }));
    return (r: number) => {
      const x = r / (0.5 * KPC) - 1;
      if (x <= 0) return tab[0].v * (r / tab[0].r);
      const i = Math.min(tab.length - 2, Math.floor(x)), f = x - i;
      return tab[i].v * (1 - f) + tab[i + 1].v * f;
    };
  };
  return [
    {
      name: "NEWTON & GR", under: "the baryons alone — a declining curve",
      css: PALE, v: speeder(0),
    },
    {
      name: "THIS MODEL", under: "a₀ = cH₀/2π, constant in z",
      css: MODEL, v: speeder(A0_MODEL),
    },
    {
      name: "a₀ ∝ 1/t", under: `3× larger at z = ${HZ_Z} — refuted`,
      css: DATA, v: speeder(A0_MODEL * (1 + HZ_Z)),
    },
  ];
});

const HZ_STARS = (() => {
  const out: { r: number; th: number }[] = [];
  let seed = 606011;
  const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  for (let i = 0; i < 2000; i++) {
    const u = rnd(); let lo = 0, hi = 14;
    for (let k = 0; k < 40; k++) {
      const m = (lo + hi) / 2;
      if (1 - Math.exp(-m) * (1 + m) < u) lo = m; else hi = m;
    }
    const r = (lo + hi) / 2 * HZ_RD;
    if (r > HZ_VIEW) continue;
    out.push({ r, th: rnd() * 2 * Math.PI });
  }
  return out;
})();

const HZ_TRACERS = (() => {
  const out: { r: number; th: number }[] = [];
  for (let s = 0; s < 4; s++)
    for (let i = 0; i <= 28; i++)
      out.push({ r: (2 + (11 * i) / 28) * KPC, th: s * Math.PI / 2 });
  return out;
})();

const hzDiscs = (() => {
  let t = 0;
  return (s: Surface, dt: number) => {
    const { ctx, width, height } = s;
    t += dt * 0.06 * GYR;
    if (t > 0.26 * GYR) t = 0;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#08090d";
    ctx.fillRect(0, 0, width, height);

    const gap = 10, w = (width - gap * 2) / 3;
    const top = 32, side = Math.min(w, height - top - 22);

    HZ_LAWS().forEach((law, n) => {
      const x0 = n * (w + gap), cx = x0 + w / 2, cy = top + side / 2;
      const k = side * 0.48 / HZ_VIEW;

      ctx.fillStyle = law.css;
      ctx.font = "600 10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(law.name, x0 + 2, 12);
      ctx.fillStyle = FAINT;
      ctx.font = "400 9px ui-monospace, Menlo, monospace";
      ctx.fillText(law.under, x0 + 2, 24);

      ctx.strokeStyle = "rgba(255,255,255,0.11)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, 4.9 * KPC * k, 0, 2 * Math.PI); ctx.stroke();

      ctx.fillStyle = "rgba(190,195,208,0.20)";
      for (const st of HZ_STARS) {
        const th = st.th + law.v(st.r) / st.r * t;
        ctx.fillRect(cx + Math.cos(th) * st.r * k - 0.7,
          cy + Math.sin(th) * st.r * k - 0.7, 1.4, 1.4);
      }

      const spokes = (of: (r: number) => number, css: string, wide: number, dash: number[]) => {
        ctx.strokeStyle = css; ctx.lineWidth = wide; ctx.setLineDash(dash);
        for (let sp = 0; sp < 4; sp++) {
          ctx.beginPath();
          for (let i = 0; i <= 28; i++) {
            const tr = HZ_TRACERS[sp * 29 + i];
            const th = tr.th + of(tr.r) / tr.r * t;
            const x = cx + Math.cos(th) * tr.r * k, y = cy + Math.sin(th) * tr.r * k;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        ctx.setLineDash([]);
      };
      // Newton is the dashed grey ghost and the ceiling f_DM < 0.2 allows is
      // the dashed white one, so both references are in every panel.
      if (n !== 0) spokes(HZ_LAWS()[0].v, "rgba(111,123,168,0.45)", 1.2, [3, 3]);
      spokes((r: number) => HZ_LAWS()[0].v(r) * 1.118, GHOST, 1.2, [2, 4]);
      spokes(law.v, law.css, 1.7, []);
    });

    ctx.fillStyle = FAINT;
    ctx.font = "400 10px ui-monospace, Menlo, monospace";
    ctx.fillText(`${(t / GYR * 1e3).toFixed(0)} Myr — a compact disc at z = ${HZ_Z}`, 2, height - 6);
    ctx.textAlign = "right";
    ctx.fillText("grey dash = Newton, white dash = the f_DM < 0.2 ceiling — both in every panel",
      width - 2, height - 6);
    ctx.textAlign = "left";
  };
})();

/** the same shearing picture at z ≈ 2, where the readings of a₀ come apart */
export const HighZDiscs = ({ height = 300 }: { height?: number }) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>a compact disc at z ≈ 2 — Newton &amp; GR against two readings of a₀, with the measured ceiling in every panel</div>
    <div style={{ height, background: "#08090d" }}>
      <CanvasView deps={["hzdiscs"]} paint={() => ({ frame: hzDiscs })} />
    </div>
  </div>;

// ---------------------------------------------------------------------------
// THE HIGH-z DISCS AS ROTATION CURVES, which is the only way to see whether the
// model agrees with them. The panels above give a boost factor and a shear —
// neither lets you look at a curve and judge it, which is what the Milky Way
// panel allows and what these deserve too.
//
// Each galaxy: its baryons summed the same way as everywhere else, the model's
// prediction on top, and the band Genzel's f_DM(<Re) < 0.2 permits. The point
// is that a DECLINING curve is what is measured, so the model has to decline
// too — and at these densities it does, because g_N ≫ a₀ throughout.

const GZ: { name: string; z: number; logMs: number; fgas: number; Re: number }[] = [
  { name: "COS4_01351", z: 0.854, logMs: 11.07, fgas: 0.35, Re: 8.2 },
  { name: "D3a_6397", z: 1.500, logMs: 11.07, fgas: 0.45, Re: 7.4 },
  { name: "GS4_43501", z: 1.613, logMs: 10.71, fgas: 0.50, Re: 4.9 },
  { name: "zC_406690", z: 2.196, logMs: 10.62, fgas: 0.55, Re: 5.5 },
  { name: "zC_400569", z: 2.242, logMs: 11.07, fgas: 0.45, Re: 3.3 },
];

/** an exponential disc's own pull, summed ring by ring — no shell theorem */
const gzBaryons = (Mbar: number, Rd: number, r: number, NRr = 240, NP = 240) => {
  const RMAX = 12 * Rd, h = Rd / 8;
  const { cos, sin } = ringAngles(NP);
  const hh = h * h;
  let acc = 0;
  for (let i = 0; i < NRr; i++) {
    const R = RMAX * (i + 0.5) / NRr, dRr = RMAX / NRr;
    const s = Mbar / (2 * Math.PI * Rd * Rd) * Math.exp(-R / Rd) * R * dRr;
    let a = 0;
    for (let j = 0; j < NP; j++) {
      const dx = R * cos[j] - r, dy = R * sin[j];
      a += dx / raised(dx * dx + dy * dy + hh, 1.5);
    }
    acc += -G * s * a * (2 * Math.PI / NP);
  }
  return acc;
};

const GZ_CURVES = lazily(() => GZ.map(d => {
  const Mbar = Math.pow(10, d.logMs) * MSUN / (1 - d.fgas);
  const Rd = d.Re * KPC / 1.68;
  const pts: { r: number; bar: number; mod: number }[] = [];
  for (let i = 1; i <= 26; i++) {
    const r = i * 0.15 * d.Re * KPC;
    const gB = gzBaryons(Mbar, Rd, r);
    const gM = gB / 2 + Math.sqrt(gB * gB / 4 + gB * A0_MODEL);
    pts.push({ r, bar: Math.sqrt(Math.max(0, gB * r)), mod: Math.sqrt(Math.max(0, gM * r)) });
  }
  return { d, pts, Re: d.Re * KPC };
}));

const gzPanel = (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#08090d";
  ctx.fillRect(0, 0, width, height);

  const pad = 30, gap = 8;
  const w = (width - pad - gap * 4) / 5;
  const top = 42, bot = 30, hh = height - top - bot;
  const VMAX = 420;

  GZ_CURVES().forEach((g, n) => {
    const x0 = pad + n * (w + gap);
    const RMAXk = 3.0 * g.d.Re;
    const X = (rk: number) => x0 + w * Math.min(rk, RMAXk) / RMAXk;
    const Y = (v: number) => top + hh * (1 - Math.min(v, VMAX) / VMAX);
    const inside = g.pts.filter(p => p.r / KPC <= RMAXk);

    ctx.save();
    ctx.beginPath(); ctx.rect(x0, top - 2, w, hh + 4); ctx.clip();

    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    for (const v of [100, 200, 300, 400]) {
      ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x0 + w, Y(v)); ctx.stroke();
    }

    // the ceiling f_DM < 0.2 sets — drawn ONLY inside Re, which is where it
    // is quoted. Beyond Re the measurement says nothing and the model is free.
    const within = inside.filter(p => p.r <= g.Re);
    ctx.fillStyle = "rgba(238,240,245,0.13)";
    ctx.beginPath();
    within.forEach((p, i) => {
      const x = X(p.r / KPC), y = Y(p.bar / 1e3);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    for (let i = within.length - 1; i >= 0; i--)
      ctx.lineTo(X(within[i].r / KPC), Y(within[i].bar / 1e3 * 1.118));
    ctx.closePath(); ctx.fill();

    const line = (pts: typeof inside, of: (p: typeof inside[0]) => number,
      css: string, wide: number, dash: number[]) => {
      ctx.strokeStyle = css; ctx.lineWidth = wide; ctx.setLineDash(dash);
      ctx.beginPath();
      pts.forEach((p, i) => {
        const x = X(p.r / KPC), y = Y(of(p) / 1e3);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke(); ctx.setLineDash([]);
    };
    line(within, p => p.bar * 1.118, SEEN, 1.3, [4, 3]);
    line(inside, p => p.bar, PALE, 1.4, []);
    line(inside, p => p.mod, MODEL, 2.2, []);
    ctx.restore();

    // Re, and the two values that are actually being compared there
    ctx.strokeStyle = "rgba(255,255,255,0.20)"; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(X(g.d.Re), top); ctx.lineTo(X(g.d.Re), top + hh);
    ctx.stroke(); ctx.setLineDash([]);

    const at = g.pts.reduce((a, b) =>
      Math.abs(b.r - g.Re) < Math.abs(a.r - g.Re) ? b : a);
    const bx = X(g.d.Re);
    ctx.fillStyle = SEEN;
    ctx.beginPath(); ctx.arc(bx, Y(at.bar / 1e3 * 1.118), 2.6, 0, 2 * Math.PI); ctx.fill();
    ctx.fillStyle = MODEL;
    ctx.beginPath(); ctx.arc(bx, Y(at.mod / 1e3), 3.0, 0, 2 * Math.PI); ctx.fill();

    ctx.fillStyle = MODEL;
    ctx.font = "600 9px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(g.d.name, x0 + 1, 12);
    ctx.fillStyle = FAINT;
    ctx.font = "400 8.5px ui-monospace, Menlo, monospace";
    ctx.fillText(`z ${g.d.z.toFixed(2)}   Re ${g.d.Re.toFixed(1)}`, x0 + 1, 24);
    const ratio = at.mod / at.bar;
    ctx.fillStyle = ratio <= 1.118 ? "#8bd48b" : DATA;
    ctx.font = "500 8.5px ui-monospace, Menlo, monospace";
    ctx.fillText(`${ratio.toFixed(3)} ${ratio <= 1.118 ? "≤" : ">"} 1.118`, x0 + 1, 35);
  });

  ctx.fillStyle = FAINT;
  ctx.font = "400 9px ui-monospace, Menlo, monospace";
  ctx.textAlign = "right";
  for (const v of [100, 200, 300, 400]) {
    const y = top + hh * (1 - v / VMAX);
    ctx.fillText(String(v), pad - 4, y + 3);
  }
  ctx.fillText("out to 3 Re — dashed vertical is Re, where f_DM is quoted",
    width - 2, height - 6);
  ctx.textAlign = "left";
  ctx.fillText("km/s", 2, top - 8);
  ctx.fillStyle = MODEL;
  ctx.font = "500 9.5px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("the model", 2, height - 6);
  ctx.fillStyle = PALE;
  ctx.fillText("NEWTON & GR — baryons alone", 68, height - 6);
  ctx.fillStyle = SEEN;
  ctx.fillText("measured — the f_DM < 0.2 ceiling, inside Re", 236, height - 6);
};

/** the high-z discs as curves, which is the only way to judge the agreement */
export const HighZCurves = ({ height = 260 }: { height?: number }) =>
  <Panel paint={gzPanel} height={height}
    note="Genzel's five discs as rotation curves — the model against what is allowed" />;
