import { ON_INTELLIGIBILITY, RAY_CALCULI_AND_PHYSICS } from "../references";
import REFERENCES from "../profiles/fadi-shawki/fadi_shawki";

import { useNavigate } from "react-router-dom";
import Post, {
  BR,
  PaperProps,
  Reference,
  Section,
  useCounter,
  CodeBlock,
  Row,
  JetBrainsMono, BlueprintIcons20, BlueprintIcons16,
  Arc,
  Block
} from "../../lib/post/Post";
import { useEffect, useRef, useState } from "react";
import { Button } from "@blueprintjs/core";

enum Op {
  Repell,
  Attract,
  Neutral
}

class Universe {
  static _2D = () => Universe.nD_Expanding(2);
  static _3D = () => Universe.nD_Expanding(3);
  static nD_Expanding = (d: number) => { }

  //TODO Should probably be something occilating instead of random
  static random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static randomOp() {
    const r = Math.random();
    if (r < 0.4) return Op.Repell;
    if (r < 0.7) return Op.Attract;
    return Op.Neutral;
  }
}

function stepAway(from: number[], to: number[]): number[] {
  return from.map((v, i) =>
    v + Math.sign(to[i] - v)
  );
}

class Graph {
  buffer: node[] = []

  nodes: node[] = []

  coords = new Map<node, number[]>()

  gridPos = new Map<node, number[]>();

  // Lattice dimensionality and the current outermost Chebyshev ring — the
  // repell dynamic walks this outward one shell per tick.
  dims = 3;
  ringRadius = 0;

  // Transient per-tick state used by the repell expansion (Boundary.repell).
  _tickId = 0;
  _tickIndex?: Map<string, node>;

  get edges(): [node, node][] {
    const seen = new Set<string>();
    const edges: [node, node][] = [];

    for (const a of this.nodes) {
      for (const ray of a) {
        for (const boundary of ray.boundaries) {
          const target = boundary.target;
          if (!target) continue;

          const b = target.at.node;
          if (a === b) continue;

          const ia = this.nodes.indexOf(a);
          const ib = this.nodes.indexOf(b);

          const key =
            ia < ib
              ? `${ia},${ib}`
              : `${ib},${ia}`;

          if (!seen.has(key)) {
            seen.add(key);
            edges.push([a, b]);
          }
        }
      }
    }

    return edges;
  }

  connect(a: node, b: node) {
    // Connect every boundary in a to the first boundary in b.
    const target = b[0].boundaries[0];

    for (const ray of a)
      for (const boundary of ray.boundaries)
        boundary.target = target;
  }

  tick() {
    // One tick fires every boundary once. Repeller boundaries push their
    // node outward (Boundary.repell), so the frontier grows the next shell.
    // The boundary list is snapshotted first, so cells created this tick
    // aren't fired until the next one — exactly one shell per tick.
    this._tickId++;

    const byCoord = new Map<string, node>();
    for (const nd of this.nodes) {
      const g = this.gridPos.get(nd);
      if (g) byCoord.set(g.join(","), nd);
    }
    this._tickIndex = byCoord;

    const buffer: Boundary[] = [];
    for (const node of this.nodes) {
      for (const ray of node) {
        buffer.push(...ray.boundaries);
      }
    }

    for (const boundary of buffer) {
      boundary.tick();
    }

    this._tickIndex = undefined;
    this.ringRadius += 1;
    this.invalidateLayout();
  }

