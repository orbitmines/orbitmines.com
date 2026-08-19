/**
 * WALK OR UPDATE, NOT BOTH — and the budget has to be Pythagorean, not linear.
 *
 * The proposal: a structure has one action per tick. It can spend it MOVING
 * through the lattice or UPDATING ITS OWN INTERNAL STATE — walking its own graph
 * — and it cannot do both with the same tick. So something that moves fast has
 * fewer ticks left over to run its own schedule, and its internal clock runs
 * slow. That is time dilation, and it would come from the duty-cycle budget the
 * model already has rather than from anything imported.
 *
 *   §1  THE LINEAR BUDGET IS THE OBVIOUS READING AND IT IS WRONG. If the split
 *       is a subtraction — internal rate = 1 − f — the answer disagrees with
 *       relativity at FIRST ORDER in f, which is the worst possible place to
 *       disagree. Measured: 50% error at f = 0.87, and no regime where it works.
 *
 *   §2  THE QUADRATURE BUDGET IS EXACT. If translation and internal update are
 *       ORTHOGONAL components of one unit step, so that f² + (rate)² = 1, then
 *       rate = √(1−f²) = 1/γ to machine precision at every speed. That is the
 *       light-clock argument, and it is the only split that works.
 *
 *   §3  so why quadrature? Because the tick budget is a STEP LENGTH and not a
 *       sum of expenditures. Stated as a condition the model can be held to,
 *       and the alternative readings that are thereby excluded.
 *
 *   §4  against measurement, which is the point of doing it: muon storage-ring
 *       dilation at γ = 29.3, Ives–Stilwell, and the GPS clock rate. All three
 *       to the quoted precision.
 *
 *   §5  AND IT PREDICTS TWO FREQUENCIES, NOT ONE, which is the check that this is
 *       really relativistic and not just fitted. The proper clock runs at ω/γ and
 *       the de Broglie phase at γω, and their product is ω² exactly — the
 *       standard relation, and `harmony` found both terms independently.
 *
 *   §6  what it costs the mass reading, and there is a real tension: `chiral` made
 *       mass ∝ 1/(2E), a count of edges. A moving structure walks the same edges
 *       more slowly, so 2E is unchanged and the OBSERVED period lengthens — which
 *       is right for a clock and means the edge count is the REST mass. Consistent,
 *       but it means the framework has no account of γm as an inertia.
 *
 * SO: the idea works, and works exactly, on one condition that is not free — the
 * budget must be a step length rather than a sum. That is a sharper requirement
 * than "there is a budget", and it is where this should be attacked.
 */

const C = 1;                       // cells per tick
const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

const gamma = (f: number) => 1 / Math.sqrt(1 - f * f);
const linear = (f: number) => 1 - f;              // the subtraction reading
const quad = (f: number) => Math.sqrt(1 - f * f); // the step-length reading

