import React, {useEffect, useMemo, useRef, useState} from 'react';
import {empty, empty_vertex, from_boolean, from_iterable, JS, Ray, RayType} from "./Ray";
import {VisualizationCanvas} from "./Visualization";
import {CatmullRomLine, Circle, CubicBezierLine, QuadraticBezierLine, Text, Torus} from "@react-three/drei";
import {GroupProps, useFrame, useThree,} from "@react-three/fiber";
import {useDrag} from "@use-gesture/react";
import {useSpring} from '@react-spring/three'
import {useHotkeys} from "../js/react/hooks/useHotkeys";
import JetBrainsMonoRegular from "../../lib/layout/font/fonts/JetBrainsMono/ttf/JetBrainsMono-Regular.ttf";
import {Box3, SplineCurve, TorusGeometry, Vector3, WebGLRenderTarget} from "three";
import {Option} from "../js/utils/Option";
import _ from "lodash";
import IEventListener, {mergeListeners} from "../js/react/IEventListener";
import {toJpeg, toPng} from "html-to-image";
import {Children, value} from "../../lib/typescript/React";
import {HotkeyConfig} from "@blueprintjs/core/src/hooks/hotkeys/hotkeyConfig";
import {NotImplementedError} from "./errors/errors";

export const add = (a: number[], b: number[]): [number, number, number] => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

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

const circle = { radius: 3,  color: "orange", segments: 30, }
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

export const AutoRenderedRay = (ray: Omit<Options, 'vertex'> & InterfaceOptions & {
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

  const initial: Required<InterfaceOptions> = { ..._default, position: [-20 * _default.scale, 0, 0], ...ray.initial };

  // Vertex as the origin for rotation
  const vertex: Required<InterfaceOptions> = { ..._default, position: [0, 0, 0] } //, ...ray.vertex };
  const terminal: Required<InterfaceOptions> = { ..._default, position: [20 * _default.scale, 0, 0], ...ray.terminal };


  if (length > 1) // TODO, currently rotates around each vertex individually
    return <group>{[...Array(length)]
      .map(((_, i) => <AutoRenderedRay {...ray} length={1} position={add(_default.position, [60 * i, 0, 0])} />))}</group>

  const Group = ({ children }: Children) => {
    return <group position={_default.position} rotation={vertex.rotation}>
      {children}
    </group>
  }

  return <Group>
    <SimpleRenderedRay type={RayType.INITIAL} {...initial} terminal={vertex} />
    <SimpleRenderedRay type={RayType.VERTEX} {...vertex} initial={initial} terminal={terminal} />
    <SimpleRenderedRay type={RayType.TERMINAL} {...terminal} initial={vertex} />

    <group scale={vertex.scale} position={vertex.position}>{children}</group>
  </Group>
}
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

  const _Continuation = ({ color = torus.color, ...options }: InterfaceOptions) =>
    <Torus
      args={[torus.radius, torus.tube.width, torus.segments, torus.tube.segments]}
      material-color={color}
      {...options}
    />
  const _Vertex = ({ color = circle.color, ...options }: any) =>
    <Circle
      args={[circle.radius, circle.segments]}
      material-color={color}
      {...options}
    />

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

  if (reference.is_none() || reference.force().self().is_none())
    return <></>

  const vertex = reference.force().self().force();

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
          const possible_continuations = vertex.vertex.force();

          if (!possible_continuations.as_reference().is_terminal())
            return <Continuation color="orange" position={position} />
          //
          // if (vertex.terminal.force().store.rendered)
          //   return <></>

          return <RenderedRay
            {...props}
            reference={possible_continuations.initial.force().as_reference()}
          />
        }
      }
      case RayType.TERMINAL: {
        if (vertex.vertex.is_none()) {
          return <Continuation color="orange" position={position} />
        } else {
          const possible_continuations = vertex.vertex.force();

          // if (!possible_continuations.as_reference().is_initial())
          //   return <Continuation color="orange" position={position} />
          return <></>

          // return <RenderedRay
          //   {...props}
          //   reference={possible_continuations.terminal.force().as_reference()}
          // />
        }
      }
      case RayType.REFERENCE: {
        if (vertex.is_empty()) // empty reference
          return <Continuation color={color} position={position} />

        // throw 'Not Implemented'
        return <RenderedRay {...props} reference={vertex.self().match({ Some: (ray) => ray.as_reference(), None: () => Ray.None })} />
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
        //     <RenderedRay reference={vertex.initial.force().as_reference()} position={left} />
        //
        //     {/* Line now starts in the center of the torus tube */}
        //     <Line start={add(left, [torus.radius, 0, 0])} end={position} scale={scale} />
        //     {/*<Vertex position={position} />*/}
        //     <BinarySuperposition position={position} />
        //     <Line start={position} end={add(right, [-torus.radius, 0, 0])} scale={scale} />
        //     <RenderedRay reference={vertex.terminal.force().as_reference()} position={right} />
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

          {/*<RenderedRay reference={vertex.initial.force().as_reference()} position={add(left, [-20, 20, 0])} />*/}
          <RenderedRay reference={vertex.initial.force().as_reference()} position={left} color={color} />

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
          {/*  <RenderedRay reference={vertex.initial.force().as_reference()} position={left} />*/}

          {/*  /!* Line now starts in the center of the torus tube *!/*/}
          {/*  <Line start={add(left, [torus.radius, 0, 0])} end={position} scale={scale} />*/}

          {/*  /!*<Vertex position={position} />*!/*/}
          {/*  /!*<BinarySuperposition position={position} />*!/*/}
          {/*  <Line start={position} end={add(right, [-torus.radius, 0, 0])} scale={scale} />*/}

          {/*  {_.sample([true, false])*/}
          {/*    ? <BinarySuperposition position={position} />*/}
          {/*    : <BinaryValue position={position} boolean={_.sample([false, true])} />*/}
          {/*  }*/}

          {/*  <RenderedRay reference={vertex.terminal.force().as_reference()} position={right} />*/}

          {/*</>}*/}

          <RenderedRay reference={vertex.terminal.force().as_reference()} position={right} color={color} />

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
  vertex.store.rendered = render;
  return render;
}

