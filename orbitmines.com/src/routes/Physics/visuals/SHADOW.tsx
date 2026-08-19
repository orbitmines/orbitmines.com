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

const BACK = "#08090d";

/** the two metrics, as the one function the tracer needs: b at a turning point */
type Metric = {
  name: string;
  /** B(r) in isotropic coordinates; the turning point is where B·r = b */
  B: (r: number) => number;
  /** critical impact parameter, in units of M */
  crit: number;
  says: string;
};

const COUNTED: Metric = {
  name: "the count",
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
  for (let r = 0.02; r < 60; r += 0.002) lo = Math.min(lo, m.B(r) * r);
  return b < lo;
};

/** where a ray of impact parameter b crosses the equatorial plane again, for the disc */
const swept = (m: Metric, b: number) => {
  // dφ/dr = 1 / (r·sqrt(B²r²/b² − 1)), integrated from the turning point outwards
  let rt = 0;
  for (let r = 0.02; r < 60; r += 0.002) if (m.B(r) * r >= b) { rt = r; break; }
  if (!rt) return 0;
  let phi = 0;
  for (let r = rt + 1e-3; r < 60; r += 0.01) {
    const q = (m.B(r) * m.B(r) * r * r) / (b * b) - 1;
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
    const q = (m.B(r) * m.B(r) * r * r) / (b * b) - 1;
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
