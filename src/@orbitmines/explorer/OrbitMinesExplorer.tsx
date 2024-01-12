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
export const add = (a: number[], b: number[]): [number, number, number] => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: number[], b: number[]): [number, number, number] => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

export const torus = {
  // Radius of the torus, from the center of the torus to the center of the tube. Default is 1.
  radius: 3, color: "orange", segments: 200, tube: { width: 1, segments: 200 },
}
export const Continuation = (
  {
    color = torus.color,
    radius = torus.radius,
    arc = Math.PI * 2,
    position
  }: any) =>
  <Torus
    args={[radius, torus.tube.width, torus.segments, torus.tube.segments, arc]}
    material-color={color}
    position={position}
  />

export const Loop = (
  { color = "#FFFF55",
    on = "orange",
    position = [0, 0, 0],
    initial = position,
    terminal = add(position, [0, 30, 0]),
    scale = 1.5,
    radius = 15,
    segments = 200
  }: any
) => {
  // const geometry = new TorusGeometry(radius, torus.tube.width, torus.segments, torus.tube.segments, Math.PI * 4);
  //
  // const vertices = geometry.getAttribute('position').array;
  // const points: any = [];
  // for (let i = 0; i < vertices.length; i += 3) {
  //   points.push([vertices[i], vertices[i + 1], vertices[i + 2]]);
  // }
  const points: [number, number, number][] = [];
  for (let i = 0; i < segments; i++) {
    const angle = ((i / segments) * Math.PI * 2) + Math.PI / 2; // STARTS AT THE TOP
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);

    if (i > 5 && i < segments - 6)
      points.push([x, y, 0])
  }
  console.log(points)

  const vertex = add(position, [0, -radius, 0]);
  const continuation = add(position, [0, radius, 0]);

  return <group>
    <CatmullRomLine position={position} points={points} color={color} lineWidth={line.width * scale}/>
    <Continuation position={continuation} color={color}/>
    <Vertex position={vertex} color={color} />
  </group>
}
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

const line = { width: 2,  length: 1,  color: "orange", }
export const Line = ({ start, mid, end, scale, color = line.color }: any) =>
  <QuadraticBezierLine
    start={start}
    mid={mid}
    end={end}
    color={color}
    lineWidth={line.width * scale}
  />

export const circle = { radius: 3,  color: "orange", segments: 30, }
export const Vertex = ({ position, color = circle.color }: any) =>
  <Circle position={position} material-color={color} args={[circle.radius, circle.segments]} />

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

export const BinarySuperposition = ({ position = [0, 0, 0], scale = 1.5 }: any) => {
  const halfTorus = (torus.radius + (torus.tube.width / 2));

  const up = add(position, [0, 20 + halfTorus, 0]);
  const down = add(position, [0, -20, 0]);

  const left = add(down, [-halfTorus, 0, 0]);
  const right = add(down, [+halfTorus, 0, 0]);

  return <>
    {/*<CatmullRomLine*/}
    {/*  points={[*/}
    {/*    add(left, [0, torus.radius, 0]),*/}
    {/*    add(left, [0, torus.radius + halfTorus * 2, 0]),*/}
    {/*    position,*/}
    {/*    add(up, [+halfTorus, -(torus.radius + halfTorus * 2), 0]),*/}
    {/*    add(up, [(line.width / 2), 0, 0]),*/}

    {/*    add(up, [-(line.width / 2), 0, 0]),*/}
    {/*    add(up, [-halfTorus, -(torus.radius + halfTorus * 2), 0]),*/}
    {/*    position,*/}
    {/*    add(right, [0, torus.radius + halfTorus * 2, 0]),*/}
    {/*    add(right, [0, torus.radius, 0])*/}
    {/*  ]}*/}
    {/*  color="#FF5555"*/}
    {/*  lineWidth={line.width * 1.5}*/}
    {/*/>*/}

    <CatmullRomLine points={[
      add(left, [0, torus.radius, 0]),
      add(left, [0, torus.radius + halfTorus * scale, 0]),
      position,
      add(up, [+halfTorus, -(torus.radius + halfTorus), 0]),
      add(up, [(line.width / 4), 0, 0]),
    ]} color="#FF5555" lineWidth={line.width * scale}/>
    <CatmullRomLine points={[
      add(right, [0, torus.radius, 0]),
      add(right, [0, torus.radius + halfTorus * scale, 0]),
      position,
      add(up, [-halfTorus, -(torus.radius + halfTorus), 0]),
      add(up, [-(line.width / 4), 0, 0])
    ]} color="#5555FF" lineWidth={line.width * scale}/>

    <Circle position={position} material-color={circle.color} args={[circle.radius, circle.segments]}/>
    <Continuation color="#FF5555" position={left} />

    <Continuation color="#5555FF" position={right} />

    <Circle position={up} material-color="#FF55FF" args={[circle.radius / 2, circle.segments]} />
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
  coverage(ray: Ray): Ray, // Disallow dedups
  covered_by(cover: Ray, ray: Ray): Compiler
}

