/**
 * A PICTURE OF THE MODEL, DRAWN IN THE PAGE by `@orbitmines/physics` itself.
 *
 * Every visual the theories declare is a `Picture` (Visual.ray): its own size, its painter, and -
 * for a film - the recording behind it. A recorded film is played by `Film` (notation) off
 * `public/visuals`. A still that is cheap to compute is drawn HERE instead, live, so the page shows
 * what the current package's rules do rather than a frame rendered some other day: `G.strip(id)`
 * seeds a two- or three-point line, runs the rule by its own `matches` and `apply`, and paints
 * before and after (Strip.ray). Nothing in this file knows what a rule does.
 *
 * The `Surface` is the one the recorder's page has (implementation/ray/bootstrap/visuals.ts), on
 * a 2D context: the picture is painted in its own coordinates and scaled to the width it is given.
 */

import { useEffect, useRef } from "react";
import { G, Surface } from "@orbitmines/physics";

class CanvasSurface extends (Surface as any) {
  ctx: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) { super({ width, height }); this.ctx = ctx; }
  fill_style(c: string) { this.ctx.fillStyle = c; return null; }
  stroke_style(c: string) { this.ctx.strokeStyle = c; return null; }
  line_width(w: number) { this.ctx.lineWidth = w; return null; }
  alpha(a: number) { this.ctx.globalAlpha = a; return null; }
  fill_rect(x: number, y: number, w: number, h: number) { this.ctx.fillRect(x, y, w, h); return null; }
  stroke_rect(x: number, y: number, w: number, h: number) { this.ctx.strokeRect(x, y, w, h); return null; }
  clear_rect(x: number, y: number, w: number, h: number) { this.ctx.clearRect(x, y, w, h); return null; }
  get begin_path() { this.ctx.beginPath(); return null; }
  move_to(x: number, y: number) { this.ctx.moveTo(x, y); return null; }
  line_to(x: number, y: number) { this.ctx.lineTo(x, y); return null; }
  arc(x: number, y: number, r: number, a0: number, a1: number) { this.ctx.arc(x, y, r, a0, a1); return null; }
  get stroke() { this.ctx.stroke(); return null; }
  get fill() { this.ctx.fill(); return null; }
  font(f: string) { this.ctx.font = f; return null; }
  text_align(a: CanvasTextAlign) { this.ctx.textAlign = a; return null; }
  text_baseline(b: CanvasTextBaseline) { this.ctx.textBaseline = b; return null; }
  fill_text(t: string, x: number, y: number) { this.ctx.fillText(t, x, y); return null; }
  measure(t: string) { return this.ctx.measureText(t).width; }
  get save() { this.ctx.save(); return null; }
  get restore() { this.ctx.restore(); return null; }
  translate(x: number, y: number) { this.ctx.translate(x, y); return null; }
  rotate(a: number) { this.ctx.rotate(a); return null; }
  dash(segments: number[]) { this.ctx.setLineDash(segments); return null; }
  gradient_stroke(x0: number, x1: number, stops: string[], at: number[]) {
    const g = this.ctx.createLinearGradient(x0, 0, x1, 0);
    stops.forEach((c, i) => g.addColorStop(at[i], c));
    this.ctx.strokeStyle = g; return null;
  }
}

/** a Picture painted once onto a canvas at its own size, shown at the width of its container */
export const Painted = ({ of, style }: { of: () => any; style?: React.CSSProperties }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const picture = of();
    /* the painter is made once; a zero-argument Ray method is a getter */
    const painter = picture.painter;
    painter.start;
    /*
     * PAINTED AT ITS OWN SIZE, at device resolution, and scaled down by CSS. The canvas's size is what
     * the article's content-sized rows lay out around (see below), so it must not follow the measured
     * width - the first version did, and the row shrank around the canvas it was meant to size.
     */
    const dpr = window.devicePixelRatio || 1;
    el.width = Math.round(picture.width * dpr);
    el.height = Math.round(picture.height * dpr);
    const ctx = el.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    painter.frame(new CanvasSurface(ctx, picture.width, picture.height), 0);
  }, [of]);
  /*
   * THE CANVAS CARRIES AN INTRINSIC SIZE, like a video does: the article's rows are flex items sized
   * to their content, so a canvas of no size sat in a column 14 pixels wide. The attributes are the
   * strips' own size (Strip.ray: 900 wide) until the picture sets its own.
   */
  return <div style={{ display: "block", width: "100%", margin: "1.1rem auto", ...(style ?? {}) }}>
    <canvas ref={ref} width={900} height={70} style={{ display: "block", width: "100%", height: "auto", borderRadius: 3, background: "#08090d" }} />
  </div>;
};

/** one of G's visuals by id, drawn live: the rule strips (`rule.annihilation`, `rule.creation`, `rule.movement`) */
export const Drawn = ({ id, style }: { id: string; style?: React.CSSProperties }) =>
  <Painted of={() => (G as any).strip(id)} style={style} />;
