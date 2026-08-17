/**
 * WHAT ANY OF THIS IS IN THE THREE RULES — and a correction to `repair`.
 *
 * `emit`, `chiral` and `repair` all talk about "edges", "damage" and "the
 * schedule putting a cell back" as though those were primitives. They are not.
 * The model has three rules and charges of ±1 on 26 exits, and every one of
 * those words has to be one of them or the construction is a story about graphs
 * rather than a claim about this model. So take them one at a time.
 *
 *   §1  THE DICTIONARY. Damage is (G+M/1) — annihilation shortens the line, and
 *       a shortened line is a missing cell. Repair is (G+M/2) — creation adds
 *       space. The rail jump is (G+M/3) — turning. All three already exist and
 *       nothing here needs a fourth.
 *
 *   §2  AND THAT BREAKS `repair` §1, WHICH ASSUMED DAMAGE AT THE VACUUM RATE.
 *       (G+M/1) fires where two rays MEET, and a structure is full of its own
 *       rays — so it damages itself at O(1) and not at p = 10⁻⁶¹. The duty
 *       fraction is not p·τ. It is a ratio of two O(1) rates, and `repair`'s
 *       33-to-92 orders of margin is WRONG AS STATED.
 *
 *   §3  what saves it is the sign, and this is the real mechanism. (G+M/1)
 *       annihilates OPPOSITE charges; alike charges turn instead, by (G+M/3).
 *       So a structure whose rays are all one sign cannot annihilate its own
 *       space — COHERENCE SUPPRESSES SELF-DAMAGE — and the suppression is
 *       measured here as a function of how mixed the population is.
 *
 *   §4  BUT THE TWIST IS EXACTLY WHERE BOTH SIGNS MEET, because that is what a
 *       twist does. Measured: the opposite-sign meeting rate is concentrated at
 *       the twist, so the fermion's own defining feature is its most damaged
 *       place. That is a prediction and a problem in one.
 *
 *   §5  what is being repaired, and by what. Not an agent, not a special cell:
 *       the repairer is (G+M/2) firing between the structure's own alike rays,
 *       which is to say the structure is an emitter obeying the same three rules
 *       as everything else. There is no other kind of thing available.
 *
 * SO: the discrete reading costs `repair` its headline number and replaces it
 * with a better mechanism and a worse problem. The margin now depends on the
 * coherence of the structure's own emission rather than on the vacuum's rate,
 * and the twist is a self-damaging defect that the coherence cannot protect.
 */

const P_VAC = 1e-61;
const PAULI_BOUND = 1.7e-26;
const pad = (s: string, w: number) => s.length >= w ? s : s + " ".repeat(w - s.length);

const rng = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ─── §1 the dictionary ──────────────────────────────────────────────────────
function dictionary(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line("═════ §1  THE DICTIONARY — every word, in the three rules ═════");
  line();
  line("  Nothing below is new machinery. It is the previous three tests' English");
  line("  translated back into what the model actually has.");
  line();
  line(`  ${pad("the word used", 20)} ${pad("the rule it is", 14)} what actually happens`);
  line("  " + "─".repeat(74));
  line(`  ${pad("a broken edge", 20)} ${pad("(G+M/1)", 14)} annihilation shortens the line, so`);
  line(`  ${pad("", 20)} ${pad("", 14)} the cell of space is GONE — that is`);
  line(`  ${pad("", 20)} ${pad("", 14)} all "damage" ever meant`);
  line(`  ${pad("repair", 20)} ${pad("(G+M/2)", 14)} creation adds space back where it`);
  line(`  ${pad("", 20)} ${pad("", 14)} fires`);
  line(`  ${pad("the rail jump", 20)} ${pad("(G+M/3)", 14)} TURNING. A charge reaching the`);
  line(`  ${pad("", 20)} ${pad("", 14)} twist is turned rather than passed,`);
  line(`  ${pad("", 20)} ${pad("", 14)} and a turn is what changes which`);
  line(`  ${pad("", 20)} ${pad("", 14)} rail it is on`);
  line(`  ${pad("the emitter/structure", 20)} ${pad("none — a thing", 14)} charges of ±1 on the 26 exits`);
  line(`  ${pad("the schedule", 20)} ${pad("none — an order", 14)} which exit fires when`);
  line();
  line("  THE RAIL JUMP IS THE ONE WORTH DWELLING ON, because the visualisation");
  line("  stipulated it. Drawing a crossing and saying 'now you are on the other");
  line("  rail' is not a mechanism. (G+M/3) is: turning is already the rule that");
  line("  changes a charge's direction without destroying it, and a twist is a place");
  line("  where the turn lands you on the other side. So the jump costs nothing new,");
  line("  and it was there before anyone went looking for it.");
  line();
  line("  WHAT IS NOT IN THE DICTIONARY, and this is the point of writing it out:");
  line("  there is no rule that deletes a cell at a fixed background rate. `emit`");
  line("  and `repair` both assumed one. §2 is what happens when that is removed.");
  return out.join("\n");
}

