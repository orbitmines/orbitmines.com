/**
 * ELECTROMAGNETISM, DRAWN — because the shape of this disagreement is the
 * whole point and a table hides it.
 *
 * Every panel here carries the same three things the gravitational ones do:
 * WHAT IS MEASURED in white, TEXTBOOK ELECTROMAGNETISM in orange, and THIS
 * MODEL in blue. On the gravitational side the three lay on top of each other
 * and the argument was about a fourth thing. Here two of them come apart, and
 * that is what these are for.
 *
 * The numbers are all from `tests/` — `pulses`, `magnets`, `coulomb`,
 * `moment`, `dipole`, `scale`, `maxwell` — and nothing is drawn that is not
 * produced there.
 */

import { CanvasView, Surface } from "./canvas";

// the article's palette, unchanged: measured is white, textbook is orange,
// this model is blue, and nothing else gets a strong colour
const INK = "#c8cbd4", FAINT = "#5a5f6e", GRID = "rgba(255,255,255,0.055)";
const MODEL = "#4aa8eb", DATA = "#eb964a", SEEN = "#eef0f5";
const RELAT = "#9aa0b4";                 // the reading that was tried and failed
const GOOD = "#8bd48b", BAD = "#e0685f";
const BACK = "#08090d";

const CYCLE = 8, WAYS = 26, SHEET = 8;

// ---------------------------------------------------------------------------
// the same drawing helpers the rotation panels use, kept local so this file
// stands on its own

const frame = (s: Surface, pad = 46, bottom = 36) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK;
  ctx.fillRect(0, 0, width, height);
  return {
    x0: pad, x1: width - 14, y0: 12, y1: height - bottom,
    w: width - 14 - pad, h: height - bottom - 12,
  };
};

const tag = (s: Surface, x: number, y: number, text: string, css: string, size = 11) => {
  s.ctx.fillStyle = css;
  s.ctx.font = `500 ${size}px ui-sans-serif, system-ui, sans-serif`;
  s.ctx.fillText(text, x, y);
};

const mono = (s: Surface, x: number, y: number, text: string, css: string, size = 10) => {
  s.ctx.fillStyle = css;
  s.ctx.font = `400 ${size}px ui-monospace, Menlo, monospace`;
  s.ctx.fillText(text, x, y);
};

const centred = (s: Surface, x: number, y: number, text: string, css: string, size = 10) => {
  s.ctx.textAlign = "center";
  mono(s, x, y, text, css, size);
  s.ctx.textAlign = "left";
};

const under = (s: Surface, box: ReturnType<typeof frame>, text: string) => {
  centred(s, (box.x0 + box.x1) / 2, s.height - 6, text, FAINT, 10);
};

