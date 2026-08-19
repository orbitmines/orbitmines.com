# Provenance

The test files the article's numbers were originally measured with, and the only reason
they are still here is that **`Physics.tsx` still quotes them**. Run

    ts-node --compiler-options '{"module":"commonjs","target":"es2020"}' ../../AUDIT.ts

and its **OWE** section is the exact list: every `<Eq note>` still marked
`NOT YET RE-MEASURED on DISCRETE.ts`, grouped by the file it came from, with the article
line it sits on. That listing is the authority on how much is left; this file only says
what the debt IS and how a file gets out of it.

**These do not run against `DISCRETE.ts` and are not part of the suite.** They ran on
cubic 26, against fifteen different readings of the rules; the book runs on fcc 12
against one. Deleting them while the article still cited them would have left the
citations pointing at nothing, which hides the debt rather than settling it.

## Why a number in here cannot simply be trusted

Of the 148 files originally here, thirty-nine defined their own neighbour set, seventeen
their own `OPP`, **ten wrote (G+M/2) as "fire only in a completely neutral cell"** —
which self-limits at about a tenth of the derived occupancy — and **seven wrote (G+M/3)
as a swap of two equal values**, which is a no-op. Four carried both at once, and those
four produced Coulomb's 1/r², the 7.6σ attraction, the d ≈ 11 force cliff and the bias
sweep.

So a number in here is not wrong by default, and it is not right by default either. It
was measured by *a* reading of the rules, on *a* lattice, and which reading is
recoverable only by reading the file.

## How a file leaves this folder

Re-measure its claim in `Physics/tests/` against a theory, with an expectation and a
band. Then re-point the article's `<Eq note>` at the new claim id and drop the marker.
When nothing in the article names the file any more, `AUDIT.ts` stops listing it and it
can go.

**Nineteen have gone that way.** `laws`, `afm`, `torque` and `handle` became
`magnetostatics/laws`, `magnetism/ordering`, `magnetism/kernel` and `matter/handles`.
Then `matter` and `bound` became `tests/binding.ts` — `matter/exchange-length`,
`matter/no-binding-length`, `matter/the-budget`, `matter/the-atom`; `spin`, `spinor` and
`cover` became `tests/spin.ts` — `spin/scale-conflict`, `spin/g-is-one`,
`spin/relaxed-ring`, `spin/sign-is-not-a-spinor`; and `emit` became
`tests/structures.ts` on `RIBBON.ts` — five claims from `structures/spin-from-a-twist`
to `structures/charge-is-one-bit`. Then `sufficient`, `contain` and `quotient` became
`tests/topology.ts` on `TORSION.ts` — `topology/the-wrong-label`,
`topology/torsion-not-rank`, `topology/only-a-free-involution`,
`topology/torsion-is-fragile`. And `degree` became `tests/emission.ts` —
`emission/charge-is-a-degree`, `emission/xor-survives`; and `species` became
`tests/species.ts` — `species/which-exist`, `species/the-particle-table`,
`species/mass-ceiling`; and `chiral` became `tests/chirality.ts` —
`chirality/rotation-is-not-gauge`, `chirality/the-lattice-decides`; the live half of
`rules` became `tests/coherence.ts` — `coherence/self-damage-rate`,
`coherence/sign-purity`, `coherence/twist-concentration`; and `clock` §1 became
`tests/dilation.ts` — `dilation/budget-is-a-length`; and `automaton` became
`tests/automaton.ts` on `AUTOMATON.ts` — `automaton/fermion-cannot-be-coherent`,
`automaton/damage-does-not-concentrate`, `automaton/one-process-not-two`.

**Fifty-four went the cheaper way**, deleted once no citation reached them at all, which
settles no debt and only stops the folder pretending to more than it holds. They are
recoverable from git, which is the only reason deleting them was cheap.

## And not every citation is a debt

Eight are now marked `NOT RE-MEASURED — <reason>` rather than `NOT YET RE-MEASURED`, and
`AUDIT.ts` lists them under RETIRED with the reason rather than counting them as owed.
Retiring one is a judgement, and recording it is the difference between that and quietly
deleting a marker. **A retired citation still needs its file**, since the article still
quotes the number — `clock.ts` and `repair.ts` stay here for exactly that reason. The
three reasons so far:

- **not a measurement.** `rules.ts` §1 is a dictionary mapping words onto the three
  rules; `clock.ts` §3 is two equations, and which of them holds is measured one block up.
  There is no figure in either to re-derive.
- **superseded.** `repair.ts`'s whole calculation is withdrawn by the rates block four
  headings later — it divided by the wrong quantity — and there is no lattice in it for a
  re-run to change.
- **supports a refuted mechanism.** `lock.ts` establishes the antipodal pairing that
  `topology/torsion-is-fragile` then kills on one broken pair out of 108. Measuring how
  well it locks settles nothing.

## What the ports have actually cost so far

Worth knowing before doing another, because it is not a transcription job:

- **Numbers downstream of the lattice MOVE.** `matter`, `bound`, `spin`, `spinor` and
  `cover` all opened by writing `SHEET = 3^(D−1) − 1`, `DEG = 3^D − 1`, `CORE = 0.5`,
  `CYCLE = 8` as though they were arithmetic. On fcc 12 those are 6, 12, √2/2 and 6.
  The exchange-length shortfall went from 1726 to 2671 and the ring's coupling from
  12.6 ħc to 19.5.
- **Numbers downstream only of CODATA do not.** a₀ and the Rydberg came out the same to
  four figures, because the budget argument never touched the lattice.
- **And some claims do not survive.** `matter` §2 said the three regularisations of the
  pole kernel agree beyond about a cell; on fcc they do not, and the disagreement grows
  with distance. `emit` §4's 0.3% agreement between the electron's moment and 4π was a
  cubic-26 coincidence and is 55% out on fcc. Both are now recorded as what they are.
- **Making the lattice a parameter is sometimes the whole value of a port.** `automaton`
  hardcoded the eight planar headings and reversed one with `(d + 4) % 8`. Rebuilt on a
  `Geometry`, the same construction could be asked of square 4 as well — and the headline
  result held there too, which is the difference between a claim about fermions and a
  claim about square 8. The old file could not ask the question at all.
- **A port can catch the ARTICLE in a false claim, not just a stale number.** The
  article said every one of the 128 fermionic orbits carries odd |q| "as the proof
  requires". The sweep says 24% do, and the proof — |q| = 0 ⟹ boson — never required it.
  Re-deriving a claim is the only thing that finds this class of error, since the number
  it quoted was never wrong.
- **Integer homology needed a module of its own.** `STRUCTURE.ts` computes b₁ over
  GF(2), which cannot see torsion — and torsion is the whole of what separates a handle
  from a fermion. `TORSION.ts` carries Smith normal form, surface words and the
  quotiented cubical sphere.
- **Some clusters port as a MOVE.** `emit`'s ribbon-graph sweeps are combinatorics and
  touch no lattice at all, so every count — 4660, 2430, 486, 796, 4964 — reproduced
  exactly. Checking whether a file mentions `DEG`, `SHEET`, `CYCLE` or `G_LATTICE` tells
  you in advance which kind of port you are about to do.
