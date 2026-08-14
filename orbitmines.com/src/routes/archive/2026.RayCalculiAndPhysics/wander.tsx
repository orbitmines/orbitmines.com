/**
 * DOES A SQUARE PULSE EVER BECOME A ROUND ONE — drawn, because the answer is
 * half yes and a table hides which half.
 *
 * THE OBJECTION. A charge moves one cell a tick and a cell has 26 ways out of
 * it, so after `t` ticks a pulse is at CHEBYSHEV distance t — which is a CUBE
 * shell, not a sphere. The face rays have covered Euclidean t, the edge rays
 * √2 t, the corner rays √3 t. The closed form meanwhile divides by `4πr²`.
 * Those are different shapes, and scaling a cube gives a cube: the ratio
 * corner/face is 1.7321 at t = 10 and at t = 10³⁸ alike. Nothing about being
 * far away rounds it off.
 *
 * WHAT `wander` DOES ABOUT IT. `physics.ts` already carries the rule — a ray
 * takes one of the ways its direction is MADE OF instead of the direction
 * itself, so a (1,1,1) sometimes steps (1,0,0). That slows the diagonals in
 * Euclidean terms, which is exactly the right medicine, and with one `w` for
 * every class it takes the spread from 73% to 3.5%.
 *
 * AND THE 3.5% IS NOT IRREDUCIBLE, which is the finding here. A direction with
 * `n` non-zero components has mean speed `(1 − w(n−1)/n)·√n`, and setting that
 * to one solves in closed form:
 *
 *     w(n) = √n / (√n + 1)        0.5858 for an edge, 0.6340 for a corner
 *
 * — at which the mean speed is 1.000000000 in ALL 26 directions. The 3.5% was
 * the cost of insisting on a single `w`, not a fact about the lattice.
 *
 * SO WHAT SURVIVES AND WHAT DOES NOT. Three things were measured, and they do
 * not agree with each other:
 *
 *   the front's RADIUS      fixed. Every ray lands on the sphere of radius t,
 *                           exactly, and the drawn front is a circle.
 *   the shell's DENSITY     fixed, and this is the one that matters for the
 *                           physics: plain propagation puts 0.853553 of the
 *                           closed form's `SHEET/4πr²` through a shell, so `G`
 *                           would be out by 0.7286. Wandered — or with steps
 *                           costing their own length — it is 1.000000 exactly.
 *   the front's DIRECTIONS  NOT fixed, and it gets worse with distance. A
 *                           wandering beam's angular width goes as 1/√t, so
 *                           the beams COLLIMATE: 11.1° at t = 10, 0.70° at
 *                           t = 2560, and 26 cones of that width cover
 *                           2.4·10⁻⁶ of the sky by t = 10⁶.
 *
 * And no averaging saves the last one, because the lattice is translation
 * invariant: every emitter at every site has the same 26 exits, so averaging
 * over positions, orientations, phases or 10³⁹ constituents never makes a
 * twenty-seventh direction.
 *
 * WHICH LEAVES A SPLIT WORTH BEING PRECISE ABOUT. What the closed form needs
 * from the lattice is a NUMBER — how much of a source is at a place — and
 * wandering delivers that number exactly. What it does not deliver is the
 * PICTURE: the flux is on 26 needles rather than smeared over the shell, so
 * `chance` is right on average and wrong at any particular point. Every
 * prediction in the article is computed from the average. None of them is
 * computed from a particular point.
 *
 * Numbers here are computed in this file, exactly where exact is possible: the
 * per-heading end distribution is a multinomial over (full steps, constituent
 * steps) and is enumerated rather than sampled.
 */

import { CanvasView, Surface } from "./canvas";

const INK = "#c8cbd4", FAINT = "#5a5f6e", GRID = "rgba(255,255,255,0.055)";
const MODEL = "#4aa8eb", DATA = "#eb964a", SEEN = "#eef0f5";
const GOOD = "#8bd48b", BAD = "#e0685f";
const BACK = "#08090d";

/** The wander that makes a direction's mean speed exactly one. */
export const wanderFor = (n: number) => Math.sqrt(n) / (Math.sqrt(n) + 1);

/** The eight ways out of a point that lie in one plane — a sheet's worth. */
const SHEET_2D: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

const lfac = (() => {
  const t = [0];
  for (let i = 1; i < 512; i++) t.push(t[i - 1] + Math.log(i));
  return (n: number) => t[n];
})();

type Cloud = { x: number; y: number; p: number }[];

/**
 * Where one heading's charges are after `t` ticks — exactly, by enumerating
 * the multinomial rather than by walking anything.
 *
 * A heading with `n` active axes takes the full step with probability 1 − w
 * and one of its `n` constituents with probability w/n. After `t` ticks the
 * displacement on active axis `i` is `k + m_i`, where `(k, m₁…mₙ)` is
 * multinomial — so the whole distribution is a sum over `k` and the `mᵢ`.
 */
const cloudOf = (d: [number, number], t: number, mode: Mode): Cloud => {
  const n = (d[0] ? 1 : 0) + (d[1] ? 1 : 0);

  if (mode !== "wander" || n === 1) {
    // Plain: one cell a tick, so a diagonal covers √2 per tick. Normalised:
    // the step is scaled to unit Euclidean length. Either way, one point.
    const s = mode === "normalised" ? 1 / Math.hypot(...d) : 1;
    return [{ x: d[0] * t * s, y: d[1] * t * s, p: 1 }];
  }

  const w = wanderFor(n), out: Cloud = [];

  for (let k = 0; k <= t; k++)
    for (let m1 = 0; m1 <= t - k; m1++) {
      const m2 = t - k - m1;
      const lp = lfac(t) - lfac(k) - lfac(m1) - lfac(m2)
        + k * Math.log(1 - w) + (m1 + m2) * Math.log(w / 2);
      const p = Math.exp(lp);

      if (p > 1e-9) out.push({ x: d[0] * (k + m1), y: d[1] * (k + m2), p });
    }

  return out;
};

type Mode = "plain" | "wander" | "normalised";

const TITLE: Record<Mode, string> = {
  plain: "one cell a tick",
  wander: "wandered, w = √n/(√n+1)",
  normalised: "steps cost their length",
};

const BLURB: Record<Mode, string> = {
  plain: "the front is a SQUARE — diagonals overshoot by √2",
  wander: "the front is a CIRCLE — but lumpy, and the lumps sharpen",
  normalised: "a circle, and no width at all",
};

// ---------------------------------------------------------------------------