const InterfaceObject = ({
  scale = 1,
  ...props
}: any) => {
  const ref = useRef<any>();

  const [selection, setSelection] = useState<Ray>(
    empty_vertex().as_reference()
  );
  const [controls, setControls] = useState<Ray>(
    empty().as_reference()
  );

  const {
    gl: renderer,
    camera,
    scene,
    raycaster
  } = useThree();

  // One could abstractly realize hotkeys, or any kind of control system as a possible temporal directionality.
  const hotkeys = useHotkeys();
  hotkeys.set(
    {
      combo: "shift + d", global: true, label: "", onKeyDown: () => {
        // const link = document.createElement('a')
        // link.setAttribute('download', `canvas.png`)
        // link.setAttribute('href', renderer.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream'))
        // link.click()

        // const box = new Box3().setFromObject(ref.current);
        // const size = box.getSize(new Vector3());
        //
        // const width = Math.ceil(size.x);
        // const height = Math.ceil(size.y);
        // const width = 500;
        // const height = 500;
        //
        // const renderTarget = new WebGLRenderTarget(renderer.domElement.width, renderer.domElement.height);
        //
        // renderer.setRenderTarget(renderTarget);
        // renderer.render(scene, camera);
        // renderer.setRenderTarget(null);
        //
        // const canvasX = (0 + 1) / 2 * renderTarget.width;
        // const canvasY = (-0 + 1) / 2 * renderTarget.height;
        // // const canvasX = Math.ceil(box.min.x + 1) - Math.ceil(renderTarget.width / 2);
        // // const canvasY = Math.ceil(-box.min.y + 1) - Math.ceil(renderTarget.height / 2);
        //
        // const pixels = new Uint8Array(width * height * 4);
        // renderer.readRenderTargetPixels(renderTarget, canvasX, canvasY, width, height, pixels);
        //
        // const imageData = new ImageData(new Uint8ClampedArray(pixels), width, height);
        //
        // const image = document.createElement('canvas');
        // image.width = width;
        // image.height = height;
        // image.getContext('2d')!.putImageData(imageData, 0, 0);
        //
        // const link = document.createElement('a')
        // link.download = 'test.png';
        // link.href = image.toDataURL('test.png');
        // link.click();


        toPng(renderer.domElement, {
          cacheBust: true,
          backgroundColor: '#1C2127'
        })
          .then((dataUrl) => {
            const link = document.createElement('a')
            link.download = `${new Date().toISOString()}.png`
            link.href = dataUrl
            link.click()
          })
          .catch((err) => {
            console.log(err)
          });
      }
    }, {
      combo: "arrowright", global: true, label: "", onKeyDown: () => {
        const next = selection.force().continues_with(
          new Ray({ js: () => Option.Some("A") }).as_reference()
        );

        setSelection(next)
      }
    }
  );

  const addHotkey = (hotkey: HotkeyConfig) => {

  }

  useEffect(() => {
    console.log(selection.force().to_wolfram_language())
  }, [selection]);

  useEffect(() => {

    // const debug = {};
    // A.as_reference()
    //   .continues_with(new Ray({ js: () => Option.Some("B") }).as_reference())
    //   .continues_with(new Ray({ js: () => Option.Some("C") }).as_reference())
    //   .debug(debug)

    // console.log(debug)

    // console.log(
    //   new Ray({ js: () => Option.Some('empty')})
    //     .as_reference()
    //     .continues_with(new Ray({ js: () => Option.Some("A") }).as_reference())
    //     // .continues_with(new Ray({ js: () => Option.Some("B") }).as_reference())
    //     // .continues_with(new Ray({ js: () => Option.Some("C") }).as_reference())
    //     .to_wolfram_language()
    // )
    //
    // const A = new Ray({ js: () => Option.Some('empty')})
    //   .as_reference()
    //   .continues_with(new Ray({ js: () => Option.Some("A") }).as_reference());
    //
    // A
    //   .continues_with(new Ray({ js: () => Option.Some("B") }).as_reference())
    //   .continues_with(new Ray({ js: () => Option.Some("C") }).as_reference())

    // console.log(
    //   A.to_wolfram_language()
    // )
    // console.log(
    //   new Ray({ js: () => Option.Some('empty')})
    //     .as_reference()
    //     .continues_with(new Ray({ js: () => Option.Some("A") }).as_reference())
    //     .continues_with(new Ray({ js: () => Option.Some("B") }).as_reference())
    //     .continues_with(new Ray({ js: () => Option.Some("C") }).as_reference())
    //     .to_wolfram_language()
    // )

    // console.log(
    //   A.as_reference().to_wolfram_language()
    // )
  }, [])

  // hotkeys.set(
  //   { combo: "arrowright", global: true, label: "Refresh data", onKeyDown: () => {
  //       selected.next().match({
  //         Some: (ray) => setSelected(ray),
  //         None: () => console.log('no more')
  //       })
  //     }}, { combo: "arrowleft", global: true, label: "Refresh data", onKeyDown: () => {
  //       selected.previous().match({
  //         Some: (ray) => setSelected(ray),
  //         None: () => console.log('no more')
  //       })
  //     }});

  const [{ x, y }, api] = useSpring(() => ({ x: 0, y: 0 }))

  const [position, setPosition] = useState([0, 0, 0]);
  const [movement, setMovement] = useState([0, 0, 0]);

  const drag = useDrag(({ down, movement: [mx, my] }) => {
    api.start({ x: down ? mx : 0, y: down ? my : 0, immediate: down });

    document.body.style.cursor = down ? 'grabbing' : 'auto';

    if (down) {
      setMovement([x.get(), -y.get(), 0]);
    } else {
      setPosition([position[0] + x.get(), position[1] - y.get(), 0]);
      setMovement([0, 0, 0])
    }
  });

  useFrame(() => {
    const renderTarget = new WebGLRenderTarget(renderer.domElement.width, renderer.domElement.height);

    // From a position, retrieve a directionality which defines what is at that position.
    // const position = (position: Vector3): Extreme> => {
    //   // const ray = new Raycaster(new THREEVector3(0, 0, 0), new THREEVector3(0, 0, 1))
    //   // const intersections = ray.intersectObjects(scene.children, true);
    //   // console.log(intersections.length)
    //   // intersections.forEach(intersection => console.log(intersection.object.id))

    //   renderer.setRenderTarget(renderTarget);
    //   renderer.render(scene, camera)
    //   renderer.setRenderTarget(null)
    //
    //   const canvasX = (0 + 1) / 2 * renderTarget.width;
    //   const canvasY = (-0 + 1) / 2 * renderTarget.height;
    //
    //   const pixelBuffer = new Uint8Array(4);
    //   renderer.readRenderTargetPixels(renderTarget, canvasX, canvasY, 1, 1, pixelBuffer);
    //
    //   // Access pixel values
    //   const red = pixelBuffer[0];
    //   const green = pixelBuffer[1];
    //   const blue = pixelBuffer[2];
    //   const alpha = pixelBuffer[3];
    //
    //   const pos = position([0, 0, 0]);
  });

  const currentPosition = add(position, movement);

  return (
    <group
      ref={ref}
      {...drag()}
      scale={scale}
      position={currentPosition}

      {...props}
    >
      <RenderedRay reference={selection} scale={scale} />
      {/*<group position={[0, -80, 0]}>*/}
      {/*  <Text color="white" font={JetBrainsMonoRegular} anchorX="center" anchorY="middle" scale={8.0}>*/}
      {/*    Rewriting a Binary Superposition to a specific value*/}

      {/*  </Text>*/}
      {/*</group>*/}
    </group>
  )
}

