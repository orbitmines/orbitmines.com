/**
 * THE DEFICIT, WITH THE STATIC TAKEN OUT — and it propagates at c̄ where you can see
 * it do it.
 *
 * Every other gravity panel in this arc runs the stochastic vacuum, where creation
 * fires on a coin and the shortfall has to be dug out of shot noise by averaging over
 * hundreds of ticks. That is the honest picture of the model and it is nearly
 * unreadable: at one tick the force is invisible, and at two thousand the arrow is
 * still only three sigma.
 *
 * This is the same mechanism with the randomness removed and NOTHING ELSE removed.
 * The rays are still whole rays — integer counts on the lattice, one thing or no
 * things — and a point still hands on exactly what it received. What is gone is the
 * die: a point holding k rays sends them down k consecutive exits and advances its
 * phase by k, which spreads them evenly over a few ticks without anything being
 * drawn at random. That is `tests/sphere.ts`'s rule, and it is the DETERMINISTIC
 * limit of (G/1) and (G/2) rather than a different model.
 *
 * WHY THE DIE IS WHAT HAD TO GO, and not the discreteness. Measured, the stochastic
 * vacuum's shortfall dies inside four cells whatever else is changed: at creation
 * rates from 0.20 down to 0.002 the ray lifetime rises from 1.6 ticks to 19.1 and the
 * deficit STILL vanishes by r ≈ 6–9. It is not lifetime that limits the reach, it is
 * that (G/2) is a local ISOTROPIC source — every tick it injects fresh rays that
 * carry no news of the body, so the shadow is diluted as fast as it spreads. Take the
 * creation away and every ray traces back to the initial condition, so every ray
 * carries the shadow.
 *
 * WHAT IT SHOWS, measured on this arrangement:
 *
 *     t        r4      r8     r14     r20     r28
 *       8     0.0%   −4.4%   −8.1%   −0.1%    0.0%
 *      20    −1.6%  −11.5%  −10.9%   −1.0%   −0.2%
 *      60   −10.9%  −20.2%  −20.1%   −5.3%   −0.1%
 *     200   −36.1%  −40.9%  −33.3%  −17.6%   −3.0%
 *
 * The front moves out about one cell a tick, which is c̄, and it keeps going — against
 * the stochastic vacuum's shortfall, which never leaves the body. The difference
 * between the two panels is the whole cost of the noise.
 *
 * AND IT IS DRAWN ON A LOG SCALE, because the falloff is a power law. A 1/r² field
 * inked linearly is a white dot and a black field: the body saturates and everything
 * past a few cells is under the first quantisation step, so the shell structure the
 * panel is about cannot be seen. On a log scale each halving is the same number of
 * shades and the profile above reads as the near-straight line it is.
 */

import { CanvasView, Surface } from "./CANVAS";

const BACK = "#08090d", FAINT = "#5a5f6e", INK = "#c8cbd4";
const SEEN = "#eef0f5", RAIN = "#4aa8eb", MISS = "#eb964a", GOOD = "#8bd48b";

const N = 121, C = 60, DEG = 8, GAP = 24, R = 2, VIEW = 46;
const D: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];
const at = (x: number, y: number) => ((y + N) % N) * N + ((x + N) % N);

/**
 * INTEGER RAY COUNTS, NOT A DENSITY. `q[c]` is how many rays that point is holding —
 * a whole number — and `phase` is which exit the next one goes out of.
 *
 * A first version of this panel carried a Float64 and handed each neighbour `q/DEG`.
 * That is the CONTINUUM limit: it works, it is smooth, and it is not this model. A
 * ray here is one thing or no things; there is no third of a ray on this lattice, and
 * a panel in the discrete arc that quietly uses one is drawing a different theory.
 *
 * The phase is what makes it discrete AND deterministic at once. A point holding k
 * rays sends them down k CONSECUTIVE exits starting from where it left off, then
 * advances by k. Over a few ticks that spreads them evenly in every direction without
 * a die ever being thrown — which is the whole trick, because randomness is exactly
 * what the stochastic panels have to average away.
 */
type Rain = { q: Int32Array; nq: Int32Array; ph: Uint8Array; body: Uint8Array; F: number[][]; t: number };

const born = (): Rain => {
  const body = new Uint8Array(N * N);
  [-GAP / 2, GAP / 2].forEach((dx, i) => {
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++)
      if (x * x + y * y <= R * R) body[at(C + dx + x, C + y)] = i + 1;
  });
  return {
    // one ray out of every exit of every point: the full lattice, and a whole number
    q: new Int32Array(N * N).fill(DEG), nq: new Int32Array(N * N),
    ph: new Uint8Array(N * N),
    body, F: [[0, 0], [0, 0]], t: 0,
  };
};

/**
 * ONE TICK. Everything a point holds is handed on, one share down each exit; whatever
 * lands on a body is destroyed there and counted, which is the force.
 */
const step = (w: Rain) => {
  w.nq.fill(0);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = at(x, y);
    if (w.body[c]) continue;
    const k = w.q[c];
    if (!k) continue;
    const p = w.ph[c];
    for (let j = 0; j < k; j++) {
      const e = (p + j) % DEG;
      const to = at(x + D[e][0], y + D[e][1]);
      w.nq[to]++;
      const hit = w.body[to];
      // a ray destroyed at a body was going somewhere: that is the momentum it hands over
      if (hit) { w.F[hit - 1][0] += D[e][0]; w.F[hit - 1][1] += D[e][1]; }
    }
    w.ph[c] = (p + k) % DEG;
  }
  for (let c = 0; c < N * N; c++) if (w.body[c]) w.nq[c] = 0;
  const t = w.q; w.q = w.nq; w.nq = t;
  w.t++;
};

