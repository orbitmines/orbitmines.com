/**
 * THE RING, AND HOW MUCH OF THE GEOMETRY SURVIVES INTO IT.
 *
 * Two figures for one uncomfortable fact. The critical curve in this model is 4.63%
 * larger than general relativity's; the thing a telescope measures is a bright
 * emission ring some way outside that curve; and the second is not 4.63% larger unless
 * the emission reaches all the way down, which the Event Horizon Telescope's own
 * calibration says it does not.
 *
 *   PROFILES    the image each geometry casts, from one and the same plasma — where
 *               the ring peaks against where the critical curve is
 *   DILUTION    the ratio an instrument would read, as a function of where the
 *               emission stops, for the three defensible ways of saying "the same
 *               plasma" in two different metrics
 *
 * THE SECOND IS READ, NOT COMPUTED. A ray trace across a sweep of inner radii is
 * seconds of arithmetic and would hang the page on every paint, so `metric/ring-as-
 * imaged` runs it once in the suite and records the table; this draws what it
 * recorded, and says so if the report has not got it.
 */

import { CanvasView, Surface } from "./CANVAS";
import { entryOf, findingOf } from "./FIGURES";
import {
  RELATIVITY, COUNTED, criticalOf, iscoOf, profileOf, ringOf,
} from "../RING";

const BACK = "#08090d", FAINT = "#5a5f6e", GRID = "rgba(120,127,148,0.13)";
const SEEN = "#eef0f5", MODEL = "#4aa8eb", RELAT = "#d4b48b", DATA = "#eb964a";

const read = (name: string) => {
  const f = findingOf("metric/ring-as-imaged", name);
  return typeof f?.value === "number" ? f.value : NaN;
};
const EDGE = () => read("the emission inner edge that reproduces EHT's α = 11.55, in M");
const OBSERVED = () => read("THE OBSERVABLE RATIO — plasma truncated at each geometry's own ISCO");

const tag = (s: Surface, x: number, y: number, t: string, c: string, px = 9.5) => {
  s.ctx.fillStyle = c;
  s.ctx.font = `400 ${px}px ui-monospace, Menlo, monospace`;
  s.ctx.fillText(t, x, y);
};

// ─── the two images ─────────────────────────────────────────────────────────

/**
 * ONE PLASMA, TWO GEOMETRIES, AND THE ONLY DIFFERENCE BETWEEN THE CURVES IS A AND B.
 *
 * The inner edge is put where EHT's α = 11.55 says it is, and in the count's geometry
 * it is scaled to that geometry's own innermost stable orbit — the anchoring with a
 * dynamical reason behind it. Both profiles are normalised to their own peak, because
 * the question is where the ring is and not how bright it is.
 */
