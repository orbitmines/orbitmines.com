/**
 * THE SHADOW — the same mass, the same camera, the same disc, and the only difference
 * between the two panels is the metric.
 *
 * WHAT IS BEING TRACED. The lean and the total are the same annihilations read twice;
 * the total gives u = n/DEG, and A = e^(−2u), B = e^(+2u) with A·B = 1. Because B
 * multiplies the whole spatial part the coordinates are ISOTROPIC — which a lattice
 * gets for nothing, having no coordinates to choose between — and in the equatorial
 * plane a null ray then obeys
 *
 *     (dr/dφ)² = B²r⁴/b² − r²          turning where b = B·r = r·e^(2u)
 *
 * so the critical impact parameter is the minimum of r·e^(2M/r), which is 2eM at
 * r = 2M. General relativity's is 3√3·M. THE SHADOW IS 4.63% LARGER AT THE SAME MASS,
 * and that is the one number in the whole model an instrument can settle now: measure
 * the mass from orbits and the shadow from imaging and the two should disagree by a
 * constant.
 *
 * IT IS TRACED RATHER THAN DRAWN. A disc of the right radius would beg the question,
 * so rays are integrated backwards from the eye until they either fall in or escape,
 * and the black region is where they fell in.
 */

import { CanvasView, Surface } from "./CANVAS";
import { Carousel, Slide } from "./CAROUSEL";
import { findingOf } from "./FIGURES";

const BACK = "#08090d";

/** the two metrics, as the one function the tracer needs: b at a turning point */
/*
 * THE TURNING FUNCTION, AND A BUG THAT LIVED HERE FOR A WHILE.
 *
 * In isotropic form ds² = −A dt² + B(dr² + r²dΩ²) a null ray turns where
 *
 *     b = r·√(B/A)        ← this, and not b = r·B
 *
 * The two coincide for the counted metric, where A·B = 1 makes √(B/A) = B, so the
 * field below was named `B` and was right for the geometry it was written for. It was
 * then wrong for Schwarzschild, where A·B ≠ 1: `(1 + 1/2r)⁴·r` bottoms out at 4.7407,
 * so the traced shadow on the relativity half of these panels was 9% too small and
 * disagreed with the dashed 3√3 circle drawn over it. The panel said one thing and its
 * own caption said another.
 *
 * Both geometries now carry A and B and the turning function is derived from them, so
 * there is nothing left to get right per-metric.
 */
type Metric = {
  name: string;
  A: (r: number) => number;
  B: (r: number) => number;
  /** critical impact parameter, in units of M */
  crit: number;
  says: string;
};

/** where a ray of impact parameter b turns: the quantity whose minimum is the shadow */
const turn = (m: Metric, r: number) => r * Math.sqrt(m.B(r) / m.A(r));

const COUNTED: Metric = {
  name: "the count",
  A: r => Math.exp(-2 / r),
  B: r => Math.exp(2 / r),
  crit: 2 * Math.E,
  says: "A = e^(−2u) out of the annihilation count — shadow 2e = 5.437 M",
};

/**
 * SCHWARZSCHILD, IN ISOTROPIC FORM so the two are traced by identical code and the
 * comparison is the metric rather than the integrator. r here is the isotropic
 * radius, areal R = r(1 + 1/2r)², and B = (1 + 1/2r)⁴.
 */
/*
 * AND WHY THE MEASURED u IS NOT TRACED HERE.
 *
 * It is tempting to run a world in the panel, count the annihilations, and trace the
 * shadow the lattice's own u casts — a discrete figure beside the continuum one. It
 * was tried, and at a size a panel can afford (31³, 90 ticks, one seed) the profile
 * comes out NOISE: u alternates sign across radii — +4.3e-2, −7.9e-3, −4.9e-2, −1.1e-3,
 * +3.3e-2 — with three of seven radii positive. Fitting M through that and drawing a
 * circle from it would be dressing noise as a measurement, which is the one thing this
 * arc keeps having to undo.
 *
 * THE MEASUREMENT EXISTS AND IS DONE PROPERLY ELSEWHERE. `metric/u-profile` runs it
 * across seeds with the vacuum differenced out and reports u with error bars; the
 * article quotes those numbers from the report. A figure that cannot carry a
 * measurement should say what it is instead of implying one, so this one draws the
 * closed-form metric and the caption says that is what it draws.
 */