export const DeficitRain = ({ height = 320, at: startAt = 0 }: { height?: number; at?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>
      the same mechanism with the static taken out — the deterministic limit of (G/1)
      and (G/2), where the deficit is exact, propagates at c̄, and needs no averaging
    </div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate deps={["rain"]} paint={() => {
        let w = born();
        let acc = 0;
        return {
          start: () => {
            w = born();
            // headless draws ONE frame, so it has to arrive already ticked
            const want = startAt || (typeof IntersectionObserver === "undefined" ? 120 : 0);
            for (let i = 0; i < want; i++) step(w);
          },
          frame: (s: Surface, dt: number) => {
            acc += dt;
            // one tick is one cell of travel, so the front is visible at this rate
            while (acc > 1 / 26) { acc -= 1 / 26; if (w.t >= 260) w = born(); else step(w); }

            const { ctx, width, height: H } = s;
            ctx.clearRect(0, 0, width, H);
            ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, H);

            const TOP = 20, BOT = 18, GAP2 = 10;
            const cw = (width - GAP2) / 2;
            const side = Math.min(cw, H - TOP - BOT);
            const pz = side / (2 * VIEW + 1);
            const top = TOP + Math.max(0, (H - TOP - BOT - side) / 2);

            // the level far from either body — the zero the deficit is drawn against
            let bg = 0, bn = 0;
            for (let y = -VIEW; y <= VIEW; y += 2) for (let x = -VIEW; x <= VIEW; x += 2)
              if (Math.hypot(x + GAP / 2, y) > 40 && Math.hypot(x - GAP / 2, y) > 40) {
                bg += w.q[at(C + x, C + y)]; bn++;
              }
            bg = bn ? bg / bn : DEG;

            /*
             * LOGARITHMIC. `d` is the shortfall as a fraction of the far field, and
             * what is inked is log(1 + d/floor) / log(1 + 1/floor) — so the deepest
             * shortfall is full ink, a tenth of it is still better than half ink, and
             * a thousandth is still visible. Linear, everything past r = 8 is under
             * the first shade and the panel is a dot.
             */
            const FLOOR = 0.002;
            const lg = (d: number) =>
              Math.log(1 + Math.max(0, d) / FLOOR) / Math.log(1 + 1 / FLOOR);

            for (const col of [0, 1]) {
              const cx = (col === 0 ? cw / 2 : cw + GAP2 + cw / 2), cy = top + side / 2;
              for (let y = -VIEW; y <= VIEW; y++) for (let x = -VIEW; x <= VIEW; x++) {
                const c = at(C + x, C + y);
                if (w.body[c]) continue;
                const v = col === 0
                  ? Math.min(1, w.q[c] / Math.max(bg, 1e-9))       // what is there
                  : lg((bg - w.q[c]) / Math.max(bg, 1e-9));        // what is MISSING
                if (v <= 0.004) continue;
                ctx.globalAlpha = Math.min(1, v);
                ctx.fillStyle = col === 0 ? RAIN : MISS;
                ctx.fillRect(cx + x * pz - pz / 2, cy + y * pz - pz / 2, pz + 0.6, pz + 0.6);
              }
              ctx.globalAlpha = 1;

              [-GAP / 2, GAP / 2].forEach((dx, k) => {
                ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(cx + dx * pz, cy, (R + 0.8) * pz, 0, 2 * Math.PI);
                ctx.stroke();

                if (col !== 1 || !w.t) return;
                /*
                 * NO COMMON-MODE TO REMOVE, because there is no noise: the two bodies
                 * are exactly symmetric and the rule is deterministic, so the pushes
                 * come out exactly equal and opposite rather than approximately.
                 */
                /*
                 * SCALED BY THE LARGER OF THE TWO, and clamped. Scaling by their
                 * DIFFERENCE — which is what the archive did — divides by nearly zero
                 * exactly when the two are closest to equal and opposite, which is
                 * when the panel is most nearly right: at t = 8 both read 4, the
                 * difference is 0, and the arrows shot off the canvas.
                 */
                const big = Math.max(1, ...w.F.map(f => Math.hypot(f[0], f[1])));
                const sc = Math.min(26, 26 / big * Math.hypot(w.F[k][0], w.F[k][1])) /
                  Math.max(1e-9, Math.hypot(w.F[k][0], w.F[k][1]));
                const fx = w.F[k][0] * sc, fy = w.F[k][1] * sc;
                if (Math.hypot(fx, fy) < 2) return;
                const x0 = cx + dx * pz, y0 = cy;
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
            }

            ctx.font = "11px ui-monospace, monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = INK;
            ctx.fillText("the charges themselves", cw / 2, 13);
            ctx.fillText("how many are MISSING — log scale", cw + GAP2 + cw / 2, 13);

            ctx.font = "10px ui-monospace, monospace";
            ctx.fillStyle = FAINT;
            // the total, not the per-tick rate: it is a running sum and the per-tick
            // figure rounds to three zeros while the arrow is plainly there
            const p = w.F.map(f => String(f[0]));
            ctx.fillText(`t = ${w.t}  ·  push on each body  ${p[0]}  and  ${p[1]}` +
              `   — whole rays, no averaging`, width / 2, H - 5);
            ctx.textAlign = "left";
          },
        };
      }} />
    </div>
  </div>;
