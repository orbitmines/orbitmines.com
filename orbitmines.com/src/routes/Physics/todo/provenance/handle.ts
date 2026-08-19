/**
 * BREAKING THE LATTICE — a hole, a knot, or more of it, and what each buys.
 *
 * `degree` closes a door: a 2π rotation is the identity on directions, so no
 * choice of what a particle emits into them can produce something a 2π rotation
 * flips. That argument has a premise worth attacking — it assumes the thing
 * carrying the state is a FUNCTION OF DIRECTION, which it is only because the
 * lattice is a perfect one where every point looks like every other.
 *
 * SO GIVE THE LATTICE SOME TOPOLOGY. Three candidates, and they are not
 * equivalent:
 *
 *   MORE OF IT      more cells, more connections, higher density
 *   A HOLE          a handle — a region the lattice goes round rather than
 *                   through, which is a solid torus
 *   A KNOT          the same handle, tied
 *
 * The measure that separates them is H₁, the first homology, computed here over
 * GF(2) on an honest cubical complex — vertices, edges and faces of the actual
 * cells — rather than on the graph alone, because a lattice graph has enormous
 * numbers of cycles and almost all of them are filled in by faces.
 *
 *   §1  MORE OF IT BUYS NOTHING. b₁ = 0 for a block of any size, and the 2π
 *       argument never cared about DEG anyway — it is about the rotation fixing
 *       directions, not about how many there are.
 *
 *   §2  A HOLE BUYS EXACTLY ONE BIT PER HANDLE. b₁ = 1 for a ring, 2 for two.
 *
 *   §3  A KNOT IS INVISIBLE TO HOMOLOGY — a voxelised trefoil gives b₁ = 1, the
 *       same as a round ring. Knotting lives in π₁ of the complement, which is
 *       non-abelian and which homology cannot see. A strictly richer resource
 *       and a harder one.
 *
 *   §4  AND WHAT A HANDLE GIVES IS THE THING `cover` SAID WAS MISSING: a
 *       Z₂ holonomy — gauge-invariant, two-valued, and NOT a function of
 *       direction, so §1's impossibility argument does not touch it, and not
 *       the XOR sign, so it is a genuine second quantity.
 *
 *   §5  what that would and would not give, and it is honest about which.
 */

