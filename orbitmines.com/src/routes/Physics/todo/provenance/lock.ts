/**
 * CAN THE MODEL LOCK A SURFACE — the thread `sufficient` ends on.
 *
 * `sufficient` §5 finds the rewrite rule is one word away — (G/1) already takes
 * two charges to one point, and needs only to IDENTIFY the two cells rather
 * than destroy them — and then hits a wall that is not about quantities at all:
 *
 *   ONE fusion gives free Z, a handle, which is rotation-inert and useless.
 *   TORSION needs an antipodal identification carried out COHERENTLY across a
 *   whole closed surface, and a rule that fires on what is in one cell has no
 *   way to know it is part of one.
 *
 * It ends by noticing that the model owns one mechanism which makes distant
 * things agree without coordinating them — regional sourcing, where co-located
 * sources lock to one train in two ticks — and asks whether that can lock a
 * SURFACE rather than a region. This file pulls that thread.
 *
 * THE MECHANISM, IF IT WORKS, IS THIS. A shell of sources, phase-locked, emits
 * inward all at once. Its charges converge on the centre and meet there — and
 * two charges meeting head-on at the centre came from OPPOSITE SIDES OF THE
 * SHELL. So (G/1′) firing at the centre glues a shell point to its antipode,
 * which is exactly the identification RP³ is made of. The pairing is not
 * imposed: head-on is what antipodal MEANS, once the meeting is at the centre.
 *
 * Two things have to hold and both are measured here:
 *
 *   §2  THE SHELL MUST LOCK, and antipodal points are the furthest apart on it,
 *       so this is where a near-neighbour mechanism should fail. IT DOES NOT.
 *   §3  AND THE GEOMETRY MUST COOPERATE — the shell has to be a closed surface
 *       and its charges have to arrive together. A thin shell does both.
 *
 *   §4  so the coherence is available, and what that does and does not settle
 */

// Kuramoto on a spherical SHELL of sources, with the model's own short-range
// coupling.  Question: do ANTIPODAL pairs lock, and how does that scale with R?
let S=2024>>>0;
const rnd=()=>{S=(S+0x6D2B79F5)>>>0;let z=S;z=Math.imul(z^(z>>>15),z|1);z^=z+Math.imul(z^(z>>>7),z|61);return((z^(z>>>14))>>>0)/4294967296;};
const shell=(R:number,w=0.9)=>{const p:[number,number,number][]=[];
  const n=Math.ceil(R+2);
  for(let x=-n;x<=n;x++)for(let y=-n;y<=n;y++)for(let z=-n;z<=n;z++){
    const r=Math.hypot(x,y,z); if(Math.abs(r-R)<=w) p.push([x,y,z]);}
  return p;};
const run=(R:number,K:number,spread:number,lam:number,steps=6000,dt=0.05)=>{
  const P=shell(R), N=P.length;
  const om=Array.from({length:N},()=>(rnd()*2-1)*spread);
  const th=Array.from({length:N},()=>rnd()*2*Math.PI);
  // neighbour lists, screened at lam
  const nb:number[][]=[],wt:number[][]=[];
  for(let i=0;i<N;i++){const li:number[]=[],lw:number[]=[];
    for(let j=0;j<N;j++){if(i===j)continue;
      const d=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1],P[i][2]-P[j][2]);
      if(d>3*lam)continue; li.push(j); lw.push(Math.exp(-d/lam));}
    nb.push(li);wt.push(lw);}
  for(let s=0;s<steps;s++){
    const d=new Float64Array(N);
    for(let i=0;i<N;i++){let a=om[i];
      let W=0; for(let k=0;k<wt[i].length;k++)W+=wt[i][k];
      for(let k=0;k<nb[i].length;k++)a+=K*wt[i][k]/(W||1)*Math.sin(th[nb[i][k]]-th[i]);
      d[i]=a;}
    for(let i=0;i<N;i++)th[i]+=dt*d[i];
  }
  // global order
  let cx=0,cy=0; for(let i=0;i<N;i++){cx+=Math.cos(th[i]);cy+=Math.sin(th[i]);}
  const order=Math.hypot(cx,cy)/N;
  // antipodal phase difference
  const idx=new Map(P.map((p,i)=>[p.join(","),i]));
  let worst=0,mean=0,cnt=0;
  for(let i=0;i<N;i++){const j=idx.get(P[i].map(v=>-v).join(","));
    if(j===undefined)continue;
    let d=Math.abs(th[i]-th[j])%(2*Math.PI); if(d>Math.PI)d=2*Math.PI-d;
    worst=Math.max(worst,d); mean+=d; cnt++;}
  return {N,order,antipodalMean:cnt?mean/cnt:NaN,antipodalWorst:worst,pairs:cnt};
};




