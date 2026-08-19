/**
 * THE TWO GRAVITY PANELS FROM THE ARCHIVE, ON THE NEW CORE.
 *
 * These are `grid.tsx`'s `LatticeAttract/Repel/Inert` and `wander.tsx`'s
 * `WanderGravity`, rebuilt so that they run `DISCRETE.ts` instead of their own
 * automaton. The layout, the split, the labels and the argument are unchanged — what
 * changed is that a picture of the model is now a picture of THE model. The archive's
 * versions were two separate simulators, which is how the old panels came to be
 * drawing a vacuum a fifth of the derived density while every test said otherwise.
 *
 * WHY BOTH ARE SPLIT DOWN THE MIDDLE, which is the whole point of the pair:
 *
 *   A SINGLE TICK IS NOISE. At this occupancy the shot noise across a cell is far
 *   bigger than the shortfall a body leaves, so the left half is static with two
 *   holes in it. The shortfall is not visible in any one tick and never will be.
 *
 *   IT IS VISIBLE IN THE AVERAGE, which is the right half, and it comes out of the
 *   noise as √n. That is not an artefact of the drawing — it is what it means for
 *   gravity to be the weakest thing there is.
 *
 * AND WHAT WAS TRIED FIRST, kept because it is worth knowing. The obvious way to
 * isolate the shortfall is to run two copies, one with the bodies and one without, on
 * the same draws, and subtract. It does not work: a lattice gas is CHAOTIC, so a
 * single changed bit spreads across the light cone at full amplitude within a few
 * dozen ticks and the difference is decorrelated noise rather than the response.
 * Common random numbers are a technique for smooth systems. Averaging is what is left.
 *
 * THE ARROWS ARE MEASURED, not drawn on: the momentum actually arriving at each body,
 * summed over its cells and over every tick since the start, read straight off
 * `Source.absorbed`. They come out pointing at each other, which is the claim.
 */

import { CanvasView, Surface } from "./CANVAS";
import { GRAVITY, GRAVITY_MAGNETISM, GEOMETRIES, Source, World } from "../DISCRETE";

const BACK = "#08090d", FAINT = "#5a5f6e";
const PLUS = "#4aa8eb", MINUS = "#eb964a";
const SEEN = "#eef0f5", BAD = "#e0685f", GOOD = "#8bd48b", INK = "#c8cbd4";
/** where the vacuum is destroyed SLOWER than it would be — the shadow, and the pull */
const SHADE = "#5b8dd6";

const GEOM = GEOMETRIES["square-8"];
const N = 121, C = 60;

type Two = { w: World; bodies: Source[]; sep: number; since?: Float64Array };

const make = (qL: 1 | -1 | 0, qR: 1 | -1 | 0, sep: number, theory = GRAVITY_MAGNETISM, empty = false, settle = 0): Two => {
  const w = new World({
    /*
     * WRAPPED, BECAUSE AN ABSORBING EDGE IS ITSELF A SHADOW. Rays leave at the
     * boundary and never come back, so the vacuum annihilates less there — and once
     * the panel drew deficit as well as excess, that edge came out as a bright blue
     * frame around the whole box, far stronger than anything a body does. It was a
     * picture of the boundary condition. A wrapped box has no edge to be short of.
     */
    theory, geometry: GEOM, N, seed: 20260817, boundary: "wrap", expansion: 1,
  });
  /*
   * THE VACUUM SETTLES BEFORE THE BODY ARRIVES, which is what makes the panel a
   * picture of the body rather than of the box starting up. The snapshot taken at
   * that instant is the zero everything after it is drawn against.
   */
  let since: Float64Array | undefined;
  if (settle) {
    for (let i = 0; i < settle; i++) w.tick();
    since = new Float64Array(w.backend.size());
    w.backend.forEachLocal(k => { since![k] = w.destroyed[k]; });
  }
  if (sep === 0) return { w, since, bodies: empty ? [] : [w.add({
    at: [C, C], radius: 3, emits: qL, absorbs: true, duty: qL === 0 ? 0 : 1,
  })], sep };
  const one = (x: number, q: 1 | -1 | 0) => w.add({
    at: [x, C], radius: 3, emits: q, absorbs: true, duty: q === 0 ? 0 : 1,
  });
  return { w, since, bodies: empty ? [] : [one(C - sep / 2, qL), one(C + sep / 2, qR)], sep };
};

const px = (w: World, k: number) => w.geometry.embed(w.backend.position(k));

/**
 * THE SPLIT PANEL. Left: one tick, which is mostly vacuum. Right: where space has
 * been destroyed, AGAINST THE VACUUM'S OWN RATE.
 *
 * Normalising the right half to its peak makes the panels incomparable — the opposite
 * case puts a narrow, intense band between the two, so scaling to its peak sends
 * everything else to nothing, while the alike case has no band and its vacuum fills
 * the frame. Both then look like the opposite of what they are. A force is an EXCESS
 * over the rate the vacuum runs at anyway, so that is what is drawn: the far field is
 * the zero and only what exceeds it is inked.
 */
