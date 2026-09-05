/**
 * THE DERIVATIONS BEHIND THE EQUATIONS - and the notation, which is no longer here.
 *
 * WHAT MOVED, AND WHY IT MOVED OUT OF THIS REPOSITORY. `V`, `K`, `Sub`, `Sup`, `Frac`,
 * `Bar`, `Eq`, `Head`, `Rows` and the rest were written here and are now
 * `@orbitmines/physics/notation`. They set what that package PROVES: `npm run theorems`
 * over there closes the rules of `G` and writes out what follows, and the writing needs a
 * typesetting - one that gets a bar right, that knows `DEG` is a count and not a
 * quantity, and that a phone can read. Kept in this repository, the prover's own output
 * could only be set by this website, and a theorem that can only be read on one site is
 * a theorem published nowhere.
 *
 * AND IT COST NOTHING TO IMPORT. The package has no dependencies and names no view
 * library: `notation(React)` takes the runtime as an argument, which is why a theory that
 * has to run in a worker can ship the typesetting for its own proofs without carrying
 * React to do it. The binding is the twelve lines below, and everything they hand back is
 * re-exported, so `Physics.tsx` imports exactly what it always did from exactly here.
 *
 * WHAT THAT BUYS ON THE PAGE is `<Eq theory="G" theorem="gravity.mass" />`. The line set
 * is the line the prover concluded, looked up in `PROVED` rather than typed out here, and
 * clicking it opens the working that same run derived. A transcribed equation is a second
 * copy of a derived thing and therefore a thing that drifts the next time a rule is
 * edited; that form cannot, because there is only ever one of it.
 *
 * WHAT STAYED IS WHAT IS BELOW: the sixteen `Derivation` records. Those are prose about
 * this theory - what a line means, why it is the shape it is, what was tried and dropped -
 * and prose about a theory belongs to the article that argues it, not to the package that
 * runs it. They are the hand-written twin of what `derivation()` builds out of the
 * registry, and they are deliberately the same object: a reader should not be able to
 * tell from the page which panels a person wrote and which a prover did, because they are
 * the same kind of claim about the same rules.
 *
 * THE LAST EDGE IS STILL GONE. `gravitational` and `massUnit` are `constants()` in
 * `CONTINUOUS.ts`, read off the geometry `DISCRETE.ts` is actually running - so the
 * number on this page follows the lattice instead of standing beside it.
 */

import * as React from "react";
import {
  notation, type Derivation as Derived,
  INK, DIM, FAINT, DERIVED, BORROWED, SERIF,
} from "@orbitmines/physics/notation";
import { PROVED } from "@orbitmines/physics/theorems";

import { constants } from "./CONTINUOUS";

/**
 * The constants of the lattice this book runs on, taken once.
 *
 * `constants()` is a pure function of `DEFAULT_GEOMETRY`, so this is the SAME object
 * every panel and every test is reading — which is the whole reason the numbers below
 * are printed off it rather than transcribed.
 */
const { gravitational, massUnit } = constants();

/**
 * THE NOTATION, BOUND TO THIS SITE'S REACT AND TO WHAT THE PROVER PROVED.
 *
 * Once, here, and imported from here by everything else — which is the arrangement the
 * package is built for. `notation` takes the runtime rather than importing one, so this
 * call is what decides there is one React in the tree, and `PROVED` is what makes
 * `<Eq theorem=…>` resolve. Passing neither would still give a working notation; passing
 * both is what makes the article able to cite.
 */
const SET = notation(React, PROVED);

export const {
  /* the notation itself — a quantity, a count of the lattice's, and the marks on them */
  V, K, R, F, D, B, Sub, Sup, Frac, Type, Paren, Hat, Bar,
  /* a displayed line, and the panel of working that opens beside it */
  Eq, Panel, Step, Because, Note, Head, Rows,
  /* and the proofs' own markup, for a line quoted straight out of the prover */
  Markup, EqMarkup, derivation,
  /* a rendered visual, which the package ships beside the theory it is a picture of */
  Film,
} = SET;

/**
 * WHAT `Physics.tsx` CALLS A DERIVATION — this site's React, filled into the package's.
 *
 * `Derivation<N>` is generic in the node type for the reason the whole package is: it
 * names no view library, so its idea of `a thing that can be rendered` has to come from
 * whoever is rendering. Here that is React, and this is the one line that says so.
 */
export type Derivation = Derived<React.ReactElement>;

/* the colours, which the derivations below set their own asides in */
export { INK, DIM, FAINT, DERIVED, BORROWED, SERIF };


// —— what is behind each line ————————————————————————————————————————————

export const LAW: Derivation = {
  label: 'the law',
  title: 'the law',
  body: <>
    <Because>the rule</Because>
    <Step>
      An annihilation removes the two points its charges were on and joins what
      was behind each onto what was behind the other. So the place it happened
      is left with more space folded into it than its neighbours have.
    </Step>

    <Because>what that does to a path through it</Because>
    <Step eq={<>
      <Frac over={<>1 + <V>n</V></>} under={<>1, and there are <K>DEG</K> of them</>} />
    </>}>
      A path arriving there has more ways of going the way the annihilation
      went than of going any other. One makes it two to one, a second three to
      one, a third four — the direction accumulates weight one annihilation at
      a time, while every other way out of the point still weighs exactly what
      it always did. There are <K>DEG</K> = 26 of those.
    </Step>

    <Step eq={<><K>BIAS</K> = <Frac over={<K>LIGHT</K>} under={<K>DEG</K>} /></>}>
      So the net lean is <K>LIGHT</K>·<V>n</V>/<K>DEG</K> — linear in the
      count, with no ceiling in it — and one annihilation is worth <K>BIAS</K>.
      This is the only constant in the dynamics, and it is a ratio of two
      counts.
    </Step>

    <Because>that is a ratio, and a ratio is not all of it</Because>
    <Step eq={<>
      <Frac over={<>1 + <V>n</V></>} under={<K>DEG</K>} />
      &nbsp;the lean&nbsp;&nbsp;·&nbsp;&nbsp;
      <K>DEG</K> + <V>n</V>&nbsp; the total
    </>}>
      The line above compares one direction against the others and throws away
      how many there are. But the ways out of that point no longer{' '}
      number <K>DEG</K> — they number <K>DEG</K> + <V>n</V>, and{' '}
      <b style={{ color: INK }}>a point with more ways out of it holds more
        space</b>. The lean is the first moment of the count; the total is the
      zeroth. Both are the same annihilations, read twice.
    </Step>

    <Step eq={<>
      <V>A</V> = <Paren><Frac over={<>1 − <V>s</V></>} under={<>1 + <V>s</V></>} /></Paren><Sup>2</Sup>
      <span style={{ padding: '0 1.2em' }} />
      <V>B</V> = (1 + <V>s</V>)<Sup>4</Sup>
      <span style={{ padding: '0 1.2em' }} />
      <V>s</V> = <V>u</V>/2
    </>}>
      Which is a metric: <V>A</V> is how much slower a clock there runs and{' '}
      <V>B</V> is how many steps a drawn cell holds. To first order they are
      1 − 2<V>u</V> + 2<V>u</V><Sup>2</Sup> and 1 + 2<V>u</V>, and they carry
      the <i>same</i> <V>u</V> with the same coefficient — which is not a
      choice, it is the statement that a point’s lean and a point’s thickness
      are one event seen twice. Written closed rather than as the series
      because <V>A</V>/<V>B</V> is then at most one, so the ceiling{' '}
      <V>c</V>√(<V>A</V>/<V>B</V>) is light and stays light.
    </Step>

    <Because>per tick of whose clock, and in whose space</Because>
    <Step eq={<>
      <B>v</B> = <Frac
        over={<><V>A</V> <B>u</B></>}
        under={<><V>B</V> √(<V>A</V>(1 + |<B>u</B>|<Sup>2</Sup>/<V>B</V><K>LIGHT</K><Sup>2</Sup>))</>} />
    </>}>
      The counting happens on the body’s own worldline, so{' '}
      <K>LIGHT</K>·<V>n</V>/<K>DEG</K> is cells per tick of <i>its</i> clock —
      a proper velocity, not a coordinate one. Turning that into what the
      picture shows is one line of arithmetic the model does not get to choose,
      and how many cells it is worth depends on how thick the place is. Flat, it
      is <B>u</B>/√(1 + |<B>u</B>|<Sup>2</Sup>) exactly as before. Nothing is
      clamped: the ceiling is the one arithmetic already has.
    </Step>

    <Because>and so</Because>
    <Step eq={<>
      <Frac over={<>d</>} under={<>d<V>t</V></>} />
      ( <V>m</V><Sub>a</Sub> <B>u</B><Sub>a</Sub> ) &nbsp;=&nbsp;
      <K>BIAS</K> · <V>S</V><Sub>ab</Sub> · carry
    </>}>
      A body’s count grows by <K>BIAS</K>·<V>S</V> divided by its own mass —
      the <i>fraction</i> of its paths that were bent, since its path count is
      its mass. Multiply back through and the mass cancels out of the statement
      entirely. <i>carry</i> is what one meeting is worth where it happened,
      and it is one wherever nothing is going on; at leading order it is
      1 + 2<V>v</V><Sup>2</Sup>/<V>c</V><Sup>2</Sup>.
    </Step>

    <Because>what falls out of it</Because>
    <Step>
      Dividing by <V>m</V><Sub>a</Sub> leaves{' '}
      <V>a</V><Sub>a</Sub> ∝ <V>m</V><Sub>b</Sub>/<V>R</V><Sup>2</Sup> — the
      equivalence principle as a counting statement rather than a postulate.
      Differentiating <B>v</B>(<B>u</B>) at <V>u</V> = 0 gives
      1/<V>γ</V><Sup>3</Sup> along the way a thing is going and 1/<V>γ</V>{' '}
      across it: special relativity’s own response, out of a count of ways out
      of a point. And the two readings together give general relativity’s, to
      first order in the field and with the next term the size it should be.
    </Step>
  </>,
};

export const METRIC: Derivation = {
  label: 'A and B',
  title: <>the count, read a second time</>,
  body: <>
    <Because>what the lean threw away</Because>
    <Step eq={<>
      <Frac over={<>1 + <V>n</V></>} under={<>1 each, <K>DEG</K> of them</>} />
    </>}>
      <K>BIAS</K> compares the direction that took an annihilation against the
      others. Every other way out still weighs one — which is true, and is a{' '}
      <i>ratio</i>, and a ratio has no opinion about how many there are. That
      was the whole of the pull, and on its own it is worth exactly{' '}
      <b style={{ color: INK }}>one sixth</b> of Mercury’s perihelion advance
      and <b style={{ color: INK }}>none at all</b> of light’s deflection.
    </Step>

    <Because>the total, which is the other reading</Because>
    <Step eq={<><K>DEG</K> + <V>n</V>&nbsp;&nbsp;ways out, not <K>DEG</K></>}>
      A point that has taken <V>n</V> annihilations has more ways out of it
      than its neighbours do, so it{' '}
      <b style={{ color: INK }}>holds more space</b> — and a neighbourhood of
      such points contains more places than the drawn cell it occupies, so
      crossing it takes more steps. Nothing new is measured. It is the same{' '}
      <V>n</V>, and it is a fact about the <i>place</i> rather than about the
      direction.
    </Step>

    <Because>which is a metric, and needs no tensor</Because>
    <Step eq={<>d<V>s</V><Sup>2</Sup> = −<V>A</V> d<V>t</V><Sup>2</Sup> +
      <V>B</V> (d<V>x</V><Sup>2</Sup> + d<V>y</V><Sup>2</Sup> + d<V>z</V><Sup>2</Sup>)</>}>
      <V>A</V> is the lean — how much slower a clock there runs — and{' '}
      <V>B</V> is the total. <V>B</V> is a <i>scalar</i> here, and that is not
      an approximation: radial-against-transverse is a fact about a choice of
      radial coordinate, and at this order the spatial part is
      (1 + 2<V>u</V>)δ for any arrangement of masses whatever. A lattice has no
      coordinates to choose between, so the question never arises for it.
    </Step>

    <Because>written closed rather than as the series</Because>
    <Step eq={<>
      <V>A</V> = <Paren><Frac over={<>1 − <V>s</V></>} under={<>1 + <V>s</V></>} /></Paren><Sup>2</Sup>
      = 1 − 2<V>u</V> + 2<V>u</V><Sup>2</Sup> − …
      <span style={{ padding: '0 1em' }} />
      <V>B</V> = (1 + <V>s</V>)<Sup>4</Sup> = 1 + 2<V>u</V> + …
    </>}>
      A series used outside where it converges stops being a metric: at{' '}
      <V>u</V> = 1 the series for <V>A</V> comes back up through one, and since
      the coordinate speed of light is <V>c</V>√(<V>A</V>/<V>B</V>), that puts
      the ceiling <i>above</i> light. Closed,{' '}
      <V>A</V>/<V>B</V> = (1 − <V>s</V>)<Sup>2</Sup>/(1 + <V>s</V>)<Sup>6</Sup>{' '}
      is at most one for any <V>s</V> ≥ 0, so light is the ceiling again as a
      property of the functions rather than a clamp.
    </Step>

    <Because>and the coefficient is not free</Because>
    <Step>
      <V>A</V> and <V>B</V> carry the same <V>u</V> with the same coefficient,
      which is the statement that a point’s lean and a point’s thickness are
      one event seen twice. That fixes{' '}
      <V>γ</V><Sub>PPN</Sub> = 1, and Cassini has{' '}
      <V>γ</V><Sub>PPN</Sub> at 1 ± 2·10<Sup>−5</Sup> — so it is the sharpest
      thing here to be wrong about, and it is a prediction rather than a knob.
    </Step>

    <Because>measured</Because>
    <Step eq={<>6.05 … 6.20 sixths&nbsp;&nbsp;=&nbsp;&nbsp;6 + 3.3<V>u</V></>}>
      Five orbits over two panels at two scales, each against its own
      6π<V>GM</V>/<V>c</V><Sup>2</Sup><V>a</V>(1−<V>e</V><Sup>2</Sup>): Mars
      6.05, Earth 6.08, Mercury 6.07, Venus 6.10, Mercury on the closer panel
      6.20 — ordered by how deep the orbit sits and by nothing else. Light,
      traced through √(<V>B</V>/<V>A</V>), goes 1.0181 → 0.9998 of
      4<V>GM</V>/<V>bc</V><Sup>2</Sup> as the ray is taken out from 12.5 cells
      to 200, with the same 3<V>u</V> on the way in. One coefficient, two
      unrelated measurements, nothing fitted in either.
    </Step>
  </>,
};