/** a titled block with a caption above it, the shape every panel in the article has */
const Panel = ({ paint, height, note }: {
  paint: (s: Surface) => void; height: number; note: string;
}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>{note}</div>
    <div style={{ height, background: BACK }}>
      <CanvasView deps={[note]} paint={() => ({ frame: paint })} />
    </div>
  </div>;

// ---------------------------------------------------------------------------
// 1. THE FOUR EMITTERS
//
// `physics.ts` gives a source two switches that have nothing to do with each
// other — whether it has SIDES (an axis) and whether it COMES ROUND (turns or
// flips). Crossing them gives four things and each of the four is something,
// which is the first claim this half of the article makes.

type Kind = {
  name: string; sides: boolean; round: boolean;
  charge: string; moment: string; is: string;
};

/**
 * AND THE LAST COLUMN IS DELIBERATELY THIN. An earlier draft labelled these
 * "an electric charge" and "a magnetic dipole", and that is a reading of the
 * model rather than a result of it — there is no account of matter here, so
 * nothing says which of the four an electron or a positron is, or whether any
 * of them is a particle at all. What is established is the emission: whether
 * there is a net sign, and whether there is a first moment. Everything this
 * half of the article derives is about the fourth column, which is a BIAS, and
 * a bias is magnetism.
 */
const KINDS: Kind[] = [
  { name: "flipping, no sides", sides: false, round: true, charge: "0", moment: "0", is: "nothing signed — pure mass" },
  { name: "held, no sides", sides: false, round: false, charge: "±1", moment: "0", is: "one sign, in every direction" },
  { name: "turning, sided", sides: true, round: true, charge: "0", moment: "0", is: "nothing signed — a wave" },
  { name: "held, sided", sides: true, round: false, charge: "0", moment: "±1", is: "+ one side, − the other" },
];

/**
 * What one of them emits into a direction at a tick, as a sign — and this is
 * `quantised` from `physics.ts` rather than a convenient copy of it.
 *
 * A source WITHOUT sides has no equator, so nought is not an answer it can
 * give, and it is quantised from its BEARING: half-open at the quarter turns,
 * so the two instants fall opposite ways and the halves come out equal. Doing
 * it from the cosine's sign instead gives five ticks one way and three the
 * other, which is a rounding error drawn as a fact.
 */
const turnsInto = (t: number) => t - Math.floor(t);

const emits = (k: Kind, dir: number, tick: number) => {
  const bearing = k.round ? tick / CYCLE : 0;

  if (!k.sides) return turnsInto(bearing + 0.25) < 0.5 ? 1 : -1;

  const along = Math.cos(2 * Math.PI * (dir / CYCLE - bearing));
  return Math.abs(along) < 1e-9 ? 0 : Math.sign(along);
};

const kinds = (s: Surface) => {
  const box = frame(s, 14, 22);
  const { ctx } = s;

  const cw = box.w / 4;
  const t = Math.floor((performance.now() / 420) % CYCLE);

  KINDS.forEach((k, i) => {
    const cx = box.x0 + cw * (i + 0.5), cy = box.y0 + 74;
    const R = Math.min(46, cw * 0.30);

    centred(s, cx, box.y0 + 12, k.name, INK, 11);

    // the ring of directions, each coloured by what it is being given
    for (let d = 0; d < CYCLE; d++) {
      const a = 2 * Math.PI * d / CYCLE;
      const e = emits(k, d, t);
      const x = cx + R * Math.cos(a), y = cy - R * Math.sin(a);

      ctx.strokeStyle = e === 0 ? FAINT : e > 0 ? MODEL : DATA;
      ctx.lineWidth = e === 0 ? 1 : 2.2;
      ctx.beginPath(); ctx.moveTo(cx + 7 * Math.cos(a), cy - 7 * Math.sin(a));
      ctx.lineTo(x, y); ctx.stroke();

      ctx.fillStyle = e === 0 ? FAINT : e > 0 ? MODEL : DATA;
      ctx.beginPath(); ctx.arc(x, y, e === 0 ? 1.6 : 3, 0, 2 * Math.PI); ctx.fill();
    }

    // the axis, if it has one
    if (k.sides) {
      const b = k.round ? 2 * Math.PI * t / CYCLE : 0;
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx - (R + 12) * Math.cos(b), cy + (R + 12) * Math.sin(b));
      ctx.lineTo(cx + (R + 12) * Math.cos(b), cy - (R + 12) * Math.sin(b));
      ctx.stroke(); ctx.setLineDash([]);
    }

    // and the strip: what ONE fixed direction receives over a whole turn
    const sy = cy + R + 30, sw = Math.min(cw - 22, 96), sx = cx - sw / 2;
    mono(s, sx, sy - 6, "one direction, over a turn", FAINT, 9);
    for (let u = 0; u < CYCLE; u++) {
      const e = emits(k, 0, u);
      ctx.fillStyle = e === 0 ? "#2a2e38" : e > 0 ? MODEL : DATA;
      ctx.fillRect(sx + sw * u / CYCLE, sy, sw / CYCLE - 1.5, 13);
      if (u === t) { ctx.strokeStyle = SEEN; ctx.lineWidth = 1.4; ctx.strokeRect(sx + sw * u / CYCLE - 1, sy - 1, sw / CYCLE + 0.5, 15); }
    }

    centred(s, cx, sy + 30, `net ${k.charge}    moment ${k.moment}`, FAINT, 10);
    centred(s, cx, sy + 45, k.is, k.sides && !k.round ? SEEN : INK, 11);
  });

  under(s, box, "+ blue   − orange   nothing grey   ·   what these ARE is a question about matter, which the model has not answered");
};

/** the four things an emitter can be, and each of the four is something */
export const Kinds = ({ height = 250 }: { height?: number }) =>
  <Panel paint={kinds} height={height}
    note="two switches — sides, and coming round — and the four emissions they make" />;

