import { Button } from "@blueprintjs/core";
import { Fragment, useMemo, useRef, useState } from "react";

import { Row } from "../../../lib/post/Post";
import { ContinuousField } from "./continuous";
import { Graph } from "./discrete";
import { GraphCanvas } from "./GraphCanvas";
import { MetricField } from "./metric";
import { Closed, closedOf, Lattice, latticeOf, metricOf, Model, newtonOf } from "./model";
import { NewtonField } from "./newton";

// The transport icons, which are the only things here that are only pictures.
// Font Awesome Free v7.3.1 by @fontawesome — https://fontawesome.com/license/free
const ICONS = {
  pause: "M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z",
  reset: "M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z",
  play: "M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z",
  step: "M149 100.8C161.9 93.8 177.7 94.5 190 102.6L448 272.1L448 128C448 110.3 462.3 96 480 96C497.7 96 512 110.3 512 128L512 512C512 529.7 497.7 544 480 544C462.3 544 448 529.7 448 512L448 367.9L190 537.5C177.7 545.6 162 546.3 149 539.3C136 532.3 128 518.7 128 504L128 136C128 121.3 136.1 107.8 149 100.8z",
};

const Transport = ({ icon, onClick }: { icon: keyof typeof ICONS, onClick: () => void }) => (
  <Button minimal className="p-0" style={{ minWidth: 0, minHeight: 0 }} onClick={onClick}>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style={{ width: '1em' }} fill="#515254">
      <path d={ICONS[icon]} />
    </svg>
  </Button>
);

/**
 * One universe, ticking, with transport controls.
 */
const LatticePlayer = ({
  seed = () => Graph.grid(),
  ticks,
  autoplay = true,
  height = 150,
  density = true,
  mode = 'lattice',
  interval = 0.45,
}: Lattice) => {
  const [running, setRunning] = useState(autoplay);

  /**
   * The live universe. Held in a ref rather than state because resetting
   * swaps the whole graph out mid-animation-frame — the render loop reads it
   * afresh every frame, so it picks the new one up without tearing down.
   *
   * And nothing at all while the view is off screen. A universe here is some
   * thousands of points, each with twenty-six boundaries and a projection
   * cached against it, and there are thirty of these on the page — so what
   * is being held between the reader scrolling past a picture and scrolling
   * back to it is tens of megabytes of a thing nobody can see. Dropped, it
   * is a null and a re-seed.
   *
   * Which is not a loss of anything, because there is nothing here to lose.
   * The dynamics are stochastic, and a repeating example throws its universe
   * away and re-seeds every `ticks` ticks anyway: coming back to one of
   * these is coming back to a fresh run whether it was let go of or not.
   * Seeded lazily rather than eagerly for the same reason as everything else
   * in this — thirty seeds built at mount is thirty universes' worth of work
   * for the one or two that can be seen.
   */
  const graphRef = useRef<Graph | null>(null);

  // Ticks taken since the last reset, against which `ticks` is measured.
  const stepsRef = useRef(0);

  const reset = () => {
    graphRef.current = seed();
    stepsRef.current = 0;
  };

  const step = () => {
    graphRef.current?.tick();
    stepsRef.current++;
  };

  // Step the polarity dynamics once every `interval` seconds while running —
  // annihilation / turn-around / structure-absorption.
  const accum = useRef(0);

  /**
   * Made when it is first looked at, and let go of the moment it is not.
   *
   * Except when it is paused, which is the one case where the state on
   * screen is something the reader chose. Stopping a run at a particular
   * tick to look at it, scrolling a little too far, and coming back to a
   * fresh one would be losing the thing they stopped for. A running view has
   * no such state — it is somewhere in the middle of a loop that resets
   * every `ticks` ticks regardless — so there is nothing to lose in letting
   * it go, and coming back to it starts the run again from the top, which is
   * where it wants to be watched from anyway.
   */
  const onVisible = (visible: boolean) => {
    if (!visible) {
      if (!running) return;

      graphRef.current = null;
      accum.current = 0;
      return;
    }

    if (running || !graphRef.current) reset();
  };

  const onFrame = (dt: number) => {
    if (!running || !graphRef.current?.nodes.length) return;

    accum.current += dt;
    while (accum.current >= interval) {
      accum.current -= interval;

      // A repeating pattern spends one interval showing the seed again
      // before stepping on, so the loop point is legible rather than an
      // instant jump back.
      if (ticks !== undefined && stepsRef.current >= ticks) reset();
      else step();
    }
  };

  return <div>
    <div style={{ height }}>
      <GraphCanvas
        graph={() => graphRef.current}
        animate
        density={density}
        mode={mode}
        onFrame={onFrame}
        onVisible={onVisible}
      />
    </div>
    <Row end="xs" className="child-px-2">
      {running
        ? <>
          <div style={{ width: '1em' }}></div>
          <Transport icon="pause" onClick={() => setRunning(false)} />
          <div style={{ width: '1em' }}></div>
        </>
        : <>
          <Transport icon="reset" onClick={reset} />
          <Transport icon="play" onClick={() => setRunning(true)} />
          <Transport icon="step" onClick={step} />
        </>
      }
    </Row>
  </div>
};

