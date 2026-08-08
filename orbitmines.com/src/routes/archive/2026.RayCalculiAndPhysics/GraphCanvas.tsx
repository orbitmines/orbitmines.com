import { useRef } from "react";

import { CanvasView, Surface } from "./canvas";
import { Boundary, Graph, node } from "./discrete";
import { BOUNDARY_STUB, CYCLE, LATTICE_STEP, Polarity, Vec } from "./lattice";
import {
  AMBER, channels, CYAN, ground, HALO, rgba, SOURCE, source, tintOf,
} from "./paint";

/**
 * How much of the universe is worth drawing.
 *
 * `lattice` draws all of it: every boundary of every point, one stroke each.
 * That is the right thing for a universe of a dozen points, where each one is
 * the subject.
 *
 * `shells` and `field` are for the ones with thousands. A point wired in all
 * twenty-six directions has twenty-six boundaries, and a ball of a thousand
 * such points has some thirteen thousand connections — drawn one stroke at a
 * time it is both unaffordable and a solid grey fog. So the space is drawn as
 * its axis-aligned connections only, batched into a single path, and
 * everything on top of it is only what is HAPPENING: the sources, and the
 * charges in flight. The lattice bending is then something you can see,
 * because there is a lattice to see rather than a fill.
 *
 * The two differ in what they make of the charges. `shells` draws each pulse
 * as the surface it is, which is the honest picture of a thing that emits and
 * the whole story for a source that only flips over. `field` draws what the
 * pulses add up to — the region where the field is one charge and the region
 * where it is the other — which is the only way to see a source that TURNS,
 * since a spiral is a property of a whole train of shells and of none of them
 * separately.
 */
export type RenderMode = 'lattice' | 'shells' | 'field';

/**
 * One canvas showing one universe.
 *
 * `animate` is what separates a player from a still: with it the view runs a
 * requestAnimationFrame loop, easing the camera and handing each frame's dt
 * back to the caller (which is where ticking lives — this component only ever
 * renders, it never advances the dynamics). Without it the universe is drawn
 * exactly once, with the camera snapped straight to its target orientation
 * rather than eased into it, since there are no later frames to ease over.
 */
