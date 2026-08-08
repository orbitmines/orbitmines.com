/**
 * EQUATIONS IN THIS FILE
 *
 *   S(x)      = Σ_{a<b} cancelling(Fa,Fb)·|Fa·Fb|·closing(d̂a,d̂b)
 *                                                 annihilation, per place
 *   share     = Σ cancelling / Σ meeting          how much of it is opposite
 *   want      = BITE · share                      cells a tick, from the rule
 *
 *   u(x)      = −Σ_k (q/2)·tanh(n̂·e / SPREAD)·exp(−(e×n̂ / LOCAL)²)·n̂
 *                                                 the flow of space, |u| ≤ LIGHT
 *   ḧ         = c²∇²h + (u − ḣ)·pull              carried, at the speed of light
 *   river     = |ḣ|² / 2                          and half its square is
 *   fall      = −∇ river                          ... the free-fall acceleration
 *
 *   wake(s)   = Σ± pace·ê / (2πr²)                what movement puts back
 *   v̇         = fall − (fall·ĥ)ĥ                   turned only, never sped up
 *
 */

import { CanvasView, Surface } from "./canvas";
import {
  Emitter, emit, fieldAt, Live, retard, TRAIL, was, wasGoing,
  CARRY, RETARD, WAY,
} from "./field";
import { CYCLE } from "./lattice";
import { BITE, cancelling, closing, LIGHT } from "./physics";
import { AMBER, BACKGROUND, CYAN, ground, lift, source } from "./paint";

/**
 * Gravity as a flow: space is given a speed, and everything is carried by it.
 *
 * This is the older of the two accounts in this article and the more
 * elaborate. It measures where annihilation is happening, turns that into a
 * velocity field for the space itself, gives that field a wave equation so it
 * travels at the speed of light, and then carries each source by the flow it
 * is standing in and turns it by how steeply that flow falls away.
 *
 * `metric.tsx` is the other account, and it says the same thing far more
 * directly — that annihilation does not push anything, it removes the space,
 * and everything else is what is left of the geometry. Both are drawn from
 * the same field (`field.ts`), so what they disagree about is only what
 * annihilation DOES, which is the thing worth seeing two ways.
 */

/**
 * Where space is being destroyed, asked of places rather than of pairs.
 *
 * This is the piece that adding cosines does not give you, and without it the
 * continuous version is not the same physics — it is the same picture with
 * the gravity left out. Two opposite charges meeting in the model do not
 * average to nothing and stay where they are. They ANNIHILATE, and
 * annihilating takes the point each of them was on out of the world, which
 * leaves whatever was on either side of them nearer together. That is the
 * whole of why two magnets attract here: not a force between them, an ongoing
 * loss of the space in between.
 *
 * The first version of this asked the question of a PAIR — walk the line
 * joining two named sources, see how much of what meets there is opposite.
 * It gives the right rate and it is the wrong question, because it is not a
 * question about anywhere. It needs to know which sources exist and which two
 * of them are being considered, and it produces one number for the pair
 * rather than a fact about each place. Nothing built on it can deflect a
 * third thing, because a third thing is not in the sum.
 *
 * Asked of a place, it is local, and everything it needs is at that place.
 * How much of each charge is here; which way each of them is travelling; and
 * therefore how much of what is here is meeting head-on rather than crossing.
 * Two things annihilate when they are opposite in charge AND opposed in
 * direction — one without the other is a crossing, not a collision — so both
 * factors are in it, and both are readable on the spot.
 *
 * What comes out is the field this model puts where mass usually goes:
 * annihilation per unit of space per tick. It is not a property anything has.
 * It is something that happens somewhere.
 */
const SITES: number[] = [];                       // x, y, eaten, nx, ny, met — six at a time
let siteCount = 0;

/*
 * How much space a tick's worth of meeting destroys is `BITE`, and it is the
 * one number tying this rate to the lattice's — stated with the other laws
 * rather than here, because it is not a fact about the survey.
 *
 * A source emits a shell every tick and shells travel a cell a tick, so along
 * any line between two of them one shell meets one shell every tick, and a
 * meeting of opposites takes two cells out of the world. That is a COUNT —
 * one meeting, two cells — with nothing in it about how large the region is
 * where the meeting happens.
 *
 * Which is the thing the survey below cannot supply and must not be asked to.
 * It measures a density, and a density integrated over an area gives a number
 * that grows with the area: two sources far apart overlap over more of the
 * picture than two close together, and reading their annihilation off that
 * integral has them eating faster the further apart they are, which is not
 * merely wrong but backwards. Everything the survey knows is WHERE the eating
 * is happening and along what. How MUCH is set by the cadence, and shared out
 * over the places in proportion to what is going on at each.
 */