// H_1 of a cubical complex over GF(2).  Cells are unit cubes; the complex is
// their vertices, edges and faces.  b1 = nullity(d1) - rank(d2).
type Key=string;
const build=(cells:[number,number,number][])=>{
  const V=new Set<Key>(),E=new Map<Key,[Key,Key]>(),F=new Map<Key,Key[]>();
  const vk=(x:number,y:number,z:number)=>`${x},${y},${z}`;
  const ek=(a:Key,b:Key)=>[a,b].sort().join("|");
  for(const [cx,cy,cz] of cells){
    for(let dx=0;dx<2;dx++)for(let dy=0;dy<2;dy++)for(let dz=0;dz<2;dz++)
      V.add(vk(cx+dx,cy+dy,cz+dz));
    // 12 edges
    for(let a=0;a<3;a++)for(let i=0;i<2;i++)for(let j=0;j<2;j++){
      const p=[0,0,0],q=[0,0,0]; const o=[(a+1)%3,(a+2)%3];
      p[o[0]]=i;p[o[1]]=j;q[o[0]]=i;q[o[1]]=j;q[a]=1;
      const A=vk(cx+p[0],cy+p[1],cz+p[2]),B=vk(cx+q[0],cy+q[1],cz+q[2]);
      E.set(ek(A,B),[A,B]);
    }
    // 6 faces, each as its 4 edges
    for(let a=0;a<3;a++)for(let s=0;s<2;s++){
      const o=[(a+1)%3,(a+2)%3]; const corners:Key[]=[];
      for(const [u,v] of [[0,0],[1,0],[1,1],[0,1]] as [number,number][]){
        const p=[0,0,0]; p[a]=s; p[o[0]]=u; p[o[1]]=v;
        corners.push(vk(cx+p[0],cy+p[1],cz+p[2]));
      }
      const es:Key[]=[];
      for(let k=0;k<4;k++) es.push(ek(corners[k],corners[(k+1)%4]));
      F.set(`${cx},${cy},${cz}|${a}|${s}`,es);
    }
  }
  return {V:[...V],E:[...E.keys()],Emap:E,F:[...F.values()]};
};
// GF(2) rank of a list of sparse columns given as index-sets
const rank2=(cols:number[][],n:number)=>{
  const piv=new Map<number,Set<number>>(); let r=0;
  for(const c of cols){
    let s=new Set(c);
    while(s.size){
      const p=Math.min(...s);
      if(!piv.has(p)){piv.set(p,s);r++;break;}
      const q=piv.get(p)!; const t=new Set<number>();
      for(const x of s) if(!q.has(x)) t.add(x);
      for(const x of q) if(!s.has(x)) t.add(x);
      s=t;
    }
  }
  return r;
};
const b1=(cells:[number,number,number][])=>{
  const {V,E,Emap,F}=build(cells);
  const vi=new Map(V.map((v,i)=>[v,i])), ei=new Map(E.map((e,i)=>[e,i]));
  const d1=E.map(e=>{const [a,b]=Emap.get(e)!;return [vi.get(a)!,vi.get(b)!];});
  const d2=F.map(f=>f.map(e=>ei.get(e)!));
  const r1=rank2(d1,V.length), r2=rank2(d2,E.length);
  return {b1:(E.length-r1)-r2, V:V.length,E:E.length,F:F.length};
};
const voxel=(pts:[number,number,number][],w:number)=>{
  const set=new Set<string>(); const out:[number,number,number][]=[];
  for(const [px,py,pz] of pts)
    for(let dx=-w;dx<=w;dx++)for(let dy=-w;dy<=w;dy++)for(let dz=-w;dz<=w;dz++){
      if(Math.hypot(dx,dy,dz)>w)continue;
      const k=`${Math.round(px)+dx},${Math.round(py)+dy},${Math.round(pz)+dz}`;
      if(!set.has(k)){set.add(k);out.push([Math.round(px)+dx,Math.round(py)+dy,Math.round(pz)+dz]);}
    }
  return out;
};
const curve=(f:(t:number)=>[number,number,number],n=2000,s=1)=>{
  const p:[number,number,number][]=[];
  for(let i=0;i<n;i++){const [x,y,z]=f(2*Math.PI*i/n);p.push([x*s,y*s,z*s]);}
  return p;};
const round=(R:number)=>curve(t=>[R*Math.cos(t),R*Math.sin(t),0]);
const trefoil=(s:number)=>curve(t=>[Math.sin(t)+2*Math.sin(2*t),Math.cos(t)-2*Math.cos(2*t),-Math.sin(3*t)],3000,s);
const blk=(n:number):[number,number,number][]=>{const c:[number,number,number][]=[];
  for(let x=0;x<n;x++)for(let y=0;y<n;y++)for(let z=0;z<n;z++)c.push([x,y,z]);return c;};
// two handles: two disjoint rings
const twoRings=()=>{const a=voxel(round(4),1).map(p=>[p[0],p[1],p[2]] as [number,number,number]);
  const b=voxel(round(4),1).map(p=>[p[0]+20,p[1],p[2]] as [number,number,number]);
  return [...a,...b];};

/** a ±1 assignment on the edges of a cycle, and its holonomy */
const holonomy = (e: number[]) => e.reduce((a, b) => a * b, 1);

export function densityReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. MORE OF IT BUYS NOTHING — AND THE ARGUMENT NEVER CARED");
  line("=".repeat(78));
  line();
  line("  Take the density question first, since it is the cheapest thing to try.");
  line("  A denser lattice has more cells, more edges, and enormously more cycles");
  line("  in its GRAPH — but the cycles are filled in by faces, and what survives");
  line("  is H₁, which counts holes and not connections.");
  line();
  line("     configuration                cells      V      E      F     b₁");
  for (const [n, c] of [
    ["solid block 2×2×2", blk(2)], ["solid block 3×3×3", blk(3)],
    ["solid block 5×5×5", blk(5)], ["solid block 6×6×6", blk(6)],
  ] as [string, [number, number, number][]][]) {
    const r = b1(c);
    line(`     ${n.padEnd(28)}${String(c.length).padStart(5)}${String(r.V).padStart(7)}` +
      `${String(r.E).padStart(7)}${String(r.F).padStart(7)}${String(r.b1).padStart(7)}`);
  }
  line();
  line("  NOUGHT AT EVERY SIZE. Adding cells adds no topology, and it could not:");
  line("  a solid block is contractible however large it is.");
  line();
  line("  AND `degree` §1's ARGUMENT NEVER DEPENDED ON THE COUNT ANYWAY. It says a");
  line("  2π rotation fixes every direction, so it fixes every function of them —");
  line("  which is true of 26 exits, of 124, and of a continuum. Density is not");
  line("  the axis the problem lives on.");

  return out.join("\n");
}

