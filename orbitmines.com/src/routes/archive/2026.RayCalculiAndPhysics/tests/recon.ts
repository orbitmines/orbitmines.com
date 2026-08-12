/** two derivations of a0 in one file — how far apart, and is the gap countable? */
const G_LAT=0.06235150, SHEET=8;
const LP=1.616255e-35, TP=5.391247e-44, C=2.99792458e8;
const H0=70.9e3/3.0856775814913673e22, T0=1/H0;
const t0ticks=T0/TP;
const toSI=LP/(TP*TP);                              // cells/tick^2 -> m/s^2

const a_meet = 4*Math.PI*G_LAT/(SHEET*t0ticks)*toSI;   // counting meetings
const a_exp  = C*H0/(2*Math.PI);                        // the expansion
console.log("  from counting meetings   a0 = 4πG/(SHEET·t0) =", a_meet.toExponential(3));
console.log("  from the expansion       a0 = c·H0/2π        =", a_exp.toExponential(3));
console.log("  measured                                      = 1.200e-10");
console.log();
console.log("  meetings / measured  =", (a_meet/1.2e-10).toFixed(4), " -> short by", (1.2e-10/a_meet).toFixed(3));
console.log("  expansion / measured =", (a_exp/1.2e-10).toFixed(4), " -> short by", (1.2e-10/a_exp).toFixed(3));
console.log();
const ratio = a_exp/a_meet;
console.log("  and the two differ by exactly", ratio.toFixed(4));
console.log("  which is 1 / (8π²·G_LATTICE/SHEET) =", (1/(8*Math.PI*Math.PI*G_LAT/SHEET)).toFixed(4));
console.log();
console.log("  8π²·G_LATTICE/SHEET =", (8*Math.PI*Math.PI*G_LAT/SHEET).toFixed(6));
console.log();
console.log("  So they are not two guesses — they are the SAME quantity differing");
console.log("  by a pure lattice count. Whichever is right, the other is wrong by");
console.log("  a factor made of G_LATTICE, SHEET and π, and nothing else.");

export {};