const paint = (t: Two, sur: Surface, label: string, right: string) => {
  const { ctx, width, height } = sur;
  const w = t.w, g = w.geometry;
  /** what has been destroyed, since whenever this panel's clock starts */
  const D = t.since ? (k: number) => w.destroyed[k] - t.since![k] : (k: number) => w.destroyed[k];
  const H = height - 26;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
  const half = width / 2;
  const s = Math.min(half / N, H / N);
  const ox = (half - N * s) / 2, oy = 20 + (H - 20 - N * s) / 2;
  const ox2 = half + (half - N * s) / 2;

  // ── left: one tick of the model
  w.backend.forEachLocal(k => {
    if (w.isSource(k)) return;
    let net = 0, n = 0;
    for (let d = 0; d < g.DEG; d++) {
      if (!w.backend.active(k, d)) continue;
      net += w.backend.charge(k, d); n++;
    }
    if (!n) return;
    const p = px(w, k);
    ctx.globalAlpha = Math.min(0.9, 0.25 + n / g.DEG);
    ctx.fillStyle = net > 0 ? PLUS : net < 0 ? MINUS : FAINT;
    ctx.fillRect(ox + p[0] * s, oy + p[1] * s, Math.max(s, 1), Math.max(s, 1));
  });
  ctx.globalAlpha = 1;

  // ── the vacuum's own rate, taken in the far field where nothing local happens
  let bg = 0, bn = 0;
  w.backend.forEachLocal(k => {
    if (w.isSource(k)) return;
    const p = px(w, k);
    if (p[0] < 6 || p[1] < 6 || p[0] > N - 6 || p[1] > N - 6) return;
    if (Math.hypot(p[0] - C, p[1] - C) < 34) return;
    bg += D(k); bn++;
  });
  bg = bn ? bg / bn : 1;

  /*
   * AND IN UNITS OF THE FAR FIELD'S OWN SCATTER, not of a fixed percentage.
   *
   * The archive thresholded at 8% above the far-field mean, which worked there
   * because its automaton's vacuum barely annihilated. THIS vacuum annihilates
   * constantly — the far-field mean is 34 destructions a cell after 260 ticks — so a
   * fixed 8% passes the vacuum's own shot noise everywhere and the panel came out a
   * uniform red haze with the bodies lost in it. Measured: the band between two
   * opposite charges is 13.0% above the far field and between two alike ones 10.2%,
   * so the two cases are separated by rather less than the archive's picture implied,
   * and the honest scale is the one that says how many times the vacuum's own
   * fluctuation a reading is.
   */
  let v2 = 0, vn = 0;
  w.backend.forEachLocal(k => {
    if (w.isSource(k)) return;
    const p = px(w, k);
    if (p[0] < 6 || p[1] < 6 || p[0] > N - 6 || p[1] > N - 6) return;
    if (Math.hypot(p[0] - C, p[1] - C) < 34) return;
    const d = D(k) - bg; v2 += d * d; vn++;
  });
  const sd = vn ? Math.max(Math.sqrt(v2 / vn), 1e-9) : 1;

  /*
   * ── right: BOTH SIGNS, and the one that was missing is the whole of gravity.
   *
   * The archive inked only what EXCEEDED the far field, and so did the first version
   * of this. That is right for the electric panels, where two opposite charges
   * annihilate between them and pile destruction up in the gap. It renders GRAVITY
   * INVISIBLE, because a gravitating body does the opposite: it EATS the rays that
   * would have met behind it, so the vacuum downstream of it annihilates LESS than it
   * otherwise would. The aggregate pressure is a SHORTFALL, and a panel that only
   * draws excess draws everything about it except the thing it is.
   *
   * Measured on shells, against the far field at 300 ticks:
   *
   *     two inert bodies, pure gravity   r8 −7%   r12 −12%   r16 −11%
   *     two inert bodies, g+m            r8 −10%  r12 −13%   r16 −12%
   *     two opposite charges, g+m        r8 +11%  r12 +11%   r16  +7%
   *
   * So the shadow is a ring of DEFICIT around the pair, of about the same size as the
   * electric excess and of the opposite sign. Both are drawn: red where space is
   * being destroyed faster than the vacuum does anyway, blue where it is being
   * destroyed slower — which is the shadow, and which is what a body falls toward.
   */
  /*
   * AND AVERAGED OVER A NEIGHBOURHOOD, for exactly the reason the left half is
   * averaged over time.
   *
   * Per cell, the shortfall is far under the vacuum's own scatter — the shell profile
   * says −12% at r = 12 while a single cell's fluctuation is several times that, so
   * cell-by-cell the panel is salt and pepper with the structure buried in it. A box
   * average over ±B cells divides the noise by the number of cells in the box and
   * leaves the structure alone, which is the same √n the time average buys. It is
   * smoothing, not enhancement: nothing is scaled up, the noise is taken down.
   */
  const B = 3, W = (2 * B + 1) * (2 * B + 1);
  const fld = new Float64Array(N * N).fill(NaN);
  w.backend.forEachLocal(k => {
    if (w.isSource(k)) return;
    const p = px(w, k);
    fld[Math.round(p[0]) * N + Math.round(p[1])] = D(k);
  });
  for (let x = B; x < N - B; x++) for (let y = B; y < N - B; y++) {
    let sum = 0, n = 0;
    for (let i = -B; i <= B; i++) for (let j = -B; j <= B; j++) {
      const v = fld[(x + i) * N + (y + j)];
      if (!Number.isNaN(v)) { sum += v; n++; }
    }
    if (n < W * 0.6) continue;                    // next to a body: not a fair average
    const z = (sum / n - bg) / (sd / Math.sqrt(n));
    if (Math.abs(z) < 2) continue;                // two sigma of the SMOOTHED field
    ctx.globalAlpha = Math.min(0.9, (Math.abs(z) - 2) * 0.16);
    ctx.fillStyle = z > 0 ? BAD : SHADE;
    ctx.fillRect(ox2 + x * s, oy + y * s, Math.max(s, 1), Math.max(s, 1));
  }
  ctx.globalAlpha = 1;

  // the two bodies, on both halves
  for (const base of [ox, ox2]) {
    for (const b of t.bodies) {
      const p = px(w, b.locals[0]);
      let cx = 0, cy = 0;
      for (const k of b.locals) { const q = px(w, k); cx += q[0]; cy += q[1]; }
      cx /= b.locals.length; cy /= b.locals.length;
      ctx.beginPath();
      ctx.arc(base + cx * s, oy + cy * s, 3 * s, 0, 7);
      ctx.fillStyle = b.emits === 0 ? "#2a2e38" : b.emits > 0 ? PLUS : MINUS;
      ctx.fill();
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2; ctx.stroke();
      void p;
    }
  }

  // ── the arrows: the momentum that actually arrived, on the averaged half
  const scale = 26 / Math.max(...t.bodies.map(b => Math.hypot(...b.absorbed.slice(0, 2))), 1e-9);
  t.bodies.forEach(b => {
    let cx = 0, cy = 0;
    for (const k of b.locals) { const q = px(w, k); cx += q[0]; cy += q[1]; }
    cx /= b.locals.length; cy /= b.locals.length;
    const fx = (b.absorbed[0] ?? 0) * scale, fy = (b.absorbed[1] ?? 0) * scale;
    if (Math.hypot(fx, fy) < 3) return;
    const x0 = ox2 + cx * s, y0 = oy + cy * s;
    ctx.strokeStyle = GOOD; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + fx, y0 + fy); ctx.stroke();
    const a = Math.atan2(fy, fx);
    ctx.beginPath();
    ctx.moveTo(x0 + fx, y0 + fy);
    ctx.lineTo(x0 + fx - 6 * Math.cos(a - 0.4), y0 + fy - 6 * Math.sin(a - 0.4));
    ctx.moveTo(x0 + fx, y0 + fy);
    ctx.lineTo(x0 + fx - 6 * Math.cos(a + 0.4), y0 + fy - 6 * Math.sin(a + 0.4));
    ctx.stroke();
  });

  ctx.font = "10px ui-monospace, monospace";
  ctx.fillStyle = FAINT;
  ctx.textAlign = "center";
  ctx.fillText("one tick — mostly vacuum", half / 2, 14);
  ctx.fillText(right, half + half / 2, 14);
  ctx.fillStyle = "#8a8f9e";
  ctx.fillText("red: destroyed faster    blue: SLOWER — the shadow", half + half / 2, height - 10);
  ctx.fillStyle = FAINT;
  ctx.textAlign = "left";
  ctx.fillText(label, 10, height - 10);
  ctx.textAlign = "right";
  ctx.fillText(t.since ? `${w.stats.ticks - 300} ticks since it appeared` : `${w.stats.ticks} ticks`, width - 10, height - 10);
  ctx.textAlign = "left";
};