const SCHWARZSCHILD: Metric = {
  name: "general relativity",
  A: r => Math.pow((1 - 0.5 / r) / (1 + 0.5 / r), 2),
  B: r => Math.pow(1 + 0.5 / r, 4),
  crit: 3 * Math.sqrt(3),
  says: "Schwarzschild, the same mass — shadow 3√3 = 5.196 M",
};

/**
 * DOES A RAY WITH THIS IMPACT PARAMETER COME BACK?
 *
 * Integrated inward in r: a ray turns where B·r = b, and falls in if it never does.
 * The test is therefore whether B(r)·r stays below b all the way down, which is the
 * same minimisation the critical parameter comes from and needs no orbit integration
 * to answer.
 */
const captured = (m: Metric, b: number) => {
  let lo = Infinity;
  for (let r = 0.502; r < 60; r += 0.002) lo = Math.min(lo, turn(m, r));
  return b < lo;
};

/** where a ray of impact parameter b crosses the equatorial plane again, for the disc */
const swept = (m: Metric, b: number) => {
  // dφ/dr = 1 / (r·sqrt(B²r²/b² − 1)), integrated from the turning point outwards
  let rt = 0;
  for (let r = 0.502; r < 60; r += 0.002) if (turn(m, r) >= b) { rt = r; break; }
  if (!rt) return 0;
  let phi = 0;
  for (let r = rt + 1e-3; r < 60; r += 0.01) {
    const t = turn(m, r) / r;
    const q = (t * t * r * r) / (b * b) - 1;
    if (q <= 0) continue;
    phi += 0.01 / (r * Math.sqrt(q));
  }
  return 2 * phi;
};

/*
 * CUT DOWN THE MIDDLE RATHER THAN SHOWN TWICE.
 *
 * Two panels ask the eye to carry a radius between them, which it is bad at — and the
 * whole content here is a 4.63% difference in one radius. One image with the seam down
 * the centre puts the two edges against each other, where the difference is a step
 * rather than a memory. Same mass, same camera, same brightness law; the only thing
 * that changes across the seam is the metric.
 */
