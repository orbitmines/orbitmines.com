/**
 * THE PANELS — drawn from the same core the measurements use, so a picture and a
 * number can no longer disagree.
 *
 * Every panel below constructs a `World` from DISCRETE.ts with an explicit theory
 * and geometry, ticks it, and reads the SAME observables the tests read. There is no
 * second implementation of the rules for drawing purposes, which is what the old
 * `grid.tsx` and `current.tsx` were and is how they came to be showing a vacuum a
 * fifth of the derived density.
 *
 * WHAT RENDERING KEEPS CATCHING, recorded so it is not re-learned:
 *
 *   A DIFFERENCE, NOT A TOTAL. A source emits along its EXITS, so what dominates a
 *   raw frame is pencil beams that are identical in every configuration. Two panels
 *   meant to show opposite physics came out looking the same. Each panel here runs a
 *   CONTROL world at the same seed and draws the difference.
 *
 *   AND THE DIFFERENCE HAS A DC OFFSET. A second body changes the vacuum's own
 *   statistics everywhere, which rendered as a uniform wash with the signal buried
 *   in it. The far field is where nothing local happens, so its mean is that offset.
 *
 *   A SHARED SCALE, NOT A PER-PANEL PEAK. Normalising each panel to its own maximum
 *   makes them incomparable and reads backwards — a panel where almost nothing
 *   happens turns its own shot noise up to full brightness beside a panel with a
 *   real signal.
 */

import { CanvasView, Surface } from "./CANVAS";
import {
  World, Theory, Geometry, GRAVITY, GRAVITY_MAGNETISM, LABELLED, GEOMETRIES,
  l, fieldB, fill, withSign,
} from "../DISCRETE";

const BACK = "#08090d", FAINT = "#5a5f6e", SEEN = "#eef0f5";
const PLUS = "#4aa8eb", MINUS = "#eb964a", DESTROYED = "#e0685f", TRAFFIC = "#6fd39b";

/** what a panel reads off a local, and how it is coloured */
export type Channel = {
  name: string;
  /** the value at a local, already differenced against the control by the caller */
  at: (w: World, local: number) => number;
  /** signed: two colours; unsigned: one */
  positive: string;
  negative?: string;
  /**
   * Whether this reading has to be ACCUMULATED over ticks or is already a total.
   *
   * A single tick of this vacuum is noise. Reading how many rays are present at a
   * local right now and differencing it against another world gives a difference of
   * two random numbers — rendered, it is a uniform speckle with the physics
   * invisible inside it, which is exactly what the first version of these panels
   * drew. `density` is already cumulative because a fold is permanent; everything
   * else has to be summed over time, and the sum IS the measurement.
   */
  cumulative?: boolean;
};

export const CHANNELS = {
  /**
   * WHERE SPACE HAS BEEN DESTROYED — the metric channel, and the article's pull.
   *
   * READ OUT OF `w.destroyed`, NOT `backend.density`. Density counts how much space
   * has been FOLDED into a point, and on-edge annihilation does not fold: it collapses
   * the point the split inserted BETWEEN two others and leaves both ends alone. So
   * density stopped moving when the meeting rule was settled, and this channel — the
   * one every "pull" panel in the article is drawn from — silently went flat. The
   * panels kept rendering; the layer they were about was blank.
   *
   * `w.destroyed` is the per-point annihilation count, credited half to each end of
   * the edge the event happened on, and it is the same quantity the force
   * measurements read. `before` is still taken so the signature does not change and
   * so a panel can be drawn against a warmed world.
   */
  destroyed: (before: Int32Array): Channel => ({
    name: "space destroyed — the pull",
    at: (w, k) => (k < w.destroyed.length ? w.destroyed[k] : 0) - (before[k] ?? 0),
    positive: DESTROYED,
    cumulative: true,                      // a count only ever grows, so it already sums
  }),
  /** how much is present — the mechanical channel, and the push */
  traffic: (): Channel => ({
    name: "rays that survived — the push",
    at: (w, k) => l.rays(w, k).length,
    positive: TRAFFIC, negative: MINUS,
  }),
  /** the net polarity, which IS the electric field */
  charge: (): Channel => ({
    name: "net polarity — the electric field",
    at: (w, k) => l.charge(w, k),
    positive: PLUS, negative: MINUS,
  }),
  /** B = Σσ(d̂ × u), out of the plane */
  magnetic: (axis = 2): Channel => ({
    name: "B = Σσ(d̂ × u), read off the rays",
    at: (w, k) => fieldB(w, k)[axis] ?? 0,
    positive: PLUS, negative: MINUS,
  }),
} as const;

