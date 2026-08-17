/**
 * THE MODEL, RUN — the lattice, its vacuum and a structure in it, with the only
 * stochastic element the one the model actually has.
 *
 * Two earlier versions of this panel were wrong in the same way. The first moved
 * rays along smooth radii with a "vacuum flux" and a "damage rate"; the second put
 * cells on a grid but still made the vacuum by a coin per cell per tick. Both are
 * statistics of a process rather than the process. THE MODEL IS DETERMINISTIC
 * EXCEPT IN ONE PLACE, and that place is a convention rather than a fudge:
 *
 *   STATE       every cell is a spatial point or is not. Each point carries, for
 *               each of the 8 headings of the plane (3² − 1), either nothing or a
 *               charge of polarity ±1. One value per heading per cell — no reals,
 *               no probabilities, no occupancy vectors.
 *
 *   (G+M/2)     a NEUTRAL point — a point with no charge on any heading — expands
 *               into two points of opposite polarity, on every axis. WHERE and WHEN
 *               it fires is forced: wherever a point is neutral, on the expansion's
 *               own beat. THE ONE CHOICE IS THE SIGN, and how widely that single
 *               choice is shared is the perNode / perAxis / perRay convention.
 *
 *   STREAM      every charge moves one cell along its own heading. Nothing else
 *               moves it and nothing changes its heading.
 *
 *   (G+M/1)     two OPPOSITE polarities meeting head-on annihilate, "leaving a
 *               single neutral spatial point behind". Note what that says: the
 *               point SURVIVES, neutral — and TWO POINTS HAVE BECOME ONE, which is
 *               a shortening of space and not a hole in it. An earlier version of
 *               this panel deleted the cell instead, and within sixty ticks the
 *               whole grid was gaps, which is how the error announced itself. A
 *               fixed grid cannot draw a shortening, so it is counted, and where it
 *               lands on the structure the structure's cycle gets shorter.
 *
 *   (G+M/3)     two IDENTICAL polarities meeting head-on turn around. Nothing is
 *               made or destroyed, and this is much the commonest event.
 *
 * THE THREE CONVENTIONS, which are the whole of the randomness (`tests/pernode`):
 *
 *   perNode     ONE sign for the whole node, into all its axes at once — so the
 *               two sides of a node get the same sign and it is a coherent
 *               go-between. `pernode` finds this is what the far field needs
 *   perAxis     each axis signed on its own, so a node hands out four independent
 *               ± pairs
 *   perRay      every heading signed independently, which BREAKS the ± pair that
 *               (G+M/2) states — shown for contrast, not as a candidate
 *
 * WHAT IS NOT PUT IN, AND MATTERS: the vacuum's DENSITY. `tests/vacuum` derives it
 * as f = (1−p)/(2−p) → ½ with the rate cancelling, so it is not a setting here but
 * where the automaton goes on its own. The readout is measured every tick and comes
 * out around 20–30% rather than 50%, which is not a discrepancy: ½ is the p → 0
 * limit, and these panels expand every third tick so they can be watched. The point
 * is that NOBODY CHOSE the number — it is whatever the rules settle at.
 *
 * THE STRUCTURE is a marked cycle of points with one charge circulating, whose
 * polarity is its LAP PARITY — one lap +, the next −, so 4π returns it and 2π does
 * not. `tests/layered` is why that is a lap and not a rail: a Möbius band has ONE
 * boundary circle, so the two "rails" of the earlier panel were the same edge
 * traversed twice, and giving them opposite signs was the error that made the
 * earlier automaton eat itself.
 */

import { CanvasView, Surface } from "./canvas";

// the book's palette, used with the book's meanings
const INK = "#c8cbd4", FAINT = "#5a5f6e", GRID = "rgba(255,255,255,0.055)";
const BACK = "#08090d";
const MODEL = "#4aa8eb";            // + polarity, as everywhere else in the book
const DATA = "#eb964a";             // − polarity
const SEEN = "#eef0f5";             // the thing being pointed at: the structure
const GOOD = "#8bd48b";             // (G+M/2), space made
const BAD = "#e0685f";              // (G+M/1), space destroyed

