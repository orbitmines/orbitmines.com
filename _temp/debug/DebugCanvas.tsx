import IEventListener from "../../js/react/IEventListener";
import {VisualizationCanvas} from "../Visualization";
import React, {useEffect, useReducer, useRef, useState} from "react";
import {useHotkeys} from "../../js/react/hooks/useHotkeys";
import {_Continuation, _Vertex, add, AutoVertex, circle, InterfaceOptions, Line, torus} from "../OrbitMinesExplorer";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import {useThree} from "@react-three/fiber";
import {Stats, StatsGl} from "@react-three/drei";
import _ from "lodash";
import Ray from "@orbitmines/rays"

export const Render = ({ ray, Interface }: { ray: Ray.Any, Interface: Ray.Any }) => {
  const initial: Required<InterfaceOptions> = ray.follow(Ray.directions.previous).render_options(Interface);
  const vertex: Required<InterfaceOptions> = ray.render_options(Interface);
  const terminal: Required<InterfaceOptions> = ray.follow().render_options(Interface);

  switch (ray.type) {
    case RayType.REFERENCE:
      return <_Vertex position={vertex.position} rotation={[0, 0, Math.PI / 2]} scale={vertex.scale / 2} color="#555555" />
    case RayType.INITIAL: {

      return <group rotation={vertex.rotation}>
        <Line start={add(terminal.position, [-circle.radius * vertex.scale, 0, 0])} end={add(vertex.position, [torus.radius * vertex.scale, 0, 0])} {..._.pick(vertex, 'color', 'scale')} />
        <_Continuation {...vertex} />
      </group>
    }
    case RayType.TERMINAL: {
      // TODO; Rotation like this will not be picked up upon by other thing, calculate on the fly??
      return <group rotation={vertex.rotation}>
        <Line start={add(initial.position, [circle.radius * vertex.scale, 0, 0])} end={add(vertex.position, [-torus.radius * vertex.scale, 0, 0])} {..._.pick(vertex, 'color', 'scale')} />
        <_Continuation {...vertex} />
      </group>
    }
    case RayType.VERTEX: {
      return <_Vertex {...vertex} />
    }
  }
}