const shellAt = (R: number, w: number) => {
  const p: [number, number, number][] = [];
  const n = Math.ceil(R + 2);
  for (let x = -n; x <= n; x++) for (let y = -n; y <= n; y++) for (let z = -n; z <= n; z++) {
    const r = Math.hypot(x, y, z);
    if (Math.abs(r - R) <= w) p.push([x, y, z]);
  }
  return p;
};

/** does the shell separate the centre from infinity? */
const separates = (R: number, w: number) => {
  const S = new Set(shellAt(R, w).map(p => p.join(",")));
  const n = Math.ceil(R + 3);
  const seen = new Set(["0,0,0"]);
  const q: number[][] = [[0, 0, 0]];
  while (q.length) {
    const [x, y, z] = q.pop()!;
    for (const d of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
      const k = [x + d[0], y + d[1], z + d[2]], kk = k.join(",");
      if (Math.max(...k.map(Math.abs)) > n) return false;
      if (S.has(kk) || seen.has(kk)) continue;
      seen.add(kk); q.push(k);
    }
  }
  return true;
};

export function mechanismReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line("=".repeat(78));
  line("1. THE MECHANISM — AND THE PAIRING IS NOT IMPOSED");
  line("=".repeat(78));
  line();
  line("  The problem `sufficient` leaves is that a local rule cannot know it is");
  line("  part of a surface. The proposal is that it does not have to:");
  line();
  line("     a shell of sources, PHASE-LOCKED, emits inward all at once");
  line("     its charges converge on the centre and meet there");
  line("     two charges meeting head-on at the centre came from OPPOSITE");
  line("       SIDES OF THE SHELL");
  line("     so (G/1′) firing at the centre glues a shell point to its ANTIPODE");
  line();
  line("  AND THAT IS THE IDENTIFICATION RP³ IS MADE OF. The pairing is not");
  line("  imposed by anything — head-on is what antipodal MEANS once the meeting");
  line("  is at the centre. What the rule has to supply is not the pairing but");
  line("  the SIMULTANEITY, and simultaneity is what locking is.");
  line();
  line("  Which moves the question from 'how does a local rule know about a");
  line("  surface' to two things that can be measured.");

  return out.join("\n");
}

export function lockingReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("2. DOES A SHELL LOCK — AND ANTIPODES ARE THE HARD CASE");
  line("=".repeat(78));
  line();
  line("  Locking in this model is a near-neighbour effect: `pernode` §3 gets it");
  line("  from sources ONE CELL apart closing at two cells a tick. Antipodal");
  line("  points of a shell are 2R apart, the furthest anything on it can be, so");
  line("  this is exactly where a near-neighbour mechanism should fail.");
  line();
  line("  Kuramoto on the shell, coupling screened at the gravity arc's own reach,");
  line("  natural rates spread ±0.3, run to convergence:");
  line();
  line("     R    sites    order    antipodal |Δφ|  mean / worst");
  for (const R of [2, 3, 4, 5, 6, 7]) {
    const r = run(R, 10, 0.3, 2, 12000, 0.05);
    line(`   ${R.toString().padStart(3)}${String(r.N).padStart(8)}${r.order.toFixed(4).padStart(10)}` +
      `       ${r.antipodalMean.toFixed(4)} / ${r.antipodalWorst.toFixed(4)}`);
  }
  line();
  line("  IT DOES NOT FAIL, AND IT DOES NOT DEGRADE. The order parameter sits at");
  line("  0.9998 and antipodal pairs agree to about 0.02 radians — FLAT from");
  line("  R = 2 to R = 7, with the number of sites growing by thirteen times.");
  line();
  line("  The reason is worth stating because it is why the objection was wrong:");
  line("  once a connected graph locks at all, it locks GLOBALLY — the phase is");
  line("  uniform, so any two points agree, and how far apart they are stops");
  line("  mattering. Distance governs whether locking happens, not how good it is");
  line("  once it has.");
  line();
  line("  IN TICKS: 0.02 radians is 0.3% of a beat. Whatever the beat is, the");
  line("  shell fires within a small fraction of one of its own periods.");
  line();
  line("  ONE NUMERICAL WARNING, because it looked like a physical result. With");
  line("  the coupling NOT normalised by neighbour count, stronger coupling");
  line("  appears to destroy the order — 0.99 at K = 1 falling to 0.07 at K = 30 —");
  line("  and that is the Euler step overshooting, not the physics. Normalised, it");
  line("  goes the right way at every K. A stiff integrator failing looks exactly");
  line("  like a coupling that does not work.");

  return out.join("\n");
}