// the 8 headings of the plane; d and d^4 are the two ends of one axis
const DIRS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];
const OPP = (d: number) => (d + 4) % 8;

export type Convention = "perNode" | "perAxis" | "perRay";
/** what to draw: the instant, or one of the time-averages the vacuum washes out of */
export type View = "live" | "meanPol" | "meanOcc" | "meanAnn";

const N = 39, CC = 19, RAD = 8;
const LAPS = 2;                     // the double cover: two laps to close

const ixOf = (x: number, y: number) => y * N + x;
const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < N && y < N;

type W = {
  space: Uint8Array;                // 1 = a spatial point exists here
  pol: Int8Array;                   // N·N·8 — the polarity on each heading
  isRib: Uint8Array;
  ribOrder: number[];               // the structure's cycle, in order
  ribAt: number; ribLap: number;
  annih: number; create: number; turn: number;
  ribLost: number; ribBack: number; selfAnnih: number;
  shorter: number; longer: number; ribFull: number;
  ribHome: number[];                // the cycle as built, so a lost point can return
  // time-averages. The vacuum is unbiased, so these are how the structure is seen:
  accPol: Float32Array;             // Σ net polarity
  accOcc: Float32Array;             // Σ (any charge here)
  accAnn: Float32Array;             // Σ (G+M/1) fired here
  pings: { i: number; life: number; kind: 0 | 1 }[];
  ticks: number; occ: number;       // measured, not set
  seed: number;
};

/**
 * The only random draw in the model: which sign a creation event chooses.
 *
 * mulberry32, NOT the house LCG. With (s·1103515245 + 12345) the successive draws
 * correlate with the raster order they are taken in, and the time-averaged polarity
 * came out with a VERTICAL STRIPE through it — a spatial pattern in the vacuum that
 * the vacuum does not have. `tests/front` hit the same generator failing on long
 * runs. A visible artefact in an average is the cheapest way to catch it.
 */