class TempCompiler implements Compiler {
  coverage(ray: Ray): Ray {
    return Ray.None();
  }
  covered_by(cover: Ray, ray: Ray): Compiler {
    return this;
  }
}

export const AutoRay = (
  { ray,
    compiler,
    initial: _default_initial,
    terminal: _default_terminal,
    ...options
  }: { ray: Ray, compiler?: Compiler } & Omit<Options, 'vertex'> & InterfaceOptions
) => {
  compiler ??= new TempCompiler();


  const o = (ray: Ray, defaults: InterfaceOptions = {}): Required<InterfaceOptions> => {
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
    initial: ray.initial.as_reference(),
    vertex: ray.as_reference(),
    terminal: ray.terminal.as_reference()
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
  //     [RayType.INITIAL]: { type: RayType.INITIAL, position: [-20 * _default.scale, 0, 0] },
  //     [RayType.VERTEX]: { type: RayType.VERTEX, position: [-20 * _default.scale, 0, 0], rotation: [0, 0, Math.PI / 2] },
  //     [RayType.TERMINAL]: { type: RayType.TERMINAL },
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

// In principle, this should be anything, this is just for the initial setup
export const RenderedRay = (
  props: { reference: Ray } & { position?: [number, number, number], initial?: [number, number, number], terminal?: [number, number, number], scale?: number, color?: string }
) => {
  const {
    position = [0, 0, 0],
    reference,
    scale = 1,
    color = 'orange',
    initial = add(position, [-20, 0, 0]),
    terminal = add(position, [20, 0, 0]),
  } = props;
  const left = initial;
  const right = terminal;

  if (reference.is_none() || reference.is_none())
    return <></>

  const vertex = reference.self;

  const Rendered = () => {


    const type = vertex.as_reference().type;
    switch (type) {
      case RayType.INITIAL: {
        /**
         * [  |--]
         */
        if (vertex.vertex.is_none()) {
          return <Continuation color="orange" position={position} />
        } else {
          const possible_continuations = vertex.vertex;

          if (!possible_continuations.as_reference().is_terminal())
            return <Continuation color="orange" position={position} />
          //
          // if (vertex.terminal.store.rendered)
          //   return <></>

          return <RenderedRay
            {...props}
            reference={possible_continuations.initial.as_reference()}
          />
        }
      }
      case RayType.TERMINAL: {
        if (vertex.vertex.is_none()) {
          return <Continuation color="orange" position={position} />
        } else {
          const possible_continuations = vertex.vertex;

          // if (!possible_continuations.as_reference().is_initial())
          //   return <Continuation color="orange" position={position} />
          return <></>

          // return <RenderedRay
          //   {...props}
          //   reference={possible_continuations.terminal.as_reference()}
          // />
        }
      }
      case RayType.REFERENCE: {
        if (vertex.as_reference().is_none()) // empty reference
          return <Continuation color={color} position={position} />

        // throw 'Not Implemented'
        return <RenderedRay {...props} reference={vertex.is_some() ? vertex.as_reference() : Ray.None()} />
      }
      case RayType.VERTEX: {
        const tilt = -10; // TODO; Generally should use some equivalencing in the 3d-frames for this once setup is in place (perpsective/camera) if in threejs..
        // const left = add(position, [-80 + tilt, 0, 0]);
        // const right = add(position, [80 - tilt, 0, 0]);

        // const initial_side = {
        //   continuation: add(left, [tilt, 0, 0]),
        //   initial: add(left, [30 + tilt, 15, 0]),
        //   terminal: add(left, [30 - tilt, -15, 0]),
        //
        //   initial_continuation: add(left, [30 + tilt * 2, 15 + 15, 0]),
        //   terminal_continuation: add(left, [30 - tilt * 2, -15 - 15, 0]),
        // }
        // const terminal_side = {
        //   continuation: add(right, [-tilt, 0, 0]),
        //   initial: add(right, [-30 + tilt, 15, 0]),
        //   terminal: add(right, [-30 - tilt, -15, 0]),
        //
        //   initial_continuation: add(right, [-30 + tilt * 2, 15 + 15, 0]),
        //   terminal_continuation: add(right, [-30 - tilt * 2, -15 - 15, 0]),
        // }
        //
        // const Sup = ({ position }: any) => {
        //
        //   const left = add(position, [-20, 0, 0]);
        //   const right = add(position, [20, 0, 0]);
        //
        //   return <>
        //     <RenderedRay reference={vertex.initial.as_reference()} position={left} />
        //
        //     {/* Line now starts in the center of the torus tube */}
        //     <Line start={add(left, [torus.radius, 0, 0])} end={position} scale={scale} />
        //     {/*<Vertex position={position} />*/}
        //     <BinarySuperposition position={position} />
        //     <Line start={position} end={add(right, [-torus.radius, 0, 0])} scale={scale} />
        //     <RenderedRay reference={vertex.terminal.as_reference()} position={right} />
        //   </>
        // }

        // 55FF55
        // return <>
        //   <Sup position={[100, 70, 0]} />
        //
        //   <Continuation color="#55FF55" position={initial_side.continuation} />
        //
        //   <CatmullRomLine points={[
        //     add(initial_side.continuation, [0, torus.radius, 0]),
        //     initial_side.initial,
        //     terminal_side.initial,
        //     add(terminal_side.continuation, [0, torus.radius, 0])
        //   ]} color="#55FF55" lineWidth={line.width * 1.5}/>
        //
        //   <CatmullRomLine points={[
        //     add(initial_side.continuation, [0, -torus.radius, 0]),
        //     initial_side.terminal,
        //     terminal_side.terminal,
        //     add(terminal_side.continuation, [0, -torus.radius, 0])
        //   ]} color="#55FF55" lineWidth={line.width * 1.5}/>
        //
        //
        //   <Vertex position={initial_side.initial} color="#55FF55" />
        //   <Vertex position={initial_side.terminal} color="#55FF55" />
        //
        //   <Continuation color="#55FF55" position={terminal_side.continuation} />
        //
        //   <>
        //     <CatmullRomLine points={[
        //       initial_side.initial_continuation,
        //       add(initial_side.initial, [0, 0, 0]),
        //       add(initial_side.terminal, [0, 0, 0]),
        //       initial_side.terminal_continuation,
        //     ]} color="orange" lineWidth={line.width * 1.5}/>
        //
        //     <Vertex position={initial_side.initial_continuation} color="#1C2127" />
        //     <Continuation position={initial_side.initial_continuation} color="orange" />
        //     <Vertex position={initial_side.terminal_continuation} color="#1C2127" />
        //     <Continuation position={initial_side.terminal_continuation} color="orange" />
        //
        //     {/* 1C2127 quick for background */}
        //     <Vertex position={initial_side.initial} color="#1C2127" />
        //     <Vertex position={initial_side.initial} color="#FF5555" />
        //
        //     <CatmullRomLine points={[
        //       add(initial_side.initial, [0, -15, 0]),
        //       initial_side.initial,
        //       add(initial_side.initial, [0, 15, 0]),
        //     ]} color="#FF5555" lineWidth={line.width * 1.5}/>
        //
        //     <Vertex position={add(initial_side.initial, [0, -15, 0])} color="#1C2127" />
        //     <Continuation position={add(initial_side.initial, [0, -15, 0])} color="#FF5555" />
        //
        //     <Vertex position={initial_side.terminal} color="#1C2127" />
        //     <Vertex position={initial_side.terminal} color="orange" />
        //
        //     <CatmullRomLine points={[
        //       add(initial_side.initial, [0, 15, 0]),
        //       add(initial_side.initial, [0, 30, 0]),
        //       add(initial_side.initial, [0, 45, 0]),
        //     ]} color="#5555FF" lineWidth={line.width * 1.5}/>
        //
        //     <Vertex position={add(initial_side.initial, [0, 30, 0])} color="#5555FF" />
        //     <Circle position={add(initial_side.initial, [0, 15, 0])} material-color="#FF55FF" args={[circle.radius / 2, circle.segments]} />
        //
        //     <Vertex position={add(initial_side.initial, [0, 45, 0])} color="#1C2127" />
        //     <Continuation position={add(initial_side.initial, [0, 45, 0])} color="#5555FF" />
        //
        //   </>
        //
        //  <>
        //    <CatmullRomLine points={[
        //      terminal_side.initial_continuation,
        //      add(terminal_side.initial, [0, 0, 0]),
        //      add(terminal_side.terminal, [0, 0, 0]),
        //      terminal_side.terminal_continuation,
        //    ]} color="orange" lineWidth={line.width * 1.5}/>
        //
        //    <Vertex position={terminal_side.initial_continuation} color="#1C2127" />
        //    <Continuation position={terminal_side.initial_continuation} color="orange" />
        //    <Vertex position={terminal_side.terminal_continuation} color="#1C2127" />
        //    <Continuation position={terminal_side.terminal_continuation} color="orange" />
        //
        //    {/* 1C2127 quick for background */}
        //    <Vertex position={terminal_side.initial} color="#1C2127" />
        //    <Vertex position={terminal_side.initial} color="#FF5555" />
        //
        //    <Continuation position={add(terminal_side.continuation, [tilt - 10, 15, 0])} color="#FF5555" />
        //
        //    <CatmullRomLine points={[
        //      add(terminal_side.continuation, [tilt - 10 - torus.radius, 15, 0]),
        //      terminal_side.initial,
        //      add(terminal_side.initial, [tilt, -7.5, 0]),
        //      add(terminal_side.initial, [tilt, -15, 0]),
        //    ]} color="#FF5555" lineWidth={line.width * 1.5}/>
        //
        //    <Vertex position={terminal_side.terminal} color="#1C2127" />
        //    <Vertex position={terminal_side.terminal} color="#5555FF" />
        //
        //    <CatmullRomLine points={[
        //      add(terminal_side.continuation, [-tilt - 10 - torus.radius, -15, 0]),
        //      terminal_side.terminal,
        //      add(terminal_side.initial, [tilt + 6, -22.5, 0]),
        //      add(terminal_side.initial, [tilt, -15, 0]),
        //    ]} color="#5555FF" lineWidth={line.width * 1.5}/>
        //
        //    <Circle position={add(terminal_side.initial, [tilt, -15, 0])} material-color="#FF55FF" args={[circle.radius / 2, circle.segments]} />
        //
        //    <Continuation position={add(terminal_side.continuation, [-tilt - 10, -15, 0])} color="#5555FF" />
        //  </>
        // </>

        // const left = add(position, [-20, 0, 0]);
        // const right = add(position, [20, 0, 0]);

        const isVertical = position[1] !== left[1];

        return <>
          {/*<Line start={add(left, [-40, 0, 0])} end={add(left, [-40, 60, 0])} scale={scale} />*/}

          {/*<Vertex position={add(left, [-40, 0, 0])} color="#1C2127" />*/}
          {/*<Vertex position={add(left, [-40, 20, 0])} color="#1C2127" />*/}
          {/*<Vertex position={add(left, [0, 20, 0])} color="#1C2127" />*/}
          {/*<Vertex position={add(left, [-40, 60, 0])} color="#1C2127" />*/}

          {/*<Continuation color="orange" position={add(left, [-40, 0, 0])} />*/}
          {/*<Continuation color="red" position={add(left, [-40, 20, 0])} />*/}
          {/*<Continuation color="red" position={add(left, [0, 20, 0])} />*/}
          {/*<Continuation color="orange" position={add(left, [-40, 60, 0])} />*/}

          {/*<RenderedRay reference={vertex.initial.as_reference()} position={add(left, [-20, 20, 0])} />*/}
          <RenderedRay reference={vertex.initial.as_reference()} position={left} color={color} />

          {/* Line now starts in the center of the torus tube */}
          {/*{isVertical*/}
          {/*  ? <Line end={add(left, [0, torus.radius * (position[1] < left[1] ? -1 : 1), 0])} start={position} scale={scale} color={color} />*/}
            : <Line start={add(left, [torus.radius, 0, 0])} end={position} scale={scale} color={color} />
          {/*}*/}


          <Vertex position={position} color={color} />
          {/*<BinarySuperposition position={position} />*/}

          {/*<Line start={position} end={add(right, [-torus.radius, 0, 0])} scale={scale} color={color} />*/}
          <Line start={add(right, [-torus.radius, 0, 0])} end={position} scale={scale} color={color} />

          {/*{_.sample([true, false])*/}
          {/*  ? <BinarySuperposition position={position} />*/}
          {/*  : <BinaryValue position={position} boolean={_.sample([false, true])} />*/}
          {/*}*/}

          <group rotation={[0, 0, Math.PI / 2]}>

          </group>
          {/*{<>*/}
          {/*  <RenderedRay reference={vertex.initial.as_reference()} position={left} />*/}

          {/*  /!* Line now starts in the center of the torus tube *!/*/}
          {/*  <Line start={add(left, [torus.radius, 0, 0])} end={position} scale={scale} />*/}

          {/*  /!*<Vertex position={position} />*!/*/}
          {/*  /!*<BinarySuperposition position={position} />*!/*/}
          {/*  <Line start={position} end={add(right, [-torus.radius, 0, 0])} scale={scale} />*/}

          {/*  {_.sample([true, false])*/}
          {/*    ? <BinarySuperposition position={position} />*/}
          {/*    : <BinaryValue position={position} boolean={_.sample([false, true])} />*/}
          {/*  }*/}

          {/*  <RenderedRay reference={vertex.terminal.as_reference()} position={right} />*/}

          {/*</>}*/}

          <RenderedRay reference={vertex.terminal.as_reference()} position={right} color={color} />

          {/*<Torus*/}
          {/*  args={[15, torus.tube.width, torus.segments, torus.tube.segments]}*/}
          {/*  material-color="orange"*/}
          {/*  position={add(position, [0, 15, 0])}*/}
          {/*/>*/}
          {/*<Torus*/}
          {/*  args={[15, torus.tube.width, torus.segments, torus.tube.segments]}*/}
          {/*  material-color="orange"*/}
          {/*  position={add(position, [0, -15, 0])}*/}
          {/*/>*/}
          {/* SHOULD BE SMOOTH */}
          {/*<CatmullRomLine points={[*/}
          {/*  position,*/}
          {/*  add(position, [12.5, -12.5, 0]),*/}
          {/*  add(position, [0, -25, 0]),*/}
          {/*  add(position, [-12.5, -12.5, 0]),*/}
          {/*  position,*/}
          {/*]} color="orange" lineWidth={line.width * 1.5}/>*/}

        </>
      }
    }
  }

  const render = <Rendered/>
  vertex.any.rendered = render;
  return render;
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