/**
 * WHAT THE TWO METRICS LOOK LIKE, AND WHERE THEY COME APART.
 *
 * The file says the shadow is 4.6% larger than general relativity's at the same
 * mass. That is a claim about an image, so it is worth making the image — but a
 * black hole on its own is a black disc on nothing, and 4.6% of a black disc is
 * invisible. What makes one legible is a thin accretion disc seen nearly edge
 * on, whose far side is bent up over the top and down under the bottom, and
 * whose inner edge sits just outside the photon ring. That arch is the ruler.
 *
 * The disc is BANDED rather than smooth, and deliberately so: a smooth glow
 * hides exactly the structure that lensing does to it, and bands make every
 * image of the disc — the direct one, the one bent over the top, and the
 * higher ones crushed into the ring — countable by eye.
 *
 * AND THE TWO ARE DRAWN IN DIFFERENT COLOURS so they can be laid over each
 * other. `Overlay` traces both into one frame, general relativity in amber and
 * the counted metric in blue: everywhere they agree the two add to near-white,
 * and everywhere they differ a coloured fringe is left behind. The fringe IS
 * the 4.6%, at its true size, with nothing exaggerated.
 *
 * HOW A RAY IS TRACED. Spherical symmetry keeps every ray in the plane through
 * the camera, the ray and the centre, so with u = 1/r
 *
 *     u″ = (B/A)′/(2b²) − u
 *
 * — the second-order form, rather than `(du/dφ)² = (B/A)/b² − u²`, because that
 * one has a square root that vanishes at the turning point and the rays that
 * matter here are exactly the ones grazing it and winding round several times.
 * This form is smooth through the turn and needs no sign flip.
 *
 * AND THE DISC IS FOUND WITHOUT LEAVING THE PLANE. r(φ) does not depend on how
 * the plane is tilted, so it is tabulated once per impact parameter; the tilt
 * only decides WHERE the plane crosses z = 0:
 *
 *     cos φ·e₁z + sin φ·e₂z = 0    ⇒    φ = atan2(−e₁z, e₂z) + kπ
 *
 * so the crossings sit a fixed angle apart, and each k is one more image of the
 * disc.
 */

import { CanvasView, Surface } from "./canvas";

const GM = 1;

type Metric = {
  name: string;
  BA: (u: number) => number;          // B/A, all a null geodesic needs
  dBA: (u: number) => number;         // and its derivative
  crit: number;                       // critical impact parameter, GM/c²
  ink: [number, number, number];      // the colour it is drawn in
  css: string;
};

/** General relativity, isotropic, so both are read in the same coordinates. */
export const EINSTEIN: Metric = {
  name: "general relativity",
  BA: (u) => {
    const s = GM * u / 2;
    return Math.pow(1 + s, 6) / Math.pow(1 - s, 2);
  },
  dBA: (u) => {
    const s = GM * u / 2;
    return (GM / 2) * (6 * Math.pow(1 + s, 5) / Math.pow(1 - s, 2)
      + 2 * Math.pow(1 + s, 6) / Math.pow(1 - s, 3));
  },
  crit: 3 * Math.sqrt(3),
  ink: [235, 150, 74],
  css: "#eb964a",
};

/** And the compounded count — A = e^−2u, B = e^+2u, so B/A = e^4u. */
export const COUNTED: Metric = {
  name: "the compounded count",
  BA: (u) => Math.exp(4 * GM * u),
  dBA: (u) => 4 * GM * Math.exp(4 * GM * u),
  crit: 2 * Math.E,
  ink: [74, 168, 235],
  css: "#4aa8eb",
};

