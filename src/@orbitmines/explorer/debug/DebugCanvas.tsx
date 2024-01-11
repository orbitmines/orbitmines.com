import IEventListener from "../../js/react/IEventListener";
import {VisualizationCanvas} from "../Visualization";
import React, {useEffect, useReducer, useRef, useState} from "react";
import {useHotkeys} from "../../js/react/hooks/useHotkeys";
import {Ray, RayType} from "../Ray";
import {
  _Continuation, _Vertex,
  add,
  AutoRay,
  AutoVertex,
  InterfaceOptions,
  Line,
  SimpleRenderedRay,
  torus
} from "../OrbitMinesExplorer";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import {useThree} from "@react-three/fiber";
import {Stats, StatsGl} from "@react-three/drei";
import _ from "lodash";
import {NotImplementedError} from "../errors/errors";

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

  const [Interface] = useState<Ray>(Ray.vertex().o({
    selection: Ray
      .vertex().o({ position: [0, 0, 0], scale, color: 'orange' })
      .initial.o({ position: [-space_between, 0, 0] }).terminal
      .terminal.o({ position: [space_between, 0, 0 ]}).initial
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
          combo: "a", global: true, label: "", onKeyDown: () => {
            Interface.any.selection = Interface.any.selection.move((self: Ray) => self.initial, Interface.any.rays);
          }
        },
        {
          combo: "d", global: true, label: "", onKeyDown: () => {
            Interface.any.selection = Interface.any.selection.move((self: Ray) => self.terminal, Interface.any.rays);
          }
        },
        {
          combo: "w", global: true, label: "", onKeyDown: () => {
            Interface.any.selection = Interface.any.selection.move((self: Ray) => self.self, Interface.any.rays);
          }
        },
        {
          combo: "/", global: true, label: "", onKeyDown: () => {
            console.log('ref', Interface.any.selection)
            console.log('ref.self', Interface.any.selection.self)
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

  const { selection, controls, rays } = Interface.any;
  const { hotkeys } = controls.any;

  hotkeyConfig.set(...hotkeys);

  const render: { [TKey in keyof InterfaceOptions]: (ray: Ray) => InterfaceOptions[TKey] } = {
    position: (ray: Ray) => ray.self.any.position ?? (ray.is_none() ? [0, 400, 0] : [0, 0, 0]),
    rotation: (ray: Ray) => ray.self.any.rotation ?? [0, 0, 0],
    scale: (ray: Ray): number => ray.self.any.scale ?? (ray.is_none() ? 1.5 : 1.5),
    color: (ray: Ray): string => ray.self.any.color ?? (ray.is_none() ? 'red' : 'orange'),
  }

  const options = (ray: Ray): Required<InterfaceOptions> => _.mapValues(render, (func: any) => func(ray)) as Required<InterfaceOptions>;

  const Render = ({ ray }: { ray: Ray }) => {
    const initial: Required<InterfaceOptions> = options(ray.self.initial.as_reference());
    const vertex: Required<InterfaceOptions> = options(ray);
    const terminal: Required<InterfaceOptions> = options(ray.self.terminal.as_reference());

    switch (ray.type) {
      case RayType.REFERENCE:
        return <AutoVertex position={Interface.any.selection.self.position} rotation={[0, 0, Math.PI / 2]} scale={0.75} color="#55FF55" />
      case RayType.INITIAL: {
        return <>
          <Line start={terminal.position} end={add(vertex.position, [torus.radius * vertex.scale, 0, 0])} {..._.pick(vertex, 'color', 'scale')} />
          <_Continuation {...vertex} />
        </>
      }
      case RayType.TERMINAL: {
        return <>
          <Line start={initial.position} end={add(vertex.position, [-torus.radius * vertex.scale, 0, 0])} {..._.pick(vertex, 'color', 'scale')} />
          <_Continuation {...vertex} />
        </>
      }
      case RayType.VERTEX: {
        return <_Vertex {...vertex} />
      }
    }
  }

  return <>
    {Interface.any.stats ? <StatsPanels/> : <></>}

    <AutoVertex position={(Interface.any.selection as Ray).any.position} rotation={[0, 0, Math.PI / 5]} scale={0.75} color="#555555" />

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