// ─── §2 the correction ──────────────────────────────────────────────────────
function correction(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §2  WHICH BREAKS `repair` §1 ═════");
  line();
  line("  `repair` put damage at p = 10⁻⁶¹, the vacuum's expansion rate, and repair");
  line("  at 1/τ, the structure's own. The 59 orders between them were the whole");
  line("  argument. But (G+M/1) does not fire at a background rate — IT FIRES WHERE");
  line("  TWO RAYS MEET, and the structure is the densest concentration of rays");
  line("  anywhere, because that is what an emitter is.");
  line();
  line("  So the two rates are not p and 1/τ. They are both O(1):");
  line();
  line(`  ${pad("process", 26)} ${pad("repair said", 12)} ${pad("actually", 12)} why`);
  line("  " + "─".repeat(70));
  line(`  ${pad("(G+M/1) at the structure", 26)} ${pad("1e-61", 12)} ${pad("O(1)", 12)} its own rays meet`);
  line(`  ${pad("(G+M/2) at the structure", 26)} ${pad("1e-2", 12)} ${pad("O(1)", 12)} same reason`);
  line(`  ${pad("either, in empty space", 26)} ${pad("1e-61", 12)} ${pad("1e-61", 12)} nothing to meet`);
  line();
  line("  AND THEREFORE the duty fraction is not p·τ. It is");
  line();
  line("     f_b = (rate of G+M/1 here) / (rate of G+M/1 + rate of G+M/2 here)");
  line();
  line("  a ratio of two comparable numbers, which for anything like equal rates is");
  line("  of order one half — the same catastrophe `repair` §5 identified for the");
  line("  vacuum-driven case, arriving now by the front door.");
  line();
  line(`  So repair.ts's headline — 10⁻⁵⁹ against a Pauli bound of ${PAULI_BOUND.toExponential(1)},`);
  line("  passing by 33 orders — IS WRONG AS STATED. It is not that the number is");
  line("  imprecise; the quantity it divides by is the wrong quantity. What replaces");
  line("  it has to come from the SIGNS, which is §3.");
  return out.join("\n");
}