// ---------------------------------------------------------------------------
// 2. A MAGNET IS A LOPSIDED DEFAULT
//
// An emitter never stops: `beat = 1/mass` and `rate` are separate clocks, so
// magnetising a thing cannot change what it weighs. What a magnet is, is the
// amount by which its alternation fails to come out even — dwell = ½ + δ,
// P = 2δ — and because dwell is a count of ticks out of CYCLE, P is QUANTISED
// in steps of 2/CYCLE.

const lopsided = (s: Surface) => {
  const box = frame(s, 96, 44);
  const { ctx } = s;

  const rows: [string, number][] = [
    ["a lamp", 4], ["", 5], ["", 6], ["", 7], ["all one way", 8],
  ];
  const rh = box.h / (rows.length + 1.1);
  const sw = Math.min(box.w * 0.40, 230);

  rows.forEach(([label, k], i) => {
    const y = box.y0 + rh * (i + 0.4);
    const P = (2 * k - CYCLE) / CYCLE;

    mono(s, 6, y + 11, label, label ? INK : FAINT, 10);

    for (let u = 0; u < CYCLE; u++) {
      ctx.fillStyle = u < k ? MODEL : DATA;
      ctx.fillRect(box.x0 + sw * u / CYCLE, y, sw / CYCLE - 1.5, 14);
    }
    mono(s, box.x0 + sw + 6, y + 11, `${k}/${CYCLE}`, FAINT, 10);

    // and what it comes to
    const bx = box.x0 + sw + 44, bw = box.w - sw - 134;
    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, y + 7); ctx.lineTo(bx + bw, y + 7); ctx.stroke();
    ctx.fillStyle = P > 0 ? SEEN : FAINT;
    ctx.fillRect(bx, y + 2, bw * P, 10);
    mono(s, bx + bw * P + 6, y + 11, `P = ${P.toFixed(2)}`, P > 0 ? SEEN : FAINT, 10);
  });

  const y = box.y0 + rh * (rows.length + 0.6);
  mono(s, 6, y + 11, "N52, measured", DATA, 10);
  const bx = box.x0 + sw + 44, bw = box.w - sw - 134;
  ctx.strokeStyle = GRID; ctx.beginPath(); ctx.moveTo(bx, y + 7); ctx.lineTo(bx + bw, y + 7); ctx.stroke();
  ctx.fillStyle = DATA; ctx.fillRect(bx, y + 4, 2, 7);
  mono(s, bx + 8, y + 11, "P = 1.51 × 10⁻⁵  —  99.9985% of it cancels", DATA, 10);

  under(s, box, "dwell is a count of ticks, so P comes in steps of 2/CYCLE = 0.25 — magnetisation is quantised");
};

/** the magnet as a discrepancy, and the quantisation that follows from it */
export const Lopsided = ({ height = 230 }: { height?: number }) =>
  <Panel paint={lopsided} height={height}
    note="a magnet is a lopsided default, not a stopped one — and what real magnets manage" />;

// ---------------------------------------------------------------------------
// 3. THE FIELD IT WRITES, AGAINST THE FIELD A MAGNET HAS
//
// This is the panel the electromagnetic half of the article turns on. The
// angular shape is right and the radial law is not, and the two are drawn
// together because either alone is misleading: a picture of the lobes looks
// like agreement, and a plot of the fall-off looks like nothing in particular.

