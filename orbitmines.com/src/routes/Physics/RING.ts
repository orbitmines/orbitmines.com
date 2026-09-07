/**
 * WHAT AN INSTRUMENT WOULD ACTUALLY SEE — the ring, not the shadow.
 *
 * `metric/shadow` gives the critical curve: 2e·GM/c² against general relativity's
 * 3√3, a shadow 4.63% larger at the same mass. That number is exact and it is NOT what
 * a telescope measures. The Event Horizon Telescope says so itself, in M87* Paper VI:
 *
 *   "we do not simply assume that the measured emission diameter is that of the photon
 *    ring itself … the structure and extent of the emission preferentially from
 *    outside the photon ring leads to a 10% offset between the measured emission
 *    diameter in the model images and the size of the photon ring"
 *
 * They calibrate that offset out with a factor α, defined by d̂ = α·θ_g, measured on a
 * library of GRMHD images and found to be α = 11.55 — against 9.6–10.4 for the photon
 * ring itself. The offset is the dominant error in the whole measurement, "larger by a
 * factor of ∼4–5 than either the statistical or observational components".
 *
 * AND α IS CALIBRATED IN KERR, which is the problem. Ray-tracing plasma in general
 * relativity to convert an observed ring into a shadow, and then asking whether that
 * shadow is general relativity's, is circular at exactly the precision this model's
 * prediction lives at. α = 11.55 is not this model's to borrow.
 *
 * SO THIS FILE DERIVES ITS OWN, in both metrics, from the same emission model — which
 * is the only comparison that is not question-begging. Nothing here touches anybody's
 * published prediction: it takes the geometry each metric implies and asks what an
 * optically thin plasma around it would look like from Earth.
 *
 * WHAT IS INTEGRATED. In isotropic form ds² = −A dt² + B(dr² + r²dΩ²), a null ray with
 * impact parameter b turns where b = r√(B/A), and
 *
 *     (dr/dφ)² = (B/A)·r⁴/b² − r²
 *     dl_proper = √B · T r / √(T²r² − b²) dr,     T ≡ √(B/A)
 *
 * For optically thin emission from a static plasma the bolometric intensity picks up
 * one factor of the redshift per power of frequency, four in all, so
 *
 *     I(b) = ∫ A(r)² · ε(R(r)) · dl_proper,     R = r√B the areal radius
 *
 * integrated in along the ray and back out again — and the winding of rays near the
 * photon sphere is in there for free, since the 1/√(T²r² − b²) divergence at the
 * turning point is exactly the proper length spent circling.
 *
 * THE EMISSIVITY IS A TOY AND THE RATIO IS NOT. ε ∝ R^−γ outside an inner edge, static,
 * spherical, no beaming, no inclination, one power law. That will not reproduce EHT's
 * α to three digits and is not meant to. What it does reproduce is the RATIO between
 * two metrics under one and the same plasma, and the ratio is what the prediction is.
 *
 * VALIDATION, WHICH IS THE PART THAT MATTERS. Run the same code on Schwarzschild and it
 * returns the photon sphere at areal 3M, the ISCO at 6M, and a critical parameter of
 * 5.196152 — the closed forms, to six digits, from a numerical integration that was
 * told none of them.
 */

/** a static spherically symmetric geometry, in isotropic coordinates, with M = 1 */
export type Geometry = {
  name: string;
  A: (r: number) => number;
  B: (r: number) => number;
};

/** the turning function: a ray of impact parameter b turns where r·T(r) = b */
export const T = (g: Geometry, r: number) => Math.sqrt(g.B(r) / g.A(r));

/** areal radius — proper circumference over 2π, which is the physical "how big" */
export const areal = (g: Geometry, r: number) => r * Math.sqrt(g.B(r));

/**
 * SCHWARZSCHILD IN ISOTROPIC FORM, so both geometries go through identical code and
 * the only thing that differs between them is A and B.
 */
export const RELATIVITY: Geometry = {
  name: "general relativity",
  A: r => Math.pow((1 - 0.5 / r) / (1 + 0.5 / r), 2),
  B: r => Math.pow(1 + 0.5 / r, 4),
};

/** and the count's, where A·B = 1 and there is no horizon anywhere */
export const COUNTED: Geometry = {
  name: "the count",
  A: r => Math.exp(-2 / r),
  B: r => Math.exp(2 / r),
};

