import React from 'react';
import {Ray, RayType} from "./Ray";
import {VisualizationCanvas} from "./Visualization";
import {CatmullRomLine, Circle, CubicBezierLine, QuadraticBezierLine, Torus} from "@react-three/drei";
import _ from "lodash";
import IEventListener from "../js/react/IEventListener";
import {Children} from "../../lib/typescript/React";
import {NotImplementedError} from "./errors/errors";

// TODO, All this should be automatic through Ray
export const add_ = (...a: number[][]): [number, number, number] => {
  let res = a[0];
  for (let i = 1; i < a.length; i++) {
    res = add(res, a[i]);
  }
  return res as [number, number, number];
}
export const sub = (a: number[], b: number[]): [number, number, number] => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export const Curve = (
  { color = "#FFFF55",
    position = [0, 0, 0],
    initial = position,
    terminal = add(position, [0, 30, 0]),
    scale = 1.5 }: any) => {
  const radius = 15;

  return <group position={[0, 0, 0]}>
    {/*<Torus*/}
    {/*  args={[radius, torus.tube.width, torus.segments, torus.tube.segments, Math.PI]}*/}
    {/*  material-color={color}*/}
    {/*  position={position}*/}
    {/*/>*/}
    <CubicBezierLine
      start={initial}
      // mid={mid}
      midA={add(initial, [radius * 1.25, radius - radius / 1.5, 0])}
      midB={add(initial, [radius * 1.25, radius + radius / 1.5, 0])}
      end={terminal}
      color={color}
      lineWidth={line.width * scale}
    />
  </group>
}

const BinaryValue = ({ boolean, position }: any) => {
  if (boolean)
    return <BinaryValue boolean={false} position={add(position, [0, -40, 0])}/>

  const halfTorus = (torus.radius + (torus.tube.width / 2));

  const up = add(position, [0, 60, 0]);
  const middle = add(position, [0, 20, 0]);
  const down = add(position, [0, -20, 0]);

  return <>
    <CatmullRomLine points={[
      add(down, [0, halfTorus, 0]),
      middle
    ]} color="#FF5555" lineWidth={line.width * 1.5}/>
    <CatmullRomLine points={[
      middle,
      add(up, [0, -halfTorus, 0]),
    ]} color="#5555FF" lineWidth={line.width * 1.5}/>

    <Circle position={middle} material-color="#FF55FF" args={[circle.radius / 2, circle.segments]} />

    <Circle position={position} material-color="#FF5555" args={[circle.radius, circle.segments]}/>
    <Circle position={add(position, [0, 40, 0])} material-color="#5555FF" args={[circle.radius, circle.segments]}/>

    <Continuation color="#FF5555" position={down} />
    <Continuation color="#5555FF" position={up} />

  </>
}

/**
 * Temporary Ray visualization till the visualization is incorporated into the editor (Basically when Visualization = Ray)
 *
 * TODO; Generalize to Ray - should be embedded on the vertex, or on another layer of description, where the interface is a rewrite rule
 */
export type InterfaceOptions = {
  position?: [number, number, number],
  rotation?: [number, number, number],
  scale?: number,
  color?: string
}
type Options = {
  initial?: InterfaceOptions,
  vertex?: InterfaceOptions,
  terminal?: InterfaceOptions,
}

type RenderContext = Compiler; // Rendering is Compiling - Something which holds equivalences and ignores/shuts down self-referential structures.
export type Compiler = {
  coverage(ray: Ray.Any): Ray.Any, // Disallow dedups
  covered_by(cover: Ray.Any, ray: Ray.Any): Compiler
}

class TempCompiler implements Compiler {
  coverage(ray: Ray.Any): Ray.Any {
    return Ray.None();
  }
  covered_by(cover: Ray.Any, ray: Ray.Any): Compiler {
    return this;
  }
}