const seam = (left: Metric, right: Metric) => {
  const N = 300, SPAN = 12;
  const table = (m: Metric) => {
    const capt: boolean[] = [];
    for (let i = 0; i <= N; i++) capt.push(captured(m, (i / N) * SPAN));
    return capt;
  };
  const T = new Map([[left.name, table(left)], [right.name, table(right)]]);

  return (s: Surface) => {
    const { ctx, width, height } = s;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);
    const cx = width / 2, cy = height / 2;
    const k = Math.min(width, height) / (2 * SPAN);

    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const dx = (x - cx) / k, dy = (y - cy) / k;
      const b = Math.hypot(dx, dy);
      const m = x < cx ? left : right;
      const capt = T.get(m.name)!;
      const i = Math.min(N, Math.round((b / SPAN) * N));
      const o = (y * width + x) * 4;
      let r = 8, g = 9, bl = 13;
      if (capt[i]) { r = 0; g = 0; bl = 0; }
      else {
        /*
         * THE PHOTON RING, AND A SMOOTH GLOW OUTSIDE IT. A first version tried to put
         * a thin disc in by testing whether the swept angle brought a ray back to the
         * equatorial plane, and drew a set of concentric arcs — an artefact of
         * sampling that angle on a grid rather than an image of anything. What is
         * defensible without a full radiative transfer is WHERE THE RAYS PILE UP,
         * which is the ring, so that is what is drawn and the caption says so.
         */
        const ring = Math.max(0, 1 - Math.abs(b - m.crit) / 0.45);
        const glow = b > m.crit ? 0.30 * Math.min(1, 3.2 / (b - m.crit + 1.6)) : 0;
        const v = Math.min(1, ring * 0.95 + glow);
        r = Math.min(255, 8 + v * 250);
        g = Math.min(255, 9 + v * 175);
        bl = Math.min(255, 13 + v * 105);
      }
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = bl; img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    ctx.strokeStyle = "rgba(140,147,168,0.35)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, height); ctx.stroke();
    ctx.setLineDash([3, 4]);
    for (const [m, half] of [[left, -1], [right, 1]] as [Metric, number][]) {
      ctx.strokeStyle = "rgba(140,147,168,0.65)";
      ctx.beginPath();
      ctx.arc(cx, cy, m.crit * k,
        half < 0 ? Math.PI / 2 : -Math.PI / 2,
        half < 0 ? 1.5 * Math.PI : Math.PI / 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.font = "11px system-ui, sans-serif";
    ctx.fillStyle = "rgba(140,147,168,0.9)";
    ctx.textAlign = "right";
    ctx.fillText(`${left.name} · ${left.crit.toFixed(3)} M`, cx - 10, height - 12);
    ctx.textAlign = "left";
    ctx.fillText(`${right.name} · ${right.crit.toFixed(3)} M`, cx + 10, height - 12);
  };
};

const draw = (m: Metric) => {
  /* precomputed once: the tracer is the same for every pixel at a given radius */
  const N = 260;
  const SPAN = 12;                                   // half-width of the view, in M
  const capt: boolean[] = [], sweep: number[] = [];
  for (let i = 0; i <= N; i++) {
    const b = (i / N) * SPAN;
    capt.push(captured(m, b));
    sweep.push(b > 0 ? swept(m, b) : 0);
  }

  return (s: Surface) => {
    const { ctx, width, height } = s;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);
    const cx = width / 2, cy = height / 2;
    const k = Math.min(width, height) / (2 * SPAN);

    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const dx = (x - cx) / k, dy = (y - cy) / k;
      const b = Math.hypot(dx, dy);
      const i = Math.min(N, Math.round((b / SPAN) * N));
      const o = (y * width + x) * 4;
      let r = 8, g = 9, bl = 13;                      // BACK
      if (capt[i]) { r = 0; g = 0; bl = 0; }          // fell in
      else {
        /*
         * A THIN DISC IN THE EQUATORIAL PLANE, seen edge on, and the ray is bent on
         * its way to it — which is what puts the far side of the disc ABOVE the hole
         * as well as below. The brightness is the sweep angle folded back to the
         * plane, so the photon ring appears where the sweep runs away.
         */
        const phi = sweep[i];
        const hits = Math.abs(Math.sin(phi / 2)) < 0.06 || Math.abs(Math.cos(phi / 2)) < 0.06;
        const ring = Math.max(0, 1 - Math.abs(b - m.crit) / 0.35);
        let v = ring * 0.9;
        if (hits && b > m.crit) v = Math.max(v, 0.42 * Math.min(1, 6 / b));
        if (v > 0) {
          r = Math.min(255, 8 + v * 255);
          g = Math.min(255, 9 + v * 190);
          bl = Math.min(255, 13 + v * 120);
        }
      }
      img.data[o] = r; img.data[o + 1] = g; img.data[o + 2] = bl; img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);

    // the critical radius, marked, because the number is the point of the figure
    ctx.strokeStyle = "rgba(140,147,168,0.55)";
    ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, m.crit * k, 0, 2 * Math.PI); ctx.stroke();
    ctx.setLineDash([]);
  };
};

/**
 * LAID ON TOP OF EACH OTHER RATHER THAN BESIDE.
 *
 * The seam puts the two edges against each other, which is the best way to see ONE
 * radius differ. This is the other way: draw both shadows in the same place, one
 * amber and one blue, and let them cancel to pale wherever they agree. What is left
 * coloured is exactly where they do not — an annulus 4.63% wide, and the only thing
 * in the picture.
 *
 * IT IS THE SAME TWO METRICS AND THE SAME TRACER as the seam, so nothing here can
 * differ from that figure except the compositing.
 */