  static expandingGrid(dims: number, size = 3): Graph {
    const graph = new Graph();
    const center = Math.floor(size / 2);

    const coords: number[][] = [];
    (function build(prefix: number[]) {
      if (prefix.length === dims) {
        coords.push(prefix);
        return;
      }
      for (let i = 0; i < size; i++)
        build([...prefix, i]);
    })([]);

    const byCoord = new Map<string, node>();
    const coordOf = new Map<node, number[]>();

    const key = (c: number[]) => c.join(",");

    // Create nodes.
    for (const idx of coords) {
      const coord = idx.map(v => v - center);
      const isCenter = coord.every(v => v === 0);

      const node: node = [];

      if (isCenter) {
        const ray = new Ray(node, graph);
        ray.boundaries[0].repeller();
      } else {
        // Seed condition: one inward-pointing repeller per inward direction
        // (one per non-zero coordinate axis), so a corner repels along ALL
        // its axes — 3 in 3D, 2 in 2D, etc. — not just a fixed two. Ops
        // only diverge from this later (as the graph grows), not on frame one.
        const inwardDirs = coord.filter(v => v !== 0).length;
        for (let i = 0; i < inwardDirs; i++) {
          const ray = new Ray(node, graph);
          ray.boundaries[0].repeller();
        }
      }

      graph.nodes.push(node);

      // remember where this lattice cell belongs
      graph.gridPos.set(node, coord);

      byCoord.set(key(coord), node);
      coordOf.set(node, coord);
    }

    // Semantic lattice links.
    // Every node connects to its orthogonal neighbours.
    // Boundary.target is the source of truth for Graph.edges.
    for (const node of graph.nodes) {
      const coord = coordOf.get(node)!;

      for (let axis = 0; axis < dims; axis++) {
        for (const dir of [-1, 1]) {
          const neighbourCoord = [...coord];
          neighbourCoord[axis] += dir;

          const currentDistance =
            coord.reduce((s, v) => s + Math.abs(v), 0);
          const neighbourDistance =
            neighbourCoord.reduce((s, v) => s + Math.abs(v), 0);

          if (neighbourDistance >= currentDistance)
            continue;

          const neighbour = byCoord.get(key(neighbourCoord));

          if (!neighbour)
            continue;

          // Need one boundary per connection.
          const ray = node[0];
          const boundary = new Boundary(ray, graph);

          boundary.target = neighbour[0].boundaries[0];
          boundary.repeller();

          ray.boundaries.push(boundary);
        }
      }
    }

    graph.dims = dims;
    graph.ringRadius = center;

    return graph;
  }

  private layoutCache?: Map<node, Vec>;
  private dirty = true;

  get layout(): Map<node, Vec> {
    if (!this.layoutCache || this.dirty) {
      this.layoutCache = this.sphereLayout({ scale: 50 });
      this.dirty = false;
    }

    return this.layoutCache;
  }

  /**
   * Deterministic cube→sphere layout.
   *
   * Each cell has a cube position (gridPos · scale — a crisp lattice, so
   * the 3×3×3 seed reads as a clean cube) and a sphere position (the same
   * direction but at a radius set by its Chebyshev ring, so corners get
   * pulled in to share a shell). The two are blended by how far the graph
   * has grown: pure cube at ring 1, easing to a pure sphere by MORPH_RINGS.
   * So it starts as a nice cube and rounds into a sphere as it expands.
   * Same graph => same output every run (no forces, no iteration).
   */
  sphereLayout({ scale = 50 }: { scale?: number } = {}): Map<node, Vec> {
    const pos = new Map<node, Vec>();

    const MORPH_RINGS = 6;
    const raw = Math.min(Math.max((this.ringRadius - 1) / (MORPH_RINGS - 1), 0), 1);
    const t = raw * raw * (3 - 2 * raw); // smoothstep cube→sphere

    for (const node of this.nodes) {
      const grid = this.gridPos.get(node);

      if (!grid) {
        pos.set(node, [0, 0, 0]);
        continue;
      }

      const ring = Math.max(...grid.map(v => Math.abs(v)));

      if (ring === 0) {
        pos.set(node, grid.map(() => 0));
        continue;
      }

      const euclidean = Math.hypot(...grid) || 1;
      const sphereR = ring * scale;

      pos.set(node, grid.map(v => {
        const cube = v * scale;
        const sphere = (v / euclidean) * sphereR;
        return cube * (1 - t) + sphere * t;
      }));
    }

    return pos;
  }

  invalidateLayout() {
    this.dirty = true;
  }

  updateLayout() {
    const layout = this.springLayout({
      iterations: 50,
      radius: 100,
    });

    for (const [node, pos] of layout) {
      this.positions.set(node, pos);

      if (!this.velocities.has(node)) {
        this.velocities.set(node, [0, 0, 0]);
      }
    }

    // remove deleted nodes
    for (const node of [...this.positions.keys()]) {
      if (!this.nodes.includes(node)) {
        this.positions.delete(node);
        this.velocities.delete(node);
      }
    }
  }

