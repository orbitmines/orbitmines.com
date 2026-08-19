# Physics

One model, configurable, with every test run *against a theory* and every number
reaching the article through a report rather than by hand.

## Why this exists

The model had drifted into about fifteen forks. Of the 148 files in the old
`tests/` directory, thirty-nine defined their own neighbour set, seventeen their
own `OPP`, and — the two that changed answers — **ten wrote (G+M/2) as "fire only
in a completely neutral cell"**, which self-limits at about a tenth of the derived
occupancy, and **seven wrote (G+M/3) as a swap of two equal values**, which is a
no-op.

Four files carried both at once. Those four produced Coulomb's 1/r², the 7.6σ
attraction, the d ≈ 11 force cliff and the bias sweep — measured in a thin vacuum
in which alike rays passed straight through each other. Each fork was a local,
reasonable reading; together they meant "the model" named nothing, and which fork
a published number came from was recoverable only by reading source.

## The files

| | |
|---|---|
| `DISCRETE.ts` | the model. Geometry, rules, backends, sources, measurement, the report. |
| `CONTINUOUS.ts` | the same model read in the limit, with its constants **taken from** the geometry object rather than written down beside it. |
| `SUITE.ts` | how a claim gets tested: against a theory, with an expectation and a band. |
| `RUN.ts` | the runner. Writes `REPORT.json`, which the article reads. |
| `CHECK.ts` | does the model still work — the five checks to make before trusting anything. |
| `TRANSPORT.ts` | the transport law — carriers slowing where the medium is thin, which is where the rotation curves come from. Shared by the test and the figure. |
| `POLES.ts` | the pole model — a magnetised body as −∇·M through a 1/R kernel, shared by the test and the figure so they cannot drift apart. |
| `STRUCTURE.ts` | shapes, and b₁ over GF(2) on a cubical complex. |
| `LAW.tsx` | the notation the article is written in, and the derivations behind each equation. Moved out of the archive; not physics. |
| `visuals/` | every figure. Nothing in here measures anything the tests do not. |
| `tests/` | the migrated claims. |

### `visuals/`

| | |
|---|---|
| `CANVAS.tsx` · `CAROUSEL.tsx` | a canvas that draws only when visible; one figure across every geometry. |
| `RENDER.tsx` | the field panels — two worlds, differenced, read through named channels. |
| `LATTICE.tsx` | the pictures about the lattice rather than about what happens on it. |
| `PLAYER.tsx` | a lattice ticking, with transport controls. |
| `EXPAND.tsx` | one tick of the split, slowly — and the 1D case, which is the explanation. |
| `BAR.tsx` · `SHADOW.tsx` | a bar magnet's B and H; the shadow, cut down the seam, and the two overlaid. |
| `CURVE.tsx` | a rotation curve under both laws — an idealised disc, said so. |
| `LINES.tsx` | every arrangement of two charges on a line, run one tick through the real rules and sorted by what the tick did. |
| `FIGURES.tsx` | `<Claim>`, `<Recorded>`, `<M>` — the article reading `REPORT.json`. |

**A figure is a picture of the model, or it says what it is instead.** The panels
run `DISCRETE.ts`; where a figure draws a closed form rather than a run — the
shadow does — the caption says so, and the measured version is quoted from the
report beside it. The archive's lattice panels ran a separate 3,395-line
simulator, so every one of them was a picture of a *different* model from the one
the tests measure, and nothing checked that the two agreed.

## What is left of the archive

Three imports, and each is there for a stated reason rather than because nobody got to
it:

| | |
|---|---|
| `gravity.ts` → `gravitational`, `massUnit` | the SI-units bridge, used by the CLOCK and IGNORANCE derivations. Computation, not a panel; belongs in `CONTINUOUS.ts` as derived constants, which is a port rather than a move. |
| `magnetism.tsx` → `Ceiling`, `Ladder` | scale estimates resting on a dimensionless *G* and a ring radius (CYCLE·G/2π)·λ̄C. Reconstructing that chain means guessing at a constant the article does not state, and a figure built on a guessed constant is worse than one that has not been ported. |
| `em.tsx` → `Lorentz` | the gate-against-turn trajectories. The claim — |Δx|/|Δy| = 0.1548 against tan(θ/2) = 0.1511 — needs the two mechanisms written out, and θ is not recoverable from the text. |