const memo = <R>(f: (g: Geometry) => R) => {
  const seen = new Map<string, R>();
  return (g: Geometry) => {
    if (!seen.has(g.name)) seen.set(g.name, f(g));
    return seen.get(g.name)!;
  };
};

/** the photon sphere and the critical impact parameter: the minimum of r·T(r) */
export const criticalOf = memo((g: Geometry) => {
  let r0 = 0.55, best = Infinity, step = 0.001;
  for (let r = 0.55; r < 60; r += step) {
    const v = r * T(g, r);
    if (v < best) { best = v; r0 = r; }
  }
  for (let d = step; d > 1e-13; d /= 2)
    for (const r of [r0 - d, r0 + d]) {
      const v = r * T(g, r);
      if (r > 0.5 && v < best) { best = v; r0 = r; }
    }
  return { b: best, r: r0, areal: areal(g, r0) };
});

/**
 * THE INNERMOST STABLE CIRCULAR ORBIT, which is where an accretion flow stops.
 *
 * For a circular orbit both the radial equation and its derivative vanish, which fixes
 * E and L at each radius; the ISCO is where L² turns around. Schwarzschild returns
 * areal 6M from this, which is the check that it is being done right.
 */
export const iscoOf = memo((g: Geometry) => {
  const h = 1e-6;
  const P = (r: number) => 1 / (g.B(r) * r * r);
  const L2 = (r: number) => {
    const dA = (g.A(r + h) - g.A(r - h)) / (2 * h);
    const dP = (P(r + h) - P(r - h)) / (2 * h);
    return 1 / (-dP * g.A(r) / dA - P(r));
  };
  let r0 = 3, best = Infinity;
  for (let r = 1.05; r < 40; r += 0.0002) {
    const v = L2(r);
    if (isFinite(v) && v > 0 && v < best) { best = v; r0 = r; }
  }
  return { r: r0, areal: areal(g, r0) };
});

/** isotropic radius at a given areal radius — the two differ, and by different amounts */
export const isoOfAreal = (g: Geometry, R: number) => {
  let lo = 1e-3, hi = 600;
  for (let i = 0; i < 140; i++) {
    const mid = 0.5 * (lo + hi);
    if (areal(g, mid) < R) lo = mid; else hi = mid;
  }
  return 0.5 * (lo + hi);
};

/** where a ray of impact parameter b turns, or null if it goes all the way in */
const turningOf = (g: Geometry, b: number, rPhoton: number) => {
  let lo = rPhoton * 1.0000001, hi = 600;
  if (lo * T(g, lo) > b) return null;
  for (let i = 0; i < 100; i++) {
    const mid = 0.5 * (lo + hi);
    if (mid * T(g, mid) > b) hi = mid; else lo = mid;
  }
  return 0.5 * (lo + hi);
};

export type Plasma = { Rin: number; Rout: number; gamma: number };

/**
 * ONE PIXEL OF THE IMAGE: the intensity seen at impact parameter b.
 *
 * The substitution r = inner + s² is not cosmetic. The integrand diverges as
 * 1/√(r − r_turn) at a turning point, which is integrable and which a uniform grid in
 * r gets wrong by tens of per cent — and the turning point is precisely where the
 * photon-ring brightness comes from, so getting it wrong would flatten the one feature
 * the whole calculation is about.
 */
export const intensityAt = (g: Geometry, b: number, p: Plasma, nr = 700) => {
  const { r: rPhoton } = criticalOf(g);
  const rin = isoOfAreal(g, p.Rin), rout = isoOfAreal(g, p.Rout);
  const rt = turningOf(g, b, rPhoton);
  const inner = rt === null ? rin : Math.max(rt, rin);
  if (inner >= rout) return 0;
  const legs = rt === null ? 1 : 2;
  const smax = Math.sqrt(rout - inner);
  let sum = 0;
  for (let i = 0; i < nr; i++) {
    const s = smax * (i + 0.5) / nr;
    const r = inner + s * s;
    const t = T(g, r);
    const d = t * t * r * r - b * b;
    if (d <= 0) continue;
    const dl = Math.sqrt(g.B(r)) * t * r / Math.sqrt(d);
    const R = areal(g, r);
    const eps = R >= p.Rin ? Math.pow(R / p.Rin, -p.gamma) : 0;
    sum += g.A(r) * g.A(r) * eps * dl * 2 * s * (smax / nr);
  }
  return legs * sum;
};

