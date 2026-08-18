/**
 * THE TWO CHANNELS, AND AMPÈRE — the electromagnetic panels that run the rules
 * with polarity, and draw the thing an annihilation count could not see.
 *
 * `grid.tsx` draws where space is DESTROYED, which is the pull. That measure is
 * structurally blind to (G+M/3): whatever turning does to a ray it does not
 * destroy it, so a count of annihilations reports a pull of some magnitude for
 * every configuration it is handed, and the repulsion — whose entire content is
 * that annihilation did NOT happen — is invisible to it.
 *
 * SO THESE DRAW BOTH. The left half of each panel is the ray TRAFFIC, accumulated:
 * how much is present in each cell over the run. The right half is the
 * annihilation excess, exactly as `grid.tsx` draws it. The two are the two
 * channels, and the sign law is the XOR between them:
 *
 *   OPPOSITE / PARALLEL     rays meet and ANNIHILATE. The gap is emptied — dark on
 *                           the left, bright on the right — so less momentum lands
 *                           on the facing side and more space is destroyed between.
 *                           NET: they are drawn together.
 *
 *   ALIKE / ANTIPARALLEL    rays meet and TURN. Nothing is destroyed, the gap stays
 *                           full — bright on the left, dark on the right — so the
 *                           partner's rays survive the crossing and land.
 *                           NET: they are pushed apart.
 *
 * Which is why the pull and the push are not two readings of one force. They are
 * two rules, and each configuration picks one.
 *
 * The last panel is different in kind: it draws the MAGNETIC FIELD, read off the
 * lattice as Σσ(D × u) with u the label a ray carries from its emitter — no curl
 * taken, no potential differentiated.
 *
 * AND THE VACUUM IS THE ONE THE VACUUM SECTIONS DERIVE, which is the single change
 * that decides what any of these look like. See `tick` below: firing (G+M/2) only
 * in a completely neutral cell is self-limiting and leaves the box a tenth full, at
 * which density a ray crosses tens of cells untouched and a source's emission stays
 * eight pencil beams. With the derived rule the fill is what it should be, the mean
 * free path is a couple of cells, and the emission DIFFUSES — which is why the
 * fields here are round and short-ranged rather than spoked and infinite.
 *
 * A RESIDUAL STAR IS STILL VISIBLE AND IS NOT AN ARTEFACT. Every meeting is a coin
 * flip between being turned and being annihilated, so whatever is still travelling
 * along its original exit at distance is the population that has never been touched
 * — the ballistic tail the arc keeps finding. It carries the far field and it is
 * the reason the label's field has any range at all, since the vacuum's own rays
 * carry no label.
 *
 * (One deliberate difference from `grid.tsx`, which draws the same rules for the
 * gravity arc: this reads (G+M/2) as `signed`'s per-NODE convention — new room is
 * edged on every axis with ONE sign — rather than as an opposite pair per axis.
 * `signed` gives three independent reasons for it, and it is what makes the fixed
 * point the derived half rather than a tenth of it.)
 */

import { CanvasView, Surface } from "./canvas";

const FAINT = "#5a5f6e", BACK = "#08090d";
const PLUS = "#4aa8eb", MINUS = "#eb964a";
const SEEN = "#eef0f5", BAD = "#e0685f", LIVE = "#6fd39b";

const N = 121, C = 60, CELLS = N * N;
const DIRS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const DEG = 8;
const OPP = (d: number) => (d + 4) % DEG;
const idx = (x: number, y: number) => x * N + y;

/** a 45° turn on the eight-member ring, which is the article's SPIN */
const SPIN = (d: number) => (d + 1) % DEG;

/** the expansion per tick; (1−p)/(2−p) = 0.487, which is the derived half */
const PEXP = 0.05;

