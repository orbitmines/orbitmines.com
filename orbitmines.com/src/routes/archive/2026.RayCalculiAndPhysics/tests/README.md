# the measurements behind the article

Every number quoted in `gravity.ts` and `law.tsx` was produced by one of these.
They are kept so that a claim can be re-run rather than believed, and so that a
result that later turns out wrong can be found and corrected at its source.

```
./run.sh              every test in order
./run.sh combined     one of them
./run.sh --list       what there is
```

Each file is standalone TypeScript with **no imports** — it carries its own
constants and its own copy of whatever geometry it needs. That duplication is
deliberate: a test should be readable and runnable on its own, and should not
break because the article was edited. Where a test needs the lattice constants
it recomputes them from `SHEET`, `WAYS`, `BITE`, `CORE` rather than importing
`G_LATTICE`, so a change to the definitions shows up as a test failure rather
than as silent agreement.

## what each one settles

### the force law

| | |
|---|---|
| `three` | Newton, GR and this model against Gaia — the three agree to a part in 10⁶ and all three miss by a factor of three |
| `combined` | **every effect in the file at once**: turnover, anisotropy, `reach`, `carry`, `shows`. Everything but the turnover is under 10⁻⁶ at galactic radii |

### the cosmology

| | |
|---|---|
| `frontcheck` | the frontier construction audited — the advance budget, `reach` under its own cosmology, the mass bill |
| `sne` | the supernova Hubble diagram, with the absolute magnitude marginalised away |

### dark matter — what does not work

| | |
|---|---|
| `caught` | the caught pair: π³/R by Monte Carlo, and the density it needs |
| `arms` | the same with the fog on **both** sides, which is the correction that mattered |
| `rootm`, `rootm2` | a body's own charges cancelling — the exponent slides past ½ rather than sitting on it |
| `feed` | the feedback chain, and why the coherence switch cannot be thrown |
| `selfcon`, `fixedpoint` | the self-limiting loop and its fixed point |
| `speedloop`, `drivers` | which driver gives which exponent, and what Tully–Fisher allows |
| `galaxy_sc`, `perm` | the fully relaxed galaxy, and the permutation search over drivers and channels |
| `vmass`, `sens`, `sign` | the velocity–mass conversion, its systematics, and the sign that decides it |

### dark matter — what does

| | |
|---|---|
| `transport` | the transport route at galaxy scale |
| `expand` | **a₀ = cH₀/2π**, and the galaxy run with nothing fitted |
| `polarity`, `pol2` | the ± attribution as a fair coin — √N with no coherence condition |
| `blocking`, `redo` | blocking **derives** the interpolation function, and Genzel redone with it |

### the high-redshift discs

| | |
|---|---|
| `genzel` | the five discs against a₀ fixed and a₀ ∝ 1/t |
| `genzel2` | **the same with the disc done properly** — the point-mass shortcut was generous, and correcting it moves four of five over the ceiling |
| `fair` | and what that is worth: the error in velocity, for Newton and for the model, on both datasets, with the high-z limit read as a band |
| `empty`, `spacing` | emptiness as density (fails) and as mean spacing (cancels exactly) |

### the anisotropy

| | |
|---|---|
| `quant` | the lattice has three direction cosines, so the projection is a **step** |
| `shape` | and therefore the rotation curve's shape survives |
| `steps` | where the steps fall — 33 and 52 kpc for the Milky Way, 6 and 9 for a dwarf |
| `joint` | the Milky Way and Genzel together, and the trade between them |

### and whether it is dark matter at all

| | |
|---|---|
| `clusters` | **the test that decides the question** — five clusters need 6× and the model supplies 3.9×, short by 1.5×, for the same structural reason MOND is |
| `clumpy` | whether the voids between galaxies help — they do not, because superposition fixes the field whatever the packing |
| `residual` | and what is left for dark matter to do: 0.58× the baryons instead of 5.3×, but it must avoid galaxies, and the CMB is untouched |

### closure

| | |
|---|---|
| `recon`, `which138` | the two a₀ derivations differ by exactly `WAYS/2·SHEET` = 13/8, and which one the surviving mechanism selects |
| `accum`, `accumulate` | whether the fold really accumulates — it reaches a **steady state** in λ/c, which retires the defect |
| `asym` | the fixed-point exponents, converged to five figures |

### electromagnetism

The same emission counted a second way — with the signs kept. See `magnet.ts`.

**Scope**: this is *magnetism*, and magnetostatics now comes out of it whole. There is no account of matter in the model, so
nothing here says what an electron or a positron is. What the signs give is a
**bias**, and `coulomb` §4 shows outright that a bias is not electric charge —
a proton would carry 1836× an electron's. Where µ_B or an electron count
appears it is a measured input, not a result.