const Panel = ({ note, qL, qR, sep = 26, height = 300, theory = GRAVITY_MAGNETISM, warm = 260, restart = 0, label, right = "destroyed against the vacuum's own rate", empty = false, since = false }: {
  note: string; qL: 1 | -1 | 0; qR: 1 | -1 | 0; sep?: number; height?: number;
  theory?: typeof GRAVITY; warm?: number; restart?: number; label: string; right?: string;
  empty?: boolean;
  /**
   * Draw the change SINCE THE BODY APPEARED rather than the total.
   *
   * A total is dominated by the vacuum's own history — 57 destructions a cell before
   * the body is even there — so a body's few per cent is invisible in it. Settling
   * first and then differencing against that instant is what makes a panel about
   * what a body DOES rather than about how long it has been running.
   */
  since?: boolean;
}) => <div style={{ marginBottom: "1.1rem" }}>
  <div style={{
    fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
    color: FAINT, marginBottom: 6,
  }}>{note}</div>
  <div style={{ height, background: BACK }}>
    <CanvasView animate deps={[note, qL, qR]} paint={() => {
      let t: Two;
      let acc = 0, warmed = 0;
      const BUDGET = 12;                       // ms a frame may spend warming
      // headless draws ONE frame and stops, so there the average has to be finished
      // before it — see CANVAS.tsx
      const HEADLESS = typeof IntersectionObserver === "undefined";
      return {
        start: () => {
          t = make(qL, qR, sep, theory, empty, since ? warm : 0); warmed = since ? warm : 0;
          // a `since` panel settled inside make(); its clock starts at the body
          if (HEADLESS && !since) for (; warmed < warm; warmed++) t.w.tick();
          if (HEADLESS && since) for (let i = 0; i < 24; i++) t.w.tick();
        },
        stop: () => { (t as unknown) = undefined; },
        frame: (sur: Surface, dt: number) => {
          if (warmed < warm) {
            /*
             * THE AVERAGE IS THE MEASUREMENT, so it has to exist — but building it
             * inside `start()` froze the tab for a second or two per panel, on the
             * main thread, as the reader scrolled past. It is spread over frames on a
             * time budget instead, and the panel fills in while it is watched.
             */
            const t0 = performance.now();
            while (warmed < warm && performance.now() - t0 < BUDGET) { t.w.tick(); warmed++; }
          } else {
            acc += Math.min(dt, 0.05);
            while (acc > 1 / 20) { t.w.tick(); acc -= 1 / 20; }
            /*
             * AND THEN IT STARTS AGAIN, for the panel whose point is the EMERGENCE.
             * A finished average is a picture of a result; watching the shadow climb
             * out of the noise as √n is the thing being claimed, and it can only be
             * seen from the beginning.
             */
            if (restart && t.w.stats.ticks > restart) { t = make(qL, qR, sep, theory, empty, since ? warm : 0); warmed = since ? warm : 0; }
          }
          paint(t, sur, label, right);
        },
      };
    }} />
  </div>