export const GraphCanvas = ({
  graph: current,
  animate = false,
  density = true,
  mode = 'lattice',
  onFrame,
  onVisible,
}: {
  // Read afresh every frame, so a reset that swaps the whole graph out is
  // picked up without tearing the render loop down. Nothing at all is a
  // universe that has been let go of because nobody is looking at it — the
  // view draws nothing rather than pretending there is something to draw.
  graph: () => Graph | null;
  animate?: boolean;
  density?: boolean;
  mode?: RenderMode;
  onFrame?: (dt: number) => void;

  // Called as the view comes on and off screen, so that whoever owns the
  // universe can let go of it and make a new one. See `CalculusPlayer`.
  onVisible?: (visible: boolean) => void;
}) => {
  // The frame loop is made once and outlives every re-render, so it must not
  // capture these — a callback closed over at mount time would still be
  // looking at the state of the world as it was then (which is what made
  // pausing do nothing: the loop kept calling the first render's onFrame,
  // where `running` was frozen at its initial value). Kept in a ref and read
  // per frame, so the loop always calls the current ones.
  const latest = useRef({ current, onFrame, onVisible });
  latest.current = { current, onFrame, onVisible };

  return <CanvasView animate={animate} deps={[animate, density, mode]} paint={() => {
    const cam = {
      scale: 44, rot: Math.PI / 4, tilt: 0.6155,
      dist: null as number | null, distMult: 1.5, scaleMult: 1,
    };

    // The field as drawn, which lags the field as computed and catches up a
    // fraction every frame. Kept across frames because that lag is the whole
    // of what makes the animation flow rather than step.
    let eased: Float32Array | null = null;

    function project(pos: Vec, rot: number, tilt: number, camDist: number) {
      const x = pos[0] || 0, y = pos[1] || 0, z = pos[2] || 0;
      const cosR = Math.cos(rot), sinR = Math.sin(rot);
      const x1 = x * cosR - z * sinR;
      const z1 = x * sinR + z * cosR;
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const y1 = y * cosT - z1 * sinT;
      const z2 = y * sinT + z1 * cosT;
      // True perspective: camera sits at distance camDist from the origin
      // along the view axis. Points nearer the camera than that (denom small
      // or negative) are behind/at the lens and get clipped. Convergence
      // toward a vanishing point is now the CORRECT result of an actual
      // camera, not a bug — it's what "moving the camera closer" means.
      const denom = z2 + camDist;
      if (denom < camDist * 0.02) return { x: 0, y: 0, depth: 0, clipped: true };
      const persp = camDist / denom;
      return { x: x1 * persp, y: y1 * persp, depth: Math.min(Math.max(persp, 0.15), 6), clipped: false };
    }

    function draw({ ctx, width: w, height: h }: Surface) {
      const graph = latest.current.current();
      if (!graph) return;
      // The outline enclosing a set of points. Andrew's monotone chain:
      // sort, then walk once along the bottom and once back along the top,
      // dropping any point the walk turns the wrong way at.
      const outline = (at: { x: number, y: number }[]) => {
        const p = at.slice().sort((a, b) => a.x - b.x || a.y - b.y);
        const turn = (o: typeof p[0], a: typeof p[0], b: typeof p[0]) =>
          (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

        const half = (source: typeof p) => {
          const out: typeof p = [];

          for (const q of source) {
            while (out.length >= 2 && turn(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop();
            out.push(q);
          }

          out.pop();

          return out;
        };

        return half(p).concat(half(p.slice().reverse()));
      };

      // Both of the two field renderings want the lattice, the sources and
      // the marks; they differ in what they make of the charges.
      const field = mode !== 'lattice';
      const contours = mode === 'field';

      ground(ctx, w, h, { vignette: true });

      if (graph.nodes.length === 0) return;

      const layout = graph.layout;

      // What the camera measures itself against. Everything, unless the
      // universe has said which part of itself is the subject — see `focus`.
      const framed = graph.focus === undefined
        ? [...layout]
        : [...layout].filter(([nd]) => graph.inFocus(nd));

      // Raw world extent (unprojected) — this is what the base pixel scale
      // tracks, deliberately independent of camera distance/perspective, so
      // there's no feedback loop between "how far the camera has dollied" and
      // "how much of the grid fits on screen". A real camera doesn't refit
      // its FOV to guarantee everything stays visible as it moves closer.
      let worldExtent = 1e-6;
      for (const [, pos] of framed) {
        const r = Math.hypot(...pos);
        if (r > worldExtent) worldExtent = r;
      }

      // Auto-orient the camera to the effective dimensionality of what's
      // actually on screen: measure the spread along each world axis and
      // count how many are meaningfully populated. A 1D structure (one
      // axis) lies flat as a horizontal line, a 2D structure (two axes) is
      // viewed straight-on/top-down, and a 3D structure gets a ¾
      // perspective. The camera eases toward the target so a change in
      // dimensionality (e.g. a line thickening into a plane) animates
      // rather than snapping.
      const lo = [Infinity, Infinity, Infinity];
      const hi = [-Infinity, -Infinity, -Infinity];
      for (const [, pos] of framed) {
        for (let k = 0; k < 3; k++) {
          const v = pos[k] || 0;
          if (v < lo[k]) lo[k] = v;
          if (v > hi[k]) hi[k] = v;
        }
      }
      const extent = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
      const maxExtent = Math.max(extent[0], extent[1], extent[2], 1e-6);
      const effDims = extent.filter(e => e > maxExtent * 0.15).length;

      const targetRot = effDims >= 3 ? Math.PI / 4 : 0;
      const targetTilt = effDims >= 3 ? 0.6155 : 0;
      // A still has no later frames to ease over, so it snaps.
      const orientEase = animate ? 0.12 : 1;
      cam.rot += (targetRot - cam.rot) * orientEase;
      cam.tilt += (targetTilt - cam.tilt) * orientEase;

      // Scale/distance are always exactly proportional to the grid's current
      // size — recomputed directly every frame, not smoothed toward a target.
      // That matters for two reasons: (1) no lerp means nothing ever "chases"
      // a moving target, which is what read as unwanted drift; (2) being
      // exactly proportional means the camera can never fall behind the
      // grid's exponential physical growth, which a genuinely fixed distance
      // eventually does — that falling-behind is what looked like runaway
      // automatic zoom-in with no way to scroll back out. The user's zoom
      // level (scaleMult / distMult) is a stable multiplier riding on top,
      // changed only by scroll — never reset or overridden automatically.
      cam.dist = worldExtent * (cam.distMult || 1.5);
      // cam.scale is fit to the projected bounding box below (once every
      // node has been projected), so the zoom matches the actual on-screen
      // shape and the available width/height — see the fit step.

      const cx = w / 2, cy = h / 2;

      const projected = new Map();
      for (const [n, pos] of layout)
        projected.set(n, project(pos, cam.rot, cam.tilt, cam.dist || 1));

      // Where a boundary's stub points, in projected (pre-scale) space: at
      // its neighbour, or one lattice step along its bare outward direction.
      // The same two cases the renderer draws, so the box below is measured
      // against exactly what ends up on the canvas.
      const aims = (n: node, bd: Boundary) => {
        if (bd.target) return projected.get(bd.target.at.node);

        const wp = layout.get(n);
        if (!bd.outward || !wp) return undefined;

        return project(
          wp.map((v, i) => v + (bd.outward![i] || 0) * LATTICE_STEP),
          cam.rot, cam.tilt, cam.dist || 1,
        );
      };

      // Fit-to-viewport zoom: size the structure from its actual PROJECTED
      // extent against the available width and height. A horizontal line
      // fills the width, a flat plane fills the frame, and a sphere sits
      // inside the smaller dimension — each zoomed appropriately for its
      // shape rather than assumed spherical. Boundary stubs are measured
      // along with the nodes: the outward ones reach past the outermost node
      // by a quarter of a lattice step, which on a two-point universe is a
      // large fraction of the whole picture, and would otherwise hang off
      // the edge of the canvas.
      let loX = Infinity, hiX = -Infinity, loY = Infinity, hiY = -Infinity;
      const consider = (x: number, y: number) => {
        if (x < loX) loX = x;
        if (x > hiX) hiX = x;
        if (y < loY) loY = y;
        if (y > hiY) hiY = y;
      };
      for (const [n, p] of projected) {
        if (p.clipped || !graph.inFocus(n)) continue;
        consider(p.x, p.y);

        for (const ray of n) {
          for (const bd of ray.boundaries) {
            const t = aims(n, bd);
            if (!t || t.clipped) continue;
            consider(p.x + (t.x - p.x) * BOUNDARY_STUB, p.y + (t.y - p.y) * BOUNDARY_STUB);
          }
        }
      }
      if (loX > hiX) { loX = hiX = loY = hiY = 0; } // nothing survived clipping

      // The camera frames what is actually there, rather than the world
      // origin: the middle of that bounding box is what lands in the middle
      // of the canvas. A universe that has drifted off the origin — every
      // node merged onto one side, say — is still centred on screen instead
      // of clinging to an edge.
      const midX = (loX + hiX) / 2, midY = (loY + hiY) / 2;
      const halfX = Math.max((hiX - loX) / 2, 1e-6);
      const halfY = Math.max((hiY - loY) / 2, 1e-6);

      const FIT_MARGIN = 0.9; // small gap at the edges
      cam.scale = Math.min(
        (w * 0.5 * FIT_MARGIN) / halfX,
        (h * 0.5 * FIT_MARGIN) / halfY,
        // A single point has no extent to fit, and would otherwise ask for
        // an infinite zoom.
        Math.min(w, h) / LATTICE_STEP,
      ) * (cam.scaleMult || 1);

      // Projected space to canvas pixels. Everything drawn goes through this,
      // so the framing above holds for nodes, boundaries and the density
      // cloud alike.
      const place = (pr: { x: number, y: number, depth: number, clipped: boolean }) => ({
        x: cx + (pr.x - midX) * cam.scale,
        y: cy + (pr.y - midY) * cam.scale,
        depth: pr.depth,
        clipped: pr.clipped,
      });

      const pts = new Map();
      for (const [n, p] of projected) pts.set(n, place(p));

      // Screen position of an arbitrary world point, through the same camera
      // as the nodes — used for boundaries that point somewhere no node is.
      const screenOf = (world: Vec) =>
        place(project(world, cam.rot, cam.tilt, cam.dist || 1));

      // The seed of an expanding universe — the one cell at the origin.
      const isCenterNode = (nd: node) => {
        const g = graph.gridPos.get(nd);
        return !!g && g.every(v => v === 0);
      };

      // Viewport culling: skip the detailed rendering work (ray projection,
      // shadowBlur, stroke/fill calls) for anything clearly off-screen. Once
      // zoomed into part of a large structure, most of the population isn't
      // actually visible — this is what stops paying for it anyway. Margin
      // is generous (a couple of scale-units of screen space) so a node just
      // outside the canvas edge doesn't have its still-visible ray tip
      // prematurely clipped.
      const cullMargin = cam.scale * 2;
      const onScreen = (p: { x: number, y: number }) => p.x > -cullMargin && p.x < w + cullMargin && p.y > -cullMargin && p.y < h + cullMargin;

      // Connections — one faint line per boundary link (deduped), following
      // the actual graph structure, so merged and newly-created nodes read
      // correctly wherever they sit.
      //
      // In `field` mode this is the whole of how space is drawn, and it is
      // one path stroked once rather than a stroke per connection — a lattice
      // wired in every direction has too many of them for anything else. Only
      // the axis-aligned ones are taken: the diagonals are just as real, but
      // drawing all twenty-six through every point is a grey fill you can
      // read nothing off, where three lines through every point is a grid
      // whose bending is the thing worth seeing.
      // Faint enough to be the paper rather than the drawing: what the
      // lattice is here for is to be bent, and reading a bend needs only
      // enough of a grid to see it against.
      ctx.strokeStyle = field ? "rgba(124,136,176,0.05)" : "rgba(140,150,180,0.3)";
      ctx.lineWidth = field ? 1 : 2.2;
      const idxOf = new Map<node, number>();
      graph.nodes.forEach((nd, i) => idxOf.set(nd, i));

      if (field) ctx.beginPath();
      for (const nd of graph.nodes) {
        const a = pts.get(nd);
        if (!a || a.clipped) continue;

        // Outside the frame there is lattice nothing can reach — the edge
        // absorbs before anything gets there — so it is a few thousand
        // segments a frame drawn beyond the edge of the picture.
        if (field && !graph.inFocus(nd)) continue;

        for (const ray of nd) {
          for (const bd of ray.boundaries) {
            const other = bd.target?.at.node;
            if (!other || other === nd) continue;

            // Each connection drawn once, from its lower-numbered end. This
            // was a set of "ia-ib" strings, which on a lattice wired in
            // twenty-six directions is a couple of hundred thousand strings
            // built and hashed every frame to answer a question two integers
            // already answer.
            if (idxOf.get(nd)! > idxOf.get(other)!) continue;

            const b = pts.get(other);
            if (!b || b.clipped) continue;
            if (!onScreen(a) && !onScreen(b)) continue;

            if (field) {
              const from = graph.gridPos.get(nd), to = graph.gridPos.get(other);
              if (!from || !to) continue;

              // One step, along an axis. Anything longer is a connection that
              // has closed up over space that was annihilated out from
              // between its two ends — real, and the reason the two ends are
              // now near each other, but it is not an event and must not look
              // like one. They accumulate: every cancellation there has ever
              // been leaves one behind, permanently, so marking them out puts
              // a growing web of bright lines over the picture that reads as
              // things happening everywhere at once and never stopping.
              //
              // What they do is already visible without drawing them, because
              // the layout is solved against them (`relaxedLayout`): they pull
              // their ends together, and that pulling IS the attraction. So
              // they are left to act rather than shown acting.
              const off = from.map((v, i) => to[i] - v);
              if (off.filter(v => v !== 0).length !== 1) continue;
              if (Math.max(...off.map(Math.abs)) > 1) continue;

              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              continue;
            }

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (field) ctx.stroke();

      // Gravity-flow density cloud — the warm glow that fills the dense
      // core. A continuous scalar potential sampled on a real 3D grid,
      // colored on a dark→purple→orange→white ramp and blended additively
      // so overlapping samples read as one smooth glow. Fully world-space:
      // every sample is a real coordinate run through the same camera as
      // the nodes, so it navigates identically.
      const sources: { pos: Vec; sign: number; w: number }[] = [];
      for (const nd of density ? graph.nodes : []) {
        const mv = nd[0] && nd[0].moving;
        if (!mv) continue;
        const wpos = layout.get(nd);
        if (!wpos) continue;
        // Positive polarity glows one way, Negative the other; neutral space
        // contributes nothing to pull against.
        if (mv.polarity === Polarity.Neutral) continue;
        sources.push({ pos: wpos, sign: mv.polarity === Polarity.Positive ? 1 : -1, w: 1 });
      }
      const MAX_SOURCES = 220;
      if (sources.length > MAX_SOURCES) {
        sources.sort((x, y) => y.w - x.w);
        sources.length = MAX_SOURCES;
      }

      if (sources.length > 0) {
        const SOFTEN_SQ = (0.6 * worldExtent) ** 2 * 0.02 + 0.04;
        const gridExtent = worldExtent * 1.05;
        const RES = 7;
        const stepG = (gridExtent * 2) / RES;
        const depthStackCompensation = 1 / (RES * 0.45);

        const densityColor = (t: number, alpha: number) => {
          t = Math.min(Math.max(t, 0), 1);
          let r: number, g: number, b: number;
          if (t < 0.4) { const u = t / 0.4; r = u * 60; g = u * 20; b = u * 70; }
          else if (t < 0.75) { const u = (t - 0.4) / 0.35; r = 60 + u * 195; g = 20 + u * 95; b = 70 - u * 30; }
          else { const u = (t - 0.75) / 0.25; r = 255; g = 115 + u * 140; b = 40 + u * 215; }
          return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
        };

        const samples: { pos: Vec; mag: number }[] = [];
        let maxMag = 0;
        const sp: number[] = new Array(3);
        const build = (axis: number) => {
          if (axis === 3) {
            let potential = 0;
            for (const src of sources) {
              let distSq = SOFTEN_SQ;
              for (let k = 0; k < 3; k++) distSq += (src.pos[k] - sp[k]) ** 2;
              potential += (src.w * src.sign) / distSq;
            }
            const mag = Math.max(potential, 0);
            if (mag > maxMag) maxMag = mag;
            samples.push({ pos: sp.slice(), mag });
            return;
          }
          for (let i = 0; i < RES; i++) { sp[axis] = -gridExtent + i * stepG + stepG / 2; build(axis + 1); }
        };
        build(0);

        const withDepth = samples
          .map(s => ({ s, proj: project(s.pos, cam.rot, cam.tilt, cam.dist || 1) }))
          .filter(x => !x.proj.clipped);
        withDepth.sort((x, y) => y.proj.depth - x.proj.depth);

        const prevComposite = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "lighter";
        for (const { s, proj } of withDepth) {
          const { x, y } = place(proj);
          if (!onScreen({ x, y })) continue;
          const depthFactor = Math.min(Math.max(proj.depth, 0.3), 1.8);
          const norm = maxMag > 0 ? Math.min(s.mag / maxMag, 1) : 0;
          if (norm < 0.015) continue;
          const radius = (stepG * cam.scale * 0.9 + norm * cam.scale * 0.5) * depthFactor;
          if (radius < 1.5) continue;
          const alpha = Math.min(0.05 + norm * 0.35, 0.4) * Math.min(depthFactor, 1) * depthStackCompensation;
          const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
          grad.addColorStop(0, densityColor(norm, alpha));
          grad.addColorStop(1, densityColor(norm, 0));
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = prevComposite;
      }

      /**
       * The way from one source to the other, as it currently runs.
       *
       * Two sources that have eaten the space between them end up one step
       * apart along ONE route, and as far apart as they ever were along every
       * other — because what a pulse meeting a pulse destroys is a line, not
       * a region. That structure has no faithful drawing in three dimensions:
       * asked to put two points both next to each other and far apart, a
       * layout can only compromise, and that compromise is the dimple you see
       * instead of two things arriving.
       *
       * So the closeness is drawn as what it actually is — the chain of
       * points you would have to pass through to get from one source to the
       * other. Long and wandering to begin with, a short bright link between
       * two neighbours by the end. That shortening IS the attraction, and it
       * is visible here whether or not the two are ever drawn near each
       * other.
       */
      if (field && graph.route.length > 1) {
        const chain = graph.route
          .map(nd => pts.get(nd))
          .filter(p => p && !p.clipped) as { x: number, y: number }[];

        if (chain.length > 1) {
          ctx.strokeStyle = rgba(HALO, 0.45);
          ctx.lineWidth = 2.4;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(chain[0].x, chain[0].y);
          for (let i = 1; i < chain.length; i++) ctx.lineTo(chain[i].x, chain[i].y);
          ctx.stroke();

          ctx.fillStyle = rgba(SOURCE, 0.8);
          for (const p of chain) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.lineCap = "butt";
        }
      }

      /**
       * One surface per pulse: the shells as they were drawn before.
       *
       * Each emission is taken on its own and given the outline that encloses
       * it — split by charge as well as by pulse, because a source with poles
       * throws opposite charges out of its two halves in the same breath and
       * collecting them together loses the fact that it has sides at all.
       *
       * Not drawn as circles: the outline is taken from where the charges
       * actually are, so a shell crossing space that has been eaten comes out
       * dented, which is the thing worth seeing in the examples where the two
       * magnets are pulling on each other.
       */
      if (field && !contours) {
        const waves = new Map<string, {
          at: { x: number, y: number }[], depth: number, out: number, polarity: Polarity,
        }>();

        for (const nd of graph.nodes) {
          if (!graph.inFocus(nd)) continue;

          for (const ray of nd) {
            if (ray.magnet || !ray.moving || ray.wave === undefined) continue;
            if (ray.moving.polarity === Polarity.Neutral) continue;

            const p = pts.get(nd);
            if (!p || p.clipped) continue;

            const key = `${ray.wave}|${ray.moving.polarity}`;

            let wave = waves.get(key);
            if (!wave) waves.set(key, wave = {
              at: [], depth: 0, out: 0, polarity: ray.moving.polarity,
            });

            wave.at.push({ x: p.x, y: p.y });
            wave.depth += p.depth;

            const wp = layout.get(nd);
            if (wp) wave.out += Math.hypot(...wp) / ((graph.focus ?? 12) * LATTICE_STEP);

            break;
          }
        }

        const shells = [...waves.values()]
          .filter(wave => wave.at.length >= 3)
          .map(wave => ({
            hull: outline(wave.at),
            depth: wave.depth / wave.at.length,
            out: Math.min(wave.out / wave.at.length, 1),
            polarity: wave.polarity,
          }))
          .filter(shell => shell.hull.length >= 3)
          // Far ones first, so a near shell reads as in front of one behind
          // it rather than the two adding up.
          .sort((a, b) => b.depth - a.depth);

        const prev = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "lighter";

        for (const shell of shells) {
          const tint = channels(tintOf(shell.polarity));
          const h = shell.hull;
          const at = (i: number) => h[(i % h.length + h.length) % h.length];

          // A smooth closed curve rather than the corners it was computed
          // from: the straight lines between them are an artefact of there
          // being finitely many charges, and drawing those claims the shell
          // has facets and edges, which nothing supports.
          ctx.beginPath();
          ctx.moveTo(h[0].x, h[0].y);

          for (let i = 0; i < h.length; i++) {
            const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);

            ctx.bezierCurveTo(
              p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
              p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
              p2.x, p2.y,
            );
          }

          ctx.closePath();

          // Bright where it was emitted, faint by the time it is far out — a
          // wave spreading the same charge over a larger and larger surface.
          const lift = Math.max(1 - shell.out, 0);
          const fade = 0.1 + lift * lift * 0.9;

          ctx.fillStyle = `rgba(${tint},${0.06 * fade})`;
          ctx.fill();

          ctx.strokeStyle = `rgba(${tint},${0.55 * fade})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        ctx.globalCompositeOperation = prev;
      }

      /**
       * ONE of two ways of drawing the same charges, and they answer
       * different questions.
       *
       * `shells` draws each pulse: one surface per emission, so what you see
       * is the source letting go of shell after shell and each of them
       * travelling. It is the honest picture of a thing that emits, and for a
       * source that only flips over it is the whole story, since every shell
       * is the same in every direction and there is nothing else to say about
       * one.
       *
       * `field` draws what the pulses add up to: the region where the field
       * is one charge and the region where it is the other, with the boundary
       * between them. For a source that TURNS, that is the only way to see
       * what it is doing — a turning source lays down a spiral, and a spiral
       * is a property of a whole train of shells and of none of them
       * separately. Drawn shell by shell it is a stack of lobes, and the
       * winding they make is nowhere in the picture.
       *
       * Two surfaces. Not two hundred.
       *
       * A charge at distance r in direction θ left r cells ago, when the
       * magnet's north pole pointed at α − ωr rather than at α. So its sign
       * depends on θ − ωr: the positive charges are one Archimedean spiral
       * winding out from the source, and the negative ones fill exactly the
       * gaps between its turns. One body each, connected from the middle to
       * the edge, and neither is ever where the other is.
       *
       * Drawing per pulse guarantees the one thing that must not happen. A
       * pulse is a ring, so a picture made of pulses is a stack of rings
       * lying across one another — when what is actually there is two
       * interleaved spirals that never cross at all.
       *
       * So the outline is still an outline, drawn exactly as the shells were:
       * a smooth closed curve, barely filled, its own colour at the edge,
       * fading with distance. What changed is what it goes round. Instead of
       * enclosing the charges of one pulse, it follows the edge of the region
       * where the field has that sign — which is found by reconstructing the
       * field from the charges and walking the line along which it crosses.
       * The result is one curve per body rather than one per pulse, it is
       * shaped like the body (so it winds, because the body winds), and two
       * of them can no more overlap than a place can be both positive and
       * negative.
       */
      if (contours) {
        const CELL = 4;                                 // pixels per sample
        const cols = Math.max(Math.ceil(w / CELL), 1);
        const rows = Math.max(Math.ceil(h / CELL), 1);

        const sum = new Float32Array(cols * rows);
        const weight = new Float32Array(cols * rows);
        const near = new Float32Array(cols * rows);
        const cut = new Float32Array(cols * rows);

        /**
         * The average over a square neighbourhood, however wide, for the
         * price of one.
         *
         * A running total gives every sample the mean over its whole
         * neighbourhood in one pass per axis, where a diffusion of the same
         * width costs passes going as the square of it. It is a cruder shape
         * of average than the smoothing the picture is drawn from, and it is
         * used only where nothing is drawn from it — spreading the directions
         * the charges are travelling in, and deciding how hard to press. Both
         * are decisions about the field rather than the field, and there is
         * no such thing as a square edge on a decision.
         */
        const scratch = new Float32Array(cols * rows);

        const box = (a: Float32Array, r: number) => {
          const clampX = (x: number) => Math.min(Math.max(x, 0), cols - 1);
          const clampY = (y: number) => Math.min(Math.max(y, 0), rows - 1);
          const n = 2 * r + 1;

          for (let y = 0; y < rows; y++) {
            const row = y * cols;
            let acc = 0;

            for (let x = -r; x <= r; x++) acc += a[row + clampX(x)];

            for (let x = 0; x < cols; x++) {
              scratch[row + x] = acc / n;
              acc += a[row + clampX(x + r + 1)] - a[row + clampX(x - r)];
            }
          }

          for (let x = 0; x < cols; x++) {
            let acc = 0;

            for (let y = -r; y <= r; y++) acc += scratch[clampY(y) * cols + x];

            for (let y = 0; y < rows; y++) {
              a[y * cols + x] = acc / n;
              acc += scratch[clampY(y + r + 1) * cols + x] - scratch[clampY(y - r) * cols + x];
            }
          }
        };

        /**
         * How far one charge speaks for, and it is bounded on both sides.
         *
         * Too small and the charges never meet: the region comes apart into
         * one little ring per charge, which is the picture of points that
         * keeps coming back. Too large and a band bleeds into the next band
         * round, the alternation averages itself away, and there is one grey
         * body instead of two winding ones.
         *
         * The right size is set by the winding itself, and the winding here
         * is the one `every: undefined` above settles on: a shell leaves
         * every tick, the wave advances a cell a tick, and the source comes
         * round an eighth of a turn in between. So a whole turn is CYCLE
         * cells out from the source and a band of one sign is half of that —
         * four cells thick, with four cells of the other sign beyond it.
         */
        const step = cam.scale * LATTICE_STEP;          // pixels per cell
        const band = (CYCLE / 2) * step / CELL;         // samples across one band

        /**
         * And it reaches much further across a charge's path than along it.
         *
         * A round reach has to be a compromise between two things that want
         * opposite sizes. The holes to be closed are the gaps between charges
         * of one shell, which open up as the shell grows and are the reason
         * the arcs come out as strings of islands; closing them wants a
         * generous reach. What must not be closed is the gap between one
         * shell and the next, which is where the alternation lives, since a
         * shell four along is the opposite charge; keeping that wants a mean
         * one. Round, there is no size that does both, and the picture is
         * either beads or porridge.
         *
         * But the two gaps are not in the same direction, and the direction
         * that tells them apart is the one the charges are travelling in. A
         * shell is spread out ACROSS its own motion — every part of it left
         * together and is the same age and the same charge — and the next
         * shell is one cell AHEAD. So the reach is an ellipse laid across the
         * path: long the way the shell runs, short the way it is going.
         * Nothing is invented by this. It is a statement about which charges
         * are neighbours, and a charge's neighbours are the ones off its
         * shoulders rather than the one in front.
         *
         * The short axis is the delicate one, and it is why merging with any
         * generosity in the direction of travel was wrong. Four shells make
         * one band, so a reach of much over a cell forward joins a charge to
         * shells that are still its own sign, which is wanted; a reach of
         * four joins it to the opposite one, which averages the alternation
         * away and is how a set of arcs turns into a disc.
         *
         * A cell, then, and not a cell and a half. Every fraction past the
         * spacing between two shells is spent averaging a band against the
         * one beyond it, and that cost is paid over the whole width of the
         * seam rather than at the seam: a reach of a cell and a half puts
         * three cells of a four-cell band within sight of the other charge
         * and there is very little of it left reading as wholly one thing. At
         * exactly the spacing the shells of a band still touch — which is all
         * that is needed for it to be one body, the closing along each shell
         * being what actually mends it — and a charge's reach stops dead
         * before anything of the other sign.
         */
        const across = Math.max(band / 4.5, 1.2);           // the way it is going
        const along = Math.max(band * 1.15, across * 3);    // the way it is spread

        // Where each source is on the screen, which is what "out from it"
        // means. Anything with no source of its own is measured from the
        // middle of the picture.
        const origin = new Map<number, { x: number, y: number }>();

        for (const nd of graph.nodes) {
          for (const ray of nd) {
            if (!ray.magnet || ray.source === undefined) continue;

            const p = pts.get(nd);
            if (p && !p.clipped) origin.set(ray.source, { x: p.x, y: p.y });
          }
        }

        // How far out each part of the picture is from the nearest source,
        // and which way that is — the fallback frame, for the places no
        // charge has an opinion about.
        const outX = new Float32Array(cols * rows);
        const outY = new Float32Array(cols * rows);
        const rad = new Float32Array(cols * rows);

        {
          const from = origin.size
            ? [...origin.values()].map(p => ({ x: p.x / CELL, y: p.y / CELL }))
            : [{ x: cols / 2, y: rows / 2 }];

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              let dx = 1, dy = 0, len = Infinity;

              for (const s of from) {
                const ex = x - s.x, ey = y - s.y;
                const d = Math.hypot(ex, ey);

                if (d < len) { len = d; dx = ex; dy = ey; }
              }

              const i = y * cols + x;

              rad[i] = len;

              if (len > 1e-6) { outX[i] = dx / len; outY[i] = dy / len; }
              else { outX[i] = 1; outY[i] = 0; }
            }
          }
        }

        /**
         * Which way the field runs, taken from the charges rather than
         * supposed of them.
         *
         * Everything here that closes a gap or opens one needs to know which
         * way the thing it is working on lies — the kernel, so it can be an
         * ellipse; the smoothing and the bridging, so they run along a body
         * and not across one; the sharpening, so it cuts between two and not
         * through the middle of either.
         *
         * And the answer is not a shape to be assumed. Supposing the bodies
         * are rings and merging round the source draws rings; supposing they
         * are spirals of a particular pitch and merging along that draws
         * those. Both are the picture telling you what it was told. Worse,
         * merging the way the charges are GOING joins each one to the one in
         * front of it, which is the one that left a tick earlier — so a band
         * gets knitted together from the inside out, across the very
         * direction its polarity alternates in, and the alternation is what
         * gets averaged away.
         *
         * What a charge is actually beside is what left with it. A shell is
         * one emission, every part of it the same age and the same charge,
         * and it is spread out ACROSS the way it travels — so the neighbours
         * of a charge are the ones off its shoulders, and the thing in front
         * of it is a different shell of possibly the other sign. Merge
         * orthogonal to the motion and each shell closes into the arc it is;
         * a source that only flips gives rings, a source that turns gives
         * arcs each rotated from the last, which is a spiral. Neither is
         * imposed. Both come out of the same rule, which is a statement about
         * which charges are neighbours and says nothing about shape.
         *
         * Kept as a doubled angle so it can be averaged at all. These are
         * lines rather than arrows — a charge going one way and a charge
         * coming back lie along the same line and belong together — and
         * averaging arrows would have the two cancel to nothing exactly where
         * two shells meet. Doubling the angle makes opposites identical,
         * which is what they are here, and halving it back afterwards
         * recovers the line.
         */
        const spinA = new Float32Array(cols * rows);   // cos of the doubled angle
        const spinB = new Float32Array(cols * rows);   // sin of it
        const spinW = new Float32Array(cols * rows);

        const runX = new Float32Array(cols * rows);
        const runY = new Float32Array(cols * rows);

        for (const nd of graph.nodes) {
          if (!graph.inFocus(nd)) continue;

          for (const ray of nd) {
            if (ray.magnet || !ray.moving) continue;
            if (ray.moving.polarity === Polarity.Neutral) continue;

            const p = pts.get(nd);
            if (!p || p.clipped) continue;

            const cx = p.x / CELL, cy = p.y / CELL;
            const sign = ray.moving.polarity === Polarity.Positive ? 1 : -1;

            const wp = layout.get(nd);
            const out = wp
              ? Math.min(Math.hypot(...wp) / ((graph.focus ?? 12) * LATTICE_STEP), 1)
              : 0;

            // How far out it is, which is only used to keep the reach inside
            // the arc there is to reach along.
            const from = origin.get(ray.source ?? 0);
            let ox = from ? cx - from.x / CELL : 0;
            let oy = from ? cy - from.y / CELL : 0;
            const len = Math.hypot(ox, oy);

            if (len > 1e-6) { ox /= len; oy /= len; } else { ox = 1; oy = 0; }

            /**
             * And which way it is going, on the screen, which is the one
             * thing the ellipse is oriented by.
             *
             * `heading` first: that is the direction in the large, and a step
             * is only this tick's piece of it. Where there is no heading —
             * nothing wanders in these examples, so most of the time — the
             * step and the direction are the same thing and the point ahead
             * says it exactly.
             *
             * Projected rather than taken from the lattice, because what is
             * being drawn is the screen. A charge travelling straight at the
             * camera has no direction in the picture at all, and its shell is
             * a face-on ring around it there; the projection says so by
             * coming out at nothing, and the fallback is the frame from the
             * source, which is that ring.
             */
            let mx = 0, my = 0;

            if (wp && ray.heading) {
              const t = screenOf(wp.map((v, i) => v + (ray.heading![i] || 0) * LATTICE_STEP));

              mx = t.x - p.x; my = t.y - p.y;
            }

            if (mx === 0 && my === 0 && ray.moving.target) {
              const q = pts.get(ray.moving.target.at.node);

              if (q && !q.clipped) { mx = q.x - p.x; my = q.y - p.y; }
            }

            const ml = Math.hypot(mx, my);

            // Across the way it is going: the shoulders of its own shell.
            let rx: number, ry: number;

            if (ml > 1e-3) { rx = -my / ml; ry = mx / ml; }
            else { rx = -oy; ry = ox; }

            // Which is then remembered, so that the places between the
            // charges can be given the same answer as the charges around
            // them. See the doubled angle above.
            {
              const i0 = Math.min(Math.max(Math.round(cy), 0), rows - 1) * cols
                + Math.min(Math.max(Math.round(cx), 0), cols - 1);

              spinA[i0] += rx * rx - ry * ry;
              spinB[i0] += 2 * rx * ry;
              spinW[i0] += 1;
            }

            /**
             * And it reaches no further along than there is arc to reach
             * along.
             *
             * A band covers half a turn, so at radius r it is about πr long,
             * and at one or two cells out that is shorter than the reach
             * itself. Sweeping the full ellipse there does not join a shell
             * to itself, it joins it right round to the next one — which is
             * the opposite charge, and the two average away into the grey
             * disc that the middle of these pictures kept coming out as.
             *
             * So the long axis is held to the arc it is supposed to be lying
             * on. Far out that is the reach as given; close in it shrinks
             * with the radius until the ellipse is barely longer than it is
             * wide, which is right — near the source there are no gaps to
             * close, the charges are on top of each other.
             */
            const reach = Math.max(Math.min(along, len * 0.8), across);
            const span = Math.ceil(reach);

            for (let y = Math.max(Math.floor(cy - span), 0); y <= Math.min(Math.ceil(cy + span), rows - 1); y++) {
              for (let x = Math.max(Math.floor(cx - span), 0); x <= Math.min(Math.ceil(cx + span), cols - 1); x++) {
                const dx = x - cx, dy = y - cy;

                // Split into how far along the arm and how far off it, and
                // measure each against its own reach.
                const round2 = dx * rx + dy * ry;
                const out2 = dx * -ry + dy * rx;

                const d = Math.hypot(out2 / across, round2 / reach);
                if (d >= 1) continue;

                // Smooth to nothing at the edge of its reach, so no charge
                // leaves a rim of its own in the field.
                const k = (1 - d * d) ** 2;
                const i = y * cols + x;

                sum[i] += sign * k;
                weight[i] += k;
                if (1 - out > near[i]) near[i] = 1 - out;
              }
            }

            /**
             * Two charges moving into each other are never one thing.
             *
             * They are about to meet — next tick they cancel, or they turn
             * each other round — and the whole meaning of that is that they
             * came from different places and are arriving at each other. A
             * body cannot be approaching itself. Yet nothing said so: the
             * field is built from where charges are and not from where they
             * are going, so two shells closing on one another read as one
             * thick region of the same charge, with the interface that is
             * about to be an event drawn straight through its middle as if it
             * were the inside of something.
             *
             * So the place between them is cut. Where a charge is moving into
             * a point that holds a charge coming back at it, the field is
             * held to nothing along the line between the two — and a boundary
             * is what gets drawn there, which is what puts them in different
             * islands and keeps them there right up until the tick where they
             * resolve.
             */
            const ahead = ray.moving.target?.at.node;

            if (ahead && ahead !== nd
              && ahead.some(x => x.moving?.target?.at.node === nd)) {
              const q = pts.get(ahead);

              if (q && !q.clipped) {
                const mx = (p.x + q.x) / 2 / CELL, my = (p.y + q.y) / 2 / CELL;

                /**
                 * And what is put there is a seam, not a bite.
                 *
                 * The thing between two charges arriving at each other is an
                 * interface — it has the two of them on either side of it and
                 * it extends sideways, the way the two fronts do. Marked with
                 * a disc instead, it takes a round hole out of whichever band
                 * the pair happen to be sitting in, and a band with a dozen
                 * such pairs along it is a band with a dozen holes punched
                 * through it: the arm falls apart into the pieces between
                 * them, and the pieces read as islands.
                 *
                 * Thin the way they are approaching and wide the way they are
                 * not, it does the one thing it was for — the two of them end
                 * up on opposite sides of a line — and it does not cost the
                 * arm its continuity to do it.
                 */
                let jx = q.x - p.x, jy = q.y - p.y;
                const jl = Math.hypot(jx, jy) || 1;

                jx /= jl; jy /= jl;

                const thin = Math.max(across / 4, 0.8);
                const broad = Math.max(across, 2);
                const bite = Math.ceil(broad);

                for (let y = Math.max(Math.floor(my - bite), 0); y <= Math.min(Math.ceil(my + bite), rows - 1); y++) {
                  for (let x = Math.max(Math.floor(mx - bite), 0); x <= Math.min(Math.ceil(mx + bite), cols - 1); x++) {
                    const ex = x - mx, ey = y - my;

                    const d = Math.hypot(
                      (ex * jx + ey * jy) / thin,
                      (ex * -jy + ey * jx) / broad,
                    );
                    if (d >= 1) continue;

                    const k = (1 - d * d) ** 2;
                    const i = y * cols + x;

                    if (k > cut[i]) cut[i] = k;
                  }
                }
              }
            }

            break; // one sample per point, however many rays are on it
          }
        }

        /**
         * And spread out over the places between them, so that the frame is
         * something the whole picture has rather than something only the
         * charges have.
         *
         * Averaged over about the width one charge speaks for, which is the
         * distance at which two charges are meant to be part of the same
         * thing anyway. Where a shell runs, its own members all say the same
         * and the average is that; where two shells cross, they disagree and
         * it comes out short, which is exactly a place with no one direction
         * to it and is treated as one.
         */
        {
          // Wide enough to have an answer in the gaps, which is where it is
          // wanted: a place with no charge in it is the very place that needs
          // to be told which way the thing running through it lies.
          const smear = Math.max(Math.round(along * 0.6), 2);

          box(spinA, smear);
          box(spinB, smear);
          box(spinW, smear);

          for (let i = 0; i < runX.length; i++) {
            const mag = Math.hypot(spinA[i], spinB[i]);

            // Nothing said anything here, or what was said cancelled out.
            // Both are the same answer: fall back to the shape of a shell
            // around the nearest source, which is what a place with no
            // direction of its own is nearest to being part of.
            if (spinW[i] < 1e-4 || mag < spinW[i] * 0.15) {
              runX[i] = -outY[i]; runY[i] = outX[i];
              continue;
            }

            const a = 0.5 * Math.atan2(spinB[i], spinA[i]);

            runX[i] = Math.cos(a); runY[i] = Math.sin(a);
          }
        }

        /**
         * How positive or negative each part of the picture is: +1 well
         * inside an amber band, −1 well inside a cyan one, and nothing where
         * no charge reaches or where the two meet.
         *
         * Divided by a little more than the weight actually there, which is
         * the difference between how positive a place is and how sure of it
         * the picture can be. Dividing by the weight exactly says a place
         * with one charge in it is as wholly positive as a place with twenty
         * — so a charge that has come adrift from everything, out ahead of
         * its shell or left behind by it, reads at full strength and is
         * traced as a little closed body of its own. Every one of those is an
         * island, and they are the ones with nothing in them.
         *
         * The extra in the divisor is worth about a charge's own weight. One
         * charge on its own then reads at a third of what a band reads, which
         * is under the level anything is traced at, and it goes back to being
         * what it is: a faint mark in the field rather than a body. Nothing
         * is thrown away — twenty of them together still read as twenty, and
         * a thin arm far out is still an arm. It is a preference for what is
         * supported over what is isolated, applied to the reading rather than
         * to the drawing.
         */
        const trust = 0.9;

        const target = new Float32Array(cols * rows);
        const known = new Uint8Array(cols * rows);

        for (let i = 0; i < target.length; i++) {
          if (weight[i] <= 0) continue;

          target[i] = Math.max(Math.min(sum[i] / (weight[i] + trust), 1), -1);
          known[i] = 1;
        }

        /**
         * Places no charge reached take the value their surroundings imply.
         *
         * A charge is a sample of the field, not the extent of it. Where two
         * of them happen to fall a little far apart the reading in between is
         * not "no field" — it is a place nothing was measured, and treating
         * unmeasured as zero puts a boundary through the middle of a band
         * wherever the sampling thinned. That is what the holes in the arms
         * are: not gaps in the field, gaps in the record of it.
         *
         * So a value is grown into them from their edges, a ring at a time,
         * and each takes the average of whatever is already known beside it.
         * Somewhere with amber on all sides fills in amber, and the band
         * closes; somewhere between amber and cyan fills in with what is
         * between them, which is nothing, and the boundary stays exactly
         * where it was. Only a few rings of it, so a genuinely empty part of
         * the world stays empty rather than being papered over.
         */
        /**
         * And pressed a good deal further than a few rings, at the price of
         * getting stricter about what counts as a gap.
         *
         * The two things it must not do are grow a band outwards into the
         * empty space past the wavefront, and grow one band into the next.
         * The second is already handled — disagreeing neighbours are refused
         * below — and the first is what the small number of passes was really
         * buying: an edge grows one ring per pass just as a hole fills one
         * ring per pass, so the only thing keeping the outside of the picture
         * from creeping outwards was stopping early, which also stopped every
         * hole halfway through being mended.
         *
         * Told apart instead of traded off. A place inside a hole has known
         * neighbours nearly all round it; a place just outside the edge of
         * something has them on one side only. So the first few passes take
         * anything with two — that is a crack one sample wide, and closing
         * those is most of what closing is — and every pass after that wants
         * three of four, which a hole has and an edge never does. Then the
         * filling can run until it has nothing left to fill.
         */
        for (let pass = 0; pass < 16; pass++) {
          const grown: [number, number][] = [];
          const need = pass < 3 ? 2 : 3;

          for (let y = 1; y + 1 < rows; y++) {
            for (let x = 1; x + 1 < cols; x++) {
              const i = y * cols + x;
              if (known[i]) continue;

              let total = 0, n = 0, warm = 0, cold = 0;

              for (const j of [i - 1, i + 1, i - cols, i + cols]) {
                if (!known[j]) continue;

                total += target[j];
                n++;

                if (target[j] > 0.05) warm++;
                else if (target[j] < -0.05) cold++;
              }

              /**
               * Filled only where its surroundings agree.
               *
               * Averaging whatever is beside it is right in the middle of a
               * band and wrong on the edge of one. A place with amber on one
               * side and cyan on the other is not a hole in either — it is
               * the seam between them, and filling it with the average is
               * filling it with something halfway, which is a step towards
               * one band and the next one out becoming a single band. Enough
               * of those and the layers close up into each other and the
               * winding goes.
               *
               * So a gap is only closed from the inside. Where the known
               * neighbours are all of one charge it fills with that charge
               * and the band mends; where they disagree it is left as it is,
               * because what is there is a boundary and a boundary is
               * supposed to be empty.
               */
              if (warm && cold) continue;

              if (n >= need) grown.push([i, total / n]);
            }
          }

          if (!grown.length) break;

          // All of them at once, so a ring fills from the ring outside it
          // rather than from itself half-filled.
          for (const [i, v] of grown) { target[i] = v; known[i] = 1; }
        }

        /**
         * Eased from the last frame rather than replaced.
         *
         * The world only changes on a tick, and a tick is a whole cell — a
         * charge is here, and then it is a cell further out, with nothing in
         * between because there is nothing in between to be in. Drawn
         * directly, the picture stands still for a fifth of a second and then
         * jumps, which is honest about the model and awful to watch: the eye
         * reads the jump instead of the movement.
         *
         * The FIELD, though, is a continuous quantity — how positive a place
         * is — and there is nothing wrong with a place becoming more positive
         * gradually. So the drawn field walks towards the true one a fraction
         * each frame instead of arriving at it at once. A band that moves one
         * cell out fades out of where it was and into where it has got to,
         * and what you see is the wave travelling rather than a slideshow of
         * where it has been.
         *
         * It is a property of the drawing and not of the model. Nothing here
         * is fed back into the dynamics, and a still of any frame is the same
         * picture the unsmoothed version would have reached a moment later.
         */
        if (!eased || eased.length !== target.length) eased = target.slice();
        else for (let i = 0; i < eased.length; i++)
          eased[i] += (target[i] - eased[i]) * 0.2;

        /**
         * And smoothed along itself before anything is traced from it.
         *
         * The field is built by dropping a kernel at every charge, so it
         * carries the charges in it: little bumps where one landed, little
         * dips between two, all at the scale of a single lattice cell. A line
         * traced through that follows every one of them, and the arm comes
         * out scalloped — which is not the shape of the arm, it is the shape
         * of the fact that it was measured at points.
         *
         * A few passes of each sample settling towards the ones on either
         * side of it takes that out. Which two are "on either side" is the
         * whole question, and it is the same answer as everywhere else here:
         * the ones further along the band, not the ones further out from the
         * source. Settling towards the neighbours in every direction equally
         * pulls each band towards the two of the other sign it lies between,
         * so the alternation is worn down at exactly the rate the gaps in it
         * are closed, and there is no number of passes that gets one without
         * the other. Settling along the band only, the arm knits together
         * down its own length and nothing at all happens across it.
         *
         * That is the preference, in one line: a place takes after what
         * continues through it. A neck between two lumps of one arm has arm
         * on both sides along the way it runs and fills in; a speck with
         * nothing either side of it has nothing to take after and fades.
         * Neither is decided in advance — it is read off which way the thing
         * is going where it is.
         */
        // On a copy, never on the eased field itself: that one is carried
        // from frame to frame, and smoothing something that is then smoothed
        // again next frame is not a smoothing, it is a slow erasure — after a
        // few seconds there would be nothing left of the field at all.
        const f = eased.slice();

        // The field between its samples, so a step of a fraction of one is a
        // step rather than a rounding — the directions below are not the
        // grid's and almost never land on it.
        const sample = (a: Float32Array, x: number, y: number) => {
          const px = Math.min(Math.max(x, 0), cols - 1);
          const py = Math.min(Math.max(y, 0), rows - 1);

          const x0 = Math.floor(px), y0 = Math.floor(py);
          const x1 = Math.min(x0 + 1, cols - 1), y1 = Math.min(y0 + 1, rows - 1);
          const fx = px - x0, fy = py - y0;

          return (a[y0 * cols + x0] * (1 - fx) + a[y0 * cols + x1] * fx) * (1 - fy)
            + (a[y1 * cols + x0] * (1 - fx) + a[y1 * cols + x1] * fx) * fy;
        };

        // One pass of it, in whichever of the two directions is asked for.
        const drift = (a: Float32Array, passes: number, reach: number, round: boolean) => {
          const next = new Float32Array(a.length);

          for (let pass = 0; pass < passes; pass++) {
            for (let y = 0; y < rows; y++) {
              for (let x = 0; x < cols; x++) {
                const i = y * cols + x;

                // Held to the arm there is, close in, for the same reason the
                // kernel's long axis is.
                const r = round ? Math.min(reach, rad[i] * 0.5) : reach;

                const dx = (round ? runX[i] : -runY[i]) * r;
                const dy = (round ? runY[i] : runX[i]) * r;

                next[i] = (
                  a[i] * 2
                  + sample(a, x + dx, y + dy)
                  + sample(a, x - dx, y - dy)
                ) / 4;
              }
            }

            a.set(next);
          }

          return a;
        };

        drift(f, 10, 1.8, true);

        /**
         * Where the alternation actually is, before anything is done that
         * could cost some of it.
         *
         * Everything from here on is one of two opposite pressures. Closing a
         * gap wants a place to take after what is around it; keeping the
         * winding wants a place to stay unlike what is around it. Applied at
         * one strength everywhere, they are the beads-or-porridge choice
         * again in a different guise, and whichever is turned up wrecks the
         * half of the picture the other was for.
         *
         * But which of the two a place needs is a thing that can be looked
         * at. Somewhere in the body of a band has one charge all round it out
         * to the distance the bands repeat over; somewhere between two has
         * both, in comparable amounts. So: how much of each is nearby, and
         * how near they come to being equal.
         *
         * Measured on the field rather than assumed from the geometry, which
         * matters where the geometry is not the whole story — near a source,
         * where the arms have not separated yet, or out where two magnets'
         * fields have run into each other and the alternation is nothing so
         * tidy as one spiral's. Where there IS alternation it is protected,
         * wherever it came from and whichever way round it lies. Where there
         * is none, there is nothing to protect and the gaps can be closed as
         * hard as it takes.
         */
        const alt = new Float32Array(f.length);

        {
          const warm = new Float32Array(f.length);
          const cold = new Float32Array(f.length);

          for (let i = 0; i < f.length; i++) {
            warm[i] = Math.max(f[i], 0);
            cold[i] = Math.max(-f[i], 0);
          }

          // Out to most of the way to the next band, which is the scale the
          // question is being asked at. A cell either side finds alternation
          // only where the two are already touching; two thirds of a band
          // finds it while there is still something between them, which is
          // while there is still something to keep.
          const look = Math.max(Math.round(band / 2.2), 2);

          box(warm, look);
          box(cold, look);

          for (let i = 0; i < f.length; i++) {
            const lo = Math.min(warm[i], cold[i]);
            const hi = Math.max(warm[i], cold[i]);

            // Nothing at all nearby is not alternation; it is emptiness, and
            // emptiness gets closed like anything else.
            alt[i] = hi > 1e-3 ? Math.min((2 * lo) / (lo + hi) * 2.8, 1) : 0;
          }
        }

        /**
         * And then the gaps are bridged outright, rather than diffused shut.
         *
         * Smoothing along an arm closes a gap by moving what is on either
         * side of it into the middle, which means the middle ends up weaker
         * than either side — and a gap wide enough to be worth closing ends
         * up filled with something under the level anything is traced at. The
         * hole is smaller and blurrier and still a hole. Pushing the
         * smoothing harder to get through it takes the arm's own strength
         * down with it, because a diffusion cannot tell which of its
         * neighbours it is supposed to be taking after.
         *
         * A gap is not an average, though. It is a place where something
         * runs THROUGH — the arm arrives at one side of it and leaves from
         * the other — and that is a thing to test for rather than to hope
         * comes out of an average. So each place looks out along the band,
         * both ways at once, for a distance the same charge is found in both
         * directions, and takes the weaker of the two.
         *
         * Both ways at once is the whole of what makes it safe. A speck with
         * nothing either side of it finds nothing that agrees and is left as
         * it is; the far end of an arm finds arm behind it and empty space
         * ahead and is not extended past where it ends; a seam between two
         * bands has opposite signs across it and never had them along it, so
         * it is not something this can reach through. Only a place with the
         * same thing on both sides of it is filled, and a place with the same
         * thing on both sides of it is the inside of an arm.
         *
         * Taking the weaker end rather than the stronger keeps it honest: a
         * bridge is only ever as much as the thinner of the two things it
         * joins, so a wisp joined to a bright arm does not come out bright.
         *
         * And the looking stops at the first thing of the other charge it
         * meets, rather than running the whole way and asking about the far
         * end. That is the one way this could do damage — a stripe of the
         * other charge lying across the arm, with more arm beyond it, is two
         * things with something between them and not one thing with a gap in
         * it, and reaching over the stripe would paint it out. Stopped at it,
         * the two sides come back disagreeing and nothing happens. So the
         * alternation is not weighed against the closing here; it is simply
         * in the way of it, which is what alternation ought to be.
         */
        /**
         * And it is a preference for that direction, not a rule about it.
         *
         * A shell is not a perfect arc. It is a couple of dozen directions
         * off a lattice, fanning as they go and passing through space that
         * other charges have been eating, so the line through its members
         * wanders by some tens of degrees from the one thing perpendicular to
         * any one of them. Looking along a single exact direction, half the
         * gaps in it are at an angle to what is being looked down and are
         * missed — while looking down a wide fan of directions at once finds
         * the next shell as readily as its own, which is the merge along the
         * path that must not happen.
         *
         * So each pass looks slightly differently: straight across the path,
         * then a little to one side of that, then a little to the other. A
         * gap that lies square on is closed by the first and closed again by
         * the other two; one on a slant is closed by whichever pass is
         * pointing at it; nothing anywhere gets a look down the path itself,
         * which is off the end of the fan in both directions. Preference by
         * how much of the ink each direction gets, which is what a preference
         * is, rather than by which directions exist.
         */
        const bridge = (a: Float32Array, taps: number, reach: number, tilt: number) => {
          const next = a.slice();

          // What counts as something rather than as the tail of something.
          // Under the level anything is traced at, so a gap in an arm — which
          // is by definition below that level — is still a gap to be crossed
          // and not an obstacle to stop at.
          const lip = 0.07;

          // The strongest thing one way along the band, or whatever stopped
          // us getting to it, and how far off that was. Answered into these
          // rather than returned: it is called twice per sample of the
          // picture and a pair of objects a sample is a great many objects.
          let found = 0, at = 1;

          const seek = (x: number, y: number, dx: number, dy: number) => {
            found = 0; at = 1;

            for (let t = 1; t <= taps; t++) {
              const v = sample(a, x + dx * t, y + dy * t);

              if (found !== 0 && v * found < 0 && Math.abs(v) > lip) break;
              if (Math.abs(v) > Math.abs(found)) { found = v; at = t; }
            }
          };

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const i = y * cols + x;

              /**
               * Softened, though not stopped, where the alternation is thick.
               *
               * The frame is least trustworthy exactly where it matters most
               * — near a source, where the arms have not come apart yet, and
               * out where two magnets' fields have run into each other — and
               * there what lies "along" may well be the next band round. The
               * test above catches that whenever the other charge is actually
               * between the two, which is most of the time; this is for the
               * rest of it. Not a veto, because a thin arm has the other
               * charge close by on both sides of it by construction, and a
               * thin arm is exactly the thing with the worst gaps in it.
               */
              const room = 1 - alt[i] * 0.9;

              const r = Math.min(reach, Math.max(rad[i] * 0.5, 0.5));

              const c = Math.cos(tilt), sn = Math.sin(tilt);
              const dx = (runX[i] * c - runY[i] * sn) * r;
              const dy = (runX[i] * sn + runY[i] * c) * r;

              seek(x, y, dx, dy);
              const fv = found, fat = at;

              seek(x, y, -dx, -dy);
              const bv = found, bat = at;

              // Nothing runs through here.
              if (fv * bv <= 0) continue;

              const v = Math.abs(fv) < Math.abs(bv) ? fv : bv;

              // Already at least this much of it, or of the other charge and
              // meaning it — either way, not a gap.
              if (Math.abs(v) <= Math.abs(a[i])) continue;
              if (a[i] * v < 0 && Math.abs(a[i]) > lip) continue;

              // And reaching costs something, so a gap is closed by what is
              // just past it rather than by whatever is furthest away.
              const far = Math.max(fat, bat) / taps;

              next[i] = a[i] + (v * (1 - 0.22 * far) - a[i]) * room;
            }
          }

          return next;
        };

        // Twice, which is not the same as once with twice the reach: what the
        // first pass closes is arm by the time the second runs, so a run of
        // gaps with slivers between them mends from both ends inwards rather
        // than each gap having to be spanned in one go from whatever is left
        // either side of it.
        f.set(bridge(f, 9, 2.6, 0));
        f.set(bridge(f, 9, 2.6, 0.42));
        f.set(bridge(f, 9, 2.6, -0.42));

        /**
         * And the valley between two bands is deepened until it separates
         * them.
         *
         * Where an arm of one charge passes close to another arm of the same
         * charge, what lies between them is a thin band of the other — and
         * thin means weak, because the two sides of it are pulling the
         * average back towards themselves. If it is weak enough that the
         * field never quite crosses the level being traced, the two arms are
         * drawn as one: an island that is really two islands with a seam in
         * it that did not print.
         *
         * Comparing the field against a blurred copy of itself says exactly
         * where that is happening. A place in the middle of a wide band looks
         * like its own surroundings and the two agree; a place in a narrow
         * gap is much less positive than its surroundings, because its
         * surroundings are the arms on either side of it. Taking the
         * difference and pushing it back in leaves the middles of the bands
         * where they were and drives the gaps between them down through zero
         * — which is where a boundary is, so a boundary is what gets drawn,
         * and the two arms come apart into the two islands they are.
         *
         * Compared ACROSS itself, though, and not in the round. The gap that
         * wants deepening is the one between one turn of the spiral and the
         * next, and that is out from the source by construction. A round
         * comparison finds a second kind of thin place the arm has — the neck
         * where it happens to be narrow along its own length — and deepens
         * that one too, which cuts the arm in half. Every island this used to
         * make was made honestly, by a rule that could not tell the gap it
         * was for from the arm it was cutting.
         *
         * And turned up where there is alternation to keep and down where
         * there is not.
         *
         * Sharpening is a separator, and a separator applied where there is
         * nothing to separate has only one thing left to do: find whatever is
         * weakest in a body of one charge and drive it below the level, which
         * is a hole opened in the middle of something solid. That is the same
         * ink the bridge above just spent closing gaps, spent undoing it.
         *
         * Where the two charges genuinely lie against each other it is the
         * whole reason there are two shapes in the picture instead of one, so
         * there it goes harder than it did before. The two are not in
         * competition once they are asked separately.
         *
         * And hardest of all where the change is ALONG the way the charges
         * are going, which is the other half of the same preference the
         * bridging is the first half of.
         *
         * A shell alternates with the shells in front of it and behind it,
         * because those are the ones thrown off a moment earlier and a moment
         * later, when the source was pointing somewhere else or had turned
         * over. It does not alternate with itself. So a change of charge
         * encountered by going along the path is the real thing, worth
         * driving apart until it separates; one encountered by going across
         * the path — round the shell — is more likely to be two arcs at
         * different radii happening to pass, or the edge of a gap, and
         * sharpening it is how a ring gets cut into beads.
         *
         * Which of the two it is, is the direction the field changes in,
         * against the direction the charges here are travelling in. Squared,
         * so it falls away smoothly rather than at some angle, and floored,
         * because none of this is exact: a shell is a couple of dozen lattice
         * directions and a change square across the path is only ever
         * approximately square across it.
         */
        const wide = drift(f.slice(), 12, 2.0, false);
        const before = f.slice();

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = y * cols + x;

            // Which way the field changes here.
            const gx = before[y * cols + Math.min(x + 1, cols - 1)]
              - before[y * cols + Math.max(x - 1, 0)];
            const gy = before[Math.min(y + 1, rows - 1) * cols + x]
              - before[Math.max(y - 1, 0) * cols + x];

            const gl = Math.hypot(gx, gy);

            // And which way the charges here are going, which is across the
            // way their shell runs.
            const mx = -runY[i], my = runX[i];

            const par = gl > 1e-5 ? ((gx * mx + gy * my) / gl) ** 2 : 0;

            // Between linear and squared: squared alone ignores everything
            // but the thickest alternation, and half of what wants keeping
            // here is the thin seam between two arcs that have nearly closed
            // on each other — which is faint precisely because it is about to
            // be lost, and is the last moment it can be saved.
            const a2 = alt[i] * (0.4 + 0.6 * alt[i]);

            const gain = 0.3 + a2 * 5.2 * (0.35 + 0.65 * par);

            f[i] = Math.max(Math.min(f[i] + (f[i] - wide[i]) * gain, 1), -1);
          }
        }

        // And nothing survives where two charges are about to meet: the field
        // there belongs to neither of them, because in a tick it will belong
        // to whatever they become.
        for (let i = 0; i < f.length; i++) f[i] *= 1 - cut[i] * 0.9;

        /**
         * And where the two charges lie against each other, both give ground.
         *
         * Everything above works on the field, and the field is traced at a
         * level — so two bodies that meet cleanly are drawn with their
         * outlines touching, one line doing for the pair of them, and what
         * the eye gets is one shape with a crease in it. The alternation is
         * there in the reading and gone from the picture.
         *
         * The last thing done, then, is the cheapest and the most direct:
         * where the two are near equal, both are pushed back from zero by the
         * same amount before the outlines are found. Neither loses anything
         * to the other — the place they part is exactly where it was, since
         * both give the same ground — and what opens between them is a
         * channel of the width of what was given. Away from any seam it does
         * nothing at all, because there is nothing there for both to be near.
         *
         * It is a drawing decision and says so: no charge has moved and no
         * region has changed hands. Two things that touch are drawn as two
         * things that touch, which is what they are.
         */
        for (let i = 0; i < f.length; i++) {
          const give = alt[i] * 0.2;

          f[i] = f[i] > 0 ? Math.max(f[i] - give, 0) : Math.min(f[i] + give, 0);
        }

        // And the pulses they were emitted in, kept separately, so the grain
        // of the thing can be drawn under its shape.
        const waves = new Map<string, {
          at: { x: number, y: number }[], out: number, n: number, polarity: Polarity,
        }>();

        for (const nd of graph.nodes) {
          if (!graph.inFocus(nd)) continue;

          for (const ray of nd) {
            if (ray.magnet || !ray.moving || ray.wave === undefined) continue;
            if (ray.moving.polarity === Polarity.Neutral) continue;

            const p = pts.get(nd);
            if (!p || p.clipped) continue;

            const key = `${ray.wave}|${ray.moving.polarity}`;

            let wave = waves.get(key);
            if (!wave) waves.set(key, wave = {
              at: [], out: 0, n: 0, polarity: ray.moving.polarity,
            });

            wave.at.push({ x: p.x, y: p.y });

            const wp = layout.get(nd);
            if (wp) wave.out += Math.hypot(...wp) / ((graph.focus ?? 12) * LATTICE_STEP);
            wave.n++;

            break;
          }
        }


        /**
         * The line along which the field crosses a value.
         *
         * Marching squares: each little square of four neighbouring samples
         * is wholly above the value, wholly below, or cut by it — and which
         * of its sides the cut passes through follows from which corners are
         * on which side. Where on a side is solved for rather than snapped to
         * the grid, so the curve is placed to a fraction of a sample and does
         * not come out looking like stairs.
         *
         * The segments come out unordered, so they are then strung together
         * end to end into runs. That is what turns a scatter of little lines
         * into a curve that can be smoothed and filled — and a run that
         * arrives back where it began is a closed one, which is what the
         * boundary of a body is.
         */
        const trace = (level: number) => {
          const segs: [number, number, number, number][] = [];

          for (let y = 0; y + 1 < rows; y++) {
            for (let x = 0; x + 1 < cols; x++) {
              const v = [
                f[y * cols + x], f[y * cols + x + 1],
                f[(y + 1) * cols + x + 1], f[(y + 1) * cols + x],
              ];

              let mask = 0;
              for (let c = 0; c < 4; c++) if (v[c] > level) mask |= 1 << c;
              if (mask === 0 || mask === 15) continue;

              const corner = [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]];

              const cut = (a: number, b: number): [number, number] => {
                const t = Math.max(Math.min((level - v[a]) / ((v[b] - v[a]) || 1e-9), 1), 0);

                return [
                  (corner[a][0] + (corner[b][0] - corner[a][0]) * t) * CELL,
                  (corner[a][1] + (corner[b][1] - corner[a][1]) * t) * CELL,
                ];
              };

              const on: [number, number][] = [];
              for (let c = 0; c < 4; c++) {
                const d = (c + 1) % 4;
                if (((mask >> c) & 1) !== ((mask >> d) & 1)) on.push(cut(c, d));
              }

              if (on.length === 2) segs.push([on[0][0], on[0][1], on[1][0], on[1][1]]);
              else if (on.length === 4) {
                segs.push([on[0][0], on[0][1], on[1][0], on[1][1]]);
                segs.push([on[2][0], on[2][1], on[3][0], on[3][1]]);
              }
            }
          }

          // Strung end to end. Endpoints are shared exactly between
          // neighbouring squares, so matching them to the nearest tenth of a
          // pixel is enough to find which segment continues which.
          const key = (x: number, y: number) => `${Math.round(x * 10)},${Math.round(y * 10)}`;
          const ends = new Map<string, number[]>();

          segs.forEach(([ax, ay, bx, by], i) => {
            for (const k of [key(ax, ay), key(bx, by)]) {
              const list = ends.get(k);
              if (list) list.push(i); else ends.set(k, [i]);
            }
          });

          const used = new Array(segs.length).fill(false);
          const runs: { x: number, y: number }[][] = [];

          for (let i = 0; i < segs.length; i++) {
            if (used[i]) continue;
            used[i] = true;

            const [ax, ay, bx, by] = segs[i];
            const run = [{ x: ax, y: ay }, { x: bx, y: by }];

            // Follow it forwards, then turn round and follow the other way.
            for (let pass = 0; pass < 2; pass++) {
              for (; ;) {
                const tip = run[run.length - 1];
                const next = (ends.get(key(tip.x, tip.y)) ?? []).find(j => !used[j]);
                if (next === undefined) break;

                used[next] = true;

                const [cx2, cy2, dx2, dy2] = segs[next];
                const near = Math.hypot(cx2 - tip.x, cy2 - tip.y) < Math.hypot(dx2 - tip.x, dy2 - tip.y);

                run.push(near ? { x: dx2, y: dy2 } : { x: cx2, y: cy2 });
              }

              run.reverse();
            }

            if (run.length >= 4) runs.push(run);
          }

          return runs;
        };

        /**
         * A run, eased.
         *
         * Marching squares places every point on the edge of a sample square,
         * so a curve through them carries the grid's own fret in it — a
         * regular little waver at the scale of one sample, which is nothing
         * about the field and everything about how it was measured. A few
         * passes of each point drifting towards the middle of its neighbours
         * takes that out and leaves the shape, which is at the scale of a
         * band and untouched by it.
         */
        const ease = (run: { x: number, y: number }[], closed: boolean) => {
          let cur = run;

          for (let pass = 0; pass < 10; pass++) {
            const next = cur.map((p, i) => {
              if (!closed && (i === 0 || i === cur.length - 1)) return p;

              const a = cur[(i - 1 + cur.length) % cur.length];
              const b = cur[(i + 1) % cur.length];

              return { x: (a.x + 2 * p.x + b.x) / 4, y: (a.y + 2 * p.y + b.y) / 4 };
            });

            cur = next;
          }

          return cur;
        };

        const prev = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = "lighter";

        /**
         * The waves themselves, underneath and barely there.
         *
         * The spirals are what the field IS, and they are drawn above. But a
         * spiral is made of something — one shell after another, each thrown
         * off a moment later than the last and a little further round — and
         * with only the boundaries drawn there is nothing in the picture that
         * says so. A faint outline per pulse puts that back: the rings are
         * the grain of the thing, and the winding is the thing.
         */
        for (const wave of waves.values()) {
          if (wave.at.length < 3) continue;

          const hull = outline(wave.at);
          if (hull.length < 3) continue;

          const tint = channels(tintOf(wave.polarity));
          const at = (i: number) => hull[(i % hull.length + hull.length) % hull.length];

          ctx.beginPath();
          ctx.moveTo(hull[0].x, hull[0].y);

          for (let i = 0; i < hull.length; i++) {
            const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);

            ctx.bezierCurveTo(
              p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
              p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
              p2.x, p2.y,
            );
          }

          ctx.closePath();
          /**
           * And the older ones stop being drawn rather than piling up.
           *
           * A dozen pulses in the air at once is a dozen rings, and the
           * further out they are the longer their outlines are and the more
           * of them cross each other — so the outside of the picture ends up
           * carrying most of the ink for the part of the field that has least
           * in it. Cut off once they are past halfway out, what is left is
           * the handful nearest the source, which are the ones that read as
           * pulses.
           */
          const lift = Math.max(1 - wave.out / wave.n, 0);
          if (lift < 0.45) continue;

          // Faint enough to be texture. There are several of these to every
          // band and their outlines run alongside it, so at anything like the
          // band's own weight they stop being the grain of it and become a
          // second set of edges arguing with the first.
          ctx.strokeStyle = `rgba(${tint},${lift * lift * 0.18})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }

        // Traced where the field is only weakly one thing rather than
        // firmly so. A high level draws a line well inside each band and the
        // arm comes out thin, broken wherever it happens to be weak; a low
        // one follows the band right out to where it gives way to its
        // neighbour, which is where the two actually meet.
        /**
         * A fill that dims with distance from the source rather than with
         * which island it belongs to.
         *
         * A fill takes one colour for the whole shape it fills, so a band
         * cannot be shaded along itself the way its edge can. What it can be
         * given is a colour that is already a gradient — bright at the middle
         * of the picture and thin at the rim — and then every band is dim
         * where it is far out and bright where it is close in, including the
         * ones that are both.
         */
        const centre = origin.size
          ? [...origin.values()].reduce((a, p) => ({
            x: a.x + p.x / origin.size, y: a.y + p.y / origin.size,
          }), { x: 0, y: 0 })
          : { x: w / 2, y: h / 2 };

        const span2 = (graph.focus ?? 12) * LATTICE_STEP * cam.scale;

        const wash = (tint: string) => {
          const g = ctx.createRadialGradient(
            centre.x, centre.y, 0, centre.x, centre.y, Math.max(span2, 1),
          );

          g.addColorStop(0, `rgba(${tint},0.3)`);
          g.addColorStop(0.45, `rgba(${tint},0.14)`);
          g.addColorStop(1, `rgba(${tint},0.03)`);

          return g;
        };

        const strength = (p: { x: number, y: number }) => {
          const i = Math.min(Math.max(Math.round(p.y / CELL), 0), rows - 1) * cols
            + Math.min(Math.max(Math.round(p.x / CELL), 0), cols - 1);

          const lift = near[i];

          return 0.08 + lift * lift * 0.92;
        };

        for (const [level, tint] of [
          [0.17, channels(AMBER)], [-0.17, channels(CYAN)],
        ] as [number, string][]) {
          const runs = trace(level).map(raw => {
            const closed = Math.hypot(
              raw[0].x - raw[raw.length - 1].x, raw[0].y - raw[raw.length - 1].y,
            ) < CELL * 2;

            return { run: ease(raw, closed), closed };
          });

          const curve = (into: Path2D, run: { x: number, y: number }[], closed: boolean) => {
            const at = (i: number) => run[closed
              ? (i % run.length + run.length) % run.length
              : Math.max(Math.min(i, run.length - 1), 0)];

            into.moveTo(run[0].x, run[0].y);

            for (let i = 0; i < run.length - (closed ? 0 : 1); i++) {
              const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);

              into.bezierCurveTo(
                p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6,
                p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6,
                p2.x, p2.y,
              );
            }

            if (closed) into.closePath();
          };

          /**
           * All of one charge's boundaries filled as ONE shape, with the
           * even-odd rule.
           *
           * A body of one charge is not simply a blob with an edge. An arm
           * that winds round has the other charge inside the loop it makes,
           * and that shows up here as a second closed curve lying within the
           * first — the hole, not another island. Filled one curve at a time,
           * the hole gets filled too, and amber is painted straight over the
           * cyan that lives there: two regions that cannot overlap in the
           * field, overlapping in the picture, purely as an artefact of
           * filling their boundaries separately.
           *
           * Taken together under the even-odd rule, a place is inside the
           * body when the boundary wraps it an odd number of times — so the
           * inside of the arm is filled, the hole within it is not, and what
           * is drawn is the region rather than everything its edges happen to
           * enclose.
           */
          const body = new Path2D();
          for (const { run, closed } of runs) if (closed) curve(body, run, closed);

          ctx.fillStyle = wash(tint);
          ctx.fill(body, "evenodd");

          // A brighter rim on top of it, stroked span by span so that its
          // strength is the strength of the field where each piece of it
          // actually lies rather than the average over the whole run.
          ctx.lineWidth = 1.4;
          ctx.lineCap = "round";

          for (const { run, closed } of runs) {
            const at = (i: number) => run[closed
              ? (i % run.length + run.length) % run.length
              : Math.max(Math.min(i, run.length - 1), 0)];

            for (let i = 0; i + 1 < run.length + (closed ? 1 : 0); i++) {
              const a = at(i), b = at(i + 1);

              ctx.strokeStyle = `rgba(${tint},${0.75 * strength(a)})`;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }

          ctx.lineCap = "butt";
        }

        ctx.globalCompositeOperation = prev;
      }

      for (const n of graph.nodes) {
        const p = pts.get(n);
        if (!p || p.clipped || !onScreen(p)) continue;
        const depth = Math.min(Math.max(p.depth, 0.4), 1.6);

        // In field mode everything in flight has already been drawn, as the
        // surface it belongs to. What is left to draw one point at a time is
        // what isn't a surface: the sources, and (below) the places where
        // something is about to happen.
        const magnet = n.some(r => r.magnet);
        if (field && !magnet) continue;

        // The origin of the waves. Everything charged in this universe came
        // out of one of these, so it is the one thing that isn't an event but
        // a cause of them — drawn as its own colour rather than as a polarity,
        // since it has none.
        if (magnet) {
          // Sized against the zoom, since this is a point of a structure that
          // is being looked at from somewhere — which is the one thing the
          // closed form, having no points and no camera, cannot do.
          const r = Math.min(Math.max(cam.scale * 0.2 * depth, 2), 30);

          source(ctx, p.x, p.y, { halo: r * 3.2, dot: Math.max(r * 0.4, 1.6) });
        }

        // Center seed: a soft glow marking where the universe started. In
        // field mode the origin is only the point halfway between the two
        // sources, and glowing there would read as a third one.
        if (!field && isCenterNode(n)) {
          const r = Math.min(Math.max(cam.scale * 0.16 * depth, 0.8), 26);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
          g.addColorStop(0, "rgba(255,217,168,0.9)");
          g.addColorStop(1, "rgba(255,217,168,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Boundaries: EVERY boundary of every ray is drawn as a segment
        // towards the node on the far side of its connection, coloured by
        // its own polarity (Positive amber, Negative cyan), reaching 25% of
        // the way along it. So each lattice connection shows two of them —
        // one from each end, with a gap in between. The single boundary the
        // ray is currently `moving` along is drawn at full opacity (and
        // thicker) on top; the rest are faded down.
        ctx.lineCap = "round";
        const stub = (bd: Boundary, moving: boolean) => {
          // Connected boundaries aim at their neighbour; unconnected ones at
          // a point one lattice step along their bare `outward` direction, so
          // "moving away from every connection" is visible rather than blank.
          const wp = layout.get(n);
          const wt = bd.target
            ? layout.get(bd.target.at.node)
            : (wp && bd.outward ? wp.map((v, i) => v + (bd.outward![i] || 0) * LATTICE_STEP) : undefined);
          if (!wp || !wt) return;

          const tp = bd.target ? pts.get(bd.target.at.node) : screenOf(wt);
          if (!tp || tp.clipped) return;

          const dx = tp.x - p.x, dy = tp.y - p.y;
          const len = Math.hypot(dx, dy);
          if (len < 1) return;
          const ux = dx / len, uy = dy / len;
          const L = len * BOUNDARY_STUB;

          // Positive amber, Negative cyan, and space that hasn't been charged
          // by anything a plain grey.
          // Positive amber, negative cyan, and space that hasn't been charged
          // by anything a plain grey — the same three the closed form leans
          // its pixels towards. The one it is moving along at full strength,
          // the rest faded down.
          const tint = tintOf(bd.polarity);

          ctx.strokeStyle = moving
            ? rgba(tint, 1)
            : rgba(tint, bd.polarity === Polarity.Neutral ? 0.25 : 0.3);
          ctx.lineWidth = 2 * depth;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + ux * L, p.y + uy * L);
          ctx.stroke();

          if (!moving) return;

          // An arrow head sitting ON the node, naming which of its lattice
          // directions the ray is actually moving in. Its base is centred on
          // the node's own position and it points off along the connection,
          // so the direction is read at the point it belongs to rather than
          // out at the far end of the stub.
          //
          // It is the silhouette of a cone, so it foreshortens like one: the
          // width of the base is fixed, but the length shrinks as the
          // direction turns towards or away from the camera. That ratio is
          // measured, not guessed — the drawn length of the connection over
          // the length it would have had square to the camera. Without it
          // every head is drawn at full length whatever it points at, which
          // is what makes them read wrong in 3D.
          const worldLen = Math.hypot(...wt.map((v, i) => v - wp[i]));
          const square = worldLen * cam.scale * depth;
          const foreshortening = square > 0 ? Math.min(len / square, 1) : 1;

          const size = Math.min(Math.max(10, ctx.lineWidth * 5), L * 0.7);
          const head = size * Math.max(foreshortening, 0.3);
          const nx = -uy * size * 0.46, ny = ux * size * 0.46;

          ctx.fillStyle = ctx.strokeStyle;
          ctx.beginPath();
          ctx.moveTo(p.x + ux * head, p.y + uy * head);
          ctx.lineTo(p.x + nx, p.y + ny);
          ctx.lineTo(p.x - nx, p.y - ny);
          ctx.closePath();
          ctx.fill();
        };

        // One stub per direction — per neighbouring node, or per outward
        // direction. After a merge a node holds many rays whose boundaries
        // all face the same neighbour; stroking that one segment once per
        // boundary stacks the 0.3-alpha passes into an opaque line, and mixed
        // polarities towards the same neighbour blend amber over cyan into a
        // washed-out white. A `moving` boundary always wins the slot, so the
        // highlight is never lost to a resting one sharing its direction.
        const slots = new Map<string, { bd: Boundary; moving: boolean }>();
        for (const ray of n) {
          for (const bd of ray.boundaries) {
            const other = bd.target?.at.node;

            let key: string;
            if (other && other !== n) key = "n" + idxOf.get(other);
            else if (!other && bd.outward) key = "o" + bd.outward.join(",");
            else continue;

            const moving = ray.moving === bd;
            const cur = slots.get(key);
            if (!cur || (moving && !cur.moving)) slots.set(key, { bd, moving });
          }
        }

        // Dim pass first, so the highlighted one is never overdrawn by it —
        // and skipped entirely in field mode, where the twenty-five
        // directions a charge ISN'T going are twenty-five stubs saying
        // nothing, per charge, per frame.
        for (const { bd, moving } of slots.values())
          if (!moving && !field) stub(bd, false);

        for (const { bd, moving } of slots.values())
          if (moving) stub(bd, true);

        ctx.lineCap = "butt";
      }

      // What is about to happen — and only ever one thing.
      //
      // Everything in this universe is charges moving, and almost all of the
      // time a charge moving is nothing happening: it swaps places with the
      // space in front of it and the world is as it was. Two alike meeting
      // head-on and turning each other round is barely more than that —
      // nothing is lost by it, the pair carry on the other way, and there are
      // thousands of them a tick all over the field.
      //
      // Cancelling is the only event that leaves the world a different size.
      // It is the whole of what gravity is here, and marking anything else
      // alongside it buries it in the general bustle.
      if (field) {
        // Drawn plainly, NOT added together like the shells above.
        //
        // Additive blending is right for a few translucent surfaces and wrong
        // for a thousand marks: where the fields properly meet there are
        // hundreds of these on top of one another, and adding a hundred faint
        // whites gives solid white. The middle of the picture — which is the
        // part being watched — turns into a lamp. Ordinary alpha means a
        // hundred stacked marks are no brighter than a few, so a dense region
        // reads as dense rather than as blown out.
        const prev = ctx.globalCompositeOperation;

        for (const nd of graph.nodes) {
          for (const ray of nd) {
            const a = ray.moving;
            const b = a?.target;
            if (!a || !b) continue;

            const other = b.at.node;
            if (other === nd) continue;

            // Each moving into where the other is — the same test the tick
            // itself uses, so what is marked is what will actually happen.
            const met = other.find(x => x.moving?.target?.at.node === nd);
            if (!met) continue;

            // Found from both ends; drawn from one.
            if (idxOf.get(nd)! > idxOf.get(other)!) continue;

            // Against what the other one is actually carrying towards us,
            // which is its own moving boundary — the same pair of polarities
            // the tick will compare. Only one of each cancels; everything
            // else meeting head-on turns around, and turning around leaves
            // the world exactly as big as it was.
            const facing = met.moving!.polarity;

            const opposed =
              (a.polarity === Polarity.Positive && facing === Polarity.Negative) ||
              (a.polarity === Polarity.Negative && facing === Polarity.Positive);

            if (!opposed) continue;

            const p = pts.get(nd), q = pts.get(other);
            if (!p || !q || p.clipped || q.clipped) continue;

            const x = (p.x + q.x) / 2, y = (p.y + q.y) / 2;
            if (!onScreen({ x, y })) continue;

            // Sized in pixels with only a little from the zoom. These are
            // marks ON the picture rather than things in it — scaled to the
            // lattice they are two or three pixels across on a ball this big,
            // which is to say invisible, which is to say the one thing the
            // picture is for isn't in it.
            // Sized in pixels rather than scaled to the lattice, but only
            // just: there are a great many of these once the fields properly
            // meet, and at full brightness they stop being marks on the
            // picture and become the picture.
            const r = 3 + cam.scale * 0.012 * p.depth;

            const flash = ctx.createRadialGradient(x, y, 0, x, y, r);
            flash.addColorStop(0, "rgba(255,240,214,0.28)");
            flash.addColorStop(0.4, "rgba(255,240,214,0.1)");
            flash.addColorStop(1, "rgba(255,240,214,0)");
            ctx.fillStyle = flash;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            // A small hard centre, so it still reads as a point where
            // something is happening rather than as one more soft glow.
            ctx.fillStyle = "rgba(255,244,224,0.4)";
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // And what DID happen — the same events a tick later, at the place
        // they happened, fading. An annihilation is over inside the tick it
        // occurs in and takes both of the points it occurred between with it,
        // so without this the one thing in this universe that changes how
        // much space there is is the one thing never shown happening.
        for (const event of graph.events) {
          if (event.kind !== 'annihilate') continue;

          const age = graph._tickId - event.tick;
          if (age > 1) continue;

          const pr = place(project(event.at, cam.rot, cam.tilt, cam.dist || 1));
          if (pr.clipped || !onScreen(pr)) continue;

          const fade = age === 0 ? 0.3 : 0.12;
          const r = 5 + cam.scale * 0.018 * pr.depth;

          const burst = ctx.createRadialGradient(pr.x, pr.y, 0, pr.x, pr.y, r);
          burst.addColorStop(0, `rgba(255,236,196,${fade})`);
          burst.addColorStop(0.35, `rgba(255,236,196,${0.35 * fade})`);
          burst.addColorStop(1, "rgba(255,236,196,0)");
          ctx.fillStyle = burst;
          ctx.beginPath();
          ctx.arc(pr.x, pr.y, r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalCompositeOperation = prev;

        // What the last tick actually consisted of. "Nothing is happening"
        // has several quite different causes that look identical on screen,
        // and these are what tell them apart: emitted 0 means the sources are
        // walled in, moved 0 with blocked high means everything has jammed,
        // and annihilated 0 with both of those healthy means the waves are
        // travelling perfectly well and simply never meeting.
        const s = graph.stats;
        const line = `t${graph._tickId}  pts ${graph.nodes.length}  emit ${s.emitted}  move ${s.moved}  block ${s.blocked}  kill ${s.annihilated}  turn ${s.turned}  holes ${s.holes}`;

        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgba(150,158,180,0.75)";
        ctx.fillText(line, 10, 8);

        /**
         * How far apart the two sources are, in steps through the structure,
         * plotted against time.
         *
         * Flat means they are not gravitating, whatever the picture above it
         * appears to be doing. Every step down is space between them that has
         * been annihilated and is not there any more. It is the one reading
         * here that cannot be argued with by looking harder: the layout is a
         * solve and can be stiff or slow, and the coordinates never move at
         * all, but a path is a count of points and either there are fewer of
         * them than there were or there are not.
         */
        const history = graph.history;

        // Nothing to measure with one source: there is no "apart".
        if (history.length > 1 && graph.route.length > 1) {
          const W = 150, H = 38, X = 10, Y = h - H - 12;

          const top = Math.max(...history, 1);
          const now = history[history.length - 1];

          ctx.strokeStyle = "rgba(150,158,180,0.22)";
          ctx.lineWidth = 1;
          ctx.strokeRect(X, Y, W, H);

          ctx.strokeStyle = "rgba(120,230,180,0.85)";
          ctx.lineWidth = 1.4;
          ctx.beginPath();

          for (let i = 0; i < history.length; i++) {
            const x = X + (i / Math.max(history.length - 1, 1)) * W;
            const y = Y + H - (Math.max(history[i], 0) / top) * (H - 4) - 2;

            if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }

          ctx.stroke();

          ctx.fillStyle = "rgba(150,158,180,0.75)";
          ctx.fillText(`source to source: ${now} steps (from ${history[0]})`, X, Y - 15);
        }
      }
    }

    return {
      // Whoever owns the universe is told as this comes on and off screen, so
      // that it can let go of one and make another. See `LatticePlayer`.
      start: () => latest.current.onVisible?.(true),

      frame: (surface, dt) => {
        // Ticking lives with the caller: this only ever renders, and never
        // advances the dynamics itself.
        latest.current.onFrame?.(dt);

        draw(surface);
      },

      stop: () => {
        latest.current.onVisible?.(false);

        // The field as drawn, which is the one thing this keeps between
        // frames. Everything else it allocates lives and dies inside a draw.
        eased = null;
      },
    };
  }} />;
}

