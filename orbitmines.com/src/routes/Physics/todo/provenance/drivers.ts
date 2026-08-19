/** The data does not pick a MECHANISM, it picks an EXPONENT p. So invert it. */
const slope = 3.85, err = 0.09;
const e = 2/slope, eLo = 2/(slope+err), eHi = 2/(slope-err);
const p = 1/e - 1, pLo = 1/eHi - 1, pHi = 1/eLo - 1;
console.log("Tully-Fisher measured:  M ~ v^" + slope + " +/- " + err);
console.log(`  => e  = ${e.toFixed(4)}  [${eLo.toFixed(4)}, ${eHi.toFixed(4)}]`);
console.log(`  => p  = ${p.toFixed(4)}  [${pLo.toFixed(4)}, ${pHi.toFixed(4)}]`);
console.log();
console.log("So the DRIVER must scale as M^p with p = 0.93 +/- 0.05.");
console.log("Any quantity linear in the source qualifies. Which are there?");
console.log();
console.log("   candidate driver          scales as   p      BTFR slope   verdict");
const rows: [string,string,number][] = [
  ["accumulated fold",        "M",      1],
  ["Newtonian potential u",   "M",      1],
  ["annihilation rate",       "M",      1],
  ["carrier density n",       "M",      1],
  ["speed v",                 "M^1/2",  0.5],
  ["acceleration a",          "M",      1],
  ["escape velocity",         "M^1/2",  0.5],
  ["tidal field",             "M",      1],
];
for (const [n,s,pp] of rows) {
  const sl = 2*(1+pp);
  const sig = Math.abs(sl-slope)/err;
  console.log(`  ${n.padEnd(24)} ${s.padEnd(10)}  ${pp.toFixed(1)}    ${sl.toFixed(2).padStart(6)}      ${sig<2?"PASSES":"ruled out"} (${sig.toFixed(1)}σ)`);
}
console.log();
console.log("Everything linear in M gives the same 4.00, so the data cannot tell");
console.log("them apart. It only rules out the ones carrying a root already.");

export {};