export function handleReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. A HOLE BUYS EXACTLY ONE BIT PER HANDLE");
  line("=".repeat(78));
  line();
  line("  A hole in the sense that matters is not a missing cell — removing a ball");
  line("  from a solid leaves it simply connected. It is a HANDLE: a region the");
  line("  lattice goes round rather than through, which is a solid torus.");
  line();
  line("     configuration                     cells     b₁");
  for (const [n, c] of [
    ["solid block 6×6×6", blk(6)],
    ["one handle — a ring, R = 5", voxel(round(5), 1)],
    ["two handles — two rings", twoRings()],
  ] as [string, [number, number, number][]][])
    line(`     ${n.padEnd(34)}${String(c.length).padStart(5)}${String(b1(c).b1).padStart(7)}`);
  line();
  line("  b₁ COUNTS HANDLES, one bit each, and that is the whole of what homology");
  line("  has to offer. Two handles give two independent cycles and 2² classes.");

  return out.join("\n");
}

export function knotReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND A KNOT IS INVISIBLE TO HOMOLOGY");
  line("=".repeat(78));
  line();
  line("  The natural hope is that tying the handle buys more. It does — but not");
  line("  anything H₁ can see. A voxelised trefoil, at scales where the strands");
  line("  are genuinely separated:");
  line();
  line("     configuration                     cells     b₁");
  for (const s of [2.2, 3, 4, 6, 8]) {
    const c = voxel(trefoil(s), 1);
    line(`     trefoil, scale ${s.toString().padEnd(20)}${String(c.length).padStart(5)}${String(b1(c).b1).padStart(7)}`);
  }
  line(`     round ring for comparison         ${String(voxel(round(5), 1).length).padStart(5)}` +
    `${String(b1(voxel(round(5), 1)).b1).padStart(7)}`);
  line();
  line("  ONE FROM SCALE 4 UP, the same as an unknotted ring. The two small rows");
  line("  are an artefact worth recording rather than hiding: below scale 4 the");
  line("  strands pass close enough that the voxelisation welds them, and b₁ reads");
  line("  6 and then 9 — NOT MONOTONE, which is the giveaway. That is the topology");
  line("  of the discretisation and not of the knot, and anything measuring");
  line("  topology on a lattice has to clear that check before quoting a number.");
  line();
  line("  SO KNOTTING IS REAL AND HOMOLOGY IS THE WRONG INSTRUMENT. A knot lives");
  line("  in π₁ of the COMPLEMENT, which for a trefoil is non-abelian — a strictly");
  line("  richer object than the abelian H₁, and one this file does not compute.");
  line("  That matters for the question at hand, because π₁ is exactly the group");
  line("  that decides statistics, and a non-abelian one is where anyons live.");

  return out.join("\n");
}