const pattern = (t: number) => (s: Surface) => {
  const { ctx, width, height } = s;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK;
  ctx.fillRect(0, 0, width, height);

  const modes: Mode[] = ["plain", "wander", "normalised"];
  const cw = width / 3, pad = 14;
  const R = Math.min(cw / 2 - pad, (height - 54) / 2);
  const scale = R / (t * Math.SQRT2);           // so the square's corners fit

  modes.forEach((mode, col) => {
    const cx = cw * (col + 0.5), cy = 22 + R;

    ctx.save();
    ctx.beginPath();
    ctx.rect(cw * col, 0, cw, height);
    ctx.clip();

    // what the closed form assumes: the circle of radius t
    ctx.strokeStyle = DATA;
    ctx.globalAlpha = 0.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(cx, cy, t * scale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // what one cell a tick actually reaches: the square
    ctx.strokeStyle = GRID;
    ctx.globalAlpha = 1;
    ctx.strokeRect(cx - t * scale, cy - t * scale, 2 * t * scale, 2 * t * scale);

    // the charges
    let peak = 0;
    const clouds = SHEET_2D.map(d => cloudOf(d, t, mode));
    for (const c of clouds) for (const q of c) peak = Math.max(peak, q.p);

    for (const c of clouds)
      for (const q of c) {
        const a = Math.min(1, Math.pow(q.p / peak, 0.42));
        ctx.fillStyle = MODEL;
        ctx.globalAlpha = 0.14 + 0.86 * a;
        const r = mode === "wander" ? 1.7 : 2.6;
        ctx.beginPath();
        ctx.arc(cx + q.x * scale, cy - q.y * scale, r, 0, Math.PI * 2);
        ctx.fill();
      }

    ctx.globalAlpha = 1;
    ctx.fillStyle = SEEN;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = INK;
    ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(TITLE[mode], cx, 14);

    ctx.fillStyle = FAINT;
    ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(BLURB[mode], cx, height - 20);

    ctx.restore();
  });

  ctx.fillStyle = FAINT;
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    `one pulse, ${t} ticks — dashed: the circle of radius t the closed form divides by`,
    10, height - 6,
  );
};

// ---------------------------------------------------------------------------

