/** Genzel and the Milky Way, redone with the blocking-DERIVED interpolation */
const G=6.674e-11,MSUN=1.98847e30,KPC=3.0857e19,C=2.99792458e8;
const H0=70.9e3/3.0857e22, A0C=C*H0/(2*Math.PI);
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
/** DERIVED from blocking: free fraction 1/(1+g/a0) => enhancement 1+a0/g */
const derived=(g:number,a0:number)=>g/2+Math.sqrt(g*g/4+g*a0);
const MEAS=(rk:number)=>229.0-1.7*(rk-8.122);
const kms=(g:number,r:number)=>Math.sqrt(Math.max(0,g*r))/1e3;
const idx=(rk:number)=>Math.round(rk/0.5)-1;
const shape=(a0:number)=>{let s=0,n=0;
 for(let rk=6;rk<=25;rk++){s+=Math.pow(kms(derived(gN[idx(rk)],a0),ri[idx(rk)])/MEAS(rk)-1,2);n++;}
 return 100*Math.sqrt(s/n);};
type HZg={name:string;z:number;logMs:number;fgas:number;Re:number};
const D:HZg[]=[{name:"COS4_01351",z:0.854,logMs:11.07,fgas:0.35,Re:8.2},
 {name:"D3a_6397",z:1.500,logMs:11.07,fgas:0.45,Re:7.4},
 {name:"GS4_43501",z:1.613,logMs:10.71,fgas:0.50,Re:4.9},
 {name:"zC_406690",z:2.196,logMs:10.62,fgas:0.55,Re:5.5},
 {name:"zC_400569",z:2.242,logMs:11.07,fgas:0.45,Re:3.3}];
const gHZ=(d:HZg)=>G*(Math.pow(10,d.logMs)*MSUN/(1-d.fgas))/Math.pow(d.Re*KPC,2);
console.log("THE GENZEL TEST, REDONE — a0 now a LOCAL blocking threshold, so it");
console.log("does not move with redshift and no cosmological cancellation is");
console.log("needed. Allowed by f_DM < 0.2 is a boost under 1.12.\n");
console.log("   a0 reading                     value      MW shape   worst boost  all pass?");
for(const [nm,a0] of [["cH0/2pi, isotropic",A0C],
  ["  with cone shut cos>0.9",A0C*0.9553],
  ["  with cone shut cos>0.5",A0C*0.7647],
  ["the measured a0",1.2e-10]] as [string,number][]){
  let worst=0; const rows:string[]=[];
  for(const d of D){const b=Math.sqrt(derived(gHZ(d),a0)/gHZ(d)); worst=Math.max(worst,b); rows.push(b.toFixed(3));}
  console.log(`   ${nm.padEnd(28)} ${a0.toExponential(2)}   ${shape(a0).toFixed(1).padStart(5)}%   `+
    `${worst.toFixed(3).padStart(9)}     ${worst<1.12?"YES":"no"}`);
  console.log(`     per galaxy: ${rows.join("  ")}`);
}

export {};
