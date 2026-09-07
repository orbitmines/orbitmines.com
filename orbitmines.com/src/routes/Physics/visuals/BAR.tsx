/**
 * A BAR MAGNET — where its two faces come from, and the field they make.
 *
 * The same bar `magnetostatics/laws` measures, out of `POLES.ts`, so the picture and
 * the measurement cannot disagree. What it draws is the whole content of the pole
 * model in one frame:
 *
 *   THE FACES ARE NOT PUT THERE. −∇·M is nought wherever the magnetisation is
 *   uniform, so the interior carries no source at all and everything lives on the two
 *   ends — which is (G/1) run over a body, and is what magnetostatics writes down as
 *   σ = M·n̂ without deriving.
 *
 *   B AND H ARE DIFFERENT FIELDS, and inside the magnet they point OPPOSITE ways.
 *   That is the one thing about magnetostatics that reliably surprises, it is not a
 *   convention, and it is why ∮B·dA is nought at every radius while ∮H·dA counts the
 *   poles: ∇·H and ∇·M are each nonzero at the face and cancel there.
 */

import { CanvasView, Surface } from "./CANVAS";
import { Carousel, Slide } from "./CAROUSEL";
import { BAR, B as Bof, H as Hof, V3, inside, poles } from "../POLES";

const BACK = "#08090d";
const GREY = "140,147,168";
const CYAN = "61,220,255", AMBER = "255,122,69";

const P = poles(BAR);

/** streamline from a seed, integrated through whichever field is being drawn */
const line = (F: (x: number, y: number, z: number) => V3, from: V3, steps = 260) => {
  const out: [number, number][] = [];
  let [x, y, z] = from;
  for (let i = 0; i < steps; i++) {
    const f = F(x, y, z);
    const n = Math.hypot(f[0], f[1], f[2]);
    if (!Number.isFinite(n) || n < 1e-12) break;
    const h = 0.22;
    x += (f[0] / n) * h; y += (f[1] / n) * h; z += (f[2] / n) * h;
    if (Math.abs(x) > 26 || Math.abs(z) > 26) break;
    out.push([x, z]);
  }
  return out;
};

const draw = (which: "B" | "H") => (s: Surface) => {
  const { ctx, width, height } = s;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = BACK; ctx.fillRect(0, 0, width, height);

  const k = Math.min(width / 34, height / 26);
  const X = (x: number) => width / 2 + x * k, Y = (z: number) => height / 2 - z * k;
  const F = which === "B"
    ? (x: number, y: number, z: number) => Bof(P, BAR, x, y, z)
    : (x: number, y: number, z: number) => Hof(P, x, y, z);

  /*
   * SEEDED FROM BOTH FACES AND FROM INSIDE, because the inside is where the two
   * fields differ and drawing only the outside would hide the whole point.
   */
  const seeds: V3[] = [];
  for (let i = -2; i <= 2; i++) {
    seeds.push([i * 1.2, 0, BAR.nz / 2 + 0.35]);
    seeds.push([i * 1.2, 0, -BAR.nz / 2 - 0.35]);
    seeds.push([i * 1.1, 0, 0]);
  }
  for (let i = -3; i <= 3; i++) seeds.push([i * 4.5, 0, 0.001]);

  ctx.lineWidth = 1;
  for (const seed of seeds) {
    for (const dir of [1, -1]) {
      const pts = line((x, y, z) => {
        const f = F(x, y, z);
        return [f[0] * dir, f[1] * dir, f[2] * dir] as V3;
      }, seed);
      if (pts.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(X(pts[0][0]), Y(pts[0][1]));
      for (const [x, z] of pts) ctx.lineTo(X(x), Y(z));
      const within = inside(BAR, seed[0], seed[1], seed[2]);
      ctx.strokeStyle = `rgba(${within ? (which === "B" ? CYAN : AMBER) : GREY},${within ? 0.75 : 0.34})`;
      ctx.stroke();
    }
  }

  // the body itself, and its two faces
  ctx.strokeStyle = `rgba(${GREY},0.55)`;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(X(-BAR.nx / 2), Y(BAR.nz / 2), BAR.nx * k, BAR.nz * k);
  ctx.fillStyle = `rgba(${CYAN},0.5)`;
  ctx.fillRect(X(-BAR.nx / 2), Y(BAR.nz / 2) - 2.5, BAR.nx * k, 5);
  ctx.fillStyle = `rgba(${AMBER},0.5)`;
  ctx.fillRect(X(-BAR.nx / 2), Y(-BAR.nz / 2) - 2.5, BAR.nx * k, 5);
};

const view = (which: "B" | "H") =>
  <CanvasView deps={[which]} paint={() => ({ frame: draw(which) })} />;

export const BarField = ({ height = 300 }: { height?: number } = {}) =>
  <Carousel height={height} slides={([
    ["B", "B = µ₀(H + M) — continuous loops, no source anywhere, so ∮B·dA = 0 at every radius"],
    ["H", "H — it begins on the north face and ends on the south, and INSIDE the magnet it " +
      "points the other way from B"],
  ] as const).map(([w, says]): Slide => ({
    key: w, label: `${w} · a ${BAR.nx}×${BAR.ny}×${BAR.nz} bar, magnetised M ẑ — ${says}`,
    render: () => view(w),
  }))} />;