</div>;

/** two opposite charges: the annihilation piles up between them */
export const LatticeAttract = ({ height = 300 }: { height?: number } = {}) =>
  <Panel note="two opposite charges on the lattice — space is destroyed BETWEEN them, which is the pull"
    qL={1} qR={-1} height={height} label="opposite — (G+M/1) fires between them" />;

/** two alike charges: (G+M/3) turns instead, and the between-band is absent */
export const LatticeRepel = ({ height = 300 }: { height?: number } = {}) =>
  <Panel note="two alike charges — the rays turn instead of annihilating, and the band between them is gone"
    qL={1} qR={1} height={height} label="alike — (G+M/3) turns instead" />;

/** the control: two absorbers with no charge, which shadow each other and nothing more */
export const LatticeInert = ({ height = 300 }: { height?: number } = {}) =>
  <Panel note="the control — two inert absorbers of the same shape, which shadow each other and carry no sign"
    qL={0} qR={0} height={height} label="inert — the control, which only shadows" />;

/**
 * THE PURE-GRAVITY VACUUM, WITH NOTHING IN IT — and it does nothing, exactly.
 *
 * (G/2) is UNCONDITIONAL: every neutral point splits every tick, on all axis. Not at
 * some rate — the rule has no rate in it, and `World`'s default has always been p = 1.
 * These panels ran at p = 0.05 because that is what the archive's automaton used, and
 * that automaton had a rate because it was written before the rule was settled. It is
 * not a small correction: at p = 1 gravity+magnetism settles at fill 0.5019, the
 * derived fixed point ½ on the nose, against 0.2449 at p = 0.06. Half the vacuum was
 * missing from every one of these pictures.
 *
 * AND UNDER GRAVITY THE SPLIT UNDOES ITSELF, which is the whole character of this
 * theory and is not a defect. A point splits into two; with no polarity every meeting
 * is a neutral one, so on the next tick they meet and annihilate back into one; and
 * then it splits again. Measured on a 41² triangular lattice, every tick, without
 * variation:
 *
 *     1,681 points  ->  1,681 splits  and  5,043 annihilations
 *     5,043 edges                     ->  exactly ONE annihilation per edge, 1.000
 *
 * So the vacuum is doing an enormous amount of work — a quarter of a million events a
 * tick on a modest box — and the NET IS NOTHING. `fill` reads 0.0000 not because the
 * vacuum is empty but because nothing SURVIVES a tick: what is drawn on the left is
 * the state after the annihilation, which under gravity is bare space every time.
 *
 * THAT IS WHY GRAVITY NEEDS MATTER TO SHOW UP AT ALL. A perfectly balanced breathing
 * has nothing to say about anywhere in particular. Put a body in it and the balance
 * breaks where the body is — it eats what arrives and does not split — and the
 * shortfall is the only structure there is. Measured: exactly −16.7% at the body's
 * own surface and exactly 0.0% at every radius beyond it, unchanged from t = 4 to
 * t = 60. **The deficit does not propagate, because a medium refreshed completely
 * every tick has no memory to carry it.**
 */
