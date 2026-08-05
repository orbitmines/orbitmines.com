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
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@blueprintjs/core";

// A boundary now carries a polarity instead of an annihilation/creation op.
// Neutral is what space is when nothing has happened to it yet: it is what
// gets instantiated as something moves — ahead of it at a boundary of the
// structure, and behind it as it goes — rather than a charge drawn at random.
enum Polarity {
  Positive,
  Negative,
  Neutral
}

// One end of a two-point universe: the polarity of its boundaries, and
// whether its ray moves into the connection or away from it.
type PairSide = {
  polarity: Polarity;
  moving: 'towards' | 'away';
};

// One charge in a line of them: its polarity, and which way along the line it
// goes. With more than two there is no "towards each other" to name a
// direction by, so the line itself is what they are named against.
type LineSide = {
  polarity: Polarity;
  moving: 'left' | 'right';
};

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

  // A fresh order, so that what interacts with what is a draw rather than an
  // artefact of the order things happen to sit in.
  static shuffle<T>(arr: T[]): T[] {
    const out = arr.slice();

    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }

    return out;
  }
}

// Two rays meeting head-on, over the connection whose mutual boundaries are
// `a` and `b`. Opposite charges cancel; like ones turn around. Movement isn't
// here because it isn't an interaction: it is what a ray does when nothing is
// coming the other way.
type Interaction = {
  kind: 'annihilate' | 'turn';
  r: Ray; a: Boundary;
  r2: Ray; b: Boundary;
};

// World units per lattice step. Shared by the layout and by the renderer,
// which needs it to place boundaries that have a direction but no neighbour.
const LATTICE_STEP = 50;

