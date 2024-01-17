import React, {useEffect, useRef, useState} from "react";
import IEventListener from "../../js/react/IEventListener";
import {VisualizationCanvas} from "../../explorer/Visualization";
import {
  _Continuation,
  _Vertex,
  add,
  add_,
  AutoVertex,
  circle,
  InterfaceOptions,
  Line,
  torus
} from "../../explorer/OrbitMinesExplorer";
import {useHotkeys} from "../../js/react/hooks/useHotkeys";
import {DebugResult, Ray, RayType} from "../../explorer/Ray";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import _ from "lodash";
import {useThree} from "@react-three/fiber";
import {Render, StatsPanels} from "../../explorer/debug/DebugCanvas";

// TODO: Put the graphs setc at the top, invis lines, then draw them on hover, and maybe make surrounding stuff less visiable.
// TODO: make some function which uses a custom input like position of the interface as the thing which breaks equivalences - ignorances. Basically a custom "equivalency function"
// TODO; Key to output javascript compilation targets in console, array, .. etc.
// const Debug = () => {
//   const groups: string[][] = [];
//   _.values(debug).forEach(ray => {
//     for (let group of groups) {
//       if (group.includes(ray.label) || group.includes(ray.vertex)) {
//         group.push(...[ray.label, ray.vertex].filter(l => l !== 'None'));
//         return;
//       }
//     }
//
//     groups.push([ray.label, ray.vertex].filter(l => l !== 'None'));
//   });
//
//   const group = (l: string): string[] => groups.find(group => group.includes(l))!;
//   const group_index = (l: string): number => groups.indexOf(group(l));
//   const index_in_group = (l: string): number => group(l).indexOf(l);
//
//
//   //TODO: do the same for group in initial/yerminal
//   return <>
//     {/*<Center>*/}
//     {_.values(debug).map(((_ray, index) => {
//       let ray = {
//         ...debug[_ray.label]
//       }
//
//       const color = {
//         [RayType.VERTEX]: 'orange',
//         [RayType.TERMINAL]: '#FF5555',
//         [RayType.INITIAL]: '#5555FF',
//         [RayType.REFERENCE]: '#555555',
//       }[ray.type];
//
//       const group_x = _.compact(group(ray.label).map(l => (debug[l] as InterfaceOptions).position)).map(position => position[0])[0];
//       // console.log(_.compact(group(ray.label).map(l => (debug[l] as InterfaceOptions).position)))
//
//       ray = {
//         ...ray,
//         ...({
//           color,
//           scale: 1.5,
//           // rotation: ray.type == RayType.REFERENCE ? [0, 0, Math.PI / 6] : [0, 0, 0],
//           position: [
//             group_x ?? group_index(ray.label) * 20 * 1.5,
//             // (index_in_group(ray.label) + group_index(ray.label) + (group_x ? 0: 1)) * 30 * 1.5,
//             index * 20 * 1.5,
//             0
//           ]
//         } as InterfaceOptions)
//       }
//
//       debug[_ray.label] = ray;
//
//       const _default: Required<InterfaceOptions> = {
//         position: [0, 0, 0],
//         rotation: [0, 0, 0],
//         scale: 1,
//         color: 'orange',
//         ..._.pick(ray, 'position', 'rotation', 'scale', 'color'),
//       }
//
//       // console.log(ray.label, [ray.initial, ray.vertex, ray.terminal].toString())
//
//       const initial: Required<InterfaceOptions> = { ..._default, position: [-20 * _default.scale, 0, 0] };
//
//       // Vertex as the origin for rotation
//       const vertex: Required<InterfaceOptions> = { ..._default, position: [0, 0, 0] } //, ...ray.vertex };
//       const terminal: Required<InterfaceOptions> = { ..._default, position: [20 * _default.scale, 0, 0] };
//
//       const Group = ({ children }: Children) => {
//         return <group position={_default.position} rotation={vertex.rotation}>
//           {children}
//         </group>
//       }
//
//       const None = (options: InterfaceOptions) => (<_Continuation {...options} color="#AA0000" scale={1} />)
//
//       const Extreme = ({type}: { type: RayType.INITIAL | RayType.TERMINAL }) => {
//         const options = type === RayType.INITIAL ? initial : terminal;
//
//         switch (ray.type) {
//           case RayType.REFERENCE:
//           case RayType.VERTEX: {
//             const a = type === RayType.INITIAL ? { terminal: vertex } : { initial: vertex };
//             return <SimpleRenderedRay type={type} {...options} {...a} />;
//           }
//           case type: {
//             return <None {...options} />;
//           }
//           case (type === RayType.INITIAL ? RayType.TERMINAL : RayType.INITIAL): {
//             return <></>
//           }
//         }
//       }
//
//       return <Group key={index}>
//         <Extreme type={RayType.INITIAL} />
//         <SimpleRenderedRay type={ray.type === RayType.REFERENCE ? RayType.VERTEX : ray.type} {...vertex} initial={initial} terminal={terminal} />
//         <Extreme type={RayType.TERMINAL} />
//       </Group>
//     }))}
//
//     {groups.map(group => <>
//       {group.map(l => <AutoVertex position={(debug[l] as InterfaceOptions).position} rotation={[0, 0, Math.PI / 2]} scale={0.75}  color={cursor.color} />)}
//     </>)}
//     {/*</Center>*/}
//   </>
// }