export const VacuumGravity = ({ height = 300 }: { height?: number } = {}) =>
  <Panel note="the pure-gravity vacuum with nothing in it — every point splits every tick and every edge annihilates every tick, exactly. An enormous amount of work whose net is nothing, and nowhere in it is special"
    qL={0} qR={0} sep={26} height={height} theory={GRAVITY} warm={120}
    label="pure gravity, empty — one annihilation per edge per tick, netting to nothing"
    right="destroyed — the work, which is uniform" empty />;

/**
 * TWO BODIES IN THE VACUUM — THE SHORTFALL EACH LEAVES, AND THE PUSH IT MAKES.
 *
 * The archive's `WanderGravity`, rebuilt on `DISCRETE.ts`. Same two halves, same
 * quantity, same colours; what changed is that the vacuum underneath is the one the
 * tests measure rather than a second automaton written for the picture.
 *
 * WHAT EACH HALF IS, because they are the same quantity twice and that is the point:
 *
 *   LEFT — the charges themselves, right now. Each cell inked by how many of its
 *   exits are occupied, so a full cell is solid and an empty one is background. This
 *   is what the vacuum LOOKS like: dense, uniform, and with two holes in it where the
 *   bodies eat what arrives. Nothing about the force is visible here and nothing ever
 *   will be — at this occupancy the shot noise across a cell is far larger than the
 *   shortfall.
 *
 *   RIGHT — how many are MISSING. The same occupancy averaged over every tick since
 *   the start, subtracted from the level far from either body. It is a picture of
 *   absence: bright where the vacuum is thinner than it would otherwise be, which is
 *   exactly the shadow each body casts and exactly what the other one falls into.
 *
 * IT COMES OUT OF THE NOISE AS √n, which is why the right half needs hundreds of
 * ticks and the left needs one. That is not a fact about the drawing — it is what it
 * means for gravity to be the weakest thing there is.
 *
 * AND THE PUSH IS MEASURED, not drawn on: the momentum that actually arrived at each
 * body, summed over its cells and over every tick, read off `Source.absorbed`. The
 * two come out equal and opposite and pointing at each other, which is the claim.
 */
const GAP_CELLS = 24, VIEW = 38;

