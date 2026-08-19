/**
 * THE GENZEL TEST, DONE PROPERLY — and it overturns the earlier one.
 *
 * The first pass took g_N = G·M_bar/R_e², which is a POINT MASS. These are
 * DISCS, and at one effective radius a disc has not enclosed all its mass, so
 * its g_N there is smaller. A smaller g_N sits deeper in the boosted regime and
 * gives a LARGER boost — so the point-mass shortcut was systematically generous
 * to the model, in the direction that made it pass.
 *
 * Done with the same ring sum used everywhere else in this file.
 */

const G = 6.67430e-11, MSUN = 1.98847e30, KPC = 3.0857e19, C = 2.99792458e8;
const MPC = 3.0856775814913673e22;
const A0 = C * (70.9e3 / MPC) / (2 * Math.PI);

type Disc = { name: string; z: number; logMs: number; fgas: number; Re: number };
const D: Disc[] = [
  { name: "COS4_01351", z: 0.854, logMs: 11.07, fgas: 0.35, Re: 8.2 },
  { name: "D3a_6397", z: 1.500, logMs: 11.07, fgas: 0.45, Re: 7.4 },
  { name: "GS4_43501", z: 1.613, logMs: 10.71, fgas: 0.50, Re: 4.9 },
  { name: "zC_406690", z: 2.196, logMs: 10.62, fgas: 0.55, Re: 5.5 },
  { name: "zC_400569", z: 2.242, logMs: 11.07, fgas: 0.45, Re: 3.3 },
];
const Mbar = (d: Disc) => Math.pow(10, d.logMs) * MSUN / (1 - d.fgas);

/** the disc's own pull, ring by ring — no shell theorem, no point-mass shortcut */
const discG = (M: number, Rd: number, r: number, NR = 700, NP = 700) => {
  const RMAX = 14 * Rd, h = Rd / 8;
  let acc = 0;
  for (let i = 0; i < NR; i++) {
    const R = RMAX * (i + 0.5) / NR, dR = RMAX / NR;
    const s = M / (2 * Math.PI * Rd * Rd) * Math.exp(-R / Rd) * R * dR;
    let a = 0;
    for (let j = 0; j < NP; j++) {
      const p = 2 * Math.PI * (j + 0.5) / NP;
      const dx = R * Math.cos(p) - r, dy = R * Math.sin(p);
      a += dx / Math.pow(dx * dx + dy * dy + h * h, 1.5);
    }
    acc += -G * s * a * (2 * Math.PI / NP);
  }
  return acc;
};

const boosted = (gN: number, a0: number) => gN / 2 + Math.sqrt(gN * gN / 4 + gN * a0);
const CEIL = 1 / Math.sqrt(0.8);                 // f_DM < 0.2  ⇒  v/v_bar < 1.118

console.log("=".repeat(78));
console.log("THE TWO DEG OF GETTING g_N AT Re, AND THEY DISAGREE");
console.log("=".repeat(78));
console.log(`   ceiling from f_DM < 0.2 : ${CEIL.toFixed(4)}\n`);
console.log("   galaxy         g_N point   g_N disc    ratio   boost pt   boost disc");
let failPt = 0, failDisc = 0;
for (const d of D) {
  const M = Mbar(d), Rd = d.Re * KPC / 1.68, r = d.Re * KPC;
  const gPt = G * M / (r * r);
  const gDisc = discG(M, Rd, r);
  const bPt = Math.sqrt(boosted(gPt, A0) / gPt);
  const bDisc = Math.sqrt(boosted(gDisc, A0) / gDisc);
  if (bPt > CEIL) failPt++;
  if (bDisc > CEIL) failDisc++;
  console.log(`   ${d.name.padEnd(13)} ${gPt.toExponential(2)}  ${gDisc.toExponential(2)}   ` +
    `${(gDisc / gPt).toFixed(3)}   ${bPt.toFixed(3)}${bPt > CEIL ? "*" : " "}     ` +
    `${bDisc.toFixed(3)}${bDisc > CEIL ? "*" : " "}`);
}
console.log(`\n   * = over the ceiling.  point mass: ${failPt}/5 fail.  disc: ${failDisc}/5 fail.`);

console.log();
console.log("=".repeat(78));
console.log("SO THE EARLIER PASS WAS AN ARTEFACT OF THE SHORTCUT");
console.log("=".repeat(78));
console.log("   A disc at one effective radius encloses about half its mass, so");
console.log("   its g_N is roughly half the point-mass value. Halving g_N raises");
console.log("   the boost, because the boost grows as g_N falls. The shortcut was");
console.log("   generous in exactly the direction that mattered.");
console.log();
console.log("   WITH THE DISC DONE PROPERLY THE MODEL OVERSHOOTS FOUR OF THE FIVE.");

console.log();
console.log("=".repeat(78));
console.log("WHAT WOULD BE NEEDED TO CLEAR IT");
console.log("=".repeat(78));
console.log("   the largest a0 each disc permits, done properly:\n");
let worstA = Infinity;
for (const d of D) {
  const M = Mbar(d), Rd = d.Re * KPC / 1.68, r = d.Re * KPC;
  const gN = discG(M, Rd, r);
  // boost = CEIL  ⇒  a0 = gN·((CEIL²−0.5)² − 0.25)
  const a = gN * (Math.pow(CEIL * CEIL - 0.5, 2) - 0.25);
  worstA = Math.min(worstA, a);
  console.log(`   ${d.name.padEnd(13)} a0 < ${a.toExponential(2)}  = ${(a / A0).toFixed(3)}× the prediction`);
}
console.log(`\n   binding: a0 < ${worstA.toExponential(3)} = ${(worstA / A0).toFixed(3)}× predicted`);
console.log(`   the anisotropy multiplies a0 by 0.765, giving ${(A0 * 0.7647).toExponential(3)}`);
console.log(`   which is ${(A0 * 0.7647 / worstA).toFixed(2)}× the ceiling — still over.`);
console.log();
console.log("   So the anisotropy alone does not rescue it either. The model needs");
console.log("   a0 about 2.5x SMALLER than cH0/2pi to clear these discs, and that");
console.log("   is not a correction anything here offers.");

export {};