// How far along its connection a boundary is drawn, as a fraction. Both ends
// draw one, so they meet with a gap of 1 - 2×this in between. The viewport
// fit uses it too, so that what it measures is what gets drawn.
const BOUNDARY_STUB = 0.25;

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

  // Something the seed has arranged for the world to go on doing, run at the
  // start of every tick before the rules get their say. Nothing in the rules
  // needs one — it is how a source that is never itself an event gets to be
  // one, which is the only way to ask what a thing that keeps emitting does
  // to the space around it.
  onTick?: (graph: Graph) => void;

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

  // Which way a boundary points, as a unit vector in grid space. A bare
  // direction says so itself; a connection is the step from the point it is
  // on to the point on the other side.
  private direction(bd: Boundary): number[] | undefined {
    if (bd.outward) {
      const length = Math.hypot(...bd.outward);
      return length ? bd.outward.map(v => v / length) : undefined;
    }

    const from = this.gridPos.get(bd.at.node);
    const to = bd.target && this.gridPos.get(bd.target.at.node);
    if (!from || !to) return undefined;

    const step = to.map((v, i) => v - from[i]);
    const length = Math.hypot(...step);

    return length ? step.map(v => v / length) : undefined;
  }

  // The boundary of `ray` pointing most nearly along `dir` (`sign` of -1 for
  // most nearly opposite). Movement is conserved rather than reselected, so
  // whenever a ray has to change which boundary it moves along, it does the
  // thing closest to carrying straight on — or, turning around, closest to
  // coming straight back.
  private along(ray: Ray, dir: number[] | undefined, sign: 1 | -1, exclude?: Boundary): Boundary | undefined {
    const options = ray.boundaries.filter(b => b !== exclude);
    if (!options.length) return undefined;
    if (!dir) return options[0];

    let best: Boundary | undefined;
    let bestDot = -Infinity;

    for (const option of options) {
      const d = this.direction(option);
      if (!d) continue;

      const dot = sign * d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0);
      if (dot > bestDot) { bestDot = dot; best = option; }
    }

    return best ?? options[0];
  }

  /**
   * Which way is behind us: the boundary pointing most nearly opposite to the
   * one we are moving along. Only a genuinely backward direction counts — a
   * perpendicular one is beside us, not behind us — so a ray with nothing
   * behind it gets `undefined` and the space it sheds into has to be made.
   */
  private behind(ray: Ray, dir: number[] | undefined, exclude: Boundary): Boundary | undefined {
    if (!dir) return undefined;

    let best: Boundary | undefined;
    let bestDot = 0.1; // has to actually point back, not sideways

    for (const option of ray.boundaries) {
      if (option === exclude) continue;

      const d = this.direction(option);
      if (!d) continue;

      const dot = -d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0);
      if (dot > bestDot) { bestDot = dot; best = option; }
    }

    return best;
  }

  // The point sitting at a grid position, if there is one. Positions are
  // real-valued (space instantiated between two points lands at their
  // midpoint), so this is a tolerance match rather than a key lookup.
  private nodeAt(pos: number[]): node | undefined {
    for (const [nd, p] of this.gridPos)
      if (p.length === pos.length && p.every((v, i) => Math.abs(v - pos[i]) < 1e-6))
        return nd;

    return undefined;
  }

  /**
   * The directions of a point that lie ACROSS the way we are going.
   *
   * The axis we are travelling on never changes hands: it is the thing being
   * travelled, and taking it would tear the line we are moving along in two.
   * Everything else is what a point IS as opposed to where it is, and it is
   * exactly what gets handed over as something moves through.
   */
  private transverse(rays: Ray[], dir: number[] | undefined, exclude?: Boundary): Boundary[] {
    if (!dir) return [];

    const out: Boundary[] = [];

    for (const ray of rays) {
      for (const bd of ray.boundaries) {
        if (bd === exclude) continue;

        const d = this.direction(bd);
        if (!d) continue;

        const along = Math.abs(d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0));
        if (along < 0.9) out.push(bd);
      }
    }

    return out;
  }

  // The same directions, held by somewhere else now.
  private hand(taken: Boundary[], onto: Ray) {
    for (const bd of taken) {
      bd.at.boundaries = bd.at.boundaries.filter(x => x !== bd);
      bd.at = onto;
      onto.boundaries.push(bd);
    }
  }

  /**
   * Two opposite charges meeting head-on: they cancel, and the space they
   * were goes with them.
   *
   * Not by being destroyed — space is never destroyed here, it is handed
   * backwards. Everything each of them held across the line they met on goes
   * to the point behind it, the two of them are spliced out of that line, and
   * what was behind them closes up directly onto what was behind the other.
   * Nothing comes apart: there is simply less space than there was, and what
   * that space was carrying is still carried.
   *
   * With nothing behind either of them there is nowhere backwards to hand
   * anything to, so the two collapse onto each other instead — one neutral
   * point left holding everything both of them held. A row of charges
   * annihilating pair by pair therefore ends as exactly that one point.
   */
  private annihilate(r: Ray, a: Boundary, r2: Ray, b: Boundary, removed: Set<node>) {
    const dirA = this.direction(a), dirB = this.direction(b);

    const backA = this.behind(r, dirA, a), backB = this.behind(r2, dirB, b);
    const homeA = backA?.target?.at, homeB = backB?.target?.at;

    if (homeA || homeB) {
      // Each side's space goes to whatever is behind it — or, for a side with
      // nothing behind it, to the other's, that being the only way left.
      this.hand(this.transverse([r], dirA, backA), homeA ?? homeB!);
      this.hand(this.transverse([r2], dirB, backB), homeB ?? homeA!);

      // The line closes up: what was behind one is now directly onto what was
      // behind the other.
      const pa = backA?.target, pb = backB?.target;

      if (pa && pb) {
        pa.target = pb;
        pb.target = pa;
      } else for (const p of [pa, pb]) {
        if (!p) continue;

        // Nothing on the far side to close onto, so the direction is all that
        // is left of what used to be there.
        const d = this.direction(p);
        p.target = undefined;
        p.outward = d;
      }

      this.discard(r, homeA ?? homeB!, removed);
      this.discard(r2, homeB ?? homeA!, removed);

      return;
    }

    // Nowhere behind either of them: everything the two were carrying ends up
    // on one point, which is all that is left of both.
    this.hand(this.transverse([r2], dirB, backB), r);

    r.boundaries = r.boundaries.filter(x => x !== a);
    this.discard(r2, r, removed);

    r.moving = undefined;
    for (const bd of r.boundaries) bd.polarity = Polarity.Neutral;
  }

  /**
   * A point that is no longer anywhere.
   *
   * Whatever it was carrying has already gone wherever it was going; this is
   * only the removal. Anything still pointing at it is left holding the bare
   * direction — the way is still that way, there is just nothing there — and
   * anything still sitting on it goes wherever its structure went.
   */
  private discard(ray: Ray, onto: Ray, removed: Set<node>) {
    const nd = ray.node;

    for (const bd of ray.boundaries) {
      const partner = bd.target;

      // Only if it is still pointing back at us: a connection that has
      // already been closed up onto something else is not ours to break.
      if (!partner || partner.target !== bd) continue;

      const d = this.direction(partner);
      partner.target = undefined;
      partner.outward = d;
    }

    ray.boundaries = [];

    for (const other of [...nd]) {
      if (other === ray) continue;

      other.node = onto.node;
      onto.node.push(other);
    }

    nd.length = 0;

    this.gridPos.delete(nd);
    this.nodes = this.nodes.filter(n => n !== nd);
    removed.add(nd);
  }

  /**
   * Two like charges meeting head-on: neither cancels the other and neither
   * can move through the other, so each simply turns itself around.
   *
   * Movement is conserved rather than reselected — it comes back the way it
   * came instead of setting off somewhere new — and if there is no way back
   * yet then the way back is something it has to have, so it gets one.
   */
  private turnAround(ray: Ray, a: Boundary) {
    const dir = this.direction(a);

    let back = this.behind(ray, dir, a);

    if (!back) {
      back = new Boundary(ray, this);
      back.polarity = a.polarity;
      if (dir) back.outward = dir.map(v => -v);
      ray.boundaries.push(back);
    }

    ray.moving = back;
  }

  /**
   * Whether there is anywhere to go.
   *
   * Space can be moved through. So can a point that is itself moving out of
   * our way, because by the time we get there it will have put down the space
   * it left behind, and that space is what we move through. Anything else is
   * in the way — including something on its way somewhere that is itself
   * blocked, which is why this is asked of a whole queue at once rather than
   * of one point in isolation.
   */
  private canMove(ray: Ray, a: Boundary, blocked: Set<Ray>): boolean {
    if (!a.target) return true; // an actual boundary of the structure: we make our own way

    const dir = this.direction(a);

    for (const other of a.target.at.node) {
      if (!other.moving) continue; // space: ours to move through

      const d = this.direction(other.moving);
      if (!d || !dir) return false;

      // Not leaving the way we are going, so it is in the way.
      if (d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0) < 0.9) return false;

      // Leaving, but blocked itself, so it isn't leaving after all.
      if (blocked.has(other)) return false;
    }

    return true;
  }

  /**
   * The space something leaves behind it.
   *
   * We never move ourselves — a point is what "where" is made of, and has
   * nowhere to go. What moves is space: a fresh point is put behind us,
   * spliced in between us and whatever was already back there, and everything
   * we were carrying across our direction of travel is handed to it. It is
   * neutral and has no direction of its own; nothing has happened to it yet,
   * and giving it a charge at random would be an event this model didn't
   * have.
   */
  private emitBehind(ray: Ray, a: Boundary, vacated: Map<node, number[]>) {
    const dir = this.direction(a);
    const here = this.gridPos.get(ray.node);

    let back = this.behind(ray, dir, a);
    const was = back?.target;
    const there = was && this.gridPos.get(was.at.node);

    const nd: node = [];
    const fresh = new Ray(nd, this);
    fresh.boundaries = []; // drop the constructor's default

    const facing = new Boundary(fresh, this);
    facing.polarity = Polarity.Neutral;
    fresh.boundaries.push(facing);

    // Nothing behind us at all, not even a bare direction, so the way back is
    // itself something we have to have.
    if (!back) {
      back = new Boundary(ray, this);
      back.polarity = Polarity.Neutral;
      ray.boundaries.push(back);
    }

    back.outward = undefined;
    back.target = facing;
    facing.target = back;

    // Whatever was behind us is behind the point we just put there.
    const onward = new Boundary(fresh, this);
    onward.polarity = Polarity.Neutral;

    if (was) { onward.target = was; was.target = onward; }
    else if (dir) onward.outward = dir.map(v => -v);

    fresh.boundaries.push(onward);

    this.nodes.push(nd);

    // Where it ends up is where we are: we are about to be one step further
    // on, and this is what we will have left at the place we were. It can't
    // be put there yet, though — until we have actually gone, that place is
    // still occupied by us, and two points sharing one position have no
    // direction between them for anything else to read. So it waits between
    // us and what is behind us, and is put down properly once the moving is
    // over.
    this.gridPos.set(nd, !here ? []
      : there ? here.map((v, i) => (v + there[i]) / 2)
        : dir ? here.map((v, i) => v - dir[i])
          : here.slice());

    if (here) vacated.set(nd, here.slice());

    this.hand(this.transverse([ray], dir, back), fresh);
  }

  /**
   * Moving through the space in front of us: it comes onto us, and stops
   * being anywhere.
   *
   * This is the half of movement that makes it movement rather than drift.
   * Its structure becomes ours, its place becomes our place, and the
   * connection we came in on is rewired straight through to whatever lay
   * beyond it, so nothing comes apart. One point is consumed here for the one
   * emitted behind, so space is conserved: a thing moving is a thing swapping
   * places with the space in front of it while everything else stays where it
   * was.
   *
   * Only space is ever consumed. Anything with a direction of its own is
   * somebody rather than somewhere.
   */
  private consumeAhead(ray: Ray, a: Boundary, removed: Set<node>, vacated: Map<node, number[]>) {
    // Nothing in front of us at all: we assume we can go that way anyway, and
    // make what we are moving into.
    if (!a.target) this.grow(ray, a);

    const ahead = a.target;
    if (!ahead) return;

    const nd = ahead.at.node;
    if (nd === ray.node || removed.has(nd)) return;

    for (const other of nd)
      if (other.moving) return;

    const dir = this.direction(a);

    // Where it is going to be, which is not yet where it is if it is space
    // something else has just put down on its way out.
    const there = vacated.get(nd) ?? this.gridPos.get(nd);

    // What lies beyond it the way we are going — carrying on, rather than
    // across. Our own direction of travel is rewired onto that, so the line
    // we are moving along stays a line.
    let onward: Boundary | undefined;
    let onwardDir: number[] | undefined;

    for (const other of nd) {
      for (const bd of other.boundaries) {
        if (bd === ahead) continue;

        const d = this.direction(bd);
        if (!d || !dir) continue;

        if (d.reduce((sum, v, i) => sum + v * (dir[i] || 0), 0) > 0.9) {
          onward = bd;
          onwardDir = d;
        }
      }
    }

    // Everything it held across our path is ours now.
    this.hand(this.transverse(nd, dir, ahead), ray);

    const beyond = onward?.target;

    if (beyond) {
      a.target = beyond;
      beyond.target = a;
    } else {
      // Nothing beyond it: what we are moving along is a bare direction
      // again, and growing into it is the next thing we do.
      a.target = undefined;
      a.outward = onwardDir ?? dir;
    }

    // Anything still pointing at it is pointing at nowhere; the direction
    // survives the point, so it is left as a bare one.
    for (const other of nd) {
      for (const bd of other.boundaries) {
        const partner = bd.target;
        if (!partner || partner === a || partner === beyond) continue;

        const d = this.direction(partner);
        partner.target = undefined;
        partner.outward = d;
      }

      other.boundaries = [];
    }

    // Its place is our place: we have moved.
    if (there) this.gridPos.set(ray.node, there.slice());

    this.gridPos.delete(nd);
    this.nodes = this.nodes.filter(n => n !== nd);
    removed.add(nd);
    vacated.delete(nd);
  }

  /**
   * An actual boundary of the structure: there is nothing in front of us at
   * all. We assume we can go that way anyway, and make what we are going
   * into — a new point, connected to what we are connected to, so that what
   * grows is more of the same lattice rather than a spur hanging off it.
   *
   * Neutral, like anything else instantiated: it is somewhere to be, not
   * something to be. It is space, so the move that made it consumes it in the
   * same tick, which is what moving into nothing amounts to.
   */
  private grow(ray: Ray, a: Boundary) {
    const dir = this.direction(a);
    const here = this.gridPos.get(ray.node);
    if (!dir || !here) return;

    const pos = here.map((v, i) => v + dir[i]);

    const nd: node = [];
    const fresh = new Ray(nd, this);
    fresh.boundaries = []; // drop the constructor's default

    const facing = new Boundary(fresh, this);
    facing.polarity = Polarity.Neutral;
    facing.target = a;
    fresh.boundaries.push(facing);

    a.outward = undefined; // a connection now, not a bare direction
    a.target = facing;

    this.nodes.push(nd);
    this.gridPos.set(nd, pos);

    // Connected to what we are connected to: one direction for each of ours,
    // a real connection where a point is already there and a bare direction
    // where there isn't one yet, so the frontier can keep going.
    for (const boundary of ray.boundaries) {
      if (boundary === a) continue;

      const d = this.direction(boundary);
      if (!d) continue;

      const neighbour = this.nodeAt(pos.map((v, i) => v + d[i]));
      if (neighbour === ray.node || neighbour === nd) continue; // back at us

      const side = new Boundary(fresh, this);
      side.polarity = Polarity.Neutral;

      if (neighbour) {
        const facingBack = new Boundary(neighbour[0], this);
        facingBack.polarity = Polarity.Neutral;
        facingBack.target = side;
        side.target = facingBack;
        neighbour[0].boundaries.push(facingBack);
      } else {
        side.outward = d;
      }

      fresh.boundaries.push(side);
    }
  }

  /**
   * One tick. Every ray acts, and each acts on one thing only: the boundary
   * it is moving towards. There is nothing else it consults.
   *
   * Two of them meeting head-on is the one thing that isn't movement, and
   * what it is depends only on the two charges that met:
   *
   *  - opposite → they cancel, leaving the space they were still connected
   *    and still there, just neutral and still;
   *  - alike → neither can cancel and neither can pass, so each turns itself
   *    around.
   *
   * Everything else moves, and moving is a trade with space: put a point down
   * behind, take the point in front. Space is conserved by it, which is what
   * makes a column of things moving in step actually travel — the space each
   * one leaves is the space the one behind it moves into.
   */
  tick() {
    this._tickId++;

    this.onTick?.(this);

    // Snapshot the rays first, so structural changes don't disturb iteration.
    const rays: Ray[] = [];
    for (const node of this.nodes)
      for (const ray of node)
        rays.push(ray);

    // Which way each ray was headed when the tick began. Read once, so that
    // acting in some order doesn't let the earlier actions decide what the
    // later ones are — head-on is head-on as of the start of the tick.
    const headed = new Map<Ray, Boundary | undefined>();
    for (const r of rays) headed.set(r, r.moving);

    // 1. Who is meeting whom head-on. Both ends of such a pair have had their
    // tick: turning around, or cancelling, is the whole of what they do in
    // it.
    const collisions: Interaction[] = [];
    const met = new Set<Ray>();

    for (const r of rays) {
      if (met.has(r)) continue;

      const a = headed.get(r);
      if (!a) continue;

      const b = a.target;
      const r2 = b?.at;

      // Is the far side coming back at us along this same connection?
      if (!b || !r2 || r2.node === r.node || headed.get(r2) !== b || b.target !== a) continue;

      met.add(r); met.add(r2);

      // Only two actual charges, one of each, cancel. Neutral space has no
      // charge to cancel with, so anything else that meets head-on turns
      // around instead.
      const opposed =
        (a.polarity === Polarity.Positive && b.polarity === Polarity.Negative) ||
        (a.polarity === Polarity.Negative && b.polarity === Polarity.Positive);

      collisions.push({ kind: opposed ? 'annihilate' : 'turn', r, a, r2, b });
    }

    const removed = new Set<node>();

    for (const it of collisions) {
      if (it.kind === 'annihilate') {
        this.annihilate(it.r, it.a, it.r2, it.b, removed);
      } else {
        this.turnAround(it.r, it.a);
        this.turnAround(it.r2, it.b);
      }
    }

    // 2. Everything else moves — read off the world as the collisions have
    // left it, so that space that has just closed up behind an annihilation
    // is gone before anything tries to move through it.
    const movers = rays.filter(r =>
      !met.has(r)
      && r.moving
      && !removed.has(r.node)
      && r.boundaries.includes(r.moving));

    // Who is actually going anywhere. Being behind something that is leaving
    // is fine; being behind something that turns out not to be leaving after
    // all is not, so this settles rather than being decided in one pass.
    const blocked = new Set<Ray>();
    for (let pass = 0; pass < movers.length; pass++) {
      let changed = false;

      for (const r of movers) {
        if (blocked.has(r)) continue;
        if (this.canMove(r, r.moving!, blocked)) continue;

        blocked.add(r);
        changed = true;
      }

      if (!changed) break;
    }

    const going = Universe.shuffle(movers.filter(r => !blocked.has(r)));

    // Two passes over the same rays. Everything puts down the space it is
    // leaving before anything goes anywhere, because the space one of them
    // leaves is what the one behind it moves through — done one ray at a time
    // instead, the one behind would find its way blocked by a neighbour that
    // hasn't left yet.
    const vacated = new Map<node, number[]>();

    for (const r of going) this.emitBehind(r, r.moving!, vacated);
    for (const r of going) this.consumeAhead(r, r.moving!, removed, vacated);

    // Everything has gone where it was going, so the space left behind can
    // take the places that were left.
    for (const [nd, pos] of vacated)
      if (!removed.has(nd)) this.gridPos.set(nd, pos);

    this.invalidateLayout();
  }

  /**
   * Seed an initial "expanding universe": a small connected patch of nodes,
   * each a single ray with one boundary per orthogonal neighbour. Every
   * boundary gets a random polarity, and every ray a random `moving`
   * direction (one of its boundaries). From there the tick rules —
   * annihilation (opposite polarities meeting head-on), merging (like
   * polarities meeting head-on), and movement (everything else) — drive the
   * evolution.
   *
   * The patch is small because everything in it moves, and everything that
   * moves instantiates the space it leaves behind: the population grows by
   * roughly one point per moving ray per tick, so what you seed is what you
   * pay for on every tick thereafter.
   */
  static expandingGrid(dims: number, size = 5): Graph {
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

    const { nodes } = Graph.wire(graph, coords.map(c => c.map(v => v - center)), () => Universe.randomPolarity());

    // Give every ray an initial movement direction — a random one of its
    // boundaries. This is an initial condition, not a choice the dynamics
    // ever make again: from here on movement is conserved.
    for (const node of nodes) {
      const ray = node[0];
      if (ray.boundaries.length)
        ray.moving = ray.boundaries[Math.floor(Math.random() * ray.boundaries.length)];
    }

    graph.ringRadius = center;

    return graph;
  }

  /**
   * Lay a patch of points out on a lattice: one point per coordinate, each a
   * single ray carrying one boundary per orthogonal neighbour present in the
   * patch, wired to that neighbour's boundary facing back.
   *
   * Returns everything a caller needs to say which way things move: the
   * points in coordinate order, a lookup by coordinate, and, per point, which
   * of its boundaries faces which neighbour.
   */
  private static wire(
    graph: Graph,
    coords: number[][],
    polarity: (coord: number[]) => Polarity,
  ) {
    const key = (c: number[]) => c.join(",");

    const nodes: node[] = [];
    const byCoord = new Map<string, node>();
    const coordOf = new Map<node, number[]>();

    for (const coord of coords) {
      const nd: node = [];
      const ray = new Ray(nd, graph);
      ray.boundaries = []; // drop the constructor's default boundary

      graph.nodes.push(nd);
      graph.gridPos.set(nd, coord);

      nodes.push(nd);
      byCoord.set(key(coord), nd);
      coordOf.set(nd, coord);
    }

    const facing = new Map<node, Map<node, Boundary>>();
    for (const nd of nodes) {
      const coord = coordOf.get(nd)!;
      const ray = nd[0];
      const m = new Map<node, Boundary>();
      facing.set(nd, m);

      for (let axis = 0; axis < coord.length; axis++) {
        for (const dir of [-1, 1]) {
          const nc = coord.slice();
          nc[axis] += dir;
          const neighbour = byCoord.get(key(nc));
          if (!neighbour) continue;

          const b = new Boundary(ray, graph);
          b.polarity = polarity(coord);
          ray.boundaries.push(b);
          m.set(neighbour, b);
        }
      }
    }

    // Mutual targets: this point's boundary facing a neighbour points at that
    // neighbour's boundary facing back.
    for (const nd of nodes) {
      for (const [neighbour, b] of facing.get(nd)!) {
        const back = facing.get(neighbour)!.get(nd);
        if (back) b.target = back;
      }
    }

    return { nodes, byCoord, facing, key };
  }

  /**
   * Two solid blocks of points, side by side along x, every point in each one
   * moving into the other. Each block's boundaries all carry that block's
   * polarity, so the whole of the interface between them meets head-on at
   * once — and the three ways two polarities can be arranged (opposite, both
   * positive, both negative) are three different things happening to a whole
   * surface rather than to a single pair.
   *
   * Opposite: the interface annihilates a column at a time, each annihilation
   * throwing what it was carrying out behind it, so the two blocks come apart
   * backwards. Like polarities can't annihilate, so the interface merges
   * instead and the two blocks become one.
   *
   * Interior points are moving into their own block, which isn't head-on (the
   * point ahead is moving the same way, not back), so behind the interface
   * every column is simply moving.
   */
  static blocks(left: Polarity, right: Polarity, size = 3): Graph {
    const graph = new Graph();
    graph.dims = 2;
    graph.ringRadius = size;

    const half = Math.floor(size / 2);

    const coords: number[][] = [];
    for (let x = -size; x < size; x++)
      for (let y = -half; y <= half; y++)
        coords.push([x, y]);

    const { nodes, byCoord, facing, key } = Graph.wire(
      graph, coords, coord => coord[0] < 0 ? left : right,
    );

    // Every point heads for the interface: the left block moves +x, the right
    // block -x. So the two innermost columns meet head-on, and every column
    // behind them is moving into the back of the one in front.
    for (const nd of nodes) {
      const coord = graph.gridPos.get(nd)!;
      const towards = byCoord.get(key([coord[0] + (coord[0] < 0 ? 1 : -1), coord[1]]));
      if (towards) nd[0].moving = facing.get(nd)!.get(towards);
    }

    return graph;
  }

  /**
   * The same two blocks, but not touching: a wide field of neutral space
   * between them, and neither of them moving. Nothing here is told to fall
   * towards anything.
   *
   * What they do instead is emit. Every tick each block writes a charge onto
   * the space at its face and points it across the gap — alternating, so a
   * charged pulse goes out every other tick and a neutral one in between. A
   * pulse is not a new thing added to the world: it is a point of the space
   * that was already there, told what it is and which way it is going. It
   * crosses by trading places with the space in front of it, so the field
   * stays the same size while something travels through it.
   *
   * The two streams meet in the middle, and what they do there is the whole
   * experiment:
   *
   *  - opposite charges annihilate, and annihilation is the one rule that
   *    takes space out of the world. The two points that cancelled are gone
   *    and what was behind each closes directly onto what was behind the
   *    other, so every meeting leaves the two blocks fewer points apart than
   *    they were. Nothing moved them. The distance between them is just
   *    smaller — which is what it would mean, here, for them to be falling
   *    towards each other. Once the first pair meets there is a meeting every
   *    tick, each eating the two columns that met, and it runs until the field
   *    is gone and the two blocks are directly connected.
   *  - like charges can't cancel, so they turn around and go home instead.
   *    The field is exactly as wide as it was — and what comes back is a
   *    charge arriving at a block that isn't moving, which the block has no
   *    way to refuse, so the blocks end up being driven apart by their own
   *    emissions rather than drawn together.
   *
   * So `left` and `right` are what each block emits, and that alone is the
   * difference between attraction and repulsion.
   *
   * What is drawn is still where each point was put down, and annihilation
   * doesn't move what it leaves behind: the field empties from the middle
   * outwards and the blocks stay where they were drawn, joined across the
   * emptied part by the connection that closed up over it. The gap in the
   * picture is the space that no longer exists.
   *
   * `every` is how many ticks apart the emissions are, and `spin` flips what
   * each block is emitting between one emission and the next — a magnet being
   * turned over and over rather than held still. `left` and `right` are then
   * only what each side starts as, and what matters is whether the two are
   * turning together or against each other.
   */
  static emitters(
    left: Polarity,
    right: Polarity,
    {
      size = 2,
      gap = 16,
      height = 3,
      every = 2,
      spin = false,
    }: {
      size?: number, gap?: number, height?: number,
      every?: number, spin?: boolean,
    } = {},
  ): Graph {
    const graph = new Graph();
    graph.dims = 2;
    graph.ringRadius = 1; // a flat lattice: nothing here wants rounding off

    const half = Math.floor(height / 2);

    // The field is an even number of columns wide, so that the two streams
    // end up adjacent and meet each other rather than both arriving at the
    // same empty cell — which is two things trying to be in one place, and
    // not a meeting at all.
    const width = gap + (gap % 2);
    const l0 = -width / 2, r0 = width / 2 - 1; // the two columns at the faces

    const coords: number[][] = [];
    for (let x = l0 - size; x <= r0 + size; x++)
      for (let y = -half; y <= half; y++)
        coords.push([x, y]);

    // Only the blocks are charged. The field between them is what space is
    // when nothing has happened to it yet.
    const { byCoord, key } = Graph.wire(graph, coords, coord =>
      coord[0] < l0 ? left
        : coord[0] > r0 ? right
          : Polarity.Neutral);

    // The two faces: the innermost column of each block, and the way out of
    // it. Blocks never move, so these stay the points they are.
    const faces: { at: node, dir: number[], polarity: Polarity }[] = [];

    for (let y = -half; y <= half; y++) {
      const l = byCoord.get(key([l0 - 1, y]));
      const r = byCoord.get(key([r0 + 1, y]));

      if (l) faces.push({ at: l, dir: [1, 0], polarity: left });
      if (r) faces.push({ at: r, dir: [-1, 0], polarity: right });
    }

    graph.onTick = g => {
      // Ticks are counted from the first one, so `every = 2` puts a step of
      // untouched space between one pulse and the next — the tick in between
      // emits neutral, and emitting neutral is emitting what the space at the
      // face already is, which is to say nothing leaves. `every = 1` is a
      // block that never stops: one pulse directly behind the last, with no
      // space in between for either of them to move through.
      if ((g._tickId - 1) % every !== 0) return;

      // Which way round the magnet is by now.
      const turned = spin && Math.floor((g._tickId - 1) / every) % 2 === 1;

      for (const face of faces) {
        const here = g.gridPos.get(face.at);
        if (!here) continue;

        const ahead = g.nodeAt(here.map((v, i) => v + face.dir[i]));
        const ray = ahead?.[0];

        // Only space can be told what to be. Anything already going somewhere
        // is somebody, and the face waits rather than overwriting it.
        if (!ray || ray.moving) continue;

        const polarity = !turned ? face.polarity
          : face.polarity === Polarity.Positive ? Polarity.Negative : Polarity.Positive;

        for (const bd of ray.boundaries)
          bd.polarity = polarity;

        ray.moving = g.along(ray, face.dir, 1);
      }
    };

    return graph;
  }

  /**
   * The smallest possible universe: two spatial points A—B, one ray each,
   * joined by a mutual boundary pair. Every permutation of (polarity,
   * movement direction) over the two sides is one isolated experiment in the
   * tick rules — head-on like polarities merge into one point, head-on
   * opposite polarities annihilate, and anything else moves: away from each
   * other they grow the structure ahead of them and instantiate the space
   * they vacate between themselves.
   *
   * Each side also carries an OUTWARD boundary (no target, pointing away from
   * the partner). Without it "moving away from the connection" would be
   * inexpressible — a ray whose only boundary is the connection can never
   * point elsewhere, so a side could never be at an actual boundary of the
   * structure and moving into it.
   */
  static pair(a: PairSide, b: PairSide): Graph {
    // "Towards" and "away" are the two ends of a line seen from each other:
    // the left one heads right to close the gap, the right one heads left.
    return Graph.line([
      { polarity: a.polarity, moving: a.moving === 'towards' ? 'right' : 'left' },
      { polarity: b.polarity, moving: b.moving === 'towards' ? 'left' : 'right' },
    ]);
  }

  /**
   * The same universe with room in it: n charges in a row, each with a
   * polarity and a direction along the line, every point connected to the
   * next.
   *
   * A pair can only do the one thing its two ends do to each other. A line
   * of three or four has an inside — charges with something on both sides of
   * them — so what one interaction leaves behind is what the next one has to
   * work with. Annihilations close the line up behind them, movement trades
   * places with the space between, and the ends grow more line to move into.
   *
   * Both ends carry an OUTWARD boundary (no target, pointing off the end).
   * Without it an end moving outwards would have nowhere to be moving — it is
   * at an actual boundary of the structure, and moves by making more of it.
   */
  static line(sides: LineSide[]): Graph {
    const graph = new Graph();
    graph.dims = 3;
    graph.ringRadius = 1;

    const n = sides.length;
    const lefts: Boundary[] = [];
    const rights: Boundary[] = [];

    sides.forEach((side, i) => {
      const nd: node = [];
      const ray = new Ray(nd, graph);
      ray.boundaries = []; // drop the constructor's default

      const left = new Boundary(ray, graph);
      left.polarity = side.polarity;
      if (i === 0) left.outward = [-1, 0, 0];

      const right = new Boundary(ray, graph);
      right.polarity = side.polarity;
      if (i === n - 1) right.outward = [1, 0, 0];

      ray.boundaries.push(left, right);
      ray.moving = side.moving === 'left' ? left : right;

      lefts.push(left);
      rights.push(right);

      graph.nodes.push(nd);
      graph.gridPos.set(nd, [i - (n - 1) / 2, 0, 0]);
    });

    for (let i = 0; i + 1 < n; i++) {
      rights[i].target = lefts[i + 1];
      lefts[i + 1].target = rights[i];
    }

    return graph;
  }

  /**
   * A deep copy: new nodes, rays and boundaries, with every `target` and
   * `moving` reference remapped onto the copies. Ticking the original leaves
   * the clone untouched, which is what lets a run be frozen state by state.
   *
   * Rays and boundaries are built with `Object.create` rather than `new`,
   * because their constructors have side effects — a Ray registers itself on
   * its node and grows a default boundary — that would corrupt the copy.
   */
  clone(): Graph {
    const graph = new Graph();
    graph.dims = this.dims;
    graph.ringRadius = this.ringRadius;
    graph._tickId = this._tickId;
    graph.onTick = this.onTick;

    const rays = new Map<Ray, Ray>();
    const boundaries = new Map<Boundary, Boundary>();

    for (const nd of this.nodes) {
      const copy: node = [];

      for (const ray of nd) {
        const r: Ray = Object.create(Ray.prototype);
        r.id = ray.id;
        r.node = copy;
        r.boundaries = [];
        rays.set(ray, r);
        copy.push(r);

        for (const bd of ray.boundaries) {
          const b: Boundary = Object.create(Boundary.prototype);
          b.polarity = bd.polarity;
          b.at = r;
          if (bd.outward) b.outward = bd.outward.slice();
          boundaries.set(bd, b);
          r.boundaries.push(b);
        }
      }

      graph.nodes.push(copy);

      const pos = this.gridPos.get(nd);
      if (pos) graph.gridPos.set(copy, pos.slice());
    }

    // Second pass — every boundary now exists, so the references between
    // them can be resolved.
    for (const nd of this.nodes) {
      for (const ray of nd) {
        const r = rays.get(ray)!;
        if (ray.moving) r.moving = boundaries.get(ray.moving);

        ray.boundaries.forEach((bd, i) => {
          if (bd.target) r.boundaries[i].target = boundaries.get(bd.target);
        });
      }
    }

    return graph;
  }

  private layoutCache?: Map<node, Vec>;
  private dirty = true;

  get layout(): Map<node, Vec> {
    if (!this.layoutCache || this.dirty) {
      this.layoutCache = this.sphereLayout({ scale: LATTICE_STEP });
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

  // A boundary with no target has no neighbour to be drawn towards. `outward`
  // gives it a bare direction (in grid units) so it can still be rendered —
  // and so a ray has somewhere to move that ISN'T one of its connections,
  // which is what "moving away from this connection" means.
  outward?: number[];

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

// How many ticks one cycle of a repeating pattern runs for, when `repeated`
// is passed as a bare boolean rather than a count.
const DEFAULT_STEPS = 8;

export interface CalculusVisualizationProps {
  // The universe to run. A factory, not an instance: it is called again on
  // every reset, so each cycle starts from a freshly seeded graph.
  graph?: () => Graph;

  // A repeating pattern: run this many ticks, reset to the seed, run again.
  // `true` uses DEFAULT_STEPS; `false` runs indefinitely without resetting.
  repeated?: boolean | number;

  // Don't animate: lay every step of the pattern out at once, left to right
  // (wrapping to further lines when there isn't the width), with an arrow
  // between consecutive states. There is nothing to play, so no controls.
  filmstrip?: boolean;

  autoplay?: boolean;
  height?: number;

  // The gravity-flow glow. Worth it for a large universe; for a two-point one
  // it just washes out the handful of boundaries the picture is about (and
  // costs a few hundred gradient fills a frame, times however many of these
  // are on the page).
  density?: boolean;
}

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
const GraphView = ({
  graph: current,
  animate = false,
  density = true,
  onFrame,
}: {
  // Read afresh every frame, so a reset that swaps the whole graph out is
  // picked up without tearing the render loop down.
  graph: () => Graph;
  animate?: boolean;
  density?: boolean;
  onFrame?: (dt: number) => void;
}) => {
  const canvasRef = useRef(null);
  const camRef = useRef({ scale: 44, rot: Math.PI / 4, tilt: 0.6155, anchor: null, dist: null, distMult: 1.5, scaleMult: 1 });

  // The frame loop is set up once and outlives every re-render, so it must
  // not capture these — a callback closed over at mount time would still be
  // looking at the state of the world as it was then (which is what made
  // pausing do nothing: the loop kept calling the first render's onFrame,
  // where `running` was frozen at its initial value). Kept in refs and read
  // per frame, so the loop always calls the current ones.
  const latest = useRef({ current, onFrame });
  latest.current = { current, onFrame };

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
    const onResize = () => {
      resize();
      if (!animate) draw(); // no frame loop to pick the new size up
    };
    window.addEventListener("resize", onResize);

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
      const graph = latest.current.current();

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

      // Cursor-anchored pan only applies in 2D — there's no camera distance to
      // dolly there, so screen-space zoom-toward-cursor is the natural
      // control. In 3D the camera orbits/dollies toward the origin, which is
      // the standard convention for an orbit camera.
      // const panX = dim === 2 && cam.anchor ? cam.anchor.screenX - cam.anchor.worldX * cam.scale : 0;
      // const panY = dim === 2 && cam.anchor ? cam.anchor.screenY - cam.anchor.worldY * cam.scale : 0;
      const cx = w / 2 /*+ panX*/, cy = h / 2 /*+ panY*/;

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
        if (p.clipped) continue;
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

      for (const n of graph.nodes) {
        const p = pts.get(n);
        if (!p || p.clipped || !onScreen(p)) continue;
        const depth = Math.min(Math.max(p.depth, 0.4), 1.6);

        // Center seed: a soft glow marking where the universe started.
        if (isCenterNode(n)) {
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
          ctx.strokeStyle = moving
            ? (bd.polarity === Polarity.Positive ? "#FF7A45"
              : bd.polarity === Polarity.Negative ? "#3DDCFF"
                : "#8C93A8")
            : (bd.polarity === Polarity.Positive ? "rgba(255,122,69,0.3)"
              : bd.polarity === Polarity.Negative ? "rgba(61,220,255,0.3)"
                : "rgba(140,147,168,0.25)");
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

        // Dim pass first, so the highlighted one is never overdrawn by it.
        for (const { bd, moving } of slots.values())
          if (!moving) stub(bd, false);

        for (const { bd, moving } of slots.values())
          if (moving) stub(bd, true);

        ctx.lineCap = "butt";
      }
    }

    function frame(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      latest.current.onFrame?.(dt);
      draw();

      raf = requestAnimationFrame(frame);
    }

    // A still is drawn once here (and again whenever it is resized); only an
    // animated view keeps a frame loop alive.
    if (animate) raf = requestAnimationFrame(frame);
    else draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      // canvas.removeEventListener("wheel", onWheel);
      // canvas.removeEventListener("contextmenu", onContextMenu);
      // canvas.removeEventListener("mousedown", onMouseDown);
      // window.removeEventListener("mousemove", onMouseMove);
      // window.removeEventListener("mouseup", onMouseUp);
    };
  }, [animate, density]);


  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
}

