import React, {useRef, useState} from "react";
import IEventListener from "../../js/react/IEventListener";
import {VisualizationCanvas} from "../Visualization";
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
} from "../OrbitMinesExplorer";
import {HotkeyEventOptions, useHotkeys} from "../../js/react/hooks/useHotkeys";
import {Ray, RayType} from "../Ray";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import _ from "lodash";
import {useThree} from "@react-three/fiber";
import {StatsPanels} from "./DebugCanvas";
import JS from "../JS";

const ___index = (ray: Ray.Any): number => {
  switch (ray.type) {
    case RayType.REFERENCE:
      return ray.___any.index ?? 0;
    case RayType.INITIAL:
      return ray.follow().___any.index ?? 0;
    case RayType.TERMINAL:
      return ray.follow(Ray.directions.previous).___any.index ?? 0;
    case RayType.VERTEX:
      return ray.___any.index ?? 0;
  }
}

export const Render2 = ({ ray, Interface, show =  { initial: true, terminal: true } }: { ray: Ray.Any, Interface: Ray.Any, index: number, show?: { initial: boolean, terminal: boolean } }) => {
  const index = ___index(ray);
  let added = [15 * index, 60 * index, 0];

  const initial: Required<InterfaceOptions> = ray.follow(Ray.directions.previous).render_options(Interface);
  initial.position = add_(initial.position, added);
  const vertex: Required<InterfaceOptions> = ray.render_options(Interface);
  vertex.position = add_(vertex.position, added);
  const terminal: Required<InterfaceOptions> = ray.follow().render_options(Interface);
  terminal.position = add_(terminal.position, added);

  switch (ray.type) {
    case RayType.REFERENCE: {
      return <_Vertex position={vertex.position} rotation={[0, 0, Math.PI / 2]} scale={vertex.scale / 2}
                      color="#555555"/>;
    }
    case RayType.VERTEX: {
      return <group>
        <Line
          end={add_(vertex.position, [-torus.radius * vertex.scale, 0, 0])}
          start={add(initial.position, [circle.radius * vertex.scale, 0, 0])}

          {..._.pick(vertex, 'color', 'scale')} {..._.pick(vertex, 'color', 'scale')} />
        <_Vertex {...vertex} />
        <Line
          start={add(terminal.position, [-circle.radius * vertex.scale, 0, 0])}
          end={add_(vertex.position, [torus.radius * vertex.scale, 0, 0])}
          {..._.pick(vertex, 'color', 'scale')}
        />
      </group>
    }
    case RayType.INITIAL: {
      return <group>
        <Line start={add(terminal.position, [-circle.radius * vertex.scale, 0, 0])}
              end={add_(vertex.position, [torus.radius * vertex.scale, 0, 0], !show.initial && ray.type === RayType.INITIAL ? [-15, -15, 0] : [0, 0, 0])} {..._.pick(vertex, 'color', 'scale')} />

        <_Continuation {...vertex}
                       position={add_(vertex.position, !show.initial && ray.type === RayType.INITIAL ? [-15, -15, 0] : [0, 0, 0])}/>
      </group>
    }
    case RayType.TERMINAL: {
      return <group>
        <Line
          start={add(initial.position, [circle.radius * vertex.scale, 0, 0])}
          end={add_(vertex.position, [-torus.radius * vertex.scale, 0, 0])}
          {..._.pick(vertex, 'color', 'scale')}
          {..._.pick(vertex, 'color', 'scale')}
        />
        <_Continuation {...vertex}
                       position={add_(vertex.position, !show.terminal && ray.type === RayType.TERMINAL ? [15, 15, 0] : [0, 0, 0])}/>
      </group>
    }
    default: {
      return <group></group>
    }
  }
  switch (ray.type) {
    case RayType.REFERENCE:
      return <_Vertex position={vertex.position} rotation={[0, 0, Math.PI / 2]} scale={vertex.scale / 2}
                      color="#555555"/>
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
  }
}