Everything else the article once imported from there is gone: `discrete.ts` (3,395
lines of a *second* simulator, which is why every lattice figure used to be a picture
of a different model from the one the tests measure), `views.tsx`, `models.ts`,
`shadow.tsx`, `rotation.tsx`, `wander.tsx`, `echoes.tsx`, `shelter.tsx`, `lines.ts`,
`grid.tsx`, `ribbon.tsx`, `model.ts`, `physics.ts`, and `law.tsx`'s page components.

## Nothing here contains 26, 8, or 45°

`DEG`, `SHEET`, `CYCLE`, `SPIN`, the equator of an axis, the rank-*n* moments and
their isotropy, the light-speed anisotropy and the vacuum's fixed point all come
out of the geometry object. Change the lattice and they change together, and
`affectedBy(g1, g2)` says which **laws** moved and through which constant.

All ten geometries reproduce the article's hand-tabulated table — cubic-26 at
8/8/45°/49.7% veined/1.73×, FCC at 6/6/60°, BCC with an empty equator,
icosahedral exact.

## A claim is always a claim about a theory

A test does not hardcode one. It declares what it expects of each:

- **`holds`** — the claim should come out, and its findings should land in their bands.
- **`absent`** — the claim should measurably *not* come out. This is a **result**, not a skip: *"a moving charge gets no magnetic field without the label"* is the whole of what `fork` established, and it is worth failing if B shows up.
- **a reason** — the claim cannot be phrased in this theory at all, and the reason is recorded rather than the test being quietly missing.

A claim that holds where it should be absent fails as loudly as one that fails
where it should hold.

## Verdicts are not pass/fail

A finding carries what it should be, inside what band, and **because of what**.
The verdict is `within`, or how far out and in which direction, or `unresolved`
when the measurement could not have shown the thing either way. A result that is
unresolved is a statement about the box size, not a failure.

## Two backends, held to each other

`ArrayBackend` is flat typed arrays at the sizes measurements need; `GraphBackend`
rewires on a fold and is honest about a space that is a graph rather than a
crystal. With folding **off** they are provably the same simulation — identical
occupancy, identical annihilation counts, never diverging. With it on they cannot
be, and `conform` measures the gap instead of anybody assuming it is small.

## Things that were found by the core testing itself

None of these could be caught by typechecking:

- A **gravity world holding signed rays**, which met head-on, counted as *alike*, took the turn branch (a no-op in gravity) and sailed through each other. In the one theory where every meeting should annihilate, the source's own rays never did.
- The **graph backend leaking rays into folded-away locals** — found as its occupancy settling at half the flat backend's.
- **Density compounding**: a fold added `dens[b]` in a backend that does not remove `b`, so it ran to 2.6·10⁸ and made the annihilation channel garbage while looking like a number.
- **`Σd̂⊗d̂` computed on raw vectors** (18, not 8.667). Both tensors are meaningful — emission moment and momentum flux — and quoting one under the other's name is the mistake `switched` caught in the old code. Both are carried and both are named.

## The measurement rules

There is no `meanMagnitudeOnShell`. A magnitude cannot cancel, so the vacuum adds
to it instead of averaging away — and it has produced, at different times, a
moving charge's field reported as *flat* in r, a static charge's E at 80° to r̂,
∇·B at 0.94 and then 2.67, and two force panels that looked identical.

What there is: signed projections onto each cell's own basis, integrals over
closed surfaces and loops, multi-seed statistics that refuse a single run, and a
saturation warning — **zero spread across seeds is a pinned channel, not
precision**, and it fooled this project once already.

Fits are the shape the medium actually produces. A bare power law is wrong here:
the vacuum screens, so a field over a dozen cells is geometry **times**
attenuation, and fitting `log v` against `log r` reports the sum of the two as if
it were the geometry. `screenedFit` holds the geometric exponent fixed and returns
the screening length, which is the number the model has something to say about.

## Getting the article onto this

Two things have to become true, and the audit reports how far each has got:

1. **Every visual runs on `DISCRETE.ts`** — not a second implementation of the rules kept in step by hand.
2. **Every quoted number comes from `REPORT.json`** — the article contains *references*, not figures.

```
ts-node --compiler-options '{"module":"commonjs","target":"es2020"}' AUDIT.ts
```

The article references findings through `FIGURES.tsx`:

