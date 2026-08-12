/**
 * WHETHER A SURFACE CAN BE HEARD, WHICH IS THE ONLY PLACE THE TWO ROUTES WERE
 * SUPPOSED TO DIFFER — AND IT CANNOT.
 *
 * An image cannot separate them: both share the exterior down to the photon
 * sphere, so both cast the same shadow. The standard fallback is a RINGDOWN.
 * A horizon absorbs whatever falls through it, so the signal decays and stops;
 * a surface reflects, so the wave trapped between the surface and the photon
 * sphere leaks back out as a train of late echoes. That is exactly what
 * LIGO and Virgo searches look for in horizonless models.
 *
 * The delay is the round trip at the coordinate speed of light, `c√(A/B)`:
 *
 *     Δt = 2 ∫_{r_s}^{r_ph} e^{2GM/r} dr / c
 *
 *     surface r_s    Δt (GM/c)     for 1 M☉
 *     1.50 GM        3.175e+0      1.6e−5 s
 *     0.60 GM        1.941e+1      9.6e−5 s
 *     0.30 GM        1.161e+2      5.7e−4 s
 *     0.15 GM        1.670e+4      8.2e−2 s
 *
 * — perfectly detectable, for a surface anywhere near where such models
 * usually put one. But THIS model puts the surface at `R_c = 1.9567 cells`,
 * and for a solar mass that is `r_s = 2.1·10⁻³⁸ GM`, so the delay carries a
 * factor of `e^(9.3·10³⁷)`. A number with 10³⁷ digits.
 *
 * THE ECHOES NEVER COME BACK. Not late — never. And that corrects something
 * this file said earlier: it claimed a surface would show up in a ringdown
 * where a horizon would not, and offered that as what separates the two
 * routes. It does not. A horizon and a Planck-scale surface are the same thing
 * to anybody outside, because "no echo ever" and "no echo possible" are not
 * distinguishable measurements.
 *
 * So the model does not predict echoes, and it would be wrong to advertise
 * horizonlessness as though it did. What remains observable is the shadow,
 * and nothing at all about the interior.
 */

import { CanvasView, Surface } from "./canvas";

/** round trip from a surface at x = r/GM out to the photon sphere at x = 2 */
export const delay = (xs: number) => {
  const N = 20000;
  let acc = 0;
  for (let i = 0; i < N; i++) {
    const x = xs + (2 - xs) * (i + 0.5) / N;
    acc += Math.exp(2 / x) * (2 - xs) / N;
  }
  return 2 * acc;
};

type Trace = {
  label: string;
  under: string;
  /** echo spacing in GM/c, or Infinity for none */
  gap: number;
  css: string;
};

const OMEGA = 0.55;                   // ringdown frequency, rad per GM/c
const TAU = 14;                       // its damping time
const SPAN = 420;                     // how much of the signal is shown

/** the strain: a damped ring, plus a fainter copy every `gap` */
const strain = (t: number, gap: number) => {
  let h = 0;
  for (let n = 0; n < 40; n++) {
    // `n * gap` at n = 0 with gap = Infinity is 0·∞, which is NaN — and a NaN
    // strain is a NaN y, which is a path the canvas silently declines to draw.
    // Both no-echo lanes rendered as nothing at all, which read as a broken
    // panel rather than as the measurement. The first arrival is always at t.
    const at = n === 0 ? t : t - n * gap;
    if (at < 0) break;
    // each bounce loses most of the wave through the ring
    h += Math.pow(0.45, n) * Math.exp(-at / TAU) * Math.sin(OMEGA * at);
    if (!isFinite(gap)) break;
  }
  return h;
};

const plot = (traces: Trace[], surface: Surface) => {
  const { ctx, width, height } = surface;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#050508";
  ctx.fillRect(0, 0, width, height);

  const pad = 8;
  const lane = (height - pad * 2) / traces.length;

  traces.forEach((tr, i) => {
    const mid = pad + lane * (i + 0.5);

    ctx.strokeStyle = "rgba(255,255,255,0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, mid); ctx.lineTo(width, mid);
    ctx.stroke();

    ctx.strokeStyle = tr.css;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    for (let px = 0; px < width; px++) {
      const t = px / width * SPAN;
      const y = mid - strain(t, tr.gap) * lane * 0.38;
      if (px === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
    }
    ctx.stroke();

    ctx.fillStyle = tr.css;
    ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(tr.label, 10, mid - lane * 0.34);

    ctx.fillStyle = "#6c7080";
    ctx.font = "400 10px ui-monospace, Menlo, monospace";
    ctx.fillText(tr.under, 10, mid - lane * 0.34 + 13);
  });
};

/**
 * A horizon, a surface shallow enough to be heard, and this model's — which
 * is not.
 */
export const Echoes = ({ height = 260 }: { height?: number }) => {
  const traces: Trace[] = [
    {
      label: "a horizon",
      under: "nothing comes back",
      gap: Infinity,
      css: "#eb964a",
    },
    {
      label: "a surface at 0.3 GM/c²",
      under: `echoes every ${delay(0.3).toFixed(0)} GM/c — 0.6 ms for a solar mass`,
      gap: delay(0.3),
      css: "#8bd48b",
    },
    {
      label: "this model's surface, at 2·10⁻³⁸ GM/c²",
      under: "echoes every 10^(4·10³⁷) GM/c — nothing comes back",
      gap: Infinity,
      css: "#4aa8eb",
    },
  ];

  return <div>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#6c7080", marginBottom: 6,
    }}>
      ringdown, {SPAN} GM/c of it — about 2 ms at a solar mass
    </div>

    <div style={{ height, background: "#050508" }}>
      <CanvasView animate={false} deps={["echoes"]}
        paint={() => ({ frame: (s) => plot(traces, s) })} />
    </div>
  </div>;
};