/**
 * HOW MUCH OF THE BOX IS DRAWN. At the derived fill the mean free path is about
 * two cells, so everything a source does happens within a few dozen of them and a
 * full 121² frame is mostly empty vacuum with the physics in a corner of it. The
 * lattice is still run at 121² — the window is only what is inked.
 */
const VIEW = 24;
const VN = 2 * VIEW + 1;

type Kind = "charges" | "wires" | "moving" | "still";

type World = {
  pol: Int8Array; nxt: Int8Array;
  lab: Int8Array; nlab: Int8Array;          // the emitter's drift, carried per ray
  src: Int8Array;                            // 0 vacuum, else a source tag
  sig: Int8Array; drift: Int8Array;          // that source's sign and its drift
  ann: Float64Array; live: Float64Array;     // the two channels
  bz: Float64Array;                          // Σσ(D × u), out of the plane
  ticks: number; seed: number; kind: Kind;
};

/**
 * `a` and `b` are the two objects' senses.
 *
 * For `charges` that is the polarity each body emits and there is no drift.
 * For `wires` it is the direction each wire's carriers drift, and each wire is
 * built as TWO INTERLEAVED POPULATIONS — + carriers drifting one way and −
 * carriers the other — so the wire carries no net charge at all and only a
 * current. That is what makes the last panel's field magnetic rather than
 * electric, and it is what `tests/induction` measures.
 */
const make = (kind: Kind, a: number, b: number, sep: number): World => {
  const src = new Int8Array(CELLS), sig = new Int8Array(CELLS), drift = new Int8Array(CELLS);
  if (kind === "charges") {
    for (const [x0, q] of [[C - sep / 2, a], [C + sep / 2, b]] as [number, number][])
      for (let x = x0 - 2; x <= x0 + 2; x++) for (let y = C - 2; y <= C + 2; y++)
        if (Math.hypot(x - x0, y - C) <= 2) {
          const c = idx(x, y);
          src[c] = 1; sig[c] = (q === 0 ? 0 : q) as any; drift[c] = 0;
        }
  } else if (kind === "moving" || kind === "still") {
    // ONE charge, at the centre, with or without a drift to label its rays with
    for (let x = C - 2; x <= C + 2; x++) for (let y = C - 2; y <= C + 2; y++)
      if (Math.hypot(x - C, y - C) <= 2) {
        const c = idx(x, y);
        src[c] = 1; sig[c] = 1; drift[c] = (kind === "moving" ? a : 0) as any;
      }
  } else {
    /*
     * THE WIRE THE FORCE IS MEASURED ON, which is not the wire the FIELD is
     * measured on, and the difference is worth stating rather than smoothing.
     *
     * `tests/wires` builds a current as cells setting their +y exits to +1 and
     * their −y exits to −1: as many + as −, so no net charge, and the CURRENT'S
     * DIRECTION IS IN THE POLARITY. That is what lets the two rules see it — the
     * facing rays of two parallel wires carry opposite signs and annihilate, and
     * of two antiparallel wires the same sign and turn.
     *
     * `tests/induction` builds a wire the other way, as two counter-drifting
     * populations each radiating isotropically, and that is what gives the right
     * FIELD. But its polarity distribution is the same whichever way the current
     * runs — only the labels differ, and a label does not enter the collision
     * rules — SO IT HAS NO MAGNETIC FORCE AT ALL. Drawing it here produced two
     * identical panels, which is how the tension was found.
     */
    for (const [x0, w] of [[C - sep / 2, a], [C + sep / 2, b]] as [number, number][]) {
      if (!w) continue;
      for (let y = 4; y < N - 4; y++) {
        const c = idx(x0, y);
        src[c] = 2; sig[c] = 0; drift[c] = w as any;   // 2 = emit by hemisphere
      }
    }
  }
  const pol = new Int8Array(CELLS * DEG);
  // START AT THE FIXED POINT — half full, with a sign per node — so the panel is
  // not showing the vacuum filling up for its first few hundred ticks
  let sd = 20260817;
  const rnd = () => { sd ^= sd << 13; sd ^= sd >>> 17; sd ^= sd << 5; return ((sd >>> 0) / 4294967296); };
  for (let c = 0; c < CELLS; c++) {
    if (src[c]) continue;
    const s = rnd() < 0.5 ? 1 : -1;
    for (let d = 0; d < DEG; d++) if (rnd() < 0.5) pol[c * DEG + d] = s as any;
  }
  return {
    pol, nxt: new Int8Array(CELLS * DEG),
    lab: new Int8Array(CELLS * DEG), nlab: new Int8Array(CELLS * DEG),
    src, sig, drift,
    ann: new Float64Array(CELLS), live: new Float64Array(CELLS), bz: new Float64Array(CELLS),
    ticks: 0, seed: 20260817, kind,
  };
};