export const SPACE: Derivation = {
  label: 'where space comes from',
  title: <>the three rewrites, and what they buy</>,
  body: <>
    <Because>the rules, in full</Because>
    <Step eq={<>neutral &nbsp;→&nbsp; + &nbsp; −</>}>
      One point becomes the two a ± pair needs. <b style={{ color: INK }}>Net
        +1 point</b> — making a charge <i>makes space</i>, and that is the
      whole of where <V>B</V> comes from.
    </Step>

    <Step eq={<>+ &nbsp; − &nbsp;→&nbsp; neutral</>}>
      A meeting merges them back. <b style={{ color: INK }}>Net −1</b>, which
      is <K>BITE</K> = 1 — and it has to be one, because a meeting consumes
      exactly one creation’s worth of charge. At two, a perfectly paired
      universe would leave itself a point smaller every cycle and contract for
      free.
    </Step>

    <Step eq={<>a move &nbsp;→&nbsp; consume ahead, emit behind</>}>
      <b style={{ color: INK }}>Net 0.</b> A point is unmade in one place and
      remade in the next. Nothing travels — but a <i>surplus</i> can be carried,
      and that is what makes the rest settle.
    </Step>

    <Because>a worked example — one body, one tick</Because>
    <Step>
      A body of mass <V>m</V> lets go of <V>m</V>·<K>SHEET</K> charges. Each
      costs a neutral point, so the body makes <V>m</V>·<K>SHEET</K> points, at
      its own place. Not in its field — <i>at the body</i>. That is a point
      source, and it is the one thing every earlier account of <V>B</V> did not
      have: they all sourced from chance ∝ 1/<V>r</V><Sup>2</Sup>, and a source
      spread like that gives a logarithm, not a potential.
    </Step>

    <Because>and what the moves then do with it</Because>
    <Step eq={<>
      <Frac over={<>∂<V>δ</V></>} under={<>∂<V>t</V></>} /> =
      <V>D</V>∇<Sup>2</Sup><V>δ</V> + <V>S</V>·<V>δ</V><Sup>3</Sup>(<V>x</V>)
      &nbsp;&nbsp;⇒&nbsp;&nbsp;
      <V>δ</V>(<V>r</V>) = <Frac over={<V>S</V>} under={<>4<V>π D r</V></>} />
    </>}>
      <b style={{ color: INK }}>Static</b>, because the flux carries the
      surplus away as fast as it is made — every version of this that did not
      carry it grew without bound instead. And{' '}
      <b style={{ color: INK }}>1/<V>r</V></b>, because that is what the
      inverse Laplacian of a point is. Solved on a radial grid, <V>δ</V>·<V>r</V>{' '}
      stops moving to five figures over a sixfold longer run.
    </Step>

    <Because>which fixes D</Because>
    <Step eq={<>
      <V>D</V> = <Frac over={<><K>SHEET</K> <V>c</V><Sup>2</Sup></>}
        under={<>12<V>π</V> <V>G</V></>} /> =
      <Frac over={<><V>π</V> <K>DEG</K> <V>c</V></>}
        under={<>3 <K>BITE</K> <K>SHEET</K></>} /> = 3.403
    </>}>
      From <V>δ</V> = 3<V>u</V> and <V>u</V> = <V>GM</V>/<V>rc</V><Sup>2</Sup>.
      A pure count, no <K>GRAIN</K>, and order one — but read as a mean free
      path it is 10.21 cells, and where that could come from is the whole
      difficulty. <b style={{ color: INK }}>It is not independent of ε</b> —{' '}
      <V>D</V> = <V>c</V>/<V>ε</V> exactly. Both are the same requirement,
      written as a rate and as a spread, so the agreement is bookkeeping.
    </Step>

    <Because>and what falls out</Because>
    <Step eq={<><V>u</V> = <Frac over={<V>Gm</V>}
      under={<><V>r c</V><Sup>2</Sup></>} /></>}>
      Linear in the <i>other</i> mass alone, so a fact about the place rather
      than the pair — which is what the folding could never say before. It can
      be asked anywhere, not only at a body. And every number it produces is
      identical to the old reading that took the pull and called its potential{' '}
      <V>u</V>: same orbits, same 1/6, same deflection. What changed is that it
      is now derived.
    </Step>
  </>,
};

export const MADE_FROM: Derivation = {
  label: 'ε',
  title: <>what a charge would have to make</>,
  body: <>
    <Because>the rule</Because>
    <Step>
      Space is made, and every created point emits a ± pair. The vacuum’s pairs
      are made <i>with</i> their point and take it back when they meet, so they
      are net nothing. A body’s charges are emitted <i>without</i> one, and the
      space they make as they go is the part not already accounted for.
    </Step>

    <Because>what that leaves at a distance</Because>
    <Step eq={<>
      <V>δ</V>(<V>r</V>) =
      <Frac over={<><V>ε m</V> <K>SHEET</K></>}
        under={<>4<V>π r c</V></>} />
    </>}>
      Creation spread as the charges are, which is{' '}
      chance ∝ 1/<V>r</V><Sup>2</Sup>, integrated over the shell it sits on —
      and the <V>r</V><Sup>2</Sup> cancels, so the flux goes as <V>r</V> and
      what it leaves per unit volume goes as 1/<V>r</V>.
    </Step>

    <Because>and a metric wants</Because>
    <Step eq={<><V>δ</V> = <V>B</V><Sup>3/2</Sup> − 1 = 3<V>u</V></>}>
      A spatial metric <V>g</V><Sub>ij</Sub> = <V>B</V><V>δ</V><Sub>ij</Sub>{' '}
      makes proper volume go as <V>B</V><Sup>3/2</Sup>, so a <i>volume</i>{' '}
      excess is three times the <V>u</V> in <V>B</V> = 1 + 2<V>u</V>.
    </Step>

    <Because>so</Because>
    <Step eq={<>
      <V>ε</V> =
      <Frac over={<>3 <K>BITE</K> <K>SHEET</K></>}
        under={<><V>π</V> <K>DEG</K></>} /> = 0.2938
    </>}>
      About a third of a point per charge per lattice tick. Every symbol a
      count, no <K>GRAIN</K> in it, and order one — which is what a fundamental
      rule should look like. <b style={{ color: INK }}>No rule produces it.</b>{' '}
      It is solved for, not derived, and that is exactly the gap.
    </Step>

    <Because>one constraint on whatever closes it</Because>
    <Step>
      An ambient field <i>screens</i>. A body’s charges annihilate against it
      too, so they reach only <V>λ</V> = <V>c</V>/(<K>BITE</K>·share·<V>Φ</V><Sub>0</Sub>),
      and gravity becomes Yukawa with that range. Working out to cluster scale
      needs <V>Φ</V><Sub>0</Sub> ≲ 10<Sup>−58</Sup> charges a lattice cell — so
      a vacuum dense enough to carry anything is dense enough to switch gravity
      off within about seven steps.
    </Step>

    <Because>and that constraint turned out to be the one that closes it — the other way</Because>
    <Step eq={<>
      <V>D</V> = <V>cλ</V>/3
      <span style={{ padding: '0 1.2em', color: FAINT }}>needs 10.2 cells</span>
      <V>λ</V> = <K>REACHES</K>·<V>R</V><Sub>h</Sub>
      <span style={{ padding: '0 1.2em', color: FAINT }}>is 2.9·10<Sup>60</Sup></span>
    </>}>
      The same number written as a diffusivity is <V>D</V> = <V>c</V>/<V>ε</V> =
      3.403, and a diffusivity <i>is not free</i>: for anything moving at{' '}
      <V>c</V> it is <V>cλ</V>/3. So the account is only as good as the{' '}
      <V>λ</V> the lattice can supply — and the only constant-density scatterer
      here is the vacuum, whose length the panel below already computes.{' '}
      <b style={{ color: INK }}>They disagree by fifty-nine orders of
        magnitude.</b> Sourcing the scattering from the body’s own field
      instead does not save it: chance ∝ 1/<V>r</V><Sup>2</Sup> makes{' '}
      <V>λ</V> ∝ <V>r</V><Sup>2</Sup> and the profile comes out
      1/<V>r</V><Sup>3</Sup>.
    </Step>

    <Because>which puts the surplus in the ballistic limit — measured</Because>
    <Step eq={<span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.8em' }}>
      λ=10.2 → 1/r ✓&nbsp;&nbsp;&nbsp;λ=10³ → 1/r²&nbsp;&nbsp;&nbsp;λ=10⁶ → 1/r²
    </span>}>
      Point source, charges streaming at <V>c</V>, exponential free path,
      tallying path per shell. At <V>λ</V> = 10.2 the profile is 1/<V>r</V> at
      exactly the assumed coefficient — ratio 0.989 in the window{' '}
      <V>λ</V> ≪ <V>r</V> ≪ <V>R</V> — so the <i>mechanism</i> is sound. At{' '}
      <V>λ</V> ≫ <V>r</V> it is 1/<V>r</V><Sup>2</Sup>, equal to{' '}
      <V>S</V>/4π<V>c</V> to 0.6%. And{' '}
      <b style={{ color: INK }}><V>δ</V> ∝ 1/<V>r</V><Sup>2</Sup> is not a
        potential</b> — it does not give Newton, never mind the metric.
    </Step>

    <Because>so the honest statement changed</Because>
    <Step>
      It was <i>the coefficient is unfound</i>. It is now: <V>ε</V> and the
      reach are the same vacuum read twice, and they demand lengths fifty-nine
      orders apart, so <b style={{ color: INK }}>they cannot both be right</b>.
      Drop the reach and <V>λ</V> is free, but 0.361 is the one full prediction
      here and it goes with it. Keep it and diffusion cannot be where the metric
      comes from.{' '}
      <b style={{ color: INK }}>Keep it</b>: it is counted and <V>ε</V> was
      solved for, and a derived number outranks a fitted one.
    </Step>

    <Because>and spending it that way pays, which was not expected</Because>
    <Step eq={<>∫<Sub><V>r</V></Sub><Sup>∞</Sup> d<V>s</V>/<V>s</V><Sup>2</Sup> = 1/<V>r</V></>}>
      Killing diffusion does not kill the point source, because there is a way
      to get 1/<V>r</V> from a 1/<V>r</V><Sup>2</Sup> density that needs no
      transport at all and had not been tried:{' '}
      <b style={{ color: INK }}>integrate it radially</b>. One integration,
      nothing free. Measured with <V>δ</V> = chance/<V>c</V>, it lands on{' '}
      <V>m</V>·<K>SHEET</K>/(4π<V>rc</V>) to six figures. And it is not
      “read <V>u</V> off the force” — <V>δ</V> goes as <V>m</V><Sub>b</Sub>{' '}
      alone where the pull goes as <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub>, so
      it is a fact about a <i>place</i>, which was the whole objection.
    </Step>

    <Because>so it predicts G rather than absorbing it — and gets it wrong, precisely</Because>
    <Step eq={<>
      <Frac over={<><K>SHEET</K>·<V>c</V>/12π</>}
        under={<><K>SHEET</K><Sup>2</Sup>/4π<Sup>2</Sup><K>DEG</K></>} /> =
      <Frac over={<>π<K>DEG</K></>} under={<>3<K>SHEET</K></>} /> = 3.4034
    </>}>
      Predicted <V>G</V> = 0.21221, the pull’s <V>G</V> = 0.06235, ratio
      3.403392 — and <b style={{ color: INK }}>that is <V>ε</V>’s own number,
        to every digit</b>. Which says what it always was: not a diffusivity,
      but the factor by which the metric route’s <V>G</V> exceeds the pull
      route’s, wearing the name of a mechanism it does not have.
    </Step>

    <Because>and the route the audit implied — tried, and excluded</Because>
    <Step eq={<>
      <V>Φ</V> · <V>λ</V> =
      <Frac over={<>1</>} under={<><K>BITE</K>·share</>} /> = 2
      <span style={{ padding: '0 1.2em', color: FAINT }}>pinned</span>
    </>}>
      The pull works because it is a <i>product</i> of two fields along a line —
      which is where <K>DEG</K> enters. A lone body has no second field, and
      that is the shape of the 3.4034. But a lone body is not alone: its charges
      annihilate against the ambient <V>Φ</V>, restoring product, bias and{' '}
      <K>DEG</K> at once. It gives 1/<V>r</V>, and matching{' '}
      <V>u</V> = <V>Gm</V>/<V>rc</V><Sup>2</Sup> fixes{' '}
      <V>Φ</V> = <K>SHEET</K>/π = 2.546 —{' '}
      <b style={{ color: INK }}>against the cosmology attractor’s independent{' '}
        <V>Φ</V> = 2, a ratio of exactly 4/π</b>. The discrepancy drops from a
      mixture of counts to a bare π, the first time any change of mechanism has
      moved it.
    </Step>

    <Because>and then it dies, by a general argument rather than a number</Because>
    <Step>
      The hoped-for escape was that the <i>sourcing</i> <V>Φ</V> and the{' '}
      <i>screening</i> <V>Φ</V> might differ — the vacuum’s pairs being remade,
      so a charge could contribute an event without being consumed. It does not
      survive inspection:{' '}
      <b style={{ color: INK }}>an annihilation removes the <i>body’s</i>{' '}
        charge, and replacing the vacuum pair does not bring it back.</b> The
      event that sources the fold <i>is</i> the event that screens, so strength
      and range are reciprocal with their product pinned at 2. Sourcing needs{' '}
      <V>Φ</V> = 2.546; reaching 1 AU allows 2.16·10<Sup>−46</Sup>. Forty-six
      orders, nothing to tune.
    </Step>

    <Because>which excludes a class, not an attempt</Because>
    <Step>
      Any account that folds space by annihilating a body’s charges against
      something ambient pays for it in range, one for one.{' '}
      <b style={{ color: INK }}>So the source must not <i>consume</i> the
        field</b> — and <V>ε</V> is the only candidate here that doesn’t,
      being creation <i>at</i> the body rather than annihilation out in space.
      Which returns the whole problem to one question: can a point source of
      space be static without a random walk?
    </Step>

    <Because>which is a far better place to be stuck</Because>
    <Step eq={<span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.8em' }}>
      d=2 4.000&nbsp;&nbsp;d=3 3.250&nbsp;&nbsp;d=4 3.077&nbsp;&nbsp;d=5 3.025&nbsp;&nbsp;(want 3/π = 0.955)
    </span>}>
      Two routes, both counted, neither with a free parameter, disagreeing by a{' '}
      <i>pure count</i> — so it is a statement about the lattice’s geometry and
      nothing else, and the search is finite. The fix is not a coefficient and
      not a dimension: they agree iff <K>DEG</K>/<K>SHEET</K> = 3/π, which is
      irrational, while <K>DEG</K>/<K>SHEET</K> is a ratio of integers tending
      to 3 from above.{' '}
      <b style={{ color: INK }}>So one of the two counts is being used for a job
        it is not the count for</b> — and they are not even the same kind of
      thing, <K>SHEET</K> being what a source emits and <K>DEG</K> what a path
      could have done instead. That is the same mistake this file already made
      once, and recorded.
    </Step>
  </>,
};

