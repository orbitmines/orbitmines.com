import { Fragment, ReactNode, useEffect, useRef, useState } from "react";

import { GRAIN } from "./gravity";
import { Echoes } from "./echoes";
import { Apart, Discs, HighRedshift, HighZDiscs, Rotation, Split } from "./rotation";
import { Overlay, Routes, Seam, Shadows } from "./shadow";

/**
 * The law, on the page — and behind each equation, where it came from.
 *
 * It is also in the headers of `gravity.ts` and `metric.tsx`, and the reason it
 * is here as well is that a reader of the article is not a reader of the
 * source. `GRAIN` is read from `gravity.ts` rather than restated, so there is
 * no second copy of a number to drift.
 *
 * Set rather than drawn: there is no maths library in this repository and the
 * article has a PDF path, so the notation is built out of flex boxes and a
 * border for the rule. Which is enough — a fraction is a numerator over a
 * denominator with a line between. Variables lean, the lattice's own counts
 * stand upright and are coloured, so a reader can see at a glance which
 * symbols are quantities and which are the model's constants.
 *
 * EVERY DERIVED EQUATION OPENS. Which is the point of the section: a model
 * whose constants are all counts and a model with six fitted parameters look
 * identical once they are drawn, and the only way to tell them apart is to be
 * able to ask any line where it came from and get an answer.
 *
 * THE NUMBERS ON THIS PAGE ARE MEASURED and every one of them is reproducible
 * from `models.ts` — the sixths, the deflection, the a and e of each orbit.
 * They are quoted here rather than computed here, which is a second copy and
 * therefore a thing that can drift; `GRAIN` is imported instead, and the rest
 * would be too if the panels were cheap enough to run at render.
 *
 * WHAT CHANGED, since a reader who saw this page before will notice. It used
 * to end by owning up: a sixth of Mercury's perihelion, half of light's
 * deflection, and the missing part named as a spatial metric "this keeps one
 * number per place, and cannot say it". That was wrong twice over. The one
 * sixth was the FORCE LAW's, not A's — A alone, taken as a metric, gives four
 * sixths — and one number per place says it perfectly well, because the
 * spatial part at this order is a scalar. What was missing was not a second
 * field but the second READING of the count already being taken. See `METRIC`.
 */

const INK = '#c6c9d4';
const DIM = '#8a8d99';
const FAINT = '#6c7080';
const RULE = '#1c1e27';
const NAMED = '#e0a878';        // a count the lattice fixes
const DERIVED = '#7fb8d4';      // something that came out
const BORROWED = '#b58a8a';     // something taken from general relativity

const SERIF = 'Georgia, "Times New Roman", serif';

// —— notation ————————————————————————————————————————————————————————————

/** A quantity. Leans, as a variable should. */
const V = ({ children }: { children: ReactNode }) => (
  <span style={{ fontStyle: 'italic' }}>{children}</span>
);

/** One of the lattice's own counts. Upright, and coloured. */
const K = ({ children }: { children: ReactNode }) => (
  <span style={{ color: NAMED, fontStyle: 'normal' }}>{children}</span>
);

/** A vector. Upright and bold, the way a vector is set. */
const B = ({ children }: { children: ReactNode }) => (
  <span style={{ fontWeight: 700, fontStyle: 'normal' }}>{children}</span>
);

const Sub = ({ children }: { children: ReactNode }) => (
  <sub style={{ fontSize: '0.72em', fontStyle: 'italic' }}>{children}</sub>
);

const Sup = ({ children }: { children: ReactNode }) => (
  <sup style={{ fontSize: '0.72em' }}>{children}</sup>
);

/** A fraction, which is the only thing here that needs building. */
const Frac = ({ over, under }: { over: ReactNode, under: ReactNode }) => (
  <span style={{
    display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
    verticalAlign: 'middle', margin: '0 0.35em', lineHeight: 1.25,
  }}>
    <span style={{ padding: '0 0.4em' }}>{over}</span>
    <span style={{
      borderTop: '1px solid currentColor', padding: '0.12em 0.4em 0',
      marginTop: '0.12em', width: '100%', textAlign: 'center',
    }}>{under}</span>
  </span>
);

/**
 * Brackets big enough for what is inside them.
 *
 * By making the GLYPH bigger, not by stretching one. `scaleY` on a parenthesis
 * smears a small bracket's stroke weight upward — thin at the ends, heavy in
 * the middle, baseline in the wrong place. A larger glyph scales its strokes
 * along with its height, which is what a bigger bracket IS. Centred by flex so
 * it sits on the middle of whatever it contains, however tall that is.
 */
const Paren = ({ children }: { children: ReactNode }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
    <span style={{ fontSize: '2.2em', lineHeight: 0.72, fontStyle: 'normal', fontWeight: 300 }}>(</span>
    <span style={{ padding: '0 0.12em' }}>{children}</span>
    <span style={{ fontSize: '2.2em', lineHeight: 0.72, fontStyle: 'normal', fontWeight: 300 }}>)</span>
  </span>
);

/** A hat, for a direction. */
const Hat = ({ children }: { children: ReactNode }) => (
  <span style={{ position: 'relative', display: 'inline-block', fontStyle: 'italic' }}>
    <span style={{
      position: 'absolute', left: 0, right: 0, top: '-0.62em',
      textAlign: 'center', fontSize: '0.85em', fontStyle: 'normal',
    }}>^</span>
    {children}
  </span>
);

const Note = ({ children }: { children: ReactNode }) => (
  <div style={{ color: DIM, fontSize: '0.88em', lineHeight: 1.6, paddingTop: '0.5em' }}>
    {children}
  </div>
);

// —— the derivations, and the panel they open in —————————————————————————

type Derivation = { title: ReactNode; label: string; body: ReactNode };

/** A step of working: the line, then why. */
const Step = ({ eq, children }: { eq?: ReactNode, children: ReactNode }) => (
  <div style={{ padding: '0 0 1.4em' }}>
    {eq ? <div style={{
      fontFamily: SERIF, fontSize: '1.05em', color: INK,
      overflowX: 'auto', padding: '0.3em 0 0.6em',
    }}><div style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{eq}</div></div> : null}
    <div style={{ color: DIM, fontSize: '0.87em', lineHeight: 1.62 }}>{children}</div>
  </div>
);

const Because = ({ children }: { children: ReactNode }) => (
  <div style={{
    color: FAINT, fontSize: '0.68em', letterSpacing: '0.09em',
    textTransform: 'uppercase', padding: '0.6em 0 0.5em',
  }}>{children}</div>
);

/**
 * The panel itself.
 *
 * Dismissed three ways, because a thing that covers half the screen has to be
 * easy to be rid of: the backdrop, Escape, and a control that says so. Focus
 * moves into it on open and back to whatever opened it on close, so a reader
 * who arrived by keyboard is not stranded at the top of the document.
 */
const Panel = ({ of, onClose }: { of: Derivation, onClose: () => void }) => {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };

    document.addEventListener('keydown', key);
    panel.current?.focus();

    return () => document.removeEventListener('keydown', key);
  }, [onClose]);

  return <>
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        background: 'rgba(4,5,9,0.6)',
      }}
    />
    <div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label={`Where ${of.label} comes from`}
      tabIndex={-1}
      className="law-panel"
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 61,
        width: 'min(38rem, 94vw)', overflowY: 'auto', outline: 'none',
        background: '#080910', borderLeft: `1px solid ${RULE}`,
        boxShadow: '-24px 0 60px rgba(0,0,0,0.5)',
        padding: '2.2rem 2rem 4rem',
      }}
    >
      <style>{`
        .law-panel { animation: lawIn 180ms ease-out }
        @keyframes lawIn { from { transform: translateX(2rem); opacity: 0 } }
        @media (prefers-reduced-motion: reduce) {
          .law-panel { animation: none }
        }
      `}</style>

      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: '1rem', paddingBottom: '1.4rem', borderBottom: `1px solid ${RULE}`,
        marginBottom: '1.6rem',
      }}>
        <div>
          <div style={{
            color: FAINT, fontSize: '0.68em', letterSpacing: '0.09em',
            textTransform: 'uppercase',
          }}>where it comes from</div>
          <div style={{
            fontFamily: SERIF, fontSize: '1.35em', color: INK, paddingTop: '0.25em',
          }}>{of.title}</div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            background: 'none', border: `1px solid ${RULE}`, borderRadius: 2,
            color: DIM, cursor: 'pointer', fontSize: '0.75em',
            padding: '0.35em 0.7em', flexShrink: 0,
          }}
        >esc</button>
      </div>

      {of.body}
    </div>
  </>;
};

/**
 * A displayed equation. Clickable when there is working behind it, and looking
 * clickable — a derived line and a stated one must not be the same object.
 */
const Eq = (
  { children, note, derive, open }:
    { children: ReactNode, note?: ReactNode, derive?: Derivation, open?: (d: Derivation) => void },
) => {
  const inner = <>
    <div style={{
      overflowX: 'auto', textAlign: 'center', color: INK,
      fontFamily: SERIF, fontSize: '1.18em', padding: '0.2em 0',
    }}>
      <div style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{children}</div>
    </div>
    {note ? <div style={{
      textAlign: 'center', color: FAINT, fontSize: '0.72em',
      letterSpacing: '0.04em', paddingTop: '0.5em',
    }}>{note}</div> : null}
  </>;

  if (!derive || !open) return <div style={{ margin: '1.5em 0' }}>{inner}</div>;

  return (
    <button
      onClick={() => open(derive)}
      style={{
        display: 'block', width: '100%', margin: '1.5em 0',
        background: 'none', border: '1px solid transparent', borderRadius: 3,
        padding: '0.9em 0.5em 0.7em', cursor: 'pointer', font: 'inherit',
        color: 'inherit', textAlign: 'inherit', position: 'relative',
        transition: 'background 120ms, border-color 120ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(127,184,212,0.05)';
        e.currentTarget.style.borderColor = RULE;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'none';
        e.currentTarget.style.borderColor = 'transparent';
      }}
      onFocus={e => { e.currentTarget.style.borderColor = DERIVED; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; }}
    >
      {inner}
      <span style={{
        position: 'absolute', right: '0.7em', top: '0.45em',
        color: DERIVED, fontSize: '0.6em', letterSpacing: '0.1em',
        textTransform: 'uppercase', opacity: 0.75,
      }}>derived ›</span>
    </button>
  );
};

const Head = ({ children }: { children: ReactNode }) => (
  <div style={{
    color: FAINT, fontSize: '0.7em', letterSpacing: '0.09em',
    textTransform: 'uppercase', padding: '2.2em 0 0.1em',
    borderTop: `1px solid ${RULE}`, marginTop: '2em',
  }}>{children}</div>
);

/** symbol → what it is, laid out so the symbols line up down the page. */
const Rows = ({ of }: { of: [ReactNode, ReactNode][] }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: 'minmax(6.5em, max-content) 1fr',
    gap: '0.75em 1.4em', alignItems: 'baseline', padding: '1em 0 0.2em',
  }}>
    {of.map(([sym, what], i) => <Fragment key={i}>
      <div style={{
        fontFamily: SERIF, fontSize: '1.02em', color: INK, whiteSpace: 'nowrap',
      }}>{sym}</div>
      <div style={{ color: DIM, fontSize: '0.86em', lineHeight: 1.55 }}>{what}</div>
    </Fragment>)}
  </div>
);

// —— what is behind each line ————————————————————————————————————————————

const LAW: Derivation = {
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
      <Frac over={<>1 + <V>n</V></>} under={<>1, and there are <K>WAYS</K> of them</>} />
    </>}>
      A path arriving there has more ways of going the way the annihilation
      went than of going any other. One makes it two to one, a second three to
      one, a third four — the direction accumulates weight one annihilation at
      a time, while every other way out of the point still weighs exactly what
      it always did. There are <K>WAYS</K> = 26 of those.
    </Step>

    <Step eq={<><K>BIAS</K> = <Frac over={<K>LIGHT</K>} under={<K>WAYS</K>} /></>}>
      So the net lean is <K>LIGHT</K>·<V>n</V>/<K>WAYS</K> — linear in the
      count, with no ceiling in it — and one annihilation is worth <K>BIAS</K>.
      This is the only constant in the dynamics, and it is a ratio of two
      counts.
    </Step>

    <Because>that is a ratio, and a ratio is not all of it</Because>
    <Step eq={<>
      <Frac over={<>1 + <V>n</V></>} under={<K>WAYS</K>} />
      &nbsp;the lean&nbsp;&nbsp;·&nbsp;&nbsp;
      <K>WAYS</K> + <V>n</V>&nbsp; the total
    </>}>
      The line above compares one direction against the others and throws away
      how many there are. But the ways out of that point no longer{' '}
      number <K>WAYS</K> — they number <K>WAYS</K> + <V>n</V>, and{' '}
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
      <K>LIGHT</K>·<V>n</V>/<K>WAYS</K> is cells per tick of <i>its</i> clock —
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