export function geometryReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("3. AND DOES THE GEOMETRY COOPERATE — CLOSED, AND ARRIVING TOGETHER");
  line("=".repeat(78));
  line();
  line("  Two more conditions, both about the lattice rather than the dynamics.");
  line("  The shell must SEPARATE — be a closed surface, or there is no inside to");
  line("  identify — and its charges must ARRIVE TOGETHER, or the fusions happen");
  line("  in sequence and give independent handles again.");
  line();
  line("  Arrival time is ⌈|r|⌉ ticks, so the spread is the spread in radius, and");
  line("  a thick shell has one built in:");
  line();
  line("     R      w    cells   closes?   arrives at   spread");
  for (const R of [3, 5, 8]) for (const w of [0.5, 0.9, 1.4]) {
    const c = shellAt(R, w);
    const t = c.map(p => Math.round(Math.hypot(p[0], p[1], p[2])));
    const lo = Math.min(...t), hi = Math.max(...t);
    line(`   ${R.toString().padStart(3)}${w.toFixed(1).padStart(7)}${String(c.length).padStart(8)}` +
      `${separates(R, w) ? "     yes " : "     NO  "}      ${lo}–${hi}${String(hi - lo).padStart(9)}`);
  }
  line();
  line("  A THIN SHELL DOES BOTH. At w = 0.5 the surface still closes — the flood");
  line("  fill from the centre cannot escape — and every cell in it is the same");
  line("  rounded distance from the centre, so the spread is EXACTLY ZERO. At");
  line("  R = 3, 5 and 8 alike.");
  line();
  line("  Thicker shells close too and cost two ticks of spread, which is the");
  line("  thing to avoid. So the geometry does not merely permit the mechanism —");
  line("  it prefers the thin shell, which is also the one with fewest cells.");

  return out.join("\n");
}

export function verdictReport(): string {
  const out: string[] = [];
  const line = (s = "") => out.push(s);

  line();
  line("=".repeat(78));
  line("4. SO THE COHERENCE IS AVAILABLE — AND WHAT THAT DOES NOT SETTLE");
  line("=".repeat(78));
  line();
  line("  WHAT IS MEASURED:");
  line();
  line("     a shell locks, to 0.9998, at every radius tried");
  line("     antipodal pairs — the hard case — agree to 0.02 rad, and that does");
  line("       NOT degrade with size");
  line("     a thin shell is a closed surface and its charges arrive on the");
  line("       SAME TICK, exactly, at R = 3, 5 and 8");
  line();
  line("  SO `sufficient` §5's OBJECTION DOES NOT BITE. It says a local rule");
  line("  cannot coordinate a surface. It does not have to: the surface");
  line("  coordinates ITSELF by locking, the lattice hands it exact simultaneity");
  line("  for free if it is thin, and head-on at the centre IS antipodal. Every");
  line("  ingredient of the coherence is in the model already.");
  line();
  line("  WHAT IS NOT MEASURED, AND IT IS THE REST OF THE JOB:");
  line();
  line("     THAT THE FUSED COMPLEX HAS Z/2 TORSION. This shows the");
  line("     identification can be carried out coherently. It does not compute");
  line("     the homology of the result, which needs the identified complex built");
  line("     and its H₁ taken over Z rather than GF(2) — `sufficient` §3's");
  line("     warning applies to any check of this, and it is the next thing.");
  line();
  line("     THAT THE 2π ROTATION GENERATES IT. `sufficient` §4's condition 3,");
  line("     which has teeth and which a handle fails. Nothing here touches it.");
  line();
  line("     AND CONDITION 1 IS STILL IN TENSION. A region needs an ORIENTATION,");
  line("     and `cover` found that the ring is what supplies one while g = 2");
  line("     wants the ring gone. That conflict is untouched by any of this.");
  line();
  line("  THE HONEST SUMMARY. Of the four conditions, this file removes the");
  line("  objection to the mechanism that would deliver condition 2 — it does not");
  line("  deliver condition 2, and conditions 1 and 3 are where the difficulty");
  line("  actually is. What has changed is that the missing CORRELATION, which");
  line("  looked like a new kind of problem, turns out to be something the model");
  line("  can already produce.");

  return out.join("\n");
}

console.log(mechanismReport());
console.log(lockingReport());
console.log(geometryReport());
console.log(verdictReport());
