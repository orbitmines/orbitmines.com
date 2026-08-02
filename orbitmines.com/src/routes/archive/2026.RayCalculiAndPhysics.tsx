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

// A boundary now carries a polarity instead of an annihilation/creation op.
enum Polarity {
  Positive,
  Negative
}

class Universe {
  static _2D = () => Universe.nD_Expanding(2);
  static _3D = () => Universe.nD_Expanding(3);
  static nD_Expanding = (d: number) => { }

  //TODO Should probably be something occilating instead of random
  static random<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static randomPolarity() {
    return Math.random() < 0.5 ? Polarity.Positive : Polarity.Negative;
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

  // Lattice dimensionality and the seed's initial radius (used only by the
  // cube→sphere layout morph now).
  dims = 3;
  ringRadius = 0;

  // Monotonic tick counter.
  _tickId = 0;

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

  // A ray "turns around" to one of its OTHER boundaries (superposed — one
  // chosen at random for now). Returns the current one if there's nothing
  // else to turn to.
  private otherBoundary(ray: Ray, exclude: Boundary): Boundary {
    const others = ray.boundaries.filter(b => b !== exclude);
    if (!others.length) return exclude;
    return others[Math.floor(Math.random() * others.length)];
  }

  // Annihilate a single connection (the mutual boundaries a↔b) and MERGE the
  // two nodes into one, keeping every other connection (spatial direction) of
  // both. Only this one link is destroyed. The `removed` set records nodes
  // that were merged away so the tick loop skips them.
  private mergeConnection(rA: Ray, a: Boundary, rB: Ray, b: Boundary, removed: Set<node>) {
    const A = rA.node, B = rB.node;

    // Destroy just this connection.
    rA.boundaries = rA.boundaries.filter(x => x !== a);
    rB.boundaries = rB.boundaries.filter(x => x !== b);
    if (rA.moving === a) rA.moving = rA.boundaries.length ? rA.boundaries[Math.floor(Math.random() * rA.boundaries.length)] : undefined;
    if (rB.moving === b) rB.moving = rB.boundaries.length ? rB.boundaries[Math.floor(Math.random() * rB.boundaries.length)] : undefined;

    if (A === B) return; // already the same node — the connection was internal

    // Merge B's rays into A (every remaining boundary comes along; their
    // targets still point at the same Boundary objects, now reachable via A).
    for (const ray of B) {
      ray.node = A;
      A.push(ray);
    }

    this.gridPos.delete(B);
    this.nodes = this.nodes.filter(n => n !== B);
    removed.add(B);
  }

  tick() {
    this._tickId++;

    // Every node is evaluated, but each acts on only its single `moving`
    // direction. Snapshot the rays first so structural changes (merges,
    // new points) don't disturb iteration.
    const rays: Ray[] = [];
    for (const node of this.nodes)
      for (const ray of node)
        rays.push(ray);

    const removed = new Set<node>();

    for (const r of rays) {
      if (removed.has(r.node)) continue;

      const a = r.moving;              // the single direction this ray executes
      if (!a) continue;

      const b = a.target;              // the boundary it is moving towards
      if (!b) continue;

      const r2 = b.at;                 // the ray on the far side
      if (removed.has(r2.node)) continue;
      if (r.node === r2.node) continue; // already merged into one node

      // Is the far side moving back towards us along this same connection?
      const mutual = r2.moving === b && b.target === a;

      if (mutual) {
        if (a.polarity !== b.polarity) {
          // Opposite polarities head-on → annihilate this connection and
          // merge the two nodes (keeping their other spatial directions).
          this.mergeConnection(r, a, r2, b, removed);
        } else {
          // Same polarity head-on → both turn around to (superposed) their
          // other boundaries.
          r.moving = this.otherBoundary(r, a);
          r2.moving = this.otherBoundary(r2, b);
        }
      } else {
        // One-sided: r is moving into b's node, but b isn't pointing back.
        // Take the spatial structure of the node we're moving towards and
        // place it on ourselves.
        const from = this.gridPos.get(r2.node);
        if (from) {
          // TODO: decide what to do with my OWN previous spatial structure —
          // for now it is simply overwritten by the one we moved into.
          this.gridPos.set(r.node, from.slice());
        }
      }
    }

    // Space creation: a same-polarity connection whose two nodes are BOTH
    // moving away from it (neither's single direction is this connection)
    // sprouts a new spatial point in between.
    const seen = new Set<Boundary>();
    const toCreate: [Boundary, Boundary][] = [];
    for (const node of this.nodes) {
      if (removed.has(node)) continue;
      for (const ray of node) {
        for (const a of ray.boundaries) {
          const b = a.target;
          if (!b || seen.has(a) || seen.has(b)) continue;
          seen.add(a); seen.add(b);
          if (a.polarity !== b.polarity) continue;          // must be same polarity
          const rA = a.at, rB = b.at;
          if (!rA.moving || !rB.moving) continue;           // both must be moving
          if (rA.moving === a || rB.moving === b) continue; // and moving AWAY, not into
          toCreate.push([a, b]);
        }
      }
    }
    for (const [a, b] of toCreate) this.createSpaceBetween(a, b);

    this.invalidateLayout();
  }

  // Insert a fresh spatial point X between the nodes connected by a↔b, so
  // A—X—B. X sits at their midpoint, with two boundaries (facing A and B) of
  // random polarity, and a random movement direction.
  private createSpaceBetween(a: Boundary, b: Boundary) {
    const A = a.at.node, B = b.at.node;
    const pA = this.gridPos.get(A), pB = this.gridPos.get(B);
    if (!pA || !pB) return;
    const mid = pA.map((v, i) => (v + pB[i]) / 2);

    const x: node = [];
    const rx = new Ray(x, this);
    rx.boundaries = []; // drop the constructor's default

    const xa = new Boundary(rx, this); // faces A
    xa.polarity = Universe.randomPolarity();
    xa.target = a;

    const xb = new Boundary(rx, this); // faces B
    xb.polarity = Universe.randomPolarity();
    xb.target = b;

    rx.boundaries.push(xa, xb);

    // Splice X into the connection: A—X—B.
    a.target = xa;
    b.target = xb;

    // Random initial movement direction.
    rx.moving = Universe.random(rx.boundaries);

    this.nodes.push(x);
    this.gridPos.set(x, mid);
  }

  /**
   * Seed an initial "expanding universe": a small connected patch of nodes,
   * each a single ray with one boundary per orthogonal neighbour. Every
   * boundary gets a random polarity, and every ray a random `moving`
   * direction (one of its boundaries). From there the tick rules —
   * annihilation (opposite polarities meeting head-on), turn-around (like
   * polarities meeting head-on), and structure-absorption (one-sided
   * approach) — drive the evolution.
   */
  static expandingGrid(dims: number, size = 10): Graph {
    const graph = new Graph();
    graph.dims = dims;
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

    // One node per cell — each is a single ray with no boundaries yet.
    for (const idx of coords) {
      const coord = idx.map(v => v - center);
      const node: node = [];
      const ray = new Ray(node, graph);
      ray.boundaries = []; // drop the constructor's default boundary

      graph.nodes.push(node);
      graph.gridPos.set(node, coord);
      byCoord.set(key(coord), node);
      coordOf.set(node, coord);
    }

    // One boundary per orthogonal neighbour, each a random polarity. Remember
    // which boundary of a node faces which neighbour, so the pair can be
    // wired as mutual targets afterwards.
    const facing = new Map<node, Map<node, Boundary>>();
    for (const node of graph.nodes) {
      const coord = coordOf.get(node)!;
      const ray = node[0];
      const m = new Map<node, Boundary>();
      facing.set(node, m);

      for (let axis = 0; axis < dims; axis++) {
        for (const dir of [-1, 1]) {
          const nc = coord.slice();
          nc[axis] += dir;
          const neighbour = byCoord.get(key(nc));
          if (!neighbour) continue;

          const b = new Boundary(ray, graph);
          b.polarity = Universe.randomPolarity();
          ray.boundaries.push(b);
          m.set(neighbour, b);
        }
      }
    }

    // Wire mutual targets: this node's boundary facing a neighbour points at
    // that neighbour's boundary facing back.
    for (const node of graph.nodes) {
      const m = facing.get(node)!;
      for (const [neighbour, b] of m) {
        const back = facing.get(neighbour)!.get(node);
        if (back) b.target = back;
      }
    }

    // Give every ray an initial movement direction — a random one of its
    // boundaries.
    for (const node of graph.nodes) {
      const ray = node[0];
      if (ray.boundaries.length)
        ray.moving = ray.boundaries[Math.floor(Math.random() * ray.boundaries.length)];
    }

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

  // The directional movement of this ray: the boundary (one of its own) it
  // is currently moving towards. It heads towards the node on the far side
  // of that boundary's connection (moving.target's node).
  moving?: Boundary;

  constructor(
    public node: node, // reassignable: nodes merge on annihilation
    graph: Graph
  ) {
    this.id = NEXT_ID++;

    node.push(this);

    this.boundaries.push(
      new Boundary(this, graph)
    );
  }
}

class Boundary {
  polarity: Polarity = Polarity.Positive;

  get source(): Boundary { return Universe.random(this.at.boundaries.filter(x => x !== this)); }

  // The boundary on the neighbouring node this one connects to / points at.
  target?: Boundary;

  constructor(public at: Ray, private readonly graph: Graph) { }

  positive() { this.polarity = Polarity.Positive; }
  negative() { this.polarity = Polarity.Negative; }
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
  // Seed the initial polarity universe; Graph.tick (annihilation /
  // turn-around / structure-absorption) evolves it while running.
  const [graph, setGraph] = useState(() => Graph.expandingGrid(3));

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

      // Connections — one faint line per boundary link (deduped), following
      // the actual graph structure, so merged and newly-created nodes read
      // correctly wherever they sit.
      ctx.strokeStyle = "rgba(140,150,180,0.3)";
      ctx.lineWidth = 2.2;
      const idxOf = new Map<node, number>();
      graph.nodes.forEach((nd, i) => idxOf.set(nd, i));
      const drawnEdge = new Set<string>();
      for (const nd of graph.nodes) {
        const a = pts.get(nd);
        if (!a || a.clipped) continue;
        for (const ray of nd) {
          for (const bd of ray.boundaries) {
            const other = bd.target?.at.node;
            if (!other || other === nd) continue;
            const ia = idxOf.get(nd)!, ib = idxOf.get(other)!;
            const ek = ia < ib ? ia + "-" + ib : ib + "-" + ia;
            if (drawnEdge.has(ek)) continue;
            drawnEdge.add(ek);
            const b = pts.get(other);
            if (!b || b.clipped) continue;
            if (!onScreen(a) && !onScreen(b)) continue;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
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
        const mv = nd[0] && nd[0].moving;
        if (!mv) continue;
        const wpos = layout.get(nd);
        if (!wpos) continue;
        // Positive polarity glows one way, Negative the other.
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

        // Movement: draw each ray's selected `moving` direction as a thick
        // segment towards the node it is heading into, coloured by that
        // boundary's polarity (Positive amber, Negative cyan).
        ctx.lineCap = "round";
        for (const ray of n) {
          const mv = ray.moving;
          if (!mv || !mv.target) continue;
          const tp = pts.get(mv.target.at.node);
          if (!tp || tp.clipped) continue;

          const dx = tp.x - p.x, dy = tp.y - p.y;
          const len = Math.hypot(dx, dy);
          if (len < 1) continue;
          const ux = dx / len, uy = dy / len;
          const L = len * 0.4;

          ctx.strokeStyle = mv.polarity === Polarity.Positive ? "#FF7A45" : "#3DDCFF";
          ctx.lineWidth = 4 * depth;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + ux * L, p.y + uy * L);
          ctx.stroke();
        }
        ctx.lineCap = "butt";

        // Node dot.
        ctx.fillStyle = "#EDEFF5";
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.5, 2.4 * depth), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Step the polarity dynamics once every TICK_INTERVAL seconds while
    // running — annihilation / turn-around / structure-absorption.
    const TICK_INTERVAL = 0.45;
    let tickAccum = 0;

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (running && graph.nodes.length > 0) {
        tickAccum += dt;
        while (tickAccum >= TICK_INTERVAL) {
          tickAccum -= TICK_INTERVAL;
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