export type PanelSpec = {
  note: string;
  /** draw a dot for each source; off where the claim is that the field hides them */
  markers?: boolean;
  theory: Theory;
  geometry?: Geometry;
  /** the world under test, and the control it is drawn against */
  build: (w: World) => void;
  control?: (w: World) => void;
  channels: (before: Int32Array) => Channel[];
  N?: number;
  expansion?: number;
  /** how much of the box to ink; the rest is run but not drawn */
  view?: number;
  warm?: number;
  height?: number;
};

/**
 * THE PANELS RUN IN TWO DIMENSIONS, and that is a decision rather than a shortcut.
 *
 * A panel is a picture of one plane. Running a 41³ world to draw a slice of it costs
 * sixty-eight thousand locals a tick against a plane's fourteen thousand at 121² —
 * for pixels nobody sees. Measured, the 3D version did not finish. `square-8` is the
 * same three rules with DEG = 8, and every constant a panel needs comes out of it
 * the same way, so it is a row of `geometry/derived-constants` rather than a special
 * case.
 *
 * What is lost is named: a plane's rank-four anisotropy is 40% against cubic 26's
 * 49.7%, and its SHEET is 2 rather than 8. A panel shows the MECHANISM; the numbers
 * belong to the measurements, which run in three.
 */
const make = (s: PanelSpec, build: (w: World) => void) => {
  const w = new World({
    theory: s.theory, geometry: s.geometry ?? GEOMETRIES["square-8"], N: s.N ?? 121,
    seed: 20260817, boundary: "absorb", expansion: s.expansion ?? 0.05,
  });
  build(w);
  return w;
};

/** the far-field mean, which is the offset a second body adds everywhere */
const offset = (w: World, f: (k: number) => number, C: number, view: number) => {
  let s = 0, n = 0;
  w.backend.forEachLocal(k => {
    if (w.isSource(k)) return;
    const p = w.backend.position(k);
    const d = Math.hypot(...p.map(x => x - C));
    if (d < view + 8) return;
    s += f(k); n++;
  });
  return n ? s / n : 0;
};

export const Panel = (s: PanelSpec) => {
  const height = s.height ?? 300;
  return <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: FAINT, marginBottom: 6,
    }}>{s.note}</div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate deps={[s.note]} paint={() => {
        let w: World, ctl: World;
        let chans: Channel[] = [], ctlChans: Channel[] = [];
        /** the running sum of each channel's difference, which is what gets drawn */
        let sums: Float64Array[] = [];
        let samples = 0;
        const N = s.N ?? 121, C = (N - 1) / 2, view = s.view ?? Math.min(30, C - 2);
        let acc = 0;

        /*
         * THE BASELINE THE CUMULATIVE CHANNELS ARE DIFFERENCED AGAINST. Taken from
         * `destroyed` for the same reason the channel reads it: density does not move
         * under on-edge annihilation, so a baseline taken from density is a baseline
         * of zeroes against a quantity that is also zero.
         */
        const snapshot = (x: World) => {
          const a = new Int32Array(x.backend.size());
          x.backend.forEachLocal(k => { a[k] = k < x.destroyed.length ? x.destroyed[k] : 0; });
          return a;
        };

        /*
         * ONE TICK OF BOTH WORLDS, AND THE DIFFERENCE ADDED IN.
         *
         * Accumulating the DIFFERENCE rather than differencing the accumulations is
         * the same number, and it is what lets a cumulative channel and a per-tick
         * one be drawn side by side without either needing to know about the other.
         */
        const step = () => {
          w.tick(); ctl.tick();
          samples++;
          for (let ci = 0; ci < chans.length; ci++) {
            const a = chans[ci], b = ctlChans[ci], out = sums[ci];
            if (a.cumulative) continue;               // already a total; read at the end
            w.backend.forEachLocal(k => { out[k] += a.at(w, k) - b.at(ctl, k); });
          }
        };

        return {
          start: () => {
            w = make(s, s.build);
            ctl = make(s, s.control ?? (() => {}));
            chans = s.channels(snapshot(w));
            ctlChans = s.channels(snapshot(ctl));
            sums = chans.map(() => new Float64Array(w.backend.size()));
            samples = 0;
            // the average IS the measurement, so it is built before the first frame
            // rather than accumulated while the reader watches an empty panel
            for (let i = 0; i < (s.warm ?? 200); i++) step();
          },
          stop: () => { (w as unknown) = undefined; (ctl as unknown) = undefined; sums = []; },
          frame: (sur: Surface, dt: number) => {
            acc += dt;
            while (acc > 1 / 20) { step(); acc -= 1 / 20; }
            const read = chans.map((ch, ci) => ch.cumulative
              ? (k: number) => ch.at(w, k) - ctlChans[ci].at(ctl, k)
              : (k: number) => sums[ci][k] / Math.max(samples, 1));
            paint(sur, w, chans, read, C, view, s.note, w.stats.ticks, s.markers !== false);
          },
        };
      }} />
    </div>
  </div>;
};