/**
 * (G+M/2), AS THE VACUUM SECTIONS ACTUALLY DERIVE IT — which is not what the first
 * version of these panels ran, and the difference is the whole appearance.
 *
 * Firing creation only in a COMPLETELY NEUTRAL cell sounds like the rule and is
 * self-limiting: once a box has any traffic in it there are almost no fully empty
 * cells left, so the occupancy tops out around 0.1 whatever the rate. At that fill
 * a ray crosses tens of cells without meeting anything, and a source's emission
 * stays twenty-six pencil beams that never spread. THE PANELS CAME OUT AS SPOKES,
 * which is a fact about the rule that was coded and not about the model.
 *
 * `vacuum` and `signed` derive the real one, and its two halves are the same
 * expansion seen twice: NEW ROOM IS EDGED ON EVERY AXIS, and the same expansion
 * THINS WHAT IS ALREADY THERE. Those two lines have the fixed point
 *
 *     f → p + (1−p)f  then  f(1−p)          f* = (1−p)/(2−p) → ½
 *
 * — half full, with the rate cancelling out, which is the one number in this book
 * nobody chose. At a fill of a half the mean free path is about two cells, so a
 * ray does NOT get to keep its heading, and the emission diffuses into a field
 * rather than shining down its exits.
 */
const tick = (w: World, p: number) => {
  const rnd = () => {
    w.seed ^= w.seed << 13; w.seed ^= w.seed >>> 17; w.seed ^= w.seed << 5;
    return ((w.seed >>> 0) / 4294967296);
  };
  for (let c = 0; c < CELLS; c++) {
    if (w.src[c]) continue;
    const b = c * DEG;
    if (rnd() < p) {
      // new room, edged on every axis — one node, one sign, which is the
      // convention `signed` finds three independent reasons for
      const s = rnd() < 0.5 ? 1 : -1;
      for (let d = 0; d < DEG; d++) { w.pol[b + d] = s as any; w.lab[b + d] = 0; }
    }
    for (let d = 0; d < DEG; d++) if (rnd() < p) { w.pol[b + d] = 0; w.lab[b + d] = 0; }
  }
  // stream, carrying the label with the ray
  w.nxt.fill(0); w.nlab.fill(0);
  for (let x = 1; x < N - 1; x++) for (let y = 1; y < N - 1; y++) {
    const b = idx(x, y) * DEG;
    for (let d = 0; d < DEG; d++) {
      const p = w.pol[b + d];
      if (!p) continue;
      const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
      if (nx < 1 || nx >= N - 1 || ny < 1 || ny >= N - 1) continue;
      const nb = idx(nx, ny) * DEG + d;
      w.nxt[nb] = p; w.nlab[nb] = w.lab[b + d];
    }
  }
  w.pol.set(w.nxt); w.lab.set(w.nlab);
  // the sources absorb and re-emit, stamping their drift on everything they send
  for (let c = 0; c < CELLS; c++) {
    const k = w.src[c];
    if (!k) continue;
    if (k === 2) {
      // a wire: its two signs go into opposite hemispheres, so the current's
      // direction is in the polarity and the collision rules can see it
      const q = w.drift[c];
      for (let d = 0; d < DEG; d++) {
        const dy = DIRS[d][1];
        w.pol[c * DEG + d] = (dy > 0 ? q : dy < 0 ? -q : 0) as any;
        w.lab[c * DEG + d] = 0;
      }
    } else {
      for (let d = 0; d < DEG; d++) {
        w.pol[c * DEG + d] = w.sig[c]; w.lab[c * DEG + d] = w.drift[c];
      }
    }
  }
  // (G+M/1) and (G+M/3)
  for (let c = 0; c < CELLS; c++) {
    if (w.src[c]) continue;
    const b = c * DEG;
    for (let p = 0; p < 4; p++) {
      const u = w.pol[b + p], v = w.pol[b + OPP(p)];
      if (!u || !v) continue;
      if (u === v) {
        // ALIKE — the turn, and it has to LEAVE THE AXIS or it is a no-op: two
        // identical counter-propagating rays swapped with each other return the
        // array they were given.
        const p2 = SPIN(p), q2 = OPP(p2);
        if (!w.pol[b + p2] && !w.pol[b + q2]) {
          const la = w.lab[b + p], lb = w.lab[b + OPP(p)];
          w.pol[b + p] = 0; w.pol[b + OPP(p)] = 0; w.lab[b + p] = 0; w.lab[b + OPP(p)] = 0;
          w.pol[b + p2] = u; w.pol[b + q2] = v; w.lab[b + p2] = la; w.lab[b + q2] = lb;
        }
      } else {
        w.pol[b + p] = 0; w.pol[b + OPP(p)] = 0;
        w.lab[b + p] = 0; w.lab[b + OPP(p)] = 0;
        w.ann[c]++;
      }
    }
  }
  // the two channels, and the field
  for (let c = 0; c < CELLS; c++) {
    if (w.src[c]) continue;
    const b = c * DEG;
    let k = 0, bz = 0;
    for (let d = 0; d < DEG; d++) {
      const p = w.pol[b + d];
      if (!p) continue;
      k++;
      const l = w.lab[b + d];
      // u = (0, l), so the out-of-plane part of D × u is D_x·u_y
      if (l) bz += p * DIRS[d][0] * l;
    }
    w.live[c] += k; w.bz[c] += bz;
  }
  w.ticks++;
};

