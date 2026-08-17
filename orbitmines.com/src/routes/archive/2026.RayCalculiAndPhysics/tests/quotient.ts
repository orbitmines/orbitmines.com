/**
 * THE CONTAINERS, BUILT — and the torsion is fatally fragile.
 *
 * `contain` argues that the container must be RP³ and leaves two things undone:
 * build the identified complex and take its H₁ over Z rather than GF(2), and
 * find out whether torsion survives the churn of (G/1) and (G/2). This does
 * both, and the second one goes badly.
 *
 *   §1  the complexes, built. A cubical sphere quotiented by an involution, with
 *       integer homology by Smith normal form. Only the FREE involution gives
 *       torsion — and χ alone does not tell them apart, which is worth knowing
 *       because a reflection gives χ = 1 exactly as RP² does and has H₁ = 0.
 *
 *   §2  stable under refinement, so it is not an artefact of a coarse sphere.
 *
 *   §3  AND THE TORSION DIES ON THE FIRST BROKEN PAIR. Remove one antipodal pair
 *       of faces out of 108 and Z/2 becomes free Z — the container stops being a
 *       fermion and becomes a handle. Against `handle` §6, where a free class
 *       survives a tenth of the cells being removed and replaced, this is
 *       maximal fragility.
 *
 *   §4  which is a lifetime, and it is far too short. At the model's own
 *       expansion rate the container lasts about 10⁸ years for a hundred cells,
 *       and less for anything bigger, against an electron stable past 10²⁸ and a
 *       proton past 10³⁴.
 *
 * THAT IS THE SHARPEST PREDICTION THE WHOLE CONSTRUCTION MAKES AND IT FAILS.
 * Worth saying plainly: the topology gives a fermion that decays, and a decaying
 * electron is not an electron.
 */

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




const HBAR = 1.054571817e-34, C_LIGHT = 2.99792458e8, G_N = 6.67430e-11;
const T_PLANCK = Math.sqrt(HBAR * G_N / Math.pow(C_LIGHT, 5));
const YEAR = 3.15576e7;

const anti = (v: V3): V3 => [-v[0], -v[1], -v[2]];
const centreOf = (f: V3[]): V3 => [0, 1, 2].map(k => f.reduce((a, v) => a + v[k], 0) / 4) as V3;

export function sweepReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE COMPLEXES, BUILT — AND ONLY A FREE INVOLUTION GIVES TORSION");
  line("=".repeat(78));
  line();
  line("  A cubical sphere — the surface of a cube of cells — quotiented by an");
  line("  involution, with H₁ taken over Z by Smith normal form so torsion is");
  line("  visible where GF(2) would hide it.");
  line();
  line("  Justified by van Kampen: filling the sphere in with a ball adds no");
  line("  1-cycles and kills none, since the ball is simply connected. So the");
  line("  quotient of the BOUNDARY gives the H₁ of the solid container.");
  line();
  faces = cubeFaces(2);
  line("     involution              fixed points     V   E   F   χ      H₁");
  const maps: [string, (v: V3) => V3, string][] = [
    ["identity — no gluing", v => v, "all fixed"],
    ["antipodal  v → −v", anti, "NONE — free"],
    ["reflect one axis", v => [-v[0], v[1], v[2]], "a circle"],
    ["rotate π about z", v => [-v[0], -v[1], v[2]], "two poles"],
  ];
  for (const [n, f, fx] of maps) {
    const h = H1(f);
    line(`     ${n.padEnd(24)}${fx.padEnd(17)}${String(h.nV).padStart(3)}` +
      `${String(h.nE).padStart(4)}${String(h.nF).padStart(4)}${String(h.chi).padStart(4)}` +
      `    free ${h.free}, tors ${h.torsion.length ? JSON.stringify(h.torsion) : "—"}`);
  }
  line();
  line("  TORSION APPEARS ONLY FOR THE ANTIPODAL MAP, which is the only one of");
  line("  the four with no fixed point. A reflection fixes a circle, a π rotation");
  line("  fixes two poles, and both give free rank nought and no torsion.");
  line();
  line("  AND χ DOES NOT DISTINGUISH THEM, which is the trap. The reflection has");
  line("  χ = 1, exactly as RP² does, and H₁ = 0. Euler characteristic is not the");
  line("  invariant — a quotient can have the right χ and be a disc.");
  line();
  line("  Which also settles the question `contain` §2 raised in the abstract: the");
  line("  gluing must be free, and on a sphere the only free involution is the");
  line("  antipodal one. There is nothing else to try.");

  return out.join("\n");
}

export function refineReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. AND IT IS NOT AN ARTEFACT OF A COARSE SPHERE");
  line("=".repeat(78));
  line();
  line("     n   faces   involution        V    E    F   χ      H₁");
  for (const n of [1, 2, 3]) {
    faces = cubeFaces(n);
    for (const [nm, f] of [["identity", (v: V3) => v], ["antipodal", anti]] as [string, (v: V3) => V3][]) {
      const h = H1(f);
      line(`   ${String(n).padStart(3)}${String(faces.length).padStart(8)}   ${nm.padEnd(17)}` +
        `${String(h.nV).padStart(4)}${String(h.nE).padStart(5)}${String(h.nF).padStart(5)}` +
        `${String(h.chi).padStart(4)}    free ${h.free}, tors ${h.torsion.length ? JSON.stringify(h.torsion) : "—"}`);
    }
  }
  line();
  line("  χ = 2 unquotiented and χ = 1 antipodally at every refinement, with the");
  line("  torsion [2] each time. That is S² and RP², and the numbers are the right");
  line("  ones rather than nearly right.");

  return out.join("\n");
}