/**
 * And how far the loss of a point is felt, which is not far.
 *
 * A collision removes the two points its charges were on and joins what was
 * behind each directly to the other. That shortens the LINE they were on and
 * does nothing whatever to a point off to the side, which is joined to the
 * world by paths that never went through the collision. So the influence of
 * an annihilation is confined to a neighbourhood of it, and this is the size
 * of that neighbourhood.
 *
 * Which is a real claim and an unusual one. Gravity here is not long-range,
 * and it is not something a mass has and radiates. It acts along the lines
 * where annihilation is actually happening, which is to say between things
 * that are cancelling each other's emissions. A body that emits nothing feels
 * nothing, however much is going on beside it.
 *
 * But it must not be smaller than the grid the annihilation was surveyed on,
 * and that is what it was. A few cells, against sites laid out one every few
 * cells, gives a field that is a row of separate little pushes with nothing
 * between them: a body sitting on the axis is either on top of one, where the
 * transverse falloff is flat because it is at the peak of it, or between two,
 * where there is nothing at all. Either way it feels no gradient, and a body
 * that feels no gradient is never turned — which was the whole complaint. The
 * loss has to be smeared over at least the spacing of the places it was
 * measured at, or what is being drawn is the grid rather than the field.
 */
let LOCAL = 3;                                    // cells, set by the survey

// How far apart the closest pair are, which is the distance the pull has to
// work over. Also set by the survey.
let SPREAD = 1;

/**
 * Survey the framed region for it, once a tick.
 *
 * A coarse grid is enough: what is being looked for is where the annihilation
 * is, and it is spread over the overlap of two fields rather than
 * concentrated at points. Everything below a fraction of the strongest is
 * dropped, because most of any of these pictures is space where nothing is
 * meeting anything and summing a few hundred nothings into every query is the
 * whole cost of this.
 */