const ___index = (ray: Ray): number => {
  switch (ray.type) {
    case RayType.REFERENCE:
      return ray.self.any.index ?? 0;
    case RayType.INITIAL:
      return ray.self.terminal.any.index ?? 0;
    case RayType.TERMINAL:
      return ray.self.initial.any.index ?? 0;
    case RayType.VERTEX:
      return ray.self.any.index ?? 0;
  }
}

export const Render2 = ({ ray, Interface, show =  { initial: true, terminal: true } }: { ray: Ray, Interface: Ray, index: number, show?: { initial: boolean, terminal: boolean } }) => {
  const index = ___index(ray);
  let added = [15 * index, 60 * index, 0];

  const initial: Required<InterfaceOptions> = ray.follow(Ray.directions.previous).render_options(Interface);
  initial.position = add_(initial.position, added);
  const vertex: Required<InterfaceOptions> = ray.render_options(Interface);
  vertex.position = add_(vertex.position, added);
  const terminal: Required<InterfaceOptions> = ray.follow().render_options(Interface);
  terminal.position = add_(terminal.position, added);

  switch (ray.type) {
    case RayType.REFERENCE:
      return <_Vertex position={vertex.position} rotation={[0, 0, Math.PI / 2]} scale={vertex.scale / 2} color="#555555" />
    case RayType.INITIAL: {
      const diff = [-15, -15, 0];

      return <group>
        {!show.initial ? <group></group> : <group>
          <AutoVertex position={vertex.position} rotation={[0, 0, Math.PI / 4]}
                      scale={(vertex.scale / 3) * 1.05} color="#555555"/>

          <AutoVertex position={add_(diff, vertex.position)} rotation={[0, 0, Math.PI / 4]}
                      scale={(vertex.scale / 3) * 1.05} color="#555555"/>

          <AutoVertex position={add_(diff, terminal.position)} rotation={[0, 0, Math.PI / 4]}
                      scale={(vertex.scale / 3) * 1.05} color="#555555"/>
        </group>}

        <AutoVertex position={terminal.position} rotation={[0, 0, Math.PI / 4]}
                    scale={(vertex.scale / 3) * 1.05} color="#555555"/>

        <AutoVertex position={add_(diff, vertex.position)} rotation={[0, 0, -(Math.PI / 3) - 0.05]}
                    scale={(vertex.scale / 2) * 1.1} color="#FF55FF"/>

        <group>
          <Line start={add(terminal.position, [-circle.radius * vertex.scale, 0, 0])}
                end={add_(vertex.position, [torus.radius * vertex.scale, 0, 0], !show.initial && ray.type === RayType.INITIAL ? [-15, -15, 0] : [0, 0, 0])} {..._.pick(vertex, 'color', 'scale')} />
          <_Continuation {...vertex} position={add_(vertex.position, !show.initial && ray.type === RayType.INITIAL ? [-15, -15, 0] : [0, 0, 0])} />
        </group>

        {!show.initial ? <group></group> : <group>
          <Line start={add_(diff, terminal.position, [-circle.radius * vertex.scale, 0, 0])}
                end={add_(diff, vertex.position, [torus.radius * vertex.scale, 0, 0])} {..._.pick(vertex, 'color', 'scale')}
                color="#FF5555"/>
          <_Continuation {...vertex} position={add_(vertex.position, diff)} color="#FF5555"/>
          <_Continuation {...vertex} position={add_(vertex.position, diff, [-30, 0, 0])} scale={vertex.scale / 3 * 2}
                         color="#AA0000"/>
        </group>}
      </group>
    }
    case RayType.TERMINAL: {
      const diff = [15, 15, 0];

      return <group>
        {!show.terminal ? <group></group> : <group>
          <AutoVertex position={vertex.position} rotation={[0, 0, Math.PI / 4]}
                      scale={(vertex.scale / 3) * 1.05} color="#555555"/>

          <AutoVertex position={add_(diff, vertex.position)} rotation={[0, 0, Math.PI / 4]}
                      scale={(vertex.scale / 3) * 1.05} color="#555555"/>

          <AutoVertex position={initial.position} rotation={[0, 0, Math.PI / 4]}
                      scale={(vertex.scale / 3) * 1.05} color="#555555"/>

          <AutoVertex position={add_(diff, initial.position)} rotation={[0, 0, Math.PI / 4]}
                      scale={(vertex.scale / 3) * 1.05} color="#555555"/>
        </group>}

        <AutoVertex position={add_(diff, vertex.position)} rotation={[0, 0, -(Math.PI / 3)  - 0.05]}
                    scale={(vertex.scale / 2) * 1.1} color="#FF55FF"/>

        <group>
          <Line start={add(initial.position, [circle.radius * vertex.scale, 0, 0])}
                end={add_(vertex.position, [-torus.radius * vertex.scale, 0, 0], !show.terminal && ray.type === RayType.TERMINAL ? [15, 15, 0] : [0, 0, 0])} {..._.pick(vertex, 'color', 'scale')} {..._.pick(vertex, 'color', 'scale')} />
          <_Continuation {...vertex} position={add_(vertex.position, !show.terminal && ray.type === RayType.TERMINAL ? [15, 15, 0] : [0, 0, 0])} />
        </group>

        {!show.terminal ? <group></group> : <group>
          <Line start={add_(diff, initial.position, [circle.radius * vertex.scale, 0, 0])}
                end={add_(diff, vertex.position, [-torus.radius * vertex.scale, 0, 0])} {..._.pick(vertex, 'color', 'scale')} color="#5555FF" />
          <_Continuation {...vertex} position={add_(vertex.position, diff)} color="#5555FF" />
          <_Continuation {...vertex} position={add_(vertex.position, diff, [30, 0, 0])} scale={vertex.scale / 3 * 2} color="#AA0000"/>
        </group>}
      </group>
    }
    case RayType.VERTEX: {
      return <_Vertex {...vertex} />
    }
  }
}

