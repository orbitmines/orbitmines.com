/**
 * WHERE DO THE POLES COME FROM — does an ordering of ordinary sided emitters
 * produce the region-bias that `poles` shows is what a magnet needs?
 *
 * `poles` settled the mechanism: put the bias on a PLACE — a body + at one end
 * and − at the other — and the same XOR gives 3cos²θ − 1, 1/R⁴ and every
 * orientation. What it did not say is how a lump of matter comes to be like
 * that.
 *
 * The proposal is rotation: emitters point outward more often, spinning holds
 * them there, the middle averages out to nothing but gravity, and what is left
 * over shows up ON THE OUTSIDE. That is the right shape of answer, because it
 * is the same "unpaired at the boundary" argument that makes the bulk cancel:
 * inside, every emitter's + has a neighbour's − sitting on it; at a face, the
 * outermost + has nothing to pair with.
 *
 * So this file takes each ordering an emitter population could have and
 * measures what the far field actually does. The test is a multipole one: a
 * magnet's field must fall as 1/r³ and reverse between the poles. Anything
 * falling as 1/r² has a net and is not a magnet.
 */

const DIMS = 3;
const SHEET = Math.pow(3, DIMS - 1) - 1;

type V = [number, number, number];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: V): V => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** how each emitter in the body is pointed */
type Order = "axial" | "radial" | "cylindrical" | "region";

/** a cylinder of emitters, sampled on a grid */
const body = (R: number, H: number, n = 15) => {
  const out: { at: V; w: number }[] = [];
  const dz = H / n, dr = R / n;
  for (let i = 0; i < n; i++) {
    const z = -H / 2 + dz * (i + 0.5);
    for (let j = 0; j < n; j++) {
      const s = dr * (j + 0.5);
      const np = Math.max(4, Math.round(2 * Math.PI * s / dr));
      for (let k = 0; k < np; k++) {
        const ph = 2 * Math.PI * (k + 0.5) / np;
        out.push({ at: [s * Math.cos(ph), s * Math.sin(ph), z], w: s * dr * dz * (2 * Math.PI / np) });
      }
    }
  }
  return out;
};

const Z: V = [0, 0, 1];

/** the axis a given emitter is pointed along, under a given ordering */
const axisOf = (o: Order, at: V): V => {
  if (o === "axial") return Z;
  if (o === "radial") return unit(at);
  if (o === "cylindrical") return unit([at[0], at[1], 1e-12]);
  return Z;                                    // unused for "region"
};

/**
 * The signed emission a body leaves at a place.
 *
 * For the three ORDERINGS this is `sign(d̂·n̂)/r²` summed over emitters, which
 * is `physics.ts`'s emission rule with the sign kept. For "region" it is the
 * pole model — a net + in the top half and a net − in the bottom — which is
 * what `poles` measured and is here as the control.
 */
const signedAt = (o: Order, B: ReturnType<typeof body>, x: V) => {
  let acc = 0;
  for (const e of B) {
    const d: V = [x[0] - e.at[0], x[1] - e.at[1], x[2] - e.at[2]];
    const r2 = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
    if (r2 < 1e-12) continue;
    const s = o === "region"
      ? Math.sign(e.at[2])                     // net + above the middle, − below
      : Math.sign(dot(axisOf(o, e.at), unit(d)));
    acc += s * e.w * SHEET / (4 * Math.PI * r2);
  }
  return acc;
};

const at = (R: number, th: number): V => [R * Math.sin(th), 0, R * Math.cos(th)];

console.log("=".repeat(78));
console.log("1. THE BULK REALLY DOES CANCEL, AND THE FACES REALLY DO NOT");
console.log("=".repeat(78));
console.log("   A cylinder of radius 6, height 12, all emitters pointed along z.");
console.log("   Signed emission on the axis, walking from the middle out:\n");
console.log("      z        inside/outside   signed emission");
{
  const B = body(6, 12);
  for (const z of [0, 2, 4, 5.5, 6.5, 8, 12, 24]) {
    console.log(`   ${z.toFixed(1).padStart(6)}   ${(Math.abs(z) < 6 ? "inside" : "outside").padEnd(14)}   ` +
      `${signedAt("axial", B, [0, 0, z]).toExponential(3)}`);
  }
  console.log("\n   Nought in the middle by symmetry and growing outward, which is");
  console.log("   the proposal exactly: gravity in the middle, the signed part on");
  console.log("   the outside. So far so good.");
}