export function labelReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. AND A HANDLE CARRIES THE THING `cover` SAID WAS MISSING");
  line("=".repeat(78));
  line();
  line("  `cover` §4 ends by needing a SECOND two-valued quantity — one that is");
  line("  not the XOR sign, because that is spoken for by the interaction. A");
  line("  handle supplies one, and it is worth demonstrating rather than quoting.");
  line();
  line("  Put ±1 on every edge of the cycle. The label is the product round it,");
  line("  and it is only physical if gauge cannot move it — where a gauge move is");
  line("  flipping every edge at one vertex.");
  line();
  let S = 7 >>> 0;
  const rnd = () => {
    S = (S + 0x6D2B79F5) >>> 0;
    let z = S;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
  const N = 24;
  let e = Array.from({ length: N }, () => rnd() < 0.5 ? 1 : -1);
  line(`     start                          holonomy = ${holonomy(e).toFixed(0)}`);
  for (let t = 0; t < 5; t++) {
    const v = (rnd() * N) | 0;
    e = e.slice(); e[v] *= -1; e[(v - 1 + N) % N] *= -1;
    line(`     gauge move at vertex ${String(v).padStart(2)}       holonomy = ${holonomy(e).toFixed(0)}`);
  }
  e = e.slice(); e[0] *= -1;
  line(`     flip ONE edge (not a gauge)    holonomy = ${holonomy(e).toFixed(0)}`);
  line();
  line("  GAUGE-INVARIANT AND TWO-VALUED. And the two properties that matter:");
  line();
  line("     IT IS NOT A FUNCTION OF DIRECTION. It is a property of a CYCLE, so");
  line("     `degree` §1's argument — that a 2π rotation fixes every direction and");
  line("     therefore every function of them — has nothing to act on. The");
  line("     impossibility that closed the last three relaxations does not apply.");
  line();
  line("     IT IS NOT THE XOR SIGN. The XOR sign lives on a ray and decides");
  line("     whether two charges annihilate. This lives on a loop of the lattice");
  line("     and decides nothing about any single meeting. They are independent,");
  line("     which is exactly what `cover` needed and could not find.");

  return out.join("\n");
}

export function verdictReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("5. WHAT THAT WOULD AND WOULD NOT GIVE");
  line("=".repeat(78));
  line();
  line("  WHAT IS MEASURED HERE, and it is less than the answer:");
  line();
  line("     density buys no topology, at any size");
  line("     a handle buys exactly one Z₂ label, gauge-invariant");
  line("     a knot buys nothing homology can see, and something π₁ can");
  line("     the label is independent of the two things the model already has");
  line();
  line("  WHAT IS NOT MEASURED, and it is the actual question. Having a two-valued");
  line("  label is necessary and is not sufficient. Spin-½ needs that label to be");
  line("  the one a 2π ROTATION flips.");
  line();
  line("  >> AND `sufficient` SETTLES IT THE OTHER WAY. A 2π rotation permutes the");
  line("  >> ring's edges among themselves and a product ignores order, so the");
  line("  >> holonomy is UNCHANGED at every angle — b₁ = 1 gives a label the");
  line("  >> rotation never touches. Worse, the invariant that separates the right");
  line("  >> case from the wrong one is TORSION in H₁, not rank, and GF(2)");
  line("  >> homology — which is what this file computes — cannot tell Z from Z/2.");
  line("  >> Every number here is right and the invariant is too coarse for the");
  line("  >> question it was asked.");
  line();
  line("  THE MECHANISM IS REAL AND IS NOT MINE. Friedman and Sorkin showed in");
  line("  1980 that topological geons in general relativity can be fermions —");
  line("  that a handle in space makes the 2π rotation non-contractible in the");
  line("  configuration space, so the object obeys Fermi statistics with no spinor");
  line("  field anywhere. 'Spin one-half from gravity' is the paper's own phrase,");
  line("  and it is the same proposal: SPIN FROM THE TOPOLOGY OF SPACE RATHER THAN");
  line("  FROM A PROPERTY CARRIED THROUGH IT.");
  line();
  line("  SO THE HONEST STATE IS THAT THIS IS THE FIRST RELAXATION THAT IS NOT");
  line("  IMMEDIATELY REFUTED. The previous three died on one line each — a 2π");
  line("  rotation fixes directions, so nothing built on directions can flip. A");
  line("  handle is not built on directions, so that line does not reach it, and");
  line("  the known literature says handles can do exactly what is wanted.");
  line();
  line("  AND WHAT IT WOULD COST THIS MODEL, which is substantial:");
  line();
  line("     THE LATTICE STOPS BEING UNIFORM. Every result in this book is");
  line("     computed on a perfect lattice where one cell is like another — G,");
  line("     DEG, SHEET, the 26 exits, the whole of the gravity arc. A lattice");
  line("     with handles in it has places where those counts are different.");
  line();
  line("     PARTICLES BECOME PLACES. A handle is not something that moves");
  line("     through space; it IS space. That is a much bigger claim than 'matter");
  line("     is a second structure riding on Layer 1' and it is closer to");
  line("     Wheeler's geons than to anything this book has so far proposed.");
  line();
  line("     AND THE HANDLE HAS TO BE STABLE. Nothing in the three rules prevents");
  line("     a handle from being closed by (G/2), which makes new space, or torn");
  line("     open by (G/1), which destroys it. A particle that is a hole needs a");
  line("     reason not to heal, and this model has a rule whose whole business is");
  line("     healing.");
  line();
  line("  That last one is the sharpest, and it is computable rather than an");
  line("  objection — so §6 computes it.");

  return out.join("\n");
}