export const REACH: Derivation = {
  label: 'how far gravity reaches',
  title: <>the ambient field, and the end of the pull</>,
  body: <>
    <Because>every source is putting charges everywhere</Because>
    <Step eq={<>
      <V>Φ</V> = ∫ <V>ρ</V>·<K>SHEET</K> d<V>r</V>
    </>}>
      A shell of the universe at <V>r</V> holds <V>ρ</V>·4π<V>r</V><Sup>2</Sup>d<V>r</V>{' '}
      of mass and puts <V>m</V><K>SHEET</K>/4π<V>r</V><Sup>2</Sup> on you — so it
      contributes <V>ρ</V><K>SHEET</K>d<V>r</V> and{' '}
      <b style={{ color: INK }}>every shell counts the same</b>. That is Olbers’
      paradox in the same form, and the sum does not converge.
    </Step>

    <Because>it converges because it screens itself</Because>
    <Step eq={<>
      <V>Φ</V> = <V>ρ</V><K>SHEET</K><V>λ</V>,&nbsp;&nbsp;
      <V>λ</V> = 1/<V>k</V><V>Φ</V>
      &nbsp;&nbsp;⇒&nbsp;&nbsp;
      <V>λ</V> = 1/√(<V>k</V>·<K>SHEET</K>·<V>ρ</V>)
    </>}>
      Those distant charges were attenuated by the fog they crossed. Solving
      the two together is what makes the integral finite —{' '}
      <V>k</V> = <K>BITE</K>·share.
    </Step>

    <Because>and a body’s own charges are attenuated too</Because>
    <Step eq={<>
      <V>S</V>(<V>a</V>,<V>b</V>) ∝
      <Frac over={<>e<Sup>−<V>R</V>/<V>λ</V></Sup></>}
        under={<><V>R</V><Sup>2</Sup></>} />
    </>}>
      The two attenuations multiply to e<Sup>−<V>R</V>/<V>λ</V></Sup> wherever
      along the line the meeting happens. So the pull is{' '}
      <b style={{ color: INK }}>Yukawa</b>, and gravity has a range.
    </Step>

    <Because>which is a fixed fraction of the horizon</Because>
    <Step eq={<>
      <Frac over={<V>λ</V>} under={<><V>R</V><Sub>h</Sub></>} /> =
      √<Paren><Frac over={<>8<V>π G</V></>}
        under={<>3 <K>BITE</K>·share·<K>SHEET</K></>} /></Paren> = 0.361
    </>}>
      Friedmann has <V>ρ</V> = 3<V>H</V><Sup>2</Sup>/8π<V>G</V>, and the
      density <i>cancels</i>. Gravity reaches about a third of the way to the
      horizon in <b style={{ color: INK }}>any</b> universe this model
      describes — a denser one screens harder in exactly the proportion that it
      expands faster. At our density, 1.55 Gpc.
    </Step>

    <Because>what that looks like</Because>
    <Step>
      Nothing at all in the solar system or the Galaxy. 0.6% down across a
      cluster, <b style={{ color: INK }}>9.2% down at the BAO scale</b>, half
      gone by a gigaparsec. This is the one thing here that is a prediction in
      the full sense — not fitted, not borrowed, not a reproduction — and it
      sits on the <i>derived</i> half of the model. If 0.361 is excluded by
      large-scale structure then the pull is wrong, independently of everything{' '}
      <i>carry</i> and <V>D</V> are still borrowing.
    </Step>
  </>,
};

export const IDENTICAL: Derivation = {
  label: 'gravity between identical things',
  title: <>two of the same, closer than a wavelength</>,
  body: <>
    <Because>ω is not free any more</Because>
    <Step eq={<><V>ω</V> = <V>m</V>,&nbsp;&nbsp; one wavelength = 2π/<V>m</V> = 2π<V>G</V><V>λ</V><Sub>C</Sub></>}>
      Mass is how often a thing pulses, so the rate at which its charge
      reverses is the mass. It used to be set by <K>SLOW</K> in the archive’s{' '}
      <i>models.ts</i> — a drawing choice — and spread 3.7% a body so that no
      two ever matched. That spread was standing in for a fact.
    </Step>

    <Because>a body made of things has no phase</Because>
    <Step eq={<>⟨|<V>ψ</V>|/π⟩ = ½&nbsp;&nbsp; over uniform <V>ψ</V></>}>
      Nothing elementary weighs more than <V>G</V>·<V>m</V><Sub>Planck</Sub> ≈
      1.36 µg, and the Sun is 1.2·10<Sup>57</Sup> nucleons. A sum of that many
      emitters with no reason to agree has a uniform phase, and the average of{' '}
      <i>opposed</i> over uniform phase is exactly a half.{' '}
      <b style={{ color: INK }}>So share = ½ is derived, not arranged</b> — it
      is what being made of things does.
    </Step>

    <Because>but two of the SAME thing do share a phase</Because>
    <Step eq={<>
      <V>G</V><Sub>eff</Sub>/<V>G</V> = 2·share
    </>}>
      Same mass, same ω, so they hold a fixed relation for as long as they
      exist and <i>coherence</i> walks instead of returning a half. Measured
      from it directly:
    </Step>

    <Step eq={<>
      <span style={{ fontFamily: 'monospace', fontSize: '0.82em', whiteSpace: 'pre' }}>
        {`R/λ        0.02   0.10   0.20   0.50   1.00   ≥1.5
in step    0.02   0.12   0.24   0.59   1.00   1.00
half out   1.98   1.88   1.76   1.41   1.00   1.00`}
      </span>
    </>}>
      <b style={{ color: INK }}>In step and close together there is no gravity
        between them at all.</b> They put out the same sign at the same moment,
      so nothing cancels, so nothing is annihilated, so the interval between
      them does not shorten. Out of step, every meeting cancels and the pull is
      doubled. Beyond one wavelength both settle to the ordinary law.
    </Step>

    <Because>so</Because>
    <Step>
      Between two of the same elementary thing, <V>G</V> runs anywhere from
      nought to 2<V>G</V> over the first Compton wavelength, and which one
      depends on their relative phase. Inside <V>λ</V><Sub>C</Sub> that is not
      a correction to gravity — it is a different interaction, and one that
      already knows about phase. None of it was added: <i>coherence</i>,{' '}
      <i>opposed</i> and ω have been here since the pull was written. Telling
      ω that it is the mass is what turned them into this.
    </Step>
  </>,
};