/**
 * AND THE BOOSTED ONE — route two, where matter in a folded place emits more,
 * so `u = u₀/(1 − κu₀)` diverges and there is a genuine horizon.
 *
 * The boost has to be GATED: κ linear in u puts β at nought and the perihelion
 * advance 33% high, so it can only wake up below some depth u*. And that gate
 * turns out to decide whether any of this is visible at all —
 *
 *     gate u*   r of the gate   b_crit    vs GR    vs route one
 *     1.00      1.000 GM        5.4366     4.6%     0.0%
 *     0.50      2.000 GM        5.4366     4.6%     0.0%     ← the photon sphere
 *     0.40      2.500 GM        5.5639     7.1%     2.3%
 *     0.20      5.000 GM        7.7602    49.3%    42.7%
 *
 * — because a shadow is set by the PHOTON SPHERE, which sits at u₀ = ½ when the
 * boost is asleep. Gate it any deeper than that and the horizon is hidden
 * inside the ring, where no image can reach it, and route two is pixel for
 * pixel route one. Gate it shallower and the shadow balloons past anything the
 * Event Horizon Telescope allows.
 *
 * So this is drawn only to show what is EXCLUDED. The model's own setting has
 * the gate deep, and looks exactly like `COUNTED`.
 */
export const boosted = (uStar: number): Metric => ({
  name: `boosted, gate at u* = ${uStar}`,
  BA: (U) => {
    const u0 = GM * U;
    return Math.exp(4 * (u0 < uStar ? u0 : u0 / (1 - u0)));
  },
  dBA: (U) => {
    const h = 1e-7;
    const f = (x: number) => {
      const u0 = GM * x;
      return Math.exp(4 * (u0 < uStar ? u0 : u0 / (1 - u0)));
    };
    return (f(U + h) - f(U - h)) / (2 * h);
  },
  crit: NaN,
  ink: [214, 96, 122],
  css: "#d6607a",
});

const STEPS = 2200;                   // φ samples per ray
const DPHI = 0.007;                   // ≈ 4.9 turns: enough for two lensed images
const LANES = 560;                    // impact parameters tabulated
const R_IN = 6.0, R_OUT = 17;         // where the disc is

/** r(φ) for every impact parameter, once. 0 = ran into matter, ∞ = escaped. */
const tabulate = (m: Metric, rObs: number, rHit: number, bMax: number) => {
  const R = new Float32Array(LANES * STEPS);
  const uHit = 1 / rHit, uObs = 1 / rObs;

  for (let lane = 0; lane < LANES; lane++) {
    const b = bMax * (lane + 0.5) / LANES;

    let u = uObs;
    let du = Math.sqrt(Math.max(m.BA(u) / (b * b) - u * u, 0));

    const acc = (uu: number) => m.dBA(uu) / (2 * b * b) - uu;

    for (let i = 0; i < STEPS; i++) {
      const at = lane * STEPS + i;

      if (u >= uHit) { R[at] = 0; continue; }
      if (u <= 0) { R[at] = Infinity; continue; }

      R[at] = 1 / u;

      const h = DPHI;
      const k1u = du, k1d = acc(u);
      const k2u = du + h / 2 * k1d, k2d = acc(u + h / 2 * k1u);
      const k3u = du + h / 2 * k2d, k3d = acc(u + h / 2 * k2u);
      const k4u = du + h * k3d, k4d = acc(u + h * k3u);

      u += h / 6 * (k1u + 2 * k2u + 2 * k3u + k4u);
      du += h / 6 * (k1d + 2 * k2d + 2 * k3d + k4d);
    }
  }
  return R;
};

/**
 * How bright the disc is at a place on it — banded in radius and streaked
 * round, so the lensed copies stay distinguishable from the direct one.
 */
const brightness = (r: number, theta: number) => {
  const t = Math.max(0, Math.min(1, (r - R_IN) / (R_OUT - R_IN)));

  const fall = Math.pow(R_IN / r, 1.9);                  // hotter, denser inside
  const rings = 0.62 + 0.38 * Math.cos(r * 2.9 - 0.6);   // radial banding
  const arms = 0.78 + 0.22 * Math.cos(3 * theta + r * 0.55);
  const edge = Math.min(1, (1 - t) * 6);                 // fade out at the rim

  return Math.max(0, fall * rings * arms * edge);
};

