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

// TODO: Could be a function on Ray (any func really)
const Render = ({ ray }: { ray: Ray }) => {
  const initial: Required<InterfaceOptions> = ray.self.initial.as_reference().render_options;
  const vertex: Required<InterfaceOptions> = ray.render_options;
  const terminal: Required<InterfaceOptions> = ray.self.terminal.as_reference().render_options;

  switch (ray.type) {
    case RayType.REFERENCE:
      return <AutoVertex position={vertex.position} rotation={[0, 0, Math.PI / 2]} scale={vertex.scale / 2} color="#55FF55" />
    case RayType.INITIAL: {
      return <>
        <Line start={add(terminal.position, [-circle.radius * vertex.scale, 0, 0])} end={add(vertex.position, [torus.radius * vertex.scale, 0, 0])} {..._.pick(vertex, 'color', 'scale')} />
        <_Continuation {...vertex} />
      </>
    }
    case RayType.TERMINAL: {
      return <>
        <Line start={add(initial.position, [circle.radius * vertex.scale, 0, 0])} end={add(vertex.position, [-torus.radius * vertex.scale, 0, 0])} {..._.pick(vertex, 'color', 'scale')} />
        <_Continuation {...vertex} />
      </>
    }
    case RayType.VERTEX: {
      return <_Vertex {...vertex} />
    }
  }
}

const DebugInterface = ({ scale = 1.5 }: InterfaceOptions) => {
  const ref = useRef<any>();
  const hotkeyConfig = useHotkeys();

  const {
    gl: renderer,
    camera,
    scene,
    raycaster
  } = useThree();

  const space_between = 20 * scale;
  
  const memory = true;

  const [Interface] = useState<Ray>(Ray.vertex().o({
    selection: Ray
      .vertex().o({ position: [0, 0, 0], scale, color: '#FF55FF' })
      .initial.o({ position: [-space_between, 0, 0], scale }).terminal
      .terminal.o({ position: [space_between, 0, 0 ], scale }).initial
      .as_reference().o({
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
          combo: ["w", "arrowup"], global: true, label: "", onKeyDown: () => {
            Interface.any.selection = Interface.any.selection.move((self: Ray) => self.self, memory, Interface);
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
                ray.render_options.position
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

  hotkeyConfig.set(...Interface.any.controls.any.hotkeys);

  return <>
    {Interface.any.stats ? <StatsPanels/> : <></>}

    <AutoVertex position={(Interface.any.selection as Ray).any.position} rotation={[0, 0, Math.PI / 5]} scale={scale / 2} color="#555555" />

    {/*{Interface.any.rays.map((ray: Ray) => <Render key={ray.label} ray={ray} />)}*/}
    {Interface.any.rays.map((ray: Ray) => <Render key={ray.self.label} ray={ray} />)}
  </>
}

const StatsPanels = () => {
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

const DebugCanvas = (
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