class InterfaceObjec {


  // position = (): Vector3 => {}
  //
  // pixels = (): Vector3 => {}

  /**
   * As long as the setup cannot itself render objects and have access to that level of the stack, it will merely be an inaccessible translation layer between the two.
   */
  render = () => {
    // Translates to ThreeJS (
  }

  /**
   * - ThreeJS layer
   * - 3D layer
   * - camera position
   *
   * Generalize these
   * - Any layer
   * - Any "camera"/observer, different rays.
   */


}

const Test2 = ({ ray, position }: { ray: Ray, position: [number, number, number] }) => {
  const circle = {
    radius: 3,
    color: "orange",
    segments: 30
  }
  const torus = {
    // Radius of the torus, from the center of the torus to the center of the tube. Default is 1.
    radius: 3,
    color: "orange",
    tube: {
      width: 1,
      segments: 200
    },
    segments: 200,
  }

  if (ray.is_terminal() || ray.is_initial()) {
    return (
      <group>
        <Torus args={[torus.radius, torus.tube.width, torus.segments, torus.tube.segments]} material-color="orange" position={position} />
        {[...ray.traverse()].map((vertex, i) => (
          <Test2 key={i} ray={vertex.vertex.force()} position={[position[0] + (20 * (i + 1)), position[1], position[2]]} />
        ))}
      </group>
    )
  }

  return (
    <Circle position={position} material-color={circle.color} args={[circle.radius, circle.segments]} />
  )
}


