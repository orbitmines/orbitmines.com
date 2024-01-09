import React, {useRef, useState} from "react";
import IEventListener from "../../js/react/IEventListener";
import {VisualizationCanvas} from "../../explorer/Visualization";
import {_Continuation, add, AutoVertex, InterfaceOptions, SimpleRenderedRay} from "../../explorer/OrbitMinesExplorer";
import {Center} from "@react-three/drei";
import {useHotkeys} from "../../js/react/hooks/useHotkeys";
import {DebugResult, Ray, RayType} from "../../explorer/Ray";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import _ from "lodash";
import {Children} from "../../../lib/typescript/React";

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

          const next = Ray.vertex().as_reference().o({
            position: add(selection.any.position ?? [0, 0, 0], [i * 2, 0, 0]),
            scale
          });
          selection.continues_with(next);

          // const next2 = Ray.js("A").as_reference().o({
          //   position: add(selection.any.position ?? [0, 0, 0], [i * 2, -30, 0]),
          //   scale
          // });

          Chyp.any.selection = next;
          Chyp.any.rays = [...rays, next]

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

  const render = () => {

  }

  const DEBUG = true;

  const debug: DebugResult = {};
  selection.debug(debug);

  if (DEBUG) {
    // _.groupBy(_.values(debug), ray => ray.vertex);

    return <>
      <Center>
        {_.values(debug).map(((_ray, index) => {
          let ray = {
            ...debug[_ray.label]
          }

          const color = {
            [RayType.VERTEX]: 'orange',
            [RayType.TERMINAL]: '#FF5555',
            [RayType.INITIAL]: '#5555FF',
            [RayType.REFERENCE]: '#555555',
          }[ray.type];

          ray = {
            ...ray,
            ...({
              color,
              scale: 1.5,
              position: [0, index * 20, 0]
            } as InterfaceOptions)
          }

          debug[_ray.label] = ray;

          const _default: Required<InterfaceOptions> = {
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: 1,
            color: 'orange',
            ..._.pick(ray, 'position', 'rotation', 'scale', 'color'),
          }

          console.log(ray.label, [ray.initial, ray.vertex, ray.terminal].toString())

          const initial: Required<InterfaceOptions> = { ..._default, position: [-20 * _default.scale, 0, 0] };

          // Vertex as the origin for rotation
          const vertex: Required<InterfaceOptions> = { ..._default, position: [0, 0, 0] } //, ...ray.vertex };
          const terminal: Required<InterfaceOptions> = { ..._default, position: [20 * _default.scale, 0, 0] };

          const Group = ({ children }: Children) => {
            return <group position={_default.position} rotation={vertex.rotation}>
              {children}
            </group>
          }

          const None = (options: InterfaceOptions) => (<_Continuation {...options} color="#AA0000" scale={1} />)

          const Extreme = ({type}: { type: RayType.INITIAL | RayType.TERMINAL }) => {
            const options = type === RayType.INITIAL ? initial : terminal;

            switch (ray.type) {
              case RayType.REFERENCE:
              case RayType.VERTEX: {
                const a = type === RayType.INITIAL ? { terminal: vertex } : { initial: vertex };
                return <SimpleRenderedRay type={type} {...options} {...a} />;
              }
              case type: {
                return <None {...options} />;
              }
              case (type === RayType.INITIAL ? RayType.TERMINAL : RayType.INITIAL): {
                return <></>
              }
            }
          }

          return <Group key={index}>
            <Extreme type={RayType.INITIAL} />
            <SimpleRenderedRay type={ray.type === RayType.REFERENCE ? RayType.VERTEX : ray.type} {...vertex} initial={initial} terminal={terminal} />
            <Extreme type={RayType.TERMINAL} />
          </Group>
        }))}
      </Center>
    </>
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