// ─── §3 coherence suppresses self-damage ────────────────────────────────────
function coherence(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §3  THE SIGN IS WHAT SAVES IT ═════");
  line();
  line("  The rules do not treat all meetings alike, and the article has said so");
  line("  since the feedback sign was settled: (G+M/1) annihilates between two");
  line("  sources — OPPOSITE charges — and (G+M/3) sends an ALIKE pair back to turn");
  line("  instead. So which rule fires is decided by the two signs:");
  line();
  line(`     opposite  (+ meets −)   →  (G+M/1)  annihilate  →  DAMAGE`);
  line(`     alike     (+ meets +)   →  (G+M/3)  turn        →  harmless`);
  line();
  line("  Which gives a mechanism nobody put in: a structure whose rays all carry");
  line("  the SAME sign cannot annihilate its own space. Measure the suppression as");
  line("  a function of how mixed the ray population is — mixing fraction x is the");
  line("  share of rays carrying the minority sign.");
  line();
  line(`  ${pad("mixing x", 10)} ${pad("P(opposite)", 13)} ${pad("measured", 12)} ${pad("f_b = P(opp)", 13)} vs Pauli bound`);
  line("  " + "─".repeat(70));
  const N = 400000;
  for (const x of [0.5, 0.1, 0.01, 1e-3, 1e-6, 1e-12, 1e-29]) {
    const r = rng(991);
    // two independently drawn rays meet; opposite signs annihilate
    const pred = 2 * x * (1 - x);
    let hits = 0;
    if (x >= 1e-3) {
      for (let i = 0; i < N; i++) {
        const a = r() < x, b = r() < x;
        if (a !== b) hits++;
      }
    }
    const meas = x >= 1e-3 ? (hits / N).toExponential(3) : "— too rare";
    const verdict = pred < PAULI_BOUND ? "PASSES" : `fails by ${Math.log10(pred / PAULI_BOUND).toFixed(0)} orders`;
    line(`  ${pad(x.toExponential(0), 10)} ${pad(pred.toExponential(3), 13)} ${pad(meas, 12)} ${pad(pred.toExponential(2), 13)} ${verdict}`);
  }
  line();
  line("  SO THE MARGIN IS NOW A STATEMENT ABOUT COHERENCE, NOT ABOUT THE VACUUM.");
  line("  To meet the Pauli bound the structure's emission must be pure to about one");
  line("  part in 10²⁶ — every ray the same sign, to that precision. That is a very");
  line("  demanding requirement and it is a FALSIFIABLE one, which the p·τ version");
  line("  was not, because it is a statement about the emitter rather than about a");
  line("  number nobody can measure.");
  line();
  line("  Worth saying what supports it: `lock` measured a shell holding phase to");
  line("  0.02 rad with antipodal agreement FLAT in R, and a phase-locked emitter");
  line("  firing one sign is exactly a coherent one. Whether locking delivers 10⁻²⁶");
  line("  purity is not measured and is the obvious next thing to ask.");
  return out.join("\n");
}

// ─── §4 the twist is the weak point ─────────────────────────────────────────
function twistProblem(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §4  AND THE TWIST IS WHERE BOTH SIGNS MEET ═════");
  line();
  line("  §3's protection needs one sign everywhere. The twist is defined by the");
  line("  sign flipping across it. Those two statements are in direct tension and");
  line("  the tension is not repairable by being clever about the geometry:");
  line();
  line("     lap 1 carries +.  lap 2 carries −.  At the twist they are adjacent.");
  line();
  line("  First a correction to how this ought to be asked. On a Möbius ladder the");
  line("  token is on the OUTER rail for lap 1 and the INNER rail for lap 2, so the");
  line("  signs are not mixed sector by sector — THEY ARE SEGREGATED BY RAIL. Outer");
  line("  rays are all +, inner rays are all −. So opposite-sign meetings happen");
  line("  wherever the two rails come close, and the rate goes as the inverse square");
  line("  of their separation, since that is how ray density falls off.");
  line();
  line("  And the twist is precisely where the two rails CROSS — separation zero.");
  line("  So compute the separation profile and the meeting rate it implies.");
  line();
  const SEG = 16, TWIST = 0;
  const GAP = 8;              // rail separation in cells, away from the twist
  const WIDTH = 2;            // angular width of the crossing, in sectors
  const FLOOR = 1;            // one cell: the lattice's own regularisation
  // across the crossing the rails swap, so their offset passes linearly through 0
  const offset = (s: number) => {
    let d = Math.min(Math.abs(s - TWIST), SEG - Math.abs(s - TWIST));
    return d >= WIDTH ? 1 : d / WIDTH;
  };
  const sep = (s: number) => Math.max(FLOOR, GAP * offset(s));
  const rate = (s: number) => 1 / (sep(s) * sep(s));
  const rates = Array.from({ length: SEG }, (_, s) => rate(s));
  const tot = rates.reduce((p, c) => p + c, 0);
  line(`  ${pad("sector", 10)} ${pad("separation", 11)} ${pad("rate ∝ 1/d²", 24)} share`);
  line("  " + "─".repeat(56));
  for (const s of [0, 1, 2, 4, 8, 15]) {
    const bar = "█".repeat(Math.max(1, Math.round(22 * rates[s] / Math.max(...rates))));
    line(`  ${pad(String(s) + (s === TWIST ? " ←twist" : ""), 10)} ${pad(sep(s).toFixed(1), 11)} ${pad(bar, 24)} ${(100 * rates[s] / tot).toFixed(1)}%`);
  }
  line();
  const atTwist = rates[TWIST] / tot, even = 1 / SEG;
  line(`  at the twist: ${(100 * atTwist).toFixed(1)}%  against ${(100 * even).toFixed(1)}% for an even spread`);
  line(`  concentration: ${(atTwist / even).toFixed(1)}× — and it scales as (GAP/FLOOR)² = ${(GAP / FLOOR) ** 2}`);
  line();
  if (atTwist > 1.5 * even) {
    line("  THE OPPOSITE-SIGN MEETINGS PILE UP AT THE TWIST, as the geometry forces.");
    line("  So the fermion's defining feature is also the one place its coherence");
    line("  cannot protect it, and (G+M/1) preferentially eats the twist. The");
    line("  concentration is set by how wide the ribbon is compared with one cell, so");
    line("  a WIDER ribbon is WORSE here — the opposite of what `emit` §5 wanted.");
  } else {
    line("  THEY DO NOT CONCENTRATE, which would be the better outcome — but check the");
    line("  regularisation before believing it, since the whole effect lives in how");
    line("  the 1/d² is cut off at one cell.");
  }
  line();
  line("  WHICH IS A SHARP PREDICTION AND A SHARP PROBLEM AT ONCE:");
  line();
  line("     the twist is the most fragile cell in the structure, AND `emit` §5");
  line("     already measured that with a single twisted edge THAT EDGE IS ALWAYS");
  line("     the critical one. The two failures are the same failure.");
  line();
  line("  `emit` §5's fix — spread the twists so no single cut is fatal — is now");
  line("  doing double duty: it also spreads the opposite-sign meetings, so it is");
  line("  not merely redundancy but the only configuration in which the protection");
  line("  and the topology are compatible. That is a real result and it was not");
  line("  visible before the rules were written out.");
  return out.join("\n");
}

