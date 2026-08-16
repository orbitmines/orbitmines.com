const HBAR=1.054571817e-34,C=2.99792458e8,G_N=6.67430e-11,ME=9.1093837015e-31;
const E_Q=1.602176634e-19,MU_B=9.2740100783e-24,MP=Math.sqrt(HBAR*C/G_N);
const SHEET=8,DEG=26,CYCLE=8,CORE=0.5;
const G0=SHEET*SHEET/(8*Math.PI*Math.PI*CORE*DEG);
const lamC=HBAR/(ME*C);
// lam_m = the model's own reduced wavelength = c*period/2pi, period = G*hbar/mc^2
const lam_m=(G:number)=>(G/(2*Math.PI))*lamC;
console.log("RING picture:  radius = CYCLE*lam_m,  mu = q c r/2,  L = m c r\n");
console.log("RELAXED:       no ring. the only length is lam_m itself.");
console.log("               mu = q c lam_m /2   (a signed emission, not a loop)");
console.log("               L  = hbar/2 intrinsic, NOT tied to any radius\n");
console.log("      G       lam_m/lamC    ring mu (uB)   relaxed mu (uB)   relaxed g");
for(const [n,G] of [["current",G0],["2pi/CYCLE",2*Math.PI/CYCLE],["2pi",2*Math.PI]] as [string,number][]){
  const L=lam_m(G);
  const muRing=E_Q*C*(CYCLE*L)/2, muRel=E_Q*C*L/2;
  const gRel=(muRel/(HBAR/2))/(E_Q/(2*ME));
  console.log("  "+n.padEnd(10)+G.toFixed(4).padStart(7)+"   "+(L/lamC).toExponential(2).padStart(9)+
    "   "+(muRing/MU_B).toFixed(4).padStart(10)+"   "+(muRel/MU_B).toFixed(4).padStart(12)+
    "   "+gRel.toFixed(4).padStart(9));
}
console.log("\n  RELAXED: magneton = mu_B and de Broglie BOTH want G = 2pi.");
console.log("  the CYCLE fork closes, and then g comes out at", 
  (((E_Q*C*lam_m(2*Math.PI)/2)/(HBAR/2))/(E_Q/(2*ME))).toFixed(6));
console.log("\n  general: g = 2*lam_m/lamC, so g=2 exactly when lam_m = lamC, i.e. G = 2pi");
console.log("  mass unit then becomes",(2*Math.PI*MP*1e9).toFixed(1),"ug (nothing measures it)");
