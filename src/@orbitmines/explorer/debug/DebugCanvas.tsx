import IEventListener from "../../js/react/IEventListener";
import {VisualizationCanvas} from "../Visualization";
import React, {useEffect, useReducer, useRef, useState} from "react";
import {useHotkeys} from "../../js/react/hooks/useHotkeys";
import {DebugResult, Ray, RayType} from "../Ray";
import {_Continuation, _Vertex, add, AutoVertex, circle, InterfaceOptions, Line, torus} from "../OrbitMinesExplorer";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import {useThree} from "@react-three/fiber";
import {Stats, StatsGl} from "@react-three/drei";
import _ from "lodash";

// TODO: What about showing disconnect when multiple things are rendered at the same position??
// TODO: It's, rende rboth draw equivalence, then ignore the difference from either perspective or take some middle thing. - Line from both ends, also vertex? (or take the pos, take the x from one/other, y from the other/..)

// TODO: Could be a function on Ray (any func really)
export const Render = ({ ray, Interface }: { ray: Ray, Interface: Ray }) => {
  const initial: Required<InterfaceOptions> = ray.self.initial.as_reference().render_options(Interface);
  const vertex: Required<InterfaceOptions> = ray.render_options(Interface);
  const terminal: Required<InterfaceOptions> = ray.self.terminal.as_reference().render_options(Interface);

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

  const [Interface] = useState<Ray>(Ray.vertex().o({
    selection: Ray.vertex(
      // () => Ray.vertex().o2({
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
    controls: Ray.vertex().o({
      hotkeys: [
        {
          combo: ["a", "arrowleft"], global: true, label: "", onKeyDown: () => {
            Interface.any.selection = Interface.any.selection.move((self: Ray) => self.initial, memory, Interface);
          }
        },
        {
          combo: ["d", "arrowright"], global: true, label: "", onKeyDown: () => {
            Interface.any.selection = Interface.any.selection.move((self: Ray) => self.terminal, memory, Interface);
          }
        },
        {
          combo: ["delete"], global: true, label: "", onKeyDown: () => {
            Interface.any.rays = Interface.any.rays.filter((ray: Ray) => ray.self.label !== Interface.any.selection.self.label); // Should be automatic, this sort of thing
            Interface.any.selection = Interface.any.selection.delete;
          }
        },
        {
          combo: ["w", "arrowup"], global: true, label: "", onKeyDown: () => {
            // TODO SHOULD BE ANOTHER DIRECTION AT THE FRAME?
            Interface.any.selection = Interface.any.selection.move((self: Ray) => self.self, memory, Interface);
          }
        },
        {
          combo: ["e"], global: true, label: "", onKeyDown: () => {
            const change = [0, 0, Math.PI / 10];
            console.log(Interface.any.selection.self.initial.label)

            Interface.any.selection = Interface.any.selection.self.o2({
              initial: { rotation: add(Interface.any.selection.self.initial.any.rotation ?? [0, 0, 0], change) },
              terminal: { rotation: add(Interface.any.selection.self.terminal.any.rotation ?? [0, 0, 0], change) },
            })
          }
        },
        {
          combo: ["space"], global: true, label: "", onKeyDown: (e) => {
            e.preventDefault();
            Interface.any.rays = Interface.any.selection.self.___dirty_all([]).map((ray: Ray) => {
              ray.any.traversed = true;
              return ray.as_reference();
            });
          }
        },
        // {
        //   combo: ["s", "arrowdown"], global: true, label: "", onKeyDown: () => {
        //     Interface.any.selection = Interface.any.selection.move((self: Ray) => self.as_reference().as_reference(), memory, Interface);
        //   }
        // },
        {
          combo: "/", global: true, label: "", onKeyDown: () => {
            console.log('---------')
            console.log(`Debugging: ${Interface.any.selection.self.label} (type=${Interface.any.selection.type})`)
            console.log(`rays.length at pos=[${Interface.any.selection.render_options.position}]: ${Interface.any.rays.filter((ray: Ray) => 
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

  return <>
    {Interface.any.stats ? <StatsPanels/> : <></>}

    <AutoVertex position={(Interface.any.selection as Ray).any.position} rotation={[0, 0, Math.PI / 5]} scale={scale / 2} color="#555555" />

    {/*{Interface.any.rays.map((ray: Ray) => <Render key={ray.label} ray={ray} />)}*/}
    {Interface.any.rays.map((ray: Ray) => <Render key={ray.self.label} ray={ray} Interface={Interface} />)}
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
