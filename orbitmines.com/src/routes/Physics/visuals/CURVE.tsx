/**
 * A ROTATION CURVE, UNDER BOTH LAWS — Newton falling away, and the same baryons
 * through the transport rule staying flat.
 *
 * WHAT IT IS A CURVE OF, stated because it matters: an EXPONENTIAL DISC, which is the
 * standard idealisation of a spiral galaxy and not a fit to any particular one. The
 * article's Milky Way figures use a measured baryonic model and quote ratios against
 * Gaia; reproducing those needs that model, and inventing one here to get a curve that
 * looked right would be the opposite of the point. What this shows is the MECHANISM:
 * the same mass, the same radii, one law that falls and one that does not.
 *
 * NOTHING IS FITTED IN THE SECOND CURVE. a₀ = cH₀/2π comes out of the expansion rate,
 * and the interpolation is what the turnover condition solves to — both checked in
 * `cosmology/rotation`, which shares this exact code through `TRANSPORT.ts`.
 */

import { CanvasView, Surface } from "./CANVAS";
import { Carousel, Slide } from "./CAROUSEL";
import { A0_MEASURED, G_NEWTON, H0, KPC, MSUN, a0, gOf } from "../TRANSPORT";

const BACK = "#08090d";
const FAINT = "#5a5f6e", INK = "#c6c9d4";
const CYAN = "#3ddcff", AMBER = "#ff7a45";

/**
 * AN EXPONENTIAL DISC: Σ(R) = Σ₀ e^(−R/Rd), so the mass inside R is
 * M(R) = 2πΣ₀Rd² [1 − (1 + R/Rd) e^(−R/Rd)].
 */
const enclosed = (R: number, Mtot: number, Rd: number) =>
  Mtot * (1 - (1 + R / Rd) * Math.exp(-R / Rd));

type Model = { name: string; Mtot: number; Rd: number; says: string };

const DISCS: Model[] = [
  { name: "a spiral like ours", Mtot: 6e10 * MSUN, Rd: 3 * KPC,
    says: "6·10¹⁰ M☉ in an exponential disc of scale length 3 kpc" },
  { name: "a tenth the mass", Mtot: 6e9 * MSUN, Rd: 1.5 * KPC,
    says: "6·10⁹ M☉ at 1.5 kpc — thinner, so the turnover comes in sooner" },
];

const draw = (m: Model) => (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const L = 46, R = 14, T = 14, B = 30;
  const w = width - L - R, h = height - T - B;
  const A = a0(H0.planck);

  const RMAX = 30 * KPC;
  const pts = Array.from({ length: 240 }, (_, i) => {
    const r = ((i + 1) / 240) * RMAX;
    const gN = (G_NEWTON * enclosed(r, m.Mtot, m.Rd)) / (r * r);
    return {
      r: r / KPC,
      newton: Math.sqrt(gN * r) / 1000,                 // km/s
      model: Math.sqrt(gOf(gN, A) * r) / 1000,
    };
  });
  const VMAX = Math.max(...pts.map(p => p.model)) * 1.15;

  const X = (r: number) => L + (r / (RMAX / KPC)) * w;
  const Y = (v: number) => T + h - (v / VMAX) * h;

  // axes
  ctx.strokeStyle = FAINT; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(L, T); ctx.lineTo(L, T + h); ctx.lineTo(L + w, T + h); ctx.stroke();
  ctx.fillStyle = FAINT; ctx.font = "10px system-ui, sans-serif";
  ctx.textAlign = "right";
  for (const v of [50, 100, 150, 200, 250]) {
    if (v > VMAX) continue;
    ctx.fillText(String(v), L - 6, Y(v) + 3);
    ctx.strokeStyle = "rgba(90,95,110,0.22)";
    ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(L + w, Y(v)); ctx.stroke();
  }
  ctx.textAlign = "center";
  for (const r of [5, 10, 15, 20, 25, 30]) ctx.fillText(String(r), X(r), T + h + 14);
  ctx.fillText("radius (kpc)", L + w / 2, T + h + 26);
  ctx.save();
  ctx.translate(11, T + h / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillText("v (km/s)", 0, 0);
  ctx.restore();

  const curve = (key: "newton" | "model", colour: string, dash: number[]) => {
    ctx.strokeStyle = colour; ctx.lineWidth = 1.6; ctx.setLineDash(dash);
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(X(p.r), Y(p[key])) : ctx.moveTo(X(p.r), Y(p[key]))));
    ctx.stroke(); ctx.setLineDash([]);
  };
  curve("newton", AMBER, [4, 4]);
  curve("model", CYAN, []);

  ctx.textAlign = "left";
  ctx.fillStyle = AMBER; ctx.fillText("Newton, the same baryons", L + 10, T + 14);
  ctx.fillStyle = CYAN; ctx.fillText("the transport rule", L + 10, T + 28);
  ctx.fillStyle = FAINT;
  ctx.fillText(`a₀ = cH₀/2π = ${A.toExponential(2)} m/s²  ·  nothing fitted`,
    L + 10, T + h - 8);
};

const view = (m: Model) =>
  <CanvasView deps={[m.name]} paint={() => ({ frame: draw(m) })} />;

export const RotationCurve = ({ height = 300 }: { height?: number } = {}) =>
  <Carousel height={height} slides={DISCS.map((m): Slide => ({
    key: m.name,
    label: `${m.name} — ${m.says}. AN IDEALISED DISC, not a fit to a real galaxy: ` +
      `what is being shown is that one law falls and the other does not`,
    render: () => view(m),
  }))} />;