| | |
|---|---|
| `<M of="…" is="…" />` | one measured value with its error |
| `<Recorded of="…" />` | a table exactly as the run recorded it |
| `<Claim of="…" />` | every finding, the table, and the configuration |
| `<Ran of="…" />` | the label every result owes: geometry, theory, fold, occupancy, box, seeds |
| `<Matrix />` | what holds under which theory |

A reference to a finding that no longer exists renders as a visible **NOT IN THE REPORT**, so a
renamed or deleted measurement cannot go on being quoted. A quick-budget entry prints
**⚠ not a quotable number**.

`RUN.ts` **merges** into the report rather than overwriting it, so re-checking one claim
(`RUN.ts coulomb`) leaves every other figure in the article standing.

## What the migration has already changed

Not tidying — these moved numbers.

**The vacuum's occupancy is not ½ and not parameter-free.** The fixed point
`f* = (1−p)/(2−p) → ½` is derived for a medium in which creation and thinning are the only
things happening, and it is *exactly* right there: a `conserving` run lands on it to three
decimals across a twelvefold change in rate. But **neither of this book's theories is that
medium** — gravity annihilates on every head-on meeting, gravity+magnetism on the opposite half
of them, and annihilation is a sink the algebra has no term for. Measured, gravity sits at
0.10–0.21 and gravity+magnetism at 0.15–0.29, both **rising with the rate the fixed point was
supposed to have cancelled out.**

That matters well beyond a factor of two, because every screening length in this project is a
mean free path and a mean free path is `1/fill`. The electromagnetic sections argue from "the
derived half puts it at about two cells"; it is three to seven.

**A magnetic field is absent without the label** — declared `absent` under gravity+magnetism in
advance, and measured at exactly zero at every local. That is `fork`'s obstruction as a
measurement rather than an argument.

**Faraday is absent, and was predicted to be.** Residual 1.009 against an expectation of 1.
Faraday is an identity that holds iff the fields come from potentials, and this lattice has no
signed potential — both rules conserve polarity, so a signed quantity is field-like and cannot
relax. A residual near nought would mean the theorem is wrong.

## Where the port has got to

```
33 claims sourced from runs · 9 test files · 10 visuals on the new core
3 archive modules retired: current.tsx, counts.tsx, figures.tsx
817 lines still carry a figure the report does not back, across 198 sections
```

**Ported.** The geometry (constants, exits by axis, shells, sheet coverage), the ring
(Layer 2's foundation), the vacuum (fixed point, annihilation feeding expansion,
sheet against isotropic emission), gravity (inverse-square, recovery from the three
rules), electrostatics (Coulomb, the sign law), magnetostatics (static charge, moving
charge, neutral wire) and induction (Faraday, lattice against retarded).

**Not ported, and each needs something built first.**

| arc | what it needs |
|---|---|
| cosmology, black-hole shadows | the metric on `CONTINUOUS.ts` — these are closed-form images, not lattice dynamics |
| matter, the ribbon reading | structures on the lattice: a ribbon is not a ray and the core has no notion of one yet |
| magnetism's ordering work | the dipolar coupling and a Luttinger–Tisza minimisation, which is continuum machinery |
| quantum | the phase channel exists; nothing reads it yet |

The order is deliberate: the vacuum went first because every screening length in the
project is a mean free path, and until its occupancy was pinned down nothing measured
through it could be trusted. That turned out to be right — the occupancy moved by an
order of magnitude under choices nobody had written down.

## Corrections the port has already forced

Not tidying. Each of these changed a published claim.

- **The vacuum's occupancy is not ½ and not parameter-free.** The fixed point is exact for a medium where nothing is destroyed, and neither theory here is that medium.
- **Annihilation feeds the expansion.** (G/1) leaves neutral points and (G/2) expands neutral points, so destruction manufactures the condition creation needs — measured as an order of magnitude in growth between theories that differ only in how often two rays destroy each other.
- **A magnetic field is absent without the label**, declared in advance and measured at exactly zero.
- **Faraday is absent, and was predicted to be** — an identity needs potentials, and this lattice has no signed potential.
- **The three axis classes give two rings, not three.** A face axis and an edge axis both leave eight; only a body diagonal differs, at six.
- **One rotation of the sheet covers cubic completely and FCC only half** — so on FCC the inverse-square law's own derivation would have to be redone, which is one more item on the bill for changing lattice.
