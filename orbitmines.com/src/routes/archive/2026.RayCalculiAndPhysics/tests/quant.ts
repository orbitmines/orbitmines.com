const d:[number,number,number][]=[];
for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++)if(x||y||z)d.push([x,y,z]);
const cos=new Set<string>();
for(const v of d){const m=Math.hypot(v[0],v[1],v[2]); cos.add((v[2]/m).toFixed(6));}
console.log("the 26 exits have only these direction cosines along any axis:");
console.log("  ", [...cos].map(Number).sort((a,b)=>b-a).join("  "));
console.log();
console.log("  1        = 1/1     the 6 faces");
console.log("  0.707107 = 1/√2    the 12 edges");
console.log("  0.577350 = 1/√3    the 8 corners");
console.log();
console.log("So a cone cut anywhere in (0, 0.577) shuts EXACTLY the same set.");
console.log("The projection factor is a STEP function of the cut, not a smooth");
console.log("one, and a galaxy's occupancy never crosses a step:");
const proj=(cut:number)=>{let s=0,n=0;
  for(const v of d){const m=Math.hypot(v[0],v[1],v[2]),uz=v[2]/m;
    if(uz>cut)continue;s+=Math.abs(uz);n++;} return s/n;};
console.log();
console.log("     cut      open   ⟨|cos|⟩   P/P_iso");
for(const c of [1.01,0.99,0.8,0.6,0.5,0.3,0.0,-0.5]){
  console.log(`  ${c.toFixed(2).padStart(7)}   ${String(d.filter(v=>{const m=Math.hypot(v[0],v[1],v[2]);return v[2]/m<=c;}).length).padStart(4)}   `+
    `${proj(c).toFixed(4)}   ${(proj(c)/proj(1.01)).toFixed(4)}`);
}

export {};
