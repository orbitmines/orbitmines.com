# Provenance

The 148 test files the article's numbers were originally measured with.

**These do not run against `DISCRETE.ts` and are not part of the suite.** They are kept
for one reason: 165 `<Eq>` blocks in the article still quote numbers produced here, and
each of those is marked in the article as `NOT YET RE-MEASURED on DISCRETE.ts`. Deleting
these files would leave those citations pointing at nothing, which would hide the debt
rather than settle it.

## Why they cannot simply be trusted

They are the fifteen forks the refactor exists to end. Of the 148 files, thirty-nine
defined their own neighbour set, seventeen their own `OPP`, **ten wrote (G+M/2) as "fire
only in a completely neutral cell"** — which self-limits at about a tenth of the derived
occupancy — and **seven wrote (G+M/3) as a swap of two equal values**, which is a no-op.
Four carried both at once, and those four produced Coulomb's 1/r², the 7.6σ attraction,
the d ≈ 11 force cliff and the bias sweep.

So a number in here is not wrong by default, and it is not right by default either. It
was measured by *a* reading of the rules, and which reading is recoverable only by
reading the file.

## How a file leaves this folder

Re-measure its claim in `Physics/tests/` against a theory, with an expectation and a
band. Then re-point the article's `<Eq note>` at the new claim id and drop the marker.
Four have already gone that way — `laws`, `afm`, `torque` and `handle`, now
`magnetostatics/laws`, `magnetism/ordering`, `magnetism/kernel` and `matter/handles`.