/**
 * The animated form: one universe, ticking, with transport controls.
 */
const CalculusPlayer = ({
  graph: seed = () => Graph.expandingGrid(3),
  repeated = false,
  autoplay = repeated !== false,
  height = 150,
  density = true,
}: CalculusVisualizationProps) => {
  const [running, setRunning] = useState(autoplay);

  // The live universe. Held in a ref rather than state because resetting
  // swaps the whole graph out mid-animation-frame — the render loop reads it
  // afresh every frame, so it picks the new one up without tearing down.
  const graphRef = useRef<Graph | null>(null);
  if (!graphRef.current) graphRef.current = seed();

  // Ticks taken since the last reset, against which `repeated` is measured.
  const stepsRef = useRef(0);

  const cycle = typeof repeated === 'number' ? repeated : DEFAULT_STEPS;
  const loops = repeated !== false;

  const reset = () => {
    graphRef.current = seed();
    stepsRef.current = 0;
  };

  const step = () => {
    graphRef.current?.tick();
    stepsRef.current++;
  };

  // Step the polarity dynamics once every TICK_INTERVAL seconds while
  // running — annihilation / turn-around / structure-absorption.
  const TICK_INTERVAL = 0.45;
  const accum = useRef(0);

  const onFrame = (dt: number) => {
    if (!running || !graphRef.current!.nodes.length) return;

    accum.current += dt;
    while (accum.current >= TICK_INTERVAL) {
      accum.current -= TICK_INTERVAL;

      // A repeating pattern spends one interval showing the seed again
      // before stepping on, so the loop point is legible rather than an
      // instant jump back.
      if (loops && stepsRef.current >= cycle) reset();
      else step();
    }
  };

  return <div>
    <div style={{ height }}>
      <GraphView graph={() => graphRef.current!} animate density={density} onFrame={onFrame} />
    </div>
    <Row end="xs" className="child-px-2">
      {running
        ? <>
          <div style={{ width: '1em' }}></div>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={() => setRunning(false)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z" /></svg></Button>
          <div style={{ width: '1em' }}></div>
        </>
        : <>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={reset}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z" /></svg></Button>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={() => setRunning(true)}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" /></svg></Button>
          <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={step}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">{/* <!--!Font Awesome Free v7.3.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--> */}<path d="M149 100.8C161.9 93.8 177.7 94.5 190 102.6L448 272.1L448 128C448 110.3 462.3 96 480 96C497.7 96 512 110.3 512 128L512 512C512 529.7 497.7 544 480 544C462.3 544 448 529.7 448 512L448 367.9L190 537.5C177.7 545.6 162 546.3 149 539.3C136 532.3 128 518.7 128 504L128 136C128 121.3 136.1 107.8 149 100.8z" /></svg></Button>
        </>
      }
    </Row>
  </div>
}

/**
 * The static form: the same pattern, but every step of it laid out at once.
 *
 * The dynamics are stochastic (which boundary a ray turns around to, what
 * polarity a newly created point gets), so the states can't be re-derived by
 * re-running the seed — running it again gives a different history. One run
 * is stepped through, and each state along the way is cloned out of it, so
 * the strip really is consecutive states of a single universe.
 */
const CalculusFilmstrip = ({
  graph: seed = () => Graph.expandingGrid(3),
  repeated = false,
  height = 150,
  density = true,
}: CalculusVisualizationProps) => {
  const cycle = typeof repeated === 'number' ? repeated : DEFAULT_STEPS;

  const frames = useMemo(() => {
    const graph = seed();
    const states = [graph.clone()];

    for (let i = 0; i < cycle; i++) {
      graph.tick();
      states.push(graph.clone());
    }

    return states;
  }, []);

  return <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
    {frames.map((graph, i) => (
      <Fragment key={i}>
        {i > 0
          ? <div style={{ flex: '0 0 auto', padding: '0 0.5em', color: '#515254' }}>→</div>
          : null}
        <div style={{ flex: '1 1 120px', height }}>
          <GraphView graph={() => graph} density={density} />
        </div>
      </Fragment>
    ))}
  </div>
}

const CalculusVisualization = ({ filmstrip, ...props }: CalculusVisualizationProps) =>
  filmstrip
    ? <CalculusFilmstrip {...props} />
    : <CalculusPlayer {...props} />;

// The four states one end of a two-point universe can be in: its polarity,
// and whether its ray moves into the connection or away from it.
const SIDE_STATES: PairSide[] = [
  { polarity: Polarity.Positive, moving: 'towards' },
  { polarity: Polarity.Positive, moving: 'away' },
  { polarity: Polarity.Negative, moving: 'towards' },
  { polarity: Polarity.Negative, moving: 'away' },
];

// Every combination of those two ends. `j >= i` drops mirror images — a
// universe and its left-right reflection run identically, so listing both
// would only duplicate the same experiment. Drop the slice for all 16.
const PAIRS: { a: PairSide, b: PairSide }[] = SIDE_STATES.flatMap((a, i) =>
  SIDE_STATES.slice(i).map(b => ({ a, b }))
);

type Pair = { a: PairSide, b: PairSide };

// Identity of a pair up to mirroring: whichever ordering of its two ends
// sorts first, since a universe and its reflection are the same experiment.
const pairKey = ({ a, b }: Pair) => {
  const end = (s: PairSide) => `${s.polarity}${s.moving}`;
  const [x, y] = [`${end(a)}|${end(b)}`, `${end(b)}|${end(a)}`];
  return x < y ? x : y;
};

// The anti-universe: every polarity flipped, every movement direction kept.
const anti = ({ a, b }: Pair): Pair => {
  const flip = (s: PairSide): PairSide => ({
    polarity: s.polarity === Polarity.Positive ? Polarity.Negative : Polarity.Positive,
    moving: s.moving,
  });

  return { a: flip(a), b: flip(b) };
};

// Pairs grouped with their own anti-pair, so the two sit one above the other.
// Head-on opposite polarities (and away-from-each-other opposite polarities)
// are their own anti up to mirroring, so those groups hold a single pair.
const ANTI_GROUPS: Pair[][] = (() => {
  const byKey = new Map(PAIRS.map(p => [pairKey(p), p]));
  const taken = new Set<string>();
  const groups: Pair[][] = [];

  for (const pair of PAIRS) {
    const key = pairKey(pair);
    if (taken.has(key)) continue;
    taken.add(key);

    const group = [pair];

    const opposite = pairKey(anti(pair));
    if (!taken.has(opposite) && byKey.has(opposite)) {
      taken.add(opposite);
      group.push(byKey.get(opposite)!);
    }

    groups.push(group);
  }

  return groups;
})();

// The same four states a side of a pair can be in, named against the line
// rather than against a partner.
const LINE_STATES: LineSide[] = [
  { polarity: Polarity.Positive, moving: 'right' },
  { polarity: Polarity.Positive, moving: 'left' },
  { polarity: Polarity.Negative, moving: 'right' },
  { polarity: Polarity.Negative, moving: 'left' },
];

// Every arrangement of n charges in a row: each of them either polarity, each
// of them going either way. 4ⁿ of them before the symmetries are taken out.
const linesOf = (n: number): LineSide[][] =>
  n === 0
    ? [[]]
    : linesOf(n - 1).flatMap(rest => LINE_STATES.map(side => [side, ...rest]));

// Read back to front with every direction reversed, a line is the same
// experiment watched from the other end.
const mirrored = (line: LineSide[]): LineSide[] =>
  [...line].reverse().map(s => ({
    polarity: s.polarity,
    moving: s.moving === 'left' ? 'right' : 'left',
  }));

const opposite = (p: Polarity): Polarity =>
  p === Polarity.Positive ? Polarity.Negative : Polarity.Positive;

// Every polarity flipped, every direction kept: the anti-line.
const antiLine = (line: LineSide[]): LineSide[] =>
  line.map(s => ({ polarity: opposite(s.polarity), moving: s.moving }));

// Identity up to mirroring: whichever way round the line reads first.
const lineKey = (line: LineSide[]): string => {
  const read = (l: LineSide[]) => l.map(s => `${s.polarity}${s.moving}`).join(",");
  const [x, y] = [read(line), read(mirrored(line))];

  return x < y ? x : y;
};

/**
 * The distinct lines among the given ones, each grouped with its anti-line so
 * the two sit one above the other — the same experiment run on matter and on
 * antimatter. A line that is its own anti up to mirroring is a group of one.
 */
const antiGroups = (lines: LineSide[][]): LineSide[][][] => {
  const byKey = new Map<string, LineSide[]>();
  for (const line of lines) {
    const key = lineKey(line);
    if (!byKey.has(key)) byKey.set(key, line);
  }

  const taken = new Set<string>();
  const groups: LineSide[][][] = [];

  for (const [key, line] of byKey) {
    if (taken.has(key)) continue;
    taken.add(key);

    const group = [line];

    const opposite = lineKey(antiLine(line));
    if (!taken.has(opposite) && byKey.has(opposite)) {
      taken.add(opposite);
      group.push(byKey.get(opposite)!);
    }

    groups.push(group);
  }

  return groups;
};

// Every arrangement of n charges, grouped with its anti.
const lineGroups = (n: number): LineSide[][][] => antiGroups(linesOf(n));

/**
 * One side of a head-on collision: `size` charges all going the same way,
 * their polarity flipping from one to the next. `inner` is the polarity of
 * the one at the interface, and the block alternates outward from there —
 * so what a block is doing at the meeting point is what names it, and the
 * rest of it follows.
 */
const alternatingBlock = (size: number, inner: Polarity, moving: 'left' | 'right'): LineSide[] => {
  const outward = Array.from({ length: size }, (_, i) => ({
    polarity: i % 2 === 0 ? inner : opposite(inner),
    moving,
  }));

  // Written from the interface outward. A block moving right sits to the left
  // of the interface, so it reads the other way round along the line.
  return moving === 'right' ? outward.reverse() : outward;
};

/**
 * Two alternating blocks run at each other. Once the alternation is fixed the
 * only freedom left is the phase of each block — which polarity it presents
 * at the interface — so these four are all of them:
 *
 *   ..0101 → ← 1010..  the alternation carries straight through the meeting
 *                      point; the line is one alternating line, cut in two and
 *                      told to move at itself.
 *   ..1010 → ← 1010..  both blocks in the same phase; the alternation breaks
 *                      exactly where they meet, and the two innermost charges
 *                      are alike rather than opposite.
 *
 * and the anti of each. Head-on opposites annihilate and head-on likes turn
 * around, so the phase decides whether the interface eats the line or reflects
 * it — and after the first tick the block behind is one step further in, with
 * its own phase to present.
 */
const COLLISION_PHASES: [Polarity, Polarity][] = [
  [Polarity.Positive, Polarity.Negative],
  [Polarity.Negative, Polarity.Positive],
  [Polarity.Positive, Polarity.Positive],
  [Polarity.Negative, Polarity.Negative],
];

const collision = (size: number, [left, right]: [Polarity, Polarity]): LineSide[] => [
  ...alternatingBlock(size, left, 'right'),
  ...alternatingBlock(size, right, 'left'),
];

// The distinct collisions of two alternating blocks of `size`, grouped with
// their antis. Mirroring identifies the two through-alternating phases, so
// what is left is: alternation-through, and alternation-broken with its anti.
const collisionGroups = (size: number): LineSide[][][] =>
  antiGroups(COLLISION_PHASES.map(phases => collision(size, phases)));

/**
 * A block with no phase to it: `size` charges all going the same way, each
 * polarity drawn on its own. There is nothing to name such a block by — every
 * draw is a different block — so what it says about an interface is only what
 * survives being watched a few times over.
 */
const randomBlock = (size: number, moving: 'left' | 'right'): LineSide[] =>
  Array.from({ length: size }, () => ({ polarity: Universe.randomPolarity(), moving }));

/**
 * An alternating block driven into an unstructured one. The left side arrives
 * at the interface with a polarity that was decided the moment the block was
 * written; the right side arrives with one that wasn't decided by anything.
 *
 * So the two phases above stop being two experiments: which of them is
 * happening is redrawn at every step, as whatever the other side happens to
 * have put in front. What is left to watch is whether the alternation
 * survives being met by something that isn't one.
 */
const alternatingIntoRandom = (size: number, inner: Polarity): LineSide[] => [
  ...alternatingBlock(size, inner, 'right'),
  ...randomBlock(size, 'left'),
];

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
        <CalculusVisualization
          graph={() => Graph.expandingGrid(3)}
          // repeated
        />

        {/* Two blocks meeting head-on: opposite polarities, then both
            positive, then both negative. */}
        {([
          [Polarity.Positive, Polarity.Negative],
          [Polarity.Positive, Polarity.Positive],
          [Polarity.Negative, Polarity.Negative],
        ] as [Polarity, Polarity][]).map(([left, right], i) => (
          <CalculusVisualization
            key={`blocks-${i}`}
            graph={() => Graph.blocks(left, right)}
            repeated={15}
            height={140}
            density={false}
          />
        ))}

        {/* The same two blocks held apart by a wide field of neutral space,
            neither of them moving, each writing a charge onto the space at
            its face every other tick. Opposite charges annihilate in the
            middle and the field between them is eaten two columns at a time
            until there is none of it left; like charges only bounce off each
            other and come home. */}
        {([
          [Polarity.Positive, Polarity.Negative],
          [Polarity.Positive, Polarity.Positive],
        ] as [Polarity, Polarity][]).map(([left, right], i) => (
          <CalculusVisualization
            key={`emitters-${i}`}
            graph={() => Graph.emitters(left, right)}
            repeated={18}
            height={140}
          />
        ))}

        {/* The same two blocks with the magnets turned on: each side flips
            what it is emitting every tick, and emits on every one of them, so
            the field fills with alternating charge rather than with one thing
            over and over. Spinning is what makes it unconditional — held
            still, two blocks emitting alike only push each other away; turned
            over fast enough, both ways round end up eating the field between
            them, the second one in bursts rather than steadily. */}
        {([
          [Polarity.Positive, Polarity.Negative],
          [Polarity.Positive, Polarity.Positive],
        ] as [Polarity, Polarity][]).map(([left, right], i) => (
          <CalculusVisualization
            key={`spinning-${i}`}
            graph={() => Graph.emitters(left, right, { gap: 20, every: 1, spin: true })}
            repeated={22}
            height={140}
          />
        ))}

        {ANTI_GROUPS.map((group, i) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            {group.map((pair, j) => (
              <CalculusVisualization
                key={j}
                graph={() => Graph.pair(pair.a, pair.b)}
                repeated={1}
                filmstrip
                height={60}
                density={false}
              />
            ))}
          </div>
        ))}

        {/* The same thing with an inside to it: every arrangement of three,
            then of four, charges in a line. Each runs for as many steps as
            there are charges, since that is roughly how long it takes for
            what happens at one end to be felt at the other. */}
        {[3, 4].map(n => (
          <Fragment key={`line-${n}`}>
            {lineGroups(n).map((group, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                {group.map((line, j) => (
                  <CalculusVisualization
                    key={j}
                    graph={() => Graph.line(line)}
                    repeated={n}
                    filmstrip
                    height={60}
                    density={false}
                  />
                ))}
              </div>
            ))}
          </Fragment>
        ))}

        {/* Not every arrangement now, but the one arrangement with a pattern
            to it: alternating polarities driven head-on into alternating
            polarities. Blocks of two, three and four a side, each run for as
            many steps as the whole line is long. */}
        {[2, 3, 4].map(size => (
          <Fragment key={`collision-${size}`}>
            {collisionGroups(size).map((group, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                {group.map((line, j) => (
                  <CalculusVisualization
                    key={j}
                    graph={() => Graph.line(line)}
                    repeated={size * 2}
                    height={60}
                    density={false}
                  />
                ))}
              </div>
            ))}
          </Fragment>
        ))}

        {/* And the same collision with the structure taken out of one side:
            alternating into randomly assigned. There is no permutation to
            enumerate here — a draw is not a case — so it is a handful of runs,
            the alternating side starting from either polarity in turn. */}
        {[3, 4].map(size => (
          <Fragment key={`mixed-${size}`}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <CalculusVisualization
                  graph={() => Graph.line(
                    alternatingIntoRandom(size, i % 2 === 0 ? Polarity.Positive : Polarity.Negative)
                  )}
                  repeated={size * 2}
                  height={60}
                  density={false}
                />
              </div>
            ))}
          </Fragment>
        ))}

      </Section>
    </Arc>
  </Post>;
}

export default RayCalculiAndPhysics;