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
it recomputes them from `SHEET`, `DEG`, `BITE`, `CORE` rather than importing
`G_LATTICE`, so a change to the definitions shows up as a test failure rather
than as silent agreement.

## what each one settles

### the shape of propagation

| | |
|---|---|
| `turns` | why a turn is eight ticks in every dimension |
| `ways` | **the shipped wander against the one `wander.tsx` models** — they are not the same rule, and in 3D no `w` puts the emission sheet on a circle |
| `veins` | what the ridges do with distance, cone shape and an extended emitter, and what all of it does to light |
| `vacuum` | **the medium is the expansion** — new room is edged on every axis and thins what is already there, so the density is (1−p)/(2−p) → ½ with no parameter, and the front closes |
| `vacuum` | **the medium is the expansion** — new room is edged on every axis and thins what is already there, so the density is (1−p)/(2−p) → ½ with no parameter, and the front closes |
| `gas` | **the fully discrete version** — bits per direction, streaming, and a momentum-conserving swap on head-on pairs; the front is beams with no medium and closed and round with one |
| `wave` | **the same lattice propagating as a wave instead of a ray** — the front is a circle at the sound speed and the grain vanishes as the pulse widens |
| `lattices` | **which space gives a sphere** — a sweep of spatial constructions against the spherical-design condition, and the shell search that finds 26 directions exact through rank 6 |
| `veined` | **what every law becomes if the field is veined rather than shell-averaged** — the radial law survives exactly, the Solar System kills it, galaxies cannot see it |
| `sphere` | **how round the pressure is, and by how much it wobbles** — the per-cell instantaneous scatter is 28–106% but that is the *counting floor* (1.03–1.11× √Σp(1−p), both rules), one tick read at 26-patch resolution is already round to 10–15%, the average is a sphere to 0.1–0.5%, and the lattice survives only inside r ≈ 8 |
| `cones` | **is there a rule with nothing tuned that gives a sphere** — no, and in 3D no `w` can, plus what each candidate rule does to every published number |

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
| `recon`, `which138` | the two a₀ derivations differ by exactly `DEG/2·SHEET` = 13/8, and which one the surviving mechanism selects |
| `accum`, `accumulate` | whether the fold really accumulates — it reaches a **steady state** in λ/c, which retires the defect |
| `asym` | the fixed-point exponents, converged to five figures |

### electromagnetism

