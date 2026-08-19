/** Does the fold ACCUMULATE? The file says it does, and flags it as a problem.
 *  For this feedback it is the whole ballgame, so price it. */
const G_LAT = 0.06235150, SHEET = 8;
const TICKS = 8.07e60;                      // the age, from `frontier`
const G = 6.67430e-11, C = 2.99792458e8, MSUN = 1.98847e30, KPC = 3.0857e19;

console.log("gravity.ts, on `MADE`: 'it is a rate, so it accumulates:");
console.log("  m.SHEET.t/r passes G.m/r at t = G/SHEET ~ 0.008 ticks'");
console.log();
const ratio = TICKS * SHEET / G_LAT;
console.log(`so accumulated fold / newtonian potential = t.SHEET/G = ${ratio.toExponential(2)}`);
console.log();
console.log("   body              u_newton     u_accumulated   exponent");
for (const [n, M, R] of [["a proton",1.6726e-27,0.84e-15],["the Earth",5.972e24,6.371e6],
  ["the Sun",MSUN,6.957e8],["the Milky Way",6.2e10*MSUN,15*KPC]] as [string,number,number][]) {
  const u = G*M/(R*C*C), ua = u*ratio;
  const e = (uu:number)=>1/(1+uu/(1+uu));
  console.log(`  ${n.padEnd(16)} ${u.toExponential(2)}   ${ua.toExponential(2)}     ${e(ua).toFixed(4)}`);
}
console.log();
console.log("Every body would sit at exponent 0.5000 — the SAME exponent across");
console.log("all five decades, which is what Tully-Fisher needs and what no");
console.log("crossover could ever supply.");

export {};
