/**
 * DID THE STEP APPEAR? — the figure the whole lattice-versus-MOND question comes to.
 *
 * Two panels, one per predicted discontinuity, each stacked on its own boundary. Only
 * galaxies with measured points on BOTH sides are in them, each with its own offset
 * removed, because a distance error moves a whole galaxy together and would otherwise
 * be free to manufacture a jump. So what is plotted is a comparison inside galaxies,
 * which is the only comparison a step can survive.
 *
 * The amber staircase is what the lattice says has to be there — position from the
 * direction cosines, size from the projection over 26 exits, nothing fitted. The blue
 * one is what the data give. The white points are the measurement, binned.
 *
 * AND THE ANSWER IS THAT THEY ARE THE SAME HEIGHT AS THE ERROR BARS, which is why this
 * figure is worth drawing rather than a sentence: a reader can see at once that the
 * prediction is not excluded, not detected, and that the two are the same statement
 * here. `cosmology/lattice-step` carries the numbers.
 */

import { CanvasView, Surface } from "./CANVAS";
import { entryOf } from "./FIGURES";
import { STEPS, residuals } from "../STEP";
import { GALAXIES } from "../SPARC";

const BACK = "#08090d", FAINT = "#5a5f6e", GRID = "rgba(120,127,148,0.13)";
const SEEN = "#eef0f5", MODEL = "#4aa8eb", PRED = "#d4b48b";

const W = 0.5, NBIN = 10;

/** the straddling galaxies inside one window, each flattened by its own mean */
const stacked = (xc: number) => {
  const pts = residuals();
  const byGal = new Map<number, { x: number; d: number }[]>();
  for (const p of pts) {
    if (Math.abs(p.x - xc) >= W) continue;
    if (!byGal.has(p.galaxy)) byGal.set(p.galaxy, []);
    byGal.get(p.galaxy)!.push(p);
  }
  const out: { x: number; d: number }[] = [];
  let gals = 0;
  for (let g = 0; g < GALAXIES(); g++) {
    const mine = byGal.get(g);
    if (!mine || mine.length < 4) continue;
    if (!mine.some(p => p.x < xc) || !mine.some(p => p.x > xc)) continue;
    gals++;
    const m = mine.reduce((a, b) => a + b.d, 0) / mine.length;
    for (const p of mine) out.push({ x: p.x - xc, d: p.d - m });
  }
  return { out, gals };
};

/** what the report measured for this step at the half-decade window */
const measuredAt = (logGbar: number) => {
  const e = entryOf("cosmology/lattice-step");
  if (!e?.table) return null;
  const c = (n: string) => e.table!.columns.indexOf(n);
  const row = e.table.rows.find(r =>
    Math.abs(Number(r[c("step (log g_bar)")]) - logGbar) < 0.01 &&
    Math.abs(Number(r[c("window")]) - W) < 0.01);
  return row ? {
    amplitude: Number(row[c("measured")]), err: Number(row[c("null ±")]),
  } : null;
};

/** a staircase of height `amp` whose weighted mean over these points is zero */
const levels = (amp: number, nL: number, nR: number) =>
  ({ left: -amp * nR / (nL + nR), right: amp * nL / (nL + nR) });