> **The magnetic half is written up as one piece at `/physics/magnetism`** (Physics.tsx,
> under AI Generated). That section carries the benchmark, the derivation chain as a
> diagram, four ledgers — derived / conditional / owed / **withdrawn** — and a
> "where to pick this up" block. Several results below are superseded by it; where the
> older magnetism and Layer-2 arcs disagree with that section, the section is the later
> reading. Start there.


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
| `departure` | **and that line is not a choice** — the sign resolved at the source and at the destination are the same number, exactly, because a pulse that reaches an observer was emitted into the observer's direction. Both give 2.000. And "monopole" was too kind: the sided tally has zero flux at every radius and a flat sgn(cos θ)/r² with a step at the equator, which no field can be. **Σ sgn(n·d̂)/r² is a tally of received pulses, not a field** |
| `divp` | **where the poles actually come from** — make the primitive a per-node polarisation **p** and the emitted sign **−div p**, which is nought in the interior and appears only where the body ends. Net zero identically, 1/r³, cos θ, all five orientations, 1/R⁴ — and it survives the test that kills the hand-placed version: **cut it in half and you get two magnets**, where by-half gives two monopoles. Reconciles with `ordering` §1, which measured −div p and then threw it away |
| `domains` | **what orders them.** Dipolar does not — it selects zero net polarisation, the standard result. A rate coupling does, and the retardation in it gives a coherence ceiling at ω·L ≈ π. Both halves are superseded below: the coupling is *derived* in `response`, and the ceiling turns out not to be a domain (`domainsize`) and not to apply to a held axis (`align`) |
| `escape` | **is −div p derived, or a third rule?** Run the annihilation ledger: 1664 pulses, 600 annihilated head-on, and what is left is nought in every interior layer and equal-and-opposite on the two ends. **The surface density is derived.** But a *sided* source's escaped pulses stay directional — kept that way the exponent is 2.005 — so something more is needed. Its name for that ("isotropic emission") is corrected by `aggregate` |
| `aggregate` | **and the owed thing is one sentence, not a rule.** A pulse goes one way, so "isotropic emission" means nothing; what the far field needs is a direction-independent **sign**, which is `physics.ts`'s non-sided branch cos(2πβ) — already in the model, and ballistic, giving 3.000 with strength −div p and cos θ to 6.5e−7. Scattering is **not** available as the escape route: the inverse square IS ballistic shell dilution (measured: ballistic 1.90, scattering 1.10–1.18 rim-corrected), so a diffusing emission would take gravity with it. What is left owed is **regional sourcing** — that a region re-emits its unpaired excess — which the Layer-2 arc already assumes for bound states || `response` | **the coupling, out of rule (G/1).** The annihilation *count* between two emitters is EVEN in the phase difference and cannot lock (0.57 drifting, against 0.9996 for an odd one). Its first *moment* about a source's own axis is exactly odd, with no cosine and no mean. `domains` no longer assumes its coupling. One bit is left over: whether a source runs fast or slow in shortened space |
| `align` | a moment about an axis is a torque on it, which **closes the sign-vs-polarisation fork from the mechanism**: the coupling acts on p, so the emitted sign stays −div p. Its §3–§4 negative ordering result is **withdrawn by `texture` §3** — the torque summed there diverges linearly with the cutoff |
| `exchange` | **the ordering, with a quantity that converges.** `align`'s torque dropped both the second 1/r² and the `sin(θ/2)` splice; put back, it converges. Then a fork: integrated over **all space** it is ferro along a bond and anti across one — the dipolar pattern, driving closure. Integrated **along the line**, which is what every force in the arc actually uses, it is ferro on every bond — exchange-like. Under the line reading a 5³ block relaxes from random to |⟨p̂⟩| = 1.0000 and a field cycle gives an **open hysteresis loop**, pinned by the ring's 45° discreteness. And the fork is resolvable on the model's own terms: the two readings disagree about **distance** too — line gives 1/R², space gives 1/R (measured 0.94) — so the space reading would cost Newton. Since a force and a torque are two derivatives of one interaction, the set that gives Newton gives the ferromagnet. What that assumes, and all it assumes, is that the pull and the torque come from a single conservative quantity |
| `feedback` | **the model is one-way, and that is the gap under every ordering result.** `bearing(s,tick) = phase + tick·rate(s)/CYCLE`; nothing in `physics.ts` or `gravity.ts` ever writes to a source. So `exchange`'s relaxation minimises an energy the model does not have with a dynamics it does not have — the ferromagnet and the hysteresis loop drop back to **conditional**. `response` and `exchange` hit the same wall from two sides. What the model DOES own is an orientation-dependent **pull**, and that alone segregates a mobile population: ⟨cos Δ⟩ goes 0 → 0.89 with **no axis ever turning**. Order by migration, not rotation — real, and the wrong kind of order for a magnet |
| `permute` | **what the missing feedback could be** — a search over READ × ACT. Dimension cuts the grid; then gravity kills every rule that writes to a **beat**, since `beat = 1/mass` and mass would become a function of the neighbourhood. So the feedback must act on the **axis**. Of six axis rules, all three aligning-sign ones give a ferromagnet (0.95–1.00) and all three opposing ones give nothing — frustrated, not antiferro. **Which read does not matter**, so the ordering is not a fit to a rule chosen for it. What is owed is one bit: the sign, which is the same bit `response` owes for the beat |
| `extrapolate` | **the three rules pushed until they break, and they all break the same way.** They pass two tests: a **face-direction easy axis of ~2%**, out of the lattice rather than a parameter, which is what pins a permanent magnet; and a Curie-like decay under noise. They fail two, together: the read **diverges with sample size** (6.4 → 34 from L=3 to L=11), so none is a local law without a screening length; and **not one can hold an antiferromagnet** — a seeded two-sublattice state collapses to 0.001–0.008 on all three. Chromium and MnO exist. **The family is ferromagnet-or-nothing** because all three encode agreement, and a law that only rewards agreement can only produce agreement |
| `screen` | **the shadow put back, and it half works.** Both `extrapolate` refutations were measured with the model's own `screen = Π through(...)` deleted. Restored: the read **converges** (2.65 → 2.69 from L=3 to L=9 where the bare one ran 8.7 → 40.8), so the locality refutation is **withdrawn** and the screening length `exchange` wanted is not an extra assumption. But antiferromagnetism **stands refuted**, and not by tuning: transmission is a product of factors in [0,1], so a shadow **attenuates and cannot invert**. Composition-dependent *strength* is not composition-dependent *sign* |
| `signs` | **both candidate sign-changing mechanisms, run.** **A, the ring phase**: cos(ω·r) from the lag is a genuine sign change with distance and at ω·a = 10 gives a clean antiferromagnet (1.000) from random — the only one anything in this book has produced. But the model fixes ω·a = 6.6·10⁹ for iron, ten orders past the ordered window, so the phase winds a billion times between neighbours and the prediction is a **spin glass**. **B, the space reading**: tabulated over all 124 bond offsets, no wavevector reaches 0.9 from any start — it **does not order at all**, because its coupling has both sine and cosine components so aligned is not an equilibrium on a transverse bond. A good mechanism with a bad number, and a bad mechanism |
| `scales` | **the ordering mapped against scale, and the spin glass retired.** A phase diagram against λ/a: **ferromagnet for λ/a ≳ 60**, frustrated below 20. `signs`'s glass came from pairing a Planck-scale wavelength with an ATOMIC spacing — but `budget` and `escape` both put the emitters on **lattice cells**, and that pairing gives λ/a = 10¹⁶, deep in the ordered region. Coarse-graining does **not** rescue a glassy microscale (1.000 → 0.345 with block size), so order has to be present at the bottom. And §4: the ferromagnetic condition and the domain size **want the same carrier**, about 10⁻³ eV — two independent requirements on one unknown. `signs` A2's antiferromagnet is size-dependent (0.700, 1.000, 0.493, 0.728) and reads as unconfirmed pending finite-size scaling |
| `confirm` | **the two loose ends, settled.** Finite-size scaling with six seeds a size: order rises 0.56 → 0.87 across L = 3…11 and **extrapolates to 0.995** at 1/L = 0, so `signs`'s antiferromagnet is a real phase. And it is stable only *with* the screened cutoff — the unscreened sum frustrates it, so screening does more than fix locality. Then §2: **no carrier is needed.** The 10⁻³ eV came from demanding phase coherence across a domain, and a domain is a static configuration with no phase in it. A held axis has ω = 0, so cos(ω·r) ≡ 1 and the ceiling is absent, not small. **A magnet does not need a new particle** |
| `benchmark` | **the magnetic benchmark — a published measurement at last.** Zhang et al. (2020), *J. Intell. Manuf. Spec. Equip.* 1(1):43–65 score three models against measured force on a 10×10×2 mm N38H cuboid: magnetizing current 6.34%, **magnetic charge 5.22%**, dipole–dipole **75.94%**. The middle row is this model's — `escape` derives −div p and −div p *is* the magnetic charge — and the lattice converges onto it (pole charge → 1.000000 of M·A). The bottom row is a warning: the arc's headline 3cos²θ−1 and 1/R⁴ **are** the dipole approximation, which is 3322% wrong at a 1 mm gap and only reaches 5.9% at 50 mm. **But it cannot discriminate** — the model reproduces the charge model because it derives it, so unlike `three` there is no gap for a measurement to sit in |
| `creation` | **the two rules the magnetic files never used.** Every one before this used only (G+M/1), annihilation, and scored the alike outcome as nothing. (G+M/3) says alike pulses **turn and annihilate half a wavelength back, on the source's side** — outside the pair, so it **repels**. The coupling runs +1/−1 where it ran 1/0, and the ferromagnet gets *stronger*: 1.0000 at every block size where the one-rule version drops to 0.71. (G+M/2) fills the vacuum with ± pairs, which is a real screening of the right exp(−r/λ) shape where `screen` had to invent a power-law shadow. **Two owed items paid by rules already in the book** — the sign of the coupling, and the screening length |
| `vacsign` | **a distance-dependent sign, and it is the wrong kind.** (G+M/3) sends an alike pair back λ/2 to annihilate, so the two annihilations land at R/2 ∓ λ/2 — **inside** the pair when λ < R and **outside** when λ > R. So the alike branch turns over at R = λ, a genuine sign change needing no carrier and no new rule (`creation` pinned it at −1 everywhere, which was half its own rule taken for the whole). But the step is in the alike branch *only*: past λ, aligned and anti both score +1, so **the coupling switches off rather than reversing** — ferro at both ends, frustration between, no antiferromagnet at any λ. Plus §3: the vacuum cannot supply the sign (a turn reverses direction, not polarity) but it **sets λ**, and this λ is a mean free path in cells, not the Compton wavelength that killed the phase route |
| `pernode` | **a charge per node rather than per ray, and (G+M/3) for regional sourcing.** Per ray, what a vacuum node hands left is independent of what it hands right, so it mediates nothing — decaying to 10⁻⁴ by R = 8. **Per node it mediates something**: one sign into all directions makes the node a coherent go-between, and the correlation survives averaging even though the mean force does not (0.50 → 0.063 over R = 2…24, second order). The first coupling here that works *through* the vacuum. But **it does not turn over** — same sign at every density and separation. Then §3: two sources one cell apart close at **two cells a tick**, so the turn-and-return is two ticks against a beat of 10¹⁶, and a region locks to one train at the summed rate (order 0.9999 at N = 64). **Regional sourcing, from (G+M/3) plus the feedback already owed** — with one tension: `share` needs the offset *not* to collectivise |
| `consume` | **gravity eating magnetic fronts — the first mechanism with the right shape.** A source's train alternates, so removing a front puts the *opposite* sign in its place: consuming n fronts flips the sign n times, and J(R) ∝ (−1)^n(R). Crucially it does not multiply, so it **oscillates where everything else attenuated** — but only if consumption is a *rate* and not a coin (deterministic flips sign cleanly; stochastic decays as (1−2ρ)^R). At ρ ≈ 1–1.5 fronts per cell the block stops preferring ferro and picks checker/layers at 0.38–0.78. **But `budget`'s own 10¹² ratio kills it**: fronts are eaten at the *gravitational* rate, so ρ ~ 10⁻¹², twelve orders short. The same ratio that bought magnetism its own layer stops the mass layer reaching back. Only door left: the consumer need not be gravity — the (G+M/2) vacuum pairs have an unmeasured consumption rate |
| `vacrate` | **the last door, opened — and the room is the same room.** `consume`'s mechanism needs a consumer eating fronts at ~1 per cell; `vacuum` already derives one with no parameter in it — density ½, **mean free path 8 cells** — so ρ = 1/8 and the sign flips every 8 cells. **Ten orders better than gravity could supply.** Also: every earlier file cut the interaction at r ≤ 4, which is *just* before the first flip at r = 8. By Luttinger–Tisza with the real range, S(0) = 90.7 against 18.3 for the nearest spiral and −3.1 for the checkerboard — **still a ferromagnet**, because the unflipped near shells carry the 1/r² sum. But a flip length of 4 gives a spiral: **a factor of two, not twelve orders**. Caveat: the 8 cells is `vacuum`'s figure for the *gravitational* stream, and `budget` says the magnetic layer is separate |
| `mfp` | **the mean free path, computed — and it has a floor.** `vacrate` leaves the magnetic half on one number: the flip length is the front's mean free path, 8 cells gives a ferromagnet and 4 would give a spiral. Run `vacuum`'s own collision rule at every occupancy rather than only at a half: the path is **non-monotone**, 12.2 cells at fill 0.1, a minimum of **6.66 at fill 0.28**, and back to infinity at fill 1 — because a collision needs a head-on pair *and* somewhere to turn into, and those want opposite densities. **No fill reaches 4.** And the fill is not free anyway: (1−p)/(2−p) is a fixed point of creation against dilution, p cancels, and a larger p gives a *sparser* medium. One door left, and it is specific: the *signed* medium balances creation against annihilation rather than dilution, which is a different fixed point |
| `signed` | **the signed medium, built discretely — and the earlier answer was wrong.** Two failed controls first: guessing the creation rule as *one pair in an empty cell* gave fill 0.18 against 0.49. `vacuum`'s rule **edges the whole cell** (`s = 255`, all eight slots) and thins every slot at the same rate — that pair of lines *is* (1−p)/(2−p). With it, the control reproduces. Then both conventions: per ray gives mfp **2.09–3.64 cells**, per node **4.95–6.04**, against the unsigned medium's floor of 6.66. Annihilation always acts where a turn needs room, so a medium that annihilates collides more per charge. Then a third convention — **per axis**, the two ends of every axis always opposite and only which end is which drawn, so the node is a **dipole**. It **self-annihilates**: 98–100% of its collisions destroy, fill 0.02 against 0.31, because `(G/1) and (G/2) are exact inverses` and a rule that creates two opposite charges facing each other is undone by the rule that annihilates them. Two candidate flip lengths are reported rather than one chosen — the medium's own collision length and 1/fill — and they disagree; on the one the mechanism actually wants (1/fill), **per node gives a spiral at 3.2 cells, per ray is marginal at 5.3, per axis is a ferromagnet at 20**. **Three independent reasons now point at per node**: this, `pernode` §1 (the only convention that mediates through the vacuum), and `aggregate` §3 (the only one whose far field is a field) |
| `texture` | **the corrections, and they go the other way.** −div p needs a **net** p, not a uniform one — the far field is an integral functional, so four stripe domains, a biased random texture and a closure swirl with a small net all give 3.000 and cos θ, with only the moment scaling. Which means a relaxation ending in closure refutes nothing: **a virgin ferromagnet has no net moment either**, and a permanent magnet is a pinned metastable state. Plus: the `align` torque diverges with cutoff, and "dipolar favours closure" is the **simple-cubic** answer (validated here to 5 figures against Sci. Rep. 10:19154) where **Luttinger–Tisza give bcc and fcc ferromagnetic** — the lattices real ferromagnets use || `domainsize` | **and the domain prediction does not survive units.** L = λ/2 is 10⁻¹⁹ m for an iron atom and 10⁻³⁴ m on the turn clock, against 10⁻⁵ m measured — short by fourteen orders. Inverted, it wants a carrier of 10⁻³ eV. What survives is a real ceiling on anything phase-coherent, and it is not about magnets |
| `budget` | **how many pulses a magnet needs.** The mass layer caps the XOR at 2×, so magnetism is its own layer; √(µ0/4πG) = 38.7 kg per A·m converts it; a 1 cm N52 cube must emit as if it weighed 4.5 tonnes. One material constant, 4.5·10⁷ kg/m² of pole face, six geometries, no residual. The *area* in that is no longer empirical: a divergence lives on a surface, so `divp` makes the area law a consequence and leaves one number owed rather than a number plus a dimension |
| `scale` | the ceiling: µ/M ∝ 1/m², so **the lightest constituent wins by the square**; what real magnets use of it; and the area law for planets and stars — 4.5 mm of aligned skin is the Earth's whole field |
| `tradeoff` | one ceiling, so the budget is shared: **magnetising a thing makes it lighter**. The cheap version is already dead — a kg bar would lose 10 mg — which puts a floor of 10¹⁴ under the magnetic coupling |
| `maxwell` | **the audit** — 13 derived, 2 built in, 11 missing, 3 refuted, and why what is left missing is all on the electric side |