const METRIC: Derivation = {
  label: 'A and B',
  title: <>the count, read a second time</>,
  body: <>
    <Because>what the lean threw away</Because>
    <Step eq={<>
      <Frac over={<>1 + <V>n</V></>} under={<>1 each, <K>WAYS</K> of them</>} />
    </>}>
      <K>BIAS</K> compares the direction that took an annihilation against the
      others. Every other way out still weighs one — which is true, and is a{' '}
      <i>ratio</i>, and a ratio has no opinion about how many there are. That
      was the whole of the pull, and on its own it is worth exactly{' '}
      <b style={{ color: INK }}>one sixth</b> of Mercury’s perihelion advance
      and <b style={{ color: INK }}>none at all</b> of light’s deflection.
    </Step>

    <Because>the total, which is the other reading</Because>
    <Step eq={<><K>WAYS</K> + <V>n</V>&nbsp;&nbsp;ways out, not <K>WAYS</K></>}>
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

const SPACE: Derivation = {
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
      <Frac over={<><V>π</V> <K>WAYS</K> <V>c</V></>}
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

const MADE_FROM: Derivation = {
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
        under={<><V>π</V> <K>WAYS</K></>} /> = 0.2938
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
        under={<><K>SHEET</K><Sup>2</Sup>/4π<Sup>2</Sup><K>WAYS</K></>} /> =
      <Frac over={<>π<K>WAYS</K></>} under={<>3<K>SHEET</K></>} /> = 3.4034
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
      which is where <K>WAYS</K> enters. A lone body has no second field, and
      that is the shape of the 3.4034. But a lone body is not alone: its charges
      annihilate against the ambient <V>Φ</V>, restoring product, bias and{' '}
      <K>WAYS</K> at once. It gives 1/<V>r</V>, and matching{' '}
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
      not a dimension: they agree iff <K>WAYS</K>/<K>SHEET</K> = 3/π, which is
      irrational, while <K>WAYS</K>/<K>SHEET</K> is a ratio of integers tending
      to 3 from above.{' '}
      <b style={{ color: INK }}>So one of the two counts is being used for a job
        it is not the count for</b> — and they are not even the same kind of
      thing, <K>SHEET</K> being what a source emits and <K>WAYS</K> what a path
      could have done instead. That is the same mistake this file already made
      once, and recorded.
    </Step>
  </>,
};

const REACH: Derivation = {
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

const IDENTICAL: Derivation = {
  label: 'gravity between identical things',
  title: <>two of the same, closer than a wavelength</>,
  body: <>
    <Because>ω is not free any more</Because>
    <Step eq={<><V>ω</V> = <V>m</V>,&nbsp;&nbsp; one wavelength = 2π/<V>m</V> = 2π<V>G</V><V>λ</V><Sub>C</Sub></>}>
      Mass is how often a thing pulses, so the rate at which its charge
      reverses is the mass. It used to be set by <K>SLOW</K> in{' '}
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

const CLOCK: Derivation = {
  label: 'mass as a period',
  title: <>once a tick is the ceiling</>,
  body: <>
    <Because>mass is how often, so turn it round</Because>
    <Step eq={<><V>X</V> = 1/<V>m</V> ticks between pulses,&nbsp;&nbsp;<V>m</V> ≤ 1</>}>
      A heavier thing pulses more often, and nothing pulses more than once a
      tick. So mass is a <i>period</i>, and there is a largest elementary
      mass: the lattice mass unit is <V>G</V>·<V>m</V><Sub>Planck</Sub> ≈
      1.36 µg. Anything heavier has to be many emitters — which is what matter
      is.
    </Step>

    <Because>turn the period into a length</Because>
    <Step eq={<>
      <V>X</V>·<V>c</V> = <V>G</V> ·
      <Frac over={<>ħ</>} under={<><V>mc</V></>} /> = <V>G</V> · <V>λ</V><Sub>Compton</Sub>
    </>}>
      Exactly, at every mass. Measured across twenty orders — electron, proton,
      uranium atom, virus, grain of sand — the ratio is 0.062329 every time,
      against <V>G</V> = 0.062351.
    </Step>

    <Because>and it is not a coincidence</Because>
    <Step>
      <V>m</V><Sub>P</Sub>·<V>l</V><Sub>P</Sub> = ħ/<V>c</V>, so “period = 1/mass”
      in the lattice’s own units <i>is</i> the Compton relation.{' '}
      <b style={{ color: INK }}>The identity was put here to make the
        equivalence principle fall out of counting, and it turns out to have
        been a quantum statement the whole time.</b> The lattice is not a
      classical model waiting to have quantum mechanics added — <V>E</V> = ħω
      is a consequence of what it already means by mass.
    </Step>
  </>,
};

const IGNORANCE: Derivation = {
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
      postulates it, and <K>WAYS</K> looked like the answer: every way out of a
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
      and <K>WAYS</K> counts a charge’s options; the path integral needs the
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
      <K>SHEET</K> and <K>WAYS</K> are 3<Sup><V>d</V>−1</Sup> − 1 and
      3<Sup><V>d</V></Sup> − 1, perfectly happy at <V>d</V> = 2.5 (4.196 and
      14.588), and every counting argument would still run. But a Clifford
      algebra has no fractional representation — you cannot have 2.83
      anticommuting matrices.{' '}
      <b style={{ color: INK }}>The counts interpolate and the spinor does
        not</b>, so a fractional-dimension version would have a gravity and no
      fermions. Either the spinor is fundamental and <V>d</V> is an integer, or
      the counts are and four components at <V>d</V> = 3 has to be derived.
      Nothing here decides it. It does settle one thing negatively:{' '}
      <K>WAYS</K>/<K>SHEET</K> is bounded below by 3 at <i>every</i> <V>d</V>,
      so no dimension — fractional or not — closes the 3.4034.
    </Step>
  </>,
};

const MEETINGS: Derivation = {
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

const MET: Derivation = {
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

const CONSTANTS: Derivation = {
  label: 'BIAS and c',
  title: <><K>BIAS</K> and <V>c</V></>,
  body: <>
    <Because>BIAS</Because>
    <Step eq={<>
      <K>BIAS</K> = <Frac over={<K>LIGHT</K>} under={<K>WAYS</K>} /> =
      <Frac over={<>1</>} under={<>26</>} />
    </>}>
      What one annihilation buys a path. <K>WAYS</K> = 3<Sup>3</Sup> − 1 is how
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

const FULL: Derivation = {
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
      the two densities integrated along the line.
    </Step>

    <Because>substitute met, with share = ½ and BITE = 1</Because>
    <Step eq={<>
      <Frac over={<>d<V>p</V></>} under={<>d<V>t</V></>} /> =
      <Frac over={<><K>SHEET</K><Sup>2</Sup></>}
        under={<>4<V>π</V><Sup>2</Sup><V>c</V> <K>WAYS</K></>} /> ·
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
        under={<>4<V>π</V><Sup>2</Sup><V>c</V> <K>WAYS</K></>} />
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
      sixth of Mercury. Read as a <i>size</i> — <K>WAYS</K> + <V>n</V> ways out
      of a point rather than <K>WAYS</K> — it gives the spatial part of a
      metric, and with it the other five sixths and the whole of light’s
      deflection. Same annihilations, same constant, counted twice.
    </Step>
  </>,
};

// —— the law —————————————————————————————————————————————————————————————

export const Law = () => {
  const [open, setOpen] = useState<Derivation | null>(null);
  const from = useRef<HTMLElement | null>(null);

  const show = (d: Derivation) => {
    from.current = document.activeElement as HTMLElement;
    setOpen(d);
  };

  const hide = () => {
    setOpen(null);
    from.current?.focus();
  };

  return <div style={{ marginBottom: '3rem' }}>

    <div style={{
      color: FAINT, fontSize: '0.7em', letterSpacing: '0.09em',
      textTransform: 'uppercase', paddingBottom: '0.1em',
    }}>the law</div>

    <Note>
      One rule. Two charges arriving at the same point annihilate if they are
      opposite — both points go, and what was behind each is joined onto what
      was behind the other — and if they are alike they leave along each
      other’s headings. Nothing is pushed. There is simply less space between
      two things than there was, and everything below is what that comes to.{' '}
      <span style={{ color: DERIVED }}>
        Every equation marked <i>derived</i> opens its own working.
      </span>
    </Note>

    <Eq derive={LAW} open={show}
      note="the momentum a body gains is BIAS times the annihilations it took part in, and what one is worth depends on where it happened">
      <Frac over={<>d</>} under={<>d<V>t</V></>} />
      ( <V>γ</V> <V>m</V><Sub>a</Sub> <B>v</B><Sub>a</Sub> )
      &nbsp;=&nbsp; <K>BIAS</K> · <span style={{ fontSize: '1.3em' }}>Σ</span>
      <Sub>b ≠ a</Sub> &nbsp;<V>S</V><Sub>ab</Sub> <Hat>r</Hat><Sub>ab</Sub>
      &nbsp;· carry
    </Eq>

    <Eq derive={METRIC} open={show}
      note="the same count read as a size rather than a direction — which is a metric, and is the other five sixths">
      <V>A</V>(<V>s</V>) =
      <Paren><Frac over={<>1 − <V>s</V></>} under={<>1 + <V>s</V></>} /></Paren><Sup>2</Sup>
      <span style={{ padding: '0 1.4em' }} />
      <V>B</V>(<V>s</V>) = (1 + <V>s</V>)<Sup>4</Sup>
      <span style={{ padding: '0 1.4em' }} />
      <V>s</V> = <Frac over={<V>u</V>} under={<>2</>} />
    </Eq>

    <Eq derive={MEETINGS} open={show}>
      <V>S</V><Sub>ab</Sub> &nbsp;=&nbsp; <K>BITE</K> ·
      <Paren><Frac over={<K>SHEET</K>} under={<>4<V>π</V></>} /></Paren><Sup>2</Sup>
      · share · screen · <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub> ·
      met(<V>R</V>)
    </Eq>

    <Eq derive={MET} open={show} note="one inverse square, times one bracket that goes to one">
      met(<V>R</V>) &nbsp;=&nbsp;
      <Frac over={<>4</>} under={<><V>c R</V><Sup>2</Sup></>} />
      <Paren>
        1 &nbsp;+&nbsp; <Frac over={<V>c</V>} under={<V>R</V>} /> ln
        <Frac over={<><V>R</V> − <V>c</V></>} under={<V>c</V>} />
      </Paren>
    </Eq>

    <Eq derive={CONSTANTS} open={show}>
      <K>BIAS</K> = <Frac over={<K>LIGHT</K>} under={<K>WAYS</K>} /> =
      <Frac over={<>1</>} under={<>26</>} />
      <span style={{ padding: '0 1.6em' }} />
      <V>c</V> = <Frac over={<K>HALF</K>} under={<K>GRAIN</K>} />
    </Eq>

    <Head>what is put in</Head>
    <Note>Six countable facts about the lattice, and nothing else is assumed.</Note>

    <Rows of={[
      [<><K>WAYS</K> = 3<Sup>3</Sup> − 1 = 26</>,
        <>ways out of a point — the 3×3×3 block around it, minus itself</>],
      [<><K>SHEET</K> = 3<Sup>2</Sup> − 1 = 8</>,
        <>charges in one pulse: the plane a source emits into, which turns with it</>],
      [<><K>BITE</K> = 1</>,
        <>points an annihilation removes — one, so that making and unmaking
          a ± pair are exact inverses</>],
      [<><K>LIGHT</K> = 1</>,
        <>points per tick, and nothing goes faster</>],
      [<><K>HALF</K> = ½</>,
        <>a shell is never smaller than the cell its source sits in</>],
      [<V>m</V>,
        <>mass is how <i>often</i> a thing emits. Not a property it has.</>],
    ]} />

    <Head>what is derived</Head>
    <Note>
      None of this is stated. It is what those six come to, and it is the
      difference between a model and a fit.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>chance(<V>m</V>,<V>r</V>)</span>,
        <><b style={{ color: INK }}>The inverse square.</b> One pulse spread
          over the shell it has grown to — and a shell in three dimensions goes
          as <V>r</V><Sup>2</Sup>. No distance law was ever written down.</>],
      [<span style={{ color: DERIVED }}>met(<V>R</V>)</span>,
        <>The line between two bodies, integrated — and it collapses to an
          inverse square times a bracket. What the bracket adds is{' '}
          <V>c</V>/<V>R</V>, log-enhanced.</>],
      [<span style={{ color: DERIVED }}><V>G</V></span>,
        <>The far limit of met. Every symbol a count. Nothing fitted, and not
          measured off a run.</>],
      [<span style={{ color: DERIVED }}>
        <V>a</V><Sub>a</Sub> ∝ <V>m</V><Sub>b</Sub>/<V>R</V><Sup>2</Sup></span>,
      <><b style={{ color: INK }}>The equivalence principle.</b> What bends a
        body is the <i>fraction</i> of its paths that were biased, and its path
        count is its mass. The extra divides straight back out.</>],
      [<span style={{ color: DERIVED }}><V>u̇</V> ∝ <V>ṅ</V></span>,
        <>Gravity is an <i>acceleration</i> and not a speed, because what
          accumulates is the count and what drifts is a function of it.</>],
      [<span style={{ color: DERIVED }}>1/<V>γ</V><Sup>3</Sup>, 1/<V>γ</V></span>,
        <>Along the way a thing is going, and across it — special relativity’s
          own response, out of the count being a count on the body’s own
          worldline.</>],
      [<span style={{ color: DERIVED }}>
        one sixth of 6π<V>GM</V>/<V>c</V><Sup>2</Sup><V>a</V>(1−<V>e</V><Sup>2</Sup>)</span>,
      <><b style={{ color: INK }}>The perihelion advance, the part the pull
        owns.</b> The lean alone gives exactly one sixth, and gives it to a
        part in a hundred for every one of five orbits over two panels. This
        much is counted.</>],
      [<span style={{ color: DERIVED }}>screen</span>,
        <>Three bodies in a row do not simply add. Newton has no such term and
          neither does relativity at this order.</>],
      [<span style={{ color: DERIVED }}>
        <V>A</V> = <V>e</V><Sup>−2<V>u</V></Sup>,{' '}
        <V>B</V> = <V>e</V><Sup>+2<V>u</V></Sup></span>,
      <><b style={{ color: INK }}>The metric.</b> A folded node has more edges,
        edges point both ways, so it is easier to arrive at —{' '}
        d<V>u</V> = d<V>u</V><Sub>0</Sub>(1+<V>u</V>), which integrates to an
        exponential with nothing chosen. β = γ = 1 both fall out.</>],
      [<span style={{ color: DERIVED }}><i>carry</i></span>,
        <><b style={{ color: INK }}>The geodesic equation.</b> The reversal rate
          thins as 1/(<K>WAYS</K>+<V>n</V>), which is √<V>A</V> exactly — so the
          clock is the edge count — and stationary phase on ω<V>τ</V> then gives
          this function to 10<Sup>−7</Sup>.</>],
      [<span style={{ color: DERIVED }}>
        six sixths, and 4<V>GM</V>/<V>bc</V><Sup>2</Sup></span>,
      <><b style={{ color: INK }}>All of it.</b> 6.05, 6.08, 6.07, 6.11, 6.22
        sixths across the five orbits, measured through the model’s own
        dynamics rather than off the metric — and the ellipse comes back at
        −0.00% on every one.</>],
    ]} />

    <Head>what is borrowed</Head>

    <Note>
      <b style={{ color: INK }}>Nothing, now.</b> Kept as a section because the
      distinction is the whole state of the thing and because the last item to
      leave it did so recently enough to be worth showing.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}><i>carry</i></span>,
        <><b style={{ color: INK }}>No longer borrowed.</b> The checkerboard’s
          clock is the <i>reversal</i> rate, 1 in <K>WAYS</K> unfolded and 1 in{' '}
          <K>WAYS</K>+<V>n</V> folded — so{' '}
          <V>m</V><Sub>eff</Sub> = <V>m</V>/(1+<V>u</V>) = <V>m e</V><Sup>−<V>u</V><Sub>0</Sub></Sup>{' '}
          = <V>m</V>√<V>A</V>, identical to machine precision.{' '}
          <b style={{ color: INK }}>Gravitational time dilation is the edge
            count thinning out the reversals.</b> The phase is ω<V>τ</V>, so
          stationary phase extremises proper time — and that is this function,
          matching Euler–Lagrange to 10<Sup>−7</Sup> at every <V>u</V> and{' '}
          <V>p</V> tried.</>],
      [<span style={{ color: DERIVED }}>
        <V>A</V> = <V>e</V><Sup>−2<V>u</V></Sup>,{' '}
        <V>B</V> = <V>e</V><Sup>+2<V>u</V></Sup></span>,
      <><b style={{ color: INK }}>No longer borrowed.</b> A folded node has
        more edges, and edges point both ways, so it is easier to arrive at —
        d<V>u</V> = d<V>u</V><Sub>0</Sub>(1+<V>u</V>), which integrates to an
        exponential with nothing chosen. The lean gives <V>A</V>, the total
        gives <V>B</V>, <V>A·B</V> = 1, and β = γ = 1.</>],
      [<span style={{ color: DERIVED }}>
        the other five sixths, and 4<V>GM</V>/<V>bc</V><Sup>2</Sup></span>,
        <>Re-measured against the compounded metric:{' '}
          <b style={{ color: INK }}>6.05, 6.08, 6.07, 6.11, 6.22 sixths</b>{' '}
          across the five orbits, against 6.05…6.20 with the borrowed forms.
          The shift is +0.005 to +0.020, ordered by depth — the 2PN difference
          between <V>e</V><Sup>2<V>u</V></Sup> and (1+<V>u</V>/2)<Sup>4</Sup>,
          and nothing else. Light’s deflection is untouched, since it depends
          on γ alone.</>],
      [<span style={{ color: DERIVED }}>the checkerboard in a fold</span>,
        <>The last link, and it is now measured too. A folded node dilutes{' '}
          <i>every</i> edge by the same <V>e</V><Sup>−<V>u</V><Sub>0</Sub></Sup>,
          since it is one count in one denominator — so in cells{' '}
          <b style={{ color: INK }}>gravity is a position-dependent tick rate
            and nothing else</b>, <V>H</V> = <V>e</V><Sup>−<V>u</V><Sub>0</Sub></Sup>√(<V>m</V><Sup>2</Sup>+<V>p</V><Sup>2</Sup>),
          which is <V>A</V> and <V>B</V> both, out of the one number. Run as a
          lattice walk, a packet through a fold follows the classical path to{' '}
          <b style={{ color: INK }}>0.3 cells in a 44-cell bend</b>, and the
          residual halves each time the geometry doubles — the semiclassical
          1/λ, not a disagreement. <i>untested</i> is now empty as well.</>],
    ]} />

    <Head>so is that general relativity</Head>

    <Note>
      <b style={{ color: INK }}>No, and the difference is the interesting
        part.</b> Nothing is borrowed any more — <i>borrows</i> returns empty
      for this model’s own setting — but what came out is not Einstein’s metric.
      It is the exponential one, and the two agree exactly where general
      relativity has been tested and part company where it has not.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>where they agree</span>,
        <>β = γ = 1, so every first-post-Newtonian test is identical: the
          perihelion advance, light’s deflection, Shapiro delay, the Cassini
          bound on γ. <V>A</V> agrees to <V>O</V>(<V>u</V><Sup>3</Sup>) — the
          isotropic <V>A</V> <i>is</i> <V>e</V><Sup>−2<V>u</V>−<V>u</V>³/6</Sup>.</>],
      [<span style={{ color: BORROWED }}>where they differ</span>,
        <><V>B</V> parts company at <V>O</V>(<V>u</V><Sup>2</Sup>), which shows
          in the perihelion at <V>O</V>(<V>u</V>) — 10<Sup>−6</Sup> arcseconds
          a century at Mercury, and 0.13% to 0.56% in these panels, which run at
          exaggerated depth so the effect is visible at all.</>],
      [<span style={{ color: BORROWED }}>and where they part outright</span>,
        <><V>e</V><Sup>−2<V>u</V></Sup> never reaches nought, so{' '}
          <b style={{ color: INK }}>no horizons</b>; the shadow is{' '}
          <b style={{ color: INK }}>4.6% larger</b> at the same mass; and a
          neutron star shows about two thirds of its mass, which is outside any
          equation of state and is the one place the model is probably just
          wrong.</>],
    ]} />

    <Note>
      So the claim is not “general relativity, rederived”. It is:{' '}
      <b style={{ color: INK }}>a metric theory built from counting, agreeing
        with general relativity on everything general relativity has passed,
        and disagreeing where nobody has looked closely yet.</b> That is a
      better position than agreement would be, because it can be shot at — and
      the shadow is the shot to take.
    </Note>

    <Head>what is a choice</Head>

    <Rows of={[
      [<><K>GRAIN</K> = {GRAIN.toExponential(0)}</>,
        <>lattice steps a drawn cell stands for</>],
      [<>cells per AU</>, <>how large the picture is</>],
      [<>ticks per year</>, <>how fast it is played</>],
    ]} />

    <Note>
      Statements about the <i>picture</i>. Every physical ratio survives them,
      and none is free to change what the law says.
    </Note>

    <Head>and so, in full</Head>

    <Eq derive={FULL} open={show}
      note={<>the bracket is 1.08 at a core of half a lattice step and Mercury’s
        separation — and 1 + 10⁻³⁸ at the grain a real lattice would have</>}>
      <Frac over={<>d<V>p</V></>} under={<>d<V>t</V></>} /> &nbsp;=&nbsp;
      <V>G</V> ·
      <Frac over={<><V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub></>}
        under={<><V>R</V><Sup>2</Sup></>} />
      <Paren>
        1 &nbsp;+&nbsp; <Frac over={<V>c</V>} under={<V>R</V>} /> ln
        <Frac over={<><V>R</V> − <V>c</V></>} under={<V>c</V>} />
      </Paren>
      <Hat>r</Hat>
      <span style={{ padding: '0 1.4em' }} />
      <V>G</V> =
      <Frac over={<><K>SHEET</K><Sup>2</Sup></>}
        under={<>4<V>π</V><Sup>2</Sup> <V>c</V> <K>WAYS</K></>} />
    </Eq>

    <Note>
      <b style={{ color: INK }}>Newton, times a bracket that goes to one</b> —
      and a constant written entirely in counts. The whole of the model’s
      departure from Newton at a distance is that bracket, and its size is the
      ratio of a source’s core to the separation.
    </Note>

    <Note>
      The <V>γ</V> on the left is worth <b style={{ color: INK }}>+1.66°</b> of
      Mercury’s perihelion an orbit where 6π<V>GM</V>/<V>c</V><Sup>2</Sup>
      <V>a</V>(1−<V>e</V><Sup>2</Sup>) is{' '}
      <b style={{ color: INK }}>+9.93°</b> — the right sign, and{' '}
      <b style={{ color: INK }}>a sixth</b> of the size. Measured on Venus,
      Earth and Mars too, and on a second panel at a different scale, it is a
      sixth every time to a part in a hundred.
    </Note>

    <Note>
      That sixth is the count read as a <i>direction</i>. Read a second time as
      a <i>size</i> — the same annihilations saying how much space a point
      holds rather than which way it leans — the same orbit advances{' '}
      <b style={{ color: INK }}>+10.35°</b>, which is{' '}
      <b style={{ color: INK }}>6.20 sixths</b>, and a ray grazing the sun
      bends by the whole <V>4GM</V>/<V>bc</V><Sup>2</Sup> rather than half of
      it. Nothing is added to get it: <V>A</V> and <V>B</V> carry the same{' '}
      <V>u</V> with the same coefficient, which is the statement that a point’s
      lean and a point’s thickness are one event seen twice — and is the
      sharpest thing here to be wrong about, since it is what fixes{' '}
      <V>γ</V><Sub>PPN</Sub> = 1, and Cassini has that to 2·10<Sup>−5</Sup>.
    </Note>

    <Head>and where the space comes from</Head>

    <Note>
      Everything above is one rule — what a meeting does to a path. <V>B</V>{' '}
      needs a second, and it is about what a meeting does to the <i>amount</i>{' '}
      of space rather than to its lean. Three rewrites, and nothing else:
    </Note>

    <Eq derive={SPACE} open={show}
      note="making a charge makes space; a meeting takes it back; a move carries it">
      neutral &nbsp;→&nbsp; + &nbsp;−
      <span style={{ padding: '0 1.4em', color: FAINT }}>+1</span>
      + &nbsp;− &nbsp;→&nbsp; neutral
      <span style={{ padding: '0 1.4em', color: FAINT }}>−1</span>
      move
      <span style={{ padding: '0 0.8em', color: FAINT }}>0</span>
    </Eq>

    <Note>
      A body emitting <V>m</V><K>SHEET</K> charges a tick is therefore a{' '}
      <b style={{ color: INK }}>point source of space</b> — at the body, not in
      its field. Every earlier attempt at <V>B</V> sourced from{' '}
      chance ∝ 1/<V>r</V><Sup>2</Sup>, and a source spread like that gives a
      logarithm. A point gives a potential. The moves then carry it, and a
      carried point source settles:
    </Note>

    <Eq derive={MADE_FROM} open={show}
      note="a point source settles to a potential — if something carries the surplus away, and that is the whole difficulty">
      <V>δ</V>(<V>r</V>) = <Frac over={<V>S</V>}
        under={<>4<V>π D r</V></>} /> = 3<V>u</V>
      <span style={{ padding: '0 1.6em' }} />
      ⇒ <V>u</V> = <Frac over={<V>Gm</V>}
        under={<><V>r c</V><Sup>2</Sup></>} />
    </Eq>

    <Note>
      That is the metric’s own potential out of a rate and a spread, and it is
      linear in the <i>other</i> mass alone — a fact about the <i>place</i>{' '}
      rather than the pair, which the folding could never say before.{' '}
      <b style={{ color: INK }}>The source is not the difficulty. The transport
        is.</b> <V>D</V> is not free — for anything moving at <V>c</V> it is{' '}
      <V>cλ</V>/3 — so the account is only as good as the <V>λ</V> the lattice
      can supply, and that has had three answers.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>by scattering</span>,
        <><b style={{ color: INK }}>Dead.</b> <V>λ</V> would be a charge’s mean
          free path against the ambient field, and the only constant-density
          scatterer is the vacuum — whose length the reach below already fixes
          at 10<Sup>60</Sup> cells against the 10 this needs.{' '}
          <b style={{ color: INK }}>Fifty-nine orders</b>, and the two cannot
          both stand.</>],
      [<span style={{ color: FAINT }}>ballistically</span>,
        <><b style={{ color: INK }}>Wrong shape.</b> Which is where that leaves
          it: measured, <V>δ</V>·<V>r</V><Sup>2</Sup> flat to 0.6%, so{' '}
          <V>u</V> ∝ 1/<V>r</V><Sup>2</Sup> — not a potential, and not Newton
          either.</>],
      [<span style={{ color: DERIVED }}>by hopping</span>,
        <><b style={{ color: INK }}>Alive.</b> A created point that sits a tick
          and then takes one of the <K>WAYS</K> at random is a random walk with{' '}
          <i>no scatterer in it</i>, so <V>D</V> = ⟨ℓ<Sup>2</Sup>⟩/6 = 0.3462 is
          a fact about the lattice and <V>Φ</V> never enters. Measured on the
          lattice: the Green’s function to 0.1%, and <i>static</i> — an
          occupancy, not an accumulation.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Nine point eight, from fifty-nine orders.</b>{' '}
      Hopping gives <V>G</V> = <K>SHEET</K>/(12π<V>D</V>) = 0.6130 against the
      pull’s 0.0624 — gravity nine times too strong, because a fresh direction
      every tick spreads the surplus too slowly and it piles up. The fix is{' '}
      <i>persistence</i>: with mean cosine <V>a</V> between steps, <V>D</V>{' '}
      scales by (1+<V>p</V>)/(1−<V>p</V>), so <V>p</V> = 0.815 — keep your
      heading about 85% of the time, a run of 5.42 steps or 7.67 cells, checked
      against a measured walk to a per cent. The two extremes bracket it and
      neither is right, and{' '}
      <b style={{ color: INK }}>the debt is now a rule the lattice may simply
        have, rather than a contradiction it cannot resolve.</b>
    </Note>

    <Head>how far it reaches</Head>

    <Note>
      Every source is putting charges everywhere, so what any place holds is a
      thin fog of everyone else’s — and a body’s charges annihilate against
      that fog on the way to wherever they were going. Beyond a mean free path
      none of them arrive.
    </Note>

    <Eq derive={REACH} open={show}
      note="the pull is Yukawa, and its range is a fixed fraction of the horizon">
      <V>S</V>(<V>a</V>,<V>b</V>) ∝
      <Frac over={<>e<Sup>−<V>R</V>/<V>λ</V></Sup></>}
        under={<><V>R</V><Sup>2</Sup></>} />
      <span style={{ padding: '0 1.6em' }} />
      <Frac over={<V>λ</V>} under={<><V>R</V><Sub>h</Sub></>} /> =
      √<Paren><Frac over={<>8<V>π G</V></>}
        under={<>3 <K>BITE</K>·share·<K>SHEET</K></>} /></Paren> = 0.361
    </Eq>

    <Note>
      The density cancels, so it is the same fraction in any universe this
      model describes. At ours, 1.55 Gpc: invisible in the solar system and the
      Galaxy, 0.6% down across a cluster,{' '}
      <b style={{ color: INK }}>9.2% down at the BAO scale</b>, half gone by a
      gigaparsec. <b style={{ color: INK }}>This is the one prediction on the
        page</b> — nothing fitted and nothing borrowed — and it lands on the
      derived half of the model, so large-scale structure can falsify the pull
      without touching anything <V>B</V> is still assuming.
    </Note>

    <Note>
      And it <b style={{ color: INK }}>costs something</b>, which is how you
      tell a prediction from a decoration. This <V>λ</V> is the only
      constant-density scattering length the lattice has, so it is also the
      only thing that could have set the diffusivity behind <V>ε</V> — and at
      10<Sup>60</Sup> cells it sets it fifty-nine orders too high, which puts
      the surplus in the ballistic limit and kills the one account of where{' '}
      <V>B</V> might have come from.{' '}
      <b style={{ color: INK }}>The reach and <V>ε</V> cannot both stand.</b>{' '}
      Keeping this one is right — it is counted, <V>ε</V> was solved for — but
      it is a choice with a bill, and the bill is that the metric stays
      borrowed. So the answer to <i>can the last assumption be removed</i> is
      no, and now for a stated reason rather than for want of trying.
    </Note>

    <Note>
      The audit that followed found <K>WAYS</K> enters the dynamics in exactly
      one place — <K>BIAS</K>. Putting <K>SHEET</K> there instead closes the gap
      from three and a half <i>times</i> to{' '}
      <b style={{ color: INK }}>π/3, four and a half per cent</b> — a striking
      near miss, and not a fix, since the argument for <K>WAYS</K> is good and
      4.7% is not nought. Keeping <K>WAYS</K>, the metric route’s 3 would have
      to be 10.21, and the 3 was there because a volume excess is three times a
      linear one. So the likeliest error is neither count but{' '}
      <b style={{ color: INK }}>the identification ∫<V>δ</V> = 3<V>u</V>{' '}
        itself</b> — a choice, and one this page came close to calling a
      derivation.
    </Note>

    <Head>and what mass turns out to be</Head>

    <Eq derive={CLOCK} open={show}
      note="a heavier thing pulses more often, and nothing pulses more than once a tick">
      <V>X</V> = 1/<V>m</V>
      <span style={{ padding: '0 1.4em', color: FAINT }}>ticks between pulses</span>
      <V>X</V>·<V>c</V> = <V>G</V> · <V>λ</V><Sub>Compton</Sub>
    </Eq>

    <Eq derive={IDENTICAL} open={show}
      note="two of the same thing, closer than a wavelength — no gravity in step, double out of it">
      <Frac over={<><V>G</V><Sub>eff</Sub></>} under={<V>G</V>} /> = 2·share
      <span style={{ padding: '0 1.4em', color: FAINT }}>0 … 2</span>
      within&nbsp; 2π<V>G</V><V>λ</V><Sub>C</Sub>
    </Eq>

    <Note>
      And once ω is the mass, <i>coherence</i> stops being bookkeeping.{' '}
      <b style={{ color: INK }}>share = ½ becomes derived</b> — a body of
      10<Sup>57</Sup> emitters has uniform phase, and ⟨|<V>ψ</V>|/π⟩ = ½ — so
      the 3.7% spread of rates in <i>models.ts</i> was standing in for being
      made of things. But two of the <i>same</i> elementary thing do hold a
      phase, and then <V>G</V> runs from nought (in step: same sign at the same
      moment, nothing cancels, no pull at all) to 2<V>G</V> (out of step:
      everything cancels), settling to the ordinary law beyond one Compton
      wavelength.
    </Note>

    <Eq derive={IGNORANCE} open={show}
      note="two routes to the same wavelength — one by not knowing where it is, one by letting the worldline turn">
      <V>λ</V> = <Frac over={<><V>λ</V><Sub>C</Sub></>} under={<><V>γβ</V></>} /> =
      <Frac over={<V>h</V>} under={<V>p</V>} />
      <span style={{ padding: '0 1.4em', color: FAINT }}>at ignorance = ½</span>
      <V>v</V><Sub>phase</Sub> = <V>c</V><Sup>2</Sup>/<V>v</V>
    </Eq>

    <Note>
      A moving source has two retarded branches and exactly one of them is
      yours. Weight them by how likely you are to be ahead rather than behind —{' '}
      <i>expected</i> in <i>field.ts</i> takes that weight as a parameter — and
      at a half the expected phase is <V>ω</V><V>γ</V>(<V>t</V> − <V>vx</V>/
      <V>c</V><Sup>2</Sup>) to nine figures, which is de Broglie’s wave, while
      the half-<i>difference</i> is the Compton oscillation contracted and
      travelling with the thing.{' '}
      <b style={{ color: INK }}>The mean is the wave, the difference is the
        particle</b> — and ½(cos <V>φ</V><Sub>A</Sub> + cos <V>φ</V><Sub>B</Sub>)
      = cos <V>φ</V><Sub>dB</Sub>·cos <V>φ</V><Sub>C</Sub> is an identity, so
      the fields average as cleanly as the phases.
    </Note>

    <Note>
      The half is <b style={{ color: INK }}>load-bearing, which makes it a
        test</b>. Bias it to 0.6 and the wavelength is 30% off <V>h</V>/<V>p</V>;
      at (1−<V>β</V>)/2 the wave vanishes outright and past that runs backwards;
      and anywhere but a half the field stops factorising. It is not radiation
      that sets it — beaming would put (1+<V>β</V>)/2 forward and give exactly
      half the de Broglie wavelength — but <i>position</i>: what is weighted is
      which side of the thing you are on, and a position you know nothing about
      is equally likely either side of you.{' '}
      <b style={{ color: INK }}>So <V>E</V> = ħω comes from what mass is, and{' '}
        <V>λ</V> = <V>h</V>/<V>p</V> from not knowing where it is</b> — with the
      bridge between them being that the ignorance is symmetric, which is the
      uncertainty relation doing the work rather than being assumed.
    </Note>

    <Note>
      And the lattice does <i>not</i> do the averaging itself — scatter
      delivers the red phase travelling the wrong way, and a composite body
      only carries the de Broglie gradient if its emitters are in step in{' '}
      <i>its own</i> frame.{' '}
      <b style={{ color: INK }}>The obstruction is the global tick</b>, and
      that is a sharper thing to be stuck on than “the observer’s ignorance”
      was: it names the update rule that would have to change. So it is made a{' '}
      <b style={{ color: INK }}>dial</b> rather than a choice — sync = 0 is the
      global tick and sync = 1 is de Broglie, with <V>k</V> linear between — and
      the dial doubles as the classical limit, since being in step with itself
      in its own frame is free for one emitter and hard for 10<Sup>57</Sup>.
    </Note>

    <Note>
      And at sync = 1 the phase <i>is</i> the relativistic free action over ħ,
      to nine figures — which is what makes summing e<Sup>i<V>φ</V></Sup> over
      paths literally ∫𝒟<V>x</V> e<Sup>i<V>S</V>/ħ</Sup>. Measured on the free
      propagator it gives the straight-line action plus{' '}
      <b style={{ color: INK }}>π/4 to three figures</b>, amplitude ∝ √<V>X</V>{' '}
      — so stationary phase picks the classical path out of the ignorance with
      nothing selecting it, and two slits are a corollary rather than a setup.{' '}
      <b style={{ color: INK }}>One thing is left assumed: that every path gets
        the same modulus.</b>
    </Note>

    <Note>
      Exactly, at every mass, across twenty orders. Because{' '}
      <V>m</V><Sub>P</Sub><V>l</V><Sub>P</Sub> = ħ/<V>c</V>, “period = 1/mass”
      in the lattice’s units <i>is</i> the Compton relation — so the identity
      that was put here to make the equivalence principle fall out of counting
      has been a quantum statement all along. And the ceiling gives a largest
      elementary mass, <V>G</V>·<V>m</V><Sub>Planck</Sub> ≈ 1.36 µg; anything
      heavier is many emitters, which is what matter is.
    </Note>

    <Head>and the cosmology, which comes out empty</Head>

    <Note>
      The rules fix one whether or not one was wanted. Matter makes space,
      meetings unmake it, and the net is what escapes — a real expansion, and
      it compounds, so <V>H</V> is constant and the growth exponential. Ask it
      for the <i>observed</i> <V>H</V> and it fails seven separate ways, each
      worth recording because each is a fact rather than a failure to try —
      and because <i>five of the seven dissolve</i> once the creation is moved
      to the frontier, which is the section after this one:
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>screening</span>,
        <>The pairs that make the space <i>are</i> the fog that stops the
          gravity. One <V>Φ</V>, two jobs, opposite values: observed <V>H</V>{' '}
          wants <V>λ</V> = 38 µm; gravity at 1 AU wants{' '}
          <V>H</V> ≲ 10<Sup>−96</Sup>. Thirty-five orders apart.</>],
      [<span style={{ color: DERIVED }}>the attractor</span>,
        <>With the cascade and the expansion’s own dilution,{' '}
          (<V>C</V>−<V>k</V><V>Φ</V><Sup>2</Sup>)(2−<V>Φ</V>) = 0 — so either
          nothing expands, or <V>Φ</V> = 2 <i>exactly</i>, at any rate. And{' '}
          <V>Φ</V> = 2 puts <V>λ</V> at one lattice step.</>],
      [<span style={{ color: DERIVED }}>matter is too thin</span>,
        <>Bound regions not expanding does not clear the fog, because{' '}
          <V>C</V> is what empty space does and there is empty space between
          the Earth and the Sun. Integrated over its volume, <V>Φ</V> inside
          the Sun is 1.5·10<Sup>−48</Sup>. The gap is the mass hierarchy, not
          the geometry.</>],
      [<span style={{ color: DERIVED }}>the clock</span>,
        <>The expanding state needs <V>C</V> = 2 pairs a cell a tick, and once
          a tick is the ceiling. It asks empty space to pulse twice as fast as
          the lattice permits — a contradiction, not a shortfall.</>],
      [<span style={{ color: DERIVED }}>escaping charges</span>,
        <>The four above are all about the <i>vacuum</i> making pairs. This one
          needs no vacuum: a body’s charges that cross the horizon never meet
          anything, so they never give their point back —{' '}
          e<Sup>−1/0.361</Sup> = <b style={{ color: INK }}>6.3% of everything
            emitted leaves for good</b>. Immune to screening, uncapped by the
          clock, and still <V>H</V> = 8·10<Sup>−80</Sup>/s against
          2·10<Sup>−18</Sup>. <b style={{ color: INK }}>Sixty-one orders
            short</b>, wanting 10<Sup>61</Sup> times the matter there is.</>],
      [<span style={{ color: DERIVED }}>and light cannot tire</span>,
        <>The escape from needing expansion at all is a photon that loses
          energy on the way. <i>through</i> gives a charge arriving at an
          occupied cell exactly two outcomes and no third —{' '}
          <i>annihilate</i>, or <i>reverse</i> — and both are extinction. A
          step is one cell and a heading is one of <K>WAYS</K>, so there is no
          soft forward channel anywhere in the rules:{' '}
          <b style={{ color: INK }}>the lattice can dim light and cannot redden
            it</b>. A structural no-go rather than a number coming out
          wrong.</>],
      [<span style={{ color: DERIVED }}>and it cannot thermalise</span>,
        <>The same missing channel, counted a second time. <i>Reversal</i>{' '}
          redistributes direction, so the model <i>can</i> isotropise; neither
          outcome moves energy between frequencies, so nothing can make a
          spectrum. FIRAS has the microwave background as a blackbody to a part
          in 10<Sup>5</Sup>, and{' '}
          <b style={{ color: INK }}>this model has no mechanism that would
            produce one at any temperature</b>. The strongest of the seven,
          because it is a missing channel rather than a small number.</>],
    ]} />

    <Note>
      And that same fact tightens the first row by thirty orders, because{' '}
      <V>Φ</V><Sub>0</Sub> sets light’s extinction length too — and we can see
      quasars. Requiring the sky to be transparent rather than merely requiring
      gravity to reach 1 AU puts <V>Φ</V><Sub>0</Sub> below
      1.0·10<Sup>−61</Sup> and <V>H</V> below 3·10<Sup>−80</Sup>/s:{' '}
      <b style={{ color: INK }}>sixty-two orders</b>, beside the matter route’s
      sixty-one. The two independent routes now agree on the size of the hole,
      which they did not before.
    </Note>

    <Note>
      <b style={{ color: INK }}>And all seven have the same sign</b>, which is
      the thing worth noticing. The usual embarrassment is a vacuum energy
      10<Sup>120</Sup> too <i>large</i>; every mechanism this lattice has runs
      the other way — 62 orders short on the vacuum route, 61 on the matter
      route. So the model does not have the cosmological constant problem, it
      has its mirror image, and a model that cannot make the universe expand at
      all is wrong in a way that can be stated and looked for.
    </Note>

    <Note>
      So: no expansion, no dark energy, no thermal history, and — since ± pairs
      are made in pairs — no matter/antimatter asymmetry either.
    </Note>

    <Note>
      <b style={{ color: INK }}>How fast, then, and how old?</b> Both routes
      land together and neither is adjustable: <V>H</V> ~ 10<Sup>−79</Sup>/s,
      so 1/<V>H</V> = 4·10<Sup>71</Sup> years —{' '}
      <b style={{ color: INK }}>10<Sup>122</Sup> ticks</b>, which is the
      cosmological constant problem’s own 10<Sup>120</Sup> arriving from the
      other side. Whether that is one number twice or two large numbers once,
      nothing here can tell. And the age is{' '}
      <b style={{ color: INK }}>eternal</b>, which is derived rather than
      dodged: the rate is <i>constant</i>, because new points can split too, so
      the growth is exponential and has no first moment. Over our universe’s
      13.8 Gyr such a universe grows by one part in 10<Sup>61</Sup>.
    </Note>

    <Note>
      <b style={{ color: INK }}>And one thing was quietly borrowed</b>, caught
      while writing that down. <K>REACHES</K> = 0.361 — “gravity reaches a
      third of the way to the horizon in <i>any</i> universe this model
      describes” — got the density to cancel by using{' '}
      <V>ρ</V> = 3<V>H</V><Sup>2</Sup>/8π<V>G</V>. That is <i>Friedmann</i>, and
      this model has no Friedmann equation. So the universality of the fraction
      goes, and what is left is <V>λ</V>/<V>R</V><Sub>h</Sub> = 0.361/√<V>Ω</V>.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the absolute length does not survive
        either</b>, which is the half that got missed. Reading it “at the
      observed density” means <V>Ω</V> = 1 and gives 1.6 Gpc — but this model
      has no dark matter and no dark energy, so the density that does the
      screening is <i>the baryon one</i>:
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}><V>Ω</V> = 1, as assumed</span>,
        <><V>λ</V>/<V>R</V><Sub>h</Sub> = 0.361, i.e. 1.5 Gpc — gravity dies
          well inside the horizon, and large-scale structure can say so.</>],
      [<span style={{ color: FAINT }}><V>Ω</V> = 0.315, ΛCDM’s matter</span>,
        <><V>λ</V>/<V>R</V><Sub>h</Sub> = 0.644, i.e. 2.7 Gpc — still inside,
          still in principle refusable.</>],
      [<span style={{ color: BORROWED }}><V>Ω</V> = 0.049, <i>this model’s</i></span>,
        <><V>λ</V>/<V>R</V><Sub>h</Sub> = <b style={{ color: INK }}>1.63</b>,
          i.e. 6.9 Gpc. <b style={{ color: INK }}>Gravity reaches half again
            past the horizon, so it never bites and there is nothing left to
            exclude.</b> The prediction does not become wrong. It becomes
          unfalsifiable, which here is the worse of the two.</>],
    ]} />

    <Note>
      And it is not a constant any more. Coasting gives <V>ρ</V> ∝{' '}
      <V>t</V><Sup>−3</Sup> against <V>R</V><Sub>h</Sub> ∝ <V>t</V>, so{' '}
      <V>λ</V>/<V>R</V><Sub>h</Sub> ∝ √<V>t</V> — it <i>grows</i>: 0.49 at{' '}
      <V>z</V> = 10, 0.81 at <V>z</V> = 3, 1.63 now. It bit once and passed out
      through the horizon on the way here. <b style={{ color: INK }}>Moving the
        creation to the frontier dissolved five closures and spent the one
        prediction this file had that an instrument could refuse</b> — and the
      first draft of that section counted the winnings without the bill.
    </Note>

    <Note>
      <b style={{ color: INK }}>Olbers, with a real sink.</b> A static eternal
      universe should glow like a stellar surface, and this model is the rare
      one with an answer: annihilation <i>destroys</i>, and the neutral point it
      leaves is inert — it has to be, or the universe expands. So nothing
      re-radiates and the sky saturates at <V>ρ</V><Sub>L</Sub><V>λ</V>/4π
      rather than at a temperature. Starlight would reach the microwave
      background’s energy density at <V>λ</V> ≈ 156 Gpc, which is not absurd —
      and beside the point, because of the seventh closure above.
    </Note>

    <Head>unless the creation goes somewhere else</Head>

    <Note>
      Every route above makes space <i>throughout the volume</i>, and every one
      dies of the same thing — the vacuum that makes the space is the fog that
      kills the gravity. That is an assumption, and it was never argued for.{' '}
      <b style={{ color: INK }}>Put the creation only where there is no space
        yet.</b> A cell on the <i>frontier</i> of the lattice has nothing on one
      side: a charge emitted outward meets nothing ever, so it never gives its
      point back and that point is new space. A charge emitted inward meets the
      bulk and annihilates. The interior makes none at all.
    </Note>

    <Eq derive={REACH} open={show}
      note="one emission a cell a tick is the ceiling — so it is also the rate">
      <Frac over={<>d<V>R</V></>} under={<>d<V>t</V></>} /> = 1
      <span style={{ padding: '0 0.6em', color: FAINT }}>cell/tick</span> = <V>c</V>
      <span style={{ padding: '0 1.4em', color: FAINT }}>⇒</span>
      <V>R</V> = <V>ct</V>
    </Eq>

    <Note>
      No density, no <V>Φ</V>, no tuning, nothing fitted — the ceiling{' '}
      <i>is</i> the rate rather than a bound on it. And the half-way house is
      worth recording because it is the version that fails: keep creation in the
      bulk and count the escaping fraction properly and it integrates to a
      surface, d<V>R</V>/d<V>t</V> = √(<V>C</V>/<V>k</V>), which reaches{' '}
      <V>c</V> at <V>C</V> = ½ — <i>under</i> the ceiling where the bulk route
      needed 2. But that same <V>C</V> puts <V>λ</V> at two cells, so gravity
      dies at two Planck lengths. A bulk vacuum cannot be rescued by counting
      better. The frontier has to be the only source.
    </Note>

    <Note>
      <b style={{ color: INK }}>Except that “one a tick” does not close, read
        literally.</b> Half of what a frontier cell emits goes <i>inward</i> and
      annihilates, so one emission a tick is a budget of <i>half</i> a cell and
      the frontier advances at <V>c</V>/2. Which fails twice: the age becomes
      2/<V>H</V><Sub>0</Sub> = 27.6 Gyr, twice the thing this construction was
      about to be praised for getting right, and free-streaming matter
      approaching <V>c</V> <i>overtakes the frontier</i> — a lattice with matter
      outside it.
    </Note>

    <Note>
      It survives on what <K>mass</K> actually says. The ceiling is one{' '}
      <i>pulse</i> a tick and a pulse is <K>SHEET</K> charges, not one — so a
      frontier cell puts <b style={{ color: INK }}>four</b> outward-going charges
      into empty sky per tick, against the one needed to advance the shell. So{' '}
      d<V>R</V>/d<V>t</V> = <V>c</V> does saturate, and the binding constraint is
      the speed limit rather than the creation rate, which is what “the ceiling
      is the rate” was reaching for. But it saturates{' '}
      <b style={{ color: INK }}>with four times the room, not by a hair</b> — and
      that surplus is its own unanswered question, since three cells’ worth of
      creation a tick has nowhere to go.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>five of the seven dissolve</span>,
        <>And for one reason rather than seven, since all five were consequences
          of making space in the bulk: no bulk vacuum means{' '}
          <b style={{ color: INK }}>no screening</b>, the attractor’s 3<V>HΦ</V>{' '}
          term assumed bulk expansion, density no longer sources anything, and
          one-a-tick <i>is</i> the rate rather than half of what was
          needed.</>],
      [<span style={{ color: DERIVED }}>a Hubble law by kinematics</span>,
        <>Matter that left the origin at <V>t</V> = 0 and free-streams sits at{' '}
          <V>x</V> = <V>vt</V>, so the relative velocity of two of them is{' '}
          <V>r</V>/<V>t</V>. Every observer inside sees{' '}
          <b style={{ color: INK }}><V>v</V> = <V>Hr</V> with <V>H</V> = 1/<V>t</V></b>,
          linear and isotropic. No metric expansion, no stretched wavelengths,
          no tired light — the redshift is ordinary Doppler, so the sixth
          closure stops mattering.</>],
      [<span style={{ color: DERIVED }}>and the age is forced</span>,
        <>Not fitted: <V>t</V> = 1/<V>H</V><Sub>0</Sub> exactly. At{' '}
          <V>H</V><Sub>0</Sub> = 67.4 that is 14.51 Gyr, at 73.0 it is 13.39,
          and the measured age is{' '}
          <b style={{ color: INK }}>13.80 ± 0.02 Gyr</b>.{' '}
          <b style={{ color: INK }}>The Hubble tension brackets it.</b> A model
          with no freedom to miss does not miss.</>],
    ]} />

    <Note>
      In the model’s own units the universe is{' '}
      <b style={{ color: INK }}>8.49·10<Sup>60</Sup> ticks old and
        8.49·10<Sup>60</Sup> cells in radius</b> — the same number, which is
      what <V>R</V> = <V>ct</V> means and is worth seeing written down. That is
      4.45 Gpc, 2.6·10<Sup>183</Sup> cells, with a frontier
      9.1·10<Sup>122</Sup> cells across. And a tight consistency check: were
      that frontier ceiling-density <i>matter</i> rather than fresh neutral
      space it would weigh 1.2·10<Sup>114</Sup> kg, which is 10<Sup>61</Sup>{' '}
      times the universe. It has to make space and not matter — which is what{' '}
      <K>BITE</K> already said. Every number in this section now comes out of{' '}
      <K>frontier</K> in <code>gravity.ts</code> rather than being typed in;
      they were all right, and they were all unchecked.
    </Note>

    <Head>and then the supernovae, which decide it</Head>

    <Note>
      A coasting universe is <b style={{ color: INK }}><V>q</V><Sub>0</Sub> = 0
        exactly</b>, with nothing to fit — no <V>Ω</V>, no <V>Λ</V>, no freedom
      anywhere. The measured value is −0.55 ± 0.05. That is the test in one
      line, and it is eleven sigma, but it deserves doing properly, because the
      defence is a real one: a supernova’s absolute magnitude is a nuisance
      parameter, so a <i>constant</i> offset in distance modulus is free — and{' '}
      <V>H</V><Sub>0</Sub> is exactly degenerate with it. Only the{' '}
      <i>shape</i> counts.
    </Note>

    <Note>
      So marginalise the offset away and look at what is left, against ΛCDM at{' '}
      <V>Ω</V><Sub>m</Sub> = 0.315. The residual runs +0.072 mag at{' '}
      <V>z</V> = 0.02, through zero near 0.18, to −0.130 at <V>z</V> = 1 and
      back to −0.098 at 2: <b style={{ color: INK }}>0.061 mag rms, 0.202 mag
        peak to peak, and monotonic</b>. Pantheon+ bins carry 0.02–0.03 mag. And
      the shape of that residual — nearby too bright, distant too faint — is
      precisely the one the 1998 measurements found and named acceleration.
    </Note>

    <Note>
      <b style={{ color: INK }}>So the frontier cosmology fails the supernova
        Hubble diagram at roughly the significance with which acceleration was
        discovered</b>, and no choice of <V>H</V><Sub>0</Sub> helps, because{' '}
      <V>H</V><Sub>0</Sub> is the parameter that was marginalised away. The age
      coming out right was the strongest thing this section had; the same
      construction, asked a second question, gets the answer wrong by the width
      of the discovery that started modern cosmology. It was never asked.
    </Note>

    <Head>and where the middle would be</Head>

    <Note>
      Now that the lattice is finite and growing, the question has an owner.
      Ask it first the naive way — a <i>static</i> ball of radius <V>R</V>, an
      observer at <V>d</V> from the middle, and the extinction length{' '}
      <V>λ</V> — because that version is wrong in an instructive way and the
      arithmetic is reusable:
    </Note>

    <Eq derive={REACH} open={show}
      note="how much universe lies along a given line of sight">
      <V>B</V>(ψ) = 1 − <V>e</V><Sup>−<V>L</V>(ψ)/<V>λ</V></Sup>
      <span style={{ padding: '0 1.2em', color: FAINT }}>,</span>
      <V>L</V>(ψ) = −<V>d</V> cos ψ + √(<V>R</V><Sup>2</Sup> − <V>d</V><Sup>2</Sup> sin<Sup>2</Sup>ψ)
    </Eq>

    <Note>
      Brighter looking <i>across</i> the middle, where there is more of it. One
      function, two parameters — so two measured multipoles fix it and every
      other one is a prediction. Taking the dipole as entirely positional and
      the quadrupole as the second constraint gives{' '}
      <V>R</V>/<V>λ</V> = 2.556 and <V>d</V>/<V>λ</V> = 0.0147, so we would sit{' '}
      <b style={{ color: INK }}>half a percent of the way out</b>.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>the direction</span>,
        <>The one thing that is not a floor. Brightness rises where the chord is
          longest, so the middle lies at the dipole’s <i>hot</i> pole:{' '}
          <b style={{ color: INK }}>(<V>l</V>, <V>b</V>) = (264.0°, +48.3°)</b>,
          which is RA 11<Sup>h</Sup>12<Sup>m</Sup>, Dec −7.2° — in Crater.</>],
      [<span style={{ color: DERIVED }}>the distances</span>,
        <>Floors, not measurements: <V>λ</V> is bounded below by the sky being
          clear and not bounded above at all. At <V>λ</V> = 10 Gpc the universe
          is 25.6 Gpc across and the middle is{' '}
          <b style={{ color: INK }}>147 Mpc away</b>; at 100 Gpc, ten times
          each.</>],
      [<span style={{ color: BORROWED }}>and the octupole kills it</span>,
        <>One offset fixes every multipole at once — that is the appeal — and
          fixes them falling as (<V>d</V>/<V>λ</V>)<Sup><V>l</V></Sup>. Fit the
          dipole and quadrupole and the octupole arrives at{' '}
          <b style={{ color: INK }}>8.4 nK against an observed 25 µK</b>. Three
          thousand times too small, with both parameters already spent.</>],
      [<span style={{ color: BORROWED }}>the dipole is motion anyway</span>,
        <>A boost aberrates the small-scale pattern and couples neighbouring
          multipoles; Planck detected exactly that, at a velocity agreeing with
          the dipole. Standing off-centre aberrates nothing — so the fit above
          is an upper bound on the offset, not a determination.</>],
      [<span style={{ color: BORROWED }}>and nothing above <V>l</V> = 3</span>,
        <>The measured spectrum has acoustic peaks at <V>l</V> ≈ 220, 540, 810
          at percent precision. No oscillating fluid, no last scattering, no
          peaks — the seventh closure wearing a different hat.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>But the growing version answers it differently,
        and better.</b> The dipole cannot measure the offset at all, for a
      structural reason. An observer at <V>d</V> sees a shell of radius{' '}
      <V>D</V> around <i>themselves</i>; a point on it sits at{' '}
      <V>d</V>n̂<Sub>d</Sub> + <V>D</V>n̂ and moves at that over <V>t</V>, and
      averaging over the shell the <V>D</V>n̂ part vanishes by symmetry —{' '}
      ⟨<V>v</V>⟩ = <V>d</V>/<V>t</V>, our own velocity.{' '}
      <b style={{ color: INK }}>We are at rest in its frame.</b> The positional
      dipole cancels exactly to first order, which is the same cancellation that
      makes a freely expanding universe look isotropic to everybody in it — and
      it agrees, from the opposite direction, with Planck’s aberration
      measurement that the dipole is our own motion.
    </Note>

    <Note>
      <b style={{ color: INK }}>The origin is an ordinary place, though.</b>{' '}
      Our past light cone reaches <V>t</V> = 0 on a sphere of radius{' '}
      <V>ct</V><Sub>0</Sub> around <i>us</i>, and the origin is a single point
      at <V>d</V> ≪ <V>ct</V><Sub>0</Sub>, well inside it. The frontier at{' '}
      <V>t</V>′ sits at <V>ct</V>′ from the origin and our backward cone at{' '}
      <V>t</V>′ is at <V>c</V>(<V>t</V><Sub>0</Sub>−<V>t</V>′) from us, and both
      at once give{' '}
      <V>s</V>(ψ) ≈ <V>ct</V><Sub>0</Sub>/2 − (<V>d</V>/2)cos ψ:{' '}
      <b style={{ color: INK }}>the frontier appears at half the horizon
        distance, 6.9 Gly, with its distance dipolar at amplitude{' '}
        <V>d</V>/<V>R</V></b>. There is a preferred direction.
    </Note>

    <Note>
      It is invisible all the same, for a better reason than geometry: the
      frontier recedes at exactly <V>c</V>, so <V>γ</V> = ∞ and it is
      infinitely redshifted. Just inside, the redshift is large but finite — so
      the model <i>does</i> have a surface of last visibility at{' '}
      <V>z</V> → ∞ whose distance carries a dipole of size <V>d</V>/<V>R</V>.
      Which is exactly the structure a microwave background would test, if the
      model could make one.
    </Note>

    <Note>
      For the record, the sky <i>does</i> say the soup differs by direction, and
      it is not the temperature dipole: a{' '}
      <b style={{ color: INK }}>7% hemispherical power asymmetry</b> below{' '}
      <V>l</V> = 64, toward (<V>l</V>, <V>b</V>) ≈ (220°, −20°) — the{' '}
      <i>amplitude</i> of the fluctuations differing by hemisphere, which is the
      primordial conditions themselves differing. Read as an offset it gives{' '}
      <V>d</V> ≈ 310 Mpc. Read off the temperature dipole instead it gives 5.5
      Mpc, a factor of 57 apart, in directions 70° from each other.{' '}
      <b style={{ color: INK }}>No single geometry does both</b> — which is what
      the cancellation above already predicted.
    </Note>

    <Note>
      <b style={{ color: INK }}>Does gravity decelerate it?</b> Mostly not, and
      the reason is countable. “It cannot reach because it is moving away” is
      false as stated — the interior recedes at <V>β</V> &lt; 1 while gravity
      travels at 1, so it does arrive. But gravity here is a <i>meeting rate of
        two fluxes</i>, and a receding source is thinned by{' '}
      <V>D</V> = √((1−<V>β</V>)/(1+<V>β</V>)), which is{' '}
      <b style={{ color: INK }}>exactly nought beyond <V>ct</V></b>: that mass
      recedes at or above <V>c</V> and its pull never arrives at all.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>a third of the pull survives</span>,
        <>The pull is ∫dΩ cos ψ ∫<Sub>0</Sub><Sup>chord</Sup> <V>D</V> d<V>s</V>{' '}
          — the inverse square’s <V>s</V><Sup>2</Sup> cancels the volume
          element’s, and at <V>D</V> = 1 it returns −(4/3)π<V>Gρr</V> exactly.
          With <V>D</V> the ratio runs 0.068 at the centre to 0.399 at the edge,{' '}
          <b style={{ color: INK }}>0.309 mass-weighted</b>. Strongest in the
          middle, which is right: there the pull is a small residual of a nearly
          cancelling sphere, and killing the far side kills the residual.</>],
      [<span style={{ color: DERIVED }}>so the age survives too</span>,
        <>Ω is not a choice, and this model has no dark matter particle.
          Pure free-streaming gives 14.51 Gyr; baryons thinned by recession give{' '}
          <b style={{ color: INK }}>14.10</b>; baryons unthinned 13.58; ΛCDM’s
          dark matter 11.66 — <i>younger than the globular clusters</i>, which
          is the age crisis Λ was invented to fix. The thinned case is exactly
          13.80 Gyr at <V>H</V><Sub>0</Sub> = 68.9, inside the disputed range.{' '}
          <b style={{ color: INK }}>Free-streaming is recovered to three
            percent.</b></>],
      [<span style={{ color: BORROWED }}>nucleosynthesis, by 5·10<Sup>7</Sup></span>,
        <>Radiation-dominated BBN has <V>H</V> ∝ <V>T</V><Sup>2</Sup>; coasting
          has <V>H</V> ∝ <V>T</V> — a different <i>power</i>. 1 MeV arrives at
          10<Sup>8</Sup> s rather than 1 s, freeze-out drops 85× to 9.5 keV, and{' '}
          <V>n</V>/<V>p</V> = <V>e</V><Sup>−137</Sup>.{' '}
          <b style={{ color: INK }}>Zero helium</b> against a measured{' '}
          <V>Y</V><Sub>p</Sub> = 0.245. Not a tension, an absence.</>],
      [<span style={{ color: BORROWED }}>and that is the lesser problem</span>,
        <>It is moot, which is worse: with no hot phase at all the model never
          gets as far as running BBN badly. The sharpest bill is{' '}
          <b style={{ color: INK }}>deuterium</b> — stars destroy it, nothing
          much makes it, and pristine clouds show <V>D</V>/<V>H</V> =
          2.5·10<Sup>−5</Sup>. One number, and the cleanest evidence there is
          for an early hot dense phase.</>],
    ]} />

    <Head>and whether any of that is dark matter</Head>

    <Note>
      The missing dark matter is what saved the age, so it is worth asking
      whether the same construction can pay it back. And rather than argue it,
      run it: below is the Milky Way put through the model’s own force law,{' '}
      <b style={{ color: INK }}>summed directly over its baryons, ring by ring
        and angle by angle</b> — no shell theorem, no enclosed-mass shortcut,
      so nothing about what the outside does is assumed.
    </Note>

    <Rotation />

    <Note>
      Every other term the model owns is checked and negligible: <i>reach</i>{' '}
      takes 1.9·10<Sup>−10</Sup> off the pull at 30 kpc, <i>carry</i> puts
      2.4·10<Sup>−7</Sup> back on, <i>shows</i> nothing at all — a galaxy is
      transparent. So the model’s prediction here is Newton on the baryons: it{' '}
      <b style={{ color: INK }}>peaks at 193 km/s and falls to 104 by 30 kpc</b>,
      against a curve Gaia measures at 229 km/s at the Sun and 200 at 25.
      That is a shortfall in the pull of <b style={{ color: INK }}>52% at the
        Sun and 242% at 30 kpc</b>.
    </Note>

    <Note>
      <b style={{ color: INK }}>And it is not this model’s shortfall in
        particular</b>, which is the honest way to put it. General relativity is
      on that same line. Its correction to Newton for a galaxy is the 1PN term,
      of order <V>v</V><Sup>2</Sup>/<V>c</V><Sup>2</Sup> — about 4·10<Sup>−7</Sup>{' '}
      at the Sun’s radius — and this model, having <V>β</V> = <V>γ</V> = 1,
      reproduces exactly that size through <i>carry</i>. The one genuinely new
      thing in this force law is <i>reach</i>, and at galactic radii it is
      thirteen orders below the problem. Put all three on a log axis against
      what is missing and there is nothing left to argue about:
    </Note>

    <Apart />

    <Note>
      Two lines at 10<Sup>−7</Sup>, one at 10<Sup>−10</Sup>, and the discrepancy
      at 10<Sup>0</Sup>. <b style={{ color: INK }}>The entire difference between
        Newton, Einstein and this model is six orders below the thing all three
        of them miss.</b> Whatever dark matter is, it was never going to be
      reached by a correction of that size — which is the reason the dashed
      green curve is on the panel above. MOND with one number, not fitted here,
      lands on the Gaia curve from 8 kpc out to 24 within a few km/s. Nothing in
      the <i>force law</i> gets near it.
    </Note>

    <Note>
      <b style={{ color: INK }}>Which is a statement about the force law and not
        about the model</b>, and the difference matters for everything below. The
      sections that follow find the missing piece somewhere else entirely — in
      how the carriers <i>travel</i> rather than in how hard they pull — and that
      route does produce the green curve, from one mechanism, with one number it
      claims to fix rather than fit. Read this panel as closing off the obvious
      direction, not as closing the question.
    </Note>

    <Note>
      <b style={{ color: INK }}>So does the mass outside the orbit cancel?</b>{' '}
      It does not — a disc is not a sphere, and only for a sphere is an exterior
      shell worth exactly nothing. But the sign runs the other way from the
      intuition, and the sum says so directly:
    </Note>

    <Split />

    <Note>
      The exterior pulls <b style={{ color: INK }}>outward</b>, because the near
      arc of an exterior ring is closer than the far arc and wins the inverse
      square. It takes 27% off the pull at 2 kpc and 4% off at 30. So the
      missing gravity cannot come from the outside failing to cancel:{' '}
      <b style={{ color: INK }}>the outside is already counted, already fails to
        cancel, and already subtracts</b>. The curve above is what is left after
      that is included.
    </Note>

    <Note>
      Which fixes the target so it can be failed: flat rotation curves want{' '}
      <V>v</V><Sup>2</Sup> = <V>GM</V>(<V>r</V>)/<V>r</V> constant, so{' '}
      <V>M</V> ∝ <V>r</V>, so{' '}
      <b style={{ color: INK }}><V>ρ</V> ∝ 1/<V>r</V><Sup>2</Sup>, and the extra
        pull is <i>inward</i></b>. Both halves matter.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>the shell theorem</span>,
        <>Space made in a shell <i>outside</i> an orbit has no inside — a
          uniform <i>spherical</i> shell has no preferred direction within it.
          A disc does, and as measured above it points{' '}
          <b style={{ color: INK }}>outward</b>. Either way the sign is wrong:
          for a circular orbit <V>v</V><Sup>2</Sup>/<V>r</V> = <V>g</V> −{' '}
          <V>g</V><Sub>push</Sub>, so an outward push <i>lowers</i> the speed a
          star can hold. Dark matter is missing centripetal force; this supplies
          the opposite.</>],
      [<span style={{ color: BORROWED }}>and it undoes the cosmology</span>,
        <>The whole virtue of the frontier was that{' '}
          <i>the bulk makes no space</i> — which is what dissolved four
          closures. Wanting voids to create locally puts it back in the bulk and
          brings all four failures with it. The two ideas cannot both hold.</>],
      [<span style={{ color: DERIVED }}>but the screening objection was never about this</span>,
        <>A bulk vacuum was fatal because one <V>Φ</V> both makes space and
          stops gravity — priced at the density <i>expansion</i> needs. Dark
          matter needs <V>Φ</V> = 1.4·10<Sup>−118</Sup> per cell, whose
          screening length is 10<Sup>57</Sup> Hubble radii.{' '}
          <b style={{ color: INK }}>Eighty-eight orders below</b> what killed
          it. A gravitating vacuum at this density is perfectly fine — the whole
          question is the <i>profile</i>.</>],
    ]} />

    <Note>
      And three profiles are available. A <i>uniform</i> vacuum gives{' '}
      <V>ρ</V> = const, <V>v</V> ∝ <V>r</V>. A vacuum <i>depleted</i> by the
      galaxy’s own field — screening, <V>Φ</V> ≈ <V>C</V>/<V>kΦ</V><Sub>gal</Sub>{' '}
      — gives <V>ρ</V> ∝ <V>r</V><Sup>2</Sup>, worse. But a vacuum{' '}
      <i>stimulated</i> by it — a neutral point splitting when a charge{' '}
      <i>arrives</i>, which is rule 3 made stimulated rather than spontaneous —
      gives <V>Φ</V> ∝ <V>Φ</V><Sub>gal</Sub> ∝ <V>M</V>/<V>r</V><Sup>2</Sup>:{' '}
      <b style={{ color: INK }}>an isothermal halo, exactly, with no new
        constant</b>.
    </Note>

    <Note>
      <b style={{ color: INK }}>And that dies on Tully–Fisher.</b> With{' '}
      <V>ρ</V> = <V>κM</V>/4π<V>r</V><Sup>2</Sup> the enclosed halo is{' '}
      <V>κMr</V>, so <V>v</V><Sup>2</Sup> = <V>GκM</V> and{' '}
      <V>v</V><Sup>4</Sup> ∝ <V>M</V><Sup>2</Sup>. The baryonic Tully–Fisher
      relation is <V>v</V><Sup>4</Sup> = <V>GMa</V><Sub>0</Sub> — that is{' '}
      <V>v</V><Sup>4</Sup> ∝ <V>M</V>, under 0.1 dex of scatter across five
      decades. Anchored at 10<Sup>10</Sup> M☉ the two run apart by a factor of
      ten at each end. Not a tension, a different law. The model can make flat
      rotation curves and cannot make them scale.
    </Note>

    <Head>a fourth, which is not a profile at all</Head>

    <Note>
      Do not give the vacuum a profile. Let it make pairs anywhere, and let{' '}
      <b style={{ color: INK }}>one charge be caught by <V>A</V> and the other
        by <V>B</V></b>. The pair was made with its point and never gives it
      back, because its two halves were taken by different bodies and never met
      each other. A net point is destroyed, a destroyed point is attraction, and
      there is more of it where there is more empty space to make pairs in. The
      bookkeeping is right: <K>BITE</K> makes creation and annihilation exact
      inverses only for a pair that <i>self</i>-annihilates, and this one does
      not.
    </Note>

    <Note>
      <b style={{ color: INK }}>And its radial law is the one thing every other
        route failed to get.</b> A pair born at <V>P</V> reaches <V>A</V> with
      weight <V>σ</V><Sub>A</Sub>/4π|<V>P</V>−<V>A</V>|<Sup>2</Sup> and{' '}
      <V>B</V> with <V>σ</V><Sub>B</Sub>/4π|<V>P</V>−<V>B</V>|<Sup>2</Sup>, so
      the linked rate is that product summed over everywhere a pair could be
      born — and that integral is exactly π<Sup>3</Sup>/<V>R</V>. (The Fourier
      transform of 1/<V>r</V><Sup>2</Sup> is 2π<Sup>2</Sup>/<V>k</V>, so the
      convolution is 4π<Sup>4</Sup>/<V>k</V><Sup>2</Sup>, whose inverse is{' '}
      π<Sup>3</Sup>/<V>R</V>. Monte Carlo agrees to 5%.)
    </Note>

    <Note>
      <b style={{ color: INK }}>One over <V>R</V>, where Newton is one over{' '}
        <V>R</V><Sup>2</Sup></b> — so the ratio grows linearly with radius,
      which is precisely what dark matter looks like and precisely MOND’s deep
      limit. No profile assumed, no halo fitted, the exponent out of a geometric
      integral rather than a choice. It is the best radial law anything in this
      file has produced.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the disc geometry works too.</b> The picture
      is two bodies in <i>different spiral arms</i> — same radius, different
      angle, a great deal of empty space between them to make pairs in. Both
      halves of that check out. The <b style={{ color: INK }}>sign</b>: a star
      sitting <i>in</i> a ring is pulled inward by the rest of it, since an
      element at angle <V>θ</V> contributes cos <V>θ</V> − 1 ≤ 0 radially for
      every <V>θ</V>. So arm-to-arm pull is centripetal — the direction the
      missing gravity is missing in, and the opposite of what space made in an
      exterior shell does.
    </Note>

    <Note>
      And the <b style={{ color: INK }}>shape</b>. The mechanism <i>adds</i> a
      1/<V>d</V> channel to Newton rather than replacing him — the direct
      meeting of <V>A</V>’s charges with <V>B</V>’s is still there and still
      1/<V>d</V><Sup>2</Sup>. Sum both over the real baryons, fit the one
      coupling at the Sun and nowhere else, and against the Gaia curve it runs
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>0.981 · 1.000 · 0.996 · 0.985</span>,
        <>at 6, 8, 10 and 12 kpc.</>],
      [<span style={{ color: DERIVED }}>0.964 · 0.955 · 0.959 · 0.974</span>,
        <>at 16, 20, 25 and 30 kpc — so{' '}
          <b style={{ color: INK }}>inside 4.5% across the whole range the data
            covers, on one constant</b>, where Newton alone is short by 52% at
          the Sun and 242% at 30 kpc. Below 5 kpc it falls away, and below 5 kpc
          there is no data either.</>],
    ]} />

    <Note>
      Which is worth looking at rather than reading, since a rotation curve is a
      graph and a graph hides what it means. Below: four spokes of stars laid
      down along one radius and left to shear, under each of the three laws.
      The dashed curve is the measured one, repeated in every panel.{' '}
      <b style={{ color: INK }}>General relativity falls visibly behind it
        within one turn of the Sun; the caught pair sits on top of it.</b>
    </Note>

    <Discs />

    <Note>
      <b style={{ color: INK }}>It dies twice anyway</b>, and neither death is
      visible in that picture — which is the reason to be careful with pictures.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>first on Tully–Fisher</span>,
        <>Same wall as the halo above, same reason. <V>σ</V> ∝ <V>m</V> at both
          ends, so <V>F</V> ∝ <V>m</V><Sub>A</Sub><V>m</V><Sub>B</Sub>/<V>R</V>,
          so <V>v</V><Sup>2</Sup> ∝ <V>M</V> and{' '}
          <V>v</V><Sup>4</Sup> ∝ <V>M</V><Sup>2</Sup> — slope 2 against a
          measured <b style={{ color: INK }}>3.85 ± 0.09</b>, which is 21σ.
          Putting the vacuum in the middle does not make the law non-bilinear,
          and the theorem does not care what the mediator is. The arms change
          the geometry, not the mass dependence.</>],
      [<span style={{ color: BORROWED }}>and second on the density</span>,
        <>Which needs care, because the obvious version of this argument is{' '}
          <i>wrong</i> — see below. It is not that the fog eats the mechanism.
          The mechanism survives the fog. It is that the fog it needs leaves no
          gravity to enhance.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>The correction, which is worth more than the
        conclusion.</b> An earlier pass here said: the gain is linear in{' '}
      <V>ΦR</V> and the loss exponential in it, so the loss wins. That was
      comparing an attenuated gain against an <i>unattenuated Newton</i>.
      Newton’s carriers cross the same fog. Put the attenuation on both sides
      and most of it cancels — because the vacuum charge must reach <V>A</V>{' '}
      and its partner must reach <V>B</V>, and{' '}
      <V>r</V><Sub>A</Sub> + <V>r</V><Sub>B</Sub> ≥ <V>R</V>{' '}
      <i>with equality on the segment</i>. The pair’s shortest route is Newton’s
      route.
    </Note>

    <Note>
      Done properly, in prolate spheroidal coordinates the angular part
      collapses exactly and the enhancement comes out as{' '}
      <b style={{ color: INK }}>4π<V>Φ</V>(ln(2<V>R</V>/<V>λ</V>) + <V>γ</V>)</b>,
      since <V>Cλ</V> = √(<V>C</V>/<V>k</V>) = <V>Φ</V>.{' '}
      <b style={{ color: INK }}>So it does survive the fog</b> — you were right
      about that. What it does not do is <i>grow</i>: past <V>λ</V> the
      enhancement is only logarithmic in <V>R</V>, and its size is fixed by{' '}
      <V>Φ</V> and nothing else. All the extra space in the galaxy buys a
      logarithm.
    </Note>

    <Note>
      And then the same trap as everywhere else, by a new route. Ask the extra
      pull to equal Newton’s at 10 kpc and it takes{' '}
      <V>Φ</V> = 6.6·10<Sup>−4</Sup> per cell, which puts{' '}
      <V>λ</V> — <i>the range of gravity</i> — at 3030 cells, or
      4.9·10<Sup>−32</Sup> m. What is left of Newton at that <V>λ</V>: at a
      nanometre <V>R</V>/<V>λ</V> = 2·10<Sup>22</Sup>, at 1 AU
      3·10<Sup>42</Sup>, at 10 kpc 6·10<Sup>51</Sup>.{' '}
      <b style={{ color: INK }}>The ratio is fine and there is nothing left to
        take a ratio of.</b>
    </Note>

    <Note>
      <b style={{ color: INK }}>Which is the real answer to why <K>reach</K>{' '}
        subtracts</b>, and it is not the one about signs. A mean free path only
      ever subtracts, true — but the caught pair <i>is</i> gain, it does work,
      and it is bounded at 4π<V>Φ</V>·log. <V>Φ</V> cannot be raised to make the
      gain useful without lowering <V>λ</V> to where there is no gravity to
      enhance. Gain and loss are not fighting over an exponent.{' '}
      <b style={{ color: INK }}>They are the same number, spent twice.</b>
    </Note>

    <Note>
      <b style={{ color: INK }}>The one hook that is native is an
        acceleration.</b> <V>a</V><Sub>0</Sub> = 1.20·10<Sup>−10</Sup> m/s²,{' '}
      <V>c</V>/<V>t</V><Sub>0</Sub> = 6.88·10<Sup>−10</Sup>, and their ratio is
      0.174 against 1/2π = 0.159 — so{' '}
      <V>a</V><Sub>0</Sub> ≈ <V>c</V>/(2π<V>t</V><Sub>0</Sub>) to ten percent.
      Everywhere else that is an embarrassment: why should a galaxy know the age
      of the universe?{' '}
      <b style={{ color: INK }}>Here it is structural</b>, because the frontier
      makes <V>H</V><Sub>0</Sub> = 1/<V>t</V><Sub>0</Sub> exactly and{' '}
      <V>t</V><Sub>0</Sub> a <i>count of ticks</i>. “An acceleration of order{' '}
      <V>c</V> per age” and “one unit of velocity per tick, delivered once over
      the whole run” become the same sentence — and the second is the smallest
      acceleration a discrete lattice can represent at all.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the other try: a wake.</b> If the vacuum
      pulses, a star <i>moving</i> through it meets the space ahead differently
      from the space behind, and that asymmetry should be a force. Good
      instinct — it is the test that killed Le Sage’s gravity — and it fails
      four ways, each a different lesson.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>zero for uniform motion, and it must be</span>,
        <>A source moving steadily through a homogeneous isotropic vacuum
          carries the <i>boosted static</i> field — flattened transversely, but
          still symmetric under reflection through the source perpendicular to{' '}
          <V>v</V>. Fore and aft balance term by term, at{' '}
          <i>every</i> order in <V>β</V>. And if they did not, the model would
          have an <b style={{ color: INK }}>aether</b>: a pulsing vacuum defines
          a rest frame, and preferred-frame effects are bounded at
          10<Sup>−17</Sup>. It would die on a bench in a basement long before it
          got near a galaxy.</>],
      [<span style={{ color: BORROWED }}>and it points the wrong way</span>,
        <>A force along ±<V>v̂</V> is <i>tangential</i> on a circular orbit, so
          it adds nothing centripetal — it spins the star up or down. At{' '}
          <V>a</V><Sub>0</Sub> for 10 Gyr that is{' '}
          <b style={{ color: INK }}>Δ<V>v</V> = 3.8·10<Sup>4</Sup> km/s</b>{' '}
          against an orbital 220. Not a halo, a demolition.</>],
      [<span style={{ color: BORROWED }}>velocity is the wrong variable</span>,
        <>The Earth and a star at 30 kpc differ by{' '}
          <b style={{ color: INK }}>6.7× in velocity and 1.4·10<Sup>8</Sup> in
            acceleration</b>. Velocity cannot tell a planet from a galactic
          outskirt, which is why every scheme that works is written in
          accelerations.</>],
      [<span style={{ color: BORROWED }}>so it is already excluded</span>,
        <>Tuned to matter at 200 km/s it gives 1.8·10<Sup>−11</Sup> m/s² at the
          Earth’s 30 if it scales as <V>v</V>, 2.7·10<Sup>−12</Sup> as{' '}
          <V>v</V><Sup>2</Sup>, 4·10<Sup>−13</Sup> as <V>v</V><Sup>3</Sup> —
          against an ephemeris bound near 10<Sup>−13</Sup>. No exponent switches
          off fast enough between 30 and 200 km/s, because there is nothing to
          switch off on.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>What survives, and it is not nothing.</b> The
      instinct that <i>motion through the field matters</i> is right, and the
      model already says so — <i>carry</i> <b style={{ color: INK }}>is</b>{' '}
      that, and its 1 + 2<V>v</V><Sup>2</Sup>/<V>c</V><Sup>2</Sup> is the whole
      difference between one sixth of Mercury’s perihelion advance and six
      sixths. But it enters at <V>O</V>(<V>v</V><Sup>2</Sup>/<V>c</V><Sup>2</Sup>)
      and through the <i>metric</i> rather than as a wake, and at 220 km/s that
      is 5.4·10<Sup>−7</Sup> — nine orders under what a rotation curve wants.
      The model has the velocity-dependent gravity this asks for; it is
      measured, it is right, and it is far too small.
    </Note>

    <Note>
      <b style={{ color: INK }}>And a third try: more space gathers around
        mass, so the outskirts have less of it.</b> The model already says the
      first half — that is <i>thickness</i>,{' '}
      <V>B</V> = <V>e</V><Sup>+2<V>u</V></Sup>, more proper length per unit
      coordinate exactly where the node is folded. It is not a missing
      ingredient; it is the metric, derived rather than borrowed, and it is what
      gives six sixths of Mercury’s perihelion advance. At 20 kpc it is worth{' '}
      √<V>B</V> − 1 = 1.7·10<Sup>−7</Sup> — one part in six million, far under
      the width of the line on the plot above.
    </Note>

    <Note>
      <b style={{ color: INK }}>So stop testing mechanisms one at a time.</b>{' '}
      Every idea has died on a number rather than a story, and it has been the
      same number each time. Enumerate instead: every dimensionless quantity the
      model can build at 20 kpc in a galaxy, out of <V>G</V>, <V>c</V>, the
      cell, the tick, the age, and the galaxy’s own <V>M</V>, <V>r</V> and{' '}
      <V>v</V>. Closing the gap needs +195%, which needs an{' '}
      <V>O</V>(1) number.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}><V>GM</V>/<V>rc</V><Sup>2</Sup></span>,
        <>how folded the place is — 1.70·10<Sup>−7</Sup></>],
      [<span style={{ color: FAINT }}><V>v</V><Sup>2</Sup>/<V>c</V><Sup>2</Sup></span>,
        <>how fast the star goes — 5.39·10<Sup>−7</Sup></>],
      [<span style={{ color: FAINT }}><V>r</V>/<V>λ</V><Sub>reach</Sub></span>,
        <>against gravity’s Yukawa range — 1.25·10<Sup>−5</Sup></>],
      [<span style={{ color: FAINT }}><V>r</V>/<V>ct</V><Sub>0</Sub></span>,
        <>against the horizon — 4.73·10<Sup>−6</Sup></>],
      [<span style={{ color: FAINT }}>ℓ<Sub>P</Sub>/<V>r</V>, <V>t</V><Sub>P</Sub><V>v</V>/<V>r</V></span>,
        <>the lattice spacing and the tick — 10<Sup>−56</Sup>, 10<Sup>−59</Sup></>],
      [<span style={{ color: DERIVED }}><V>g·t</V><Sub>0</Sub>/<V>c</V></span>,
        <>the pull against <V>c</V> per age —{' '}
          <b style={{ color: INK }}>3.86·10<Sup>−2</Sup></b></>],
    ]} />

    <Note>
      <b style={{ color: INK }}>And that is the whole list.</b> Seven of the
      eight sit between 10<Sup>−5</Sup> and 10<Sup>−56</Sup>. Exactly one is
      anywhere near unity, and it is the last. So{' '}
      <b style={{ color: INK }}>no mechanism built from the others can work</b>,
      whatever its story, because it has nothing to make an{' '}
      <V>O</V>(1) correction out of — which closes the whole family at once
      instead of one idea at a time, and is worth more than any of the
      individual tests.
    </Note>

    <Note>
      The survivor is an <i>acceleration</i>, measured against <V>c</V> per age.
      Set it to one and it reads{' '}
      <V>c</V>/<V>t</V><Sub>0</Sub> = 6.88·10<Sup>−10</Sup> m/s², against a
      measured <V>a</V><Sub>0</Sub> = 1.20·10<Sup>−10</Sup> —{' '}
      <V>a</V><Sub>0</Sub><V>t</V><Sub>0</Sub>/<V>c</V> = 0.174 against
      1/2π = 0.159.{' '}
      <b style={{ color: INK }}>The one number this model has at galactic scale
        is the MOND scale, to 2π.</b> Not a mechanism, not a derivation — but
      the search space is now one-dimensional.
    </Note>

    <Note>
      What would have to be shown: <i>spend</i> gives accel = <K>BIAS</K> ×
      (annihilation rate), and a rate below one meeting per{' '}
      <V>t</V><Sub>0</Sub> is not a small acceleration but <i>no</i>{' '}
      acceleration, since there is no such event. So a floor is expected near{' '}
      <K>BIAS</K>/<V>t</V><Sub>0</Sub> = 2.6·10<Sup>−11</Sup> m/s² against{' '}
      <V>a</V><Sub>0</Sub> = 1.2·10<Sup>−10</Sup> — the right{' '}
      <i>size</i>, with the counting factor unfixed at 4.5.{' '}
      <b style={{ color: INK }}>A hint and not a derivation</b>, and a factor of
      4.5 is exactly what gets fitted rather than counted. But it is the only
      place in the model where a galactic number and a cosmological one are
      forced to be the same number.
    </Note>

    <Note>
      <b style={{ color: INK }}>So can the floor be found by enumerating?</b>{' '}
      Twice over, and the two enumerations have opposite worth. If the mechanism
      is one <K>BIAS</K> kick per age then{' '}
      <V>a</V><Sub>0</Sub> = <K>BIAS</K>·<V>κ</V>/<V>t</V><Sub>0</Sub>, so{' '}
      <V>κ</V> = 4.5323 and the job is to find that from the lattice constants.
      Building every <V>ab</V>/<V>c</V>, <V>a</V>/<V>bc</V> and √(<V>ab</V>)/<V>c</V>{' '}
      out of sixteen constants the file already owns gives 12816 expressions:
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>within 20%</span>, <>661 expressions, 107 distinct values</>],
      [<span style={{ color: FAINT }}>within 10%</span>, <>341, 60</>],
      [<span style={{ color: FAINT }}>within 5%</span>, <>175, 31</>],
      [<span style={{ color: FAINT }}>within 2%</span>, <>95, 12</>],
      [<span style={{ color: BORROWED }}>within 1%</span>,
        <><b style={{ color: INK }}>20 expressions, 4 distinct values</b> — the
          closest √(<K>WAYS</K>·π)/2 = 4.51889, at −0.30%</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Twenty expressions land inside a percent.</b> A
      search over numbers cannot tell a derivation from an accident here, so a
      hit is worth nothing even when it is close, and √(<K>WAYS</K>·π)/2 goes
      down as a curiosity and nothing else. This is the one place where{' '}
      <i>count it, do not fit it</i> has to be enforced by refusing to look
      rather than by looking carefully.
    </Note>

    <Note>
      <b style={{ color: INK }}>The search over constraints is not worthless.</b>{' '}
      The floor must be <i>universal</i> — so it cannot depend on the test mass,
      which kills the per-particle reading where a heavier body would have a{' '}
      <i>lower</i> floor. It must be an <i>acceleration</i>, since
      low-surface-brightness galaxies deviate at <i>small</i> radius and a length
      scale forbids that. It must be a <i>square root</i>, since a constant
      addition gives <V>v</V> ∝ √<V>r</V> rather than flat. It must{' '}
      <i>switch off</i> faster than linearly, since the solar system bounds
      anomalies at 10<Sup>−13</Sup> where <V>g</V>/<V>a</V><Sub>0</Sub> is
      5·10<Sup>7</Sup>. It implies an <i>external field effect</i>, measurable in
      wide binaries. And it must <i>run with time</i> — which is the one that
      pays.
    </Note>

    <Note>
      <b style={{ color: INK }}>Because a₀ = c/2π<V>t</V> makes it a function of
        the age.</b> In a coasting universe <V>a</V> ∝ <V>t</V> exactly, so
      1 + <V>z</V> = <V>t</V><Sub>0</Sub>/<V>t</V> — the redshift{' '}
      <i>is</i> the age ratio, nothing fitted. Then{' '}
      <V>a</V><Sub>0</Sub>(<V>z</V>) = <V>a</V><Sub>0</Sub>(1+<V>z</V>) and{' '}
      <V>v</V><Sub>flat</Sub> ∝ (1+<V>z</V>)<Sup>¼</Sup>: at{' '}
      <V>z</V> = 2 the same baryonic mass should rotate{' '}
      <b style={{ color: INK }}>32% faster</b>, putting Tully–Fisher{' '}
      <b style={{ color: INK }}>0.48 dex</b> off its local place — which is
      measured to under 0.1 dex. Not subtle.
    </Note>

    <Note>
      <b style={{ color: INK }}>And is the missing factor 1/<K>SHEET</K>?</b>{' '}
      Taken literally, no: <V>K</V> = 1/<K>SHEET</K> gives
      8.61·10<Sup>−11</Sup> against a measured 1.20·10<Sup>−10</Sup>, 28% low.
      (1/2π is 8.7% low, <K>HALF</K>/<K>DIMS</K> 4.4% — and by the count above,
      none of that is evidence.) But the question underneath it is the sharpest
      one in this section, because{' '}
      <b style={{ color: INK }}>it is not √<V>r</V> that is wanted</b>.
    </Note>

    <Eq derive={REACH} open={show}
      note="the two halves have very different costs">
      <V>g</V> = √(<V>a</V><Sub>0</Sub>·<V>g</V><Sub>N</Sub>) =
      <Frac over={<>√(<V>a</V><Sub>0</Sub><V>GM</V>)</>} under={<V>r</V>} />
    </Eq>

    <Note>
      <V>g</V> ∝ 1/<V>r</V> instead of 1/<V>r</V><Sup>2</Sup> is{' '}
      <i>easy</i> — plenty of things give 1/<V>r</V>. <V>g</V> ∝ √<V>M</V>{' '}
      instead of <V>M</V> is the whole problem.{' '}
      <b style={{ color: INK }}>The radius is not square-rooted at all. The mass
        is.</b> And the exponent is forced rather than chosen: for any deep
      limit <V>g</V> → <V>k·g</V><Sub>N</Sub><Sup><V>p</V></Sup>, a flat curve
      needs 1 − 2<V>p</V> = 0 and Tully–Fisher needs 4<V>p</V> = 1 —{' '}
      <b style={{ color: INK }}>both land on <V>p</V> = ½</b>, which is why MOND
      has no freedom in its deep limit at all. Measured across the forms, only
      those containing a <i>geometric mean</i> of{' '}
      <V>g</V><Sub>N</Sub> and <V>a</V><Sub>0</Sub> survive — <V>p</V> = ½{' '}
      <i>is</i> the geometric mean, and everything else is an arithmetic one.
    </Note>

    <Note>
      <b style={{ color: INK }}>Which is exactly what this model cannot do, and
        now the reason has a name.</b> Every force here is a meeting rate of two
      fluxes, <i>shortfall</i> ∝ <V>m</V><Sub>a</Sub>·<V>m</V><Sub>b</Sub> —{' '}
      strictly <i>bilinear</i>, because each emitter emits independently. So any
      change to the geometry, the propagation or the counting moves the{' '}
      <V>r</V>-dependence and leaves the mass linear.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>flux ∝ 1/<V>r</V><Sup>2</Sup> both</span>,
        <>Newton — <V>g</V> ∝ <V>M</V>/<V>r</V><Sup>2</Sup>, <V>p</V> = 1</>],
      [<span style={{ color: FAINT }}>diffusive, ∝ 1/<V>r</V> both</span>,
        <>flat curve, but <V>v</V><Sup>4</Sup> ∝ <V>M</V><Sup>2</Sup></>],
      [<span style={{ color: FAINT }}>effective dimension 2</span>,
        <>flat curve, but <V>v</V><Sup>4</Sup> ∝ <V>M</V><Sup>2</Sup></>],
      [<span style={{ color: FAINT }}>stimulated halo, <V>ρ</V> ∝ <V>M</V>/<V>r</V><Sup>2</Sup></span>,
        <>flat curve, but <V>v</V><Sup>4</Sup> ∝ <V>M</V><Sup>2</Sup></>],
    ]} />

    <Note>
      <b style={{ color: INK }}>All of them land on v⁴ ∝ M², for one reason.</b>{' '}
      Bilinearity forces <V>v</V><Sup>2</Sup> ∝ <V>M</V> whatever the geometry
      does. Which means the three mechanisms above{' '}
      <i>did not fail separately</i> — the halo, the wake and the spatial
      gradient are one failure wearing three hats, and that was worth finding
      out. So the requirement is sharp: a response{' '}
      <b style={{ color: INK }}>nonlinear in the source</b>, going as √<V>M</V>{' '}
      below <V>a</V><Sub>0</Sub> and back to <V>M</V> above it. Nothing built
      from how the flux <i>travels</i> can do it, because travel does not know
      how much was emitted. It has to be the emission or the response
      saturating — and the model has exactly one saturating quantity, the
      one-a-tick ceiling, which acts at the other end of the scale entirely.
    </Note>

    <Note>
      <b style={{ color: INK }}>And it is worse than bilinearity — it is a
        theorem.</b> Two things the model already satisfies and would not want
      to give up: <i>action and reaction</i>, since the force <i>is</i> a count
      of meetings and both parties count the same ones; and{' '}
      <i>equivalence</i>, since <V>a</V><Sub>a</Sub> = <V>F</V>/<V>m</V><Sub>a</Sub>{' '}
      must not depend on <V>m</V><Sub>a</Sub>. The second gives{' '}
      <V>F</V> = <V>m</V><Sub>a</Sub>·<V>h</V>(<V>m</V><Sub>b</Sub>). Feed it
      into the first and{' '}
      <V>m</V><Sub>a</Sub><V>h</V>(<V>m</V><Sub>b</Sub>) ={' '}
      <V>m</V><Sub>b</Sub><V>h</V>(<V>m</V><Sub>a</Sub>), so{' '}
      <V>h</V>(<V>m</V>)/<V>m</V> is constant and{' '}
      <b style={{ color: INK }}><V>F</V> ∝ <V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub>{' '}
        exactly</b>, with no freedom at all.
    </Note>

    <Note>
      So <b style={{ color: INK }}>no two-body force law can give √<V>M</V></b> —
      not a modified one, not a screened one, not one with a different geometry.
      The mechanisms above were not unlucky, they were forbidden before they
      started, which is why nobody has ever written MOND as a pairwise law.{' '}
      <b style={{ color: INK }}>And that leaves exactly one door.</b> The theorem
      is about a force between <i>two</i> things; it says nothing about whether
      the field of a <i>composite</i> is the sum of its parts. Here it is,
      because every emitter emits independently. Break superposition and the
      theorem does not apply — a galaxy is then not the sum of its stars.
    </Note>

    <Head>a second graph</Head>

    <Note>
      Which is what a <i>second layer</i> would buy: a graph over the spatial
      one, with its own ± polarities and its own XOR, moving under its own
      dynamics, deciding <i>where mass is</i>. That makes the emitters{' '}
      <b style={{ color: INK }}>non-independent</b> — whether one contributes
      now depends on what the layer is doing, which depends on the others. It is
      the first proposal here that goes <i>through</i> the obstruction rather
      than around it.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the XOR hands over the root for free.</b>{' '}
      <V>N</V> contributions with random ± signs do not sum to <V>N</V>; they
      sum to a walk, √(2<V>N</V>/π) — measured at 7.91, 80.01, 800.42 against
      7.98, 79.79, 797.88 for <V>N</V> = 10<Sup>2</Sup>, 10<Sup>4</Sup>,
      10<Sup>6</Sup>. If gravity couples to the <i>net</i> polarity rather than
      the <i>count</i>, the source enters as √<V>M</V> with nothing put in by
      hand — out of the same XOR the whole model is built on.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>but √M alone is not enough</span>,
        <>An effective mass gives <V>G</V>√(<V>MM</V><Sub>0</Sub>)/<V>r</V><Sup>2</Sup>,
          hence <V>v</V> ∝ <V>r</V><Sup>−½</Sup> — not flat. The layer must
          produce a <i>halo</i>,{' '}
          <V>ρ</V> ∝ √<V>M</V>/<V>r</V><Sup>2</Sup>, which then gives{' '}
          <b style={{ color: INK }}>182.7 km/s flat from 10 to 30 kpc and{' '}
            <V>v</V><Sup>4</Sup> = <V>GMa</V><Sub>0</Sub> exactly</b>. The XOR
          supplies the √; nothing yet supplies the 1/<V>r</V><Sup>2</Sup>.</>],
      [<span style={{ color: BORROWED }}>and a walk has a width</span>,
        <>|Σ±1| is Rayleigh — mean √(2<V>N</V>/π), deviation 0.655√<V>N</V>. A
          single realisation scatters 76% in the net, 19% in{' '}
          <V>v</V> = <V>M</V><Sub>eff</Sub><Sup>¼</Sup>, i.e.{' '}
          <b style={{ color: INK }}>0.244 dex</b> of Tully–Fisher scatter
          against a relation measured under 0.1. A <i>static</i> walk is
          excluded outright.</>],
      [<span style={{ color: DERIVED }}>unless the layer is fast</span>,
        <>Averaging <V>K</V> samples an orbit cuts it by √<V>K</V>: at a
          megayear correlation time the scatter is 0.021 dex, at a year or below
          it is under 10<Sup>−4</Sup>. A lattice layer decorrelates in{' '}
          <i>ticks</i>, so this is not close — but it is a real constraint, and
          it says the layer must be <b style={{ color: INK }}>fast-moving</b>,
          which is what “moves on its own” already proposed.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>What it would still owe.</b> The{' '}
      <i>crossover</i> — why the cancellation turns on below{' '}
      <V>a</V><Sub>0</Sub> and off above it — which is the whole of the
      unexplained part, and the second graph makes the root <i>possible</i>{' '}
      without making it <i>happen</i> at the right scale. The{' '}
      1/<V>r</V><Sup>2</Sup> reach. The solar system, where superposition holds
      exquisitely, so the breaking must vanish above <V>a</V><Sub>0</Sub> faster
      than linearly. And <i>what mass is</i> — the layer decides where mass sits,
      so <i>mass = pulse rate</i> has to be re-derived on it rather than
      assumed, which reaches back into <i>physics.ts</i> and is not a small edit.
      An <i>external field effect</i> is not a cost: it is unavoidable once
      superposition fails, it is MOND’s own signature, and it is measurable in
      wide binaries — so it arrives as a prediction.
    </Note>

    <Note>
      <b style={{ color: INK }}>And if that layer has emitters too, the other
        half arrives from the same place.</b> The spatial graph already gets its
      inverse square from emitters — <i>chance</i> = <V>m</V><K>SHEET</K>/<i>shell</i>,
      a point spreading over a sphere. Give the second layer emitters as well
      and the geometry follows, with the XOR doing the rest:{' '}
      <V>N</V> emitters each ∝ 1/<V>r</V><Sup>2</Sup>, random ± polarity, so
      they do not add — they <i>walk</i>:{' '}
      <b style={{ color: INK }}>net ∝ √<V>N</V>/<V>r</V><Sup>2</Sup> =
        √<V>M</V>/<V>r</V><Sup>2</Sup></b>. Both halves, out of one
      construction, neither put in by hand.
    </Note>

    <Eq derive={REACH} open={show}
      note="κ is fixed by a₀, and everything else follows">
      <V>ρ</V> =
      <Frac over={<><V>κ</V>√<V>M</V></>} under={<><V>r</V><Sup>2</Sup></>} />
      <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
      <V>v</V><Sup>4</Sup> = (4π<V>Gκ</V>)<Sup>2</Sup><V>M</V> = <V>GMa</V><Sub>0</Sub>
    </Eq>

    <Note>
      Flat at every radius, and <V>v</V><Sup>4</Sup> ∝ <V>M</V> exactly —{' '}
      182.7 km/s from the profile against 182.7 from (<V>GMa</V><Sub>0</Sub>)<Sup>¼</Sup>.{' '}
      <b style={{ color: INK }}>Both conditions, one exponent, nothing fitted
        but κ ↔ a₀.</b> The <i>shape</i> of the dark matter problem is closed.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>but the solar system kills it</span>,
        <>The same halo forms around the Sun:{' '}
          <b style={{ color: INK }}>1.4·10<Sup>−4</Sup> of a solar mass inside
            the Earth’s orbit</b>, 4.3·10<Sup>−3</Sup> inside 30 AU.
          Ephemerides pin <V>GM</V><Sub>☉</Sub> to a part in 10<Sup>10</Sup> —
          out by six orders, and it would show as an anomalous{' '}
          <i>precession</i>, since the mass is distributed rather than
          central.</>],
      [<span style={{ color: BORROWED }}>and the obvious crossover is out</span>,
        <>The natural story — a strong field <i>aligns</i> the polarities so
          they add, a weak one leaves them random — switches where{' '}
          <V>αN</V> ≈ √<V>N</V>, so <V>α</V> ≈ 1/√<V>N</V>, which{' '}
          <i>counts constituents</i>. Between the Sun and the Galaxy that
          threshold moves by <b style={{ color: INK }}>10<Sup>5.4</Sup></b>, so{' '}
          <V>a</V><Sub>0</Sub> would be mass-dependent — and it is measured
          universal well inside a factor of two across five decades.</>],
      [<span style={{ color: DERIVED }}>which is a constraint, not a wall</span>,
        <>It says the crossover cannot be a competition between an aligned part
          and a random part, because any such competition counts constituents
          and <V>a</V><Sub>0</Sub> must not. It has to switch the{' '}
          <i>whole layer</i> without reference to how many emitters sit in it —{' '}
          <b style={{ color: INK }}>a property of the place, not of the
            body</b>. Which is suggestive, since that is exactly what{' '}
          <i>fold</i> already is, and <V>g·t</V><Sub>0</Sub>/<V>c</V> is already
          a statement about a place.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>So must the two layers touch?</b> Yes, and
      which way decides everything.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>independent</span>,
        <>The property that has to go. If each layer evolves entirely on its
          own, the second is a <i>relabelling</i> — layer one still sums over
          whatever sources it sees, superposition still holds inside it, and the
          theorem applies word for word. Independence is not a detail of the
          picture; it is what stands between it and working.</>],
      [<span style={{ color: BORROWED }}>one-way — “it says where the mass is”</span>,
        <>The reading one falls into by default, and it fails by a computable
          amount. Gravity counts + against −, so with{' '}
          <V>N</V><Sub>±</Sub> = <V>N</V>/2 ± <V>s</V>/2 the rate is{' '}
          (<V>NM</V> − <V>su</V>)/2. The root <i>is</i> there —{' '}
          <V>su</V> ~ √(<V>NM</V>) — but as a <i>correction</i> carrying a
          random sign. For a star in the Galaxy it is{' '}
          <b style={{ color: INK }}>3·10<Sup>−63</Sup></b> of the Newtonian
          term, where MOND wants it comparable (2.13 at 20 kpc). Sixty-three
          orders, which is a deletion rather than a switch.</>],
      [<span style={{ color: DERIVED }}>two-way — layer two has its own field</span>,
        <>The picture as described, and the only one that works. The halo is not
          a correction to layer one’s counting but layer <i>two’s</i> own
          emitted field, which layer one feels. Its size is set by an{' '}
          <b style={{ color: INK }}>inter-layer coupling κ</b> rather than by
          1/√(<V>NM</V>), so it is free to be whatever{' '}
          <V>a</V><Sub>0</Sub> says.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>And that is the real cost, stated plainly:</b>{' '}
      <V>a</V><Sub>0</Sub> becomes a new fundamental constant — the strength
      with which layer two’s field gravitates in layer one — rather than
      something counted out of <K>SHEET</K> and <K>WAYS</K>. For a model whose
      whole method is counting, that is a genuine loss, and it belongs in the
      ledger rather than hidden inside a κ.
    </Note>

    <Note>
      <b style={{ color: INK }}>And a requirement nobody asked for, which is a
        point in favour.</b> The net polarity has a <i>random sign</i>. Couple
      to the net and half of all halos are repulsive; couple to net<Sup>2</Sup>{' '}
      and it is ∝ <V>M</V> again with the root gone. It must couple to{' '}
      |net| — and an absolute value is a strange thing to couple to,{' '}
      <i>and it is exactly what MOND already has</i>. AQUAL’s field equation is
      ∇·[<V>μ</V>(|∇<V>φ</V>|/<V>a</V><Sub>0</Sub>)∇<V>φ</V>] = 4π<V>Gρ</V> —
      the nonlinearity is an absolute value of a field, for precisely this
      reason: it makes the response sub-linear without making it signed. So the
      second layer is not being asked for something exotic. It is being asked
      for{' '}
      <b style={{ color: INK }}>MOND’s own nonlinearity, arrived at from the
        other side</b> — |net polarity of a random ± layer| in place of
      |∇<V>φ</V>|. Two constructions with nothing in common landing on the same
      odd requirement is the one encouraging thing here.
    </Note>

    <Note>
      <b style={{ color: INK }}>And is the compounding the nonlinearity?</b>{' '}
      Layer two moves <i>through</i> layer one, so layer one’s fold decides
      where layer two can go and the effects feed each other. That is the right
      shape of argument — it is the one that already paid once, since{' '}
      1 + <V>u</V> = <V>e</V><Sup><V>u</V><Sub>0</Sub></Sup> came from exactly
      this move, and it remains the only nonlinearity this file has{' '}
      <i>derived</i> rather than assumed.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>but the one already here is the wrong function</span>,
        <>At 20 kpc, <V>u</V> = 1.68·10<Sup>−7</Sup> and the compounded part{' '}
          <V>e</V><Sup><V>u</V></Sup> − 1 − <V>u</V> is 1.41·10<Sup>−14</Sup> —
          fourteen orders under a linear term already seven orders short. And
          the <i>shape</i> matters more:{' '}
          <b style={{ color: INK }}>there is no limit of an exponential that
            behaves like a square root</b>. 1 + <V>u</V> + <V>u</V><Sup>2</Sup>/2
          is integer powers forever.</>],
      [<span style={{ color: DERIVED }}>the version that could work</span>,
        <>Not “the fold compounds itself” but{' '}
          <b style={{ color: INK }}>the fold decides how fast layer two
            forgets</b>. <i>slowing</i> = <V>e</V><Sup>−2<V>u</V></Sup> holds
          motion back where the fold is deep: deep in a well layer two is held
          and the polarities stay aligned (net ~ <V>N</V>, Newton); far out it
          runs free and they randomise (net ~ √<V>N</V>, MOND). A property of
          the <i>place</i>, not the body — precisely what the
          constituent-counting argument demanded.</>],
      [<span style={{ color: BORROWED }}>and it has a sharp tension</span>,
        <>The decorrelation time <V>τ</V> must do two jobs. The crossover needs{' '}
          <V>g·τ</V>/<V>c</V> ≈ 1 at <V>a</V><Sub>0</Sub>, so{' '}
          <V>τ</V> = <V>c</V>/<V>a</V><Sub>0</Sub> ={' '}
          <b style={{ color: INK }}>79 Gyr</b> — 5.7× the age, essentially
          frozen. The scatter needs more than 8.5 draws an orbit, so{' '}
          <V>τ</V> &lt; <b style={{ color: INK }}>26 Myr</b> — fast.{' '}
          <b style={{ color: INK }}>3.5 orders apart, in opposite
            directions.</b></>],
    ]} />

    <Note>
      <b style={{ color: INK }}>And one escape, which follows from the |net|
        result rather than being added to save it.</b> The scatter argument
      assumed <i>one</i> walk for the whole body. But the sign argument already
      forced the coupling to |net| — and if that is <i>local</i>, the halo sums
      |net| over <V>K</V> patches instead of taking |Σ| once: the total goes as
      √(<V>KN</V>) and the width falls as 1/√<V>K</V>. Spatial averaging kills
      the scatter without needing fast forgetting, so <V>τ</V> is freed and the
      tension dissolves — at the price of a new length. A patch anywhere under
      ten kiloparsecs suffices (27 patches, 0.059 dex). What it then owes is
      that the √<V>K</V> be absorbed into κ{' '}
      <i>without</i> introducing a mass or radius dependence, or Tully–Fisher
      moves. A real constraint on the patch size, checkable, and where this goes
      next.
    </Note>

    <Note>
      <b style={{ color: INK }}>And checked, that escape does not survive.</b>{' '}
      Three lines: <V>M</V><Sub>eff</Sub> = √(<V>KN</V>) with{' '}
      <V>K</V> = <V>V</V>/ℓ<Sup>3</Sup> gives{' '}
      √(<V>VM</V>/ℓ<Sup>3</Sup><V>m</V><Sub>p</Sub>), and Tully–Fisher wants{' '}
      √<V>M</V> <i>and nothing else</i> — so ℓ<Sup>3</Sup> ∝ <V>V</V>, i.e.{' '}
      <b style={{ color: INK }}>the same number of patches for every system</b>,
      dwarf to cluster. That is not a length, it is a fixed fraction of whatever
      it sits in, which no local rule produces. With a fixed ℓ the halo picks up
      the galaxy’s <i>size</i> as well as its mass and Tully–Fisher moves by
      whole dex. So the spatial escape is out, and the temporal tension stands:
      79 Gyr against 26 Myr.
    </Note>

    <Head>the whole thing in one line</Head>

    <Note>
      The machinery has got ahead of the question. Strip out the layers, the
      polarities and the patches, and what is left is a statement about{' '}
      <i>which flux is conserved</i>:
    </Note>

    <Eq derive={REACH} open={show}
      note="both flat, both equal to the baryonic mass, at every radius">
      <V>g·r</V><Sup>2</Sup> = <V>GM</V>
      <span style={{ padding: '0 1.6em', color: FAINT }}>vs</span>
      <V>g</V><Sup>2</Sup><V>·r</V><Sup>2</Sup> = <V>GM·a</V><Sub>0</Sub>
    </Eq>

    <Note>
      <b style={{ color: INK }}>Newton conserves the flux of <V>g</V>. Deep MOND
        conserves the flux of <V>g</V><Sup>2</Sup>.</b> Both checked at 10, 20
      and 40 kpc, both flat at 1.39·10<Sup>41</Sup> kg — the Milky Way’s
      baryons. The interpolation between them is exactly AQUAL,{' '}
      <V>μ</V>(<V>g</V>/<V>a</V><Sub>0</Sub>)·<V>g·r</V><Sup>2</Sup> = <V>GM</V>.
      That is the entire problem, and everything above is machinery for making
      that one switch happen.
    </Note>

    <Note>
      Which <b style={{ color: INK }}>collapses three questions into one</b>.
      “Where does √<V>M</V> come from”, “where does 1/<V>r</V> come from” and
      “what switches at <V>a</V><Sub>0</Sub>” are the same question, because{' '}
      <V>g</V><Sup>2</Sup><V>r</V><Sup>2</Sup> = <V>GMa</V><Sub>0</Sub> contains
      all three at once: the square gives the root, the square gives the
      1/<V>r</V>, and <V>a</V><Sub>0</Sub> is only the constant that makes two
      conserved quantities carry the same units.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>a wrong turn, recorded</span>,
        <>“Count <i>pairs</i> instead of charges — pairs among <V>n</V> go as{' '}
          <V>n</V><Sup>2</Sup>, so a conserved pair-flux makes the charge-count
          its root.” It does not survive: pair density goes as{' '}
          <V>M</V><Sup>2</Sup>/<V>r</V><Sup>4</Sup>, so pairs in a shell go as{' '}
          <V>M</V><Sup>2</Sup>/<V>r</V><Sup>2</Sup> — <i>falling</i> rather than
          conserved. Counting pairs concentrates at the centre, the opposite of
          a halo.</>],
      [<span style={{ color: DERIVED }}>the right statement is simpler</span>,
        <><V>g</V><Sup>2</Sup><V>r</V><Sup>2</Sup> = const is just{' '}
          <V>g</V> ∝ 1/<V>r</V>, and <V>g</V> is the density of whatever
          mediates — so it is entirely about how that density falls. Ballistic
          in 3D gives 1/<V>r</V><Sup>2</Sup> (Newton); diffusive in 3D, or
          ballistic in 2D, gives 1/<V>r</V>. With the amplitude √<V>M</V> from
          the random signs, the deep law is{' '}
          <b style={{ color: INK }}>random signs × a 1/<V>r</V> profile</b> —
          two things the model has words for, since <K>SPREAD</K> is diffusion
          and the XOR is the signs. A much smaller ask than a second layer with
          its own gravity.</>],
      [<span style={{ color: BORROWED }}>and the remaining trap</span>,
        <>The natural switch from ballistic to diffusive is the{' '}
          <i>mean free path</i> — one regime inside <V>λ</V>, another outside.
          That is a <b style={{ color: INK }}>length</b>, and a length is already
          excluded: low-surface-brightness galaxies deviate from Newton at{' '}
          <i>small</i> radius, which no <V>r</V>-threshold can do. The switch has
          to be driven by field <i>strength</i>, not distance.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Which leaves one question, in one sentence:
        what makes the mediator stop travelling straight when <V>g</V> falls
        below <V>a</V><Sub>0</Sub>?</b> Everything above is scaffolding for
      that, and anything that answers it makes most of the scaffolding
      unnecessary.
    </Note>

    <Note>
      <b style={{ color: INK }}>“Below what”, though</b> — because “below{' '}
      <V>a</V><Sub>0</Sub>” is circular, <V>a</V><Sub>0</Sub> being the thing to
      derive. Said in the model’s own units it stops being circular. The model
      has one carrier, at occupancy{' '}
      <i>chance</i> = <V>m</V><K>SHEET</K>/<i>shell</i>, and the pull is{' '}
      <V>g</V> = <K>GRAVITY</K>·<V>m</V>/<V>r</V><Sup>2</Sup>. Divide them and{' '}
      <V>m</V> and <V>r</V> both vanish:{' '}
      <V>g</V>/<i>chance</i> = 4π<K>GRAVITY</K>/<K>SHEET</K> = 0.0979, a
      constant.
    </Note>

    <Note>
      <b style={{ color: INK }}>So <V>g</V> <i>is</i> the carrier density</b>,
      times a fixed number. In general relativity the field strength is not a
      density of anything; here it is exactly one — which is why this model can
      state the condition <i>locally</i> at all. “The field is weak” and “the
      carriers are sparse” are not two facts about a place. And that gives the
      threshold a value in carriers per cell: <V>a</V><Sub>0</Sub> is
      2.16·10<Sup>−62</Sup> in lattice units, so the crossover occupancy is
      2.20·10<Sup>−61</Sup> — <b style={{ color: INK }}>one carrier per
        4.54·10<Sup>60</Sup> cells</b>.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the statement is about a path, not a
        volume.</b> Said as “one carrier per horizon” it compared a volume count
      against a linear one, and those differ by 10<Sup>121</Sup> here — the
      occupancy was right and the phrase was not. The mean spacing is
      1.66·10<Sup>20</Sup> cells, 2.68 fm. What <i>is</i> order one is a{' '}
      <i>path</i> count: a carrier moves one cell a tick, so over the age it
      crosses <V>t</V><Sub>0</Sub> cells and meets{' '}
      <V>n</V><Sub>c</Sub>·<V>t</V><Sub>0</Sub> = 1.78 others.{' '}
      <b style={{ color: INK }}>The crossover is where a carrier meets about one
        other in the whole history of the universe</b> — below it, a carrier
      travels its life alone. Which is{' '}
      <V>a</V><Sub>0</Sub> ≈ <V>c</V>/<V>t</V><Sub>0</Sub> in the model’s own
      words, now saying something physical: <i>a carrier that never meets
        another has nothing to keep it straight</i>. A condition on the carrier, evaluated where the
      carrier is, with no reference to the mass that sent it or the distance it
      has come — a property of the place and not the body, and not a length, so
      the low-surface-brightness objection does not touch it.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>Earth’s surface</span>,
        <>1.46·10<Sup>11</Sup> carriers per horizon</>],
      [<span style={{ color: FAINT }}>the Sun at 1 AU</span>,
        <>8.80·10<Sup>7</Sup></>],
      [<span style={{ color: DERIVED }}>the Galaxy at 8 kpc</span>,
        <><b style={{ color: INK }}>2.91</b> — just above the switch</>],
      [<span style={{ color: DERIVED }}>the Galaxy at 20 kpc</span>,
        <><b style={{ color: INK }}>0.395</b> — just below it</>],
      [<span style={{ color: FAINT }}>the Galaxy at 100 kpc</span>,
        <>0.016</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>The switch at one sits between the solar circle
        and 20 kpc</b> — exactly where rotation curves start to depart — and the
      solar system is eight orders clear of it. That separation is what every
      earlier candidate failed to produce, and here it falls out of the counting
      rather than being asked for.
    </Note>

    <Note>
      <b style={{ color: INK }}>So the question in its smallest form, and no
        longer circular: what does a carrier do when there is less than one
        other carrier within reach of it — and why would that be a wander rather
        than nothing at all?</b> Which is answerable by <i>simulation</i> rather
      than by argument, for the first time in this line of work: two carriers, a
      lattice, and whatever rule makes one of them notice the other.
    </Note>

    <Note>
      <b style={{ color: INK }}>So the search, run.</b> Every family of local
      rule that could bend the radial law, and how each dies.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>free streaming</span>,
        <><V>n</V> ∝ 1/<V>r</V><Sup>2</Sup> — nothing wrong with it; it{' '}
          <i>is</i> Newton</>],
      [<span style={{ color: BORROWED }}>scattering, <V>λ</V> = 1/<V>σn</V></span>,
        <>Dense → 1/<V>r</V>. <b style={{ color: INK }}>The sign is
          backwards</b> — the model’s own <i>through</i> rule makes meetings{' '}
          <i>deflect</i>, so it wanders where it is crowded. And{' '}
          <V>λ</V> = <V>r</V> is a length.</>],
      [<span style={{ color: BORROWED }}>scattering, <V>λ</V> ∝ <V>n</V></span>,
        <>Right sign, still a length. Any such rule switches where{' '}
          <V>λ</V>(<V>n</V>) = <V>r</V>, but the switch must sit at fixed{' '}
          <V>n</V><Sub>c</Sub> while <V>r</V><Sub>c</Sub> = √(<V>GM</V>/<V>a</V><Sub>0</Sub>)
          moves with mass — 0.3, 3.4 and 34 kpc for 10<Sup>8</Sup>,
          10<Sup>10</Sup>, 10<Sup>12</Sup> M☉. One number against three.</>],
      [<span style={{ color: BORROWED }}>creation ∝ <V>n</V><Sup>2</Sup>, i.e. meetings</span>,
        <>Dimensions demand <V>p</V> = 2 for <V>Φ</V> ∝ <V>r</V>, and{' '}
          <V>n</V><Sup>2</Sup> is a meeting rate — the only interaction the model
          has. It looked like the answer.{' '}
          <b style={{ color: INK }}>It is a knife edge, not an attractor:</b>{' '}
          1/<V>Φ</V> = 1/<V>Φ</V><Sub>0</Sub> + (<V>γ</V>/4π)(1/<V>r</V> −
          1/<V>r</V><Sub>0</Sub>) either saturates back to Newton or runs away,
          and the threshold between them is in the <i>source strength</i> — so
          heavy galaxies would have halos and light ones none.</>],
      [<span style={{ color: DERIVED }}>carriers slowing, <V>v</V> ∝ 1/<V>r</V></span>,
        <>Gives <V>n</V> ∝ 1/<V>r</V> ✓ — and contradicts the model outright.
          Everything moving at <V>c</V> is what gives the metric and the
          checkerboard.</>],
      [<span style={{ color: DERIVED }}>effectively two-dimensional</span>,
        <>Gives <V>n</V> ∝ 1/<V>r</V> ✓, and nothing forbids it.{' '}
          <b style={{ color: INK }}>The one live candidate</b> — and nothing
          here supplies a rule that would do it. <K>FLOOR</K> and the
          fractional-dimension work in <i>regimes.ts</i> is where the vocabulary
          already is.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>And the mass is still a separate problem.</b>{' '}
      None of these produce √<V>M</V> — they are all rates, so all bilinear, so
      the theorem holds over every one of them. The radial law and the mass law
      are two problems and this search only ever addressed the first.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the live candidate has a candidate
        mechanism: lock layer two to layer one’s <K>SHEET</K>.</b>{' '}
      <K>WAYS</K> = 3<Sup>3</Sup>−1 = 26 is every direction out of a cell;{' '}
      <K>SHEET</K> = 3<Sup>2</Sup>−1 = 8 is the directions in <i>one plane</i>{' '}
      through it. And <i>chance</i> = <V>m</V><K>SHEET</K>/<i>shell</i> already
      uses <K>SHEET</K> rather than <K>WAYS</K> — the pull was always counted
      through a plane. This is not adding a structure; it is taking one the file
      already has and making it <i>bind</i>.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>but not “always” 2D</span>,
        <>A source spreading into a plane gives <V>n</V> ∝ 1/<V>r</V> at{' '}
          <i>every</i> radius, including the solar system where
          1/<V>r</V><Sup>2</Sup> holds to a part in 10<Sup>10</Sup>. The locking
          must be conditional, and the condition is the whole content of the
          proposal.</>],
      [<span style={{ color: DERIVED }}>and the condition runs the right way round</span>,
        <>A plane needs <i>two</i> independent directions to be defined. Many
          carriers met → many planes, all disagreeing → isotropic →{' '}
          <b style={{ color: INK }}>3D, Newton</b>. About one met → one plane,
          uncontested → locked → <b style={{ color: INK }}>2D, MOND</b>. Dense
          is Newtonian and thin is not — which everything earlier got backwards.
          And the threshold is a <i>count of meetings</i>, not a length and not
          a mass.</>],
      [<span style={{ color: DERIVED }}>so it predicts <V>a</V><Sub>0</Sub></span>,
        <>“About one meeting in a carrier’s life” means{' '}
          <V>n</V><Sub>c</Sub> = 1/<V>t</V><Sub>0</Sub> = 1.24·10<Sup>−61</Sup>{' '}
          a cell, and <V>g</V> = 4π<V>G</V>/<K>SHEET</K>·<V>n</V> gives{' '}
          <b style={{ color: INK }}><V>a</V><Sub>0</Sub> = 6.74·10<Sup>−11</Sup> m/s²</b>{' '}
          against a measured 1.20·10<Sup>−10</Sup> —{' '}
          <b style={{ color: INK }}>a factor of 1.78, with nothing fitted</b>.
          The inputs are <K>GRAVITY</K> and <K>SHEET</K>, both counted, and the
          age, which the frontier already fixes at 1/<V>H</V><Sub>0</Sub>.
          Against <K>BIAS</K>/<V>t</V><Sub>0</Sub>, which was 4.53 out, that is
          a real improvement — and it comes from a <i>stated rule</i> rather
          than from trying combinations.</>],
    ]} />

    <Note>
      Checked in meetings over a carrier’s whole life: 1.5·10<Sup>11</Sup> at
      the Earth’s surface, 8.8·10<Sup>7</Sup> at 1 AU, 2.91 at 8 kpc, 0.395 at
      20 kpc, 0.016 at 100 kpc.{' '}
      <b style={{ color: INK }}>Eight orders of margin in the solar system,
        crossing between 8 and 20 kpc.</b> The separation is not asked for; it
      falls out of the counting.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the mass, where the second half of the idea
        points.</b> Two dimensions alone is not enough and fails the familiar
      way: a source of strength <V>M</V> over 2π<V>r</V> gives{' '}
      <V>n</V> ∝ <V>M</V>/<V>r</V>, so <V>v</V><Sup>4</Sup> ∝ <V>M</V><Sup>2</Sup>{' '}
      — the third appearance of that exact failure. But layer one’s pulses both{' '}
      <i>constitute</i> the mass and <i>set</i> the sheet: if the sheet a carrier
      locks to is chosen by the pulse it met, and pulses carry ± which XOR, the
      sheet directions inherit the cancellation. <V>N</V> pulses agree on a
      direction only to √<V>N</V>, so the coherently-locked fraction is
      √<V>N</V>/<V>N</V> and the effective source is √<V>N</V>.{' '}
      <b style={{ color: INK }}>That would be the √<V>M</V></b>, from the same
      mechanism as the radial law rather than a second one.{' '}
      <i>A sketch and not a result</i> — nothing here shows that sheet
      directions XOR the way polarities do, and everything turns on that. But it
      is the first version where both halves have the same cause.
    </Note>

    <Note>
      <b style={{ color: INK }}>But the sheet rotates — so what stops it being
        3D again?</b> The objection is right, and answering it pins the
      mechanism down rather than breaking it. A straight line is 1D and lies in
      infinitely many planes, so confining a carrier to a plane does nothing on
      its own. The distinction is about <i>spreading</i>: a beam widening in two
      transverse directions covers area ∝ <V>r</V><Sup>2</Sup> and gives
      1/<V>r</V><Sup>2</Sup>; widening in <i>one</i> covers ∝ <V>r</V> and gives
      1/<V>r</V>. The plane holds the carrier’s <i>own</i> outward line, so
      every sky direction is still covered — the picture stays isotropic and
      only the widening flattens. (Which also disposes of the obvious worry: a
      globally fixed plane would make halos <i>discs</i> and rotation curves
      depend on sky direction, and they do not.)
    </Note>

    <Note>
      <b style={{ color: INK }}>And then the rotation matters exactly as
        said</b> — if the plane turns about the <i>radial</i> axis mid-journey,
      the widening fills both directions and 1/<V>r</V><Sup>2</Sup> comes
      straight back. So the sheet must hold about that axis for the whole trip.
      And <i>“reset only by a meeting”</i> is precisely that stability — with a
      dividend nobody asked for. Meetings are independent and rare, so they are{' '}
      <b style={{ color: INK }}>Poisson</b> with mean{' '}
      <V>x</V> = <V>g</V>/<V>a</V><Sub>0</Sub> over a carrier’s life: never
      reset with probability <V>e</V><Sup>−<V>x</V></Sup> (stays 2D), reset at
      least once with 1 − <V>e</V><Sup>−<V>x</V></Sup> (3D).
    </Note>

    <Eq derive={REACH} open={show}
      note="the fraction that has gone 3D is the interpolation function">
      <V>μ</V>(<V>x</V>) = 1 − <V>e</V><Sup>−<V>x</V></Sup>
      <span style={{ padding: '0 1.4em', color: FAINT }}>→ <V>x</V> as <V>x</V> → 0,</span>
      <span style={{ color: FAINT }}>→ 1 as <V>x</V> → ∞</span>
    </Eq>

    <Note>
      <b style={{ color: INK }}>Both limits correct, and neither put in</b> —
      they are what “at least one reset” means when resets are Poisson. Every
      MOND paper picks an interpolation function by hand out of a family; this
      one picks itself out of the counting statistics of the mechanism, which is
      the difference between a fit and a derivation.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>and it is distinguishable</span>,
        <>Solving <V>μ</V>(<V>g</V>/<V>a</V><Sub>0</Sub>)·<V>g</V> ={' '}
          <V>g</V><Sub>N</Sub> for the Milky Way: at 10 kpc the Poisson form
          gives 208.7 km/s against 227.3 for <V>x</V>/(1+<V>x</V>) and 201.7 for{' '}
          <V>x</V>/√(1+<V>x</V><Sup>2</Sup>) —{' '}
          <b style={{ color: INK }}>a 25 km/s spread through the transition at
            5–20 kpc</b>, exactly where curves are best measured. SPARC-quality
          fits distinguish interpolation functions at that level.</>],
      [<span style={{ color: DERIVED }}>and the shape is distinctive</span>,
        <>1 − <V>e</V><Sup>−<V>x</V></Sup> reaches Newton much faster than either
          standard form — 0.993 at <V>x</V> = 5 against 0.833 and 0.981. So the
          model says the transition is{' '}
          <b style={{ color: INK }}>sharper than the usual fits assume</b>, which
          is a statement about the <i>inner</i> parts of galaxies rather than the
          outskirts — the opposite end from where these arguments usually
          live.</>],
      [<span style={{ color: BORROWED }}>and the mass is untouched</span>,
        <>The sheet story is about how carriers <i>travel</i>; √<V>M</V> is about
          how many of them there effectively <i>are</i>. Six of the seven
          requirements are now met and the seventh is the one the theorem says
          needs superposition to fail — a different kind of thing entirely.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>How many emitters — per body, or in the
        universe?</b> The question has a fork in it and one side is already
      settled. The root runs over <i>the body</i>, and that is forced rather
      than preferred: over the body gives{' '}
      <V>M</V><Sub>eff</Sub> ∝ √<V>M</V> and{' '}
      <V>v</V><Sup>4</Sup> ∝ <V>M</V> ✓, while over the universe gives{' '}
      <V>M</V><Sub>eff</Sub> = const and every galaxy rotating at the same speed
      whatever its mass ✗. Tully–Fisher holds across five decades with under 0.1
      dex of scatter.
    </Note>

    <Note>
      The universe total is worth having anyway, and the model fixes its own
      rather than borrowing one: a ball of radius{' '}
      <V>ct</V><Sub>0</Sub> = 4.23 Gpc, 9.32·10<Sup>78</Sup> m³, baryons
      3.92·10<Sup>51</Sup> kg —{' '}
      <b style={{ color: INK }}>2.34·10<Sup>78</Sup> emitters</b> if an emitter
      is a proton, one per 9.4·10<Sup>104</Sup> cells. The familiar
      10<Sup>80</Sup> is quoted for ΛCDM’s <i>comoving</i> observable universe,
      14.3 Gpc rather than 4.2 — a volume 39× larger, giving
      9.0·10<Sup>79</Sup>. Consistent, and a good check that the smaller ball is
      not quietly losing matter.
    </Note>

    <Note>
      √<V>N</V><Sub>universe</Sub> = 1.53·10<Sup>39</Sup>, beside the
      proton–electron electric-to-gravitational ratio of 2.27·10<Sup>39</Sup> —
      Dirac’s large numbers in Eddington’s version.{' '}
      <b style={{ color: INK }}>Recorded and not claimed.</b> The enumeration
      above measured how worthless this is: 341 of 12816 expressions land within
      10% of an arbitrary target and 20 within 1%. It is the same discipline
      that made <V>a</V><Sub>0</Sub> ≈ <V>c</V>/<V>t</V><Sub>0</Sub> worth
      something only once a <i>rule</i> produced it.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>where the universe does enter</span>,
        <>Not the count. The halo is{' '}
          <V>ρ</V> = <V>κ</V>√<V>M</V>/<V>r</V><Sup>2</Sup> and κ is fixed by{' '}
          <V>a</V><Sub>0</Sub> — 0.1067 measured, 0.0800 predicted, the ratio
          being √1.78. So{' '}
          <b style={{ color: INK }}>the root runs over the body and the
            coefficient runs over the horizon</b>: the mass scaling is local,
          the scale is cosmological, and nothing counts the universe’s
          emitters.</>],
      [<span style={{ color: BORROWED }}>but what <i>is</i> an emitter?</span>,
        <>If the root is over constituents, the answer depends on what counts as
          one. For 7·10<Sup>10</Sup> M☉:{' '}
          <V>M</V><Sub>eff</Sub>/<V>M</V> is 1.1·10<Sup>−34</Sup> per proton,
          4.0·10<Sup>−25</Sup> per Planck mass, 3.8·10<Sup>−6</Sup> per solar
          mass — <b style={{ color: INK }}>twenty-nine orders</b>. And since κ is
          fixed by <V>a</V><Sub>0</Sub>, choosing the emitter <i>is</i> choosing{' '}
          <V>a</V><Sub>0</Sub>. The mechanism cannot be agnostic about it.</>],
      [<span style={{ color: DERIVED }}>so the next concrete thing</span>,
        <>Not “how many in the universe” but <b style={{ color: INK }}>what is
          one</b>. The model already believes there is a smallest emitter — the
          ceiling is one emission a cell a tick — so that is where the count has
          to come from, and it is a question about <i>physics.ts</i> rather than
          about galaxies.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>So posit the ratio</b> — one layer-two pulse for
      every <V>x</V> of layer one’s — and check before asking why. In the
      obvious reading it fails, and the way it fails says what the rule has to
      be. <V>N</V> in, <V>N</V>/<V>x</V> out: for the output to be √<V>N</V> you
      need <V>x</V> = √<V>N</V>, so <V>x</V> is not a ratio at all — it grows
      with the body. “One in a thousand” is still <i>linear</i>, and just
      rescales the mass.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>1 for 1, or 1 for every 1000</span>,
        <><V>N</V><Sup>1</Sup> — <V>v</V><Sup>4</Sup> ∝ <V>M</V><Sup>4</Sup></>],
      [<span style={{ color: FAINT }}>1 per dead-time (saturates)</span>,
        <><V>N</V><Sup>0</Sup> — no mass dependence at all</>],
      [<span style={{ color: FAINT }}>1 per coincidence of two</span>,
        <><V>N</V><Sup>2</Sup> — the wrong way entirely</>],
      [<span style={{ color: DERIVED }}>XOR cancellation</span>,
        <><b style={{ color: INK }}><V>N</V><Sup>½</Sup></b> — the only one</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>So the root is specifically cancellation, not a
        rate ratio</b> — which is worth having, because it means the rule is
      forced rather than chosen. <i>But there is a version of the idea that
        works, and it is a ratio after all — just not of counts.</i> Let the
      trigger be <b style={{ color: INK }}>phase</b> rather than tally: one
      layer-two pulse per 2π of accumulated layer-one phase. Phase is{' '}
      <i>signed</i>, so it random-walks where a tally cannot —{' '}
      <V>N</V> pulses of ±<V>δ</V> accumulate to <V>δ</V>√<V>N</V>, giving{' '}
      <V>δ</V>√<V>N</V>/2π pulses out. <b style={{ color: INK }}>√<V>N</V>, from
        a fixed rule.</b> And the file already carries <i>phase</i> on a source,
      and <i>inStep</i> already turns on whether phases add.
    </Note>

    <Eq derive={REACH} open={show}
      note="one equation, two unknowns — and both were already owed">
      <V>M</V><Sub>2</Sub> = √(<V>M·m</V><Sub>0</Sub>)
      <span style={{ padding: '0 1.4em', color: FAINT }}>⇒</span>
      <V>m</V><Sub>0</Sub> = <Frac over={<><V>a</V><Sub>0</Sub><V>L</V><Sup>2</Sup></>} under={<V>G</V>} />
    </Eq>

    <Note>
      The effective source is the <i>geometric mean</i> of the body and the
      elementary emitter, and matching deep MOND locks the emitter to a length.
      A proton wants <V>L</V> = 3.05·10<Sup>−14</Sup> m; an electron
      7.12·10<Sup>−16</Sup>; a Planck mass 1.10·10<Sup>−4</Sup>. Going the other
      way, 2.68 fm wants a 7.24 MeV emitter.{' '}
      <b style={{ color: INK }}>Two of those are worth a second look and neither
        is a claim</b> — a Planck-mass emitter wants 0.11 mm, which is the length
      short-range gravity experiments were built to probe and the one the
      dark-energy density picks out. Recorded so they are not rediscovered later
      and mistaken for evidence.
    </Note>

    <Note>
      <b style={{ color: INK }}>What it actually buys is real.</b> Before, κ was
      one fitted number with no interpretation. Now it is{' '}
      <V>m</V><Sub>0</Sub> = <V>a</V><Sub>0</Sub><V>L</V><Sup>2</Sup>/<V>G</V> —
      a relation between two things the model already owes an opinion on:{' '}
      <i>physics.ts</i> owes a smallest emitter, since the one-a-tick ceiling
      implies one, and the sheet mechanism owes a length, being how far a locked
      plane holds. <b style={{ color: INK }}>Two separate debts, now one
        equation.</b> Fix either and <V>a</V><Sub>0</Sub> follows; fix{' '}
      <V>a</V><Sub>0</Sub> and they are locked to each other. Which is exactly
      what “check it works before asking why” was supposed to produce. Still
      missing: why phases should <i>cancel</i> rather than add — the same
      question <i>inStep</i> asks, already measured for two identical emitters,
      and never once asked of a whole body.
    </Note>

    <Note>
      <b style={{ color: INK }}>And if the universe reuses its abstractions,
        <i>inStep</i> already answers it.</b> The criterion is in the file,
      derived and measured for two identical emitters: phases hold together only
      closer than a Compton wavelength, <V>R</V> &lt; 2π/<V>m</V>, and beyond it
      they drift through every phase and cancel. For a proton that is
      1.32·10<Sup>−15</Sup> m, so a galaxy is{' '}
      <b style={{ color: INK }}>7·10<Sup>35</Sup> of them across</b> — utterly
      out of step, phases cancelling completely, surviving net √<V>N</V>. Not a
      new postulate; the model’s own criterion. Which is what “the same
      abstraction is reused” would predict, so the assumption pays for itself
      instead of costing something.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>but not for layer one</span>,
        <>The Sun is 1.19·10<Sup>57</Sup> protons, so √<V>N</V>/<V>N</V> =
          2.9·10<Sup>−29</Sup>. Gravity would be 10<Sup>−29</Sup> of itself. The
          two layers cannot read the pulse train the same way.</>],
      [<span style={{ color: DERIVED }}>one object, two observables</span>,
        <>Layer one reads the <b style={{ color: INK }}>count</b> — how many
          pulses, unsigned, which is mass. Layer two reads the{' '}
          <b style={{ color: INK }}>phase</b> — where in the cycle, signed, which
          cancels. A pulse train has both, and the file already carries both:{' '}
          <i>mass = pulse rate</i> is the count and <i>phase</i> is on the
          Source type. The abstraction <i>is</i> shared; only the aspect coupled
          to differs.</>],
      [<span style={{ color: DERIVED }}>which may mean there is no second layer</span>,
        <>If layer two is the <i>phase</i> of layer one’s pulses, it is the same
          graph read differently rather than a new one over it. That removes the
          part hardest to justify — a second set of emitters with their own
          gravity — and explains why the coupling had to be two-way, since a
          phase cannot be independent of the pulses carrying it.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>And is it the charge of an electron? Probably
        not — and not for the obvious reason.</b> The composition test is too
      weak to settle it: charges per kilogram are 1.196·10<Sup>27</Sup> for
      hydrogen and 1.029·10<Sup>27</Sup> at <V>Y</V> = 0.28, a 2.3% spread
      across the real range, which is 0.57% in <V>v</V> — twenty times under
      Tully–Fisher’s own scatter. In ordinary matter charge and mass are
      proportional to better than a percent.
    </Note>

    <Note>
      <b style={{ color: INK }}>What kills it is the opposite end.</b> If layer
      two were charge, a body of <i>neutral</i> constituents would get no halo
      at all. But the most dark-dominated systems known — clusters and dwarf
      spheroidals — show the <i>largest</i> discrepancies, and they are the ones
      with the fewest charges per unit mass. The mechanism predicts exactly the
      reverse ordering. The phase reading is better here too:{' '}
      <b style={{ color: INK }}>a phase belongs to every pulse</b>, so every
      gram of anything has one, charged or not — and the halo goes to all matter
      equally, which is what is observed.
    </Note>

    <Head>and then it was tested</Head>

    <Note>
      <b style={{ color: INK }}>Test A — do the model’s own phases cancel to
        √<V>N</V>?</b> Not assumed random: <i>inStep</i> says two emitters differ
      in phase by <V>ω</V>Δ<V>r</V>/<V>c</V> = <V>m</V>Δ<V>r</V>. So{' '}
      <V>N</V> emitters at random places in a ball of radius <V>R</V>, each given
      the phase its position implies, summed. At{' '}
      <V>mR</V> = 10<Sup>−2</Sup> the sum is 1.000·10<Sup>3</Sup> out of
      10<Sup>3</Sup> — fully coherent. At <V>mR</V> = 10<Sup>4</Sup> it is
      3.164·10<Sup>2</Sup> against √<V>N</V> = 3.16·10<Sup>2</Sup> —{' '}
      <b style={{ color: INK }}>exactly the root</b>, with the crossover at{' '}
      <V>mR</V> ≈ 2π where <i>inStep</i> puts it. The √<V>M</V> half is real,
      and it is not an assumption about randomness.
    </Note>

    <Note>
      <b style={{ color: INK }}>Test B — does locking to a plane change the
        radial law? It does not.</b> Carriers from a point, turning by a small
      angle each step, locked to one transverse direction or free in two:
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>turn 0.002/step</span>,
        <>locked −2.000, free −2.000 — difference <b style={{ color: INK }}>0.000</b></>],
      [<span style={{ color: FAINT }}>turn 0.010/step</span>,
        <>locked −2.000, free −1.998 — difference 0.002</>],
      [<span style={{ color: FAINT }}>turn 0.050/step</span>,
        <>locked −1.964, free −1.929 — difference 0.034</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Locked and free agree to three decimal
        places.</b> The number of transverse directions makes no difference to
      the radial law at all — and the reason is{' '}
      <i>flux conservation</i>, which sideways wandering cannot beat.{' '}
      <V>N</V> carriers leave, <V>N</V> cross every sphere, the sphere has area
      4π<V>r</V><Sup>2</Sup>. The 1/<V>r</V> appears only when the walk turns{' '}
      <i>diffusive</i>, because then radial progress slows as{' '}
      <V>cλ</V>/2<V>r</V> — and diffusion needs <i>many</i> resets, not few.
      (A first run of this had the per-step turn at 0.25 rad, so every case had
      already diffused and all four came out identical; and a fourth row at 0.2
      gives −3.2 and −5.4, which is a truncation artefact rather than a
      measurement of the diffusive slope.)
    </Note>

    <Note>
      <b style={{ color: INK }}>So the sheet claim was wrong, and it is worth
        saying where.</b> “The plane holds the carrier’s own line, so only the
      widening flattens” does not give 1/<V>r</V>; widening does not touch the
      radial profile. The permutation search two steps earlier had this right —
      dense → 1/<V>r</V>, thin → 1/<V>r</V><Sup>2</Sup>,{' '}
      <i>sign backwards</i> — and the sheet story talked its way out of a correct
      result. The simulation puts it back.{' '}
      <b style={{ color: INK }}>That retires the 2D transport mechanism</b>, and
      with it the <V>a</V><Sub>0</Sub> prediction that rode on it and the derived
      interpolation function, both of which assumed the locking worked. They are
      kept above as a route that was tried, not as results.
    </Note>

    <Note>
      <b style={{ color: INK }}>What survives is Test A.</b> Phase cancellation
      is real, measured, and follows from the model’s own <i>inStep</i> rather
      than from a new assumption — so the √<V>M</V> half stands on its own. The
      radial law is unexplained again, and the obstruction is exactly what it was
      before any of this: <V>n</V> ∝ 1/<V>r</V> needs the carriers to slow, and
      everything in this model moves at <V>c</V>. (The caught pair, later,
      supplies that radial law from a different direction — so what follows is
      about the <i>other</i> half.)
    </Note>

    <Head>test C — could √M come from the vacuum instead?</Head>

    <Note>
      Test A’s cancellation is a cancellation of <i>phases</i>, and it needs the
      source to be an <b style={{ color: INK }}>amplitude</b> — a coherent sum —
      rather than a count. Gravity here is a <i>rate</i> of annihilations, and
      rates do not cancel. So the obvious thing to try is a cancellation that
      works on counts: <b style={{ color: INK }}>a body’s own charges
        annihilating each other on the way out</b>. Emit <V>N</V> pairs a tick
      from a ball, let every + and − landing in the same cell annihilate, count
      what crosses a distant sphere. Nothing assumed about randomness — the
      charges are moved and met.
    </Note>

    <Note>
      <b style={{ color: INK }}>It does cancel, and an optical depth controls
        it.</b> The surface density of a body’s own charges is ~2<V>N</V>/4π<V>R</V><Sup>2</Sup>{' '}
      per tick over a path ~<V>R</V>, so <V>τ</V> = <V>N</V>/(2π<V>R</V>) with{' '}
      <V>R</V> in cells — and the measured survival collapses onto it exactly.
      Three <V>N</V>,<V>R</V> pairs spanning sixteenfold in <V>N</V> give
      52.0 / 49.4 / 51.0% at <V>τ</V> = 1.06, and 19.9 / 19.2 / 19.7% at 6.37.
    </Note>

    <Note>
      <b style={{ color: INK }}>And it passes through √<V>N</V> without stopping
        there</b>, which is the finding. The exponent d(log <V>F</V>)/d(log{' '}
      <V>N</V>) runs 0.920 at <V>τ</V> = 0.13, 0.734 at 0.80,{' '}
      <b style={{ color: INK }}>0.563 at 1.99</b>, then 0.421, 0.273, 0.244. It
      is not a plateau at ½ — it slides continuously from 1 toward 0 and touches
      ½ at <V>τ</V> ≈ 2.5 on the way past. Tully–Fisher needs the <i>same</i>{' '}
      exponent across five decades of mass, and <V>τ</V> ∝ <V>M</V>/<V>R</V>{' '}
      varies across those decades. A crossover cannot impersonate a power law.
    </Note>

    <Note>
      And it is moot anyway, because nothing real is dense enough. A proton sits
      at <V>τ</V> = 4·10<Sup>−39</Sup>, the Earth 2·10<Sup>−9</Sup>, the Milky
      Way 5·10<Sup>−7</Sup>, the Sun 5·10<Sup>−6</Sup>.{' '}
      <b style={{ color: INK }}>Every real body is dilute</b> — its own flux
      never meets itself, survival is 100%, and the flux goes as <V>N</V>{' '}
      exactly. A galaxy is thirteen orders below where the cancellation starts,
      which is the same fact <K>shows</K> reports from the other side.
    </Note>

    <Note>
      <b style={{ color: INK }}>The one place it could ever bite is a neutron
        star</b>, at <V>τ</V> = 0.44 — the only object within an order of the
      threshold. So the mechanism is not nothing. It is a statement about the
      densest matter there is, and it has nothing whatever to say about rotation
      curves.
    </Note>

    <Note>
      Which leaves Test A alone, and sharpens what it owes.{' '}
      <b style={{ color: INK }}>The radial law is supplied</b> — the caught pair.{' '}
      <b style={{ color: INK }}>The cancellation is supplied</b> — Test A,
      measured. What is missing is one thing and it can now be stated in a line:{' '}
      <b style={{ color: INK }}>a reason for a rate to care about a phase.</b>
    </Note>

    <Head>test D — and there is a reason, the wrong way round</Head>

    <Note>
      There is a candidate, and it is structurally the right shape:{' '}
      <b style={{ color: INK }}>in this model a rate and a phase are the same
        variable</b>. Mass is a <i>period</i> — <V>X</V> = 1/<V>m</V> ticks
      between pulses — so the emission rate is the thing carrying the phase. And
      gravity makes a body lighter,{' '}
      <V>m</V><Sub>eff</Sub> = <V>m</V>/(1+<V>u</V>), so the well modulates it
      and the two feed each other. Two pieces, both testable.
    </Note>

    <Note>
      <b style={{ color: INK }}>The first fails on size.</b> For the well to
      move a body across <i>inStep</i>’s switch, <V>m</V> must fall by{' '}
      <V>m</V>·<V>R</V>/2π. At the Sun’s surface <V>u</V> = 2.1·10<Sup>−6</Sup>{' '}
      against a factor 8.4·10<Sup>24</Sup> needed; in the Galaxy at 8 kpc,
      3.7·10<Sup>−7</Sup> against 3.0·10<Sup>36</Sup>.{' '}
      <b style={{ color: INK }}>Forty-three orders short</b> where it matters.
      Gravity does make things lighter and cannot make them lighter enough to
      change what they cancel to.
    </Note>

    <Note>
      <b style={{ color: INK }}>The second works</b>, and does not need the
      first. If emission is <i>pulsed</i> rather than steady, two charges meet
      only when their bunches arrive together — so the meeting rate really does
      depend on relative phase. Measured at fixed average emission, varying only
      the spread of the phases: steady gives 28.2% survival; period 16{' '}
      <i>all in step</i> gives <b style={{ color: INK }}>17.4%</b>; period 16
      with random phases gives <b style={{ color: INK }}>28.5%</b>. Bunching
      cancels, and only in step — random phases smooth out completely and are
      indistinguishable from a steady source to a tenth of a percent.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>Test A’s √<V>N</V> needs them OUT of step</span>,
        <><V>m</V>·<V>R</V> ≫ 2π — phases spread over many wavelengths, so the
          coherent sum falls to √<V>N</V>.</>],
      [<span style={{ color: DERIVED }}>Test D’s cancellation needs them IN step</span>,
        <><V>m</V>·<V>R</V> ≪ 2π — bunches arriving together, so the arrivals
          annihilate each other instead of being tallied.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>They are the same condition read in opposite
        directions, so no body can have both.</b> A galaxy sits at{' '}
      <V>m</V>·<V>R</V> ≈ 3·10<Sup>36</Sup>: its phases cancel beautifully and
      its rate does not notice — which is exactly what Test C found from the
      other side. Anything coherent enough for the rate to care is smaller than
      a Compton wavelength and has nothing left to cancel. And even where it does
      care it overshoots: quadrupling the mass in step gives a slope of 0.243,
      against 0.35 out of step. Past ½ again, toward saturation.
    </Note>

    <Note>
      So where <i>coherence</i> is concerned the bridge is missing because the
      model makes the two requirements exclusive.{' '}
      <b style={{ color: INK }}>But that tested the wrong variable, and the next
        section overturns the conclusion.</b> Everything above asks whether the
      feedback can move a body across <i>inStep</i>’s switch. It cannot — and it
      does not have to.
    </Note>

    <Head>test E — and it works, with no phase in it at all</Head>

    <Note>
      Stated so it can be tested rather than argued:{' '}
      <b style={{ color: INK }}>the loop feeds itself but by less each round.</b>{' '}
      More fold makes a body lighter, lighter makes fewer pulses, fewer pulses
      make less fold. A <i>self-limiting</i> feedback, and a self-limiting
      feedback has a fixed point —{' '}
      <V>M</V><Sub>eff</Sub> = <V>N</V>/(1 + <V>κM</V><Sub>eff</Sub><Sup>p</Sup>),
      giving <V>M</V><Sub>eff</Sub> ∝ <V>N</V><Sup>1/(1+p)</Sup>. So everything
      turns on <V>p</V>, and <V>p</V> is not a choice: it is what the
      annihilation counting gives. So it was measured.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>measured <V>p</V> = 1.075</span>,
        <>Emitters at the ceiling, slowed each round by the fold their own
          charges built, iterated to a fixed point. The source slope runs 0.668,
          0.530, <b style={{ color: INK }}>0.478</b> as <V>N</V> quadruples, and{' '}
          <V>p</V> = d(log <V>u</V>)/d(log source) comes out 1.075 — predicting
          an exponent of 0.482.</>],
      [<span style={{ color: DERIVED }}>and the fixed point is exact</span>,
        <>Solved directly over six decades: <V>p</V> = ½ gives 0.6671,{' '}
          <V>p</V> = 1 gives <b style={{ color: INK }}>0.5000</b>, <V>p</V> = 2
          gives 0.3333 — against 2/3, 1/2, 1/3 predicted.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>So this is not a crossover.</b> Tests C and D
      gave exponents that slid <i>past</i> ½ on the way to saturation, which is
      why neither could carry Tully–Fisher. This one{' '}
      <b style={{ color: INK }}>converges on ½ and stays</b>, because ½ is a
      fixed point of the loop rather than a point on a curve. And{' '}
      <V>p</V> = 1 — the fold at an emitter going linearly with what its body
      emits — is exactly what gives ½, and <V>p</V> = 1 is what was measured.
    </Note>

    <Note>
      <b style={{ color: INK }}>The one thing in the way is the scale, and it is
        seven orders, not forty-three.</b> The loop bites once <V>u</V> ≳ 1.
      Read with <V>u</V> as the Newtonian potential, a proton sits at
      1.5·10<Sup>−39</Sup> and the Milky Way at 2.0·10<Sup>−7</Sup> — exponent
      1.000000 — while a neutron star reaches 0.87 and a body at its own{' '}
      <V>r</V><Sub>s</Sub> reaches 0.75.
    </Note>

    <Note>
      <b style={{ color: INK }}>And <V>u</V> is not the Newtonian potential
        here</b>, which is the whole point. This file already says so and files
      it as a <i>defect</i>: <K>MADE</K> is a rate, so the fold{' '}
      <i>accumulates</i> — <V>m</V>·<K>SHEET</K>·<V>t</V>/<V>r</V> passes{' '}
      <V>Gm</V>/<V>r</V> after 0.008 ticks and keeps going. Over the age that is
      a factor of 1.04·10<Sup>63</Sup>, which puts the proton at
      1.5·10<Sup>24</Sup>, the Sun at 2.2·10<Sup>57</Sup>, the Milky Way at
      2.1·10<Sup>56</Sup> — <b style={{ color: INK }}>every body at exactly ½,
        and at the same ½</b>. One exponent, unchanging across five decades,
      which is what Tully–Fisher demands and no crossover can supply.
    </Note>

    <Note>
      <b style={{ color: INK }}>So the defect and the mechanism are the same
        fact.</b> The accumulating fold was written down as the reason the{' '}
      <K>MADE</K> account could not be wired in; it is also the only thing that
      puts real bodies where the feedback gives √<V>M</V>. One of those two
      readings is wrong, and they cannot both stand.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>which channel</span>,
        <>A √<V>M</V> source on the <i>direct</i> 1/<V>R</V><Sup>2</Sup> channel
          makes gravity weaker, not stronger, and would show in the solar system.
          It helps only if it scales the caught pair’s 1/<V>R</V> channel while
          Newton’s keeps its count — and nothing here says why two channels would
          couple to different things.</>],
      [<span style={{ color: BORROWED }}>what stops it</span>,
        <>An unbounded accumulating fold sends{' '}
          <V>m</V><Sub>eff</Sub> → 0: every body fades. The fixed point above is
          one in <V>N</V> at fixed <V>κt</V>, and the <V>t</V>-dependence has not
          been solved at all.</>],
      [<span style={{ color: BORROWED }}>and the solar system</span>,
        <>If <V>u</V> really is 10<Sup>57</Sup> at the Sun then <K>slowing</K>,{' '}
          <K>thickness</K> and every GR test in this file are computed from the
          wrong <V>u</V> — and those pass. That is the sharpest objection to the
          accumulating reading and it is not answered here.</>],
    ]} />

    <Note>
      None of which retracts the measurement.{' '}
      <b style={{ color: INK }}>The self-limiting loop gives an exponent of
        exactly ½, as a fixed point, out of the model’s own two rules</b> — mass
      is a period, and fold slows the period. It is the first mechanism in this
      file that <i>produces</i> the mass law rather than approaching it.
    </Note>

    <Head>and which slowing is it?</Head>

    <Note>
      There are two readings of that chain, and they give <i>different</i>{' '}
      exponents — so for once the data can choose. Test E slowed the emitter by
      the <b style={{ color: INK }}>fold</b> it sits in. The other reading is the
      model’s own speed rule, and is arguably the more native one:{' '}
      <i>it accelerates → it goes faster → it moves on more ticks and updates on
        fewer → it ticks less → it is lighter → it pulls less → it accelerates
        less.</i> Same self-limiting shape, but driven by <K>massFor</K> rather
      than <K>slowing</K>.
    </Note>

    <Note>
      The exponent comes from how the driver scales with the source, and that is
      where they part company. <V>M</V><Sub>eff</Sub> ∝{' '}
      <V>N</V><Sup>1/(1+p)</Sup>, measured over six decades and converged to
      five figures: the fold gives <V>p</V> = 1 and{' '}
      <b style={{ color: INK }}>0.50000</b>; speed gives <V>p</V> = ½ and{' '}
      <b style={{ color: INK }}>0.66667</b> — because{' '}
      <V>v</V><Sup>2</Sup> = <V>GM</V>/<V>r</V>, so{' '}
      <b style={{ color: INK }}>speed already carries its own square root</b>,
      and a feedback driven by it can only spend that root once.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>no feedback — <V>e</V> = 1</span>,
        <>Tully–Fisher slope 2.00. <b style={{ color: INK }}>20.6σ</b> out.</>],
      [<span style={{ color: BORROWED }}>speed as driver — <V>e</V> = 2/3</span>,
        <>Slope 3.00. <b style={{ color: INK }}>9.4σ</b> out.</>],
      [<span style={{ color: DERIVED }}>fold as driver — <V>e</V> = 1/2</span>,
        <>Slope 4.00 against a measured 3.85 ± 0.09 —{' '}
          <b style={{ color: INK }}>1.7σ</b>, i.e. inside the error.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>The fold reading lands inside 2σ and the speed
        reading does not.</b> So the chain is right and the driver has to be the
      one that scales <i>linearly</i> with the source. That is a real
      discrimination between two versions of one idea, made by data rather than
      by preference — and the first time anything in this file has been able to
      choose between two mechanisms on the mass law.
    </Note>

    <Note>
      And the speed reading is too small anyway, independently of its exponent.{' '}
      <V>v</V>/<V>c</V> is the whole size of it: 9.9·10<Sup>−5</Sup> at the
      Earth’s orbit, 7.6·10<Sup>−4</Sup> for the Sun round the Galaxy,
      3.3·10<Sup>−3</Sup> in a cluster. Run on the Milky Way it slows the curve
      by 0.06% at 2 kpc and 0.02% at 30, where the discrepancy is a factor of
      two. <b style={{ color: INK }}>The sign is right and nothing else is</b> —
      the same verdict <K>carry</K> got, for the same reason.
    </Note>

    <Note>
      What survives of it: the speed rule is not the driver of the mass law, but
      it shows the two readings are not interchangeable, and it explains{' '}
      <i>why</i> the fold reading works —{' '}
      <b style={{ color: INK }}>the feedback needs a driver that has not already
        spent the square root</b>, and the accumulated fold is the only such
      quantity the model has.
    </Note>

    <Head>test F — and then it was run on a whole galaxy</Head>

    <Note>
      Tests C, D and E were boxes of a few thousand cells, or transients begun
      from nothing at <V>t</V> = 0. A galaxy is neither. So it was rebuilt: the
      real Milky Way baryons ring by ring with no shell theorem,{' '}
      <b style={{ color: INK }}>the field solved as a fixed point rather than a
        transient</b> — every source weakened by the field it sits in, that field
      made by all the already-weakened sources, iterated to convergence, which is
      what “gravity has already propagated everywhere” has to mean — and the
      circular speed at every radius solved <i>together with</i> the field, so a
      speed-driven feedback is fed the speed it actually produces.
    </Note>

    <Note>
      <b style={{ color: INK }}>First, the thing that settles the speed question
        outright</b>, and it is more general than any exponent. Pushed to{' '}
      <V>κ</V> = 10<Sup>6</Sup>, far past anything physical, with the galaxy’s
      own self-consistent speeds, the curve at the Sun goes 185.6 → 180.9 →
      102.2 → 66.2.{' '}
      <b style={{ color: INK }}>A feedback that weakens the source can only lower
        a rotation curve.</b> Monotone in <V>κ</V>, and it never turns around. So
      the feedback is not the dark matter and cannot be — it can only govern how
      an excess supplied by something <i>else</i> scales with mass.
    </Note>

    <Note>
      So the honest object is the pair: the caught pair’s 1/<V>R</V> channel
      supplying the excess, the feedback setting its mass scaling. Two
      requirements at once — the <b style={{ color: INK }}>shape</b> of one
      rotation curve, and the <b style={{ color: INK }}>slope</b> across five
      decades of galaxy mass with sizes following the observed{' '}
      <V>R</V> ∝ <V>M</V><Sup>0.35</Sup>. Five drivers, three channel choices,
      local or body-averaged, eight couplings.{' '}
      <b style={{ color: INK }}>No permutation meets both.</b>
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>caught pair alone</span>,
        <>shape <b style={{ color: INK }}>3.2%</b>, BTFR slope 2.51.</>],
      [<span style={{ color: FAINT }}>+ feedback, <V>κ</V> = 10<Sup>6</Sup></span>,
        <>shape 9.7%, slope 2.92.</>],
      [<span style={{ color: BORROWED }}>+ feedback, saturated</span>,
        <>shape 19.8%, slope <b style={{ color: INK }}>3.25</b> — and the curve
          now <i>rises</i>: <V>v</V>(30) = 264.9 against <V>v</V>(8) = 229, where
          Gaia has it falling.</>],
      [<span style={{ color: INK }}>wanted</span>,
        <>shape under 5%, slope 3.85 ± 0.09. The best joint fit anywhere in the
          search is <b style={{ color: INK }}>6.7σ</b> away.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Which corrects Test E, and the correction is the
        point.</b> Test E measured the exponent on what was effectively a point
      source and got exactly ½; that stands as arithmetic. What it could not see
      is that <i>reaching</i> the regime where the exponent is ½ needs{' '}
      <V>κu</V> ≫ 1 throughout the galaxy — and a <V>u</V> that varies by an
      order of magnitude across the disc cannot be deep in that regime everywhere
      without deforming the profile.{' '}
      <b style={{ color: INK }}>The fixed point is real and it is not reachable
        with a rotation curve still attached.</b>
    </Note>

    <Note>
      (One bug found on the way, recorded because it changed a number: the bulge
      was being added <i>unweakened</i>. At large <V>κ</V> the disc was crushed
      and the untouched bulge dominated, dragging the slope back to Newton’s 2.07
      and making the feedback look useless in the wrong direction. Weakened
      consistently — a bulge is made of emitters too — the slope rises to 3.25
      instead. The conclusion did not change; the number was wrong.)
    </Note>

    <Note>
      So: <b style={{ color: INK }}>the chain is sound</b>, self-limiting, with a
      real fixed point. <b style={{ color: INK }}>The exponent is right in
        isolation</b>, ½, measured twice.{' '}
      <b style={{ color: INK }}>The shape is supplied</b>, by the caught pair, at
      3.2%. <b style={{ color: INK }}>And they cannot be had together.</b> That
      is not a gap in the argument — it is a measured incompatibility between the
      two halves, on a galaxy, with the field relaxed and one number fitted. The
      model still has no dark matter; what is different is that it is no longer
      missing a mechanism. It has two, each doing its own half correctly, and a
      demonstration that they do not compose.
    </Note>

    <Head>test G — they do compose</Head>

    <Note>
      <b style={{ color: INK }}>That last sentence is withdrawn, and the fault
        was in the test.</b> Every feedback above was written{' '}
      <V>m</V>/(1+<V>κD</V>), which <i>saturates</i>: past <V>κD</V> ≫ 1 it stops
      responding and the exponent stalls wherever it happened to be. That form
      was mine. It is nowhere in the model. The model’s own conversion is a{' '}
      <i>power law</i>, and a power law never saturates:{' '}
      <b style={{ color: INK }}><K>massFor</K>(<V>v</V>) = <V>c</V>/<V>v</V></b>,
      so <V>m</V> ∝ 1/<V>v</V> exactly.
    </Note>

    <Note>
      So the honest test is <V>m</V><Sub>eff</Sub> ∝ <V>v</V><Sup>−q</Sup>{' '}
      solved self-consistently, with <b style={{ color: INK }}><V>q</V> = 1 being
        the model’s own rule and not a fitted exponent</b>. The expectation is
      clean: for the caught pair’s flat channel{' '}
      <V>v</V><Sup>2</Sup> = <V>λM</V><Sub>eff</Sub> ∝ <V>λN</V><V>v</V><Sup>−q</Sup>,
      so <V>v</V><Sup>2+q</Sup> ∝ <V>N</V> and the Tully–Fisher slope is{' '}
      <b style={{ color: INK }}>2 + <V>q</V></b>.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}><V>q</V> = 0 — caught pair alone</span>,
        <>shape 3.2%, slope 2.51.</>],
      [<span style={{ color: DERIVED }}><V>q</V> = 1 — the model’s <K>massFor</K></span>,
        <>shape <b style={{ color: INK }}>2.6%</b>, slope{' '}
          <b style={{ color: INK }}>3.60</b>. Both halves improve at once — the
          shape is <i>better</i> than the caught pair had alone.</>],
      [<span style={{ color: FAINT }}><V>q</V> = 2</span>,
        <>shape 1.1%, slope 4.58 — overshoots.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>They are not in tension; each helps the other</b>,
      which is what a composition ought to look like and what Test F said was
      impossible. Against Gaia radius by radius, on one fitted number: 0.991 at
      6 kpc, 0.999 at 8, 0.985 at 12, 0.964 at 20, 0.990 at 30 —{' '}
      <b style={{ color: INK }}>inside 3.6% from 6 to 30 kpc</b>, where Newton is
      short by 52% and 242% at the two ends.
    </Note>

    <Note>
      And the slope’s remaining gap is <i>my</i> systematic, not the model’s.
      3.60 against 3.85 ± 0.09 is 2.8σ — but the galaxy family is my
      construction, and its assumed size–mass relation moves the answer further
      than the discrepancy does: <V>R</V> ∝ <V>M</V><Sup>0.20</Sup> gives 3.31,{' '}
      <V>M</V><Sup>0.35</Sup> gives 3.60, <V>M</V><Sup>0.50</Sup> gives 4.03.{' '}
      <b style={{ color: INK }}>The measured 3.85 sits inside that range</b>, at{' '}
      <V>s</V> ≈ 0.42.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>the sign of the identity</span>,
        <>Which decides everything. <K>massFor</K> is a <i>cost</i> per step and
          is ≥ 1; the emission side is a <i>rate</i> and is ≤ 1, and{' '}
          <code>physics.ts</code> bridges them with “once a tick is the ceiling,
          which <i>turns the identity round</i>”. If the rate is <V>m</V> the
          source goes as 1/<V>v</V> and <V>q</V> = +1, giving 3.60. If it is
          1/<V>m</V> the source goes as <V>v</V> and <V>q</V> = −1, giving{' '}
          <b style={{ color: INK }}>1.30</b>. The whole result rides on a reading
          this file asserted in one direction and used in the other.</>],
      [<span style={{ color: BORROWED }}><V>λ</V> is still fitted</span>,
        <>One number, but nothing derives it — so until something does, this is a
          one-parameter fit that happens to have the right shape.</>],
      [<span style={{ color: BORROWED }}>and the density bill stands</span>,
        <>The <V>Φ</V> that makes <V>λ</V> this big puts the range of gravity at
          5·10<Sup>−32</Sup> m. Nothing here answers that, and it is still the
          reason the mechanism cannot yet be believed.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>But the composition is real and it was
        measured.</b> Two mechanisms, each derived for its own reason, one fitted
      constant between them, and both the shape of a rotation curve and the mass
      scaling of a population come out together. That has not happened before in
      this file. <b style={{ color: INK }}>And then the sign was settled, against
        it.</b>
    </Note>

    <Head>test H — settling the sign</Head>

    <Note>
      Test G rode entirely on reading <K>massFor</K>(<V>v</V>) = <V>c</V>/<V>v</V>{' '}
      as the emission rate. Take the model’s own account of what a step costs —{' '}
      <b style={{ color: INK }}>a step takes a point from in front and puts one
        behind, so a step costs a tick</b> — and the budget is forced:
      the share of ticks spent moving plus the share spent updating is one, so
      the pulse rate goes as (1 − <V>v</V>/<V>c</V>). Which is not{' '}
      <V>c</V>/<V>v</V>, and the difference is everything.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>source ∝ 1/<V>v</V> (test G)</span>,
        <>weakening of order one — shape 2.6%, slope 3.60.</>],
      [<span style={{ color: DERIVED }}>source ∝ (1−<V>v</V>/<V>c</V>) — the budget</span>,
        <>weakening of <b style={{ color: INK }}>0.076%</b> — shape 3.2%, slope{' '}
          <b style={{ color: INK }}>2.509</b>. Which is the caught pair alone, to
          three digits.</>],
    ]} />

    <Note>
      And <K>massFor</K> cannot be pressed into service instead, for a reason
      that is structural rather than numerical.{' '}
      <b style={{ color: INK }}>It is a cost per step and is ≥ 1; the emission
        side is a rate and is ≤ 1 by the one-a-tick ceiling.</b> Disjoint ranges,
      meeting only at exactly 1. There is no reading on which a star’s
      constituents, orbiting at 7.6·10<Sup>−4</Sup> <V>c</V>, have an emission
      rate of 1362 pulses a tick against a ceiling of one. Test G’s exponent was
      never available — it was reading a <i>cost</i> as a <i>rate</i> because
      this file calls both of them “mass”.
    </Note>

    <Note>
      <b style={{ color: INK }}>So Test G is withdrawn as a result.</b> What
      survives is its method and one real lesson: a <i>saturating</i> feedback
      and a <i>power-law</i> one behave completely differently, and Test F’s
      failure was the saturating form’s fault. That correction stands. The 3.60
      does not.
    </Note>

    <Head>and what that leaves standing</Head>

    <Note>
      The transport route — and it needs none of this.{' '}
      <b style={{ color: INK }}>Its √<V>M</V> does not come from the source at
        all</b>: flux conservation goes <i>quadratic</i> in <V>n</V> once the
      drift is <V>v</V> = <V>c</V>·min(1, <V>n</V>/<V>n</V><Sub>c</Sub>), and the
      root falls out of the transport. Its sign is fixed by <K>inStep</K> read as
      a budget — in step, one phase paid once, so dense is fast — rather than by
      identifying two incompatible masses. And it had never been run on a galaxy.
      Run now, on the relaxed disc:
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}><V>g</V><Sub>c</Sub> = 1.2·10<Sup>−10</Sup> m/s²</span>,
        <>shape <b style={{ color: INK }}>1.0%</b>, slope 3.43. The best shape any
          mechanism in this file has managed — and that <V>g</V><Sub>c</Sub> is{' '}
          <V>a</V><Sub>0</Sub>.</>],
      [<span style={{ color: FAINT }}>either side of it</span>,
        <>1.0·10<Sup>−10</Sup> gives 2.5%, 1.5·10<Sup>−10</Sup> gives 4.8% — so
          the fit is real but not sharp.</>],
    ]} />

    <Note>
      So the three routes, honestly: the caught pair alone gives 3.2% and 2.51,
      and owes a density that kills gravity at 5·10<Sup>−32</Sup> m. The source
      feedback is <b style={{ color: BORROWED }}>retired</b>. And the transport
      route gives <b style={{ color: INK }}>1.0% and 3.43</b>, owing{' '}
      <i>one number</i>: <V>n</V><Sub>c</Sub> = (<V>m</V>/2π)<Sup>3</Sup> wants
      an emitter at <b style={{ color: INK }}>28.9 MeV</b>, where the electron
      gives 5.5·10<Sup>−6</Sup> of what is needed and the proton
      3.4·10<Sup>4</Sup>.
    </Note>

    <Note>
      <b style={{ color: INK }}>The transport route is the one to back.</b> It is
      the only one whose sign is derived rather than asserted, it needs no new
      rule — <K>inStep</K> was already derived and measured — it gives both halves
      from one mechanism, and its single bill is a number rather than a
      structure. Either something sits near 29 MeV, or the Compton wavelength
      that matters belongs to the <i>carrier</i> and not to the source. That is
      one question, it is about <code>physics.ts</code>, and the whole dark-matter
      thread now hangs off it.{' '}
      <b style={{ color: INK }}>And it was the wrong question.</b>
    </Note>

    <Head>test I — the scale comes from the expansion</Head>

    <Note>
      The 29 MeV bill came from setting <V>n</V><Sub>c</Sub> by a{' '}
      <i>constituent’s</i> Compton wavelength — looking for the scale in the
      wrong place, and the whole model says so.{' '}
      <b style={{ color: INK }}>Space being made is the mechanism.</b> Making
      space has a rate, that rate is <V>H</V>, and an acceleration built out of
      it is <V>cH</V>. The frontier already forces{' '}
      <V>H</V><Sub>0</Sub> = 1/<V>t</V><Sub>0</Sub> exactly, so <V>cH</V><Sub>0</Sub>{' '}
      is a <i>count of ticks</i> rather than a constant anyone chose. And the 2π
      is <K>inStep</K>’s own, since in step means within 2π of phase.
    </Note>

    <Eq open={show} note="the acceleration scale, from the expansion alone">
      <V>a</V><Sub>0</Sub> = <Frac over={<><V>c</V> <V>H</V><Sub>0</Sub></>} under={<>2π</>} />
    </Eq>

    <Rows of={[
      [<span style={{ color: DERIVED }}>the prediction</span>,
        <>1.041·10<Sup>−10</Sup> at <V>H</V><Sub>0</Sub> = 67.4,{' '}
          <b style={{ color: INK }}>1.096·10<Sup>−10</Sup></b> at 70.9,
          1.129·10<Sup>−10</Sup> at 73.0 — against a measured
          1.200·10<Sup>−10</Sup>. <b style={{ color: INK }}>Nine percent, with
            nothing fitted anywhere.</b></>],
      [<span style={{ color: DERIVED }}>and on the galaxy</span>,
        <>Run with the predicted value and no fitting of any kind:{' '}
          <b style={{ color: INK }}>1.1% on the Milky Way’s rotation curve</b>,
          Tully–Fisher slope 3.42. Radius by radius, 0.977 · 0.997 · 0.999 ·
          0.995 · 0.987 · 0.987 · 1.002 · 1.028 from 6 to 30 kpc, where Newton
          runs 0.83 down to 0.54.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Which retires the 29 MeV bill entirely.</b> It
      was the price of assuming the coherence scale belonged to a constituent. It
      belongs to the expansion — which this model has its own account of — and
      the two numbers agree to nine percent without either being adjusted to meet
      the other.
    </Note>

    <Note>
      <b style={{ color: INK }}>And this is where the frontier cosmology earns
        its keep.</b> <V>a</V><Sub>0</Sub> ≈ <V>c</V>/(2π<V>t</V><Sub>0</Sub>) is
      a known coincidence and an embarrassment everywhere else — why should a
      galaxy know the age of the universe? Here{' '}
      <V>H</V><Sub>0</Sub> = 1/<V>t</V><Sub>0</Sub> is not a coincidence but the
      construction, so the galaxy is not being told the age. It is being told the
      rate at which space is made, which is the same number because the frontier
      makes it so. <b style={{ color: INK }}>The cosmology and the rotation
        curves are the same fact.</b>
    </Note>

    <Note>
      And it predicts something MOND cannot, which is the point of having a
      reason. <V>a</V><Sub>0</Sub> = <V>c</V>/(2π<V>t</V>) is{' '}
      <i>not a constant</i> — it falls as the universe ages:
      2.19·10<Sup>−10</Sup> at <V>z</V> = 1, 3.29·10<Sup>−10</Sup> at{' '}
      <V>z</V> = 2, 5.48·10<Sup>−10</Sup> at <V>z</V> = 4. MOND has no reason for{' '}
      <V>a</V><Sub>0</Sub> to depend on anything and treats it as a constant of
      nature. <b style={{ color: INK }}>This route makes it a clock reading</b>,
      so high-redshift rotation curves are a direct test.
    </Note>

    <Note>
      <b style={{ color: BORROWED }}>And the first look at that test is not
        comfortable.</b> Genzel et al. (2017) find massive discs at{' '}
      <V>z</V> ≈ 2 with <i>declining</i> outer rotation curves — baryon-dominated,
      less of a dark-matter effect, not more. A larger{' '}
      <V>a</V><Sub>0</Sub> pushes more of a galaxy into the deep regime and
      predicts a <i>larger</i> one. The two pull opposite ways. Not immediately
      contradictory, since high-<V>z</V> discs are denser and{' '}
      <V>g</V><Sub>N</Sub> rises too and what matters is the ratio — but the sign
      of the tension is the wrong one, and it has not been worked out here.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>the one link</span>,
        <>Unchanged since it was first written down: that a carrier’s update cost
          goes as its accumulated phase. Everything in the transport route rests
          on it, and it is a <code>physics.ts</code> question about what a tick
          is spent on.</>],
      [<span style={{ color: BORROWED }}>the 2π</span>,
        <>Taken from <K>inStep</K> by analogy rather than derived for this use. It
          is the difference between 9% and 43%, so it is load-bearing.</>],
    ]} />

    <Note>
      But the shape of the result is new for this file:{' '}
      <b style={{ color: INK }}>a rotation curve fitted to one percent by a
        number the model computes from its own cosmology</b>, with a dated
      prediction attached that distinguishes it from the phenomenology it
      reproduces. Nothing else in the dark-matter thread has been in that
      position.
    </Note>

    <Head>test J — the polarity is a coin</Head>

    <Note>
      Test A’s √<V>N</V> came from <i>phase</i> cancellation, which needs{' '}
      <V>m</V>·<V>R</V> ≫ 2π, hence an emitter mass, hence the 29 MeV bill. But{' '}
      <b style={{ color: INK }}>the model never gives a wave a definite
        polarity</b>. A neutral point becomes a ± pair and nothing decides which
      half goes which way — the attribution is a fair coin, and the expansion
      that made the point has no polarity to hand it. A fair coin gives{' '}
      √<V>N</V> by itself, at every scale, with no coherence anywhere.
    </Note>

    <Note>
      Measured over an ensemble of forty realisations, since the imbalance is a
      random variable and one draw says nothing:{' '}
      <b style={{ color: INK }}>rms(net)/√total is flat</b> — 0.064, 0.097,
      0.077, 0.141 across a sixty-fourfold range in <V>N</V> — and it does not
      depend on the body’s size either, 0.065 · 0.061 · 0.075 at radii 5, 10 and
      16, where the phase route varied by orders across the same span. The ±
      imbalance is exactly the fair-coin fluctuation on the arrivals and cares
      about nothing else.
    </Note>

    <Note>
      <b style={{ color: INK }}>Which confirms Test I from the other
        direction.</b> Test I removed the 29 MeV bill by finding the scale in the
      expansion; this removes the <i>reason</i> anyone looked for a Compton
      wavelength at all — there was never a coherence condition to satisfy. Two
      independent routes to the same conclusion: no emitter mass enters the
      dark-matter account anywhere.
    </Note>

    <Note>
      <b style={{ color: BORROWED }}>But a fluctuation has no sign.</b> It cannot
      be the source of a systematic attraction, and if gravity coupled to it at
      every scale the solar system would be gone — the Sun’s 10<Sup>57</Sup>{' '}
      emitters would act as 10<Sup>28.5</Sup>. So this is not an alternative to
      the transport route; it is the removal of an objection to it. The
      systematic pull stays with the count, and the √<V>M</V> stays in the
      transport, where flux conservation goes quadratic.
    </Note>

    <Head>test K — and the high-redshift discs refuse it</Head>

    <Note>
      The worry above is now measured rather than left standing. Genzel’s six
      discs, their masses and sizes put through the transport route inside one
      effective radius, against the <V>f</V><Sub>DM</Sub> &lt; 0.2 they measure —
      which is a boost under about 1.12:
    </Note>

    <HighRedshift />

    <Rows of={[
      [<span style={{ color: BORROWED }}>four of five are over the line</span>,
        <>With <V>a</V><Sub>0</Sub> ∝ 1/<V>t</V>: 1.179, 1.170, 1.164, 1.239
          against an allowed 1.12. With <V>a</V><Sub>0</Sub> fixed, none is —
          ordinary MOND is marginal here and survives, and{' '}
          <b style={{ color: INK }}>the model’s own time-dependence does
            not</b>.</>],
      [<span style={{ color: BORROWED }}>out by a factor of three</span>,
        <>Inverted: the largest <V>a</V><Sub>0</Sub> these galaxies permit is
          1.09× today’s, i.e. <V>z</V> &lt; 0.09. The coasting cosmology wants{' '}
          <b style={{ color: INK }}>3.20×</b> at <V>z</V> = 2.2.</>],
      [<span style={{ color: FAINT }}>and the one that passes</span>,
        <>zC_400569, because it is compact — 3.3 kpc at 2·10<Sup>11</Sup> M☉, so
          its own <V>g</V><Sub>N</Sub> is 6.2 <V>a</V><Sub>0</Sub> and it is
          Newtonian either way. The discs that refuse the prediction are the
          extended ones.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>So the one thing that dated the model is the one
        thing the data refuses.</b> Which is the right way round for a prediction
      to fail: it was specific, derived rather than fitted, and refutable by
      measurements that already existed. What it costs is exactly the part of
      Test I that made <V>a</V><Sub>0</Sub> a clock reading.{' '}
      <b style={{ color: INK }}>What survives is the value</b> —{' '}
      <V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π at the present epoch is
      still 9% from the measured number with nothing fitted, and still fits the
      Milky Way to 1.1%.
    </Note>

    <Note>
      And what would have to be true for it to live:{' '}
      <V>a</V><Sub>0</Sub> would have to track something <i>local</i>, and that
      quantity would have to stay roughly constant over
      0 &lt; <V>z</V> &lt; 2.2 while 1/<V>t</V> trebles.{' '}
      <b style={{ color: INK }}>Which is exactly what the next section finds</b>,
      so the version of this paragraph that said the model had no such quantity
      was wrong. It has one.
    </Note>

    <Head>test L — the bulk makes no space, but it makes gravity</Head>

    <Note>
      The frontier construction forbids the bulk from <i>creating</i> space. It
      says nothing about the bulk <i>coupling</i> — and the caught pair is
      exactly that: a pull mediated by the vacuum between two bodies, whose
      strength goes with how much vacuum there is to mediate it.{' '}
      <b style={{ color: INK }}>More empty space between two things, more
        pull.</b> That is local, and it is the thing the last test said the model
      did not have.
    </Note>

    <Note>
      <b style={{ color: BORROWED }}>First the version that fails</b>, because it
      is instructive. Read the emptiness as the local baryon <i>density</i>,{' '}
      <V>a</V><Sub>0</Sub>·(<V>ρ</V><Sub>ref</Sub>/<V>ρ</V>)<Sup>s</Sup>: at{' '}
      <V>s</V> = 0 the Milky Way fits to 1.1% and the worst Genzel boost is
      1.239; at <V>s</V> = 1 the boost falls to 1.107 but the Milky Way is out
      by 77%. <b style={{ color: INK }}>No value of <V>s</V> does both</b> —
      because <V>ρ</V> varies by fifty <i>within</i> one galaxy, so a rule keyed
      to it cannot tell between-galaxies from within-a-galaxy.
    </Note>

    <Note>
      <b style={{ color: INK }}>And that points straight at the fix: the space
        between two bodies is a length, not a volume.</b> It is measured along
      the line joining them, so what counts is the mean <i>spacing</i>,{' '}
      <V>ρ</V><Sup>−1/3</Sup>, not the density. And then both factors are fixed
      by the epoch alone — <V>H</V> ∝ (1+<V>z</V>) from the frontier’s own{' '}
      <V>H</V> = 1/<V>t</V>, and spacing ∝ (1+<V>z</V>)<Sup>−1</Sup> since{' '}
      <V>ρ</V> ∝ (1+<V>z</V>)<Sup>3</Sup>.
    </Note>

    <Eq open={show} note="and the two factors cancel, identically">
      <V>a</V><Sub>0</Sub> = <Frac over={<><V>c</V> <V>H</V></>} under={<>2π</>} />
      <span style={{ padding: '0 0.6em' }}>·</span>
      <Frac over={<>spacing</>} under={<>spacing<Sub>0</Sub></>} />
      <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
      <Frac over={<><V>c</V> <V>H</V><Sub>0</Sub></>} under={<>2π</>} />
    </Eq>

    <Note>
      Not approximately — <i>identically</i>. <V>a</V><Sub>0</Sub>(<V>z</V>)/<V>a</V><Sub>0</Sub>(0)
      is 1.0000 at <V>z</V> = 0.5, 1, 1.5, 2, 2.5 and 4, because the clock speeds
      up by precisely the factor the spacing shrinks by. So{' '}
      <b style={{ color: INK }}>a₀ is constant in redshift and still equal to{' '}
        <V>cH</V><Sub>0</Sub>/2π</b>: the 9% value survives, the Milky Way stays
      at 1.1%, and the Genzel boosts fall back to 1.112, 1.083, 1.077, 1.101,
      1.019 — <b style={{ color: INK }}>every one under the allowed 1.12</b>.
    </Note>

    <HighZDiscs />

    <Note>
      Which is what the refutation in Test K was really of:{' '}
      <V>a</V><Sub>0</Sub> ∝ 1/<V>t</V> was the mechanism with half of it
      dropped. “More empty space, more pull” was the idea; leaving the emptiness
      out and keeping only the clock is what the data refused.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>what is gained</span>,
        <>The 9% value survives, the Milky Way fit survives, and the
          high-<V>z</V> discs stop refusing it.</>],
      [<span style={{ color: BORROWED }}>and what is lost</span>,
        <><b style={{ color: INK }}>The dated prediction.</b>{' '}
          <V>a</V><Sub>0</Sub> constant is what MOND already assumes, so the model
          no longer says anything about redshift that MOND does not. The thing
          that made it refutable is the thing that had to go for it to survive —
          an honest trade and not a good one, and it should be read as the model
          becoming <i>harder to test</i> rather than as it becoming more
          right.</>],
    ]} />

    <Note>
      What is still owed is unchanged and it is one thing:{' '}
      <b style={{ color: INK }}>that a carrier’s update cost goes as its
        accumulated phase</b>. Everything in the transport route rests on it. It
      is a <code>physics.ts</code> question about what a tick is spent on, and it
      has been owed since the mechanism was first written down —{' '}
      <b style={{ color: INK }}>and the next section pays part of it.</b>
    </Note>

    <Head>test M — the carriers already there block the splitting</Head>

    <Note>
      Every test above wrote the turnover as{' '}
      <V>g</V> = <V>g</V><Sub>N</Sub>/2 + √(<V>g</V><Sub>N</Sub><Sup>2</Sup>/4 +{' '}
      <V>g</V><Sub>N</Sub><V>a</V><Sub>0</Sub>) and called it “the simple
      interpolation, same algebra as MOND’s”. <b style={{ color: INK }}>It was
        assumed.</b> Here is where it comes from, and it is already in the rules:
      a neutral point becomes a ± pair, but{' '}
      <b style={{ color: INK }}>a point that already has a carrier on it is
        busy</b> — <K>through</K> says an arriving charge annihilates or
      reverses, and either way that point does not split this tick. So splitting
      is suppressed exactly where the carrier density is high, which by{' '}
      <V>g</V> ∝ <V>n</V> is exactly where the field is strong.
    </Note>

    <Eq open={show} note="occupancy θ = g/a₀, free fraction 1/(1+θ), and it closes">
      <V>g</V> = <V>g</V><Sub>N</Sub>·(1 + <V>a</V><Sub>0</Sub>/<V>g</V>)
      <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
      <V>g</V> = <Frac over={<><V>g</V><Sub>N</Sub></>} under={<>2</>} /> + √(
      <Frac over={<><V>g</V><Sub>N</Sub><Sup>2</Sup></>} under={<>4</>} /> +{' '}
      <V>g</V><Sub>N</Sub><V>a</V><Sub>0</Sub>)
    </Eq>

    <Note>
      <b style={{ color: INK }}>Which is the function, derived.</b> Over six
      decades <V>g</V>/<V>g</V><Sub>N</Sub> runs 31.7, 10.5, 3.70, 1.62, 1.10,
      1.010, 1.0010 against a deep limit √(<V>a</V><Sub>0</Sub>/<V>g</V><Sub>N</Sub>)
      of 31.6, 10.0, 3.16 — agreeing where they should and parting where they
      should. The μ-function stops being borrowed phenomenology.
    </Note>

    <Note>
      And it makes <V>a</V><Sub>0</Sub> a <b style={{ color: INK }}>local
        threshold rather than a clock reading</b>, which is what Test K needed
      and Test L had to buy with a cosmological cancellation. The blocking is a
      function of the field at the point and nothing else, so it cannot move with
      redshift — there is nothing in it that could.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}><V>cH</V><Sub>0</Sub>/2π, isotropic</span>,
        <>1.10·10<Sup>−10</Sup> — Milky Way <b style={{ color: INK }}>1.1%</b>,
          worst Genzel boost <b style={{ color: INK }}>1.112</b>.{' '}
          <b style={{ color: INK }}>All five pass.</b></>],
      [<span style={{ color: FAINT }}>cone shut at cos θ &gt; 0.5</span>,
        <>8.38·10<Sup>−11</Sup> — Milky Way 5.2%, worst boost 1.090. Still
          passes, but the fit is going.</>],
      [<span style={{ color: BORROWED }}>the <i>measured</i> <V>a</V><Sub>0</Sub></span>,
        <>1.20·10<Sup>−10</Sup> — Milky Way 1.0%, worst boost{' '}
          <b style={{ color: INK }}>1.120</b>, which <i>fails</i> by a hair.
          Worth staring at: the model’s own smaller prediction passes where the
          measured value does not, so the 9% it is “wrong” by is in the direction
          the high-<V>z</V> data prefer.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>And then the direction, which is the part nobody
        had asked.</b> A carrier streaming along <V>ĝ</V> occupies the cell in
      that direction; the point has <K>WAYS</K> exits and only the occupied ones
      are shut, so the pair goes out with the field direction <i>removed</i>.
      That is an anisotropic source, and it costs a projection: ⟨|<V>ĉ</V>·<V>r̂</V>|⟩
      falls from 0.4721 isotropic to 0.4510 with a narrow cone shut and 0.3610
      with a wide one.
    </Note>

    <Note>
      <b style={{ color: BORROWED }}>Shutting the forward cone reduces the radial
        projection.</b> The surviving pairs carry <i>less</i> flux outward, not
      more — so the anisotropy weakens the vacuum channel, and most where the
      field is strong, which is the same direction the blocking already pushes.
      The two compound rather than fight, which is why the shape of the
      interpolation survives both: they are functions of the same occupancy, so
      they can only move the <i>scale</i>.
    </Note>

    <Note>
      And that is the one place it goes the wrong way. The projection multiplies{' '}
      <V>a</V><Sub>0</Sub> by 0.955 or 0.765, and the measurement wants it 9%{' '}
      <i>larger</i>. <b style={{ color: INK }}>So the anisotropy widens the gap it
        was hoped to close.</b> Not fatal — the gap is still under a factor of
      1.5 in a quantity nothing was fitted to — but it is the opposite of the
      hoped-for result, and the cone cannot be shut far before the Milky Way fit
      goes.
    </Note>

    <Note>
      So what this buys, precisely:{' '}
      <b style={{ color: INK }}>the interpolation function, derived from{' '}
        <K>through</K> rather than borrowed</b>; <V>a</V><Sub>0</Sub> as a local
      threshold, which settles the high-<V>z</V> discs without the cosmological
      cancellation — so Test L is no longer load-bearing, though it survives as a
      consistency check; and a bound on the anisotropy, since the cone cannot be
      shut past about cos θ = 0.5. What it does <i>not</i> buy is the one link:
      “the carrier density suppresses the splitting” is <K>through</K> and is
      already in the file, but “the update cost goes as the accumulated phase”,
      which is what makes the <i>drift</i> fall with density, is still owed.
    </Note>

    <Head>and speed is a budget, not a constant</Head>

    <Note>
      “Everything moves at <V>c</V>” was quoting half the file at the other
      half. It rejects <i>idling</i> for massive particles — moving on a
      fraction <V>β</V> of ticks gives (1−<V>β</V>) where relativity wants
      √((1−<V>β</V>)(1+<V>β</V>)), and picks a frame. But the{' '}
      <i>zigzag</i> says a thing steps <i>every</i> tick and its net speed is the
      imbalance, and that <b style={{ color: INK }}>the updates <i>are</i> the
        reversals</b>. A net drift below <V>c</V> is not forbidden; it is this
      model’s own account of what speed is.
    </Note>

    <Note>
      And that reopens everything, because flux conservation reads{' '}
      <V>Φ</V> = 4π<V>r</V><Sup>2</Sup><V>nv</V>. With <V>v</V> constant,{' '}
      <V>n</V> ∝ 1/<V>r</V><Sup>2</Sup> and no wandering changes it — which is
      what the last test showed. With <V>v</V> varying, what is needed is simply{' '}
      <V>v</V> ∝ 1/<V>r</V>. And the model has a reason for the drift to depend
      on density, out of pieces already here: speed is the share of ticks spent
      moving rather than updating; a carrier accumulates phase while travelling
      free; <i>through</i> says a meeting resets it; so the accumulated state ∝
      the distance since the last meeting, 1/<V>σn</V>, and the moving share ∝{' '}
      <V>σn</V>.
    </Note>

    <Eq derive={REACH} open={show}
      note="dense and the budget caps at c; thin and the carrier crawls">
      <V>v</V> = <V>c</V>·min(1, <V>n</V>/<V>n</V><Sub>c</Sub>)
    </Eq>

    <Rows of={[
      [<span style={{ color: DERIVED }}>dense, <V>n</V> &gt; <V>n</V><Sub>c</Sub></span>,
        <><V>v</V> = <V>c</V>, so <V>n</V> = <V>Φ</V>/4π<V>r</V><Sup>2</Sup><V>c</V>{' '}
          ∝ 1/<V>r</V><Sup>2</Sup> — <b style={{ color: INK }}>Newton</b></>],
      [<span style={{ color: DERIVED }}>thin, <V>n</V> &lt; <V>n</V><Sub>c</Sub></span>,
        <><V>v</V> = <V>cn</V>/<V>n</V><Sub>c</Sub>, so flux conservation goes{' '}
          <i>quadratic</i>: <V>n</V> = √(<V>Φn</V><Sub>c</Sub>/4π<V>c</V>)/<V>r</V>{' '}
          ∝ 1/<V>r</V> — <b style={{ color: INK }}>MOND</b></>],
      [<span style={{ color: DERIVED }}>and the mass comes free</span>,
        <>In the thin branch <V>n</V> ∝ √<V>Φ</V> and <V>Φ</V> ∝ <V>M</V>, so{' '}
          <V>g</V> ∝ √<V>M</V>/<V>r</V> and{' '}
          <b style={{ color: INK }}><V>v</V><Sub>rot</Sub><Sup>4</Sup> ∝ <V>M</V></b>.
          Both halves from one mechanism — and the √<V>M</V> is not the phase
          cancellation at all. It falls out because the flux equation becomes
          quadratic in <V>n</V> once the speed is proportional to <V>n</V>.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>That is the non-linearity the theorem
        demanded</b>, and it lives in the <i>transport</i> rather than in the
      source — which is why every earlier attempt to put it in the source failed.
      And the switch is at a <i>fixed occupancy</i>, hence fixed <V>g</V>, since{' '}
      <V>g</V> ∝ <V>n</V>. Not a length, not a mass, not a count of
      constituents. Every requirement the search accumulated, at once.
    </Note>

    <Note>
      Measured by integrating the transport rather than trusting the algebra:{' '}
      <b style={{ color: INK }}>−2.0000 inside and −1.0000 outside</b>, and the
      outer density against √<V>Φ</V> comes to 10.0000 for a hundredfold mass
      against √100 = 10. Exact.
    </Note>

    <Note>
      <b style={{ color: INK }}>What it costs.</b> A carrier that crawls is a
      carrier that is <i>late</i>. At 20 kpc the drift is 0.4<V>c</V> and a
      galaxy’s crossing time goes from 98 to 244 kyr — harmless. Further out it
      is not: at <V>n</V>/<V>n</V><Sub>c</Sub> = 10<Sup>−3</Sup> a cluster-scale
      field takes 10<Sup>7</Sup> years to establish.{' '}
      <b style={{ color: INK }}>Gravity should lag in the deep-field regime</b>,
      and merging systems are where that would show. It is not relativity broken
      — the carriers still step one cell a tick, and the density setting the
      drift is a scalar, so nothing exceeds <V>c</V> and nothing picks a frame.
    </Note>

    <Note>
      <b style={{ color: INK }}>And chasing that link turns up a sign conflict
        in the chain above.</b> It used “a meeting <i>resets</i> the accumulated
      state, so meetings free up ticks and the carrier moves faster”. But{' '}
      <i>through</i> — the model’s own rule, and a measured one — says a charge
      arriving at an occupied cell annihilates or <i>reverses</i>. A reversal
      does not clear internal state; it turns the carrier round, which{' '}
      <i>slows</i> the net drift. So <i>through</i> gives{' '}
      <V>v</V> falling with <V>n</V> and the chain gives it rising, and{' '}
      <V>v</V> ∝ <V>n</V> is exactly what the √<V>M</V> depends on.{' '}
      <b style={{ color: INK }}>A real problem, not a detail</b> — and the sort
      that would have gone unnoticed if the link had been left as an IOU.
    </Note>

    <Note>
      <b style={{ color: INK }}>But there is a connection with the right sign,
        and it is already here: <i>inStep</i>.</b> It says emitters closer than
      a Compton wavelength hold a common phase and further apart drift
      independently. Read as a <i>budget</i> rather than an interference
      condition: <b style={{ color: INK }}>in step</b>, one phase is shared
      between many carriers, the update is paid <i>once</i>, and each is free to
      spend its ticks moving — dense → fast. <b style={{ color: INK }}>Out of
        step</b>, each carries its own phase and pays every tick — thin → slow.
      Right sign, no new rule, and it does not fight <i>through</i>: reversals
      still happen, but what sets the drift is what a tick is <i>spent on</i>,
      not which way the step points.
    </Note>

    <Eq derive={REACH} open={show}
      note="a Compton wavelength is a fixed density — the shape the search demanded">
      in step ⇔ spacing &lt; 2π/<V>m</V>
      <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
      <V>n</V><Sub>c</Sub> = (<V>m</V>/2π)<Sup>3</Sup>
    </Eq>

    <Rows of={[
      [<span style={{ color: DERIVED }}>which fixes the emitter</span>,
        <>The required <V>n</V><Sub>c</Sub> = 2.203·10<Sup>−61</Sup> per cell
          gives <V>m</V> = 5.150·10<Sup>−29</Sup> kg ={' '}
          <b style={{ color: INK }}>28.9 MeV/<V>c</V><Sup>2</Sup></b>.</>],
      [<span style={{ color: BORROWED }}>and there is no such particle</span>,
        <>The proton gives <V>n</V><Sub>c</Sub> 3.4·10<Sup>4</Sup> too dense, the
          electron 5.5·10<Sup>−6</Sup> too thin. The muon at 106 MeV and the
          pion at 135 are the nearest things and both are four to eight times
          too heavy.</>],
      [<span style={{ color: DERIVED }}>but three of four are fixed</span>,
        <>The <i>sign</i>, the <i>crossover shape</i>, and{' '}
          <i>no new rule needed</i> — all by something already derived and
          measured in the file. Only the number is wrong, and it is wrong by a
          stateable amount.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Which says exactly what to look for:</b> either
      an emitter near 29 MeV, or a reason the relevant Compton wavelength is not
      the constituent’s own. And there is an obvious place to look for the
      second — <i>inStep</i> takes the mass of what is <i>emitting</i>. If the
      phase that matters belongs to the <i>carrier</i> rather than the source,
      then 29 MeV is a statement about the carrier — and this model has{' '}
      <b style={{ color: INK }}>never assigned the carrier a mass at all</b>.
      The pull is carried by charges whose own rate was never fixed, which makes
      this a gap rather than a contradiction, and the first thing{' '}
      <i>physics.ts</i> would have to answer.
    </Note>

    <Note>
      <b style={{ color: INK }}>And a correction: the a₀ prediction was
        over-retracted.</b> It was written off along with the 2D transport, but
      it used only <V>g</V> ∝ <V>n</V> with the constant 4π<V>G</V>/<K>SHEET</K>{' '}
      — the geometry of emission — and{' '}
      <V>n</V><Sub>c</Sub> = 1/<V>t</V><Sub>0</Sub>, one meeting per carrier
      lifetime. <i>Neither mentions the sheet.</i> The transport failed and the
      prediction does not depend on it.
    </Note>

    <Note>
      <b style={{ color: INK }}>So how do you derive it without data?</b>{' '}
      Enumerate the inputs that exist at all — this is the whole list, and a
      derivation can use nothing else: four counted numbers (<K>SHEET</K>,{' '}
      <K>WAYS</K>, <K>BITE</K>, <K>GRAVITY</K>), two units (the cell and the
      tick, fixed by the calibration), and one dynamical quantity,{' '}
      <V>t</V><Sub>0</Sub> = 8.08·10<Sup>60</Sup> ticks. Then see which
      combinations can reach the size at all.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>the ceiling — one emission a tick</span>,
        <><V>n</V><Sub>c</Sub> = 1, which is 4.5·10<Sup>60</Sup> too dense</>],
      [<span style={{ color: FAINT }}>the floor — one emission per age</span>,
        <>7.6·10<Sup>−186</Sup>, which is 10<Sup>124</Sup> too thin</>],
      [<span style={{ color: DERIVED }}>one <i>meeting</i> per carrier lifetime</span>,
        <>1.24·10<Sup>−61</Sup> against the 2.20·10<Sup>−61</Sup> that{' '}
          <V>a</V><Sub>0</Sub> requires —{' '}
          <b style={{ color: INK }}>out by 1.78</b></>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Only one route lands</b>, and it is not a fit
      surviving among many — it is the only candidate the available ingredients
      can even build at the right size. A carrier crosses one cell a tick and
      lives <V>t</V><Sub>0</Sub> ticks, sweeping <K>BITE</K> cells of
      cross-section, so it meets <V>n</V>·<K>BITE</K>·<V>t</V><Sub>0</Sub>{' '}
      others; the crossover is where that count is <i>one</i> — the boundary
      between a carrier whose history contains an interaction and one whose does
      not. So <V>n</V><Sub>c</Sub> = 1/<K>BITE</K><V>t</V><Sub>0</Sub>, and with{' '}
      <V>g</V> = (4π<V>G</V>/<K>SHEET</K>)<V>n</V>,{' '}
      <b style={{ color: INK }}><V>a</V><Sub>0</Sub> = 4π<V>G</V>/(<K>SHEET</K>·<V>t</V><Sub>0</Sub>)
        = 6.74·10<Sup>−11</Sup></b> against 1.20·10<Sup>−10</Sup> measured. No{' '}
      <V>a</V><Sub>0</Sub> anywhere in the derivation.
    </Note>

    <Note>
      <b style={{ color: INK }}>And it then predicts the carrier mass</b>, which
      was the open number. <i>inStep</i> wants{' '}
      <V>n</V><Sub>c</Sub> = (<V>m</V>/2π)<Sup>3</Sup>; setting the two equal
      gives <V>m</V> = 2π(1/<V>t</V><Sub>0</Sub>)<Sup>⅓</Sup> ={' '}
      <b style={{ color: INK }}>23.8 MeV/<V>c</V><Sup>2</Sup></b>, against the
      28.9 MeV that <V>a</V><Sub>0</Sub> demands — a ratio of 1.212.{' '}
      <b style={{ color: INK }}>Two independent routes to the same number,
        agreeing to 21%.</b> One counts meetings over a lifetime, the other asks
      when carriers fall out of step. They did not have to agree at all, and it
      is the first time in this line of work that two derivations have met.
    </Note>

    <Note>
      <b style={{ color: INK }}>The bills, and they are specific.</b> The{' '}
      <i>1.78 is uncounted</i> — and it is the <i>same</i> 1.78 at every step, so
      it is one missing factor rather than several; somewhere a 2, a π or a √π is
      not being counted. <V>t</V><Sub>0</Sub> <i>is not a constant</i>, so{' '}
      <V>a</V><Sub>0</Sub> ∝ 1/<V>t</V> and the carrier mass goes as{' '}
      <V>t</V><Sup>−⅓</Sup> — a mass that changes with the age is a strange
      object, and it is the same prediction already flagged, with high-redshift
      curves going the wrong way. And <i>24 MeV is not a particle</i>: the muon
      is 106 and the pion 135. Either something sits there, or the Compton
      wavelength that matters is not a particle’s at all.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the 1.78 is mostly countable — it was never
        one number.</b> The count was “a carrier sweeps <K>BITE</K> cells a tick
      for <V>t</V><Sub>0</Sub> ticks, so it meets{' '}
      <V>n</V>·<K>BITE</K>·<V>t</V><Sub>0</Sub> others; set that to one”. Two
      things in it were left at one and should not have been, and both are
      already derived elsewhere in this file: <i>share</i> = ½, since only
      opposite polarities annihilate and <i>opposed</i> pairs at random; and{' '}
      ⟨|<V>v</V><Sub>rel</Sub>|⟩ = 4/3, since both things move at <V>c</V> and
      the rate carries their <i>relative</i> speed — the same average that
      corrected the screening geometry.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>nothing counted</span>,
        <><V>a</V><Sub>0</Sub> = 6.74·10<Sup>−11</Sup> — 0.562 of measured</>],
      [<span style={{ color: DERIVED }}><i>share</i> = ½</span>,
        <>1.348·10<Sup>−10</Sup> — 1.124</>],
      [<span style={{ color: FAINT }}>⟨|<V>v</V><Sub>rel</Sub>|⟩ = 4/3 alone</span>,
        <>5.06·10<Sup>−11</Sup> — 0.421</>],
      [<span style={{ color: DERIVED }}>both</span>,
        <>1.011·10<Sup>−10</Sup> — 0.843</>],
    ]} />

    <Note>
      They pull <i>opposite</i> ways — fewer meetings puts the threshold at a
      higher density and raises <V>a</V><Sub>0</Sub>; a larger relative speed
      means more meetings and lowers it.{' '}
      <b style={{ color: INK }}>And the relative-speed factor is not actually
        4/3 here</b>, which is the interesting part rather than a nuisance: 4/3
      is the <i>isotropic</i> average, but a source’s own carriers all stream
      radially outward — nearly comoving, and two things moving the same way at{' '}
      <V>c</V> never meet. So the true factor sits between 1 and 4/3, and with{' '}
      <i>share</i> counted{' '}
      <b style={{ color: INK }}><V>a</V><Sub>0</Sub> ∈ [1.011, 1.348]·10<Sup>−10</Sup></b>{' '}
      — the measured 1.200 sitting inside, 56% of the way across.
    </Note>

    <Note>
      <b style={{ color: INK }}>And it tightens the two routes against each
        other</b>, which is the better test since neither involves{' '}
      <V>a</V><Sub>0</Sub>. Each <V>n</V><Sub>c</Sub> predicts a carrier mass
      through <V>n</V><Sub>c</Sub> = (<V>m</V>/2π)<Sup>3</Sup>: bare gives 23.8
      MeV, <i>share</i> gives 30.0, both give 27.3, against the 28.9 that{' '}
      <V>a</V><Sub>0</Sub> demands.{' '}
      <b style={{ color: INK }}>From 21% apart to 4%.</b> Two derivations that
      share no steps now meet inside the uncertainty of either.
    </Note>

    <Note>
      <b style={{ color: INK }}>What is left.</b> <i>What a carrier meets</i> is
      now the only thing between this and a number — its own source’s outflow,
      comoving and suppressed, or an ambient sea, isotropic and 4/3? That is a
      question about <i>field.ts</i> and it is answerable by simulation.{' '}
      <V>t</V><Sub>0</Sub> not being a constant is unfixable and stays a
      prediction. And ~28 MeV is still not a particle: the bracket is 27–30 and
      nothing sits there.
    </Note>

    <Note>
      <b style={{ color: INK }}>A discipline note.</b> (4/3)<Sup>2</Sup> = 1.7778
      against the observed 1.7799 — a match to 0.1%.{' '}
      <i>Not claimed, and it should not be:</i> <V>a</V><Sub>0</Sub> itself is
      quoted at ~10%, so 0.1% is far inside the noise, and √π = 1.772 fits just
      as well. The two factors above are worth having because each was{' '}
      <i>derived somewhere else in this file</i> — not because their product
      lands well.
    </Note>

    <Head>and simulating the last open thing breaks it</Head>

    <Note>
      <b style={{ color: INK }}>The suppression is real and strong.</b> A source
      of radius <V>R</V>, a field point at <V>r</V>, two carriers arriving there
      from random parts of it, each weighted by the flux that part contributes:
      ⟨|<V>v</V><Sub>rel</Sub>|⟩/<V>c</V> is 0.560 at{' '}
      <V>r</V>/<V>R</V> = 1.5, 0.162 at 5, 0.027 at 30, 0.008 at 100. It falls
      as <V>R</V>/<V>r</V> exactly as the geometry says — far out the source
      subtends a small angle and its carriers all go the same way.{' '}
      <b style={{ color: INK }}>A point source is the limit: its carriers are
        perfectly comoving and never meet each other at all.</b>
    </Note>

    <Note>
      <b style={{ color: INK }}>But a carrier does not only meet those.</b> The
      rest of the universe is emitting too, and that sea arrives isotropically
      at <V>ρ</V>·<K>SHEET</K>·<V>R</V><Sub>h</Sub> = 1.73·10<Sup>−60</Sup> per
      cell. Against the galaxy’s own carriers: 6.3·10<Sup>6</Sup> times smaller
      at 1 AU, comparable by 8 kpc, and{' '}
      <b style={{ color: INK }}>thirty-five times <i>denser</i> than the
        galaxy’s own by 20 kpc</b>.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>and that breaks it</span>,
        <>The crossover wants <V>n</V><Sub>c</Sub> = 2.48·10<Sup>−61</Sup> and
          the sea alone is 1.73·10<Sup>−60</Sup> —{' '}
          <b style={{ color: INK }}>seven times above it, everywhere</b>. A
          carrier anywhere meets 7.0 others in its life from the background
          alone, so the switch is thrown in every direction at every radius. No
          MOND regime; Newton everywhere.</>],
      [<span style={{ color: BORROWED }}>the conflation that hid it</span>,
        <><V>g</V> ∝ <V>n</V> is about the <i>source’s own</i> carriers, while
          the meeting rate is about <i>all</i> of them.{' '}
          <b style={{ color: INK }}>Two densities, one symbol.</b> The crossover
          was meant to depend on the source, so it happens at a radius — but the
          meeting rate does not depend on the source at all, so it happens
          nowhere, or everywhere.</>],
      [<span style={{ color: DERIVED }}>and what saves it, barely</span>,
        <><i>reach</i> screens the sea with a Yukawa length of 1.6 Gpc, so
          distant matter does not count. Redone with the cut-off,{' '}
          <V>ρ</V><K>SHEET</K><V>λ</V> = 6.55·10<Sup>−61</Sup> against{' '}
          <V>n</V><Sub>c</Sub> = 2.48·10<Sup>−61</Sup> — a ratio of{' '}
          <b style={{ color: INK }}>2.65</b> instead of 7. Still above, but
          inside the uncertainty of everything feeding it.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>So the verdict is marginal rather than
        dead</b>, and it turns on <i>reach</i> — a length this file derived for
      entirely unrelated reasons and called its one genuine prediction. The
      mechanism does not have a comfortable MOND regime; it has one that
      switches on <i>barely</i>, and only because gravity’s own range cuts the
      sea off. That is a much weaker claim than the sections above it make, and
      it is what the simulation actually supports. (The alternative branch — only
      the source’s own carriers counting, so the crossover <i>is</i> radial —
      fails differently: the rate goes as <V>R</V>/<V>r</V><Sup>3</Sup>, giving a
      crossover radius ∝ <V>M</V><Sup>⅓</Sup> rather than √<V>M</V>, and
      Tully–Fisher goes wrong again. Neither branch works, for different
      reasons.)
    </Note>

    <Note>
      <b style={{ color: INK }}>One link is still owed:</b> that the update cost
      goes as the accumulated phase. Everything above hangs on it, and it is the
      only part not already in the file — a question about <i>physics.ts</i>,
      what a tick is spent on, rather than about galaxies.
    </Note>

    <Note>
      <b style={{ color: INK }}>Where it leaves things.</b> √<V>M</V> in the
      source: done, from the XOR. 1/<V>r</V><Sup>2</Sup> in the reach: done,
      from the emitters. A flat curve and <V>v</V><Sup>4</Sup> ∝ <V>M</V>:
      both follow exactly. The scale <V>a</V><Sub>0</Sub>: sets κ, still not
      counted, still 4.5 off <K>BIAS</K>/<V>t</V><Sub>0</Sub>. And the
      crossover: <b style={{ color: INK }}>open, and now the only open
        thing</b> — and stated exactly, it is not “why does the root appear” but{' '}
      <i>why does the product switch off</i>, without counting constituents.
      Three turns ago this was five separate unknowns; it is one. And a bonus
      that has nothing to do with <V>a</V><Sub>0</Sub>: a layer carrying
      “pulse = which particle” is where a <b style={{ color: INK }}>particle
        spectrum</b> could come from, and this model has none.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the sign is the interesting part.</b>{' '}
      High-redshift discs at <V>z</V> ~ 1–2 are reported with{' '}
      <i>declining</i> rotation curves — more baryon-dominated, more Keplerian,
      which is what a <i>smaller</i> <V>a</V><Sub>0</Sub> would give. This model
      wants a larger one. If that reading holds,{' '}
      <V>a</V><Sub>0</Sub> ∝ 1/<V>t</V> is excluded, and with it the only native
      hook the model has at galactic scale. Which is the right kind of trouble:
      the coincidence <V>a</V><Sub>0</Sub> ≈ <V>cH</V><Sub>0</Sub> is normally
      an ornament precisely because nothing forces it to hold at other epochs.
      Here the frontier forces it, so{' '}
      <b style={{ color: INK }}>the model cannot decline the test</b>.
    </Note>

    <Note>
      <b style={{ color: INK }}>And Newton and general relativity fail this
        identically</b>, which is worth being plain about. The curve above{' '}
      <i>is</i> the Newtonian prediction; general relativity’s correction to a
      circular orbit is <V>u</V> = 1.7·10<Sup>−7</Sup>, shifting 220 km/s by
      4·10<Sup>−5</Sup>. All three agree to six decimal places and all three
      miss by a factor of 3 at 20 kpc and 4.5 at 30. This is not a strike
      against the model — it is the bill every theory of gravity has carried
      since the 1970s, and this one inherits it exactly{' '}
      <i>because</i> it reproduces general relativity. What would count against
      it is failing where general relativity succeeds, and it does not do that
      here. Dark matter costs the same thing here as there: either a particle
      the theory permits and does not predict — <i>inStep</i> already wants{' '}
      <V>m</V> &lt; 2π/<V>R</V>, which at 30 kpc is 1.3·10<Sup>−27</Sup> eV,
      the ultralight window — or a modified law, which is the floor above.
    </Note>

    <Note>
      <b style={{ color: INK }}>So what is left owed</b>, ranked: the light
      elements, with no mechanism and no room for one; the microwave background,
      untouched by any of this; the rotation curves, which the missing dark
      matter costs; and the initial condition, since{' '}
      <V>v</V> = <V>x</V>/<V>t</V> still needs everything to have left the
      origin at once with a spread of velocities. What is{' '}
      <i>not</i> owed any more is the deceleration — the reason to doubt the
      free-streaming, and a third of an already small number.
    </Note>

    <Note>
      <b style={{ color: INK }}>What is worth keeping out of it.</b> The{' '}
      <i>shape</i> this predicts is a dipole, quadrupole and octupole all
      aligned on one axis with amplitudes falling geometrically — and that is
      the shape of the known anomaly, the “axis of evil”: the quadrupole and
      octupole aligned with each other and roughly with the dipole, both
      anomalously low, unexplained in ΛCDM. The model gets the shape and misses
      the size by three orders. Which is a more interesting kind of wrong than
      usual, and the only place in the whole cosmology where it says something
      specific about a measurement nobody can currently account for.
    </Note>

    <Note>
      <b style={{ color: INK }}>Which is a claim and not a silence.</b> A static
      universe predicts surface brightness ∝ (1+<V>z</V>)<Sup>0</Sup> against
      the observed (1+<V>z</V>)<Sup>−4</Sup>, no microwave background at all,
      and — sharpest of the three — supernova light curves the{' '}
      <i>same width</i> at every redshift, where the measurement finds them
      stretched by (1+<V>z</V>). At <V>z</V> = 1 that is a factor of two, not a
      percent. It is the one place in this model that is not merely short but{' '}
      <b style={{ color: INK }}>contradicted</b>.
    </Note>

    <Head>what you can switch off</Head>

    <Note>
      The model kept producing accounts that were right about something and
      then superseded, and deleting them lost information — a superseded
      account is usually the same physics along a worse road. So every place it
      could have gone another way is a knob in <i>regimes.ts</i>, and each
      named theory below is a claim about which knobs to turn down.
    </Note>

    <Rows of={[
      [<span style={{ color: FAINT }}>Newton</span>,
        <>fold 0, screen 0. Flat space, infinite range. One sixth of the
          perihelion advance.</>],
      [<span style={{ color: FAINT }}>general relativity</span>,
        <>fold 1, screen 0. Six sixths and the whole of light’s deflection —
          and <b style={{ color: INK }}>borrowed, not counted</b>.</>],
      [<span style={{ color: FAINT }}>light</span>,
        <>turn 0. Never reverses, so no clock, so no mass. Not “a classical
          particle” — a photon.</>],
      [<span style={{ color: DERIVED }}>Dirac</span>,
        <>turn 1. The zigzag: <V>Ω</V><Sup>2</Sup> = <V>k</V><Sup>2</Sup> +{' '}
          <V>m</V><Sup>2</Sup>, λ<Sub>dB</Sub>, time dilation, and a modulus
          that is derived rather than postulated.</>],
      [<span style={{ color: FAINT }}>de Broglie by simultaneity</span>,
        <>sync 1. The superseded route to the same wavelength, kept switchable
          because it is the only account here that says anything about what a{' '}
          <i>composite</i> must do.</>],
    ]} />

    <Note>
      <i>check</i> refuses sync and turn together — they are two roads to
      λ = <V>h</V>/<V>p</V>, not two effects, and having both would count it
      twice. <i>borrows</i> is a separate question from <i>coherent</i>, and it
      returns non-empty for every setting with fold on, including this model’s
      own.
    </Note>

    <Head>and what is still owed</Head>

    <Note>
      <b style={{ color: INK }}>Nothing is borrowed.</b> The pull, <V>G</V>, the
      reach, <V>E</V> = ħω, λ = <V>h</V>/<V>p</V>, the amplitude rule,{' '}
      <V>A</V> and <V>B</V>, and <i>carry</i> — all counted. What is owed is of
      two other kinds, and they are worth keeping apart from each other as
      carefully as either was kept from <i>borrowed</i>.
    </Note>

    <Rows of={[
      [<span style={{ color: BORROWED }}>argued, not measured</span>,
        <>Only the two optional routes to a dark object now: <i>hold</i> rests
          on one emitter per edge, and <i>boost</i> on a threshold nothing
          fixes. <i>carry</i> has left this list — the position-dependent
          checkerboard was run and the packet follows the classical path.{' '}
          <i>regimes.ts</i> lists what remains under <i>untested</i>, and for
          the model’s own setting that is nothing.</>],
      [<span style={{ color: BORROWED }}>probably just wrong</span>,
        <>A neutron star shows about two thirds of its mass — outside any
          equation of state, and pulsar timing measures those directly.</>],
      [<span style={{ color: DERIVED }}>and one that turned over</span>,
        <><b style={{ color: INK }}>Dark matter.</b> The <i>force law</i> cannot
          touch it — Newton, GR and this model agree to a part in a million and
          all three miss by a factor of 3 at 20 kpc. Nine mechanisms were built
          and measured against a fully relaxed galaxy; seven are retired in the
          text with their reasons. What stands is <b style={{ color: INK }}>the
            transport route</b>: the carrier’s drift goes as the density it is
          passing through, flux conservation turns quadratic, and <i>both</i> the
          1/<V>r</V> law and the √<V>M</V> come out of one mechanism. Its
          crossover is <V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π —{' '}
          <b style={{ color: INK }}>computed from the frontier cosmology, not
            fitted</b> — which lands 9% from the measured{' '}
          <V>a</V><Sub>0</Sub> and fits the Milky Way’s curve to{' '}
          <b style={{ color: INK }}>1.1%</b>. Because the mean spacing shrinks by
          exactly the factor the clock speeds up by, that <V>a</V><Sub>0</Sub> is
          constant in redshift, and Genzel’s <V>z</V> ≈ 2 discs pass. It owes one
          link — that a carrier’s update cost goes as its accumulated phase.</>],
      [<span style={{ color: DERIVED }}>and four things to shoot at</span>,
        <>The shadow, <b style={{ color: INK }}>4.6% larger</b> than general
          relativity’s at the same mass — parameter-free, and inside the reach
          of an instrument that already exists. The age,{' '}
          <b style={{ color: INK }}>forced to 1/<V>H</V><Sub>0</Sub></b> with no
          freedom to miss, which the Hubble tension brackets.{' '}
          <b style={{ color: INK }}><V>a</V><Sub>0</Sub> = <V>cH</V><Sub>0</Sub>/2π</b>,
          computed rather than fitted, 9% from the measured value. And the one
          that dates it: <b style={{ color: INK }}><V>a</V><Sub>0</Sub> ∝ 1/<V>t</V></b>,
          so rotation curves at <V>z</V> = 2 should flatten at three times
          today’s acceleration — which MOND has no way to say and which the
          measurements can already refuse.</>],
    ]} />

    <Head>and the record of a road not taken</Head>

    <Note>
      What follows is kept because the two no-gos in it stay true whatever
      replaces them, and because the target moved out from under the whole
      programme once <V>A</V> and <V>B</V> turned out not to need a source at
      all. It was an attempt to build <V>B</V> from space being <i>made</i>{' '}
      somewhere and carried; the compounding above builds it from counting
      edges, and needs none of this.
    </Note>

    <Note>
      It had narrowed to a single question. The source was settled: creation{' '}
      <i>at</i> the body, which is the only mechanism that does not{' '}
      <i>consume</i> the field — and consuming it is fatal, because the event
      that sources a fold is the event that screens, so strength and range are
      reciprocal with their product pinned at 2. The transport is settled up to
      a factor: a surplus that hops is static and gives 1/<V>r</V> and misses{' '}
      <V>G</V> by 9.83. So:{' '}
      <b style={{ color: INK }}>does the lattice have a reason for a hopping
        point to keep its heading about 85% of the time?</b> That was, at the
      time, the whole of the remaining gap. A pure count did briefly seem to be
      sitting in
      plain sight — 10.21 = π<K>WAYS</K>/<K>SHEET</K> — but that is{' '}
      3<V>D</V>/<V>c</V>, which is <V>D</V> rewritten rather than a second fact,
      and the physical run is 7.67 cells. No coincidence to chase.
    </Note>

    <Note>
      <b style={{ color: INK }}>And both ways out of that are closed, by
        argument rather than by a measurement failing.</b> Whatever turns the
      hopping point must be <i>uniform</i> — with a turner of density{' '}
      ∝ <V>r</V><Sup>−n</Sup> the profile is 1/<V>r</V><Sup>1+n</Sup>, measured
      on a radial solve at 0.61, 1.03, 1.51, 2.00, 3.00 for{' '}
      <V>n</V> = −0.5 … 2, so only <V>n</V> = 0 gives 1/<V>r</V>. The model has
      exactly two uniform things: the lattice, and <V>Φ</V> — and <V>Φ</V> is
      forty-five orders short. So the turner is the lattice. But the lattice is
      neutral points at one to a cell, so a hopping surplus meets one{' '}
      <i>every hop</i> and turns every tick:{' '}
      <b style={{ color: INK }}><V>p</V> = 0, which is exactly the case that is
        nine times too strong.</b> The admissible turner gives the wrong{' '}
      <V>p</V>, and the right one has no mechanism.
    </Note>

    <Note>
      And a surplus that never moves cannot work either. Created from the flux
      and removed in place as <V>δ</V><Sup>q</Sup><V>r</V><Sup>−b</Sup>, the
      steady state is <V>δ</V> ∝ <V>m</V><Sup>1/q</Sup>/<V>r</V><Sup>(2−b)/q</Sup>,
      and shape and mass fight. Self-annihilation (<V>q</V> = 2) gives
      1/<V>r</V> exactly, static, with no transport and no <V>Φ</V> — and{' '}
      <b style={{ color: INK }}><V>δ</V> ∝ √<V>m</V></b>, so the pull would go
      as the square root of the mass. The only row satisfying both wants a
      removal partner with a 1/<V>r</V> density, and the model has none but the
      surplus itself, which makes it <V>q</V> = 2 again.
    </Note>

    <Note>
      So the source-and-carry route is worse than <i>one posited constant</i>:{' '}
      <b style={{ color: INK }}><V>B</V> is not one constant away from being{' '}
        <i>derived</i> — it is one constant away from being <i>consistent</i></b>,
      in either account, and that constant has no mechanism behind it in either.
    </Note>

    <Note>
      <b style={{ color: INK }}>And then the target moved.</b> All of that
      assumed <V>B</V> needs its own source. But a place has{' '}
      <K>WAYS</K> + <V>n</V> ways out, the <i>lean</i> is a ratio and the{' '}
      <i>total</i> is what a ratio throws away — <V>A</V> and <V>B</V> from the
      same count, with no surplus, no transport and no <V>D</V>. That is a claim
      with numbers, because <V>A</V> and <V>B</V> carry exactly two things the
      pull does not fix: <V>γ</V> and <V>β</V>.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>γ = 1, for free</span>,
        <>Reading one count two ways forces the space part and the time part to
          agree. That is the real content of “the same count read twice”, and{' '}
          <b style={{ color: INK }}>γ = 1 is what Cassini measures to
            2·10<Sup>−5</Sup></b>. Light’s deflection comes out at 1.0000 of
          its value, since that depends on γ alone.</>],
      [<span style={{ color: BORROWED }}>β = 3/2, against 1</span>,
        <>And β is not free: it puts the perihelion advance at{' '}
          <b style={{ color: INK }}>0.8334</b> — five sixths, where the panels
          measure 6.05 to 6.20. Wrong in a diagnostic place rather than
          uniformly, which is what makes it useful.</>],
      [<span style={{ color: FAINT }}>why β is hard</span>,
        <>Only exp(−2<V>u</V>) gives β = 1. A ratio 1/(1+<V>u</V>)<Sup>2</Sup>{' '}
          gives 3/2, and 1/(1+2<V>u</V>) gives 2. The count would have to
          compose <i>multiplicatively</i> — and <K>BIAS</K> is explicitly
          linear, “weight of the way it went, 1 + <V>n</V>”.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Which is where matter finally bears on it.</b>{' '}
      β is gravity gravitating: what a <i>second</i> annihilation at an{' '}
      <i>already-folded</i> place is worth. A lone tally cannot say — that is a
      statement about something in a field. If folding a place changes what the
      next annihilation there buys, the composition is multiplicative and β = 1
      follows. So the gap is not a transport rule and not a diffusivity:{' '}
      <b style={{ color: INK }}>it is whether 1 + <V>n</V> should be
        (1 + 1/<K>WAYS</K>)<Sup><V>n</V></Sup></b> — one line of the counting
      argument, in the one rule that has never been asked whether it stays
      linear all the way up.
    </Note>

    <Head>and it compounds, because edges point both ways</Head>

    <Note>
      A node that has taken <V>n</V> annihilations has{' '}
      <K>WAYS</K> + <V>n</V> edges. Edges are shared with neighbours, so{' '}
      <b style={{ color: INK }}>the same <V>n</V> extra edges point <i>into</i>{' '}
        it</b> — a charge nearby is (<K>WAYS</K>+<V>n</V>)/<K>WAYS</K> times
      more likely to arrive there. More arrivals, more annihilations, more
      folding, more arrivals. The increment is proportional to what is already
      there, which is what <i>multiplicative</i> means, and it is the counting
      argument’s own geometry rather than a new rule.
    </Note>

    <Eq derive={METRIC} open={show}
      note="the bare count, compounded by the fact that a folded node is easier to arrive at">
      d<V>u</V> = d<V>u</V><Sub>0</Sub>·(1 + <V>u</V>)
      <span style={{ padding: '0 1.4em', color: FAINT }}>⇒</span>
      1 + <V>u</V> = <V>e</V><Sup><V>u</V><Sub>0</Sub></Sup>
      <span style={{ padding: '0 1.4em', color: FAINT }}>⇒</span>
      <V>A</V> = <V>e</V><Sup>−2<V>u</V><Sub>0</Sub></Sup>,&nbsp;
      <V>B</V> = <V>e</V><Sup>+2<V>u</V><Sub>0</Sub></Sup>
    </Eq>

    <Note>
      Integrated from infinity inward, that lands on{' '}
      <V>e</V><Sup><V>u</V><Sub>0</Sub></Sup> − 1 to nine figures, with{' '}
      <V>u</V><Sub>0</Sub> the <i>bare</i> count — the pull’s own potential,
      already derived. The lean gives <V>A</V>, the total gives <V>B</V>, and{' '}
      <V>A·B</V> = 1 exactly, so γ = 1. Integrating the orbit between its
      turning points gives general relativity’s perihelion advance where the
      additive form gives 0.833 of it.{' '}
      <b style={{ color: INK }}>So <V>A</V> and <V>B</V> are not borrowed.</b>{' '}
      And nothing measured moves: the feedback’s correction beyond first order
      is 3.5·10<Sup>−16</Sup> at Mercury, 6.3·10<Sup>−5</Sup> in these panels.
    </Note>

    <Note>
      <b style={{ color: INK }}>And there are no horizons.</b> √<V>A</V> = 0
      needs 1 + <V>u</V> = ∞, so <V>n</V> = ∞ — a node would have to have{' '}
      <i>infinitely many ways out</i>, and each annihilation adds one, and a
      finite mass sends finitely many charges. At what general relativity calls
      the horizon (<V>u</V><Sub>0</Sub> = 2) the node has 6.4 extra ways out
      per <K>WAYS</K>: a lot, and not infinity. Light leaves, redshifted by{' '}
      <V>e</V><Sup>2</Sup> = 7.4. Nothing is ever cut off — things get
      arbitrarily red and arbitrarily slow and never quite vanish.
    </Note>

    <Head>so what is a black hole</Head>

    <Note>
      Not a question the metric answers — that only says nothing is cut off.
      What answers it is <i>screening</i>, which this model already has: a
      body’s charges annihilate against its <i>own</i> field on the way out, so
      only a skin of thickness <V>λ</V> ever reaches the outside, and{' '}
      <b style={{ color: INK }}>a body looks lighter than it is</b>.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>ordinary matter is transparent</span>,
        <><V>R</V>/<V>λ</V> is 10<Sup>−8</Sup> for the Earth and
          3·10<Sup>−5</Sup> for the Sun, so <V>M</V><Sub>eff</Sub>/<V>M</V> = 1
          to six figures. Nothing changes anywhere the model was tested.</>],
      [<span style={{ color: BORROWED }}>a neutron star is not</span>,
        <><V>R</V>/<V>λ</V> = 3.4, so it shows{' '}
          <b style={{ color: INK }}>about two thirds of its mass</b> — it was a
          half until the screening’s geometry was done properly, and that
          correction is worth a third of the gap and no more. Pulsar timing
          measures those masses directly and a third of the baryon content is
          outside any equation of state. The second falsifiable claim, and it
          looks worse for the model than the first.</>],
      [<span style={{ color: DERIVED }}>and it is holographic</span>,
        <>For <V>R</V> ≫ <V>λ</V>, <V>M</V><Sub>eff</Sub> → 4π<V>R</V><Sup>2</Sup><V>λρ</V>{' '}
          — the <i>area</i>, not the volume (10.6066 against{' '}
          <V>k</V> = 3/<K>SKIN</K> = 15/√2). The interior is sealed off by its
          own opacity rather
          than by a horizon, and what the universe knows about a big clump is a
          surface.</>],
    ]} />

    <Eq derive={REACH} open={show}
      note="the densest thing the lattice permits, and where it sits">
      <V>M</V><Sub>eff</Sub> = <Frac over={<V>k</V>} under={<>3</>} /><V>πR</V>
      <span style={{ padding: '0 1.4em', color: FAINT }}>⇒</span>
      <Frac over={<V>R</V>} under={<><V>R</V><Sub>s</Sub></>} /> =
      <Frac over={<>3</>} under={<>2π<V>Gk</V></>} /> = 0.7219
    </Eq>

    <Note>
      Once a tick is the ceiling, so the densest matter is one emitter a cell.
      Then <V>M</V><Sub>eff</Sub> ∝ <V>R</V> — Schwarzschild’s own scaling — so
      the ratio is the same at every size, measured flat from 10<Sup>5</Sup> to
      10<Sup>30</Sup> cells, and it is a pure count.{' '}
      <b style={{ color: INK }}>The densest thing the lattice permits sits
        inside its own Schwarzschild radius.</b>{' '}
      Which is a reversal: with the fog counted as still and even, the same
      arithmetic gave <V>M</V><Sub>eff</Sub> = π<V>R</V> and 2.5525, and this
      page used to say in bold that matter ran out of room before a black hole
      could form. It does not.
    </Note>

    <Note>
      <b style={{ color: INK }}>And it is inside its own photon sphere, which
        is the part that matters.</b> A ray leaves radius <V>r</V> with impact
      parameter <V>r·e</V><Sup>2<V>u</V></Sup>, whose extremum is at{' '}
      <V>u</V> = ½ and whose value there is 2<V>e·GM</V>/<V>c</V><Sup>2</Sup>{' '}
      — the shadow this page already had. The surface sits at{' '}
      <V>u</V> = 0.693, past it, so the object{' '}
      <b style={{ color: INK }}>casts a shadow of the full size</b> and keeps
      all but a 70° cone of its own light: a third gets out, at half frequency.
      Under the other defensible measure of what “meeting” means it is{' '}
      <V>u</V> = 1.18, a 37° cone and a tenth of the light. The threshold is{' '}
      <V>k</V> = 3/(2π<V>G</V>) = 7.66 and both clear it, so the convention
      moves how dark it is and not whether.
    </Note>

    <Note>
      <b style={{ color: INK }}>Still not Hawking radiation, though.</b>{' '}
      <V>u</V> is <i>M-independent</i> — the same for a stellar-mass object and
      a galactic one — so <V>T</V> ∝ <V>M</V><Sup>0</Sup> where Hawking needs{' '}
      <V>T</V> ∝ 1/<V>M</V> and a lifetime ∝ <V>M</V><Sup>3</Sup>. No
      evaporation, because nothing is trapped to begin with. And dark is not
      black: a tenth to a third of the surface’s light does escape, which
      something ought to see in a hot merger remnant.
    </Note>

    <Note>
      What would take it further is not the metric.{' '}
      <b style={{ color: INK }}>It is the self-screening.</b> With it,{' '}
      <V>R</V>/<V>R</V><Sub>s</Sub> = 0.72 at every size, a floor. Without it,{' '}
      <V>M</V> = (4/3)π<V>R</V><Sup>3</Sup> and the ratio falls as{' '}
      <V>R</V><Sup>2</Sup>, crossing one at 1.384 cells — after which{' '}
      <V>u</V> grows without bound and <V>e</V><Sup>−<V>u</V></Sup> does the
      rest.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>no horizon is needed</span>,
        <>A ball 5 cells across at maximum density has <V>u</V> = 6.5 and a
          redshift of 1.5·10<Sup>−3</Sup>; at 10 cells,
          4.5·10<Sup>−12</Sup>; at 50 cells,{' '}
          <b style={{ color: INK }}>2.7·10<Sup>−284</Sup></b>. Dark to any
          precision anyone will ever have, with <V>A</V> never once reaching
          nought.</>],
      [<span style={{ color: DERIVED }}>and coherence lifts the cap</span>,
        <>Self-screening needs <i>opposite</i> charges, and two of the same
          thing in step do not cancel — the panel above. Two emitters{' '}
          <V>Δr</V> apart meet with a phase difference <V>ωΔr</V>/<V>c</V>, so
          in step means{' '}
          <b style={{ color: INK }}><V>R</V> ≪ 2π/<V>m</V>, the Compton
            wavelength</b>. Then share → 0, <V>λ</V> → ∞,{' '}
          <V>M</V><Sub>eff</Sub> = <V>M</V>, and nothing caps <V>u</V>.</>],
      [<span style={{ color: BORROWED }}>and it is an upper bound on <V>m</V></span>,
        <>Not, as this page first had it, a requirement to sit <i>at</i> the
          heaviest elementary mass — that argument confused pulsing on the same
          tick with being in step where the charges meet, and{' '}
          <b style={{ color: INK }}>the ceiling is the shortest coherence range
            there is</b>, 10<Sup>−34</Sup> m. The condition is{' '}
          <V>m</V> &lt; 2π/<V>R</V>: below 6·10<Sup>−12</Sup> eV for something
          twelve kilometres across. An upper bound, so no fine-tuning — and it
          is the condition for the whole object to be one quantum state.</>],
      [<span style={{ color: DERIVED }}>and R is the other way in</span>,
        <><V>R</V> &lt; 2π/<V>m</V> constrains <V>R</V> as much as <V>m</V>.
          Squeeze <i>ordinary</i> matter below its own Compton wavelength and it
          self-coheres — so the cap{' '}
          <b style={{ color: INK }}>rises as the body shrinks</b>,{' '}
          <V>u</V><Sub>cap</Sub> = 16π<Sup>2</Sup><V>G</V>/(<V>mR</V>·<K>SHEET</K>).
          Dark once <V>R</V> &lt; 5·10<Sup>−19</Sup> m for protons — a
          thousandth of a fermi. No exotic matter needed.</>],
      [<span style={{ color: BORROWED }}>what it does not fix</span>,
        <>A neutron star is twenty orders too big to cohere, so it still shows
          about two thirds of its mass, and that is still outside any equation
          of state.</>],
    ]} />

    <Note>
      Four other permutations were tried and none works.{' '}
      <i>A hollow shell</i>: a point inside sees a tangential chord of
      √(2<V>Rt</V>), not <V>t</V> — 77 m for a kilometre shell a metre thick,
      so geometry cannot beat a fermi. <i>A phase ramp</i>: a phased array
      aligns one direction and misaligns the rest, and screening samples every
      pair inside, so it redistributes share over angle rather than lowering
      it. <i>Net charge</i>: not available, since neutral → + − makes them in
      pairs. <i>Lower density</i>: it cancels out of the cap entirely.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the collapse has nothing to stop it.</b> In
      general relativity a star reaches its horizon and is done; here no radius
      is marked, so it continues. On the way it passes through the screened
      regime as a compact object with <V>u</V> pinned at 0.693 — which is{' '}
      <i>not</i> a support, since screening attenuates only what <i>leaves</i>{' '}
      while the field between neighbours is short-range and unscreened. So it
      runs to the lattice ceiling, and a solar mass ends as a ball
      10<Sup>−22</Sup> m across: dark by redshift, with nothing ever causally
      severed.
    </Note>

    <Note>
      What an observer sees is unchanged, because that is fixed by the metric a
      few Schwarzschild radii out, where <V>u</V> ~ ½ and the exponential and
      isotropic forms agree closely.{' '}
      <b style={{ color: INK }}>There is still a photon sphere and still a
        shadow.</b> What differs is what sits at the middle — ceiling-density
      matter rather than a singularity — and how it got there.
    </Note>

    <Head>and a second way, kept alongside</Head>

    <Note>
      A node with <K>WAYS</K> + <V>n</V> edges gives a source <i>sitting there</i>{' '}
      more ways to pulse into, so <K>SHEET</K> → <K>SHEET</K>(1+<V>u</V>) and
      emission — which <i>is</i> mass — is boosted. A feedback on the{' '}
      <b style={{ color: INK }}>source</b>, where the compounding was a feedback
      on the <b style={{ color: INK }}>transport</b>. The once-a-tick ceiling
      stops binding, because the ceiling was on how <i>often</i>, not how{' '}
      <i>many</i>.
    </Note>

    <Eq derive={METRIC} open={show}
      note="unlike e^u₀ this diverges at finite depth — which is a horizon">
      <V>M</V><Sub>eff</Sub> = <V>M</V>(1 + <V>κu</V>)
      <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
      <V>u</V> = <Frac over={<><V>u</V><Sub>0</Sub></>}
        under={<>1 − <V>κu</V><Sub>0</Sub></>} />
      <span style={{ padding: '0 1.2em', color: FAINT }}>→ ∞ at <V>u</V><Sub>0</Sub> = 1</span>
    </Eq>

    <Rows of={[
      [<span style={{ color: DERIVED }}>it restores horizons</span>,
        <><V>A</V> = <V>e</V><Sup>−2<V>u</V></Sup> is 4.2·10<Sup>−1</Sup> at{' '}
          <V>u</V><Sub>0</Sub> = 0.3, 1.5·10<Sup>−8</Sup> at 0.9, and{' '}
          <b style={{ color: INK }}>exactly nought at 1</b> — a genuine horizon
          at <V>r</V> = <V>GM</V>/<V>c</V><Sup>2</Sup>, which the transport
          feedback alone could never produce.</>],
      [<span style={{ color: BORROWED }}>but it costs a threshold</span>,
        <>β = 1 − <V>κ</V>, and β is known to 3·10<Sup>−4</Sup>. At{' '}
          <V>κ</V> = 1 the perihelion advance is{' '}
          <b style={{ color: INK }}>eight sixths where the panels measure
            six</b> — 33% high, excluded by three thousand. It survives only if
          the boost begins above <V>u</V><Sup>2</Sup>, at a depth nothing has
          fixed. <K>BIAS</K> saturating as <V>n</V>/(<K>WAYS</K>+<V>n</V>) turns
          over at <V>u</V> ~ 1, which is at least where such a threshold would
          sit.</>],
    ]} />

    <Note>
      <b style={{ color: INK }}>Both are kept, because they differ where it
        matters.</b> Both give a photon sphere and a shadow, so images do not
      separate them. Route one leaves a <i>surface</i> — ringdown echoes, no
      information loss, arbitrarily red but finite escape — and needs no free
      parameter, since collapse below λ<Sub>C</Sub> is a definite radius. Route
      two gives a true horizon and ordinary black-hole phenomenology, and needs
      a threshold nobody has derived. <i>regimes.ts</i> carries it as{' '}
      <i>boost</i>, off by default.
    </Note>

    <Head>and how big is it, really</Head>

    <Note>
      <V>R</V><Sub>c</Sub> = 1.96 is a <i>coordinate</i> radius, and nothing
      measures those. What anything measures is the areal one — the sphere at{' '}
      <V>r</V> has proper area 4π<V>r</V><Sup>2</Sup><V>B</V>, so{' '}
      <V>r</V><Sub>areal</Sub> = <V>r</V>·<V>e</V><Sup><V>u</V></Sup>. Which is
      the same statement as{' '}
      <b style={{ color: INK }}>“a node with <K>WAYS</K> + <V>n</V> edges
        touches far more than a cell’s worth of neighbours”</b>, measured rather
      than counted.
    </Note>

    <Eq derive={METRIC} open={show}
      note="the area does not shrink to nothing — it has a narrowest point, and inside that it grows again">
      <Frac over={<>d</>} under={<>d<V>r</V></>} />
      <Paren><V>r e</V><Sup><V>GM</V>/<V>r</V></Sup></Paren> = 0
      <span style={{ padding: '0 1.2em', color: FAINT }}>at</span>
      <V>r</V> = <V>GM</V>/<V>c</V><Sup>2</Sup>
      <span style={{ padding: '0 1.2em', color: FAINT }}>⇒</span>
      <V>r</V><Sub>areal</Sub> = <V>e</V>·<V>GM</V>/<V>c</V><Sup>2</Sup> =
      1.3591 <V>R</V><Sub>s</Sub>
    </Eq>

    <Note>
      <b style={{ color: INK }}>The area has a throat</b>, and inside it the
      area grows again without bound — so the geometry is not a point but a
      narrow neck opening into something vast, at a ratio that is scale-free.
      A solar mass at <V>R</V><Sub>c</Sub> has <V>u</V> = 4.7·10<Sup>37</Sup>,
      hence an areal radius of 10<Sup>(2·10³⁷)</Sup> cells and a node carrying
      1.2·10<Sup>39</Sup> edges.{' '}
      <b style={{ color: INK }}>Two cells across and enormous at once</b>, and
      those are one fact. (That figure uses the <i>exterior</i> <V>u</V> where
      the interior solution applies, so it is right in kind and not in detail.
      The throat is exact.)
    </Note>

    <Eq derive={METRIC} open={show}
      note="and this is the one number in the whole model that an instrument can settle now">
      <V>b</V> = 2<V>e</V>·<V>GM</V>/<V>c</V><Sup>2</Sup>
      <span style={{ padding: '0 1.2em', color: FAINT }}>against</span>
      3√3·<V>GM</V>/<V>c</V><Sup>2</Sup>
      <span style={{ padding: '0 1.2em', color: FAINT }}>=</span>
      1.0463
    </Eq>

    <Shadows />

    <Note>
      Same mass, same camera, same disc — the only difference between the two is{' '}
      <V>A</V> and <V>B</V>. Rays are traced backwards from the eye until they
      escape or run into the matter, which is the only thing that stops one
      here, there being no horizon to fall through. The disc is thin and seen
      nearly edge on, so its far side is bent up over the top and down under the
      bottom; that arch is what makes the shadow’s edge legible at all. The
      solid ring is general relativity’s critical impact parameter and the
      dashed one is this model’s, both drawn on both panels.
    </Note>

    <Seam />

    <Note>
      Two panels ask the eye to remember a radius while it travels between them,
      which it is bad at. Cut down the middle instead — general relativity left
      of the seam, the counted metric right of it, everything else identical —
      and{' '}
      <b style={{ color: INK }}>the shadow’s edge and the photon ring both step
        as they cross it</b>. A step is something the eye is very good at. Each
      side keeps its own colour, and each critical radius is drawn as a half-arc
      on its own side.
    </Note>

    <Overlay />

    <Note>
      And laid on top of each other rather than beside:{' '}
      <b style={{ color: INK }}>amber and blue cancel to pale wherever the two
        agree, and whatever is left over is the difference</b>. So the image is
      white except for a coloured rim around the shadow and along every lensed
      edge — blue outside, because this model’s shadow is the larger. Nothing is
      exaggerated; it is the same 4.6% at its true size. Traced rather than
      derived, the two edges come out at 5.196153 and 5.436619 against closed
      forms of 5.196152 and 5.436564.
    </Note>

    <Note>
      The photon sphere is where d/d<V>r</V>(<V>r</V><Sup>2</Sup><V>B</V>/<V>A</V>) = 0;
      with <V>B</V>/<V>A</V> = <V>e</V><Sup>4<V>u</V></Sup> that is{' '}
      <V>r</V><Sub>ph</Sub> = 2<V>GM</V>, and the shadow’s impact parameter is{' '}
      <V>b</V> = <V>r</V>·<V>e</V><Sup>2<V>u</V></Sup>. So{' '}
      <b style={{ color: INK }}>the shadow is 4.6% larger than general
        relativity’s at the same mass</b> — a fixed, parameter-free ratio.
      Measure the mass from orbits and the shadow from imaging, and this
      predicts a constant mismatch between them. It sits inside the Event
      Horizon Telescope’s present ~10% systematic error and outside what it is
      aiming for, which makes it a near-term test rather than a philosophical
      one, and the only claim here an existing instrument can settle.
    </Note>

    <Head>and do the two dark objects look different</Head>

    <Note>
      <b style={{ color: INK }}>No — they are the same picture.</b> A shadow is
      set by the photon sphere, and both routes share the whole exterior{' '}
      <V>A</V> = <V>e</V><Sup>−2<V>u</V><Sub>0</Sub></Sup> down to it. What
      separates them lies <i>below</i> the ring, where no image can reach: route
      one has a surface at <V>R</V><Sub>c</Sub>, route two a horizon at{' '}
      <V>u</V><Sub>0</Sub> = 1.
    </Note>

    <Routes />

    <Note>
      Which makes the gate an observable. The boost has to wake up below some
      depth <V>u</V>* or β goes wrong — and the unboosted photon sphere sits at{' '}
      <V>u</V><Sub>0</Sub> = ½:{' '}
      <b style={{ color: INK }}>gate it deeper and route two is pixel for pixel
        route one; gate it shallower and the shadow balloons</b> — 7.1% over
      general relativity at <V>u</V>* = 0.4, 49% with no gate at all. The third
      panel is that last case, drawn not because the model says it but to show
      what being wrong would look like. It is far outside what the Event Horizon
      Telescope allows, so imaging already constrains where the gate can sit.
    </Note>

    <Note>
      The usual fallback is a <i>ringdown</i>: a horizon absorbs what falls
      through it and the signal stops, while a surface reflects and the wave
      trapped under the photon sphere leaks back out as late echoes — which is
      what LIGO and Virgo searches look for.{' '}
      <b style={{ color: INK }}>This page said that separates the two routes.
        It does not.</b>
    </Note>

    <Echoes />

    <Note>
      The delay is the round trip at the coordinate speed of light,{' '}
      Δ<V>t</V> = 2∫<V>e</V><Sup>2<V>GM</V>/<V>r</V></Sup>d<V>r</V>/<V>c</V>.
      For a surface at 0.3 <V>GM</V>/<V>c</V><Sup>2</Sup> that is 116{' '}
      <V>GM</V>/<V>c</V> — 0.6 ms at a solar mass, easily heard. But{' '}
      <V>R</V><Sub>c</Sub> is 1.96 <i>cells</i>, so a solar mass puts the
      surface at 2·10<Sup>−38</Sup> <V>GM</V> and the delay carries a factor{' '}
      <V>e</V><Sup>(9·10³⁷)</Sup>.{' '}
      <b style={{ color: INK }}>The echoes never come back — not late,
        never.</b>
    </Note>

    <Note>
      So the two routes are observationally identical, full stop: image and
      ringdown alike. A horizon and a Planck-scale surface are the same thing to
      anybody outside, because <i>no echo ever</i> and <i>no echo possible</i>{' '}
      are not distinguishable measurements.{' '}
      <b style={{ color: INK }}>The model does not predict echoes</b>, and it
      would be wrong to advertise horizonlessness as though it did. What remains
      observable is the shadow, and nothing at all about the interior.
    </Note>

    <Head>so both are optional, and how one might still tell</Head>

    <Note>
      Neither route is required by anything else here — a dark object is
      reachable through <i>spatial density</i> or through the emission boost,
      and <b style={{ color: INK }}>the two cannot be told apart</b>. The
      obstacle is structural: the boost only changes the metric where its gate
      is open, the gate must sit below the photon sphere, so the two are
      identical outside 2<V>GM</V>/<V>c</V><Sup>2</Sup> and differ only inside
      it — and nothing returns from inside a photon sphere carrying
      information. That is the geometry, not the instruments.
    </Note>

    <Rows of={[
      [<span style={{ color: DERIVED }}>the one thing that escapes</span>,
        <>Hawking radiation is a property of a horizon <i>existing</i>, not of
          anything crossing it — so a surface has none, however deep, and{' '}
          <b style={{ color: INK }}>that difference does not shrink with
            depth</b>, which is what killed every other test.</>],
      [<span style={{ color: DERIVED }}>and where it shows</span>,
        <>The Hawking lifetime reaches the age of the universe at
          1.7·10<Sup>14</Sup> g, so below about 10<Sup>15</Sup> g the two
          disagree about whether the object <i>exists today</i>. Under the boost
          the missing evaporation gamma-rays exclude light primordial black
          holes as dark matter; under spatial density that exclusion vanishes
          and the window reopens.</>],
      [<span style={{ color: BORROWED }}>and the objection</span>,
        <>A surface at extreme redshift can <i>mimic</i> a horizon
          thermodynamically — a collapsing object radiates a burst approaching
          a thermal spectrum as it settles. Whether the mimicry is exact or
          only good for a while is not settled here, and the answer decides
          whether this discriminator is real.</>],
    ]} />

    <Note>
      Neither route fixes the neutron star, and route two makes it slightly
      worse — a boost at <V>u</V> ~ 0.2 raises emission, which raises{' '}
      <V>Φ</V>, which screens harder. And what would settle route two from inside the model is
      whether <K>SHEET</K> scales with a node’s edge count or is fixed by the
      dimension: <i>field.ts</i> says the latter, 3<Sup><V>d</V>−1</Sup> − 1, a
      property of the lattice rather than of the place.{' '}
      <b style={{ color: INK }}>Route two needs that reading changed; route one
        does not.</b>
    </Note>

    <Note>
      And <i>carry</i> cannot help with any of it, which is worth saying because
      it is the last borrowed thing and the temptation is to hang the leftovers
      on it. <i>carry</i> is d<V>p</V>/d<V>t</V> — the equation of motion, and
      nowhere else. Redshift is 1/√<V>A</V>, light’s speed is <V>c</V>√(<V>A</V>/<V>B</V>),
      a horizon is <V>A</V> = 0.{' '}
      <b style={{ color: INK }}>Change <i>carry</i> and orbits change; not one
        of those three moves.</b>
    </Note>

    <Note>
      Two things bound whatever answers it. An ambient charge{' '}
      <b style={{ color: INK }}>screens</b>, so a vacuum dense enough to carry
      anything is dense enough to switch gravity off within a few steps — which
      is why the hop matters, since it needs no vacuum at all. And a body{' '}
      <b style={{ color: INK }}>cannot take back</b> what it emits: measured on
      a running lattice, at most two parts in a thousand return, because a
      source emits into 4<V>π</V> and subtends nothing.
    </Note>

    {open ? <Panel of={open} onClose={hide} /> : null}

  </div>;
};
