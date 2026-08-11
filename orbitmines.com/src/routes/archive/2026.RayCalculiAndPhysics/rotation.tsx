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
 *     `reach`     Yukawa, λ = 1.6 Gpc     a deficit of 2·10⁻³ % at 30 kpc
 *     `carry`     1 + 2v²/c²              1.1·10⁻⁶ at 220 km/s
 *     `shows`     self-screening          nothing; a galaxy is transparent
 *
 * and the gap to close at 20 kpc is +195%. Between five and eight orders too
 * small, with no dial in the model that reaches.
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
const A0 = 1.2e-10;                                     // the MOND scale, for reference

/** the Milky Way's baryons, as measured rather than as fitted */
const DISK = { M: 5.0e10 * MSUN, Rd: 2.6 * KPC, h: 0.30 * KPC };
const GAS = { M: 1.2e10 * MSUN, Rd: 7.0 * KPC, h: 0.15 * KPC };
const BULGE = { M: 0.9e10 * MSUN, a: 0.5 * KPC };

type Disc = typeof DISK;

const sigma = (d: Disc, R: number) => d.M / (2 * Math.PI * d.Rd * d.Rd) * Math.exp(-R / d.Rd);

/**
 * The radial pull at r in the plane from one exponential disc, summed over the
 * disc — kept split into the part inside r and the part outside it, since that
 * split is the thing being asked about. Positive is inward.
 */
const discPull = (d: Disc, r: number, NR = 420, NP = 480) => {
  const RMAX = 12 * d.Rd;
  let inside = 0, outside = 0;
  for (let i = 0; i < NR; i++) {
    const R = RMAX * (i + 0.5) / NR, dR = RMAX / NR;
    const s = sigma(d, R) * R * dR;
    let acc = 0;
    for (let j = 0; j < NP; j++) {
      const p = 2 * Math.PI * (j + 0.5) / NP;
      const dx = R * Math.cos(p) - r, dy = R * Math.sin(p);
      const s2 = dx * dx + dy * dy + d.h * d.h;
      acc += dx / Math.pow(s2, 1.5);
    }
    const bit = -G * s * acc * (2 * Math.PI / NP);
    if (R < r) inside += bit; else outside += bit;
  }
  return { inside, outside };
};

/** the bulge is spherical, so here the shell theorem really does hold */
const bulgePull = (r: number) =>
  G * BULGE.M * (r * r) / Math.pow(r + BULGE.a, 2) / (r * r);

export type Point = {
  r: number;          // metres
  disc: number; gas: number; bulge: number;
  inside: number; outside: number; total: number;
};

/** everything, at one radius */
export const pullAt = (r: number): Point => {
  const a = discPull(DISK, r), b = discPull(GAS, r), c = bulgePull(r);
  return {
    r,
    disc: a.inside + a.outside, gas: b.inside + b.outside, bulge: c,
    inside: a.inside + b.inside + c,
    outside: a.outside + b.outside,
    total: a.inside + a.outside + b.inside + b.outside + c,
  };
};

const kms = (g: number, r: number) => Math.sqrt(Math.max(0, g * r)) / 1e3;

/** computed once and shared by both panels */
const CURVE: Point[] = (() => {
  const out: Point[] = [];
  for (let i = 1; i <= 60; i++) out.push(pullAt(i * 0.5 * KPC));
  return out;
})();

const OBSERVED = 220;                                   // km/s, flat, 5…25 kpc

// ---------------------------------------------------------------------------

const INK = "#c8cbd4", FAINT = "#5a5f6e", GRID = "rgba(255,255,255,0.055)";
const MODEL = "#4aa8eb", DATA = "#eb964a", FLOOR = "#8bd48b";
const PALE = "#6f7ba8", GASC = "#59806a", BULGEC = "#8a6f8f";

