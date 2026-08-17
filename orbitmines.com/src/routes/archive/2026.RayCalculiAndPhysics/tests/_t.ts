const HBAR=1.054571817e-34,C=2.99792458e8,G_N=6.67430e-11,ME=9.1093837015e-31;
const tP=Math.sqrt(HBAR*G_N/Math.pow(C,5));
const YR=3.15576e7;
console.log("if ONE broken antipodal pair destroys the particle, how long does it last?\n");
console.log("  Planck time                 ",tP.toExponential(3),"s");
console.log("  expansion rate per cell/tick  1e-61   (front.ts)\n");
console.log("   container cells   lifetime (ticks)   in years");
for(const N of [1e2,1e6,1e20,1e40]){
  const ticks=1/(N*1e-61);
  console.log("   "+N.toExponential(0).padStart(13)+ticks.toExponential(2).padStart(19)+
    "   "+(ticks*tP/YR).toExponential(2));
}
console.log("\n  measured lower bounds:  electron > 6.6e28 yr,  proton > 1.6e34 yr");
console.log("  age of the universe:    1.4e10 yr");