### layer 2 — the charge, the phase and the ring

| | |
|---|---|
| `ring` | **the ring is the face ring.** Sort the 26 exits by a north and the equator closes at 45° a step only for the 6 face axes; the 8 corner axes give a uniform ring of **six**, and the 12 edge axes — the largest class — give eight directions at **alternating 54.74°/35.26°**, which is no ring at all. So `CYCLE = 8` holds for 6 of 26 norths, 14 of 26 carry any uniform ring, and they carry two different quanta. Also: ring size is `SHEET(D) = 3^(D−1) − 1`, so **magnetism needs D ≥ 3 derivably** |
| `holonomy` | **the ring and the flux cannot both be true.** The continuum transport does give the swept solid angle and is gauge-invariant to 1e−15 (with an open link as the control, moving by the whole circle). But a smooth texture advances the azimuth ~1e−2 rad a step against a 45° quantum, so a phase genuinely *on* the ring snaps to zero every step and the holonomy is **identically 0 on every plaquette**. A third option the arc does not consider — a superposition over ring members — keeps both, at a price. Plus: **Ω/2 and g = 2 are one assumption used twice** |
| `bloch` | **the force, re-measured.** The two senses do separate oppositely and the norm holds to 1e−14, but the arc's symmetry control is on the wrong variable — k₀ = 0 is where they separate *most* — and the separation is not t². Windowed fits run 1.90, 2.46, 2.34, 1.30, −4.24: it is a **Bloch oscillation**, confirmed outright by g·t\* = k₀ and g·Δt = π to three figures across a factor of three in g. The coupling survives; the acceleration law does not |