/** Angular width of a wandering beam, against distance. Log–log. */
const collimation = (s: Surface) => {
  const { ctx, width, height } = s;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK;
  ctx.fillRect(0, 0, width, height);

  const x0 = 52, x1 = width - 16, y0 = 18, y1 = height - 32;

  // exact angular sd of the edge beam, from the enumerated cloud
  const pts = [16, 32, 64, 128, 256, 512].map(t => {
    const c = cloudOf([1, 1], t, "wander");
    let m = 0, v = 0;
    for (const q of c) m += q.p * Math.atan2(q.y, q.x);
    for (const q of c) v += q.p * Math.pow(Math.atan2(q.y, q.x) - m, 2);
    return { t, deg: Math.sqrt(v) * 180 / Math.PI };
  });

  const LX = (t: number) => x0 + (Math.log(t) - Math.log(12)) / (Math.log(700) - Math.log(12)) * (x1 - x0);
  const LY = (d: number) => y1 - (Math.log(d) - Math.log(0.7)) / (Math.log(14) - Math.log(0.7)) * (y1 - y0);

  ctx.strokeStyle = GRID;
  ctx.beginPath();
  ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1);
  ctx.stroke();

  ctx.strokeStyle = MODEL;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(LX(p.t), LY(p.deg)) : ctx.moveTo(LX(p.t), LY(p.deg))));
  ctx.stroke();

  ctx.fillStyle = MODEL;
  for (const p of pts) {
    ctx.beginPath();
    ctx.arc(LX(p.t), LY(p.deg), 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // the face beams, which never wander at all
  ctx.strokeStyle = GOOD;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(x0, y1 - 2); ctx.lineTo(x1, y1 - 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = FAINT;
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("angular width (deg)", 6, 12);
  ctx.fillText("ticks", x1 - 26, y1 + 14);
  ctx.fillText("face beams — no constituents, so no wander, width exactly 0", x0 + 6, y1 - 6);

  for (const p of pts) {
    ctx.fillStyle = INK;
    ctx.textAlign = "center";
    ctx.fillText(p.deg.toFixed(2) + "°", LX(p.t), LY(p.deg) - 8);
    ctx.fillStyle = FAINT;
    ctx.fillText(String(p.t), LX(p.t), y1 + 14);
  }

  ctx.fillStyle = BAD;
  ctx.textAlign = "right";
  ctx.fillText("halves every 4× — the beams sharpen as 1/√t, they never fill the sphere", x1, y0 + 4);
};

// ---------------------------------------------------------------------------

/** What each geometry puts through a shell, against what the closed form wants. */
const coefficient = (s: Surface) => {
  const { ctx, width, height } = s;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK;
  ctx.fillRect(0, 0, width, height);

  // a unit-thickness shell holds 1/v charges per ray, v the Euclidean speed
  const speed = (d: [number, number], mode: Mode) => {
    const n = (d[0] ? 1 : 0) + (d[1] ? 1 : 0);
    if (mode === "plain") return Math.hypot(...d);
    if (mode === "normalised") return 1;
    return (1 - wanderFor(n) * (n - 1) / n) * Math.sqrt(n);
  };

  const rows: [Mode, number][] = (["plain", "wander", "normalised"] as Mode[])
    .map(m => [m, SHEET_2D.reduce((a, d) => a + 1 / speed(d, m), 0) / 8]);

  ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = FAINT;
  ctx.fillText("through a shell, ÷ the closed form's SHEET/4πr²", 14, 18);
  ctx.fillText("and so G, which goes as the square", 300, 18);

  rows.forEach(([mode, ratio], i) => {
    const y = 44 + i * 26;
    const ok = Math.abs(ratio - 1) < 1e-9;

    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.fillText(TITLE[mode], 14, y);

    ctx.fillStyle = ok ? GOOD : BAD;
    ctx.textAlign = "right";
    ctx.fillText(ratio.toFixed(6), 290, y);
    ctx.fillText((ratio * ratio).toFixed(6), 420, y);
  });

  ctx.fillStyle = FAINT;
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(
    "plain propagation is 27% light on G. Both fixes are exact — and the exponent is −2 in all three.",
    14, height - 10,
  );
};

// ---------------------------------------------------------------------------

/**
 * A picture and, if it has one, the line above it.
 *
 * Two things that are not decoration. A panel with nothing to say gets no
 * caption strip at all — an empty one still takes its line, and on a picture
 * that has just had its text removed that is exactly the space that is missed.
 * And `aspect` is for the panels whose contents are a ROW OF ROUND THINGS: a
 * disk cannot be wider than it is tall, so a row of five across a wide column
 * is height-bound by the column and no fixed height will ever be filled — the
 * box has to take its height from its own width instead. Give one or the
 * other; `aspect` wins where both are given.
 */
const Panel = ({ paint, height, aspect, note }: {
  paint: (s: Surface) => void; height?: number; aspect?: number; note?: string;
}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    {note && <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>{note}</div>}
    <div style={aspect
      ? { width: "100%", aspectRatio: String(aspect), background: BACK }
      : { height, background: BACK }}>
      <CanvasView deps={[note]} paint={() => ({ frame: paint })} />
    </div>
  </div>;

// ---------------------------------------------------------------------------
// EVERY CLAIM IN `Law`, PUT THROUGH EACH GEOMETRY
//
// The reason this fits on two panels rather than needing the whole suite
// re-run is structural, and worth stating once: `models.ts` carries every mass
// as `M/GRAVITY`, so the dynamics compute `G·(M/G)` and the constant is gone
// before it is used. Everything astronomical is then computed from a MEASURED
// `GM`. So the geometry can only reach a prediction through `G` itself — and
// only nine quantities carry `G` anywhere they can be seen.

/** How much of the closed form's SHEET/4πr² each route actually delivers. */
const FSPEED = (w: number, cls: "face" | "edge" | "corner") =>
  cls === "face" ? 1
    : cls === "edge" ? Math.SQRT2 * (1 - w / 3)
      : Math.sqrt(3) * (1 - w / 2);

/**
 * The shell density each route delivers, as a fraction of the closed form's
 * SHEET/4πr².
 *
 * The emission sheet is a COORDINATE PLANE, so it holds four face-type and
 * four edge-type directions and no corner-type ones at all — a corner does not
 * lie in a coordinate plane. Which is why forward-only wander needs only ONE w
 * to land exactly: 3(1 − 1/√2) zeroes the face and the edge together, and the
 * corner's own value never enters the emission.
 */
const kForward = (w: number) =>
  (4 / FSPEED(w, "face") + 4 / FSPEED(w, "edge")) / 8;

export const ROUTES: [string, number][] = [
  ["as published", 1],
  ["square, Euclid", (4 + 4 / Math.SQRT2) / 8],
  ["forward, w = 1", kForward(1)],
  ["forward, w = 0.8787", kForward(3 * (1 - Math.SQRT1_2))],
];

const SH = 8, DG = 26, BT = 1, CO = 0.5, SHARE = 0.5, CY = 8;
const BASE = BT * SHARE * SH * SH / (4 * Math.PI * Math.PI * CO * DG);
const M_PLANCK = 2.176434e-8;

const derived = (k: number) => {
  const G = BASE * k * k, eps = 12 * Math.PI * G / SH;
  const hop = (SH / (12 * Math.PI * 0.34615)) / G;
  return {
    G, mu: G * M_PLANCK * 1e9, eps, D: 1 / eps,
    reaches: 0.361 * k, magneton: CY * G / (2 * Math.PI),
    hop, persist: (hop - 1) / (hop + 1), a0gap: SH / (8 * Math.PI * Math.PI * G),
  };
};

const MOVERS: [string, (d: ReturnType<typeof derived>) => string][] = [
  ["G — the constant", d => d.G.toFixed(6)],
  ["µ — heaviest emitter (µg)", d => d.mu.toFixed(3)],
  ["the Compton constant", d => d.G.toFixed(6)],
  ["ε — space made per charge", d => d.eps.toFixed(4)],
  ["D — how it spreads", d => d.D.toFixed(3)],
  ["REACHES — λ/R_h", d => d.reaches.toFixed(4)],
  ["MAGNETON (µ_B)", d => d.magneton.toFixed(5)],
  ["the hopping gap", d => d.hop.toFixed(2) + "×"],
  ["persistence p owed", d => d.persist.toFixed(4)],
  ["the two a₀ routes differ by", d => d.a0gap.toFixed(4)],
];

const movers = (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const x0 = 14, colw = Math.min(112, (width - 210) / 4), y0 = 30;
  ctx.font = "11px ui-sans-serif, system-ui, sans-serif";

  ROUTES.forEach(([name], i) => {
    ctx.fillStyle = i === 3 ? GOOD : i === 0 ? INK : FAINT;
    ctx.textAlign = "right";
    ctx.fillText(name, 200 + colw * (i + 1) - 6, y0 - 12);
  });
  ctx.fillStyle = FAINT; ctx.textAlign = "left";
  ctx.fillText("carries G, so the geometry reaches it", x0, y0 - 12);

  MOVERS.forEach(([label, f], r) => {
    const y = y0 + 8 + r * 17;
    ctx.fillStyle = INK; ctx.textAlign = "left";
    ctx.fillText(label, x0, y);
    ROUTES.forEach(([, k], i) => {
      const v = f(derived(k)), same = v === f(derived(1));
      ctx.fillStyle = same ? GOOD : BAD;
      ctx.textAlign = "right";
      ctx.fillText(v, 200 + colw * (i + 1) - 6, y);
    });
  });

  ctx.fillStyle = FAINT;
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(
    "13/8 = DEG/2SHEET is a clean count of the lattice ONLY at k = 1 — it is (13/8)/k² and nothing else recovers it",
    x0, height - 10);
};

// ---------------------------------------------------------------------------

const KEPT: [string, string[]][] = [
  ["the pull, and relativity", [
    "the inverse square, exponent −2", "the equivalence principle",
    "BIAS = 1/26", "met's bracket 1 + (½/R)ln", "1/γ³ and 1/γ",
    "Mercury's sixth, +1.66°/9.93°", "A = e^−2u, B = e^+2u, β = γ = 1",
    "six sixths, 6.05 … 6.22", "light's deflection 4GM/bc²",
    "the geodesic, to 10⁻⁷", "Shapiro delay, Cassini γ", "screen",
  ]],
  ["the cosmology", [
    "dR/dt = c, R = ct", "ADVANCE = SHEET/2 = 4", "H₀ = 1/t₀, the forced age",
    "q₀ = 0 exactly", "the supernova residual, 0.061 mag", "no CMB, at any temperature",
  ]],
  ["the rotation curves — ONLY the shapes", [
    "the MOND interpolation, derived", "transport slopes −2 / −1, and √M",
    "Tully–Fisher's SLOPE, 3.42", "the four cosines 0.4721 … 0.3610",
    "that there IS a step, and its ¼-power size",
  ]],
  ["black holes", [
    "the throat, e/2 = 1.3591 R_s", "r_ph = 2GM/c²",
    "the shadow, 2e/3√3 = 1.0463", "no horizons, redshift e² = 7.4",
    "and no echoes",
  ]],
  ["magnetism, and the quantum coda", [
    "P quantised in quarters", "the sign law (1 − P_a P_b)",
    "∇·B = 0, no monopoles", "3cos²θ − 1, 1/R⁴, five orientations",
    "cutting a magnet halves it", "1/m², so µ_B/µ_N = 1836",
    "g = 1 — still refuted", "⟨111⟩ by 11.1% — still refuted",
    "m_eff = 38.7 kg per A·m", "α/(m_e/m_P)² = 4.166·10⁴²",
    "E = ħω, λ = h/p, Ω² = k² + m²",
  ]],
];

const kept = (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const cols = width > 720 ? 3 : width > 480 ? 2 : 1;
  const cw = (width - 20) / cols;
  let col = 0, y = 26;

  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = SEEN;
  ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("identical in every route — pure counts, or computed from a measured GM", 12, 14);
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";

  for (const [group, items] of KEPT) {
    if (y + (items.length + 2) * 13 > height - 26 && col < cols - 1) { col++; y = 26; }
    ctx.fillStyle = FAINT;
    ctx.fillText(group.toUpperCase(), 12 + col * cw, y);
    y += 14;
    for (const it of items) {
      ctx.fillStyle = GOOD; ctx.fillText("✓", 12 + col * cw, y);
      ctx.fillStyle = INK; ctx.fillText(it, 24 + col * cw, y);
      y += 13;
    }
    y += 8;
  }

  ctx.fillStyle = BAD;
  ctx.fillText("needs re-running, not settled by scaling:  R/R_s = 0.7219 · the neutron star's ⅔ · every Euclidean angle, under L∞ only",
    12, height - 8);
};

// ---------------------------------------------------------------------------
// AND THE ROTATION CURVES ARE NOT INVARIANT, WHICH THE FIRST PASS GOT WRONG.
//
// `a₀` has TWO derivations in this file and only one of them is free of `G`:
//
//     cH₀/2π                 no G      — invariant under any geometry
//     4πG/(SHEET·t₀)         a₀ ∝ G    — moves as k²
//
// and the file's own audit says the SECOND is the principled one: the 2π in
// the first was borrowed from `inStep`, a coherence condition the polarity
// result retired. So the route that survives the audit is exactly the route
// that makes every rotation-curve number depend on the shape of the front.
//
// Downstream of a₀: v_flat ∝ a₀^¼ (from v⁴ = GMa₀), the step radii ∝ 1/√a₀
// (since g ∝ 1/r²), and the cluster supply ∝ √a₀ (the √(a₀/g_N) ceiling).

const A0ROWS: [string, (f: number) => string][] = [
  ["a₀ itself, ×", f => f.toFixed(4)],
  ["v_flat, × — so the 1.1% rms", f => Math.pow(f, 0.25).toFixed(4)],
  ["the step, 33 / 52 kpc →", f => (33 / Math.sqrt(f)).toFixed(1) + " / " + (52 / Math.sqrt(f)).toFixed(1)],
  ["clusters supply 3.94 →", f => (3.94 * Math.sqrt(f)).toFixed(2)],
  ["…so short by", f => (6.0 / (3.94 * Math.sqrt(f))).toFixed(2) + "×"],
];

const viaA0 = (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const x0 = 14, colw = Math.min(112, (width - 210) / 4), y0 = 44;
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillStyle = DATA;
  ctx.fillText("a₀ = cH₀/2π has no G and is invariant. a₀ = 4πG/(SHEET·t₀) is ∝ G — and the audit calls that one the principled route.", x0, 14);
  ctx.fillStyle = FAINT;
  ctx.fillText("on that route the whole rotation-curve block moves:", x0, 28);

  ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
  ROUTES.forEach(([name], i) => {
    ctx.fillStyle = i === 3 ? GOOD : i === 0 ? INK : FAINT;
    ctx.textAlign = "right";
    ctx.fillText(name, 200 + colw * (i + 1) - 6, y0 - 4);
  });

  A0ROWS.forEach(([label, f], r) => {
    const y = y0 + 16 + r * 17;
    ctx.fillStyle = INK; ctx.textAlign = "left";
    ctx.fillText(label, x0, y);
    ROUTES.forEach(([, k], i) => {
      const v = f(k * k), same = v === f(1);
      ctx.fillStyle = same ? GOOD : BAD;
      ctx.textAlign = "right";
      ctx.fillText(v, 200 + colw * (i + 1) - 6, y);
    });
  });

  ctx.fillStyle = BAD;
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("square-Euclid costs 7.6% on v_flat against a fit quoted at 1.1% rms — the Milky Way result does not survive it.", x0, height - 10);
};

export const WanderA0 = ({ height = 175 }: { height?: number }) =>
  <Panel paint={viaA0} height={height}
    note="and everything downstream of a₀ — which is not invariant" />;

export const WanderMovers = ({ height = 235 }: { height?: number }) =>
  <Panel paint={movers} height={height}
    note="everything the geometry can reach — and it is ten things" />;

export const WanderKept = ({ height = 330 }: { height?: number }) =>
  <Panel paint={kept} height={height}
    note="and everything it cannot" />;

// ---------------------------------------------------------------------------
// EVERY PATH A RAY COULD TAKE, AS A FIELD — because "it propagates in a circle"
// is an ASSUMPTION and this is what the lattice actually offers instead.
//
// The four maps are four answers to one question — what is a heading? — and
// each makes a different aggregate shape. None of them is a circle for free:
//
//   one heading, held        8 rays. The aggregate is a SQUARE, and the only
//                            thing there is to see is veins.
//   the sheet, symmetric     the current `wander`. Diagonals broaden, the axes
//     wander                 cannot (a face step has no constituents), so the
//                            veins fatten unevenly and the count stays 8.
//   free headings            a heading is any unit vector, realised by mixing.
//                            The ring closes — and is SHARP on the axes and
//                            BLURRED on the diagonals, because the radial
//                            spread is √((1 − Σuᵢ⁴)t) and Σuᵢ⁴ is 1 on an axis.
//   a surface of emitters    many emitters, one heading each. The veins widen
//                            by the body's own size rather than by any rule —
//                            which is the other way to fill a shell, and it
//                            works out to about 2.5 body radii and no further.
//
// The alpha is the probability, gamma-corrected, so the thin parts are visible
// rather than clipped to black. Everything is enumerated, not sampled: with
// free headings x and y are INDEPENDENT binomials, so the field is exact.

const BIN = (t: number, p: number) => {
  const o = new Float64Array(t + 1), lp = Math.log(Math.max(p, 1e-300)),
    lq = Math.log(Math.max(1 - p, 1e-300));
  for (let k = 0; k <= t; k++)
    o[k] = Math.exp(lfac(t) - lfac(k) - lfac(t - k) + k * lp + (t - k) * lq);
  return o;
};

type Field = { g: Float64Array; n: number; t: number };

const blank = (t: number): Field =>
  ({ g: new Float64Array((2 * t + 1) * (2 * t + 1)), n: 2 * t + 1, t });

const put = (f: Field, x: number, y: number, p: number) => {
  const i = Math.round(x) + f.t, j = Math.round(y) + f.t;
  if (i >= 0 && j >= 0 && i < f.n && j < f.n) f.g[i * f.n + j] += p;
};

const FIELDS: [string, string, (t: number) => Field][] = [
  ["one heading, held", "8 rays — the aggregate is a square", t => {
    const f = blank(t);
    for (const d of SHEET_2D) put(f, d[0] * t, d[1] * t, 1 / 8);
    return f;
  }],
  ["the sheet, symmetric wander", "diagonals broaden, axes cannot", t => {
    const f = blank(t);
    for (const d of SHEET_2D) for (const q of cloudOf(d, t, "wander")) put(f, q.x, q.y, q.p / 8);
    return f;
  }],
  ["free headings", "the ring closes — sharp on the axes", t => {
    const f = blank(t), N = 360;
    for (let a = 0; a < N; a++) {
      const th = 2 * Math.PI * a / N;
      const X = BIN(t, (1 + Math.cos(th)) / 2), Y = BIN(t, (1 + Math.sin(th)) / 2);
      for (let i = 0; i <= t; i++) {
        if (X[i] < 1e-11) continue;
        for (let j = 0; j <= t; j++) {
          if (Y[j] < 1e-11) continue;
          put(f, 2 * i - t, 2 * j - t, X[i] * Y[j] / N);
        }
      }
    }
    return f;
  }],
  ["a surface of emitters", "veins widen by the body, not by a rule", t => {
    const f = blank(t), R = Math.max(2, Math.round(t / 4));
    let n = 0;
    for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) {
      if (x * x + y * y > R * R) continue;
      n++;
      for (const d of SHEET_2D) put(f, x + d[0] * (t - R), y + d[1] * (t - R), 1);
    }
    for (let i = 0; i < f.g.length; i++) f.g[i] /= n * 8;
    return f;
  }],
];

const paths = (t: number) => (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const cw = width / 4, R = Math.min(cw / 2 - 10, (height - 56) / 2);
  const scale = R / (t * Math.SQRT2);

  FIELDS.forEach(([title, blurb, make], col) => {
    const f = make(t), cx = cw * (col + 0.5), cy = 26 + R;
    let peak = 0;
    for (const v of f.g) peak = Math.max(peak, v);

    const px = Math.max(1, scale * 2);
    for (let i = 0; i < f.n; i++) for (let j = 0; j < f.n; j++) {
      const v = f.g[i * f.n + j];
      if (v <= 0) continue;
      ctx.globalAlpha = Math.min(1, Math.pow(v / peak, 0.30));
      ctx.fillStyle = MODEL;
      ctx.fillRect(cx + (i - f.t) * scale - px / 2, cy - (j - f.t) * scale - px / 2, px, px);
    }

    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = DATA; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(cx, cy, t * scale, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    ctx.fillStyle = INK; ctx.textAlign = "center";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(title, cx, 14);
    ctx.fillStyle = FAINT;
    ctx.font = "9px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(blurb, cx, height - 18);
  });

  ctx.fillStyle = FAINT; ctx.textAlign = "left";
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(
    "alpha is the probability of a path ending there, gamma 0.30 so the thin parts show. dashed: the circle of radius t.",
    10, height - 5);
};

export const WanderPaths = ({ ticks = 26, height = 250 }: { ticks?: number, height?: number }) =>
  <Panel paint={paths(ticks)} height={height}
    note="every path a ray could take — and the aggregate shape each rule makes" />;

// ---------------------------------------------------------------------------
// AND THE WANDER THAT DOES NOT DISCRIMINATE — which is the honest version of
// "a world where the discreteness of the spread matters", and it fails.
//
// The wander above is picky: it mixes a heading with ITS OWN constituents, so a
// face step (having none) never wanders and a corner step wanders most. That
// pickiness is doing the work. Take it away — with probability w take a
// UNIFORMLY RANDOM lattice step, otherwise your heading, caring neither what
// your heading is nor which way you wander — and:
//
//     mean step = (1 − w)·d + w·⟨random⟩ = (1 − w)·d
//
// because the 26 come in ± pairs and average to nothing. So every speed is
// scaled by the same (1 − w) and THE RATIO IS UNTOUCHED: face (1−w), diagonal
// (1−w)√2, corner (1−w)√3, at every w. The square is still a square.
//
// What w buys is blur, and blur only HIDES the square, and only near in: the
// corner excess grows as 0.414(1−w)t while the blur grows as √(var·t), so their
// ratio goes to nought and the square comes back at every w < 1 — at t ≈ 29
// ticks for w = 0.5, 222 for w = 0.8, 3547 for w = 0.95. At w = 1 it is gone,
// and so is propagation: the mean speed is nought and nothing goes anywhere.

const UNIFORM: [string, number][] = [["w = 0", 0], ["w = 0.5", 0.5], ["w = 0.8", 0.8], ["w = 0.95", 0.95]];

const blind = (t: number) => (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const cw = width / 4, R = Math.min(cw / 2 - 10, (height - 58) / 2);
  const scale = R / (t * Math.SQRT2);
  const N = 2600;

  UNIFORM.forEach(([label, w], col) => {
    const cx = cw * (col + 0.5), cy = 26 + R;

    // the square the means still make
    ctx.globalAlpha = 0.5; ctx.strokeStyle = GRID;
    const m = (1 - w) * t * scale;
    ctx.strokeRect(cx - m, cy - m, 2 * m, 2 * m);
    ctx.strokeStyle = DATA; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.arc(cx, cy, m, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    for (const d of SHEET_2D)
      for (let n = 0; n < N; n++) {
        let x = 0, y = 0;
        for (let k = 0; k < t; k++) {
          const st = Math.random() < w ? SHEET_2D[(Math.random() * 8) | 0] : d;
          x += st[0]; y += st[1];
        }
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = MODEL;
        ctx.fillRect(cx + x * scale, cy - y * scale, 1.6, 1.6);
      }
    ctx.globalAlpha = 1;

    ctx.fillStyle = INK; ctx.textAlign = "center";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(label, cx, 14);
    ctx.fillStyle = FAINT; ctx.font = "9px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("diag/face = " + Math.SQRT2.toFixed(4), cx, height - 18);
  });

  ctx.fillStyle = BAD; ctx.textAlign = "left";
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(
    "a wander that does not discriminate scales every speed by the same (1 − w) — so the ratio never moves, and the square only gets blurrier and smaller.",
    10, height - 5);
};

export const WanderBlind = ({ ticks = 26, height = 250 }: { ticks?: number, height?: number }) =>
  <Panel paint={blind(ticks)} height={height}
    note="and the same, with a wander that does not discriminate" />;

// ---------------------------------------------------------------------------
// FORWARD-ONLY WANDER — you may not switch to just any direction, only to one
// you are already going in. Which is the best-behaved rule of the three.
//
// The candidate set is every lattice direction with a POSITIVE projection on
// the heading. Its size is 9 for a face or an edge and 10 for a corner — which
// are exactly the counts `magnet.ts` already uses for the ⟨111⟩ easy axis, and
// arrived at here from somewhere else entirely.
//
// The cone's mean step has a closed form, and it is what does the work:
//
//     face    cone mean = 1          so the speed is 1 at EVERY w
//     edge    cone mean = 2√2/3      speed = √2 (1 − w/3)
//     corner  cone mean = √3/2       speed = √3 (1 − w/2)
//
// So wandering forward SHORTENS the diagonals in Euclidean terms and leaves the
// axes alone — the correction wanted, with nothing singled out by hand. One w
// gets the spread to 1.57% (against 3.5% for the constituent rule); two —
// w = 3(1−1/√2) for an edge, 2(1−1/√3) for a corner — zero it exactly.

const FWD: [string, (w: number) => number, string][] = [
  ["corner  √3(1−w/2)", w => Math.sqrt(3) * (1 - w / 2), MODEL],
  ["edge  √2(1−w/3)", w => Math.SQRT2 * (1 - w / 3), SEEN],
  ["face  1", () => 1, GOOD],
];

const forward = (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const x0 = 46, x1 = width - 132, y0 = 26, y1 = height - 42;
  const X = (w: number) => x0 + w * (x1 - x0);
  const Y = (v: number) => y1 - (v - 0.8) / (1.8 - 0.8) * (y1 - y0);

  ctx.strokeStyle = GRID;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();

  ctx.strokeStyle = DATA; ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.moveTo(x0, Y(1)); ctx.lineTo(x1, Y(1)); ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  for (const [label, f, col] of FWD) {
    ctx.strokeStyle = col; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const w = i / 100;
      i ? ctx.lineTo(X(w), Y(f(w))) : ctx.moveTo(X(w), Y(f(w)));
    }
    ctx.stroke();
    ctx.fillStyle = col; ctx.textAlign = "left";
    ctx.fillText(label, x1 + 6, Y(f(1)) + 3);
  }

  for (const [w, nm] of [[3 * (1 - Math.SQRT1_2), "edge = 1"],
                         [2 * (1 - 1 / Math.sqrt(3)), "corner = 1"]] as [number, string][]) {
    ctx.strokeStyle = FAINT; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(X(w), Y(1)); ctx.lineTo(X(w), y1); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.font = "9px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(w.toFixed(4), X(w), y1 + 12);
    ctx.fillText(nm, X(w), y1 + 23);
    ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  }

  ctx.fillStyle = FAINT; ctx.textAlign = "left";
  ctx.fillText("mean Euclidean speed", 6, 14);
  ctx.fillText("w — how often you deviate, forward only", x0, height - 6);
  ctx.fillStyle = GOOD; ctx.textAlign = "right";
  ctx.fillText("best single w = 0.8453 → 1.57% spread", x1, y0 + 4);
};

export const WanderForward = ({ height = 235 }: { height?: number }) =>
  <Panel paint={forward} height={height}
    note="forward-only: you may deviate, but only into a direction you are already going" />;

// ---------------------------------------------------------------------------
// THE PATH DISTRIBUTION ITSELF, SWEPT THROUGH w — where a charge IS after t
// steps, and nothing else.
//
// No normalisation and no circle drawn over it. An earlier version of this
// panel divided every cell by the mean at its own radius, which takes the
// answer to "what shape is this" and replaces it with "how does it vary at
// fixed radius" — the falloff is gone and so is the shape, and a dashed circle
// was drawn on top to say where the front should have been. That is a picture
// of a circle whatever the model does. What is drawn now is the raw
// probability after `ticks` steps, so the shape in the picture is the model's.
//
// THE RULE IS THE ONE THAT SHIPS. `discrete.ts` (~1366) builds the alternatives
// one per axis: an axis the heading uses is TAKEN APART and contributes that
// axis on its own, an axis it does not use contributes the heading with ±1
// ADDED on it. In the plane that gives
//
//     (1,0)  →  (1,0) (1,1) (1,−1)     three, and the heading is among them
//     (1,1)  →  (1,0) (0,1)            two, and the heading is NOT
//
// which is a trinomial either way, so the field is enumerated exactly rather
// than sampled — every path with its exact weight.
//
// WHAT THE VEINS ARE. Every alternative of a face heading has x = 1, so after t
// steps x = t exactly whatever path was taken: the face front is a flat bar
// that spreads only sideways. A diagonal's alternatives share nothing, so it
// opens into a wedge. Bars where the axes are and wedges between them — a fact
// about which directions share a component, not about any parameter, which is
// why sweeping w moves the front without ever filling the wedges.

/** the shipped alternatives for a heading, in the plane */
const WAYS_2D = (h: [number, number]): [number, number][] => {
  const out: [number, number][] = [];
  for (let a = 0; a < 2; a++) {
    if (h[a]) out.push(a === 0 ? [h[0], 0] : [0, h[1]]);
    else for (const s of [1, -1] as const) out.push(a === 0 ? [s, h[1]] : [h[0], s]);
  }
  return out;
};

/**
 * The three outcomes of one step off `h`, with their probabilities: carry
 * straight on with 1 − w, otherwise one of the alternatives uniformly. The
 * heading reappearing among a face's alternatives is why a face keeps some
 * weight on going straight even at w = 1, and why its speed is 1 for every w.
 */
const STEP_2D = (h: [number, number], w: number) => {
  const alt = WAYS_2D(h);
  const acc = new Map<string, { d: [number, number], p: number }>();
  const put = (d: [number, number], p: number) => {
    const k = d[0] + "," + d[1];
    const e = acc.get(k);
    if (e) e.p += p; else acc.set(k, { d, p });
  };
  put(h, 1 - w);
  for (const d of alt) put(d, w / alt.length);
  return [...acc.values()].filter(e => e.p > 1e-15);
};

/**
 * WHERE THE TRAVELLED PATHS HAVE GOT TO after `t` steps — every path with its
 * exact weight, summed over the eight headings and over every age up to `t`,
 * because a source pulses every tick and what fills the picture is charges of
 * every age in flight at once.
 *
 * Each cell is then divided by the mean at its own RADIUS. That takes the 1/r
 * falloff out and leaves the angular structure, which is the whole point of the
 * picture: at a given distance, where is the field thick and where is it thin.
 * Without it the outer three quarters of every disk is below one part in a
 * thousand of the middle and the veins are invisible under any alpha ramp.
 *
 * What is NOT done to it: nothing is clipped and no circle is drawn. The
 * diagonal spikes run out past `t` to √2·t and are left there, so the outline
 * in the picture is the shape the rule actually makes rather than a ring
 * imposed on top of it.
 */
const pulseField = (t: number, w: number) => {
  const raw = new Map<string, number>();

  for (const h of SHEET_2D) {
    const st = STEP_2D(h, w);
    if (st.length === 1) {                       // nothing to choose: one ray
      for (let age = 1; age <= t; age++) {
        const k = st[0].d[0] * age + "," + st[0].d[1] * age;
        raw.set(k, (raw.get(k) ?? 0) + 1 / 8);
      }
      continue;
    }
    const [A, B, C] = [st[0], st[1], st[2] ?? { d: [0, 0] as [number, number], p: 0 }];
    for (let age = 1; age <= t; age++)
      for (let a = 0; a <= age; a++)
        for (let b = 0; b <= age - a; b++) {
          const c = age - a - b;
          if (c > 0 && C.p === 0) continue;
          const lp = lfac(age) - lfac(a) - lfac(b) - lfac(c)
            + a * Math.log(A.p) + b * Math.log(B.p)
            + (c ? c * Math.log(C.p) : 0);
          const p = Math.exp(lp);
          if (p < 1e-11) continue;
          const x = a * A.d[0] + b * B.d[0] + c * C.d[0];
          const y = a * A.d[1] + b * B.d[1] + c * C.d[1];
          const k = x + "," + y;
          raw.set(k, (raw.get(k) ?? 0) + p / 8);
        }
  }

  const sum = new Map<number, number>(), count = new Map<number, number>();
  for (const [k, v] of raw) {
    const [x, y] = k.split(",").map(Number);
    const r = Math.round(Math.hypot(x, y));
    sum.set(r, (sum.get(r) ?? 0) + v);
    count.set(r, (count.get(r) ?? 0) + 1);
  }

  const out = new Map<string, number>();
  for (const [k, v] of raw) {
    const [x, y] = k.split(",").map(Number);
    const r = Math.round(Math.hypot(x, y));
    out.set(k, v / ((sum.get(r) as number) / (count.get(r) as number)));
  }
  return out;
};

/**
 * The enumeration does not depend on the size of the box and the box is
 * repainted every frame, so it is worked out once per (t, w) and kept.
 */
const VEINS = new Map<string, Map<string, number>>();

const vein = (t: number, w: number) => {
  const key = t + ":" + w;
  let f = VEINS.get(key);
  if (!f) VEINS.set(key, f = pulseField(t, w));
  return f;
};

/**
 * 2(1 − 1/√2). The w at which the shipped rule's diagonal crest and face crest
 * sit at the same radius — √2(1 − w/2) = 1 — and so the only w at which its
 * front is a circle in the plane. It is NOT the 3(1 − 1/√2) used elsewhere in
 * this file, which belongs to a three-member cone that includes the heading for
 * a diagonal as well; see `tests/ways.ts`.
 */
const SHIP_W = 2 * (1 - Math.SQRT1_2);

const veins = (t: number) => (s: Surface) => {
  let { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const TOP = 18, BOT = 2, GAP = 6;

  const ws = [0, 0.3, SHIP_W, 0.8, 1];
  const cw = width / ws.length;
  const R = Math.min(cw / 2 - GAP / 2, (height - TOP - BOT) / 2);
  const scale = R / (t * Math.SQRT2);            // room for the √2·t corners
  const top = TOP + Math.max(0, (height - TOP - BOT - 2 * R) / 2);

  ws.forEach((w, col) => {
    const F = vein(t, w), cx = cw * (col + 0.5), cy = top + R;
    let peak = 0;
    for (const v of F.values()) peak = Math.max(peak, v);

    const px = Math.max(1.4, scale * 1.15);
    for (const [k, v] of F) {
      const [x, y] = k.split(",").map(Number);
      ctx.globalAlpha = Math.min(1, Math.pow(Math.min(v / peak, 1), 0.55));
      ctx.fillStyle = MODEL;
      ctx.fillRect(cx + x * scale - px / 2, cy - y * scale - px / 2, px, px);
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = INK; ctx.textAlign = "center";
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText("w = " + (w === SHIP_W ? w.toFixed(4) : w.toFixed(2)), cx, 12);
  });
};

export const WanderVeins = ({ ticks = 22, height, aspect = 5.6 }: {
  ticks?: number, height?: number, aspect?: number,
}) =>
  <Panel paint={veins(ticks)} height={height} aspect={height ? undefined : aspect} />;

// ---------------------------------------------------------------------------
// WHAT ACTUALLY CLOSES THE CIRCLE — the same eight directions, four ways.
//
// The panel above shows a charge that keeps the heading it left with. That is
// the collisionless case and it is beams: the field is thick along the eight
// lattice headings and thin between them, at every radius, for ever.
//
// This one puts something in the way. The lattice, the eight directions and the
// pulse are identical; the only thing that changes across the row is how much
// else is already in flight for it to run into. The rule for what happens when
// it does is as small as a rule can be:
//
//     two charges meet head-on  →  they come out sideways, still head-on
//     anything else             →  nothing happens
//
// No turn rate, no cone, no weights, nothing that looks at a neighbourhood, and
// a lone charge in empty space still goes perfectly straight for ever. The
// outcome keeps the count and keeps the total momentum, and that is the whole
// of it.
//
// WHAT TO LOOK AT. Column one is eight spots, and the diagonal ones are further
// out than the face ones by √2 — the front is not a circle, it is not even a
// closed curve. By column three the gaps are gone. Nothing was tuned to make
// that happen; the only difference is that there is now something to hit.
//
// AND WHY IT IS NOT ENOUGH ON ITS OWN. Scattering fills the angles and loses
// the light cone — a charge knocked about at random spreads as √t rather than
// travelling. What brings the cone back is the last column, where the collisions
// are frequent enough that the disturbance stops being carried by any particular
// charge. Momentum cannot be destroyed, so an excess of it at a cell has to be
// handed to the next one, and the hand-off travels at a fixed speed because the
// push is the same in every direction. NOTHING GOES ROUND THE CIRCLE. No charge
// crosses more than a few cells before it is turned; what reaches the far side
// never started at the middle. The front is a relay, and it is round because
// the pressure behind it is.

const SQ8: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

/** head-on pairs rotate; every other cell state is left alone */
const SWAP = (() => {
  const main = new Uint8Array(256), alt = new Uint8Array(256);
  for (let s = 0; s < 256; s++) { main[s] = s; alt[s] = s; }
  for (let i = 0; i < 4; i++) {
    const h = (1 << i) | (1 << (i + 4));
    main[h] = (1 << ((i + 1) % 8)) | (1 << ((i + 5) % 8));
    alt[h] = (1 << ((i + 7) % 8)) | (1 << ((i + 3) % 8));
  }
  return { main, alt };
})();

let GSEED = 20260814;
const grnd = () => (GSEED = (GSEED * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

/** the gas: bits per direction, streaming, and the swap above */
const gasField = (T: number, d: number, runs: number) => {
  const L = 2 * Math.ceil(Math.SQRT2 * T) + 5, o = (L - 1) / 2, C = L * L;
  const acc = new Float64Array(C);

  for (let k = 0; k < runs; k++) {
    let cur = new Uint8Array(C), nxt = new Uint8Array(C);
    if (d > 0) for (let c = 0; c < C; c++) {
      let s = 0;
      for (let i = 0; i < 8; i++) if (grnd() < d) s |= 1 << i;
      cur[c] = s;
    }
    for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++)
      if (x * x + y * y <= 4) cur[(y + o) * L + (x + o)] = 255;

    for (let t = 0; t < T; t++) {
      nxt.fill(0);
      for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
        const s = cur[y * L + x];
        if (!s) continue;
        const out = ((x + y) & 1) ? SWAP.alt[s] : SWAP.main[s];
        for (let i = 0; i < 8; i++) {
          if (!(out & (1 << i))) continue;
          nxt[((y + SQ8[i][1] + L) % L) * L + ((x + SQ8[i][0] + L) % L)] |= 1 << i;
        }
      }
      const tmp = cur; cur = nxt; nxt = tmp;
    }
    for (let c = 0; c < C; c++) {
      let n = 0;
      for (let i = 0; i < 8; i++) if (cur[c] & (1 << i)) n++;
      acc[c] += n;
    }
  }
  for (let c = 0; c < C; c++) acc[c] = acc[c] / runs - 8 * d;
  return { L, o, v: acc };
};

/**
 * The same thing where collisions are frequent enough that the disturbance is
 * no longer carried by any particular charge — the limit the gas is heading
 * towards, run directly so the row ends somewhere rather than trailing off.
 */
const CW = [4 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 36, 1 / 36, 1 / 36, 1 / 36];
const LX = [0, 1, 0, -1, 0, 1, -1, -1, 1], LY = [0, 0, 1, 0, -1, 1, 1, -1, -1];

const relayField = (T: number, tau = 0.8) => {
  const L = 2 * Math.ceil(Math.SQRT2 * T) + 9, o = (L - 1) / 2, C = L * L;
  let f = new Float64Array(C * 9), g = new Float64Array(C * 9);
  for (let c = 0; c < C; c++) for (let i = 0; i < 9; i++) f[c * 9 + i] = CW[i];
  for (let i = 0; i < 9; i++) f[(o * L + o) * 9 + i] += 0.02 * CW[i];

  for (let t = 0; t < T; t++) {
    for (let y = 0; y < L; y++) for (let x = 0; x < L; x++) {
      const c = y * L + x;
      let r = 0, mx = 0, my = 0;
      for (let i = 0; i < 9; i++) { const v = f[c * 9 + i]; r += v; mx += v * LX[i]; my += v * LY[i]; }
      const vx = mx / r, vy = my / r, u2 = vx * vx + vy * vy;
      for (let i = 0; i < 9; i++) {
        const cu = LX[i] * vx + LY[i] * vy;
        const eq = CW[i] * r * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * u2);
        g[(((y + LY[i] + L) % L) * L + ((x + LX[i] + L) % L)) * 9 + i]
          = f[c * 9 + i] - (f[c * 9 + i] - eq) / tau;
      }
    }
    const tmp = f; f = g; g = tmp;
  }
  const v = new Float64Array(C);
  for (let c = 0; c < C; c++) {
    let r = 0;
    for (let i = 0; i < 9; i++) r += f[c * 9 + i];
    v[c] = r - 1;
  }
  return { L, o, v };
};

/** each column is worked out once and kept — the box repaints, the physics does not */
const MEDIA = new Map<string, { L: number, o: number, v: Float64Array }>();
const medium = (key: string, make: () => { L: number, o: number, v: Float64Array }) => {
  let f = MEDIA.get(key);
  if (!f) MEDIA.set(key, f = make());
  return f;
};

const media = (t: number) => (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const cols: [string, string, () => { L: number, o: number, v: Float64Array }][] = [
    ["nothing in the way", "eight beams", () => gasField(t, 0, 1)],
    ["a little", "the gaps start to fill", () => gasField(t, 0.10, 14)],
    ["more", "the gaps are gone", () => gasField(t, 0.30, 14)],
    ["enough to relay", "a front, at one speed", () => relayField(t)],
  ];

  const TOP = 30, BOT = 16, GAP = 6;
  const cw = width / cols.length;
  const R = Math.min(cw / 2 - GAP / 2, (height - TOP - BOT) / 2);
  const scale = R / (t * Math.SQRT2);
  const top = TOP + Math.max(0, (height - TOP - BOT - 2 * R) / 2);

  cols.forEach(([head, foot, make], col) => {
    const F = medium(head + ":" + t, make);
    const cx = cw * (col + 0.5), cy = top + R;

    let peak = 0;
    for (const v of F.v) peak = Math.max(peak, v);

    const px = Math.max(1.3, scale * 1.2);
    for (let y = -F.o; y <= F.o; y++) for (let x = -F.o; x <= F.o; x++) {
      const v = F.v[(y + F.o) * F.L + (x + F.o)];
      if (v <= 0) continue;
      ctx.globalAlpha = Math.min(1, Math.pow(v / peak, 0.45));
      ctx.fillStyle = MODEL;
      ctx.fillRect(cx + x * scale - px / 2, cy - y * scale - px / 2, px, px);
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    ctx.fillStyle = INK;
    ctx.font = "11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(head, cx, 13);
    ctx.fillStyle = FAINT;
    ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(foot, cx, 25);
  });

  ctx.fillStyle = FAINT; ctx.textAlign = "center";
  ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("same eight directions, same pulse — only how much else is in flight changes",
    width / 2, height - 4);
};

export const WanderMedium = ({ ticks = 26, height = 210 }: { ticks?: number, height?: number }) =>
  <Panel paint={media(ticks)} height={height} />;


export const WanderPattern = ({ ticks = 28, height = 260 }: { ticks?: number, height?: number }) =>
  <Panel paint={pattern(ticks)} height={height}
    note="where one pulse ends up — the same rules, three ways of stepping" />;

export const WanderSpread = ({ height = 210 }: { height?: number }) =>
  <Panel paint={collimation} height={height}
    note="and the beams collimate rather than spread" />;

export const WanderShell = ({ height = 150 }: { height?: number }) =>
  <Panel paint={coefficient} height={height}
    note="what each geometry puts through a shell" />;

export const Wander = ({ ticks = 28 }: { ticks?: number } = {}) => <>
  <WanderPattern ticks={ticks} />
  <WanderSpread />
  <WanderShell />
  <WanderMovers />
  <WanderA0 />
  <WanderKept />
</>;