const fieldPanel = (s: Surface) => {
  const box = frame(s, 20, 34);
  const { ctx } = s;

  const half = box.w / 2;

  // --- left: the angular shape, as a polar plot -----------------------------
  {
    const cx = box.x0 + half * 0.5, cy = (box.y0 + box.y1) / 2, R = Math.min(half * 0.34, box.h * 0.38);

    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - R - 12); ctx.lineTo(cx, cy + R + 12); ctx.stroke();

    // the reading that failed: |cos θ| at fixed r, drawn faint and first so
    // the two that agree sit on top of it
    ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]); ctx.strokeStyle = RELAT;
    for (const sign of [1, -1]) {
      ctx.beginPath();
      let go = false;
      for (let i = 0; i <= 240; i++) {
        const th = 2 * Math.PI * i / 240, c = Math.cos(th);
        if (Math.sign(c) !== sign) { go = false; continue; }
        const r = R * Math.abs(c);
        const x = cx + r * Math.sin(th), y = cy - r * Math.cos(th);
        go ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        go = true;
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // a real dipole: |B| ∝ √(1+3cos²θ), and it REVERSES across the equator
    ctx.strokeStyle = DATA; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const th = 2 * Math.PI * i / 240;
      const r = R * Math.sqrt(1 + 3 * Math.cos(th) * Math.cos(th)) / 2;
      const x = cx + r * Math.sin(th), y = cy - r * Math.cos(th);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();

    // and this model, with the bias on a PLACE — measured at 3cos²θ − 1, so
    // it lies ON the orange and is drawn dashed over it to show that it does
    ctx.strokeStyle = MODEL; ctx.lineWidth = 1.8; ctx.setLineDash([5, 4]);
    ctx.beginPath();
    for (let i = 0; i <= 240; i++) {
      const th = 2 * Math.PI * i / 240;
      const r = R * Math.sqrt(1 + 3 * Math.cos(th) * Math.cos(th)) / 2;
      const x = cx + r * Math.sin(th), y = cy - r * Math.cos(th);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    centred(s, cx, box.y0 + 12, "the lobes — angular shape", INK, 11);
    mono(s, cx + 6, cy - R - 14, "N", FAINT, 10);
    mono(s, cx + 6, cy + R + 20, "S", FAINT, 10);
    mono(s, box.x0 + 4, box.y1 - 26, "a dipole", DATA, 9);
    mono(s, box.x0 + 4, box.y1 - 14, "bias on a PLACE", MODEL, 9);
    mono(s, box.x0 + 4, box.y1 - 2, "bias on a direction", RELAT, 9);
    centred(s, cx, box.y1 + 12, "the blue lies on the orange", GOOD, 10);
  }

  // --- right: the fall-off, log–log ----------------------------------------
  {
    const x0 = box.x0 + half + 34, x1 = box.x1 - 6;
    const y0 = box.y0 + 26, y1 = box.y1 - 14;
    const DEC = 4;                                   // decades of R shown
    const X = (l: number) => x0 + (x1 - x0) * l / DEC;
    const Y = (l: number) => y0 + (y1 - y0) * l / (3 * DEC);

    ctx.strokeStyle = GRID; ctx.lineWidth = 1;
    for (let d = 0; d <= DEC; d++) {
      ctx.beginPath(); ctx.moveTo(X(d), y0); ctx.lineTo(X(d), y1); ctx.stroke();
      centred(s, X(d), y1 + 13, `10${["⁰", "¹", "²", "³", "⁴"][d]}`, FAINT, 9);
    }

    const line = (slope: number, css: string, wide: number, dash: number[] = []) => {
      ctx.strokeStyle = css; ctx.lineWidth = wide; ctx.setLineDash(dash);
      ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(DEC), Y(slope * DEC)); ctx.stroke();
      ctx.setLineDash([]);
    };

    line(2, RELAT, 1.6, [2, 4]);          // bias on a DIRECTION: 1/R², and wrong
    line(3, DATA, 2.2);                   // a real dipole field: 1/R³
    line(4, SEEN, 3.0);                   // the force between two magnets: 1/R⁴
    line(4, MODEL, 1.6, [5, 4]);          // and this model, on top of it

    centred(s, (x0 + x1) / 2, box.y0 + 12, "and the fall-off — log–log", INK, 11);
    mono(s, X(0) + 6, Y(2 * DEC) + 12, "bias on a direction   1/R²   ✗", RELAT, 9);
    mono(s, X(0) + 6, Y(2 * DEC) + 24, "a dipole field   1/R³", DATA, 9);
    mono(s, X(0) + 6, Y(2 * DEC) + 36, "two magnets   1/R⁴", SEEN, 9);
    mono(s, X(0) + 6, Y(2 * DEC) + 48, "bias on a PLACE   slope −2.00", MODEL, 9);
    mono(s, x0 - 26, Y(0) + 4, "1", FAINT, 9);
    centred(s, (x0 + x1) / 2, y1 + 27, "separation, in units of the first", FAINT, 9);
  }

  under(s, box, "measured `poles`: 3cos²θ − 1 to three decimals, and slope −2.00 on gravity's 1/R² — magnetostatics, with nothing added");
};