/** The camera basis: out along x, lifted above the disc, looking at the middle. */
const eye = (tilt: number) => {
  const P: [number, number, number] = [Math.cos(tilt), 0, Math.sin(tilt)];
  const fwd: [number, number, number] = [-P[0], -P[1], -P[2]];

  const dz = fwd[2];
  const raw = [-dz * fwd[0], -dz * fwd[1], 1 - dz * fwd[2]];
  const n = Math.hypot(...raw);
  const up = raw.map(v => v / n) as [number, number, number];

  const right: [number, number, number] = [
    fwd[1] * up[2] - fwd[2] * up[1],
    fwd[2] * up[0] - fwd[0] * up[2],
    fwd[0] * up[1] - fwd[1] * up[0],
  ];
  return { P, fwd, up, right };
};

type Look = { rObs: number; rHit: number; span: number; tilt: number };

/**
 * What one metric puts at one pixel: how bright, and whether the ray was
 * swallowed. Kept apart from colour so two of them can be added.
 */
const shade = (
  m: Metric, R: Float32Array, bMax: number,
  px: number, py: number, surface: Surface, look: Look,
) => {
  const { width, height } = surface;
  const half = Math.min(width, height) / 2;
  const perPixel = look.span / half;

  const { P, fwd, up, right } = eye(look.tilt);
  const scale = perPixel / look.rObs;

  const sx = (px + 0.5 - width / 2) * scale, sy = -(py + 0.5 - height / 2) * scale;

  let d = [
    fwd[0] + right[0] * sx + up[0] * sy,
    fwd[1] + right[1] * sx + up[1] * sy,
    fwd[2] + right[2] * sx + up[2] * sy,
  ];
  const dn = Math.hypot(...d);
  d = d.map(v => v / dn);

  const cosPsi = d[0] * fwd[0] + d[1] * fwd[1] + d[2] * fwd[2];
  const raw = [d[0] - cosPsi * fwd[0], d[1] - cosPsi * fwd[1], d[2] - cosPsi * fwd[2]];
  const e2n = Math.hypot(...raw);
  const e2 = e2n > 1e-12 ? raw.map(v => v / e2n) : [0, 1, 0];
  const e1 = P;

  const b = look.rObs * Math.min(1, e2n) * Math.sqrt(m.BA(1 / look.rObs));

  const base = Math.min(LANES - 1, Math.floor(b / bMax * LANES)) * STEPS;
  const phi0 = Math.atan2(-e1[2], e2[2]);

  for (let n = -2; n < 8; n++) {
    const phi = phi0 + n * Math.PI;
    if (phi <= 1e-4 || phi >= STEPS * DPHI) continue;

    const idx = phi / DPHI, i0 = Math.floor(idx);
    const a = R[base + i0], c = R[base + Math.min(STEPS - 1, i0 + 1)];
    if (!isFinite(a) || !isFinite(c) || a === 0 || c === 0) continue;

    const r = a + (c - a) * (idx - i0);
    if (r < R_IN || r > R_OUT) continue;

    // where on the disc it landed, so the banding can be read off it
    const cp = Math.cos(phi), sp = Math.sin(phi);
    const theta = Math.atan2(r * (cp * e1[1] + sp * e2[1]), r * (cp * e1[0] + sp * e2[0]));

    // the images bent further round are dimmer, which is what separates them
    const fade = 1 / (1 + 0.8 * Math.max(0, phi / Math.PI - 1));

    return { lit: brightness(r, theta) * fade, swallowed: false };
  }

  for (let i = 0; i < STEPS; i++) {
    const v = R[base + i];
    if (v === 0) return { lit: 0, swallowed: true };
    if (!isFinite(v)) break;
  }
  return { lit: 0, swallowed: false };
};

const GROUND = 5;                      // the ground both are drawn on

/** One metric, in its own colour. */
const one = (m: Metric, surface: Surface, look: Look) => {
  const { ctx, width, height } = surface;
  const img = ctx.createImageData(width, height);

  const bMax = look.span * Math.SQRT2 * (width / Math.min(width, height)) + 1;
  const R = tabulate(m, look.rObs, look.rHit, bMax);

  for (let py = 0; py < height; py++)
    for (let px = 0; px < width; px++) {
      const { lit } = shade(m, R, bMax, px, py, surface, look);
      const k = (py * width + px) * 4;

      img.data[k] = GROUND + m.ink[0] * lit;
      img.data[k + 1] = GROUND + m.ink[1] * lit;
      img.data[k + 2] = GROUND + 3 + m.ink[2] * lit;
      img.data[k + 3] = 255;
    }

  ctx.putImageData(img, 0, 0);
};