const coin = (w: W) => {
  w.seed = (w.seed + 0x6D2B79F5) | 0;
  let t = Math.imul(w.seed ^ (w.seed >>> 15), 1 | w.seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296 < 0.5 ? -1 : 1;
};

const build = (): W => {
  const isRib = new Uint8Array(N * N);
  const ribOrder: number[] = [];
  const seen = new Set<number>();
  for (let k = 0; k < 60; k++) {
    const a = (2 * Math.PI * k) / 60;
    const i = ixOf(CC + Math.round(RAD * Math.cos(a)), CC + Math.round(RAD * Math.sin(a)));
    if (seen.has(i)) continue;
    seen.add(i); ribOrder.push(i); isRib[i] = 1;
  }
  return {
    space: new Uint8Array(N * N).fill(1), pol: new Int8Array(N * N * 8),
    isRib, ribOrder, ribAt: 0, ribLap: 0,
    annih: 0, create: 0, turn: 0, ribLost: 0, ribBack: 0, selfAnnih: 0,
    shorter: 0, longer: 0, ribFull: ribOrder.length, ribHome: ribOrder.slice(), pings: [],
    accPol: new Float32Array(N * N), accOcc: new Float32Array(N * N),
    accAnn: new Float32Array(N * N),
    ticks: 0, occ: 0, seed: 20260817,
  };
};

/** neutral: a spatial point carrying no charge on any heading */
const neutral = (w: W, i: number) => {
  if (!w.space[i]) return false;
  for (let d = 0; d < 8; d++) if (w.pol[i * 8 + d]) return false;
  return true;
};

const tick = (w: W, conv: Convention, every: number, rigid = false) => {
  // ── (G+M/2). Every neutral point expands into two points of opposite polarity
  //    on every axis. The only choice is the sign, and the convention is how
  //    widely one choice is shared.
  if (w.ticks % every === 0) {
    for (let i = 0; i < N * N; i++) {
      if (!neutral(w, i)) continue;
      const nodeSign = coin(w);
      for (let a = 0; a < 4; a++) {
        if (conv === "perRay") {
          w.pol[i * 8 + a] = coin(w);
          w.pol[i * 8 + OPP(a)] = coin(w);
        } else {
          const s = conv === "perNode" ? nodeSign : coin(w);
          w.pol[i * 8 + a] = s;
          w.pol[i * 8 + OPP(a)] = -s;              // the pair, opposite polarity
        }
      }
      w.create++; w.longer++;
      w.pings.push({ i, life: 1, kind: 1 });
      // creation ON a point the structure has lost gives that point back, at its
      // own place in the cycle. Anything looser lets the cycle wander off its own
      // geometry, which an earlier version of this did.
      const slot = w.ribHome.indexOf(i);
      if (slot >= 0 && !w.isRib[i]) {
        let at = 0;
        for (let k = 0; k < w.ribOrder.length; k++)
          if (w.ribHome.indexOf(w.ribOrder[k]) < slot) at = k + 1;
        w.ribOrder.splice(at, 0, i); w.isRib[i] = 1; w.ribBack++;
      }
    }
  }

  // ── STREAM. One cell along its own heading. A charge whose next point has been
  //    annihilated has nowhere to go and stays.
  const next = new Int8Array(N * N * 8);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = ixOf(x, y);
    for (let d = 0; d < 8; d++) {
      const p = w.pol[i * 8 + d];
      if (!p) continue;
      const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
      if (!inside(nx, ny)) continue;               // off the edge of the world
      const j = ixOf(nx, ny);
      if (!w.space[j] || next[j * 8 + d]) { next[i * 8 + d] = p; continue; }
      next[j * 8 + d] = p;
    }
  }
  w.pol = next;

  // ── the structure's charge advances along its cycle; its polarity is its LAP
  //    PARITY, which is the sign holonomy that makes it a fermion
  const cyc = w.ribOrder.length;
  const nxt = (w.ribAt + 1) % cyc;
  if (w.space[w.ribOrder[nxt]]) {
    w.ribAt = nxt;
    if (nxt === 0) w.ribLap = (w.ribLap + 1) % LAPS;
  }
  const here = w.ribOrder[w.ribAt];
  const ribPol = w.ribLap === 0 ? +1 : -1;

  // ── COLLIDE. Head-on pairs — the two ends of one axis, on one point. Which rule
  //    fires is decided by the two polarities and by nothing else.
  for (let i = 0; i < N * N; i++) {
    if (!w.space[i]) continue;
    for (let a = 0; a < 4; a++) {
      const p = w.pol[i * 8 + a], q = w.pol[i * 8 + OPP(a)];
      if (!p || !q) continue;
      if (p === q) {
        w.pol[i * 8 + a] = q; w.pol[i * 8 + OPP(a)] = p;      // (G+M/3) turn
        w.turn++;
      } else {
        // (G+M/1): the two charges go and "a single neutral spatial point" is left
        // behind — the point SURVIVES, neutral, and two points have become one. On
        // a fixed grid that shortening cannot be drawn as a hole, so it is counted
        // here and, where it lands on the structure, taken out of its cycle.
        w.pol[i * 8 + a] = 0; w.pol[i * 8 + OPP(a)] = 0;
        w.annih++; w.shorter++; w.accAnn[i] += 1;
        w.pings.push({ i, life: 1, kind: 0 });
        if (!rigid && w.isRib[i] && w.ribOrder.length > 3) {
          const at = w.ribOrder.indexOf(i);
          if (at >= 0) {
            w.ribOrder.splice(at, 1); w.isRib[i] = 0; w.ribLost++;
            if (w.ribAt >= w.ribOrder.length) w.ribAt = 0;
          }
        }
      }
    }
  }

  // ── and the structure's own charge against whatever shares its point
  for (let a = 0; a < 8; a++) {
    const q = w.pol[here * 8 + a];
    if (!q) continue;
    if (q === ribPol) w.turn++;                   // (G+M/3), harmless
    else {
      w.pol[here * 8 + a] = 0;
      w.annih++; w.selfAnnih++; w.shorter++; w.accAnn[here] += 1;
      w.pings.push({ i: here, life: 1, kind: 0 });
    }
    break;
  }

  for (const p of w.pings) p.life -= 0.2;
  w.pings = w.pings.filter(p => p.life > 0);
  if (w.pings.length > 400) w.pings.length = 400;

  // measured rather than set: how full the vacuum has become
  let filled = 0, slots = 0;
  for (let i = 0; i < N * N; i++) {
    if (!w.space[i]) continue;
    slots += 8;
    let net = 0, any = 0;
    for (let d = 0; d < 8; d++) { const q = w.pol[i * 8 + d]; if (q) { net += q; any++; } }
    filled += any;
    w.accPol[i] += net;
    w.accOcc[i] += any / 8;
  }
  w.occ = slots ? filled / slots : 0;
  w.ticks++;
};