const survey = (live: Live[], t: number, reach: number, span: number) => {
  const STEPS = 22;

  siteCount = 0;
  SITES.length = 0;

  if (live.length < 2) return;

  // Centred on the sources, since that is where anything is.
  let mx = 0, my = 0;
  for (const s of live) { mx += s.at[0] / live.length; my += s.at[1] / live.length; }

  /**
   * And it looks at the pair, not at the picture.
   *
   * The grid was laid across the whole view, so its cells are a couple of
   * cells of world across — which is fine while the two are far apart and
   * useless the moment they are not. A pair three cells apart has the whole
   * of its encounter inside ONE cell of that grid: the survey finds a site or
   * two in roughly the right place, or none at all, and the pull collapses
   * exactly as the two are closing on each other. They drifted together,
   * slowed for no reason in the model, and stopped short.
   *
   * Framed on the pair instead, the resolution follows them down. What is
   * being measured is where annihilation is happening, and that is between
   * them, wherever they have got to and however little room it now takes.
   */
  let nearest = Infinity;

  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++)
      nearest = Math.min(nearest, Math.hypot(
        live[j].at[0] - live[i].at[0], live[j].at[1] - live[i].at[1],
      ));

  const look = Math.min(span, Math.max(isFinite(nearest) ? nearest * 1.6 : span, 5));
  const step = (2 * look) / STEPS;

  // Wide enough that the sites blend into a field rather than staying a row
  // of separate pushes, which is what gives it a gradient to turn anything
  // with. See `LOCAL`.
  LOCAL = Math.max(step * 2, 1.5);
  SPREAD = Math.max(isFinite(nearest) ? nearest / 4 : step, 0.75);

  const val: number[] = [];
  const dirX: number[] = [];
  const dirY: number[] = [];

  let strongest = 0;

  // What the picture is doing as a whole: how much of what meets is opposite,
  // and how much meets at all. Their ratio is the only thing about magnitude
  // the survey has any business reporting.
  let cancelled = 0, meeting = 0;

  for (let gy = 0; gy < STEPS; gy++) {
    const y = my - look + (gy + 0.5) * step;

    for (let gx = 0; gx < STEPS; gx++) {
      const x = mx - look + (gx + 0.5) * step;

      for (let i = 0; i < live.length; i++) {
        val[i] = emit(live[i], live[i], x, y, t, reach);
        dirX[i] = WAY[0]; dirY[i] = WAY[1];
      }

      // What is annihilating here, and what is meeting here at all — which
      // is more, because alike charges meeting head-on turn around rather
      // than cancelling, and either way they stop going forwards.
      let eaten = 0, here = 0, nx = 0, ny = 0;

      for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
          // How much of what is here is one field against the other at all,
          // whichever way round — the denominator of the share. Two things
          // annihilate when they are opposite in charge AND opposed in
          // direction, and one without the other is a crossing rather than a
          // collision, so both factors have to be in it.
          const closes = closing(
            [dirX[i], dirY[i]], [dirX[j], dirY[j]],
          );
          if (closes <= 0) continue;              // crossing, not meeting

          const strength = Math.abs(val[i] * val[j]) * closes;

          here += strength;
          meeting += strength;

          // And opposite in charge as well: annihilation rather than a
          // bounce. The same law the lattice reads at ±1 to get
          // 'annihilate' — see `cancelling`.
          const against = cancelling(val[i], val[j]) * strength;
          if (against <= 0) continue;

          eaten += against;

          // The line they are meeting along, which is the line that shortens.
          nx += (dirX[i] - dirX[j]) * against;
          ny += (dirY[i] - dirY[j]) * against;
        }
      }

      if (here <= 0) continue;

      cancelled += eaten;

      const len = Math.hypot(nx, ny) || 1;

      SITES.push(x, y, eaten, nx / len, ny / len, here);
      siteCount++;

      if (here > strongest) strongest = here;
    }
  }

  // Note there is no global reading of how much bounces and how much
  // annihilates. That question is settled at each meeting by what the two
  // charges there are, in `bounced` above — a share taken over the whole
  // picture is an average of a decision, and an average of a decision is not
  // a thing anything experiences.

  if (!strongest) { SITES.length = 0; siteCount = 0; return; }

  // Thinned to what is worth summing over, and the total kept with it so that
  // what is dropped is not quietly handed to what is not.
  const floor = strongest * 0.05;
  let kept = 0, total = 0;

  let seen = 0;

  for (let k = 0; k < siteCount; k++) {
    if (SITES[k * 6 + 5] < floor) continue;

    for (let c = 0; c < 6; c++) SITES[kept * 6 + c] = SITES[k * 6 + c];

    total += SITES[kept * 6 + 2];
    seen += SITES[kept * 6 + 5];
    kept++;
  }

  SITES.length = kept * 6;
  siteCount = kept;

  // The meeting is kept as it was measured — a density, per unit of space,
  // per tick. Normalising it to a share of the whole encounter, which is what
  // it used to do, is what made the shadow useless: a wave crossing the gap
  // met "a fifth of the total" however thick the thing it was crossing, so
  // the attenuation stopped depending on how much was actually in the way.
  // What a wave loses is a density times a path, and both of those have to
  // survive to the place that multiplies them.

  /**
   * Rebuilt whatever else is true of this tick, and before anything can
   * return early.
   *
   * A shadow is a fact about where the sources are NOW. Left over from the
   * tick before while they have moved on — which is what happened whenever a
   * pair was bouncing without annihilating, since there was nothing to scale
   * and the function gave up before reaching this — it darkens places nothing
   * is crossing any more, and the picture fills with patches of black that
   * belong to a configuration that has gone.
   */

  if (!kept || total <= 0) return;

  /**
   * And the whole of it scaled to what a tick's meeting actually costs.
   *
   * The share is how much of the encounter annihilates rather than bounces,
   * which is between nought and one and says nothing about how big the
   * encounter is. Multiplied by `BITE`, that is the space a tick destroys.
   * Divided out over the sites in proportion to what each is doing, the
   * distribution stays exactly what was measured and the total stops being an
   * accident of how much of the picture the two fields happen to overlap in.
   */
  const share = meeting > 1e-12 ? cancelled / meeting : 0;

  /**
   * And the size of it is fixed by what the pair actually do to each other,
   * not by what the sites happen to add up to.
   *
   * A meeting costs two cells: the charge arriving is on a point, the charge
   * it meets is on the next one, and annihilating is both of them ceasing to
   * be anywhere. One meeting a tick, so two cells a tick, times the share of
   * the encounter that is opposite rather than alike. That is the whole rate
   * and it is a count — it does not know or care how the annihilation is
   * spread about.
   *
   * Scaling the SITES to sum to it is not the same thing and was the error.
   * What a source is moved by is not the sum of the sites, it is the flow it
   * stands in — the sum after each site's reach has fallen away across the
   * distance and off to the side. Most of it never arrives. So the sites
   * summed to two cells a tick and the pair closed at a fifth of one, and
   * every picture of two things attracting was running at a fraction of the
   * rate the rule gives, with the fraction set by how the survey's kernels
   * happened to overlap.
   *
   * Measured at the sources instead: lay the sites down at whatever relative
   * strengths they were found with, ask how fast the gap between the pair is
   * closing under that, and scale the lot until the answer is two cells a
   * tick. Then the shape is the survey's and the size is the rule's, which is
   * the right division of labour between the two.
   */
  for (let k = 0; k < kept; k++) SITES[k * 6 + 2] /= total;

  let closes = 0;

  for (let i = 0; i < live.length; i++) {
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i], b = live[j];

      let ux = b.at[0] - a.at[0], uy = b.at[1] - a.at[1];
      const apart = Math.hypot(ux, uy);
      if (apart < 1e-6) continue;

      ux /= apart; uy /= apart;

      flowAt(a.at[0], a.at[1]);
      const ain = FLOW[0] * ux + FLOW[1] * uy;

      flowAt(b.at[0], b.at[1]);
      const bin = -(FLOW[0] * ux + FLOW[1] * uy);

      closes += ain + bin;
    }
  }

  if (closes <= 1e-9) return;

  const want = BITE * share;

  for (let k = 0; k < kept; k++) SITES[k * 6 + 2] *= want / closes;
};

// The optical-depth shadow that used to live here is gone. A wave is not
// thinned by what it passes through — it stops dead at the first thing it
// meets, which is `meets` above — so there was nothing left for it to say,
// and it was still being rebuilt over the whole grid every tick.

/**
 * The flow of space, which is where gravity actually is.
 *
 * Each place that is destroying space draws what is around it inwards along
 * the line the collision there is happening on: everything on one side comes
 * one way, everything on the other side comes the other, and a point off to
 * the side barely moves at all. Summed over everywhere that is doing it, that
 * is the whole field, and nothing in the sum knows about sources or pairs —
 * only about places and what is happening at them.
 *
 * And there is the deflection, for free and without a force anywhere. The
 * flow has a gradient, so it does not merely carry a body — it turns it. A
 * velocity is a displacement per tick, and a displacement in a space that is
 * being sheared comes out pointing somewhere else. Nothing accelerates: the
 * body's own motion is untouched and its speed never changes. It is carried,
 * and what carries it is not uniform.
 */
