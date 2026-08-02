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

// Where this cell belongs in the approximate-3D shell, given its gridPos
// and the current scale factor: project onto gridPos's own direction,
// but scale by the Chebyshev ring number rather than gridPos's own
// Euclidean length — a corner cell like (3,3) and an edge-midpoint cell
// like (3,0) are the same ring, but (3,3) has Euclidean length √18≈4.24
// while (3,0) has exactly 3; this pulls corners in to match, which is
// what makes the whole population a sphere/circle instead of a
// square/cube. Shared by the seed position at creation and the ongoing
// anchor force in step() — same formula, same target, so a newly-spawned
// cell starts exactly where it's headed rather than lagging behind it.
function sphereTargetPos(gridPos, scale) {
  const ring = Math.max(...gridPos.map((v) => Math.abs(v)));
  const euclideanLen = Math.hypot(...gridPos) || 1;
  const targetR = ring * scale;
  return gridPos.map((v) => (v / euclideanLen) * targetR);
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
  // Seeded directly at the sphere-projected target position (see
  // sphereTargetPos) — the same formula the ongoing anchor force in
  // step() pulls toward. Previously this seeded near the parent's
  // current position and relied on the anchor force to pull it out to
  // its proper ring distance over several frames, which is what made
  // freshly-spawned cells visibly cluster near center before migrating
  // outward. Now it starts where 3D space says it belongs; a tiny
  // deterministic offset (this cell's own inward direction) avoids two
  // siblings landing at the exact same coordinate.
  const seedDir = primaryInwardDir(gridPos, d).map((v) => -v);
  const target = sphereTargetPos(gridPos, sim.scaleFactor);
  node.pos = target.map((v, k) => v + seedDir[k] * 0.01);

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
const REWIRED_SLOTS_GRID = 2; // rewired (consumption-driven) neighbor slots per grid cell — small, since most cells have none; mesh neighbors need zero slots at all now
const REWIRED_SLOTS_FREE = 4; // free nodes carry a few more since they have no mesh edges of their own
const GRID_ATLAS_PADDING = 8; // headroom rings before the atlas needs reallocating

/* ---------------------------------------------------------------------
 * GPU physics, v2 — grid cells are stored in a texture indexed directly
 * by their own gridPos (offset to a non-negative atlas coordinate), not
 * by an arbitrary flat index. A mesh neighbor is always exactly ±1 along
 * one axis, so once a cell's own atlas texel IS its gridPos, finding a
 * neighbor stops being "look up wherever this index points" (a
 * data-dependent gather — slow, cache-hostile, and what made the
 * previous design's dispatch cost dominate regardless of shader
 * micro-optimization) and becomes "read the texel one step over" — a
 * fixed, compile-time-known offset. That's the actual fix; every
 * previous attempt (removing dynamic array indexing, removing
 * large-argument sin(), halving the gather count) was optimizing
 * *inside* the gather instead of removing it.
 *
 * For 3D, a true GPU 3D texture would need one draw call per Z-layer
 * (framebuffers attach one 2D layer at a time) — real complexity for
 * something unverifiable here without a GPU. Instead, Z-slices are
 * tiled side by side into one larger 2D texture (an atlas): a step of
 * ±1 in x or y stays within the current slice tile; a step of ±1 in z
 * is a constant horizontal jump of exactly one slice-width. Single
 * texture, single draw call, only fixed offsets — verified this
 * round-trips correctly and that both neighbor directions reduce to
 * constant offsets before writing any shader code.
 *
 * Free nodes (photons/matter — no gridPos, no mesh edges by
 * construction) and rewired connections (consumption-driven, genuinely
 * arbitrary/non-local — a heavily-consumed cell can inherit connections
 * from anywhere) still need a gather. They get a second, separate,
 * much smaller pass: free nodes are relatively few, and rewired links
 * are the minority of edges compared to mesh — so the gather that
 * remains is doing far less work than before, not just doing the same
 * work faster.
 * ------------------------------------------------------------------- */

const GRID_VERTEX_SRC = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

function buildGridFragmentSrc() {
  return `#version 300 es
precision highp float;

uniform sampler2D uGridPos;      // atlas: xyz=pos, w=weight (0 = empty slot)
uniform sampler2D uGridVel;      // atlas: xyz=vel, w=unused
uniform sampler2D uGridRewired;  // atlas: x=idx0, y=idx1 (flat indices into uPoolPos, -1=none)
uniform sampler2D uPoolPos;      // flat pool (grid cells mirrored + free nodes): xyz=pos, w=weight

uniform float uScale;
uniform float uDt;
uniform float uTick;
uniform float uDims;
uniform float uAtlasW;
uniform float uSliceSize;
uniform float uGridOffset;
uniform vec2 uPoolTexSize;

layout(location = 0) out vec4 outPos;
layout(location = 1) out vec4 outVel;

vec4 fetchPoolByIndex(float idx) {
  if (idx < -0.5) return vec4(0.0);
  float w = uPoolTexSize.x;
  float x = mod(idx, w);
  float y = floor(idx / w);
  return texelFetch(uPoolPos, ivec2(int(x), int(y)), 0);
}

void springTerm(inout vec3 force, vec3 pos, float weight, float restLen, vec4 otherData, float k) {
  if (otherData.w < 0.5) return;
  vec3 delta = otherData.xyz - pos;
  float dist = max(length(delta), 1e-4);
  float edgeWeight = (weight + otherData.w) * 0.5;
  force += delta * (k * edgeWeight * (dist - restLen) / dist);
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  vec4 posData = texelFetch(uGridPos, texel, 0);
  float weight = posData.w;

  if (weight < 0.5) {
    outPos = posData;
    outVel = texelFetch(uGridVel, texel, 0);
    return;
  }

  vec3 pos = posData.xyz;
  vec4 velData = texelFetch(uGridVel, texel, 0);
  vec3 vel = velData.xyz;

  // This cell's own gridPos is implicit in its atlas position — no
  // lookup, just arithmetic on which texel we are.
  float sliceSize = uSliceSize;
  float sliceIndex = floor(float(texel.x) / sliceSize);
  float localX = float(texel.x) - sliceIndex * sliceSize;
  vec3 gridPos = vec3(localX - uGridOffset, float(texel.y) - uGridOffset, uDims > 2.5 ? (sliceIndex - uGridOffset) : 0.0);

  bool isCenter = abs(gridPos.x) < 0.5 && abs(gridPos.y) < 0.5 && abs(gridPos.z) < 0.5;

  vec3 force = vec3(0.0);
  float restLen = uScale;
  float meshK = ${SPRING_K.toFixed(4)};

  // Mesh neighbors: fixed offsets, no gather, no branch on variable
  // neighbor count — every occupied cell checks the exact same
  // candidate set the exact same way.
  springTerm(force, pos, weight, restLen, texelFetch(uGridPos, texel + ivec2(1, 0), 0), meshK);
  springTerm(force, pos, weight, restLen, texelFetch(uGridPos, texel + ivec2(-1, 0), 0), meshK);
  springTerm(force, pos, weight, restLen, texelFetch(uGridPos, texel + ivec2(0, 1), 0), meshK);
  springTerm(force, pos, weight, restLen, texelFetch(uGridPos, texel + ivec2(0, -1), 0), meshK);
  if (uDims > 2.5) {
    int slice = int(sliceSize);
    ivec2 zp = texel + ivec2(slice, 0);
    if (zp.x < int(uAtlasW)) springTerm(force, pos, weight, restLen, texelFetch(uGridPos, zp, 0), meshK);
    ivec2 zn = texel + ivec2(-slice, 0);
    if (zn.x >= 0) springTerm(force, pos, weight, restLen, texelFetch(uGridPos, zn, 0), meshK);
  }

  // Rewired (consumption-driven) connections — genuinely arbitrary, so
  // still a gather, but only 2 slots and only for cells that actually
  // have any (most don't).
  vec4 rew = texelFetch(uGridRewired, texel, 0);
  springTerm(force, pos, weight, restLen, fetchPoolByIndex(rew.x), ${REWIRED_SPRING_K.toFixed(4)});
  springTerm(force, pos, weight, restLen, fetchPoolByIndex(rew.y), ${REWIRED_SPRING_K.toFixed(4)});

  if (!isCenter) {
    float ring = max(max(abs(gridPos.x), abs(gridPos.y)), abs(gridPos.z));
    float glen = max(length(gridPos), 1e-6);
    vec3 target = (gridPos / glen) * ring * uScale;
    force += (target - pos) * 3.5;

    int h = 0;
    h = h * 92821 + int(gridPos.x) * (-1640531535);
    h = h * 92821 + int(gridPos.y) * (-1640531535);
    h = h * 92821 + int(gridPos.z) * (-1640531535);
    float phase = (float(uint(h)) / 4294967296.0) * 6.28318530718;
    float wobbleK = restLen * 0.18;
    force.x += sin(uTick * 1.6 + phase) * wobbleK;
    force.y += sin(uTick * 1.6 + phase + 2.09) * wobbleK;
    if (uDims > 2.5) force.z += sin(uTick * 1.6 + phase + 4.18) * wobbleK;
  }

  if (isCenter) {
    outPos = vec4(pos, weight);
    outVel = vec4(0.0, 0.0, 0.0, 0.0);
    return;
  }

  float maxForce = 400.0;
  float fMag = length(force);
  if (fMag > maxForce) force *= (maxForce / fMag);

  vec3 newVel = (vel + force * uDt) * ${DAMPING.toFixed(4)};
  float maxVel = 150.0;
  float vMag = length(newVel);
  if (vMag > maxVel) newVel *= (maxVel / vMag);

  vec3 newPos = pos + newVel * uDt;
  if (!(newPos.x == newPos.x)) newPos = pos;
  if (!(newPos.y == newPos.y)) newPos = pos;
  if (!(newPos.z == newPos.z)) newPos = pos;

  outPos = vec4(newPos, weight);
  outVel = vec4(newVel, 0.0);
}
`;
}

const FREE_FRAGMENT_SRC = `#version 300 es
precision highp float;

uniform sampler2D uFreePos;     // xyz=pos, w=weight
uniform sampler2D uFreeVel;     // xyz=vel, w=repelCount
uniform sampler2D uFreeRewiredA; // 4 rewired neighbor indices into uPoolPos
uniform sampler2D uFreeRewiredB; // 4 more
uniform sampler2D uPoolPos;     // combined pool (grid cells mirrored + free nodes)

uniform float uDt;
uniform float uDims;
uniform vec2 uPoolTexSize;

layout(location = 0) out vec4 outPos;
layout(location = 1) out vec4 outVel;

vec4 fetchPoolByIndex(float idx) {
  if (idx < -0.5) return vec4(0.0);
  float w = uPoolTexSize.x;
  float x = mod(idx, w);
  float y = floor(idx / w);
  return texelFetch(uPoolPos, ivec2(int(x), int(y)), 0);
}

void springTerm(inout vec3 force, vec3 pos, float weight, vec4 otherData) {
  if (otherData.w < 0.5) return;
  vec3 delta = otherData.xyz - pos;
  float dist = max(length(delta), 1e-4);
  float edgeWeight = (weight + otherData.w) * 0.5;
  force += delta * (${REWIRED_SPRING_K.toFixed(4)} * edgeWeight * (dist - 1.0) / dist);
}

void main() {
  ivec2 texel = ivec2(gl_FragCoord.xy);
  vec4 posData = texelFetch(uFreePos, texel, 0);
  float weight = posData.w;
  if (weight < 0.5) {
    outPos = posData;
    outVel = texelFetch(uFreeVel, texel, 0);
    return;
  }
  vec3 pos = posData.xyz;
  vec4 velData = texelFetch(uFreeVel, texel, 0);
  vec3 vel = velData.xyz;
  float repelCount = velData.w;

  vec3 force = vec3(0.0);
  float dimBoost = uDims > 2.5 ? 1.5 : 1.0;
  force += pos * (repelCount * ${EXPANSION_K.toFixed(4)} * dimBoost);

  vec4 rA = texelFetch(uFreeRewiredA, texel, 0);
  vec4 rB = texelFetch(uFreeRewiredB, texel, 0);
  springTerm(force, pos, weight, fetchPoolByIndex(rA.x));
  springTerm(force, pos, weight, fetchPoolByIndex(rA.y));
  springTerm(force, pos, weight, fetchPoolByIndex(rA.z));
  springTerm(force, pos, weight, fetchPoolByIndex(rA.w));
  springTerm(force, pos, weight, fetchPoolByIndex(rB.x));
  springTerm(force, pos, weight, fetchPoolByIndex(rB.y));
  springTerm(force, pos, weight, fetchPoolByIndex(rB.z));
  springTerm(force, pos, weight, fetchPoolByIndex(rB.w));

  float maxForce = 400.0;
  float fMag = length(force);
  if (fMag > maxForce) force *= (maxForce / fMag);

  vec3 newVel = (vel + force * uDt) * ${DAMPING.toFixed(4)};
  float maxVel = 150.0;
  float vMag = length(newVel);
  if (vMag > maxVel) newVel *= (maxVel / vMag);

  vec3 newPos = pos + newVel * uDt;
  if (!(newPos.x == newPos.x)) newPos = pos;
  if (!(newPos.y == newPos.y)) newPos = pos;
  if (!(newPos.z == newPos.z)) newPos = pos;

  outPos = vec4(newPos, weight);
  outVel = vec4(newVel, repelCount);
}
`;

class GPUPhysics {
  constructor(dims) {
    this.available = false;
    this.lastError = null;
    this.frameCount = 0;
    this.dims = dims;
    this.gridCapacityRing = 0;
    this.poolCapacity = 0;
    this.freeCapacity = 0;
    try {
      let canvas;
      let usedOffscreen = false;
      if (typeof OffscreenCanvas !== "undefined") {
        canvas = new OffscreenCanvas(1, 1);
        usedOffscreen = true;
      } else {
        canvas = document.createElement("canvas");
      }
      let gl = canvas.getContext("webgl2");
      if (!gl && usedOffscreen) {
        canvas = document.createElement("canvas");
        usedOffscreen = false;
        gl = canvas.getContext("webgl2");
      }
      if (!gl) {
        this.lastError = "WebGL2 not supported by this browser/device";
        return;
      }
      this.usedOffscreenCanvas = usedOffscreen;
      const ext = gl.getExtension("EXT_color_buffer_float");
      if (!ext) {
        this.lastError = "EXT_color_buffer_float extension unavailable";
        return;
      }
      this.gl = gl;
      this.canvas = canvas;

      this.gridProgram = this._buildProgram(gl, GRID_VERTEX_SRC, buildGridFragmentSrc());
      if (!this.gridProgram) {
        this.lastError = this.lastError || "grid shader compile/link failed";
        return;
      }
      this.freeProgram = this._buildProgram(gl, GRID_VERTEX_SRC, FREE_FRAGMENT_SRC);
      if (!this.freeProgram) {
        this.lastError = this.lastError || "free-node shader compile/link failed";
        return;
      }

      const quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      this.quad = quad;

      this.gridUniforms = {};
      for (const name of ["uGridPos", "uGridVel", "uGridRewired", "uPoolPos", "uScale", "uDt", "uTick", "uDims", "uAtlasW", "uSliceSize", "uGridOffset", "uPoolTexSize"]) {
        this.gridUniforms[name] = gl.getUniformLocation(this.gridProgram, name);
      }
      this.gridAPos = gl.getAttribLocation(this.gridProgram, "aPos");

      this.freeUniforms = {};
      for (const name of ["uFreePos", "uFreeVel", "uFreeRewiredA", "uFreeRewiredB", "uPoolPos", "uDt", "uDims", "uPoolTexSize"]) {
        this.freeUniforms[name] = gl.getUniformLocation(this.freeProgram, name);
      }
      this.freeAPos = gl.getAttribLocation(this.freeProgram, "aPos");

      this._fbo = gl.createFramebuffer();
      this.available = true;
    } catch (e) {
      this.available = false;
      this.lastError = "exception during init: " + (e && e.message ? e.message : String(e));
    }
  }

  _buildProgram(gl, vsSrc, fsSrc) {
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(sh);
        console.error("GPUPhysics shader compile error:", info);
        this.lastError = "shader compile error: " + info;
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(prog);
      console.error("GPUPhysics program link error:", info);
      this.lastError = "program link error: " + info;
      return null;
    }
    return prog;
  }

  _makeTexture(gl, w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  // Grid atlas sized to cover [-ringRadius, ringRadius] in every axis
  // with headroom, so it doesn't need reallocating every single tick.
  _ensureGridCapacity(ringRadius, dims) {
    if (ringRadius <= this.gridCapacityRing && this.sliceSize) return;
    const gl = this.gl;
    const ring = ringRadius + GRID_ATLAS_PADDING;
    this.gridCapacityRing = ring;
    const sliceSize = 2 * ring + 1;
    this.sliceSize = sliceSize;
    this.gridOffset = ring;
    const atlasW = dims === 3 ? sliceSize * sliceSize : sliceSize;
    const atlasH = sliceSize;
    this.atlasW = atlasW;
    this.atlasH = atlasH;

    for (const key of ["gridPos", "gridPos2", "gridVel", "gridVel2", "gridRewired"]) {
      const cur = this["_tex_" + key];
      if (cur) gl.deleteTexture(cur);
    }
    this._tex_gridPos = this._makeTexture(gl, atlasW, atlasH);
    this._tex_gridPos2 = this._makeTexture(gl, atlasW, atlasH);
    this._tex_gridVel = this._makeTexture(gl, atlasW, atlasH);
    this._tex_gridVel2 = this._makeTexture(gl, atlasW, atlasH);
    this._tex_gridRewired = this._makeTexture(gl, atlasW, atlasH);

    this._gridBuf = {
      pos: new Float32Array(atlasW * atlasH * 4),
      vel: new Float32Array(atlasW * atlasH * 4),
      rewired: new Float32Array(atlasW * atlasH * 4),
      outPos: new Float32Array(atlasW * atlasH * 4),
      outVel: new Float32Array(atlasW * atlasH * 4),
    };
  }

  // Flat pool: mirrors every grid cell's pos/weight (so rewired gathers
  // — from anyone, grid or free — can reach them) plus every free node.
  _ensurePoolCapacity(n) {
    if (n <= this.poolCapacity && this.poolTexW) return;
    const gl = this.gl;
    const texW = Math.max(1, Math.ceil(Math.sqrt(n * 1.15)));
    const texH = Math.max(1, Math.ceil(n / texW) + 1);
    this.poolTexW = texW;
    this.poolTexH = texH;
    this.poolCapacity = texW * texH;
    if (this._tex_pool) this.gl.deleteTexture(this._tex_pool);
    this._tex_pool = this._makeTexture(gl, texW, texH);
    this._poolBuf = new Float32Array(this.poolCapacity * 4);
  }

  // Free-node flat texture — separate from the pool (which is read-only
  // gather source for this pass), since free nodes need their own
  // in/out ping-pong just like grid cells do.
  _ensureFreeCapacity(n) {
    if (n <= this.freeCapacity && this.freeTexW) return;
    const gl = this.gl;
    const texW = Math.max(1, Math.ceil(Math.sqrt(Math.max(n, 1) * 1.3)));
    const texH = Math.max(1, Math.ceil(Math.max(n, 1) / texW) + 1);
    this.freeTexW = texW;
    this.freeTexH = texH;
    this.freeCapacity = texW * texH;
    for (const key of ["freePos", "freePos2", "freeVel", "freeVel2", "freeRewiredA", "freeRewiredB"]) {
      const cur = this["_tex_" + key];
      if (cur) gl.deleteTexture(cur);
    }
    this._tex_freePos = this._makeTexture(gl, texW, texH);
    this._tex_freePos2 = this._makeTexture(gl, texW, texH);
    this._tex_freeVel = this._makeTexture(gl, texW, texH);
    this._tex_freeVel2 = this._makeTexture(gl, texW, texH);
    this._tex_freeRewiredA = this._makeTexture(gl, texW, texH);
    this._tex_freeRewiredB = this._makeTexture(gl, texW, texH);
    this._freeBuf = {
      pos: new Float32Array(this.freeCapacity * 4),
      vel: new Float32Array(this.freeCapacity * 4),
      rA: new Float32Array(this.freeCapacity * 4),
      rB: new Float32Array(this.freeCapacity * 4),
      outPos: new Float32Array(this.freeCapacity * 4),
      outVel: new Float32Array(this.freeCapacity * 4),
    };
  }

  update(sim, dt, dims) {
    const nodes = sim.nodes;
    const n = nodes.length;
    if (n === 0) return true;
    const __t0 = performance.now();
    const gl = this.gl;

    const gridNodes = [];
    const freeNodes = [];
    for (const node of nodes) {
      if (node.gridPos) gridNodes.push(node);
      else freeNodes.push(node);
    }

    this._ensureGridCapacity(sim.ringRadius || 0, dims);
    this._ensurePoolCapacity(n);
    this._ensureFreeCapacity(freeNodes.length);

    const sliceSize = this.sliceSize, offset = this.gridOffset, atlasW = this.atlasW, atlasH = this.atlasH;
    const gbuf = this._gridBuf;
    const poolBuf = this._poolBuf;
    const poolIndex = new Map(); // node -> flat pool index, for rewired-gather encoding
    let poolCursor = 0;

    const atlasTexelOf = (gridPos) => {
      const gx = Math.round(gridPos[0]) + offset;
      const gy = Math.round(gridPos[1]) + offset;
      if (dims === 3) {
        const gz = Math.round(gridPos[2] || 0) + offset;
        return [gx + gz * sliceSize, gy];
      }
      return [gx, gy];
    };

    // Pass 1a: write every grid cell into BOTH the atlas (for mesh
    // lookups) and the flat pool (for rewired-gather targets from
    // anyone) — same underlying data, two access patterns.
    for (const node of gridNodes) {
      const [ax, ay] = atlasTexelOf(node.gridPos);
      const off = (ay * atlasW + ax) * 4;
      gbuf.pos[off] = node.pos[0] || 0;
      gbuf.pos[off + 1] = node.pos[1] || 0;
      gbuf.pos[off + 2] = node.pos[2] || 0;
      gbuf.pos[off + 3] = node.weight;
      gbuf.vel[off] = node.vel[0] || 0;
      gbuf.vel[off + 1] = node.vel[1] || 0;
      gbuf.vel[off + 2] = node.vel[2] || 0;
      gbuf.vel[off + 3] = 0;

      const pi = poolCursor++;
      poolIndex.set(node, pi);
      poolBuf[pi * 4] = node.pos[0] || 0;
      poolBuf[pi * 4 + 1] = node.pos[1] || 0;
      poolBuf[pi * 4 + 2] = node.pos[2] || 0;
      poolBuf[pi * 4 + 3] = node.weight;
    }
    for (const node of freeNodes) {
      const pi = poolCursor++;
      poolIndex.set(node, pi);
      poolBuf[pi * 4] = node.pos[0] || 0;
      poolBuf[pi * 4 + 1] = node.pos[1] || 0;
      poolBuf[pi * 4 + 2] = node.pos[2] || 0;
      poolBuf[pi * 4 + 3] = node.weight;
    }

    // Rewired slots (grid): reset the whole rewired buffer only for
    // occupied cells' worth of data — simplest correct approach is to
    // clear indices to -1 across the buffer once, then fill.
    gbuf.rewired.fill(-1);
    const gridSlotCursor = new Map();
    const freeBuf = this._freeBuf;
    freeBuf.rA.fill(-1);
    freeBuf.rB.fill(-1);
    const freeIndexOf = new Map();
    for (let i = 0; i < freeNodes.length; i++) freeIndexOf.set(freeNodes[i], i);
    const freeSlotCursor = new Int8Array(freeNodes.length);

    for (const edge of sim.edges) {
      if (!edge[2]) continue; // mesh edges are handled by fixed atlas offsets — only rewired links need the gather
      const a = edge[0], b = edge[1];
      if (a._dead || b._dead) continue;
      const pa = poolIndex.get(a), pb = poolIndex.get(b);
      if (pa === undefined || pb === undefined) continue;

      if (a.gridPos) {
        const [ax, ay] = atlasTexelOf(a.gridPos);
        const key = ay * atlasW + ax;
        const slot = gridSlotCursor.get(key) || 0;
        if (slot < REWIRED_SLOTS_GRID) {
          gbuf.rewired[key * 4 + slot] = pb;
          gridSlotCursor.set(key, slot + 1);
        }
      } else {
        const fi = freeIndexOf.get(a);
        if (fi !== undefined) {
          const s = freeSlotCursor[fi]++;
          if (s < REWIRED_SLOTS_FREE) {
            const tex = s < 4 ? freeBuf.rA : freeBuf.rB;
            tex[fi * 4 + (s % 4)] = pb;
          }
        }
      }

      if (b.gridPos) {
        const [bx, by] = atlasTexelOf(b.gridPos);
        const key = by * atlasW + bx;
        const slot = gridSlotCursor.get(key) || 0;
        if (slot < REWIRED_SLOTS_GRID) {
          gbuf.rewired[key * 4 + slot] = pa;
          gridSlotCursor.set(key, slot + 1);
        }
      } else {
        const fi = freeIndexOf.get(b);
        if (fi !== undefined) {
          const s = freeSlotCursor[fi]++;
          if (s < REWIRED_SLOTS_FREE) {
            const tex = s < 4 ? freeBuf.rA : freeBuf.rB;
            tex[fi * 4 + (s % 4)] = pa;
          }
        }
      }
    }

    for (let i = 0; i < freeNodes.length; i++) {
      const node = freeNodes[i];
      freeBuf.pos[i * 4] = node.pos[0] || 0;
      freeBuf.pos[i * 4 + 1] = node.pos[1] || 0;
      freeBuf.pos[i * 4 + 2] = node.pos[2] || 0;
      freeBuf.pos[i * 4 + 3] = node.weight;
      freeBuf.vel[i * 4] = node.vel[0] || 0;
      freeBuf.vel[i * 4 + 1] = node.vel[1] || 0;
      freeBuf.vel[i * 4 + 2] = node.vel[2] || 0;
      freeBuf.vel[i * 4 + 3] = node.repelCount;
    }

    const uploadTo = (tex, w, h, data) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, w, h, gl.RGBA, gl.FLOAT, data);
    };
    uploadTo(this._tex_gridPos, atlasW, atlasH, gbuf.pos);
    uploadTo(this._tex_gridVel, atlasW, atlasH, gbuf.vel);
    uploadTo(this._tex_gridRewired, atlasW, atlasH, gbuf.rewired);
    uploadTo(this._tex_pool, this.poolTexW, this.poolTexH, poolBuf);
    uploadTo(this._tex_freePos, this.freeTexW, this.freeTexH, freeBuf.pos);
    uploadTo(this._tex_freeVel, this.freeTexW, this.freeTexH, freeBuf.vel);
    uploadTo(this._tex_freeRewiredA, this.freeTexW, this.freeTexH, freeBuf.rA);
    uploadTo(this._tex_freeRewiredB, this.freeTexW, this.freeTexH, freeBuf.rB);
    const __t1 = performance.now();

    // Pass A: grid cells.
    gl.viewport(0, 0, atlasW, atlasH);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._tex_gridPos2, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._tex_gridVel2, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      this.lastError = "grid framebuffer incomplete (status " + gl.checkFramebufferStatus(gl.FRAMEBUFFER) + ")";
      return false;
    }
    gl.useProgram(this.gridProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(this.gridAPos);
    gl.vertexAttribPointer(this.gridAPos, 2, gl.FLOAT, false, 0, 0);
    const bindGrid = (unit, tex, uniform) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(this.gridUniforms[uniform], unit);
    };
    bindGrid(0, this._tex_gridPos, "uGridPos");
    bindGrid(1, this._tex_gridVel, "uGridVel");
    bindGrid(2, this._tex_gridRewired, "uGridRewired");
    bindGrid(3, this._tex_pool, "uPoolPos");
    gl.uniform1f(this.gridUniforms.uScale, sim.scaleFactor);
    gl.uniform1f(this.gridUniforms.uDt, dt);
    gl.uniform1f(this.gridUniforms.uTick, sim.tick % (Math.PI * 2 / 1.6));
    gl.uniform1f(this.gridUniforms.uDims, dims);
    gl.uniform1f(this.gridUniforms.uAtlasW, atlasW);
    gl.uniform1f(this.gridUniforms.uSliceSize, sliceSize);
    gl.uniform1f(this.gridUniforms.uGridOffset, offset);
    gl.uniform2f(this.gridUniforms.uPoolTexSize, this.poolTexW, this.poolTexH);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Pass B: free nodes (only if any exist — skip an empty draw call).
    if (freeNodes.length > 0) {
      gl.viewport(0, 0, this.freeTexW, this.freeTexH);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._tex_freePos2, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._tex_freeVel2, 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        this.lastError = "free framebuffer incomplete (status " + gl.checkFramebufferStatus(gl.FRAMEBUFFER) + ")";
        return false;
      }
      gl.useProgram(this.freeProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
      gl.enableVertexAttribArray(this.freeAPos);
      gl.vertexAttribPointer(this.freeAPos, 2, gl.FLOAT, false, 0, 0);
      const bindFree = (unit, tex, uniform) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(this.freeUniforms[uniform], unit);
      };
      bindFree(0, this._tex_freePos, "uFreePos");
      bindFree(1, this._tex_freeVel, "uFreeVel");
      bindFree(2, this._tex_freeRewiredA, "uFreeRewiredA");
      bindFree(3, this._tex_freeRewiredB, "uFreeRewiredB");
      bindFree(4, this._tex_pool, "uPoolPos");
      gl.uniform1f(this.freeUniforms.uDt, dt);
      gl.uniform1f(this.freeUniforms.uDims, dims);
      gl.uniform2f(this.freeUniforms.uPoolTexSize, this.poolTexW, this.poolTexH);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    const __t2 = performance.now();

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._tex_gridPos2, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._tex_gridVel2, 0);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);
    gl.readPixels(0, 0, atlasW, atlasH, gl.RGBA, gl.FLOAT, gbuf.outPos);
    gl.readBuffer(gl.COLOR_ATTACHMENT1);
    gl.readPixels(0, 0, atlasW, atlasH, gl.RGBA, gl.FLOAT, gbuf.outVel);

    if (freeNodes.length > 0) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._tex_freePos2, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this._tex_freeVel2, 0);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.readBuffer(gl.COLOR_ATTACHMENT0);
      gl.readPixels(0, 0, this.freeTexW, this.freeTexH, gl.RGBA, gl.FLOAT, this._freeBuf.outPos);
      gl.readBuffer(gl.COLOR_ATTACHMENT1);
      gl.readPixels(0, 0, this.freeTexW, this.freeTexH, gl.RGBA, gl.FLOAT, this._freeBuf.outVel);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const __t3 = performance.now();

    for (const node of gridNodes) {
      if (node.isCenter) {
        for (let k = 0; k < dims; k++) node.vel[k] = 0;
        continue;
      }
      const [ax, ay] = atlasTexelOf(node.gridPos);
      const off = (ay * atlasW + ax) * 4;
      for (let k = 0; k < dims; k++) {
        const val = gbuf.outPos[off + k];
        node.pos[k] = Number.isFinite(val) ? val : node.pos[k];
      }
      for (let k = 0; k < dims; k++) {
        const val = gbuf.outVel[off + k];
        node.vel[k] = Number.isFinite(val) ? val : 0;
      }
    }
    for (let i = 0; i < freeNodes.length; i++) {
      const node = freeNodes[i];
      for (let k = 0; k < dims; k++) {
        const val = this._freeBuf.outPos[i * 4 + k];
        node.pos[k] = Number.isFinite(val) ? val : node.pos[k];
      }
      for (let k = 0; k < dims; k++) {
        const val = this._freeBuf.outVel[i * 4 + k];
        node.vel[k] = Number.isFinite(val) ? val : 0;
      }
    }

    this.frameCount++;
    this.lastTiming = {
      marshalUpload: __t1 - __t0,
      drawDispatch: __t2 - __t1,
      readback: __t3 - __t2,
      total: performance.now() - __t0,
    };
    this.texW = atlasW; // reused by the UI's fragment-count readout
    this.texH = atlasH;
    return true;
  }
}

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

  if (sim._gpuPhysics === undefined) {
    sim._gpuPhysics = new GPUPhysics(dims);
  }
  const gpuOk = sim._gpuPhysics.available && sim._gpuPhysics.update(sim, dt, dims);

  if (!gpuOk) {
    // CPU fallback — identical math to the GPU shader above, used only
    // if WebGL2 (or a required extension) isn't available in this
    // environment. Everything downstream (rendering, growth,
    // consume/annihilate) is agnostic to which path computed the
    // positions.
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

    const SHELL_ANCHOR_K = 3.5;
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      if (node.isCenter || !node.gridPos) continue;
      const target = sphereTargetPos(node.gridPos, scale);
      for (let k = 0; k < dims; k++) {
        forces[i][k] += (target[k] - node.pos[k]) * SHELL_ANCHOR_K;
      }
    }

    const WOBBLE_K = restLen * 0.18;
    const WOBBLE_RATE = 1.6;
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      if (node.isCenter || !node.gridPos) continue;
      if (node._wobblePhase === undefined) {
        let h = 0;
        for (let k = 0; k < dims; k++) h = (h * 92821 + (node.gridPos[k] | 0) * 2654435761) | 0;
        node._wobblePhase = ((h >>> 0) / 4294967296) * Math.PI * 2;
      }
      for (let k = 0; k < dims; k++) {
        const axisPhase = node._wobblePhase + k * 2.09;
        forces[i][k] += Math.sin(sim.tick * WOBBLE_RATE + axisPhase) * WOBBLE_K;
      }
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
  }

  // One synchronized global tick governs everything: grid growth (one new
  // ring — 3×3 → 5×5 → 7×7, exactly one ring per tick) and every
  // Repell/Attract boundary in the graph, together. Not independent
  // timers. On each tick the whole graph is scanned: every un-consumed
  // edge is checked for annihilation/pair-production/consumption, and
  // every Repell ray fires. Repell is never spent and never individually
  // throttled — a boundary keeps expanding on every single global tick,
  // unconditionally.
  const __tickT0 = performance.now();
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
  sim._lastTickMs = performance.now() - __tickT0;
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

