import { useEffect, useRef, useState, useCallback } from "react";

/* ---------------------------------------------------------------------
 * Core model — faithful port of Op / Boundary / Ray, plus a spatial
 * GridNode wrapper (position + velocity) so the abstract graph can be
 * laid out and drawn. Nothing here is React-specific.
 * ------------------------------------------------------------------- */

const Op = { Repell: "Repell", Attract: "Attract", Neutral: "Neutral" };

class Boundary {
  constructor(at) {
    this.op = Op.Neutral;
    this.at = at;
    this.target = null;
  }
  repell() {
    /* like repels like — no structural change, just displacement */
  }
  attract() {
    /* unused by the expanding-grid seed: no Attract boundaries exist yet */
  }
}

class Ray {
  constructor(direction) {
    this.direction = direction; // unit vector this Ray's Repell boundary faces
    this.boundaries = [new Boundary(this)];
  }
}

class GridNode {
  // node = Ray[] in the original model; this wraps that with spatial state
  // so the same graph can be force-laid-out and rendered. gridPos is null
  // for nodes that don't belong to the lattice (repell-spawned space
  // markers) — those are driven entirely by the generic physics in
  // step(), never by the deterministic gridPos×scaleFactor placement.
  constructor(pos, isCenter, gridPos = pos) {
    this.gridPos = gridPos ? gridPos.slice() : null;
    this.pos = pos.slice();
    this.vel = pos.map(() => 0);
    this.isCenter = isCenter;
    this.isPhoton = false;
    this.weight = 1; // accumulates when this node consumes another
    this.rays = [];
  }
  get repelCount() {
    let n = 0;
    for (const ray of this.rays) {
      for (const b of ray.boundaries) if (b.op === Op.Repell) n++;
    }
    return n;
  }
  hasOp(op) {
    return this.rays.some((ray) => ray.boundaries[0].op === op);
  }
}

// A ray's direction is one of the grid's own cardinal axes (±x, ±y, ±z —
// exactly what a mesh-neighbor direction actually is), not an arbitrary
// continuous direction. This is what makes tryConsume's alignment check
// meaningful (dot product lands at exactly 1 when a ray really does point
// at an occupied neighbor slot) and what makes rays render along the same
// grid lines the mesh edges use, instead of at odd, unrelated angles.
function randomDir(d) {
  const axis = Math.floor(Math.random() * d);
  const sign = Math.random() < 0.5 ? -1 : 1;
  const v = new Array(d).fill(0);
  v[axis] = sign;
  return v;
}

// 40% Repell / 30% Attract / 30% Neutral — enough Repell to keep the
// expansion-frontier glow visible, enough Attract density that adjacent
// cells occasionally line up for an Attract ray to consume its neighbor.
function randomOp() {
  const r = Math.random();
  if (r < 0.4) return Op.Repell;
  if (r < 0.7) return Op.Attract;
  return Op.Neutral;
}

// The axis-aligned direction that points toward center along whichever
// coordinate is largest in magnitude — the one that actually put this
// cell at its current ring distance. Used as the boundary's guaranteed
// inward Repell ray (see below) rather than leaving it to random chance.
function primaryInwardDir(gridPos, d) {
  let axis = 0, maxAbs = -1;
  for (let i = 0; i < d; i++) {
    const a = Math.abs(gridPos[i]);
    if (a > maxAbs) {
      maxAbs = a;
      axis = i;
    }
  }
  const dir = new Array(d).fill(0);
  dir[axis] = gridPos[axis] > 0 ? -1 : 1;
  return dir;
}

/**
 * Universe.nD_Expanding — seeds a (2·1+1)^d grid (3×3 for d=2, 3×3×3 for d=3).
 * Every non-center cell gets two rays, both pointing inward (toward
 * center along whichever axis is largest — see primaryInwardDir): that
 * direction is deterministic, defining the cell's structural place in
 * the lattice. Each ray's op (Repell/Attract/Neutral) is independently
 * random. The grid's own structure carries the ops directly — there is
 * no separate node holding them. The center cell gets a single Repell
 * ray with no direction — it's the seed the rest of the grid expands
 * from.
 */
function nD_Expanding(d, size = 3) {
  const center = Math.floor(size / 2);
  const coords = [];
  (function build(prefix) {
    if (prefix.length === d) {
      coords.push(prefix);
      return;
    }
    for (let i = 0; i < size; i++) build([...prefix, i]);
  })([]);

  const nodes = coords.map((idx) => {
    const c = idx.map((v) => v - center);
    const isCenter = c.every((v) => v === 0);
    const node = new GridNode(c, isCenter);

    if (isCenter) {
      const seed = new Ray(c.map(() => 0));
      seed.boundaries[0].op = Op.Repell;
      node.rays.push(seed);
    } else {
      // Direction is deterministic (inward, defining this cell's place in
      // the lattice); op is random. The grid's own structure carries the
      // ops directly — there's no separate node holding them.
      const inward = primaryInwardDir(c, d);
      for (let k = 0; k < 2; k++) {
        const ray = new Ray(inward.slice());
        ray.boundaries[0].op = randomOp();
        node.rays.push(ray);
      }
    }
    return node;
  });

  const keyOf = (c) => c.join(",");
  const byKey = new Map(nodes.map((n) => [keyOf(n.pos), n]));

  // Boundary.target: both of a cell's Repell boundaries target the same
  // inward neighbor (one step closer to center) — "superposed ... targeting
  // inward". This is the semantic op-graph the Ray/Boundary model actually
  // acts on, kept separate from the mesh below.
  for (const n of nodes) {
    if (n.isCenter) continue;
    const parentPos = n.pos.map((v) => v - Math.sign(v));
    const parent = byKey.get(keyOf(parentPos));
    if (parent) {
      for (const ray of n.rays) ray.boundaries[0].target = parent.rays[0].boundaries[0];
    }
  }

  // Rendering/layout mesh: full orthogonal grid adjacency — every cell to
  // its lattice neighbors — so what's on screen reads as an actual grid
  // (squares in 2D, a cube lattice in 3D) rather than spokes to the center.
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const manhattan = a.pos.reduce((s, v, k) => s + Math.abs(v - b.pos[k]), 0);
      if (manhattan === 1) edges.push([a, b]);
    }
  }

  const initialMaxR = Math.max(...nodes.map((n) => Math.hypot(...n.pos)), 1e-6);
  const byGridKey = new Map(nodes.map((n) => [keyOf(n.pos), n]));
  return { nodes, edges, tick: 0, initialMaxR, ringRadius: 1, scaleFactor: 1, freeCount: 0, freeQueue: [], nextGlobalTick: 0, globalTickId: 0, gridNodeCount: nodes.length, byGridKey };
}