/**
 * The space itself, kept between ticks, and how fast it is going.
 *
 * Everything before this treated gravity as a speed: work out where
 * annihilation is happening, work out how fast that drags each source, move
 * it that far, throw the answer away and do it again next tick. Which cannot
 * be right, and the discrete rule says why. `annihilate` does not push
 * anything. It rewires — the point behind one dying charge is spliced
 * directly onto the point behind the other — and it STAYS rewired. The state
 * is in the space, not in the bodies, and a speed recomputed from scratch
 * every tick is precisely a model with no state in the space at all.
 *
 * So the space gets a displacement of its own, `h`, which is how far each
 * place has been carried from where it started, and it is kept. Annihilation
 * adds to it and nothing takes it away: once the ground between two things
 * has gone, it has gone, and they are nearer whether or not anything is still
 * eating.
 *
 * And `h` is given a wave equation rather than being applied where it is
 * made. A contraction here has to reach a place over there, and it has to
 * take the time light takes — so the field obeys
 *
 *     d²h/dt² = c² ∇²h + S
 *
 * with S the annihilation. Ripples in `h` then travel outward at exactly c,
 * which is what a gravitational wave is: not a thing added to the model, but
 * what persistence and a finite speed give you together the moment you stop
 * applying the answer instantly and everywhere. Neither alone produces one.
 *
 * A grid fixed for the whole run, unlike the survey's, which re-frames on the
 * pair every tick. A field that is carried from one tick to the next cannot
 * be resampled onto a moving grid without smearing everything it remembers.
 */
type Warp = {
  hx: Float32Array; hy: Float32Array;             // where each place has got to
  vx: Float32Array; vy: Float32Array;             // and how fast it is going
  sx: Float32Array; sy: Float32Array;             // what is driving it this tick
  n: number; x0: number; y0: number; step: number;
};

const warp = (span: number): Warp => {
  // Forty across is enough to carry a wave and cheap enough to ask the
  // calibrated flow at every one of its places, once a tick.
  const n = 40;
  const step = (2 * span) / n;

  return {
    hx: new Float32Array(n * n), hy: new Float32Array(n * n),
    vx: new Float32Array(n * n), vy: new Float32Array(n * n),
    sx: new Float32Array(n * n), sy: new Float32Array(n * n),
    n, x0: -span, y0: -span, step,
  };
};

// Read between the grid's places, since it is asked at arbitrary points.
const WARP: [number, number] = [0, 0];

const warpAt = (w: Warp, a: Float32Array, b: Float32Array, x: number, y: number) => {
  const fx = Math.min(Math.max((x - w.x0) / w.step, 0), w.n - 1.001);
  const fy = Math.min(Math.max((y - w.y0) / w.step, 0), w.n - 1.001);

  const i = Math.floor(fx), j = Math.floor(fy);
  const u = fx - i, v = fy - j;

  const k = j * w.n + i;

  WARP[0] = (a[k] * (1 - u) + a[k + 1] * u) * (1 - v)
    + (a[k + w.n] * (1 - u) + a[k + w.n + 1] * u) * v;
  WARP[1] = (b[k] * (1 - u) + b[k + 1] * u) * (1 - v)
    + (b[k + w.n] * (1 - u) + b[k + w.n + 1] * u) * v;
};

/**
 * One step of it.
 *
 * The annihilation found this tick is laid down as the source term — the same
 * shape `flowAt` used to hand straight to the sources, put into the field
 * instead — and then the field is left to carry it. The Laplacian is the
 * plain five-point one, which is all a wave equation on a grid needs, and the
 * time step is a fraction of a cell against a speed of one, so it is nowhere
 * near the limit where that would misbehave.
 *
 * A little damping, because nothing here should ring for ever: an annihilation
 * that has finished leaves its displacement behind, which is the point, but
 * the SPEED it left the space with has to die away or the picture keeps
 * sloshing long after anything is happening.
 */
const warpStep = (w: Warp, dt: number) => {
  const { hx, hy, vx, vy, sx, sy, n, step } = w;

  /**
   * What the space would be doing here if the annihilation acted at once,
   * which is what the survey has already been calibrated to give.
   *
   * Used as the speed the field is DRAWN TOWARDS rather than as a force added
   * to it — which keeps the one number that ties this to the discrete rule.
   * `survey` scales the sites so that a pair whose every meeting cancels
   * would close at two cells a tick, and if that were integrated as an
   * acceleration the speed would simply grow past it and the calibration
   * would mean nothing. Relaxed towards, the near field settles at exactly
   * the rate the rule gives, and everything the wave equation adds is what
   * happens on the way there and further out.
   */
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const k = j * n + i;

      flowAt(w.x0 + i * step, w.y0 + j * step);

      sx[k] = FLOW[0]; sy[k] = FLOW[1];
    }
  }

  // A step of the wave equation: the Laplacian carries it, at exactly the
  // speed of light in the units everything else here is in.
  const c2 = LIGHT * LIGHT / (step * step);
  const pull = 2.5;

  for (let j = 1; j < n - 1; j++) {
    for (let i = 1; i < n - 1; i++) {
      const k = j * n + i;

      const lx = hx[k - 1] + hx[k + 1] + hx[k - n] + hx[k + n] - 4 * hx[k];
      const ly = hy[k - 1] + hy[k + 1] + hy[k - n] + hy[k + n] - 4 * hy[k];

      vx[k] += (c2 * lx + (sx[k] - vx[k]) * pull) * dt;
      vy[k] += (c2 * ly + (sy[k] - vy[k]) * pull) * dt;
    }
  }

  // And the displacement keeps what the speed has given it. Nothing takes it
  // back: once the ground has gone it has gone.
  for (let k = 0; k < hx.length; k++) { hx[k] += vx[k] * dt; hy[k] += vy[k] * dt; }
};