const profiles = (s: Surface) => {
  const { ctx } = s;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, s.width, s.height);
  const L = 50, R = 16, Tp = 24, B = 34;
  const w = s.width - L - R, h = s.height - Tp - B;
  const XLO = 3, XHI = 13;
  const X = (b: number) => L + w * (b - XLO) / (XHI - XLO);
  const Y = (v: number) => Tp + h * (1 - v);

  const Rin = EDGE();
  if (!Number.isFinite(Rin)) {
    tag(s, L, Tp + 20, "the inner edge is NOT IN THE REPORT — run metric/ring-as-imaged", "#e0685f", 11);
    return;
  }
  const scale = iscoOf(COUNTED).areal / iscoOf(RELATIVITY).areal;

  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  for (let b = 4; b <= XHI; b += 1) {
    ctx.beginPath(); ctx.moveTo(X(b), Tp); ctx.lineTo(X(b), Tp + h); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(String(b), X(b), Tp + h + 15);
  }
  ctx.textAlign = "left";

  const each = [
    { g: RELATIVITY, Rin, col: RELAT, name: "general relativity" },
    { g: COUNTED, Rin: Rin * scale, col: MODEL, name: "the count" },
  ].map(o => {
    const p = profileOf(o.g, { Rin: o.Rin, Rout: o.Rin * 12, gamma: 3 }, XHI + 2, 460, 520);
    const peak = ringOf(p);
    const top = Math.max(...p.I);
    return { ...o, p, peak, top, crit: criticalOf(o.g).b };
  });

  for (const o of each) {
    // the critical curve, which is NOT where the ring is
    ctx.strokeStyle = o.col; ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
    ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(X(o.crit), Tp); ctx.lineTo(X(o.crit), Tp + h); ctx.stroke();
    ctx.setLineDash([]); ctx.globalAlpha = 1;

    ctx.strokeStyle = o.col; ctx.lineWidth = 2.1;
    ctx.beginPath();
    o.p.b.forEach((b, i) => {
      const y = Y(o.p.I[i] / o.top);
      if (i === 0) ctx.moveTo(X(b), y); else ctx.lineTo(X(b), y);
    });
    ctx.stroke();

    // and where it peaks, which is what a fitter would call the ring
    ctx.fillStyle = o.col;
    ctx.beginPath(); ctx.arc(X(o.peak.peak), Y(1), 3.4, 0, 7); ctx.fill();
    ctx.strokeStyle = o.col; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(X(o.peak.peak), Y(1)); ctx.lineTo(X(o.peak.peak), Tp + h);
    ctx.stroke(); ctx.globalAlpha = 1;
  }

  const [gr, ct] = each;
  const lx = X(7.6);                    // clear of the peak, which is the busy half
  tag(s, lx, Tp + 14, `general relativity — critical curve ${gr.crit.toFixed(3)} M, ring peaks at ${gr.peak.peak.toFixed(3)} M`, RELAT);
  tag(s, lx, Tp + 27, `the count — critical curve ${ct.crit.toFixed(3)} M, ring peaks at ${ct.peak.peak.toFixed(3)} M`, MODEL);
  tag(s, lx, Tp + 44, `the critical curves differ by ${((ct.crit / gr.crit - 1) * 100).toFixed(2)}% — the RINGS by ${((ct.peak.peak / gr.peak.peak - 1) * 100).toFixed(2)}%`, SEEN);
  tag(s, lx, Tp + 57, `dotted = the critical curve · solid dot = the ring`, FAINT, 8.5);
  tag(s, lx, Tp + 68, `plasma from ${Rin.toFixed(2)} M outward, ε ∝ R⁻³, optically thin, static`, FAINT, 8.5);

  ctx.fillStyle = FAINT; ctx.textAlign = "center";
  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.fillText("impact parameter b  [GM/c²]", L + w / 2, s.height - 8);
  ctx.textAlign = "left";
  ctx.fillText("brightness", 6, 16);
};