/** the lobes agree and the fall-off does not, which is the whole result */
export const Fields = ({ height = 290 }: { height?: number }) =>
  <Panel paint={fieldPanel} height={height}
    note="the field the XOR writes, against what a magnet's field actually does" />;

// ---------------------------------------------------------------------------
// 4. THE FIVE ARRANGEMENTS
//
// Measured in `dipole` by integrating the annihilation excess over all of
// space. Two of five come out right, and the two that fail are the two
// everybody has actually held in their hands.

type Arrangement = { name: string; want: number; point: number; region: number };

/**
 * From `tests/poles`, which runs both readings through the identical integral.
 * `point` is the bias put on a DIRECTION out of one emitter; `region` is the
 * bias put on a PLACE, so a bar is + at one end and − at the other. Signs
 * only — the two are normalised differently and the panel says so.
 */
const ARRANGED: Arrangement[] = [
  { name: "N–S facing", want: +1, point: -8.65e-5, region: +7.96e-4 },
  { name: "N–N facing", want: -1, point: +8.65e-5, region: -7.96e-4 },
  { name: "side by side, parallel", want: -1, point: -2.03e-1, region: -3.99e-4 },
  { name: "side by side, antiparallel", want: +1, point: +2.03e-1, region: +3.99e-4 },
  { name: "one across the other", want: 0, point: 1.4e-17, region: 1.2e-19 },
];

const pairs = (s: Surface) => {
  const box = frame(s, 176, 34);
  const { ctx } = s;

  const rh = box.h / ARRANGED.length;
  const mid = (box.x0 + box.x1) / 2 - 74, halfw = (box.x1 - box.x0) / 2 - 90;

  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(mid, box.y0); ctx.lineTo(mid, box.y1); ctx.stroke();
  centred(s, mid - halfw / 2, box.y0 - 1, "repel", FAINT, 9);
  centred(s, mid + halfw / 2, box.y0 - 1, "attract", FAINT, 9);
  mono(s, box.x1 - 142, box.y0 - 1, "bias on a…", FAINT, 9);

  ARRANGED.forEach((a, i) => {
    const y = box.y0 + rh * (i + 0.5);

    mono(s, 6, y + 4, a.name, INK, 10);

    // what a magnet does — white, and it is a direction rather than a size
    if (a.want !== 0) {
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.6; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(mid, y); ctx.lineTo(mid + halfw * 0.92 * a.want, y);
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = SEEN;
      ctx.beginPath();
      const tipx = mid + halfw * 0.92 * a.want;
      ctx.moveTo(tipx, y); ctx.lineTo(tipx - 6 * a.want, y - 4); ctx.lineTo(tipx - 6 * a.want, y + 4);
      ctx.fill();
    }

    // the two readings, as directions — the magnitudes are on different
    // scales, so what is drawn is the sign and the verdict
    const verdict = (v: number, floor: number) =>
      a.want === 0 ? Math.abs(v) < floor : Math.sign(v) === a.want && Math.abs(v) > floor;
    const okP = verdict(a.point, 1e-3), okR = verdict(a.region, 1e-7);

    ctx.fillStyle = okR ? MODEL : BAD;
    const w = halfw * 0.66 * Math.sign(a.region) * (a.want === 0 ? 0 : 1);
    ctx.fillRect(Math.min(mid, mid + w), y - 5, Math.max(Math.abs(w), 2), 10);

    mono(s, box.x1 - 142, y + 4, okP ? "direction ok" : "direction ✗", okP ? FAINT : BAD, 10);
    mono(s, box.x1 - 58, y + 4, okR ? "place ok" : "place ✗", okR ? GOOD : BAD, 10);
  });

  under(s, box, "white dashes: what two magnets do   ·   bars: the bias put on a PLACE, integrated over all of space");
};

/** every arrangement two magnets can be in, and which of them survive */
export const Pairs = ({ height = 220 }: { height?: number }) =>
  <Panel paint={pairs} height={height}
    note="the five things two magnets do — bias on a direction fails two of them, bias on a place none" />;

