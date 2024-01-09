import React, {useRef, useState} from "react";
import IEventListener from "../../js/react/IEventListener";
import {VisualizationCanvas} from "../../explorer/Visualization";
import {add, AutoRay, AutoVertex, InterfaceOptions} from "../../explorer/OrbitMinesExplorer";
import {Center} from "@react-three/drei";
import {useHotkeys} from "../../js/react/hooks/useHotkeys";
import {Ray} from "../../explorer/Ray";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import {keys} from "lodash";

// TODO: Put the graphs setc at the top, invis lines, then draw them on hover, and maybe make surrounding stuff less visiable.
// TODO: make some function which uses a custom input like position of the interface as the thing which breaks equivalences - ignorances. Basically a custom "equivalency function"
// TODO; Key to output javascript compilation targets in console, array, .. etc.

const Interface = () => {
  const ref = useRef<any>();
  const hotkeyConfig = useHotkeys();

  const scale = 1.5;
  const i = 20 * scale;

  const cursor: InterfaceOptions = {
    scale,
    rotation: [0, 0, Math.PI / 6 ],
    color: '#FF5555'
  };

  // TODO: Direct call to rerender on change, now there's lag


  const [Chyp] = useState<Ray>(Ray.vertex().o({
    selection: Ray
      .vertex().o({ position: [0, 0, 0], scale, color: 'orange' })
      .as_reference().o({
        position: [0, 0, 0],
        ...cursor
      }),
    rays: [] as Ray[],
    controls: Ray.vertex().o({
      hotkeys: [ {
        combo: "arrowright", global: true, label: "", onKeyDown: () => {
          const { selection, rays } = Chyp.any;

          const next = Ray.js("A").as_reference().o({
            position: add(selection.any.position ?? [0, 0, 0], [i * 2, 0, 0]),
            scale
          });
          // const next2 = Ray.js("A").as_reference().o({
          //   position: add(selection.any.position ?? [0, 0, 0], [i * 2, -30, 0]),
          //   scale
          // });

          Chyp.any.selection = next;
          Chyp.any.rays = [...rays, next]

          // selection.continues_with(

          // );
        }
      },
        {
          combo: "arrowleft", global: true, label: "", onKeyDown: () => {
            const { selection, rays } = Chyp.any;

            if (rays.length === 0)
              return;

            rays.pop();

            if (rays.length === 0) {
              Chyp.any.selection.any.position = [0, 0, 0]
              return;
            }

            Chyp.any.selection = rays[rays.length - 1];

            // selection.continues_with(

            // );

          }
        },
        {
          combo: "arrowup", global: true, label: "", onKeyDown: () => {
            const { selection, rays } = Chyp.any;

            Chyp.any.rays = rays.flatMap((ray: Ray) => [
              ray,
              // Ray.js("A").as_reference().o({
              //   // ...ray.o,
              //   position: add(ray.any.position ?? [0, 0, 0], [0, i * 2, 0])
              // }),
              // Ray.js("A").as_reference().o({
              //   // ...ray.o,
              //   position: ray.any.position,
              //   rotation: [0, 0, Math.PI / 2]
              // }),
              // Ray.js("A").as_reference().o({
              //   // ...ray.o,
              //   position: add(ray.any.position ?? [0, 0, 0], [0, i * 2, 0]),
              //   rotation: [0, 0, Math.PI / 2]
              // })
            ]);

            // Chyp.any.selection = Chyp;

            // selection.o({...selection.o, position: add(selection.any.position ?? [0, 0, 0], [0, i * 2, 0])})

            // selection.continues_with(

            // );
          }
        }] as HotkeyConfig[]
    })
  }));

  const { selection, controls, rays } = Chyp.any;
  const { hotkeys } = controls.any;

  hotkeyConfig.set(...hotkeys);

  const Rendered = ({ ray, ...options }: { ray: Ray } & InterfaceOptions) => {
    const { position = options.position, rotation = options.rotation, scale = options.scale, color = options.color } = ray.any;
    return <AutoVertex key={ray.label} {...{position, rotation, scale, color}} />;
  }


  return <>
    <Center>
      {/*<AutoRay ray={Chyp.any.selection.self.initial} position={[-30, 0, 0]} />*/}
      {/*<AutoRay ray={Chyp.any.selection.self.terminal} position={[30, 0, 0]} />*/}
      {/*<AutoRay ray={Chyp.any.selection.self} />*/}

      {/*<AutoRay ray={selection} />*/}

      {/*<AutoVertex {...selection.o} />*/}
      {/*<AutoVertex {...selection.self.o} />*/}
      <Rendered ray={selection} {...cursor} />
      <AutoVertex position={[0, 0, 0]} scale={scale} />

      {rays.map((ray: Ray) => <Rendered key={ray.label} ray={ray} />)}

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