export const COHERENT: Derivation = {
  label: 'share as a coherence',
  title: <>the one factor that knows about phase</>,
  body: <>
    <Because>what share actually is, in the source</Because>
    <Step eq={<>share = ⟨opposed(<V>ψ</V>)⟩,&nbsp;&nbsp; opposed(<V>ψ</V>) = |<V>ψ</V>|/π</>}>
      Wrapped to [−π, π] and averaged over the path difference. Every other
      factor in <V>S</V><Sub>ab</Sub> is a count of arrivals; this one is the
      only place a <i>phase</i> enters the pull at all. So the gravity above is
      not a classical law waiting to be quantised —{' '}
      <b style={{ color: INK }}>it is already an expectation value</b>, taken
      over a phase the derivation decided not to track.
    </Step>

    <Because>and what a Born rule would want there instead</Because>
    <Step eq={<>
      ¼|<V>e</V><Sup>i<V>φ</V><Sub>a</Sub></Sup> −{' '}
      <V>e</V><Sup>i<V>φ</V><Sub>b</Sub></Sup>|<Sup>2</Sup> =
      (1 − cos <V>ψ</V>)/2
    </>}>
      A modulus-square of a difference of two phases — the shape every
      interference term in quantum mechanics has. It agrees with |<V>ψ</V>|/π
      at nought, at a half cycle and at π, which is why nothing measured so far
      could tell them apart. In between it does not.
    </Step>

    <Because>the two kernels, through the same walk</Because>
    <Step eq={<>
      <span style={{ fontFamily: 'monospace', fontSize: '0.82em', whiteSpace: 'pre' }}>
        {`R/λ        0.02   0.10   0.20   0.27   0.50   1.00
triangle   0.024  0.119  0.238  0.318  0.595  1.000
cosine     0.001  0.026  0.099  0.171  0.500  1.000`}
      </span>
    </>}>
      <V>G</V><Sub>eff</Sub>/<V>G</V> for two of the same thing in step, run
      through the same raised-cosine window. <b style={{ color: INK }}>The
      triangle vanishes linearly in the separation and the cosine
      quadratically</b>, and the gap between them peaks at 0.147 at{' '}
      <V>R</V>/<V>λ</V> = 0.268.
    </Step>

    <Because>and what it would take to look</Because>
    <Step eq={<>0.268 <V>λ</V> = 40.5 fm&nbsp;&nbsp; for two electrons</>}>
      One model wavelength is 2π<V>G</V><V>λ</V><Sub>C</Sub> = 0.151 pm for an
      electron, so the place the two kernels disagree most is forty femtometres
      apart — where the electric force between them is 4.166·10<Sup>42</Sup>{' '}
      times the gravitational one, which is the same ratio the magnetism arc
      owes <V>α</V> for. <b style={{ color: INK }}>So the discriminator is
      real, sharp, and unreachable</b>, and it is stated here rather than
      advertised as a test.
    </Step>
  </>,
};

export const RECORD: Derivation = {
  label: 'the which-path rate',
  title: <>what a superposition leaves behind</>,
  body: <>
    <Because>the rule does not know whose charge it is</Because>
    <Step>
      (G/1) says two rays meeting annihilate. It says nothing about whether
      they came from the same emitter, and there is no bookkeeping anywhere in
      the model that could mark two rays <i>same particle, skip</i>. So a
      source in two places has its two branches annihilating against each
      other exactly as two bodies would — which the model already computes for
      a single body, as the <K>SKIN</K> self-screening.
    </Step>

    <Because>but that is two different rates, and only one of them decoheres</Because>
    <Step eq={<>
      <V>Γ</V><Sub>cross</Sub> — branch against branch
      <span style={{ padding: '0 1.2em', color: FAINT }}>vs</span>
      <V>Γ</V><Sub>env</Sub> — branch against everything else
    </>}>
      Branch-against-branch needs <i>both</i> branches present, so it is the
      interference term itself — it is what makes the pair's own gravity
      differ from <V>G</V>, and it carries no information about which branch
      the thing was in. Only an annihilation against the <i>outside</i> leaves
      folded space at a place that differs between the branches, and folded
      space is permanent. <b style={{ color: INK }}>That is the record.</b>
    </Step>

    <Because>so integrate the records over the field</Because>
    <Step eq={<>
      <V>Γ</V><Sub>env</Sub> = ∫<Sub>d</Sub><Sup>∞</Sup> share·<V>ρ</V>·
      chance(<V>m</V>,<V>r</V>)·<V>c</V> ·
      (<V>d</V>/<V>r</V>)<Sup>2</Sup> · 4π<V>r</V><Sup>2</Sup> d<V>r</V>
    </>}>
      The bracket is the distinguishability: two branches <V>d</V> apart look
      identical at <V>r</V> ≫ <V>d</V> up to a dipole term going as{' '}
      <V>d</V>/<V>r</V>, and fully distinct inside <V>d</V>. Everything else is
      the ambient annihilation rate the vacuum section already carries.
    </Step>

    <Because>and the r's cancel, twice</Because>
    <Step eq={<>
      <V>Γ</V><Sub>env</Sub> = ½ <V>ρ</V> <K>SHEET</K> <V>m</V> <V>d</V> =
      <span style={{ padding: '0 0.5em' }} />
      <V>m</V><V>d</V>/<V>λ</V><Sup>2</Sup>
    </>}>
      chance carries 1/<V>r</V><Sup>2</Sup>, the shell carries{' '}
      <V>r</V><Sup>2</Sup>, the dipole carries 1/<V>r</V><Sup>2</Sup> again, so
      what is left is ∫d<V>r</V>/<V>r</V><Sup>2</Sup> = 1/<V>d</V> and the{' '}
      <V>d</V><Sup>2</Sup> above it leaves one power of <V>d</V>. Then{' '}
      <V>λ</V> = 1/√(<K>BITE</K>·share·<K>SHEET</K>·<V>ρ</V>) from the vacuum
      section eats <V>ρ</V> and <K>SHEET</K> whole.{' '}
      <b style={{ color: INK }}>Linear in the mass, linear in the separation,
      and the constant is the screening length gravity already had.</b>{' '}
      Nothing was fitted and nothing new was introduced.
    </Step>

    <Because>and then the number, which kills it</Because>
    <Step eq={<>
      <span style={{ fontFamily: 'monospace', fontSize: '0.82em', whiteSpace: 'pre' }}>
        {`                          m (kg)    d (m)    t_decoh (s)
electron                  9.1e−31   1e−6     2.5e+71
C60                       1.2e−24   1e−7     1.9e+66
1e−14 kg nanoparticle     1e−14     1e−4     2.3e+53
1 kg, a metre apart       1         1        2.3e+35`}
      </span>
    </>}>
      Against an age of the universe of 4.35·10<Sup>17</Sup> s. In SI the whole
      law is <V>Γ</V> = 4.41·10<Sup>−36</Sup>·<V>M</V>·<V>d</V> per second,
      because <V>λ</V> is 1.63 horizon radii and 1/<V>λ</V><Sup>2</Sup> is
      10<Sup>−122</Sup>. <b style={{ color: INK }}>The vacuum is far too thin
      to be an environment</b>, by thirty-five orders at best. The rate is
      derived rather than assumed, which is what was wanted, and it is not the
      mechanism of anything.
    </Step>
  </>,
};

export const CEILING: Derivation = {
  label: 'G as a mass',
  title: <>the constant, read as a mass in Planck masses</>,
  body: <>
    <Because>where each symbol comes from — one body first</Because>
    <Step eq={<>
      chance(<V>m</V>,<V>r</V>) =
      <Frac over={<><V>m</V> · <K>SHEET</K></>} under={<>shell(<V>r</V>)</>} />
    </>}>
      A source lets go of <K>SHEET</K> charges a pulse and they spread over the
      shell they have grown to, so the chance a given cell is holding one is that
      count over how much shell there is. <b style={{ color: INK }}>One factor of{' '}
        <K>SHEET</K>, per body.</b> The inverse square is already here and
      nobody wrote it down: a shell in three dimensions goes as <V>r</V><Sup>2</Sup>.
    </Step>

    <Because>and a meeting needs BOTH of them in the same cell — which is where the square is</Because>
    <Step eq={<>
      chance(<V>m</V><Sub>a</Sub>, <V>x</V>) ·
      chance(<V>m</V><Sub>b</Sub>, <V>R</V>−<V>x</V>)
    </>}>
      <b style={{ color: INK }}><K>SHEET</K><Sup>2</Sup> is one factor from each
        body, not a sheet squared.</b> The two carry different masses and sit at
      different radii, which is the whole tell — a square coming from the sheet’s
      own shape would carry one mass at one place. It is also where{' '}
      <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub> comes from: drop either factor and
      the law stops being about two bodies.
    </Step>

    <Because>summed along the line between them, which is the line an annihilation shortens</Because>
    <Step eq={<>
      met(<V>R</V>) =
      <Frac over={<>4</>} under={<><K>CORE</K> <V>R</V><Sup>2</Sup></>} />
      <Paren>1 + <Frac over={<K>CORE</K>} under={<V>R</V>} /> ln
        <Frac over={<><V>R</V>−<K>CORE</K></>} under={<K>CORE</K>} /></Paren>
    </>}>
      Two inverse squares multiplied and added up along the line collapse back to{' '}
      <i>one</i> inverse square, times a bracket that goes to one. The 1/<K>CORE</K>{' '}
      is the two dense ends. Worked out under <i>met(R)</i>.
    </Step>

    <Because>and what one meeting is worth to a path</Because>
    <Step eq={<><K>BIAS</K> = <Frac over={<K>LIGHT</K>} under={<K>DEG</K>} /></>}>
      One annihilation leaves one extra way out of that point, against the{' '}
      <K>DEG</K> ways that were already there. Multiply the meeting rate by it
      and collect: the (4<V>π</V>)<Sup>2</Sup> from the two shells, with met’s 4
      divided back out, is the 4<V>π</V><Sup>2</Sup>.
    </Step>

    <Because>so the formula is counted — and now the second question</Because>
    <Step eq={<>
      <K>G</K> =
      <Frac over={<><K>BITE</K> · <i>share</i> · <K>SHEET</K><Sup>2</Sup> · <K>c</K></>}
        under={<>4<V>π</V><Sup>2</Sup> · <K>CORE</K> · <K>DEG</K></>} />
    </>}>
      Every symbol a count, and none of it fitted. The rest of this panel is the
      other question:{' '}
      <b style={{ color: INK }}>why the ceiling <V><Bar>m</Bar></V> = 1 hands you
        that same number.</b>
    </Step>

    <Because>what the ceiling is, in kilograms</Because>
    <Step eq={<>
      <V><Bar>m</Bar></V> = 1
      <span style={{ padding: '0 0.8em', color: FAINT }}>⇒</span>
      <V>µ</V> = {(massUnit(1) * 1e9).toFixed(3)} µg
    </>}>
      One pulse a tick is the most anything can do, so there is a heaviest thing
      that can pulse on its own, and it has a definite weight. Call it <V>µ</V>.
      That is the lattice’s own mass unit — arrived at from the tick rule, with
      no object anywhere in it.
    </Step>

    <Because>to say what µ IS you need a yardstick with no object in it either</Because>
    <Step eq={<>
      <V>m</V><Sub>P</Sub> = √(ħ<V>c</V>/<V>G</V>) =
      {(2.176434e-8 * 1e9).toFixed(2)} µg
    </>}>
      Comparing <V>µ</V> to an electron would give a number that says nothing —
      it would be a fact about which particles happen to exist. The Planck mass
      is the only mass that can be built out of <V>c</V>, ħ and <V>G</V> alone,
      so it is the one yardstick with nothing contingent in it. It is also{' '}
      <b style={{ color: INK }}>where a mass’s two lengths cross</b>: its
      quantum length ħ/<V>Mc</V> shrinks as <V>M</V> grows and its gravitational
      length <V>GM</V>/<V>c</V><Sup>2</Sup> grows, and they meet there.
    </Step>

    <Because>and in Planck’s units the gravitational constant is one</Because>
    <Step eq={<><K>G</K> = 1
      <span style={{ padding: '0 0.8em', color: FAINT }}>in</span>
      (<V>l</V><Sub>P</Sub>, <V>t</V><Sub>P</Sub>, <V>m</V><Sub>P</Sub>)</>}>
      That is what Planck units <i>are</i> — the system built so that{' '}
      <V>c</V> = ħ = <V>G</V> = 1. So any number other than one that <V>G</V>{' '}
      takes is a statement about how the units being used differ from those.
    </Step>

    <Because>and the lattice already shares two of the three</Because>
    <Step eq={<>
      step = <V>l</V><Sub>P</Sub>
      <span style={{ padding: '0 1em' }} />
      tick = <V>t</V><Sub>P</Sub>
      <span style={{ padding: '0 1em' }} />
      [<V>G</V>] = length³/(time²·mass)
    </>}>
      With the length and the time already Planck’s,{' '}
      <b style={{ color: INK }}>the only thing left that can move <V>G</V>’s
        number is the mass unit</b> — and since mass sits alone in the
      denominator of <V>G</V>’s units, it moves it in direct proportion. There is
      nothing else in the expression for it to be about.
    </Step>

    <Because>so</Because>
    <Step eq={<>
      <K>G</K> = <V>µ</V>/<V>m</V><Sub>P</Sub> =
      {gravitational(1).toFixed(6)}
    </>}>
      <b style={{ color: INK }}>The gravitational constant here is not a
        strength. It is the heaviest elementary thing, weighed in Planck
        masses.</b> Exactly, with nothing to compute:{' '}
      {(massUnit(1) * 1e9).toFixed(3)} µg against{' '}
      {(2.176434e-8 * 1e9).toFixed(2)} µg. And read the other way,{' '}
      1/<K>G</K> = {(1 / gravitational(1)).toFixed(3)} is how many times lighter
      than nature’s own mass the lattice’s own mass is.
    </Step>

    <Because>which is why it is not one, and that is the whole of what it says</Because>
    <Step>
      Two definitions of a mass, neither of which mentions any object. Nature’s
      is where a mass’s quantum length and its gravitational length cross. The
      lattice’s is the heaviest thing that can pulse once a tick.{' '}
      <b style={{ color: INK }}><K>G</K> ≠ 1 is the statement that those two do
        not agree</b>, and its value is the amount by which they miss.
    </Step>

    <Because>with the polarity put back, both halve together</Because>
    <Step eq={<>
      <K>G</K>: {gravitational(1).toFixed(6)} → {gravitational(0.5).toFixed(6)}
      <span style={{ padding: '0 1em' }} />
      <V>µ</V>: {(massUnit(1) * 1e9).toFixed(3)} → {(massUnit(0.5) * 1e9).toFixed(3)} µg
    </>}>
      This arc has no signs in it, so every meeting annihilates and{' '}
      <i>share</i> = 1. Once polarity arrives only half of them do, ordinary
      matter being unbiased, and the constant halves. <V>µ</V> halves with it,
      because <V>µ</V> = <K>G</K>·<V>m</V><Sub>P</Sub> — so the ratio above is
      untouched and so is every orbit, since masses are carried in units of{' '}
      <K>G</K>. <b style={{ color: INK }}>What changes is the mass unit and
        nothing else.</b>
    </Step>

    <Because>and one number here is a trap</Because>
    <Step eq={<>
      1/<K>G</K> = {(1 / gravitational(1)).toFixed(4)}
      <span style={{ padding: '0 1em', color: FAINT }}>against</span>
      <K>SHEET</K> = 8
    </>}>
      <b style={{ color: BORROWED }}>Those are not the same number and should
        not be read as one.</b> They agree to{' '}
      {(100 * Math.abs(1 / gravitational(1) - 8) / 8).toFixed(2)}%, which is
      close enough to invite a story and far enough to be nothing —{' '}
      1/<K>G</K> carries a 4<V>π</V><Sup>2</Sup> and a <K>DEG</K> that no count
      of <K>SHEET</K> cancels. This file warns against exactly this kind of near
      miss elsewhere, and the warning applies to itself.
    </Step>
  </>,
};