  /**
   * Deterministic spring layout.
   *
   * Same graph => same output every run.
   */
  springLayout(
    {
      dims = 3,
      iterations = 250,
      radius = 100,
      springK = 0.8,
      rewiredSpringK = 0.2,
      repulsionK = 300,
      restLength = 50,
      step = 0.01,
    }: LayoutOptions = {},
  ): Map<node, Vec> {
    let nodes = this.nodes;
    let edges = this.edges;

    // Stable ordering
    nodes = [...nodes].sort((a, b) => hashNode(a) - hashNode(b));

    const index = new Map<Ray[], number>();

    for (let i = 0; i < nodes.length; i++)
      index.set(nodes[i], i);

    const pos = new Map<node, Vec>();

    for (const node of nodes) {
      const grid = this.gridPos.get(node);

      if (!grid) {
        pos.set(node, Array(dims).fill(0));
        continue;
      }

      pos.set(
        node,
        grid.map(v => v * restLength)
      );
    }

    const forces: Vec[] = Array.from(
      { length: nodes.length },
      () => Array(dims).fill(0),
    );

    const delta = new Array(dims).fill(0);

    for (let iter = 0; iter < iterations; iter++) {

      // zero forces
      for (const f of forces)
        f.fill(0);

      //
      // REPULSION
      //
      for (let i = 0; i < nodes.length; i++) {
        const pi = pos.get(nodes[i])!;

        for (let j = i + 1; j < nodes.length; j++) {
          const pj = pos.get(nodes[j])!;

          let distSq = 0;

          for (let k = 0; k < dims; k++) {
            delta[k] = pj[k] - pi[k];
            distSq += delta[k] * delta[k];
          }

          distSq = Math.max(distSq, 1e-6);

          const dist = Math.sqrt(distSq);

          const f = repulsionK / distSq;

          for (let k = 0; k < dims; k++) {
            const x = delta[k] / dist * f;

            forces[i][k] -= x;
            forces[j][k] += x;
          }
        }
      }

      //
      // SPRINGS
      //
      for (const edge of edges) {

        const ia = index.get(edge[0])!;
        const ib = index.get(edge[1])!;

        const pa = pos.get(edge[0])!;
        const pb = pos.get(edge[1])!;

        let distSq = 0;

        for (let k = 0; k < dims; k++) {
          delta[k] = pb[k] - pa[k];
          distSq += delta[k] * delta[k];
        }

        const dist = Math.sqrt(Math.max(distSq, 1e-6));

        const kSpring = false//edge.rewired
          ? rewiredSpringK
          : springK;

        const f = kSpring * (dist - restLength);

        for (let k = 0; k < dims; k++) {
          const x = delta[k] / dist * f;

          forces[ia][k] += x;
          forces[ib][k] -= x;
        }
      }

      //
      // MOVE
      //
      for (let i = 0; i < nodes.length; i++) {

        let magSq = 0;

        for (let k = 0; k < dims; k++)
          magSq += forces[i][k] * forces[i][k];

        const maxForce = 300;

        if (magSq > maxForce * maxForce) {
          const s = maxForce / Math.sqrt(magSq);

          for (let k = 0; k < dims; k++)
            forces[i][k] *= s;
        }

        const p = pos.get(nodes[i])!;

        for (let k = 0; k < dims; k++)
          p[k] += step * forces[i][k];
      }
    }

    return pos;
  }

}

type node = Ray[]

let NEXT_ID = 0;
class Ray {
  id: number;
  boundaries: Boundary[] = [];

  constructor(
    public readonly node: node,
    graph: Graph
  ) {
    this.id = NEXT_ID++;

    node.push(this);

    this.boundaries.push(
      new Boundary(this, graph)
    );
  }


  tick() {
    for (const boundary of this.boundaries)
      boundary.tick();
  }
}

class Boundary {
  op: Op = Op.Neutral

  get source(): Boundary { return Universe.random(this.at.boundaries.filter(x => x !== this)); }
  target?: Boundary

  constructor(public at: Ray, private readonly graph: Graph) { }

  repeller() { this.op = Op.Repell; }
  attractor() { this.op = Op.Attract; }

  tick() {
    switch (this.op) {
      case Op.Repell:
        this.repell();
        break;

      case Op.Attract:
        this.attract();
        break;
    }
  }