export const DebugInterface = ({ scale = 1.5 }: InterfaceOptions) => {
  const ref = useRef<any>();
  const hotkeyConfig = useHotkeys();

  const {
    gl: renderer,
    camera,
    scene,
    raycaster
  } = useThree();

  const space_between = 20 * scale;
  
  const memory = false;

  const [Interface] = useState<Ray.Any>(Ray.vertex().o({
    selection: Ray.Any.vertex(
      // () => Ray.Any.vertex().o2({
      //   initial: { position: [-space_between, 0, 0], scale, rotation: [0, 0, Math.PI / 2] },
      //   vertex: { position: [0, 0, 0], scale, color: '#FF55FF' },
      //   terminal: { position: [space_between, 0, 0 ], scale, rotation: [0, 0, Math.PI / 2] }
      // })
    ).o2({
      initial: { position: [-space_between, 0, 0], scale },
      vertex: { position: [0, 0, 0], scale, color: '#FF55FF' },
      terminal: { position: [space_between, 0, 0 ], scale }
    }).as_reference().o({
      position: [0, 0, 0],
      scale,
      rotation: [0, 0, Math.PI / 6 ],
      color: '#555555'
    }),
    rays: [] as Ray[],
    stats: false,
    cursor: { tick: false },
    controls: Ray.Any.vertex().o({
      hotkeys: [
        {
          combo: ["a", "arrowleft"], global: true, label: "", onKeyDown: () => {
            Interface.___any.selection = Interface.___any.selection.move((self: Ray.Any) => self.initial, memory, Interface);
          }
        },
        {
          combo: ["d", "arrowright"], global: true, label: "", onKeyDown: () => {
            Interface.___any.selection = Interface.___any.selection.move((self: Ray.Any) => self.terminal, memory, Interface);
          }
        },
        {
          combo: ["delete"], global: true, label: "", onKeyDown: () => {
            Interface.___any.rays = Interface.___any.Ray.filter((ray: Ray.Any) => Ray.Any.self.label !== Interface.___any.selection.self.label); // Should be automatic, this sort of thing
            Interface.___any.selection = Interface.___any.selection.delete;
          }
        },
        {
          combo: ["w", "arrowup"], global: true, label: "", onKeyDown: () => {
            // TODO SHOULD BE ANOTHER DIRECTION AT THE FRAME?
            Interface.___any.selection = Interface.___any.selection.move((self: Ray.Any) => self.self, memory, Interface);
          }
        },
        {
          combo: ["e"], global: true, label: "", onKeyDown: () => {
            const change = [0, 0, Math.PI / 10];
            console.log(Interface.___any.selection.self.initial.label)

            Interface.___any.selection = Interface.___any.selection.self.o2({
              initial: { rotation: add(Interface.___any.selection.self.initial.___any.rotation ?? [0, 0, 0], change) },
              terminal: { rotation: add(Interface.___any.selection.self.terminal.___any.rotation ?? [0, 0, 0], change) },
            })
          }
        },
        {
          combo: ["space"], global: true, label: "", onKeyDown: (e) => {
            e.preventDefault();
            Interface.___any.rays = Interface.___any.selection.self.___dirty_all([]).map((ray: Ray.Any) => {
              ray.___any.traversed = true;
              return ray.as_reference();
            });
          }
        },
        // {
        //   combo: ["s", "arrowdown"], global: true, label: "", onKeyDown: () => {
        //     Interface.___any.selection = Interface.___any.selection.move((self: Ray.Any) => self.as_reference().as_reference(), memory, Interface);
        //   }
        // },
        {
          combo: "/", global: true, label: "", onKeyDown: () => {
            console.log('---------')
            console.log(`Debugging: ${Interface.___any.selection.self.label} (type=${Interface.___any.selection.type})`)
            console.log(`Ray.length at pos=[${Interface.___any.selection.render_options.position}]: ${Interface.___any.Ray.filter((ray: Ray.Any) => 
              _.isEqual(
                Interface.___any.selection.render_options.position,
                ray.render_options(Interface).position
              )
            ).length} / ${Interface.___any.Ray.length}`)
            console.log('ref', Interface.___any.selection)
            console.log('ref.self', Interface.___any.selection.self)

            const debug: DebugResult = {};
            Interface.___any.selection.self.debug(debug);
            console.log('ref.debug', debug);
            Interface.___any.Ray.forEach((ray: Ray.Any) => Ray.Any.debug(debug));
            console.log('Ray.debug', debug);

          }
        },
        {
          combo: "f3", global: true, label: "Show stats Panel", onKeyDown: (e) => {
            e.preventDefault();
            Interface.___any.stats = !Interface.___any.stats;
          }
        },
      ] as HotkeyConfig[]
    })
  }));

  // useEffect(() => {
  // TODO: Eventually goes over maximum size of react-debug callstack when updates each frame like this.
  hotkeyConfig.set(...Interface.___any.controls.___any.hotkeys);
  // }, [Interface.___any.controls.___any.hotkeys]);

  return <>
    {Interface.___any.stats ? <StatsPanels/> : <></>}

    <AutoVertex position={(Interface.___any.selection as Ray).___any.position} rotation={[0, 0, Math.PI / 5]} scale={scale / 2} color="#555555" />

    {/*{Interface.___any.Ray.map((ray: Ray.Any) => <Render key={ray.label} ray={ray} />)}*/}
    {Interface.___any.Ray.map((ray: Ray.Any) => <Render key={ray.self.label} ray={ray} Interface={Interface} />)}
  </>
}

export const StatsPanels = () => {
  const [_, forceUpdate] = useReducer((x) => !x, false);

  const parent = useRef(document.createElement('div'));

  useEffect(() => {
    document.body.appendChild(parent.current);

    for (let i = 0; i < parent.current.children.length; i++) {
      (parent.current.children[i] as any).style.cssText = `position: fixed; top: 0px; left: ${(i !== 0 ? 190 : 0) + 80 * i}px; cursor: pointer; opacity: 0.9; z-index: 10000;`;
    }

    if (parent.current.children.length < 3)
      forceUpdate();
  }, [_]);

  return <>
    <StatsGl className="stats" parent={parent} />
    {/*<Stats showPanel={0} parent={parent} />*/}
    <Stats showPanel={1} parent={parent} />
    <Stats showPanel={2} parent={parent} />
  </>
}

export const DebugCanvas = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {
  const listener: IEventListener<any> = {

  }

  return <div>
    <div></div>
    <VisualizationCanvas
      style={{height: '100vh'}}
    >
      <DebugInterface/>
    </VisualizationCanvas>
  </div>
}

export const DebugExplorer = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {

  const listener: IEventListener<any> = {}

  return <DebugCanvas/>
}