export const DebugInterface2 = ({scale = 1.5}: InterfaceOptions) => {
  const ref = useRef<any>();
  const hotkeyConfig = useHotkeys();

  const {
    gl: renderer,
    camera,
    scene,
    raycaster
  } = useThree();

  const space_between = 20 * scale;

  const [Interface] = useState<Ray>(Ray.vertex().o({
    selection: Ray.vertex().o2({
      initial: { position: [-space_between, 0, 0], scale, color: 'orange' },
      vertex: { index: 0, position: [0, 0, 0], scale, color: 'orange' },
      terminal: { position: [space_between, 0, 0 ], scale, color: 'orange' },
    }).as_reference().o({
      position: [0, 0, 0],
      scale,
      rotation: [0, 0, Math.PI / 6 ],
      color: '#555555'
    }),
    rays: [] as Ray[],
    stats: false,
    controls: Ray.vertex().o({
      hotkeys: [
        {
          combo: ["d", "arrowright"], global: true, label: "", onKeyDown: () => {
            const { selection, rays } = Interface.any;

            const current = Interface.any.selection.render_options(Interface);

            const next = Ray.vertex().o2({
              initial: { position: add_(current.position, [(space_between * 2) - space_between, 0, 0]), scale, color: 'orange' },
              vertex: { index: Interface.any.selection.self.any.index + 1, position: add_(current.position, [(space_between * 2), 0, 0]), scale, color: 'orange' },
              terminal: { position: add_(current.position, [(space_between * 2) + space_between, 0, 0 ]), scale, color: 'orange' }
            }).as_reference().o({
              ...selection.as_reference().render_options(Interface),
              position: add(selection.any.position ?? [0, 0, 0], [space_between * 2, 0, 0])
            });

            Interface.any.selection = selection.compose(next);
            Interface.any.rays = Interface.any.selection.self.___dirty_all([]).map((ray: Ray) => {
              ray.any.traversed = true;
              return ray.as_reference();
            });

          }
        },
        {
          combo: ["a", "arrowleft"], global: true, label: "", onKeyDown: () => {
            if (Interface.any.rays.length === 0)
              return;

            Interface.any.selection = Interface.any.selection.pop();
            Interface.any.selection.o({
              position: Interface.any.selection.render_options(Interface).position
            }); // TODO, Same with this.
            Interface.any.selection.self.terminal.o({
              position: add(Interface.any.selection.render_options(Interface).position, [space_between, 0, 0]), scale, color: 'orange'
            }); // TODO: The continues_with function doesn't persist the options, as they are ignored on the equivalency. Probably need some better way to deal with this kind of thing.

            Interface.any.rays = Interface.any.selection.self.___dirty_all([]).map((ray: Ray) => {
              ray.any.traversed = true;
              return ray.as_reference();
            });

            if (Interface.any.length === 0) {
              Interface.any.selection.any.position = [0, 0, 0]
              return;
            }
          }
        },
        {
          combo: ["w", "arrowup"], global: true, label: "", onKeyDown: () => {
            const { selection, rays } = Interface.any;

            Interface.any.rays = rays.flatMap((ray: Ray) => [
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

            // Chyp_naieve_pass.any.selection = Chyp_naieve_pass;

            // selection.o({...selection.o, position: add(selection.any.position ?? [0, 0, 0], [0, i * 2, 0])})

            // selection.compose(

            // );
          }
        },
        {
          combo: "/", global: true, label: "", onKeyDown: () => {
            console.log('---------')
            console.log(`Debugging: ${Interface.any.selection.self.label} (type=${Interface.any.selection.type})`)
            console.log(`rays.length at pos=[${Interface.any.selection.render_options(Interface).position}]: ${Interface.any.rays.filter((ray: Ray) =>
              _.isEqual(
                Interface.any.selection.render_options.position,
                ray.render_options(Interface).position
              )
            ).length} / ${Interface.any.rays.length}`)
            console.log('ref', Interface.any.selection)
            console.log('ref.self', Interface.any.selection.self)

            const debug: DebugResult = {};
            Interface.any.selection.self.debug(debug);
            console.log('ref.debug', debug);
            Interface.any.rays.forEach((ray: Ray) => ray.debug(debug));
            console.log('rays.debug', debug);

          }
        },
        {
          combo: "f3", global: true, label: "Show stats Panel", onKeyDown: (e) => {
            e.preventDefault();
            Interface.any.stats = !Interface.any.stats;
          }
        },
      ] as HotkeyConfig[]
    })
  }));

  // useEffect(() => {
  // TODO: Eventually goes over maximum size of react-debug callstack when updates each frame like this.
  hotkeyConfig.set(...Interface.any.controls.any.hotkeys);
  // }, [Interface.any.controls.any.hotkeys]);

  const index = ___index(Interface.any.selection);
  const added = [15 * index, 60 * (index + 1), 0];

  return <>
    {Interface.any.stats ? <StatsPanels/> : <></>}

    <AutoVertex position={(Interface.any.selection as Ray).any.position} rotation={[0, 0, Math.PI / 2]}
                scale={scale / 1.5} color="#55FF55"/>

    {/*{Interface.any.rays.map((ray: Ray) => <Render key={ray.label} ray={ray} />)}*/}

    {Interface.any.rays.map((ray: Ray) => <Render key={ray.self.label} Interface={Interface} ray={ray}/>)}

    <group position={[0, 0, 0]}>
      <AutoVertex position={add((Interface.any.selection as Ray).any.position, added)} rotation={[0, 0, Math.PI / 2]}
                  scale={scale / 1.5} color="#55FF55"/>
      <group position={[0, 60, 0]}>
        {Interface.any.rays.map((ray: Ray, index: number) => <Render2 key={ray.self.label} Interface={Interface} ray={ray} index={index} show={{initial: false, terminal: false}} />)}
      </group>
    </group>

    <group position={[0, 120, 0]}>
      <AutoVertex position={add((Interface.any.selection as Ray).any.position, added)} rotation={[0, 0, Math.PI / 2]}
                  scale={scale / 1.5} color="#55FF55"/>
      <group position={[0, 60, 0]}>
        {Interface.any.rays.map((ray: Ray, index: number) => <Render2 key={ray.self.label} Interface={Interface} ray={ray} index={index}/>)}
      </group>
    </group>

    {/*<group position={[0, 0, 0]}>*/}
    {/*  {[*/}
    {/*    Ray.vertex().o2({*/}
    {/*      initial: { position: [(-space_between / 1.5) - (space_between / 1.5) * 2, -140, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      vertex: { index: 0, position: [0 - (space_between / 1.5) * 2, -140, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      terminal: { position: [(space_between / 1.5) - (space_between / 1.5) * 2, -140, 0 ], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*    }),*/}
    {/*    Ray.vertex().o2({*/}
    {/*      initial: { position: [(-space_between / 1.5) + (space_between / 1.5) * 2, -120, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      vertex: { index: 0, position: [0 + (space_between / 1.5) * 2, -120, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      terminal: { position: [(space_between / 1.5) + (space_between / 1.5) * 2, -120, 0 ], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*    }),*/}
    {/*    Ray.vertex().o2({*/}
    {/*      initial: { position: [(-space_between / 1.5), -140, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      vertex: { index: 0, position: [0, -120, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      terminal: { position: [(space_between / 1.5), -120, 0 ], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*    }),*/}
    {/*    Ray.vertex().o2({*/}
    {/*      initial: { position: [(-space_between / 1.5), -140, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      vertex: { index: 0, position: [0, -140, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      terminal: { position: [(space_between / 1.5), -120, 0 ], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*    }),*/}
    {/*    Ray.vertex().o2({*/}
    {/*      initial: { position: [(-space_between / 1.5), -140, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      vertex: { index: 0, position: [0, -160, 0], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*      terminal: { position: [(space_between / 1.5), -160, 0 ], scale: scale / 1.5, color: '#FF5555' },*/}
    {/*    }),*/}
    {/*  ]*/}
    {/*    .flatMap(ray => [ray.initial.as_reference(), ray.as_reference(), ray.terminal.as_reference()])*/}
    {/*    .map(ray => <Render key={ray.self.label} ray={ray}/>)*/}
    {/*  }*/}
    {/*  /!*<AutoVertex position={[0, 0, 0]} rotation={[0, 0, 0]} scale={scale / 1.5} color="orange"/>*!/*/}
    {/*  /!*<AutoVertex position={[0, -60, 0]} rotation={[0, 0, 0]} scale={scale / 1.5} color="orange"/>*!/*/}
    {/*</group>*/}
  </>
}

export const DebugInterface3 = ({scale = 1.5}: InterfaceOptions) => {
  const ref = useRef<any>();
  const hotkeyConfig = useHotkeys();

  const {
    gl: renderer,
    camera,
    scene,
    raycaster
  } = useThree();

  const space_between = 20 * scale;

  const [Interface] = useState<Ray>(Ray.vertex().o({
    selection: Ray.vertex().o2({
      initial: { position: [-space_between, 0, 0], scale, color: 'orange' },
      vertex: { index: 0, position: [0, 0, 0], scale, color: 'orange' },
      terminal: { position: [space_between, 0, 0 ], scale, color: 'orange' },
    }).as_reference().o({
      position: [0, 0, 0],
      scale,
      rotation: [0, 0, Math.PI / 6 ],
      color: '#555555'
    }),
    rays: [] as Ray[],
    stats: false,
    cursor: {
      tick: false
    },
    controls: Ray.vertex().o({
      hotkeys: [
        {
          combo: ["d", "arrowright"], global: true, label: "", onKeyDown: () => {
            const { selection, rays } = Interface.any;

            const current = Interface.any.selection.render_options(Interface);

            const next = Ray.vertex().o2({
              initial: { position: add_(current.position, [(space_between * 2) - space_between, 0, 0]), scale, color: 'orange' },
              vertex: { index: Interface.any.selection.self.any.index + 1, position: add_(current.position, [(space_between * 2), 0, 0]), scale, color: 'orange' },
              terminal: { position: add_(current.position, [(space_between * 2) + space_between, 0, 0 ]), scale, color: 'orange' }
            }).as_reference().o({
              ...selection.as_reference().render_options(Interface),
              position: add(selection.any.position ?? [0, 0, 0], [space_between * 2, 0, 0])
            });

            Interface.any.selection = selection.compose(next);
            Interface.any.rays = Interface.any.selection.self.___dirty_all([]).map((ray: Ray) => {
              ray.any.traversed = true;
              return ray.as_reference();
            });

          }
        },
        {
          combo: ["a", "arrowleft"], global: true, label: "", onKeyDown: () => {
            if (Interface.any.rays.length === 0)
              return;

            Interface.any.selection = Interface.any.selection.pop();
            Interface.any.selection.o({
              position: Interface.any.selection.render_options(Interface).position
            }); // TODO, Same with this.
            Interface.any.selection.self.terminal.o({
              position: add(Interface.any.selection.render_options(Interface).position, [space_between, 0, 0]), scale, color: 'orange'
            }); // TODO: The continues_with function doesn't persist the options, as they are ignored on the equivalency. Probably need some better way to deal with this kind of thing.

            Interface.any.rays = Interface.any.selection.self.___dirty_all([]).map((ray: Ray) => {
              ray.any.traversed = true;
              return ray.as_reference();
            });

            if (Interface.any.length === 0) {
              Interface.any.selection.any.position = [0, 0, 0]
              return;
            }
          }
        },
        {
          combo: ["w", "arrowup"], global: true, label: "", onKeyDown: () => {
            const { selection, rays } = Interface.any;

            Interface.any.rays = rays.flatMap((ray: Ray) => [
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

            // Chyp_naieve_pass.any.selection = Chyp_naieve_pass;

            // selection.o({...selection.o, position: add(selection.any.position ?? [0, 0, 0], [0, i * 2, 0])})

            // selection.compose(

            // );
          }
        },
        {
          combo: "/", global: true, label: "", onKeyDown: () => {
            console.log('---------')
            console.log(`Debugging: ${Interface.any.selection.self.label} (type=${Interface.any.selection.type})`)
            console.log(`rays.length at pos=[${Interface.any.selection.render_options(Interface).position}]: ${Interface.any.rays.filter((ray: Ray) =>
              _.isEqual(
                Interface.any.selection.render_options(Interface).position,
                ray.render_options(Interface).position
              )
            ).length} / ${Interface.any.rays.length}`)
            console.log('ref', Interface.any.selection)
            console.log('ref.self', Interface.any.selection.self)

            const debug: DebugResult = {};
            Interface.any.selection.self.debug(debug);
            console.log('ref.debug', debug);
            Interface.any.rays.forEach((ray: Ray) => ray.debug(debug));
            console.log('rays.debug', debug);
          }
        },
        {
          combo: "f3", global: true, label: "Show stats Panel", onKeyDown: (e) => {
            e.preventDefault();
            Interface.any.stats = !Interface.any.stats;
          }
        },
      ] as HotkeyConfig[]
    })
  }));

  // useEffect(() => {
  // TODO: Eventually goes over maximum size of react-debug callstack when updates each frame like this.
  hotkeyConfig.set(...Interface.any.controls.any.hotkeys);
  // }, [Interface.any.controls.any.hotkeys]);

  useEffect(() => {

    setInterval(() => {
      Interface.any.cursor.tick = !Interface.any.cursor.tick;

      // TODO THIS NEEDS TO BE EASIER
    }, 500); // TODO; On react reload interval is not destroyed
  }, []);

  return <>
    {Interface.any.stats ? <StatsPanels/> : <></>}

    <AutoVertex position={(Interface.any.selection as Ray).any.position} rotation={[0, 0, Math.PI / 2]} scale={scale / 1.5} color="#AAAAAA"/>

    {Interface.any.rays.map((ray: Ray) => <Render key={ray.self.label} Interface={Interface} ray={ray} />)}
  </>
}

// const Interface = () => {
//   // TODO: Direct call to rerender on change, now there's lag
//
//   const Rendered = ({ ray, ...options }: { ray: Ray } & InterfaceOptions) => {
//     const { position = options.position, rotation = options.rotation, scale = options.scale, color = options.color } = ray.any;
//     return <AutoVertex key={ray.label} {...{position, rotation, scale, color}} />;
//   }
//
//   const DEBUG = true;
//
//   const debug: DebugResult = {};
//   selection.debug(debug);
//
//   return <>
//     <Center>
//       {/*<AutoRay ray={Chyp_naieve_pass.any.selection.self.initial} position={[-30, 0, 0]} />*/}
//       {/*<AutoRay ray={Chyp_naieve_pass.any.selection.self.terminal} position={[30, 0, 0]} />*/}
//       {/*<AutoRay ray={Chyp_naieve_pass.any.selection.self} />*/}
//
//       {/*<AutoRay ray={selection} />*/}
//
//       {/*<AutoVertex {...selection.o} />*/}
//       {/*<AutoVertex {...selection.self.o} />*/}
//       <Rendered ray={selection} {...cursor} />
//       <AutoVertex position={[0, 0, 0]} scale={scale} />
//
//       {rays.map((ray: Ray) => <Rendered key={ray.label} ray={ray} />)}
//
//       {/*<AutoRenderedRay scale={scale} position={[0, 0, 0]} length={1} rotation={[0, 0, 0]} />*/}
//     </Center>
//   </>
// }

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
      <DebugInterface3/>
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