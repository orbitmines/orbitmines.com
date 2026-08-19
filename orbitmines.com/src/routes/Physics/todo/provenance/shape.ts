/**
 * IS THE SHAPE STILL RIGHT WHEN THE SPLITTING IS NOT ISOTROPIC?
 *
 * I claimed the blocking and the projection "are functions of the same
 * occupancy, so they can only move the SCALE". That is an assertion. If the
 * blocked cone grows with the field, then the projection factor VARIES WITH
 * RADIUS — deep inside it is heavily shut, far out it is open — and a
 * radius-dependent coefficient changes the PROFILE, not just its normalisation.
 * So the expansion around a galaxy is not a sphere, and the question is whether
 * the rotation curve survives that.
 */
const G=6.674e-11,MSUN=1.98847e30,KPC=3.0857e19,C=2.99792458e8;
const A0=C*(70.9e3/3.0857e22)/(2*Math.PI);
const NR=200,RMAX=70*KPC,NOUT=70,HZ=0.30*KPC;
const Rj=Array.from({length:NR},(_,j)=>RMAX*(j+0.5)/NR), dR=RMAX/NR;
const ri=Array.from({length:NOUT},(_,i)=>(i+1)*0.5*KPC);
const kern=(()=>{const NP=280,K:Float64Array[]=[];
 for(let i=0;i<NOUT;i++){const row=new Float64Array(NR),r=ri[i];
  for(let j=0;j<NR;j++){const R=Rj[j];let a=0;
   for(let q=0;q<NP;q++){const ph=2*Math.PI*(q+0.5)/NP;
    const dx=R*Math.cos(ph)-r,dy=R*Math.sin(ph);a+=dx/Math.pow(dx*dx+dy*dy+HZ*HZ,1.5);}
   row[j]=-a/NP;} K.push(row);} return K;})();
const MW={Md:5.0e10*MSUN,Rd:2.6*KPC,Mg:1.2e10*MSUN,Rg:7.0*KPC,Mb:0.9e10*MSUN,ab:0.5*KPC};
const sig=(R:number)=>MW.Md/(2*Math.PI*MW.Rd*MW.Rd)*Math.exp(-R/MW.Rd)
  +MW.Mg/(2*Math.PI*MW.Rg*MW.Rg)*Math.exp(-R/MW.Rg);
const gN=(()=>{const m=new Float64Array(NR);
 for(let j=0;j<NR;j++)m[j]=sig(Rj[j])*2*Math.PI*Rj[j]*dR;
 const o=new Float64Array(NOUT);
 for(let i=0;i<NOUT;i++){let a=0;const row=kern[i];
  for(let j=0;j<NR;j++)a+=row[j]*m[j];
  o[i]=G*a+G*MW.Mb/Math.pow(ri[i]+MW.ab,2);} return o;})();

/** the lattice's own 26 directions, and the projection with a cone shut */
const dirs:[number,number,number][]=[];
for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++) if(x||y||z) dirs.push([x,y,z]);
const projAt=(cut:number)=>{let s=0,n=0;
  for(const d of dirs){const m=Math.hypot(d[0],d[1],d[2]),uz=d[2]/m;
    if(uz>cut)continue; s+=Math.abs(uz);n++;}
  return n? s/n : 0;};
const P_ISO=projAt(1.01);
/** how much of the forward cone is shut, as a function of occupancy */
const cutFor=(theta:number)=>{
  // fraction of solid angle shut saturates at f_max; cos cut from that fraction
  const f=theta/(1+theta);
  return 1-2*Math.min(f,0.5);          // f=0 -> cut 1 (nothing), f=0.5 -> cut 0
};
const MEAS=(rk:number)=>229.0-1.7*(rk-8.122);
const kms=(g:number,r:number)=>Math.sqrt(Math.max(0,g*r))/1e3;
const idx=(rk:number)=>Math.round(rk/0.5)-1;

/** solve g = gN(1 + (a0/g)·P(g/a0)/P_iso) self-consistently at each radius */
const solveAniso=(gNv:number,a0:number,aniso:boolean)=>{
  let g=gNv+a0;
  for(let k=0;k<400;k++){
    const th=g/a0;
    const P=aniso? projAt(cutFor(th))/P_ISO : 1;
    g=0.5*g+0.5*(gNv*(1+(a0/g)*P));
  }
  return g;
};

console.log("=".repeat(74));
console.log("THE PROJECTION AS A FUNCTION OF RADIUS — is it flat or not?");
console.log("=".repeat(74));
console.log("   r kpc   g/a0      cone cut   P/P_iso    a0_eff/a0");
for(const rk of [2,5,8,12,20,30]){
  const g=solveAniso(gN[idx(rk)],A0,true), th=g/A0;
  const P=projAt(cutFor(th))/P_ISO;
  console.log(`  ${String(rk).padStart(6)}  ${th.toFixed(2).padStart(7)}   ${cutFor(th).toFixed(3).padStart(7)}   `+
    `${P.toFixed(4).padStart(7)}    ${P.toFixed(4)}`);
}
console.log();
console.log("=".repeat(74));
console.log("AND WHAT IT DOES TO THE CURVE");
console.log("=".repeat(74));
const shapeOf=(aniso:boolean)=>{let s=0,n=0;
  for(let rk=6;rk<=25;rk++){
    const g=solveAniso(gN[idx(rk)],A0,aniso);
    s+=Math.pow(kms(g,ri[idx(rk)])/MEAS(rk)-1,2);n++;}
  return 100*Math.sqrt(s/n);};
console.log(`   isotropic splitting        shape ${shapeOf(false).toFixed(1)}%`);
console.log(`   anisotropic, cone grows    shape ${shapeOf(true).toFixed(1)}%`);
console.log();
console.log("   r kpc   isotropic   anisotropic   Gaia");
for(const rk of [6,8,12,20,30]){
  console.log(`  ${String(rk).padStart(6)}  ${kms(solveAniso(gN[idx(rk)],A0,false),ri[idx(rk)]).toFixed(1).padStart(9)}   `+
    `${kms(solveAniso(gN[idx(rk)],A0,true),ri[idx(rk)]).toFixed(1).padStart(11)}   ${MEAS(rk).toFixed(1)}`);
}
console.log();
console.log("   and refitting a0 to absorb it:");
let best=1e9,bestA=0;
for(let f=0.6;f<=2.0;f+=0.01){const a=A0*f;
  let s=0,n=0;
  for(let rk=6;rk<=25;rk++){const g=solveAniso(gN[idx(rk)],a,true);
    s+=Math.pow(kms(g,ri[idx(rk)])/MEAS(rk)-1,2);n++;}
  const sh=100*Math.sqrt(s/n); if(sh<best){best=sh;bestA=a;}}
console.log(`     best a0 = ${bestA.toExponential(3)} (${(bestA/A0).toFixed(2)}x cH0/2pi), shape ${best.toFixed(1)}%`);

export {};
