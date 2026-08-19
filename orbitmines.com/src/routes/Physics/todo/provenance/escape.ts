/**
 * IS −div p DERIVED, OR IS IT A THIRD EMISSION RULE?
 *
 * `divp` shows that a body whose emitted sign is −div p is a magnet in every
 * way one is asked to be. It does not show that this model emits that. The
 * argument offered was Gauss's theorem on the annihilation ledger — every + in
 * the bulk has a neighbour's − sitting on it, so only the boundary survives,
 * and the surviving boundary density is the divergence. This file runs it
 * instead of asserting it, on the model's own rules: pulses out of every node
 * into the DEG = 26 directions, opposite signs meeting head-on annihilate.
 *
 * Two questions, and they do not get the same answer.
 *
 *   §1  Does the bulk really cancel, and is what is left really −div p?
 *   §2  And does what is left produce a magnet's FIELD?
 *
 * §1 comes out yes, exactly. §2 comes out no, and the reason is the one
 * `departure` already found: an escaped pulse is still going somewhere. A
 * surface density that is right and a propagation that is directional give a
 * far field of 1/r², not 1/r³, because a distant observer only ever sees the
 * face pointing at it.
 *
 * §3 is what would have to be true instead, stated precisely enough to be
 * someone's next job.
 */

const DIMS = 3;
const DEG = Math.pow(3, DIMS) - 1;

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const key = (a: V) => `${a[0]},${a[1]},${a[2]}`;

const WAYS: V[] = (() => {
  const out: V[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) out.push([x, y, z]);
  return out;
})();

const sgn = (x: number) => (Math.abs(x) < 1e-12 ? 0 : x > 0 ? 1 : -1);

const block = (L: number, H: number): V[] => {
  const out: V[] = [];
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < H; k++)
    out.push([i - (L - 1) / 2, j - (L - 1) / 2, k - (H - 1) / 2]);
  return out;
};

/** the polarisation field: p inside the body, nothing outside */
const field = (cells: V[], p: V) => {
  const inside = new Set(cells.map(key));
  return {
    inside,
    p: (a: V): V => (inside.has(key(a)) ? p : [0, 0, 0]),
  };
};

/**
 * THE ANNIHILATION LEDGER, run.
 *
 * Every node emits sgn(p·d) into each of the 26 ways out. Two pulses on the
 * same bond, coming at each other, annihilate if their signs are opposite —
 * which is rule (G/1) with the signs kept, and is what `poles` and `ordering`
 * both use. What is left on a bond is what escapes along it.
 */
const ledger = (cells: V[], p: V) => {
  const f = field(cells, p);
  // for each node, and each way out, what it puts into that bond
  const emitted = new Map<string, Map<string, number>>();
  for (const c of cells) {
    const m = new Map<string, number>();
    for (const d of WAYS) m.set(key(d), sgn(dot(f.p(c), unit(d))));
    emitted.set(key(c), m);
  }

  // resolve every bond: node c into direction d meets node c+d coming back
  const survive = new Map<string, Map<string, number>>();
  let annihilated = 0, escaped = 0;
  for (const c of cells) {
    const m = new Map<string, number>();
    for (const d of WAYS) {
      const mine = emitted.get(key(c))!.get(key(d))!;
      const nb: V = [c[0] + d[0], c[1] + d[1], c[2] + d[2]];
      const back = emitted.get(key(nb))?.get(key([-d[0], -d[1], -d[2]])) ?? null;
      if (mine === 0) { m.set(key(d), 0); continue; }
      if (back !== null && back !== 0 && back !== mine) {
        // opposite signs, head on — both destroyed
        m.set(key(d), 0); annihilated++;
      } else {
        m.set(key(d), mine); escaped++;
      }
    }
    survive.set(key(c), m);
  }
  return { survive, annihilated, escaped, emitted };
};

