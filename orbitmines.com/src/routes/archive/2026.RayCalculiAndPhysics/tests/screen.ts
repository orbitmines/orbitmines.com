/**
 * THE FEEDBACK RULES WITH SCREENING PUT BACK — which is what they were missing.
 *
 * `extrapolate` refutes all three axis-feedback rules on two counts: the read
 * diverges with sample size, so none is a local law; and none can hold an
 * antiferromagnet, because all three encode plain agreement and agreement can
 * only make alignment.
 *
 * BOTH OF THOSE ARE ARTEFACTS OF LEAVING SOMETHING OUT. Every read there was a
 * bare Σ over neighbours — every source heard every other, through whatever was
 * in between, as if the space were empty. The model does not say that.
 * `gravity.ts` has, in the pull itself:
 *
 *     screen = Π_c through(m_c, ⊥ to a→b)      what a third body shadows
 *     S(a,b) = BITE·share·screen·m_a·m_b·EMIT²·met(R·GRAIN)·GRAIN³
 *
 * A third body standing in the way blocks the interaction. And on the MAGNETIC
 * side the blocking is orientation-dependent, because a pulse is only destroyed
 * by an OPPOSITE sign — so what gets through from j to i depends on how the
 * sources in between are pointed.
 *
 * That is a coupling that depends on the local composition, which is the shape
 * of the thing `extrapolate` §5 said the family did not have. It half works.
 *
 *   §1  screening makes the read CONVERGE. `extrapolate` §1's refutation was
 *       measured on a rule with the model's own `screen` deleted, and it is
 *       withdrawn — the locality problem was self-inflicted.
 *   §2  but it does NOT admit an antiferromagnet. `extrapolate` §4 stands, and
 *       screening makes the ferromagnet worse rather than buying anything.
 *   §3  and the reason is structural rather than a matter of tuning: a shadow
 *       is a product of factors in [0,1], so it ATTENUATES and cannot INVERT.
 *       Composition-dependent attenuation is not a sign change.
 *   §4  what is left.
 */

const TAU = Math.PI * 2;

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const WAYS: V[] = (() => {
  const out: V[] = [];
  for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++)
    if (x || y || z) out.push([x, y, z]);
  return out;
})();
const UWAYS = WAYS.map(unit);

let seed = 20260816;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const reseed = () => { seed = 20260816; };

const RING = 8;
const ax = (k: number): V => [Math.cos(TAU * k / RING), Math.sin(TAU * k / RING), 0];

const emitted = (p: V, u: V) => {
  let best = 0, bd = -2;
  for (let i = 0; i < UWAYS.length; i++) { const c = dot(UWAYS[i], u); if (c > bd) { bd = c; best = i; } }
  const s = dot(p, UWAYS[best]);
  return Math.abs(s) < 1e-9 ? 0 : s > 0 ? 1 : -1;
};

const cube = (L: number): V[] => {
  const out: V[] = [];
  const h = (L - 1) / 2;
  for (let i = 0; i < L; i++) for (let j = 0; j < L; j++) for (let k = 0; k < L; k++)
    out.push([i - h, j - h, k - h]);
  return out;
};

/**
 * Who stands between i and j, and where.
 *
 * A source k shadows the i–j path if it lies within `WIDTH` of the segment and
 * between the two ends. Precomputed once per geometry, because the geometry
 * does not change — only the orientations do, and those are what decide whether
 * a shadow actually blocks anything.
 */
const WIDTH = 1.2;
const blockers = (at: V[]) => {
  const N = at.length;
  const out: number[][][] = Array.from({ length: N }, () => Array.from({ length: N }, () => [] as number[]));
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    if (i === j) continue;
    const d = sub(at[j], at[i]), R = len(d);
    if (R < 1e-9) continue;
    const u = unit(d);
    for (let k = 0; k < N; k++) {
      if (k === i || k === j) continue;
      const w = sub(at[k], at[i]);
      const t = dot(w, u);
      if (t <= 0.5 || t >= R - 0.5) continue;              // not between them
      const perp = Math.hypot(w[0] - t * u[0], w[1] - t * u[1], w[2] - t * u[2]);
      if (perp <= WIDTH) out[i][j].push(k);
    }
  }
  return out;
};