/**
 * growShell — adds the next outer shell of the lattice (every cell at
 * Chebyshev distance ringRadius+1 from center). Each new cell gets two
 * rays, both pointing inward (see primaryInwardDir) — the deterministic
 * structure that defines the grid's shape. Each ray's op is independently
 * random (Repell/Attract/Neutral) — the grid's own structure carries the
 * ops directly, there's no separate node holding them. Spawn position is
 * exact (gridPos × current scaleFactor), so cells land in place
 * immediately.
 */
// Creates one grid cell at gridPos if that position isn't already
// occupied — no-op (returns null) otherwise. Shared by growShell's
// systematic ring-filling and by Repell-triggered spawning below, so
// both use the exact same cell structure and the exact same dedupe
// check: whichever gets there first wins, the other is just a no-op.
function createGridCell(sim, gridPos, d) {
  const keyOf = (c) => c.join(",");
  const byGridKey = sim.byGridKey;
  const key = keyOf(gridPos);
  if (byGridKey.has(key)) return null;

  const parentGridPos = gridPos.map((v) => v - Math.sign(v));
  const parent = byGridKey.get(keyOf(parentGridPos));

  const node = new GridNode(gridPos, false);
  // Position is fully deterministic — no Math.random() anywhere in this
  // calculation. Seeded from the parent's actual current position (found
  // via gridPos adjacency, but using the parent's real physics-driven
  // position, not a gridPos*scale formula) plus a tiny, deterministic
  // offset along this cell's own inward direction (same value every run
  // for the same graph state) — just enough to avoid two siblings
  // landing at the exact same coordinate, which would leave repulsion's
  // force direction undefined between them. The weak spring on the edge
  // below, plus repulsion, is what actually determines where this node
  // ends up — the seed position is only a deterministic starting point.
  const seedDir = primaryInwardDir(gridPos, d).map((v) => -v);
  const anchor = parent || sim.nodes[0];
  node.pos = anchor.pos.map((v, k) => v + seedDir[k] * 0.01);

  // Direction is deterministic (inward); op is random. The grid's own
  // structure carries the ops directly — no separate node holds them.
  const inward = primaryInwardDir(gridPos, d);
  for (let k = 0; k < 2; k++) {
    const ray = new Ray(inward.slice());
    ray.boundaries[0].op = randomOp();
    node.rays.push(ray);
  }

  if (parent && parent.rays[0]) {
    for (const ray of node.rays) ray.boundaries[0].target = parent.rays[0].boundaries[0];
  }

  byGridKey.set(key, node);
  for (let axis = 0; axis < d; axis++) {
    for (const step of [-1, 1]) {
      const np = gridPos.slice();
      np[axis] += step;
      const neighbor = byGridKey.get(keyOf(np));
      if (neighbor) sim.edges.push([node, neighbor]);
    }
  }

  sim.nodes.push(node);
  sim.gridNodeCount = (sim.gridNodeCount || 0) + 1;
  const ring = Math.max(...gridPos.map((v) => Math.abs(v)));
  if (ring > sim.ringRadius) sim.ringRadius = ring;

  return node;
}

function growShell(sim, d) {
  const newR = sim.ringRadius + 1;
  const newGridCoords = [];
  (function build(prefix) {
    if (prefix.length === d) {
      const maxAbs = Math.max(...prefix.map((v) => Math.abs(v)));
      if (maxAbs === newR) newGridCoords.push(prefix);
      return;
    }
    for (let i = -newR; i <= newR; i++) build([...prefix, i]);
  })([]);

  // Spawn position is exact, not estimated: gridPos × the current global
  // scale factor — that's what createGridCell uses. Nodes with a gridPos
  // skip the generic force-directed physics entirely (see step()) and
  // are driven purely by this scale factor, so they can't drift,
  // overlap, or destabilize regardless of grid size.
  for (const gridPos of newGridCoords) createGridCell(sim, gridPos, d);

  sim._forces = null; // resize physics buffers next step()
  sweep(sim);
}

/**
 * Reaction mechanics — the literal reading of repel/attract as space
 * creation/destruction: a Repell ray periodically sprouts a new node
 * ahead of itself (on a cooldown, so it's an ongoing trickle rather than
 * a one-time burst or a permanent exhaustion). An Attract ray, aimed
 * close enough at an actual neighbor, consumes it — the graph
 * restructures rather than anything going flying: the target is removed
 * and its other connections are inherited by the attacker, which is what
 * accumulates weight over time. When the attacker and target are BOTH
 * "matter" (an Attract ray and a Repell ray each), the encounter is an
 * annihilation instead: both are replaced by two photons. Two photons
 * that end up structurally connected pair-produce back into matter. None
 * of this uses velocity or movement — it's all graph restructuring, so
 * it can't reintroduce nodes "flying" anywhere.
 */