const overlay = (a: Metric, b: Metric) => {
  const N = 300, SPAN = 12;
  const table = (m: Metric) => {
    const capt: boolean[] = [];
    for (let i = 0; i <= N; i++) capt.push(captured(m, (i / N) * SPAN));
    return capt;
  };
  const A = table(a), B = table(b);

  return (s: Surface) => {
    const { ctx, width, height } = s;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);
    const cx = width / 2, cy = height / 2;
    const k = Math.min(width, height) / (2 * SPAN);

    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const r = Math.hypot((x - cx) / k, (y - cy) / k);
      const i = Math.min(N, Math.round((r / SPAN) * N));
      const o = (y * width + x) * 4;
      /*
       * BOTH DARK OR BOTH LIT IS AGREEMENT, and agreement is drawn as nothing. Only
       * the cells where one has captured the ray and the other has not carry colour,
       * so the annulus IS the disagreement rather than being pointed at.
       */
      const inA = A[i], inB = B[i];
      let c = [8, 9, 13];
      if (inA && inB) c = [0, 0, 0];                       // both shadow: agree, dark
      else if (inA) c = [255, 122, 69];                    // only the first: amber
      else if (inB) c = [61, 220, 255];                    // only the second: blue
      else {
        const ring = Math.max(
          Math.max(0, 1 - Math.abs(r - a.crit) / 0.4),
          Math.max(0, 1 - Math.abs(r - b.crit) / 0.4));
        const v = ring * 0.5;
        c = [8 + v * 200, 9 + v * 200, 13 + v * 200];      // agree, lit: pale
      }
      img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2];
      img.data[o + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  };
};

const view = (m: Metric) =>
  <CanvasView deps={[m.name]} paint={() => ({ frame: draw(m) })} />;

export const Shadow = ({ height = 320 }: { height?: number } = {}) =>
  <div style={{ width: "100%", marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#6c7080", marginBottom: 6,
    }}>
      the same mass, the same camera — general relativity left of the seam, the
      annihilation count right. The bright ring is where rays pile up; the dashed arcs
      are the two critical radii, and the step at the seam is the {(2 * Math.E / (3 * Math.sqrt(3)) * 100 - 100).toFixed(2)}% the model predicts
    </div>
    <div style={{ width: "100%", height, background: BACK }}>
      <CanvasView deps={["seam"]} paint={() => ({ frame: seam(SCHWARZSCHILD, COUNTED) })} />
    </div>
  </div>;

export const ShadowOverlay = ({ height = 320 }: { height?: number } = {}) =>
  <div style={{ width: "100%", marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#6c7080", marginBottom: 6,
    }}>
      the two laid on top of each other — dark where both cast a shadow, pale where
      neither does, and coloured only in the annulus between the two critical radii.
      That ring is the whole of the disagreement: {SCHWARZSCHILD.crit.toFixed(3)} M
      against {COUNTED.crit.toFixed(3)} M
    </div>
    <div style={{ width: "100%", height, background: BACK }}>
      <CanvasView deps={["overlay"]}
        paint={() => ({ frame: overlay(COUNTED, SCHWARZSCHILD) })} />
    </div>
  </div>;

/**
 * THE ROUTES THEMSELVES — what a ray does near the hole, rather than what it looks
 * like from far away.
 *
 * The shadow figures answer "which rays come back". This answers "by what path", which
 * is where the photon sphere stops being a number and becomes a place: rays aimed a
 * little wide of the critical impact parameter wind several times round before
 * leaving, and a little narrow they wind round and fall in. THAT WINDING IS WHY THE
 * RING IS BRIGHT — many paths pile into the same narrow range of directions.
 *
 * INTEGRATED IN φ RATHER THAN IN r, so a turning point is an ordinary place on the
 * path rather than the singular one it is for dr/dφ. The same lesson as the perihelion
 * advance, which cost a wrong answer before it was learned.
 */