export const RingProfiles = ({ height = 320 }: { height?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>
      the same plasma around both geometries — and the rings are closer together than
      the critical curves are, because a ring is the image of matter outside the curve
    </div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate={false} deps={["ringprof"]}
        paint={() => ({ frame: (s: Surface) => profiles(s) })} />
    </div>
  </div>;

// ─── and how much survives ──────────────────────────────────────────────────

/**
 * THE FIGURE THE WHOLE ARGUMENT COMES DOWN TO.
 *
 * Horizontally: where the emission stops, read as the α it produces in general
 * relativity — so the x-axis is in the same units EHT calibrate in, and their
 * α = 11.55 is a vertical line on it. Vertically: the ratio an instrument would
 * measure between the two geometries.
 *
 * At the left edge, where emission reaches the photon sphere, all three anchorings
 * meet the geometric 4.63%: the ring IS the critical curve there. Everywhere to the
 * right of that they fan out, and EHT's own α sits in the fan — where the answer is
 * anything from 1% to 6% depending on an assumption about plasma that this model has
 * no way to fix.
 */
const dilution = (s: Surface) => {
  const { ctx } = s;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, s.width, s.height);
  const L = 52, R = 16, Tp = 22, B = 34;
  const w = s.width - L - R, h = s.height - Tp - B;
  const XLO = 10, XHI = 17, YLO = 0.995, YHI = 1.085;
  const X = (a: number) => L + w * (a - XLO) / (XHI - XLO);
  const Y = (v: number) => Tp + h * (1 - (v - YLO) / (YHI - YLO));

  const e = entryOf("metric/ring-as-imaged");
  if (!e?.table) {
    tag(s, L, Tp + 20, "the sweep is NOT IN THE REPORT — run metric/ring-as-imaged", "#e0685f", 11);
    return;
  }
  const col = (n: string) => e.table!.columns.indexOf(n);
  const rows = e.table.rows.map(r => ({
    a: Number(r[col("α in relativity")]),
    areal: Number(r[col("ratio · areal")]),
    isco: Number(r[col("ratio · ISCO")]),
    photon: Number(r[col("ratio · photon")]),
  })).filter(r => isFinite(r.a)).sort((p, q) => p.a - q.a);

  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  for (const v of [1.00, 1.02, 1.04, 1.06, 1.08]) {
    ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(L + w, Y(v)); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "right";
    ctx.fillText(v.toFixed(2), L - 6, Y(v) + 3);
  }
  for (let a = 10; a <= XHI; a += 1) {
    ctx.beginPath(); ctx.moveTo(X(a), Tp); ctx.lineTo(X(a), Tp + h); ctx.stroke();
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(String(a), X(a), Tp + h + 15);
  }
  ctx.textAlign = "left";

  // the geometric effect, which is the ceiling this cannot exceed and rarely reaches
  const geo = criticalOf(COUNTED).b / criticalOf(RELATIVITY).b;
  ctx.strokeStyle = SEEN; ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(L, Y(geo)); ctx.lineTo(L + w, Y(geo)); ctx.stroke();
  ctx.setLineDash([]);
  // and no effect at all
  ctx.strokeStyle = RELAT; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(L, Y(1)); ctx.lineTo(L + w, Y(1)); ctx.stroke();

  // where EHT's calibration puts the emission
  ctx.strokeStyle = DATA; ctx.lineWidth = 1.6; ctx.setLineDash([2, 3]);
  ctx.beginPath(); ctx.moveTo(X(11.55), Tp); ctx.lineTo(X(11.55), Tp + h); ctx.stroke();
  ctx.setLineDash([]);

  const lines: [keyof typeof rows[0], string, string][] = [
    ["photon", "#c98bd4", "inner edge scaled to each photon sphere"],
    ["isco", MODEL, "inner edge at each geometry's own ISCO"],
    ["areal", "#6fd39b", "inner edge at the same areal radius"],
  ];
  for (const [k, c] of lines) {
    ctx.strokeStyle = c; ctx.lineWidth = 2.1;
    ctx.beginPath();
    rows.forEach((r, i) => {
      const y = Y(Math.min(YHI, Math.max(YLO, r[k] as number)));
      if (i === 0) ctx.moveTo(X(r.a), y); else ctx.lineTo(X(r.a), y);
    });
    ctx.stroke();
    for (const r of rows) {
      ctx.fillStyle = c;
      ctx.beginPath(); ctx.arc(X(r.a), Y(Math.min(YHI, Math.max(YLO, r[k] as number))), 2, 0, 7);
      ctx.fill();
    }
  }

  tag(s, L + 6, Y(1.081), `the geometry's own 4.63% — reached only where emission goes all the way down`, SEEN);
  let y = 1.0715;
  for (const [, c, label] of lines) { tag(s, L + 6, Y(y), label, c); y -= 0.0045; }
  tag(s, X(11.55) + 6, Y(1.003), "EHT's α = 11.55", DATA);
  const obs = OBSERVED();
  if (Number.isFinite(obs))
    tag(s, X(11.55) + 6, Y(obs + 0.0045), `→ ${((obs - 1) * 100).toFixed(1)}% at the ISCO anchoring`, MODEL);
  tag(s, L + 6, Y(1.0005), "no difference from general relativity at all", RELAT);

  ctx.fillStyle = FAINT; ctx.textAlign = "center";
  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.fillText("where the emission stops, read as the α it produces in general relativity",
    L + w / 2, s.height - 8);
  ctx.textAlign = "left";
  ctx.fillText("ring ratio", 6, 16);
};

export const RingDilution = ({ height = 330 }: { height?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>
      how much of the 4.63% an instrument actually sees — against where the emission
      stops, and the spread is wider than the effect
    </div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate={false} deps={["ringdil"]}
        paint={() => ({ frame: (s: Surface) => dilution(s) })} />
    </div>
  </div>;