const paint = (
  sur: Surface, w: World, chans: Channel[], read: ((k: number) => number)[],
  C: number, view: number, label: string, ticks: number, markers = true,) => {
  const { ctx, width, height } = sur;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);
  const cols = chans.length;
  const cw = width / cols, H = height - 26;
  const VN = 2 * view + 1;
  const s = Math.min(cw / VN, H / VN);
  const oy = 20 + (H - 20 - VN * s) / 2;

  chans.forEach((ch, ci) => {
    const ox = ci * cw + (cw - VN * s) / 2;
    const dc = read[ci];
    const off = offset(w, dc, C, view);
    /*
     * THE SCALE IS THE SPREAD OF THE DIFFERENCE ITSELF, taken in the far field where
     * nothing local is happening — so the colour means "this many times the level
     * this quantity fluctuates at anyway". Normalising to a panel's own PEAK makes
     * panels incomparable and reads backwards: one where almost nothing happens
     * turns its own shot noise up to full brightness beside one with a real signal.
     */
    let v2 = 0, n = 0;
    w.backend.forEachLocal(k => {
      if (w.isSource(k)) return;
      const p = w.backend.position(k);
      if (Math.hypot(...p.map(x => x - C)) < view + 8) return;
      const d = dc(k) - off; v2 += d * d; n++;
    });
    const scale = n ? Math.max(Math.sqrt(v2 / n), 1e-12) : 1;

    w.backend.forEachLocal(k => {
      const p = w.backend.position(k);
      if (p.length > 2 && Math.abs(p[2] - C) > 0.5) return;      // one plane, in 3D
      const x = p[0] - C + view, y = p[1] - C + view;
      if (x < 0 || y < 0 || x >= VN || y >= VN) return;
      if (w.isSource(k)) return;
      // in units of the far-field spread: two of those is a signal, and below one is
      // indistinguishable from the vacuum doing what it does anyway
      const v = (dc(k) - off) / scale;
      if (Math.abs(v) < 1) return;
      ctx.globalAlpha = Math.min(0.92, (Math.abs(v) - 1) * 0.35);
      ctx.fillStyle = v > 0 ? ch.positive : (ch.negative ?? ch.positive);
      ctx.fillRect(ox + x * s, oy + y * s, Math.max(s, 1), Math.max(s, 1));
    });
    ctx.globalAlpha = 1;

    /*
     * THE MARKERS ARE OPTIONAL, because on some panels drawing them contradicts the
     * claim. The three sign-convention panels exist to show that a single tick of the
     * vacuum does NOT show the structure in it — and a ring of source dots painted
     * over the field shows it whatever the field is doing, which makes the picture
     * argue the opposite of its caption. Where the point is "you cannot see it here",
     * only what was measured is drawn.
     */
    for (const src of (markers ? w.sources : [])) {
      const p = w.backend.position(src.locals[0]);
      if (p.length > 2 && Math.abs(p[2] - C) > 2) continue;
      let cx = 0, cy = 0, m = 0;
      for (const k of src.locals) {
        const q = w.backend.position(k);
        if (q.length > 2 && Math.abs(q[2] - C) > 0.5) continue;
        cx += q[0]; cy += q[1]; m++;
      }
      if (!m) continue;
      ctx.beginPath();
      ctx.arc(ox + (cx / m - C + view) * s, oy + (cy / m - C + view) * s, 2.2 * s, 0, 7);
      ctx.fillStyle = src.emits > 0 ? PLUS : src.emits < 0 ? MINUS : "#2a2e38";
      ctx.fill();
      ctx.strokeStyle = SEEN; ctx.lineWidth = 1.2; ctx.stroke();
    }

    ctx.font = "10px ui-monospace, monospace";
    ctx.fillStyle = FAINT; ctx.textAlign = "center";
    ctx.fillText(ch.name, ci * cw + cw / 2, 14);
  });

  ctx.textAlign = "left";
  ctx.fillStyle = FAINT;
  ctx.fillText(label, 10, height - 10);
  ctx.textAlign = "right";
  ctx.fillText(`${ticks} ticks · fill ${fill(w).toFixed(2)}`, width - 10, height - 10);
  ctx.textAlign = "left";
};