const route = (m: Metric, b: number, steps = 4000) => {
  let r = 40, phi = Math.PI, inward = true;
  const pts: [number, number][] = [];
  const dphi = (2 * Math.PI * 3) / steps;
  for (let i = 0; i < steps; i++) {
    const t = turn(m, r);
    const q = (t * t) / (b * b) - 1;
    if (q <= 0) inward = false;                    // a turning point: back out
    const drdphi = (inward ? -1 : 1) * r * Math.sqrt(Math.max(q, 0));
    r += drdphi * dphi;
    phi += dphi;
    if (r < 0.12 || r > 60) break;
    pts.push([r * Math.cos(phi), r * Math.sin(phi)]);
  }
  return { pts, escaped: r > 40 };
};

export const Routes = ({ height = 320 }: { height?: number } = {}) =>
  <div style={{ width: "100%", marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#6c7080", marginBottom: 6,
    }}>
      the paths themselves, in the metric the count gives — aimed a little wide of the
      critical impact parameter a ray winds round and leaves, a little narrow and it
      winds round and falls in. That winding is why the ring is bright
    </div>
    <div style={{ width: "100%", height, background: BACK }}>
      <CanvasView deps={["routes"]} paint={() => ({
        frame: (s: Surface) => {
          const { ctx, width, height: H } = s;
          ctx.clearRect(0, 0, width, H);
          ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, H);
          const SPAN = 22, k = Math.min(width, H) / (2 * SPAN);
          const cx = width / 2, cy = H / 2;
          const bc = COUNTED.crit;
          for (let i = -6; i <= 6; i++) {
            const b = bc * (1 + i * 0.045);
            const { pts, escaped } = route(COUNTED, b);
            if (pts.length < 2) continue;
            ctx.strokeStyle = escaped ? "rgba(61,220,255,0.55)" : "rgba(255,122,69,0.55)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            pts.forEach(([x, y], j) =>
              j ? ctx.lineTo(cx + x * k, cy - y * k) : ctx.moveTo(cx + x * k, cy - y * k));
            ctx.stroke();
          }
          ctx.setLineDash([3, 4]); ctx.strokeStyle = "rgba(140,147,168,0.65)";
          ctx.beginPath(); ctx.arc(cx, cy, bc * k, 0, 2 * Math.PI); ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "rgba(200,205,220,0.8)";
          ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, 2 * Math.PI); ctx.fill();
          ctx.font = "11px system-ui, sans-serif"; ctx.textAlign = "left";
          ctx.fillStyle = "#3ddcff"; ctx.fillText("escapes", 12, 16);
          ctx.fillStyle = "#ff7a45"; ctx.fillText("captured", 12, 31);
          ctx.fillStyle = "#5a5f6e";
          ctx.fillText(`dashed: b = 2e M = ${bc.toFixed(3)} M`, 12, H - 12);
        },
      })} />
    </div>
  </div>;

// ─── against the two images there are ───────────────────────────────────────

/**
 * WHAT THE EVENT HORIZON TELESCOPE HAS ALREADY SAID ABOUT IT.
 *
 * The derivation gives one number and no others: a shadow 4.63% larger than general
 * relativity's at the same mass. The collaboration publishes exactly the quantity that
 * number is a prediction for —
 *
 *     δ = θ_measured / θ_Schwarzschild − 1
 *
 * with θ_Schwarzschild built from a mass and a distance measured some other way. That
 * is "measure the mass from orbits and the shadow from imaging", which is the whole of
 * the test, so the panel is one axis with δ on it and everything else is annotation.
 *
 * THREE ROWS FOR TWO OBJECTS. Sgr A* appears twice because the same image is measured
 * against two independent mass calibrations, VLTI and Keck; those two cannot be
 * averaged with each other, though either can be averaged with M87*.
 *
 * AND THE AMBER BAND IS THE HONEST PART. General relativity's own δ is not a point:
 * Kerr runs from −0.08 at high spin down to 0 at none, so the range relativity already
 * covers is nearly twice the excess being looked for. A shadow measured against an
 * orbital mass therefore cannot settle this alone — it needs a spin from somewhere
 * else, or an object known to be spinning slowly. The prediction stays falsifiable and
 * stops being a one-measurement test, and drawing the band is the only way to say that
 * without the reader having to take it on trust.
 */