console.log();
console.log("=".repeat(78));
console.log("2. BUT THE FAR FIELD IS WHAT DECIDES IT");
console.log("=".repeat(78));
console.log("   A magnet's field falls as 1/r³ and REVERSES between its poles.");
console.log("   Anything falling as 1/r² has a net and is not a magnet.\n");
console.log("      ordering       slope, on axis    θ=0        θ=90°      θ=180°    verdict");
{
  const B = body(6, 12);
  for (const o of ["axial", "radial", "cylindrical", "region"] as Order[]) {
    const f = (R: number, th: number) => signedAt(o, B, at(R, th));
    const a1 = f(60, 0), a2 = f(240, 0);
    const slope = Math.log(Math.abs(a2 / a1)) / Math.log(240 / 60);
    const p0 = f(120, 0), p9 = f(120, Math.PI / 2), p18 = f(120, Math.PI);
    const reverses = Math.sign(p0) !== Math.sign(p18) && Math.abs(p18) > 1e-14;
    const ok = slope < -2.7 && reverses;
    console.log(`   ${o.padEnd(14)} ${slope.toFixed(2).padStart(9)}      ` +
      `${p0.toExponential(1).padStart(9)}  ${p9.toExponential(1).padStart(9)}  ` +
      `${p18.toExponential(1).padStart(9)}   ${ok ? "A MAGNET" : "not a magnet"}`);
  }
}
console.log("\n   Only the region reading passes, and the three orderings fail the");
console.log("   same way: at a distant point EVERY emitter in the body agrees");
console.log("   about which sign that direction gets, because the sign is decided");
console.log("   by where the OBSERVER is. So they add instead of cancelling, and");
console.log("   what comes out is a net — a 1/r² with a preferred direction.");

console.log();
console.log("=".repeat(78));
console.log("3. WHICH IS A SHARP STATEMENT AND NOT A VAGUE ONE");
console.log("=".repeat(78));
console.log("   The bulk-cancels-faces-don't argument is RIGHT — section 1 shows");
console.log("   it happening. What it produces is not a magnet, and the reason is");
console.log("   specific: cancellation between neighbours is a NEAR-FIELD fact, and");
console.log("   a distant body does not see neighbours cancelling. It sees every");
console.log("   emitter's chosen side at once.");
console.log("");
console.log("   For the faces to be POLES, an emitter's sign has to be fixed when");
console.log("   it is emitted rather than decided by who is looking. That is the");
console.log("   whole difference between the two readings:\n");
console.log("      bias on a DIRECTION   sign = f(observer)   → adds, gives a net");
console.log("      bias on a PLACE       sign = f(emitter)    → cancels, gives a dipole");
console.log("");
console.log("   So rotation can order the emitters — and something has to, or the");
console.log("   body has no axis at all — but ordering alone does not make poles.");
console.log("   What is needed is an emitter whose SIGN travels with the pulse.");

console.log();
console.log("=".repeat(78));
console.log("4. AND THAT IS A CONCRETE THING TO ASK OF `physics.ts`");
console.log("=".repeat(78));
console.log("   `emission` is `sided ? along() : cos(2πβ)`, and `along()` is the");
console.log("   direction resolved against the axis — computed AT THE DESTINATION.");
console.log("   That is what makes the sign a function of the observer.");
console.log("");
console.log("   A charge that carried its polarity with it would be quantised at");
console.log("   the source instead: the emitter picks a sign per pulse, sends it,");
console.log("   and what arrives is what was sent. Then a body's + and − come from");
console.log("   WHERE its emitters are, the near-field cancellation survives to");
console.log("   infinity, and the faces are poles.");
console.log("");
console.log("   Which is not a new mechanism — it is the same XOR, the same");
console.log("   `chance`, the same co-location. It is a question about one line:");
console.log("   IS A PULSE'S SIGN FIXED WHEN IT LEAVES, OR WHEN IT ARRIVES?");

export {};