// useEffect(() => {
//   for (let vertex of ray.force().traverse()) {
//     /**
//      * In this case should be a reference and thus
//      * [--|--]
//      *
//      * So in the case of [0, 1], this would be a reference to the Iterator, in the case of 1/2/3/4/5, a reference to their respective values.
//      */
//     const reference = vertex.vertex;
//
//     if (reference.is_some()) {
//       if (reference.force().vertex.is_none())
//         continue;
//
//       // This would be the Iterator, or the numbers respectively.
//       const dereferenced = reference.force().vertex.force();
//       /**
//        * Can again be any of these:
//        * [--|--]
//        * [--|  ]
//        * [  |--]
//        *
//        */
//
//       console.log('type:', reference.force().type);
//       console.log('structure at', dereferenced.js().force())
//
//       console.log('           traversing nested reference');
//       for (let nested of reference.force().traverse()) {
//         const nested_reference = nested.vertex;
//
//         if (nested_reference.is_some()) {
//           if (nested_reference.force().vertex.is_none())
//             continue;
//
//           const nested_dereferenced = nested_reference.force().vertex.force();
//
//           console.log('type:', nested_reference.force().toString());
//           console.log('structure at', nested_dereferenced.js().force())
//         }
//       }
//       console.log('           done');
//     }
//   }
// }, [])

const OrbitMinesExplorer = (
  {
    listeners = [],
  }: {
    listeners?: IEventListener<any, any>[],
  }
) => {
  // const ray = JS.Iterable([14, 15, [[6, 7, 8, 9, 10, 11], 100], 1, 2, 3, 4, 5, 16, false]).as_ray();
  // console.log(ray.force().to_wolfram_language())

  // visualization_config
  // hotkey/interface_config

  const listener: IEventListener<any> = {

  }

  return (
    <VisualizationCanvas
      style={{height: '100vh'}}

      {...mergeListeners(...listeners, listener)}
    >

      <Circle args={[1, 10]} position={[0, 0, 0]} material-color="white"/>
      <InterfaceObject scale={1.5}/>

      {/*<group scale={1.5}>*/}
      {/*  <Line start={add([20, -60, 0], [0, torus.radius, 0])} end={add([20, 193, 0], [0, -torus.radius, 0])} scale={1.5} />*/}

      {/*  <Vertex position={[20, 0, 0]} color="#1C2127" />*/}
      {/*  <Vertex position={[20, 133, 0]} color="#1C2127" />*/}
      {/*  <Continuation color="orange" position={[20, -60, 0]}/>*/}
      {/*  <Continuation color="orange" position={[20, 193, 0]}/>*/}
      {/*</group>*/}
      {/*<group position={[0, 200, 0]}>*/}
      {/*  <InterfaceObject scale={1.5}/>*/}
      {/*</group>*/}
    </VisualizationCanvas>
  );
};

export default OrbitMinesExplorer;