function markDead(sim, node) {
  node._dead = true;
  sim._anyDead = true;
  if (node.gridPos) sim.gridNodeCount = Math.max((sim.gridNodeCount || 0) - 1, 0);
  else sim.freeCount = Math.max((sim.freeCount || 0) - 1, 0);
}

function sweep(sim) {
  if (!sim._anyDead) return;
  sim.nodes = sim.nodes.filter((n) => !n._dead);
  sim.edges = sim.edges.filter(([a, b]) => !a._dead && !b._dead);
  if (sim.byGridKey) {
    for (const [k, v] of sim.byGridKey) {
      if (v._dead) sim.byGridKey.delete(k);
    }
  }
  sim._anyDead = false;
  sim._forces = null;
}

// Rewires target's OTHER edges (not the one to `keep`) onto `keep`,
// skipping anything already connected or dead. Shared by consume and
// annihilation — both replace a node but want its structure inherited.
function rewireOnto(sim, keep, from) {
  const keepNeighbors = new Set();
  for (const [ea, eb] of sim.edges) {
    if (ea === keep) keepNeighbors.add(eb);
    else if (eb === keep) keepNeighbors.add(ea);
  }
  for (const [ea, eb] of sim.edges) {
    let other = null;
    if (ea === from && eb !== keep) other = eb;
    else if (eb === from && ea !== keep) other = ea;
    if (other && !other._dead && other !== keep && !keepNeighbors.has(other)) {
      sim.edges.push([keep, other, true]);
      keepNeighbors.add(other);
    }
  }
}

// Rolling window: instead of ever blocking creation once the free-node
// budget is full, retire the oldest free node to make room first. Repel
// (and photon/pair-production) creation should never be stoppable — a
// hard cap that refuses new creation contradicts that, however generous
// the number. This keeps total count bounded through turnover instead.
function makeRoomForFreeNode(sim) {
  while ((sim.freeCount || 0) >= FREE_NODE_CAP && sim.freeQueue.length) {
    const oldest = sim.freeQueue.shift();
    if (!oldest._dead) markDead(sim, oldest);
  }
}

function spawnPhoton(sim, pos, dir) {
  makeRoomForFreeNode(sim);
  const node = new GridNode(pos, false, null);
  node.isPhoton = true;
  const ray = new Ray(dir.slice());
  ray.boundaries[0].op = Op.Neutral;
  node.rays.push(ray);
  sim.nodes.push(node);
  sim.freeQueue.push(node);
  sim.freeCount = (sim.freeCount || 0) + 1;
  return node;
}

function spawnMatter(sim, pos, dir, reversed) {
  makeRoomForFreeNode(sim);
  const node = new GridNode(pos, false, null);
  const front = new Ray(dir.slice());
  const back = new Ray(dir.map((v) => -v));
  if (!reversed) {
    front.boundaries[0].op = Op.Attract;
    back.boundaries[0].op = Op.Repell;
  } else {
    front.boundaries[0].op = Op.Repell;
    back.boundaries[0].op = Op.Attract;
  }
  node.rays.push(front, back);
  sim.nodes.push(node);
  sim.freeQueue.push(node);
  sim.freeCount = (sim.freeCount || 0) + 1;
  return node;
}

function isMatter(node) {
  return node.hasOp(Op.Attract) && node.hasOp(Op.Repell);
}

// Both nodes are "matter" and aligned — annihilate into two photons
// instead of a normal one-sided consume. Each photon inherits one side's
// other connections and points away from the collision, back-to-back —
// direction only, no velocity. Frontier nodes are exempt, same reasoning
// as tryConsume.
function isOnFrontier(sim, node) {
  return node.gridPos && Math.max(...node.gridPos.map((v) => Math.abs(v))) === sim.ringRadius;
}

function tryAnnihilate(sim, a, b) {
  if (a._dead || b._dead || a.isCenter || b.isCenter) return false;
  if (a.isPhoton || b.isPhoton) return false;
  if (isOnFrontier(sim, a) || isOnFrontier(sim, b)) return false;
  if (!isMatter(a) || !isMatter(b)) return false;

  const diff = a.pos.map((v, k) => v - b.pos[k]);
  const len = Math.hypot(...diff) || 1e-6;
  const dir = diff.map((v) => v / len);

  const aligned = (n1, n2, d) =>
    n1.rays.some((ray) => ray.boundaries[0].op === Op.Attract && ray.direction.reduce((s, v, k) => s + v * d[k], 0) > 0.75);
  const negDir = dir.map((v) => -v);
  if (!aligned(a, b, negDir) && !aligned(b, a, dir)) return false;

  const mid = a.pos.map((v, k) => (v + b.pos[k]) / 2);
  const p1 = spawnPhoton(sim, mid, dir);
  const p2 = spawnPhoton(sim, mid, negDir);
  rewireOnto(sim, p1, a);
  rewireOnto(sim, p2, b);
  markDead(sim, a);
  markDead(sim, b);
  return true;
}