const panel = (s: Surface) => {
  const { ctx } = s;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, s.width, s.height);
  const steps = STEPS();
  const gap = 26, padL = 46, padR = 14, top = 58, bot = 34;
  const cw = (s.width - padL - padR - gap) / 2;
  const h = s.height - top - bot;
  const YLO = -0.062, YHI = 0.062;

  steps.forEach((st, k) => {
    const x0 = padL + k * (cw + gap);
    const X = (v: number) => x0 + cw * (v + W) / (2 * W);
    const Y = (v: number) => top + h * (1 - (v - YLO) / (YHI - YLO));

    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    ctx.font = "400 9.5px ui-monospace, Menlo, monospace";
    for (const v of [-0.04, -0.02, 0, 0.02, 0.04]) {
      ctx.beginPath(); ctx.moveTo(x0, Y(v)); ctx.lineTo(x0 + cw, Y(v)); ctx.stroke();
      if (k === 0) {
        ctx.fillStyle = FAINT; ctx.textAlign = "right";
        ctx.fillText(v.toFixed(2), x0 - 6, Y(v) + 3);
      }
    }
    for (const v of [-0.4, -0.2, 0, 0.2, 0.4]) {
      ctx.fillStyle = FAINT; ctx.textAlign = "center";
      ctx.fillText(v.toFixed(1), X(v), top + h + 14);
    }
    ctx.textAlign = "left";

    const { out, gals } = stacked(st.logGbar);
    const nL = out.filter(p => p.x < 0).length, nR = out.length - nL;

    // the boundary itself
    ctx.strokeStyle = "rgba(238,240,245,0.30)"; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(0), top); ctx.lineTo(X(0), top + h); ctx.stroke();

    const stair = (amp: number, col: string, wdt: number, dash: number[]) => {
      const L = levels(amp, nL, nR);
      ctx.strokeStyle = col; ctx.lineWidth = wdt; ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(X(-W), Y(L.left)); ctx.lineTo(X(0), Y(L.left));
      ctx.lineTo(X(0), Y(L.right)); ctx.lineTo(X(W), Y(L.right));
      ctx.stroke(); ctx.setLineDash([]);
    };
    stair(st.amplitude, PRED, 1.8, [5, 4]);
    const got = measuredAt(st.logGbar);
    if (got) stair(got.amplitude, MODEL, 2.0, []);

    // the measurement, binned
    for (let b = 0; b < NBIN; b++) {
      const lo = -W + 2 * W * b / NBIN, hi = -W + 2 * W * (b + 1) / NBIN;
      const inb = out.filter(p => p.x >= lo && p.x < hi);
      if (inb.length < 4) continue;
      const m = inb.reduce((a, c) => a + c.d, 0) / inb.length;
      const sd = Math.sqrt(inb.reduce((a, c) => a + (c.d - m) ** 2, 0) / inb.length);
      const e = sd / Math.sqrt(inb.length);
      const cx = X((lo + hi) / 2);
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.moveTo(cx, Y(m - e)); ctx.lineTo(cx, Y(m + e)); ctx.stroke();
      for (const q of [m - e, m + e]) {
        ctx.beginPath(); ctx.moveTo(cx - 2.5, Y(q)); ctx.lineTo(cx + 2.5, Y(q)); ctx.stroke();
      }
      ctx.fillStyle = SEEN;
      ctx.beginPath(); ctx.arc(cx, Y(m), 2, 0, 7); ctx.fill();
    }

    /* every label inside its own panel: the x-axis row and the page-wide legend both
       run the full width, and anything hung under a panel lands on one of them */
    ctx.font = "400 9px ui-monospace, Menlo, monospace";
    ctx.fillStyle = SEEN; ctx.textAlign = "left";
    ctx.fillText(`step at log g_bar = ${st.logGbar.toFixed(3)}`, x0 + 2, top - 22);
    ctx.fillStyle = FAINT;
    ctx.fillText(`${gals} galaxies straddle it · ${out.length} points`, x0 + 2, top - 11);
    ctx.fillStyle = PRED;
    ctx.fillText(`predicted ${st.amplitude.toFixed(4)}`, x0 + 5, top + 13);
    if (got) {
      ctx.fillStyle = MODEL;
      ctx.fillText(`measured ${got.amplitude >= 0 ? "+" : ""}${got.amplitude.toFixed(4)} ± ${got.err.toFixed(4)}`,
        x0 + 5, top + 24);
    }
  });

  ctx.font = "400 9.5px ui-monospace, Menlo, monospace";
  ctx.fillStyle = FAINT; ctx.textAlign = "left";
  ctx.fillText("residual after the transport law, per-galaxy offset removed  [dex]", 6, 13);
  ctx.fillStyle = PRED;
  ctx.fillText("— — the lattice's prediction, nothing fitted", 6, 25);
  ctx.fillStyle = MODEL;
  ctx.fillText("——— what the data give", 268, 25);
  ctx.fillStyle = FAINT; ctx.textAlign = "center";
  ctx.fillText("log g_bar − the step's own location", s.width / 2, s.height - 8);
};

export const LatticeStep = ({ height = 320 }: { height?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>
      the two discontinuities the lattice requires, looked for inside the galaxies that
      straddle them — the prediction is the same height as the error bars
    </div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate={false} deps={["latstep"]}
        paint={() => ({ frame: (s: Surface) => panel(s) })} />
    </div>
  </div>;