// ─── the panels the article uses ────────────────────────────────────────────

/** a position with as many components as the geometry has dimensions */
const at = (w: World, ...c: number[]) => c.slice(0, w.geometry.D);

const pair = (a: 1 | -1 | 0, b: 1 | -1 | 0, sep = 14) => (w: World) => {
  const C = (w.opts.N - 1) / 2;
  w.add({ at: at(w, C - sep / 2, C, C), radius: 3, emits: a, absorbs: true, duty: a === 0 ? 0 : 1 });
  w.add({ at: at(w, C + sep / 2, C, C), radius: 3, emits: b, absorbs: true, duty: b === 0 ? 0 : 1 });
};
const lone = (a: 1 | -1 | 0, sep = 14) => (w: World) => {
  const C = (w.opts.N - 1) / 2;
  w.add({ at: at(w, C - sep / 2, C, C), radius: 3, emits: a, absorbs: true, duty: a === 0 ? 0 : 1 });
};

/** two alike charges: nothing annihilates between them, so the rays land — the push */
export const Alike = ({ height = 300 }: { height?: number }) => Panel({
  height, note: "two alike charges — nothing annihilates between them, so the partner's rays " +
    "survive the crossing and land: THE PUSH",
  theory: GRAVITY_MAGNETISM, N: 121, view: 26,
  build: pair(1, 1), control: lone(1),
  channels: before => [CHANNELS.traffic(), CHANNELS.destroyed(before)],
});

/** two opposite charges: the gap is destroyed rather than crossed — the pull */
export const Opposite = ({ height = 300 }: { height?: number }) => Panel({
  height, note: "two opposite charges — the same two rules, the other branch: the gap is " +
    "destroyed rather than crossed",
  theory: GRAVITY_MAGNETISM, N: 121, view: 26,
  build: pair(1, -1), control: lone(1),
  channels: before => [CHANNELS.traffic(), CHANNELS.destroyed(before)],
});

/** gravity: two inert absorbers, and the vacuum's own shadow between them */
export const Gravity = ({ height = 300 }: { height?: number }) => Panel({
  height, note: "two INERT absorbers in the gravity theory — they eat the vacuum and emit " +
    "nothing, so what draws them together is the vacuum's own pressure with a shadow in it",
  theory: GRAVITY, N: 121, view: 26,
  build: pair(0, 0), control: lone(0),
  channels: before => [CHANNELS.traffic(), CHANNELS.destroyed(before)],
});