// Two photons sharing an edge pair-produce back into matter, moving in
// the reverse of their incoming directions — mirrors annihilation.
function tryPairProduce(sim, a, b) {
  if (a._dead || b._dead) return false;
  if (!a.isPhoton || !b.isPhoton) return false;

  const mid = a.pos.map((v, k) => (v + b.pos[k]) / 2);
  const dirA = a.rays[0].direction.map((v) => -v);
  const dirB = b.rays[0].direction.map((v) => -v);
  const m1 = spawnMatter(sim, mid, dirA, false);
  const m2 = spawnMatter(sim, mid, dirB, true);
  rewireOnto(sim, m1, a);
  rewireOnto(sim, m2, b);
  markDead(sim, a);
  markDead(sim, b);
  return true;
}

// An Attract ray consumes whichever actual neighbor it's aimed closely
// enough at (dot product of ray direction vs. direction-to-neighbor).
// The target is removed, but its other edges are rewired onto the
// attacker — if A/2 points at B/5 and B also has rays 4 and 6 connecting
// it elsewhere, once B is consumed, 4 and 6 now connect to A instead of
// dangling or vanishing. Weight transfers along with the structure. The
// active frontier (the current outermost ring) is exempt — it's freshly
// spawned and would otherwise get eaten before it ever gets a chance to
// repel outward itself. It becomes a normal consumption target once a
// newer shell grows past it.
function tryConsume(sim, attacker, target) {
  if (attacker._dead || target._dead || target.isCenter) return false;
  if (attacker.isPhoton || target.isPhoton) return false;
  if (isOnFrontier(sim, target)) return false;
  const diff = target.pos.map((v, k) => v - attacker.pos[k]);
  const len = Math.hypot(...diff) || 1e-6;
  const dir = diff.map((v) => v / len);
  for (const ray of attacker.rays) {
    if (ray.boundaries[0].op !== Op.Attract) continue;
    if (ray._lastConsumeTick === sim.globalTickId) continue; // already acted this tick
    const dot = ray.direction.reduce((s, v, k) => s + v * dir[k], 0);
    if (dot <= 0.75) continue;

    rewireOnto(sim, attacker, target);
    attacker.weight += target.weight;
    ray._lastConsumeTick = sim.globalTickId;
    markDead(sim, target);
    return true;
  }
  return false;
}

/* ---------------------------------------------------------------------
 * Generic force-directed physics — this is what makes the renderer work
 * for "any arbitrary graph": mutual repulsion keeps nodes from
 * overlapping, spring edges keep connected nodes near each other. Repell
 * boundaries add one extra force on top: a push away from the origin,
 * scaled by how many Repell boundaries a node carries — which is the
 * literal mechanism of the expansion.
 * ------------------------------------------------------------------- */

const SPRING_K = 0.05; // almost nothing — just enough to keep connected pairs from drifting apart forever, not to hold any shape
const REWIRED_SPRING_K = 4.0; // strong — a consumption-driven connection is real graph structure and should actually pull
const REST_LEN = 1.0;
const EXPANSION_K = 0.85;
const DAMPING = 0.8;
const EXPANSION_RATE = 0.18; // exponential growth rate for gridPos-node scaling
const MAX_NODES = 10000;
const FREE_NODE_CAP = 4000; // separate budget for repel/photon-spawned nodes, independent of grid growth
const GLOBAL_TICK_INTERVAL = 0.9; // seconds between synchronized whole-graph repel/attract updates