type Image = { of: string; delta: number; e: number; note: string };
const IMAGES: Image[] = [
  { of: "M87*", delta: -0.01, e: 0.17,
    note: "EHT 2019 VI · Gebhardt+2011's stellar-dynamical mass" },
  { of: "Sgr A*", delta: -0.08, e: 0.09, note: "EHT 2022 VI · VLTI orbital mass" },
  { of: "Sgr A*", delta: -0.04, e: 0.09, note: "EHT 2022 VI · Keck orbital mass" },
];

const EXCESS = (2 * Math.E) / (3 * Math.sqrt(3)) - 1;
const KERR_LO = -0.08;

/**
 * AND THE MODEL GETS A BAND TOO, WHICH IS NOT THE SAME KIND OF BAND.
 *
 * The amber one is SPIN: Kerr's δ genuinely runs from −0.08 to 0 as a real black hole
 * turns, so general relativity does not predict a number, it predicts a range, and the
 * range is a property of the object.
 *
 * The blue one is IGNORANCE. `metric/ring-as-imaged` traces the ring an optically thin
 * plasma casts around each geometry and finds the observable ratio depends on where
 * that plasma sits — 1.010 anchored at the same areal radius, 1.038 at each geometry's
 * own ISCO, 1.062 scaled to each photon sphere. Nothing in this model picks between
 * them. So the width is not something the black hole is doing, it is something this
 * page does not know, and drawing the two the same way would be a lie of composition.
 * They are labelled apart, and the model's own spin range is not in there at all
 * because nothing here has a rotating solution to take it from.
 */
const readRing = (name: string) => {
  const f = findingOf("metric/ring-as-imaged", name);
  return typeof f?.value === "number" ? f.value : NaN;
};
const OBSERVED = () => readRing(
  "THE OBSERVABLE RATIO — plasma truncated at each geometry's own ISCO") - 1;
const BAND_LO = () => readRing(
  "the observable ratio, plasma at the same areal radius in both") - 1;
const BAND_HI = () => readRing(
  "the observable ratio, plasma scaled to each photon sphere") - 1;