function draw(ctx, canvas, sim, dim, cam, dt, showGridLines) {
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

  if (showGridLines) {
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
  } else {
    // Gravity flow: a continuous volumetric-style density cloud, not
    // discrete particles or lines — sampled on a real 3D grid, colored
    // by a dark→purple→orange→white intensity ramp, and blended
    // additively so overlapping samples read as one smooth glow rather
    // than visible individual blobs. Fully world-space: every sample
    // point is a real 3D coordinate projected through the same camera
    // pipeline as every node, so it's navigable exactly like the rest of
    // the scene — rotate, zoom, or move through it and depth/perspective
    // apply correctly, the same way they do for real structure.
    const dims3 = sim.nodes[0].pos.length;
    const sources = [];
    for (const n of sim.nodes) {
      if (n.isPhoton) continue;
      if (isMatter(n)) continue; // both Attract and Repell at the same position/weight always cancel to zero net effect — neutral
      for (const ray of n.rays) {
        const op = ray.boundaries[0].op;
        if (op === Op.Attract) sources.push({ pos: n.pos, sign: 1, w: n.weight });
        else if (op === Op.Repell) sources.push({ pos: n.pos, sign: -1, w: n.weight });
      }
    }
    const MAX_SOURCES = 220;
    if (sources.length > MAX_SOURCES) {
      sources.sort((a, b) => b.w - a.w);
      sources.length = MAX_SOURCES;
    }

    if (sources.length > 0) {
      const SOFTEN_SQ = (0.6 * worldExtent) ** 2 * 0.02 + 0.04;
      const gridExtent = worldExtent * 1.05;
      const RES = dims3 === 3 ? 7 : 18;
      const step = (gridExtent * 2) / RES;
      // With additive blending, up to RES samples can land at nearly the
      // same screen position when stacked along the view ray — 2D has no
      // such stacking (it's a flat plane), which is why 3D was reading
      // dramatically brighter for the same underlying field strength.
      const depthStackCompensation = dims3 === 3 ? 1 / (RES * 0.45) : 1;

      // Intensity ramp: true black at low gravity through deep purple and
      // orange to true white at high gravity — black is less, white is
      // more.
      function densityColor(t, alpha) {
        t = Math.min(Math.max(t, 0), 1);
        let r, g, b;
        if (t < 0.4) {
          const u = t / 0.4;
          r = u * 60; g = u * 20; b = u * 70;
        } else if (t < 0.75) {
          const u = (t - 0.4) / 0.35;
          r = 60 + u * 195; g = 20 + u * 95; b = 70 - u * 30;
        } else {
          const u = (t - 0.75) / 0.25;
          r = 255; g = 115 + u * 140; b = 40 + u * 215;
        }
        return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
      }

      const samples = [];
      let maxMag = 0;
      const pos = new Array(dims3);
      const build = (axis) => {
        if (axis === dims3) {
          // Scalar potential, not a vector sum — sum of each source's
          // weighted influence by magnitude (attract adds, repell
          // subtracts), never letting opposite directions cancel out
          // geometrically. A dense, symmetric cluster of attractors
          // previously could read as near-zero here purely because their
          // pull directions pointed every which way and summed to
          // nothing as vectors — physically real for net force, but not
          // what "concentrated attractors should look bright" means.
          let potential = 0;
          for (const src of sources) {
            let distSq = SOFTEN_SQ;
            for (let k = 0; k < dims3; k++) distSq += (src.pos[k] - pos[k]) ** 2;
            potential += (src.w * src.sign) / distSq;
          }
          const mag = Math.max(potential, 0); // repell-dominated regions read as black, not negative
          if (mag > maxMag) maxMag = mag;
          samples.push({ pos: pos.slice(), mag });
          return;
        }
        for (let i = 0; i < RES; i++) {
          pos[axis] = -gridExtent + i * step + step / 2;
          build(axis + 1);
        }
      };
      build(0);

      // Sort far-to-near so nearer glows layer on top — matters even
      // with additive blending, for depth-based size/alpha falloff to
      // read correctly.
      const withDepth = samples.map((s) => {
        const proj = project(s.pos, dim, cam.rot, cam.tilt, cam.dist || 1);
        return { s, proj };
      }).filter((x) => !x.proj.clipped);
      withDepth.sort((x, y) => y.proj.depth - x.proj.depth);

      const prevComposite = ctx.globalCompositeOperation;
      ctx.globalCompositeOperation = "lighter";
      for (const { s, proj } of withDepth) {
        const x = cx + proj.x * cam.scale, y = cy + proj.y * cam.scale;
        if (!onScreen({ x, y })) continue;
        const depthFactor = dim === 3 ? Math.min(Math.max(proj.depth, 0.3), 1.8) : 1;
        const norm = maxMag > 0 ? Math.min(s.mag / maxMag, 1) : 0;
        if (norm < 0.015) continue; // relative, not absolute — adapts to whatever scale the field is currently at
        const radius = (step * cam.scale * 0.9 + norm * cam.scale * 0.5) * depthFactor;
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
  const gpuFpsTrackRef = useRef({ count: 0, time: 0 });
  const frameTimeRef = useRef({ step: null, draw: null });

  const [dim, setDim] = useState(2);
  const [running, setRunning] = useState(true);
  const [showGridLines, setShowGridLines] = useState(false);
  const [readout, setReadout] = useState({ tick: "0.0", factor: "1.00", nodes: 0, gridNodes: 0, ring: 1, gpuStatus: "checking...", gpuError: null, gpuTiming: null, frameBreakdown: null });

  const reset = useCallback((d) => {
    const prevGpu = simRef.current && simRef.current._gpuPhysics;
    simRef.current = nD_Expanding(d, 3);
    if (prevGpu) simRef.current._gpuPhysics = prevGpu; // reuse WebGL context/textures across resets
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

      const __fStepStart = performance.now();
      if (sim && running) {
        step(sim, dt * 1.3, dim);
        sim.tick += dt;
      }
      const __fStepEnd = performance.now();
      draw(ctx, canvas, sim, dim, camRef.current, dt, showGridLines);
      const __fDrawEnd = performance.now();

      const stepMs = __fStepEnd - __fStepStart;
      const drawMs = __fDrawEnd - __fStepEnd;
      const t = frameTimeRef.current;
      t.step = t.step === null ? stepMs : t.step * 0.9 + stepMs * 0.1;
      t.draw = t.draw === null ? drawMs : t.draw * 0.9 + drawMs * 0.1;
      t.stepRaw = stepMs;

      if (sim && now - lastReadoutRef.current > 200) {
        lastReadoutRef.current = now;
        const gpu = sim._gpuPhysics;
        let gpuStatus, gpuError, gpuTiming = null;
        if (!gpu) {
          gpuStatus = "initializing...";
          gpuError = null;
        } else if (gpu.available && gpu.frameCount > 0) {
          const track = gpuFpsTrackRef.current;
          const dCount = gpu.frameCount - track.count;
          const dTime = now - track.time;
          const fps = track.time > 0 && dTime > 0 ? (dCount / dTime) * 1000 : 0;
          track.count = gpu.frameCount;
          track.time = now;
          gpuStatus = "GPU active (" + (track.time > 0 ? fps.toFixed(0) : "…") + " fps, " + (gpu.usedOffscreenCanvas ? "OffscreenCanvas" : "regular canvas") + ")";
          gpuError = null;
          if (gpu.lastTiming) {
            const t = gpu.lastTiming;
            const fragCount = (gpu.texW || 0) * (gpu.texH || 0);
            gpuTiming = `upload ${t.marshalUpload.toFixed(1)}ms · dispatch ${t.drawDispatch.toFixed(1)}ms (${fragCount} fragments) · readback ${t.readback.toFixed(1)}ms · total ${t.total.toFixed(1)}ms`;
          }
        } else if (gpu.available) {
          gpuStatus = "GPU ready, not yet run";
          gpuError = null;
        } else {
          gpuStatus = "CPU fallback";
          gpuError = gpu.lastError;
        }
        const stepMs = frameTimeRef.current.step || 0;
        const drawMs = frameTimeRef.current.draw || 0;
        const totalMs = stepMs + drawMs;
        const tickMs = sim._lastTickMs || 0;
        const stepRawMs = frameTimeRef.current.stepRaw || 0;
        setReadout({
          tick: sim.tick.toFixed(1),
          factor: sim.scaleFactor.toFixed(2),
          nodes: sim.nodes.length,
          gridNodes: sim.gridNodeCount || 0,
          ring: sim.ringRadius,
          gpuStatus,
          gpuError,
          gpuTiming,
          frameBreakdown: `frame: step ${stepMs.toFixed(1)}ms smoothed / ${stepRawMs.toFixed(1)}ms raw (tick-logic ${tickMs.toFixed(1)}ms) + draw ${drawMs.toFixed(1)}ms = ${totalMs.toFixed(1)}ms (~${totalMs > 0 ? (1000 / totalMs).toFixed(0) : "…"} fps)`,
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
  }, [dim, running, showGridLines]);

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
        <button onClick={() => setShowGridLines((v) => !v)} style={pillStyle(showGridLines)}>
          {showGridLines ? "grid lines" : "gravity flow"}
        </button>
        <span
          title={readout.gpuError || ""}
          style={{
            alignSelf: "center",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 999,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
            fontSize: 10,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.03)",
            color: readout.gpuStatus && readout.gpuStatus.startsWith("GPU active") ? "#8BF0A8" : "#E0B15A",
            cursor: readout.gpuError ? "help" : "default",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: readout.gpuStatus && readout.gpuStatus.startsWith("GPU active") ? "#4ADE80" : readout.gpuStatus === "initializing..." ? "#5A5F72" : "#E0B15A",
              boxShadow: readout.gpuStatus && readout.gpuStatus.startsWith("GPU active") ? "0 0 6px #4ADE80" : "none",
            }}
          />
          {readout.gpuStatus}
          {readout.gpuError ? " (hover for reason)" : ""}
        </span>
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
        {readout.frameBreakdown && <div>{readout.frameBreakdown}</div>}
        {readout.gpuTiming && <div style={{ color: "#4A4E5A" }}>{readout.gpuTiming}</div>}
        <div style={{ color: "#4A4E5A" }}>
          random repell/attract/neutral per ray · matter annihilates → photons → pair-produces back
        </div>
      </div>
    </div>
  );
}