// ─── §5 what is repairing what ──────────────────────────────────────────────
function what(): string {
  const out: string[] = []; const line = (s = "") => out.push(s);
  line();
  line("═════ §5  WHAT IS DOING THE REPAIRING, AND WHAT IS BEING REPAIRED ═════");
  line();
  line("  Two questions that have been left ambiguous and should not be.");
  line();
  line("  IS THE REPAIRER AN EMITTER OBEYING THE SAME RULES? Yes, and not as a");
  line("  design choice — there is nothing else available. The model has space,");
  line("  charges on exits, and three rules. A 'repair mechanism' can only be one of");
  line("  the three rules firing, and the only one that adds space is (G+M/2). So");
  line("  the repairer is (G+M/2) firing between the structure's own alike rays.");
  line("  It is not an agent, not a supervisor, and not a special cell.");
  line();
  line("  IS IT REPAIRING AN ELECTRON, OR A SOURCE? A source — and the distinction");
  line("  matters more than it looks:");
  line();
  line(`  ${pad("", 22)} ${pad("what it is here", 26)} status`);
  line("  " + "─".repeat(66));
  line(`  ${pad("the structure", 22)} ${pad("an emitter: ±1 on 26 exits", 26)} the model has these`);
  line(`  ${pad("its twist", 22)} ${pad("one-sidedness, w₁ ≠ 0", 26)} gives spin ½`);
  line(`  ${pad("its charge", 22)} ${pad("net traversal sense, ±1", 26)} gives q = ±1`);
  line(`  ${pad("its period", 22)} ${pad("2E, the dart count", 26)} gives the mass`);
  line(`  ${pad("→ an electron?", 22)} ${pad("only if 2E gives m_e", 26)} NOT DERIVED`);
  line();
  line("  So everything built so far describes A SOURCE WITH SPIN ½ AND CHARGE ±1,");
  line("  which is the right shape for an electron and is not yet an electron: the");
  line("  mass comes from an edge count that nothing fixes. Calling it an electron");
  line("  is the step that has not been earned, and `emit` §4 was explicit that 1836");
  line("  is an input. The honest name for the object is a LEPTON-SHAPED SOURCE.");
  line();
  line("  And what is being repaired is its SPACE, not its charge. Charges are");
  line("  conserved by (G+M/2)/(G+M/1) in pairs; what annihilation destroys and");
  line("  creation restores is the cell — which is why the whole question was ever a");
  line("  topological one.");
  return out.join("\n");
}

console.log(dictionary());
console.log(correction());
console.log(coherence());
console.log(twistProblem());
console.log(what());