const eht = (s: Surface) => {
  const { ctx } = s;
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, s.width, s.height);
  const L = 58, R = 18, T = 46, B = 46;
  const w = s.width - L - R, h = s.height - T - B;
  const LO = -0.30, HI = 0.30;
  const X = (d: number) => L + w * (d - LO) / (HI - LO);
  const rowY = (i: number) => T + h * (i + 0.65) / (IMAGES.length + 0.6);

  ctx.font = "400 10px ui-monospace, Menlo, monospace";
  ctx.strokeStyle = "rgba(120,127,148,0.13)"; ctx.lineWidth = 1;
  for (let d = -0.3; d <= 0.301; d += 0.1) {
    ctx.beginPath(); ctx.moveTo(X(d), T); ctx.lineTo(X(d), T + h); ctx.stroke();
    ctx.fillStyle = "#5a5f6e"; ctx.textAlign = "center";
    ctx.fillText(`${d > 0.001 ? "+" : ""}${d.toFixed(1)}`, X(d), T + h + 16);
  }

  // the range general relativity itself covers, over spin and viewing angle
  ctx.fillStyle = "rgba(212,180,139,0.10)";
  ctx.fillRect(X(KERR_LO), T, X(0) - X(KERR_LO), h);
  ctx.strokeStyle = "#d4b48b"; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(X(0), T); ctx.lineTo(X(0), T + h); ctx.stroke();

  // the geometry alone — a sharp line, and no longer the thing to compare against
  ctx.strokeStyle = "#4aa8eb"; ctx.globalAlpha = 0.40; ctx.lineWidth = 1.2;
  ctx.setLineDash([2, 4]);
  ctx.beginPath(); ctx.moveTo(X(EXCESS), T); ctx.lineTo(X(EXCESS), T + h); ctx.stroke();
  ctx.setLineDash([]); ctx.globalAlpha = 1;

  // and what an instrument would see: a band, because the plasma is not pinned down
  const lo = BAND_LO(), hi = BAND_HI(), mid = OBSERVED();
  if (Number.isFinite(lo) && Number.isFinite(hi)) {
    ctx.fillStyle = "rgba(74,168,235,0.13)";
    ctx.fillRect(X(lo), T, X(hi) - X(lo), h);
  }
  if (Number.isFinite(mid)) {
    ctx.strokeStyle = "#4aa8eb"; ctx.lineWidth = 2.2; ctx.setLineDash([6, 3]);
    ctx.beginPath(); ctx.moveTo(X(mid), T); ctx.lineTo(X(mid), T + h); ctx.stroke();
    ctx.setLineDash([]);
  }

  IMAGES.forEach((im, i) => {
    const y = rowY(i);
    ctx.strokeStyle = "#eef0f5"; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(X(im.delta - im.e), y); ctx.lineTo(X(im.delta + im.e), y); ctx.stroke();
    for (const q of [im.delta - im.e, im.delta + im.e]) {
      ctx.beginPath(); ctx.moveTo(X(q), y - 4); ctx.lineTo(X(q), y + 4); ctx.stroke();
    }
    ctx.fillStyle = "#eef0f5";
    ctx.beginPath(); ctx.arc(X(im.delta), y, 3.2, 0, 2 * Math.PI); ctx.fill();

    ctx.textAlign = "right"; ctx.font = "400 11px ui-monospace, Menlo, monospace";
    ctx.fillText(im.of, L - 8, y + 4);
    /*
     * THE ANNOTATION IS RIGHT-ALIGNED TO THE FRAME, not hung off the end of the bar.
     * M87*'s error is ±0.17 and its bar reaches most of the way across, so text placed
     * after it ran off the panel and was cut in half — which is how the first render
     * of this figure came out.
     */
    ctx.textAlign = "right"; ctx.font = "400 8.5px ui-monospace, Menlo, monospace";
    ctx.fillStyle = "#5a5f6e";
    ctx.fillText(im.note, s.width - R, y - 4);
    const at = Number.isFinite(mid) ? mid : EXCESS;
    ctx.fillText(`${(Math.abs(at - im.delta) / im.e).toFixed(2)}σ from this model,` +
      ` ${(Math.abs(im.delta) / im.e).toFixed(2)}σ from relativity`, s.width - R, y + 8);
  });

  ctx.font = "400 9.5px ui-monospace, Menlo, monospace";
  ctx.textAlign = "left";
  ctx.fillStyle = "#4aa8eb";
  ctx.fillText(Number.isFinite(mid)
    ? `this model, AS IMAGED — δ = +${mid.toFixed(4)}, and the blue band is where the plasma could put it`
    : "this model — the ray-traced ring is NOT IN THE REPORT", L + 4, T - 32);
  ctx.fillStyle = "rgba(74,168,235,0.55)";
  ctx.fillText(`the faint line is the geometry alone, δ = 2e/3√3 − 1 = +${EXCESS.toFixed(4)} — not what a telescope reads`,
    L + 4, T - 20);
  ctx.fillStyle = "#d4b48b";
  ctx.fillText("general relativity — δ = 0 at no spin, and the amber band is Kerr's own range over spin",
    L + 4, T - 8);
  ctx.fillStyle = "#5a5f6e"; ctx.textAlign = "center";
  ctx.fillText("δ = measured shadow / relativity's shadow at the same mass − 1",
    L + w / 2, s.height - 8);
};

export const ShadowAgainstEht = ({ height = 300 }: { height?: number } = {}) =>
  <div style={{ marginBottom: "1.1rem" }}>
    <div style={{
      fontSize: "0.72em", letterSpacing: "0.08em", textTransform: "uppercase",
      color: "#5a5f6e", marginBottom: 6,
    }}>
      the excess against both images anyone has — the blue band is what a ray trace
      says an instrument would see, the amber one is Kerr's own spread over spin, and
      they are not the same kind of band
    </div>
    <div style={{ height, background: BACK }}>
      <CanvasView animate={false} deps={["eht"]}
        paint={() => ({ frame: (s: Surface) => eht(s) })} />
    </div>
  </div>;