/**
 * The static form: the same pattern, but every step of it laid out at once.
 *
 * The dynamics are stochastic (which boundary a ray turns around to, what
 * polarity a newly created point gets), so the states can't be re-derived by
 * re-running the seed — running it again gives a different history. One run
 * is stepped through, and each state along the way is cloned out of it, so
 * the strip really is consecutive states of a single universe.
 */
const LatticeFilmstrip = ({
  seed = () => Graph.grid(),
  ticks = 8,
  height = 150,
  density = true,
  mode = 'lattice',
}: Lattice) => {
  const frames = useMemo(() => {
    const graph = seed();
    const states = [graph.clone()];

    for (let i = 0; i < ticks; i++) {
      graph.tick();
      states.push(graph.clone());
    }

    return states;
  }, []);

  return <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
    {frames.map((graph, i) => (
      <Fragment key={i}>
        {i > 0
          ? <div style={{ flex: '0 0 auto', padding: '0 0.5em', color: '#515254' }}>→</div>
          : null}
        <div style={{ flex: '1 1 120px', height }}>
          <GraphCanvas graph={() => graph} density={density} mode={mode} />
        </div>
      </Fragment>
    ))}
  </div>
};

const LatticeView = ({ filmstrip, ...rest }: Lattice) =>
  filmstrip ? <LatticeFilmstrip {...rest} /> : <LatticePlayer {...rest} />;

const ClosedView = ({ sources = [], span, cycle, rate, height = 320 }: Closed) =>
  <ContinuousField sources={sources} span={span} cycle={cycle} rate={rate} height={height} />;

const MetricView = ({ sources = [], span, cycle, rate, summary, height = 320 }: Closed) =>
  <MetricField
    sources={sources} span={span} cycle={cycle} rate={rate}
    summary={summary} height={height}
  />;

const NewtonView = ({ sources = [], span, cycle, rate, gm, height = 320 }: Closed) =>
  <NewtonField sources={sources} span={span} cycle={cycle} rate={rate} gm={gm} height={height} />;

const Caption = ({ children }: { children: any }) => (
  <div style={{ color: '#8a8d99', fontSize: '0.8em', paddingTop: '0.6em' }}>{children}</div>
);

// What each half of a pair of pictures is a picture OF. Said on the picture
// rather than in the prose, because the whole point of drawing them together
// is that a reader can tell at a glance which is which.
const Label = ({ children }: { children: any }) => (
  <div style={{
    color: '#6c7080', fontSize: '0.7em', letterSpacing: '0.08em',
    textTransform: 'uppercase', paddingBottom: '0.35em',
  }}>{children}</div>
);

/**
 * One arrangement, drawn every way it can be read — side by side.
 *
 * The whole argument of the second half of this article is that the lattice
 * and the closed form are the same claim, and an argument like that is made
 * by putting the two pictures where a reader can look from one to the other
 * without scrolling. Where an arrangement has only one reading it takes the
 * full width, which is the honest thing: there is no second picture to
 * compare against, and a blank half would suggest one is missing.
 */
export const ModelView = ({ model }: { model: Model }) => {
  const lattice = latticeOf(model);
  const closed = closedOf(model);
  const metric = metricOf(model);
  const newton = newtonOf(model);

  const readings = [lattice, closed, newton, metric].filter(Boolean).length;
  const many = readings > 1;

  // A run repeated, where the arrangement is a draw rather than a case.
  const runs = Array.from({ length: lattice?.runs ?? 1 }, (_, i) => i);

  return <div style={{ marginBottom: '1.5rem' }}>
    <div style={{
      display: 'grid',
      gridTemplateColumns: many ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr',
      gap: '1rem',
      alignItems: 'start',
    }}>
      {lattice ? <div>
        {many ? <Label>run on a lattice</Label> : null}
        {runs.map(i => <LatticeView key={i} {...lattice} />)}
      </div> : null}

      {closed ? <div>
        {many ? <Label>written down — gravity as a flow</Label> : null}
        <ClosedView {...closed} />
      </div> : null}

      {newton ? <div>
        {many ? <Label>what Newton expects</Label> : null}
        <NewtonView {...newton} />
      </div> : null}

      {metric ? <div>
        {many ? <Label>written down — gravity as a metric</Label> : null}
        <MetricView {...metric} />
      </div> : null}
    </div>

    {model.name || model.note
      ? <Caption>{[model.name, model.note].filter(Boolean).join(' — ')}</Caption>
      : null}

    {model.alongside?.map((other, i) => <ModelView key={i} model={other} />)}
  </div>;
};

/** The catalogue, drawn in order. */
export const Models = ({ models }: { models: Model[] }) => <>
  {models.map((model, i) => <ModelView key={`${model.name}-${i}`} model={model} />)}
</>;