/**
 * THE PANELS DRAW A DIFFERENCE, and they have to.
 *
 * A first version drew each channel against the vacuum's own far-field rate, and
 * rendering it showed why that is not enough: a source on this lattice emits along
 * its EXITS, so what dominates every frame is eight pencil beams that never spread
 * — and those beams are identical in the alike and the opposite run. The two
 * panels came out looking the same, which is exactly what the tests say they are
 * not.
 *
 * So each panel runs a second world at the same seed with ONLY THE LEFT SOURCE in
 * it, and draws the difference. The left body's own beams cancel, the vacuum
 * cancels, and what is left is what the partner did — which is the force, and is
 * the same subtraction `push` and `signlaw` make to get a number.
 */
const diff = (a: Float64Array, b: Float64Array) => {
  const o = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) o[i] = a[i] - b[i];
  return o;
};
/**
 * The scale is the CONTROL'S OWN AMBIENT RATE, not the panel's peak.
 *
 * Normalising each panel to its own maximum makes them incomparable and reads
 * backwards, which rendering showed: with two alike charges almost nothing
 * annihilates, so that panel's pull map has a tiny peak, and dividing by it turns
 * pure shot noise into a full-brightness speckle beside the opposite panel's real
 * band. Dividing both by the rate the vacuum runs at anyway makes the colour mean
 * the same thing in every panel — the fraction of the ambient rate the partner
 * added — which is what an excess over the vacuum is.
 */