/**
 * How steeply the ground falls away here.
 *
 * The flow has exactly one scalar in it — how fast the space is going — and
 * the slope of half its square is where everything else comes from. That is
 * not a choice: a flow which is the gradient of something obeys
 * `(u . grad) u = grad(|u|^2 / 2)`, and `(u . grad) u` is what a thing sitting
 * still in the coordinates is carried by as the flow it is standing in
 * accelerates. So the slope of `|u|^2 / 2` IS the free-fall acceleration, and
 * it is the same quantity Newton called the gradient of a potential — a river
 * running in at `sqrt(2M/r)` has half its square equal to `M/r` exactly.
 *
 * Which means nothing here is imported. The rule is still that annihilation
 * takes two cells out of the space between whatever is annihilating. The flow
 * is what that does to the space. And a falloff nobody put in — the whole
 * inverse-square of it — is sitting in that flow already, waiting to be
 * differentiated.
 *
 * Read over three quarters of a cell either side, which is wide enough to see
 * past the survey's own grid and narrow enough to still be local.
 */
const NUDGE = 0.75;

const river = (w: Warp, x: number, y: number) => {
  warpAt(w, w.vx, w.vy, x, y);

  return (WARP[0] * WARP[0] + WARP[1] * WARP[1]) / 2;
};

const FALL: [number, number] = [0, 0];

const fallAt = (w: Warp, x: number, y: number) => {
  FALL[0] = -(river(w, x + NUDGE, y) - river(w, x - NUDGE, y)) / (2 * NUDGE);
  FALL[1] = -(river(w, x, y + NUDGE) - river(w, x, y - NUDGE)) / (2 * NUDGE);
};

/**
 * What movement itself does to the space it is moving through.
 *
 * `consumeAhead` is a SWAP: the ray takes the point in front of it and that
 * point ends up behind. So anything going anywhere is laying space down
 * behind itself at exactly the rate it takes it up in front, one cell for
 * every cell it goes — and the space it crosses is not merely crossed, it is
 * carried from one end of the thing to the other.
 *
 * Which is the other half of what happens between two sources. The
 * annihilation between them takes space OUT and draws them together. The
 * motion of each puts space BACK, behind it, and pushes them apart. Where
 * those balance is where a pair neither closes nor escapes.
 *
 * Two things about how this is written, and both were got wrong first.
 *
 * It is never its own. A thing does not feel its own wake: the taking in
 * front and the laying behind are not two forces on it that happen to cancel
 * — they are what its moving IS, and `vel` already counts them. Put on the
 * grid with everything else, where there is no way to ask whose wake a place
 * is in, each source read its own and got a shove forward of about two thirds
 * of its own pace on top of its own pace, every tick, compounding through the
 * field. That is a rocket, and it showed as sources tearing away in the
 * direction they were already going.
 *
 * And it is retarded, off the same trail `emit` uses. A wake is news, and
 * news travels at one cell a tick like everything else here.
 */
const WAKE: [number, number] = [0, 0];

// How far in front the taking happens and how far behind the laying: one
// point either side, in a lattice whose points are one apart.
const SWAP = 0.5;

const wakeAt = (s: Live, x: number, y: number, t: number) => {
  WAKE[0] = 0; WAKE[1] = 0;

  const when = retard(s, x, y, t);
  if (!isFinite(when)) return;

  wasGoing(s, when);

  const px = RETARD[0], py = RETARD[1];
  const pace = Math.hypot(CARRY[0], CARRY[1]);
  if (pace < 1e-9) return;

  const ax = CARRY[0] / pace, ay = CARRY[1] / pace;

  // A point of space being made pushes what is around it away; a point being
  // taken up draws it in. Movement is one of each, half a cell apart, and far
  // off the two very nearly cancel — which is exactly right, and is why a
  // swap is not a source of anything. Near to, they do not.
  for (let k = 0; k < 2; k++) {
    const side = k ? -SWAP : SWAP;
    const sign = k ? 1 : -1;

    const ex = x - (px + ax * side), ey = y - (py + ay * side);

    const r = Math.hypot(ex, ey);
    if (r < SWAP) continue;

    WAKE[0] += sign * pace * ex / (r * 2 * Math.PI * r);
    WAKE[1] += sign * pace * ey / (r * 2 * Math.PI * r);
  }
};

const FLOW: [number, number] = [0, 0];