export const CLOCK: Derivation = {
  label: 'mass as a period',
  title: <>once a tick is the ceiling</>,
  body: <>
    <Because>what the lattice says, which so far is only a rewriting</Because>
    <Step eq={<>
      0 ≤ <V><Bar>m</Bar></V> ≤ <K><Bar>c</Bar></K>
      <span style={{ padding: '0 1em' }} />
      <V><Bar>m</Bar></V>.period = 1/<V><Bar>m</Bar></V>
      <span style={{ padding: '0 0.8em', color: FAINT }}>ticks</span>
    </>}>
      Mass here is what <i>fraction of the ticks</i> a thing spends pulsing, so
      the ceiling needs no argument beyond what a fraction is: you cannot spend
      more than all of them. Turned round it is a period — something of mass{' '}
      <V><Bar>m</Bar></V> pulses once every 1/<V><Bar>m</Bar></V> ticks — and the
      ceiling is one pulse a tick, the same one-thing-a-tick that makes{' '}
      <K><Bar>c</Bar></K> one step a tick. So{' '}
      <b style={{ color: INK }}>there is a heaviest elementary thing</b>:
      anything above it is not one emitter but many.
    </Step>

    <Because>turn that period into a length, which is the only move made here</Because>
    <Step eq={<>
      <V><Bar>m</Bar></V>.period · <K><Bar>c</Bar></K> = 1/<V><Bar>m</Bar></V>
      <span style={{ padding: '0 0.8em', color: FAINT }}>steps</span>
    </>}>
      How far does light get between one pulse and the next? A step a tick, so{' '}
      1/<V><Bar>m</Bar></V> steps — the spacing between the shells a source has
      in flight. <b style={{ color: INK }}>Nothing has been claimed yet</b>: this
      is the definition of mass with a <K><Bar>c</Bar></K> beside it, true by
      arithmetic. But it does say that{' '}
      <b style={{ color: INK }}>every mass has a length attached to it</b>, and
      that doubling the mass halves the length — exactly, not roughly. That is
      the kind of claim that can be wrong.
    </Step>

    <Because>and one thing in physics already has that shape</Because>
    <Step eq={<>
      <D><V>λ</V><Sub>Compton</Sub></D> =
      <Frac over={<>ħ</>} under={<><V>Mc</V></>} />
    </>}>
      The <i>reduced</i> Compton wavelength, and where it comes from has nothing
      to do with lattices. Put <V>E</V> = <V>Mc</V><Sup>2</Sup> — a mass is an
      amount of energy — together with <V>E</V> = ħ<V>ω</V> — an amount of
      energy is a rate of turning. Every mass therefore has a frequency, and
      light travelling for one of its periods covers ħ/<V>Mc</V>. Heavier is
      shorter, in exact inverse proportion, same as the pulse spacing.{' '}
      <b style={{ color: BORROWED }}>Mind which one:</b> the unreduced{' '}
      <V>h</V>/<V>Mc</V> is 2π bigger, and the constant below is for the reduced.
    </Step>

    <Because>two lengths that both go as 1/M are proportional, so the whole question is the constant</Because>
    <Step eq={<>
      <V><Bar>m</Bar></V>.period · <K><Bar>c</Bar></K> = <V>k</V> ·
      <D><V>λ</V><Sub>Compton</Sub></D>
      <span style={{ padding: '0 1em', color: FAINT }}><V>k</V> dimensionless</span>
    </>}>
      Not approximately and not over some range —{' '}
      <i>exactly, at every mass</i>, because both sides are a something over the
      mass and the mass divides out between them. One pure number left to find.
    </Step>

    <Because>and the way to find it is to ask it at the ceiling, where both sides are easy</Because>
    <Step eq={<>
      <V><Bar>m</Bar></V> = 1
      <span style={{ padding: '0 0.8em', color: FAINT }}>⇒ pulse spacing =</span>
      1 step
    </>}>
      The ratio is the same at every mass, so it may as well be read off the one
      mass where nothing has to be computed. At the ceiling a thing pulses every
      tick and light goes a step a tick, so{' '}
      <b style={{ color: INK }}>its pulse spacing is exactly one step</b>. All
      that is left is: how long is <i>its</i> Compton wavelength, in steps?
    </Step>

    <Because>which needs one fact about the Planck mass, and it is a definition rather than a coincidence</Because>
    <Step eq={<>
      ħ/(<V>m</V><Sub>P</Sub><V>c</V>) = <V>l</V><Sub>P</Sub>
      <span style={{ padding: '0 1em', color: FAINT }}>= 1 step</span>
    </>}>
      <b style={{ color: INK }}>The Planck mass is defined as the mass whose
        reduced Compton wavelength is the Planck length.</b> And the lattice’s
      step <i>is</i> the Planck length. So the Planck mass is the mass whose
      Compton wavelength is exactly one step — which turns the question into a
      comparison of two masses rather than of two lengths.
    </Step>

    <Because>so the constant is just how much lighter the ceiling is than that</Because>
    <Step eq={<>
      <V>µ</V> = <V>k</V>·<V>m</V><Sub>P</Sub>
      <span style={{ padding: '0 1em', color: FAINT }}>⇒ its wavelength is</span>
      1/<V>k</V> steps
    </>}>
      A Compton wavelength goes as 1/<V>M</V>, so something <i>k</i> times
      lighter than the Planck mass has a wavelength 1/<i>k</i> times longer. Set
      that against the one step of pulse spacing and the ratio is <i>k</i> —
      which was what we were solving for, so it closes on itself and says the
      constant is <b style={{ color: INK }}>the ceiling mass in Planck
        masses</b>.
    </Step>

    <Because>and that ratio is the gravitational constant, for a reason about units</Because>
    <Step eq={<>
      <K>G</K> = 1
      <span style={{ padding: '0 0.6em', color: FAINT }}>in Planck units, so</span>
      <K>G</K><Sub>lattice</Sub> = <V>µ</V>/<V>m</V><Sub>P</Sub>
    </>}>
      Planck’s units are the ones built out of <V>c</V>, ħ and <V>G</V>
      themselves, with no object anywhere in them, and in them <V>G</V> is
      exactly one. The lattice already shares two of the three — its step is{' '}
      <V>l</V><Sub>P</Sub> and its tick is <V>t</V><Sub>P</Sub> — and <V>G</V>{' '}
      has units of length³/(time²·mass), so with the length and the time already
      Planck’s,{' '}
      <b style={{ color: INK }}>the only thing left that can move <V>G</V>’s
        number is the mass unit</b>, and it moves it in direct proportion.
      Hence <V>k</V> = <K>G</K> exactly, with nothing to compute.
    </Step>

    <Because>so</Because>
    <Step eq={<>
      <V><Bar>m</Bar></V>.period · <K><Bar>c</Bar></K> = <K>G</K> ·
      <D><V>λ</V><Sub>Compton</Sub></D>
      <span style={{ padding: '0 1em', color: FAINT }}>
        <K>G</K> = {gravitational().toFixed(6)}
      </span>
    </>}>
      Read as a picture: <b style={{ color: INK }}>1/<K>G</K> ≈ 16 is how many
        pulses the heaviest emitter fits inside its own Compton
        wavelength</b> — one step between pulses, sixteen steps of wavelength.
      And it holds at every mass for free, because halving the mass doubles the
      spacing and doubles the wavelength together. Checked at four masses over
      twenty-five orders — electron, proton, iron atom, a milligram grain — the
      ratio is {gravitational().toFixed(9)} at every one, to nine figures.
    </Step>

    <Because>which says what G is here, and it is not a strength</Because>
    <Step eq={<>
      <V>µ</V> = <K>G</K>·<V>m</V><Sub>P</Sub> ≈ <V>m</V><Sub>P</Sub>/16
    </>}>
      <b style={{ color: INK }}><K>G</K> ≠ 1 is the statement that the lattice’s
        natural mass is not nature’s natural mass.</b> Two definitions of a mass
      with no object in either: nature’s is where a mass’s quantum length ħ/<V>Mc</V>{' '}
      and its gravitational length <V>GM</V>/<V>c</V><Sup>2</Sup> cross; the
      lattice’s is the heaviest thing that can pulse once a tick. They disagree
      by sixteen, and <K>G</K> is the disagreement.
    </Step>

    <Because>what is derived here and what is one calibration — said plainly</Because>
    <Step eq={<>
      tick = <V>k</V>·<V>t</V><Sub>P</Sub>
      <span style={{ padding: '0 0.8em', color: FAINT }}>⇒ the constant is</span>
      <V>k</V><Sup>2</Sup>·<K>G</K>
    </>}>
      The lattice has three units — a step, a tick and a mass — and two things
      already relate them: <K><Bar>c</Bar></K> = one step a tick, and the counted{' '}
      <K>G</K>. That leaves exactly <i>one</i> scale free. Leave it free and
      watch: with the tick at <V>k</V> Planck times the step is <V>k</V>{' '}
      <V>l</V><Sub>P</Sub> and the mass unit is <V>k</V><K>G</K><V>m</V><Sub>P</Sub>,
      so the constant above comes out at <V>k</V><Sup>2</Sup><K>G</K> — and
      demanding it be <K>G</K> is exactly <V>k</V> = 1.{' '}
      <b style={{ color: INK }}>So “the tick is the Planck time” and “the pulse
        spacing is <K>G</K> Compton wavelengths” are one statement, not two
        agreeing ones.</b> One condition, one free scale, spent.
    </Step>

    <Step>
      <b style={{ color: INK }}>The shape is derived and the value is one
        calibration</b>, and they should not be quoted as two results. What the
      twenty-five orders check is the shape — that the ratio does not drift with
      mass — and nothing was free to arrange that. What would turn the value into
      a prediction is anything that weighs the ceiling on its own terms.{' '}
      <b style={{ color: BORROWED }}>Nothing does.</b>
    </Step>

    <Because>and which way round it goes, which is the surprise</Because>
    <Step>
      <b style={{ color: INK }}>The identity was put here to make the
        equivalence principle fall out of counting</b> — a heavier thing brings
      proportionally more paths to a meeting, so the mass divides back out and
      everything falls the same way — <b style={{ color: INK }}>and it turns out
        to have been a quantum statement the whole time.</b> The lattice is not a
      classical model waiting to have quantum mechanics added: mass being a rate{' '}
      <i>is</i> <V>E</V> = ħ<V>ω</V>, and it was there from the first line.
    </Step>
  </>,
};