const ambient = (w: World, f: Float64Array) => {
  let s = 0, n = 0;
  for (let x = 8; x < N - 8; x++) for (let y = 8; y < N - 8; y++) {
    const c = idx(x, y);
    if (w.src[c]) continue;
    if (Math.hypot(x - C, y - C) < VIEW + 12) continue;
    s += f[c]; n++;
  }
  return n ? s / n : 1;
};

const paintChannels = (w: World, ctl: World, sur: Surface, label: string, sep: number) => {
  const { ctx, width, height } = sur;
  const H = height - 26;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
  const half = width / 2;
  const s = Math.min(half / VN, H / VN);
  const ox = (half - VN * s) / 2, oy = 20 + (H - 20 - VN * s) / 2;
  const ox2 = half + (half - VN * s) / 2;

  const dLive = diff(w.live, ctl.live), dAnn = diff(w.ann, ctl.ann);
  /*
   * AND THE DIFFERENCE HAS A DC OFFSET THAT HAS TO COME OUT. Putting a second
   * source in the box changes the vacuum's own statistics everywhere, because
   * (G+M/2) fires only in a cell that is COMPLETELY empty and there are now fewer
   * of those. Rendering it showed up as a uniform blue wash over the whole frame
   * with the band buried in it. The far field is where nothing local is happening,
   * so its mean is that offset, and taking it out leaves the force.
   */
  const oL = ambient(w, dLive), oA = ambient(w, dAnn);
  for (let c = 0; c < CELLS; c++) { dLive[c] -= oL; dAnn[c] -= oA; }
  const sL = Math.abs(ambient(ctl, ctl.live)) || 1, sA = Math.abs(ambient(ctl, ctl.ann)) || 1;
  for (let x = C - VIEW; x <= C + VIEW; x++) for (let y = C - VIEW; y <= C + VIEW; y++) {
    const c = idx(x, y), px = x - C + VIEW, py = y - C + VIEW;
    if (w.src[c] || ctl.src[c]) continue;
    // LEFT: traffic the partner ADDED — the push channel
    const vL = dLive[c] / sL;
    if (Math.abs(vL) > 0.06) {
      ctx.globalAlpha = Math.min(0.92, Math.abs(vL) * 1.1);
      ctx.fillStyle = vL > 0 ? LIVE : MINUS;
      ctx.fillRect(ox + px * s, oy + py * s, Math.max(s, 1), Math.max(s, 1));
    }
    // RIGHT: annihilation the partner ADDED — the pull channel
    const vR = dAnn[c] / sA;
    if (Math.abs(vR) > 0.06) {
      ctx.globalAlpha = Math.min(0.92, Math.abs(vR) * 1.1);
      ctx.fillStyle = vR > 0 ? BAD : PLUS;
      ctx.fillRect(ox2 + px * s, oy + py * s, Math.max(s, 1), Math.max(s, 1));
    }
  }
  ctx.globalAlpha = 1;

  for (const base of [ox, ox2]) drawSources(w, ctx, base, oy, s, sep);

  ctx.font = "10px ui-monospace, monospace";
  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText("RAYS THE PARTNER ADDED — the push", half / 2, 14);
  ctx.fillText("SPACE THE PARTNER DESTROYED — the pull", half + half / 2, 14);
  ctx.textAlign = "left";
  ctx.fillText(label, 10, height - 10);
  ctx.textAlign = "right";
  ctx.fillText(`${w.ticks} ticks`, width - 10, height - 10);
  ctx.textAlign = "left";
};

