import React, {useRef, useState} from "react";
import IEventListener from "../../js/react/IEventListener";
import {VisualizationCanvas} from "../../explorer/Visualization";
import {add, AutoRay, AutoVertex} from "../../explorer/OrbitMinesExplorer";
import {Center} from "@react-three/drei";
import {useHotkeys} from "../../js/react/hooks/useHotkeys";
import {Ray} from "../../explorer/Ray";

// TODO: Put the graphs setc at the top, invis lines, then draw them on hover, and maybe make surrounding stuff less visiable.
// TODO: make some function which uses a custom input like position of the interface as the thing which breaks equivalences - ignorances. Basically a custom "equivalency function"
// TODO; Key to output javascript compilation targets in console, array, .. etc.

const Interface = () => {
  const ref = useRef<any>();
  const hotkeys = useHotkeys();

  const scale = 1.5;
  const i = 20 * scale;

  const [selection, setSelection] = useState<Ray>(
    Ray
      .vertex().o({ position: [0, 0, 0], scale, color: 'orange' })
      .as_reference().o({
        position: [0, 0, 0],
        scale,
        rotation: [0, 0, Math.PI / 6 ],
        color: '#FF5555'
      })
  );

  console.log(Ray.vertex().o({ color: 'red'}).any.color)

  const [rays, setRays] = useState<Ray[]>([selection]);

  hotkeys.set(...[
    {
      combo: "arrowright", global: true, label: "", onKeyDown: () => {

        const next = Ray.js("A").as_reference().o({
          position: add(selection.any.position ?? [0, 0, 0], [i * 2, 0, 0]),
          scale
        });
        setSelection(next);
        setRays([...rays, next]);

        // selection.continues_with(

        // );

        console.log(rays);
      }
    },
    {
      combo: "arrowleft", global: true, label: "", onKeyDown: () => {

        rays.pop();
        setSelection(rays[rays.length - 1]);

        // selection.continues_with(

        // );

        console.log(rays);
      }
    },
    {
      combo: "arrowup", global: true, label: "", onKeyDown: () => {

        setRays(rays.flatMap(ray => [
          ray,
          Ray.js("A").as_reference().o({
            ...ray.o,
            position: add(ray.any.position ?? [0, 0, 0], [0, i * 2, 0])
          }),
          Ray.js("A").as_reference().o({
            ...ray.o,
            position: ray.any.position,
            rotation: [0, 0, Math.PI / 2]
          }),
          Ray.js("A").as_reference().o({
            ...ray.o,
            position: add(ray.any.position ?? [0, 0, 0], [0, i * 2, 0]),
            rotation: [0, 0, Math.PI / 2]
          })
        ]));

        selection.o({...selection.o, position: add(selection.any.position ?? [0, 0, 0], [0, i * 2, 0])})
        setSelection(selection)

        // selection.continues_with(

        // );

        console.log(rays);
      }
    }
  ]);

  return <>
    <Center>
      <AutoRay ray={selection.self.initial} position={[-30, 0, 0]} />
      <AutoRay ray={selection.self.terminal} position={[30, 0, 0]} />
      <AutoRay ray={selection.self} />
      {/*<AutoVertex {...selection.o} />*/}
      {/*<AutoVertex {...selection.self.o} />*/}

      {/*{rays.map(ray => <AutoVertex {...ray.o} />)}*/}

      {/*<AutoRenderedRay scale={scale} position={[0, 0, 0]} length={1} rotation={[0, 0, 0]} />*/}
    </Center>
  </>
}

/**
 * TODO: Import .chyp files
 * TODO: Export to .chyp files
 */
const ChypCanvas = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {
  const listener: IEventListener<any> = {

  }

  return <div>
    {/*<Row>*/}
    {/*  <Organization {...ORGANIZATIONS.chyp} only_logo />*/}
    {/*  <Organization {...ORGANIZATIONS.orbitmines_research} only_logo />*/}
    {/*</Row>*/}

    <VisualizationCanvas
      style={{height: '100vh'}}
    >
      <Interface/>
    </VisualizationCanvas>
  </div>
}

export const ChypExplorer = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {

  const listener: IEventListener<any> = {}

  return <ChypCanvas/>
}

export default ChypCanvas;