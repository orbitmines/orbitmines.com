/**
 * THE LATTICE ITSELF, WITH POLARITY — the electromagnetic panels, running the three
 * rules rather than summing an expression.
 *
 * `em.tsx` draws the continuum reading: rays as smooth dots, fields as arrow grids.
 * These draw the model. Every cell is a spatial point holding, for each of the 8
 * headings of the plane, either nothing or a charge of ±1; every charge moves one
 * cell a tick along its own heading; and where two meet head on:
 *
 *   (G+M/1)  OPPOSITE polarities annihilate, and two spatial points become ONE —
 *            space SHORTENS there, which is the only thing in this model that a
 *            force is made of.
 *   (G+M/3)  ALIKE polarities turn, costing nothing.
 *   (G+M/2)  a NEUTRAL point — no charge on any heading — expands into a pair.
 *
 * A fixed grid cannot draw a shortening, so it is COUNTED and drawn as heat. That
 * is the whole of the measurement `tests/forces` makes: where the red is denser is
 * where space is being destroyed faster, and a body is pulled toward the side that
 * is losing more of it.
 *
 * The right half of each panel is that count, accumulated. The left is one tick of
 * the same run, which is mostly vacuum and mostly noise — and the pairing is the
 * point, because the force is invisible in the instant and obvious in the average.
 */

import { CanvasView, Surface } from "./canvas";

const FAINT = "#5a5f6e", BACK = "#08090d";
const PLUS = "#4aa8eb", MINUS = "#eb964a";
const SEEN = "#eef0f5", BAD = "#e0685f";

const N = 121, C = 60, CELLS = N * N;
const DIRS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const DEG = 8;
const OPP = (d: number) => (d + 4) % DEG;
const idx = (x: number, y: number) => x * N + y;

type World = {
  pol: Int8Array; nxt: Int8Array; body: Int8Array;
  ann: Float64Array; ticks: number; seed: number;
};

const make = (qL: number, qR: number, sep: number): World => {
  const body = new Int8Array(CELLS);
  for (const [x0, q] of [[C - sep / 2, qL], [C + sep / 2, qR]] as [number, number][])
    for (let x = x0 - 3; x <= x0 + 3; x++) for (let y = C - 3; y <= C + 3; y++)
      if (Math.hypot(x - x0, y - C) <= 3) body[idx(x, y)] = (q === 0 ? 3 : q) as any;
  return {
    pol: new Int8Array(CELLS * DEG), nxt: new Int8Array(CELLS * DEG),
    body, ann: new Float64Array(CELLS), ticks: 0, seed: 20260817,
  };
};

const tick = (w: World, pCreate: number) => {
  const rnd = () => {
    w.seed ^= w.seed << 13; w.seed ^= w.seed >>> 17; w.seed ^= w.seed << 5;
    return ((w.seed >>> 0) / 4294967296);
  };
  // (G+M/2): a neutral point expands into a pair on every axis
  for (let c = 0; c < CELLS; c++) {
    if (w.body[c]) continue;
    let neutral = true;
    for (let d = 0; d < DEG; d++) if (w.pol[c * DEG + d]) { neutral = false; break; }
    if (!neutral || rnd() > pCreate) continue;
    const s = rnd() < 0.5 ? 1 : -1;
    for (let a = 0; a < 4; a++) { w.pol[c * DEG + a] = s as any; w.pol[c * DEG + OPP(a)] = -s as any; }
  }
  // STREAM
  w.nxt.fill(0);
  for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) {
    const c = idx(x, y);
    for (let d = 0; d < DEG; d++) {
      const p = w.pol[c * DEG + d];
      if (!p) continue;
      const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
      if (nx < 1 || nx >= N - 1 || ny < 1 || ny >= N - 1) continue;
      w.nxt[idx(nx, ny) * DEG + d] = p;
    }
  }
  w.pol.set(w.nxt);
  // the bodies: they destroy what lands on them, and emit their own sign
  for (let c = 0; c < CELLS; c++) {
    const b = w.body[c];
    if (!b) continue;
    for (let d = 0; d < DEG; d++) w.pol[c * DEG + d] = (b === 3 ? 0 : b) as any;
  }
  // (G+M/1) and (G+M/3)
  for (let c = 0; c < CELLS; c++) {
    if (w.body[c]) continue;
    for (let a = 0; a < 4; a++) {
      const p = w.pol[c * DEG + a], q = w.pol[c * DEG + OPP(a)];
      if (!p || !q) continue;
      if (p === q) { w.pol[c * DEG + a] = q; w.pol[c * DEG + OPP(a)] = p; }
      else { w.pol[c * DEG + a] = 0; w.pol[c * DEG + OPP(a)] = 0; w.ann[c]++; }
    }
  }
  w.ticks++;
};