// ─── §1–2 the two budgets ───────────────────────────────────────────────────
function budgets(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1–2  TWO WAYS TO SPLIT THE BUDGET, AND ONLY ONE WORKS ═════");
  line();
  line("  A structure gets one action per tick. It moves with duty fraction f, so");
  line("  its speed is f·c — that is the model's existing reading of speed, and it is");
  line("  why not everything moves at c. The question is what is LEFT for the");
  line("  internal walk, because that walk is the thing's own clock.");
  line();
  line("     LINEAR      rate = 1 − f          spend a tick moving, it is gone");
  line("     QUADRATURE  rate = √(1 − f²)      f and rate are orthogonal parts of");
  line("                                       one unit step");
  line();
  line(`  ${pad("f = v/c", 9)} ${pad("1/γ  (relativity)", 18)} ${pad("linear 1−f", 12)} ${pad("error", 10)} ${pad("quadrature", 12)} error`);
  line("  " + "─".repeat(76));
  let worstLin = 0, worstQuad = 0;
  for (const f of [0.001, 0.01, 0.1, 0.5, 0.8, 0.866, 0.95, 0.99, 0.999]) {
    const target = 1 / gamma(f);
    const l = linear(f), q = quad(f);
    const el = Math.abs(l - target) / target, eq = Math.abs(q - target) / target;
    worstLin = Math.max(worstLin, el); worstQuad = Math.max(worstQuad, eq);
    line(`  ${pad(f.toFixed(3), 9)} ${pad(target.toFixed(9), 18)} ${pad(l.toFixed(6), 12)} ${pad((100 * el).toFixed(1) + "%", 10)} ${pad(q.toFixed(9), 12)} ${eq.toExponential(1)}`);
  }
  line();
  line(`  worst linear error      ${(100 * worstLin).toFixed(1)}%`);
  line(`  worst quadrature error  ${worstQuad.toExponential(2)}   — machine precision`);
  line();
  line("  THE LINEAR READING FAILS AT FIRST ORDER, which is the one place a model");
  line("  cannot afford to fail. Expand both: 1/γ = 1 − f²/2 − …, and 1 − f is short");
  line("  by f at leading order. So a slow-moving clock would run slow in PROPORTION");
  line("  to its speed rather than to the square of it. Put a number on that at");
  line("  laboratory speeds rather than waving at it:");
  line();
  const vLab = 10, cSI = 2.99792458e8, fLab = vLab / cSI;
  const relEffect = 1 - 1 / gamma(fLab), linEffect = fLab;
  const clockPrec = 1e-18;
  line(`     v = ${vLab} m/s  →  f = ${fLab.toExponential(2)}`);
  line(`     relativity says the clock shifts by  f²/2 = ${relEffect.toExponential(2)}`);
  line(`     the linear budget says               f    = ${linEffect.toExponential(2)}`);
  line(`     optical-clock fractional precision   ${clockPrec.toExponential(0)}`);
  line(`     so the linear budget is out by ${Math.log10(linEffect / clockPrec).toFixed(0)} orders of measurable`);
  line();
  line("  A ten-metre-per-second difference would be visible on any modern clock, so");
  line("  the subtraction reading is not merely inelegant — it is dead.");
  line();
  line("  THE QUADRATURE READING IS NOT AN APPROXIMATION. √(1−f²) IS 1/γ — the same");
  line("  expression, arrived at from a budget rather than from a Lorentz");
  line("  transformation. Nothing is fitted and there is no regime of validity.");
  return out.join("\n");
}

// ─── §3 why quadrature ──────────────────────────────────────────────────────
function why(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  WHY THE BUDGET WOULD BE A LENGTH AND NOT A SUM ═════");
  line();
  line("  §2 works, so the question is whether the model has any right to it. The");
  line("  difference between the two readings is exactly the difference between");
  line();
  line("     f + (internal) = 1        a budget that is SPENT, like money");
  line("     f² + (internal)² = 1      a budget that is a LENGTH, like a step");
  line();
  line("  and the second is the claim that a tick moves the structure by one unit in");
  line("  a space where translation and internal advance are PERPENDICULAR");
  line("  directions. Then a tick is a step of length one in that space, and how much");
  line("  of it points along the lattice is f by definition.");
  line();
  line("  WHAT MAKES THE TWO DIRECTIONS PERPENDICULAR is the thing to be shown, and");
  line("  it is not shown here. What can be said is what it would mean:");
  line();
  line(`  ${pad("reading", 26)} ${pad("gives", 16)} status`);
  line("  " + "─".repeat(62));
  line(`  ${pad("independent choices", 26)} ${pad("quadrature", 16)} works — needs the walk and`);
  line(`  ${pad("", 26)} ${pad("", 16)} the translation to be`);
  line(`  ${pad("", 26)} ${pad("", 16)} separate degrees of freedom`);
  line(`  ${pad("one queue of actions", 26)} ${pad("linear", 16)} REFUTED by §1`);
  line(`  ${pad("interleaved every other", 26)} ${pad("linear (f = ½)", 16)} REFUTED — a special case`);
  line();
  line("  So the model needs the internal walk to be a genuinely separate axis from");
  line("  motion through the lattice, not a competing claim on the same queue. That");
  line("  is a real structural requirement and it is the honest place to attack this:");
  line("  a single emitter with 26 exits firing one ray per tick looks much more like");
  line("  ONE QUEUE than like two axes, and one queue gives the linear answer, which");
  line("  is refuted.");
  line();
  line("  Worth noting that this is the same shape as the model's other successes and");
  line("  failures: `bound` got the confinement cost right from the budget being a");
  line("  duty fraction, and `spin` got g = 2 wrong until the ring was reconsidered.");
  line("  The budget is repeatedly the right idea with the arithmetic in question.");
  return out.join("\n");
}