const flowAt = (x: number, y: number) => {
  FLOW[0] = 0; FLOW[1] = 0;

  for (let k = 0; k < siteCount; k++) {
    const sx = SITES[k * 6], sy = SITES[k * 6 + 1];
    const q = SITES[k * 6 + 2];
    const nx = SITES[k * 6 + 3], ny = SITES[k * 6 + 4];

    const ex = x - sx, ey = y - sy;

    const on = ex * nx + ey * ny;
    const off = ex * -ny + ey * nx;

    /**
     * Everything on one side comes one way and everything on the other comes
     * the other, so the line through it is shorter by `q` and the place
     * itself does not move.
     *
     * Saturating over the distance the pair are apart, not over the size of
     * the picture. Tied to the picture, the pull quietly gave out exactly
     * when it should have been strongest: a pair a few cells apart has every
     * site a few cells from each of them, and `tanh` of a few cells over a
     * width set by the whole view is almost nothing — so they drifted
     * together, slowed, and stopped short of touching for no reason in the
     * model at all.
     */
    const side = Math.tanh(on / SPREAD);
    const fade = Math.exp(-((off / LOCAL) ** 2));

    FLOW[0] -= (q / 2) * side * fade * nx;
    FLOW[1] -= (q / 2) * side * fade * ny;
  }

  /**
   * And no place of space goes faster than light, whatever the sites add up
   * to.
   *
   * Not a safety rail — it is the same rule everything else here obeys, and
   * without it the calibration in `survey` has a hole in it. That divides by
   * how fast the sites it found happen to close the pair, and when the two
   * are nearly touching, or arranged so that what is being eaten is mostly
   * off to the side of the line between them, the measured closing goes to
   * almost nothing while the rate the rule asks for does not. The quotient
   * runs away. Measured on the fly-by that pulses every fifth tick, the flow
   * carrying a source reached three hundred and fifty thousand cells a tick
   * and the pair were flung four hundred cells apart in forty.
   *
   * Held to light, the same arrangement simply closes as fast as anything can
   * close and no faster. The pair still meet, the gap still goes at two cells
   * a tick between them, and the number that used to be unbounded is now the
   * one bound this whole model has.
   */
  const going = Math.hypot(FLOW[0], FLOW[1]);

  if (going > LIGHT) { FLOW[0] *= LIGHT / going; FLOW[1] *= LIGHT / going; }
};

// A 4x4 ordered pattern, centred on nought and worth about one level of an
// eight-bit channel. See the use below.
const DITHER = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
].map(v => (v / 16) - 0.5);

/**
 * One canvas of it, evaluated rather than simulated.
 *
 * Every sample is independent of every other, so there is no state to carry
 * between frames and nothing to ease: the drawn field IS the field, at
 * whatever real-valued t the clock has reached. Which is the visible payoff
 * of having a function rather than a run — the animation above has to walk
 * towards each tick because the world only exists at whole ones, and this
 * one is simply continuous, so it moves the way a wave moves.
 *
 * Drawn small and stretched. The field has no detail below the scale of its
 * own bands, so sampling it at every pixel is spending several times over
 * for a picture that is smooth by construction; a quarter-scale buffer drawn
 * up with the canvas's own interpolation is the same image for a sixteenth
 * of the arithmetic.
 */