const paint = (w: World, sur: Surface, label: string, sep: number) => {
  const { ctx, width, height } = sur;
  const H = height - 26;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
  const half = width / 2;
  const s = Math.min(half / N, H / N);
  const ox = (half - N * s) / 2, oy = 20 + (H - 20 - N * s) / 2;

  // ── left: one tick of the model
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    const c = idx(x, y);
    let net = 0, k = 0;
    for (let d = 0; d < DEG; d++) { const p = w.pol[c * DEG + d]; if (p) { net += p; k++; } }
    if (!k) continue;
    ctx.globalAlpha = Math.min(0.9, 0.25 + k / DEG);
    ctx.fillStyle = net > 0 ? PLUS : net < 0 ? MINUS : FAINT;
    ctx.fillRect(ox + x * s, oy + y * s, Math.max(s, 1), Math.max(s, 1));
  }
  ctx.globalAlpha = 1;

  // ── right: where space has been destroyed, AGAINST THE VACUUM'S OWN RATE.
  //
  // Normalising to the peak makes the panels incomparable — the opposite-charge
  // case puts a narrow, intense band between the two, so scaling to its peak sends
  // everything else to nothing, while the alike case has no band and its vacuum
  // fills the frame. Both then look like the opposite of what they are. What a
  // force is, is an EXCESS over the rate the vacuum runs at anyway, so that is what
  // is drawn: the far field is the zero and only what exceeds it is inked.
  let bg = 0, bn = 0;
  for (let x = 6; x < N - 6; x++) for (let y = 6; y < N - 6; y++) {
    const c = idx(x, y);
    if (w.body[c]) continue;
    if (Math.hypot(x - C, y - C) < 34) continue;
    bg += w.ann[c]; bn++;
  }
  bg = bn ? bg / bn : 1;
  const ox2 = half + (half - N * s) / 2;
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    const c = idx(x, y);
    if (w.body[c]) continue;
    const excess = (w.ann[c] - bg) / Math.max(bg, 1e-9);
    if (excess < 0.08) continue;
    ctx.globalAlpha = Math.min(0.95, excess * 0.9);
    ctx.fillStyle = BAD;
    ctx.fillRect(ox2 + x * s, oy + y * s, Math.max(s, 1), Math.max(s, 1));
  }
  ctx.globalAlpha = 1;

  // the two bodies, on both halves
  for (const base of [ox, ox2]) {
    for (const [x0, q] of [[C - sep / 2, w.body[idx(C - sep / 2, C)]],
    [C + sep / 2, w.body[idx(C + sep / 2, C)]]] as [number, number][]) {
      ctx.beginPath();
      ctx.arc(base + x0 * s, oy + C * s, 3 * s, 0, 7);
      ctx.fillStyle = q === 3 ? "#2a2e38" : q > 0 ? PLUS : MINUS;
      ctx.fill();
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2; ctx.stroke();
    }
  }

  ctx.font = "10px ui-monospace, monospace";
  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText("one tick — mostly vacuum", half / 2, 14);
  ctx.fillText("destroyed ABOVE the vacuum rate", half + half / 2, 14);
  ctx.textAlign = "left";
  ctx.fillText(label, 10, height - 10);
  ctx.textAlign = "right";
  ctx.fillText(`${w.ticks} ticks`, width - 10, height - 10);
  ctx.textAlign = "left";
};

const Panel = (
  { note, qL, qR, sep = 26, height = 300 }:
    { note: string; qL: number; qR: number; sep?: number; height?: number },
) => <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>{note}</div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate deps={[note, qL, qR]} paint={() => {
        const w = make(qL, qR, sep);
        let acc = 0;
        return {
          // the average is the measurement, so it is built before the first frame
          // rather than accumulated while the reader watches an empty panel
          start: () => { for (let i = 0; i < 260; i++) tick(w, 0.06); },
          frame: (sur: Surface, dt: number) => {
            acc += Math.min(dt, 0.05);
            while (acc > 1 / 20) { tick(w, 0.06); acc -= 1 / 20; }
            paint(w, sur, qL * qR < 0 ? "opposite — (G+M/1) fires between them"
              : qL * qR > 0 ? "alike — (G+M/3) turns instead"
                : "inert — the control, which only shadows", sep);
          },
        };
      }} />
    </div>
  </div>;

/** two opposite charges: the annihilation piles up between them */
export const LatticeAttract = ({ height = 300 }: { height?: number }) =>
  <Panel note="two opposite charges on the lattice — space is destroyed BETWEEN them, which is the pull"
    qL={1} qR={-1} height={height} />;

/** two alike charges: (G+M/3) turns instead, and the between-band is absent */
export const LatticeRepel = ({ height = 300 }: { height?: number }) =>
  <Panel note="two alike charges — the rays turn instead of annihilating, and the band between them is gone"
    qL={1} qR={1} height={height} />;

/** the control: two absorbers with no charge, which shadow each other and nothing more */
export const LatticeInert = ({ height = 300 }: { height?: number }) =>
  <Panel note="the control — two inert absorbers of the same shape, which shadow each other and carry no sign"
    qL={0} qR={0} height={height} />;