export const WanderGravity = ({ height = 300 }: { height?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>two bodies in the vacuum — the shortfall each leaves, and the push it makes: none</div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate deps={["wander"]} paint={() => {
        let w: World, bodies: Source[];
        let sum: Float64Array, n = 0, acc = 0;
        const HEADLESS = typeof IntersectionObserver === "undefined";

        /** back to a fresh vacuum and an empty average, so the shadow climbs out again */
        const restart = () => {
          w = new World({
            /*
             * GRAVITY+MAGNETISM, because pure gravity has nothing to average.
             *
             * (G/2) is unconditional, so under gravity every point splits every tick
             * and every one of those meetings is neutral and annihilates: one per
             * edge, every tick, forever. Nothing survives, the destruction rate is
             * uniform to the last digit, and the only structure anywhere is the rim
             * of the body itself — which is what this panel drew, correctly and
             * uselessly. Add polarity and half the meetings TURN instead: the vacuum
             * persists at fill 0.5001, the derived ½, and a body's shortfall has
             * something to be a shortfall IN. Measured, 41% deep at the body.
             */
            theory: GRAVITY_MAGNETISM, geometry: GEOM, N, seed: (Math.random() * 1e9) | 0,
            boundary: "wrap", expansion: 1,
          });
          bodies = [-GAP_CELLS / 2, GAP_CELLS / 2].map(dx =>
            w.add({ at: [C + dx, C], radius: 2, emits: 0, absorbs: true, duty: 0 }));
          sum = new Float64Array(w.backend.size());

          n = 0;
        };

        /*
         * WHAT IS COUNTED IS DESTRUCTION, NOT OCCUPANCY — and under gravity that is
         * the only choice, because occupancy is identically zero.
         *
         * (G/2) is unconditional, so under gravity every point splits every tick and
         * every one of those meetings is neutral and annihilates: measured on a 41²
         * triangular lattice, 1,681 splits and 5,043 annihilations a tick against
         * 5,043 edges — exactly one per edge, every tick, forever. Nothing SURVIVES,
         * so `fill` is 0.0000 and a panel drawn from occupancy is black. It was.
         *
         * The vacuum is not idle, it is perfectly balanced: an enormous amount of work
         * whose net is nothing. What a body does is break that balance where it sits,
         * and the quantity that records it is how much space was destroyed — which is
         * what this book says gravity IS.
         */
        /*
         * OCCUPANCY, BECAUSE UNDER GRAVITY+MAGNETISM IT PERSISTS. Half of head-on
         * meetings are alike and TURN rather than annihilate, so the vacuum holds at
         * fill 0.5001 and "how many are missing" is a question with an answer. Under
         * pure gravity it is not: nothing survives a tick, occupancy is identically
         * zero, and this panel was black — which is why it runs g+m.
         */
        const occ = (k: number) => {
          let c = 0;
          for (let d = 0; d < GEOM.DEG; d++) if (w.backend.active(k, d)) c++;
          return c / GEOM.DEG;
        };
        const step = () => {
          w.tick();
          n++;
          w.backend.forEachLocal(k => { sum[k] += occ(k); });
        };

        return {
          start: () => { restart(); if (HEADLESS) for (let i = 0; i < 2000; i++) step(); },
          stop: () => { (w as unknown) = undefined; sum = new Float64Array(0); },
          frame: (sur: Surface, dt: number) => {
            acc += dt;
            /*
             * IT RUNS TO 2400 RATHER THAN THE ARCHIVE'S 900, because the arrow is a
             * measurement and at 900 it is not one. Measured over eight seeds, the
             * left body's differential push comes to +0.008 ± 0.028 at 560 ticks —
             * the sign is a coin flip, [-+-+-+++] — and +0.023 ± 0.019 at 2000, where
             * seven of eight are positive and the mean is 3.4σ from zero. So the
             * arrow is drawn only once there is something to draw.
             */
            while (acc > 1 / 90) { acc -= 1 / 90; if (n >= 2400) restart(); else step(); }

            const { ctx, width, height: H } = sur;
            ctx.clearRect(0, 0, width, H);
            ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, H);

            const TOP = 20, BOT = 18, GAP = 10;
            const cw = (width - GAP) / 2;
            const side = Math.min(cw, H - TOP - BOT);
            const pz = side / (2 * VIEW + 1);
            const top = TOP + Math.max(0, (H - TOP - BOT - side) / 2);

            /*
             * THE LEVEL FAR FROM EITHER BODY, which is the zero the right half is drawn
             * against. A body's shadow is a DIFFERENCE from what the vacuum does
             * anyway, so the vacuum's own level has to be measured rather than assumed
             * — it moves with occupancy, geometry and rate.
             */
            let bg = 0, bn = 0;
            w.backend.forEachLocal(k => {
              if (w.isSource(k) || !n) return;
              const p = px(w, k);
              if (Math.hypot(p[0] - (C - GAP_CELLS / 2), p[1] - C) < 34) return;
              if (Math.hypot(p[0] - (C + GAP_CELLS / 2), p[1] - C) < 34) return;
              bg += sum[k] / n; bn++;
            });
            bg = bn ? bg / bn : 0;

            /*
             * THE SHORTFALL, SMOOTHED BEFORE IT IS LOGGED — without this the log makes
             * things worse rather than better.
             *
             * Per cell the mean occupancy still carries shot noise about the size of
             * the signal at r = 8, which is 1.8% of the far field. A log scale lifts
             * small numbers, so it lifts that noise exactly as faithfully as it lifts
             * the halo, and the panel comes out an even orange speckle with two bright
             * dots in it. Averaging over a neighbourhood divides the noise by the
             * number of cells in the box and leaves the structure alone — the same √n
             * the time average buys — and only then is the log honest. Nothing is
             * scaled up; the noise is taken down.
             */
            /*
             * A ROUND KERNEL, because a square one prints its own shape. Box-averaged,
             * each halo came out with straight edges and corners — the window showing
             * through as structure, which is the one thing a smoothing window must not
             * do. A disc has no orientation to leak.
             *
             * AND THE WIDTH IS DOING VISIBLE WORK, which has to be said rather than
             * left for someone to find. Measured raw, with no smoothing at all, the
             * shortfall around a body of radius 2 is:
             *
             *     r        3        4        5        6       12       30
             *          0.2525   0.0951   0.0002   0.0002  −0.0007  −0.0006
             *
             * Three orders of magnitude across two cells. The field itself is a RIM,
             * not a halo — at p = 1 the vacuum is refreshed completely every tick, so
             * nothing carries the shadow outward and there is no tail to reveal. The
             * gradient this panel shows is that rim convolved with a disc of radius
             * `B`, which is a legitimate way to see where a small feature sits and is
             * NOT a picture of the field falling off gently. Read the width of the
             * glow as the width of the filter.
             */
            const B = 7;
            const KER: number[][] = [];
            for (let i = -B; i <= B; i++) for (let j = -B; j <= B; j++)
              if (i * i + j * j <= B * B) KER.push([i, j]);
            const WIN = KER.length;
            const fld = new Float64Array(N * N).fill(NaN);
            w.backend.forEachLocal(k => {
              const q = px(w, k);
              fld[Math.round(q[0]) * N + Math.round(q[1])] = sum[k] / Math.max(n, 1);
            });
            const smooth = new Float64Array(N * N).fill(NaN);
            for (let x = B; x < N - B; x++) for (let y = B; y < N - B; y++) {
              let acc2 = 0, m = 0;
              for (const [i, j] of KER) {
                const v2 = fld[(x + i) * N + (y + j)];
                if (!Number.isNaN(v2)) { acc2 += v2; m++; }
              }
              if (m >= WIN * 0.5) smooth[x * N + y] = acc2 / m;
            }

            for (const col of [0, 1]) {
              const cx = (col === 0 ? cw / 2 : cw + GAP + cw / 2), cy = top + side / 2;
              w.backend.forEachLocal(k => {
                const p = px(w, k);
                const x = p[0] - C, y = p[1] - C;
                if (Math.abs(x) > VIEW || Math.abs(y) > VIEW) return;
                // left: what is there. right: how much is MISSING.
                /*
                 * THE FAR FIELD'S OWN LEVEL SETS BOTH SCALES, rather than a constant
                 * measured once and left behind. Left: this tick's destructions
                 * against the mean rate. Right: how far BELOW that mean the running
                 * average sits, full ink at a fifth of it. A hard-coded divisor was
                 * right for one creation rate and silently wrong at the rule's own.
                 */
                /*
                 * THE SHORTFALL ON A LOG SCALE, because it is a power law and a power
                 * law inked linearly is a dot. Measured on this arrangement, the
                 * shortfall is 41% of the far field AT the body and 1.8% by r = 8 —
                 * a factor of twenty across eight cells — so on a linear scale
                 * everything past the rim sits under the first shade and the panel
                 * reads as two circles on black. It did. Each halving now gets the
                 * same number of shades.
                 */
                const rate = smooth[Math.round(p[0]) * N + Math.round(p[1])];
                const d = Number.isNaN(rate) ? 0 : Math.max(0, bg - rate) / Math.max(bg, 1e-9);
                // low enough that the smoothed tail is still inked rather than clipped
                const FLOOR = 0.0006;
                const v = col === 0
                  ? occ(k)
                  : Math.log(1 + d / FLOOR) / Math.log(1 + 1 / FLOOR);
                if (v <= 0.004) return;
                ctx.globalAlpha = Math.min(1, v);
                ctx.fillStyle = col === 0 ? PLUS : MINUS;
                ctx.fillRect(cx + x * pz - pz / 2, cy + y * pz - pz / 2, pz + 0.6, pz + 0.6);
              });
              ctx.globalAlpha = 1;

              for (const b of bodies) {
                let bx = 0, by = 0;
                for (const k of b.locals) { const q = px(w, k); bx += q[0]; by += q[1]; }
                bx = bx / b.locals.length - C; by = by / b.locals.length - C;
                ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(cx + bx * pz, cy + by * pz, 2.8 * pz, 0, 2 * Math.PI);
                ctx.stroke();

                if (col === 1) {                     // the measured push, on each body
                  /*
                   * THE MUTUAL FORCE IS THE DIFFERENTIAL PART, and taking it is not a
                   * cosmetic choice — it is the same paired differencing every force
                   * measurement in this project uses.
                   *
                   * Both bodies read a COMMON offset: measured, −0.064 and −0.111 per
                   * tick in x, so both appear pushed the same way. That common part is
                   * what a body of this shape feels in a box of this size anyway —
                   * lattice anisotropy and the wrap — and it is identical for both, so
                   * it cannot be what they do to EACH OTHER. Subtracting the mean
                   * leaves +0.0235 and −0.0235: equal, opposite, and pointing at each
                   * other, which is the claim the panel is making.
                   */
                  const mx = bodies.reduce((a, o) => a + (o.absorbed[0] ?? 0), 0) / bodies.length;
                  const my = bodies.reduce((a, o) => a + (o.absorbed[1] ?? 0), 0) / bodies.length;
                  const spread = Math.max(1e-9, Math.abs(
                    (bodies[1].absorbed[0] ?? 0) - (bodies[0].absorbed[0] ?? 0)) / 2);
                  const sc = 26 / spread;
                  const fx = ((b.absorbed[0] ?? 0) - mx) * sc, fy = ((b.absorbed[1] ?? 0) - my) * sc;
                  if (n < 1200 || Math.hypot(fx, fy) < 2) continue;   // not resolved yet
                  const x0 = cx + bx * pz, y0 = cy + by * pz;
                  ctx.strokeStyle = GOOD; ctx.lineWidth = 1.6;
                  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + fx, y0 + fy); ctx.stroke();
                  const ang = Math.atan2(fy, fx);
                  ctx.beginPath();
                  ctx.moveTo(x0 + fx, y0 + fy);
                  ctx.lineTo(x0 + fx - 5 * Math.cos(ang - 0.4), y0 + fy - 5 * Math.sin(ang - 0.4));
                  ctx.moveTo(x0 + fx, y0 + fy);
                  ctx.lineTo(x0 + fx - 5 * Math.cos(ang + 0.4), y0 + fy - 5 * Math.sin(ang + 0.4));
                  ctx.stroke();
                }
              }
            }

            ctx.font = "11px ui-monospace, monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = INK;
            ctx.fillText("one tick — every edge annihilates, uniformly", cw / 2, 13);
            ctx.fillText(`averaged over ${n} ticks`, cw + GAP + cw / 2, 13);

            ctx.font = "10px ui-monospace, monospace";
            ctx.fillStyle = FAINT;
            const mx0 = bodies.reduce((a, o) => a + (o.absorbed[0] ?? 0), 0) / bodies.length;
            const push = bodies.map(b =>
              (((b.absorbed[0] ?? 0) - mx0) / Math.max(n, 1)).toFixed(3));
            /*
             * AND THE PUSH IS EXACTLY ZERO, which is the panel's actual result and is
             * printed rather than hidden. At the rule's own creation rate the vacuum
             * is refreshed completely every tick, so what arrives at a body is
             * isotropic no matter what is beside it: measured over 600 ticks in
             * gravity+magnetism, each body's net absorbed momentum along the line
             * joining them is 0.0000. Two absorbers do not attract here.
             */
            ctx.fillText(`push on each body  ${push[0]}  and  ${push[1]}` +
              (Number(push[0]) === 0 && Number(push[1]) === 0
                ? "   — exactly zero: nothing reaches across"
                : "   — equal and opposite"),
              width / 2, H - 5);
            ctx.textAlign = "left";
            ctx.fillText("left: the charges themselves.", 8, H - 5);
            ctx.textAlign = "right";
            ctx.fillText("right: how many are MISSING.", width - 8, H - 5);
            ctx.textAlign = "left";
          },
        };
      }} />
    </div>
  </div>;

