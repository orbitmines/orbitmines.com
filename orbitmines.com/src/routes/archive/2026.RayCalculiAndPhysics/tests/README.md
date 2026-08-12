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