/**
 * How much of j's pulse reaches i.
 *
 * The pulse carries sign s. A blocker k destroys it only if what k is putting
 * into that stretch of the path is the OPPOSITE sign — which is rule (G/1), and
 * is what makes this depend on how the neighbourhood is pointed rather than
 * only on how much of it there is.
 */
const ABSORB = 0.6;
const transmit = (s: number, ks: number[], k: number[], at: V[], i: number, j: number) => {
  let T = 1;
  const u = unit(sub(at[j], at[i]));
  for (const b of ks) {
    // what b emits into the path — towards the midpoint of the stretch it shadows
    const sb = emitted(ax(k[b]), u);
    if (sb !== 0 && sb !== s) T *= (1 - ABSORB);
    if (T < 1e-4) break;
  }
  return T;
};

/** the "agree with neighbours" read, with and without the shadow */
const readWith = (cand: V, i: number, at: V[], k: number[], bl: number[][][] | null) => {
  let acc = 0;
  for (let j = 0; j < at.length; j++) {
    if (i === j) continue;
    const d = sub(at[i], at[j]), r = len(d);
    if (r < 1e-9) continue;
    const u = unit(d);
    const sj = emitted(ax(k[j]), u), si = emitted(cand, u);
    if (sj === 0 || si === 0) continue;
    const T = bl ? transmit(sj, bl[i][j], k, at, i, j) : 1;
    acc += sj * si * T / (r * r);
  }
  return acc;
};

const settle = (at: V[], bl: number[][][] | null, start?: number[], steps = 150) => {
  const k = start ? start.slice() : at.map(() => Math.floor(rnd() * RING));
  for (let t = 0; t < steps; t++) {
    let moved = 0;
    for (let i = 0; i < at.length; i++) {
      let best = k[i], bd = -Infinity;
      for (let c = 0; c < RING; c++) {
        const v = readWith(ax(c), i, at, k, bl);
        if (v > bd) { bd = v; best = c; }
      }
      if (best !== k[i]) { k[i] = best; moved++; }
    }
    if (!moved) break;
  }
  return k;
};

const order = (at: V[], k: number[]) => {
  let c = 0, s = 0, ca = 0, sa = 0;
  at.forEach((p, i) => {
    const par = ((Math.round(p[0]) + Math.round(p[1]) + Math.round(p[2])) % 2 + 2) % 2 ? -1 : 1;
    c += Math.cos(TAU * k[i] / RING); s += Math.sin(TAU * k[i] / RING);
    ca += par * Math.cos(TAU * k[i] / RING); sa += par * Math.sin(TAU * k[i] / RING);
  });
  const n = at.length;
  return { ferro: Math.hypot(c, s) / n, anti: Math.hypot(ca, sa) / n };
};