const frame = (s: Surface, pad = 46) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#08090d";
  ctx.fillRect(0, 0, width, height);
  return {
    x0: pad, x1: width - 14, y0: 12, y1: height - 26,
    w: width - 14 - pad, h: height - 38,
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

/**
 * THE ROTATION CURVE. What the model says, what each component of the baryons
 * contributes, what is measured, and — for scale rather than as a claim — what
 * a floor at a₀ would give.
 */
const curve = (s: Surface) => {
  const box = frame(s);
  const XMAX = 30, YMAX = 260;
  const { X, Y } = axes(s, box, XMAX, 0, YMAX,
    [5, 10, 15, 20, 25, 30], [50, 100, 150, 200, 250], v => String(v));

  // the measured flat disc, 5…25 kpc
  s.ctx.fillStyle = "rgba(235,150,74,0.10)";
  s.ctx.fillRect(X(5), Y(OBSERVED + 12), X(25) - X(5), Y(OBSERVED - 12) - Y(OBSERVED + 12));
  path(s, CURVE.filter(p => p.r / KPC >= 3), X, Y, () => OBSERVED, DATA, 2);

  path(s, CURVE, X, Y, p => Math.sqrt(A0 * p.total * p.r) / 1e3, FLOOR, 1.3, [4, 3]);

  path(s, CURVE, X, Y, p => kms(p.disc, p.r), PALE, 1.1);
  path(s, CURVE, X, Y, p => kms(p.gas, p.r), GASC, 1.1);
  path(s, CURVE, X, Y, p => kms(p.bulge, p.r), BULGEC, 1.1);
  path(s, CURVE, X, Y, p => kms(p.total, p.r), MODEL, 2.4);

  // placed against the computed values so nothing sits on a line it does not
  // belong to: disc peaks 173 near 6, gas 52 at 21, bulge 102 at 2.6, model
  // 168 at 11.5, floor 187 at 21, and the measured band spans 208…232.
  tag(s, X(13.4), Y(243), "measured — flat at 220 km/s", DATA);
  tag(s, X(21.4), Y(172), "a floor at a₀", FLOOR);
  tag(s, X(11.4), Y(190), "THE MODEL — Newton on the baryons", MODEL);
  tag(s, X(5.8), Y(152), "stars", PALE);
  tag(s, X(21.0), Y(40), "gas", GASC);
  tag(s, X(2.6), Y(88), "bulge", BULGEC);

  s.ctx.fillStyle = FAINT;
  s.ctx.font = "400 10px ui-monospace, Menlo, monospace";
  s.ctx.textAlign = "center";
  s.ctx.fillText("radius (kpc)", (box.x0 + box.x1) / 2, s.height - 4);
  s.ctx.textAlign = "left";
  s.ctx.fillText("km/s", 6, 20);
};

/**
 * AND THE SPLIT, which is the thing actually being asked. Inward from the mass
 * inside the orbit, outward from the mass beyond it, and the net.
 */
const split = (s: Surface) => {
  const box = frame(s);
  const XMAX = 30;
  const top = 1.18, bot = -0.35;                          // fractions of `inside`
  const { X, Y } = axes(s, box, XMAX, bot, top,
    [5, 10, 15, 20, 25, 30], [1, 0.75, 0.5, 0.25, 0, -0.25],
    v => v === 0 ? "0" : v.toFixed(2));

  s.ctx.strokeStyle = "rgba(255,255,255,0.22)"; s.ctx.lineWidth = 1;
  s.ctx.beginPath(); s.ctx.moveTo(box.x0, Y(0)); s.ctx.lineTo(box.x1, Y(0)); s.ctx.stroke();

  path(s, CURVE, X, Y, p => 1, PALE, 1.6, [4, 3]);
  path(s, CURVE, X, Y, p => p.outside / p.inside, DATA, 2.2);
  path(s, CURVE, X, Y, p => p.total / p.inside, MODEL, 2.2);

  tag(s, X(16.4), Y(1.09), "pull from inside r  (set to 1)", PALE);
  tag(s, X(15), Y(0.80), "net", MODEL);
  tag(s, X(13), Y(-0.16), "pull from OUTSIDE r — outward, so it subtracts", DATA);

  s.ctx.fillStyle = FAINT;
  s.ctx.font = "400 10px ui-monospace, Menlo, monospace";
  s.ctx.textAlign = "center";
  s.ctx.fillText("radius (kpc)", (box.x0 + box.x1) / 2, s.height - 4);
  s.ctx.textAlign = "left";
};

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

/** and where the pull comes from, inside the orbit and beyond it */
export const Split = ({ height = 260 }: { height?: number }) =>
  <Panel paint={split} height={height}
    note="does the mass outside cancel? — as a fraction of the pull from inside" />;