/** −div p by central differences, for comparison */
const divergence = (cells: V[], p: V) => {
  const f = field(cells, p);
  const out = new Map<string, number>();
  const wanted = new Set<string>();
  for (const c of cells)
    for (const d of WAYS) wanted.add(key([c[0] + d[0], c[1] + d[1], c[2] + d[2]]));
  for (const c of cells) wanted.add(key(c));
  for (const k of wanted) {
    const [x, y, z] = k.split(",").map(Number);
    const div =
      (f.p([x + 1, y, z])[0] - f.p([x - 1, y, z])[0]) / 2 +
      (f.p([x, y + 1, z])[1] - f.p([x, y - 1, z])[1]) / 2 +
      (f.p([x, y, z + 1])[2] - f.p([x, y, z - 1])[2]) / 2;
    if (Math.abs(div) > 1e-12) out.set(k, -div);
  }
  return out;
};

const slope = (f: (r: number) => number, r0: number, r1: number) => {
  const xs: number[] = [], ys: number[] = [];
  for (let r = r0; r <= r1; r *= 1.3) {
    const v = Math.abs(f(r));
    if (v > 1e-300) { xs.push(Math.log(r)); ys.push(Math.log(v)); }
  }
  const n = xs.length, mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  return -num / den;
};

export function escapeReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const AXIS: V = [0, 0, 1];
  const cells = block(4, 4);
  const { survive, annihilated, escaped } = ledger(cells, AXIS);
  const div = divergence(cells, AXIS);

  line("=".repeat(78));
  line("1. THE BULK REALLY DOES CANCEL, AND WHAT IS LEFT REALLY IS −div p");
  line("=".repeat(78));
  line();
  line(`     nodes                    ${cells.length}`);
  line(`     pulses emitted           ${cells.length * DEG}`);
  line(`     annihilated head-on      ${annihilated}`);
  line(`     escaped                  ${escaped}`);
  line();
  line("  Now the net escaped charge per node — summed over the directions it");
  line("  got away along — against −div p at that node.");
  line();
  line("     z-layer      Σ escaped        Σ −div p over the layer");
  const layers = [...new Set(cells.map(c => c[2]))].sort((a, b) => b - a);
  let worstLayer = 0;
  for (const z of layers) {
    let esc = 0, dv = 0;
    for (const c of cells) {
      if (c[2] !== z) continue;
      for (const d of WAYS) esc += survive.get(key(c))!.get(key(d))!;
    }
    for (const [k, v] of div) if (Number(k.split(",")[2]) === z) dv += v;
    worstLayer = Math.max(worstLayer, Math.abs(Math.sign(esc) - Math.sign(dv)));
    line(`     ${String(z).padStart(6)}   ${esc.toFixed(1).padStart(11)}   ${dv.toFixed(4).padStart(22)}`);
  }
  line();
  let netEsc = 0;
  for (const c of cells) for (const d of WAYS) netEsc += survive.get(key(c))!.get(key(d))!;
  let netDiv = 0; for (const [, v] of div) netDiv += v;
  line(`     total escaped   ${netEsc.toFixed(6)}        total −div p   ${netDiv.toFixed(6)}`);
  line();
  line("  Both nought, both concentrated on the two end layers, both zero in");
  line("  every interior layer, and the same sign at each end. THE SURFACE");
  line("  DENSITY IS DERIVED: it is not a rule that had to be added, it is what");
  line("  the annihilation ledger leaves behind, and it is Gauss's theorem");
  line("  applied to a bond count.");
  line();
  line("  That is the half of `divp` that was owed, and it is now paid.");

  line();
  line("=".repeat(78));
  line("2. AND IT STILL DOES NOT MAKE A FIELD, FOR THE REASON `departure` GAVE");
  line("=".repeat(78));
  line();
  line("  Because an escaped pulse is still going somewhere. It escaped ALONG A");
  line("  DIRECTION, and a distant observer receives only the pulses that were");
  line("  emitted towards it — which, on a polarised block, means only the face");
  line("  pointing at it.");
  line();

  // directional far field: an observer at x hears node c only via the way out
  // nearest to (x − c), and only if that pulse survived
  const nearest = (d: V): V => {
    let best = WAYS[0], bd = -2;
    for (const w of WAYS) { const t = dot(unit(w), d); if (t > bd) { bd = t; best = w; } }
    return best;
  };
  const directional = (x: V) => {
    let t = 0;
    for (const c of cells) {
      const dv = sub(x, c), r = len(dv);
      if (r < 1e-9) continue;
      const w = nearest(unit(dv));
      t += survive.get(key(c))!.get(key(w))! / (r * r);
    }
    return t;
  };
  // isotropic: the escaped charge is treated as a source that radiates equally
  const isotropic = (x: V) => {
    let t = 0;
    for (const c of cells) {
      const r = len(sub(x, c));
      if (r < 1e-9) continue;
      let s = 0;
      for (const d of WAYS) s += survive.get(key(c))!.get(key(d))!;
      t += s / (r * r);
    }
    return t;
  };

  line("     reading                       far-field exponent    what it is");
  line(`     escaped, kept directional     ${slope(r => directional([0, 0, r]), 200, 3200).toFixed(3).padStart(8)}          a monopole`);
  line(`     escaped, radiated equally     ${slope(r => isotropic([0, 0, r]), 200, 3200).toFixed(3).padStart(8)}          a magnet`);
  line();
  line("     θ         r²·F(r=1000), directional");
  for (const deg of [0, 45, 89, 90, 91, 135, 180]) {
    const th = deg * Math.PI / 180, R = 1000;
    line(`     ${String(deg).padStart(3)}°     ${(directional([R * Math.sin(th), 0, R * Math.cos(th)]) * R * R).toExponential(3)}`);
  }
  line();
  line("  The same flat step at the equator `departure` found, arrived at from");
  line("  the other end. The surface charge is right and the propagation is");
  line("  wrong, and the far field only knows about the propagation.");

  line();
  line("=".repeat(78));
  line("3. SO WHAT IS ACTUALLY OWED, STATED EXACTLY");
  line("=".repeat(78));
  line();
  line("  The gap is one line and it is not the line the arc thought.");
  line();
  line("     DERIVED     that the unpaired emission of a polarised body is a");
  line("                 surface quantity equal to −div p. §1, exactly.");
  line();
  line("     NOT DERIVED that the unpaired emission leaves ISOTROPICALLY. It");
  line("                 does not; it leaves along the bond it escaped on.");
  line();
  line("  And neither existing emission branch supplies it. `sided` is");
  line("  directional by construction — that is §2. The non-sided branch,");
  line("  cos(2πβ), IS isotropic per emitter, which is why `departure` finds it");
  line("  gives 3.000 — but it has no p in it at all, so a uniformly phased");
  line("  block never annihilates and never develops a surface. One branch has");
  line("  the geometry and no field; the other has the field and no geometry.");
  line();
  line("  WHAT WOULD CLOSE IT: an emitter whose emitted sign is isotropic —");
  line("  the same into every direction, so that what leaves is a field — and");
  line("  whose STRENGTH is set by the local −div p rather than per node. Then");
  line("  §1 supplies the source density and the non-sided branch supplies the");
  line("  propagation, and `divp` follows with nothing assumed.");
  line();
  line("     AND THAT IS A RULE THE BOOK HAS ALREADY WRITTEN DOWN ONCE.");
  line();
  line("  The Layer-2 arc's one stated assumption is that Layer 1's emission is");
  line("  sourced by a REGION's total Layer-2 content rather than strand by");
  line("  strand — which is exactly 'the strength is a regional property and");
  line("  the emission is isotropic'. It was introduced to pay the bound-state");
  line("  debt in the quantum arc. It pays this one too.");
  line();
  line("  So the two open assumptions in this book are ONE assumption, and it");
  line("  is worth more than either arc claimed for it: regional sourcing gives");
  line("  the bound state its single train, AND gives magnetism its poles.");

  return L.join("\n");
}

console.log(escapeReport());