export const IGNORANCE: Derivation = {
  label: 'the matter wave',
  title: <>λ = <V>h</V>/<V>p</V>, twice — by ignorance, and then by zigzag</>,
  body: <>
    <Because>a moving source has two retarded branches, and one of them is yours</Because>
    <Step eq={<>
      <V>t</V><Sub>r</Sub> = <Frac over={<><V>t</V> − <V>x</V>/<V>c</V></>} under={<>1 − <V>β</V></>} />
      <span style={{ padding: '0 1.2em', color: FAINT }}>ahead</span>
      <V>t</V><Sub>r</Sub> = <Frac over={<><V>t</V> + <V>x</V>/<V>c</V></>} under={<>1 + <V>β</V></>} />
      <span style={{ padding: '0 1.2em', color: FAINT }}>behind</span>
    </>}>
      A source pulses at its own rate ω, which <i>is</i> its mass, and a place
      carries the phase the source had when the shell left. Moving, that has
      two branches — blue ahead, red behind — and exactly one is true of you.
      Nothing is superposed: a point receives one shell, from one side, at a
      time. Solve the retarded equation at any x and only one branch ever comes
      back consistent.
    </Step>

    <Because>so weight them by how likely you are to be on each side</Because>
    <Step eq={<>
      <V>φ</V> = <V>ω</V><V>γ</V>[ (1 − <V>β</V> + 2<V>pβ</V>)<V>t</V> +
      (1 − <V>β</V> − 2<V>p</V>)<V>x</V>/<V>c</V> ]
    </>}>
      Know how fast the thing is going but not <i>where</i>, and you do not
      know which branch applies. Weight them <V>p</V> and 1 − <V>p</V> — that
      is <i>expected</i> in <i>field.ts</i>, and <V>p</V> is a parameter, not a
      constant, so the ignorance is tunable.
    </Step>

    <Because>and at a half it is de Broglie, exactly</Because>
    <Step eq={<>
      <V>φ</V> = <V>ω</V><V>γ</V>(<V>t</V> − <V>vx</V>/<V>c</V><Sup>2</Sup>)
      <span style={{ padding: '0 1.2em', color: FAINT }}>at <V>p</V> = ½</span>
      <V>λ</V> = <V>λ</V><Sub>C</Sub>/<V>γβ</V> = <V>h</V>/<V>p</V>
    </>}>
      Measured to nine figures at every β and every x. The phase speed is{' '}
      <V>c</V><Sup>2</Sup>/<V>v</V>, which is de Broglie’s and is allowed to
      beat light because it carries nothing. And the half-<i>difference</i> is{' '}
      <V>ω</V><V>γ</V>(<V>βt</V> − <V>x</V>/<V>c</V>) — the Compton
      oscillation at <V>λ</V><Sub>C</Sub>/<V>γ</V>, with its zero at{' '}
      <V>x</V> = <V>vt</V>, travelling <i>with</i> the thing.{' '}
      <b style={{ color: INK }}>The mean is the wave and the difference is the
        particle.</b>
    </Step>

    <Because>the half is doing real work — this is a test, not a detail</Because>
    <Step eq={<>
      <V>k</V> = <V>ω</V><V>γ</V>(2<V>p</V> − 1 + <V>β</V>)/<V>c</V>
    </>}>
      At <V>p</V> = 0.4 or 0.6 the wavelength is 20–40% off <V>h</V>/<V>p</V>.
      At <V>p</V> = (1 − <V>β</V>)/2 the wavenumber is <i>zero</i> — no x in
      the phase at all, a bare oscillation with no wavelength — and past that
      it changes sign and the wave runs backwards. So this is not a dial with
      de Broglie somewhere on it: there is a zero, a sign change, and one point
      that gives <V>h</V>/<V>p</V>.
    </Step>

    <Because>and a half is what it has to be, for a reason that is not about radiation</Because>
    <Step>
      Relativistic beaming puts (1+<V>β</V>)/2 of a moving source’s output into
      the forward hemisphere, which would give exactly <i>half</i> the de
      Broglie wavelength — measured, at every β. But beaming is the wrong
      quantity.{' '}
      <b style={{ color: INK }}>What is weighted is not how much goes each way,
        it is how likely you are to be on one side rather than the other</b> —
      a fact about not knowing the source’s <i>position</i>, not about its
      radiation pattern. A position you know nothing about is equally likely
      either side of you.
    </Step>

    <Because>and it is the fields that average, not just the phases</Because>
    <Step eq={<>
      ½(cos <V>φ</V><Sub>A</Sub> + cos <V>φ</V><Sub>B</Sub>) =
      cos <V>φ</V><Sub>dB</Sub> · cos <V>φ</V><Sub>C</Sub>
    </>}>
      An identity, to 6·10<Sup>−15</Sup> — so nothing had to be chosen about{' '}
      <i>which object</i> to average, and the de Broglie wave comes out as a
      factor of the mean field rather than as an interpretation of it. Off a
      half it stops factorising at all.{' '}
      <b style={{ color: INK }}>One number puts the wavelength at <V>h</V>/<V>p</V>{' '}
        and makes the field split into de Broglie times Compton — the same
        number, both jobs.</b>
    </Step>

    <Because>so does the lattice itself average? — three tries</Because>
    <Step eq={<span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.8em' }}>
      scatter → phase speed c, not c²/v
    </span>}>
      <b>Scatter</b> turns the backward emission round, so the red phase does
      reach a point that is ahead — but it then travels <i>+x</i>, so its{' '}
      <V>k</V> adds where the behind-branch’s subtracts. Mean{' '}
      <V>k</V> = <V>ω</V><Sub>0</Sub><V>γ</V>/<V>c</V>, phase speed exactly{' '}
      <V>c</V>. A light wave, not de Broglie. To get <V>k</V><Sub>B</Sub> the
      red phase must <i>arrive from ahead</i>, which needs the backward
      emission to have overtaken the source.
    </Step>

    <Step eq={<>
      <V>φ</V><Sub>i</Sub> = <V>ω</V><Sub>0</Sub>(<V>t</V>/<V>γ</V> −
      <V>vξ</V><Sub>i</Sub>/<V>c</V><Sup>2</Sup>)
    </>}>
      <b>A composite source</b> is the promising one, because a body above
      1.36 µg is many emitters and a receiver really <i>is</i> ahead of some and
      behind others — a physical average, not an epistemic one. Which pushes
      the question to what sets the constituents’ phases, and there it is sharp:
      measured as the phase gradient across the body,{' '}
      <b style={{ color: INK }}>in step in the body’s frame gives{' '}
        <V>k</V> = 5.7735·10<Sup>−3</Sup>, exactly λ<Sub>dB</Sub>; in step in
        the lattice’s frame gives <V>k</V> = 0 and no wave at all.</b>
    </Step>

    <Because>so the obstruction is one specific thing: the global tick</Because>
    <Step>
      <V>ω</V><V>γ</V>(<V>t</V> − <V>vx</V>/<V>c</V><Sup>2</Sup>) is{' '}
      <V>ω</V> times the source’s proper time at the event simultaneous with{' '}
      (<V>t</V>,<V>x</V>) <i>in its own rest frame</i>. Averaging the branches
      reconstructs rest-frame simultaneity; rest-frame synchrony assumes it.
      They agree to every digit because they are one statement — and{' '}
      <i>tick()</i> advancing everything at once is exactly its denial.{' '}
      <b style={{ color: INK }}>For de Broglie to be derived, a composite body
        must be in step with itself in its own frame</b> — a per-body
      simultaneity, not a global one. That is a statement about what the update
      rule would have to be, and it can be tried. It is also uncomfortable,
      because the global tick is most of how this model stays simple.
    </Step>

    <Because>so make it a dial rather than a choice</Because>
    <Step eq={<>
      ahead = (1 − <V>β</V>(1 − sync))/2
      <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
      <V>k</V> = sync · <V>ωγβ</V>/<V>c</V>
    </>}>
      The two conventions are not two models — they are two values of the same
      weight, and everything between them is defined.{' '}
      <b style={{ color: INK }}>sync = 0 is the global tick and has no matter
        wave at all; sync = 1 is de Broglie</b>, and <V>k</V> is exactly linear
      in between with nothing discontinuous. So the model can be <i>asked</i>{' '}
      for the other theory instead of having to pick one — <i>relax</i>,{' '}
      <i>synced</i> and <i>wave</i> in <i>field.ts</i>.
    </Step>

    <Because>and the dial is the classical limit</Because>
    <Step>
      <i>sync</i> is how much of a body is in step with <i>itself</i> in its{' '}
      <i>own</i> frame. A lone elementary emitter is trivially in step with
      itself, so sync = 1 and it carries a full de Broglie wave; a body of
      10<Sup>57</Sup> emitters updated by one global tick is in step in the{' '}
      <i>lattice’s</i> frame, so its internal gradient is nought and sync → 0.{' '}
      <b style={{ color: INK }}>Small things are quantum and big things are
        not, and it falls out rather than being imposed.</b> A conjecture, and
      a testable one: it says λ = λ<Sub>dB</Sub>/sync should degrade with
      internal temperature and not only with mass. What sets sync from the
      constituent count is not derived — the dial exists so the question can be
      asked with numbers.
    </Step>

    <Because>and at sync = 1 the phase is the action, which is the whole point</Because>
    <Step eq={<>
      <V>φ</V> = <V>ωγ</V>(<V>t</V> − <V>vx</V>/<V>c</V><Sup>2</Sup>) =
      −(<b>p</b>·<b>x</b> − <V>Et</V>)/ħ
    </>}>
      To nine figures at every <V>β</V>, and along the worldline{' '}
      <V>x</V> = <V>vt</V> it collapses to <V>ω</V><V>τ</V> = −<V>mc</V><Sup>2</Sup>∫d<V>τ</V>/ħ,
      the relativistic free action.{' '}
      <b style={{ color: INK }}>Nothing put it there</b> — it is what{' '}
      mass = rate plus rest-frame simultaneity comes to.
    </Step>

    <Because>which makes ignorance of WHICH PATH the right next move</Because>
    <Step eq={<>Σ<Sub>paths</Sub> e<Sup>i<V>φ</V></Sup> = ∫𝒟<V>x</V> e<Sup>i<V>S</V>/ħ</Sup></>}>
      The two-slit test put openings and a screen in by hand, so what came out
      depended on the arrangement — and the arrangement is not the physics. Sum
      over <i>all</i> paths from A to B instead. Measured on the free
      propagator, arg(amplitude) − <V>k·X</V> converges to{' '}
      <b style={{ color: INK }}>0.7862, 0.7845, 0.7837 against π/4 = 0.7854</b>,
      with the amplitude going as √<V>X</V> — ratios 1.4141 and 1.4142 against
      √2. So the sum gives the straight-line action <i>plus</i> the Fresnel
      phase the free propagator is known to carry: stationary phase picks the
      classical path out of the ignorance, with nothing selecting it and no
      screen anywhere. Two slits are then a corollary, for any geometry.
    </Step>

    <Because>and the one thing still assumed — tried, and it fails</Because>
    <Step eq={<span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.8em' }}>
      k_eff = 0.016&nbsp;&nbsp;against&nbsp;&nbsp;k = 0.30
    </span>}>
      <b style={{ color: INK }}>Every path gets the same modulus.</b> Feynman
      postulates it, and <K>DEG</K> looked like the answer: every way out of a
      point equally available, one step a tick so path length ∝ time, hence all
      equal-time paths equally likely. Summed over every 8-neighbour path of 130
      steps, the phase does <i>not</i> track <V>k·x</V> — fitted
      <V>k</V><Sub>eff</Sub> is 5% of <V>k</V> — and |A| falls twenty-two orders
      across the span. Not a wave: the large-deviation tail of a random walk.
    </Step>

    <Because>and the diagnosis is the same mistake as the audit found</Because>
    <Step>
      Every charge here moves at exactly <V>c</V>, so every step is{' '}
      <i>lightlike</i> and every path has the same proper time — nought. A
      massive particle’s phase is −<V>mc</V><Sup>2</Sup>∫d<V>τ</V>/ħ, which
      along a lightlike path is nought too.{' '}
      <b style={{ color: INK }}>A charge’s path is not a particle’s path</b>,
      and <K>DEG</K> counts a charge’s options; the path integral needs the
      worldlines of the <i>emitter</i>, which moves at <V>v</V> &lt; <V>c</V>.
      Two independent things now point at one structural gap — the lattice has
      one kind of mover, and both quantum mechanics and the metric want
      statements about the other kind. So the ladder reads: mass = rate gives <V>E</V> = ħω; rest-frame
      simultaneity gives λ = <V>h</V>/<V>p</V> and makes the phase the action;
      ignorance over paths gives the propagator. Two things are owed — what
      sets sync, and why the modulus is flat — and the second now has a shape:
      it needs the emitter’s options counted, not the charge’s.
    </Step>

    <Because>and counting them properly retires most of this panel</Because>
    <Step eq={<>cos <V>Ω</V> = cos <V>m</V> · cos <V>k</V></>}>
      One action a tick: move, or update your own state. Light spends all of it
      moving, which is why it has no clock.{' '}
      <b style={{ color: INK }}>But <i>idling</i> the spare ticks gives
        (1 − <V>β</V>) where relativity wants √(1−<V>β</V><Sup>2</Sup>)</b> —
      one Doppler factor with the other dropped, and not even symmetric under{' '}
      <V>β</V> → −<V>β</V>, so a left-mover would age at 1.5 and a right-mover
      at 0.5. Spend it on <i>direction</i> instead — move every tick, always at{' '}
      <V>c</V>, and let the heading alternate — and the missing (1+<V>β</V>) is
      carried by the backward steps. That rule is local, uses one global tick,
      and its transfer matrix gives the dispersion above exactly.
    </Step>

    <Because>from which everything comes out</Because>
    <Step eq={<><V>Ω</V><Sup>2</Sup> = <V>k</V><Sup>2</Sup> + <V>m</V><Sup>2</Sup></>}>
      To six figures. And then <V>k</V> <i>is</i> <V>mγv</V>, <V>Ω</V> <i>is</i>{' '}
      <V>mγ</V>, λ <i>is</i> λ<Sub>dB</Sub>, and the internal rate{' '}
      <V>Ω</V> − <V>k·v</V> is <V>m</V>/<V>γ</V> — so{' '}
      <b style={{ color: INK }}>time dilation falls out</b>. The reversal
      spacing is 1/tan <V>m</V> + 1 → 1/<V>m</V>, which is <V>X</V>: mass as a
      pulse rate and mass as a zigzag rate are one quantity, and{' '}
      <i>physics.ts</i> already had it.
    </Step>

    <Because>and the modulus is no longer a postulate</Because>
    <Step eq={<>cos<Sup><V>N</V>−<V>R</V></Sup> <V>m</V> · sin<Sup><V>R</V></Sup> <V>m</V></>}>
      A path of <V>N</V> steps with <V>R</V> reversals weighs that — set
      entirely by how often it turns, which is set entirely by the mass. Feynman
      postulates a flat modulus; here it is derived, and cos<Sup>2</Sup> +
      sin<Sup>2</Sup> = 1 makes it unitary for free.{' '}
      <b style={{ color: INK }}>The amplitude rule is the pulse rate.</b>
    </Step>

    <Because>which retires a conclusion drawn above, and it should be said plainly</Because>
    <Step>
      The claim was that de Broglie needs per-body rest-frame simultaneity and
      that the global tick was the obstruction.{' '}
      <b style={{ color: INK }}>This derivation uses a global tick, is local,
        and gets λ<Sub>dB</Sub> anyway — so that claim is false as stated.</b>{' '}
      What was actually shown is narrower: a composite carrying <i>internal
        phases</i> needs rest-frame synchrony for those to add to a matter wave.
      The zigzag carries the phase in the amplitude over paths instead, and
      needs no simultaneity convention at all. The dial stays useful; it is no
      longer the account. Still owed: this is 1+1 dimensions, where the
      checkerboard is clean and where nobody has a satisfactory 3+1 version —
      so a spinor is what pays for it — see below.
    </Step>

    <Because>and in 3+1 it does work, at a stated cost</Because>
    <Step eq={<>
      <V>U</V>(<b>k</b>) = [cos <V>m</V> − <V>i</V> sin <V>m</V> <V>β</V>] ·
      Π<Sub>j</Sub>[cos <V>k</V><Sub>j</Sub> − <V>i</V> sin <V>k</V><Sub>j</Sub> <V>α</V><Sub>j</Sub>]
    </>}>
      Every step still at <V>c</V>; what chooses the heading is an internal
      state, which is a spinor, and the algebra fixes its size. It reduces to
      the 1+1 checkerboard exactly at <V>d</V> = 1, and in 3+1 gives{' '}
      <b style={{ color: INK }}><V>Ω</V><Sup>2</Sup> = |<b>k</b>|<Sup>2</Sup> +{' '}
        <V>m</V><Sup>2</Sup> to five figures</b>, trace real to machine
      precision. The cost is anisotropy at finite <V>k</V> — the <V>α</V><Sub>j</Sub>{' '}
      do not commute, so 0.94 on the diagonal against the axis at |<b>k</b>| = 1,
      growing as <V>k</V><Sup>2</Sup> and gone in the continuum. That is the
      same defect <K>FLOOR</K> already flags, reached from somewhere else
      entirely.
    </Step>

    <Because>and fractional dimensions do not survive it</Because>
    <Step eq={<>2<Sup>⌊(<V>d</V>+1)/2⌋</Sup> components</>}>
      <K>SHEET</K> and <K>DEG</K> are 3<Sup><V>d</V>−1</Sup> − 1 and
      3<Sup><V>d</V></Sup> − 1, perfectly happy at <V>d</V> = 2.5 (4.196 and
      14.588), and every counting argument would still run. But a Clifford
      algebra has no fractional representation — you cannot have 2.83
      anticommuting matrices.{' '}
      <b style={{ color: INK }}>The counts interpolate and the spinor does
        not</b>, so a fractional-dimension version would have a gravity and no
      fermions. Either the spinor is fundamental and <V>d</V> is an integer, or
      the counts are and four components at <V>d</V> = 3 has to be derived.
      Nothing here decides it. It does settle one thing negatively:{' '}
      <K>DEG</K>/<K>SHEET</K> is bounded below by 3 at <i>every</i> <V>d</V>,
      so no dimension — fractional or not — closes the 3.4034.
    </Step>
  </>,
};