export const QuickVisualizationInterface = ({scale = 1.5}: InterfaceOptions) => {
  const ref = useRef<any>();
  const hotkeyConfig = useHotkeys();

  const {
    gl: renderer,
    camera,
    scene,
    raycaster
  } = useThree();

  const space_between = 20 * scale;

  const [Interface] = useState<Ray.Any>(Ray.vertex().o({
    selection:
      // The things selected
      Ray.None()
        // Our cursor
        .as_reference().o({
          position: [0, 0, 0],
          scale,
          rotation: [0, 0, Math.PI / 6 ],
          color: '#555555'
        })
        // A reference to our cursor
        .as_reference(),
    rays: [] as Ray[],
    stats: false,
    cursor: {
      tick: false
    },
    add: (ray: Ray.Any) => {
      (Interface.any.selection as Ray).self.self = ray.self.as_arbitrary();
      Interface.any.Ray.push(...[ray.follow(Ray.directions.previous), ray, ray.follow()]);
    },
    controls: {
      hotkeys: [
        {

          combo: ["space"], global: true, label: "", onKeyDown: () => {
            const { selection, rays } = Interface.any;

            if (selection.self.is_none()) {
              console.log('hi');

              Interface.any.add(
                Ray.vertex().o2({
                  initial: { position: [-space_between, 0, 0], scale, color: 'orange' },
                  vertex: { index: 0, position: [0, 0, 0], scale, color: 'orange' },
                  terminal: { position: [space_between, 0, 0 ], scale, color: 'orange' },
                }).as_reference()
              );

            }
          }
        },
        {
          combo: [
            "w",
            "a",
            "s",
            "d"
          ], global: true, label: "", preventDefault: true, onKeyDown: (event: any, { pressed }: HotkeyEventOptions) => {
            const selection = Interface.any.selection as Ray;

            // TODO These should be Rays at some point
            const directions = [
              [["a"], ["d"]], // TODO These superpositions on initial/terminal side
              [["s"], ["w"]],
              // TODO Then expand these to any-dimensional
            ];

            const isFollowing = directions.map(
              ([initial, terminal]) => {
                const toInitial = initial.some(option => pressed.includes(option));
                const toTerminal = terminal.some(option => pressed.includes(option));

                if (toInitial === toTerminal)
                  return 0;

                return toInitial ? -1 : 1;
              }
            );

            // TODO: .all(), which includes the reference?? ; since selection can be arbitrary structure too.
            // selection.any.position = add(selection.any.position, [
            //   space_between * isFollowing[0],
            //   space_between * isFollowing[1],
            //   0
            // ]);
            // selection.all().position = (position: [number, number, number]) => add(position, [
            //   space_between * isFollowing[0], // TODO These selections automatic
            //   space_between * isFollowing[1],
            //   0
            // ]);
            // selection.self.any.position = add(selection.self.any.position, [
            //   (space_between / 2) * isFollowing[0], // TODO These selections automatic
            //   (space_between / 2) * isFollowing[1],
            //   0
            // ]);
            if (isFollowing[0] !== 0) {
              // TODO: Should be on here compose(terminal).all().position =
              const position = Interface.any.selection.dereference.any.position;
              const to_add = [(space_between * 2) * isFollowing[0], 0, 0];

              const ref = Ray.vertex().o2({
                initial: { position: add_(position, to_add, [-space_between, 0, 0]), scale, color: 'orange' },
                vertex: { index: 0, position: add_(position, to_add, [0, 0, 0]), scale, color: 'orange' },
                terminal: { position: add_(position, to_add, [space_between, 0, 0 ]), scale, color: 'orange' },
              }).as_reference();

              const [initial, terminal] = isFollowing[0] === -1 ?
                [ref, selection.dereference,] : [selection.dereference, ref];

              initial.compose(terminal);

              Interface.any.add(ref);
            }
          }
        },
        {
          combo: [
            "arrowright",
            "arrowleft",
            "arrowup",
            "arrowdown"
          ], global: true, label: "", preventDefault: true, onKeyDown: (event: any, { pressed }: HotkeyEventOptions) => {
            const selection = Interface.any.selection as Ray;

            // TODO These should be Rays at some point
            const directions = [
              [["arrowleft"], ["arrowright"]], // TODO These superpositions on initial/terminal side
              [["arrowdown"], ["arrowup"]],
              // TODO Then expand these to any-dimensional
            ];

            const isFollowing = directions.map(
              ([initial, terminal]) => {
                const toInitial = initial.some(option => pressed.includes(option));
                const toTerminal = terminal.some(option => pressed.includes(option));

                if (toInitial === toTerminal)
                  return 0;

                return toInitial ? -1 : 1;
              }
            );

            // TODO: .all(), which includes the reference?? ; since selection can be arbitrary structure too.
            // selection.any.position = add(selection.any.position, [
            //   space_between * isFollowing[0],
            //   space_between * isFollowing[1],
            //   0
            // ]);
            // selection.all().position = (position: [number, number, number]) => add(position, [
            //   space_between * isFollowing[0], // TODO These selections automatic
            //   space_between * isFollowing[1],
            //   0
            // ]);
            selection.self.any.position = add(selection.self.any.position, [
              (space_between / 2) * isFollowing[0], // TODO These selections automatic
              (space_between / 2) * isFollowing[1],
              0
            ]);
          }
        },
        {
          combo: [
            "ctrl + arrowright",
            "ctrl + arrowleft",
            "ctrl + arrowup",
            "ctrl + arrowdown"
          ], global: true, label: "", preventDefault: true, onKeyDown: (event: any, { pressed }: HotkeyEventOptions) => {
            const { selection, rays } = Interface.any;

            // TODO These should be Rays at some point
            const directions = [
              [["arrowleft"], ["arrowright"]], // TODO These superpositions on initial/terminal side
              [["arrowdown"], ["arrowup"]],
              // TODO Then expand these to any-dimensional
            ];
            const isFollowing = directions.map(
              ([initial, terminal]): Ray.FunctionImpl => {
                const toInitial = initial.some(option => pressed.includes(option));
                const toTerminal = terminal.some(option => pressed.includes(option));

                if (toInitial === toTerminal)
                  return Ray.directions.none;

                return toInitial ? Ray.directions.previous : Ray.Any.directions.next;
              }
            );

            // TODO ; ANY NUMBER/structure CURSOR
            const next = (Interface.any.selection as Ray).dereference.follow(isFollowing[0]);
            if (next.self.is_some()) {
              console.log('a');
              (Interface.any.selection as Ray).self.self = next.self.as_arbitrary();
            }

            console.log(isFollowing)

            // selection.all().position = (position: [number, number, number]) => add(position, [
            //   space_between * isFollowing[0], // TODO These selections automatic
            //   space_between * isFollowing[1],
            //   0
            // ]);
          }
        },
        {
          combo: "/", global: true, label: "", preventDefault: true, onKeyDown: () => {
            console.log(Interface.any.Ray.map((ray: Ray.Any) => Ray.Any.render_options(Interface)))
            // console.log('---------')
            // console.log(`Debugging: ${Interface.any.selection.self.label} (type=${Interface.any.selection.type})`)
            // console.log(`Ray.length at pos=[${Interface.any.selection.render_options(Interface).position}]: ${Interface.any.Ray.filter((ray: Ray.Any) =>
            //   _.isEqual(
            //     Interface.any.selection.render_options.position,
            //     ray.render_options(Interface).position
            //   )
            // ).length} / ${Interface.any.Ray.length}`)
            // console.log('ref', Interface.any.selection)
            // console.log('ref.self', Interface.any.selection.self)
            //
            // const debug: DebugResult = {};
            // Interface.any.selection.self.debug(debug);
            // console.log('ref.debug', debug);
            // Interface.any.Ray.forEach((ray: Ray.Any) => Ray.Any.debug(debug));
            // console.log('Ray.debug', debug);

          }
        },
        {
          combo: "f3", global: true, label: "Show stats Panel", preventDefault: true, onKeyDown: (e) => {
            e.preventDefault();
            Interface.any.stats = !Interface.any.stats;
          }
        },
      ] as HotkeyConfig[]
    }
  }).as_reference());

  // useEffect(() => {
  // TODO: Eventually goes over maximum size of react-debug callstack when updates each frame like this.
  hotkeyConfig.set(...Interface.any.controls.hotkeys);
  // }, [Interface.any.controls.___any.hotkeys]);

  const index = ___index(Interface.any.selection);
  const added = [15 * index, 60 * (index + 1), 0];

  return <>
    {Interface.any.stats ? <StatsPanels/> : <></>}

    <AutoVertex
      position={Interface.any.selection.dereference.any.position}
      rotation={[0, 0, Math.PI / 5]}
      scale={scale / 1.5}
      color="#555555"
    />

    {/*{Interface.any.Ray.map((ray: Ray.Any) => <Render key={ray.label} ray={ray} />)}*/}

    {Interface.any.Ray.map((ray: Ray.Any) => <Render2 index={0} key={ray.self.label} Interface={Interface} ray={ray}/>)}

    {/*<group position={[0, 0, 0]}>*/}
    {/*  <AutoVertex position={add(Interface.any.selection.any.position, added)} rotation={[0, 0, Math.PI / 2]}*/}
    {/*              scale={scale / 1.5} color="#55FF55"/>*/}
    {/*  <group position={[0, 60, 0]}>*/}
    {/*    {Interface.any.Ray.___map((ray: Ray.Any, index: number) => <Render2 key={ray.self.label} Interface={Interface} ray={ray} index={index} show={{initial: false, terminal: false}} />)}*/}
    {/*  </group>*/}
    {/*</group>*/}

    {/*<group position={[0, 120, 0]}>*/}
    {/*  <AutoVertex position={add(Interface.any.selection.any.position, added)} rotation={[0, 0, Math.PI / 2]}*/}
    {/*              scale={scale / 1.5} color="#55FF55"/>*/}
    {/*  <group position={[0, 60, 0]}>*/}
    {/*    {Interface.any.Ray.___map((ray: Ray.Any, index: number) => <Render2 key={ray.self.label} Interface={Interface} ray={ray} index={index}/>)}*/}
    {/*  </group>*/}
    {/*</group>*/}
  </>
}

const QuickVisualizationCanvas = (
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
    {/*  <Organization {...ORGANIZATIONS.QuickVisualization} only_logo />*/}
    {/*  <Organization {...ORGANIZATIONS.orbitmines_research} only_logo />*/}
    {/*</Row>*/}

    <VisualizationCanvas
      style={{height: '100vh'}}
    >
      <QuickVisualizationInterface/>
    </VisualizationCanvas>
  </div>
}

export const QuickVisualizationExplorer = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {

  const listener: IEventListener<any> = {}

  return <QuickVisualizationCanvas/>
}

export default QuickVisualizationCanvas;