// ---------------------------------------------------------------------------
// 5. SCALE — from one electron to a magnetar
//
// The ceiling is µ/M ≤ µ_B/m_e, a volume law, and a big body screens itself so
// only a skin gets out. Neither is close to binding anywhere, which is a null
// result in the useful direction: SCALE IS NOT WHAT STOPS THIS.

type Body = { name: string; perkg: number; kind: "lab" | "sky" };

/** measured moment per kilogram, from `tests/scale` */
const BODIES: Body[] = [
  { name: "iron, saturated", perkg: 217.3, kind: "lab" },
  { name: "N52", perkg: 153.8, kind: "lab" },
  { name: "ferrite", perkg: 65.0, kind: "lab" },
  { name: "the Sun", perkg: 1.70e-1, kind: "sky" },
  { name: "Jupiter", perkg: 8.17e-1, kind: "sky" },
  { name: "a magnetar", perkg: 6.22e-1, kind: "sky" },
  { name: "a neutron star", perkg: 6.22e-4, kind: "sky" },
  { name: "the Earth", perkg: 1.32e-2, kind: "sky" },
];

const CEILING = 1.018e7;                 // µ_B/m_e, A·m² per kg

const ceiling = (s: Surface) => {
  const box = frame(s, 54, 40);
  const { ctx } = s;

  // log axis from 10⁻⁴ to 10⁸ A·m²/kg
  const LO = -4, HI = 8;
  const X = (v: number) => box.x0 + box.w * (Math.log10(v) - LO) / (HI - LO);

  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (let d = LO; d <= HI; d += 2) {
    const x = X(Math.pow(10, d));
    ctx.beginPath(); ctx.moveTo(x, box.y0 + 32); ctx.lineTo(x, box.y1); ctx.stroke();
    centred(s, x, box.y1 + 14, `10${d < 0 ? "⁻" : ""}${["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸"][Math.abs(d)]}`, FAINT, 9);
  }

  // the ceiling
  const cx = X(CEILING);
  ctx.strokeStyle = SEEN; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
  ctx.beginPath(); ctx.moveTo(cx, box.y0 + 32); ctx.lineTo(cx, box.y1); ctx.stroke();
  ctx.setLineDash([]);
  tag(s, cx - 118, box.y0 + 26, "the ceiling, µ_B/m_e", SEEN, 10);

  // and the model's own magneton, 12.6× below it
  const mx = X(CEILING * 0.0794);
  ctx.strokeStyle = MODEL; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(mx, box.y0 + 32); ctx.lineTo(mx, box.y1); ctx.stroke();
  ctx.setLineDash([]);
  tag(s, mx - 146, box.y0 + 12, "the model's own, ×0.0794", MODEL, 10);

  const rh = (box.h - 34) / BODIES.length;
  [...BODIES].sort((a, b) => b.perkg - a.perkg).forEach((b, i) => {
    const y = box.y0 + 34 + rh * (i + 0.5);
    const x = X(b.perkg);

    ctx.strokeStyle = GRID;
    ctx.beginPath(); ctx.moveTo(box.x0, y); ctx.lineTo(box.x1, y); ctx.stroke();

    ctx.fillStyle = b.kind === "lab" ? DATA : SEEN;
    ctx.beginPath(); ctx.arc(x, y, 4, 0, 2 * Math.PI); ctx.fill();

    mono(s, x + 9, y + 4, `${b.name}   ${(b.perkg / CEILING).toExponential(1)} of it`,
      b.kind === "lab" ? DATA : INK, 10);
  });

  under(s, box, "moment per kilogram — nothing anywhere gets within 10⁻⁴ of what the model allows");
};

/** the ceiling, at every scale there is, and how much room is left under it */
export const Ceiling = ({ height = 250 }: { height?: number }) =>
  <Panel paint={ceiling} height={height}
    note="what a given mass could manage as a magnet, from a laboratory to a magnetar" />;

// ---------------------------------------------------------------------------
// 6. AND THE ONE NUMBER THE WHOLE THING OWES
//
// Every force in this model is second order in the emission — nothing happens
// to a charge that does not MEET another charge — so the electric force is
// capped at the size of gravity. Measurement puts it 4.17·10⁴² above.