export const MEETINGS: Derivation = {
  label: 'the meeting rate',
  title: <>the meeting rate <V>S</V><Sub>ab</Sub></>,
  body: <>
    <Because>what a source puts on a place</Because>
    <Step eq={<>
      chance(<V>m</V>,<V>r</V>) =
      <Frac over={<><V>m</V> · <K>SHEET</K></>} under={<>shell(<V>r</V>)</>} />
    </>}>
      A source lets go of <K>SHEET</K> charges per pulse and they spread over
      the shell they have grown to, so the chance any one cell holds one is
      that count over how much shell there is.{' '}
      <b style={{ color: INK }}>This is where the inverse square is</b> — a
      shell in three dimensions goes as <V>r</V><Sup>2</Sup>, and no distance
      law was ever written down. Send the waves out differently and the
      exponent changes with nothing else touched.
    </Step>

    <Because>two of them in the same cell</Because>
    <Step eq={<>
      chance(<V>m</V><Sub>a</Sub>, <V>x</V>) ·
      chance(<V>m</V><Sub>b</Sub>, <V>R</V> − <V>x</V>)
    </>}>
      Meeting means being in the same place — not travelling toward each other.
      Two shells sweeping through one another converge on the same cell from
      all angles, never neighbours and never pointed at each other, so the
      chance of a meeting is simply the chance both are there.
    </Step>

    <Because>along which line</Because>
    <Step>
      The one whose length is the distance between them, because that is the
      line annihilation shortens. This is load-bearing rather than convenient:
      integrating the same quantity over <i>space</i> gives{' '}
      <V>R</V><Sup>−1</Sup> instead of <V>R</V><Sup>−2</Sup> — measured. In one
      dimension the cores dominate and you get Newton; in three the bulk
      dominates and you do not.
    </Step>

    <Because>and the factors in front</Because>
    <Step eq={<>
      <V>S</V><Sub>ab</Sub> = <K>BITE</K> · share · screen ·
      <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub> · EMIT<Sup>2</Sup> · met(<V>R</V>)
    </>}>
      <K>BITE</K> = 1 is what the rule says one meeting costs. It used to be
      two — a point for each charge — and one is what makes creation and
      annihilation exact inverses: a ± pair is made by one point becoming the
      two a pair needs, and a meeting consumes exactly one creation’s worth. <i>share</i> is how much of what meets is opposite rather
      than alike, which is a half unless two sources keep time together.{' '}
      <i>screen</i> is what a third body standing in the way blocks, and it is
      a genuine prediction: Newton has no such term, and neither does
      relativity at this order.
    </Step>
  </>,
};

export const MET: Derivation = {
  label: 'met(R)',
  title: <>met(<V>R</V>)</>,
  body: <>
    <Because>what is being integrated</Because>
    <Step eq={<>
      met(<V>R</V>) = ∫<Sub>0</Sub><Sup><V>R</V></Sup>
      <Frac over={<>d<V>x</V></>}
        under={<>max(<V>x</V>,<V>c</V>)<Sup>2</Sup> ·
          max(<V>R</V>−<V>x</V>,<V>c</V>)<Sup>2</Sup></>} />
    </>}>
      The two densities multiplied together, summed along the line. The masses
      and EMIT come straight out of the integral, leaving only this. The{' '}
      <i>max</i> is there because a shell is never smaller than the cell its
      source sits in.
    </Step>

    <Because>the max makes it piecewise — so cut it in three</Because>
    <Step eq={<span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.8em' }}>
      a ●━━━━━━━━━━━━━━━━━━━━━━━● b<br />
      &nbsp;&nbsp;╰c╯╰──── middle ────╯╰c╯
    </span>}>
      Inside <V>c</V> of either body its own field is capped and flat. Between
      them, nothing is capped.
    </Step>

    <Because>the two cores</Because>
    <Step eq={<>
      ∫<Sub>0</Sub><Sup><V>c</V></Sup>
      <Frac over={<>d<V>x</V></>}
        under={<><V>c</V><Sup>2</Sup>(<V>R</V>−<V>x</V>)<Sup>2</Sup></>} />
      &nbsp;=&nbsp;
      <Frac over={<>1</>} under={<><V>c R</V>(<V>R</V> − <V>c</V>)</>} />
    </>}>
      Dense — <V>a</V>’s field at its highest anywhere — but only <V>c</V> long,
      and <V>b</V>’s field across it flat at 1/<V>R</V><Sup>2</Sup>. The far
      core is the same integral mirrored, contributing the same again.
    </Step>

    <Because>the middle, by partial fractions</Because>
    <Step eq={<>
      <Frac over={<>1</>}
        under={<><V>x</V><Sup>2</Sup>(<V>R</V>−<V>x</V>)<Sup>2</Sup></>} /> =
      <Frac over={<>2</>} under={<><V>R</V><Sup>3</Sup></>} />
      <Frac over={<>1</>} under={<V>x</V>} /> +
      <Frac over={<>1</>} under={<><V>R</V><Sup>2</Sup></>} />
      <Frac over={<>1</>} under={<><V>x</V><Sup>2</Sup></>} />
      &nbsp;+&nbsp; mirror
    </>}>
      Matching the <V>x</V><Sup>2</Sup> coefficient is what forces the{' '}
      2/<V>R</V><Sup>3</Sup>. Integrating from <V>c</V> to <V>R</V>−<V>c</V>,
      the 1/<V>x</V><Sup>2</Sup> terms give another core-like piece — and{' '}
      <b style={{ color: INK }}>the 1/<V>x</V> terms give a logarithm</b>.
    </Step>

    <Because>add the three regions</Because>
    <Step eq={<>
      <Frac over={<>2</>} under={<><V>cR</V>(<V>R</V>−<V>c</V>)</>} /> +
      <Frac over={<>2</>} under={<><V>R</V><Sup>2</Sup></>} />
      <Paren>
        <Frac over={<>1</>} under={<V>c</V>} /> −
        <Frac over={<>1</>} under={<><V>R</V>−<V>c</V></>} />
      </Paren> +
      <Frac over={<>4</>} under={<><V>R</V><Sup>3</Sup></>} />
      ln <Frac over={<><V>R</V>−<V>c</V></>} under={<V>c</V>} />
    </>}>
      Three terms. And then the first two collapse.
    </Step>

    <Because>over a common denominator, the (R − c) cancels</Because>
    <Step eq={<>
      <Frac over={<>2<V>R</V> + 2(<V>R</V>−2<V>c</V>)</>}
        under={<><V>cR</V><Sup>2</Sup>(<V>R</V>−<V>c</V>)</>} /> =
      <Frac over={<>4(<V>R</V>−<V>c</V>)</>}
        under={<><V>cR</V><Sup>2</Sup>(<V>R</V>−<V>c</V>)</>} /> =
      <Frac over={<>4</>} under={<><V>cR</V><Sup>2</Sup></>} />
    </>}>
      Which is the whole reason the expression is as short as it is.
    </Step>

    <Because>so</Because>
    <Step eq={<>
      met(<V>R</V>) = <Frac over={<>4</>} under={<><V>c R</V><Sup>2</Sup></>} />
      <Paren>
        1 + <Frac over={<V>c</V>} under={<V>R</V>} /> ln
        <Frac over={<><V>R</V>−<V>c</V></>} under={<V>c</V>} />
      </Paren>
    </>}>
      An inverse square times a bracket that goes to one. The 1/<V>c</V> is the
      cores — dense, but only <V>c</V> long. The logarithm is the middle —
      thin, but <V>R</V> long, accumulating equally per octave of distance,
      because that 1/<V>x</V> came from the <i>gradient</i> of each body’s
      field across the other’s near zone.
    </Step>

    <Because>checked</Because>
    <Step>
      Against brute-force numerical integration, at every separation and core
      size tried, to eight significant figures.
    </Step>
  </>,
};