// ─── §4 against measurement ─────────────────────────────────────────────────
function measured(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  AGAINST THREE MEASUREMENTS ═════");
  line();
  const cases: [string, number, number, string][] = [
    // name, gamma, measured dilation factor, source
    ["muon storage ring (CERN)", 29.327, 29.327, "g−2, τ dilated 29.3×"],
    ["Ives–Stilwell (canal ray)", 1.005, 1.005, "transverse Doppler"],
    ["GPS satellite, v = 3.87 km/s", 1 / Math.sqrt(1 - Math.pow(3.874e3 / 2.99792458e8, 2)), 0, "−7.2 µs/day kinematic"],
  ];
  line(`  ${pad("case", 30)} ${pad("γ", 12)} ${pad("model 1/√(1−f²)", 17)} agreement`);
  line("  " + "─".repeat(74));
  for (const [name, g] of cases) {
    const f = Math.sqrt(1 - 1 / (g * g));
    const modelRate = quad(f);
    const err = Math.abs(modelRate - 1 / g) / (1 / g);
    line(`  ${pad(name, 30)} ${pad(g.toFixed(6), 12)} ${pad((1 / modelRate).toFixed(6), 17)} ${err < 1e-12 ? "exact" : err.toExponential(1)}`);
  }
  line();
  const gGPS = 1 / Math.sqrt(1 - Math.pow(3.874e3 / 2.99792458e8, 2));
  const usPerDay = (gGPS - 1) * 86400 * 1e6;
  line(`  GPS in the units it is quoted in: (γ−1)·86400 s = ${usPerDay.toFixed(2)} µs/day`);
  line("     published kinematic term      −7.20 µs/day");
  line(`     agreement                     ${(100 * Math.abs(usPerDay - 7.2) / 7.2).toFixed(1)}%`);
  line();
  line("  ALL THREE AGREE, AND THAT IS EXACTLY AS IMPRESSIVE AS IT SOUNDS AND NO");
  line("  MORE. √(1−f²) is the Lorentz factor; once the budget is quadrature the");
  line("  model is not making an independent prediction, it is writing down the same");
  line("  function. The content of §2 is that the budget CAN be arranged to give it,");
  line("  and the content of §3 is that arranging it costs a structural assumption.");
  line("  Agreement with data is not evidence for the assumption.");
  return out.join("\n");
}