  repell() {
    const graph = this.graph;
    const node = this.at.node;

    // A node's repellers act TOGETHER — their products are what make the
    // diagonals — so the whole node repels once per tick, however many
    // repeller boundaries it has. (Firing per-boundary would only give the
    // single-axis directions, i.e. a diamond, not the filled square.)
    if ((node as any)._repelledTick === graph._tickId) return;
    (node as any)._repelledTick = graph._tickId;

    const g = graph.gridPos.get(node);
    const byCoord = graph._tickIndex;
    if (!g || !byCoord) return;

    const key = (c: number[]) => c.join(",");

    // One outward push direction per repeller (per non-zero axis).
    const dirs: number[][] = [];
    for (let axis = 0; axis < g.length; axis++) {
      if (g[axis] !== 0) {
        const d = g.map(() => 0);
        d[axis] = Math.sign(g[axis]);
        dirs.push(d);
      }
    }
    const k = dirs.length;
    if (k === 0) return; // the center pushes nowhere

    // The node pushes itself outward to the PRODUCT of all its directions
    // (the diagonal). The cell it vacates, and the intermediate cells
    // between (the "left" and "up" of a corner's "left, up, and product"),
    // become new NEUTRAL space — sitting inward of the node, in the
    // direction its boundaries face, and keeping the moved node connected to
    // the lattice. The node itself stays a repeller.
    const full = g.slice();
    for (const d of dirs) for (let i = 0; i < full.length; i++) full[i] += d[i];
    if (byCoord.has(key(full))) return; // boxed in by a cell already there

    const makeNeutral = (pos: number[]) => {
      const kk = key(pos);
      if (byCoord.has(kk)) return;
      const space: node = [];
      new Ray(space, graph); // neutral — plain space, it doesn't repel
      graph.nodes.push(space);
      graph.gridPos.set(space, pos.slice());
      byCoord.set(kk, space);
    };

    // Intermediate cells: every PROPER non-empty combination of the outward
    // directions (all but the full product) — neutral space that keeps the
    // moved node orthogonally connected.
    for (let mask = 1; mask < (1 << k) - 1; mask++) {
      const np = g.slice();
      for (let b = 0; b < k; b++) {
        if (mask & (1 << b)) {
          for (let i = 0; i < np.length; i++) np[i] += dirs[b][i];
        }
      }
      makeNeutral(np);
    }

    // Move the node out to the product cell; its vacated cell becomes neutral.
    byCoord.delete(key(g));
    graph.gridPos.set(node, full);
    byCoord.set(key(full), node);
    makeNeutral(g.slice());
  }


  attract() {
    if (!this.target) return;

    const consumed = this.target.at.node;


    //
    // Remove all boundaries pointing at the consumed node.
    //
    for (const node of this.graph.nodes) {
      for (const ray of node) {

        ray.boundaries =
          ray.boundaries.filter(
            b => b.target?.at.node !== consumed
          );

      }
    }


    //
    // Remove the consumed spatial node.
    //
    this.graph.nodes =
      this.graph.nodes.filter(
        n => n !== consumed
      );


    //
    // This connection has been consumed.
    //
    this.target = undefined;
  }

  annihilate() {

  }

}


type Vec = number[];

export interface LayoutOptions {
  dims?: 2 | 3;
  iterations?: number;
  radius?: number;
  springK?: number;
  rewiredSpringK?: number;
  repulsionK?: number;
  restLength?: number;
  step?: number;
}