### and the same theory without the XOR

| | |
|---|---|
| `nopolarity` | **turn polarity off and gravity does not notice.** No signs, no opposites, meetings decided head-on instead. `G` doubles and cancels; the force law's shape, the metric, the perihelion, the deflection, `a₀`, the rotation curve and the cosmology are identical to every digit quoted. What is lost is magnetism entirely, and the *explanation* of the ½ in `G`. So the XOR is a tunable parameter, free on the gravitational side |

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
   north, so taking it means changing the emission rule. The Layer-2 arc takes
   it by separating the axis from the north — and then also writes Φ = Ω/2 in
   its flux table, which is the same half a second time. `holonomy` §4: **the
   book is entitled to one of them as an assumption and must get the other as a
   result.**
7. **the magnetic coupling** — 4.5·10⁷ kg/m² of pole face, measured and not
   counted. Now behind item 10 in the queue: a coupling constant for a magnet
   the model cannot yet assemble is the wrong thing to worry about first. The mechanism is derived and only the scale is owed, which is
   exactly where `a₀` stood before `cH₀/2π`. See `budget`, and `tradeoff` for
   the floor a weighing already puts under it.
10. ~~is a pulse's sign fixed when it leaves, or when it arrives?~~ **Closed,
   and it was not a question** — `departure`. ~~What does the rate coupling
   lock?~~ **Also closed** — `align` §1: a moment about an axis is a torque on
   it, so it acts on the polarisation. What replaces both, and is now the
   load-bearing magnetic debt, and it is now two: **regional sourcing** (item
   15), and **feedback onto a source** (item 18). The ordering is not settled —
   `exchange`'s ferromagnet assumes axes relax to maximise meetings, and
   `feedback` shows nothing in the model can make them.
