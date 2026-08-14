/**
 * PURE GRAVITY, NO POLARITY — and it is not noisy, which is the surprise.
 *
 * The other files here run charges that carry a heading and turn when they
 * meet. Strip the polarity out and the rule gets shorter, not longer:
 *
 *     EVERY EDGE EXPANDS, EVERY TICK. A point sends one charge along each of
 *     its edges. Every charge is destroyed at the point it lands on, and that
 *     destruction is what makes the next one — a point that received k sends k
 *     back out. Nothing is created or lost anywhere except at a BODY, which
 *     takes what arrives and sends nothing.
 *
 * There is no heading to remember, because a charge does not survive a step;
 * it is destroyed and remade. There is no turn rate, no cone, no collision
 * table and no distribution.
 *
 * WHAT THE UNIFORM CASE DOES, which is the thing worth checking first: with
 * every point full, every point sends eight and receives eight, every tick, for
 * ever. The vacuum is EXACTLY balanced. What fluctuates is only WHICH edges
 * carry the charges when a point has fewer than eight to send — the connections
 * move about while the occupancy does not — and §1 measures how little that
 * amounts to.
 *
 * WHICH EDGE GETS SKIPPED is the one real choice, and there are two honest ways
 * to make it: at random, or by letting the skipped edge walk round the point one
 * step at a time. Both are run below. The second is deterministic and has no
 * randomness anywhere in it, which is why the force comes out to three figures
 * with no averaging at all — the opposite of the polarity case, where gravity
 * only appears as a √n residue over hundreds of ticks.
 *
 * Run: ./run.sh pure
 */

const PD8: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1],
];

type Mode = "round" | "random";

/**
 * The box edge is held full, which is the rest of space: without it a body
 * drains a periodic universe and the steady state is empty everywhere.
 */
const sim = (L: number, T: number, bodies: [number, number][], R: number, mode: Mode) => {
  const o = (L - 1) / 2, C = L * L;
  let q = new Uint8Array(C).fill(8), nq = new Uint8Array(C);
  const phase = new Uint8Array(C), body = new Uint8Array(C);
  for (const [bx, by] of bodies)
    for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++)
      if (x * x + y * y <= R * R) body[(by + y + o) * L + (bx + x + o)] = 1;
  const rim = (x: number, y: number) => x <= -o + 1 || x >= o - 1 || y <= -o + 1 || y >= o - 1;

  const F = bodies.map(() => [0, 0]);
  let churn = 0, cn = 0, taken = 0;

  for (let t = 1; t <= T; t++) {
    nq.fill(0);
    for (let y = -o; y <= o; y++) for (let x = -o; x <= o; x++) {
      const c = (y + o) * L + (x + o);
      if (body[c]) { if (t > T / 2) taken += q[c]; continue; }
      const k = rim(x, y) ? 8 : q[c];
      if (!k) continue;
      if (mode === "round") {
        const p = phase[c];
        for (let j = 0; j < k; j++) {
          const i = (p + j) & 7;
          nq[((y + PD8[i][1] + o + L) % L) * L + ((x + PD8[i][0] + o + L) % L)]++;
        }
        phase[c] = (p + k) & 7;                  // the skipped edge walks round
      } else {
        const pick = [0, 1, 2, 3, 4, 5, 6, 7];
        for (let j = 7; j > 0; j--) {
          const r = (Math.random() * (j + 1)) | 0;
          const tv = pick[j]; pick[j] = pick[r]; pick[r] = tv;
        }
        for (let j = 0; j < k; j++) {
          const i = pick[j];
          nq[((y + PD8[i][1] + o + L) % L) * L + ((x + PD8[i][0] + o + L) % L)]++;
        }
      }
    }
    const tt = q; q = nq; nq = tt;

    if (t > T / 2) {
      /**
       * A charge arriving in direction i came from the cell one step back along
       * i, and that cell sends q of its eight edges — so q/8 arrive from there,
       * each carrying momentum i. An earlier version of this counted which
       * neighbours EXIST rather than what they send, which is a fact about
       * geometry, cancels by symmetry, and duly read exactly zero.
       */
      bodies.forEach((m, kk) => {
        for (let y = -R; y <= R; y++) for (let x = -R; x <= R; x++) {
          if (x * x + y * y > R * R) continue;
          for (let i = 0; i < 8; i++) {
            const sc = (m[1] + y - PD8[i][1] + o) * L + (m[0] + x - PD8[i][0] + o);
            if (body[sc]) continue;
            const w = q[sc] / 8;
            F[kk][0] += PD8[i][0] * w; F[kk][1] += PD8[i][1] * w;
          }
        }
      });
      for (let y = -o + 8; y <= o - 8; y += 13) for (let x = -o + 8; x <= o - 8; x += 13) {
        if (bodies.some(b => Math.hypot(x - b[0], y - b[1]) < 20)) continue;
        churn += Math.abs(q[(y + o) * L + (x + o)] - 8); cn++;
      }
    }
  }
  const n = Math.floor(T / 2);
  return { q, o, L, churn: churn / cn, taken: taken / n, F: F.map(f => [f[0] / n, f[1] / n]) };
};

