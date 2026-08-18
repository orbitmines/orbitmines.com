/**
 * DOES THE MODEL STILL WORK — the run to make before trusting anything else.
 *
 * Not a unit test. Each section is a claim the book makes that nothing used to
 * check, and the point of having one model rather than fifteen is that these can
 * be asked at all:
 *
 *   1  the vacuum settles where its own derivation says, or says how far off
 *   2  GRAVITY: two inert absorbers are pulled together by the vacuum alone, and
 *      the force falls as 1/R^(D−1)
 *   3  gravity's two rules are RECOVERED from the three, which is the hinge
 *      between the two halves of the article and had never been tested
 *   4  the two backends agree on what a result is read off, given that they
 *      cannot agree slot for slot once folding is real
 *   5  changing the geometry announces which LAWS moved, rather than moving them
 *
 *   ts-node --compiler-options '{"module":"commonjs","target":"es2020"}' CHECK.ts
 */
import { GEOMETRIES, World, GRAVITY, GRAVITY_MAGNETISM, LABELLED, l, fill, scattering,
  Report, headerOf, exponent, diff, conform, recoversGravity, vacuumFill,
  gravitationalPull } from "./DISCRETE";
import { constants, affectedBy, calibrate } from "./CONTINUOUS";

console.log("═════ 1  the vacuum's own occupancy, measured against its derivation ═════\n");
const v = vacuumFill({ N: 17, T: 90 });
console.log(`  measured ${v.measured.toFixed(3)}   predicted (unsigned) ${v.predicted.toFixed(3)}   mfp ${v.mfp.toFixed(2)} cells`);
console.log(`  verdict: ${v.finding.verdict} by ${(100*(v.finding.by??0)).toFixed(0)}%`);
console.log(`  ${v.finding.note}`);

console.log("\n═════ 2  GRAVITY — the vacuum's pull, and the inverse-square law ═════\n");
console.log("  The article's mechanism: the vacuum is trying to expand, matter is in the way,");
console.log("  the deficit spreads at c̄, and a body feels the vacuum's rays arriving");
console.log("  ANISOTROPICALLY because a second body has been eating the ones that would have");
console.log("  come from its direction. Both bodies here are INERT ABSORBERS — they eat and");
console.log("  emit nothing — so whatever pulls them together is the vacuum and not them.\n");
const gp = gravitationalPull({ N: 41, T: 240, seeds: [20260817, 777333, 424242, 5150, 31337] });
console.log("  sep   pair − lone            σ       × sep²");
console.log("  " + "─".repeat(58));
for (const x of gp.rows)
  console.log(`  ${String(x.sep).padEnd(5)} ${((x.value >= 0 ? "+" : "") + x.value.toExponential(3) + " ± " + x.err.toExponential(1)).padEnd(22)} ${x.sigma.toFixed(1).padEnd(7)} ${(x.value * x.sep * x.sep).toExponential(3)}`);
console.log();
for (const f of gp.findings) {
  console.log(`  ${f.name.padEnd(36)} ${f.value.toExponential(4).padEnd(16)}${f.verdict ?? ""}`);
  if (f.note) console.log(`      ${f.note}`);
}

console.log("\n═════ 3  is gravity RECOVERED from gravity+magnetism? ═════\n");
console.log("  The article's claim is that alternating polarity gives ATTRACTION and brings");
console.log("  (G/1) and (G/2) back out of the three rules — not that the two theories give");
console.log("  the same number. They cannot: under alternation about half of head-on meetings");
console.log("  are alike and TURN rather than annihilate. So the shape and the sign are what");
console.log("  is compared, and the amplitude ratio is reported rather than expected.\n");
const r = recoversGravity({ N: 25, T: 60 });
console.log("  r      gravity                G+M alternating");
for (let i = 0; i < r.radii.length; i++) {
  const g = r.gravity.profile[i], m = r.magnetism.profile[i];
  console.log(`  ${String(r.radii[i]).padEnd(6)} ${(g.mean.toExponential(3) + " ± " + g.err.toExponential(1)).padEnd(22)} ${m.mean.toExponential(3)} ± ${m.err.toExponential(1)}`);
}
console.log();
for (const f of r.findings) {
  const v = `${f.value.toExponential(4)}${f.err !== undefined ? " ± " + f.err.toExponential(1) : ""}`;
  console.log(`  ${f.name.padEnd(36)} ${v.padEnd(24)}` +
    `${f.verdict ?? ""}${f.by !== undefined && f.verdict !== "within" ? " by " + (100 * f.by).toFixed(1) + "%" : ""}`);
  if (f.note) console.log(`      ${f.note}`);
}

console.log("\n═════ 4  backend conformance: does the flat one match the graph one? ═════\n");
console.log("  Run with folding OFF and the two must be the SAME SIMULATION — same rules, same");
console.log("  streaming, same random stream, same channels. Run it ON and they cannot be, since");
console.log("  the flat backend records a fold and the graph one removes the local; the gap is");
console.log("  the flat backend's stated approximation, and this is what it costs.\n");
for (const mode of ["none", "destroy"] as const) {
  const c = conform(backend => {
    const w = new World({ theory: GRAVITY_MAGNETISM, N: 9, backend, seed: 7,
      expansion: 0.05, boundary: "absorb", fold: { mode } });
    w.add({ at: [4,4,4], radius: 1, emits: 1 });
    return w;
  }, 12);
  const f = c.statistical.fill;
  console.log(`  fold=${mode.padEnd(9)} diverges at tick ${String(c.firstDivergence).padEnd(4)}` +
    ` fill  flat ${f.array.toFixed(4)}  graph ${f.graph.toFixed(4)}  gap ${f.gap.toFixed(4)}` +
    `   annihilation rate ${(100 * c.statistical.annihilations.gap).toFixed(1)}% apart`);
  if (mode === "none" && c.firstDivergence !== -1)
    console.log("  !! WITH NOTHING FOLDING THEY MUST NOT DIVERGE AT ALL — something else is wrong.");
}

console.log("\n═════ 5  change the geometry: which LAWS move ═════\n");
for (const a of affectedBy(GEOMETRIES["cubic-26"], GEOMETRIES["fcc-12"])) {
  console.log(`  ${a.law}  —  ${a.form}`);
  for (const ch of a.changes) console.log(`      ${ch.constant}: ${ch.from} → ${ch.to}`);
}