/** the magnetic field of a moving charge, beside the same charge at rest */
export const MovingCharge = ({ height = 320 }: { height?: number }) => Panel({
  height, note: "a moving charge — B is transverse to the motion and reverses across it, and " +
    "is EXACTLY nothing at rest, because a ray from a stationary charge carries the label 0",
  theory: LABELLED, N: 121, view: 26,
  build: w => {
    const C = (w.opts.N - 1) / 2;
    w.add({ at: at(w, C, C, C), radius: 3, emits: 1, u: at(w, 0, 0.5, 0) });
  },
  control: w => {
    const C = (w.opts.N - 1) / 2;
    w.add({ at: at(w, C, C, C), radius: 3, emits: 1 });   // the same charge, standing still
  },
  channels: () => [CHANNELS.magnetic(2), CHANNELS.charge()],
});

/**
 * TWO WIRES. Each is a line of sources whose POLARITY carries the current — the
 * cells on one side of the line emit +1 and on the other −1, so there is no net
 * charge and the direction of the current is in the sign.
 *
 * IT HAS TO BE BUILT THAT WAY FOR A FORCE TO EXIST AT ALL, and the two constructions
 * of a wire in this book are not interchangeable. A wire made of counter-drifting
 * LABELLED carriers gives the right field — Ampère's 1/r, no curl taken — and has
 * no magnetic force whatever, because its polarity distribution is identical
 * whichever way the current runs and a label does not enter the collision rules.
 * A wire whose polarity carries the current has the force and the wrong field
 * exponent. Joining them needs carriers that actually move, which is owed.
 *
 * So these panels show the FORCE, and `MovingCharge` shows the FIELD.
 */
const wire = (sense: 1 | -1, x: number) => (w: World) => {
  const N = w.opts.N;
  for (let y = 4; y < N - 4; y++)
    w.add({ at: at(w, x, y, (N - 1) / 2), radius: 0.9, emits: (y % 2 === 0 ? sense : -sense) as 1 | -1 });
};
const wires = (a: 1 | -1, b: 1 | -1 | 0, sep = 14) => (w: World) => {
  const C = (w.opts.N - 1) / 2;
  wire(a, C - sep / 2)(w);
  if (b !== 0) wire(b, C + sep / 2)(w);
};

/** parallel currents: the rays that face each other carry opposite signs, so they annihilate */
export const WiresParallel = ({ height = 300 }: { height?: number }) => Panel({
  height, note: "two parallel currents — the rays that face each other carry OPPOSITE signs, " +
    "so they annihilate and the space between the wires is destroyed: ATTRACT",
  theory: GRAVITY_MAGNETISM, N: 121, view: 26,
  build: wires(1, 1), control: wires(1, 0),
  channels: before => [CHANNELS.traffic(), CHANNELS.destroyed(before)],
});

/** antiparallel: the facing rays are alike, so they turn and survive */
export const WiresAnti = ({ height = 300 }: { height?: number }) => Panel({
  height, note: "two antiparallel currents — the facing rays carry the SAME sign, so they turn " +
    "and survive the crossing: REPEL",
  theory: GRAVITY_MAGNETISM, N: 121, view: 26,
  build: wires(1, -1), control: wires(1, 0),
  channels: before => [CHANNELS.traffic(), CHANNELS.destroyed(before)],
});

// ─── the gravity arc's own panels, on the core ──────────────────────────────

/**
 * WHAT THE VACUUM DOES ON ITS OWN — which is the whole of the gravity mechanism
 * before any matter is put in it.
 *
 * (G+M/2) makes new room and the same expansion thins what is already there, and
 * the two together have a fixed point nobody chose. A panel of it is not a picture
 * of anything happening to a body: it is the pressure a body will later be in.
 */
export const VacuumAlone = ({ height = 260 }: { height?: number }) => Panel({
  height, note: "the vacuum with nothing in it — new room edged on every axis, and the same " +
    "expansion thinning what is there. This is the pressure everything else is measured against",
  theory: GRAVITY_MAGNETISM, N: 121, view: 26, warm: 300,
  build: () => {},
  control: () => {},
  channels: () => [CHANNELS.charge()],
});

/**
 * THE DEFICIT — matter in the way of the expansion.
 *
 * A body eats the rays that arrive at it, so the vacuum around it is short of what
 * it would otherwise have, and that shortfall spreads at c̄. It is the mechanism
 * rather than the observable — the force is what a SECOND body does to it — but it
 * is the thing the article's gravity arc is about, and it can be looked at.
 */