function step(sim, dt, dim) {
  const { nodes, edges } = sim;
  const n = nodes.length;
  const dims = nodes[0].pos.length;

  // Deterministic scale factor for anything with a gridPos — exact
  // self-similar growth (v ∝ r, applied exactly rather than integrated),
  // so it can't drift, overlap, or destabilize no matter how large the
  // grid gets. This replaces relying on the force-directed physics below
  // to determine overall grid scale; that physics remains fully intact
  // and generic for future non-grid nodes (graph rewrites).
  sim.scaleFactor *= Math.exp(EXPANSION_RATE * dt);
  const scale = sim.scaleFactor;

  if (!sim._forces || sim._forces.length !== n) {
    sim._forces = new Array(n);
    for (let i = 0; i < n; i++) sim._forces[i] = new Array(dims).fill(0);
  }
  const forces = sim._forces;
  for (let i = 0; i < n; i++) for (let k = 0; k < dims; k++) forces[i][k] = 0;

  if (!sim._index) sim._index = new Map();
  const index = sim._index;
  index.clear();
  for (let i = 0; i < n; i++) index.set(nodes[i], i);

  const delta = new Array(dims);

  // Generic force-directed physics — springs from every edge, including
  // ones consumption has rewired into long-range connections. Rest length
  // tracks the current scale factor rather than a fixed constant: grid
  // spacing itself grows exponentially (scaleFactor), so a fixed rest
  // length would leave springs permanently fighting to compress a graph
  // that expansion is simultaneously stretching apart — that fight is
  // what physics couldn't keep pace with. With rest length tracking
  // scale, springs and expansion agree on target spacing, and spacing
  // emerges from the springs themselves rather than needing any position
  // reset, hard or soft.
  const restLen = REST_LEN * scale;
  for (const edge of edges) {
    const a = edge[0], b = edge[1];
    const k_spring = edge[2] ? REWIRED_SPRING_K : SPRING_K;
    const i = index.get(a), j = index.get(b);
    let distSq = 0;
    for (let k = 0; k < dims; k++) {
      delta[k] = b.pos[k] - a.pos[k];
      distSq += delta[k] * delta[k];
    }
    const dist = Math.sqrt(distSq) || 1e-4;
    const f = (k_spring * (dist - restLen)) / dist;
    for (let k = 0; k < dims; k++) {
      const fk = delta[k] * f;
      forces[i][k] += fk;
      forces[j][k] -= fk;
    }
  }

  const dimBoost = dims === 3 ? 1.5 : 1;
  for (let i = 0; i < n; i++) {
    const node = nodes[i];
    if (node.isCenter || node.gridPos) continue;
    const f = node.repelCount * EXPANSION_K * dimBoost;
    for (let k = 0; k < dims; k++) forces[i][k] += node.pos[k] * f;
  }

  // Spatial repulsion between NEARBY nodes, independent of whether
  // they're connected by an edge at all. Springs only respond to graph
  // topology — a region with no rewired edges (like the fully
  // consumption-immune frontier) has nothing else pulling it away from
  // the shape its mesh topology implies, no matter how the springs
  // themselves are tuned. This is what gives every node genuine
  // positional freedom. Hash-bucketed so cost stays roughly O(n) instead
  // of O(n²): each node only checks nearby buckets, not the whole graph.
  //
  // This pairwise scan was measured at ~88% of total frame time once
  // population reached a couple thousand nodes — by far the dominant
  // cost. It's recomputed only every OTHER frame now; each node caches
  // its own repulsion contribution (a property on the node itself, so
  // it survives sweep() removing dead nodes and shifting indices) and
  // that cached value is reused untouched on the skipped frame.
  // Repulsion is a soft, continuous force, not collision detection — one
  // frame of staleness is physically safe and visually imperceptible,
  // and this roughly halves its effective cost.
  const REPEL_RADIUS = restLen * 3;
  const REPEL_RADIUS_SQ = REPEL_RADIUS * REPEL_RADIUS;
  const REPULSION_K = 1.3;
  const bucketSize = REPEL_RADIUS;

  sim._repulseFrameCounter = (sim._repulseFrameCounter || 0) + 1;
  const recomputeRepulsion = sim._repulseFrameCounter % 2 === 1;

  if (recomputeRepulsion) {
    if (!sim._neighborOffsets || sim._neighborOffsetsDims !== dims) {
      const offsets = [];
      (function buildOffsets(prefix) {
        if (prefix.length === dims) {
          offsets.push(prefix.slice());
          return;
        }
        for (const s of [-1, 0, 1]) buildOffsets([...prefix, s]);
      })([]);
      sim._neighborOffsets = offsets;
      sim._neighborOffsetsDims = dims;
    }
    // Numeric integer hash instead of array.map+join string keys — avoids
    // allocating an array and a string for every node on every frame.
    const P1 = 73856093, P2 = 19349663, P3 = 83492791;
    const cellCoord = new Array(dims);
    function hashCell(c) {
      let h = 0;
      if (dims > 0) h ^= (c[0] | 0) * P1;
      if (dims > 1) h ^= (c[1] | 0) * P2;
      if (dims > 2) h ^= (c[2] | 0) * P3;
      return h;
    }
    const buckets = new Map();
    for (let i = 0; i < n; i++) {
      const p = nodes[i].pos;
      for (let k = 0; k < dims; k++) cellCoord[k] = Math.floor(p[k] / bucketSize);
      const key = hashCell(cellCoord);
      let arr = buckets.get(key);
      if (!arr) buckets.set(key, (arr = []));
      arr.push(i);
    }
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      if (!node._repulseForce || node._repulseForce.length !== dims) node._repulseForce = new Array(dims).fill(0);
    }
    for (let i = 0; i < n; i++) for (let k = 0; k < dims; k++) nodes[i]._repulseForce[k] = 0;
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      for (let k = 0; k < dims; k++) cellCoord[k] = Math.floor(node.pos[k] / bucketSize);
      for (const offset of sim._neighborOffsets) {
        for (let k = 0; k < dims; k++) cellCoord[k] += offset[k];
        const key = hashCell(cellCoord);
        for (let k = 0; k < dims; k++) cellCoord[k] -= offset[k]; // restore for next offset
        const bucketNodes = buckets.get(key);
        if (!bucketNodes) continue;
        for (const j of bucketNodes) {
          if (j <= i) continue; // each pair considered exactly once
          const other = nodes[j];
          let distSq2 = 0;
          for (let k = 0; k < dims; k++) {
            delta[k] = other.pos[k] - node.pos[k];
            distSq2 += delta[k] * delta[k];
          }
          if (distSq2 >= REPEL_RADIUS_SQ) continue; // cheap reject before the sqrt below
          const d2 = Math.sqrt(distSq2) || 1e-4;
          const f2 = (REPULSION_K * (REPEL_RADIUS - d2)) / d2;
          for (let k = 0; k < dims; k++) {
            const fk = delta[k] * f2;
            node._repulseForce[k] -= fk;
            other._repulseForce[k] += fk;
          }
        }
      }
    }
  }

  for (let i = 0; i < n; i++) {
    const node = nodes[i];
    if (!node._repulseForce) continue; // just created this frame on a skip-frame; gets a fresh value next recompute
    for (let k = 0; k < dims; k++) forces[i][k] += node._repulseForce[k];
  }

  const MAX_FORCE = 400;
  const MAX_VEL = 150;

  for (let i = 0; i < n; i++) {
    const node = nodes[i];

    if (node.isCenter) {
      for (let k = 0; k < dims; k++) node.vel[k] = 0;
      continue;
    }

    let fMagSq = 0;
    for (let k = 0; k < dims; k++) fMagSq += forces[i][k] * forces[i][k];
    if (fMagSq > MAX_FORCE * MAX_FORCE) {
      const s = MAX_FORCE / Math.sqrt(fMagSq);
      for (let k = 0; k < dims; k++) forces[i][k] *= s;
    }

    let vMagSq = 0;
    for (let k = 0; k < dims; k++) {
      node.vel[k] = (node.vel[k] + forces[i][k] * dt) * DAMPING;
      vMagSq += node.vel[k] * node.vel[k];
    }
    if (vMagSq > MAX_VEL * MAX_VEL) {
      const s = MAX_VEL / Math.sqrt(vMagSq);
      for (let k = 0; k < dims; k++) node.vel[k] *= s;
    }

    for (let k = 0; k < dims; k++) {
      node.pos[k] += node.vel[k] * dt;
      if (!Number.isFinite(node.pos[k])) node.pos[k] = 0;
    }
  }

  // One synchronized global tick governs everything: grid growth (one new
  // ring — 3×3 → 5×5 → 7×7, exactly one ring per tick) and every
  // Repell/Attract boundary in the graph, together. Not independent
  // timers. On each tick the whole graph is scanned: every un-consumed
  // edge is checked for annihilation/pair-production/consumption, and
  // every Repell ray fires. Repell is never spent and never individually
  // throttled — a boundary keeps expanding on every single global tick,
  // unconditionally.
  if (sim.tick >= (sim.nextGlobalTick || 0)) {
    sim.nextGlobalTick = sim.tick + GLOBAL_TICK_INTERVAL;
    sim.globalTickId = (sim.globalTickId || 0) + 1;

    // Snapshot the edge count first — rewireOnto (inside tryConsume/
    // tryAnnihilate) pushes new edges onto this exact array. Iterating a
    // live, growing array meant a newly-rewired edge got immediately
    // reprocessed by this same loop, which could trigger further
    // consumption on a different node's still-unspent ray, pushing more
    // edges, reprocessed again — an unbounded same-tick cascade once it
    // reached a high-weight, high-degree node. Newly-rewired edges now
    // get their first chance on the NEXT tick instead, same as growShell.
    const edgeCountAtTickStart = edges.length;
    for (let ei = 0; ei < edgeCountAtTickStart; ei++) {
      const [a, b] = edges[ei];
      if (a._dead || b._dead) continue;
      if (a.isPhoton && b.isPhoton) {
        tryPairProduce(sim, a, b);
        continue;
      }
      if (a.isPhoton || b.isPhoton) continue;
      if (tryAnnihilate(sim, a, b)) continue;
      tryConsume(sim, a, b);
      tryConsume(sim, b, a);
    }

    // Repell-triggered spawning: any grid cell with a Repell-op ray tries
    // to create a new cell one step further outward, using the exact
    // same mechanism growShell uses (createGridCell). Most of these
    // no-op — the target position is already filled by growShell's own
    // systematic growth — except right at the frontier (genuinely empty)
    // or over a gap left by consumption (regrows it). That self-limits
    // the real work to roughly the frontier's surface area without
    // needing an explicit frontier check. Bounded by n (the tick-start
    // node count) so newly-created cells this tick aren't immediately
    // rescanned — same reasoning as the edge-scan snapshot above.
    if ((sim.gridNodeCount || 0) < MAX_NODES) {
      for (let i = 0; i < n; i++) {
        const cell = nodes[i];
        if (cell._dead || cell.isCenter || !cell.gridPos) continue;
        for (const ray of cell.rays) {
          if (ray.boundaries[0].op !== Op.Repell) continue;
          const outward = ray.direction.map((v) => -v);
          const targetPos = cell.gridPos.map((v, k) => v + (outward[k] || 0));
          createGridCell(sim, targetPos, dim);
        }
      }
    }

    if ((sim.gridNodeCount || 0) < MAX_NODES) growShell(sim, dim);
  }
  sweep(sim);
}