11. **the ring fork** — `ring` and `holonomy` are one decision. A continuous
   phase gets the Aharonov–Bohm result and loses the 45° quantum; a quantised
   one keeps the quantum and gets no flux from any smooth texture. The
   superposition route keeps both and costs more room than the arc costed.
12. ~~the domain prediction against measurement~~ **Done, and it fails** —
   `domainsize`. Short by fourteen orders on the beat clock, and inapplicable
   to a held axis. What survives is a coherence ceiling on anything
   phase-coherent, which is real and is not about magnets.
14. **the sign of the derived coupling** — one bit, and it belongs to the
   gravity arc: does a source run fast or slow in space that annihilation has
   shortened? `response` §3.
15. **regional sourcing** — that a region re-emits its unpaired excess as its
   own non-sided source. `escape` derives the excess; `aggregate` narrows the
   gap to this one sentence and rules out the two wrong ways to close it
   (scattering, and a new "isotropic" rule). It is the same statement the
   Layer-2 arc already assumes for bound states, so items 13 and 15 are one
   item — and it is now the load-bearing magnetic debt.
13. **emission sourced by regional layer-2 content** — flagged as a choice by
   the Layer-2 arc and untested. Testable without settling the ring: build a
   region with N strands and check the emission is one train at the summed rate
   while the relative offset does not collectivise.
