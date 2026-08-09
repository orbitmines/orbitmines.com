import { Fragment, ReactNode, useEffect, useRef, useState } from "react";

import { GRAIN } from "./gravity";

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
 */

const INK = '#c6c9d4';
const DIM = '#8a8d99';
const FAINT = '#6c7080';
const RULE = '#1c1e27';
const NAMED = '#e0a878';        // a count the lattice fixes
const DERIVED = '#7fb8d4';      // something that came out

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

    <Because>per tick of whose clock</Because>
    <Step eq={<>
      <B>v</B> = <Frac over={<B>u</B>}
        under={<>√(1 + |<B>u</B>|<Sup>2</Sup>/<K>LIGHT</K><Sup>2</Sup>)</>} />
    </>}>
      The counting happens on the body’s own worldline, so{' '}
      <K>LIGHT</K>·<V>n</V>/<K>WAYS</K> is cells per tick of <i>its</i> clock —
      a proper velocity, not a coordinate one. Turning that into what the
      picture shows is one line of arithmetic the model does not get to choose.
      Nothing is clamped: the ceiling at <K>LIGHT</K> is the one arithmetic
      already has.
    </Step>

    <Because>and so</Because>
    <Step eq={<>
      <Frac over={<>d</>} under={<>d<V>t</V></>} />
      ( <V>m</V><Sub>a</Sub> <B>u</B><Sub>a</Sub> ) &nbsp;=&nbsp;
      <K>BIAS</K> · <V>S</V><Sub>ab</Sub>
    </>}>
      A body’s count grows by <K>BIAS</K>·<V>S</V> divided by its own mass —
      the <i>fraction</i> of its paths that were bent, since its path count is
      its mass. Multiply back through and the mass cancels out of the statement
      entirely. And <V>m</V><B>u</B> = <V>γm</V><B>v</B> is momentum, so what
      the equation says is that <b style={{ color: INK }}>momentum gained is{' '}
        <K>BIAS</K> times annihilations taken part in</b>.
    </Step>

    <Because>what falls out of it</Because>
    <Step>
      Dividing by <V>m</V><Sub>a</Sub> leaves{' '}
      <V>a</V><Sub>a</Sub> ∝ <V>m</V><Sub>b</Sub>/<V>R</V><Sup>2</Sup> — the
      equivalence principle as a counting statement rather than a postulate.
      And differentiating <B>v</B>(<B>u</B>) gives 1/<V>γ</V><Sup>3</Sup> along
      the way a thing is going and 1/<V>γ</V> across it: special relativity’s
      own response, out of a count of ways out of a point.
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
      <K>BITE</K> = 2 is what the rule says one meeting costs — a point for
      each charge. <i>share</i> is how much of what meets is opposite rather
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
    <Step eq={<><V>c</V> = <Frac over={<K>HALF</K>} under={<K>GRAIN</K>} /></>}>
      A source’s core, in drawn cells. <K>HALF</K> is half a lattice step — a
      shell is never smaller than the cell its source sits in — and{' '}
      <K>GRAIN</K> is how many lattice steps a drawn cell stands for.
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

    <Because>substitute met, with share = ½ and BITE = 2</Because>
    <Step eq={<>
      <Frac over={<>d<V>p</V></>} under={<>d<V>t</V></>} /> =
      <Frac over={<><K>SHEET</K><Sup>2</Sup></>}
        under={<>4<V>π</V><Sup>2</Sup><V>c</V> <K>WAYS</K></>} /> ·
      <Frac over={<><V>m</V><Sub>a</Sub><V>m</V><Sub>b</Sub></>}
        under={<><V>R</V><Sup>2</Sup></>} />
      <Paren>1 + <Frac over={<V>c</V>} under={<V>R</V>} /> ln
        <Frac over={<><V>R</V>−<V>c</V></>} under={<V>c</V>} /></Paren>
    </>}>
      The 4 from met, the 2 from <K>BITE</K> and the ½ from <i>share</i> fold
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
      The whole of the model’s departure from Newton at a distance is that
      bracket, and its size is the ratio of a source’s core to the separation.
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
      note="the momentum a body gains is BIAS times the annihilations it took part in">
      <Frac over={<>d</>} under={<>d<V>t</V></>} />
      ( <V>γ</V> <V>m</V><Sub>a</Sub> <B>v</B><Sub>a</Sub> )
      &nbsp;=&nbsp; <K>BIAS</K> · <span style={{ fontSize: '1.3em' }}>Σ</span>
      <Sub>b ≠ a</Sub> &nbsp;<V>S</V><Sub>ab</Sub> <Hat>r</Hat><Sub>ab</Sub>
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
      [<><K>BITE</K> = 2</>,
        <>points an annihilation removes — one for each charge</>],
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
      [<span style={{ color: DERIVED }}>screen</span>,
        <>Three bodies in a row do not simply add. Newton has no such term and
          neither does relativity at this order.</>],
    ]} />

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
      ratio of a source’s core to the separation. The <V>γ</V> on the left is
      worth <b style={{ color: INK }}>+1.67°</b> of Mercury’s perihelion an
      orbit where Schwarzschild gives <b style={{ color: INK }}>+10.41°</b> —
      the right sign, and a sixth of the size. The missing five sixths, and the
      whole of light’s deflection, are the part of a metric that says how
      lengths differ radially against transversely. This keeps one number per
      place, and cannot say it.
    </Note>

    {open ? <Panel of={open} onClose={hide} /> : null}

  </div>;
};
