/**
 * WHAT DOES THE COUPLING LOCK — the emitted sign, or the polarisation?
 *
 * `domains` §2 flags this as the fork that decides the physics and settles it
 * by preference: the sign reading gives a body of like signs, which `departure`
 * shows is not even a field, so take the polarisation reading. That is an
 * argument from consequence and not from the mechanism.
 *
 * `response` settles it from the mechanism, and did so without meaning to. The
 * thing it measures is the FIRST MOMENT of the annihilation density about a
 * source's own axis — that is a torque on the axis, not a shift of a sign. So
 * what the coupling acts on is the direction the source points, which is the
 * polarisation. The fork is closed, and closed the right way.
 *
 * That closes item 3 and immediately opens the question this file is really
 * about, because a torque on a direction is a different kind of object from a
 * drive on a phase:
 *
 *   §1  the torque, and that it is a torque
 *   §2  which removes the retardation problem — a held axis has no ω, so
 *       ω·r is nought at every distance and there is no coherence ceiling.
 *       AND THEREFORE NO DOMAIN PREDICTION. `domainsize` shows why that is a
 *       relief rather than a loss.
 *   §3  and then the test that decides whether any of this is a ferromagnet:
 *       does the torque depend on the BOND DIRECTION? Dipolar does, which is
 *       why dipolar picks closure over alignment. IT DOES — strongly, with a
 *       cosine component across the axes and no coupling at all out of the
 *       plane — so it is not an exchange.
 *   §4  and relaxed with the measured torque rather than a model of it, a
 *       block does not become uniformly polarised under either sign. The
 *       ordering is still owed, and now precisely: `divp` needs a uniform p
 *       and both couplings the model supplies choose closure instead.
 */

const TAU = Math.PI * 2;

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V): V => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sgn = (x: number) => (Math.abs(x) < 1e-9 ? 0 : x > 0 ? 1 : -1);

/** an axis in the xy-plane, at angle a in turns */
const ax = (a: number): V => [Math.cos(TAU * a), Math.sin(TAU * a), 0];

const around = (c: V, R: number): V[] => {
  const out: V[] = [];
  const r = Math.ceil(R);
  for (let x = -r; x <= r; x++) for (let y = -r; y <= r; y++) for (let z = -r; z <= r; z++) {
    const d = Math.hypot(x, y, z);
    if (d > 0.5 && d <= R) out.push([c[0] + x, c[1] + y, c[2] + z]);
  }
  return out;
};

const NEAR = around([0, 0, 0], 4);

/**
 * The torque on a source at the origin pointing along `an`, from a source at
 * `at` pointing along `am`. Same annihilation rule as `escape` and `response`:
 * where the two disagree about a cell's sign, space is destroyed there, and the
 * first moment of that about n's own axis is what turns n.
 */
const torque = (an: V, at: V, am: V) => {
  let moment = 0;
  for (const y of NEAR) {
    const dn = unit(y), dm = unit(sub(y, at));
    const sn = sgn(dot(an, dn)), sm = sgn(dot(am, dm));
    if (sn === 0 || sm === 0 || sn === sm) continue;
    const w = 1 / (len(sub(y, at)) ** 2);
    moment += w * (an[0] * dn[1] - an[1] * dn[0]);
  }
  return moment;
};

const harmonics = (f: (d: number) => number, n = 720) => {
  let s = 0, c = 0, mean = 0, s2 = 0;
  for (let i = 0; i < n; i++) {
    const d = i / n, v = f(d);
    mean += v / n;
    s += 2 * v * Math.sin(TAU * d) / n;
    c += 2 * v * Math.cos(TAU * d) / n;
    s2 += 2 * v * Math.sin(2 * TAU * d) / n;
  }
  return { mean, sin: s, cos: c, sin2: s2 };
};

let seed = 20260815;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