export function stabilityReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);
  let S = 99 >>> 0;
  const rnd = () => {
    S = (S + 0x6D2B79F5) >>> 0;
    let z = S;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
  const ring6 = voxel(round(6), 2);
  const near = (c: [number, number, number][]) => {
    const s = new Set(c.map(v => v.join(",")));
    const out: [number, number, number][] = [];
    for (const [x, y, z] of c) for (const d of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      const k: [number, number, number] = [x + d[0], y + d[1], z + d[2]];
      const kk = k.join(",");
      if (!s.has(kk)) { s.add(kk); out.push(k); }
    }
    return out;
  };

  line();
  line("=".repeat(78));
  line("6. DOES THE MODEL'S OWN RULE PAIR PRESERVE A HANDLE?");
  line("=".repeat(78));
  line();
  line("  (G/1) destroys the space two charges were standing on and (G/2) makes");
  line("  new room, so cells come and go every tick. A particle that IS a hole");
  line("  needs a reason not to heal. Start from a handle and take cells away:");
  line();
  line("     removed      cells     b₁");
  for (const p of [0, 0.02, 0.05, 0.10, 0.20, 0.35]) {
    const kept = ring6.filter(() => rnd() >= p);
    line(`     ${(p * 100).toFixed(0).padStart(6)}%    ${String(kept.length).padStart(5)}` +
      `${String(b1(kept).b1).padStart(7)}`);
  }
  line();
  line("  And with (G/2) putting cells back at the same rate:");
  line();
  line("     removed      added     cells     b₁");
  for (const p of [0.05, 0.10, 0.20, 0.35]) {
    const kept = ring6.filter(() => rnd() >= p);
    const add = near(kept).filter(() => rnd() < p);
    const both = [...kept, ...add];
    line(`     ${(p * 100).toFixed(0).padStart(6)}%    ${String(add.length).padStart(5)}` +
      `${String(both.length).padStart(10)}${String(b1(both).b1).padStart(7)}`);
  }
  line();
  line("  THE HANDLE DOES NOT HEAL, WHICH WAS THE WORRY, AND IT IS NOT EVEN");
  line("  FRAGILE: b₁ = 1 survives a tenth of the cells being taken away and put");
  line("  back. What happens past that is the opposite failure — b₁ CLIMBS, to 2,");
  line("  then 6, then 31 — because a heavily churned medium grows spurious");
  line("  handles of its own. If a handle is a particle, a noisy vacuum is a");
  line("  vacuum full of particles.");
  line();
  line("  AND THE MODEL'S OWN RATE IS NOWHERE NEAR THE NOISY REGIME. `front`");
  line("  measures the expansion rate this book actually claims at p = 10⁻⁶¹ per");
  line("  tick, against the 10⁻¹ where the topology first becomes noisy — sixty");
  line("  orders of margin. SO AT THE RATE THIS MODEL RUNS, HANDLES ARE STABLE");
  line("  AND THE VACUUM MAKES NONE BY ACCIDENT, which is both halves of what a");
  line("  particle number needs.");
  line();
  line("  That is a positive result and it should be kept in proportion: it says");
  line("  the objection does not bite, not that the construction works. What is");
  line("  still unmeasured is the thing §5 named — that a 2π rotation realises the");
  line("  non-trivial class — and no amount of stability supplies it.");

  return out.join("\n");
}

console.log(densityReport());
console.log(handleReport());
console.log(knotReport());
console.log(labelReport());
console.log(verdictReport());
console.log(stabilityReport());