export const Deficit = ({ height = 260 }: { height?: number }) => Panel({
  height, note: "one inert absorber in the gravity theory — the shortfall it leaves in the " +
    "vacuum's own traffic, which is what spreads at c̄ and what a second body then feels",
  theory: GRAVITY, N: 121, view: 30, warm: 260,
  build: w => {
    const C = (w.opts.N - 1) / 2;
    w.add({ at: at(w, C, C, C), radius: 3, absorbs: true, duty: 0 });
  },
  control: () => {},
  channels: () => [CHANNELS.traffic()],
});

/**
 * THE VEINS, AND WHETHER THE VACUUM TAKES THEM OUT — the two limits side by side.
 *
 * Left: a source in an EMPTY box, which is the collisionless limit the geometry
 * table computes in, and where a body diagonal really does run √3 times as far in a
 * tick. Right: the same source in the model's own vacuum, where a ray meets
 * something every few cells and a ray that has been turned is on a different exit
 * from the one it left on.
 *
 * The measurement is `geometry/veins`; this is what it is a measurement OF.
 */
export const Veins = ({ height = 300 }: { height?: number }) => <div>
  {Panel({
    height, note: "a source in an EMPTY box — the collisionless limit, where the lattice's " +
      "grain is the whole picture and a body diagonal covers √3 cells in a tick",
    theory: GRAVITY_MAGNETISM, N: 121, view: 34, warm: 60, expansion: 0,
    build: w => {
      const C = (w.opts.N - 1) / 2;
      w.add({ at: at(w, C, C, C), radius: 2, emits: 1 });
    },
    control: () => {},
    channels: () => [CHANNELS.charge()],
  })}
  {Panel({
    height, note: "the same source in the model's own vacuum — a ray meets something every " +
      "few cells, and a ray that has been turned is on a different exit from the one it left on",
    theory: GRAVITY_MAGNETISM, N: 121, view: 34, warm: 200,
    build: w => {
      const C = (w.opts.N - 1) / 2;
      w.add({ at: at(w, C, C, C), radius: 2, emits: 1 });
    },
    control: () => {},
    channels: () => [CHANNELS.charge()],
  })}
</div>;

/**
 * THE SHEET — l.SHEET rays pulsed in a plane that comes round, which is how the
 * article derives 1/R^(D−1): a FIXED number of rays spread over a shell.
 *
 * Both halves are the same source; only the emission differs. Isotropic fires every
 * exit every tick, which is the approximation every measurement in this book has
 * used; `sheet` fires the equator of an axis that steps round the ring, which is
 * what the article actually describes.
 */
export const SheetEmission = ({ height = 300 }: { height?: number }) => <div>
  {Panel({
    height, note: "ISOTROPIC emission — every exit, every tick. The approximation the " +
      "measurements use",
    theory: GRAVITY_MAGNETISM, N: 121, view: 30, warm: 200,
    build: w => {
      const C = (w.opts.N - 1) / 2;
      w.add({ at: at(w, C, C, C), radius: 2, emits: 1, emission: "isotropic" });
    },
    control: () => {},
    channels: () => [CHANNELS.charge()],
  })}
  {Panel({
    height, note: "SHEET emission — l.SHEET rays in a plane that comes round one ring step a " +
      "tick, which is what the inverse-square law is derived from",
    theory: GRAVITY_MAGNETISM, N: 121, view: 30, warm: 200,
    build: w => {
      const C = (w.opts.N - 1) / 2;
      w.add({ at: at(w, C, C, C), radius: 2, emits: 1, emission: "sheet" });
    },
    control: () => {},
    channels: () => [CHANNELS.charge()],
  })}
</div>;