export function alignReport(): string {
  const L: string[] = [];
  const line = (s = "") => L.push(s);
  const R = 8;

  line("=".repeat(78));
  line("1. IT IS A TORQUE ON THE AXIS, SO WHAT LOCKS IS THE POLARISATION");
  line("=".repeat(78));
  line();
  line("  `response` measures the first moment of the annihilation density");
  line("  about a source's own axis. A moment about an axis is a torque on it.");
  line("  Nothing in it touches the emitted sign — the sign is sgn(axis·d) and");
  line("  follows the axis, rather than the other way round.");
  line();
  line("     SO THE FORK IS CLOSED FROM THE MECHANISM. What the coupling acts");
  line("     on is the polarisation vector, not the emitted sign. The sign");
  line("     stays −div p, and the monopole branch of `domains` §2 is not a");
  line("     branch the model has.");
  line();
  line("  `domains` §2 got the right answer for a weaker reason, and this is");
  line("  the reason. Note what this does NOT yet say: that the polarisation");
  line("  ends up uniform. §3 and §4 are about that, and the answer there is no.");

  line();
  line("=".repeat(78));
  line("2. AND A DIRECTION HAS NO ω, SO THE RETARDATION PROBLEM GOES");
  line("=".repeat(78));
  line();
  line("  This is the part that matters, and it cuts both ways.");
  line();
  line("  `domains` §4 derives a coherence ceiling from the lag: the coupling is");
  line("  sin(2π(βₘ − βₙ) − ω·r), the lag grows with distance, and order");
  line("  collapses at ω·L ≈ π. That argument needs a β that is RUNNING. A");
  line("  source whose axis is HELD has no β — `physics.ts` distinguishes the");
  line("  two outright, `sided` with an axis and no `turning` — so ω = 0, the");
  line("  lag term is nought at every distance, and there is no ceiling.");
  line();
  line("     held axis      a static torque between two directions, no lag");
  line("     turning axis   the same torque with Δβ → Δβ − ω·r, and a ceiling");
  line("                    at L ≈ π/ω");
  line();
  line("  `domainsize` shows what the ceiling is worth if it applies: 10⁻¹⁹ m");
  line("  for an iron atom against 10⁻⁵ m measured, and 10⁻³⁴ m on the turn");
  line("  clock. So a magnet made of TURNING sources cannot order across even");
  line("  one atomic spacing, and is not a magnet.");
  line();
  line("     WHICH IS THE ANSWER: a magnet is made of HELD sources. The domain");
  line("     prediction is not a prediction of this model, because the ceiling");
  line("     it comes from applies to a kind of source a magnet is not made of.");
  line();
  line("  That is a loss and it is the right kind of loss — the alternative was");
  line("  a prediction wrong by fourteen orders of magnitude. What survives is");
  line("  a genuine constraint on the other kind of source: anything in this");
  line("  model whose emission is phase-coherent cannot stay coherent past half");
  line("  its own wavelength.");

  line();
  line("=".repeat(78));
  line("3. SO DOES IT ALIGN — AND DOES IT DEPEND ON THE BOND DIRECTION?");
  line("=".repeat(78));
  line();
  line("  This is the test that decides whether the model has a ferromagnet in");
  line("  it at all, and it is one question. Dipolar coupling has the bond");
  line("  direction in it — the 3(m·r̂)(m·r̂) term — and that is exactly why");
  line("  `domains` §1 finds it picks closure over alignment. A coupling with");
  line("  NO bond direction in it is an exchange, and exchange aligns.");
  line();
  line("  So: hold n along x̂, put m at distance 8 in various directions, and");
  line("  sweep m's axis.");
  line();
  line("     bond direction     sin component    cos    2nd harmonic   zero at");
  const dirs: [string, V][] = [
    ["+x  (along n)", [1, 0, 0]],
    ["+y  (across n)", [0, 1, 0]],
    ["+z  (out of plane)", [0, 0, 1]],
    ["+x+y (diagonal)", [1, 1, 0]],
  ];
  const sins: number[] = [];
  for (const [name, d] of dirs) {
    const at = mul(unit(d), R);
    const h = harmonics(a => torque(ax(0), at, ax(a)));
    sins.push(h.sin);
    // where the torque vanishes with a restoring slope
    let zero = "—";
    const N = 2000;
    for (let i = 0; i < N; i++) {
      const a0 = i / N, a1 = (i + 1) / N;
      const t0 = torque(ax(0), at, ax(a0)), t1 = torque(ax(0), at, ax(a1));
      if (t0 === 0 && t1 === 0) continue;
      if (t0 <= 0 && t1 > 0) { zero = (a0 * 360).toFixed(0) + "°"; break; }
    }
    line(`     ${name.padEnd(20)}${h.sin.toExponential(3).padStart(11)}` +
      `${h.cos.toExponential(1).padStart(11)}${h.sin2.toExponential(1).padStart(15)}    ${zero}`);
  }
  const spread = (Math.max(...sins.map(Math.abs)) - Math.min(...sins.map(Math.abs)))
    / Math.max(...sins.map(Math.abs));
  line();
  line(`     spread in |sin| across bond directions   ${(spread * 100).toFixed(1)}%`);
  line();
  line("  IT DOES DEPEND ON THE BOND DIRECTION, AND STRONGLY. Read the row");
  line("  for +y: the sine component is nought and the whole torque is a");
  line("  COSINE, which means it does not vanish when the two axes agree —");
  line("  aligned is not even an equilibrium for a transverse bond. Read the");
  line("  row for +z: the torque vanishes altogether, so two sources stacked");
  line("  perpendicular to the plane their axes turn in do not talk at all.");
  line("  And the diagonal carries both components at once.");
  line();
  line("  So this is not an exchange. It has the same kind of angular structure");
  line("  dipolar has — the structure that makes `domains` §1 pick closure over");
  line("  alignment — and the guess that it would be direction-free is wrong.");
  line();
  line("  Which means §4 cannot be done with a model coupling. It has to be");
  line("  done with this one.");

  line();
  line("=".repeat(78));
  line("4. RELAXED ON A BLOCK, WITH THE MEASURED TORQUE AND NOT A MODEL OF IT");
  line("=".repeat(78));
  line();
  line("  Axes confined to the xy-plane, a 3³ block, every pair coupled by the");
  line("  torque as measured — tabulated over both axis angles for every bond");
  line("  offset in the block, so the bond direction is carried exactly.");
  line();

  const S = 3, H = (S - 1) / 2, NB = 36;
  const sites: V[] = [];
  for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) for (let k = 0; k < S; k++)
    sites.push([i - H, j - H, k - H]);

  // T[offsetKey][bn][bm] — the torque on n at the origin from m at the offset
  const table = new Map<string, Float64Array>();
  const okey = (d: V) => `${d[0]},${d[1]},${d[2]}`;
  for (const a of sites) for (const b of sites) {
    const d = sub(b, a);
    if (!d[0] && !d[1] && !d[2]) continue;
    const k = okey(d);
    if (table.has(k)) continue;
    const t = new Float64Array(NB * NB);
    for (let p = 0; p < NB; p++) for (let q = 0; q < NB; q++)
      t[p * NB + q] = torque(ax(p / NB), d, ax(q / NB));
    table.set(k, t);
  }
  line(`     distinct bond offsets tabulated   ${table.size}`);
  line(`     axis-angle grid                   ${NB} × ${NB}`);
  line();

  const relax = (K: number, steps = 4000) => {
    const a = sites.map(() => Math.floor(rnd() * NB));
    for (let t = 0; t < steps; t++) {
      const na = a.slice();
      for (let i = 0; i < sites.length; i++) {
        let s = 0;
        for (let j = 0; j < sites.length; j++) {
          if (i === j) continue;
          const tb = table.get(okey(sub(sites[j], sites[i])))!;
          s += tb[a[i] * NB + a[j]];
        }
        // one step of the axis, in whole grid cells, in the direction of the torque
        const push = K * s;
        if (Math.abs(push) > 1e-9) na[i] = (a[i] + (push > 0 ? 1 : -1) + NB) % NB;
      }
      for (let i = 0; i < a.length; i++) a[i] = na[i];
    }
    let c = 0, sn = 0;
    for (const x of a) { c += Math.cos(TAU * x / NB); sn += Math.sin(TAU * x / NB); }
    return { order: Math.hypot(c, sn) / a.length, a };
  };

  line("        K        net polarisation |⟨p̂⟩|      state");
  seed = 20260815; const up = relax(+1);
  seed = 20260815; const dn = relax(-1);
  for (const [nm, r] of [["+1", up], ["−1", dn]] as [string, { order: number }][])
    line(`     ${nm.padEnd(17)}${r.order.toFixed(4)}` +
      `                 ${r.order > 0.9 ? "uniform — a ferromagnet" : r.order > 0.4 ? "partly ordered" : "no net polarisation"}`);
  line();
  line("  Neither sign gives a uniform state. The coupling has too much angular");
  line("  structure in it: a bond across the axes pushes even when they agree,");
  line("  and a bond out of the plane does not push at all, so the block cannot");
  line("  settle on one direction the way a pure sin(Δ) coupling does.");
  line();
  line("     WHICH PUTS THE ORDERING BACK WHERE `domains` §1 LEFT IT. Dipolar");
  line("     fails because it favours closure; the annihilation torque fails");
  line("     for the same reason and by the same mechanism, and it is the same");
  line("     reason real ferromagnetism needs exchange rather than either.");
  line();
  line("  So the honest ledger for the ordering is worse than `domains` reads");
  line("  it, and better specified:");
  line();
  line("     DERIVED       that a coupling exists, that it is odd in the phase");
  line("                   difference, that it acts on the polarisation and not");
  line("                   on the sign, and that it carries the 1/r² the");
  line("                   emission already had. `response`, and §1 here.");
  line();
  line("     MEASURED, AND NEGATIVE   that this coupling does not produce a");
  line("                   uniformly polarised body, because its angular");
  line("                   structure favours closure exactly as dipolar does.");
  line();
  line("     STILL OWED    a coupling that aligns. Nothing in the model supplies");
  line("                   one, and the two candidates it does supply both");
  line("                   choose closure. `divp` needs a uniform p and the");
  line("                   model does not yet produce one.");

  return L.join("\n");
}

console.log(alignReport());
