import { Fragment, ReactNode, useEffect, useRef, useState } from "react";

import { GRAIN } from "./gravity";
import { Echoes } from "./echoes";
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
      [<span style={{ color: BORROWED }}>what is owed instead</span>,
        <>A different kind of debt, and a smaller one. The checkerboard was
          measured in <i>flat</i> space, with a reversal amplitude constant
          everywhere; letting it vary as <V>m e</V><Sup>−<V>u</V><Sub>0</Sub></Sup>{' '}
          is standard for a slowly varying mass term and{' '}
          <b style={{ color: INK }}>has not been run</b>. So the chain closes
          analytically and its last link is unmeasured —{' '}
          <i>regimes.ts</i> tracks that under <i>untested</i> rather than{' '}
          <i>borrows</i>.</>],
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
          neutron star shows about half its mass, which is outside any equation
          of state and is the one place the model is probably just wrong.</>],
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
      for the <i>observed</i> <V>H</V> and it fails five separate ways, each
      worth recording because each is a fact rather than a failure to try:
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
    ]} />

    <Note>
      <b style={{ color: INK }}>And all five have the same sign</b>, which is
      the thing worth noticing. The usual embarrassment is a vacuum energy
      10<Sup>120</Sup> too <i>large</i>; every mechanism this lattice has runs
      the other way — 35 orders short on the vacuum route, 61 on the matter
      route. So the model does not have the cosmological constant problem, it
      has its mirror image, and a model that cannot make the universe expand at
      all is wrong in a way that can be stated and looked for.
    </Note>

    <Note>
      So: no expansion, no dark energy, no thermal history, and — since ± pairs
      are made in pairs — no matter/antimatter asymmetry either.
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
        <><i>carry</i> matches stationary phase to 10<Sup>−7</Sup>, but the
          checkerboard behind it was run in <i>flat</i> space. A
          position-dependent reversal amplitude has not been tried. Likewise{' '}
          <i>hold</i> rests on one emitter per edge, and <i>boost</i> on a
          threshold nothing fixes. <i>regimes.ts</i> lists these under{' '}
          <i>untested</i>.</>],
      [<span style={{ color: BORROWED }}>probably just wrong</span>,
        <>A neutron star shows about half its mass — outside any equation of
          state, and pulsar timing measures those directly. And cosmology comes
          out empty five separate ways, every one of them short rather than
          long.</>],
      [<span style={{ color: DERIVED }}>and one thing to shoot at</span>,
        <>The shadow, 4.6% larger than general relativity’s at the same mass.
          Parameter-free, and inside the reach of an instrument that already
          exists.</>],
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
          <b style={{ color: INK }}>about half its mass</b>. Pulsar timing
          measures those masses directly and a factor of two in baryon content
          is outside any equation of state. The second falsifiable claim, and
          it looks worse for the model than the first.</>],
      [<span style={{ color: DERIVED }}>and it is holographic</span>,
        <>For <V>R</V> ≫ <V>λ</V>, <V>M</V><Sub>eff</Sub> → 4π<V>R</V><Sup>2</Sup><V>λρ</V>{' '}
          — the <i>area</i>, not the volume (0.029406 against 3<V>λ</V>/<V>R</V>{' '}
          = 0.030000). The interior is sealed off by its own opacity rather
          than by a horizon, and what the universe knows about a big clump is a
          surface.</>],
    ]} />

    <Eq derive={REACH} open={show}
      note="the densest thing the lattice permits, and where it sits">
      <V>M</V><Sub>eff</Sub> = <V>πR</V>
      <span style={{ padding: '0 1.4em', color: FAINT }}>⇒</span>
      <Frac over={<V>R</V>} under={<><V>R</V><Sub>s</Sub></>} /> =
      <Frac over={<>1</>} under={<>2π<V>G</V></>} /> =
      <Frac over={<>2π<K>WAYS</K></>} under={<><K>SHEET</K><Sup>2</Sup></>} /> = 2.5525
    </Eq>

    <Note>
      Once a tick is the ceiling, so the densest matter is one emitter a cell.
      Then <V>M</V><Sub>eff</Sub> ∝ <V>R</V> — Schwarzschild’s own scaling — so
      the ratio is the same at every size, measured at 2.5525 from{' '}
      10<Sup>10</Sup> to 10<Sup>40</Sup> cells, and it is a pure count.{' '}
      <b style={{ color: INK }}>The densest thing the lattice permits sits at
        two and a half of its own Schwarzschild radii and can never be
        inside.</b> So black holes do not fail to form because the metric lacks
      a horizon — they fail because matter runs out of room first, and those are
      two independent facts that happen to agree.
    </Note>

    <Note>
      <b style={{ color: INK }}>And the leakage is not Hawking radiation.</b> At
      the surface <V>u</V> = <V>πG</V> = 0.1959, so light leaves redshifted by
      0.822 — an 18% shift, and <i>M-independent</i>, the same for a
      stellar-mass object and a galactic one. Hawking needs <V>T</V> ∝ 1/<V>M</V>{' '}
      and a lifetime ∝ <V>M</V><Sup>3</Sup>; this gives <V>T</V> ∝ <V>M</V><Sup>0</Sup>{' '}
      and no evaporation at all, because nothing is trapped to begin with. The
      “never quite vanishing” path is ordinary light out of a shallow well, and
      it is not even slow.
    </Note>

    <Note>
      Which reads as a bill until you ask what is actually blocking it — and it
      is not the metric.{' '}
      <b style={{ color: INK }}>It is the self-screening.</b> With it,{' '}
      <V>R</V>/<V>R</V><Sub>s</Sub> = 2.55 at every size, a floor. Without it,{' '}
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
          about half its mass, and that is still outside any equation of
          state.</>],
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
      regime as a compact object with <V>u</V> pinned at 0.196 — which is{' '}
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