function hashString(s: string): number {
  let h = 2166136261;

  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

function hashNode(node: node): number {
  let h = 2166136261;

  for (const ray of node) {
    const x = hashString(String(ray.id));
    h ^= x;
    h = Math.imul(h, 16777619);
  }

  return h >>> 0;
}

function unit(h: number): number {
  return (h >>> 0) / 4294967296;
}

function initialPosition(
  node: node,
  gridPos: number[],
  scale: number
): Vec {
  return gridPos.map(v => v * scale);
}

const CalculusVisualization = ({ repeated = false }: { repeated?: boolean }) => {
  const canvasRef = useRef(null);
  const camRef = useRef({ scale: 44, rot: Math.PI / 4, tilt: 0.6155, anchor: null, dist: null, distMult: 1.5, scaleMult: 1 });

  const [running, setRunning] = useState(false);
  // Start as a bare 3×3 seed; the repell dynamic (Graph.tick → each cell's
  // repellers pushing outward, driven by the frame loop while running) is
  // what grows it outward one shell at a time.
  const [graph, setGraph] = useState(() => Graph.expandingGrid(2));

  // TODO Right click/left click cursor=grab
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf: number;
    let last = performance.now();

    function resize() {
      const parent = canvas.parentElement;
      const w = parent.clientWidth, h = parent.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      canvas.width = w * ratio;
      canvas.height = h * ratio;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Scroll to zoom. 2D: cursor-anchored zoom (screen-space, no depth to
    // navigate) — modifies cam.scaleMult. 3D: real dolly — scrolling
    // moves the camera closer/farther along the view axis, driving
    // genuine perspective rather than a flat scale.
    // function onWheel(e) {
    //   e.preventDefault();
    //   const factor = Math.exp(-e.deltaY * 0.001);
    //   const cam = camRef.current;

    //   if (dim === 3) {
    //     cam.distMult = Math.min(Math.max((cam.distMult || 1.5) / factor, 0.01), 200);
    //     return;
    //   }

    //   const rect = canvas.getBoundingClientRect();
    //   const rx = e.clientX - rect.left - rect.width / 2;
    //   const ry = e.clientY - rect.top - rect.height / 2;
    //   const curPanX = cam.anchor ? cam.anchor.screenX - cam.anchor.worldX * cam.scale : 0;
    //   const curPanY = cam.anchor ? cam.anchor.screenY - cam.anchor.worldY * cam.scale : 0;
    //   cam.anchor = {
    //     worldX: (rx - curPanX) / cam.scale,
    //     worldY: (ry - curPanY) / cam.scale,
    //     screenX: rx,
    //     screenY: ry,
    //   };
    //   cam.scaleMult = Math.min(Math.max((cam.scaleMult || 1) * factor, 1e-4), 1e4);
    // }
    // canvas.addEventListener("wheel", onWheel, { passive: false });

    // // Right-click drag to orbit (3D) — horizontal drag rotates, vertical
    // // drag adjusts tilt. Suppress the browser context menu so right-click
    // // is free to use as a drag button.
    // function onContextMenu(e) {
    //   e.preventDefault();
    // }
    // canvas.addEventListener("contextmenu", onContextMenu);

    // let dragging = false;
    // let lastX = 0, lastY = 0;
    // function onMouseDown(e) {
    //   if (e.button !== 2) return;
    //   dragging = true;
    //   lastX = e.clientX;
    //   lastY = e.clientY;
    // }
    // function onMouseMove(e) {
    //   if (!dragging) return;
    //   const dx = e.clientX - lastX, dy = e.clientY - lastY;
    //   lastX = e.clientX;
    //   lastY = e.clientY;
    //   const cam = camRef.current;
    //   cam.rot += dx * 0.006;
    //   cam.tilt = Math.min(Math.max(cam.tilt + dy * 0.006, -1.15), 1.15);
    // }
    // function onMouseUp(e) {
    //   if (e.button === 2) dragging = false;
    // }
    // canvas.addEventListener("mousedown", onMouseDown);
    // window.addEventListener("mousemove", onMouseMove);
    // window.addEventListener("mouseup", onMouseUp);

    function project(pos, rot, tilt, camDist) {
      const x = pos[0] || 0, y = pos[1] || 0, z = pos[2] || 0;
      // if (dim === 2) return { x, y, depth: 1, clipped: false };
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

    function draw() {
      const cam = camRef.current;

      const w = canvas.clientWidth, h = canvas.clientHeight;

      ctx.fillStyle = "#06070c";
      ctx.fillRect(0, 0, w, h);
      const vg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.05);
      vg.addColorStop(0, "rgba(20,22,34,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      if (graph.nodes.length === 0) return;

      const layout = graph.layout;

      // Raw world extent (unprojected) — this is what the base pixel scale
      // tracks, deliberately independent of camera distance/perspective, so
      // there's no feedback loop between "how far the camera has dollied" and
      // "how much of the grid fits on screen". A real camera doesn't refit
      // its FOV to guarantee everything stays visible as it moves closer.
      let worldExtent = 1e-6;
      for (const [node, pos] of layout) {
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
      for (const [, pos] of layout) {
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
      const orientEase = 0.12;
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

      // Cursor-anchored pan only applies in 2D — there's no camera distance to
      // dolly there, so screen-space zoom-toward-cursor is the natural
      // control. In 3D the camera orbits/dollies toward the origin, which is
      // the standard convention for an orbit camera.
      // const panX = dim === 2 && cam.anchor ? cam.anchor.screenX - cam.anchor.worldX * cam.scale : 0;
      // const panY = dim === 2 && cam.anchor ? cam.anchor.screenY - cam.anchor.worldY * cam.scale : 0;
      const cx = w / 2 /*+ panX*/, cy = h / 2 /*+ panY*/;

      const gridKey = (c: number[]) => c.join(",");
      const projected = new Map();
      const projByKey = new Map<string, any>();
      for (const [n, pos] of layout) {
        const pr = project(pos, cam.rot, cam.tilt, cam.dist || 1);
        projected.set(n, pr);
        const g = graph.gridPos.get(n);
        if (g) projByKey.set(gridKey(g), pr);
      }

      // Fit-to-viewport zoom: size the structure from its actual PROJECTED
      // extent against the available width and height. A horizontal line
      // fills the width, a flat plane fills the frame, and a sphere sits
      // inside the smaller dimension — each zoomed appropriately for its
      // shape rather than assumed spherical. The bounding box includes the
      // outward repell tick tips (which reach past the outermost nodes and,
      // at low ring counts, are proportionally long) so nothing overhangs.
      let maxAbsX = 1e-6, maxAbsY = 1e-6;
      const consider = (x: number, y: number) => {
        const ax = Math.abs(x), ay = Math.abs(y);
        if (ax > maxAbsX) maxAbsX = ax;
        if (ay > maxAbsY) maxAbsY = ay;
      };
      for (const [n, p] of projected) {
        if (p.clipped) continue;
        consider(p.x, p.y);
        const g = graph.gridPos.get(n);
        if (!g) continue;
        let axis = -1, maxA = 0;
        for (let i = 0; i < g.length; i++) {
          const a = Math.abs(g[i]);
          if (a > maxA) { maxA = a; axis = i; }
        }
        if (axis < 0) continue;
        const nc = g.slice();
        nc[axis] -= Math.sign(g[axis]);
        const np = projByKey.get(gridKey(nc));
        if (!np || np.clipped) continue;
        // Outward repell tick reaches half the edge length past the node:
        // tip = p + (p - neighbour) * 0.5.
        consider(p.x + (p.x - np.x) * 0.5, p.y + (p.y - np.y) * 0.5);
      }
      const FIT_MARGIN = 0.9; // small gap at the edges
      cam.scale = Math.min(
        (w * 0.5 * FIT_MARGIN) / maxAbsX,
        (h * 0.5 * FIT_MARGIN) / maxAbsY,
      ) * (cam.scaleMult || 1);

      const pts = new Map();
      for (const [n, p] of projected) {
        pts.set(n, { x: cx + p.x * cam.scale, y: cy + p.y * cam.scale, depth: p.depth, clipped: p.clipped });
      }

      const keyOf = (c: number[]) => c.join(",");

      // Lattice-coordinate lookup so each node's colored op vectors can be
      // drawn along the ACTUAL edge to its laid-out neighbour, rather than
      // along an abstract stored axis direction that no longer matches
      // where the neighbour ended up after layout. This is the fix — the
      // vectors now sit exactly on the lattice.
      const byCoord = new Map<string, node>();
      for (const nd of graph.nodes) {
        const g = graph.gridPos.get(nd);
        if (g) byCoord.set(keyOf(g), nd);
      }
      const isCenterNode = (nd: node) => {
        const g = graph.gridPos.get(nd);
        return !!g && g.every(v => v === 0);
      };
      const ringOf = (nd: node) => {
        const g = graph.gridPos.get(nd);
        return g ? Math.max(...g.map(v => Math.abs(v))) : 0;
      };
      // The lattice neighbour one step inward along whichever axis is
      // largest in magnitude — i.e. the one that actually set this cell's
      // ring distance. Pointing the vector at THIS neighbour makes it run
      // radially along the real lattice, which is the fix (the old
      // renderer pointed vectors along an abstract world axis regardless
      // of where the cell sat on the sphere).
      const primaryInwardNeighbour = (nd: node): node | undefined => {
        const g = graph.gridPos.get(nd);
        if (!g) return undefined;
        let axis = -1, maxAbs = 0;
        for (let i = 0; i < g.length; i++) {
          const a = Math.abs(g[i]);
          if (a > maxAbs) { maxAbs = a; axis = i; }
        }
        if (axis < 0) return undefined;
        const nc = g.slice();
        nc[axis] -= Math.sign(g[axis]);
        return byCoord.get(keyOf(nc));
      };
      let maxRing = 0;
      for (const nd of graph.nodes) maxRing = Math.max(maxRing, ringOf(nd));

      // Viewport culling: skip the detailed rendering work (ray projection,
      // shadowBlur, stroke/fill calls) for anything clearly off-screen. Once
      // zoomed into part of a large structure, most of the population isn't
      // actually visible — this is what stops paying for it anyway. Margin
      // is generous (a couple of scale-units of screen space) so a node just
      // outside the canvas edge doesn't have its still-visible ray tip
      // prematurely clipped.
      const cullMargin = cam.scale * 2;
      const onScreen = (p) => p.x > -cullMargin && p.x < w + cullMargin && p.y > -cullMargin && p.y < h + cullMargin;

      // Lattice — full, connected edges (each drawn once, from a cell
      // toward its +axis neighbour), so the mesh stays continuous with no
      // gaps. The colored boundaries are drawn on top of these edges.
      ctx.strokeStyle = "rgba(140,150,180,0.3)";
      for (const nd of graph.nodes) {
        const g = graph.gridPos.get(nd);
        if (!g) continue;
        const a = pts.get(nd);
        if (!a || a.clipped || !onScreen(a)) continue;
        const depth = Math.min(Math.max(a.depth, 0.4), 1.6);
        ctx.lineWidth = 2.2 * depth;
        for (let axis = 0; axis < g.length; axis++) {
          const nc = g.slice();
          nc[axis] += 1;
          const nb = byCoord.get(keyOf(nc));
          if (!nb) continue;
          const b = pts.get(nb);
          if (!b || b.clipped) continue;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // Gravity-flow density cloud — the warm glow that fills the dense
      // core. A continuous scalar potential sampled on a real 3D grid,
      // colored on a dark→purple→orange→white ramp and blended additively
      // so overlapping samples read as one smooth glow. Fully world-space:
      // every sample is a real coordinate run through the same camera as
      // the nodes, so it navigates identically.
      const sources: { pos: Vec; sign: number; w: number }[] = [];
      for (const nd of graph.nodes) {
        let a = false, r = false;
        for (const ray of nd) {
          const op = ray.boundaries[0].op;
          if (op === Op.Attract) a = true;
          if (op === Op.Repell) r = true;
        }
        if (a && r) continue; // both at once cancel to net-neutral matter
        const wpos = layout.get(nd);
        if (!wpos) continue;
        if (a) sources.push({ pos: wpos, sign: 1, w: 1 });
        else if (r) sources.push({ pos: wpos, sign: -1, w: 1 });
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
          const x = cx + proj.x * cam.scale, y = cy + proj.y * cam.scale;
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

      for (const n of graph.nodes) {
        const p = pts.get(n);
        if (!p || p.clipped || !onScreen(p)) continue;
        const depth = Math.min(Math.max(p.depth, 0.4), 1.6);

        // Center seed: bright core with a soft glow.
        if (isCenterNode(n)) {
          const r = Math.min(Math.max(cam.scale * 0.16 * depth, 0.8), 26);
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3);
          g.addColorStop(0, "rgba(255,217,168,0.9)");
          g.addColorStop(1, "rgba(255,217,168,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#FFE9CE";
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        // Existing orthogonal lattice neighbours, split into inward
        // (closer to center) and outward. Boundaries are drawn along one of
        // these REAL edges, so a highlight always overlaps a lattice line
        // instead of pointing off into empty space.
        const g = graph.gridPos.get(n);
        const inwardNs: node[] = [];
        const outwardNs: node[] = [];
        if (g) {
          const cur = g.reduce((s, v) => s + Math.abs(v), 0);
          for (let axis = 0; axis < g.length; axis++) {
            for (const dir of [-1, 1]) {
              const nc = g.slice();
              nc[axis] += dir;
              const nb = byCoord.get(keyOf(nc));
              if (!nb) continue;
              const md = nc.reduce((s, v) => s + Math.abs(v), 0);
              if (md < cur) inwardNs.push(nb); else outwardNs.push(nb);
            }
          }
        }

        // One boundary per inward direction: ray i is drawn along inward
        // edge i (the counts match — a cell has one ray per inward axis), so
        // a corner shows a boundary on every axis. Each starts exactly at
        // the node and lies on its lattice edge (no offset), so where a cell
        // has several they emanate cleanly from the same corner. The op only
        // sets the colour.
        const BOUNDARY_FRAC = 0.25;
        // Round caps so the thick segments fill the shared corner at the
        // node instead of leaving a square notch between them.
        ctx.lineCap = "round";
        n.forEach((ray, i) => {
          const op = ray.boundaries[0].op;
          if (op === Op.Neutral) return;

          const pool = inwardNs.length ? inwardNs : outwardNs;
          if (!pool.length) return;
          const target = pool[i % pool.length];
          if (!target) return;

          const tp = pts.get(target);
          if (!tp || tp.clipped) return;

          const dx = tp.x - p.x, dy = tp.y - p.y;
          const len = Math.hypot(dx, dy);
          if (len < 1) return;
          const ux = dx / len, uy = dy / len;
          const L = len * BOUNDARY_FRAC;

          ctx.strokeStyle = op === Op.Repell ? "#FF7A45" : "#3DDCFF";
          ctx.lineWidth = 4 * depth;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + ux * L, p.y + uy * L);
          ctx.stroke();
        });
        ctx.lineCap = "butt";
      }
    }

    // Grow one full shell every GROW_INTERVAL seconds while running, out to
    // MAX_RING — this is the dynamic that expands the 3×3×3 seed into a
    // sphere, one deterministic ring at a time.
    const GROW_INTERVAL = 0.45;
    const MAX_RING = 9;
    let growAccum = 0;

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (running && graph.ringRadius < MAX_RING) {
        growAccum += dt;
        while (growAccum >= GROW_INTERVAL && graph.ringRadius < MAX_RING) {
          growAccum -= GROW_INTERVAL;
          graph.tick();
        }
      }

      draw();

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      // canvas.removeEventListener("wheel", onWheel);
      // canvas.removeEventListener("contextmenu", onContextMenu);
      // canvas.removeEventListener("mousedown", onMouseDown);
      // window.removeEventListener("mousemove", onMouseMove);
      // window.removeEventListener("mouseup", onMouseUp);
    };
  }, [running]);


  return <Block>
    <Row center="xs">
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </Row>
    <Row end="xs" className="child-px-2">
      {running
        ? <>
          <div style={{ width: '1em' }}></div>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={() => setRunning(false)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z" /></svg></Button>
          <div style={{ width: '1em' }}></div>
        </>
        : <>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z" /></svg></Button>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={() => setRunning(true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" /></svg></Button>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M149 100.8C161.9 93.8 177.7 94.5 190 102.6L448 272.1L448 128C448 110.3 462.3 96 480 96C497.7 96 512 110.3 512 128L512 512C512 529.7 497.7 544 480 544C462.3 544 448 529.7 448 512L448 367.9L190 537.5C177.7 545.6 162 546.3 149 539.3C136 532.3 128 518.7 128 504L128 136C128 121.3 136.1 107.8 149 100.8z" /></svg></Button>
        </>
      }
    </Row>
  </Block>
}

const RayCalculiAndPhysics = () => {
  const navigate = useNavigate();

  const referenceCounter = useCounter();

  const paper: Omit<PaperProps, 'children'> = {
    ...RAY_CALCULI_AND_PHYSICS.reference,
    pdf: {
      fonts: [JetBrainsMono, BlueprintIcons20, BlueprintIcons16],
    },
    Reference: (props: {}) => (<></>),
    references: referenceCounter
  }

  return <Post {...paper}>
    <Arc head="">
      <Section head="">
        <CalculusVisualization repeated>

        </CalculusVisualization>

      </Section>
    </Arc>
  </Post>;
}

export default RayCalculiAndPhysics;