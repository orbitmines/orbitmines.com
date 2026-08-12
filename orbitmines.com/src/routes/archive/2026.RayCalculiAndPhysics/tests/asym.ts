/** the exponents, taken deep enough to actually be asymptotic */
const solve = (N:number, kap:number, p:number) => {
  let M = N;
  for (let i=0;i<200000;i++) M = 0.5*M + 0.5*N/(1+kap*Math.pow(M,p));
  return M;
};
console.log("  p     decades      exponent    predicted 1/(1+p)");
for (const p of [0.5, 1]) {
  for (const [lo,hi] of [[1e6,1e12],[1e20,1e26],[1e40,1e46]] as [number,number][]) {
    const e = Math.log(solve(hi,1,p)/solve(lo,1,p))/Math.log(hi/lo);
    console.log(`  ${p}   ${lo.toExponential(0)}..${hi.toExponential(0)}   ${e.toFixed(5)}     ${(1/(1+p)).toFixed(5)}`);
  }
}

export {};