export const CONSTANTS: Derivation = {
  label: 'BIAS and c',
  title: <><K>BIAS</K> and <V>c</V></>,
  body: <>
    <Because>BIAS</Because>
    <Step eq={<>
      <K>BIAS</K> = <Frac over={<K>LIGHT</K>} under={<K>DEG</K>} /> =
      <Frac over={<>1</>} under={<>26</>} />
    </>}>
      What one annihilation buys a path. <K>DEG</K> = 3<Sup>3</Sup> − 1 is how
      many ways out of a point there are — the alternatives the biased path did
      not take. Note this is <i>not</i> <K>SHEET</K>, which is how many charges
      a source emits in one pulse: a different question, and the same constant
      was doing both jobs until it was noticed.
    </Step>

    <Because>c</Because>
    <Step eq={<><V>c</V> = <K>HALF</K></>}>
      A source’s core — half a <i>lattice</i> step, because a shell is never
      smaller than the cell its source sits in. The law is stated in the
      lattice’s own units throughout: a step, a tick, half a step of core.{' '}
      <K>GRAIN</K> is not in it. That is the drawing’s scale, and it enters
      once, where a drawn separation is turned into steps.
    </Step>

    <Because>why the second one has to exist</Because>
    <Step>
      Because the bracket in met(<V>R</V>) depends on <V>c</V>/<V>R</V>, and
      that ratio was being read off the <i>drawing</i>. The article draws
      twenty-eight cells to the astronomical unit so that a wave is visible, so
      Mercury sat eight cells from the Sun and the correction came out at 16% —
      a picture’s zoom setting the force law. A lattice step is a length, not a
      pixel. If it is anything like a fundamental one, Sun and Mercury are an
      astronomical number of them apart and the bracket is{' '}
      1 + 10<Sup>−38</Sup>.
    </Step>
  </>,
};

export const TURNS: Derivation = {
  label: 'CYCLE',
  title: <>how long a turn takes, at any dimension</>,
  body: <>
    <Because>DEG and SHEET grow with the dimension, so why does this one not</Because>
    <Step eq={<>
      <K>DEG</K> = 3<Sup><V>d</V></Sup> − 1
      <span style={{ padding: '0 1em' }} />
      <K>SHEET</K> = 3<Sup><V>d</V>−1</Sup> − 1
      <span style={{ padding: '0 1em' }} />
      <K>CYCLE</K> = ?
    </>}>
      All three are the same formula — how many ways out of a point lie in a
      slice, which is 3<Sup><V>k</V></Sup> − 1 when the slice has <V>k</V>{' '}
      dimensions, because a direction lying in it is nought in every coordinate
      outside and free in the <V>k</V> inside. So the whole question is{' '}
      <b style={{ color: INK }}>how many dimensions the slice a turn sweeps
        has</b>, and nothing else.
    </Step>

    <Because>what actually turns is one vector</Because>
    <Step eq={<>sheet ⟷ <B>n̂</B></>}>
      A sheet is a hyperplane and a hyperplane is fixed by its normal, so the
      only thing a turn moves is the axis <B>n̂</B>. This is worth stating
      because from <V>d</V> = 4 up{' '}
      <b style={{ color: INK }}>a rotation need not act in a single plane</b> —
      but the extra components act on directions perpendicular to the one the
      axis travels in and leave the sheet exactly where it was, so they are not
      part of the turn. Nothing observable distinguishes them.
    </Step>

    <Because>and one vector coming round sweeps a plane</Because>
    <Step eq={<>
      <V>P</V> = span{'{'}<B>n̂</B>, <B>R n̂</B>{'}'}
      <span style={{ padding: '0 1.2em', color: FAINT }}>dim</span>
      <V>P</V> = 2
    </>}>
      The orbit of the axis is a great circle, and a great circle lies in a
      two-plane whether that plane sits in three dimensions or in three hundred.{' '}
      <b style={{ color: INK }}>That is where the dimension leaves</b>, and it
      leaves for a reason rather than by arithmetic accident: the thing being
      counted is two-dimensional.
    </Step>

    <Because>unless the space has no plane in it</Because>
    <Step eq={<>dim slice = min(<V>d</V>, 2)</>}>
      A line has no two-plane to turn in, so there is no rotation to count and
      what is left is the two states a line has — which is a{' '}
      <i>flip</i> rather than a turn, and is the other kind of source{' '}
      <i>physics.ts</i> already carries. So the slice is as close to a plane as
      the space allows, and that is the min.
    </Step>

    <Because>and eight is the most any plane holds, not just the axis-aligned ones</Because>
    <Step eq={<>
      <V>Λ</V> = <V>P</V> ∩ ℤ<Sup><V>d</V></Sup>
      <span style={{ padding: '0 1em' }} />
      <V>C</V> = <V>P</V> ∩ [−1,1]<Sup><V>d</V></Sup>
      <span style={{ padding: '0 1em' }} />
      <V>S</V> ∩ <V>P</V> = (<V>Λ</V> ∩ <V>C</V>) ∖ {'{'}0{'}'}
    </>}>
      Cut both the lattice and the cube with the plane: a rank-two lattice, and
      a symmetric convex polygon.{' '}
      <b style={{ color: INK }}>Every non-zero point of <V>Λ</V> ∩ <V>C</V> is
        on the boundary of <V>C</V></b> — its coordinates are integers in
      [−1,1], so they are −1, 0 or 1, and being non-zero one of them is ±1,
      which is the cube's own face. So the origin is the only lattice point
      strictly inside.
    </Step>

    <Step eq={<>
      square 8
      <span style={{ padding: '0 1em', color: FAINT }}>hexagon 6</span>
      <span style={{ padding: '0 0em', color: FAINT }}>diamond 4</span>
    </>}>
      A centrally symmetric convex lattice polygon with exactly one interior
      lattice point is one of <b style={{ color: INK }}>three</b>, up to a change
      of basis — and they carry 8, 6 and 4 points on the boundary. So there is{' '}
      <b style={{ color: INK }}>no fourth answer available at any dimension</b>:
      a larger <V>d</V> buys more planes, not bigger ones. The coordinate planes
      are the square everywhere, and the square is the only one of the three
      whose points are evenly spaced, which is what makes <K>SPIN</K> a constant
      angle rather than an average of unequal ones.
    </Step>

    <Because>measured, since a classification is easy to misremember</Because>
    <Step eq={<span style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: '0.8em' }}>
      d=2..6&nbsp;&nbsp;max 8&nbsp;&nbsp;sizes {'{'}4,6,8{'}'}&nbsp;&nbsp;45,051 planes at d=6
    </span>}>
      Every two-plane spanned by a pair of directions, enumerated and
      deduplicated by its Plücker coordinates. The maximum is 8 at every
      dimension, the sizes that occur are 4, 6 and 8 and nothing else at every
      dimension, and the coordinate plane holds 8 at every dimension. See{' '}
      <i>tests/turns.ts</i>.
    </Step>

    <Because>so</Because>
    <Step eq={<>
      <K>CYCLE</K> = 3<Sup>min(<V>d</V>, 2)</Sup> − 1
      <span style={{ padding: '0 1.2em', color: FAINT }}>= 2, 8, 8, 8, …</span>
    </>}>
      Two on a line and{' '}
      <b style={{ color: INK }}>eight at every dimension of two or more</b>,
      with <K>SPIN</K> = 2π/<K>CYCLE</K> = 45°. There is nothing between two
      neighbouring directions for the axis to move through, so an eighth of a
      turn is the finest re-pointing the lattice has — anything quicker is not a
      faster rotation but a coarser one — and eight of those steps is back where
      it started.
    </Step>
  </>,
};

export const FULL: Derivation = {
  label: 'the law in full',
  title: 'the law in full',
  body: <>
    <Because>put the pieces together</Because>
    <Step eq={<>
      <Frac over={<>d<V>p</V></>} under={<>d<V>t</V></>} /> = <K>BIAS</K> ·
      <K>BITE</K> · share · <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub> ·
      EMIT<Sup>2</Sup> · met(<V>R</V>)
    </>}>
      Momentum gained is <K>BIAS</K> times the meetings, and the meetings are
      the two densities integrated along the line.{' '}
      <b style={{ color: INK }}>EMIT is squared because a meeting needs one
        charge from each body</b> — <K>SHEET</K> once for <V>a</V> and once for{' '}
      <V>b</V>, which is the same pairing that puts{' '}
      <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub> there. It is not a sheet squared.
    </Step>

    <Because>substitute met, with share = ½ and BITE = 1</Because>
    <Step eq={<>
      <Frac over={<>d<V>p</V></>} under={<>d<V>t</V></>} /> =
      <Frac over={<><K>SHEET</K><Sup>2</Sup></>}
        under={<>4<V>π</V><Sup>2</Sup><V>c</V> <K>DEG</K></>} /> ·
      <Frac over={<><V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub></>}
        under={<><V>R</V><Sup>2</Sup></>} />
      <Paren>1 + <Frac over={<V>c</V>} under={<V>R</V>} /> ln
        <Frac over={<><V>R</V>−<V>c</V></>} under={<V>c</V>} /></Paren>
    </>}>
      The 4 from met, the <K>BITE</K> and the ½ from <i>share</i> fold
      into the (4<V>π</V>)<Sup>2</Sup> in EMIT<Sup>2</Sup>, and everything left
      standing is a count.
    </Step>

    <Because>which is a gravitational constant</Because>
    <Step eq={<>
      <V>G</V> = <Frac over={<><K>SHEET</K><Sup>2</Sup></>}
        under={<>4<V>π</V><Sup>2</Sup><V>c</V> <K>DEG</K></>} />
    </>}>
      Not measured off a run and not fitted — the far limit of met, in closed
      form, out of charges per pulse, ways out of a point, and the size of a
      source’s own cell.
    </Step>

    <Because>and so</Because>
    <Step>
      <b style={{ color: INK }}>Newton, times a bracket that goes to one.</b>{' '}
      The whole of the model’s departure from Newton AT A DISTANCE is that
      bracket, and its size is the ratio of a source’s core to the separation —
      which at the grain a real lattice would have is 1 + 10<Sup>−38</Sup>, and
      could not move a perihelion if it tried.
    </Step>

    <Because>so where does relativity come from</Because>
    <Step>
      Not from that bracket, and not from anything short-range. It comes from
      the two places the count is read. Read as a <i>direction</i>, on the
      body’s own worldline, it gives special relativity’s response and one
      sixth of Mercury. Read as a <i>size</i> — <K>DEG</K> + <V>n</V> ways out
      of a point rather than <K>DEG</K> — it gives the spatial part of a
      metric, and with it the other five sixths and the whole of light’s
      deflection. Same annihilations, same constant, counted twice.
    </Step>
  </>,
};

// —— the law —————————————————————————————————————————————————————————————