/*
 * THE VACUUM'S ONE FREE DRAW, AND WHAT AVERAGING DOES TO IT.
 *
 * These replace the archive's `ribbon.tsx` panels. The point they make is the same
 * one: (G+M/2) fixes where and when a creation fires and leaves only the SIGN open,
 * so the three conventions are the whole of the model's randomness — and none of the
 * three shows a structure at a single tick, because a structure is one object in a
 * field that fills every point. It is AVERAGING that makes it visible.
 *
 * WHAT CHANGED IS WHAT IS UNDERNEATH. `ribbon.tsx` ran its own automaton; these run
 * `DISCRETE.ts` with `withSign`, so the convention is a parameter of the model rather
 * than a re-implementation of it, and the picture cannot drift from what the tests
 * measure.
 */

/** a held ring of charge, which is the structure these panels are looking for */
const ring = (radius: number) => (w: World) => {
  const C = (w.opts.N - 1) / 2;
  for (let i = 0; i < 64; i++) {
    const a = (2 * Math.PI * i) / 64;
    w.add({
      at: [Math.round(C + radius * Math.cos(a)), Math.round(C + radius * Math.sin(a)), C],
      radius: 0, emits: i % 2 ? 1 : -1, duty: 1, absorbs: true,
    });
  }
};

const convention = (sign: "perNode" | "perAxis" | "perRay", why: string) =>
  ({ height = 300 }: { height?: number }) => Panel({
    height, note: `${sign} — ${why}`,
    theory: withSign(GRAVITY_MAGNETISM, sign), N: 121, view: 26,
    build: ring(14), control: () => {},
    /*
     * ONE TICK, NOT AN AVERAGE. These three are here to show that a single tick of
     * the vacuum looks like noise whichever convention is chosen, which is the
     * observation the averaged panels below are the answer to.
     */
    warm: 1, markers: false,
    channels: () => [CHANNELS.charge()],
  });

export const PerNode = convention("perNode",
  "one sign for the whole point, into all its axes at once");
export const PerAxis = convention("perAxis",
  "each axis signed on its own, so a point hands out independent ± pairs");
export const PerRay = convention("perRay",
  "every heading signed independently, which breaks the ± pair the rule states");

/** the same field, averaged over time — and the ring comes out of the noise */
export const MeanOccupancy = ({ height = 300 }: { height?: number }) => Panel({
  height, note: "the same vacuum, AVERAGED over ticks — the structure is one object in a " +
    "field that fills every point, so a single tick cannot show it and an average can",
  theory: GRAVITY_MAGNETISM, N: 121, view: 26,
  build: ring(14), control: () => {},
  warm: 200, markers: false,
  channels: () => [CHANNELS.traffic()],
});

/** and with the sign kept, where it vanishes again — which is the honest half */
export const MeanPolarity = ({ height = 300 }: { height?: number }) => Panel({
  height, note: "the same average with the SIGN kept — the ring vanishes, because its charge " +
    "is + on one lap and − on the next, so it is as unbiased in time as the vacuum is",
  theory: GRAVITY_MAGNETISM, N: 121, view: 26,
  build: ring(14), control: () => {},
  warm: 200, markers: false,
  channels: () => [CHANNELS.charge()],
});

/**
 * A NEUTRAL WIRE — no net charge, no ray current, and a magnetic field anyway.
 *
 * The construction is the one `magnetostatics/neutral-wire` measures, not a picture
 * drawn to look like it: alternating carriers along the axis, equal numbers of each,
 * so there is NO net charge anywhere in it — and σu is +I ẑ for BOTH signs, so the
 * labels add where the charges cancel. That is the whole point the section makes
 * twice, and it is why B is the field that survives when E is exactly nothing.
 */
export const NeutralWire = ({ height = 300 }: { height?: number }) => Panel({
  height, note: "a neutral wire — the + carriers drift one way and the − the other, so there " +
    "is no net charge and no ray current, and there is a magnetic field anyway",
  theory: LABELLED, N: 121, view: 26,
  build: w => {
    const C = (w.opts.N - 1) / 2, I = 0.5;
    for (let y = 6; y < w.opts.N - 6; y++) {
      const s = (y % 2 === 0 ? 1 : -1) as 1 | -1;
      w.add({ at: [C, y, C], radius: 0.9, emits: s, u: [0, s * I, 0] });
    }
  },
  control: () => {},
  channels: () => [CHANNELS.magnetic(2), CHANNELS.charge()],
});