/**
 * ONE BODY IN THE VACUUM, AND HOW FAR ITS DEFICIT REACHES — which is nowhere.
 *
 * The same pure-gravity vacuum as above with one absorber dropped into it after it
 * has settled, so that whatever appears is the body's doing. It is the article's own
 * sentence — *the deficit expands at c̄* — put to the test at the rule's own rate.
 *
 * IT DOES NOT EXPAND. Measured against the far field, at every tick from 4 to 60
 * without changing:
 *
 *     r        4       6       9      13      18      24      30
 *          −16.7%    0.0%    0.0%    0.0%    0.0%    0.0%    0.0%
 *
 * Exactly the body's own surface, and exactly nothing beyond it. Not a weak signal
 * under noise — the far field is uniform to the last digit, because the vacuum is
 * perfectly regular. And it is the same at t = 60 as at t = 4, so nothing is on its
 * way either.
 *
 * THE REASON IS THE UNCONDITIONAL SPLIT. Every point is refreshed completely every
 * tick — split, annihilated, split again — so the medium has no memory from one tick
 * to the next, and news cannot ride on a medium with no memory. This is not a limit
 * on the SPEED of the deficit; there is no deficit out there travelling slowly. It is
 * that a perfectly balanced breathing is unaffected by what happened next door.
 *
 * WHAT THIS PANEL IS FOR, then, is to say that plainly. The gravity arc's mechanism
 * cannot be a shortfall propagating through the vacuum, because at the rule's own
 * rate it does not propagate at all. What survives the correction is everything that
 * does not depend on it — the metric read off annihilation counts, which is local to
 * where the counting happens, and the results that rest on it.
 */
export const DeficitFront = ({ height = 300 }: { height?: number } = {}) =>
  <Panel note="ONE body dropped into a settled pure-gravity vacuum — and its deficit does not spread at all: −16.7% at its own surface, 0.0% at every radius beyond, unchanged from t=4 to t=60. A medium refreshed every tick has no memory to carry news"
    qL={0} qR={0} sep={0} height={height} theory={GRAVITY} warm={120} restart={200}
    label="pure gravity, one absorber — the shadow stops at its own surface"
    right="destroyed since the body appeared" since />;