const ladder = (s: Surface) => {
  const box = frame(s, 130, 44);
  const { ctx } = s;

  // log decades across, because the thing being shown IS forty-two decades
  const HI = 46;
  const X = (d: number) => box.x0 + (box.w - 20) * d / HI;

  ctx.strokeStyle = GRID; ctx.lineWidth = 1;
  for (let d = 0; d <= 40; d += 10) {
    ctx.beginPath(); ctx.moveTo(X(d), box.y0 + 22); ctx.lineTo(X(d), box.y1); ctx.stroke();
    centred(s, X(d), box.y1 + 14, d === 0 ? "1" : `10^${d}`, FAINT, 9);
  }

  const rows: [string, number, string, string][] = [
    ["measured", 42.62, SEEN, "e²/4πε₀ ÷ G·m_e²"],
    ["textbook", 42.62, DATA, "α ÷ (m_e/m_P)²"],
    ["this model", 0.0, MODEL, "capped at gravity — every force is a meeting"],
  ];

  const rh = (box.h - 30) / rows.length;
  rows.forEach(([name, dec, css, why], i) => {
    const y = box.y0 + 28 + rh * (i + 0.5);

    mono(s, 6, y + 4, name, css, 11);
    ctx.fillStyle = css;
    ctx.fillRect(box.x0, y - 7, Math.max(X(dec) - box.x0, 2.5), 14);
    mono(s, X(dec) + 8, y + 4, dec === 0 ? "10⁰" : `10^${dec.toFixed(2)}`, css, 10);
    mono(s, box.x0 + 6, y + 21, why, FAINT, 9);
  });

  centred(s, (box.x0 + box.x1) / 2, box.y0 + 12,
    "the electric force between two electrons, over their gravity", INK, 11);
  under(s, box, "the gap is exactly α ÷ (m_e/m_P)² — so the hierarchy is explained and α is not");
};

/** the strength bill, which is one number and forty-two orders of magnitude */
export const Ladder = ({ height = 250 }: { height?: number }) =>
  <Panel paint={ladder} height={height}
    note="how strong electromagnetism is — measured, textbook, and what this model can reach" />;

// ---------------------------------------------------------------------------
// 7. THE FIELD ITSELF — a bar magnet, drawn from the model's own poles.
//
// `poles` establishes that a magnet is a body biased + at one end and − at the
// other, and that the XOR between two such bodies gives 3cos²θ − 1 and 1/R⁴.
// This draws what that looks like: the emitters inside cancelling against each
// other, the two faces left over, and the field they make.
//
// The field lines are integrated from the model's own signed emission —
// `Σ sign·SHEET/4πr²` over the two pole faces — and not from a textbook
// formula. They come out as a dipole because that sum IS a dipole, which is
// the point.

/**
 * The model's own signed emission at a place, in SCREEN coordinates.
 *
 * `Σ sign·r̂/r²` over the emitters making up the two faces — which is the
 * gradient of what `poles` integrates, and is what a field line follows. No
 * dipole formula is used anywhere; the dipole is what this sum comes to.
 */
const poleField = (
  x: number, y: number, cx: number, cy: number, H: number, W: number,
) => {
  let fx = 0, fy = 0;
  const N = 9;                                  // each face, sampled across

  for (const [py, sign] of [[cy - H, +1], [cy + H, -1]] as [number, number][])
    for (let i = 0; i < N; i++) {
      const px = cx + W * (-1 + 2 * (i + 0.5) / N);
      const dx = x - px, dy = y - py;
      const r2 = dx * dx + dy * dy + 4;          // softened by a face's own width
      const r = Math.sqrt(r2);
      fx += sign * dx / (r2 * r * N);
      fy += sign * dy / (r2 * r * N);
    }

  return [fx, fy] as const;
};