/** Both, added — agreement goes white, difference stays coloured. */
const both = (surface: Surface, look: Look) => {
  const { ctx, width, height } = surface;
  const img = ctx.createImageData(width, height);

  const bMax = look.span * Math.SQRT2 * (width / Math.min(width, height)) + 1;
  const RA = tabulate(EINSTEIN, look.rObs, look.rHit, bMax);
  const RB = tabulate(COUNTED, look.rObs, look.rHit, bMax);

  for (let py = 0; py < height; py++)
    for (let px = 0; px < width; px++) {
      const a = shade(EINSTEIN, RA, bMax, px, py, surface, look);
      const b = shade(COUNTED, RB, bMax, px, py, surface, look);
      const k = (py * width + px) * 4;

      img.data[k] = GROUND + EINSTEIN.ink[0] * a.lit + COUNTED.ink[0] * b.lit;
      img.data[k + 1] = GROUND + EINSTEIN.ink[1] * a.lit + COUNTED.ink[1] * b.lit;
      img.data[k + 2] = GROUND + 3 + EINSTEIN.ink[2] * a.lit + COUNTED.ink[2] * b.lit;
      img.data[k + 3] = 255;
    }

  ctx.putImageData(img, 0, 0);
};

const Frame = ({ height, children }: { height: number; children: React.ReactNode }) =>
  <div style={{ height, background: "#050508" }}>{children}</div>;

const Label = ({ m }: { m: Metric }) => <div style={{
  fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
  color: m.css, marginBottom: 6,
}}>
  {m.name}
  <span style={{ color: "#6c7080", textTransform: "none", letterSpacing: 0 }}>
    {"  b = "}{m.crit.toFixed(3)}{" GM/c²"}
  </span>
</div>;

/** The two, side by side, each in its own colour. */
export const Shadows = ({
  rObs = 60, rHit = 0.05, span = 11, tilt = 0.13, height = 300,
}: Partial<Look> & { height?: number }) => {
  const look: Look = { rObs, rHit, span, tilt };

  return <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
    {[EINSTEIN, COUNTED].map(m => <div key={m.name} style={{ flex: "1 1 300px" }}>
      <Label m={m} />
      <Frame height={height}>
        <CanvasView animate={false} deps={[m.name, rObs, rHit, span, tilt]}
          paint={() => ({ frame: (s) => one(m, s, look) })} />
      </Frame>
    </div>)}
  </div>;
};

/**
 * The same two, cut down the middle: general relativity on the left of the
 * seam, the counted metric on the right, everything else identical.
 *
 * Two panels ask the eye to remember a radius while it moves between them,
 * which it is bad at. One frame with a seam asks it to spot a STEP where the
 * shadow's edge and the photon ring cross the middle, which it is very good at
 * — and each side keeps its own colour, so which half is which needs no
 * remembering either.
 */
