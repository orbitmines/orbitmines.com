type V3=[number,number,number];
const key=(v:V3)=>v.join(",");
// cube surface: 6 faces, each given as 4 vertices in outward-oriented order
const cubeFaces=(n:number)=>{
  const F:V3[][]=[];
  for(let a=0;a<3;a++)for(const s of [1,-1]){
    const o=[(a+1)%3,(a+2)%3];
    for(let u=-n;u<n;u++)for(let v=-n;v<n;v++){
      const c=(du:number,dv:number):V3=>{const p=[0,0,0] as V3;p[a]=s*n;p[o[0]]=u+du;p[o[1]]=v+dv;return p;};
      F.push(s>0?[c(0,0),c(1,0),c(1,1),c(0,1)]:[c(0,0),c(0,1),c(1,1),c(1,0)]);
    }
  }
  return F;
};
let faces:V3[][]=cubeFaces(1);
// build the complex, quotienting vertices by phi
const build=(phi:(v:V3)=>V3)=>{
  const vid=new Map<string,number>(); const vlist:string[]=[];
  // the class of v is its ORBIT {v, phi(v)}, keyed by the smaller representative
  const V=(v:V3)=>{const a=key(v),b=key(phi(v)); const k=a<b?a:b;
    if(!vid.has(k)){vid.set(k,vlist.length);vlist.push(k);} return vid.get(k)!;};
  // edges: canonical (min,max) with a sign for orientation
  const eid=new Map<string,number>(); const elist:[number,number][]=[];
  const E=(a:number,b:number):[number,number]=>{           // returns [id, sign]
    if(a===b) return [-1,0];
    const k=a<b?a+"|"+b:b+"|"+a;
    if(!eid.has(k)){eid.set(k,elist.length);elist.push([Math.min(a,b),Math.max(a,b)]);}
    return [eid.get(k)!, a<b?1:-1];
  };
  const faceCols:number[][]=[];
  const seenF=new Set<string>();
  for(const f of faces){
    const vs=f.map(V);
    const col:number[]=[];
    const parts:[number,number][]=[];
    for(let i=0;i<4;i++){const [id,sg]=E(vs[i],vs[(i+1)%4]); if(id>=0)parts.push([id,sg]);}
    // canonical face key: the CYCLIC sequence of vertex classes, least over
    // the four rotations and their reverses.  Sorting the set is not enough --
    // after an antipodal quotient every face uses all four classes.
    const cyc=(a:number[])=>{let best="";
      for(const arr of [a,[...a].reverse()])
        for(let r=0;r<arr.length;r++){
          const s=arr.slice(r).concat(arr.slice(0,r)).join("-");
          if(best===""||s<best)best=s;}
      return best;};
    const fk=cyc(vs);
    if(seenF.has(fk))continue; seenF.add(fk);
    faceCols.push(parts.reduce((acc,[id,sg])=>{acc[id]=(acc[id]||0)+sg;return acc;},[] as number[]));
  }
  return {nV:vlist.length,nE:elist.length,nF:faceCols.length,elist,faceCols};
};
const smith=(M:number[][])=>{const A=M.map(r=>r.slice());const m=A.length,n=m?A[0].length:0;
  const d:number[]=[];let r=0,c=0;
  while(r<m&&c<n){let pi=-1,pj=-1,best=Infinity;
    for(let i=r;i<m;i++)for(let j=c;j<n;j++)if(A[i][j]!==0&&Math.abs(A[i][j])<best){best=Math.abs(A[i][j]);pi=i;pj=j;}
    if(pi<0)break;[A[r],A[pi]]=[A[pi],A[r]];
    for(let i=0;i<m;i++){const t=A[i][c];A[i][c]=A[i][pj];A[i][pj]=t;}
    let done=false;
    while(!done){done=true;
      for(let i=r+1;i<m;i++)if(A[i][c]!==0){const q=Math.round(A[i][c]/A[r][c]);
        for(let j=c;j<n;j++)A[i][j]-=q*A[r][j];
        if(A[i][c]!==0){[A[r],A[i]]=[A[i],A[r]];done=false;}}
      for(let j=c+1;j<n;j++)if(A[r][j]!==0){const q=Math.round(A[r][j]/A[r][c]);
        for(let i=r;i<m;i++)A[i][j]-=q*A[i][c];
        if(A[r][j]!==0){for(let i=0;i<m;i++){const t=A[i][c];A[i][c]=A[i][j];A[i][j]=t;}done=false;}}}
    d.push(Math.abs(A[r][c]));r++;c++;}
  return d;};
const H1=(phi:(v:V3)=>V3)=>{
  const {nV,nE,nF,elist,faceCols}=build(phi);
  const d1:number[][]=elist.map(([a,b])=>{const col=new Array(nV).fill(0);col[a]-=1;col[b]+=1;return col;});
  const d2:number[][]=faceCols.map(c=>{const col=new Array(nE).fill(0);for(let i=0;i<c.length;i++)if(c[i])col[i]=c[i];return col;});
  const r1=smith(d1.map((_,j)=>d1[j])).filter(x=>x!==0).length;
  const s2=smith(d2.map((_,j)=>d2[j]));
  const r2=s2.filter(x=>x!==0).length;
  return {nV,nE,nF,chi:nV-nE+nF,free:(nE-r1)-r2,torsion:s2.filter(x=>x>1)};
};



const anti=(v:V3):V3=>[-v[0],-v[1],-v[2]];
const centre=(f:V3[]):V3=>[0,1,2].map(k=>f.reduce((a,v)=>a+v[k],0)/4) as V3;
const all=cubeFaces(3);
// pair each face with its antipodal image
const ck=(c:V3)=>c.map(v=>v.toFixed(3)).join(",");
const byC=new Map(all.map((f,i)=>[ck(centre(f)),i]));
const pairs:[number,number][]=[];
const used=new Set<number>();
all.forEach((f,i)=>{ if(used.has(i))return;
  const j=byC.get(ck(centre(f).map(v=>-v) as V3));
  if(j!==undefined&&j!==i){pairs.push([i,j]);used.add(i);used.add(j);} });
console.log("removing whole ANTIPODAL PAIRS from RP^2 (n = 3)\n");
console.log("   pairs removed   faces left   H1");
for(const k of [0,1,2,3,5,10]){
  const drop=new Set<number>();
  for(let p=0;p<k;p++){drop.add(pairs[p][0]);drop.add(pairs[p][1]);}
  faces=all.filter((_,i)=>!drop.has(i));
  const h=H1(anti);
  console.log("   "+String(k).padStart(9)+String(h.nF).padStart(13)+"      free "+h.free+
    ", tors "+(h.torsion.length?JSON.stringify(h.torsion):"—"));
}
console.log("\n   ("+pairs.length+" antipodal pairs among "+all.length+" faces)");