/* ---------------------------------------------------------------------
 * Projection + drawing
 * ------------------------------------------------------------------- */

function project(pos, dim, rot, tilt, camDist) {
  const x = pos[0] || 0, y = pos[1] || 0, z = pos[2] || 0;
  if (dim === 2) return { x, y, depth: 1, clipped: false };
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

function draw(ctx, canvas, sim, dim, cam, dt) {
  const w = canvas.clientWidth, h = canvas.clientHeight;

  ctx.fillStyle = "#06070c";
  ctx.fillRect(0, 0, w, h);
  const vg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.05);
  vg.addColorStop(0, "rgba(20,22,34,0)");
  vg.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);

  if (!sim) return;

  // Raw world extent (unprojected) — this is what the base pixel scale
  // tracks, deliberately independent of camera distance/perspective, so
  // there's no feedback loop between "how far the camera has dollied" and
  // "how much of the grid fits on screen". A real camera doesn't refit
  // its FOV to guarantee everything stays visible as it moves closer.
  let worldExtent = 1e-6;
  for (const n of sim.nodes) {
    const r = Math.hypot(...n.pos);
    if (r > worldExtent) worldExtent = r;
  }

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
  if (dim === 3) {
    cam.dist = worldExtent * (cam.distMult || 1.5);
    cam.scale = (Math.min(w, h) * 0.38) / worldExtent;
  } else {
    cam.scale = ((Math.min(w, h) * 0.38) / worldExtent) * (cam.scaleMult || 1);
  }

  // Cursor-anchored pan only applies in 2D — there's no camera distance to
  // dolly there, so screen-space zoom-toward-cursor is the natural
  // control. In 3D the camera orbits/dollies toward the origin, which is
  // the standard convention for an orbit camera.
  const panX = dim === 2 && cam.anchor ? cam.anchor.screenX - cam.anchor.worldX * cam.scale : 0;
  const panY = dim === 2 && cam.anchor ? cam.anchor.screenY - cam.anchor.worldY * cam.scale : 0;
  const cx = w / 2 + panX, cy = h / 2 + panY;

  const projected = new Map();
  for (const n of sim.nodes) {
    projected.set(n, project(n.pos, dim, cam.rot, cam.tilt, cam.dist || 1));
  }

  const pts = new Map();
  for (const [n, p] of projected) {
    pts.set(n, { x: cx + p.x * cam.scale, y: cy + p.y * cam.scale, depth: p.depth, clipped: p.clipped });
  }

  // Viewport culling: skip the detailed rendering work (ray projection,
  // shadowBlur, stroke/fill calls) for anything clearly off-screen. Once
  // zoomed into part of a large structure, most of the population isn't
  // actually visible — this is what stops paying for it anyway. Margin
  // is generous (a couple of scale-units of screen space) so a node just
  // outside the canvas edge doesn't have its still-visible ray tip
  // prematurely clipped.
  const cullMargin = cam.scale * 2;
  const onScreen = (p) => p.x > -cullMargin && p.x < w + cullMargin && p.y > -cullMargin && p.y < h + cullMargin;

  for (const [n, parent] of sim.edges) {
    const a = pts.get(n), b = pts.get(parent);
    if (a.clipped || b.clipped) continue;
    if (!onScreen(a) && !onScreen(b)) continue;
    const w = Math.max(n.weight, parent.weight);
    if (w > 1) {
      const boost = Math.min(w - 1, 6);
      ctx.strokeStyle = `rgba(199,175,255,${Math.min(0.16 + boost * 0.1, 0.7)})`;
      ctx.lineWidth = 1 + boost * 0.35;
    } else {
      ctx.strokeStyle = "rgba(120,130,160,0.16)";
      ctx.lineWidth = 1;
    }
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  for (const n of sim.nodes) {
    const p = pts.get(n);
    if (p.clipped) continue;
    if (!onScreen(p)) continue;
    const depth = dim === 3 ? Math.min(Math.max(p.depth, 0.4), 1.6) : 1;

    if (n.isCenter) {
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

    if (n.isPhoton) {
      const dir = n.rays[0].direction;
      const tipPos = n.pos.map((v, k) => v + (dir[k] || 0) * 0.5);
      const tip = project(tipPos, dim, cam.rot, cam.tilt, cam.dist || 1);
      const tx = cx + tip.x * cam.scale, ty = cy + tip.y * cam.scale;
      const rayLen = Math.hypot(tx - p.x, ty - p.y);
      if (!tip.clipped && Number.isFinite(tx) && Number.isFinite(ty) && rayLen < cam.scale * 6) {
        ctx.strokeStyle = "#FFE9A8";
        ctx.lineWidth = 2 * depth;
        ctx.shadowColor = "#FFE9A8";
        ctx.shadowBlur = Math.min(Math.max(cam.scale * 0.06, 2), 16);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = "#FFF6DC";
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.min(Math.max(cam.scale * 0.07 * depth, 0.6), 11), 0, Math.PI * 2);
      ctx.fill();
      continue;
    }

    // Draw each ray colored by its own op — Repell (amber) vs Attract
    // (cyan) vs Neutral (not drawn). A node with both an Attract and a
    // Repell ray gets a bright core, since it can both consume neighbors
    // and sprout new structure.
    let hasAttract = false, hasRepell = false;
    for (const ray of n.rays) {
      const op = ray.boundaries[0].op;
      if (op === Op.Attract) hasAttract = true;
      if (op === Op.Repell) hasRepell = true;
      if (op === Op.Neutral) continue;

      const dir = op === Op.Repell ? ray.direction.map((v) => -v) : ray.direction;
      const tipPos = n.pos.map((v, k) => v + (dir[k] || 0) * 0.45);
      const tip = project(tipPos, dim, cam.rot, cam.tilt, cam.dist || 1);
      const tx = cx + tip.x * cam.scale, ty = cy + tip.y * cam.scale;
      const rayLen = Math.hypot(tx - p.x, ty - p.y);
      // The tip point sits farther from origin than the node itself, so
      // under true perspective it can cross the near-clip plane (or blow
      // up near it) even when the node doesn't — skip degenerate tips
      // rather than draw a stray line to screen-center.
      if (!(!tip.clipped && Number.isFinite(tx) && Number.isFinite(ty) && rayLen < cam.scale * 6)) continue;

      // A Repell ray on an interior (non-frontier) cell still exists — it
      // just stopped being "the active boundary". Rendered dim rather
      // than hidden, so a node's true op composition (e.g. an attractor
      // that also has a repell ray) is never visually lied about; only
      // the frontier gets the bright glow.
      const onFrontierNow = n.gridPos ? isOnFrontier(sim, n) : true;
      const dim_ = op === Op.Repell && !onFrontierNow;
      const color = op === Op.Repell ? "#FF7A45" : "#3DDCFF";
      ctx.strokeStyle = dim_ ? "rgba(255,122,69,0.35)" : color;
      ctx.lineWidth = (dim_ ? 1 : 1.6) * depth;
      if (!dim_) {
        ctx.shadowColor = color;
        ctx.shadowBlur = Math.min(Math.max(cam.scale * 0.045, 1), 9);
      }
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    const isMatter = hasAttract && hasRepell;
    const weightBoost = 1 + Math.min(n.weight - 1, 6) * 0.12;
    ctx.fillStyle = isMatter ? "#EDEFF5" : "#5A5F72";
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.min(Math.max(cam.scale * (isMatter ? 0.075 : 0.05) * depth * weightBoost, 0.5), 16), 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ---------------------------------------------------------------------
 * Component
 * ------------------------------------------------------------------- */

export default function ExpandingUniverse() {
  const canvasRef = useRef(null);
  const simRef = useRef(null);
  const camRef = useRef({ scale: 44, rot: 0, tilt: 0.6155, anchor: null, dist: null, distMult: 1.5, scaleMult: 1 });
  const lastReadoutRef = useRef(0);

  const [dim, setDim] = useState(2);
  const [running, setRunning] = useState(true);
  const [readout, setReadout] = useState({ tick: "0.0", factor: "1.00", nodes: 0, gridNodes: 0, ring: 1 });

  const reset = useCallback((d) => {
    simRef.current = nD_Expanding(d, 3);
    camRef.current.rot = d === 3 ? Math.PI / 4 : 0;
    camRef.current.tilt = 0.6155;
    camRef.current.anchor = null;
    camRef.current.distMult = 1.5;
    camRef.current.scaleMult = 1;
  }, []);

  useEffect(() => {
    reset(dim);
  }, [dim, reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
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
    function onWheel(e) {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.001);
      const cam = camRef.current;

      if (dim === 3) {
        cam.distMult = Math.min(Math.max((cam.distMult || 1.5) / factor, 0.01), 200);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const rx = e.clientX - rect.left - rect.width / 2;
      const ry = e.clientY - rect.top - rect.height / 2;
      const curPanX = cam.anchor ? cam.anchor.screenX - cam.anchor.worldX * cam.scale : 0;
      const curPanY = cam.anchor ? cam.anchor.screenY - cam.anchor.worldY * cam.scale : 0;
      cam.anchor = {
        worldX: (rx - curPanX) / cam.scale,
        worldY: (ry - curPanY) / cam.scale,
        screenX: rx,
        screenY: ry,
      };
      cam.scaleMult = Math.min(Math.max((cam.scaleMult || 1) * factor, 1e-4), 1e4);
    }
    canvas.addEventListener("wheel", onWheel, { passive: false });

    // Right-click drag to orbit (3D) — horizontal drag rotates, vertical
    // drag adjusts tilt. Suppress the browser context menu so right-click
    // is free to use as a drag button.
    function onContextMenu(e) {
      e.preventDefault();
    }
    canvas.addEventListener("contextmenu", onContextMenu);

    let dragging = false;
    let lastX = 0, lastY = 0;
    function onMouseDown(e) {
      if (e.button !== 2) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function onMouseMove(e) {
      if (!dragging) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const cam = camRef.current;
      cam.rot += dx * 0.006;
      cam.tilt = Math.min(Math.max(cam.tilt + dy * 0.006, -1.15), 1.15);
    }
    function onMouseUp(e) {
      if (e.button === 2) dragging = false;
    }
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const sim = simRef.current;

      if (sim && running) {
        step(sim, dt * 1.3, dim);
        sim.tick += dt;
      }
      draw(ctx, canvas, sim, dim, camRef.current, dt);

      if (sim && now - lastReadoutRef.current > 200) {
        lastReadoutRef.current = now;
        setReadout({
          tick: sim.tick.toFixed(1),
          factor: sim.scaleFactor.toFixed(2),
          nodes: sim.nodes.length,
          gridNodes: sim.gridNodeCount || 0,
          ring: sim.ringRadius,
        });
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("contextmenu", onContextMenu);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dim, running]);

  const pillStyle = (active) => ({
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: 12,
    letterSpacing: 0.5,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    border: `1px solid ${active ? "#FF7A45" : "rgba(255,255,255,0.15)"}`,
    background: active ? "rgba(255,122,69,0.14)" : "rgba(255,255,255,0.03)",
    color: active ? "#FFD9A8" : "#9BA0B3",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 560,
        background: "#06070c",
        borderRadius: 16,
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%", cursor: "grab" }} />
      </div>

      <div style={{ position: "absolute", top: 16, left: 16, display: "flex", gap: 8 }}>
        {[2, 3].map((d) => (
          <button key={d} onClick={() => setDim(d)} style={pillStyle(dim === d)}>
            {d}D
          </button>
        ))}
        <button onClick={() => reset(dim)} style={pillStyle(false)}>
          reset
        </button>
        <button onClick={() => setRunning((r) => !r)} style={pillStyle(false)}>
          {running ? "pause" : "resume"}
        </button>
        <span
          style={{
            alignSelf: "center",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 10,
            color: "#4A4E5A",
            marginLeft: 4,
          }}
        >
          scroll to zoom · right-drag to orbit
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 10,
          color: "#5A5F72",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#FF7A45", boxShadow: "0 0 6px #FF7A45" }} />
          repell
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#3DDCFF", boxShadow: "0 0 6px #3DDCFF" }} />
          attract
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#EDEFF5", boxShadow: "0 0 6px #EDEFF5" }} />
          matter
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#5A5F72" }} />
          spark
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#FFE9A8", boxShadow: "0 0 10px #FFE9A8" }} />
          photon
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "#FFE9CE", boxShadow: "0 0 10px #FFE9CE" }} />
          seed
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 14,
          right: 16,
          textAlign: "right",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 11,
          color: "#7B8093",
          lineHeight: 1.7,
        }}
      >
        <div>t = {readout.tick}</div>
        <div>a(t) = {readout.factor}</div>
        <div>
          grid = {readout.gridNodes} · total = {readout.nodes} · ring = {readout.ring}
        </div>
        <div style={{ color: "#4A4E5A" }}>
          random repell/attract/neutral per ray · matter annihilates → photons → pair-produces back
        </div>
      </div>
    </div>
  );
}