export const Seam = ({
  rObs = 60, rHit = 0.05, span = 11.5, tilt = 0.13, height = 480,
}: Partial<Look> & { height?: number }) => {
  const look: Look = { rObs, rHit, span, tilt };

  return <div>
    <div style={{
      display: "flex", justifyContent: "space-between", marginBottom: 6,
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
    }}>
      <span style={{ color: EINSTEIN.css }}>← general relativity</span>
      <span style={{ color: COUNTED.css }}>the compounded count →</span>
    </div>

    <Frame height={height}>
      <CanvasView animate={false} deps={["seam", rObs, rHit, span, tilt]}
        paint={() => ({
          frame: (surface) => {
            const { ctx, width, height: h } = surface;
            const img = ctx.createImageData(width, h);

            const bMax = span * Math.SQRT2 * (width / Math.min(width, h)) + 1;
            const RA = tabulate(EINSTEIN, rObs, rHit, bMax);
            const RB = tabulate(COUNTED, rObs, rHit, bMax);

            for (let py = 0; py < h; py++)
              for (let px = 0; px < width; px++) {
                const left = px < width / 2;
                const m = left ? EINSTEIN : COUNTED;
                const { lit } = shade(m, left ? RA : RB, bMax, px, py, surface, look);
                const k = (py * width + px) * 4;

                img.data[k] = GROUND + m.ink[0] * lit;
                img.data[k + 1] = GROUND + m.ink[1] * lit;
                img.data[k + 2] = GROUND + 3 + m.ink[2] * lit;
                img.data[k + 3] = 255;
              }

            ctx.putImageData(img, 0, 0);

            // the seam, and each side's critical radius as a half-arc, so the
            // step at the middle has something to be a step against
            const cx = width / 2, cy = h / 2;
            const perPixel = span / (Math.min(width, h) / 2);

            ctx.save();
            ctx.strokeStyle = "rgba(255,255,255,0.10)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, 0); ctx.lineTo(cx, h);
            ctx.stroke();

            ctx.lineWidth = 1.25;
            for (const [m, from, to] of [
              [EINSTEIN, Math.PI / 2, Math.PI * 1.5],
              [COUNTED, -Math.PI / 2, Math.PI / 2],
            ] as const) {
              ctx.strokeStyle = m.css;
              ctx.beginPath();
              ctx.arc(cx, cy, m.crit / perPixel, from, to);
              ctx.stroke();
            }
            ctx.restore();
          },
        })} />
    </Frame>
  </div>;
};

/**
 * And both in one frame, which is the only way 4.6% is actually visible.
 *
 * Amber is general relativity, blue is the counted metric, and they are ADDED:
 * where the two agree the pixel goes pale, and where they disagree it keeps
 * whichever colour was left over. So the whole image is white except for a thin
 * coloured rim around the shadow and along every lensed edge — and that rim is
 * the difference, at its true size.
 */
export const Overlay = ({
  rObs = 60, rHit = 0.05, span = 8, tilt = 0.13, height = 500,
}: Partial<Look> & { height?: number }) => {
  const look: Look = { rObs, rHit, span, tilt };

  return <div>
    <div style={{
      display: "flex", gap: 18, marginBottom: 6,
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
    }}>
      <span style={{ color: EINSTEIN.css }}>■ general relativity</span>
      <span style={{ color: COUNTED.css }}>■ the compounded count</span>
      <span style={{ color: "#6c7080" }}>■ both</span>
    </div>

    <Frame height={height}>
      <CanvasView animate={false} deps={["both", rObs, rHit, span, tilt]}
        paint={() => ({ frame: (s) => both(s, look) })} />
    </Frame>
  </div>;
};


/**
 * The two dark objects the model allows, and the one it does not.
 *
 * Route one (a surface, no horizon) and route two (a horizon, boost gated deep)
 * share the whole exterior down to the photon sphere, so they are the SAME
 * PICTURE — there is nothing to draw twice. What is worth drawing beside them
 * is the version where the gate is too shallow, because that is what the model
 * would look like if it were wrong in the one way an image could catch.
 */
export const Routes = ({
  rObs = 60, rHit = 0.05, span = 13, tilt = 0.13, height = 260,
}: Partial<Look> & { height?: number }) => {
  const look: Look = { rObs, rHit, span, tilt };

  const shallow = boosted(0.2);
  const panels: [Metric, string][] = [
    [EINSTEIN, "b = 5.196"],
    [COUNTED, "b = 5.437 — both routes, identically"],
    [shallow, "b = 7.760 — excluded"],
  ];

  return <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
    {panels.map(([m, note]) => <div key={m.name} style={{ flex: "1 1 220px" }}>
      <div style={{
        fontSize: "0.7em", letterSpacing: "0.07em", textTransform: "uppercase",
        color: m.css, marginBottom: 6,
      }}>
        {m === EINSTEIN ? "general relativity"
          : m === COUNTED ? "this model" : "gate too shallow"}
        <span style={{
          display: "block", color: "#6c7080",
          textTransform: "none", letterSpacing: 0,
        }}>{note}</span>
      </div>

      <Frame height={height}>
        <CanvasView animate={false} deps={[m.name, rObs, rHit, span, tilt]}
          paint={() => ({ frame: (s) => one(m, s, look) })} />
      </Frame>
    </div>)}
  </div>;
};
