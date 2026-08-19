/**
 * HOW BIG A MAGNET CAN GET, AND HOW STRONG A FORCE CAN GET — the two scale
 * questions the magnetism arc ends on, drawn because the shape of each is the
 * point and a table hides it.
 *
 * These two used to sit in the archive with `const CYCLE = 8, DEG = 26, SHEET = 8`
 * at the top of the file and the model's own magneton written in as the literal
 * 0.0794. Both are now read off `CONTINUOUS.ts`, which reads them off the geometry
 * `DISCRETE.ts` is running — so changing the lattice moves the blue line instead of
 * leaving it where a cubic-26 run once put it. That was the whole of what these
 * owed, and it is the reason they were the last two panels outside `visuals/`.
 *
 * The palette is the article's, unchanged: WHAT IS MEASURED in white, TEXTBOOK
 * ELECTROMAGNETISM in orange, THIS MODEL in blue, and nothing else gets a strong
 * colour. On the gravitational side those three lie on top of each other. Here the
 * second panel is forty-two decades of them not doing that, which is the one number
 * this half of the article openly owes.
 */

import { CanvasView, Surface } from "./CANVAS";
import { constants } from "../CONTINUOUS";

const INK = "#c8cbd4", FAINT = "#5a5f6e", GRID = "rgba(255,255,255,0.055)";
const MODEL = "#4aa8eb", DATA = "#eb964a", SEEN = "#eef0f5";
const BACK = "#08090d";

/** the lattice's own constants — the same object every test and every other panel reads */
const k = constants();

// ---------------------------------------------------------------------------
// the article's drawing helpers, kept local so the panel stands on its own

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
      <CanvasView animate={false} deps={[note]} paint={() => ({ frame: paint })} />
    </div>
  </div>;

// ---------------------------------------------------------------------------
// 1. SCALE — from one electron to a magnetar
//
// The ceiling is µ/M ≤ µ_B/m_e, a volume law, and a big body screens itself so only
// a skin gets out. Neither is close to binding anywhere, which is a null result in
// the useful direction: SCALE IS NOT WHAT STOPS THIS.

type Body = { name: string; perkg: number; kind: "lab" | "sky" };

/** measured moment per kilogram — laboratory materials and the sky, both literature */
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

/** µ_B/m_e in A·m² per kg — the most moment a kilogram of anything can carry */
const CEILING = 1.018e7;

/**
 * AND THE MODEL'S OWN MAGNETON, AS A FRACTION OF THAT CEILING.
 *
 * A source's loop is a ring of the lattice: it comes round in `CYCLE` ticks, so the
 * radius that ring encloses is `(CYCLE·Ḡ/2π)·λ̄_C` and the moment it makes is that
 * fraction of one Bohr magneton per electron mass. Both symbols in it are the
 * lattice's — the ring size and the gravitational constant — so this is a count, not
 * a fit, and it MOVES with the geometry. On cubic 26 it is 8·0.062351/2π = 0.0794,
 * which is the literal that used to be typed here; on the fcc 12 the book now runs
 * on it is a different number, and the line below goes where that says.
 */
const MAGNETON = k.CYCLE * k.gravitational() / (2 * Math.PI);

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

  // and the model's own magneton, off the geometry rather than off a transcription
  const mx = X(CEILING * MAGNETON);
  ctx.strokeStyle = MODEL; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(mx, box.y0 + 32); ctx.lineTo(mx, box.y1); ctx.stroke();
  ctx.setLineDash([]);
  tag(s, mx - 168, box.y0 + 12, `the model's own, ×${MAGNETON.toFixed(4)} (${k.geometry})`, MODEL, 10);

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
// 2. AND THE ONE NUMBER THE WHOLE THING OWES
//
// Every force in this model is second order in the emission — nothing happens to a
// charge that does not MEET another charge — so the electric force is capped at the
// size of gravity. Measurement puts it 4.17·10⁴² above.

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
