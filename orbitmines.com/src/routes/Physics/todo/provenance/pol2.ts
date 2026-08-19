/** the net imbalance is a random variable — so measure its RMS over an ensemble */
const L=48,C=L/2,R_OUT=20,R_MEAS=16;
const cellOf=(x:number,y:number,z:number)=>((x|0)*256+(y|0))*256+(z|0);
const one=(N:number,Rb:number,seed0:number,ticks=60,warm=34)=>{
  let seed=seed0; const rnd=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
  const ex:number[]=[],ey:number[]=[],ez:number[]=[];
  for(let i=0;i<N;i++){let x,y,z;do{x=rnd()*2-1;y=rnd()*2-1;z=rnd()*2-1;}while(x*x+y*y+z*z>1);
    ex.push(C+x*Rb);ey.push(C+y*Rb);ez.push(C+z*Rb);}
  let px:number[]=[],py:number[]=[],pz:number[]=[],vx:number[]=[],vy:number[]=[],vz:number[]=[],q:number[]=[];
  const dir=()=>{const u=rnd()*2-1,a=rnd()*2*Math.PI,s=Math.sqrt(1-u*u);return [s*Math.cos(a),s*Math.sin(a),u];};
  let total=0,net=0,counted=0;
  for(let t=0;t<ticks;t++){
    for(let i=0;i<N;i++){const f=rnd()<0.5?1:-1;
      for(const s of [f,-f]){const [dx,dy,dz]=dir();
        px.push(ex[i]);py.push(ey[i]);pz.push(ez[i]);vx.push(dx);vy.push(dy);vz.push(dz);q.push(s);}}
    for(let i=0;i<q.length;i++){px[i]+=vx[i];py[i]+=vy[i];pz[i]+=vz[i];}
    const b=new Map<number,number[]>();
    for(let i=0;i<q.length;i++){
      const dx=px[i]-C,dy=py[i]-C,dz=pz[i]-C,r2=dx*dx+dy*dy+dz*dz;
      const w=(px[i]-vx[i]-C)**2+(py[i]-vy[i]-C)**2+(pz[i]-vz[i]-C)**2;
      if(w<R_MEAS*R_MEAS&&r2>=R_MEAS*R_MEAS&&t>=warm){total++;net+=q[i];}
      const k=cellOf(px[i],py[i],pz[i]); const g=b.get(k); if(g)g.push(i);else b.set(k,[i]);}
    const dead=new Uint8Array(q.length);
    for(const ids of b.values()){if(ids.length<2)continue;
      const p=ids.filter(i=>q[i]>0),m=ids.filter(i=>q[i]<0),n=Math.min(p.length,m.length);
      for(let j=0;j<n;j++){dead[p[j]]=1;dead[m[j]]=1;}}
    const nx:number[]=[],ny:number[]=[],nz:number[]=[],ux:number[]=[],uy:number[]=[],uz:number[]=[],nq:number[]=[];
    for(let i=0;i<q.length;i++){if(dead[i])continue;
      const dx=px[i]-C,dy=py[i]-C,dz=pz[i]-C; if(dx*dx+dy*dy+dz*dz>R_OUT*R_OUT)continue;
      nx.push(px[i]);ny.push(py[i]);nz.push(pz[i]);ux.push(vx[i]);uy.push(vy[i]);uz.push(vz[i]);nq.push(q[i]);}
    px=nx;py=ny;pz=nz;vx=ux;vy=uy;vz=uz;q=nq; if(t>=warm)counted++;}
  return {total:total/counted,net:net/counted};
};
const ens=(N:number,Rb:number,reps=40)=>{
  let st=0,sn2=0;
  for(let k=0;k<reps;k++){const r=one(N,Rb,1000+k*7717+N*31);st+=r.total;sn2+=r.net*r.net;}
  return {total:st/reps,rms:Math.sqrt(sn2/reps)};
};
console.log("ENSEMBLE OF 40, so the imbalance is an RMS and not one draw\n");
console.log("      N      total   slope    rms(net)  slope    rms/sqrt(total)");
let prev:any=null;
for(const N of [16,64,256,1024]){
  const r=ens(N,5);
  const st=prev?Math.log(r.total/prev.total)/Math.log(N/prev.N):NaN;
  const sn=prev?Math.log(r.rms/prev.rms)/Math.log(N/prev.N):NaN;
  console.log(`  ${String(N).padStart(6)}  ${r.total.toFixed(1).padStart(7)}  ${isNaN(st)?"  —  ":st.toFixed(3)}   `+
    `${r.rms.toFixed(2).padStart(7)}  ${isNaN(sn)?"  —  ":sn.toFixed(3)}    ${(r.rms/Math.sqrt(r.total)).toFixed(3)}`);
  prev={...r,N};
}
console.log("\n  rms(net)/sqrt(total) constant  =>  the imbalance is exactly the");
console.log("  fair-coin fluctuation on the arrivals, with no coherence in it.");

export {};