| | |
|---|---|
| `pulses` | the pulse clock in seconds, and that the tick **is** the Planck time — an identity, not a coincidence |
| `magnets` | real magnets: N52, ferrite, saturated iron. Iron comes out at 2.17 µ_B an atom against a measured 2.22 — a consistency check on the counting — and a saturated magnet is **99.9985% cancelled** |
| `coulomb` | the ½ in `G_LATTICE` is the unbiased case of `(1 − P_a·P_b)/2`, so **like repels and opposite attracts is derived**; then §4, where the electric reading dies; and why a fit to α would mean nothing |
| `moment` | the magneton (12.6× short), the **g-factor (exactly 1, and it is 2)**, and the ⟨111⟩ anisotropy prediction — right decade, right for nickel, wrong for iron |
| `dipole` | the reading that **fails**: bias on a *direction*, out of one emitter. Pole-to-pole gives nothing and the fall-off is 1/R². Superseded in its conclusion by `poles` — it rules out an object, not the machinery |
| `poles` | **and the one that works** — bias on a *place*, so a bar is + at one end and − at the other. Same `chance`, same co-location, same XOR: **3cos²θ − 1 to three decimals, slope −2.00 (so 1/R⁴), all five orientations**. Magnetostatics, with nothing added |
| `ordering` | **where the poles come from** — the bulk really does cancel and the faces really do not, and it *still* is not a magnet: every sided ordering gives 1/r² because the sign is decided at the destination. Turns the gap into one line of `physics.ts` |
| `budget` | **how many pulses a magnet needs.** The mass layer caps the XOR at 2×, so magnetism is its own layer; √(µ0/4πG) = 38.7 kg per A·m converts it; a 1 cm N52 cube must emit as if it weighed 4.5 tonnes. One material constant, 4.5·10⁷ kg/m² of pole face, six geometries, no residual |
| `scale` | the ceiling: µ/M ∝ 1/m², so **the lightest constituent wins by the square**; what real magnets use of it; and the area law for planets and stars — 4.5 mm of aligned skin is the Earth's whole field |
| `tradeoff` | one ceiling, so the budget is shared: **magnetising a thing makes it lighter**. The cheap version is already dead — a kg bar would lose 10 mg — which puts a floor of 10¹⁴ under the magnetic coupling |
| `maxwell` | **the audit** — 13 derived, 2 built in, 11 missing, 3 refuted, and why what is left missing is all on the electric side |

## what is still open

Three things, all arithmetic rather than astronomy:

1. **the one link** — that a carrier's update cost goes as its accumulated
   phase. `through` gives the blocking, `inStep` gives the budget; this is the
   join, and nothing here derives it.
2. **the 1.78** — the meeting-count derivation of a₀ is low by that factor. See
   `which138`. `√π` and `16/9` are both within half a percent, which means
   nothing without a derivation.
3. **how far the cone is shut** — it sets both the Genzel margin and the step
   sizes, and it is a question about the emission rule.

And the thing that decides what this *is*: `clusters`. The account works in the
rotation-curve regime and inherits MOND's cluster problem exactly, because in
the deep limit it is MOND. Four of the five things dark matter was invented for
— clusters, the Bullet Cluster, the acoustic peaks, the light elements — are
untouched or failed.

And one that is not: **look for the step**. A dwarf's fall at 6 and 9 kpc,
inside the stellar body, and nothing else in physics predicts a discontinuity
in a rotation curve.

And on the electromagnetic side, the bills, all of them structural:

4. **a first-order channel** — nothing here happens to a charge that does not
   meet another charge, so every force is second order in the emission. That
   caps the electric force at the size of gravity. It is a missing law, not a
   missing constant.
5. **α** — with that channel, the 10⁴² is just `(m_e/m_P)²` and the whole bill
   is one number. `coulomb` measures why finding it in the lattice counts
   would not be evidence.
6. **the two in g** — `µ/L = q/2m` with the radius cancelling, so g = 1
   whatever else is chosen. The lattice has a place a two could live (an axis
   comes round in CYCLE/2 where a north takes CYCLE) but `emission` tracks
   north, so taking it means changing the emission rule.
7. **the magnetic coupling** — 4.5·10⁷ kg/m² of pole face, measured and not
   counted. The mechanism is derived and only the scale is owed, which is
   exactly where `a₀` stood before `cH₀/2π`. See `budget`, and `tradeoff` for
   the floor a weighing already puts under it.
10. **is a pulse's sign fixed when it leaves, or when it arrives?** The sharpest
   one, and the cheapest to answer. `emission` resolves the sign against the
   axis *at the destination*, which is why no ordering of sided emitters makes
   poles (`ordering`). Fix it at the source and the faces become poles with
   nothing else changed.
8. **P itself** — measured everywhere, derived nowhere. Predicting it needs a
   model of matter: the mass pulsing and the biased pulsing are the same
   stream, so the relation is between `beat` and `dwell`.
9. **electric charge** — the largest of them. The model has emitters and a
   bias, and no account of matter to say which emitter anything is. Until it
   does, the electric half of the audit stays empty.