export const ContinuousField = ({
  sources,
  height = 320,
  span = 14,
  rate = 10,
  cycle = 200,
}: {
  sources: Emitter[];

  // How much of the world is on screen, as a radius in cells.
  span?: number;

  // Ticks a second, and it need not be a whole number of anything.
  rate?: number;

  // Ticks before it starts again from the beginning. A pair that closes on
  // each other ends up adjacent and then has nothing left to do — neither is
  // space, so neither can be moved through, and adjacent is as close as
  // adjacent gets. Watching that happen is the point; watching it having
  // happened is not.
  cycle?: number;

  height?: number;
}) => <CanvasView
  height={height}
  deps={[sources, span, rate, cycle]}
  paint={() => {
    // The small buffer the field is evaluated into, before being drawn up to
    // the size of the canvas.
    const buf = document.createElement("canvas");
    const bufCtx = buf.getContext("2d")!;

    let img: ImageData | null = null;

    let t = 0;

    // Where the sources have got to. The ones handed in say where they start,
    // and nothing about where they stay.
    let live: Live[] = [];

    let field = warp(span);

    const reset = () => {
      t = 0;
      field = warp(span);
      live = sources.map(s => ({
        ...s,
        at: [...s.at] as [number, number],
        path: [s.at[0], s.at[1]],
        vel: [s.drift?.[0] ?? 0, s.drift?.[1] ?? 0] as [number, number],
      }));
    };

    // Everywhere each of them has been, kept up to the moment. Filled to the
    // current time rather than appended to once per frame, so the record is
    // evenly spaced whatever the frame rate happens to be doing.
    const remember = () => {
      for (const s of live) {
        for (let k = s.path.length / 2; k <= t / TRAIL; k++) {
          s.path.push(s.at[0], s.at[1]);
        }
      }
    };

    function draw({ ctx, width: w, height: h }: Surface) {

      /**
       * Css pixels to a sample, and it cannot be one number.
       *
       * What has to be resolved is a band, and a band is `CYCLE/2` cells of
       * world however the view is set — so how many pixels it covers depends
       * entirely on how far out the camera is. A single source framed at
       * fourteen cells gives a band forty-odd pixels and four pixels a sample
       * is plenty. The same four pixels against a pair framed at sixty gives a
       * band ten pixels wide and two and a half samples across it, which is
       * under what it takes to see a wave at all: what gets drawn there is not
       * a coarse version of the field, it is the moiré of a grid beating
       * against one, and no amount of smoothing afterwards recovers it.
       *
       * So the sampling follows the bands rather than the screen. Five or so to
       * a band everywhere, which is what the wide views were missing and what
       * the close ones were spending several times over.
       */
      const bandPx = (CYCLE / 2) * (Math.min(w, h) / (2 * Math.max(span, 1)));

      const SAMPLE = Math.max(Math.min(bandPx / 5, 4), 1.4);

      const cols = Math.max(Math.round(w / SAMPLE), 1);
      const rows = Math.max(Math.round(h / SAMPLE), 1);

      if (buf.width !== cols || buf.height !== rows) {
        buf.width = cols; buf.height = rows;
        img = null;
      }

      // Asked for once and written over ever after. At this sampling it is a
      // hundred thousand pixels a frame, and handing that back to be
      // collected sixty times a second is most of what the drawing would
      // otherwise cost.
      if (!img) img = bufCtx.createImageData(cols, rows);

      const px = img.data;

      // Cells to the shorter side of the picture, so the same world is framed
      // whatever shape the canvas is.
      const scale = Math.min(w, h) / (2 * span);
      const reach = span * 0.6;

      for (let y = 0; y < rows; y++) {
        const wy = ((y + 0.5) * (h / rows) - h / 2) / scale;

        for (let x = 0; x < cols; x++) {
          const wx = ((x + 0.5) * (w / cols) - w / 2) / scale;

          const v = Math.max(Math.min(fieldAt(wx, wy, t, live, reach), 1), -1);

          /**
           * Amber one way, cyan the other, and the background where the two
           * meet — so a seam is a dark channel and needs no line drawn on it.
           *
           * Shown at the strength it actually has, which it was not. A gamma
           * of about a half lifts the faint parts of a picture towards the
           * bright ones, and here that is a lie with consequences: a wave
           * thinned to a hundredth of itself by distance and by everything it
           * has crossed was being drawn at a fifth, so the outer half of
           * every picture looked like a place where something was happening.
           * It is not. Gravity here goes as the product of two waves meeting,
           * so it falls away faster than either of them does — and if the
           * waves are drawn brighter than they are, the eye is being told the
           * opposite of the truth about where anything can still act.
           *
           * Straight through, then. What is visible is what is there, and
           * where the picture goes dark is where the two have nothing left to
           * do to each other.
           */
          const k = Math.abs(v);
          const i = (y * cols + x) * 4;

          /**
           * And a little noise added before it is rounded to a byte.
           *
           * The field is smooth and the colours it maps to are eight bits, so
           * a gradient that takes two hundred pixels to go from one shade to
           * the next has a hard edge every two hundred pixels — a set of
           * contour lines nothing asked for, which read as the picture being
           * coarse when what is coarse is only the counting. Half a level of
           * dither, from a fixed pattern rather than from a random number so
           * that a still frame is stable, turns each of those edges into a
           * scatter that averages to the right value and has no edge in it.
           */
          const d = DITHER[(y & 3) * 4 + (x & 3)];

          // The ground, plus however far this place leans towards one charge
          // or the other. At nought it is the ground exactly, which is why a
          // place where the two cancel needs nothing drawn on it to read as
          // empty — and why the tints are the same three numbers the lattice
          // strokes its charges with. See `paint.ts`.
          const tint = v > 0 ? AMBER : CYAN;

          px[i] = BACKGROUND[0] + lift(tint, 0) * k + d;
          px[i + 1] = BACKGROUND[1] + lift(tint, 1) * k + d;
          px[i + 2] = BACKGROUND[2] + lift(tint, 2) * k + d;
          px[i + 3] = 255;
        }
      }

      bufCtx.putImageData(img, 0, 0);

      ground(ctx, w, h);

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(buf, 0, 0, w, h);

      // The sources, drawn exactly as the lattice draws its own.
      for (const s of live)
        source(ctx, w / 2 + s.at[0] * scale, h / 2 + s.at[1] * scale,
          { halo: 14, dot: 2.2 });
    }

    /**
     * And everything is carried by the flow of the space it is in.
     *
     * Three things, in this order, and the order says what the model claims.
     * A source goes on going the way it was going, because nothing here
     * accelerates anything. The space it is in is carried by `flowAt`,
     * wherever annihilation is shortening it. And the source's own direction
     * is turned by how steeply that flow falls away — not by being pushed,
     * but because a straight line through ground that is running downhill
     * across it does not stay straight.
     *
     * The turning is `fallAt`, taken across the direction of travel only, so
     * that a change of direction is all it can ever be. Nothing here changes
     * speed.
     *
     * They stop when they are adjacent, which is not a fudge to keep them
     * apart: a source is not space, so there is nothing left between them to
     * annihilate and nothing either could move through if there were.
     */
    const TOUCH = 1;                              // as close as adjacent gets

    function pull(dt: number) {
      const reach = span * 0.6;

      // Where space is going, worked out once for the whole picture. After
      // this nothing asks about sources again — only about places.
      survey(live, t, reach, span);

      // What the annihilation does to the space, carried forward and let
      // travel. See `warpStep` — this is where gravity now lives.
      warpStep(field, dt);

      /**
       * And what each source is carried by is the SPEED of the space it is
       * standing in, not the annihilation happening elsewhere at this moment.
       *
       * Which is the whole difference. A contraction over there reaches here
       * when the wave carrying it does, and having arrived it leaves this
       * place displaced for good — so a source goes on being where the space
       * put it after the eating has stopped, and feels nothing at all from an
       * annihilation whose news has not yet arrived.
       */
      const carry = live.map(s => {
        warpAt(field, field.vx, field.vy, s.at[0], s.at[1]);

        let cx = WARP[0], cy = WARP[1];

        // And what the others have laid down behind them. Never its own —
        // see `wakeAt`.
        for (const o of live) {
          if (o === s) continue;

          wakeAt(o, s.at[0], s.at[1], t);

          cx += WAKE[0]; cy += WAKE[1];
        }

        return [cx, cy] as [number, number];
      });

      const turned = live.map(s => {
        /**
         * Turned by the slope of the ground, and only across the way it is
         * going.
         *
         * The part of that slope pointing along the direction of travel is
         * dropped before anything is added, which is what keeps this a
         * turning and not a pull. Renormalising afterwards would have hidden
         * the difference and did: what used to be here took the flow's change
         * along the line of travel, which for a river running straight in is
         * a change of length and no change of angle at all, and then handed
         * that length to the renormalisation to be thrown away. Measured, it
         * delivered a hundredth of what an orbit needs and most of that
         * parallel — so a pair sent past each other flew past each other, the
         * line between them swung forty degrees the way any two things
         * passing would, and stopped. Which is exactly the complaint: no
         * orbit, just a flyby with the arithmetic of one.
         *
         * Across the direction of travel there is nothing to throw away.
         * `fallAt` is the free-fall acceleration and a component of it
         * perpendicular to a velocity can only rotate that velocity — so the
         * speed is left exactly alone by construction, and the
         * renormalisation below is now just tidying the second-order error of
         * a finite step rather than doing the work.
         */
        const speed = Math.hypot(s.vel[0], s.vel[1]);
        if (speed < 1e-9) return s.vel;

        fallAt(field, s.at[0], s.at[1]);

        const hx = s.vel[0] / speed, hy = s.vel[1] / speed;
        const along = FALL[0] * hx + FALL[1] * hy;

        const vx = s.vel[0] + (FALL[0] - along * hx) * dt;
        const vy = s.vel[1] + (FALL[1] - along * hy) * dt;

        const now = Math.hypot(vx, vy);
        if (now < 1e-9) return s.vel;

        return [vx * speed / now, vy * speed / now] as [number, number];
      });

      for (let i = 0; i < live.length; i++) {
        const s = live[i];

        s.vel = turned[i];

        s.at[0] += (s.vel[0] + carry[i][0]) * dt;
        s.at[1] += (s.vel[1] + carry[i][1]) * dt;
      }

      // Not through one another: a source is not space.
      for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i], b = live[j];

          const dx = b.at[0] - a.at[0], dy = b.at[1] - a.at[1];
          const gap = Math.hypot(dx, dy);
          if (gap >= TOUCH || gap < 1e-9) continue;

          const back = (TOUCH - gap) / 2;
          const ux = dx / gap, uy = dy / gap;

          a.at[0] -= ux * back; a.at[1] -= uy * back;
          b.at[0] += ux * back; b.at[1] += uy * back;
        }
      }

      /**
       * And the trail is NOT carried with it, which is the whole of what
       * makes any of this local.
       *
       * It was, and the argument for it sounded right: a ring is centred
       * where its source was when it left, that place is in the space too,
       * and if the space is going then so is everywhere in it. What that
       * argument misses is that the trail is not a set of places. It is a
       * RECORD of where something was at a moment, and a record that gets
       * amended is not a record of anything.
       *
       * Amended every frame, every position in it drifts a little further
       * from what was actually the case — so `was` gives a different answer
       * today than it gave yesterday for the same instant, and every wave in
       * the air, however old, quietly re-centres itself on the answer. Rings
       * laid down a hundred ticks ago get up and move because their source
       * has since been pulled somewhere. Nothing that has already happened
       * may depend on anything that happened after it, and this was the last
       * place in the model where it did.
       */
    }

    return {
      start: reset,

      frame: (surface, elapsed) => {
        // Seconds to ticks, which is the only clock this has. There is no
        // state carried between frames beyond it, so `t` may be any real
        // number and the waves travel smoothly rather than a cell at a time.
        const dt = elapsed * rate;

        t += dt;

        if (t >= cycle) reset();
        else pull(dt);

        remember();

        draw(surface);
      },

      // The buffer this holds on to, over and above the canvas the view hands
      // back for it. There is no other state in it besides a clock.
      stop: () => {
        buf.width = 0;
        buf.height = 0;
        img = null;
      },
    };
  }}
/>;
