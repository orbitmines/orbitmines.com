/**
 * WHAT THE LAWS LOOK LIKE IF THE FIELD IS VEINED — every prediction re-read with
 * the angular structure left in, instead of averaged over a shell.
 *
 * `chance(m,r)` divides by 4πr², a shell average, and every number the article
 * publishes is read off that. `veins` measured what the average is an average
 * OVER: ridges along the lattice headings and thin wedges between them, peak
 * over mean about 4.2 at the rounding w, scale free in radius. Nothing that has
 * been tested so far can see it, because every existing test is a RADIAL number
 * and the angular structure integrates out of all of them.
 *
 * So the question this file asks is the one that was left open: if the field
 * really is veined, what does each law become, and what does each measurement
 * then say about it. The force law becomes
 *
 *     g(r, θ) = F(θ) · GM/r²        with ⟨F⟩ = 1 over angle
 *
 * — the radial exponent is untouched, the shell average is untouched, and what
 * is new is that F swings by a factor of a few DEPENDING ON WHICH WAY YOU LOOK,
 * with the pattern fixed to the lattice rather than to the source.
 *
 * THE ONE THING THAT SOFTENS IT is source extent. A ridge points along the
 * lattice, not away from the emitter, so ridges from different parts of an
 * extended body are PARALLEL and stack rather than cancel — but a body of
 * radius Rs seen from distance r does smooth structure finer than Rs/r. That is
 * measured here rather than assumed, and it is the whole reason the answer
 * differs between the Solar System and a galaxy: the Sun at one au is a point
 * and a disc at one effective radius is not.
 *
 * Run: ./run.sh veined
 */

// ─────────────────────────────────────────────────────────────────────────────
// the lattice and the shipped rule, own copy

const DIRS_V: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];
const SHIP_W_V = 2 * (1 - Math.SQRT1_2);

const waysOfV = (h: [number, number]): [number, number][] => {
  const out: [number, number][] = [];
  for (let a = 0; a < 2; a++) {
    if (h[a]) out.push(a === 0 ? [h[0], 0] : [0, h[1]]);
    else for (const s of [1, -1] as const) out.push(a === 0 ? [s, h[1]] : [h[0], s]);
  }
  return out;
};

const kernelOfV = (h: [number, number], w: number): [number, number][] => {
  const idx = (d: [number, number]) => DIRS_V.findIndex(e => e[0] === d[0] && e[1] === d[1]);
  const acc = new Map<number, number>();
  acc.set(idx(h), 1 - w);
  const alt = waysOfV(h);
  for (const d of alt) acc.set(idx(d), (acc.get(idx(d)) ?? 0) + w / alt.length);
  return [...acc].filter(([, p]) => p > 0);
};

// ─────────────────────────────────────────────────────────────────────────────
// the field of a body of radius Rs, in cells