const paint = (w: W, sur: Surface, label: string, view: View) => {
  const { ctx, width, height } = sur;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
  const s = Math.min((width - 14) / N, (height - 118) / N);
  const ox = (width - s * N) / 2, oy = 78;

  // the field. In `live` this is the instant, which is mostly vacuum and mostly
  // noise. In the mean views it is a running average — and because the vacuum is
  // UNBIASED, averaging is what makes it disappear and leaves whatever is
  // persistent, which is the structure.
  const T = Math.max(1, w.ticks);
  let hi = 1e-9;
  if (view !== "live") {
    for (let i = 0; i < N * N; i++) {
      const v = view === "meanPol" ? Math.abs(w.accPol[i]) / T
        : view === "meanOcc" ? w.accOcc[i] / T : w.accAnn[i] / T;
      if (v > hi) hi = v;
    }
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = ixOf(x, y);
    const px = ox + x * s, py = oy + y * s;
    const w1 = Math.max(1, s - 0.7);
    if (view === "live") {
      let net = 0, n = 0;
      for (let d = 0; d < 8; d++) { const p = w.pol[i * 8 + d]; if (p) { net += p; n++; } }
      if (n) {
        ctx.globalAlpha = Math.min(1, Math.abs(net) / 4) * 0.6 + 0.22;
        ctx.fillStyle = net > 0 ? MODEL : net < 0 ? DATA : FAINT;
        ctx.fillRect(px, py, w1, w1);
        ctx.globalAlpha = 1;
      } else {
        ctx.strokeStyle = GRID; ctx.lineWidth = 1;
        ctx.strokeRect(px + 0.5, py + 0.5, Math.max(1, s - 1), Math.max(1, s - 1));
      }
      continue;
    }
    if (view === "meanPol") {
      // signed: the vacuum averages to nothing, so any colour left is a bias
      const v = w.accPol[i] / T;
      const a = Math.min(1, Math.abs(v) / hi);
      if (a < 0.04) continue;
      ctx.globalAlpha = a * 0.9;
      ctx.fillStyle = v > 0 ? MODEL : DATA;
      ctx.fillRect(px, py, w1, w1);
      ctx.globalAlpha = 1;
      continue;
    }
    const v = (view === "meanOcc" ? w.accOcc[i] : w.accAnn[i]) / T;
    const a = Math.min(1, v / hi);
    if (a < 0.05) continue;
    ctx.globalAlpha = a * 0.92;
    ctx.fillStyle = view === "meanAnn" ? BAD : MODEL;
    ctx.fillRect(px, py, w1, w1);
    ctx.globalAlpha = 1;
  }

  // the events, as they fire: red where space shortened, green where it grew
  if (view === "live") for (const p of w.pings) {
    const x = p.i % N, y = (p.i - (p.i % N)) / N;
    ctx.strokeStyle = p.kind === 0 ? BAD : GOOD;
    ctx.globalAlpha = Math.max(0, p.life) * 0.9;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(ox + x * s + s / 2, oy + y * s + s / 2, s * (0.5 + 1.4 * (1 - p.life)), 0, 2 * Math.PI);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = SEEN; ctx.lineWidth = 1.6; ctx.globalAlpha = 0.9;
  for (const i of w.ribOrder) {
    const x = i % N, y = (i - (i % N)) / N;
    ctx.strokeRect(ox + x * s + 0.5, oy + y * s + 0.5, Math.max(1, s - 1), Math.max(1, s - 1));
  }
  ctx.globalAlpha = 1;

  const h = w.ribOrder[w.ribAt];
  const hx = h % N, hy = (h - (h % N)) / N;
  ctx.fillStyle = w.ribLap === 0 ? MODEL : DATA;
  ctx.beginPath();
  ctx.arc(ox + hx * s + s / 2, oy + hy * s + s / 2, Math.max(2.2, s * 0.44), 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = SEEN; ctx.lineWidth = 1; ctx.stroke();

  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = INK; ctx.fillText(label, 8, 14);
  if (view === "live") {
    ctx.fillStyle = MODEL; ctx.fillRect(8, 22, 9, 9);
    ctx.fillStyle = DATA; ctx.fillRect(21, 22, 9, 9);
    ctx.fillStyle = FAINT;
    ctx.fillText("net polarity on the point, this tick  (+ / −)", 36, 30);
    ctx.strokeStyle = BAD; ctx.beginPath(); ctx.arc(12.5, 40.5, 4.5, 0, 2 * Math.PI); ctx.stroke();
    ctx.strokeStyle = GOOD; ctx.beginPath(); ctx.arc(25.5, 40.5, 4.5, 0, 2 * Math.PI); ctx.stroke();
    ctx.fillStyle = FAINT;
    ctx.fillText("space shortened (G+M/1) / lengthened (G+M/2)", 36, 44);
  } else {
    ctx.fillStyle = view === "meanAnn" ? BAD : MODEL;
    ctx.fillRect(8, 22, 9, 9);
    ctx.fillStyle = FAINT;
    ctx.fillText(view === "meanPol" ? "TIME-AVERAGED net polarity — the vacuum is unbiased, so it averages to nothing"
      : view === "meanOcc" ? "TIME-AVERAGED occupancy — how often any charge is on the point"
        : "(G+M/1) PER POINT, accumulated — where space is being destroyed", 36, 30);
    ctx.fillStyle = FAINT;
    // the washout is 1/√N, so quote the tick count with it -- the residual mottle
    // is not a bias, it is the average not yet being finished
    ctx.fillText(`averaged over ${w.ticks} ticks — peak ${hi.toExponential(1)}, washing out as 1/√N`,
      36, 44);
  }
  ctx.strokeStyle = SEEN; ctx.strokeRect(8.5, 50.5, 8, 8);
  ctx.fillStyle = FAINT;
  ctx.fillText("the structure as built, and its circulating charge", 36, 58);

  ctx.textAlign = "right";
  ctx.fillStyle = BAD;
  ctx.fillText(`(G+M/1) annihilate — point gone  ${w.annih}`, width - 8, 30);
  ctx.fillStyle = GOOD;
  ctx.fillText(`(G+M/2) create — point expands   ${w.create}`, width - 8, 44);
  ctx.fillStyle = INK;
  ctx.fillText(`(G+M/3) turn — nothing lost      ${w.turn}`, width - 8, 58);
  ctx.fillStyle = FAINT;
  ctx.fillText(`occupancy ${(100 * w.occ).toFixed(0)}%, measured — ½ is the p→0 limit  ·  tick ${w.ticks}`,
    width - 8, 14);
  ctx.textAlign = "left";
  ctx.fillStyle = w.ribOrder.length < w.ribFull ? BAD : FAINT;
  ctx.fillText(`structure: lap ${w.ribLap === 0 ? "+" : "−"}  ·  cycle ${w.ribOrder.length} of ${w.ribFull} points  ·  shortened ${w.ribLost}, regrown ${w.ribBack}`,
    8, height - 22);
  ctx.fillStyle = FAINT;
  ctx.fillText(`space: shortened ${w.shorter}, lengthened ${w.longer}  ·  its own annihilations ${w.selfAnnih}`,
    8, height - 8);
};

const Panel = (
  { note, label, conv, every, height, view = "live", warm = 60, rigid = false }: {
    note: string; label: string; conv: Convention; every: number; height: number;
    view?: View; warm?: number; rigid?: boolean;
  },
) => <div style={{ marginBottom: "1.1rem" }}>
  <div style={{
    fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
    color: FAINT, marginBottom: 6,
  }}>{note}</div>
  <div style={{ height, background: BACK }}>
    <CanvasView animate deps={[note, conv, view, rigid]} paint={() => {
      const w = build();
      let acc = 0;
      return {
        // let it find its own occupancy before anyone looks: the density is a
        // result, and a fresh grid shows the transient rather than the state
        start: () => { for (let i = 0; i < warm; i++) tick(w, conv, every, rigid); },
        frame: (sur: Surface, dt: number) => {
          acc += Math.min(dt, 0.05);
          while (acc > 1 / 12) { tick(w, conv, every, rigid); acc -= 1 / 12; }
          paint(w, sur, label, view);
        },
      };
    }} />
  </div>
</div>;

/** the instant: mostly vacuum, and mostly noise — which is the point of the rest */
export const Live = ({ height = 480 }: { height?: number }) =>
  <Panel note="one tick of the model — the vacuum fills every point, and the structure is lost in it"
    label="live" conv="perNode" every={3} height={height} />;

/**
 * The ring, averaged out of the vacuum.
 *
 * TWO THINGS ARE TRUE AT ONCE HERE AND SEPARATING THEM IS THE WHOLE POINT.
 *
 *   The vacuum is UNBIASED, so time-averaging genuinely erases it: nothing was
 *   subtracted and no window was chosen, the average simply goes to nothing where
 *   the charges are as often + as −.
 *
 *   And the structure is HELD FIXED — its points are not taken by (G+M/1) in these
 *   three panels. That is NOT a claim that it survives. It does not: the cycle
 *   length random-walks with no restoring force and is absorbed at zero, which is
 *   the repair question this whole arc ends on and which no panel can settle. What
 *   is on show is what a ring LOOKS like in this vacuum, not how long it lasts.
 */
export const MeanOccupancy = ({ height = 480 }: { height?: number }) =>
  <Panel note="time-averaged occupancy, with the structure held fixed — the vacuum is unbiased so it averages flat, and the ring is what is left"
    label="mean occupancy · structure held fixed" conv="perNode" every={3}
    view="meanOcc" warm={2500} rigid height={height} />;

/** the same average, signed */
export const MeanPolarity = ({ height = 480 }: { height?: number }) =>
  <Panel note="the same average taken with the sign kept — and the ring vanishes from it too, because its charge is + on one lap and − on the next"
    label="mean polarity · structure held fixed" conv="perNode" every={3}
    view="meanPol" warm={2500} rigid height={height} />;

/** where space is being destroyed, accumulated */
export const MeanAnnihilation = ({ height = 480 }: { height?: number }) =>
  <Panel note="every (G+M/1) accumulated per point, structure held fixed — where the vacuum is destroying space"
    label="annihilation density · structure held fixed" conv="perNode" every={3}
    view="meanAnn" warm={2500} rigid height={height} />;

/** the convention the far field needs: one sign per node, shared across its axes */
export const PerNode = ({ height = 480 }: { height?: number }) =>
  <Panel note="the model, per node — one sign per creation event shared across all of that point's axes, which is the convention the far field needs"
    label="perNode" conv="perNode" every={3} height={height} />;

/** each axis of a node signed on its own */
export const PerAxis = ({ height = 480 }: { height?: number }) =>
  <Panel note="the same rules with each axis of a neutral point signed on its own — four independent ± pairs per event instead of one shared sign"
    label="perAxis" conv="perAxis" every={3} height={height} />;

/** every heading signed on its own, which breaks the pair structure */
export const PerRay = ({ height = 480 }: { height?: number }) =>
  <Panel note="every heading signed independently — which breaks the ± pair (G+M/2) states, and is here for contrast rather than as a candidate"
    label="perRay" conv="perRay" every={3} height={height} />;