/** the whole radial brightness profile, which is the image this geometry casts */
export const profileOf = (g: Geometry, p: Plasma, bmax = 22, nb = 600, nr = 700) => {
  const b: number[] = [], I: number[] = [];
  for (let i = 1; i <= nb; i++) {
    const bb = bmax * i / nb;
    b.push(bb); I.push(intensityAt(g, bb, p, nr));
  }
  return { b, I };
};

/**
 * AND THE RING DIAMETER A FITTER WOULD REPORT, which is the peak of that profile.
 *
 * EHT fit a crescent to an image and quote its diameter; the closest thing a spherical
 * profile has is twice the brightest radius, refined parabolically off the grid. The
 * flux-weighted radius is returned alongside it because it is the other defensible
 * reading and it behaves differently — a fact the panels say out loud rather than
 * choosing the flattering one.
 */
export const ringOf = ({ b, I }: { b: number[]; I: number[] }) => {
  let k = 0;
  for (let i = 1; i < I.length; i++) if (I[i] > I[k]) k = i;
  let peak = b[k];
  if (k > 0 && k < I.length - 1) {
    const den = I[k - 1] - 2 * I[k] + I[k + 1];
    if (den !== 0) peak = b[k] + ((I[k - 1] - I[k + 1]) / (2 * den)) * (b[1] - b[0]);
  }
  let num = 0, dn = 0;
  for (let i = 0; i < b.length; i++) { num += I[i] * b[i] * b[i]; dn += I[i] * b[i]; }
  return { peak, fluxWeighted: dn ? num / dn : 0 };
};

/** α as EHT define it: the ring DIAMETER in units of GM/c² */
export const alphaOf = (g: Geometry, p: Plasma, bmax = 22, nb = 600, nr = 700) =>
  2 * ringOf(profileOf(g, p, bmax, nb, nr)).peak;

/**
 * THE INNER EDGE THAT REPRODUCES A GIVEN α IN GENERAL RELATIVITY.
 *
 * This is how the calculation is anchored to the real measurement without borrowing
 * anything from it. EHT measured α = 11.55 on Kerr GRMHD images; ask this emission
 * model what inner edge gives the same α in Schwarzschild, and it answers 4.15 M —
 * emission stopping well outside the photon sphere, which is the same statement their
 * calibration makes, arrived at independently.
 */
export const innerEdgeFor = (alpha: number, gamma = 3) => {
  let lo = 3, hi = 6.5;
  for (let i = 0; i < 34; i++) {
    const mid = 0.5 * (lo + hi);
    const a = alphaOf(RELATIVITY, { Rin: mid, Rout: mid * 12, gamma }, 22, 500, 500);
    if (a < alpha) lo = mid; else hi = mid;
  }
  return 0.5 * (lo + hi);
};

/**
 * AND WHERE THE PLASMA SITS IN THE OTHER GEOMETRY, which is the whole ambiguity.
 *
 * "The same accretion flow" is not a well-defined phrase across two metrics. Three
 * anchorings are defensible and they do not agree:
 *
 *   areal   the inner edge at the same physical circumference — the effect nearly
 *           cancels, because the ring is then the image of the same-sized object
 *   isco    the flow truncates at its own innermost stable orbit, which is the one
 *           with a dynamical reason behind it
 *   photon  the inner edge scales with the photon sphere — the effect is amplified
 *
 * The spread between them is larger than the effect being predicted, and that is the
 * result rather than a caveat to it.
 */
export type Anchor = "areal" | "isco" | "photon";
export const anchoredEdge = (anchor: Anchor, Rin: number) =>
  anchor === "areal" ? Rin
    : anchor === "isco" ? Rin * (iscoOf(COUNTED).areal / iscoOf(RELATIVITY).areal)
    : Rin * (criticalOf(COUNTED).areal / criticalOf(RELATIVITY).areal);

/** what an instrument would see: the ring diameter ratio, under one anchoring */
export const observedRatio = (anchor: Anchor, Rin: number, gamma = 3,
  nb = 600, nr = 700) => {
  const gr = alphaOf(RELATIVITY, { Rin, Rout: Rin * 12, gamma }, 22, nb, nr);
  const R2 = anchoredEdge(anchor, Rin);
  const ct = alphaOf(COUNTED, { Rin: R2, Rout: R2 * 12, gamma }, 22, nb, nr);
  return { gr, ct, ratio: ct / gr };
};