8. **P itself** — measured everywhere, derived nowhere. Predicting it needs a
   model of matter: the mass pulsing and the biased pulsing are the same
   stream, so the relation is between `beat` and `dwell`.
9. **electric charge** — the largest of them. The model has emitters and a
   bias, and no account of matter to say which emitter anything is. Until it
   does, the electric half of the audit stays empty.

16. **the Luttinger–Tisza computation on bcc and fcc**, properly, with an Ewald
   sum. `domains` §1 ruled the ordering out on simple cubic, which is the one
   cubic lattice where dipolar cannot ferromagnet; iron is bcc and nickel is
   fcc. `texture` §4 flags this and does not attempt it — the quick sphere sum
   there is validated for sc and buggy for the other two, and says so.
17. ~~a convergent definition of the annihilation torque~~ **Done** —
   `exchange` §1. It is the arc's own meeting integral: both 1/r² factors, plus
   the `sin(θ/2)` splice that `gravity.ts` says keeps the space integral
   convergent. What is left is which SET to integrate over — see item 10.
18. **what does a source do about what arrives?** — `feedback` §1. The model is
   strictly one-way, and gravity never needed otherwise: a pull is a fact about
   the space between two things. Every ordering result needs the arrow to point
   back. `response` asks it of the beat, `exchange` of the axis; it is one
   question and the book has never had to answer it before.
