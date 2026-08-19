# archive

The four files the model itself used to be written in, kept for the same reason as
everything else under `provenance/`: **the article still cites them by name.**

    lattice.ts    the space — step, ring, CYCLE = 8, SPIN = 2π/CYCLE
    physics.ts    what happens in it — LIGHT, BITE, sided, turning, rate
    field.ts      the emission and the medium — SHEET, DEG, chance, through
    gravity.ts    the constants and the SI bridge — CORE, coherence, met(R)

They are here rather than in `provenance/` proper because two of their names —
`field.ts` and `physics.ts` — collide with test files of the same name, and because
they import each other. Nothing outside this folder imports any of them.

## Why they are no longer the model

`DISCRETE.ts` is, and it derives what these four wrote down. `lattice.ts` states
`CYCLE = 8` and `|directions| = 3^d − 1`; the geometry object reads both off the exits,
so changing the lattice changes them and no edit is needed anywhere. `gravity.ts`
wrote the gravitational constant with a literal 8, a literal 26 and a literal 0.5 in
it; that is now `constants().gravitational` in `CONTINUOUS.ts`, off the geometry.
**That difference is not cosmetic** — the book runs on fcc 12 and these files are
cubic 26, so every number in them is a number for a lattice this book no longer uses.

Which is the whole reason to read anything in here with the folder's own warning in
mind: a number here was measured by *a* reading of the rules, on *a* lattice, and
which one is recoverable only by reading the file.

## What still points here

`lattice.ts` carries one `<Eq note>` marked `NOT YET RE-MEASURED on DISCRETE.ts`
(the `turnRing` escape) and five prose citations. `physics.ts` and `gravity.ts` are
cited in prose only. `field.ts` is cited nowhere — the article's `field.ts §1–§6` is
the test file one directory up, not this one — and it is kept only because
`gravity.ts` imports it.