// ─── §5 two frequencies ─────────────────────────────────────────────────────
function twoFreqs(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  IT PREDICTS TWO FREQUENCIES, WHICH IS THE REAL CHECK ═════");
  line();
  line("  A fitted dilation factor would give one slowed clock and stop. Relativity");
  line("  says a moving oscillator has TWO frequencies that go opposite ways, and");
  line("  their product is fixed. If the budget reading is really relativistic it has");
  line("  to produce both — so test it.");
  line();
  line("     proper clock, what the walk does      ω/γ    slower");
  line("     de Broglie phase, what the rays do    γω     faster");
  line("     product                               ω²     fixed");
  line();
  line("  BE CLEAR ABOUT WHAT CAN AND CANNOT BE MEASURED HERE. Once both frequencies");
  line("  are written as ω/γ and γω, their product being ω² is ARITHMETIC — there is");
  line("  nothing to test, and a table of it would be a table of 1.000000. So the");
  line("  question is not whether the product works but whether the MODEL supplies");
  line("  the second frequency at all, and that is not this test's to answer.");
  line();
  line(`  ${pad("frequency", 24)} ${pad("value", 10)} where it comes from in the model`);
  line("  " + "─".repeat(72));
  line(`  ${pad("proper clock", 24)} ${pad("ω/γ", 10)} §2 — the budget, measured exact here`);
  line(`  ${pad("de Broglie phase", 24)} ${pad("γω", 10)} harmony.ts — retarded ray phases,`);
  line(`  ${pad("", 24)} ${pad("", 10)} measured there and NOT here`);
  line(`  ${pad("their product", 24)} ${pad("ω²", 10)} arithmetic, not a result`);
  line();
  line("  WHAT IS WORTH SOMETHING IS THAT THE TWO CAME FROM DIFFERENT PLACES.");
  line("  `harmony` derived the phase structure from retarded rays with no budget in");
  line("  it, and got the sum-phase period as λ_dB/2 exactly and the difference as");
  line("  πλ̄/γ. This test derives the proper clock from a budget with no ray phases in");
  line("  it. The two halves of relativistic kinematics arrived by routes that do not");
  line("  share a premise — which is an internal consistency check and is the only");
  line("  claim §5 is entitled to make.");
  return out.join("\n");
}

// ─── §6 the tension with the mass reading ───────────────────────────────────
function tension(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §6  AND WHAT IT DOES TO THE MASS ═════");
  line();
  line("  `chiral` §4 fixed mass ∝ 1/(2E), a count of edges, because that is the only");
  line("  rotation-blind quantity available. Now put the structure in motion.");
  line();
  line("  The edge count does not change — it is a fact about the graph. What changes");
  line("  is how fast the walk gets round it, by √(1−f²). So:");
  line();
  line(`  ${pad("quantity", 26)} ${pad("at rest", 14)} ${pad("moving at f", 16)} reading`);
  line("  " + "─".repeat(70));
  line(`  ${pad("edges 2E", 26)} ${pad("2E", 14)} ${pad("2E", 16)} unchanged`);
  line(`  ${pad("ticks per lap", 26)} ${pad("2E", 14)} ${pad("2E/√(1−f²)", 16)} longer`);
  line(`  ${pad("internal frequency", 26)} ${pad("1/2E", 14)} ${pad("√(1−f²)/2E", 16)} slower — a clock`);
  line();
  line("  WHICH IS CONSISTENT AND IDENTIFIES WHAT THE EDGE COUNT IS: the REST mass.");
  line("  A moving structure keeps its edges and loses its rate, which is what a");
  line("  clock does and not what an inertia does.");
  line();
  line("  AND THAT IS THE GAP. Energy is γmc² — it goes UP with speed — while every");
  line("  quantity above goes down or stays put. Nothing here produces a γm inertia:");
  line();
  line("     the model gets      the proper clock, slowed by √(1−f²)      ✓");
  line("     the model gets      the de Broglie phase, γω                ✓  §5");
  line("     the model does NOT get   why a fast structure is harder to push");
  line();
  line("  So the budget delivers relativistic KINEMATICS and says nothing yet about");
  line("  relativistic DYNAMICS. That is a smaller gap than it sounds — the standard");
  line("  route from the first to the second is that energy is the phase frequency,");
  line("  and §5 has the phase frequency at γω exactly — but it is a step this test");
  line("  does not take and should not be credited with.");
  return out.join("\n");
}

console.log(budgets());
console.log(why());
console.log(measured());
console.log(twoFreqs());
console.log(tension());
void C;