export function fragilityReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND THE TORSION DIES ON THE FIRST BROKEN PAIR");
  line("=".repeat(78));
  line();
  line("  (G/1) destroys space and (G/2) makes it, so cells come and go. `handle`");
  line("  §6 measures a free class surviving a tenth of them being removed and");
  line("  replaced. Torsion is a different animal.");
  line();
  const all = cubeFaces(3);
  const ck = (c: V3) => c.map(v => v.toFixed(3)).join(",");
  const byC = new Map(all.map((f, i) => [ck(centreOf(f)), i]));
  const pairs: [number, number][] = [];
  const used = new Set<number>();
  all.forEach((f, i) => {
    if (used.has(i)) return;
    const j = byC.get(ck(centreOf(f).map(v => -v) as V3));
    if (j !== undefined && j !== i) { pairs.push([i, j]); used.add(i); used.add(j); }
  });
  line(`  ${all.length} faces, forming ${pairs.length} antipodal pairs. Remove whole pairs, since`);
  line("  removing one face of a pair leaves its partner to cover for it and the");
  line("  quotient does not notice:");
  line();
  line("     pairs removed    faces left     H₁");
  for (const k of [0, 1, 2, 5, 10]) {
    const drop = new Set<number>();
    for (let p = 0; p < k; p++) { drop.add(pairs[p][0]); drop.add(pairs[p][1]); }
    faces = all.filter((_, i) => !drop.has(i));
    const h = H1(anti);
    line(`     ${String(k).padStart(9)}${String(h.nF).padStart(14)}      free ${h.free}, ` +
      `tors ${h.torsion.length ? JSON.stringify(h.torsion) : "—"}`);
  }
  line();
  line("  ONE PAIR OUT OF A HUNDRED AND EIGHT. Z/2 becomes free Z, and the object");
  line("  stops being a fermion and becomes a handle — which `sufficient` §1 shows");
  line("  is rotation-inert and therefore a boson.");
  line();
  line("  AND THE ASYMMETRY IS THE POINT. A free class is a loop, and a loop can");
  line("  route round damage. Torsion is a statement that a cycle traversed TWICE");
  line("  bounds, and that needs the identification intact EVERYWHERE — one broken");
  line("  pair and the double no longer bounds anything.");
  line();
  line("     handle, free Z      survives 10% of cells removed      `handle` §6");
  line("     container, Z/2      dies at one pair in 108            here");

  return out.join("\n");
}

export function lifetimeReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. WHICH IS A LIFETIME, AND IT IS FAR TOO SHORT");
  line("=".repeat(78));
  line();
  line("  If one broken identification destroys the particle, the lifetime is one");
  line("  over the rate at which any of its cells is churned. `front` measures the");
  line("  expansion rate this book claims at p = 10⁻⁶¹ per cell per tick.");
  line();
  line(`     Planck tick                    ${T_PLANCK.toExponential(3)} s`);
  line();
  line("     container cells    lifetime (ticks)      in years");
  for (const N of [1e2, 1e6, 1e20, 1e40]) {
    const ticks = 1 / (N * 1e-61);
    line(`     ${N.toExponential(0).padStart(13)}    ${ticks.toExponential(2).padStart(12)}` +
      `      ${(ticks * T_PLANCK / YEAR).toExponential(2)}`);
  }
  line();
  line("     measured           electron  > 6.6·10²⁸ yr");
  line("                        proton    > 1.6·10³⁴ yr");
  line("     for scale          the universe is 1.4·10¹⁰ yr old");
  line();
  line("  A HUNDRED-CELL CONTAINER LASTS 10⁸ YEARS, twenty orders short of the");
  line("  electron bound, and it gets worse with size — which is the wrong way");
  line("  round, since a bigger particle should not be more fragile. Anything of");
  line("  the size a real particle would have to be, in cells, is gone");
  line("  immediately.");
  line();
  line("  SO THE SHARPEST PREDICTION THE CONSTRUCTION MAKES IS THAT MATTER DECAYS,");
  line("  AND IT DOES NOT. That is a refutation and not a caveat, and it should be");
  line("  recorded as the outcome of the sequence rather than buried in it: the");
  line("  topology gives a fermion, and the fermion does not last.");
  line();
  line("  WHAT WOULD HAVE TO CHANGE, stated so it can be attacked:");
  line();
  line("     A MECHANISM THAT REPAIRS THE IDENTIFICATION. `lock` shows a shell can");
  line("     fire coherently; if it keeps firing, a broken pair could be remade");
  line("     rather than merely lost. That turns the question from whether the");
  line("     torsion survives into whether repair outruns damage, which is a rate");
  line("     comparison and not a topological one.");
  line();
  line("     OR THE CHURN MUST NOT REACH IT. Every cell of the container is a");
  line("     place where (G/1) can fire. If a container were somehow closed to");
  line("     the vacuum's own creation and annihilation, the rate would not be");
  line("     10⁻⁶¹ but nought — and nothing in the three rules provides for that.");
  line();
  line("  Both are real proposals and neither is in the model. WHAT IS NOT");
  line("  AVAILABLE is making the torsion more robust: §3's fragility is a fact");
  line("  about torsion and not about this lattice, so no amount of building it");
  line("  differently will help.");

  return out.join("\n");
}

console.log(sweepReport());
console.log(refineReport());
console.log(fragilityReport());
console.log(lifetimeReport());