const NB_V = 360;
const angleBinV = (x: number, y: number) =>
  Math.min(NB_V - 1, Math.floor(((Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * NB_V));

/**
 * Steady-state occupancy from every cell of a disk of radius Rs, each pulsing
 * into all eight headings every tick — a body radiating isotropically. The
 * heading a charge left with is remembered and only the step deviates, which is
 * what `discrete.ts` does and what `veins` showed is required for anything to
 * propagate ballistically at all.
 */
const fieldOf = (T: number, Rs: number, w = SHIP_W_V) => {
  const N = 2 * T + 3, o = T + 1, S = N * N;
  let cur = new Float64Array(S * 8), nxt = new Float64Array(S * 8);
  const occ = new Float64Array(S);
  const K = DIRS_V.map(h => kernelOfV(h, w));

  const emit: [number, number][] = [];
  for (let y = -Rs; y <= Rs; y++) for (let x = -Rs; x <= Rs; x++)
    if (x * x + y * y <= Rs * Rs) emit.push([x, y]);
  const inj = 1 / (8 * emit.length);

  for (let t = 1; t <= T; t++) {
    nxt.fill(0);
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < N - 1; x++) {
      const c = (y * N + x) * 8;
      for (let h = 0; h < 8; h++) {
        const v = cur[c + h];
        if (v === 0) continue;
        for (const [i, p] of K[h])
          nxt[(((y + DIRS_V[i][1]) * N + (x + DIRS_V[i][0])) * 8) + h] += v * p;
      }
    }
    for (const [ex, ey] of emit)
      for (let h = 0; h < 8; h++) nxt[(((o + ey) * N + (o + ex)) * 8) + h] += inj;
    const tmp = cur; cur = nxt; nxt = tmp;
    for (let k = 0; k < S; k++) {
      let s = 0;
      for (let h = 0; h < 8; h++) s += cur[k * 8 + h];
      occ[k] += s;
    }
  }
  return { T, N, o, occ, emit: emit.length };
};

/** F(θ) at radius r: the field over its own mean at that radius, ⟨F⟩ = 1 */
const Ftheta = (f: ReturnType<typeof fieldOf>, r: number, dr = 1.5) => {
  const sum = new Float64Array(NB_V), cnt = new Float64Array(NB_V);
  for (let y = -f.T; y <= f.T; y++) for (let x = -f.T; x <= f.T; x++) {
    const R = Math.hypot(x, y);
    if (R < r - dr || R > r + dr) continue;
    const b = angleBinV(x, y);
    sum[b] += f.occ[(y + f.o) * f.N + (x + f.o)]; cnt[b] += 1;
  }
  const out: number[] = [];
  for (let b = 0; b < NB_V; b++) if (cnt[b] > 0) out.push(sum[b] / cnt[b]);
  const m = out.reduce((a, c) => a + c, 0) / out.length;
  return out.map(v => v / m);
};

const spreadV = (F: number[]) => {
  const s = F.slice().sort((a, b) => a - b);
  const q = (f: number) => s[Math.round(f * (s.length - 1))];
  return { peak: q(1), dead: q(0), p95: q(0.95), p05: q(0.05),
    rms: Math.sqrt(F.reduce((a, v) => a + (v - 1) ** 2, 0) / F.length) };
};

// ─────────────────────────────────────────────────────────────────────────────
// how much source extent buys

console.log("WHAT THE LAWS LOOK LIKE IF THE FIELD IS VEINED\n");
console.log("─".repeat(84));
console.log("1. HOW MUCH AN EXTENDED SOURCE SMOOTHS IT");
console.log("   F(θ) is the field over its own shell mean, so ⟨F⟩ = 1 by construction");
console.log("   and everything below is purely the angular structure the shell average");
console.log("   is hiding. Rs/r is the body's radius over the distance it is seen from.\n");

const T = 120, RPROBE = 55;

/**
 * Sampled rather than fitted. An exponential in Rs/r was tried first and is not
 * good enough to hang a table on — the curve is much steeper than exponential
 * near zero and much flatter past a half, and one decay constant misses by 0.38
 * on a range of 3.3. So the curve is measured on a grid and read off by
 * interpolating log(peak − 1), which is smooth in Rs/r and exact at every
 * sampled point by construction.
 */
const XS = [0, 1, 3, 5, 8, 11, 14, 17, 22, 28, 36, 44, 55];
const CURVE: { x: number, peak: number, p95: number, p05: number, dead: number }[] = [];

console.log("    Rs/r     peak      p95      p05     dead      rms");
for (const Rs of XS) {
  const F = Ftheta(fieldOf(T, Rs), RPROBE);
  const st = spreadV(F);
  CURVE.push({ x: Rs / RPROBE, peak: st.peak, p95: st.p95, p05: st.p05, dead: st.dead });
  console.log("  " + (Rs / RPROBE).toFixed(3).padStart(7)
    + [st.peak, st.p95, st.p05, st.dead, st.rms].map(v => v.toFixed(4).padStart(9)).join(""));
}

/** read the curve at any Rs/r, interpolating log(v − 1) for the ridge side and
 *  log(1 − v) for the wedge side, so both approach 1 smoothly and neither can
 *  overshoot past it */
const readAt = (x: number, key: "peak" | "p95" | "p05" | "dead") => {
  if (x <= CURVE[0].x) return CURVE[0][key];
  const last = CURVE[CURVE.length - 1];
  if (x >= last.x) return last[key];
  let i = 0;
  while (i < CURVE.length - 2 && CURVE[i + 1].x < x) i++;
  const A = CURVE[i], B = CURVE[i + 1];
  const f = (x - A.x) / (B.x - A.x);
  const up = A[key] > 1;
  const g = (v: number) => Math.log(Math.max(up ? v - 1 : 1 - v, 1e-12));
  const lv = g(A[key]) + f * (g(B[key]) - g(A[key]));
  return up ? 1 + Math.exp(lv) : 1 - Math.exp(lv);
};

console.log("\n  a point source keeps the whole " + CURVE[0].peak.toFixed(2) + "× on the ridge and drops to "
  + CURVE[0].p05.toFixed(4) + " at the fifth");
console.log("  percentile — the wedges between the headings are not merely thin, they");
console.log("  are EMPTY. By Rs/r = 1 the whole structure is down to "
  + readAt(1, "peak").toFixed(3) + "×.");
console.log();
console.log("  the wiggle around Rs/r ≈ 0.5 is commensurability, not noise: a disk whose");
console.log("  radius is a simple fraction of the probe radius lines its own ridges up");
console.log("  with the ones it is smoothing. It is under a tenth of the range and does");
console.log("  not touch any conclusion, but it is why the column is not monotone.\n");

// ─────────────────────────────────────────────────────────────────────────────
// the systems

console.log("─".repeat(84));
console.log("2. EVERY MEASUREMENT, RE-READ WITH F(θ) LEFT IN\n");

type Sys = {
  name: string;
  Rs: number; r: number;              // same units, whatever they are
  /** how the observable responds to g → F·g */
  law: "newton" | "mond" | "boost";
  obs: string;
  bound: number;                      // fractional precision of the measurement
  ref: string;
};

const SYS: Sys[] = [
  { name: "Earth's orbit", Rs: 6.957e8, r: 1.496e11, law: "newton",
    obs: "g from the Sun, over one year", bound: 1e-10,
    ref: "planetary ephemerides (INPOP/DE), anomalous accel. ≲ 10⁻¹⁰ of Newton" },
  { name: "Cassini light bend", Rs: 6.957e8, r: 1.6 * 6.957e8, law: "newton",
    obs: "γ, the deflection coefficient", bound: 2.3e-5,
    ref: "Bertotti, Iess & Tortora 2003, Nature 425:374 — γ = 1+(2.1±2.3)·10⁻⁵" },
  { name: "S2 around Sgr A*", Rs: 1.2e10, r: 1.8e13, law: "newton",
    obs: "orbital precession", bound: 0.1,
    ref: "GRAVITY 2020, A&A 636:L5 — Schwarzschild precession to 10%" },
  { name: "Milky Way v_c(R)", Rs: 3, r: 10, law: "mond",
    obs: "circular speed at 10 kpc, by azimuth", bound: 0.013,
    ref: "Eilers et al. 2019, ApJ 871:120 — v_c to ≈3 km/s of 230" },
  { name: "Genzel discs", Rs: 5, r: 5.5, law: "boost",
    obs: "v/v_baryons inside one Re", bound: 0.05,
    ref: "Genzel et al. 2017, Nature 543:397 — f_DM(<Re) < 0.2" },
  { name: "BTFR scatter", Rs: 4, r: 20, law: "mond",
    obs: "flat rotation speed at fixed baryonic mass", bound: 0.021,
    ref: "Lelli et al. 2019, MNRAS 484:3267 — 0.09 dex ≈ 2.1% in v" },
  { name: "wide binaries", Rs: 7e8, r: 3e15, law: "newton",
    obs: "relative acceleration", bound: 0.2,
    ref: "Gaia wide-binary samples — the deep-MOND regime, ≈20% level" },
];

/** how a fractional change in g shows up in each observable */
const respond = (law: Sys["law"], F: number) =>
  law === "newton" ? F                    // g ∝ F
    : law === "mond" ? Math.pow(F, 0.25)  // v ∝ g^(1/4) in the deep regime
      : Math.pow(F, 0.25);                // the boost, near enough, inside Re

console.log("  system              Rs/r    F p95    F p05   predicted   measured to    verdict");
for (const s of SYS) {
  const x = s.Rs / s.r;
  const hi = readAt(x, "p95"), lo = readAt(x, "p05");
  const swing = respond(s.law, hi) - respond(s.law, lo);
  const over = swing / s.bound;
  console.log("  " + s.name.padEnd(20) + x.toExponential(1).padStart(8)
    + hi.toFixed(3).padStart(9) + lo.toFixed(3).padStart(9)
    + (swing * 100).toFixed(1).padStart(10) + "%"
    + (s.bound * 100).toPrecision(2).padStart(12) + "%"
    + ("  " + (over > 1 ? "× " + (over >= 100 ? over.toExponential(1) : over.toFixed(0)) + " over"
      : "within")).padStart(14));
}
console.log("\n  `predicted` is the swing in the observable between the 95th and 5th");
console.log("  percentile direction — how much the answer changes with which way you");
console.log("  happen to be looking. It is a swing and not an offset, so it cannot be");
console.log("  absorbed into a redefinition of G or of a mass.");
console.log();
for (const s of SYS) console.log("    " + s.name.padEnd(20) + s.ref);

console.log("\n  the split is entirely Rs/r, and it is worth stating plainly: THE VEINS");
console.log("  ARE NOT REFUTED BY GALAXIES. A disc seen at one effective radius has");
console.log("  Rs/r ≈ 1 and the structure is smoothed to a few per cent, which is why");
console.log("  no rotation-curve test in this directory would ever have caught it. They");
console.log("  are refuted by THE SOLAR SYSTEM, where the Sun at one au is a point");
console.log("  source to four parts in a thousand and the predicted swing in g over a");
console.log("  year is a factor of a few against an ephemeris good to 10⁻¹⁰.\n");

// ─────────────────────────────────────────────────────────────────────────────
// the Genzel discs specifically, since that is the panel

console.log("─".repeat(84));
console.log("3. THE GENZEL DISCS, DISC BY DISC");
console.log("   what the boost becomes when the ridge and the wedge are read separately");
console.log("   rather than averaged. Re from Table 1; the baryons sit inside about one");
console.log("   Re, so Rs/r is near 1 and this is the most forgiving case there is.\n");

const DISCS: [string, number, number][] = [   // name, z, Re (kpc)
  ["COS4_01351", 0.854, 8.2], ["D3a_6397", 1.500, 7.4], ["GS4_43501", 1.613, 4.9],
  ["zC_406690", 2.196, 5.5], ["zC_400569", 2.242, 3.3],
];

const sd = CURVE[CURVE.length - 1];           // Rs/r = 1, the disc case
console.log("  at Rs/r = 1:  peak " + sd.peak.toFixed(4) + "   p95 " + sd.p95.toFixed(4)
  + "   p05 " + sd.p05.toFixed(4) + "   dead " + sd.dead.toFixed(4));
console.log("  boost multiplier = F^(1/4):  ridge ×" + Math.pow(sd.peak, 0.25).toFixed(4)
  + "   wedge ×" + Math.pow(sd.dead, 0.25).toFixed(4) + "\n");

console.log("  disc            z      Re    boost   ridge   wedge   allowed  still over?");
const C = 299792458, KPC = 3.0856775814913673e19, MSUN = 1.98892e30, G = 6.674e-11;
const H0 = 70.9e3 / 3.0856775814913673e22, A0 = C * H0 / (2 * Math.PI);
const MASS: Record<string, [number, number]> = {   // logMs, fgas
  COS4_01351: [11.07, 0.35], D3a_6397: [11.07, 0.45], GS4_43501: [10.71, 0.50],
  zC_406690: [10.62, 0.55], zC_400569: [11.07, 0.45],
};
for (const [name, z, Re] of DISCS) {
  const [logMs, fgas] = MASS[name];
  const M = Math.pow(10, logMs) * MSUN / (1 - fgas);
  const a0 = A0 * (1 + z);
  const boost = (F: number) => {
    const gN = F * G * M / Math.pow(Re * KPC, 2);
    return Math.sqrt((gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0)) / gN);
  };
  const b = boost(1), hi = boost(sd.peak), lo = boost(sd.dead);
  console.log("  " + name.padEnd(14) + z.toFixed(2).padStart(5) + Re.toFixed(1).padStart(7)
    + b.toFixed(3).padStart(8) + hi.toFixed(3).padStart(8) + lo.toFixed(3).padStart(8)
    + "    1.120" + (lo > 1.12 ? "   yes, all of it" : hi > 1.12 ? "   only the ridge" : "   no"));
}
console.log("\n  note which way round it goes: the RIDGE is the direction with the LOWER");
console.log("  boost, because a stronger g_N is further from the deep-MOND regime and so");
console.log("  gets less of a lift. The ridge therefore moves each disc DOWN towards the");
console.log("  allowed line and the wedge moves it up — and even so, four of the five");
console.log("  clear 1.120 on both sides. The angular structure is worth about ±0.5% on");
console.log("  a boost that has to fall by 5%, so it is not a spare parameter that could");
console.log("  have absorbed the high-redshift problem. It widens the dots and changes");
console.log("  nothing.\n");

console.log("─".repeat(84));
console.log("WHAT THIS SETTLES");
console.log("  · the radial law is untouched: ⟨F⟩ = 1, so 1/r² and every shell average");
console.log("    survive exactly, which is why nothing in this directory saw it");
console.log("  · the new content is azimuthal, fixed to the lattice rather than to the");
console.log("    source, and therefore MODULATED BY THE EARTH'S OWN MOTION");
console.log("  · extended sources smooth it, and only extended sources do: " + CURVE[0].peak.toFixed(2)
  + "× at");
console.log("    Rs/r = 0, " + readAt(0.3, "peak").toFixed(2) + "× at 0.3, "
  + readAt(1, "peak").toFixed(3) + "× at 1");
console.log("  · so galaxies are nearly blind to it and the Solar System is not, and it");
console.log("    is the Solar System that rules it out — by ten orders of magnitude on");
console.log("    the ephemeris, and four on Cassini");
console.log("  · and it does not rescue Genzel: it widens those dots, both ways");