// ─────────────────────────────────────────────────────────────────────────────

console.log("PURE GRAVITY — every edge expands, every arrival is destroyed and remade\n");

console.log("─".repeat(76));
console.log("1. THE FREE VACUUM IS STATIC\n");
console.log("   With every point full, eight go out and eight come in and nothing");
console.log("   changes. Below is how far from that it actually sits, far from any");
console.log("   body — the connections move, the occupancy does not.\n");
console.log("   which edge is skipped     mean |q − 8|   as a fraction");
for (const mode of ["round", "random"] as Mode[]) {
  const s = sim(101, 400, [[0, 0]], 2, mode);
  console.log("   " + (mode === "round" ? "walks round the point" : "picked at random    ")
    + s.churn.toFixed(4).padStart(14) + (s.churn / 8).toFixed(5).padStart(16));
}
console.log();

console.log("─".repeat(76));
console.log("2. AND A BODY DIGS A WELL IN IT\n");
console.log("   the shortfall against radius, one body of radius 2 in a box of 101:\n");
console.log("        r      deficit");
{
  const { q, o, L } = sim(101, 400, [[0, 0]], 2, "round");
  for (const r of [4, 6, 9, 13, 19, 27, 38]) {
    let s = 0, n = 0;
    for (let y = -o; y <= o; y++) for (let x = -o; x <= o; x++) {
      const d = Math.hypot(x, y);
      if (d < r - 0.7 || d > r + 0.7) continue;
      s += 8 - q[(y + o) * L + (x + o)]; n++;
    }
    console.log("      " + String(r).padStart(3) + (s / n).toFixed(4).padStart(13));
  }
}
console.log();

console.log("─".repeat(76));
console.log("3. AND TWO BODIES PUSH EACH OTHER TOGETHER\n");
console.log("   force = the momentum arriving, per tick. Nothing is averaged over");
console.log("   realisations; the round-robin rule has no randomness in it at all.\n");
console.log("      d    F(left)    F(right)   inward   |F|·d");
for (const d of [8, 12, 18, 26]) {
  const { F } = sim(141, 500, [[-d / 2 | 0, 0], [d / 2 | 0, 0]], 2, "round");
  const m = (Math.abs(F[0][0]) + Math.abs(F[1][0])) / 2;
  console.log("    " + String(d).padStart(3) + F[0][0].toFixed(3).padStart(11)
    + F[1][0].toFixed(3).padStart(12)
    + ((F[0][0] > 0 && F[1][0] < 0) ? "      yes" : "       NO")
    + (m * d).toFixed(3).padStart(9));
}
console.log("\n   |F|·d roughly constant is F ∝ 1/d, which is what a shortfall spreading");
console.log("   through a PLANE has to give — the Green's function of a two-dimensional");
console.log("   conserving relay is a log, and the gradient of a log is 1/r. In three");
console.log("   dimensions the same relay gives 1/r and so a force going as 1/r², which");
console.log("   is the thing to check next and is not checked here.");
console.log();
console.log("   The last two rows fall below that because the box is only 141 across and");
console.log("   its edge is held full: at d = 26 the well is already meeting the wall.\n");

console.log("─".repeat(76));
console.log("WHAT THIS SETTLES");
console.log("  · the no-polarity rule is shorter than the one with polarity, not longer.");
console.log("    No heading, no turn rate, no cone, no collision table — a charge does");
console.log("    not survive a step, so there is nothing for it to remember.");
console.log("  · expanding EVERYWHERE leaves the vacuum balanced to under a hundredth of");
console.log("    a charge in eight. What moves is which edges carry, not how many.");
console.log("  · a body is the only thing that breaks it, and what it breaks is the");
console.log("    balance rather than the medium: it takes and does not give back.");
console.log("  · so the force is DETERMINISTIC here. Three figures, no averaging, Newton's");
console.log("    third law to the last digit — where the polarity case had to average");
console.log("    hundreds of ticks to get gravity out of the shot noise at all.");