export function screenReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);

  line("=".repeat(78));
  line("1. SCREENING MAKES THE READ CONVERGE");
  line("=".repeat(78));
  line();
  line("  `extrapolate` §1 measured the read at the centre of a uniformly");
  line("  polarised block growing without bound with the block. It was summing");
  line("  every source through solid matter. Put the shadow back:");
  line();
  line("     block L      bare read     screened read");
  for (const Lb of [3, 5, 7, 9]) {
    const at = cube(Lb);
    const k = at.map(() => 0);
    let mid = 0;
    for (let i = 0; i < at.length; i++) if (len(at[i]) < 1e-9) mid = i;
    const bare = readWith(ax(0), mid, at, k, null);
    const bl = blockers(at);
    const scr = readWith(ax(0), mid, at, k, bl);
    line(`     ${String(Lb).padStart(7)}   ${bare.toFixed(2).padStart(11)}   ${scr.toFixed(4).padStart(13)}`);
  }
  line();
  line("  The bare read grows without limit and the screened one settles. A");
  line("  source at the middle of a magnet hears its own neighbourhood and not");
  line("  the far side of the body, which is what a local law looks like.");
  line();
  line("     SO THE DIVERGENCE WAS SELF-INFLICTED. `extrapolate` §1 refuted a");
  line("     rule the model does not have — one with no `screen` in it — and");
  line("     the screening length it wanted is not an extra assumption, it is");
  line("     the shadow the pull already carries.");

  line();
  line("=".repeat(78));
  line("2. BUT IT DOES NOT ADMIT AN ANTIFERROMAGNET");
  line("=".repeat(78));
  line();
  line("  Which is the test that mattered. Seed a two-sublattice");
  line("  antiferromagnet and iterate, bare and screened.");
  line();
  const at5 = cube(5);
  const bl5 = blockers(at5);
  const antiStart = at5.map(p => {
    const par = ((Math.round(p[0]) + Math.round(p[1]) + Math.round(p[2])) % 2 + 2) % 2;
    return par ? 4 : 0;
  });
  line("     start            reading      ferro     anti     survives?");
  for (const [nm, bl] of [["bare", null], ["screened", bl5]] as [string, number[][][] | null][]) {
    const k = settle(at5, bl, antiStart);
    const o = order(at5, k);
    line(`     seeded anti      ${nm.padEnd(11)}${o.ferro.toFixed(3).padStart(7)}` +
      `${o.anti.toFixed(3).padStart(9)}     ${o.anti > 0.9 ? "YES" : o.anti > 0.4 ? "partly" : "no — collapses"}`);
  }
  line();
  line("  And from random, to see which state the screened rule chooses when");
  line("  it is not told:");
  line();
  for (const [nm, bl] of [["bare", null], ["screened", bl5]] as [string, number[][][] | null][]) {
    reseed();
    const k = settle(at5, bl);
    const o = order(at5, k);
    line(`     from random      ${nm.padEnd(11)}${o.ferro.toFixed(3).padStart(7)}` +
      `${o.anti.toFixed(3).padStart(9)}     ` +
      (o.ferro > 0.9 ? "ferromagnet" : o.anti > 0.9 ? "ANTIFERROMAGNET" : "neither"));
  }
  line();
  line("     IT DOES NOT. The seeded antiferromagnet still collapses, and from");
  line("     random the screened rule reaches neither state — a partly ordered");
  line("     mess at 0.355. So `extrapolate` §4 STANDS: screening does not buy");
  line("     an antiferromagnet, and it makes the ferromagnet worse.");

  line();
  line("=".repeat(78));
  line("3. AND THE REASON IS STRUCTURAL: A SHADOW CAN ONLY SUBTRACT");
  line("=".repeat(78));
  line();
  line("  Take a source and a partner at increasing separation, with the matter");
  line("  in between in a given state, and ask what the partner is worth.");
  line();
  line("     separation    coupling, ferro surroundings   anti surroundings");
  {
    const at = cube(7);
    let mid = 0;
    for (let i = 0; i < at.length; i++) if (len(at[i]) < 1e-9) mid = i;
    const bl = blockers(at);
    for (const R of [1, 2, 3]) {
      let target = -1;
      for (let i = 0; i < at.length; i++)
        if (Math.abs(at[i][0] - R) < 1e-9 && Math.abs(at[i][1]) < 1e-9 && Math.abs(at[i][2]) < 1e-9) target = i;
      if (target < 0) continue;
      const vals: string[] = [];
      for (const kind of ["ferro", "anti"]) {
        const k = at.map(p => kind === "ferro" ? 0
          : (((Math.round(p[0]) + Math.round(p[1]) + Math.round(p[2])) % 2 + 2) % 2 ? 4 : 0));
        const withT = k.slice(); withT[target] = 0;
        const flipT = k.slice(); flipT[target] = 4;
        const a = readWith(ax(0), mid, at, withT, bl);
        const b = readWith(ax(0), mid, at, flipT, bl);
        vals.push((a - b).toExponential(2).padStart(14));
      }
      line(`     ${String(R).padStart(10)}    ${vals.join("   ")}`);
    }
  }
  line();
  line("  POSITIVE EVERYWHERE, in both surroundings, at every separation. The");
  line("  surroundings change the SIZE — an anti neighbourhood cuts the reach");
  line("  of a distant partner by two orders — and never the SIGN.");
  line();
  line("  Which could not have gone otherwise, and this is the part worth");
  line("  keeping. Screening here is a product of transmission factors, each in");
  line("  [0, 1]:");
  line();
  line("     T = Π (1 − absorb)        T ∈ [0, 1], always");
  line();
  line("  A quantity multiplied by something between nought and one gets");
  line("  smaller. IT CANNOT CHANGE SIGN. So composition-dependent SCREENING is");
  line("  a composition-dependent ATTENUATION, and an attenuation is not the");
  line("  dependence an antiferromagnet needs.");
  line();
  line("  RKKY changes sign because the conduction electrons carry a PHASE that");
  line("  winds with distance, so a shell can be out of step rather than merely");
  line("  quieter. The dipolar term changes sign because of the");
  line("  3(m·r̂)(m·r̂) geometry, which is a projection and can be negative.");
  line("  Neither is a shadow, and a shadow cannot imitate either.");

  line();
  line("=".repeat(78));
  line("4. WHAT IS RECOVERED AND WHAT IS NOT");
  line("=".repeat(78));
  line();
  line("     RECOVERED   `extrapolate` §1. The read converges once the model's");
  line("                 own `screen` is in it, so the locality refutation was");
  line("                 measured on a rule the model does not have. And the");
  line("                 screening length `exchange` §3 and `extrapolate` §1");
  line("                 both wished for is not an extra assumption — it is the");
  line("                 shadow the pull already carries.");
  line();
  line("     NOT RECOVERED   `extrapolate` §4. Screening does not buy an");
  line("                 antiferromagnet, and it costs some of the ferromagnet:");
  line("                 order from random drops from 1.000 to 0.355. So the");
  line("                 family is now ferromagnet-or-mess rather than");
  line("                 ferromagnet-or-nothing, which is not an improvement.");
  line();
  line("     AND THE REASON IS NOT TUNING. §3 is an argument, not a fit: T is a");
  line("                 product of factors in [0,1], so no width and no");
  line("                 absorption makes it negative. Sweeping the two");
  line("                 parameters would be wasted work.");
  line();
  line("  SO THE COMPOSITION DEPENDENCE IS REAL AND IT IS THE WRONG KIND. What");
  line("  the shadow gives is a coupling whose STRENGTH depends on what is in");
  line("  between — which is genuinely a dependence on the other sources, and");
  line("  is exactly what fixes locality. What an antiferromagnet needs is a");
  line("  coupling whose SIGN does, and subtraction cannot produce that however");
  line("  it is arranged.");
  line();
  line("  WHERE A SIGN COULD COME FROM, given the model as it stands:");
  line();
  line("     · THE PHASE. `ring` gives every source a position on an 8-member");
  line("       ring and `domains` gives the arriving signal a lag ω·r. A");
  line("       partner one half-wavelength away arrives in antiphase, which is");
  line("       a sign change with distance and is the RKKY mechanism in the");
  line("       model's own vocabulary. `domainsize` measured that wavelength as");
  line("       far too short — 10⁻¹⁹ m — so it does not reach an atomic");
  line("       neighbour, but the STRUCTURE is there and nothing else in the");
  line("       model has it.");
  line();
  line("     · THE SPACE READING. `exchange` §2 measured ferro along a bond and");
  line("       anti across one, which is a sign that depends on geometry. It was");
  line("       set aside because it gives 1/R rather than Newton's 1/R², and");
  line("       that objection stands — but it is the only other place in this");
  line("       book where a magnetic sign changes at all.");
  line();
  line("  Both are already in the ledger and neither is available as written.");
  line("  That is the state of it: the model has two candidate sign-changing");
  line("  mechanisms, one with the wrong length scale and one with the wrong");
  line("  force law, and a shadow that fixes locality and nothing else.");

  return L.join("\n");
}

console.log(screenReport());