export const AutoRay = (
  { ray,
    compiler,
    initial: _default_initial,
    terminal: _default_terminal,
    ...options
  }: { ray: Ray.Any, compiler?: Compiler } & Omit<Options, 'vertex'> & InterfaceOptions
) => {
  compiler ??= new TempCompiler();


  const o = (ray: Ray.Any, defaults: InterfaceOptions = {}): Required<InterfaceOptions> => {
    const {
      position = defaults.position ?? [0, 0, 0],
      rotation = defaults.rotation ?? [0, 0, 0],
      scale = defaults.scale ?? 1.5,
      color = defaults.color ?? 'orange'
    } = ray.any;
    return ({ position, rotation, scale, color, })
  };

  // Move to a layer of abstraction above what is passed to us - this way we can start describing it.
  const ref = { // TODO; This general pattern is probably worth abstracting somewhere.
    initial: Ray.Any.initial.as_reference(),
    vertex: Ray.Any.as_reference(),
    terminal: Ray.Any.terminal.as_reference()
  }

  if (compiler.coverage(ray).is_some())
    return <></>;

  // console.log(ref.vertex.type)

  compiler.covered_by(ref.vertex, ray);

  const interface_options = { // TODO: See here again
    initial: o(ray.initial, { ..._default_initial }),
    vertex: o(ray, { ...options }),
    terminal: o(ray.terminal, { ..._default_terminal }),
  }

  //
  // switch (ref.vertex.type) {
  //   case RayType.REFERENCE:
  //     break;
  //   case RayType.INITIAL:
  //     break;
  //   case RayType.TERMINAL:
  //     break;
  //   case RayType.VERTEX:
  //     break;
  // }
  //

  // const _default = { scale: 1.5 }
  // //
  // const map: { [type: string]: { [type: string]: Pick<Ray, 'type'> & InterfaceOptions }} = {
  //   [RayType.INITIAL]: {
  //     [RayType.INITIAL]: { type: Ray.AnyType.INITIAL, position: [-20 * _default.scale, 0, 0] },
  //     [RayType.VERTEX]: { type: Ray.AnyType.VERTEX, position: [-20 * _default.scale, 0, 0], rotation: [0, 0, Math.PI / 2] },
  //     [RayType.TERMINAL]: { type: Ray.AnyType.TERMINAL },
  //   }
  // }
  // const initial_op = map[RayType.INITIAL][ref.initial.type];

  return <group>
    {/*{ref.initial.is_none() ? <SimpleRenderedRay*/}
    {/*    {...initial_op} initial={interface_options.initial} {...interface_options.vertex} terminal={interface_options.terminal}*/}
    {/*/> : <AutoRay ray={ray.initial} compiler={compiler} />}*/}
    <SimpleRenderedRay
      type={ref.vertex.type} initial={interface_options.initial} {...interface_options.vertex} terminal={interface_options.terminal}
    />
    {/*<AutoRay ray={ray.terminal} compiler={compiler} />*/}
  </group>
}

export const AutoVertex = (ray: Omit<Options, 'vertex'> & InterfaceOptions & {
  length?: number // basically .length
  children?: any
}) => {
  const {
    length = 1,
    children
  } = ray;
  const _default: Required<InterfaceOptions> = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
    color: 'orange',
    // ..._.pick(ray.vertex, 'position', 'rotation', 'scale', 'color'),
    ..._.pick(ray, 'position', 'rotation', 'scale', 'color')
  }

  const initial: Required<InterfaceOptions> = {..._default, position: [-20 * _default.scale, 0, 0], ...ray.initial};

  // Vertex as the origin for rotation
  const vertex: Required<InterfaceOptions> = {..._default, position: [0, 0, 0]} //, ...ray.vertex };
  const terminal: Required<InterfaceOptions> = {..._default, position: [20 * _default.scale, 0, 0], ...ray.terminal};


  if (length > 1) // TODO, currently rotates around each vertex individually
    return <group>{[...Array(length)]
      .map(((_, i) => <AutoVertex {...ray} length={1} position={add(_default.position, [60 * i, 0, 0])}/>))}</group>

  return <group position={_default.position} rotation={vertex.rotation}>
    <SimpleRenderedRay type={RayType.INITIAL} {...initial} terminal={vertex}/>
    <SimpleRenderedRay type={RayType.VERTEX} {...vertex} initial={initial} terminal={terminal}/>
    <SimpleRenderedRay type={RayType.TERMINAL} {...terminal} initial={vertex}/>

    <group scale={vertex.scale} position={vertex.position}>{children}</group>
  </group>
}
export const _Continuation = ({color = torus.color, ...options }: InterfaceOptions) =>
  <Torus
    args={[torus.radius, torus.tube.width, torus.segments, torus.tube.segments]}
    material-color={color}
    {...options}
  />
export const _Vertex = ({ color = circle.color, ...options }: any) =>
  <Circle
    args={[circle.radius, circle.segments]}
    material-color={color}
    {...options}
  />
export const SimpleRenderedRay = (
  ray: Pick<Ray, 'type'>
    & Options // Relative options to other rays
    & InterfaceOptions // Default options
) => {
  const _default: Required<InterfaceOptions> = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: 1,
    color: 'orange',
    ..._.pick(ray, 'position', 'rotation', 'scale', 'color')
  }

  const initial: Required<InterfaceOptions> = { ..._default, ...ray.initial };
  const vertex: Required<InterfaceOptions> = { ..._default, ...ray.vertex };
  const terminal: Required<InterfaceOptions> = { ..._default, ...ray.terminal };
  const { type } = ray;

  switch (type) {
    case RayType.REFERENCE:
      throw new NotImplementedError();
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




const OrbitMinesExplorer = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {

  return (
    <VisualizationCanvas
      style={{height: '100vh'}}
    >

    </VisualizationCanvas>
  );
};

export default OrbitMinesExplorer;