19. ~~the sign of the feedback~~ **Paid** — `creation` §4. (G+M/1) annihilates
   between two sources and shortens the line; (G+M/3) sends an alike pair back
   to annihilate outside them and shortens the space behind. The sign is where
   the meeting lands, and it was in the rules all along.
20. **a sign that depends on something** — the deepest magnetic debt.
   `screen` narrows it: composition dependence via shadowing is real and fixes
   locality, but a shadow only subtracts. The model has exactly two candidate
   sign-changing mechanisms and neither is available as written — the ring
   phase with its ω·r lag and the space reading. **Both now run** (`signs`):
   the space route does not order on a lattice at all, and the phase route
   works. `scales` then retires the spin-glass objection to it: the emitters
   are lattice cells, not atoms. The debt is now one number — **a magnetic
   carrier of about 10⁻³ eV** — which the ferromagnetic condition and the
   measured domain size independently agree on, and which nothing in the book
   supplies — **but only for the antiferromagnet.** `confirm` shows the
   ferromagnet needs no carrier at all: a held axis has no ω and no coherence
   ceiling. The trade is ferro-only-and-clean against both-phases-plus-an-
   unobserved-79-eV-carrier. Real magnetic interactions have a sign
   that varies: with distance (RKKY oscillates, so neighbouring shells want
   opposite things) or with the bond (the dipolar term, which is why
   `exchange`'s space reading gave ferro along a bond and anti across one).
   The space reading had the structure and the wrong force law; the feedback
   rules have the force law and no structure. Nothing in the model yet has both.