const drawSources = (
  w: World, ctx: CanvasRenderingContext2D, base: number, oy: number, s: number, sep: number,
) => {
  if (w.kind === "charges") {
    for (const x0 of [C - sep / 2, C + sep / 2]) {
      const q = w.sig[idx(x0, C)];
      ctx.beginPath();
      ctx.arc(base + (x0 - C + VIEW) * s, oy + VIEW * s, 2 * s, 0, 7);
      ctx.fillStyle = q === 0 ? "#2a2e38" : q > 0 ? PLUS : MINUS;
      ctx.fill();
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2; ctx.stroke();
    }
  } else {
    for (const x0 of [C - sep / 2, C + sep / 2]) {
      let any = false;
      for (let y = 4; y < N - 4; y++) if (w.src[idx(x0, y)]) { any = true; break; }
      if (!any) continue;
      const wx = base + (x0 - C + VIEW) * s;
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(wx, oy);
      ctx.lineTo(wx, oy + VN * s);
      ctx.stroke();
      // an arrowhead saying which way the current runs
      const dir = w.drift[idx(x0, C)];
      const yc = oy + VIEW * s, dy = dir >= 0 ? -1 : 1;
      ctx.beginPath();
      ctx.moveTo(wx, yc + dy * 9);
      ctx.lineTo(wx - 4, yc);
      ctx.lineTo(wx + 4, yc);
      ctx.closePath();
      ctx.fillStyle = SEEN; ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
};

/**
 * THE MAGNETIC FIELD ITSELF — a charge at rest beside the same charge moving.
 *
 * B = Σσ(D × u) is out of the plane in two dimensions, so it is a signed scalar
 * and can simply be inked: one colour for each sense.
 *
 * A FIRST VERSION DREW A NEUTRAL WIRE AND CAME OUT A SOLID SLAB, which is not a
 * bug and is worth recording. An infinite line's "shell" in two dimensions is two
 * points, so a line source has NO falloff here — the block was right and had
 * nothing in it to see. A point source's shell is a circle, so a moving charge
 * gives 1/r and a shape, and it carries the stronger pair of results anyway: the
 * field is transverse to the motion and reverses across it, AND a charge at rest
 * has none at all — not a small one, exactly none, because every ray it emits
 * carries the label 0 and D × 0 is zero before any direction is consulted.
 */
const paintField = (w: World, ctl: World, sur: Surface, label: string, sep: number) => {
  const { ctx, width, height } = sur;
  const H = height - 26;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
  const half = width / 2;
  const s = Math.min(half / VN, H / VN);
  const oy = 20 + (H - 20 - VN * s) / 2;
  const ox = (half - VN * s) / 2, ox2 = half + (half - VN * s) / 2;

  let peak = 1e-12;
  for (let c = 0; c < CELLS; c++) if (!w.src[c]) peak = Math.max(peak, Math.abs(w.bz[c]));
  const draw = (world: World, base: number) => {
    for (let x = C - VIEW; x <= C + VIEW; x++) for (let y = C - VIEW; y <= C + VIEW; y++) {
      const c = idx(x, y), px = x - C + VIEW, py = y - C + VIEW;
      if (world.src[c]) continue;
      const m = Math.abs(world.bz[c]) / peak;
      if (m < 3e-3) continue;
      const a = 1 + Math.log10(m) / 2.2;             // 1 at the peak, 0 two decades below
      if (a <= 0.03) continue;
      ctx.globalAlpha = Math.min(0.95, a);
      ctx.fillStyle = world.bz[c] > 0 ? PLUS : MINUS;
      ctx.fillRect(base + px * s, oy + py * s, Math.max(s, 1), Math.max(s, 1));
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(base + VIEW * s, oy + VIEW * s, 2 * s, 0, 7);
    ctx.fillStyle = "#1b2430"; ctx.fill();
    ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2; ctx.stroke();
  };
  draw(ctl, ox);
  draw(w, ox2);

  // the arrow saying which way the moving one goes
  ctx.strokeStyle = SEEN; ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(ox2 + VIEW * s, oy + (VIEW + 9) * s);
  ctx.lineTo(ox2 + VIEW * s, oy + (VIEW - 9) * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ox2 + VIEW * s, oy + (VIEW - 12) * s);
  ctx.lineTo(ox2 + VIEW * s - 4, oy + (VIEW - 8) * s);
  ctx.lineTo(ox2 + VIEW * s + 4, oy + (VIEW - 8) * s);
  ctx.closePath();
  ctx.fillStyle = SEEN; ctx.fill();

  ctx.font = "10px ui-monospace, monospace";
  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText("AT REST — exactly nothing", half / 2, 14);
  ctx.fillText("MOVING — B = Σσ(D × u), read off the rays", half + half / 2, 14);
  ctx.textAlign = "left";
  ctx.fillText(label, 10, height - 10);
  ctx.textAlign = "right";
  ctx.fillText(`${w.ticks} ticks`, width - 10, height - 10);
  ctx.textAlign = "left";
};

const Panel = (
  { note, kind, a, b, sep = 10, height = 300, field = false }:
    {
      note: string; kind: Kind; a: number; b: number;
      sep?: number; height?: number; field?: boolean;
    },
) => <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>{note}</div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate deps={[note, kind, a, b]} paint={() => {
        const w = make(kind, a, b, sep);
        // for the channels, the same box at the same seed with ONLY the left source;
        // for the field, the same charge STANDING STILL, which is the stronger control
        const ctl = field ? make("still", a, 0, sep) : make(kind, a, 0, sep);
        let acc = 0;
        const label = kind === "charges"
          ? (a * b < 0 ? "opposite — (G+M/1) fires in the gap, and the gap empties"
            : "alike — (G+M/3) turns instead, and the gap stays full")
          : kind === "wires"
            ? (a * b < 0 ? "antiparallel — the facing rays are ALIKE, so they turn and survive"
              : "parallel — the facing rays are OPPOSITE, so they annihilate")
            : "B = Σσ(D × u), read off the rays — no curl taken, no potential differentiated";
        return {
          // the average IS the measurement, so it is built before the first frame
          start: () => {
            for (let i = 0; i < 260; i++) { tick(w, PEXP); tick(ctl, PEXP); }
          },
          frame: (sur: Surface, dt: number) => {
            acc += Math.min(dt, 0.05);
            while (acc > 1 / 20) { tick(w, PEXP); tick(ctl, PEXP); acc -= 1 / 20; }
            if (field) paintField(w, ctl, sur, label, sep);
            else paintChannels(w, ctl, sur, label, sep);
          },
        };
      }} />
    </div>
  </div>;

/** two alike charges: the gap stays full, and that traffic is the repulsion */
export const ChannelsAlike = ({ height = 300 }: { height?: number }) =>
  <Panel kind="charges" a={1} b={1} height={height}
    note="two alike charges — nothing annihilates between them, so the rays survive the crossing and land: THE PUSH" />;

/** two opposite charges: the gap empties, and that emptiness is the attraction */
export const ChannelsOpposite = ({ height = 300 }: { height?: number }) =>
  <Panel kind="charges" a={1} b={-1} height={height}
    note="two opposite charges — the same two rules, the other branch: the gap is destroyed rather than crossed" />;

/** parallel currents: the facing rays are opposite, so they annihilate — a pull */
export const WiresParallel = ({ height = 300 }: { height?: number }) =>
  <Panel kind="wires" a={1} b={1} height={height}
    note="two parallel currents — the rays that face each other carry OPPOSITE signs, so they annihilate: ATTRACT" />;

/** antiparallel currents: the facing rays are alike, so they turn — a push */
export const WiresAnti = ({ height = 300 }: { height?: number }) =>
  <Panel kind="wires" a={1} b={-1} height={height}
    note="two antiparallel currents — the facing rays carry the SAME sign, so they turn and survive: REPEL" />;

/** a charge at rest beside the same charge moving, and the field the label gives it */
export const AmpereField = ({ height = 320 }: { height?: number }) =>
  <Panel kind="moving" a={1} b={0} sep={0} height={height} field
    note="the same charge standing still and moving — B is transverse to the motion, reverses across it, and is EXACTLY nothing at rest" />;