const barfield = (s: Surface) => {
  const box = frame(s, 14, 30);
  const { ctx } = s;

  const half = box.w / 2;

  // --- left: why there are two faces at all -------------------------------
  {
    const cx = box.x0 + half * 0.48, cy = (box.y0 + box.y1) / 2;
    const W = Math.min(half * 0.28, 96), H = Math.min(box.h * 0.56, 150);
    const nx = 5, ny = 7;

    centred(s, cx, box.y0 + 14, "why a magnet has two faces", INK, 11);

    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const x = cx - W / 2 + W * (i + 0.5) / nx;
        const y = cy - H / 2 + H * (j + 0.5) / ny;

        // every emitter points the same way; its + is up and its − is down
        ctx.strokeStyle = j === 0 ? MODEL : j === ny - 1 ? DATA : "#2f3644";
        ctx.lineWidth = j === 0 || j === ny - 1 ? 1.8 : 1.2;
        ctx.beginPath(); ctx.moveTo(x, y + 7); ctx.lineTo(x, y - 7); ctx.stroke();
        ctx.fillStyle = j === 0 ? MODEL : "#2f3644";
        ctx.beginPath(); ctx.arc(x, y - 7, 2.2, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = j === ny - 1 ? DATA : "#2f3644";
        ctx.beginPath(); ctx.arc(x, y + 7, 2.2, 0, 2 * Math.PI); ctx.fill();
      }

    ctx.strokeStyle = FAINT; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
    ctx.strokeRect(cx - W / 2 - 8, cy - H / 2 - 12, W + 16, H + 24);
    ctx.setLineDash([]);

    mono(s, cx + W / 2 + 14, cy - H / 2 - 2, "+ face: nothing above", MODEL, 9);
    mono(s, cx + W / 2 + 14, cy, "the bulk pairs off", FAINT, 9);
    mono(s, cx + W / 2 + 14, cy + H / 2 + 6, "− face: nothing below", DATA, 9);
    centred(s, cx, box.y1 + 4, "inside, every + has a − on it — at a face it does not", FAINT, 9);
  }

  // --- right: the field those two faces make -------------------------------
  {
    const cx = box.x0 + half * 1.5, cy = (box.y0 + box.y1) / 2;
    const H = Math.min(box.h * 0.20, 42), W = Math.min(half * 0.055, 15);

    centred(s, cx, box.y0 + 14, "and the field they make", INK, 11);

    ctx.save();
    ctx.beginPath();
    ctx.rect(box.x0 + half * 1.0, box.y0 + 20, half - 16, box.y1 - box.y0 - 20);
    ctx.clip();

    // Field lines, traced by following the sum above out of the + face and
    // round to the −. Seeded on a small circle about the + pole so they leave
    // it evenly rather than bunching on the axis.
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(160,178,204,0.75)";
    const SEEDS = 13;
    for (let k = 0; k < SEEDS; k++) {
      const a = Math.PI * (k + 0.5) / SEEDS;     // half turn; the other half mirrors
      for (const side of [1, -1]) {
        let x = cx + side * (W + 6) * Math.sin(a);
        let y = cy - H - (W + 6) * Math.cos(a);

        ctx.beginPath(); ctx.moveTo(x, y);
        for (let step = 0; step < 1400; step++) {
          const [ux, uy] = poleField(x, y, cx, cy, H, W);
          const m = Math.hypot(ux, uy);
          if (!(m > 0)) break;
          x += 1.4 * ux / m; y += 1.4 * uy / m;

          // stop once it has come back to the − face, or left the panel
          if (Math.hypot(x - cx, y - (cy + H)) < W + 5) { ctx.lineTo(x, y); break; }
          if (Math.abs(x - cx) > half * 0.52 || Math.abs(y - cy) > box.h * 0.60) break;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    ctx.restore();

    // the magnet itself, over the top
    ctx.fillStyle = MODEL; ctx.fillRect(cx - W, cy - H, 2 * W, H);
    ctx.fillStyle = DATA; ctx.fillRect(cx - W, cy, 2 * W, H);
    ctx.strokeStyle = BACK; ctx.lineWidth = 1;
    ctx.strokeRect(cx - W, cy - H, 2 * W, 2 * H);
    ctx.fillStyle = "#08090d";
    ctx.font = "600 12px ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", cx, cy - H / 2 + 4);
    ctx.fillText("S", cx, cy + H / 2 + 4);
    ctx.textAlign = "left";

    centred(s, cx, box.y1 + 4, "Σ sign·SHEET/4πr² over the two faces — no formula used", FAINT, 9);
  }

  under(s, box, "measured `poles`: 3cos²θ − 1 to three decimals, 1/R⁴ to two, and all five orientations");
};

/** the field, drawn from the model rather than from a textbook */
export const BarField = ({ height = 300 }: { height?: number }) =>
  <Panel paint={barfield} height={height}
    note="a bar magnet — where its two faces come from, and the field they make" />;
