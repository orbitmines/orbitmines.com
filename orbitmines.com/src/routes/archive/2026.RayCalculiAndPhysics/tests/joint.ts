const G=6.674e-11,MSUN=1.98847e30,KPC=3.0857e19,C=2.99792458e8;
const A0P=C*(70.9e3/3.0857e22)/(2*Math.PI);      // the prediction
const dirs:[number,number,number][]=[];
for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)if(x||y||z)dirs.push([x,y,z]);
const proj=(cut:number)=>{let s=0,n=0;for(const v of dirs){const m=Math.hypot(v[0],v[1],v[2]),uz=v[2]/m;
  if(uz>cut)continue;s+=Math.abs(uz);n++;}return s/n;};
const P_ISO=proj(1.01);
const NR=200,RMAX=70*KPC,NOUT=70,HZ=0.30*KPC;
const Rj=Array.from({length:NR},(_,j)=>RMAX*(j+0.5)/NR),dR=RMAX/NR;
const ri=Array.from({length:NOUT},(_,i)=>(i+1)*0.5*KPC);
const kern=(()=>{const NP=280,K:Float64Array[]=[];
 for(let i=0;i<NOUT;i++){const row=new Float64Array(NR),r=ri[i];
  for(let j=0;j<NR;j++){const R=Rj[j];let a=0;
   for(let q=0;q<NP;q++){const ph=2*Math.PI*(q+0.5)/NP;
    const dx=R*Math.cos(ph)-r,dy=R*Math.sin(ph);a+=dx/Math.pow(dx*dx+dy*dy+HZ*HZ,1.5);}
   row[j]=-a/NP;}K.push(row);}return K;})();
const MW={Md:5.0e10*MSUN,Rd:2.6*KPC,Mg:1.2e10*MSUN,Rg:7.0*KPC,Mb:0.9e10*MSUN,ab:0.5*KPC};
const sig=(R:number)=>MW.Md/(2*Math.PI*MW.Rd*MW.Rd)*Math.exp(-R/MW.Rd)+MW.Mg/(2*Math.PI*MW.Rg*MW.Rg)*Math.exp(-R/MW.Rg);
const gNarr=(()=>{const m=new Float64Array(NR);
 for(let j=0;j<NR;j++)m[j]=sig(Rj[j])*2*Math.PI*Rj[j]*dR;
 const o=new Float64Array(NOUT);
 for(let i=0;i<NOUT;i++){let a=0;const row=kern[i];for(let j=0;j<NR;j++)a+=row[j]*m[j];
  o[i]=G*a+G*MW.Mb/Math.pow(ri[i]+MW.ab,2);}return o;})();
const MEAS=(rk:number)=>229.0-1.7*(rk-8.122);
const idx=(rk:number)=>Math.round(rk/0.5)-1;
const solve=(gN:number,a0:number,aniso:boolean)=>{let g=gN+a0;
  for(let k=0;k<400;k++){const th=g/a0;
    const P=aniso?proj(1-2*Math.min(th/(1+th),0.5))/P_ISO:1;
    g=0.5*g+0.5*(gN/2+Math.sqrt(gN*gN/4+gN*a0*P));}
  return g;};
const shape=(a0:number,an:boolean)=>{let s=0,n=0;
  for(let rk=6;rk<=25;rk++){const g=solve(gNarr[idx(rk)],a0,an);
    s+=Math.pow(Math.sqrt(g*ri[idx(rk)])/1e3/MEAS(rk)-1,2);n++;}
  return 100*Math.sqrt(s/n);};
type HZg={logMs:number;fgas:number;Re:number};
const D:HZg[]=[{logMs:11.07,fgas:0.35,Re:8.2},{logMs:11.07,fgas:0.45,Re:7.4},
 {logMs:10.71,fgas:0.50,Re:4.9},{logMs:10.62,fgas:0.55,Re:5.5},{logMs:11.07,fgas:0.45,Re:3.3}];
const worstB=(a0:number,an:boolean)=>{let w=0;
  for(const d of D){const gN=G*(Math.pow(10,d.logMs)*MSUN/(1-d.fgas))/Math.pow(d.Re*KPC,2);
    w=Math.max(w,Math.sqrt(solve(gN,a0,an)/gN));}return w;};
console.log("JOINT: Milky Way shape AND the Genzel ceiling of 1.12\n");
console.log("  a0 (bare)      x cH0/2pi   iso: shape / worst    aniso: shape / worst");
for(const f of [0.8,1.0,1.1,1.2,1.38,1.5,1.7]){
  const a=A0P*f;
  console.log(`  ${a.toExponential(3)}   ${f.toFixed(2).padStart(6)}      `+
    `${shape(a,false).toFixed(1).padStart(4)}% / ${worstB(a,false).toFixed(3)}      `+
    `${shape(a,true).toFixed(1).padStart(4)}% / ${worstB(a,true).toFixed(3)}`);
}
console.log("\n  and the joint best with the anisotropy on:");
let best=1e9,bf=0;
for(let f=0.8;f<=2.2;f+=0.01){const a=A0P*f;
  const sh=shape(a,true), w=worstB(a,true);
  if(w>=1.12) continue;
  if(sh<best){best=sh;bf=f;}}
console.log(`    a0 = ${(A0P*bf).toExponential(3)} = ${bf.toFixed(2)} x cH0/2pi`);
console.log(`    MW shape ${best.toFixed(1)}%, Genzel worst ${worstB(A0P*bf,true).toFixed(3)} (< 1.12)`);
console.log(`    effective a0 = ${(A0P*bf*0.7647).toExponential(3)} vs measured 1.200e-10`);

export {};
