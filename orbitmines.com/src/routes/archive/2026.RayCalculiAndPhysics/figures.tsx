import { useMemo, useRef } from "react";

import { Graph } from "./discrete";
import { GraphCanvas } from "./GraphCanvas";
import { Model } from "./model";
import { ModelView } from "./views";

/**
 * The two pictures that are about the LATTICE rather than about what happens
 * on it.
 *
 * Everything in `models.ts` is an arrangement of charges and a claim about
 * what the rules make of it. These two are neither: one is what a cell a tick
 * looks like, and the other is what a sheet is. They are drawn through the
 * same canvas as everything else — same camera, same lattice, same grey for
 * space that has not been charged by anything — because a reader who has been
 * looking at these pictures for ten screens should not have to work out
 * whether a new one is the same kind of thing. It is.
 */

/**
 * Something travelling at the speed of light: one cell, one tick.
 *
 * REMADE EVERY STEP RATHER THAN TICKED, which is the one thing about this
 * worth knowing. Movement in this model is a swap — the mover eats the point
 * in front and puts a fresh one down behind — and a fresh point has only the
 * two connections it was made with, so a ray ticked across a three-deep strip
 * leaves the row behind it stripped of its transverse connections. The picture
 * would show the grid coming apart in the wake of the thing crossing it, which
 * is a true fact about moving through space and completely the wrong sentence
 * for a diagram that is only saying `a cell a tick`.
 *
 * So each step is a fresh patch with the ray one cell further along, and the
 * loop comes round when it reaches the rim — where it is drawn facing out of
 * the world, since that is what it is about to do. `ticks: 0` is what asks the
 * player for that: the frame loop re-seeds every interval instead of ticking,
 * and the seed is what carries the position. (The transport's step button
 * still ticks the universe for real, which is the rule rather than the
 * diagram; reset puts the diagram back.)
 */
export const Beam = ({
  length = 10, rows = 3, height = 120, interval = 0.4,
}: {
  length?: number, rows?: number, height?: number, interval?: number,
} = {}) => {
  // How far along it has got. A ref rather than state: nothing re-renders when
  // it changes, since what reads it is the seed and the seed is called by the
  // frame loop.
  const at = useRef(0);

  const model = useMemo((): Model => ({
    name: '',
    lattice: {
      seed: () => Graph.patch({
        shape: [length, rows],
        moving: {
          at: [(at.current++ % length) - Math.floor(length / 2), 0],
          towards: [1, 0],
        },
      }),
      ticks: 0,
      interval,
      height,
      density: false,
      polarities: false,
    },
  }), [length, rows, height, interval]);

  return <ModelView model={model} />;
};

/**
 * The sheet: the twenty-seven cells around a point, and the eight of them a
 * pulse leaves into — still, and then turning.
 *
 * Side by side rather than one picture with a control on it, because the two
 * are a single sentence: THIS is what is emitted, and THIS is what emitting it
 * over and over while turning covers. The still one is where the eight can be
 * counted (the 3×3 with its middle taken out); the turning one is where it can
 * be seen that one rotation is enough to reach everywhere, which is the step of
 * the derivation that fixes the count at eight rather than at twenty-six.
 *
 * Neither of them ticks. There is no universe running here — the lattice is a
 * still 3×3×3 patch with nothing moving in it, and the only thing that moves
 * is the sheet, which `GraphCanvas` turns itself.
 */
export const Sheet = ({ height = 240 }: { height?: number } = {}) => {
  // One each, so neither canvas is drawing a graph the other is also holding.
  // Nothing ticks them, so this is only tidiness — but a shared universe
  // between two views is exactly the sort of thing that stops being tidiness
  // the moment one of them is given something to do.
  const still = useMemo(() => Graph.patch({ shape: [3, 3, 3] }), []);
  const turning = useMemo(() => Graph.patch({ shape: [3, 3, 3] }), []);

  return <div style={{
    display: 'grid',
    // Two columns, and not `auto-fit` with a minimum: the pair IS the sentence
    // — this, and this turned — and a reader who has to scroll from one to the
    // other to compare them is being shown two pictures instead of one
    // comparison. Half a narrow column each is still a legible 3×3×3.
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    alignItems: 'start',
  }}>
    <div style={{ height }}>
      <GraphCanvas graph={() => still} density={false} polarities={false} sheet={{}} />
    </div>

    <div style={{ height }}>
      <GraphCanvas
        graph={() => turning}
        animate
        density={false}
        polarities={false}
        sheet={{ turning: true }}
      />
    </div>
  </div>;
};
