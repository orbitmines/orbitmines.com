import React, {useRef, useState} from "react";
import IEventListener from "../../js/react/IEventListener";
import {VisualizationCanvas} from "../../explorer/Visualization";
import {_Continuation, add, AutoVertex, InterfaceOptions, SimpleRenderedRay} from "../../explorer/OrbitMinesExplorer";
import {Center} from "@react-three/drei";
import {useHotkeys} from "../../js/react/hooks/useHotkeys";
import {DebugRay, DebugResult, Ray, RayType} from "../../explorer/Ray";
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
    _.values(debug).forEach(ray => {

    });

    return <>
      <Center>
        {_.values(debug).map(((_ray, index) => {
          const scale = 1.5;

          const options = (ray: DebugRay, expected: InterfaceOptions): DebugRay & Required<InterfaceOptions> => {
            const color = {
              [RayType.VERTEX]: 'orange',
              [RayType.TERMINAL]: '#FF5555',
              [RayType.INITIAL]: '#5555FF',
              [RayType.REFERENCE]: '#555555',
            }[ray.type];

            console.log('-')
            console.log('expected', expected)
            console.log('ray', ray)
            return {
              position: [0, 0, 0],
              rotation: [0, 0, 0],
              color,
              scale,

              ...ray, // If set elsewhere, prefer that one instead
              ...expected, // Expected based on current perspective
            }
          }

          const expected = (ref: string): InterfaceOptions => ref === 'None' ? {} : _.pick(debug[ref] as InterfaceOptions, 'position', 'rotation', 'color', 'scale');
          const interface_options = (ray: InterfaceOptions): InterfaceOptions => _.pick(ray, 'position', 'rotation', 'color', 'scale');

          let ray = debug[_ray.label] = options(debug[_ray.label], {
            position: [100, index * 20, 0],
            // ...expected(debug[_ray.label].vertex)
          });
          let vertex: InterfaceOptions = ray.vertex !== 'None' ? (debug[ray.vertex] = options(debug[ray.vertex], {
            position: [100, index * 20, 0],
            // ...expected(ray.label)
          })) : {};
          let initial: InterfaceOptions = ray.initial !== 'None' ? (debug[ray.initial] = options(debug[ray.initial], {
            position: add(ray.position, [-20 * scale, 0, 0]),
            // ...expected(ray.label)
          })) : {};
          let terminal: InterfaceOptions = ray.terminal !== 'None' ? (debug[ray.terminal] = options(debug[ray.terminal], {
            position: add(ray.position, [20 * scale, 0, 0]),
            // ...expected(ray.label)
          })) : {};

          const Group = ({ children }: Children) => { ///  position={_default.position} rotation={vertex.rotation}>
            return <group>
              {children}
            </group>
          }

          const None = (options: InterfaceOptions) => (<_Continuation {...options} color="#AA0000" scale={1} />)

          const Extreme = ({type}: { type: RayType.INITIAL | RayType.TERMINAL }) => {
            const options = interface_options(type === RayType.INITIAL ? initial : terminal);

            switch (ray.type) {
              case RayType.REFERENCE:
              case RayType.VERTEX: {
                const vertex_options = interface_options(vertex);

                const a = type === RayType.INITIAL ? { terminal: vertex_options } : { initial: vertex_options };
                return <SimpleRenderedRay {...options} {...a} type={type} />;
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
            <SimpleRenderedRay
              {...interface_options(vertex)}
              initial={interface_options(initial)}
              terminal={interface_options(terminal)}
              type={ray.type === RayType.REFERENCE ? RayType.VERTEX : ray.type}
            />
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